"""
반도체 뉴스 레이더 실행 파일(.exe) 빌드 스크립트 (PyInstaller)

- GUI에서 쓰는 칩 아이콘을 .ico 파일로 만들어 exe 아이콘으로 사용합니다.
- 콘솔 창 없이 실행되는 단일 exe 파일을 dist/ 폴더에 만듭니다.

설치: pip install pyinstaller PyQt6 requests beautifulsoup4 openpyxl
실행: python build_exe.py
결과: dist/SemiconNewsRadar.exe
"""

import os
import sys

import PyInstaller.__main__
from PyQt6.QtWidgets import QApplication

ROOT = os.path.dirname(os.path.abspath(__file__))
APP_NAME = "SemiconNewsRadar"
ICON_PATH = os.path.join(ROOT, "build", "chip.ico")


def make_icon():
    """GUI의 칩 아이콘을 256px .ico 파일로 저장."""
    from naver_news_gui import make_chip_pixmap

    app = QApplication.instance() or QApplication(sys.argv)  # QPixmap 사용에 필요
    os.makedirs(os.path.dirname(ICON_PATH), exist_ok=True)
    if not make_chip_pixmap(256).save(ICON_PATH, "ICO"):
        raise RuntimeError("아이콘 파일을 만들지 못했습니다.")
    del app


def build():
    make_icon()
    PyInstaller.__main__.run([
        os.path.join(ROOT, "naver_news_gui.py"),
        "--name", APP_NAME,
        "--onefile",            # exe 파일 하나로 묶기
        "--windowed",           # 실행 시 콘솔(검은 창) 숨기기
        "--icon", ICON_PATH,
        "--noconfirm",
        "--clean",
        "--distpath", os.path.join(ROOT, "dist"),
        "--workpath", os.path.join(ROOT, "build"),
        "--specpath", os.path.join(ROOT, "build"),
        # 사용하지 않는 큰 모듈은 제외해 용량 줄이기
        "--exclude-module", "tkinter",
        "--exclude-module", "unittest",
        "--exclude-module", "PyQt6.QtWebEngineCore",
        "--exclude-module", "PyQt6.QtQml",
        "--exclude-module", "PyQt6.QtQuick",
        "--exclude-module", "PyQt6.QtMultimedia",
    ])
    exe = os.path.join(ROOT, "dist", f"{APP_NAME}.exe")
    print(f"\n빌드 완료: {exe} ({os.path.getsize(exe) / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    build()
