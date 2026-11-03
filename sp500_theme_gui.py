"""S&P 500 AI 테마 비교기 - AI 관련 / AI 설비 / 데이터센터 전기 / 냉각 종목 PyQt6 GUI

- 왼쪽 목록에서 비교할 종목을 체크하고 기간을 고른 뒤 [분석]을 누르면
  백그라운드 스레드에서 yfinance로 주가를 받아 S&P 500 지수와 비교합니다(sp500_theme_data.py 사용).
- [누적 수익률] 종목별 또는 테마 평균(동일가중) 누적 수익률
- [낙폭] 고점 대비 하락률
- [상관관계] 일간 수익률 상관계수 히트맵 (테마끼리 함께 움직이는지 확인)
- [성과 지표] 기간수익률, CAGR, 변동성, MDD, 샤프지수, 베타. 열 머리글을 누르면 정렬,
  더블클릭하면 Yahoo Finance 종목 페이지를 엽니다. [CSV 저장]으로 표를 저장합니다.
- 목록의 종목은 테마 관련 기업 예시이며 투자 추천이 아닙니다.

설치: pip install PyQt6 yfinance pandas numpy matplotlib
실행: python sp500_theme_gui.py
"""

import sys

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from matplotlib.figure import Figure
from PyQt6.QtCore import QPointF, QRectF, QThread, QUrl, Qt, pyqtSignal
from PyQt6.QtGui import QBrush, QColor, QDesktopServices, QIcon, QPainter, QPen, QPixmap
from PyQt6.QtWidgets import (
    QAbstractItemView, QApplication, QComboBox, QDoubleSpinBox, QFileDialog, QFrame, QHBoxLayout,
    QHeaderView, QLabel, QLineEdit, QMainWindow, QMessageBox, QProgressBar, QPushButton,
    QTableWidget, QTableWidgetItem, QTabWidget, QTreeWidget, QTreeWidgetItem, QVBoxLayout, QWidget,
)

from sp500_theme_data import (
    BENCHMARK, METRIC_COLUMNS, PERIODS, THEMES, compute_metrics, correlation, cumulative, drawdown,
    fetch_prices, theme_returns, ticker_info,
)

plt.rcParams["font.family"] = "Malgun Gothic"  # 차트 한글 폰트 (Windows)
plt.rcParams["axes.unicode_minus"] = False

CUSTOM_THEME = "직접 추가"
QUOTE_URL = "https://finance.yahoo.com/quote/{}"
THEME_COLORS = {"AI 관련": "#F472B6", "AI 설비": "#A78BFA", "데이터센터 전기": "#FBBF24",
                "냉각": "#22D3EE", CUSTOM_THEME: "#94A3B8"}

# ── 색상 (다크 테마) ─────────────────────────────────────
BG = "#0A0F1C"
PANEL = "#111827"
PANEL_2 = "#0F172A"
BORDER = "#1F2A44"
TEXT = "#E2E8F0"
MUTED = "#8B9BB4"
ACCENT = "#22D3EE"
ACCENT_DARK = "#0891B2"
RISE = "#F87171"  # 상승: 빨강
FALL = "#60A5FA"  # 하락: 파랑
BENCH_COLOR = "#FFFFFF"

