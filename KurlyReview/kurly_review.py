"""
마켓컬리 상품 후기 수집 + 감성 분석 (Pandas)

- 컬리 상품 페이지가 내부적으로 호출하는 후기 API(api.kurly.com/product-review)를
  requests로 호출해 후기를 cursor 방식으로 원하는 개수만큼 수집합니다.
- 컬리 후기에는 별점이 없으므로, 한국어 긍정/부정 표현 사전과 부정어(없다/않다/안 나다)
  처리를 이용한 규칙 기반 감성 분석으로 긍정·부정·중립을 분류합니다.

실행: python kurly_review.py  (또는 python kurly_review_gui.py) → PyQt6 GUI 앱이 열립니다.
"""

import re
import time
from collections import Counter

import pandas as pd
import requests

API_URL = "https://api.kurly.com/product-review/v4/contents-products/{no}/reviews"
HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"),
    "Referer": "https://www.kurly.com/",
    "Accept": "application/json",
}
SORT_TYPES = {"추천순": "RECOMMEND", "최신순": "RECENTLY"}
PAGE_SIZE = 50  # API 한 번 호출당 최대 후기 수

# ── 감성 사전: (표시용 키워드, 정규식) ─────────────────────
POSITIVE = [
    ("맛있다", r"맛있|맛나|존맛|JMT"),
    ("좋다", r"조아|조와|좋(?:아|았|네|고|은|습|다|더|구|죠|당|음|지|진)"),
    ("만족", r"만족"),
    ("신선", r"신선|싱싱"),
    ("탱글", r"탱글|탱탱|쫄깃|쫀득"),
    ("최고", r"최고|짱|대박|굿|훌륭|완벽"),
    ("추천", r"(?<!비)추천|강추"),
    ("재구매", r"재구매|재주문|(?:자주|계속|항상|늘)\s?(?:주문|구매|구입|사용|사먹)|또\s?(?:살|구매|주문)|정기적으로|쟁여|떨어지면"),
    ("편리", r"편하|편해|편리|간편"),
    ("크다", r"커서|커요|크고|크네|크기[도가]?\s?(?:크|큼|적당|넉넉|좋)|큼직|큼지막|실[하한해]|튼실|알차|통통|듬뿍"),
    ("가성비", r"가성비|저렴|합리적"),
    ("괜찮다", r"괜찮"),
    ("깔끔", r"깔끔|깨끗"),
    ("부드럽다", r"부드럽|촉촉|야들"),
    ("고소", r"고소|달큰|달달|감칠|고급"),
    ("유용", r"유용|활용도|활용하기|든든"),
    ("마음에 듦", r"맘에\s?들|마음에\s?들|애용|믿고|감사|잘\s?(?:먹|받|쓰|쓰고|사용)"),
]
NEGATIVE = [
    ("비리다", r"비린|비리|비림"),
    ("냄새", r"냄새|잡내|쿰쿰"),
    ("별로", r"별로|그닥|그다지|글쎄|애매|비추"),
    ("실망", r"실망|최악|불만|후회"),
    ("아쉽다", r"아쉽|아쉬"),
    ("작다", r"작아|작고|작네|작은|작더|작았|자잘|잘[아잖]"),
    ("식감 나쁨", r"질기|질겨|퍽퍽|물컹|흐물|푸석|딱딱|눅눅|흐늘"),
    ("맛없다", r"맛없|맛이\s?없|싱겁|밍밍|짜(?:요|고|서|네|다|더라)"),
    ("비싸다", r"비싸|비쌈|가격이\s?올"),
    ("품질 문제", r"(?<!상)상(?:했|한)|변질|이물|파손|터져|녹아|녹았|해동되어|껍질이\s?남|내장이\s?남|덜\s?손질"),
    ("환불/반품", r"환불|반품|교환"),
    ("양 부족", r"양이\s?(?:적|줄)|부족|적어요|줄었"),
]
# 키워드 뒤에 오면 의미가 뒤집히는 부정 표현
# - 부정 키워드: "비린내 없어요", "냄새가 전혀 안 나요" → 넓은 범위에서 확인
# - 긍정 키워드: "좋지 않아요", "맛있진 않네요" → 바로 뒤만 확인 ("맛있어서 남김없이"는 그대로 긍정)
NEG_FLIP_AFTER = re.compile(r"^[^.,!?\n]{0,8}?(?:없|안\s?나|않|아니|아닙|안\s?느껴|못\s?느끼|전혀)")
POS_FLIP_AFTER = re.compile(r"^(?:.{0,2}?[지진])?\s?(?:않|못)")
FLIP_BEFORE = re.compile(r"(?:안|못)\s?$")

_POS = [(word, re.compile(p)) for word, p in POSITIVE]
_NEG = [(word, re.compile(p)) for word, p in NEGATIVE]


