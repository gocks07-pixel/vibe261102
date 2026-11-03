"""
컬리 후기 감성 분석기 - PyQt6 GUI

- 상품 URL과 수집 개수(기본 100개), 정렬(추천순/최신순)을 고르고 [수집·분석]을 누르면
  백그라운드 스레드에서 후기를 수집하고 Pandas로 감성(긍정/부정/중립)을 분석합니다.
- 왼쪽: 감성 비율 파이차트(마우스를 올리면 개수 표시) + 긍정/부정 키워드 빈도 막대차트
- 오른쪽: 후기 표(감성 필터) — 행을 선택하면 아래에 전문과 매칭된 키워드가 표시됩니다.
- [CSV 저장] / [차트 저장]으로 결과를 파일로 저장할 수 있습니다.

설치: pip install PyQt6 pandas matplotlib requests
실행: python kurly_review_gui.py
"""

import sys

import matplotlib.pyplot as plt
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from matplotlib.figure import Figure
from PyQt6.QtCore import QRectF, QThread, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QIcon, QPainter, QPen, QPixmap
from PyQt6.QtWidgets import (
    QAbstractItemView, QApplication, QComboBox, QFileDialog, QFrame, QHBoxLayout,
    QHeaderView, QLabel, QLineEdit, QMainWindow, QMessageBox, QProgressBar, QPushButton,
    QSpinBox, QSplitter, QTableWidget, QTableWidgetItem, QTextBrowser, QVBoxLayout, QWidget,
)

from kurly_review import SORT_TYPES, build_dataframe, fetch_reviews, parse_goods_no, summarize

plt.rcParams["font.family"] = "Malgun Gothic"  # 차트 한글 폰트 (Windows)
plt.rcParams["axes.unicode_minus"] = False

DEFAULT_URL = "https://www.kurly.com/goods/5029524?collectionCode=2611-blackweek-home-01"
COLUMNS = ["감성", "작성일", "옵션", "내용"]

# ── 색상 ─────────────────────────────────────────────
BG = "#F6F4F8"
PANEL = "#FFFFFF"
BORDER = "#E4DEEA"
TEXT = "#1F1A24"
MUTED = "#6B6475"
ACCENT = "#5F0080"       # 버튼·강조용 보라
SURFACE = "#FCFCFB"      # 차트 배경
# 감성 색: 긍정(파랑) ↔ 부정(빨강), 중립은 회색 — 색만으로 구분하지 않도록 차트에 라벨을 함께 표시
SENTIMENT_COLORS = {"긍정": "#2A78D6", "부정": "#E34948", "중립": "#B5B3AD"}
ROW_TINT = {"긍정": "#EAF2FC", "부정": "#FDECEC", "중립": "#F3F2F0"}

STYLE = f"""
QWidget {{ color: {TEXT}; font-family: "Malgun Gothic", "맑은 고딕", sans-serif; font-size: 10pt; }}
QMainWindow, QWidget#root {{ background: {BG}; }}
QLabel#title {{ font-size: 17pt; font-weight: 700; color: {ACCENT}; }}
QLabel#muted {{ color: {MUTED}; font-size: 9pt; }}
QLabel#kpiTitle {{ color: {MUTED}; font-size: 9pt; }}
QLabel#kpiValue {{ font-size: 16pt; font-weight: 700; }}
QFrame#card {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 10px; }}
QLineEdit, QSpinBox, QComboBox {{
    background: {PANEL}; border: 1px solid {BORDER}; border-radius: 6px; padding: 6px 8px;
}}
QLineEdit:focus, QSpinBox:focus, QComboBox:focus {{ border: 1px solid {ACCENT}; }}
QPushButton {{
    background: {PANEL}; border: 1px solid {BORDER}; border-radius: 6px; padding: 7px 14px;
}}
QPushButton:hover {{ border-color: {ACCENT}; }}
QPushButton:disabled {{ color: #B0A8B8; }}
QPushButton#primary {{ background: {ACCENT}; color: white; border: none; font-weight: 700; }}
QPushButton#primary:hover {{ background: #4A0063; }}
QPushButton#primary:disabled {{ background: #C9B3D3; }}
QProgressBar {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 6px;
    text-align: center; height: 18px; }}
QProgressBar::chunk {{ background: #CDB4DB; border-radius: 5px; }}
QTableWidget {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 8px;
    gridline-color: {BORDER}; selection-background-color: #E9DDF0; selection-color: {TEXT}; }}
QHeaderView::section {{ background: #F1ECF5; border: none; border-bottom: 1px solid {BORDER};
    padding: 6px; font-weight: 600; color: {MUTED}; }}
QTextBrowser {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 8px; padding: 6px; }}
"""


