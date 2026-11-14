// 저격왕 3개 새 시안: 연쇄 폭발 볼트 · 은신 사격 · 섬광 섬멸
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const M = G.SageMock = G.SageMock || {};
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= a; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const bolt = (c, x, y, ang, s = 1) => { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, 0); c.lineTo(10, 0); c.stroke(); c.fillStyle = '#dfe6ee'; c.beginPath(); c.moveTo(18, 0); c.lineTo(8, -5); c.lineTo(8, 5); c.closePath(); c.fill(); c.fillStyle = '#8ac850'; c.fillRect(-18, -4, 6, 8); c.restore(); };
  const ring = (c, x, y, r, col, a, lw = 5, sy = 0.3) => { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(x, y, r, r * sy, 0, 0, PI * 2); c.stroke(); c.restore(); };
  // ===== 연쇄 폭발 볼트: 볼트가 첫 적에 박힘 → 빨갛게 깜빡이며 째깍 → 크게 폭발 (불꽃 · 파편 · 충격파) =====
  M.blast = (c, p, k, gy, T) => { const tx = T[0], ty = gy - 45, sx = p.x + 30, sy = gy - 40;
    if (k < 0.15) { const u = k / 0.15; bolt(c, sx + (tx - sx) * u, sy + (ty - sy) * u, 0); return; }
    if (k < 0.55) { const u = (k - 0.15) / 0.4, bl = Math.floor(u * 8) % 2; bolt(c, tx - 6, ty, 0); glow(c, tx + 8, ty, 20 + u * 26, bl ? 'rgba(255,60,40,.95)' : 'rgba(255,190,80,.7)', 1);
      c.save(); c.strokeStyle = '#ff5040'; c.lineWidth = 3; c.globalAlpha = 0.8; c.beginPath(); c.arc(tx + 8, ty, 40 - u * 22, 0, PI * 2 * (1 - u)); c.stroke(); c.restore(); return; }
    const u = (k - 0.55) / 0.45, f = 1 - u, R = 60 + u * 170;
    glow(c, tx, ty, R * 1.5, 'rgba(255,170,60,.95)', f); glow(c, tx, ty, R * 0.7, 'rgba(255,255,220,1)', f * f);
    c.save(); c.globalAlpha = f; for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2 + rnd(i) * 0.4, L = R * (0.7 + rnd(i * 3) * 0.6); c.strokeStyle = i % 2 ? '#ffd060' : '#ff7a30'; c.lineWidth = 6 * f + 1; c.beginPath(); c.moveTo(tx + cos(a) * R * 0.25, ty + sin(a) * R * 0.25); c.lineTo(tx + cos(a) * L, ty + sin(a) * L * 0.8); c.stroke(); } c.restore();
    for (let i = 0; i < 10; i++) { const a = -PI * rnd(i * 7), d = u * (120 + rnd(i) * 140), x = tx + cos(a) * d, y = ty + sin(a) * d + u * u * 160; c.save(); c.globalAlpha = f; c.fillStyle = i % 3 ? '#5a4030' : '#ffb050'; c.translate(x, y); c.rotate(u * 10 + i); c.fillRect(-5, -3, 10, 6); c.restore(); }
    ring(c, tx, gy - 4, R * 1.3, '#ffd080', f, 7); ring(c, tx, gy - 4, R * 0.9, '#ff8a40', f, 4); };
  // ===== 은신 사격: 발밑에서 짙은 연기가 피어올라 몸을 가림 → 연기 속에서 볼트가 뚫고 나옴 (연기 꼬리) =====
  const smoke = (c, x, y, n, k, a, seed) => { for (let i = 0; i < n; i++) { const u = rnd(seed + i), r = 18 + rnd(seed + i * 3) * 22 + k * 22, px = x + (u - 0.5) * 120 * (0.6 + k), py = y - rnd(seed + i * 5) * 90 - k * 30;
      c.save(); c.globalAlpha = a * (0.4 + rnd(seed + i * 7) * 0.25); const g = c.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r); g.addColorStop(0, '#dcd8ec'); g.addColorStop(0.55, '#a8a2c4'); g.addColorStop(1, 'rgba(150,140,180,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, py, r, 0, PI * 2); c.fill(); c.restore(); } };
  M.shadowBack = (c, p, k, gy) => smoke(c, p.x, gy - 10, 7, Math.min(1, k * 2), k < 0.75 ? 1 : (1 - k) / 0.25, 3);
  M.shadow = (c, p, k, gy, T) => { const a = k < 0.75 ? 1 : (1 - k) / 0.25, sx = p.x + 20, sy = gy - 40;
    smoke(c, p.x + 10, gy - 4, 16, Math.min(1, k * 2), a * 0.95, 11);   // 앞 연기 (몸을 가림)
    if (k > 0.2) { const u = Math.min(1, (k - 0.2) / 0.35), bx = sx + 40 + u * (T[1] - sx);   // 연기에서 튀어나온 볼트 + 연기 꼬리
      for (let i = 0; i < 8; i++) { const tu = i / 8, x = sx + 40 + (bx - sx - 40) * tu; c.save(); c.globalAlpha = 0.5 * tu * a; c.fillStyle = '#7a7a90'; c.beginPath(); c.arc(x, sy + sin(i * 2) * 4, 6 + (1 - tu) * 10, 0, PI * 2); c.fill(); c.restore(); }
      glow(c, bx, sy, 22, 'rgba(200,180,255,.8)', a); bolt(c, bx, sy, 0, 1.2); if (u >= 1) { glow(c, T[1], sy, 60, 'rgba(220,200,255,.9)', a); smoke(c, T[1], gy - 20, 4, 0.5, a * 0.8, 31); } } };
  // ===== 섬광 섬멸 (궁극기): 붉은 조준 표식이 적 무리 가운데로 모임 → 하늘에서 빛줄기 → 거대한 빛 폭발 (별 모양 빛살 · 충격파 · 화면 번쩍) =====
  M.final = (c, p, k, gy, T) => { const cx = (T[0] + T[Math.min(3, T.length - 1)]) / 2, cy = gy - 70;
    if (k < 0.3) { const u = k / 0.3; c.save(); c.translate(cx, cy); c.rotate(u * 3); c.strokeStyle = '#ff4a3a'; c.lineWidth = 4; c.globalAlpha = 0.6 + 0.4 * u; const r = 140 - u * 90; c.beginPath(); c.arc(0, 0, r, 0, PI * 2); c.stroke(); for (let i = 0; i < 4; i++) { c.rotate(PI / 2); c.beginPath(); c.moveTo(0, -r - 20); c.lineTo(0, -r + 16); c.stroke(); } c.restore();
      c.save(); c.strokeStyle = 'rgba(255,80,60,.7)'; c.setLineDash([10, 8]); c.lineWidth = 2; c.beginPath(); c.moveTo(p.x + 20, gy - 40); c.lineTo(cx, cy); c.stroke(); c.restore(); return; }
    const u = (k - 0.3) / 0.7, f = 1 - u, R = 120 + u * 260;
    if (u < 0.25) { c.save(); c.globalAlpha = 0.55 * (1 - u / 0.25); c.fillStyle = '#ffffff'; c.fillRect(p.x - 800, gy - 900, 2800, 1000); c.restore(); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = f; const bg = c.createLinearGradient(cx - 30, 0, cx + 30, 0); bg.addColorStop(0, 'rgba(255,240,180,0)'); bg.addColorStop(0.5, 'rgba(255,255,230,1)'); bg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = bg; c.fillRect(cx - 34 * f - 6, gy - 720, 68 * f + 12, 720); c.restore();
    glow(c, cx, cy, R * 1.6, 'rgba(255,230,140,.9)', f); glow(c, cx, cy, R * 0.6, 'rgba(255,255,255,1)', f);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = f; c.translate(cx, cy); c.rotate(u * 0.6); for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2, L = R * (i % 2 ? 1.1 : 1.8); c.fillStyle = i % 2 ? 'rgba(255,220,120,.8)' : 'rgba(255,255,230,.95)'; c.beginPath(); c.moveTo(cos(a - 0.06) * 20, sin(a - 0.06) * 20); c.lineTo(cos(a) * L, sin(a) * L); c.lineTo(cos(a + 0.06) * 20, sin(a + 0.06) * 20); c.closePath(); c.fill(); } c.restore();
    ring(c, cx, gy - 4, R * 1.2, '#fff4c0', f, 8); ring(c, cx, gy - 4, R * 0.8, '#ffd060', f, 4); };
})();
