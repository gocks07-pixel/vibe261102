"""
네이버 뉴스 검색 결과 크롤러 (requests + BeautifulSoup4)

- 검색어(기본: 반도체)로 네이버 뉴스 검색 결과를 가져와
  언론사, 제목, 요약, 작성 시각, 링크를 수집합니다.
- '네이버뉴스' 링크(n.news.naver.com)가 있는 기사는 본문 전체와
  정확한 작성일시도 가져옵니다.
- 결과는 CSV(utf-8-sig, 엑셀에서 한글 깨짐 없음)와 엑셀(.xlsx) 파일로 저장합니다.

참고
- 네이버 검색 페이지의 CSS 클래스명은 난독화되어 자주 바뀌므로,
  상대적으로 안정적인 data-heatmap-target 속성을 기준으로 요소를 찾습니다.
- 통합검색(where=nexearch)에는 뉴스가 3건 정도만 노출되므로 뉴스 탭(where=news)을 사용합니다.
- 2페이지부터는 네이버가 무한 스크롤용 API(JSON 안에 HTML)로 내려주므로 그 URL을 따라갑니다.

설치: pip install requests beautifulsoup4 openpyxl
"""

import csv
import json
import re
import time

import requests
from bs4 import BeautifulSoup

SEARCH_URL = "https://search.naver.com/search.naver"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
    ),
    "Referer": "https://search.naver.com/",
}
# '31분 전', '3시간 전', '2일 전', '2026.11.01.' 형태의 작성 시각
DATE_PATTERN = re.compile(r"^(\d+\s*(분|시간|일|주)\s*전|\d{4}\.\d{1,2}\.\d{1,2}\.?)$")
# 1페이지 HTML 안에 들어 있는 '더보기(무한 스크롤)' API 주소
MORE_URL_PATTERN = re.compile(r'"url":\s*("https:\\/\\/s\.search\.naver\.com\\/p\\/newssearch[^"]+")')
TITLE_SELECTOR = 'a[data-heatmap-target=".tit"]'


def clean_text(tag):
    """'새 창 열림' 같은 화면 낭독용 숨김 문구를 제거하고 텍스트만 반환."""
    if tag is None:
        return ""
    text = tag.get_text("").replace("새 창 열림", "")
    return re.sub(r"\s+", " ", text).strip()


def parse_news_list(html):
    """검색 결과 HTML에서 기사 목록을 추출."""
    soup = BeautifulSoup(html, "html.parser")
    articles = []

    for title_tag in soup.select(TITLE_SELECTOR):
        # 제목 링크에서 위로 올라가며 '기사 한 건'을 감싸는 블록을 찾는다
        item = title_tag
        while item.parent is not None and len(item.parent.select(TITLE_SELECTOR)) == 1:
            item = item.parent
        # 묶음 기사(관련 기사가 아래에 붙은 대표 기사)는 언론사·네이버뉴스 링크가
        # 제목 블록 바깥에 있으므로, 언론사 프로필이 포함된 블록까지 더 올라간다
        if item.select_one('a[data-heatmap-target=".nav"]') is None:
            while item.parent is not None and item.select_one('a[data-heatmap-target=".prof"]') is None:
                item = item.parent

        press = next(
            (p for p in (clean_text(a) for a in item.select('a[data-heatmap-target=".prof"]')) if p),
            "",
        )
        body_tag = item.select_one('a[data-heatmap-target=".body"]')
        naver_tag = item.select_one('a[data-heatmap-target=".nav"]')
        date = next((s for s in item.stripped_strings if DATE_PATTERN.match(s)), "")

        articles.append({
            "press": press,
            "title": clean_text(title_tag),
            "summary": clean_text(body_tag),
            "date": date,
            "url": title_tag.get("href", ""),
            "naver_url": naver_tag.get("href", "") if naver_tag else "",
        })
    return articles


def fetch_article_detail(session, naver_url):
    """네이버뉴스(n.news.naver.com) 기사 페이지에서 언론사, 작성일시, 본문을 추출."""
    resp = session.get(naver_url, timeout=10)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    press_tag = soup.select_one(".media_end_head_top_logo img")
    date_tag = soup.select_one("span.media_end_head_info_datestamp_time")
    body = soup.select_one("#dic_area") or soup.select_one("#newsct_article")

    content = ""
    if body is not None:
        # 사진 설명, 스크립트 등 본문이 아닌 요소 제거
        for tag in body.select("script, style, .img_desc, .end_photo_org em"):
            tag.decompose()
        content = re.sub(r"\s+", " ", body.get_text(" ", strip=True))

    return {
        "press": press_tag.get("alt", "") if press_tag else "",
        "datetime": date_tag.get("data-date-time", "") if date_tag else "",
        "content": content,
    }


