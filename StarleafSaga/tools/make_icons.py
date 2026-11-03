"""스킬 아이콘 생성기: 스킬 이름에서 떠오르는 그림을 도형으로 그려 assets/skills/<id>.png 로 저장.

실행: python tools/make_icons.py          (이미 있는 파일은 건너뜀)
      python tools/make_icons.py --force  (전부 다시 생성)
직접 그린 이미지로 바꾸고 싶으면 같은 파일 이름으로 덮어쓰면 된다.
"""
import math
import os
import sys

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
import pygame

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE)
from game.data import SKILLS  # noqa: E402

OUT = os.path.join(BASE, "assets", "skills")
S = 64
C = S // 2


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def rot(points, ang, cx=C, cy=C):
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca) for x, y in points]


# ---------------- 배경 ----------------
def background(s, col):
    dark = mix(col, (10, 10, 20), 0.75)
    for r in range(C + 10, 0, -1):
        t = r / (C + 10)
        pygame.draw.circle(s, mix(col, dark, t ** 0.7), (C, C - 6), r)
    mask = pygame.Surface((S, S), pygame.SRCALPHA)
    pygame.draw.rect(mask, (255, 255, 255, 255), (0, 0, S, S), border_radius=10)
    s.blit(mask, (0, 0), special_flags=pygame.BLEND_RGBA_MIN)
    pygame.draw.rect(s, mix(col, (255, 255, 255), 0.35), (0, 0, S, S), 2, border_radius=10)


def glow(s, pos, r, col, a=90):
    g = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
    for i in range(r, 0, -2):
        pygame.draw.circle(g, (*col, int(a * (1 - i / r))), (r, r), i)
    s.blit(g, (pos[0] - r, pos[1] - r))


# ---------------- 모티프 ----------------
def m_sword(s, fg, ang=-0.785, ox=0, oy=0, scale=1.0):
    blade = [(C - 3, 8), (C + 3, 8), (C + 3, 42), (C - 3, 42)]
    tip = [(C - 3, 8), (C, 2), (C + 3, 8)]
    guard = [(C - 11, 42), (C + 11, 42), (C + 11, 46), (C - 11, 46)]
    hilt = [(C - 2, 46), (C + 2, 46), (C + 2, 56), (C - 2, 56)]
    for poly, col in ((blade, (225, 232, 245)), (tip, (240, 245, 255)), (guard, fg), (hilt, (110, 75, 50))):
        pts = [(C + (x - C) * scale + ox, C + (y - C) * scale + oy) for x, y in poly]
        pygame.draw.polygon(s, col, rot(pts, ang, C + ox, C + oy))
    pygame.draw.circle(s, fg, rot([(C + ox, C + 13 * scale + 26 * scale + oy)], ang, C + ox, C + oy)[0], 3)


def m_slash(s, fg):
    for i, w in enumerate((10, 6, 3)):
        col = mix(fg, (255, 255, 255), i * 0.4)
        pygame.draw.arc(s, col, (6, 6, 52, 52), 0.3, 2.6, w)
    for x, y in ((48, 12), (14, 20)):
        pygame.draw.line(s, (255, 255, 255), (x - 4, y), (x + 4, y), 2)
        pygame.draw.line(s, (255, 255, 255), (x, y - 4), (x, y + 4), 2)


def m_whirl(s, fg):
    pts = []
    for i in range(80):
        a = i * 0.22
        r = 3 + i * 0.33
        pts.append((C + math.cos(a) * r, C + math.sin(a) * r))
    pygame.draw.lines(s, fg, False, pts, 4)
    pygame.draw.lines(s, (255, 255, 255), False, pts[::2], 1)


def m_dash(s, fg):
    for i, y in enumerate((20, 32, 44)):
        pygame.draw.line(s, mix(fg, (255, 255, 255), 0.4), (6 + i * 4, y), (30 + i * 4, y), 3)
    pygame.draw.polygon(s, fg, [(34, 16), (58, 32), (34, 48), (40, 32)])


