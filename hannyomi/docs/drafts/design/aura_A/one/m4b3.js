// 현자의 각성 3차 — 구름 + 파란 번개 새 4안 (번개는 위 · 옆으로만, 캐릭터를 치지 않음)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(120,180,255,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const bolt = (c, pts, w) => { c.lineCap = 'round'; c.lineJoin = 'round'; for (const [lw, col] of [[w + 2.4, 'rgba(40,90,220,.85)'], [w + 0.6, '#5ab4ff'], [w * 0.5, '#eaf8ff']]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } };
  const zig = (x0, y0, x1, y1, n, amp, t, s) => { const o = [[x0, y0]]; for (let i = 1; i < n; i++) { const u = i / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, k = sin(i * 2.7 + Math.floor(t * 10) * 1.3 + s) * amp; o.push([x0 + (x1 - x0) * u + nx / L * k, y0 + (y1 - y0) * u + ny / L * k]); } o.push([x1, y1]); return o; };
  const cloudPath = (c, x, y, k = 1) => { c.beginPath(); c.moveTo(x - 16 * k, y + 5 * k); c.bezierCurveTo(x - 22 * k, y + 5 * k, x - 21 * k, y - 4 * k, x - 14 * k, y - 3 * k); c.bezierCurveTo(x - 14 * k, y - 11 * k, x - 4 * k, y - 13 * k, x - 1 * k, y - 7 * k);
    c.bezierCurveTo(x + 2 * k, y - 15 * k, x + 14 * k, y - 13 * k, x + 13 * k, y - 4 * k); c.bezierCurveTo(x + 21 * k, y - 5 * k, x + 22 * k, y + 5 * k, x + 16 * k, y + 5 * k); c.quadraticCurveTo(x, y + 8 * k, x - 16 * k, y + 5 * k); c.closePath(); };
  const cloud = (c, x, y, k = 1, lit = 0) => { cloudPath(c, x, y, k); const g = c.createLinearGradient(0, y - 13 * k, 0, y + 7 * k); g.addColorStop(0, '#b4bfdc'); g.addColorStop(0.55, '#6e7aa4'); g.addColorStop(1, '#3e4670'); c.fillStyle = g; c.fill();
    c.save(); cloudPath(c, x, y, k); c.clip(); if (lit) soft(c, x, y, 20 * k, 'rgba(150,210,255,.9)', lit); c.globalAlpha = 0.45; c.beginPath(); c.ellipse(x - 2 * k, y - 10 * k, 13 * k, 4 * k, 0, 0, PI * 2); c.fillStyle = '#eef2ff'; c.fill(); c.restore(); };
  const S = G.AuraM4b3 = {};
  const Y = (p, t) => p.y - 100 + sin(t * 1.6) * 1.5;
  // 가: 번개 왕관 구름 — 구름 윗면에서 짧은 파란 번개 셋이 위로 솟아 깜빡임
  S.ga = (c, p, t) => { const x = p.x, y = Y(p, t); soft(c, x, y - 10, 24, 'rgba(110,180,255,.5)', 0.8);
    [[-9, -6, -13, -22], [0, -9, 1, -27], [9, -6, 14, -22]].forEach(([a, b, d, e], i) => { c.save(); c.globalAlpha = 0.6 + 0.4 * (Math.floor(t * 8 + i * 2) % 3 ? 1 : 0.2); bolt(c, zig(x + a, y + b, x + d, y + e, 3, 2.4, t, i), 1.1); c.restore(); });
    cloud(c, x, y); };
  // 나: 번개 고리 구름 — 구름 둘레를 가느다란 파란 전기 고리가 돎 (뒤 → 구름 → 앞)
  const ring = (c, x, y, t, front) => { for (let i = 0; i < 28; i++) { const a = t * 2.4 + i / 28 * PI * 2, b = a + PI / 14; if ((sin(a) > 0) !== front) continue; const j = sin(i * 3.1 + Math.floor(t * 12)) * 1.4;
      c.strokeStyle = front ? '#7cc4ff' : 'rgba(90,150,240,.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + cos(a) * 26, y + 2 + sin(a) * 6 + j); c.lineTo(x + cos(b) * 26, y + 2 + sin(b) * 6 - j); c.stroke(); }
    if (front) { const a = t * 2.4; soft(c, x + cos(a) * 26, y + 2 + sin(a) * 6, 6, 'rgba(200,235,255,.9)', 1); } };
  S.na = (c, p, t) => { const x = p.x, y = Y(p, t); soft(c, x, y, 26, 'rgba(110,180,255,.4)', 0.8); ring(c, x, y, t, false); cloud(c, x, y); ring(c, x, y, t, true); };
  // 다: 번개 구름 문장 — 구름 앞에 굵은 파란 번개 문양이 박힌 문장 (다른 직업의 문장과 같은 결)
  S.da = (c, p, t) => { const x = p.x, y = Y(p, t), br = 0.8 + 0.2 * sin(t * 3); soft(c, x, y, 24, 'rgba(110,180,255,.55)', br); cloud(c, x, y, 1, 0.35 * br);
    c.save(); c.translate(x + 1, y - 1); c.beginPath(); c.moveTo(-1, -10); c.lineTo(5, -10); c.lineTo(1, -2); c.lineTo(6, -2); c.lineTo(-4, 10); c.lineTo(-1, 1); c.lineTo(-6, 1); c.closePath();
    c.fillStyle = '#7cc8ff'; c.fill(); c.strokeStyle = '#1e4aa8'; c.lineWidth = 1.2; c.stroke(); c.beginPath(); c.moveTo(0, -8); c.lineTo(3, -8); c.lineTo(-0.6, -1); c.strokeStyle = '#eaf8ff'; c.lineWidth = 0.9; c.stroke(); c.restore(); };
  // 라: 두 구름 사이 번개 — 머리 위 양쪽 작은 구름 둘 사이로 파란 번개가 옆으로 오감 (아래로 안 떨어짐)
  S.ra = (c, p, t) => { const y = Y(p, t) + 4, xl = p.x - 22, xr = p.x + 22, ph = (t * 1.3) % 1, on = ph < 0.55;
    if (on) { soft(c, p.x, y, 22, 'rgba(110,180,255,.6)', 1 - ph); c.save(); c.globalAlpha = 1 - ph * 0.8; bolt(c, zig(xl + 8, y - 1, xr - 8, y - 1, 6, 3.2, t, 0), 1.1); c.restore(); }
    cloud(c, xl, y + sin(t * 1.6 + 1) * 1.2, 0.7, on ? 0.5 * (1 - ph) : 0); cloud(c, xr, y + sin(t * 1.6 + 2) * 1.2, 0.7, on ? 0.5 * (1 - ph) : 0); };
})();
