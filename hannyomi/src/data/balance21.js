'use strict';
// 2.1 보스 밸런스 (docs/BUILD_2.1_PLAN.md)
//  - 보스 체력 배율 · 체력 70% / 40% 페이즈 + 새 패턴 18개 · 자주 나오던 패턴 줄이기 · 그로기 기믹 · 녹스 종말의 별 완화
//  - 기존 보스 데이터(monsters.js · bosses.js · world2.js) 뒤에 덧씌운다. 아이템 id · 세이브 형식은 그대로
(function () {
  const B = G.BOSSES, M = G.MONSTERS;
  const add = (id, list) => { B[id].patterns.push(...list); };
  const tune = (id, pid, o) => { const pt = B[id].patterns.find(x => x.id === pid); if (pt) Object.assign(pt, o); };

  // ---------- 체력 배율 (시뮬레이션으로 맞춘 값: 보통 장비 기준 목표 길이) ----------
  const HP = { shellock: 0.9, bark: 4, morwen: 6.5, grounder: 6, parakan: 2.2, kaien_boss: 3.8, aurelion: 7, eldrick: 7, nox: 8.5 };   // 2.1.3: 쉘로크 7 → 0.9 (실제 순서: 각성 전 표류자 Lv.9 · 나무 막대 기준 약 1분 30초)
  for (const id in HP) M[id].hpMul = (M[id].hpMul || 1) * HP[id];

  // ---------- 새 패턴 ----------
  add('shellock', [
    { id: 'roll', name: '껍데기 굴리기', type: 'dash', shell: true, low: 55, warn: 1.0, speed: 700, dmg: 16, cd: 9, weight: 2, shout: '쉘로크가 껍데기째 굴러온다! 점프로 넘어라!' },
    { id: 'tide', name: '밀물', type: 'half', ground: true, dur: 6, dmg: 5, tint: '60,150,240', cd: 14, weight: 1, shout: '밀물이 들어온다! 위쪽 발판으로!' },
  ]);
  add('bark', [
    { id: 'trap', name: '덫 설치', type: 'hands', fx: 'trap', burst: '#c0c0c8', count: 3, gapT: 0.05, spread: 150, warn: 1.1, w: 90, dmg: 14, slow: 2, cd: 9, weight: 2, shout: '바닥에 덫을 깔았다!' },
    { id: 'volley', name: '부하 궁수 일제 사격', type: 'hands', fx: 'arrows', burst: '#d8c8a0', count: 6, gapT: 0.15, warn: 0.9, w: 100, dmg: 10, cd: 10, weight: 1.5, shout: '"궁수들, 쏴라!"' },
  ]);
  add('morwen', [
    { id: 'thornwave', name: '가시 덩굴 파도', type: 'waves', proj: 'thorn', ys: [14, 14], count: 2, gapT: 1.0, speed: 380, dmg: 16, cd: 9, weight: 2, shout: '가시 덩굴이 밀려온다! 점프!' },
    { id: 'sporerain', name: '독 포자 비', type: 'hands', fx: 'spore', burst: '#9ae060', count: 4, gapT: 0.25, warn: 1.0, w: 110, dmg: 10, poison: { pct: 1.2, dur: 4 }, cd: 10, weight: 2, shout: '독 포자가 쏟아진다!' },
  ]);
  add('grounder', [
    { id: 'laser', name: '회전 레이저', type: 'cut', tint: '255,80,80', count: 2, warn: 1.3, dmg: 22, cd: 9, weight: 2, shout: '레이저 충전! 표시된 줄을 피해라!' },
    { id: 'missile', name: '미사일 폭격', type: 'hands', fx: 'missile', burst: '#ffb060', count: 5, gapT: 0.18, warn: 1.1, w: 100, dmg: 16, cd: 10, weight: 2, shout: '미사일 발사!' },
  ]);
  add('parakan', [
    { id: 'twister', name: '모래 회오리', type: 'waves', proj: 'twister', ys: [14], count: 2, gapT: 1.3, speed: 320, dmg: 15, cd: 8, weight: 2, shout: '모래 회오리! 점프로 넘어라!' },
    { id: 'wrath', name: '왕의 분노', type: 'nova', w: 560, h: 220, warn: 1.5, dmg: 34, color: '#ffcf60', color2: '#fff0b0', cd: 12, weight: 1.5, shout: '파라칸: 무릎 꿇어라! (멀리 달아나라)' },
  ]);
  add('kaien', [
    { id: 'icespear', name: '서리 창 낙하', type: 'hands', fx: 'icespear', burst: '#d8f0ff', count: 4, gapT: 0.12, spread: 150, warn: 1.0, w: 80, dmg: 18, cd: 8, weight: 2, shout: '서리 창이 떨어진다!' },
    { id: 'shadowdance', name: '그림자 난무', type: 'teleport', times: 3, warn: 0.45, w: 140, h: 100, dmg: 16, cd: 12, weight: 1.5, shout: '카이엔: 따라올 수 있겠나?' },
  ]);
  add('aurelion', [
    { id: 'radiance', name: '성광 폭발', type: 'nova', w: 600, h: 240, warn: 1.5, dmg: 34, color: '#fff4c0', color2: '#ffffff', cd: 11, weight: 1.5, shout: '성광 폭발! 표시된 곳 밖으로!' },
    { id: 'skybreath', name: '천공의 숨결', type: 'sweep', warn: 1.1, dur: 1.4, dmg: 40, cd: 13, weight: 2, shout: '천공의 숨결! 용의 발밑이나 등 뒤로 파고들어라!' },
  ]);
  add('eldrick', [
    { id: 'brand', name: '교단의 낙인', type: 'brand', follow: 1.5, time: 3, r: 80, dmg: 38, cd: 11, weight: 2, shout: '교단의 낙인이 새겨졌다! 3초 뒤 그 자리가 폭발한다!' },
    { id: 'prison', name: '별빛 감옥', type: 'erosion', dur: 10, dmg: 8, safe: 360, tint: '40,10,70', stars: true, cd: 24, weight: 1, shout: '별빛 감옥! 가운데로!' },
  ]);
  add('nox', [
    { id: 'voidwave', name: '공허의 파도', type: 'waves', proj: 'voidwave', ys: [20, 95], count: 2, gapT: 0.9, speed: 420, dmg: 22, cd: 9, weight: 2, shout: '공허의 파도! 낮은 건 점프, 높은 건 그대로!' },
    { id: 'forgotten', name: '잊힌 별', type: 'summon', mon: 'forgotten_star', count: 3, max: 5, cd: 20, weight: 1, shout: '잊힌 별들이 깨어났다! 닿기 전에 부숴라!' },
  ]);

  // ---------- 페이즈 (체력 70% · 40%마다 새 패턴 1개) ----------
  B.shellock.phases = [
    { hp: 1, name: '성난 소라게', patterns: ['claw', 'shell', 'bubble'] },
    { hp: 0.7, name: '굴러라!', shout: '쉘로크가 껍데기를 단단히 조였다!', patterns: ['claw', 'shell', 'bubble', 'roll'] },
    { hp: 0.4, name: '밀물', shout: '동굴로 바닷물이 밀려든다!', patterns: ['claw', 'shell', 'bubble', 'roll', 'tide'] },
  ];
  B.bark.phases = [
    { hp: 1, name: '붉은손 두목', patterns: ['dash', 'summon', 'smoke', 'daggers'] },
    { hp: 0.7, name: '함정 전문가', shout: '바르크: 발밑 조심하라고!', patterns: ['dash', 'summon', 'smoke', 'daggers', 'trap'] },
    { hp: 0.4, name: '총공격', shout: '바르크: 다들 나와! 쏴 버려!', patterns: ['dash', 'summon', 'smoke', 'daggers', 'trap', 'volley'] },
  ];
  B.morwen.phases = [
    { hp: 1, name: '오염된 정령', patterns: ['roots', 'spores'] },
    { hp: 0.7, name: '덩굴의 분노', shout: '모르웬: 숲을... 건드리지 마...!', patterns: ['roots', 'spores', 'thornwave'] },
    { hp: 0.5, name: '광기', shout: '모르웬: 숲이... 숲이 아파...!', patterns: ['roots', 'spores', 'thornwave', 'drain', 'fruit'] },
    { hp: 0.4, name: '독의 비', shout: '모르웬의 꽃이 독을 뿜는다!', patterns: ['roots', 'spores', 'thornwave', 'drain', 'fruit', 'sporerain'] },
  ];
  B.grounder.phases = [
    { hp: 1, name: '채굴 모드', patterns: ['drill', 'steam', 'rocks', 'heat'] },
    { hp: 0.7, name: '전투 모드', shout: 'MK-7: 침입자 확인. 레이저 가동.', patterns: ['drill', 'steam', 'rocks', 'heat', 'laser'] },
    { hp: 0.4, name: '폭주 모드', shout: 'MK-7: 경고. 경고. 전 무장 해제.', patterns: ['drill', 'steam', 'rocks', 'heat', 'laser', 'missile'] },
  ];
  B.parakan.phases = [
    { hp: 1, name: '사막의 왕', patterns: ['storm', 'curse', 'guards'] },
    { hp: 0.7, name: '모래의 군주', shout: '파라칸: 모래가 나를 지킨다!', patterns: ['storm', 'curse', 'guards', 'twister'] },
    { hp: 0.6, name: '태양의 분노', shout: '파라칸: 태양 아래 무릎 꿇어라!', patterns: ['storm', 'curse', 'guards', 'twister', 'quicksand', 'sun'] },
    { hp: 0.4, name: '폭군의 분노', shout: '파라칸: 감히 왕에게!', patterns: ['storm', 'curse', 'guards', 'twister', 'quicksand', 'sun', 'wrath'] },
  ];
  B.kaien.phases = [
    { hp: 1, name: '교단 간부', patterns: ['blink', 'waves', 'clones', 'breath'] },
    { hp: 0.7, name: '서리용의 힘', shout: '카이엔: 이 힘이라면...!', patterns: ['blink', 'waves', 'clones', 'breath', 'icespear'] },
    { hp: 0.4, name: '그림자 검', shout: '카이엔: ...진심으로 간다.', patterns: ['blink', 'waves', 'clones', 'breath', 'icespear', 'shadowdance'] },
  ];
  B.aurelion.phases = [
    { hp: 1, name: '천공룡', patterns: ['roar', 'gust', 'starfall'] },
    { hp: 0.7, name: '별빛 분노', shout: '아우렐리온의 비늘이 눈부시게 빛난다!', patterns: ['roar', 'gust', 'starfall', 'radiance'] },
    { hp: 0.5, name: '천공 비상', shout: '아우렐리온이 하늘로 날아올랐다!', start: 'soar', patterns: ['roar', 'gust', 'starfall', 'radiance', 'skybreath'] },
  ];
  B.eldrick.phases[1].patterns.push('brand');
  B.eldrick.phases[2].patterns.push('brand', 'prison');
  B.nox.phases[1].patterns.push('voidwave');
  B.nox.phases[2].patterns.push('forgotten');

  // ---------- 자주 나오던 패턴 줄이기 (1분에 7~14번 → 4번 이하 목표) ----------
  tune('morwen', 'roots', { cd: 6, weight: 2 });
  tune('kaien', 'waves', { cd: 8, weight: 1.5 });
  tune('nox', 'hand', { cd: 7, weight: 2 });
  tune('bark', 'dash', { cd: 10, weight: 1 });
  tune('aurelion', 'starfall', { cd: 9, weight: 2 });
  tune('eldrick', 'skyfall', { cd: 8, weight: 2 });

  // ---------- 그로기 기믹 ----------
  tune('shellock', 'shell', { weak: true, shout: '쉘로크가 껍데기 속으로 숨었다! 빛나는 약점을 3번 때려라!' });
  tune('bark', 'smoke', { decoy: 'bark_decoy', shout: '연막탄! 눈이 빛나는 진짜 바르크를 찾아라!' });
  tune('grounder', 'heat', { valves: 'cool_valve', shout: '과열! 냉각 밸브 2개를 부수면 다운시킬 수 있다!' });
  tune('kaien', 'clones', { shout: '카이엔: 어느 쪽이 진짜일까? (파란 목도리가 흔들리는 쪽!)' });

  // ---------- 녹스: 종말의 별 완화 · 광폭화 20분 ----------
  tune('nox', 'doom', { warn: 6, cd: 45, failDmg: 70, firstCut: true });
  B.nox.enrage = 1200;

  // ---------- 기믹용 몬스터 ----------
  M.bark_decoy = Object.assign({}, M.bark, { name: '바르크?', kind: 'minion', ai: null, decoy: true, harmless: true, speed: 0, noLoot: true, noKb: true, hpMul: 0.02, bossDrops: null });
  M.cool_valve = { name: '냉각 밸브', lv: 45, kind: 'minion', shape: 'valve', color: '#8a8a9a', color2: '#ff5a3a', w: 46, h: 70, speed: 0, harmless: true, noLoot: true, noKb: true, hpMul: 0.5 };
  M.forgotten_star = { name: '잊힌 별', lv: 100, kind: 'minion', shape: 'fstar', color: '#1a0a2a', color2: '#c890ff', w: 40, h: 40, speed: 70, flying: true, aggressive: true, sight: 2000, noLoot: true, hpMul: 0.3 };
})();
