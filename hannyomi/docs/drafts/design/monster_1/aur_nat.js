(function(){const keep=G.MonArt;G.MonArt={};

// 1.7: 몬스터 전용 생김새 + 전용 움직임 후반부 (사하린 ~ 녹스게이트, 38종)
//  등록 방식은 monsters2.js 와 같다: A(id, 쓰러지는 방식, 그림자 배율, (ctx, m, t, s) => {...})
//  사람형(기사·마법사·집행자·파라칸)은 사람 그리기에 투구·후드·갑옷을 덧그린다.
//  녹스·카이엔·엘드리크·영웅의 잔영·사슬 기둥은 원래 전용 모양을 살리고 효과를 더해 다듬는다.
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, MON = D.MON, shade = (c, f) => G.Icons.shade(c, f);
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } };
  const glow = (ctx, x, y, r, c, a = 0.5) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore();
  };
  const eyes = (ctx, x, y, gap, r, pupil) => { for (const ex of [x, x + gap]) { ell(ctx, ex, y, r, r * 1.1, '#fff'); ell(ctx, ex + r * 0.3, y, r * 0.55, r * 0.7, pupil || '#1a1a22'); } };
  const human = (m, t, look, o = {}) => Object.assign({ x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look, oldHead: true }, o);   // 사람 모양 몬스터는 옛 머리 (1번 꾸미기)
  const legs4 = (ctx, w, c, run, len = 12, wd = 5, y = -12) => {
    for (const [x, ph] of [[-w * 0.45, 0], [-w * 0.22, PI], [w * 0.25, PI * 0.5], [w * 0.47, PI * 1.5]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(sin(run + ph) * 0.55); rrect(ctx, -wd / 2, 0, wd, len, 2, c); ctx.restore();
    }
  };
  const sixLegs = (ctx, c, step, x0 = 0, span = 22, lw = 2.4) => {
    for (let i = 0; i < 4; i++) for (const sg of [-1, 1]) {
      const bx = x0 - 8 + i * 6, ph = step + i * 1.4 + (sg > 0 ? PI : 0), reach = sg * (span - i * 2);
      line(ctx, c, lw, [[bx, -10], [bx + reach * 0.4, -18 + sin(ph) * 2], [bx + reach * 0.6, 0]]);
    }
  };

  // ======================= 모래바다 사하린 =======================
  // 모래 도마뱀: 목 둘레 주름 깃 + 등가시. 꼬리를 흔들며 기고, 공격 땐 깃을 활짝 편다
  A('sand_lizard', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, wk = s.walk ? sin(t * 14) : 0;
    ctx.save(); ctx.translate(-w * 0.45, -10); ctx.rotate(sin(t * 3) * 0.25);
    poly(ctx, m.d.color2, [[0, -4], [-w * 0.7, 0], [-w * 0.8, 3], [0, 4]]); ctx.restore();
    for (const [x, a] of [[-w * 0.3, wk], [-w * 0.05, -wk], [w * 0.2, -wk], [w * 0.4, wk]]) { ctx.save(); ctx.translate(x, -7); ctx.rotate(a * 0.55); rrect(ctx, -2.5, 0, 5, 8, 2, m.d.color2); ctx.restore(); }
    ell(ctx, 0, -12, w * 0.58, 8, m.d.color, m.d.color2, 2);
    for (let i = 0; i < 6; i++) poly(ctx, shade(m.d.color, -0.25), [[-w * 0.4 + i * 9, -18], [-w * 0.37 + i * 9, -24 - (i % 2) * 2], [-w * 0.34 + i * 9, -18]]);
    for (let i = 0; i < 5; i++) ell(ctx, -w * 0.35 + i * 10, -12, 2, 1.5, shade(m.d.color, -0.15));
    const fr = 0.5 + s.atk * 0.8;   // 주름 깃
    ctx.save(); ctx.translate(w * 0.5, -16); ctx.scale(fr, fr);
    for (let i = 0; i < 5; i++) { const a = -PI / 2 - 0.9 + i * 0.45; poly(ctx, i % 2 ? '#e0a040' : '#c86a30', [[0, 0], [cos(a) * 16, sin(a) * 16], [cos(a + 0.45) * 16, sin(a + 0.45) * 16]]); }
    ctx.restore();
    ell(ctx, w * 0.68, -15, 12, 7, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.74, -18, 2.6, 2.6, '#ffe060'); rrect(ctx, w * 0.735, -20, 1.4, 4, 0.5, '#111');
    line(ctx, m.d.color2, 1.5, [[w * 0.7, -12], [w * 0.88, -13]]);
  });

  // 사막 들소: 혹 + 휘어진 뿔 + 덥수룩한 갈기. 달리면 먼지가 일고, 공격 땐 머리를 숙여 돌진
  A('dune_bison', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, run = s.walk ? t * 12 : 0, dip = s.atk * 0.22;
    if (s.walk) for (let i = 0; i < 3; i++) { const p = (t * 1.5 + i / 3) % 1; ell(ctx, -w * 0.7 - p * 24, -4 - p * 10, 5 + p * 8, 3 + p * 5, `rgba(210,180,130,${0.5 * (1 - p)})`); }
    legs4(ctx, w, m.d.color2, run, 15, 7, -15);
    ctx.save(); ctx.rotate(dip);
    ell(ctx, -4, -28, w * 0.75, 15, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.12, -40, 16, 11, shade(m.d.color, -0.12));   // 혹
    ell(ctx, w * 0.35, -30, 17, 16, '#5a3a1a');                // 갈기
    for (let i = 0; i < 6; i++) line(ctx, '#4a2a10', 2, [[w * 0.2 + i * 4, -42], [w * 0.18 + i * 4, -46 - (i % 2) * 2]]);
    line(ctx, m.d.color2, 2.5, [[-w * 0.75, -28], [-w * 0.9, -20 + sin(t * 6) * 2]]);
    ell(ctx, w * 0.62, -24, 12, 11, shade(m.d.color, -0.1), m.d.color2, 2);
    ell(ctx, w * 0.8, -19, 6, 5, '#3a2a1a');
    ctx.strokeStyle = '#f0e0c0'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w * 0.55, -32); ctx.quadraticCurveTo(w * 0.4, -44, w * 0.62, -46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.7, -32); ctx.quadraticCurveTo(w * 0.85, -42, w * 0.78, -46); ctx.stroke();
    ell(ctx, w * 0.68, -27, 2, 2.2, '#111');
    ctx.restore();
  });

  // 협곡 전갈 / 사막 전갈왕: 마디 꼬리를 등 위로 말아 올린 전갈. 공격 땐 꼬리 독침을 앞으로 내리꽂는다
  const scorpion = (crown) => (ctx, m, t, s) => {
    const k = m.w / 64, step = s.walk ? t * 16 : t;
    ctx.scale(k, k);
    sixLegs(ctx, m.d.color2, step, 0, 22);
    // 집게
    const snap = s.atk > 0 ? abs(sin(t * 18)) : abs(sin(t * 2)) * 0.3;
    for (const [dy, sc] of [[-4, 0.85], [0, 1]]) {
      ctx.save(); ctx.translate(16, -12 + dy); line(ctx, m.d.color2, 3, [[0, 0], [10, -4]]);
      ctx.translate(14, -5); ctx.scale(sc, sc); ell(ctx, 0, 0, 7, 4.5, m.d.color, m.d.color2, 1.5);
      ctx.save(); ctx.rotate(-snap * 0.5); poly(ctx, m.d.color, [[3, -2], [11, -4], [9, 0]], m.d.color2, 1); ctx.restore();
      poly(ctx, m.d.color, [[3, 2], [11, 3], [8, 1]], m.d.color2, 1);
      ctx.restore();
    }
    // 몸통 마디
    for (let i = 0; i < 4; i++) ell(ctx, 8 - i * 7, -12, 8 - i * 0.6, 6.5, i % 2 ? m.d.color : shade(m.d.color, 0.08), m.d.color2, 1.5);
    ell(ctx, 12, -15, 2, 2, '#111'); ell(ctx, 15, -15, 2, 2, '#111');
    // 꼬리 (마디 5개 + 독침)
    const strike = s.atk > 0 ? sin(s.atk * PI) : 0;
    let x = -14, y = -14, a = -2.2 + sin(t * 2) * 0.08;
    for (let i = 0; i < 5; i++) {
      a += 0.42 + strike * 0.18;
      x += cos(a) * 7; y += sin(a) * 7;
      ell(ctx, x, y, 4.5 - i * 0.3, 4.5 - i * 0.3, m.d.color, m.d.color2, 1.5);
    }
    a += 0.5 + strike * 0.4;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    poly(ctx, crown ? '#ffd060' : '#2a1a10', [[0, -3], [11, 0], [0, 3]]);
    if (crown) glow(ctx, 8, 0, 12, '#ffb040', 0.7);
    ctx.restore();
    if (crown) {   // 전갈왕: 금관 + 등 장갑
      poly(ctx, '#e8c040', [[8, -19], [10, -26], [12, -21], [14, -27], [16, -21], [18, -25], [18, -18], [8, -18]], '#8a6a10', 1);
      for (let i = 0; i < 3; i++) rrect(ctx, -12 + i * 7, -19, 6, 3, 1, '#c89a30');
    }
  };
  A('canyon_scorpion', 'flip', 1, scorpion(false));
  A('scorpion_king', 'flip', 1, scorpion(true));

  // 사막 독수리: 대머리 + 목털 깃 + 넓은 날개로 활공. 공격 땐 날개를 접고 급강하
  A('vulture', 'fall', 0.5, (ctx, m, t, s) => {
    const r = m.w / 2, beat = s.atk > 0 ? -1 : sin(t * 5), dive = s.atk * 10;
    ctx.translate(0, -r + dive); ctx.rotate(s.atk * 0.4);
    for (const sg of [-1, 1]) {   // 양쪽 날개 (좌우 대칭)
      ctx.save(); ctx.translate(-2, -4); ctx.scale(sg, 1); ctx.rotate(-0.25 - beat * 0.4);
      poly(ctx, sg > 0 ? m.d.color : shade(m.d.color, -0.15), [[0, 0], [12, -10], [26, -12], [32, -6], [28, 0], [10, 4]], m.d.color2, 1.5);
      for (let i = 0; i < 4; i++) line(ctx, m.d.color2, 1.5, [[20 + i * 3, -9 + i], [26 + i * 2, -3 + i * 2]]);
      ctx.restore();
    }
    ell(ctx, 0, 0, 13, 9, m.d.color, m.d.color2, 1.5);
    ell(ctx, 9, -6, 7, 5, '#f0e6d8');   // 목털
    line(ctx, '#d8a090', 3.5, [[10, -8], [15, -14]]);
    ell(ctx, 17, -15, 4.5, 4, '#d8a090', '#8a5a4a', 1);
    poly(ctx, '#e0c060', [[20, -16], [26, -14], [21, -12]]);
    ell(ctx, 18, -16.5, 1.2, 1.2, '#111');
    poly(ctx, m.d.color2, [[-12, 0], [-20, -2], [-18, 4]]);
  });

  // 미라 / 미라 근위대: 붕대로 감긴 몸. 틈새로 빛나는 한쪽 눈, 팔을 앞으로 뻗고 비틀비틀. 풀린 붕대가 나부낀다
  const mummy = (guard) => (ctx, m, t, s) => {
    const h = m.h, wob = s.walk ? sin(t * 6) * 0.08 : sin(t * 1.5) * 0.03, step = s.walk ? sin(t * 6) : 0;
    const wrap = m.d.color, dark = m.d.color2;
    ctx.rotate(wob);
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 4, -h * 0.28); ctx.rotate((sg > 0 ? step : -step) * 0.35); rrect(ctx, -3.5, 0, 7, h * 0.28, 3, wrap, dark); ctx.restore(); }
    rrect(ctx, -10, -h * 0.62, 20, h * 0.36, 6, wrap, dark);
    ctx.strokeStyle = dark; ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { const y = -h * 0.6 + i * 4.2; ctx.beginPath(); ctx.moveTo(-10, y + (i % 2) * 2); ctx.lineTo(10, y + 3 - (i % 2) * 2); ctx.stroke(); }
    ell(ctx, 1, -h * 0.76, 11, 11, wrap, dark, 1.5);
    for (let i = 0; i < 4; i++) { const y = -h * 0.84 + i * 4; ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(11, y + 2 - i); ctx.stroke(); }
    rrect(ctx, 2, -h * 0.79, 9, 3, 1, '#1a1410');
    ell(ctx, 8, -h * 0.775, 1.8, 1.5, guard ? '#60e0ff' : '#ffd040'); glow(ctx, 8, -h * 0.775, 8, guard ? '#60e0ff' : '#ffd040', 0.6);
    // 앞으로 뻗은 팔
    const reach = 0.15 + s.atk * 0.5;
    ctx.save(); ctx.translate(6, -h * 0.55); ctx.rotate(-PI / 2 + 0.25 + reach * 0.3);
    rrect(ctx, -3, 0, 6, 16, 3, wrap, dark); ctx.restore();
    // 나부끼는 붕대
    ctx.strokeStyle = wrap; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -h * 0.5);
    for (let i = 1; i <= 4; i++) ctx.lineTo(-8 - i * 5, -h * 0.5 + i * 3 + sin(t * 5 + i) * 2); ctx.stroke();
    if (guard) {   // 근위대: 창 + 둥근 방패
      line(ctx, '#7a5a2a', 2.5, [[12, -h * 0.2], [12, -h * 1.0]]); poly(ctx, '#c8c0a0', [[9, -h * 1.0], [12, -h * 1.12], [15, -h * 1.0]]);
      ell(ctx, -9, -h * 0.45, 7, 9, '#c89a30', '#7a5a10', 1.5); ell(ctx, -9, -h * 0.45, 2.5, 2.5, '#60e0ff');
    }
  };
  A('mummy', 'crumble', 1, mummy(false));
  A('mummy_guard', 'crumble', 1, mummy(true));

  // 모래 정령: 얼굴이 떠오른 작은 모래 회오리. 모래알이 빙글빙글 돈다
  A('sand_spirit', 'melt', 0.6, (ctx, m, t, s) => {
    const h = m.h, spin = t * (s.atk > 0 ? 12 : 5);
    for (let i = 0; i < 7; i++) {
      const y = -6 - i * (h / 8), rx = 6 + i * 3.2 + sin(t * 4 + i) * 1.5;
      ctx.save(); ctx.globalAlpha *= 0.85; ell(ctx, sin(t * 3 + i) * 2, y, rx, 3.5, i % 2 ? m.d.color : shade(m.d.color, -0.1)); ctx.restore();
    }
    for (let i = 0; i < 10; i++) { const a = spin + i * 0.63, y = -8 - (i * 4.3) % (h - 10); ell(ctx, cos(a) * (8 + y * -0.25), y, 1.4, 1.4, '#a07a30'); }
    ell(ctx, 0, -h * 0.68, 7, 4, 'rgba(255,240,200,.35)');
    rrect(ctx, -6, -h * 0.72, 4, 2.5, 1, '#5a3a10'); rrect(ctx, 3, -h * 0.72, 4, 2.5, 1, '#5a3a10');
    ell(ctx, 0.5, -h * 0.6, 2.5, 1.5 + s.atk * 1.5, '#5a3a10');
  });

  // 사막 폭군 파라칸: 금빛 왕관 + 흘러내리는 두건 + 붉은 망토 + 굽은 칼. 몸 주위로 모래가 맴돈다
  A('parakan', 'flip', 0, (ctx, m, t, s) => {
    const sc = 1.7;
    for (let i = 0; i < 8; i++) { const a = t * 1.5 + i * 0.8; ell(ctx, cos(a) * 40, -40 + sin(a) * 8, 2, 2, 'rgba(230,200,120,.6)'); }
    D.humanoid(ctx, human(m, t, { skin: '#c88a5a', hair: '#3a2a1a', top: m.d.color, bottom: '#f0e8d0', style: 'short', beard: true, eye: 'sharp', eyeColor: '#ffcf40' }, { weapon: 'sword', wcolor: '#f0d070', cape: '#8a1a1a', scale: sc }));
    ctx.save(); ctx.scale(sc, sc);
    poly(ctx, '#f0e0b0', [[-13, -58], [15, -58], [16, -40], [10, -44], [-10, -44], [-16, -32], [-14, -50]], '#a08a50', 1);   // 두건
    for (let i = 0; i < 4; i++) line(ctx, '#3a6ab0', 1.5, [[-14, -50 + i * 4], [-15, -48 + i * 4]]);
    poly(ctx, '#ffd040', [[-12, -60], [-9, -70], [-4, -63], [1, -74], [6, -63], [11, -70], [14, -60]], '#a07a10', 1.2);   // 왕관
    ell(ctx, 1, -64, 2.2, 2.2, '#e04040');
    ctx.restore();
  });

  // ======================= 얼음성채 프로스트벨 =======================
  // 설원 늑대: 두툼한 목털 + 뾰족 귀 + 풍성한 꼬리. 입김을 뿜으며 달리고, 공격 땐 덮쳐 문다
  A('snow_wolf', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, run = s.walk ? t * 14 : 0, lunge = s.atk * 8;
    ctx.translate(lunge, s.walk ? -abs(sin(run)) * 3 : 0);
    ctx.save(); ctx.translate(-w * 0.6, -26); ctx.rotate(-0.6 + sin(t * 4) * 0.2);
    ell(ctx, -12, -4, 14, 6, m.d.color, m.d.color2, 1.5); ell(ctx, -22, -6, 4, 3, '#ffffff'); ctx.restore();
    legs4(ctx, w, m.d.color2, run, 15, 5, -15);
    ell(ctx, -2, -26, w * 0.62, 11, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.32, -26, 13, 14, '#ffffff', m.d.color2, 1.5);   // 목털
    ell(ctx, w * 0.6, -32, 11, 9, m.d.color, m.d.color2, 2);
    poly(ctx, m.d.color, [[w * 0.66, -32], [w * 1.02, -26], [w * 0.96, -22], [w * 0.66, -24]], m.d.color2, 1.5);
    ell(ctx, w * 1.0, -25, 2.5, 2, '#1a1a2a');
    poly(ctx, m.d.color, [[w * 0.46, -38], [w * 0.5, -52], [w * 0.58, -40]], m.d.color2, 1.2);
    poly(ctx, m.d.color, [[w * 0.6, -39], [w * 0.68, -52], [w * 0.72, -38]], m.d.color2, 1.2);
    ell(ctx, w * 0.72, -34, 2.2, 2, '#3a8ad0');
    if (s.atk > 0) poly(ctx, '#fff', [[w * 0.9, -22], [w * 0.93, -18], [w * 0.96, -22]]);
    const p = (t * 1.2) % 1; ell(ctx, w * 1.1 + p * 12, -24 - p * 6, 3 + p * 4, 2 + p * 3, `rgba(240,248,255,${0.6 * (1 - p)})`);
  });

  // 서리 박쥐: 고드름 끝이 달린 얼음 날개 + 수정 귀. 날갯짓마다 얼음 가루가 떨어진다
  A('frost_bat', 'fall', 0.5, (ctx, m, t, s) => {
    const flap = s.atk > 0 ? -0.9 : sin(t * 14), dive = s.atk * 8;
    ctx.translate(0, -m.h / 2 + dive);
    for (const sg of [-1, 1]) {
      ctx.save(); ctx.scale(sg, 1); ctx.rotate(flap * 0.45);
      ctx.fillStyle = 'rgba(170,220,255,.85)'; ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(14, -13); ctx.lineTo(25, -9); ctx.lineTo(22, 2); ctx.lineTo(17, 0); ctx.lineTo(14, 7); ctx.lineTo(9, 3); ctx.lineTo(4, 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = m.d.color2; ctx.lineWidth = 1.2; ctx.stroke();
      for (const [x, y] of [[22, 2], [14, 7], [9, 3]]) poly(ctx, '#e8f8ff', [[x - 1.5, y], [x, y + 6], [x + 1.5, y]]);
      ctx.restore();
    }
    ell(ctx, 0, 0, 8, 9, m.d.color, m.d.color2, 1.5);
    poly(ctx, '#e0f4ff', [[-6, -5], [-5, -16], [-1, -7]], '#7ab0e0', 1); poly(ctx, '#e0f4ff', [[6, -5], [5, -16], [1, -7]], '#7ab0e0', 1);
    ell(ctx, -3, -1, 1.8, 2, '#2060c0'); ell(ctx, 3, -1, 1.8, 2, '#2060c0');
    for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; ell(ctx, -6 + i * 6, 8 + p * 22, 1.3, 1.3, `rgba(230,248,255,${1 - p})`); }
  });

  // ---- 1.7.1 빙결 호수·얼음 미궁 새 몬스터 ----
  const star5 = (ctx, x, y, r, f, st) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } poly(ctx, f, p, st, 1.2); };
  const cry = (ctx, x, y, a, len, w, c1 = 'rgba(190,232,255,.95)', c2 = 'rgba(120,190,245,.8)', e = '#3f7fc4') => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    poly(ctx, c1, [[-w, 0], [-w * 0.9, -len * 0.75], [0, -len], [w * 0.9, -len * 0.75], [w, 0]], e, 1.2);
    poly(ctx, c2, [[0, 0], [0, -len], [w * 0.9, -len * 0.75], [w, 0]]); ctx.restore();
  };

  // 오로라뿔 사슴 (id ice_crab): 얼음 가지 뿔 끝의 별 결정 + 이마의 별 무늬 + 등의 오로라 털.
  //  총총 걷고, 공격 땐 머리를 숙여 뿔로 들이받는다
  A('ice_crab', 'flip', 1, (ctx, m, t, s) => {
    const k = m.h / 150; ctx.scale(k, k);
    const body = '#f2f7ff', bd = '#9fb4dc', run = s.walk ? t * 10 : 0, ch = s.atk > 0 ? sin(s.atk * PI) : 0;
    ctx.translate(ch * 14, s.walk ? -abs(sin(run)) * 3 : 0);
    for (const [x, ph, c] of [[-22, 0, '#cfdcf4'], [16, PI, '#cfdcf4'], [-10, PI, '#dfe9fb'], [26, 0, '#dfe9fb']]) {
      ctx.save(); ctx.translate(x, -34); ctx.rotate(s.walk ? sin(run + ph) * 0.4 : 0);
      rrect(ctx, -5, 0, 10, 34, 4, c, bd); ell(ctx, 0, 32, 6, 3, '#5a6f9a'); ctx.restore();
    }
    ell(ctx, 2, -44, 40, 22, body, bd, 2);
    const ag = ctx.createLinearGradient(-30, -66, 30, -50); ag.addColorStop(0, '#7ef0d0'); ag.addColorStop(0.5, '#8ab8ff'); ag.addColorStop(1, '#c99bff');
    ctx.beginPath(); ctx.moveTo(-34, -52); for (let i = 0; i <= 8; i++) ctx.lineTo(-34 + i * 8, -62 - (i % 2) * 7 + sin(t * 3 + i) * 1.5);
    ctx.lineTo(30, -56); ctx.quadraticCurveTo(0, -48, -34, -52); ctx.fillStyle = ag; ctx.globalAlpha *= 0.85; ctx.fill(); ctx.globalAlpha /= 0.85;
    ell(ctx, -36, -50 + sin(t * 4) * 1.5, 7, 6, '#fff', bd);
    // 목·머리 (목 밑동을 축으로 숙인다)
    ctx.save(); ctx.translate(30, -52); ctx.rotate(ch * 0.9 + (s.walk ? 0 : sin(t * 1.5) * 0.04)); ctx.translate(-30, 52);
    poly(ctx, body, [[22, -56], [38, -92], [50, -86], [40, -50]], bd, 2);
    ell(ctx, 46, -96, 14, 12, body, bd, 2); ell(ctx, 58, -90, 8, 6, '#f6ddea', bd); ell(ctx, 63, -91, 2, 1.6, '#5a4060');
    ell(ctx, 48, -99, 2.6, 3, '#1d2440'); ell(ctx, 49, -100, 1, 1, '#fff');
    ell(ctx, 36, -104, 6, 3, '#dfe9fb', bd);
    star5(ctx, 46, -108, 4, '#ffe680', '#c9a640'); glow(ctx, 46, -108, 12, '#ffe9a0', 0.5 + sin(t * 3) * 0.2);
    const ant = (sx, dir) => {
      line(ctx, '#bfe6ff', 4.5, [[sx, -106], [sx + dir * 6, -126], [sx + dir * 2, -146]]); line(ctx, '#bfe6ff', 3.5, [[sx + dir * 6, -126], [sx + dir * 20, -136]]);
      line(ctx, '#bfe6ff', 3, [[sx + dir * 3, -138], [sx - dir * 8, -150]]); line(ctx, 'rgba(255,255,255,.8)', 1.2, [[sx, -108], [sx + dir * 5, -125]]);
      for (const [x, y] of [[sx + dir * 2, -146], [sx + dir * 20, -136], [sx - dir * 8, -150]]) { cry(ctx, x, y, dir * 0.3, 9, 3); glow(ctx, x, y - 5, 9, '#a8e4ff', 0.45 + sin(t * 4 + x) * 0.2 + ch * 0.4); }
    };
    ant(42, -1); ant(52, 1);
    if (!ch) for (let i = 0; i < 3; i++) { const p = (t * 0.7 + i / 3) % 1; ell(ctx, 70 + p * 18, -89 - p * 6, 4 * (1 - p) + 1, 3 * (1 - p) + 1, `rgba(230,245,255,${0.6 * (1 - p)})`); }
    ctx.restore();
  });

  // 설원의 파수꾼 (id yeti): 프로스트벨 옛 순찰병의 빈 갑옷. 투구 틈과 갑옷 사이로 푸른 빛,
  //  눈꽃별 문장 둥근 방패, 창. 창을 짚고 걷다가 공격 땐 창을 앞으로 내지른다. 쓰러지면 갑옷이 무너진다
  A('yeti', 'crumble', 1, (ctx, m, t, s) => {
    const k = m.h / 172; ctx.scale(k, k);
    const mt = '#b6c6e0', mD = '#56698f', dark = '#2a3350', step = s.walk ? sin(t * 6) : 0, p = s.atk > 0 ? s.atk : 0;
    const bob = s.walk ? -abs(step) * 2 : sin(t * 2) * 0.8;
    // 망토 (흔들림)
    const sw = sin(t * 3) * 3 + step * 3;
    poly(ctx, '#3d5a9a', [[-22, -104 + bob], [22, -104 + bob], [30 + sw, -30], [22 + sw, -20], [14 + sw, -28], [4 + sw, -16], [-6 + sw, -28], [-16 + sw, -18], [-28 + sw, -30]], '#22345e', 2);
    for (const sg of [-1, 1]) {
      const o = (sg > 0 ? step : -step) * 4;
      rrect(ctx, sg * 10 - 7, -40 - Math.max(0, o), 14, 38 + Math.max(0, o) * 0, 4, mt, mD, 2); ell(ctx, sg * 10 + 2, -4 - Math.max(0, o), 10, 5, mD); ell(ctx, sg * 10, -24 - Math.max(0, o), 7, 4, '#d6e2f4', mD);
    }
    ctx.translate(0, bob);
    rrect(ctx, -22, -96, 44, 58, 12, mt, mD, 2.2); poly(ctx, '#d6e2f4', [[-14, -90], [14, -90], [8, -60], [-8, -60]]);
    rrect(ctx, -24, -46, 48, 8, 3, '#6b4a2e', '#3a2818');
    glow(ctx, 0, -62, 20, '#6fc8ff', 0.35 + sin(t * 3) * 0.12);
    for (const sg of [-1, 1]) ell(ctx, sg * 24, -94, 13, 10, '#c9d7ee', mD, 2);
    // 투구
    rrect(ctx, -17, -134, 34, 36, 12, mt, mD, 2.2); rrect(ctx, -12, -120, 24, 7, 3, dark);
    ell(ctx, -5, -116.5, 3, 2.4, '#bff4ff'); ell(ctx, 5, -116.5, 3, 2.4, '#bff4ff'); glow(ctx, 0, -117, 16, '#7fdcff', 0.6 + sin(t * 4) * 0.2 + p * 0.3);
    poly(ctx, '#3d5a9a', [[-3, -134], [3, -134], [1, -150], [8, -146], [0, -160], [-8, -146], [-1, -150]]);
    for (const [x, y] of [[-20, -128], [18, -100], [-14, -46]]) ell(ctx, x, y, 5, 2.5, 'rgba(240,250,255,.85)');
    // 창 든 팔 + 창: 평소엔 세워 짚고, 공격 땐 눕혀서 앞으로 찌른다
    const a = Math.min(1, p / 0.35) * 1.5, push = p > 0.35 ? sin((p - 0.35) / 0.65 * PI) * 18 : 0;
    ctx.save(); ctx.translate(26 + push, -64); ctx.rotate(a);
    line(ctx, '#6b4a2e', 4, [[0, 58], [0, -86]]);
    poly(ctx, '#dbe9ff', [[-6, -86], [0, -112], [6, -86], [0, -80]], mD, 1.5); glow(ctx, 0, -98, 14, '#a8e4ff', 0.4 + (push > 4 ? 0.5 : 0));
    ctx.restore();
    ctx.save(); ctx.translate(24, -94); ctx.rotate(-0.1 + a * 0.6); rrect(ctx, -5, 0, 10, 30 + push * 0.4, 4, mt, mD); ell(ctx, 0, 32 + push * 0.4, 7, 6, mD); ctx.restore();
    // 둥근 방패 (눈꽃별 문장)
    ctx.save(); ctx.translate(-28 + p * 4, -66); ell(ctx, 0, 0, 22, 24, '#9fb8e2', mD, 2.5); ell(ctx, 0, 0, 17, 19, '#dce8fb');
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * PI / 3); line(ctx, '#5a8cff', 2.4, [[0, 0], [0, -13]]); line(ctx, '#5a8cff', 1.6, [[0, -8], [-4, -12]]); line(ctx, '#5a8cff', 1.6, [[0, -8], [4, -12]]); ctx.restore(); }
    star5(ctx, 0, 0, 5, '#ffe680', '#c9a640'); ctx.restore();
  });

  // 서리 망령: 후드를 쓴 얼음 유령. 아래쪽은 찢어져 흩날리고, 손을 뻗어 냉기를 날린다
  A('frost_wraith', 'melt', 0.4, (ctx, m, t, s) => {
    const h = m.h, bob = sin(t * 2.5) * 4;
    ctx.translate(0, -8 + bob);
    ctx.globalAlpha *= 0.88;
    ctx.beginPath(); ctx.moveTo(-14, -h * 0.75);
    ctx.quadraticCurveTo(-20, -h * 0.4, -16, -6);
    for (let i = 0; i <= 6; i++) ctx.lineTo(-16 + i * 5.3, (i % 2 ? -14 : -2) + sin(t * 6 + i) * 3);
    ctx.quadraticCurveTo(20, -h * 0.4, 14, -h * 0.75); ctx.closePath();
    const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, m.d.color); g.addColorStop(1, 'rgba(200,232,255,0.1)');
    ctx.fillStyle = g; ctx.fill();
    ctx.globalAlpha /= 0.88;
    ell(ctx, 0, -h * 0.78, 13, 13, shade(m.d.color, -0.2), m.d.color2, 1.5);
    ell(ctx, 2, -h * 0.76, 9, 9, '#14202e');
    ell(ctx, -1, -h * 0.77, 2, 1.6, '#80e0ff'); ell(ctx, 5, -h * 0.77, 2, 1.6, '#80e0ff'); glow(ctx, 2, -h * 0.77, 12, '#80e0ff', 0.5);
    ctx.save(); ctx.translate(10, -h * 0.55); ctx.rotate(-0.4 - s.atk * 0.8);
    line(ctx, m.d.color, 4, [[0, 0], [12, 4]]); line(ctx, '#e8f8ff', 1.2, [[12, 4], [16, 2]]); line(ctx, '#e8f8ff', 1.2, [[12, 4], [16, 6]]);
    if (s.atk > 0) glow(ctx, 18, 4, 14, '#bfe6ff', 0.8);
    ctx.restore();
  });

  // 서리 거인 (id ice_golem, 1.7.1부터 일반 몬스터): 뿔 달린 투구 + 얼음 수염 + 털가죽 + 거대한 얼음 몽둥이
  //  (1.7의 정예 서리 거인 그림을 그대로 옮겨 크기만 맞춘다)
  A('ice_golem', 'crumble', 1, (ctx, m, t, s) => {
    ctx.scale(m.w / 90, m.h / 130);
    const step = s.walk ? sin(t * 4) : 0, swing = s.atk;
    for (const sg of [-1, 1]) { rrect(ctx, sg * 13 - 9, -38 + (sg > 0 ? step : -step) * 3, 18, 38, 7, '#8ab0d8', m.d.color2); rrect(ctx, sg * 13 - 11, -8, 22, 8, 3, '#6a4a2a'); }
    rrect(ctx, -26, -88, 52, 54, 14, m.d.color, m.d.color2);
    poly(ctx, '#8a6a4a', [[-28, -46], [28, -46], [24, -30], [-24, -30]], '#5a3a1a', 1.5);   // 털가죽 허리
    for (let i = 0; i < 6; i++) line(ctx, '#5a3a1a', 1.5, [[-22 + i * 9, -46], [-24 + i * 9, -32]]);
    ell(ctx, 2, -98, 15, 14, '#cfe8ff', m.d.color2, 1.5);
    poly(ctx, '#e8f8ff', [[-10, -92], [14, -92], [10, -72], [2, -66], [-6, -72]], '#7ab8e0', 1);   // 얼음 수염
    ell(ctx, -2, -101, 2.2, 2.2, '#1a3a6a'); ell(ctx, 7, -101, 2.2, 2.2, '#1a3a6a');
    ctx.fillStyle = '#7a8aa0'; ctx.beginPath(); ctx.ellipse(2, -106, 17, 10, 0, PI, 0); ctx.fill();
    poly(ctx, '#f0f0e8', [[-14, -108], [-26, -124], [-12, -112]]); poly(ctx, '#f0f0e8', [[16, -108], [28, -124], [14, -112]]);
    ctx.save(); ctx.translate(-26, -80); ctx.rotate(0.3 + step * 0.15); rrect(ctx, -7, 0, 14, 36, 7, m.d.color, m.d.color2); ctx.restore();
    ctx.save(); ctx.translate(26, -80); ctx.rotate(-0.7 - swing * 2.1 + swing * swing * 2.8);
    rrect(ctx, -7, 0, 14, 30, 7, m.d.color, m.d.color2);
    poly(ctx, 'rgba(190,230,255,.95)', [[-6, 28], [6, 28], [12, 70], [0, 78], [-12, 70]], '#5a8ac0', 2);
    for (const [x, y] of [[-8, 52], [8, 58], [0, 70]]) poly(ctx, '#e8f8ff', [[x - 3, y], [x, y - 8], [x + 3, y]]);
    ctx.restore();
  });

  // 서리비늘 골렘 (id frost_giant, 정예): 둥근 바위 몸에 서리용 하이델의 비늘이 여러 장 박혀 빛난다.
  //  어깨엔 눈과 얼음 결정, 몸엔 오래된 별 문양. 공격 땐 두 주먹을 들어 내려찍고 얼음 파편이 튄다
  A('frost_giant', 'crumble', 1, (ctx, m, t, s) => {
    const k = m.h / 132; ctx.scale(k, k);
    const st = '#8fa5c8', stD = '#4d6390', step = s.walk ? sin(t * 4) : 0, p = s.atk > 0 ? s.atk : 0;
    const raise = p < 0.55 ? p / 0.55 : Math.max(0, 1 - (p - 0.55) / 0.15), slam = p > 0.6 ? (p - 0.6) / 0.4 : 0;
    const scale = (x, y, r, a = 1) => { ctx.save(); ctx.translate(x, y); ctx.scale(r, r); poly(ctx, '#bfeaff', [[0, -16], [12, -2], [0, 14], [-12, -2]], '#3f7fc4', 2); poly(ctx, '#7cc4f0', [[0, -16], [12, -2], [0, 14]]); ctx.restore(); glow(ctx, x, y, 26 * r, '#80d8ff', a); };
    for (const sg of [-1, 1]) { const o = (sg > 0 ? step : -step) * 3; rrect(ctx, sg * 16 - 11, -38 - Math.max(0, o), 22, 38, 7, st, stD, 2); ell(ctx, sg * 16, -3 - Math.max(0, o), 13, 5, stD); }
    ctx.rotate(step * 0.03);
    poly(ctx, st, [[-40, -48], [-30, -100], [0, -112], [32, -100], [42, -50], [24, -34], [-24, -34]], stD, 2.5);
    poly(ctx, 'rgba(255,255,255,.18)', [[-30, -100], [0, -112], [10, -96], [-20, -88]]);
    line(ctx, 'rgba(140,220,255,.7)', 1.5, [[-28, -60], [-18, -52], [-22, -42]]); line(ctx, 'rgba(140,220,255,.7)', 1.5, [[28, -62], [20, -50], [26, -42]]);
    const pulse = 0.55 + sin(t * 3) * 0.2 + raise * 0.3;
    scale(0, -74, 1, pulse); scale(-22, -88, 0.45, pulse * 0.6); scale(24, -66, 0.4, pulse * 0.6); scale(-16, -50, 0.35, pulse * 0.5);
    for (const sg of [-1, 1]) { ell(ctx, sg * 34, -96, 16, 8, '#f4f9ff', '#b8cbef'); cry(ctx, sg * 36, -100, sg * 0.5, 16, 5); cry(ctx, sg * 28, -102, sg * 0.15, 11, 4); }
    rrect(ctx, -14, -128, 28, 22, 8, '#a3b8da', stD, 2); ell(ctx, 0, -128, 14, 5, '#f4f9ff');
    ell(ctx, -6, -117, 3, 2.5, '#bff4ff'); ell(ctx, 6, -117, 3, 2.5, '#bff4ff'); glow(ctx, -6, -117, 8, '#9ff', 0.7); glow(ctx, 6, -117, 8, '#9ff', 0.7);
    for (const sg of [-1, 1]) {
      ctx.save(); ctx.translate(sg * 42, -88); ctx.rotate(sg * (-0.15 - raise * 2.5) + (sg > 0 ? -step : step) * 0.12);
      rrect(ctx, -11, 0, 22, 34, 8, st, stD, 2); rrect(ctx, -12, 10, 24, 6, 3, '#cfeaff');
      ell(ctx, 0, 42, 16, 13, '#9fb3d6', stD, 2); for (const x of [-7, 0, 7]) line(ctx, stD, 1.4, [[x, 36], [x, 46]]);
      ctx.restore();
    }
    if (slam > 0) {
      glow(ctx, 50, -6, 34, '#a0e8ff', 0.8 * (1 - slam));
      for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.38, d = slam * 40; poly(ctx, '#e0f6ff', [[48 + cos(a) * d - 3, -2 + sin(a) * d], [48 + cos(a) * d, -10 + sin(a) * d], [48 + cos(a) * d + 3, -2 + sin(a) * d]], '#7ab8e0', 1); }
    }
  });

  // 교단 간부 카이엔 (보스) / 분신: 원래 모습에 검은 기운과 서리 낀 검을 더한다
  A('kaien_boss', 'flip', 0, (ctx, m, t, s) => {
    const breath = m.boss && m.boss.cur && m.boss.cur.p && m.boss.cur.p.type === 'cut';
    for (let i = 0; i < 6; i++) { const a = t * 2 + i; glow(ctx, sin(a) * 24, -60 + cos(a * 1.3) * 26, 14, 'rgba(90,40,140,.9)', 0.35); }
    MON.kaien(ctx, m, t);
    if (breath || (m.boss && m.boss.raise > 0)) glow(ctx, 30, -62, 30, '#9ae8ff', 0.7);
  });
  A('kaien_clone', 'melt', 0, (ctx, m, t, s) => {
    ctx.save(); ctx.globalAlpha *= 0.5; ctx.translate(-8, 0); MON.kaien(ctx, m, t - 0.15); ctx.restore();
    MON.kaien(ctx, m, t);
    for (let i = 0; i < 3; i++) { const p = (t * 1.2 + i / 3) % 1; ell(ctx, -6 + i * 6, -10 - p * 70, 5 * (1 - p) + 1, 5 * (1 - p) + 1, `rgba(40,30,60,${0.5 * (1 - p)})`); }
  });

  // ======================= 하늘섬 아에로스 =======================
  // 폭풍 골렘: 돌과 금속 몸 + 머리의 피뢰침. 몸의 홈을 따라 번개가 흐른다
  A('storm_golem', 'crumble', 1, (ctx, m, t, s) => {
    ctx.scale(m.w / 64, m.h / 92);
    const step = s.walk ? sin(t * 5) : 0, slam = s.atk, flick = Math.floor(t * 12) % 3;
    for (const sg of [-1, 1]) rrect(ctx, sg * 10 - 7, -24 + (sg > 0 ? step : -step) * 2, 14, 24, 4, shade(m.d.color, -0.2), m.d.color2);
    rrect(ctx, -22, -66, 44, 44, 8, m.d.color, m.d.color2);
    ctx.strokeStyle = '#ffe060'; ctx.lineWidth = 2; ctx.shadowColor = '#ffe060'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(-14, -60); ctx.lineTo(-6, -50 + flick); ctx.lineTo(-12, -42); ctx.lineTo(-2, -30);
    ctx.moveTo(14, -60); ctx.lineTo(6, -48 - flick); ctx.lineTo(12, -40); ctx.lineTo(4, -28); ctx.stroke(); ctx.shadowBlur = 0;
    rrect(ctx, -12, -84, 26, 20, 5, shade(m.d.color, 0.1), m.d.color2);
    rrect(ctx, -2, -78, 14, 4, 2, '#1a1a2a'); ell(ctx, 2, -76, 1.8, 1.4, '#ffe060'); ell(ctx, 8, -76, 1.8, 1.4, '#ffe060');
    line(ctx, '#c0c8d8', 2, [[1, -84], [1, -98]]); ell(ctx, 1, -99, 3, 3, '#ffe060'); glow(ctx, 1, -99, 10, '#ffe060', 0.4 + flick * 0.2);
    for (const sg of [-1, 1]) {
      const a = sg > 0 ? -0.2 - slam * 1.7 + slam * slam * 2.3 : 0.2 + step * 0.2;
      ctx.save(); ctx.translate(sg * 24, -60); ctx.rotate(a); rrect(ctx, -6, 0, 12, 26, 5, m.d.color, m.d.color2); ell(ctx, 0, 30, 8, 7, shade(m.d.color, 0.1), m.d.color2, 1.5);
      if (sg > 0 && slam > 0.5) glow(ctx, 0, 30, 18, '#ffe060', 0.8);
      ctx.restore();
    }
  });

  // 별의 기사 / 암흑 기사: 사람 위에 투구·갑옷·방패를 덧그린다
  const knight = (o) => (ctx, m, t, s) => {
    D.humanoid(ctx, human(m, t, { skin: '#d8c8b8', hair: '#3a3a4a', top: m.d.color, bottom: m.d.color2, style: 'short' }, { weapon: 'sword', wcolor: o.blade, cape: o.cape }));
    rrect(ctx, -10, -36, 20, 12, 4, o.plate, shade(o.plate, -0.4));                 // 가슴 갑옷
    ell(ctx, 0, -31, 3, 3, o.gem); if (o.glow) glow(ctx, 0, -31, 8, o.gem, 0.6);
    ell(ctx, 1, -51, 14, 14, o.plate, shade(o.plate, -0.4), 1.5);                   // 투구
    rrect(ctx, 3, -54, 12, 4, 2, '#14141a');
    ell(ctx, 7, -52, 1.6, 1.2, o.eye); ell(ctx, 12, -52, 1.6, 1.2, o.eye);
    if (o.horns) { poly(ctx, '#5a5a6a', [[-8, -60], [-16, -72], [-4, -63]]); poly(ctx, '#5a5a6a', [[8, -62], [12, -75], [12, -61]]); }
    else { ctx.fillStyle = o.plume; ctx.beginPath(); ctx.moveTo(-2, -64); ctx.quadraticCurveTo(-14, -74 + sin(t * 4) * 2, -18, -60); ctx.quadraticCurveTo(-8, -64, -2, -64); ctx.fill(); }
    ctx.save(); ctx.translate(-9, -26); ell(ctx, 0, 0, 7, 10, o.shield, shade(o.shield, -0.4), 1.5);
    if (!o.horns) { ctx.fillStyle = '#ffe680'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 1.8 : 4.2; ctx.lineTo(cos(a) * r, sin(a) * r); } ctx.fill(); }
    else ell(ctx, 0, 0, 2.5, 2.5, '#c03040');
    ctx.restore();
  };
  A('star_knight', 'flip', 0, knight({ plate: '#d8e0f4', gem: '#80c0ff', glow: true, eye: '#a0e0ff', plume: '#5a7ad0', shield: '#c0c8e0', blade: '#e8f0ff', cape: '#3a4a8a' }));

  // 장막의 대사제 엘드리크 (보스): 원래 모습 + 머리 뒤 검은 후광 + 주위를 도는 타락한 별조각
  A('eldrick', 'flip', 0, (ctx, m, t, s) => {
    const casting = m.boss && (m.boss.cur || m.boss.raise > 0);
    ctx.save(); ctx.translate(0, -m.h * 0.86);
    ctx.strokeStyle = casting ? '#ff4080' : '#8a40d0'; ctx.lineWidth = 3; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = t * 0.8 + i * PI / 4; line(ctx, ctx.strokeStyle, 2, [[cos(a) * 22, sin(a) * 22], [cos(a) * 30, sin(a) * 30]]); }
    ctx.shadowBlur = 0; ctx.restore();
    MON.priest(ctx, m, t);
    for (let i = 0; i < 3; i++) {
      const a = t * 1.6 + i * 2.1, x = cos(a) * 42, y = -m.h * 0.55 + sin(a) * 12;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i);
      poly(ctx, '#c03050', [[0, -8], [4, 0], [0, 8], [-4, 0]], '#5a1020', 1); glow(ctx, 0, 0, 10, '#ff4060', 0.5);
      ctx.restore();
    }
  });

  // ======================= 녹스게이트 =======================
  // 공허의 그림자: 연기처럼 일렁이는 검은 형체 + 보랏빛 눈. 가장자리가 흩어진다
  A('void_shade', 'melt', 0.3, (ctx, m, t, s) => {
    const h = m.h, bob = sin(t * 2) * 4;
    ctx.translate(s.atk * 8, -6 + bob);
    for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2 + t; ell(ctx, cos(a) * 10, -h * 0.5 + sin(a) * 14, 10 + sin(t * 3 + i) * 2, 12, 'rgba(30,15,50,.55)'); }
    ell(ctx, 0, -h * 0.55, 14, 20, '#1a0a2a');
    ell(ctx, 0, -h * 0.82, 10, 10, '#1a0a2a');
    ell(ctx, -2, -h * 0.83, 2.6, 1.6, '#d080ff'); ell(ctx, 5, -h * 0.83, 2.6, 1.6, '#d080ff'); glow(ctx, 1, -h * 0.83, 12, '#c060ff', 0.6);
    for (let i = 0; i < 4; i++) { const p = (t * 0.8 + i / 4) % 1; ell(ctx, -10 + i * 6, -h * 0.3 + p * 20, 3 * (1 - p), 3 * (1 - p), `rgba(40,20,70,${1 - p})`); }
    ctx.save(); ctx.translate(10, -h * 0.55); ctx.rotate(-0.3 - s.atk * 0.8); line(ctx, '#1a0a2a', 5, [[0, 0], [14, 2]]); line(ctx, '#2a1a3a', 2, [[14, 2], [19, -1]]); line(ctx, '#2a1a3a', 2, [[14, 2], [19, 5]]); ctx.restore();
  });

  // 영웅의 잔영 (시련·녹스 소환): 원래 모습 + 등 뒤 별빛 후광 + 흩날리는 별가루
  const echo = (ctx, m, t, s) => {
    glow(ctx, 0, -40, 34, '#7ab8ff', 0.4);
    ctx.save(); ctx.translate(0, -66); ctx.strokeStyle = 'rgba(200,230,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 14, 0, PI * 2); ctx.stroke(); ctx.restore();
    MON.echo(ctx, m, t);
    for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i / 4) % 1; ell(ctx, -10 + i * 7, -10 - p * 60, 1.4, 1.4, `rgba(220,240,255,${1 - p})`); }
  };
  A('trial_echo', 'melt', 0, echo);
  A('hero_echo', 'melt', 0, echo);

  // 봉인의 사슬 기둥 (녹스): 원래 기둥 + 둘레를 도는 봉인 문자
  A('void_pillar', 'crumble', 0, (ctx, m, t, s) => {
    MON.pillar(ctx, m, t);
    ctx.save(); ctx.translate(0, -m.h * 0.45);
    for (let i = 0; i < 6; i++) { const a = t * 1.5 + i * PI / 3, x = cos(a) * 34, y = sin(a) * 8; if (sin(a) < 0) continue; ctx.fillStyle = 'rgba(216,222,248,.85)'; ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.fillText('✦', x, y); }
    ctx.restore();
  });

  // 타락한 별조각 (엘드리크): 떠 있는 붉은 수정 조각. 금이 가 있고 위험할수록 빠르게 깜빡인다
  A('corrupt_shard', 'pop', 0.6, (ctx, m, t, s) => {
    const h = m.h, bob = sin(t * 2.5) * 5, blink = 0.55 + 0.45 * sin(t * (4 + (1 - m.hp / m.maxHp) * 10));
    ctx.translate(0, -10 + bob);
    glow(ctx, 0, -h * 0.5, h * 0.6, '#ff3050', 0.35 + blink * 0.35);
    poly(ctx, m.d.color, [[0, -h], [m.w * 0.42, -h * 0.55], [m.w * 0.2, -h * 0.05], [-m.w * 0.2, -h * 0.05], [-m.w * 0.42, -h * 0.55]], m.d.color2, 2);
    poly(ctx, 'rgba(255,160,180,.5)', [[0, -h * 0.95], [m.w * 0.15, -h * 0.55], [0, -h * 0.2], [-m.w * 0.1, -h * 0.55]]);
    line(ctx, '#2a0610', 1.5, [[-6, -h * 0.75], [2, -h * 0.6], [-4, -h * 0.45], [4, -h * 0.3]]);
    ell(ctx, 0, -h * 0.55, 4, 4, `rgba(255,240,240,${blink})`);
  });

  // 공허의 군주 녹스 (최종 보스): 원래 모습을 살리고 공허 입자·떠 있는 별조각 파편·광폭화 붉은 기운을 더해 다듬는다
  A('nox', 'melt', 0, (ctx, m, t, s) => {
    const ph = m.boss ? m.boss.phase : 0, rage = m.boss && m.boss.enraged;
    for (let i = 0; i < 10; i++) { const p = (t * 0.4 + i / 10) % 1, a = i * 2.4; ell(ctx, cos(a) * (40 + p * 50), -m.h * 0.5 - p * 90, 2.5 * (1 - p) + 0.5, 2.5 * (1 - p) + 0.5, rage ? `rgba(255,80,80,${1 - p})` : `rgba(190,120,255,${1 - p})`); }
    if (rage) glow(ctx, 0, -m.h * 0.55, m.w * 1.4, '#ff2040', 0.4 + sin(t * 8) * 0.15);
    MON.nox(ctx, m, t);
    if (ph >= 1) for (let i = 0; i < 4; i++) {
      const a = t * 0.9 + i * PI / 2, x = cos(a) * m.w * 0.85, y = -m.h * 0.6 + sin(a) * 18;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); poly(ctx, ph >= 2 ? '#ff4080' : '#a060ff', [[0, -7], [3, 0], [0, 7], [-3, 0]]); ctx.restore();
    }
  });

  // ======================= 1.7.2 하늘섬 아에로스 개편 =======================
  // 별자리 깃새 (id comet_spirit): 밤하늘색 날개의 별자리 + 혜성 꼬리 3줄기 + 별 세 개 달린 금빛 볏.
  //  날갯짓마다 별자리가 반짝이고, 공격 땐 혜성처럼 앞으로 돌진한다
  A('comet_spirit', 'fall', 0.4, (ctx, m, t, s) => {
    const k = m.w / 70; ctx.scale(k, k); ctx.translate(s.atk * 10, -28);
    const flap = sin(t * 8) * 0.45, GOLD = '#c9a640';
    for (const [col, o] of [['#7ea0ff', 0], ['#b58cff', 4], ['#ffe08a', -4]]) {
      ctx.strokeStyle = col; ctx.globalAlpha *= 0.8; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-8, 6); ctx.bezierCurveTo(-20, 12 + o, -30, 14 + o + sin(t * 4) * 2, -44, 22 + o); ctx.stroke(); ctx.globalAlpha /= 0.8;
    }
    for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; star5(ctx, -40 - p * 14, 22 + p * 10, 1.6, `rgba(255,246,200,${1 - p})`); }
    const wing = (rot, col) => {
      ctx.save(); ctx.translate(-2, -4); ctx.rotate(rot);
      poly(ctx, col, [[0, 0], [-10, -16], [-30, -26], [-26, -18], [-34, -16], [-24, -8], [-28, -4], [-12, 2]], GOLD, 1.2);
      const pts = [[-8, -6], [-15, -12], [-23, -16], [-20, -8]];
      line(ctx, 'rgba(220,230,255,.7)', 0.8, pts);
      for (const [x, y] of pts) { star5(ctx, x, y, 1.6, '#fff6c0'); }
      ctx.restore();
    };
    wing(-0.2 - flap, '#2a3486');
    ell(ctx, 0, 0, 14, 11, '#2e3a90', GOLD, 1.5); ell(ctx, 3, 3, 8, 6, '#4a5ac0'); star5(ctx, 3, 3, 3, '#ffe08a', GOLD);
    ell(ctx, 13, -8, 8, 7, '#4a5cc8', GOLD, 1.5);
    ell(ctx, 16, -9, 2, 2.2, '#fff6c0'); ell(ctx, 16.5, -9, 0.9, 1.3, '#1a1a3a');
    poly(ctx, '#ffd060', [[20, -8], [27, -6], [20, -4]], '#a8781a', 0.8);
    for (const [x, a] of [[9, -0.6], [12, -0.3], [15, 0]]) { const tx = x + sin(a) * 7, ty = -14 - cos(a) * 7; line(ctx, GOLD, 1, [[x, -14], [tx, ty]]); star5(ctx, tx, ty, 2, '#fff6c0', GOLD); }
    wing(0.15 + flap, '#3a46a8');
    glow(ctx, 0, 0, 20, '#a8b8ff', 0.25 + s.atk * 0.4);
  });

  // 뇌운 거인 (id storm_guardian, 정예): 하반신이 번개 치는 먹구름, 구름 머리칼·수염, 흰·금 천공 갑옷과 날개 견갑,
  //  가슴의 푸른 보석, 별 고리 창. 창을 들어 올리면 고리에서 앞쪽으로 번개가 내리친다
  A('storm_guardian', 'melt', 0.8, (ctx, m, t, s) => {
    const k = m.h / 210; ctx.scale(k, k);
    const bob = sin(t * 2) * 3, lift = s.atk, GOLD = '#c9a640', GD = '#7a5a20';
    const bolt = (pts, wd = 2) => { line(ctx, 'rgba(170,200,255,.5)', wd + 4, pts); line(ctx, '#fff6b0', wd, pts); };
    for (const [x, y, r] of [[-30, -10, 22], [0, -4, 26], [30, -10, 22], [-16, -30, 22], [16, -30, 22], [0, -46, 22]]) ell(ctx, x + sin(t * 3 + x) * 2, y, r, r * 0.8, '#7c88b8', '#4a5486', 2);
    if (sin(t * 5) > 0.6) bolt([[-28, -6], [-22, -16], [-28, -24], [-18, -34]]);
    ctx.translate(0, bob);
    poly(ctx, '#3a4fa0', [[-34, -150], [34, -150], [46, -60], [26, -50], [0, -58], [-26, -50], [-46, -60]], '#22306a', 2);
    poly(ctx, '#9fb0dc', [[-36, -150], [36, -150], [30, -96], [22, -62], [-22, -62], [-30, -96]], '#4d5c94', 2.2);
    poly(ctx, '#f2e6c0', [[-26, -140], [26, -140], [20, -104], [0, -92], [-20, -104]], '#a8884a', 2);
    poly(ctx, '#c0c8ff', [[0, -130], [8, -118], [0, -104], [-8, -118]], '#5a6ad0', 2); glow(ctx, 0, -118, 20, '#c0c8ff', 0.7);
    rrect(ctx, -26, -70, 52, 9, 3, GOLD, GD); star5(ctx, 0, -65.5, 5, '#fff2a0', '#a8884a');
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 36, -146); ctx.scale(sg, 1);
      for (let i = 0; i < 4; i++) poly(ctx, i % 2 ? '#ffffff' : '#e8eefc', [[0, 0], [16 + i * 7, -14 - i * 4], [22 + i * 8, -4 - i * 3], [8, 6]], '#8a98c8', 1.3);
      ell(ctx, 4, 4, 15, 11, '#f2e6c0', '#a8884a', 2); ctx.restore(); }
    ctx.save(); ctx.translate(-40, -136); ctx.rotate(0.35); rrect(ctx, -10, 0, 20, 40, 9, '#9fb0dc', '#4d5c94'); ell(ctx, 0, 46, 11, 10, '#9fb0dc', '#4d5c94', 2); ctx.restore();
    for (const [x, y] of [[-14, -190], [0, -196], [14, -190], [-20, -176], [20, -176]]) ell(ctx, x, y, 11, 10, '#ffffff', '#b8c4ea', 1.5);
    ell(ctx, 0, -172, 16, 17, '#a8b8e2', '#4d5c94', 2);
    for (const [x, y, r] of [[-12, -158, 9], [0, -150, 11], [12, -158, 9], [-6, -142, 7], [6, -142, 7], [0, -134, 6]]) ell(ctx, x, y, r, r * 0.9, '#ffffff', '#b8c4ea', 1.3);
    poly(ctx, '#4d5c94', [[-12, -180], [-3, -177], [-3, -174], [-12, -176]]); poly(ctx, '#4d5c94', [[12, -180], [3, -177], [3, -174], [12, -176]]);
    ell(ctx, -7, -171, 3, 2.4, '#fff6b0'); ell(ctx, 7, -171, 3, 2.4, '#fff6b0'); glow(ctx, 0, -171, 14, '#fff6b0', 0.6);
    rrect(ctx, -15, -188, 30, 5, 2, GOLD, GD); star5(ctx, 0, -186, 4, '#fff2a0', '#a8884a');
    // 창 든 팔: 공격 땐 들어 올렸다가 앞으로 내림
    ctx.save(); ctx.translate(42, -136); ctx.rotate(-0.25 - lift * 0.9);
    rrect(ctx, -10, 0, 20, 40, 9, '#9fb0dc', '#4d5c94'); ell(ctx, 0, 46, 11, 10, '#9fb0dc', '#4d5c94', 2);
    ctx.translate(0, 46); ctx.rotate(0.25 + lift * 0.9 - lift * 0.5);
    line(ctx, GOLD, 5, [[0, 50], [0, -110]]); line(ctx, '#fff2c0', 1.5, [[0, 40], [0, -100]]);
    ctx.save(); ctx.translate(0, -122); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 13, 0, PI * 2); ctx.stroke();
    star5(ctx, 0, 0, 7, '#fff6b0', GOLD); glow(ctx, 0, 0, 24 + lift * 14, '#fff6b0', 0.8); ctx.restore();
    ctx.restore();
    if (lift > 0.55) bolt([[70, -200], [62, -150], [80, -110], [66, -60], [84, -4]], 3);
    else if (sin(t * 3.3) > 0.85) bolt([[44, -250], [36, -272], [48, -286]]);
  });

  // 천공룡 아우렐리온 (id aurelion, 1.7.2 천공 성소 1단계 보스). 오른쪽을 본 측면, 기준 크기 220×200
  //  엘드리크에게 조종당하는 동안 별조각·별 고리·결정·눈이 보랏빛. 풀려나면(쓰러짐·녹스전 등장) 흰빛·금빛
  //  boss.raise = 포효(고개 들기), soarY = 천공 비상 높이(날갯짓이 빨라짐)
  const aurelionArt = (c, t, corrupt, raise, fl) => {
  const BODY = '#ece9ff', SHD = '#c3bdf0', LN = '#7a72c4', GOLD = '#f2c862', GOLDD = '#a8801e';
  const GEM = corrupt ? '#c070ff' : '#dfe6ff', GEM2 = corrupt ? '#7a2ad0' : '#9fb0ff', GLOW = corrupt ? '#b050ff' : '#fff0b0';
  const br = Math.sin(t * 2) * 1.5, flap = Math.sin(t * (fl ? 7 : 2.2)) * (fl ? 0.22 : 0.1);
  const legN = (x, top, col, k = 1) => {   // 자연스러운 용 다리: 둥근 허벅지 → 앞으로 굽은 정강이 → 발
    ell(c, x, top + 6, 13 * k, 16 * k, col, LN, 1.6);
    c.beginPath(); c.moveTo(x - 8 * k, top + 10); c.quadraticCurveTo(x - 12 * k, top + 26, x - 2 * k, -10); c.lineTo(x + 9 * k, -10); c.quadraticCurveTo(x + 4 * k, top + 26, x + 9 * k, top + 10); c.closePath();
    c.fillStyle = col; c.fill(); c.strokeStyle = LN; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); c.ellipse(x + 5 * k, -5, 13 * k, 6, 0, PI, 0); c.lineTo(x + 18 * k, -1); c.lineTo(x - 8 * k, -1); c.closePath(); c.fillStyle = col; c.fill(); c.stroke();
    for (const d of [-4, 4, 12]) poly(c, GOLD, [[x + d * k, -1], [x + (d + 5) * k, 2], [x + (d + 3) * k, -4]], GOLDD, 1);
  };
  // 발밑 구름
  if (!fl)   for (const [x, y, r] of [[-70, -4, 18], [-40, 0, 22], [0, 2, 24], [40, 0, 22], [74, -4, 16]]) ell(c, x, y, r, r * .5, 'rgba(240,238,255,.9)', 'rgba(170,160,230,.6)', 1.2);
  // 날개 (뼈대 + 막). sg: 0 뒤 / 1 앞
  const wing = (ox, oy, k, back, rot) => {
    c.save(); c.translate(ox, oy); c.rotate(rot + flap); c.scale(k, k);
    const P = [[0, 0], [-30, -60], [-70, -100], [-128, -112]];
    const F = [[-128, -112], [-140, -60], [-112, -18], [-70, 4]];   // 손가락 끝
    const mg = c.createLinearGradient(0, -110, -120, 0); mg.addColorStop(0, back ? '#cfc8f6' : '#f2f0ff'); mg.addColorStop(1, back ? '#a9a0e6' : '#cdc6f4');
    c.beginPath(); c.moveTo(0, 0); for (const p of P.slice(1)) c.lineTo(...p);
    c.quadraticCurveTo(-130, -90, F[1][0], F[1][1]); c.quadraticCurveTo(-118, -42, F[2][0], F[2][1]); c.quadraticCurveTo(-84, -20, F[3][0], F[3][1]); c.quadraticCurveTo(-30, -6, 0, 0); c.closePath();
    c.fillStyle = mg; c.fill(); c.strokeStyle = LN; c.lineWidth = 1.6; c.stroke();
    // 막 안쪽 금빛 테
    c.strokeStyle = 'rgba(242,200,98,.75)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-128, -112); c.quadraticCurveTo(-130, -90, -140, -60); c.quadraticCurveTo(-118, -42, -112, -18); c.quadraticCurveTo(-84, -20, -70, 4); c.stroke();
    const sh2 = c.createRadialGradient(0, 0, 4, 0, 0, 120); sh2.addColorStop(0, 'rgba(90,80,170,.25)'); sh2.addColorStop(1, 'rgba(90,80,170,0)'); c.fillStyle = sh2; c.fill();
    for (const f of F.slice(1)) { c.strokeStyle = back ? '#b8b0e8' : '#d8d2fa'; c.lineWidth = 2; c.beginPath(); c.moveTo(...P[2]); c.quadraticCurveTo((P[2][0] + f[0]) / 2 - 6, (P[2][1] + f[1]) / 2 - 8, f[0], f[1]); c.stroke(); }
    const bone = (w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -40, -30, -60); c.quadraticCurveTo(-46, -84, -70, -100); c.quadraticCurveTo(-100, -116, -128, -112); c.stroke(); };
    bone(6, GOLDD); bone(3.8, GOLD); for (const p of P.slice(1)) ell(c, p[0], p[1], 3.6, 3.6, GOLD, GOLDD, 1.2);
    poly(c, GOLD, [[-128, -112], [-140, -124], [-126, -118]], GOLDD, 1);
    c.restore();
  };
  wing(-14, -100, 0.92, true, -0.25);
  // 꼬리 (뒤로 흐르다 끝이 말려 올라감 + 깃 술)
  c.lineCap = 'round';
  const tail = [[-40, -50], [-80, -36], [-112, -26], [-136, -38], [-142, -60]];
  for (const [w, col] of [[24, LN], [20, BODY]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...tail[0]); c.bezierCurveTo(-90, -30, -130, -10, -136, -38); c.stroke(); c.lineWidth = w * 0.55; c.beginPath(); c.moveTo(-136, -38); c.quadraticCurveTo(-142, -52, -142, -62); c.stroke(); }
  for (let i = 0; i < 4; i++) { c.save(); c.translate(-142, -62); c.rotate(-2.1 + i * 0.35 + Math.sin(t * 3) * 0.05); ell(c, 0, -12, 4, 13, i % 2 ? '#fff' : '#ddd8ff', LN, 1.1); c.restore(); }
  for (let i = 0; i < 4; i++) poly(c, GOLD, [[-68 - i * 18, -44 + i * 3], [-62 - i * 18, -54 + i * 3], [-58 - i * 18, -42 + i * 3]], GOLDD, 1);
  // 뒷다리 (웅크림)
  ell(c, -34, -44, 26, 28, SHD, LN, 1.8); legN(-40, -36, SHD, 1.05);
  // 몸통
  c.save(); c.translate(-6, -64 + br * 0.6); c.rotate(-0.2);
  ell(c, 0, 0, 52, 30, BODY, LN, 2);
  ell(c, 10, 12, 40, 14, '#f8f3e4');   // 배
  for (let i = 0; i < 5; i++) line(c, '#ddd2b6', 1, [[-14 + i * 12, 4], [-12 + i * 12, 24]]);
  c.restore();
  // 앞 날개 아래의 앞다리
  legN(10, -46, SHD, 0.85); legN(30, -50, BODY, 0.95);
  // 목 (S자로 솟음)
  const neck = [[22, -78], [40, -110], [44, -130], [58, -146]];
  for (const [w, col] of [[30, LN], [26, BODY]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...neck[0]); c.bezierCurveTo(46, -104, 34, -126, 58 + br * 0.3, -146 + br); c.stroke(); }
  c.strokeStyle = '#f8f3e4'; c.lineWidth = 10; c.beginPath(); c.moveTo(32, -78); c.bezierCurveTo(54, -102, 44, -122, 66, -138 + br); c.stroke();
  // 등 갈기 (금빛 가시)
  for (let i = 0; i < 6; i++) { const u = i / 5, x = 14 + u * 30, y = -84 - u * 58; poly(c, GOLD, [[x - 4, y + 4], [x - 12, y - 6], [x + 2, y - 2]], GOLDD, 1); }
  // 가슴의 하늘의 별조각
  c.save(); c.translate(36, -92); c.rotate(-0.3);
  poly(c, GOLD, [[-10, -16], [10, -16], [12, 2], [0, 14], [-12, 2]], GOLDD, 1.6);
  poly(c, GEM, [[0, -13], [7, -1], [0, 11], [-7, -1]], GEM2, 1.6); poly(c, GEM2, [[0, -13], [7, -1], [0, 11]]);
  c.restore(); glow(c, 36, -92, 24 + Math.sin(t * 3) * 3, GLOW, 0.75);
  if (corrupt) for (const [a, b] of [[[30, -84], [20, -70]], [[42, -98], [52, -108]], [[28, -98], [18, -106]]]) line(c, 'rgba(160,70,230,.8)', 1.6, [a, [ (a[0] + b[0]) / 2 + 3, (a[1] + b[1]) / 2 ], b]);
  // 머리
  c.save(); c.translate(62 + br * 0.3, -150 + br - raise * 10); c.rotate(0.08 - raise * 0.45);
  // 뿔 (뒤로 휘는 금빛 뿔 두 쌍)
  for (const [x, k, col] of [[-6, 1, GOLDD], [2, 0.8, GOLD]]) { c.save(); c.translate(x, -8); c.scale(k, k);
    c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-18, -8, -34, -26); c.quadraticCurveTo(-20, -14, 4, -4); c.closePath(); c.fillStyle = col === GOLDD ? '#d8ac40' : GOLD; c.fill(); c.strokeStyle = GOLDD; c.lineWidth = 1.2; c.stroke(); c.restore(); }
  c.beginPath(); c.moveTo(-16, 2); c.quadraticCurveTo(-14, -14, 4, -14); c.quadraticCurveTo(22, -14, 30, -8); c.lineTo(46, -4); c.quadraticCurveTo(52, 0, 46, 6); c.lineTo(26, 10); c.quadraticCurveTo(4, 18, -10, 12); c.closePath();
  c.fillStyle = BODY; c.fill(); c.strokeStyle = LN; c.lineWidth = 1.8; c.stroke();
  c.beginPath(); c.moveTo(24, 8); c.lineTo(44, 5); c.quadraticCurveTo(40, 14, 24, 14); c.closePath(); c.fillStyle = '#f8f3e4'; c.fill(); c.stroke();
  line(c, GOLD, 2.2, [[2, -14], [30, -8]]);   // 콧등 금빛 선
  ell(c, 44, -2, 1.6, 1.2, LN);
  // 눈 (날카롭게)
  poly(c, '#2a2a5a', [[4, -4], [12, -9], [20, -6], [12, -2]]);
  poly(c, corrupt ? '#d070ff' : '#ffd86a', [[7, -5], [12, -8], [17, -6], [12, -3]]); ell(c, 12, -5.5, .8, 2.2, '#20103a');
  glow(c, 12, -6, 10, corrupt ? '#c050ff' : '#fff0a0', 0.8);
  // 뺨 깃
  for (let i = 0; i < 3; i++) poly(c, i % 2 ? '#ddd8ff' : '#fff', [[-10, 2 + i * 3], [-26, -2 + i * 6], [-12, 6 + i * 3]], LN, 1);
  c.restore();
  // 일곱 별 고리 (머리 위)
  c.save(); c.translate(56 + br * 0.3, -186 + br + Math.sin(t * 1.5) * 2);
  c.strokeStyle = corrupt ? 'rgba(190,110,255,.9)' : 'rgba(255,224,140,.95)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 30, 8, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = corrupt ? 'rgba(190,110,255,.3)' : 'rgba(255,224,140,.35)'; c.lineWidth = 8; c.stroke();
  for (let i = 0; i < 7; i++) { const a = t * 0.8 + i * Math.PI * 2 / 7, x = Math.cos(a) * 30, y = Math.sin(a) * 8; star5(c, x, y, 3.6 + (y > 0 ? 1 : 0), corrupt ? '#e0b0ff' : '#fff4c0', corrupt ? '#7a2ad0' : GOLDD); }
  c.restore();
  // 앞 날개
  wing(4, -104, 0.72, false, 0.42);
  // 떠다니는 별조각 결정
  for (const [x, y, k] of [[-120, -150, 1], [100, -110, .8], [-20, -190, .7]]) { const yy = y + Math.sin(t * 2 + x) * 4;
    c.save(); c.translate(x, yy); c.scale(k, k); poly(c, corrupt ? 'rgba(200,140,255,.9)' : 'rgba(225,230,255,.95)', [[0, -14], [6, 0], [0, 14], [-6, 0]], corrupt ? '#7a2ad0' : '#8a90e0', 1.4); poly(c, corrupt ? 'rgba(140,60,220,.7)' : 'rgba(170,180,255,.7)', [[0, -14], [6, 0], [0, 14]]); c.restore(); glow(c, x, yy, 14, GLOW, .6); }
  };
  A('aurelion', 'none', 0, (ctx, m, t, s) => {
    const raise = m.boss ? m.boss.raise : 0, fl = (m.soarY || 0) > 20;
    ctx.translate(0, -(m.soarY || 0) - s.die * 90);
    if (m.purified) { /* 하늘을 나는 연출: 그림자 없음 */ }
    else if (fl) { ctx.save(); ctx.translate(0, m.soarY); ctx.globalAlpha *= 0.4; ell(ctx, 0, 0, m.w * 0.4, 8, 'rgba(0,0,0,.6)'); ctx.restore(); }
    else ell(ctx, 0, 0, m.w * 0.45, 9, 'rgba(0,0,0,.25)');
    const k = m.h / 200; ctx.scale(k, k);
    aurelionArt(ctx, t, !(m.purified || m.dead), raise, fl);
    if (m.dead) glow(ctx, 30, -100, 120 * (0.5 + s.die), '#fff0b0', 0.6 * (1 - s.die * 0.5));
  });

  // ======================= 1.7.3 아에로스 3종 (사용자 디자인 기반) =======================
  // 하늘 여우(cloud_sheep) · 날개 구름양(sky_fairy) · 천공의 부엉이(thunder_bird). 자체 도우미를 쓰도록 블록으로 감싼다
  {
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const LN = '#9097dc', W = '#f7f7ff', LAV = '#c9cdf6', PERI = '#8e9cf6', GOLD = '#f5c86a', GOLD2 = '#ffe2a0', GD = '#c09030';

  // ---------------- 하늘 여우 (id cloud_sheep) ----------------
  // 큰 머리 + 크고 뾰족한 귀(안쪽 금빛) + 큰 눈 + 몽실한 가슴털 + 가는 다리(뒷다리는 연보라)
  // + 몸보다 큰 두 갈래 구름 꼬리 (위 꼬리는 C자로 솟고, 아래 꼬리는 둥글게 뒤로). 하얀색 → 하늘빛 그라데이션
  A('cloud_sheep', 'flip', 1, (c, m, t, s) => {
    const k = m.h / 64; c.scale(k, k);
    const run = s.walk ? t * 12 : 0, lunge = sin(s.atk * PI);
    c.translate(lunge * 8, s.walk ? -Math.abs(sin(run)) * 2 : 0);
    const sway = sin(t * 2.5) * 0.06;
    // 아래 꼬리 (둥글게 뒤로, 끝이 위로 말림)
    c.save(); c.translate(-8, -22); c.rotate(sway);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-14, 16, -44, 12, -44, -8); c.quadraticCurveTo(-44, -20, -34, -24);
    c.quadraticCurveTo(-38, -16, -32, -12); c.quadraticCurveTo(-26, -18, -22, -10); c.quadraticCurveTo(-12, -4, 0, -6); c.closePath();
    c.fillStyle = lin(c, 0, -4, -40, 4, W, PERI); c.fill(); c.strokeStyle = LN; c.lineWidth = 1.2; c.stroke();
    line(c, 'rgba(255,255,255,.75)', 1.4, [[-26, -14], [-30, -6], [-36, -4]]);
    c.restore();
    // 위 꼬리 (크게 C자로 솟아 끝이 앞으로 말림)
    c.save(); c.translate(-8, -28); c.rotate(-sway);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-24, 4, -40, -16, -34, -34); c.bezierCurveTo(-30, -46, -16, -50, -4, -46);
    c.quadraticCurveTo(-14, -42, -14, -36); c.quadraticCurveTo(-8, -38, -6, -32); c.quadraticCurveTo(-18, -28, -16, -18); c.quadraticCurveTo(-10, -8, 2, -8); c.closePath();
    c.fillStyle = lin(c, -2, -6, -34, -30, W, PERI); c.fill(); c.strokeStyle = LN; c.lineWidth = 1.2; c.stroke();
    line(c, 'rgba(255,255,255,.75)', 1.4, [[-22, -36], [-26, -28]]); line(c, 'rgba(255,255,255,.6)', 1.2, [[-28, -18], [-22, -12]]);
    c.restore();
    for (let i = 0; i < 4; i++) { const p = (t * 0.5 + i / 4) % 1; glow(c, -38 - p * 12, -60 + p * 24 + i * 4, 3.5, '#d6deff', 1 - p); }
    // 다리 (뒷다리 연보라)
    for (const [x, ph, col] of [[-8, 0, LAV], [6, PI, LAV], [-2, PI, W], [12, 0, W]]) {
      c.save(); c.translate(x, -15); c.rotate(s.walk ? sin(run + ph) * 0.45 : 0); rrect(c, -2.4, 0, 4.8, 15, 2.4, col, LN); ell(c, 0.8, 14.6, 3, 1.6, col, LN, 1); c.restore();
    }
    // 몸 + 가슴털
    ell(c, 0, -21, 15, 9.5, W, LN, 1.4);
    poly(c, W, [[6, -30], [16, -32], [20, -24], [18, -19], [16, -14], [13, -18], [11, -13], [8, -18], [5, -15]], LN, 1.1);
    // 머리 (크게)
    c.save(); c.translate(14, -38); c.rotate(-lunge * 0.2);
    for (const [x, rot, sc] of [[-6, -0.22, 0.95], [3, 0.12, 1]]) {
      c.save(); c.translate(x, -7); c.rotate(rot); c.scale(sc, sc);
      poly(c, W, [[-6, 2], [-2, -22], [6, 2]], LN, 1.3); poly(c, lin(c, 0, 0, 0, -18, GOLD, GOLD2), [[-3, -1], [-1.5, -17], [3, -1]]);
      c.restore();
    }
    // 뺨 털(뒤쪽 들쭉날쭉)
    poly(c, W, [[-10, -2], [-15, 4], [-10, 5], [-12, 10], [-6, 8], [-2, 11], [0, 4]], LN, 1.1);
    poly(c, W, [[4, -2], [17, 2.6], [15.5, 4.6], [4, 7.5]], LN, 1.2);   // 주둥이: 얼굴 뒤에서 끝만 살짝 나오게
    ell(c, 0, 0, 11.5, 10, W, LN, 1.4);
    ell(c, 9, 4, 4, 2.6, W);   // 얼굴과 주둥이 이음새를 덮음
    ell(c, 16.6, 3.2, 1.5, 1.2, '#262848');
    ell(c, 5, -1, 2.3, 3.1, '#1a1a36'); ell(c, 5.8, -2.3, 0.8, 0.9, '#fff');
    c.restore();
  });

  // ---------------- 날개 구름양 (id sky_fairy) ----------------
  // 몽실몽실 구름 몸 (연보라 그림자) + 크고 둥근 흰 얼굴(눈 둘) + 양옆의 큰 금빛 말린 뿔 + 등에 솟은 흰 깃털 날개
  A('sky_fairy', 'melt', 0.6, (c, m, t, s) => {
    const k = m.w / 64; c.scale(k, k);
    const bob = sin(t * 2.6) * 3, flap = sin(t * 8) * 0.35;
    c.translate(sin(s.atk * PI) * 12, -30 + bob);
    // 날개 (뒤 → 몸 → 앞)
    const wing = (x, y, rot, sc, back) => { c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
      for (let i = 4; i >= 0; i--) { c.save(); c.rotate(-0.95 + i * 0.2); const L = 30 - i * 3.5;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-5, -L * 0.55, 0, -L); c.quadraticCurveTo(5, -L * 0.55, 0, 0); c.closePath();
        c.fillStyle = lin(c, 0, 0, 0, -L, back ? '#c9cdf6' : '#e6e9ff', '#ffffff'); c.fill(); c.strokeStyle = LN; c.lineWidth = 1; c.stroke(); c.restore(); }
      c.restore(); };
    wing(-4, -14, -0.25 - flap, 0.85, true);
    // 구름 몸
    for (const [x, y, r] of [[-22, 6, 8], [-14, 10, 10], [-2, 12, 11], [10, 10, 9], [-18, -4, 10], [-6, -8, 12], [6, -2, 11], [-10, 2, 12]])
      ell(c, x, y, r, r * 0.86, lin(c, x, y - r, x, y + r, '#ffffff', '#c3c8f6'), LN, 1.1);
    for (const [x, y] of [[-24, 14], [-8, 18], [6, 17]]) ell(c, x, y, 5, 3, '#c3c8f6');
    // 뒤쪽 뿔
    const horn = (x, y, sc, a) => { c.save(); c.translate(x, y); c.scale(sc, sc);
      c.beginPath(); for (let i = 0; i <= 26; i++) { const an = a - i / 26 * PI * 2.1, r = 10 - i * 0.3; const px = cos(an) * r, py = sin(an) * r; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.strokeStyle = GD; c.lineWidth = 8; c.lineCap = 'round'; c.stroke(); c.strokeStyle = lin(c, -10, -10, 10, 10, GOLD2, GOLD); c.lineWidth = 6; c.stroke();
      c.strokeStyle = 'rgba(160,110,30,.6)'; c.lineWidth = 0.8; c.stroke(); c.restore(); };
    horn(25, -9, 0.95, PI * 0.2); horn(3, -9, 1.1, PI * 0.9);   // 뿔은 얼굴 양옆 뒤로
    // 얼굴
    ell(c, 15, 0, 13, 12, '#ffffff', LN, 1.4);
    ell(c, 15, 6, 10, 4, 'rgba(220,224,255,.6)');
    ell(c, 15, -1, 1.9, 2.9, '#1a1a36'); ell(c, 23, -1, 1.9, 2.9, '#1a1a36'); ell(c, 15.6, -2.3, .7, .8, '#fff'); ell(c, 23.6, -2.3, .7, .8, '#fff');
    wing(-2, -16, 0.15 + flap, 1, false);
    if (s.atk > 0) glow(c, 26, -2, 16, '#fff0b0', s.atk * 0.6);
  });

  // ---------------- 천공의 부엉이 (id thunder_bird) ----------------
  // 정면 모습: 연보라 머리 + 흰 얼굴 + 큰 검은 눈 + 작은 금빛 부리 + 귀깃, 흰 가슴의 파란 다이아 무늬 3개,
  // 양옆으로 넓게 펼친 연보라 날개(층층이 깃털), 금빛 발. 날갯짓하며 떠 있다가 깃털 화살을 쏠 때 날개를 크게 편다
  A('thunder_bird', 'fall', 0.5, (c, m, t, s) => {
    const k = m.h / 60; c.scale(k, k);
    const bob = sin(t * 2.4) * 3, beat = sin(t * 6) * 0.25, spread = s.atk;
    c.translate(0, -32 + bob);
    const wing = (sg) => { c.save(); c.translate(sg * 9, -10); c.scale(sg, 1); c.rotate(-0.15 - beat - spread * 0.3);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(18, -20, 44, -24); c.lineTo(40, -16); c.lineTo(46, -12); c.lineTo(38, -6); c.lineTo(42, -1); c.lineTo(32, 2); c.lineTo(34, 7); c.lineTo(22, 8); c.quadraticCurveTo(10, 10, 2, 8); c.closePath();
      c.fillStyle = lin(c, 0, 0, 44, -20, '#e8eaff', '#9aa6f2'); c.fill(); c.strokeStyle = LN; c.lineWidth = 1.2; c.stroke();
      for (const [x0, y0, x1, y1] of [[10, -4, 30, -14], [10, 0, 28, -2], [8, 4, 22, 5]]) line(c, 'rgba(255,255,255,.75)', 1.2, [[x0, y0], [x1, y1]]);
      c.restore(); };
    wing(-1); wing(1);
    // 꼬리깃
    for (const x of [-4, 0, 4]) ell(c, x, 18, 2.6, 5, '#b8bff4', LN, 1);
    // 몸
    ell(c, 0, 2, 14, 17, lin(c, 0, -15, 0, 19, '#c4caf6', '#a6b0ee'), LN, 1.4);
    ell(c, 0, 4, 10, 13, '#ffffff');
    for (const [x, y] of [[-4, 0], [4, 0], [0, 7]]) { poly(c, '#7d8ff0', [[x, y - 3.4], [x + 2.4, y], [x, y + 3.4], [x - 2.4, y]]); }
    glow(c, 0, 4, 12, '#a8c0ff', 0.2 + spread * 0.5);
    // 머리
    ell(c, 0, -17, 13, 11, '#b8bff4', LN, 1.4);
    poly(c, '#b8bff4', [[-11, -22], [-15, -31], [-5, -26]], LN, 1.1); poly(c, '#b8bff4', [[11, -22], [15, -31], [5, -26]], LN, 1.1);
    c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(-11, -26, -11, -16); c.quadraticCurveTo(-10, -8, 0, -7); c.quadraticCurveTo(10, -8, 11, -16); c.quadraticCurveTo(11, -26, 0, -24); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    ell(c, -5, -16, 2.5, 3.4, '#1a1a36'); ell(c, 5, -16, 2.5, 3.4, '#1a1a36'); ell(c, -4.2, -17.4, .8, .9, '#fff'); ell(c, 5.8, -17.4, .8, .9, '#fff');
    poly(c, GOLD, [[-1.6, -13], [1.6, -13], [0, -9.5]], GD, 0.8);
    for (const x of [-4, 4]) line(c, GOLD, 2, [[x, 18], [x, 22]]), line(c, GOLD, 1.6, [[x - 2, 23], [x, 22], [x + 2, 23]]);
    if (spread > 0.5) glow(c, 0, -4, 24, '#c8d8ff', spread * 0.8);
  });

  }

  // ======================= 1.7.4 녹스게이트 6종 (사용자 디자인 기반) =======================
  // 균열 거미(rift_beast) · 공허의 감시안(dark_knight, 1.7.6) ·  · 장막의 사제(cult_mage) · 그림자 집행관(executor, 정예)
  // · 공허 성기사(void_serpent) · 녹스의 전령(abyss_eye). 자체 도우미를 쓰도록 블록으로 감싼다
  {
  const line = (c, col, w, pts) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const poly = (c, f, pts, s, lw) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.5; c.stroke(); } };
  const glow = (c, x, y, r, col, a = 0.5) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const lin = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };

  // ---------------- 균열 거미 (id rift_beast) ----------------
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

  // ---------------- 공허의 감시안 (id dark_knight, 1.7.6에서 그림자 수호병을 교체) ----------------
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

  // ---------------- 장막의 사제 (id cult_mage) ----------------
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


  // ---------------- 그림자 집행관 (id executor, 정예) ----------------
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

  }
})();

G.MonArtN=Object.assign(G.MonArtN||{},{aurelion:G.MonArt.aurelion});G.MonArt=keep;})();