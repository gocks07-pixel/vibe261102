"""
코스피100 중 반도체 / AI / 자동차 관련 종목만 골라내는 크롤러 (requests)

- naver_kospi100_crawler.py 로 코스피100 구성 종목 100개를 가져온 뒤,
  네이버페이 증권의 '업종'과 '테마' 분류에 속한 종목만 남깁니다.
- 분야는 업종/테마 이름에 들어간 키워드로 고릅니다(CATEGORIES 참고).
  한 종목이 여러 분야에 속하면 '반도체, AI'처럼 함께 표시합니다.
- 결과는 CSV(utf-8-sig)와 엑셀(.xlsx) 파일로 저장합니다.

참고
- AI는 업종 분류에 없어서 테마로만 고릅니다.
- 'AI'가 조류독감(Avian Influenza)을 뜻하는 백신 테마가 있어서 제외 키워드로 걸러냅니다.
- 업종/테마 목록 API는 pageSize가 최대 100입니다.
    - 목록:      https://m.stock.naver.com/api/stocks/{industry|theme}
    - 소속 종목: https://m.stock.naver.com/api/stocks/{industry|theme}/{번호}

설치: pip install requests openpyxl
"""

import csv

from naver_kospi100_crawler import COLUMNS, fetch_constituents, get_json

GROUP_URL = "https://m.stock.naver.com/api/stocks"
PAGE_SIZE = 100
# 분야: {"industry": 업종 이름 키워드, "theme": 테마 이름 키워드, "exclude": 제외 키워드}
CATEGORIES = {
    "반도체": {"industry": ["반도체"], "theme": ["반도체", "HBM"], "exclude": []},
    "AI": {"industry": [], "theme": ["AI", "인공지능"], "exclude": ["백신"]},
    "자동차": {"industry": ["자동차"], "theme": ["자동차", "자율주행"], "exclude": []},
}
OUTPUT_COLUMNS = [c for c, _ in COLUMNS] + ["분야", "관련 업종/테마"]


def fetch_all(url, key):
    """페이지를 넘기며 groups/stocks 목록을 모두 가져옵니다."""
    results = []
    page = 1
    while True:
        data = get_json(url, params={"page": page, "pageSize": PAGE_SIZE})
        items = data.get(key) or []
        results.extend(items)
        if not items or len(results) >= data.get("totalCount", 0):
            break
        page += 1
    return results


def find_groups():
    """CATEGORIES 키워드에 맞는 업종/테마를 [(분야, 종류, 번호, 이름)] 으로 돌려줍니다."""
    groups = {kind: fetch_all(f"{GROUP_URL}/{kind}", "groups") for kind in ("industry", "theme")}
    matched = []
    for category, rule in CATEGORIES.items():
        for kind, groups_of_kind in groups.items():
            for group in groups_of_kind:
                name = group["name"]
                if any(k in name for k in rule[kind]) and not any(k in name for k in rule["exclude"]):
                    matched.append((category, kind, group["no"], name))
    return matched


def classify(rows):
    """코스피100 종목 중 분야에 해당하는 종목만 골라 '분야', '관련 업종/테마' 열을 붙입니다."""
    kospi100 = {row["종목코드"]: row for row in rows}
    categories = {}  # 종목코드 -> {분야}
    sources = {}     # 종목코드 -> [업종/테마 이름]

    for category, kind, no, name in find_groups():
        label = f"{'업종' if kind == 'industry' else '테마'}:{name}"
        for stock in fetch_all(f"{GROUP_URL}/{kind}/{no}", "stocks"):
            code = stock.get("itemCode")
            if code not in kospi100:
                continue
            categories.setdefault(code, set()).add(category)
            if label not in sources.setdefault(code, []):
                sources[code].append(label)

    order = list(CATEGORIES)
    filtered = []
    for code, row in kospi100.items():
        if code in categories:
            filtered.append({
                **row,
                "분야": ", ".join(c for c in order if c in categories[code]),
                "관련 업종/테마": " | ".join(sources[code]),
            })
    return filtered


def save_csv(rows, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def save_excel(rows, path):
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "전체"
    ws.append(OUTPUT_COLUMNS)
    for row in rows:
        ws.append([row[c] for c in OUTPUT_COLUMNS])
    # 분야별 시트 (여러 분야에 속한 종목은 각 시트에 모두 들어갑니다)
    for category in CATEGORIES:
        sheet = wb.create_sheet(category)
        sheet.append(OUTPUT_COLUMNS)
        for row in rows:
            if category in row["분야"].split(", "):
                sheet.append([row[c] for c in OUTPUT_COLUMNS])
    wb.save(path)


def main():
    rows = fetch_constituents()
    print(f"코스피100 구성 종목 {len(rows)}개 수집")

    filtered = classify(rows)
    for category in CATEGORIES:
        count = sum(category in row["분야"].split(", ") for row in filtered)
        print(f"  {category}: {count}개")
    print(f"반도체/AI/자동차 관련 종목 {len(filtered)}개\n")

    for row in filtered:
        print(f"{row['순위']:>3}. {row['종목명']:<12} {row['종목코드']}  "
              f"{row['현재가']:>12,}원  {row['등락률(%)']:>6}%  [{row['분야']}]")

    save_csv(filtered, "naver_kospi100_sector.csv")
    try:
        save_excel(filtered, "naver_kospi100_sector.xlsx")
        print("\n저장: naver_kospi100_sector.csv, naver_kospi100_sector.xlsx")
    except ImportError:
        print("\n저장: naver_kospi100_sector.csv (엑셀 저장은 pip install openpyxl 필요)")


if __name__ == "__main__":
    main()
