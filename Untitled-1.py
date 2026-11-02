"""
SKY STRIKER - 종스크롤 슈팅 게임 (pygame)

조작법
  방향키 / WASD : 이동
  Z / Space     : 공중 레이저 (공중 적 공격)
  X             : 지상 폭탄 (조준점 위치의 지상 목표 공격)
  C             : 메가 폭탄 (화면 전체 공격, 보유 개수만큼)
  P             : 일시정지

아이템 (적을 격추하면 떨어짐)
  P (빨강)  : 파워업 - 총알 2 → 4 → 6 → 8발
  W (파랑)  : 보조 비행기(윙맨) 추가, 최대 2대 - 함께 공격하고 적 탄을 막아줌
  M (초록)  : 유도 미사일 - 최대 2단계
  S (하늘)  : 실드 - 피격 3회 방어
  B (주황)  : 메가 폭탄 1개 추가 (최대 3개)
  1UP (분홍): 목숨 +1
  $ (금색)  : 보너스 점수 1000점

  격추당하면 파워 1단계 감소, 윙맨/미사일/실드는 사라집니다.
  Enter         : 시작 / 재시작
  Esc           : 종료

외부 이미지/사운드 파일 없이 모든 그래픽을 코드로 그립니다.
"""

import math
import random
import sys

import pygame

# ===================== 기본 설정 =====================
WIDTH, HEIGHT = 480, 720
FPS = 60
TILE = 40
COLS = WIDTH // TILE
SCROLL_SPEED = 1.5

PLAYER_SPEED = 4.5
LASER_SPEED = 12
LASER_COOLDOWN = 7
BOMB_COOLDOWN = 30
BOMB_RANGE = 170          # 조준점까지의 거리
BOMB_FLIGHT = 24          # 폭탄이 떨어지는 데 걸리는 프레임
BOMB_RADIUS = 26

BOSS_INTERVAL = 60 * 45   # 45초마다 보스 등장

MAX_POWER = 4             # 파워 단계: 1~4 → 총알 2/4/6/8발
MAX_WINGMEN = 2
MAX_MISSILE = 2
MAX_MEGA = 3
SHIELD_HITS = 3

# 파워 단계별 발사 패턴: (x 오프셋, 각도[도])
SHOT_PATTERNS = {
    1: [(-6, 0), (6, 0)],
    2: [(-6, 0), (6, 0), (-12, -8), (12, 8)],
    3: [(-6, 0), (6, 0), (-14, 0), (14, 0), (-12, -10), (12, 10)],
    4: [(-6, 0), (6, 0), (-14, 0), (14, 0), (-12, -8), (12, 8), (-16, -18), (16, 18)],
}

# 아이템 종류: 글자, 색상, 출현 가중치
ITEM_TYPES = {
    "power":   ("P", (255, 80, 80), 34),
    "wingman": ("W", (80, 140, 255), 16),
    "missile": ("M", (90, 220, 110), 16),
    "shield":  ("S", (90, 220, 255), 12),
    "mega":    ("B", (255, 160, 50), 10),
    "life":    ("1UP", (255, 120, 200), 3),
    "medal":   ("$", (255, 210, 60), 9),
}

# 색상
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
YELLOW = (255, 220, 80)
RED = (255, 70, 70)
ORANGE = (255, 150, 50)
CYAN = (90, 220, 255)
GRASS = (70, 120, 60)
GRASS_DARK = (58, 104, 50)
FOREST = (35, 80, 40)
FOREST_LIGHT = (50, 100, 50)
WATER = (40, 80, 150)
WATER_LIGHT = (70, 120, 190)
SAND = (190, 170, 110)
ROAD = (110, 105, 95)
METAL = (150, 155, 170)
METAL_DARK = (90, 95, 110)


# ===================== 유틸 =====================
def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def aim(from_pos, to_pos, speed):
    dx = to_pos[0] - from_pos[0]
    dy = to_pos[1] - from_pos[1]
    d = math.hypot(dx, dy) or 1
    return dx / d * speed, dy / d * speed


