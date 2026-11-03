"""레벨 기반 공식.

몬스터 HP / 경험치 / 방어력 곡선은 mlandopt.com 몬스터 도감의 레벨별 수치
(Lv1 HP 8 → Lv30 약 900 → Lv60 약 6,500 → Lv100 약 60,000)를 기준점으로 삼아
기준점 사이를 로그 보간한다.
"""
import math

from .config import MAX_LEVEL

# (레벨, 값) 기준점
# 초반(1~30)은 기본 공격 2~3타가 되도록 참고값보다 조금 높게 잡았다.
HP_ANCHORS = [(1, 12), (5, 70), (10, 220), (20, 520), (30, 1300), (40, 2400), (50, 4000),
              (60, 6500), (70, 15000), (80, 26000), (90, 40000), (100, 60000)]
EXP_ANCHORS = [(1, 3), (5, 9), (10, 20), (20, 33), (30, 57), (40, 95), (50, 138),
               (60, 250), (70, 290), (80, 1000), (90, 1790), (100, 3500)]
DEF_ANCHORS = [(1, 1), (10, 12), (20, 25), (40, 150), (60, 220), (70, 320), (80, 800), (90, 1100), (100, 1300)]

# 난이도 HP 배율. 기준: 해당 레벨대 장비(잠재능력·추가옵션 없음) + 주스탯 몰빵으로
# 같은 레벨 일반 몬스터를 기본 공격으로 잡는 타수
#   Lv1 3타 / 10 4타 / 20 5타 / 30 6타 / 40 8타 / 50 11타 / 60 15타 / 70 21타 / 80 30타 / 90·100 50타
# 값 = 목표 타수 / 배율 적용 전 타수 (장비 티어가 바뀌는 구간마다 보정되므로 값이 들쭉날쭉하다)
HP_DIFFICULTY = [(1, 1.25), (10, 1.86), (20, 1.71), (30, 2.63), (40, 2.19), (50, 4.35),
                 (60, 3.66), (70, 4.88), (80, 2.76), (90, 5.46), (100, 3.65)]

# 몬스터 종류별 배율: hp, exp, atk, def, 크기
KIND_MULT = {
    "normal": dict(hp=1.0, exp=1.0, atk=1.0, df=1.0, scale=1.0),
    "tank":   dict(hp=1.6, exp=1.4, atk=0.9, df=2.0, scale=1.25),
    "elite":  dict(hp=5.0, exp=5.0, atk=1.3, df=1.3, scale=1.6),
    "boss":   dict(hp=30.0, exp=60.0, atk=1.6, df=1.5, scale=2.6),
}


def _interp(anchors, lv):
    lv = max(anchors[0][0], min(anchors[-1][0], lv))
    for (l0, v0), (l1, v1) in zip(anchors, anchors[1:]):
        if l0 <= lv <= l1:
            t = (lv - l0) / (l1 - l0) if l1 != l0 else 0
            return math.exp(math.log(v0) + (math.log(v1) - math.log(v0)) * t)
    return anchors[-1][1]


def monster_stats(level, kind="normal", hp_mult=1.0, def_mult=1.0):
    m = KIND_MULT[kind]
    atk = (12 + 3.2 * level + 0.028 * level * level) * m["atk"]
    hp = _interp(HP_ANCHORS, level) * _interp(HP_DIFFICULTY, level) * m["hp"] * hp_mult
    return {
        "hp": int(hp),
        "exp": int(_interp(EXP_ANCHORS, level) * m["exp"]),
        "atk": int(atk),
        "def": int(_interp(DEF_ANCHORS, level) * m["df"] * def_mult),
        "scale": m["scale"],
    }


def exp_to_next(level):
    """해당 레벨에서 다음 레벨까지 필요한 경험치."""
    if level >= MAX_LEVEL:
        return 0
    return max(15, int(_interp(EXP_ANCHORS, level) * (4 + 1.9 * level)))


def hunt_exp_rate(player_lv, mob_lv):
    """사냥 경험치 배율: 몬스터가 5레벨 이상 낮으면 감소 → 퀘스트 위주 성장."""
    diff = player_lv - mob_lv
    if diff <= 5:
        return 1.0
    return max(0.1, 1.0 - 0.12 * (diff - 5))


def quest_exp(level, pct):
    return int(exp_to_next(min(level, MAX_LEVEL - 1)) * pct)


def defense_reduction(defense):
    return defense / (defense + 1500.0)


def player_def_reduction(defense, level):
    return min(0.6, defense / (defense + 300 + 10 * level))


def meso_drop(level):
    return (int(3 + level * 1.5), int(8 + level * 3))
