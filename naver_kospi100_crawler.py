"""
네이버페이 증권 코스피100 크롤러 (requests)

- 코스피100 지수 현재값과 구성 종목 100개(종목코드, 종목명, 현재가, 전일비,
  등락률, 거래량, 거래대금, 시가총액)를 수집합니다.
- 결과는 CSV(utf-8-sig, 엑셀에서 한글 깨짐 없음)와 엑셀(.xlsx) 파일로 저장합니다.

참고
- https://stock.naver.com/market/stock/kr 는 Next.js 페이지라서 서버가 주는 HTML에는
  시세가 '0', '0.00%' 같은 빈 자리표시만 있고, 실제 숫자는 브라우저에서 JavaScript가
  아래 JSON API를 호출해 채웁니다. 그래서 BeautifulSoup으로 HTML을 파싱해도
  데이터가 나오지 않으므로, 페이지가 쓰는 API를 직접 호출합니다.
    - 지수 기본정보:  /api/securityFe/api/index/KPI100/basic
    - 구성 종목:      /api/securityFe/api/index/KPI100/enrollStocks?page=&pageSize=&type=list
- 예전 주소(finance.naver.com/sise/entryJongmok.naver)는 서비스가 종료되었습니다.
- 구성 종목 API는 pageSize가 최대 50이므로 페이지를 넘기며 빈 목록이 나올 때까지 가져옵니다.

설치: pip install requests openpyxl
"""

import csv

import requests

BASE_URL = "https://stock.naver.com/api/securityFe/api/index"
INDEX_CODE = "KPI100"  # 코스피200은 KPI200, 코스닥150은 KQI150
PAGE_SIZE = 50
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
    ),
    "Referer": f"https://stock.naver.com/domestic/index/{INDEX_CODE}/price",
}
# (CSV 열 이름, API 필드명)
COLUMNS = [
    ("순위", None),
    ("종목코드", "itemCode"),
    ("종목명", "stockName"),
    ("현재가", "closePriceRaw"),
    ("전일비", "compareToPreviousClosePriceRaw"),
    ("등락률(%)", "fluctuationsRatio"),
    ("거래량", "accumulatedTradingVolumeRaw"),
    ("거래대금(원)", "accumulatedTradingValueRaw"),
    ("시가총액(원)", "marketValueRaw"),
    ("기준시각", "localTradedAt"),
]


def get_json(url, params=None):
    response = requests.get(url, params=params, headers=HEADERS, timeout=10)
    response.raise_for_status()
    return response.json()


def to_number(value):
    """'219500', '-4.15' 같은 문자열을 숫자로 바꿉니다. 변환할 수 없으면 그대로 둡니다."""
    try:
        text = str(value).replace(",", "")
        return float(text) if "." in text else int(text)
    except ValueError:
        return value


def fetch_index_info(index_code=INDEX_CODE):
    data = get_json(f"{BASE_URL}/{index_code}/basic")
    return {
        "지수명": data.get("stockName"),
        "현재값": data.get("closePrice"),
        "전일비": data.get("compareToPreviousClosePrice"),
        "등락률(%)": data.get("fluctuationsRatio"),
        "장상태": data.get("marketStatus"),
        "기준시각": data.get("localTradedAt"),
    }


def fetch_constituents(index_code=INDEX_CODE):
    """구성 종목 전체를 시가총액 순으로 가져옵니다."""
    rows = []
    page = 1
    while True:
        items = get_json(
            f"{BASE_URL}/{index_code}/enrollStocks",
            params={"page": page, "pageSize": PAGE_SIZE, "type": "list"},
        )
        if not items:
            break
        for item in items:
            row = {"순위": len(rows) + 1}
            for column, field in COLUMNS[1:]:
                value = item.get(field)
                row[column] = value if field in ("itemCode", "stockName", "localTradedAt") else to_number(value)
            rows.append(row)
        if len(items) < PAGE_SIZE:
            break
        page += 1
    return rows


def save_csv(rows, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=[c for c, _ in COLUMNS])
        writer.writeheader()
        writer.writerows(rows)


def save_excel(rows, path):
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = INDEX_CODE
    ws.append([c for c, _ in COLUMNS])
    for row in rows:
        ws.append([row[c] for c, _ in COLUMNS])
    wb.save(path)


def main():
    info = fetch_index_info()
    print(f"[{info['지수명']}] {info['현재값']} ({info['전일비']}, {info['등락률(%)']}%) "
          f"- {info['장상태']} {info['기준시각']}")

    rows = fetch_constituents()
    print(f"구성 종목 {len(rows)}개 수집\n")
    for row in rows[:10]:
        print(f"{row['순위']:>3}. {row['종목명']:<12} {row['종목코드']}  "
              f"{row['현재가']:>12,}원  {row['등락률(%)']:>6}%")
    if len(rows) > 10:
        print("  ...")

    save_csv(rows, "naver_kospi100.csv")
    try:
        save_excel(rows, "naver_kospi100.xlsx")
        print("\n저장: naver_kospi100.csv, naver_kospi100.xlsx")
    except ImportError:
        print("\n저장: naver_kospi100.csv (엑셀 저장은 pip install openpyxl 필요)")


if __name__ == "__main__":
    main()
