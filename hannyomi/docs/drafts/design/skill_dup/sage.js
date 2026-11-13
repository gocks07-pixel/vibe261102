// 현자 번개 4개 새 시안 + 게임풍 구름 (실제 사진 같은 구름 대신)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const M = G.SageMock = {};
  // ---------- 게임풍 구름: 큰 덩어리 몇 개를 한 실루엣으로 → 셀 음영 (가: 테두리 있음 · 나: 테두리 없이 부드럽게) ----------
  const TONE = { storm2: { out: '#5a6488', base: '#9aa4c4', dark: '#7d87aa', light: '#bcc4de', hi: '#e6ebf8' }, storm: { out: '#22264a', base: '#565e8c', dark: '#3a3f68', light: '#7f88ba', hi: '#b8c2ee' }, white: { out: '#6a7aa8', base: '#e8eefa', dark: '#b8c4e0', light: '#ffffff', hi: '#ffffff' } };
  function puffs(w, h, seed) { const P = [], n = Math.max(7, Math.round(w / h * 3.2)); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n * 2 - 1, d = Math.sqrt(Math.max(0, 1 - u * u * 0.9)); P.push([u * w * 0.44, -h * 0.16 - d * h * 0.34 + (rnd(seed + i) - 0.5) * h * 0.16, h * (0.16 + 0.2 * d) * (0.8 + rnd(seed + i * 3) * 0.45)]); }
    const m = Math.round(n * 0.6); for (let i = 0; i < m; i++) P.push([((i + 0.5) / m - 0.5) * w * 0.86, -h * 0.06, h * 0.2]); P.top = n; return P; }
  const silPath = (c, P, w, h) => { c.beginPath(); for (const [x, y, r] of P) { c.moveTo(x + r, y); c.arc(x, y, r, 0, PI * 2); } c.rect(-w * 0.46, -h * 0.22, w * 0.92, h * 0.24); };   // 아래는 평평
  M.cloud = (c, x, y, w, h, style, toneKey, seed, a = 1, flash = 0) => {   // 한 장으로 그린 뒤 통째로 투명하게 (안쪽 겹친 원이 비치지 않게)
    if (a >= 0.999) return M.cloudRaw(c, x, y, w, h, style, toneKey, seed, 1, flash);
    const W = Math.ceil(w * 1.2), H = Math.ceil(h * 1.3), q = document.createElement('canvas'); q.width = W; q.height = H; M.cloudRaw(q.getContext('2d'), W / 2, H * 0.9, w, h, style, toneKey, seed, 1, flash);
    c.save(); c.globalAlpha *= a; c.drawImage(q, x - W / 2, y - H * 0.9); c.restore(); };
  M.cloudRaw = (c, x, y, w, h, style, toneKey, seed, a = 1, flash = 0) => {
    const T = TONE[toneKey], P = puffs(w, h, seed); c.save(); c.translate(x, y); c.globalAlpha *= a; c.beginPath(); c.rect(-w, -h * 2, w * 2, h * 2 + (style === 'ga' ? 4 : 0)); c.clip();
    if (style === 'ga') { c.save(); c.lineJoin = 'round'; silPath(c, P, w, h); c.strokeStyle = T.out; c.lineWidth = M.olw || 7; c.stroke(); c.restore(); }   // 바깥 테두리 (안쪽 겹친 선은 아래 채우기가 덮음)
    silPath(c, P, w, h); c.fillStyle = T.base; c.fill();
    c.save(); silPath(c, P, w, h); c.clip();
    // 덩어리마다 위쪽 테두리만 밝게 (밝은 원 위에 본색 원을 아래로 비켜 덮어 초승달 모양 빛만 남김) → 공처럼 보이지 않음
    const top = P.slice(0, P.top).sort((p, q) => p[1] - q[1]).reverse();
    for (const [px, py, r] of top) { c.beginPath(); c.arc(px, py, r, 0, PI * 2); c.fillStyle = T.light; c.fill(); c.beginPath(); c.arc(px + r * 0.1, py + r * 0.26, r * 0.98, 0, PI * 2); c.fillStyle = T.base; c.fill(); }
    c.beginPath(); c.moveTo(-w, h); for (let i = 0; i <= 12; i++) { const u = i / 12, xx = -w * 0.55 + u * w * 1.1; c.lineTo(xx, -h * 0.1 + sin(u * 9 + seed) * h * 0.04); } c.lineTo(w, h); c.closePath(); c.fillStyle = T.dark; c.fill();
    for (let i = 0; i < 3; i++) { const [px, py, r] = top[Math.floor(rnd(seed + i * 13) * top.length)]; c.beginPath(); c.ellipse(px - r * 0.35, py - r * 0.6, r * 0.22, r * 0.09, -0.3, 0, PI * 2); c.fillStyle = T.hi; c.globalAlpha = (style === 'ga' ? 0.85 : 0.55) * a; c.fill(); c.globalAlpha = a; }
    if (style === 'na') { const g = c.createLinearGradient(0, -h * 0.6, 0, h * 0.1); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,30,.25)'); c.fillStyle = g; c.fillRect(-w, -h, w * 2, h * 1.4); }
    if (style === 'ga') { c.restore(); c.save(); c.strokeStyle = T.out; c.lineWidth = (M.olw || 7) / 2; c.beginPath(); c.moveTo(-w * 0.46, 0); c.lineTo(w * 0.46, 0); c.stroke(); silPath(c, P, w, h); c.clip(); }
    if (flash > 0) { const g = c.createRadialGradient(0, -h * 0.2, 0, 0, -h * 0.2, w * 0.45); g.addColorStop(0, `rgba(200,235,255,${0.85 * flash})`); g.addColorStop(1, 'rgba(160,210,255,0)'); c.fillStyle = g; c.fillRect(-w, -h, w * 2, h * 1.4); }
    c.restore(); c.restore(); };
  // ---------- 번개 (게임풍: 굵은 지그재그 + 흰 심 + 색 빛, 가지는 조금) ----------
  M.bolt = (c, x0, y0, x1, y1, seed, col, a, wid = 1, br = 2) => {
    const pts = [[x0, y0]], n = 8; for (let i = 1; i < n; i++) { const u = i / n; pts.push([x0 + (x1 - x0) * u + (rnd(seed + i) - 0.5) * 50 * wid, y0 + (y1 - y0) * u]); } pts.push([x1, y1]);
    const brs = []; for (let b = 0; b < br; b++) { const i = 2 + Math.floor(rnd(seed + b * 7) * (n - 3)), [bx, by] = pts[i], dx = (rnd(seed + b * 11) - 0.5) * 140; brs.push([[bx, by], [bx + dx * 0.5, by + 40], [bx + dx, by + 70 + rnd(seed + b) * 40]]); }
    c.save(); c.globalAlpha *= a; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [lw, cc, al] of [[22 * wid, col, 0.25], [10 * wid, col, 0.9], [4 * wid, '#ffffff', 1]]) { c.globalAlpha = a * al; c.strokeStyle = cc; c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.lineWidth = lw * 0.45; for (const b of brs) { c.beginPath(); b.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } }
    c.restore(); };
  M.spark = (c, x, y, r, col, a, seed) => { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const an = i / 8 * PI * 2 + rnd(seed + i), L = r * (0.6 + rnd(seed + i * 3) * 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(x + cos(an) * r * 0.25, y + sin(an) * r * 0.25); c.lineTo(x + cos(an) * L * 0.6 + 6, y + sin(an) * L * 0.6); c.lineTo(x + cos(an) * L, y + sin(an) * L); c.stroke(); } c.restore(); };
  const ring = (c, x, y, r, col, a, lw = 5) => { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(x, y, r, r * 0.28, 0, 0, PI * 2); c.stroke(); c.restore(); };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= a; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const BLUE = '#5ab4ff', GOLD = '#ffd84a';
  M.style = 'ga';
  // ===== 썬더 스톰 (3차): 흘러가는 뇌운 — 작은 뇌운이 앞으로 흘러가며 번개를 차례로 떨어뜨림 =====
  M.thunder = (c, p, k, gy) => { const a = k < 0.1 ? k / 0.1 : k > 0.85 ? (1 - k) / 0.15 : 1, cx = p.x + 120 + k * 520, cy = gy - 360;
    for (let i = 0; i < 8; i++) { const ti = 0.08 + i * 0.1, dt = k - ti; if (dt < 0 || dt > 0.12) continue; const bx = p.x + 160 + i * 66; const f = 1 - dt / 0.12; M.bolt(c, bx, cy + 10, bx + 8, gy, 30 + i, BLUE, f, 0.9, 1); M.spark(c, bx + 8, gy - 6, 40, '#cfe9ff', f, i); glow(c, bx + 8, gy - 6, 60, 'rgba(120,190,255,.8)', f); }
    M.cloud(c, cx, cy, 300, 120, M.style, 'storm', 3, a, Math.max(0, sin(k * 50)) * 0.8); };
  // ===== 낙뢰 (3차): 표적 낙뢰 — 적 머리 위에 표식 → 하늘 끝에서 굵은 번개가 한 줄씩 정확히 내리꽂힘 =====
  M.bolt3 = (c, p, k, gy, targets) => { targets.slice(0, 4).forEach((tx, i) => { const t0 = i * 0.12, u = k - t0; if (u < 0) return;
      const my = gy - 120; if (u < 0.3) { const s = u / 0.3; c.save(); c.translate(tx, my); c.rotate(u * 8); c.globalAlpha = 0.5 + 0.5 * s; c.strokeStyle = BLUE; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 26 - s * 8, 0, PI * 2); c.stroke(); for (let j = 0; j < 4; j++) { c.rotate(PI / 2); c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -18); c.stroke(); } c.restore(); }
      else if (u < 0.55) { const f = 1 - (u - 0.3) / 0.25; M.bolt(c, tx, gy - 720, tx, gy, 70 + i, BLUE, f, 1.1, 0); ring(c, tx, gy - 4, 30 + (1 - f) * 60, '#cfe9ff', f); M.spark(c, tx, gy - 30, 50, '#ffffff', f, i * 5); glow(c, tx, gy - 30, 90, 'rgba(120,190,255,.9)', f); } }); };
  // ===== 천둥의 심판 (4차) 새 안: 하늘 마법진에서 번개 창이 비스듬히 연달아 꽂힘 =====
  M.judgeNew = (c, p, k, gy) => { const a = k < 0.12 ? k / 0.12 : k > 0.85 ? (1 - k) / 0.15 : 1, cx = p.x + 420, cy = gy - 440;
    c.save(); c.translate(cx, cy); c.scale(1, 0.32); c.rotate(k * 2); c.globalAlpha = a; for (const [r, lw, col] of [[200, 6, BLUE], [170, 3, '#cfe9ff'], [120, 4, BLUE]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(0, 0, r, 0, PI * 2); c.stroke(); }
    for (let i = 0; i < 8; i++) { c.rotate(PI / 4); c.fillStyle = '#cfe9ff'; c.beginPath(); c.moveTo(0, -200); c.lineTo(10, -170); c.lineTo(0, -140); c.lineTo(-10, -170); c.closePath(); c.fill(); } c.restore(); glow(c, cx, cy, 220, 'rgba(120,190,255,.6)', a);
    for (let i = 0; i < 6; i++) { const t0 = 0.15 + i * 0.1, u = k - t0; if (u < 0 || u > 0.22) continue; const tx = p.x + 200 + i * 75, sx = cx - 160 + i * 60, f = u < 0.06 ? u / 0.06 : 1 - (u - 0.06) / 0.16;
      const e = Math.min(1, u / 0.06), ex = sx + (tx - sx) * e, ey = cy + (gy - cy) * e; M.bolt(c, sx, cy + 30, ex, ey, 90 + i, BLUE, f, 1.2, 0); if (e >= 1) { ring(c, tx, gy - 4, 40 + (u - 0.06) * 300, '#cfe9ff', f); M.spark(c, tx, gy - 20, 46, '#ffffff', f, i); } } };
  // ===== 천둥의 심판 (지금 그대로 · 노란 번개 세 줄기) — 비교용, 구름만 게임풍 =====
  M.judgeNow = (c, p, k, gy) => { const a = 1 - k, cx = p.x + 420, top = gy - 440; c.save(); c.globalAlpha = a * 0.3; c.fillStyle = '#fffbe0'; c.fillRect(p.x - 800, gy - 900, 2800, 1000); c.restore();
    [[0, 91], [-130, 33], [140, 57]].forEach(([dx, sd], i) => M.bolt(c, cx + dx, top + 40, cx + dx * 0.25, i ? gy - 130 + i * 40 : gy, sd, GOLD, a * (i ? 0.8 : 1), 1, 2));
    M.cloud(c, cx, top + 40, 520, 150, M.style, 'storm', 83, Math.min(1, a * 1.5), 0.8); glow(c, cx, gy, 160, 'rgba(255,240,160,.9)', a); };
  // ===== 천둥 신의 분노 (궁극기): 심판의 임팩트를 크게 — 화면 덮는 뇌운 + 번개 다섯 줄기 (가운데 아주 굵게) + 땅 충격파 + 튕기는 번개 =====
  M.wrath = (c, p, k, gy, targets) => { const a = k < 0.08 ? k / 0.08 : k > 0.8 ? (1 - k) / 0.2 : 1, cx = p.x + 430, top = gy - 460, hit = k > 0.18;
    if (hit) { c.save(); c.globalAlpha = Math.max(0, 0.45 - (k - 0.18) * 1.2); c.fillStyle = '#fffbe0'; c.fillRect(p.x - 800, gy - 900, 2800, 1000); c.restore(); }
    if (hit) { const f = Math.max(0, 1 - (k - 0.18) / 0.6); [[0, 11, 1.8], [-210, 33, 1], [220, 57, 1], [-110, 21, 0.8], [120, 45, 0.8]].forEach(([dx, sd, w], i) => M.bolt(c, cx + dx, top + 50, cx + dx * 0.35, gy, sd + Math.floor(k * 10), GOLD, f * (i ? 0.85 : 1), w, i ? 1 : 3));
      const r = (k - 0.18) * 900; ring(c, cx, gy - 4, r, '#fff4b0', f, 8); ring(c, cx, gy - 4, r * 0.7, GOLD, f, 4); glow(c, cx, gy - 20, 260, 'rgba(255,240,160,.95)', f);
      targets.forEach((tx, i) => { if (i && k > 0.3 && k < 0.7) M.bolt(c, targets[i - 1], gy - 50, tx, gy - 50, 200 + i + Math.floor(k * 20), '#9ad8ff', 0.8, 0.45, 0); }); }
    M.cloud(c, cx, top + 50, 900, 200, M.style, M.tone || 'storm', 7, a * (M.calpha || 1), hit ? Math.max(0, sin(k * 40)) : 0.3); };
})();
// 구름 그림체 비교용 장면: 지금(실제 같은 구름) · 가 · 나 를 한 화면에
G.SageMock.cloudCmp = (c, p, k, gy) => { const M = G.SageMock; G.SkyFX.thunder(c, { x: p.x + 60, y: gy - 470, t: 1.3 }, 0.5);
  M.cloud(c, p.x + 400, gy - 430, 300, 120, 'ga', 'storm', 3, 1, 0); M.cloud(c, p.x + 740, gy - 430, 300, 120, 'na', 'storm', 3, 1, 0);
  M.cloud(c, p.x + 400, gy - 250, 260, 100, 'ga', 'white', 5, 1, 0); M.cloud(c, p.x + 740, gy - 250, 260, 100, 'na', 'white', 5, 1, 0);
  c.save(); c.font = 'bold 22px sans-serif'; c.fillStyle = '#ffffff'; c.strokeStyle = '#1a2040'; c.lineWidth = 5; for (const [t, x] of [['지금 (실제 같은 구름)', p.x - 120], ['가: 테두리 + 셀 음영', p.x + 290], ['나: 테두리 없이', p.x + 660]]) { c.strokeText(t, x, gy - 540); c.fillText(t, x, gy - 540); } c.restore(); };

// 수정: 연한 구름 두 가지 (테두리 얇게 · 테두리 없이)
G.SageMock.wrathA = (c, p, k, gy, t) => { const M = G.SageMock; M.style = 'ga'; M.tone = 'storm2'; M.olw = 3; M.wrath(c, p, k, gy, t); M.olw = 0; M.tone = null; };
G.SageMock.wrathB = (c, p, k, gy, t) => { const M = G.SageMock; M.style = 'na'; M.tone = 'storm2'; M.wrath(c, p, k, gy, t); M.style = 'ga'; M.tone = null; };

G.SageMock.wrathA7 = (c, p, k, gy, t) => { G.SageMock.calpha = 0.7; G.SageMock.wrathA(c, p, k, gy, t); G.SageMock.calpha = 0; };
G.SageMock.wrathB7 = (c, p, k, gy, t) => { G.SageMock.calpha = 0.7; G.SageMock.wrathB(c, p, k, gy, t); G.SageMock.calpha = 0; };
G.SageMock.wrathA3 = (c, p, k, gy, t) => { G.SageMock.calpha = 0.3; G.SageMock.wrathA(c, p, k, gy, t); G.SageMock.calpha = 0; };
