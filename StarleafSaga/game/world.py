"""맵, 물리, 몬스터 AI, 전투, 드롭, 이펙트."""
import math
import random

import pygame

from .config import (SCREEN_W, SCREEN_H, GROUND_Y, GRAVITY, JUMP_VEL, WHITE, YELLOW, RED, GREEN,
                     ORANGE, GRADE_COLORS, font)
from .data import MAPS, MONSTERS, NPCS, REGIONS, THEMES, SKILLS, JOBS, CONSUMABLES, item_name
from .formulas import monster_stats, hunt_exp_rate, defense_reduction, player_def_reduction, meso_drop
from . import draw as dr
from . import items as itm
from . import quests as qs

PLAYER_W, PLAYER_H = 26, 62


def lv_val(pair, lv):
    """[기본값, 레벨당 증가] → 스킬 레벨 lv의 값"""
    return pair[0] + pair[1] * (lv - 1)


class Plat:
    def __init__(self, x, y, w, solid=False):
        self.x, self.y, self.w, self.solid = x, y, w, solid

    @property
    def right(self):
        return self.x + self.w


def build_platforms(m):
    width = m["width"]
    plats = [Plat(0, GROUND_Y, width, solid=True)]
    if m["platforms"] == "gen":
        rng = random.Random(m["seed"])
        x = 260
        while x < width - 360:
            w = rng.randint(200, 360)
            plats.append(Plat(x, 485, w))
            if rng.random() < 0.65:
                uw = rng.randint(160, 260)
                ux = x + rng.randint(-40, max(-39, w - uw + 40))
                plats.append(Plat(ux, 380, uw))
                if rng.random() < 0.45:
                    tw = rng.randint(140, 220)
                    plats.append(Plat(ux + rng.randint(-30, 60), 275, tw))
            x += w + rng.randint(140, 280)
    else:
        for px, py, pw in m["platforms"]:
            plats.append(Plat(px, py, pw))
    return plats


