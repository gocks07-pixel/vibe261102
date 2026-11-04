'use strict';
// 2~각성 Ⅳ과 스킬. 직업 id: {계열}_{차수}{a|b}  예) warrior_3a = 파쇄자
// 차수별 스킬: 공격 3 + 버프/패시브 1 (4차는 공격 3 + 각성 버프 + 패시브)
(function () {
  const FAM = ['warrior', 'archer', 'mage', 'thief'];
  for (const fam of FAM) {
    const base = G.JOBS[fam];
    base.family = fam;
    G.JOB_TREE[fam].forEach((names, li) => {
      const s = li ? 'b' : 'a';
      for (let tier = 2; tier <= 4; tier++) {
        G.JOBS[`${fam}_${tier}${s}`] = {
          name: names[tier - 2], tier, family: fam, line: s, prev: tier === 2 ? fam : `${fam}_${tier - 1}${s}`,
          main: base.main, sub: base.sub, hpLv: base.hpLv + (tier - 1) * 2, mpLv: base.mpLv + (tier - 1) * 2,
          crit: base.crit + (tier - 1) * 2, color: base.color, weapons: base.weapons,
        };
      }
    });
  }
  G.JOBS.beginner.family = 'beginner';
})();

G.familyOf = job => G.JOBS[job].family || 'beginner';
// 초보자 → 1차 → 2차 → … 현재 직업까지
G.jobChain = job => {
  const out = [];
  for (let j = job; j; j = G.JOBS[j].prev) out.unshift(j);
  if (out[0] !== 'beginner') out.unshift('beginner');
  return out;
};
G.tierName = t => ['표류자', '각성 Ⅰ', '각성 Ⅱ', '각성 Ⅲ', '각성 Ⅳ'][t];

