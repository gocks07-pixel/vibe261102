'use strict';
// 1.6.1: 옛 강화 아이템이 들어간 퀘스트 보상을 새 구조로 바꾼다 (데이터를 직접 고치지 않고 불러온 뒤 한 번에 변환)
//  용기의 주문서 1장 → 별빛 각인서 2장, 도박의 주문서 1장 → 3장, 불꽃석 → 골드 (1개당 1,500)
(function () {
  const MUL = { scroll_70: 2, scroll_30: 3 };
  for (const q of Object.values(G.QUESTS)) {
    const out = {};
    for (const [tid, n] of q.items) {
      if (tid === 'flame') { q.gold = (q.gold || 0) + 1500 * n; continue; }
      const id = MUL[tid] ? 'scroll_100' : tid;
      out[id] = (out[id] || 0) + n * (MUL[tid] || 1);
    }
    q.items = Object.entries(out);
  }
})();
