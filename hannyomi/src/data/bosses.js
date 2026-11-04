'use strict';
// 보스 패턴. dmg = 플레이어 최대 HP 대비 %
//  type: melee(앞쪽 내려찍기) | guard(피해 감소) | shots(투사체) | dash(돌진) | summon(소환) | smoke(시야 축소)
//  warn: 예고 시간(초), cd: 재사용 대기, weight: 선택 가중치
G.BOSSES = {
  // 최종 보스: 3페이즈 (66%, 33%), 15분 후 광폭화, 3페이즈에 엘마/카이엔 지원
  nox: {
    speed: 55, gap: [1.3, 2.1], enrage: 900, assist: true,
    phases: [
      { hp: 1.00, name: '봉인된 모습 · 체념', patterns: ['hand', 'orbs', 'chain'] },
      { hp: 0.66, name: '각성 · 서러움', shout: '녹스: 그 빛… 그들과 같구나. 나를 가두고, 나를 잊은 그들과.', patterns: ['echo', 'cut', 'erosion', 'hand'] },
      { hp: 0.33, name: '진정한 모습 · 절망', shout: '녹스: 삼켜도, 삼켜도… 왜 나는 빛나지 않는가.', patterns: ['devour', 'doom', 'despair', 'cut', 'orbs'] },
    ],
    patterns: [
      { id: 'hand', name: '공허의 손', type: 'hands', fx: 'nighthand', count: 3, gapT: 0.55, warn: 1.0, w: 110, dmg: 25, cd: 5, weight: 3 },
      { id: 'orbs', name: '어둠 구체', type: 'orbs', proj: 'deadstar', count: 4, speed: 300, dmg: 15, life: 7, cd: 10, weight: 2 },
      { id: 'chain', name: '봉인의 사슬', type: 'chain', pillars: 3, dur: 12, cd: 26, weight: 1, shout: '녹스가 사슬로 몸을 감쌌다! 사슬 기둥 3개를 부숴라!' },
      { id: 'echo', name: '영웅의 잔영', type: 'echo', mon: 'hero_echo', cd: 22, weight: 1, shout: '일곱 영웅의 잔영이 나타났다! 잔영을 쓰러뜨리면 녹스가 무너진다' },
      { id: 'cut', name: '차원 절단', type: 'cut', tint: '150,150,230', count: 2, warn: 1.5, dmg: 50, cd: 7, weight: 3 },
      { id: 'erosion', name: '공허 잠식', type: 'erosion', dur: 15, dmg: 10, safe: 380, cd: 32, weight: 1, shout: '공허가 차오른다! 중앙으로 피해라!' },
      { id: 'devour', name: '별을 삼키는 자', type: 'pull', dur: 4, force: 230, dmg: 8, cd: 13, weight: 2, shout: '녹스가 모든 것을 빨아들인다! 반대로 달려라!' },
      { id: 'doom', name: '종말의 별', type: 'doom', warn: 5, cd: 38, weight: 1, shout: '종말의 별이 떨어진다! 빛나는 보호막 안으로!' },
      { id: 'despair', name: '절망', type: 'despair', dur: 10, dot: 3, healCut: 50, cd: 22, weight: 1, shout: '절망이 퍼진다... (10초간 회복량 50% 감소 + 지속 피해)' },
    ],
  },
  shellock: {
    speed: 40, gap: [1.6, 2.6],
    patterns: [
      { id: 'claw', name: '집게 내려찍기', type: 'melee', warn: 1.0, w: 190, h: 140, dmg: 15, cd: 3, weight: 3 },
      { id: 'shell', name: '껍데기 숨기', type: 'guard', dur: 5, reduce: 0.9, cd: 14, weight: 1, shout: '쉘로크가 껍데기 속으로 숨었다!' },
      { id: 'bubble', name: '거품 발사', type: 'shots', warn: 0.8, count: 3, spread: 0.22, speed: 330, dmg: 8, slow: 2, proj: 'bubble', cd: 4, weight: 2 },
    ],
  },
  bark: {
    speed: 85, gap: [1.2, 2.2],
    patterns: [
      { id: 'dash', name: '돌진 베기', type: 'dash', warn: 1.0, speed: 950, dmg: 20, cd: 6, weight: 2 },
      { id: 'summon', name: '부하 호출', type: 'summon', mon: 'barkminion', count: 3, max: 4, cd: 16, weight: 1, shout: '"얘들아! 놈을 잡아라!"' },
      { id: 'smoke', name: '연막탄', type: 'smoke', dur: 4, radius: 170, cd: 14, weight: 1, shout: '연막탄이 터졌다!' },
      { id: 'daggers', name: '독 단검 투척', type: 'shots', warn: 0.8, count: 5, spread: 0.55, speed: 520, dmg: 6, poison: { pct: 1.5, dur: 4 }, proj: 'dagger', cd: 5, weight: 2 },
    ],
  },
};