def make_app_pixmap(size=64):
    """앱 아이콘: 긍정/부정/중립 비율을 나타내는 도넛 차트 모양."""
    pix = QPixmap(size, size)
    pix.fill(Qt.GlobalColor.transparent)
    p = QPainter(pix)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    p.setPen(Qt.PenStyle.NoPen)
    p.setBrush(QColor(ACCENT))
    p.drawRoundedRect(QRectF(0, 0, size, size), size * 0.22, size * 0.22)
    ring = QRectF(size * 0.16, size * 0.16, size * 0.68, size * 0.68)
    pen = QPen()
    pen.setWidthF(size * 0.14)
    pen.setCapStyle(Qt.PenCapStyle.FlatCap)
    start = 90 * 16  # 12시 방향부터 시계 방향으로 (Qt 각도 단위: 1/16도)
    for key, span in (("긍정", 250), ("부정", 50), ("중립", 60)):
        pen.setColor(QColor("#FFFFFF" if key == "긍정" else SENTIMENT_COLORS[key]))
        p.setPen(pen)
        p.drawArc(ring, start, -span * 16)
        start -= span * 16
    p.end()
    return pix


class CrawlWorker(QThread):
    """후기 수집 + 분석을 백그라운드에서 실행합니다."""
    progress = pyqtSignal(int, int)
    finished_ok = pyqtSignal(object)
    failed = pyqtSignal(str)

    def __init__(self, goods_no, limit, sort):
        super().__init__()
        self.goods_no, self.limit, self.sort = goods_no, limit, sort

    def run(self):
        try:
            reviews = fetch_reviews(self.goods_no, self.limit, self.sort, progress=self.progress.emit)
            if not reviews:
                raise RuntimeError("수집된 후기가 없습니다.")
            self.finished_ok.emit(build_dataframe(reviews))
        except Exception as e:  # 네트워크/파싱 오류를 GUI에 표시
            self.failed.emit(str(e))


class KpiCard(QFrame):
    def __init__(self, title, color=TEXT):
        super().__init__()
        self.setObjectName("card")
        lay = QVBoxLayout(self)
        lay.setContentsMargins(14, 10, 14, 10)
        t = QLabel(title)
        t.setObjectName("kpiTitle")
        self.value = QLabel("-")
        self.value.setObjectName("kpiValue")
        self.value.setStyleSheet(f"color: {color};")
        self.sub = QLabel("")
        self.sub.setObjectName("muted")
        lay.addWidget(t)
        lay.addWidget(self.value)
        lay.addWidget(self.sub)

    def set(self, value, sub=""):
        self.value.setText(value)
        self.sub.setText(sub)


