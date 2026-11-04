'use strict';
// 2장 ~ 종장 콘텐츠: 장비 단계, 세트, 물약, 몬스터, 보스, NPC, 맵
(function () {
  const { W, A, AC, U, Q } = G.ItemMake;

  // ======================= 장비 (Lv.30 ~ 90, 10레벨 단위) =======================
  const WEAP = { warrior: ['sword', '대검'], archer: ['bow', '장궁'], mage: ['wand', '지팡이'], thief: ['dagger', '단검'] };
  const TIERS = [
    [30, '미스릴', '#b8d0e8'], [40, '라그 강철', '#8a9ab0', 'rag'], [50, '사막의', '#d8b060'], [55, '사하린 왕조', '#e8c040', 'sahrin'],
    [60, '파라오의', '#f0d070'], [70, '서리용', '#9ad8ff', 'frost'], [80, '폭풍의', '#7a8ac8'], [85, '천공', '#c0d8ff', 'sky'], [90, '공허 수호자', '#8a5ac8'],
  ];
  const ARMOR = [['hat', '투구'], ['top', '갑옷'], ['bottom', '각반'], ['shoes', '장화'], ['gloves', '건틀릿'], ['cape', '망토']];
  for (const [lv, pre, color, set] of TIERS) {
    const st = Math.floor(lv / 15);
    for (const fam in WEAP) {
      const [type, noun] = WEAP[fam], main = G.JOBS[fam].main;
      if (lv % 10 === 0 || set === 'frost' || set === 'sky') W(`wp${lv}_${fam}`, `${pre} ${noun}`, type, fam, lv, color, { [main]: st * 2 }, set && set !== 'rag' && set !== 'sahrin' ? { set } : {});
    }
    const pieces = set === 'rag' || set === 'sahrin' ? ARMOR.slice(0, 5) : ARMOR;
    for (const [slot, noun] of pieces) A(`ar${lv}_${slot}`, `${pre} ${noun}`, slot, lv, color, { allStat: st }, set ? { set } : {});
  }
  for (const [lv, pre, color] of [[35, '은빛', '#d8e0ea'], [55, '황금', '#f0c840'], [75, '서리 수정', '#a8e0ff'], [95, '별빛', '#fff0a0']]) {
    const s = Math.floor(lv / 10);
    AC(`ac${lv}_earring`, `${pre} 귀걸이`, 'earring', lv, color, { allStat: s, atk: Math.floor(s / 2) });
    AC(`ac${lv}_ring`, `${pre} 반지`, 'ring', lv, color, { allStat: s, atk: Math.floor(s / 2) });
    AC(`ac${lv}_pendant`, `${pre} 펜던트`, 'pendant', lv, color, { allStat: s, HP: lv * 8 });
    AC(`ac${lv}_belt`, `${pre} 벨트`, 'belt', lv, color, { allStat: s, HP: lv * 8 });
  }
  // 별조각 계승자 세트는 녹스가 떨어뜨린다
  for (const id of Object.keys(G.ITEMS)) if (id.startsWith('trial_')) G.ITEMS[id].noDrop = true;

  Object.assign(G.SETS, {
    rag: { name: '라그 강철 세트', pieces: ['ar40_hat', 'ar40_top', 'ar40_bottom', 'ar40_shoes', 'ar40_gloves'],
           bonus: { 2: { def: 50 }, 3: { HPp: 5 }, 4: { allStat: 15 }, 5: { atk: 25, bossDmg: 5 } } },
    sahrin: { name: '사하린 왕조 세트', pieces: ['ar55_hat', 'ar55_top', 'ar55_bottom', 'ar55_shoes', 'ar55_gloves'],
              bonus: { 2: { HP: 500 }, 3: { allStat: 20 }, 4: { def: 80 }, 5: { atk: 35, bossDmg: 10 } } },
    frost: { name: '서리용 세트', pieces: ['ar70_hat', 'ar70_top', 'ar70_bottom', 'ar70_shoes', 'ar70_gloves', 'ar70_cape', 'wp70_warrior|wp70_archer|wp70_mage|wp70_thief'],
             bonus: { 2: { allStat: 20 }, 3: { HPp: 8 }, 4: { atk: 30 }, 5: { def: 100 }, 6: { ignoreDef: 10 }, 7: { label: '서리의 숨결', critDmg: 10, sfx: { id: 'freeze', p: 5, v: 2 } } } },
    sky: { name: '천공 세트', pieces: ['ar85_hat', 'ar85_top', 'ar85_bottom', 'ar85_shoes', 'ar85_gloves', 'ar85_cape', 'wp85_warrior|wp85_archer|wp85_mage|wp85_thief'],
           bonus: { 2: { allStat: 30 }, 3: { HPp: 10 }, 4: { atk: 40 }, 5: { atkp: 4 }, 6: { bossDmg: 15 }, 7: { label: '천공의 날개', aspd: 8, mspd: 10 } } },
  });

  // ======================= 물약 / 퀘스트 아이템 =======================
  U('pot_hp4', '생명수', 'potion', '#ff6a8a', 400, { hp: 800 }, 'HP를 800 회복한다.');
  U('pot_hp5', '별빛 생명수', 'potion', '#ffd46a', 1000, { hp: 2000 }, 'HP를 2000 회복한다.');
  U('pot_mp3', '달빛 이슬', 'potion', '#a8b8ff', 300, { mp: 500 }, 'MP를 500 회복한다.');
  U('pot_mp4', '별이슬', 'potion', '#c8a8ff', 700, { mp: 1200 }, 'MP를 1200 회복한다.');
  const QI = [
    ['q_herb', '은빛 약초', 'jelly', '#a8e0a0'], ['q_carapace', '가시 껍질', 'shell', '#5a7a3a'], ['q_venom', '거미 독주머니', 'spore', '#8a5aa0'],
    ['q_helmet', '광부의 헬멧', 'hat', '#c0a040'], ['q_key', '감옥 열쇠', 'gear', '#e0c060'], ['q_spring', '정밀 태엽', 'gear', '#a0b0c0'],
    ['q_bell', '낙타 방울', 'pearl', '#e0c060'], ['q_tablet', '고대 석판', 'scroll', '#c8b890'], ['q_inscr', '영웅의 비문 조각', 'cloth', '#d8c890'],
    ['q_frost', '서리 결정', 'shard', '#bfe6ff'], ['q_stardust', '별가루', 'pearl', '#fff0a0'], ['q_record', '교단의 기록', 'scroll', '#5a2a7a'],
    ['star_life', '생명의 별조각', 'shard', '#7de08a'], ['star_earth', '대지의 별조각', 'shard', '#d8a860'], ['star_sun', '태양의 별조각', 'shard', '#ffd040'],
    ['star_ice', '얼음의 별조각', 'shard', '#a8e0ff'], ['star_sky', '하늘의 별조각', 'shard', '#c0c8ff'], ['star_void', '공허의 별조각', 'shard', '#b080ff'],
  ];
  for (const [id, name, icon, color] of QI) Q(id, name, icon, color, id.startsWith('star_') ? '일곱 별조각 중 하나. 손등의 문양과 공명한다.' : '퀘스트에 필요한 물건.');

  // ======================= 몬스터 =======================
  const M = (id, name, lv, shape, c1, c2, w, h, speed, o = {}) => { G.MONSTERS[id] = Object.assign({ name, lv, kind: 'normal', shape, color: c1, color2: c2, w, h, speed }, o); };
  // 2장
  M('moss_slime', '이끼 덩어리', 20, 'blob', '#6aa84f', '#38761d', 46, 36, 45, { quest: ['q_herb'] });
  M('thorn_beetle', '가시 딱정벌레', 22, 'crab', '#5a7a3a', '#2a4a1a', 56, 40, 70, { quest: ['q_carapace'] });
  M('cave_spider', '동굴 거미', 24, 'crab', '#4a3a5a', '#2a1a3a', 58, 38, 95, { aggressive: true, quest: ['q_venom'] });
  M('web_bat', '거미줄 박쥐', 25, 'spirit', '#6a5a7a', '#3a2a4a', 44, 44, 80, { flying: true });
  M('swamp_toad', '늪 두꺼비', 27, 'blob', '#5a8a5a', '#2a5a2a', 54, 40, 50);
  M('firefly_spirit', '반딧불 정령', 28, 'spirit', '#e8f070', '#a0b030', 40, 44, 70, { flying: true });
  // 3장
  M('mine_rat', '광산 쥐', 31, 'rat', '#7a6a5a', '#4a3a2a', 52, 32, 120);
  M('rock_golem', '폐광 바위웜', 33, 'golem', '#8a7462', '#3e3028', 80, 44, 40, { quest: ['q_helmet'] });
  M('fire_imp', '용광로 도롱뇽', 36, 'blob', '#7e5a5e', '#ff7a24', 90, 48, 70);
  M('magma_slime', '용암 웅덩이', 38, 'blob', '#ff7a24', '#c03a10', 58, 44, 50, { quest: ['q_key'] });
  M('clockwork', '태엽 병사', 41, 'bandit', '#8a8aa0', '#4a4a5a', 40, 66, 90, { aggressive: true });
  M('drone', '감시 드론', 43, 'spirit', '#a0b0c0', '#5a6a7a', 44, 40, 100, { flying: true, ranged: true, quest: ['q_spring'] });
  M('foreman', '광석 거인', 42, 'golem', '#8e7e84', '#ffc83a', 96, 110, 40, { kind: 'elite', aggressive: true });
  // 4장
  M('sand_lizard', '모래 도마뱀', 46, 'lizard', '#d0a860', '#8a6a30', 74, 36, 100, { aggressive: true });
  M('dune_bison', '사막 들소', 48, 'boar', '#a07040', '#6a4020', 80, 56, 95, { quest: ['q_bell'] });
  M('canyon_scorpion', '협곡 전갈', 51, 'crab', '#c04a2a', '#7a2a10', 64, 42, 90, { aggressive: true });
  M('vulture', '사막 독수리', 53, 'spirit', '#8a6a4a', '#5a3a2a', 50, 44, 110, { flying: true });
  M('mummy', '미라', 56, 'bandit', '#d8d0b0', '#a09a80', 40, 66, 70, { aggressive: true, quest: ['q_tablet'] });
  M('sand_spirit', '모래 정령', 58, 'spirit', '#f0d080', '#c0a040', 46, 50, 80, { flying: true, quest: ['q_inscr'] });
  M('scorpion_king', '사막 전갈왕', 57, 'crab', '#ff6a2a', '#8a2a0a', 110, 70, 70, { kind: 'elite', aggressive: true });
  // 5장
  M('snow_wolf', '설원 늑대', 61, 'boar', '#e8eef8', '#a0b0c8', 74, 50, 130, { aggressive: true });
  M('frost_bat', '서리 박쥐', 63, 'spirit', '#a0d8ff', '#5a9ad0', 44, 44, 100, { flying: true });
  M('ice_crab', '오로라뿔 사슴', 66, 'boar', '#f2f7ff', '#9fb4dc', 70, 78, 70, { quest: ['q_frost'] });
  M('yeti', '설원의 파수꾼', 68, 'golem', '#b6c6e0', '#56698f', 64, 90, 60, { aggressive: true });
  M('ice_golem', '서리 거인', 71, 'golem', '#bfe6ff', '#5a8ac0', 64, 92, 50);
  M('frost_wraith', '서리 망령', 73, 'spirit', '#c8e8ff', '#7aa8d0', 48, 56, 90, { flying: true });
  M('frost_giant', '서리비늘 골렘', 72, 'golem', '#8fa5c8', '#4d6390', 90, 130, 45, { kind: 'elite', aggressive: true });
  // 6장
  M('cloud_sheep', '하늘 여우', 76, 'blob', '#f7f7ff', '#9097dc', 70, 64, 50);
  M('sky_fairy', '날개 구름양', 78, 'spirit', '#e9ebff', '#9097dc', 64, 52, 100, { flying: true });
  M('storm_golem', '폭풍 골렘', 81, 'golem', '#7a8aa0', '#3a4a60', 64, 92, 50, { aggressive: true });
  M('thunder_bird', '천공의 부엉이', 83, 'spirit', '#b8bff4', '#9097dc', 60, 60, 120, { flying: true, ranged: true, proj: 'feather' });
  M('star_knight', '별의 기사', 86, 'bandit', '#c0c8e0', '#6a7090', 42, 68, 100, { aggressive: true });
  M('comet_spirit', '별자리 깃새', 88, 'spirit', '#2e3a90', '#c9a640', 70, 56, 110, { flying: true, quest: ['q_stardust'] });
  M('storm_guardian', '뇌운 거인', 87, 'golem', '#9fb0dc', '#4d5c94', 90, 130, 50, { kind: 'elite', aggressive: true });
  // 종장
  M('void_shade', '공허의 그림자', 91, 'spirit', '#3a2a5a', '#1a0a2a', 48, 56, 100, { flying: true, aggressive: true });
  M('rift_beast', '균열 거미', 93, 'boar', '#46295f', '#ff6fd8', 80, 52, 120, { aggressive: true });
  M('dark_knight', '공허의 감시안', 95, 'spirit', '#4a2470', '#e070ff', 56, 56, 110, { flying: true, aggressive: true, quest: ['q_record'] });
  M('cult_mage', '장막의 사제', 96, 'spirit', '#4a2a6e', '#e070ff', 44, 72, 70, { ranged: true, proj: 'darkorb' });
  M('void_serpent', '공허 성기사', 98, 'bandit', '#433660', '#ff6fd8', 56, 96, 110, { aggressive: true });
  M('abyss_eye', '녹스의 전령', 99, 'spirit', '#3a2456', '#c080ff', 52, 84, 90, { flying: true, ranged: true, proj: 'darkorb' });
  M('executor', '그림자 집행관', 97, 'bandit', '#3e3058', '#e060ff', 70, 118, 90, { kind: 'elite', big: true, aggressive: true });
  M('trial_echo', '영웅의 잔영', 97, 'echo', '#7ab8ff', '#3a5aa0', 42, 68, 120, { kind: 'elite', aggressive: true, sight: 2000 });
  // 보스전 소환물
  M('rot_fruit', '썩은 열매', 30, 'spore', '#8a4a2a', '#4a2a1a', 40, 40, 0, { kind: 'minion', harmless: true, noLoot: true, chainPillar: true, noKb: true, hpMul: 0.3 });
  M('mummy_guard', '미라 근위대', 60, 'bandit', '#e8e0c0', '#b0a880', 40, 66, 90, { kind: 'minion', aggressive: true, noLoot: true, chainPillar: true, hpMul: 0.5 });
  M('kaien_clone', '카이엔의 분신', 75, 'kaien', '#2a2a4a', '#14141e', 42, 70, 130, { kind: 'minion', aggressive: true, noLoot: true, hpMul: 0.4, clone: true });
  M('corrupt_shard', '타락한 별조각', 90, 'pillar', '#c03050', '#5a1020', 50, 110, 0, { kind: 'minion', harmless: true, noLoot: true, noKb: true, chainPillar: true, hpMul: 0.3 });
  // 보스
  const drops = (n, s30, pool, weapons, pity) => [{ scrolls: n, s30 }, { pool, ch: 0.7 }, { pool: weapons, ch: 0.5, pity }, { id: 'cube', ch: 0.5 }, { goldBag: 8, ch: 0.6 }];
  const wp = lv => Object.keys(WEAP).map(f => `wp${lv}_${f}`);
  M('morwen', '오염된 숲의 정령 모르웬', 30, 'spirit', '#5a8a3a', '#2a4a1a', 150, 170, 40, { kind: 'boss', ai: 'morwen',
    bossDrops: drops(5, 22, ['elen_hat', 'elen_top', 'elen_bottom', 'elen_shoes', 'elen_gloves'], wp(30)) });
  M('grounder', '강철 거신 그라운더 MK-7', 45, 'golem', '#8a8a9a', '#4a4a5a', 130, 190, 40, { kind: 'boss', ai: 'grounder',
    bossDrops: drops(5, 25, G.SETS.rag.pieces, wp(40)) });
  M('parakan', '사막 폭군 파라칸', 60, 'bandit', '#d8b040', '#7a5a10', 70, 112, 70, { kind: 'boss', big: true, ai: 'parakan',
    bossDrops: drops(6, 28, G.SETS.sahrin.pieces, wp(60)) });
  M('kaien_boss', '교단 간부 카이엔', 75, 'kaien', '#2a2a4a', '#14141e', 54, 92, 110, { kind: 'boss', ai: 'kaien', retreatAt: 0.3,
    bossDrops: drops(6, 30, ['ar70_hat', 'ar70_top', 'ar70_bottom', 'ar70_shoes', 'ar70_gloves', 'ar70_cape'], wp(70), 'frost_weapon') });
  // 1.7.2: 천공 성소 1단계 보스. 쓰러지면 엘드리크(next)가 나온다. 보상은 엘드리크가 준다
  M('aurelion', '천공룡 아우렐리온', 89, 'golem', '#ece9ff', '#7a72c4', 200, 180, 70, { kind: 'boss', ai: 'aurelion', noLoot: true, next: 'eldrick', hpMul: 0.55 });
  M('eldrick', '장막의 대사제 엘드리크', 90, 'priest', '#4a2a7a', '#1a0a3a', 64, 118, 60, { kind: 'boss', ai: 'eldrick',
    bossDrops: drops(7, 35, ['ar85_hat', 'ar85_top', 'ar85_bottom', 'ar85_shoes', 'ar85_gloves', 'ar85_cape'], wp(85), 'sky_weapon') });   // 1.5: Lv.90 일반 무기 제외 → 천공 무기 50%
  G.MONSTERS.nox.bossDrops = [{ scrolls: 8, s30: 40 }, { pool: ['trial_hat', 'trial_top', 'trial_bottom', 'trial_shoes', 'trial_gloves', 'trial_cape'], ch: 1 },
    { pool: ['trial_sword', 'trial_bow', 'trial_wand', 'trial_dagger'], ch: 1 }, { pool: ['trial_earring', 'trial_ring', 'trial_pendant', 'trial_belt'], ch: 1 }];

  // ======================= 보스 패턴 =======================
  Object.assign(G.BOSSES, {
    morwen: {
      speed: 40, gap: [1.4, 2.4],
      phases: [{ hp: 1, name: '오염된 정령', patterns: ['roots', 'spores'] },
               { hp: 0.5, name: '광기', shout: '모르웬: 숲이... 숲이 아파...!', patterns: ['roots', 'spores', 'drain', 'fruit'] }],
      patterns: [
        { id: 'roots', name: '뿌리 솟구침', type: 'hands', count: 3, gapT: 0.45, warn: 1.0, w: 100, dmg: 18, cd: 4, weight: 3 },
        { id: 'spores', name: '포자 구름', type: 'half', dur: 6, dmg: 4, cd: 9, weight: 2, shout: '포자 구름이 퍼진다! 반대편으로!' },
        { id: 'drain', name: '생명 흡수', type: 'pull', dur: 3, force: 160, dmg: 10, cd: 10, weight: 2, shout: '덩굴이 생명을 빨아들인다! 반대로 달려라!' },
        { id: 'fruit', name: '썩은 열매', type: 'chain', mon: 'rot_fruit', count: 3, dur: 4, guard: false, failHeal: 10, cd: 14, weight: 1, shout: '썩은 열매가 맺혔다! 터지기 전에 부숴라!' },
      ],
    },
    grounder: {
      speed: 45, gap: [1.4, 2.2],
      patterns: [
        { id: 'drill', name: '드릴 팔', type: 'melee', warn: 0.8, w: 180, h: 120, dmg: 30, cd: 3, weight: 3 },
        { id: 'steam', name: '압축 증기', type: 'melee', warn: 1.0, w: 620, h: 80, dmg: 25, cd: 6, weight: 2, shout: '배기구가 달아오른다! 위층 발판으로!' },
        { id: 'rocks', name: '낙석 유도', type: 'hands', count: 6, gapT: 0.18, warn: 1.1, w: 90, dmg: 15, cd: 7, weight: 2 },
        { id: 'heat', name: '과열', type: 'overheat', dur: 10, groggy: 5, cd: 25, weight: 1, shout: '과열! 10초 동안 공격력 2배, 이후 그로기!' },
      ],
    },
    parakan: {
      speed: 70, gap: [1.2, 2.0],
      phases: [{ hp: 1, name: '사막의 왕', patterns: ['storm', 'curse', 'guards'] },
               { hp: 0.6, name: '태양의 분노', shout: '파라칸: 태양 아래 무릎 꿇어라!', patterns: ['storm', 'curse', 'guards', 'quicksand', 'sun'] }],
      patterns: [
        { id: 'storm', name: '모래 폭풍', type: 'pull', dur: 4, force: -200, dmg: 6, cd: 9, weight: 2, shout: '모래 폭풍이 밀어낸다!' },
        { id: 'curse', name: '왕의 저주', type: 'curse', dur: 8, cd: 16, weight: 1, shout: '왕의 저주! 8초 동안 물약 사용 불가' },
        { id: 'guards', name: '미라 근위대', type: 'chain', mon: 'mummy_guard', count: 4, dur: 15, guard: true, failDmg: 20, cd: 24, weight: 1, shout: '"나의 근위대여!" 근위대를 쓰러뜨려야 파라칸을 공격할 수 있다' },
        { id: 'quicksand', name: '유사 지옥', type: 'half', dur: 5, dmg: 5, ground: true, cd: 11, weight: 2, shout: '바닥이 꺼진다! 위층 발판으로!' },
        { id: 'sun', name: '태양의 심판', type: 'doom', warn: 3, zones: 2, failDmg: 80, cd: 22, weight: 1, shout: '태양의 심판! 그림자 진 안전지대로!' },
      ],
    },
    kaien: {
      speed: 110, gap: [1.0, 1.8],
      patterns: [
        { id: 'blink', name: '그림자 이동', type: 'teleport', warn: 0.5, w: 140, h: 100, dmg: 20, cd: 4, weight: 3 },
        { id: 'waves', name: '장막의 칼날', type: 'waves', count: 3, gapT: 0.35, speed: 600, dmg: 15, cd: 6, weight: 2 },
        { id: 'clones', name: '분신', type: 'summon', mon: 'kaien_clone', count: 2, max: 2, cd: 16, weight: 1, shout: '카이엔: 어느 쪽이 진짜일까?' },
        { id: 'breath', name: '서리 오염', type: 'cut', count: 1, warn: 1.3, dmg: 40, cd: 9, weight: 2, shout: '카이엔이 서리용을 조종한다! 얼음 숨결을 피해라!' },
      ],
    },
    // 1.7.2 천공룡 아우렐리온: 별의 포효 · 천공 돌풍 · 일곱 별 낙하, 체력 50%에서 천공 비상(1회)
    aurelion: {
      speed: 70, gap: [1.3, 2.1],
      phases: [{ hp: 1, name: '천공룡', patterns: ['roar', 'gust', 'starfall'] },
               { hp: 0.5, name: '천공 비상', shout: '아우렐리온이 하늘로 날아올랐다!', start: 'soar', patterns: ['roar', 'gust', 'starfall'] }],
      patterns: [
        { id: 'roar', name: '별의 포효', type: 'nova', w: 460, h: 220, warn: 1.2, dmg: 32, cd: 8, weight: 2, shout: '별의 포효! 표시된 곳 밖으로 피해라!' },
        { id: 'gust', name: '천공 돌풍', type: 'waves', proj: 'gust', ys: [30, 30, 30], count: 3, gapT: 0.75, speed: 430, dmg: 24, cd: 7, weight: 2, shout: '천공 돌풍! 점프로 넘어라!' },
        { id: 'starfall', name: '일곱 별 낙하', type: 'hands', fx: 'starfall', count: 7, gapT: 0.35, warn: 1.0, w: 100, dmg: 28, cd: 7, weight: 3 },
        { id: 'soar', name: '천공 비상', type: 'chain', mon: 'corrupt_shard', count: 3, dur: 12, guard: true, fly: true, failDmg: 60, failName: '별빛 숨결', successGroggy: 4, cd: 999, weight: 1,
          shout: '아우렐리온을 조종하는 타락한 별조각! 12초 안에 모두 부숴라!' },
      ],
    },
    eldrick: {
      speed: 60, gap: [1.2, 2.0],
      phases: [{ hp: 1, name: '대사제', patterns: ['chains', 'silence', 'skyfall'] },
               { hp: 0.7, name: '타락한 별', shout: '엘드리크: 별조각은 교단의 것이다!', patterns: ['chains', 'silence', 'shards', 'skyfall'] },
               { hp: 0.35, name: '공허 강림', shout: '엘드리크: 녹스 님이시여, 힘을!', patterns: ['chains', 'shards', 'invert', 'skyfall', 'cut'] }],
      patterns: [
        { id: 'chains', name: '별빛 사슬', type: 'pull', dur: 5, force: 200, dmg: 6, cd: 10, weight: 2, shout: '별빛 사슬이 끌어당긴다!' },
        { id: 'silence', name: '침묵의 성가', type: 'silence', dur: 6, cd: 15, weight: 1, shout: '침묵의 성가! 6초 동안 스킬 사용 불가' },
        { id: 'shards', name: '타락한 별조각', type: 'chain', mon: 'corrupt_shard', count: 4, dur: 10, guard: false, failDmg: 100, cd: 26, weight: 1, shout: '타락한 별조각! 10초 안에 모두 부숴라!' },
        { id: 'skyfall', name: '천공 낙하', type: 'hands', count: 5, gapT: 0.3, warn: 1.0, w: 110, dmg: 30, cd: 6, weight: 3 },
        { id: 'invert', name: '공허 강림', type: 'invert', dur: 4, cd: 14, weight: 1, shout: '공허 강림! 좌우 조작이 뒤바뀐다!' },
        { id: 'cut', name: '공허 절단', type: 'cut', count: 2, warn: 1.4, dmg: 40, cd: 8, weight: 2 },
      ],
    },
  });

  // ======================= NPC =======================
  const N = (id, name, title, look, o = {}) => { G.NPCS[id] = Object.assign({ name, title, look, greet: o.greet || ['...'] }, o); };
  const potShop = tier => ['pot_red', 'pot_orange', 'pot_white', 'pot_hp4', 'pot_hp5'].slice(0, 3 + tier).concat(['pot_blue', 'pot_elixir', 'pot_mp3', 'pot_mp4'].slice(0, 2 + tier), ['scroll_town', 'scroll_tele', 'scroll_100', 'flame', 'cube']);
  const eqShop = lvs => {
    const out = [];
    for (const lv of lvs) {
      for (const f in WEAP) if (G.ITEMS[`wp${lv}_${f}`]) out.push(`wp${lv}_${f}`);
      for (const [slot] of ARMOR) if (G.ITEMS[`ar${lv}_${slot}`] && !G.ITEMS[`ar${lv}_${slot}`].set) out.push(`ar${lv}_${slot}`);
    }
    return out;
  };
  N('trav', '여행 안내원', '마을 간 이동', { hair: '#5a4a3a', top: '#3a6a9a', bottom: '#2a3a5a', style: 'short', hat: '#3a5a8a' },
    { travel: 'all', greet: ['어디로 모실까요? 가 본 마을이라면 어디든 안내해 드리죠.'] });
  // 엘렌하임
  N('silian', '실리안', '엘프 여왕', { hair: '#e8f0d0', top: '#4aa86a', bottom: '#2a6a4a', style: 'long', gender: 'f', eye: 'big', eyeColor: '#2a8a4a', hat: '#e8d070' }, { greet: ['은빛숲은 오래도록 별의 노래를 지켜 왔어요.'] });
  N('seren', '세렌', '각성 Ⅱ관', { hair: '#c0d8f0', top: '#5a7ab0', bottom: '#2a3a6a', style: 'pony', gender: 'f' }, { greet: ['더 깊은 길을 걷고 싶다면, 레벨 30에 다시 오세요.'] });
  N('pio', '피오', '약초사', { hair: '#8ac860', top: '#a8c870', bottom: '#5a7a3a', style: 'short' }, { greet: ['숲의 약초는 상처도 마음도 치유하지.'] });
  N('kaien', '카이엔', '떠돌이 검사', { hair: '#1a1a2a', top: '#3a3a5a', bottom: '#1a1a2a', style: 'side', eye: 'sharp' }, { greet: ['...별조각이라. 흥미롭군.'] });
  N('orn', '오른', '대장장이', { hair: '#a05a2a', top: '#6a4a3a', bottom: '#3a2a1a', style: 'bald', beard: true }, { shop: eqShop([30]).concat(['ac35_earring', 'ac35_ring', 'ac35_pendant', 'ac35_belt']), greet: ['좋은 쇠는 좋은 불에서 나오지.'] });
  N('elin', '엘린', '잡화상', { hair: '#f0e0a0', top: '#e0a0c0', bottom: '#8a5a7a', style: 'twin', gender: 'f' }, { shop: potShop(1), greet: ['숲의 이슬로 만든 물약이에요!'] });
  // 라그하르트
  N('volga', '볼가', '광산조합장', { hair: '#5a3a2a', top: '#7a5a3a', bottom: '#4a3a2a', style: 'short', beard: true, hat: '#c0a040' }, { greet: ['광산은 이 도시의 심장이야.'] });
  N('zen', '젠', '노동자 대표', { hair: '#2a2a2a', top: '#8a6a4a', bottom: '#4a3a2a', style: 'spiky' }, { greet: ['동료들을 꼭 찾아야 해.'] });
  N('tiko', '티코', '발명가', { hair: '#e07a3a', top: '#c0c0c8', bottom: '#5a5a6a', style: 'spiky', eye: 'big' }, { greet: ['언젠가 하늘을 나는 기계를 만들 거야!'] });
  N('kaien_rag', '카이엔', '떠돌이 검사', G.NPCS.kaien.look, { greet: ['교단 놈들의 공방은 경비가 삼엄해.'] });
  N('rag_smith', '브론', '무기·방어구 상인', { hair: '#3a3a3a', top: '#5a5a62', bottom: '#3a3a42', style: 'short', beard: true }, { shop: eqShop([40]) });
  N('rag_shop', '미라벨', '잡화상', { hair: '#a05a8a', top: '#c08aa0', bottom: '#5a3a4a', style: 'bob', gender: 'f' }, { shop: potShop(1) });
  // 사하린
  N('azar', '아자르', '사막 부족장', { hair: '#2a1a0a', top: '#e8d0a0', bottom: '#8a6a3a', style: 'short', beard: true, hat: '#f0f0e0' }, { greet: ['모래는 모든 것을 기억한다네.'] });
  N('hakim', '하킴', '상단 대장', { hair: '#3a2a1a', top: '#c08a4a', bottom: '#6a4a2a', style: 'short', hat: '#e0c080' }, { greet: ['이 사막을 건너려면 호위가 필요해.'] });
  N('meirin', '메이린', '고고학자', { hair: '#3a2a4a', top: '#d8c8a0', bottom: '#7a6a4a', style: 'bun', gender: 'f', eye: 'big' }, { greet: ['고대 문자는 거짓말을 하지 않아요.'] });
  N('sah_smith', '자파르', '무기·방어구 상인', { hair: '#2a2a2a', top: '#a07040', bottom: '#5a3a2a', style: 'bald', beard: true }, { shop: eqShop([50, 60]).concat(['ac55_earring', 'ac55_ring', 'ac55_pendant', 'ac55_belt']) });
  N('sah_shop', '라일라', '잡화상', { hair: '#1a1a1a', top: '#e0b060', bottom: '#8a5a2a', style: 'long', gender: 'f' }, { shop: potShop(2) });
  // 프로스트벨
  N('valeria', '발레리아', '얼음성채 성주', { hair: '#e8f0ff', top: '#5a7ab0', bottom: '#2a3a6a', style: 'long', gender: 'f', hat: '#bfe6ff' }, { greet: ['이 성채는 북쪽의 마지막 방벽이에요.'] });
  N('artel', '아르텔', '각성 Ⅲ관 · 빙하의 현자', { hair: '#ffffff', top: '#7aa8d0', bottom: '#3a5a8a', style: 'long', beard: true, hat: '#5a7ab0' }, { greet: ['극한의 추위가 극한의 힘을 만든다네. 레벨 60에 오게.'] });
  N('aurelion_npc', '아우렐리온', '천공룡', { hair: '#ece9ff', top: '#c3bdf0', bottom: '#7a72c4', style: 'long', eye: 'sharp', eyeColor: '#d8a830' },
    { greet: ['고맙다, 작은 별이여. 하이델은... 아직 북쪽에 있는가.', '500년 전, 우리 두 용은 일곱 영웅과 함께 날았지. 이 은혜는 잊지 않겠다.'] });
  N('heidel', '하이델', '서리용', { hair: '#bfe6ff', top: '#8ac8ff', bottom: '#5a9ad0', style: 'spiky', eye: 'sharp', eyeColor: '#3a7ac0' }, { greet: ['(거대한 용이 인간의 모습으로 당신을 바라본다) 작은 별이여.'] });
  N('rok', '로크', '사냥꾼', { hair: '#6a4a2a', top: '#8a6a4a', bottom: '#4a3a2a', style: 'short', hat: '#7a5a3a' }, { greet: ['형이 아직 돌아오지 않았어...'] });
  N('fro_smith', '그림', '무기·방어구 상인', { hair: '#c0c0c0', top: '#6a7a8a', bottom: '#3a4a5a', style: 'short', beard: true }, { shop: eqShop([60]).concat(['ac75_earring', 'ac75_ring', 'ac75_pendant', 'ac75_belt']) });
  N('fro_shop', '눈송이', '잡화상', { hair: '#ffffff', top: '#bfe6ff', bottom: '#7aa8d0', style: 'twin', gender: 'f' }, { shop: potShop(2) });
  // 아에로스
  N('orion', '오리온', '대현자', { hair: '#f0f0f0', top: '#3a3a8a', bottom: '#1a1a5a', style: 'long', beard: true, hat: '#2a2a6a' }, { greet: ['별은 언제나 제자리에 있다네. 길을 잃는 건 우리지.'] });
  N('oriel', '오리엘', '각성 Ⅳ관 · 별의 기사', { hair: '#ffe680', top: '#e0e8ff', bottom: '#8a9ac8', style: 'side', eye: 'sharp' }, { greet: ['최후의 길은 레벨 85에 열린다.'] });
  N('yuna', '유나', '별지기 소녀', { hair: '#c0a0ff', top: '#fff0f8', bottom: '#a080d0', style: 'twin', gender: 'f', eye: 'big' }, { greet: ['밤하늘의 별은 전부 내 친구야!'] });
  N('kaien_sky', '카이엔', '돌아온 검사', G.NPCS.kaien.look, { greet: ['...면목이 없다.'] });
  N('aer_smith', '세라핀', '무기·방어구 상인', { hair: '#e0e0ff', top: '#a0b0e0', bottom: '#5a6a9a', style: 'pony', gender: 'f' }, { shop: eqShop([80, 90]).concat(['ac95_earring', 'ac95_ring', 'ac95_pendant', 'ac95_belt']) });
  N('aer_shop', '루시', '잡화상', { hair: '#ffd0e0', top: '#ffffff', bottom: '#c0c8e8', style: 'bob', gender: 'f' }, { shop: potShop(2) });
  // 녹스게이트
  N('elma_nox', '엘마', '영웅의 후손', G.NPCS.elma.look, { greet: ['당신과 함께라면 무섭지 않아요.'] });
  N('kaien_nox', '카이엔', '동료', G.NPCS.kaien.look, { greet: ['이번엔 등 뒤를 맡겨도 좋다.'] });
  N('astra', '아스트라', '첫 번째 영웅의 잔영', { hair: '#e8f4ff', top: '#7ab8ff', bottom: '#3a5aa0', style: 'long', eye: 'sharp', eyeColor: '#bfe6ff' }, { greet: ['우리가 끝내지 못한 일을, 네가 끝내 다오.'] });
  N('nox_shop', '그림자 상인', '보급 담당', { hair: '#3a2a5a', top: '#2a2a3a', bottom: '#14141e', style: 'short', hat: '#1a1a2a' }, { shop: potShop(2) });

  // ======================= 맵 =======================
  const LAYOUT = [
    [[320, 470, 380], [900, 370, 280], [1450, 470, 420], [2000, 380, 300]],
    [[350, 470, 400], [950, 360, 300], [1550, 470, 420], [2150, 370, 320]],
    [[300, 470, 360], [820, 350, 300], [1350, 470, 400], [1950, 380, 320]],
  ];
  const spawnsFor = (plats, width, m1, m2) => [
    { m: m1, p: 0, x: width * 0.22, n: 3, gap: 230 }, { m: m1, p: 1, x: plats[0][0] + plats[0][2] / 2, n: 1 }, { m: m1, p: 2, x: plats[1][0] + plats[1][2] / 2, n: 2, gap: 120 },
    { m: m2, p: 0, x: width * 0.7, n: 3, gap: 260 }, { m: m2, p: 3, x: plats[2][0] + plats[2][2] / 2, n: 2, gap: 160 }, { m: m2, p: 4, x: plats[3][0] + plats[3][2] / 2, n: 2, gap: 120 },
  ];
  const DECO = {
    forest: [{ t: 'tree', x: 200 }, { t: 'tree', x: 1100 }, { t: 'rock', x: 1700 }, { t: 'tree', x: 2400 }],
    cave: [{ t: 'crystal', x: 300 }, { t: 'rock', x: 1200 }, { t: 'crystal', x: 2300 }],
    mushroom: [{ t: 'bigshroom', x: 250 }, { t: 'bigshroom', x: 1300 }, { t: 'bigshroom', x: 2350 }],
    den: [{ t: 'torch', x: 250 }, { t: 'crate', x: 800 }, { t: 'torch', x: 1400 }, { t: 'crate', x: 2000 }, { t: 'torch', x: 2500 }],
    mine: [{ t: 'crate', x: 300 }, { t: 'torch', x: 900 }, { t: 'rock', x: 1500 }, { t: 'torch', x: 2200 }],
    desert: [{ t: 'rock', x: 280 }, { t: 'tent', x: 1150 }, { t: 'rock', x: 2000 }],
    snow: [{ t: 'tree', x: 300 }, { t: 'rock', x: 1200 }, { t: 'tree', x: 2100 }],
    ice: [{ t: 'crystal', x: 300 }, { t: 'crystal', x: 1300 }, { t: 'crystal', x: 2300 }],
    sky: [{ t: 'crystal', x: 400 }, { t: 'windmill', x: 1400 }, { t: 'crystal', x: 2300 }],
    sanctum: [{ t: 'crystal', x: 300 }, { t: 'torch', x: 900 }, { t: 'crystal', x: 1500 }],
    void: [{ t: 'crystal', x: 300 }, { t: 'crystal', x: 1400 }, { t: 'crystal', x: 2400 }],
  };
  const town = (id, name, theme, npcs, first, deco) => G.addMap(id, {
    name, lvText: '마을', town: true, theme, width: 2400, home: id, start: 400, plats: [[1500, 470, 260]],
    deco: deco || [{ t: 'house', x: 500, w: 240, color: '#6a5a8a' }, { t: 'house', x: 1150, w: 280, color: '#8a5a3a', big: true }, { t: 'stall', x: 1800, color: '#c0a060' }, { t: 'stall', x: 2000, color: '#6a7a8a' }],
    npcs: npcs.map((n, i) => ({ id: n, x: 220 + i * (1950 / npcs.length) })),
    portals: [{ id: 'east', x: 2340, to: first, toPortal: 'west' }],
  });
  const field = (id, name, lv, theme, home, li, m1, m2, west, east, o = {}) => {
    const plats = LAYOUT[li], width = 2600;
    const westP = { id: 'west', x: 60, to: west, toPortal: o.westPortal || 'east' };
    const eastP = { id: 'east', x: width - 60, to: east, toPortal: o.eastPortal || 'west', label: o.eastLabel };
    G.addMap(id, Object.assign({
      name, lvText: lv, theme, width, home, plats, deco: DECO[theme] || DECO.forest,
      spawns: spawnsFor(plats, width, m1, m2), portals: [westP, eastP].concat(o.portals || []), npcs: o.npcs || [],
    }, o.extra || {}));
  };
  const boss = (id, name, lv, theme, home, m, west) => G.addMap(id, {
    name, lvText: lv, theme, width: 1700, home, bossRoom: true,
    plats: [[300, 470, 220], [1180, 470, 220], [340, 285, 140], [1220, 285, 140]], deco: DECO[theme] || DECO.den,
    spawns: [{ m, p: 0, x: 1150, n: 1 }], portals: [{ id: 'in', x: 70, to: west, toPortal: 'east' }],
  });

  // 2장: 은빛숲 엘렌하임
  town('elenheim', '엘렌하임', 'forest', ['trav', 'silian', 'seren', 'pio', 'kaien', 'orn', 'elin', 'dora'], 'moss_forest',
    [{ t: 'tree', x: 300 }, { t: 'house', x: 650, w: 260, color: '#4a8a5a' }, { t: 'tree', x: 1100 }, { t: 'house', x: 1400, w: 300, color: '#e8d070', big: true }, { t: 'tree', x: 2000 }]);
  field('moss_forest', '이끼숲', 'Lv.20~23', 'forest', 'elenheim', 0, 'moss_slime', 'thorn_beetle', 'elenheim', 'spider_cave');
  field('spider_cave', '거미 동굴', 'Lv.23~26', 'cave', 'elenheim', 1, 'cave_spider', 'web_bat', 'moss_forest', 'firefly_swamp');
  field('firefly_swamp', '반딧불 늪', 'Lv.26~29', 'mushroom', 'elenheim', 2, 'swamp_toad', 'firefly_spirit', 'spider_cave', 'heart_of_tree', { eastPortal: 'in', eastLabel: '고목의 심장 (보스)' });
  boss('heart_of_tree', '고목의 심장', '보스 · Lv.30', 'forest', 'elenheim', 'morwen', 'firefly_swamp');
  // 3장: 광산도시 라그하르트
  town('raghart', '라그하르트', 'mine', ['trav', 'volga', 'zen', 'tiko', 'kaien_rag', 'rag_smith', 'rag_shop', 'dora'], 'old_mine',
    [{ t: 'house', x: 450, w: 260, color: '#6a6a72' }, { t: 'torch', x: 900 }, { t: 'guild', x: 1150, w: 520 }, { t: 'crate', x: 1900 }, { t: 'torch', x: 2150 }]);
  G.MAPS.raghart.deco[2].label = '광산 조합';
  field('old_mine', '폐광', 'Lv.30~34', 'cave', 'raghart', 0, 'mine_rat', 'rock_golem', 'raghart', 'furnace');
  field('furnace', '용광로 지대', 'Lv.35~39', 'den', 'raghart', 1, 'fire_imp', 'magma_slime', 'old_mine', 'workshop');
  field('workshop', '기계 공방', 'Lv.40~44', 'mine', 'raghart', 2, 'clockwork', 'drone', 'furnace', 'cult_factory', { eastPortal: 'in', eastLabel: '교단 채굴 공장 (보스)', extra: { elite: 'foreman' } });
  boss('cult_factory', '교단 채굴 공장', '보스 · Lv.45', 'den', 'raghart', 'grounder', 'workshop');
  G.MAPS.old_mine.elite = null; G.MAPS.furnace.elite = null;
  // 4장: 모래바다 사하린
  town('sahrin', '사하린', 'desert', ['trav', 'azar', 'hakim', 'meirin', 'sah_smith', 'sah_shop', 'dora'], 'red_dunes',
    [{ t: 'tent', x: 450 }, { t: 'tent', x: 900 }, { t: 'house', x: 1200, w: 300, color: '#d8a860', big: true }, { t: 'tent', x: 1900 }]);
  field('red_dunes', '붉은 사구', 'Lv.45~49', 'desert', 'sahrin', 0, 'sand_lizard', 'dune_bison', 'sahrin', 'scorpion_canyon');
  field('scorpion_canyon', '전갈 협곡', 'Lv.50~54', 'desert', 'sahrin', 1, 'canyon_scorpion', 'vulture', 'red_dunes', 'oasis_ruins', { extra: { elite: 'scorpion_king' } });
  field('oasis_ruins', '오아시스 폐허', 'Lv.55~59', 'desert', 'sahrin', 2, 'mummy', 'sand_spirit', 'scorpion_canyon', 'buried_temple', { eastPortal: 'in', eastLabel: '매몰된 신전 (보스)' });
  boss('buried_temple', '매몰된 신전', '보스 · Lv.60', 'den', 'sahrin', 'parakan', 'oasis_ruins');
  // 5장: 얼음성채 프로스트벨
  town('frostbell', '프로스트벨', 'snow', ['trav', 'valeria', 'artel', 'heidel', 'rok', 'fro_smith', 'fro_shop', 'dora'], 'blizzard_pass',
    [{ t: 'house', x: 450, w: 260, color: '#5a7ab0' }, { t: 'guild', x: 1050, w: 560 }, { t: 'tree', x: 1850 }, { t: 'house', x: 2050, w: 220, color: '#7aa8d0' }]);
  G.MAPS.frostbell.deco[1].label = '얼음성채';
  field('blizzard_pass', '눈보라 고개', 'Lv.60~64', 'snow', 'frostbell', 0, 'snow_wolf', 'frost_bat', 'frostbell', 'frozen_lake');
  field('frozen_lake', '빙결 호수', 'Lv.65~69', 'ice', 'frostbell', 1, 'ice_crab', 'yeti', 'blizzard_pass', 'ice_maze');
  field('ice_maze', '얼음 미궁', 'Lv.70~74', 'ice', 'frostbell', 2, 'ice_golem', 'frost_wraith', 'frozen_lake', 'frost_nest', { eastPortal: 'in', eastLabel: '서리용 둥지 (보스)', extra: { elite: 'frost_giant' } });
  boss('frost_nest', '서리용 둥지', '보스 · Lv.75', 'ice', 'frostbell', 'kaien_boss', 'ice_maze');
  // 6장: 하늘섬 아에로스
  town('aeros', '아에로스', 'sky', ['trav', 'orion', 'oriel', 'yuna', 'kaien_sky', 'aer_smith', 'aer_shop', 'dora'], 'cloud_garden',
    [{ t: 'crystal', x: 350 }, { t: 'house', x: 650, w: 260, color: '#a0b0e0' }, { t: 'guild', x: 1150, w: 520 }, { t: 'crystal', x: 2050 }]);
  G.MAPS.aeros.deco[2].label = '별의 탑';
  field('cloud_garden', '구름 정원', 'Lv.75~79', 'sky', 'aeros', 0, 'cloud_sheep', 'sky_fairy', 'aeros', 'storm_tower');
  field('storm_tower', '폭풍의 탑', 'Lv.80~84', 'sky', 'aeros', 1, 'storm_golem', 'thunder_bird', 'cloud_garden', 'star_corridor');
  field('star_corridor', '별의 회랑', 'Lv.85~89', 'sanctum', 'aeros', 2, 'star_knight', 'comet_spirit', 'storm_tower', 'sky_sanctum', { eastPortal: 'in', eastLabel: '천공 성소 (보스)', extra: { elite: 'storm_guardian' } });
  boss('sky_sanctum', '천공 성소', '보스 · Lv.89~90', 'sanctum', 'aeros', 'aurelion', 'star_corridor');
  // 종장: 녹스게이트
  town('noxgate', '녹스게이트', 'void', ['trav', 'elma_nox', 'kaien_nox', 'astra', 'nox_shop', 'dora'], 'broken_dimension',
    [{ t: 'tent', x: 450 }, { t: 'torch', x: 800 }, { t: 'tent', x: 1200 }, { t: 'torch', x: 1600 }, { t: 'crystal', x: 2000 }]);
  field('broken_dimension', '무너진 차원', 'Lv.90~94', 'void', 'noxgate', 0, 'void_shade', 'rift_beast', 'noxgate', 'shadow_citadel');
  field('shadow_citadel', '그림자 성채', 'Lv.94~97', 'den', 'noxgate', 1, 'dark_knight', 'cult_mage', 'broken_dimension', 'void_river',
    { portals: [{ id: 'hall', x: 1300, to: 'hero_hall', toPortal: 'in', label: '영웅의 전당' }], extra: { elite: 'executor' } });
  field('void_river', '공허의 강', 'Lv.97~100', 'void', 'noxgate', 2, 'void_serpent', 'abyss_eye', 'shadow_citadel', 'void_throne', { eastPortal: 'in', eastLabel: '공허의 왕좌 (최종 보스)' });
  G.addMap('hero_hall', {
    name: '영웅의 전당', lvText: '시련 · Lv.97', theme: 'sanctum', width: 1800, home: 'noxgate', respawn: 25,
    plats: [[300, 470, 260], [1240, 470, 260]], deco: DECO.sanctum,
    spawns: [{ m: 'trial_echo', p: 0, x: 900, n: 2, gap: 500 }, { m: 'trial_echo', p: 1, x: 430, n: 1 }, { m: 'trial_echo', p: 2, x: 1370, n: 1 }],
    portals: [{ id: 'in', x: 70, to: 'shadow_citadel', toPortal: 'hall' }],
  });

  // 바람결 마을에도 여행 안내원
  G.MAPS.wind_village.npcs.push({ id: 'trav', x: 330 });

  // ---------- 높은 발판(2단 점프 전용) + 보물상자 + 정예 몬스터 자동 배치 ----------
  for (const m of Object.values(G.MAPS)) {
    if (m.town || m.bossRoom || m.hidden || m.id === 'hero_hall') continue;
    const plats = m.platforms.filter(p => !p.ground);
    if (!plats.length) continue;
    const top = plats.reduce((a, b) => (b.y < a.y ? b : a));
    const hp = { x: top.x + top.w / 2 - 85, y: top.y - 185, w: 170, high: true };
    m.platforms.push(hp);
    const idx = m.platforms.length - 1;
    m.chest = { x: hp.x + 120, p: idx };
    if (m.elite) m.spawns.push({ m: m.elite, p: idx, x: hp.x + 60, n: 1 });
  }
})();

