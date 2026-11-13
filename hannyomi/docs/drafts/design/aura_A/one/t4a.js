// 야천의 각성 시안 가~라 — 그림자 · 밤 · 표창 (작고 간단하게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(150,100,230,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const spark = (c, x, y, r, f) => { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fillStyle = f; c.fill(); };
  const toDag = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.8); };   // 칼날 y 3~20
  const shuri = (c, r, rot) => { c.save(); c.rotate(rot); c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, rr = i % 2 ? r * 0.32 : r; c.lineTo(cos(a) * rr, sin(a) * rr); } c.closePath();
    const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, '#e8e0ff'); g.addColorStop(1, '#5a3a9a'); c.fillStyle = g; c.fill(); c.strokeStyle = '#2a1450'; c.lineWidth = 0.9; c.stroke(); ell(c, 0, 0, r * 0.18, r * 0.18, '#2a1450'); c.restore(); };
  const S = G.AuraT4a = {};
  // 가: 초승달 문장 — 머리 위 은보랏빛 초승달 + 작은 별 하나
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 96 + sin(t * 2) * 1.5; soft(c, x, y, 20, 'rgba(180,150,255,.6)', 0.8 + 0.2 * sin(t * 3));
    const q = document.createElement('canvas'); q.width = q.height = 96; const k = q.getContext('2d'); k.scale(4, 4); k.translate(12, 12);
    k.beginPath(); k.arc(0, 0, 10.8, 0, PI * 2); k.fillStyle = '#3a2470'; k.fill(); k.globalCompositeOperation = 'destination-out'; k.beginPath(); k.arc(5.6, -3.4, 8.6, 0, PI * 2); k.fill();
    k.globalCompositeOperation = 'source-over'; const m = document.createElement('canvas'); m.width = m.height = 96; const n = m.getContext('2d'); n.scale(4, 4); n.translate(12, 12);
    n.beginPath(); n.arc(0, 0, 9.8, 0, PI * 2); const g = n.createLinearGradient(-10, -10, 6, 10); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a890e8'); n.fillStyle = g; n.fill(); n.globalCompositeOperation = 'destination-out'; n.beginPath(); n.arc(5.6, -3.4, 9.6, 0, PI * 2); n.fill();
    k.drawImage(m, -12, -12, 24, 24); c.drawImage(q, x - 12, y - 12, 24, 24);
    c.save(); c.globalAlpha = 0.6 + 0.4 * sin(t * 4); spark(c, x + 9, y - 2, 3.4, '#fff8d0'); c.restore(); };
  // 나: 따라다니는 그림자 표창 — 작은 보랏빛 표창 하나가 빙글빙글 돌며 허리 둘레를 돎 (화염군주 불씨와 같은 길)
  const orb = (front) => (c, p, t) => { const a = t * 1.6, x = p.x + cos(a) * 42, y = p.y - 26 + sin(a) * 6 + sin(t * 3) * 2; if ((sin(a) > 0) !== front) return;
    soft(c, x, y, 12, 'rgba(170,130,255,.6)', 1); c.save(); c.translate(x, y); shuri(c, 6.5, t * 9); c.restore();
    for (let i = 1; i <= 3; i++) { const b = a - i * 0.2; c.save(); c.globalAlpha = 0.45 - i * 0.12; ell(c, p.x + cos(b) * 42, p.y - 26 + sin(b) * 6, 2.2 - i * 0.4, 2.2 - i * 0.4, '#8a6ad0'); c.restore(); } };
  S.na = orb(false); S.naFront = orb(true);
  // 다: 밤빛 단검 — 단검 날이 보랏빛으로 빛나고 검은 연기가 살짝 피어오름
  S.daFront = (c, p, t) => { c.save(); toDag(c, p); const br = 0.75 + 0.25 * sin(t * 3); soft(c, 0, 12, 16, 'rgba(160,110,255,.65)', br);
    c.globalAlpha = 0.9 * br; const g = c.createLinearGradient(0, 3, 0, 20); g.addColorStop(0, '#d8c8ff'); g.addColorStop(1, '#7a4ae0'); c.beginPath(); c.roundRect(-2, 3, 4, 17, 2); c.fillStyle = g; c.fill(); c.globalAlpha = 1; c.fillStyle = '#ffffff'; c.fillRect(-0.5, 5, 1, 13);
    for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; c.save(); c.globalAlpha = 0.5 * (1 - u); ell(c, sin(t * 3 + i * 2) * 3 - u * 6, 8 + i * 4, 2.4 + u * 3, 1.6 + u * 2, '#2a1a40'); c.restore(); } c.restore(); };
  S.da = () => {};
  // 라: 별 밤 그림자 — 발밑 그림자가 넓은 밤하늘 웅덩이가 되고 안에서 작은 별이 반짝임
  S.ra = (c, p, t) => { c.save(); c.translate(p.x, p.y); c.beginPath(); c.ellipse(0, 0, 34, 8, 0, 0, PI * 2); const g = c.createRadialGradient(0, 0, 2, 0, 0, 34); g.addColorStop(0, 'rgba(30,14,60,.9)'); g.addColorStop(0.7, 'rgba(50,26,100,.7)'); g.addColorStop(1, 'rgba(70,40,140,0)');
    c.setTransform(c.getTransform().scale(1, 1)); c.fillStyle = g; c.save(); c.scale(1, 8 / 34); c.beginPath(); c.arc(0, 0, 34, 0, PI * 2); c.fill(); c.restore();
    for (let i = 0; i < 6; i++) { const x = cos(i * 2.3) * (10 + i * 3.4), y = sin(i * 2.3) * 4, a = 0.5 + 0.5 * sin(t * 3 + i * 1.7); c.save(); c.globalAlpha = a; spark(c, x, y, 1.8 + (i % 2), '#ffffff'); c.restore(); } c.restore(); };
})();
