(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N2 = G.MonNew2 = {};
  const legs = (ctx, c, n, y, span, step, lw) => { for (let i = 0; i < n; i++) for (const sg of [-1, 1]) { const x = sg * 18, len = sg * (span + i * 8), ph = step + i * 1.7 + (sg > 0 ? PI : 0); line(ctx, c, lw, [[x, y], [x + len * 0.55, y - abs(len) * 0.45 + sin(ph) * 3], [x + len, sin(ph) * 1.5]]); } };

  // 쉘로크 2: 보물 상자 소라게 — 낡은 보물 상자를 껍데기로 등에 지고, 동전이 흘러넘침 · 해적 두건
  N2.shellock = (ctx, m, t, s) => {
    const k = m.w / 170; ctx.scale(k, k);
    const guard = m.boss && m.boss.guarding, raise = m.boss ? m.boss.raise : 0, step = s.walk ? t * 9 : t;
    legs(ctx, m.d.color2, 3, -20, 40, step, 6);
    ctx.save(); ctx.translate(-30, -70); ctx.rotate(-0.08);
    rrect(ctx, -58, -30, 116, 66, 8, vg(ctx, -30, 36, '#a0703a', '#5a3a1a'), '#2a1a0a', 3);   // 상자 몸
    for (const x of [-30, 0, 30]) line(ctx, 'rgba(40,20,10,.5)', 2, [[x, -26], [x, 32]]);
    const lid = guard ? 0 : 0.18 + abs(sin(t * 1.5)) * 0.08;
    ctx.save(); ctx.translate(-58, -30); ctx.rotate(-lid);   // 뚜껑
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(58, -46, 116, 0); ctx.closePath(); ctx.fillStyle = vg(ctx, -40, 0, '#b8803a', '#6a4a1a'); ctx.fill(); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 3; ctx.stroke();
    line(ctx, '#e8c050', 5, [[20, -26], [20, 0]]); line(ctx, '#e8c050', 5, [[96, -26], [96, 0]]); ctx.restore();
    if (!guard) { glow(ctx, 0, -34, 40, '#ffe080', 0.6); for (let i = 0; i < 7; i++) ell(ctx, -40 + i * 13, -32 - (i % 2) * 4, 6, 3, '#ffd040', '#a07a10', 1); }
    for (const x of [-38, 38]) rrect(ctx, x - 4, -30, 8, 66, 2, '#e8c050', '#8a6a10', 1.5);   // 금 띠
    rrect(ctx, -9, -12, 18, 16, 3, '#e8c050', '#8a6a10', 1.5); ell(ctx, 0, -5, 3, 3, '#3a2a10');   // 자물쇠
    for (const [x, y] of [[-48, 30], [46, 26]]) { line(ctx, '#3a8a5a', 4, [[x, y], [x - 6, y + 16]]); }   // 미역
    ctx.restore();
    if (guard) { for (let i = 0; i < 3; i++) ell(ctx, 30 + i * 12, -60 - ((t * 40 + i * 20) % 60), 4, 4, 'rgba(200,230,255,.6)'); return; }
    ell(ctx, 22, -32, 40, 24, vg(ctx, -56, -8, shade(m.d.color, 0.2), shade(m.d.color, -0.25)), m.d.color2, 3);
    ell(ctx, 58, -22, 12, 9, m.d.color, m.d.color2, 2.5);
    ctx.save(); ctx.translate(46, -48); ctx.rotate(-0.4 - raise * 1.3 + s.atk * 0.3); rrect(ctx, 0, -8, 32, 16, 8, m.d.color, m.d.color2); ctx.translate(40, 0);
    ell(ctx, 0, 0, 23, 17, vg(ctx, -17, 17, shade(m.d.color, 0.25), shade(m.d.color, -0.2)), m.d.color2, 3);
    const op = raise > 0 ? 0.6 : abs(sin(t * 2)) * 0.25; ctx.save(); ctx.rotate(-op); ctx.fillStyle = shade(m.d.color, 0.15); ctx.beginPath(); ctx.ellipse(19, -8, 17, 8, -0.3, 0, PI * 2); ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.stroke(); ctx.restore();
    ell(ctx, 6, -6, 6, 6, '#f4f0ff', '#a0a0c0', 1.5); ctx.restore();   // 집게 속 진주
    // 해적 두건 + 눈
    line(ctx, m.d.color2, 4, [[26, -54], [24, -76]]); line(ctx, m.d.color2, 4, [[42, -52], [44, -74]]);
    ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.ellipse(34, -80, 22, 9, 0, PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(12, -80); ctx.lineTo(2, -86 + sin(t * 6) * 2); ctx.lineTo(4, -76); ctx.fill();
    for (const x of [26, 42]) ell(ctx, 34 + (x - 34) * 0.5 + (x - 34) * 0.5, -80, 1.6, 1.6, '#fff');
    for (const x of [24, 44]) { ell(ctx, x, -78, 7.5, 7.5, '#fff', m.d.color2, 2); ell(ctx, x + 2, -77, 3.6, 4.6, '#200'); ell(ctx, x + 3, -79, 1.3, 1.3, '#fff'); }
    line(ctx, '#300', 3, [[16, -88], [30, -84]]); line(ctx, '#300', 3, [[38, -84], [52, -88]]);
  };
  // 모르웬 2: 썩은 고목 마녀 — 속이 빈 큰 그루터기 몸 (나무에 새겨진 빛나는 얼굴) · 덩굴 팔 · 버섯 왕관 · 보랏빛 수액
  N2.morwen = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk, ec = ph ? '#ff40c0' : '#d070ff';
    for (let i = 0; i < 7; i++) { const x = -w * 0.9 + i * w * 0.3; line(ctx, '#3a2a18', 7 - abs(i - 3), [[x * 0.6, -h * 0.12], [x * 1.1, -h * 0.03], [x * 1.4 + sin(t + i) * 3, 0]]); }
    ctx.beginPath(); ctx.moveTo(-w * 0.75, 0); ctx.quadraticCurveTo(-w * 0.85, -h * 0.5, -w * 0.55, -h * 0.75); ctx.lineTo(-w * 0.3, -h * 0.7); ctx.lineTo(-w * 0.1, -h * 0.82); ctx.lineTo(w * 0.15, -h * 0.72); ctx.lineTo(w * 0.4, -h * 0.8); ctx.quadraticCurveTo(w * 0.85, -h * 0.5, w * 0.75, 0); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.8, 0, '#6a5a3a', '#2a1e10'); ctx.fill(); ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 2.4; ctx.stroke();
    for (let i = 0; i < 5; i++) line(ctx, 'rgba(20,10,0,.45)', 1.4, [[-w * 0.5 + i * w * 0.25, -h * 0.7], [-w * 0.55 + i * w * 0.27, -h * 0.05]]);
    // 새겨진 얼굴 (빛나는 눈 구멍 · 입)
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 16;
    for (const sg of [-1, 1]) poly(ctx, ec, [[sg * w * 0.12, -h * 0.55], [sg * w * 0.35, -h * 0.6], [sg * w * 0.3, -h * 0.5]]);
    ctx.beginPath(); ctx.ellipse(0, -h * 0.36, w * 0.22, h * 0.07 + cast * 4, 0, 0, PI * 2); ctx.fillStyle = '#1a0a1a'; ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 4; i++) { const y = -h * 0.28 + ((t * 18 + i * 14) % (h * 0.25)); ell(ctx, -w * 0.12 + i * w * 0.08, y, 1.8, 3, ec); }   // 흐르는 수액
    // 덩굴 팔
    for (const sg of [-1, 1]) { const up = cast * 1.2 + sin(t * 2 + sg) * 0.12; ctx.save(); ctx.translate(sg * w * 0.62, -h * 0.55); ctx.rotate(sg * (0.4 - up));
      ctx.strokeStyle = '#4a3a22'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sg * 20, 10, sg * 30, 30, sg * 18, 52); ctx.stroke();
      ctx.strokeStyle = '#4a7a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sg * 24, 6, sg * 22, 40, sg * 14, 56); ctx.stroke();
      for (const yy of [16, 34]) ell(ctx, sg * 22, yy, 4, 2.4, '#6a9a4a'); if (cast > 0) glow(ctx, sg * 18, 52, 22, '#c060ff', 0.8); ctx.restore(); }
    // 버섯 왕관
    for (const [x, y, r, c] of [[-w * 0.4, -h * 0.82, 10, '#a04ad0'], [-w * 0.05, -h * 0.9, 13, '#c060e0'], [w * 0.32, -h * 0.85, 9, '#8a3ab0']]) {
      rrect(ctx, x - 2.4, y, 4.8, 12, 2, '#e8dcc0'); ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, 0, PI, 0); ctx.fillStyle = vg(ctx, y - r, y, shade(c, 0.2), c); ctx.fill(); ctx.strokeStyle = shade(c, -0.5); ctx.lineWidth = 1; ctx.stroke();
      for (let i = 0; i < 3; i++) ell(ctx, x - r * 0.5 + i * r * 0.5, y - r * 0.4, 1.6, 1.6, '#f4e0ff'); glow(ctx, x, y - 3, r * 1.4, c, 0.25); }
  };
  // 그라운더 2: 광산 굴착 전차 — 낮고 넓은 무한궤도 · 앞의 거대한 회전 드릴 · 헤드램프 눈 운전석 · 기중기 집게
  N2.grounder = (c, m, t, s) => {
    c.scale(m.w / 130, m.h / 190);
    const raise = m.boss ? m.boss.raise : 0, hot = !!m.hot, OUT = '#1c222c', ST = '#8a94a4', STD = '#4a5464', Y = '#f2c230';
    c.translate(-14, 0);
    // 궤도
    rrect(c, -60, -34, 130, 34, 17, vg(c, -34, 0, '#3a3a40', '#1a1a20'), OUT, 2.4);
    for (let i = 0; i < 6; i++) { const x = -44 + i * 20; ell(c, x, -17, 10, 10, vg(c, -27, -7, ST, STD), OUT, 1.6); ell(c, x, -17, 3, 3, Y); }
    for (let i = 0; i < 14; i++) { const x = -58 + ((i * 9.6 + t * 30) % 128); c.fillStyle = '#5a5a60'; c.fillRect(x, -36, 5, 4); }
    // 차체
    poly(c, vg(c, -96, -34, '#f2c230', '#b88a10'), [[-56, -34], [62, -34], [70, -70], [40, -96], [-50, -96], [-60, -70]], OUT, 2.4);
    c.save(); c.beginPath(); c.rect(-58, -48, 126, 10); c.clip(); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#1a1a1e' : Y; c.fillRect(-60 + i * 9, -48, 9, 10); } c.restore();
    for (const x of [-46, -20, 6, 32]) ell(c, x, -88, 2.2, 2.2, '#8a6a10', OUT, 0.6);
    // 운전석 (헤드램프 눈)
    rrect(c, -30, -150, 56, 56, 10, vg(c, -150, -94, '#d0a830', '#8a6a10'), OUT, 2.4);
    rrect(c, -20, -142, 36, 22, 5, 'rgba(160,230,255,.4)', '#3a4a5a', 2);
    for (const x of [-8, 10]) { glow(c, x, -108, 20, hot ? '#ff6020' : '#fff4a0', 0.8); ell(c, x, -108, 7, 7, hot ? '#ffb070' : '#fffbe0', OUT, 1.6); }
    rrect(c, -20, -100, 36, 4, 2, '#3a3a40');   // 입 그릴
    rrect(c, -36, -170, 10, 26, 2, vg(c, -170, -144, '#6a6a70', '#3a3a40'), OUT, 1.6); if (hot) glow(c, -31, -174, 24, '#ff6020', 0.8);
    // 앞 드릴
    c.save(); c.translate(66, -62); c.rotate(-raise * 0.5 + s.atk * 0.2);
    rrect(c, -8, -18, 22, 36, 5, vg(c, -18, 18, ST, STD), OUT, 2);
    c.translate(14, 0); poly(c, vg(c, -24, 24, '#e8ecf4', '#7a8698'), [[0, -24], [60, 0], [0, 24]], OUT, 2.4);
    for (let i = 0; i < 5; i++) { const x = 4 + i * 11 + ((t * 50) % 11); line(c, '#4a5464', 2.4, [[x, -22 + x * 0.36], [x + 7, 22 - x * 0.36]]); } c.restore();
    // 기중기 집게 (뒤)
    c.save(); c.translate(-46, -96); c.rotate(-0.6 + sin(t * 1.5) * 0.08); rrect(c, -4, -60, 8, 60, 2, vg(c, -60, 0, Y, '#b88a10'), OUT, 1.6);
    c.translate(0, -60); c.rotate(1.2); line(c, '#3a3a40', 1.6, [[0, 0], [0, 26]]); for (const sg of [-1, 1]) poly(c, ST, [[0, 26], [sg * 10, 32], [sg * 6, 42], [sg * 2, 34]], OUT, 1.2); c.restore();
  };
  // 아우렐리온 2: 별빛 기사룡 — 똑바로 선 왕다운 용 · 양쪽으로 펼친 큰 깃털 날개 · 금 가슴 갑옷 · 별 후광 · 긴 꼬리
  N2.aurelion = (ctx, m, t, s) => {
    const raise = m.boss ? m.boss.raise : 0; ctx.translate(0, -(m.soarY || 0)); ell(ctx, 0, 0, m.w * 0.42, 9, 'rgba(0,0,0,.25)');
    const k = m.h / 200; ctx.scale(k, k);
    const W = '#f4f6ff', LAV = '#d0d4f8', PERI = '#8e9cf6', GOLD = '#f5c86a', OUT = '#5a5aa0', fl = sin(t * 2) * 0.08 + raise * 0.3;
    // 날개 (양쪽, 깃털 부채)
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 8, -122); ctx.scale(sg, 1); ctx.rotate(-0.3 - fl);
      for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(-0.55 + i * 0.16); ell(ctx, 70 - i * 2, 0, 62 - i * 3, 11, i % 2 ? W : LAV, OUT, 1.1); ctx.restore(); }
      line(ctx, GOLD, 4, [[0, 0], [60, -40], [118, -36]]); ctx.restore(); }
    // 꼬리
    ctx.strokeStyle = LAV; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18, -30); ctx.bezierCurveTo(-60, -20, -90, -10, -110 + sin(t * 2) * 6, -40); ctx.stroke();
    ctx.strokeStyle = W; ctx.lineWidth = 10; ctx.stroke(); for (let i = 0; i < 4; i++) poly(ctx, GOLD, [[-50 - i * 15, -26 - i * 2], [-56 - i * 15, -40 - i * 2], [-60 - i * 15, -26 - i * 2]]);
    // 다리
    for (const sg of [-1, 1]) { rrect(ctx, sg * 16 - 9, -52, 18, 50, 8, vg(ctx, -52, 0, W, LAV), OUT, 1.6); for (let j = 0; j < 3; j++) poly(ctx, GOLD, [[sg * 16 - 8 + j * 6, -4], [sg * 16 - 6 + j * 6, 4], [sg * 16 - 4 + j * 6, -4]]); }
    // 몸 + 금 가슴 갑옷
    ell(ctx, 0, -90, 36, 52, vg(ctx, -142, -38, W, LAV), OUT, 2);
    poly(ctx, vg(ctx, -128, -64, '#fff4c0', GOLD), [[-20, -126], [20, -126], [24, -96], [0, -66], [-24, -96]], '#a07a20', 1.6);
    glow(ctx, 0, -104, 16, '#fff0a0', 0.8); poly(ctx, '#fffbe0', [[0, -114], [6, -104], [0, -94], [-6, -104]]);
    // 목 + 머리
    ctx.save(); ctx.translate(14, -138); ctx.rotate(0.1 + s.atk * 0.15);
    rrect(ctx, -12, -36, 24, 44, 12, vg(ctx, -36, 8, W, LAV), OUT, 1.6); ctx.translate(4, -44);
    ctx.beginPath(); ctx.moveTo(-18, -8); ctx.quadraticCurveTo(10, -20, 40, -4); ctx.quadraticCurveTo(44, 8, 30, 10); ctx.quadraticCurveTo(0, 14, -18, 8); ctx.closePath(); ctx.fillStyle = vg(ctx, -20, 14, W, LAV); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
    for (const [x, a, l] of [[-10, -1.0, 34], [0, -0.75, 28]]) { ctx.save(); ctx.translate(x, -10); ctx.rotate(a); poly(ctx, vg(ctx, -l, 0, '#fff4c0', GOLD), [[-3, 0], [3, 0], [0, -l]], '#a07a20', 1); ctx.restore(); }
    for (let i = 0; i < 4; i++) ell(ctx, -18 - i * 4, -2 + i * 6, 6, 10, i % 2 ? W : '#e0e4ff', OUT, 0.8);
    glow(ctx, 16, -4, 12, '#ffe680', 0.6); ell(ctx, 16, -4, 4.6, 3.6, '#ffe680', '#8a6a10', 1); ell(ctx, 17, -4, 1.4, 2.8, '#3a2a10'); line(ctx, OUT, 1.4, [[14, 6], [40, 2]]);
    ctx.restore();
    // 별 후광
    ctx.save(); ctx.translate(20, -196); ctx.strokeStyle = 'rgba(255,240,180,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 30, 9, 0, 0, PI * 2); ctx.stroke();
    for (let i = 0; i < 5; i++) { const a = t + i * PI * 0.4; ell(ctx, cos(a) * 30, sin(a) * 9, 2.4, 2.4, '#fff4c0'); } ctx.restore();
  };
  // 엘드리크 2: 떠 있는 장막의 사제 — 발 없이 떠오른 여러 겹 너덜한 예복 · 머리 전체를 덮은 베일(속에 빛나는 눈 셋) · 떠다니는 사슬 금서 · 촛불 고리
  N2.eldrick = (ctx, m, t, s) => {
    ctx.scale(1.45, 1.45);
    const h = m.h / 1.12, casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff4080' : '#c060ff', fl = sin(t * 2) * 4;
    ctx.translate(0, -10 + fl); ell(ctx, 0, 10 - fl, 22, 5, 'rgba(0,0,0,.25)');
    for (let i = 0; i < 6; i++) { const a = t * 0.8 + i * PI / 3; ctx.save(); ctx.translate(cos(a) * 34, -h * 0.55 + sin(a) * 10); rrect(ctx, -1.6, -6, 3.2, 8, 1, '#f0e8d0'); glow(ctx, 0, -8, 7, '#ffb060', 0.8); ell(ctx, 0, -8, 1.4, 2.4, '#ffe080'); ctx.restore(); }   // 촛불 고리
    for (let k = 2; k >= 0; k--) {   // 너덜한 예복 세 겹
      const ww = 26 - k * 5, c0 = ['#5a2a8a', '#3a1a5a', '#2a0a3a'][k];
      ctx.beginPath(); ctx.moveTo(-10, -h * 0.7); ctx.quadraticCurveTo(-ww * 0.7, -h * 0.35, -ww, -k * 4);
      for (let i = 0; i < 6; i++) ctx.lineTo(-ww + (i + 0.5) * ww / 3, -k * 4 + (i % 2 ? -8 : 2) + sin(t * 3 + i + k) * 2);
      ctx.lineTo(ww, -k * 4); ctx.quadraticCurveTo(ww * 0.7, -h * 0.35, 10, -h * 0.7); ctx.closePath(); ctx.fillStyle = vg(ctx, -h * 0.7, 0, c0, shade(c0, -0.5)); ctx.fill(); ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 0.8; ctx.stroke(); }
    line(ctx, '#c8a040', 1.6, [[-14, -h * 0.66], [14, -h * 0.66]]);
    // 베일 머리
    ctx.beginPath(); ctx.moveTo(-12, -h * 0.66); ctx.quadraticCurveTo(-14, -h * 0.96, 0, -h * 1.02); ctx.quadraticCurveTo(14, -h * 0.96, 12, -h * 0.66); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 1.02, -h * 0.66, '#e8e4f4', '#9a90b8'); ctx.fill(); ctx.strokeStyle = '#5a5070'; ctx.lineWidth = 1; ctx.stroke();
    for (let i = 0; i < 4; i++) line(ctx, 'rgba(90,80,112,.4)', 0.7, [[-8 + i * 5, -h * 0.95], [-10 + i * 6, -h * 0.68]]);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 10; for (const [x, y] of [[-3, -h * 0.84], [5, -h * 0.84], [1, -h * 0.9]]) ell(ctx, x, y, 2, 1.3, ec); ctx.restore();
    // 떠다니는 금서 (사슬)
    for (const [i, sg] of [[0, 1], [1, -1]]) { const a = t * 1.3 + i * PI, x = sg * 30 + cos(a) * 4, y = -h * 0.45 + sin(a) * 6; ctx.save(); ctx.translate(x, y); ctx.rotate(sin(a) * 0.2);
      rrect(ctx, -9, -11, 18, 22, 2, vg(ctx, -11, 11, '#5a2a3a', '#2a0a1a'), '#c8a040', 1.2); ell(ctx, 0, 0, 3.6, 2.4, '#e8d8b0'); ell(ctx, 0, 0, 1.4, 1.4, ec);
      if (casting) glow(ctx, 0, 0, 16, ec, 0.6); ctx.restore(); line(ctx, '#8a8070', 1, [[sg * 12, -h * 0.55], [x - sg * 6, y - 8]]); }
  };
  // 녹스 2: 공허의 거인 왕 — 거대한 어깨 갑옷 · 얼굴 없는 투구에 갈라진 별빛 틈 · 떠 있는 조각 왕관 · 부서진 큰 검 · 사슬
  N2.nox = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase || 0 : 0, ec = ph ? '#ff40c0' : '#d070ff', A = '#2a1a40', AL = '#4a3068', OUT = '#0a0414';
    glow(ctx, 0, -h * 0.5, h * 0.55, '#5a20a0', 0.3);
    // 망토 (뒤)
    ctx.beginPath(); ctx.moveTo(-w * 0.55, -h * 0.78); ctx.lineTo(-w * 0.85, -4); for (let i = 0; i < 6; i++) ctx.lineTo(-w * 0.85 + (i + 0.5) * w * 0.28, (i % 2 ? -14 : 0) + sin(t * 2 + i) * 3); ctx.lineTo(w * 0.85, -4); ctx.lineTo(w * 0.55, -h * 0.78); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.8, 0, '#1a0a2a', '#08020e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1; ctx.stroke();
    // 다리 · 몸통 갑옷
    for (const sg of [-1, 1]) { rrect(ctx, sg * 20 - 13, -h * 0.36, 26, h * 0.36, 6, vg(ctx, -h * 0.36, 0, AL, A), OUT, 2); rrect(ctx, sg * 20 - 16, -10, 32, 10, 3, A, OUT, 1.6); }
    rrect(ctx, -w * 0.5, -h * 0.72, w, h * 0.38, 12, vg(ctx, -h * 0.72, -h * 0.34, AL, A), OUT, 2.4);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 12; line(ctx, ec, 2, [[0, -h * 0.7], [-6, -h * 0.6], [4, -h * 0.5], [-3, -h * 0.4]]); ctx.restore();
    for (let i = 0; i < 4; i++) ell(ctx, -w * 0.4 + i * w * 0.27, -h * 0.36, 4, 3, '#8a7aa8', OUT, 0.8);   // 허리 사슬
    // 거대한 어깨
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * w * 0.6, -h * 0.7); ctx.beginPath(); ctx.ellipse(0, 0, 30, 22, 0, PI, 0); ctx.fillStyle = vg(ctx, -22, 0, '#5a3a80', A); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.4; ctx.stroke();
      for (const x of [-16, 0, 16]) poly(ctx, '#3a2058', [[x - 4, -18 + abs(x) * 0.3], [x, -32 + abs(x) * 0.4], [x + 4, -18 + abs(x) * 0.3]], OUT, 0.8); ctx.restore(); }
    // 팔 + 부서진 큰 검 (앞)
    ctx.save(); ctx.translate(w * 0.62, -h * 0.62); ctx.rotate(0.2 - s.atk * 0.6); rrect(ctx, -9, 0, 18, 56, 6, vg(ctx, 0, 56, AL, A), OUT, 1.6); ctx.translate(0, 60);
    rrect(ctx, -3, -8, 6, 16, 2, '#3a2a1a'); rrect(ctx, -14, 6, 28, 5, 2, '#8a7aa8', OUT, 1);
    poly(ctx, vg(ctx, 10, 90, '#5a4a78', '#2a1a40'), [[-7, 10], [7, 10], [8, 70], [2, 76], [6, 82], [-2, 92], [-7, 72]], ec, 1.2); ctx.restore();
    ctx.save(); ctx.translate(-w * 0.62, -h * 0.62); ctx.rotate(-0.1); rrect(ctx, -9, 0, 18, 52, 6, vg(ctx, 0, 52, AL, A), OUT, 1.6); ctx.restore();
    // 얼굴 없는 투구 (별빛 틈)
    const hy = -h * 0.86; ctx.beginPath(); ctx.moveTo(-17, hy + 16); ctx.quadraticCurveTo(-20, hy - 20, 0, hy - 24); ctx.quadraticCurveTo(20, hy - 20, 17, hy + 16); ctx.closePath(); ctx.fillStyle = vg(ctx, hy - 24, hy + 16, '#4a3068', '#14081e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.moveTo(-2, hy - 16); ctx.lineTo(3, hy - 4); ctx.lineTo(-1, hy + 4); ctx.lineTo(4, hy + 14); ctx.lineTo(8, hy + 14); ctx.lineTo(5, hy + 2); ctx.lineTo(9, hy - 6); ctx.lineTo(3, hy - 18); ctx.closePath(); ctx.fillStyle = '#08020e'; ctx.fill(); ctx.clip();
    for (let i = 0; i < 6; i++) ell(ctx, 1 + (i % 3) * 3, hy - 12 + i * 4.5, 0.9, 0.9, '#fff'); glow(ctx, 4, hy, 12, ec, 0.9); ctx.restore();
    // 떠 있는 조각 왕관
    for (let i = 0; i < 7; i++) { const a = PI + i * PI / 6, x = cos(a) * 24, y = hy - 22 + sin(a) * 6 + sin(t * 2 + i) * 2; ctx.save(); ctx.translate(x, y); ctx.rotate(a + PI / 2); poly(ctx, vg(ctx, -16, 0, '#e0c0ff', '#6a3aa0'), [[-3, 0], [3, 0], [0, -10 - (i % 2) * 6]], OUT, 0.6); ctx.restore(); }
  };
})();
