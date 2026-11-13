// 보스 8차: 엘드리크 — 위엄 있고 사악한 흑마법사 (지금 그림의 색 · 차림을 바탕으로)
(function () {
  const D = G.Draw, ell = D.ell, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N7 = G.MonNew7 = {}, N8 = G.MonNew8 = {};
  const ELD = (ctx, m, t, s, F) => {
    const casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff3050' : '#a040e0', sc = m.h / 66;
    const hy = -98, hr = 32, bob = sin(t * 2) * 1;
    // 붉은 유리 조각 (지금 그림): 몸 둘레를 돌고, 뒤로 갈 때는 몸 뒤에 그림
    const shards = front => { for (let i = 0; i < 4; i++) { const a = t * 1.3 + i * PI / 2, x = cos(a) * 52, y = -m.h * 0.5 + sin(a) * 12, f = (sin(a) + 1) / 2; if ((f >= 0.5) !== front) continue;
      ctx.save(); ctx.globalAlpha *= 0.4 + 0.6 * f; ctx.translate(x, y); ctx.rotate(t * 2 + i); poly(ctx, 'rgba(200,30,70,.9)', [[-3, 3], [2, 5], [4, -2], [0, -10], [-3, -4]], '#ff98a8', 0.8); glow(ctx, 0, 0, 10, '#ff3050', 0.5); ctx.restore(); } };
    shards(false);
    // 발밑 어둠 기운 (검보라 연기)
    for (let i = 0; i < 8; i++) { const u = (t * 0.35 + i / 8) % 1, x = sin(i * 2.3) * 30 + sin(t + i) * 4; ctx.save(); ctx.globalAlpha *= 0.55 * (1 - u); ell(ctx, x, -4 - u * 34, 14 * (1 - u * 0.4), 7, i % 2 ? '#1a0828' : '#2a0e40'); ctx.restore(); }
    glow(ctx, 0, -6, 46, casting ? '#ff2050' : '#6a20b0', 0.35);
    // 뒤: 높이 선 망토 깃 (머리 뒤로 뾰족하게 솟음)
    ctx.beginPath(); ctx.moveTo(-26, -58); ctx.lineTo(-44, -96); ctx.lineTo(-34, -92); ctx.lineTo(-36, -122); ctx.lineTo(-18, -100); ctx.lineTo(0, -108); ctx.lineTo(18, -100); ctx.lineTo(34, -120); ctx.lineTo(32, -92); ctx.lineTo(42, -94); ctx.lineTo(26, -58); ctx.closePath();
    ctx.fillStyle = vg(ctx, -122, -58, '#3a0a2a', '#0a0410'); ctx.fill(); ctx.strokeStyle = '#7a1a4a'; ctx.lineWidth = 1.4; ctx.stroke();
    // 몸: 검보라 옷 · 검은 망토 · 은발 긴 머리 · 수염 · 날카로운 붉은 눈
    const P = CanvasRenderingContext2D.prototype, kf = P.fill, ks = P.stroke;
    if (F) { P.fill = function (...a) { if (/^rgba\(255, 120, 140/.test(this.fillStyle)) return; return kf.apply(this, a); }; P.stroke = function (...a) { if (this.strokeStyle === '#a0505a') return; return ks.apply(this, a); }; }
    try {
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: -1, atkKind: 'proj',
      look: F ? { gender: 'f', skin: '#ecdce0', hair: '#cfc8e4', top: '#2a1440', bottom: '#140a20', style: 'long', eye2: F.eye, eyeColor: '#e02848', hat: '#1e0e30' } : { skin: '#d8c8cc', hair: '#b8b8cc', top: '#2a1440', bottom: '#140a20', style: 'long', beard: true, eye: 'sharp', eyeColor: '#ff2040', hat: '#1e0e30' },
      weapon: null, cape: '#0a0410', scale: sc });
    } finally { P.fill = kf; P.stroke = ks; }
    // 긴 예복 자락 (발목까지, 검보라 + 핏빛 테)
    const sw = sin(t * 1.8) * 2;
    ctx.beginPath(); ctx.moveTo(-17, -48); ctx.quadraticCurveTo(-22, -22, -27 + sw, -1); ctx.quadraticCurveTo(0, 3, 27 + sw, -1); ctx.quadraticCurveTo(22, -22, 17, -48); ctx.closePath();
    ctx.fillStyle = vg(ctx, -48, 0, '#2a1440', '#0e0618'); ctx.fill(); ctx.strokeStyle = '#05020a'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#8a1a3a'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-25 + sw, -4); ctx.quadraticCurveTo(0, 0, 25 + sw, -4); ctx.stroke();
    line(ctx, '#8a1a3a', 1.6, [[2, -48], [2 + sw * 0.5, -3]]);
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; for (const x of [-10, 12]) { ctx.beginPath(); ctx.moveTo(x * 0.6, -44); ctx.quadraticCurveTo(x, -24, x * 1.3 + sw, -2); ctx.stroke(); }
    // 가슴: 교단의 눈 (붉게 빛남) + 허리띠
    ctx.fillStyle = '#0a0410'; ctx.fillRect(-17, -52, 34, 5); line(ctx, '#8a1a3a', 1, [[-17, -47], [17, -47]]);
    ell(ctx, 2, -62, 6, 3.6, '#1a0a1a', '#c03050', 1.2); ctx.save(); ctx.shadowColor = '#ff2040'; ctx.shadowBlur = 8; ell(ctx, 2.6, -62, 1.4, 2.6, '#ff3050'); ctx.restore();
    // 얼굴: 모자 그늘 · 깊게 찌푸린 눈썹 · 빛나는 붉은 눈 · 비웃는 입
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, hy, hr * 0.98, hr * 0.98, 0, 0, PI * 2); ctx.clip();
    const sg = ctx.createLinearGradient(0, hy - 14, 0, hy + 6); sg.addColorStop(0, 'rgba(20,6,30,.75)'); sg.addColorStop(1, 'rgba(20,6,30,0)'); ctx.fillStyle = sg; ctx.fillRect(-hr, hy - 16, hr * 2, 24);
    const cg = ctx.createLinearGradient(0, hy + 2, 0, hy + 20); cg.addColorStop(0, 'rgba(60,20,70,0)'); cg.addColorStop(1, 'rgba(60,20,70,.25)'); ctx.fillStyle = cg; ctx.fillRect(-hr, hy + 2, hr * 2, 22);   // 볼 그늘 (야윈 얼굴)
    ctx.restore();
    if (F) { F.face(ctx, t);
      for (const [x0, d, k] of [[-30, -1, 1], [28, 1, 0.85]]) { const sw2 = sin(t * 1.4 + d) * 2;
        ctx.beginPath(); ctx.moveTo(x0, -98); ctx.bezierCurveTo(x0 + d * 6, -80, x0 + d * 4 + sw2, -64, x0 + d * 2 + sw2, -44 * k - 6);
        ctx.quadraticCurveTo(x0 - d * 3 + sw2, -40 * k - 8, x0 - d * 6 + sw2, -50); ctx.bezierCurveTo(x0 - d * 4, -66, x0 - d * 6, -84, x0 - d * 10, -98); ctx.closePath();
        ctx.fillStyle = vg(ctx, -98, -44, '#e4e0f0', '#a8a0c8'); ctx.fill(); ctx.strokeStyle = '#7a7098'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - d * 3, -92); ctx.quadraticCurveTo(x0 + d * 1, -74, x0 + sw2, -58); ctx.stroke(); }
    } else {
    // 눈: 위 눈꺼풀이 안쪽으로 내려와 노려보는 눈 + 붉게 빛나는 눈동자
    const EY = -87, ER = 7;
    for (const [x, d] of [[-15, 1], [13, -1]]) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, EY, ER + 1, ER * 1.15 + 1, 0, 0, PI * 2); ctx.clip();
      ctx.fillStyle = '#1a0a1e'; ctx.fillRect(x - 10, EY - 12, 20, 12);   // 눈 흰자 · 큰 눈동자를 덮음
      ctx.save(); ctx.shadowColor = '#ff2040'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(x - 6, EY + 2 - d * 1.5); ctx.quadraticCurveTo(x, EY - 1, x + 6, EY + 2 + d * 1.5); ctx.quadraticCurveTo(x, EY + 7, x - 6, EY + 2 - d * 1.5); ctx.fillStyle = '#ff3050'; ctx.fill(); ctx.restore();
      ell(ctx, x + 0.5, EY + 3, 1, 2.4, '#2a0008');
      ctx.fillStyle = '#1a0a1e'; ctx.beginPath(); ctx.moveTo(x - 10, EY - 12); ctx.lineTo(x + 10, EY - 12); ctx.lineTo(x + 10, EY + (d > 0 ? 3.4 : -1)); ctx.lineTo(x - 10, EY + (d > 0 ? -1 : 3.4)); ctx.closePath(); ctx.fill();   // 위 눈꺼풀 (안쪽이 낮음)
      ctx.fillStyle = '#1a0a1e'; ctx.fillRect(x - 10, EY + 6.4, 20, 8);   // 아래도 가늘게
      ctx.restore();
      // 짙은 은빛 눈썹: 바깥은 위로, 안쪽은 눈꺼풀까지 깊게
      ctx.beginPath(); ctx.moveTo(x - d * 11, EY - 9); ctx.quadraticCurveTo(x - d * 2, EY - 9, x + d * 8, EY - 1); ctx.lineTo(x + d * 7, EY + 2); ctx.quadraticCurveTo(x - d * 2, EY - 5, x - d * 11, EY - 5.5); ctx.closePath();
      ctx.fillStyle = '#dcdcea'; ctx.fill(); ctx.strokeStyle = '#2a2034'; ctx.lineWidth = 1; ctx.stroke();
    }
    glow(ctx, -15, EY + 3, 9, '#ff2040', 0.55); glow(ctx, 13, EY + 3, 9, '#ff2040', 0.55);
    // 입: 원래 입을 수염으로 덮고 한쪽만 올라간 비웃음
    ell(ctx, 8, -71.4, 9.5, 5.4, '#b8b8cc'); ctx.strokeStyle = '#2a1020'; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1, -72); ctx.quadraticCurveTo(8, -69.5, 15, -75); ctx.stroke();
    line(ctx, 'rgba(60,40,70,.5)', 1, [[-2, -78], [-5, -73]]); line(ctx, 'rgba(60,40,70,.5)', 1, [[18, -78], [20, -74]]);   // 팔자 주름
    }
    // 높고 뾰족한 흑마법사 모자 (끝이 뒤로 꺾임 · 넓은 챙 · 핏빛 띠 · 은 해골 대신 붉은 눈 장식)
    ctx.beginPath(); ctx.moveTo(-hr * 0.98, hy - 6 + bob); ctx.quadraticCurveTo(-hr * 0.6, hy - 60, -2, hy - 92 + bob); ctx.quadraticCurveTo(-12, hy - 112, -38, hy - 114 + bob * 2);
    ctx.quadraticCurveTo(-24, hy - 100, 10, hy - 80 + bob); ctx.quadraticCurveTo(hr * 0.75, hy - 44, hr * 1.0, hy - 6 + bob); ctx.closePath();
    ctx.fillStyle = vg(ctx, hy - 112, hy, '#2a1440', '#0e0618'); ctx.fill(); ctx.strokeStyle = '#05020a'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = 'rgba(160,80,220,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-hr * 0.5, hy - 14); ctx.quadraticCurveTo(-hr * 0.2, hy - 58, -2, hy - 88); ctx.stroke();   // 모자 주름 빛
    ctx.beginPath(); ctx.moveTo(-hr * 1.55, hy + 1 + bob); ctx.quadraticCurveTo(0, hy - 14 + bob, hr * 1.55, hy + 1 + bob); ctx.quadraticCurveTo(0, hy + 6 + bob, -hr * 1.55, hy + 1 + bob); ctx.closePath();
    ctx.fillStyle = vg(ctx, hy - 10, hy + 6, '#2a1440', '#05020a'); ctx.fill(); ctx.strokeStyle = '#05020a'; ctx.stroke();   // 넓은 챙 (끝이 살짝 아래로)
    ctx.strokeStyle = '#7a1030'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-hr * 0.95, hy - 8 + bob); ctx.quadraticCurveTo(0, hy - 17 + bob, hr * 0.97, hy - 8 + bob); ctx.stroke();   // 핏빛 띠
    ell(ctx, 4, hy - 13 + bob, 4.4, 3, '#1a0a1a', '#c8a0ff', 1); ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 8; ell(ctx, 4.6, hy - 13 + bob, 1.3, 2.2, ec); ctx.restore();
    // 지팡이: 비틀린 검은 지팡이 + 갈고리 셋이 움켜쥔 어둠 구슬 (시전 때 붉게)
    const up = casting ? 0.35 : 0; ctx.save(); ctx.translate(34, -76); ctx.rotate(-0.06 - up);
    ctx.strokeStyle = '#0a0410'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 76); for (let y = 76; y >= -50; y -= 6) ctx.lineTo(sin(y * 0.2) * 0.8, y); ctx.stroke();
    ctx.strokeStyle = '#5a2a7a'; ctx.lineWidth = 1; ctx.beginPath(); for (let y = 70; y >= -48; y -= 6) ctx.lineTo(sin(y * 0.2 + 1.5) * 1.8, y); ctx.stroke();
    glow(ctx, 0, -64, 30, ec, 0.9); ell(ctx, 0, -64, 9, 9, vg(ctx, -73, -55, casting ? '#ff6080' : '#c070ff', '#1a0428'), ec, 1.6);
    for (let i = 0; i < 5; i++) { const a = t * 2 + i * 1.26; ell(ctx, cos(a) * 4, -64 + sin(a) * 4, 1, 1, 'rgba(255,220,240,.8)'); }
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 2, -50); ctx.quadraticCurveTo(sx * 16, -60, sx * 8, -76); ctx.quadraticCurveTo(sx * 11, -62, sx * 0.5, -52); ctx.closePath(); ctx.fillStyle = '#1a0a24'; ctx.fill(); ctx.strokeStyle = '#7a3aa0'; ctx.lineWidth = 0.8; ctx.stroke(); }   // 구슬을 감싸 쥔 갈고리
    ctx.restore();
    // 지팡이를 쥔 팔 (검보라 소매 · 뼈마디 손)
    const hx = 34 + 4 + up * 10, hyy = -46 - up * 6;
    ctx.beginPath(); ctx.moveTo(10, -58); ctx.quadraticCurveTo(26, -60, hx - 2, hyy - 4); ctx.lineTo(hx - 8, hyy + 5); ctx.quadraticCurveTo(18, -48, 10, -48); ctx.closePath(); ctx.fillStyle = '#2a1440'; ctx.fill(); ctx.strokeStyle = '#05020a'; ctx.lineWidth = 1.2; ctx.stroke();
    line(ctx, '#8a1a3a', 1.4, [[hx - 8, hyy + 4], [hx - 2, hyy - 3]]);
    ell(ctx, hx - 1, hyy, 4.6, 4.2, '#c8b8c4', '#3a2a38', 1); for (let i = 0; i < 3; i++) line(ctx, '#3a2a38', 0.8, [[hx - 3 + i * 2, hyy - 2], [hx - 3 + i * 2, hyy + 3]]);
    shards(true);
  };
  N7.eldrick = (ctx, m, t, s) => ELD(ctx, m, t, s, null);
  // 여성판 얼굴: 덜 사악하게 — 차갑고 우아한 눈매(반쯤 내려온 눈꺼풀 · 날개 아이라인) · 가는 눈썹 · 짙은 입술의 옅은 미소, 볼 홍조 없음
  N8.face = (ctx, t) => {
    const SK = '#dec8d1', EY = -86.5, ER = 5.8;
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -98, 31, 31, 0, 0, PI * 2); ctx.clip(); ctx.fillStyle = '#e8d6dc'; ctx.fillRect(-30, -99, 60, 4.5); for (const x of [-11, 14]) { ctx.beginPath(); ctx.ellipse(x, -91.4, 9, 2.6, 0, 0, PI * 2); ctx.fill(); } ctx.restore();   // 원래 짙은 눈썹 지움
    for (const [x, d] of [[-10.5, -1], [14, 1]]) {   // d: 바깥쪽 방향
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, EY, ER + 0.3, ER * 1.18 + 0.3, 0, 0, PI * 2); ctx.clip();
      ctx.fillStyle = SK; ctx.beginPath(); ctx.moveTo(x - 10, EY - 12); ctx.lineTo(x + 10, EY - 12); ctx.lineTo(x + 10, EY - 2.2 - d * 1.0); ctx.lineTo(x - 10, EY - 2.2 + d * 1.0); ctx.closePath(); ctx.fill();   // 반쯤 내려온 눈꺼풀 (바깥이 살짝 높음)
      ctx.fillStyle = 'rgba(120,60,130,.3)'; ctx.fillRect(x - 10, EY - 5, 20, 3.4);
      ctx.fillStyle = '#c9b3c0'; ctx.beginPath(); ctx.moveTo(x - 10, EY + 12); ctx.lineTo(x - 10, EY + 3.4 - d * 0.6); ctx.quadraticCurveTo(x, EY + 5.2, x + 10, EY + 3.4 + d * 0.6 - d * 1.2); ctx.lineTo(x + 10, EY + 12); ctx.closePath(); ctx.fill();   // 아래 눈꺼풀 (가늘고 긴 눈)   // 보랏빛 눈두덩
      ctx.restore();
      ctx.strokeStyle = '#1a0a1e'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - d * 5.5, EY - 1.4 + d * 0.4); ctx.quadraticCurveTo(x, EY - 3.2, x + d * 6.4, EY - 3.4); ctx.quadraticCurveTo(x + d * 8.2, EY - 3.8, x + d * 9.4, EY - 5.4); ctx.stroke();   // 길게 빠진 윗선 · 올라간 눈꼬리
      ctx.strokeStyle = 'rgba(60,20,50,.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - d * 3, EY + 4.3); ctx.quadraticCurveTo(x + d * 2, EY + 4.6, x + d * 6, EY + 2.6); ctx.stroke();   // 아랫선 (옅게)
      ctx.strokeStyle = '#a8a0c4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - d * 4.5, EY - 5.6); ctx.lineTo(x + d * 4, EY - 6.6); ctx.quadraticCurveTo(x + d * 7, EY - 7, x + d * 8.6, EY - 6.0); ctx.stroke();   // 가는 은빛 눈썹 (바깥이 살짝 올라감)
    }
    glow(ctx, -10.5, EY + 1, 5, '#ff6080', 0.1); glow(ctx, 14, EY + 1, 5, '#ff6080', 0.1);
    ctx.fillStyle = '#5a1a36'; ctx.beginPath(); ctx.moveTo(0.4, -77.2); ctx.quadraticCurveTo(3, -78.1, 5.6, -77.2); ctx.quadraticCurveTo(3, -76.0, 0.4, -77.2); ctx.fill();   // 다문 입술 (웃지 않음)
    ctx.strokeStyle = '#3a0a20'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(0, -76.9); ctx.quadraticCurveTo(3, -77.5, 6, -76.9); ctx.stroke();
    line(ctx, 'rgba(150,110,130,.5)', 0.9, [[3.6, -83], [4.6, -80.6]]);   // 오뚝한 코 선
  };
  N8.eldrick = (ctx, m, t, s) => ELD(ctx, m, t, s, { eye: 'f_mystic', face: N8.face });
})();
