"""HUD와 창(능력치/인벤토리/장비/스킬/퀘스트/상점/대화)."""
import pygame

from .config import (SCREEN_W, SCREEN_H, UI_BG, UI_BG2, UI_LINE, UI_TEXT, UI_DIM, WHITE, YELLOW, RED, GREEN,
                     BLUE, ORANGE, GRADE_COLORS, GRADE_NAMES, STAT_KEYS, STAT_NAMES, MAX_LEVEL, font)
from .data import (SKILLS, SLOTS, SLOT_ORDER, SETS, CONSUMABLES, ETC_ITEMS, NPCS, MAPS, QUESTS, JOBS,
                   item_name, job_name)
from . import draw as dr
from . import items as itm
from . import quests as qs
from .player import QUICK_KEYS, INV_SIZE

HUD_H = 78


def panel(surf, rect, color=UI_BG, border=UI_LINE, radius=8, alpha=235):
    s = pygame.Surface(rect.size, pygame.SRCALPHA)
    pygame.draw.rect(s, (*color, alpha), s.get_rect(), border_radius=radius)
    pygame.draw.rect(s, (*border, 255), s.get_rect(), 2, border_radius=radius)
    surf.blit(s, rect.topleft)


def bar(surf, rect, ratio, color, label=""):
    pygame.draw.rect(surf, (20, 20, 28), rect, border_radius=4)
    r = rect.copy()
    r.w = int(rect.w * max(0, min(1, ratio)))
    pygame.draw.rect(surf, color, r, border_radius=4)
    pygame.draw.rect(surf, (0, 0, 0), rect, 1, border_radius=4)
    if label:
        dr.text(surf, label, rect.center, 12, WHITE, center=True)


def button(surf, rect, label, hot=False, enabled=True, size=13):
    col = (70, 90, 140) if hot and enabled else (55, 62, 84) if enabled else (45, 45, 52)
    pygame.draw.rect(surf, col, rect, border_radius=5)
    pygame.draw.rect(surf, UI_LINE, rect, 1, border_radius=5)
    dr.text(surf, label, rect.center, size, UI_TEXT if enabled else UI_DIM, center=True)


def consumable_color(cid):
    if cid.startswith("hp"):
        return (235, 80, 80)
    if cid.startswith("mp"):
        return (80, 130, 245)
    if cid.startswith("cube"):
        return (175, 115, 255)
    return (220, 200, 140)


# =====================================================================
class Window:
    def __init__(self, ui, key, title, rect):
        self.ui, self.key, self.title = ui, key, title
        self.rect = pygame.Rect(rect)
        self.buttons = []
        self.dragging = None

    @property
    def game(self):
        return self.ui.game

    @property
    def p(self):
        return self.ui.game.player

    def add_btn(self, rect, fn, mouse=(1,)):
        self.buttons.append((pygame.Rect(rect), fn, mouse))

    def draw(self, surf, mouse):
        self.buttons = []
        panel(surf, self.rect)
        pygame.draw.rect(surf, UI_BG2, (self.rect.x + 2, self.rect.y + 2, self.rect.w - 4, 26), border_top_left_radius=8, border_top_right_radius=8)
        dr.text(surf, self.title, (self.rect.x + 12, self.rect.y + 5), 15, YELLOW, bold=True)
        close = pygame.Rect(self.rect.right - 28, self.rect.y + 4, 22, 20)
        button(surf, close, "X", close.collidepoint(mouse))
        self.add_btn(close, lambda: self.ui.close(self.key))
        self.draw_content(surf, mouse, self.rect.x + 12, self.rect.y + 36)

    def draw_content(self, surf, mouse, x, y):
        pass

    def click(self, pos, btn):
        for r, fn, mouse in reversed(self.buttons):
            if btn in mouse and r.collidepoint(pos):
                fn()
                return True
        if btn == 1 and pos[1] < self.rect.y + 28:
            self.dragging = (pos[0] - self.rect.x, pos[1] - self.rect.y)
        return True

    def key(self, ev):
        return False


# ---------------------------------------------------------------------
class StatWindow(Window):
    def __init__(self, ui):
        super().__init__(ui, "stat", "능력치 (C)", (40, 70, 330, 540))

    def draw_content(self, surf, mouse, x, y):
        p = self.p
        s = p.stats
        dr.text(surf, f"{p.name}", (x, y), 16, WHITE, bold=True)
        dr.text(surf, f"Lv.{p.level}  {p.job_title}", (x, y + 24), 14, UI_TEXT)
        need = p.exp_need
        dr.text(surf, f"EXP {p.exp:,} / {need:,}" if p.level < MAX_LEVEL else "EXP MAX", (x, y + 46), 12, UI_DIM)
        y += 74
        ap_col = YELLOW if p.ap else UI_DIM
        dr.text(surf, f"남은 AP : {p.ap}", (x, y), 15, ap_col, bold=True)
        auto = pygame.Rect(x + 200, y - 2, 96, 24)
        button(surf, auto, "자동 분배", auto.collidepoint(mouse), p.ap > 0)
        self.add_btn(auto, self._auto)
        y += 32
        jd = JOBS[p.job]
        for k in STAT_KEYS:
            mark = " (주)" if k == jd["main"] else " (부)" if k == jd["sub"] else ""
            bonus = s[k] - p.base[k]
            dr.text(surf, f"{k} {STAT_NAMES[k]}{mark}", (x, y), 14, YELLOW if mark == " (주)" else UI_TEXT)
            dr.text(surf, f"{s[k]}", (x + 170, y), 14, WHITE, right=True)
            if bonus:
                dr.text(surf, f"({p.base[k]}+{bonus})", (x + 176, y + 2), 11, GREEN)
            plus = pygame.Rect(x + 270, y - 2, 30, 22)
            button(surf, plus, "+1", plus.collidepoint(mouse), p.ap > 0, 12)
            self.add_btn(plus, lambda k=k: self._add(k))
            y += 28
        y += 6
        pygame.draw.line(surf, UI_LINE, (x, y), (x + 300, y))
        y += 10
        rows = [
            ("스탯 공격력", f"{s['min_dmg']:,} ~ {s['max_dmg']:,}"),
            ("공격력", f"{s['att']:,}"),
            ("최대 HP / MP", f"{s['max_hp']:,} / {s['max_mp']:,}"),
            ("방어력", f"{s['def']:,}"),
            ("크리티컬 확률", f"{s['crit']:.0f}%"),
            ("크리티컬 데미지", f"{s['critd']:.0f}%"),
            ("보스 데미지", f"{s['boss']:.0f}%"),
            ("방어율 무시", f"{s['ied']:.0f}%"),
            ("이동속도", f"{s['speed'] / 2.3:.0f}%"),
        ]
        for a, b in rows:
            dr.text(surf, a, (x, y), 13, UI_DIM)
            dr.text(surf, b, (x + 300, y), 13, WHITE, right=True)
            y += 21
        y += 6
        counts = itm.set_counts(p.equipped)
        if counts:
            dr.text(surf, "세트 효과", (x, y), 13, GREEN, bold=True)
            y += 20
            for sid, n in counts.items():
                bon = itm.set_bonus(sid, n)
                txt = ", ".join(itm.fmt_stat(k, v) for k, v in bon.items()) or "효과 없음"
                dr.text(surf, f"{SETS[sid]['name']} ({n})", (x, y), 12, GREEN)
                y += 17
                dr.text(surf, txt[:44], (x + 8, y), 11, UI_TEXT)
                y += 18

    def _add(self, k):
        if self.p.add_stat(k):
            self.game.player.hp = min(self.p.hp, self.p.max_hp)

    def _auto(self):
        self.p.auto_assign()


