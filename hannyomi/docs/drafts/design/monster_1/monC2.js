// 몬스터 2단계 (3~5장) 나: 새 디자인 21종
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris, look = 0.25) => { ell(c, x, y, r, r * 1.15, '#fff', '#2a2a32', 0.6); ell(c, x + r * look, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a36'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const slit = (c, x, y, r, col) => { ell(c, x, y, r, r * 0.9, col, '#1a1008', 0.6); ell(c, x + r * 0.2, y, r * 0.25, r * 0.7, '#1a1008'); ell(c, x - r * 0.2, y - r * 0.3, r * 0.2, r * 0.2, '#fff'); };
  const legs4 = (c, s, t, xs, y, len, w, col, sp = 12) => xs.forEach((x, i) => { const st = s.walk ? sin(t * sp + (i % 2 ? PI : 0) + i * 0.4) * 0.45 : 0; c.save(); c.translate(x, y); c.rotate(st); rrect(c, -w / 2, 0, w, len, w / 2, col); c.restore(); });
  const N = G.MonNewC2 = {};

  // 광산 쥐: 통통한 몸 · 등불 달린 안전모 · 고글 · 등에 멘 작은 곡괭이 · 앞을 비추는 빛
  N.mine_rat = (c, m, t, s) => {
    const k = m.w / 52 * 1.2; c.scale(k, k); const ph = s.walk ? t * 16 : 0; c.translate(sin(s.atk * PI) * 6, s.walk ? -abs(sin(ph)) * 2 : 0);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(20, -18, 60, -18); g.addColorStop(0, 'rgba(255,240,170,.45)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(18, -22); c.lineTo(62, -34); c.lineTo(62, -2); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = '#c8908a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-16, -8); c.bezierCurveTo(-28, -6, -30, -18, -24, -22); c.stroke();
    for (const [x, a] of [[-8, 0], [8, PI]]) { const st = s.walk ? sin(ph + a) * 3 : 0; ell(c, x + st, -1.5, 4, 2, '#5a4a3a'); }
    ell(c, -2, -11, 15, 10, rg(c, -2, -13, 15, '#9a8a7a', '#5a4a3a'), '#2a2018', 1.2); ell(c, 2, -7, 9, 4, '#c8b8a0');
    c.save(); c.translate(-8, -20); c.rotate(-0.6); line(c, '#6a4a2a', 1.8, [[0, 0], [0, -10]]); poly(c, '#9aa0aa', [[-5, -10], [5, -10], [6, -8], [-6, -8]], '#3a3a40', 0.6); c.restore();
    c.save(); c.translate(12, -14); ell(c, 0, 0, 8, 7, rg(c, 0, -1, 8, '#a89888', '#6a5a4a'), '#2a2018', 1.1); ell(c, 7, 2, 2, 1.6, '#ff8a9a');
    ell(c, -3, -7, 4, 4, '#c8a0a0', '#2a2018', 0.8); ell(c, -3, -7, 2.2, 2.2, '#ffb8c0');
    c.beginPath(); c.arc(0, -4, 8, PI, 0); c.closePath(); c.fillStyle = vg(c, -12, -4, '#ffe060', '#c09010'); c.fill(); c.strokeStyle = '#6a4a08'; c.lineWidth = 1; c.stroke(); rrect(c, -9, -5, 18, 2.4, 1, '#c09010');
    glow(c, 7, -9, 8, '#fff4b0', 0.9); ell(c, 7, -9, 2.4, 2.4, '#fffae0', '#a07a10', 0.6);
    for (const x of [-1, 4]) ell(c, x, -1, 2.4, 2.2, 'rgba(160,220,255,.7)', '#3a3a40', 0.8); ell(c, 5, 1, 0.8, 1, '#1a1010');
    line(c, '#fff', 1.2, [[6, 4], [6, 6.5]]); c.restore();
    for (const [x, y] of [[-10, -14], [0, -6], [-14, -6]]) ell(c, x, y, 1.6, 1, 'rgba(40,30,20,.35)');
  };
  // 폐광 바위웜: 바위 마디 몸 · 빛나는 광맥 · 드릴처럼 갈라지는 턱 · 땅에서 솟아오름
  N.rock_golem = (c, m, t, s) => {
    const k = m.w / 80; c.scale(k, k); const sw = sin(t * 3) * 3, lunge = s.atk * 10;
    ell(c, 10, 0, 34, 5, 'rgba(60,40,30,.45)'); for (let i = 0; i < 5; i++) ell(c, -20 + i * 14, -1, 4 + (i % 2) * 2, 2.4, '#6a5444', '#3a2a20', 0.6);
    const seg = []; for (let i = 0; i < 6; i++) { const u = i / 5; seg.push([-26 + u * 46 + lunge * u, -6 - u * 22 - sin(u * PI) * 6 + sin(t * 3 + i) * 1.5 * (1 - u)]); }
    seg.forEach(([x, y], i) => { const r = 8 + i * 1.3; ell(c, x, y, r, r * 0.85, rg(c, x, y, r, '#a89080', '#5a4636'), '#2a1e16', 1.2);
      line(c, `rgba(255,190,90,${0.55 + 0.25 * sin(t * 3 + i)})`, 1.2, [[x - r * 0.5, y + 1], [x, y - r * 0.4], [x + r * 0.4, y + 2]]);
      if (i % 2) poly(c, '#7ad8ff', [[x - 2, y - r * 0.7], [x, y - r - 5], [x + 2.4, y - r * 0.7]], '#2a6a9a', 0.6); });
    const [hx, hy] = seg[5], op = 0.25 + s.atk * 0.5 + abs(sin(t * 2)) * 0.1;
    c.save(); c.translate(hx + 8, hy); for (const sg of [-1, 1]) { c.save(); c.rotate(sg * op); poly(c, vg(c, -8, 8, '#c8b8a8', '#6a5a4a'), [[0, sg * 1], [12, sg * 4], [16, sg * 1]], '#2a1e16', 1); for (let j = 0; j < 3; j++) poly(c, '#f0e8d8', [[4 + j * 4, sg * 2.6], [6 + j * 4, sg * 5.4], [8 + j * 4, sg * 2.6]]); c.restore(); }
    glow(c, 4, 0, 8, '#ff9a3a', 0.6 + op * 0.5); c.restore();
    slit(c, hx - 2, hy - 5, 2.6, '#ffb040');
  };
  // 용광로 도롱뇽: 매끈한 몸에 용암 균열 · 등의 숯 비늘 사이로 빛 · 불씨 갈기 · 입에서 불꽃
  N.fire_imp = (c, m, t, s) => {
    const k = m.w / 90; c.scale(k * 1.1, k * 1.5); const ph = s.walk ? t * 10 : 0, sw = sin(ph) * 0.08;
    for (const [x, a] of [[-18, 0], [-6, PI], [14, PI], [24, 0]]) { const st = s.walk ? sin(ph + a) * 4 : 0; line(c, '#4a2a2a', 4, [[x, -12], [x + st + 2, -4], [x + st + 5, 0]]); }
    c.save(); c.translate(-24, -14); c.rotate(sw); c.beginPath(); c.moveTo(0, -5); c.bezierCurveTo(-14, -6, -28, 0, -40, 4); c.quadraticCurveTo(-28, 6, -14, 5); c.lineTo(0, 5); c.closePath(); c.fillStyle = vg(c, -6, 6, '#7a4a4a', '#3a1a1a'); c.fill(); c.strokeStyle = '#1a0808'; c.lineWidth = 1; c.stroke();
    line(c, '#ff8a2a', 1.4, [[-4, 0], [-18, 1], [-32, 3]]); c.restore();
    c.beginPath(); c.ellipse(4, -15, 28, 10, -sw, 0, PI * 2); c.fillStyle = vg(c, -25, -5, '#8a5a5a', '#3a1a1a'); c.fill(); c.strokeStyle = '#1a0808'; c.lineWidth = 1.3; c.stroke();
    for (let i = 0; i < 6; i++) { const x = -16 + i * 7.5, y = -22 - sin((i / 5) * PI) * 3; poly(c, '#2a1818', [[x - 4, y + 4], [x, y - 3], [x + 4, y + 4]], '#120606', 0.8); line(c, `rgba(255,${140 + 40 * sin(t * 4 + i)},40,.9)`, 1, [[x - 3, y + 4.4], [x + 3, y + 4.4]]); }
    for (const p of [[[-12, -12], [-6, -16], [0, -11], [6, -15]], [[8, -10], [14, -14], [20, -10]]]) { c.save(); c.globalCompositeOperation = 'lighter'; line(c, 'rgba(255,120,30,.5)', 3, p); c.restore(); line(c, '#ffc060', 1, p); }
    c.save(); c.translate(32, -17); c.rotate(-0.1); ell(c, 0, 0, 12, 8, vg(c, -8, 8, '#9a6a6a', '#4a2222'), '#1a0808', 1.2); slit(c, 4, -3, 2.6, '#ffd040');
    for (let i = 0; i < 4; i++) { c.save(); c.translate(-8, -4 + i * 2.4); c.rotate(-2.6 + i * 0.2 + sin(t * 6 + i) * 0.1); poly(c, i % 2 ? '#ffb040' : '#ff6a2a', [[0, -1.4], [9, 0], [0, 1.4]]); c.restore(); }
    line(c, '#1a0808', 1, [[6, 4], [12, 3]]); if (s.atk > 0) { glow(c, 18, 2, 14, '#ff8a2a', 0.9); for (let i = 0; i < 4; i++) ell(c, 14 + i * 5 + s.atk * 6, 2 + sin(i * 2) * 2, 3.4 - i * 0.6, 2.6 - i * 0.4, i % 2 ? '#ffd060' : '#ff7a2a'); } c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; ell(c, -10 + i * 10, -26 - u * 16, 1.4, 1.4, `rgba(255,170,60,${1 - u})`); }
  };
  // 용암 웅덩이: 물렁한 용암 몸 + 위에 식어 굳은 바위 껍질 조각 · 부글부글 거품 · 튀는 불씨
  N.magma_slime = (c, m, t, s) => {
    const k = m.w / 58 * 1.25; c.scale(k, k); const sq = 1 + sin(t * 3) * 0.04 + (s.walk ? sin(t * 8) * 0.04 : 0);
    glow(c, 0, -10, 32, '#ff6a20', 0.45); c.save(); c.scale(1 / sq, sq);
    c.beginPath(); c.moveTo(-26, 0); c.bezierCurveTo(-30, -18, -16, -32, 0, -32); c.bezierCurveTo(16, -32, 30, -18, 26, 0); c.closePath(); c.fillStyle = rg(c, 0, -14, 30, '#ffd060', '#d8400c'); c.fill(); c.strokeStyle = '#7a1a04'; c.lineWidth = 1.4; c.stroke();
    for (const [x, y, w, h, a] of [[-10, -26, 11, 5, -0.3], [6, -28, 10, 4.4, 0.2], [14, -18, 7, 4, 0.6], [-17, -14, 7, 4, -0.7]]) { c.save(); c.translate(x, y); c.rotate(a); poly(c, vg(c, -h, h, '#5a3a32', '#2a1612'), [[-w, h * 0.4], [-w * 0.6, -h], [w * 0.5, -h * 0.8], [w, h * 0.2], [w * 0.3, h]], '#140806', 0.8); c.restore(); }
    for (let i = 0; i < 4; i++) { const u = (t * 0.8 + i / 4) % 1; ell(c, -14 + i * 9, -6 - u * 6, 2.4 * (1 - u) + 0.6, 2.4 * (1 - u) + 0.6, `rgba(255,240,180,${0.7 * (1 - u)})`, 'rgba(160,40,10,.5)', 0.5); }
    ell(c, -6, -14, 3.4, 3, '#2a0a04'); ell(c, 6, -14, 3.4, 3, '#2a0a04'); ell(c, -5, -15, 1.2, 1.2, '#ffe0a0'); ell(c, 7, -15, 1.2, 1.2, '#ffe0a0');
    c.fillStyle = '#2a0a04'; c.beginPath(); c.arc(0, -9, 3.4, 0, PI); c.fill(); c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 1.1 + i / 3) % 1, x = -12 + i * 12, y = -30 - sin(u * PI) * 16; ell(c, x + u * 6, y, 1.6, 1.6, `rgba(255,200,80,${1 - u})`); }
  };
  // 태엽 병사: 둥근 양철 몸 · 깃털 투구 · 등의 큰 태엽 (돌아감) · 창 · 볼에 녹 반점
  N.clockwork = (c, m, t, s) => {
    const k = m.h / 66; c.scale(k, k); const ph = s.walk ? t * 10 : 0, at = s.atk;
    for (const [x, a] of [[-5, 0], [5, PI]]) { const st = s.walk ? sin(ph + a) * 3 : 0; rrect(c, x - 3, -18, 6, 16, 2, vg(c, -18, -2, '#a0a8b8', '#5a6070'), '#2a2e38', 0.8); rrect(c, x - 4 + st, -4, 9, 4, 2, '#3a3e48'); }
    c.save(); c.translate(-14, -34); c.rotate(t * (s.walk ? 4 : 1.5)); for (const a of [0, PI]) { c.save(); c.rotate(a); ell(c, 0, -6, 3.4, 4.4, null, '#c8a040', 2.2); c.restore(); } line(c, '#c8a040', 2.2, [[-2, 0], [2, 0]]); c.restore();
    ell(c, 0, -32, 13, 15, rg(c, 0, -34, 15, '#e0e6f0', '#7a8090'), '#2a2e38', 1.3); rrect(c, -13, -24, 26, 4, 2, '#c03838', '#5a1010', 0.6);
    for (const y of [-38, -30]) ell(c, 7, y, 1.4, 1.4, '#c8a040'); ell(c, 0, -32, 4, 4, '#c8a040', '#6a4a10', 0.8); ell(c, 0, -32, 1.6, 1.6, '#6a4a10');
    c.save(); c.translate(0, -52); ell(c, 0, 0, 10, 9, rg(c, 0, -1, 10, '#eef2f8', '#8a90a0'), '#2a2e38', 1.2);
    rrect(c, -10, -6, 20, 4, 2, '#c03838'); c.beginPath(); c.moveTo(-3, -9); c.quadraticCurveTo(-2, -20, 8, -18); c.quadraticCurveTo(2, -14, 3, -9); c.closePath(); c.fillStyle = '#e04848'; c.fill(); c.strokeStyle = '#6a1010'; c.lineWidth = 0.8; c.stroke();
    rrect(c, -1, -1, 11, 4, 2, '#2a2e38'); glow(c, 7, 1, 6, '#5ae0ff', 0.7); ell(c, 4, 1, 1.4, 1.2, '#bff4ff'); ell(c, 8, 1, 1.4, 1.2, '#bff4ff'); ell(c, -5, 3, 2, 1.2, 'rgba(200,120,60,.5)'); c.restore();
    c.save(); c.translate(10, -34); c.rotate(-0.15 - at * 0.2); line(c, '#6a4a2a', 2.4, [[-6 + at * 10, 0], [26 + at * 10, 0]]); poly(c, '#e0e6f0', [[26 + at * 10, -3], [34 + at * 10, 0], [26 + at * 10, 3]], '#5a6070', 0.6); ell(c, 0 + at * 6, 0, 3.4, 3.4, vg(c, -3, 3, '#a0a8b8', '#5a6070'), '#2a2e38', 0.8); c.restore();
  };
  // 감시 드론: 둥근 렌즈 눈 · 양쪽 프로펠러 · 안테나 · 아래로 비추는 탐조등 (공격 때 붉게)
  N.drone = (c, m, t, s) => {
    const k = m.w / 44; c.scale(k, k); const bob = sin(t * 3) * 3, alert = s.atk > 0; c.translate(0, -14 + bob);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 6, 0, 40); g.addColorStop(0, alert ? 'rgba(255,80,80,.4)' : 'rgba(170,230,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-4, 6); c.lineTo(4, 6); c.lineTo(14, 40); c.lineTo(-14, 40); c.closePath(); c.fill(); c.restore();
    for (const sg of [-1, 1]) { line(c, '#4a5464', 2, [[sg * 10, -4], [sg * 18, -10]]); c.save(); c.translate(sg * 18, -11); c.scale(1, 0.25); c.rotate(t * 30 * sg); for (const a of [0, PI]) { c.save(); c.rotate(a); ell(c, 7, 0, 7, 2, 'rgba(200,220,240,.75)', '#4a5464', 0.5); c.restore(); } c.restore(); ell(c, sg * 18, -11, 2, 1.4, '#3a4250'); }
    ell(c, 0, -2, 13, 10, rg(c, 0, -4, 13, '#e8eef6', '#7a8696'), '#2a323e', 1.3); rrect(c, -13, -2, 26, 3, 1.4, '#3a4250');
    line(c, '#2a323e', 1, [[0, -12], [2, -18]]); ell(c, 2, -19, 1.6, 1.6, alert ? '#ff4040' : '#5aff8a');
    ell(c, 2, 2, 6.4, 6, '#1a2028', '#5a6474', 1); glow(c, 2, 2, 9, alert ? '#ff4040' : '#5ae0ff', 0.8); ell(c, 2, 2, 3.6, 3.4, alert ? '#ff5a5a' : '#7ae8ff'); ell(c, 0.6, 0.6, 1.2, 1.2, '#fff');
  };
  // 광석 거인 (정예): 바위 몸 · 어깨에 솟은 금빛 광석 결정 · 가슴의 빛나는 광석 심장 · 큰 주먹
  N.foreman = (c, m, t, s) => {
    const k = m.h / 110; c.scale(k, k); const br = sin(t * 2) * 1.5, ph = s.walk ? t * 6 : 0, sl = s.atk;
    for (const [x, a] of [[-14, 0], [14, PI]]) { const st = s.walk ? sin(ph + a) * 0.15 : 0; c.save(); c.translate(x, -36); c.rotate(st); rrect(c, -10, 0, 20, 34, 6, vg(c, 0, 34, '#9a8a88', '#5a4c4a'), '#2a2020', 1.4); rrect(c, -12, 28, 24, 8, 4, '#4a3e3c'); c.restore(); }
    c.save(); c.translate(0, br);
    c.beginPath(); c.moveTo(-34, -90); c.quadraticCurveTo(-42, -60, -24, -34); c.lineTo(24, -34); c.quadraticCurveTo(42, -60, 34, -90); c.quadraticCurveTo(0, -100, -34, -90); c.closePath(); c.fillStyle = rg(c, 0, -70, 44, '#b8a8a8', '#5a4c4a'); c.fill(); c.strokeStyle = '#2a2020'; c.lineWidth = 1.8; c.stroke();
    for (const p of [[[-26, -80], [-18, -70], [-24, -56]], [[20, -82], [14, -66], [22, -52]], [[-8, -44], [0, -50], [8, -42]]]) line(c, 'rgba(40,30,30,.5)', 1.4, p);
    glow(c, 0, -66, 22, '#ffc83a', 0.7 + 0.2 * sin(t * 3)); poly(c, vg(c, -78, -54, '#fff4b0', '#e0a020'), [[0, -78], [9, -66], [0, -54], [-9, -66]], '#7a5008', 1.2); poly(c, 'rgba(255,255,255,.5)', [[0, -78], [4, -70], [0, -66], [-3, -70]]);
    for (const [x, sc] of [[-30, 1], [30, 0.85]]) { c.save(); c.translate(x, -90); c.scale(sc, sc); for (const [dx, h, a] of [[-6, 16, -0.4], [0, 22, 0], [7, 14, 0.4]]) { c.save(); c.translate(dx, 0); c.rotate(a); poly(c, vg(c, -h, 0, '#fff0a0', '#d89010'), [[-4, 0], [-3, -h * 0.7], [0, -h], [3, -h * 0.7], [4, 0]], '#7a5008', 0.9); c.restore(); } c.restore(); }
    c.save(); c.translate(0, -96); ell(c, 0, 0, 14, 11, rg(c, 0, -2, 14, '#b0a0a0', '#5a4c4a'), '#2a2020', 1.4); rrect(c, -10, -2, 20, 5, 2, '#1a1414'); glow(c, 0, 0.5, 9, '#ffd040', 0.8); ell(c, -4, 0.5, 2.4, 1.4, '#ffe080'); ell(c, 4, 0.5, 2.4, 1.4, '#ffe080'); c.restore();
    for (const sg of [-1, 1]) { const up = sg > 0 ? -sl * 0.9 : 0; c.save(); c.translate(sg * 38, -82); c.rotate(sg * 0.15 + up); rrect(c, -8, 0, 16, 30, 6, vg(c, 0, 30, '#a89898', '#5a4c4a'), '#2a2020', 1.4); ell(c, 0, 36, 13, 11, rg(c, 0, 34, 13, '#b8a8a8', '#5a4c4a'), '#2a2020', 1.4); for (let i = 0; i < 3; i++) line(c, '#2a2020', 1.2, [[-6 + i * 5, 30], [-6 + i * 5, 36]]); c.restore(); }
    c.restore();
  };
  // 모래 도마뱀: 목 주름 장식(공격 때 활짝) · 모래빛 비늘 · 등 가시 · 긴 꼬리
  N.sand_lizard = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const ph = s.walk ? t * 12 : 0, sw = sin(ph) * 0.1, fr = 0.35 + s.atk * 0.65;
    for (const [x, a] of [[-12, 0], [10, PI]]) for (const sg of [-1, 1]) { const st = s.walk ? sin(ph + a + (sg > 0 ? PI : 0)) * 4 : 0; line(c, '#8a6a30', 2.8, [[x, -8], [x + st + 3, -2], [x + st + 6, 0]]); }
    c.save(); c.translate(-16, -9); c.rotate(sw); c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-18, -2, -36, 2); c.quadraticCurveTo(-18, 4, 0, 4); c.closePath(); c.fillStyle = vg(c, -4, 4, '#e0c080', '#9a7a3a'); c.fill(); c.strokeStyle = '#5a4018'; c.lineWidth = 0.9; c.stroke(); c.restore();
    c.beginPath(); c.ellipse(0, -10, 18, 7, -sw * 0.4, 0, PI * 2); c.fillStyle = vg(c, -17, -3, '#f0d08a', '#a07a3a'); c.fill(); c.strokeStyle = '#5a4018'; c.lineWidth = 1.1; c.stroke();
    for (let i = 0; i < 7; i++) poly(c, '#c08a3a', [[-12 + i * 4, -15], [-10 + i * 4, -19], [-8 + i * 4, -15]]);
    for (const [x, y] of [[-8, -9], [-2, -12], [4, -9], [10, -11]]) ell(c, x, y, 1.6, 1.2, '#b08040');
    c.save(); c.translate(19, -13); c.save(); c.translate(-3, 0); for (let i = 0; i < 7; i++) { const a = -PI / 2 - fr * 1.3 + i * fr * 2.6 / 6; c.save(); c.rotate(a); poly(c, i % 2 ? '#e86a3a' : '#f0a040', [[0, -2], [12 * (0.6 + fr * 0.6), 0], [0, 2]], '#7a3a10', 0.5); c.restore(); } c.restore();
    ell(c, 4, 1, 8, 5, vg(c, -4, 6, '#f0d08a', '#a07a3a'), '#5a4018', 1); slit(c, 6, -1, 2.2, '#ffd040'); line(c, '#5a4018', 0.9, [[7, 4], [12, 3]]); c.restore();
  };
  // 사막 들소: 텁수룩한 갈기 · 넓게 휜 뿔 · 등에 무늬 천 안장 · 콧김
  N.dune_bison = (c, m, t, s) => {
    const k = m.w / 80; c.scale(k, k); const lunge = sin(s.atk * PI) * 10; c.translate(lunge, s.walk ? -abs(sin(t * 10)) * 1.5 : 0);
    legs4(c, s, t, [-24, -14, 12, 22], -18, 18, 6, '#4a2a18', 10);
    c.beginPath(); c.ellipse(-4, -28, 30, 15, 0, 0, PI * 2); c.fillStyle = vg(c, -43, -13, '#b88050', '#6a4020'); c.fill(); c.strokeStyle = '#2a1408'; c.lineWidth = 1.3; c.stroke();
    c.beginPath(); c.moveTo(-14, -42); c.quadraticCurveTo(-4, -46, 6, -42); c.lineTo(10, -24); c.lineTo(-18, -24); c.closePath(); c.fillStyle = '#c84a3a'; c.fill(); c.strokeStyle = '#5a1a10'; c.lineWidth = 0.9; c.stroke();
    for (let i = 0; i < 4; i++) poly(c, '#f0c060', [[-14 + i * 6.5, -32], [-11 + i * 6.5, -36], [-8 + i * 6.5, -32], [-11 + i * 6.5, -28]]); line(c, '#f0c060', 1, [[-17, -26], [9, -26]]);
    for (let i = 0; i < 5; i++) ell(c, -16 + i * 3, -24, 1.2, 2.4, '#e8d0a0');
    c.beginPath(); c.ellipse(16, -36, 16, 15, 0.3, 0, PI * 2); c.fillStyle = rg(c, 16, -38, 16, '#8a5a30', '#3a2010'); c.fill();
    c.save(); c.translate(30, -28); ell(c, 0, 0, 10, 9, vg(c, -9, 9, '#7a4a28', '#3a2010'), '#1a0a04', 1.2); ell(c, 6, 4, 4.4, 3.4, '#4a2a18'); ell(c, 8, 3, 1, 0.8, '#1a0a04');
    for (const sg of [-1, 1]) { c.strokeStyle = '#f0e6d0'; c.lineWidth = 3.4 - (sg > 0 ? 0 : 1); c.lineCap = 'round'; c.beginPath(); c.moveTo(-2, -7); c.quadraticCurveTo(-10 * (sg > 0 ? 1 : 0.7), -12, -6, -20); c.stroke(); }
    slit(c, 2, -3, 1.8, '#3a1a08'); for (let i = 0; i < 4; i++) ell(c, -6 + i * 2.4, -9 + (i % 2) * 2, 2.6, 2, '#5a3418'); c.restore();
    if (s.walk || s.atk > 0) for (let i = 0; i < 2; i++) { const u = (t * 2 + i / 2) % 1; ell(c, 42 + u * 8, -26 - u * 4, 2 + u * 3, 1.4 + u * 2, `rgba(240,230,210,${0.6 * (1 - u)})`); }
  };
  // 협곡 전갈: 윤기 나는 붉은 마디 · 높이 든 꼬리 독침(빛남) · 큰 집게 · 8다리
  N.canyon_scorpion = (c, m, t, s) => {
    const k = m.w / 64; c.scale(k, k); const ph = s.walk ? t * 14 : 0, st = s.atk;
    for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) { const a = ph + i * 1.6 + (sg > 0 ? PI : 0), x = -6 + i * 6; line(c, '#6a2010', 2, [[x, -8], [x + sg * 2 + sin(a) * 2, -11], [x + sg * 5 + sin(a) * 3, 0]]); }
    const pts = []; for (let i = 0; i < 6; i++) { const u = i / 5, ex = 2 + st * 10, ey = -40 + st * 6; pts.push([(1 - u) * (1 - u) * -14 + 2 * (1 - u) * u * -36 + u * u * ex, (1 - u) * (1 - u) * -10 + 2 * (1 - u) * u * -42 + u * u * ey]); }   // 꼬리: 등 뒤에서 솟아 몸 위로 굽음
    line(c, '#8a2a10', 6, pts);
    pts.forEach(([x, y], i) => ell(c, x, y, 5 - i * 0.4, 4.4 - i * 0.4, rg(c, x, y, 5, '#ff7a5a', '#8a2a10'), '#3a0a04', 0.9));
    const [tx, ty] = pts[5]; c.save(); c.translate(tx, ty); c.rotate(-0.6 + st * 0.5); poly(c, vg(c, -2, 9, '#ffd080', '#c06010'), [[-2.4, 0], [2.4, 0], [3, 6], [0, 11], [-1, 5]], '#3a0a04', 0.8); c.restore(); glow(c, tx + 2, ty + 6, 8, '#ffe060', 0.7);
    ell(c, 0, -10, 14, 7, rg(c, 0, -12, 14, '#ff8a5a', '#9a2a10'), '#3a0a04', 1.2); for (let i = 0; i < 3; i++) line(c, 'rgba(60,10,4,.5)', 1, [[-6 + i * 6, -16], [-7 + i * 6, -4]]); ell(c, -2, -14, 6, 1.8, 'rgba(255,255,255,.35)');
    for (const [sg, y] of [[1, -9], [0.7, -6]]) { c.save(); c.translate(12, y); c.rotate(-0.2 - st * 0.3 * sg); line(c, '#9a2a10', 3, [[0, 0], [8 * sg, -2]]); c.translate(10 * sg, -3); const op = st > 0 ? 0.5 : abs(sin(t * 2)) * 0.2;
      c.save(); c.rotate(-op); ell(c, 4, -1.6, 6 * sg, 3 * sg, '#e8582a', '#3a0a04', 0.8); c.restore(); c.save(); c.rotate(op); ell(c, 4, 1.6, 5 * sg, 2.4 * sg, '#c84a20', '#3a0a04', 0.8); c.restore(); c.restore(); }
    ell(c, 10, -13, 1.6, 1.6, '#1a0804'); ell(c, 7, -14, 1.2, 1.2, '#1a0804'); ell(c, 10.4, -13.4, 0.5, 0.5, '#fff');
  };
  // 사막 독수리: 큰 날개 (깃털 끝이 갈라짐) · 흰 목도리 깃 · 붉은 민머리 · 굽은 부리 · 발톱
  N.vulture = (c, m, t, s) => {
    const k = m.w / 50; c.scale(k, k); const fl = sin(t * 6) * 0.5, bob = sin(t * 3) * 2, dive = s.atk; c.translate(dive * 6, -18 + bob); c.rotate(dive * 0.35);
    const wing = (sg, back) => { c.save(); c.translate(-2, -4); c.scale(1, 1); c.rotate(-0.4 - fl * (back ? 0.8 : 1)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -16, -32, -12);
      for (let i = 0; i < 5; i++) c.lineTo(-32 + i * 4 + 2, -12 + 8 + i * 1.2), c.lineTo(-30 + i * 4 + 4, -10 + i * 1.6); c.quadraticCurveTo(-10, 4, 0, 4); c.closePath();
      c.fillStyle = vg(c, -16, 6, back ? '#6a4a30' : '#8a6a4a', back ? '#3a2414' : '#4a3020'); c.fill(); c.strokeStyle = '#1e1008'; c.lineWidth = 1; c.stroke(); line(c, 'rgba(240,220,190,.4)', 1, [[-6, -2], [-26, -9]]); c.restore(); };
    wing(-1, true);
    ell(c, 0, 0, 12, 8, rg(c, 0, -2, 12, '#9a7a5a', '#4a3020'), '#1e1008', 1.1); for (let i = 0; i < 3; i++) poly(c, '#5a3a20', [[-12 - i * 3, -2 + i * 2], [-20 - i * 3, 0 + i * 3], [-12 - i * 3, 3 + i * 2]], '#1e1008', 0.6);
    for (const x of [-2, 4]) { line(c, '#c8a040', 1.6, [[x, 7], [x + 1, 12]]); line(c, '#c8a040', 1, [[x + 1, 12], [x + 3, 13]]); }
    wing(1, false);
    for (let i = 0; i < 6; i++) ell(c, 8 + cos(i) * 3, -5 + sin(i * 1.3) * 3, 3.4, 2.4, '#f0e8dc', '#b0a08a', 0.4);
    c.save(); c.translate(14, -10); ell(c, 0, 0, 5, 4.6, rg(c, 0, -1, 5, '#f09a8a', '#b04a3a'), '#5a1a10', 0.9); slit(c, 1.6, -1, 1.6, '#ffd040');
    c.beginPath(); c.moveTo(3, 1); c.quadraticCurveTo(10, -1, 9, 4); c.quadraticCurveTo(6, 3, 3, 3); c.closePath(); c.fillStyle = '#e8d0a0'; c.fill(); c.strokeStyle = '#5a4020'; c.lineWidth = 0.7; c.stroke(); c.restore();
  };
  // 사막 전갈왕 (정예): 금 갑옷 마디 · 머리의 왕관 · 꼬리 끝 루비 독침 · 거대한 집게
  N.scorpion_king = (c, m, t, s) => {
    const k = m.w / 110; c.scale(k, k); const ph = s.walk ? t * 10 : 0, st = s.atk;
    for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) { const a = ph + i * 1.6 + (sg > 0 ? PI : 0), x = -14 + i * 10; line(c, '#6a2008', 3.4, [[x, -14], [x + sg * 3 + sin(a) * 3, -22], [x + sg * 8 + sin(a) * 4, 0]]); line(c, '#e8b040', 1.4, [[x + sg * 2 + sin(a) * 3, -20], [x + sg * 4 + sin(a) * 3, -16]]); }
    const pts = []; for (let i = 0; i < 7; i++) { const u = i / 6, ex = 4 + st * 16, ey = -66 + st * 10; pts.push([(1 - u) * (1 - u) * -24 + 2 * (1 - u) * u * -60 + u * u * ex, (1 - u) * (1 - u) * -16 + 2 * (1 - u) * u * -72 + u * u * ey]); }
    line(c, '#a03a10', 11, pts);
    pts.forEach(([x, y], i) => { const r = 9 - i * 0.7; ell(c, x, y, r, r * 0.9, rg(c, x, y, r, '#ff9a5a', '#a03a10'), '#3a0a04', 1.2); line(c, '#f0c040', 1.6, [[x - r * 0.7, y + r * 0.2], [x + r * 0.7, y + r * 0.2]]); });
    const [tx, ty] = pts[6]; c.save(); c.translate(tx, ty); c.rotate(-0.6 + st * 0.5); poly(c, vg(c, -3, 16, '#ffe080', '#c08010'), [[-4, 0], [4, 0], [5, 9], [0, 18], [-2, 9]], '#5a3008', 1); ell(c, 0, 6, 2.6, 3, '#e0203a', '#5a0010', 0.7); c.restore(); glow(c, tx + 3, ty + 10, 16, '#ff4a4a', 0.6);
    ell(c, 0, -18, 26, 13, rg(c, -4, -22, 26, '#ff9a5a', '#a03a10'), '#3a0a04', 1.6);
    for (let i = 0; i < 4; i++) { const x = -16 + i * 10; poly(c, vg(c, -30, -16, '#ffe890', '#c08a18'), [[x - 4, -16], [x - 3, -28 + (i % 2) * 2], [x + 3, -28 + (i % 2) * 2], [x + 4, -16]], '#6a4008', 0.9); }
    for (const [sg, y, sz] of [[1, -18, 1], [0.8, -12, 0.8]]) { c.save(); c.translate(22, y); c.rotate(-0.25 - st * 0.35 * sg); line(c, '#a03a10', 5 * sz, [[0, 0], [14 * sz, -3]]); c.translate(18 * sz, -4); const op = st > 0 ? 0.55 : abs(sin(t * 2)) * 0.2;
      c.save(); c.rotate(-op); ell(c, 7 * sz, -3, 11 * sz, 5 * sz, rg(c, 7, -4, 11, '#ff9a5a', '#c84a18'), '#3a0a04', 1.1); line(c, '#f0c040', 1.4, [[2, -5], [12 * sz, -6]]); c.restore(); c.save(); c.rotate(op); ell(c, 7 * sz, 3, 9 * sz, 4 * sz, '#d85a20', '#3a0a04', 1); c.restore(); c.restore(); }
    c.save(); c.translate(20, -28); poly(c, vg(c, -10, 0, '#fff0a0', '#d89a18'), [[-7, 0], [-8, -8], [-4, -4], [0, -10], [4, -4], [8, -8], [7, 0]], '#6a4008', 1); ell(c, 0, -3, 1.8, 1.8, '#e0203a'); c.restore();
    ell(c, 24, -20, 2.2, 2.2, '#1a0804'); ell(c, 19, -21, 1.6, 1.6, '#1a0804'); ell(c, 24.6, -20.6, 0.7, 0.7, '#fff');
  };
  // 미라: 헐렁하게 풀리며 나부끼는 붕대 · 붕대 틈 사이 빛나는 눈 하나 · 앞으로 내민 손 · 모래 가루
  N.mummy = (c, m, t, s) => {
    const k = m.h / 66; c.scale(k, k); const ph = s.walk ? t * 6 : 0, sway = sin(ph) * 0.06; c.rotate(sway);
    for (const [x, a] of [[-5, 0], [5, PI]]) { const st = s.walk ? sin(ph + a) * 3 : 0; rrect(c, x - 4 + st * 0.3, -22, 8, 22, 3, vg(c, -22, 0, '#e8e0c8', '#a8a088'), '#5a5440', 0.9); for (let i = 0; i < 3; i++) line(c, 'rgba(90,80,60,.5)', 0.8, [[x - 4, -18 + i * 6], [x + 4, -16 + i * 6]]); }
    c.beginPath(); c.moveTo(-11, -48); c.quadraticCurveTo(-13, -30, -9, -20); c.lineTo(9, -20); c.quadraticCurveTo(13, -30, 11, -48); c.closePath(); c.fillStyle = vg(c, -48, -20, '#f0e8d0', '#b0a890'); c.fill(); c.strokeStyle = '#5a5440'; c.lineWidth = 1.1; c.stroke();
    for (let i = 0; i < 6; i++) line(c, 'rgba(90,80,60,.55)', 0.9, [[-11, -46 + i * 4.6], [11, -43 + i * 4.6 - (i % 2) * 2]]);
    for (const [x, y, l] of [[-10, -30, 14], [8, -24, 10]]) { c.strokeStyle = '#e0d8c0'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 6, y + 4 + sin(t * 3 + x) * 2, x - l, y + 2 + sin(t * 3 + x) * 4); c.stroke(); }
    c.save(); c.translate(8, -42); c.rotate(-0.3 - s.atk * 0.3); rrect(c, 0, -3, 18, 6, 3, '#e8e0c8', '#5a5440', 0.8); for (let i = 0; i < 3; i++) line(c, 'rgba(90,80,60,.5)', 0.7, [[4 + i * 5, -3], [5 + i * 5, 3]]); ell(c, 19, 0, 3, 3, '#5a5040'); c.restore();
    c.save(); c.translate(1, -56); ell(c, 0, 0, 9, 9.5, rg(c, 0, -2, 10, '#f4ecd8', '#b0a890'), '#5a5440', 1);
    for (let i = 0; i < 4; i++) line(c, 'rgba(90,80,60,.55)', 0.9, [[-9, -6 + i * 4], [9, -4 + i * 4 - (i % 2) * 2]]);
    ell(c, 3, -1, 5, 1.8, '#1a1408'); glow(c, 5, -1, 7, '#80ff9a', 0.9); ell(c, 5, -1, 1.6, 1.3, '#d0ffd8'); c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; ell(c, -8 + i * 8, -4 - u * 10, 1, 1, `rgba(220,200,150,${0.7 * (1 - u)})`); }
  };
  // 모래 정령: 소용돌이치는 모래 몸 · 돌 가면 얼굴 · 떠다니는 돌 조각 · 빛나는 눈
  N.sand_spirit = (c, m, t, s) => {
    const k = m.h / 50; c.scale(k, k); const bob = sin(t * 2) * 2; c.translate(s.atk * 4, bob);
    for (let i = 0; i < 9; i++) { const u = i / 8, y = -2 - u * 40, w = 4 + u * 16, ph = t * 5 + i; c.strokeStyle = `rgba(${220 - i * 4},${190 - i * 4},120,${0.55 + u * 0.35})`; c.lineWidth = 3.4 - u; c.beginPath(); c.ellipse(sin(ph * 0.3) * 2 * (1 - u), y, w, 2.4 + u * 1.6, 0, ph % (PI * 2), ph % (PI * 2) + PI * 1.5); c.stroke(); }
    for (let i = 0; i < 10; i++) { const a = t * 3 + i * 0.63, r = 8 + (i % 4) * 4; ell(c, cos(a) * r, -20 + sin(a) * 4 - i * 2, 1, 1, '#e8c880'); }
    c.save(); c.translate(0, -38); ell(c, 0, 0, 10, 11, rg(c, 0, -2, 11, '#e0c890', '#8a6a3a'), '#4a3418', 1.2); line(c, '#6a4a20', 1, [[-6, -8], [-2, -2], [-5, 4]]);
    for (const x of [-4, 4]) { ell(c, x, -1, 2.6, 1.8, '#2a1a08'); glow(c, x, -1, 5, '#ffe080', 0.8); ell(c, x, -1, 1, 0.8, '#fff8c0'); } rrect(c, -3, 5, 6, 1.6, 0.8, '#2a1a08'); c.restore();
    for (const [x, y, r] of [[-18, -30, 3], [17, -24, 2.6], [-12, -12, 2]]) { const yy = y + sin(t * 2 + x) * 3; poly(c, '#a08050', [[x - r, yy], [x, yy - r], [x + r, yy + r * 0.3], [x - r * 0.3, yy + r]], '#4a3418', 0.6); }
  };
  // 설원 늑대: 흰 털 · 목 둘레 얼음 갈기 · 푸른 무늬 · 입김
  N.snow_wolf = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const ph = s.walk ? t * 12 : 0, lunge = sin(s.atk * PI) * 10; c.translate(lunge, s.walk ? -abs(sin(ph)) * 2 : 0);
    c.save(); c.translate(-24, -22); c.rotate(-0.3 + sin(t * 3) * 0.1); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -6, -20, 4); c.quadraticCurveTo(-12, 8, 0, 6); c.closePath(); c.fillStyle = vg(c, -4, 8, '#ffffff', '#b8c8e0'); c.fill(); c.strokeStyle = '#6a7a98'; c.lineWidth = 1; c.stroke(); c.restore();
    legs4(c, s, t, [-18, -10, 12, 20], -14, 14, 5, '#d8e2f0', 12);
    c.beginPath(); c.ellipse(-2, -22, 24, 10, 0, 0, PI * 2); c.fillStyle = vg(c, -32, -12, '#ffffff', '#c0cee4'); c.fill(); c.strokeStyle = '#6a7a98'; c.lineWidth = 1.1; c.stroke();
    for (let i = 0; i < 3; i++) line(c, '#7ab0e0', 1.4, [[-14 + i * 7, -30], [-12 + i * 7, -24]]);
    c.save(); c.translate(20, -28); c.rotate(-0.1 - s.atk * 0.15);
    for (let i = 0; i < 6; i++) { c.save(); c.translate(-6, 2); c.rotate(-1.6 + i * 0.5); poly(c, i % 2 ? '#d8f0ff' : '#a0d4ff', [[0, -2.4], [12, 0], [0, 2.4]], '#4a7aa8', 0.6); c.restore(); }   // 얼음 갈기
    ell(c, 2, 0, 10, 8, vg(c, -8, 8, '#ffffff', '#c8d4e8'), '#6a7a98', 1.1); c.beginPath(); c.moveTo(8, -2); c.lineTo(18, 2); c.lineTo(8, 6); c.closePath(); c.fillStyle = '#e8eef8'; c.fill(); c.strokeStyle = '#6a7a98'; c.lineWidth = 0.9; c.stroke();
    ell(c, 18, 2, 1.6, 1.4, '#2a3248'); for (const x of [-3, 3]) poly(c, '#f0f4fc', [[x - 3, -6], [x, -16], [x + 3, -6]], '#6a7a98', 0.8); poly(c, '#a0c8f0', [[2, -7], [3.4, -13], [4.6, -7]]);
    slit(c, 6, -2, 2.2, '#5ac0ff'); line(c, '#7ab0e0', 1, [[0, 2], [6, 4]]);
    if (s.atk > 0) for (let i = 0; i < 3; i++) poly(c, '#fff', [[10 + i * 2.4, 4.6], [11 + i * 2.4, 7], [12 + i * 2.4, 4.6]]); c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; ell(c, 40 + u * 10, -26 - u * 4, 2 + u * 3, 1.4 + u * 2, `rgba(230,245,255,${0.6 * (1 - u)})`); }
  };
  // 서리 박쥐: 얼음 결정 날개 (끝이 고드름) · 푸른 털 · 빛나는 눈 · 떨어지는 눈송이
  N.frost_bat = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const fl = sin(t * 9) * 0.35, bob = sin(t * 3) * 3; c.translate(s.atk * 5, -14 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.rotate(-fl * 0.6); c.beginPath(); c.moveTo(4, -5); c.lineTo(14, -16); c.lineTo(28, -14); c.lineTo(24, -6); c.lineTo(28, 2); c.lineTo(18, 0); c.lineTo(16, 6); c.lineTo(4, 2); c.closePath();
      c.fillStyle = vg(c, -16, 6, 'rgba(220,245,255,.95)', 'rgba(110,180,240,.9)'); c.fill(); c.strokeStyle = '#3a6aa8'; c.lineWidth = 1; c.stroke();
      line(c, 'rgba(255,255,255,.7)', 0.7, [[6, -2], [26, -12]]); line(c, 'rgba(255,255,255,.5)', 0.7, [[6, -1], [24, 0]]);
      for (const [x, y, l] of [[28, -14, 5], [28, 2, 6], [16, 6, 5]]) poly(c, '#e8f8ff', [[x - 1.4, y], [x + 1.4, y], [x, y + l]], '#5a9ad0', 0.5); c.restore(); }
    ell(c, 0, -2, 8.6, 9, rg(c, 0, -3, 9, '#c8e8ff', '#4a7ab0'), '#1a3a68', 1.1);
    for (const sg of [-1, 1]) poly(c, '#a0d0ff', [[sg * 3, -9], [sg * 8, -19], [sg * 9, -6]], '#1a3a68', 0.9);
    for (const x of [-3.4, 3.4]) { glow(c, x, -3, 4, '#bff4ff', 0.9); ell(c, x, -3, 2, 2.2, '#eaffff'); ell(c, x + 0.5, -2.8, 0.8, 1.2, '#1a3a68'); }
    poly(c, '#fff', [[-1.6, 3], [-0.6, 3], [-1.1, 5]]); poly(c, '#fff', [[0.6, 3], [1.6, 3], [1.1, 5]]);
    for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; c.save(); c.translate(-6 + i * 6, 6 + u * 18); c.rotate(t + i); c.globalAlpha *= 1 - u; for (let j = 0; j < 3; j++) { c.rotate(PI / 3); line(c, '#e8f8ff', 0.7, [[-2, 0], [2, 0]]); } c.restore(); }
  };
  // 오로라뿔 사슴: 가늘고 우아한 몸 · 수정 가지뿔에 흐르는 오로라 빛 · 등의 오로라 갈기 · 발굽 눈꽃
  N.ice_crab = (c, m, t, s) => {
    const k = m.h / 78; c.scale(k, k); const ph = s.walk ? t * 9 : 0, dip = s.atk; c.translate(0, s.walk ? -abs(sin(ph)) * 2 : 0);
    legs4(c, s, t, [-14, -8, 12, 18], -26, 26, 3.6, '#e8eefa', 9);
    c.beginPath(); c.ellipse(0, -32, 20, 10, -0.05, 0, PI * 2); c.fillStyle = vg(c, -42, -22, '#ffffff', '#c8d4ee'); c.fill(); c.strokeStyle = '#7a88b0'; c.lineWidth = 1.1; c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const col = ['rgba(120,255,200,.45)', 'rgba(140,170,255,.45)', 'rgba(220,140,255,.4)'][i]; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, -38 + i * 2); c.quadraticCurveTo(-2, -46 + sin(t * 2 + i) * 2 + i * 2, 14, -40 + i * 2); c.stroke(); } c.restore();
    ell(c, -18, -34, 4, 3, '#ffffff', '#7a88b0', 0.8);
    c.save(); c.translate(16, -40); c.rotate(-0.5 + dip * 0.9); rrect(c, -3, -18, 7, 22, 3, vg(c, -18, 4, '#ffffff', '#d0daf0'), '#7a88b0', 1);
    c.translate(2, -20); c.rotate(0.5 - dip * 0.9); ell(c, 4, 0, 8, 5.4, vg(c, -5, 5, '#ffffff', '#d0daf0'), '#7a88b0', 1); ell(c, 11, 1, 2, 1.6, '#ffb0c0'); slit(c, 5, -1, 1.8, '#5a6ad0');
    poly(c, '#e8eefa', [[-1, -4], [-4, -10], [1, -5]], '#7a88b0', 0.6);
    const ant = (sg) => { c.save(); c.translate(1 + sg, -5); c.scale(sg > 0 ? 1 : -0.7, 1); const P = [[0, 0], [2, -10], [-2, -18], [1, -26]]; line(c, '#bfe6ff', 2, P); for (const [a, b] of [[[2, -10], [9, -15]], [[-2, -18], [-8, -22]], [[0, -22], [7, -28]]]) line(c, '#bfe6ff', 1.4, [a, b]);
      for (const p of [[9, -15], [-8, -22], [7, -28], [1, -26]]) { glow(c, p[0], p[1], 5, ['#7affd0', '#9ab0ff', '#e090ff', '#7affd0'][Math.abs(p[0]) % 4], 0.7); ell(c, p[0], p[1], 1.4, 1.4, '#ffffff'); } c.restore(); };
    ant(-1); ant(1); c.restore();
  };
  // 설원의 파수꾼: 흰 털 거구 수인 · 얼음 창 · 얼음 방패 · 털망토 · 뿔 투구
  N.yeti = (c, m, t, s) => {
    const k = m.h / 90; c.scale(k, k); const ph = s.walk ? t * 7 : 0, at = s.atk;
    for (const [x, a] of [[-9, 0], [9, PI]]) { const st = s.walk ? sin(ph + a) * 0.18 : 0; c.save(); c.translate(x, -30); c.rotate(st); rrect(c, -7, 0, 14, 28, 6, vg(c, 0, 28, '#f0f4fc', '#a8b8d0'), '#56698f', 1.1); ell(c, 0, 28, 9, 4, '#8aa0c8', '#2a3a58', 0.8); c.restore(); }
    c.beginPath(); c.moveTo(-20, -72); c.quadraticCurveTo(-30, -40, -16, -28); c.lineTo(16, -28); c.quadraticCurveTo(30, -40, 20, -72); c.quadraticCurveTo(0, -80, -20, -72); c.closePath(); c.fillStyle = rg(c, 0, -58, 30, '#ffffff', '#b8c6de'); c.fill(); c.strokeStyle = '#56698f'; c.lineWidth = 1.4; c.stroke();
    for (let i = 0; i < 7; i++) poly(c, '#e8eefa', [[-16 + i * 5, -30], [-14 + i * 5, -24], [-12 + i * 5, -30]], '#8aa0c8', 0.5);
    rrect(c, -18, -50, 36, 6, 3, '#5a7ab0', '#2a3a58', 0.8); ell(c, 0, -47, 4, 4, '#bfe6ff', '#2a3a58', 0.8);
    c.save(); c.translate(-20, -52); ell(c, 0, 8, 12, 15, vg(c, -8, 24, '#d8f0ff', '#6a9ad0'), '#2a4a78', 1.3); poly(c, 'rgba(255,255,255,.6)', [[0, -2], [5, 8], [0, 18], [-5, 8]], '#4a7ab0', 0.8); c.restore();
    c.save(); c.translate(0, -82); ell(c, 0, 0, 13, 12, rg(c, 0, -2, 13, '#ffffff', '#c0cee4'), '#56698f', 1.2); ell(c, 4, 4, 7, 5, '#c8d4ea');
    for (const sg of [-1, 1]) { c.strokeStyle = '#8aa0c8'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sg * 8, -8); c.quadraticCurveTo(sg * 16, -14, sg * 14, -22); c.stroke(); }
    rrect(c, -10, -6, 20, 4, 2, '#5a7ab0'); for (const x of [-3, 5]) { glow(c, x, 0, 5, '#7ad8ff', 0.8); ell(c, x, 0, 2, 1.6, '#dff8ff'); } line(c, '#3a4a68', 1, [[1, 7], [7, 6]]); c.restore();
    c.save(); c.translate(18, -60); c.rotate(-0.1 - at * 1.2); rrect(c, -4, -4, 8, 16, 4, '#e8eefa', '#56698f', 1); line(c, '#6a5a4a', 3, [[0, 26], [0, -34]]); poly(c, vg(c, -48, -32, '#ffffff', '#7ac8ff'), [[-4, -32], [0, -50], [4, -32], [0, -28]], '#2a6aa8', 0.9); glow(c, 0, -40, 8, '#bff4ff', 0.6); c.restore();
  };
  // 서리 거인: 고드름 수염 · 얼음 뿔 투구 · 등에 얼음 바위 · 커다란 얼음 몽둥이
  N.ice_golem = (c, m, t, s) => {
    const k = m.h / 92; c.scale(k, k); const ph = s.walk ? t * 6 : 0, sw = s.atk;
    for (const [x, a] of [[-9, 0], [9, PI]]) { const st = s.walk ? sin(ph + a) * 0.15 : 0; c.save(); c.translate(x, -28); c.rotate(st); rrect(c, -7, 0, 14, 26, 5, vg(c, 0, 26, '#9ab4d8', '#5a7ab0'), '#2a3a68', 1.1); rrect(c, -9, 22, 18, 6, 3, '#6a5040', '#2a1a10', 0.8); c.restore(); }
    rrect(c, -18, -36, 36, 10, 4, vg(c, -36, -26, '#8a6a50', '#4a3424'), '#2a1a10', 1);
    c.beginPath(); c.moveTo(-22, -68); c.quadraticCurveTo(-28, -44, -18, -32); c.lineTo(18, -32); c.quadraticCurveTo(28, -44, 22, -68); c.quadraticCurveTo(0, -76, -22, -68); c.closePath(); c.fillStyle = rg(c, 0, -54, 28, '#d8eeff', '#7aa0d0'); c.fill(); c.strokeStyle = '#2a3a68'; c.lineWidth = 1.4; c.stroke();
    for (const [x, y, sz] of [[-16, -74, 1], [-4, -78, 0.8], [14, -72, 0.9]]) poly(c, vg(c, y - 14 * sz, y, '#ffffff', '#8ac8ff'), [[x - 5 * sz, y], [x - 2 * sz, y - 12 * sz], [x + 2 * sz, y - 15 * sz], [x + 5 * sz, y]], '#3a6aa8', 0.8);
    c.save(); c.translate(2, -78); ell(c, 0, 0, 11, 10, rg(c, 0, -2, 11, '#e8f6ff', '#9ac0e8'), '#2a3a68', 1.2);
    rrect(c, -11, -9, 22, 6, 3, '#8a9ab8', '#2a3a58', 0.9); for (const sg of [-1, 1]) poly(c, '#f0f8ff', [[sg * 8, -8], [sg * 18, -18], [sg * 12, -6]], '#4a6a98', 0.9);
    for (const x of [-3, 5]) { ell(c, x, -1, 2.2, 1.8, '#1a2a48'); ell(c, x + 0.5, -1.4, 0.7, 0.7, '#fff'); }
    for (let i = 0; i < 5; i++) poly(c, '#eaf8ff', [[-6 + i * 3.2, 4], [-4.4 + i * 3.2, 12 + (i % 2) * 3], [-2.8 + i * 3.2, 4]], '#7ab0e0', 0.5); c.restore();
    c.save(); c.translate(22, -62); c.rotate(0.3 - sw * 1.6); rrect(c, -5, -4, 10, 22, 5, vg(c, 0, 18, '#c8e0ff', '#6a90c8'), '#2a3a68', 1);
    c.translate(0, 18); rrect(c, -2, 0, 4, 10, 1, '#6a5040'); c.translate(0, 10); poly(c, vg(c, 0, 26, '#ffffff', '#7ab8f0'), [[-6, 0], [6, 0], [10, 14], [6, 26], [-6, 26], [-10, 14]], '#2a6aa8', 1.1); for (const [x, y] of [[-10, 12], [10, 16], [0, 26]]) poly(c, '#eaf8ff', [[x - 2, y], [x + (x ? x * 0.4 : 0), y + (x ? 0 : 6)], [x + 2, y]]); c.restore();
  };
  // 서리 망령: 너덜너덜 흘러내리는 서리 망토 · 얼굴 대신 빛나는 두 눈 · 손에 든 얼음 등불 · 흩날리는 눈
  N.frost_wraith = (c, m, t, s) => {
    const k = m.h / 56; c.scale(k, k); const bob = sin(t * 2.4) * 3; c.translate(0, -6 + bob);
    c.beginPath(); c.moveTo(-12, -40); c.quadraticCurveTo(-18, -14, -16, 0); for (let i = 0; i < 6; i++) c.quadraticCurveTo(-14 + i * 5.4 + 2.7, -2 + (i % 2 ? 6 : 0) + sin(t * 3 + i) * 2, -10.6 + i * 5.4, 2 + sin(t * 3 + i * 1.3) * 2); c.quadraticCurveTo(18, -14, 12, -40); c.quadraticCurveTo(0, -50, -12, -40); c.closePath();
    c.fillStyle = vg(c, -46, 4, 'rgba(220,240,255,.95)', 'rgba(110,160,210,.35)'); c.fill(); c.strokeStyle = 'rgba(70,120,170,.8)'; c.lineWidth = 1; c.stroke();
    for (const x of [-6, 0, 6]) line(c, 'rgba(80,130,180,.35)', 1.6, [[x * 0.6, -36], [x, -4]]);
    c.beginPath(); c.ellipse(0, -36, 10, 11, 0, 0, PI * 2); c.fillStyle = '#16243a'; c.fill(); c.strokeStyle = 'rgba(200,230,255,.9)'; c.lineWidth = 1.4; c.stroke();
    for (const x of [-3.4, 3.4]) { glow(c, x, -35, 5, '#7ae8ff', 0.9); ell(c, x, -35, 1.8, 1.2, '#e8ffff'); }
    c.save(); c.translate(12, -22); c.rotate(-0.2 - s.atk * 0.5); line(c, 'rgba(200,230,255,.9)', 2.4, [[-4, -2], [6, 0]]); line(c, '#8ab0d0', 0.8, [[8, 0], [8, 4]]); ell(c, 8, 9, 4, 5, 'rgba(200,240,255,.35)', '#9ad0f0', 1); glow(c, 8, 9, 10, '#9af0ff', 0.8 + 0.2 * sin(t * 4)); ell(c, 8, 9, 1.6, 2.4, '#eaffff'); c.restore();
    for (let i = 0; i < 4; i++) { const u = (t * 0.4 + i / 4) % 1; ell(c, -14 + i * 9 + sin(t + i) * 4, -40 + u * 44, 1, 1, `rgba(240,250,255,${0.8 * (1 - u)})`); }
  };
  // 서리비늘 골렘 (정예): 겹겹이 얼음 비늘 판 · 어깨 수정 · 가슴의 빛나는 얼음 심장 · 큰 얼음 주먹
  N.frost_giant = (c, m, t, s) => {
    const k = m.h / 130; c.scale(k, k); const ph = s.walk ? t * 5 : 0, sl = s.atk, br = sin(t * 2) * 1.5;
    for (const [x, a] of [[-16, 0], [16, PI]]) { const st = s.walk ? sin(ph + a) * 0.14 : 0; c.save(); c.translate(x, -42); c.rotate(st); rrect(c, -11, 0, 22, 40, 7, vg(c, 0, 40, '#a8bce0', '#4d6390'), '#22304e', 1.4); for (let i = 0; i < 3; i++) line(c, 'rgba(230,245,255,.5)', 1, [[-9, 8 + i * 10], [9, 6 + i * 10]]); c.restore(); }
    c.save(); c.translate(0, br);
    c.beginPath(); c.moveTo(-38, -104); c.quadraticCurveTo(-48, -70, -28, -40); c.lineTo(28, -40); c.quadraticCurveTo(48, -70, 38, -104); c.quadraticCurveTo(0, -116, -38, -104); c.closePath(); c.fillStyle = rg(c, 0, -80, 50, '#c8dcf8', '#4d6390'); c.fill(); c.strokeStyle = '#22304e'; c.lineWidth = 1.8; c.stroke();
    c.save(); c.clip(); for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) { const x = -36 + i * 14 + (r % 2) * 7, y = -104 + r * 11; c.beginPath(); c.arc(x, y, 8, 0, PI); c.fillStyle = r % 2 ? 'rgba(220,240,255,.35)' : 'rgba(150,190,240,.3)'; c.fill(); c.strokeStyle = 'rgba(40,60,110,.45)'; c.lineWidth = 0.8; c.stroke(); } c.restore();
    glow(c, 0, -78, 26, '#9af0ff', 0.75 + 0.2 * sin(t * 3)); poly(c, vg(c, -92, -64, '#ffffff', '#7ad0ff'), [[0, -92], [10, -78], [0, -64], [-10, -78]], '#2a6aa8', 1.3); poly(c, 'rgba(255,255,255,.6)', [[0, -92], [5, -82], [0, -78], [-4, -82]]);
    for (const [x, sg] of [[-34, -1], [34, 1]]) { c.save(); c.translate(x, -104); for (const [dx, h, a] of [[-6, 18, -0.5], [0, 26, -0.05], [7, 16, 0.4]]) { c.save(); c.translate(dx * sg, 0); c.rotate(a * sg); poly(c, vg(c, -h, 0, '#ffffff', '#7ac0ff'), [[-4, 0], [-3, -h * 0.7], [0, -h], [3, -h * 0.7], [4, 0]], '#2a5a98', 0.9); c.restore(); } c.restore(); }
    c.save(); c.translate(0, -112); ell(c, 0, 0, 15, 12, rg(c, 0, -2, 15, '#d8eaff', '#5a78a8'), '#22304e', 1.4); rrect(c, -11, -3, 22, 6, 3, '#14203a'); glow(c, 0, 0, 10, '#9af0ff', 0.9); ell(c, -4.5, 0, 2.6, 1.6, '#eaffff'); ell(c, 4.5, 0, 2.6, 1.6, '#eaffff'); c.restore();
    for (const sg of [-1, 1]) { const up = sg > 0 ? -sl * 1.4 : 0; c.save(); c.translate(sg * 44, -98); c.rotate(sg * 0.12 + up); rrect(c, -9, 0, 18, 34, 7, vg(c, 0, 34, '#b8cce8', '#4d6390'), '#22304e', 1.4);
      ell(c, 0, 42, 15, 13, rg(c, 0, 40, 15, '#d8eaff', '#5a78a8'), '#22304e', 1.4); for (let i = 0; i < 3; i++) poly(c, '#eaf8ff', [[-8 + i * 7, 32], [-6 + i * 7, 26], [-4 + i * 7, 32]], '#5a8ac8', 0.6); c.restore(); }
    c.restore();
  };
})();
