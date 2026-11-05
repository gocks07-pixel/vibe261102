'use strict';
// 2.1 보스 기믹용 그림: 냉각 밸브 · 잊힌 별 · 가짜 바르크
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect;
  const glow = (c, x, y, r, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.save(); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  // 냉각 밸브: 굵은 배관 + 빨갛게 달아오른 밸브 손잡이 (부서지면 증기)
  G.MonArt.cool_valve = { die: 'crumble', sh: 0.6, draw(c, m, t) {
    rrect(c, -10, -60, 20, 60, 4, '#7a7a8a', '#4a4a5a'); rrect(c, -18, -66, 36, 10, 3, '#9a9aaa', '#4a4a5a');
    glow(c, 0, -40, 26, 'rgba(255,90,50,1)', 0.45 + 0.2 * Math.sin(t * 9));
    c.strokeStyle = '#ff5a3a'; c.lineWidth = 4; c.beginPath(); c.arc(0, -40, 11, 0, 7); c.stroke();
    for (let i = 0; i < 4; i++) { const a = t * 2 + i * Math.PI / 2; c.beginPath(); c.moveTo(0, -40); c.lineTo(Math.cos(a) * 11, -40 + Math.sin(a) * 11); c.stroke(); }
    for (let i = 0; i < 2; i++) glow(c, 6, -72 - ((t * 30 + i * 20) % 40), 9, 'rgba(230,230,240,1)', 0.45);
  } };
  // 잊힌 별: 검은 구 + 보랏빛 테두리 + 꺼져 가는 별
  G.MonArt.forgotten_star = { die: 'pop', sh: 0, draw(c, m, t) {
    c.translate(0, -24 + Math.sin(t * 3) * 4);
    glow(c, 0, 0, 30, 'rgba(160,80,255,1)', 0.55);
    ell(c, 0, 0, 14, 14, '#1a0a2a', '#c890ff', 2);
    c.fillStyle = `rgba(216,200,255,${0.5 + 0.3 * Math.sin(t * 5)})`; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + t, r = i % 2 ? 3 : 7; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
  } };
  // 가짜 바르크: 진짜와 같은 모습 (진짜만 연막 속에서 눈이 빛난다, world.js)
  if (G.MonArt.bark) G.MonArt.bark_decoy = G.MonArt.bark;
})();
