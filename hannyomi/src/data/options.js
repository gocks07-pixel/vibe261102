'use strict';
// 장비 등급 / 단련 효과(옛 추가 옵션) / 별자리 각인(옛 잠재 옵션) 데이터

G.STAT_NAMES = {
  STR: '힘', DEX: '민첩', INT: '지혜', LUK: '감각', allStat: '모든 능력치',
  STRp: '힘', DEXp: '민첩', INTp: '지혜', LUKp: '감각', allStatp: '모든 능력치',
  HP: '최대 HP', MP: '최대 MP', HPp: '최대 HP', MPp: '최대 MP',
  atk: '공격력', atkp: '공격력', def: '방어력',
  crit: '치명타 확률', critDmg: '치명타 피해', bossDmg: '보스 몬스터 공격 시 데미지',
  ignoreDef: '몬스터 방어율 무시', dmgp: '데미지', mainStat: '주스탯', aspd: '공격 속도', mspd: '이동속도', barrier: '별빛 장막 (최대 HP 비례)',
};
// % 로 표시하는 스탯
G.PCT_STATS = new Set(['STRp', 'DEXp', 'INTp', 'LUKp', 'allStatp', 'HPp', 'MPp', 'atkp', 'crit', 'critDmg', 'bossDmg', 'ignoreDef', 'dmgp', 'aspd', 'mspd', 'barrier']);
G.statText = (k, v) => k === 'sfx' ? G.Items.sfxText(v) : k === 'label' ? `「${v}」` : `${G.STAT_NAMES[k] || k} +${v}${G.PCT_STATS.has(k) ? '%' : ''}`;

G.GRADES = [
  { id: 'normal', name: '평범', color: '#d0d4dc' },
  { id: 'rare', name: '반짝임', color: '#4fd1c5' },
  { id: 'epic', name: '빛남', color: '#5a8cff' },
  { id: 'unique', name: '찬란', color: '#ff7ab8' },
  { id: 'legendary', name: '별의 축복', color: '#ffd54a' },
];

// 등급 표시 이름은 1.6.1에서 별 세계관 이름으로 (id 는 그대로)
// 드롭 시 별자리 각인 등급 확률 (%)
G.DROP_GRADE = {
  normal: [[0, 70], [1, 22], [2, 6.5], [3, 1.3], [4, 0.2]],
  boss: [[0, 20], [1, 50], [2, 22], [3, 6.5], [4, 1.5]],
};
// 공명석: 등급이 오르는 데 필요한 공명 게이지 (공명석 1개 = +1). 반짝임→빛남 5, 빛남→찬란 15, 찬란→별의 축복 35
G.RESONANCE = { 1: 5, 2: 15, 3: 35 };
// 각인 2·3번째 줄이 장비 등급과 같은 등급으로 나올 확률
G.POT_LINE_SAME = [1, 0.2, 0.05];

// ---------- 단련 효과 (대장장이에게 골드를 내고 다시 굴림) ----------
// v(L): 1단계 수치. 최종 수치 = v(L) × 단계
G.ADD_OPTS = [
  { stat: 'STR', v: L => 1 + Math.floor(L / 20) },
  { stat: 'DEX', v: L => 1 + Math.floor(L / 20) },
  { stat: 'INT', v: L => 1 + Math.floor(L / 20) },
  { stat: 'LUK', v: L => 1 + Math.floor(L / 20) },
  { stat: 'allStat', v: L => 1 + Math.floor(L / 40), w: 0.5 },
  { stat: 'HP', v: L => 10 + L * 3 },
  { stat: 'MP', v: L => 10 + L * 3, w: 0.6 },
  { stat: 'atk', v: L => 1 + Math.floor(L / 25), w: 0.7, wWeapon: 4 },
  { stat: 'def', v: L => 2 + Math.floor(L / 10), noWeapon: true },
];
G.ADD_LINES = [[0, 20], [1, 30], [2, 30], [3, 15], [4, 5]];
G.ADD_STAGE = [[1, 30], [2, 30], [3, 25], [4, 12], [5, 3]];

// ---------- 별자리 각인 (공명석으로 한 줄씩 다시 새김) ----------
// only: 'weapon' → 무기 전용, noWeapon → 무기 제외
(function () {
  const four = (suffix, v, extra = {}) => G.STATS4.map(s => Object.assign({ stat: s + suffix, v }, extra));
  G.POT_OPTS = {
    1: [
      ...four('', L => 2 + Math.floor(L / 12)),
      { stat: 'HP', v: L => 20 + L * 3 },
      { stat: 'MP', v: L => 20 + L * 3, w: 0.5 },
      { stat: 'def', v: L => 3 + Math.floor(L / 6), noWeapon: true },
      { stat: 'atk', v: L => 1 + Math.floor(L / 20), only: 'weapon', w: 2 },
    ],
    2: [
      ...four('p', () => 3),
      { stat: 'allStatp', v: () => 2 },
      { stat: 'HPp', v: () => 3 },
      { stat: 'atk', v: L => 2 + Math.floor(L / 15), only: 'weapon', w: 2 },
      { stat: 'crit', v: () => 3 },
    ],
    3: [
      ...four('p', () => 6),
      { stat: 'allStatp', v: () => 4 },
      { stat: 'HPp', v: () => 6 },
      { stat: 'atkp', v: () => 6, only: 'weapon', w: 2 },
      { stat: 'dmgp', v: () => 6, only: 'weapon' },
      { stat: 'crit', v: () => 6 },
    ],
    4: [
      ...four('p', () => 9),
      { stat: 'allStatp', v: () => 6 },
      { stat: 'atkp', v: () => 9, only: 'weapon', w: 2 },
      { stat: 'dmgp', v: () => 9, only: 'weapon' },
      { stat: 'bossDmg', v: () => G.U.pick([20, 30]), only: 'weapon', w: 1.5 },
      { stat: 'ignoreDef', v: () => 15, only: 'weapon' },
      { stat: 'critDmg', v: () => 8 },
      { stat: 'crit', v: () => 9 },
    ],
  };
})();