def m_shield(s, fg, emblem=None):
    pts = [(C, 6), (54, 14), (52, 36), (C, 58), (12, 36), (10, 14)]
    pygame.draw.polygon(s, mix(fg, (40, 40, 60), 0.4), pts)
    pygame.draw.polygon(s, fg, pts, 4)
    if emblem == "cross":
        pygame.draw.rect(s, (255, 250, 220), (C - 3, 16, 6, 30))
        pygame.draw.rect(s, (255, 250, 220), (C - 11, 24, 22, 6))
    elif emblem == "snow":
        m_snowflake(s, (230, 250, 255), r=14, cy=30)
    else:
        pygame.draw.circle(s, (255, 255, 255), (C, 30), 7, 3)


def m_flame(s, fg=None, cx=C, cy=C + 4, k=1.0):
    layers = [((230, 60, 30), 1.0), ((255, 150, 40), 0.72), ((255, 235, 120), 0.42)]
    for col, f in layers:
        h, w = 46 * k * f, 30 * k * f
        pts = [(cx, cy - h * 0.75), (cx + w * 0.35, cy - h * 0.3), (cx + w * 0.5, cy + h * 0.05), (cx + w * 0.3, cy + h * 0.35),
               (cx, cy + h * 0.42), (cx - w * 0.3, cy + h * 0.35), (cx - w * 0.5, cy + h * 0.05), (cx - w * 0.2, cy - h * 0.2)]
        pygame.draw.polygon(s, col, pts)


def m_arrows_up(s, fg):
    for x, h in ((18, 30), (32, 40), (46, 30)):
        pygame.draw.line(s, fg, (x, 54), (x, 54 - h), 5)
        pygame.draw.polygon(s, mix(fg, (255, 255, 255), 0.4), [(x - 7, 58 - h), (x, 48 - h), (x + 7, 58 - h)])


def m_quake(s, fg):
    pygame.draw.rect(s, mix(fg, (60, 40, 20), 0.5), (4, 40, 56, 20))
    pygame.draw.lines(s, (40, 25, 10), False, [(10, 40), (20, 50), (26, 44), (34, 58), (40, 46), (52, 52)], 3)
    for x, y, r in ((16, 28, 5), (44, 22, 6), (30, 16, 4)):
        pygame.draw.circle(s, fg, (x, y), r)
    m_sword(s, fg, ang=0, oy=-8, scale=0.7)


def m_sunburst(s, fg):
    glow(s, (C, C), 30, fg, 140)
    for i in range(12):
        a = i * math.pi / 6
        pygame.draw.line(s, fg, (C + math.cos(a) * 10, C + math.sin(a) * 10), (C + math.cos(a) * 28, C + math.sin(a) * 28), 3)
    pygame.draw.circle(s, (255, 255, 230), (C, C), 9)


def m_star(s, fg, cx=C, cy=C, r=24, inner=0.45):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    pygame.draw.polygon(s, fg, pts)
    pygame.draw.polygon(s, (255, 255, 255), pts, 2)


def m_rain(s, fg, kind="line"):
    for i, (x, y) in enumerate(((14, 10), (30, 4), (46, 12), (22, 30), (40, 28), (54, 34), (10, 38))):
        if kind == "sword":
            pygame.draw.line(s, (230, 235, 250), (x, y), (x - 4, y + 16), 3)
            pygame.draw.line(s, fg, (x - 4, y + 3), (x + 4, y + 1), 2)
        elif kind == "ice":
            pygame.draw.polygon(s, (220, 245, 255), [(x - 3, y), (x + 3, y), (x, y + 16)])
        else:
            pygame.draw.line(s, fg, (x, y), (x - 6, y + 18), 3)


def m_wings(s, fg):
    for side in (-1, 1):
        for i in range(4):
            pts = [(C + side * 4, 34), (C + side * (14 + i * 5), 12 + i * 6), (C + side * (24 + i * 4), 22 + i * 7)]
            pygame.draw.polygon(s, mix(fg, (255, 255, 255), 0.2 + i * 0.15), pts)
    pygame.draw.circle(s, (255, 255, 240), (C, 36), 6)


