// 천공의 숨결 시안: 지금 / 가 빛의 숨결 / 나 별가루 숨결 / 다 소용돌이 숨결
window.BreathMock = (function () {
  const SPR = {}; const spr = (rgb) => { if (SPR[rgb]) return SPR[rgb]; const c = document.createElement('canvas'); c.width = c.height = 64; const k = c.getContext('2d'), g = k.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.45, `rgba(${rgb},.42)`); g.addColorStop(1, `rgba(${rgb},0)`); k.fillStyle = g; k.fillRect(0, 0, 64, 64); return (SPR[rgb] = c); };
  const soft = (c, x, y, r, rgb, a, add, sy = 1) => { if (a <= 0.004 || r < 0.5) return; c.save(); if (add) c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(spr(rgb), x - r, y - r * sy, r * 2, r * 2 * sy); c.restore(); };
  const rnd = s => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  // 입(mx,my) → 땅(hx,gy). t 초
  function ga(c, mx, my, hx, gy, t) {   // 빛의 숨결: 넓어지는 빛 기둥 + 흐르는 빛 덩이 + 땅 충격 · 먼지
    const dx = hx - mx, dy = gy - my, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    for (let i = 0; i < 46; i++) { const u = (t * 1.8 + rnd(i)) % 1, w = 10 + u * 46, off = (rnd(i * 3) - 0.5) * w * 1.2 + Math.sin(t * 9 + i) * 4 * u;
      soft(c, mx + dx * u + nx * off, my + dy * u + ny * off, w * (0.7 + rnd(i * 5) * 0.6), u < 0.5 ? '235,225,255' : '200,170,255', 0.16 + 0.1 * (1 - u), true); }
    for (let i = 0; i < 18; i++) { const u = i / 18, w = 5 + u * 14; soft(c, mx + dx * u, my + dy * u, w, '255,255,255', 0.5, true); }   // 하얀 심
    soft(c, mx, my, 34, '240,230,255', 0.8, true);
    soft(c, hx, gy - 6, 120, '210,180,255', 0.55, true, 0.45); soft(c, hx, gy - 10, 54, '255,250,255', 0.75, true, 0.6);   // 땅에 닿는 빛
    for (let i = 0; i < 26; i++) { const u = (t * 1.3 + rnd(i * 7)) % 1, s = rnd(i * 11) < 0.5 ? -1 : 1, x = hx + s * u * (60 + rnd(i) * 90), y = gy - 6 - Math.sin(u * Math.PI) * (20 + rnd(i * 2) * 40);
      soft(c, x, y, 10 + u * 22, '150,140,170', 0.28 * (1 - u), false); }   // 흙먼지
    for (let i = 0; i < 20; i++) { const u = (t * 2 + rnd(i * 13)) % 1, an = -Math.PI * (0.15 + rnd(i * 17) * 0.7), d = u * (50 + rnd(i) * 80); soft(c, hx + Math.cos(an) * d, gy - 8 + Math.sin(an) * d * 0.7 + u * u * 30, 3, '255,240,255', 1 - u, true); }   // 튀는 빛 조각
    soft(c, hx, gy - 1, 90, '60,30,90', 0.35, false, 0.12);   // 그을림
  }
  function na(c, mx, my, hx, gy, t) {   // 별가루 숨결: 수많은 작은 빛 알갱이가 흐름 + 옅은 안개
    const dx = hx - mx, dy = gy - my, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (let i = 0; i < 14; i++) { const u = i / 14, w = 16 + u * 50; soft(c, mx + dx * u, my + dy * u, w, '190,160,255', 0.12, true); }
    for (let i = 0; i < 220; i++) { const u = (t * 1.4 + rnd(i)) % 1, spread = (rnd(i * 3) - 0.5) * (8 + u * 70), curl = Math.sin(t * 6 + i * 0.7 + u * 8) * 6 * u;
      const x = mx + dx * u + nx * (spread + curl), y = my + dy * u + ny * (spread + curl), tw = 0.6 + 0.4 * Math.sin(t * 30 + i);
      soft(c, x, y, 1.6 + rnd(i * 5) * 2.6, rnd(i * 9) < 0.3 ? '255,240,200' : '235,225,255', 0.9 * tw, true); }
    soft(c, mx, my, 26, '245,235,255', 0.7, true);
    for (let i = 0; i < 70; i++) { const u = (t * 0.9 + rnd(i * 19)) % 1, x = hx + (rnd(i * 23) - 0.5) * 220 * (0.3 + u), y = gy - 4 - u * (30 + rnd(i) * 70); soft(c, x, y, 1.8, '240,230,255', (1 - u) * 0.9, true); }   // 내려앉는 별가루
    soft(c, hx, gy - 6, 100, '200,170,255', 0.4, true, 0.4);
  }
  function da(c, mx, my, hx, gy, t) {   // 소용돌이 숨결: 꼬이며 나아가는 빛 띠 2가닥 + 바람 줄기 + 땅에서 퍼지는 충격 고리
    const dx = hx - mx, dy = gy - my, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (let i = 0; i < 12; i++) { const u = i / 12, w = 14 + u * 40; soft(c, mx + dx * u, my + dy * u, w, '200,170,255', 0.18, true); }
    for (const ph of [0, Math.PI]) for (let i = 0; i < 60; i++) { const u = i / 60, a = u * 14 - t * 16 + ph, r = 6 + u * 30, x = mx + dx * u + nx * Math.sin(a) * r, y = my + dy * u + ny * Math.sin(a) * r, front = Math.cos(a) > 0;
      soft(c, x, y, 6 + u * 9, front ? '250,245,255' : '170,130,255', front ? 0.42 : 0.2, true); }
    for (let i = 0; i < 16; i++) { const u = (t * 2.4 + rnd(i)) % 1, off = (rnd(i * 3) - 0.5) * 60 * u; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.25 * (1 - u); c.strokeStyle = '#e8dcff'; c.lineWidth = 1.4; c.beginPath(); const x0 = mx + dx * u + nx * off, y0 = my + dy * u + ny * off; c.moveTo(x0, y0); c.lineTo(x0 + dx * 0.12, y0 + dy * 0.12); c.stroke(); c.restore(); }
    for (let k = 0; k < 3; k++) { const u = (t * 1.6 + k / 3) % 1; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 * (1 - u); c.strokeStyle = '#d8c4ff'; c.lineWidth = 3 * (1 - u) + 0.6; c.beginPath(); c.ellipse(hx, gy - 4, 20 + u * 130, (20 + u * 130) * 0.18, 0, 0, Math.PI * 2); c.stroke(); c.restore(); }
    soft(c, hx, gy - 8, 60, '250,240,255', 0.7, true, 0.6); soft(c, mx, my, 28, '245,235,255', 0.75, true);
  }
  return { ga, na, da };
})();
