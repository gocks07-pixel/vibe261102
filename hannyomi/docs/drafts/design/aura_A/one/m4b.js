// 천둥의 현자 '현자의 각성' 시안 가~라 — 얼음 · 번개 · 지혜 (작고 간단하게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(140,200,255,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const bolt = (c, pts, w) => { c.lineCap = 'round'; c.lineJoin = 'round'; for (const [lw, col] of [[w + 2, 'rgba(60,110,220,.8)'], [w, '#fff8a0']]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } };
  const toWand = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.4); };
  const S = G.AuraM4b = {};
  // 가: 지혜의 책 문장 — 머리 위 펼친 작은 책, 푸른 빛 글자가 떠오름
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 94 + sin(t * 2) * 1.5; soft(c, x, y - 4, 22, 'rgba(150,210,255,.65)', 0.8 + 0.2 * sin(t * 3));
    c.save(); c.translate(x, y); for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(6, -2, 13, 0); c.lineTo(13, -9); c.quadraticCurveTo(6, -11, 0, -7); c.closePath();
      const g = c.createLinearGradient(0, 0, 13, 0); g.addColorStop(0, '#d8e8ff'); g.addColorStop(1, '#ffffff'); c.fillStyle = g; c.fill(); c.strokeStyle = '#2a4a8a'; c.lineWidth = 1.1; c.stroke();
      c.strokeStyle = 'rgba(80,130,220,.7)'; c.lineWidth = 0.8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(3, -5 + i * 2.4); c.lineTo(10, -5.6 + i * 2.4); c.stroke(); } c.restore(); }
    c.fillStyle = '#2a4a8a'; c.fillRect(-0.8, -7, 1.6, 9); c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; c.save(); c.globalAlpha = sin(u * PI); c.fillStyle = '#bfe4ff'; c.font = 'bold 6px serif'; c.fillText('✦', x - 8 + i * 6, y - 10 - u * 12); c.restore(); } };
  // 나: 뇌빙 구슬 지팡이 — 지팡이 끝이 푸른 얼음 구슬이 되고 작은 번개가 튐
  S.naFront = (c, p, t) => { c.save(); toWand(c, p); c.translate(0, 25); c.rotate(1.4 + 0.3); soft(c, 0, 0, 16, 'rgba(140,200,255,.8)', 0.8 + 0.2 * sin(t * 4));
    ell(c, 0, 0, 5.4, 5.4, '#5aa8ff'); ell(c, 0, 0, 3.6, 3.6, '#bfe8ff'); ell(c, -1, -1, 1.6, 1.6, '#ffffff');
    const k = Math.floor(t * 6) % 3; if (k !== 2) { const a = k * 2.1 + 0.4; bolt(c, [[cos(a) * 5, sin(a) * 5], [cos(a) * 9 + 2, sin(a) * 9], [cos(a) * 12, sin(a) * 13 + 1]], 1); } c.restore(); };
  S.na = () => {};
  // 다: 따라다니는 얼음 결정 — 작은 얼음 결정 하나가 허리 높이로 몸 둘레를 돎 (화염군주 불씨와 짝)
  const crys = (front) => (c, p, t) => { const a = t * 1.6, x = p.x + cos(a) * 42, y = p.y - 26 + sin(a) * 6 + sin(t * 3) * 2; if ((sin(a) > 0) !== front) return;
    soft(c, x, y, 13, 'rgba(150,210,255,.7)', 1); c.save(); c.translate(x, y); c.rotate(t * 1.2); c.beginPath(); c.moveTo(0, -7); c.lineTo(3.4, 0); c.lineTo(0, 7); c.lineTo(-3.4, 0); c.closePath();
    const g = c.createLinearGradient(-3, -7, 3, 7); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#6ab8ff'); c.fillStyle = g; c.fill(); c.strokeStyle = '#2a5aa8'; c.lineWidth = 0.9; c.stroke(); c.restore();
    for (let i = 1; i <= 3; i++) { const b = a - i * 0.22; c.save(); c.globalAlpha = 0.5 - i * 0.12; ell(c, p.x + cos(b) * 42, p.y - 26 + sin(b) * 6, 1.8 - i * 0.3, 1.8 - i * 0.3, '#cfeaff'); c.restore(); } };
  S.da = crys(false); S.daFront = crys(true);
  // 라: 작은 뇌운 — 머리 위에 작은 먹구름 하나, 가끔 짧은 번개가 번쩍
  S.ra = (c, p, t) => { const x = p.x, y = p.y - 98 + sin(t * 1.6) * 1.5; c.save(); c.beginPath();
    for (const [dx, dy, r] of [[-11, 2, 6], [-4, -3, 8], [5, -2, 7], [12, 2, 5.5], [0, 3, 7]]) { c.moveTo(x + dx + r, y + dy); c.arc(x + dx, y + dy, r, 0, PI * 2); }
    const g = c.createLinearGradient(0, y - 11, 0, y + 9); g.addColorStop(0, '#9aa8c8'); g.addColorStop(1, '#4a5478'); c.fillStyle = g; c.fill();
    c.globalAlpha = 0.35; c.beginPath(); c.ellipse(x - 3, y - 6, 7, 3, 0, 0, PI * 2); c.fillStyle = '#e8eeff'; c.fill(); c.restore();
    const ph = (t * 0.9) % 1; if (ph < 0.18) { c.save(); c.globalAlpha = 1 - ph / 0.18; soft(c, x, y + 4, 18, 'rgba(255,250,170,.8)', 1); bolt(c, [[x + 1, y + 8], [x - 3, y + 15], [x + 2, y + 17], [x - 2, y + 25]], 1.4); c.restore(); } };
})();
