"""장비 생성, 추가옵션/잠재능력 랜덤, 큐브, 세트 효과."""
import random
import itertools

from .data import EQUIP, SLOTS, TIERS, SETS, JOBS

STAT_LABEL = {
    "STR": "STR", "DEX": "DEX", "INT": "INT", "LUK": "LUK", "ALL": "올스탯",
    "STR%": "STR", "DEX%": "DEX", "INT%": "INT", "LUK%": "LUK", "ALL%": "올스탯",
    "ATT": "공격력", "ATT%": "공격력", "DMG%": "데미지", "BOSS%": "보스 데미지", "IED%": "방어율 무시",
    "CRIT": "크리티컬 확률", "CRITD": "크리티컬 데미지", "HP": "최대 HP", "MP": "최대 MP",
    "HP%": "최대 HP", "MP%": "최대 MP", "DEF": "방어력", "SPEED": "이동속도",
    "DMGRED%": "받는 피해 감소", "HEAL%": "회복량", "REGEN": "매초 HP 회복", "MPEAT": "마나 흡수 확률",
    "DOT%": "지속 피해", "REVIVE": "쓰러질 때 부활",
}
PCT_STATS = {"STR%", "DEX%", "INT%", "LUK%", "ALL%", "ATT%", "DMG%", "BOSS%", "IED%", "CRIT", "CRITD", "HP%", "MP%",
             "DMGRED%", "HEAL%", "REGEN", "MPEAT", "DOT%"}
COMBAT_JOBS = ["warrior", "archer", "mage", "thief"]

_uid = itertools.count(int(random.random() * 1e6))


def fmt_stat(stat, val):
    label = STAT_LABEL.get(stat, stat)
    if stat == "REVIVE":
        return label
    if stat in PCT_STATS:
        return f"{label} +{val}%"
    return f"{label} +{val}"


def _unit(level):
    return 1 + level / 10


def base_stats(level, slot):
    s = SLOTS[slot]
    out = {}
    if s["kind"] == "weapon":
        out["ATT"] = int(12 + 1.0 * level + 0.02 * level * level)
    else:
        if s["def"]:
            out["DEF"] = int((5 + 1.3 * level) * s["def"])
        for k, mult in s["stats"].items():
            v = mult * _unit(level)
            if k in ("HP", "MP"):
                v = mult * (1 + level * 0.25)
            v = int(round(v))
            if v > 0:
                out[k] = v
    return out


def _weighted(pool):
    return random.choices(pool, weights=[p.get("w", 1) for p in pool])[0]


def _slot_ok(entry, slot):
    allowed = entry.get("slots")
    if not allowed:
        return True
    return slot in allowed or SLOTS[slot]["kind"] in allowed


def roll_additional(level, slot):
    cfg = EQUIP["additional"]
    n = random.choices([1, 2, 3, 4], weights=cfg["lines_weight"])[0]
    pool = [p for p in cfg["pool"] if _slot_ok(p, slot)]
    tier = level // 20 + 1
    lines = []
    for _ in range(n):
        p = _weighted(pool)
        v = random.randint(p["min"], p["max"])
        if not p.get("flat"):
            v *= tier
        lines.append([p["stat"], v])
    return lines


def _pot_line(grade, level, slot):
    pool = [p for p in EQUIP["potential"]["options"][str(grade)] if _slot_ok(p, slot)]
    p = _weighted(pool)
    val = p["val"]
    hb = EQUIP["potential"]["high_level_bonus"]
    if level >= hb["level"] and p["stat"].endswith("%") and p["stat"] not in ("BOSS%", "IED%"):
        val += hb["pct_bonus"]
    return [p["stat"], val]


def roll_potential(grade, level, slot):
    """첫 줄은 해당 등급, 2·3번째 줄은 확률적으로 해당 등급 아니면 한 단계 아래."""
    if grade <= 0:
        return []
    pc = EQUIP["potential"]
    lines = [_pot_line(grade, level, slot)]
    for chance in (pc["line2_same_grade"], pc["line3_same_grade"]):
        g = grade if random.random() < chance else max(1, grade - 1)
        lines.append(_pot_line(g, level, slot))
    return lines


def roll_grade(mode):
    rates = EQUIP["potential"]["drop_grade_rates"][mode]
    return random.choices([0, 1, 2, 3, 4], weights=rates)[0]


def make_equip(tier_level, slot, job=None, grade_mode="normal", grade=None):
    tier = next(t for t in TIERS if t["level"] == tier_level)
    slot_info = SLOTS[slot]
    if slot_info["kind"] == "weapon":
        job = job or random.choice(COMBAT_JOBS)
        name = f"{tier['prefix']} {EQUIP['weapon_names'][job]}"
    else:
        job = None
        name = f"{tier['prefix']} {slot_info['name']}"
    if grade is None:
        grade = roll_grade(grade_mode)
    lv = tier["level"]
    return {
        "uid": next(_uid), "name": name, "slot": slot, "job": job, "level": lv,
        "set": tier["set"], "base": base_stats(lv, slot), "add": roll_additional(lv, slot),
        "grade": grade, "pot": roll_potential(grade, lv, slot),
    }


def random_drop(mon_level, kind, set_drop, player_job):
    """몬스터 드롭 장비. 일반 몬스터는 일반 티어, 정예/보스는 해당 지역 세트."""
    if set_drop and kind in ("elite", "boss"):
        tier = next(t for t in TIERS if t["set"] == set_drop)
    else:
        cands = [t for t in TIERS if t["set"] is None and t["level"] <= mon_level]
        near = [t for t in cands if t["level"] >= mon_level - 25]
        tier = random.choice(near or cands[-1:])
    slot = random.choice(tier["slots"])
    job = None
    if SLOTS[slot]["kind"] == "weapon":
        if player_job in COMBAT_JOBS and random.random() < 0.6:
            job = player_job
        elif tier["level"] == 0:
            job = "beginner"
    return make_equip(tier["level"], slot, job, grade_mode=kind if kind in ("elite", "boss") else "normal")


def use_cube(item, rates):
    """큐브: 등급업 시도 후 잠재능력 재설정. rates = [레어→에픽, 에픽→유니크, 유니크→레전드리] %."""
    old = item["grade"]
    g = max(1, old)
    upgraded = False
    if old >= 1 and g < 4 and random.random() * 100 < rates[g - 1]:
        g += 1
        upgraded = True
    item["grade"] = g
    item["pot"] = roll_potential(g, item["level"], item["slot"])
    return upgraded


def item_stats(item):
    total = {}
    for k, v in item["base"].items():
        total[k] = total.get(k, 0) + v
    for k, v in item["add"] + item["pot"]:
        total[k] = total.get(k, 0) + v
    return total


def set_counts(equipped):
    counts = {}
    for it in equipped.values():
        if it and it.get("set"):
            counts[it["set"]] = counts.get(it["set"], 0) + 1
    return counts


def set_bonus(set_id, count):
    out = {}
    for need, stats in SETS[set_id]["bonus"].items():
        if count >= int(need):
            for k, v in stats.items():
                out[k] = out.get(k, 0) + v
    return out


def can_equip(item, player):
    if player.level < item["level"]:
        return False, f"레벨 {item['level']} 이상만 착용할 수 있습니다."
    job = item.get("job")
    if job and job != "beginner" and job != player.job:
        return False, f"{JOBS[job]['names'][1]} 계열 전용 무기입니다."
    return True, ""


def sell_price(item):
    return 10 + item["level"] * 12 + item["grade"] * item["level"] * 8
