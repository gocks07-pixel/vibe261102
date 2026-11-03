"""
컬리 후기 감성 분석기 실행 파일(.exe) 빌드 스크립트 (PyInstaller)

- GUI에서 쓰는 도넛 차트 아이콘을 .ico 파일로 만들어 exe 아이콘으로 사용합니다.
- 콘솔 창 없이 실행되는 단일 exe 파일을 C:\\work\\dist 폴더에 만듭니다.

설치: pip install pyinstaller PyQt6 pandas matplotlib requests
실행: python KurlyReview/build_exe.py
결과: dist/KurlyReviewAnalyzer.exe
"""

import os
import sys

import PyInstaller.__main__
from PyQt6.QtWidgets import QApplication

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # 다른 앱들과 같은 dist/, build/ 폴더 사용
APP_NAME = "KurlyReviewAnalyzer"
ICON_PATH = os.path.join(ROOT, "build", "kurly_review.ico")


def make_icon():
    """GUI의 도넛 차트 아이콘을 256px .ico 파일로 저장."""
    sys.path.insert(0, HERE)
    from kurly_review_gui import make_app_pixmap

    app = QApplication.instance() or QApplication(sys.argv)  # QPixmap 사용에 필요
    os.makedirs(os.path.dirname(ICON_PATH), exist_ok=True)
    if not make_app_pixmap(256).save(ICON_PATH, "ICO"):
        raise RuntimeError("아이콘 파일을 만들지 못했습니다.")
    del app


def build():
    make_icon()
    PyInstaller.__main__.run([
        os.path.join(HERE, "kurly_review_gui.py"),
        "--name", APP_NAME,
        "--onefile",            # exe 파일 하나로 묶기
        "--windowed",           # 실행 시 콘솔(검은 창) 숨기기
        "--icon", ICON_PATH,
        "--noconfirm",
        "--clean",
        "--paths", HERE,        # kurly_review.py 모듈을 찾을 수 있도록
        "--distpath", os.path.join(ROOT, "dist"),
        "--workpath", os.path.join(ROOT, "build"),
        "--specpath", os.path.join(ROOT, "build"),
        "--collect-data", "certifi",  # HTTPS 인증서
        # 같은 PC에 PySide6도 설치되어 있어 Qt 바인딩이 섞이지 않도록 제외
        "--exclude-module", "PySide6",
        "--exclude-module", "shiboken6",
        # 사용하지 않는 큰 모듈은 제외해 용량 줄이기
        # (unittest는 matplotlib이 쓰는 pyparsing이 import하므로 제외하면 안 됨)
        "--exclude-module", "tkinter",
        "--exclude-module", "scipy",
        "--exclude-module", "seaborn",
        "--exclude-module", "IPython",
        "--exclude-module", "pygame",
        "--exclude-module", "selenium",
        "--exclude-module", "PyQt6.QtWebEngineCore",
        "--exclude-module", "PyQt6.QtQml",
        "--exclude-module", "PyQt6.QtQuick",
        "--exclude-module", "PyQt6.QtMultimedia",
    ])
    exe = os.path.join(ROOT, "dist", f"{APP_NAME}.exe")
    print(f"\n빌드 완료: {exe} ({os.path.getsize(exe) / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    build()
