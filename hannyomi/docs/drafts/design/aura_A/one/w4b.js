// 불멸의 수호자 '불멸' 시안 가~라 — 빛 · 방패 · 수호 (천붕검제 결정안처럼 작고 간단하게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,230,140,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const spark = (c, x, y, r, f) => { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fillStyle = f; c.fill(); };
  const toBlade = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.9); };
  const S = G.AuraW4b = {};
  // 가: 수호 방패 문장 — 머리 위 작은 금빛 방패 (가운데 십자), 숨 쉬듯 빛남
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 98 + sin(t * 2) * 2, br = 0.8 + 0.2 * sin(t * 3); soft(c, x, y, 22, 'rgba(255,230,140,.7)', br);
    c.save(); c.translate(x, y); c.beginPath(); c.moveTo(0, -11); c.quadraticCurveTo(9, -10, 10, -6); c.quadraticCurveTo(9, 6, 0, 12); c.quadraticCurveTo(-9, 6, -10, -6); c.quadraticCurveTo(-9, -10, 0, -11); c.closePath();
    const g = c.createLinearGradient(0, -11, 0, 12); g.addColorStop(0, '#fff6c8'); g.addColorStop(1, '#d8a030'); c.fillStyle = g; c.fill(); c.strokeStyle = '#8a6010'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(-1.2, -6, 2.4, 12); c.fillRect(-5, -2, 10, 2.4); c.restore(); };
  // 나: 불멸의 빛 고리 — 머리 위에 떠 있는 가느다란 금빛 고리 (천사 고리)
  S.ga2 = null;
  S.na = (c, p, t) => { const x = p.x, y = p.y - 84 + sin(t * 2) * 1.5; soft(c, x, y, 20, 'rgba(255,236,150,.6)', 0.8 + 0.2 * sin(t * 3));
    c.save(); c.translate(x, y); c.scale(1, 0.32); c.lineWidth = 4.5; c.strokeStyle = '#b8862a'; c.beginPath(); c.arc(0, 0, 15, 0, PI * 2); c.stroke(); c.lineWidth = 2.6; c.strokeStyle = '#ffe080'; c.stroke(); c.lineWidth = 1; c.strokeStyle = '#fffbe6'; c.stroke(); c.restore(); };
  // 다: 성검의 빛 — 칼날이 하얀 금빛으로 빛나고, 작은 빛 반짝임이 칼날을 따라 오름
  S.daFront = (c, p, t) => { c.save(); toBlade(c, p); const br = 0.75 + 0.25 * sin(t * 3); soft(c, 0, 22, 22, 'rgba(255,236,150,.65)', br);
    c.globalAlpha = 0.85 * br; const g = c.createLinearGradient(0, 4, 0, 36); g.addColorStop(0, '#fff2b0'); g.addColorStop(1, '#ffd050'); c.beginPath(); c.roundRect(-2.6, 4, 5.2, 32, 2); c.fillStyle = g; c.fill();
    c.globalAlpha = 1; c.fillStyle = '#ffffff'; c.fillRect(-0.6, 7, 1.2, 26); const u = (t * 0.7) % 1; c.globalAlpha = sin(u * PI); spark(c, 0, 8 + u * 26, 3.6, '#ffffff'); c.restore(); };
  S.da = () => {};
  // 라: 성역 발판 — 발밑에 금빛 원 + 십자 문양이 천천히 도는 작은 마법진
  S.ra = (c, p, t) => { c.save(); c.translate(p.x, p.y - 1); c.scale(1, 0.3); c.globalAlpha = 0.85 + 0.15 * sin(t * 3); c.lineWidth = 2.6; c.strokeStyle = '#e8b840'; c.beginPath(); c.arc(0, 0, 32, 0, PI * 2); c.stroke();
    c.lineWidth = 1.2; c.strokeStyle = '#fff0b0'; c.beginPath(); c.arc(0, 0, 25, 0, PI * 2); c.stroke(); c.rotate(t * 0.5);
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * PI / 2); c.fillStyle = '#ffe48a'; c.fillRect(-1.4, -31, 2.8, 8); c.fillRect(-4, -28.4, 8, 2.6); c.restore(); } c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; c.save(); c.globalAlpha = 1 - u; spark(c, p.x - 18 + i * 18, p.y - 4 - u * 26, 2.6, '#fff4c0'); c.restore(); } };
})();
