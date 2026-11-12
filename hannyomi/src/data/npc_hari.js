'use strict';
// ============================================================
// 외모 바꾸기 NPC "꾸밈 장인 하리" (2026-11-12 사용자 결정: 여자 · 마을마다 1명 · 무료)
//  - 대화 메뉴 [💇 외모 바꾸기] → 캐릭터 만들기와 같은 화면 (G.Creator.openRestyle)
//  - 마을 8곳 맵의 NPC 목록에 넣음: 다른 NPC 사이에서 가장 넓은 빈자리 (포탈 · 시작 자리와 겹치지 않게)
//  - 세이브: d.look 값만 바뀜 (형식 그대로)
// ============================================================
(function () {
  G.NPCS.hari = {
    name: '하리', title: '꾸밈 장인', restyle: true,
    look: { hair: '#e07ab0', top: '#e8a0c0', bottom: '#6a4a7a', style: 'wavy', style2: 'wavy', eye2: 'bright_smile', gender: 'f', eyeColor: '#c44569', acc: 'flower' },
    greet: ['머리 모양도, 눈빛도, 오늘은 새롭게 바꿔 볼까요? 비용은 받지 않아요. 몇 번이든 바꿔 보세요!',
      '어느 마을의 하리에게 와도 똑같이 꾸며 드려요.', '오늘은 어떤 모습이 되고 싶어요?'],
  };
  const TOWNS = ['sprout_port', 'wind_village', 'elenheim', 'raghart', 'sahrin', 'frostbell', 'aeros', 'noxgate'];
  for (const id of TOWNS) {
    const M = G.MAPS[id]; if (!M || M.npcs.some(n => n.id === 'hari')) continue;
    const ground = n => !n.p;   // 땅 위의 NPC 만 (발판 위 NPC 는 빈자리 계산에서 뺌)
    const xs = M.npcs.filter(ground).map(n => n.x).concat((M.portals || []).map(p => p.x), [M.start != null ? M.start : 200]).sort((a, b) => a - b);
    const lo = 140, hi = M.width - 140;
    let best = null, bw = 0;
    const pts = [lo].concat(xs.filter(x => x > lo && x < hi), [hi]);
    for (let i = 0; i < pts.length - 1; i++) { const w = pts[i + 1] - pts[i]; if (w > bw) { bw = w; best = (pts[i] + pts[i + 1]) / 2; } }
    M.npcs.push({ id: 'hari', x: Math.round(best) });
  }
})();
