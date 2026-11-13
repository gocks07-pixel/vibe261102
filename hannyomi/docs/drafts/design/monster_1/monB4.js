(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N3 = G.MonNew3 = {};
  const eqOf = o => { for (const k in o) if (!G.ITEMS[o[k].tid]) delete o[k]; return o; };
  // 엘드리크 3: 사람 모양 대사제 — 은발 긴 머리 · 붉은 신비로운 눈 · 태양의 사제 높은 관과 흰 예복(검은 장막 망토) · 초승달 지팡이 · 뒤의 깨진 붉은 유리 후광
  N3.eldrick = (ctx, m, t, s) => {
    const casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff4080' : '#c060ff';
    ctx.save(); ctx.translate(-4, -128); for (let i = 0; i < 10; i++) { const a = t * 0.5 + i * PI / 5; ctx.save(); ctx.translate(cos(a) * 30, sin(a) * 30); ctx.rotate(a + PI / 2); poly(ctx, 'rgba(200,40,80,.85)', [[-3, 0], [3, 0], [0, -11]], '#ff90a0', 0.6); ctx.restore(); }
    ctx.strokeStyle = 'rgba(255,120,150,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 24, 0, PI * 2); ctx.stroke(); glow(ctx, 0, 0, 34, ec, 0.4); ctx.restore();
    const look = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'long', hairColor: '#e0e4f0', eye: 'mystic', eyeColor: '#c03040', skin: '#e8d8d0' }), '#f4f1e8', '#2a1a3a');
    look.beard = true;
    const eq = eqOf({ hat: { tid: 'ar90_hat' }, top: { tid: 'ar60_top' }, bottom: { tid: 'ar60_bottom' }, shoes: { tid: 'ar60_shoes' }, gloves: { tid: 'ar60_gloves' }, cape: { tid: 'ar60_cape' }, weapon: { tid: 'wp90_mage' } });
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: casting ? 0.5 : -1, atkKind: 'proj', look, gear: G.Outfit.gearOf(eq), hatColor: '#2a1a4a', cape: '#1a0a2a', weapon: 'wand', wcolor: '#c890ff', scale: 1.55 });
  };
  // 모르웬 3: 시든 꽃의 여왕 — 커다란 꽃잎 치마(보라 · 분홍) · 가녀린 줄기 몸 · 시든 장미 왕관 · 가시 덩굴 채찍 · 꽃가루
  N3.morwen = (ctx, m, t, s) => {
    ctx.scale(1.35, 1.35); const h = m.h / 1.1, w = m.w / 2 / 1.1, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk, P1 = ph ? '#a030c0' : '#c050c8', P2 = ph ? '#6a1a8a' : '#8a3aa0';
    for (let i = 0; i < 9; i++) { const a = PI + 0.1 + i * (PI - 0.2) / 8, r = w * 0.95; ctx.save(); ctx.translate(cos(a) * r * 0.25, -h * 0.12); ctx.rotate(a - PI * 1.5);   // 꽃잎 치마
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-14, -h * 0.18, 0, -h * 0.32 - (i % 2) * 6); ctx.quadraticCurveTo(14, -h * 0.18, 0, 0); ctx.fillStyle = vg(ctx, -h * 0.32, 0, i % 2 ? P1 : '#e070c0', P2); ctx.fill(); ctx.strokeStyle = '#3a0a3a'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
    for (let i = 0; i < 6; i++) { const x = -w * 0.5 + i * w * 0.2; line(ctx, '#2a3a1a', 3, [[x * 0.5, -h * 0.06], [x, 0]]); }
    ctx.beginPath(); ctx.moveTo(-6, -h * 0.2); ctx.quadraticCurveTo(-10, -h * 0.45, -8, -h * 0.66); ctx.lineTo(8, -h * 0.66); ctx.quadraticCurveTo(10, -h * 0.45, 6, -h * 0.2); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.66, -h * 0.2, '#7aa04a', '#3a5a2a'); ctx.fill(); ctx.strokeStyle = '#1a2a0a'; ctx.lineWidth = 1.2; ctx.stroke();   // 줄기 몸
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 5, -h * 0.4); ctx.rotate(sg * 0.6); ell(ctx, sg * 8, 0, 10, 4, '#6a9a4a', '#2a3a1a', 0.8); ctx.restore(); }   // 잎
    for (const sg of [-1, 1]) {   // 가시 덩굴 채찍
      const up = cast * 1.3 + sin(t * 2 + sg) * 0.2; ctx.save(); ctx.translate(sg * 7, -h * 0.62); ctx.rotate(sg * (0.8 - up));
      ctx.strokeStyle = '#3a5a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sg * 18, 14, sg * 6, 34, sg * 22, 52 + sin(t * 3) * 4); ctx.stroke();
      for (let k = 1; k < 5; k++) { const yy = k * 11, xx = sg * (10 + sin(k) * 6); poly(ctx, '#2a3a1a', [[xx, yy], [xx + sg * 5, yy - 3], [xx + 1, yy + 2]]); }
      ell(ctx, sg * 22, 54, 4, 3, '#e070c0'); if (cast > 0) glow(ctx, sg * 22, 54, 20, '#c060ff', 0.8); ctx.restore(); }
    // 얼굴 · 머리
    ell(ctx, 0, -h * 0.74, w * 0.15, h * 0.08, vg(ctx, -h * 0.82, -h * 0.66, '#e8d0e0', '#b898b0'), '#4a2a3a', 1.2);
    ctx.save(); ctx.shadowColor = '#ff60d0'; ctx.shadowBlur = 8; for (const sg of [-1, 1]) ell(ctx, sg * w * 0.05 + 1, -h * 0.75, 2.4, 1.4, ph ? '#ff40c0' : '#e070ff'); ctx.restore();
    ctx.fillStyle = '#7a2a5a'; ctx.beginPath(); ctx.arc(1, -h * 0.71, 2, 0, PI); ctx.fill();
    for (let i = 0; i < 8; i++) { const sg = i < 4 ? -1 : 1, j = i % 4; ctx.save(); ctx.translate(sg * (w * 0.14 + j * 2), -h * 0.78 + j * h * 0.05); ell(ctx, 0, 6, 3, 8, j % 2 ? P2 : P1, '#3a0a3a', 0.5); ctx.restore(); }   // 꽃잎 머리
    // 시든 장미 왕관
    for (const [x, r] of [[-w * 0.16, 6], [0, 8], [w * 0.16, 6]]) { const y = -h * 0.86 - (x ? 0 : 3); ell(ctx, x, y, r, r * 0.85, vg(ctx, y - r, y + r, '#c03060', '#5a1030'), '#3a0820', 1);
      ctx.strokeStyle = '#3a0820'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, PI * 1.5); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { const yy = (t * 22 + i * 30) % (h * 0.9); ell(ctx, -w * 0.6 + i * w * 0.24 + sin(t + i) * 6, -h * 0.9 + yy, 1.6, 1.6, ph ? 'rgba(200,90,255,.8)' : 'rgba(255,200,240,.8)'); }   // 꽃가루
  };
  // 녹스 3: 그림자 날개의 공허 마법왕 — 검은 깃털 날개 · 별하늘 긴 옷 · 검은 별 왕관 · 빛나는 가면 · 도는 눈 여섯 · 검은 태양 지팡이
  N3.nox = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase || 0 : 0, ec = ph ? '#ff40c0' : '#d070ff', fl = sin(t * 1.6) * 0.06;
    glow(ctx, 0, -h * 0.55, h * 0.55, '#4a1a80', 0.35);
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 10, -h * 0.72); ctx.scale(sg, 1); ctx.rotate(-0.2 - fl);   // 그림자 깃털 날개
      for (let i = 0; i < 9; i++) { ctx.save(); ctx.rotate(-0.7 + i * 0.17); const L = 90 - i * 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -10, L, -2); ctx.quadraticCurveTo(L * 0.5, 8, 0, 4); ctx.closePath();
        ctx.fillStyle = vg(ctx, -10, 8, i % 2 ? '#2a1440' : '#1a0a2a', '#08020e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 0.6; ctx.stroke(); ctx.restore(); } ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.moveTo(-w * 0.3, -h * 0.76); ctx.quadraticCurveTo(-w * 0.55, -h * 0.4, -w * 0.62, 0); ctx.lineTo(w * 0.62, 0); ctx.quadraticCurveTo(w * 0.55, -h * 0.4, w * 0.3, -h * 0.76); ctx.closePath();   // 긴 옷
    ctx.fillStyle = vg(ctx, -h * 0.76, 0, '#2a1048', '#0a0418'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.2; ctx.stroke(); ctx.clip();
    for (let i = 0; i < 18; i++) { const x = ((i * 41) % 100 - 50) / 50 * w * 0.55, y = -((i * 57) % 100) / 100 * h * 0.72; ell(ctx, x, y, i % 5 ? 0.9 : 1.6, i % 5 ? 0.9 : 1.6, `rgba(255,255,255,${0.45 + 0.4 * sin(t * 2 + i)})`); } ctx.restore();
    line(ctx, '#c8a0ff', 1.4, [[-w * 0.3, -h * 0.5], [w * 0.3, -h * 0.5]]);
    // 머리: 검은 두건 + 빛나는 가면 + 검은 별 왕관
    const hy = -h * 0.84; ell(ctx, 0, hy, 17, 19, vg(ctx, hy - 19, hy + 19, '#2a1440', '#0a0418'), ec, 1.2);
    ell(ctx, 3, hy + 2, 10, 12, vg(ctx, hy - 10, hy + 14, '#f0e8ff', '#a898c8'), '#5a4a80', 1);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 10; for (const x of [-1, 7]) poly(ctx, ec, [[x - 3, hy], [x + 3, hy - 1], [x, hy + 2]]); ctx.restore();
    for (let i = 0; i < 5; i++) { const a = -PI * 0.85 + i * PI * 0.175; ctx.save(); ctx.translate(cos(a) * 18, hy - 6 + sin(a) * 16); ctx.rotate(a + PI / 2); poly(ctx, '#14081e', [[-3, 0], [0, -12 - (i === 2 ? 6 : 0)], [3, 0]], ec, 0.7); ctx.restore(); }
    // 도는 눈 여섯
    for (let i = 0; i < 6; i++) { const a = t * 0.9 + i * PI / 3, x = cos(a) * w * 0.95, y = -h * 0.5 + sin(a) * h * 0.18; if (sin(a) < -0.2) continue;
      ell(ctx, x, y, 6, 4, '#f0e0ff', '#3a1a5a', 0.8); ell(ctx, x + 1, y, 2, 3, ec); glow(ctx, x, y, 10, ec, 0.4); }
    // 검은 태양 지팡이
    ctx.save(); ctx.translate(w * 0.5, -h * 0.5); ctx.rotate(-0.12 - s.atk * 0.4); line(ctx, '#14081e', 4, [[0, 50], [0, -60]]); line(ctx, '#8a6ab0', 1, [[1, 46], [1, -56]]);
    glow(ctx, 0, -68, 26, ec, 0.8); ell(ctx, 0, -68, 11, 11, '#08020e', ec, 2); for (let i = 0; i < 8; i++) { const a = i * PI / 4 + t; line(ctx, ec, 1.4, [[cos(a) * 13, -68 + sin(a) * 13], [cos(a) * 18, -68 + sin(a) * 18]]); } ctx.restore();
  };
})();
