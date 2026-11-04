'use strict';
// 1.7.4 시안 (사용자 디자인 기반): 균열의 짐승 → 오염된 거미, 암흑 기사 → 잔재의 수호병, 교단 마법사 → 오염된 사제
// 게임과 같은 그리기 방식, 오른쪽을 보는 모습 기준
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };

  // ---------------- 오염된 거미 (id rift_beast) ----------------
  // 둥근 배에 공허의 금(분홍빛으로 갈라져 빛남), 머리 앞의 눈 무리(큰 눈 2 + 작은 눈 4), 마디진 다리 8개
  // 무너진 차원의 공허가 스며든 거미. 공격 땐 앞다리를 들고 달려든다
  A('rift_beast', 'flip', 1, (c, m, t, s) => {
    const k = m.w / 80; c.scale(k, k);
    const run = s.walk ? t * 14 : t * 2, lunge = sin(s.atk * PI);
    const BODY = '#46295f', BD = '#1e1030', EYE = '#ff6fd8';
    c.translate(lunge * 6, 0);
    // 다리 (먼 쪽 4개 → 몸 → 가까운 쪽 4개)
    // 다리는 몸 옆에서 위로 꺾였다가 바깥으로 넓게 뻗어 땅을 짚는다 (앞 2쌍은 앞으로, 뒤 2쌍은 뒤로)
    const SPREAD = [36, 20, -16, -36];
    const leg = (i, near) => {
      const bx = 8 - i * 6, sp = SPREAD[i] * (near ? 1 : 0.8), ph = run + i * 1.3 + (near ? PI : 0), lift = (i === 0 && near) ? lunge * 16 : 0;
      const kx = bx + sp * 0.45, ky = -42 + sin(ph) * 3 - lift - (near ? 0 : 3), fx = bx + sp + (i === 0 ? lunge * 8 : 0), fy = -Math.max(0, sin(ph)) * 3 - lift;
      line(c, near ? '#3a2456' : '#24163a', near ? 3.8 : 3, [[bx, -20], [kx, ky], [fx, fy]]);
      ell(c, kx, ky, 2.2, 2.2, near ? '#6a4a8e' : '#3e2a58');
      ell(c, fx, fy, 1.6, 1.2, near ? '#ff8ae0' : '#a05090');
    };
    for (let i = 0; i < 4; i++) leg(i, false);
    // 배
    ell(c, -16, -24, 22, 17, lin(c, -16, -41, -16, -7, '#6a4296', BODY), '#ff8ae0', 1.2);
    ell(c, -20, -32, 9, 5, 'rgba(255,255,255,.08)');
    const cr = [[[-26, -30], [-18, -24], [-22, -16]], [[-10, -36], [-14, -28], [-6, -22]], [[-30, -20], [-24, -14]]];
    for (const p of cr) { line(c, 'rgba(255,110,216,.35)', 4, p); line(c, '#ff8ae0', 1.4, p); }
    glow(c, -16, -26, 18, '#ff4fc8', 0.25 + sin(t * 3) * 0.1);
    // 머리가슴
    ell(c, 8, -20, 13, 10, lin(c, 8, -30, 8, -10, '#4a2d68', BODY), BD, 1.5);
    // 눈 무리
    for (const [x, y, r] of [[15, -24, 3.2], [19, -21, 3]]) { ell(c, x, y, r, r, EYE); ell(c, x + 0.8, y - 0.8, r * 0.35, r * 0.35, '#ffe6fa'); }
    for (const [x, y] of [[11, -27], [15, -29], [20, -26], [12, -21]]) ell(c, x, y, 1.4, 1.4, EYE);
    glow(c, 16, -24, 12, EYE, 0.7);
    // 송곳니
    poly(c, '#d8c8e8', [[20, -15], [23, -10], [18, -13]]); poly(c, '#d8c8e8', [[16, -14], [17, -9], [14, -12]]);
    for (let i = 0; i < 4; i++) leg(i, true);
  });

  // ---------------- 공허의 감시안 (id dark_knight) ----------------
  // 그림자 성채를 감시하는 거대한 눈. 보랏빛 구체에 세로로 찢어진 동공, 기울어진 고리, 주위를 도는 공허 결정.
  // 떠서 움직이고, 동공이 플레이어를 따라간다. 공격(결정 낙하) 땐 눈을 크게 뜨고 결정이 빛난다
  A('dark_knight', 'pop', 0.5, (c, m, t, s) => {
    const k = m.w / 56; c.scale(k, k);
    const bob = sin(t * 2) * 3, open = 1 + s.atk * 0.25;
    c.translate(0, -34 + bob);
    const p = G.Game && G.Game.player;
    const look = p ? G.U.clamp((p.x - m.x) * m.dir / 200, -1, 1) : 0;
    // 뒤쪽 고리 (반)
    c.save(); c.rotate(-0.35);
    c.strokeStyle = 'rgba(190,110,255,.55)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 34, 9, 0, PI, PI * 2); c.stroke(); c.restore();
    // 뒤쪽 결정
    const shards = (front) => { for (let i = 0; i < 5; i++) { const a = t * 0.9 + i * PI * 2 / 5, z = sin(a); if ((z > 0) !== front) continue;
      const ox = cos(a) * 36, oy = sin(a) * 10, x = ox * cos(-0.35) - oy * sin(-0.35), y = ox * sin(-0.35) + oy * cos(-0.35), sc = 0.85 + z * 0.25;
      c.save(); c.translate(x, y); c.rotate(a); c.scale(sc, sc);
      poly(c, front ? '#c890ff' : '#8a50c8', [[0, -7], [3, 0], [0, 7], [-3, 0]], '#4a2080', 0.8); c.restore();
      if (front) glow(c, x, y, 7, '#c070ff', 0.4 + s.atk * 0.5); } };
    shards(false);
    glow(c, 0, 0, 34, '#9a40ff', 0.35 + sin(t * 3) * 0.08);
    // 눈알
    ell(c, 0, 0, 22, 22, lin(c, 0, -22, 0, 22, '#5a2c86', '#1c0c30'), '#0c0418', 2);
    const ex = look * 4;
    c.save(); c.beginPath(); c.ellipse(ex, 0, 17 * open, 11 * open, 0, 0, PI * 2); c.clip();   // 아몬드 모양 눈
    c.fillStyle = lin(c, 0, -11, 0, 11, '#c070ff', '#6a20b0'); c.fillRect(-22, -14, 44, 28);
    ell(c, ex, 0, 8.5 * open, 8.5 * open, '#f090ff');
    c.fillStyle = '#12021e'; c.beginPath(); c.ellipse(ex + look * 1.5, 0, 2.4 * open, 8.5 * open, 0, 0, PI * 2); c.fill();
    c.restore();
    c.strokeStyle = '#0c0418'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(ex, 0, 17 * open, 11 * open, 0, 0, PI * 2); c.stroke();
    ell(c, ex - 5, -4, 2, 1.4, 'rgba(255,255,255,.75)');
    glow(c, ex, 0, 18, '#f080ff', 0.45 + s.atk * 0.4);
    // 앞쪽 고리 (반) + 앞쪽 결정
    c.save(); c.rotate(-0.35);
    c.strokeStyle = 'rgba(210,140,255,.85)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 34, 9, 0, 0, PI); c.stroke(); c.restore();
    shards(true);
  });

  // ---------------- 오염된 사제 (id cult_mage) ----------------
  // 교단의 사제가 공허에 잠식된 모습. 뒤에서 기우는 보랏빛 후광, 얼굴 대신 어둠 속 마름모 눈,
  // 바닥까지 끌리는 해진 로브, 펼친 두 손. 떠서 움직이고, 공격 땐 두 손을 모아 어둠 구슬을 날린다
  A('cult_mage', 'melt', 0.5, (c, m, t, s) => {
    const k = m.h / 72; c.scale(k, k);
    const bob = sin(t * 2.2) * 2.5, cast = s.atk;
    const ROBE = '#4a2a6e', RD = '#24123c', TRIM = '#7a52b0', EYE = '#e070ff';
    c.translate(0, -4 + bob);
    // 후광
    c.save(); c.translate(-2, -70); c.rotate(-0.12);
    c.strokeStyle = 'rgba(200,150,255,.9)'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, 0, 14, 4, 0, 0, PI * 2); c.stroke();
    c.strokeStyle = 'rgba(200,150,255,.3)'; c.lineWidth = 6; c.stroke(); c.restore();
    // 로브
    c.beginPath(); c.moveTo(-8, -58); c.quadraticCurveTo(-22, -30, -20, 0);
    for (let i = 0; i <= 5; i++) c.lineTo(-20 + i * 8, (i % 2 ? -5 : 0) + sin(t * 4 + i) * 1.5);
    c.quadraticCurveTo(22, -30, 8, -58); c.closePath();
    c.fillStyle = lin(c, 0, -60, 0, 0, '#5a3684', RD); c.fill(); c.strokeStyle = RD; c.lineWidth = 1.6; c.stroke();
    line(c, TRIM, 1.6, [[0, -46], [0, -2]]); line(c, TRIM, 1.2, [[-6, -40], [-11, -4]]); line(c, TRIM, 1.2, [[6, -40], [11, -4]]);
    // 소매와 손
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 9, -44); c.rotate(-sg * (0.9 + cast * 0.4));
      poly(c, ROBE, [[-4, 0], [4, 0], [7, 16], [-7, 16]], RD, 1.2); ell(c, 0, 19, 3.6, 3, '#b8a0d8', '#6a5090', 1); c.restore(); }
    // 두건
    c.beginPath(); c.moveTo(0, -72); c.quadraticCurveTo(14, -66, 13, -50); c.lineTo(-13, -50); c.quadraticCurveTo(-14, -66, 0, -72); c.closePath();
    c.fillStyle = ROBE; c.fill(); c.strokeStyle = RD; c.lineWidth = 1.6; c.stroke();
    ell(c, 1, -56, 8, 7, '#0e0618');
    poly(c, EYE, [[1, -61], [4, -56], [1, -51], [-2, -56]]); ell(c, 1, -56, 1, 1.6, '#fff0ff');
    glow(c, 1, -56, 12, EYE, 0.8 + sin(t * 4) * 0.15);
    if (cast > 0) { glow(c, 20, -36, 10 + cast * 8, '#c060ff', cast); ell(c, 20, -36, 4 * cast, 4 * cast, '#1a0a2a', '#e090ff', 1.2); }
  });


  // ---------------- 균열 집행관 (id executor, 정예) ----------------
  // 뿔과 가운데 가시가 솟은 두건, 어둠 속 붉은 마름모 눈, 층층이 겹친 견갑, 갈라진 금이 빛나는 해진 망토,
  // 공허 결정으로 된 긴 칼날. 공격 땐 칼날을 아래에서 위로 올려 벤다
  A('executor', 'crumble', 1, (c, m, t, s) => {
    const k = m.h / 118; c.scale(k, k);
    const step = s.walk ? sin(t * 5) : 0, sl = s.atk;
    const AR = '#3e3058', ARD = '#1c1430', HL = '#5c4a84', GLOW = '#e060ff';
    c.rotate(step * 0.03);
    // 망토 (해진 끝)
    c.beginPath(); c.moveTo(-22, -74); c.quadraticCurveTo(-30, -36, -26, -4);
    for (let i = 0; i <= 6; i++) c.lineTo(-26 + i * 8.6, (i % 2 ? -14 : 0) + sin(t * 3 + i) * 2);
    c.quadraticCurveTo(30, -36, 22, -74); c.closePath();
    c.fillStyle = lin(c, 0, -74, 0, 0, '#3a2a56', '#1a0e2c'); c.fill(); c.strokeStyle = ARD; c.lineWidth = 1.6; c.stroke();
    const crack = [[4, -60], [-2, -44], [6, -34], [0, -18], [5, -6]];
    line(c, 'rgba(224,96,255,.35)', 5, crack); line(c, GLOW, 1.6, crack); glow(c, 2, -34, 18, GLOW, 0.3 + sin(t * 3) * 0.1);
    // 몸통 갑옷
    poly(c, AR, [[-16, -78], [16, -78], [12, -50], [-12, -50]], ARD, 1.6);
    line(c, HL, 1.2, [[-10, -70], [10, -70]]); line(c, HL, 1.2, [[-9, -62], [9, -62]]);
    // 견갑 (층층)
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { c.save(); c.translate(sg * (16 + i * 2), -80 + i * 6); c.scale(sg, 1); poly(c, i ? AR : HL, [[-6, -4], [12, -6], [14, 4], [-4, 6]], ARD, 1.2); c.restore(); }
    // 두건 + 뿔 + 가시
    c.beginPath(); c.moveTo(0, -112); c.quadraticCurveTo(14, -104, 13, -84); c.lineTo(-13, -84); c.quadraticCurveTo(-14, -104, 0, -112); c.closePath();
    c.fillStyle = AR; c.fill(); c.strokeStyle = ARD; c.lineWidth = 1.6; c.stroke();
    poly(c, HL, [[-3, -110], [0, -124], [3, -110]], ARD, 1.1);
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 10, -104); c.scale(sg, 1); poly(c, HL, [[0, 0], [10, -6], [14, -16], [8, -6], [2, 4]], ARD, 1.1); c.restore(); }
    ell(c, 0, -94, 8, 8, '#0c0614');
    poly(c, '#ff4a7a', [[0, -100], [3, -94], [0, -88], [-3, -94]]); glow(c, 0, -94, 12, '#ff3060', 0.8);
    // 뒤쪽 팔
    c.save(); c.translate(-18, -72); c.rotate(0.3); rrect(c, -5, 0, 10, 22, 4, AR, ARD); c.restore();
    // 칼을 든 팔
    c.save(); c.translate(18, -72); c.rotate(-0.35 - sl * 1.8);
    rrect(c, -5, 0, 10, 24, 4, AR, ARD); ell(c, 0, 26, 5, 4.5, HL, ARD, 1.2);
    c.translate(0, 28); c.rotate(-0.5);
    poly(c, lin(c, 0, 0, 0, 52, '#ffb0ff', '#a030d0'), [[-4, 0], [4, 0], [2, 46], [0, 56], [-2, 46]], '#7020a0', 1.2);
    rrect(c, -7, -3, 14, 4, 2, HL, ARD);
    glow(c, 0, 30, 18 + sl * 10, GLOW, 0.45 + sl * 0.4);
    c.restore();
  });

  // ---------------- 공허 성기사 (id void_serpent) ----------------
  // 뿔 달린 큰 투구(붉은 눈), 공허에 물든 갑옷과 망토, 분홍 별과 금이 빛나는 큰 방패, 보랏빛 깃발이 달린 창.
  // 방패를 앞세우고 걷다가 공격 땐 창으로 찌른다
  A('void_serpent', 'crumble', 1, (c, m, t, s) => {
    const k = m.h / 112; c.scale(k, k);
    const step = s.walk ? sin(t * 5) : 0, th = s.atk;
    const AR = '#433660', ARD = '#1c1430', HL = '#6a5a94', PINK = '#ff6fd8';
    // 망토
    poly(c, '#2a1c40', [[-14, -70], [14, -70], [20, -14], [8, -6], [0, -14], [-8, -6], [-20, -14]], ARD, 1.4);
    // 창 (뒤쪽 손)
    const push = th > 0.3 ? sin((th - 0.3) / 0.7 * PI) * 20 : 0;
    c.save(); c.translate(14 + push, -56); c.rotate(th > 0.3 ? 1.35 : 0.08);
    line(c, '#5a4a70', 3.4, [[0, 40], [0, -40]]);
    poly(c, lin(c, 0, -62, 0, -40, '#ffd0ff', '#b050e0'), [[-5, -40], [0, -62], [5, -40], [0, -36]], '#7020a0', 1.2);
    c.beginPath(); c.moveTo(1, -34); c.quadraticCurveTo(14, -30 + sin(t * 4) * 3, 18, -20); c.quadraticCurveTo(10, -22, 1, -20); c.closePath(); c.fillStyle = '#8a3ac0'; c.fill();
    c.restore();
    // 다리
    for (const sg of [-1, 1]) { const o = (sg > 0 ? step : -step) * 3; rrect(c, sg * 8 - 6, -26 - Math.max(0, o), 12, 26, 4, AR, ARD); rrect(c, sg * 8 - 7, -5 - Math.max(0, o), 14, 6, 2, ARD); }
    // 몸
    poly(c, AR, [[-15, -68], [15, -68], [12, -26], [-12, -26]], ARD, 1.6);
    line(c, HL, 1.2, [[-11, -58], [11, -58]]); line(c, HL, 1.2, [[-10, -46], [10, -46]]);
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 15, -66); c.scale(sg, 1); poly(c, HL, [[-4, -6], [10, -8], [14, 6], [0, 6]], ARD, 1.2); poly(c, HL, [[6, -8], [10, -16], [12, -7]]); c.restore(); }
    // 투구 + 뿔
    rrect(c, -10, -90, 20, 22, 7, AR, ARD);
    for (const sg of [-1, 1]) { c.save(); c.translate(sg * 9, -86); c.scale(sg, 1); poly(c, HL, [[0, 0], [8, -6], [10, -16], [5, -7], [0, -3]], ARD, 1); c.restore(); }
    rrect(c, -7, -82, 14, 4, 2, '#0c0614'); ell(c, -3, -80, 1.8, 1.3, '#ff4a7a'); ell(c, 3, -80, 1.8, 1.3, '#ff4a7a'); glow(c, 0, -80, 9, '#ff3060', 0.7);
    // 방패 (앞)
    c.save(); c.translate(-10, -48);
    c.beginPath(); c.moveTo(-14, -20); c.lineTo(14, -20); c.lineTo(14, 4); c.quadraticCurveTo(12, 20, 0, 28); c.quadraticCurveTo(-12, 20, -14, 4); c.closePath();
    c.fillStyle = lin(c, 0, -20, 0, 28, '#6a5a94', '#3a2c58'); c.fill(); c.strokeStyle = '#9a86c8'; c.lineWidth = 2; c.stroke();
    poly(c, PINK, [[0, -10], [2.5, -1], [10, 2], [2.5, 5], [0, 14], [-2.5, 5], [-10, 2], [-2.5, -1]]); glow(c, 0, 2, 14, PINK, 0.6);
    line(c, PINK, 1.2, [[4, 8], [7, 14], [5, 20]]);
    c.restore();
  });

  // ---------------- 녹스의 전령 (id abyss_eye) ----------------
  // 결정 왕관 같은 보랏빛 고리, 창백한 가면 얼굴(붉은 눈), 흘러내리는 두건과 망토, 가슴의 고리 장식,
  // 초승달 끝에 공허 구슬이 걸린 지팡이. 떠서 움직이고, 공격 땐 지팡이를 들어 구슬을 날린다
  A('abyss_eye', 'melt', 0.4, (c, m, t, s) => {
    const k = m.h / 104; c.scale(k, k);
    const bob = sin(t * 2) * 3, cast = s.atk;
    const ROBE = '#3a2456', RD = '#180c2a', TRIM = '#c080ff';
    c.translate(0, -6 + bob);
    // 결정 고리
    c.save(); c.translate(0, -78);
    c.strokeStyle = 'rgba(210,150,255,.9)'; c.lineWidth = 2.2; c.beginPath(); c.ellipse(0, 0, 17, 5, 0, 0, PI * 2); c.stroke();
    for (const [x, h] of [[-12, 8], [-5, 12], [0, 16], [5, 12], [12, 8]]) poly(c, 'rgba(225,180,255,.9)', [[x - 2, -1], [x, -h], [x + 2, -1]], '#9a50d0', 0.8);
    glow(c, 0, -4, 18, '#c070ff', 0.5); c.restore();
    // 망토
    c.beginPath(); c.moveTo(-10, -62); c.quadraticCurveTo(-26, -36, -22, -2);
    for (let i = 0; i <= 5; i++) c.lineTo(-22 + i * 8.8, (i % 2 ? -8 : 0) + sin(t * 3.5 + i) * 2);
    c.quadraticCurveTo(26, -36, 10, -62); c.closePath();
    c.fillStyle = lin(c, 0, -62, 0, 0, '#4a2c70', RD); c.fill(); c.strokeStyle = RD; c.lineWidth = 1.6; c.stroke();
    line(c, TRIM, 1.2, [[0, -44], [0, -6]]); ell(c, 0, -46, 4, 4, null, TRIM, 1.6); ell(c, 0, -46, 1.4, 1.4, TRIM);
    for (const [x, y] of [[-14, -20], [14, -28], [-8, -36]]) ell(c, x, y, 1.2, 1.2, '#e0a0ff');
    // 두건 + 가면
    c.beginPath(); c.moveTo(0, -74); c.quadraticCurveTo(15, -68, 13, -50); c.quadraticCurveTo(0, -44, -13, -50); c.quadraticCurveTo(-15, -68, 0, -74); c.closePath();
    c.fillStyle = ROBE; c.fill(); c.strokeStyle = RD; c.lineWidth = 1.6; c.stroke();
    c.beginPath(); c.moveTo(0, -68); c.quadraticCurveTo(8, -64, 7, -56); c.quadraticCurveTo(3, -49, 0, -48); c.quadraticCurveTo(-3, -49, -7, -56); c.quadraticCurveTo(-8, -64, 0, -68); c.closePath();
    c.fillStyle = '#ecdcff'; c.fill();
    poly(c, '#ff4a7a', [[-5, -60], [-1.5, -59], [-2, -57.5]]); poly(c, '#ff4a7a', [[5, -60], [1.5, -59], [2, -57.5]]); glow(c, 0, -59, 8, '#ff3060', 0.6);
    // 지팡이 (초승달 + 공허 구슬)
    c.save(); c.translate(16, -40); c.rotate(-0.15 - cast * 0.5);
    line(c, '#a070d0', 2.6, [[0, 36], [0, -30]]);
    c.strokeStyle = '#d8a8ff'; c.lineWidth = 3; c.beginPath(); c.arc(0, -36, 8, PI * 0.15, PI * 1.6); c.stroke();
    ell(c, 2, -36, 5 + cast * 2, 5 + cast * 2, '#12061e', '#e080ff', 1.6); glow(c, 2, -36, 14 + cast * 10, '#c040ff', 0.6 + cast * 0.4);
    ell(c, 0, 0, 3.4, 3, '#d8c0f0', '#8060b0', 1);
    c.restore();
  });

  const M = G.MONSTERS;
  Object.assign(M.rift_beast, { name: '균열 거미', w: 80, h: 52, color: '#3a2350', color2: '#ff6fd8' });
  Object.assign(M.dark_knight, { name: '공허의 감시안', w: 56, h: 56, color: '#4a2470', color2: '#e070ff', flying: true });
  Object.assign(M.executor, { name: '그림자 집행관', w: 70, h: 118, color: '#3e3058', color2: '#e060ff' });
  Object.assign(M.void_serpent, { name: '공허 성기사', w: 56, h: 96, color: '#433660', color2: '#ff6fd8' });
  Object.assign(M.abyss_eye, { name: '녹스의 전령', w: 52, h: 84, color: '#3a2456', color2: '#c080ff' });
  Object.assign(M.cult_mage, { name: '장막의 사제', w: 44, h: 72, color: '#4a2a6e', color2: '#e070ff' });
})();
