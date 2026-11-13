// 보스 5차 시안: 3차 시안(G.MonNew3) 기준 — 엘드리크(이집트 장식 빼고 설정에 맞게) · 모르웬(꽃의 여왕 → 연꽃) · 녹스(그림자 날개 마법왕을 자연스럽게)
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N5 = G.MonNew5 = {};

  // ===== 엘드리크: 3차 사람 모양 그대로, 옷만 설정에 맞게 =====
  //  하늘 성소(천공 성소)의 대사제였다가 검은 장막 교단에 넘어간 사람 → 하늘 성소의 흰 사제복 + 교단의 검은 장막 망토 + 공허 고리 관
  //  빠진 것: 태양 사제 옷(넓은 금 목깃 · 태양 문양) · 짧은 치마 · 샌들 · 팔찌
  N5.eldrick = (ctx, m, t, s) => {
    const casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff4080' : '#c060ff';
    // 뒤: 깨진 붉은 유리 조각들 (해 모양 · 둥근 판 없이, 크기 · 각도가 제각각인 조각이 천천히 떠돎)
    ctx.save(); ctx.translate(-4, -122);
    const SH = [[-0.3, 34, 1.1], [0.5, 30, 0.8], [1.2, 38, 1], [2.0, 31, 0.7], [2.6, 36, 1.2], [3.3, 33, 0.9], [3.9, 39, 0.8], [4.6, 30, 1], [5.3, 36, 0.75]];
    SH.forEach(([a0, r, k], i) => { const a = a0 + sin(t * 0.6 + i) * 0.08, rr = r + sin(t * 1.2 + i * 2) * 2; ctx.save(); ctx.translate(cos(a) * rr, sin(a) * rr * 0.9); ctx.rotate(a * 1.7 + i); ctx.scale(k, k);
      poly(ctx, 'rgba(190,30,70,.78)', [[-4, 3], [2, 5], [5, -2], [1, -12 - (i % 3) * 2], [-3, -6]], '#ff98a8', 0.8); line(ctx, 'rgba(255,210,220,.7)', 0.8, [[-1, 2], [1, -8]]); ctx.restore(); });
    glow(ctx, 0, 0, 40, casting ? '#ff4080' : '#a03060', 0.3); ctx.restore();
    const look = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'long', hairColor: '#e0e4f0', eye: 'mystic', eyeColor: '#c03040', skin: '#e8d8d0' }), '#f4f1e8', '#2a1a3a');
    look.beard = true;
    const sp = { trim: '#9a70d8', glow: '#c890ff' }, vsp = { trim: '#c890ff', glow: '#b070ff' };
    const gear = {
      hat: { st: 'void', c: '#2a1a4a', k: 'voidhalo', sp: vsp },
      top: { st: 'sky', c: '#f4f1e8', k: 'skyrobe', sp },
      bottom: { st: 'sky', c: '#3a2a5a', k: 'pants', sp },
      shoes: { st: 'void', c: '#2a1a3a', k: 'tallboot', sp: vsp },
      gloves: { st: 'sky', c: '#f4f1e8', k: 'glove', sp },
      cape: { st: 'void', c: '#1a0a2a', k: 'shadow', sp: vsp },
    };
    if (G.ITEMS.wp90_mage) gear.weapon = G.Outfit.gearOf({ weapon: { tid: 'wp90_mage' } }).weapon;
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: m.moving, atk: casting ? 0.5 : -1, atkKind: 'proj', look, gear, hatColor: '#2a1a4a', cape: '#1a0a2a', weapon: 'wand', wcolor: '#c890ff', scale: 1.55 });
    // 가슴의 교단 눈 문양 (하늘 사제복 위에 덧단 검은 장막의 표식)
    ell(ctx, 3, -44, 5.4, 3.4, '#ece0ff', '#5a3a8a', 1); ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 6; ell(ctx, 3.6, -44, 1.8, 1.8, ec); ctx.restore();
  };

  // ===== 모르웬: 3차 꽃의 여왕 → 연꽃의 여왕 =====
  //  꽃잎 치마 → 겹겹이 핀 연꽃 · 장미 왕관 → 연꽃 왕관 · 가시 덩굴 → 연꽃 줄기 채찍(끝에 봉오리) · 바닥 연잎 · 꽃가루 그대로
  N5.morwen = (ctx, m, t, s) => {
    ctx.scale(1.35, 1.35); const h = m.h / 1.1, w = m.w / 2 / 1.1, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk;
    const PK = ph ? '#c070d8' : '#f2a8cc', PK2 = ph ? '#6a1a8a' : '#c0508a', PW = ph ? '#f0d8ff' : '#fff2f8';
    const petal = (x, y, a, L, Wd, c1, c2, c3) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-Wd, -L * 0.3, -Wd * 0.7, -L * 0.8, 0, -L); ctx.bezierCurveTo(Wd * 0.7, -L * 0.8, Wd, -L * 0.3, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, -L); g.addColorStop(0, c2); g.addColorStop(0.5, c1); g.addColorStop(1, c3 || PW); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(90,20,70,.55)'; ctx.lineWidth = 0.9; ctx.stroke();
      line(ctx, 'rgba(150,50,110,.3)', 0.7, [[0, -2], [0, -L * 0.8]]); ctx.restore(); };
    // 바닥 연잎
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * w * 0.7, -2); ctx.scale(1, 0.3); ctx.beginPath(); ctx.arc(0, 0, w * 0.4, sg > 0 ? -2.4 : 0.7, sg > 0 ? 3.9 : 7.0); ctx.lineTo(0, 0); ctx.closePath();
      ctx.fillStyle = '#3e6a34'; ctx.fill(); ctx.strokeStyle = '#1e3a1a'; ctx.lineWidth = 2.6; ctx.stroke(); for (let k = 0; k < 6; k++) line(ctx, '#5a8a48', 2, [[0, 0], [cos(k * PI / 3) * w * 0.34, sin(k * PI / 3) * w * 0.34]]); ctx.restore(); }
    // 연꽃 치마: 바깥(크게 · 진하게) → 가운데 → 안쪽(작고 하얗게), 꽃잎 끝이 위로 모임
    for (let i = 0; i < 11; i++) { const a = -1.45 + i * 2.9 / 10; petal(sin(a) * w * 0.25, -1, a, h * 0.3 - abs(a) * 4, w * 0.2, PK, PK2); }
    for (let i = 0; i < 8; i++) { const a = -1.05 + i * 2.1 / 7; petal(sin(a) * w * 0.16, -h * 0.04, a, h * 0.28, w * 0.18, PK, PK2); }
    // 줄기 몸
    ctx.beginPath(); ctx.moveTo(-6, -h * 0.2); ctx.quadraticCurveTo(-10, -h * 0.45, -8, -h * 0.66); ctx.lineTo(8, -h * 0.66); ctx.quadraticCurveTo(10, -h * 0.45, 6, -h * 0.2); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.66, -h * 0.2, '#7aa04a', '#3a5a2a'); ctx.fill(); ctx.strokeStyle = '#1a2a0a'; ctx.lineWidth = 1.2; ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = -0.75 + i * 0.3; petal(sin(a) * w * 0.1, -h * 0.12, a * 0.85, h * 0.2, w * 0.13, PW, PK, '#fffafc'); }   // 안쪽 흰 꽃잎 (허리를 감쌈)
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 5, -h * 0.4); ctx.rotate(sg * 0.6); ell(ctx, sg * 8, 0, 10, 4, '#6a9a4a', '#2a3a1a', 0.8); ctx.restore(); }
    // 연꽃 줄기 채찍 (가시 대신 매끈한 줄기 + 끝에 연꽃 봉오리)
    for (const sg of [-1, 1]) {
      const up = cast * 1.3 + sin(t * 2 + sg) * 0.2; ctx.save(); ctx.translate(sg * 7, -h * 0.62); ctx.rotate(sg * (0.8 - up));
      ctx.strokeStyle = '#4a7a3a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sg * 18, 14, sg * 6, 34, sg * 22, 52 + sin(t * 3) * 4); ctx.stroke();
      ctx.strokeStyle = '#7aa85a'; ctx.lineWidth = 1; ctx.stroke();
      ctx.save(); ctx.translate(sg * 22, 54 + sin(t * 3) * 4); ctx.rotate(PI - sg * 0.3); for (const a of [-0.45, 0.45, 0]) petal(0, 0, a, 12, 5, PK, PK2); ctx.restore();
      if (cast > 0) glow(ctx, sg * 22, 54, 20, '#c060ff', 0.8); ctx.restore(); }
    // 얼굴 · 꽃잎 머리 (3차 그대로)
    ell(ctx, 0, -h * 0.74, w * 0.15, h * 0.08, vg(ctx, -h * 0.82, -h * 0.66, '#e8d0e0', '#b898b0'), '#4a2a3a', 1.2);
    ctx.save(); ctx.shadowColor = '#ff60d0'; ctx.shadowBlur = 8; for (const sg of [-1, 1]) ell(ctx, sg * w * 0.05 + 1, -h * 0.75, 2.4, 1.4, ph ? '#ff40c0' : '#e070ff'); ctx.restore();
    ctx.fillStyle = '#7a2a5a'; ctx.beginPath(); ctx.arc(1, -h * 0.71, 2, 0, PI); ctx.fill();
    for (let i = 0; i < 8; i++) { const sg = i < 4 ? -1 : 1, j = i % 4; ctx.save(); ctx.translate(sg * (w * 0.14 + j * 2), -h * 0.78 + j * h * 0.05); ell(ctx, 0, 6, 3, 8, j % 2 ? PK2 : PK, '#3a0a3a', 0.5); ctx.restore(); }
    // 연꽃 왕관: 머리 위에 활짝 핀 연꽃 한 송이 + 금빛 꽃술
    ctx.save(); ctx.translate(0, -h * 0.84);
    for (let i = 0; i < 7; i++) { const a = -1.25 + i * 2.5 / 6; petal(0, 0, a, h * 0.11 - abs(a) * 3, w * 0.08, PK, PK2); }
    for (let i = 0; i < 4; i++) { const a = -0.5 + i * 1 / 3; petal(0, 0, a, h * 0.09, w * 0.065, PW, PK, '#fffafc'); }
    glow(ctx, 0, -h * 0.04, 14, ph ? '#ff60d0' : '#fff0c0', 0.7); ell(ctx, 0, -h * 0.025, 3.4, 2.2, '#ffd86a', '#b08a20', 0.8); ctx.restore();
    // 꽃가루 + 떨어지는 연꽃잎
    for (let i = 0; i < 6; i++) { const yy = (t * 22 + i * 30) % (h * 0.9); ell(ctx, -w * 0.6 + i * w * 0.24 + sin(t + i) * 6, -h * 0.9 + yy, 1.6, 1.6, ph ? 'rgba(200,90,255,.8)' : 'rgba(255,220,150,.8)'); }
    for (let i = 0; i < 3; i++) { const yy = (t * 18 + i * 50) % (h * 0.85); ctx.save(); ctx.translate(-w * 0.4 + i * w * 0.4 + sin(t * 0.8 + i) * 8, -h * 0.9 + yy); ctx.rotate(t * 1.4 + i);
      ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(3.4, 0, 0, 5); ctx.quadraticCurveTo(-3.4, 0, 0, -5); ctx.fillStyle = ph ? '#c060e0' : '#f8c0dc'; ctx.fill(); ctx.restore(); }
  };

  // ===== 녹스: 3차 그림자 날개 공허 마법왕을 자연스럽게 =====
  //  날개: 부채꼴 막대 → 날개 뼈 + 겹친 깃털(첫째 · 둘째 깃), 천천히 접혔다 펴짐 · 옷: 어깨에서 흐르고 자락이 물결 · 팔: 소매로 지팡이를 쥠 · 머리: 두건이 어깨로 이어짐
  N5.nox = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase || 0 : 0, ec = ph ? '#ff40c0' : '#d070ff', fl = sin(t * 1.6) * 0.07, br = sin(t * 1.6) * 1.5;
    glow(ctx, 0, -h * 0.55, h * 0.55, '#4a1a80', 0.35);
    const feather = (L, wd, c1, c2) => { ctx.beginPath(); ctx.moveTo(0, -wd * 0.5); ctx.quadraticCurveTo(L * 0.55, -wd * 1.1, L, 0); ctx.quadraticCurveTo(L * 0.55, wd * 0.9, 0, wd * 0.5); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(208,112,255,.45)'; ctx.lineWidth = 0.7; ctx.stroke();
      line(ctx, 'rgba(208,112,255,.25)', 0.6, [[4, 0], [L * 0.9, 0]]); };
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 12, -h * 0.74 + br); ctx.scale(sg, 1); ctx.rotate(-0.75 - fl);
      // 날개 뼈 (어깨 → 팔꿈치 → 손목), 깃털은 뼈를 따라 겹쳐 아래로
      const bone = [[0, 0], [34, -22], [70, -14]];
      for (let i = 0; i < 7; i++) { const u = i / 6, bx = 70 - u * 62, by = -14 - sin(u * PI) * 10; ctx.save(); ctx.translate(bx, by); ctx.rotate(0.15 + u * 0.95 + fl * 0.5); feather(64 - u * 26, 13, '#1e0c34', '#08020e'); ctx.restore(); }   // 첫째 깃 (길게)
      for (let i = 0; i < 6; i++) { const u = i / 5, bx = 60 - u * 52, by = -18 - sin(u * PI) * 8; ctx.save(); ctx.translate(bx, by); ctx.rotate(0.6 + u * 0.8); feather(34 - u * 8, 10, '#2e1650', '#12061e'); ctx.restore(); }   // 덮깃 (짧게)
      ctx.strokeStyle = '#1a0a2a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...bone[0]); ctx.quadraticCurveTo(...bone[1], ...bone[2]); ctx.stroke();
      ctx.strokeStyle = ec; ctx.globalAlpha *= 0.6; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
    // 긴 옷: 어깨에서 흘러내려 자락이 물결
    ctx.save(); ctx.beginPath(); ctx.moveTo(-w * 0.26, -h * 0.77 + br); ctx.bezierCurveTo(-w * 0.5, -h * 0.6, -w * 0.58, -h * 0.25, -w * 0.66 + sin(t) * 3, -2);
    for (let i = 1; i <= 6; i++) { const x0 = -w * 0.66 + (i - 0.5) * w * 1.32 / 6, x1 = -w * 0.66 + i * w * 1.32 / 6; ctx.quadraticCurveTo(x0, -10 + sin(t * 2 + i) * 3, x1 + (i === 6 ? sin(t + 1) * 3 : 0), -2 + sin(t * 2.4 + i) * 1.5); }
    ctx.bezierCurveTo(w * 0.58, -h * 0.25, w * 0.5, -h * 0.6, w * 0.26, -h * 0.77 + br); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.76, 0, '#2a1048', '#0a0418'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.2; ctx.stroke(); ctx.clip();
    for (let i = 0; i < 18; i++) { const x = ((i * 41) % 100 - 50) / 50 * w * 0.55, y = -((i * 57) % 100) / 100 * h * 0.72; ell(ctx, x, y, i % 5 ? 0.9 : 1.6, i % 5 ? 0.9 : 1.6, `rgba(255,255,255,${0.45 + 0.4 * sin(t * 2 + i)})`); }
    ctx.strokeStyle = 'rgba(8,2,14,.55)'; ctx.lineWidth = 2.6; for (const x of [-w * 0.3, 0, w * 0.3]) { ctx.beginPath(); ctx.moveTo(x * 0.5, -h * 0.66); ctx.quadraticCurveTo(x * 0.95, -h * 0.32, x * 1.15, 0); ctx.stroke(); }   // 옷 주름
    ctx.restore();
    // 허리띠 (곧은 선 → 몸을 따라 휜 띠)
    ctx.strokeStyle = '#c8a0ff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-w * 0.36, -h * 0.5); ctx.quadraticCurveTo(0, -h * 0.47, w * 0.36, -h * 0.5); ctx.stroke();
    // 머리: 두건이 어깨로 흘러내림 + 빛나는 가면 + 검은 별 왕관
    const hy = -h * 0.84 + br;
    ctx.beginPath(); ctx.moveTo(-w * 0.3, -h * 0.72 + br); ctx.quadraticCurveTo(-21, hy - 4, -12, hy - 16); ctx.quadraticCurveTo(0, hy - 24, 12, hy - 16); ctx.quadraticCurveTo(21, hy - 4, w * 0.3, -h * 0.72 + br); ctx.quadraticCurveTo(0, -h * 0.68 + br, -w * 0.3, -h * 0.72 + br); ctx.closePath();
    ctx.fillStyle = vg(ctx, hy - 22, -h * 0.7, '#2a1440', '#0a0418'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1.2; ctx.stroke();
    ell(ctx, 3, hy + 2, 9.5, 11.5, vg(ctx, hy - 10, hy + 14, '#f0e8ff', '#a898c8'), '#5a4a80', 1);
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 10; for (const x of [-1, 7]) { ctx.beginPath(); ctx.moveTo(x - 3, hy); ctx.quadraticCurveTo(x, hy - 2, x + 3, hy - 0.5); ctx.quadraticCurveTo(x, hy + 2.4, x - 3, hy); ctx.fillStyle = ec; ctx.fill(); } ctx.restore();
    for (let i = 0; i < 5; i++) { const a = -PI * 0.85 + i * PI * 0.175, L = 12 + (i === 2 ? 6 : 0); ctx.save(); ctx.translate(cos(a) * 17, hy - 6 + sin(a) * 15); ctx.rotate(a + PI / 2);
      ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-1, -L * 0.6, 0, -L); ctx.quadraticCurveTo(1, -L * 0.6, 3, 0); ctx.closePath(); ctx.fillStyle = '#14081e'; ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 0.7; ctx.stroke(); ctx.restore(); }
    // 도는 눈 여섯 (3차 그대로, 뒤로 갈 때 흐려짐)
    for (let i = 0; i < 6; i++) { const a = t * 0.9 + i * PI / 3, x = cos(a) * w * 0.95, y = -h * 0.5 + sin(a) * h * 0.18, f = (sin(a) + 1) / 2; ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * f;
      ell(ctx, x, y, 5 + f * 1.4, 3.4 + f, '#f0e0ff', '#3a1a5a', 0.8); ell(ctx, x + 1, y, 2, 3, ec); glow(ctx, x, y, 10, ec, 0.4); ctx.restore(); }
    // 지팡이 + 쥔 소매 · 손
    ctx.save(); ctx.translate(w * 0.5, -h * 0.5); ctx.rotate(-0.12 - s.atk * 0.4); line(ctx, '#14081e', 4, [[0, 50], [0, -60]]); line(ctx, '#8a6ab0', 1, [[1, 46], [1, -56]]);
    glow(ctx, 0, -68, 26, ec, 0.8); ell(ctx, 0, -68, 11, 11, '#08020e', ec, 2); for (let i = 0; i < 8; i++) { const a = i * PI / 4 + t; line(ctx, ec, 1.4, [[cos(a) * 13, -68 + sin(a) * 13], [cos(a) * 18, -68 + sin(a) * 18]]); }
    ell(ctx, 0, -2, 5, 5.4, '#e0d4f4', '#5a4a80', 1); ctx.restore();
    ctx.beginPath(); ctx.moveTo(w * 0.2, -h * 0.72 + br); ctx.quadraticCurveTo(w * 0.5, -h * 0.66, w * 0.52, -h * 0.52); ctx.lineTo(w * 0.42, -h * 0.48); ctx.quadraticCurveTo(w * 0.36, -h * 0.6, w * 0.14, -h * 0.62); ctx.closePath();
    ctx.fillStyle = vg(ctx, -h * 0.72, -h * 0.48, '#3a1a5a', '#14081e'); ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 1; ctx.stroke();
  };
})();
