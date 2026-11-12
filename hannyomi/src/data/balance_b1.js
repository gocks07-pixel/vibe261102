'use strict';
// ============================================================
// 빌드 1 보스 밸런스 (docs/BUILD_MOBILE_PLAN.md "2 · 4 · 7번 계획서", 2026-11-12)
//  - balance21.js 뒤에 덧씌움. 아이템 id · 세이브 형식 그대로
//  - 2-2 큰 기술: 예고(warn)가 있고 최대 HP 30% 이상인 한두 방짜리 기술 ×1.25 (최대 60%, 여러 번 떨어지는 기술은 제외 — 시뮬레이션)
//  - 2-4 4장 이후 보스 HP ×0.75 · 7-1 1~3번째 보스 HP ×0.5
//  - 7 모르웬 썩은 열매: 3개 → 2개, 캐릭터 양옆 150~250 거리, 4초 → 6초
//  - 2-1 보스 방 물약 재사용 대기는 player.js (G.F.BOSS_POT_GAP)
// ============================================================
(function () {
  const B = G.BOSSES, M = G.MONSTERS;
  const HP = { shellock: 0.5, bark: 0.5, morwen: 0.5, grounder: 0.75, parakan: 0.75, kaien_boss: 0.75, aurelion: 0.75, eldrick: 0.75, nox: 0.75 };
  for (const id in HP) if (M[id]) M[id].hpMul = (M[id].hpMul || 1) * HP[id];
  for (const id in B) for (const pt of B[id].patterns || []) {
    if (pt.warn && pt.dmg >= 30 && (pt.count || 1) <= 2) pt.dmg = Math.min(60, Math.round(pt.dmg * 1.25));   // 여러 번 떨어지는 기술(하늘 낙하 등)은 제외
  }
  // 4-2 (가 안, 2026-11-12): 후반 보스의 여러 번 떨어지는 기술을 낮춤 — 피하면 깨고, 물약으로 버티기만 해서는 못 깸
  const tune = (bid, pid, o) => { const pt = (B[bid].patterns || []).find(x => x.id === pid); if (pt) Object.assign(pt, o); };
  tune('aurelion', 'starfall', { dmg: 22, count: 5 });   // 28% × 7 → 22% × 5
  tune('aurelion', 'gust', { dmg: 18 });                 // 24 → 18
  tune('eldrick', 'skyfall', { dmg: 20, count: 4 });     // 30% × 5 → 20% × 4
  const fruit = (B.morwen.patterns || []).find(x => x.id === 'fruit');
  if (fruit) Object.assign(fruit, { count: 2, dur: 6, near: [150, 250] });
})();
