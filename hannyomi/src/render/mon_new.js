'use strict';
// ============================================================
// 빌드 9 (2026-11-13): 일반 몬스터 새 그림 — 사용자 선택 docs/drafts/design/monster_1/README.md (1~3단계 · 다시 그린 3종)
//  나(새 디자인) 16종 + 다시 그린 3종(민들레 솜털 정령 · 털 풍성한 눈늑대 · 고드름 박쥐)의 G.MonArt[id].draw 를 바꿈
//  다듬기: refine = 'seam'(이음새 없이: 채운 도형 테두리 선 없음) / 'keep'(테두리 선 그대로, 나 새 디자인 — 시안 그대로)
//  필터 자체는 boss_new.js 의 G.MonRefine. 이 파일은 boss_new.js 다음에 불러옴
// ============================================================
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, c, up = 0.3, dn = -0.3) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, shade(c, up)); g.addColorStop(1, shade(c, dn)); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const eyes = (ctx, x, y, gap, r, iris) => { for (const ex of [x, x + gap]) { ell(ctx, ex, y, r, r * 1.2, '#fff', '#2a2a32', 0.6); ell(ctx, ex + r * 0.25, y + r * 0.1, r * 0.62, r * 0.8, iris || '#2a2a36'); ell(ctx, ex + r * 0.05, y - r * 0.4, r * 0.28, r * 0.28, '#fff'); ell(ctx, ex + r * 0.45, y + r * 0.45, r * 0.12, r * 0.12, '#fff'); } };
  const NEW = {};
  // 버섯 기사: 투구처럼 생긴 갓(눈 틈) + 포자 문장 방패 + 깃발 창
  NEW.capshroom = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, step = s.walk ? sin(t * 12) : 0; ctx.translate(0, -abs(step) * 2);
    for (const sg of [-1, 1]) { rrect(ctx, sg * 6 - 3.5, -11 + (sg > 0 ? step : -step) * 2, 7, 11, 3, '#c8b090', '#6a5a3a'); rrect(ctx, sg * 6 - 4, -3, 8, 3.4, 1.5, '#5a3a1a'); }
    rrect(ctx, -w * 0.4, -h * 0.52, w * 0.8, h * 0.44, 7, vg(ctx, -h * 0.52, -h * 0.08, '#f4e8d0', 0.1, -0.2), '#8a7050', 1.5);
    rrect(ctx, -w * 0.42, -h * 0.3, w * 0.84, 4, 1.5, '#7a4a2a');   // 허리띠
    const th = s.atk * 14; ctx.save(); ctx.translate(-w * 0.1 + th, -h * 0.34); ctx.rotate(-0.12);
    line(ctx, '#7a5a2a', 2.6, [[-12, 0], [22, 0]]); poly(ctx, '#e8ecf4', [[22, -3.4], [31, 0], [22, 3.4]], '#7a8090', 1);
    ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.moveTo(14, -1); ctx.lineTo(4 + sin(t * 8) * 1.5, -9); ctx.lineTo(2, -2); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(w * 0.55, -h * 0.25); ell(ctx, 0, 0, 8, 10, vg(ctx, -10, 10, '#b8864a'), '#5a3a1a', 1.6); ell(ctx, 0, 0, 4.4, 4.4, '#e8d8b0');
    for (let i = 0; i < 6; i++) { const a = i * PI / 3; ell(ctx, cos(a) * 2.4, sin(a) * 2.4, 1, 1, '#b5651d'); } ctx.restore();
    // 투구 갓
    ctx.beginPath(); ctx.moveTo(-w * 1.05, -h * 0.5); ctx.quadraticCurveTo(-w * 1.1, -h * 1.08, 0, -h * 1.06); ctx.quadraticCurveTo(w * 1.1, -h * 1.08, w * 1.05, -h * 0.5); ctx.quadraticCurveTo(0, -h * 0.42, -w * 1.05, -h * 0.5);
    ctx.fillStyle = vg(ctx, -h * 1.06, -h * 0.45, m.d.color, 0.3, -0.25); ctx.fill(); ctx.strokeStyle = shade(m.d.color, -0.5); ctx.lineWidth = 1.8; ctx.stroke();
    rrect(ctx, -w * 0.2, -h * 0.62, w * 0.95, 4.6, 2, '#2a1a10');   // 눈 틈
    for (const ex of [w * 0.1, w * 0.45]) { ell(ctx, ex, -h * 0.6, 2.2, 1.6, '#ffe080'); }
    for (const [x, y, r] of [[-w * 0.55, -h * 0.85, 4.5], [w * 0.1, -h * 0.97, 3.6], [w * 0.62, -h * 0.78, 3]]) ell(ctx, x, y, r, r * 0.85, '#fff3dc', '#d8c0a0', 0.6);
    ell(ctx, -w * 0.3, -h * 0.98, w * 0.3, 2.4, 'rgba(255,255,255,.3)');
  };
  // 허수아비 → 호박등 허수아비: 빛나는 호박 머리 + 덧댄 외투 + 어깨의 까마귀
  NEW.scarecrow = (ctx, m, t, s) => {
    const h = m.h, hop = s.walk ? abs(sin(t * 7)) * 8 : abs(sin(t * 2)) * 1.5, swing = s.atk > 0 ? sin(t * 14) * 0.6 : sin(t * 2.5) * 0.12;
    ctx.translate(0, -hop);
    line(ctx, '#6a4a2a', 5, [[0, 0], [0, -h * 0.45]]);
    ctx.save(); ctx.translate(0, -h * 0.62); ctx.rotate(swing); line(ctx, '#7a5a2a', 5, [[-h * 0.4, 0], [h * 0.4, 0]]);
    for (const sx of [-1, 1]) { for (let i = 0; i < 4; i++) line(ctx, '#e8c860', 1.4, [[sx * h * 0.4, 0], [sx * (h * 0.4 + 7), -4 + i * 2.6]]); rrect(ctx, sx * h * 0.32 - 4, -4, 8, 8, 2, '#6a7a4a'); }
    ctx.restore();
    poly(ctx, vg(ctx, -h * 0.76, -h * 0.3, '#5a6a8a'), [[-12, -h * 0.76], [12, -h * 0.76], [16, -h * 0.32], [-16, -h * 0.32]], '#2a3450', 1.4);   // 외투
    rrect(ctx, -9, -h * 0.6, 7, 7, 1, '#a05a3a', '#5a2a1a'); ctx.strokeStyle = '#e8d8a0'; ctx.setLineDash([2, 1.5]); ctx.lineWidth = 0.8; ctx.strokeRect(-9, -h * 0.6, 7, 7); ctx.setLineDash([]);
    for (let i = 0; i < 4; i++) line(ctx, '#e8c860', 1.4, [[-12 + i * 7, -h * 0.33], [-13 + i * 7, -h * 0.25]]);
    // 호박 머리
    const hy = -h * 0.88;
    for (const [x, r] of [[-7, 9], [7, 9], [0, 11]]) ell(ctx, x, hy, r, 10.5, vg(ctx, hy - 10, hy + 10, '#f08a30', 0.2, -0.3), '#a04a10', 1.2);
    line(ctx, '#4a6a2a', 3, [[0, hy - 10], [2, hy - 15]]); ell(ctx, 5, hy - 14, 3.4, 1.8, '#5a8a3a');
    glow(ctx, 2, hy, 14, '#ffd060', 0.5);
    poly(ctx, '#ffe080', [[-1, hy - 4], [3, hy - 4], [1, hy - 1]]); poly(ctx, '#ffe080', [[5, hy - 4], [9, hy - 4], [7, hy - 1]]);
    poly(ctx, '#ffe080', [[-2, hy + 3], [10, hy + 3], [8, hy + 6], [6, hy + 4], [4, hy + 6], [2, hy + 4], [0, hy + 6]]);
    ell(ctx, 0, hy - 12, 18, 3.6, '#7a5a2a', '#4a3010', 1); ctx.fillStyle = '#6a4a20'; ctx.beginPath(); ctx.ellipse(0, hy - 13, 9, 8, 0, PI, 0); ctx.fill();   // 짚 모자
    // 까마귀
    ctx.save(); ctx.translate(-h * 0.22, -h * 0.66 + sin(t * 3) * 0.6); ell(ctx, 0, -4, 5, 4, '#2a2a34'); ell(ctx, 3.6, -8, 3, 3, '#2a2a34'); poly(ctx, '#e8a030', [[6, -8.5], [9, -7.5], [6, -7]]); ell(ctx, 4.4, -8.8, 0.8, 0.8, '#fff');
    poly(ctx, '#1a1a24', [[-4, -4], [-9, -1], [-3, -1]]); ctx.restore();
  };
  if (G.MonArt.capshroom) G.MonArt.capshroom.draw = NEW.capshroom;
  if (G.MonArt.scarecrow) G.MonArt.scarecrow.draw = NEW.scarecrow;
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris, look = 0.25) => { ell(c, x, y, r, r * 1.15, '#fff', '#2a2a32', 0.6); ell(c, x + r * look, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a36'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const blush = (c, x, y, r) => ell(c, x, y, r, r * 0.55, 'rgba(255,120,140,.45)');
  const NEW = {};
  const walk = (s, t, sp = 10) => s.walk ? t * sp : 0;
  const look = (o, top, bot) => G.LOOKS.toDraw(Object.assign(G.LOOKS.def(o.gender || 'm'), o), top, bot);
  // 꼬마 게: 산호빛 둥근 등딱지 + 따개비 · 한쪽 큰 집게 · 눈자루 · 옆걸음
  NEW.crab = (c, m, t, s) => {
    const k = m.w / 50; c.scale(k, k); const ph = walk(s, t, 14), bob = s.walk ? abs(sin(ph)) * 1.5 : sin(t * 2) * 0.5;
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) { const a = ph + i * 1.3 + (sg > 0 ? PI : 0), x = sg * (8 + i * 4); line(c, '#b04e24', 2.4, [[x, -9], [x + sg * 6, -10 + sin(a) * 2], [x + sg * 9, -1]]); }
    c.translate(0, -bob);
    ell(c, 0, -14, 17, 11, rg(c, 0, -16, 18, '#ffb080', '#d8602e'), '#8a3a18', 1.4);
    for (const [x, y, r] of [[-8, -20, 2.2], [-3, -22, 1.6], [6, -21, 2]]) ell(c, x, y, r, r * 0.8, '#fff2e0', '#c08a6a', 0.6);
    ell(c, -6, -17, 6, 2.4, 'rgba(255,255,255,.35)');
    for (const sg of [-1, 1]) { line(c, '#b04e24', 1.6, [[4 + sg * 4, -22], [5 + sg * 5, -29]]); eye(c, 5 + sg * 5, -31, 2.8); }
    const op = s.atk > 0 ? 0.6 : abs(sin(t * 2)) * 0.25;
    c.save(); c.translate(15, -14); c.rotate(-0.5 - s.atk * 0.5); line(c, '#c8582a', 3, [[0, 0], [7, -3]]);   // 큰 집게
    c.translate(10, -4); c.save(); c.rotate(-op); ell(c, 3, -2, 6, 3.6, '#f07a42', '#8a3a18', 1); c.restore(); c.save(); c.rotate(op * 0.6); ell(c, 3, 2, 5, 2.6, '#e86a36', '#8a3a18', 1); c.restore(); c.restore();
    ell(c, -15, -10, 3, 2.4, '#e86a36', '#8a3a18', 0.8);   // 작은 집게
    c.fillStyle = '#7a2a10'; c.beginPath(); c.arc(2, -11, 2, 0, PI); c.fill(); blush(c, -6, -12, 2.4); blush(c, 11, -12, 2.4);
  };
  // 바다 도마뱀: 지느러미 볏 · 아가미 깃 · 꼬리 지느러미 · 물방울 반점, 몸을 S자로 흔들며 걸음
  NEW.sealizard = (c, m, t, s) => {
    const k = m.w / 72 * 1.15; c.scale(k, k * 1.2); const ph = walk(s, t, 12), sw = sin(ph) * 0.12;
    for (const [x, a] of [[-12, 0], [10, PI]]) for (const sg of [-1, 1]) { const st = s.walk ? sin(ph + a + (sg > 0 ? PI : 0)) * 4 : 0; line(c, '#1f7a6a', 3, [[x, -9], [x + st + 3, -2], [x + st + 6, 0]]); }
    c.save(); c.translate(-18, -10); c.rotate(sw); c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-14, -2, -26, -6); c.quadraticCurveTo(-34, -12, -36, -4); c.quadraticCurveTo(-30, 2, -26, 0); c.quadraticCurveTo(-14, 6, 0, 5); c.closePath();
    c.fillStyle = vg(c, -12, 6, '#5ad0c0', '#2a8a7a'); c.fill(); c.strokeStyle = '#14544a'; c.lineWidth = 1; c.stroke(); c.restore();
    c.beginPath(); c.ellipse(0, -11, 20, 8.5, -sw * 0.5, 0, PI * 2); c.fillStyle = vg(c, -20, -3, '#6ae0d0', '#2a8a7a'); c.fill(); c.strokeStyle = '#14544a'; c.lineWidth = 1.2; c.stroke();
    ell(c, 2, -7, 14, 3.4, 'rgba(230,255,240,.5)');
    c.beginPath(); c.moveTo(-14, -17); for (let i = 0; i <= 6; i++) c.quadraticCurveTo(-14 + i * 4.6 - 2.3, -26 + sin(t * 4 + i) * 1.2, -14 + i * 4.6, -18 + abs(i - 3) * 0.3); c.closePath(); c.fillStyle = vg(c, -26, -17, '#7ad8ff', '#2a8ab0'); c.fill(); c.strokeStyle = '#1a5a7a'; c.lineWidth = 0.8; c.stroke();   // 등 지느러미
    for (const [x, y] of [[-8, -13], [2, -15], [10, -12]]) ell(c, x, y, 1.6, 1.6, 'rgba(255,255,255,.55)');
    c.save(); c.translate(20, -14); c.rotate(-0.1 + (s.atk > 0 ? -0.2 : 0)); ell(c, 4, 0, 10, 7, vg(c, -7, 7, '#7ae8d8', '#2a9a8a'), '#14544a', 1.2);
    for (const [a, l] of [[-0.9, 7], [-0.5, 8], [-0.1, 6]]) { c.save(); c.translate(-2, -2); c.rotate(a - PI); ell(c, l * 0.5, 0, l * 0.5, 1.6, '#ff9ab0', '#c0506a', 0.6); c.restore(); }   // 아가미 깃
    eye(c, 6, -2, 2.8, '#1a3a3a'); line(c, '#14544a', 1, [[9, 3], [13, 2.4]]); if (s.atk > 0) ell(c, 14, 3, 2.4, 1.2, '#ff7a90'); c.restore();
  };
  // 바람 정령: 잎사귀 망토를 두른 작은 바람 요정 · 리본처럼 풀리는 바람 꼬리 · 등 뒤 회오리
  NEW.windspirit = (c, m, t, s) => {
    const k = m.h / 50; c.scale(k, k); const bob = sin(t * 2.6) * 3; c.translate(s.atk * 5, -8 + bob);
    for (let j = 0; j < 3; j++) { c.strokeStyle = `rgba(160,240,250,${0.55 - j * 0.15})`; c.lineWidth = 2.4 - j * 0.6; c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, a = u * PI * 2.6 + t * 4 + j; const x = -4 - u * 16 + cos(a) * (4 + u * 4), y = -8 + u * 10 + sin(a) * (3 + u * 3); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    c.beginPath(); c.moveTo(-10, -12); c.quadraticCurveTo(-14, 0, -4, 4); c.quadraticCurveTo(6, 2, 10, -12); c.quadraticCurveTo(0, -6, -10, -12); c.fillStyle = vg(c, -12, 4, '#c8f6ff', '#5ac8d8'); c.fill(); c.strokeStyle = '#2a8a9a'; c.lineWidth = 0.9; c.stroke();
    ell(c, 0, -22, 11, 10.5, rg(c, 0, -22, 11, '#ffffff', '#b8eef8'), '#4ab0c0', 1.1);
    for (const [x, y, a, col] of [[-9, -30, -0.8, '#7acf6a'], [-2, -33, -0.2, '#9ade7a'], [6, -31, 0.5, '#6abf5a']]) { c.save(); c.translate(x, y); c.rotate(a + sin(t * 3 + x) * 0.1); c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-4, -5, 0, -10); c.quadraticCurveTo(4, -5, 0, 2); c.fillStyle = col; c.fill(); line(c, '#3a7a2a', 0.6, [[0, 1], [0, -8]]); c.restore(); }
    eye(c, -3.5, -21, 2.4, '#2a6a7a'); eye(c, 4, -21, 2.4, '#2a6a7a'); blush(c, -7, -17, 2); blush(c, 8, -17, 2); line(c, '#2a6a7a', 0.9, [[-1, -16.5], [1, -15.6], [3, -16.5]]);
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 9, -10); c.rotate(sg * (0.6 + sin(t * 4) * 0.2)); ell(c, sg * 3, 0, 4, 1.6, '#e0faff', '#4ab0c0', 0.6); c.restore(); }
  };
  // 돌풍 산양: 구름 같은 양털 · 크게 말린 뿔 · 발목에 바람 깃털 · 달릴 때 바람 자국
  NEW.wingboar = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const ph = walk(s, t, 12), lunge = sin(s.atk * PI) * 8; c.translate(lunge, s.walk ? -abs(sin(ph)) * 2 : 0);
    if (s.walk || s.atk > 0) for (let i = 0; i < 3; i++) line(c, `rgba(200,230,255,${0.5 - i * 0.12})`, 1.6, [[-34 - i * 6, -22 + i * 6], [-46 - i * 8, -22 + i * 6]]);
    for (const [x, a, col] of [[-16, 0, '#3a3238'], [-8, PI, '#4a4048'], [12, PI * 0.5, '#3a3238'], [20, PI * 1.5, '#4a4048']]) { const st = s.walk ? sin(ph + a) * 0.45 : 0; c.save(); c.translate(x, -14); c.rotate(st); rrect(c, -2.4, 0, 4.8, 14, 2, col); ell(c, 0.4, 14, 3, 1.6, '#1a1418');
      c.save(); c.translate(-2, 9); c.rotate(-0.8); ell(c, -3, 0, 4, 1.4, '#e8f4ff', '#8aaac8', 0.5); c.restore(); c.restore(); }
    for (const [x, y, r] of [[-18, -24, 10], [-6, -30, 12], [8, -28, 11], [-12, -16, 9], [4, -18, 10], [16, -20, 8]]) ell(c, x, y, r, r * 0.85, rg(c, x, y, r, '#ffffff', '#d8dce8'), '#a0a4b8', 1);
    c.save(); c.translate(24, -30); c.rotate(s.atk * 0.3);
    c.beginPath(); c.ellipse(4, 2, 8, 9, -0.3, 0, PI * 2); c.fillStyle = vg(c, -8, 10, '#5a5058', '#2a2228'); c.fill(); c.strokeStyle = '#140c10'; c.lineWidth = 1; c.stroke();
    ell(c, 9, 8, 4, 3, '#3a3238'); ell(c, 2, -6, 5, 3.4, '#ffffff', '#a0a4b8', 0.6);
    c.strokeStyle = '#c8a46a'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.arc(-1, -2, 7, -PI * 0.9, PI * 0.55); c.stroke(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { const a = -PI * 0.8 + i * 0.35; line(c, '#8a6a3a', 1, [[-1 + cos(a) * 5.5, -2 + sin(a) * 5.5], [-1 + cos(a) * 8.6, -2 + sin(a) * 8.6]]); }
    ell(c, 7, 0, 1.8, 2, '#ffd86a', '#3a2a10', 0.5); ell(c, 7.2, 0, 1.6, 0.6, '#1a1010'); c.restore();
  };
  NEW.banditnov = (c, m, t, s) => {
    const sp = { trim: '#c8a050' };
    const gear = { hat: { st: 'leather', c: '#3a6a3a', k: 'bandana', sp }, top: { st: 'leather', c: '#5a4a3a', k: 'vest', sp }, bottom: { st: 'leather', c: '#3a3a44', k: 'pants', sp }, shoes: { st: 'leather', c: '#3a2a20', k: 'boot', sp }, gloves: { st: 'leather', c: '#4a3a2a', k: 'glove', sp } };
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look: look({ hairStyle: 'spiky', hairColor: '#3a2a1a', eye: 'sharp', eyeColor: '#6a4a2a', skin: '#f0c8a0' }, '#5a4a3a', '#3a3a44'), gear, hatColor: '#3a6a3a', weapon: 'dagger', wcolor: '#b0b0b8', scale: 1 });
  };
  // 도적 궁수: 새 그림체 머리 · 갈색 천 두건(어깨까지) · 짧은 망토 · 활
  NEW.banditarch = (c, m, t, s) => {
    const sp = { trim: '#a07a40' };
    const gear = { hat: { st: 'desert', c: '#6a4a30', k: 'desertwrap', sp }, top: { st: 'leather', c: '#5a4a3a', k: 'vest', sp }, bottom: { st: 'leather', c: '#3a3028', k: 'pants', sp }, shoes: { st: 'leather', c: '#3a2a20', k: 'boot', sp }, gloves: { st: 'leather', c: '#4a3a2a', k: 'glove', sp }, cape: { st: 'traveler', c: '#4a3a2a', k: 'capelet', sp } };
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'proj', look: look({ gender: 'f', hairStyle: 'long', hairColor: '#2a1a10', eye: 'sharp', eyeColor: '#5a3a1a', skin: '#e8c098' }, '#5a4a3a', '#3a3028'), gear, hatColor: '#6a4a30', cape: '#4a3a2a', weapon: 'bow', wcolor: '#8a5a2a', scale: 1 });
  };
  // 이끼 덩어리: 이끼 덮인 둥근 바위 젤리 · 늘어진 이끼 가닥 · 작은 버섯과 꽃 · 반짝이는 이슬
  NEW.moss_slime = (c, m, t, s) => {
    const k = m.w / 46; c.scale(k, k); const sq = 1 + sin(t * 3 + (s.walk ? t * 6 : 0)) * 0.05; c.scale(1 / sq, sq);
    c.beginPath(); c.moveTo(-20, 0); c.bezierCurveTo(-24, -14, -14, -28, 0, -28); c.bezierCurveTo(14, -28, 24, -14, 20, 0); c.closePath(); c.fillStyle = rg(c, 0, -14, 24, '#a8d878', '#4a8a2a'); c.fill(); c.strokeStyle = '#2a5a14'; c.lineWidth = 1.4; c.stroke();
    for (let i = 0; i < 7; i++) { const x = -15 + i * 5; c.beginPath(); c.moveTo(x - 2.4, -4); c.quadraticCurveTo(x, 3 + (i % 2) * 2 + sin(t * 2 + i), x + 2.4, -4); c.fillStyle = '#5a9a3a'; c.fill(); }   // 늘어진 이끼
    for (const [x, y, r] of [[-10, -20, 3], [8, -22, 2.4], [12, -12, 2], [-14, -10, 2.2]]) ell(c, x, y, r, r * 0.7, 'rgba(60,110,30,.45)');
    c.save(); c.translate(-6, -27); poly(c, '#e8dcc0', [[-1, 0], [1, 0], [1.2, -5], [-1.2, -5]]); c.beginPath(); c.moveTo(-5, -5); c.quadraticCurveTo(0, -12, 5, -5); c.closePath(); c.fillStyle = '#e04a3a'; c.fill(); ell(c, -1.5, -7, 1, 0.8, '#fff'); ell(c, 2, -6.5, 0.8, 0.6, '#fff'); c.restore();
    c.save(); c.translate(7, -28); for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * PI * 0.4 + t * 0.3); ell(c, 0, -2.4, 1.6, 2.4, '#fff8e0'); c.restore(); } ell(c, 0, 0, 1.4, 1.4, '#ffd040'); c.restore();
    glow(c, 14, -18, 4, '#e8fff0', 0.6 + 0.3 * sin(t * 3)); ell(c, 14, -18, 1.2, 1.2, '#ffffff');
    eye(c, -5, -14, 2.8, '#1e3a10'); eye(c, 5, -14, 2.8, '#1e3a10'); blush(c, -10, -9, 2.4); blush(c, 10, -9, 2.4);
  };
  // 가시 딱정벌레: 윤기 나는 초록 등껍질 + 가시 덩굴 · 큰 뿔 · 6다리 걸음
  NEW.thorn_beetle = (c, m, t, s) => {
    const k = m.w / 56; c.scale(k, k); const ph = walk(s, t, 14), lunge = sin(s.atk * PI) * 6; c.translate(lunge, 0);
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) { const a = ph + i * 2.1 + (sg > 0 ? PI : 0), x = -10 + i * 9; line(c, '#1a2a10', 2, [[x, -10], [x + 3 + sin(a) * 2, -4], [x + 5 + sin(a) * 3, 0]]); }
    c.beginPath(); c.ellipse(-2, -15, 20, 12, 0, PI, 0); c.lineTo(18, -10); c.quadraticCurveTo(-2, -4, -22, -10); c.closePath(); c.fillStyle = rg(c, -6, -20, 22, '#9ad060', '#2a5a14'); c.fill(); c.strokeStyle = '#142a08'; c.lineWidth = 1.4; c.stroke();
    line(c, '#142a08', 1.2, [[-2, -27], [-2, -8]]); ell(c, -10, -21, 6, 2.6, 'rgba(255,255,255,.4)');
    c.strokeStyle = '#4a3a1a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-20, -14); c.bezierCurveTo(-12, -30, 4, -18, 14, -24); c.stroke();   // 가시 덩굴
    for (let i = 0; i < 6; i++) { const u = i / 5, x = -18 + u * 32, y = -16 - sin(u * PI) * 10; poly(c, '#d8b060', [[x - 1.6, y], [x + 1, y - 5], [x + 1.8, y]], '#6a4a10', 0.6); }
    ell(c, 0, -26, 2, 1.4, '#ff6a8a'); ell(c, 10, -23, 1.6, 1.2, '#ff8aa0');   // 덩굴 꽃
    c.save(); c.translate(18, -13); ell(c, 4, 0, 7, 6, vg(c, -6, 6, '#4a7a2a', '#1a3a0a'), '#142a08', 1.2);
    c.strokeStyle = '#3a2a10'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(8, -3); c.quadraticCurveTo(16, -6, 16, -16); c.stroke(); line(c, '#3a2a10', 2, [[14, -10], [18, -11]]);
    ell(c, 7, -1, 2, 2, '#ffd040', '#3a2a10', 0.6); ell(c, 7.6, -1, 0.9, 1.4, '#1a1008'); c.restore();
  };
  // 반딧불 정령: 등불 같은 배(빛이 숨 쉬듯) · 잎사귀 날개 · 작은 더듬이 별 · 반짝이 꼬리
  NEW.firefly_spirit = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const bob = sin(t * 2.8) * 3, br = 0.6 + 0.4 * sin(t * 3); c.translate(s.atk * 5, -12 + bob);
    for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; ell(c, -10 - u * 18, 6 + sin(u * 6 + i) * 4, 1.4 * (1 - u), 1.4 * (1 - u), `rgba(240,255,150,${0.8 * (1 - u)})`); }
    for (const sg of [-1, 1]) { c.save(); c.translate(-2, -6); c.rotate(-0.5 - sg * 0.35 + sin(t * 14 + sg) * 0.25); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -10, 0, -16); c.quadraticCurveTo(6, -10, 0, 0);
      c.fillStyle = 'rgba(200,240,190,.75)'; c.fill(); c.strokeStyle = '#6a9a5a'; c.lineWidth = 0.7; c.stroke(); line(c, '#6a9a5a', 0.5, [[0, -1], [0, -14]]); c.restore(); }
    glow(c, -8, 4, 30, '#f0ff90', 1.1 + br * 0.4); glow(c, -8, 4, 14, '#ffffff', 0.8); glow(c, -8, 4, 50, '#e8ff70', 0.25 + br * 0.15);
    ell(c, -8, 4, 8, 7, rg(c, -8, 4, 8, '#ffffe0', '#e0f060'), '#a0a030', 0.8); for (const x of [-11, -7]) line(c, 'rgba(160,160,40,.5)', 0.8, [[x, -2], [x - 1, 10]]);
    ell(c, 2, -4, 6.5, 6, rg(c, 2, -5, 7, '#5a6a3a', '#2a3418'), '#141a08', 0.9);
    ell(c, 9, -9, 6, 5.6, rg(c, 9, -10, 6, '#6a7a4a', '#2a3418'), '#141a08', 0.9);
    eye(c, 9, -9.5, 2.4, '#1a2a08'); eye(c, 13.5, -9.5, 2, '#1a2a08'); blush(c, 13, -6, 1.6);
    for (const sg of [-1, 1]) { line(c, '#2a3418', 0.8, [[9 + sg * 1.5, -14], [9 + sg * 4, -20]]); const sx = 9 + sg * 4, sy = -21; c.save(); c.translate(sx, sy); c.rotate(t); poly(c, '#fff8a0', [[0, -2.4], [0.7, -0.7], [2.4, 0], [0.7, 0.7], [0, 2.4], [-0.7, 0.7], [-2.4, 0], [-0.7, -0.7]]); c.restore(); }
  };
  if (G.MonArt.crab) G.MonArt.crab.draw = NEW.crab;
  if (G.MonArt.sealizard) G.MonArt.sealizard.draw = NEW.sealizard;
  if (G.MonArt.windspirit) G.MonArt.windspirit.draw = NEW.windspirit;
  if (G.MonArt.wingboar) G.MonArt.wingboar.draw = NEW.wingboar;
  if (G.MonArt.banditnov) G.MonArt.banditnov.draw = NEW.banditnov;
  if (G.MonArt.banditarch) G.MonArt.banditarch.draw = NEW.banditarch;
  if (G.MonArt.moss_slime) G.MonArt.moss_slime.draw = NEW.moss_slime;
  if (G.MonArt.thorn_beetle) G.MonArt.thorn_beetle.draw = NEW.thorn_beetle;
  if (G.MonArt.firefly_spirit) G.MonArt.firefly_spirit.draw = NEW.firefly_spirit;
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris, look = 0.25) => { ell(c, x, y, r, r * 1.15, '#fff', '#2a2a32', 0.6); ell(c, x + r * look, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a36'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const slit = (c, x, y, r, col) => { ell(c, x, y, r, r * 0.9, col, '#1a1008', 0.6); ell(c, x + r * 0.2, y, r * 0.25, r * 0.7, '#1a1008'); ell(c, x - r * 0.2, y - r * 0.3, r * 0.2, r * 0.2, '#fff'); };
  const legs4 = (c, s, t, xs, y, len, w, col, sp = 12) => xs.forEach((x, i) => { const st = s.walk ? sin(t * sp + (i % 2 ? PI : 0) + i * 0.4) * 0.45 : 0; c.save(); c.translate(x, y); c.rotate(st); rrect(c, -w / 2, 0, w, len, w / 2, col); c.restore(); });
  const NEW = {};
  // 태엽 병사: 둥근 양철 몸 · 깃털 투구 · 등의 큰 태엽 (돌아감) · 창 · 볼에 녹 반점
  NEW.clockwork = (c, m, t, s) => {
    const k = m.h / 66; c.scale(k, k); const ph = s.walk ? t * 10 : 0, at = s.atk;
    for (const [x, a] of [[-5, 0], [5, PI]]) { const st = s.walk ? sin(ph + a) * 3 : 0; rrect(c, x - 3, -18, 6, 16, 2, vg(c, -18, -2, '#a0a8b8', '#5a6070'), '#2a2e38', 0.8); rrect(c, x - 4 + st, -4, 9, 4, 2, '#3a3e48'); }
    c.save(); c.translate(-14, -34); c.rotate(t * (s.walk ? 4 : 1.5)); for (const a of [0, PI]) { c.save(); c.rotate(a); ell(c, 0, -6, 3.4, 4.4, null, '#c8a040', 2.2); c.restore(); } line(c, '#c8a040', 2.2, [[-2, 0], [2, 0]]); c.restore();
    ell(c, 0, -32, 13, 15, rg(c, 0, -34, 15, '#e0e6f0', '#7a8090'), '#2a2e38', 1.3); rrect(c, -13, -24, 26, 4, 2, '#c03838', '#5a1010', 0.6);
    for (const y of [-38, -30]) ell(c, 7, y, 1.4, 1.4, '#c8a040'); ell(c, 0, -32, 4, 4, '#c8a040', '#6a4a10', 0.8); ell(c, 0, -32, 1.6, 1.6, '#6a4a10');
    c.save(); c.translate(0, -52); ell(c, 0, 0, 10, 9, rg(c, 0, -1, 10, '#eef2f8', '#8a90a0'), '#2a2e38', 1.2);
    rrect(c, -10, -6, 20, 4, 2, '#c03838'); c.beginPath(); c.moveTo(-3, -9); c.quadraticCurveTo(-2, -20, 8, -18); c.quadraticCurveTo(2, -14, 3, -9); c.closePath(); c.fillStyle = '#e04848'; c.fill(); c.strokeStyle = '#6a1010'; c.lineWidth = 0.8; c.stroke();
    rrect(c, -1, -1, 11, 4, 2, '#2a2e38'); glow(c, 7, 1, 6, '#5ae0ff', 0.7); ell(c, 4, 1, 1.4, 1.2, '#bff4ff'); ell(c, 8, 1, 1.4, 1.2, '#bff4ff'); ell(c, -5, 3, 2, 1.2, 'rgba(200,120,60,.5)'); c.restore();
    c.save(); c.translate(10, -34); c.rotate(-0.15 - at * 0.2); line(c, '#6a4a2a', 2.4, [[-6 + at * 10, 0], [26 + at * 10, 0]]); poly(c, '#e0e6f0', [[26 + at * 10, -3], [34 + at * 10, 0], [26 + at * 10, 3]], '#5a6070', 0.6); ell(c, 0 + at * 6, 0, 3.4, 3.4, vg(c, -3, 3, '#a0a8b8', '#5a6070'), '#2a2e38', 0.8); c.restore();
  };
  // 감시 드론: 둥근 렌즈 눈 · 양쪽 프로펠러 · 안테나 · 아래로 비추는 탐조등 (공격 때 붉게)
  NEW.drone = (c, m, t, s) => {
    const k = m.w / 44; c.scale(k, k); const bob = sin(t * 3) * 3, alert = s.atk > 0; c.translate(0, -14 + bob);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 6, 0, 40); g.addColorStop(0, alert ? 'rgba(255,80,80,.4)' : 'rgba(170,230,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-4, 6); c.lineTo(4, 6); c.lineTo(14, 40); c.lineTo(-14, 40); c.closePath(); c.fill(); c.restore();
    for (const sg of [-1, 1]) { line(c, '#4a5464', 2, [[sg * 10, -4], [sg * 18, -10]]); c.save(); c.translate(sg * 18, -11); c.scale(1, 0.25); c.rotate(t * 30 * sg); for (const a of [0, PI]) { c.save(); c.rotate(a); ell(c, 7, 0, 7, 2, 'rgba(200,220,240,.75)', '#4a5464', 0.5); c.restore(); } c.restore(); ell(c, sg * 18, -11, 2, 1.4, '#3a4250'); }
    ell(c, 0, -2, 13, 10, rg(c, 0, -4, 13, '#e8eef6', '#7a8696'), '#2a323e', 1.3); rrect(c, -13, -2, 26, 3, 1.4, '#3a4250');
    line(c, '#2a323e', 1, [[0, -12], [2, -18]]); ell(c, 2, -19, 1.6, 1.6, alert ? '#ff4040' : '#5aff8a');
    ell(c, 2, 2, 6.4, 6, '#1a2028', '#5a6474', 1); glow(c, 2, 2, 9, alert ? '#ff4040' : '#5ae0ff', 0.8); ell(c, 2, 2, 3.6, 3.4, alert ? '#ff5a5a' : '#7ae8ff'); ell(c, 0.6, 0.6, 1.2, 1.2, '#fff');
  };
  // 서리 망령: 너덜너덜 흘러내리는 서리 망토 · 얼굴 대신 빛나는 두 눈 · 손에 든 얼음 등불 · 흩날리는 눈
  NEW.frost_wraith = (c, m, t, s) => {
    const k = m.h / 56; c.scale(k, k); const bob = sin(t * 2.4) * 3; c.translate(0, -6 + bob);
    c.beginPath(); c.moveTo(-12, -40); c.quadraticCurveTo(-18, -14, -16, 0); for (let i = 0; i < 6; i++) c.quadraticCurveTo(-14 + i * 5.4 + 2.7, -2 + (i % 2 ? 6 : 0) + sin(t * 3 + i) * 2, -10.6 + i * 5.4, 2 + sin(t * 3 + i * 1.3) * 2); c.quadraticCurveTo(18, -14, 12, -40); c.quadraticCurveTo(0, -50, -12, -40); c.closePath();
    c.fillStyle = vg(c, -46, 4, 'rgba(220,240,255,.95)', 'rgba(110,160,210,.35)'); c.fill(); c.strokeStyle = 'rgba(70,120,170,.8)'; c.lineWidth = 1; c.stroke();
    for (const x of [-6, 0, 6]) line(c, 'rgba(80,130,180,.35)', 1.6, [[x * 0.6, -36], [x, -4]]);
    c.beginPath(); c.ellipse(0, -36, 10, 11, 0, 0, PI * 2); c.fillStyle = '#16243a'; c.fill(); c.strokeStyle = 'rgba(200,230,255,.9)'; c.lineWidth = 1.4; c.stroke();
    for (const x of [-3.4, 3.4]) { glow(c, x, -35, 5, '#7ae8ff', 0.9); ell(c, x, -35, 1.8, 1.2, '#e8ffff'); }
    c.save(); c.translate(12, -22); c.rotate(-0.2 - s.atk * 0.5); line(c, 'rgba(200,230,255,.9)', 2.4, [[-4, -2], [6, 0]]); line(c, '#8ab0d0', 0.8, [[8, 0], [8, 4]]); ell(c, 8, 9, 4, 5, 'rgba(200,240,255,.35)', '#9ad0f0', 1); glow(c, 8, 9, 10, '#9af0ff', 0.8 + 0.2 * sin(t * 4)); ell(c, 8, 9, 1.6, 2.4, '#eaffff'); c.restore();
    for (let i = 0; i < 4; i++) { const u = (t * 0.4 + i / 4) % 1; ell(c, -14 + i * 9 + sin(t + i) * 4, -40 + u * 44, 1, 1, `rgba(240,250,255,${0.8 * (1 - u)})`); }
  };
  if (G.MonArt.clockwork) G.MonArt.clockwork.draw = NEW.clockwork;
  if (G.MonArt.drone) G.MonArt.drone.draw = NEW.drone;
  if (G.MonArt.frost_wraith) G.MonArt.frost_wraith.draw = NEW.frost_wraith;
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris) => { ell(c, x, y, r, r * 1.15, '#fff', '#2a2a40', 0.6); ell(c, x + r * 0.25, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a46'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const star = (c, x, y, r, f, s) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } poly(c, f, p, s, 0.7); };
  const legs4 = (c, s, t, xs, y, len, w, col, sp = 12) => xs.forEach((x, i) => { const st = s.walk ? sin(t * sp + (i % 2 ? PI : 0) + i * 0.4) * 0.45 : 0; c.save(); c.translate(x, y); c.rotate(st); rrect(c, -w / 2, 0, w, len, w / 2, col); c.restore(); });
  const look = (o, top, bot) => G.LOOKS.toDraw(Object.assign(G.LOOKS.def(o.gender || 'm'), o), top, bot);
  const NEW = {};
  // 천공의 부엉이: 별무늬 가슴 깃 · 큰 둥근 눈 (금빛 테) · 깃털 귀 · 펼친 날개 끝이 하늘빛
  NEW.thunder_bird = (c, m, t, s) => {
    const k = m.w / 60; c.scale(k, k); const fl = sin(t * 6) * 0.3, bob = sin(t * 3) * 2; c.translate(s.atk * 6, -26 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.translate(8, -4); c.rotate(-0.4 - fl); for (let i = 0; i < 6; i++) { c.save(); c.rotate(-0.15 + i * 0.16); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(12, -4, 26 - i * 1.6, 1); c.quadraticCurveTo(12, 5, 0, 3); c.closePath();
      const g = c.createLinearGradient(0, 0, 26, 0); g.addColorStop(0, '#e8eaff'); g.addColorStop(1, i % 2 ? '#8ea0f0' : '#a8b4f6'); c.fillStyle = g; c.fill(); c.restore(); } c.restore(); }
    c.beginPath(); c.ellipse(0, 0, 12, 15, 0, 0, PI * 2); c.fillStyle = rg(c, 0, -2, 15, '#ffffff', '#c8cef4'); c.fill();
    for (const [x, y] of [[-4, 4], [3, 6], [-1, 10], [4, 0]]) star(c, x, y, 1.8, '#8ea0f0');
    for (const sg of [-1, 1]) poly(c, '#d8dcfa', [[sg * 4, -12], [sg * 10, -20], [sg * 10, -10]]);
    for (const sg of [-1, 1]) { ell(c, sg * 4.6, -6, 4.4, 4.4, '#fff', '#d8a840', 1.2); ell(c, sg * 4.6 + 0.8, -5.6, 2.2, 2.6, '#2a2a5a'); ell(c, sg * 4.6, -7, 0.8, 0.8, '#fff'); }
    poly(c, '#e8b050', [[-1.6, -3], [1.6, -3], [0, 1]]); for (const x of [-3, 3]) line(c, '#e8b050', 1.2, [[x, 14], [x, 17]]);
  };
  // 영웅의 잔영 (정예): 반투명한 옛 영웅 · 새 그림체 머리 · 별빛 망토 · 빛나는 장검 · 발끝이 빛으로 흩어짐
  NEW.trial_echo = (c, m, t, s) => {
    c.save(); c.globalAlpha *= 0.62;
    const sp = { trim: '#bfe0ff', glow: '#9ad0ff' };
    const gear = { hat: { st: 'mithril', c: '#9ac8ff', k: 'plume', sp }, top: { st: 'mithril', c: '#7ab0f0', k: 'surcoat', sp: Object.assign({ cloth: '#3a6ac0' }, sp) }, bottom: { st: 'mithril', c: '#5a8ad0', k: 'greave', sp }, shoes: { st: 'mithril', c: '#7aa8e8', k: 'sabaton', sp }, gloves: { st: 'mithril', c: '#9ac8ff', k: 'gauntlet', sp }, cape: { st: 'mithril', c: '#3a5aa0', k: 'long', sp } };
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look: look({ hairStyle: 'long', hairColor: '#cfe4ff', eye: 'sharp', eyeColor: '#bfe8ff', skin: '#d8ecff' }, '#9ac8ff', '#5a8ad0'), gear, cape: '#3a5aa0', weapon: 'sword', wcolor: '#e8f6ff', scale: 1 });
    c.restore();
    c.save(); c.globalAlpha *= 0.35; glow(c, 0, -34, 30, '#7ab8ff', 1); c.restore();
    for (let i = 0; i < 8; i++) { const u = (t * 0.5 + i / 8) % 1; ell(c, -10 + i * 3 + sin(t + i) * 2, -2 - u * 30, 1.2 * (1 - u) + 0.3, 1.2 * (1 - u) + 0.3, `rgba(200,230,255,${0.8 * (1 - u)})`); }
  };
  if (G.MonArt.thunder_bird) G.MonArt.thunder_bird.draw = NEW.thunder_bird;
  if (G.MonArt.trial_echo) G.MonArt.trial_echo.draw = NEW.trial_echo;
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = f; c.fill(); };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris) => { ell(c, x, y, r, r * 1.15, '#fff'); ell(c, x + r * 0.25, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a36'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const blush = (c, x, y, r) => ell(c, x, y, r, r * 0.55, 'rgba(255,120,140,.45)');
  const NEW = {};
  const body = (c, f) => { c.beginPath(); f(); c.closePath(); };
  // 포자 방울 → 나: 민들레 솜털 정령 — 둥근 솜털 머리(바람에 씨앗이 날림) · 잎 두 장 몸 · 줄기 다리로 깡충
  NEW.spore_b = (c, m, t, s) => {
    const k = m.h / 42 * 1.2; c.scale(k, k); const hop = s.walk ? abs(sin(t * 7)) * 5 : sin(t * 2) * 1; c.translate(s.atk * 5, -hop);
    line(c, '#6aa84a', 2.4, [[0, 0], [0, -12]]); for (const sg of [-1, 1]) { c.save(); c.translate(0, -8); c.rotate(sg * (0.9 + sin(t * 3) * 0.1)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sg * 6, -4, sg * 12, -2); c.quadraticCurveTo(sg * 6, 2, 0, 0); c.fillStyle = '#7ac85a'; c.fill(); c.restore(); }
    for (let i = 0; i < 22; i++) { const a = i / 22 * PI * 2; line(c, 'rgba(255,255,255,.8)', 0.8, [[cos(a) * 7, -24 + sin(a) * 7], [cos(a) * 13, -24 + sin(a) * 13]]); ell(c, cos(a) * 13.6, -24 + sin(a) * 13.6, 1.4, 1.4, i % 3 ? '#efe0ff' : '#d4b0f0'); }   // 씨앗 끝: 옅은 보라 (오염된 포자)
    ell(c, 0, -24, 9, 9, rg(c, 0, -25, 9, '#ffffff', '#e8e4d0'));
    eye(c, -3, -24, 2.2, '#3a4a2a'); eye(c, 3.4, -24, 2.2, '#3a4a2a'); blush(c, -6, -20.6, 1.8); blush(c, 6.4, -20.6, 1.8); c.strokeStyle = '#3a4a2a'; c.lineWidth = 0.9; c.beginPath(); c.arc(0.2, -21, 1.6, 0.2, PI - 0.2); c.stroke();
    for (let i = 0; i < 4; i++) { const u = (t * 0.35 + i / 4) % 1, x = 6 + u * 26, y = -30 - u * 16 + sin(t * 2 + i) * 3; c.save(); c.globalAlpha *= 1 - u; line(c, '#ffffff', 0.6, [[x, y], [x, y + 4]]); for (let j = 0; j < 5; j++) { const a = -PI / 2 + (j - 2) * 0.35; line(c, '#ffffff', 0.5, [[x, y], [x + cos(a) * 3, y + sin(a) * 3]]); } c.restore(); }
  };
  // 설원 늑대 → 가: 털이 풍성한 눈늑대 — 두툼한 목도리 털 · 큰 꼬리 · 이마의 푸른 얼음 무늬 · 발이 눈에 살짝 묻힘
  NEW.snow_wolf_a = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const ph = s.walk ? t * 11 : 0, lunge = sin(s.atk * PI) * 10; c.translate(lunge, s.walk ? -abs(sin(ph)) * 2 : 0);
    c.save(); c.translate(-26, -24); c.rotate(-0.5 + sin(t * 2.5) * 0.12); body(c, () => { c.moveTo(4, 2); c.bezierCurveTo(-6, -12, -26, -8, -26, 4); c.bezierCurveTo(-22, 12, -8, 12, 4, 8); }); c.fillStyle = vg(c, -10, 12, '#ffffff', '#c8d8f0'); c.fill(); ell(c, -22, 4, 5, 4, '#a8c8f0'); c.restore();
    for (const [x, a] of [[-16, 0], [-8, PI], [12, PI], [20, 0]]) { const st = s.walk ? sin(ph + a) * 0.4 : 0; c.save(); c.translate(x, -16); c.rotate(st); rrect(c, -3.6, 0, 7.2, 15, 3.6, vg(c, 0, 15, '#f0f6ff', '#c0d0e8')); ell(c, 0.6, 15, 4.6, 2.4, '#e8f0fc'); c.restore(); }
    body(c, () => { c.ellipse(-2, -24, 24, 11, 0, 0, PI * 2); }); c.fillStyle = vg(c, -35, -13, '#ffffff', '#cad8ee'); c.fill();
    c.save(); c.translate(20, -28); for (let i = 0; i < 9; i++) { const a = -PI * 0.2 + i * PI * 0.15; ell(c, -4 + cos(a) * 7, 4 + sin(a) * 8, 6, 4, '#ffffff'); }
    c.rotate(-0.08 - s.atk * 0.15); body(c, () => { c.ellipse(4, -4, 11, 9, 0, 0, PI * 2); }); c.fillStyle = vg(c, -13, 5, '#ffffff', '#d4e0f2'); c.fill();
    body(c, () => { c.moveTo(10, -6); c.quadraticCurveTo(22, -4, 22, 0); c.quadraticCurveTo(16, 4, 8, 3); }); c.fillStyle = '#eef4fc'; c.fill(); ell(c, 21.6, -1, 1.8, 1.5, '#2a3248');
    for (const [x, a] of [[-1, -0.25], [7, 0.1]]) { c.save(); c.translate(x, -10); c.rotate(a); poly(c, '#ffffff', [[-4, 2], [0, -11], [4, 2]]); poly(c, '#b8d4f4', [[-2, 0], [0, -7], [2, 0]]); c.restore(); }
    poly(c, '#7ab8ff', [[4, -10], [6, -6], [4, -3], [2, -6]]); glow(c, 4, -6.5, 5, '#a0d8ff', 0.6);
    ell(c, 10, -4, 2.6, 2.2, '#3a6ac0'); ell(c, 10.6, -4, 1.2, 1.6, '#0a1a3a'); ell(c, 9.8, -5, 0.6, 0.6, '#fff');
    if (s.atk > 0) poly(c, '#ffffff', [[14, 2], [15, 5], [16, 2]]); c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; ell(c, 44 + u * 10, -30 - u * 4, 2 + u * 3, 1.4 + u * 2, `rgba(230,245,255,${0.6 * (1 - u)})`); }
  };
  // 서리 박쥐 → 가: 고드름 박쥐 — 거꾸로 매달린 듯 둥근 솜털 몸 · 얼음 막 날개(반투명, 결정 무늬) · 큰 귀 · 아래로 떨어지는 고드름 방울
  NEW.frost_bat_a = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const fl = sin(t * 8) * 0.4, bob = sin(t * 3) * 3; c.translate(s.atk * 5, -14 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.rotate(-fl * 0.5);
      body(c, () => { c.moveTo(5, -4); c.quadraticCurveTo(16, -18, 28, -12); c.quadraticCurveTo(25, -6, 27, 0); c.quadraticCurveTo(21, -2, 19, 4); c.quadraticCurveTo(13, 0, 6, 4); }); c.fillStyle = 'rgba(190,230,255,.75)'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 0.6; for (const [x, y] of [[28, -12], [27, 0], [19, 4]]) { c.beginPath(); c.moveTo(6, 0); c.lineTo(x, y); c.stroke(); }
      for (const [x, y] of [[17, -8], [22, -4]]) { c.save(); c.translate(x, y); for (let j = 0; j < 3; j++) { c.rotate(PI / 3); line(c, 'rgba(255,255,255,.8)', 0.6, [[-2, 0], [2, 0]]); } c.restore(); } c.restore(); }
    body(c, () => { c.ellipse(0, -1, 9, 10, 0, 0, PI * 2); }); c.fillStyle = rg(c, 0, -2, 10, '#eaf6ff', '#8ab8e0'); c.fill();
    for (let i = 0; i < 5; i++) ell(c, -5 + i * 2.5, 6 + (i % 2), 2.4, 2, '#d8eeff');
    for (const sg of [-1, 1]) { body(c, () => { c.moveTo(sg * 3, -9); c.quadraticCurveTo(sg * 10, -22, sg * 10, -8); }); c.fillStyle = '#c8e4ff'; c.fill(); body(c, () => { c.moveTo(sg * 4.4, -10); c.quadraticCurveTo(sg * 8.6, -18, sg * 8.6, -9); }); c.fillStyle = '#ffd0e0'; c.fill(); }
    eye(c, -3.4, -2, 2.6, '#3a6ac0'); eye(c, 3.4, -2, 2.6, '#3a6ac0'); blush(c, -6, 2, 1.8); blush(c, 6, 2, 1.8); poly(c, '#fff', [[-1.2, 3.4], [0, 3.4], [-0.6, 5.4]]); poly(c, '#fff', [[0.4, 3.4], [1.6, 3.4], [1, 5.4]]);
    for (let i = 0; i < 2; i++) { const u = (t * 0.6 + i / 2) % 1; c.save(); c.globalAlpha *= 1 - u; poly(c, '#e8f8ff', [[-2 + i * 4, 10 + u * 18], [i * 4, 16 + u * 18], [2 + i * 4, 10 + u * 18]]); c.restore(); }
  };
  if (G.MonArt.spore) G.MonArt.spore.draw = NEW.spore_b;
  if (G.MonArt.snow_wolf) G.MonArt.snow_wolf.draw = NEW.snow_wolf_a;
  if (G.MonArt.frost_bat) G.MonArt.frost_bat.draw = NEW.frost_bat_a;
})();
// 다듬기 표시
for (const id of ['jelly', 'spikeshell', 'fieldrat', 'cave_spider', 'web_bat', 'swamp_toad', 'mine_rat', 'rock_golem', 'fire_imp', 'magma_slime', 'foreman', 'sand_lizard', 'dune_bison', 'canyon_scorpion', 'vulture', 'scorpion_king', 'mummy', 'sand_spirit', 'ice_crab', 'yeti', 'ice_golem', 'frost_giant', 'snow_wolf', 'frost_bat', 'spore', 'cloud_sheep', 'sky_fairy', 'storm_golem', 'star_knight', 'comet_spirit', 'storm_guardian', 'void_shade', 'rift_beast', 'dark_knight', 'cult_mage', 'executor', 'void_serpent', 'abyss_eye']) if (G.MonArt[id]) G.MonArt[id].refine = 'seam';
for (const id of ['crab', 'capshroom', 'sealizard', 'scarecrow', 'windspirit', 'wingboar', 'banditnov', 'banditarch', 'moss_slime', 'thorn_beetle', 'firefly_spirit', 'clockwork', 'drone', 'frost_wraith', 'thunder_bird', 'trial_echo']) if (G.MonArt[id]) G.MonArt[id].refine = 'keep';
