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