class ChartPanel(FigureCanvasQTAgg):
    """감성 비율 파이차트 + 긍정/부정 키워드 막대차트."""

    def __init__(self):
        self.fig = Figure(figsize=(6, 7), facecolor=SURFACE)
        super().__init__(self.fig)
        self.wedges, self.wedge_info = [], []
        self.tooltip = None
        self.mpl_connect("motion_notify_event", self.on_hover)
        self.draw_empty()

    def draw_empty(self):
        self.fig.clear()
        self.fig.text(0.5, 0.5, "[수집·분석]을 누르면\n감성 분석 차트가 표시됩니다.",
                      ha="center", va="center", color=MUTED, fontsize=12)
        self.draw_idle()

    def plot(self, info):
        self.fig.clear()
        gs = self.fig.add_gridspec(2, 2, height_ratios=[1.35, 1], hspace=0.45, wspace=0.55,
                                   left=0.2, right=0.95, top=0.92, bottom=0.07)
        self._plot_pie(self.fig.add_subplot(gs[0, :]), info)
        self._plot_words(self.fig.add_subplot(gs[1, 0]), info["pos_words"], "긍정", "긍정 키워드 Top")
        self._plot_words(self.fig.add_subplot(gs[1, 1]), info["neg_words"], "부정", "부정 키워드 Top")
        self.draw_idle()

    def _plot_pie(self, ax, info):
        counts = info["counts"][info["counts"] > 0]
        labels = list(counts.index)
        colors = [SENTIMENT_COLORS[k] for k in labels]
        self.wedges, _, autotexts = ax.pie(
            counts.values, labels=[f"{k}\n{counts[k]}건" for k in labels], colors=colors,
            autopct=lambda p: f"{p:.1f}%" if p >= 5 else "",  # 작은 조각은 바깥 라벨만 표시
            startangle=90, counterclock=False, pctdistance=0.78,
            wedgeprops={"width": 0.42, "edgecolor": SURFACE, "linewidth": 2},
            textprops={"color": TEXT, "fontsize": 10},
        )
        for t in autotexts:
            t.set_color("white")
            t.set_fontweight("bold")
            t.set_fontsize(9)
        self.wedge_info = [(k, counts[k], info["ratio"][k]) for k in labels]
        ax.text(0, 0.08, f"{info['total']}", ha="center", va="center",
                fontsize=20, fontweight="bold", color=TEXT)
        ax.text(0, -0.18, "수집 후기", ha="center", va="center", fontsize=9, color=MUTED)
        ax.set_title("후기 감성 비율 (긍정 vs 부정)", fontsize=12, fontweight="bold", color=TEXT, pad=12)
        ax.legend(self.wedges, [f"{k} {info['ratio'][k]}%" for k in labels], loc="lower left",
                  bbox_to_anchor=(-0.45, -0.05), frameon=False, fontsize=9)
        ax.set_aspect("equal")
        self.tooltip = ax.annotate("", xy=(0, 0), xytext=(0, 0), ha="center", fontsize=9,
                                   bbox={"boxstyle": "round,pad=0.4", "fc": "white", "ec": BORDER})
        self.tooltip.set_visible(False)

    def _plot_words(self, ax, words, sentiment, title):
        ax.set_title(title, fontsize=10, fontweight="bold", color=TEXT, loc="left")
        ax.set_facecolor(SURFACE)
        for side in ("top", "right", "left"):
            ax.spines[side].set_visible(False)
        ax.spines["bottom"].set_color(BORDER)
        ax.tick_params(colors=MUTED, labelsize=8, length=0)
        if not words:
            ax.set_xticks([])
            ax.set_yticks([])
            ax.text(0.5, 0.5, "해당 키워드 없음", transform=ax.transAxes,
                    ha="center", va="center", color=MUTED, fontsize=9)
            return
        names = [w for w, _ in words][::-1]
        values = [c for _, c in words][::-1]
        bars = ax.barh(names, values, color=SENTIMENT_COLORS[sentiment], height=0.6)
        ax.bar_label(bars, padding=3, fontsize=8, color=MUTED)
        ax.set_xlim(0, max(values) * 1.25)
        ax.xaxis.grid(True, color=BORDER, linewidth=0.6)
        ax.set_axisbelow(True)
        for label in ax.get_yticklabels():
            label.set_color(TEXT)

    def on_hover(self, event):
        if not self.tooltip or event.inaxes is None:
            return
        for wedge, (label, count, ratio) in zip(self.wedges, self.wedge_info):
            hit, _ = wedge.contains(event)
            wedge.set_alpha(1.0 if hit or not any(w.contains(event)[0] for w in self.wedges) else 0.45)
            if hit:
                self.tooltip.xy = (event.xdata, event.ydata)
                self.tooltip.set_text(f"{label}  {count}건 ({ratio}%)")
                self.tooltip.set_visible(True)
                self.draw_idle()
                return
        if self.tooltip.get_visible():
            self.tooltip.set_visible(False)
            self.draw_idle()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("컬리 후기 감성 분석기")
        self.setWindowIcon(QIcon(make_app_pixmap(64)))
        self.resize(1320, 860)
        self.df = None
        self.worker = None

        root = QWidget()
        root.setObjectName("root")
        self.setCentralWidget(root)
        outer = QVBoxLayout(root)
        outer.setContentsMargins(18, 14, 18, 14)
        outer.setSpacing(10)

        title = QLabel("컬리 후기 감성 분석기")
        title.setObjectName("title")
        sub = QLabel("상품 후기를 수집해 긍정·부정 의견을 Pandas로 분석하고 파이차트로 보여줍니다.")
        sub.setObjectName("muted")
        outer.addWidget(title)
        outer.addWidget(sub)

        # 입력 줄
        bar = QHBoxLayout()
        self.url_edit = QLineEdit(DEFAULT_URL)
        self.url_edit.setPlaceholderText("컬리 상품 URL 또는 상품번호")
        self.url_edit.returnPressed.connect(self.start)
        self.count_spin = QSpinBox()
        self.count_spin.setRange(10, 1000)
        self.count_spin.setSingleStep(10)
        self.count_spin.setValue(100)
        self.count_spin.setSuffix(" 개")
        self.sort_combo = QComboBox()
        self.sort_combo.addItems(SORT_TYPES.keys())
        self.run_btn = QPushButton("수집·분석")
        self.run_btn.setObjectName("primary")
        self.run_btn.clicked.connect(self.start)
        bar.addWidget(QLabel("상품"))
        bar.addWidget(self.url_edit, 1)
        bar.addWidget(QLabel("개수"))
        bar.addWidget(self.count_spin)
        bar.addWidget(self.sort_combo)
        bar.addWidget(self.run_btn)
        outer.addLayout(bar)

        self.progress = QProgressBar()
        self.progress.setFormat("대기 중")
        self.progress.setValue(0)
        outer.addWidget(self.progress)

        # KPI 카드
        kpis = QHBoxLayout()
        self.kpi_total = KpiCard("수집 후기")
        self.kpi_pos = KpiCard("긍정", SENTIMENT_COLORS["긍정"])
        self.kpi_neg = KpiCard("부정", SENTIMENT_COLORS["부정"])
        self.kpi_neu = KpiCard("중립", MUTED)
        for card in (self.kpi_total, self.kpi_pos, self.kpi_neg, self.kpi_neu):
            kpis.addWidget(card)
        outer.addLayout(kpis)

        # 본문: 차트 | 표 + 상세
        splitter = QSplitter(Qt.Orientation.Horizontal)
        chart_card = QFrame()
        chart_card.setObjectName("card")
        cl = QVBoxLayout(chart_card)
        cl.setContentsMargins(6, 6, 6, 6)
        self.chart = ChartPanel()
        cl.addWidget(self.chart)
        splitter.addWidget(chart_card)

        right = QWidget()
        rl = QVBoxLayout(right)
        rl.setContentsMargins(0, 0, 0, 0)
        tools = QHBoxLayout()
        tools.addWidget(QLabel("감성 필터"))
        self.filter_combo = QComboBox()
        self.filter_combo.addItems(["전체", "긍정", "부정", "중립"])
        self.filter_combo.currentTextChanged.connect(self.fill_table)
        tools.addWidget(self.filter_combo)
        self.row_label = QLabel("")
        self.row_label.setObjectName("muted")
        tools.addWidget(self.row_label)
        tools.addStretch()
        self.csv_btn = QPushButton("CSV 저장")
        self.csv_btn.clicked.connect(self.save_csv)
        self.png_btn = QPushButton("차트 저장")
        self.png_btn.clicked.connect(self.save_png)
        for b in (self.csv_btn, self.png_btn):
            b.setEnabled(False)
            tools.addWidget(b)
        rl.addLayout(tools)

        self.table = QTableWidget(0, len(COLUMNS))
        self.table.setHorizontalHeaderLabels(COLUMNS)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        hdr = self.table.horizontalHeader()
        hdr.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        hdr.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        hdr.setSectionResizeMode(2, QHeaderView.ResizeMode.Interactive)
        hdr.setSectionResizeMode(3, QHeaderView.ResizeMode.Stretch)
        self.table.setColumnWidth(2, 170)
        self.table.itemSelectionChanged.connect(self.show_detail)

        self.detail = QTextBrowser()
        self.detail.setPlaceholderText("표에서 후기를 선택하면 전문과 분석 근거가 표시됩니다.")
        vsplit = QSplitter(Qt.Orientation.Vertical)
        vsplit.addWidget(self.table)
        vsplit.addWidget(self.detail)
        vsplit.setSizes([520, 180])
        rl.addWidget(vsplit)
        splitter.addWidget(right)
        splitter.setSizes([560, 740])
        outer.addWidget(splitter, 1)

    # ── 수집 ────────────────────────────────────────
    def start(self):
        if self.worker and self.worker.isRunning():
            return
        try:
            goods_no = parse_goods_no(self.url_edit.text())
        except ValueError as e:
            QMessageBox.warning(self, "입력 확인", str(e))
            return
        self.run_btn.setEnabled(False)
        self.progress.setRange(0, self.count_spin.value())
        self.progress.setValue(0)
        self.progress.setFormat(f"상품 {goods_no} 후기 수집 중... %v / %m")
        self.worker = CrawlWorker(goods_no, self.count_spin.value(),
                                  SORT_TYPES[self.sort_combo.currentText()])
        self.worker.progress.connect(lambda n, t: self.progress.setValue(n))
        self.worker.finished_ok.connect(self.on_done)
        self.worker.failed.connect(self.on_failed)
        self.worker.start()

    def on_failed(self, msg):
        self.run_btn.setEnabled(True)
        self.progress.setFormat("실패")
        QMessageBox.critical(self, "수집 실패", msg)

    def on_done(self, df):
        self.run_btn.setEnabled(True)
        self.df = df
        info = summarize(df)
        self.progress.setRange(0, 1)
        self.progress.setValue(1)
        start, end = info["period"]
        self.progress.setFormat(f"완료 — 후기 {info['total']}개 ({start:%Y-%m-%d} ~ {end:%Y-%m-%d})")

        self.kpi_total.set(f"{info['total']}개", f"평균 {df['글자수'].mean():.0f}자")
        for card, key in ((self.kpi_pos, "긍정"), (self.kpi_neg, "부정"), (self.kpi_neu, "중립")):
            card.set(f"{info['ratio'][key]}%", f"{info['counts'][key]}건")
        self.chart.plot(info)
        self.fill_table()
        self.csv_btn.setEnabled(True)
        self.png_btn.setEnabled(True)

    # ── 표 / 상세 ───────────────────────────────────
    def fill_table(self, *_):
        if self.df is None:
            return
        choice = self.filter_combo.currentText()
        view = self.df if choice == "전체" else self.df[self.df["감성"] == choice]
        self.view = view.reset_index(drop=True)
        self.table.setRowCount(len(self.view))
        for i, row in self.view.iterrows():
            date = row["작성일"].strftime("%Y-%m-%d") if row["작성일"] == row["작성일"] else ""
            values = [row["감성"], date, row["옵션"] or "", row["내용"].replace("\n", " ")]
            for j, v in enumerate(values):
                item = QTableWidgetItem(str(v))
                item.setBackground(QColor(ROW_TINT[row["감성"]]))
                if j == 0:
                    item.setForeground(QColor(SENTIMENT_COLORS[row["감성"]] if row["감성"] != "중립" else MUTED))
                    item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                self.table.setItem(i, j, item)
        self.row_label.setText(f"{len(self.view)}건")
        self.detail.clear()

    def show_detail(self):
        rows = self.table.selectionModel().selectedRows()
        if not rows:
            return
        r = self.view.iloc[rows[0].row()]
        color = SENTIMENT_COLORS[r["감성"]]
        body = r["내용"].replace("&", "&amp;").replace("<", "&lt;").replace("\n", "<br>")
        self.detail.setHtml(
            f"<b style='color:{color}'>[{r['감성']}]</b> "
            f"<span style='color:{MUTED}'>{r['작성자']} · {r['등급']} · 도움돼요 {r['도움돼요']} · {r['옵션']}</span>"
            f"<p style='margin-top:8px'>{body}</p>"
            f"<p style='color:{MUTED}'>점수 {r['감성점수']:+d} &nbsp; "
            f"긍정: {r['긍정키워드'] or '-'} &nbsp;|&nbsp; 부정: {r['부정키워드'] or '-'}</p>"
        )

    # ── 저장 ────────────────────────────────────────
    def save_csv(self):
        path, _ = QFileDialog.getSaveFileName(self, "CSV 저장", "kurly_reviews.csv", "CSV (*.csv)")
        if path:
            self.df.to_csv(path, index=False, encoding="utf-8-sig")
            QMessageBox.information(self, "저장 완료", f"저장했습니다.\n{path}")

    def save_png(self):
        path, _ = QFileDialog.getSaveFileName(self, "차트 저장", "kurly_sentiment.png", "PNG (*.png)")
        if path:
            self.chart.fig.savefig(path, dpi=150, facecolor=SURFACE)
            QMessageBox.information(self, "저장 완료", f"저장했습니다.\n{path}")


def main():
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLE)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
