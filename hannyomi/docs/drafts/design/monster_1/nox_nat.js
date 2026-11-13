(function(){

// 1.7.7 공허의 군주 녹스 · 이야기에서 나온 디자인 (docs/NOX_CHARACTER.md, docs/BUILD_1.7.7_PLAN.md)
//  "별들 사이의 밤": 검은 남색 몸 · 가슴의 별 모양 빈자리(떼어 간 공허의 별조각) · 두 꺼진 별 구체 · 퍼지는 금 · 꺼진 등불
//  G.NoxArtN.story(c,t,ph,bg)  기본 몸 (페이즈 0 체념 / 1 서러움 / 2 절망)
//  G.NoxArtN.mix(c,t,ph,bg)    몸 + 구체 + 금 + 등불 (게임·영상에서 쓰는 최종 모습)
//  G.NoxArtN.lit(c,t,k,bg,hx)  쓰러질 때 등불이 켜지는 장면 (k 0→1)
G.NoxArtN = {};
// 녹스 · 이야기에서 나온 디자인 시안 v3. 발밑 (0,0), 키 약 250, 오른쪽을 봄
// 밤 그 자체 / 가슴의 별 모양 빈자리(떼어 낸 공허의 별조각) / 앞으로 뻗은 손 / 꺼져 가는 별을 품은 망토
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const chain = (c, x0, y0, x1, y1) => { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 7); for (let k = 0; k < n; k++) { const u = (k + .5) / n; c.save(); c.translate(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); c.rotate(Math.atan2(y1 - y0, x1 - x0) + (k % 2 ? PI / 2 : 0)); ell(c, 0, 0, 4, 2.3, null, '#5a5a6e', 1.6); c.restore(); } };

  // ph 0 체념(봉인) / 1 서러움 / 2 절망(무너짐).  bg: 빈자리 너머로 비칠 배경색
  G.NoxArtN.story = function (c, t, ph, bg) {
    const NIGHT = '#0a0a16', CLOAK = '#12122a', CLOAK2 = '#1c1c3a', LINE = '#2c2c4e', PALE = '#d8def8';
    const bow = [0.22, 0.02, -0.06][ph];   // 고개 숙임
    const fade = ph === 2 ? 1 : 0;
    // 그림자 (짧고 좁게)
    ell(c, 0, 0, 42, 6, 'rgba(0,0,0,.45)');
    // ---- 망토: 곧게 떨어지는 긴 사다리꼴 (아래로 크게 퍼지지 않음) ----
    const hem = (x0, x1, y) => { const n = 9, pts = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; pts.push([x, y - (i % 2 ? 6 + fade * 18 : 0) + (fade ? sin(t * 2 + i) * 4 : 0)]); } return pts; };
    const sway = sin(t * 1.1) * 2.5;
    const cloakPath = () => { c.beginPath(); c.moveTo(-20, -200); c.quadraticCurveTo(-30, -198, -31, -186);
      c.bezierCurveTo(-32, -130, -36 + sway * 0.4, -60, -40 + sway, -2);
      const n = 8; for (let i = 1; i <= n; i++) { const x0 = -40 + (i - 0.5) * 80 / n + sway * (1 - i / n), x1 = -40 + i * 80 / n + sway * (1 - i / n) * 0.6;
        c.quadraticCurveTo(x0, -7 - fade * 14 + sin(t * 2 + i) * (1.5 + fade * 3), x1, -1 + sin(t * 2.3 + i) * 1.2); }
      c.bezierCurveTo(36 + sway * 0.3, -60, 32, -130, 31, -186); c.quadraticCurveTo(30, -198, 20, -200); c.closePath(); };
    cloakPath(); c.fillStyle = lin(c, 0, -196, 0, 0, CLOAK2, NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.4; c.stroke();
    const cloak = null;
    // 망토 안의 꺼져 가는 별들 (빛나지 못하고 희미)
    c.save(); cloakPath(); c.clip();
    c.strokeStyle = 'rgba(4,4,12,.45)'; c.lineWidth = 3; for (const x of [-18, -4, 12, 24]) { c.beginPath(); c.moveTo(x * 0.6, -180); c.quadraticCurveTo(x * 0.9 + sway * 0.3, -100, x * 1.25 + sway * 0.6, 0); c.stroke(); }   // 천 주름
    for (let i = 0; i < 18 + ph * 10; i++) { const x = ((i * 53) % 60) - 30, y = -180 + ((i * 97) % 170), a = (0.15 + 0.25 * ((sin(t * 1.3 + i) + 1) / 2)) * (ph === 2 ? 1.6 : 1);
      ell(c, x, y, 1.1, 1.1, `rgba(220,226,255,${Math.min(0.75, a)})`); }
    c.restore();
    // 절망: 가장자리가 밤하늘로 풀려 흩어짐 (아래·옆으로 떨어져 나가는 조각)
    if (ph === 2) for (let i = 0; i < 22; i++) { const u = ((t * 0.25 + i / 22) % 1), x = (i % 2 ? 1 : -1) * (30 + u * 40) + sin(i) * 6, y = -190 + (i * 37 % 190) + u * 10;
      c.globalAlpha = 1 - u; poly(c, CLOAK2, [[x, y], [x + 5, y + 3], [x + 2, y + 8], [x - 3, y + 4]]); if (i % 3 === 0) ell(c, x + 2, y + 3, 1, 1, PALE); c.globalAlpha = 1; }
    // ---- 상체 ----
    c.beginPath(); c.moveTo(-12, -204); c.quadraticCurveTo(-27, -203, -27, -190); c.quadraticCurveTo(-24, -150, -16, -126); c.quadraticCurveTo(0, -120, 16, -126); c.quadraticCurveTo(24, -150, 27, -190); c.quadraticCurveTo(27, -203, 12, -204); c.closePath();
    c.fillStyle = lin(c, 0, -200, 0, -120, '#1a1a36', NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.2; c.stroke();
    // ---- 가슴의 별 모양 빈자리 (뒤 배경이 그대로 비침) ----
    const sr = [11, 12, 14][ph], cy = -165;
    poly(c, bg, starPts(0, cy, sr));
    // 빈자리 안으로 빨려 드는 희미한 별빛 (페이즈 2부터)
    if (ph >= 1) for (let i = 0; i < 5; i++) { const u = (t * 0.4 + i / 5) % 1, a = i * 1.26, r = sr * (3.2 - u * 2.6); ell(c, cos(a) * r, cy + sin(a) * r * 0.8, 1, 1, `rgba(220,226,255,${u * 0.8})`); }
    poly(c, null, starPts(0, cy, sr), ph === 2 ? PALE : '#6a6e98', ph === 2 ? 1.6 : 1.2);
    // ---- 봉인의 사슬 (체념) ----
    if (ph === 0) { chain(c, -24, -192, 24, -142); chain(c, 24, -192, -24, -142); }
    // ---- 팔: 뒤쪽 팔은 늘어뜨림, 앞쪽 팔은 페이즈에 따라 뻗음 ----
    const arm = (sg, ang, reach) => { c.save(); c.translate(sg * 22, -194); c.rotate(ang);
      c.beginPath(); c.moveTo(-7, -2); c.quadraticCurveTo(-9, 30, -6, 50); c.quadraticCurveTo(-11, 60, -9, 66); c.quadraticCurveTo(0, 70, 9, 66); c.quadraticCurveTo(10, 58, 6, 50); c.quadraticCurveTo(8, 28, 7, -2); c.closePath();
      c.fillStyle = lin(c, 0, 0, 0, 70, CLOAK2, NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.1; c.stroke();
      c.strokeStyle = 'rgba(4,4,12,.5)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-2, 8); c.quadraticCurveTo(-4, 34, -1, 60); c.stroke();
      // 손: 가늘고 긴 손가락
      ell(c, 0, 70, 4.5, 5.5, '#2a2a46');
      for (const fx of [-3.5, -1, 1.5, 4]) { c.strokeStyle = '#3a3a5a'; c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx, 73); c.quadraticCurveTo(fx * (reach ? 1.5 : 1.15), 79, fx * (reach ? 1.6 : 1.2) + 1.5, 83 + (reach ? 2 : 0)); c.stroke(); }
      if (ph === 0) chain(c, -9, 56, 9, 56);
      c.restore(); };
    arm(-1, 0.12, false);
    arm(1, [-0.15, -1.15, -1.35][ph] + sin(t * 1.2) * 0.03, ph >= 1);
    // ---- 머리: 깊은 두건, 얼굴은 어둠, 희미한 두 눈 ----
    c.save(); c.translate(0, -214); c.rotate(bow);
    c.beginPath(); c.moveTo(-22, 20); c.quadraticCurveTo(-20, 4, -18, -6); c.quadraticCurveTo(-16, -24, 0, -27); c.quadraticCurveTo(16, -24, 18, -6); c.quadraticCurveTo(20, 4, 22, 20); c.quadraticCurveTo(0, 14, -22, 20); c.closePath();
    c.fillStyle = lin(c, 0, -26, 0, 18, CLOAK2, NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.3; c.stroke();
    c.beginPath(); c.moveTo(-10, 12); c.quadraticCurveTo(-13, -2, -9, -8); c.quadraticCurveTo(0, -14, 9, -8); c.quadraticCurveTo(13, -2, 10, 12); c.quadraticCurveTo(0, 17, -10, 12); c.closePath(); c.fillStyle = '#030308'; c.fill();
    const ea = [0.45, 0.75, 0.95][ph];
    for (const sg of [-1, 1]) ell(c, sg * 4.5 + 1, 0, 2.2, 1.1, `rgba(216,222,248,${ea})`);
    // 왕관: 장식 없는 가는 검은 고리 하나 (머리 위에 살짝 떠 있음)
    c.strokeStyle = ph === 2 ? 'rgba(216,222,248,.55)' : '#3a3a5e'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, -32 - ph * 2, 15, 4, 0, 0, PI * 2); c.stroke();
    c.restore();
  };
})();

