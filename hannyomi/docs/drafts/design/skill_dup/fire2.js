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
  M._fx = { puff, flame, embers, scorch, burst, glow, fireball, rnd };
})();

// ===== 불꽃 폭풍 대신 새 스킬 후보 4개 (3차 · 중간 크기 · 앞쪽 적 여럿) =====
(function () { const M = G.SageMock, F = M._fx, PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max, rnd = F.rnd;
  const T0 = (k) => 1.3 + k * 2.2;
  // 가: 불사조 비상 — 불새가 캐릭터 앞에서 날개를 펴고 적 사이를 낮게 날아가며 불꼬리를 남김
  M.n_phoenix = (c, p, k, gy, T) => { const t = T0(k), u = min(1, k / 0.75), x = p.x + 80 + u * 540, y = gy - 110 - sin(u * PI) * 30, f = k < 0.8 ? 1 : (1 - k) / 0.2, flap = sin(t * 9);
    for (let i = 0; i < 36; i++) { const v = i / 36; F.puff(c, x - 40 - v * 240, y + 10 + sin(v * 7 + t * 5) * 10 * v, 14 * (1 - v * 0.6), 0.9 - v * 0.85, f * 0.75); }   // 불꼬리
    c.save(); c.globalAlpha = f; c.translate(x, y);
    const fill = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fff2b0'); g.addColorStop(0.35, '#ffb040'); g.addColorStop(0.75, '#ff5a14'); g.addColorStop(1, 'rgba(200,40,10,.6)'); return g; };
    for (const [sg, s2] of [[-1, 1], [1, 0.75]]) { const lift = sg < 0 ? 70 + flap * 45 : -(30 + flap * 20); c.beginPath(); c.moveTo(6, 0);   // 날개 (위 · 아래)
      c.bezierCurveTo(-10, -lift * 0.3, -40, -lift * 0.9, -90, -lift); for (let j = 0; j < 5; j++) { const tx = -90 + j * 16, ty = -lift + (sg < 0 ? 1 : -1) * (j % 2 ? 22 : 6) * s2; c.lineTo(tx, ty * (1 - j * 0.12)); } c.quadraticCurveTo(-20, -lift * 0.15, -6, 4); c.closePath();
      c.fillStyle = fill(-Math.abs(lift), 10); c.globalAlpha = f * (sg < 0 ? 1 : 0.75); c.fill(); }
    c.globalAlpha = f; c.beginPath(); c.moveTo(34, -6); c.quadraticCurveTo(20, -18, 4, -8); c.quadraticCurveTo(-30, -2, -46, 10); c.quadraticCurveTo(-20, 12, 6, 8); c.quadraticCurveTo(24, 4, 34, -6); c.fillStyle = fill(-18, 12); c.fill();   // 몸 · 머리
    c.beginPath(); c.moveTo(34, -6); c.lineTo(46, -4); c.lineTo(34, 0); c.fillStyle = '#ffe080'; c.fill(); c.fillStyle = '#5a1a08'; c.beginPath(); c.arc(25, -8, 2.2, 0, PI * 2); c.fill();
    for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(16, -14); c.quadraticCurveTo(8 - j * 6, -32 - j * 4, -4 - j * 8, -28 - j * 6); c.strokeStyle = '#ffb040'; c.lineWidth = 2.4; c.stroke(); }   // 머리 깃
    c.restore(); F.glow(c, x - 20, y, 110, 'rgba(255,160,60,.45)', f); F.embers(c, x - 120, gy, 200, 220, 12, t, f, 4); };
  // 나: 화염 채찍 — 지팡이 끝에서 불 채찍이 길게 뻗어 앞쪽을 위에서 아래로 휘둘러 쓸어냄
  M.n_whip = (c, p, k, gy) => { const t = T0(k), sx = p.x + 22, sy = gy - 46, sw = min(1, k / 0.45), ang = -1.2 + sw * 1.45, L = 420, f = k < 0.7 ? 1 : (1 - k) / 0.3;
    for (let tr = 4; tr >= 0; tr--) { const a2 = ang - tr * 0.08, al = f * (tr ? 0.25 : 1); for (let i = 0; i < 34; i++) { const v = i / 34, bend = sin(v * PI) * 50 * (1 - sw) , x = sx + cos(a2) * L * v - sin(a2) * bend, y = sy + sin(a2) * L * v + cos(a2) * bend; F.puff(c, x, y, 13 - v * 6, 0.98 - v * 0.45, al); } }
    if (sw >= 1) { const v = min(1, (k - 0.45) / 0.4); for (let i = 0; i < 6; i++) { const x = sx + 120 + i * 55; F.scorch(c, x, gy, 50, 1 - v); F.flame(c, x, gy, 60 * (1 - v), 34, 8, t, 1 - v, i * 9); } } };
  // 다: 불꽃 나비 떼 — 불꽃 나비 여러 마리가 팔랑이며 적에게 날아가 하나씩 톡톡 터짐
  M.n_butter = (c, p, k, gy, T) => { const t = T0(k); for (let i = 0; i < 8; i++) { const tgt = T[i % T.length], t0 = i * 0.05, u = min(1, max(0, (k - t0) / 0.5)), sx = p.x + 20, sy = gy - 60;
      const x = sx + (tgt - sx) * u + sin(u * 9 + i) * 30 * (1 - u), y = sy - sin(u * PI) * (60 + rnd(i) * 80) + (gy - 50 - sy) * u + cos(u * 11 + i) * 14;
      if (u < 1) { const fl = Math.abs(sin(t * 22 + i)); for (const sg of [-1, 1]) { c.save(); c.translate(x, y); c.scale(sg * (0.3 + 0.7 * fl) * 1.8, 1.8); F.puff(c, 7, -5, 8, 0.85, 1); F.puff(c, 6, 5, 5, 0.6, 1); c.restore(); } F.puff(c, x, y, 5, 1, 1);
        for (let j = 1; j < 5; j++) F.puff(c, x - j * 7, y + j * 2, 3, 0.7 - j * 0.12, 0.6); }
      else { const v = min(1, (k - t0 - 0.5) / 0.3); if (v < 1) F.burst(c, tgt, gy - 50, 34, v, 10, i * 7); } } };
  // 라: 불의 정령 — 앞에 작은 불의 정령이 솟아올라 앞쪽으로 불 숨결을 뿜음
  M.n_spirit = (c, p, k, gy) => { const t = T0(k), x = p.x + 110, rise = min(1, k / 0.2), f = k < 0.85 ? 1 : (1 - k) / 0.15, y = gy - 60 * rise;
    F.scorch(c, x, gy, 60, f); for (let i = 0; i < 26; i++) { const v = (t * 1.4 + rnd(i)) % 1; F.puff(c, x + (rnd(i * 3) - 0.5) * 30 * (1 - v), y + 20 - v * 70, 18 - v * 10, 1 - v, f); }
    F.puff(c, x, y - 18, 16, 1, f); c.save(); c.globalAlpha = f; c.fillStyle = '#5a1a08'; c.beginPath(); c.arc(x - 5, y - 20, 2.4, 0, PI * 2); c.arc(x + 6, y - 20, 2.4, 0, PI * 2); c.fill(); c.restore();
    if (k > 0.25) { const b = min(1, (k - 0.25) / 0.2); for (let i = 0; i < 60; i++) { const v = (t * 2.2 + rnd(i)) % 1 * b, bx = x + 20 + v * 380, by = y - 14 + (rnd(i * 5) - 0.5) * 60 * v; F.puff(c, bx, by, 8 + v * 22, 1 - v * 0.95, f * 0.85); } } };
})();
// ===== 새 스킬 후보 2차: 마 불꽃 폭죽 · 바 화염 수레바퀴 · 사 불의 용 · 아 화염 감옥 =====
(function () { const M = G.SageMock, F = M._fx, PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max, rnd = F.rnd;
  const T0 = (k) => 1.3 + k * 2.2;
  // 마: 불꽃 폭죽 — 지팡이에서 불꽃 구슬이 높이 솟아 공중에서 '팡' 터지고, 불씨가 적들 위로 쏟아짐
  M.n_firework = (c, p, k, gy, T) => { const t = T0(k), sx = p.x + 30, sy = gy - 50, cx = (T[0] + T[3]) / 2, cy = gy - 330;
    if (k < 0.3) { const u = k / 0.3, x = sx + (cx - sx) * u, y = sy + (cy - sy) * (1 - (1 - u) * (1 - u)); for (let i = 0; i < 10; i++) F.puff(c, x - (cx - sx) * 0.03 * i, y + i * 12 * (1 - u), 8 - i * 0.6, 0.95 - i * 0.08, 1); F.glow(c, x, y, 30, 'rgba(255,200,90,.8)', 1); return; }
    const u = (k - 0.3) / 0.7; if (u < 0.35) F.burst(c, cx, cy, 120, u / 0.35, 30, 5);
    for (let i = 0; i < 40; i++) { const an = rnd(i) * PI * 2, sp = 140 + rnd(i * 3) * 160, x = cx + cos(an) * sp * u, y = cy + sin(an) * sp * u * 0.7 + u * u * 520; if (y > gy) continue;
      for (let j = 0; j < 4; j++) F.puff(c, x - cos(an) * j * 8, y - j * 10, 4 - j * 0.6, 0.95 - j * 0.2 - u * 0.3, 1 - u * 0.5); }
    for (let i = 0; i < 4; i++) { const x = T[i]; if (u > 0.55) { const v = (u - 0.55) / 0.45; F.scorch(c, x, gy, 50, 1 - v); F.flame(c, x, gy, 50 * (1 - v), 30, 8, t, 1 - v, i * 7); } } };
  // 바: 화염 수레바퀴 — 불타는 바퀴가 땅을 굴러가며 적을 차례로 치고 지나가고, 바퀴 자국에 불길
  M.n_wheel = (c, p, k, gy) => { const t = T0(k), u = min(1, k / 0.8), x = p.x + 60 + u * 600, R = 42, y = gy - R, rot = u * 16, f = k < 0.85 ? 1 : (1 - k) / 0.15;
    for (let xx = p.x + 70; xx < x - 30; xx += 30) { const age = (x - xx) / 500; F.flame(c, xx, gy, 40 * max(0, 1 - age), 26, 5, t, f * max(0, 1 - age), xx | 0); }
    c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = f; for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; c.strokeStyle = '#ffb040'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(cos(a) * R, sin(a) * R); c.stroke(); } c.restore();
    for (let i = 0; i < 28; i++) { const a = i / 28 * PI * 2 + rot; F.puff(c, x + cos(a) * R, y + sin(a) * R, 13, 0.95, f); F.puff(c, x + cos(a) * (R + 10) - 6, y + sin(a) * (R + 10) - 10, 8, 0.5, f * 0.7); }
    F.puff(c, x, y, 14, 1, f); F.glow(c, x, y, 90, 'rgba(255,150,50,.5)', f); };
  // 사: 불의 용 — 지팡이에서 불의 용이 뻗어 나와 적 사이를 물결치며 지나가고 끝에서 '콰' 하고 입을 벌림
  M.n_dragon = (c, p, k, gy, T) => { const t = T0(k), u = min(1, k / 0.6), f = k < 0.8 ? 1 : (1 - k) / 0.2, sx = p.x + 30, L = 600 * u, hx = sx + L, n = 40;
    const at = (v) => [sx + L * v, gy - 70 + sin(v * 10 - t * 6) * 40 * v];
    for (let i = n; i >= 0; i--) { const v = i / n, [x, y] = at(v); F.puff(c, x, y, 10 + v * 16, 0.6 + v * 0.35, f); if (i % 4 === 0) F.puff(c, x - 6, y - 20 - v * 6, 7, 0.95, f); }
    const [x, y] = at(1); c.save(); c.globalAlpha = f; c.translate(x, y); const open = 0.3 + 0.3 * Math.abs(sin(t * 8));
    for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(20, sg * 26 * open * 2, 48, sg * 18 * open * 2); c.lineTo(10, sg * 6); c.closePath(); c.fillStyle = '#ff7a20'; c.fill(); }
    for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(-24 + sg * 4, -40, -40 + sg * 6, -46); c.strokeStyle = '#ffd060'; c.lineWidth = 3; c.stroke(); }
    c.fillStyle = '#fff2b0'; c.beginPath(); c.arc(8, -10, 4, 0, PI * 2); c.fill(); c.fillStyle = '#5a1a08'; c.beginPath(); c.arc(9, -10, 2, 0, PI * 2); c.fill(); c.restore();
    F.glow(c, x, y, 80, 'rgba(255,150,50,.5)', f); if (u >= 1) for (let i = 0; i < 4; i++) { const v = (k - 0.6) / 0.4; F.burst(c, T[i], gy - 50, 40, min(1, v * 1.4), 10, i * 9); } };
  // 아: 화염 감옥 — 적 무리 둘레에 불기둥이 빙 둘러 솟아 가두고, 안쪽이 달아오르다 한꺼번에 터짐
  M.n_cage = (c, p, k, gy, T) => { const t = T0(k), cx = (T[0] + T[3]) / 2, R = 190, rise = min(1, k / 0.25), f = k < 0.85 ? 1 : (1 - k) / 0.15;
    const posts = 12, draw = (front) => { for (let i = 0; i < posts; i++) { const a = i / posts * PI * 2, z = sin(a); if ((z > 0) !== front) continue; const x = cx + cos(a) * R, y = gy - 4 + z * 26;
      F.flame(c, x, y, 150 * rise * (0.85 + 0.15 * sin(t * 4 + i)), 30, 12, t, f * (front ? 1 : 0.75), i * 13, 2); } };
    draw(false); c.save(); c.translate(cx, gy - 4); c.scale(1, 0.14); c.globalAlpha = f * 0.6; c.strokeStyle = '#ff6a20'; c.lineWidth = 16; c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.stroke(); c.restore();
    if (k > 0.25 && k < 0.6) F.glow(c, cx, gy - 60, R, 'rgba(255,120,40,.35)', (k - 0.25) / 0.35);
    if (k >= 0.6) F.burst(c, cx, gy - 60, 160, min(1, (k - 0.6) / 0.35), 34, 41);
    draw(true); };
})();
// ===== 바 · 사 다듬기 (그린 몸통 + 불 입자) =====
(function () { const M = G.SageMock, F = M._fx, PI = Math.PI, sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max, rnd = F.rnd;
  const T0 = (k) => 1.3 + k * 2.2;
  // 바2: 화염 수레바퀴 — 쇠 테두리 · 바퀴살이 달아오른 바퀴, 회전 방향 뒤로 쓸려 나가는 불길 · 땅에 튀는 불똥 · 그을린 바퀴 자국
  M.n_wheel2 = (c, p, k, gy) => { const t = T0(k), u = min(1, k / 0.8), x = p.x + 70 + u * 600, R = 52, y = gy - R, rot = u * 18, f = k < 0.85 ? 1 : (1 - k) / 0.15;
    // 바퀴 자국: 그을린 줄 + 남은 낮은 불길
    c.save(); c.globalAlpha = f * 0.8; const tg = c.createLinearGradient(p.x + 70, 0, x, 0); tg.addColorStop(0, 'rgba(60,30,20,0)'); tg.addColorStop(1, 'rgba(90,40,20,.7)'); c.fillStyle = tg; c.fillRect(p.x + 70, gy - 4, x - p.x - 70, 6); c.restore();
    for (let xx = p.x + 90; xx < x - 40; xx += 26) { const age = (x - xx) / 420; if (age < 1) F.flame(c, xx, gy, 46 * (1 - age), 24, 6, t, f * (1 - age), xx | 0, 2); }
    // 테두리에서 피어나 뒤 · 위로 휘어 흐르는 불길 → 식으며 연기로 (바퀴가 앞으로 가니 불은 뒤로 끌림)
    for (let i = 0; i < 90; i++) { const a0 = rnd(i) * PI * 2, v = (t * 1.8 + rnd(i * 3)) % 1, rx = x + cos(a0 + rot) * R, ry = y + sin(a0 + rot) * R;
      const px = rx - v * (70 + rnd(i * 5) * 60) - v * v * 30, py = ry - v * (40 + rnd(i * 7) * 50) + sin(t * 8 + i) * 4 * v;
      F.puff(c, px, py, (10 + rnd(i * 9) * 8) * (1 + v * 0.8), 1 - v * 1.15, f * (v < 0.1 ? v / 0.1 : 1) * 0.85); }
    // 땅에 닿는 곳: 달아오른 빛 · 뒤로 튀는 불똥 (포물선) · 흙먼지
    F.glow(c, x, gy - 2, 46, 'rgba(255,190,90,.8)', f); for (let i = 0; i < 6; i++) { const v = (t * 1.5 + rnd(i * 11)) % 1; F.puff(c, x - 30 - v * 70, gy - 8 - v * 20, 8 + v * 16, 0.12 - v * 0.12, f * 0.6 * (1 - v)); }
    F.glow(c, x, y, R * 2.4, 'rgba(255,140,40,.55)', f);
    c.save(); c.globalAlpha = f; c.translate(x, y);
    const rg = c.createRadialGradient(0, 0, R * 0.2, 0, 0, R); rg.addColorStop(0, 'rgba(255,240,180,.85)'); rg.addColorStop(0.55, 'rgba(255,150,40,.4)'); rg.addColorStop(1, 'rgba(200,60,10,.15)'); c.fillStyle = rg; c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.fill();
    c.rotate(rot); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * PI / 4); const sg = c.createLinearGradient(0, 0, R, 0); sg.addColorStop(0, '#fff4c8'); sg.addColorStop(1, '#ff7a20'); c.fillStyle = sg; c.beginPath(); c.moveTo(0, -3); c.lineTo(R - 6, -4.5); c.lineTo(R - 6, 4.5); c.lineTo(0, 3); c.fill(); c.restore(); }
    c.lineWidth = 9; c.strokeStyle = '#4a2a18'; c.beginPath(); c.arc(0, 0, R - 3, 0, PI * 2); c.stroke(); c.lineWidth = 5; const rimg = c.createLinearGradient(-R, -R, R, R); rimg.addColorStop(0, '#ffd070'); rimg.addColorStop(1, '#e85a14'); c.strokeStyle = rimg; c.stroke();
    for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * PI / 6); c.fillStyle = '#ffb040'; c.fillRect(R - 4, -3, 7, 6); c.restore(); }   // 테두리 돌기
    c.fillStyle = '#4a2a18'; c.beginPath(); c.arc(0, 0, 10, 0, PI * 2); c.fill(); c.fillStyle = '#ffd070'; c.beginPath(); c.arc(0, 0, 6, 0, PI * 2); c.fill(); c.restore();
    c.save(); c.lineCap = 'round'; for (let i = 0; i < 18; i++) { const v = (t * 2.2 + rnd(i * 3)) % 1, vx = 140 + rnd(i) * 160, vy = 120 + rnd(i * 5) * 140, sx = x - 8 - vx * v, sy = gy - 4 - vy * v + 260 * v * v; if (sy > gy) continue;
      const px2 = x - 8 - vx * (v - 0.04), py2 = gy - 4 - vy * (v - 0.04) + 260 * (v - 0.04) * (v - 0.04); c.globalAlpha = f * (1 - v); c.strokeStyle = v < 0.5 ? '#fff2b0' : '#ff9a30'; c.lineWidth = 2.2 * (1 - v) + 0.8; c.beginPath(); c.moveTo(px2, py2); c.lineTo(sx, sy); c.stroke(); } c.restore(); };   // 땅에 튀는 불똥 (꼬리 달린 선)
  // 사2: 불의 용 — 비늘 그라데이션 몸통(점점 가늘어짐) · 등의 불 갈기 · 뿔 · 수염 · 벌린 입 · 꼬리 불꽃
  M.n_dragon2 = (c, p, k, gy, T) => { const t = T0(k), u = min(1, k / 0.6), f = k < 0.82 ? 1 : (1 - k) / 0.18, sx = p.x + 30, L = 620 * u, n = 60;
    const at = (v) => [sx + L * v, gy - 80 + sin(v * 9 - t * 5) * 36 * min(1, v * 3) - v * 10];
    const pts = []; for (let i = 0; i <= n; i++) pts.push(at(i / n));
    const width = (v) => 4 + 20 * Math.pow(v, 0.8);
    // 바깥 불빛 + 몸통 (위 · 아래 가장자리를 이어 채움)
    c.save(); c.globalAlpha = f; const up = [], dn = [];
    for (let i = 0; i <= n; i++) { const [x, y] = pts[i], [x2, y2] = pts[min(n, i + 1)], [x0, y0] = pts[max(0, i - 1)], dx = x2 - x0, dy = y2 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = width(i / n); up.push([x - nx * w, y - ny * w]); dn.push([x + nx * w, y + ny * w]); }
    for (let i = 0; i <= n; i += 2) F.glow(c, pts[i][0], pts[i][1], width(i / n) * 2.2, 'rgba(255,130,40,.45)', 0.5);
    c.beginPath(); up.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); for (let i = n; i >= 0; i--) c.lineTo(dn[i][0], dn[i][1]); c.closePath();
    const bg = c.createLinearGradient(sx, 0, sx + L, 0); bg.addColorStop(0, '#ff9a30'); bg.addColorStop(0.6, '#ff6a18'); bg.addColorStop(1, '#e8400c'); c.fillStyle = bg; c.fill();
    c.strokeStyle = 'rgba(120,20,5,.6)'; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); dn.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); for (let i = n; i >= 0; i--) c.lineTo(pts[i][0] * 0.4 + dn[i][0] * 0.6, pts[i][1] * 0.4 + dn[i][1] * 0.6); c.closePath(); c.fillStyle = 'rgba(255,230,140,.85)'; c.fill();   // 밝은 배
    for (let i = 4; i < n - 2; i += 3) { const [x, y] = pts[i], w = width(i / n); c.fillStyle = 'rgba(160,30,8,.45)'; c.beginPath(); c.ellipse(x, y - w * 0.25, w * 0.35, w * 0.25, 0, 0, PI * 2); c.fill(); }   // 비늘 무늬
    c.restore();
    c.save(); c.globalAlpha = f; for (let i = 5; i < n - 4; i += 3) { const [x, y] = up[i], [bx, by] = pts[i], v = i / n, nx = x - bx, ny = y - by, l = Math.hypot(nx, ny) || 1, ux = nx / l, uy = ny / l, Lm = 14 + v * 22 + sin(t * 9 + i) * 4, tx = -uy, ty = ux;   // 등 불 갈기 (불꽃 지느러미)
      const ex = x + ux * Lm - tx * Lm * 0.5, ey = y + uy * Lm - ty * Lm * 0.5; c.beginPath(); c.moveTo(x + tx * 7, y + ty * 7); c.quadraticCurveTo(x + ux * Lm * 0.6, y + uy * Lm * 0.6, ex, ey); c.quadraticCurveTo(x + ux * Lm * 0.3 - tx * 4, y + uy * Lm * 0.3 - ty * 4, x - tx * 7, y - ty * 7); c.closePath();
      const g = c.createLinearGradient(x, y, ex, ey); g.addColorStop(0, '#ff5a14'); g.addColorStop(0.6, '#ffb040'); g.addColorStop(1, '#fff2b0'); c.fillStyle = g; c.fill(); } c.restore();
    F.flame(c, pts[0][0], pts[0][1], 26, 14, 8, t, f, 3, 2.2);   // 꼬리 불꽃
    // 머리
    const [hx, hy] = pts[n], [px2, py2] = pts[n - 3], ang = Math.atan2(hy - py2, hx - px2), open = 0.35 + 0.35 * Math.abs(sin(t * 7));
    c.save(); c.globalAlpha = f; c.translate(hx, hy); c.rotate(ang); c.scale(1.5, 1.5);
    c.beginPath(); c.moveTo(-10, -18); c.quadraticCurveTo(26, -26, 48, -10 - open * 8); c.lineTo(44, -2); c.quadraticCurveTo(14, -4, -10, 6); c.closePath(); const hg = c.createLinearGradient(0, -26, 0, 6); hg.addColorStop(0, '#ffb040'); hg.addColorStop(1, '#e8400c'); c.fillStyle = hg; c.fill(); c.strokeStyle = 'rgba(120,20,5,.6)'; c.lineWidth = 1.5; c.stroke();   // 윗턱
    c.beginPath(); c.moveTo(-8, 8); c.quadraticCurveTo(18, 10 + open * 10, 40, 8 + open * 22); c.lineTo(38, 2 + open * 14); c.quadraticCurveTo(14, 2, -8, 2); c.closePath(); c.fillStyle = '#ff7a20'; c.fill(); c.stroke();   // 아래턱
    for (let j = 0; j < 4; j++) { c.fillStyle = '#fffbe0'; c.beginPath(); c.moveTo(14 + j * 8, -4); c.lineTo(17 + j * 8, 2); c.lineTo(20 + j * 8, -4); c.fill(); }   // 이빨
    for (const sg of [0, 1]) { c.beginPath(); c.moveTo(-4 - sg * 8, -18); c.quadraticCurveTo(-20 - sg * 10, -40, -44 - sg * 8, -44 + sg * 8); c.strokeStyle = '#ffd070'; c.lineWidth = 4 - sg; c.lineCap = 'round'; c.stroke(); }   // 뿔
    c.beginPath(); c.moveTo(30, -2); c.quadraticCurveTo(10, 20 + sin(t * 6) * 6, -30, 24); c.strokeStyle = '#ffe080'; c.lineWidth = 2; c.stroke();   // 수염
    c.fillStyle = '#fff6c8'; c.beginPath(); c.ellipse(16, -14, 5, 3.5, -0.2, 0, PI * 2); c.fill(); c.fillStyle = '#5a1006'; c.beginPath(); c.ellipse(17, -14, 2, 3, 0, 0, PI * 2); c.fill();   // 눈
    c.restore();
    F.glow(c, hx + cos(ang) * 30, hy + sin(ang) * 30, 60, 'rgba(255,200,90,.6)', f * open);
    for (let i = 0; i < 18; i++) { const v = (t * 2.6 + rnd(i)) % 1; F.puff(c, hx + cos(ang) * (44 + v * 110), hy + sin(ang) * (44 + v * 110) + (rnd(i * 3) - 0.5) * 50 * v, 6 + v * 16, 1 - v, f * open); }   // 입김 불
    if (u >= 1) for (let i = 0; i < 4; i++) F.burst(c, T[i], gy - 50, 40, min(1, (k - 0.6) / 0.3), 12, i * 9); };
})();
