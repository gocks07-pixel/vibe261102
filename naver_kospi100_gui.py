"""
코스피100 섹터 레이더 - 반도체 / AI / 자동차 관련 종목 PyQt6 GUI

- [불러오기]를 누르면 백그라운드 스레드에서 코스피100 지수와 구성 종목을 가져와
  반도체 / AI / 자동차 관련 종목만 표에 보여줍니다(naver_kospi100_sector.py 사용).
- 상단 분야 체크박스와 종목명 검색으로 표를 거를 수 있고, 열 머리글을 누르면 정렬됩니다.
- 상승은 빨강, 하락은 파랑으로 표시합니다(국내 증시 관례).
- 종목을 선택하면 아래에 관련 업종/테마가 표시되고, 더블클릭하면 브라우저로 종목 페이지를 엽니다.
- [자동 새로고침]을 켜면 60초마다 다시 불러옵니다.
- [CSV 저장] / [엑셀 저장]은 지금 표에 보이는 종목만 저장합니다.

설치: pip install PyQt6 requests openpyxl
실행: python naver_kospi100_gui.py
"""

import sys
from datetime import datetime

from PyQt6.QtCore import QThread, QTimer, QUrl, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QDesktopServices
from PyQt6.QtWidgets import (
    QAbstractItemView, QApplication, QCheckBox, QFileDialog, QFrame, QHBoxLayout,
    QHeaderView, QLabel, QLineEdit, QMainWindow, QMessageBox, QProgressBar, QPushButton,
    QTableWidget, QTableWidgetItem, QTextBrowser, QVBoxLayout, QWidget,
)

from naver_kospi100_crawler import fetch_constituents, fetch_index_info
from naver_kospi100_sector import CATEGORIES, classify, save_csv, save_excel

REFRESH_MS = 60_000
STOCK_URL = "https://stock.naver.com/domestic/stock/{}/price"
# (표 머리글, 데이터 키, 표시 형식)
TABLE_COLUMNS = [
    ("순위", "순위", "int"),
    ("종목명", "종목명", "text"),
    ("코드", "종목코드", "text"),
    ("현재가", "현재가", "int"),
    ("전일비", "전일비", "signed"),
    ("등락률", "등락률(%)", "pct"),
    ("거래량", "거래량", "int"),
    ("거래대금(억)", "거래대금(원)", "eok"),
    ("시가총액(억)", "시가총액(원)", "eok"),
    ("분야", "분야", "text"),
]
CATEGORY_COLORS = {"반도체": "#22D3EE", "AI": "#F472B6", "자동차": "#FBBF24"}

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

STYLE = f"""
QMainWindow, QWidget#central {{ background: {BG}; }}
QWidget {{ color: {TEXT}; font-family: "Malgun Gothic", "맑은 고딕", sans-serif; font-size: 10pt; }}
QLabel#title {{ font-size: 18pt; font-weight: 700; color: #FFFFFF; }}
QLabel#subtitle {{ color: {MUTED}; font-size: 9pt; letter-spacing: 1px; }}
QLabel#indexValue {{ font-size: 20pt; font-weight: 700; }}
QLabel#muted {{ color: {MUTED}; font-size: 9pt; }}
QFrame#header {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #0B1A2E, stop:0.6 #0E2238, stop:1 #0A2A3A);
    border: 1px solid {BORDER}; border-radius: 10px;
}}
QFrame#statCard {{ background: rgba(34, 211, 238, 0.07); border: 1px solid #1E3A4C; border-radius: 8px; }}
QLabel#statValue {{ font-size: 16pt; font-weight: 700; }}
QLabel#statName {{ color: {MUTED}; font-size: 8.5pt; }}
QFrame#panel {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 10px; }}

QLineEdit {{
    background: {PANEL_2}; border: 1px solid {BORDER}; border-radius: 6px;
    padding: 6px 8px; selection-background-color: {ACCENT_DARK};
}}
QLineEdit:focus {{ border: 1px solid {ACCENT}; }}
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
QProgressBar {{ background: {PANEL_2}; border: none; border-radius: 2px; max-height: 4px; }}
QProgressBar::chunk {{ background: {ACCENT}; border-radius: 2px; }}
QScrollBar:vertical {{ background: transparent; width: 10px; margin: 2px; }}
QScrollBar::handle:vertical {{ background: #24324F; border-radius: 4px; min-height: 30px; }}
QScrollBar::handle:vertical:hover {{ background: {ACCENT_DARK}; }}
QScrollBar::add-line, QScrollBar::sub-line {{ height: 0; }}
QStatusBar {{ background: {PANEL_2}; color: {MUTED}; border-top: 1px solid {BORDER}; }}
"""


