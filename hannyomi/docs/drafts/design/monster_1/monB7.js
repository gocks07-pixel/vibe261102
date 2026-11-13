// 보스 7차 시안: "지금"(게임 속 그림) 기준 — 엘드리크 사람 모양 · 모르웬 + 연꽃 · 녹스는 nox_nat.js
(function () {
  const D = G.Draw, ell = D.ell, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const N6 = G.MonNew6 = {};

  // ===== 엘드리크: 지금 그림(보라 고깔모자 · 은발 긴 머리 · 수염 · 붉은 눈 · 보라 옷 · 검은 망토 · 보라 구슬 지팡이 · 붉은 유리 조각)을 사람 모양으로 =====
  //  옛 네모 머리 → 새 그림체 머리 (다른 사람 캐릭터와 같은 비율)
  //  해처럼 보이던 빛살 고리 → 머리 뒤에서 늘어지는 검은 장막(교단 이름) + 가는 공허 고리
  N6.eldrick = (ctx, m, t, s) => {
    const casting = m.boss && (m.boss.cur || m.boss.raise > 0), ec = casting ? '#ff4080' : '#8a40d0', sc = m.h / 66;
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'proj',
      look: { skin: '#e8d8d0', hair: '#c8c8d8', top: m.d.color, bottom: m.d.color2, style: 'long', beard: true, eye: 'sharp', eyeColor: '#ff3060', hat: '#2a1a4a' },
      weapon: 'wand', wcolor: '#c040ff', cape: '#1a0a3a', scale: sc });
    // 고깔모자 (지금 그림처럼 보라 · 끝이 뒤로 꺾임) — 새 머리의 모자 둥근 부분 위에 얹음
    const hy = -98, hr = 32, bob = sin(t * 2) * 1;
    ctx.beginPath(); ctx.moveTo(-hr * 0.95, hy - 6 + bob); ctx.quadraticCurveTo(-hr * 0.7, hy - 44, -8, hy - 62 + bob); ctx.quadraticCurveTo(-18, hy - 78, -34, hy - 80 + bob * 2);
    ctx.quadraticCurveTo(-14, hy - 66, 4, hy - 58 + bob); ctx.quadraticCurveTo(hr * 0.8, hy - 34, hr * 0.98, hy - 6 + bob); ctx.closePath();
    ctx.fillStyle = vg(ctx, hy - 80, hy, '#4a2a7a', '#22123a'); ctx.fill(); ctx.strokeStyle = '#120820'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, hy - 2 + bob, hr * 1.3, 7, 0, 0, PI * 2); ctx.fillStyle = vg(ctx, hy - 9, hy + 5, '#3a1e62', '#1a0a2a'); ctx.fill(); ctx.stroke();   // 챙
    ctx.strokeStyle = '#8a50d0'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(0, hy - 9 + bob, hr * 0.92, 5, 0, PI * 1.05, PI * 1.95, true); ctx.stroke();   // 보라 띠
    ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 8; for (const [x, y] of [[-20, -10], [0, -14], [20, -10]]) poly(ctx, '#b070ff', [[x - 3, hy + y + bob], [x, hy + y - 9 + bob], [x + 3, hy + y + bob]]); ctx.restore();   // 띠의 보라 뿔 장식 (지금 그림)
    ell(ctx, -34, hy - 80 + bob * 2, 3, 3, ec);
    // 가는 공허 고리 (빛살 없음 · 모자 끝 둘레)
    ctx.save(); ctx.translate(-6, hy - 56 + sin(t * 1.5) * 2); ctx.strokeStyle = ec; ctx.lineWidth = 2; ctx.shadowColor = ec; ctx.shadowBlur = 10; ctx.beginPath(); ctx.ellipse(0, 0, 22, 5.5, -0.15, 0, PI * 2); ctx.stroke(); ctx.restore();
    // 검은 장막 (모자 뒤에서 등으로 늘어진 반투명 천 — 교단 이름)
    ctx.save(); const sw = sin(t * 1.6) * 3; ctx.beginPath(); ctx.moveTo(-hr * 0.9, hy + 2); ctx.bezierCurveTo(-hr * 1.35, hy + 30, -hr * 1.3 + sw, -46, -hr * 1.1 + sw, -24);
    ctx.quadraticCurveTo(-hr * 0.95 + sw, -30, -hr * 0.8 + sw, -26); ctx.bezierCurveTo(-hr * 0.9, -50, -hr * 0.95, hy + 30, -hr * 0.6, hy + 6); ctx.closePath();
    ctx.fillStyle = 'rgba(22,8,38,.78)'; ctx.fill(); ctx.strokeStyle = 'rgba(138,64,208,.55)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    // 가슴의 교단 눈 표식
    ell(ctx, 2, -m.h * 0.5, 4.6, 2.8, '#ece0ff', '#5a3a8a', 1); ctx.save(); ctx.shadowColor = ec; ctx.shadowBlur = 6; ell(ctx, 2.5, -m.h * 0.5, 1.5, 1.5, ec); ctx.restore();
    // 붉은 유리 조각 (얼굴을 가리지 않게 몸 둘레를 크게 돎, 뒤로 갈 때 흐려짐)
    for (let i = 0; i < 3; i++) {
      const a = t * 1.6 + i * 2.1, x = cos(a) * 46, y = -m.h * 0.45 + sin(a) * 10, f = (sin(a) + 1) / 2;
      ctx.save(); ctx.globalAlpha *= 0.45 + 0.55 * f; ctx.translate(x, y); ctx.rotate(t * 2 + i);
      poly(ctx, 'rgba(200,40,80,.9)', [[-3, 3], [2, 5], [4, -2], [0, -9], [-3, -4]], '#ff98a8', 0.8); glow(ctx, 0, 0, 10, '#ff4060', 0.5);
      ctx.restore();
    }
  };

  // ===== 모르웬: 지금 그림(나무껍질 드레스 몸 · 시든 잎 머리칼 · 가지 팔 · 보랏빛 균열)에 연꽃 =====
  //  뿌리 → 물 위 연잎 + 몸 아래를 감싼 연꽃 · 잎 머리칼 사이 연꽃 왕관 · 가지 끝 잎 → 연꽃 봉오리 · 떨어지는 잎 → 연꽃잎
  N6.morwen = (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk, sway = sin(t * 1.5) * 0.05;
    const PK = ph ? '#c070d8' : '#f2a8cc', PK2 = ph ? '#6a1a8a' : '#c0508a', PW = ph ? '#f0d8ff' : '#fff2f8';
    const petal = (x, y, a, L, Wd, c1, c2, c3) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-Wd, -L * 0.3, -Wd * 0.7, -L * 0.8, 0, -L); ctx.bezierCurveTo(Wd * 0.7, -L * 0.8, Wd, -L * 0.3, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, -L); g.addColorStop(0, c2); g.addColorStop(0.5, c1); g.addColorStop(1, c3 || PW); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(90,20,70,.55)'; ctx.lineWidth = 0.9; ctx.stroke();
      line(ctx, 'rgba(150,50,110,.3)', 0.7, [[0, -2], [0, -L * 0.8]]); ctx.restore(); };
    // 물 위 연잎 (뿌리 자리)
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * w * 0.72, -2); ctx.scale(1, 0.3); ctx.beginPath(); ctx.arc(0, 0, w * 0.42, sg > 0 ? -2.4 : 0.7, sg > 0 ? 3.9 : 7.0); ctx.lineTo(0, 0); ctx.closePath();
      ctx.fillStyle = '#3e6a34'; ctx.fill(); ctx.strokeStyle = '#1e3a1a'; ctx.lineWidth = 2.6; ctx.stroke(); for (let k = 0; k < 6; k++) line(ctx, '#5a8a48', 2, [[0, 0], [cos(k * PI / 3) * w * 0.36, sin(k * PI / 3) * w * 0.36]]); ctx.restore(); }
    ctx.rotate(sway);
    // 뒤쪽 연꽃잎 (몸 뒤로 크게 펼쳐짐)
    for (let i = 0; i < 9; i++) { const a = -1.4 + i * 2.8 / 8; petal(sin(a) * w * 0.3, -2, a, h * 0.26 - abs(a) * 4, w * 0.2, PK, PK2); }
    // 몸통 (지금 그림 그대로: 드레스 같은 나무 줄기)
    const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#6a5a3a'); g.addColorStop(1, '#3a2a18');
    poly(ctx, g, [[-w * 0.22, -h * 0.72], [w * 0.22, -h * 0.72], [w * 0.5, -h * 0.1], [-w * 0.5, -h * 0.1]], '#2a1a0a', 2);
    ctx.strokeStyle = 'rgba(30,20,10,.5)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.15 + i * w * 0.1, -h * 0.68); ctx.quadraticCurveTo(-w * 0.2 + i * w * 0.14, -h * 0.4, -w * 0.32 + i * w * 0.21, -h * 0.12); ctx.stroke(); }
    ctx.save(); ctx.strokeStyle = ph ? '#e040ff' : '#a040d0'; ctx.lineWidth = ph ? 3 : 2; ctx.shadowColor = '#c040ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(-w * 0.05, -h * 0.65); ctx.lineTo(w * 0.06, -h * 0.5); ctx.lineTo(-w * 0.04, -h * 0.38); ctx.lineTo(w * 0.1, -h * 0.22);
    if (ph) { ctx.moveTo(-w * 0.3, -h * 0.3); ctx.lineTo(-w * 0.15, -h * 0.4); ctx.moveTo(w * 0.3, -h * 0.35); ctx.lineTo(w * 0.18, -h * 0.5); }
    ctx.stroke(); ctx.restore();
    // 앞쪽 연꽃 (몸 아랫단을 감쌈: 바깥 분홍 → 안쪽 흰)
    for (let i = 0; i < 8; i++) { const a = -1.15 + i * 2.3 / 7; petal(sin(a) * w * 0.22, -1, a, h * 0.2, w * 0.17, PK, PK2); }
    for (let i = 0; i < 5; i++) { const a = -0.7 + i * 0.35; petal(sin(a) * w * 0.14, -2, a, h * 0.15, w * 0.13, PW, PK, '#fffafc'); }
    // 가지 팔 (끝 잎 → 연꽃 봉오리)
    for (const sg of [-1, 1]) {
      const up = cast * 1.5 + sin(t * 2 + sg) * 0.1;
      ctx.save(); ctx.translate(sg * w * 0.2, -h * 0.66); ctx.rotate(-sg * (0.65 + up));
      line(ctx, '#4a3a22', 10, [[0, 0], [0, h * 0.3]]);
      line(ctx, '#4a3a22', 5, [[0, h * 0.18], [sg * 12, h * 0.3]]); line(ctx, '#4a3a22', 4, [[0, h * 0.3], [-sg * 8, h * 0.4]]); line(ctx, '#4a3a22', 3, [[0, h * 0.3], [sg * 4, h * 0.42]]);
      for (const [lx, ly] of [[sg * 12, h * 0.3], [-sg * 8, h * 0.4]]) { ctx.save(); ctx.translate(lx, ly); ctx.rotate(PI); for (const a of [-0.45, 0.45, 0]) petal(0, 0, a, 9, 4, PK, PK2); ctx.restore(); }
      if (cast > 0) glow(ctx, 0, h * 0.36, 22, '#c060ff', 0.8);
      ctx.restore();
    }
    // 얼굴 (지금 그대로)
    ell(ctx, 0, -h * 0.8, w * 0.2, h * 0.1, '#8a7a5a', '#3a2a18', 2);
    const eye = ph ? '#ff40c0' : '#d070ff';
    ctx.save(); ctx.shadowColor = eye; ctx.shadowBlur = 12; ell(ctx, -w * 0.07, -h * 0.81, 4, 2.5, eye); ell(ctx, w * 0.07, -h * 0.81, 4, 2.5, eye); ctx.restore();
    line(ctx, '#2a1a0a', 1.5, [[-w * 0.06, -h * 0.75], [0, -h * 0.76], [w * 0.06, -h * 0.75]]);
    // 시든 잎 머리칼 (지금 그대로, 사이사이 분홍 연꽃잎)
    for (let i = 0; i < 14; i++) {
      const a = PI + i / 13 * PI, rr = w * 0.32, x = cos(a) * rr, y = -h * 0.84 + sin(a) * h * 0.13;
      ctx.save(); ctx.translate(x, y + sin(t * 2 + i) * 2); ctx.rotate(a + PI / 2);
      ctx.fillStyle = i % 3 === 0 ? PK : (i % 2 ? '#5a7a3a' : '#6a8a4a');
      ctx.beginPath(); ctx.ellipse(0, -8, 4, 10, 0, 0, PI * 2); ctx.fill(); ctx.restore();
    }
    // 연꽃 왕관 (머리 꼭대기에 한 송이)
    ctx.save(); ctx.translate(0, -h * 0.95);
    for (let i = 0; i < 7; i++) { const a = -1.25 + i * 2.5 / 6; petal(0, 0, a, h * 0.1 - abs(a) * 3, w * 0.08, PK, PK2); }
    for (let i = 0; i < 4; i++) { const a = -0.5 + i / 3; petal(0, 0, a, h * 0.08, w * 0.065, PW, PK, '#fffafc'); }
    glow(ctx, 0, -h * 0.035, 12, ph ? '#ff60d0' : '#fff0c0', 0.7); ell(ctx, 0, -h * 0.022, 3, 2, '#ffd86a', '#b08a20', 0.8); ctx.restore();
    // 떨어지는 연꽃잎
    for (let i = 0; i < 3; i++) { const y = ((t * 30 + i * 50) % (h * 0.8)); ctx.save(); ctx.translate(-w * 0.4 + i * w * 0.4, -h * 0.85 + y); ctx.rotate(t * 2 + i);
      ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(3.4, 0, 0, 5); ctx.quadraticCurveTo(-3.4, 0, 0, -5); ctx.fillStyle = ph ? '#c060e0' : '#f8c0dc'; ctx.fill(); ctx.restore(); }
  };
})();
