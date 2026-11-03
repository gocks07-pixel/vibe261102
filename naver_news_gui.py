"""
반도체 뉴스 레이더 - 네이버 뉴스 크롤러 PyQt6 GUI

- 검색어, 페이지 수, 본문 수집 여부를 입력하고 [크롤링 시작]을 누르면
  백그라운드 스레드에서 수집하며 결과가 표에 바로바로 추가됩니다.
- 상단의 반도체 키워드 버튼(HBM, 파운드리, TSMC 등)으로 바로 검색할 수 있습니다.
- 기사는 제목/요약의 키워드로 분야(메모리, 파운드리, AI칩, 장비·소재, 증시, 정책)를 자동 분류합니다.
- 표에서 기사를 선택하면 아래에 요약/본문이 키워드 강조와 함께 표시되고,
  더블클릭하면 브라우저로 기사 원문을 엽니다.
- [CSV 저장] / [엑셀 저장]으로 결과를 파일로 저장할 수 있습니다.

설치: pip install PyQt6 requests beautifulsoup4 openpyxl
실행: python naver_news_gui.py
"""

import re
import sys
from html import escape

from PyQt6.QtCore import QRectF, QThread, QUrl, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QDesktopServices, QFont, QIcon, QPainter, QPen, QPixmap
from PyQt6.QtWidgets import (
    QAbstractItemView, QApplication, QCheckBox, QFileDialog, QFrame, QHBoxLayout,
    QHeaderView, QLabel, QLineEdit, QMainWindow, QMessageBox, QPlainTextEdit,
    QProgressBar, QPushButton, QSpinBox, QSplitter, QTableWidget, QTableWidgetItem,
    QTextBrowser, QVBoxLayout, QWidget,
)

from naver_news_crawler import crawl, save_csv, save_excel

COLUMNS = ["분야", "언론사", "제목", "작성일시"]

# 빠른 검색 키워드
QUICK_KEYWORDS = ["반도체", "HBM", "파운드리", "삼성전자 반도체", "SK하이닉스",
                  "TSMC", "엔비디아", "AI 반도체", "반도체 장비"]

# 분야 자동 분류: (분야, 색상, 키워드) - 위에서부터 먼저 일치하는 분야로 분류
CATEGORIES = [
    ("메모리", "#38BDF8", ["HBM", "D램", "DRAM", "낸드", "NAND", "메모리"]),
    ("파운드리", "#A78BFA", ["파운드리", "TSMC", "나노", "공정", "2nm", "3nm"]),
    ("AI칩", "#F472B6", ["엔비디아", "GPU", "NPU", "AI 반도체", "AI반도체", "AI칩", "AI 칩"]),
    ("장비·소재", "#FBBF24", ["장비", "소재", "ASML", "노광", "웨이퍼", "부품"]),
    ("증시", "#F87171", ["주가", "증시", "나스닥", "코스피", "급락", "급등", "ETF", "특징주", "시가총액",
                               "목표가", "목표주가", "증권", "투자의견", "주주"]),
    ("정책", "#34D399", ["정부", "특구", "산단", "클러스터", "보조금", "관세", "수출", "법안", "규제"]),
]
DEFAULT_CATEGORY = ("일반", "#94A3B8")

# 본문에서 강조할 업계 키워드 (검색어는 별도로 강조)
HIGHLIGHT_WORDS = ["삼성전자", "SK하이닉스", "TSMC", "엔비디아", "인텔", "마이크론",
                   "ASML", "AMD", "퀄컴", "애플", "HBM", "D램", "낸드", "파운드리"]

# ── 색상 (회로 기판 느낌의 다크 테마) ─────────────────────
BG = "#0A0F1C"
PANEL = "#111827"
PANEL_2 = "#0F172A"
BORDER = "#1F2A44"
TEXT = "#E2E8F0"
MUTED = "#8B9BB4"
ACCENT = "#22D3EE"      # 실리콘 웨이퍼 시안
ACCENT_DARK = "#0891B2"
DANGER = "#F87171"

