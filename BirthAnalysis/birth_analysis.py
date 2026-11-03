"""
대한민국 출생 통계(KOSIS: 출생아수, 합계출산율, 자연증가 등) 클렌징 + 다각도 분석

사용법:
    python birth_analysis.py [엑셀파일경로]
    (경로 생략 시 data/births.xlsx 사용)
"""
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_FILE = BASE_DIR / "data" / "births.xlsx"
OUTPUT_DIR = BASE_DIR / "output"

# KOSIS 항목명 -> 분석용 짧은 컬럼명
COLUMN_MAP = {
    "출생아수": "출생아수",
    "자연증가건수": "자연증가건수",
    "조출생률": "조출생률",
    "자연증가율": "자연증가율",
    "합계출산율": "합계출산율",
    "출생성비": "출생성비",
}

# 값 검증용 허용 범위 (벗어나면 이상치로 표시)
VALID_RANGE = {
    "출생아수": (0, 1_500_000),
    "조출생률": (0, 50),
    "합계출산율": (0, 10),
    "출생성비": (90, 130),
}

REPLACEMENT_TFR = 2.1  # 인구 대체 수준 합계출산율


# ---------------------------------------------------------------------------
# 1. 데이터 클렌징
# ---------------------------------------------------------------------------
def load_clean(path=DEFAULT_FILE, verbose=True):
    """KOSIS 가로형(항목 x 연도) 엑셀을 연도 인덱스의 tidy DataFrame 으로 변환"""
    log = (lambda *a: print(*a)) if verbose else (lambda *a: None)

    raw = pd.read_excel(path, sheet_name=0, header=None)
    log(f"[원본] {raw.shape[0]}행 x {raw.shape[1]}열")

    # 1) 완전히 빈 행/열 제거
    raw = raw.dropna(how="all").dropna(axis=1, how="all").reset_index(drop=True)

    # 2) 첫 행 = 헤더(기본항목별, 연도...), 첫 열 = 항목명
    header = raw.iloc[0].tolist()
    body = raw.iloc[1:].copy()
    body.columns = ["항목"] + header[1:]

    # 3) 항목명 정리: 공백 제거, '(단위)' 분리
    body["항목"] = body["항목"].astype(str).str.strip()
    units = {}
    names = []
    for item in body["항목"]:
        m = re.match(r"^(.*?)\s*\((.*?)\)\s*$", item)
        name, unit = (m.group(1), m.group(2)) if m else (item, "")
        name = COLUMN_MAP.get(name.replace(" ", ""), name.replace(" ", ""))
        names.append(name)
        units[name] = unit
    body["항목"] = names

    # 4) 연도 컬럼 정리: 2020.0 / '2025 p)' 등 → int, 잠정치 표시는 따로 보관
    year_cols, provisional = {}, []
    for c in body.columns[1:]:
        s = str(c)
        m = re.search(r"(\d{4})", s)
        if not m:
            continue
        year = int(m.group(1))
        year_cols[c] = year
        if re.search(r"p\)|잠정", s, re.I):
            provisional.append(year)
    body = body[["항목"] + list(year_cols)].rename(columns=year_cols)

    # 5) 항목 x 연도 → 연도 x 항목 (전치)
    df = body.set_index("항목").T
    df.index.name = "연도"
    df.columns.name = None

    # 6) 값 정리: 콤마/공백 제거, '-', '…', 'x' 등 결측 기호 → NaN, 숫자 변환
    df = df.apply(
        lambda col: pd.to_numeric(
            col.astype(str)
            .str.replace(",", "", regex=False)
            .str.strip()
            .replace({"-": np.nan, "…": np.nan, "...": np.nan, "x": np.nan, "nan": np.nan}),
            errors="coerce",
        )
    )

    # 7) 중복 연도 제거, 정렬, 정수형 지정
    dup = df.index.duplicated(keep="last")
    if dup.any():
        log(f"[클렌징] 중복 연도 {df.index[dup].tolist()} 제거")
    df = df[~dup].sort_index()
    df.index = df.index.astype(int)
    for c in ("출생아수", "자연증가건수"):
        if c in df:
            df[c] = df[c].round().astype("Int64")

    # 8) 범위 검증 → 이상치는 NaN 처리
    for col, (lo, hi) in VALID_RANGE.items():
        if col in df:
            bad = df[col].notna() & ~df[col].between(lo, hi)
            if bad.any():
                log(f"[클렌징] {col} 이상치 {df.index[bad].tolist()} → NaN")
                df.loc[bad, col] = np.nan

    # 9) 연도 연속성 점검
    full = range(df.index.min(), df.index.max() + 1)
    missing_years = sorted(set(full) - set(df.index))

    df.attrs["units"] = units
    df.attrs["provisional"] = provisional
    log(f"[정제] {len(df)}개 연도({df.index.min()}~{df.index.max()}) x {df.shape[1]}개 항목")
    log(f"[정제] 결측치 수: {int(df.isna().sum().sum())}, 누락 연도: {missing_years or '없음'}")
    if provisional:
        log(f"[정제] 잠정치 연도: {provisional}")
    return df


