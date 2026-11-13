// 4차 버프 모습 시안 B — 7종 × 가 · 나 (색을 직접 칠함)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const star = (c, x, y, r, f) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } poly(c, f, p); };
  const flame = (c, x, y, h, w, t, k) => { const f = sin(t * 9 + k) * 0.12; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 1.1, y - h * 0.5, x + w * f * 4, y - h); c.quadraticCurveTo(x + w * 1.1, y - h * 0.5, x + w, y); c.quadraticCurveTo(x, y + w * 0.6, x - w, y); c.fillStyle = lin(c, x, y, x, y - h, '#ff6a1a', '#ffd860'); c.fill();
    c.beginPath(); c.moveTo(x - w * 0.5, y); c.quadraticCurveTo(x - w * 0.5, y - h * 0.4, x + w * f * 2, y - h * 0.6); c.quadraticCurveTo(x + w * 0.5, y - h * 0.4, x + w * 0.5, y); c.fillStyle = '#fff4c0'; c.fill(); };
  const sword = (c, L, w, f, g) => { poly(c, f, [[0, -w], [L * 0.85, -w * 0.8], [L, 0], [L * 0.85, w * 0.8], [0, w]], g, 1); c.fillStyle = g; c.fillRect(-4, -w * 2, 3, w * 4); };
  const B = G.AuraB = {};
  // 전사 a 천붕검제
  B.w4a_ga = (c, p, t) => { for (let i = -2; i <= 2; i++) { c.save(); c.translate(p.x - p.dir * 6, p.y - 46); c.rotate(-PI / 2 + i * 0.32 + sin(t * 2 + i) * 0.03); c.translate(16, 0); sword(c, 50, 3.6, lin(c, 0, 0, 50, 0, '#ffe8c0', '#ff8a3a'), '#8a3a10'); flame(c, 50, 0, 10, 3, t, i); c.restore(); } };   // 불꽃 대검 다섯 (칠한 검)
  B.w4a_na = (c, p, t) => { c.save(); c.translate(p.x - p.dir * 10, p.y - 30); c.rotate(-PI / 2 - p.dir * 0.12); sword(c, 86, 7, lin(c, 0, 0, 86, 0, '#fff0d8', '#ff7a2a'), '#6a2a08'); for (let k = 0; k < 5; k++) flame(c, 20 + k * 15, -8 - (k % 2) * 2, 12, 3.4, t, k); c.restore();
    for (let i = 0; i < 4; i++) { const u = (t * 0.8 + i / 4) % 1; ell(c, p.x - p.dir * 10 + sin(i * 3) * 10, p.y - 40 - u * 60, 1.8 * (1 - u) + 0.4, 1.8 * (1 - u) + 0.4, `rgba(255,${150 + 80 * u},60,${1 - u})`); } };   // 등 뒤 불타는 거대 검
  // 전사 b 불멸
  B.w4b_ga = (c, p, t) => { c.save(); c.translate(p.x, p.y - 46); for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * PI / 6 + t * 0.3); poly(c, 'rgba(255,226,140,.55)', [[-3, -30], [0, -54 - (i % 2) * 8], [3, -30]]); c.restore(); }
    c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(28, -34, 28, -12); c.quadraticCurveTo(26, 16, 0, 30); c.quadraticCurveTo(-26, 16, -28, -12); c.quadraticCurveTo(-28, -34, 0, -36); c.fillStyle = lin(c, 0, -36, 0, 30, '#fff4c8', '#e0a830'); c.fill(); c.strokeStyle = '#8a6010'; c.lineWidth = 2; c.stroke();
    star(c, 0, -4, 11, '#ffffff'); c.restore(); };   // 등 뒤 금빛 방패 문장 + 빛살
  B.w4b_na = (c, p, t) => { const f = sin(t * 3) * 0.08; for (const sg of [-1, 1]) { c.save(); c.translate(p.x + sg * 4, p.y - 52); c.scale(sg, 1); c.rotate(-f);
      for (let i = 0; i < 7; i++) { c.save(); c.rotate(-1.0 + i * 0.2); c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(30, -10, 56 - i * 4, -1); c.quadraticCurveTo(30, 8, 0, 4); c.closePath(); c.fillStyle = lin(c, 0, 0, 56, 0, '#ffffff', i % 2 ? '#ffe090' : '#f4c860'); c.fill(); c.strokeStyle = 'rgba(160,110,20,.5)'; c.lineWidth = 0.8; c.stroke(); c.restore(); } c.restore(); }
    c.strokeStyle = '#ffe080'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(p.x, p.y - 92, 14, 4, 0, 0, PI * 2); c.stroke(); };   // 금빛 날개 + 천사 고리
  // 궁수 b 저격왕 (지금 없음)
  B.a4b_ga = (c, p, t) => { const x = p.x + p.dir * 70, y = p.y - 40; c.save(); c.translate(x, y); c.rotate(t * 0.6); c.strokeStyle = '#8ad04a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 18, 0, PI * 2); c.stroke(); c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 10, 0, PI * 2); c.stroke();
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * PI / 2); c.beginPath(); c.moveTo(0, -24); c.lineTo(0, -12); c.stroke(); c.restore(); } ell(c, 0, 0, 2, 2, '#ff4040'); c.restore(); };   // 앞을 겨누는 조준 고리
  B.a4b_na = (c, p, t) => { for (let i = 0; i < 3; i++) { c.save(); c.translate(p.x - p.dir * (14 + i * 7), p.y - 50 - i * 6 + sin(t * 2 + i) * 2); c.rotate(-PI / 2 + p.dir * 0.3);
      c.fillStyle = '#6a4a2a'; c.fillRect(-20, -1.2, 36, 2.4); poly(c, lin(c, 16, 0, 26, 0, '#e8f0c0', '#8ac04a'), [[16, -4], [28, 0], [16, 4]], '#3a5a1a', 0.8); poly(c, '#c8e8a0', [[-20, -4], [-14, 0], [-20, 4], [-24, 0]]); glow(c, 24, 0, 8, '#c8ff8a', 0.6); c.restore(); } };   // 등 뒤에 떠 있는 대지 화살 셋
  // 마법사 a 화염군주
  B.m4a_ga = (c, p, t) => { const y = p.y - 92; for (let i = -2; i <= 2; i++) flame(c, p.x + i * 8, y - (2 - Math.abs(i)) * 4, 16 + (2 - Math.abs(i)) * 5, 4, t, i); glow(c, p.x, y - 8, 24, '#ffa040', 0.5); };   // 칠한 불꽃 왕관
  B.m4a_na = (c, p, t) => { c.save(); c.translate(p.x - p.dir * 4, p.y - 50); for (let i = 0; i < 14; i++) { const a = i * PI / 7 + t * 0.8; c.save(); c.rotate(a); flame(c, 0, -30, 12, 3.4, t, i); c.restore(); } c.strokeStyle = '#ff9a30'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 30, 0, PI * 2); c.stroke(); c.restore(); };   // 등 뒤 불꽃 고리
  // 마법사 b 현자
  B.m4b_ga = (c, p, t) => { c.save(); c.translate(p.x, p.y - 2); c.scale(1, 0.3); c.rotate(t * 0.6); c.strokeStyle = '#7ac8ff'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 46, 0, PI * 2); c.stroke(); c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 34, 0, PI * 2); c.stroke();
    for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * PI / 3); poly(c, null, [[0, -34], [29, 17], [-29, 17]], '#bfe4ff', 1.4); star(c, 0, -40, 4, '#e8f6ff'); c.restore(); } c.restore();
    for (let i = 0; i < 5; i++) { const u = (t * 0.5 + i / 5) % 1; ell(c, p.x + cos(i * 1.3) * 30, p.y - u * 70, 1.6, 1.6, `rgba(200,236,255,${1 - u})`); } };   // 발밑 마법진 + 오르는 빛
  B.m4b_na = (c, p, t) => { for (let i = 0; i < 3; i++) { const a = t * 1.2 + i * 2.1, x = p.x + cos(a) * 38, y = p.y - 50 + sin(a) * 12 - i * 4; c.save(); c.translate(x, y); c.rotate(sin(t + i) * 0.2);
      poly(c, '#3a5aa8', [[-10, -7], [10, -7], [10, 7], [-10, 7]], '#1a2a58', 1); poly(c, '#f4f0e0', [[-9, -6], [-1, -5], [-1, 6], [-9, 6]]); poly(c, '#f4f0e0', [[1, -5], [9, -6], [9, 6], [1, 6]]); for (let k = 0; k < 3; k++) c.fillStyle = '#7a8ac8', c.fillRect(-7, -3 + k * 3, 5, 0.8);
      star(c, 5, -1, 3, '#7ac8ff'); c.restore(); } };   // 둘레를 도는 마법책 셋
  // 도적 a 야천
  B.t4a_ga = (c, p, t, draw) => { for (const [dx, a] of [[-30, 0.35], [-16, 0.55]]) { c.save(); c.globalAlpha = a; draw(c, p.x - p.dir * dx * -1 - p.dir * 0, p.y, '#3a1a5a'); c.restore(); } };   // 칠한 보라 그림자 분신 둘 (아래에서 따로 그림)
  B.t4a_na = (c, p, t) => { glow(c, p.x - p.dir * 6, p.y - 70, 34, '#e8e0ff', 0.5); ell(c, p.x - p.dir * 6, p.y - 70, 20, 20, '#f4f0ff'); ell(c, p.x - p.dir * 6 + 7, p.y - 74, 17, 17, 'rgba(30,20,50,1)');
    for (const sg of [-1, 1]) { c.save(); c.translate(p.x, p.y - 50); c.scale(sg, 1); c.rotate(sin(t * 3) * 0.06); c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(30, -34, 58, -26); c.lineTo(48, -16); c.lineTo(56, -8); c.lineTo(42, -4); c.lineTo(48, 4); c.quadraticCurveTo(24, 6, 4, 6); c.closePath(); c.fillStyle = lin(c, 0, -30, 0, 6, '#4a2a6a', '#1a0a2a'); c.fill(); c.strokeStyle = '#9a6ad0'; c.lineWidth = 1; c.stroke(); c.restore(); } };   // 등 뒤 초승달 + 박쥐 날개 그림자
  // 도적 b 검무
  B.t4b_ga = (c, p, t) => { for (let i = 0; i < 5; i++) { const a = t * 2.4 + i * PI * 0.4, x = p.x + cos(a) * 36, y = p.y - 40 + sin(a) * 12; if (sin(a) < -0.3) c.globalAlpha = 0.6; c.save(); c.translate(x, y); c.rotate(a + PI / 2); poly(c, lin(c, 0, -10, 0, 10, '#e8fff0', '#6ad07a'), [[0, -11], [2.6, -2], [0, 6], [-2.6, -2]], '#2a6a3a', 0.8); c.fillStyle = '#4a3a2a'; c.fillRect(-1.2, 6, 2.4, 5); c.restore(); c.globalAlpha = 1; } };   // 몸 둘레 도는 독 단검 다섯
  B.t4b_na = (c, p, t) => { for (let i = 0; i < 6; i++) { const a = t * 1.6 + i * 1.05, x = p.x + cos(a) * (30 + (i % 2) * 10), y = p.y - 50 + sin(a * 1.3) * 22; const fl = sin(t * 14 + i) * 0.6; c.save(); c.translate(x, y);
      for (const sg of [-1, 1]) { c.save(); c.scale(sg * (0.4 + 0.6 * Math.abs(cos(fl))), 1); ell(c, 4, -2, 5, 4, '#8ae08a', '#2a6a3a', 0.6); ell(c, 3, 3, 3.4, 2.6, '#c8f07a', '#2a6a3a', 0.5); c.restore(); } c.fillStyle = '#1a2a1a'; c.fillRect(-0.8, -4, 1.6, 8); c.restore(); } };   // 독빛 나비 떼
})();
