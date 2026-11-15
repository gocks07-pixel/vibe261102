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
