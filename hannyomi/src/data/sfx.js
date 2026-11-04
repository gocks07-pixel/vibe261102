'use strict';
// 장비 특수 효과 (별빛 각인서 성공 시 일정 확률로 새겨짐)
//  p: 발동 확률 범위(%), v: 수치 범위. 굴릴 때 범위 안에서 랜덤 (높은 칸일수록 위쪽)
//  stat: 항상 적용되는 능력치로 바뀌는 효과
//  boss: 보스에게 적용될 때의 규칙 설명
G.SFX = {
  stun:     { n: 1, name: '기절', p: [3, 8], v: [1.5, 1.5], text: (p, v) => `공격 시 ${p}% 확률로 ${v}초 기절 (보스 면역)` },
  freeze:   { n: 2, name: '빙결', p: [3, 8], v: [2, 2], text: (p, v) => `공격 시 ${p}% 확률로 ${v}초 빙결 (보스: 이동속도 30% 감소)` },
  poison:   { n: 3, name: '중독', p: [5, 12], v: [20, 40], text: (p, v) => `공격 시 ${p}% 확률로 4초간 매초 기본 데미지의 ${v}% 중독` },
  dark:     { n: 4, name: '암흑', p: [5, 10], v: [30, 30], text: (p, v) => `공격 시 ${p}% 확률로 5초간 몬스터 공격이 ${v}% 확률로 빗나감 (보스 15%)` },
  slow:     { n: 5, name: '슬로우', p: [8, 15], v: [40, 40], text: (p, v) => `공격 시 ${p}% 확률로 4초간 이동속도 ${v}% 감소 (보스 20%)` },
  seal:     { n: 6, name: '봉인', p: [4, 8], v: [5, 5], text: (p, v) => `공격 시 ${p}% 확률로 ${v}초간 특수 공격 봉인 (보스: 다음 패턴 2초 지연)` },
  hpOnHit:  { n: 7, name: '흡혈', p: [5, 10], v: [1, 3], text: (p, v) => `공격 시 ${p}% 확률로 최대 HP의 ${v}% 회복` },
  mpOnHit:  { n: 8, name: '마나 흡수', p: [5, 10], v: [2, 4], text: (p, v) => `공격 시 ${p}% 확률로 최대 MP의 ${v}% 회복` },
  ignore:   { n: 9, name: '회피의 가호', p: [3, 8], text: p => `피격 시 ${p}% 확률로 데미지 무시` },
  guard:    { n: 10, name: '수호의 가호', p: [2, 5], v: [2, 2], text: (p, v) => `피격 시 ${p}% 확률로 피해 없이 ${v}초 무적` },
  iframe:   { n: 11, name: '잔영', v: [0.2, 0.5], step: 0.1, text: (p, v) => `피격 후 무적 시간 +${v}초` },
  reflect:  { n: 12, name: '가시', p: [5, 10], v: [50, 100], text: (p, v) => `피격 시 ${p}% 확률로 받은 피해의 ${v}% 반사 (보스: 최대 HP 1%까지)` },
  steal:    { n: 13, name: '오토스틸', p: [3, 8], text: p => `공격 시 ${p}% 확률로 골드 추가 획득 (몬스터당 1회)` },
  hpOnKill: { n: 14, name: '생명 수확', p: [20, 40], v: [2, 5], text: (p, v) => `처치 시 ${p}% 확률로 최대 HP의 ${v}% 회복` },
  mpOnKill: { n: 15, name: '마나 수확', p: [20, 40], v: [3, 6], text: (p, v) => `처치 시 ${p}% 확률로 최대 MP의 ${v}% 회복` },
  hpRegen:  { n: 16, name: '재생', v: [1, 2], text: (p, v) => `4초마다 HP +(레벨 × ${v})` },
  mpRegen2: { n: 17, name: '명상', v: [0.5, 1], step: 0.1, text: (p, v) => `4초마다 MP +(레벨 × ${v})` },
  healEff:  { n: 18, name: '치유 효율', v: [10, 25], text: (p, v) => `물약·회복 스킬 효과 +${v}%` },
  mpSave:   { n: 19, name: '마나 절약', v: [5, 12], text: (p, v) => `스킬 MP 소모 ${v}% 감소` },
  atkUp:    { n: 20, name: '공격력 증가', v: [3, 8], stat: v => ({ atkp: v }), text: (p, v) => `공격력 +${v}%` },
  vital:    { n: 21, name: '활력', v: [5, 10], stat: v => ({ HPp: v, MPp: v }), text: (p, v) => `최대 HP·MP +${v}%` },
  critUp:   { n: 22, name: '치명 강화', p: [3, 6], v: [5, 10], stat: (v, p) => ({ crit: p, critDmg: v }), text: (p, v) => `치명타 확률 +${p}%, 치명타 피해 +${v}%` },
  haste:    { n: 23, name: '신속 공격', v: [5, 12], stat: v => ({ aspd: v }), text: (p, v) => `공격 속도 +${v}% (공격 후 경직 감소)` },
  wind:     { n: 24, name: '바람의 발걸음', v: [5, 10], stat: v => ({ mspd: v }), text: (p, v) => `이동속도·점프력 +${v}%` },
};

// 1.6.1: 별빛 각인서. 성공률·특수 효과 확률·효과 품질은 "채울 칸 단계"(1칸 ~ 7칸)로 정해진다
//  성공: 강화 +1, 칸 하나 채움 / 실패: 칸은 그대로, 각인서만 사라짐
G.ENGRAVE = {
  rate: [1.0, 0.9, 0.8, 0.65, 0.5, 0.4, 0.3],
  fx:   [0.10, 0.15, 0.20, 0.28, 0.36, 0.43, 0.50],
  q:    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
};
// 부위별 각인 칸 수와 강화 +1당 능력치 (1.6.1: 칸당 +1만 오르는 대신 수치를 1.5배로)
G.UPGRADE = {
  weapon:  { slots: 7, per: { atk: 3 } },
  hat:     { slots: 7, per: { def: 4.5, HP: 22.5 } },
  top:     { slots: 7, per: { def: 4.5, HP: 22.5 } },
  bottom:  { slots: 7, per: { def: 4.5, HP: 22.5 } },
  shoes:   { slots: 5, per: { def: 3, mainStat: 1.5 } },
  gloves:  { slots: 5, per: { def: 3, mainStat: 1.5, atk: 1.5 } },
  cape:    { slots: 5, per: { def: 3, mainStat: 1.5 } },
  earring: { slots: 3, per: { allStat: 1.5 } },
  ring:    { slots: 3, per: { allStat: 1.5 } },
  pendant: { slots: 3, per: { allStat: 1.5 } },
  belt:    { slots: 3, per: { allStat: 1.5 } },
};
// 일반 몬스터 각인서 드롭: 3% (평균 33마리에 1장)
G.SCROLL_DROP = { chance: 0.03, weights: [['scroll_100', 1]] };   // 1.6.1: 별빛 각인서 한 종류, 7칸을 채우는 데 평균 12.7장이 들어 2% → 3%
