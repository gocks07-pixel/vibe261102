// 몬스터 시안 가 (공통 다듬기) + 나 (새 디자인 7종)
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, c, up = 0.3, dn = -0.3) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, shade(c, up)); g.addColorStop(1, shade(c, dn)); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const eyes = (ctx, x, y, gap, r, iris) => { for (const ex of [x, x + gap]) { ell(ctx, ex, y, r, r * 1.2, '#fff', '#2a2a32', 0.6); ell(ctx, ex + r * 0.25, y + r * 0.1, r * 0.62, r * 0.8, iris || '#2a2a36'); ell(ctx, ex + r * 0.05, y - r * 0.4, r * 0.28, r * 0.28, '#fff'); ell(ctx, ex + r * 0.45, y + r * 0.45, r * 0.12, r * 0.12, '#fff'); } };

  // ===== 가: 공통 다듬기 (외곽선 · 위 밝게 아래 어둡게 · 위쪽 빛 테두리) =====
  let off = null, sil = null;
  G.MonRefine = function (ctx, m, t) {
    const A = G.MonArt[m.id]; if (!A) return G.Draw.monster(ctx, m, t);
    const pad = 60, bw = Math.ceil(m.w * 2.4 + pad * 2), bh = Math.ceil(m.h * 1.8 + pad * 2), S = 2;
    if (!off) { off = document.createElement('canvas'); sil = document.createElement('canvas'); }
    off.width = sil.width = bw * S; off.height = sil.height = bh * S;
    const o = off.getContext('2d'), sc = sil.getContext('2d');
    o.setTransform(S, 0, 0, S, 0, 0);
    const keep = A.sh; A.sh = 0; const mx = m.x, my = m.y; m.x = bw / 2; m.y = bh - pad;
    G.Draw.monster(o, m, t); m.x = mx; m.y = my; A.sh = keep;
    o.setTransform(1, 0, 0, 1, 0, 0);
    // 음영: 위 밝게 · 아래 어둡게
    o.globalCompositeOperation = 'source-atop';
    const g = o.createLinearGradient(0, (bh - pad - m.h) * S, 0, (bh - pad) * S); g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,10,40,.30)');
    o.fillStyle = g; o.fillRect(0, 0, bw * S, bh * S);
    // 실루엣
    sc.clearRect(0, 0, bw * S, bh * S); sc.globalCompositeOperation = 'source-over'; sc.drawImage(off, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = 'rgba(28,18,40,.92)'; sc.fillRect(0, 0, bw * S, bh * S);
    // 빛 테두리: 실루엣을 아래로 밀어 위쪽 가장자리만 남김
    o.globalCompositeOperation = 'source-atop'; o.globalAlpha = 0.35; o.save();
    const rim = document.createElement('canvas'); rim.width = bw * S; rim.height = bh * S; const rc = rim.getContext('2d');
    rc.drawImage(sil, 0, 0); rc.globalCompositeOperation = 'source-in'; rc.fillStyle = '#fff'; rc.fillRect(0, 0, bw * S, bh * S); rc.globalCompositeOperation = 'destination-out'; rc.drawImage(sil, 0, 2.5 * S);
    o.drawImage(rim, 0, 0); o.restore(); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    // 그림자 → 외곽선 → 본그림
    ctx.save(); if (A.sh) D.shadow ? (ctx.translate(m.x, m.y), D.shadow(ctx, m.w * 0.45 * A.sh), ctx.translate(-m.x, -m.y)) : 0;
    const x0 = m.x - bw / 2, y0 = m.y - (bh - pad), a = m.dead ? Math.max(0, 1 - Math.max(0, m.deadT - 0.4) / 0.5) : 1;
    ctx.globalAlpha *= a;
    for (const [dx, dy] of [[-1.3, 0], [1.3, 0], [0, -1.3], [0, 1.3], [-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.drawImage(sil, x0 + dx, y0 + dy, bw, bh);
    ctx.drawImage(off, x0, y0, bw, bh);
    ctx.restore();
  };

  // ===== 나: 새 디자인 =====
  const N = G.MonNew = {};
  // 이슬 젤리: 물방울 모양 + 큰 잎 모자 + 속 거품 + 작은 잎 팔
  N.jelly = (ctx, m, t, s) => {
    const w = m.w / 2, h = m.h, ph = (t * 3.2) % 1, hop = s.walk ? sin(ph * PI) * 9 : 0, sq = s.walk ? 1 + (hop < 2 ? 0.16 : -0.06) : 1 + sin(t * 4) * 0.04;
    ctx.translate(s.atk * 8, -hop);
    ctx.beginPath(); ctx.moveTo(0, -h * 1.12 / sq); ctx.bezierCurveTo(w * 0.5, -h * 0.85 / sq, w * 1.1 * sq, -h * 0.35, w * 0.95 * sq, -h * 0.08);
    ctx.quadraticCurveTo(w * 0.8 * sq, 0, 0, 0); ctx.quadraticCurveTo(-w * 0.8 * sq, 0, -w * 0.95 * sq, -h * 0.08); ctx.bezierCurveTo(-w * 1.1 * sq, -h * 0.35, -w * 0.5, -h * 0.85 / sq, 0, -h * 1.12 / sq);
    const g = ctx.createRadialGradient(-w * 0.3, -h * 0.6, 2, 0, -h * 0.4, h); g.addColorStop(0, '#d8ffc8'); g.addColorStop(0.5, m.d.color); g.addColorStop(1, shade(m.d.color, -0.35));
    ctx.globalAlpha *= 0.94; ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = shade(m.d.color, -0.5); ctx.lineWidth = 1.8; ctx.stroke(); ctx.globalAlpha /= 0.94;
    for (const [x, y, r] of [[-w * 0.45, -h * 0.25, 3], [w * 0.5, -h * 0.42, 2.2], [-w * 0.15, -h * 0.12, 1.6]]) ell(ctx, x, y + sin(t * 2 + x) * 1.5, r, r, 'rgba(255,255,255,.45)');
    ctx.beginPath(); ctx.ellipse(-w * 0.32, -h * 0.72 / sq, w * 0.18, h * 0.16, -0.5, 0, PI * 2); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
    eyes(ctx, -w * 0.12, -h * 0.48 / sq, w * 0.5, 3.6, '#2a5a22');
    ell(ctx, -w * 0.32, -h * 0.34 / sq, 3, 1.6, 'rgba(255,120,140,.55)'); ell(ctx, w * 0.72, -h * 0.34 / sq, 3, 1.6, 'rgba(255,120,140,.55)');
    ctx.fillStyle = '#2a4a22'; ctx.beginPath(); ctx.arc(w * 0.13, -h * 0.33 / sq, 2.2, 0, PI); ctx.fill();
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * w * 0.95, -h * 0.3); ctx.rotate(sg * (0.6 + sin(t * 4) * 0.2)); ell(ctx, sg * 4, 0, 5, 2.4, '#5ab84a', '#2e7a2a', 0.8); ctx.restore(); }
    ctx.save(); ctx.translate(0, -h * 1.08 / sq); ctx.rotate(-0.35 + sin(t * 3) * 0.12);
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-14, -12, 2, -18); ctx.quadraticCurveTo(14, -10, 2, 0); ctx.fillStyle = vg(ctx, -18, 0, '#6ad05a'); ctx.fill(); ctx.strokeStyle = '#2e7a2a'; ctx.lineWidth = 1; ctx.stroke();
    line(ctx, '#2e7a2a', 0.8, [[0, -1], [1, -15]]); ctx.restore();
  };
  // 버섯 기사: 투구처럼 생긴 갓(눈 틈) + 포자 문장 방패 + 깃발 창
  N.capshroom = (ctx, m, t, s) => {
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
  N.scarecrow = (ctx, m, t, s) => {
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
  // 들판 도적쥐: 빨간 반다나 + 도토리 배낭 + 큰 꼬리
  N.fieldrat = (ctx, m, t, s) => {
    const w = m.w / 2, run = s.walk ? t * 20 : 0, hop = s.walk ? abs(sin(run)) * 3 : 0; ctx.translate(s.atk * 7, -hop);
    ctx.strokeStyle = shade(m.d.color, 0.2); ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w * 0.6, -10); ctx.bezierCurveTo(-w * 1.2, -12, -w * 1.2, -30 + sin(t * 4) * 3, -w * 0.8, -32); ctx.stroke();
    for (const [x, ph] of [[-w * 0.35, 0], [w * 0.3, PI]]) { ctx.save(); ctx.translate(x, -6); ctx.rotate(sin(run + ph) * 0.6); rrect(ctx, -2.6, 0, 5.2, 7, 2, m.d.color2); ctx.restore(); }
    ell(ctx, -3, -13, w * 0.7, 12, vg(ctx, -25, -1, m.d.color), m.d.color2, 1.6); ell(ctx, 1, -8, w * 0.42, 5, shade(m.d.color, 0.35));
    // 도토리 배낭
    ctx.save(); ctx.translate(-w * 0.35, -22); ell(ctx, 0, 0, 7, 8, vg(ctx, -8, 8, '#a8743a'), '#5a3a1a', 1); ell(ctx, 0, -6, 7.6, 3.6, '#6a4a2a', '#3a2210', 1); line(ctx, '#3a2210', 1.4, [[0, -9], [1, -12]]); ctx.restore();
    line(ctx, '#5a3a1a', 1.4, [[-w * 0.2, -24], [w * 0.15, -6]]);
    ell(ctx, w * 0.52, -17, 12.5, 10.5, vg(ctx, -28, -6, m.d.color), m.d.color2, 1.6);
    ell(ctx, w * 0.28, -28, 7.4, 7.4, m.d.color, m.d.color2, 1.4); ell(ctx, w * 0.28, -28, 4.4, 4.4, '#f4b8b8');
    poly(ctx, '#c83a3a', [[w * 0.1, -24], [w * 0.95, -23], [w * 0.9, -19.5], [w * 0.12, -20]], '#7a1a1a', 0.7);   // 반다나
    poly(ctx, '#c83a3a', [[w * 0.1, -23], [-w * 0.15, -27 + sin(t * 8) * 1.5], [-w * 0.1, -20]]);
    ell(ctx, w * 0.95, -15, 2.8, 2.4, '#e07080'); eyes(ctx, w * 0.58, -16, 6, 2.2);
    rrect(ctx, w * 0.8, -11, 4, 4 + s.atk * 2, 1, '#fffbe8');
    for (const dy of [-2, 1]) line(ctx, 'rgba(40,30,20,.6)', 0.8, [[w * 0.92, -14 + dy], [w * 1.35, -16 + dy * 2]]);
  };
  // 쉘로크: 산호 성 껍데기 (탑 · 깃발) + 따개비 붙은 큰 집게 + 빛나는 눈
  N.shellock = (ctx, m, t, s) => {
    const k = m.w / 170; ctx.scale(k, k);
    const guard = m.boss && m.boss.guarding, raise = m.boss ? m.boss.raise : 0, step = s.walk ? t * 9 : t;
    const L2 = (c, x, y, len, ph) => { const kx = x + len * 0.55, ky = y - abs(len) * 0.45 + sin(ph) * 3; line(ctx, c, 6, [[x, y], [kx, ky], [x + len, sin(ph) * 1.5]]); };
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) L2(m.d.color2, sg * 18, -20, sg * (40 + i * 8), step + i * 1.7 + (sg > 0 ? PI : 0));
    ctx.save(); ctx.translate(-26, -70);
    const sg2 = ctx.createLinearGradient(0, -60, 0, 40); sg2.addColorStop(0, '#f8d8c8'); sg2.addColorStop(1, '#c08070');
    ctx.beginPath(); ctx.moveTo(-58, 38); ctx.quadraticCurveTo(-70, -20, -30, -40); ctx.lineTo(-22, -70); ctx.lineTo(-10, -48); ctx.lineTo(4, -86); ctx.lineTo(18, -50); ctx.lineTo(34, -64); ctx.lineTo(40, -32); ctx.quadraticCurveTo(70, -6, 58, 38); ctx.closePath();
    ctx.fillStyle = sg2; ctx.fill(); ctx.strokeStyle = '#7a4a3a'; ctx.lineWidth = 3; ctx.stroke();
    for (const [x, y] of [[-30, 0], [-6, -20], [18, 6], [-16, 24], [34, 22]]) { ell(ctx, x, y, 7, 5, '#e8a898', '#9a5a4a', 1.5); ell(ctx, x, y, 2.5, 2, '#9a5a4a'); }
    rrect(ctx, -2, -30, 12, 18, 6, '#3a2a40'); ell(ctx, 4, -24, 2, 2, '#ffd060');   // 창문
    line(ctx, '#7a4a3a', 2, [[4, -86], [4, -104]]); ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.moveTo(4, -104); ctx.lineTo(22 + sin(t * 5) * 3, -99); ctx.lineTo(4, -94); ctx.fill();
    for (const [x, y, c] of [[-40, 30, '#e05a7a'], [44, 30, '#5ab0c8']]) { line(ctx, c, 4, [[x, y], [x - 4, y - 14]]); line(ctx, c, 3, [[x - 2, y - 8], [x + 6, y - 16]]); }   // 산호
    ctx.restore();
    if (guard) { for (let i = 0; i < 3; i++) ell(ctx, 30 + i * 12, -60 - ((t * 40 + i * 20) % 60), 4, 4, 'rgba(200,230,255,.6)'); return; }
    ell(ctx, 18, -34, 44, 26, vg(ctx, -60, -8, m.d.color), m.d.color2, 3);
    ell(ctx, 58, -24, 13, 9, m.d.color, m.d.color2, 2.5);
    ctx.save(); ctx.translate(48, -50); ctx.rotate(-0.4 - raise * 1.3 + s.atk * 0.3);
    rrect(ctx, 0, -9, 34, 18, 9, vg(ctx, -9, 9, m.d.color), m.d.color2); ctx.translate(42, 0);
    ell(ctx, 0, 0, 25, 18, vg(ctx, -18, 18, m.d.color, 0.25, -0.25), m.d.color2, 3);
    for (const [x, y] of [[-10, -8], [-2, -12], [-12, 4]]) { ell(ctx, x, y, 4, 3.4, '#e8e0d0', '#8a8070', 1); ell(ctx, x, y - 1, 1.4, 1, '#5a5048'); }
    const op = raise > 0 ? 0.6 : abs(sin(t * 2)) * 0.25; ctx.save(); ctx.rotate(-op); ctx.fillStyle = shade(m.d.color, 0.15); ctx.beginPath(); ctx.ellipse(20, -9, 18, 8, -0.3, 0, PI * 2); ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.stroke();
    for (let i = 0; i < 4; i++) poly(ctx, '#fff4e0', [[8 + i * 6, -3], [11 + i * 6, -3], [9.5 + i * 6, 1]]); ctx.restore();
    ctx.restore();
    line(ctx, m.d.color2, 4, [[24, -56], [22, -82]]); line(ctx, m.d.color2, 4, [[40, -54], [42, -80]]);
    for (const x of [22, 42]) { glow(ctx, x, -86, 14, '#ffd060', 0.5); ell(ctx, x, -86, 8, 8, '#fff8e0', m.d.color2, 2); ell(ctx, x + 2, -85, 4, 5, '#c03010'); ell(ctx, x + 3, -87, 1.4, 1.4, '#fff'); }
    line(ctx, '#300', 3, [[14, -97], [28, -92]]); line(ctx, '#300', 3, [[36, -92], [50, -97]]);
  };
  // 붉은손 바르크: 새 그림체 머리 · 붉은 두건 · 사막 유랑자 옷(붉게) · 언월도
  N.bark = (ctx, m, t) => {
    const eq = { hat: { tid: 'ar50_hat' }, top: { tid: 'ar50_top' }, bottom: { tid: 'ar50_bottom' }, shoes: { tid: 'ar50_shoes' }, gloves: { tid: 'ar50_gloves' }, cape: { tid: 'ar50_cape' }, weapon: { tid: 'wp50_warrior' } };
    for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    const look = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'tail', hairColor: '#c0402a', eye: 'sharp', eyeColor: '#c03040', skin: '#e0a878' }), '#a02a2a', '#4a2a2a');
    look.beard = true;
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look, gear: G.Outfit.gearOf(eq), hatColor: '#8a1a1a', cape: '#5a1a1a', weapon: 'sword', wcolor: '#e8e4dc', scale: 1.7 });
  };
  // 모르웬: 가지 뿔 왕관의 숲 정령 (흐르는 잎 머리 · 보랏빛 오염 핏줄 · 뿌리 치마 · 떠다니는 꽃잎)
  N.morwen = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk, sway = sin(t * 1.5) * 0.04, ec = ph ? '#ff40c0' : '#d070ff';
    ctx.rotate(sway);
    for (let i = 0; i < 9; i++) { const x = -w * 0.7 + i * w * 0.175; line(ctx, '#3a2a18', 5 - abs(i - 4) * 0.6, [[x * 0.4, -h * 0.3], [x * 0.9, -h * 0.1], [x * 1.25 + sin(t + i) * 3, 0]]); }
    const g = ctx.createLinearGradient(0, -h * 0.75, 0, 0); g.addColorStop(0, '#7a8a4a'); g.addColorStop(0.5, '#4a5a2a'); g.addColorStop(1, '#2a2a14');
    ctx.beginPath(); ctx.moveTo(-w * 0.18, -h * 0.72); ctx.quadraticCurveTo(-w * 0.2, -h * 0.4, -w * 0.62, -h * 0.06); ctx.quadraticCurveTo(0, -h * 0.02, w * 0.62, -h * 0.06); ctx.quadraticCurveTo(w * 0.2, -h * 0.4, w * 0.18, -h * 0.72); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#1a1a0a'; ctx.lineWidth = 1.6; ctx.stroke();
    for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(-w * 0.45 + i * w * 0.22, -h * 0.12); ell(ctx, 0, 0, 5, 9, i % 2 ? '#5a7a3a' : '#6a8a4a', '#2a3a1a', 0.6); ctx.restore(); }
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 8; ctx.strokeStyle = ec; ctx.lineWidth = ph ? 2.2 : 1.4;
    for (const [a, b] of [[[0, -h * 0.66], [-w * 0.15, -h * 0.4]], [[0, -h * 0.6], [w * 0.2, -h * 0.3]], [[-w * 0.15, -h * 0.4], [-w * 0.35, -h * 0.15]]]) { ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo((a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2, ...b); ctx.stroke(); }
    ctx.restore();
    for (const sg of [-1, 1]) {   // 가느다란 가지 팔
      const up = cast * 1.4 + sin(t * 2 + sg) * 0.1; ctx.save(); ctx.translate(sg * w * 0.16, -h * 0.68); ctx.rotate(-sg * (0.5 + up));
      line(ctx, '#5a4a2a', 6, [[0, 0], [0, h * 0.26]]); line(ctx, '#5a4a2a', 3, [[0, h * 0.26], [sg * 7, h * 0.36]]); line(ctx, '#5a4a2a', 2.4, [[0, h * 0.26], [-sg * 3, h * 0.37]]);
      ell(ctx, sg * 7, h * 0.37, 4, 2.4, '#e070c0'); if (cast > 0) glow(ctx, 0, h * 0.34, 24, '#c060ff', 0.8); ctx.restore();
    }
    // 얼굴 (나무껍질 가면 같은 고운 얼굴)
    ell(ctx, 0, -h * 0.79, w * 0.2, h * 0.095, vg(ctx, -h * 0.87, -h * 0.71, '#c8b088', 0.15, -0.2), '#4a3a20', 1.4);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 10; ell(ctx, -w * 0.06, -h * 0.8, 3.4, 2, ec); ell(ctx, w * 0.06, -h * 0.8, 3.4, 2, ec); ctx.restore();
    line(ctx, '#4a2a3a', 1.2, [[-w * 0.04, -h * 0.75], [w * 0.04, -h * 0.75]]);
    // 흐르는 잎 머리
    for (let i = 0; i < 12; i++) { const sg = i < 6 ? -1 : 1, j = i % 6; ctx.save(); ctx.translate(sg * (w * 0.26 + j * 2.2), -h * 0.84 + j * h * 0.075); ctx.rotate(sg * (0.3 + j * 0.08) + sin(t * 2 + i) * 0.08);
      ell(ctx, 0, 6, 3.4, 9, j % 3 === 2 ? (ph ? '#8a3aa0' : '#8a9a4a') : (j % 2 ? '#5a7a3a' : '#6a9a4a'), '#2a3a1a', 0.5); ctx.restore(); }
    // 가지 뿔 왕관
    for (const sg of [-1, 1]) { line(ctx, '#4a3a22', 3.4, [[sg * w * 0.08, -h * 0.87], [sg * w * 0.2, -h * 1.0], [sg * w * 0.16, -h * 1.1]]); line(ctx, '#4a3a22', 2.4, [[sg * w * 0.2, -h * 1.0], [sg * w * 0.34, -h * 1.06], [sg * w * 0.4, -h * 1.15]]); line(ctx, '#4a3a22', 2, [[sg * w * 0.3, -h * 1.04], [sg * w * 0.3, -h * 1.12]]);
      ell(ctx, sg * w * 0.4, -h * 1.15, 3.4, 2.4, '#e070c0'); ell(ctx, sg * w * 0.16, -h * 1.1, 2.8, 2, '#f0a0d0'); }
    for (let i = 0; i < 4; i++) { const yy = (t * 26 + i * 40) % (h * 0.9); ctx.save(); ctx.translate(-w * 0.5 + i * w * 0.33, -h * 0.95 + yy); ctx.rotate(t * 2 + i); ell(ctx, 0, 0, 3.4, 1.8, ph ? '#c060e0' : '#f0a0d0'); ctx.restore(); }
  };
})();
