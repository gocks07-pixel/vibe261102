// 현자의 각성 — 구름 + 파란 번개 (캐릭터를 치지 않음) 3안
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(120,180,255,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const bolt = (c, pts, w) => { c.lineCap = 'round'; c.lineJoin = 'round'; for (const [lw, col] of [[w + 2.4, 'rgba(40,90,220,.85)'], [w + 0.6, '#5ab4ff'], [w * 0.5, '#eaf8ff']]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } };
  // 구름: 한 덩어리 윤곽 (원 겹침 X) — 둥근 윗면 + 평평한 아랫면, 위 밝고 아래 어두운 그라데이션 + 윗면 빛
  const cloudPath = (c, x, y) => { c.beginPath(); c.moveTo(x - 16, y + 5); c.bezierCurveTo(x - 22, y + 5, x - 21, y - 4, x - 14, y - 3); c.bezierCurveTo(x - 14, y - 11, x - 4, y - 13, x - 1, y - 7);
    c.bezierCurveTo(x + 2, y - 15, x + 14, y - 13, x + 13, y - 4); c.bezierCurveTo(x + 21, y - 5, x + 22, y + 5, x + 16, y + 5); c.quadraticCurveTo(x, y + 8, x - 16, y + 5); c.closePath(); };
  const cloud = (c, x, y, inner) => { cloudPath(c, x, y); const g = c.createLinearGradient(0, y - 13, 0, y + 7); g.addColorStop(0, '#b4bfdc'); g.addColorStop(0.55, '#6e7aa4'); g.addColorStop(1, '#3e4670'); c.fillStyle = g; c.fill();
    if (inner) { c.save(); cloudPath(c, x, y); c.clip(); inner(); c.restore(); }
    c.save(); cloudPath(c, x, y); c.clip(); c.globalAlpha = 0.45; c.beginPath(); c.ellipse(x - 2, y - 10, 13, 4, 0, 0, PI * 2); c.fillStyle = '#eef2ff'; c.fill(); c.restore(); };
  const S = G.AuraM4b2 = {};
  // 가: 반쯤 나온 번개 — 구름 아래로 파란 번개 끝이 비스듬히 반쯤 삐져나와 깜빡임 (머리 쪽 아님, 바깥으로)
  S.ga = (c, p, t) => { const x = p.x, y = p.y - 102 + sin(t * 1.6) * 1.5, on = 0.7 + 0.3 * (Math.floor(t * 8) % 3 ? 1 : 0.3);
    soft(c, x + 9, y + 6, 14, 'rgba(110,180,255,.6)', on); c.save(); c.globalAlpha = on; bolt(c, [[x + 6, y - 2], [x + 11, y + 5], [x + 8, y + 7], [x + 15, y + 14]], 1.2); c.restore(); cloud(c, x, y);
    c.save(); c.globalAlpha = on * 0.9; bolt(c, [[x + 4, y - 4], [x + 7, y + 1]], 1.2); c.restore(); };
  // 나: 구름 속 번개 — 구름 안에서 파란 번개가 번쩍이며 구름이 속에서 빛남 (밖으로 안 나옴)
  S.na = (c, p, t) => { const x = p.x, y = p.y - 102 + sin(t * 1.6) * 1.5, ph = (t * 0.9) % 1, fl = ph < 0.3 ? 1 - ph / 0.3 : 0.15;
    soft(c, x, y, 26, 'rgba(110,180,255,.55)', fl); cloud(c, x, y, () => { soft(c, x + 2, y - 2, 18, 'rgba(160,215,255,.95)', fl); c.globalAlpha = 0.4 + 0.6 * fl; bolt(c, [[x - 10, y - 6], [x - 3, y - 1], [x - 5, y + 2], [x + 6, y + 4]], 1.1); }); };
  // 다: 번개 꿰뚫은 구름 — 파란 번개 하나가 구름을 비스듬히 가로질러 위아래 바깥으로 반쯤 나옴 (아래쪽 끝은 옆으로)
  S.da = (c, p, t) => { const x = p.x, y = p.y - 102 + sin(t * 1.6) * 1.5, on = 0.75 + 0.25 * sin(t * 7);
    soft(c, x, y, 24, 'rgba(110,180,255,.5)', on); const pts = [[x - 14, y - 16], [x - 4, y - 5], [x - 8, y - 2], [x + 6, y + 6], [x + 3, y + 8], [x + 18, y + 13]];
    c.save(); c.globalAlpha = on; bolt(c, pts, 1.3); c.restore(); cloud(c, x, y); c.save(); cloudPath(c, x, y); c.clip(); c.globalAlpha = 0.5 * on; bolt(c, pts, 1.3); c.restore(); };
  S.ra = G.AuraM4b.ra;
})();
