// 저격왕의 각성 시안 가~라 — 대지 · 석궁 저격 · 섬광 (작고 간단하게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(160,220,90,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const spark = (c, x, y, r, f) => { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fillStyle = f; c.fill(); };
  const toBow = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); };   // 활: (-17,-2) ~ (17,-2), 아래로 휨
  const S = G.AuraA4b = {};
  // 가: 조준경 문장 — 머리 위 작은 조준 표식, 눈금이 천천히 돌고 가운데 점이 깜빡임
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 98 + sin(t * 2) * 1.5; soft(c, x, y, 20, 'rgba(170,230,100,.6)', 0.8 + 0.2 * sin(t * 3));
    c.save(); c.translate(x, y); c.lineCap = 'round'; for (const [w, col] of [[3.6, '#4a6a1a'], [2, '#c8f07a']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(0, 0, 10, 0, PI * 2); c.stroke(); }
    c.rotate(t * 0.6); for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * PI / 2); for (const [w, col] of [[3.4, '#4a6a1a'], [1.8, '#eaffc0']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -15); c.stroke(); } c.restore(); }
    c.restore(); ell(c, x, y, 2.2, 2.2, `rgba(255,80,60,${0.6 + 0.4 * sin(t * 6)})`); };
  // 나: 섬광 조준선 — 활 앞으로 짧게 뻗는 가느다란 녹빛 조준선 + 끝 점
  S.naFront = (c, p, t) => { const sx = p.x + p.dir * 20, sy = p.y - 22, L = 62 + sin(t * 2) * 4; c.save(); const g = c.createLinearGradient(sx, sy, sx + p.dir * L, sy); g.addColorStop(0, 'rgba(200,255,120,.95)'); g.addColorStop(1, 'rgba(200,255,120,0)');
    c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + p.dir * L, sy); c.stroke(); c.restore(); soft(c, sx, sy, 6, 'rgba(200,255,120,.9)', 1); ell(c, sx, sy, 1.4, 1.4, '#ffffff'); };
  S.na = () => {};
  // 다: 대지의 활 — 활이 연두 금빛으로 빛나고 작은 빛이 활대를 따라 흐름
  S.daFront = (c, p, t) => { c.save(); toBow(c, p); const br = 0.75 + 0.25 * sin(t * 3); soft(c, 0, 4, 22, 'rgba(180,240,100,.6)', br);
    c.lineCap = 'round'; c.globalAlpha = 0.9 * br; c.strokeStyle = '#b8e860'; c.lineWidth = 3.8; c.beginPath(); c.moveTo(-17, -2); c.quadraticCurveTo(0, 22, 17, -2); c.stroke();
    c.globalAlpha = 1; c.strokeStyle = '#f4ffd8'; c.lineWidth = 1.2; c.stroke(); const u = (t * 0.6) % 1, x = -17 + u * 34, y = -2 + 12 * (1 - Math.pow(2 * u - 1, 2)); c.globalAlpha = sin(u * PI); spark(c, x, y, 3.4, '#ffffff'); c.restore(); };
  S.da = () => {};
  // 라: 떠 있는 섬광 화살 셋 — 등 뒤 어깨 위로 앞을 향한 빛 화살 세 개가 살짝 떠 있음
  S.ra = (c, p, t) => { for (let i = 0; i < 3; i++) { const x = p.x - p.dir * 14, y = p.y - 66 - i * 9 + sin(t * 2 + i) * 1.5; c.save(); c.translate(x, y); c.scale(p.dir, 1); c.rotate(-0.15);
      soft(c, 12, 0, 10, 'rgba(190,240,110,.5)', 1); c.strokeStyle = '#6a8a2a'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-10, 0); c.lineTo(18, 0); c.stroke(); c.strokeStyle = '#e8ffc0'; c.lineWidth = 1.2; c.stroke();
      c.beginPath(); c.moveTo(24, 0); c.lineTo(17, -3.4); c.lineTo(17, 3.4); c.closePath(); c.fillStyle = '#f4ffd8'; c.fill(); c.strokeStyle = '#6a8a2a'; c.lineWidth = 0.8; c.stroke();
      c.beginPath(); c.moveTo(-10, 0); c.lineTo(-14, -3); c.lineTo(-8, 0); c.lineTo(-14, 3); c.closePath(); c.fillStyle = '#9ac850'; c.fill(); c.restore(); } };
})();