# ---------------------------------------------------------------------
class EquipWindow(Window):
    def __init__(self, ui):
        super().__init__(ui, "equip", "장비 (E)", (390, 70, 300, 420))

    def draw_content(self, surf, mouse, x, y):
        p = self.p
        for i, slot in enumerate(SLOT_ORDER):
            col, row = i % 2, i // 2
            r = pygame.Rect(x + col * 140, y + row * 62, 134, 56)
            it = p.equipped[slot]
            pygame.draw.rect(surf, (36, 40, 54), r, border_radius=6)
            pygame.draw.rect(surf, GRADE_COLORS[it["grade"]] if it else UI_LINE, r, 2, border_radius=6)
            dr.text(surf, SLOTS[slot]["name"], (r.x + 6, r.y + 4), 11, UI_DIM)
            if it:
                dr.text(surf, it["name"], (r.x + 6, r.y + 22), 12, GRADE_COLORS[it["grade"]] if it["grade"] else WHITE)
                if it.get("set"):
                    dr.text(surf, "세트", (r.right - 30, r.y + 4), 10, GREEN)
                if r.collidepoint(mouse):
                    self.ui.hover = ("equip", it)
                self.add_btn(r, lambda s=slot: self._unequip(s), (3,))
                self.add_btn(r, lambda it=it: self.ui.item_clicked(it), (1,))
        dr.text(surf, "우클릭: 해제", (x, self.rect.bottom - 26), 11, UI_DIM)

    def _unequip(self, slot):
        if len(self.p.inventory) >= INV_SIZE:
            self.game.msg("인벤토리가 가득 찼습니다.", ORANGE)
            return
        self.p.unequip(slot)


