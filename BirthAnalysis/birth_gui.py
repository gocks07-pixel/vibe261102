"""대한민국 출생 통계 분석기 - KOSIS 출생아수·합계출산율·자연증가 엑셀 PyQt6 GUI

- [엑셀 열기]로 KOSIS에서 받은 '출생아수, 합계출산율, 자연증가 등' 엑셀을 고르면
  birth_analysis.py 로 클렌징한 뒤 화면에 보여줍니다. (처음에는 data/births.xlsx 를 엽니다)
- 시작·끝 연도를 바꾸면 모든 탭이 그 구간으로 다시 그려집니다. (기본 1970~2025)
- [출생아수] 연도별 출생아수 라인 그래프 (최다·최저·최근 라벨, 마우스를 올리면 값 표시)
- [합계출산율] 합계출산율과 인구 대체수준(2.1명)
- [자연증감] 출생아수·사망자수(추정)·자연증가 건수
- [정제 데이터] 클렌징 결과와 파생지표 표 / [분석 리포트] 다각도 분석 결과 텍스트
- [결과 저장]으로 정제 CSV·분석 엑셀·출생아수 그래프 PNG 를 원하는 폴더에 저장합니다.

설치: pip install PyQt6 pandas numpy matplotlib openpyxl
실행: python birth_gui.py [엑셀파일경로]
"""

import contextlib
import io
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from matplotlib.figure import Figure
from matplotlib.ticker import FuncFormatter, MultipleLocator
from PyQt6.QtCore import QPointF, QRectF, Qt
from PyQt6.QtGui import QBrush, QColor, QIcon, QPainter, QPen, QPixmap
from PyQt6.QtWidgets import (
    QAbstractItemView, QApplication, QFileDialog, QFrame, QGridLayout, QHBoxLayout, QHeaderView,
    QLabel, QMainWindow, QMessageBox, QPlainTextEdit, QPushButton, QSpinBox, QTableWidget,
    QTableWidgetItem, QTabWidget, QVBoxLayout, QWidget,
)

from birth_analysis import DEFAULT_FILE, REPLACEMENT_TFR, add_derived, analyze, load_clean, save

plt.rcParams["font.family"] = "Malgun Gothic"  # 차트 한글 폰트 (Windows)
plt.rcParams["axes.unicode_minus"] = False

START, END = 1970, 2025

# ── 색상 (다크 테마) ─────────────────────────────────────
BG = "#0A0F1C"
PANEL = "#111827"
PANEL_2 = "#0F172A"
BORDER = "#1F2A44"
TEXT = "#E2E8F0"
MUTED = "#8B9BB4"
ACCENT = "#22D3EE"
ACCENT_DARK = "#0891B2"
RISE = "#F87171"  # 증가: 빨강
FALL = "#60A5FA"  # 감소: 파랑
BIRTH_COLOR = "#3987E5"
DEATH_COLOR = "#D95926"
NATURAL_COLOR = "#199E70"

