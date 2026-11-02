import tkinter as tk


WIDTH = 800
HEIGHT = 600
BALL_RADIUS = 8
PADDLE_WIDTH = 112
PADDLE_HEIGHT = 14
BRICK_ROWS = 6
BRICK_COLUMNS = 10
BRICK_WIDTH = 66
BRICK_HEIGHT = 22
BRICK_GAP = 7


class Breakout:
    def __init__(self, root):
        self.root = root
        self.root.title("블럭깨기")
        self.root.resizable(False, False)
        self.root.configure(bg="#101820")

        self.canvas = tk.Canvas(
            root,
            width=WIDTH,
            height=HEIGHT,
            bg="#101820",
            highlightthickness=0,
        )
        self.canvas.pack()

        self.paddle_y = HEIGHT - 48
        self.paddle_x = WIDTH / 2
        self.ball_x = self.paddle_x
        self.ball_y = self.paddle_y - BALL_RADIUS - 2
        self.ball_dx = 4.2
        self.ball_dy = -4.8
        self.score = 0
        self.lives = 3
        self.level = 1
        self.state = "ready"
        self.bricks = {}
        self.keys_down = set()

        self._draw_scene()
        self._bind_controls()
        self._reset_bricks()
        self._draw_status()
        self._draw_overlay("블럭깨기", "스페이스 또는 클릭으로 시작")
        self._tick()

    def _draw_scene(self):
        self.canvas.create_rectangle(0, 0, WIDTH, 66, fill="#172630", outline="")
        self.canvas.create_line(0, 66, WIDTH, 66, fill="#344955", width=2)
        self.score_text = self.canvas.create_text(
            24, 34, anchor="w", fill="#f4f1de", font=("맑은 고딕", 13, "bold")
        )
        self.level_text = self.canvas.create_text(
            WIDTH / 2,
            34,
            fill="#f4f1de",
            font=("맑은 고딕", 13, "bold"),
        )
        self.lives_text = self.canvas.create_text(
            WIDTH - 24,
            34,
            anchor="e",
            fill="#f4f1de",
            font=("맑은 고딕", 13, "bold"),
        )
        self.paddle = self.canvas.create_rectangle(0, 0, 0, 0, fill="#48bfe3", outline="")
        self.ball = self.canvas.create_oval(0, 0, 0, 0, fill="#f4f1de", outline="")
        self.overlay_items = []
        self._place_paddle_and_ball()

    def _bind_controls(self):
        self.root.bind("<KeyPress>", self._key_down)
        self.root.bind("<KeyRelease>", self._key_up)
        self.canvas.bind("<Motion>", self._mouse_move)
        self.canvas.bind("<Button-1>", self._start_or_resume)
        self.root.focus_set()

    def _reset_bricks(self):
        for brick in self.bricks.values():
            self.canvas.delete(brick)
        self.bricks.clear()

        total_width = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP
        start_x = (WIDTH - total_width) / 2
        colors = ("#ff6b6b", "#f4a261", "#e9c46a", "#70c1b3", "#5fa8d3", "#9b8de5")
        for row in range(BRICK_ROWS):
            for column in range(BRICK_COLUMNS):
                x1 = start_x + column * (BRICK_WIDTH + BRICK_GAP)
                y1 = 96 + row * (BRICK_HEIGHT + BRICK_GAP)
                brick = self.canvas.create_rectangle(
                    x1,
                    y1,
                    x1 + BRICK_WIDTH,
                    y1 + BRICK_HEIGHT,
                    fill=colors[row],
                    outline="",
                )
                self.bricks[brick] = (row, column)

    def _draw_status(self):
        self.canvas.itemconfigure(self.score_text, text=f"점수  {self.score}")
        self.canvas.itemconfigure(self.level_text, text=f"LEVEL  {self.level}")
        self.canvas.itemconfigure(self.lives_text, text=f"목숨  {self.lives}")

    def _place_paddle_and_ball(self):
        half_width = PADDLE_WIDTH / 2
        self.paddle_x = max(half_width, min(WIDTH - half_width, self.paddle_x))
        self.canvas.coords(
            self.paddle,
            self.paddle_x - half_width,
            self.paddle_y,
            self.paddle_x + half_width,
            self.paddle_y + PADDLE_HEIGHT,
        )
        if self.state == "ready":
            self.ball_x = self.paddle_x
            self.ball_y = self.paddle_y - BALL_RADIUS - 2
        self.canvas.coords(
            self.ball,
            self.ball_x - BALL_RADIUS,
            self.ball_y - BALL_RADIUS,
            self.ball_x + BALL_RADIUS,
            self.ball_y + BALL_RADIUS,
        )

    def _draw_overlay(self, title, subtitle):
        self._clear_overlay()
        panel_width = 460
        panel_height = 142
        left = (WIDTH - panel_width) / 2
        top = (HEIGHT - panel_height) / 2
        self.overlay_items = [
            self.canvas.create_rectangle(
                left,
                top,
                left + panel_width,
                top + panel_height,
                fill="#172630",
                outline="#48bfe3",
                width=2,
            ),
            self.canvas.create_text(
                WIDTH / 2,
                top + 50,
                text=title,
                fill="#f4f1de",
                font=("맑은 고딕", 25, "bold"),
            ),
            self.canvas.create_text(
                WIDTH / 2,
                top + 100,
                text=subtitle,
                fill="#a9c2cc",
                font=("맑은 고딕", 12),
            ),
        ]

    def _clear_overlay(self):
        for item in self.overlay_items:
            self.canvas.delete(item)
        self.overlay_items.clear()

    def _key_down(self, event):
        key = event.keysym.lower()
        self.keys_down.add(key)
        if key in ("space", "return"):
            self._start_or_resume()
        elif key == "p":
            self._toggle_pause()
        elif key == "r":
            self._restart()

    def _key_up(self, event):
        self.keys_down.discard(event.keysym.lower())

    def _mouse_move(self, event):
        self.paddle_x = event.x
        self._place_paddle_and_ball()

    def _start_or_resume(self, _event=None):
        if self.state in ("ready", "paused"):
            self.state = "running"
            self._clear_overlay()

    def _toggle_pause(self):
        if self.state == "running":
            self.state = "paused"
            self._draw_overlay("일시정지", "스페이스로 계속하기   ·   R로 다시 시작")
        elif self.state == "paused":
            self._start_or_resume()

    def _restart(self):
        self.score = 0
        self.lives = 3
        self.level = 1
        self.state = "ready"
        self.ball_dx = 4.2
        self.ball_dy = -4.8
        self._reset_bricks()
        self._draw_status()
        self._draw_overlay("블럭깨기", "스페이스 또는 클릭으로 시작")
        self._place_paddle_and_ball()

    def _move_paddle(self):
        speed = 7
        if "left" in self.keys_down or "a" in self.keys_down:
            self.paddle_x -= speed
        if "right" in self.keys_down or "d" in self.keys_down:
            self.paddle_x += speed

    def _move_ball(self):
        previous_x = self.ball_x
        previous_y = self.ball_y
        self.ball_x += self.ball_dx
        self.ball_y += self.ball_dy

        if self.ball_x - BALL_RADIUS <= 0 or self.ball_x + BALL_RADIUS >= WIDTH:
            self.ball_dx *= -1
            self.ball_x = max(BALL_RADIUS, min(WIDTH - BALL_RADIUS, self.ball_x))
        if self.ball_y - BALL_RADIUS <= 72:
            self.ball_dy = abs(self.ball_dy)
            self.ball_y = 72 + BALL_RADIUS

        paddle_left = self.paddle_x - PADDLE_WIDTH / 2
        paddle_right = self.paddle_x + PADDLE_WIDTH / 2
        if (
            self.ball_dy > 0
            and previous_y + BALL_RADIUS <= self.paddle_y
            and self.ball_y + BALL_RADIUS >= self.paddle_y
            and paddle_left - BALL_RADIUS <= self.ball_x <= paddle_right + BALL_RADIUS
        ):
            offset = (self.ball_x - self.paddle_x) / (PADDLE_WIDTH / 2)
            self.ball_dx = offset * 6.2
            self.ball_dy = -max(4.0, 6.4 - abs(self.ball_dx) * 0.35)
            self.ball_y = self.paddle_y - BALL_RADIUS

        self._hit_brick(previous_x, previous_y)

        if self.ball_y - BALL_RADIUS > HEIGHT:
            self.lives -= 1
            self._draw_status()
            if self.lives <= 0:
                self.state = "gameover"
                self._draw_overlay("게임 종료", f"최종 점수  {self.score}   ·   R로 다시 시작")
            else:
                self.state = "ready"
                self.ball_dx = 4.2
                self.ball_dy = -4.8
                self._draw_overlay("공을 놓쳤어요", "스페이스 또는 클릭으로 다시 시작")

        self.canvas.coords(
            self.ball,
            self.ball_x - BALL_RADIUS,
            self.ball_y - BALL_RADIUS,
            self.ball_x + BALL_RADIUS,
            self.ball_y + BALL_RADIUS,
        )

    def _hit_brick(self, previous_x, previous_y):
        for brick, (row, _column) in tuple(self.bricks.items()):
            x1, y1, x2, y2 = self.canvas.coords(brick)
            nearest_x = max(x1, min(self.ball_x, x2))
            nearest_y = max(y1, min(self.ball_y, y2))
            distance_x = self.ball_x - nearest_x
            distance_y = self.ball_y - nearest_y
            if distance_x * distance_x + distance_y * distance_y > BALL_RADIUS**2:
                continue

            if previous_y + BALL_RADIUS <= y1 or previous_y - BALL_RADIUS >= y2:
                self.ball_dy *= -1
            elif previous_x + BALL_RADIUS <= x1 or previous_x - BALL_RADIUS >= x2:
                self.ball_dx *= -1
            elif abs(distance_x) > abs(distance_y):
                self.ball_dx *= -1
            else:
                self.ball_dy *= -1

            self.canvas.delete(brick)
            del self.bricks[brick]
            self.score += (BRICK_ROWS - row) * 10
            self._draw_status()
            break

        if not self.bricks:
            self.level += 1
            self.state = "ready"
            self.ball_dx = 4.2 + min(self.level - 1, 4) * 0.35
            self.ball_dy = -(4.8 + min(self.level - 1, 4) * 0.35)
            self._reset_bricks()
            self._draw_status()
            self._draw_overlay("레벨 클리어", "스페이스 또는 클릭으로 다음 레벨")

    def _tick(self):
        if self.state == "running":
            self._move_paddle()
            self._move_ball()
        self._place_paddle_and_ball()
        self.root.after(16, self._tick)


def main():
    root = tk.Tk()
    Breakout(root)
    root.mainloop()


if __name__ == "__main__":
    main()