# ---------------------------------------------------------------------------
# 2. 다각도 분석
# ---------------------------------------------------------------------------
def add_derived(df):
    """파생 지표 추가"""
    out = df.copy()
    births = out["출생아수"].astype(float)

    out["출생아_증감"] = births.diff()
    out["출생아_증감률(%)"] = births.pct_change() * 100
    out["합계출산율_증감"] = out["합계출산율"].diff()

    # 자연증가 = 출생 - 사망 → 사망자수 역산
    if "자연증가건수" in out:
        out["사망자수(추정)"] = births - out["자연증가건수"].astype(float)
        out["출생/사망 비율"] = births / out["사망자수(추정)"]

    # 조출생률(인구 천명당 출생) → 총인구 역산
    if "조출생률" in out:
        out["총인구(추정,만명)"] = births / out["조출생률"] * 1000 / 10_000

    # 출생성비(여아 100명당 남아) → 남아/여아 수 추정
    if "출생성비" in out:
        r = out["출생성비"]
        out["남아(추정)"] = (births * r / (100 + r)).round()
        out["여아(추정)"] = births - out["남아(추정)"]

    # 대체출산율 대비 수준
    out["대체수준 대비(%)"] = out["합계출산율"] / REPLACEMENT_TFR * 100

    # 기간이 길 때 쓸모 있는 3년 이동평균
    out["출생아_3년이동평균"] = births.rolling(3, min_periods=1).mean()
    return out


def cagr(first, last, years):
    return ((last / first) ** (1 / years) - 1) * 100 if years > 0 and first > 0 else np.nan