STYLE = f"""
QMainWindow, QWidget#central {{ background: {BG}; }}
QWidget {{ color: {TEXT}; font-family: "Malgun Gothic", "맑은 고딕", sans-serif; font-size: 10pt; }}
QLabel#title {{ font-size: 18pt; font-weight: 700; color: #FFFFFF; }}
QLabel#subtitle {{ color: {MUTED}; font-size: 9pt; letter-spacing: 1px; }}
QLabel#muted {{ color: {MUTED}; font-size: 9pt; }}
QLabel#section {{ color: {MUTED}; font-size: 9pt; font-weight: 600; }}
QLabel#kpiValue {{ font-size: 15pt; font-weight: 700; color: #FFFFFF; }}
QFrame#header {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #0B1A2E, stop:0.6 #0E2238, stop:1 #0A2A3A);
    border: 1px solid {BORDER}; border-radius: 10px;
}}
QFrame#panel {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 10px; }}
QFrame#kpi {{ background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 8px; }}

QSpinBox {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 5px 8px; selection-background-color: {ACCENT_DARK};
}}
QSpinBox:focus {{ border: 1px solid {ACCENT}; }}

QPushButton {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 7px 14px; color: {TEXT};
}}
QPushButton:hover {{ border: 1px solid {ACCENT}; color: #FFFFFF; }}
QPushButton:disabled {{ color: #4B5874; border: 1px solid #1A2236; }}
QPushButton#primary {{ background: {ACCENT}; color: #04202A; border: none; font-weight: 700; }}
QPushButton#primary:hover {{ background: #67E8F9; }}

QTabWidget::pane {{ border: 1px solid {BORDER}; border-radius: 10px; background: {PANEL}; top: -1px; }}
QTabBar::tab {{
    background: transparent; color: {MUTED}; padding: 8px 16px; border: none;
    border-bottom: 2px solid transparent;
}}
QTabBar::tab:selected {{ color: #FFFFFF; border-bottom: 2px solid {ACCENT}; }}
QTabBar::tab:hover {{ color: #FFFFFF; }}

QTableWidget {{
    background: {PANEL}; alternate-background-color: #0F1626; border: none;
    gridline-color: transparent; selection-background-color: rgba(34, 211, 238, 0.18);
    selection-color: #FFFFFF;
}}
QTableWidget::item {{ padding: 4px 6px; border-bottom: 1px solid #161F33; }}
QHeaderView::section {{
    background: {PANEL_2}; color: {MUTED}; border: none; border-bottom: 1px solid {BORDER};
    padding: 7px 6px; font-weight: 600;
}}
QPlainTextEdit {{
    background: {PANEL}; border: none; color: {TEXT};
    font-family: "D2Coding", "GulimChe";  /* 한글이 영문 2칸 폭인 고정폭 폰트 (표 열 맞춤) */
}}
QScrollBar:vertical, QScrollBar:horizontal {{ background: transparent; width: 10px; height: 10px; margin: 2px; }}
QScrollBar::handle:vertical, QScrollBar::handle:horizontal {{ background: #24324F; border-radius: 4px; min-height: 30px; min-width: 30px; }}
QScrollBar::handle:hover {{ background: {ACCENT_DARK}; }}
QScrollBar::add-line, QScrollBar::sub-line {{ height: 0; width: 0; }}
QStatusBar {{ background: {PANEL_2}; color: {MUTED}; border-top: 1px solid {BORDER}; }}
"""


def make_app_pixmap(size=64):
    """하락 후 반등하는 라인차트 모양의 앱 아이콘."""
    pm = QPixmap(size, size)
    pm.fill(Qt.GlobalColor.transparent)
    p = QPainter(pm)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    s = size / 64
    p.setPen(Qt.PenStyle.NoPen)
    p.setBrush(QBrush(QColor(PANEL_2)))
    p.drawRoundedRect(QRectF(2 * s, 2 * s, 60 * s, 60 * s), 12 * s, 12 * s)
    pen = QPen(QColor(BIRTH_COLOR), 4 * s)
    pen.setCapStyle(Qt.PenCapStyle.RoundCap)
    pen.setJoinStyle(Qt.PenJoinStyle.RoundJoin)
    p.setPen(pen)
    pts = [QPointF(x * s, y * s) for x, y in [(10, 14), (22, 22), (32, 36), (42, 46), (52, 34)]]
    for a, b in zip(pts, pts[1:]):
        p.drawLine(a, b)
    p.setPen(Qt.PenStyle.NoPen)
    p.setBrush(QBrush(QColor(ACCENT)))
    p.drawEllipse(QPointF(52 * s, 34 * s), 5 * s, 5 * s)
    p.end()
    return pm


def man_formatter():
    return FuncFormatter(lambda v, _: "0" if v == 0 else f"{v / 10_000:,.0f}만")


