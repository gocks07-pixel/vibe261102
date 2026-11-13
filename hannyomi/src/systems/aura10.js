// 빌드 10: 4차 각성 버프 모습 8종 새로 (시안 · 결정 docs/drafts/design/aura_A/README.md)
//  - 색을 직접 칠함 (빛 더하기 'lighter' 를 쓰지 않아 밝은 · 어두운 배경 모두 또렷)
//  - 그리는 자리 셋: back = 캐릭터 뒤 (G.SkillX.aura) · front = 캐릭터 앞 (G.SkillX.auraFront) · 무기 = humanoid 의 wglow (팔과 함께 휘둘러짐)
//  - 천궁 별 활 · 현자 구름은 캐릭터를 스프링처럼 따라다님 (p.__af)
//  skillx.js 다음에 불러옴. PC · EXE 와 같이 쓰는 파일 (G.Mobile · G.Touch 안 씀)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const ell = (c, x, y, rx, ry, f) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); c.fillStyle = f; c.fill(); };
  const soft = (c, x, y, r, col, a) => { c.save(); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha *= a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const star = (c, x, y, r, f) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; c.lineTo(x + cos(a) * rr, y + sin(a) * rr); } c.closePath(); c.fillStyle = f; c.fill(); };

  // ---------- 따라다니기: 목표점으로 스프링처럼 (움직이면 늦게 따라오며 기울고, 멈추면 제자리) ----------
  function follow(p, key, tx, ty) {
    const F = p.__af || (p.__af = {}); let s = F[key];
    const dt = s ? Math.min(0.05, Math.max(0, p.t - s.lt)) : 0;
    if (!s || Math.abs(s.x - tx) > 260 || Math.abs(s.y - ty) > 260 || p.t < s.lt) s = F[key] = { x: tx, y: ty, vx: 0, vy: 0, lt: p.t };   // 처음 · 맵 이동 · 순간이동 → 바로 제자리
    const k = 40, d = 9;
    for (let n = 0, h = dt / 2; n < 2; n++) { s.vx += ((tx - s.x) * k - s.vx * d) * h; s.vy += ((ty - s.y) * k - s.vy * d) * h; s.x += s.vx * h; s.y += s.vy * h; }
    s.lt = p.t; s.tilt = Math.max(-0.35, Math.min(0.35, -s.vx / 600));
    return s;
  }

  // ---------- 머리 위 문장 ----------
  const emblemY = (p) => p.y - 98 + sin(p.t * 2) * 2;
  function shieldEmblem(c, p) {   // 불멸: 십자 금빛 방패
    const x = p.x, y = emblemY(p), br = 0.8 + 0.2 * sin(p.t * 3); soft(c, x, y, 22, 'rgba(255,230,140,.7)', br);
    c.save(); c.translate(x, y); c.beginPath(); c.moveTo(0, -11); c.quadraticCurveTo(9, -10, 10, -6); c.quadraticCurveTo(9, 6, 0, 12); c.quadraticCurveTo(-9, 6, -10, -6); c.quadraticCurveTo(-9, -10, 0, -11); c.closePath();
    const g = c.createLinearGradient(0, -11, 0, 12); g.addColorStop(0, '#fff6c8'); g.addColorStop(1, '#d8a030'); c.fillStyle = g; c.fill(); c.strokeStyle = '#8a6010'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(-1.2, -6, 2.4, 12); c.fillRect(-5, -2, 10, 2.4); c.restore();
  }
  function scopeEmblem(c, p) {   // 저격왕: 조준 표식 (눈금이 돌고 가운데 붉은 점 깜빡)
    const t = p.t, x = p.x, y = emblemY(p); soft(c, x, y, 20, 'rgba(170,230,100,.6)', 0.8 + 0.2 * sin(t * 3));
    c.save(); c.translate(x, y); c.lineCap = 'round'; for (const [w, col] of [[3.6, '#4a6a1a'], [2, '#c8f07a']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(0, 0, 10, 0, PI * 2); c.stroke(); }
    c.rotate(t * 0.6); for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * PI / 2); for (const [w, col] of [[3.4, '#4a6a1a'], [1.8, '#eaffc0']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -15); c.stroke(); } c.restore(); }
    c.restore(); ell(c, x, y, 2.2, 2.2, `rgba(255,80,60,${0.6 + 0.4 * sin(t * 6)})`);
  }

  // ---------- 허리 둘레를 도는 것 (화염군주 불씨 · 야천 표창 · 검무 쌍검) ----------
  const ORX = 42, ORY = 6, OY = -26;
  const flick = (c, x, y, h, w, t, s) => { const sw = sin(t * 9 + s) * w * 0.4; for (const [k, col] of [[1, '#e8401a'], [0.7, '#ff9a2a'], [0.4, '#ffe890']]) { const hh = h * k, ww = w * (0.4 + 0.6 * k); c.beginPath(); c.moveTo(x - ww, y); c.quadraticCurveTo(x - ww, y - hh * 0.6, x + sw * k, y - hh); c.quadraticCurveTo(x + ww, y - hh * 0.6, x + ww, y); c.quadraticCurveTo(x, y + ww * 0.8, x - ww, y); c.fillStyle = col; c.fill(); } };
  function emberOrbit(c, p, front) {
    const t = p.t, a = t * 1.6, x = p.x + cos(a) * ORX, y = p.y + OY + sin(a) * ORY + sin(t * 3) * 2; if ((sin(a) > 0) !== front) return;
    soft(c, x, y, 14, 'rgba(255,120,30,.6)', 1); flick(c, x, y + 2, 12, 4, t, 3); ell(c, x, y + 1, 4, 4, '#ffb030'); ell(c, x - 0.6, y + 0.4, 2, 2, '#fff6d0');
    for (let i = 1; i <= 3; i++) { const b = a - i * 0.22; c.save(); c.globalAlpha *= 0.5 - i * 0.12; ell(c, p.x + cos(b) * ORX, p.y + OY + sin(b) * ORY, 2.4 - i * 0.4, 2.4 - i * 0.4, '#ff8a30'); c.restore(); }
  }
  function shuri(c, r, rot) { c.save(); c.rotate(rot); c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, rr = i % 2 ? r * 0.32 : r; c.lineTo(cos(a) * rr, sin(a) * rr); } c.closePath();
    const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, '#e8e0ff'); g.addColorStop(1, '#5a3a9a'); c.fillStyle = g; c.fill(); c.strokeStyle = '#2a1450'; c.lineWidth = 0.9; c.stroke(); ell(c, 0, 0, r * 0.18, r * 0.18, '#2a1450'); c.restore(); }
  function starOrbit(c, p, front) {
    const t = p.t, a = t * 1.6, x = p.x + cos(a) * ORX, y = p.y + OY + sin(a) * ORY + sin(t * 3) * 2; if ((sin(a) > 0) !== front) return;
    soft(c, x, y, 12, 'rgba(170,130,255,.6)', 1); c.save(); c.translate(x, y); shuri(c, 6.5, t * 9); c.restore();
    for (let i = 1; i <= 3; i++) { const b = a - i * 0.2; c.save(); c.globalAlpha *= 0.45 - i * 0.12; ell(c, p.x + cos(b) * ORX, p.y + OY + sin(b) * ORY, 2.2 - i * 0.4, 2.2 - i * 0.4, '#8a6ad0'); c.restore(); }
  }
  function miniBlade(c, L) { c.beginPath(); c.moveTo(0, -L); c.lineTo(2.2, -L * 0.3); c.lineTo(0, 0); c.lineTo(-2.2, -L * 0.3); c.closePath(); const g = c.createLinearGradient(-2, 0, 2, 0); g.addColorStop(0, '#2a7a4a'); g.addColorStop(0.5, '#eaffea'); g.addColorStop(1, '#2a7a4a'); c.fillStyle = g; c.fill(); c.strokeStyle = '#1a4a2a'; c.lineWidth = 0.7; c.stroke(); c.fillStyle = '#c9a33a'; c.fillRect(-3, 0, 6, 1.6); c.fillStyle = '#3a2a1a'; c.fillRect(-0.9, 1.6, 1.8, 3.6); }
  function twinOrbit(c, p, front) {
    const t = p.t; for (let k = 0; k < 2; k++) { const a = t * 1.8 + k * PI, x = p.x + cos(a) * 40, y = p.y - 28 + sin(a) * 6; if ((sin(a) > 0) !== front) continue;
      soft(c, x, y, 11, 'rgba(140,240,140,.55)', 1); c.save(); c.translate(x, y); c.rotate(a + PI / 2 + sin(t * 4 + k) * 0.3); miniBlade(c, 13); c.restore(); }
  }

  // ---------- 천궁: 금빛 별 활 0.6배 (등 뒤, 따라다님) ----------
  function starBow(c, p) {
    const s = follow(p, 'bow', p.x - p.dir * 6, p.y - 50), t = p.t;
    c.save(); c.translate(s.x, s.y); c.rotate(s.tilt); c.scale(0.6 * p.dir, 0.6);   // 활은 늘 등 쪽으로 휨
    c.strokeStyle = '#a07a20'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 52, -PI * 0.75, PI * 0.75, true); c.stroke();
    c.strokeStyle = '#ffd860'; c.lineWidth = 3.4; c.stroke(); c.strokeStyle = '#fff6c8'; c.lineWidth = 1.2; c.stroke();
    const x0 = cos(PI * 0.75) * 52, y0 = sin(PI * 0.75) * 52; c.strokeStyle = 'rgba(255,240,200,.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, -y0); c.lineTo(x0, y0); c.stroke();
    for (let i = -1; i <= 1; i++) { const y = i * 18; soft(c, x0, y, 10, 'rgba(255,240,160,.8)', 0.6); star(c, x0, y, 5 + (i ? 0 : 2) + sin(t * 4 + i) * 0.8, '#fff2a8'); }
    c.restore();
  }

  // ---------- 현자: 번개 고리 구름 0.5배 (머리 위, 따라다님) ----------
  const cloudPath = (c) => { c.beginPath(); c.moveTo(-16, 5); c.bezierCurveTo(-22, 5, -21, -4, -14, -3); c.bezierCurveTo(-14, -11, -4, -13, -1, -7); c.bezierCurveTo(2, -15, 14, -13, 13, -4); c.bezierCurveTo(21, -5, 22, 5, 16, 5); c.quadraticCurveTo(0, 8, -16, 5); c.closePath(); };
  function cloudBody(c) { cloudPath(c); const g = c.createLinearGradient(0, -13, 0, 7); g.addColorStop(0, '#b4bfdc'); g.addColorStop(0.55, '#6e7aa4'); g.addColorStop(1, '#3e4670'); c.fillStyle = g; c.fill();
    c.save(); cloudPath(c); c.clip(); c.globalAlpha *= 0.45; c.beginPath(); c.ellipse(-2, -10, 13, 4, 0, 0, PI * 2); c.fillStyle = '#eef2ff'; c.fill(); c.restore(); }
  function ring(c, t, front) { for (let i = 0; i < 28; i++) { const a = t * 2.4 + i / 28 * PI * 2, b = a + PI / 14; if ((sin(a) > 0) !== front) continue; const j = sin(i * 3.1 + Math.floor(t * 12)) * 1.4;
      c.strokeStyle = front ? '#7cc4ff' : 'rgba(90,150,240,.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cos(a) * 26, 2 + sin(a) * 6 + j); c.lineTo(cos(b) * 26, 2 + sin(b) * 6 - j); c.stroke(); }
    if (front) { const a = t * 2.4; soft(c, cos(a) * 26, 2 + sin(a) * 6, 6, 'rgba(200,235,255,.9)', 1); } }
  function stormCloud(c, p) {
    const s = follow(p, 'cloud', p.x, p.y - 92), t = p.t;
    c.save(); c.translate(s.x, s.y + sin(t * 1.6) * 0.8); c.rotate(s.tilt); c.scale(0.5, 0.5);
    soft(c, 0, 0, 26, 'rgba(110,180,255,.4)', 0.8); ring(c, t, false); cloudBody(c); ring(c, t, true); c.restore();
  }

  // ---------- 무기 빛 (humanoid 의 wglow 로 무기 자리에서 그림 → 휘두를 때도 날에 붙어 있음) ----------
  // 칼날: 옛 무기 y 4~36 · 새 무기 4~33 (단검 3~20 · 4~18) → 겹치게 4~34 / 4~19
  function hotBlade(c, type, t) {
    const dag = type === 'dagger', L = dag ? 19 : 34, w = dag ? 4 : 5.2;
    c.save(); c.translate(0, 14); c.rotate(dag ? -1.8 : -1.9); const br = 0.75 + 0.25 * sin(t * 4);
    soft(c, 0, L * 0.6, L * 0.65, 'rgba(255,110,30,.55)', br); c.globalAlpha *= 0.85 * br;
    const g = c.createLinearGradient(0, 4, 0, L); g.addColorStop(0, '#ffd070'); g.addColorStop(1, '#ff5a14'); c.beginPath(); c.moveTo(-w / 2, 4); c.lineTo(w / 2, 4); c.lineTo(w / 2, L - 3); c.lineTo(0, L); c.lineTo(-w / 2, L - 3); c.closePath(); c.fillStyle = g; c.fill();
    c.globalAlpha /= 0.85 * br; c.fillStyle = '#fff6d8'; c.fillRect(-0.6, 7, 1.2, L - 11); c.restore();
  }

  // 버프 id → [뒤, 앞, 무기]
  const NEW = {
    w4a_awake: [null, null, hotBlade],
    w4b_awake: [shieldEmblem, null, null],
    a4a_awake: [starBow, null, null],
    a4b_awake: [scopeEmblem, null, null],
    m4a_awake: [(c, p) => emberOrbit(c, p, false), (c, p) => emberOrbit(c, p, true), null],
    m4b_awake: [stormCloud, null, null],
    t4a_awake: [(c, p) => starOrbit(c, p, false), (c, p) => starOrbit(c, p, true), null],
    t4b_awake: [(c, p) => twinOrbit(c, p, false), (c, p) => twinOrbit(c, p, true), null],
  };
  const X = G.SkillX, oldAura = X.aura;
  X.aura = function (ctx, p) {   // 캐릭터 뒤: 2차 분노 등 옛 모습은 그대로 + 새 8종
    if (p.dead || !p.buffs) return;
    const rest = {}; let any = false;
    for (const id in p.buffs) { if (NEW[id]) { if (NEW[id][0]) { ctx.save(); NEW[id][0](ctx, p); ctx.restore(); } } else { rest[id] = p.buffs[id]; any = true; } }
    if (any) oldAura.call(this, ctx, Object.assign(Object.create(p), { buffs: rest }));
  };
  X.auraFront = function (ctx, p) {   // 캐릭터 앞
    if (p.dead || !p.buffs) return;
    for (const id in p.buffs) if (NEW[id] && NEW[id][1]) { ctx.save(); NEW[id][1](ctx, p); ctx.restore(); }
  };
  X.wglow = function (p) {   // humanoid 의 wglow 인자 (무기 빛이 있는 버프일 때만)
    if (p.dead || !p.buffs) return null;
    for (const id in p.buffs) if (NEW[id] && NEW[id][2]) { const f = NEW[id][2]; return (ctx, type) => { if (type === 'sword' || type === 'dagger') { ctx.save(); f(ctx, type, p.t); ctx.restore(); } }; }
    return null;
  };
  G.Aura10 = { NEW, follow };
})();