def change_color(value):
    if isinstance(value, (int, float)) and value > 0:
        return RISE
    if isinstance(value, (int, float)) and value < 0:
        return FALL
    return TEXT


def format_value(value, kind):
    if not isinstance(value, (int, float)):
        return str(value or "")
    if kind == "int":
        return f"{value:,}"
    if kind == "signed":
        return f"{value:+,}"
    if kind == "pct":
        return f"{value:+.2f}%"
    if kind == "eok":  # 원 -> 억 원
        return f"{value / 100_000_000:,.0f}"
    return str(value)


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
    """지수 정보와 분야별 종목을 백그라운드에서 가져와 GUI가 멈추지 않도록 하는 스레드."""

    log_message = pyqtSignal(str)
    loaded = pyqtSignal(dict, list)
    failed = pyqtSignal(str)

    def run(self):
        try:
            self.log_message.emit("코스피100 지수 정보를 가져오는 중...")
            info = fetch_index_info()
            self.log_message.emit("구성 종목 100개를 가져오는 중...")
            rows = fetch_constituents()
            self.log_message.emit("업종/테마로 반도체·AI·자동차 종목을 분류하는 중...")
            self.loaded.emit(info, classify(rows))
        except Exception as e:  # 네트워크 오류 등은 메시지 박스로 알림
            self.failed.emit(str(e))


