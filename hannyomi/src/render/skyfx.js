// 빌드 10: 하늘 스킬 효과 — 원을 겹친 구름 · 원 + 선 해 대신 진짜 구름 · 해 · 달 · 번개 · 별똥
//  (시안 · 결정 docs/drafts/design/sky_A/README.md, 시안 코드 skyreal.js · skyreal2.js 를 정리)
//  속도: 구름(작은 덩어리 140개)과 달은 처음 한 번만 그려 저장하고 매 프레임은 저장한 그림을 옮겨 그림 (prewarm 으로 게임 시작 뒤 미리 만듦)
//  skillx.js 의 FXS (stormcloud · cloud · sun · gate · darknight · thunderpillar) 와 PROJ.meteor 가 부름. PC · EXE 와 같이 쓰는 파일
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const SC = 0.75;   // 저장 그림 해상도 (구름은 부드러워서 줄여도 티가 안 남 → 메모리 · 만드는 시간 절약)

  // ---------- 구름 (저장) ----------
  const CACHE = new Map();
  // spec: { w, h, tone{top,mid,base,rim}, seed, flat, n, rs, lit: [[dx, dyH, rH, color], ...] }  lit = 구름 속 번쩍 (같은 모양에 덧그린 한 장 더)
  function buildCloud(sp, withLit) {
    const w = sp.w * SC, h = sp.h * SC, W = Math.ceil(w * 1.3), H = Math.ceil(h * 1.8), q = document.createElement('canvas'); q.width = W; q.height = H; const k = q.getContext('2d');
    const cx = W / 2, by = H * 0.72, n = sp.n || 140, flat = sp.flat || 1, rs = sp.rs || 1, seed = sp.seed, tone = sp.tone;
    const puff = (i) => { const u = rnd(seed + i * 3.1) * 2 - 1, v = rnd(seed + i * 7.7), dome = Math.sqrt(Math.max(0, 1 - u * u)) * flat; return [cx + u * w * 0.5, by - Math.sqrt(v) * dome * h * 0.8 - h * 0.06, (0.09 + 0.1 * rnd(seed + i * 1.3)) * h * (0.7 + 0.7 * dome) * rs]; };
    for (let i = 0; i < n; i++) { const [px, py, r] = puff(i); const g = k.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.72, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)'); k.fillStyle = g; k.beginPath(); k.arc(px, py, r, 0, PI * 2); k.fill(); }
    k.globalCompositeOperation = 'destination-out'; const cut = k.createLinearGradient(0, by - h * 0.05, 0, by + h * 0.25); cut.addColorStop(0, 'rgba(0,0,0,0)'); cut.addColorStop(1, 'rgba(0,0,0,1)'); k.fillStyle = cut; k.fillRect(0, by - h * 0.05, W, H);   // 바닥 평평
    k.globalCompositeOperation = 'source-in'; const sh = k.createLinearGradient(0, by - h, 0, by + h * 0.1); sh.addColorStop(0, tone.top); sh.addColorStop(0.5, tone.mid); sh.addColorStop(1, tone.base); k.fillStyle = sh; k.fillRect(0, 0, W, H);   // 위 밝고 아래 어둡게
    k.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 14; i++) { const u = rnd(seed + i * 5.3) * 2 - 1, px = cx + u * w * 0.45, py = by - Math.sqrt(Math.max(0, 1 - u * u)) * h * 0.8; const g = k.createRadialGradient(px, py - h * 0.05, 0, px, py, h * 0.28); g.addColorStop(0, tone.rim); g.addColorStop(1, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(px - h * 0.3, py - h * 0.3, h * 0.6, h * 0.6); }
    for (let i = 0; i < n; i += 2) { const [px, py, r] = puff(i);   // 덩어리마다 윗면 빛 · 아랫면 그림자 (뭉게구름 결)
      const g = k.createRadialGradient(px - r * 0.2, py - r * 0.45, 0, px, py, r); g.addColorStop(0, tone.rim); g.addColorStop(0.6, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(px - r, py - r, r * 2, r * 2);
      const d = k.createRadialGradient(px, py + r * 0.7, 0, px, py + r * 0.5, r); d.addColorStop(0, 'rgba(0,0,10,.18)'); d.addColorStop(1, 'rgba(0,0,10,0)'); k.fillStyle = d; k.fillRect(px - r, py - r * 0.3, r * 2, r * 2); }
    if (withLit) for (const [dx, dyH, rH, col] of sp.lit) { const x = cx + dx * SC, y = by - h * dyH, g = k.createRadialGradient(x, y, 0, x, y, h * rH); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(0, 0, W, H); }
    return { cv: q, cx: cx / SC, by: by / SC, W: W / SC, H: H / SC };
  }
  function cloudImg(name, sp, lit) { const key = name + (lit ? '#lit' : ''); let c = CACHE.get(key); if (!c) { c = buildCloud(sp, lit); CACHE.set(key, c); } return c; }
  function drawCloud(ctx, name, sp, x, y, a, litA) {
    const c = cloudImg(name, sp, false); ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.drawImage(c.cv, x - c.cx, y - c.by, c.W, c.H);
    if (litA > 0 && sp.lit) { const l = cloudImg(name, sp, true); ctx.globalAlpha = a * Math.min(1, litA); ctx.drawImage(l.cv, x - l.cx, y - l.by, l.W, l.H); }
    ctx.restore();
  }
  const STORM = { top: '#9aa4b8', mid: '#5c6478', base: '#2a2e3c', rim: 'rgba(230,236,250,.55)' };
  const STORM3 = { top: '#6a7090', mid: '#353a56', base: '#14162a', rim: 'rgba(170,200,255,.55)' };
  const SOFT = { top: '#f4f7ff', mid: '#c8d2e6', base: '#8a96b4', rim: 'rgba(255,255,255,.8)' };
  const VIO = { top: 'rgba(120,90,170,.9)', mid: 'rgba(60,40,100,.85)', base: 'rgba(30,20,60,.8)', rim: 'rgba(230,200,255,.5)' };
  const SPEC = {
    storm: { w: 620, h: 190, tone: STORM, seed: 11, lit: [[60, 0.3, 1, 'rgba(255,250,210,.75)']] },                    // 천궁 폭풍우
    thunder: { w: 700, h: 210, tone: STORM3, seed: 5, flat: 0.8, lit: [[40, 0.3, 1.1, 'rgba(170,215,255,.9)']] },     // 썬더 스톰 · 천둥 신의 분노
    gateL: { w: 380, h: 140, tone: SOFT, seed: 41 }, gateR: { w: 380, h: 140, tone: SOFT, seed: 47 },                  // 천공의 화살비
    nightC: { w: 360, h: 70, tone: VIO, seed: 71, flat: 0.45, n: 90, rs: 1.4 },                                        // 칠흑의 밤 (달 앞 구름)
    judge: { w: 520, h: 150, tone: STORM3, seed: 83, flat: 0.8, lit: [[-130, 0.15, 0.7, 'rgba(255,250,200,.75)'], [0, 0.15, 0.7, 'rgba(255,250,200,.75)'], [140, 0.15, 0.7, 'rgba(255,250,200,.75)']] },   // 천둥의 심판
  };

  // ---------- 번개 · 비 ----------
  function boltPath(x0, y0, x1, y1, seed, depth, br, out) { const segs = 9, pts = [[x0, y0]];
    for (let i = 1; i <= segs; i++) { const u = i / segs, nx = x0 + (x1 - x0) * u + (rnd(seed + i) - 0.5) * 46 * (1 - u * 0.4), ny = y0 + (y1 - y0) * u + (rnd(seed + i * 2) - 0.5) * 10; pts.push([nx, ny]);
      if (depth < 2 && rnd(seed + i * 9) > br) boltPath(nx, ny, nx + (rnd(seed + i * 4) - 0.5) * 160, ny + (y1 - y0) * 0.3, seed + i * 31, depth + 1, br, out); }
    out.push({ pts, w: depth ? 1.8 / depth : 4 }); }
  // 빛 번짐은 shadowBlur 대신 넓고 옅은 선 한 겹 더 (휴대폰에서 shadowBlur 가 무거움)
  function bolt(ctx, x0, y0, x1, y1, seed, glow, core, a, br) { const out = []; boltPath(x0, y0, x1, y1, seed, 0, br || 0.72, out); ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [m, cc, al] of [[11, glow, 0.3], [6, glow, 1], [2.2, core, 1], [1, '#ffffff', 1]]) { ctx.globalAlpha = a * al; ctx.strokeStyle = cc; for (const b of out) { ctx.lineWidth = b.w * m; ctx.beginPath(); b.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); } }
    ctx.restore(); }
  function rain(ctx, x, y, w, h, t, col, a) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i < 110; i++) { const u = rnd(i * 1.7), sp = 0.8 + rnd(i * 2.3) * 0.4, yy = ((t * 900 * sp + rnd(i * 3.9) * h) % h), xx = x - w / 2 + u * w - yy * 0.15; ctx.moveTo(xx, y + yy); ctx.lineTo(xx - 4, y + yy + 26); }
    ctx.stroke(); ctx.restore(); }
  const glowRG = (ctx, x, y, r, c0, c1) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); };
  const groundFlash = (ctx, x, y, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.scale(1, 0.3); glowRG(ctx, 0, 0, 160, `rgba(255,250,210,${a})`, 'rgba(255,240,150,0)'); ctx.restore(); };

  // ---------- 해 ----------
  function sun(ctx, x, y, r, t) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 5); halo.addColorStop(0, 'rgba(255,220,140,.5)'); halo.addColorStop(0.4, 'rgba(255,200,120,.16)'); halo.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 5, 0, PI * 2); ctx.fill();
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2 + t * 0.08 + rnd(i) * 0.2, L = r * (2.6 + rnd(i * 3) * 2.2), sp = 0.05 + rnd(i * 5) * 0.05; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cos(a - sp) * L, y + sin(a - sp) * L); ctx.lineTo(x + cos(a + sp) * L, y + sin(a + sp) * L); ctx.closePath();
      const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, L); g.addColorStop(0, 'rgba(255,240,190,.32)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    const core = ctx.createRadialGradient(x, y, 0, x, y, r * 1.25); core.addColorStop(0, '#ffffff'); core.addColorStop(0.55, '#fffbe8'); core.addColorStop(0.8, '#ffe9a0'); core.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = core; ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';   // 렌즈 빛 방울
    for (const [u, rr, col] of [[0.35, 18, 'rgba(255,230,160,.25)'], [0.6, 10, 'rgba(160,220,255,.22)'], [0.85, 30, 'rgba(255,200,140,.12)']]) { const px = x - 260 * u, py = y + 380 * u, g = ctx.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, col); g.addColorStop(0.7, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rr, 0, PI * 2); ctx.fill(); }
    ctx.restore(); }

  // ---------- 달 (저장) ----------
  let MOON = null;
  function moonImg() {
    if (MOON) return MOON; const r = 80, S = Math.ceil(r * 7), q = document.createElement('canvas'); q.width = q.height = S; const c = q.getContext('2d'), x = S / 2, y = S / 2;
    const col = { halo: 'rgba(200,120,255,.45)', light: '#f0d8ff', dark: '#8a5ac8', crater: 'rgba(90,40,140,.5)' };
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, col.light); g.addColorStop(1, col.dark); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.clip();
    for (let i = 0; i < 16; i++) { const cr = r * (0.06 + 0.16 * rnd(i * 7.7)), px = x + (rnd(i * 3.3) - 0.5) * r * 1.7, py = y + (rnd(i * 5.1) - 0.5) * r * 1.7; const cg = c.createRadialGradient(px + cr * 0.3, py + cr * 0.3, 0, px, py, cr); cg.addColorStop(0, col.crater); cg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = cg; c.beginPath(); c.arc(px, py, cr, 0, PI * 2); c.fill(); }
    const sh = c.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.5, 'rgba(10,6,30,0)'); sh.addColorStop(1, 'rgba(10,6,30,.55)'); c.fillStyle = sh; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
    return (MOON = { cv: q, S });
  }

  const fadeIn = (k, a) => k < a ? k / a : (1 - k) / (1 - a);
  const SK = G.SkyFX = {
    // 1 천궁 폭풍우: 거대한 적란운 + 비 + 갈라지는 노란 번개 (번개 칠 때 구름 속 번쩍)
    storm(ctx, f, k) { const a = fadeIn(k, 0.15), t = f.t, fl = Math.floor(k * 12) % 3 === 0;
      rain(ctx, f.x, f.y + 20, 520, 380, t, 'rgba(225,235,250,.75)', a);
      drawCloud(ctx, 'storm', SPEC.storm, f.x, f.y + 40, a * 0.97, fl ? 1 : 0);
      if (fl) bolt(ctx, f.x + 60, f.y + 30, f.x + 30, f.y + 400, 7 + Math.floor(k * 12), 'rgba(255,240,170,.8)', '#fff6c0', a); },
    // 2 썬더 스톰 · 천둥 신의 분노: 크고 진한 먹구름 띠 + 속 · 둘레 푸른 번쩍 + 양옆 가지 번개
    thunder(ctx, f, k) { const a = fadeIn(k, 0.15), t = f.t, fl = 0.55 + 0.45 * Math.max(0, sin(t * 9)), fx2 = f.x + 40;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowRG(ctx, fx2, f.y + 10, 360, `rgba(90,150,255,${0.45 * fl * a})`, 'rgba(90,150,255,0)'); ctx.restore();
      drawCloud(ctx, 'thunder', SPEC.thunder, f.x, f.y + 40, a, fl);
      for (const [dx, dy, ex, ey, sd] of [[-180, -10, -260, 20, 3], [200, 0, 290, 30, 8]]) bolt(ctx, f.x + dx, f.y + dy, f.x + ex, f.y + ey + 60, sd, 'rgba(120,180,255,.9)', '#d8ecff', a * fl * 0.9); },
    // 3 태양 낙하: 눈부신 해
    sun(ctx, f, k) { const a = fadeIn(k, 0.2); ctx.save(); ctx.globalAlpha = a; sun(ctx, f.x, f.y, 52, f.t); ctx.restore(); },
    // 4 천공의 화살비: 구름이 양옆으로 갈라지며 빛줄기가 쏟아짐
    gate(ctx, f, k) { const a = fadeIn(k, 0.2), t = f.t; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
      for (let i = 0; i < 9; i++) { const x0 = f.x - 90 + i * 22, sp = (i - 4) * 34; ctx.beginPath(); ctx.moveTo(x0 - 10, f.y + 20); ctx.lineTo(x0 + 10, f.y + 20); ctx.lineTo(x0 + sp + 40, f.y + 430); ctx.lineTo(x0 + sp - 40, f.y + 430); ctx.closePath();
        const g = ctx.createLinearGradient(0, f.y, 0, f.y + 430); g.addColorStop(0, `rgba(230,255,235,${0.3 + 0.1 * sin(t * 2 + i)})`); g.addColorStop(1, 'rgba(200,255,210,0)'); ctx.fillStyle = g; ctx.fill(); }
      const h = ctx.createRadialGradient(f.x, f.y + 10, 0, f.x, f.y + 10, 160); h.addColorStop(0, 'rgba(255,255,240,.95)'); h.addColorStop(0.4, 'rgba(200,255,210,.45)'); h.addColorStop(1, 'rgba(200,255,210,0)'); ctx.fillStyle = h; ctx.beginPath(); ctx.arc(f.x, f.y + 10, 160, 0, PI * 2); ctx.fill(); ctx.restore();
      drawCloud(ctx, 'gateL', SPEC.gateL, f.x - 230 - k * 40, f.y + 40, a, 0); drawCloud(ctx, 'gateR', SPEC.gateR, f.x + 230 + k * 40, f.y + 40, a, 0); },
    // 5 칠흑의 밤 · 야천 멸살: 하늘 전체가 위부터 어두워짐 + 별 + 보랏빛 달 + 지나가는 얇은 구름
    night(ctx, f, k) { const a = fadeIn(k, 0.2), t = f.t;
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a * 0.85; const g = ctx.createLinearGradient(0, f.y - 700, 0, f.y + 120); g.addColorStop(0, 'rgba(20,4,40,.95)'); g.addColorStop(1, 'rgba(60,20,90,.7)'); ctx.fillStyle = g; ctx.fillRect(f.x - 1400, f.y - 800, 2800, 1000);
      ctx.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { const x = f.x - 700 + rnd(i * 1.7) * 1400, y = f.y - 640 + rnd(i * 2.9) * 560, r = 1 + rnd(i * 4.1) * 2.2; ctx.globalAlpha = a * 0.8 * (0.4 + 0.6 * (0.5 + 0.5 * sin(t * 3 + i * 1.3))); ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); if (r > 2.6) { ctx.fillRect(x - r * 2.5, y - 0.5, r * 5, 1); ctx.fillRect(x - 0.5, y - r * 2.5, 1, r * 5); } }
      const M = moonImg(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; glowRG(ctx, f.x + 200, f.y - 220, 272, 'rgba(200,120,255,.45)', 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(M.cv, f.x + 200 - M.S / 2, f.y - 220 - M.S / 2); ctx.restore();
      drawCloud(ctx, 'nightC', SPEC.nightC, f.x + 150 + sin(t * 0.5) * 40, f.y - 170, a * 0.45, 0); },
    // 6 천둥의 심판: 하늘 번쩍 + 넓은 먹구름에서 번개 세 줄기 + 땅 충격 빛
    judge(ctx, f, k) { const a = 1 - k, top = f.y - 440;
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#fffbe0'; ctx.fillRect(f.x - 1400, f.y - 900, 2800, 1000); ctx.restore();
      [[0, 91, 0], [-130, 33, 1], [140, 57, 2]].forEach(([dx, sd, i]) => bolt(ctx, f.x + dx, top + 40, f.x + dx * 0.25, i ? f.y - 130 + i * 40 : f.y, sd, 'rgba(255,240,150,.95)', '#fff8d0', a * (i ? 0.75 : 1), 0.9));
      drawCloud(ctx, 'judge', SPEC.judge, f.x, top + 40, Math.min(1, a * 1.5), 1);
      groundFlash(ctx, f.x, f.y, a); },
    // 7 떨어지는 돌 (유성 낙하 · 태양 낙하): 하얗게 빛나는 별똥 (원점 = 발사체 자리, a = 날아가는 방향)
    meteor(ctx, ang, t) { const r = 26, L = r * 9; ctx.save(); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
      const tg = ctx.createLinearGradient(0, 0, -L, 0); tg.addColorStop(0, 'rgba(255,255,230,.95)'); tg.addColorStop(0.25, 'rgba(160,220,255,.6)'); tg.addColorStop(1, 'rgba(255,60,10,0)'); ctx.fillStyle = tg;
      ctx.beginPath(); ctx.moveTo(r * 0.3, -r * 1.05); ctx.quadraticCurveTo(-L * 0.4, -r * 0.9 + sin(t * 20) * 2, -L, 0); ctx.quadraticCurveTo(-L * 0.4, r * 0.9, r * 0.3, r * 1.05); ctx.closePath(); ctx.fill();
      glowRG(ctx, 0, 0, r * 2.6, 'rgba(200,235,255,.8)', 'rgba(255,100,20,0)');
      ctx.fillStyle = '#dff4ff'; for (let i = 0; i < 12; i++) { const u = (t * 2 + i / 12) % 1; ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.arc(-u * L * 0.8, (rnd(i) - 0.5) * r * 2 * (1 + u), 2.2 * (1 - u) + 0.6, 0, PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#e0f4ff'); g.addColorStop(1, 'rgba(160,210,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.2, 0, PI * 2); ctx.fill();
      ctx.restore(); },
    // 저장 그림 미리 만들기 (스킬을 처음 쓸 때 한 번 끊기지 않게)
    prewarm() { const list = [['storm', 1], ['thunder', 1], ['gateL', 0], ['gateR', 0], ['nightC', 0], ['judge', 1]]; let i = 0;
      const step = () => { if (i >= list.length) { moonImg(); return; } const [n, lit] = list[i++]; cloudImg(n, SPEC[n], false); if (lit) cloudImg(n, SPEC[n], true); setTimeout(step, 30); };
      step(); },
    // 같은 하늘 효과가 아직 앞부분(수명의 60%)이면 새로 만들지 않음 — 여러 번 때리는 스킬(천둥 신의 분노 6타)이 구름을 겹쳐 쌓아 느려지지 않게
    once(kind, life) { const now = performance.now(), L = SK.last[kind] || -1e9; if (now - L < life * 600) return false; SK.last[kind] = now; return true; },
    last: {}, CACHE, SPEC,
  };
  if (typeof window !== 'undefined') window.addEventListener('load', () => setTimeout(() => SK.prewarm(), 1500));
})();
