// 몬스터 3단계 (6장~종장) 나: 새 디자인 15종
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris) => { ell(c, x, y, r, r * 1.15, '#fff', '#2a2a40', 0.6); ell(c, x + r * 0.25, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a46'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const star = (c, x, y, r, f, s) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } poly(c, f, p, s, 0.7); };
  const legs4 = (c, s, t, xs, y, len, w, col, sp = 12) => xs.forEach((x, i) => { const st = s.walk ? sin(t * sp + (i % 2 ? PI : 0) + i * 0.4) * 0.45 : 0; c.save(); c.translate(x, y); c.rotate(st); rrect(c, -w / 2, 0, w, len, w / 2, col); c.restore(); });
  const look = (o, top, bot) => G.LOOKS.toDraw(Object.assign(G.LOOKS.def(o.gender || 'm'), o), top, bot);
  const N = G.MonNewC3 = {};

  // 하늘 여우: 구름 꼬리 셋 (끝에 별) · 큰 귀 안 금빛 · 이마 초승달 무늬 · 날렵한 몸
  N.cloud_sheep = (c, m, t, s) => {
    const k = m.h / 64; c.scale(k, k); const ph = s.walk ? t * 12 : 0, lunge = sin(s.atk * PI) * 8; c.translate(lunge, s.walk ? -abs(sin(ph)) * 2 : 0);
    for (let i = 0; i < 3; i++) { const a = -2.3 + i * 0.35 + sin(t * 2 + i) * 0.08; c.save(); c.translate(-14, -24); c.rotate(a); c.beginPath(); c.moveTo(0, -4); c.bezierCurveTo(8, -14, 28, -12, 32, 0); c.bezierCurveTo(26, 8, 8, 8, 0, 4); c.closePath();
      c.fillStyle = vg(c, -10, 8, '#ffffff', i === 1 ? '#a0a8f0' : '#c4c8f8'); c.fill(); c.strokeStyle = 'rgba(120,128,210,.7)'; c.lineWidth = 0.9; c.stroke(); star(c, 30, 0, 3, '#fff4b0', '#c8a040'); glow(c, 30, 0, 6, '#fff0a0', 0.6); c.restore(); }
    legs4(c, s, t, [-10, -4, 8, 14], -16, 15, 3.4, '#eceeff', 12);
    c.beginPath(); c.ellipse(0, -22, 16, 8, -0.1, 0, PI * 2); c.fillStyle = vg(c, -30, -14, '#ffffff', '#cfd2f6'); c.fill();
    c.save(); c.translate(16, -32); c.rotate(-s.atk * 0.2); ell(c, 0, 0, 9, 8, vg(c, -8, 8, '#ffffff', '#dadcf8')); c.beginPath(); c.moveTo(6, -1); c.lineTo(16, 3); c.lineTo(6, 6); c.closePath(); c.fill(); ell(c, 15.6, 3, 1.4, 1.2, '#2a2a48');
    for (const [x, a] of [[-4, -0.3], [3, 0.15]]) { c.save(); c.translate(x, -5); c.rotate(a); poly(c, '#ffffff', [[-4, 2], [0, -14], [4, 2]]); poly(c, vg(c, -12, 0, '#ffe8a0', '#e0b050'), [[-2, 0], [0, -10], [2, 0]]); c.restore(); }
    c.strokeStyle = '#c8a040'; c.lineWidth = 1.2; c.beginPath(); c.arc(1, -3, 2.4, -PI * 0.2, PI * 0.9); c.stroke();
    eye(c, 5, 0, 2.4, '#3a3a8a'); c.restore();
  };
  // 날개 구름양: 둥실 뜬 구름 양털 · 금빛 말린 뿔 · 등의 작은 깃털 날개 · 아래 빗방울
  N.sky_fairy = (c, m, t, s) => {
    const k = m.w / 64; c.scale(k, k); const bob = sin(t * 2.6) * 3, fl = sin(t * 8) * 0.35; c.translate(s.atk * 8, -26 + bob);
    for (const sg of [-1, 1]) { c.save(); c.translate(-4 + sg * 2, -12); c.rotate(-0.9 - fl * (sg > 0 ? 1 : 0.7)); for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * 0.22); ell(c, 10, 0, 11 - i * 1.5, 3, i % 2 ? '#ffffff' : '#e8eaff'); c.restore(); } c.restore(); }
    for (const [x, y, r] of [[-12, 0, 9], [-2, -6, 11], [10, -2, 10], [-4, 6, 9], [8, 7, 8]]) ell(c, x, y, r, r * 0.9, rg(c, x, y, r, '#ffffff', '#d8dcf6'));
    for (let i = 0; i < 3; i++) { const u = (t * 0.9 + i / 3) % 1; ell(c, -6 + i * 6, 14 + u * 14, 1.2, 2, `rgba(160,200,255,${0.8 * (1 - u)})`); }
    c.save(); c.translate(16, 0); ell(c, 0, 0, 8, 7.4, rg(c, 0, -1, 8, '#ffffff', '#e4e6fb'));
    c.strokeStyle = '#e8b050'; c.lineWidth = 3; c.beginPath(); c.arc(-4, -1, 5, -PI * 0.6, PI * 0.9); c.stroke(); c.strokeStyle = '#c08a30'; c.lineWidth = 0.8; c.beginPath(); c.arc(-4, -1, 3, -PI * 0.5, PI * 0.9); c.stroke();
    eye(c, 2, 0, 2.2, '#3a3a6a'); eye(c, 6.4, 0, 1.8, '#3a3a6a'); ell(c, 5, 4, 1.8, 0.9, 'rgba(255,140,170,.5)'); c.restore();
  };
  // 폭풍 골렘: 먹구름 같은 몸통 · 돌 팔다리 · 머리 위 피뢰 뿔 · 몸에 흐르는 번개 줄기
  N.storm_golem = (c, m, t, s) => {
    const k = m.h / 92; c.scale(k, k); const ph = s.walk ? t * 6 : 0, sl = s.atk;
    for (const [x, a] of [[-10, 0], [10, PI]]) { const st = s.walk ? sin(ph + a) * 0.15 : 0; c.save(); c.translate(x, -30); c.rotate(st); rrect(c, -7, 0, 14, 28, 6, vg(c, 0, 28, '#8a98ae', '#3a4a60')); c.restore(); }
    for (const [x, y, r] of [[-14, -58, 15], [8, -64, 17], [-4, -44, 16], [14, -46, 13], [-18, -42, 11]]) ell(c, x, y, r, r * 0.9, rg(c, x, y, r, '#a6b2c6', '#4a586e'));
    const bolt = (p, w) => { c.save(); c.globalCompositeOperation = 'lighter'; line(c, 'rgba(255,230,120,.45)', w + 3, p); c.restore(); line(c, '#fff4a0', w, p); };
    if (Math.floor(t * 6) % 3) bolt([[-8, -66], [-2, -56], [-8, -50], [0, -40]], 1.4); bolt([[10, -60], [6, -52], [12, -46]], 1.1);
    for (const sg of [-1, 1]) { const up = sg > 0 ? -sl * 1.2 : 0; c.save(); c.translate(sg * 26, -62); c.rotate(sg * 0.2 + up); rrect(c, -6, 0, 12, 22, 5, vg(c, 0, 22, '#9aa8bc', '#4a586e')); ell(c, 0, 26, 9, 8, rg(c, 0, 25, 9, '#a6b2c6', '#4a586e')); c.restore(); }
    c.save(); c.translate(0, -80); ell(c, 0, 0, 11, 9, rg(c, 0, -1, 11, '#b0bcd0', '#56647a')); rrect(c, -8, -1, 16, 4, 2, '#1a2230'); glow(c, 0, 1, 7, '#ffe680', 0.8); ell(c, -3, 1, 1.8, 1.1, '#fff4b0'); ell(c, 3, 1, 1.8, 1.1, '#fff4b0');
    line(c, '#c8ccd8', 2, [[0, -8], [0, -20]]); poly(c, '#e8ecf4', [[-2, -18], [0, -26], [2, -18]]); glow(c, 0, -24, 8, '#fff090', 0.8 + 0.2 * sin(t * 8)); c.restore();
  };
  // 천공의 부엉이: 별무늬 가슴 깃 · 큰 둥근 눈 (금빛 테) · 깃털 귀 · 펼친 날개 끝이 하늘빛
  N.thunder_bird = (c, m, t, s) => {
    const k = m.w / 60; c.scale(k, k); const fl = sin(t * 6) * 0.3, bob = sin(t * 3) * 2; c.translate(s.atk * 6, -26 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.translate(8, -4); c.rotate(-0.4 - fl); for (let i = 0; i < 6; i++) { c.save(); c.rotate(-0.15 + i * 0.16); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(12, -4, 26 - i * 1.6, 1); c.quadraticCurveTo(12, 5, 0, 3); c.closePath();
      const g = c.createLinearGradient(0, 0, 26, 0); g.addColorStop(0, '#e8eaff'); g.addColorStop(1, i % 2 ? '#8ea0f0' : '#a8b4f6'); c.fillStyle = g; c.fill(); c.restore(); } c.restore(); }
    c.beginPath(); c.ellipse(0, 0, 12, 15, 0, 0, PI * 2); c.fillStyle = rg(c, 0, -2, 15, '#ffffff', '#c8cef4'); c.fill();
    for (const [x, y] of [[-4, 4], [3, 6], [-1, 10], [4, 0]]) star(c, x, y, 1.8, '#8ea0f0');
    for (const sg of [-1, 1]) poly(c, '#d8dcfa', [[sg * 4, -12], [sg * 10, -20], [sg * 10, -10]]);
    for (const sg of [-1, 1]) { ell(c, sg * 4.6, -6, 4.4, 4.4, '#fff', '#d8a840', 1.2); ell(c, sg * 4.6 + 0.8, -5.6, 2.2, 2.6, '#2a2a5a'); ell(c, sg * 4.6, -7, 0.8, 0.8, '#fff'); }
    poly(c, '#e8b050', [[-1.6, -3], [1.6, -3], [0, 1]]); for (const x of [-3, 3]) line(c, '#e8b050', 1.2, [[x, 14], [x, 17]]);
  };
  // 별의 기사: 새 그림체 머리 · 별 문양 은빛 갑옷 · 별빛 망토 · 별 장검 (사람 모양)
  N.star_knight = (c, m, t, s) => {
    const sp = { trim: '#e8c050', glow: '#ffe680' };
    const gear = { hat: { st: 'starheir', c: '#c8d0e8', k: 'starcirclet', sp }, top: { st: 'starheir', c: '#c0c8e0', k: 'knightcoat', sp }, bottom: { st: 'starheir', c: '#6a7090', k: 'greave', sp }, shoes: { st: 'starheir', c: '#8a90b0', k: 'sabaton', sp }, gloves: { st: 'starheir', c: '#c0c8e0', k: 'gauntlet', sp }, cape: { st: 'starheir', c: '#2a3070', k: 'starflow', sp } };
    const wg = G.ITEMS.wp95_warrior ? G.Outfit.gearOf({ weapon: { tid: 'wp95_warrior' } }).weapon : null; if (wg) gear.weapon = wg;
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look: look({ hairStyle: 'short', hairColor: '#c8d0e8', eye: 'sharp', eyeColor: '#5a7ad0', skin: '#e8dcd4' }, '#c0c8e0', '#6a7090'), gear, cape: '#2a3070', weapon: 'sword', wcolor: '#f0f4ff', scale: 1 });
  };
  // 별자리 깃새: 밤하늘 깃털 (별자리 선) · 긴 혜성 꼬리 · 머리 위 별 세 개 관
  N.comet_spirit = (c, m, t, s) => {
    const k = m.w / 70; c.scale(k, k); const fl = sin(t * 5) * 0.3, bob = sin(t * 2.4) * 3; c.translate(s.atk * 8, -24 + bob);
    for (let i = 0; i < 4; i++) { c.strokeStyle = ['rgba(255,240,180,.7)', 'rgba(180,200,255,.6)', 'rgba(220,170,255,.5)', 'rgba(140,220,255,.45)'][i]; c.lineWidth = 3 - i * 0.5; c.beginPath(); c.moveTo(-10, 2); c.quadraticCurveTo(-24, 6 + i * 2, -40, 12 + i * 4 + sin(t * 3 + i) * 2); c.stroke(); }
    for (let i = 0; i < 4; i++) { const u = (t * 0.7 + i / 4) % 1; star(c, -16 - u * 24, 6 + u * 10, 1.6 * (1 - u) + 0.6, `rgba(255,244,180,${1 - u})`); }
    c.save(); c.translate(-2, -4); c.rotate(-0.6 - fl); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -18, -24, -22); c.quadraticCurveTo(-18, -10, -22, -2); c.quadraticCurveTo(-10, 0, 0, 4); c.closePath(); c.fillStyle = vg(c, -22, 4, '#3a48b0', '#1a2060'); c.fill();
    line(c, 'rgba(220,230,255,.7)', 0.7, [[-4, -2], [-12, -10], [-20, -16]]); for (const [x, y] of [[-4, -2], [-12, -10], [-20, -16], [-16, -4]]) star(c, x, y, 1.6, '#fff4c0'); c.restore();
    c.beginPath(); c.ellipse(2, 0, 14, 9, -0.1, 0, PI * 2); c.fillStyle = rg(c, 2, -2, 14, '#4a58c0', '#1e2468'); c.fill();
    line(c, 'rgba(220,230,255,.6)', 0.7, [[-6, 2], [0, -2], [6, 3]]); for (const [x, y] of [[-6, 2], [0, -2], [6, 3]]) star(c, x, y, 1.5, '#fff4c0');
    c.save(); c.translate(15, -6); ell(c, 0, 0, 7, 6.4, rg(c, 0, -1, 7, '#5a68d0', '#24307a')); eye(c, 2, -1, 2.2, '#c8a040'); poly(c, '#e8b050', [[5, 0], [11, 2], [5, 3]]);
    for (const [x, sz] of [[-3, 2], [0, 2.6], [3, 2]]) { line(c, '#c8a040', 0.8, [[x * 0.6, -5], [x, -10]]); star(c, x, -11, sz, '#fff4b0', '#c8a040'); } glow(c, 0, -11, 8, '#fff0a0', 0.6); c.restore();
  };
  // 뇌운 거인 (정예): 구름 수염의 하늘 장군 · 번개 갈래 왕관 · 구름 망토 · 아래는 뇌운 · 번개 창
  N.storm_guardian = (c, m, t, s) => {
    const k = m.h / 130; c.scale(k, k); const at = s.atk, br = sin(t * 2) * 1.5;
    for (const [x, y, r] of [[-26, -10, 18], [0, -6, 22], [26, -10, 18], [-12, -24, 16], [14, -24, 16]]) ell(c, x, y, r, r * 0.7, rg(c, x, y, r, '#c8d0ec', '#5a6698'));
    if (Math.floor(t * 5) % 2) { c.save(); c.globalCompositeOperation = 'lighter'; line(c, 'rgba(255,240,140,.8)', 1.6, [[-10, 2], [-14, 14], [-8, 20]]); c.restore(); }
    c.save(); c.translate(0, br);
    c.beginPath(); c.moveTo(-34, -96); c.quadraticCurveTo(-46, -60, -30, -28); c.lineTo(30, -28); c.quadraticCurveTo(46, -60, 34, -96); c.quadraticCurveTo(0, -106, -34, -96); c.closePath(); c.fillStyle = vg(c, -100, -28, '#5a6aac', '#2a3466'); c.fill();
    c.beginPath(); c.moveTo(-18, -96); c.quadraticCurveTo(-22, -70, -16, -40); c.lineTo(16, -40); c.quadraticCurveTo(22, -70, 18, -96); c.closePath(); c.fillStyle = vg(c, -96, -40, '#e8ecfa', '#a8b4dc'); c.fill();
    rrect(c, -18, -56, 36, 6, 3, '#e0b040'); star(c, 0, -53, 4, '#fff4b0', '#a07a10');
    for (const [x, y, r] of [[-8, -84, 9], [8, -84, 9], [0, -76, 10], [-10, -72, 7], [10, -72, 7]]) ell(c, x, y, r, r * 0.9, rg(c, x, y, r, '#ffffff', '#d0d8f0'));
    c.save(); c.translate(0, -100); ell(c, 0, 0, 12, 11, rg(c, 0, -1, 12, '#dfe6f8', '#8a98c8')); for (const x of [-4, 4]) { glow(c, x, 0, 6, '#fff0a0', 0.8); ell(c, x, 0, 2, 1.4, '#fffae0'); }
    for (const [x, h] of [[-8, 10], [0, 14], [8, 10]]) poly(c, '#ffe060', [[x - 2, -8], [x + 1, -8 - h * 0.5], [x - 1, -8 - h * 0.5], [x + 2, -8 - h], [x + 3, -8 - h * 0.4], [x + 1, -8 - h * 0.4], [x + 2, -8]], '#a07a10', 0.6); c.restore();
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 36, -90); c.rotate(sg * 0.2 + (sg > 0 ? -at * 0.6 : 0)); rrect(c, -7, 0, 14, 30, 6, vg(c, 0, 30, '#9aa8dc', '#4a5694')); ell(c, 0, 34, 8, 7, '#d8dcf0'); c.restore(); }
    c.save(); c.translate(42, -60); c.rotate(-0.15 - at * 0.5); line(c, '#c8a040', 3, [[0, 40], [0, -50]]); poly(c, '#fff4a0', [[-4, -50], [3, -62], [0, -56], [5, -70], [-2, -58], [1, -62]], '#a07a10', 0.8); glow(c, 1, -62, 12, '#fff090', 0.8); c.restore();
    c.restore();
  };
  // 공허의 그림자: 연기 같은 몸이 위로 갈수록 흩어짐 · 큰 빛나는 두 눈 · 길게 늘어난 그림자 손
  N.void_shade = (c, m, t, s) => {
    const k = m.h / 56; c.scale(k, k); const bob = sin(t * 2) * 3; c.translate(s.atk * 6, -4 + bob);
    for (let i = 0; i < 8; i++) { const u = (t * 0.4 + i / 8) % 1; c.save(); c.globalAlpha *= 0.5 * (1 - u); ell(c, sin(i * 2.3) * 8, -40 - u * 20, 6 * (1 - u * 0.5), 5, '#2a1a44'); c.restore(); }
    c.beginPath(); c.moveTo(-14, -36); c.bezierCurveTo(-18, -14, -12, -2, -6, 4); c.quadraticCurveTo(0, 0, 4, 6); c.quadraticCurveTo(10, -2, 14, 2); c.bezierCurveTo(14, -14, 18, -30, 10, -42); c.quadraticCurveTo(0, -50, -14, -36); c.closePath();
    const g = c.createLinearGradient(0, -48, 0, 6); g.addColorStop(0, '#3a2a5e'); g.addColorStop(1, 'rgba(26,10,42,.3)'); c.fillStyle = g; c.fill();
    for (const x of [-4, 5]) { glow(c, x, -30, 7, '#e070ff', 0.9); ell(c, x, -30, 3, 2, '#f8d0ff'); }
    c.save(); c.translate(12, -22); c.rotate(-0.3 - s.atk * 0.5); c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(10, -4, 18, 0); c.quadraticCurveTo(10, 4, 0, 3); c.closePath(); c.fillStyle = 'rgba(42,26,72,.85)'; c.fill(); for (let i = 0; i < 3; i++) line(c, 'rgba(42,26,72,.85)', 1.2, [[17, 0], [23, -3 + i * 3]]); c.restore();
  };
  // 균열 거미: 몸이 깨진 차원 조각 · 갈라진 틈에서 분홍 빛 · 뾰족한 수정 다리
  N.rift_beast = (c, m, t, s) => {
    const k = m.w / 80; c.scale(k, k); const ph = s.walk ? t * 12 : 0, lunge = sin(s.atk * PI) * 6; c.translate(lunge, 0);
    for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) { const a = ph + i * 1.6 + (sg > 0 ? PI : 0), x = -6 + i * 6, kx = sg > 0 ? 1 : -0.7; const p = [[x, -16], [x + kx * (14 + i * 3), -32 - i * 2 + sin(a) * 3], [x + kx * (22 + i * 4), 0]];
      line(c, '#2a1638', 3, p); line(c, '#ff6fd8', 1, [p[1], [p[1][0] + kx * 2, p[1][1] + 6]]); poly(c, '#e8a0ff', [[p[2][0] - 1.4, -2], [p[2][0] + 1.4, -2], [p[2][0], 2]]); }
    poly(c, vg(c, -36, -6, '#5a3478', '#22102e'), [[-34, -18], [-26, -34], [-8, -36], [2, -24], [-4, -8], [-24, -6]]);
    poly(c, vg(c, -30, -8, '#6a3e88', '#2a1436'), [[0, -24], [8, -30], [20, -26], [22, -14], [12, -8], [2, -12]]);
    const cr = [[-28, -22], [-18, -26], [-14, -18], [-6, -22]]; c.save(); c.globalCompositeOperation = 'lighter'; line(c, 'rgba(255,111,216,.5)', 4, cr); c.restore(); line(c, '#ffc0f0', 1.2, cr);
    for (const [x, y, r] of [[14, -22, 2], [18, -19, 1.6], [11, -18, 1.4], [16, -15, 1.2]]) { glow(c, x, y, r * 3, '#ff6fd8', 0.5); ell(c, x, y, r, r, '#ffd0f4'); }
    for (const [x, y] of [[-20, -40], [-8, -42]]) { const yy = y + sin(t * 2 + x) * 2; poly(c, '#7a4aa0', [[x - 3, yy], [x, yy - 5], [x + 3, yy + 1]]); }
  };
  // 공허의 감시안: 떠 있는 큰 눈알 · 눈꺼풀처럼 감싼 검은 비늘 · 아래로 늘어진 촉수 · 도는 고리
  N.dark_knight = (c, m, t, s) => {
    const k = m.w / 56; c.scale(k, k); const bob = sin(t * 2.2) * 3; c.translate(0, -28 + bob);
    for (let i = 0; i < 4; i++) { const x = -9 + i * 6; c.strokeStyle = '#3a1a5a'; c.lineWidth = 3 - i * 0.3; c.beginPath(); c.moveTo(x, 10); c.bezierCurveTo(x + sin(t * 2 + i) * 6, 20, x - sin(t * 2 + i) * 4, 28, x + sin(t * 3 + i) * 5, 34); c.stroke(); }
    c.save(); c.rotate(-0.3); c.strokeStyle = 'rgba(224,112,255,.7)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 26, 7, 0, PI, PI * 2); c.stroke(); c.restore();
    c.beginPath(); c.ellipse(0, 0, 17, 16, 0, 0, PI * 2); c.fillStyle = rg(c, 0, -2, 17, '#5a2a84', '#1e0a30'); c.fill();
    const op = 0.65 + 0.35 * abs(sin(t * 0.8)) + s.atk * 0.2; c.save(); c.beginPath(); c.ellipse(0, 1, 14, 10 * op, 0, 0, PI * 2); c.clip();
    ell(c, 0, 1, 14, 10, rg(c, 0, 1, 14, '#fff4ff', '#e8c0ff')); ell(c, 2, 1, 7, 7, rg(c, 2, 1, 7, '#ff8af0', '#8a20b0')); ell(c, 2.4, 1, 1.6, 5.4, '#14041e'); ell(c, 0, -2, 1.6, 1.6, '#fff'); c.restore();
    for (const sg of [-1, 1]) { c.save(); c.scale(1, sg); c.beginPath(); c.ellipse(0, 1, 15, 11 * op + 1, 0, PI * 1.05, PI * 1.95); c.strokeStyle = '#14041e'; c.lineWidth = 2; c.stroke(); c.restore(); }
    c.save(); c.rotate(-0.3); c.strokeStyle = 'rgba(224,112,255,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 26, 7, 0, 0, PI); c.stroke(); for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1; if (sin(a) > 0) star(c, cos(a) * 26, sin(a) * 7, 2.4, '#f8c0ff'); } c.restore();
  };
  // 장막의 사제: 얼굴을 덮은 검은 장막 (눈 문양 자수) · 보라 예복 · 떠 있는 장막 천 · 손에 어둠 구슬
  N.cult_mage = (c, m, t, s) => {
    const k = m.h / 72; c.scale(k, k); const bob = sin(t * 2) * 1.5, cast = s.atk; c.translate(0, bob);
    c.beginPath(); c.moveTo(-10, -52); c.quadraticCurveTo(-18, -24, -16, 0); for (let i = 0; i < 5; i++) c.quadraticCurveTo(-13 + i * 6.4 + 3.2, 3 + (i % 2) * 3, -9.6 + i * 6.4, 0); c.quadraticCurveTo(18, -24, 10, -52); c.closePath();
    c.fillStyle = vg(c, -52, 0, '#5a3482', '#24123a'); c.fill(); line(c, '#e070ff', 1, [[0, -50], [0, -2]]); for (const y of [-38, -22]) { ell(c, 0, y, 3.4, 2, '#e8c8ff'); ell(c, 0, y, 1, 1, '#a020c0'); }
    c.save(); c.translate(0, -60); ell(c, 0, 0, 9, 10, '#e8d8d0'); c.beginPath(); c.moveTo(-11, -6); c.quadraticCurveTo(0, -16, 11, -6); c.lineTo(10, 10 + sin(t * 2) * 1.5); c.quadraticCurveTo(0, 13, -10, 10); c.closePath(); c.fillStyle = vg(c, -12, 12, '#2a1440', '#140a22'); c.fill();
    ell(c, 2, 2, 4, 2.4, '#e8c8ff'); ell(c, 2.4, 2, 1.2, 1.6, '#a020c0'); glow(c, 2, 2, 7, '#e070ff', 0.5); c.strokeStyle = '#e070ff'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(0, -14, 10, 3, 0, 0, PI * 2); c.stroke(); c.restore();
    for (let i = 0; i < 2; i++) { c.save(); c.translate(-14 + i * 4, -46 + i * 10); c.rotate(sin(t * 2 + i) * 0.2); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, 6, -14, 4); c.quadraticCurveTo(-8, 10, 0, 6); c.closePath(); c.fillStyle = 'rgba(42,20,64,.75)'; c.fill(); c.restore(); }
    c.save(); c.translate(10, -40); c.rotate(-0.4 - cast * 0.7); rrect(c, -3, -2, 14, 6, 3, '#4a2a6e'); ell(c, 13, 1, 2.6, 2.6, '#e8d8d0'); glow(c, 16, -2, 12 + cast * 6, '#e070ff', 0.8); ell(c, 16, -2, 4.4, 4.4, rg(c, 16, -2, 4.4, '#ffc0ff', '#6a10a0')); c.restore();
  };
  // 그림자 집행관 (정예): 거대한 갑주 · 투구 틈의 붉은 눈 · 너덜 망토 · 큰 낫
  N.executor = (c, m, t, s) => {
    const k = m.h / 118; c.scale(k, k); const ph = s.walk ? t * 6 : 0, sw = s.atk;
    c.beginPath(); c.moveTo(-26, -88); c.quadraticCurveTo(-36, -40, -30, 0); for (let i = 0; i < 6; i++) c.lineTo(-30 + i * 10 + 5, (i % 2 ? -10 : 2) + sin(t * 2 + i) * 3); c.lineTo(30, 0); c.quadraticCurveTo(36, -40, 26, -88); c.closePath(); c.fillStyle = vg(c, -88, 0, '#2a1e40', '#0e0818'); c.fill();
    for (const [x, a] of [[-10, 0], [10, PI]]) { const st = s.walk ? sin(ph + a) * 0.15 : 0; c.save(); c.translate(x, -34); c.rotate(st); rrect(c, -7, 0, 14, 32, 4, vg(c, 0, 32, '#5a4a78', '#2a2040')); c.restore(); }
    c.beginPath(); c.moveTo(-24, -90); c.lineTo(24, -90); c.lineTo(18, -36); c.lineTo(-18, -36); c.closePath(); c.fillStyle = vg(c, -90, -36, '#5a4a78', '#2e2444'); c.fill();
    for (let i = 0; i < 3; i++) line(c, 'rgba(20,10,30,.5)', 1.2, [[-16, -78 + i * 12], [16, -78 + i * 12]]);
    c.save(); c.globalCompositeOperation = 'lighter'; line(c, 'rgba(224,96,255,.5)', 4, [[-2, -82], [4, -70], [-4, -60], [2, -48]]); c.restore(); line(c, '#f0b0ff', 1.2, [[-2, -82], [4, -70], [-4, -60], [2, -48]]);
    for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(sg * 14, -92); c.quadraticCurveTo(sg * 34, -98, sg * 32, -84); c.lineTo(sg * 18, -82); c.closePath(); c.fillStyle = vg(c, -98, -82, '#6a5a8a', '#2e2444'); c.fill(); poly(c, '#7a6a9a', [[sg * 26, -94], [sg * 32, -108], [sg * 30, -92]]); }
    c.save(); c.translate(0, -102); c.beginPath(); c.moveTo(-12, 8); c.lineTo(-13, -6); c.quadraticCurveTo(0, -18, 13, -6); c.lineTo(12, 8); c.closePath(); c.fillStyle = vg(c, -14, 8, '#6a5a8a', '#2e2444'); c.fill(); poly(c, '#7a6a9a', [[-2, -12], [0, -26], [2, -12]]);
    rrect(c, -9, -2, 18, 3.4, 1.4, '#0a0610'); glow(c, 0, 0, 9, '#ff3050', 0.8); ell(c, -4, -0.4, 2, 1, '#ff8090'); ell(c, 4, -0.4, 2, 1, '#ff8090'); c.restore();
    c.save(); c.translate(26, -70); c.rotate(-0.3 - sw * 1.4); line(c, '#1a1424', 4, [[0, 50], [0, -46]]); c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(30, -50, 40, -28); c.quadraticCurveTo(24, -38, 2, -36); c.closePath();
    c.fillStyle = vg(c, -50, -28, '#e8c0ff', '#8a40c0'); c.fill(); glow(c, 20, -40, 18, '#e060ff', 0.6); c.restore();
  };
  // 공허 성기사: 타락한 성기사 갑옷 (금 테가 보라로 물듦) · 뿔 투구 · 깨진 방패 · 깃발 창
  N.void_serpent = (c, m, t, s) => {
    const k = m.h / 96; c.scale(k, k); const ph = s.walk ? t * 7 : 0, at = s.atk;
    for (const [x, a] of [[-7, 0], [7, PI]]) { const st = s.walk ? sin(ph + a) * 0.18 : 0; c.save(); c.translate(x, -30); c.rotate(st); rrect(c, -6, 0, 12, 28, 4, vg(c, 0, 28, '#6a5a8a', '#2e2444')); c.restore(); }
    c.beginPath(); c.moveTo(-14, -74); c.quadraticCurveTo(-24, -40, -18, -10); c.lineTo(18, -10); c.quadraticCurveTo(24, -40, 14, -74); c.closePath(); c.fillStyle = vg(c, -74, -10, '#2a1a44', '#120a1e'); c.fill();
    c.beginPath(); c.moveTo(-16, -72); c.lineTo(16, -72); c.lineTo(12, -32); c.lineTo(-12, -32); c.closePath(); c.fillStyle = vg(c, -72, -32, '#7a6a9a', '#3a2e54'); c.fill(); line(c, '#c86af0', 1.6, [[-14, -70], [14, -70]]); star(c, 0, -54, 5, '#ff8ae8', '#8a20a0');
    for (const sg of [-1, 1]) { ell(c, sg * 16, -70, 8, 6, vg(c, -76, -64, '#8a7aaa', '#3a2e54')); line(c, '#c86af0', 1, [[sg * 10, -66], [sg * 22, -68]]); }
    c.save(); c.translate(0, -84); ell(c, 0, 0, 10, 11, vg(c, -11, 11, '#8a7aaa', '#3a2e54')); rrect(c, -7, -1, 14, 3, 1.4, '#0a0610'); ell(c, -3, 0.4, 1.6, 1, '#ff5a8a'); ell(c, 3, 0.4, 1.6, 1, '#ff5a8a');
    for (const sg of [-1, 1]) { c.strokeStyle = '#4a3a6a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sg * 7, -6); c.quadraticCurveTo(sg * 16, -10, sg * 14, -20); c.stroke(); } c.restore();
    c.save(); c.translate(-16, -48); c.beginPath(); c.moveTo(-10, -14); c.lineTo(10, -14); c.lineTo(9, 4); c.quadraticCurveTo(0, 16, -9, 4); c.closePath(); c.fillStyle = vg(c, -14, 14, '#6a5a8a', '#2e2444'); c.fill(); c.strokeStyle = '#c86af0'; c.lineWidth = 1.2; c.stroke();
    star(c, 0, -2, 5, '#ff8ae8'); line(c, '#0a0610', 1.2, [[3, -14], [0, -6], [4, 2]]); c.restore();
    c.save(); c.translate(14, -54); c.rotate(-0.1 - at * 1.3); line(c, '#3a2a4a', 3, [[0, 36], [0, -44]]); poly(c, vg(c, -54, -42, '#ffc0f4', '#c040e0'), [[-3, -42], [0, -56], [3, -42]]); poly(c, '#8a30b0', [[1, -40], [14, -36 + sin(t * 4) * 2], [1, -30]]); c.restore();
  };
  // 녹스의 전령: 밤하늘 긴 옷 (별 반짝) · 별 가시 후광 · 하얀 가면 · 초승달 지팡이
  N.abyss_eye = (c, m, t, s) => {
    const k = m.h / 84; c.scale(k, k); const bob = sin(t * 2) * 2, cast = s.atk; c.translate(0, -4 + bob);
    c.save(); c.translate(0, -66); for (let i = 0; i < 9; i++) { const a = -PI * 0.9 + i * PI * 0.8 / 8 + sin(t + i) * 0.02; c.save(); c.rotate(a + PI / 2); poly(c, i % 2 ? '#d090ff' : '#a060e0', [[-1.6, -12], [0, -24 - (i % 3) * 3], [1.6, -12]]); c.restore(); } glow(c, 0, 0, 26, '#c080ff', 0.4); c.restore();
    c.beginPath(); c.moveTo(-12, -58); c.quadraticCurveTo(-20, -24, -18, 0); for (let i = 0; i < 6; i++) c.quadraticCurveTo(-15 + i * 6 + 3, 4 + (i % 2) * 3, -12 + i * 6, 1); c.quadraticCurveTo(20, -24, 12, -58); c.closePath(); c.fillStyle = vg(c, -58, 0, '#3a2460', '#0e0618'); c.fill();
    c.save(); c.clip(); for (let i = 0; i < 16; i++) { const x = ((i * 37) % 32) - 16, y = -54 + ((i * 53) % 54); ell(c, x, y, 0.9, 0.9, `rgba(255,255,255,${0.4 + 0.4 * sin(t * 2 + i)})`); } c.restore();
    c.save(); c.translate(0, -66); c.beginPath(); c.ellipse(0, 0, 11, 12, 0, 0, PI * 2); c.fillStyle = '#1a0e2a'; c.fill(); ell(c, 2, 1, 7, 9, vg(c, -8, 10, '#ffffff', '#c8c0e0')); for (const x of [-1, 5]) { ell(c, x, -1, 1.8, 1, '#3a1a5a'); glow(c, x, -1, 4, '#c080ff', 0.6); } line(c, '#a080d0', 0.8, [[2, 5], [2, 8]]); c.restore();
    c.save(); c.translate(14, -40); c.rotate(-0.15 - cast * 0.4); line(c, '#2a1a3a', 2.6, [[0, 40], [0, -26]]); c.beginPath(); c.arc(0, -32, 8, PI * 0.3, PI * 1.7); c.arc(3, -32, 6, PI * 1.6, PI * 0.4, true); c.closePath(); c.fillStyle = '#e8d8ff'; c.fill(); glow(c, 0, -32, 12 + cast * 6, '#c080ff', 0.7); c.restore();
  };
  // 영웅의 잔영 (정예): 반투명한 옛 영웅 · 새 그림체 머리 · 별빛 망토 · 빛나는 장검 · 발끝이 빛으로 흩어짐
  N.trial_echo = (c, m, t, s) => {
    c.save(); c.globalAlpha *= 0.78;
    const sp = { trim: '#bfe0ff', glow: '#9ad0ff' };
    const gear = { hat: { st: 'mithril', c: '#9ac8ff', k: 'plume', sp }, top: { st: 'mithril', c: '#7ab0f0', k: 'surcoat', sp: Object.assign({ cloth: '#3a6ac0' }, sp) }, bottom: { st: 'mithril', c: '#5a8ad0', k: 'greave', sp }, shoes: { st: 'mithril', c: '#7aa8e8', k: 'sabaton', sp }, gloves: { st: 'mithril', c: '#9ac8ff', k: 'gauntlet', sp }, cape: { st: 'mithril', c: '#3a5aa0', k: 'long', sp } };
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look: look({ hairStyle: 'long', hairColor: '#cfe4ff', eye: 'sharp', eyeColor: '#bfe8ff', skin: '#d8ecff' }, '#9ac8ff', '#5a8ad0'), gear, cape: '#3a5aa0', weapon: 'sword', wcolor: '#e8f6ff', scale: 1 });
    c.restore();
    for (let i = 0; i < 8; i++) { const u = (t * 0.5 + i / 8) % 1; ell(c, -10 + i * 3 + sin(t + i) * 2, -2 - u * 30, 1.2 * (1 - u) + 0.3, 1.2 * (1 - u) + 0.3, `rgba(200,230,255,${0.8 * (1 - u)})`); }
  };
})();
