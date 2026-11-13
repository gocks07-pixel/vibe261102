'use strict';
// 1.7.8 광산도시 라그하르트 몬스터 다시 그리기 (monsters2.js의 옛 그림을 대신한다, id 그대로)
//  rock_golem = 폐광 바위웜, fire_imp = 용광로 도롱뇽, magma_slime = 용암 웅덩이,
//  foreman = 광석 거인(정예), grounder = 강철 거신 그라운더 MK-7(보스)
//  시안: docs/drafts/1.7.8_raghart_alt.js · 1.7.8_raghart_mech_alt.js
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  // 용암 색: 라그하르트 용광로의 주황 + 금빛 심
  const LAVA = '#ff7a24', LAVA2 = '#ffc860', LAVAD = '#c03a10';

  // ---------------- 용광로 도롱뇽 (id fire_imp) ----------------
  // 사용자 턴어라운드(측면) 기준: 낮고 긴 몸 + 크고 동그란 머리의 도롱뇽. 매끈한 자줏빛 갈색 피부,
  // 등에는 각진 화산암 덩어리(가운데 큰 바위 + 둘레 바위 + 꼬리 작은 바위)가 솟고 그 사이를 용암 금이 잇는다.
  // 큰 노란 눈(검은 테), 콧구멍 점 2개, 꼬리 아래로 흐르는 용암, 등 위로 피어오르는 연기.
  // 공격 땐 몸을 앞으로 밀며 짧게 불을 뿜는다
  A('fire_imp', 'flip', 1, (c, m, t, s) => {
    const k = m.w / 90; c.scale(k, k);
    const run = s.walk ? t * 8 : 0, atk = Math.max(0, s.atk), lunge = sin(atk * PI);
    const SK = '#7e5a5e', SKL = '#93706f', SKD = '#5a3c42', OUT = '#2e1a1e';
    const RK = '#6e4a50', RKL = '#8e6a6e', RKD = '#4a2e34';
    const pulse = 0.8 + sin(t * 2.4) * 0.2;
    const bob = s.walk ? -Math.abs(sin(run)) * 1.2 : sin(t * 2) * 0.4;
    c.translate(lunge * 5, 0);
    glow(c, -4, -24, 50, LAVA, 0.18 * pulse);
    // 다리 (먼 쪽)
    const leg = (x, ph, near) => {
      const lift = s.walk ? Math.max(0, sin(run + ph)) * 3.5 : 0, sw = s.walk ? cos(run + ph) * 2.5 : 0;
      rrect(c, x - 5.5 + sw, -15 - lift, 11, 15 + lift * 0.4, 5, near ? SK : SKD, OUT, 1.4);
    };
    leg(-16, PI, false); leg(20, 0, false);
    c.save(); c.translate(0, bob);
    // 꼬리 (아래쪽이 용암으로 빛남)
    const tw = sin(t * 2.2) * 2 + (s.walk ? sin(run) * 2 : 0);
    const tail = () => { c.beginPath(); c.moveTo(-24, -30); c.bezierCurveTo(-38, -28, -50, -22, -56, -14 + tw); c.quadraticCurveTo(-54, -8 + tw, -46, -9); c.bezierCurveTo(-38, -10, -30, -12, -22, -14); c.closePath(); };
    tail(); c.fillStyle = lin(c, 0, -30, 0, -9, SK, SKD); c.fill();
    c.save(); tail(); c.clip();
    c.beginPath(); c.moveTo(-58, -15 + tw); c.quadraticCurveTo(-46, -13, -22, -17); c.lineTo(-22, -6); c.lineTo(-58, -4); c.closePath();
    c.fillStyle = lin(c, 0, -15, 0, -7, LAVA, LAVA2); c.fill();
    c.restore();
    tail(); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke();
    glow(c, -42, -10, 16, LAVA, 0.5 * pulse);
    // 몸통 (낮고 긴 타원)
    ell(c, 0, -22, 30, 14, lin(c, 0, -36, 0, -8, SKL, SK), OUT, 1.8);
    ell(c, 2, -12, 22, 4, SKD);
    // 등의 용암 금 (바위 사이를 잇는 그물)
    const cracks = [
      [[-44, -18], [-34, -24], [-24, -28], [-12, -32], [0, -32], [14, -31], [24, -28]],
      [[-12, -32], [-14, -40], [-6, -46]], [[14, -31], [12, -40], [6, -46]],
      [[-24, -28], [-26, -22], [-20, -16]], [[0, -32], [-2, -24], [2, -18]], [[24, -28], [20, -20]],
    ];
    for (const p of cracks) line(c, 'rgba(255,120,30,.55)', 6, p);
    for (const p of cracks) line(c, LAVA, 3, p);
    for (const p of cracks) line(c, '#ffe27a', 1.3, p);
    // 각진 화산암 덩어리
    const rock = (cx, cy, w, h, big) => {
      w *= 0.8; h *= 0.8;
      const P = [[-w, h * 0.25], [-w * 0.7, -h * 0.6], [-w * 0.15, -h], [w * 0.6, -h * 0.75], [w, h * 0.05], [w * 0.65, h * 0.85], [-w * 0.55, h * 0.9]].map(([x, y]) => [cx + x, cy + y]);
      poly(c, RK, P, OUT, 1.4);
      poly(c, RKL, [P[1], P[2], P[3], [cx + w * 0.15, cy - h * 0.15], [cx - w * 0.35, cy - h * 0.1]]);
      poly(c, RKD, [P[4], P[5], P[6], [cx - w * 0.2, cy + h * 0.35], [cx + w * 0.3, cy + h * 0.2]]);
      if (big) poly(c, '#a07c7c', [P[2], P[3], [cx + w * 0.2, cy - h * 0.55], [cx - w * 0.2, cy - h * 0.6]]);
    };
    rock(-46, -16, 5, 4); rock(-36, -21, 6.5, 5);
    rock(-24, -26, 8, 6.5); rock(-10, -24, 8, 6.5); rock(8, -24, 8.5, 6.5);
    rock(-15, -36, 8, 6.5); rock(14, -36, 8, 6.5);
    rock(0, -42, 11, 9, true);
    // 머리 (크고 동그랗게)
    const hx = 30 + lunge * 4, hy = -24;
    ell(c, hx, hy, 15, 13, lin(c, hx, hy - 13, hx, hy + 13, SKL, SK), OUT, 1.8);
    ell(c, hx + 2, hy + 8, 11, 4, 'rgba(60,30,36,.35)');
    // 눈 (검은 테 + 큰 노란 눈)
    ell(c, hx + 2, hy - 2, 5.2, 5.4, '#2a1a1e'); ell(c, hx + 2.3, hy - 2, 3.3, 3.8, '#ffe04a');
    ell(c, hx + 1.4, hy - 3.4, 1, 1, 'rgba(255,255,255,.8)');
    // 콧구멍 점 2개
    ell(c, hx + 10, hy - 1, 1.2, 1.2, '#3a2228'); ell(c, hx + 13, hy - 1, 1.2, 1.2, '#3a2228');
    // 공격: 짧은 불길
    if (lunge > 0.05) {
      line(c, '#3a1210', 2, [[hx + 6, hy + 6], [hx + 14, hy + 4]]);
      for (let i = 0; i < 4; i++) { const r = (3.5 + i * 3) * lunge, x = hx + 18 + i * 6 * lunge, y = hy + 4 + sin(t * 30 + i) * 1.2; glow(c, x, y, r * 1.7, LAVA, 0.6); ell(c, x, y, r, r * 0.8, i < 2 ? LAVA2 : LAVA); }
    }
    // 연기 (등 위에서, 머리 쪽으로 흩어짐)
    for (let i = 0; i < 4; i++) {
      const p = (t * 0.4 + i / 4) % 1, x = 18 + p * 12 + sin(p * 5 + i) * 3, y = -42 - p * 28, r = 3 + p * 7;
      ell(c, x, y, r, r, `rgba(160,150,156,${0.6 * (1 - p)})`);
    }
    c.restore();
    // 가까운 쪽 다리
    leg(-12, 0, true); leg(24, PI, true);
  });

  // ---------------- 용암 웅덩이 (id magma_slime) ----------------
  // 용암 웅덩이에서 솟은 슬라임. 위쪽은 검게 굳은 껍질, 틈새로 용암이 빛나고
  // 삼켜 버린 광부의 그을린 안전모를 쓰고 있다. 가장자리에 작은 불꽃이 일렁인다
  A('magma_slime', 'melt', 1, (c, m, t, s) => {
    const k = m.w / 58; c.scale(k, k);
    const atk = Math.max(0, s.atk), lunge = sin(atk * PI);
    const sq = 1 + sin(t * 4) * 0.05 + (s.walk ? sin(t * 9) * 0.06 : 0) + lunge * 0.12;
    const W = 25 * sq, H = 38 / sq + lunge * 6;
    c.translate(lunge * 6, 0);
    // 웅덩이 (공격 땐 넓게 퍼짐)
    const pw = 34 + lunge * 10;
    glow(c, 0, -2, pw * 1.3, LAVA, 0.4);
    ell(c, 0, -1, pw, 6, lin(c, -pw, 0, pw, 0, LAVAD, LAVA), '#5a1a08', 1.2);
    ell(c, -6, -2, pw * 0.55, 2.4, LAVA2);
    for (const [x, r] of [[-pw * 0.7, 3], [pw * 0.6, 2.5], [pw * 0.15, 2]]) ell(c, x, -1, r * 1.6, r * 0.6, '#3a1a12');
    // 가장자리 불꽃
    const flame = (x, sc, ph) => {
      const f = 0.7 + sin(t * 9 + ph) * 0.3; c.save(); c.translate(x, -3); c.scale(sc, sc * f);
      c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-5, -8, 0, -16); c.quadraticCurveTo(5, -8, 4, 0); c.closePath();
      c.fillStyle = lin(c, 0, -16, 0, 0, LAVA2, LAVA); c.fill(); ell(c, 0, -3, 1.6, 3, '#fff0b0'); c.restore();
    };
    flame(-pw + 4, 0.9, 0); flame(-pw * 0.45, 0.6, 2); flame(pw * 0.5, 0.7, 4); flame(pw - 5, 1, 1);
    // 몸
    const body = () => { c.beginPath(); c.moveTo(-W, -2); c.bezierCurveTo(-W * 1.05, -H * 0.7, -W * 0.6, -H, 0, -H); c.bezierCurveTo(W * 0.6, -H, W * 1.05, -H * 0.7, W, -2); c.closePath(); };
    body(); c.fillStyle = lin(c, 0, -H, 0, 0, '#ff9030', LAVAD); c.fill();
    c.save(); body(); c.clip();
    // 굳은 껍질 조각 (위쪽일수록 많이)
    c.fillStyle = '#2e1e1a';
    for (const [x, y, rx, ry, a] of [[-15, -33, 8, 5, 0.3], [9, -36, 9, 4, -0.2], [21, -20, 5, 7, 0.3], [-22, -12, 5, 5, 0.2], [17, -6, 5, 3, -0.3]]) {
      c.beginPath(); c.ellipse(x * sq, y / sq, rx, ry, a, 0, PI * 2); c.fill();
    }
    // 틈새 용암 빛
    for (const p of [[[-8, -34], [-4, -31], [0, -34]], [[17, -26], [19, -18]], [[-22, -20], [-17, -18]]]) line(c, LAVA2, 1.2, p.map(([x, y]) => [x * sq, y / sq]));
    c.restore();
    body(); c.strokeStyle = '#4a1608'; c.lineWidth = 1.8; c.stroke();
    glow(c, 0, -H * 0.35, W * 1.2, LAVA, 0.3);
    // 얼굴: 찡그린 금빛 눈 + 들쭉날쭉한 입 (안쪽이 용암)
    const ey = -H * 0.45;
    for (const sg of [-1, 1]) {
      const ex = 3 + sg * 8;
      poly(c, '#1a0c08', [[ex - 5, ey - 3 + (sg > 0 ? -1.5 : 1.5)], [ex + 5, ey - 3 + (sg > 0 ? 1.5 : -1.5)], [ex + 4, ey + 3], [ex - 4, ey + 3]]);
      ell(c, ex, ey + 0.8, 2.6, 2, '#ffe070'); glow(c, ex, ey, 7, LAVA2, 0.6);
    }
    const my = ey + 9, mo = 3 + lunge * 4;
    poly(c, '#1a0c08', [[-6, my], [-3, my + 2], [0, my], [3, my + 2], [6, my], [12, my + 1], [10, my + mo + 2], [4, my + mo], [-2, my + mo + 1], [-7, my + mo - 1]]);
    ell(c, 2, my + mo * 0.6, 4, mo * 0.4, LAVA);
    // 그을린 광부 안전모 (조금 기울어짐)
    c.save(); c.translate(1, -H + 4); c.rotate(-0.12 + sin(t * 4) * 0.03);
    ell(c, 0, 1, 19, 3.2, '#4a3e26', '#2a2214', 1.2);   // 챙
    c.beginPath(); c.ellipse(0, 0, 14, 11, 0, PI, 0); c.closePath(); c.fillStyle = lin(c, 0, -11, 0, 0, '#9a8450', '#6a5a34'); c.fill(); c.strokeStyle = '#2a2214'; c.lineWidth = 1.2; c.stroke();
    line(c, '#5a4a2a', 2, [[0, -11], [0, -1]]);
    for (const [x, y, r] of [[-8, -5, 2.6], [6, -7, 2], [9, -2, 1.6]]) ell(c, x, y, r, r * 0.7, 'rgba(30,20,10,.55)'); // 그을음
    rrect(c, 10, -7, 6, 5, 1.5, '#3a3a40', '#1a1a20', 1); ell(c, 15.5, -4.5, 1.6, 2, '#5a4a3a'); // 꺼진 헤드램프
    c.restore();
    // 거품·불티
    const bub = Math.abs(sin(t * 3)); ell(c, -12, -H * 0.85 - bub * 4, 2.6 * bub, 2.6 * bub, LAVA2);
    for (let i = 0; i < 3; i++) { const p = (t * 0.7 + i / 3) % 1; ell(c, -14 + i * 14 + sin(p * 6 + i) * 3, -H - 6 - p * 26, 1.4 * (1 - p) + 0.4, 1.4 * (1 - p) + 0.4, `rgba(255,190,90,${1 - p})`); }
  });

  // ---------------- 폐광 바위웜 (id rock_golem) ----------------
  // 폐광(첫 사냥터)의 어린 바위 지렁이. 통통한 흙빛 돌 마디, 등에 작은 수정 조각 몇 개,
  // 동그란 머리에 작은 눈과 짧은 송곳니 두 개. 돌무더기에서 반쯤 기어 나와 꿈틀거리고, 머리를 내밀어 깨문다
  A('rock_golem', 'crumble', 1, (c, m, t, s) => {
    const k = m.w / 80; c.scale(k, k);
    const atk = Math.max(0, s.atk), lunge = sin(atk * PI);
    const ST = '#8a7462', STL = '#a89078', STD = '#3e3028', BELLY = '#c8b090', CR = '#9ae6ff', CRL = '#e4fbff', CRD = '#4a8aa0';
    const ph = s.walk ? t * 7 : t * 1.8;
    const N = 7, seg = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const x = -26 + u * 44 + (u > 0.7 ? lunge * 10 * (u - 0.7) * 3.3 : 0);
      const y = -(8 + 14 * sin(u * PI * 0.8)) + sin(ph - u * 5) * (s.walk ? 3 : 1.5) * (1 - u * 0.4) - (u > 0.8 ? lunge * 3 : 0);
      seg.push({ x, y, r: 7 + u * 4, u });
    }
    // 몸 (꼬리부터)
    for (let i = 0; i < N - 1; i++) {
      const p = seg[i], nx = seg[i + 1], a = Math.atan2(nx.y - p.y, nx.x - p.x);
      c.save(); c.translate(p.x, p.y); c.rotate(a);
      ell(c, 0, 0, p.r, p.r, lin(c, 0, -p.r, 0, p.r, STL, ST), STD, 1.5);
      ell(c, 0, p.r * 0.5, p.r * 0.7, p.r * 0.38, BELLY);
      ell(c, -p.r * 0.2, -p.r * 0.5, p.r * 0.4, p.r * 0.2, 'rgba(255,255,255,.12)');
      c.restore();
    }
    // 등의 작은 수정 조각 (3개)
    for (const i of [2, 3, 4]) {
      const p = seg[i], nx = seg[i + 1], a = Math.atan2(nx.y - p.y, nx.x - p.x) - PI / 2, len = i === 3 ? 7 : 5;
      c.save(); c.translate(p.x + cos(a) * p.r * 0.75, p.y + sin(a) * p.r * 0.75); c.rotate(a + PI / 2 + (i - 3) * 0.25);
      poly(c, lin(c, 0, -len, 0, 0, CRL, CR), [[-2.4, 0], [0, -len], [2.4, 0]], CRD, 1);
      c.restore();
    }
    glow(c, seg[3].x, seg[3].y - seg[3].r, 8, CR, 0.3 + sin(t * 3) * 0.1);
    // 돌무더기 (꼬리가 묻힌 곳)
    for (const [x, y, rx, ry] of [[-32, -3, 7, 4.5], [-22, -2, 6, 3.5], [-28, -8, 5, 4], [-38, -2, 4, 2.5]]) ell(c, x, y, rx, ry, lin(c, x, y - ry, x, y + ry, '#8a7c70', '#4a3e36'), STD, 1.2);
    // 머리 (동그랗게)
    const hd = seg[N - 1], open = lunge;
    c.save(); c.translate(hd.x + 2, hd.y); c.rotate(0.15 + lunge * 0.2);
    ell(c, 0, 0, 11, 10, lin(c, 0, -10, 0, 10, STL, ST), STD, 1.6);
    ell(c, 0, 5, 8, 4, BELLY);
    // 작은 이마 판 + 작은 수정 하나
    poly(c, '#7a6454', [[-6, -8], [5, -10], [8, -6], [-3, -5]], STD, 1);
    c.save(); c.translate(-1, -9); c.rotate(-0.3); poly(c, lin(c, 0, -5, 0, 0, CRL, CR), [[-1.8, 0], [0, -5], [1.8, 0]], CRD, 0.8); c.restore();
    // 눈 (작고 동그란 검은 눈 + 하이라이트)
    ell(c, 5, -2, 2, 2.2, '#1a1210'); ell(c, 5.6, -2.8, 0.7, 0.7, '#fff');
    // 입: 짧은 송곳니 두 개 (공격 땐 벌어짐)
    poly(c, '#4a2020', [[6, 3], [11.5, 1.5], [11, 3.5 + open * 4], [6, 4 + open * 2]]);
    poly(c, '#f0e6d4', [[7.5, 2.6], [8.6, 5 + open], [9.6, 2.2]]); poly(c, '#f0e6d4', [[9.6, 2.2], [10.6, 4.5 + open], [11.4, 1.8]]);
    c.restore();
    if (s.walk || lunge > 0.2) for (let i = 0; i < 3; i++) { const p = (t * 1.5 + i / 3) % 1; ell(c, -20 + i * 14, -2 - p * 6, 2.5 + p * 4, 1.6 + p * 2.4, `rgba(170,150,130,${0.35 * (1 - p)})`); }
  });
  // ---------------- 광석 거인 (id foreman, 정예) ----------------
  // 사용자 턴어라운드 기준: 둥근 모서리 돌 블록을 쌓아 만든 거인. 투구 같은 머리에 이마 띠,
  // 검은 눈창 속 화난 노란 두 눈, 턱 블록. 가슴판·허리·팔목에 금빛 볼트와 금 띠.
  // 큰 어깨 블록, 마디진 팔, 손가락이 있는 큰 주먹, 마디진 다리. 등 뒤 어깨에 큰 금빛 광석 결정 두 개.
  // 공격 땐 앞 주먹을 들어 내려찍는다
  A('foreman', 'crumble', 1, (c, m, t, s) => {
    const k = m.h / 112; c.scale(k, k);
    const step = s.walk ? sin(t * 4.5) : 0, atk = Math.max(0, s.atk), bob = s.walk ? -Math.abs(sin(t * 4.5)) * 1.5 : sin(t * 2) * 0.5;
    const ST = '#8e7e84', STL = '#a8999c', STD = '#5e5058', OUT = '#2a2026';
    const AU = '#ffc83a', AUL = '#fff0a0', AUD = '#b07a18';
    const blk = (x, y, w, h, r, dark) => {
      rrect(c, x, y, w, h, r, lin(c, 0, y, 0, y + h, dark ? ST : STL, dark ? STD : ST), OUT, 1.8);
      ell(c, x + w * 0.3, y + h * 0.22, w * 0.22, h * 0.08, 'rgba(255,255,255,.12)');
      ell(c, x + w * 0.7, y + h * 0.65, 1.6, 1.2, 'rgba(40,24,32,.35)'); ell(c, x + w * 0.25, y + h * 0.7, 1.2, 1, 'rgba(40,24,32,.3)');
    };
    const dot = (x, y) => { rrect(c, x - 2, y - 2, 4, 4, 1, AU, AUD, 0.8); };
    const band = (x, y, w) => { rrect(c, x, y, w, 4, 1.5, AU, AUD, 1); };
    const gem = (x, y, sz, a) => {
      c.save(); c.translate(x, y); c.rotate(a);
      const P = [[0, -sz], [sz * 0.7, -sz * 0.45], [sz * 0.6, sz * 0.5], [0, sz * 0.8], [-sz * 0.6, sz * 0.5], [-sz * 0.7, -sz * 0.45]];
      poly(c, AU, P, AUD, 1.4);
      poly(c, AUL, [P[0], P[1], [0, -sz * 0.1], P[5]]);
      poly(c, '#e8a020', [P[2], P[3], P[4], [0, sz * 0.15]]);
      line(c, AUD, 0.8, [[0, -sz * 0.1], [0, sz * 0.8]]);
      c.restore();
    };
    // 주먹 (손가락 + 엄지)
    const fist = (x, y, w, h, dark) => {
      blk(x, y, w, h, 5, dark);
      for (let i = 1; i < 4; i++) line(c, OUT, 1.2, [[x + w * i / 4, y + h * 0.45], [x + w * i / 4, y + h - 1]]);
      rrect(c, x + w - 6, y + 2, 8, 9, 3, dark ? ST : STL, OUT, 1.4);
    };
    // 팔 하나 (어깨 기준, 아래로 늘어뜨림)
    const arm = (dark) => {
      blk(-10, 6, 20, 18, 5, dark);
      blk(-15, 21, 30, 25, 7, dark);
      band(-15, 41, 30); dot(-7, 30); dot(7, 30);
      fist(-16, 46, 32, 21, dark);
    };
    for (const sg of [-1, 1]) {
      const o = (sg > 0 ? step : -step) * 3, lift = Math.max(0, o), x = sg * 15;
      c.save(); c.translate(x, -lift);
      blk(-11, -46, 22, 18, 6, sg < 0); dot(sg > 0 ? 3 : -3, -38);
      blk(-12, -30, 24, 18, 6, sg < 0);
      blk(-15, -13, 30, 13, 5, sg < 0);
      c.restore();
    }
    c.save(); c.translate(0, bob);
    // 등 뒤 금빛 광석 결정 (뒤쪽 어깨 위)
    glow(c, -32, -102, 32, AU, 0.35 + sin(t * 2.5) * 0.1);
    gem(-42, -96, 15, -0.4); gem(-26, -108, 18, 0.12);
    // 뒤 팔
    c.save(); c.translate(-40, -76); c.rotate(0.12 + step * 0.1); arm(true); c.restore();
    // 허리
    blk(-24, -54, 48, 14, 6, true); dot(0, -47);
    // 몸통
    blk(-30, -88, 60, 38, 12);
    // 가슴판
    blk(-14, -80, 34, 18, 6); dot(-4, -71); dot(10, -71);
    // 어깨
    blk(-52, -94, 30, 27, 10, true);
    // 머리 (투구 + 이마 띠 + 눈창 + 턱)
    blk(-10, -114, 36, 30, 10);
    dot(-1, -109); dot(17, -109);
    rrect(c, -11, -104, 38, 7, 3, lin(c, 0, -104, 0, -97, STL, ST), OUT, 1.6);
    rrect(c, -5, -97, 28, 10, 4, '#1a1216', OUT, 1.4);
    for (const [x, d] of [[3, 1], [15, -1]]) {
      poly(c, AUL, [[x - 4, -94 - d * 1.2], [x + 4, -94 + d * 1.2], [x + 3.5, -90], [x - 3.5, -90]]);
      glow(c, x, -92, 9, '#ffd040', 0.85);
    }
    rrect(c, 0, -88, 18, 6, 3, lin(c, 0, -88, 0, -82, STL, ST), OUT, 1.4);
    // 앞 어깨 + 앞 팔 (내려찍기)
    blk(24, -94, 30, 27, 10);
    c.save(); c.translate(40, -76); c.rotate(-0.08 - atk * 1.9 + atk * atk * 2.5 + step * 0.1); arm(false); c.restore();
    c.restore();
  });

  // ---------------- 강철 거신 그라운더 MK-7 (id grounder, 보스) ----------------
  // 교단 채굴 공장의 채굴 거신. 각진 강철 몸통에 붉은 MK-7 명판, 노랑·검정 경고 줄무늬,
  // 둥근 머리의 하늘빛 두 눈, 어깨의 주황 경고등, 등의 배기관 두 개, 피스톤 다리.
  // 오른팔은 나선 홈이 파인 거대한 드릴(공격·예고 때 빠르게 회전), 왼팔은 무거운 집게.
  // 과열: 몸이 붉게 달아오르고 배기관에서 불꽃·증기 / 그로기: 기울어진 채 눈이 깜빡이고 푸른 전기가 튄다
  A('grounder', 'crumble', 1, (c, m, t, s) => {
    c.scale(m.w / 130, m.h / 190);
    const hot = !!m.hot, groggy = m.groggy > 0, raise = m.boss ? m.boss.raise : 0, step = s.walk ? sin(t * 4) : 0, atk = Math.max(0, s.atk);
    const ST = '#7a8698', STL = '#a4afbe', STD = '#4a5464', OUT = '#1c222c', YEL = '#f2c230', RED = '#b8302c', CY = '#5ae0ff';
    const plate = (x, y, w, h, r, f) => rrect(c, x, y, w, h, r, f || lin(c, 0, y, 0, y + h, STL, ST), OUT, 2);
    const hazard = (x, y, w, h) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = YEL; c.fillRect(x, y, w, h); c.fillStyle = '#1a1a1e'; for (let i = -2; i < w / 8 + 2; i++) { c.beginPath(); c.moveTo(x + i * 10, y + h); c.lineTo(x + i * 10 + 5, y + h); c.lineTo(x + i * 10 + 5 + h, y); c.lineTo(x + i * 10 + h, y); c.fill(); } c.restore(); c.strokeStyle = OUT; c.lineWidth = 1.5; c.strokeRect(x, y, w, h); };
    const rivets = (pts) => { for (const [x, y] of pts) { ell(c, x, y, 2.2, 2.2, STL, OUT, 0.8); } };
    const bolt = (x1, y1, x2, y2, seed) => { const n = 5, pts = [[x1, y1]]; for (let i = 1; i < n; i++) { const u = i / n; pts.push([x1 + (x2 - x1) * u + sin(seed * 7 + i * 3 + t * 40) * 6, y1 + (y2 - y1) * u + cos(seed * 5 + i * 2 + t * 37) * 6]); } pts.push([x2, y2]); line(c, 'rgba(90,200,255,.45)', 5, pts); line(c, '#e8fbff', 1.6, pts); };
    if (groggy) c.rotate(0.08);
    const bob = Math.sin(t * 2.2) * 1.6;
    // 배기관 (등)
    for (const [x, a] of [[-44, -0.25], [-28, -0.12]]) {
      c.save(); c.translate(x, -150); c.rotate(a);
      plate(-7, -40, 14, 40, 3, lin(c, -7, 0, 7, 0, '#5a6474', '#3a4250')); rrect(c, -9, -44, 18, 7, 2, '#2a3038', OUT, 1.5);
      if (hot) { glow(c, 0, -46, 26, '#ff5020', 0.9); for (let i = 0; i < 3; i++) { const p = (t * 1.6 + i / 3) % 1; ell(c, sin(t * 9 + i) * 4, -48 - p * 60, 7 + p * 10, 7 + p * 10, `rgba(240,240,250,${0.6 * (1 - p)})`); } }
      else for (let i = 0; i < 2; i++) { const p = (t * 0.45 + i / 2 + x * 0.01) % 1; ell(c, sin(p * 4) * 3 - p * 6, -48 - p * 40, 5 + p * 9, 5 + p * 9, `rgba(130,135,145,${0.45 * (1 - p)})`); }
      c.restore();
    }
    // 왼팔 (뒤쪽, 집게)
    c.save(); c.translate(-54, -132); c.rotate(0.25 + step * 0.1 + (groggy ? 0.5 : 0));
    plate(-12, -6, 24, 30, 8, lin(c, 0, 0, 0, 30, ST, STD)); ell(c, 0, 28, 9, 9, '#3a4250', OUT, 1.5);
    plate(-11, 30, 22, 30, 6, lin(c, 0, 30, 0, 60, ST, STD));
    poly(c, '#4a5260', [[-14, 58], [-4, 58], [-8, 84], [-18, 76]], OUT, 1.8); poly(c, '#4a5260', [[4, 58], [14, 58], [18, 76], [8, 84]], OUT, 1.8);
    c.restore();
    // 다리 (피스톤)
    for (const sg of [-1, 1]) {
      const o = (sg > 0 ? step : -step) * 3, x = sg * 26;
      c.save(); c.translate(x, -Math.max(0, o)); c.rotate(sg * 0.05);
      plate(-15, -66, 30, 26, 6);
      ell(c, 0, -40, 10, 10, '#3a4250', OUT, 1.6); ell(c, 0, -40, 4, 4, STL);
      plate(-12, -38, 24, 28, 5, lin(c, 0, -38, 0, -10, ST, STD));
      rrect(c, sg > 0 ? 8 : -14, -60, 6, 34, 2, '#c8ccd4', OUT, 1.2); // 피스톤 봉
      c.restore();
      plate(x - 22, -12, 44, 12, 3, '#3a4250'); hazard(x - 20, -10, 40, 5);
    }
    // 허리
    plate(-36, -76, 72, 16, 5, lin(c, 0, -76, 0, -60, STD, '#3a4250'));
    // 몸통 (각진 상자)
    c.translate(0, bob); rrect(c, -58, -158, 116, 86, 26, lin(c, 0, -158, 0, -72, STL, ST), OUT, 2.2); ell(c, -22, -146, 22, 6, 'rgba(255,255,255,.28)');
    line(c, STD, 2, [[-50, -136], [50, -136]]); line(c, STD, 2, [[-54, -100], [54, -100]]);
    rivets([[-50, -150], [-34, -150], [34, -150], [50, -150], [-48, -82], [48, -82]]);
    hazard(-44, -96, 88, 9);
    // 가슴 명판 MK-7 + 그 위 별조각 동력 창
    rrect(c, -26, -130, 52, 28, 5, lin(c, 0, -130, 0, -102, '#d04a40', RED), OUT, 2);
    rivets([[-22, -126], [22, -126], [-22, -106], [22, -106]]);
    c.save(); if (c.getTransform().a < 0) c.scale(-1, 1);   // 왼쪽을 볼 때도 글자는 바로
    c.fillStyle = '#fff2d8'; c.font = 'bold 17px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MK-7', 0, -115.5); c.restore();
    rrect(c, -9, -152, 18, 14, 4, '#1a2028', OUT, 1.5); ell(c, 0, -145, 5, 4, hot ? '#ff8030' : '#ffb84a'); glow(c, 0, -145, 14, hot ? '#ff5020' : '#ffb84a', 0.7);
    if (hot) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.22 + 0.1 * sin(t * 10); rrect(c, -58, -158, 116, 86, 26, '#ff6a20'); c.restore(); }
    // 어깨 (둥근 견갑 + 주황 경고등)
    for (const sg of [-1, 1]) {
      plate(sg * 56 - 18, -164, 36, 30, 12);
      hazard(sg * 56 - 15, -140, 30, 5);
      const lit = hot || Math.floor(t * 2 + (sg > 0 ? 0.5 : 0)) % 2 === 0;
      ell(c, sg * 56, -164, 5, 4, lit ? '#ff9a30' : '#7a3a10', OUT, 1.2); if (lit) glow(c, sg * 56, -164, 12, '#ff8a20', 0.7);
    }
    // 머리 (둥근 투구 + 넓은 눈창 + 하늘빛 두 눈)
    rrect(c, -10, -160, 26, 12, 4, lin(c, 0, -160, 0, -148, '#5a6474', '#3a4250'), OUT, 1.4);   // 목 이음새
    plate(-22, -190, 50, 38, 16);
    line(c, OUT, 2, [[4, -190], [4, -200]]); ell(c, 4, -202, 3, 3, Math.floor(t * 3) % 2 ? '#ff5040' : '#6a1a14', OUT, 1);
    rrect(c, -12, -180, 38, 15, 7, '#141a22', OUT, 1.5);
    const eyeC = groggy ? (Math.floor(t * 8) % 2 ? '#ffd040' : '#3a3a10') : hot ? '#ff4020' : CY;
    for (const x of [2, 16]) { ell(c, x, -172.5, 4.5, 4, eyeC); glow(c, x, -172.5, 14, eyeC, 0.6); }
    rrect(c, -20, -160, 46, 6, 2, '#3a4250', OUT, 1.2);
    // 오른팔 드릴 (패턴 예고 때 들어 올리고, 공격 때 빠르게 회전)
    c.save(); c.translate(56, -146); c.rotate(-0.35 - raise * 0.9 + (groggy ? 0.9 : 0) - atk * 0.3);
    plate(-12, -12, 30, 24, 8); ell(c, 0, 0, 7, 7, '#3a4250', OUT, 1.5);
    plate(16, -15, 30, 30, 6, lin(c, 0, -15, 0, 15, ST, STD)); hazard(18, 8, 26, 5);
    c.translate(46, 0);
    rrect(c, 0, -20, 10, 40, 3, '#3a4250', OUT, 1.6);
    c.translate(10, 0);
    poly(c, lin(c, 0, -19, 0, 19, '#e2e6ec', '#8a929e'), [[0, -19], [70, 0], [0, 19]], OUT, 2);
    const spin = (t * (raise > 0 || atk > 0 ? 3 : 0.6)) % 1;
    c.save(); c.beginPath(); c.moveTo(0, -19); c.lineTo(70, 0); c.lineTo(0, 19); c.closePath(); c.clip();
    for (let i = -1; i < 7; i++) { const x = ((i + spin) / 6) * 66; line(c, '#5a626e', 3, [[x, -20], [x + 12, 20]]); line(c, 'rgba(255,255,255,.5)', 1, [[x + 2, -20], [x + 14, 20]]); }
    c.restore();
    if (raise > 0 || atk > 0) glow(c, 70, 0, 16, '#ffe0a0', 0.5);
    c.restore();
    // 그로기: 합선된 푸른 전기
    if (groggy) {
      glow(c, 0, -120, 80, '#5ab8ff', 0.25);
      bolt(-58, -150, -30, -110, 1); bolt(40, -160, 64, -120, 2); bolt(-20, -186, 10, -150, 3); bolt(30, -90, 60, -70, 4);
      for (let i = 0; i < 4; i++) { const a = t * 6 + i * 1.6; line(c, '#ffe060', 2, [[cos(a) * 30, -170 + sin(a) * 10], [cos(a) * 38, -174 + sin(a) * 14]]); }
    }
  });
})();
