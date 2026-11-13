// 하늘 스킬 4~6 + 유성 시안 (skyreal.js 다음에 불러옴)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, R = G.SkyReal, S = R.opt;
  const rnd = (s) => { let x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const fade = (k, a = 0.2) => k < a ? k / a : (1 - k) / (1 - a);
  const SOFT = { top: '#f4f7ff', mid: '#c8d2e6', base: '#8a96b4', rim: 'rgba(255,255,255,.8)' };
  // 4 천공의 화살비 — 가: 구름이 갈라지며 빛이 쏟아짐 (빛 기둥 · 빛살)
  S.s4a = (c, f, k, t) => { const a = fade(k); c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const x0 = f.x - 90 + i * 22, sp = (i - 4) * 34; c.beginPath(); c.moveTo(x0 - 10, f.y + 20); c.lineTo(x0 + 10, f.y + 20); c.lineTo(x0 + sp + 40, f.y + 430); c.lineTo(x0 + sp - 40, f.y + 430); c.closePath();
      const g = c.createLinearGradient(0, f.y, 0, f.y + 430); g.addColorStop(0, `rgba(230,255,235,${0.3 + 0.1 * sin(t * 2 + i)})`); g.addColorStop(1, 'rgba(200,255,210,0)'); c.fillStyle = g; c.fill(); }
    const h = c.createRadialGradient(f.x, f.y + 10, 0, f.x, f.y + 10, 160); h.addColorStop(0, 'rgba(255,255,240,.95)'); h.addColorStop(0.4, 'rgba(200,255,210,.45)'); h.addColorStop(1, 'rgba(200,255,210,0)'); c.fillStyle = h; c.beginPath(); c.arc(f.x, f.y + 10, 160, 0, PI * 2); c.fill(); c.restore();
    c.save(); c.globalAlpha = a; R.cloud(c, f.x - 230 - k * 40, f.y + 40, 380, 140, SOFT, 41, t); R.cloud(c, f.x + 230 + k * 40, f.y + 40, 380, 140, SOFT, 47, t); c.restore(); };
  // 4 나: 바람의 문 — 하늘에 구름 고리가 돌고 가운데가 밝게 열림
  S.s4b = (c, f, k, t) => { const a = fade(k); c.save(); c.translate(f.x, f.y); c.globalAlpha = a;
    c.save(); c.globalCompositeOperation = 'lighter'; c.scale(1, 0.32); const h = c.createRadialGradient(0, 0, 0, 0, 0, 220); h.addColorStop(0, 'rgba(255,255,240,.95)'); h.addColorStop(0.5, 'rgba(190,255,210,.5)'); h.addColorStop(1, 'rgba(190,255,210,0)'); c.fillStyle = h; c.beginPath(); c.arc(0, 0, 220, 0, PI * 2); c.fill(); c.restore();
    for (let i = 0; i < 10; i++) { const an = t * 0.8 + i * PI / 5, x = cos(an) * 250, y = sin(an) * 70; R.cloud(c, x, y + 20, 200, 80, SOFT, 60 + i, t, { alpha: sin(an) > 0 ? 1 : 0.75, n: 60 }); }
    c.strokeStyle = 'rgba(240,255,245,.7)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const ph = t * 2 + i * 1.6; c.beginPath(); c.ellipse(0, 0, 180 - i * 20, 50 - i * 6, 0, ph, ph + 1.2); c.stroke(); } c.restore(); };
  // 5 칠흑의 밤 — 가: 진짜 달 (크레이터 · 달무리) + 별 반짝 + 화면 어둡게
  const moon = (c, x, y, r, col, t) => { c.save(); c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(x, y, r * 0.8, x, y, r * 3.4); h.addColorStop(0, col.halo); h.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = h; c.beginPath(); c.arc(x, y, r * 3.4, 0, PI * 2); c.fill(); c.restore();
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, col.light); g.addColorStop(1, col.dark); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.clip(); for (let i = 0; i < 16; i++) { const u = rnd(i * 3.3), v = rnd(i * 5.1), cr = r * (0.06 + 0.16 * rnd(i * 7.7)); const cx = x + (u - 0.5) * r * 1.7, cy = y + (v - 0.5) * r * 1.7;
      const cg = c.createRadialGradient(cx + cr * 0.3, cy + cr * 0.3, 0, cx, cy, cr); cg.addColorStop(0, col.crater); cg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = cg; c.beginPath(); c.arc(cx, cy, cr, 0, PI * 2); c.fill(); }
    const sh = c.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.5, 'rgba(10,6,30,0)'); sh.addColorStop(1, 'rgba(10,6,30,.55)'); c.fillStyle = sh; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); };
  const night = (c, f, a, tint) => { c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, f.y - 700, 0, f.y + 120); g.addColorStop(0, tint[0]); g.addColorStop(1, tint[1]); c.fillStyle = g; c.fillRect(f.x - 1400, f.y - 800, 2800, 1000); c.restore(); };
  const stars = (c, f, a, t) => { for (let i = 0; i < 70; i++) { const x = f.x - 700 + rnd(i * 1.7) * 1400, y = f.y - 640 + rnd(i * 2.9) * 560, tw = 0.4 + 0.6 * (0.5 + 0.5 * sin(t * 3 + i * 1.3)), r = 1 + rnd(i * 4.1) * 2.2; c.save(); c.globalAlpha = a * tw; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); if (r > 2.6) { c.fillRect(x - r * 2.5, y - 0.5, r * 5, 1); c.fillRect(x - 0.5, y - r * 2.5, 1, r * 5); } c.restore(); } };
  S.s5a = (c, f, k, t) => { const a = fade(k); night(c, f, a * 0.8, ['rgba(8,6,30,.95)', 'rgba(30,20,70,.7)']); stars(c, f, a, t); c.save(); c.globalAlpha = a; moon(c, f.x + 200, f.y - 220, 70, { halo: 'rgba(200,200,255,.35)', light: '#fbfaff', dark: '#b8b4d8', crater: 'rgba(120,115,160,.45)' }, t); c.restore(); };
  // 5 나: 보랏빛 달 + 얇은 구름이 달 앞을 지나감
  S.s5b = (c, f, k, t) => { const a = fade(k); night(c, f, a * 0.85, ['rgba(20,4,40,.95)', 'rgba(60,20,90,.7)']); stars(c, f, a * 0.8, t); c.save(); c.globalAlpha = a; moon(c, f.x + 200, f.y - 220, 80, { halo: 'rgba(200,120,255,.45)', light: '#f0d8ff', dark: '#8a5ac8', crater: 'rgba(90,40,140,.5)' }, t);
    R.cloud(c, f.x + 150 + sin(t * 0.5) * 40, f.y - 170, 360, 70, { top: 'rgba(120,90,170,.9)', mid: 'rgba(60,40,100,.85)', base: 'rgba(30,20,60,.8)', rim: 'rgba(230,200,255,.5)' }, 71, t, { alpha: 0.45, flat: 0.45, n: 90, rs: 1.4 }); c.restore(); };
  // 6 천둥의 심판 — 가: 작은 먹구름에서 내리꽂는 굵은 번개 + 땅 충격 빛
  const STORM3 = { top: '#6a7090', mid: '#353a56', base: '#14162a', rim: 'rgba(170,200,255,.55)' };
  S.s6a = (c, f, k, t) => { R.BR = 0.88; const a = 1 - k, top = f.y - 440; R.cloud(c, f.x, top + 30, 320, 110, STORM3, 81, t, { alpha: Math.min(1, a * 1.4), inner: (k2, cx, by, w, h) => { const g = k2.createRadialGradient(cx, by - h * 0.2, 0, cx, by - h * 0.2, h); g.addColorStop(0, 'rgba(255,250,200,.8)'); g.addColorStop(1, 'rgba(255,250,200,0)'); k2.fillStyle = g; k2.fillRect(0, 0, k2.canvas.width, k2.canvas.height); } });
    R.bolt(c, f.x, top + 30, f.x + 6, f.y, 91, { glow: 'rgba(255,240,150,.95)', core: '#fff8d0' }, a);
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(f.x, f.y); c.scale(1, 0.3); const g = c.createRadialGradient(0, 0, 0, 0, 0, 160); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 160, 0, PI * 2); c.fill(); c.restore();
    R.BR = 0; for (let i = 0; i < 10; i++) { const an = PI + i / 9 * PI, d = 40 + k * 140; c.save(); c.globalAlpha = a; c.fillStyle = '#fff4b0'; c.beginPath(); c.arc(f.x + cos(an) * d, f.y + sin(an) * d * 0.5, 2.4, 0, PI * 2); c.fill(); c.restore(); } };
  // 6 나: 하늘 전체 번쩍 + 가지 많은 번개 세 줄기 (구름 없이)
  S.s6b = (c, f, k, t) => { R.BR = 0.9; const a = 1 - k; c.save(); c.globalAlpha = a * 0.35; c.fillStyle = '#fffbe0'; c.fillRect(f.x - 1400, f.y - 900, 2800, 1000); c.restore();
    [[0, 91], [-120, 33], [130, 57]].forEach(([dx, sd], i) => R.bolt(c, f.x + dx * 0.6, f.y - 460, f.x + dx * 0.15, i ? f.y - 120 + i * 40 : f.y, sd, { glow: 'rgba(255,240,150,.95)', core: '#fff8d0' }, a * (i ? 0.7 : 1))); R.BR = 0;
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(f.x, f.y); c.scale(1, 0.3); const g = c.createRadialGradient(0, 0, 0, 0, 0, 160); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 160, 0, PI * 2); c.fill(); c.restore(); };
  // 참고: 유성 (떨어지는 돌) — 가: 용암 금이 간 바위 + 불타는 꼬리 · 불씨
  const rock = (c, r, hot, t) => { c.beginPath(); for (let i = 0; i < 12; i++) { const an = i / 12 * PI * 2, rr = r * (0.82 + 0.25 * rnd(i * 3.7)); c.lineTo(cos(an) * rr, sin(an) * rr); } c.closePath(); const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, hot ? '#8a5030' : '#7a6a60'); g.addColorStop(1, '#2a1a12'); c.fillStyle = g; c.fill();
    c.save(); c.clip(); c.strokeStyle = '#ffb040'; c.lineWidth = 2.2; c.shadowColor = '#ff7a20'; c.shadowBlur = 8; for (let i = 0; i < 4; i++) { c.beginPath(); let x = (rnd(i) - 0.5) * r, y = (rnd(i + 5) - 0.5) * r; c.moveTo(x, y); for (let j = 0; j < 3; j++) { x += (rnd(i * 9 + j) - 0.5) * r * 0.8; y += (rnd(i * 7 + j) - 0.5) * r * 0.8; c.lineTo(x, y); } c.stroke(); }
    const lit = c.createRadialGradient(r * 0.7, 0, 0, r * 0.7, 0, r * 1.2); lit.addColorStop(0, 'rgba(255,200,90,.85)'); lit.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = lit; c.fillRect(-r, -r, r * 2, r * 2); c.restore(); };
  R.meteor = (c, x, y, ang, r, t, style) => { c.save(); c.translate(x, y); c.rotate(ang);
    c.save(); c.globalCompositeOperation = 'lighter'; const L = r * 9; const tg = c.createLinearGradient(0, 0, -L, 0); tg.addColorStop(0, style === 'b' ? 'rgba(255,255,230,.95)' : 'rgba(255,220,120,.95)'); tg.addColorStop(0.25, style === 'b' ? 'rgba(160,220,255,.6)' : 'rgba(255,120,30,.75)'); tg.addColorStop(1, 'rgba(255,60,10,0)');
    c.fillStyle = tg; c.beginPath(); c.moveTo(r * 0.3, -r * 1.05); c.quadraticCurveTo(-L * 0.4, -r * 0.9 + sin(t * 20) * 2, -L, 0); c.quadraticCurveTo(-L * 0.4, r * 0.9, r * 0.3, r * 1.05); c.closePath(); c.fill();
    const hg = c.createRadialGradient(0, 0, 0, 0, 0, r * 2.6); hg.addColorStop(0, style === 'b' ? 'rgba(200,235,255,.8)' : 'rgba(255,170,60,.8)'); hg.addColorStop(1, 'rgba(255,100,20,0)'); c.fillStyle = hg; c.beginPath(); c.arc(0, 0, r * 2.6, 0, PI * 2); c.fill();
    for (let i = 0; i < 12; i++) { const u = (t * 2 + i / 12) % 1; c.globalAlpha = 1 - u; c.fillStyle = style === 'b' ? '#dff4ff' : '#ffd070'; c.beginPath(); c.arc(-u * L * 0.8, (rnd(i) - 0.5) * r * 2 * (1 + u), 2.2 * (1 - u) + 0.6, 0, PI * 2); c.fill(); } c.restore();
    if (style === 'b') { const g = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#e0f4ff'); g.addColorStop(1, 'rgba(160,210,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 1.2, 0, PI * 2); c.fill(); } else rock(c, r, true, t);
    c.restore(); };
  S.s7a = (c, f, k, t) => { R.meteor(c, f.x, f.y, 2.2, 30, t, 'a'); };   // 가: 용암 바위 유성
  S.s7b = (c, f, k, t) => { R.meteor(c, f.x, f.y, 2.2, 26, t, 'b'); };   // 나: 하얗게 빛나는 별똥 (바위 대신 빛 덩어리)
})();
// 6 나 수정: 하늘 번쩍 + 먹구름에서 번개 세 줄기가 나옴
(function () { const R = G.SkyReal, S = R.opt, PI = Math.PI;
  const STORM3 = { top: '#6a7090', mid: '#353a56', base: '#14162a', rim: 'rgba(170,200,255,.55)' };
  S.s6c = (c, f, k, t) => { const a = 1 - k, top = f.y - 440; c.save(); c.globalAlpha = a * 0.3; c.fillStyle = '#fffbe0'; c.fillRect(f.x - 1400, f.y - 900, 2800, 1000); c.restore();
    R.BR = 0.9; [[0, 91, 0], [-130, 33, 1], [140, 57, 2]].forEach(([dx, sd, i]) => R.bolt(c, f.x + dx, top + 40, f.x + dx * 0.25, i ? f.y - 130 + i * 40 : f.y, sd, { glow: 'rgba(255,240,150,.95)', core: '#fff8d0' }, a * (i ? 0.75 : 1))); R.BR = 0;
    R.cloud(c, f.x, top + 40, 520, 150, STORM3, 83, t, { alpha: Math.min(1, a * 1.5), flat: 0.8, inner: (k2, cx, by, w, h) => { for (const dx of [-130, 0, 140]) { const g = k2.createRadialGradient(cx + dx, by - h * 0.15, 0, cx + dx, by - h * 0.15, h * 0.7); g.addColorStop(0, 'rgba(255,250,200,.75)'); g.addColorStop(1, 'rgba(255,250,200,0)'); k2.fillStyle = g; k2.fillRect(0, 0, k2.canvas.width, k2.canvas.height); } } });
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(f.x, f.y); c.scale(1, 0.3); const g = c.createRadialGradient(0, 0, 0, 0, 0, 160); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 160, 0, PI * 2); c.fill(); c.restore(); };
})();