class ChartCanvas(FigureCanvasQTAgg):
    """다크 테마 matplotlib 캔버스. 마우스를 올리면 가장 가까운 연도의 값을 보여준다."""

    def __init__(self):
        self.fig = Figure(facecolor=PANEL, tight_layout=True)
        super().__init__(self.fig)
        self.hover_data = None  # (ax, years, {라벨: 값 Series}, 포맷 함수)
        self.tip = None
        self.vline = None
        self.mpl_connect("motion_notify_event", self.on_move)

    def new_axes(self):
        self.fig.clear()
        self.hover_data = None
        ax = self.fig.add_subplot(111)
        ax.set_facecolor(PANEL)
        for side in ("top", "right", "left"):
            ax.spines[side].set_visible(False)
        ax.spines["bottom"].set_color(BORDER)
        ax.tick_params(colors=MUTED, labelsize=9, length=0)
        ax.grid(axis="y", color=BORDER, lw=0.8)
        ax.set_axisbelow(True)
        return ax

    def message(self, text):
        ax = self.new_axes()
        ax.axis("off")
        ax.text(0.5, 0.5, text, color=MUTED, ha="center", va="center", fontsize=11)
        self.draw()

    def set_hover(self, ax, series, fmt):
        years = list(next(iter(series.values())).index)
        self.hover_data = (ax, years, series, fmt)
        self.vline = ax.axvline(years[0], color=MUTED, lw=0.8, ls=":", visible=False)
        self.tip = ax.annotate("", (0, 0), xytext=(12, 12), textcoords="offset points",
                               color=TEXT, fontsize=9, visible=False, zorder=10,
                               bbox=dict(boxstyle="round,pad=0.5", fc=PANEL_2, ec=BORDER))

    def on_move(self, event):
        if not self.hover_data:
            return
        ax, years, series, fmt = self.hover_data
        if event.inaxes is not ax or event.xdata is None:
            if self.tip.get_visible():
                self.tip.set_visible(False)
                self.vline.set_visible(False)
                self.draw_idle()
            return
        year = min(years, key=lambda y: abs(y - event.xdata))
        lines = [f"{year}년"] + [f"{name}: {fmt(s.get(year))}" for name, s in series.items()]
        first = next(iter(series.values())).get(year)
        self.tip.xy = (year, first)
        self.tip.set_text("\n".join(lines))
        # 오른쪽 끝에서는 툴팁을 왼쪽으로
        right = year > (years[0] + years[-1]) / 2
        self.tip.set_position((-12, 12) if right else (12, 12))
        self.tip.set_ha("right" if right else "left")
        self.tip.set_visible(True)
        self.vline.set_xdata([year, year])
        self.vline.set_visible(True)
        self.draw_idle()


def style_legend(ax, loc="upper right"):
    leg = ax.legend(fontsize=9, loc=loc, frameon=True)
    leg.get_frame().set_facecolor(PANEL_2)
    leg.get_frame().set_edgecolor(BORDER)
    for t in leg.get_texts():
        t.set_color(TEXT)


def fmt_people(v):
    return "-" if v is None or v != v else f"{v:,.0f}명"


class KpiCard(QFrame):
    def __init__(self, title):
        super().__init__(objectName="kpi")
        lay = QVBoxLayout(self)
        lay.setContentsMargins(12, 10, 12, 10)
        lay.setSpacing(2)
        lay.addWidget(QLabel(title, objectName="muted"))
        self.value = QLabel("-", objectName="kpiValue")
        self.note = QLabel("", objectName="muted")
        lay.addWidget(self.value)
        lay.addWidget(self.note)

    def set(self, value, note="", color=None):
        self.value.setText(value)
        self.value.setStyleSheet(f"color: {color};" if color else "")
        self.note.setText(note)


