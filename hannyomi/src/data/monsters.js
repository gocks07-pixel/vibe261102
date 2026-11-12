'use strict';
// 몬스터 데이터. 체력/공격력/경험치는 레벨과 종류(kind)로 자동 계산된다 (formulas.js)
//  shape: 그리는 모양, aggressive: 가까이 가면 먼저 공격, ranged: 원거리, flying: 공중
//  drops: [{id, ch}] 일반 드롭 / quest: 퀘스트 진행 중일 때만 떨어지는 아이템
G.MONSTERS = {
  // 튜토리얼용: 공격하지 않고 드롭 없음
  dummy:      { name: '훈련용 허수아비', lv: 1, kind: 'normal', shape: 'golem', color: '#e8d8a0', color2: '#9a8050', w: 50, h: 76, speed: 0, harmless: true, noLoot: true, fixedHp: 8 },
  jelly:      { name: '풀잎 젤리', lv: 1, kind: 'normal', shape: 'blob', color: '#7bd36a', color2: '#4e9e42', w: 44, h: 34, speed: 40, quest: ['q_jelly'] },
  crab:       { name: '꼬마 게', lv: 3, kind: 'normal', shape: 'crab', color: '#f08a4b', color2: '#c0582a', w: 50, h: 36, speed: 70, quest: ['q_shell'] },
  spore:      { name: '포자 방울', lv: 4, kind: 'normal', shape: 'spore', color: '#b38ad9', color2: '#7d55a8', w: 42, h: 42, speed: 50, quest: ['q_spore'] },
  capshroom:  { name: '갓버섯 전사', lv: 6, kind: 'normal', shape: 'mushroom', color: '#b5651d', color2: '#f1e0c0', w: 48, h: 58, speed: 55, quest: ['q_cap'] },
  spikeshell: { name: '가시 조개', lv: 7, kind: 'normal', shape: 'shell', color: '#8aa5c8', color2: '#5a7598', w: 54, h: 40, speed: 30, quest: ['q_pearl'] },
  sealizard:  { name: '바다 도마뱀', lv: 9, kind: 'normal', shape: 'lizard', color: '#3fb8a8', color2: '#24806f', w: 72, h: 36, speed: 90, aggressive: true },
  fieldrat:   { name: '들쥐', lv: 11, kind: 'normal', shape: 'rat', color: '#a0846a', color2: '#6f5a46', w: 50, h: 32, speed: 110 },
  scarecrow:  { name: '허수아비 골렘', lv: 12, kind: 'normal', shape: 'golem', color: '#d8b25a', color2: '#7a5a2a', w: 52, h: 78, speed: 45, quest: ['q_gear'] },
  windspirit: { name: '바람 정령', lv: 14, kind: 'normal', shape: 'spirit', color: '#9ee6f0', color2: '#4fb8c8', w: 46, h: 50, speed: 70, flying: true },
  wingboar:   { name: '돌풍 산양', lv: 15, kind: 'normal', shape: 'boar', color: '#f2f0ea', color2: '#4a4048', w: 74, h: 52, speed: 95, quest: ['q_cloth', 'q_hide'] },
  banditnov:  { name: '도적 견습', lv: 17, kind: 'normal', shape: 'bandit', color: '#4a4a5a', color2: '#2a2a36', w: 40, h: 66, speed: 95, aggressive: true,
                drops: [{ pool: ['elen_hat', 'elen_top', 'elen_bottom', 'elen_shoes', 'elen_gloves'], ch: 0.012 }] },
  banditarch: { name: '도적 궁수', lv: 18, kind: 'normal', shape: 'bandit', bow: true, color: '#5a4a3a', color2: '#33281e', w: 40, h: 66, speed: 70, ranged: true, quest: ['q_pack'],
                drops: [{ pool: ['elen_hat', 'elen_top', 'elen_bottom', 'elen_shoes', 'elen_gloves'], ch: 0.012 }] },
  barkminion: { name: '바르크의 부하', lv: 18, kind: 'minion', shape: 'bandit', color: '#3a3a4a', color2: '#24242e', w: 40, h: 66, speed: 110, aggressive: true },

  // ---------- 최종 보스 전투용 ----------
  void_pillar: { name: '봉인의 사슬 기둥', lv: 100, kind: 'minion', shape: 'pillar', color: '#4a4a78', color2: '#1c1c3a', w: 60, h: 150, speed: 0,
                 harmless: true, noLoot: true, noKb: true, chainPillar: true, trialScale: true },
  hero_echo:   { name: '영웅의 잔영', lv: 100, kind: 'minion', shape: 'echo', color: '#7ab8ff', color2: '#3a5aa0', w: 42, h: 68, speed: 120,
                 aggressive: true, sight: 2000, noLoot: true, echo: true, hpMul: 2, trialScale: true },
  nox: { name: '공허의 군주 녹스', lv: 100, kind: 'final', shape: 'nox', color: '#2a1040', color2: '#c040ff', w: 150, h: 230, speed: 50, ai: 'nox',
         bossDrops: [{ scrolls: 8, s30: 40 }] },

  // ---------- 보스 ----------
  shellock: { name: '쉘로크', lv: 10, kind: 'boss', shape: 'crab', color: '#e0643c', color2: '#8a2e1a', w: 170, h: 120, speed: 40, ai: 'shellock',
              bossDrops: [{ scrolls: 3, s30: 15 }, { id: 'relic_earring', ch: 1 }, { goldBag: 8, ch: 0.5 }, { id: 'pot_orange', ch: 1, qty: 10 },
                          { pool: ['sword_iron', 'bow_hunter', 'wand_novice', 'dagger_twin', 'sprout_hat', 'sprout_top', 'sprout_bottom', 'sprout_shoes'], ch: 0.6 }] },
  bark: { name: '붉은손 바르크', lv: 20, kind: 'boss', shape: 'bandit', big: true, color: '#b03030', color2: '#5a1a1a', w: 70, h: 112, speed: 80, ai: 'bark',
          bossDrops: [{ scrolls: 4, s30: 20 }, { id: 'relic_ring', ch: 1 }, { id: 'relic_belt', ch: 0.6 }, { id: 'pot_white', ch: 1, qty: 10 },
                      { pool: ['elen_hat', 'elen_top', 'elen_bottom', 'elen_shoes', 'elen_gloves'], ch: 0.4 },
                      { pool: ['sword_red', 'bow_red', 'wand_red', 'dagger_red'], ch: 0.5 }] },
};
