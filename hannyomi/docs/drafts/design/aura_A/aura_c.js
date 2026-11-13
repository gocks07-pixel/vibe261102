// 4차 버프 모습 시안 C — 7종 × 새 안 4개 (다 · 라 · 마 · 바)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const star = (c, x, y, r, f) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } poly(c, f, p); };
  const flame = (c, x, y, h, w, t, k, c1 = '#ff6a1a', c2 = '#ffd860') => { const f = sin(t * 9 + k) * 0.12; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 1.1, y - h * 0.5, x + w * f * 4, y - h); c.quadraticCurveTo(x + w * 1.1, y - h * 0.5, x + w, y); c.quadraticCurveTo(x, y + w * 0.6, x - w, y); c.fillStyle = lin(c, x, y, x, y - h, c1, c2); c.fill();
    c.beginPath(); c.moveTo(x - w * 0.5, y); c.quadraticCurveTo(x - w * 0.5, y - h * 0.4, x + w * f * 2, y - h * 0.6); c.quadraticCurveTo(x + w * 0.5, y - h * 0.4, x + w * 0.5, y); c.fillStyle = '#fff4c0'; c.fill(); };
  const sword = (c, L, w, f, g) => { poly(c, f, [[0, -w], [L * 0.85, -w * 0.8], [L, 0], [L * 0.85, w * 0.8], [0, w]], g, 1); c.fillStyle = g; c.fillRect(-4, -w * 2, 3, w * 4); };
  const orbit = (n, t, sp, rx, ry, cy, f, p, c) => { for (let i = 0; i < n; i++) { const a = t * sp + i * PI * 2 / n, x = p.x + cos(a) * rx, y = p.y + cy + sin(a) * ry; c.save(); c.globalAlpha *= sin(a) < -0.2 ? 0.55 : 1; f(x, y, a, i); c.restore(); } };
  const C = G.AuraC = {};
  // ===== 전사 a 천붕검제 (불 · 대검) =====
  C.w4a = [
    ['다: 용암 갑주 금', (c, p, t) => { for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { const x = p.x + sg * (12 + i * 4), y = p.y - 70 + i * 14; line(c, '#ff7a2a', 2.6, [[x, y], [x + sg * 3, y + 6], [x - sg * 1, y + 12]]); glow(c, x, y + 6, 8, '#ff8a30', 0.5); }
      for (let i = 0; i < 5; i++) { const u = (t * 0.7 + i / 5) % 1; ell(c, p.x + sin(i * 2.7) * 16, p.y - 20 - u * 70, 2 * (1 - u) + 0.5, 2 * (1 - u) + 0.5, `rgb(255,${140 + 100 * u},60)`); } }],   // 몸에 용암 금 · 불씨
    ['라: 검기 날개', (c, p, t) => { for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) { c.save(); c.translate(p.x + sg * 6, p.y - 56); c.scale(sg, 1); c.rotate(-0.7 + i * 0.28 + sin(t * 3) * 0.05); c.translate(10, 0); sword(c, 40 - i * 4, 2.6, lin(c, 0, 0, 40, 0, '#fff0e0', '#ff9a4a'), '#9a4a18'); c.restore(); } }],   // 칼날이 날개처럼 펼쳐짐
    ['마: 불꽃 검 고리', (c, p, t) => orbit(6, t, 1.6, 40, 12, -40, (x, y, a) => { c.save(); c.translate(x, y); c.rotate(a + PI / 2); sword(c, 22, 2, lin(c, 0, 0, 22, 0, '#fff0e0', '#ff7a2a'), '#8a3a10'); flame(c, 22, 0, 6, 2, t, a); c.restore(); }, p, c)],   // 몸 둘레를 도는 작은 불꽃 검
    ['바: 불사조 문장', (c, p, t) => { c.save(); c.translate(p.x - p.dir * 4, p.y - 56); for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); for (let i = 0; i < 5; i++) { c.save(); c.rotate(-0.9 + i * 0.3); flame(c, 0, -2, 40 - i * 4, 5, t, i, '#e04a10', '#ffcf40'); c.restore(); } c.restore(); }
      flame(c, 0, 10, 26, 6, t, 9, '#e04a10', '#ffe070'); ell(c, 0, -6, 6, 6, '#ffe8a0', '#c0601a', 1.2); c.restore(); }],   // 등 뒤 불사조
  ];
  // ===== 전사 b 불멸 (빛 · 방패) =====
  C.w4b = [
    ['다: 빛의 갑옷 조각', (c, p, t) => orbit(5, t, 0.9, 34, 10, -36, (x, y, a) => { c.save(); c.translate(x, y); c.rotate(sin(a) * 0.3); poly(c, lin(c, 0, -8, 0, 8, '#fffbe0', '#e8b840'), [[0, -9], [7, -4], [6, 6], [0, 9], [-6, 6], [-7, -4]], '#9a7010', 1); c.restore(); }, p, c)],   // 금빛 비늘 조각이 둘레를 돎
    ['라: 성역 기둥', (c, p, t) => { c.save(); c.globalAlpha = 0.85; const g = lin(c, 0, p.y - 120, 0, p.y, 'rgba(255,240,180,0)', 'rgba(255,226,140,.7)'); c.fillStyle = g; c.fillRect(p.x - 26, p.y - 120, 52, 120); c.restore();
      for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; star(c, p.x - 20 + i * 8, p.y - u * 110, 2.6, `rgba(255,248,210,${1 - u})`); } ell(c, p.x, p.y - 2, 30, 6, null, '#ffd860', 2); }],   // 발밑에서 솟는 빛 기둥
    ['마: 방패 셋', (c, p, t) => { for (const [dx, dy, r, k] of [[-26, -60, 0.9, 0], [0, -82, 1.1, 1], [26, -60, 0.9, 2]]) { c.save(); c.translate(p.x + dx, p.y + dy + sin(t * 2 + k) * 2); c.scale(r, r);
      c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(12, -13, 12, -4); c.quadraticCurveTo(11, 8, 0, 14); c.quadraticCurveTo(-11, 8, -12, -4); c.quadraticCurveTo(-12, -13, 0, -14); c.fillStyle = lin(c, 0, -14, 0, 14, '#fff4c8', '#d8a030'); c.fill(); c.strokeStyle = '#8a6010'; c.lineWidth = 1.4; c.stroke(); line(c, '#ffffff', 2, [[0, -8], [0, 8]]); line(c, '#ffffff', 2, [[-6, -2], [6, -2]]); c.restore(); } }],   // 떠 있는 작은 성방패 셋
    ['바: 왕관 + 망토 빛', (c, p, t) => { poly(c, lin(c, 0, p.y - 112, 0, p.y - 96, '#fff4b0', '#e0a830'), [[p.x - 12, p.y - 96], [p.x - 13, p.y - 108], [p.x - 6, p.y - 102], [p.x, p.y - 114], [p.x + 6, p.y - 102], [p.x + 13, p.y - 108], [p.x + 12, p.y - 96]], '#8a6010', 1); glow(c, p.x, p.y - 104, 20, '#ffe080', 0.5);
      c.beginPath(); c.moveTo(p.x - 14, p.y - 60); c.quadraticCurveTo(p.x - 30 - p.dir * 8, p.y - 30, p.x - 26 - p.dir * 10 + sin(t * 2) * 3, p.y - 4); c.lineTo(p.x + 14 - p.dir * 10, p.y - 6); c.quadraticCurveTo(p.x + 6, p.y - 30, p.x + 14, p.y - 60); c.closePath(); c.fillStyle = lin(c, 0, p.y - 60, 0, p.y, 'rgba(255,236,160,.8)', 'rgba(255,200,90,.2)'); c.fill(); }],   // 금빛 왕관 + 빛 망토
  ];
  // ===== 궁수 b 저격왕 (대지 · 저격) =====
  C.a4b = [
    ['다: 매 한 마리', (c, p, t) => { const x = p.x - p.dir * 10, y = p.y - 92 + sin(t * 2) * 3, fl = sin(t * 6) * 0.4; c.save(); c.translate(x, y); for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.rotate(-fl * 0.6); c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(12, -10, 24, -6); c.lineTo(18, -2); c.lineTo(22, 1); c.quadraticCurveTo(10, 4, 2, 3); c.fillStyle = '#8a6a3a'; c.fill(); c.restore(); }
      ell(c, 0, 1, 5, 6, '#a88050'); ell(c, 2, -5, 3.6, 3.4, '#f0e8d0'); poly(c, '#e8b040', [[4, -5], [8, -4], [4, -3]]); ell(c, 2.6, -5.6, 0.8, 0.8, '#1a1008'); c.restore(); }],   // 머리 위를 맴도는 매
    ['라: 대지 문양 발판', (c, p, t) => { c.save(); c.translate(p.x, p.y - 2); c.scale(1, 0.3); c.strokeStyle = '#8ab04a'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 34, 0, PI * 2); c.stroke(); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * PI / 4 + t * 0.4); poly(c, '#6a8a3a', [[-4, -34], [0, -44], [4, -34]]); c.restore(); } c.restore();
      for (let i = 0; i < 4; i++) { const u = (t * 0.7 + i / 4) % 1; poly(c, `rgba(140,110,60,${1 - u})`, [[p.x - 20 + i * 12, p.y - u * 30], [p.x - 17 + i * 12, p.y - 4 - u * 30], [p.x - 14 + i * 12, p.y - u * 30]]); } }],   // 발밑 대지 문양 + 떠오르는 돌 조각
    ['마: 녹색 눈빛', (c, p, t) => { const ex = p.x + p.dir * 6, ey = p.y - 64; glow(c, ex, ey, 10, '#a0ff60', 0.9); c.save(); c.globalAlpha = 0.85; const g = lin(c, ex, ey, ex + p.dir * 70, ey, 'rgba(160,255,96,.9)', 'rgba(160,255,96,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(ex, ey - 1.2); c.lineTo(ex + p.dir * 70, ey - 6); c.lineTo(ex + p.dir * 70, ey + 6); c.lineTo(ex, ey + 1.2); c.fill(); c.restore(); }],   // 한쪽 눈에서 앞으로 뻗는 녹색 조준빛
    ['바: 바위 망토', (c, p, t) => { for (let i = 0; i < 6; i++) { const x = p.x - p.dir * (6 + i * 4), y = p.y - 60 + i * 9; poly(c, lin(c, 0, y - 8, 0, y + 8, '#a89070', '#6a5438'), [[x - 9, y], [x - 4, y - 7], [x + 5, y - 6], [x + 9, y + 2], [x + 2, y + 8], [x - 6, y + 6]], '#3a2a18', 1); line(c, '#8ad04a', 1.2, [[x - 4, y - 1], [x + 3, y + 2]]); } }],   // 등에 바위 조각 망토 + 이끼
  ];
  // ===== 마법사 a 화염군주 (불 · 군주) =====
  C.m4a = [
    ['다: 떠도는 불덩이 셋', (c, p, t) => orbit(3, t, 1.4, 34, 14, -56, (x, y, a, i) => { glow(c, x, y, 14, '#ff8a30', 0.7); ell(c, x, y, 6, 6, lin(c, 0, y - 6, 0, y + 6, '#fff0a0', '#ff5a10')); flame(c, x, y - 3, 10, 4, t, i); }, p, c)],   // 둘레를 도는 불덩이
    ['라: 불꽃 망토', (c, p, t) => { c.save(); c.translate(p.x - p.dir * 6, p.y - 62); c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-24, 30, -22, 56); for (let i = 0; i < 6; i++) c.quadraticCurveTo(-18 + i * 7, 62 + (i % 2) * 8 + sin(t * 8 + i) * 3, -15 + i * 7, 56); c.quadraticCurveTo(22, 30, 12, 0); c.closePath(); c.fillStyle = lin(c, 0, 0, 0, 60, '#c0300c', '#ffb030'); c.fill();
      for (let i = 0; i < 5; i++) flame(c, -18 + i * 9, 58, 12, 3.4, t, i); c.restore(); }],   // 불꽃으로 타오르는 망토
    ['마: 불의 뿔', (c, p, t) => { for (const sg of [-1, 1]) { c.save(); c.translate(p.x + sg * 10, p.y - 92); c.scale(sg, 1); c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(4, -10, 16, -22); c.quadraticCurveTo(8, -6, 6, 6); c.closePath(); c.fillStyle = lin(c, 0, 6, 0, -22, '#ff5a10', '#ffe070'); c.fill(); flame(c, 16, -20, 10, 3, t, sg); c.restore(); } glow(c, p.x, p.y - 96, 22, '#ff9040', 0.4); }],   // 머리 양옆 불꽃 뿔
    ['바: 용암 발판', (c, p, t) => { c.save(); c.translate(p.x, p.y - 2); c.scale(1, 0.28); ell(c, 0, 0, 40, 40, lin(c, 0, -40, 0, 40, '#ffd060', '#c0300c')); for (let i = 0; i < 6; i++) { const a = i * 1.05 + t; line(c, '#5a1a08', 4, [[cos(a) * 10, sin(a) * 10], [cos(a) * 36, sin(a) * 36]]); } c.restore();
      for (let i = 0; i < 6; i++) flame(c, p.x - 30 + i * 12, p.y - 2, 12 + (i % 2) * 6, 4, t, i); }],   // 발밑 용암 웅덩이 + 불길
  ];
  // ===== 마법사 b 현자 (얼음 · 지혜) =====
  C.m4b = [
    ['다: 얼음 결정 왕관', (c, p, t) => { for (let i = -2; i <= 2; i++) { const h = 14 + (2 - Math.abs(i)) * 6, x = p.x + i * 7, y = p.y - 92; poly(c, lin(c, 0, y - h, 0, y, '#ffffff', '#7ac8ff'), [[x - 3, y], [x, y - h], [x + 3, y]], '#2a6aa8', 0.8); } glow(c, p.x, p.y - 104, 18, '#bfe8ff', 0.6); }],   // 머리 위 얼음 결정 왕관
    ['라: 별자리 고리', (c, p, t) => { c.save(); c.translate(p.x, p.y - 48); c.rotate(t * 0.3); const pts = []; for (let i = 0; i < 7; i++) { const a = i * PI * 2 / 7; pts.push([cos(a) * 40, sin(a) * 40 * 0.4]); } c.strokeStyle = 'rgba(160,210,255,.8)'; c.lineWidth = 1; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke(); pts.forEach(([x, y], i) => star(c, x, y, 3.4 + (i % 2), '#eaf6ff')); c.restore(); }],   // 몸 둘레 별자리 고리
    ['마: 눈꽃 소용돌이', (c, p, t) => { for (let i = 0; i < 10; i++) { const a = t * 2 + i * 0.63, r = 20 + i * 3, x = p.x + cos(a) * r, y = p.y - 20 - i * 6 + sin(a) * 6; c.save(); c.translate(x, y); c.rotate(a); for (let j = 0; j < 3; j++) { c.rotate(PI / 3); line(c, '#e8f8ff', 1.2, [[-3, 0], [3, 0]]); } c.restore(); } }],   // 위로 감아 오르는 눈꽃
    ['바: 지혜의 눈 문양', (c, p, t) => { c.save(); c.translate(p.x - p.dir * 4, p.y - 60); c.rotate(-t * 0.4); c.strokeStyle = '#7ac8ff'; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, 30, 0, PI * 2); c.stroke(); for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * PI / 6); c.fillStyle = '#bfe4ff'; c.fillRect(-1, -34, 2, 6); c.restore(); } c.restore();
      c.beginPath(); c.moveTo(p.x - p.dir * 4 - 16, p.y - 60); c.quadraticCurveTo(p.x - p.dir * 4, p.y - 74, p.x - p.dir * 4 + 16, p.y - 60); c.quadraticCurveTo(p.x - p.dir * 4, p.y - 46, p.x - p.dir * 4 - 16, p.y - 60); c.fillStyle = 'rgba(220,240,255,.85)'; c.fill(); ell(c, p.x - p.dir * 4, p.y - 60, 5, 5, '#3a6ad0'); }],   // 등 뒤 눈 문양 마법진
  ];
  // ===== 도적 a 야천 (그림자 · 밤) =====
  C.t4a = [
    ['다: 그림자 꼬리', (c, p, t) => { for (let k = 0; k < 3; k++) { c.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16, x = p.x - p.dir * (u * 60), y = p.y - 40 - k * 10 + sin(t * 4 + u * 5 + k) * 6 * u; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = ['#2a1440', '#4a2a6a', '#7a4ab0'][k]; c.lineWidth = 6 - k * 1.5; c.lineCap = 'round'; c.stroke(); } }],   // 몸 뒤로 흐르는 그림자 꼬리
    ['라: 별 밤 망토', (c, p, t) => { c.save(); c.translate(p.x - p.dir * 6, p.y - 64); c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-26, 30, -24, 60); c.lineTo(20, 60); c.quadraticCurveTo(24, 30, 12, 0); c.closePath(); c.fillStyle = lin(c, 0, 0, 0, 60, '#2a1a5a', '#0a0420'); c.fill(); c.save(); c.clip(); for (let i = 0; i < 12; i++) star(c, -20 + (i * 37) % 40, 6 + (i * 53) % 54, 1.6 + (i % 3) * 0.6, `rgba(255,255,255,${0.5 + 0.4 * sin(t * 3 + i)})`); c.restore(); c.restore(); }],   // 별이 박힌 밤하늘 망토
    ['마: 보랏빛 연기 발', (c, p, t) => { for (let i = 0; i < 9; i++) { const u = (t * 0.5 + i / 9) % 1; c.save(); c.globalAlpha = 0.7 * (1 - u); ell(c, p.x + sin(i * 2.1) * 14, p.y - 4 - u * 30, 10 * (1 - u * 0.5), 6, i % 2 ? '#4a2a6a' : '#6a3a9a'); c.restore(); } }],   // 발밑에서 피어오르는 보랏빛 연기
    ['바: 달빛 단검 둘', (c, p, t) => { for (const sg of [-1, 1]) { c.save(); c.translate(p.x + sg * 26, p.y - 56 + sin(t * 2 + sg) * 3); c.rotate(PI / 2 + sg * 0.3); poly(c, lin(c, 0, -14, 0, 14, '#f4f0ff', '#9a7ad0'), [[0, -16], [4, -3], [0, 10], [-4, -3]], '#3a2a6a', 1); c.fillStyle = '#3a2a5a'; c.fillRect(-1.6, 10, 3.2, 6); glow(c, 0, -4, 10, '#d0c0ff', 0.5); c.restore(); } }],   // 양옆에 떠 있는 달빛 단검
  ];
  // ===== 도적 b 검무 (독 · 춤) =====
  C.t4b = [
    ['다: 독 꽃 리본', (c, p, t) => { for (let k = 0; k < 2; k++) { c.strokeStyle = k ? '#c8f07a' : '#6ad07a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, a = t * 3 + k * PI + u * PI * 1.6, x = p.x + cos(a) * 32, y = p.y - 20 - u * 50 + sin(a) * 8; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2; ell(c, p.x + cos(a) * 32, p.y - 40 + sin(a) * 8, 3, 3, '#e070c0'); } }],   // 몸을 감도는 독빛 리본 + 꽃
    ['라: 칼날 꽃', (c, p, t) => { c.save(); c.translate(p.x - p.dir * 4, p.y - 58); c.rotate(t * 1.2); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * PI / 4); poly(c, lin(c, 0, 0, 0, -26, '#2a6a3a', '#d8ffe0'), [[0, -6], [4, -12], [0, -28], [-4, -12]], '#1a4a2a', 0.8); c.restore(); } ell(c, 0, 0, 6, 6, '#e070c0', '#7a2a5a', 1); c.restore(); }],   // 등 뒤 칼날 꽃잎이 돔
    ['마: 초록 잔상', (c, p, t, draw) => { for (const [dx, a] of [[-30, 0.3], [-15, 0.5]]) { c.save(); c.globalAlpha = a; draw(c, p.x + dx * p.dir, p.y, 'hue-rotate(80deg)'); c.restore(); } }],   // 춤추듯 남는 초록 잔상
    ['바: 독 방울', (c, p, t) => { for (let i = 0; i < 7; i++) { const u = (t * 0.4 + i / 7) % 1, x = p.x + sin(i * 2.3) * 30, y = p.y - 70 + u * 60; c.save(); c.globalAlpha = 1 - u * 0.6; c.beginPath(); c.moveTo(x, y - 5); c.quadraticCurveTo(x + 4, y + 1, x, y + 4); c.quadraticCurveTo(x - 4, y + 1, x, y - 5); c.fillStyle = '#7ae07a'; c.fill(); ell(c, x - 1, y, 0.8, 1.2, '#eaffea'); c.restore(); } }],   // 둘레에 떨어지는 독 방울
  ];
})();
