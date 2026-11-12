'use strict';
// 1.6: 몬스터 전용 생김새 + 전용 움직임 (새싹항 섬 ~ 라그하르트, 32종)
//  G.MonArt[몬스터 id] = { draw(ctx, m, t, s), die: 쓰러지는 방식, sh: 그림자 크기 배율(0 = 없음) }
//  s = { walk: 걷는 중(0/1), atk: 공격 동작(0~1), hurt: 맞음(0~1), die: 쓰러짐(0~1), t }
//  좌표는 발밑(0, 0) 기준, 오른쪽을 보는 모습으로 그린다 (왼쪽은 자동으로 뒤집힘)
//  이미지 파일 없이 전부 도형으로 그린다. 다른 게임의 디자인을 가져오지 않는다.
G.MonArt = {};
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f);
  const PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const eyes = (ctx, x, y, gap, r, pupil, angry) => {
    for (const ex of [x, x + gap]) { ell(ctx, ex, y, r, r * 1.15, '#fff'); ell(ctx, ex + r * 0.3, y + r * 0.1, r * 0.55, r * 0.7, pupil || '#1a1a22'); ell(ctx, ex + r * 0.05, y - r * 0.35, r * 0.22, r * 0.22, '#fff'); }
    if (angry) { ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - r, y - r * 1.6); ctx.lineTo(x + r, y - r * 1.0); ctx.moveTo(x + gap - r, y - r * 1.0); ctx.lineTo(x + gap + r, y - r * 1.6); ctx.stroke(); }
  };
  const line = (ctx, c, w, pts, cap) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = cap || 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } };
  const glow = (ctx, x, y, r, c, a = 0.5) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore();
  };
  const legPair = (ctx, c, x, y, len, ph, lw = 2.5, bend = 1) => {   // 관절 다리 하나
    const kx = x + len * 0.55, ky = y - len * 0.45 * bend + sin(ph) * 3;
    line(ctx, c, lw, [[x, y], [kx, ky], [x + len, 0 + sin(ph) * 1.5]]);
  };
  const A = (id, die, sh, draw) => { G.MonArt[id] = { die, sh, draw }; };
  // 사람형 몬스터: 기존 사람 그리기에 전용 옷차림을 입힌다
  const human = (m, t, look, o = {}) => Object.assign({ x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look, oldHead: true }, o);   // 사람 모양 몬스터는 옛 머리 (1번 꾸미기)

  // ======================= 새싹항 섬 =======================
  // 풀잎 젤리: 말랑한 젤리 + 새싹 두 장. 움직일 때 통통 튀며 찌그러진다
  A('jelly', 'melt', 1, (ctx, m, t, s) => {
    const w = m.w / 2, h = m.h, ph = (t * 3.2) % 1, hop = s.walk ? sin(ph * PI) * 9 : 0;
    const sq = s.walk ? 1 + (hop < 2 ? 0.18 : -0.06) : 1 + sin(t * 4) * 0.05, lunge = s.atk * 8;
    ctx.translate(lunge, -hop);
    ctx.globalAlpha *= 0.92;
    ctx.beginPath(); ctx.moveTo(-w * sq, 0); ctx.quadraticCurveTo(-w * sq * 1.05, -h / sq, 0, -h / sq);
    ctx.quadraticCurveTo(w * sq * 1.05, -h / sq, w * sq, 0); ctx.closePath();
    const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, shade(m.d.color, 0.25)); g.addColorStop(1, m.d.color);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha /= 0.92;
    ell(ctx, -w * 0.4, -h * 0.68 / sq, w * 0.2, h * 0.11, 'rgba(255,255,255,.6)');
    ell(ctx, w * 0.35, -h * 0.25, 3, 3, 'rgba(255,255,255,.35)'); ell(ctx, -w * 0.1, -h * 0.18, 2, 2, 'rgba(255,255,255,.35)');
    eyes(ctx, w * 0.0, -h * 0.5 / sq, w * 0.42, 3.3);
    ell(ctx, w * 0.62, -h * 0.36 / sq, 3, 1.6, 'rgba(255,120,120,.5)');
    line(ctx, '#2a4a22', 1.5, [[w * 0.18, -h * 0.36 / sq], [w * 0.25, -h * 0.32 / sq], [w * 0.32, -h * 0.36 / sq]]);
    const sway = sin(t * 3) * 0.25;
    ctx.save(); ctx.translate(0, -h / sq); ctx.rotate(sway);
    line(ctx, '#3e7e2a', 2, [[0, 0], [0, -6]]);
    ctx.fillStyle = '#5ab84a'; ctx.beginPath(); ctx.ellipse(-5, -8, 6, 3, -0.5, 0, PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(5, -9, 6, 3, 0.5, 0, PI * 2); ctx.fill();
    ctx.restore();
  });

  // 꼬마 게: 커다란 두 집게를 들고 옆으로 종종걸음. 공격할 때 집게를 딱딱
  A('crab', 'flip', 1, (ctx, m, t, s) => {
    const k = m.w / 50, step = s.walk ? t * 18 : t * 2;
    ctx.scale(k, k);
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) legPair(ctx, m.d.color2, sg * 7, -8, sg * (13 + i * 3), step + i * 2 + (sg > 0 ? PI : 0), 2.2, 0.8);
    ell(ctx, 0, -12, 17, 10, m.d.color, m.d.color2, 2);
    for (const x of [-8, 0, 8]) ell(ctx, x, -17, 2, 1.2, shade(m.d.color, 0.3));
    const snap = s.atk > 0 ? abs(sin(t * 20)) : abs(sin(t * 3)) * 0.4;
    for (const [sg, sc] of [[-1, 0.8], [1, 1]]) {
      ctx.save(); ctx.translate(sg * 15, -18); ctx.rotate(sg * -0.5 - s.atk * 0.4); ctx.scale(sc, sc);
      line(ctx, m.d.color2, 3, [[0, 0], [sg * 4, -8]]);
      ctx.translate(sg * 4, -12);
      ell(ctx, 0, 0, 7, 5, m.d.color, m.d.color2, 2);
      ctx.fillStyle = m.d.color; ctx.save(); ctx.rotate(-snap * 0.6); ctx.beginPath(); ctx.ellipse(3, -4, 5, 2.5, -0.5, 0, PI * 2); ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.stroke(); ctx.restore();
      ctx.restore();
    }
    line(ctx, m.d.color2, 2, [[-4, -20], [-5, -28]]); line(ctx, m.d.color2, 2, [[5, -20], [6, -28]]);
    eyes(ctx, -5, -30, 11, 2.8);
    line(ctx, '#7a2a1a', 1.5, [[-3, -9], [0, -7], [3, -9]]);
  });

  // 포자 방울: 둥실 떠다니는 솜털 포자. 주위에 작은 포자가 돌고, 공격 땐 부풀어 오른다
  A('spore', 'pop', 0.8, (ctx, m, t, s) => {
    const r = m.w / 2, b = abs(sin(t * 3.5)) * 10, puff = 1 + s.atk * 0.25 + sin(t * 5) * 0.03;
    ctx.translate(0, -b - 4);
    ctx.strokeStyle = shade(m.d.color, 0.35); ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2; ctx.beginPath(); ctx.moveTo(cos(a) * r * puff, -r + sin(a) * r * puff); ctx.lineTo(cos(a) * (r + 5) * puff, -r + sin(a) * (r + 5) * puff); ctx.stroke(); }
    const g = ctx.createRadialGradient(-r * 0.3, -r * 1.3, 2, 0, -r, r * puff); g.addColorStop(0, shade(m.d.color, 0.35)); g.addColorStop(1, m.d.color);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -r, r * puff, 0, PI * 2); ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2; ctx.stroke();
    for (const [x, y, rr] of [[-9, -r - 8, 3.5], [8, -r - 11, 2.8], [-11, -r + 6, 2.2], [11, -r + 5, 2.6], [0, -r - 15, 2]]) ell(ctx, x * puff, y, rr, rr, m.d.color2);
    eyes(ctx, -3, -r + 1, 9, 2.8, '#3a1a4a');
    ell(ctx, 1.5, -r + 8, 2.4, 1.6 + s.atk * 1.5, '#3a1a4a');
    for (let i = 0; i < 4; i++) { const a = t * 1.5 + i * PI / 2; ell(ctx, cos(a) * (r + 12), -r + sin(a) * (r * 0.6), 2, 2, 'rgba(200,160,240,.7)'); }
  });

  // 갓버섯 전사: 점박이 갓 + 나무 방패 + 짧은 창. 짧은 다리로 아장아장, 공격 땐 창으로 찌른다
  A('capshroom', 'flip', 1, (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, step = s.walk ? sin(t * 12) : 0, bob = abs(step) * 2;
    ctx.translate(0, -bob);
    for (const sg of [-1, 1]) rrect(ctx, sg * 6 - 3, -10 + (sg > 0 ? step : -step) * 2, 6, 10, 3, '#8a6a4a');
    rrect(ctx, -w * 0.42, -h * 0.55, w * 0.84, h * 0.47, 7, m.d.color2, shade(m.d.color2, -0.35));
    eyes(ctx, -1, -h * 0.36, 9, 2.6, null, true);
    line(ctx, '#5a3a1a', 1.5, [[2, -h * 0.24], [6, -h * 0.25]]);
    // 창 (뒤 손)
    const thrust = s.atk * 14;
    ctx.save(); ctx.translate(w * 0.3 + thrust, -h * 0.32); ctx.rotate(-0.15);
    line(ctx, '#7a5a2a', 2.5, [[-14, 0], [16, 0]]);
    poly(ctx, '#d8dde8', [[16, -3], [24, 0], [16, 3]], '#8a90a0', 1);
    ctx.restore();
    // 방패 (앞 손)
    ell(ctx, w * 0.55, -h * 0.25, 7, 9, '#a0703c', '#5a3a1a', 2); line(ctx, '#5a3a1a', 1.5, [[w * 0.55, -h * 0.25 - 8], [w * 0.55, -h * 0.25 + 8]]);
    // 갓
    ctx.fillStyle = m.d.color; ctx.strokeStyle = shade(m.d.color, -0.4); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -h * 0.55, w * 1.08, h * 0.44, 0, PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ell(ctx, 0, -h * 0.55, w * 1.08, 3, shade(m.d.color, -0.25));
    for (const [x, y, r] of [[-11, -h * 0.76, 4.5], [6, -h * 0.87, 3.8], [15, -h * 0.66, 3], [-2, -h * 0.66, 2.4]]) ell(ctx, x, y, r, r, '#fff3dc');
  });

  // 가시 조개: 가시 돋친 껍데기가 벌어졌다 닫힌다. 안에서 진주와 눈이 반짝, 공격 땐 덥석
  A('spikeshell', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, hop = s.walk ? abs(sin(t * 8)) * 4 : 0;
    const open = s.atk > 0 ? 0.65 * (1 - abs(sin(t * 14))) : 0.18 + abs(sin(t * 1.3)) * 0.25;
    ctx.translate(0, -hop);
    ctx.fillStyle = shade(m.d.color, -0.15); ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -7, w, 9, 0, 0, PI); ctx.lineTo(-w, -7); ctx.fill(); ctx.stroke();
    ell(ctx, 0, -9, w * 0.75, 4, '#f0c8d0');
    ell(ctx, -6, -12, 5.5, 5, '#f8fbff', '#b8c4d4', 1); ell(ctx, -7.5, -13.5, 1.6, 1.6, '#fff');
    eyes(ctx, 4, -12, 9, 2.4);
    ctx.save(); ctx.translate(-w + 2, -8); ctx.rotate(-open);
    ctx.fillStyle = m.d.color; ctx.beginPath(); ctx.ellipse(w - 2, 0, w, m.h * 0.55, 0, PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = shade(m.d.color, -0.25); ctx.lineWidth = 1.2;
    for (let i = 1; i < 5; i++) { const a = PI + i * PI / 5; ctx.beginPath(); ctx.moveTo(w - 2, 0); ctx.lineTo(w - 2 + cos(a) * w * 0.95, sin(a) * m.h * 0.52); ctx.stroke(); }
    ctx.fillStyle = shade(m.d.color, 0.3);
    for (let i = 0; i < 6; i++) { const a = PI + (i + 0.5) * PI / 6, x = w - 2 + cos(a) * w, y = sin(a) * m.h * 0.55; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + cos(a) * 9, y + sin(a) * 9); ctx.lineTo(x + 3, y); ctx.fill(); }
    ctx.restore();
  });

  // 바다 도마뱀: 등지느러미 볏 + 물갈퀴 발 + 흔들리는 꼬리. 공격 땐 혀를 날름
  A('sealizard', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, wk = s.walk ? sin(t * 14) : 0, tail = sin(t * 4) * 0.3;
    ctx.save(); ctx.translate(-w * 0.45, -12); ctx.rotate(tail);
    poly(ctx, m.d.color2, [[0, -5], [-w * 0.65, -2], [-w * 0.75, 4], [0, 5]]);
    ctx.restore();
    for (const [x, a] of [[-w * 0.3, wk], [-w * 0.05, -wk], [w * 0.2, -wk], [w * 0.42, wk]]) {
      ctx.save(); ctx.translate(x, -8); ctx.rotate(a * 0.5);
      rrect(ctx, -2.5, 0, 5, 8, 2, m.d.color2); poly(ctx, shade(m.d.color2, 0.2), [[-4, 8], [4, 8], [5, 10], [-5, 10]]);
      ctx.restore();
    }
    ell(ctx, 0, -14, w * 0.6, 9, m.d.color, m.d.color2, 2);
    ell(ctx, 0, -9, w * 0.48, 4, shade(m.d.color, 0.35));
    ctx.fillStyle = '#2a9ad0';
    ctx.beginPath(); ctx.moveTo(-w * 0.45, -20); for (let i = 0; i <= 6; i++) ctx.lineTo(-w * 0.45 + i * w * 0.14, -20 - (i % 2 ? 9 : 3) - sin(t * 6 + i) * 1.5); ctx.lineTo(w * 0.42, -20); ctx.fill();
    ell(ctx, w * 0.66, -18, 13, 8, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.72, -22, 3.2, 3.2, '#fff'); ell(ctx, w * 0.75, -22, 1.7, 2.2, '#111');
    line(ctx, m.d.color2, 1.5, [[w * 0.72, -15], [w * 0.88, -16]]);
    if (s.atk > 0 || sin(t * 2) > 0.95) line(ctx, '#ff6080', 1.8, [[w * 0.88, -16], [w * 0.88 + 10 * (s.atk || 0.6), -15], [w * 0.88 + 13 * (s.atk || 0.6), -18]]);
  });

  // 쉘로크: 검은 천이 감긴 커다란 소라 껍데기를 진 거대 소라게. 큰 집게를 들어 내려찍는다
  A('shellock', 'flip', 1, (ctx, m, t, s) => {
    const k = m.w / 170;
    ctx.scale(k, k);
    const guard = m.boss && m.boss.guarding, raise = m.boss ? m.boss.raise : 0, step = s.walk ? t * 9 : t;
    // 다리
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) legPair(ctx, m.d.color2, sg * 18, -20, sg * (40 + i * 8), step + i * 1.7 + (sg > 0 ? PI : 0), 6, 0.9);
    // 소라 껍데기
    const sx = -22, sy = -78;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.15);
    const g = ctx.createRadialGradient(-10, -10, 6, 0, 0, 62); g.addColorStop(0, '#f4e2c4'); g.addColorStop(1, '#b08a5a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 60, 50, 0, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); for (let a = 0; a < PI * 5; a += 0.2) { const r = 46 - a * 2.8; ctx.lineTo(cos(a) * r, sin(a) * r * 0.85); } ctx.stroke();
    // 2.1: 껍데기의 검은 천은 지우고, 쓰러질 때 떨어지는 연출로 바꿈 (world.js cloth)
    ctx.restore();
    if (guard) {   // 껍데기 속으로 숨음
      for (let i = 0; i < 3; i++) ell(ctx, 30 + i * 12, -60 - ((t * 40 + i * 20) % 60), 4, 4, 'rgba(200,230,255,.6)');
      return;
    }
    ell(ctx, 18, -36, 44, 26, m.d.color, m.d.color2, 3);
    for (const x of [0, 18, 36]) ell(ctx, x, -48, 5, 3, shade(m.d.color, 0.25));
    // 작은 집게
    ell(ctx, 58, -26, 13, 9, m.d.color, m.d.color2, 2.5);
    // 큰 집게 (패턴 예고 때 높이 든다)
    ctx.save(); ctx.translate(48, -50); ctx.rotate(-0.4 - raise * 1.3 + s.atk * 0.3);
    rrect(ctx, 0, -8, 34, 16, 8, m.d.color, m.d.color2);
    ctx.translate(40, 0);
    ell(ctx, 0, 0, 22, 16, m.d.color, m.d.color2, 3);
    const op = raise > 0 ? 0.6 : abs(sin(t * 2)) * 0.25;
    ctx.save(); ctx.rotate(-op); ctx.fillStyle = shade(m.d.color, 0.15); ctx.beginPath(); ctx.ellipse(18, -8, 16, 7, -0.3, 0, PI * 2); ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.stroke(); ctx.restore();
    ctx.restore();
    // 눈자루 + 화난 눈
    line(ctx, m.d.color2, 4, [[24, -58], [22, -82]]); line(ctx, m.d.color2, 4, [[40, -56], [42, -80]]);
    for (const x of [22, 42]) { ell(ctx, x, -86, 8, 8, '#fff', m.d.color2, 2); ell(ctx, x + 2, -85, 4, 5, '#200'); }
    line(ctx, '#300', 3, [[14, -97], [28, -92]]); line(ctx, '#300', 3, [[36, -92], [50, -97]]);
    for (let i = 0; i < 3; i++) ell(ctx, 66 + i * 6, -40 - ((t * 30 + i * 25) % 50), 3, 3, 'rgba(220,240,255,.55)');
  });

  // ======================= 바람결 지방 =======================
  // 들쥐: 동그란 귀, 긴 수염, 앞니. 종종거리며 달리고 공격 땐 앞으로 덥석 문다
  A('fieldrat', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, run = s.walk ? t * 20 : 0, hop = s.walk ? abs(sin(run)) * 3 : 0, lunge = s.atk * 7;
    ctx.translate(lunge, -hop);
    line(ctx, '#d8a0a0', 2, [[-w * 0.65, -9], [-w * 1.0, -16 + sin(t * 5) * 3], [-w * 1.35, -6]]);
    for (const [x, ph] of [[-w * 0.35, 0], [w * 0.3, PI]]) { const a = sin(run + ph) * 0.6; ctx.save(); ctx.translate(x, -6); ctx.rotate(a); rrect(ctx, -2.5, 0, 5, 7, 2, m.d.color2); ctx.restore(); }
    ell(ctx, -3, -12, w * 0.68, 11, m.d.color, m.d.color2, 2);
    ell(ctx, -3, -7, w * 0.45, 5, shade(m.d.color, 0.3));
    ell(ctx, w * 0.5, -16, 12, 10, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.3, -27, 7, 7, m.d.color, m.d.color2, 1.5); ell(ctx, w * 0.3, -27, 4, 4, '#f0b8b8');
    ell(ctx, w * 0.92, -15, 2.6, 2.4, '#e07080');
    ell(ctx, w * 0.6, -19, 2.2, 2.6, '#111'); ell(ctx, w * 0.56, -20, 0.8, 0.8, '#fff');
    rrect(ctx, w * 0.78, -12, 4, 4 + s.atk * 2, 1, '#fffbe8');
    ctx.strokeStyle = 'rgba(40,30,20,.6)'; ctx.lineWidth = 0.8;
    for (const dy of [-2, 1]) { ctx.beginPath(); ctx.moveTo(w * 0.9, -15 + dy); ctx.lineTo(w * 1.3, -17 + dy * 2); ctx.stroke(); }
  });

  // 허수아비 골렘: 짚 모자 + 꿰맨 자루 얼굴 + 십자 나무 팔. 외다리로 콩콩 뛰고 팔을 휘두른다
  A('scarecrow', 'crumble', 1, (ctx, m, t, s) => {
    const h = m.h, hop = s.walk ? abs(sin(t * 7)) * 8 : abs(sin(t * 2)) * 1.5, swing = s.atk > 0 ? sin(t * 14) * 0.6 : sin(t * 2.5) * 0.12;
    ctx.translate(0, -hop);
    line(ctx, '#6a4a2a', 5, [[0, 0], [0, -h * 0.5]], 'butt');
    ctx.save(); ctx.translate(0, -h * 0.62); ctx.rotate(swing);
    line(ctx, '#7a5a2a', 5, [[-h * 0.38, 0], [h * 0.38, 0]], 'butt');
    for (const sx of [-1, 1]) { ctx.strokeStyle = '#e8c860'; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(sx * h * 0.38, 0); ctx.lineTo(sx * (h * 0.38 + 6), -4 + i * 2); ctx.stroke(); } }
    ctx.restore();
    rrect(ctx, -12, -h * 0.75, 24, h * 0.33, 5, '#5a7a9a', '#34506a');
    ctx.strokeStyle = '#e8d8a0'; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.strokeRect(-6, -h * 0.65, 12, 9); ctx.setLineDash([]);
    ctx.strokeStyle = '#e8c860'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 6, -h * 0.42); ctx.lineTo(-11 + i * 6, -h * 0.36); ctx.stroke(); }
    ell(ctx, 0, -h * 0.84, 12, 11, '#d8c090', '#8a6a3a', 2);
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath();
    for (const ex of [-5, 5]) { ctx.moveTo(ex - 3, -h * 0.87); ctx.lineTo(ex + 3, -h * 0.83); ctx.moveTo(ex + 3, -h * 0.87); ctx.lineTo(ex - 3, -h * 0.83); }
    ctx.moveTo(-6, -h * 0.77); for (let i = 0; i <= 6; i++) ctx.lineTo(-6 + i * 2, -h * 0.77 + (i % 2 ? 2 : 0)); ctx.stroke();
    ell(ctx, 0, -h * 0.93, 21, 4.5, '#b8902a', '#7a5a1a', 1.5);
    ctx.fillStyle = m.d.color; ctx.beginPath(); ctx.ellipse(0, -h * 0.94, 11, 9, 0, PI, 0); ctx.fill();
    line(ctx, '#a03030', 2.5, [[-10, -h * 0.94], [10, -h * 0.94]], 'butt');
  });

  // 바람 정령: 소용돌이치는 바람 덩어리. 잎사귀가 휘말려 돌고, 공격 땐 빠르게 회전
  A('windspirit', 'fall', 0.6, (ctx, m, t, s) => {
    const r = m.w / 2, spin = t * (s.atk > 0 ? 14 : 4);
    ctx.globalAlpha *= 0.9;
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 ? m.d.color : m.d.color2; ctx.lineWidth = 3.5 - i * 0.5;
      ctx.beginPath(); const rr = r * (1 - i * 0.18); ctx.arc(0, -r - i * 2, rr, spin + i, spin + i + PI * 1.3); ctx.stroke();
    }
    const g = ctx.createRadialGradient(0, -r, 2, 0, -r, r * 0.6); g.addColorStop(0, '#ffffff'); g.addColorStop(1, m.d.color);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -r, r * 0.5, 0, PI * 2); ctx.fill();
    eyes(ctx, -4, -r - 1, 9, 2.6, '#1a5a6a');
    ell(ctx, 1, -r + 6, 2.5, 1.5 + s.atk * 1.5, '#1a5a6a');
    for (let i = 0; i < 3; i++) { ctx.save(); const a = spin * 0.7 + i * 2.1; ctx.translate(cos(a) * r * 1.05, -r + sin(a) * r * 0.5); ctx.rotate(a * 2); ctx.fillStyle = i ? '#7ac85a' : '#e8c060'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.4, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
    line(ctx, m.d.color, 2.5, [[-r * 0.3, -r * 0.3], [-r * 0.7, -r * 0.05 + sin(t * 6) * 3], [-r * 1.1, -r * 0.2]]);
  });

  // 돌풍 산양 (몬스터 id 는 예전 이름 wingboar 그대로): 바람에 부푼 구름 같은 털 + 크게 말린 뿔.
  //  또각또각 걷고, 털 뭉치가 바람에 흩날린다. 공격 땐 뒷발로 일어섰다 뿔로 박치기 (2026-11-04 사용자 선택)
  A('wingboar', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, step = s.walk ? t * 10 : 0, rear = s.atk > 0 ? sin(s.atk * PI) : 0;
    const wool = m.d.color, woolD = '#c8c4b8', face = m.d.color2, horn = '#c8a878';
    ctx.save(); ctx.translate(-w * 0.4, 0); ctx.rotate(-rear * 0.35); ctx.translate(w * 0.4, 0);
    for (const [x, ph] of [[-w * 0.42, 0], [-w * 0.2, PI], [w * 0.22, PI], [w * 0.42, 0]]) {
      ctx.save(); ctx.translate(x, -15); ctx.rotate(sin(step + ph) * 0.5); rrect(ctx, -2.5, 0, 5, 15, 2, face); rrect(ctx, -3.5, 13, 7, 3, 1, '#1a1418'); ctx.restore();
    }
    // 구름 같은 털 몸
    for (const [x, y, r] of [[-w * 0.45, -24, 12], [-w * 0.15, -30, 14], [w * 0.15, -28, 13], [w * 0.38, -22, 10], [-w * 0.2, -18, 12], [w * 0.1, -17, 11]]) ell(ctx, x, y + sin(t * 2 + x) * 0.8, r, r * 0.85, wool, woolD, 1.5);
    line(ctx, woolD, 2, [[-w * 0.7, -26], [-w * 0.78, -22]]);
    // 흩날리는 털 뭉치
    for (let i = 0; i < 3; i++) { const p = (t * 0.7 + i / 3) % 1; ell(ctx, -w * 0.6 - p * 34, -36 + i * 6 - p * 8, 3.5 * (1 - p) + 1, 3 * (1 - p) + 1, `rgba(245,243,238,${1 - p})`); }
    // 머리
    ctx.save(); ctx.translate(w * 0.58, -30); ctx.rotate(s.atk > 0.5 ? (s.atk - 0.5) * 1.2 : 0);
    ell(ctx, 6, 2, 8, 11, face, '#2a2028', 1.5);
    ell(ctx, 4, -9, 8, 5, wool, woolD, 1);
    ell(ctx, 8, -2, 2, 2.2, '#f0d050'); rrect(ctx, 6.5, -2.6, 3, 1.2, 0.5, '#111');
    line(ctx, '#e8e4dc', 2, [[8, 12], [7, 18], [9, 20]]);   // 염소 수염
    // 크게 말린 뿔
    ctx.strokeStyle = horn; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); for (let a = 0; a < PI * 1.6; a += 0.15) { const r = 13 - a * 2.2; ctx.lineTo(-2 + cos(a + PI) * r, -6 + sin(a + PI) * r); } ctx.stroke();
    ctx.strokeStyle = '#9a7a50'; ctx.lineWidth = 1; for (let a = 0.3; a < PI * 1.4; a += 0.45) { const r = 13 - a * 2.2; ctx.beginPath(); ctx.moveTo(-2 + cos(a + PI) * (r - 2.5), -6 + sin(a + PI) * (r - 2.5)); ctx.lineTo(-2 + cos(a + PI) * (r + 2.5), -6 + sin(a + PI) * (r + 2.5)); ctx.stroke(); }
    poly(ctx, face, [[-2, -2], [-10, -4], [-4, 2]]);
    ctx.restore();
    ctx.restore();
  });

  // 도적 견습: 초록 두건 + 복면 + 단검
  A('banditnov', 'flip', 0, (ctx, m, t) => D.humanoid(ctx, human(m, t, { skin: '#f0c8a0', hair: '#4a2a1a', top: m.d.color, bottom: m.d.color2, style: 'spiky', hat: '#3a7a4a' }, { weapon: 'dagger', wcolor: '#b0b0b8', mask: '#2a2a32' })));
  // 도적 궁수: 갈색 후드 망토 + 활
  A('banditarch', 'flip', 0, (ctx, m, t) => D.humanoid(ctx, human(m, t, { skin: '#e8c098', hair: '#2a1a10', top: m.d.color, bottom: m.d.color2, style: 'long', hat: '#5a4030' }, { atkKind: 'proj', weapon: 'bow', wcolor: '#8a5a2a', cape: '#4a3424' })));
  // 바르크의 부하: 민머리 + 검은 복면
  A('barkminion', 'flip', 0, (ctx, m, t) => D.humanoid(ctx, human(m, t, { skin: '#e0b890', hair: '#1a1a1a', top: m.d.color, bottom: m.d.color2, style: 'bald' }, { weapon: 'dagger', wcolor: '#9a9aa2', mask: '#14141a' })));
  // 붉은손 바르크: 붉은 갈기 머리 + 수염 + 붉은 복면 + 망토 + 대검
  A('bark', 'flip', 0, (ctx, m, t) => D.humanoid(ctx, human(m, t, { skin: '#e8b890', hair: '#b02a1a', top: m.d.color, bottom: m.d.color2, style: 'spiky', beard: true }, { weapon: 'sword', wcolor: '#d8d8e0', mask: '#8a1a1a', cape: '#5a1a1a', scale: 1.7 })));

  // ======================= 은빛숲 엘렌하임 =======================
  // 이끼 덩어리: 울퉁불퉁한 이끼 덩어리 위에 작은 버섯과 꽃. 늘어졌다 오므라들며 기어간다
  A('moss_slime', 'melt', 1, (ctx, m, t, s) => {
    const w = m.w / 2, h = m.h, ooze = s.walk ? sin(t * 5) : sin(t * 2) * 0.3, lunge = s.atk * 6;
    ctx.translate(lunge, 0);
    ctx.beginPath(); ctx.moveTo(-w - ooze * 3, 0);
    for (let i = 0; i <= 10; i++) { const a = PI + i * PI / 10, bump = 1 + sin(i * 2.3 + t * 2) * 0.06; ctx.lineTo(cos(a) * (w + ooze * 3 * cos(a)) * bump, sin(a) * h * (1 - ooze * 0.08) * bump); }
    ctx.closePath(); ctx.fillStyle = m.d.color; ctx.fill(); ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2; ctx.stroke();
    for (const [x, y, r] of [[-w * 0.5, -h * 0.55, 6], [w * 0.1, -h * 0.8, 7], [w * 0.55, -h * 0.45, 5]]) ell(ctx, x, y, r, r * 0.6, shade(m.d.color, -0.2));
    ell(ctx, -w * 0.35, -h * 0.7, 5, 3, 'rgba(255,255,255,.4)');
    eyes(ctx, w * 0.0, -h * 0.45, w * 0.4, 3);
    rrect(ctx, -w * 0.2, -h * 1.05, 3, 6, 1, '#f0e0c0'); ell(ctx, -w * 0.2 + 1.5, -h * 1.05, 5, 3, '#c04a3a'); ell(ctx, -w * 0.2 - 0.5, -h * 1.07, 1, 1, '#fff');
    for (let i = 0; i < 5; i++) ell(ctx, w * 0.35 + cos(i * 1.26) * 3, -h * 0.95 + sin(i * 1.26) * 3, 2, 2, '#f8f0a0');
    ell(ctx, w * 0.35, -h * 0.95, 1.5, 1.5, '#e0a020');
    if (s.walk) for (let i = 0; i < 2; i++) ell(ctx, -w - 4 - i * 6, -2, 3 - i, 2 - i * 0.5, m.d.color2);
  });

  // 가시 딱정벌레: 반짝이는 등딱지 + 등가시 + 뿔. 여섯 다리로 기어가고 뿔로 들이받는다
  A('thorn_beetle', 'flip', 1, (ctx, m, t, s) => {
    const k = m.w / 56, step = s.walk ? t * 16 : t;
    ctx.scale(k, k);
    for (let i = 0; i < 3; i++) legPair(ctx, '#1a2a10', -14 + i * 12, -8, (i - 1) * 4 + 6, step + i * 2.1, 2.5, 1.1);
    ctx.save(); ctx.rotate(-s.atk * 0.15);
    ell(ctx, -2, -16, 24, 14, m.d.color, m.d.color2, 2);
    line(ctx, m.d.color2, 2, [[-2, -30], [-2, -3]]);
    ell(ctx, -10, -22, 6, 3, 'rgba(255,255,255,.35)'); ell(ctx, 6, -22, 5, 2.5, 'rgba(255,255,255,.25)');
    for (let i = 0; i < 5; i++) poly(ctx, '#c0b070', [[-20 + i * 9, -27 + abs(i - 2)], [-17 + i * 9, -37 + abs(i - 2) * 2], [-14 + i * 9, -27 + abs(i - 2)]], '#6a5a2a', 1);
    ell(ctx, 22, -14, 9, 8, shade(m.d.color, -0.25), m.d.color2, 2);
    ctx.save(); ctx.translate(26, -18); ctx.rotate(-0.6 - s.atk * 0.5);
    poly(ctx, '#3a2a10', [[0, 0], [16, -4], [18, -10], [14, -6], [2, -5]]);
    ctx.restore();
    ell(ctx, 26, -14, 2.4, 2.4, '#ffd040'); ell(ctx, 26.5, -14, 1, 1.4, '#111');
    ctx.restore();
  });

  // 동굴 거미: 무늬 있는 배 + 마디 다리 여덟 개 + 붉은 눈 여러 개. 공격 땐 앞다리를 치켜든다
  A('cave_spider', 'flip', 1, (ctx, m, t, s) => {
    const k = m.w / 58, step = s.walk ? t * 18 : t * 1.5, rear = s.atk;
    ctx.scale(k, k);
    for (let i = 0; i < 4; i++) for (const back of [0, 1]) {
      const bx = 4 - i * 4, ph = step + i * 1.6 + back * PI, reach = back ? -(16 + i * 4) : 18 + (3 - i) * 3;
      const lift = (!back && i === 3) ? rear * 14 : 0;
      ctx.strokeStyle = m.d.color2; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx, -14); ctx.lineTo(bx + reach * 0.5, -26 - lift + sin(ph) * 3); ctx.lineTo(bx + reach, -lift * 0.6 + abs(sin(ph)) * -2); ctx.stroke();
    }
    ctx.save(); ctx.rotate(-rear * 0.18);
    ell(ctx, -14, -18, 18, 14, m.d.color, m.d.color2, 2);
    poly(ctx, '#c03040', [[-14, -27], [-9, -18], [-14, -10], [-19, -18]]);
    ell(ctx, 6, -16, 11, 9, shade(m.d.color, 0.1), m.d.color2, 2);
    for (const [x, y, r] of [[10, -20, 2.2], [14, -19, 2.2], [9, -16, 1.5], [13, -15, 1.5], [16, -16, 1.3], [7, -18, 1.2]]) { ell(ctx, x, y, r, r, '#ff3040'); }
    glow(ctx, 12, -18, 10, 'rgba(255,40,60,.6)', 0.4);
    line(ctx, '#e8e0d0', 2, [[15, -10], [17, -5 + rear * 3]]); line(ctx, '#e8e0d0', 2, [[11, -10], [12, -5 + rear * 3]]);
    ctx.restore();
    line(ctx, 'rgba(230,230,240,.35)', 1, [[-30, -18], [-30, -60]]);
  });

  // 거미줄 박쥐: 막 날개를 퍼덕이는 박쥐. 발에 거미줄이 늘어지고, 공격 땐 날개를 접고 급강하
  A('web_bat', 'fall', 0.5, (ctx, m, t, s) => {
    const r = m.w / 2, flap = s.atk > 0 ? -0.9 : sin(t * 16), dive = s.atk * 8;
    ctx.translate(0, -r + dive);
    for (const sg of [-1, 1]) {
      ctx.save(); ctx.scale(sg, 1); ctx.rotate(flap * 0.45);
      ctx.fillStyle = m.d.color2; ctx.beginPath(); ctx.moveTo(4, -2);
      ctx.lineTo(14, -12); ctx.lineTo(24, -8); ctx.quadraticCurveTo(22, 0, 26, 4); ctx.quadraticCurveTo(18, 2, 16, 8); ctx.quadraticCurveTo(10, 3, 4, 6); ctx.closePath(); ctx.fill();
      line(ctx, shade(m.d.color2, -0.3), 1.2, [[4, -1], [14, -12], [24, -8]]); line(ctx, shade(m.d.color2, -0.3), 1, [[14, -12], [16, 8]]);
      ctx.restore();
    }
    ell(ctx, 0, 0, 9, 10, m.d.color, m.d.color2, 2);
    poly(ctx, m.d.color, [[-7, -6], [-6, -16], [-2, -8]]); poly(ctx, m.d.color, [[7, -6], [6, -16], [2, -8]]);
    ell(ctx, -3, -2, 2, 2.2, '#ffdd60'); ell(ctx, 3, -2, 2, 2.2, '#ffdd60');
    poly(ctx, '#fff', [[-2, 4], [-1, 7], [0, 4]]); poly(ctx, '#fff', [[1, 4], [2, 7], [3, 4]]);
    ctx.strokeStyle = 'rgba(235,235,245,.6)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-3, 9); ctx.lineTo(-6, 22 + sin(t * 3) * 2); ctx.moveTo(3, 9); ctx.lineTo(5, 20 + sin(t * 3 + 1) * 2); ctx.moveTo(-6, 16); ctx.lineTo(4, 15); ctx.stroke();
  });

  // 늪 두꺼비: 사마귀 돋은 등 + 위로 솟은 눈 + 부푸는 울음주머니. 폴짝 뛰고 혀를 쭉 뻗는다
  A('swamp_toad', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, h = m.h, ph = (t * 2.2) % 1, hop = s.walk ? sin(ph * PI) * 14 : 0, sac = 1 + abs(sin(t * 3)) * 0.5;
    ctx.translate(0, -hop);
    for (const [x, sg] of [[-w * 0.55, -1], [w * 0.35, 1]]) { const ext = hop > 4 ? 6 : 0; poly(ctx, m.d.color2, [[x, -6], [x - 6 - ext, 0 + ext * 0.3], [x + 8, 0 + ext * 0.3]]); }
    ell(ctx, 0, -h * 0.42, w * 0.9, h * 0.42, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.1, -h * 0.22, w * 0.6, h * 0.17, shade(m.d.color, 0.35));
    for (const [x, y] of [[-w * 0.5, -h * 0.6], [-w * 0.2, -h * 0.75], [-w * 0.65, -h * 0.35], [w * 0.05, -h * 0.65]]) ell(ctx, x, y, 3, 2.5, shade(m.d.color, -0.25));
    ell(ctx, w * 0.62, -h * 0.25, 7 * sac, 5.5 * sac, '#e8e0a0', '#a0985a', 1);
    for (const x of [w * 0.2, w * 0.55]) { ell(ctx, x, -h * 0.82, 6.5, 6.5, m.d.color, m.d.color2, 1.5); ell(ctx, x + 1, -h * 0.84, 4, 4, '#ffe060'); rrect(ctx, x - 0.5, -h * 0.88, 3, 6, 1, '#111'); }
    line(ctx, '#1a3a1a', 2, [[w * 0.25, -h * 0.42], [w * 0.88, -h * 0.4]]);
    if (s.atk > 0) { const L = 26 * sin(s.atk * PI); line(ctx, '#e06080', 3.5, [[w * 0.85, -h * 0.4], [w * 0.85 + L, -h * 0.42]]); ell(ctx, w * 0.85 + L, -h * 0.42, 3.5, 3.5, '#e06080'); }
  });

  // 반딧불 정령: 빛나는 꽁무니를 단 작은 곤충 요정. 빛이 맥박처럼 깜빡이고, 공격 땐 번쩍
  A('firefly_spirit', 'fall', 0.4, (ctx, m, t, s) => {
    const r = m.w / 2, flap = sin(t * 30), pulse = 0.6 + 0.4 * sin(t * 4) + s.atk * 0.8;
    ctx.translate(0, -r);
    glow(ctx, -8, 4, 22 + pulse * 10, '#fff8a0', 0.35 + pulse * 0.3);
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(-1, -6); ctx.rotate(sg * (0.6 + flap * 0.4) - PI / 2); ell(ctx, 0, -9, 4, 9, 'rgba(230,250,255,.55)', 'rgba(180,220,240,.7)', 1); ctx.restore(); }
    ell(ctx, -8, 4, 8, 7, m.d.color, m.d.color2, 1.5);
    ell(ctx, -8, 4, 5, 4, '#fffde0');
    ell(ctx, 2, -2, 6, 5, '#3a3a20', '#1a1a10', 1);
    ell(ctx, 8, -6, 6, 6, '#4a4a2a', '#1a1a10', 1);
    ell(ctx, 10, -7, 2, 2.2, '#fff'); ell(ctx, 10.5, -7, 1, 1.4, '#111');
    line(ctx, '#2a2a10', 1.2, [[9, -11], [12, -18], [15, -19]]); line(ctx, '#2a2a10', 1.2, [[7, -11], [8, -19], [10, -21]]);
    ell(ctx, 15, -19, 1.5, 1.5, '#fff8a0'); ell(ctx, 10, -21, 1.5, 1.5, '#fff8a0');
  });

  // 오염된 숲의 정령 모르웬: 나무껍질 몸 + 시든 잎 머리칼 + 보랏빛 오염 균열. 2페이즈에 더 일그러진다
  A('morwen', 'melt', 1, (ctx, m, t, s) => {
    const h = m.h, w = m.w / 2, ph = m.boss ? m.boss.phase : 0, cast = m.boss && m.boss.cur ? 1 : s.atk, sway = sin(t * 1.5) * 0.05;
    ctx.rotate(sway);
    // 뿌리
    for (let i = 0; i < 6; i++) { const x = -w * 0.6 + i * w * 0.24; line(ctx, '#3a2a18', 6 - abs(i - 2.5), [[x * 0.5, -h * 0.15], [x, -h * 0.05], [x * 1.3 + sin(t + i) * 4, 0]]); }
    // 몸통 (드레스 같은 나무 줄기)
    const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#6a5a3a'); g.addColorStop(1, '#3a2a18');
    poly(ctx, g, [[-w * 0.22, -h * 0.72], [w * 0.22, -h * 0.72], [w * 0.55, -h * 0.08], [-w * 0.55, -h * 0.08]], '#2a1a0a', 2);
    ctx.strokeStyle = 'rgba(30,20,10,.5)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.15 + i * w * 0.1, -h * 0.68); ctx.quadraticCurveTo(-w * 0.2 + i * w * 0.14, -h * 0.4, -w * 0.35 + i * w * 0.23, -h * 0.1); ctx.stroke(); }
    // 오염 균열 (페이즈가 오르면 커짐)
    ctx.strokeStyle = ph ? '#e040ff' : '#a040d0'; ctx.lineWidth = ph ? 3 : 2; ctx.shadowColor = '#c040ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(-w * 0.05, -h * 0.65); ctx.lineTo(w * 0.06, -h * 0.5); ctx.lineTo(-w * 0.04, -h * 0.38); ctx.lineTo(w * 0.1, -h * 0.22);
    if (ph) { ctx.moveTo(-w * 0.3, -h * 0.3); ctx.lineTo(-w * 0.15, -h * 0.4); ctx.moveTo(w * 0.3, -h * 0.35); ctx.lineTo(w * 0.18, -h * 0.5); }
    ctx.stroke(); ctx.shadowBlur = 0;
    // 가지 팔
    for (const sg of [-1, 1]) {
      const up = cast * 1.5 + sin(t * 2 + sg) * 0.1;
      ctx.save(); ctx.translate(sg * w * 0.2, -h * 0.66); ctx.rotate(-sg * (0.65 + up));
      line(ctx, '#4a3a22', 10, [[0, 0], [0, h * 0.3]]);
      line(ctx, '#4a3a22', 5, [[0, h * 0.18], [sg * 12, h * 0.3]]); line(ctx, '#4a3a22', 4, [[0, h * 0.3], [-sg * 8, h * 0.4]]); line(ctx, '#4a3a22', 3, [[0, h * 0.3], [sg * 4, h * 0.42]]);
      for (const [lx, ly] of [[sg * 12, h * 0.3], [-sg * 8, h * 0.4]]) { ctx.fillStyle = '#5a7a3a'; ctx.beginPath(); ctx.ellipse(lx, ly, 5, 3, 0.5, 0, PI * 2); ctx.fill(); }
      if (cast > 0) glow(ctx, 0, h * 0.36, 22, '#c060ff', 0.8);
      ctx.restore();
    }
    // 얼굴
    ell(ctx, 0, -h * 0.8, w * 0.2, h * 0.1, '#8a7a5a', '#3a2a18', 2);
    const eye = ph ? '#ff40c0' : '#d070ff';
    ctx.shadowColor = eye; ctx.shadowBlur = 12;
    ell(ctx, -w * 0.07, -h * 0.81, 4, 2.5, eye); ell(ctx, w * 0.07, -h * 0.81, 4, 2.5, eye);
    ctx.shadowBlur = 0;
    line(ctx, '#2a1a0a', 1.5, [[-w * 0.06, -h * 0.75], [0, -h * 0.76], [w * 0.06, -h * 0.75]]);
    // 시든 잎 머리칼
    for (let i = 0; i < 14; i++) {
      const a = PI + i / 13 * PI, rr = w * 0.32, x = cos(a) * rr, y = -h * 0.84 + sin(a) * h * 0.13;
      ctx.save(); ctx.translate(x, y + sin(t * 2 + i) * 2); ctx.rotate(a + PI / 2);
      ctx.fillStyle = i % 3 === 0 ? (ph ? '#8a3aa0' : '#7a6a3a') : (i % 2 ? '#5a7a3a' : '#6a8a4a');
      ctx.beginPath(); ctx.ellipse(0, -8, 4, 10, 0, 0, PI * 2); ctx.fill(); ctx.restore();
    }
    // 떨어지는 잎
    for (let i = 0; i < 3; i++) { const y = ((t * 30 + i * 50) % (h * 0.8)); ctx.save(); ctx.translate(-w * 0.4 + i * w * 0.4, -h * 0.85 + y); ctx.rotate(t * 2 + i); ctx.fillStyle = ph ? '#9a5ab0' : '#8a8a4a'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
  });

  // ======================= 광산도시 라그하르트 =======================
  // 광산 쥐: 안전모와 헤드램프를 쓴 먼지투성이 쥐. 램프 불빛이 앞을 비춘다
  A('mine_rat', 'flip', 1, (ctx, m, t, s) => {
    const w = m.w / 2, run = s.walk ? t * 20 : 0, hop = s.walk ? abs(sin(run)) * 3 : 0, lunge = s.atk * 7;
    ctx.translate(lunge, -hop);
    glow(ctx, w * 1.4, -22, 26, 'rgba(255,240,170,.8)', 0.35);
    line(ctx, '#b09080', 2, [[-w * 0.65, -9], [-w * 1.0, -15 + sin(t * 5) * 3], [-w * 1.3, -5]]);
    for (const [x, ph] of [[-w * 0.35, 0], [w * 0.3, PI]]) { ctx.save(); ctx.translate(x, -6); ctx.rotate(sin(run + ph) * 0.6); rrect(ctx, -2.5, 0, 5, 7, 2, m.d.color2); ctx.restore(); }
    ell(ctx, -3, -12, w * 0.68, 11, m.d.color, m.d.color2, 2);
    for (const [x, y] of [[-12, -16], [-4, -9], [4, -15]]) ell(ctx, x, y, 2.5, 1.5, 'rgba(40,30,20,.35)');
    ell(ctx, w * 0.5, -16, 12, 10, m.d.color, m.d.color2, 2);
    ell(ctx, w * 0.25, -25, 5, 5, m.d.color, m.d.color2, 1.5);
    ell(ctx, w * 0.92, -15, 2.6, 2.4, '#d06070');
    ell(ctx, w * 0.62, -18, 2.2, 2.6, '#111');
    rrect(ctx, w * 0.78, -12, 4, 4 + s.atk * 2, 1, '#fffbe8');
    ctx.fillStyle = '#e8b020'; ctx.beginPath(); ctx.ellipse(w * 0.45, -24, 12, 8, 0, PI, 0); ctx.fill(); ell(ctx, w * 0.45, -24, 14, 2.5, '#c08a10');
    rrect(ctx, w * 0.62, -31, 6, 5, 2, '#5a5a62'); ell(ctx, w * 0.72, -28.5, 2.5, 2.5, '#fff8c0');
  });

  // (1.7.8) 폐광 바위웜 · 용광로 도롱뇽 · 용암 웅덩이는 monsters4.js

  // 태엽 병사: 원통 몸 + 둥근 투구 + 등에서 도는 태엽 열쇠 + 총검. 뻣뻣하게 행진하고 총검으로 찌른다
  A('clockwork', 'crumble', 1, (ctx, m, t, s) => {
    const h = m.h, march = s.walk ? sin(t * 9) : 0, thrust = s.atk * 12;
    ctx.translate(0, -abs(march) * 1.5);
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 5, -h * 0.32); ctx.rotate((sg > 0 ? march : -march) * 0.4); rrect(ctx, -3.5, 0, 7, h * 0.32, 2, m.d.color2); rrect(ctx, -4.5, h * 0.29, 10, 4, 1, '#2a2a32'); ctx.restore(); }
    rrect(ctx, -11, -h * 0.68, 22, h * 0.38, 4, m.d.color, shade(m.d.color, -0.4));
    for (const y of [-h * 0.6, -h * 0.45]) line(ctx, shade(m.d.color, -0.3), 1.5, [[-11, y], [11, y]]);
    for (const [x, y] of [[-8, -h * 0.64], [8, -h * 0.64], [-8, -h * 0.36], [8, -h * 0.36]]) ell(ctx, x, y, 1.3, 1.3, '#d8d8e0');
    ell(ctx, 0, -h * 0.52, 4, 4, '#c9a33a', '#7a5a1a', 1);
    // 등의 태엽 열쇠 (계속 돈다)
    ctx.save(); ctx.translate(-14, -h * 0.52); line(ctx, '#c9a33a', 2.5, [[0, 0], [-6, 0]]);
    ctx.translate(-8, 0); ctx.scale(1, abs(cos(t * 5)) + 0.15); ell(ctx, 0, -5, 3.5, 4.5, null, '#c9a33a', 2.2); ell(ctx, 0, 5, 3.5, 4.5, null, '#c9a33a', 2.2); ctx.restore();
    // 머리 + 투구
    rrect(ctx, -9, -h * 0.9, 18, h * 0.22, 6, shade(m.d.color, 0.15), shade(m.d.color, -0.4));
    rrect(ctx, -2, -h * 0.84, 12, 4, 2, '#1a1a22'); ell(ctx, 6, -h * 0.82, 2.2, 1.4, s.atk > 0 ? '#ff4040' : '#60e0ff');
    ctx.fillStyle = '#a03030'; ctx.beginPath(); ctx.ellipse(0, -h * 0.9, 10, 7, 0, PI, 0); ctx.fill(); rrect(ctx, -1.5, -h * 1.02, 3, 6, 1, '#c9a33a');
    // 총검
    ctx.save(); ctx.translate(8 + thrust, -h * 0.5); ctx.rotate(-0.05);
    rrect(ctx, -6, -2, 26, 4, 1, '#5a4030'); line(ctx, '#3a3a42', 2.5, [[4, -3], [20, -3]]);
    poly(ctx, '#e0e4ee', [[20, -5], [32, -3], [20, -1]], '#8a90a0', 1);
    ctx.restore();
    ell(ctx, 8, -h * 0.5, 4, 4, m.d.color, shade(m.d.color, -0.4), 1);
  });

  // 감시 드론: 프로펠러가 도는 원반형 기계 + 좌우로 훑는 붉은 렌즈 + 깜빡이는 안테나
  A('drone', 'fall', 0.5, (ctx, m, t, s) => {
    const r = m.w / 2, bob = sin(t * 3) * 2, scan = sin(t * 1.8) * 4;
    ctx.translate(0, -r + bob);
    for (const sg of [-1, 1]) {
      line(ctx, '#4a4a52', 2, [[sg * 8, -8], [sg * 14, -14]]);
      ctx.save(); ctx.translate(sg * 14, -15); ctx.scale(abs(cos(t * 40 + sg)) * 0.9 + 0.1, 1);
      ell(ctx, 0, 0, 12, 2, 'rgba(200,210,220,.7)'); ctx.restore();
      ell(ctx, sg * 14, -15, 2, 2, '#2a2a32');
    }
    rrect(ctx, -r * 0.8, -9, r * 1.6, 16, 7, m.d.color, m.d.color2);
    line(ctx, shade(m.d.color, -0.3), 1.2, [[-r * 0.7, 0], [r * 0.7, 0]]);
    ell(ctx, scan, 8, 9, 6, '#2a2a32', '#14141a', 1.5);
    const flash = s.atk > 0 && s.atk < 0.5;
    ell(ctx, scan + 1, 8, 4.5, 4.5, flash ? '#fff0f0' : '#ff3040');
    glow(ctx, scan + 1, 8, flash ? 22 : 12, '#ff2040', flash ? 0.9 : 0.5);
    ell(ctx, scan + 2.5, 6.5, 1.3, 1.3, '#fff');
    line(ctx, '#4a4a52', 1.5, [[-r * 0.5, -9], [-r * 0.6, -18]]);
    ell(ctx, -r * 0.6, -19, 2, 2, Math.floor(t * 3) % 2 ? '#40ff80' : '#1a4a2a');
  });

  // (1.7.8) 광석 거인 · 강철 거신 그라운더 MK-7은 monsters4.js

  // ======================= 기타 =======================
  // 훈련용 허수아비 (튜토리얼): 기둥 위의 짚 인형 + 가슴의 과녁. 맞으면 흔들흔들
  A('dummy', 'crumble', 1, (ctx, m, t, s) => {
    const h = m.h, wob = sin(t * 12) * s.hurt * 0.35 + sin(t * 1.5) * 0.02;
    rrect(ctx, -12, -6, 24, 6, 2, '#6a4a2a');
    ctx.save(); ctx.rotate(wob);
    line(ctx, '#7a5a2a', 5, [[0, -2], [0, -h * 0.5]], 'butt');
    line(ctx, '#7a5a2a', 4, [[-h * 0.3, -h * 0.66], [h * 0.3, -h * 0.66]], 'butt');
    ell(ctx, 0, -h * 0.6, 14, h * 0.18, m.d.color, m.d.color2, 2);
    for (const [r, c] of [[10, '#e04040'], [7, '#fff'], [4, '#e04040']]) ell(ctx, 0, -h * 0.6, r, r, c);
    ell(ctx, 0, -h * 0.86, 11, 10, m.d.color, m.d.color2, 2);
    line(ctx, m.d.color2, 1.5, [[-6, -h * 0.94], [6, -h * 0.78]]); line(ctx, m.d.color2, 1.5, [[6, -h * 0.94], [-6, -h * 0.78]]);
    ctx.strokeStyle = '#e8c860'; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 4, -h * 0.95); ctx.lineTo(-9 + i * 4, -h * 1.02); ctx.stroke(); }
    ctx.restore();
  });

  // 썩은 열매 (모르웬 소환): 보랏빛 진물이 맺힌 썩은 열매. 터지기 직전처럼 점점 빠르게 꿈틀
  A('rot_fruit', 'pop', 0.7, (ctx, m, t, s) => {
    const r = m.w / 2, pulse = 1 + sin(t * (6 + (m.t % 4) * 2)) * 0.07;
    line(ctx, '#3a2a18', 3, [[0, -r * 2], [2, -r * 2.5], [8, -r * 2.7]]);
    ctx.fillStyle = '#4a6a2a'; ctx.beginPath(); ctx.ellipse(-6, -r * 2.2, 7, 3, -0.6, 0, PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(-r * 0.3, -r * 1.3, 2, 0, -r, r * pulse); g.addColorStop(0, shade(m.d.color, 0.25)); g.addColorStop(1, m.d.color2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -r, r * pulse, r * 1.05 * pulse, 0, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2; ctx.stroke();
    for (const [x, y, rr] of [[-6, -r * 1.3, 4], [7, -r * 0.8, 5], [-3, -r * 0.6, 3]]) ell(ctx, x, y, rr, rr * 0.8, '#2a1a10');
    ctx.strokeStyle = '#c040ff'; ctx.lineWidth = 1.5; ctx.shadowColor = '#c040ff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(-2, -r * 1.8); ctx.lineTo(3, -r * 1.4); ctx.lineTo(-1, -r * 1.1); ctx.lineTo(4, -r * 0.7); ctx.stroke(); ctx.shadowBlur = 0;
    const drip = (t * 0.7) % 1; ell(ctx, 5, -r * 0.1 + drip * r * 0.6, 2.5, 3.5, `rgba(180,60,220,${1 - drip})`);
  });
})();
