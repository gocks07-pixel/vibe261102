"""도형 기반 캐릭터/몬스터/NPC 그리기와 스킬 아이콘 로더."""
import math
import os

import pygame

from .config import font, SKILL_ICON_DIR, WHITE, BLACK, YELLOW

_icon_cache = {}


def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


def text(surf, s, pos, size=14, color=WHITE, bold=False, center=False, shadow=True, right=False):
    f = font(size, bold)
    img = f.render(str(s), True, color)
    r = img.get_rect()
    if center:
        r.center = pos
    elif right:
        r.topright = pos
    else:
        r.topleft = pos
    if shadow:
        surf.blit(f.render(str(s), True, (0, 0, 0)), r.move(1, 1))
    surf.blit(img, r)
    return r


def skill_icon(skill, size=32):
    """assets/skills/<skill id>.png 가 있으면 그 이미지를, 없으면 기본 아이콘을 사용."""
    key = (skill["id"], size)
    if key in _icon_cache:
        return _icon_cache[key]
    img = None
    for ext in (".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"):
        path = os.path.join(SKILL_ICON_DIR, skill["id"] + ext)
        if os.path.exists(path):
            try:
                img = pygame.transform.smoothscale(pygame.image.load(path).convert_alpha(), (size, size))
            except pygame.error:
                img = None
            break
    if img is None:
        img = pygame.Surface((size, size), pygame.SRCALPHA)
        col = tuple(skill.get("color", [150, 150, 200]))
        if skill["type"] == "buff":
            col = (240, 190, 80)
        elif skill["type"] == "passive":
            col = (130, 130, 150)
        pygame.draw.rect(img, shade(col, 0.55), (0, 0, size, size), border_radius=6)
        pygame.draw.rect(img, col, (2, 2, size - 4, size - 4), border_radius=5)
        f = font(int(size * 0.5), True)
        ch = f.render(skill["name"][0], True, WHITE)
        img.blit(ch, ch.get_rect(center=(size // 2, size // 2)))
    _icon_cache[key] = img
    return img


# ---------------- 플레이어 ----------------
WEAPON_DRAW = {"warrior": "sword", "archer": "bow", "mage": "staff", "thief": "dagger", "beginner": "stick"}


def draw_player(surf, x, y, facing, job, color, t, attacking=0.0, flash=False, has_weapon=True):
    """x, y = 발 중앙 화면 좌표."""
    skin = (255, 222, 190)
    body = shade(color, 1.0)
    bob = math.sin(t * 10) * 1.5 if not attacking else 0
    if flash and int(t * 20) % 2 == 0:
        return
    # 다리
    pygame.draw.rect(surf, (60, 60, 80), (x - 9, y - 16, 7, 16), border_radius=3)
    pygame.draw.rect(surf, (60, 60, 80), (x + 2, y - 16, 7, 16), border_radius=3)
    # 몸통
    pygame.draw.rect(surf, body, (x - 12, y - 38 + bob, 24, 24), border_radius=6)
    pygame.draw.rect(surf, shade(body, 0.7), (x - 12, y - 20 + bob, 24, 5))
    # 머리
    hx, hy = x, y - 50 + bob
    pygame.draw.circle(surf, skin, (hx, hy), 14)
    pygame.draw.ellipse(surf, (90, 60, 40), (hx - 15, hy - 16, 30, 16))
    ex = hx + 5 * facing
    pygame.draw.circle(surf, BLACK, (ex, hy + 1), 2)
    pygame.draw.circle(surf, BLACK, (ex - 7 * facing, hy + 1), 2)
    # 별잎 문양
    pygame.draw.circle(surf, YELLOW, (x - 7 * facing, y - 27 + bob), 2)
    # 무기
    if not has_weapon:
        return
    kind = WEAPON_DRAW.get(job, "stick")
    swing = attacking
    ang = (-60 + 140 * (1 - swing)) if swing > 0 else -30
    hand = (x + 12 * facing, y - 28 + bob)
    rad = math.radians(ang)
    if kind in ("sword", "stick", "dagger", "staff"):
        length = {"sword": 34, "stick": 26, "dagger": 20, "staff": 38}[kind]
        tip = (hand[0] + math.cos(rad) * length * facing, hand[1] - math.sin(rad) * length)
        colr = {"sword": (210, 220, 235), "stick": (140, 100, 60), "dagger": (200, 200, 220), "staff": (150, 110, 70)}[kind]
        pygame.draw.line(surf, colr, hand, tip, 4 if kind != "dagger" else 3)
        if kind == "staff":
            pygame.draw.circle(surf, (120, 180, 255), (int(tip[0]), int(tip[1])), 6)
    elif kind == "bow":
        bx = hand[0] + 4 * facing
        pygame.draw.arc(surf, (150, 100, 60), (bx - 10 if facing > 0 else bx - 4, hand[1] - 18, 14, 36),
                        -math.pi / 2 if facing > 0 else math.pi / 2, math.pi / 2 if facing > 0 else 3 * math.pi / 2, 3)
        pygame.draw.line(surf, (230, 230, 230), (bx, hand[1] - 17), (bx, hand[1] + 17), 1)


# ---------------- NPC ----------------
def draw_npc(surf, npc, x, y, t, marker=None):
    look = npc["look"]
    col = tuple(npc["color"])
    if look == "board":
        pygame.draw.rect(surf, (110, 80, 50), (x - 4, y - 70, 8, 70))
        pygame.draw.rect(surf, col, (x - 36, y - 90, 72, 46), border_radius=4)
        pygame.draw.rect(surf, (240, 230, 200), (x - 30, y - 85, 26, 18))
        pygame.draw.rect(surf, (240, 230, 200), (x + 2, y - 80, 26, 22))
        top = y - 92
    elif look == "spirit":
        glow = pygame.Surface((90, 90), pygame.SRCALPHA)
        pygame.draw.circle(glow, (*col, 70), (45, 45), 40 + 4 * math.sin(t * 3))
        surf.blit(glow, (x - 45, y - 100))
        pygame.draw.circle(surf, col, (x, y - 55), 18)
        pygame.draw.polygon(surf, shade(col, 0.9), [(x - 16, y - 45), (x + 16, y - 45), (x, y - 8)])
        top = y - 80
    else:
        h = 38 if look == "child" else 48
        skin = (255, 222, 190)
        pygame.draw.rect(surf, shade(col, 0.6), (x - 10, y - 14, 20, 14), border_radius=3)
        pygame.draw.rect(surf, col, (x - 13, y - h + 6, 26, h - 18), border_radius=7)
        hr = 12 if look == "child" else 14
        hy = y - h - 4
        pygame.draw.circle(surf, skin, (x, hy), hr)
        hair = {"elder": (230, 230, 230), "merchant": (120, 70, 40), "scholar": (60, 40, 30)}.get(look, (80, 55, 35))
        pygame.draw.ellipse(surf, hair, (x - hr - 1, hy - hr - 2, hr * 2 + 2, hr + 2))
        if look == "elder":
            pygame.draw.polygon(surf, (235, 235, 235), [(x - 8, hy + 6), (x + 8, hy + 6), (x, hy + 22)])
        if look == "merchant":
            pygame.draw.rect(surf, (200, 160, 80), (x + 12, y - 30, 14, 12), border_radius=2)
        if look == "fighter":
            pygame.draw.line(surf, (200, 210, 230), (x + 16, y - 50), (x + 16, y - 12), 3)
        pygame.draw.circle(surf, BLACK, (x - 4, hy), 2)
        pygame.draw.circle(surf, BLACK, (x + 4, hy), 2)
        top = hy - hr - 4
    text(surf, npc["name"], (x, y + 12), 13, (255, 245, 200), center=True)
    if marker:
        mc = {"!": YELLOW, "?": (120, 255, 140), "…": (200, 200, 200)}[marker]
        yy = top - 18 + math.sin(t * 4) * 3
        text(surf, marker, (x, yy), 26, mc, bold=True, center=True)
    return pygame.Rect(x - 25, top, 50, y - top + 10)


# ---------------- 몬스터 ----------------
def draw_monster(surf, m, sx, sy, t):
    """sx, sy = 발 중앙 화면 좌표."""
    col = tuple(m.data["color"])
    if m.hit_flash > 0:
        col = (255, 255, 255)
    s = m.scale
    shape = m.data["shape"]
    f = m.facing
    ph = t * 6 + m.phase
    if shape == "slime":
        sq = math.sin(ph) * 3 * s
        w, h = 36 * s + sq, 28 * s - sq
        r = pygame.Rect(0, 0, w, h)
        r.midbottom = (sx, sy)
        pygame.draw.ellipse(surf, col, r)
        pygame.draw.ellipse(surf, shade(col, 1.25), (r.x + w * 0.2, r.y + h * 0.15, w * 0.3, h * 0.25))
        eye_y = r.y + h * 0.45
        _eyes(surf, sx + 4 * s * f, eye_y, s, f)
        if m.kind == "boss":
            _crown(surf, sx, r.y, s)
    elif shape in ("beast", "crab"):
        w, h = 44 * s, 26 * s
        leg = math.sin(ph * 1.5) * 4 * s
        body = pygame.Rect(0, 0, w, h)
        body.midbottom = (sx, sy - 8 * s)
        for lx in (-0.3, 0.25):
            pygame.draw.line(surf, shade(col, 0.6), (sx + lx * w, sy - 10 * s), (sx + lx * w + leg, sy), max(2, int(4 * s)))
        pygame.draw.ellipse(surf, col, body)
        if shape == "crab":
            for side in (-1, 1):
                pygame.draw.circle(surf, shade(col, 0.85), (int(sx + side * w * 0.55), int(body.y + 4 * s)), int(8 * s))
            _eyes(surf, sx, body.y + 2, s, f)
        else:
            head = (int(sx + f * w * 0.45), int(body.y + h * 0.3))
            pygame.draw.circle(surf, col, head, int(13 * s))
            pygame.draw.polygon(surf, shade(col, 0.7), [(head[0] - 6 * s, head[1] - 8 * s), (head[0] - 2 * s, head[1] - 20 * s), (head[0] + 3 * s, head[1] - 9 * s)])
            _eyes(surf, head[0] + 3 * s * f, head[1] - 2, s, f)
    elif shape in ("flyer", "spirit"):
        cy = sy - 30 * s
        if shape == "flyer":
            wing = math.sin(ph * 2.5) * 12 * s
            for side in (-1, 1):
                pygame.draw.polygon(surf, shade(col, 0.75), [(sx, cy), (sx + side * 30 * s, cy - 10 * s - wing), (sx + side * 22 * s, cy + 8 * s)])
            pygame.draw.circle(surf, col, (int(sx), int(cy)), int(13 * s))
        else:
            glow = pygame.Surface((int(70 * s), int(70 * s)), pygame.SRCALPHA)
            pygame.draw.circle(glow, (*col, 80), (int(35 * s), int(35 * s)), int(30 * s))
            surf.blit(glow, (sx - 35 * s, cy - 35 * s))
            pygame.draw.circle(surf, col, (int(sx), int(cy)), int(14 * s))
            pygame.draw.polygon(surf, col, [(sx - 12 * s, cy + 4 * s), (sx + 12 * s, cy + 4 * s), (sx - f * 6 * s, cy + 26 * s)])
        _eyes(surf, sx + 3 * s * f, cy - 2, s, f)
    elif shape == "golem":
        w, h = 40 * s, 46 * s
        body = pygame.Rect(0, 0, w, h)
        body.midbottom = (sx, sy)
        pygame.draw.rect(surf, col, body, border_radius=int(6 * s))
        pygame.draw.rect(surf, shade(col, 0.75), (body.x - 8 * s, body.y + 12 * s, 10 * s, 22 * s), border_radius=3)
        pygame.draw.rect(surf, shade(col, 0.75), (body.right - 2 * s, body.y + 12 * s, 10 * s, 22 * s), border_radius=3)
        pygame.draw.rect(surf, shade(col, 0.6), (body.x + 6 * s, body.y + 8 * s, w - 12 * s, 10 * s), border_radius=3)
        pygame.draw.circle(surf, (255, 230, 120) if m.kind != "boss" else (255, 80, 80), (int(sx + 6 * s * f), int(body.y + 13 * s)), int(3 * s))
        if m.kind == "boss":
            _crown(surf, sx, body.y, s)
    elif shape == "knight":
        w, h = 30 * s, 50 * s
        body = pygame.Rect(0, 0, w, h)
        body.midbottom = (sx, sy)
        pygame.draw.rect(surf, shade(col, 0.7), (sx - 10 * s, sy - 14 * s, 20 * s, 14 * s))
        pygame.draw.rect(surf, col, (body.x, body.y + 14 * s, w, h - 26 * s), border_radius=int(5 * s))
        pygame.draw.circle(surf, shade(col, 1.15), (int(sx), int(body.y + 10 * s)), int(11 * s))
        pygame.draw.rect(surf, (20, 20, 30), (sx - 2 * s + f * 2 * s, body.y + 8 * s, 8 * s * f if f > 0 else 8 * s, 3 * s))
        pygame.draw.line(surf, (210, 215, 230), (sx + f * 16 * s, sy - 40 * s), (sx + f * 24 * s, sy - 6 * s), max(2, int(3 * s)))
        if m.kind == "boss":
            cape = [(sx - f * 12 * s, body.y + 16 * s), (sx - f * 30 * s, sy), (sx - f * 6 * s, sy - 6 * s)]
            pygame.draw.polygon(surf, (120, 30, 60), cape)
            _crown(surf, sx, body.y - 2 * s, s)
    elif shape == "dragon":
        w, h = 70 * s, 34 * s
        cy = sy - 26 * s
        wing = math.sin(ph * 1.6) * 20 * s
        for side in (-0.2, 0.2):
            pygame.draw.polygon(surf, shade(col, 0.7), [(sx + side * w, cy - 6 * s), (sx + side * w - 20 * s, cy - 40 * s - wing), (sx + side * w + 26 * s, cy - 30 * s - wing)])
        body = pygame.Rect(0, 0, w, h)
        body.center = (sx, cy)
        pygame.draw.ellipse(surf, col, body)
        pygame.draw.polygon(surf, col, [(sx - f * w * 0.4, cy), (sx - f * w * 0.85, cy - 10 * s), (sx - f * w * 0.45, cy + 10 * s)])
        head = (int(sx + f * w * 0.5), int(cy - 10 * s))
        pygame.draw.circle(surf, shade(col, 1.1), head, int(14 * s))
        pygame.draw.circle(surf, (255, 240, 120), (head[0] + int(5 * s * f), head[1] - 3), max(2, int(3 * s)))
        for lx in (-0.2, 0.2):
            pygame.draw.line(surf, shade(col, 0.6), (sx + lx * w, cy + h / 2 - 4), (sx + lx * w, sy), max(3, int(5 * s)))


def _eyes(surf, x, y, s, f):
    r = max(2, int(3 * s))
    pygame.draw.circle(surf, WHITE, (int(x - 5 * s), int(y)), r + 1)
    pygame.draw.circle(surf, WHITE, (int(x + 5 * s), int(y)), r + 1)
    pygame.draw.circle(surf, BLACK, (int(x - 5 * s + f), int(y)), r - 1 if r > 2 else 1)
    pygame.draw.circle(surf, BLACK, (int(x + 5 * s + f), int(y)), r - 1 if r > 2 else 1)


def _crown(surf, x, top, s):
    pts = [(x - 14 * s, top), (x - 14 * s, top - 12 * s), (x - 7 * s, top - 5 * s), (x, top - 15 * s),
           (x + 7 * s, top - 5 * s), (x + 14 * s, top - 12 * s), (x + 14 * s, top)]
    pygame.draw.polygon(surf, (255, 210, 60), pts)
