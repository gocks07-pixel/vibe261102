// 천붕검제 다안 변형 — 불씨 고리를 목 대신 검에 (검 위치는 outfit.js 팔·무기 변환 그대로)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,120,30,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const toBlade = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.9); };   // 칼날: y 4 → 36
  const ringPts = (fr, t) => { const o = []; for (let i = 0; i <= 60; i++) { const u = i / 60, y = 6 + u * 30, a = t * 5 - u * PI * 5; o.push([sin(a) * 6, y, cos(a)]); } return o; };
  const S = G.AuraW4a3 = {};
  const old = G.AuraW4a2.da, oldF = G.AuraW4a2.daFront; S.ga = old; S.gaFront = oldF;
  // 나: 불꽃 감은 검 — 칼날을 나선으로 감고 도는 불 띠 (뒤쪽은 칼 뒤로)
  const spiral = (front) => (c, p, t) => { c.save(); toBlade(c, p); const pts = ringPts(0, t); c.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) { const [x0, y0, z0] = pts[i - 1], [x1, y1] = pts[i]; if ((z0 > 0) !== front) continue; const u = i / pts.length;
      c.strokeStyle = `rgba(255,${110 + 120 * u},${40 + 60 * u},${front ? 0.95 : 0.6})`; c.lineWidth = 2.6 - u * 1.2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    if (front) for (let i = 0; i < 4; i++) { const u = (t * 0.8 + i / 4) % 1; c.save(); c.globalAlpha = 1 - u; ell(c, sin(i * 2.3) * 7, 36 + u * 14, 1.4, 1.4, '#ffd060'); c.restore(); }
    c.restore(); };
  S.na = spiral(false); S.naFront = spiral(true);
  // 다: 달아오른 칼날 — 칼날 자체가 붉게 달아올라 빛나고, 날 끝에 작은 불꽃
  S.daFront = (c, p, t) => { c.save(); toBlade(c, p); const br = 0.75 + 0.25 * sin(t * 4);
    soft(c, 0, 22, 22, 'rgba(255,110,30,.55)', br); c.globalAlpha = 0.85 * br; const g = c.createLinearGradient(0, 4, 0, 36); g.addColorStop(0, '#ffd070'); g.addColorStop(1, '#ff5a14');
    c.beginPath(); c.roundRect(-2.6, 4, 5.2, 32, 2); c.fillStyle = g; c.fill(); c.globalAlpha = 1; c.fillStyle = '#fff6d8'; c.fillRect(-0.6, 7, 1.2, 26);
    for (let i = 0; i < 3; i++) { const u = (t * 1.4 + i / 3) % 1; c.save(); c.globalAlpha = 1 - u; ell(c, sin(t * 6 + i) * 2, 37 + u * 12, 2 * (1 - u) + 0.6, 3 * (1 - u) + 0.8, i % 2 ? '#ffb040' : '#ff7a20'); c.restore(); }
    c.restore(); };
  S.da = () => {};
  // 라: 칼끝 불씨 고리 — 칼날 중간을 가로로 두른 작은 불 고리 둘이 칼을 따라 천천히 오르내림
  const rings = (front) => (c, p, t) => { c.save(); toBlade(c, p); for (let k = 0; k < 2; k++) { const y = 12 + ((t * 0.5 + k * 0.5) % 1) * 22;
      for (let i = 0; i < 24; i++) { const a = t * 3 + i / 24 * PI * 2, b = a + PI / 12; if ((sin(a) > 0) !== front) continue;
        c.strokeStyle = `rgba(255,${130 + 90 * ((i % 6) / 6)},40,${front ? 0.95 : 0.55})`; c.lineWidth = 1.8; c.beginPath(); c.moveTo(cos(a) * 8, y + sin(a) * 2.4); c.lineTo(cos(b) * 8, y + sin(b) * 2.4); c.stroke(); }
      if (front) { const a = t * 3 + k; soft(c, cos(a) * 8, y + 2, 5, 'rgba(255,150,40,.8)', 1); ell(c, cos(a) * 8, y + 2, 1.4, 1.4, '#fff0b0'); } }
    c.restore(); };
  S.ra = rings(false); S.raFront = rings(true);
})();
