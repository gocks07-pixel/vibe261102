// 화염군주 10개 새 시안 2 — 부드러운 불 입자(열 → 색: 흰노랑 → 주황 → 빨강 → 연기) · 단계별 크기 (2차 작게 → 궁극기 크게)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max;
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  const M = G.SageMock = G.SageMock || {};
  // 열(h 0~1)에 따른 불 입자: 가운데 진하고 가장자리 부드럽게 사라짐
  const HEAT = [[1, [255, 250, 220]], [0.75, [255, 210, 90]], [0.5, [255, 140, 40]], [0.3, [240, 90, 30]], [0.15, [190, 110, 90]], [0, [170, 165, 175]]];
  const col = (h) => { for (let i = 1; i < HEAT.length; i++) if (h >= HEAT[i][0]) { const [h0, a] = HEAT[i - 1], [h1, b] = HEAT[i], u = (h - h1) / (h0 - h1); return a.map((v, j) => Math.round(b[j] + (v - b[j]) * u)); } return HEAT[HEAT.length - 1][1]; };
  const puff = (c, x, y, r, h, a) => { if (a <= 0.01 || r <= 0.5) return; const [R, Gc, B] = col(max(0, min(1, h))), smoke = h < 0.15; const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${R},${Gc},${B},${a * (smoke ? 0.45 : 0.95)})`); g.addColorStop(0.5, `rgba(${R},${Gc},${B},${a * (smoke ? 0.3 : 0.6)})`); g.addColorStop(1, `rgba(${R},${Gc},${B},0)`); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); };
  const glow = (c, x, y, r, rgba, a) => { c.save(); c.globalAlpha *= a; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  // 불길: 밑동(x, y) 에서 입자들이 위로 올라가며 식음 (높이 H · 폭 W · 입자 n · 시간 t · 세기 a)
  const flame = (c, x, y, H, W, n, t, a, seed = 0, sp = 1.6) => { for (let i = 0; i < n; i++) { const u = (t * sp + rnd(seed + i)) % 1, sx = (rnd(seed + i * 3) - 0.5) * W, wob = sin(t * 7 + i) * W * 0.12 * u;
      puff(c, x + sx * (1 - u * 0.7) + wob, y - u * H, W * (0.42 - u * 0.2) + 3, 1 - u * 1.05, a * 0.75 * (u < 0.15 ? u / 0.15 : 1)); } };
  const embers = (c, x, y, H, W, n, t, a, seed = 0) => { for (let i = 0; i < n; i++) { const u = (t * 0.9 + rnd(seed + i * 5)) % 1, px = x + (rnd(seed + i) - 0.5) * W + sin(t * 3 + i) * 10, py = y - u * H; c.save(); c.globalAlpha = a * (1 - u); c.fillStyle = '#ffd070'; c.beginPath(); c.arc(px, py, 1.6 + (1 - u), 0, PI * 2); c.fill(); c.restore(); } };
  const scorch = (c, x, gy, r, a) => { c.save(); c.globalAlpha *= a; c.translate(x, gy - 1); c.scale(1, 0.2); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, 'rgba(255,150,50,.85)'); g.addColorStop(0.45, 'rgba(200,60,20,.55)'); g.addColorStop(1, 'rgba(60,20,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, PI * 2); c.fill(); c.restore(); };
  // 터짐: 불 입자가 바깥으로 퍼지며 식고 연기로 (반지름 R)
  const burst = (c, x, y, R, u, n, seed = 0) => { const f = 1 - u; glow(c, x, y, R * 1.3, 'rgba(255,200,90,.7)', f * f);
    for (let i = 0; i < n; i++) { const an = rnd(seed + i) * PI * 2, d = R * (0.2 + rnd(seed + i * 3) * 0.8) * (0.3 + u * 0.9); puff(c, x + cos(an) * d, y + sin(an) * d * 0.75 - u * R * 0.35, R * (0.35 - u * 0.12) * (0.7 + rnd(i) * 0.6), 1 - u * 1.1 - rnd(seed + i * 7) * 0.15, min(1, f * 1.6)); } };
  // 불덩이(날아가는 것): 핵 + 뒤로 끌리는 불꼬리 입자
  const fireball = (c, x, y, r, dir, t, seed = 0) => { for (let i = 0; i < 16; i++) { const u = i / 16, j = (t * 6 + rnd(seed + i)) % 1; puff(c, x - dir * (u * r * 5 + j * 6), y + sin(t * 20 + i) * r * 0.2 * u, r * (1 - u * 0.75), 0.95 - u * 0.75, 0.9); } glow(c, x, y, r * 2.4, 'rgba(255,180,70,.6)', 1); puff(c, x, y, r * 0.8, 1, 1); };
  const rock = (c, x, y, r, ang, t, seed) => { c.save(); c.translate(x, y); c.rotate(ang); for (let i = 0; i < 14; i++) { const u = i / 14; puff(c, -u * r * 7, sin(t * 20 + i) * r * 0.25 * u, r * (1.05 - u * 0.7), 0.9 - u * 0.8, 0.85); }
    c.beginPath(); for (let i = 0; i < 9; i++) { const an = i / 9 * PI * 2, rr = r * (0.8 + rnd(seed + i) * 0.3); c.lineTo(cos(an) * rr, sin(an) * rr); } c.closePath(); const g = c.createRadialGradient(r * 0.3, 0, 0, 0, 0, r); g.addColorStop(0, '#ffb040'); g.addColorStop(0.5, '#8a3a18'); g.addColorStop(1, '#2a120a'); c.fillStyle = g; c.fill(); c.restore(); };
  const T0 = (k) => 1.3 + k * 2.2;
  // ===== 2차 =====
  M.f_ball = (c, p, k, gy, T) => { const t = T0(k), sx = p.x + 40, tx = T[0], y = gy - 42, hit = 0.35; if (k < hit) fireball(c, sx + (tx - sx) * k / hit, y, 9, 1, t, 1); else { const u = min(1, (k - hit) / 0.45); burst(c, tx, y, 42, u, 26, 3); } };
  M.f_explode = (c, p, k, gy) => { const t = T0(k), x = p.x + 110, u = min(1, k / 0.8); scorch(c, x, gy, 70, 1 - u); burst(c, x, gy - 34, 70, u, 40, 11); flame(c, x, gy, 60 * (1 - u), 50, 14, t, 1 - u, 5); };
  M.f_meteor = (c, p, k, gy, T) => { const t = T0(k); for (let i = 0; i < 3; i++) { const t0 = i * 0.14, u = (k - t0) / 0.32; if (u < 0) continue; const tx = T[i], ang = 1.1;
      if (u < 1) { const L = 380 * (1 - u); rock(c, tx - cos(ang) * L, gy - 24 - sin(ang) * L, 9, ang, t, i); } else { const v = min(1, (u - 1) / 0.9); scorch(c, tx, gy, 60, 1 - v); burst(c, tx, gy - 26, 48, v, 26, 20 + i); } } };
  // ===== 3차 =====
  M.f_inferno = (c, p, k, gy, T) => { const t = T0(k), sx = p.x + 40, ex = T[3] + 60, y = gy - 44, u = min(1, k / 0.6), bx = sx + (ex - sx) * u;
    for (let x = sx + 40; x < bx - 30; x += 34) { const age = (bx - x) / 600; flame(c, x, gy, 70 * max(0, 1 - age * 0.8) * (k < 0.75 ? 1 : (1 - k) / 0.25), 40, 12, t, 1, x | 0); }
    if (u < 1) fireball(c, bx, y, 17, 1, t, 2); else burst(c, ex, y, 60, min(1, (k - 0.6) / 0.4), 16, 9); };
  M.f_pillar = (c, p, k, gy, T) => { const t = T0(k); [T[0], T[2], T[4]].forEach((x, i) => { const u = k - i * 0.1; if (u < 0) return; const rise = min(1, u / 0.2), f = u > 0.6 ? max(0, 1 - (u - 0.6) / 0.3) : 1;
      scorch(c, x, gy, 60, f); c.save(); c.strokeStyle = `rgba(255,170,60,${f})`; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 40, gy - 1); c.lineTo(x - 12, gy - 3); c.lineTo(x + 6, gy); c.lineTo(x + 38, gy - 2); c.stroke(); c.restore();
      flame(c, x, gy, 280 * rise, 60, 70, t, f, i * 50, 1.9); embers(c, x, gy, 320 * rise, 70, 10, t, f, i); }); };
  M.f_ring = (c, p, k, gy) => { const t = T0(k), x = p.x, R = 40 + min(1, k / 0.6) * 260, f = k < 0.6 ? 1 : max(0, 1 - (k - 0.6) / 0.35); c.save(); c.translate(x, gy - 3); c.scale(1, 0.24); c.strokeStyle = `rgba(220,70,20,${0.5 * f})`; c.lineWidth = 30; c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.stroke(); c.restore();
    const n = 30; for (let i = 0; i < n; i++) { const an = i / n * PI * 2, fx = x + cos(an) * R, fy = gy - 3 + sin(an) * R * 0.24; flame(c, fx, fy, 46 * (sin(an) > 0 ? 1 : 0.8), 30, 8, t, f, i * 7, 2.2); } };
  M.f_storm = (c, p, k, gy, T) => { const t = T0(k) * 1.4, x = p.x + 130 + min(1, k / 0.5) * 150, f = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1, H = 230;
    for (let i = 0; i < 140; i++) { const u = (t * 0.35 + rnd(i)) % 1, w = 34 + u * 80, an = t * 4 + rnd(i * 3) * PI * 2 - u * 6; if (sin(an) > 0) continue; puff(c, x + cos(an) * w, gy - 10 - u * H, 22 - u * 8, 0.9 - u * 0.95, f * 0.8); }
    scorch(c, x, gy, 90, f);
    for (let i = 0; i < 140; i++) { const u = (t * 0.35 + rnd(i)) % 1, w = 34 + u * 80, an = t * 4 + rnd(i * 3) * PI * 2 - u * 6; if (sin(an) <= 0) continue; puff(c, x + cos(an) * w, gy - 10 - u * H, 22 - u * 8, 0.95 - u * 0.95, f); }
    embers(c, x, gy, H + 40, 160, 12, t, f, 3); };
  // ===== 4차 =====
  M.f_lance = (c, p, k, gy, T) => { const t = T0(k); [[T[1], 0], [T[3], 0.12]].forEach(([tx, t0], i) => { const u = (k - t0) / 0.22, y = gy - 46 - i * 10, sx = p.x + 40; if (u < 0) return;
      if (u < 1) { const x = sx + (tx - sx) * u; c.save(); c.translate(x, y); for (let j = 0; j < 18; j++) { const v = j / 18; puff(c, -v * 120, 0, 9 * (1 - v * 0.6), 0.95 - v * 0.7, 0.9); } c.fillStyle = '#fff4c8'; c.beginPath(); c.moveTo(30, 0); c.lineTo(-10, -5); c.lineTo(-10, 5); c.closePath(); c.fill(); glow(c, 10, 0, 30, 'rgba(255,190,80,.8)', 1); c.restore(); }
      else { const v = min(1, (u - 1) / 2.4); scorch(c, tx, gy, 80, 1 - v); burst(c, tx, y, 56, min(1, v * 2), 14, 40 + i); flame(c, tx, gy, 150 * (1 - v), 60, 22, t, 1 - v, 60 + i * 9, 2); } }); };
  M.f_blaze = (c, p, k, gy, T) => { const t = T0(k), x0 = T[0] - 60, x1 = T[0] + 360, a = k < 0.1 ? k / 0.1 : k > 0.85 ? (1 - k) / 0.15 : 1, cx = (x0 + x1) / 2;
    glow(c, cx, gy - 260, 260, 'rgba(255,110,30,.28)', a);   // 그 구역 위쪽만 붉은 열기
    for (let i = 0; i < 30; i++) { const u = (k * 2.4 + rnd(i * 3)) % 1, x = x0 + rnd(i) * (x1 - x0) + (1 - u) * 50, y = gy - 440 + u * 440; c.save(); c.globalAlpha = a; for (let j = 0; j < 5; j++) puff(c, x + j * 5, y - j * 13, 5 - j * 0.6, 0.95 - j * 0.15, 0.85); c.restore(); }
    const grow = min(1, k * 2.2); for (let i = 0; i < 9; i++) { const x = x0 + 20 + i * (x1 - x0 - 40) / 8; if (Math.abs(x - cx) > grow * (x1 - x0) / 2) continue; scorch(c, x, gy, 50, a); flame(c, x, gy, 70 + rnd(i) * 40, 50, 18, t, a, i * 11, 1.8); } };
  // ===== 궁극기: 태양 낙하 — 하늘의 해(skyfx) + 작아진 하얀 별똥 + 화면 열기 + 땅 불길 =====
  M.f_sun = (c, p, k, gy, T) => { const t = T0(k), a = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1, sx = p.x + 520, sy = gy - 470;
    c.save(); c.globalAlpha = a * 0.22; c.fillStyle = '#ff9a40'; c.fillRect(p.x - 600, gy - 900, 2600, 1000); c.restore();
    G.SkyFX.sun(c, { x: sx, y: sy, t }, k);
    for (let i = 0; i < 6; i++) { const t0 = 0.12 + i * 0.09, u = (k - t0) / 0.25, tx = p.x + 220 + i * 105; if (u < 0) continue;
      if (u < 1) { const L = 420 * (1 - u); c.save(); c.translate(tx - L * 0.55, gy - 30 - L * 0.85); c.scale(0.45, 0.45); G.SkyFX.meteor(c, 1.0, t + i); c.restore(); }
      else { const v = min(1, (u - 1) / 1.6); glow(c, tx, gy - 30, 110 * (1 - v * 0.4), 'rgba(255,250,220,.95)', 1 - v); scorch(c, tx, gy, 90, 1 - v * 0.5); flame(c, tx, gy, 120 * (1 - v), 50, 12, t, 1 - v, i * 13, 2); } } };
})();
