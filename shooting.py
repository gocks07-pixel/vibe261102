"""
종스크롤 슈팅 게임 (공중/지상 이중 무기 시스템)

조작
  방향키 / WASD : 이동
  Z (또는 Space): 공중 레이저 발사 (공중 적 공격)
  X             : 지상 폭탄 투하 (조준점 위치의 지상 목표 공격)
  P             : 일시정지
  Enter         : 게임 오버 후 재시작
  Esc           : 종료

외부 이미지/사운드 없이 pygame 도형만으로 그립니다.
"""
import math
import random
import sys

import pygame

# ---------------------------------------------------------------------------
# 설정
# ---------------------------------------------------------------------------
WIDTH, HEIGHT = 480, 640
FPS = 60
TILE = 32
SCROLL_SPEED = 1.2

PLAYER_SPEED = 4
LASER_SPEED = 10
LASER_COOLDOWN = 8
BOMB_COOLDOWN = 30
BOMB_RANGE = 150          # 조준점이 기체 앞쪽 몇 픽셀에 있는지
BOMB_FLIGHT_FRAMES = 30   # 폭탄이 조준점에 닿기까지 걸리는 프레임

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRASS = (54, 112, 52)
GRASS_DARK = (44, 94, 44)
FOREST = (30, 70, 34)
SAND = (186, 170, 120)
WATER = (40, 80, 150)
WATER_LIGHT = (70, 120, 190)
ROAD = (110, 110, 110)
METAL = (150, 155, 165)
METAL_DARK = (90, 95, 105)
RED = (220, 50, 50)
ORANGE = (255, 150, 40)
YELLOW = (255, 230, 80)
CYAN = (80, 220, 255)
GREEN = (90, 230, 120)


