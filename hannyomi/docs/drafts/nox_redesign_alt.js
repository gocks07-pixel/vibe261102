'use strict';
// 공허의 군주 녹스 · 새 디자인 시안 v2 (페이즈 1~3). 발밑 (0,0), 키 약 270, 오른쪽을 봄
// 위엄: 넓은 어깨 → 가는 허리 → 길고 가늘게 좁아지는 하체 (역삼각형), 높이 솟은 왕관 첨탑 + 등 뒤의 큰 고리
// 우리 이야기: 일곱 영웅이 일곱 별조각으로 봉인한 공허 / 별을 삼키는 심연 / 별빛이 닿지 않은 외로움
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const star = (c, x, y, r, f, s, lw) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } poly(c, f, p, s, lw); };
  const chain = (c, pts, col = '#9a8ab8') => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 7));
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; c.save(); c.translate(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); c.rotate(Math.atan2(y1 - y0, x1 - x0) + (k % 2 ? PI / 2 : 0)); ell(c, 0, 0, 4, 2.3, null, col, 1.8); c.restore(); }
    }
  };

  // ph: 0 봉인된 모습 / 1 각성 / 2 진정한 모습
  window.noxArt = function (c, t, ph, s = {}) {
    const cast = s.cast || 0;
    const lift = [0, 10, 34][ph] + sin(t * 1.4) * (ph ? 4 : 1.5);
    const EDGE = ['#8a5ac0', '#c070ff', '#f0a8ff'][ph], EYE = ['#ff4060', '#ff3aa0', '#ffffff'][ph];
    const DARK = '#0e0620', ARM = '#2a1648', ARM2 = '#45286e';
    // 발밑 공허 (좁고 깊게)
    const pr = 46 + ph * 14, pool = c.createRadialGradient(0, 0, 2, 0, 0, pr);
    pool.addColorStop(0, `rgba(170,70,255,${0.45 + ph * 0.12})`); pool.addColorStop(1, 'rgba(60,10,90,0)');
    c.fillStyle = pool; c.beginPath(); c.ellipse(0, 0, pr, 9 + ph * 2, 0, 0, PI * 2); c.fill();
    c.save(); c.translate(0, -lift);

    // ===== 등 뒤의 큰 고리: 일곱 개의 빈 별자리 (일곱 별조각에 빼앗긴 자리) =====
    c.save(); c.translate(0, -196);
    const RR = [62, 74, 88][ph];
    glow(c, 0, 0, RR * 1.4, ph === 2 ? '#b050ff' : '#7a30c0', 0.25 + ph * 0.12);
    c.strokeStyle = ph === 0 ? 'rgba(150,120,90,.75)' : ph === 1 ? 'rgba(200,120,255,.9)' : 'rgba(250,215,255,.95)'; c.lineWidth = 3;
    if (ph === 0) for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(0, 0, RR, -PI / 2 + i * PI * 2 / 7 + 0.18, -PI / 2 + (i + 1) * PI * 2 / 7 - 0.18); c.stroke(); }   // 끊어진 고리
    else { c.beginPath(); c.arc(0, 0, RR, 0, PI * 2); c.stroke(); c.lineWidth = 1; c.beginPath(); c.arc(0, 0, RR - 7, 0, PI * 2); c.stroke(); }
    for (let i = 0; i < 7; i++) {
      const a = -PI / 2 + i * PI * 2 / 7 + (ph === 2 ? t * 0.25 : 0), x = cos(a) * RR, y = sin(a) * RR;
      poly(c, ph === 0 ? '#2a2018' : '#2a1446', [[x - cos(a) * 3 - sin(a) * 5, y - sin(a) * 3 + cos(a) * 5], [x + cos(a) * 16, y + sin(a) * 16], [x - cos(a) * 3 + sin(a) * 5, y - sin(a) * 3 - cos(a) * 5]], c.strokeStyle, 1);
      star(c, x + cos(a) * 24, y + sin(a) * 24, 5, ph === 0 ? 'rgba(0,0,0,0)' : `rgba(245,210,255,${0.3 + ph * 0.3})`, ph === 0 ? '#8a7a50' : '#f4d0ff', 1.2);
      if (ph >= 1) glow(c, x + cos(a) * 24, y + sin(a) * 24, 12, '#e090ff', 0.35 + ph * 0.2);
    }
    c.restore();

    // ===== 망토: 좁고 긴 띠가 뒤쪽으로 흩날림 (2→3→4갈래) =====
    const bands = [2, 3, 4][ph];
    for (let i = 0; i < bands; i++) {
      const sx = -16 + i * 6, len = [150, 175, 200][ph] - i * 14, sway = sin(t * 1.6 + i) * 8;
      const ex = -54 - i * 18 + sway, ey = -170 + len;
      c.beginPath(); c.moveTo(sx - 8, -178);
      c.bezierCurveTo(sx - 30, -130, ex + 14, ey - 60, ex, ey);
      c.lineTo(ex + 6, ey - 16);
      c.bezierCurveTo(ex + 24, ey - 70, sx - 6, -120, sx + 10, -176); c.closePath();
      c.fillStyle = lin(c, 0, -178, ex, ey, ph === 2 ? '#3a0e6a' : '#2e1250', DARK); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.2; c.stroke();
      if (ph === 2) for (let k = 0; k < 4; k++) ell(c, sx - 20 - k * 10 + sway * k / 4, -150 + k * 28, 1.2, 1.2, '#f0e0ff');
    }

    // ===== 페이즈 3: 등 뒤로 부채처럼 펼쳐진 결정 날개 =====
    if (ph === 2) for (let i = 0; i < 6; i++) {
      const a = -PI / 2 - 1.15 + i * 0.46 + sin(t + i) * 0.03, L = 120 - Math.abs(i - 2.5) * 14;
      c.save(); c.translate(0, -175); c.rotate(a + PI / 2);
      poly(c, lin(c, 0, 0, 0, -L, '#3a1066', 'rgba(220,170,255,.85)'), [[-6, 0], [0, -L], [6, 0], [0, 10]], '#c890ff', 1);
      c.restore();
    }

    // ===== 하체: 길고 가늘게 좁아짐 =====
    if (ph < 2) {
      // 긴 로브 (허리 ±13 → 무릎 ±24 → 끝 ±16, 땅에 끌림)
      c.beginPath(); c.moveTo(-13, -120); c.quadraticCurveTo(-26, -60, -18, 0); c.lineTo(-6, -6); c.lineTo(0, 2); c.lineTo(6, -6); c.lineTo(18, 0); c.quadraticCurveTo(26, -60, 13, -120); c.closePath();
      c.fillStyle = lin(c, 0, -120, 0, 0, '#2a1250', DARK); c.fill(); c.strokeStyle = EDGE; c.lineWidth = 1.6; c.stroke();
      // 앞 장식 띠 (가는 휘장)
      poly(c, lin(c, 0, -118, 0, -14, '#4a2a78', '#1a0a30'), [[-6, -118], [6, -118], [5, -20], [0, -10], [-5, -20]], EDGE, 1);
      star(c, 0, -60, 4, ph === 0 ? '#8a7a50' : '#e8b8ff');
    } else {
      // 공허 소용돌이 꼬리: 하체가 뾰족하게 녹아내림
      c.beginPath(); c.moveTo(-14, -120);
      for (let k = 0; k <= 10; k++) { const u = k / 10, w = 14 * (1 - u) + 10 * sin(u * PI) * 0.6; c.lineTo(-w + sin(t * 3 + u * 6) * 6 * u, -120 + u * 110); }
      for (let k = 10; k >= 0; k--) { const u = k / 10, w = 14 * (1 - u) + 10 * sin(u * PI) * 0.6; c.lineTo(w + sin(t * 3 + u * 6) * 6 * u, -120 + u * 110); }
      c.closePath(); c.fillStyle = lin(c, 0, -120, 0, -10, '#3a0e6a', 'rgba(20,4,40,.2)'); c.fill(); c.strokeStyle = 'rgba(240,168,255,.6)'; c.lineWidth = 1.2; c.stroke();
      for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(220,150,255,${0.5 - k * 0.12})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(sin(t * 3 + k) * 4, -40 + k * 14, 18 - k * 4, 5 - k, 0, t * 2 + k, t * 2 + k + 4); c.stroke(); }
    }

    // ===== 상체: 넓은 어깨 → 가는 허리 =====
    poly(c, lin(c, 0, -190, 0, -118, '#3e2466', '#160a2a'), [[-30, -186], [30, -186], [22, -150], [13, -120], [-13, -120], [-22, -150]], '#0a0414', 1.6);
    rrect2(c, -14, -126, 28, 8, '#2a1646', EDGE);   // 허리띠
    line(c, 'rgba(200,130,255,.4)', 1, [[-18, -168], [18, -168]]); line(c, 'rgba(200,130,255,.3)', 1, [[-16, -156], [16, -156]]);
    // 가슴의 심연 (별을 삼키는 핵)
    const cr = [6, 9, 13][ph];
    glow(c, 0, -160, cr * 3.4, EDGE, 0.6 + cast * 0.4);
    if (ph >= 1) { c.save(); c.translate(0, -160); c.rotate(t * 1.3); c.strokeStyle = ph === 2 ? '#fff0ff' : '#d890ff'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, cr * 2.2, cr * 0.65, 0, 0, PI * 2); c.stroke(); c.restore(); }
    ell(c, 0, -160, cr, cr, '#000', ph === 2 ? '#fff0ff' : EDGE, 1.8);
    if (ph === 2) for (let i = 0; i < 6; i++) { const u = (t * 0.7 + i / 6) % 1, a = i * 1.05 + u * 4, r = cr * 4 * (1 - u); ell(c, cos(a) * r, -160 + sin(a) * r * 0.6, 1.4, 1.4, '#fff6c8'); }
    // 봉인의 사슬 (페이즈 1)
    if (ph === 0) { chain(c, [[-28, -182], [0, -150], [28, -182]]); chain(c, [[-20, -120], [20, -100]]); chain(c, [[20, -120], [-20, -100]]); }
    if (ph === 1) for (let i = 0; i < 5; i++) { const a = t * 0.9 + i * 1.3, r = 52; chain(c, [[cos(a) * r, -130 + sin(a) * 16], [cos(a) * r + 10, -134 + sin(a) * 16]], '#7a6a98'); }

    // ===== 견갑: 위로 솟은 날카로운 층 =====
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 30, -186); c.scale(sg, 1);
      const L = [14, 20, 26][ph];
      poly(c, lin(c, 0, -10, 20, 10, '#4e2e7e', '#1c0c34'), [[-8, 8], [0, -6], [L + 10, -14 - ph * 4], [L + 4, 2], [8, 12]], EDGE, 1.3);
      poly(c, '#2a1448', [[2, -4], [L, -24 - ph * 8], [L + 6, -10]], EDGE, 1.2);
      if (ph >= 1) poly(c, '#2a1448', [[L - 2, -8], [L + 16, -20 - ph * 6], [L + 10, -4]], EDGE, 1);
      c.restore(); }

    // ===== 팔: 길고 가늘게. 뒤쪽 팔은 아래로 펼친 손바닥, 앞쪽 팔은 위로 들어 공허 구체 =====
    const arm = (sg, ang, orb) => { c.save(); c.translate(sg * 32, -182); c.rotate(ang);
      poly(c, lin(c, 0, 0, 0, 40, ARM2, ARM), [[-6, 0], [6, 0], [5, 40], [-5, 40]], EDGE, 1.1);        // 위팔
      c.translate(0, 40); c.rotate(sg * -0.3);
      poly(c, lin(c, 0, 0, 0, 36, ARM2, ARM), [[-5, 0], [5, 0], [7, 30], [-7, 30]], EDGE, 1.1);        // 아래팔 + 넓어지는 소매 끝
      poly(c, '#1a0a30', [[-7, 28], [7, 28], [12, 40], [-12, 40]], EDGE, 1);
      ell(c, 0, 44, 5, 6, '#cbb0f0', '#6a40a0', 1);                                                   // 손
      for (const fx of [-4, -1, 2, 5]) line(c, '#bfa0e8', 1.6, [[fx, 48], [fx * 1.4, 57]]);              // 긴 손가락
      if (ph === 0) chain(c, [[-9, 26], [9, 26]], '#b0a0d0');
      if (orb) { glow(c, 0, 66, 26 + cast * 16, '#c050ff', 0.85); ell(c, 0, 68, 9 + cast * 4, 9 + cast * 4, '#06010e', '#f0a0ff', 2);
        c.save(); c.translate(0, 68); c.rotate(-t * 2); c.strokeStyle = 'rgba(240,170,255,.7)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 0, 15 + cast * 4, 4, 0, 0, PI * 1.4); c.stroke(); c.restore(); }
      c.restore(); };
    arm(-1, 0.35 + (ph === 2 ? 0.35 : 0), ph === 2);
    arm(1, ph === 0 ? -0.35 : -(2.2 + cast * 0.3), ph >= 1);

    // ===== 머리: 길쭉한 가면 + 두건, 높이 솟은 왕관 첨탑 =====
    c.save(); c.translate(0, -206);
    poly(c, lin(c, 0, -18, 0, 16, '#3a1a62', '#14082a'), [[-14, 12], [-16, -4], [-9, -18], [0, -24], [9, -18], [16, -4], [14, 12], [0, 20]], EDGE, 1.5);   // 두건
    poly(c, '#05010c', [[-9, 9], [-10, -5], [0, -12], [10, -5], [9, 9], [0, 15]]);   // 가면 속 어둠
    poly(c, lin(c, 0, -12, 0, 14, '#d8c8f0', '#7a68a0'), [[-8, -5], [0, -11], [8, -5], [6, 8], [0, 13], [-6, 8]], null);   // 창백한 가면
    poly(c, '#05010c', [[-8, -5], [0, -11], [8, -5], [6, 8], [0, 13], [-6, 8]], null); c.globalAlpha *= 1;
    for (const sg of [-1, 1]) poly(c, EYE, [[sg * 1.5, -1], [sg * 8, -4], [sg * 6.5, 1.5]]);
    glow(c, 0, -1, 14, EYE, ph === 2 ? 0.95 : 0.7);
    line(c, EDGE, 1, [[0, 3], [0, 12]]);
    // 왕관 첨탑 (가운데가 가장 높음)
    const H = [26, 34, 44][ph], CR = ph === 0 ? '#8a7448' : ph === 1 ? '#c890ff' : '#f6d8ff';
    for (let i = -3; i <= 3; i++) {
      const x = i * 4.6, h = H * (1 - Math.abs(i) * 0.2), y0 = -18 + Math.abs(i) * 1.6;
      poly(c, ph === 0 ? '#3a2e1a' : '#2a1448', [[x - 2.4, y0], [x, y0 - h], [x + 2.4, y0]], CR, 1);
      if (ph >= 1 && i % 2 === 0) { ell(c, x, y0 - h - 3, 1.8, 1.8, '#fff0ff'); glow(c, x, y0 - h - 3, 7, '#e0a0ff', 0.5 * ph); }
    }
    line(c, CR, 2, [[-15, -17], [15, -17]]);
    c.restore();

    // 페이즈 3: 주위를 도는 별 파편
    if (ph === 2) for (let i = 0; i < 7; i++) { const a = t * 0.6 + i * PI * 2 / 7, x = cos(a) * 92, y = -150 + sin(a) * 26;
      c.save(); c.translate(x, y); c.rotate(a); poly(c, 'rgba(235,205,255,.9)', [[0, -7], [2.6, 0], [0, 7], [-2.6, 0]], '#8a40d0', 1); c.restore(); glow(c, x, y, 9, '#c070ff', 0.5); }
    c.restore();
  };
  function rrect2(c, x, y, w, h, f, s) { c.beginPath(); c.roundRect(x, y, w, h, 3); c.fillStyle = f; c.fill(); c.strokeStyle = s; c.lineWidth = 1.2; c.stroke(); }
})();
