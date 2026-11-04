'use strict';
// 세트 효과. bonus[n] = n부위 이상 착용 시 추가되는 효과 (누적 적용)
G.SETS = {
  sprout: {
    name: '새싹 모험가 세트',
    pieces: ['sprout_hat', 'sprout_top', 'sprout_bottom', 'sprout_shoes'],
    bonus: { 2: { HP: 50 }, 3: { allStat: 3 }, 4: { atk: 5, HPp: 5 } },
  },
  elen: {
    name: '엘렌 숲지기 세트',
    pieces: ['elen_hat', 'elen_top', 'elen_bottom', 'elen_shoes', 'elen_gloves'],
    bonus: { 2: { HP: 100 }, 3: { allStat: 10 }, 4: { def: 30 }, 5: { atk: 15 } },
  },
  starheir: {
    name: '별조각 계승자 세트',
    pieces: ['trial_hat', 'trial_top', 'trial_bottom', 'trial_shoes', 'trial_gloves', 'trial_cape', 'trial_sword|trial_bow|trial_wand|trial_dagger'],
    bonus: { 2: { allStat: 20 }, 3: { HP: 1500 }, 4: { atk: 30 }, 5: { def: 100 }, 6: { atkp: 5 }, 7: { bossDmg: 15 } },
  },
  relic: {
    name: '영웅의 유물 세트',
    pieces: ['relic_earring', 'relic_pendant', 'relic_ring', 'relic_belt'],
    bonus: { 2: { atk: 3 }, 3: { allStat: 5, HP: 100 }, 4: { atk: 5, bossDmg: 5 } },
  },
};
