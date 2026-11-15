// 천궁 3개 새 시안: 급강하 화살 · 매의 일격 · 화살 폭풍 (바람 = 연두 · 하늘빛)
(function () { const PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max;
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  const M = G.SageMock = G.SageMock || {};
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalAlpha *= a; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(180,255,210,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const arrow = (c, x, y, ang, s = 1, glowA = 1) => { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); glow(c, 6, 0, 26, 'rgba(200,255,220,.7)', glowA);
    c.strokeStyle = '#7a5a2a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-24, 0); c.lineTo(12, 0); c.stroke();
    c.fillStyle = '#eef6ff'; c.beginPath(); c.moveTo(22, 0); c.lineTo(10, -6); c.lineTo(13, 0); c.lineTo(10, 6); c.closePath(); c.fill(); c.strokeStyle = '#6a7a8a'; c.lineWidth = 1; c.stroke();
    for (const sg of [-1, 1]) { c.fillStyle = '#7ad88a'; c.beginPath(); c.moveTo(-24, 0); c.lineTo(-30, sg * 7); c.lineTo(-18, sg * 2); c.closePath(); c.fill(); } c.restore(); };
  const wind = (c, x, y, ang, L, a, w = 2.4) => { c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha *= a; c.strokeStyle = 'rgba(220,255,235,.9)'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-L * 0.5, -8, -L, 0); c.stroke(); c.restore(); };
  const ring = (c, x, y, r, col, a, lw = 4, sy = 0.25) => { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(x, y, r, r * sy, 0, 0, PI * 2); c.stroke(); c.restore(); };
  // ===== 급강하 화살: 활시위를 위로 → 화살이 하늘로 솟았다가 큰 화살이 되어 바람을 가르며 비스듬히 내리꽂힘 → 땅에 박히며 바람 충격파 =====
  M.dive = (c, p, k, gy, T) => { const tx = T[1], ang = 1.05;
    if (k < 0.2) { const u = k / 0.2; arrow(c, p.x + 20 + u * 60, gy - 50 - u * 420, -PI / 2 + 0.25, 0.8); for (let i = 0; i < 3; i++) wind(c, p.x + 20 + u * 60, gy - 30 - u * 420 + i * 18, PI / 2, 30, 0.6); return; }
    if (k < 0.45 && !M.diveNoFall) { const u = (k - 0.2) / 0.25, L = 520 * (1 - u), x = tx - cos(ang) * L, y = gy - 20 - sin(ang) * L;
      for (let i = 0; i < 8; i++) wind(c, x - cos(ang) * (30 + i * 22), y - sin(ang) * (30 + i * 22) + (i % 2 ? 10 : -10), ang + PI, 50, 0.8 - i * 0.08, 3);
      glow(c, x, y, 60, 'rgba(200,255,220,.6)', 1); arrow(c, x, y, ang, 2.2); return; }
    if (k < 0.45) return; const u = (k - 0.45) / 0.55, f = 1 - u; c.save(); c.globalAlpha = f; arrow(c, tx - cos(ang) * 20, gy - 20 - sin(ang) * 20, ang, 2.2, 0); c.restore();
    glow(c, tx, gy - 10, 90 * (0.5 + u), 'rgba(220,255,230,.8)', f); ring(c, tx, gy - 3, 40 + u * 200, 'rgba(220,255,235,.9)', f, 5); ring(c, tx, gy - 3, 20 + u * 140, '#9ae8b0', f, 3);
    for (let i = 0; i < 8; i++) { const an = PI + (i / 7) * PI, d = 30 + u * 120; wind(c, tx + cos(an) * d, gy - 6 + sin(an) * d * 0.4, an, 30, f); }
    for (let i = 0; i < 6; i++) { const an = -PI * (0.15 + rnd(i) * 0.7), d = u * (60 + rnd(i * 3) * 60); c.save(); c.globalAlpha = f; c.fillStyle = '#c8b090'; c.fillRect(tx + cos(an) * d - 3, gy - 6 + sin(an) * d + u * u * 60, 6, 4); c.restore(); } };
  // ===== 매의 일격: 하얀 바람 매가 날개를 크게 펄럭이며 낮게 날아가 첫 적을 발톱으로 덮침 → 깃털 · 바람 =====
  const hawk = (c, x, y, s, flap, t, a) => { c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); glow(c, 0, 0, 60, 'rgba(210,255,225,.55)', 1);
    const wing = (sg) => { const lift = sg < 0 ? 40 + flap * 30 : -(14 + flap * 10); c.beginPath(); c.moveTo(4, -2); c.bezierCurveTo(-8, -lift * 0.4, -26, -lift * 0.95, -58, -lift); for (let j = 0; j < 5; j++) c.lineTo(-58 + j * 9, -lift + (sg < 0 ? 1 : -1) * (j % 2 ? 9 : 3) + j * (sg < 0 ? 6 : -2)); c.quadraticCurveTo(-14, -lift * 0.1, -6, 4); c.closePath();
      const g = c.createLinearGradient(0, -Math.abs(lift), 0, 6); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#d8f0e4'); g.addColorStop(1, '#8ac8a8'); c.fillStyle = g; c.fill(); c.strokeStyle = '#4a7a6a'; c.lineWidth = 1.2; c.stroke(); };
    wing(1); c.beginPath(); c.moveTo(26, -4); c.quadraticCurveTo(14, -16, 0, -8); c.quadraticCurveTo(-26, -4, -40, 4); c.lineTo(-48, 0); c.lineTo(-46, 10); c.quadraticCurveTo(-20, 12, 4, 8); c.quadraticCurveTo(20, 6, 26, -4); c.fillStyle = '#f4fbf7'; c.fill(); c.strokeStyle = '#4a7a6a'; c.lineWidth = 1.2; c.stroke();
    wing(-1); c.fillStyle = '#ffd040'; c.beginPath(); c.moveTo(26, -6); c.quadraticCurveTo(34, -4, 30, 2); c.lineTo(24, 0); c.closePath(); c.fill(); c.fillStyle = '#1a2a24'; c.beginPath(); c.arc(18, -8, 2, 0, PI * 2); c.fill();
    c.strokeStyle = '#ffd040'; c.lineWidth = 2; for (const dx of [0, 6]) { c.beginPath(); c.moveTo(dx, 8); c.lineTo(dx + 4, 16); c.lineTo(dx + 8, 14); c.stroke(); } c.restore(); };
  M.hawk = (c, p, k, gy, T) => { const t = 1.3 + k * 3, tx = T[0], hit = 0.55;
    if (k < hit) { const u = k / hit, x = p.x + 40 + (tx - p.x - 40) * u, y = gy - 140 + sin(u * PI) * -30 + u * u * 80;
      for (let i = 0; i < 5; i++) wind(c, x - 40 - i * 26, y + (i % 2 ? 14 : -10), 0, 40, 0.7 - i * 0.12); hawk(c, x, y, 1.15, sin(t * 12), t, 1); return; }
    const u = (k - hit) / (1 - hit), f = 1 - u; hawk(c, tx - 10 + u * 120, gy - 80 - u * 160, 1.15, sin(t * 10), t, f);
    glow(c, tx, gy - 50, 70, 'rgba(230,255,240,.85)', f); c.save(); c.globalAlpha = f; c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(tx - 22 + i * 14, gy - 86); c.lineTo(tx - 10 + i * 14, gy - 22); c.stroke(); } c.restore();   // 발톱 자국
    for (let i = 0; i < 8; i++) { const an = rnd(i) * PI * 2, d = u * (40 + rnd(i * 3) * 70); c.save(); c.globalAlpha = f; c.translate(tx + cos(an) * d, gy - 55 + sin(an) * d + u * 40); c.rotate(an + u * 4); c.fillStyle = '#f4fbf7'; c.beginPath(); c.ellipse(0, 0, 7, 2.6, 0, 0, PI * 2); c.fill(); c.restore(); } };   // 깃털
  // ===== 화살 폭풍: 앞에 회오리 바람이 솟고 화살 수십 개가 회오리를 따라 빙글빙글 돌며 감겨 올라감 → 마지막에 사방으로 흩뿌려짐 =====
  M.storm = (c, p, k, gy, T) => { const cx = (T[0] + T[2]) / 2, H = 300, t = 1.3 + k * 3, rise = min(1, k / 0.2), f = k < 0.8 ? 1 : (1 - k) / 0.2, spin = k < 0.75;
    const back = (front) => { for (let i = 0; i < 6; i++) { c.save(); c.globalAlpha = f * (front ? 0.55 : 0.3); c.strokeStyle = '#e4fff0'; c.lineWidth = 3; c.beginPath(); for (let j = 0; j <= 40; j++) { const v = j / 40, y = gy - v * H * rise, w = 30 + v * 120, an = t * 6 + i * 1.05 - v * 4; const z = sin(an); if ((z > 0) !== front) { c.moveTo(cx + cos(an) * w, y); continue; } c.lineTo(cx + cos(an) * w, y + z * 10); } c.stroke(); c.restore(); } };
    back(false);
    for (let i = 0; i < 26; i++) { const v = (i / 26 + t * 0.15) % 1, an = t * 6 + i * 2.4 - v * 4, w = 30 + v * 120, x = cx + cos(an) * w, y = gy - 20 - v * (H - 30) * rise + sin(an) * 10;
      if (spin) arrow(c, x, y, an + PI / 2 - 0.4, 0.75, 0.5); else { const u = (k - 0.75) / 0.25, d = u * 260; arrow(c, x + cos(an) * d, y + u * 80, an, 0.75, 0.5); } }
    back(true); c.save(); c.translate(cx, gy - 2); c.scale(1, 0.22); const g = c.createRadialGradient(0, 0, 0, 0, 0, 150); g.addColorStop(0, 'rgba(200,255,220,.5)'); g.addColorStop(1, 'rgba(200,255,220,0)'); c.globalAlpha = f; c.fillStyle = g; c.beginPath(); c.arc(0, 0, 150, 0, PI * 2); c.fill(); c.restore();
    for (let i = 0; i < 10; i++) { const v = (t * 0.6 + rnd(i)) % 1, an = t * 7 + i; c.save(); c.globalAlpha = f * (1 - v); c.fillStyle = i % 2 ? '#8ad06a' : '#e8fff0'; c.translate(cx + cos(an) * (40 + v * 120), gy - v * H); c.rotate(an); c.beginPath(); c.ellipse(0, 0, 5, 2, 0, 0, PI * 2); c.fill(); c.restore(); } };
})();

G.SageMock.dive2 = (c, p, k, gy, T) => { G.SageMock.diveNoFall = 1; G.SageMock.dive(c, p, k, gy, T); G.SageMock.diveNoFall = 0; };
