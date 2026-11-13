// 천붕검제의 각성 시안 가~라 — 불 · 대검 · "하늘을 무너뜨리는 검"
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,120,30,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  // 불꽃 혀 하나: 밑동 (x,y), 높이 h, 폭 w, 기울기 lean — 바깥 진홍 → 주황 → 노랑 → 흰 심
  const tongue = (c, x, y, h, w, t, s, lean = 0) => {
    const sw = (u) => (sin(t * 7 + s + u * 3) * 0.35 + sin(t * 13 + s * 2.3) * 0.15) * w * u + lean * h * u * u;
    const layer = (k, col) => { const hh = h * k, ww = w * (0.35 + 0.65 * k); c.beginPath(); c.moveTo(x - ww, y);
      c.bezierCurveTo(x - ww * 1.05, y - hh * 0.35, x - ww * 0.5 + sw(0.6), y - hh * 0.7, x + sw(1), y - hh);
      c.bezierCurveTo(x + ww * 0.5 + sw(0.6), y - hh * 0.7, x + ww * 1.05, y - hh * 0.35, x + ww, y);
      c.quadraticCurveTo(x, y + ww * 0.7, x - ww, y); c.fillStyle = col; c.fill(); };
    layer(1, 'rgba(196,40,12,.9)'); layer(0.82, '#ff6a14'); layer(0.6, '#ffb52e'); layer(0.36, '#ffe78a'); layer(0.18, '#fffbe6'); };
  const ember = (c, x, y, r, a) => { c.save(); c.globalAlpha *= a; soft(c, x, y, r * 4, 'rgba(255,150,40,.8)', 1); ell(c, x, y, r, r, '#ffd060'); ell(c, x, y, r * 0.5, r * 0.5, '#fffbe0'); c.restore(); };
  const embers = (c, cx, cy, n, spread, rise, t, sp = 0.5) => { for (let i = 0; i < n; i++) { const u = (t * sp + i * 0.618) % 1; ember(c, cx + sin(i * 2.4 + u * 3) * spread, cy - u * rise, 1.6 * (1 - u * 0.6), 1 - u); } };
  // 대검 (세로, 칼끝 아래) — 길이 L, 폭 W, 원점 = 손잡이 이음 가운데
  const blade = (c, L, W, t, hot) => {
    c.beginPath(); c.moveTo(-W / 2, 0); c.lineTo(-W / 2, L * 0.82); c.lineTo(0, L); c.lineTo(W / 2, L * 0.82); c.lineTo(W / 2, 0); c.closePath();
    const g = c.createLinearGradient(-W / 2, 0, W / 2, 0); g.addColorStop(0, '#6a2410'); g.addColorStop(0.3, hot ? '#ff8a30' : '#d8c8b8'); g.addColorStop(0.5, '#fff4dc'); g.addColorStop(0.7, hot ? '#ff8a30' : '#d8c8b8'); g.addColorStop(1, '#5a1e0c');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#3a1206'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#c0300c'; c.fillRect(-1.6, 6, 3.2, L * 0.7);   // 가운데 홈(풀러)
    for (let i = 0; i < 4; i++) { const y = 14 + i * L * 0.17, a = 0.6 + 0.4 * sin(t * 4 - i); c.save(); c.globalAlpha = a; c.beginPath(); c.moveTo(0, y - 4); c.lineTo(2.6, y); c.lineTo(0, y + 4); c.lineTo(-2.6, y); c.closePath(); c.fillStyle = '#ffe68a'; c.fill(); c.restore(); }   // 룬
  };
  const guard = (c, W) => { c.beginPath(); c.moveTo(-W, 2); c.quadraticCurveTo(-W * 0.6, -6, -W * 1.25, -12); c.quadraticCurveTo(-W * 0.3, -6, 0, -4); c.quadraticCurveTo(W * 0.3, -6, W * 1.25, -12); c.quadraticCurveTo(W * 0.6, -6, W, 2); c.closePath();
    const g = c.createLinearGradient(0, -12, 0, 2); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#a8601a'); c.fillStyle = g; c.fill(); c.strokeStyle = '#5a2a08'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#4a1a0c'; c.fillRect(-2.4, -26, 4.8, 22); ell(c, 0, -29, 4.4, 4.4, '#e0301a'); ell(c, -1, -30, 1.4, 1.4, '#ffd0c0'); };
  const S = G.AuraW4a = {};
  // 가: 하늘에서 꽂힌 거대 화염검 — 등 뒤에 세로로 선 큰 대검, 날 양쪽을 불꽃이 핥고 불씨가 오름
  S.ga = (c, p, t) => { const x = p.x - p.dir * 4, top = p.y - 138, L = 128; soft(c, x, p.y - 70, 70, 'rgba(255,110,30,.35)', 1);
    c.save(); c.translate(x, top); for (let i = 0; i < 7; i++) { const y = 18 + i * 15; for (const sg of [-1, 1]) tongue(c, sg * 9, y + 10, 16 - i, 4.5, t, i * 3 + sg, sg * 0.5); }
    blade(c, L, 16, t, true); guard(c, 16); c.restore();
    ell(c, x, p.y - 2, 30, 6, 'rgba(120,20,6,.45)'); for (let i = 0; i < 5; i++) tongue(c, x - 22 + i * 11, p.y - 1, 12 + (i % 2) * 6, 4, t, i * 7);
    embers(c, x, p.y - 40, 7, 34, 110, t); };
  // 나: 투기의 불꽃 — 온몸에서 위로 타오르는 불길 + 발밑 용암 균열
  S.na = (c, p, t) => { const cx = p.x, cy = p.y - 46; soft(c, cx, cy, 64, 'rgba(255,100,20,.4)', 1);
    c.save(); c.translate(p.x, p.y - 2); c.scale(1, 0.3); ell(c, 0, 0, 44, 44, 'rgba(70,14,4,.55)'); c.strokeStyle = '#ff9a30'; c.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3; c.lineWidth = 3.4; c.beginPath(); c.moveTo(cos(a) * 8, sin(a) * 8); c.lineTo(cos(a + 0.2) * 24, sin(a + 0.2) * 24); c.lineTo(cos(a - 0.1) * 40, sin(a - 0.1) * 40); c.stroke(); } c.restore();
    for (let i = 0; i < 13; i++) { const a = PI + i * PI / 12, x = cx + cos(a) * 26, y = cy + 40 + sin(a) * 4 - (1 - Math.abs(cos(a))) * 78 * 0 ; }
    const ring = [[-24, 0, 30], [-20, -24, 40], [-12, -50, 46], [0, -60, 52], [12, -50, 46], [20, -24, 40], [24, 0, 30], [-14, 30, 26], [14, 30, 26], [0, 36, 24]];
    ring.forEach(([dx, dy, h], i) => tongue(c, cx + dx, cy + dy + 14, h * (0.85 + 0.15 * sin(t * 5 + i)), 9, t, i * 2.7, dx * 0.012));
    embers(c, cx, cy - 20, 8, 30, 90, t, 0.7); };
  // 다: 천붕 검진 — 머리 위에 칼끝을 아래로 향한 불꽃 검 다섯 자루가 반원으로 떠 있음 (멸천 낙화)
  S.da = (c, p, t) => { const cx = p.x - p.dir * 2, cy = p.y - 112;
    [[-2, 0.8], [-1, 0.9], [1, 0.9], [2, 0.8], [0, 1.1]].forEach(([k, s], i) => { const a = k * 0.42, x = cx + sin(a) * 78, y = cy + (1 - cos(a)) * 30 + sin(t * 2 + k) * 3;
      c.save(); c.translate(x, y); c.rotate(-a * 0.35); c.scale(s, s); for (let j = 0; j < 3; j++) tongue(c, (j - 1) * 5, -26, 20 + j % 2 * 8, 4, t, k * 5 + j);
      soft(c, 0, 10, 26, 'rgba(255,120,30,.35)', 1); c.translate(0, -8); blade(c, 46, 8, t + k, true); guard(c, 8); c.restore(); });
    embers(c, cx, cy + 40, 6, 50, -60, t, 0.6); };
  // 라: 하늘 균열 — 머리 위 하늘이 갈라져 불빛이 새고, 불덩이가 캐릭터 쪽으로 떨어짐
  S.ra = (c, p, t) => { const cx = p.x, cy = p.y - 126, br = 0.85 + 0.15 * sin(t * 4);
    c.save(); const bg = c.createLinearGradient(0, cy, 0, p.y); bg.addColorStop(0, 'rgba(255,150,50,.45)'); bg.addColorStop(1, 'rgba(255,150,50,0)'); c.fillStyle = bg; c.beginPath(); c.moveTo(cx - 34, cy); c.lineTo(cx + 34, cy); c.lineTo(cx + 22, p.y); c.lineTo(cx - 22, p.y); c.fill(); c.restore();
    soft(c, cx, cy, 60, 'rgba(255,90,20,.5)', br);
    const crack = [[-58, 2], [-40, -4], [-30, 4], [-14, -6], [-4, 3], [8, -5], [20, 4], [34, -3], [46, 3], [60, -1]];
    const path = (w) => { c.beginPath(); crack.forEach(([x, y], i) => c.lineTo(cx + x, cy + y - w * (i % 2 ? 1 : 0.4))); for (let i = crack.length - 1; i >= 0; i--) { const [x, y] = crack[i]; c.lineTo(cx + x, cy + y + w * (i % 2 ? 0.4 : 1)); } c.closePath(); };
    path(7); c.fillStyle = '#5a1206'; c.fill(); path(4.6); c.fillStyle = '#ff6a14'; c.fill(); path(2.4); c.fillStyle = '#ffd860'; c.fill(); path(0.9); c.fillStyle = '#fffbe6'; c.fill();
    for (const [x, len] of [[-30, 16], [20, 12], [44, 10]]) { c.strokeStyle = '#ff8a30'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx + x, cy + 3); c.lineTo(cx + x + 5, cy + 3 + len * 0.5); c.lineTo(cx + x + 2, cy + 3 + len); c.stroke(); }
    for (let i = 0; i < 4; i++) { const u = (t * 0.55 + i / 4) % 1, x = cx + (i - 1.5) * 30 * (1 - u * 0.5), y = cy + 10 + u * 100; c.save(); c.globalAlpha = 1 - u * u; soft(c, x, y, 14, 'rgba(255,120,30,.6)', 1); tongue(c, x, y + 3, 22, 4.4, t, i * 3, 0); ell(c, x, y + 2, 4.6, 4.6, '#ffd860'); ell(c, x, y + 2, 2.4, 2.4, '#fffbe6'); c.restore(); }
    embers(c, cx, cy + 8, 6, 46, -50, t, 0.4); };
})();
