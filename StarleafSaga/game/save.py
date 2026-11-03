"""세이브/로드 (JSON)."""
import json
import os

from .config import SAVE_PATH
from .player import Player


def exists():
    return os.path.exists(SAVE_PATH)


def save(player):
    tmp = SAVE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(player.to_dict(), f, ensure_ascii=False)
    os.replace(tmp, SAVE_PATH)


def load():
    with open(SAVE_PATH, encoding="utf-8") as f:
        return Player.from_dict(json.load(f))
