'use strict';
// 쓰러질 때 등불이 켜지는 장면 (k: 0 빛이 닿음 → 1 완전히 켜짐)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const GOLD = '#ffe9a8', WARM = '#ffcf6a';
  window.noxLit = function (c, t, k, bg, heroX) {
    // 무릎 꿇은 녹스 (몸을 아래로 눌러 그림): 3페이즈 몸, 연기는 가라앉음
    c.save(); c.translate(0, 30); c.scale(1, 0.88);
    window.noxStory(c, t, 1, bg);
    c.restore();
    const lx = 82, ly = -150;   // 내민 등불
    // 금이 따뜻한 금빛으로 바뀌어 감
    for (const [a, L] of [[-2.5, 70], [-0.7, 80], [-1.6, 55], [2.6, 60], [0.6, 66], [1.6, 90]]) {
      const p = [[0, -115]]; let x = 0, y = -115; for (let s = 0; s < 5; s++) { x += cos(a + sin(s * 3) * 0.5) * L / 5; y += sin(a + sin(s * 3) * 0.5) * L / 5 * 0.88; p.push([x, y]); }
      line(c, `rgba(255,${200 + 30 * k},${140 + 60 * (1 - k)},${0.25 + 0.5 * k})`, 1.4 + k, p);
    }
    // 가슴 빈자리에 처음으로 빛이 차오름
    poly(c, `rgba(255,233,168,${0.15 + 0.75 * k})`, starPts(0, -115, 11 + k * 2), k > 0.5 ? GOLD : '#8a86c8', 1.6);
    glow(c, 0, -115, 30 + k * 40, WARM, 0.35 + k * 0.5);
    // 두 구체도 빛을 되찾음
    for (const [x, y] of [[-46, -60], [40, -40]]) { glow(c, x, y, 26, WARM, 0.2 + k * 0.5); ell(c, x, y, 12, 12, k > 0.6 ? '#3a3020' : '#05050e', k > 0.4 ? GOLD : '#9a7ae0', 1.6); poly(c, `rgba(255,236,170,${0.2 + 0.7 * k})`, starPts(x, y, 5.5)); }
    // 주인공 → 등불로 건너오는 빛 줄기
    if (k < 1) { const hx = heroX, hy = -40, n = 10;
      for (let i = 0; i < n; i++) { const u = Math.min(1, (i / n) * 1.0 + k * 0.6), x = hx + (lx - hx) * u, y = hy + (ly + 28 - hy) * u - sin(u * PI) * 40; ell(c, x, y, 2.4, 2.4, GOLD); glow(c, x, y, 10, WARM, 0.6); } }
    // 등불
    line(c, '#6a6a90', 1.4, [[lx, ly - 4], [lx, ly + 12]]);
    poly(c, '#4a4a6e', [[lx - 8, ly + 12], [lx + 8, ly + 12], [lx + 5, ly + 8], [lx - 5, ly + 8]]);
    // 켜지는 순간: 큰 번쩍임 + 빛살 + 퍼지는 고리
    const L = k;
    glow(c, lx, ly + 28, 60 + L * 50, WARM, L * 0.75);
    glow(c, lx, ly + 28, 22, '#fff8e0', L * 0.8);
    ell(c, lx, ly + 28, 12, 15, L ? `rgba(255,236,170,${0.25 + 0.5 * L})` : 'rgba(120,120,200,.13)', L ? GOLD : '#8a86c8', 1.6);
    poly(c, L ? '#fffaf0' : 'rgba(216,222,248,.15)', starPts(lx, ly + 28, 6 + L * 2), L ? WARM : '#8a86c8', 1.2);
    poly(c, '#4a4a6e', [[lx - 7, ly + 43], [lx + 7, ly + 43], [lx + 5, ly + 46], [lx - 5, ly + 46]]);
    // 두건 안이 등불 빛에 처음으로 비침
    glow(c, 6, -184, 26, WARM, L * 0.6);
  };
})();
