// 보스 4차 시안: 엘드리크(사람형 · 하늘 성소의 장막 대사제) · 모르웬(숲 정령 + 연꽃) · 녹스(원래 시안을 자연스럽게)
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N4 = G.MonNew4 = {};
  const GOLD = '#c8a040';

  // ===== 엘드리크: 원래 시안(높은 관 · 한쪽 눈 은 가면 · 눈 문양 예복 · 붉은 유리 후광 · 눈 지팡이)을 사람 모양으로 =====
  //  하늘 성소를 차지한 검은 장막 교단 대사제 — 보라 · 은 · 금, 사막/태양 장식 없음
  N4.eldrick = (ctx, m, t, s) => {
    const casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff4080' : '#c060ff', SC = 1.55, HY = -86;
    ctx.scale(1.14, 1.14);
    // 뒤: 깨진 붉은 유리 후광
    ctx.save(); ctx.translate(-2, HY - 4);
    for (let i = 0; i < 11; i++) { const a = t * 0.45 + i * PI * 2 / 11, r = 36 + (i % 3) * 3; ctx.save(); ctx.translate(cos(a) * r, sin(a) * r); ctx.rotate(a + PI / 2 + sin(i) * 0.4);
      poly(ctx, 'rgba(190,30,70,.82)', [[-3.4, 2], [3, 1], [1, -10 - (i % 2) * 4], [-2, -6]], '#ff98a8', 0.7); ctx.restore(); }
    ctx.strokeStyle = 'rgba(255,110,140,.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 30, 0.3, PI * 2 - 0.5); ctx.stroke(); glow(ctx, 0, 0, 44, ec, 0.35); ctx.restore();
    // 몸: 사람 모양 (긴 머리 은발 · 수염 · 신비로운 눈)
    const look = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'side', hairColor: '#d8dcec', eye: 'sharp', eyeColor: '#b03050', skin: '#e4d4cc' }), '#3a1e62', '#22123a');
    look.beard = true;
    const sp = { trim: GOLD, glow: '#c890ff' };
    const gear = { top: { st: 'void', c: '#3a1e62', k: 'skyrobe', sp }, bottom: { st: 'void', c: '#22123a', k: 'pants', sp }, shoes: { st: 'void', c: '#1a0e2a', k: 'tallboot', sp }, gloves: { st: 'void', c: '#e8e4f0', k: 'glove', sp }, cape: { st: 'void', c: '#1a0a2a', k: 'shadow', sp } };
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: false, atk: casting ? 0.5 : -1, atkKind: 'proj', look, gear, cape: '#1a0a2a', weapon: null, scale: SC });
    // 긴 예복 자락 (발목까지) + 금 띠 + 눈 문양
    const sw = sin(t * 2) * 2;
    ctx.beginPath(); ctx.moveTo(-15, -50); ctx.quadraticCurveTo(-20, -24, -26 + sw, -2); ctx.quadraticCurveTo(0, 3, 26 + sw, -2); ctx.quadraticCurveTo(20, -24, 15, -50); ctx.closePath();
    ctx.fillStyle = vg(ctx, -50, 0, '#3a1e62', '#160a28'); ctx.fill(); ctx.strokeStyle = '#0a0418'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-24 + sw, -5); ctx.quadraticCurveTo(0, -1, 24 + sw, -5); ctx.stroke();
    line(ctx, GOLD, 1.6, [[2, -50], [2 + sw * 0.5, -4]]);
    for (const y of [-38, -20]) { ell(ctx, 2, y, 5.6, 3.2, '#ece0c0', GOLD, 1); ell(ctx, 2.4, y, 1.7, 1.7, ec); }
    rrect(ctx, -16, -54, 32, 5, 2, '#1a0e2a', GOLD, 1);   // 허리띠
    // 한쪽 눈을 가린 은 반가면 (얼굴 왼쪽 = 뒤쪽 눈)
    // 높은 관 (교단 보라 · 금 테 · 눈 문양) — 이집트 · 태양 장식 없이 뾰족한 두 갈래 관
    const hx = 1, hy = HY - 9;
    ctx.beginPath(); ctx.moveTo(hx - 17, hy + 4); ctx.quadraticCurveTo(hx - 18, hy - 22, hx - 6, hy - 40); ctx.lineTo(hx, hy - 30); ctx.lineTo(hx + 6, hy - 40); ctx.quadraticCurveTo(hx + 18, hy - 22, hx + 17, hy + 4); ctx.closePath();
    ctx.fillStyle = vg(ctx, hy - 40, hy + 4, '#6a3aa8', '#2a1450'); ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; ctx.stroke();
    rrect(ctx, hx - 18, hy - 1, 36, 6, 2, vg(ctx, hy - 1, hy + 5, '#f0d880', '#a07a20'), '#6a4a10', 1);
    line(ctx, GOLD, 1.2, [[hx, hy - 30], [hx, hy - 2]]);
    ell(ctx, hx, hy - 14, 5, 3.4, '#ece0c0', GOLD, 1); ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 8; ell(ctx, hx + 0.6, hy - 14, 1.9, 1.9, ec); ctx.restore();
    // 지팡이: 눈을 품은 은 고리
    const up = casting ? 0.55 : 0.05; ctx.save(); ctx.translate(30, -70); ctx.rotate(-0.08 - up);
    line(ctx, '#2a1a3a', 4, [[0, 66], [0, -48]]); line(ctx, '#8a7aa0', 1, [[1, 62], [1, -46]]);
    ctx.strokeStyle = '#d8dce8'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, -58, 10, 0, PI * 2); ctx.stroke();
    for (const a of [-0.6, 0.6]) line(ctx, '#d8dce8', 2, [[sin(a) * 10, -58 + cos(a) * 10], [sin(a) * 6, -46]]);
    glow(ctx, 0, -58, 20, ec, 0.85); ell(ctx, 0, -58, 5.4, 3.6, '#f0e0ff'); ell(ctx, 0.8, -58, 2, 2, '#2a0a3a'); ctx.restore();
    // 지팡이를 쥔 팔 (예복 소매 + 흰 장갑)
    ctx.beginPath(); ctx.moveTo(10, -66); ctx.quadraticCurveTo(26, -62, 31, -46); ctx.lineTo(24, -40); ctx.quadraticCurveTo(16, -54, 8, -58); ctx.closePath(); ctx.fillStyle = '#3a1e62'; ctx.fill(); ctx.strokeStyle = '#0a0418'; ctx.lineWidth = 1.2; ctx.stroke();
    line(ctx, GOLD, 1.4, [[24, -41], [31, -45]]); ell(ctx, 33 - casting * 4, -42 - casting * 3, 4.6, 4.2, '#ece8f4', '#5a5070', 1);
  };

  // ===== 모르웬: 원래 숲 정령 시안 + 연꽃 (연꽃 받침 치마 · 연꽃 왕관 · 연잎 · 떨어지는 연꽃잎) =====
  N4.morwen = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk, sway = sin(t * 1.5) * 0.04, ec = ph ? '#ff40c0' : '#d070ff';
    const PK = ph ? '#d070d8' : '#f4b0d0', PK2 = ph ? '#7a2a9a' : '#d06a9a', PW = '#fff0f6';
    // 바닥 연잎 두 장
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * w * 0.62, -3); ctx.scale(1, 0.32);
      ctx.beginPath(); ctx.arc(0, 0, w * 0.42, sg > 0 ? -2.6 : 0.5, sg > 0 ? 3.7 + 0.1 : 6.8); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#3e6a34'; ctx.fill(); ctx.strokeStyle = '#1e3a1a'; ctx.lineWidth = 2.4; ctx.stroke();
      for (let k = 0; k < 6; k++) { const a = k * PI / 3; line(ctx, '#5a8a48', 2, [[0, 0], [cos(a) * w * 0.36, sin(a) * w * 0.36]]); } ctx.restore(); }
    ctx.rotate(sway);
    // 연꽃 받침 치마: 바깥 꽃잎 → 안쪽 꽃잎
    const petal = (x, y, a, L, Wd, c1, c2) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-Wd, -L * 0.35, -Wd * 0.6, -L * 0.85, 0, -L); ctx.bezierCurveTo(Wd * 0.6, -L * 0.85, Wd, -L * 0.35, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, -L); g.addColorStop(0, c2); g.addColorStop(0.55, c1); g.addColorStop(1, PW); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(90,20,70,.7)'; ctx.lineWidth = 1; ctx.stroke();
      line(ctx, 'rgba(160,60,120,.35)', 0.8, [[0, -2], [0, -L * 0.8]]); ctx.restore(); };
    for (let i = 0; i < 9; i++) { const a = -1.35 + i * 2.7 / 8; petal(sin(a) * w * 0.18, -2, a, h * 0.3, w * 0.2, PK, PK2); }
    for (let i = 0; i < 6; i++) { const a = -0.95 + i * 1.9 / 5; petal(sin(a) * w * 0.12, -h * 0.05, a, h * 0.26, w * 0.17, PK, PK2); }
    // 몸 (원래 시안의 나무 몸, 치마 위로)
    const g = ctx.createLinearGradient(0, -h * 0.75, 0, -h * 0.2); g.addColorStop(0, '#7a8a4a'); g.addColorStop(1, '#3a4a22');
    ctx.beginPath(); ctx.moveTo(-w * 0.18, -h * 0.72); ctx.quadraticCurveTo(-w * 0.22, -h * 0.45, -w * 0.3, -h * 0.24); ctx.quadraticCurveTo(0, -h * 0.2, w * 0.3, -h * 0.24); ctx.quadraticCurveTo(w * 0.22, -h * 0.45, w * 0.18, -h * 0.72); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#1a1a0a'; ctx.lineWidth = 1.6; ctx.stroke();
    // 앞쪽 꽃잎 몇 장 (허리를 감쌈)
    for (let i = 0; i < 5; i++) { const a = -0.8 + i * 0.4; petal(sin(a) * w * 0.1, -h * 0.13, a * 0.9, h * 0.17, w * 0.13, PK, PK2); }
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 8; ctx.strokeStyle = ec; ctx.lineWidth = ph ? 2.2 : 1.4;   // 보랏빛 오염 핏줄
    for (const [a, b] of [[[0, -h * 0.66], [-w * 0.12, -h * 0.45]], [[0, -h * 0.6], [w * 0.16, -h * 0.36]], [[-w * 0.12, -h * 0.45], [-w * 0.2, -h * 0.3]]]) { ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo((a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2, ...b); ctx.stroke(); }
    ctx.restore();
    for (const sg of [-1, 1]) {   // 가지 팔 + 손끝 연꽃 봉오리
      const up = cast * 1.4 + sin(t * 2 + sg) * 0.1; ctx.save(); ctx.translate(sg * w * 0.16, -h * 0.68); ctx.rotate(-sg * (0.5 + up));
      line(ctx, '#5a4a2a', 6, [[0, 0], [0, h * 0.26]]); line(ctx, '#5a4a2a', 3, [[0, h * 0.26], [sg * 7, h * 0.36]]); line(ctx, '#5a4a2a', 2.4, [[0, h * 0.26], [-sg * 3, h * 0.37]]);
      ctx.save(); ctx.translate(sg * 7, h * 0.38); ctx.rotate(PI); for (const a of [-0.5, 0, 0.5]) petal(0, 0, a, 11, 5, PK, PK2); ctx.restore();
      if (cast > 0) glow(ctx, 0, h * 0.34, 24, '#c060ff', 0.8); ctx.restore();
    }
    // 얼굴
    ell(ctx, 0, -h * 0.79, w * 0.2, h * 0.095, vg(ctx, -h * 0.87, -h * 0.71, '#d8c098', '#a88a68'), '#4a3a20', 1.4);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 10; ell(ctx, -w * 0.06, -h * 0.8, 3.4, 2, ec); ell(ctx, w * 0.06, -h * 0.8, 3.4, 2, ec); ctx.restore();
    line(ctx, '#4a2a3a', 1.2, [[-w * 0.04, -h * 0.75], [w * 0.04, -h * 0.75]]);
    // 흐르는 잎 머리 (사이사이 연분홍 꽃잎)
    for (let i = 0; i < 12; i++) { const sg = i < 6 ? -1 : 1, j = i % 6; ctx.save(); ctx.translate(sg * (w * 0.26 + j * 2.2), -h * 0.84 + j * h * 0.075); ctx.rotate(sg * (0.3 + j * 0.08) + sin(t * 2 + i) * 0.08);
      ell(ctx, 0, 6, 3.4, 9, j % 3 === 2 ? PK : (j % 2 ? '#5a7a3a' : '#6a9a4a'), '#2a3a1a', 0.5); ctx.restore(); }
    // 가지 뿔 (원래) + 가운데 활짝 핀 연꽃 왕관
    for (const sg of [-1, 1]) { line(ctx, '#4a3a22', 3.4, [[sg * w * 0.1, -h * 0.87], [sg * w * 0.22, -h * 0.98], [sg * w * 0.2, -h * 1.08]]); line(ctx, '#4a3a22', 2.4, [[sg * w * 0.21, -h * 0.99], [sg * w * 0.34, -h * 1.04], [sg * w * 0.4, -h * 1.12]]);
      ctx.save(); ctx.translate(sg * w * 0.4, -h * 1.12); for (const a of [-0.45, 0, 0.45]) petal(0, 3, a, 8, 3.6, PK, PK2); ctx.restore(); }
    ctx.save(); ctx.translate(0, -h * 0.88);
    for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; petal(0, 0, a, h * 0.12 - abs(a) * 4, w * 0.08, PK, PK2); }
    for (let i = 0; i < 3; i++) { const a = -0.4 + i * 0.4; petal(0, 0, a, h * 0.1, w * 0.07, PW, PK); }
    glow(ctx, 0, -h * 0.05, 14, ph ? '#ff60d0' : '#ffe0f0', 0.7); ell(ctx, 0, -h * 0.03, 3, 2.2, '#ffe680', '#b08a20', 0.8); ctx.restore();
    // 떨어지는 연꽃잎
    for (let i = 0; i < 5; i++) { const yy = (t * 24 + i * 36) % (h * 0.9); ctx.save(); ctx.translate(-w * 0.55 + i * w * 0.27 + sin(t + i) * 6, -h * 0.95 + yy); ctx.rotate(t * 1.6 + i);
      ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(3.4, 0, 0, 5); ctx.quadraticCurveTo(-3.4, 0, 0, -5); ctx.fillStyle = ph ? '#c060e0' : '#f8c0dc'; ctx.fill(); ctx.restore(); }
  };

  // ===== 녹스: 원래 시안 그대로 + 자연스럽게 (어깨에서 흘러내리는 망토 · 물결 자락 · 휜 뿔 · 소매로 이어진 손) =====
  N4.nox = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase || 0 : 0, ec = ph ? '#ff40c0' : '#d070ff', br = sin(t * 1.6) * 2;
    glow(ctx, 0, -h * 0.5, h * 0.6, '#5a20a0', 0.35);
    const hand = sg => [sg * w * 1.0 + sin(t * 1.2 + sg) * 4, -h * 0.46 + sin(t * 1.6 + sg) * 9];
    // 뒤쪽 소매 (손까지 흐르는 그림자 천)
    for (const sg of [-1, 1]) { const [x, y] = hand(sg);
      ctx.beginPath(); ctx.moveTo(sg * w * 0.34, -h * 0.8 + br); ctx.bezierCurveTo(sg * w * 0.7, -h * 0.82, sg * w * 0.85, -h * 0.62, x - sg * 4, y - 10); ctx.lineTo(x - sg * 2, y + 10);
      ctx.bezierCurveTo(sg * w * 0.7, -h * 0.4, sg * w * 0.5, -h * 0.56, sg * w * 0.3, -h * 0.58); ctx.closePath();
      ctx.fillStyle = vg(ctx, -h * 0.82, -h * 0.35, '#2a1048', '#0e0520'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1; ctx.stroke(); }
    // 망토 몸: 어깨에서 넓게 흘러내리고 자락은 부드러운 물결
    ctx.save(); ctx.beginPath(); ctx.moveTo(-w * 0.32, -h * 0.8 + br); ctx.bezierCurveTo(-w * 0.62, -h * 0.6, -w * 0.82, -h * 0.25, -w * 0.9 + sin(t) * 5, -2);
    const N = 8; for (let i = 1; i <= N; i++) { const x0 = -w * 0.9 + (i - 0.5) * w * 1.8 / N, x1 = -w * 0.9 + i * w * 1.8 / N; ctx.quadraticCurveTo(x0, -14 + sin(t * 2 + i) * 4, x1 + (i === N ? sin(t + 1) * 5 : 0), -2 + sin(t * 2.4 + i) * 2); }
    ctx.bezierCurveTo(w * 0.82, -h * 0.25, w * 0.62, -h * 0.6, w * 0.32, -h * 0.8 + br); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.82, 0, '#2a1048', '#0a0418'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.6; ctx.stroke(); ctx.clip();
    for (let i = 0; i < 24; i++) { const x = ((i * 37) % 100 - 50) / 50 * w * 0.85, y = -((i * 53) % 100) / 100 * h * 0.78; ell(ctx, x, y, i % 4 ? 1 : 1.8, i % 4 ? 1 : 1.8, `rgba(255,255,255,${0.4 + 0.4 * sin(t * 2 + i)})`); }
    ctx.strokeStyle = 'rgba(10,4,24,.55)'; ctx.lineWidth = 3; for (const x of [-w * 0.4, 0, w * 0.4]) { ctx.beginPath(); ctx.moveTo(x * 0.5, -h * 0.7); ctx.quadraticCurveTo(x * 0.9, -h * 0.35, x * 1.1, 0); ctx.stroke(); }   // 천 주름
    ctx.restore();
    glow(ctx, 0, -h * 0.55 + br, 30, ec, 0.9); ctx.save(); ctx.translate(0, -h * 0.55 + br); ctx.rotate(t); poly(ctx, '#f0d0ff', [[0, -10], [7, 0], [0, 10], [-7, 0]]); ctx.restore();   // 공허 핵
    // 어깨 망토깃 (둥근 두 겹)
    for (const [ww, y, c] of [[0.5, -0.8, '#3a1a5a'], [0.4, -0.83, '#4a2a6a']]) { ctx.beginPath(); ctx.ellipse(0, h * y + br + 6, w * ww, 12, 0, PI, 0); ctx.quadraticCurveTo(0, h * y + br + 14, -w * ww, h * y + br + 6); ctx.fillStyle = vg(ctx, h * y + br - 6, h * y + br + 14, c, '#14081e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.1; ctx.stroke(); }
    // 투구: 어깨 위에 얹힌 두건형 · 휜 뿔 왕관 · 외눈
    const hy = -h * 0.88 + br;
    ctx.beginPath(); ctx.moveTo(-16, hy + 12); ctx.quadraticCurveTo(-20, hy - 16, 0, hy - 22); ctx.quadraticCurveTo(20, hy - 16, 16, hy + 12); ctx.quadraticCurveTo(0, hy + 20, -16, hy + 12); ctx.closePath();
    ctx.fillStyle = vg(ctx, hy - 22, hy + 18, '#3a1a5a', '#14081e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.4; ctx.stroke();
    for (const [x, L, a] of [[-12, 30, -0.55], [-5, 22, -0.18], [5, 22, 0.18], [12, 30, 0.55]]) { ctx.save(); ctx.translate(x, hy - 14); ctx.rotate(a); const sg = x < 0 ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(-3.4, 2); ctx.quadraticCurveTo(-2 + sg * 4, -L * 0.5, sg * 6, -L); ctx.quadraticCurveTo(2 + sg * 2, -L * 0.5, 3.4, 2); ctx.closePath(); ctx.fillStyle = vg(ctx, -L, 0, '#c890ff', '#3a1a5a'); ctx.fill(); ctx.strokeStyle = '#1a0a2a'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = '#08020e'; ctx.beginPath(); ctx.ellipse(2, hy + 2, 11, 9, 0, 0, PI * 2); ctx.fill();   // 얼굴 그늘
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 14; ell(ctx, 3, hy + 2, 6.4, 4, ec); ctx.restore(); ell(ctx, 4, hy + 2, 2.2, 3.2, '#1a0a2a');
    // 소매 끝 손 (긴 손가락이 살짝 굽음)
    for (const sg of [-1, 1]) { const [x, y] = hand(sg); ctx.save(); ctx.translate(x, y);
      glow(ctx, 0, 0, 22, ec, 0.5); ell(ctx, 0, 0, 9, 10, vg(ctx, -10, 10, '#4a2a6a', '#1a0a2a'), ec, 1.2);
      for (let i = 0; i < 4; i++) { const fx = -5 + i * 3.4; ctx.strokeStyle = '#2a1440'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx, -6); ctx.quadraticCurveTo(fx - 2, -14, fx + sg * 3, -19 + abs(i - 1.5) * 2); ctx.stroke(); }
      ctx.restore(); }
  };
})();
