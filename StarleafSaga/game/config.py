"""전역 설정: 화면, 물리, 색상, 폰트, 경로."""
import os
import sys
import pygame

if getattr(sys, "frozen", False):
    # PyInstaller exe: 데이터는 압축 해제 폴더, 세이브는 exe 옆에 저장
    BASE_DIR = sys._MEIPASS
    SAVE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    SAVE_DIR = BASE_DIR
if not os.access(SAVE_DIR, os.W_OK):
    # Program Files 처럼 쓰기 금지된 위치에 설치된 경우
    SAVE_DIR = os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), "StarleafSaga")
    os.makedirs(SAVE_DIR, exist_ok=True)
DATA_DIR = os.path.join(BASE_DIR, "data")
ASSET_DIR = os.path.join(BASE_DIR, "assets")
SKILL_ICON_DIR = os.path.join(ASSET_DIR, "skills")
SAVE_PATH = os.path.join(SAVE_DIR, "save.json")

TITLE = "별잎 연대기 (Starleaf Chronicle)"
SCREEN_W, SCREEN_H = 1280, 720
FPS = 60

# 물리
GRAVITY = 2000.0
JUMP_VEL = -720.0
MOVE_SPEED = 230.0
GROUND_Y = 600          # 바닥 윗면 y
HUD_H = 0

MAX_LEVEL = 100
AP_PER_LEVEL = 5
SP_PER_LEVEL = 3
SP_START_LEVEL = 10     # 이 레벨 이후 레벨업부터 SP 지급

STAT_KEYS = ["STR", "DEX", "INT", "LUK"]
STAT_NAMES = {"STR": "힘", "DEX": "민첩", "INT": "지능", "LUK": "행운"}

# 등급 색 (장비 잠재능력)
GRADE_NAMES = ["", "레어", "에픽", "유니크", "레전드리"]
GRADE_COLORS = [(230, 230, 230), (90, 160, 255), (170, 90, 255), (255, 200, 40), (120, 230, 80)]

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
UI_BG = (28, 32, 44)
UI_BG2 = (40, 46, 62)
UI_LINE = (90, 100, 130)
UI_TEXT = (230, 232, 240)
UI_DIM = (150, 155, 170)
YELLOW = (255, 220, 70)
RED = (235, 70, 70)
GREEN = (90, 220, 110)
BLUE = (80, 150, 255)
ORANGE = (255, 150, 60)

_font_cache = {}
_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\malgun.ttf",
    r"C:\Windows\Fonts\malgunbd.ttf",
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
]


def font(size, bold=False):
    key = (size, bold)
    if key not in _font_cache:
        path = None
        cands = _FONT_CANDIDATES[1:2] + _FONT_CANDIDATES if bold else _FONT_CANDIDATES
        for p in cands:
            if os.path.exists(p):
                path = p
                break
        f = pygame.font.Font(path, size) if path else pygame.font.SysFont("malgungothic", size)
        _font_cache[key] = f
    return _font_cache[key]