def crawl(query, pages=1, with_body=True, delay=0.5,
          log=print, on_article=None, should_stop=lambda: False):
    """
    log         : 진행 메시지를 받을 함수 (GUI에서는 로그창 출력용)
    on_article  : 기사 1건을 수집할 때마다 호출되는 함수 (GUI 표에 바로 추가)
    should_stop : True를 반환하면 수집을 중단 (GUI의 '중지' 버튼)
    """
    session = requests.Session()
    session.headers.update(HEADERS)
    results, seen = [], set()
    next_url = None

    for page in range(pages):
        if page == 0:
            # 1페이지: 일반 검색 페이지
            resp = session.get(
                SEARCH_URL, params={"where": "news", "query": query, "ie": "utf8"}, timeout=10
            )
            resp.raise_for_status()
            html = resp.text
            m = MORE_URL_PATTERN.search(html)
            next_url = json.loads(m.group(1)) if m else None
        else:
            # 2페이지 이후: 무한 스크롤 API (JSON 응답의 html 필드에 기사 목록)
            if not next_url:
                break
            resp = session.get(next_url, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            html = "".join(c.get("html", "") for c in data.get("collection") or [])
            next_url = data.get("url")

        articles = parse_news_list(html)
        if not articles:
            break

        for art in articles:
            if should_stop():
                log("사용자 요청으로 중지했습니다.")
                return results
            if art["url"] in seen:
                continue
            seen.add(art["url"])
            art["datetime"] = ""
            art["content"] = ""
            if with_body and art["naver_url"]:
                try:
                    detail = fetch_article_detail(session, art["naver_url"])
                    art["press"] = art["press"] or detail["press"]
                    art["datetime"] = detail["datetime"]
                    art["content"] = detail["content"]
                except requests.RequestException as e:
                    log(f"  본문 수집 실패: {art['naver_url']} ({e})")
                time.sleep(delay)
            results.append(art)
            if on_article:
                on_article(art)

        log(f"{page + 1}페이지 완료 - 누적 {len(results)}건")
        time.sleep(delay)

    return results


# category(분야)는 GUI에서 자동 분류해 채우는 값 (콘솔 실행 시에는 빈 칸)
FIELDS = ["category", "press", "title", "date", "datetime", "summary", "content", "url", "naver_url"]
# 엑셀 저장 시 사용할 한글 머리글과 열 너비
EXCEL_COLUMNS = {
    "category": ("분야", 11),
    "press": ("언론사", 14),
    "title": ("제목", 60),
    "date": ("표시 시각", 12),
    "datetime": ("작성일시", 20),
    "summary": ("요약", 60),
    "content": ("본문", 80),
    "url": ("원문 링크", 40),
    "naver_url": ("네이버뉴스 링크", 40),
}
EXCEL_CELL_LIMIT = 32767  # 엑셀 셀 하나에 들어가는 최대 글자 수


def save_csv(rows, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def save_excel(rows, path, sheet_title="뉴스"):
    """수집 결과를 엑셀(.xlsx) 파일로 저장. (pip install openpyxl)"""
    from openpyxl import Workbook
    from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    wb = Workbook()
    ws = wb.active
    # 시트 이름에는 31자 제한과 사용할 수 없는 문자가 있음
    ws.title = re.sub(r"[\\/*?:\[\]]", "", sheet_title)[:31] or "뉴스"

    ws.append([EXCEL_COLUMNS[f][0] for f in FIELDS])
    for cell in ws[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="03C75A")
        cell.alignment = Alignment(horizontal="center", vertical="center")

    for row in rows:
        values = []
        for f in FIELDS:
            # 엑셀이 허용하지 않는 제어문자 제거, 셀 글자 수 제한 맞추기
            value = ILLEGAL_CHARACTERS_RE.sub("", str(row.get(f, "")))
            values.append(value[:EXCEL_CELL_LIMIT])
        ws.append(values)

        # 링크 열은 클릭하면 열리도록 하이퍼링크로 설정
        for f in ("url", "naver_url"):
            cell = ws.cell(row=ws.max_row, column=FIELDS.index(f) + 1)
            if cell.value:
                cell.hyperlink = cell.value
                cell.style = "Hyperlink"

    for i, f in enumerate(FIELDS, 1):
        ws.column_dimensions[get_column_letter(i)].width = EXCEL_COLUMNS[f][1]
    ws.freeze_panes = "A2"                 # 머리글 고정
    ws.auto_filter.ref = ws.dimensions     # 머리글에 필터 버튼
    wb.save(path)


if __name__ == "__main__":
    QUERY = "반도체"
    news = crawl(QUERY, pages=3, with_body=True)

    for i, n in enumerate(news, 1):
        print(f"\n[{i}] {n['title']}")
        print(f"    {n['press']} | {n['datetime'] or n['date']}")
        print(f"    {n['url']}")
        if n["summary"]:
            print(f"    요약: {n['summary'][:80]}...")
        if n["content"]:
            print(f"    본문: {n['content'][:120]}...")

    out = f"naver_news_{QUERY}"
    save_csv(news, out + ".csv")
    save_excel(news, out + ".xlsx", sheet_title=QUERY)
    print(f"\n총 {len(news)}건 저장: {out}.csv, {out}.xlsx")