def m_arrow(s, fg, ang=-0.785, ox=0, oy=0, length=48):
    x0, x1 = C - length / 2, C + length / 2
    shaft = [(x0, C - 1.5), (x1 - 10, C - 1.5), (x1 - 10, C + 1.5), (x0, C + 1.5)]
    head = [(x1 - 12, C - 7), (x1 + 2, C), (x1 - 12, C + 7)]
    fl1 = [(x0, C), (x0 - 4, C - 7), (x0 + 8, C - 2)]
    fl2 = [(x0, C), (x0 - 4, C + 7), (x0 + 8, C + 2)]
    for poly, col in ((shaft, (200, 170, 120)), (head, (230, 235, 245)), (fl1, fg), (fl2, fg)):
        pygame.draw.polygon(s, col, rot([(x + ox, y + oy) for x, y in poly], ang, C + ox, C + oy))


def m_eye(s, fg):
    pygame.draw.ellipse(s, (245, 245, 250), (8, 20, 48, 24))
    pygame.draw.circle(s, fg, (C, C), 10)
    pygame.draw.circle(s, (20, 20, 30), (C, C), 5)
    pygame.draw.circle(s, (255, 255, 255), (C + 3, C - 3), 2)
    pygame.draw.ellipse(s, mix(fg, (0, 0, 0), 0.3), (8, 20, 48, 24), 3)


def m_crosshair(s, fg):
    pygame.draw.circle(s, fg, (C, C), 22, 3)
    pygame.draw.circle(s, fg, (C, C), 10, 2)
    for a, b in (((C, 4), (C, 20)), ((C, 44), (C, 60)), ((4, C), (20, C)), ((44, C), (60, C))):
        pygame.draw.line(s, fg, a, b, 3)
    pygame.draw.circle(s, (255, 60, 60), (C, C), 3)


def m_bow(s, fg):
    pygame.draw.arc(s, (150, 100, 60), (14, 6, 30, 52), -1.4, 1.4, 5)
    pygame.draw.line(s, (240, 240, 240), (36, 9), (36, 55), 1)
    m_arrow(s, fg, ang=0, ox=-2, length=40)


def m_beam(s, fg):
    glow(s, (C, C), 30, fg, 110)
    pygame.draw.rect(s, fg, (4, C - 6, 56, 12), border_radius=6)
    pygame.draw.rect(s, (255, 255, 255), (4, C - 2, 56, 4), border_radius=2)


def m_wind(s, fg):
    for i, y in enumerate((18, 32, 46)):
        pygame.draw.arc(s, fg, (6 + i * 3, y - 10, 46, 20), 0, math.pi, 3)
        pygame.draw.arc(s, mix(fg, (255, 255, 255), 0.4), (30 + i * 2, y - 6, 18, 12), math.pi, 2 * math.pi, 2)


def m_cloud(s, fg, cy=22):
    for x, y, r in ((22, cy + 4, 10), (34, cy - 2, 12), (46, cy + 4, 9)):
        pygame.draw.circle(s, fg, (x, y), r)
    pygame.draw.rect(s, fg, (13, cy + 2, 42, 11), border_radius=5)


def m_bolt(s, fg=(255, 240, 120), ox=0, oy=0, k=1.0):
    pts = [(36, 4), (16, 34), (30, 34), (24, 60), (48, 26), (34, 26), (42, 4)]
    pts = [(C + (x - C) * k + ox, C + (y - C) * k + oy) for x, y in pts]
    pygame.draw.polygon(s, fg, pts)
    pygame.draw.polygon(s, (255, 255, 255), pts, 2)


def m_chain_bolt(s, fg):
    nodes = [(8, 46), (22, 20), (36, 42), (52, 14)]
    for a, b in zip(nodes, nodes[1:]):
        mid = ((a[0] + b[0]) / 2 + 4, (a[1] + b[1]) / 2 - 4)
        pygame.draw.lines(s, fg, False, [a, mid, b], 4)
        pygame.draw.lines(s, (255, 255, 255), False, [a, mid, b], 1)
    for n in nodes:
        glow(s, n, 9, fg, 160)
        pygame.draw.circle(s, (255, 255, 255), n, 3)