// 녹스 최종 후보: v3 + ① 두 꺼진 별 구체 · 퍼지는 금 + ⑤ 꺼진 등불 (페이즈 1~3)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const VIO = '#9a7ae0';
  const deadStar = (c, x, y, r, t, dim) => { glow(c, x, y, r * 2.4, '#8a80d0', 0.3 * dim); ell(c, x, y, r, r, '#05050e', VIO, 1.6); poly(c, `rgba(216,222,248,${(0.22 + 0.15 * sin(t * 2)) * dim})`, starPts(x, y, r * 0.45)); };
  // 가슴 빈자리에서 퍼지는 금 (길이 비율 k)
  const cracks = (c, k, t) => {
    for (const [a, L] of [[-2.5, 80], [-0.7, 90], [-1.6, 60], [2.6, 70], [0.6, 75], [1.6, 110], [-3.0, 95]]) {
      const n = Math.max(1, Math.round(5 * k)); if (k < 0.3 && L > 80) continue;
      const p = [[0, -165]]; let x = 0, y = -165;
      for (let s = 0; s < n; s++) { x += cos(a + sin(s * 3) * 0.5) * L / 5; y += sin(a + sin(s * 3) * 0.5) * L / 5; p.push([x, y]); }
      line(c, 'rgba(154,122,224,.3)', 4, p); line(c, `rgba(190,176,245,${0.5 + 0.3 * sin(t * 2 + a)})`, 1.2, p);
    }
  };
  // 등불: 별이 꺼진 유리 등. cracked: 3페이즈에 유리가 갈라지고 별이 깜빡임
  const lantern = (c, lx, ly, t, ph) => {
    line(c, '#4a4a70', 1.2, [[lx, ly - 4], [lx, ly + 12]]);
    poly(c, '#3a3a5e', [[lx - 8, ly + 12], [lx + 8, ly + 12], [lx + 5, ly + 8], [lx - 5, ly + 8]]);
    ell(c, lx, ly + 28, 12, 15, 'rgba(120,120,200,.13)', '#8a86c8', 1.4);
    poly(c, '#3a3a5e', [[lx - 7, ly + 43], [lx + 7, ly + 43], [lx + 5, ly + 46], [lx - 5, ly + 46]]);
    const fl = ph === 2 ? (sin(t * 9) > 0.3 ? 0.65 : 0.12) : ph === 1 ? 0.28 : 0.12;   // 꺼진 별 (3페이즈: 깜빡임)
    poly(c, `rgba(216,222,248,${fl})`, starPts(lx, ly + 28, 5.5), '#8a86c8', 1);
    glow(c, lx, ly + 28, 20, '#8a80d0', 0.15 + fl * 0.4);
    if (ph === 2) line(c, '#c8c8f0', 0.9, [[lx - 6, ly + 18], [lx - 1, ly + 26], [lx - 4, ly + 34], [lx + 2, ly + 40]]);   // 유리 금
  };

  G.NoxArtN.mix = function (c, t, ph, bg) {
    const ang = [-0.15, -1.15, -1.35][ph];
    const hx = 22 - 70 * sin(ang), hy = -194 + 70 * cos(ang);   // 앞쪽 손 위치
    // 두 구체: 1 바닥 근처에 가라앉음 / 2 양옆에 뜸 / 3 가슴 빈자리로 끌려감
    const orbs = ph === 0 ? [[-56, -26], [52, -24]] : ph === 1 ? [[-72, -120], [-48, -200]] : [[-34 + cos(t) * 14, -170 + sin(t) * 10], [30 + cos(t + 2) * 14, -150 + sin(t + 2) * 10]];
    // 3페이즈: 하체 연기 (뒤)
    if (ph === 2) for (let i = 0; i < 9; i++) { const u = (t * 0.3 + i / 9) % 1; c.globalAlpha = 0.5 * (1 - u); ell(c, sin(i * 2.1) * 30 + sin(t + i) * 6, -10 - u * 60, 16 * (1 - u * 0.5), 10, '#14142c'); c.globalAlpha = 1; }
    // 금 (몸 뒤로 뻗는 부분)
    if (ph >= 1) cracks(c, ph === 1 ? 0.6 : 1, t);
    c.save(); if (ph === 2) { c.translate(0, -18); c.beginPath(); c.rect(-200, -400, 400, 400 - 46); c.clip(); }
    G.NoxArtN.story(c, t, ph, bg);
    // 금 (몸 위)
    cracks(c, [0.25, 0.6, 1][ph], t);
    c.restore();
    // 3페이즈: 하체가 연기로 풀림 (앞)
    if (ph === 2) {
      for (let i = 0; i < 16; i++) { const u = ((t * 0.35 + i / 16) % 1), x = sin(i * 2.3) * 30 + sin(t + i) * 5, y = -24 - u * 70;
        c.globalAlpha = 0.85 * (1 - u); ell(c, x, y, 16 - u * 6, 10 - u * 3, i % 3 ? '#1a1a36' : '#26264a'); c.globalAlpha = 1; }
      for (const [x, y] of orbs) line(c, 'rgba(184,176,240,.35)', 1, [[x, y], [0, -183]]);   // 빈자리로 끌려가는 선
    }
    for (const [x, y] of orbs) deadStar(c, x, y, 14, t, [0.5, 1, 1.3][ph]);
    lantern(c, hx + 4, hy + (ph === 2 ? -10 : 6), t, ph);
  };
})();