STYLE = f"""
QMainWindow, QWidget#central {{ background: {BG}; }}
QWidget {{ color: {TEXT}; font-family: "Malgun Gothic", "맑은 고딕", sans-serif; font-size: 10pt; }}
QLabel#title {{ font-size: 18pt; font-weight: 700; color: #FFFFFF; }}
QLabel#subtitle {{ color: {MUTED}; font-size: 9pt; letter-spacing: 1px; }}
QLabel#sectionLabel {{ color: {MUTED}; font-size: 9pt; }}
QFrame#header {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #0B1A2E, stop:0.6 #0E2238, stop:1 #0A2A3A);
    border: 1px solid {BORDER}; border-radius: 10px;
}}
QFrame#statCard {{ background: rgba(34, 211, 238, 0.07); border: 1px solid #1E3A4C; border-radius: 8px; }}
QLabel#statValue {{ font-size: 16pt; font-weight: 700; color: {ACCENT}; }}
QLabel#statName {{ color: {MUTED}; font-size: 8.5pt; }}
QFrame#panel {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 10px; }}

QLineEdit, QSpinBox {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 6px 8px; selection-background-color: {ACCENT_DARK};
}}
QLineEdit:focus, QSpinBox:focus {{ border: 1px solid {ACCENT}; }}
QLineEdit:disabled, QSpinBox:disabled {{ color: {MUTED}; }}
QCheckBox {{ spacing: 6px; }}
QCheckBox::indicator {{ width: 16px; height: 16px; border-radius: 4px; border: 1px solid {BORDER}; background: {PANEL_2}; }}
QCheckBox::indicator:checked {{ background: {ACCENT}; border: 1px solid {ACCENT}; }}

QPushButton {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 7px 14px; color: {TEXT};
}}
QPushButton:hover {{ border: 1px solid {ACCENT}; color: #FFFFFF; }}
QPushButton:disabled {{ color: #4B5874; border: 1px solid #1A2236; }}
QPushButton#primary {{ background: {ACCENT}; color: #04202A; border: none; font-weight: 700; }}
QPushButton#primary:hover {{ background: #67E8F9; }}
QPushButton#primary:disabled {{ background: #164E5C; color: #5B8A96; }}
QPushButton#danger {{ border: 1px solid #7F2D2D; color: {DANGER}; }}
QPushButton#danger:hover {{ background: #2A1418; }}
QPushButton#danger:disabled {{ color: #4B5874; border: 1px solid #1A2236; }}
QPushButton#chip {{
    background: transparent; border: 1px solid #1E3A4C; border-radius: 10px;
    padding: 3px 12px; color: #9FE7F5; font-size: 9pt;
}}
QPushButton#chip:hover {{ background: rgba(34, 211, 238, 0.12); border: 1px solid {ACCENT}; }}
QPushButton#chip:disabled {{ color: #3E5566; border: 1px solid #16232E; }}

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
QTextBrowser {{ background: {PANEL}; border: none; padding: 6px; }}
QPlainTextEdit#log {{
    background: #050A14; border: none; color: #5EEAD4;
    font-family: Consolas, "D2Coding", monospace; font-size: 9pt; padding: 6px;
}}
QProgressBar {{ background: {PANEL_2}; border: none; border-radius: 2px; max-height: 4px; }}
QProgressBar::chunk {{ background: {ACCENT}; border-radius: 2px; }}
QSplitter::handle {{ background: {BG}; }}
QScrollBar:vertical {{ background: transparent; width: 10px; margin: 2px; }}
QScrollBar::handle:vertical {{ background: #24324F; border-radius: 4px; min-height: 30px; }}
QScrollBar::handle:vertical:hover {{ background: {ACCENT_DARK}; }}
QScrollBar::add-line, QScrollBar::sub-line {{ height: 0; }}
QStatusBar {{ background: {PANEL_2}; color: {MUTED}; border-top: 1px solid {BORDER}; }}
"""


def make_chip_pixmap(size=64):
    """반도체 칩 모양 아이콘을 직접 그린다 (외부 이미지 파일 불필요)."""
    pix = QPixmap(size, size)
    pix.fill(Qt.GlobalColor.transparent)
    p = QPainter(pix)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    s = size / 64

    # 칩 다리(핀)
    p.setPen(QPen(QColor(ACCENT), 3 * s, cap=Qt.PenCapStyle.RoundCap))
    for i in range(4):
        x = (20 + i * 8) * s
        p.drawLine(int(x), int(4 * s), int(x), int(14 * s))
        p.drawLine(int(x), int(50 * s), int(x), int(60 * s))
        p.drawLine(int(4 * s), int(x), int(14 * s), int(x))
        p.drawLine(int(50 * s), int(x), int(60 * s), int(x))

    # 칩 몸체
    p.setPen(QPen(QColor(ACCENT), 2 * s))
    p.setBrush(QColor("#0E2238"))
    p.drawRoundedRect(QRectF(14 * s, 14 * s, 36 * s, 36 * s), 5 * s, 5 * s)
    # 다이(내부 코어)
    p.setBrush(QColor(ACCENT))
    p.setPen(Qt.PenStyle.NoPen)
    p.drawRoundedRect(QRectF(24 * s, 24 * s, 16 * s, 16 * s), 2 * s, 2 * s)
    p.end()
    return pix


