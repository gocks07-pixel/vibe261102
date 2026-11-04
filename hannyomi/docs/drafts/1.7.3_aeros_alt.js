'use strict';
// 1.7.3 시안 (사용자 디자인을 바탕으로): 구름 양 → 하늘 여우, 하늘 요정 → 구름 양날이, 천둥새 → 천공의 부엉이
// 게임과 같은 그리기 방식 (G.MonArt[id] = {die, sh, draw(ctx, m, t, s)}), 오른쪽을 보는 모습 기준
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const LN = '#9097dc', W = '#f7f7ff', LAV = '#c9cdf6', PERI = '#8e9cf6', GOLD = '#f5c86a', GOLD2 = '#ffe2a0', GD = '#c09030';

  // ---------------- 하늘 여우 (id cloud_sheep) ----------------
  // 큰 머리 + 크고 뾰족한 귀(안쪽 금빛) + 큰 눈 + 몽실한 가슴털 + 가는 다리(뒷다리는 연보라)
  // + 몸보다 큰 두 갈래 구름 꼬리 (위 꼬리는 C자로 솟고, 아래 꼬리는 둥글게 뒤로). 하얀색 → 하늘빛 그라데이션
  A('cloud_sheep', 'flip', 1, (c, m, t, s) => {
    const k = m.h / 64; c.scale(k, k);
    const run = s.walk ? t * 12 : 0, lunge = sin(s.atk * PI);
    c.translate(lunge * 8, s.walk ? -Math.abs(sin(run)) * 2 : 0);
    const sway = sin(t * 2.5) * 0.06;
    // 아래 꼬리 (둥글게 뒤로, 끝이 위로 말림)
    c.save(); c.translate(-8, -22); c.rotate(sway);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-14, 16, -44, 12, -44, -8); c.quadraticCurveTo(-44, -20, -34, -24);
    c.quadraticCurveTo(-38, -16, -32, -12); c.quadraticCurveTo(-26, -18, -22, -10); c.quadraticCurveTo(-12, -4, 0, -6); c.closePath();
    c.fillStyle = lin(c, 0, -4, -40, 4, W, PERI); c.fill(); c.strokeStyle = LN; c.lineWidth = 1.2; c.stroke();
    line(c, 'rgba(255,255,255,.75)', 1.4, [[-26, -14], [-30, -6], [-36, -4]]);
    c.restore();
    // 위 꼬리 (크게 C자로 솟아 끝이 앞으로 말림)
    c.save(); c.translate(-8, -28); c.rotate(-sway);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-24, 4, -40, -16, -34, -34); c.bezierCurveTo(-30, -46, -16, -50, -4, -46);
    c.quadraticCurveTo(-14, -42, -14, -36); c.quadraticCurveTo(-8, -38, -6, -32); c.quadraticCurveTo(-18, -28, -16, -18); c.quadraticCurveTo(-10, -8, 2, -8); c.closePath();
    c.fillStyle = lin(c, -2, -6, -34, -30, W, PERI); c.fill(); c.strokeStyle = LN; c.lineWidth = 1.2; c.stroke();
    line(c, 'rgba(255,255,255,.75)', 1.4, [[-22, -36], [-26, -28]]); line(c, 'rgba(255,255,255,.6)', 1.2, [[-28, -18], [-22, -12]]);
    c.restore();
    for (let i = 0; i < 4; i++) { const p = (t * 0.5 + i / 4) % 1; glow(c, -38 - p * 12, -60 + p * 24 + i * 4, 3.5, '#d6deff', 1 - p); }
    // 다리 (뒷다리 연보라)
    for (const [x, ph, col] of [[-8, 0, LAV], [6, PI, LAV], [-2, PI, W], [12, 0, W]]) {
      c.save(); c.translate(x, -15); c.rotate(s.walk ? sin(run + ph) * 0.45 : 0); rrect(c, -2.4, 0, 4.8, 15, 2.4, col, LN); ell(c, 0.8, 14.6, 3, 1.6, col, LN, 1); c.restore();
    }
    // 몸 + 가슴털
    ell(c, 0, -21, 15, 9.5, W, LN, 1.4);
    poly(c, W, [[6, -30], [16, -32], [20, -24], [18, -19], [16, -14], [13, -18], [11, -13], [8, -18], [5, -15]], LN, 1.1);
    // 머리 (크게)
    c.save(); c.translate(14, -38); c.rotate(-lunge * 0.2);
    for (const [x, rot, sc] of [[-6, -0.22, 0.95], [3, 0.12, 1]]) {
      c.save(); c.translate(x, -7); c.rotate(rot); c.scale(sc, sc);
      poly(c, W, [[-6, 2], [-2, -22], [6, 2]], LN, 1.3); poly(c, lin(c, 0, 0, 0, -18, GOLD, GOLD2), [[-3, -1], [-1.5, -17], [3, -1]]);
      c.restore();
    }
    // 뺨 털(뒤쪽 들쭉날쭉)
    poly(c, W, [[-10, -2], [-15, 4], [-10, 5], [-12, 10], [-6, 8], [-2, 11], [0, 4]], LN, 1.1);
    poly(c, W, [[4, -2], [17, 2.6], [15.5, 4.6], [4, 7.5]], LN, 1.2);   // 주둥이: 얼굴 뒤에서 끝만 살짝 나오게
    ell(c, 0, 0, 11.5, 10, W, LN, 1.4);
    ell(c, 9, 4, 4, 2.6, W);   // 얼굴과 주둥이 이음새를 덮음
    ell(c, 16.6, 3.2, 1.5, 1.2, '#262848');
    ell(c, 5, -1, 2.3, 3.1, '#1a1a36'); ell(c, 5.8, -2.3, 0.8, 0.9, '#fff');
    c.restore();
  });

  // ---------------- 구름 양날이 (id sky_fairy) ----------------
  // 몽실몽실 구름 몸 (연보라 그림자) + 크고 둥근 흰 얼굴(눈 둘) + 양옆의 큰 금빛 말린 뿔 + 등에 솟은 흰 깃털 날개
  A('sky_fairy', 'melt', 0.6, (c, m, t, s) => {
    const k = m.w / 64; c.scale(k, k);
    const bob = sin(t * 2.6) * 3, flap = sin(t * 8) * 0.35;
    c.translate(sin(s.atk * PI) * 12, -30 + bob);
    // 날개 (뒤 → 몸 → 앞)
    const wing = (x, y, rot, sc, back) => { c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
      for (let i = 4; i >= 0; i--) { c.save(); c.rotate(-0.95 + i * 0.2); const L = 30 - i * 3.5;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-5, -L * 0.55, 0, -L); c.quadraticCurveTo(5, -L * 0.55, 0, 0); c.closePath();
        c.fillStyle = lin(c, 0, 0, 0, -L, back ? '#c9cdf6' : '#e6e9ff', '#ffffff'); c.fill(); c.strokeStyle = LN; c.lineWidth = 1; c.stroke(); c.restore(); }
      c.restore(); };
    wing(-4, -14, -0.25 - flap, 0.85, true);
    // 구름 몸
    for (const [x, y, r] of [[-22, 6, 8], [-14, 10, 10], [-2, 12, 11], [10, 10, 9], [-18, -4, 10], [-6, -8, 12], [6, -2, 11], [-10, 2, 12]])
      ell(c, x, y, r, r * 0.86, lin(c, x, y - r, x, y + r, '#ffffff', '#c3c8f6'), LN, 1.1);
    for (const [x, y] of [[-24, 14], [-8, 18], [6, 17]]) ell(c, x, y, 5, 3, '#c3c8f6');
    // 뒤쪽 뿔
    const horn = (x, y, sc, a) => { c.save(); c.translate(x, y); c.scale(sc, sc);
      c.beginPath(); for (let i = 0; i <= 26; i++) { const an = a - i / 26 * PI * 2.1, r = 10 - i * 0.3; const px = cos(an) * r, py = sin(an) * r; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.strokeStyle = GD; c.lineWidth = 8; c.lineCap = 'round'; c.stroke(); c.strokeStyle = lin(c, -10, -10, 10, 10, GOLD2, GOLD); c.lineWidth = 6; c.stroke();
      c.strokeStyle = 'rgba(160,110,30,.6)'; c.lineWidth = 0.8; c.stroke(); c.restore(); };
    horn(25, -9, 0.95, PI * 0.2); horn(3, -9, 1.1, PI * 0.9);   // 뿔은 얼굴 양옆 뒤로
    // 얼굴
    ell(c, 15, 0, 13, 12, '#ffffff', LN, 1.4);
    ell(c, 15, 6, 10, 4, 'rgba(220,224,255,.6)');
    ell(c, 15, -1, 1.9, 2.9, '#1a1a36'); ell(c, 23, -1, 1.9, 2.9, '#1a1a36'); ell(c, 15.6, -2.3, .7, .8, '#fff'); ell(c, 23.6, -2.3, .7, .8, '#fff');
    wing(-2, -16, 0.15 + flap, 1, false);
    if (s.atk > 0) glow(c, 26, -2, 16, '#fff0b0', s.atk * 0.6);
  });

  // ---------------- 천공의 부엉이 (id thunder_bird) ----------------
  // 정면 모습: 연보라 머리 + 흰 얼굴 + 큰 검은 눈 + 작은 금빛 부리 + 귀깃, 흰 가슴의 파란 다이아 무늬 3개,
  // 양옆으로 넓게 펼친 연보라 날개(층층이 깃털), 금빛 발. 날갯짓하며 떠 있다가 깃털 화살을 쏠 때 날개를 크게 편다
  A('thunder_bird', 'fall', 0.5, (c, m, t, s) => {
    const k = m.h / 60; c.scale(k, k);
    const bob = sin(t * 2.4) * 3, beat = sin(t * 6) * 0.25, spread = s.atk;
    c.translate(0, -32 + bob);
    const wing = (sg) => { c.save(); c.translate(sg * 9, -10); c.scale(sg, 1); c.rotate(-0.15 - beat - spread * 0.3);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(18, -20, 44, -24); c.lineTo(40, -16); c.lineTo(46, -12); c.lineTo(38, -6); c.lineTo(42, -1); c.lineTo(32, 2); c.lineTo(34, 7); c.lineTo(22, 8); c.quadraticCurveTo(10, 10, 2, 8); c.closePath();
      c.fillStyle = lin(c, 0, 0, 44, -20, '#e8eaff', '#9aa6f2'); c.fill(); c.strokeStyle = LN; c.lineWidth = 1.2; c.stroke();
      for (const [x0, y0, x1, y1] of [[10, -4, 30, -14], [10, 0, 28, -2], [8, 4, 22, 5]]) line(c, 'rgba(255,255,255,.75)', 1.2, [[x0, y0], [x1, y1]]);
      c.restore(); };
    wing(-1); wing(1);
    // 꼬리깃
    for (const x of [-4, 0, 4]) ell(c, x, 18, 2.6, 5, '#b8bff4', LN, 1);
    // 몸
    ell(c, 0, 2, 14, 17, lin(c, 0, -15, 0, 19, '#c4caf6', '#a6b0ee'), LN, 1.4);
    ell(c, 0, 4, 10, 13, '#ffffff');
    for (const [x, y] of [[-4, 0], [4, 0], [0, 7]]) { poly(c, '#7d8ff0', [[x, y - 3.4], [x + 2.4, y], [x, y + 3.4], [x - 2.4, y]]); }
    glow(c, 0, 4, 12, '#a8c0ff', 0.2 + spread * 0.5);
    // 머리
    ell(c, 0, -17, 13, 11, '#b8bff4', LN, 1.4);
    poly(c, '#b8bff4', [[-11, -22], [-15, -31], [-5, -26]], LN, 1.1); poly(c, '#b8bff4', [[11, -22], [15, -31], [5, -26]], LN, 1.1);
    c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(-11, -26, -11, -16); c.quadraticCurveTo(-10, -8, 0, -7); c.quadraticCurveTo(10, -8, 11, -16); c.quadraticCurveTo(11, -26, 0, -24); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    ell(c, -5, -16, 2.5, 3.4, '#1a1a36'); ell(c, 5, -16, 2.5, 3.4, '#1a1a36'); ell(c, -4.2, -17.4, .8, .9, '#fff'); ell(c, 5.8, -17.4, .8, .9, '#fff');
    poly(c, GOLD, [[-1.6, -13], [1.6, -13], [0, -9.5]], GD, 0.8);
    for (const x of [-4, 4]) line(c, GOLD, 2, [[x, 18], [x, 22]]), line(c, GOLD, 1.6, [[x - 2, 23], [x, 22], [x + 2, 23]]);
    if (spread > 0.5) glow(c, 0, -4, 24, '#c8d8ff', spread * 0.8);
  });

  const M = G.MONSTERS;
  Object.assign(M.cloud_sheep, { name: '하늘 여우', w: 70, h: 64, color: '#f7f7ff', color2: '#9097dc' });
  Object.assign(M.sky_fairy, { name: '구름 양날이', w: 64, h: 52, color: '#e9ebff', color2: '#9097dc' });
  Object.assign(M.thunder_bird, { name: '천공의 부엉이', w: 60, h: 60, color: '#b8bff4', color2: '#9097dc' });
})();
