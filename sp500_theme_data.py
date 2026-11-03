"""S&P 500 AI 테마 종목 데이터 수집과 성과 지표 계산.

- THEMES: AI 관련 / AI 설비 / 데이터센터 전기 / 냉각 테마별 관련 기업 목록 (투자 추천이 아님)
- fetch_prices(): yfinance로 수정 종가(배당·분할 반영)를 받아옴
- compute_metrics(): 기간 수익률, CAGR, 변동성, MDD, 샤프지수, 베타, 상관계수 계산

설치: pip install yfinance pandas numpy
"""

import numpy as np
import pandas as pd
import yfinance as yf

BENCHMARK = "^GSPC"  # S&P 500 지수
TRADING_DAYS = 252

# 테마 -> [(티커, 기업명, 관련 사업)]
THEMES = {
    "AI 관련": [
        ("NVDA", "NVIDIA", "AI용 GPU"),
        ("AVGO", "Broadcom", "맞춤형 AI 칩, 네트워크 칩"),
        ("MSFT", "Microsoft", "Azure 클라우드, OpenAI 협력"),
        ("GOOGL", "Alphabet", "TPU, Gemini, Google Cloud"),
        ("AMD", "AMD", "GPU"),
    ],
    "AI 설비": [
        ("AMAT", "Applied Materials", "반도체 제조 장비"),
        ("LRCX", "Lam Research", "식각·증착 장비"),
        ("KLAC", "KLA", "검사·계측 장비"),
        ("ANET", "Arista Networks", "데이터센터 스위치"),
        ("DELL", "Dell Technologies", "AI 서버"),
        ("MU", "Micron", "HBM 메모리"),
    ],
    "데이터센터 전기": [
        ("CEG", "Constellation Energy", "원전 발전"),
        ("VST", "Vistra", "원전·가스 발전"),
        ("GEV", "GE Vernova", "가스터빈, 전력망 장비"),
        ("ETN", "Eaton", "배전 장비, UPS"),
        ("PWR", "Quanta Services", "송전망 건설"),
    ],
    "냉각": [
        ("TT", "Trane Technologies", "칠러, 데이터센터 공조"),
        ("CARR", "Carrier Global", "HVAC, 데이터센터 냉각"),
        ("JCI", "Johnson Controls", "건물 냉각·관리"),
        ("VRT", "Vertiv", "액체 냉각·전력 (S&P 500 편입 여부 확인 필요)"),
    ],
}

PERIODS = {"1년": "1y", "3년": "3y", "5년": "5y", "10년": "10y", "전체": "max"}

METRIC_COLUMNS = ["기간수익률(%)", "CAGR(%)", "변동성(%)", "MDD(%)", "샤프", "베타", "S&P 상관", "시작일"]


def ticker_info():
    """티커 -> (테마, 기업명, 관련 사업)."""
    return {t: (theme, name, desc) for theme, items in THEMES.items() for t, name, desc in items}


def fetch_prices(tickers, period="5y"):
    """수정 종가 DataFrame(열 = 티커, S&P 500 지수 포함)을 반환. 받지 못한 티커는 빠짐."""
    symbols = list(dict.fromkeys([*tickers, BENCHMARK]))
    # threads=True면 yfinance 내부 캐시 DB가 잠겨 일부 종목이 실패하므로 순차로 받음
    data = yf.download(symbols, period=period, auto_adjust=True, progress=False, threads=False)
    if data.empty:
        raise RuntimeError("데이터를 받지 못했습니다. 네트워크 연결을 확인하세요.")
    close = data["Close"]
    if isinstance(close, pd.Series):
        close = close.to_frame(symbols[0])
    close = close.dropna(axis=1, how="all")
    if BENCHMARK not in close:
        raise RuntimeError("S&P 500 지수 데이터를 받지 못했습니다.")
    return close


def drawdown(prices):
    return prices / prices.cummax() - 1


def cumulative(prices):
    """각 열을 첫 유효값 기준 누적 수익률(%)로 변환 (상장일이 달라도 비교 가능)."""
    return (prices / prices.apply(lambda s: s.dropna().iloc[0]) - 1) * 100


def theme_returns(prices, members):
    """테마별 동일가중 일간 수익률을 누적한 지수(시작 = 1)."""
    rets = prices.pct_change(fill_method=None)
    out = {}
    for theme, tickers in members.items():
        cols = [t for t in tickers if t in rets]
        if cols:
            out[theme] = (1 + rets[cols].mean(axis=1, skipna=True).fillna(0)).cumprod()
    return pd.DataFrame(out)


def compute_metrics(prices, risk_free=0.0):
    """열별 성과 지표 DataFrame. risk_free는 연 무위험수익률(예: 0.04)."""
    rets = prices.pct_change(fill_method=None)
    market = rets[BENCHMARK]
    rows = {}
    for col in prices:
        s = prices[col].dropna()
        r = rets[col].dropna()
        if len(s) < 2 or r.empty:
            continue
        years = (s.index[-1] - s.index[0]).days / 365.25
        total = s.iloc[-1] / s.iloc[0] - 1
        vol = r.std() * np.sqrt(TRADING_DAYS)
        ann = r.mean() * TRADING_DAYS
        m = market.loc[r.index]
        rows[col] = {
            "기간수익률(%)": total * 100,
            "CAGR(%)": ((1 + total) ** (1 / years) - 1) * 100 if years > 0 else np.nan,
            "변동성(%)": vol * 100,
            "MDD(%)": drawdown(s).min() * 100,
            "샤프": (ann - risk_free) / vol if vol else np.nan,
            "베타": r.cov(m) / m.var() if m.var() else np.nan,
            "S&P 상관": r.corr(m),
            "시작일": s.index[0].strftime("%Y-%m-%d"),
        }
    return pd.DataFrame.from_dict(rows, orient="index")[METRIC_COLUMNS]


def correlation(prices):
    return prices.pct_change(fill_method=None).corr()
