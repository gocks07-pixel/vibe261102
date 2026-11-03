"""
별잎 연대기 실행 파일(.exe) 빌드 스크립트 (PyInstaller)

- 세계수 아이콘을 그려 assets/icon.png(게임 창 아이콘)와 build/starleaf.ico(exe 아이콘)로 저장합니다.
- data/ 와 assets/ 폴더를 exe 안에 포함한 단일 exe 파일을 dist/ 폴더에 만듭니다.
- 세이브 파일(save.json)은 exe와 같은 폴더에 생성됩니다.

설치: pip install pyinstaller pygame pillow
실행: python build_exe.py
결과: dist/StarleafSaga.exe
"""

import os

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
import pygame
import PyInstaller.__main__
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
APP_NAME = "StarleafSaga"
ICON_PNG = os.path.join(ROOT, "assets", "icon.png")
ICON_ICO = os.path.join(ROOT, "build", "starleaf.ico")


def make_icon():
    """타이틀 화면의 세계수를 256px 아이콘으로 그린다."""
    pygame.init()
    pygame.display.set_mode((1, 1))
    s = pygame.Surface((256, 256), pygame.SRCALPHA)
    pygame.draw.rect(s, (40, 60, 120), (0, 0, 256, 256), border_radius=48)
    pygame.draw.rect(s, (90, 60, 40), (112, 120, 32, 100), border_radius=8)
    pygame.draw.rect(s, (60, 110, 70), (24, 206, 208, 28), border_radius=14)
    for r, col in ((96, (60, 140, 90)), (72, (90, 180, 110)), (46, (140, 220, 140))):
        pygame.draw.circle(s, col, (128, 110), r)
    pygame.draw.circle(s, (255, 240, 150), (128, 110), 20)
    pygame.draw.circle(s, (255, 255, 220), (128, 110), 9)
    pygame.image.save(s, ICON_PNG)
    os.makedirs(os.path.dirname(ICON_ICO), exist_ok=True)
    Image.open(ICON_PNG).save(ICON_ICO, sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    pygame.quit()


def build():
    make_icon()
    sep = os.pathsep  # Windows ';'
    PyInstaller.__main__.run([
        os.path.join(ROOT, "main.py"),
        "--name", APP_NAME,
        "--onefile",            # exe 파일 하나로 묶기
        "--windowed",           # 실행 시 콘솔(검은 창) 숨기기
        "--icon", ICON_ICO,
        "--add-data", f"{os.path.join(ROOT, 'data')}{sep}data",
        "--add-data", f"{os.path.join(ROOT, 'assets')}{sep}assets",
        "--distpath", os.path.join(ROOT, "dist"),
        "--workpath", os.path.join(ROOT, "build"),
        "--specpath", os.path.join(ROOT, "build"),
        "--noconfirm",
        "--clean",
    ])
    print(f"\n완료: {os.path.join(ROOT, 'dist', APP_NAME + '.exe')}")


if __name__ == "__main__":
    build()
