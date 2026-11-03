"""별잎 연대기 (Starleaf Chronicle) - 퀘스트 중심 2D 횡스크롤 RPG.

실행: python main.py
"""
import os
import sys
import time

import pygame

from game.config import SCREEN_W, SCREEN_H, FPS, TITLE, WHITE, YELLOW, UI_DIM, UI_TEXT, ASSET_DIR, font
from game.player import Player, QUICK_KEYS
from game.world import World
from game.ui import UI, panel, button
from game import draw as dr
from game import save as sv


class Game:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption(TITLE)
        icon = os.path.join(ASSET_DIR, "icon.png")
        if os.path.exists(icon):
            pygame.display.set_icon(pygame.image.load(icon))
        self.screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
        self.clock = pygame.time.Clock()
        self.player = None
        self.world = None
        self.ui = None
        self.messages = []
        self.toast_text, self.toast_t = "", 0.0
        self.levelup_t = 0.0

    # ---------- 공용 API (월드/UI에서 호출) ----------
    def msg(self, text, color=WHITE):
        self.messages.append([text, color, time.time()])
        self.messages = self.messages[-40:]

    def toast(self, text):
        self.toast_text, self.toast_t = text, 2.5

    def on_level_up(self, ups):
        p = self.player
        self.levelup_t = 2.0
        self.msg(f"레벨 업! Lv.{p.level}  (AP +{ups * 5}, 누적 AP {p.ap})", YELLOW)
        if p.sp:
            self.msg(f"SP {p.sp} 보유 - 스킬 창(K)에서 투자하세요.", (140, 200, 255))
        self.autosave()

    def autosave(self):
        if self.player and self.world:
            self.player.x = self.world.px
            sv.save(self.player)

    def draw_messages(self, surf, bottom):
        now = time.time()
        y = bottom
        for text, color, t in reversed(self.messages[-7:]):
            age = now - t
            if age > 8:
                continue
            img = font(13).render(text, True, color)
            img.set_alpha(int(255 * min(1, (8 - age) / 2)))
            y -= 19
            bg = pygame.Surface((img.get_width() + 12, 18), pygame.SRCALPHA)
            bg.fill((0, 0, 0, 110))
            surf.blit(bg, (8, y))
            surf.blit(img, (14, y + 1))

    # ---------- 타이틀 ----------
    def title_screen(self):
        has_save = sv.exists()
        name = ""
        mode = "menu"
        pygame.key.start_text_input()
        t = 0
        while True:
            dt = self.clock.tick(FPS) / 1000
            t += dt
            mouse = pygame.mouse.get_pos()
            b_new = pygame.Rect(SCREEN_W / 2 - 120, 380, 240, 46)
            b_load = pygame.Rect(SCREEN_W / 2 - 120, 440, 240, 46)
            b_ok = pygame.Rect(SCREEN_W / 2 - 120, 470, 240, 46)
            for ev in pygame.event.get():
                if ev.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if mode == "menu" and ev.type == pygame.MOUSEBUTTONDOWN and ev.button == 1:
                    if b_new.collidepoint(ev.pos):
                        mode = "name"
                    elif has_save and b_load.collidepoint(ev.pos):
                        return sv.load()
                elif mode == "name":
                    if ev.type == pygame.TEXTINPUT and len(name) < 10:
                        name += ev.text
                    elif ev.type == pygame.KEYDOWN:
                        if ev.key == pygame.K_BACKSPACE:
                            name = name[:-1]
                        elif ev.key in (pygame.K_RETURN, pygame.K_KP_ENTER) and name.strip():
                            return self.new_player(name.strip())
                        elif ev.key == pygame.K_ESCAPE:
                            mode = "menu"
                    elif ev.type == pygame.MOUSEBUTTONDOWN and b_ok.collidepoint(ev.pos) and name.strip():
                        return self.new_player(name.strip())
            self.draw_title_bg(t)
            if mode == "menu":
                button(self.screen, b_new, "새 게임", b_new.collidepoint(mouse), size=18)
                button(self.screen, b_load, "이어하기" if has_save else "저장 없음", b_load.collidepoint(mouse), has_save, size=18)
            else:
                box = pygame.Rect(SCREEN_W / 2 - 200, 340, 400, 200)
                panel(self.screen, box)
                dr.text(self.screen, "모험가의 이름을 입력하세요", (SCREEN_W / 2, 360), 16, YELLOW, center=True)
                field = pygame.Rect(SCREEN_W / 2 - 150, 400, 300, 40)
                pygame.draw.rect(self.screen, (20, 22, 30), field, border_radius=6)
                cursor = "|" if int(t * 2) % 2 == 0 else ""
                dr.text(self.screen, name + cursor, field.center, 18, WHITE, center=True)
                button(self.screen, b_ok, "모험 시작 (Enter)", b_ok.collidepoint(mouse), bool(name.strip()), size=16)
            pygame.display.flip()

    def draw_title_bg(self, t):
        s = self.screen
        for y in range(0, SCREEN_H, 4):
            k = y / SCREEN_H
            s.fill((int(30 + 60 * k), int(40 + 90 * k), int(90 + 110 * k)), (0, y, SCREEN_W, 4))
        import math
        for i in range(60):
            x = (i * 211) % SCREEN_W
            y = (i * 97) % 320
            a = 0.5 + 0.5 * math.sin(t * 2 + i)
            pygame.draw.circle(s, (255, 255, int(180 + 70 * a)), (x, y), 1 + int(a * 2))
        # 세계수
        pygame.draw.rect(s, (90, 60, 40), (SCREEN_W / 2 - 18, 200, 36, 200))
        for r, col in ((150, (60, 140, 90)), (110, (90, 180, 110)), (70, (140, 220, 140))):
            pygame.draw.circle(s, col, (SCREEN_W // 2, 190), r)
        pygame.draw.circle(s, (255, 240, 150), (SCREEN_W // 2, 190), 14 + int(4 * math.sin(t * 3)))
        dr.text(s, "별잎 연대기", (SCREEN_W / 2, 60), 54, (255, 240, 170), bold=True, center=True)
        dr.text(s, "Starleaf Chronicle", (SCREEN_W / 2, 110), 20, UI_TEXT, center=True)
        pygame.draw.rect(s, (60, 110, 70), (0, 600, SCREEN_W, 120))
        dr.text(s, "퀘스트 중심 횡스크롤 RPG · 최대 레벨 100", (SCREEN_W / 2, 650), 14, UI_DIM, center=True)

    def new_player(self, name):
        p = Player(name)
        self.msg(f"{name}, 새벽섬에 오신 것을 환영합니다! 소녀 미라에게 말을 걸어 보세요. (F1 도움말)", YELLOW)
        return p

    # ---------- 메인 루프 ----------
    def run(self):
        self.player = self.title_screen()
        pygame.key.stop_text_input()
        self.ui = UI(self)
        self.world = World(self, self.player)
        if self.player.level == 1 and not self.player.quests_done:
            self.ui.show_help = True
        while True:
            dt = min(0.05, self.clock.tick(FPS) / 1000)
            for ev in pygame.event.get():
                if ev.type == pygame.QUIT:
                    self.autosave()
                    pygame.quit()
                    sys.exit()
                self.handle(ev)
            keys = pygame.key.get_pressed()
            input_ok = not self.ui.dialog_open and not self.ui.show_help
            self.world.update(dt, keys, input_ok)
            self.toast_t = max(0, self.toast_t - dt)
            self.levelup_t = max(0, self.levelup_t - dt)
            self.draw()

    def handle(self, ev):
        ui, w = self.ui, self.world
        if ev.type == pygame.KEYDOWN and ev.key == pygame.K_F1:
            ui.show_help = not ui.show_help
            return
        if ui.handle(ev):
            return
        if ui.show_help:
            if ev.type in (pygame.KEYDOWN, pygame.MOUSEBUTTONDOWN):
                ui.show_help = False
            return
        if ev.type == pygame.MOUSEBUTTONDOWN and ev.button == 1:
            if ui.hud_click(ev.pos):
                return
            nid = w.npc_at(ev.pos)
            if nid:
                ui.talk(nid)
            return
        if ev.type != pygame.KEYDOWN:
            return
        k = ev.key
        keys = pygame.key.get_pressed()
        if k in (pygame.K_SPACE, pygame.K_LALT, pygame.K_RALT):
            w.jump(down=keys[pygame.K_DOWN])
        elif k == pygame.K_UP:
            w.try_portal()
        elif k == pygame.K_x:
            nid = w.nearest_npc()
            if nid:
                ui.talk(nid)
        elif k == pygame.K_q:
            ui.quick_potion("hp")
        elif k == pygame.K_w:
            ui.quick_potion("mp")
        elif k == pygame.K_c:
            ui.toggle("stat")
        elif k == pygame.K_e:
            ui.toggle("equip")
        elif k == pygame.K_i:
            ui.toggle("inv")
        elif k == pygame.K_k:
            ui.toggle("skill")
        elif k == pygame.K_l:
            ui.toggle("quest")
        elif k == pygame.K_F5:
            self.autosave()
            self.msg("저장했습니다.", (140, 220, 255))
        else:
            name = pygame.key.name(k).upper()
            if name in QUICK_KEYS:
                sid = self.player.quick[QUICK_KEYS.index(name)]
                if sid:
                    w.use_skill(sid)

    def draw(self):
        s = self.screen
        self.world.draw(s)
        if self.levelup_t > 0:
            a = min(1, self.levelup_t)
            img = font(40, True).render("LEVEL UP!", True, (255, 230, 90))
            img.set_alpha(int(255 * a))
            sx = self.world.px - self.world.cam_x
            s.blit(img, img.get_rect(center=(sx, self.world.py - 120 - (2 - self.levelup_t) * 20)))
        if self.toast_t > 0:
            img = font(26, True).render(self.toast_text, True, WHITE)
            img.set_alpha(int(255 * min(1, self.toast_t)))
            s.blit(img, img.get_rect(center=(SCREEN_W / 2, 120)))
        self.ui.draw(s)
        pygame.display.flip()


if __name__ == "__main__":
    Game().run()
