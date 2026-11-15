// 빌드 11: 마법사 공격 스킬 20개 새 모습 — "더 실제처럼" (시안 · 결정 docs/drafts/design/skill_dup/README.md, 계획 docs/drafts/plan_build11.md)
//  불: 열에 따라 식는 불 입자(빛 겹침 · 위로 길쭉 · 흔들림) + 연기 + 불빛 + 꼬리 불씨 / 번개: 잘게 갈라지는 실제 번개 / 얼음: 투명한 결정 · 서리 안개
//  skillx.js 다음에 불러와 G.SkillX 의 FXS · PROJ · LAND · ZONE_DRAW · HIT 를 마법사 것만 바꾸고, G.SKILL_X 의 마법사 줄에 새 연출 이름을 붙임 (수치는 그대로)
//  속도: 둥근 그라데이션은 색마다 한 번 그려 둔 작은 그림(스프라이트)을 늘려 찍음. 구름은 한 번 그려 저장. PC · EXE 와 같이 쓰는 파일
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max, abs = Math.abs;
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  const now = () => performance.now() / 1000;

  // ---------- 둥근 빛 · 연기 스프라이트 (색마다 1장) ----------
  const SPR = new Map();
  function sprite(rgb) { let s = SPR.get(rgb); if (s) return s; s = document.createElement('canvas'); s.width = s.height = 64; const k = s.getContext('2d'), g = k.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.5, `rgba(${rgb},.45)`); g.addColorStop(1, `rgba(${rgb},0)`); k.fillStyle = g; k.fillRect(0, 0, 64, 64); SPR.set(rgb, s); return s; }
  const soft = (c, x, y, r, rgb, al, add, sy = 1) => { if (al <= 0.004 || r <= 0.5) return; const op = c.globalCompositeOperation, ga = c.globalAlpha; if (add) c.globalCompositeOperation = 'lighter'; c.globalAlpha = ga * min(1, al); c.drawImage(sprite(rgb), x - r, y - r * sy, r * 2, r * 2 * sy); c.globalAlpha = ga; c.globalCompositeOperation = op; };

  // ---------- 불 ----------
  const HEAT = [[1, [255, 226, 160]], [0.75, [255, 180, 76]], [0.5, [255, 122, 34]], [0.3, [205, 58, 18]], [0.17, [110, 52, 40]], [0, [74, 70, 76]]];
  const HCOL = []; for (let i = 0; i <= 20; i++) { const h = i / 20; let rgb = HEAT[HEAT.length - 1][1]; for (let j = 1; j < HEAT.length; j++) if (h >= HEAT[j][0]) { const [h0, a] = HEAT[j - 1], [h1, b] = HEAT[j], u = (h - h1) / (h0 - h1); rgb = a.map((v, q) => Math.round(b[q] + (v - b[q]) * u)); break; } HCOL.push(rgb.join(',')); }
  const puff = (c, x, y, r, h, a) => { if (a <= 0.01 || r <= 0.5) return; h = max(0, min(1, h)); const smoke = h < 0.18, al = smoke ? a * 0.34 : a * (0.17 + 0.22 * h); soft(c, x, y, r, HCOL[Math.round(h * 20)], al, !smoke, smoke ? 1 : 1.35); };
  const glowG = (c, x, y, r, a) => soft(c, x, y, r, '255,140,50', 0.22 * a, true);
  const glow = (c, x, y, r, rgb, a) => soft(c, x, y, r, rgb, a, true);
  const flame = (c, x, y, H, W, n, t, a, seed = 0, sp = 1.6) => { n = Math.round(n * 1.8 * fxMul());
    for (let i = 0; i < n; i++) { const u = (t * sp + rnd(seed + i)) % 1, sx = (rnd(seed + i * 3) - 0.5) * W, turb = (sin(t * 9 + i * 1.7) * 0.6 + sin(t * 17 + i) * 0.4) * W * 0.18 * u;
      puff(c, x + sx * (1 - u * 0.85) + turb, y - u * H * (0.8 + rnd(seed + i * 5) * 0.4), W * (0.3 - u * 0.17) + 2.5, 1.02 - u * 1.15 - abs(sx) / W * 0.35, a * (u < 0.12 ? u / 0.12 : 1)); }
    for (let i = 0; i < Math.round(n * 0.25); i++) { const u = (t * sp * 0.6 + rnd(seed + i * 9)) % 1; puff(c, x + (rnd(seed + i * 4) - 0.5) * W * 0.6 + sin(t * 3 + i) * 10 * u, y - H * (0.75 + u * 0.7), W * (0.22 + u * 0.3), 0.08, a * (1 - u) * 0.8); }
    glowG(c, x, y - H * 0.25, W * 1.4 + H * 0.3, a * 0.5); };
  const embers = (c, x, y, H, W, n, t, a, seed = 0) => { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.strokeStyle = '#ffc860'; c.lineWidth = 1.6;
    for (let i = 0; i < n; i++) { const u = (t * 0.9 + rnd(seed + i * 5)) % 1, px = x + (rnd(seed + i) - 0.5) * W + sin(t * 3 + i) * 12 * u, py = y - u * H, vx = cos(t * 3 + i) * 3; c.globalAlpha = a * (1 - u) * (0.6 + 0.4 * sin(t * 30 + i)); c.beginPath(); c.moveTo(px, py); c.lineTo(px - vx, py + 5); c.stroke(); } c.restore(); };
  const scorch = (c, x, gy, r, a) => soft(c, x, gy - 1, r, '200,70,25', 0.6 * a, false, 0.2);
  const burst = (c, x, y, R, u, n, seed = 0) => { const f = 1 - u; glow(c, x, y, R * 1.3, '255,200,90', 0.7 * f * f);
    for (let i = 0; i < n; i++) { const an = rnd(seed + i) * PI * 2, d = R * (0.2 + rnd(seed + i * 3) * 0.8) * (0.3 + u * 0.9); puff(c, x + cos(an) * d, y + sin(an) * d * 0.75 - u * R * 0.35, R * (0.35 - u * 0.12) * (0.7 + rnd(i) * 0.6), 1 - u * 1.1 - rnd(seed + i * 7) * 0.15, min(1, f * 1.6)); } };
  const fireball = (c, x, y, r, dir, t, seed = 0) => { for (let i = 0; i < 16; i++) { const u = i / 16, j = (t * 6 + rnd(seed + i)) % 1; puff(c, x - dir * (u * r * 5 + j * 6), y + sin(t * 20 + i) * r * 0.2 * u, r * (1 - u * 0.75), 0.95 - u * 0.75, 0.9); } glow(c, x, y, r * 2.4, '255,180,70', 0.6); puff(c, x, y, r * 0.8, 1, 1); };
  const rock = (c, r, seed) => { c.beginPath(); for (let i = 0; i < 9; i++) { const an = i / 9 * PI * 2, rr = r * (0.8 + rnd(seed + i) * 0.3); c.lineTo(cos(an) * rr, sin(an) * rr); } c.closePath(); const g = c.createRadialGradient(r * 0.3, 0, 0, 0, 0, r); g.addColorStop(0, '#ffb040'); g.addColorStop(0.5, '#8a3a18'); g.addColorStop(1, '#2a120a'); c.fillStyle = g; c.fill(); };
  function fxMul() { return (G.Settings && G.Settings.fxMul) || 1; }

  // ---------- 번개 ----------
  function boltPath(x0, y0, x1, y1, seed, rough, depth, out, br) { let pts = [[x0, y0], [x1, y1]], d = Math.hypot(x1 - x0, y1 - y0) * rough, s = seed;
    for (let it = 0; it < 6; it++) { const np = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], l = Math.hypot(bx - ax, by - ay) || 1, o = (rnd(s++) - 0.5) * d; np.push([(ax + bx) / 2 - (by - ay) / l * o, (ay + by) / 2 + (bx - ax) / l * o], [bx, by]); } pts = np; d *= 0.52; }
    out.push({ pts, w: depth }); if (depth < 2) for (let b = 0; b < br; b++) { const i = 6 + Math.floor(rnd(seed + b * 13) * (pts.length * 0.6)), [bx, by] = pts[i], an = Math.atan2(y1 - y0, x1 - x0) + (rnd(seed + b * 7) - 0.5) * 1.6, L = Math.hypot(x1 - x0, y1 - y0) * (0.18 + rnd(seed + b) * 0.2); boltPath(bx, by, bx + cos(an) * L, by + sin(an) * L, seed + b * 101, rough, depth + 1, out, 1); } }
  const zap = (c, x0, y0, x1, y1, seed, a, opt = {}) => { if (a <= 0.01) return; const out = []; boltPath(x0, y0, x1, y1, seed, opt.rough || 0.22, 0, out, opt.br == null ? 3 : opt.br); const col = opt.col || '150,200,255';
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [w, rgb, al] of [[16, col, 0.12], [7, col, 0.35], [2.6, '220,236,255', 0.9], [1.1, '255,255,255', 1]]) { for (const b of out) { const k = b.w ? (b.w === 1 ? 0.45 : 0.25) : 1; c.strokeStyle = `rgba(${rgb},${al * a * (b.w ? 0.8 : 1)})`; c.lineWidth = w * k * (opt.wid || 1); c.beginPath(); b.pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } }
    c.restore(); };
  const hitFlash = (c, x, y, r, a, col = '170,210,255') => { soft(c, x, y, r * 2.2, col, a * 0.35, true); soft(c, x, y, r, '235,245,255', a * 0.9, true); soft(c, x, y + r * 0.3, r * 2.4, col, a * 0.4, true, 0.22); };

  // ---------- 얼음 ----------
  const crystal = (c, x, y, ang, L, W, a) => { if (a <= 0.01) return; c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha *= a;
    const g = c.createLinearGradient(0, -W, 0, W); g.addColorStop(0, 'rgba(240,250,255,.95)'); g.addColorStop(0.35, 'rgba(170,215,250,.7)'); g.addColorStop(0.65, 'rgba(110,170,230,.55)'); g.addColorStop(1, 'rgba(200,235,255,.85)');
    c.beginPath(); c.moveTo(L * 0.5, 0); c.lineTo(L * 0.3, -W); c.lineTo(-L * 0.5, -W * 0.8); c.lineTo(-L * 0.55, 0); c.lineTo(-L * 0.5, W * 0.8); c.lineTo(L * 0.3, W); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(50,110,180,.55)'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(L * 0.5, 0); c.lineTo(L * 0.3, -W); c.lineTo(-L * 0.5, -W * 0.8); c.stroke(); c.restore(); };
  const icicle = (c, x, y, ang, L, W, a, seed) => { if (a <= 0.01 || L < 2) return; c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha *= a; const up = [], dn = [], n = 9;
    for (let i = 0; i <= n; i++) { const u = i / n, w = W * Math.pow(1 - u, 0.8) * (0.85 + (i % 2 ? 0.25 : 0) * (1 - u)); up.push([-L * 0.5 + u * L, -w + (rnd(seed + i) - 0.5) * 2]); dn.push([-L * 0.5 + u * L, w * 0.8 + (rnd(seed + i * 3) - 0.5) * 2]); }
    c.beginPath(); up.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); for (let i = n; i >= 0; i--) c.lineTo(dn[i][0], dn[i][1]); c.closePath();
    const g = c.createLinearGradient(0, -W, 0, W); g.addColorStop(0, 'rgba(245,252,255,.95)'); g.addColorStop(0.4, 'rgba(180,222,250,.75)'); g.addColorStop(0.75, 'rgba(120,175,230,.6)'); g.addColorStop(1, 'rgba(210,240,255,.85)'); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(50,110,180,.5)'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4; c.beginPath(); up.slice(0, n - 1).forEach(([px, py], i) => i ? c.lineTo(px, py + 2) : c.moveTo(px, py + 2)); c.stroke(); c.restore(); };
  const mist = (c, x, y, r, a, n = 6, seed = 0, t = 0) => { for (let i = 0; i < n; i++) soft(c, x + (rnd(seed + i) - 0.5) * r * 1.6 + sin(t + i) * 4, y + (rnd(seed + i * 3) - 0.5) * r * 0.6, r * (0.5 + rnd(seed + i * 5) * 0.5), '225,240,255', a * 0.3); };
  const sparkle = (c, x, y, s, a) => { if (a <= 0.01) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= a; c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke(); c.restore(); };
  const shatter = (c, x, y, u, n, seed) => { const f = 1 - u; for (let i = 0; i < n; i++) { const an = rnd(seed + i) * PI * 2, d = u * (30 + rnd(seed + i * 3) * 60); crystal(c, x + cos(an) * d, y + sin(an) * d + u * u * 40, an + u * 6, 8, 2.5, f); } mist(c, x, y, 30 + u * 30, f, 5, seed, 0); sparkle(c, x, y, 10 * f + 2, f); };
  const frostGround = (c, x, gy, R, a) => { soft(c, x, gy - 1, R, '235,248,255', 0.8 * a, false, 0.18); };

  // ---------- 구름 (나 다듬기 ② · 한 번 그려 저장) ----------
  const CL = new Map();
  function cloudImg(w, h, seed, lit) { const key = w + '|' + h + '|' + seed + '|' + lit; let o = CL.get(key); if (o) return o;
    const W = Math.ceil(w * 1.25), H = Math.ceil(h * 1.6), q = document.createElement('canvas'); q.width = W; q.height = H; const k = q.getContext('2d'), cx = W / 2, by = H * 0.78, T = { back: '122,132,166', mid: '150,160,192', front: '184,192,220', hi: '236,240,250' };
    const blob = (x, y, r, rgb, a, hard) => { const g = k.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(hard, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); k.fillStyle = g; k.beginPath(); k.arc(x, y, r, 0, PI * 2); k.fill(); };
    const n = Math.round(w / h * 4) + 4, P = []; for (let i = 0; i < n; i++) { const u = (i + rnd(seed + i) * 0.8) / n * 2 - 1, d = Math.sqrt(max(0, 1 - u * u)); P.push([cx + u * w * 0.46, by - h * 0.12 - d * h * (0.25 + rnd(seed + i * 5) * 0.25), h * (0.16 + 0.22 * d) * (0.75 + rnd(seed + i * 3) * 0.5)]); }
    for (const [px, py, r] of P) blob(px, py + r * 0.15, r * 1.12, T.back, 1, 0.62);
    for (const [px, py, r] of P) blob(px - r * 0.06, py - r * 0.1, r * 0.95, T.mid, 1, 0.6);
    for (const [px, py, r] of P) if (py < by - h * 0.28) blob(px - r * 0.15, py - r * 0.32, r * 0.62, T.front, 0.9, 0.45);
    for (let i = 0; i < 4; i++) { const [px, py, r] = P[Math.floor(rnd(seed + i * 17) * P.length)]; blob(px - r * 0.25, py - r * 0.5, r * 0.35, T.hi, 0.7, 0.2); }
    for (let i = 0; i < 3; i++) { k.save(); k.translate(cx + (rnd(seed + i * 9) - 0.5) * w * 0.3, by - h * (0.05 + i * 0.07)); k.scale(1, 0.18); blob(0, 0, w * 0.42, T.mid, 0.8, 0.3); k.restore(); }
    k.globalCompositeOperation = 'destination-out'; const g = k.createLinearGradient(0, by - h * 0.12, 0, by + h * 0.12); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); k.fillStyle = g; k.fillRect(0, by - h * 0.12, W, H);
    if (lit) { k.globalCompositeOperation = 'source-atop'; blob(cx, by - h * 0.3, w * 0.4, '210,235,255', 0.75, 0); }
    o = { cv: q, cx, by }; CL.set(key, o); return o; }
  const cloud = (c, x, y, w, h, seed, a, litA) => { const o = cloudImg(w, h, seed, 0); c.save(); c.globalAlpha *= a; c.drawImage(o.cv, x - o.cx, y - o.by); if (litA > 0.01) { const l = cloudImg(w, h, seed, 1); c.globalAlpha = a * min(1, litA); c.drawImage(l.cv, x - l.cx, y - l.by); } c.restore(); };

  // ---------- 게임 연결 도우미 ----------
  const fx = (o) => G.FX.add(Object.assign({ k: 'fn', glow: false }, o));
  const W = () => G.Game.world;
  const gyAt = (x, y) => { const w = W(); return w && w.groundBelow ? w.groundBelow(x, (y || G.GROUND_Y) - 60) : G.GROUND_Y; };
  const foes = (p, ahead, back = 0) => W().monsters.filter(m => !m.dead && Math.abs(m.y - p.y) < 200 && (m.x - p.x) * p.dir >= -back && (m.x - p.x) * p.dir <= ahead).sort((a, b) => abs(a.x - p.x) - abs(b.x - p.x));
  const X = G.SkillX, FXS = X.FXS, PROJ = X.PROJ, LAND = X.LAND, ZD = X.ZONE_DRAW, HIT = X.HIT || (X.HIT = {}), NOTRAIL = X.NOTRAIL || (X.NOTRAIL = {});
  const SX = G.SKILL_X;
  const set = (id, o) => { SX[id] = Object.assign(SX[id] || {}, o); };

  // ===================== A 불 (화염군주) =====================
  // 화염구 (2차): 작은 불덩이 + 불꼬리 → 맞으면 작게 터짐
  PROJ.fireball = (c, o, a) => { const dir = cos(a) < 0 ? -1 : 1; fireball(c, 0, 0, 9, dir, o.t + now(), 1); };
  HIT.fireball = (o, m) => fx({ x: m.x, y: o.y, life: 0.45, draw(c, f, k) { burst(c, f.x, f.y, 42, k, 26, 3); } });
  NOTRAIL.fireball = 1;
  // 화염 폭발 (2차): 바로 앞에서 불꽃이 피었다 연기로
  FXS.firebloom = (p) => { const x = p.x + p.dir * 110, gy = gyAt(x, p.y); fx({ x, y: gy, life: 0.6, draw(c, f, k) { const u = min(1, k / 0.8); scorch(c, f.x, f.y, 70, 1 - u); burst(c, f.x, f.y - 34, 70, u, 40, 11); flame(c, f.x, f.y, 60 * (1 - u), 50, 14, now(), 1 - u, 5); } }); };
  // 유성 낙하 (2차): 작은 불타는 운석 → 떨어지면 작게 터짐
  PROJ.firerock = (c, o, a) => { const t = now(); c.save(); c.rotate(a); for (let i = 0; i < 14; i++) { const u = i / 14; puff(c, -u * 63, sin(t * 20 + i) * 2.2 * u, 9.5 - u * 6.3, 0.9 - u * 0.8, 0.85); } rock(c, 9, 3); c.restore(); };
  LAND.firerock = (o) => fx({ x: o.x, y: o.groundY, life: 0.55, draw(c, f, k) { scorch(c, f.x, f.y, 60, 1 - k); burst(c, f.x, f.y - 26, 48, k, 26, 20); } });
  NOTRAIL.firerock = 1;
  // 업화 (3차): 큰 불덩이가 뚫고 지나가며 지나간 자리에 불길
  PROJ.inferno = (c, o, a) => { const dir = cos(a) < 0 ? -1 : 1, t = o.t + now(); fireball(c, 0, 0, 17, dir, t, 2);
    if (o.__lx == null) o.__lx = o.x; if (abs(o.x - o.__lx) > 34) { o.__lx = o.x; const gx = o.x, gy = gyAt(gx, o.y + 36); fx({ x: gx, y: gy, life: 0.75, draw(c2, f, k) { flame(c2, f.x, f.y, 70 * (1 - k), 40, 12, now(), 1 - k * 0.6, gx | 0); } }); } };
  HIT.inferno = (o, m) => fx({ x: m.x, y: o.y, life: 0.4, draw(c, f, k) { burst(c, f.x, f.y, 40, k, 16, 9); } });
  NOTRAIL.inferno = 1;
  // 화염 기둥 (3차): 떨어지는 불덩이 + 땅이 갈라지며 낮은 불기둥 3개
  PROJ.fdrop = (c, o, a) => { const dir = cos(a) < 0 ? -1 : 1; c.save(); c.rotate(a - (dir < 0 ? PI : 0)); fireball(c, 0, 0, 7, dir, o.t + now(), 7); c.restore(); };
  LAND.fdrop = (o) => fx({ x: o.x, y: o.groundY, life: 0.4, draw(c, f, k) { burst(c, f.x, f.y - 14, 26, k, 12, f.x | 0); } });
  NOTRAIL.fdrop = 1;
  FXS.pillars = (p) => { for (let i = 0; i < 3; i++) { const x = p.x + p.dir * (120 + i * 110), gy = gyAt(x, p.y), t0 = i * 0.12;
    fx({ x, y: gy, life: 1.1 + t0, draw(c, f, k) { const u = k * f.life - t0; if (u < 0) return; const rise = min(1, u / 0.2), fa = u > 0.65 ? max(0, 1 - (u - 0.65) / 0.3) : 1;
      if (u < 0.15) { scorch(c, f.x, f.y, 30 + u * 200, u / 0.15); return; }
      scorch(c, f.x, f.y, 60, fa); c.save(); c.strokeStyle = `rgba(255,170,60,${fa})`; c.lineWidth = 2.5; c.beginPath(); c.moveTo(f.x - 40, f.y - 1); c.lineTo(f.x - 12, f.y - 3); c.lineTo(f.x + 6, f.y); c.lineTo(f.x + 38, f.y - 2); c.stroke(); c.restore();
      flame(c, f.x, f.y, 160 * rise, 60, 70, now(), fa, i * 50, 1.9); embers(c, f.x, f.y, 200 * rise, 70, 10, now(), fa, i); } }); } };
  // 화염 수레바퀴 (3차, 옛 불꽃 폭풍): 달아오른 쇠 바퀴가 굴러가며 뒤로 불길 · 연기 · 꼬리 불똥 · 그을린 자국
  FXS.firewheel = (p) => { const x0 = p.x + p.dir * 50, gy = gyAt(p.x, p.y), dir = p.dir, R = 46, dist = 300;
    fx({ x: x0, y: gy, life: 0.95, draw(c, f, k) { const u = min(1, k / 0.85), x = f.x + dir * u * dist, y = f.y - R, rot = u * 14 * dir, fa = k < 0.85 ? 1 : (1 - k) / 0.15, t = now();
      c.save(); c.globalAlpha = fa * 0.6; c.fillStyle = 'rgba(90,40,20,.55)'; const xa = min(f.x, x), xb = max(f.x, x); c.fillRect(xa, f.y - 4, xb - xa, 5); c.restore();
      for (let xx = f.x; dir > 0 ? xx < x - 30 : xx > x + 30; xx += dir * 26) { const age = abs(x - xx) / 380; if (age < 1) flame(c, xx, f.y, 40 * (1 - age), 22, 4, t, fa * (1 - age), xx | 0, 2); }
      for (let i = 0; i < 46; i++) { const a0 = rnd(i) * PI * 2, v = (t * 1.8 + rnd(i * 3)) % 1, rx = x + cos(a0 + rot) * R, ry = y + sin(a0 + rot) * R; puff(c, rx - dir * (v * (60 + rnd(i * 5) * 50) + v * v * 26), ry - v * (34 + rnd(i * 7) * 40) + sin(t * 8 + i) * 4 * v, (9 + rnd(i * 9) * 7) * (1 + v * 0.8), 1 - v * 1.15, fa * (v < 0.1 ? v / 0.1 : 1) * 0.85); }
      glow(c, x, f.y - 2, 40, '255,190,90', 0.8 * fa); glow(c, x, y, R * 2.2, '255,140,40', 0.55 * fa);
      c.save(); c.globalAlpha = fa; c.translate(x, y); const rg = c.createRadialGradient(0, 0, R * 0.2, 0, 0, R); rg.addColorStop(0, 'rgba(255,240,180,.85)'); rg.addColorStop(0.55, 'rgba(255,150,40,.4)'); rg.addColorStop(1, 'rgba(200,60,10,.15)'); c.fillStyle = rg; c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.fill();
      c.rotate(rot); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * PI / 4); const sg = c.createLinearGradient(0, 0, R, 0); sg.addColorStop(0, '#fff4c8'); sg.addColorStop(1, '#ff7a20'); c.fillStyle = sg; c.beginPath(); c.moveTo(0, -3); c.lineTo(R - 6, -4.5); c.lineTo(R - 6, 4.5); c.lineTo(0, 3); c.fill(); c.restore(); }
      c.lineWidth = 8; c.strokeStyle = '#4a2a18'; c.beginPath(); c.arc(0, 0, R - 3, 0, PI * 2); c.stroke(); c.lineWidth = 4.5; c.strokeStyle = '#ff9a40'; c.stroke();
      for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * PI / 6); c.fillStyle = '#ffb040'; c.fillRect(R - 4, -3, 7, 6); c.restore(); }
      c.fillStyle = '#4a2a18'; c.beginPath(); c.arc(0, 0, 9, 0, PI * 2); c.fill(); c.fillStyle = '#ffd070'; c.beginPath(); c.arc(0, 0, 5, 0, PI * 2); c.fill(); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; for (let i = 0; i < 14; i++) { const v = (t * 2.2 + rnd(i * 3)) % 1, vx = 140 + rnd(i) * 160, vy = 120 + rnd(i * 5) * 140, sx = x - dir * (8 + vx * v), sy = f.y - 4 - vy * v + 260 * v * v; if (sy > f.y) continue; const px = x - dir * (8 + vx * (v - 0.04)), py = f.y - 4 - vy * (v - 0.04) + 260 * (v - 0.04) * (v - 0.04);
        c.globalAlpha = fa * (1 - v); c.strokeStyle = v < 0.5 ? '#fff2b0' : '#ff9a30'; c.lineWidth = 2.2 * (1 - v) + 0.8; c.beginPath(); c.moveTo(px, py); c.lineTo(sx, sy); c.stroke(); } c.restore(); } }); };
  // 화염 고리 (3차): 발밑에서 낮은 불길이 둥글게 퍼짐
  FXS.firering2 = (p) => { const gy = gyAt(p.x, p.y); fx({ x: p.x, y: gy, life: 0.9, draw(c, f, k) { const R = 40 + min(1, k / 0.6) * 230, fa = k < 0.6 ? 1 : max(0, 1 - (k - 0.6) / 0.35), t = now();
    soft(c, f.x, f.y - 3, R, '220,70,20', 0.35 * fa, false, 0.24); const n = 26; for (let i = 0; i < n; i++) { const an = i / n * PI * 2; flame(c, f.x + cos(an) * R, f.y - 3 + sin(an) * R * 0.24, 46 * (sin(an) > 0 ? 1 : 0.8), 30, 6, t, fa, i * 7, 2.2); } } }); };
  // 화염군주의 창 (4차): 길쭉한 불 창 → 꽂힌 자리에서 불길
  PROJ.firelance = (c, o, a) => { c.save(); c.rotate(a); for (let j = 0; j < 18; j++) { const v = j / 18; puff(c, -v * 120, 0, 9 * (1 - v * 0.6), 0.95 - v * 0.7, 0.9); } c.fillStyle = '#fff4c8'; c.beginPath(); c.moveTo(30, 0); c.lineTo(-10, -5); c.lineTo(-10, 5); c.closePath(); c.fill(); glow(c, 10, 0, 30, '255,190,80', 0.8); c.restore(); };
  HIT.firelance = (o, m) => { const gy = gyAt(m.x, o.y + 36); fx({ x: m.x, y: gy, life: 0.8, draw(c, f, k) { scorch(c, f.x, f.y, 80, 1 - k); burst(c, f.x, o.y, 56, min(1, k * 2), 14, 40); flame(c, f.x, f.y, 150 * (1 - k), 60, 22, now(), 1 - k, 60, 2); } }); };
  NOTRAIL.firelance = 1;
  // 대화재 (4차): 앞쪽 한 구역에 불비 + 땅이 타오름 (장판)
  ZD.fire = (c, z) => { const a = min(1, z.age / 0.2) * min(1, z.left / 0.4), t = now(), x0 = z.x - z.r, x1 = z.x + z.r;
    glow(c, z.x, z.y - 260, z.r * 1.2, '255,110,30', 0.28 * a);
    for (let i = 0; i < 24; i++) { const u = (t * 1.2 + rnd(i * 3)) % 1, x = x0 + rnd(i) * (x1 - x0) + (1 - u) * 50, y = z.y - 440 + u * 440; for (let j = 0; j < 5; j++) puff(c, x + j * 5, y - j * 13, 5 - j * 0.6, 0.95 - j * 0.15, 0.85 * a); }
    for (let i = 0; i < 9; i++) { const x = x0 + 20 + i * (x1 - x0 - 40) / 8; scorch(c, x, z.y, 50, a); flame(c, x, z.y, 70 + rnd(i) * 40, 44, 9, t, a, i * 11, 1.8); } };
  // 태양 낙하 (궁극기): 해(빌드 10) + 절반 크기 하얀 별똥 + 화면 열기 + 떨어진 자리 불길
  const oldSun = FXS.sun; FXS.sun = (p, w, el) => { fx({ x: p.x, y: p.y, life: 1.3, draw(c, f, k) { const a = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1; c.save(); c.globalAlpha = a * 0.18; c.fillStyle = '#ff9a40'; c.fillRect(f.x - 1400, f.y - 900, 2800, 1000); c.restore(); } }); return oldSun && oldSun(p, w, el); };
  PROJ.meteor = (c, o, a) => { c.save(); c.scale(0.36, 0.36); G.SkyFX.meteor(c, a, now()); c.restore(); };
  LAND.meteor = (o) => fx({ x: o.x, y: o.groundY, life: 0.9, draw(c, f, k) { glow(c, f.x, f.y - 24, 60 * (1 - k * 0.4), '255,250,220', 0.8 * (1 - k)); scorch(c, f.x, f.y, 70, 1 - k * 0.5); flame(c, f.x, f.y, 80 * (1 - k), 40, 7, now(), 1 - k, f.x | 0, 2); } });
  NOTRAIL.meteor = 1;

  // ===================== B 얼음 · 번개 (천둥의 현자) =====================
  // 냉기 광선 (2차) = 서리 바람: 날아가는 자리 아래 땅을 따라 차가운 바람 · 눈가루 · 땅이 얼며 지나감
  PROJ.icebeam = (c, o, a) => { const t = now(), dir = cos(a) < 0 ? -1 : 1, gy = gyAt(o.x, o.y + 36) - o.y;
    for (let i = 0; i < 16; i++) { const u = (t * 2.4 + rnd(i)) % 1; soft(c, -dir * u * 110, gy - 6 - rnd(i * 3) * 46 * (0.4 + u), 10 + rnd(i * 5) * 14, '232,245,255', 0.45 * (1 - u)); }
    c.save(); c.strokeStyle = '#ffffff'; c.lineCap = 'round'; c.lineWidth = 1.6; for (let i = 0; i < 10; i++) { const u = (t * 3 + rnd(i * 7)) % 1, x = -dir * u * 120, y = gy - 8 - rnd(i * 9) * 40; c.globalAlpha = 1 - u * 0.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x - dir * 10, y + 1); c.stroke(); } c.restore();
    if (o.__lx == null) o.__lx = o.x; if (abs(o.x - o.__lx) > 20) { o.__lx = o.x; const gx = o.x, gg = gyAt(gx, o.y + 36); fx({ x: gx, y: gg, life: 0.7, draw(c2, f, k) { frostGround(c2, f.x, f.y, 26, 1 - k * 0.8); } }); } };
  HIT.icebeam = (o, m) => { const gy = gyAt(m.x, o.y + 36); fx({ x: m.x, y: gy, life: 0.9, draw(c, f, k) { const fa = 1 - k; frostGround(c, f.x, f.y, 46, fa); for (let j = 0; j < 3; j++) crystal(c, f.x - 12 + j * 12, f.y - 5, -PI / 2 + (j - 1) * 0.35, 14, 3, fa * 0.9); soft(c, f.x, f.y - 50, 30, '225,242,255', fa * 0.35); } }); };
  NOTRAIL.icebeam = 1;
  // 얼음 파편 (2차): 투명한 얼음 결정 · 서리 꼬리 · 맞으면 깨져 흩어짐
  PROJ.icicle = (c, o, a) => { c.save(); c.rotate(a); for (let j = 1; j < 9; j++) soft(c, -j * 14, 0, 12 - j, '225,240,255', 0.5 - j * 0.05); glow(c, 0, 0, 26, '170,215,255', 0.35); crystal(c, 0, 0, 0, 44, 8, 1); sparkle(c, 14, -5, 4, 1); c.restore(); };
  HIT.icicle = (o, m) => fx({ x: m.x, y: o.y, life: 0.5, draw(c, f, k) { shatter(c, f.x, f.y, k, 12, f.x | 0); } });
  NOTRAIL.icicle = 1;
  // 연쇄 번개 (2차) · 천둥 신의 분노 튕김: 실제 번개로 튕김
  X.chain = function (p, w, from, C, pct, el) { let prev = from; const hit = new Set([from]);
    for (let i = 0; i < C.n; i++) { const next = w.monsters.filter(m => !m.dead && !hit.has(m) && Math.abs(m.x - prev.x) < C.r && Math.abs(m.y - prev.y) < 160).sort((a, b) => Math.abs(a.x - prev.x) - Math.abs(b.x - prev.x))[0]; if (!next) break; hit.add(next);
      const a = { x: prev.x, y: prev.y - prev.h / 2 }, b = { x: next.x, y: next.y - next.h / 2 }, seed = (Math.random() * 999) | 0;
      this.pending.push({ t: 0.08 * (i + 1), w, fn: () => {
        if (C.star) G.FX.add({ k: 'fn', life: 0.25, glow: true, draw(ctx, f, k) { ctx.globalAlpha = 1 - k; ctx.save(); ctx.translate(a.x + (b.x - a.x) * min(1, k * 3), a.y + (b.y - a.y) * min(1, k * 3)); ctx.rotate(k * 20); ctx.fillStyle = 'rgba(230,220,255,.95)'; ctx.beginPath(); for (let q = 0; q < 8; q++) { const rr = q % 2 ? 2.7 : 9, an = q * PI / 4; ctx.lineTo(cos(an) * rr, sin(an) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); } });
        else fx({ life: 0.3, draw(ctx, f, k) { zap(ctx, a.x, a.y, b.x, b.y, seed + ((k * 6) | 0), (1 - k) * (0.6 + 0.4 * rnd(seed + ((k * 30) | 0))), { br: 1, rough: 0.28 }); hitFlash(ctx, b.x, b.y, 16, 1 - k); } });
        if (!next.dead) G.Combat.hit(p, next, pct * C.mul, 1, el); } });
      prev = next; } };
  FXS.zapfirst = (p) => { const t = foes(p, 300)[0]; if (!t) return; const sx = p.x + p.dir * 26, sy = p.y - 50, tx = t.x, ty = t.y - t.h / 2, seed = (Math.random() * 999) | 0;
    fx({ life: 0.35, draw(c, f, k) { zap(c, sx, sy, tx, ty, seed + ((k * 6) | 0), (1 - k) * (0.6 + 0.4 * rnd(seed + ((k * 30) | 0))), { br: 1, rough: 0.28 }); hitFlash(c, tx, ty, 16, 1 - k); } }); };
  // 썬더 스톰 (3차): 구름 · 세로 빛줄기 없이 전기가 튀는 번개 구슬 → 땅에서 번쩍
  PROJ.lorb = (c, o) => { const t = now(), s = (o.x * 7 | 0); glow(c, 0, 0, 44, '140,190,255', 0.5); glow(c, 0, 0, 16, '240,248,255', 1); soft(c, 0, -40, 14, '180,215,255', 0.25, true, 3);
    for (let j = 0; j < 3; j++) { const an = rnd(s + j + ((t * 40) | 0)) * PI * 2; zap(c, 0, 0, cos(an) * 38, sin(an) * 38, s + j + ((t * 40) | 0), 0.8, { br: 0, wid: 0.5 }); } };
  LAND.lorb = (o) => { const s = o.x | 0; fx({ x: o.x, y: o.groundY, life: 0.4, draw(c, f, k) { hitFlash(c, f.x, f.y - 14, 24, 1 - k); for (let j = 0; j < 3; j++) { const an = -PI * (0.1 + rnd(s + j * 5) * 0.8); zap(c, f.x, f.y - 6, f.x + cos(an) * 40, f.y - 6 + sin(an) * 30, s + j, (1 - k) * 0.8, { br: 0, wid: 0.5 }); } } }); };
  NOTRAIL.lorb = 1;
  // 낙뢰 (3차): 떨어지는 동안 땅에 푸른 표식 → 닿으면 하늘 끝에서 번개가 꽂힘
  PROJ.lbolt = (c, o) => { if (o.groundY == null) return; const gy = o.groundY - o.y, s = min(1, max(0, 1 - (o.groundY - o.y) / 520)); glow(c, 0, gy - 100, 22 - s * 8, '150,200,255', 0.5 + 0.4 * s); c.save(); c.strokeStyle = `rgba(200,230,255,${0.5 + 0.5 * s})`; c.lineWidth = 2; c.beginPath(); c.ellipse(0, gy - 4, 30 - s * 10, 6, 0, 0, PI * 2); c.stroke(); c.restore(); };
  LAND.lbolt = (o) => { const s = (o.x * 3) | 0; fx({ x: o.x, y: o.groundY, life: 0.32, draw(c, f, k) { zap(c, f.x + 30, f.y - 720, f.x, f.y - 8, s, 1 - k, { br: 3, wid: 1.2 }); hitFlash(c, f.x, f.y - 20, 34, 1 - k); } }); };
  NOTRAIL.lbolt = 1;
  // 빙결 폭발 (3차): 발밑에서 서리가 양옆으로 퍼지며 땅에서 투명한 얼음 가시 · 차가운 안개
  FXS.icecrack = (p) => { const gy = gyAt(p.x, p.y), seed = (Math.random() * 99) | 0; fx({ x: p.x, y: gy, life: 0.9, draw(c, f, k) { const R = min(1, k / 0.35) * 250, fa = k < 0.7 ? 1 : (1 - k) / 0.3, t = now();
    frostGround(c, f.x, f.y, R * 1.1, fa); for (let i = 0; i < 20; i++) { const d = (rnd(seed + i) - 0.5) * 500; if (abs(d) > R) continue; const h = (24 + rnd(seed + i * 3) * 46) * min(1, (R - abs(d)) / 60) * fa; crystal(c, f.x + d, f.y - h * 0.45, -PI / 2 + (rnd(seed + i * 5) - 0.5) * 0.6, h, 4 + rnd(seed + i) * 4, fa); }
    mist(c, f.x, f.y - 20, 40 + R * 0.25, fa, 10, seed, t); } }); };
  // 얼음 창 (3차) = 땅에서 솟는 얼음 창: 날아가는 자리 땅에 옅은 서리 → 맞은 적 발밑에서 얼음 창 여러 개가 솟아 부서짐
  PROJ.icespear = (c, o) => { const gy = gyAt(o.x, o.y + 36) - o.y; soft(c, 0, gy - 2, 34, '230,245,255', 0.6, false, 0.2); for (let i = 0; i < 4; i++) sparkle(c, (rnd(i + (o.x | 0)) - 0.5) * 40, gy - 6 - rnd(i * 3) * 14, 2.5, 0.8); };
  HIT.icespear = (o, m) => { const gy = gyAt(m.x, o.y + 36), seed = (m.x | 0); fx({ x: m.x, y: gy, life: 0.85, draw(c, f, k) { const u = k * 0.85;
    if (u < 0.08) { frostGround(c, f.x, f.y, 30 + u * 400, u / 0.08); return; } const rise = min(1, (u - 0.08) / 0.1), fa = u > 0.55 ? max(0, 1 - (u - 0.55) / 0.3) : 1; frostGround(c, f.x, f.y, 66, fa); soft(c, f.x, f.y - 20, 50, '225,242,255', fa * 0.4);
    for (let j = 0; j < 5; j++) { const an = -PI / 2 + (j - 2) * 0.28 + (rnd(seed + j) - 0.5) * 0.15, L = (60 + (2 - abs(j - 2)) * 30) * rise, bx = f.x + (j - 2) * 10; icicle(c, bx + cos(an) * L * 0.5, f.y - 2 + sin(an) * L * 0.5, an + PI, L, 7 + (2 - abs(j - 2)) * 2, fa, seed + j); }
    if (u > 0.55) shatter(c, f.x, f.y - 50, min(1, (u - 0.55) / 0.3), 10, seed); } }); };
  NOTRAIL.icespear = 1;
  // 천둥의 심판 (4차): 하늘에 옅게 빛나는 마법진 → 번개가 비스듬히 연달아 꽂힘 (구름 없음)
  FXS.judgecircle = (p) => { const cx = p.x + p.dir * 250, cy = gyAt(p.x, p.y) - 440; X.__judge = { x: cx, y: cy, until: now() + 1.3 };
    fx({ x: cx, y: cy, life: 1.3, draw(c, f, k) { const a = k < 0.12 ? k / 0.12 : k > 0.85 ? (1 - k) / 0.15 : 1, t = now(); c.save(); c.globalCompositeOperation = 'lighter'; c.translate(f.x, f.y); c.scale(1, 0.3); c.rotate(t * 0.6);
      for (const [r, wd, al] of [[200, 3, 0.5], [170, 1.5, 0.35], [120, 2, 0.45]]) { c.strokeStyle = `rgba(160,205,255,${al * a})`; c.lineWidth = wd; c.beginPath(); c.arc(0, 0, r, 0, PI * 2); c.stroke(); }
      for (let i = 0; i < 12; i++) { c.rotate(PI / 6); c.fillStyle = `rgba(200,230,255,${0.5 * a})`; c.fillRect(-1, -200, 2, 14); } c.restore(); soft(c, f.x, f.y, 220, '120,170,255', 0.25 * a, true, 0.35); } }); };
  PROJ.lbolt2 = () => {};
  LAND.lbolt2 = (o) => { const J = X.__judge && X.__judge.until > now() ? X.__judge : { x: o.x, y: o.groundY - 440 }, sx = J.x + (rnd(o.x | 0) - 0.5) * 300, sy = J.y + 20, s = (o.x * 5) | 0;
    fx({ x: o.x, y: o.groundY, life: 0.26, draw(c, f, k) { zap(c, sx, sy, f.x, f.y - 6, s, 1 - k, { br: 2 }); hitFlash(c, f.x, f.y - 16, 28, 1 - k); } }); };
  NOTRAIL.lbolt2 = 1;
  // 절대 영도 (4차): 하얀 냉기 물결이 양옆으로 퍼지며 땅이 얼고, 범위 안 적들이 얼음에 갇힘
  FXS.frostscreen = (p) => { const gy = gyAt(p.x, p.y), list = W().monsters.filter(m => !m.dead && abs(m.x - p.x) < 380 && abs(m.y - p.y) < 220);
    fx({ x: p.x, y: gy, life: 1.1, draw(c, f, k) { const wv = min(1, k / 0.4), fa = k < 0.75 ? 1 : (1 - k) / 0.25, R = wv * 380;
      c.save(); c.globalAlpha = 0.18 * fa; c.fillStyle = '#dff0ff'; c.fillRect(f.x - 1400, f.y - 900, 2800, 1000); c.restore();
      for (let i = 0; i < 24; i++) { const u = i / 24, sg = i % 2 ? 1 : -1, x = f.x + sg * u * R, y = f.y - 30 - rnd(i) * 80; soft(c, x, y, 40 + rnd(i * 3) * 30, '235,246,255', fa * 0.45 * (1 - u * 0.5)); }
      frostGround(c, f.x, f.y, R + 40, fa);
      for (const m of list) { if (abs(m.x - f.x) > R) continue; const s = min(1, (R - abs(m.x - f.x)) / 80), tx = m.x, mh = max(60, m.h + 20), mw = max(34, m.w * 0.7); c.save(); c.globalAlpha = fa * s * 0.8; const g = c.createLinearGradient(0, f.y - mh, 0, f.y); g.addColorStop(0, 'rgba(230,246,255,.55)'); g.addColorStop(1, 'rgba(150,200,240,.65)'); c.fillStyle = g;
        c.beginPath(); c.moveTo(tx - mw, f.y); c.lineTo(tx - mw * 1.1, f.y - mh * 0.65); c.lineTo(tx - mw * 0.4, f.y - mh); c.lineTo(tx + mw * 0.5, f.y - mh * 0.93); c.lineTo(tx + mw, f.y - mh * 0.6); c.lineTo(tx + mw * 0.95, f.y); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5; c.stroke(); c.restore(); sparkle(c, tx - 10, f.y - mh * 0.85, 5, fa * s); } } }); };
  // 천둥 신의 분노 (궁극기): 넓은 뇌운(구름 나 다듬기 ② · 70%) + 실제 번개 다섯 줄기 + 화면 번쩍 + 땅 충격 (튕김은 X.chain)
  FXS.wrath = (p) => { if (G.SkyFX.once && !G.SkyFX.once('wrath', 1.3)) return; const cx = p.x + p.dir * 240, gy = gyAt(p.x, p.y), top = gy - 470, seed = (Math.random() * 99) | 0;
    fx({ x: cx, y: gy, life: 1.3, draw(c, f, k) { const a = k < 0.08 ? k / 0.08 : k > 0.8 ? (1 - k) / 0.2 : 1, hit = k > 0.18;
      if (hit) { c.save(); c.globalAlpha = max(0, 0.4 - (k - 0.18) * 1.2); c.fillStyle = '#eaf2ff'; c.fillRect(f.x - 1400, f.y - 900, 2800, 1000); c.restore(); }
      cloud(c, f.x, top + 60, 900, 220, 7, a * 0.7, hit ? max(0, sin(k * 40)) : 0.2);
      if (hit) { const fa = max(0, 1 - (k - 0.18) / 0.6); [[0, 11, 1.8], [-220, 33, 1], [230, 57, 1], [-110, 21, 0.8], [120, 45, 0.8]].forEach(([dx, sd, wd], i) => zap(c, f.x + dx, top + 60, f.x + dx * 0.35, f.y - 6, seed + sd + ((k * 12) | 0), fa * (i ? 0.85 : 1), { wid: wd, br: i ? 2 : 4 }));
        hitFlash(c, f.x, f.y - 20, 70, fa); soft(c, f.x, f.y - 4, 300 * (0.4 + (k - 0.18)), '200,225,255', fa * 0.5, true, 0.18); } } }); };
  // 구름은 게임 시작 뒤 미리 그려 둠
  // 빌드 11: 처음 쓸 때 멈칫 없게 — 빛 · 연기 스프라이트(불 색 21 + 쓰는 색)와 구름을 미리 만들어 둠
  const PRE = ['120,170,255', '122,132,166', '140,190,255', '150,160,192', '150,200,255', '170,210,255', '170,215,255', '180,215,255', '184,192,220', '200,225,255', '200,70,25', '210,235,255', '220,236,255', '220,70,20', '225,240,255', '225,242,255', '230,245,255', '232,245,255', '235,245,255', '235,246,255', '235,248,255', '236,240,250', '240,248,255', '255,110,30', '255,140,40', '255,140,50', '255,180,70', '255,190,80', '255,190,90', '255,200,90', '255,250,220', '255,255,255'];
  function prewarm() { for (const c of HCOL) sprite(c); for (const c of PRE) sprite(c); cloudImg(900, 220, 7, 0); cloudImg(900, 220, 7, 1); }
  if (typeof window !== 'undefined') window.addEventListener('load', () => setTimeout(prewarm, 2000));

  // ---------- 마법사 스킬 줄에 새 연출 붙이기 (수치 · 효과는 그대로) ----------
  set('m2a_meteor', { proj: 'firerock', nobeam: true });
  set('m3a_pillar', { proj: 'fdrop', nobeam: true });
  set('m3a_storm', { fx: 'firewheel', quiet: true });
  set('m2a_explode', { quiet: true }); set('m3a_ring', { quiet: true });
  set('m4a_blaze', { proj: 'fdrop', nobeam: true }); set('m4a_final', { nobeam: true });
  set('m2b_chain', { fx: 'zapfirst', quiet: true });
  set('m3b_thunder', { proj: 'lorb', fx: null, nobeam: true });
  set('m3b_bolt', { proj: 'lbolt', nobeam: true });
  set('m3b_freeze', { quiet: true });
  set('m4b_judge', { proj: 'lbolt2', fx: 'judgecircle', nobeam: true });
  set('m4b_zero', { quiet: true });
  set('m4b_final', { fx: 'wrath', quiet: true });
  G.SpellFX = { puff, flame, zap, crystal, icicle, cloud, cloudImg, soft, prewarm };
})();