def analyze(df):
    d = add_derived(df)
    b = d["출생아수"].astype(float)
    y0, y1 = d.index.min(), d.index.max()
    line = "=" * 64

    print(f"\n{line}\n  대한민국 출생 통계 분석 ({y0}~{y1})\n{line}")

    # (1) 기술통계
    print("\n[1] 기술통계")
    print(df.astype(float).describe().T.round(3).to_string())

    # (2) 연도별 추이 + 증감
    print("\n[2] 연도별 출생아수·합계출산율 증감")
    cols = ["출생아수", "출생아_증감", "출생아_증감률(%)", "합계출산율", "합계출산율_증감"]
    print(d[cols].round(3).to_string())

    # (3) 기간 요약
    print("\n[3] 기간 요약")
    print(f"  · 출생아수 {y0}년 {b.iloc[0]:,.0f}명 → {y1}년 {b.iloc[-1]:,.0f}명 "
          f"({(b.iloc[-1] / b.iloc[0] - 1) * 100:+.1f}%)")
    print(f"  · 연평균 증감률(CAGR): {cagr(b.iloc[0], b.iloc[-1], y1 - y0):+.2f}%")
    print(f"  · 최다 출생: {b.idxmax()}년 {b.max():,.0f}명 / 최저 출생: {b.idxmin()}년 {b.min():,.0f}명")
    tfr = d["합계출산율"]
    print(f"  · 합계출산율 최저: {tfr.idxmin()}년 {tfr.min():.3f}명, 최근: {tfr.iloc[-1]:.3f}명 "
          f"(대체수준 {REPLACEMENT_TFR}의 {d['대체수준 대비(%)'].iloc[-1]:.1f}%)")

    # (4) 추세 전환(저점 이후 반등) 분석
    print("\n[4] 추세 전환 분석")
    low_year = b.idxmin()
    if low_year < y1:
        after = b.loc[low_year:]
        print(f"  · {low_year}년 저점 이후 {y1 - low_year}년 연속 반등 여부: "
              f"{'예' if after.diff().dropna().gt(0).all() else '아니오'}")
        print(f"  · 저점 대비 {y1}년 회복: {after.iloc[-1] - after.iloc[0]:+,.0f}명 "
              f"({(after.iloc[-1] / after.iloc[0] - 1) * 100:+.1f}%)")
    else:
        print(f"  · 마지막 연도({y1})가 최저점 — 반등 없음")
    dec_streak = (b.diff() < 0).astype(int)
    longest = dec_streak.groupby((dec_streak != dec_streak.shift()).cumsum()).sum().max()
    print(f"  · 최장 연속 감소 기간: {longest}년")

    # (5) 인구 자연감소
    if "자연증가건수" in d:
        print("\n[5] 인구 자연증감 (출생 - 사망)")
        print(d[["출생아수", "사망자수(추정)", "자연증가건수", "출생/사망 비율"]]
              .round(3).to_string())
        neg = d.index[d["자연증가건수"] < 0].tolist()
        if neg:
            print(f"  · 자연감소 연도: {neg[0]}~{neg[-1]} ({len(neg)}개 연도), "
                  f"누적 자연감소 {d.loc[neg, '자연증가건수'].sum():,.0f}명")

    # (6) 성비
    if "출생성비" in d:
        print("\n[6] 출생성비 (여아 100명당 남아, 자연 성비 103~107)")
        print(d[["출생성비", "남아(추정)", "여아(추정)"]].to_string())
        out_of = d.index[~d["출생성비"].between(103, 107)].tolist()
        print(f"  · 정상범위 벗어난 연도: {out_of or '없음'}")

    # (7) 추정 총인구
    if "총인구(추정,만명)" in d:
        print("\n[7] 조출생률로 역산한 총인구(만 명, 조출생률 반올림 오차 있음)")
        print(d["총인구(추정,만명)"].round(0).to_string())

    # (8) 상관관계
    print("\n[8] 지표 간 상관계수 (Pearson)")
    print(df.astype(float).corr().round(3).to_string())

    # (9) 연대별 평균 (데이터 기간이 길 때)
    decade = (d.index // 10) * 10
    if decade.nunique() > 1:
        print("\n[9] 연대별 평균")
        print(d.groupby(decade)[["출생아수", "합계출산율"]].mean().round(3).to_string())

    return d


def save(df, derived):
    OUTPUT_DIR.mkdir(exist_ok=True)
    df.to_csv(OUTPUT_DIR / "births_clean.csv", encoding="utf-8-sig")
    with pd.ExcelWriter(OUTPUT_DIR / "births_analysis.xlsx") as w:
        df.to_excel(w, sheet_name="정제데이터")
        derived.round(4).to_excel(w, sheet_name="파생지표")
        df.astype(float).describe().T.to_excel(w, sheet_name="기술통계")
        df.astype(float).corr().to_excel(w, sheet_name="상관계수")
    print(f"\n[저장] {OUTPUT_DIR / 'births_clean.csv'}")
    print(f"[저장] {OUTPUT_DIR / 'births_analysis.xlsx'}")


if __name__ == "__main__":
    pd.set_option("display.width", 200)
    pd.set_option("display.max_columns", 20)
    pd.set_option("display.unicode.east_asian_width", True)
    file = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_FILE
    data = load_clean(file)
    save(data, analyze(data))