class Monster:
    def __init__(self, mid, plat, x):
        self.mid = mid
        self.data = MONSTERS[mid]
        self.kind = self.data["kind"]
        self.level = self.data["level"]
        st = monster_stats(self.level, self.kind, self.data.get("hp_mult", 1.0), self.data.get("def_mult", 1.0))
        self.max_hp = self.hp = st["hp"]
        self.atk, self.defense, self.exp, self.scale = st["atk"], st["def"], st["exp"], st["scale"]
        self.plat = plat
        self.x, self.y = x, plat.y
        self.flying = self.data["shape"] in ("flyer", "spirit")
        self.base_y = plat.y - (random.randint(10, 70) if self.flying else 0)
        self.w = 38 * self.scale
        self.h = (48 if self.data["shape"] in ("golem", "knight") else 34) * self.scale
        if self.data["shape"] == "dragon":
            self.w, self.h = 80 * self.scale, 60 * self.scale
        self.facing = random.choice((-1, 1))
        self.move_dir = 0
        self.think = random.uniform(0.5, 2)
        self.aggro = self.kind == "boss"
        self.hit_flash = 0.0
        self.knock = 0.0
        self.knock_v = 0.0
        self.phase = random.uniform(0, 6)
        self.dead = False
        self.speed = (55 + self.level * 0.5) * (0.7 if self.kind == "tank" else 1.0)
        self.skill_timer = random.uniform(5, 7)
        self.telegraph = 0.0
        self.zone = None
        self.summoned = False
        # 상태이상: 기절(행동 불가), 둔화(이동속도 50%), 지속 피해 {skill_id: [초당 피해, 남은 횟수, 누적 시간]}
        self.stun = 0.0
        self.slow = 0.0
        self.dots = {}
        # 마법형 보스(최종 보스) 상태
        self.caster = self.data.get("caster", False)
        self.cast_timer = 3.0
        self.cast_label = ""
        self.cast_label_t = 0.0
        self.shield = 0.0
        self.shield_cd = 12.0
        self.phase2 = False
        if plat.solid:
            self.minx, self.maxx = max(60, x - 300), min(plat.right - 60, x + 300)
        else:
            self.minx, self.maxx = plat.x + 15, plat.right - 15

    @property
    def rect(self):
        if self.flying:
            cy = self.y - 30 * self.scale
            return pygame.Rect(self.x - self.w / 2, cy - self.h / 2, self.w, self.h)
        return pygame.Rect(self.x - self.w / 2, self.y - self.h, self.w, self.h)

    def update(self, dt, world):
        self.hit_flash = max(0, self.hit_flash - dt)
        self.slow = max(0, self.slow - dt)
        if self.stun > 0:
            self.stun -= dt
            return
        px, py = world.px, world.py
        if self.knock > 0:
            self.knock -= dt
            self.x += self.knock_v * dt
        else:
            self.think -= dt
            dist = px - self.x
            if self.aggro and abs(dist) < 650:
                self.move_dir = 1 if dist > 10 else -1 if dist < -10 else 0
                spd = self.speed * (1.35 if self.kind == "boss" and self.hp < self.max_hp / 2 else 1.1)
            else:
                if self.think <= 0:
                    self.move_dir = random.choice((-1, 0, 1, 1, -1))
                    self.think = random.uniform(1.0, 3.0)
                spd = self.speed * 0.6
            if self.slow > 0:
                spd *= 0.5
            self.x += self.move_dir * spd * dt
            if self.move_dir:
                self.facing = self.move_dir
        lo, hi = (60, self.plat.right - 60) if (self.flying or self.aggro) and self.plat.solid else (self.minx, self.maxx)
        if self.x < lo or self.x > hi:
            self.x = max(lo, min(hi, self.x))
            if not self.aggro:
                self.move_dir *= -1
        if self.flying:
            target = self.base_y
            if self.aggro:
                target = max(world.py - 10, GROUND_Y - 200)
                target = min(target, GROUND_Y)
            self.y += (target - self.y) * min(1, dt * 1.5)
            self.y += math.sin(world.t * 3 + self.phase) * 0.6
        # 보스 광역기
        if self.caster:
            self.cast_update(dt, world)
        elif self.kind == "boss":
            if self.telegraph > 0:
                self.telegraph -= dt
                if self.telegraph <= 0:
                    zx0, zx1 = self.zone
                    world.add_fx("shock", (zx0 + zx1) / 2, GROUND_Y, w=zx1 - zx0, color=(255, 80, 60), dur=0.5)
                    if zx0 <= px <= zx1 and world.py >= self.y - 140:
                        world.hurt_player(int(self.atk * 2.2), self)
            else:
                self.skill_timer -= dt
                if self.skill_timer <= 0:
                    self.telegraph = 1.1
                    self.zone = (self.x - 330, self.x + 330)
                    self.skill_timer = random.uniform(4.5, 7.0) * (0.75 if self.hp < self.max_hp / 2 else 1)

    # ---------------- 최종 보스 마법 패턴 ----------------
    def cast_update(self, dt, world):
        self.shield = max(0, self.shield - dt)
        self.shield_cd -= dt
        self.cast_label_t = max(0, self.cast_label_t - dt)
        ratio = self.hp / self.max_hp
        if not self.phase2 and ratio < 0.5:
            self.phase2 = True
            self.cast_timer = 0.5
            world.game.msg("녹스: 별잎의 계승자여... 공허의 진정한 힘을 보여 주마!", (220, 120, 255))
        self.cast_timer -= dt
        if self.cast_timer > 0:
            return
        spells = [("meteor", 3), ("orbs", 3), ("wave", 2), ("teleport", 2)]
        if self.phase2:
            spells += [("summon", 1)]
            if self.shield_cd <= 0:
                spells += [("shield", 3)]
        spell = random.choices([s for s, _ in spells], weights=[w for _, w in spells])[0]
        getattr(self, "spell_" + spell)(world)
        self.cast_timer = 1.3 if ratio < 0.2 else 1.9 if self.phase2 else 2.7

    def _announce(self, world, name):
        self.cast_label, self.cast_label_t = name, 1.6
        world.game.msg(f"녹스의 마법: {name}", (220, 120, 255))

    def spell_meteor(self, world):
        self._announce(world, "공허 운석")
        n = 5 if self.phase2 else 3
        xs = [world.px] + [world.px + random.uniform(-420, 420) for _ in range(n - 1)]
        for x in xs:
            world.hazards.append(dict(kind="meteor", x=max(40, min(world.width - 40, x)), r=90, t=1.3, dur=1.3,
                                      dmg=int(self.atk * 1.8), src=self))

    def spell_orbs(self, world):
        self._announce(world, "암흑 구체")
        for i in range(4 if self.phase2 else 3):
            world.hazards.append(dict(kind="orb", x=self.x + (i - 1) * 50, y=self.y - 120, t=6.0,
                                      speed=230 if self.phase2 else 170, dmg=int(self.atk * 1.2), src=self))

    def spell_wave(self, world):
        self._announce(world, "공허의 파동 — 빛나는 안전지대로!")
        sx = random.uniform(250, world.width - 470)
        world.hazards.append(dict(kind="wave", x0=sx, x1=sx + 220, t=2.0, dur=2.0,
                                  dmg=int(self.atk * 3.0), src=self))

    def spell_teleport(self, world):
        self._announce(world, "그림자 이동")
        self.x = max(80, min(world.width - 80, world.px - world.facing * 130))
        self.facing = 1 if world.px > self.x else -1
        world.hazards.append(dict(kind="slash", x0=self.x - 170, x1=self.x + 170, t=0.75, dur=0.75,
                                  dmg=int(self.atk * 2.0), src=self))

    def spell_shield(self, world):
        self._announce(world, "공허의 장막 (받는 피해 85% 감소)")
        self.shield = 5.0
        self.shield_cd = 15.0

    def spell_summon(self, world):
        adds = sum(1 for m in world.monsters if m.summoned)
        if adds >= 4:
            return self.spell_orbs(world)
        self._announce(world, "공허 소환")
        for side in (-1, 1):
            m = Monster("m_voidwraith", world.plats[0], max(60, min(world.width - 60, self.x + side * 160)))
            m.summoned = True
            m.aggro = True
            world.monsters.append(m)


