'use strict';
// 1.7.8 시안 2: 광산 감독관 골렘 → 광석 거인 골렘(정예), 강철 거신 그라운더 MK-7 새 디자인
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };

  Object.assign(G.MONSTERS.foreman, { name: '광석 거인 골렘', w: 96, h: 110 });

  // ---------------- 광석 거인 골렘 (id foreman, 정예) ----------------
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
      c.save(); c.translate(x, -Math.max(0, o));
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
    poly(c, lin(c, 0, -156, 0, -76, STL, ST), [[-50, -156], [50, -156], [58, -140], [54, -84], [44, -74], [-44, -74], [-54, -84], [-58, -140]], OUT, 2.2);
    line(c, STD, 2, [[-50, -136], [50, -136]]); line(c, STD, 2, [[-54, -100], [54, -100]]);
    rivets([[-50, -150], [-34, -150], [34, -150], [50, -150], [-48, -82], [48, -82]]);
    hazard(-44, -96, 88, 9);
    // 가슴 명판 MK-7 + 그 위 별조각 동력 창
    rrect(c, -26, -130, 52, 28, 5, lin(c, 0, -130, 0, -102, '#d04a40', RED), OUT, 2);
    rivets([[-22, -126], [22, -126], [-22, -106], [22, -106]]);
    c.fillStyle = '#fff2d8'; c.font = 'bold 17px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MK-7', 0, -115.5);
    rrect(c, -9, -152, 18, 14, 4, '#1a2028', OUT, 1.5); ell(c, 0, -145, 5, 4, hot ? '#ff8030' : '#ffb84a'); glow(c, 0, -145, 14, hot ? '#ff5020' : '#ffb84a', 0.7);
    if (hot) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.22 + 0.1 * sin(t * 10); poly(c, '#ff6a20', [[-50, -156], [50, -156], [58, -140], [54, -84], [44, -74], [-44, -74], [-54, -84], [-58, -140]]); c.restore(); }
    // 어깨 (둥근 견갑 + 주황 경고등)
    for (const sg of [-1, 1]) {
      plate(sg * 56 - 18, -164, 36, 30, 12);
      hazard(sg * 56 - 15, -140, 30, 5);
      const lit = hot || Math.floor(t * 2 + (sg > 0 ? 0.5 : 0)) % 2 === 0;
      ell(c, sg * 56, -164, 5, 4, lit ? '#ff9a30' : '#7a3a10', OUT, 1.2); if (lit) glow(c, sg * 56, -164, 12, '#ff8a20', 0.7);
    }
    // 머리 (둥근 투구 + 넓은 눈창 + 하늘빛 두 눈)
    plate(-22, -190, 50, 38, 14);
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