def classify(article):
    """제목/요약에 포함된 키워드로 기사 분야를 분류."""
    text = f"{article['title']} {article['summary']}"
    for name, color, words in CATEGORIES:
        if any(w.lower() in text.lower() for w in words):
            return name, color
    return DEFAULT_CATEGORY


def highlight(text, query):
    """HTML 이스케이프 후 검색어와 업계 키워드를 색으로 강조."""
    html = escape(text)
    words = [w for w in query.split() if w]
    if words:
        pattern = "|".join(re.escape(escape(w)) for w in sorted(words, key=len, reverse=True))
        html = re.sub(pattern, lambda m: f'<span style="background:#164E5C;color:#FFFFFF;">{m.group(0)}</span>', html)
    pattern = "|".join(re.escape(w) for w in sorted(HIGHLIGHT_WORDS, key=len, reverse=True))
    return re.sub(rf"(?<![\w>])({pattern})", rf'<b style="color:{ACCENT};">\1</b>', html)


class CrawlWorker(QThread):
    """크롤링을 백그라운드에서 실행해 GUI가 멈추지 않도록 하는 스레드."""

    article_found = pyqtSignal(dict)
    log_message = pyqtSignal(str)
    finished_with_count = pyqtSignal(int)
    failed = pyqtSignal(str)

    def __init__(self, query, pages, with_body):
        super().__init__()
        self.query = query
        self.pages = pages
        self.with_body = with_body
        self._stop = False

    def stop(self):
        self._stop = True

    def run(self):
        try:
            results = crawl(
                self.query,
                pages=self.pages,
                with_body=self.with_body,
                log=self.log_message.emit,
                on_article=self.article_found.emit,
                should_stop=lambda: self._stop,
            )
            self.finished_with_count.emit(len(results))
        except Exception as e:  # 네트워크 오류 등은 메시지 박스로 알림
            self.failed.emit(str(e))