STYLE = f"""
QMainWindow, QWidget#central {{ background: {BG}; }}
QWidget {{ color: {TEXT}; font-family: "Malgun Gothic", "맑은 고딕", sans-serif; font-size: 10pt; }}
QLabel#title {{ font-size: 18pt; font-weight: 700; color: #FFFFFF; }}
QLabel#subtitle {{ color: {MUTED}; font-size: 9pt; letter-spacing: 1px; }}
QLabel#muted {{ color: {MUTED}; font-size: 9pt; }}
QLabel#section {{ color: {MUTED}; font-size: 9pt; font-weight: 600; }}
QFrame#header {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #0B1A2E, stop:0.6 #0E2238, stop:1 #0A2A3A);
    border: 1px solid {BORDER}; border-radius: 10px;
}}
QFrame#panel {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 10px; }}

QLineEdit, QComboBox, QDoubleSpinBox {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 5px 8px; selection-background-color: {ACCENT_DARK};
}}
QLineEdit:focus, QComboBox:focus, QDoubleSpinBox:focus {{ border: 1px solid {ACCENT}; }}
QComboBox QAbstractItemView {{ background: {PANEL_2}; border: 1px solid {BORDER}; selection-background-color: {ACCENT_DARK}; }}

QPushButton {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 7px 14px; color: {TEXT};
}}
QPushButton:hover {{ border: 1px solid {ACCENT}; color: #FFFFFF; }}
QPushButton:disabled {{ color: #4B5874; border: 1px solid #1A2236; }}
QPushButton#primary {{ background: {ACCENT}; color: #04202A; border: none; font-weight: 700; }}
QPushButton#primary:hover {{ background: #67E8F9; }}
QPushButton#primary:disabled {{ background: #164E5C; color: #5B8A96; }}

QTreeWidget {{ background: {PANEL}; border: none; }}
QTreeWidget::item {{ padding: 3px 2px; }}
QTreeWidget::item:selected {{ background: rgba(34, 211, 238, 0.18); color: #FFFFFF; }}
QTreeWidget::indicator {{ width: 14px; height: 14px; border-radius: 3px; border: 1px solid {BORDER}; background: {PANEL_2}; }}
QTreeWidget::indicator:checked {{ background: {ACCENT}; border: 1px solid {ACCENT}; }}
QTreeWidget::indicator:indeterminate {{ background: {ACCENT_DARK}; border: 1px solid {ACCENT_DARK}; }}

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
QProgressBar {{ background: {PANEL_2}; border: none; border-radius: 2px; max-height: 4px; }}
QProgressBar::chunk {{ background: {ACCENT}; border-radius: 2px; }}
QScrollBar:vertical {{ background: transparent; width: 10px; margin: 2px; }}
QScrollBar::handle:vertical {{ background: #24324F; border-radius: 4px; min-height: 30px; }}
QScrollBar::handle:vertical:hover {{ background: {ACCENT_DARK}; }}
QScrollBar::add-line, QScrollBar::sub-line {{ height: 0; }}
QStatusBar {{ background: {PANEL_2}; color: {MUTED}; border-top: 1px solid {BORDER}; }}
"""


def make_app_pixmap(size=64):
    """상승 라인차트 모양의 앱 아이콘 (창 아이콘 / exe 아이콘에 사용)."""
    pm = QPixmap(size, size)
    pm.fill(Qt.GlobalColor.transparent)
    p = QPainter(pm)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    s = size / 64
    p.setPen(Qt.PenStyle.NoPen)
    p.setBrush(QBrush(QColor(PANEL_2)))
    p.drawRoundedRect(QRectF(2 * s, 2 * s, 60 * s, 60 * s), 12 * s, 12 * s)
    for i, (h, color) in enumerate([(14, "#A78BFA"), (24, "#FBBF24"), (34, "#22D3EE")]):  # 막대
        p.setBrush(QBrush(QColor(color)))
        p.drawRoundedRect(QRectF((12 + i * 14) * s, (52 - h) * s, 9 * s, h * s), 2 * s, 2 * s)
    pen = QPen(QColor("#F472B6"), 4 * s)
    pen.setCapStyle(Qt.PenCapStyle.RoundCap)
    pen.setJoinStyle(Qt.PenJoinStyle.RoundJoin)
    p.setPen(pen)
    pts = [QPointF(x * s, y * s) for x, y in [(10, 36), (24, 28), (34, 32), (52, 12)]]  # 상승 선
    for a, b in zip(pts, pts[1:]):
        p.drawLine(a, b)
    p.end()
    return pm


class SortItem(QTableWidgetItem):
    """표시 문자열이 아니라 원래 숫자로 정렬되도록 하는 표 칸."""

    def __init__(self, text, sort_key):
        super().__init__(text)
        self.sort_key = sort_key

    def __lt__(self, other):
        try:
            return self.sort_key < other.sort_key
        except TypeError:
            return str(self.sort_key) < str(other.sort_key)


