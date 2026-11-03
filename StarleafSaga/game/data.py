"""JSON 데이터 로더. 한 번만 읽어서 모듈 전역으로 공유."""
import json
import os

from .config import DATA_DIR


def _load(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


_skills = _load("skills.json")
JOBS = _skills["jobs"]
SKILLS = {s["id"]: s for s in _skills["skills"]}

EQUIP = _load("equipment.json")
SLOTS = EQUIP["slots"]
SLOT_ORDER = EQUIP["slot_order"]
TIERS = EQUIP["tiers"]
SETS = EQUIP["sets"]
CONSUMABLES = EQUIP["consumables"]

_mon = _load("monsters.json")
MONSTERS = _mon["monsters"]
ETC_ITEMS = _mon["etc_items"]

_maps = _load("maps.json")
MAPS = _maps["maps"]
REGIONS = _maps["regions"]
THEMES = _maps["themes"]
START_MAP = _maps["start_map"]

NPCS = _load("npcs.json")
QUESTS = {k: v for k, v in _load("quests.json").items() if not k.startswith("_")}


def job_name(job, tier, branches=None):
    """branches: {"2": 계열, "3": 계열, "4": 계열} - 해당 차수에 고른 계열 이름을 우선 사용."""
    br = (branches or {}).get(str(tier))
    if br and br in JOBS[job].get("branches", {}):
        return JOBS[job]["branches"][br]["names"][str(tier)]
    names = JOBS[job]["names"]
    return names[min(tier, len(names) - 1)]


def skill_branch_ok(skill, branches):
    """계열 전용 스킬이면 그 차수에 고른 계열과 맞는지 확인."""
    b = skill.get("branch")
    if not b:
        return True
    chosen = branches.get(str(skill["tier"]))
    return chosen in b if isinstance(b, list) else chosen == b


def item_name(item_id):
    if item_id in CONSUMABLES:
        return CONSUMABLES[item_id]["name"]
    return ETC_ITEMS.get(item_id, item_id)


def tier_by_level(level):
    for t in TIERS:
        if t["level"] == level:
            return t
    return None
