"""뱀 게임 (tkinter 사용 - 추가 설치 불필요)

조작: 방향키 또는 WASD로 이동, 스페이스로 일시정지, R로 재시작
"""
import random
import tkinter as tk

CELL = 20          # 한 칸 크기(px)
COLS, ROWS = 30, 20
SPEED = 100        # 프레임 간격(ms), 작을수록 빠름

BG = "#1e1e1e"
SNAKE_HEAD = "#7CFC00"
SNAKE_BODY = "#32CD32"
FOOD = "#FF4500"
TEXT = "#FFFFFF"

DIRECTIONS = {
    "Up": (0, -1), "w": (0, -1),
    "Down": (0, 1), "s": (0, 1),
    "Left": (-1, 0), "a": (-1, 0),
    "Right": (1, 0), "d": (1, 0),
}


class SnakeGame:
    def __init__(self, root):
        self.root = root
        root.title("Snake")
        root.resizable(False, False)

        self.canvas = tk.Canvas(
            root, width=COLS * CELL, height=ROWS * CELL,
            bg=BG, highlightthickness=0,
        )
        self.canvas.pack()
        root.bind("<Key>", self.on_key)

        self.after_id = None
        self.reset()

    def reset(self):
        if self.after_id:
            self.root.after_cancel(self.after_id)
        cx, cy = COLS // 2, ROWS // 2
        self.snake = [(cx, cy), (cx - 1, cy), (cx - 2, cy)]
        self.direction = (1, 0)
        self.next_direction = self.direction
        self.score = 0
        self.paused = False
        self.game_over = False
        self.food = self.spawn_food()
        self.tick()

    def spawn_food(self):
        free = [(x, y) for x in range(COLS) for y in range(ROWS)
                if (x, y) not in self.snake]
        return random.choice(free) if free else None

    def on_key(self, event):
        key = event.keysym
        if key in ("r", "R"):
            self.reset()
            return
        if key == "space" and not self.game_over:
            self.paused = not self.paused
            self.draw()
            return
        new_dir = DIRECTIONS.get(key) or DIRECTIONS.get(key.lower())
        if new_dir:
            # 반대 방향으로는 바로 돌 수 없음
            if (new_dir[0] + self.direction[0], new_dir[1] + self.direction[1]) != (0, 0):
                self.next_direction = new_dir

    def tick(self):
        if not self.paused and not self.game_over:
            self.step()
        self.draw()
        if not self.game_over:
            self.after_id = self.root.after(SPEED, self.tick)

    def step(self):
        self.direction = self.next_direction
        hx, hy = self.snake[0]
        head = (hx + self.direction[0], hy + self.direction[1])

        # 벽 또는 자기 몸에 부딪히면 게임 오버 (꼬리는 이번에 이동하므로 제외)
        hit_wall = not (0 <= head[0] < COLS and 0 <= head[1] < ROWS)
        if hit_wall or head in self.snake[:-1]:
            self.game_over = True
            return

        self.snake.insert(0, head)
        if head == self.food:
            self.score += 10
            self.food = self.spawn_food()
            if self.food is None:  # 판을 가득 채움
                self.game_over = True
        else:
            self.snake.pop()

    def draw(self):
        c = self.canvas
        c.delete("all")

        if self.food:
            fx, fy = self.food
            c.create_oval(fx * CELL + 2, fy * CELL + 2,
                          (fx + 1) * CELL - 2, (fy + 1) * CELL - 2,
                          fill=FOOD, outline="")

        for i, (x, y) in enumerate(self.snake):
            c.create_rectangle(x * CELL + 1, y * CELL + 1,
                               (x + 1) * CELL - 1, (y + 1) * CELL - 1,
                               fill=SNAKE_HEAD if i == 0 else SNAKE_BODY,
                               outline="")

        c.create_text(8, 8, anchor="nw", fill=TEXT,
                      font=("Arial", 12, "bold"), text=f"Score: {self.score}")

        mid_x, mid_y = COLS * CELL // 2, ROWS * CELL // 2
        if self.game_over:
            c.create_text(mid_x, mid_y - 15, fill=TEXT,
                          font=("Arial", 28, "bold"), text="GAME OVER")
            c.create_text(mid_x, mid_y + 20, fill=TEXT,
                          font=("Arial", 14), text="R 키를 눌러 다시 시작")
        elif self.paused:
            c.create_text(mid_x, mid_y, fill=TEXT,
                          font=("Arial", 24, "bold"), text="PAUSED")


if __name__ == "__main__":
    root = tk.Tk()
    SnakeGame(root)
    root.mainloop()
