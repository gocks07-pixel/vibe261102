// 하늘 스킬 진짜 구름 · 해 시안 — 도형 겹침 대신 부드러운 덩어리 + 빛 · 그림자
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const rnd = (s) => { let x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const R = G.SkyReal = {};
  // 구름 한 덩어리: 퍼프 수십 개(부드러운 원형 그라데이션)를 적란운 모양으로 뿌려 한 장에 그린 뒤
  // 위는 밝게 · 아래는 어둡게 음영, 가장자리는 흐리게. tone: {top, mid, base, rim}
  R.cloud = (c, x, y, w, h, tone, seed, t, opt = {}) => {
    const W = Math.ceil(w * 1.3), H = Math.ceil(h * 1.8), q = document.createElement('canvas'); q.width = W; q.height = H; const k = q.getContext('2d');
    const cx = W / 2, by = H * 0.72;   // 바닥선
    const n = opt.n || 140;
    for (let i = 0; i < n; i++) { const u = rnd(seed + i * 3.1) * 2 - 1, v = rnd(seed + i * 7.7);
      const px = cx + u * w * 0.5 + sin(t * 0.6 + i) * w * 0.006, dome = Math.sqrt(Math.max(0, 1 - u * u)) * (opt.flat || 1);
      const py = by - Math.sqrt(v) * dome * h * 0.8 - h * 0.06, r = (0.09 + 0.1 * rnd(seed + i * 1.3)) * h * (0.7 + 0.7 * dome) * (opt.rs || 1);
      const g = k.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.72, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)'); k.fillStyle = g; k.beginPath(); k.arc(px, py, r, 0, PI * 2); k.fill(); }
    // 바닥 평평하게: 아래쪽 흐리게 잘라냄
    k.globalCompositeOperation = 'destination-out'; const cut = k.createLinearGradient(0, by - h * 0.05, 0, by + h * 0.25); cut.addColorStop(0, 'rgba(0,0,0,0)'); cut.addColorStop(1, 'rgba(0,0,0,1)'); k.fillStyle = cut; k.fillRect(0, by - h * 0.05, W, H);
    // 색 입히기: 세로 음영 + 위쪽 빛
    k.globalCompositeOperation = 'source-in'; const sh = k.createLinearGradient(0, by - h, 0, by + h * 0.1); sh.addColorStop(0, tone.top); sh.addColorStop(0.5, tone.mid); sh.addColorStop(1, tone.base); k.fillStyle = sh; k.fillRect(0, 0, W, H);
    k.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 14; i++) { const u = rnd(seed + i * 5.3) * 2 - 1, px = cx + u * w * 0.45, py = by - Math.sqrt(Math.max(0, 1 - u * u)) * h * 0.8; const g = k.createRadialGradient(px, py - h * 0.05, 0, px, py, h * 0.28); g.addColorStop(0, tone.rim); g.addColorStop(1, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(px - h * 0.3, py - h * 0.3, h * 0.6, h * 0.6); }
    for (let i = 0; i < n; i += 2) { const u = rnd(seed + i * 3.1) * 2 - 1, v = rnd(seed + i * 7.7), dome = Math.sqrt(Math.max(0, 1 - u * u)) * (opt.flat || 1); const px = cx + u * w * 0.5, py = by - Math.sqrt(v) * dome * h * 0.8 - h * 0.06, r = (0.09 + 0.1 * rnd(seed + i * 1.3)) * h * (0.7 + 0.7 * dome) * (opt.rs || 1);
      const g = k.createRadialGradient(px - r * 0.2, py - r * 0.45, 0, px, py, r); g.addColorStop(0, tone.rim); g.addColorStop(0.6, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(px - r, py - r, r * 2, r * 2);
      const d = k.createRadialGradient(px, py + r * 0.7, 0, px, py + r * 0.5, r); d.addColorStop(0, 'rgba(0,0,10,.18)'); d.addColorStop(1, 'rgba(0,0,10,0)'); k.fillStyle = d; k.fillRect(px - r, py - r * 0.3, r * 2, r * 2); }
    if (opt.inner) opt.inner(k, cx, by, w, h);
    c.save(); c.globalAlpha *= (opt.alpha == null ? 1 : opt.alpha); c.drawImage(q, x - cx, y - by); c.restore();
  };
  // 진짜 번개: 갈라지는 가지 + 바깥 빛
  const boltPath = (x0, y0, x1, y1, seed, depth, out) => { const segs = 9; let px = x0, py = y0; const pts = [[px, py]];
    for (let i = 1; i <= segs; i++) { const u = i / segs; const nx = x0 + (x1 - x0) * u + (rnd(seed + i) - 0.5) * 46 * (1 - u * 0.4), ny = y0 + (y1 - y0) * u + (rnd(seed + i * 2) - 0.5) * 10; pts.push([nx, ny]);
      if (depth < 2 && rnd(seed + i * 9) > 0.72) boltPath(nx, ny, nx + (rnd(seed + i * 4) - 0.5) * 160, ny + (y1 - y0) * 0.3, seed + i * 31, depth + 1, out); }
    out.push({ pts, w: depth ? 1.4 / depth : 3 }); };
  R.bolt = (c, x0, y0, x1, y1, seed, col, a) => { const out = []; boltPath(x0, y0, x1, y1, seed, 0, out); c.save(); c.globalAlpha *= a; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [m, cc] of [[6, col.glow], [2.2, col.core], [1, '#ffffff']]) for (const b of out) { c.strokeStyle = cc; c.lineWidth = b.w * m; if (m === 6) { c.shadowColor = col.glow; c.shadowBlur = 18; } else c.shadowBlur = 0; c.beginPath(); b.pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } c.restore(); };
  R.rain = (c, x, y, w, h, t, col, a) => { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = 1.8; for (let i = 0; i < 110; i++) { const u = rnd(i * 1.7), sp = 0.8 + rnd(i * 2.3) * 0.4, yy = ((t * 900 * sp + rnd(i * 3.9) * h) % h); const xx = x - w / 2 + u * w - yy * 0.15; c.beginPath(); c.moveTo(xx, y + yy); c.lineTo(xx - 4, y + yy + 26); c.stroke(); } c.restore(); };
  // 진짜 해: 흰 핵 → 노랑 → 주황 코로나 · 부드러운 빛살 · 렌즈 고리
  R.sun = (c, x, y, r, t, hot) => { c.save(); c.globalCompositeOperation = 'lighter';
    const halo = c.createRadialGradient(x, y, r * 0.6, x, y, r * 5); halo.addColorStop(0, hot ? 'rgba(255,140,40,.55)' : 'rgba(255,220,140,.5)'); halo.addColorStop(0.4, hot ? 'rgba(255,90,20,.18)' : 'rgba(255,200,120,.16)'); halo.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = halo; c.beginPath(); c.arc(x, y, r * 5, 0, PI * 2); c.fill();
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2 + t * 0.08 + rnd(i) * 0.2, L = r * (2.6 + rnd(i * 3) * 2.2), sp = 0.05 + rnd(i * 5) * 0.05; c.beginPath(); c.moveTo(x, y); c.lineTo(x + cos(a - sp) * L, y + sin(a - sp) * L); c.lineTo(x + cos(a + sp) * L, y + sin(a + sp) * L); c.closePath();
      const g = c.createRadialGradient(x, y, r * 0.8, x, y, L); g.addColorStop(0, hot ? 'rgba(255,180,80,.35)' : 'rgba(255,240,190,.32)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fill(); }
    c.globalCompositeOperation = 'source-over';
    const core = c.createRadialGradient(x, y, 0, x, y, r * 1.25); core.addColorStop(0, '#ffffff'); core.addColorStop(0.55, hot ? '#fff0a0' : '#fffbe8'); core.addColorStop(0.8, hot ? '#ffb040' : '#ffe9a0'); core.addColorStop(1, hot ? 'rgba(255,110,30,0)' : 'rgba(255,220,140,0)'); c.fillStyle = core; c.beginPath(); c.arc(x, y, r * 1.25, 0, PI * 2); c.fill();
    if (hot) { // 표면 불꽃 혀 (태양 플레어)
      c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const a = i / 18 * PI * 2 + t * 0.3, L = r * (0.25 + 0.2 * (0.5 + 0.5 * sin(t * 4 + i * 2.1))); const bx = x + cos(a) * r * 0.95, by = y + sin(a) * r * 0.95;
        const g = c.createRadialGradient(bx, by, 0, bx, by, L); g.addColorStop(0, 'rgba(255,170,60,.7)'); g.addColorStop(1, 'rgba(255,80,20,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(bx + cos(a) * L * 0.4, by + sin(a) * L * 0.4, L, L * 0.45, a, 0, PI * 2); c.fill(); }
      c.globalCompositeOperation = 'source-over'; }
    c.restore(); };
  R.flare = (c, x, y, dx, dy, a) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= a; [[0.35, 18, 'rgba(255,230,160,.25)'], [0.6, 10, 'rgba(160,220,255,.22)'], [0.85, 30, 'rgba(255,200,140,.12)']].forEach(([u, r, col]) => { const g = c.createRadialGradient(x + dx * u, y + dy * u, 0, x + dx * u, y + dy * u, r); g.addColorStop(0, col); g.addColorStop(0.7, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x + dx * u, y + dy * u, r, 0, PI * 2); c.fill(); }); c.restore(); };

  // ===== 시안 =====
  const STORM = { top: '#9aa4b8', mid: '#5c6478', base: '#2a2e3c', rim: 'rgba(230,236,250,.55)' };
  const STORM2 = { top: '#8890a8', mid: '#4a5068', base: '#1e2030', rim: 'rgba(200,215,255,.45)' };
  const S = R.opt = {};
  // 1 천궁 폭풍우
  S.s1a = (c, f, k, t) => { const a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85, fl = (Math.floor(k * 12) % 3 === 0);   // 가: 거대한 적란운 + 비 + 구름 속 번쩍 · 갈라지는 번개
    R.rain(c, f.x, f.y + 20, 520, 380, t, 'rgba(225,235,250,.75)', a);
    R.cloud(c, f.x, f.y + 40, 620, 190, STORM, 11, t, { alpha: a * 0.97, inner: fl ? (k2, cx, by, w, h) => { const g = k2.createRadialGradient(cx + 60, by - h * 0.3, 0, cx + 60, by - h * 0.3, h); g.addColorStop(0, 'rgba(255,250,210,.75)'); g.addColorStop(1, 'rgba(255,250,210,0)'); k2.fillStyle = g; k2.fillRect(0, 0, k2.canvas.width, k2.canvas.height); } : null });
    if (fl) R.bolt(c, f.x + 60, f.y + 30, f.x + 30, f.y + 400, 7 + Math.floor(k * 12), { glow: 'rgba(255,240,170,.8)', core: '#fff6c0' }, a); };
  S.s1b = (c, f, k, t) => { const a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85;   // 나: 먹구름 + 아래로 내려오는 회오리 바람 깔때기 (바람의 궁수)
    const top = f.y + 50, bot = f.y + 400; c.save(); c.globalAlpha = a;
    for (let i = 0; i < 46; i++) { const u = i / 45, y = top + (bot - top) * u, w = 120 * Math.pow(1 - u, 1.6) + 14, sway = sin(t * 2 + u * 4) * 26 * u; const ph = t * 6 + u * 9;
      c.save(); c.translate(f.x + sway, y); c.scale(1, 0.22); const g = c.createRadialGradient(0, 0, w * 0.4, 0, 0, w); g.addColorStop(0, 'rgba(200,210,225,0)'); g.addColorStop(0.75, `rgba(${170 + 40 * u},${180 + 40 * u},${195 + 35 * u},.62)`); g.addColorStop(1, 'rgba(200,210,225,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, w, 0, PI * 2); c.fill();
      c.strokeStyle = 'rgba(250,252,255,.85)'; c.lineWidth = 3.4; c.beginPath(); c.arc(0, 0, w * 0.82, ph, ph + 1.4); c.stroke(); c.restore(); }
    for (let i = 0; i < 14; i++) { const u = (t * 0.7 + i / 14) % 1, y = bot - u * 300, ang = t * 5 + i * 2, w = 120 * Math.pow(1 - (y - top) / (bot - top), 1.6) + 20; c.save(); c.globalAlpha = a * (1 - u); c.fillStyle = i % 3 ? '#7a9a4a' : '#d8e4f0'; c.translate(f.x + cos(ang) * w, y + sin(ang) * w * 0.2); c.rotate(ang); c.beginPath(); c.ellipse(0, 0, 6, 2.4, 0, 0, PI * 2); c.fill(); c.restore(); }
    c.restore(); R.cloud(c, f.x, f.y + 50, 600, 170, STORM, 21, t, { alpha: a * 0.97 }); };
  // 2 썬더 스톰 · 천둥 신의 분노
  S.s2a = (c, f, k, t) => { const a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85, fl = Math.floor(k * 14) % 4 < 1;   // 가: 낮게 깔린 먹구름 띠 + 속에서 푸른 번쩍
    R.cloud(c, f.x, f.y + 30, 560, 150, STORM2, 5, t, { alpha: a, flat: 0.7, inner: (k2, cx, by, w, h) => { const fx2 = cx + (rnd(Math.floor(k * 14)) - 0.5) * w * 0.6; const g = k2.createRadialGradient(fx2, by - h * 0.25, 0, fx2, by - h * 0.25, h * 0.9); g.addColorStop(0, `rgba(150,200,255,${fl ? 0.85 : 0.25})`); g.addColorStop(1, 'rgba(150,200,255,0)'); k2.fillStyle = g; k2.fillRect(0, 0, k2.canvas.width, k2.canvas.height); } }); };
  S.s2b = (c, f, k, t) => { S.s2a(c, f, k, t); const a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85;   // 나: 가 + 구름 아래로 갈라지는 파란 번개 가지 (번개 발사체가 여기서 떨어짐)
    R.bolt(c, f.x + 40, f.y + 25, f.x + 10, f.y + 400, 13, { glow: 'rgba(120,180,255,.9)', core: '#cfe6ff' }, a * (0.7 + 0.3 * sin(t * 30))); };
  // 3 태양 낙하
  S.s3a = (c, f, k, t) => { const a = k < 0.2 ? k / 0.2 : (1 - k) / 0.8; c.save(); c.globalAlpha = a; R.sun(c, f.x, f.y, 52, t, false); R.flare(c, f.x, f.y, -260, 380, 1); c.restore(); };   // 가: 눈부신 한낮의 해
  S.s3b = (c, f, k, t) => { const a = k < 0.2 ? k / 0.2 : (1 - k) / 0.8; c.save(); c.globalAlpha = a; R.sun(c, f.x, f.y, 56, t, true); c.restore(); };   // 나: 불타는 태양 (표면 불꽃 · 붉은 코로나)
})();