class MainWindow(QMainWindow):
    def __init__(self, path=None):
        super().__init__()
        self.setWindowTitle("대한민국 출생 통계 분석기")
        self.setWindowIcon(QIcon(make_app_pixmap(64)))
        self.resize(1400, 860)
        self.data = None
        self.path = None

        central = QWidget(objectName="central")
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(16, 16, 16, 8)
        root.setSpacing(12)

        root.addWidget(self.build_header())
        body = QHBoxLayout()
        body.setSpacing(12)
        body.addWidget(self.build_sidebar())
        body.addWidget(self.build_tabs(), 1)
        root.addLayout(body, 1)

        path = Path(path) if path else DEFAULT_FILE
        if path.exists():
            self.load(path)
        else:
            self.statusBar().showMessage("[엑셀 열기]로 KOSIS 출생 통계 엑셀을 선택하세요.")
            for c in (self.births_canvas, self.tfr_canvas, self.natural_canvas):
                c.message("엑셀 파일을 열어 주세요.")

    # ── 화면 구성 ─────────────────────────────────────────
    def build_header(self):
        header = QFrame(objectName="header")
        lay = QHBoxLayout(header)
        lay.setContentsMargins(18, 12, 18, 12)
        titles = QVBoxLayout()
        titles.addWidget(QLabel("대한민국 출생 통계 분석기", objectName="title"))
        self.file_label = QLabel("출생아수 · 합계출산율 · 자연증가  |  출처: 통계청 인구동향조사(KOSIS)",
                                 objectName="subtitle")
        titles.addWidget(self.file_label)
        lay.addLayout(titles, 1)

        open_btn = QPushButton("엑셀 열기", objectName="primary")
        open_btn.clicked.connect(self.open_file)
        self.save_btn = QPushButton("결과 저장")
        self.save_btn.clicked.connect(self.save_results)
        self.save_btn.setEnabled(False)
        lay.addWidget(open_btn)
        lay.addWidget(self.save_btn)
        return header

    def build_sidebar(self):
        panel = QFrame(objectName="panel")
        panel.setFixedWidth(270)
        lay = QVBoxLayout(panel)
        lay.setContentsMargins(14, 14, 14, 14)
        lay.setSpacing(10)

        lay.addWidget(QLabel("분석 구간", objectName="section"))
        grid = QGridLayout()
        self.start_spin = QSpinBox()
        self.end_spin = QSpinBox()
        for spin, value in ((self.start_spin, START), (self.end_spin, END)):
            spin.setRange(1900, 2100)
            spin.setValue(value)
            spin.setSuffix("년")
            spin.valueChanged.connect(self.refresh)
        grid.addWidget(QLabel("시작"), 0, 0)
        grid.addWidget(self.start_spin, 0, 1)
        grid.addWidget(QLabel("끝"), 1, 0)
        grid.addWidget(self.end_spin, 1, 1)
        lay.addLayout(grid)
        self.range_note = QLabel("", objectName="muted")
        self.range_note.setWordWrap(True)
        lay.addWidget(self.range_note)

        lay.addSpacing(6)
        lay.addWidget(QLabel("핵심 지표", objectName="section"))
        self.kpi_births = KpiCard("최근 출생아수")
        self.kpi_tfr = KpiCard("최근 합계출산율")
        self.kpi_low = KpiCard("최저 출생 연도")
        self.kpi_natural = KpiCard("누적 자연증감")
        for card in (self.kpi_births, self.kpi_tfr, self.kpi_low, self.kpi_natural):
            lay.addWidget(card)
        lay.addStretch(1)
        return panel

    def build_tabs(self):
        self.tabs = QTabWidget()
        self.births_canvas = ChartCanvas()
        self.tfr_canvas = ChartCanvas()
        self.natural_canvas = ChartCanvas()
        self.tabs.addTab(self.births_canvas, "출생아수")
        self.tabs.addTab(self.tfr_canvas, "합계출산율")
        self.tabs.addTab(self.natural_canvas, "자연증감")

        self.table = QTableWidget()
        self.table.setAlternatingRowColors(True)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.verticalHeader().setVisible(False)
        self.tabs.addTab(self.table, "정제 데이터")

        self.report = QPlainTextEdit(readOnly=True)
        self.report.setLineWrapMode(QPlainTextEdit.LineWrapMode.NoWrap)
        self.tabs.addTab(self.report, "분석 리포트")
        return self.tabs

    # ── 데이터 ────────────────────────────────────────────
    def open_file(self):
        start = str(self.path.parent if self.path else Path.home() / "Downloads")
        path, _ = QFileDialog.getOpenFileName(self, "KOSIS 출생 통계 엑셀 열기", start, "Excel (*.xlsx *.xls)")
        if path:
            self.load(Path(path))

    def load(self, path):
        log = io.StringIO()
        try:
            with contextlib.redirect_stdout(log):
                data = load_clean(path)
        except Exception as e:
            QMessageBox.critical(self, "불러오기 실패", f"{path.name} 을(를) 읽지 못했습니다.\n\n{e}")
            return
        if "출생아수" not in data or "합계출산율" not in data:
            QMessageBox.warning(self, "형식 오류", "출생아수·합계출산율 항목이 있는 KOSIS 엑셀이 아닙니다.")
            return
        self.data, self.path = data, path
        self.clean_log = log.getvalue()
        self.file_label.setText(f"{path.name}  |  {data.index.min()}~{data.index.max()}년, "
                                f"{data.shape[1]}개 항목  |  출처: 통계청 인구동향조사(KOSIS)")
        self.save_btn.setEnabled(True)
        self.refresh()

    def selected(self):
        """분석 구간으로 자른 데이터 (없으면 None)."""
        lo, hi = sorted((self.start_spin.value(), self.end_spin.value()))
        sub = self.data.loc[lo:hi]
        return (sub if not sub.empty else None), lo, hi

    def refresh(self):
        if self.data is None:
            return
        df, lo, hi = self.selected()
        if df is None:
            self.range_note.setText(f"{lo}~{hi}년에 데이터가 없습니다. "
                                    f"(보유: {self.data.index.min()}~{self.data.index.max()})")
            for c in (self.births_canvas, self.tfr_canvas, self.natural_canvas):
                c.message("선택한 구간에 데이터가 없습니다.")
            return
        missing = (hi - lo + 1) - len(df)
        self.range_note.setText(
            f"데이터 보유 {df.index.min()}~{df.index.max()}년 ({len(df)}개 연도)"
            + (f"\n{missing}개 연도는 파일에 없습니다. KOSIS에서 조회기간을 {lo}~{hi}로 받으면 채워집니다."
               if missing else ""))
        derived = add_derived(df)
        self.update_kpis(derived)
        self.draw_births(derived, lo, hi)
        self.draw_tfr(derived, lo, hi)
        self.draw_natural(derived, lo, hi)
        self.fill_table(derived)
        self.fill_report(df)
        self.statusBar().showMessage(f"{self.path}  ·  {lo}~{hi}년 분석 완료")

    # ── 핵심 지표 ─────────────────────────────────────────
    def update_kpis(self, d):
        b = d["출생아수"].astype(float)
        last = d.index[-1]
        chg = d["출생아_증감률(%)"].iloc[-1]
        self.kpi_births.set(fmt_people(b.iloc[-1]),
                            f"{last}년 · 전년 대비 {chg:+.1f}%" if chg == chg else f"{last}년",
                            RISE if chg > 0 else FALL if chg < 0 else None)
        tfr = d["합계출산율"].iloc[-1]
        self.kpi_tfr.set(f"{tfr:.3f}명", f"대체수준 {REPLACEMENT_TFR}명의 {d['대체수준 대비(%)'].iloc[-1]:.0f}%")
        low = b.idxmin()
        rebound = (b.iloc[-1] / b[low] - 1) * 100
        self.kpi_low.set(f"{low}년", f"{b[low]:,.0f}명 · 이후 {rebound:+.1f}%" if low < last else f"{b[low]:,.0f}명")
        if "자연증가건수" in d:
            total = d["자연증가건수"].astype(float).sum()
            self.kpi_natural.set(f"{total:+,.0f}명", f"{d.index[0]}~{last}년 합계",
                                 RISE if total > 0 else FALL)
        else:
            self.kpi_natural.set("-", "자연증가 항목 없음")

    # ── 차트 ──────────────────────────────────────────────
    def setup_x(self, ax, lo, hi):
        ax.set_xlim(lo - 1, hi + 1)
        ax.xaxis.set_major_locator(MultipleLocator(5 if hi - lo > 15 else 1))

    def title(self, ax, text, sub):
        ax.set_title(text, loc="left", color="#FFFFFF", fontsize=13, fontweight="bold", pad=22)
        ax.text(0, 1.02, sub, transform=ax.transAxes, color=MUTED, fontsize=9)

    def draw_births(self, d, lo, hi):
        c = self.births_canvas
        ax = c.new_axes()
        s = d["출생아수"].dropna().astype(float)
        ax.plot(s.index, s.values, color=BIRTH_COLOR, lw=2,
                marker="o" if len(s) <= 15 else None, ms=8, mec=PANEL, mew=2)
        for year, label in {s.idxmax(): "최다", s.idxmin(): "최저", s.index[-1]: "최근"}.items():
            ax.annotate(f"{year}년 {label}\n{s[year]:,.0f}명", (year, s[year]),
                        xytext=(0, 14 if label != "최저" else -32), textcoords="offset points",
                        ha="center", fontsize=9, color=TEXT)
        ax.set_ylim(0, s.max() * 1.18)
        ax.yaxis.set_major_formatter(man_formatter())
        self.setup_x(ax, lo, hi)
        self.title(ax, f"대한민국 연도별 출생아수 ({lo}~{hi})", "단위: 명")
        c.set_hover(ax, {"출생아수": s, "전년 대비": d["출생아_증감률(%)"]},
                    lambda v: "-" if v is None or v != v else (f"{v:,.0f}명" if abs(v) > 1000 else f"{v:+.1f}%"))
        c.draw()

    def draw_tfr(self, d, lo, hi):
        c = self.tfr_canvas
        ax = c.new_axes()
        s = d["합계출산율"].dropna()
        ax.axhline(REPLACEMENT_TFR, color=MUTED, lw=1, ls="--")
        ax.text(lo - 0.5, REPLACEMENT_TFR, f" 인구 대체수준 {REPLACEMENT_TFR}명", color=MUTED,
                fontsize=9, va="bottom")
        ax.plot(s.index, s.values, color=ACCENT, lw=2,
                marker="o" if len(s) <= 15 else None, ms=8, mec=PANEL, mew=2)
        for year, label in {s.idxmin(): "최저", s.index[-1]: "최근"}.items():
            ax.annotate(f"{year}년 {label} {s[year]:.3f}명", (year, s[year]),
                        xytext=(0, -20 if label == "최저" else 12), textcoords="offset points",
                        ha="center", fontsize=9, color=TEXT)
        ax.set_ylim(0, max(s.max(), REPLACEMENT_TFR) * 1.15)
        self.setup_x(ax, lo, hi)
        self.title(ax, f"합계출산율 ({lo}~{hi})", "여성 1명이 평생 낳을 것으로 예상되는 평균 출생아수 · 단위: 명")
        c.set_hover(ax, {"합계출산율": s}, lambda v: "-" if v is None or v != v else f"{v:.3f}명")
        c.draw()

    def draw_natural(self, d, lo, hi):
        c = self.natural_canvas
        if "자연증가건수" not in d:
            c.message("이 파일에는 자연증가 항목이 없습니다.")
            return
        ax = c.new_axes()
        years = d.index.to_numpy()
        births = d["출생아수"].astype(float)
        deaths = d["사망자수(추정)"]
        natural = d["자연증가건수"].astype(float)
        w = 0.38 if len(d) <= 15 else 0.4
        ax.bar(years - w / 2, births, w, color=BIRTH_COLOR, label="출생아수", edgecolor=PANEL, lw=1)
        ax.bar(years + w / 2, deaths, w, color=DEATH_COLOR, label="사망자수(추정)", edgecolor=PANEL, lw=1)
        ax.plot(years, natural, color=NATURAL_COLOR, lw=2, marker="o" if len(d) <= 15 else None,
                ms=7, mec=PANEL, mew=2, label="자연증가(출생-사망)")
        ax.axhline(0, color=MUTED, lw=0.8)
        ax.yaxis.set_major_formatter(man_formatter())
        ax.set_ylim(min(natural.min(), 0) * 1.3, max(births.max(), deaths.max()) * 1.15)
        self.setup_x(ax, lo, hi)
        self.title(ax, f"출생·사망과 인구 자연증감 ({lo}~{hi})", "사망자수 = 출생아수 - 자연증가건수 로 역산 · 단위: 명")
        style_legend(ax, "upper left")
        c.set_hover(ax, {"출생아수": births, "사망자수": deaths, "자연증가": natural}, fmt_people)
        c.draw()

    # ── 표 / 리포트 ───────────────────────────────────────
    def fill_table(self, d):
        cols = ["연도"] + list(d.columns)
        self.table.clear()
        self.table.setColumnCount(len(cols))
        self.table.setRowCount(len(d))
        self.table.setHorizontalHeaderLabels(cols)
        for r, (year, row) in enumerate(d.iterrows()):
            self.table.setItem(r, 0, QTableWidgetItem(str(year)))
            for c, col in enumerate(d.columns, start=1):
                v = row[col]
                if v is None or v != v:
                    text = "-"
                elif abs(float(v)) >= 1000:
                    text = f"{float(v):,.0f}"
                else:
                    text = f"{float(v):,.3f}".rstrip("0").rstrip(".")
                item = QTableWidgetItem(text)
                item.setTextAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
                if col.endswith("증감") or col.endswith("(%)"):
                    if float(v or 0) > 0:
                        item.setForeground(QColor(RISE))
                    elif float(v or 0) < 0:
                        item.setForeground(QColor(FALL))
                self.table.setItem(r, c, item)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)

    def fill_report(self, df):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf), pd.option_context(
                "display.width", 200, "display.max_columns", 30,
                "display.unicode.east_asian_width", True):
            analyze(df)
        self.report.setPlainText("[클렌징 로그]\n" + self.clean_log + buf.getvalue())

    # ── 저장 ──────────────────────────────────────────────
    def save_results(self):
        df, lo, hi = self.selected()
        if df is None:
            return
        folder = QFileDialog.getExistingDirectory(self, "저장할 폴더 선택", str(self.path.parent.parent / "output"))
        if not folder:
            return
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                save(df, add_derived(df), folder)
            png = Path(folder) / f"births_{lo}_{hi}.png"
            self.births_canvas.fig.savefig(png, dpi=150, facecolor=PANEL)
        except Exception as e:
            QMessageBox.critical(self, "저장 실패", str(e))
            return
        self.statusBar().showMessage(f"저장 완료: {folder}  (births_clean.csv, births_analysis.xlsx, {png.name})")


def main():
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLE)
    window = MainWindow(sys.argv[1] if len(sys.argv) > 1 else None)
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
