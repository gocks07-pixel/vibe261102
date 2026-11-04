'use strict';
// 녹스 최종 후보: v3 + ① 두 꺼진 별 구체 · 퍼지는 금 + ⑤ 꺼진 등불 (페이즈 1~3)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const VIO = '#9a7ae0';
  const deadStar = (c, x, y, r, t, dim) => { glow(c, x, y, r * 2.4, '#8a80d0', 0.3 * dim); ell(c, x, y, r, r, '#05050e', VIO, 1.6); poly(c, `rgba(216,222,248,${(0.22 + 0.15 * sin(t * 2)) * dim})`, starPts(x, y, r * 0.45)); };
  // 가슴 빈자리에서 퍼지는 금 (길이 비율 k)
  const cracks = (c, k, t) => {
    for (const [a, L] of [[-2.5, 80], [-0.7, 90], [-1.6, 60], [2.6, 70], [0.6, 75], [1.6, 110], [-3.0, 95]]) {
      const n = Math.max(1, Math.round(5 * k)); if (k < 0.3 && L > 80) continue;
      const p = [[0, -165]]; let x = 0, y = -165;
      for (let s = 0; s < n; s++) { x += cos(a + sin(s * 3) * 0.5) * L / 5; y += sin(a + sin(s * 3) * 0.5) * L / 5; p.push([x, y]); }
      line(c, 'rgba(154,122,224,.3)', 4, p); line(c, `rgba(190,176,245,${0.5 + 0.3 * sin(t * 2 + a)})`, 1.2, p);
    }
  };
  // 등불: 별이 꺼진 유리 등. cracked: 3페이즈에 유리가 갈라지고 별이 깜빡임
  const lantern = (c, lx, ly, t, ph) => {
    line(c, '#4a4a70', 1.2, [[lx, ly - 4], [lx, ly + 12]]);
    poly(c, '#3a3a5e', [[lx - 8, ly + 12], [lx + 8, ly + 12], [lx + 5, ly + 8], [lx - 5, ly + 8]]);
    ell(c, lx, ly + 28, 12, 15, 'rgba(120,120,200,.13)', '#8a86c8', 1.4);
    poly(c, '#3a3a5e', [[lx - 7, ly + 43], [lx + 7, ly + 43], [lx + 5, ly + 46], [lx - 5, ly + 46]]);
    const fl = ph === 2 ? (sin(t * 9) > 0.3 ? 0.65 : 0.12) : ph === 1 ? 0.28 : 0.12;   // 꺼진 별 (3페이즈: 깜빡임)
    poly(c, `rgba(216,222,248,${fl})`, starPts(lx, ly + 28, 5.5), '#8a86c8', 1);
    glow(c, lx, ly + 28, 20, '#8a80d0', 0.15 + fl * 0.4);
    if (ph === 2) line(c, '#c8c8f0', 0.9, [[lx - 6, ly + 18], [lx - 1, ly + 26], [lx - 4, ly + 34], [lx + 2, ly + 40]]);   // 유리 금
  };

  window.noxMix = function (c, t, ph, bg) {
    const ang = [-0.15, -1.15, -1.35][ph];
    const hx = 22 - 70 * sin(ang), hy = -194 + 70 * cos(ang);   // 앞쪽 손 위치
    // 두 구체: 1 바닥 근처에 가라앉음 / 2 양옆에 뜸 / 3 가슴 빈자리로 끌려감
    const orbs = ph === 0 ? [[-56, -26], [52, -24]] : ph === 1 ? [[-72, -120], [-48, -200]] : [[-34 + cos(t) * 14, -170 + sin(t) * 10], [30 + cos(t + 2) * 14, -150 + sin(t + 2) * 10]];
    // 3페이즈: 하체 연기 (뒤)
    if (ph === 2) for (let i = 0; i < 9; i++) { const u = (t * 0.3 + i / 9) % 1; c.globalAlpha = 0.5 * (1 - u); ell(c, sin(i * 2.1) * 30 + sin(t + i) * 6, -10 - u * 60, 16 * (1 - u * 0.5), 10, '#14142c'); c.globalAlpha = 1; }
    // 금 (몸 뒤로 뻗는 부분)
    if (ph >= 1) cracks(c, ph === 1 ? 0.6 : 1, t);
    c.save(); if (ph === 2) { c.translate(0, -18); c.beginPath(); c.rect(-200, -400, 400, 400 - 46); c.clip(); }
    window.noxStory(c, t, ph, bg);
    // 금 (몸 위)
    cracks(c, [0.25, 0.6, 1][ph], t);
    c.restore();
    // 3페이즈: 하체가 연기로 풀림 (앞)
    if (ph === 2) {
      for (let i = 0; i < 16; i++) { const u = ((t * 0.35 + i / 16) % 1), x = sin(i * 2.3) * 30 + sin(t + i) * 5, y = -24 - u * 70;
        c.globalAlpha = 0.85 * (1 - u); ell(c, x, y, 16 - u * 6, 10 - u * 3, i % 3 ? '#1a1a36' : '#26264a'); c.globalAlpha = 1; }
      for (const [x, y] of orbs) line(c, 'rgba(184,176,240,.35)', 1, [[x, y], [0, -183]]);   // 빈자리로 끌려가는 선
    }
    for (const [x, y] of orbs) deadStar(c, x, y, 14, t, [0.5, 1, 1.3][ph]);
    lantern(c, hx + 4, hy + (ph === 2 ? -10 : 6), t, ph);
  };
})();