# ---------------------------------------------------------------------
class InventoryWindow(Window):
    TABS = [("equip", "장비"), ("use", "소비"), ("etc", "기타")]

    def __init__(self, ui):
        super().__init__(ui, "inv", "인벤토리 (I)", (860, 70, 380, 470))
        self.tab = "equip"

    def draw_content(self, surf, mouse, x, y):
        p = self.p
        for i, (k, label) in enumerate(self.TABS):
            r = pygame.Rect(x + i * 82, y, 78, 24)
            button(surf, r, label, self.tab == k)
            self.add_btn(r, lambda k=k: setattr(self, "tab", k))
        dr.text(surf, f"{p.meso:,} 메소", (self.rect.right - 14, y + 4), 13, YELLOW, right=True)
        y += 34
        if self.tab == "equip":
            for i in range(INV_SIZE):
                r = pygame.Rect(x + (i % 8) * 44, y + (i // 8) * 44, 40, 40)
                pygame.draw.rect(surf, (36, 40, 54), r, border_radius=5)
                if i < len(p.inventory):
                    it = p.inventory[i]
                    pygame.draw.rect(surf, GRADE_COLORS[it["grade"]], r, 2, border_radius=5)
                    dr.text(surf, SLOTS[it["slot"]]["name"][:2], (r.centerx, r.y + 6), 12, WHITE, center=False, shadow=True)
                    dr.text(surf, str(it["level"]), (r.right - 3, r.bottom - 16), 10, UI_DIM, right=True)
                    if r.collidepoint(mouse):
                        self.ui.hover = ("equip", it)
                    self.add_btn(r, lambda it=it: self._equip(it), (3,))
                    self.add_btn(r, lambda it=it: self.ui.item_clicked(it), (1,))
                else:
                    pygame.draw.rect(surf, UI_LINE, r, 1, border_radius=5)
            dr.text(surf, f"{len(p.inventory)}/{INV_SIZE}  우클릭: 착용", (x, self.rect.bottom - 26), 11, UI_DIM)
        else:
            bag = p.consumables if self.tab == "use" else p.etc
            for i, (iid, n) in enumerate(sorted(bag.items())):
                r = pygame.Rect(x, y + i * 30, self.rect.w - 24, 26)
                if r.collidepoint(mouse):
                    pygame.draw.rect(surf, (50, 58, 80), r, border_radius=4)
                    if self.tab == "use":
                        self.ui.hover = ("text", [CONSUMABLES[iid]["name"], CONSUMABLES[iid]["desc"]])
                pygame.draw.circle(surf, consumable_color(iid) if self.tab == "use" else (200, 180, 120), (r.x + 12, r.centery), 8)
                dr.text(surf, item_name(iid), (r.x + 28, r.y + 4), 13, WHITE)
                dr.text(surf, f"x{n}", (r.right - 8, r.y + 4), 13, UI_TEXT, right=True)
                if self.tab == "use":
                    self.add_btn(r, lambda iid=iid: self.ui.use_consumable(iid), (3,))
            hint = "우클릭: 사용 (큐브는 사용 후 장비 클릭)" if self.tab == "use" else "퀘스트 수집품"
            dr.text(surf, hint, (x, self.rect.bottom - 26), 11, UI_DIM)

    def _equip(self, it):
        msg = self.p.equip(it)
        self.game.msg(msg, WHITE if "장착" in msg else ORANGE)


# ---------------------------------------------------------------------
class SkillWindow(Window):
    def __init__(self, ui):
        super().__init__(ui, "skill", "스킬 (K)", (390, 70, 440, 470))
        self.selected = None
        self.tier = 0

    def draw_content(self, surf, mouse, x, y):
        p = self.p
        dr.text(surf, f"{p.job_title}", (x, y), 15, WHITE, bold=True)
        dr.text(surf, f"남은 SP : {p.sp}", (self.rect.right - 14, y), 15, YELLOW if p.sp else UI_DIM, right=True)
        y += 26
        skills = p.available_skills()
        if not skills:
            dr.text(surf, "10레벨에 1차 전직을 하면 스킬을 배울 수 있습니다.", (x, y + 10), 13, UI_DIM)
            dr.text(surf, "(SP는 10레벨 이후 레벨업마다 3씩 지급)", (x, y + 32), 12, UI_DIM)
            return
        if not 1 <= self.tier <= p.job_tier:
            self.tier = p.job_tier
        for t in range(1, p.job_tier + 1):
            r = pygame.Rect(x + (t - 1) * 70, y, 66, 24)
            button(surf, r, f"{t}차", self.tier == t)
            self.add_btn(r, lambda t=t: setattr(self, "tier", t))
        y += 32
        dr.text(surf, "스킬 클릭 후 A S D F G H 키로 단축키 등록", (x, y), 11, UI_DIM)
        y += 20
        skills = [s for s in skills if s["tier"] == self.tier]
        for s in sorted(skills, key=lambda s: s["type"] == "passive"):
            r = pygame.Rect(x, y, self.rect.w - 24, 40)
            lv = p.skills.get(s["id"], 0)
            sel = self.selected == s["id"]
            pygame.draw.rect(surf, (62, 72, 104) if sel else (38, 42, 58), r, border_radius=5)
            surf.blit(dr.skill_icon(s, 32), (r.x + 4, r.y + 4))
            dr.text(surf, f"{s['name']}", (r.x + 44, r.y + 3), 13, WHITE if lv else UI_DIM)
            typ = {"attack": "공격", "buff": "버프", "passive": "패시브", "heal": "회복", "move": "이동"}[s["type"]]
            dr.text(surf, f"{s['tier']}차 · {typ} · Lv {lv}/{s['max']}", (r.x + 44, r.y + 21), 11, UI_DIM)
            if s["id"] in p.quick:
                dr.text(surf, f"[{QUICK_KEYS[p.quick.index(s['id'])]}]", (r.right - 70, r.y + 11), 13, YELLOW)
            plus = pygame.Rect(r.right - 34, r.y + 8, 28, 24)
            can = p.sp > 0 and lv < s["max"]
            button(surf, plus, "+", plus.collidepoint(mouse), can)
            self.add_btn(plus, lambda sid=s["id"]: p.learn_skill(sid))
            self.add_btn(r, lambda sid=s["id"]: setattr(self, "selected", sid))
            if r.collidepoint(mouse):
                self.ui.hover = ("skill", s)
            y += 44

    def key(self, ev):
        name = pygame.key.name(ev.key).upper()
        if self.selected and name in QUICK_KEYS:
            s = SKILLS[self.selected]
            if s["type"] == "passive" or self.p.skills.get(self.selected, 0) == 0:
                self.game.msg("배운 공격/버프 스킬만 등록할 수 있습니다.", ORANGE)
                return True
            q = self.p.quick
            if self.selected in q:
                q[q.index(self.selected)] = None
            q[QUICK_KEYS.index(name)] = self.selected
            return True
        return False


# ---------------------------------------------------------------------
class QuestWindow(Window):
    def __init__(self, ui):
        super().__init__(ui, "quest", "퀘스트 (L)", (390, 70, 520, 520))
        self.tab = "active"
        self.selected = None

    def draw_content(self, surf, mouse, x, y):
        p = self.p
        for i, (k, label) in enumerate((("active", "진행 중"), ("avail", "수락 가능"), ("done", "완료"))):
            r = pygame.Rect(x + i * 90, y, 86, 24)
            button(surf, r, label, self.tab == k)
            self.add_btn(r, lambda k=k: (setattr(self, "tab", k), setattr(self, "selected", None)))
        y += 34
        if self.tab == "active":
            ids = list(p.quests_active)
        elif self.tab == "avail":
            ids = [q for q in QUESTS if qs.is_available(q, p)]
        else:
            ids = [q for q in p.quests_done if QUESTS[q]["type"] != "repeat"]
        ids.sort(key=lambda q: (QUESTS[q]["level"], q))
        list_w = 210
        for i, qid in enumerate(ids[:15]):
            q = QUESTS[qid]
            r = pygame.Rect(x, y + i * 28, list_w, 25)
            sel = self.selected == qid
            pygame.draw.rect(surf, (62, 72, 104) if sel else (38, 42, 58), r, border_radius=4)
            col = YELLOW if q["type"] == "main" else (140, 220, 255) if q["type"] == "job" else UI_TEXT
            mark = "✔ " if qs.is_ready(qid, p) else ""
            dr.text(surf, f"{mark}Lv{q['level']} {q['title']}"[:17], (r.x + 6, r.y + 4), 12, col)
            self.add_btn(r, lambda qid=qid: setattr(self, "selected", qid))
        if not ids:
            dr.text(surf, "없음", (x, y), 13, UI_DIM)
        if self.selected and self.selected in QUESTS:
            self._detail(surf, x + list_w + 14, y, self.selected)

    def _detail(self, surf, x, y, qid):
        p = self.p
        q = QUESTS[qid]
        typ = {"main": "메인", "side": "서브", "job": "전직", "repeat": "반복"}[q["type"]]
        dr.text(surf, f"[{typ}] {q['title']}", (x, y), 14, YELLOW, bold=True)
        y += 26
        giver, ender = NPCS[q["giver"]], NPCS[q["ender"]]
        dr.text(surf, f"의뢰: {giver['name']} ({MAPS[giver['map']]['name']})", (x, y), 12, UI_TEXT)
        y += 18
        dr.text(surf, f"보고: {ender['name']} ({MAPS[ender['map']]['name']})", (x, y), 12, UI_TEXT)
        y += 24
        if q["goals"]:
            dr.text(surf, "목표", (x, y), 13, GREEN, bold=True)
            y += 20
            for label, c, n in qs.goal_progress(qid, p):
                dr.text(surf, f"· {label} {c}/{n}", (x + 6, y), 12, GREEN if c >= n else WHITE)
                y += 18
        else:
            dr.text(surf, f"· {ender['name']}와(과) 대화하기", (x, y), 12, WHITE)
            y += 18
        y += 8
        dr.text(surf, "보상", (x, y), 13, YELLOW, bold=True)
        y += 20
        from .formulas import quest_exp
        r = q.get("rewards", {})
        lines = []
        if r.get("exp"):
            lines.append(f"경험치 {quest_exp(q['level'], r['exp']):,}")
        if r.get("meso"):
            lines.append(f"메소 {r['meso']:,}")
        for iid, n in r.get("items", {}).items():
            lines.append(f"{item_name(iid)} x{n}")
        for e in r.get("equip", []):
            lines.append(f"Lv{e['tier']} {SLOTS[e['slot']]['name']}")
        if r.get("job_tier"):
            lines.append(f"{r['job_tier']}차 전직")
        if qs.has_choice(qid, p):
            lines.append("직업 선택" if q["choice"].get("job") is None else "마법 계열 선택")
        for ln in lines:
            dr.text(surf, f"· {ln}", (x + 6, y), 12, UI_TEXT)
            y += 18
        if qid in p.quests_active:
            y += 10
            dr.text(surf, qs.fmt(q["progress"], p)[:26], (x, y), 12, UI_DIM)
            if q["type"] == "repeat":
                ab = pygame.Rect(x, y + 26, 90, 24)
                button(surf, ab, "포기", ab.collidepoint(pygame.mouse.get_pos()))
                self.add_btn(ab, lambda: p.quests_active.pop(qid, None))


# ---------------------------------------------------------------------
class ShopWindow(Window):
    def __init__(self, ui):
        super().__init__(ui, "shop", "상점", (420, 90, 440, 500))
        self.npc = None
        self.tab = "buy"

    def open(self, npc_id):
        self.npc = npc_id
        self.title = f"상점 - {NPCS[npc_id]['name']}"
        self.tab = "buy"

    def draw_content(self, surf, mouse, x, y):
        p = self.p
        for i, (k, label) in enumerate((("buy", "구매"), ("sell", "장비 판매"))):
            r = pygame.Rect(x + i * 100, y, 96, 24)
            button(surf, r, label, self.tab == k)
            self.add_btn(r, lambda k=k: setattr(self, "tab", k))
        dr.text(surf, f"{p.meso:,} 메소", (self.rect.right - 14, y + 4), 13, YELLOW, right=True)
        y += 34
        if self.tab == "buy":
            dr.text(surf, "좌클릭: 1개 / 우클릭: 10개 구매", (x, y), 11, UI_DIM)
            y += 20
            for cid in NPCS[self.npc].get("shop", []):
                c = CONSUMABLES[cid]
                r = pygame.Rect(x, y, self.rect.w - 24, 34)
                hot = r.collidepoint(mouse)
                pygame.draw.rect(surf, (50, 58, 80) if hot else (38, 42, 58), r, border_radius=5)
                pygame.draw.circle(surf, consumable_color(cid), (r.x + 16, r.centery), 9)
                dr.text(surf, c["name"], (r.x + 34, r.y + 2), 13, WHITE)
                dr.text(surf, c["desc"][:30], (r.x + 34, r.y + 18), 10, UI_DIM)
                dr.text(surf, f"{c['price']:,}", (r.right - 8, r.y + 8), 13, YELLOW, right=True)
                self.add_btn(r, lambda cid=cid: self._buy(cid, 1), (1,))
                self.add_btn(r, lambda cid=cid: self._buy(cid, 10), (3,))
                y += 38
        else:
            dr.text(surf, "클릭: 판매 (착용 중인 장비는 판매 불가)", (x, y), 11, UI_DIM)
            y += 20
            for i, it in enumerate(p.inventory[:12]):
                r = pygame.Rect(x, y + i * 30, self.rect.w - 24, 27)
                pygame.draw.rect(surf, (50, 58, 80) if r.collidepoint(mouse) else (38, 42, 58), r, border_radius=4)
                dr.text(surf, f"Lv{it['level']} {it['name']}", (r.x + 8, r.y + 5), 12, GRADE_COLORS[it["grade"]])
                dr.text(surf, f"{itm.sell_price(it):,}", (r.right - 8, r.y + 5), 12, YELLOW, right=True)
                if r.collidepoint(mouse):
                    self.ui.hover = ("equip", it)
                self.add_btn(r, lambda it=it: self._sell(it))

    def _buy(self, cid, n):
        price = CONSUMABLES[cid]["price"] * n
        if self.p.meso < price:
            self.game.msg("메소가 부족합니다.", ORANGE)
            return
        self.p.meso -= price
        self.p.add_item(cid, n)
        self.game.msg(f"{CONSUMABLES[cid]['name']} x{n} 구매", WHITE)

    def _sell(self, it):
        price = itm.sell_price(it)
        self.p.inventory.remove(it)
        self.p.meso += price
        self.game.msg(f"{it['name']} 판매 (+{price:,} 메소)", YELLOW)


# ---------------------------------------------------------------------
class DialogWindow(Window):
    """NPC 대화. 상태: menu / lines / accept / choice / result"""

    def __init__(self, ui):
        super().__init__(ui, "dialog", "", (190, 380, 900, 250))
        self.npc = None

    def open(self, npc_id):
        self.npc = npc_id
        self.title = NPCS[npc_id]["name"]
        self.show_menu()

    def show_menu(self):
        self.state = "menu"
        self.lines = [NPCS[self.npc]["greet"]]
        self.idx = 0

    def play(self, lines, then):
        self.state = "lines"
        self.lines = [qs.fmt(l, self.p) for l in lines]
        self.idx = 0
        self.then = then

    def advance(self):
        if self.state == "lines":
            self.idx += 1
            if self.idx >= len(self.lines):
                self.idx = len(self.lines) - 1
                self.then()
        elif self.state == "result":
            self.show_menu()

    def draw(self, surf, mouse):
        self.buttons = []
        panel(surf, self.rect, alpha=245)
        n = NPCS[self.npc]
        # 초상
        pr = pygame.Rect(self.rect.x + 14, self.rect.y + 14, 120, 150)
        pygame.draw.rect(surf, (45, 50, 70), pr, border_radius=8)
        dr.draw_npc(surf, n, pr.centerx, pr.bottom - 26, 0)
        x, y = self.rect.x + 150, self.rect.y + 16
        line = self.lines[self.idx] if self.lines else ""
        speaker = n["name"]
        if line.startswith("나:"):
            speaker, line = self.p.name, line[2:].strip()
        dr.text(surf, speaker, (x, y), 15, YELLOW if speaker == n["name"] else (140, 220, 255), bold=True)
        self._wrap(surf, line, x, y + 28, self.rect.right - x - 20)
        bx, by = x, self.rect.bottom - 44
        if self.state == "menu":
            opts = self.menu_options()
            ox, oy = x, y + 80
            for label, fn, col in opts:
                r = pygame.Rect(ox, oy, 340, 26)
                hot = r.collidepoint(mouse)
                pygame.draw.rect(surf, (60, 70, 100) if hot else (40, 45, 62), r, border_radius=5)
                dr.text(surf, label, (r.x + 10, r.y + 4), 13, col)
                self.add_btn(r, fn)
                oy += 30
                if oy > self.rect.bottom - 30:
                    oy = y + 80
                    ox += 350
        elif self.state == "lines":
            r = pygame.Rect(self.rect.right - 130, by, 110, 30)
            button(surf, r, "다음 ▶" if self.idx < len(self.lines) - 1 else "확인", r.collidepoint(mouse))
            self.add_btn(r, self.advance)
            dr.text(surf, f"{self.idx + 1}/{len(self.lines)}  (Space/Enter)", (bx, by + 8), 11, UI_DIM)
        elif self.state == "accept":
            r1 = pygame.Rect(self.rect.right - 250, by, 110, 30)
            r2 = pygame.Rect(self.rect.right - 130, by, 110, 30)
            button(surf, r1, "수락", r1.collidepoint(mouse))
            button(surf, r2, "거절", r2.collidepoint(mouse))
            self.add_btn(r1, self.on_accept)
            self.add_btn(r2, self.show_menu)
        elif self.state == "choice":
            q = QUESTS[self.qid]
            oy = y + 60
            dr.text(surf, q["choice"]["prompt"], (x, y + 52), 13, YELLOW)
            cur = self.p.branches.get(str(self.p.job_tier))
            for i, opt in enumerate(q["choice"]["options"]):
                r = pygame.Rect(x, oy + 18 + i * 30, 600, 26)
                pygame.draw.rect(surf, (60, 70, 100) if r.collidepoint(mouse) else (40, 45, 62), r, border_radius=5)
                label = opt["text"]
                if cur and opt["rewards"].get("branch") == cur:
                    label += "  ← 현재 계열 (추천)"
                dr.text(surf, label, (r.x + 10, r.y + 4), 13, WHITE)
                if r.collidepoint(mouse) and opt["rewards"].get("branch"):
                    br = JOBS["mage"]["branches"][opt["rewards"]["branch"]]
                    self.ui.hover = ("text", [br["name"] + " 계열", br["desc"]])
                self.add_btn(r, lambda i=i: self.finish(i))
        elif self.state == "result":
            yy = y + 56
            for m in self.result[:6]:
                dr.text(surf, "· " + m, (x, yy), 13, GREEN)
                yy += 20
            r = pygame.Rect(self.rect.right - 130, by, 110, 30)
            button(surf, r, "확인", r.collidepoint(mouse))
            self.add_btn(r, self.show_menu)
        close = pygame.Rect(self.rect.right - 28, self.rect.y + 6, 22, 20)
        button(surf, close, "X", close.collidepoint(mouse))
        self.add_btn(close, lambda: self.ui.close("dialog"))

    def _wrap(self, surf, s, x, y, width):
        f = font(15)
        line = ""
        for ch in s:
            if f.size(line + ch)[0] > width:
                dr.text(surf, line, (x, y), 15, WHITE)
                y += 22
                line = ""
            line += ch
        if line:
            dr.text(surf, line, (x, y), 15, WHITE)

    def menu_options(self):
        p = self.p
        ready, avail, prog = qs.npc_quests(self.npc, p)
        opts = []
        for qid in ready:
            opts.append((f"[완료] {QUESTS[qid]['title']}", lambda qid=qid: self.start_complete(qid), (120, 255, 140)))
        for qid in avail:
            opts.append((f"[퀘스트] {QUESTS[qid]['title']}", lambda qid=qid: self.start_accept(qid), YELLOW))
        for qid in prog:
            opts.append((f"[진행 중] {QUESTS[qid]['title']}", lambda qid=qid: self.play([QUESTS[qid]["progress"]], self.show_menu), UI_DIM))
        if NPCS[self.npc].get("shop"):
            opts.append(("상점 열기", self.open_shop, WHITE))
        opts.append(("대화 종료", lambda: self.ui.close("dialog"), UI_DIM))
        return opts

    def open_shop(self):
        self.ui.close("dialog")
        self.ui.shop.open(self.npc)
        self.ui.open("shop")

    def start_accept(self, qid):
        self.qid = qid
        self.play(QUESTS[qid]["start"], lambda: setattr(self, "state", "accept"))

    def on_accept(self):
        qs.accept(self.qid, self.p)
        q = QUESTS[self.qid]
        self.game.msg(f"퀘스트 수락: {q['title']}", YELLOW)
        if q["ender"] == self.npc and qs.is_ready(self.qid, self.p):
            self.start_complete(self.qid)
        else:
            self.play([q["progress"]], self.show_menu)

    def start_complete(self, qid):
        self.qid = qid
        q = QUESTS[qid]
        if qs.has_choice(qid, self.p):
            self.play(q["end"], lambda: setattr(self, "state", "choice"))
        else:
            self.play(q["end"], lambda: self.finish(None))

    def finish(self, choice):
        q = QUESTS[self.qid]
        extra = []
        if choice is not None:
            extra = [q["choice"]["options"][choice]["reply"]]
        msgs, ups = qs.complete(self.qid, self.p, choice)
        self.game.msg(f"퀘스트 완료: {q['title']}", (120, 255, 140))
        if ups:
            self.game.on_level_up(ups)
        self.game.autosave()
        self.state = "result"
        self.lines = extra if extra else [f"퀘스트 [{q['title']}] 완료!"]
        self.idx = 0
        self.result = msgs

    def key(self, ev):
        if ev.key in (pygame.K_SPACE, pygame.K_RETURN, pygame.K_KP_ENTER):
            if self.state in ("lines", "result"):
                self.advance()
            elif self.state == "accept":
                self.on_accept()
            return True
        return True  # 대화 중에는 다른 키 입력 막기


# =====================================================================
class UI:
    def __init__(self, game):
        self.game = game
        self.stat = StatWindow(self)
        self.equip = EquipWindow(self)
        self.inv = InventoryWindow(self)
        self.skill = SkillWindow(self)
        self.quest = QuestWindow(self)
        self.shop = ShopWindow(self)
        self.dialog = DialogWindow(self)
        self.windows = {w.key: w for w in (self.stat, self.equip, self.inv, self.skill, self.quest, self.shop, self.dialog)}
        self.order = []
        self.hover = None
        self.cube = None
        self.show_help = False

    # ---------- 창 관리 ----------
    def open(self, key):
        if key in self.order:
            self.order.remove(key)
        self.order.append(key)

    def close(self, key):
        if key in self.order:
            self.order.remove(key)

    def toggle(self, key):
        if key in self.order:
            self.close(key)
        else:
            self.open(key)

    @property
    def dialog_open(self):
        return "dialog" in self.order

    def talk(self, npc_id):
        self.dialog.open(npc_id)
        self.open("dialog")

    # ---------- 입력 ----------
    def handle(self, ev):
        """이벤트를 UI가 소비했으면 True."""
        if ev.type == pygame.MOUSEBUTTONDOWN:
            if ev.button == 3 and self.cube:
                self.cube = None
                self.game.msg("큐브 사용 취소", UI_DIM)
                return True
            for key in reversed(self.order):
                w = self.windows[key]
                if w.rect.collidepoint(ev.pos):
                    self.open(key)
                    w.click(ev.pos, ev.button)
                    return True
            return False
        if ev.type == pygame.MOUSEBUTTONUP:
            for w in self.windows.values():
                w.dragging = None
        if ev.type == pygame.MOUSEMOTION:
            for w in self.windows.values():
                if w.dragging:
                    w.rect.topleft = (ev.pos[0] - w.dragging[0], ev.pos[1] - w.dragging[1])
                    w.rect.clamp_ip(pygame.Rect(0, 0, SCREEN_W, SCREEN_H))
                    return True
        if ev.type == pygame.KEYDOWN:
            if self.dialog_open:
                if ev.key == pygame.K_ESCAPE:
                    self.close("dialog")
                    return True
                return self.dialog.key(ev)
            if "skill" in self.order and self.skill.key(ev):
                return True
            if ev.key == pygame.K_ESCAPE:
                if self.show_help:
                    self.show_help = False
                elif self.order:
                    self.close(self.order[-1])
                else:
                    return False
                return True
        return False

    def item_clicked(self, it):
        if not self.cube:
            return
        cid = self.cube
        if self.game.player.count_item(cid) <= 0:
            self.cube = None
            return
        self.game.player.remove_item(cid)
        old = it["grade"]
        up = itm.use_cube(it, CONSUMABLES[cid]["cube"])
        self.game.player.invalidate()
        g = it["grade"]
        if up:
            self.game.msg(f"★ 등급 상승! {GRADE_NAMES[old]} → {GRADE_NAMES[g]}", GRADE_COLORS[g])
        self.game.msg(f"[{it['name']}] 잠재능력: " + ", ".join(itm.fmt_stat(k, v) for k, v in it["pot"]), GRADE_COLORS[g])
        if self.game.player.count_item(cid) <= 0:
            self.cube = None

    def use_consumable(self, cid):
        p = self.game.player
        c = CONSUMABLES[cid]
        if p.count_item(cid) <= 0:
            return
        if "cube" in c:
            self.cube = cid
            self.game.msg(f"{c['name']}: 잠재능력을 재설정할 장비를 클릭하세요. (우클릭 취소)", (190, 140, 255))
            return
        if c.get("town"):
            p.remove_item(cid)
            self.game.world.use_town_scroll()
            return
        p.remove_item(cid)
        if c.get("hp"):
            p.hp = min(p.max_hp, p.hp + c["hp"])
        if c.get("mp"):
            p.mp = min(p.max_mp, p.mp + c["mp"])

    def quick_potion(self, kind):
        p = self.game.player
        for cid in (["hp_x", "hp_l", "hp_m", "hp_s"] if kind == "hp" else ["mp_l", "mp_m", "mp_s"]):
            if p.count_item(cid) > 0 and (p.level >= 10 or cid.endswith("_s")):
                self.use_consumable(cid)
                return
        for cid in (["hp_s", "hp_m", "hp_l", "hp_x"] if kind == "hp" else ["mp_s", "mp_m", "mp_l"]):
            if p.count_item(cid) > 0:
                self.use_consumable(cid)
                return
        self.game.msg("물약이 없습니다.", ORANGE)

    # ---------- 그리기 ----------
    def draw(self, surf):
        mouse = pygame.mouse.get_pos()
        self.hover = None
        self.draw_hud(surf, mouse)
        for key in self.order:
            self.windows[key].draw(surf, mouse)
        if self.hover:
            kind, obj = self.hover
            if kind == "equip":
                self.item_tooltip(surf, obj, mouse)
            elif kind == "skill":
                self.skill_tooltip(surf, obj, mouse)
            else:
                self.text_tooltip(surf, obj, mouse)
        if self.cube:
            dr.text(surf, "◆ 큐브 모드", (mouse[0] + 14, mouse[1] - 4), 13, (200, 150, 255), bold=True)
        if self.show_help:
            self.draw_help(surf)

    def draw_hud(self, surf, mouse):
        g = self.game
        p = g.player
        w = g.world
        # 상단: 지역/맵
        from .data import REGIONS
        dr.text(surf, f"{REGIONS[w.region]['name']} · {w.m['name']}", (14, 10), 16, WHITE, bold=True)
        dr.text(surf, "F1 도움말", (14, 32), 12, UI_DIM)
        # 퀘스트 추적
        y = 12
        dr.text(surf, "퀘스트", (SCREEN_W - 14, y), 14, YELLOW, bold=True, right=True)
        y += 22
        for qid in list(p.quests_active)[:5]:
            q = QUESTS[qid]
            ready = qs.is_ready(qid, p)
            dr.text(surf, ("✔ " if ready else "") + q["title"], (SCREEN_W - 14, y), 13, (120, 255, 140) if ready else WHITE, right=True)
            y += 18
            if ready:
                dr.text(surf, f"→ {NPCS[q['ender']]['name']}에게 보고", (SCREEN_W - 14, y), 11, UI_DIM, right=True)
                y += 16
            else:
                for label, c, n in qs.goal_progress(qid, p):
                    dr.text(surf, f"{label} {c}/{n}", (SCREEN_W - 14, y), 11, UI_DIM, right=True)
                    y += 16
        # 버프
        bx = 14
        for sid, (t, _) in p.buffs.items():
            surf.blit(dr.skill_icon(SKILLS[sid], 26), (bx, 54))
            dr.text(surf, f"{int(t)}", (bx + 13, 82), 10, WHITE, center=True)
            bx += 30
        # 메시지 로그
        g.draw_messages(surf, SCREEN_H - HUD_H - 12)
        # 하단 바
        hud = pygame.Rect(0, SCREEN_H - HUD_H, SCREEN_W, HUD_H)
        panel(surf, hud, radius=0, alpha=230)
        dr.text(surf, f"Lv.{p.level}", (16, hud.y + 8), 22, YELLOW, bold=True)
        dr.text(surf, p.name, (100, hud.y + 8), 14, WHITE, bold=True)
        dr.text(surf, p.job_title, (100, hud.y + 28), 12, UI_TEXT)
        bar(surf, pygame.Rect(230, hud.y + 10, 220, 18), p.hp / p.max_hp, (220, 60, 60), f"HP {max(0, p.hp):,}/{p.max_hp:,}")
        bar(surf, pygame.Rect(230, hud.y + 32, 220, 18), p.mp / p.max_mp, (60, 110, 230), f"MP {p.mp:,}/{p.max_mp:,}")
        need = p.exp_need
        ratio = p.exp / need if need else 1
        bar(surf, pygame.Rect(0, SCREEN_H - 10, SCREEN_W, 10), ratio, (230, 200, 60))
        dr.text(surf, f"EXP {ratio * 100:.2f}%" if need else "MAX", (230, hud.y + 54), 11, (240, 220, 120))
        # 알림 배지
        nx = 16
        if p.ap:
            r = pygame.Rect(nx, hud.y + 42, 72, 20)
            pygame.draw.rect(surf, (200, 150, 30), r, border_radius=5)
            dr.text(surf, f"AP {p.ap} (C)", r.center, 11, WHITE, center=True)
            nx += 78
        if p.sp:
            r = pygame.Rect(nx, hud.y + 42, 72, 20) if nx < 100 else pygame.Rect(100, hud.y + 48, 72, 20)
            pygame.draw.rect(surf, (60, 130, 200), r, border_radius=5)
            dr.text(surf, f"SP {p.sp} (K)", r.center, 11, WHITE, center=True)
        # 단축키
        qx = 480
        for i, k in enumerate(QUICK_KEYS):
            r = pygame.Rect(qx + i * 50, hud.y + 12, 44, 44)
            pygame.draw.rect(surf, (36, 40, 54), r, border_radius=6)
            pygame.draw.rect(surf, UI_LINE, r, 1, border_radius=6)
            sid = p.quick[i]
            if sid:
                s = SKILLS[sid]
                surf.blit(dr.skill_icon(s, 36), (r.x + 4, r.y + 4))
                cd = p.cooldowns.get(sid, 0)
                if cd > 0:
                    sh = pygame.Surface((36, 36), pygame.SRCALPHA)
                    sh.fill((0, 0, 0, 150))
                    surf.blit(sh, (r.x + 4, r.y + 4))
                    dr.text(surf, f"{cd:.0f}", r.center, 14, WHITE, center=True)
                if r.collidepoint(mouse):
                    self.hover = ("skill", s)
            dr.text(surf, k, (r.x + 3, r.y + 1), 11, YELLOW)
        # 물약
        px = qx + 6 * 50 + 14
        for i, (k, kind, col) in enumerate((("Q", "hp", (220, 70, 70)), ("W", "mp", (70, 120, 230)))):
            r = pygame.Rect(px + i * 50, hud.y + 12, 44, 44)
            pygame.draw.rect(surf, (36, 40, 54), r, border_radius=6)
            pygame.draw.circle(surf, col, r.center, 12)
            cnt = sum(n for c, n in p.consumables.items() if c.startswith(kind))
            dr.text(surf, str(cnt), (r.right - 3, r.bottom - 16), 11, WHITE, right=True)
            dr.text(surf, k, (r.x + 3, r.y + 1), 11, YELLOW)
        # 메뉴 버튼
        mx = px + 110
        for i, (label, key) in enumerate((("능력치 C", "stat"), ("장비 E", "equip"), ("인벤 I", "inv"), ("스킬 K", "skill"), ("퀘스트 L", "quest"))):
            r = pygame.Rect(mx + (i % 3) * 78, hud.y + 8 + (i // 3) * 32, 74, 28)
            button(surf, r, label, r.collidepoint(mouse), size=12)
        self.hud_buttons = [(pygame.Rect(mx + (i % 3) * 78, hud.y + 8 + (i // 3) * 32, 74, 28), key)
                            for i, key in enumerate(("stat", "equip", "inv", "skill", "quest"))]

    def hud_click(self, pos):
        for r, key in getattr(self, "hud_buttons", []):
            if r.collidepoint(pos):
                self.toggle(key)
                return True
        return pos[1] >= SCREEN_H - HUD_H

    def _tip_box(self, surf, lines, mouse):
        """lines: [(text, color, size)]"""
        w = max(font(sz).size(t)[0] for t, _, sz in lines) + 24
        h = sum(sz + 6 for _, _, sz in lines) + 16
        x, y = mouse[0] + 18, mouse[1] + 12
        if x + w > SCREEN_W:
            x = mouse[0] - w - 10
        if y + h > SCREEN_H:
            y = SCREEN_H - h - 4
        panel(surf, pygame.Rect(x, y, w, h), (16, 18, 26), alpha=245)
        yy = y + 8
        for t, c, sz in lines:
            dr.text(surf, t, (x + 12, yy), sz, c)
            yy += sz + 6

    def item_tooltip(self, surf, it, mouse):
        p = self.game.player
        g = it["grade"]
        L = [(it["name"], GRADE_COLORS[g] if g else WHITE, 16)]
        if g:
            L.append((f"({GRADE_NAMES[g]} 아이템)", GRADE_COLORS[g], 12))
        req_col = WHITE if p.level >= it["level"] else RED
        L.append((f"착용 레벨 {it['level']}  ·  {SLOTS[it['slot']]['name']}", req_col, 12))
        if it.get("job") and it["job"] != "beginner":
            L.append((f"{JOBS[it['job']]['names'][1]} 계열 전용", WHITE if it["job"] == p.job else RED, 12))
        L.append(("── 기본 능력치 ──", UI_DIM, 11))
        for k, v in it["base"].items():
            L.append((itm.fmt_stat(k, v), WHITE, 13))
        if it["add"]:
            L.append(("── 추가 옵션 ──", (120, 230, 120), 11))
            for k, v in it["add"]:
                L.append((itm.fmt_stat(k, v), (120, 230, 120), 13))
        if g:
            L.append((f"── 잠재능력 : {GRADE_NAMES[g]} ──", GRADE_COLORS[g], 11))
            for k, v in it["pot"]:
                L.append((itm.fmt_stat(k, v), GRADE_COLORS[g], 13))
        else:
            L.append(("잠재능력 없음 (큐브로 부여 가능)", UI_DIM, 11))
        if it.get("set"):
            sid = it["set"]
            n = itm.set_counts(p.equipped).get(sid, 0)
            L.append((f"── {SETS[sid]['name']} ({n}세트 착용 중) ──", GREEN, 11))
            for need, st in SETS[sid]["bonus"].items():
                active = n >= int(need)
                L.append((f"{need}세트: " + ", ".join(itm.fmt_stat(k, v) for k, v in st.items()), GREEN if active else UI_DIM, 12))
        if self.cube:
            L.append(("클릭하여 큐브 사용", (200, 150, 255), 12))
        self._tip_box(surf, L, mouse)

    def skill_tooltip(self, surf, s, mouse):
        p = self.game.player
        lv = p.skills.get(s["id"], 0)
        L = [(s["name"], YELLOW, 16), (f"{s['tier']}차 스킬 · 마스터 레벨 {s['max']}", UI_DIM, 12), (s["desc"], WHITE, 13)]

        def lv_val(pair, level):
            return pair[0] + pair[1] * (level - 1)

        def info(level):
            mp = int(s["mp"][0] + s["mp"][1] * level) if "mp" in s else 0
            if s["type"] == "move":
                return f"MP {mp} 소비, {lv_val(s['dash'], level):.0f}px 순간 이동"
            if s["type"] in ("attack", "heal"):
                d = lv_val(s["dmg"], level)
                t = f"MP {mp} 소비, 최대 {s['targets']}명 {d:.0f}% 데미지 {s['hits']}회"
                if s["type"] == "heal":
                    t = f"HP {lv_val(s['heal'], level):.0f}% 회복, " + t
                if s.get("dot"):
                    dt = s["dot"]
                    ch = lv_val(dt["chance"], level)
                    t += f", {'' if ch >= 100 else f'{ch:.0f}% 확률로 '}{dt['dur']}초간 매초 {lv_val(dt['pct'], level):.0f}% 지속 피해"
                if s.get("stun"):
                    t += f", {lv_val(s['stun']['chance'], level):.0f}% 확률로 {s['stun']['dur']}초 기절"
                if s.get("slow"):
                    t += f", {s['slow']}초 둔화"
                if s.get("spirit_bonus"):
                    t += ", 영혼형 적 2배"
                if s.get("cd"):
                    t += f", 재사용 {s['cd']}초"
                return t
            stats = ", ".join(itm.fmt_stat(k, round(b + per * (level - 1), 1)) for k, (b, per) in s["stats"].items())
            if s["type"] == "buff":
                mp = int(s["mp"][0] + s["mp"][1] * level)
                return f"MP {mp} 소비, {s['dur']}초간 {stats}"
            return stats

        if lv:
            L.append((f"[현재 Lv {lv}] {info(lv)}", GREEN, 12))
        if lv < s["max"]:
            L.append((f"[다음 Lv {lv + 1}] {info(lv + 1)}", (170, 200, 255), 12))
        self._tip_box(surf, L, mouse)

    def text_tooltip(self, surf, lines, mouse):
        self._tip_box(surf, [(lines[0], YELLOW, 14)] + [(l, WHITE, 12) for l in lines[1:]], mouse)

    def draw_help(self, surf):
        r = pygame.Rect(SCREEN_W / 2 - 330, 70, 660, 520)
        panel(surf, r, alpha=248)
        lines = [
            ("조작법", YELLOW, 20),
            ("← → : 이동     Space : 점프     ↓ + Space : 아래 발판으로 내려가기", WHITE, 14),
            ("Z : 기본 공격 (누르고 있으면 연속)     A S D F G H : 스킬 단축키", WHITE, 14),
            ("Q / W : HP / MP 물약     ↑ : 포탈 이동", WHITE, 14),
            ("X 또는 NPC 클릭 : 대화     Esc : 창 닫기", WHITE, 14),
            ("C 능력치  E 장비  I 인벤토리  K 스킬  L 퀘스트  F5 저장", WHITE, 14),
            ("", WHITE, 8),
            ("성장 시스템", YELLOW, 20),
            ("· 레벨업마다 AP 5 지급. 능력치 창에서 +1씩 원하는 스탯에 투자합니다.", WHITE, 14),
            ("· 분배하지 않은 AP는 계속 누적됩니다.", WHITE, 14),
            ("· 경험치는 퀘스트 보상이 대부분입니다. 낮은 레벨 몬스터는 경험치가 줄어듭니다.", WHITE, 14),
            ("· 10레벨 1차, 30레벨 2차, 60레벨 3차, 90레벨 4차 전직 (최대 레벨 100)", WHITE, 14),
            ("", WHITE, 8),
            ("장비 시스템", YELLOW, 20),
            ("· 장비에는 랜덤 추가 옵션(1~4줄)과 잠재능력(레어~레전드리)이 붙습니다.", WHITE, 14),
            ("· 큐브: 소비 탭에서 우클릭 → 장비 클릭으로 잠재능력 재설정 (등급 상승 가능)", WHITE, 14),
            ("· 같은 세트 장비를 여러 개 착용하면 세트 효과가 발동합니다.", WHITE, 14),
            ("· NPC 머리 위 ! = 새 퀘스트, ? = 완료 가능", WHITE, 14),
        ]
        y = r.y + 18
        for t, c, sz in lines:
            dr.text(surf, t, (r.x + 24, y), sz, c, bold=sz >= 20)
            y += sz + 9
        dr.text(surf, "F1 또는 Esc로 닫기", (r.right - 20, r.bottom - 28), 12, UI_DIM, right=True)