class StatCard(QFrame):
    """헤더 오른쪽의 분야별 종목 수 카드."""

    def __init__(self, name, color):
        super().__init__()
        self.setObjectName("statCard")
        self.setMinimumWidth(96)
        self.value = QLabel("-")
        self.value.setObjectName("statValue")
        self.value.setStyleSheet(f"color: {color};")
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
        self.setWindowTitle("코스피100 섹터 레이더")
        self.resize(1200, 800)
        self.rows = []
        self.worker = None

        # ── 헤더: 제목 + 지수 현재값 + 분야별 종목 수 ──────────
        title = QLabel("코스피100 섹터 레이더")
        title.setObjectName("title")
        subtitle = QLabel("KOSPI 100  ·  반도체 / AI / 자동차  ·  NAVER PAY 증권")
        subtitle.setObjectName("subtitle")
        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        title_box.addWidget(title)
        title_box.addWidget(subtitle)

        self.index_value = QLabel("-")
        self.index_value.setObjectName("indexValue")
        self.index_change = QLabel("불러오기를 눌러 주세요")
        self.index_change.setObjectName("muted")
        index_box = QVBoxLayout()
        index_box.setSpacing(0)
        index_box.addWidget(self.index_value, alignment=Qt.AlignmentFlag.AlignRight)
        index_box.addWidget(self.index_change, alignment=Qt.AlignmentFlag.AlignRight)

        self.stat_cards = {"전체": StatCard("관련 종목", "#FFFFFF")}
        for category in CATEGORIES:
            self.stat_cards[category] = StatCard(category, CATEGORY_COLORS.get(category, ACCENT))

        header = QFrame()
        header.setObjectName("header")
        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(18, 14, 18, 14)
        header_layout.addLayout(title_box)
        header_layout.addStretch()
        header_layout.addLayout(index_box)
        header_layout.addSpacing(16)
        for card in self.stat_cards.values():
            header_layout.addWidget(card)

        # ── 조작 영역: 불러오기, 분야 필터, 검색, 저장 ──────────
        self.load_button = QPushButton("불러오기")
        self.load_button.setObjectName("primary")
        self.load_button.clicked.connect(self.start_load)
        self.auto_refresh = QCheckBox("자동 새로고침(60초)")
        self.auto_refresh.toggled.connect(self.toggle_auto_refresh)

        self.category_checks = {}
        filter_box = QHBoxLayout()
        filter_box.addWidget(QLabel("분야"))
        for category in CATEGORIES:
            check = QCheckBox(category)
            check.setChecked(True)
            check.toggled.connect(self.refresh_table)
            self.category_checks[category] = check
            filter_box.addWidget(check)

        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("종목명 또는 코드 검색")
        self.search_edit.setClearButtonEnabled(True)
        self.search_edit.setFixedWidth(220)
        self.search_edit.textChanged.connect(self.refresh_table)

        self.csv_button = QPushButton("CSV 저장")
        self.csv_button.clicked.connect(lambda: self.save_results("csv"))
        self.excel_button = QPushButton("엑셀 저장")
        self.excel_button.clicked.connect(lambda: self.save_results("xlsx"))

        controls = QHBoxLayout()
        controls.addWidget(self.load_button)
        controls.addWidget(self.auto_refresh)
        controls.addSpacing(20)
        controls.addLayout(filter_box)
        controls.addSpacing(12)
        controls.addWidget(self.search_edit)
        controls.addStretch()
        controls.addWidget(self.csv_button)
        controls.addWidget(self.excel_button)

        self.progress = QProgressBar()
        self.progress.setTextVisible(False)
        self.progress.setRange(0, 1)

        # ── 종목 표 ─────────────────────────────────────────
        self.table = QTableWidget(0, len(TABLE_COLUMNS))
        self.table.setHorizontalHeaderLabels([c for c, _, _ in TABLE_COLUMNS])
        self.table.setAlternatingRowColors(True)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.verticalHeader().setVisible(False)
        self.table.setShowGrid(False)
        self.table.setSortingEnabled(True)
        header_view = self.table.horizontalHeader()
        header_view.setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
        header_view.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        header_view.setSortIndicator(0, Qt.SortOrder.AscendingOrder)  # 처음엔 순위 순
        self.table.itemSelectionChanged.connect(self.show_detail)
        self.table.cellDoubleClicked.connect(self.open_stock)

        # ── 선택 종목 상세 (관련 업종/테마) ──────────────────────
        self.detail = QTextBrowser()
        self.detail.setFixedHeight(140)

        central = QWidget()
        central.setObjectName("central")
        layout = QVBoxLayout(central)
        layout.setContentsMargins(16, 16, 16, 12)
        layout.setSpacing(10)
        layout.addWidget(header)
        layout.addLayout(controls)
        layout.addWidget(self.progress)
        layout.addWidget(self.wrap_panel(self.table), stretch=1)
        layout.addWidget(self.wrap_panel(self.detail))
        self.setCentralWidget(central)

        self.timer = QTimer(self)
        self.timer.setInterval(REFRESH_MS)
        self.timer.timeout.connect(self.start_load)

        self.show_placeholder()
        self.statusBar().showMessage("준비")
        self.start_load()

    @staticmethod
    def wrap_panel(widget):
        panel = QFrame()
        panel.setObjectName("panel")
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.addWidget(widget)
        return panel

    def show_placeholder(self):
        self.detail.setHtml(f"<span style='color:{MUTED}'>종목을 선택하면 관련 업종/테마가 표시됩니다. "
                            "더블클릭하면 네이버페이 증권 종목 페이지가 열립니다.</span>")

    # ── 불러오기 ─────────────────────────────────────────────
    def start_load(self):
        if self.worker and self.worker.isRunning():
            return
        self.load_button.setEnabled(False)
        self.progress.setRange(0, 0)  # 진행 중 애니메이션
        self.worker = LoadWorker()
        self.worker.log_message.connect(self.statusBar().showMessage)
        self.worker.loaded.connect(self.load_finished)
        self.worker.failed.connect(self.load_failed)
        self.worker.finished.connect(self.load_done)
        self.worker.start()

    def load_done(self):
        self.load_button.setEnabled(True)
        self.progress.setRange(0, 1)

    def load_finished(self, info, rows):
        self.rows = rows
        self.update_index(info)
        self.stat_cards["전체"].set(len(rows))
        for category in CATEGORIES:
            self.stat_cards[category].set(sum(category in r["분야"].split(", ") for r in rows))
        self.refresh_table()
        self.statusBar().showMessage(f"{datetime.now():%H:%M:%S} 갱신 · 코스피100 중 관련 종목 {len(rows)}개")

    def load_failed(self, message):
        self.statusBar().showMessage("불러오기 실패")
        if not self.auto_refresh.isChecked():  # 자동 새로고침 중에는 창을 계속 띄우지 않음
            QMessageBox.warning(self, "불러오기 실패", f"데이터를 가져오지 못했습니다.\n\n{message}")

    def toggle_auto_refresh(self, checked):
        if checked:
            self.timer.start()
        else:
            self.timer.stop()

    def update_index(self, info):
        try:
            change = float(str(info["등락률(%)"]).replace(",", ""))
        except (TypeError, ValueError):
            change = 0
        color = change_color(change)
        self.index_value.setText(f"{info['지수명']}  {info['현재값']}")
        self.index_value.setStyleSheet(f"color: {color};")
        status = "장중" if info["장상태"] == "OPEN" else "장마감"
        self.index_change.setText(f"<span style='color:{color}'>{info['전일비']} ({change:+.2f}%)</span>"
                                  f"  ·  {status}")

    # ── 표 ──────────────────────────────────────────────────
    def visible_rows(self):
        selected = {c for c, check in self.category_checks.items() if check.isChecked()}
        keyword = self.search_edit.text().strip().lower()
        return [
            row for row in self.rows
            if selected & set(row["분야"].split(", "))
            and (not keyword or keyword in row["종목명"].lower() or keyword in row["종목코드"])
        ]

    def refresh_table(self):
        rows = self.visible_rows()
        self.table.setSortingEnabled(False)  # 채우는 동안 정렬이 끼어들지 않도록
        self.table.setRowCount(len(rows))
        for r, row in enumerate(rows):
            color = QColor(change_color(row["전일비"]))
            for c, (_, key, kind) in enumerate(TABLE_COLUMNS):
                value = row[key]
                item = SortItem(format_value(value, kind), value)
                item.setData(Qt.ItemDataRole.UserRole, row["종목코드"])
                if kind != "text":
                    item.setTextAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
                if key in ("현재가", "전일비", "등락률(%)"):
                    item.setForeground(color)
                if key == "분야":
                    first = value.split(", ")[0]
                    item.setForeground(QColor(CATEGORY_COLORS.get(first, TEXT)))
                self.table.setItem(r, c, item)
        self.table.setSortingEnabled(True)
        self.csv_button.setEnabled(bool(rows))
        self.excel_button.setEnabled(bool(rows))
        self.show_placeholder()

    def selected_row(self):
        items = self.table.selectedItems()
        if not items:
            return None
        code = items[0].data(Qt.ItemDataRole.UserRole)
        return next((row for row in self.rows if row["종목코드"] == code), None)

    def show_detail(self):
        row = self.selected_row()
        if not row:
            self.show_placeholder()
            return
        badges = " ".join(
            f"<span style='color:{CATEGORY_COLORS.get(c, ACCENT)}'>■ {c}</span>" for c in row["분야"].split(", ")
        )
        sources = "<br>".join(f"· {s}" for s in row["관련 업종/테마"].split(" | "))
        self.detail.setHtml(
            f"<b style='font-size:12pt'>{row['종목명']}</b> "
            f"<span style='color:{MUTED}'>{row['종목코드']} · 코스피100 {row['순위']}위</span>"
            f"&nbsp;&nbsp;{badges}<br><span style='color:{MUTED}'>{sources}</span>"
        )

    def open_stock(self, row_index, _col):
        code = self.table.item(row_index, 0).data(Qt.ItemDataRole.UserRole)
        QDesktopServices.openUrl(QUrl(STOCK_URL.format(code)))

    # ── 저장 ────────────────────────────────────────────────
    def save_results(self, kind):
        rows = self.visible_rows()
        default_name = f"kospi100_sector_{datetime.now():%Y%m%d_%H%M}.{kind}"
        file_filter = "CSV 파일 (*.csv)" if kind == "csv" else "엑셀 파일 (*.xlsx)"
        path, _ = QFileDialog.getSaveFileName(self, "저장", default_name, file_filter)
        if not path:
            return
        try:
            if kind == "csv":
                save_csv(rows, path)
            else:
                save_excel(rows, path)
        except ImportError:
            QMessageBox.warning(self, "저장 실패", "엑셀 저장에는 openpyxl이 필요합니다.\npip install openpyxl")
            return
        except OSError as e:  # 파일이 엑셀에서 열려 있는 경우 등
            QMessageBox.warning(self, "저장 실패", str(e))
            return
        self.statusBar().showMessage(f"{len(rows)}개 종목 저장: {path}")

    def closeEvent(self, event):
        # 창을 닫을 때 실행 중인 불러오기 스레드가 끝날 때까지 기다림
        self.timer.stop()
        if self.worker and self.worker.isRunning():
            self.worker.wait(10000)
        event.accept()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")  # 운영체제 기본 테마 대신 스타일시트가 일관되게 적용되도록
    app.setStyleSheet(STYLE)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