class World:
    def __init__(self, game, player):
        self.game = game
        self.p = player
        self.t = 0.0
        self.load_map(player.map_id, player.x)

    # ---------------- 맵 ----------------
    def load_map(self, map_id, x=None):
        self.map_id = map_id
        self.m = MAPS[map_id]
        self.p.map_id = map_id
        self.width = self.m["width"]
        self.region = str(self.m["region"])
        self.theme = THEMES[self.region]
        self.plats = build_platforms(self.m)
        self.npcs = [(nid, n) for nid, n in NPCS.items() if n["map"] == map_id]
        self.npc_rects = {}
        self.monsters = []
        self.respawns = []
        self.drops = []
        self.fx = []
        self.dmg_texts = []
        self.hazards = []
        for mid, n in self.m.get("spawns", []):
            for _ in range(n):
                self.spawn(mid)
        self.px = float(x if x is not None else self.width / 2)
        self.py = float(GROUND_Y)
        self.vx = self.vy = 0.0
        self.on_ground = True
        self.facing = 1
        self.invuln = 1.0
        self.atk_cd = 0.0
        self.atk_anim = 0.0
        self.drop_through = 0.0
        self.regen_t = 0.0
        self.buff_regen_t = 0.0
        self.cam_x = 0
        self.sky = self._make_sky()
        self.game.toast(f"{REGIONS[self.region]['name']} - {self.m['name']}")

    def _make_sky(self):
        top, bot = self.theme["sky"]
        if self.m["type"] == "boss":
            top, bot = dr.shade(top, 0.55), dr.shade(bot, 0.6)
        s = pygame.Surface((SCREEN_W, SCREEN_H))
        for yy in range(SCREEN_H):
            k = yy / SCREEN_H
            s.fill([int(top[i] + (bot[i] - top[i]) * k) for i in range(3)], (0, yy, SCREEN_W, 1))
        return s

    def spawn(self, mid):
        mon = MONSTERS[mid]
        if mon["kind"] in ("boss", "elite"):
            plat = self.plats[0]
            x = self.width * (0.65 if mon["kind"] == "boss" else random.uniform(0.4, 0.8))
        else:
            plat = random.choice(self.plats)
            if plat.solid:
                x = random.uniform(300, self.width - 300)
            else:
                x = random.uniform(plat.x + 20, plat.right - 20)
        self.monsters.append(Monster(mid, plat, x))

    def town_id(self):
        return REGIONS[self.region]["town"]

    # ---------------- 갱신 ----------------
    def update(self, dt, keys, input_ok):
        self.t += dt
        p = self.p
        p.update_timers(dt)
        self.invuln = max(0, self.invuln - dt)
        self.atk_cd = max(0, self.atk_cd - dt)
        self.atk_anim = max(0, self.atk_anim - dt)
        self.drop_through = max(0, self.drop_through - dt)

        # 이동
        spd = p.stats["speed"]
        move = 0
        if input_ok:
            if keys[pygame.K_LEFT]:
                move -= 1
            if keys[pygame.K_RIGHT]:
                move += 1
        if move:
            self.facing = move
        if self.atk_anim > 0.15 and self.on_ground:
            move = 0
        self.vx = move * spd
        self.px = max(20, min(self.width - 20, self.px + self.vx * dt))

        # 중력과 발판 (아래에서는 통과하는 일방향 발판)
        prev = self.py
        self.vy += GRAVITY * dt
        self.py += self.vy * dt
        self.on_ground = False
        if self.vy >= 0:
            for pl in self.plats:
                if pl.x - 8 <= self.px <= pl.right + 8 and prev <= pl.y + 1 <= self.py + 1:
                    if not pl.solid and self.drop_through > 0:
                        continue
                    self.py = pl.y
                    self.vy = 0
                    self.on_ground = True
                    break

        if input_ok and keys[pygame.K_z]:
            self.basic_attack()

        # 몬스터
        prect = self.player_rect
        dot_dead = []
        for m in self.monsters:
            m.update(dt, self)
            if m.dots and self.tick_dots(m, dt):
                dot_dead.append(m)
            elif self.invuln <= 0 and m.stun <= 0 and m.rect.colliderect(prect):
                self.hurt_player(m.atk, m)
        for m in dot_dead:
            if not m.dead:
                self.kill(m)
        self.update_hazards(dt)
        # 리스폰
        for r in self.respawns:
            r[0] -= dt
        for r in [r for r in self.respawns if r[0] <= 0]:
            self.respawns.remove(r)
            self.spawn(r[1])

        # 드롭 줍기
        for d in self.drops:
            d["t"] += dt
            if d["y"] < d["floor"]:
                d["vy"] += GRAVITY * 0.6 * dt
                d["y"] = min(d["floor"], d["y"] + d["vy"] * dt)
            if d["t"] > 0.35 and abs(d["x"] - self.px) < 30 and abs(d["y"] - self.py) < 70:
                self.pickup(d)
        self.drops = [d for d in self.drops if not d.get("taken") and d["t"] < 90]

        # 자연 회복
        self.regen_t += dt
        if self.regen_t >= 4:
            self.regen_t = 0
            mult = 3 if self.m["type"] == "town" else 1
            p.hp = min(p.max_hp, p.hp + max(1, int(p.max_hp * 0.02 * mult)))
            p.mp = min(p.max_mp, p.mp + max(1, int(p.max_mp * 0.03 * mult)))
        regen = p.stats["bonus"].get("REGEN", 0)
        if regen:
            self.buff_regen_t += dt
            if self.buff_regen_t >= 1:
                self.buff_regen_t -= 1
                p.hp = min(p.max_hp, p.hp + int(p.max_hp * regen / 100))

        for f in self.fx:
            f["t"] += dt
        self.fx = [f for f in self.fx if f["t"] < f["dur"]]
        for d in self.dmg_texts:
            d["t"] += dt
            if d["t"] > 0:
                d["y"] -= 45 * dt
        self.dmg_texts = [d for d in self.dmg_texts if d["t"] < 1.0]

        target = self.px - SCREEN_W / 2
        self.cam_x = int(max(0, min(self.width - SCREEN_W, target)))

    def update_hazards(self, dt):
        """최종 보스의 마법: 운석 / 추적 구체 / 전체 파동 / 순간이동 베기."""
        p = self.p
        for h in self.hazards:
            h["t"] -= dt
            k = h["kind"]
            if k == "orb":
                dx, dy = self.px - h["x"], (self.py - 35) - h["y"]
                d = math.hypot(dx, dy) or 1
                h["x"] += dx / d * h["speed"] * dt
                h["y"] += dy / d * h["speed"] * dt
                if d < 26:
                    if self.invuln <= 0:
                        drain = int(p.max_mp * 0.2)
                        p.mp = max(0, p.mp - drain)
                        self.game.msg(f"암흑 구체에 맞아 MP {drain:,} 흡수당했다!", (200, 120, 255))
                    self.hurt_player(h["dmg"], h["src"])
                    h["t"] = 0
            elif h["t"] <= 0:
                if k == "meteor":
                    hit = abs(self.px - h["x"]) < h["r"]
                    self.add_fx("shock", h["x"], GROUND_Y, w=h["r"] * 2, color=(170, 60, 255), dur=0.4)
                elif k == "wave":
                    hit = not (h["x0"] <= self.px <= h["x1"])
                    self.add_fx("shock", self.width / 2, GROUND_Y, w=self.width, color=(150, 40, 220), dur=0.6)
                else:
                    hit = h["x0"] <= self.px <= h["x1"] and self.py > GROUND_Y - 200
                    self.add_fx("shock", (h["x0"] + h["x1"]) / 2, GROUND_Y, w=h["x1"] - h["x0"], color=(220, 60, 120), dur=0.35)
                if hit:
                    self.hurt_player(h["dmg"], h["src"])
        self.hazards = [h for h in self.hazards if h["t"] > 0]

    def draw_hazards(self, surf):
        cx = self.cam_x
        for h in self.hazards:
            k = h["kind"]
            layer = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
            if k == "orb":
                x, y = int(h["x"] - cx), int(h["y"])
                pygame.draw.circle(layer, (120, 40, 200, 90), (x, y), 22)
                pygame.draw.circle(layer, (40, 10, 70, 255), (x, y), 12)
                pygame.draw.circle(layer, (210, 150, 255, 255), (x, y), 12, 2)
            elif k == "meteor":
                prog = 1 - h["t"] / h["dur"]
                x = h["x"] - cx
                pygame.draw.ellipse(layer, (170, 40, 255, 60 + int(100 * prog)), (x - h["r"], GROUND_Y - 18, h["r"] * 2, 36))
                my = -40 + (GROUND_Y + 20) * prog
                pygame.draw.circle(layer, (90, 30, 140, 255), (int(x + 60 * (1 - prog)), int(my)), 18)
                pygame.draw.circle(layer, (230, 170, 255, 255), (int(x + 60 * (1 - prog)), int(my)), 18, 3)
            elif k == "wave":
                prog = 1 - h["t"] / h["dur"]
                layer.fill((90, 0, 140, 40 + int(90 * prog)), (0, 0, SCREEN_W, SCREEN_H))
                safe = pygame.Rect(h["x0"] - cx, 0, h["x1"] - h["x0"], SCREEN_H)
                layer.fill((0, 0, 0, 0), safe)
                pygame.draw.rect(layer, (255, 240, 150, 120), (safe.x, GROUND_Y - 220, safe.w, 220), 4)
                dr.text(layer, "안전지대", (safe.centerx, GROUND_Y - 245), 16, (255, 240, 150), bold=True, center=True)
            elif k == "slash":
                prog = 1 - h["t"] / h["dur"]
                layer.fill((255, 40, 90, 50 + int(110 * prog)), (h["x0"] - cx, GROUND_Y - 180, h["x1"] - h["x0"], 180))
            surf.blit(layer, (0, 0))

    @property
    def player_rect(self):
        return pygame.Rect(self.px - PLAYER_W / 2, self.py - PLAYER_H, PLAYER_W, PLAYER_H)

    def jump(self, down=False):
        if not self.on_ground:
            return
        if down:
            if self.py < GROUND_Y - 1:
                self.drop_through = 0.25
                self.py += 2
                self.on_ground = False
            return
        self.vy = JUMP_VEL

    # ---------------- 전투 ----------------
    def hurt_player(self, dmg, src):
        if self.invuln > 0:
            return
        p = self.p
        red = player_def_reduction(p.stats["def"], p.level)
        dmg_red = min(50, p.stats["bonus"].get("DMGRED%", 0)) / 100
        dmg = max(1, int(dmg * (1 - red) * (1 - dmg_red) * random.uniform(0.9, 1.1)))
        p.hp -= dmg
        self.invuln = 1.2
        self.vy = -320
        self.on_ground = False
        kdir = 1 if self.px >= src.x else -1
        self.px = max(20, min(self.width - 20, self.px + kdir * 40))
        self.dmg_texts.append(dict(x=self.px, y=self.py - 80, text=str(dmg), color=(200, 80, 255), t=0, big=False))
        src.aggro = True
        if p.hp <= 0:
            revive = [sid for sid, (_, st) in p.buffs.items() if st.get("REVIVE")]
            if revive:
                for sid in revive:
                    del p.buffs[sid]
                p.invalidate()
                p.hp = p.max_hp // 2
                self.invuln = 2.5
                self.add_fx("buff", self.px, self.py - 30, w=160, color=(255, 240, 160), dur=1.0)
                self.game.msg("부활의 가호가 발동했다! HP 50%로 부활합니다.", YELLOW)
                return
            self.player_die()

    def player_die(self):
        p = self.p
        loss = int(p.exp_need * 0.05)
        p.exp = max(0, p.exp - loss)
        p.hp = max(1, p.max_hp // 2)
        p.mp = max(1, p.max_mp // 2)
        self.game.msg(f"쓰러졌습니다... 경험치 {loss:,} 감소. 마을에서 다시 일어납니다.", RED)
        town = self.town_id()
        self.load_map(town, MAPS[town]["width"] / 2)

    def basic_attack(self):
        if self.atk_cd > 0:
            return
        p = self.p
        jd = JOBS[p.job]
        rng = jd["range"]
        self.atk_cd = 0.5
        self.atk_anim = 0.3
        hit = self.attack_area(rng, 90, 2 if p.job == "warrior" else 1, 100, 1, around=False)
        fx = {"archer": "arrow", "mage": "bolt", "thief": "slash", "warrior": "slash"}.get(p.job, "slash")
        self.add_fx(fx, self.px + self.facing * rng / 2, self.py - 35, w=rng, color=tuple(jd["color"]), dur=0.25, targets=hit)

    def use_skill(self, sid):
        p = self.p
        s = SKILLS[sid]
        lv = p.skills.get(sid, 0)
        if lv <= 0 or s["type"] == "passive":
            return
        if p.cooldowns.get(sid, 0) > 0:
            self.game.msg(f"{s['name']} 재사용 대기 중", ORANGE)
            return
        mp = max(0, int(s["mp"][0] + s["mp"][1] * lv))
        if p.mp < mp:
            self.game.msg("MP가 부족합니다.", ORANGE)
            return
        if s["type"] in ("attack", "heal") and self.atk_cd > 0:
            return
        p.mp -= mp
        if s.get("cd"):
            p.cooldowns[sid] = s["cd"]
        dash = s.get("dash")
        if isinstance(dash, list):
            dash = dash[0] + dash[1] * (lv - 1)
        if s["type"] == "move":
            self.add_fx("dash", self.px, self.py - 35, color=(150, 170, 255), dur=0.25)
            self.px = max(20, min(self.width - 20, self.px + self.facing * dash))
            return
        if s["type"] == "heal":
            amount = int(p.max_hp * lv_val(s["heal"], lv) / 100 * (1 + p.stats["bonus"].get("HEAL%", 0) / 100))
            p.hp = min(p.max_hp, p.hp + amount)
            self.dmg_texts.append(dict(x=self.px, y=self.py - 90, text=f"+{amount:,}", color=GREEN, t=0, big=False))
        if s["type"] == "buff":
            stats = {k: round(b + per * (lv - 1), 1) for k, (b, per) in s["stats"].items()}
            p.buffs[sid] = [s["dur"], stats]
            p.invalidate()
            self.add_fx("buff", self.px, self.py - 30, w=60, color=(255, 220, 120), dur=0.6)
            self.game.msg(f"{s['name']} 버프 ({s['dur']}초)", YELLOW)
            return
        self.atk_cd = 0.55
        self.atk_anim = 0.3
        if dash:
            self.px = max(20, min(self.width - 20, self.px + self.facing * dash))
        w, h = s["range"]
        pct = lv_val(s["dmg"], lv)
        eff = {"sid": sid, "spirit": s.get("spirit_bonus", 1), "slow": s.get("slow", 0)}
        if s.get("dot"):
            eff["dot"] = (lv_val(s["dot"]["chance"], lv), lv_val(s["dot"]["pct"], lv), s["dot"]["dur"])
        if s.get("stun"):
            eff["stun"] = (lv_val(s["stun"]["chance"], lv), s["stun"]["dur"])
        hit = self.attack_area(w, h, s["targets"], pct, s["hits"], s.get("around", False), s.get("boss_bonus", 0), eff)
        cx = self.px if s.get("around") else self.px + self.facing * w / 2
        self.add_fx(s["fx"], cx, self.py - 35, w=w, h=h, color=tuple(s["color"]), dur=0.35, targets=hit)

    def attack_area(self, w, h, targets, pct, hits, around, boss_bonus=0, eff=None):
        """eff: 스킬 부가 효과 {sid, spirit(영혼형 배율), slow(초), dot(확률, %, 초), stun(확률, 초)}"""
        eff = eff or {}
        if around:
            area = pygame.Rect(self.px - w / 2, self.py - 35 - h / 2, w, h)
        elif self.facing > 0:
            area = pygame.Rect(self.px - 10, self.py - 35 - h / 2, w + 10, h)
        else:
            area = pygame.Rect(self.px - w, self.py - 35 - h / 2, w + 10, h)
        cands = [m for m in self.monsters if not m.dead and m.rect.colliderect(area)]
        cands.sort(key=lambda m: abs(m.x - self.px))
        hit_pts = []
        p = self.p
        for m in cands[:targets]:
            eff_def = m.defense * (1 - p.stats["ied"] / 100)
            red = 1 - defense_reduction(eff_def)
            r = m.rect
            if m.shield > 0:
                red *= 0.15
            if m.data["shape"] == "spirit":
                red *= eff.get("spirit", 1)
            for i in range(hits):
                dmg, crit = p.roll_damage(pct, m.kind == "boss", boss_bonus)
                dmg = max(1, int(dmg * red))
                m.hp -= dmg
                self.dmg_texts.append(dict(x=m.x + random.randint(-6, 6), y=r.top - 10 - i * 24, text=f"{dmg:,}",
                                           color=(255, 140, 60) if crit else (255, 230, 90), t=-0.06 * i, big=crit))
            m.hit_flash = 0.12
            m.aggro = True
            if m.kind not in ("boss",):
                m.knock = 0.15
                m.knock_v = (1 if m.x > self.px else -1) * 160
            hit_pts.append((m.x, r.centery))
            self.apply_effects(m, eff, red)
            if m.hp <= 0:
                self.kill(m)
        mpeat = p.stats["bonus"].get("MPEAT", 0)
        if hit_pts and mpeat and random.random() * 100 < mpeat:
            p.mp = min(p.max_mp, p.mp + int(p.max_mp * 0.03))
        return hit_pts

    def apply_effects(self, m, eff, red):
        """지속 피해/기절/둔화 부여. 보스는 기절·둔화에 면역."""
        p = self.p
        if eff.get("dot"):
            chance, pct, dur = eff["dot"]
            if random.random() * 100 < chance:
                avg = (p.stats["min_dmg"] + p.stats["max_dmg"]) / 2
                dps = avg * pct / 100 * red * (1 + p.stats["bonus"].get("DOT%", 0) / 100)
                m.dots[eff["sid"]] = [max(1, dps), dur, 0.0]
        if m.kind == "boss":
            return
        if eff.get("stun") and random.random() * 100 < eff["stun"][0]:
            m.stun = eff["stun"][1]
            self.dmg_texts.append(dict(x=m.x, y=m.rect.top - 30, text="기절!", color=(255, 255, 160), t=0, big=False))
        if eff.get("slow"):
            m.slow = eff["slow"]

    def tick_dots(self, m, dt):
        """지속 피해 1초 단위 처리. 몬스터가 쓰러지면 True."""
        for sid in list(m.dots):
            d = m.dots[sid]
            d[2] += dt
            if d[2] >= 1:
                d[2] -= 1
                d[1] -= 1
                dmg = int(d[0])
                m.hp -= dmg
                self.dmg_texts.append(dict(x=m.x + random.randint(-10, 10), y=m.rect.top - 14, text=f"{dmg:,}",
                                           color=(170, 230, 90), t=0, big=False))
                if d[1] <= 0:
                    del m.dots[sid]
        return m.hp <= 0

    def kill(self, m):
        m.dead = True
        self.monsters.remove(m)
        p = self.p
        exp = int(m.exp * hunt_exp_rate(p.level, m.level))
        ups = p.gain_exp(exp)
        self.dmg_texts.append(dict(x=m.x, y=m.rect.top - 40, text=f"EXP +{exp:,}", color=(180, 255, 180), t=0.1, big=False))
        if ups:
            self.game.on_level_up(ups)
        for line in qs.on_kill(m.mid, p):
            self.game.msg(line, (170, 220, 255))
        self.make_drops(m)
        delay = self.m.get("boss_respawn", 60) if m.kind == "boss" else (40 if m.kind == "elite" else random.uniform(5, 9))
        if not m.summoned:
            self.respawns.append([delay, m.mid])
        if m.caster:
            self.hazards = []
            for add in [a for a in self.monsters if a.summoned]:
                self.monsters.remove(add)
        if m.kind == "boss":
            self.game.msg(f"{m.data['name']}을(를) 쓰러뜨렸다!", YELLOW)

    def make_drops(self, m):
        floor = m.plat.y
        lv = m.level
        drops = []
        if random.random() < 0.75:
            lo, hi = meso_drop(lv)
            mult = 20 if m.kind == "boss" else 5 if m.kind == "elite" else 1
            drops.append(("meso", random.randint(lo, hi) * mult))
        if random.random() < 0.08:
            hp_id = "hp_s" if lv < 20 else "hp_m" if lv < 50 else "hp_l" if lv < 80 else "hp_x"
            mp_id = "mp_s" if lv < 30 else "mp_m" if lv < 70 else "mp_l"
            drops.append(("use", random.choice((hp_id, mp_id))))
        etc = m.data.get("etc")
        if etc and etc in qs.wanted_items(self.p) and random.random() < 0.6:
            drops.append(("etc", etc))
        n_equip = 0
        if m.kind == "boss":
            n_equip = 2 + (random.random() < 0.5)
        elif m.kind == "elite":
            n_equip = 1
        elif random.random() < 0.035:
            n_equip = 1
        for _ in range(n_equip):
            drops.append(("equip", itm.random_drop(lv, m.kind, m.data.get("set_drop"), self.p.job)))
        if m.kind == "boss" and random.random() < 0.5:
            drops.append(("use", "cube_m"))
        k = len(drops)
        for i, (kind, val) in enumerate(drops):
            off = (i - (k - 1) / 2) * 26
            self.drops.append(dict(kind=kind, val=val, x=m.x + off, y=floor - 40, vy=-300, floor=floor, t=0))

    def pickup(self, d):
        p = self.p
        d["taken"] = True
        if d["kind"] == "meso":
            p.meso += d["val"]
            self.game.msg(f"메소 +{d['val']:,}", (255, 230, 120))
        elif d["kind"] in ("use", "etc"):
            p.add_item(d["val"])
            self.game.msg(f"{item_name(d['val'])} 획득", WHITE)
        else:
            it = d["val"]
            p.add_equip(it)
            g = it["grade"]
            self.game.msg(f"장비 [{it['name']}] 획득" + (f" ({['', '레어', '에픽', '유니크', '레전드리'][g]})" if g else ""),
                          GRADE_COLORS[g])

    def use_town_scroll(self):
        town = self.town_id()
        self.load_map(town, MAPS[town]["width"] / 2)

    # ---------------- 상호작용 ----------------
    def try_portal(self):
        for pt in self.m.get("portals", []):
            if abs(pt["x"] - self.px) < 45 and abs(self.py - GROUND_Y) < 5:
                req = pt.get("req")
                if req and not qs.started_or_done(req, self.p):
                    from .data import QUESTS
                    self.game.msg(f"아직 갈 수 없습니다. (필요: 퀘스트 [{QUESTS[req]['title']}] 수락)", ORANGE)
                    return True
                if pt.get("minlv") and self.p.level < pt["minlv"]:
                    self.game.msg(f"주의: 권장 레벨 {pt['minlv']} 이상의 위험 지역입니다.", ORANGE)
                self.p.x = pt["tx"]
                self.load_map(pt["to"], pt["tx"])
                self.game.autosave()
                return True
        return False

    def nearest_npc(self, maxd=90):
        best, bd = None, maxd
        for nid, n in self.npcs:
            d = abs(n["x"] - self.px)
            if d < bd and abs(self.py - GROUND_Y) < 130:
                best, bd = nid, d
        return best

    def npc_at(self, screen_pos):
        for nid, r in self.npc_rects.items():
            if r.collidepoint(screen_pos):
                return nid
        return None

    def add_fx(self, kind, x, y, w=80, h=80, color=WHITE, dur=0.3, targets=None):
        self.fx.append(dict(kind=kind, x=x, y=y, w=w, h=h, color=color, dur=dur, t=0, dir=self.facing,
                            sx=self.px, sy=self.py - 35, targets=targets or []))

    # ---------------- 그리기 ----------------
    def draw(self, surf):
        cx = self.cam_x
        th = self.theme
        surf.blit(self.sky, (0, 0))
        # 원경 언덕 (패럴랙스)
        hill = th["hill"]
        for layer, (k, amp, base, colf) in enumerate(((0.2, 60, 470, 0.95), (0.45, 40, 530, 0.8))):
            pts = [(0, SCREEN_H)]
            for sx in range(0, SCREEN_W + 41, 40):
                wx = sx + cx * k
                pts.append((sx, base - amp * (0.5 + 0.5 * math.sin(wx / 170 + layer * 2)) - 20 * math.sin(wx / 67)))
            pts.append((SCREEN_W, SCREEN_H))
            pygame.draw.polygon(surf, dr.shade(hill, colf), pts)
        if self.region == "5":
            for i in range(30):
                sx = (i * 137 - cx * 0.1) % SCREEN_W
                pygame.draw.circle(surf, (220, 200, 255), (int(sx), (i * 53) % 300 + 20), 1 + i % 2)
        # 바닥
        pygame.draw.rect(surf, th["dirt"], (0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y))
        pygame.draw.rect(surf, th["ground"], (0, GROUND_Y, SCREEN_W, 14))
        # 발판
        for pl in self.plats[1:]:
            r = pygame.Rect(pl.x - cx, pl.y, pl.w, 16)
            if r.right < 0 or r.left > SCREEN_W:
                continue
            pygame.draw.rect(surf, th["plat"], r, border_radius=4)
            pygame.draw.rect(surf, th["ground"], (r.x, r.y, r.w, 5), border_radius=3)
        # 포탈
        for pt in self.m.get("portals", []):
            sx = pt["x"] - cx
            if -60 < sx < SCREEN_W + 60:
                locked = pt.get("req") and not qs.started_or_done(pt["req"], self.p)
                col = (130, 130, 140) if locked else (120, 200, 255)
                for i in range(3):
                    rr = 30 - i * 8 + 3 * math.sin(self.t * 4 + i)
                    pygame.draw.ellipse(surf, dr.shade(col, 1 - i * 0.15), (sx - rr * 0.7, GROUND_Y - 50 - rr, rr * 1.4, rr * 2), 3)
                dr.text(surf, pt["label"], (sx, GROUND_Y - 105), 12, (220, 240, 255), center=True)
        # NPC
        self.npc_rects = {}
        for nid, n in self.npcs:
            sx = n["x"] - cx
            if -80 < sx < SCREEN_W + 80:
                self.npc_rects[nid] = dr.draw_npc(surf, n, sx, GROUND_Y, self.t, qs.npc_marker(nid, self.p))
        # 보스 경고 구역
        for m in self.monsters:
            if m.kind == "boss" and m.telegraph > 0:
                zx0, zx1 = m.zone
                zone = pygame.Surface((zx1 - zx0, 160), pygame.SRCALPHA)
                a = 60 + int(80 * (1 - m.telegraph / 1.1))
                zone.fill((255, 40, 40, a))
                surf.blit(zone, (zx0 - cx, GROUND_Y - 160))
        self.draw_hazards(surf)
        # 몬스터
        for m in self.monsters:
            sx = m.x - cx
            if -150 < sx < SCREEN_W + 150:
                dr.draw_monster(surf, m, sx, m.y, self.t)
                r = m.rect.move(-cx, 0)
                if m.shield > 0:
                    aura = pygame.Surface((r.w + 60, r.h + 60), pygame.SRCALPHA)
                    pygame.draw.ellipse(aura, (170, 80, 255, 90 + int(40 * math.sin(self.t * 8))), aura.get_rect())
                    pygame.draw.ellipse(aura, (220, 170, 255, 220), aura.get_rect(), 3)
                    surf.blit(aura, (r.x - 30, r.y - 30))
                # 상태이상 표시: 기절(노란 별), 둔화(하늘색), 지속 피해(초록 거품)
                ix = sx - 18
                if m.stun > 0:
                    for k in range(3):
                        a = self.t * 6 + k * 2.1
                        pygame.draw.circle(surf, (255, 240, 120), (int(sx + math.cos(a) * 16), int(r.top - 20 + math.sin(a) * 4)), 4)
                if m.slow > 0:
                    pygame.draw.circle(surf, (150, 210, 255), (int(ix), int(r.top - 18)), 6, 2)
                    ix += 14
                if m.dots:
                    pygame.draw.circle(surf, (150, 230, 80), (int(ix), int(r.top - 18 + math.sin(self.t * 5) * 2)), 5)
                if m.cast_label_t > 0:
                    dr.text(surf, m.cast_label, (sx, r.top - 40), 18, (230, 160, 255), bold=True, center=True)
                if m.hp < m.max_hp or m.kind != "normal":
                    bw = max(40, int(m.w))
                    pygame.draw.rect(surf, (40, 0, 0), (sx - bw / 2, r.top - 10, bw, 5))
                    pygame.draw.rect(surf, RED, (sx - bw / 2, r.top - 10, bw * max(0, m.hp) / m.max_hp, 5))
                tag = f"Lv.{m.level} {m.data['name']}"
                col = (255, 120, 120) if m.level > self.p.level + 5 else (230, 230, 230)
                dr.text(surf, tag, (sx, m.y + 4), 11, col, center=True)
        # 드롭
        for d in self.drops:
            sx, sy = d["x"] - cx, d["y"] - 10 + math.sin(self.t * 4 + d["x"]) * 2
            if d["kind"] == "meso":
                pygame.draw.circle(surf, (255, 210, 60), (int(sx), int(sy)), 7)
                pygame.draw.circle(surf, (200, 150, 30), (int(sx), int(sy)), 7, 2)
            elif d["kind"] == "equip":
                g = d["val"]["grade"]
                pygame.draw.rect(surf, (80, 70, 60), (sx - 9, sy - 9, 18, 18), border_radius=3)
                pygame.draw.rect(surf, GRADE_COLORS[g], (sx - 9, sy - 9, 18, 18), 2, border_radius=3)
            else:
                col = (240, 90, 90) if str(d["val"]).startswith("hp") else (90, 140, 255) if str(d["val"]).startswith("mp") else (200, 180, 120)
                if str(d["val"]).startswith("cube"):
                    col = (180, 120, 255)
                pygame.draw.circle(surf, col, (int(sx), int(sy)), 7)
        # 플레이어
        p = self.p
        dr.draw_player(surf, self.px - cx, self.py, self.facing, p.job, tuple(JOBS[p.job]["color"]), self.t,
                       self.atk_anim / 0.3 if self.atk_anim else 0, self.invuln > 0 and self.invuln < 1.15,
                       p.equipped.get("weapon") is not None)
        dr.text(surf, p.name, (self.px - cx, self.py + 4), 12, (255, 255, 200), center=True)
        self.draw_fx(surf)
        for d in self.dmg_texts:
            if d["t"] < 0:
                continue
            a = max(0, 1 - d["t"])
            size = 24 if d["big"] else 18
            img = font(size, True).render(d["text"], True, d["color"])
            img.set_alpha(int(255 * a))
            surf.blit(img, img.get_rect(center=(d["x"] - cx, d["y"])))

    def draw_fx(self, surf):
        cx = self.cam_x
        for f in self.fx:
            k = f["t"] / f["dur"]
            col = f["color"]
            x, y, w, h, d = f["x"] - cx, f["y"], f["w"], f["h"], f["dir"]
            sx, sy = f["sx"] - cx, f["sy"]
            kind = f["kind"]
            layer = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
            alpha = int(220 * (1 - k))
            c = (*col, alpha)
            if kind == "slash":
                rect = pygame.Rect(0, 0, min(w, 160), 90)
                rect.center = (sx + d * min(w, 160) / 2, sy)
                a0 = -1.2 + k * 1.5
                pygame.draw.arc(layer, c, rect, a0 if d > 0 else math.pi - a0 - 1.6, (a0 + 1.6) if d > 0 else math.pi - a0, 6)
            elif kind in ("arrow", "bolt"):
                tx = sx + d * w * min(1, k * 2.5)
                if f["targets"]:
                    tx = f["targets"][0][0] - cx if k > 0.4 else sx + (f["targets"][0][0] - cx - sx) * k / 0.4
                if kind == "arrow":
                    pygame.draw.line(layer, c, (tx - d * 22, sy), (tx, sy), 3)
                else:
                    pygame.draw.circle(layer, c, (int(tx), int(sy)), 9)
            elif kind in ("whirl", "buff"):
                rr = int(20 + w / 2 * k)
                pygame.draw.circle(layer, c, (int(x), int(y)), rr, 5)
            elif kind == "beam":
                pygame.draw.rect(layer, c, (min(sx, sx + d * w), sy - 6 * (1 - k) - 2, w, 12 * (1 - k) + 4))
            elif kind == "burst":
                pts = f["targets"] or [(f["x"], y)]
                for tx, ty in pts:
                    pygame.draw.circle(layer, c, (int(tx - cx), int(ty)), int(14 + 40 * k))
            elif kind == "rain":
                for i in range(14):
                    rx = x - w / 2 + (i * 53 % max(1, int(w)))
                    ry = y - 160 + ((k * 300 + i * 37) % 200)
                    pygame.draw.line(layer, c, (rx, ry), (rx - 8, ry + 26), 3)
            elif kind == "lightning":
                for tx, ty in f["targets"]:
                    pts = [(sx, sy)]
                    for j in range(1, 6):
                        pts.append((sx + (tx - cx - sx) * j / 6 + random.randint(-8, 8), sy + (ty - sy) * j / 6 + random.randint(-14, 14)))
                    pts.append((tx - cx, ty))
                    pygame.draw.lines(layer, c, False, pts, 3)
            elif kind == "quake":
                pygame.draw.rect(layer, c, (min(sx, sx + d * w * k), sy + 5, w * k, 30))
            elif kind == "dash":
                pygame.draw.rect(layer, c, (min(sx, sx - d * 140), sy - 25, 140, 50), border_radius=20)
            elif kind == "shock":
                pygame.draw.rect(layer, c, (x - w / 2, GROUND_Y - 40 * (1 - k), w, 40 * (1 - k) + 4))
            surf.blit(layer, (0, 0))
