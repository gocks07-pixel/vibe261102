// 화염군주의 각성 시안 가~라 — 불 · 군주 · 지팡이 (작고 간단하게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,120,30,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const flick = (c, x, y, h, w, t, s) => { const sw = sin(t * 9 + s) * w * 0.4; for (const [k, col] of [[1, '#e8401a'], [0.7, '#ff9a2a'], [0.4, '#ffe890']]) { const hh = h * k, ww = w * (0.4 + 0.6 * k); c.beginPath(); c.moveTo(x - ww, y); c.quadraticCurveTo(x - ww, y - hh * 0.6, x + sw * k, y - hh); c.quadraticCurveTo(x + ww, y - hh * 0.6, x + ww, y); c.quadraticCurveTo(x, y + ww * 0.8, x - ww, y); c.fillStyle = col; c.fill(); } };
  const toWand = (c, p) => { c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.4); };   // 지팡이 구슬 (0,25)
  const S = G.AuraM4a = {};
  // 가: 불꽃 왕관 문장 — 머리 위 작은 금관, 뾰족한 세 끝에 작은 불꽃
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 96 + sin(t * 2) * 1.5; soft(c, x, y - 4, 22, 'rgba(255,140,40,.6)', 0.8 + 0.2 * sin(t * 3));
    c.save(); c.translate(x, y); c.beginPath(); c.moveTo(-11, 5); c.lineTo(-12, -6); c.lineTo(-6, -1); c.lineTo(0, -9); c.lineTo(6, -1); c.lineTo(12, -6); c.lineTo(11, 5); c.closePath();
    const g = c.createLinearGradient(0, -9, 0, 5); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#d89020'); c.fillStyle = g; c.fill(); c.strokeStyle = '#7a4a10'; c.lineWidth = 1.2; c.stroke(); ell(c, 0, 1.5, 2, 2, '#e0301a');
    flick(c, -12, -6, 8, 2.4, t, 0); flick(c, 0, -9, 10, 2.8, t, 2); flick(c, 12, -6, 8, 2.4, t, 4); c.restore(); };
  // 나: 불꽃 구슬 지팡이 — 지팡이 끝 구슬이 작은 불덩이가 되어 일렁임
  S.naFront = (c, p, t) => { c.save(); toWand(c, p); soft(c, 0, 25, 16, 'rgba(255,120,30,.7)', 0.8 + 0.2 * sin(t * 4)); ell(c, 0, 25, 5.4, 5.4, '#ff6a1a'); ell(c, 0, 25, 3.6, 3.6, '#ffc040'); ell(c, -0.8, 24.2, 1.8, 1.8, '#fff6d0');
    c.restore(); c.save(); c.translate(p.x, p.y); c.scale(p.dir, 1); c.translate(2, -31); c.rotate(-0.3); c.translate(0, 14); c.rotate(-1.4); c.translate(0, 25); const m = c.getTransform(); c.restore();
    const ox = m.e / (c.getTransform().a || 1), oy = m.f / (c.getTransform().d || 1); c.save(); c.setTransform(c.getTransform()); flick(c, ox, oy - 3, 11, 3.4, t, 1); c.restore(); };
  S.na = () => {};
  // 다: 따라다니는 불씨 — 작은 불덩이 하나가 몸 둘레를 천천히 돎 (앞 · 뒤)
  const orb = (front) => (c, p, t) => { const a = t * 1.6, x = p.x + cos(a) * 30, y = p.y - 50 + sin(a) * 8 + sin(t * 3) * 2; if ((sin(a) > 0) !== front) return;
    soft(c, x, y, 14, 'rgba(255,120,30,.6)', 1); flick(c, x, y + 2, 12, 4, t, 3); ell(c, x, y + 1, 4, 4, '#ffb030'); ell(c, x - 0.6, y + 0.4, 2, 2, '#fff6d0');
    for (let i = 1; i <= 3; i++) { const b = a - i * 0.22; c.save(); c.globalAlpha = 0.5 - i * 0.12; ell(c, p.x + cos(b) * 30, p.y - 50 + sin(b) * 8, 2.4 - i * 0.4, 2.4 - i * 0.4, '#ff8a30'); c.restore(); } };
  S.da = orb(false); S.daFront = orb(true);
  // 라: 업화 발판 — 발밑 붉은 원 + 불꽃 문양 네 개가 천천히 도는 작은 마법진
  S.ra = (c, p, t) => { c.save(); c.translate(p.x, p.y - 1); c.scale(1, 0.3); c.globalAlpha = 0.85 + 0.15 * sin(t * 3); c.lineWidth = 2.6; c.strokeStyle = '#e8501a'; c.beginPath(); c.arc(0, 0, 32, 0, PI * 2); c.stroke();
    c.lineWidth = 1.2; c.strokeStyle = '#ffb040'; c.beginPath(); c.arc(0, 0, 25, 0, PI * 2); c.stroke(); c.rotate(t * 0.5);
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * PI / 2); c.translate(0, -28); c.beginPath(); c.moveTo(-3, 3); c.quadraticCurveTo(-3, -2, 0, -6); c.quadraticCurveTo(3, -2, 3, 3); c.closePath(); c.fillStyle = '#ffd060'; c.fill(); c.restore(); } c.restore();
    for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; c.save(); c.globalAlpha = 1 - u; ell(c, p.x - 18 + i * 18, p.y - 4 - u * 26, 1.6, 1.6, '#ffc040'); c.restore(); } };
})();
