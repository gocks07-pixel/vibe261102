'use strict';
// 1.7.8 시안 (사용자 디자인 기반): 불꽃 임프 → 마그마 도마뱀, 바위 골렘 → 광산의 심연 윔, 용암 방울 → 용암 웅덩이 슬라임
// 게임과 같은 그리기 방식 (G.MonArt[id] = {die, sh, draw(ctx, m, t, s)}), 오른쪽을 보는 모습 기준
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  // 용암 색: 라그하르트 용광로의 주황 + 금빛 심
  const LAVA = '#ff7a24', LAVA2 = '#ffc860', LAVAD = '#c03a10';

  // 데이터 (시안 미리보기용: 이름·크기만)
  Object.assign(G.MONSTERS.fire_imp, { name: '마그마 도마뱀', w: 90, h: 48, flying: false });
  Object.assign(G.MONSTERS.rock_golem, { name: '광산의 심연 윔', w: 80, h: 44 });
  Object.assign(G.MONSTERS.magma_slime, { name: '용암 웅덩이 슬라임', w: 58, h: 44 });

  // ---------------- 마그마 도마뱀 (id fire_imp) ----------------
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

  // ---------------- 용암 웅덩이 슬라임 (id magma_slime) ----------------
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

  // ---------------- 광산의 심연 윔 (id rock_golem) ----------------
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
})();