def parse_goods_no(text: str) -> str:
    """상품 URL(.../goods/5029524?...) 또는 숫자에서 상품번호를 추출합니다."""
    m = re.search(r"goods/(\d+)", text) or re.fullmatch(r"\s*(\d+)\s*", text)
    if not m:
        raise ValueError("상품 URL 또는 상품번호를 확인해 주세요.\n예) https://www.kurly.com/goods/5029524")
    return m.group(1)


def fetch_reviews(goods_no: str, limit: int = 100, sort: str = "RECOMMEND",
                  progress=None) -> list[dict]:
    """후기를 limit개까지 수집합니다. progress(현재개수, 목표개수) 콜백을 지원합니다."""
    url = API_URL.format(no=goods_no)
    reviews, after = [], None
    while len(reviews) < limit:
        params = {"sortType": sort, "size": min(PAGE_SIZE, limit - len(reviews)), "onlyImage": "false"}
        if after:
            params["after"] = after
        res = requests.get(url, params=params, headers=HEADERS, timeout=10)
        res.raise_for_status()
        body = res.json()
        if not body.get("success"):
            raise RuntimeError(body.get("message") or "후기 API 호출에 실패했습니다.")
        batch = body["data"]["reviews"]
        reviews.extend(batch)
        if progress:
            progress(min(len(reviews), limit), limit)
        after = (body["data"].get("nextCursor") or {}).get("after")
        if not batch or not after:
            break  # 더 이상 후기가 없음
        time.sleep(0.3)  # 서버 부담을 줄이기 위한 간격
    return reviews[:limit]


def _find_terms(text: str, table, flip_after) -> tuple[list[str], list[str]]:
    """사전 키워드를 찾아 (그대로 일치한 키워드, 부정어로 뒤집힌 키워드)로 나눕니다."""
    kept, flipped = [], []
    for word, pattern in table:
        for m in pattern.finditer(text):
            negated = (flip_after.match(text[m.end():m.end() + 12])
                       or FLIP_BEFORE.search(text[max(0, m.start() - 3):m.start()]))
            (flipped if negated else kept).append(word)
    return kept, flipped


def analyze_sentiment(text: str) -> dict:
    """후기 한 건의 긍정/부정 점수와 라벨을 계산합니다."""
    pos_kept, pos_flipped = _find_terms(text, _POS, POS_FLIP_AFTER)  # "좋지 않아요" → 부정
    neg_kept, neg_flipped = _find_terms(text, _NEG, NEG_FLIP_AFTER)  # "비린내 없어요" → 긍정
    pos_words = pos_kept + [f"{w}(부정 없음)" for w in neg_flipped]
    neg_words = neg_kept + [f"{w}(부정됨)" for w in pos_flipped]
    score = len(pos_words) - len(neg_words)
    label = "긍정" if score > 0 else "부정" if score < 0 else "중립"
    return {"긍정점수": len(pos_words), "부정점수": len(neg_words), "감성점수": score,
            "감성": label, "긍정키워드": ", ".join(pos_words), "부정키워드": ", ".join(neg_words)}


def build_dataframe(reviews: list[dict]) -> pd.DataFrame:
    """수집한 후기 JSON을 정리하고 감성 분석 결과를 붙인 DataFrame을 만듭니다."""
    df = pd.DataFrame([{
        "후기번호": r.get("no"),
        "작성일": r.get("registeredAt"),
        "작성자": r.get("ownerName"),
        "등급": r.get("ownerGrade"),
        "옵션": r.get("dealProductName"),
        "도움돼요": r.get("likeCount", 0),
        "내용": (r.get("contents") or "").strip(),
    } for r in reviews])
    if df.empty:
        return df
    df["작성일"] = pd.to_datetime(df["작성일"], errors="coerce")
    df["글자수"] = df["내용"].str.len()
    sentiment = df["내용"].apply(analyze_sentiment).apply(pd.Series)
    return pd.concat([df, sentiment], axis=1)


def summarize(df: pd.DataFrame) -> dict:
    """감성 비율, 키워드 빈도 등 요약 통계를 계산합니다."""
    counts = df["감성"].value_counts().reindex(["긍정", "부정", "중립"], fill_value=0)

    def top_words(col, n=8):
        words = df[col].str.split(", ").explode()
        return Counter(w for w in words if w).most_common(n)

    return {
        "total": len(df),
        "counts": counts,
        "ratio": (counts / max(len(df), 1) * 100).round(1),
        "pos_words": top_words("긍정키워드"),
        "neg_words": top_words("부정키워드"),
        "avg_len": df.groupby("감성")["글자수"].mean().round(0),
        "period": (df["작성일"].min(), df["작성일"].max()),
    }


if __name__ == "__main__":
    # 이 파일을 직접 실행해도 PyQt6 GUI 앱이 열립니다.
    from kurly_review_gui import main
    main()
