(function(){

// 1.7.7 공허의 군주 녹스 · 이야기에서 나온 디자인 (docs/NOX_CHARACTER.md, docs/BUILD_1.7.7_PLAN.md)
//  "별들 사이의 밤": 검은 남색 몸 · 가슴의 별 모양 빈자리(떼어 간 공허의 별조각) · 두 꺼진 별 구체 · 퍼지는 금 · 꺼진 등불
//  G.NoxArtO.story(c,t,ph,bg)  기본 몸 (페이즈 0 체념 / 1 서러움 / 2 절망)
//  G.NoxArtO.mix(c,t,ph,bg)    몸 + 구체 + 금 + 등불 (게임·영상에서 쓰는 최종 모습)
//  G.NoxArtO.lit(c,t,k,bg,hx)  쓰러질 때 등불이 켜지는 장면 (k 0→1)
G.NoxArtO = {};
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
  G.NoxArtO.story = function (c, t, ph, bg) {
    const O = window.NOXOPT || {};
    const NIGHT = '#0a0a16', CLOAK = '#12122a', CLOAK2 = '#1c1c3a', LINE = '#2c2c4e', PALE = '#d8def8';
    const bow = [0.22, 0.02, -0.06][ph];   // 고개 숙임
    const fade = ph === 2 ? 1 : 0;
    // 그림자 (짧고 좁게)
    ell(c, 0, 0, 42, 6, 'rgba(0,0,0,.45)');
    // ---- 망토: 곧게 떨어지는 긴 사다리꼴 (아래로 크게 퍼지지 않음) ----
    const hem = (x0, x1, y) => { const n = 9, pts = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; pts.push([x, y - (i % 2 ? 6 + fade * 18 : 0) + (fade ? sin(t * 2 + i) * 4 : 0)]); } return pts; };
    const cloak = [[-26, -196], [26, -196], [34, -2], ...hem(34, -34, 0).slice(1, -1), [-34, -2]];
    const sway = sin(t * 1.1) * 2.5;
    const cloakPath = O[7] ? () => { c.beginPath(); c.moveTo(-20, -200); c.quadraticCurveTo(-30, -198, -31, -186);
      c.bezierCurveTo(-32, -130, -36 + sway * 0.4, -60, -40 + sway, -2);
      const n = 8; for (let i = 1; i <= n; i++) { const x0 = -40 + (i - 0.5) * 80 / n + sway * (1 - i / n), x1 = -40 + i * 80 / n + sway * (1 - i / n) * 0.6;
        c.quadraticCurveTo(x0, -7 - fade * 14 + sin(t * 2 + i) * (1.5 + fade * 3), x1, -1 + sin(t * 2.3 + i) * 1.2); }
      c.bezierCurveTo(36 + sway * 0.3, -60, 32, -130, 31, -186); c.quadraticCurveTo(30, -198, 20, -200); c.closePath(); }
      : () => { c.beginPath(); cloak.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
    cloakPath(); c.fillStyle = lin(c, 0, -196, 0, 0, CLOAK2, NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.4; c.stroke();
    // 망토 안의 꺼져 가는 별들 (빛나지 못하고 희미)
    c.save(); cloakPath(); c.clip();
    for (let i = 0; i < 18 + ph * 10; i++) { const x = ((i * 53) % 60) - 30, y = -180 + ((i * 97) % 170), a = (0.15 + 0.25 * ((sin(t * 1.3 + i) + 1) / 2)) * (ph === 2 ? 1.6 : 1);
      ell(c, x, y, 1.1, 1.1, `rgba(220,226,255,${Math.min(0.75, a)})`); }
    if (O[1]) {   // 은하수 띠 + 별자리 선 + 천천히 흐르는 별
      c.save(); c.translate(0, -100); c.rotate(-0.5); const mg = c.createLinearGradient(0, -14, 0, 14); mg.addColorStop(0, 'rgba(150,140,230,0)'); mg.addColorStop(0.5, 'rgba(170,160,240,.28)'); mg.addColorStop(1, 'rgba(150,140,230,0)'); c.fillStyle = mg; c.fillRect(-90, -14, 180, 28);
      for (let i = 0; i < 30; i++) ell(c, ((i * 37) % 160) - 80, ((i * 53) % 22) - 11, 0.7, 0.7, `rgba(235,235,255,${0.3 + 0.3 * sin(t + i)})`); c.restore();
      for (const C of [[[-18, -170], [-8, -150], [-14, -128], [-2, -116]], [[10, -80], [20, -66], [14, -48], [24, -36]], [[-22, -60], [-12, -44], [-20, -28]]]) {
        c.strokeStyle = 'rgba(190,196,255,.35)'; c.lineWidth = 0.8; c.beginPath(); C.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
        C.forEach(([x, y], i) => { ell(c, x, y, 1.6, 1.6, `rgba(240,242,255,${0.6 + 0.3 * sin(t * 2 + i + x)})`); }); }
      for (let i = 0; i < 6; i++) { const u = (t * 0.06 + i / 6) % 1; ell(c, -30 + u * 60, -190 + i * 30, 1.3, 1.3, `rgba(255,255,255,${0.7 * sin(u * PI)})`); }
    }
    if (O[7]) { c.strokeStyle = 'rgba(4,4,12,.45)'; c.lineWidth = 3; for (const x of [-18, -4, 12, 24]) { c.beginPath(); c.moveTo(x * 0.6, -180); c.quadraticCurveTo(x * 0.9 + sway * 0.3, -100, x * 1.25 + sway * 0.6, 0); c.stroke(); } }
    c.restore();
    // 절망: 가장자리가 밤하늘로 풀려 흩어짐 (아래·옆으로 떨어져 나가는 조각)
    if (ph === 2) for (let i = 0; i < 22; i++) { const u = ((t * 0.25 + i / 22) % 1), x = (i % 2 ? 1 : -1) * (30 + u * 40) + sin(i) * 6, y = -190 + (i * 37 % 190) + u * 10;
      c.globalAlpha = 1 - u; poly(c, CLOAK2, [[x, y], [x + 5, y + 3], [x + 2, y + 8], [x - 3, y + 4]]); if (i % 3 === 0) ell(c, x + 2, y + 3, 1, 1, PALE); c.globalAlpha = 1; }
    // ---- 상체 ----
    if (O[7]) { c.beginPath(); c.moveTo(-12, -204); c.quadraticCurveTo(-27, -203, -27, -190); c.quadraticCurveTo(-24, -150, -16, -126); c.quadraticCurveTo(0, -120, 16, -126); c.quadraticCurveTo(24, -150, 27, -190); c.quadraticCurveTo(27, -203, 12, -204); c.closePath();
      c.fillStyle = lin(c, 0, -200, 0, -120, '#1a1a36', NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.2; c.stroke(); }
    else poly(c, lin(c, 0, -200, 0, -120, '#1a1a36', NIGHT), [[-24, -200], [24, -200], [18, -130], [-18, -130]], LINE, 1.2);
    // ---- 가슴의 별 모양 빈자리 (뒤 배경이 그대로 비침) ----
    const sr = [11, 12, 14][ph], cy = -165;
    poly(c, bg, starPts(0, cy, sr));
    // 빈자리 안으로 빨려 드는 희미한 별빛 (페이즈 2부터)
    if (ph >= 1) for (let i = 0; i < 5; i++) { const u = (t * 0.4 + i / 5) % 1, a = i * 1.26, r = sr * (3.2 - u * 2.6); ell(c, cos(a) * r, cy + sin(a) * r * 0.8, 1, 1, `rgba(220,226,255,${u * 0.8})`); }
    poly(c, null, starPts(0, cy, sr), ph === 2 ? PALE : '#6a6e98', ph === 2 ? 1.6 : 1.2);
    // ---- 봉인의 사슬 (체념) ----
    if (ph === 0) { chain(c, -24, -192, 24, -142); chain(c, 24, -192, -24, -142); if (O[2]) { chain(c, -34, -110, 34, -70); chain(c, 34, -110, -34, -70); chain(c, -36, -40, 36, -40); } }
    // ---- 팔: 뒤쪽 팔은 늘어뜨림, 앞쪽 팔은 페이즈에 따라 뻗음 ----
    const arm = (sg, ang, reach) => { c.save(); c.translate(sg * 22, -194); c.rotate(ang);
      if (O[7]) { c.beginPath(); c.moveTo(-7, -2); c.quadraticCurveTo(-9, 30, -6, 50); c.quadraticCurveTo(-11, 60, -9, 66); c.quadraticCurveTo(0, 70, 9, 66); c.quadraticCurveTo(10, 58, 6, 50); c.quadraticCurveTo(8, 28, 7, -2); c.closePath();
        c.fillStyle = lin(c, 0, 0, 0, 70, CLOAK2, NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.1; c.stroke(); }
      else poly(c, lin(c, 0, 0, 0, 70, CLOAK2, NIGHT), [[-6, 0], [6, 0], [8, 64], [-8, 64]], LINE, 1.1);
      // 손: 가늘고 긴 손가락
      ell(c, 0, 70, 4.5, 5.5, '#2a2a46');
      for (const fx of [-3.5, -1, 1.5, 4]) { c.strokeStyle = '#3a3a5a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(fx, 73); c.lineTo(fx * (reach ? 1.6 : 1.2), 82 + (reach ? 2 : 0)); c.stroke(); }
      if (ph === 0) chain(c, -9, 56, 9, 56);
      c.restore(); };
    if (O[5]) { arm(-1, -0.32, false); arm(1, 0.25, false); }
    else { arm(-1, 0.12, false);
    arm(1, [-0.15, -1.15, -1.35][ph] + sin(t * 1.2) * 0.03, ph >= 1); }
    // ---- 머리: 깊은 두건, 얼굴은 어둠, 희미한 두 눈 ----
    c.save(); c.translate(0, -214); c.rotate(bow + (O[2] && ph === 0 ? 0.14 : 0));
    if (O[7]) { c.beginPath(); c.moveTo(-22, 20); c.quadraticCurveTo(-20, 4, -18, -6); c.quadraticCurveTo(-16, -24, 0, -27); c.quadraticCurveTo(16, -24, 18, -6); c.quadraticCurveTo(20, 4, 22, 20); c.quadraticCurveTo(0, 14, -22, 20); c.closePath();
      c.fillStyle = lin(c, 0, -26, 0, 18, CLOAK2, NIGHT); c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.3; c.stroke();
      c.beginPath(); c.moveTo(-10, 12); c.quadraticCurveTo(-13, -2, -9, -8); c.quadraticCurveTo(0, -14, 9, -8); c.quadraticCurveTo(13, -2, 10, 12); c.quadraticCurveTo(0, 17, -10, 12); c.closePath(); c.fillStyle = '#030308'; c.fill(); }
    else { poly(c, lin(c, 0, -26, 0, 18, CLOAK2, NIGHT), [[-16, 16], [-18, -4], [-10, -22], [0, -27], [10, -22], [18, -4], [16, 16]], LINE, 1.3);
    poly(c, '#030308', [[-10, 12], [-11, -4], [0, -12], [11, -4], [10, 12], [0, 16]]); }
    const ea = [0.45, 0.75, 0.95][ph];
    for (const sg of [-1, 1]) ell(c, sg * 4.5 + 1, 0, 2.2, 1.1, `rgba(216,222,248,${ea})`);
    if (O[4]) for (const sg of [-1, 1]) { const x = sg * 4.5 + 1; c.strokeStyle = 'rgba(200,210,255,.55)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, 1.4); c.quadraticCurveTo(x + sg * 0.6, 6, x, 11); c.stroke();
      for (let i = 0; i < 2; i++) { const u = (t * 0.5 + i * 0.5 + (sg > 0 ? 0.25 : 0)) % 1, y = 2 + u * 24; c.globalAlpha = 1 - u; poly(c, '#eef0ff', starPts(x, y, 1.8 - u * 0.6)); c.globalAlpha = 1; } }
    // 왕관: 장식 없는 가는 검은 고리 하나 (머리 위에 살짝 떠 있음)
    if (O[6]) { for (let i = 0; i < 5; i++) { const a = -PI * 0.85 + i * PI * 0.175, r = 16, x = cos(a) * r, y = -24 + sin(a) * 8 - (i === 2 ? 4 : 0), crack = i === 3;
        c.save(); c.translate(x, y + (crack ? 3 : 0)); c.rotate(crack ? 0.4 : (a + PI / 2) * 0.5); poly(c, crack ? '#2a2a46' : '#3a3a5e', starPts(0, 0, i === 2 ? 6 : 4.4), '#8a86c8', 0.8);
        if (crack) { c.strokeStyle = '#c8c8f0'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-2, -3); c.lineTo(1, 0); c.lineTo(-1, 3); c.stroke(); } c.restore(); }
      c.strokeStyle = '#3a3a5e'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, -22, 16, 4, 0, PI * 1.05, PI * 1.95); c.stroke(); }
    else { c.strokeStyle = ph === 2 ? 'rgba(216,222,248,.55)' : '#3a3a5e'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, -32 - ph * 2, 15, 4, 0, 0, PI * 2); c.stroke(); }
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
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
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

  G.NoxArtO.mix = function (c, t, ph, bg) {
    const O = window.NOXOPT || {};
    const ang = [-0.15, -1.15, -1.35][ph];
    const hx = 22 - 70 * sin(ang), hy = -194 + 70 * cos(ang);   // 앞쪽 손 위치
    // 두 구체: 1 바닥 근처에 가라앉음 / 2 양옆에 뜸 / 3 가슴 빈자리로 끌려감
    if (O[3]) {   // 등 뒤 일식 (검은 해 + 빛 고리) · 날개처럼 펼친 망토 그림자
      const ex = 0, ey = -205; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(ex, ey, 40, ex, ey, 96); g.addColorStop(0, 'rgba(200,190,255,.55)'); g.addColorStop(0.3, 'rgba(140,110,230,.25)'); g.addColorStop(1, 'rgba(60,40,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, 96, 0, 7); c.fill(); c.restore();
      ell(c, ex, ey, 44, 44, '#04040c', 'rgba(230,226,255,.85)', 2);
      for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.globalAlpha = 0.75; c.beginPath(); c.moveTo(18, -196); c.quadraticCurveTo(70, -250, 120, -236); c.quadraticCurveTo(104, -214, 112, -190); c.quadraticCurveTo(90, -184, 96, -160); c.quadraticCurveTo(70, -160, 70, -130); c.quadraticCurveTo(46, -136, 30, -120); c.closePath();
        c.fillStyle = lin(c, 20, -230, 110, -140, '#1c1c3a', 'rgba(10,10,22,.3)'); c.fill(); c.strokeStyle = '#3a3a62'; c.lineWidth = 1; c.stroke(); c.globalAlpha = 1; c.restore(); }
    }
    if (O[2] && ph === 2) { c.save(); c.translate(0, 0); c.scale(1.1, 1.1); }
    if (O[2] && ph === 2) for (let i = 0; i < 14; i++) { const u = (t * 0.2 + i / 14) % 1; c.globalAlpha = 0.45 * (1 - u); ell(c, sin(i * 1.7) * (60 + u * 70), -20 - u * 90 - (i % 3) * 20, 22 * (1 - u * 0.3), 12, '#14142c'); c.globalAlpha = 1; }   // 밤하늘로 번지는 망토
    const orbs = ph === 0 ? [[-56, -26], [52, -24]] : ph === 1 ? (O[2] ? [[cos(t * 0.8) * 62, -150 + sin(t * 0.8) * 26], [cos(t * 0.8 + PI) * 62, -150 + sin(t * 0.8 + PI) * 26]] : [[-72, -120], [-48, -200]]) : [[-34 + cos(t) * 14, -170 + sin(t) * 10], [30 + cos(t + 2) * 14, -150 + sin(t + 2) * 10]];
    // 3페이즈: 하체 연기 (뒤)
    if (ph === 2) for (let i = 0; i < 9; i++) { const u = (t * 0.3 + i / 9) % 1; c.globalAlpha = 0.5 * (1 - u); ell(c, sin(i * 2.1) * 30 + sin(t + i) * 6, -10 - u * 60, 16 * (1 - u * 0.5), 10, '#14142c'); c.globalAlpha = 1; }
    // 금 (몸 뒤로 뻗는 부분)
    if (ph >= 1) cracks(c, ph === 1 ? 0.6 : 1, t);
    c.save(); if (ph === 2) { c.translate(0, -18); c.beginPath(); c.rect(-200, -400, 400, 400 - 46); c.clip(); }
    G.NoxArtO.story(c, t, ph, bg);
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
    if (O[2] && ph === 1) for (let i = 0; i < 4; i++) { const a = t * 0.5 + i * 1.6, x = cos(a) * 56, y = -110 + sin(a * 1.3) * 60; c.save(); c.translate(x, y); c.rotate(a);
      for (let k = 0; k < 3; k++) { c.strokeStyle = '#6a6e98'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(k * 6 - 6, 0, 3.4, 2.2, 0, 0, 7); c.stroke(); } c.restore(); }   // 끊어져 떠다니는 사슬
    if (O[5]) lantern(c, 2, -130, t, ph); else lantern(c, hx + 4, hy + (ph === 2 ? -10 : 6), t, ph);
    if (O[2] && ph === 2) c.restore();
  };
})();


})();