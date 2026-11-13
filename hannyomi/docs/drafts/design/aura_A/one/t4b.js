// 검무의 각성 시안 가~라 — 독 · 쌍검 · 춤 (작고 간단하게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(120,220,120,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const toDag = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.8); };
  const petal = (c, L, W, c1, c2) => { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(W, -L * 0.5, 0, -L); c.quadraticCurveTo(-W, -L * 0.5, 0, 0); const g = c.createLinearGradient(0, 0, 0, -L); g.addColorStop(0, c1); g.addColorStop(1, c2); c.fillStyle = g; c.fill(); };
  const blade = (c, L) => { c.beginPath(); c.moveTo(0, -L); c.lineTo(2.2, -L * 0.3); c.lineTo(0, 0); c.lineTo(-2.2, -L * 0.3); c.closePath(); const g = c.createLinearGradient(-2, 0, 2, 0); g.addColorStop(0, '#2a7a4a'); g.addColorStop(0.5, '#eaffea'); g.addColorStop(1, '#2a7a4a'); c.fillStyle = g; c.fill(); c.strokeStyle = '#1a4a2a'; c.lineWidth = 0.7; c.stroke(); c.fillStyle = '#c9a33a'; c.fillRect(-3, 0, 6, 1.6); c.fillStyle = '#3a2a1a'; c.fillRect(-0.9, 1.6, 1.8, 3.6); };
  const S = G.AuraT4b = {};
  // 가: 독꽃 문장 — 머리 위 작은 꽃 한 송이 (초록 꽃잎 + 분홍 속), 천천히 돎
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 96 + sin(t * 2) * 1.5; soft(c, x, y, 20, 'rgba(150,240,140,.6)', 0.8 + 0.2 * sin(t * 3));
    c.save(); c.translate(x, y); c.rotate(t * 0.5); for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * PI * 2 / 5); petal(c, 11, 5.4, '#e070c0', '#8ae07a'); c.restore(); } ell(c, 0, 0, 3, 3, '#ffe070'); c.restore(); };
  // 나: 춤추는 쌍검 — 작은 초록 칼날 두 자루가 서로 마주 보며 허리 둘레를 돎
  const twin = (front) => (c, p, t) => { for (let k = 0; k < 2; k++) { const a = t * 1.8 + k * PI, x = p.x + cos(a) * 40, y = p.y - 28 + sin(a) * 6; if ((sin(a) > 0) !== front) continue;
      soft(c, x, y, 11, 'rgba(140,240,140,.55)', 1); c.save(); c.translate(x, y); c.rotate(a + PI / 2 + sin(t * 4 + k) * 0.3); blade(c, 13); c.restore(); } };
  S.na = twin(false); S.naFront = twin(true);
  // 다: 독빛 단검 — 단검 날이 독빛 초록으로 빛나고 가끔 작은 독 방울이 맺혀 떨어짐
  S.daFront = (c, p, t) => { c.save(); toDag(c, p); const br = 0.75 + 0.25 * sin(t * 3); soft(c, 0, 12, 16, 'rgba(130,240,110,.65)', br);
    c.globalAlpha = 0.9 * br; const g = c.createLinearGradient(0, 3, 0, 20); g.addColorStop(0, '#dfffd0'); g.addColorStop(1, '#4ac860'); c.beginPath(); c.roundRect(-2, 3, 4, 17, 2); c.fillStyle = g; c.fill(); c.globalAlpha = 1; c.fillStyle = '#ffffff'; c.fillRect(-0.5, 5, 1, 13); c.restore(); };
  S.da = () => {};
  // 라: 무희의 꽃잎 — 발밑에서 분홍 · 초록 꽃잎 몇 장이 빙글빙글 감아 오름
  S.ra = (c, p, t) => { for (let i = 0; i < 6; i++) { const u = (t * 0.35 + i / 6) % 1, a = t * 2 + i * 1.05, x = p.x + cos(a) * (30 - u * 8), y = p.y - 4 - u * 60 + sin(a) * 5;
      c.save(); c.globalAlpha = sin(u * PI); c.translate(x, y); c.rotate(a * 1.5); petal(c, 7, 3.4, i % 2 ? '#e070c0' : '#5ad07a', i % 2 ? '#ffd0ee' : '#d8ffd0'); c.restore(); } };
})();
