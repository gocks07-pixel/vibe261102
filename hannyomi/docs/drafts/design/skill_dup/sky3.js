G.__simple = 1; window.__noElite = 1; G.FX.beam = () => {};
{ const _fl = G.FX.flash; G.FX.flash = function (x, y, r) { if (r === 120) return; return _fl.apply(this, arguments); }; }
{ const M = G.SageMock, fade = (k, a) => k < a ? k / a : (1 - k) / (1 - a);
  // 천공의 화살비: 빛 없이 구름만 양옆으로 갈라짐
  G.SkyFX.gate = (ctx, f, k) => { const a = fade(k, 0.2); M.cloudSoft(ctx, f.x - 230 - k * 40, f.y + 54, 380, 154, 41, a * 0.7, 0, true); M.cloudSoft(ctx, f.x + 230 + k * 40, f.y + 54, 380, 154, 47, a * 0.7, 0, true); };
  // 천궁 폭풍우: 폭풍 구름 + (가) 번개 한 줄기 / (나) 비스듬한 비바람
  G.SkyFX.storm = (ctx, f, k) => { const a = fade(k, 0.15), t = 1.3 + k * 3;
    if (window.__opt === 'wind') { ctx.save(); ctx.globalAlpha = a * 0.75; ctx.strokeStyle = 'rgba(235,245,255,.85)'; ctx.lineCap = 'round';
      for (let i = 0; i < 26; i++) { const u = (t * 0.9 + i * 0.137) % 1, y = f.y + 60 + (i * 53 % 380), x = f.x + 360 - u * 760; ctx.lineWidth = 2 + (i % 3); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 40, y + 10, x - 90 - (i % 4) * 20, y + 30); ctx.stroke(); } ctx.restore(); }
    M.cloudSoft(ctx, f.x, f.y + 59, 620, 209, 11, a * 0.7, window.__opt === 'bolt' && Math.floor(k * 12) % 3 === 0 ? 1 : 0, true);
    if (window.__opt === 'bolt' && Math.floor(k * 12) % 3 === 0) M.bolt(ctx, f.x + 60, f.y + 40, f.x + 30, f.y + 400, 7 + Math.floor(k * 12), '#ffe88a', a, 1, 2); };
}
{ const M = G.SageMock, PI = Math.PI, sin = Math.sin, cos = Math.cos, fade = (k, a) => k < a ? k / a : (1 - k) / (1 - a), base = G.SkyFX.storm;
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  G.SkyFX.storm = (ctx, f, k) => { const o = window.__opt, a = fade(k, 0.15), t = 1.3 + k * 3;
    if (o === 'bolt' || o === 'wind' || !o) return base(ctx, f, k);
    if (o === 'funnel') { const top = f.y + 70, bot = f.y + 400, x0 = f.x + 40; ctx.save(); ctx.globalAlpha = a;   // 다: 구름에서 내려오는 회오리 깔때기
      for (let i = 0; i < 40; i++) { const u = i / 39, y = top + (bot - top) * u, w = 110 * Math.pow(1 - u, 1.5) + 14, sw = sin(t * 2 + u * 4) * 24 * u, ph = t * 7 + u * 9;
        ctx.save(); ctx.translate(x0 + sw, y); ctx.scale(1, 0.22); ctx.strokeStyle = `rgba(230,240,250,${0.25 + 0.35 * (1 - u)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, w, ph, ph + 2); ctx.stroke(); ctx.restore(); }
      for (let i = 0; i < 12; i++) { const u = (t * 0.6 + i / 12) % 1, an = t * 6 + i * 2, y = bot - u * (bot - top), w = 110 * Math.pow(1 - (y - top) / (bot - top), 1.5) + 20; ctx.fillStyle = i % 3 ? '#8ad06a' : '#e8f4ff'; ctx.save(); ctx.translate(x0 + cos(an) * w, y + sin(an) * w * 0.22); ctx.rotate(an); ctx.beginPath(); ctx.ellipse(0, 0, 6, 2.4, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
      ctx.restore(); }
    if (o === 'feather') { ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 34; i++) { const u = (t * 0.35 + rnd(i)) % 1, x = f.x + 420 - u * 860, y = f.y + 80 + rnd(i * 3) * 330 + sin(t * 3 + i) * 20;   // 라: 바람에 흩날리는 깃털 떼
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.4 + sin(t * 4 + i) * 0.6); ctx.fillStyle = i % 4 ? '#f4fbff' : '#a8e0b8'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(0, -6, 12, 0); ctx.quadraticCurveTo(0, 6, -12, 0); ctx.fill(); ctx.strokeStyle = 'rgba(120,150,170,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(12, 0); ctx.stroke(); ctx.restore(); } ctx.restore(); }
    let lit = 0;
    if (o === 'flash') lit = Math.max(0, sin(t * 7)) > 0.6 ? 1 : 0.15;   // 바: 구름 속에서만 번쩍 (번개 줄기 없음)
    M.cloudSoft(ctx, f.x, f.y + 59, 620, 209, 11, a * 0.7, lit, true);
    if (o === 'eye') { ctx.save(); ctx.translate(f.x, f.y + 20); ctx.scale(1, 0.32); ctx.globalAlpha = a; for (let i = 0; i < 5; i++) { const r = 60 + i * 50, ph = t * (1.2 - i * 0.15); ctx.strokeStyle = `rgba(240,248,255,${0.55 - i * 0.08})`; ctx.lineWidth = 7 - i; ctx.beginPath(); ctx.arc(0, 0, r, ph, ph + 3.6); ctx.stroke(); }   // 마: 구름 가운데 소용돌이 눈
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 70); g.addColorStop(0, 'rgba(220,240,255,.8)'); g.addColorStop(1, 'rgba(220,240,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 70, 0, PI * 2); ctx.fill(); ctx.restore(); } };
}
{ const PI = Math.PI, sin = Math.sin, cos = Math.cos, prev = G.SkyFX.storm, M = G.SageMock, fade = (k, a) => k < a ? k / a : (1 - k) / (1 - a);
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  G.SkyFX.storm = (ctx, f, k) => { const lv = window.__lv; if (!lv) return prev(ctx, f, k); const a = fade(k, 0.15), t = 1.3 + k * 3, top = f.y + 70, bot = f.y + 400, x0 = f.x + 40, R0 = lv === 3 ? 150 : 120;
    const W = (u) => R0 * Math.pow(1 - u, 1.4) + 16;
    // 깔때기: 두께 있는 바람 띠 여러 겹 (진하게)
    ctx.save(); ctx.globalAlpha = a;
    if (lv >= 1) { const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, 'rgba(200,215,230,.35)'); g.addColorStop(1, 'rgba(220,230,240,.15)'); ctx.fillStyle = g; ctx.beginPath();
      for (let i = 0; i <= 30; i++) { const u = i / 30, y = top + (bot - top) * u; ctx.lineTo(x0 + sin(t * 2 + u * 4) * 24 * u - W(u), y); } for (let i = 30; i >= 0; i--) { const u = i / 30, y = top + (bot - top) * u; ctx.lineTo(x0 + sin(t * 2 + u * 4) * 24 * u + W(u), y); } ctx.fill(); }
    for (let i = 0; i < 46; i++) { const u = i / 45, y = top + (bot - top) * u, w = W(u), sw = sin(t * 2 + u * 4) * 24 * u, ph = t * 8 + u * 10;
      ctx.save(); ctx.translate(x0 + sw, y); ctx.scale(1, 0.24); ctx.strokeStyle = `rgba(245,250,255,${0.45 + 0.4 * (1 - u)})`; ctx.lineWidth = 7 + (1 - u) * 5; ctx.beginPath(); ctx.arc(0, 0, w, ph, ph + 2.4); ctx.stroke(); ctx.strokeStyle = 'rgba(150,170,195,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, w * 0.92, ph + 2.6, ph + 3.6); ctx.stroke(); ctx.restore(); }
    // 바닥 흙먼지 · 눈보라 고리
    if (window.__dust) {   // 바닥 흙먼지 · 눈보라 (현실적): 부드러운 먼지 구름이 땅을 따라 돌며 퍼지고 · 낮게 깔린 띠 · 날리는 눈알갱이
      const puffD = (x, y, r, al, warm) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); const c0 = warm ? '205,195,180' : '232,238,246'; g.addColorStop(0, `rgba(${c0},${al})`); g.addColorStop(0.55, `rgba(${c0},${al * 0.55})`); g.addColorStop(1, `rgba(${c0},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); };
      ctx.save(); ctx.translate(x0, bot); ctx.scale(1, 0.2); const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, 220); lg.addColorStop(0, `rgba(235,240,248,${0.85 * a})`); lg.addColorStop(1, 'rgba(225,232,242,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, 220, 0, PI * 2); ctx.fill(); ctx.restore();   // 낮게 깔린 먼지 띠
      for (let i = 0; i < 80; i++) { const u = (t * 0.32 + rnd(i)) % 1, an = t * 4.5 + rnd(i * 3) * PI * 2 + u * 3, r = 20 + u * 200, back = sin(an) < 0; const x = x0 + cos(an) * r, y = bot - 4 + sin(an) * r * 0.16 - u * u * 40 - rnd(i * 5) * 12;
        puffD(x, y, 16 + u * 40, a * (u < 0.15 ? u / 0.15 : 1) * (1 - u * 0.7) * (back ? 0.65 : 0.9), i % 3 === 0); }
      ctx.save(); for (let i = 0; i < 70; i++) { const u = (t * 0.7 + rnd(i * 7)) % 1, an = t * 6 + rnd(i) * PI * 2 + u * 5, r = 30 + u * 230, x = x0 + cos(an) * r, y = bot - 10 - u * 70 * rnd(i * 9) + sin(an) * r * 0.16;
        ctx.globalAlpha = a * (1 - u * 0.6); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - sin(an) * 11, y + cos(an) * 2); ctx.stroke(); } ctx.restore();   // 바람에 끌리는 눈알갱이 (짧은 줄)
    } else for (let i = 0; i < 26; i++) { const u = (t * 0.5 + rnd(i)) % 1, an = t * 5 + i * 0.7, r = 30 + u * (lv === 3 ? 220 : 150); ctx.save(); ctx.globalAlpha = a * (1 - u) * 0.6; ctx.fillStyle = '#e8eef6'; ctx.beginPath(); ctx.arc(x0 + cos(an) * r, bot - 6 + sin(an) * r * 0.18 - u * 20, 10 + u * 18, 0, PI * 2); ctx.fill(); ctx.restore(); }
    // 휘감겨 오르는 잎 · 파편
    const nl = lv === 3 ? 30 : 16; for (let i = 0; i < nl; i++) { const u = (t * 0.6 + i / nl) % 1, an = t * 7 + i * 2, y = bot - u * (bot - top), w = W((y - top) / (bot - top)) + 10; ctx.fillStyle = i % 3 ? '#8ad06a' : '#f4f8ff'; ctx.save(); ctx.translate(x0 + cos(an) * w, y + sin(an) * w * 0.24); ctx.rotate(an); ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.6, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
    // 2 · 3: 바깥으로 휘몰아치는 바람 줄기
    if (lv >= 2) { ctx.strokeStyle = 'rgba(240,248,255,.8)'; ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const u = (t * 0.8 + i / 14) % 1, an = t * 3 + i * 0.45, r = 90 + u * 330, y = bot - 40 - (i % 5) * 60; ctx.save(); ctx.globalAlpha = a * (1 - u) * 0.85; ctx.lineWidth = 3 + (i % 3); ctx.beginPath(); ctx.arc(x0, y, r, an, an + 0.7); ctx.stroke(); ctx.restore(); } }
    ctx.restore();
    M.cloudSoft(ctx, f.x, f.y + 59, 620, 209, 11, a * 0.7, 0, true);
    if (lv === 3) { ctx.save(); ctx.translate(f.x + 40, f.y + 40); ctx.scale(1, 0.3); ctx.globalAlpha = a; for (let i = 0; i < 3; i++) { const ph = t * 2 + i * 2; ctx.strokeStyle = 'rgba(240,248,255,.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 90 + i * 40, ph, ph + 2.8); ctx.stroke(); } ctx.restore(); } };   // 3: 구름 아랫면도 회오리에 빨려 도는 띠
}
// ===== 현실적인 회오리 (lv 4): 선 · 띠 대신 부드러운 공기 · 먼지 덩어리가 나선으로 돌며 깔때기를 이룸, 반투명해서 화살이 비쳐 보이고 스며듦 =====
{ const PI = Math.PI, sin = Math.sin, cos = Math.cos, prev = G.SkyFX.storm, M = G.SageMock, fade = (k, a) => k < a ? k / a : (1 - k) / (1 - a);
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
  const soft = (ctx, x, y, rx, ry, rgb, al) => { if (al <= 0.004) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(${rgb},${al})`); g.addColorStop(0.6, `rgba(${rgb},${al * 0.45})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, PI * 2); ctx.fill(); ctx.restore(); };
  G.SkyFX.storm = (ctx, f, k) => { if (window.__lv !== 4) return prev(ctx, f, k);
    const a = fade(k, 0.15), t = 1.3 + k * 3, top = f.y + (window.__gap ? 190 : 60), bot = f.y + 400, x0 = f.x + 40, H = bot - top;
    const cx = (u) => x0 + sin(t * 1.6 + u * 3.2) * 18 * u + u * u * 14;   // 아래로 갈수록 살짝 휘고 흔들림
    const W = (u) => (window.__gap ? 80 : 105) * Math.pow(1 - u, 1.7) + 12;
    ctx.save();
    // 1) 깔때기 몸: 뒤쪽(어둡게) → 앞쪽(밝게) 덩어리가 나선으로 돎. 전체 투명도 낮게
    for (const front of [false, true]) for (let i = 0; i < 160; i++) { const u = (i % 80) / 80 + rnd(i) * 0.012, an = t * 5.2 + rnd(i * 3) * PI * 2 - u * 7, z = sin(an); if ((z > 0) !== front) continue;
      const w = W(u), x = cx(u) + cos(an) * w * 0.85, y = top + u * H + z * w * 0.12, r = (8 + w * 0.42) * (0.8 + rnd(i * 5) * 0.4);
      soft(ctx, x, y, r * 1.4, r, front ? '226,232,240' : '150,162,182', a * (front ? 0.16 : 0.14) * (0.6 + 0.4 * (1 - u)) * (window.__gap ? Math.min(1, u / 0.18) : 1)); }
    // 2) 가운데 얇은 응결 기둥 (위는 구름과 이어지고 아래로 가늘어짐)
    for (let i = 0; i < 30; i++) { const u = i / 30, w = W(u) * 0.38; soft(ctx, cx(u), top + u * H, w * 1.2, 14, '200,210,225', a * 0.1 * (window.__gap ? Math.min(1, u / 0.18) : 1)); }
    // 3) 바람결: 아주 옅은 가는 줄이 나선을 따라 스침 (선 대신 짧은 호 · 낮은 투명도)
    ctx.lineCap = 'round'; for (let i = 0; i < 24; i++) { const u = (t * 0.25 + rnd(i * 7)) % 1, w = W(u), an = t * 5.2 + i * 1.7 - u * 7, y = top + u * H; if (sin(an) < 0) continue;
      ctx.globalAlpha = a * 0.32 * (1 - u * 0.5); ctx.strokeStyle = '#f4f8ff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx(u), y, w * 0.9, w * 0.12, 0, an, an + 0.9); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // 4) 휘감겨 오르는 잎 · 작은 파편 (몇 개만)
    for (let i = 0; i < 10; i++) { const u = (t * 0.45 + i / 10) % 1, an = t * 7 + i * 2, uu = 1 - u, w = W(uu) + 6, y = top + uu * H; ctx.save(); ctx.globalAlpha = a * 0.8; ctx.fillStyle = i % 3 ? '#86b86a' : '#d8dfe8'; ctx.translate(cx(uu) + cos(an) * w, y + sin(an) * w * 0.15); ctx.rotate(an); ctx.beginPath(); ctx.ellipse(0, 0, 5, 2, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
    ctx.restore();
    // 5) 바닥 흙먼지 · 눈보라 (지금 그대로)
    const L = window.__lv; window.__lv = 1; const keepCloud = M.cloudSoft; M.cloudSoft = () => {}; const keepS = ctx.stroke, keepF = ctx.fill;
    // 이전 lv1 에서 바닥 부분만 쓰려고 회오리 띠는 그리지 않게: 별도 함수로 다시 그림
    window.__lv = L; M.cloudSoft = keepCloud;
    G.SkyFX.__dust(ctx, x0 + 14, bot, a, t);
    M.cloudSoft(ctx, f.x, f.y + 59, 620, 209, 11, a * 0.7, 0, true); };
  // 바닥 흙먼지 · 눈보라 (lv1 다듬은 안과 같은 그림)
  G.SkyFX.__dust = (ctx, x0, bot, a, t) => { const puffD = (x, y, r, al, warm) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); const c0 = warm ? '205,195,180' : '232,238,246'; g.addColorStop(0, `rgba(${c0},${al})`); g.addColorStop(0.55, `rgba(${c0},${al * 0.55})`); g.addColorStop(1, `rgba(${c0},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); };
    ctx.save(); ctx.translate(x0, bot); ctx.scale(1, 0.2); const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, 220); lg.addColorStop(0, `rgba(235,240,248,${0.85 * a})`); lg.addColorStop(1, 'rgba(225,232,242,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, 220, 0, PI * 2); ctx.fill(); ctx.restore();
    for (let i = 0; i < 80; i++) { const u = (t * 0.32 + rnd(i)) % 1, an = t * 4.5 + rnd(i * 3) * PI * 2 + u * 3, r = 20 + u * 200, back = sin(an) < 0; const x = x0 + cos(an) * r, y = bot - 4 + sin(an) * r * 0.16 - u * u * 40 - rnd(i * 5) * 12; puffD(x, y, 16 + u * 40, a * (u < 0.15 ? u / 0.15 : 1) * (1 - u * 0.7) * (back ? 0.65 : 0.9), i % 3 === 0); }
    ctx.save(); for (let i = 0; i < 70; i++) { const u = (t * 0.7 + rnd(i * 7)) % 1, an = t * 6 + rnd(i) * PI * 2 + u * 5, r = 30 + u * 230, x = x0 + cos(an) * r, y = bot - 10 - u * 70 * rnd(i * 9) + sin(an) * r * 0.16; ctx.globalAlpha = a * (1 - u * 0.6); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - sin(an) * 11, y + cos(an) * 2); ctx.stroke(); } ctx.restore(); };
}
