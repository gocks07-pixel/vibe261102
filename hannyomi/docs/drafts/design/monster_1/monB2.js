(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N = G.MonNew;
  const human = (m, t, look, eq, o) => { const gear = G.Outfit.gearOf(eq); return Object.assign({ x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look, gear }, o); };
  const lk = (o, top, bot) => G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), o), top, bot);

  // 그라운더 MK-7 → 증기 거신: 둥근 유리 조종석(빛나는 노심) · 드릴 팔 + 집게 팔 · 피스톤 다리 · 굴뚝
  N.grounder = (c, m, t, s) => {
    c.scale(m.w / 130, m.h / 190);
    const step = s.walk ? sin(t * 4) : 0, raise = m.boss ? m.boss.raise : 0, hot = !!m.hot;
    const BR = '#b8862a', BRD = '#6a4a1a', ST = '#8a94a4', STD = '#4a5464', OUT = '#1c222c';
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 26, -62); c.rotate(sg * step * 0.08);   // 다리
      rrect(c, -12, 0, 24, 34, 5, vg(c, 0, 34, '#a4afbe', ST), OUT, 2); rrect(c, -7, 30, 14, 22, 3, vg(c, 30, 52, '#c8d0da', '#8a94a4'), OUT, 1.6);
      poly(c, vg(c, 50, 62, ST, STD), [[-18, 62], [20, 62], [16, 50], [-14, 50]], OUT, 2); c.restore(); }
    for (const x of [-40, -24]) { rrect(c, x - 6, -188, 12, 44, 3, vg(c, -188, -144, BR, BRD), OUT, 1.8); rrect(c, x - 8, -192, 16, 6, 2, '#3a3028', OUT, 1.4);   // 굴뚝
      if (hot) glow(c, x, -196, 22, '#ff6020', 0.8); }
    c.beginPath(); c.ellipse(0, -110, 56, 52, 0, 0, PI * 2); c.fillStyle = vg(c, -162, -58, '#c8a050', BRD); c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();   // 황동 몸통
    for (let i = 0; i < 10; i++) { const a = i * PI / 5; ell(c, cos(a) * 50, -110 + sin(a) * 46, 2.6, 2.6, '#e8c870', OUT, 0.8); }
    c.beginPath(); c.ellipse(4, -120, 30, 28, 0, 0, PI * 2); c.fillStyle = 'rgba(160,230,255,.35)'; c.fill(); c.strokeStyle = '#5a6a7a'; c.lineWidth = 4; c.stroke();   // 유리 조종석
    glow(c, 4, -116, 30, hot ? '#ff7030' : '#5ae0ff', 0.9); ell(c, 4, -116, 10, 10, hot ? '#ffb070' : '#bff4ff');
    for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; ell(c, 4 + cos(a) * 16, -116 + sin(a) * 14, 3, 3, '#e8f8ff'); }
    ell(c, -6, -138, 10, 5, 'rgba(255,255,255,.45)');
    rrect(c, -50, -70, 100, 14, 5, vg(c, -70, -56, ST, STD), OUT, 2);   // 허리
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#1a1a1e' : '#f2c230'; c.fillRect(-46 + i * 11.5, -66, 11.5, 6); }
    // 드릴 팔 (앞)
    c.save(); c.translate(48, -122); c.rotate(-0.2 - raise * 0.9 + s.atk * 0.4);
    rrect(c, 0, -12, 34, 24, 8, vg(c, -12, 12, ST, STD), OUT, 2); c.translate(34, 0);
    poly(c, vg(c, -16, 16, '#d8dee8', '#6a7688'), [[0, -16], [46, 0], [0, 16]], OUT, 2);
    for (let i = 0; i < 4; i++) { const x = 6 + i * 10 + ((t * 40) % 10); line(c, '#4a5464', 2, [[x, -14 + x * 0.3], [x + 5, 14 - x * 0.3]]); }
    c.restore();
    // 집게 팔 (뒤)
    c.save(); c.translate(-50, -118); c.rotate(0.5 + sin(t * 2) * 0.1); rrect(c, -32, -10, 34, 20, 7, vg(c, -10, 10, ST, STD), OUT, 2); c.translate(-36, 0);
    for (const sg of [-1, 1]) poly(c, ST, [[0, 0], [-18, sg * 14], [-26, sg * 6], [-10, sg * 2]], OUT, 1.8); c.restore();
    ell(c, 30, -152, 6, 6, '#c03030', OUT, 1.5); glow(c, 30, -152, 10, '#ff4040', 0.6);   // 경광등
  };
  // 파라칸 → 모래 폭군: 사자 갈기 금 망토 · 모래 왕국 근위병 차림(금빛) · 태양 갈고리검 · 모래 소용돌이
  N.parakan = (ctx, m, t, s) => {
    for (let i = 0; i < 14; i++) { const a = t * 1.8 + i * 0.45; ell(ctx, cos(a) * (44 + i % 3 * 6), -30 + sin(a) * 10 - i * 2.4, 2.2, 1.6, 'rgba(230,200,120,.55)'); }
    ctx.save(); ctx.scale(1.7, 1.7);
    for (let i = 0; i < 11; i++) { const a = PI * 0.55 + i * PI * 0.09; ell(ctx, -1 + cos(a) * 15, -50 + sin(a) * 15, 6, 8.5, i % 2 ? '#c8902a' : '#e0a838', '#7a5010', 0.8); }   // 사자 갈기
    ctx.restore();
    const eq = { hat: { tid: 'ar55_hat' }, top: { tid: 'ar55_top' }, bottom: { tid: 'ar55_bottom' }, shoes: { tid: 'ar55_shoes' }, gloves: { tid: 'ar55_gloves' }, weapon: { tid: 'wp60_warrior' } };
    for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    D.humanoid(ctx, human(m, t, lk({ hairStyle: 'short', hairColor: '#3a2a1a', eye: 'sharp', eyeColor: '#ffcf40', skin: '#c88a5a' }, '#e8b840', '#f0e8d0'), eq, { hatColor: '#e8b840', cape: '#a0701a', weapon: 'sword', wcolor: '#ffd040', scale: 1.7 }));
  };
  // 카이엔 → 공허에 물든 검사: 새 그림체 머리 · 검은 긴 코트 · 찢어진 망토 · 금 간 어둠 장검 · 어둠 날개 그림자
  N.kaien_boss = (ctx, m, t, s) => {
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(-6, -70); ctx.scale(sg < 0 ? 1 : 0.85, 1); for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate(-1.2 - sg * 0.2 + i * 0.22 + sin(t * 2) * 0.05); ell(ctx, 0, -24 - i * 2, 4, 26 - i * 2, `rgba(60,20,100,${0.35 - i * 0.04})`); ctx.restore(); } ctx.restore(); }
    for (let i = 0; i < 5; i++) { const a = t * 2 + i; glow(ctx, sin(a) * 26, -70 + cos(a * 1.3) * 30, 14, 'rgba(110,50,170,.9)', 0.3); }
    const base = (G.NPCS.kaien && G.NPCS.kaien.look) || {};
    const look = Object.assign({}, lk({ hairStyle: 'spiky', hairColor: '#1a1a24', eye: 'sharp', eyeColor: '#c050ff', skin: '#f0d8c0' }, '#1a1a2a', '#14141e'), { style2: 'dandy_n', eye2: 'intense_strong' });
    const eq = { top: { tid: 'ar90_top' }, bottom: { tid: 'ar90_bottom' }, shoes: { tid: 'ar90_shoes' }, gloves: { tid: 'ar90_gloves' }, cape: { tid: 'ar90_cape' }, weapon: { tid: 'wp90_warrior' } };
    for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    D.humanoid(ctx, human(m, t, look, eq, { cape: '#2a1440', weapon: 'sword', wcolor: '#3a2050', scale: 1.5 }));
  };
  // 아우렐리온 → 구름 비늘 하늘용: 길게 휘는 몸 · 구름 갈기 · 깃털 날개 · 금 뿔 · 별 구슬
  N.aurelion = (ctx, m, t, s) => {
    const raise = m.boss ? m.boss.raise : 0; ctx.translate(0, -(m.soarY || 0)); ell(ctx, 0, 0, m.w * 0.45, 9, 'rgba(0,0,0,.25)');
    const k = m.h / 200; ctx.scale(k, k);
    const W = '#f4f6ff', LAV = '#c9cdf6', PERI = '#8e9cf6', GOLD = '#f5c86a', OUT = '#5a5aa0';
    const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([-110 + u * 170, -30 - sin(u * PI * 1.6 + t * 1.5) * 26 - u * 90]); }
    // 꼬리 끝 구름
    for (let i = 0; i < 4; i++) ell(ctx, -118 + i * 6, -30 + i * 3, 14 - i * 2, 9, i % 2 ? W : LAV, OUT, 1);
    // 날개 (뒤)
    ctx.save(); ctx.translate(-20, -100); ctx.rotate(-0.25 - raise * 0.3 + sin(t * 2) * 0.12);
    for (let i = 0; i < 7; i++) { ctx.save(); ctx.rotate(-0.2 * i); ell(ctx, -50 - i * 4, -18 - i * 8, 70 - i * 5, 13, i % 2 ? W : LAV, OUT, 1.2); ctx.restore(); } ctx.restore();
    // 몸 (굵기 줄어드는 곡선)
    for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], r = 14 + i * 1.25; ell(ctx, x, y, r, r * 0.95, vg(ctx, y - r, y + r, W, LAV), null); }
    for (let i = 2; i < pts.length; i += 2) { const [x, y] = pts[i]; ell(ctx, x, y + 6 + i * 0.4, 5 + i * 0.3, 3, PERI); }   // 배 비늘
    for (let i = 4; i < pts.length; i += 3) { const [x, y] = pts[i]; poly(ctx, GOLD, [[x - 4, y - 10 - i * 0.9], [x, y - 20 - i * 0.9], [x + 4, y - 10 - i * 0.9]]); }   // 등 지느러미
    const [hx, hy] = pts[pts.length - 1];
    ctx.save(); ctx.translate(hx + 16, hy - 6); ctx.rotate(-0.1 + s.atk * 0.2);
    for (let i = 0; i < 7; i++) ell(ctx, -26 - i * 3, -18 + i * 6 + sin(t * 3 + i) * 2, 12, 7, i % 2 ? W : '#e0e4ff', OUT, 0.8);   // 구름 갈기
    ctx.beginPath(); ctx.moveTo(-20, -20); ctx.quadraticCurveTo(10, -28, 38, -8); ctx.quadraticCurveTo(42, 4, 30, 8); ctx.quadraticCurveTo(0, 14, -20, 10); ctx.closePath();
    ctx.fillStyle = vg(ctx, -28, 14, W, LAV); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
    line(ctx, OUT, 1.6, [[10, 6], [38, 2]]);
    for (const [x, a] of [[-6, -0.9], [6, -0.7]]) { ctx.save(); ctx.translate(x, -20); ctx.rotate(a); poly(ctx, vg(ctx, -30, 0, '#fff4c0', GOLD), [[-3, 0], [3, 0], [0, -30]], '#a07a20', 1); ctx.restore(); }   // 금 뿔
    glow(ctx, 14, -6, 14, '#ffe680', 0.6); ell(ctx, 14, -6, 5, 4, '#ffe680', '#8a6a10', 1); ell(ctx, 15, -6, 1.6, 3, '#3a2a10');
    ctx.restore();
    for (const [i, dx] of [[6, -6], [9, 8]]) { const [x, y] = pts[i]; line(ctx, LAV, 9, [[x, y + 10], [x + dx * 0.3, 0 - 8]]); for (let j = 0; j < 3; j++) poly(ctx, GOLD, [[x + dx * 0.3 - 6 + j * 5, -8], [x + dx * 0.3 - 4 + j * 5, -1], [x + dx * 0.3 - 2 + j * 5, -8]]); }   // 뒷다리
    // 앞발 + 별 구슬
    ctx.save(); ctx.translate(pts[16][0] + 8, pts[16][1] + 18); line(ctx, LAV, 7, [[0, 0], [10, 18]]); glow(ctx, 16, 24, 20, '#fff0a0', 0.8); ell(ctx, 16, 24, 7, 7, '#fffbe0', GOLD, 1.5); ctx.restore();
  };
  // 엘드리크 → 장막의 대사제: 높은 관 + 얼굴을 가린 은 가면(한쪽 눈) · 눈 문양 긴 예복 · 깨진 붉은 유리 후광 · 눈 지팡이
  N.eldrick = (ctx, m, t, s) => {
    ctx.scale(1.45, 1.45); const h = m.h / 1.12, casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff4080' : '#c060ff';
    for (let i = 0; i < 9; i++) { const a = t * 0.6 + i * PI / 4.5; ctx.save(); ctx.translate(cos(a) * 30, -h * 0.84 + sin(a) * 30); ctx.rotate(a + t); poly(ctx, 'rgba(200,40,80,.85)', [[0, -6], [3, 1], [-2, 5]], '#ff90a0', 0.6); ctx.restore(); }
    glow(ctx, 0, -h * 0.84, 34, ec, 0.4);
    const g = vg(ctx, -h * 0.7, 0, '#4a2a7a', '#1a0a2a');
    ctx.beginPath(); ctx.moveTo(-10, -h * 0.72); ctx.quadraticCurveTo(-14, -h * 0.4, -28, 0); ctx.lineTo(28, 0); ctx.quadraticCurveTo(14, -h * 0.4, 10, -h * 0.72); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#0a0418'; ctx.lineWidth = 1.6; ctx.stroke();
    line(ctx, '#c8a040', 2, [[0, -h * 0.7], [0, -2]]); for (const y of [-h * 0.5, -h * 0.28]) { ell(ctx, 0, y, 6, 3.4, '#e8d8b0', '#c8a040', 1); ell(ctx, 0, y, 1.8, 1.8, ec); }   // 눈 문양
    line(ctx, '#c8a040', 1.6, [[-27, -2], [27, -2]]);
    rrect(ctx, -12, -h * 0.76, 24, 10, 4, '#2a1a4a', '#0a0418', 1);   // 어깨
    // 가면 + 높은 관
    ctx.beginPath(); ctx.moveTo(-9, -h * 0.86); ctx.lineTo(-6, -h * 1.12); ctx.quadraticCurveTo(0, -h * 1.17, 6, -h * 1.12); ctx.lineTo(9, -h * 0.86); ctx.closePath(); ctx.fillStyle = vg(ctx, -h * 1.15, -h * 0.86, '#6a3aa0', '#2a1a4a'); ctx.fill(); ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.2; ctx.stroke();
    ell(ctx, 0, -h * 1.0, 3, 3, ec); line(ctx, '#c8a040', 1, [[-7, -h * 0.94], [7, -h * 0.94]]);
    ell(ctx, 1, -h * 0.82, 8, 9, vg(ctx, -h * 0.9, -h * 0.74, '#f0f0f8', '#a8a8c0'), '#5a5a70', 1);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 8; ell(ctx, 3.5, -h * 0.83, 2.4, 1.6, ec); ctx.restore(); line(ctx, '#5a5a70', 1, [[-4, -h * 0.84], [0, -h * 0.83]]);
    // 지팡이
    const up = casting ? 0.5 : 0; ctx.save(); ctx.translate(16, -h * 0.55); ctx.rotate(-0.1 - up);
    line(ctx, '#2a1a3a', 3, [[0, 34], [0, -36]]); ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(0, -42, 7, 0, PI * 2); ctx.stroke();
    glow(ctx, 0, -42, 14, ec, 0.8); ell(ctx, 0, -42, 4, 2.6, '#f0e0ff'); ell(ctx, 0.6, -42, 1.4, 1.4, '#2a0a3a'); ctx.restore();
  };
  // 녹스 → 공허의 군주: 별하늘이 비치는 망토 몸 · 뿔 왕관 투구 + 외눈 · 떠 있는 두 손 · 가슴의 공허 핵
  N.nox = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase || 0 : 0, ec = ph ? '#ff40c0' : '#d070ff';
    glow(ctx, 0, -h * 0.5, h * 0.6, '#5a20a0', 0.35);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-w * 0.35, -h * 0.82); ctx.quadraticCurveTo(-w * 1.1, -h * 0.4, -w * 0.95 + sin(t) * 6, 0);
    for (let i = 0; i < 7; i++) ctx.lineTo(-w * 0.95 + (i + 0.5) * w * 0.27, (i % 2 ? -18 : -4) + sin(t * 2 + i) * 4);
    ctx.lineTo(w * 0.95 + sin(t + 1) * 6, 0); ctx.quadraticCurveTo(w * 1.1, -h * 0.4, w * 0.35, -h * 0.82); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.82, 0, '#2a1048', '#0a0418'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.6; ctx.stroke(); ctx.clip();
    for (let i = 0; i < 22; i++) { const x = ((i * 37) % 100 - 50) / 50 * w * 0.9, y = -((i * 53) % 100) / 100 * h * 0.8; ell(ctx, x, y, i % 4 ? 1 : 1.8, i % 4 ? 1 : 1.8, `rgba(255,255,255,${0.4 + 0.4 * sin(t * 2 + i)})`); }   // 별하늘
    ctx.restore();
    glow(ctx, 0, -h * 0.55, 30, ec, 0.9); ctx.save(); ctx.translate(0, -h * 0.55); ctx.rotate(t); poly(ctx, '#f0d0ff', [[0, -10], [7, 0], [0, 10], [-7, 0]]); ctx.restore();   // 공허 핵
    rrect(ctx, -w * 0.5, -h * 0.84, w, 14, 6, vg(ctx, -h * 0.84, -h * 0.78, '#4a2a6a', '#1a0a2a'), ec, 1.2);   // 어깨
    // 투구 + 뿔 왕관 + 외눈
    const hy = -h * 0.9; ctx.beginPath(); ctx.ellipse(0, hy, 18, 20, 0, 0, PI * 2); ctx.fillStyle = vg(ctx, hy - 20, hy + 20, '#3a1a5a', '#14081e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.4; ctx.stroke();
    for (const [x, hh, a] of [[-14, 30, -0.5], [-6, 22, -0.15], [6, 22, 0.15], [14, 30, 0.5]]) { ctx.save(); ctx.translate(x, hy - 14); ctx.rotate(a); poly(ctx, vg(ctx, -hh, 0, '#c890ff', '#3a1a5a'), [[-3.4, 0], [3.4, 0], [0, -hh]], '#1a0a2a', 0.8); ctx.restore(); }
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 14; ell(ctx, 3, hy + 2, 7, 4.4, ec); ctx.restore(); ell(ctx, 4, hy + 2, 2.4, 3.4, '#1a0a2a');
    // 떠 있는 두 손
    for (const sg of [-1, 1]) { const x = sg * w * 1.05, y = -h * 0.45 + sin(t * 1.6 + sg) * 10; ctx.save(); ctx.translate(x, y);
      glow(ctx, 0, 0, 22, ec, 0.5); ell(ctx, 0, 0, 10, 12, vg(ctx, -12, 12, '#4a2a6a', '#1a0a2a'), ec, 1.2); for (let i = 0; i < 4; i++) line(ctx, '#2a1440', 3, [[-6 + i * 4, -8], [-7 + i * 4.6, -20]]); ctx.restore(); }
  };
})();