class LoadWorker(QThread):
    done = pyqtSignal(object)
    failed = pyqtSignal(str)

    def __init__(self, tickers, period):
        super().__init__()
        self.tickers = tickers
        self.period = period

    def run(self):
        try:
            self.done.emit(fetch_prices(self.tickers, self.period))
        except Exception as e:  # 네트워크 오류 등은 화면에 알림
            self.failed.emit(str(e))


class ChartCanvas(FigureCanvasQTAgg):
    """다크 테마가 적용된 matplotlib 캔버스."""

    def __init__(self):
        self.fig = Figure(facecolor=PANEL, tight_layout=True)
        super().__init__(self.fig)

    def new_axes(self):
        self.fig.clear()
        ax = self.fig.add_subplot(111)
        ax.set_facecolor(PANEL)
        for spine in ax.spines.values():
            spine.set_color(BORDER)
        ax.tick_params(colors=MUTED, labelsize=8)
        ax.grid(color=BORDER, alpha=0.6, lw=0.6)
        return ax

    def message(self, text):
        ax = self.new_axes()
        ax.axis("off")
        ax.text(0.5, 0.5, text, color=MUTED, ha="center", va="center", fontsize=11)
        self.draw()


def legend(ax, loc="upper left"):
    leg = ax.legend(fontsize=8, loc=loc, ncol=2, frameon=True)
    leg.get_frame().set_facecolor(PANEL_2)
    leg.get_frame().set_edgecolor(BORDER)
    for t in leg.get_texts():
        t.set_color(TEXT)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("S&P 500 AI 테마 비교기")
        self.setWindowIcon(QIcon(make_app_pixmap(64)))
        self.resize(1400, 860)
        self.info = ticker_info()
        self.prices = None
        self.metrics = None
        self.worker = None

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

        self.statusBar().showMessage("종목을 고르고 [분석]을 누르세요.")
        self.show_placeholder()

    # ── 화면 구성 ─────────────────────────────────────────
    def build_header(self):
        header = QFrame(objectName="header")
        lay = QVBoxLayout(header)
        lay.setContentsMargins(18, 12, 18, 12)
        lay.addWidget(QLabel("S&P 500 AI 테마 비교기", objectName="title"))
        lay.addWidget(QLabel("AI 관련 · AI 설비 · 데이터센터 전기 · 냉각  vs  S&P 500 지수", objectName="subtitle"))
        lay.addWidget(QLabel("※ 목록의 종목은 테마 관련 기업 예시이며 투자 추천이 아닙니다. "
                             "과거 성과는 미래 수익을 보장하지 않습니다.", objectName="muted"))
        return header

    def build_sidebar(self):
        panel = QFrame(objectName="panel")
        panel.setFixedWidth(330)
        lay = QVBoxLayout(panel)
        lay.setContentsMargins(12, 12, 12, 12)
        lay.setSpacing(8)

        lay.addWidget(QLabel("비교 종목", objectName="section"))
        self.tree = QTreeWidget()
        self.tree.setHeaderHidden(True)
        self.tree.setColumnCount(2)
        self.tree.setColumnWidth(0, 135)
        for theme, items in THEMES.items():
            self.add_theme_item(theme, items)
        self.tree.expandAll()
        self.tree.currentItemChanged.connect(self.show_ticker_hint)
        lay.addWidget(self.tree, 1)

        self.hint = QLabel("", objectName="muted")
        self.hint.setWordWrap(True)
        lay.addWidget(self.hint)

        add_row = QHBoxLayout()
        self.ticker_edit = QLineEdit(placeholderText="티커 직접 추가 (예: TSLA)")
        self.ticker_edit.returnPressed.connect(self.add_custom_ticker)
        add_btn = QPushButton("추가")
        add_btn.clicked.connect(self.add_custom_ticker)
        add_row.addWidget(self.ticker_edit, 1)
        add_row.addWidget(add_btn)
        lay.addLayout(add_row)

        opt_row = QHBoxLayout()
        opt_row.addWidget(QLabel("기간", objectName="muted"))
        self.period_combo = QComboBox()
        self.period_combo.addItems(PERIODS)
        self.period_combo.setCurrentText("5년")
        opt_row.addWidget(self.period_combo, 1)
        opt_row.addWidget(QLabel("무위험수익률", objectName="muted"))
        self.rf_spin = QDoubleSpinBox(suffix=" %", decimals=1, maximum=20.0, singleStep=0.5, value=4.0)
        self.rf_spin.setToolTip("샤프지수 계산에 쓰는 연 무위험수익률 (예: 미국 단기국채 금리)")
        self.rf_spin.valueChanged.connect(self.refresh_metrics)
        opt_row.addWidget(self.rf_spin)
        lay.addLayout(opt_row)

        self.run_btn = QPushButton("분석", objectName="primary")
        self.run_btn.clicked.connect(self.start_load)
        lay.addWidget(self.run_btn)
        self.progress = QProgressBar()
        self.progress.setTextVisible(False)
        self.progress.setRange(0, 1)
        lay.addWidget(self.progress)
        return panel

    def add_theme_item(self, theme, items):
        parent = QTreeWidgetItem(self.tree, [theme])
        parent.setFirstColumnSpanned(True)
        parent.setFlags(parent.flags() | Qt.ItemFlag.ItemIsAutoTristate | Qt.ItemFlag.ItemIsUserCheckable)
        parent.setForeground(0, QColor(THEME_COLORS.get(theme, TEXT)))
        font = parent.font(0)
        font.setBold(True)
        parent.setFont(0, font)
        for ticker, name, _desc in items:
            self.add_ticker_item(parent, ticker, name)
        return parent

    def add_ticker_item(self, parent, ticker, name):
        child = QTreeWidgetItem(parent, [ticker, name])
        child.setFlags(child.flags() | Qt.ItemFlag.ItemIsUserCheckable)
        child.setCheckState(0, Qt.CheckState.Checked)
        child.setForeground(1, QColor(MUTED))
        child.setData(0, Qt.ItemDataRole.UserRole, ticker)

    def build_tabs(self):
        self.tabs = QTabWidget()

        # 누적 수익률
        cum_tab = QWidget()
        cum_lay = QVBoxLayout(cum_tab)
        mode_row = QHBoxLayout()
        mode_row.addWidget(QLabel("보기", objectName="muted"))
        self.cum_mode = QComboBox()
        self.cum_mode.addItems(["종목별", "테마 평균 (동일가중)"])
        self.cum_mode.currentIndexChanged.connect(self.draw_cumulative)
        mode_row.addWidget(self.cum_mode)
        self.log_combo = QComboBox()
        self.log_combo.addItems(["일반 축", "로그 축"])
        self.log_combo.currentIndexChanged.connect(self.draw_cumulative)
        mode_row.addWidget(self.log_combo)
        mode_row.addStretch()
        cum_lay.addLayout(mode_row)
        self.cum_canvas = ChartCanvas()
        cum_lay.addWidget(self.cum_canvas, 1)
        self.tabs.addTab(cum_tab, "누적 수익률")

        self.dd_canvas = ChartCanvas()
        self.tabs.addTab(self.dd_canvas, "낙폭")
        self.corr_canvas = ChartCanvas()
        self.tabs.addTab(self.corr_canvas, "상관관계")

        # 성과 지표
        table_tab = QWidget()
        t_lay = QVBoxLayout(table_tab)
        self.table = QTableWidget()
        headers = ["티커", "기업명", "테마", *METRIC_COLUMNS]
        self.table.setColumnCount(len(headers))
        self.table.setHorizontalHeaderLabels(headers)
        self.table.verticalHeader().setVisible(False)
        self.table.setAlternatingRowColors(True)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        # 티커, 기업명, 테마, 시작일은 글자가 잘리지 않게 내용에 맞춤
        for col in (0, 1, 2, len(headers) - 1):
            self.table.horizontalHeader().setSectionResizeMode(col, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setMinimumSectionSize(70)
        self.table.cellDoubleClicked.connect(self.open_quote)
        t_lay.addWidget(self.table, 1)
        btn_row = QHBoxLayout()
        btn_row.addWidget(QLabel("CAGR=연평균 수익률 · MDD=최대 낙폭 · 베타>1이면 S&P 500보다 크게 움직임 · "
                                 "더블클릭: Yahoo Finance", objectName="muted"))
        btn_row.addStretch()
        self.save_btn = QPushButton("CSV 저장")
        self.save_btn.setEnabled(False)
        self.save_btn.clicked.connect(self.save_csv)
        btn_row.addWidget(self.save_btn)
        t_lay.addLayout(btn_row)
        self.tabs.addTab(table_tab, "성과 지표")
        return self.tabs

    def show_placeholder(self):
        for canvas in (self.cum_canvas, self.dd_canvas, self.corr_canvas):
            canvas.message("[분석]을 누르면 결과가 여기에 표시됩니다.")

    # ── 종목 목록 ─────────────────────────────────────────
    def checked_members(self):
        """체크된 종목을 {테마: [티커]}로 반환."""
        members = {}
        for i in range(self.tree.topLevelItemCount()):
            parent = self.tree.topLevelItem(i)
            tickers = [parent.child(j).data(0, Qt.ItemDataRole.UserRole) for j in range(parent.childCount())
                       if parent.child(j).checkState(0) == Qt.CheckState.Checked]
            if tickers:
                members[parent.text(0)] = tickers
        return members

    def theme_of(self, ticker):
        if ticker == BENCHMARK:
            return "벤치마크"
        return self.info.get(ticker, (CUSTOM_THEME,))[0]

    def name_of(self, ticker):
        if ticker == BENCHMARK:
            return "S&P 500 지수"
        return self.info.get(ticker, (None, ticker))[1]

    def show_ticker_hint(self, item, _prev):
        ticker = item.data(0, Qt.ItemDataRole.UserRole) if item else None
        if ticker in self.info:
            theme, name, desc = self.info[ticker]
            self.hint.setText(f"{ticker} · {name} — {desc}")
        else:
            self.hint.setText("")

    def add_custom_ticker(self):
        ticker = self.ticker_edit.text().strip().upper()
        if not ticker:
            return
        if ticker in self.info:
            QMessageBox.information(self, "알림", f"{ticker}는 이미 목록에 있습니다.")
            return
        found = self.tree.findItems(CUSTOM_THEME, Qt.MatchFlag.MatchExactly)
        parent = found[0] if found else self.add_theme_item(CUSTOM_THEME, [])
        self.add_ticker_item(parent, ticker, "")
        parent.setExpanded(True)
        self.info[ticker] = (CUSTOM_THEME, ticker, "직접 추가한 종목")
        self.ticker_edit.clear()

    # ── 데이터 불러오기 ───────────────────────────────────
    def start_load(self):
        members = self.checked_members()
        tickers = [t for ts in members.values() for t in ts]
        if not tickers:
            QMessageBox.warning(self, "알림", "비교할 종목을 하나 이상 체크하세요.")
            return
        self.members = members
        self.run_btn.setEnabled(False)
        self.progress.setRange(0, 0)
        self.statusBar().showMessage(f"{len(tickers)}개 종목과 S&P 500 지수 데이터를 받는 중...")
        self.worker = LoadWorker(tickers, PERIODS[self.period_combo.currentText()])
        self.worker.done.connect(self.load_finished)
        self.worker.failed.connect(self.load_failed)
        self.worker.finished.connect(self.load_done)
        self.worker.start()

    def load_done(self):
        self.run_btn.setEnabled(True)
        self.progress.setRange(0, 1)

    def load_finished(self, prices):
        self.prices = prices
        requested = [t for ts in self.members.values() for t in ts]
        missing = [t for t in requested if t not in prices]
        self.refresh_metrics()
        self.draw_cumulative()
        self.draw_drawdown()
        self.draw_correlation()
        msg = (f"{prices.index[0]:%Y-%m-%d} ~ {prices.index[-1]:%Y-%m-%d} · "
               f"{len(prices.columns) - 1}개 종목 분석 완료")
        if missing:
            msg += f" · 데이터 없음: {', '.join(missing)}"
        self.statusBar().showMessage(msg)

    def load_failed(self, message):
        self.statusBar().showMessage("불러오기 실패")
        QMessageBox.critical(self, "오류", message)

    # ── 차트 ─────────────────────────────────────────────
    def series_colors(self, columns):
        palette = ["#F472B6", "#A78BFA", "#FBBF24", "#22D3EE", "#34D399", "#FB923C", "#F87171",
                   "#60A5FA", "#E879F9", "#A3E635", "#FCD34D", "#2DD4BF", "#C084FC", "#FDA4AF"]
        return {c: palette[i % len(palette)] for i, c in enumerate(columns)}

    def draw_cumulative(self):
        if self.prices is None:
            return
        ax = self.cum_canvas.new_axes()
        log = self.log_combo.currentIndex() == 1
        if self.cum_mode.currentIndex() == 0:
            cum = cumulative(self.prices)
            stocks = [c for c in cum if c != BENCHMARK]
            colors = self.series_colors(stocks)
            for c in stocks:
                ax.plot(cum.index, cum[c] / 100 + 1 if log else cum[c], lw=1, color=colors[c], label=c)
            bench = cum[BENCHMARK]
        else:
            themes = theme_returns(self.prices, self.members)
            for theme in themes:
                idx = themes[theme]
                ax.plot(idx.index, idx if log else (idx - 1) * 100, lw=1.6,
                        color=THEME_COLORS.get(theme, TEXT), label=theme)
            bench = cumulative(self.prices[[BENCHMARK]])[BENCHMARK]
        ax.plot(bench.index, bench / 100 + 1 if log else bench, lw=2.2, color=BENCH_COLOR,
                ls="--", label="S&P 500")
        if log:
            ax.set_yscale("log")
            ax.set_ylabel("성장 배수 (시작=1, 로그)", color=MUTED)
        else:
            ax.axhline(0, color=MUTED, lw=0.8)
            ax.set_ylabel("누적 수익률 (%)", color=MUTED)
        ax.set_title("누적 수익률 (각 종목은 첫 거래일 기준)" if self.cum_mode.currentIndex() == 0
                     else "테마별 동일가중 평균 누적 수익률", color=TEXT, fontsize=11)
        legend(ax)
        self.cum_canvas.draw()

    def draw_drawdown(self):
        ax = self.dd_canvas.new_axes()
        themes = theme_returns(self.prices, self.members)
        for theme in themes:
            ax.plot(themes.index, drawdown(themes[theme]) * 100, lw=1.2,
                    color=THEME_COLORS.get(theme, TEXT), label=f"{theme} 평균")
        bench = drawdown(self.prices[BENCHMARK].dropna()) * 100
        ax.fill_between(bench.index, bench, 0, color=BENCH_COLOR, alpha=0.12)
        ax.plot(bench.index, bench, lw=1.4, color=BENCH_COLOR, ls="--", label="S&P 500")
        ax.set_ylabel("고점 대비 (%)", color=MUTED)
        ax.set_title("고점 대비 낙폭 (테마 평균 vs S&P 500)", color=TEXT, fontsize=11)
        legend(ax, "lower left")
        self.dd_canvas.draw()

    def draw_correlation(self):
        # 테마 순서대로 정렬해 같은 테마끼리 블록으로 보이게 함
        order = [t for ts in self.members.values() for t in ts if t in self.prices] + [BENCHMARK]
        corr = correlation(self.prices[order])
        labels = ["S&P500" if c == BENCHMARK else c for c in order]
        ax = self.corr_canvas.new_axes()
        ax.grid(False)
        im = ax.imshow(corr.values, cmap="RdBu_r", vmin=-1, vmax=1)
        ax.set_xticks(range(len(labels)), labels, rotation=90)
        ax.set_yticks(range(len(labels)), labels)
        for lbl, t in zip(ax.get_yticklabels(), order):
            lbl.set_color(THEME_COLORS.get(self.theme_of(t), BENCH_COLOR))
        for lbl, t in zip(ax.get_xticklabels(), order):
            lbl.set_color(THEME_COLORS.get(self.theme_of(t), BENCH_COLOR))
        if len(order) <= 16:
            for i in range(len(order)):
                for j in range(len(order)):
                    v = corr.values[i, j]
                    ax.text(j, i, f"{v:.2f}", ha="center", va="center", fontsize=6.5,
                            color="#0A0F1C" if abs(v) < 0.6 else "#FFFFFF")
        cbar = self.corr_canvas.fig.colorbar(im, ax=ax, fraction=0.04)
        cbar.ax.tick_params(colors=MUTED, labelsize=8)
        off_diag = corr.values[~np.eye(len(order), dtype=bool)]
        ax.set_title(f"일간 수익률 상관계수 (평균 {off_diag.mean():.2f}, 1에 가까울수록 함께 움직임)",
                     color=TEXT, fontsize=11)
        self.corr_canvas.draw()

    # ── 성과 지표 표 ──────────────────────────────────────
    def refresh_metrics(self):
        if self.prices is None:
            return
        self.metrics = compute_metrics(self.prices, self.rf_spin.value() / 100)
        self.table.setSortingEnabled(False)
        self.table.setRowCount(len(self.metrics))
        signed = {"기간수익률(%)", "CAGR(%)"}
        for row, (ticker, m) in enumerate(self.metrics.iterrows()):
            theme = self.theme_of(ticker)
            cells = [SortItem(ticker, ticker), SortItem(self.name_of(ticker), self.name_of(ticker)),
                     SortItem(theme, theme)]
            cells[2].setForeground(QColor(THEME_COLORS.get(theme, BENCH_COLOR)))
            for col in METRIC_COLUMNS:
                v = m[col]
                if col == "시작일":
                    item = SortItem(v, v)
                elif v != v:  # NaN
                    item = SortItem("-", -1e18)
                else:
                    text = f"{v:+,.1f}" if col in signed else f"{v:,.2f}" if col in ("샤프", "베타", "S&P 상관") \
                        else f"{v:,.1f}"
                    item = SortItem(text, v)
                    if col in signed or col == "MDD(%)":
                        item.setForeground(QColor(RISE if v > 0 else FALL if v < 0 else TEXT))
                item.setTextAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
                cells.append(item)
            if ticker == BENCHMARK:
                for c in cells:
                    font = c.font()
                    font.setBold(True)
                    c.setFont(font)
            for col, item in enumerate(cells):
                self.table.setItem(row, col, item)
        self.table.setSortingEnabled(True)
        self.table.sortItems(METRIC_COLUMNS.index("CAGR(%)") + 3, Qt.SortOrder.DescendingOrder)
        self.save_btn.setEnabled(True)

    def open_quote(self, row, _col):
        ticker = self.table.item(row, 0).text()
        QDesktopServices.openUrl(QUrl(QUOTE_URL.format(ticker)))

    def save_csv(self):
        path, _ = QFileDialog.getSaveFileName(self, "CSV 저장", "sp500_theme_metrics.csv", "CSV (*.csv)")
        if not path:
            return
        out = self.metrics.copy()
        out.insert(0, "테마", [self.theme_of(t) for t in out.index])
        out.insert(0, "기업명", [self.name_of(t) for t in out.index])
        out.index.name = "티커"
        out.round(3).to_csv(path, encoding="utf-8-sig")
        self.statusBar().showMessage(f"저장 완료: {path}")

    def closeEvent(self, event):
        if self.worker and self.worker.isRunning():
            self.worker.wait(3000)
        super().closeEvent(event)


def main():
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLE)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
