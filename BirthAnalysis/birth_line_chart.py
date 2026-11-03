"""
대한민국 출생아수 라인 그래프 (1970~2025)

사용법:
    python birth_line_chart.py [엑셀파일경로]
"""
import sys
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter, MultipleLocator

from birth_analysis import DEFAULT_FILE, OUTPUT_DIR, load_clean

START, END = 1970, 2025

LINE = "#2a78d6"
TEXT = "#0b0b0b"
TEXT_SUB = "#52514e"
GRID = "#e4e3df"
SURFACE = "#fcfcfb"

plt.rcParams["font.family"] = "Malgun Gothic"  # 윈도우 한글 폰트
plt.rcParams["axes.unicode_minus"] = False


def plot_births(df, start=START, end=END, save_path=None):
    s = df.loc[start:end, "출생아수"].dropna().astype(float)
    if s.empty:
        raise ValueError(f"{start}~{end}년 출생아수 데이터가 없습니다.")

    missing = sorted(set(range(start, end + 1)) - set(s.index))
    if missing:
        print(f"[경고] 데이터에 없는 연도 {len(missing)}개: "
              f"{missing[0]}~{missing[-1]} 중 일부. KOSIS에서 조회기간을 "
              f"{start}~{end}로 다시 받으면 전체 구간이 그려집니다.")

    fig, ax = plt.subplots(figsize=(12, 6), facecolor=SURFACE)
    ax.set_facecolor(SURFACE)

    ax.plot(s.index, s.values, color=LINE, linewidth=2,
            marker="o" if len(s) <= 15 else None, markersize=8,
            markeredgecolor=SURFACE, markeredgewidth=2)

    # 선택적 직접 라벨: 최대, 최소, 최근
    for year, label in {s.idxmax(): "최다", s.idxmin(): "최저", s.index[-1]: "최근"}.items():
        val = s[year]
        ax.annotate(f"{year}년 {label}\n{val:,.0f}명", (year, val),
                    xytext=(0, 14 if label != "최저" else -30), textcoords="offset points",
                    ha="center", fontsize=10, color=TEXT)

    ax.set_xlim(start - 1, end + 1)
    ax.set_ylim(0, s.max() * 1.15)
    ax.xaxis.set_major_locator(MultipleLocator(5))
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v / 10_000:,.0f}만"))

    ax.grid(axis="y", color=GRID, linewidth=1)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.tick_params(colors=TEXT_SUB, length=0)

    ax.set_title(f"대한민국 연도별 출생아수 ({start}~{end})", loc="left",
                 fontsize=16, color=TEXT, pad=24, fontweight="bold")
    sub = "단위: 명 · 출처: 통계청 인구동향조사(KOSIS)"
    if missing:
        sub += f" · 데이터 보유 구간 {s.index.min()}~{s.index.max()}"
    ax.text(0, 1.02, sub, transform=ax.transAxes, fontsize=10, color=TEXT_SUB)
    ax.set_ylabel("출생아수", color=TEXT_SUB)

    fig.tight_layout()
    if save_path:
        fig.savefig(save_path, dpi=150, facecolor=SURFACE)
        print(f"[저장] {save_path}")
    return fig, ax


if __name__ == "__main__":
    file = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_FILE
    data = load_clean(file, verbose=False)
    OUTPUT_DIR.mkdir(exist_ok=True)
    plot_births(data, save_path=OUTPUT_DIR / "births_1970_2025.png")
    plt.show()
