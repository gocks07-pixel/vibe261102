'use strict';
// 밸런스 공식. 숫자를 바꾸면 게임 전체 밸런스가 바뀐다.
G.F = {
  MAX_LEVEL: 100,
  BOSS_POT_GAP: 2,          // 빌드 1 (2-1): 보스 방에서 HP · MP 물약은 종류마다 2초에 한 번 (3초 → 2초: 사용자 결정 · 후반 보스 시뮬레이션) (사냥터는 자동 물약 1초 그대로)
  QUEST_EXP_SCALE: 0.9,   // 퀘스트 보상 = 해당 레벨 필요 EXP × 비율 × 이 값
  AP_PER_LEVEL: 4,          // 1.6.1: 레벨당 능력 포인트 (직접 배분)
  AUTO_STAT: 1,             // 1.6.1: 각성 후 레벨당 직업 주스탯 자동 성장
  SP_PER_LEVEL: 3,          // Lv.10 이상부터 지급

  expToNext(L) {
    return L >= this.MAX_LEVEL ? 0 : Math.round(50 + 20 * Math.pow(L, 2.1));
  },

  // 해당 레벨 "적정 장비 + 스탯 몰빵" 캐릭터의 기본 데미지 (몬스터 체력 기준선)
  refDamage(L) {
    const M = 7 + 6.2 * L, S = 5 + 0.4 * L, A = 10 + 2.6 * L;
    return (4 * M + S) * A / 100;
  },
  refPlayerHP(L) { return 50 + 16 * (L - 1); },

  // 일반 몬스터가 기본 데미지 몇 번에 죽는지 (각성 차수별 스킬 배율 반영)
  HIT_TABLE: [[1, 3.5], [10, 7], [20, 10], [30, 22], [60, 40], [85, 65], [100, 75]],
  hitFactor(L) {
    const t = this.HIT_TABLE;
    for (let i = 1; i < t.length; i++) {
      if (L <= t[i][0]) {
        const [l0, v0] = t[i - 1], [l1, v1] = t[i];
        return v0 + (v1 - v0) * (L - l0) / (l1 - l0);
      }
    }
    return t[t.length - 1][1];
  },

  monsterStats(L, kind) {
    let hp = this.refDamage(L) * this.hitFactor(L);
    let atk = this.refPlayerHP(L) * 0.08 + 2;
    let exp = Math.max(1, Math.round(this.expToNext(L) / 100));
    let def = 0.001 * L;
    if (kind === 'elite') { hp *= 4; atk *= 1.5; exp *= 3; }
    if (kind === 'minion') { hp *= 0.6; exp = Math.max(1, Math.round(exp * 0.3)); }
    if (kind === 'boss') { hp *= 8 + 0.22 * L; atk *= 1.3; exp *= 30; def = 0.1 + 0.002 * L; }
    if (kind === 'final') { hp *= 60; atk *= 1.5; exp *= 60; def = 0.1 + 0.002 * L; }
    return { hp: Math.round(hp), atk: Math.round(atk), exp, def };
  },

  questExp(level, ratio) { return Math.round(this.expToNext(level) * ratio * this.QUEST_EXP_SCALE); },
  // 사냥 경험치 패널티 (내 레벨이 훨씬 높을 때)
  expPenalty(pl, ml) { const d = pl - ml; return d >= 20 ? 0 : d >= 10 ? 0.1 : 1; },
  // 몬스터 레벨이 더 높으면 1레벨당 데미지 5% 감소
  dmgPenalty(pl, ml) { const d = ml - pl; return d > 0 ? Math.max(0.1, 1 - 0.05 * d) : 1; },
  // 레벨업 SP (1.5): Lv.10~29 3, 30~59 5, 60~ 6  → Lv.100까지 456 (스킬 전부 마스터 440)
  spFor(L) { return L >= 85 ? 6 : L >= 30 ? 4 : L >= 10 ? 5 : 0; },   // 빌드 1 (8번): 레벨업 표시용. 실제 SP 는 G.SP (각성 구간별, 각성 Ⅲ +20 · Ⅳ +4)
  spForOld(L) { return L >= 60 ? 5 : L >= 30 ? 4 : L >= 10 ? 3 : 0; },   // 1.4까지 (옛 세이브 보정용)
  gold(L) { return G.U.randi(Math.round(L * 2 + 3), Math.round(L * 4 + 8)); },
  deathExpLoss: 0.03,
};
