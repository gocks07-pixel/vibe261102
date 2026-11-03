"""플레이어: 레벨/경험치, AP 스탯 분배, 장비, 스킬, 버프, 인벤토리."""
import random

from .config import (MAX_LEVEL, AP_PER_LEVEL, SP_PER_LEVEL, SP_START_LEVEL, STAT_KEYS, MOVE_SPEED)
from .data import JOBS, SKILLS, SLOT_ORDER, START_MAP, job_name, skill_branch_ok
from .formulas import exp_to_next
from . import items as itm

INV_SIZE = 48
QUICK_KEYS = ["A", "S", "D", "F", "G", "H"]


class Player:
    def __init__(self, name="모험가"):
        self.name = name
        self.job = "beginner"
        self.job_tier = 0
        self.branches = {}           # 차수("2"~"4") -> 계열 (마법사 전용)
        self.level = 1
        self.exp = 0
        self.ap = 0
        self.sp = 0
        self.base = {"STR": 5, "DEX": 5, "INT": 4, "LUK": 4}
        self.meso = 100
        self.equipped = {s: None for s in SLOT_ORDER}
        self.inventory = []          # 장비 dict 목록
        self.consumables = {"hp_s": 10, "mp_s": 5}
        self.etc = {}
        self.skills = {}             # skill_id -> level
        self.quick = [None] * len(QUICK_KEYS)
        self.buffs = {}              # skill_id -> [남은 시간, stats]
        self.cooldowns = {}
        self.quests_active = {}      # qid -> {"kills": {mid: n}}
        self.quests_done = []
        self.map_id = START_MAP
        self.x, self.y = 400.0, 300.0
        self._stats = None
        self.hp = self.max_hp
        self.mp = self.max_mp

    # ---------- 파생 스탯 ----------
    def invalidate(self):
        self._stats = None

    def bonus_totals(self):
        tot = {}

        def add(d):
            for k, v in d.items():
                tot[k] = tot.get(k, 0) + v

        for it in self.equipped.values():
            if it:
                add(itm.item_stats(it))
        for sid, n in itm.set_counts(self.equipped).items():
            add(itm.set_bonus(sid, n))
        for sid, lv in self.skills.items():
            s = SKILLS[sid]
            if s["type"] == "passive" and lv > 0:
                add({k: b + p * (lv - 1) for k, (b, p) in s["stats"].items()})
        for sid, (t, stats) in self.buffs.items():
            add(stats)
        return tot

    @property
    def stats(self):
        if self._stats is None:
            self._stats = self._compute()
        return self._stats

    def _compute(self):
        b = self.bonus_totals()
        jd = JOBS[self.job]
        final = {}
        for k in STAT_KEYS:
            flat = self.base[k] + b.get(k, 0) + b.get("ALL", 0)
            pct = b.get(k + "%", 0) + b.get("ALL%", 0)
            final[k] = int(flat * (1 + pct / 100))
        main, sub = final[jd["main"]], final[jd["sub"]]
        weapon = self.equipped.get("weapon")
        att_flat = b.get("ATT", 0) + (0 if weapon else 8)
        att = att_flat * (1 + b.get("ATT%", 0) / 100)
        max_dmg = (main * 4 + sub) / 100 * att * (1 + b.get("DMG%", 0) / 100)
        max_hp = int((50 + jd["hp_lv"] * (self.level - 1) + b.get("HP", 0)) * (1 + b.get("HP%", 0) / 100))
        max_mp = int((30 + jd["mp_lv"] * (self.level - 1) + b.get("MP", 0)) * (1 + b.get("MP%", 0) / 100))
        return {
            **final, "main": main, "sub": sub, "att": int(att),
            "max_dmg": max(1, int(max_dmg)), "min_dmg": max(1, int(max_dmg * 0.75)),
            "max_hp": max_hp, "max_mp": max_mp, "def": int(b.get("DEF", 0)),
            "crit": min(100, 5 + b.get("CRIT", 0)), "critd": 35 + b.get("CRITD", 0),
            "boss": b.get("BOSS%", 0), "ied": min(90, b.get("IED%", 0)),
            "speed": MOVE_SPEED * (1 + min(40, b.get("SPEED", 0)) / 100),
            "bonus": b,
        }

    @property
    def max_hp(self):
        return self.stats["max_hp"]

    @property
    def max_mp(self):
        return self.stats["max_mp"]

    @property
    def job_title(self):
        return job_name(self.job, self.job_tier, self.branches)

    def roll_damage(self, pct, is_boss=False, extra_boss=0):
        s = self.stats
        dmg = random.uniform(s["min_dmg"], s["max_dmg"]) * pct / 100
        crit = random.random() * 100 < s["crit"]
        if crit:
            dmg *= 1 + s["critd"] / 100
        if is_boss:
            dmg *= 1 + (s["boss"] + extra_boss) / 100
        return dmg, crit

    # ---------- 성장 ----------
    @property
    def exp_need(self):
        return exp_to_next(self.level)

    def gain_exp(self, amount):
        """경험치 획득. 오른 레벨 수 반환. 만렙이면 경험치가 쌓이지 않는다."""
        if self.level >= MAX_LEVEL:
            self.exp = 0
            return 0
        self.exp += int(amount)
        ups = 0
        while self.level < MAX_LEVEL and self.exp >= self.exp_need:
            self.exp -= self.exp_need
            self.level += 1
            self.ap += AP_PER_LEVEL           # 분배하지 않으면 계속 누적
            if self.level > SP_START_LEVEL:
                self.sp += SP_PER_LEVEL
            ups += 1
        if self.level >= MAX_LEVEL:
            self.exp = 0
        if ups:
            self.invalidate()
            self.hp, self.mp = self.max_hp, self.max_mp
        return ups

    def add_stat(self, key, n=1):
        n = min(n, self.ap)
        if n <= 0:
            return False
        self.base[key] += n
        self.ap -= n
        self.invalidate()
        return True

    def auto_assign(self):
        """주스탯 위주 자동 분배 (주스탯 4 : 부스탯 1)."""
        jd = JOBS[self.job]
        while self.ap > 0:
            key = jd["sub"] if self.base[jd["sub"]] < self.level // 4 + 4 else jd["main"]
            self.add_stat(key)

    def set_job(self, job):
        self.job = job
        self.invalidate()

    # ---------- 스킬 ----------
    def available_skills(self):
        return [s for s in SKILLS.values() if s["job"] == self.job and s["tier"] <= self.job_tier
                and skill_branch_ok(s, self.branches)]

    def learn_skill(self, sid):
        s = SKILLS[sid]
        lv = self.skills.get(sid, 0)
        if self.sp <= 0 or lv >= s["max"] or s not in self.available_skills():
            return False
        self.skills[sid] = lv + 1
        self.sp -= 1
        if lv == 0 and s["type"] != "passive" and sid not in self.quick and None in self.quick:
            self.quick[self.quick.index(None)] = sid
        self.invalidate()
        return True

    def update_timers(self, dt):
        changed = False
        for sid in list(self.buffs):
            self.buffs[sid][0] -= dt
            if self.buffs[sid][0] <= 0:
                del self.buffs[sid]
                changed = True
        for sid in list(self.cooldowns):
            self.cooldowns[sid] -= dt
            if self.cooldowns[sid] <= 0:
                del self.cooldowns[sid]
        if changed:
            self.invalidate()
            self.hp = min(self.hp, self.max_hp)
            self.mp = min(self.mp, self.max_mp)

    # ---------- 아이템 ----------
    def add_equip(self, item):
        self.inventory.append(item)
        return len(self.inventory) <= INV_SIZE

    def equip(self, item):
        ok, msg = itm.can_equip(item, self)
        if not ok:
            return msg
        slot = item["slot"]
        if item in self.inventory:
            self.inventory.remove(item)
        if self.equipped[slot]:
            self.inventory.append(self.equipped[slot])
        self.equipped[slot] = item
        self.invalidate()
        self.hp = min(self.hp, self.max_hp)
        return f"{item['name']} 장착"

    def unequip(self, slot):
        it = self.equipped.get(slot)
        if it:
            self.equipped[slot] = None
            self.inventory.append(it)
            self.invalidate()
            self.hp = min(self.hp, self.max_hp)
            self.mp = min(self.mp, self.max_mp)

    def add_item(self, item_id, n=1):
        from .data import CONSUMABLES
        bag = self.consumables if item_id in CONSUMABLES else self.etc
        bag[item_id] = bag.get(item_id, 0) + n

    def remove_item(self, item_id, n=1):
        for bag in (self.consumables, self.etc):
            if bag.get(item_id, 0) >= n:
                bag[item_id] -= n
                if bag[item_id] <= 0:
                    del bag[item_id]
                return True
        return False

    def count_item(self, item_id):
        return self.consumables.get(item_id, 0) + self.etc.get(item_id, 0)

    # ---------- 저장 ----------
    def to_dict(self):
        return {
            "name": self.name, "job": self.job, "job_tier": self.job_tier, "level": self.level,
            "branches": self.branches, "exp": self.exp, "ap": self.ap, "sp": self.sp, "base": self.base, "meso": self.meso,
            "equipped": self.equipped, "inventory": self.inventory, "consumables": self.consumables,
            "etc": self.etc, "skills": self.skills, "quick": self.quick,
            "quests_active": self.quests_active, "quests_done": self.quests_done,
            "map_id": self.map_id, "x": self.x, "hp": self.hp, "mp": self.mp,
        }

    @classmethod
    def from_dict(cls, d):
        p = cls(d["name"])
        for k in ("job", "job_tier", "level", "exp", "ap", "sp", "base", "meso", "inventory",
                  "consumables", "etc", "skills", "quick", "quests_active", "quests_done", "map_id", "x"):
            setattr(p, k, d[k])
        for s in SLOT_ORDER:
            p.equipped[s] = d["equipped"].get(s)
        p.branches = d.get("branches", {})
        if JOBS[p.job].get("branches"):
            # 계열 선택이 생기기 전에 전직한 세이브: 이전 차수 계열(없으면 화염·독)로 채움
            for t in range(2, p.job_tier + 1):
                p.branches.setdefault(str(t), p.branches.get(str(t - 1), "fire"))
        # 데이터에서 사라졌거나 계열이 맞지 않는 스킬은 SP 환급
        usable = {s["id"] for s in p.available_skills()}
        for sid in [sid for sid in p.skills if sid not in usable]:
            p.sp += p.skills.pop(sid)
        p.quick = [q if q in p.skills else None for q in p.quick]
        p.invalidate()
        p.hp = min(d.get("hp", p.max_hp), p.max_hp)
        p.mp = min(d.get("mp", p.max_mp), p.max_mp)
        return p
