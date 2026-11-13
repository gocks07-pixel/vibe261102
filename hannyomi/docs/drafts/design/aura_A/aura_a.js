// 천궁의 각성 버프 모습 시안 가~라 (색을 직접 칠함 — 밝은 · 어두운 배경 모두 또렷)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const star = (c, x, y, r, f) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; c.lineTo(x + cos(a) * rr, y + sin(a) * rr); } c.closePath(); c.fillStyle = f; c.fill(); };
  const A = G.AuraMock = {};
  // 가: 바람 깃털 날개 — 깃털마다 흰색→하늘색, 테두리 옅은 남색, 날갯짓 · 흩날리는 깃털 · 바람 줄기
  A.ga = (c, p, t) => { const fl = sin(t * 3) * 0.1;
    for (const sg of [-1, 1]) { c.save(); c.translate(p.x - p.dir * 3 + sg * 4, p.y - 52); c.scale(sg, 1); c.rotate(-fl * 0.6);
      // 날개 뼈대 위 덮깃 → 큰 칼깃 (뒤에서 앞으로, 바깥 · 위로 퍼짐)
      const quill = (ang, L, w, c1, c2) => { c.save(); c.rotate(ang); c.beginPath(); c.moveTo(0, -w * 0.5); c.quadraticCurveTo(L * 0.5, -w * 1.3, L, -w * 0.2); c.quadraticCurveTo(L * 0.6, w * 0.9, 0, w * 0.5); c.closePath();
        const g = c.createLinearGradient(0, 0, L, 0); g.addColorStop(0, c1); g.addColorStop(1, c2); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(70,110,170,.4)'; c.lineWidth = 0.7; c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(3, 0); c.lineTo(L * 0.85, -w * 0.2); c.stroke(); c.restore(); };
      for (let i = 0; i < 7; i++) quill(-0.95 + i * 0.2, 58 - i * 4, 9, '#ffffff', i % 2 ? '#a8d8f8' : '#8ec8f0');   // 칼깃
      for (let i = 0; i < 6; i++) quill(-0.85 + i * 0.22, 34 - i * 2, 10, '#ffffff', '#d4ecff');   // 덮깃
      for (let i = 0; i < 4; i++) quill(-0.6 + i * 0.28, 18, 9, '#ffffff', '#eef8ff');   // 작은 깃
      c.restore(); }
    for (let i = 0; i < 4; i++) { const u = (t * 0.6 + i / 4) % 1, x = p.x + (i % 2 ? 1 : -1) * (40 + u * 30), y = p.y - 70 + u * 50; c.save(); c.globalAlpha = 1 - u; c.translate(x, y); c.rotate(t * 2 + i); ell(c, 0, 0, 6, 2, '#e8f6ff'); c.restore(); }
  };
  // 나: 금빛 별 활 — 등 뒤 큰 활 모양 빛 고리 · 시위 자리에 별 셋
  A.na = (c, p, t) => { c.save(); c.translate(p.x + p.dir * 14, p.y - 44);
    c.strokeStyle = '#a07a20'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 52, -PI * 0.75, PI * 0.75, true); c.stroke();
    c.strokeStyle = '#ffd860'; c.lineWidth = 3.4; c.stroke(); c.strokeStyle = '#fff6c8'; c.lineWidth = 1.2; c.stroke();
    const x0 = cos(PI * 0.75) * 52, y0 = sin(PI * 0.75) * 52; c.strokeStyle = 'rgba(255,240,200,.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, -y0); c.lineTo(x0, y0); c.stroke();
    for (let i = -1; i <= 1; i++) { const y = i * 18; glow(c, x0, y, 10, '#fff0a0', 0.6); star(c, x0, y, 5 + (i ? 0 : 2) + sin(t * 4 + i) * 0.8, '#fff2a8'); }
    c.restore(); };
  // 다: 회오리 바람 — 몸 둘레를 도는 하늘빛 바람 리본 셋 + 잎 · 깃털
  A.da = (c, p, t) => { c.save(); c.translate(p.x, p.y - 34);
    for (let k = 0; k < 3; k++) { c.strokeStyle = ['#8ed0f0', '#bfe8ff', '#6ab0e0'][k]; c.lineWidth = 3 - k * 0.6; c.lineCap = 'round'; c.beginPath();
      for (let i = 0; i <= 24; i++) { const u = i / 24, a = t * 3 + k * 2.1 + u * PI * 1.4, r = 26 + u * 6; const x = cos(a) * r, y = sin(a) * 8 - u * 30 + 15; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6, x = cos(a) * 30, y = sin(a) * 8 - 10 + i * 6; c.save(); c.translate(x, y); c.rotate(a); ell(c, 0, 0, 4, 1.8, i % 2 ? '#7ac85a' : '#eaf6ff'); c.restore(); }
    c.restore(); };
  // 라: 매의 눈 — 머리 위에 금빛 매 문양(날개 편 매 + 가운데 눈), 천천히 숨 쉬듯 빛남
  A.ra = (c, p, t) => { const y = p.y - 98, x = p.x, br = 0.8 + 0.2 * sin(t * 3);
    glow(c, x, y, 26, '#ffe080', 0.45 * br);
    for (const sg of [-1, 1]) { c.save(); c.translate(x, y); c.scale(sg, 1); c.beginPath(); c.moveTo(3, 0); c.quadraticCurveTo(14, -12, 26, -10); c.lineTo(20, -6); c.lineTo(26, -4); c.lineTo(18, -1); c.lineTo(22, 2); c.quadraticCurveTo(10, 4, 3, 4); c.closePath();
      c.fillStyle = '#f0c040'; c.fill(); c.strokeStyle = '#8a6010'; c.lineWidth = 1; c.stroke(); c.restore(); }
    ell(c, x, y + 1, 6, 4.4, '#fff8e0'); ell(c, x + 0.6, y + 1, 2.4, 3, '#3a6ad0'); ell(c, x, y, 0.8, 0.8, '#fff'); };
})();
