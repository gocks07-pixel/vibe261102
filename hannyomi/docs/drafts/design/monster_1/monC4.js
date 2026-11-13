// 다시 그리는 3종: 포자 방울 → 새 몬스터 2안 · 설원 늑대 2안 · 서리 박쥐 2안 (id 그대로)
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = f; c.fill(); };
  const vg = (c, y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const eye = (c, x, y, r, iris) => { ell(c, x, y, r, r * 1.15, '#fff'); ell(c, x + r * 0.25, y + r * 0.1, r * 0.62, r * 0.78, iris || '#2a2a36'); ell(c, x + r * 0.05, y - r * 0.38, r * 0.27, r * 0.27, '#fff'); };
  const blush = (c, x, y, r) => ell(c, x, y, r, r * 0.55, 'rgba(255,120,140,.45)');
  const N = G.MonNewC4 = {};
  const body = (c, f) => { c.beginPath(); f(); c.closePath(); };

  // 포자 방울 → 가: 버섯 달팽이 — 등에 작은 버섯 숲을 진 달팽이 · 껍데기 대신 둥근 버섯 갓 · 촉수 눈 · 지나간 자리에 포자
  N.spore_a = (c, m, t, s) => {
    const k = m.w / 42 * 1.25; c.scale(k, k); const sq = s.walk ? 1 + sin(t * 6) * 0.06 : 1;
    for (let i = 0; i < 3; i++) { const u = (t * 0.4 + i / 3) % 1; ell(c, -10 - u * 14, -2 - u * 4, 1.2, 1.2, `rgba(220,190,255,${0.7 * (1 - u)})`); }
    body(c, () => { c.moveTo(-14, 0); c.quadraticCurveTo(-16 * sq, -6, -6, -8); c.lineTo(10, -8); c.quadraticCurveTo(18, -12, 20, -20); c.quadraticCurveTo(24, -12, 20, -4); c.quadraticCurveTo(16, 0, 8, 0); });
    c.fillStyle = vg(c, -20, 0, '#d8c8f0', '#9a7ac0'); c.fill();
    for (const sg of [0, 1]) { const x = 18 + sg * 4; line(c, '#9a7ac0', 1.6, [[x - 2, -18], [x + sin(t * 3 + sg) * 1.5, -27]]); ell(c, x + sin(t * 3 + sg) * 1.5, -28, 2.6, 2.6, '#fff'); ell(c, x + 0.6 + sin(t * 3 + sg) * 1.5, -27.6, 1.4, 1.6, '#3a2a5a'); }
    c.fillStyle = '#5a3a7a'; c.beginPath(); c.arc(21, -12, 1.6, 0, PI); c.fill(); blush(c, 17, -12, 2);
    c.beginPath(); c.ellipse(-2, -12, 14, 12, 0, PI, 0); c.quadraticCurveTo(-2, -4, -16, -12); c.fillStyle = rg(c, -4, -18, 16, '#c890ff', '#7a3ab0'); c.fill();
    for (const [x, y, r] of [[-8, -18, 2.4], [0, -21, 2], [6, -15, 1.8], [-12, -13, 1.6]]) ell(c, x, y, r, r * 0.8, '#f4e8ff');
    for (const [x, h, col] of [[-6, 8, '#ff8aa0'], [1, 11, '#ffd070'], [7, 7, '#8ad0ff']]) { c.save(); c.translate(x, -22 + abs(x) * 0.3); rrect(c, -1, -h, 2, h, 1, '#f0e8d8'); c.beginPath(); c.ellipse(0, -h, 4, 2.6, 0, PI, 0); c.fillStyle = col; c.fill(); ell(c, -1, -h - 1.2, 0.8, 0.6, '#fff'); c.restore(); }
  };
  // 포자 방울 → 나: 민들레 솜털 정령 — 둥근 솜털 머리(바람에 씨앗이 날림) · 잎 두 장 몸 · 줄기 다리로 깡충
  N.spore_b = (c, m, t, s) => {
    const k = m.h / 42 * 1.2; c.scale(k, k); const hop = s.walk ? abs(sin(t * 7)) * 5 : sin(t * 2) * 1; c.translate(s.atk * 5, -hop);
    line(c, '#6aa84a', 2.4, [[0, 0], [0, -12]]); for (const sg of [-1, 1]) { c.save(); c.translate(0, -8); c.rotate(sg * (0.9 + sin(t * 3) * 0.1)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sg * 6, -4, sg * 12, -2); c.quadraticCurveTo(sg * 6, 2, 0, 0); c.fillStyle = '#7ac85a'; c.fill(); c.restore(); }
    for (let i = 0; i < 22; i++) { const a = i / 22 * PI * 2; line(c, 'rgba(255,255,255,.8)', 0.8, [[cos(a) * 7, -24 + sin(a) * 7], [cos(a) * 13, -24 + sin(a) * 13]]); ell(c, cos(a) * 13.6, -24 + sin(a) * 13.6, 1.4, 1.4, '#ffffff'); }
    ell(c, 0, -24, 9, 9, rg(c, 0, -25, 9, '#ffffff', '#e8e4d0'));
    eye(c, -3, -24, 2.2, '#3a4a2a'); eye(c, 3.4, -24, 2.2, '#3a4a2a'); blush(c, -6, -20.6, 1.8); blush(c, 6.4, -20.6, 1.8); c.strokeStyle = '#3a4a2a'; c.lineWidth = 0.9; c.beginPath(); c.arc(0.2, -21, 1.6, 0.2, PI - 0.2); c.stroke();
    for (let i = 0; i < 4; i++) { const u = (t * 0.35 + i / 4) % 1, x = 6 + u * 26, y = -30 - u * 16 + sin(t * 2 + i) * 3; c.save(); c.globalAlpha *= 1 - u; line(c, '#ffffff', 0.6, [[x, y], [x, y + 4]]); for (let j = 0; j < 5; j++) { const a = -PI / 2 + (j - 2) * 0.35; line(c, '#ffffff', 0.5, [[x, y], [x + cos(a) * 3, y + sin(a) * 3]]); } c.restore(); }
  };
  // 설원 늑대 → 가: 털이 풍성한 눈늑대 — 두툼한 목도리 털 · 큰 꼬리 · 이마의 푸른 얼음 무늬 · 발이 눈에 살짝 묻힘
  N.snow_wolf_a = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const ph = s.walk ? t * 11 : 0, lunge = sin(s.atk * PI) * 10; c.translate(lunge, s.walk ? -abs(sin(ph)) * 2 : 0);
    c.save(); c.translate(-26, -24); c.rotate(-0.5 + sin(t * 2.5) * 0.12); body(c, () => { c.moveTo(4, 2); c.bezierCurveTo(-6, -12, -26, -8, -26, 4); c.bezierCurveTo(-22, 12, -8, 12, 4, 8); }); c.fillStyle = vg(c, -10, 12, '#ffffff', '#c8d8f0'); c.fill(); ell(c, -22, 4, 5, 4, '#a8c8f0'); c.restore();
    for (const [x, a] of [[-16, 0], [-8, PI], [12, PI], [20, 0]]) { const st = s.walk ? sin(ph + a) * 0.4 : 0; c.save(); c.translate(x, -16); c.rotate(st); rrect(c, -3.6, 0, 7.2, 15, 3.6, vg(c, 0, 15, '#f0f6ff', '#c0d0e8')); ell(c, 0.6, 15, 4.6, 2.4, '#e8f0fc'); c.restore(); }
    body(c, () => { c.ellipse(-2, -24, 24, 11, 0, 0, PI * 2); }); c.fillStyle = vg(c, -35, -13, '#ffffff', '#cad8ee'); c.fill();
    c.save(); c.translate(20, -28); for (let i = 0; i < 9; i++) { const a = -PI * 0.2 + i * PI * 0.15; ell(c, -4 + cos(a) * 7, 4 + sin(a) * 8, 6, 4, '#ffffff'); }
    c.rotate(-0.08 - s.atk * 0.15); body(c, () => { c.ellipse(4, -4, 11, 9, 0, 0, PI * 2); }); c.fillStyle = vg(c, -13, 5, '#ffffff', '#d4e0f2'); c.fill();
    body(c, () => { c.moveTo(10, -6); c.quadraticCurveTo(22, -4, 22, 0); c.quadraticCurveTo(16, 4, 8, 3); }); c.fillStyle = '#eef4fc'; c.fill(); ell(c, 21.6, -1, 1.8, 1.5, '#2a3248');
    for (const [x, a] of [[-1, -0.25], [7, 0.1]]) { c.save(); c.translate(x, -10); c.rotate(a); poly(c, '#ffffff', [[-4, 2], [0, -11], [4, 2]]); poly(c, '#b8d4f4', [[-2, 0], [0, -7], [2, 0]]); c.restore(); }
    poly(c, '#7ab8ff', [[4, -10], [6, -6], [4, -3], [2, -6]]); glow(c, 4, -6.5, 5, '#a0d8ff', 0.6);
    ell(c, 10, -4, 2.6, 2.2, '#3a6ac0'); ell(c, 10.6, -4, 1.2, 1.6, '#0a1a3a'); ell(c, 9.8, -5, 0.6, 0.6, '#fff');
    if (s.atk > 0) poly(c, '#ffffff', [[14, 2], [15, 5], [16, 2]]); c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; ell(c, 44 + u * 10, -30 - u * 4, 2 + u * 3, 1.4 + u * 2, `rgba(230,245,255,${0.6 * (1 - u)})`); }
  };
  // 설원 늑대 → 나 (다른 몬스터): 눈토끼 무리장 — 귀가 긴 큰 설원 토끼 · 얼음 갑옷 조각 · 뒷발로 깡충 박치기
  N.snow_wolf_b = (c, m, t, s) => {
    const k = m.w / 74; c.scale(k, k); const hop = s.walk ? abs(sin(t * 6)) * 8 : 0, lunge = sin(s.atk * PI) * 12; c.translate(lunge, -hop);
    ell(c, -22, -16, 7, 7, '#ffffff');
    body(c, () => { c.moveTo(-18, -6); c.bezierCurveTo(-24, -24, -6, -36, 10, -30); c.bezierCurveTo(20, -26, 18, -10, 10, -4); c.quadraticCurveTo(-4, 0, -18, -6); }); c.fillStyle = vg(c, -34, -2, '#ffffff', '#cdd9ee'); c.fill();
    ell(c, -12, -4, 10, 4, '#e8eef8'); ell(c, 12, -2, 4, 2.4, '#e8eef8');
    poly(c, vg(c, -32, -18, '#e8f6ff', '#8ac0f0'), [[-8, -30], [6, -32], [10, -20], [-6, -18]]); glow(c, 1, -25, 6, '#bfe8ff', 0.5);
    c.save(); c.translate(16, -32); body(c, () => { c.ellipse(0, 0, 10, 9, 0, 0, PI * 2); }); c.fillStyle = vg(c, -9, 9, '#ffffff', '#d4e0f2'); c.fill();
    for (const [x, a, L] of [[-4, -0.5, 22], [2, -0.2, 20]]) { c.save(); c.translate(x, -6); c.rotate(a + sin(t * 2 + x) * 0.06); body(c, () => { c.ellipse(0, -L / 2, 3.8, L / 2, 0, 0, PI * 2); }); c.fillStyle = '#ffffff'; c.fill(); ell(c, 0, -L / 2, 2, L / 2 - 2, '#ffc8d8'); c.restore(); }
    eye(c, 4, -1, 2.6, '#3a5ab0'); ell(c, 9.4, 2, 1.4, 1, '#ff9ab0'); blush(c, 6, 4, 2); c.restore();
    for (let i = 0; i < 2; i++) { const u = (t * 1.5 + i / 2) % 1; ell(c, -28 - u * 8, -2 - u * 4, 3 * (1 - u) + 1, 2 * (1 - u) + 1, `rgba(240,248,255,${0.6 * (1 - u)})`); }
  };
  // 서리 박쥐 → 가: 고드름 박쥐 — 거꾸로 매달린 듯 둥근 솜털 몸 · 얼음 막 날개(반투명, 결정 무늬) · 큰 귀 · 아래로 떨어지는 고드름 방울
  N.frost_bat_a = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const fl = sin(t * 8) * 0.4, bob = sin(t * 3) * 3; c.translate(s.atk * 5, -14 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.rotate(-fl * 0.5);
      body(c, () => { c.moveTo(5, -4); c.quadraticCurveTo(16, -18, 28, -12); c.quadraticCurveTo(25, -6, 27, 0); c.quadraticCurveTo(21, -2, 19, 4); c.quadraticCurveTo(13, 0, 6, 4); }); c.fillStyle = 'rgba(190,230,255,.75)'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 0.6; for (const [x, y] of [[28, -12], [27, 0], [19, 4]]) { c.beginPath(); c.moveTo(6, 0); c.lineTo(x, y); c.stroke(); }
      for (const [x, y] of [[17, -8], [22, -4]]) { c.save(); c.translate(x, y); for (let j = 0; j < 3; j++) { c.rotate(PI / 3); line(c, 'rgba(255,255,255,.8)', 0.6, [[-2, 0], [2, 0]]); } c.restore(); } c.restore(); }
    body(c, () => { c.ellipse(0, -1, 9, 10, 0, 0, PI * 2); }); c.fillStyle = rg(c, 0, -2, 10, '#eaf6ff', '#8ab8e0'); c.fill();
    for (let i = 0; i < 5; i++) ell(c, -5 + i * 2.5, 6 + (i % 2), 2.4, 2, '#d8eeff');
    for (const sg of [-1, 1]) { body(c, () => { c.moveTo(sg * 3, -9); c.quadraticCurveTo(sg * 10, -22, sg * 10, -8); }); c.fillStyle = '#c8e4ff'; c.fill(); body(c, () => { c.moveTo(sg * 4.4, -10); c.quadraticCurveTo(sg * 8.6, -18, sg * 8.6, -9); }); c.fillStyle = '#ffd0e0'; c.fill(); }
    eye(c, -3.4, -2, 2.6, '#3a6ac0'); eye(c, 3.4, -2, 2.6, '#3a6ac0'); blush(c, -6, 2, 1.8); blush(c, 6, 2, 1.8); poly(c, '#fff', [[-1.2, 3.4], [0, 3.4], [-0.6, 5.4]]); poly(c, '#fff', [[0.4, 3.4], [1.6, 3.4], [1, 5.4]]);
    for (let i = 0; i < 2; i++) { const u = (t * 0.6 + i / 2) % 1; c.save(); c.globalAlpha *= 1 - u; poly(c, '#e8f8ff', [[-2 + i * 4, 10 + u * 18], [i * 4, 16 + u * 18], [2 + i * 4, 10 + u * 18]]); c.restore(); }
  };
  // 서리 박쥐 → 나 (다른 몬스터): 눈송이 나방 — 눈 결정 무늬 큰 날개 · 솜털 몸 · 깃털 더듬이 · 날갯짓마다 눈가루
  N.frost_bat_b = (c, m, t, s) => {
    const k = m.h / 44; c.scale(k, k); const fl = sin(t * 6) * 0.3, bob = sin(t * 2.4) * 3; c.translate(s.atk * 5, -16 + bob);
    for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.rotate(-fl);
      body(c, () => { c.moveTo(2, -2); c.bezierCurveTo(10, -22, 28, -20, 26, -6); c.bezierCurveTo(24, 0, 12, 2, 2, 0); }); c.fillStyle = vg(c, -20, 2, '#f4fbff', '#9ac8f0'); c.fill();
      body(c, () => { c.moveTo(2, 1); c.bezierCurveTo(10, 4, 20, 8, 16, 16); c.bezierCurveTo(10, 18, 4, 10, 2, 3); }); c.fillStyle = vg(c, 0, 16, '#e0f2ff', '#7aaee0'); c.fill();
      c.save(); c.translate(15, -9); for (let j = 0; j < 6; j++) { c.rotate(PI / 3); line(c, '#ffffff', 0.9, [[0, 0], [5, 0]]); line(c, '#ffffff', 0.6, [[3, 0], [4, -1.4]]); } glow(c, 0, 0, 6, '#ffffff', 0.4); c.restore();
      ell(c, 9, 9, 2, 2, '#ffffff'); c.restore(); }
    body(c, () => { c.ellipse(0, 2, 4.6, 10, 0, 0, PI * 2); }); c.fillStyle = rg(c, 0, 0, 10, '#ffffff', '#c8dcf0'); c.fill();
    ell(c, 0, -8, 5, 4.6, '#ffffff'); eye(c, -1.8, -8, 1.8, '#2a4a8a'); eye(c, 2, -8, 1.8, '#2a4a8a');
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 2, -12); c.rotate(sg * 0.4); line(c, '#c8dcf0', 0.8, [[0, 0], [0, -8]]); for (let j = 1; j < 4; j++) line(c, '#ffffff', 0.6, [[0, -j * 2], [sg * 2, -j * 2 - 1.4]]); c.restore(); }
    for (let i = 0; i < 5; i++) { const u = (t * 0.5 + i / 5) % 1; ell(c, -14 + i * 7 + sin(t + i) * 3, 6 + u * 20, 1, 1, `rgba(255,255,255,${0.9 * (1 - u)})`); }
  };
})();