// ---------------- 스킬 ----------------
(function () {
  const L = G.U.lin;
  const add = (job, id, name, g, el, type, o) => {
    G.SKILLS[id] = Object.assign({ id, name, job, type, icon: { g, el }, maxLv: 20 }, o);
  };
  // 공격 스킬: kind, 배율(1→20레벨), 추가 설정
  const A = (job, id, name, g, el, kind, p1, p2, o = {}) => add(job, id, name, g, el, 'attack', {
    mp: L(o.mp1 || 10, o.mp2 || 22), cd: o.cd || 0,
    atk: Object.assign({ kind, pct: L(p1, p2), targets: 1, hits: 1 }, o.atk),
  });
  const B = (job, id, name, g, el, stats, o = {}) => add(job, id, name, g, el, 'buff', {
    mp: () => o.mp || 30, cd: o.cd || 1,
    buff: { dur: L(o.d1 || 120, o.d2 || 300), stats: lv => { const r = {}; for (const k in stats) r[k] = L(stats[k][0], stats[k][1])(lv); return r; } },
  });
  const P = (job, id, name, g, el, stats) => add(job, id, name, g, el, 'passive', {
    passive: lv => { const r = {}; for (const k in stats) r[k] = L(stats[k][0], stats[k][1])(lv); return r; },
  });

  // ===== 전사 A: 대검사 → 파쇄자 → 천붕검제 =====
  let j = 'warrior_2a';
  A(j, 'w2a_cleave', '대지 가르기', 'slash', 'fire', 'melee', 250, 350, { atk: { w: 170, h: 100, targets: 4, hits: 2 } });
  A(j, 'w2a_spin', '화염 회전참', 'whirl', 'fire', 'aoe', 200, 280, { cd: 2, atk: { w: 330, h: 120, targets: 8, hits: 2, fx: 'whirl' } });
  B(j, 'w2a_rage', '분노', 'eye', 'fire', { atk: [10, 30], crit: [5, 15] });
  P(j, 'w2a_mastery', '대검 숙련', 'book', 'fire', { atk: [5, 20], critDmg: [5, 15] });
  j = 'warrior_3a';
  A(j, 'w3a_crush', '파쇄격', 'slash', 'fire', 'melee', 300, 420, { atk: { w: 210, h: 110, targets: 6, hits: 3 } });
  A(j, 'w3a_quake', '대지진', 'burst', 'fire', 'aoe', 250, 340, { cd: 4, atk: { w: 540, h: 150, targets: 10, hits: 2 } });
  A(j, 'w3a_rush', '돌진 강타', 'dash', 'fire', 'dash', 300, 400, { cd: 5, atk: { dist: 320, targets: 8, hits: 2 } });
  P(j, 'w3a_will', '투지', 'book', 'fire', { atkp: [5, 15], HPp: [5, 15] });
  j = 'warrior_4a';
  A(j, 'w4a_heaven', '천붕참', 'slash', 'fire', 'melee', 330, 450, { mp1: 20, mp2: 40, atk: { w: 270, h: 130, targets: 8, hits: 5 } });
  A(j, 'w4a_meteor', '멸천 낙화', 'rain', 'fire', 'rain', 300, 420, { cd: 4, mp1: 30, mp2: 50, atk: { count: 9, area: 540, ahead: 220, proj: 'orb' } });
  B(j, 'w4a_awake', '천붕검제의 각성', 'eye', 'fire', { atkp: [10, 25], bossDmg: [10, 30] }, { cd: 60, d1: 60, d2: 120, mp: 80 });
  P(j, 'w4a_mastery', '극의', 'book', 'fire', { critDmg: [10, 30], ignoreDef: [10, 30] });

  // ===== 전사 B: 방패기사 → 철벽기사 → 불멸의 수호자 =====
  j = 'warrior_2b';
  A(j, 'w2b_bash', '방패 강타', 'shield', 'holy', 'melee', 230, 330, { atk: { w: 150, h: 100, targets: 3, hits: 2 } });
  A(j, 'w2b_wave', '성스러운 파동', 'burst', 'holy', 'aoe', 260, 360, { cd: 2, atk: { w: 320, h: 130, targets: 8, hits: 1 } });
  B(j, 'w2b_oath', '수호의 맹세', 'shield', 'holy', { def: [50, 150], HPp: [10, 30] });
  P(j, 'w2b_mastery', '방패 숙련', 'book', 'holy', { def: [20, 80], atk: [5, 15] });
  j = 'warrior_3b';
  A(j, 'w3b_wall', '성벽 돌진', 'dash', 'holy', 'dash', 280, 380, { cd: 5, atk: { dist: 300, targets: 8, hits: 2 } });
  A(j, 'w3b_hammer', '심판의 망치', 'slash', 'holy', 'melee', 290, 400, { atk: { w: 220, h: 120, targets: 6, hits: 3 } });
  A(j, 'w3b_sanct', '성역', 'burst', 'holy', 'aoe', 240, 330, { cd: 4, atk: { w: 500, h: 150, targets: 10, hits: 2 } });
  P(j, 'w3b_spirit', '불굴', 'book', 'holy', { HPp: [10, 25], atkp: [5, 12] });
  j = 'warrior_4b';
  A(j, 'w4b_strike', '불멸의 일격', 'slash', 'holy', 'melee', 320, 440, { mp1: 20, mp2: 40, atk: { w: 270, h: 130, targets: 8, hits: 5 } });
  A(j, 'w4b_judge', '천상의 심판', 'rain', 'holy', 'rain', 300, 410, { cd: 4, mp1: 30, mp2: 50, atk: { count: 9, area: 540, ahead: 220, proj: 'orb' } });
  B(j, 'w4b_awake', '불멸', 'shield', 'holy', { def: [100, 300], atkp: [10, 20], bossDmg: [5, 20] }, { cd: 60, d1: 60, d2: 120, mp: 80 });
  P(j, 'w4b_pride', '수호자의 긍지', 'book', 'holy', { bossDmg: [10, 30], ignoreDef: [10, 25] });

  // ===== 궁수 A: 사냥꾼 → 매의 사수 → 천궁 =====
  j = 'archer_2a';
  A(j, 'a2a_triple', '삼연사', 'arrows', 'wind', 'proj', 170, 250, { atk: { count: 3, stagger: 10, speed: 1000, range: 620, proj: 'arrow' } });
  A(j, 'a2a_gale', '폭풍 화살', 'arrows', 'wind', 'proj', 260, 360, { cd: 1.5, atk: { count: 1, pierce: 6, speed: 1100, range: 720, proj: 'arrow' } });
  B(j, 'a2a_bless', '바람의 축복', 'eye', 'wind', { crit: [10, 25], atk: [10, 25] });
  P(j, 'a2a_instinct', '사냥꾼의 본능', 'book', 'wind', { atk: [5, 20], crit: [5, 10] });
  j = 'archer_3a';
  A(j, 'a3a_hawk', '매의 일격', 'arrows', 'wind', 'proj', 220, 320, { atk: { count: 4, stagger: 8, speed: 1100, range: 680, proj: 'arrow' } });
  A(j, 'a3a_storm', '화살 폭풍', 'rain', 'wind', 'rain', 200, 290, { cd: 3, atk: { count: 10, area: 440, ahead: 240 } });
  A(j, 'a3a_evade', '회피 사격', 'backshot', 'wind', 'back', 350, 480, { cd: 3, atk: { dist: 220, count: 1, pierce: 5, speed: 1100, range: 700, proj: 'arrow' } });
  P(j, 'a3a_eye', '매의 눈 숙련', 'book', 'wind', { critDmg: [10, 25], atkp: [5, 12] });
  j = 'archer_4a';
  A(j, 'a4a_volley', '천궁 연사', 'arrows', 'wind', 'proj', 290, 400, { mp1: 20, mp2: 40, atk: { count: 5, stagger: 8, pierce: 2, speed: 1200, range: 760, proj: 'arrow' } });
  A(j, 'a4a_rain', '천공의 화살비', 'rain', 'wind', 'rain', 260, 360, { cd: 4, mp1: 30, mp2: 50, atk: { count: 14, area: 620, ahead: 260 } });
  B(j, 'a4a_awake', '천궁의 각성', 'eye', 'wind', { atkp: [10, 25], bossDmg: [10, 30] }, { cd: 60, d1: 60, d2: 120, mp: 80 });
  P(j, 'a4a_mastery', '궁극의 궁술', 'book', 'wind', { ignoreDef: [10, 30], critDmg: [10, 25] });

  // ===== 궁수 B: 석궁수 → 저격수 → 섬광의 저격왕 =====
  j = 'archer_2b';
  A(j, 'a2b_pierce', '관통 볼트', 'arrows', 'earth', 'proj', 300, 420, { atk: { count: 1, pierce: 4, speed: 1200, range: 680, proj: 'arrow' } });
  A(j, 'a2b_spread', '산탄 볼트', 'arrows', 'earth', 'proj', 150, 220, { cd: 1, atk: { count: 5, spread: 0.12, speed: 1000, range: 420, proj: 'arrow' } });
  B(j, 'a2b_aim', '조준', 'eye', 'earth', { crit: [15, 35] });
  P(j, 'a2b_mastery', '석궁 숙련', 'book', 'earth', { atk: [5, 20], critDmg: [5, 15] });
  j = 'archer_3b';
  A(j, 'a3b_snipe', '저격', 'arrows', 'earth', 'proj', 700, 950, { cd: 1.2, atk: { count: 1, speed: 1500, range: 950, proj: 'arrow' } });
  A(j, 'a3b_blast', '연쇄 폭발 볼트', 'burst', 'earth', 'proj', 300, 400, { atk: { count: 1, pierce: 8, speed: 1100, range: 720, proj: 'orb' } });
  A(j, 'a3b_shadow', '은신 사격', 'backshot', 'earth', 'back', 380, 500, { cd: 3, atk: { dist: 220, count: 1, pierce: 4, speed: 1200, range: 720, proj: 'arrow' } });
  P(j, 'a3b_focus', '저격수의 집중', 'book', 'earth', { crit: [5, 15], ignoreDef: [5, 20] });
  j = 'archer_4b';
  A(j, 'a4b_flash', '섬광 저격', 'arrows', 'earth', 'proj', 1400, 1900, { cd: 1.5, mp1: 25, mp2: 45, atk: { count: 1, pierce: 3, speed: 1700, range: 1050, proj: 'arrow' } });
  A(j, 'a4b_barrage', '섬광 탄막', 'arrows', 'earth', 'proj', 330, 450, { mp1: 25, mp2: 45, atk: { count: 6, spread: 0.08, speed: 1200, range: 700, proj: 'arrow' } });
  B(j, 'a4b_awake', '저격왕의 각성', 'eye', 'earth', { atkp: [10, 25], crit: [10, 20] }, { cd: 60, d1: 60, d2: 120, mp: 80 });
  P(j, 'a4b_mastery', '극한의 조준', 'book', 'earth', { critDmg: [15, 35], bossDmg: [5, 20] });

  // ===== 마법사 A: 화염술사 → 업화술사 → 화염군주 =====
  j = 'mage_2a';
  A(j, 'm2a_fireball', '화염구', 'orb', 'fire', 'proj', 300, 420, { atk: { count: 1, speed: 800, range: 540, proj: 'orb' } });
  A(j, 'm2a_explode', '화염 폭발', 'burst', 'fire', 'aoe', 220, 300, { cd: 2, atk: { w: 340, h: 170, targets: 8, hits: 2 } });
  B(j, 'm2a_veil', '화염 장막', 'barrier', 'fire', { atk: [10, 30] });
  P(j, 'm2a_mastery', '화염 숙련', 'book', 'fire', { atk: [5, 20], critDmg: [5, 15] });
  j = 'mage_3a';
  A(j, 'm3a_inferno', '업화', 'orb', 'fire', 'proj', 380, 500, { atk: { count: 1, pierce: 4, speed: 850, range: 600, proj: 'orb' } });
  A(j, 'm3a_pillar', '화염 기둥', 'rain', 'fire', 'rain', 330, 450, { cd: 3, atk: { count: 6, area: 400, ahead: 230, proj: 'orb' } });
  A(j, 'm3a_storm', '불꽃 폭풍', 'burst', 'fire', 'aoe', 230, 310, { cd: 4, atk: { w: 540, h: 170, targets: 10, hits: 3 } });
  P(j, 'm3a_heart', '업화의 심장', 'book', 'fire', { atkp: [5, 15], MPp: [5, 15] });
  j = 'mage_4a';
  A(j, 'm4a_lance', '화염군주의 창', 'orb', 'fire', 'proj', 450, 600, { mp1: 25, mp2: 45, atk: { count: 2, stagger: 14, pierce: 5, speed: 900, range: 700, proj: 'orb' } });
  A(j, 'm4a_blaze', '대화재', 'rain', 'fire', 'rain', 350, 470, { cd: 4, mp1: 35, mp2: 60, atk: { count: 12, area: 620, ahead: 240, proj: 'orb' } });
  B(j, 'm4a_awake', '화염군주의 각성', 'barrier', 'fire', { atkp: [10, 25], bossDmg: [10, 30] }, { cd: 60, d1: 60, d2: 120, mp: 100 });
  P(j, 'm4a_flame', '불멸의 불꽃', 'book', 'fire', { ignoreDef: [10, 30], critDmg: [10, 25] });

  // ===== 마법사 B: 빙뢰술사 → 폭풍술사 → 천둥의 현자 =====
  j = 'mage_2b';
  A(j, 'm2b_beam', '냉기 광선', 'orb', 'arcane', 'proj', 280, 380, { atk: { count: 1, pierce: 3, speed: 1000, range: 560, proj: 'orb' } });
  A(j, 'm2b_chain', '연쇄 번개', 'burst', 'arcane', 'aoe', 300, 400, { cd: 1.5, atk: { w: 420, h: 170, targets: 6, hits: 1 } });
  B(j, 'm2b_armor', '서리 갑옷', 'barrier', 'arcane', { def: [30, 100], barrier: [10, 30] }, { d1: 30, d2: 60, cd: 8 });
  P(j, 'm2b_mastery', '빙뢰 숙련', 'book', 'arcane', { atk: [5, 20], crit: [5, 10] });
  j = 'mage_3b';
  A(j, 'm3b_thunder', '썬더 스톰', 'rain', 'arcane', 'rain', 300, 400, { cd: 3, atk: { count: 8, area: 460, ahead: 230, proj: 'orb' } });
  A(j, 'm3b_freeze', '빙결 폭발', 'burst', 'arcane', 'aoe', 260, 350, { cd: 3, atk: { w: 500, h: 170, targets: 10, hits: 2 } });
  A(j, 'm3b_spear', '얼음 창', 'orb', 'arcane', 'proj', 360, 480, { atk: { count: 2, stagger: 12, pierce: 3, speed: 1000, range: 620, proj: 'orb' } });
  P(j, 'm3b_eye', '폭풍의 눈', 'book', 'arcane', { crit: [5, 15], atkp: [5, 12] });
  j = 'mage_4b';
  A(j, 'm4b_judge', '천둥의 심판', 'rain', 'arcane', 'rain', 330, 450, { cd: 4, mp1: 35, mp2: 60, atk: { count: 14, area: 640, ahead: 250, proj: 'orb' } });
  A(j, 'm4b_zero', '절대 영도', 'burst', 'arcane', 'aoe', 300, 400, { cd: 5, mp1: 35, mp2: 60, atk: { w: 720, h: 200, targets: 15, hits: 3 } });
  B(j, 'm4b_awake', '현자의 각성', 'barrier', 'arcane', { atkp: [10, 25], crit: [10, 20] }, { cd: 60, d1: 60, d2: 120, mp: 100 });
  P(j, 'm4b_wisdom', '현자의 지혜', 'book', 'arcane', { ignoreDef: [10, 30], bossDmg: [5, 20] });

  // ===== 도적 A: 암살자 → 그림자추적자 → 야천 =====
  j = 'thief_2a';
  A(j, 't2a_triple', '삼연 표창', 'star', 'shadow', 'proj', 180, 260, { atk: { count: 3, spread: 0.06, pierce: 1, speed: 950, range: 560, proj: 'star' } });
  A(j, 't2a_vital', '급소 찌르기', 'dagger2', 'shadow', 'melee', 200, 280, { atk: { w: 130, h: 90, targets: 2, hits: 3 } });
  B(j, 't2a_prep', '암살 준비', 'eye', 'shadow', { crit: [10, 25], critDmg: [10, 20] });
  P(j, 't2a_mastery', '표창 숙련', 'book', 'shadow', { atk: [5, 20], crit: [5, 10] });
  j = 'thief_3a';
  A(j, 't3a_shadowstar', '그림자 표창', 'star', 'shadow', 'proj', 230, 320, { atk: { count: 4, spread: 0.05, pierce: 2, speed: 1000, range: 600, proj: 'star' } });
  A(j, 't3a_flash', '암영 일섬', 'shadow', 'shadow', 'dash', 260, 350, { cd: 4, atk: { dist: 320, targets: 8, hits: 3, invuln: true } });
  A(j, 't3a_storm', '표창 폭풍', 'burst', 'shadow', 'aoe', 220, 300, { cd: 3, atk: { w: 440, h: 150, targets: 10, hits: 3 } });
  P(j, 't3a_instinct', '추적자의 본능', 'book', 'shadow', { critDmg: [10, 25], atkp: [5, 12] });
  j = 'thief_4a';
  A(j, 't4a_night', '야천 난무', 'star', 'shadow', 'proj', 280, 380, { mp1: 20, mp2: 40, atk: { count: 6, spread: 0.07, pierce: 2, speed: 1100, range: 660, proj: 'star' } });
  A(j, 't4a_dark', '칠흑의 밤', 'burst', 'shadow', 'aoe', 300, 400, { cd: 5, mp1: 35, mp2: 60, atk: { w: 720, h: 200, targets: 15, hits: 4 } });
  B(j, 't4a_awake', '야천의 각성', 'eye', 'shadow', { atkp: [10, 25], bossDmg: [10, 30] }, { cd: 60, d1: 60, d2: 120, mp: 80 });
  P(j, 't4a_mastery', '그림자 극의', 'book', 'shadow', { ignoreDef: [10, 30], critDmg: [10, 25] });

  // ===== 도적 B: 쌍검사 → 칼날무희 → 천인검무 =====
  j = 'thief_2b';
  A(j, 't2b_dance', '쌍검 난무', 'dagger2', 'poison', 'melee', 130, 190, { atk: { w: 140, h: 95, targets: 4, hits: 4 } });
  A(j, 't2b_whirl', '칼날 회오리', 'whirl', 'poison', 'aoe', 150, 220, { cd: 1.5, atk: { w: 310, h: 120, targets: 8, hits: 3, fx: 'whirl' } });
  B(j, 't2b_step', '무희의 걸음', 'eye', 'poison', { crit: [5, 20], atk: [5, 20] });
  P(j, 't2b_mastery', '쌍검 숙련', 'book', 'poison', { atk: [5, 20], critDmg: [5, 15] });
  j = 'thief_3b';
  A(j, 't3b_storm', '칼날 폭풍', 'whirl', 'poison', 'aoe', 170, 240, { cd: 2, atk: { w: 440, h: 140, targets: 10, hits: 4, fx: 'whirl' } });
  A(j, 't3b_mist', '섬광 연무', 'shadow', 'poison', 'dash', 190, 260, { cd: 4, atk: { dist: 300, targets: 8, hits: 4, invuln: true } });
  A(j, 't3b_blades', '춤추는 칼날', 'dagger2', 'poison', 'melee', 170, 240, { atk: { w: 190, h: 110, targets: 6, hits: 5 } });
  P(j, 't3b_rhythm', '무희의 리듬', 'book', 'poison', { atkp: [5, 15], crit: [5, 10] });
  j = 'thief_4b';
  A(j, 't4b_thousand', '천인검무', 'dagger2', 'poison', 'melee', 180, 250, { mp1: 20, mp2: 40, atk: { w: 290, h: 130, targets: 10, hits: 8 } });
  A(j, 't4b_tempest', '검무 폭풍', 'whirl', 'poison', 'aoe', 200, 280, { cd: 5, mp1: 35, mp2: 60, atk: { w: 680, h: 180, targets: 15, hits: 5, fx: 'whirl' } });
  B(j, 't4b_awake', '검무의 각성', 'eye', 'poison', { atkp: [10, 25], bossDmg: [10, 30] }, { cd: 60, d1: 60, d2: 120, mp: 80 });
  P(j, 't4b_mastery', '천인의 경지', 'book', 'poison', { ignoreDef: [10, 30], critDmg: [10, 25] });

  // ======================= 1.5 추가 스킬 (2차 +2, 3차 +2, 4차 +1 = 갈래마다 5개, 총 40개) =======================
  // 4차 추가 스킬은 각 직업의 궁극기 (재사용 12초)
  const ULT = { cd: 12, mp1: 60, mp2: 100 };
  // 전사 A (화염 · 대검)
  A('warrior_2a', 'w2a_blade', '화염 검기', 'slash', 'fire', 'proj', 220, 310, { cd: 1, atk: { count: 1, pierce: 3, speed: 900, range: 500, proj: 'orb' } });
  P('warrior_2a', 'w2a_endure', '강인함', 'book', 'fire', { HPp: [5, 15], def: [10, 50] });
  B('warrior_3a', 'w3a_roar', '전장의 포효', 'eye', 'fire', { atkp: [5, 15], crit: [5, 10] });
  A('warrior_3a', 'w3a_meteor', '낙염', 'rain', 'fire', 'rain', 260, 360, { cd: 3, atk: { count: 5, area: 400, ahead: 220, proj: 'orb' } });
  A('warrior_4a', 'w4a_final', '천붕멸겁', 'burst', 'fire', 'aoe', 400, 550, Object.assign({ atk: { w: 800, h: 220, targets: 15, hits: 6 } }, ULT));
  // 전사 B (신성 · 방패)
  A('warrior_2b', 'w2b_throw', '방패 투척', 'shield', 'holy', 'proj', 240, 330, { cd: 1, atk: { count: 1, pierce: 4, speed: 850, range: 480, proj: 'orb' } });
  P('warrior_2b', 'w2b_vigor', '기사의 체력', 'book', 'holy', { HPp: [5, 15], def: [10, 40] });
  B('warrior_3b', 'w3b_aura', '수호 오라', 'shield', 'holy', { def: [50, 150], atkp: [5, 15] });
  A('warrior_3b', 'w3b_light', '빛의 창', 'rain', 'holy', 'rain', 280, 380, { cd: 3, atk: { count: 5, area: 420, ahead: 220, proj: 'orb' } });
  A('warrior_4b', 'w4b_final', '불멸의 성광', 'burst', 'holy', 'aoe', 380, 520, Object.assign({ atk: { w: 800, h: 220, targets: 15, hits: 6 } }, ULT));
  // 궁수 A (바람)
  A('archer_2a', 'a2a_burst', '질풍 난사', 'arrows', 'wind', 'proj', 140, 200, { cd: 1, atk: { count: 5, spread: 0.1, speed: 1000, range: 450, proj: 'arrow' } });
  P('archer_2a', 'a2a_swift', '질풍 보법', 'book', 'wind', { mspd: [3, 10], aspd: [3, 10] });
  B('archer_3a', 'a3a_focus', '매의 집중', 'eye', 'wind', { critDmg: [10, 25], atkp: [5, 10] });
  A('archer_3a', 'a3a_dive', '급강하 화살', 'arrows', 'wind', 'proj', 400, 540, { cd: 2, atk: { count: 1, pierce: 8, speed: 1300, range: 800, proj: 'arrow' } });
  A('archer_4a', 'a4a_final', '천궁 폭풍우', 'rain', 'wind', 'rain', 300, 420, Object.assign({ atk: { count: 24, area: 760, ahead: 280 } }, ULT));
  // 궁수 B (대지 · 석궁)
  A('archer_2b', 'a2b_net', '후퇴 볼트', 'backshot', 'earth', 'back', 280, 380, { cd: 3, atk: { dist: 200, count: 1, pierce: 4, speed: 1100, range: 680, proj: 'arrow' } });
  P('archer_2b', 'a2b_steady', '안정된 자세', 'book', 'earth', { crit: [3, 10], ignoreDef: [3, 10] });
  B('archer_3b', 'a3b_mark', '표적 지정', 'eye', 'earth', { bossDmg: [10, 25], crit: [5, 10] });
  A('archer_3b', 'a3b_mine', '대지 폭뢰', 'rain', 'earth', 'rain', 300, 400, { cd: 3, atk: { count: 6, area: 420, ahead: 230, proj: 'orb' } });
  A('archer_4b', 'a4b_final', '섬광 섬멸', 'arrows', 'earth', 'proj', 2000, 2800, Object.assign({ atk: { count: 1, pierce: 15, speed: 1800, range: 1200, proj: 'arrow' } }, ULT));
  // 마법사 A (화염)
  A('mage_2a', 'm2a_meteor', '유성 낙하', 'rain', 'fire', 'rain', 240, 330, { cd: 2.5, atk: { count: 4, area: 360, ahead: 220, proj: 'orb' } });
  P('mage_2a', 'm2a_wisdom', '마력 증폭', 'book', 'fire', { MPp: [5, 15], atkp: [3, 8] });
  B('mage_3a', 'm3a_flare', '업화의 축복', 'barrier', 'fire', { atkp: [5, 15], critDmg: [5, 15] });
  A('mage_3a', 'm3a_ring', '화염 고리', 'burst', 'fire', 'aoe', 240, 330, { cd: 3, atk: { w: 460, h: 170, targets: 10, hits: 3 } });
  A('mage_4a', 'm4a_final', '태양 낙하', 'rain', 'fire', 'rain', 380, 520, Object.assign({ atk: { count: 20, area: 760, ahead: 260, proj: 'orb' } }, ULT));
  // 마법사 B (빙뢰)
  A('mage_2b', 'm2b_shard', '얼음 파편', 'orb', 'arcane', 'proj', 180, 250, { atk: { count: 3, spread: 0.08, speed: 950, range: 520, proj: 'orb' } });
  P('mage_2b', 'm2b_focus', '정신 집중', 'book', 'arcane', { MPp: [5, 15], crit: [3, 8] });
  B('mage_3b', 'm3b_storm', '폭풍의 가호', 'barrier', 'arcane', { atkp: [5, 15], crit: [5, 10] });
  A('mage_3b', 'm3b_bolt', '낙뢰', 'rain', 'arcane', 'rain', 330, 440, { cd: 2, atk: { count: 4, area: 380, ahead: 220, proj: 'orb' } });
  A('mage_4b', 'm4b_final', '천둥 신의 분노', 'burst', 'arcane', 'aoe', 380, 520, Object.assign({ atk: { w: 820, h: 230, targets: 15, hits: 6 } }, ULT));
  // 도적 A (그림자 · 표창)
  A('thief_2a', 't2a_shadow', '그림자 일격', 'shadow', 'shadow', 'dash', 200, 280, { cd: 3, atk: { dist: 260, targets: 6, hits: 2 } });
  P('thief_2a', 't2a_swift', '날렵함', 'book', 'shadow', { mspd: [3, 10], crit: [3, 8] });
  B('thief_3a', 't3a_veil', '그림자 장막', 'eye', 'shadow', { critDmg: [10, 25], atkp: [5, 10] });
  A('thief_3a', 't3a_rain', '표창 비', 'rain', 'shadow', 'rain', 240, 330, { cd: 3, atk: { count: 8, area: 440, ahead: 230, proj: 'star' } });
  A('thief_4a', 't4a_final', '야천 멸살', 'burst', 'shadow', 'aoe', 330, 460, Object.assign({ atk: { w: 820, h: 230, targets: 15, hits: 7 } }, ULT));
  // 도적 B (독 · 쌍검)
  A('thief_2b', 't2b_toss', '독 단검 투척', 'dagger2', 'poison', 'proj', 190, 260, { atk: { count: 2, stagger: 10, pierce: 2, speed: 950, range: 480, proj: 'star' } });
  P('thief_2b', 't2b_venom', '독 숙련', 'book', 'poison', { critDmg: [5, 15], atk: [3, 10] });
  B('thief_3b', 't3b_tempo', '검무 박자', 'eye', 'poison', { aspd: [5, 15], atkp: [5, 10] });
  A('thief_3b', 't3b_rain', '칼날 비', 'rain', 'poison', 'rain', 220, 300, { cd: 3, atk: { count: 8, area: 440, ahead: 230, proj: 'star' } });
  A('thief_4b', 't4b_final', '천인 난무', 'whirl', 'poison', 'aoe', 260, 360, Object.assign({ atk: { w: 820, h: 230, targets: 15, hits: 8, fx: 'whirl' } }, ULT));

  // 설명 자동 생성 (desc 가 없는 스킬)
  const statLine = o => Object.keys(o).map(k => G.statText(k, o[k])).join(', ');
  for (const sk of Object.values(G.SKILLS)) {
    if (sk.desc) continue;
    sk.desc = lv => {
      if (sk.type === 'passive') return `[패시브] ${statLine(sk.passive(lv))}`;
      if (sk.type === 'buff') return `${sk.buff.dur(lv)}초 동안 ${statLine(sk.buff.stats(lv))}${sk.cd > 1 ? ` (재사용 ${sk.cd}초)` : ''}`;
      const a = sk.atk, p = a.pct(lv), cd = sk.cd ? ` (재사용 ${sk.cd}초)` : '';
      const hits = a.hits > 1 ? ` × ${a.hits}` : '';
      switch (a.kind) {
        case 'melee': return `앞의 적 최대 ${a.targets}명에게 ${p}%${hits} 데미지.${cd}`;
        case 'aoe': return `주변 적 최대 ${a.targets}명에게 ${p}%${hits} 데미지.${cd}`;
        case 'proj': return `${a.count}발을 발사해 각각 ${p}% 데미지${a.pierce > 1 ? ` (최대 ${a.pierce}명 관통)` : ''}.${cd}`;
        case 'rain': return `앞쪽 넓은 범위에 ${a.count}발을 떨어뜨려 각각 ${p}% 데미지.${cd}`;
        case 'dash': return `돌진하며 최대 ${a.targets}명에게 ${p}%${hits} 데미지${a.invuln ? ', 이동 중 무적' : ''}.${cd}`;
        case 'back': return `뒤로 물러나며 관통 화살로 최대 ${a.pierce}명에게 ${p}% 데미지.${cd}`;
      }
      return '';
    };
  }
})();
