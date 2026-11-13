// 천붕검제의 각성 시안 2차 가~라 — 천궁처럼 간단한 모양 하나 (불 · 대검)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,120,30,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  // 작은 대검 (칼끝 아래) — 원점 = 코등이
  const sword = (c, L, W, hot) => { c.beginPath(); c.moveTo(-W / 2, 0); c.lineTo(-W / 2, L * 0.8); c.lineTo(0, L); c.lineTo(W / 2, L * 0.8); c.lineTo(W / 2, 0); c.closePath();
    const g = c.createLinearGradient(-W / 2, 0, W / 2, 0); g.addColorStop(0, '#8a3210'); g.addColorStop(0.45, hot); g.addColorStop(0.55, '#fff6e0'); g.addColorStop(1, '#8a3210'); c.fillStyle = g; c.fill(); c.strokeStyle = '#5a1e08'; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.moveTo(-W * 1.2, -1); c.quadraticCurveTo(0, -6, W * 1.2, -1); c.lineTo(W * 1.1, 2); c.quadraticCurveTo(0, -2, -W * 1.1, 2); c.closePath(); c.fillStyle = '#f0b840'; c.fill(); c.strokeStyle = '#7a4a10'; c.stroke();
    c.fillStyle = '#5a2010'; c.fillRect(-1.6, -12, 3.2, 11); ell(c, 0, -14, 3, 3, '#e0301a'); };
  const S = G.AuraW4a2 = {};
  // 가: 불꽃 검 문장 — 머리 위에 칼끝을 아래로 한 작은 금빛 대검 하나, 천천히 숨 쉬듯 빛남 (천궁 '매의 눈' 같은 크기)
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 116 + sin(t * 2) * 2, br = 0.8 + 0.2 * sin(t * 3);
    soft(c, x, y + 10, 24, 'rgba(255,140,40,.55)', br); c.save(); c.translate(x, y); sword(c, 30, 6, '#ffb040'); c.restore(); };
  // 나: 등 뒤 검의 그림자 — 등에 비스듬히 선 붉은 빛 대검 하나 (반투명, 날 끝만 살짝 타오름)
  S.na = (c, p, t) => { c.save(); c.translate(p.x - p.dir * 10, p.y - 92); c.rotate(p.dir * 0.42); c.globalAlpha = 0.78 + 0.12 * sin(t * 3);
    soft(c, 0, 40, 36, 'rgba(255,100,30,.4)', 1); sword(c, 86, 12, '#ff8a30'); c.restore(); };
  // 다: 불씨 고리 — 허리 둘레를 천천히 도는 가느다란 불 고리 하나 + 불씨 서넛
  S.da = (c, p, t) => { const cx = p.x, cy = p.y - 40, rx = 34, ry = 9;
    for (let i = 0; i < 40; i++) { const a = t * 1.2 + i / 40 * PI * 2, b = a + PI * 2 / 40, front = sin(a) > 0; if (front) continue;
      c.strokeStyle = `rgba(255,${120 + 80 * ((i % 8) / 8)},40,.9)`; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx + cos(a) * rx, cy + sin(a) * ry); c.lineTo(cx + cos(b) * rx, cy + sin(b) * ry); c.stroke(); }
    for (let i = 0; i < 4; i++) { const a = t * 1.2 + i * PI / 2; if (sin(a) > 0) continue; const x = cx + cos(a) * rx, y = cy + sin(a) * ry; soft(c, x, y, 7, 'rgba(255,150,40,.8)', 1); ell(c, x, y, 2, 2, '#fff0b0'); } };
  S.daFront = (c, p, t) => { const cx = p.x, cy = p.y - 40, rx = 34, ry = 9;
    for (let i = 0; i < 40; i++) { const a = t * 1.2 + i / 40 * PI * 2, b = a + PI * 2 / 40; if (sin(a) <= 0) continue;
      c.strokeStyle = `rgba(255,${120 + 80 * ((i % 8) / 8)},40,.95)`; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx + cos(a) * rx, cy + sin(a) * ry); c.lineTo(cx + cos(b) * rx, cy + sin(b) * ry); c.stroke(); }
    for (let i = 0; i < 4; i++) { const a = t * 1.2 + i * PI / 2; if (sin(a) <= 0) continue; const x = cx + cos(a) * rx, y = cy + sin(a) * ry; soft(c, x, y, 7, 'rgba(255,150,40,.8)', 1); ell(c, x, y, 2, 2, '#fff0b0'); } };
  // 라: 검기 날개 — 어깨 뒤 양쪽에 초승달 모양 붉은 검기 하나씩 (베고 지나간 자국 같은 모양)
  S.ra = (c, p, t) => { const f = sin(t * 2.4) * 0.06;
    for (const sg of [-1, 1]) { c.save(); c.translate(p.x - p.dir * 3 + sg * 6, p.y - 56); c.scale(sg, 1); c.rotate(0.02 + f);
      c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(30, 4, 46, -30); c.quadraticCurveTo(26, -6, 0, -4); c.closePath();
      const g = c.createLinearGradient(0, 0, 46, -30); g.addColorStop(0, 'rgba(255,240,200,.95)'); g.addColorStop(0.5, '#ff9a3a'); g.addColorStop(1, 'rgba(210,50,14,.85)'); c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(255,250,230,.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(2, 3); c.quadraticCurveTo(28, 1, 44, -28); c.stroke(); c.restore(); } };
})();
