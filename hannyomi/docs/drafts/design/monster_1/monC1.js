// 몬스터 1단계 (프롤로그~2장) 나: 새 디자인 14종 (젤리 · 갓버섯 · 들쥐 · 허수아비는 monB.js G.MonNew)
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1; c.stroke(); } };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris, look = 0.25) => { ell(c, x, y, r, r * 1.15, '#fff', '#2a2a32', 0.6); ell(c, x + r * look, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a36'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const blush = (c, x, y, r) => ell(c, x, y, r, r * 0.55, 'rgba(255,120,140,.45)');
  const N = G.MonNewC = {};
  const walk = (s, t, sp = 10) => s.walk ? t * sp : 0;

  // 꼬마 게: 산호빛 둥근 등딱지 + 따개비 · 한쪽 큰 집게 · 눈자루 · 옆걸음
  N.crab = (c, m, t, s) => {
    const k = m.w / 50; c.scale(k, k); const ph = walk(s, t, 14), bob = s.walk ? abs(sin(ph)) * 1.5 : sin(t * 2) * 0.5;
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) { const a = ph + i * 1.3 + (sg > 0 ? PI : 0), x = sg * (8 + i * 4); line(c, '#b04e24', 2.4, [[x, -9], [x + sg * 6, -10 + sin(a) * 2], [x + sg * 9, -1]]); }
    c.translate(0, -bob);
    ell(c, 0, -14, 17, 11, rg(c, 0, -16, 18, '#ffb080', '#d8602e'), '#8a3a18', 1.4);
    for (const [x, y, r] of [[-8, -20, 2.2], [-3, -22, 1.6], [6, -21, 2]]) ell(c, x, y, r, r * 0.8, '#fff2e0', '#c08a6a', 0.6);
    ell(c, -6, -17, 6, 2.4, 'rgba(255,255,255,.35)');
    for (const sg of [-1, 1]) { line(c, '#b04e24', 1.6, [[4 + sg * 4, -22], [5 + sg * 5, -29]]); eye(c, 5 + sg * 5, -31, 2.8); }
    const op = s.atk > 0 ? 0.6 : abs(sin(t * 2)) * 0.25;
    c.save(); c.translate(15, -14); c.rotate(-0.5 - s.atk * 0.5); line(c, '#c8582a', 3, [[0, 0], [7, -3]]);   // 큰 집게
    c.translate(10, -4); c.save(); c.rotate(-op); ell(c, 3, -2, 6, 3.6, '#f07a42', '#8a3a18', 1); c.restore(); c.save(); c.rotate(op * 0.6); ell(c, 3, 2, 5, 2.6, '#e86a36', '#8a3a18', 1); c.restore(); c.restore();
    ell(c, -15, -10, 3, 2.4, '#e86a36', '#8a3a18', 0.8);   // 작은 집게
    c.fillStyle = '#7a2a10'; c.beginPath(); c.arc(2, -11, 2, 0, PI); c.fill(); blush(c, -6, -12, 2.4); blush(c, 11, -12, 2.4);
  };
  // 포자 방울: 둥실 떠 있는 솜털 포자 공 + 작은 버섯 모자 + 떨어지는 포자 가루
  N.spore = (c, m, t, s) => {
    const k = m.w / 42 * 1.3; c.scale(k, k); const bob = sin(t * 2.4) * 3; c.translate(s.atk * 4, -6 + bob);
    for (let i = 0; i < 5; i++) { const u = (t * 0.6 + i / 5) % 1; ell(c, -10 + i * 5 + sin(t + i) * 3, -6 + u * 10, 1.4 * (1 - u) + 0.4, 1.4 * (1 - u) + 0.4, `rgba(220,190,255,${0.7 * (1 - u)})`); }
    for (let i = 0; i < 18; i++) { const a = i / 18 * PI * 2 + sin(t * 2 + i) * 0.05; line(c, 'rgba(230,210,255,.8)', 1, [[cos(a) * 15, -20 + sin(a) * 15], [cos(a) * 19, -20 + sin(a) * 19]]); ell(c, cos(a) * 19.5, -20 + sin(a) * 19.5, 1.1, 1.1, '#f4ecff'); }
    ell(c, 0, -20, 15, 15, rg(c, 0, -20, 16, '#e8d4ff', '#9a6ad0'), '#6a3a9a', 1.2);
    for (const [x, y, r] of [[-7, -14, 2.4], [6, -27, 1.8], [8, -13, 1.6]]) ell(c, x, y, r, r, 'rgba(120,70,170,.45)');
    c.save(); c.translate(1, -34); c.rotate(-0.15 + sin(t * 3) * 0.08); c.beginPath(); c.moveTo(-8, 2); c.quadraticCurveTo(0, -9, 8, 2); c.closePath(); c.fillStyle = vg(c, -6, 2, '#ff8a9a', '#c84a6a'); c.fill(); c.strokeStyle = '#8a2a4a'; c.lineWidth = 0.8; c.stroke();
    ell(c, -3, -1.5, 1.4, 1, '#fff'); ell(c, 3, -2.5, 1, 0.8, '#fff'); c.restore();
    eye(c, -5, -21, 2.8, '#4a2a6a'); eye(c, 5, -21, 2.8, '#4a2a6a'); blush(c, -9, -16, 2.6); blush(c, 9, -16, 2.6);
    c.strokeStyle = '#4a2a6a'; c.lineWidth = 1; c.beginPath(); c.arc(0, -16, 2, 0.1, PI - 0.1); c.stroke();
  };
  // 가시 조개: 소라처럼 뾰족한 왕관 가시 조개 · 열리면 진주와 눈 · 껍데기에 물결무늬
  N.spikeshell = (c, m, t, s) => {
    const k = m.w / 54; c.scale(k, k); const op = s.atk > 0 ? 0.55 : 0.18 + abs(sin(t * 1.6)) * 0.12;
    c.beginPath(); c.ellipse(0, -7, 24, 8, 0, 0, PI * 2); c.fillStyle = vg(c, -12, 0, '#9ab4d8', '#4a6488'); c.fill(); c.strokeStyle = '#2a3a58'; c.lineWidth = 1.2; c.stroke();   // 아래 껍데기
    ell(c, 0, -10, 18, 5, '#ffd0dc', '#c07a8a', 0.8); glow(c, 4, -12, 10, '#ffffff', 0.5); ell(c, 4, -12, 4.2, 4.2, rg(c, 4, -12, 4.2, '#ffffff', '#d8dcf0'), '#9aa0c0', 0.6);   // 진주
    eye(c, -7, -12, 2.6, '#2a3a58'); eye(c, -1, -12, 2.6, '#2a3a58');
    c.save(); c.translate(-22, -9); c.rotate(-op);   // 위 껍데기 (경첩은 뒤)
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(4, -22, 24, -24); c.quadraticCurveTo(44, -22, 48, 0); c.closePath(); c.fillStyle = vg(c, -24, 0, '#c8daf0', '#6a86b0'); c.fill(); c.strokeStyle = '#2a3a58'; c.lineWidth = 1.3; c.stroke();
    for (let i = 1; i < 6; i++) { c.strokeStyle = 'rgba(40,60,100,.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(24, -1); c.lineTo(4 + i * 7, -20 + abs(i - 3) * 3); c.stroke(); }
    for (let i = 0; i < 6; i++) { const x = 6 + i * 7.5, y = -18 - (3 - abs(i - 2.5)) * 2.4; poly(c, vg(c, y - 9, y, '#f0f6ff', '#8aa0c8'), [[x - 2.6, y + 2], [x + 1, y - 8 - (i % 2) * 2], [x + 3, y + 2]], '#2a3a58', 0.8); }
    c.restore();
  };
  // 바다 도마뱀: 지느러미 볏 · 아가미 깃 · 꼬리 지느러미 · 물방울 반점, 몸을 S자로 흔들며 걸음
  N.sealizard = (c, m, t, s) => {
    const k = m.w / 72 * 1.15; c.scale(k, k * 1.2); const ph = walk(s, t, 12), sw = sin(ph) * 0.12;
    for (const [x, a] of [[-12, 0], [10, PI]]) for (const sg of [-1, 1]) { const st = s.walk ? sin(ph + a + (sg > 0 ? PI : 0)) * 4 : 0; line(c, '#1f7a6a', 3, [[x, -9], [x + st + 3, -2], [x + st + 6, 0]]); }
    c.save(); c.translate(-18, -10); c.rotate(sw); c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-14, -2, -26, -6); c.quadraticCurveTo(-34, -12, -36, -4); c.quadraticCurveTo(-30, 2, -26, 0); c.quadraticCurveTo(-14, 6, 0, 5); c.closePath();
    c.fillStyle = vg(c, -12, 6, '#5ad0c0', '#2a8a7a'); c.fill(); c.strokeStyle = '#14544a'; c.lineWidth = 1; c.stroke(); c.restore();
    c.beginPath(); c.ellipse(0, -11, 20, 8.5, -sw * 0.5, 0, PI * 2); c.fillStyle = vg(c, -20, -3, '#6ae0d0', '#2a8a7a'); c.fill(); c.strokeStyle = '#14544a'; c.lineWidth = 1.2; c.stroke();
    ell(c, 2, -7, 14, 3.4, 'rgba(230,255,240,.5)');
    c.beginPath(); c.moveTo(-14, -17); for (let i = 0; i <= 6; i++) c.quadraticCurveTo(-14 + i * 4.6 - 2.3, -26 + sin(t * 4 + i) * 1.2, -14 + i * 4.6, -18 + abs(i - 3) * 0.3); c.closePath(); c.fillStyle = vg(c, -26, -17, '#7ad8ff', '#2a8ab0'); c.fill(); c.strokeStyle = '#1a5a7a'; c.lineWidth = 0.8; c.stroke();   // 등 지느러미
    for (const [x, y] of [[-8, -13], [2, -15], [10, -12]]) ell(c, x, y, 1.6, 1.6, 'rgba(255,255,255,.55)');
    c.save(); c.translate(20, -14); c.rotate(-0.1 + (s.atk > 0 ? -0.2 : 0)); ell(c, 4, 0, 10, 7, vg(c, -7, 7, '#7ae8d8', '#2a9a8a'), '#14544a', 1.2);
    for (const [a, l] of [[-0.9, 7], [-0.5, 8], [-0.1, 6]]) { c.save(); c.translate(-2, -2); c.rotate(a - PI); ell(c, l * 0.5, 0, l * 0.5, 1.6, '#ff9ab0', '#c0506a', 0.6); c.restore(); }   // 아가미 깃
    eye(c, 6, -2, 2.8, '#1a3a3a'); line(c, '#14544a', 1, [[9, 3], [13, 2.4]]); if (s.atk > 0) ell(c, 14, 3, 2.4, 1.2, '#ff7a90'); c.restore();
  };
  // 바람 정령: 잎사귀 망토를 두른 작은 바람 요정 · 리본처럼 풀리는 바람 꼬리 · 등 뒤 회오리
  N.windspirit = (c, m, t, s) => {
    const k = m.h / 50; c.scale(k, k); const bob = sin(t * 2.6) * 3; c.translate(s.atk * 5, -8 + bob);
    for (let j = 0; j < 3; j++) { c.strokeStyle = `rgba(160,240,250,${0.55 - j * 0.15})`; c.lineWidth = 2.4 - j * 0.6; c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, a = u * PI * 2.6 + t * 4 + j; const x = -4 - u * 16 + cos(a) * (4 + u * 4), y = -8 + u * 10 + sin(a) * (3 + u * 3); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    c.beginPath(); c.moveTo(-10, -12); c.quadraticCurveTo(-14, 0, -4, 4); c.quadraticCurveTo(6, 2, 10, -12); c.quadraticCurveTo(0, -6, -10, -12); c.fillStyle = vg(c, -12, 4, '#c8f6ff', '#5ac8d8'); c.fill(); c.strokeStyle = '#2a8a9a'; c.lineWidth = 0.9; c.stroke();
    ell(c, 0, -22, 11, 10.5, rg(c, 0, -22, 11, '#ffffff', '#b8eef8'), '#4ab0c0', 1.1);
    for (const [x, y, a, col] of [[-9, -30, -0.8, '#7acf6a'], [-2, -33, -0.2, '#9ade7a'], [6, -31, 0.5, '#6abf5a']]) { c.save(); c.translate(x, y); c.rotate(a + sin(t * 3 + x) * 0.1); c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-4, -5, 0, -10); c.quadraticCurveTo(4, -5, 0, 2); c.fillStyle = col; c.fill(); line(c, '#3a7a2a', 0.6, [[0, 1], [0, -8]]); c.restore(); }
    eye(c, -3.5, -21, 2.4, '#2a6a7a'); eye(c, 4, -21, 2.4, '#2a6a7a'); blush(c, -7, -17, 2); blush(c, 8, -17, 2); line(c, '#2a6a7a', 0.9, [[-1, -16.5], [1, -15.6], [3, -16.5]]);
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 9, -10); c.rotate(sg * (0.6 + sin(t * 4) * 0.2)); ell(c, sg * 3, 0, 4, 1.6, '#e0faff', '#4ab0c0', 0.6); c.restore(); }
  };
  // 돌풍 산양: 구름 같은 양털 · 크게 말린 뿔 · 발목에 바람 깃털 · 달릴 때 바람 자국
  N.wingboar = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const ph = walk(s, t, 12), lunge = sin(s.atk * PI) * 8; c.translate(lunge, s.walk ? -abs(sin(ph)) * 2 : 0);
    if (s.walk || s.atk > 0) for (let i = 0; i < 3; i++) line(c, `rgba(200,230,255,${0.5 - i * 0.12})`, 1.6, [[-34 - i * 6, -22 + i * 6], [-46 - i * 8, -22 + i * 6]]);
    for (const [x, a, col] of [[-16, 0, '#3a3238'], [-8, PI, '#4a4048'], [12, PI * 0.5, '#3a3238'], [20, PI * 1.5, '#4a4048']]) { const st = s.walk ? sin(ph + a) * 0.45 : 0; c.save(); c.translate(x, -14); c.rotate(st); rrect(c, -2.4, 0, 4.8, 14, 2, col); ell(c, 0.4, 14, 3, 1.6, '#1a1418');
      c.save(); c.translate(-2, 9); c.rotate(-0.8); ell(c, -3, 0, 4, 1.4, '#e8f4ff', '#8aaac8', 0.5); c.restore(); c.restore(); }
    for (const [x, y, r] of [[-18, -24, 10], [-6, -30, 12], [8, -28, 11], [-12, -16, 9], [4, -18, 10], [16, -20, 8]]) ell(c, x, y, r, r * 0.85, rg(c, x, y, r, '#ffffff', '#d8dce8'), '#a0a4b8', 1);
    c.save(); c.translate(24, -30); c.rotate(s.atk * 0.3);
    c.beginPath(); c.ellipse(4, 2, 8, 9, -0.3, 0, PI * 2); c.fillStyle = vg(c, -8, 10, '#5a5058', '#2a2228'); c.fill(); c.strokeStyle = '#140c10'; c.lineWidth = 1; c.stroke();
    ell(c, 9, 8, 4, 3, '#3a3238'); ell(c, 2, -6, 5, 3.4, '#ffffff', '#a0a4b8', 0.6);
    c.strokeStyle = '#c8a46a'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.arc(-1, -2, 7, -PI * 0.9, PI * 0.55); c.stroke(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { const a = -PI * 0.8 + i * 0.35; line(c, '#8a6a3a', 1, [[-1 + cos(a) * 5.5, -2 + sin(a) * 5.5], [-1 + cos(a) * 8.6, -2 + sin(a) * 8.6]]); }
    ell(c, 7, 0, 1.8, 2, '#ffd86a', '#3a2a10', 0.5); ell(c, 7.2, 0, 1.6, 0.6, '#1a1010'); c.restore();
  };
  // 도적 견습: 새 그림체 머리 · 녹색 두건 · 가죽 조끼 · 단검 (사람 모양)
  const look = (o, top, bot) => G.LOOKS.toDraw(Object.assign(G.LOOKS.def(o.gender || 'm'), o), top, bot);
  N.banditnov = (c, m, t, s) => {
    const sp = { trim: '#c8a050' };
    const gear = { hat: { st: 'leather', c: '#3a6a3a', k: 'bandana', sp }, top: { st: 'leather', c: '#5a4a3a', k: 'vest', sp }, bottom: { st: 'leather', c: '#3a3a44', k: 'pants', sp }, shoes: { st: 'leather', c: '#3a2a20', k: 'boot', sp }, gloves: { st: 'leather', c: '#4a3a2a', k: 'glove', sp } };
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look: look({ hairStyle: 'spiky', hairColor: '#3a2a1a', eye: 'sharp', eyeColor: '#6a4a2a', skin: '#f0c8a0' }, '#5a4a3a', '#3a3a44'), gear, hatColor: '#3a6a3a', weapon: 'dagger', wcolor: '#b0b0b8', scale: 1 });
  };
  // 도적 궁수: 새 그림체 머리 · 갈색 천 두건(어깨까지) · 짧은 망토 · 활
  N.banditarch = (c, m, t, s) => {
    const sp = { trim: '#a07a40' };
    const gear = { hat: { st: 'desert', c: '#6a4a30', k: 'desertwrap', sp }, top: { st: 'leather', c: '#5a4a3a', k: 'vest', sp }, bottom: { st: 'leather', c: '#3a3028', k: 'pants', sp }, shoes: { st: 'leather', c: '#3a2a20', k: 'boot', sp }, gloves: { st: 'leather', c: '#4a3a2a', k: 'glove', sp }, cape: { st: 'traveler', c: '#4a3a2a', k: 'capelet', sp } };
    D.humanoid(c, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'proj', look: look({ gender: 'f', hairStyle: 'long', hairColor: '#2a1a10', eye: 'sharp', eyeColor: '#5a3a1a', skin: '#e8c098' }, '#5a4a3a', '#3a3028'), gear, hatColor: '#6a4a30', cape: '#4a3a2a', weapon: 'bow', wcolor: '#8a5a2a', scale: 1 });
  };
  // 이끼 덩어리: 이끼 덮인 둥근 바위 젤리 · 늘어진 이끼 가닥 · 작은 버섯과 꽃 · 반짝이는 이슬
  N.moss_slime = (c, m, t, s) => {
    const k = m.w / 46; c.scale(k, k); const sq = 1 + sin(t * 3 + (s.walk ? t * 6 : 0)) * 0.05; c.scale(1 / sq, sq);
    c.beginPath(); c.moveTo(-20, 0); c.bezierCurveTo(-24, -14, -14, -28, 0, -28); c.bezierCurveTo(14, -28, 24, -14, 20, 0); c.closePath(); c.fillStyle = rg(c, 0, -14, 24, '#a8d878', '#4a8a2a'); c.fill(); c.strokeStyle = '#2a5a14'; c.lineWidth = 1.4; c.stroke();
    for (let i = 0; i < 7; i++) { const x = -15 + i * 5; c.beginPath(); c.moveTo(x - 2.4, -4); c.quadraticCurveTo(x, 3 + (i % 2) * 2 + sin(t * 2 + i), x + 2.4, -4); c.fillStyle = '#5a9a3a'; c.fill(); }   // 늘어진 이끼
    for (const [x, y, r] of [[-10, -20, 3], [8, -22, 2.4], [12, -12, 2], [-14, -10, 2.2]]) ell(c, x, y, r, r * 0.7, 'rgba(60,110,30,.45)');
    c.save(); c.translate(-6, -27); poly(c, '#e8dcc0', [[-1, 0], [1, 0], [1.2, -5], [-1.2, -5]]); c.beginPath(); c.moveTo(-5, -5); c.quadraticCurveTo(0, -12, 5, -5); c.closePath(); c.fillStyle = '#e04a3a'; c.fill(); ell(c, -1.5, -7, 1, 0.8, '#fff'); ell(c, 2, -6.5, 0.8, 0.6, '#fff'); c.restore();
    c.save(); c.translate(7, -28); for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * PI * 0.4 + t * 0.3); ell(c, 0, -2.4, 1.6, 2.4, '#fff8e0'); c.restore(); } ell(c, 0, 0, 1.4, 1.4, '#ffd040'); c.restore();
    glow(c, 14, -18, 4, '#e8fff0', 0.6 + 0.3 * sin(t * 3)); ell(c, 14, -18, 1.2, 1.2, '#ffffff');
    eye(c, -5, -14, 2.8, '#1e3a10'); eye(c, 5, -14, 2.8, '#1e3a10'); blush(c, -10, -9, 2.4); blush(c, 10, -9, 2.4);
  };
  // 가시 딱정벌레: 윤기 나는 초록 등껍질 + 가시 덩굴 · 큰 뿔 · 6다리 걸음
  N.thorn_beetle = (c, m, t, s) => {
    const k = m.w / 56; c.scale(k, k); const ph = walk(s, t, 14), lunge = sin(s.atk * PI) * 6; c.translate(lunge, 0);
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) { const a = ph + i * 2.1 + (sg > 0 ? PI : 0), x = -10 + i * 9; line(c, '#1a2a10', 2, [[x, -10], [x + 3 + sin(a) * 2, -4], [x + 5 + sin(a) * 3, 0]]); }
    c.beginPath(); c.ellipse(-2, -15, 20, 12, 0, PI, 0); c.lineTo(18, -10); c.quadraticCurveTo(-2, -4, -22, -10); c.closePath(); c.fillStyle = rg(c, -6, -20, 22, '#9ad060', '#2a5a14'); c.fill(); c.strokeStyle = '#142a08'; c.lineWidth = 1.4; c.stroke();
    line(c, '#142a08', 1.2, [[-2, -27], [-2, -8]]); ell(c, -10, -21, 6, 2.6, 'rgba(255,255,255,.4)');
    c.strokeStyle = '#4a3a1a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-20, -14); c.bezierCurveTo(-12, -30, 4, -18, 14, -24); c.stroke();   // 가시 덩굴
    for (let i = 0; i < 6; i++) { const u = i / 5, x = -18 + u * 32, y = -16 - sin(u * PI) * 10; poly(c, '#d8b060', [[x - 1.6, y], [x + 1, y - 5], [x + 1.8, y]], '#6a4a10', 0.6); }
    ell(c, 0, -26, 2, 1.4, '#ff6a8a'); ell(c, 10, -23, 1.6, 1.2, '#ff8aa0');   // 덩굴 꽃
    c.save(); c.translate(18, -13); ell(c, 4, 0, 7, 6, vg(c, -6, 6, '#4a7a2a', '#1a3a0a'), '#142a08', 1.2);
    c.strokeStyle = '#3a2a10'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(8, -3); c.quadraticCurveTo(16, -6, 16, -16); c.stroke(); line(c, '#3a2a10', 2, [[14, -10], [18, -11]]);
    ell(c, 7, -1, 2, 2, '#ffd040', '#3a2a10', 0.6); ell(c, 7.6, -1, 0.9, 1.4, '#1a1008'); c.restore();
  };
  // 동굴 거미: 털 난 둥근 배 + 보라 줄무늬 · 붉은 눈 여섯 · 줄무늬 다리 · 거미줄에 매달림
  N.cave_spider = (c, m, t, s) => {
    const k = m.w / 58; c.scale(k, k); const ph = walk(s, t, 12), lunge = sin(s.atk * PI) * 5;
    line(c, 'rgba(220,220,240,.55)', 0.8, [[-8, -60], [-8, -26]]);
    c.translate(lunge, 0);
    for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) { const a = ph + i * 1.6 + (sg > 0 ? PI : 0), x = 4 + i * 4 - 6, kx = sg > 0 ? 1 : -0.6;
      const p = [[x, -14], [x + kx * (10 + i * 2), -22 - i + sin(a) * 2], [x + kx * (16 + i * 3), 0]]; line(c, '#2a1a3a', 2.6, p); line(c, '#8a6aa0', 1, [[p[1][0] - 1, p[1][1] + 2], [p[1][0] + 1, p[1][1] - 2]]); }
    ell(c, -10, -16, 15, 12, rg(c, -10, -18, 16, '#7a5a9a', '#2a1a3a'), '#140a20', 1.2);
    for (let i = 0; i < 3; i++) line(c, 'rgba(200,170,230,.55)', 1.4, [[-18 + i * 3, -26 + i * 2], [-6 + i * 3, -6 - i]]);
    for (let i = 0; i < 10; i++) { const a = PI + i * 0.3; line(c, '#3a2a4a', 0.8, [[-10 + cos(a) * 15, -16 + sin(a) * 12], [-10 + cos(a) * 17.5, -16 + sin(a) * 14]]); }
    ell(c, 8, -15, 9, 8, rg(c, 8, -17, 9, '#6a4a8a', '#2a1a3a'), '#140a20', 1.2);
    for (const [x, y, r] of [[10, -18, 2], [14, -17, 1.8], [8, -14, 1.3], [12, -13, 1.3], [16, -14, 1.1], [6, -19, 1.1]]) { glow(c, x, y, r * 2.6, '#ff3050', 0.35); ell(c, x, y, r, r, '#ff4060', '#5a0010', 0.4); ell(c, x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3, '#fff'); }
    line(c, '#e8e0d0', 1.4, [[14, -10], [16, -6]]); line(c, '#e8e0d0', 1.4, [[11, -10], [12, -6]]);
  };
  // 거미줄 박쥐: 큰 귀 · 거미줄 무늬 날개막 · 발에 매단 실 · 작은 송곳니
  N.web_bat = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const fl = sin(t * 9) * 0.35, bob = sin(t * 3) * 3; c.translate(s.atk * 5, -14 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.rotate(-fl * 0.6);
      c.beginPath(); c.moveTo(4, -6); c.quadraticCurveTo(14, -18, 26, -12); c.quadraticCurveTo(22, -6, 24, 0); c.quadraticCurveTo(18, -2, 16, 3); c.quadraticCurveTo(10, 0, 4, 2); c.closePath();
      c.fillStyle = vg(c, -16, 4, '#7a6a90', '#3a2a50'); c.fill(); c.strokeStyle = '#1a1028'; c.lineWidth = 1; c.stroke();
      c.strokeStyle = 'rgba(230,230,255,.45)'; c.lineWidth = 0.6; for (const [x, y] of [[26, -12], [24, 0], [16, 3]]) { c.beginPath(); c.moveTo(4, -2); c.lineTo(x, y); c.stroke(); }
      for (const r of [7, 12, 17]) { c.beginPath(); c.moveTo(4 + r * 0.9, -2 - r * 0.45); c.quadraticCurveTo(4 + r * 0.95, -2 + r * 0.05, 4 + r * 0.6, -2 + r * 0.25); c.stroke(); } c.restore(); }
    ell(c, 0, -2, 9, 9.5, rg(c, 0, -3, 10, '#9a8ab0', '#4a3a60'), '#1a1028', 1.1);
    for (const sg of [-1, 1]) { poly(c, '#5a4a70', [[sg * 3, -9], [sg * 8, -20], [sg * 9, -7]], '#1a1028', 0.9); poly(c, '#d8a0c0', [[sg * 4.5, -10], [sg * 7.5, -16], [sg * 8, -9]]); }
    eye(c, -3.5, -3, 2.6, '#c03050'); eye(c, 3.5, -3, 2.6, '#c03050'); poly(c, '#fff', [[-1.6, 3], [-0.6, 3], [-1.1, 5]]); poly(c, '#fff', [[0.6, 3], [1.6, 3], [1.1, 5]]);
    line(c, 'rgba(230,230,255,.7)', 0.8, [[-2, 7], [-3, 14 + sin(t * 2) * 2], [-2, 24]]); line(c, 'rgba(230,230,255,.7)', 0.8, [[2, 7], [3, 14 + cos(t * 2) * 2], [2, 24]]);
  };
  // 늪 두꺼비: 통통한 몸 · 연잎 모자 · 사마귀 반점 · 부풀었다 줄어드는 목 주머니 · 혀 공격
  N.swamp_toad = (c, m, t, s) => {
    const k = m.w / 54; c.scale(k, k); const hop = s.walk ? abs(sin(t * 6)) * 5 : 0, sac = 1 + (s.walk ? 0 : abs(sin(t * 2.2)) * 0.25);
    c.translate(0, -hop);
    ell(c, -14, -4, 9, 5, '#4a7a3a', '#1e3a14', 1); ell(c, 12, -2, 6, 3.6, '#4a7a3a', '#1e3a14', 1);
    c.beginPath(); c.ellipse(-2, -14, 22, 14, 0, 0, PI * 2); c.fillStyle = rg(c, -4, -18, 24, '#8ac06a', '#3a6a2a'); c.fill(); c.strokeStyle = '#1e3a14'; c.lineWidth = 1.4; c.stroke();
    ell(c, 2, -8, 14, 6, '#e8e0a8');
    for (const [x, y, r] of [[-14, -18, 2.2], [-6, -24, 1.8], [-16, -10, 1.6], [4, -22, 1.5]]) ell(c, x, y, r, r, '#5a8a3a', '#2a4a1a', 0.5);
    ell(c, 14, -10, 7 * sac, 6 * sac, rg(c, 14, -10, 7, '#fff8d0', '#e0d090'), '#a09050', 0.8);   // 목 주머니
    for (const x of [6, 14]) { ell(c, x, -26, 5, 5, '#7ab05a', '#1e3a14', 1); eye(c, x + 0.6, -26.5, 3, '#2a1a08', 0.15); ell(c, x + 0.6, -24, 3.6, 1.2, '#7ab05a'); }
    line(c, '#1e3a14', 1.2, [[4, -14], [18, -15]]);
    if (s.atk > 0) { const L = 14 + s.atk * 26; line(c, '#e05a7a', 2.4, [[18, -15], [18 + L, -16]]); ell(c, 18 + L, -16, 3, 3, '#ff7a9a'); }
    c.save(); c.translate(-2, -27); c.rotate(-0.25); c.beginPath(); c.ellipse(0, 0, 13, 3.6, 0, 0.25, PI * 2 - 0.05); c.lineTo(0, 0); c.closePath(); c.fillStyle = vg(c, -4, 4, '#6ac05a', '#2a7a2a'); c.fill(); c.strokeStyle = '#1a4a14'; c.lineWidth = 1; c.stroke();
    for (const a of [0.9, 2.2, 3.6, 5.0]) line(c, '#3a8a2a', 0.7, [[0, 0], [cos(a) * 12, sin(a) * 3.2]]); ell(c, 6, -3, 2.2, 1.6, '#ff9ac0'); c.restore();
  };
  // 반딧불 정령: 등불 같은 배(빛이 숨 쉬듯) · 잎사귀 날개 · 작은 더듬이 별 · 반짝이 꼬리
  N.firefly_spirit = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const bob = sin(t * 2.8) * 3, br = 0.6 + 0.4 * sin(t * 3); c.translate(s.atk * 5, -12 + bob);
    for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; ell(c, -10 - u * 18, 6 + sin(u * 6 + i) * 4, 1.4 * (1 - u), 1.4 * (1 - u), `rgba(240,255,150,${0.8 * (1 - u)})`); }
    for (const sg of [-1, 1]) { c.save(); c.translate(-2, -6); c.rotate(-0.5 - sg * 0.35 + sin(t * 14 + sg) * 0.25); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -10, 0, -16); c.quadraticCurveTo(6, -10, 0, 0);
      c.fillStyle = 'rgba(200,240,190,.75)'; c.fill(); c.strokeStyle = '#6a9a5a'; c.lineWidth = 0.7; c.stroke(); line(c, '#6a9a5a', 0.5, [[0, -1], [0, -14]]); c.restore(); }
    glow(c, -8, 4, 22, '#f0ff90', 0.9 + br * 0.3); glow(c, -8, 4, 10, '#ffffff', 0.5);
    ell(c, -8, 4, 8, 7, rg(c, -8, 4, 8, '#ffffe0', '#e0f060'), '#a0a030', 0.8); for (const x of [-11, -7]) line(c, 'rgba(160,160,40,.5)', 0.8, [[x, -2], [x - 1, 10]]);
    ell(c, 2, -4, 6.5, 6, rg(c, 2, -5, 7, '#5a6a3a', '#2a3418'), '#141a08', 0.9);
    ell(c, 9, -9, 6, 5.6, rg(c, 9, -10, 6, '#6a7a4a', '#2a3418'), '#141a08', 0.9);
    eye(c, 9, -9.5, 2.4, '#1a2a08'); eye(c, 13.5, -9.5, 2, '#1a2a08'); blush(c, 13, -6, 1.6);
    for (const sg of [-1, 1]) { line(c, '#2a3418', 0.8, [[9 + sg * 1.5, -14], [9 + sg * 4, -20]]); const sx = 9 + sg * 4, sy = -21; c.save(); c.translate(sx, sy); c.rotate(t); poly(c, '#fff8a0', [[0, -2.4], [0.7, -0.7], [2.4, 0], [0.7, 0.7], [0, 2.4], [-0.7, 0.7], [-2.4, 0], [-0.7, -0.7]]); c.restore(); }
  };
})();