# ===================== 지형 =====================
class Terrain:
    """타일 행을 절차적으로 생성하며 아래로 스크롤되는 지형."""

    TILE_TYPES = ("grass", "forest", "water", "sand", "road")

    def __init__(self):
        self.tiles = self._build_tiles()
        self.rows = []            # 위(인덱스 0)부터 아래 순서
        self.offset = 0.0
        self.river_x = random.uniform(2, COLS - 3)
        self.river_w = 2.0
        self.road_x = random.randint(1, COLS - 2)
        self.forest_seed = random.random() * 100
        self.row_count = 0
        for _ in range(HEIGHT // TILE + 2):
            self.rows.append(self._make_row())

    def _build_tiles(self):
        tiles = {}
        rnd = random.Random(7)

        def base(color, dots, dot_colors):
            s = pygame.Surface((TILE, TILE))
            s.fill(color)
            for _ in range(dots):
                c = rnd.choice(dot_colors)
                x, y = rnd.randrange(TILE), rnd.randrange(TILE)
                pygame.draw.circle(s, c, (x, y), rnd.randint(1, 3))
            return s

        tiles["grass"] = base(GRASS, 14, [GRASS_DARK, (85, 135, 70)])
        f = base(FOREST, 0, [FOREST])
        for _ in range(6):
            x, y = rnd.randrange(4, TILE - 4), rnd.randrange(4, TILE - 4)
            pygame.draw.circle(f, FOREST_LIGHT, (x, y), rnd.randint(6, 10))
            pygame.draw.circle(f, (30, 65, 35), (x + 2, y + 2), 4)
        tiles["forest"] = f
        w = base(WATER, 0, [WATER])
        for i in range(3):
            y = 8 + i * 12
            pygame.draw.line(w, WATER_LIGHT, (rnd.randrange(0, 10), y), (rnd.randrange(20, 38), y), 2)
        tiles["water"] = w
        tiles["sand"] = base(SAND, 18, [(170, 150, 95), (205, 185, 130)])
        r = pygame.Surface((TILE, TILE))
        r.fill(ROAD)
        pygame.draw.line(r, (200, 190, 120), (TILE // 2, 4), (TILE // 2, 16), 2)
        pygame.draw.line(r, (200, 190, 120), (TILE // 2, 24), (TILE // 2, 36), 2)
        tiles["road"] = r
        return tiles

    def _make_row(self):
        self.row_count += 1
        # 강은 천천히 좌우로 굽이친다
        self.river_x += random.uniform(-0.45, 0.45)
        self.river_x = clamp(self.river_x, 1.5, COLS - 2.5)
        self.river_w = clamp(self.river_w + random.uniform(-0.25, 0.25), 1.2, 3.2)
        if random.random() < 0.03:
            self.road_x = random.randint(1, COLS - 2)

        row = []
        t = self.row_count * 0.15
        for c in range(COLS):
            dist = abs(c + 0.5 - self.river_x)
            if dist < self.river_w / 2:
                kind = "water"
            elif dist < self.river_w / 2 + 0.7:
                kind = "sand"
            elif c == self.road_x:
                kind = "road"
            else:
                n = math.sin(c * 0.9 + t + self.forest_seed) + math.sin(c * 0.37 - t * 1.7)
                kind = "forest" if n > 0.9 else "grass"
            row.append(kind)
        return row

    def update(self):
        self.offset += SCROLL_SPEED
        while self.offset >= TILE:
            self.offset -= TILE
            self.rows.pop()
            self.rows.insert(0, self._make_row())

    def tile_at(self, x, y):
        """화면 좌표의 지형 종류."""
        r = int((y - self.offset + TILE) // TILE)
        c = int(x // TILE)
        if 0 <= r < len(self.rows) and 0 <= c < COLS:
            return self.rows[r][c]
        return "grass"

    def draw(self, surf):
        for r, row in enumerate(self.rows):
            y = (r - 1) * TILE + self.offset
            for c, kind in enumerate(row):
                surf.blit(self.tiles[kind], (c * TILE, y))


# ===================== 이펙트 =====================
class Particle:
    def __init__(self, x, y, color, speed=3.0, life=30, size=3):
        ang = random.uniform(0, math.tau)
        sp = random.uniform(0.3, speed)
        self.x, self.y = x, y
        self.vx, self.vy = math.cos(ang) * sp, math.sin(ang) * sp
        self.life = self.max_life = random.randint(life // 2, life)
        self.color = color
        self.size = size

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.vx *= 0.95
        self.vy *= 0.95
        self.life -= 1

    def draw(self, surf):
        r = max(1, int(self.size * self.life / self.max_life))
        pygame.draw.circle(surf, self.color, (int(self.x), int(self.y)), r)


class Ring:
    """폭발 충격파 링."""

    def __init__(self, x, y, max_r, color=WHITE, ground=False):
        self.x, self.y = x, y
        self.r = 2
        self.max_r = max_r
        self.color = color
        self.ground = ground
        self.life = 1

    def update(self):
        self.r += (self.max_r - self.r) * 0.25 + 0.5
        if self.ground:
            self.y += SCROLL_SPEED
        if self.r >= self.max_r - 1:
            self.life = 0

    def draw(self, surf):
        w = max(1, int(4 * (1 - self.r / self.max_r)) + 1)
        pygame.draw.circle(surf, self.color, (int(self.x), int(self.y)), int(self.r), w)


class Crater:
    """지상 목표 파괴 후 남는 흔적 (지형과 함께 스크롤)."""

    def __init__(self, x, y, r):
        self.x, self.y, self.r = x, y, r

    def update(self):
        self.y += SCROLL_SPEED

    def draw(self, surf):
        pygame.draw.circle(surf, (45, 40, 35), (int(self.x), int(self.y)), self.r)
        pygame.draw.circle(surf, (70, 60, 50), (int(self.x), int(self.y)), self.r, 2)


# ===================== 플레이어 =====================
class Player:
    def __init__(self):
        self.x = WIDTH / 2
        self.y = HEIGHT - 110
        self.radius = 7
        self.laser_cd = 0
        self.bomb_cd = 0
        self.invincible = 120
        self.alive = True
        self.tick = 0
        self.power = 1        # 1~4 → 총알 2/4/6/8발
        self.missile = 0      # 유도 미사일 단계 0~2
        self.missile_cd = 0
        self.shield = 0       # 남은 실드 방어 횟수

    @property
    def target(self):
        return self.x, self.y - BOMB_RANGE

    def update(self, keys):
        self.tick += 1
        dx = (keys[pygame.K_RIGHT] or keys[pygame.K_d]) - (keys[pygame.K_LEFT] or keys[pygame.K_a])
        dy = (keys[pygame.K_DOWN] or keys[pygame.K_s]) - (keys[pygame.K_UP] or keys[pygame.K_w])
        if dx and dy:
            dx *= 0.7071
            dy *= 0.7071
        self.x = clamp(self.x + dx * PLAYER_SPEED, 16, WIDTH - 16)
        self.y = clamp(self.y + dy * PLAYER_SPEED, BOMB_RANGE + 20, HEIGHT - 24)
        self.laser_cd = max(0, self.laser_cd - 1)
        self.bomb_cd = max(0, self.bomb_cd - 1)
        self.missile_cd = max(0, self.missile_cd - 1)
        self.invincible = max(0, self.invincible - 1)

    def draw(self, surf):
        if self.invincible and (self.invincible // 4) % 2:
            return
        x, y = self.x, self.y
        # 그림자 (지상에 비친)
        pygame.draw.ellipse(surf, (0, 0, 0, 0), (x - 10, y + 22, 20, 8))
        shadow = pygame.Surface((30, 14), pygame.SRCALPHA)
        pygame.draw.ellipse(shadow, (0, 0, 0, 90), shadow.get_rect())
        surf.blit(shadow, (x - 15 + 10, y + 18))
        # 날개
        pygame.draw.polygon(surf, METAL_DARK, [(x, y - 4), (x - 20, y + 12), (x - 18, y + 16), (x, y + 8)])
        pygame.draw.polygon(surf, METAL_DARK, [(x, y - 4), (x + 20, y + 12), (x + 18, y + 16), (x, y + 8)])
        # 동체
        pygame.draw.polygon(surf, (225, 230, 240), [(x, y - 20), (x - 7, y + 4), (x - 5, y + 16), (x + 5, y + 16), (x + 7, y + 4)])
        pygame.draw.polygon(surf, (40, 120, 220), [(x, y - 10), (x - 3, y), (x + 3, y)])
        # 엔진 불꽃
        flame = 6 + (self.tick % 6)
        pygame.draw.polygon(surf, ORANGE, [(x - 4, y + 16), (x + 4, y + 16), (x, y + 16 + flame)])
        pygame.draw.polygon(surf, YELLOW, [(x - 2, y + 16), (x + 2, y + 16), (x, y + 12 + flame)])
        # 실드
        if self.shield:
            r = 24 + int(math.sin(self.tick * 0.2) * 2)
            bubble = pygame.Surface((r * 2 + 4, r * 2 + 4), pygame.SRCALPHA)
            pygame.draw.circle(bubble, (90, 220, 255, 50), (r + 2, r + 2), r)
            pygame.draw.circle(bubble, (150, 240, 255, 90 + 50 * self.shield), (r + 2, r + 2), r, 2)
            surf.blit(bubble, (x - r - 2, y - r))

    def draw_reticle(self, surf, locked):
        tx, ty = self.target
        color = RED if locked else (230, 230, 230)
        r = 12
        pygame.draw.line(surf, color, (tx - r, ty), (tx - 4, ty), 2)
        pygame.draw.line(surf, color, (tx + 4, ty), (tx + r, ty), 2)
        pygame.draw.line(surf, color, (tx, ty - r), (tx, ty - 4), 2)
        pygame.draw.line(surf, color, (tx, ty + 4), (tx, ty + r), 2)
        pygame.draw.rect(surf, color, (tx - r, ty - r, r * 2, r * 2), 1)


class Laser:
    def __init__(self, x, y, angle_deg=0.0, color=CYAN, dmg=1):
        self.x, self.y = x, y
        a = math.radians(angle_deg)
        self.vx = math.sin(a) * LASER_SPEED
        self.vy = -math.cos(a) * LASER_SPEED
        self.color = color
        self.dmg = dmg
        self.alive = True

    def update(self):
        self.x += self.vx
        self.y += self.vy
        if self.y < -20 or self.x < -20 or self.x > WIDTH + 20:
            self.alive = False

    def rect(self):
        return pygame.Rect(self.x - 3, self.y - 10, 6, 20)

    def draw(self, surf):
        k = 10 / LASER_SPEED
        tail = (self.x - self.vx * k, self.y - self.vy * k)
        head = (self.x + self.vx * k, self.y + self.vy * k)
        pygame.draw.line(surf, self.color, tail, head, 4)
        pygame.draw.line(surf, WHITE, tail, head, 2)


class Missile:
    """가장 가까운 공중 적(또는 보스 포대)을 추적하는 유도 미사일."""

    SPEED = 7.0
    TURN = 0.12

    def __init__(self, x, y, side):
        self.x, self.y = x, y
        self.angle = -math.pi / 2 + side * 0.9   # 좌우로 퍼지며 발사
        self.alive = True
        self.dmg = 2
        self.life = 140
        self.trail = []

    def update(self, game):
        self.life -= 1
        tgt = game.nearest_air_target(self.x, self.y)
        if tgt:
            want = math.atan2(tgt[1] - self.y, tgt[0] - self.x)
            diff = (want - self.angle + math.pi) % math.tau - math.pi
            self.angle += clamp(diff, -self.TURN, self.TURN)
        self.trail.append((self.x, self.y))
        self.trail = self.trail[-6:]
        self.x += math.cos(self.angle) * self.SPEED
        self.y += math.sin(self.angle) * self.SPEED
        if self.life <= 0 or not (-30 < self.x < WIDTH + 30 and -30 < self.y < HEIGHT + 30):
            self.alive = False

    def draw(self, surf):
        for i, (tx, ty) in enumerate(self.trail):
            pygame.draw.circle(surf, (200, 200, 200), (int(tx), int(ty)), 1 + i // 2)
        ex = self.x + math.cos(self.angle) * 7
        ey = self.y + math.sin(self.angle) * 7
        pygame.draw.line(surf, (120, 240, 140), (self.x, self.y), (ex, ey), 4)
        pygame.draw.circle(surf, WHITE, (int(ex), int(ey)), 2)


class Wingman:
    """플레이어 옆을 따라다니며 함께 공격하는 보조 비행기."""

    def __init__(self, slot, x, y):
        self.slot = slot            # 0: 왼쪽, 1: 오른쪽
        self.x, self.y = x, y
        self.tick = 0

    def offset(self):
        side = -1 if self.slot == 0 else 1
        return side * 38, 16

    def update(self, player):
        self.tick += 1
        ox, oy = self.offset()
        # 살짝 늦게 따라와서 편대 비행 느낌
        self.x += (player.x + ox - self.x) * 0.18
        self.y += (player.y + oy + math.sin(self.tick * 0.1 + self.slot) * 3 - self.y) * 0.18

    def fire(self, game):
        side = -1 if self.slot == 0 else 1
        game.lasers.append(Laser(self.x, self.y - 10, 0, (140, 170, 255)))
        if game.player.power >= 3:
            game.lasers.append(Laser(self.x, self.y - 10, side * 10, (140, 170, 255)))

    def draw(self, surf):
        x, y = self.x, self.y
        pygame.draw.polygon(surf, (60, 90, 170), [(x, y - 4), (x - 11, y + 7), (x + 11, y + 7)])
        pygame.draw.polygon(surf, (200, 215, 255), [(x, y - 12), (x - 4, y + 6), (x + 4, y + 6)])
        flame = 3 + (self.tick % 4)
        pygame.draw.polygon(surf, ORANGE, [(x - 2, y + 6), (x + 2, y + 6), (x, y + 6 + flame)])


class Item:
    """격추한 적이 떨어뜨리는 아이템 캡슐."""

    def __init__(self, x, y, kind):
        self.x, self.y = x, y
        self.base_x = x
        self.kind = kind
        self.alive = True
        self.tick = random.randint(0, 100)
        self.vy = -2.0              # 처음엔 살짝 튀어 오른다

    def update(self):
        self.tick += 1
        self.vy = min(self.vy + 0.08, 1.4)
        self.y += self.vy
        self.x = clamp(self.base_x + math.sin(self.tick * 0.05) * 20, 14, WIDTH - 14)
        if self.y > HEIGHT + 20:
            self.alive = False

    def draw(self, surf, font):
        label, color, _ = ITEM_TYPES[self.kind]
        x, y = int(self.x), int(self.y)
        glow = 3 + int(math.sin(self.tick * 0.2) * 2)
        pygame.draw.circle(surf, color, (x, y), 14 + glow, 2)
        pygame.draw.circle(surf, (30, 30, 40), (x, y), 13)
        pygame.draw.circle(surf, color, (x, y), 13, 3)
        t = font.render(label, True, WHITE)
        surf.blit(t, t.get_rect(center=(x, y + 1)))


class Bomb:
    """플레이어 위치에서 조준점으로 포물선을 그리며 떨어지는 폭탄."""

    def __init__(self, x, y, tx, ty):
        self.sx, self.sy = x, y
        self.tx, self.ty = tx, ty
        self.t = 0
        self.alive = True
        self.exploded = False

    @property
    def pos(self):
        p = self.t / BOMB_FLIGHT
        x = self.sx + (self.tx - self.sx) * p
        y = self.sy + (self.ty - self.sy) * p
        return x, y

    def update(self, scrolling=True):
        if scrolling:            # 목표 지점은 지형과 함께 움직인다 (보스전 중엔 정지)
            self.ty += SCROLL_SPEED
        self.t += 1
        if self.t >= BOMB_FLIGHT:
            self.exploded = True
            self.alive = False

    def draw(self, surf):
        x, y = self.pos
        p = self.t / BOMB_FLIGHT
        size = int(6 - 3 * p)
        pygame.draw.circle(surf, (60, 60, 60), (int(x), int(y)), size)
        pygame.draw.circle(surf, ORANGE, (int(x), int(y)), max(1, size - 2))


class EnemyBullet:
    def __init__(self, x, y, vx, vy):
        self.x, self.y, self.vx, self.vy = x, y, vx, vy
        self.alive = True
        self.tick = 0

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.tick += 1
        if not (-20 < self.x < WIDTH + 20 and -20 < self.y < HEIGHT + 20):
            self.alive = False

    def draw(self, surf):
        c = (255, 120, 200) if (self.tick // 4) % 2 else (255, 240, 255)
        pygame.draw.circle(surf, c, (int(self.x), int(self.y)), 4)
        pygame.draw.circle(surf, WHITE, (int(self.x), int(self.y)), 2)


# ===================== 공중 적 =====================
class AirEnemy:
    ground = False
    drop_chance = 0.12

    def __init__(self, x, y, hp=1, score=100, radius=13):
        self.x, self.y = x, y
        self.hp = hp
        self.score = score
        self.radius = radius
        self.alive = True
        self.tick = 0
        self.flash = 0

    def hit(self, dmg=1):
        self.hp -= dmg
        self.flash = 4
        return self.hp <= 0

    def offscreen(self):
        return self.y > HEIGHT + 40 or self.y < -120 or self.x < -60 or self.x > WIDTH + 60

    def update(self, game):
        self.tick += 1
        self.flash = max(0, self.flash - 1)
        self.move(game)
        if self.tick > 30 and self.offscreen():
            self.alive = False

    def move(self, game):
        pass

    def body_color(self, base):
        return WHITE if self.flash else base


class Dart(AirEnemy):
    """곧장 내려오다 플레이어 쪽으로 살짝 꺾는 소형기."""

    def __init__(self, x):
        super().__init__(x, -30, hp=1, score=100, radius=12)
        self.vy = 4.2
        self.vx = 0

    def move(self, game):
        if self.tick == 25:
            self.vx = clamp((game.player.x - self.x) / 60, -2.5, 2.5)
        self.x += self.vx
        self.y += self.vy

    def draw(self, surf):
        x, y = self.x, self.y
        c = self.body_color((220, 80, 80))
        pygame.draw.polygon(surf, c, [(x, y + 14), (x - 13, y - 10), (x, y - 4), (x + 13, y - 10)])
        pygame.draw.circle(surf, YELLOW, (int(x), int(y)), 3)


class Spinner(AirEnemy):
    """사인 곡선을 그리며 내려오면서 탄을 쏘는 원반."""

    def __init__(self, x, phase):
        super().__init__(x, -30, hp=2, score=150, radius=14)
        self.base_x = x
        self.phase = phase

    def move(self, game):
        self.y += 2.2
        self.x = self.base_x + math.sin(self.tick * 0.05 + self.phase) * 90
        if self.tick % 90 == 45 and self.y < game.player.y - 100:
            vx, vy = aim((self.x, self.y), (game.player.x, game.player.y), 3.5)
            game.enemy_bullets.append(EnemyBullet(self.x, self.y, vx, vy))

    def draw(self, surf):
        x, y = int(self.x), int(self.y)
        c = self.body_color((170, 170, 190))
        pygame.draw.circle(surf, c, (x, y), 14)
        pygame.draw.circle(surf, METAL_DARK, (x, y), 14, 2)
        a = self.tick * 0.2
        for i in range(3):
            ang = a + i * math.tau / 3
            pygame.draw.line(surf, METAL_DARK, (x, y), (x + math.cos(ang) * 12, y + math.sin(ang) * 12), 3)
        pygame.draw.circle(surf, (120, 255, 160), (x, y), 5)


class Hunter(AirEnemy):
    """내려와 잠시 멈춘 뒤 3방향 탄을 쏘고 되돌아가는 중형기."""

    drop_chance = 1.0

    def __init__(self, x):
        super().__init__(x, -40, hp=5, score=400, radius=18)
        self.stop_y = random.randint(120, 260)
        self.state = "enter"
        self.timer = 0

    def move(self, game):
        if self.state == "enter":
            self.y += (self.stop_y - self.y) * 0.05 + 0.5
            if self.y >= self.stop_y - 2:
                self.state = "attack"
        elif self.state == "attack":
            self.timer += 1
            self.x += (game.player.x - self.x) * 0.01
            if self.timer in (30, 75, 120):
                vx, vy = aim((self.x, self.y), (game.player.x, game.player.y), 4)
                for spread in (-0.25, 0, 0.25):
                    c, s = math.cos(spread), math.sin(spread)
                    game.enemy_bullets.append(EnemyBullet(self.x, self.y + 10, vx * c - vy * s, vx * s + vy * c))
            if self.timer > 150:
                self.state = "leave"
        else:
            self.y -= 3.5

    def draw(self, surf):
        x, y = self.x, self.y
        c = self.body_color((120, 90, 200))
        pygame.draw.polygon(surf, c, [(x - 22, y - 8), (x + 22, y - 8), (x + 12, y + 14), (x - 12, y + 14)])
        pygame.draw.polygon(surf, (80, 60, 150), [(x - 22, y - 8), (x - 28, y + 4), (x - 12, y + 14)])
        pygame.draw.polygon(surf, (80, 60, 150), [(x + 22, y - 8), (x + 28, y + 4), (x + 12, y + 14)])
        pygame.draw.circle(surf, RED, (int(x), int(y + 2)), 5)


# ===================== 지상 적 =====================
class GroundEnemy:
    ground = True
    drop_chance = 0.2

    def __init__(self, x, y, hp, score, radius):
        self.x, self.y = x, y
        self.hp = hp
        self.score = score
        self.radius = radius
        self.alive = True
        self.tick = 0
        self.flash = 0

    def hit(self, dmg=1):
        self.hp -= dmg
        self.flash = 6
        return self.hp <= 0

    def update(self, game):
        self.tick += 1
        self.flash = max(0, self.flash - 1)
        self.y += SCROLL_SPEED
        self.act(game)
        if self.y > HEIGHT + 50:
            self.alive = False

    def act(self, game):
        pass

    def can_fire(self, game):
        return 30 < self.y < game.player.y - 80


class Turret(GroundEnemy):
    """플레이어를 조준해 사격하는 고정 포대."""

    def __init__(self, x, y):
        super().__init__(x, y, hp=1, score=200, radius=16)
        self.angle = math.pi / 2
        self.cool = random.randint(40, 100)

    def act(self, game):
        tgt = math.atan2(game.player.y - self.y, game.player.x - self.x)
        self.angle += (tgt - self.angle) * 0.08
        self.cool -= 1
        if self.cool <= 0 and self.can_fire(game):
            self.cool = random.randint(80, 130)
            vx, vy = math.cos(self.angle) * 3.2, math.sin(self.angle) * 3.2
            game.enemy_bullets.append(EnemyBullet(self.x + vx * 5, self.y + vy * 5, vx, vy))

    def draw(self, surf):
        x, y = int(self.x), int(self.y)
        base = WHITE if self.flash else (110, 110, 120)
        pygame.draw.rect(surf, (70, 70, 80), (x - 16, y - 16, 32, 32), border_radius=4)
        pygame.draw.circle(surf, base, (x, y), 11)
        ex = x + math.cos(self.angle) * 18
        ey = y + math.sin(self.angle) * 18
        pygame.draw.line(surf, (50, 50, 55), (x, y), (ex, ey), 5)
        pygame.draw.circle(surf, RED, (x, y), 4)


class Tank(GroundEnemy):
    """도로/평지를 따라 움직이며 사격하는 전차."""

    def __init__(self, x, y):
        super().__init__(x, y, hp=1, score=300, radius=15)
        self.vx = random.choice((-0.8, 0.8))
        self.cool = random.randint(60, 120)

    def act(self, game):
        self.x += self.vx
        if self.x < 20 or self.x > WIDTH - 20 or game.terrain.tile_at(self.x + self.vx * 20, self.y) == "water":
            self.vx = -self.vx
        self.cool -= 1
        if self.cool <= 0 and self.can_fire(game):
            self.cool = random.randint(90, 150)
            vx, vy = aim((self.x, self.y), (game.player.x, game.player.y), 3)
            game.enemy_bullets.append(EnemyBullet(self.x, self.y, vx, vy))

    def draw(self, surf):
        x, y = int(self.x), int(self.y)
        body = WHITE if self.flash else (95, 110, 70)
        pygame.draw.rect(surf, (40, 40, 40), (x - 15, y - 13, 30, 26), border_radius=3)
        pygame.draw.rect(surf, body, (x - 11, y - 11, 22, 22), border_radius=3)
        pygame.draw.circle(surf, (70, 85, 50), (x, y), 7)
        pygame.draw.line(surf, (40, 40, 40), (x, y), (x, y + 16), 4)


class Bunker(GroundEnemy):
    """튼튼하지만 점수가 높은 지상 벙커 (폭탄 2발 필요)."""

    drop_chance = 0.6

    def __init__(self, x, y):
        super().__init__(x, y, hp=2, score=600, radius=20)

    def draw(self, surf):
        x, y = int(self.x), int(self.y)
        c = WHITE if self.flash else (150, 140, 120)
        pygame.draw.polygon(surf, (90, 85, 75), [(x - 22, y + 18), (x + 22, y + 18), (x + 16, y - 18), (x - 16, y - 18)])
        pygame.draw.polygon(surf, c, [(x - 16, y + 12), (x + 16, y + 12), (x + 11, y - 12), (x - 11, y - 12)])
        pygame.draw.rect(surf, (40, 40, 40), (x - 8, y - 2, 16, 5))
        if self.hp == 1:
            pygame.draw.line(surf, (60, 50, 40), (x - 8, y - 10), (x + 4, y + 8), 2)


# ===================== 보스 =====================
class Fortress:
    """공중 요새.
    - 본체/코어: 레이저·미사일·윙맨 공격으로 피해 (코어 직격 시 2배)
    - 폭탄(X)을 코어에 명중시키면 큰 피해
    - 양쪽 포대: 레이저/미사일로 파괴 가능
    """

    ground = True
    MAX_HP = 400
    BOMB_DMG = 15
    MEGA_DMG = 40

    def __init__(self):
        self.x = WIDTH / 2
        self.y = -120
        self.alive = True
        self.tick = 0
        self.core_hp = self.MAX_HP
        self.radius = 26
        self.flash = 0
        self.score = 5000
        self.cannons = [{"dx": dx, "dy": 30, "hp": 6, "flash": 0, "cool": 40 + i * 25}
                        for i, dx in enumerate((-70, 70))]
        self.state = "enter"

    def hit(self, dmg=1):
        self.core_hp -= dmg
        self.flash = 6
        return self.core_hp <= 0

    def cannon_pos(self, c):
        return self.x + c["dx"], self.y + c["dy"]

    def laser_hit_zone(self, x, y):
        """레이저 판정: 'core'(코어 직격), 'hull'(본체), None(빗나감)."""
        dx, dy = x - self.x, y - self.y
        if math.hypot(dx, dy) < self.radius + 4:
            return "core"
        # 육각형 본체: 가운데 폭 110, 위아래로 갈수록 좁아짐
        if abs(dy) < 50 and abs(dx) < 110 - abs(dy) * 0.9:
            return "hull"
        return None

    def update(self, game):
        self.tick += 1
        self.flash = max(0, self.flash - 1)
        if self.state == "enter":
            self.y += 1.2
            if self.y >= 150:
                self.state = "fight"
        else:
            self.x = WIDTH / 2 + math.sin(self.tick * 0.012) * 90
            # 코어에서 원형 탄막
            if self.tick % 150 == 0:
                n = 14
                for i in range(n):
                    a = i * math.tau / n + self.tick * 0.01
                    game.enemy_bullets.append(EnemyBullet(self.x, self.y, math.cos(a) * 2.6, math.sin(a) * 2.6))
        for c in self.cannons:
            c["flash"] = max(0, c["flash"] - 1)
            if c["hp"] > 0 and self.state == "fight":
                c["cool"] -= 1
                if c["cool"] <= 0:
                    c["cool"] = 55
                    cx, cy = self.cannon_pos(c)
                    vx, vy = aim((cx, cy), (game.player.x, game.player.y), 4)
                    game.enemy_bullets.append(EnemyBullet(cx, cy, vx, vy))

    def draw(self, surf):
        x, y = int(self.x), int(self.y)
        # 그림자
        sh = pygame.Surface((240, 120), pygame.SRCALPHA)
        pygame.draw.ellipse(sh, (0, 0, 0, 70), sh.get_rect())
        surf.blit(sh, (x - 120 + 25, y - 60 + 40))
        # 본체
        hull = [(x - 110, y), (x - 60, y - 55), (x + 60, y - 55), (x + 110, y), (x + 60, y + 50), (x - 60, y + 50)]
        pygame.draw.polygon(surf, METAL_DARK, hull)
        inner = [(x - 90, y), (x - 50, y - 42), (x + 50, y - 42), (x + 90, y), (x + 50, y + 38), (x - 50, y + 38)]
        pygame.draw.polygon(surf, METAL, inner)
        for i in range(-2, 3):
            pygame.draw.line(surf, METAL_DARK, (x + i * 30, y - 40), (x + i * 30, y + 36), 1)
        # 코어
        pulse = 4 + int(math.sin(self.tick * 0.15) * 3)
        core_c = WHITE if self.flash else (255, 60, 90)
        pygame.draw.circle(surf, (40, 40, 50), (x, y), 26)
        pygame.draw.circle(surf, core_c, (x, y), 16 + pulse // 2)
        pygame.draw.circle(surf, (255, 200, 210), (x, y), 6)
        # 포대
        for c in self.cannons:
            cx, cy = map(int, self.cannon_pos(c))
            if c["hp"] > 0:
                col = WHITE if c["flash"] else (200, 180, 60)
                pygame.draw.circle(surf, (50, 50, 55), (cx, cy), 15)
                pygame.draw.circle(surf, col, (cx, cy), 10)
            else:
                pygame.draw.circle(surf, (40, 35, 30), (cx, cy), 12)
        # 체력바
        w = 160
        pygame.draw.rect(surf, (40, 40, 40), (WIDTH / 2 - w / 2, 46, w, 8))
        pygame.draw.rect(surf, (255, 60, 90), (WIDTH / 2 - w / 2, 46, w * max(0, self.core_hp) / self.MAX_HP, 8))
        pygame.draw.rect(surf, WHITE, (WIDTH / 2 - w / 2, 46, w, 8), 1)


# ===================== 게임 =====================
class Game:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption("SKY STRIKER")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("consolas,menlo,monospace", 20, bold=True)
        self.big_font = pygame.font.SysFont("consolas,menlo,monospace", 44, bold=True)
        self.small_font = pygame.font.SysFont("consolas,menlo,monospace", 15)
        self.item_font = pygame.font.SysFont("consolas,menlo,monospace", 13, bold=True)
        self.hi_score = 0
        self.state = "title"
        self.reset()

    def reset(self):
        self.terrain = Terrain()
        self.player = Player()
        self.lasers, self.bombs = [], []
        self.air_enemies, self.ground_enemies = [], []
        self.enemy_bullets = []
        self.particles, self.rings, self.craters = [], [], []
        self.items, self.wingmen, self.missiles = [], [], []
        self.popups = []          # 아이템 획득 문구 [text, x, y, life]
        self.mega_bombs = 1
        self.mega_flash = 0
        self.boss = None
        self.score = 0
        self.lives = 3
        self.frame = 0
        self.boss_timer = BOSS_INTERVAL
        self.stage = 1
        self.respawn_timer = 0
        self.paused = False
        self.banner = ("STAGE 1", 120)

    # ---------- 생성 ----------
    def spawn_enemies(self):
        f = self.frame
        diff = 1 + self.stage * 0.25
        boss_active = self.boss is not None

        # 공중 적 웨이브
        if f % max(40, int(110 / diff)) == 0:
            kind = random.random()
            if kind < 0.5:
                x = random.randint(40, WIDTH - 40)
                for i in range(random.randint(2, 4)):
                    d = Dart(clamp(x + (i - 1.5) * 34, 20, WIDTH - 20))
                    d.y -= i * 30
                    self.air_enemies.append(d)
            elif kind < 0.85:
                x = random.randint(110, WIDTH - 110)
                for i in range(4):
                    s = Spinner(x, i * 0.6)
                    s.y -= i * 40
                    self.air_enemies.append(s)
            elif not boss_active:
                self.air_enemies.append(Hunter(random.randint(60, WIDTH - 60)))

        # 지상 적 (보스전 중에는 생성하지 않음)
        if not boss_active and f % max(45, int(100 / diff)) == 0:
            for _ in range(10):
                x = random.randint(1, COLS - 1) * TILE - TILE / 2
                if self.terrain.tile_at(x, -20) not in ("water",):
                    break
            else:
                return
            r = random.random()
            if self.terrain.tile_at(x, -20) == "road" or r < 0.3:
                self.ground_enemies.append(Tank(x, -30))
            elif r < 0.8:
                self.ground_enemies.append(Turret(x, -30))
            else:
                self.ground_enemies.append(Bunker(x, -30))

    def explode(self, x, y, size=1.0, ground=False):
        colors = [ORANGE, YELLOW, RED, WHITE]
        for _ in range(int(18 * size)):
            self.particles.append(Particle(x, y, random.choice(colors), 3.5 * size, 35, int(4 * size)))
        self.rings.append(Ring(x, y, 30 * size, WHITE if not ground else ORANGE, ground))
        if ground:
            self.craters.append(Crater(x, y, int(12 * size)))

    def kill_player(self):
        p = self.player
        if p.shield > 0:          # 실드가 피격을 대신 막는다
            p.shield -= 1
            p.invincible = 45
            self.rings.append(Ring(p.x, p.y, 40, CYAN))
            return
        self.explode(p.x, p.y, 2)
        for w in self.wingmen:
            self.explode(w.x, w.y, 1)
        self.wingmen.clear()
        p.alive = False
        self.lives -= 1
        self.respawn_timer = 90
        self.enemy_bullets.clear()

    # ---------- 아이템 ----------
    def maybe_drop(self, e):
        if random.random() < e.drop_chance:
            self.drop_item(e.x, e.y)

    def drop_item(self, x, y, kind=None):
        if kind is None:
            kinds = list(ITEM_TYPES)
            kind = random.choices(kinds, weights=[ITEM_TYPES[k][2] for k in kinds])[0]
        self.items.append(Item(x, y, kind))

    def popup(self, text, x, y):
        self.popups.append([text, x, y, 50])

    def collect(self, item):
        p = self.player
        k = item.kind
        if k == "power":
            if p.power < MAX_POWER:
                p.power += 1
                self.popup(f"POWER UP! x{p.power * 2}", p.x, p.y - 30)
            else:
                self.score += 500
                self.popup("MAX +500", p.x, p.y - 30)
        elif k == "wingman":
            if len(self.wingmen) < MAX_WINGMEN:
                used = {w.slot for w in self.wingmen}
                slot = 0 if 0 not in used else 1
                self.wingmen.append(Wingman(slot, p.x, p.y + 40))
                self.popup("WINGMAN!", p.x, p.y - 30)
            else:
                self.score += 500
                self.popup("+500", p.x, p.y - 30)
        elif k == "missile":
            if p.missile < MAX_MISSILE:
                p.missile += 1
                self.popup(f"MISSILE LV{p.missile}", p.x, p.y - 30)
            else:
                self.score += 500
                self.popup("+500", p.x, p.y - 30)
        elif k == "shield":
            p.shield = SHIELD_HITS
            self.popup("SHIELD!", p.x, p.y - 30)
        elif k == "mega":
            self.mega_bombs = min(MAX_MEGA, self.mega_bombs + 1)
            self.popup("MEGA BOMB +1", p.x, p.y - 30)
        elif k == "life":
            self.lives += 1
            self.popup("1UP!", p.x, p.y - 30)
        elif k == "medal":
            self.score += 1000
            self.popup("+1000", p.x, p.y - 30)
        self.rings.append(Ring(item.x, item.y, 26, ITEM_TYPES[k][1]))

    def fire_lasers(self):
        p = self.player
        for dx, ang in SHOT_PATTERNS[p.power]:
            self.lasers.append(Laser(p.x + dx, p.y - 14, ang))
        for w in self.wingmen:
            w.fire(self)
        if p.missile and p.missile_cd == 0:
            p.missile_cd = 40
            sides = (-1, 1) if p.missile >= 2 else (-1 if self.frame % 80 < 40 else 1,)
            for side in sides:
                self.missiles.append(Missile(p.x + side * 10, p.y, side))

    def nearest_air_target(self, x, y):
        best, bd = None, 1e9
        for e in self.air_enemies:
            if e.alive and e.y > 0:
                d = math.hypot(e.x - x, e.y - y)
                if d < bd:
                    best, bd = (e.x, e.y), d
        if self.boss and self.boss.state == "fight":
            for c in self.boss.cannons:
                if c["hp"] > 0:
                    cx, cy = self.boss.cannon_pos(c)
                    d = math.hypot(cx - x, cy - y)
                    if d < bd:
                        best, bd = (cx, cy), d
        return best

    def use_mega_bomb(self):
        p = self.player
        if self.mega_bombs <= 0 or not p.alive or self.state != "play" or self.paused:
            return
        self.mega_bombs -= 1
        self.mega_flash = 25
        p.invincible = max(p.invincible, 60)
        for b in self.enemy_bullets:
            self.particles.append(Particle(b.x, b.y, (255, 200, 255), 1.5, 15, 2))
        self.enemy_bullets.clear()
        self.rings.append(Ring(p.x, p.y, 420, WHITE))
        for e in self.air_enemies + self.ground_enemies:
            if e.alive and -20 < e.y < HEIGHT and e.hit(8):
                self.destroy(e)
        if self.boss and self.boss.state == "fight":
            for c in self.boss.cannons:
                if c["hp"] > 0:
                    c["hp"] -= 3
                    if c["hp"] <= 0:
                        self.destroy_cannon(c)
            if self.boss.hit(Fortress.MEGA_DMG):
                self.destroy_boss()

    # ---------- 파괴 처리 ----------
    def destroy(self, e):
        e.alive = False
        self.score += e.score
        if e.ground:
            self.explode(e.x, e.y, 1.3, ground=True)
        else:
            self.explode(e.x, e.y, 1.0 if e.radius < 16 else 1.5)
        self.maybe_drop(e)

    def destroy_cannon(self, c):
        cx, cy = self.boss.cannon_pos(c)
        self.score += 1000
        self.explode(cx, cy, 1.5)
        self.drop_item(cx, cy)

    def destroy_boss(self):
        boss = self.boss
        self.score += boss.score + sum(1000 for c in boss.cannons if c["hp"] > 0)
        for _ in range(6):
            self.explode(boss.x + random.uniform(-80, 80), boss.y + random.uniform(-40, 40), 2.2)
        for i, kind in enumerate(("power", "wingman", "missile", "medal")):
            self.drop_item(boss.x - 60 + i * 40, boss.y, kind)
        self.boss = None
        self.boss_timer = BOSS_INTERVAL
        self.stage += 1
        self.enemy_bullets.clear()
        self.banner = (f"STAGE {self.stage}", 150)

    # ---------- 업데이트 ----------
    def update(self):
        self.frame += 1
        keys = pygame.key.get_pressed()
        p = self.player

        if self.boss is None or self.boss.state == "enter":
            self.terrain.update()

        if p.alive:
            p.update(keys)
            for w in self.wingmen:
                w.update(p)
            if (keys[pygame.K_z] or keys[pygame.K_SPACE]) and p.laser_cd == 0:
                self.fire_lasers()
                p.laser_cd = LASER_COOLDOWN
            if keys[pygame.K_x] and p.bomb_cd == 0:
                tx, ty = p.target
                self.bombs.append(Bomb(p.x, p.y - 10, tx, ty))
                p.bomb_cd = BOMB_COOLDOWN
        else:
            self.respawn_timer -= 1
            if self.respawn_timer <= 0:
                if self.lives > 0:
                    old_power = p.power
                    self.player = Player()
                    self.player.power = max(1, old_power - 1)   # 파워 1단계 감소
                else:
                    self.state = "gameover"
                    self.hi_score = max(self.hi_score, self.score)
                    return

        # 보스 등장 타이머
        if self.boss is None:
            self.boss_timer -= 1
            if self.boss_timer <= 0:
                self.boss = Fortress()
                self.banner = ("WARNING!", 150)
        if self.boss is None or self.boss.state == "enter":
            self.spawn_enemies()
        elif self.frame % 140 == 0:
            self.air_enemies.append(Dart(random.randint(30, WIDTH - 30)))

        scrolling = self.boss is None or self.boss.state == "enter"
        for group in (self.lasers, self.enemy_bullets, self.particles, self.rings, self.items):
            for o in group:
                o.update()
        for b in self.bombs:
            b.update(scrolling)
        for m in self.missiles:
            m.update(self)
        for pu in self.popups:
            pu[2] -= 0.8
            pu[3] -= 1
        self.mega_flash = max(0, self.mega_flash - 1)
        for e in self.air_enemies:
            e.update(self)
        for e in self.ground_enemies:
            if scrolling:
                e.update(self)
            else:  # 스크롤 정지 시 위치 고정
                e.tick += 1
                e.flash = max(0, e.flash - 1)
                e.act(self)
        if scrolling:
            for c in self.craters:
                c.update()
        if self.boss:
            self.boss.update(self)

        self.handle_collisions()

        # 정리
        self.lasers = [o for o in self.lasers if o.alive]
        self.bombs = [o for o in self.bombs if o.alive]
        self.missiles = [o for o in self.missiles if o.alive]
        self.items = [o for o in self.items if o.alive]
        self.popups = [pu for pu in self.popups if pu[3] > 0]
        self.enemy_bullets = [o for o in self.enemy_bullets if o.alive]
        self.particles = [o for o in self.particles if o.life > 0]
        self.rings = [o for o in self.rings if o.life > 0]
        self.craters = [c for c in self.craters if c.y < HEIGHT + 30][-40:]
        self.air_enemies = [e for e in self.air_enemies if e.alive]
        self.ground_enemies = [e for e in self.ground_enemies if e.alive]

        if self.banner:
            text, t = self.banner
            self.banner = (text, t - 1) if t > 1 else None

    def handle_collisions(self):
        p = self.player

        # 레이저 / 유도 미사일 vs 공중 적, 보스 포대
        for l in self.lasers + self.missiles:
            lr = pygame.Rect(l.x - 4, l.y - 10, 8, 20)
            for e in self.air_enemies:
                if e.alive and lr.colliderect(pygame.Rect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2)):
                    l.alive = False
                    if e.hit(l.dmg):
                        self.destroy(e)
                    break
            if l.alive and self.boss:
                for c in self.boss.cannons:
                    if c["hp"] <= 0:
                        continue
                    cx, cy = self.boss.cannon_pos(c)
                    if abs(l.x - cx) < 14 and abs(l.y - cy) < 16:
                        l.alive = False
                        c["hp"] -= l.dmg
                        c["flash"] = 4
                        if c["hp"] <= 0:
                            self.destroy_cannon(c)
                        break
            # 레이저 / 미사일 vs 보스 본체·코어
            boss = self.boss
            if l.alive and boss and boss.state == "fight":
                zone = boss.laser_hit_zone(l.x, l.y)
                if zone:
                    l.alive = False
                    dmg = l.dmg * (2 if zone == "core" else 1)
                    spark = (255, 120, 150) if zone == "core" else (255, 240, 180)
                    for _ in range(2):
                        self.particles.append(Particle(l.x, l.y, spark, 1.8, 10, 2))
                    if boss.hit(dmg):
                        self.destroy_boss()

        # 아이템 획득
        if p.alive:
            for it in self.items:
                if math.hypot(it.x - p.x, it.y - p.y) < 24:
                    it.alive = False
                    self.collect(it)

        # 윙맨이 적 탄을 막아준다
        for w in self.wingmen:
            for bl in self.enemy_bullets:
                if bl.alive and math.hypot(bl.x - w.x, bl.y - w.y) < 11:
                    bl.alive = False
                    self.particles.append(Particle(bl.x, bl.y, (180, 200, 255), 1.5, 12, 2))

        # 폭탄 착탄 vs 지상 적 / 보스 코어
        for b in self.bombs:
            if not b.exploded:
                continue
            bx, by = b.tx, b.ty
            self.rings.append(Ring(bx, by, BOMB_RADIUS, ORANGE, ground=True))
            for _ in range(8):
                self.particles.append(Particle(bx, by, random.choice([ORANGE, YELLOW, (120, 100, 80)]), 2, 20, 3))
            for e in self.ground_enemies:
                if e.alive and math.hypot(e.x - bx, e.y - by) < BOMB_RADIUS + e.radius * 0.6:
                    if e.hit():
                        self.destroy(e)
            boss = self.boss
            if boss and boss.state == "fight":
                # 코어 근처 명중 시 큰 피해, 본체에 떨어지면 1/3 피해
                if math.hypot(boss.x - bx, boss.y - by) < BOMB_RADIUS + boss.radius:
                    dmg = Fortress.BOMB_DMG
                    self.rings.append(Ring(boss.x, boss.y, 50, (255, 60, 90)))
                elif boss.laser_hit_zone(bx, by):
                    dmg = Fortress.BOMB_DMG // 3
                else:
                    dmg = 0
                if dmg and boss.hit(dmg):
                    self.destroy_boss()

        if not p.alive or p.invincible:
            return

        # 피격 판정
        for bl in self.enemy_bullets:
            if math.hypot(bl.x - p.x, bl.y - p.y) < p.radius + 3:
                bl.alive = False
                self.kill_player()
                return
        for e in self.air_enemies:
            if math.hypot(e.x - p.x, e.y - p.y) < p.radius + e.radius - 2:
                e.alive = False
                self.explode(e.x, e.y)
                self.kill_player()
                return

    def ground_locked(self):
        """조준점 아래에 지상 목표가 있는지."""
        tx, ty = self.player.target
        for e in self.ground_enemies:
            if math.hypot(e.x - tx, e.y - ty) < e.radius + 8:
                return True
        b = self.boss
        return bool(b and b.state == "fight" and math.hypot(b.x - tx, b.y - ty) < b.radius + 8)

    # ---------- 그리기 ----------
    def draw_text(self, text, font, color, center, shadow=True):
        if shadow:
            s = font.render(text, True, BLACK)
            self.screen.blit(s, s.get_rect(center=(center[0] + 2, center[1] + 2)))
        s = font.render(text, True, color)
        self.screen.blit(s, s.get_rect(center=center))

    def draw_hud(self):
        bar = pygame.Surface((WIDTH, 36), pygame.SRCALPHA)
        bar.fill((0, 0, 0, 120))
        self.screen.blit(bar, (0, 0))
        self.screen.blit(self.font.render(f"SCORE {self.score:07d}", True, WHITE), (10, 8))
        hi = self.font.render(f"HI {max(self.hi_score, self.score):07d}", True, YELLOW)
        self.screen.blit(hi, (WIDTH - hi.get_width() - 10, 8))
        for i in range(max(0, self.lives - (0 if self.player.alive else 0))):
            x, y = 16 + i * 22, HEIGHT - 20
            pygame.draw.polygon(self.screen, (225, 230, 240), [(x, y - 9), (x - 8, y + 7), (x + 8, y + 7)])
        st = self.small_font.render(f"STAGE {self.stage}", True, WHITE)
        self.screen.blit(st, (WIDTH - st.get_width() - 10, HEIGHT - 26))
        # 장비 상태: 파워 / 미사일 / 실드 / 메가 폭탄
        p = self.player
        info = f"SHOT x{p.power * 2}"
        if p.missile:
            info += f"  MSL{p.missile}"
        if p.shield:
            info += f"  SHD{p.shield}"
        t = self.small_font.render(info, True, (255, 200, 200))
        self.screen.blit(t, (10, 40))
        for i in range(self.mega_bombs):
            cx, cy = 26 + i * 24, HEIGHT - 46
            pygame.draw.circle(self.screen, (40, 40, 40), (cx, cy), 9)
            pygame.draw.circle(self.screen, ORANGE, (cx, cy), 9, 2)
            b = self.item_font.render("B", True, ORANGE)
            self.screen.blit(b, b.get_rect(center=(cx, cy + 1)))

    def draw_world(self):
        self.terrain.draw(self.screen)
        for c in self.craters:
            c.draw(self.screen)
        for e in self.ground_enemies:
            e.draw(self.screen)
        if self.boss:
            self.boss.draw(self.screen)
        for b in self.bombs:
            b.draw(self.screen)
        for e in self.air_enemies:
            e.draw(self.screen)
        for l in self.lasers:
            l.draw(self.screen)
        for m in self.missiles:
            m.draw(self.screen)
        for it in self.items:
            it.draw(self.screen, self.item_font)
        for r in self.rings:
            r.draw(self.screen)
        for pa in self.particles:
            pa.draw(self.screen)
        if self.player.alive:
            self.player.draw_reticle(self.screen, self.ground_locked())
            for w in self.wingmen:
                w.draw(self.screen)
            self.player.draw(self.screen)
        for bl in self.enemy_bullets:
            bl.draw(self.screen)
        for text, x, y, life in self.popups:
            t = self.small_font.render(text, True, YELLOW)
            t.set_alpha(min(255, life * 8))
            self.screen.blit(t, t.get_rect(center=(x, y)))
        if self.mega_flash:
            fl = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            fl.fill((255, 255, 255, int(200 * self.mega_flash / 25)))
            self.screen.blit(fl, (0, 0))

    def draw(self):
        if self.state == "title":
            self.terrain.update()
            self.terrain.draw(self.screen)
            shade = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            shade.fill((0, 0, 20, 140))
            self.screen.blit(shade, (0, 0))
            self.draw_text("SKY STRIKER", self.big_font, CYAN, (WIDTH / 2, 230))
            lines = [
                "ARROWS / WASD : MOVE",
                "Z / SPACE : AIR LASER",
                "X : GROUND BOMB",
                "C : MEGA BOMB",
                "P : PAUSE    ESC : QUIT",
            ]
            for i, t in enumerate(lines):
                self.draw_text(t, self.small_font, WHITE, (WIDTH / 2, 300 + i * 24))
            # 아이템 안내
            for i, kind in enumerate(ITEM_TYPES):
                Item(WIDTH / 2 - 150 + i * 50, 450, kind).draw(self.screen, self.item_font)
            self.draw_text("P:POWER W:WINGMAN M:MISSILE S:SHIELD", self.small_font, WHITE, (WIDTH / 2, 480))
            self.draw_text("B:MEGA BOMB  1UP:LIFE  $:BONUS", self.small_font, WHITE, (WIDTH / 2, 500))
            if (pygame.time.get_ticks() // 500) % 2:
                self.draw_text("PRESS ENTER TO START", self.font, YELLOW, (WIDTH / 2, 570))
            if self.hi_score:
                self.draw_text(f"HI SCORE {self.hi_score}", self.small_font, YELLOW, (WIDTH / 2, 620))
        else:
            self.draw_world()
            self.draw_hud()
            if self.banner:
                text, t = self.banner
                if text != "WARNING!" or (t // 10) % 2:
                    self.draw_text(text, self.big_font, RED if text == "WARNING!" else WHITE, (WIDTH / 2, HEIGHT / 2 - 60))
            if self.paused:
                self.draw_text("PAUSED", self.big_font, WHITE, (WIDTH / 2, HEIGHT / 2))
            if self.state == "gameover":
                shade = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
                shade.fill((0, 0, 0, 150))
                self.screen.blit(shade, (0, 0))
                self.draw_text("GAME OVER", self.big_font, RED, (WIDTH / 2, HEIGHT / 2 - 40))
                self.draw_text(f"SCORE {self.score}", self.font, WHITE, (WIDTH / 2, HEIGHT / 2 + 10))
                self.draw_text("PRESS ENTER TO RESTART", self.font, YELLOW, (WIDTH / 2, HEIGHT / 2 + 60))
        pygame.display.flip()

    # ---------- 메인 루프 ----------
    def run(self):
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()
                    if event.key in (pygame.K_RETURN, pygame.K_KP_ENTER) and self.state in ("title", "gameover"):
                        self.reset()
                        self.state = "play"
                    elif event.key == pygame.K_p and self.state == "play":
                        self.paused = not self.paused
                    elif event.key == pygame.K_c:
                        self.use_mega_bomb()

            if self.state == "play" and not self.paused:
                self.update()
            self.draw()
            self.clock.tick(FPS)


if __name__ == "__main__":
    Game().run()
