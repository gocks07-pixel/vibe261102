// 야천 새 시안 (현실적으로): 야천 멸살 (궁극기) · 암영 일섬 (3차)
(function () { const PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max;
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  const M = G.SageMock = G.SageMock || {};
  const soft = (c, x, y, rx, ry, rgb, al) => { if (al <= 0.004) return; c.save(); c.translate(x, y); c.scale(1, ry / rx); const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(${rgb},${al})`); g.addColorStop(0.6, `rgba(${rgb},${al * 0.45})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, PI * 2); c.fill(); c.restore(); };
  // 그림자 칼날: 검은 몸 · 가장자리 보랏빛 · 연기 꼬리
  const blade = (c, x, y, ang, L, a) => { c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha *= a;
    for (let i = 0; i < 10; i++) soft(c, -L * 0.4 - i * 9, (rnd(i) - 0.5) * 6, 10 + i * 1.5, 7 + i, '60,30,90', 0.18 * (1 - i / 10));
    c.beginPath(); c.moveTo(L * 0.55, 0); c.quadraticCurveTo(0, -8, -L * 0.45, -3); c.lineTo(-L * 0.45, 3); c.quadraticCurveTo(0, 8, L * 0.55, 0); c.closePath();
    const g = c.createLinearGradient(-L * 0.45, 0, L * 0.55, 0); g.addColorStop(0, 'rgba(20,10,35,.2)'); g.addColorStop(0.6, '#1a0e2a'); g.addColorStop(1, '#3a2060'); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(190,150,255,.85)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(L * 0.55, 0); c.quadraticCurveTo(0, -5, -L * 0.3, -2.5); c.stroke(); c.restore(); };
  // ===== 야천 멸살 (궁극기): 밤하늘이 내려앉고(칠흑의 밤과 달리 달 없이 어둠만) → 적 머리 위 어둠에서 그림자 칼날 수십 개가 생겨 한꺼번에 내리꽂힘 → 꽂힌 자리 어둠이 터지며 사라짐 =====
  M.annihil = (c, p, k, gy, T) => { const dk = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1;
    c.save(); c.globalAlpha = dk * 0.62; const g = c.createLinearGradient(0, gy - 700, 0, gy); g.addColorStop(0, 'rgba(10,4,24,.95)'); g.addColorStop(1, 'rgba(30,15,55,.4)'); c.fillStyle = g; c.fillRect(p.x - 600, gy - 800, 2400, 820); c.restore();
    const cx = (T[0] + T[3]) / 2; for (let i = 0; i < 8; i++) soft(c, cx + (rnd(i) - 0.5) * 520, gy - 330 + (rnd(i * 3) - 0.5) * 60, 140, 40, '40,15,70', dk * 0.35);   // 어둠 구름
    const N = 22; for (let i = 0; i < N; i++) { const tx = T[i % T.length] + (rnd(i * 5) - 0.5) * 60, sx = tx + (rnd(i * 7) - 0.5) * 120, sy = gy - 300 - rnd(i * 9) * 80, ang = Math.atan2(gy - 40 - sy, tx - sx);
      const t0 = 0.22 + rnd(i * 11) * 0.12, u = (k - t0) / 0.12;
      if (k < t0) { const s = min(1, max(0, (k - 0.12) / 0.1)); blade(c, sx, sy, ang, 64 * s, s * 0.95); continue; }   // 공중에 생겨 겨눔
      if (u < 1) { const x = sx + (tx - sx) * u, y = sy + (gy - 40 - sy) * u; blade(c, x, y, ang, 70, 1); continue; }
      const v = min(1, (u - 1) / 2.5); blade(c, tx - cos(ang) * 16, gy - 40 - sin(ang) * 16, ang, 70, 1 - v);   // 꽂힘
      soft(c, tx, gy - 34, 40 + v * 50, 22 + v * 20, '120,70,200', (1 - v) * 0.5); soft(c, tx, gy - 34, 16, 10, '230,210,255', (1 - v) * 0.8); } };
  // ===== 암영 일섬 (3차): 그림자 속으로 녹아 사라짐 → 첫 적 뒤에서 그림자가 솟아 나타나 가로로 한 번 베고 → 베인 자리에 보랏빛 금이 남았다 흩어짐 =====
  M.flash = (c, p, k, gy, T) => { const tx = T[0], bx = tx + 70;
    if (k < 0.3) { const u = k / 0.3; for (let i = 0; i < 14; i++) soft(c, p.x + (rnd(i) - 0.5) * 40, gy - 10 - rnd(i * 3) * 80 * u, 20 + u * 20, 14 + u * 10, '30,15,50', 0.35 * (1 - u * 0.5)); soft(c, p.x, gy - 2, 50, 10, '10,5,20', 0.6); return; }   // 녹아드는 그림자
    if (k < 0.45) { const u = (k - 0.3) / 0.15; soft(c, bx, gy - 2, 60, 12, '10,5,20', 0.7); for (let i = 0; i < 10; i++) soft(c, bx + (rnd(i) - 0.5) * 40, gy - 20 - rnd(i * 3) * 90 * (1 - u), 22, 16, '40,20,70', 0.35); return; }   // 적 뒤에서 솟음
    const u = (k - 0.45) / 0.55, f = 1 - u, sw = min(1, u / 0.25);
    c.save(); c.globalAlpha = f; const x0 = bx + 30, x1 = tx - 150, y = gy - 50, xe = x0 + (x1 - x0) * sw;
    const g = c.createLinearGradient(x0, 0, xe, 0); g.addColorStop(0, 'rgba(200,170,255,0)'); g.addColorStop(0.7, 'rgba(210,180,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.strokeStyle = g; c.lineWidth = 3 + 6 * (1 - sw); c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y + 8); c.quadraticCurveTo((x0 + xe) / 2, y - 14, xe, y + 4); c.stroke(); c.restore();   // 베는 궤적
    for (let i = 0; i < 12; i++) { const xx = x0 + (x1 - x0) * (i / 12); if (xx < min(x0, xe) || xx > max(x0, xe)) continue; soft(c, xx, y - 2, 18, 8, '140,90,220', f * 0.35); soft(c, xx + (rnd(i) - 0.5) * 20, y - 20 - u * 60 * rnd(i * 3), 12, 10, '50,25,80', f * 0.3); } };   // 남은 보랏빛 · 흩어지는 그림자
})();

G.SageMock.flashPre = (p, k, w) => { const T = w.monsters.filter(m => !m.dead && !m.isBoss).map(m => m.x).sort((a, b) => a - b); if (k >= 0.3 && k < 0.45) p.x = -900; else if (k >= 0.45) { p.x = T[0] + 70; p.dir = -1; } };
