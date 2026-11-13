'use strict';
// ============================================================
// 빌드 8 (2026-11-13): 보스 새 디자인 — 사용자 확정 시안 docs/drafts/design/monster_1 (boss_final_1~3.png · README.md)
//  쉘로크 · 붉은손 바르크 · 모르웬 · 파라칸 · 카이엔(보스 · 분신) · 엘드리크(여자)의 그림을 바꿈
//  (그라운더 · 아우렐리온은 monsters4.js · monsters3.js 에서 직접 다듬음, 녹스는 그대로)
//  G.MonArt[id] 객체는 그대로 두고 draw 만 바꿈 → 쓰러지는 방식 · 그림자 · bark_decoy(boss21.js) 도 같이 따라옴
//  다듬기 필터(외곽선 · 위 밝게 아래 어둡게 · 위쪽 빛 테두리): A.refine 이 켜진 몬스터만 (엘드리크 · 녹스 빼고 7종)
// ============================================================
(function () {
  const D = G.Draw;
  let off = null, sil = null, rim = null, busy = false;
  // 빌드 9 이음새 없이: 채운 도형의 테두리 선(채우기 바로 뒤 같은 경로의 선)은 긋지 않음 → 겹친 원 · 네모의 경계가 사라지고 바깥 테두리만 남음
  const noSeam = o => { const f = o.fill, s = o.stroke, b = o.beginPath; let filled = false;
    o.beginPath = function () { filled = false; return b.apply(this, arguments); };
    o.fill = function () { filled = true; return f.apply(this, arguments); };
    o.stroke = function () { if (filled) return; return s.apply(this, arguments); };
    return () => { o.fill = f; o.stroke = s; o.beginPath = b; }; };
  // 실루엣용: 빛(lighter)은 빼고 그림 → 빛 둘레가 어둡게 번지지 않음
  const noGlow = o => { const f = o.fill, fr = o.fillRect;
    o.fill = function () { if (this.globalCompositeOperation === 'lighter') return; return f.apply(this, arguments); };
    o.fillRect = function () { if (this.globalCompositeOperation === 'lighter') return; return fr.apply(this, arguments); };
    return () => { o.fill = f; o.fillRect = fr; }; };
  const size = (c, w, h) => { if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } else c.getContext('2d').clearRect(0, 0, w, h); };
  // 보스마다 그림이 차지하는 범위(발밑 기준)를 처음 한 번 재 둠 → 화면 밖 캔버스를 그만큼만 씀 (빠르게)
  const BB = {};
  function measure(m, t) {
    const pad = 80, bw = Math.ceil(m.w * 2.6 + pad * 2), bh = Math.ceil(m.h * 2 + pad * 2), c = document.createElement('canvas'); c.width = bw; c.height = bh;
    const x = c.getContext('2d'), A = G.MonArt[m.id], keep = A.sh; A.sh = 0;
    const save = { x: m.x, y: m.y, dir: m.dir, moving: m.moving, atkAnim: m.atkAnim, soarY: m.soarY, boss: m.boss };
    let l = 1e9, r = -1e9, top = 1e9, bot = -1e9;
    try {
      busy = true;
      for (const [tt, mv, at, rs] of (m.isBoss ? [[0.3, 0, -1, 0], [1.1, 1, -1, 0], [1.9, 0, 0.5, 1], [2.7, 1, 1, 0.5], [3.5, 0, 0.2, 0], [4.4, 1, -1, 1]] : [[0.3, 0, -1, 0], [1.4, 1, 0.6, 0], [2.6, 1, 1, 0]])) {
        x.clearRect(0, 0, bw, bh); m.x = bw / 2; m.y = bh - pad; m.dir = 1; m.moving = !!mv; m.atkAnim = at; m.soarY = 0; m.boss = Object.assign({}, save.boss || {}, { raise: rs });
        G.Draw.monster(x, m, tt);
        const D = x.getImageData(0, 0, bw, bh).data;
        for (let yy = 0; yy < bh; yy += 3) for (let xx = 0; xx < bw; xx += 3) if (D[(yy * bw + xx) * 4 + 3] > 8) { if (xx < l) l = xx; if (xx > r) r = xx; if (yy < top) top = yy; if (yy > bot) bot = yy; }
      }
    } finally { busy = false; Object.assign(m, save); A.sh = keep; }
    const cx = bw / 2, cy = bh - pad, M = 28;   // 여유 (기술 예고 · 움찔 · 흔들림)
    return { hw: Math.ceil(Math.max(cx - l, r - cx) + M), up: Math.ceil(cy - top + M), dn: Math.ceil(bot - cy + M) };
  }
  // 빌드 9: 필터 결과(외곽선 + 본그림)를 한 장으로 합쳐 둠. 일반 몬스터는 마리마다 저장해 1/30초 동안 다시 씀 (한 화면에 여러 마리라 가볍게)
  const RE = 1 / 30;
  function build(m, t, A, hw, up, dn, out) {
    const bw = hw * 2, bh = up + dn, W = bw, H = bh;
    if (!off) { off = document.createElement('canvas'); sil = document.createElement('canvas'); rim = document.createElement('canvas'); }
    size(off, W, H); size(sil, W, H); size(rim, W, H); size(out, W + 4, H + 4);
    const o = off.getContext('2d'), sc = sil.getContext('2d'), rc = rim.getContext('2d'), oc = out.getContext('2d');
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none';
    const keep = A.sh; A.sh = 0; const mx = m.x, my = m.y; m.x = hw; m.y = up;
    const seam = A.refine !== 'keep', dark = !!A.dark;
    let u1 = seam ? noSeam(o) : null;
    try { busy = true; G.Draw.monster(o, m, t); } finally { if (u1) u1(); busy = false; }
    // 실루엣 그림 (빛 뺀 것)
    sc.setTransform(1, 0, 0, 1, 0, 0); u1 = seam ? noSeam(sc) : null; const u2 = noGlow(sc);
    try { busy = true; G.Draw.monster(sc, m, t); } finally { u2(); if (u1) u1(); busy = false; m.x = mx; m.y = my; A.sh = keep; }
    // 음영: 위 밝게 · 아래 어둡게 (몸 키 기준)
    o.globalCompositeOperation = 'source-atop';
    const g = o.createLinearGradient(0, up - m.h - (m.soarY || 0), 0, up - (m.soarY || 0)); g.addColorStop(0, dark ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,.16)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,10,40,.30)');
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    // 실루엣
    sc.globalCompositeOperation = 'source-in'; sc.fillStyle = 'rgba(28,18,40,.92)'; sc.fillRect(0, 0, W, H); sc.globalCompositeOperation = 'source-over';
    // 빛 테두리: 실루엣을 아래로 밀어 위쪽 가장자리만 남김
    rc.globalCompositeOperation = 'source-over'; rc.drawImage(sil, 0, 0); rc.globalCompositeOperation = 'source-in'; rc.fillStyle = '#fff'; rc.fillRect(0, 0, W, H); rc.globalCompositeOperation = 'destination-out'; rc.drawImage(sil, 0, 2.5); rc.globalCompositeOperation = 'source-over';
    o.globalCompositeOperation = 'source-atop'; o.globalAlpha = dark ? 0.12 : 0.35; o.drawImage(rim, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    // 한 장으로: 외곽선(실루엣 8방향) → 본그림
    const E = G.MonRefine.EDGE;   // 시안용: { sil: 외곽선 그림, fade: 가장자리 2px 를 배경에 스며들게 (0~1) }
    if (E && E.silA) { oc.save(); oc.globalAlpha = E.silA; for (const [dx, dy] of [[-1.3, 0], [1.3, 0], [0, -1.3], [0, 1.3], [-1, -1], [1, -1], [-1, 1], [1, 1]]) oc.drawImage(sil, 2 + dx, 2 + dy); oc.restore(); }
    else if (!E || E.sil !== false) for (const [dx, dy] of [[-1.3, 0], [1.3, 0], [0, -1.3], [0, 1.3], [-1, -1], [1, -1], [-1, 1], [1, 1]]) oc.drawImage(sil, 2 + dx, 2 + dy);
    if (E && E.fade) {   // 가장자리 띠 = 실루엣 − 2px 안으로 줄인 실루엣 → 그만큼 본그림을 투명하게 (그림에 그어진 바깥 선이 배경색으로 스며듦)
      const mk = document.createElement('canvas'); mk.width = W; mk.height = H; const mx2 = mk.getContext('2d'); mx2.drawImage(sil, 0, 0); mx2.globalCompositeOperation = 'source-in'; mx2.fillStyle = '#000'; mx2.fillRect(0, 0, W, H); mx2.globalCompositeOperation = 'source-over'; for (let i = 0; i < 4; i++) mx2.drawImage(mk, 0, 0);   // 불투명 마스크 (실루엣은 0.92 라 겹쳐 진하게)
      const ec = document.createElement('canvas'); ec.width = W; ec.height = H; const ex = ec.getContext('2d'); ex.drawImage(mk, 0, 0);
      for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) { ex.globalCompositeOperation = 'destination-in'; ex.drawImage(mk, dx, dy); }
      const bc = document.createElement('canvas'); bc.width = W; bc.height = H; const bx = bc.getContext('2d'); bx.drawImage(mk, 0, 0); bx.globalCompositeOperation = 'destination-out'; bx.drawImage(ec, 0, 0);
      if (E.tint) { const tc = document.createElement('canvas'); tc.width = W; tc.height = H; const tx = tc.getContext('2d'); tx.drawImage(bc, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = E.tint; tx.fillRect(0, 0, W, H);
        o.save(); o.globalCompositeOperation = 'source-atop'; o.globalAlpha = E.fade; o.drawImage(tc, 0, 0); o.restore(); }   // 가장자리를 밝은 색으로 덮음 (모양은 그대로)
      else { o.save(); o.globalCompositeOperation = 'destination-out'; o.globalAlpha = E.fade; o.drawImage(bc, 0, 0); o.restore(); }
    }
    oc.drawImage(off, 2, 2);
  }
  let shared = null;
  G.MonRefine = function (ctx, m, t) {
    const A = G.MonArt[m.id];
    let hw, up, dn;
    if (m.dead) { hw = Math.ceil(m.w * 1.2 + 60); up = Math.ceil(m.h * 1.8 + 60); dn = 140; }   // 쓰러질 때는 넓게
    else { const b = BB[m.id] || (BB[m.id] = measure(m, t)); hw = b.hw; up = b.up + Math.ceil(Math.max(0, m.soarY || 0)); dn = b.dn; }
    let out;
    if (m.isBoss) { out = shared || (shared = document.createElement('canvas')); build(m, t, A, hw, up, dn, out); }
    else {
      const key = (m.dir > 0 ? 1 : 0) + '|' + (m.hurtT > 0 ? 1 : 0) + '|' + (m.dead ? 1 : 0) + '|' + hw + '|' + up + '|' + dn;
      let c = m.__rf; if (!c) c = m.__rf = { cv: document.createElement('canvas'), t: -9, key: '' };
      if (c.key !== key || Math.abs(t - c.t) >= RE || m.dead) { build(m, t, A, hw, up, dn, c.cv); c.t = t; c.key = key; }
      out = c.cv;
    }
    ctx.save();
    if (A.sh && !(A.die === 'fall' && m.dead)) { ctx.save(); ctx.translate(m.x, m.y); D.shadow(ctx, m.w * 0.45 * A.sh); ctx.restore(); }
    ctx.drawImage(out, m.x - hw - 2, m.y - up - 2);
    ctx.restore();
  };
  // G.Draw.monster 를 감쌈: refine 몬스터는 필터를 거쳐 그림 (필터 안에서 부를 때는 그대로)
  const base = D.monster;
  D.monster = function (ctx, m, t) {
    const A = G.MonArt && G.MonArt[m.id];
    if (A && A.refine && !busy) return G.MonRefine(ctx, m, t);
    return base(ctx, m, t);
  };
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, c, up = 0.3, dn = -0.3) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, shade(c, up)); g.addColorStop(1, shade(c, dn)); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const eyes = (ctx, x, y, gap, r, iris) => { for (const ex of [x, x + gap]) { ell(ctx, ex, y, r, r * 1.2, '#fff', '#2a2a32', 0.6); ell(ctx, ex + r * 0.25, y + r * 0.1, r * 0.62, r * 0.8, iris || '#2a2a36'); ell(ctx, ex + r * 0.05, y - r * 0.4, r * 0.28, r * 0.28, '#fff'); ell(ctx, ex + r * 0.45, y + r * 0.45, r * 0.12, r * 0.12, '#fff'); } };
  const NEW = {};
  // 붉은손 바르크: 새 그림체 머리 · 붉은 두건 · 사막 유랑자 옷(붉게) · 언월도
  NEW.bark = (ctx, m, t) => {
    const eq = { hat: { tid: 'ar50_hat' }, top: { tid: 'ar50_top' }, bottom: { tid: 'ar50_bottom' }, shoes: { tid: 'ar50_shoes' }, gloves: { tid: 'ar50_gloves' }, cape: { tid: 'ar50_cape' }, weapon: { tid: 'wp50_warrior' } };
    for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    const look = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'tail', hairColor: '#c0402a', eye: 'sharp', eyeColor: '#c03040', skin: '#e0a878' }), '#a02a2a', '#4a2a2a');
    look.beard = true;
    D.humanoid(ctx, { wflip: 1, x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look, gear: G.Outfit.gearOf(eq), hatColor: '#8a1a1a', cape: '#5a1a1a', weapon: 'sword', wcolor: '#e8e4dc', scale: 1.7 });
  };
  G.MonArt.bark.draw = NEW.bark;
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const NEW = {};
  const human = (m, t, look, eq, o) => { const gear = G.Outfit.gearOf(eq); return Object.assign({ x: 0, y: 0, dir: 1, t, moving: m.moving, atk: m.atkAnim != null ? m.atkAnim : -1, atkKind: 'melee', look, gear }, o); };
  const lk = (o, top, bot) => G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), o), top, bot);
  // 파라칸 → 모래 폭군: 사자 갈기 금 망토 · 모래 왕국 근위병 차림(금빛) · 태양 갈고리검 · 모래 소용돌이
  NEW.parakan = (ctx, m, t, s) => {
    for (let i = 0; i < 14; i++) { const a = t * 1.8 + i * 0.45; ell(ctx, cos(a) * (44 + i % 3 * 6), -30 + sin(a) * 10 - i * 2.4, 2.2, 1.6, 'rgba(230,200,120,.55)'); }
    ctx.save(); ctx.scale(1.7, 1.7);
    for (let i = 0; i < 11; i++) { const a = PI * 0.55 + i * PI * 0.09; ell(ctx, -1 + cos(a) * 15, -50 + sin(a) * 15, 6, 8.5, i % 2 ? '#c8902a' : '#e0a838', '#7a5010', 0.8); }   // 사자 갈기
    ctx.restore();
    const eq = { hat: { tid: 'ar55_hat' }, top: { tid: 'ar55_top' }, bottom: { tid: 'ar55_bottom' }, shoes: { tid: 'ar55_shoes' }, gloves: { tid: 'ar55_gloves' }, weapon: { tid: 'wp60_warrior' } };
    for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    D.humanoid(ctx, human(m, t, lk({ hairStyle: 'short', hairColor: '#3a2a1a', eye: 'sharp', eyeColor: '#ffcf40', skin: '#c88a5a' }, '#e8b840', '#f0e8d0'), eq, { hatColor: '#e8b840', cape: '#a0701a', weapon: 'sword', wcolor: '#ffd040', scale: 1.7 }));
  };
  // 카이엔 → 공허에 물든 검사: 새 그림체 머리 · 검은 긴 코트 · 찢어진 망토 · 금 간 어둠 장검 · 어둠 날개 그림자
  NEW.kaien_boss = (ctx, m, t, s) => {
    for (const sg of [-1, 1]) { ctx.save(); ctx.translate(-6, -70); ctx.scale(sg < 0 ? 1 : 0.85, 1); for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate(-1.2 - sg * 0.2 + i * 0.22 + sin(t * 2) * 0.05); ell(ctx, 0, -24 - i * 2, 4, 26 - i * 2, `rgba(60,20,100,${0.35 - i * 0.04})`); ctx.restore(); } ctx.restore(); }
    for (let i = 0; i < 5; i++) { const a = t * 2 + i; glow(ctx, sin(a) * 26, -70 + cos(a * 1.3) * 30, 14, 'rgba(110,50,170,.9)', 0.3); }
    const base = (G.NPCS.kaien && G.NPCS.kaien.look) || {};
    const look = Object.assign({}, lk({ hairStyle: 'spiky', hairColor: '#1a1a24', eye: 'sharp', eyeColor: '#c050ff', skin: '#f0d8c0' }, '#1a1a2a', '#14141e'), { style2: 'dandy_n', eye2: 'intense_strong' });
    const eq = { top: { tid: 'ar90_top' }, bottom: { tid: 'ar90_bottom' }, shoes: { tid: 'ar90_shoes' }, gloves: { tid: 'ar90_gloves' }, cape: { tid: 'ar90_cape' }, weapon: { tid: 'wp90_warrior' } };
    for (const k in eq) if (!G.ITEMS[eq[k].tid]) delete eq[k];
    D.humanoid(ctx, human(m, t, look, eq, { cape: '#2a1440', weapon: 'sword', wcolor: '#3a2050', scale: 1.5 }));
  };
  G.MonArt.parakan.draw = NEW.parakan;
  // 카이엔: 지금 그림의 기술 예고 빛(숨결 베기 · 포효) 그대로 얹음
  G.MonArt.kaien_boss.draw = (ctx, m, t, s) => {
    const breath = m.boss && m.boss.cur && m.boss.cur.p && m.boss.cur.p.type === 'cut';
    NEW.kaien_boss(ctx, m, t, s);
    if (breath || (m.boss && m.boss.raise > 0)) glow(ctx, 30, -62, 30, '#9ae8ff', 0.7);
  };
  // 분신: 새 카이엔을 반투명 잔상 + 연기로 (크기는 분신 키에 맞춤)
  G.MonArt.kaien_clone.draw = (ctx, m, t, s) => {
    const B = G.MONSTERS.kaien_boss, k = B ? m.h / B.h : 1;
    ctx.save(); ctx.scale(k, k);
    ctx.save(); ctx.globalAlpha *= 0.45; ctx.translate(-8, 0); NEW.kaien_boss(ctx, m, t - 0.15, s); ctx.restore();
    ctx.globalAlpha *= 0.85; NEW.kaien_boss(ctx, m, t, s); ctx.restore();
    for (let i = 0; i < 3; i++) { const p = (t * 1.2 + i / 3) % 1; ell(ctx, -6 + i * 6, -10 - p * 70, 5 * (1 - p) + 1, 5 * (1 - p) + 1, `rgba(40,30,60,${0.5 * (1 - p)})`); }
  };
})();
(function () {
  const D = G.Draw, ell = D.ell, rrect = D.rrect, shade = (c, f) => G.Icons.shade(c, f), PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const NEW = {};
  const legs = (ctx, c, n, y, span, step, lw) => { for (let i = 0; i < n; i++) for (const sg of [-1, 1]) { const x = sg * 18, len = sg * (span + i * 8), ph = step + i * 1.7 + (sg > 0 ? PI : 0); line(ctx, c, lw, [[x, y], [x + len * 0.55, y - abs(len) * 0.45 + sin(ph) * 3], [x + len, sin(ph) * 1.5]]); } };
  // 쉘로크 2: 보물 상자 소라게 — 낡은 보물 상자를 껍데기로 등에 지고, 동전이 흘러넘침 · 해적 두건
  NEW.shellock = (ctx, m, t, s) => {
    const k = m.w / 170; ctx.scale(k, k);
    const guard = m.boss && m.boss.guarding, raise = m.boss ? m.boss.raise : 0, step = s.walk ? t * 9 : t;
    legs(ctx, m.d.color2, 3, -20, 40, step, 6);
    ctx.save(); ctx.translate(-30, -70); ctx.rotate(-0.08);
    rrect(ctx, -58, -30, 116, 66, 8, vg(ctx, -30, 36, '#a0703a', '#5a3a1a'), '#2a1a0a', 3);   // 상자 몸
    for (const x of [-30, 0, 30]) line(ctx, 'rgba(40,20,10,.5)', 2, [[x, -26], [x, 32]]);
    const lid = guard ? 0 : 0.18 + abs(sin(t * 1.5)) * 0.08;
    ctx.save(); ctx.translate(-58, -30); ctx.rotate(-lid);   // 뚜껑
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(58, -46, 116, 0); ctx.closePath(); ctx.fillStyle = vg(ctx, -40, 0, '#b8803a', '#6a4a1a'); ctx.fill(); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 3; ctx.stroke();
    line(ctx, '#e8c050', 5, [[20, -26], [20, 0]]); line(ctx, '#e8c050', 5, [[96, -26], [96, 0]]); ctx.restore();
    if (!guard) { glow(ctx, 0, -34, 40, '#ffe080', 0.6); for (let i = 0; i < 7; i++) ell(ctx, -40 + i * 13, -32 - (i % 2) * 4, 6, 3, '#ffd040', '#a07a10', 1); }
    for (const x of [-38, 38]) rrect(ctx, x - 4, -30, 8, 66, 2, '#e8c050', '#8a6a10', 1.5);   // 금 띠
    rrect(ctx, -9, -12, 18, 16, 3, '#e8c050', '#8a6a10', 1.5); ell(ctx, 0, -5, 3, 3, '#3a2a10');   // 자물쇠
    for (const [x, y] of [[-48, 30], [46, 26]]) { line(ctx, '#3a8a5a', 4, [[x, y], [x - 6, y + 16]]); }   // 미역
    ctx.restore();
    if (guard) { for (let i = 0; i < 3; i++) ell(ctx, 30 + i * 12, -60 - ((t * 40 + i * 20) % 60), 4, 4, 'rgba(200,230,255,.6)'); return; }
    ell(ctx, 22, -32, 40, 24, vg(ctx, -56, -8, shade(m.d.color, 0.2), shade(m.d.color, -0.25)), m.d.color2, 3);
    ell(ctx, 58, -22, 12, 9, m.d.color, m.d.color2, 2.5);
    // 큰 집게: 마디 두 개 + 볼록한 손바닥 + 굽은 아래 집게(고정) · 위 집게(움직임) · 톱니
    const cC = m.d.color, cD = m.d.color2, op = raise > 0 ? 0.55 : abs(sin(t * 2)) * 0.22;
    ctx.save(); ctx.translate(44, -46); ctx.rotate(-0.55 - raise * 1.2 + s.atk * 0.3);
    ell(ctx, 6, 0, 13, 10, vg(ctx, -10, 10, shade(cC, 0.2), shade(cC, -0.2)), cD, 2.4);   // 첫 마디
    ctx.translate(16, -4); ctx.rotate(0.45); ell(ctx, 10, 0, 15, 11, vg(ctx, -11, 11, shade(cC, 0.2), shade(cC, -0.2)), cD, 2.4); ell(ctx, 0, 0, 5, 5, shade(cC, -0.15), cD, 1.4);   // 둘째 마디 + 관절
    ctx.translate(26, 0); ctx.rotate(-0.5);
    ctx.beginPath(); ctx.ellipse(8, 2, 22, 17, 0, 0, PI * 2); ctx.fillStyle = vg(ctx, -15, 19, shade(cC, 0.28), shade(cC, -0.25)); ctx.fill(); ctx.strokeStyle = cD; ctx.lineWidth = 2.6; ctx.stroke();   // 손바닥
    for (const [x, y] of [[0, -6], [10, -10], [-4, 6]]) ell(ctx, x, y, 2.4, 2, shade(cC, 0.4));
    ctx.beginPath(); ctx.moveTo(24, 8); ctx.quadraticCurveTo(46, 10, 54, -2); ctx.quadraticCurveTo(44, 2, 26, 0); ctx.closePath(); ctx.fillStyle = vg(ctx, -2, 12, cC, shade(cC, -0.3)); ctx.fill(); ctx.strokeStyle = cD; ctx.lineWidth = 2; ctx.stroke();   // 아래 집게
    for (let i = 0; i < 3; i++) poly(ctx, '#fff4e0', [[30 + i * 7, 1.6], [33 + i * 7, -2.4], [35 + i * 7, 1]]);
    ctx.save(); ctx.translate(24, -4); ctx.rotate(-op);
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(22, -18, 32, -4); ctx.quadraticCurveTo(22, -6, 2, 2); ctx.closePath(); ctx.fillStyle = vg(ctx, -14, 2, shade(cC, 0.3), cC); ctx.fill(); ctx.strokeStyle = cD; ctx.lineWidth = 2; ctx.stroke();   // 위 집게
    for (let i = 0; i < 3; i++) poly(ctx, '#fff4e0', [[8 + i * 7, -3], [11 + i * 7, 1], [13 + i * 7, -3.4]]);
    ctx.restore();
    ell(ctx, 40, 2, 5, 5, '#f4f0ff', '#a0a0c0', 1.4); ell(ctx, 38.6, 0.6, 1.6, 1.6, '#fff');   // 진주
    ctx.restore();
    // 해적 두건 + 눈
    line(ctx, m.d.color2, 4, [[26, -54], [24, -76]]); line(ctx, m.d.color2, 4, [[42, -52], [44, -74]]);
    ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.ellipse(34, -80, 22, 9, 0, PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(12, -80); ctx.lineTo(2, -86 + sin(t * 6) * 2); ctx.lineTo(4, -76); ctx.fill();
    for (const x of [26, 42]) ell(ctx, 34 + (x - 34) * 0.5 + (x - 34) * 0.5, -80, 1.6, 1.6, '#fff');
    for (const x of [24, 44]) { ell(ctx, x, -78, 7.5, 7.5, '#fff', m.d.color2, 2); ell(ctx, x + 2, -77, 3.6, 4.6, '#200'); ell(ctx, x + 3, -79, 1.3, 1.3, '#fff'); }
    line(ctx, '#300', 3, [[16, -88], [30, -84]]); line(ctx, '#300', 3, [[38, -84], [52, -88]]);
  };
  G.MonArt.shellock.draw = NEW.shellock;
})();
(function () {
  const D = G.Draw, ell = D.ell, PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
  const NEW = {};
  // ===== 모르웬: 지금 그림(나무껍질 드레스 몸 · 시든 잎 머리칼 · 가지 팔 · 보랏빛 균열)에 연꽃 =====
  //  뿌리 → 물 위 연잎 + 몸 아래를 감싼 연꽃 · 잎 머리칼 사이 연꽃 왕관 · 가지 끝 잎 → 연꽃 봉오리 · 떨어지는 잎 → 연꽃잎
  NEW.morwen = (ctx, m, t, s) => {
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
    // (머리 중앙 연꽃 왕관은 사용자 요청으로 뺌, 8차)
    // 떨어지는 연꽃잎
    for (let i = 0; i < 3; i++) { const y = ((t * 30 + i * 50) % (h * 0.8)); ctx.save(); ctx.translate(-w * 0.4 + i * w * 0.4, -h * 0.85 + y); ctx.rotate(t * 2 + i);
      ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(3.4, 0, 0, 5); ctx.quadraticCurveTo(-3.4, 0, 0, -5); ctx.fillStyle = ph ? '#c060e0' : '#f8c0dc'; ctx.fill(); ctx.restore(); }
  };
  G.MonArt.morwen.draw = NEW.morwen;
})();
(function () {
  const D = G.Draw, ell = D.ell, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const line = (ctx, c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  const poly = (ctx, fill, pts, stroke, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const vg = (ctx, y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const glow = (ctx, x, y, r, c, a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.restore(); };
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
    D.humanoid(ctx, { x: 0, y: 0, dir: 1, t, moving: m.moving, air: false, atk: -1, atkKind: 'proj',
      look: F ? { gender: 'f', cool: 1, skin: '#ecdce0', hair: '#cfc8e4', top: '#2a1440', bottom: '#140a20', style: 'long', eye2: F.eye, eyeColor: '#e02848', hat: '#1e0e30' } : { skin: '#d8c8cc', hair: '#b8b8cc', top: '#2a1440', bottom: '#140a20', style: 'long', beard: true, eye: 'sharp', eyeColor: '#ff2040', hat: '#1e0e30' },
      weapon: null, cape: '#0a0410', scale: sc });
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
  // 여성판 얼굴: 덜 사악하게 — 차갑고 우아한 눈매(반쯤 내려온 눈꺼풀 · 날개 아이라인) · 가는 눈썹 · 짙은 입술의 옅은 미소, 볼 홍조 없음
  const ELF = (ctx, t) => {
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
  // 엘드리크 (빌드 8: 여자 · 차가운 냉미녀 흑마법사, 다듬기 필터 없음)
  G.MonArt.eldrick.draw = (ctx, m, t, s) => ELD(ctx, m, t, s, { eye: 'f_mystic', face: ELF });
})();
// 다듬기 필터를 씌울 보스 (녹스 빼고)
for (const id of ['shellock', 'bark', 'morwen', 'grounder', 'parakan', 'kaien_boss', 'aurelion', 'eldrick']) if (G.MonArt[id]) G.MonArt[id].refine = 'seam';   // 빌드 9: 이음새 없이 · 엘드리크도
if (G.MonArt.eldrick) G.MonArt.eldrick.dark = true;   // 어두운 옷: 위쪽 밝힘 · 빛 테두리 약하게