def m_orb(s, fg):
    glow(s, (C, C), 28, fg, 150)
    pygame.draw.circle(s, fg, (C, C), 14)
    pygame.draw.circle(s, mix(fg, (255, 255, 255), 0.6), (C - 4, C - 5), 5)


def m_book(s, fg):
    pygame.draw.polygon(s, (240, 230, 200), [(8, 18), (C, 22), (C, 54), (8, 50)])
    pygame.draw.polygon(s, (250, 242, 215), [(56, 18), (C, 22), (C, 54), (56, 50)])
    pygame.draw.line(s, (120, 90, 60), (C, 22), (C, 54), 2)
    for y in (28, 34, 40):
        pygame.draw.line(s, (170, 150, 120), (13, y), (28, y + 2), 1)
        pygame.draw.line(s, (170, 150, 120), (36, y + 2), (51, y), 1)
    m_star(s, fg, C, 12, 8)


def m_teleport(s, fg):
    for i, a in enumerate((60, 120, 200)):
        g = pygame.Surface((S, S), pygame.SRCALPHA)
        pygame.draw.circle(g, (*fg, a), (16 + i * 16, 22), 7)
        pygame.draw.rect(g, (*fg, a), (10 + i * 16, 30, 12, 20), border_radius=5)
        s.blit(g, (0, 0))
    pygame.draw.arc(s, (255, 255, 255), (6, 6, 52, 52), 3.6, 5.8, 2)


def m_drop(s, fg, cx=C, cy=C + 4, k=1.0):
    pts = [(cx, cy - 24 * k)]
    for i in range(13):
        a = math.pi * i / 12
        pts.append((cx + math.cos(a) * 14 * k, cy + math.sin(a) * 14 * k))
    pygame.draw.polygon(s, fg, [(cx, cy - 24 * k), (cx + 14 * k, cy)] + pts[1:] + [(cx - 14 * k, cy)])
    pygame.draw.circle(s, (255, 255, 255), (int(cx - 5 * k), int(cy - 2 * k)), max(2, int(3 * k)))