// 쓰러질 때 등불이 켜지는 장면 (k: 0 빛이 닿음 → 1 완전히 켜짐)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const GOLD = '#ffe9a8', WARM = '#ffcf6a';
  G.NoxArtN.lit = function (c, t, k, bg, heroX) {
    // 무릎 꿇은 녹스 (몸을 아래로 눌러 그림): 3페이즈 몸, 연기는 가라앉음
    c.save(); c.translate(0, 30); c.scale(1, 0.88);
    G.NoxArtN.story(c, t, 1, bg);
    c.restore();
    const lx = 82, ly = -150;   // 내민 등불
    // 금이 따뜻한 금빛으로 바뀌어 감
    for (const [a, L] of [[-2.5, 70], [-0.7, 80], [-1.6, 55], [2.6, 60], [0.6, 66], [1.6, 90]]) {
      const p = [[0, -115]]; let x = 0, y = -115; for (let s = 0; s < 5; s++) { x += cos(a + sin(s * 3) * 0.5) * L / 5; y += sin(a + sin(s * 3) * 0.5) * L / 5 * 0.88; p.push([x, y]); }
      line(c, `rgba(255,${200 + 30 * k},${140 + 60 * (1 - k)},${0.25 + 0.5 * k})`, 1.4 + k, p);
    }
    // 가슴 빈자리에 처음으로 빛이 차오름
    poly(c, `rgba(255,233,168,${0.15 + 0.75 * k})`, starPts(0, -115, 11 + k * 2), k > 0.5 ? GOLD : '#8a86c8', 1.6);
    glow(c, 0, -115, 30 + k * 40, WARM, 0.35 + k * 0.5);
    // 두 구체도 빛을 되찾음
    for (const [x, y] of [[-46, -60], [40, -40]]) { glow(c, x, y, 26, WARM, 0.2 + k * 0.5); ell(c, x, y, 12, 12, k > 0.6 ? '#3a3020' : '#05050e', k > 0.4 ? GOLD : '#9a7ae0', 1.6); poly(c, `rgba(255,236,170,${0.2 + 0.7 * k})`, starPts(x, y, 5.5)); }
    // 주인공 → 등불로 건너오는 빛 줄기
    if (k < 1) { const hx = heroX, hy = -40, n = 10;
      for (let i = 0; i < n; i++) { const u = Math.min(1, (i / n) * 1.0 + k * 0.6), x = hx + (lx - hx) * u, y = hy + (ly + 28 - hy) * u - sin(u * PI) * 40; ell(c, x, y, 2.4, 2.4, GOLD); glow(c, x, y, 10, WARM, 0.6); } }
    // 등불
    line(c, '#6a6a90', 1.4, [[lx, ly - 4], [lx, ly + 12]]);
    poly(c, '#4a4a6e', [[lx - 8, ly + 12], [lx + 8, ly + 12], [lx + 5, ly + 8], [lx - 5, ly + 8]]);
    // 켜지는 순간: 큰 번쩍임 + 빛살 + 퍼지는 고리
    const L = k;
    glow(c, lx, ly + 28, 60 + L * 50, WARM, L * 0.75);
    glow(c, lx, ly + 28, 22, '#fff8e0', L * 0.8);
    ell(c, lx, ly + 28, 12, 15, L ? `rgba(255,236,170,${0.25 + 0.5 * L})` : 'rgba(120,120,200,.13)', L ? GOLD : '#8a86c8', 1.6);
    poly(c, L ? '#fffaf0' : 'rgba(216,222,248,.15)', starPts(lx, ly + 28, 6 + L * 2), L ? WARM : '#8a86c8', 1.2);
    poly(c, '#4a4a6e', [[lx - 7, ly + 43], [lx + 7, ly + 43], [lx + 5, ly + 46], [lx - 5, ly + 46]]);
    // 두건 안이 등불 빛에 처음으로 비침
    glow(c, 6, -184, 26, WARM, L * 0.6);
  };
})();


// 게임 속 녹스: 페이즈에 따라 모습이 바뀐다. 기준 키 약 250 → m.h에 맞춤. 광폭화 땐 붉은 기운
G.MonArtN = G.MonArtN || {}; G.MonArtN.nox = { die: 'none', sh: 0, draw(ctx, m, t, s) {
  if (m.dead) return;   // 쓰러진 뒤에는 월드의 등불 장면(noxEnd)이 대신 그린다
  const ph = m.boss ? Math.min(2, m.boss.phase) : 0, k = m.h / 240;
  if (m.boss && m.boss.enraged) { const g = ctx.createRadialGradient(0, -m.h * 0.55, 0, 0, -m.h * 0.55, m.w * 1.4); g.addColorStop(0, 'rgba(255,40,70,.35)'); g.addColorStop(1, 'rgba(255,40,70,0)'); ctx.fillStyle = g; ctx.fillRect(-m.w * 1.5, -m.h * 1.6, m.w * 3, m.h * 1.8); }
  ctx.scale(k, k);
  G.NoxArtN.mix(ctx, t, ph, '#141432');
} };

})();