class StatCard(QFrame):
    """헤더 오른쪽의 숫자 카드 (수집 기사 / 언론사 / 분야)."""

    def __init__(self, name):
        super().__init__()
        self.setObjectName("statCard")
        self.setMinimumWidth(96)
        self.value = QLabel("0")
        self.value.setObjectName("statValue")
        label = QLabel(name)
        label.setObjectName("statName")
        layout = QVBoxLayout(self)
        layout.setContentsMargins(14, 8, 14, 8)
        layout.setSpacing(0)
        layout.addWidget(self.value)
        layout.addWidget(label)

    def set(self, value):
        self.value.setText(str(value))


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("반도체 뉴스 레이더")
        self.setWindowIcon(QIcon(make_chip_pixmap(64)))
        self.resize(1200, 820)
        self.articles = []
        self.worker = None
        self.current_query = ""

        # ── 헤더: 칩 아이콘 + 제목 + 통계 카드 ──────────────
        icon = QLabel()
        icon.setPixmap(make_chip_pixmap(52))
        title = QLabel("반도체 뉴스 레이더")
        title.setObjectName("title")
        subtitle = QLabel("SEMICONDUCTOR NEWS MONITOR  ·  NAVER NEWS")
        subtitle.setObjectName("subtitle")
        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        title_box.addWidget(title)
        title_box.addWidget(subtitle)

        self.stat_total = StatCard("수집 기사")
        self.stat_press = StatCard("언론사")
        self.stat_top = StatCard("주요 분야")
        self.stat_top.set("-")

        header = QFrame()
        header.setObjectName("header")
        h = QHBoxLayout(header)
        h.setContentsMargins(18, 14, 18, 14)
        h.setSpacing(14)
        h.addWidget(icon)
        h.addLayout(title_box)
        h.addStretch(1)
        h.addWidget(self.stat_total)
        h.addWidget(self.stat_press)
        h.addWidget(self.stat_top)

        # ── 검색 조건 ──────────────────────────────────
        self.query_edit = QLineEdit("반도체")
        self.query_edit.setPlaceholderText("검색어를 입력하세요 (예: HBM, 파운드리, SK하이닉스)")
        self.query_edit.returnPressed.connect(self.start_crawl)

        self.pages_spin = QSpinBox()
        self.pages_spin.setRange(1, 20)
        self.pages_spin.setValue(3)
        self.pages_spin.setSuffix(" 페이지")
        # 다크 테마에서 기본 화살표 버튼이 깨져 보여 숨기고, 휠/방향키로 조절
        self.pages_spin.setButtonSymbols(QSpinBox.ButtonSymbols.NoButtons)
        self.pages_spin.setMinimumWidth(90)
        self.pages_spin.setToolTip("마우스 휠 또는 ↑↓ 키로 페이지 수를 바꿀 수 있습니다 (1페이지 ≈ 10~20건)")

        self.body_check = QCheckBox("본문까지 수집")
        self.body_check.setChecked(True)

        self.start_btn = QPushButton("▶  크롤링 시작")
        self.start_btn.setObjectName("primary")
        self.start_btn.clicked.connect(self.start_crawl)
        self.stop_btn = QPushButton("■  중지")
        self.stop_btn.setObjectName("danger")
        self.stop_btn.setEnabled(False)
        self.stop_btn.clicked.connect(self.stop_crawl)
        self.save_btn = QPushButton("CSV 저장")
        self.save_btn.setEnabled(False)
        self.save_btn.clicked.connect(self.save_results)
        self.excel_btn = QPushButton("엑셀 저장")
        self.excel_btn.setEnabled(False)
        self.excel_btn.clicked.connect(self.save_excel_results)

        search_row = QHBoxLayout()
        search_row.setSpacing(8)
        search_row.addWidget(self.query_edit, 1)
        search_row.addWidget(self.pages_spin)
        search_row.addWidget(self.body_check)
        search_row.addWidget(self.start_btn)
        search_row.addWidget(self.stop_btn)
        search_row.addSpacing(10)
        search_row.addWidget(self.save_btn)
        search_row.addWidget(self.excel_btn)

        # 빠른 검색 키워드 칩
        chip_row = QHBoxLayout()
        chip_row.setSpacing(6)
        chip_label = QLabel("빠른 검색")
        chip_label.setObjectName("sectionLabel")
        chip_row.addWidget(chip_label)
        self.chips = []
        for word in QUICK_KEYWORDS:
            chip = QPushButton(word)
            chip.setObjectName("chip")
            chip.setCursor(Qt.CursorShape.PointingHandCursor)
            chip.clicked.connect(lambda _, w=word: self.quick_search(w))
            chip_row.addWidget(chip)
            self.chips.append(chip)
        chip_row.addStretch(1)

        self.progress = QProgressBar()
        self.progress.setTextVisible(False)
        self.progress.setRange(0, 1)
        self.progress.setValue(0)

        search_panel = QFrame()
        search_panel.setObjectName("panel")
        sp = QVBoxLayout(search_panel)
        sp.setContentsMargins(14, 12, 14, 10)
        sp.setSpacing(10)
        sp.addLayout(search_row)
        sp.addLayout(chip_row)
        sp.addWidget(self.progress)

        # ── 기사 목록 표 ───────────────────────────────
        self.table = QTableWidget(0, len(COLUMNS))
        self.table.setHorizontalHeaderLabels(COLUMNS)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(False)
        self.table.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.table.verticalHeader().setVisible(False)
        self.table.verticalHeader().setDefaultSectionSize(34)
        header_view = self.table.horizontalHeader()
        header_view.setDefaultAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        header_view.setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        header_view.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        header_view.setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        header_view.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        self.table.setColumnWidth(0, 90)
        self.table.itemSelectionChanged.connect(self.show_detail)
        self.table.cellDoubleClicked.connect(self.open_article)

        # ── 기사 상세 / 로그 ───────────────────────────
        self.detail = QTextBrowser()
        self.detail.setOpenExternalLinks(True)
        self.show_placeholder()
        self.log_view = QPlainTextEdit()
        self.log_view.setObjectName("log")
        self.log_view.setReadOnly(True)
        self.log_view.setMaximumBlockCount(1000)

        bottom = QSplitter(Qt.Orientation.Horizontal)
        bottom.addWidget(self.wrap_panel("기사 상세", self.detail))
        bottom.addWidget(self.wrap_panel("수집 로그", self.log_view))
        bottom.setSizes([860, 320])

        splitter = QSplitter(Qt.Orientation.Vertical)
        splitter.addWidget(self.wrap_panel("기사 목록  ·  더블클릭하면 원문이 열립니다", self.table))
        splitter.addWidget(bottom)
        splitter.setSizes([420, 300])

        layout = QVBoxLayout()
        layout.setContentsMargins(14, 14, 14, 10)
        layout.setSpacing(10)
        layout.addWidget(header)
        layout.addWidget(search_panel)
        layout.addWidget(splitter, 1)
        central = QWidget()
        central.setObjectName("central")
        central.setLayout(layout)
        self.setCentralWidget(central)
        self.statusBar().showMessage("검색어를 입력하거나 빠른 검색 키워드를 눌러 보세요.")

    @staticmethod
    def wrap_panel(title, widget):
        """제목이 붙은 둥근 패널로 위젯을 감싼다."""
        panel = QFrame()
        panel.setObjectName("panel")
        label = QLabel(title)
        label.setObjectName("sectionLabel")
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(10, 8, 10, 10)
        layout.setSpacing(6)
        layout.addWidget(label)
        layout.addWidget(widget)
        return panel

    def show_placeholder(self):
        self.detail.setHtml(
            f'<p style="color:{MUTED}; margin-top:40px;" align="center">'
            "표에서 기사를 선택하면 본문이 여기에 표시됩니다.</p>"
        )

    # ── 크롤링 제어 ────────────────────────────────────
    def quick_search(self, word):
        if self.worker and self.worker.isRunning():
            return
        self.query_edit.setText(word)
        self.start_crawl()

    def start_crawl(self):
        query = self.query_edit.text().strip()
        if not query:
            QMessageBox.warning(self, "알림", "검색어를 입력하세요.")
            return
        if self.worker and self.worker.isRunning():
            return

        self.current_query = query
        self.articles.clear()
        self.table.setRowCount(0)
        self.show_placeholder()
        self.log_view.clear()
        self.update_stats()
        self.set_running(True)
        self.statusBar().showMessage(f"'{query}' 수집 중...")

        self.worker = CrawlWorker(query, self.pages_spin.value(), self.body_check.isChecked())
        self.worker.article_found.connect(self.add_article)
        self.worker.log_message.connect(self.log_view.appendPlainText)
        self.worker.finished_with_count.connect(self.crawl_finished)
        self.worker.failed.connect(self.crawl_failed)
        self.worker.start()

    def stop_crawl(self):
        if self.worker:
            self.worker.stop()
            self.stop_btn.setEnabled(False)
            self.statusBar().showMessage("중지하는 중...")

    def set_running(self, running):
        self.start_btn.setEnabled(not running)
        self.stop_btn.setEnabled(running)
        self.query_edit.setEnabled(not running)
        self.pages_spin.setEnabled(not running)
        self.body_check.setEnabled(not running)
        for chip in self.chips:
            chip.setEnabled(not running)
        self.save_btn.setEnabled(not running and bool(self.articles))
        self.excel_btn.setEnabled(not running and bool(self.articles))
        # 실행 중에는 움직이는 진행 표시줄
        self.progress.setRange(0, 0 if running else 1)
        self.progress.setValue(0 if running else 1)

    def crawl_finished(self, count):
        self.set_running(False)
        self.statusBar().showMessage(f"완료: '{self.current_query}' 총 {count}건 수집")

    def crawl_failed(self, message):
        self.set_running(False)
        self.statusBar().showMessage("오류로 중단되었습니다.")
        QMessageBox.critical(self, "오류", f"크롤링 중 오류가 발생했습니다.\n\n{message}")

    # ── 결과 표시 ──────────────────────────────────────
    def add_article(self, art):
        art["category"], color = classify(art)
        self.articles.append(art)
        row = self.table.rowCount()
        self.table.insertRow(row)

        cat_item = QTableWidgetItem(f"● {art['category']}")
        cat_item.setForeground(QColor(color))
        font = QFont()
        font.setBold(True)
        cat_item.setFont(font)
        press_item = QTableWidgetItem(art["press"])
        press_item.setForeground(QColor(MUTED))
        date_item = QTableWidgetItem(art["datetime"] or art["date"])
        date_item.setForeground(QColor(MUTED))
        for col, item in enumerate([cat_item, press_item, QTableWidgetItem(art["title"]), date_item]):
            self.table.setItem(row, col, item)

        self.update_stats()
        self.statusBar().showMessage(f"'{self.current_query}' 수집 중... {len(self.articles)}건")

    def update_stats(self):
        self.stat_total.set(len(self.articles))
        self.stat_press.set(len({a["press"] for a in self.articles if a["press"]}))
        counts = {}
        for a in self.articles:
            if a["category"] != DEFAULT_CATEGORY[0]:
                counts[a["category"]] = counts.get(a["category"], 0) + 1
        self.stat_top.set(max(counts, key=counts.get) if counts else "-")

    def show_detail(self):
        row = self.table.currentRow()
        if not 0 <= row < len(self.articles):
            return
        art = self.articles[row]
        color = next((c for n, c, _ in CATEGORIES if n == art["category"]), DEFAULT_CATEGORY[1])
        content = art["content"] or "(본문 없음 - '본문까지 수집'을 켜고 다시 실행하세요)"
        links = f'<a style="color:{ACCENT};" href="{escape(art["url"])}">원문 보기 ↗</a>'
        if art["naver_url"]:
            links += f' &nbsp;·&nbsp; <a style="color:{ACCENT};" href="{escape(art["naver_url"])}">네이버뉴스 ↗</a>'
        self.detail.setHtml(
            f'<div style="line-height:160%;">'
            f'<span style="color:{color}; font-weight:700;">● {escape(art["category"])}</span>'
            f'<h2 style="color:#FFFFFF; margin:4px 0;">{escape(art["title"])}</h2>'
            f'<p style="color:{MUTED};">{escape(art["press"])} &nbsp;|&nbsp; '
            f'{escape(art["datetime"] or art["date"])} &nbsp;|&nbsp; {links}</p>'
            f'<p style="background:#0F1E2E; color:#CBD5E1; padding:8px;">'
            f'<b style="color:{ACCENT};">요약</b>&nbsp; {highlight(art["summary"], self.current_query)}</p>'
            f'<p style="color:{TEXT};">{highlight(content, self.current_query)}</p>'
            f"</div>"
        )

    def open_article(self, row, _col):
        url = self.articles[row]["url"] or self.articles[row]["naver_url"]
        if url:
            QDesktopServices.openUrl(QUrl(url))

    def save_results(self):
        default = f"naver_news_{self.current_query}.csv"
        path, _ = QFileDialog.getSaveFileName(self, "CSV로 저장", default, "CSV 파일 (*.csv)")
        if not path:
            return
        try:
            save_csv(self.articles, path)
        except OSError as e:
            QMessageBox.critical(self, "저장 실패", str(e))
            return
        self.statusBar().showMessage(f"{len(self.articles)}건 저장: {path}")

    def save_excel_results(self):
        query = self.current_query
        path, _ = QFileDialog.getSaveFileName(
            self, "엑셀로 저장", f"naver_news_{query}.xlsx", "엑셀 파일 (*.xlsx)"
        )
        if not path:
            return
        if not path.lower().endswith(".xlsx"):
            path += ".xlsx"
        try:
            save_excel(self.articles, path, sheet_title=query)
        except ImportError:
            QMessageBox.critical(
                self, "저장 실패", "엑셀 저장에는 openpyxl이 필요합니다.\n\npip install openpyxl"
            )
            return
        except OSError as e:  # 같은 파일이 엑셀에서 열려 있으면 PermissionError
            QMessageBox.critical(
                self, "저장 실패", f"파일을 저장할 수 없습니다. 엑셀에서 열려 있다면 닫고 다시 시도하세요.\n\n{e}"
            )
            return
        self.statusBar().showMessage(f"{len(self.articles)}건 엑셀 저장: {path}")

    def closeEvent(self, event):
        # 창을 닫을 때 실행 중인 크롤링 스레드를 정리
        if self.worker and self.worker.isRunning():
            self.worker.stop()
            self.worker.wait(5000)
        event.accept()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")  # 운영체제 기본 테마 대신 스타일시트가 일관되게 적용되도록
    app.setStyleSheet(STYLE)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