def m_bubbles(s, fg):
    for x, y, r in ((18, 46, 8), (36, 40, 11), (48, 22, 6), (24, 24, 5), (44, 54, 4)):
        pygame.draw.circle(s, fg, (x, y), r)
        pygame.draw.circle(s, mix(fg, (255, 255, 255), 0.6), (x - r // 3, y - r // 3), max(1, r // 3))


def m_skull(s, fg, cy=30):
    pygame.draw.circle(s, (235, 235, 225), (C, cy), 16)
    pygame.draw.rect(s, (235, 235, 225), (C - 9, cy + 10, 18, 10), border_radius=3)
    for x in (C - 6, C + 6):
        pygame.draw.circle(s, mix(fg, (0, 0, 0), 0.5), (x, cy), 5)
    pygame.draw.polygon(s, (40, 40, 40), [(C, cy + 5), (C - 3, cy + 10), (C + 3, cy + 10)])


def m_chain(s, fg):
    for i in range(4):
        x, y = 10 + i * 12, 46 - i * 10
        pygame.draw.ellipse(s, fg, (x, y, 18, 12) if i % 2 == 0 else (x + 3, y - 3, 12, 18), 4)


def m_snowflake(s, fg, r=24, cy=C):
    for i in range(6):
        a = i * math.pi / 3
        ex, ey = C + math.cos(a) * r, cy + math.sin(a) * r
        pygame.draw.line(s, fg, (C, cy), (ex, ey), 3)
        for d in (0.55,):
            bx, by = C + math.cos(a) * r * d, cy + math.sin(a) * r * d
            for side in (-0.6, 0.6):
                pygame.draw.line(s, fg, (bx, by), (bx + math.cos(a + side) * r * 0.3, by + math.sin(a + side) * r * 0.3), 2)
    pygame.draw.circle(s, (255, 255, 255), (C, int(cy)), 4)


def m_ice_spear(s, fg):
    pts = [(C, 60), (C - 8, 30), (C - 3, 4), (C + 3, 4), (C + 8, 30)]
    pygame.draw.polygon(s, (210, 240, 255), pts)
    pygame.draw.polygon(s, fg, pts, 2)
    pygame.draw.line(s, (255, 255, 255), (C - 2, 10), (C - 4, 30), 2)
    for x, y in ((14, 50), (50, 52), (20, 58), (46, 44)):
        pygame.draw.polygon(s, (220, 245, 255), [(x, y - 6), (x + 3, y), (x, y + 6), (x - 3, y)])


def m_holy_cross(s, fg):
    glow(s, (C, C), 30, fg, 150)
    pygame.draw.rect(s, (255, 252, 230), (C - 5, 8, 10, 48), border_radius=3)
    pygame.draw.rect(s, (255, 252, 230), (C - 18, 20, 36, 10), border_radius=3)


def m_heart(s, fg):
    pygame.draw.circle(s, fg, (C - 9, 26), 11)
    pygame.draw.circle(s, fg, (C + 9, 26), 11)
    pygame.draw.polygon(s, fg, [(C - 19, 30), (C + 19, 30), (C, 54)])
    pygame.draw.rect(s, (255, 255, 255), (C - 2, 22, 4, 16))
    pygame.draw.rect(s, (255, 255, 255), (C - 8, 28, 16, 4))


def m_dagger(s, fg, ang=-0.785, ox=0, oy=0):
    blade = [(C - 3, 14), (C, 4), (C + 3, 14), (C + 2, 38), (C - 2, 38)]
    guard = [(C - 8, 38), (C + 8, 38), (C + 8, 41), (C - 8, 41)]
    hilt = [(C - 2, 41), (C + 2, 41), (C + 2, 52), (C - 2, 52)]
    for poly, col in ((blade, (220, 225, 240)), (guard, fg), (hilt, (70, 50, 70))):
        pygame.draw.polygon(s, col, rot([(x + ox, y + oy) for x, y in poly], ang, C + ox, C + oy))


def m_shuriken(s, fg):
    pts = []
    for i in range(8):
        a = i * math.pi / 4 + 0.3
        r = 26 if i % 2 == 0 else 7
        pts.append((C + math.cos(a) * r, C + math.sin(a) * r))
    pygame.draw.polygon(s, (210, 215, 230), pts)
    pygame.draw.polygon(s, fg, pts, 2)
    pygame.draw.circle(s, mix(fg, (0, 0, 0), 0.4), (C, C), 4)


def m_feather(s, fg):
    pygame.draw.ellipse(s, fg, (C - 10, 6, 20, 44))
    pygame.draw.line(s, (255, 255, 255), (C, 8), (C, 58), 2)
    for y in range(14, 46, 6):
        pygame.draw.line(s, mix(fg, (255, 255, 255), 0.4), (C, y), (C - 8, y - 4), 1)
        pygame.draw.line(s, mix(fg, (255, 255, 255), 0.4), (C, y), (C + 8, y - 4), 1)


def m_vial(s, fg):
    pygame.draw.rect(s, (200, 200, 210), (C - 5, 8, 10, 12))
    pygame.draw.circle(s, (220, 230, 240), (C, 40), 17)
    pygame.draw.circle(s, fg, (C, 43), 13)
    pygame.draw.circle(s, (255, 255, 255), (C - 6, 36), 3)
    pygame.draw.rect(s, (130, 90, 60), (C - 6, 4, 12, 6), border_radius=2)


def m_clones(s, fg):
    for i, a in enumerate((70, 130, 255)):
        g = pygame.Surface((S, S), pygame.SRCALPHA)
        x = 18 + i * 12
        pygame.draw.circle(g, (*fg, a), (x, 18), 7)
        pygame.draw.polygon(g, (*fg, a), [(x - 8, 28), (x + 8, 28), (x + 10, 56), (x - 10, 56)])
        s.blit(g, (0, 0))


def m_smoke(s, fg):
    for x, y, r, a in ((20, 40, 14, 160), (38, 36, 16, 180), (30, 22, 13, 200), (46, 50, 10, 140)):
        g = pygame.Surface((S, S), pygame.SRCALPHA)
        pygame.draw.circle(g, (*fg, a), (x, y), r)
        s.blit(g, (0, 0))


def m_void(s, fg):
    for r, a in ((28, 60), (20, 110), (12, 180)):
        g = pygame.Surface((S, S), pygame.SRCALPHA)
        pygame.draw.circle(g, (*fg, a), (C, C), r)
        s.blit(g, (0, 0))
    pygame.draw.circle(s, (10, 0, 20), (C, C), 8)
    m_whirl(s, mix(fg, (255, 255, 255), 0.3))


def m_crown(s, fg, cy=34):
    pts = [(10, cy + 14), (10, cy - 8), (21, cy + 2), (C, cy - 16), (43, cy + 2), (54, cy - 8), (54, cy + 14)]
    pygame.draw.polygon(s, (255, 210, 70), pts)
    pygame.draw.polygon(s, (200, 140, 30), pts, 2)
    for x in (21, C, 43):
        pygame.draw.circle(s, fg, (x, cy + 6), 3)


def m_meteor(s, fg):
    for i in range(6):
        pygame.draw.line(s, mix(fg, (255, 255, 200), i / 6), (8 + i * 3, 8 + i), (38, 38), 6 - i // 2)
    glow(s, (42, 42), 18, fg, 170)
    pygame.draw.circle(s, mix(fg, (60, 20, 10), 0.3), (42, 42), 12)
    pygame.draw.circle(s, (255, 230, 150), (39, 39), 4)


def m_mountain(s, fg):
    pygame.draw.polygon(s, mix(fg, (60, 60, 70), 0.4), [(4, 56), (24, 16), (40, 40), (48, 28), (60, 56)])
    pygame.draw.polygon(s, (240, 240, 250), [(24, 16), (18, 28), (30, 28)])


# ---------------- 스킬별 구성 ----------------
JOB_BG = {"warrior": (190, 70, 50), "archer": (60, 150, 80), "mage": (70, 90, 190), "thief": (120, 60, 160)}
BRANCH_BG = {"fire": (200, 80, 40), "ice": (60, 140, 200), "holy": (200, 170, 70)}

RECIPES = {
    # 전사
    "w_slash": lambda s: (m_sword(s, (240, 120, 80), ang=0.6), m_slash(s, (255, 150, 90))),
    "w_charge": lambda s: (m_dash(s, (255, 170, 90)), m_sword(s, (255, 170, 90), ang=1.57, ox=-6, scale=0.6)),
    "w_iron": lambda s: m_shield(s, (190, 200, 215)),
    "w_whirl": lambda s: (m_whirl(s, (255, 110, 70)), m_sword(s, (255, 110, 70), ang=-2.2, scale=0.55)),
    "w_rage": lambda s: (m_flame(s, k=1.1), m_arrows_up(s, (255, 230, 120))),
    "w_mastery": lambda s: (m_sword(s, (240, 200, 90), ang=-0.6), m_sword(s, (240, 200, 90), ang=0.6)),
    "w_quake": lambda s: m_quake(s, (210, 150, 80)),
    "w_holy": lambda s: (m_sunburst(s, (255, 240, 150)), m_sword(s, (255, 230, 120), ang=0, scale=0.8)),
    "w_guard": lambda s: m_shield(s, (240, 210, 110), "cross"),
    "w_star": lambda s: (m_rain(s, (255, 230, 120), "sword"), m_star(s, (255, 230, 120), C, 44, 12)),
    "w_aegis": lambda s: (m_wings(s, (255, 230, 150)), m_sword(s, (255, 220, 120), ang=0, scale=0.55)),
    "w_final": lambda s: (m_mountain(s, (180, 120, 90)), m_sword(s, (255, 200, 90), ang=0, oy=-4, scale=0.6)),
    # 궁수
    "a_double": lambda s: (m_arrow(s, (120, 220, 120), oy=-7), m_arrow(s, (120, 220, 120), oy=7)),
    "a_spread": lambda s: [m_arrow(s, (170, 255, 150), ang=a, length=40) for a in (-1.1, -0.785, -0.45)],
    "a_eye": lambda s: m_eye(s, (110, 200, 110)),
    "a_arrowrain": lambda s: [m_arrow(s, (130, 230, 130), ang=1.9, ox=x, oy=y, length=30) for x, y in ((-14, -8), (0, 4), (14, -6), (-6, 14), (12, 14))],
    "a_focus": lambda s: m_crosshair(s, (140, 240, 140)),
    "a_mastery": lambda s: m_bow(s, (120, 220, 120)),
    "a_pierce": lambda s: (m_beam(s, (200, 255, 170)), m_arrow(s, (200, 255, 170), ang=0, length=50)),
    "a_snipe": lambda s: (m_crosshair(s, (255, 230, 200)), m_arrow(s, (255, 120, 100), ang=-0.785, length=30)),
    "a_wind": lambda s: m_wind(s, (190, 255, 210)),
    "a_star": lambda s: (m_meteor(s, (255, 230, 120)), m_star(s, (255, 240, 160), 42, 42, 8)),
    "a_storm": lambda s: (m_cloud(s, (210, 220, 240)), m_bolt(s, (255, 240, 120), oy=12, k=0.6)),
    "a_final": lambda s: (m_bow(s, (255, 210, 90)), m_crown(s, (255, 90, 90), cy=12)),
    # 도적
    "t_double": lambda s: (m_dagger(s, (200, 120, 255), ang=-0.6), m_dagger(s, (200, 120, 255), ang=0.6)),
    "t_star": lambda s: m_shuriken(s, (220, 190, 255)),
    "t_haste": lambda s: (m_feather(s, (220, 200, 255)), m_dash(s, (180, 140, 255))),
    "t_flurry": lambda s: (m_whirl(s, (200, 110, 255)), m_dagger(s, (220, 180, 255), ang=0.3)),
    "t_poison": lambda s: m_vial(s, (130, 220, 80)),
    "t_mastery": lambda s: (m_crosshair(s, (220, 160, 255)), m_dagger(s, (230, 200, 255), ang=0.785)),
    "t_shadow": lambda s: m_clones(s, (140, 90, 210)),
    "t_assassin": lambda s: (m_dash(s, (255, 90, 160)), m_dagger(s, (255, 90, 160), ang=1.2)),
    "t_veil": lambda s: m_smoke(s, (120, 100, 150)),
    "t_void": lambda s: m_void(s, (160, 60, 230)),
    "t_hunt": lambda s: m_eye(s, (220, 50, 80)),
    "t_final": lambda s: (m_crown(s, (180, 80, 255), cy=18), m_dagger(s, (230, 200, 255), ang=0, oy=10)),
    # 마법사 공통
    "m_bolt": lambda s: m_orb(s, (140, 180, 255)),
    "m_flame": lambda s: m_flame(s),
    "m_wisdom": lambda s: m_book(s, (150, 190, 255)),
    "m_blink": lambda s: m_teleport(s, (170, 190, 255)),
    "m_mpeater": lambda s: (m_drop(s, (90, 140, 255)), m_arrows_up(s, (200, 220, 255))),
    "m_focus": lambda s: (m_orb(s, (200, 170, 255)), m_arrows_up(s, (255, 240, 200))),
    "m_amp": lambda s: (m_sunburst(s, (200, 160, 255)), m_orb(s, (255, 200, 255))),
    # 화염·독
    "mf_firearrow": lambda s: (m_flame(s, cx=22, cy=42, k=0.6), m_arrow(s, (255, 120, 50), length=46)),
    "mf_toxic": lambda s: (m_drop(s, (120, 220, 70), cy=30, k=0.9), m_bubbles(s, (150, 230, 90))),
    "mf_blaze": lambda s: (m_whirl(s, (255, 120, 40)), m_flame(s, k=0.8)),
    "mf_venom": lambda s: (m_bubbles(s, (110, 200, 70)), m_skull(s, (110, 200, 70), cy=26)),
    "mf_seal": lambda s: (m_chain(s, (240, 180, 100)), m_star(s, (255, 150, 80), 46, 16, 9)),
    "mf_inferno": lambda s: (m_meteor(s, (255, 90, 30)), m_flame(s, cx=40, cy=50, k=0.45)),
    "mf_plague": lambda s: (m_smoke(s, (110, 190, 60)), m_skull(s, (90, 160, 50), cy=32)),
    "mf_wrath": lambda s: (m_wings(s, (255, 130, 60)), m_flame(s, cy=40, k=0.5)),
    "mf_master": lambda s: (m_flame(s, cx=22, cy=38, k=0.7), m_drop(s, (120, 220, 70), cx=44, cy=40, k=0.7)),
    # 얼음·번개
    "mi_coldray": lambda s: (m_beam(s, (160, 220, 255)), m_snowflake(s, (240, 250, 255), r=12)),
    "mi_spark": lambda s: (m_orb(s, (240, 240, 140)), m_bolt(s, k=0.55)),
    "mi_icespear": lambda s: m_ice_spear(s, (130, 200, 255)),
    "mi_chain": lambda s: m_chain_bolt(s, (250, 245, 150)),
    "mi_ward": lambda s: m_shield(s, (170, 220, 255), "snow"),
    "mi_blizzard": lambda s: (m_snowflake(s, (230, 248, 255)), m_rain(s, (230, 248, 255), "ice")),
    "mi_thunder": lambda s: (m_cloud(s, (90, 100, 140), cy=14), m_bolt(s, k=0.8, oy=8)),
    "mi_wrath": lambda s: (m_wings(s, (170, 220, 255)), m_bolt(s, k=0.45, oy=4)),
    "mi_master": lambda s: (m_snowflake(s, (220, 245, 255), r=18), m_bolt(s, k=0.45)),
    # 신성
    "mh_heal": lambda s: m_heart(s, (120, 230, 140)),
    "mh_holyarrow": lambda s: (m_sunburst(s, (255, 240, 160)), m_arrow(s, (255, 230, 130), length=50)),
    "mh_guard": lambda s: m_shield(s, (255, 225, 130), "cross"),
    "mh_bless": lambda s: (m_sunburst(s, (255, 235, 150)), m_star(s, (255, 250, 210), r=12)),
    "mh_holybomb": lambda s: (m_sunburst(s, (255, 245, 180)), m_holy_cross(s, (255, 245, 180))),
    "mh_chain": lambda s: (m_chain(s, (255, 225, 120)), m_sunburst(s, (255, 240, 160))),
    "mh_cleanse": lambda s: (m_holy_cross(s, (170, 240, 200)), m_drop(s, (150, 230, 190), cx=48, cy=48, k=0.45)),
    "mh_faith": lambda s: m_book(s, (255, 230, 140)),
    "mh_judgment": lambda s: (m_rain(s, (255, 240, 160)), m_sunburst(s, (255, 240, 170))),
    "mh_revive": lambda s: (m_wings(s, (255, 250, 220)), m_heart(s, (255, 200, 120))),
    "mh_grace": lambda s: (m_wings(s, (255, 230, 150)), m_star(s, (255, 250, 200), C, 34, 10)),
    "mh_master": lambda s: (m_holy_cross(s, (255, 235, 160)), m_crown(s, (120, 200, 255), cy=14)),
}


def bg_color(skill):
    b = skill.get("branch")
    if isinstance(b, str):
        return BRANCH_BG[b]
    return JOB_BG.get(skill["job"], (90, 90, 120))


def make(skill):
    s = pygame.Surface((S, S), pygame.SRCALPHA)
    background(s, bg_color(skill))
    RECIPES.get(skill["id"], lambda surf: m_star(surf, (255, 255, 255)))(s)
    return s


def main(force=False):
    pygame.init()
    pygame.display.set_mode((1, 1))
    os.makedirs(OUT, exist_ok=True)
    made = 0
    for sid, sk in SKILLS.items():
        path = os.path.join(OUT, sid + ".png")
        if os.path.exists(path) and not force:
            continue
        pygame.image.save(make(sk), path)
        made += 1
    missing = [sid for sid in SKILLS if sid not in RECIPES]
    print(f"{made}개 아이콘 생성 -> {OUT}" + (f" (기본 별 아이콘: {missing})" if missing else ""))


if __name__ == "__main__":
    main("--force" in sys.argv)
