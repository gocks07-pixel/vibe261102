"""S&P 500 과거 데이터 클랜징 및 다각도 분석.

실행: python sp500_analysis.py
결과: sp500_output/ 폴더에 정제 데이터(CSV)와 그래프(PNG) 저장
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

SRC = Path(__file__).parent / "S&P 500 과거 데이터.csv"
OUT = Path(__file__).parent / "sp500_output"
OUT.mkdir(exist_ok=True)

plt.rcParams["font.family"] = "Malgun Gothic"  # 한글 폰트 (Windows)
plt.rcParams["axes.unicode_minus"] = False
pd.set_option("display.width", 120)


# ---------------------------------------------------------------------------
# 1. 데이터 클랜징
# ---------------------------------------------------------------------------
def load_and_clean(path: Path) -> pd.DataFrame:
    raw = pd.read_csv(path, encoding="utf-8-sig", dtype=str)
    print(f"[원본] {raw.shape[0]}행 x {raw.shape[1]}열")
    print("[원본 결측치]\n", raw.isna().sum(), sep="")

    df = raw.rename(columns={
        "날짜": "Date", "종가": "Close", "시가": "Open", "고가": "High",
        "저가": "Low", "거래량": "Volume", "변동 %": "ChangePct",
    })

    # 날짜: "2019- 11- 14" 처럼 공백이 섞인 형식 → 공백 제거 후 datetime 변환
    df["Date"] = pd.to_datetime(df["Date"].str.replace(" ", ""), format="%Y-%m-%d", errors="coerce")

    # 가격: 천 단위 콤마 제거 후 float 변환
    for col in ["Close", "Open", "High", "Low"]:
        df[col] = pd.to_numeric(df[col].str.replace(",", ""), errors="coerce")

    # 변동률: "%" 제거 후 float 변환
    df["ChangePct"] = pd.to_numeric(df["ChangePct"].str.replace("%", ""), errors="coerce")

    # 거래량: 전 행이 비어 있어 분석에 쓸 수 없으므로 제거
    if df["Volume"].isna().all():
        df = df.drop(columns="Volume")
        print("[클랜징] 거래량 컬럼이 전부 비어 있어 제거")

    before = len(df)
    df = df.dropna(subset=["Date", "Close"])
    df = df.drop_duplicates(subset="Date")
    print(f"[클랜징] 날짜/종가 결측·중복 제거: {before - len(df)}행")

    # 논리 오류 검사: 고가 < 저가, 종가/시가가 고가~저가 범위를 벗어나는 경우
    bad = (df["High"] < df["Low"]) | ~df["Close"].between(df["Low"], df["High"]) \
        | ~df["Open"].between(df["Low"], df["High"])
    print(f"[클랜징] 가격 범위 이상 행: {bad.sum()}행 → 고가/저가를 시가·종가 포함 범위로 보정")
    if bad.any():
        print(df[bad].head())
    df["High"] = df[["High", "Open", "Close"]].max(axis=1)
    df["Low"] = df[["Low", "Open", "Close"]].min(axis=1)

    # 최신 → 과거 순으로 되어 있으므로 시간 순 정렬 후 날짜 인덱스로 설정
    df = df.sort_values("Date").set_index("Date")

    # 원본 변동률과 종가로 직접 계산한 변동률 비교 (데이터 일관성 확인)
    calc = df["Close"].pct_change() * 100
    diff = (calc - df["ChangePct"]).abs()
    print(f"[검증] 원본 변동률 vs 계산 변동률 오차 0.05%p 초과: {(diff > 0.05).sum()}행")

    print(f"[정제 후] {df.shape[0]}행, 기간 {df.index.min():%Y-%m-%d} ~ {df.index.max():%Y-%m-%d}")
    return df


# ---------------------------------------------------------------------------
# 2. 다각도 분석
# ---------------------------------------------------------------------------
def analyze(df: pd.DataFrame) -> None:
    close = df["Close"]
    ret = close.pct_change().dropna()

    print("\n=== 기술 통계 (가격) ===")
    print(df[["Open", "High", "Low", "Close"]].describe().round(2))

    print("\n=== 기간 전체 성과 ===")
    years = (close.index[-1] - close.index[0]).days / 365.25
    total = close.iloc[-1] / close.iloc[0] - 1
    cagr = (1 + total) ** (1 / years) - 1
    vol = ret.std() * np.sqrt(252)
    print(f"누적 수익률: {total:.2%} | 연평균(CAGR): {cagr:.2%} | 연환산 변동성: {vol:.2%}")
    print(f"최고 종가: {close.max():,.2f} ({close.idxmax():%Y-%m-%d}) | "
          f"최저 종가: {close.min():,.2f} ({close.idxmin():%Y-%m-%d})")

    # 최대 낙폭(MDD)
    drawdown = close / close.cummax() - 1
    trough = drawdown.idxmin()
    peak = close[:trough].idxmax()
    print(f"최대 낙폭(MDD): {drawdown.min():.2%} (고점 {peak:%Y-%m-%d} → 저점 {trough:%Y-%m-%d})")

    print("\n=== 연도별 수익률 ===")
    yearly = close.resample("YE").last()
    yearly_ret = yearly.pct_change()
    yearly_ret.iloc[0] = yearly.iloc[0] / close.iloc[0] - 1  # 첫 해는 첫 거래일 대비
    yearly_vol = ret.groupby(ret.index.year).std() * np.sqrt(252)
    year_tbl = pd.DataFrame({
        "연말종가": yearly.values.round(2),
        "수익률(%)": (yearly_ret.values * 100).round(2),
        "변동성(%)": (yearly_vol.values * 100).round(2),
    }, index=yearly.index.year)
    print(year_tbl)
    print(f"상승한 해: {(yearly_ret > 0).sum()} / {len(yearly_ret)}")

    print("\n=== 일간 수익률 상·하위 5일 ===")
    print("상위:\n", (ret.nlargest(5) * 100).round(2).to_string(), sep="")
    print("하위:\n", (ret.nsmallest(5) * 100).round(2).to_string(), sep="")

    print("\n=== 월별 계절성 (월 평균 수익률 %) ===")
    monthly_ret = close.resample("ME").last().pct_change().dropna()
    print((monthly_ret.groupby(monthly_ret.index.month).mean() * 100).round(2).to_string())

    print("\n=== 요일별 평균 일간 수익률 (%) ===")
    days = ["월", "화", "수", "목", "금"]
    by_dow = ret.groupby(ret.index.dayofweek).agg(["mean", "count"])
    by_dow.index = [days[i] for i in by_dow.index]
    by_dow["mean"] = (by_dow["mean"] * 100).round(3)
    print(by_dow)

    print("\n=== 일중 변동폭 ((고가-저가)/시가, %) 연도별 평균 ===")
    intraday = (df["High"] - df["Low"]) / df["Open"] * 100
    print(intraday.groupby(intraday.index.year).mean().round(2).to_string())

    year_tbl.to_csv(OUT / "yearly_summary.csv", encoding="utf-8-sig")
    plot_analysis(close, ret, drawdown, yearly_ret)


def plot_analysis(close, ret, drawdown, yearly_ret) -> None:
    fig, axes = plt.subplots(2, 2, figsize=(15, 9))

    ax = axes[0, 0]
    ax.plot(close, label="종가", lw=1)
    ax.plot(close.rolling(50).mean(), label="50일 이동평균", lw=1)
    ax.plot(close.rolling(200).mean(), label="200일 이동평균", lw=1)
    ax.set_title("종가와 이동평균")
    ax.legend()

    ax = axes[0, 1]
    ax.fill_between(drawdown.index, drawdown * 100, 0, color="tab:red", alpha=0.4)
    ax.set_title("고점 대비 낙폭 (%)")

    ax = axes[1, 0]
    colors = ["tab:green" if v > 0 else "tab:red" for v in yearly_ret]
    ax.bar(yearly_ret.index.year, yearly_ret * 100, color=colors)
    ax.axhline(0, color="gray", lw=0.8)
    ax.set_xticks(yearly_ret.index.year[::2])
    ax.set_title("연도별 수익률 (%)")

    ax = axes[1, 1]
    ax.plot(ret.rolling(20).std() * np.sqrt(252) * 100, lw=1, color="tab:purple")
    ax.set_title("20일 롤링 연환산 변동성 (%)")

    for a in axes.flat:
        a.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(OUT / "analysis_dashboard.png", dpi=120)
    plt.close(fig)


# ---------------------------------------------------------------------------
# 3. 종가 라인그래프 (2000-01 ~ 2019-12)
# ---------------------------------------------------------------------------
def plot_close(df: pd.DataFrame, start="2000-01", end="2019-12") -> None:
    data = df.loc[start:end, "Close"]

    fig, ax = plt.subplots(figsize=(14, 6))
    ax.plot(data.index, data.values, color="tab:blue", lw=1.2)
    ax.set_title(f"S&P 500 종가 추이 ({start} ~ {end})", fontsize=15)
    ax.set_xlabel("날짜")
    ax.set_ylabel("종가 (USD)")
    ax.grid(alpha=0.3)
    ax.set_ylim(data.min() * 0.6, data.max() * 1.05)

    # 주요 이벤트 표시
    for date, label, dy in [("2000-03-24", "닷컴 버블 정점", 25), ("2002-10-09", "닷컴 버블 저점", -30),
                            ("2007-10-09", "금융위기 전 고점", 25), ("2009-03-09", "금융위기 저점", -30)]:
        d = data.index[data.index.get_indexer([pd.Timestamp(date)], method="nearest")[0]]
        ax.annotate(label, xy=(d, data[d]), xytext=(0, dy), textcoords="offset points",
                    ha="center", fontsize=9, arrowprops=dict(arrowstyle="->", color="gray"))

    fig.tight_layout()
    fig.savefig(OUT / "close_2000_2019.png", dpi=120)
    plt.show()


if __name__ == "__main__":
    sp = load_and_clean(SRC)
    sp.to_csv(OUT / "sp500_clean.csv", encoding="utf-8-sig")
    analyze(sp)
    plot_close(sp)