// 여행 목적지 (플래그로 해금)
G.TRAVEL = [
  { to: 'sprout_port', label: '새싹항' }, { to: 'wind_village', label: '바람결 마을', flag: 'ship' },
  { to: 'elenheim', label: '엘렌하임', flag: 'ch2' }, { to: 'raghart', label: '라그하르트', flag: 'ch3' },
  { to: 'sahrin', label: '사하린', flag: 'ch4' }, { to: 'frostbell', label: '프로스트벨', flag: 'ch5' },
  { to: 'aeros', label: '아에로스', flag: 'ch6' }, { to: 'noxgate', label: '녹스게이트', flag: 'ch7' },
];

// 월드맵 배치 (지역 8개, 2줄 × 4칸)
G.WORLD = {
  regions: [
    { name: '새싹항 섬', color: '#2f6a9a', maps: ['sprout_port', 'coast_grass', 'mush_hill', 'shell_beach', 'light_cave'] },
    { name: '바람결 지방', color: '#3f7a3f', maps: ['wind_village', 'gold_field', 'windmill_hill', 'bandit_road', 'bandit_den'] },
    { name: '은빛숲 엘렌하임', color: '#2a6a4a', maps: ['elenheim', 'moss_forest', 'spider_cave', 'firefly_swamp', 'heart_of_tree'] },
    { name: '광산도시 라그하르트', color: '#6a5a4a', maps: ['raghart', 'old_mine', 'furnace', 'workshop', 'cult_factory'] },
    { name: '모래바다 사하린', color: '#9a7a3a', maps: ['sahrin', 'red_dunes', 'scorpion_canyon', 'oasis_ruins', 'buried_temple'] },
    { name: '얼음성채 프로스트벨', color: '#4a7aa8', maps: ['frostbell', 'blizzard_pass', 'frozen_lake', 'ice_maze', 'frost_nest'] },
    { name: '하늘섬 아에로스', color: '#6a6aa8', maps: ['aeros', 'cloud_garden', 'storm_tower', 'star_corridor', 'sky_sanctum'] },
    { name: '녹스게이트', color: '#4a2a6a', maps: ['noxgate', 'broken_dimension', 'shadow_citadel', 'hero_hall', 'void_river', 'void_throne'] },
  ],
};
