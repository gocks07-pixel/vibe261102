'use strict';
// 녹스 · 이야기에서 나온 디자인 시안 v3. 발밑 (0,0), 키 약 250, 오른쪽을 봄
// 밤 그 자체 / 가슴의 별 모양 빈자리(떼어 낸 공허의 별조각) / 앞으로 뻗은 손 / 꺼져 가는 별을 품은 망토
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const chain = (c, x0, y0, x1, y1) => { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 7); for (let k = 0; k < n; k++) { const u = (k + .5) / n; c.save(); c.translate(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); c.rotate(Math.atan2(y1 - y0, x1 - x0) + (k % 2 ? PI / 2 : 0)); ell(c, 0, 0, 4, 2.3, null, '#5a5a6e', 1.6); c.restore(); } };

  // ph 0 체념(봉인) / 1 서러움 / 2 절망(무너짐).  bg: 빈자리 너머로 비칠 배경색
  window.noxStory = function (c, t, ph, bg) {
    const NIGHT = '#0a0a16', CLOAK = '#12122a', CLOAK2 = '#1c1c3a', LINE = '#2c2c4e', PALE = '#d8def8';
    const bow = [0.22, 0.02, -0.06][ph];   // 고개 숙임
    const fade = ph === 2 ? 1 : 0;
    // 그림자 (짧고 좁게)
    ell(c, 0, 0, 42, 6, 'rgba(0,0,0,.45)');
    // ---- 망토: 곧게 떨어지는 긴 사다리꼴 (아래로 크게 퍼지지 않음) ----
    const hem = (x0, x1, y) => { const n = 9, pts = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; pts.push([x, y - (i % 2 ? 6 + fade * 18 : 0) + (fade ? sin(t * 2 + i) * 4 : 0)]); } return pts; };
    const cloak = [[-26, -196], [26, -196], [34, -2], ...hem(34, -34, 0).slice(1, -1), [-34, -2]];
    poly(c, lin(c, 0, -196, 0, 0, CLOAK2, NIGHT), cloak, LINE, 1.4);
    // 망토 안의 꺼져 가는 별들 (빛나지 못하고 희미)
    c.save(); poly(c, null, cloak); c.clip();
    for (let i = 0; i < 18 + ph * 10; i++) { const x = ((i * 53) % 60) - 30, y = -180 + ((i * 97) % 170), a = (0.15 + 0.25 * ((sin(t * 1.3 + i) + 1) / 2)) * (ph === 2 ? 1.6 : 1);
      ell(c, x, y, 1.1, 1.1, `rgba(220,226,255,${Math.min(0.75, a)})`); }
    c.restore();
    // 절망: 가장자리가 밤하늘로 풀려 흩어짐 (아래·옆으로 떨어져 나가는 조각)
    if (ph === 2) for (let i = 0; i < 22; i++) { const u = ((t * 0.25 + i / 22) % 1), x = (i % 2 ? 1 : -1) * (30 + u * 40) + sin(i) * 6, y = -190 + (i * 37 % 190) + u * 10;
      c.globalAlpha = 1 - u; poly(c, CLOAK2, [[x, y], [x + 5, y + 3], [x + 2, y + 8], [x - 3, y + 4]]); if (i % 3 === 0) ell(c, x + 2, y + 3, 1, 1, PALE); c.globalAlpha = 1; }
    // ---- 상체 ----
    poly(c, lin(c, 0, -200, 0, -120, '#1a1a36', NIGHT), [[-24, -200], [24, -200], [18, -130], [-18, -130]], LINE, 1.2);
    // ---- 가슴의 별 모양 빈자리 (뒤 배경이 그대로 비침) ----
    const sr = [11, 12, 14][ph], cy = -165;
    poly(c, bg, starPts(0, cy, sr));
    // 빈자리 안으로 빨려 드는 희미한 별빛 (페이즈 2부터)
    if (ph >= 1) for (let i = 0; i < 5; i++) { const u = (t * 0.4 + i / 5) % 1, a = i * 1.26, r = sr * (3.2 - u * 2.6); ell(c, cos(a) * r, cy + sin(a) * r * 0.8, 1, 1, `rgba(220,226,255,${u * 0.8})`); }
    poly(c, null, starPts(0, cy, sr), ph === 2 ? PALE : '#6a6e98', ph === 2 ? 1.6 : 1.2);
    // ---- 봉인의 사슬 (체념) ----
    if (ph === 0) { chain(c, -24, -192, 24, -142); chain(c, 24, -192, -24, -142); }
    // ---- 팔: 뒤쪽 팔은 늘어뜨림, 앞쪽 팔은 페이즈에 따라 뻗음 ----
    const arm = (sg, ang, reach) => { c.save(); c.translate(sg * 22, -194); c.rotate(ang);
      poly(c, lin(c, 0, 0, 0, 70, CLOAK2, NIGHT), [[-6, 0], [6, 0], [8, 64], [-8, 64]], LINE, 1.1);
      // 손: 가늘고 긴 손가락
      ell(c, 0, 70, 4.5, 5.5, '#2a2a46');
      for (const fx of [-3.5, -1, 1.5, 4]) { c.strokeStyle = '#3a3a5a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(fx, 73); c.lineTo(fx * (reach ? 1.6 : 1.2), 82 + (reach ? 2 : 0)); c.stroke(); }
      if (ph === 0) chain(c, -9, 56, 9, 56);
      c.restore(); };
    arm(-1, 0.12, false);
    arm(1, [-0.15, -1.15, -1.35][ph] + sin(t * 1.2) * 0.03, ph >= 1);
    // ---- 머리: 깊은 두건, 얼굴은 어둠, 희미한 두 눈 ----
    c.save(); c.translate(0, -214); c.rotate(bow);
    poly(c, lin(c, 0, -26, 0, 18, CLOAK2, NIGHT), [[-16, 16], [-18, -4], [-10, -22], [0, -27], [10, -22], [18, -4], [16, 16]], LINE, 1.3);
    poly(c, '#030308', [[-10, 12], [-11, -4], [0, -12], [11, -4], [10, 12], [0, 16]]);
    const ea = [0.45, 0.75, 0.95][ph];
    for (const sg of [-1, 1]) ell(c, sg * 4.5 + 1, 0, 2.2, 1.1, `rgba(216,222,248,${ea})`);
    // 왕관: 장식 없는 가는 검은 고리 하나 (머리 위에 살짝 떠 있음)
    c.strokeStyle = ph === 2 ? 'rgba(216,222,248,.55)' : '#3a3a5e'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, -32 - ph * 2, 15, 4, 0, 0, PI * 2); c.stroke();
    c.restore();
  };
})();