# ---------------------------------------------------------------------------
# 배경: 행 단위로 절차 생성되는 지형
# ---------------------------------------------------------------------------
class Terrain:
    """화면 위쪽에 새 타일 행을 계속 만들어 붙이며 아래로 스크롤한다."""

    COLS = WIDTH // TILE

    def __init__(self):
        self.rows = []          # 각 행: 타일 종류 리스트
        self.offset = 0.0       # 0..TILE 사이 스크롤 오프셋
        self.river_x = random.randint(3, self.COLS - 4)
        self.river_w = 3
        self.road_x = random.randint(1, self.COLS - 2)
        for _ in range(HEIGHT // TILE + 2):
            self.rows.append(self._make_row())

    def _make_row(self):
        # 강과 도로가 조금씩 구불구불하게 이어지도록 위치를 흔든다
        if random.random() < 0.3:
            self.river_x = max(1, min(self.COLS - self.river_w - 1,
                                      self.river_x + random.choice((-1, 1))))
        if random.random() < 0.15:
            self.road_x = max(0, min(self.COLS - 1,
                                     self.road_x + random.choice((-1, 1))))
        row = []
        for c in range(self.COLS):
            if self.river_x <= c < self.river_x + self.river_w:
                kind = "water"
            elif c in (self.river_x - 1, self.river_x + self.river_w):
                kind = "sand"
            elif c == self.road_x:
                kind = "road"
            else:
                kind = "forest" if random.random() < 0.18 else "grass"
            row.append(kind)
        return row

    def is_water(self, x, y):
        """화면 좌표 (x, y)가 강물 위인지 여부 (지상 유닛 배치용)."""
        r = int((y - self.offset) // TILE) + 1
        c = int(x // TILE)
        if 0 <= r < len(self.rows) and 0 <= c < self.COLS:
            return self.rows[r][c] in ("water", "sand")
        return False

    def update(self):
        self.offset += SCROLL_SPEED
        while self.offset >= TILE:
            self.offset -= TILE
            self.rows.pop()
            self.rows.insert(0, self._make_row())

    def draw(self, screen, tick):
        for r, row in enumerate(self.rows):
            y = int((r - 1) * TILE + self.offset)
            for c, kind in enumerate(row):
                x = c * TILE
                rect = (x, y, TILE, TILE)
                if kind == "water":
                    pygame.draw.rect(screen, WATER, rect)
                    if (r + c + tick // 20) % 3 == 0:
                        pygame.draw.line(screen, WATER_LIGHT,
                                         (x + 6, y + 12), (x + 20, y + 12), 2)
                elif kind == "sand":
                    pygame.draw.rect(screen, SAND, rect)
                elif kind == "road":
                    pygame.draw.rect(screen, GRASS, rect)
                    pygame.draw.rect(screen, ROAD, (x + 8, y, 16, TILE))
                    pygame.draw.line(screen, (200, 200, 200),
                                     (x + 16, y + 4), (x + 16, y + 14), 2)
                elif kind == "forest":
                    pygame.draw.rect(screen, GRASS, rect)
                    for dx, dy in ((9, 10), (22, 12), (15, 22)):
                        pygame.draw.circle(screen, FOREST, (x + dx, y + dy), 7)
                else:
                    color = GRASS if (r + c) % 2 else GRASS_DARK
                    pygame.draw.rect(screen, color, rect)


# ---------------------------------------------------------------------------
# 게임 오브젝트
# ---------------------------------------------------------------------------
class Player:
    def __init__(self):
        self.x = WIDTH / 2
        self.y = HEIGHT - 90
        self.radius = 10
        self.laser_cd = 0
        self.bomb_cd = 0
        self.invincible = 120

    @property
    def target(self):
        return self.x, self.y - BOMB_RANGE

    def update(self, keys):
        dx = (keys[pygame.K_RIGHT] or keys[pygame.K_d]) - (keys[pygame.K_LEFT] or keys[pygame.K_a])
        dy = (keys[pygame.K_DOWN] or keys[pygame.K_s]) - (keys[pygame.K_UP] or keys[pygame.K_w])
        if dx and dy:
            dx *= 0.7071
            dy *= 0.7071
        self.x = max(16, min(WIDTH - 16, self.x + dx * PLAYER_SPEED))
        self.y = max(BOMB_RANGE + 20, min(HEIGHT - 24, self.y + dy * PLAYER_SPEED))
        self.laser_cd = max(0, self.laser_cd - 1)
        self.bomb_cd = max(0, self.bomb_cd - 1)
        self.invincible = max(0, self.invincible - 1)

    def draw(self, screen, tick, ground_lock):
        if self.invincible and (tick // 4) % 2:
            return
        x, y = int(self.x), int(self.y)
        # 그림자
        pygame.draw.ellipse(screen, (20, 40, 20), (x - 10, y + 18, 24, 8))
        # 날개
        pygame.draw.polygon(screen, METAL_DARK,
                            [(x, y - 4), (x - 18, y + 12), (x - 6, y + 10),
                             (x + 6, y + 10), (x + 18, y + 12)])
        # 동체
        pygame.draw.polygon(screen, METAL,
                            [(x, y - 18), (x - 7, y + 4), (x - 4, y + 14),
                             (x + 4, y + 14), (x + 7, y + 4)])
        pygame.draw.circle(screen, CYAN, (x, y - 3), 4)
        # 엔진 불꽃
        flame = 4 + (tick % 6)
        pygame.draw.polygon(screen, ORANGE,
                            [(x - 3, y + 14), (x + 3, y + 14), (x, y + 14 + flame)])
        # 지상 조준점 (지상 목표 위에 있으면 빨간색)
        tx, ty = map(int, self.target)
        color = RED if ground_lock else WHITE
        pygame.draw.rect(screen, color, (tx - 10, ty - 10, 20, 20), 2)
        pygame.draw.line(screen, color, (tx - 4, ty), (tx + 4, ty), 1)
        pygame.draw.line(screen, color, (tx, ty - 4), (tx, ty + 4), 1)


class Laser:
    def __init__(self, x, y):
        self.x, self.y = x, y
        self.alive = True

    def update(self):
        self.y -= LASER_SPEED
        if self.y < -20:
            self.alive = False

    def draw(self, screen):
        pygame.draw.rect(screen, YELLOW, (int(self.x) - 2, int(self.y) - 8, 4, 14))


class Bomb:
    """조준점을 향해 날아가 착탄 지점에서 폭발 판정을 만든다."""

    def __init__(self, x, y, tx, ty):
        self.sx, self.sy = x, y
        self.tx, self.ty = tx, ty
        self.t = 0
        self.alive = True
        self.exploded = False

    def update(self):
        self.t += 1
        # 착탄 지점도 배경과 함께 스크롤된다
        self.ty += SCROLL_SPEED
        if self.t >= BOMB_FLIGHT_FRAMES:
            self.exploded = True
            self.alive = False

    @property
    def pos(self):
        k = self.t / BOMB_FLIGHT_FRAMES
        return (self.sx + (self.tx - self.sx) * k,
                self.sy + (self.ty - self.sy) * k)

    def draw(self, screen):
        x, y = self.pos
        size = max(2, int(6 * (1 - self.t / BOMB_FLIGHT_FRAMES)) + 2)
        pygame.draw.circle(screen, (230, 230, 230), (int(x), int(y)), size)


class EnemyBullet:
    def __init__(self, x, y, vx, vy):
        self.x, self.y, self.vx, self.vy = x, y, vx, vy
        self.alive = True

    @classmethod
    def aimed(cls, x, y, tx, ty, speed=3.0):
        ang = math.atan2(ty - y, tx - x)
        return cls(x, y, math.cos(ang) * speed, math.sin(ang) * speed)

    def update(self):
        self.x += self.vx
        self.y += self.vy
        if not (-10 < self.x < WIDTH + 10 and -10 < self.y < HEIGHT + 10):
            self.alive = False

    def draw(self, screen, tick):
        c = (255, 120, 255) if (tick // 4) % 2 else (255, 255, 255)
        pygame.draw.circle(screen, c, (int(self.x), int(self.y)), 4)


class Explosion:
    def __init__(self, x, y, size=1.0, ground=False):
        self.x, self.y = x, y
        self.size = size
        self.ground = ground
        self.t = 0
        self.alive = True

    def update(self):
        self.t += 1
        if self.ground:
            self.y += SCROLL_SPEED
        if self.t > 24:
            self.alive = False

    def draw(self, screen):
        r = int((6 + self.t * 1.3) * self.size)
        fade = max(0, 255 - self.t * 10)
        pygame.draw.circle(screen, (255, fade, 0), (int(self.x), int(self.y)), r, 3)
        if self.t < 12:
            pygame.draw.circle(screen, YELLOW, (int(self.x), int(self.y)), r // 2)


# ---------------------------------------------------------------------------
# 공중 적
# ---------------------------------------------------------------------------
class AirEnemy:
    ground = False

    def __init__(self, x, y, hp, score, radius):
        self.x, self.y = x, y
        self.hp = hp
        self.score = score
        self.radius = radius
        self.alive = True
        self.t = 0

    def offscreen(self):
        return self.y > HEIGHT + 40 or self.y < -120 or self.x < -60 or self.x > WIDTH + 60

    def update(self, game):
        self.t += 1
        self.move(game)
        if self.offscreen() and self.t > 60:
            self.alive = False


class Spinner(AirEnemy):
    """회전하며 내려오다가 플레이어 쪽으로 방향을 트는 소형기."""

    def __init__(self, x):
        super().__init__(x, -20, 1, 100, 11)
        self.vx = 0.0
        self.vy = 3.0

    def move(self, game):
        if self.t == 40:
            self.vx = 2.5 if game.player.x > self.x else -2.5
            self.vy = 1.0
        if self.t == 50 and random.random() < 0.5:
            game.enemy_bullets.append(EnemyBullet.aimed(self.x, self.y, game.player.x, game.player.y))
        self.x += self.vx
        self.y += self.vy

    def draw(self, screen):
        x, y = int(self.x), int(self.y)
        ang = self.t * 0.25
        pts = [(x + math.cos(ang + i * math.pi / 2) * 12,
                y + math.sin(ang + i * math.pi / 2) * 12) for i in range(4)]
        pygame.draw.polygon(screen, (200, 200, 220), pts)
        pygame.draw.circle(screen, RED, (x, y), 4)


class Diver(AirEnemy):
    """사인파를 그리며 내려오는 전투기."""

    def __init__(self, x):
        super().__init__(x, -20, 2, 150, 12)
        self.base_x = x

    def move(self, game):
        self.y += 2.2
        self.x = self.base_x + math.sin(self.t * 0.05) * 60
        if self.t % 70 == 35:
            game.enemy_bullets.append(EnemyBullet.aimed(self.x, self.y, game.player.x, game.player.y))

    def draw(self, screen):
        x, y = int(self.x), int(self.y)
        pygame.draw.polygon(screen, (60, 60, 70),
                            [(x, y + 14), (x - 14, y - 8), (x, y - 2), (x + 14, y - 8)])
        pygame.draw.circle(screen, ORANGE, (x, y + 2), 4)


class Saucer(AirEnemy):
    """화면 위쪽에 잠시 머물며 3방향 탄을 쏘고 떠나는 원반."""

    def __init__(self, x):
        super().__init__(x, -30, 5, 400, 18)

    def move(self, game):
        if self.t < 60:
            self.y += 2
        elif self.t < 240:
            self.x += math.sin(self.t * 0.04) * 1.5
            if self.t % 50 == 0:
                base = math.atan2(game.player.y - self.y, game.player.x - self.x)
                for d in (-0.25, 0, 0.25):
                    game.enemy_bullets.append(
                        EnemyBullet(self.x, self.y, math.cos(base + d) * 3, math.sin(base + d) * 3))
        else:
            self.y -= 3

    def draw(self, screen):
        x, y = int(self.x), int(self.y)
        pygame.draw.ellipse(screen, (170, 170, 190), (x - 20, y - 8, 40, 16))
        pygame.draw.ellipse(screen, (100, 200, 255), (x - 9, y - 14, 18, 14))
        for i in range(4):
            on = (self.t // 6 + i) % 4 == 0
            pygame.draw.circle(screen, YELLOW if on else METAL_DARK, (x - 12 + i * 8, y + 2), 2)


# ---------------------------------------------------------------------------
# 지상 적 (폭탄으로만 파괴 가능, 배경과 함께 스크롤)
# ---------------------------------------------------------------------------
class GroundEnemy:
    ground = True

    def __init__(self, x, y, hp, score, radius):
        self.x, self.y = x, y
        self.hp = hp
        self.score = score
        self.radius = radius
        self.alive = True
        self.t = 0

    def update(self, game):
        self.t += 1
        self.y += SCROLL_SPEED
        self.act(game)
        if self.y > HEIGHT + 40:
            self.alive = False


class Turret(GroundEnemy):
    def __init__(self, x):
        super().__init__(x, -20, 1, 300, 14)
        self.fire_delay = random.randint(60, 120)

    def act(self, game):
        if 0 < self.y < HEIGHT - 150 and self.t % self.fire_delay == 0:
            game.enemy_bullets.append(EnemyBullet.aimed(self.x, self.y, game.player.x, game.player.y, 2.6))

    def draw(self, screen, game):
        x, y = int(self.x), int(self.y)
        pygame.draw.rect(screen, (80, 80, 80), (x - 14, y - 14, 28, 28))
        pygame.draw.circle(screen, METAL, (x, y), 10)
        ang = math.atan2(game.player.y - self.y, game.player.x - self.x)
        pygame.draw.line(screen, METAL_DARK, (x, y),
                         (x + math.cos(ang) * 16, y + math.sin(ang) * 16), 4)


class Tank(GroundEnemy):
    def __init__(self, x):
        super().__init__(x, -20, 2, 500, 13)
        self.vx = random.choice((-0.6, 0.6))

    def act(self, game):
        self.x += self.vx
        if self.x < 20 or self.x > WIDTH - 20 or game.terrain.is_water(self.x + self.vx * 20, self.y):
            self.vx = -self.vx
        if 0 < self.y < HEIGHT - 150 and self.t % 90 == 45:
            game.enemy_bullets.append(EnemyBullet.aimed(self.x, self.y, game.player.x, game.player.y, 2.2))

    def draw(self, screen, game):
        x, y = int(self.x), int(self.y)
        pygame.draw.rect(screen, (40, 40, 40), (x - 13, y - 11, 26, 22))
        pygame.draw.rect(screen, (120, 110, 60), (x - 10, y - 9, 20, 18))
        pygame.draw.circle(screen, (90, 85, 45), (x, y), 6)
        ang = math.atan2(game.player.y - self.y, game.player.x - self.x)
        pygame.draw.line(screen, (60, 55, 30), (x, y),
                         (x + math.cos(ang) * 14, y + math.sin(ang) * 14), 3)


class Fortress(GroundEnemy):
    """일정 점수마다 등장하는 거대 지상 요새. 중앙 코어를 폭탄으로 맞혀야 한다."""

    def __init__(self):
        super().__init__(WIDTH / 2, -90, 12, 5000, 24)
        self.max_hp = self.hp

    def update(self, game):
        self.t += 1
        # 화면 상단에 도달하면 스크롤을 멈추고 머무르다가, 일정 시간 후 다시 흘러간다
        if self.y < 150 or self.t > 900:
            self.y += SCROLL_SPEED
        self.act(game)
        if self.y > HEIGHT + 120:
            self.alive = False

    def act(self, game):
        if self.y < 0:
            return
        if self.t % 40 == 0:
            for i in range(10):
                a = i * math.pi / 5 + self.t * 0.02
                game.enemy_bullets.append(EnemyBullet(self.x, self.y, math.cos(a) * 2.2, math.sin(a) * 2.2))
        if self.t % 25 == 0:
            for ox in (-70, 70):
                game.enemy_bullets.append(EnemyBullet.aimed(self.x + ox, self.y, game.player.x, game.player.y, 3.2))

    def draw(self, screen, game):
        x, y = int(self.x), int(self.y)
        pts = [(x - 100, y), (x - 50, y - 60), (x + 50, y - 60),
               (x + 100, y), (x + 50, y + 60), (x - 50, y + 60)]
        pygame.draw.polygon(screen, (70, 75, 85), pts)
        pygame.draw.polygon(screen, (130, 135, 150), pts, 3)
        for ox in (-70, 70):
            pygame.draw.circle(screen, METAL_DARK, (x + ox, y), 10)
            pygame.draw.circle(screen, RED, (x + ox, y), 4)
        pulse = 4 + int(3 * math.sin(self.t * 0.2))
        pygame.draw.circle(screen, (40, 40, 50), (x, y), 26)
        pygame.draw.circle(screen, (255, 80, 80), (x, y), 14 + pulse)
        pygame.draw.circle(screen, YELLOW, (x, y), 8)
        # 체력바
        w = 120
        pygame.draw.rect(screen, (60, 0, 0), (x - w // 2, y - 76, w, 6))
        pygame.draw.rect(screen, RED, (x - w // 2, y - 76, int(w * self.hp / self.max_hp), 6))


# ---------------------------------------------------------------------------
# 게임 본체
# ---------------------------------------------------------------------------
class Game:
    def __init__(self, screen):
        self.screen = screen
        self.font = pygame.font.SysFont("malgungothic,arial", 20, bold=True)
        self.big_font = pygame.font.SysFont("malgungothic,arial", 40, bold=True)
        self.high_score = 0
        self.reset()

    def reset(self):
        self.terrain = Terrain()
        self.player = Player()
        self.lasers = []
        self.bombs = []
        self.enemy_bullets = []
        self.air_enemies = []
        self.ground_enemies = []
        self.explosions = []
        self.score = 0
        self.lives = 3
        self.tick = 0
        self.area = 1
        self.next_boss = 8000
        self.boss = None
        self.game_over = False
        self.paused = False

    # ---- 스폰 -------------------------------------------------------------
    def spawn(self):
        difficulty = 1 + self.area * 0.3
        boss_active = self.boss is not None and self.boss.alive

        if not boss_active and self.score >= self.next_boss:
            self.boss = Fortress()
            self.ground_enemies.append(self.boss)
            return

        air_rate = 0.5 if boss_active else 1.0
        if random.random() < 0.012 * difficulty * air_rate:
            x = random.randint(40, WIDTH - 40)
            for i in range(random.randint(3, 5)):
                s = Spinner(x + (i - 2) * 26)
                s.y -= i * 22
                self.air_enemies.append(s)
        if random.random() < 0.006 * difficulty * air_rate:
            self.air_enemies.append(Diver(random.randint(80, WIDTH - 80)))
        if random.random() < 0.0018 * difficulty * air_rate:
            self.air_enemies.append(Saucer(random.randint(60, WIDTH - 60)))

        if not boss_active and random.random() < 0.012 * difficulty:
            x = random.randint(24, WIDTH - 24)
            if not self.terrain.is_water(x, 0):
                cls = Tank if random.random() < 0.4 else Turret
                self.ground_enemies.append(cls(x))

    # ---- 판정 -------------------------------------------------------------
    @staticmethod
    def _hit(ax, ay, bx, by, r):
        return (ax - bx) ** 2 + (ay - by) ** 2 < r * r

    def _kill(self, enemy):
        enemy.alive = False
        self.score += enemy.score
        size = 3.0 if isinstance(enemy, Fortress) else 1.0
        self.explosions.append(Explosion(enemy.x, enemy.y, size, enemy.ground))
        if isinstance(enemy, Fortress):
            for _ in range(8):
                self.explosions.append(Explosion(enemy.x + random.randint(-90, 90),
                                                 enemy.y + random.randint(-50, 50), 1.5, True))
            self.enemy_bullets.clear()
            self.next_boss = self.score + 10000
            self.area += 1

    def ground_lock(self):
        tx, ty = self.player.target
        return any(e.alive and self._hit(tx, ty, e.x, e.y, e.radius + 10) for e in self.ground_enemies)

    def collisions(self):
        for laser in self.lasers:
            for e in self.air_enemies:
                if e.alive and laser.alive and self._hit(laser.x, laser.y, e.x, e.y, e.radius + 3):
                    laser.alive = False
                    e.hp -= 1
                    if e.hp <= 0:
                        self._kill(e)

        for bomb in self.bombs:
            if bomb.exploded:
                self.explosions.append(Explosion(bomb.tx, bomb.ty, 0.8, True))
                for e in self.ground_enemies:
                    if e.alive and self._hit(bomb.tx, bomb.ty, e.x, e.y, e.radius + 12):
                        e.hp -= 1
                        if e.hp <= 0:
                            self._kill(e)

        p = self.player
        if p.invincible:
            return
        for b in self.enemy_bullets:
            if self._hit(b.x, b.y, p.x, p.y, p.radius - 3):
                self.player_hit()
                return
        for e in self.air_enemies:
            if e.alive and self._hit(e.x, e.y, p.x, p.y, e.radius + p.radius - 4):
                self._kill(e)
                self.player_hit()
                return

    def player_hit(self):
        self.explosions.append(Explosion(self.player.x, self.player.y, 2.0))
        self.lives -= 1
        self.enemy_bullets.clear()
        if self.lives <= 0:
            self.game_over = True
            self.high_score = max(self.high_score, self.score)
        else:
            self.player.x, self.player.y = WIDTH / 2, HEIGHT - 90
            self.player.invincible = 150

    # ---- 루프 -------------------------------------------------------------
    def handle_input(self):
        keys = pygame.key.get_pressed()
        p = self.player
        p.update(keys)
        if (keys[pygame.K_z] or keys[pygame.K_SPACE]) and p.laser_cd == 0:
            self.lasers.append(Laser(p.x - 6, p.y - 12))
            self.lasers.append(Laser(p.x + 6, p.y - 12))
            p.laser_cd = LASER_COOLDOWN
        if keys[pygame.K_x] and p.bomb_cd == 0:
            tx, ty = p.target
            self.bombs.append(Bomb(p.x, p.y, tx, ty))
            p.bomb_cd = BOMB_COOLDOWN

    def update(self):
        self.tick += 1
        self.terrain.update()
        if not self.game_over:
            self.handle_input()
            self.spawn()

        for group in (self.lasers, self.bombs, self.enemy_bullets, self.explosions):
            for obj in group:
                obj.update()
        for e in self.air_enemies + self.ground_enemies:
            e.update(self)

        if not self.game_over:
            self.collisions()

        self.lasers = [o for o in self.lasers if o.alive]
        self.bombs = [o for o in self.bombs if o.alive]
        self.enemy_bullets = [o for o in self.enemy_bullets if o.alive]
        self.explosions = [o for o in self.explosions if o.alive]
        self.air_enemies = [o for o in self.air_enemies if o.alive]
        self.ground_enemies = [o for o in self.ground_enemies if o.alive]

    def draw_text(self, text, font, color, center):
        surf = font.render(text, True, color)
        shadow = font.render(text, True, BLACK)
        rect = surf.get_rect(center=center)
        self.screen.blit(shadow, rect.move(2, 2))
        self.screen.blit(surf, rect)

    def draw(self):
        s = self.screen
        self.terrain.draw(s, self.tick)
        for e in self.ground_enemies:
            e.draw(s, self)
        for ex in self.explosions:
            if ex.ground:
                ex.draw(s)
        for b in self.bombs:
            b.draw(s)
        if not self.game_over:
            self.player.draw(s, self.tick, self.ground_lock())
        for l in self.lasers:
            l.draw(s)
        for e in self.air_enemies:
            e.draw(s)
        for ex in self.explosions:
            if not ex.ground:
                ex.draw(s)
        for b in self.enemy_bullets:
            b.draw(s, self.tick)

        # HUD
        hud = self.font.render(f"SCORE {self.score:07d}", True, WHITE)
        s.blit(hud, (10, 8))
        hi = self.font.render(f"HI {max(self.high_score, self.score):07d}", True, YELLOW)
        s.blit(hi, (WIDTH - hi.get_width() - 10, 8))
        area = self.font.render(f"AREA {self.area}", True, GREEN)
        s.blit(area, (10, 32))
        for i in range(self.lives):
            x, y = 20 + i * 22, HEIGHT - 20
            pygame.draw.polygon(s, METAL, [(x, y - 9), (x - 8, y + 7), (x + 8, y + 7)])

        if self.paused:
            self.draw_text("PAUSED", self.big_font, WHITE, (WIDTH // 2, HEIGHT // 2))
        if self.game_over:
            self.draw_text("GAME OVER", self.big_font, RED, (WIDTH // 2, HEIGHT // 2 - 20))
            self.draw_text("Enter 키로 재시작", self.font, WHITE, (WIDTH // 2, HEIGHT // 2 + 30))

    def run(self):
        clock = pygame.time.Clock()
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    return
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        return
                    if event.key == pygame.K_p and not self.game_over:
                        self.paused = not self.paused
                    if event.key == pygame.K_RETURN and self.game_over:
                        self.reset()
            if not self.paused:
                self.update()
            self.draw()
            pygame.display.flip()
            clock.tick(FPS)


def main():
    pygame.init()
    pygame.display.set_caption("Vertical Shooter - Sky & Ground")
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    Game(screen).run()
    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
