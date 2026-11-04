'use strict';
// 맵 배경, 발판, 장식물
G.BG = (function () {
  const D = () => G.Draw;
  const THEMES = {
    mine:      { sky: ['#4a4a5a', '#a89a88'], far: '#6a5a4a', top: '#8a7a6a', body: '#4a3a2e' },
    desert:    { sky: ['#f0b860', '#fff0c8'], far: '#e0a860', top: '#f0d090', body: '#c09050' },
    snow:      { sky: ['#a8c8e8', '#f4f8ff'], far: '#d8e4f0', top: '#ffffff', body: '#b8c8d8', stars: false },
    ice:       { sky: ['#2a4a7a', '#a8d0f0'], far: '#5a8ab8', top: '#d8f0ff', body: '#6a9ac8' },
    sky:       { sky: ['#6ab0f0', '#fff8f0'], far: '#ffffff', top: '#f8f8ff', body: '#c8d0e8', grass: '#e0e8ff' },
    sanctum:   { sky: ['#1a1a4a', '#6a5aa8'], far: '#3a3a7a', top: '#d8d0ff', body: '#5a5a9a', stars: true, dark: true },
    void:      { sky: ['#06030e', '#2a0f3a'], far: '#1a0a2a', top: '#5a2a8a', body: '#1e1030', dark: true, stars: true },
    dream:     { sky: ['#2a2058', '#e8b8e8'], far: '#7a6ab8', sea: '#6a5ac8', top: '#efe4ff', body: '#9a8ac8', grass: '#c8b8ff', stars: true },
    beachTown: { sky: ['#7ec8f0', '#e6f6ff'], far: '#9cc7e0', sea: '#3a9ad9', top: '#f2dc9a', body: '#d9b56a', grass: '#7cc860' },
    beach:     { sky: ['#7ec8f0', '#e6f6ff'], far: '#9cc7e0', sea: '#3a9ad9', top: '#f2dc9a', body: '#d9b56a', grass: '#7cc860' },
    mushroom:  { sky: ['#6a5a9a', '#f0c8d8'], far: '#7a5a8a', top: '#7ac25a', body: '#6a4a3a', grass: '#5aa040' },
    cave:      { sky: ['#14141f', '#2a2a40'], far: '#24243a', top: '#5a5a6e', body: '#34344a', dark: true },
    meadowTown:{ sky: ['#88c8f8', '#eaf6ff'], far: '#a8d8a0', top: '#8acb5a', body: '#7a5a3a', grass: '#6ab040' },
    field:     { sky: ['#9ad0f8', '#fff4d8'], far: '#d8c880', top: '#e0c060', body: '#8a6a3a', grass: '#c8a840' },
    windmill:  { sky: ['#78b8f0', '#e8f4ff'], far: '#98c890', top: '#8acb5a', body: '#7a5a3a', grass: '#6ab040' },
    forest:    { sky: ['#4a7a6a', '#b8d8c0'], far: '#2f5a46', top: '#5a9a4a', body: '#4a3a2a', grass: '#3f7a30' },
    den:       { sky: ['#1e140f', '#4a2a1a'], far: '#3a2418', top: '#6a4a30', body: '#3a2a1e', dark: true },
  };

  function sky(ctx, th, camX, t) {
    const g = ctx.createLinearGradient(0, 0, 0, 720);
    g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
    if (th.stars) {
      for (let i = 0; i < 60; i++) {
        const x = ((i * 211 - camX * 0.05) % 1300 + 1300) % 1300, y = (i * 97) % 380;
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i));
        D().ell(ctx, x, y, 1.6, 1.6, '#fff8e0');
      }
      ctx.globalAlpha = 1;
    }
    if (!th.dark) {
      // 구름
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      for (let i = 0; i < 6; i++) {
        const x = ((i * 380 - camX * 0.1 + t * 8) % 1700 + 1700) % 1700 - 200, y = 70 + (i % 3) * 45;
        D().ell(ctx, x, y, 60, 18); ctx.fill(); D().ell(ctx, x + 35, y - 12, 40, 18); ctx.fill(); D().ell(ctx, x - 30, y + 2, 36, 13); ctx.fill();
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      for (let i = 0; i < 14; i++) { const x = ((i * 137 - camX * 0.15) % 1400 + 1400) % 1400 - 60; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 15, 60 + (i % 4) * 25); ctx.fill(); }
    }
    // 먼 산
    ctx.fillStyle = th.far;
    ctx.beginPath(); ctx.moveTo(0, 720);
    for (let x = 0; x <= 1280; x += 20) {
      const wx = x + camX * 0.25;
      ctx.lineTo(x, 430 - Math.sin(wx / 210) * 50 - Math.sin(wx / 87) * 18);
    }
    ctx.lineTo(1280, 720); ctx.fill();
    if (th.sea) {
      const sg = ctx.createLinearGradient(0, 480, 0, 620);
      sg.addColorStop(0, th.sea); sg.addColorStop(1, '#2a6aa0');
      ctx.fillStyle = sg; ctx.fillRect(0, 490, 1280, 140);
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const x = ((i * 170 - camX * 0.4 + Math.sin(t + i) * 20) % 1500 + 1500) % 1500 - 100;
        ctx.beginPath(); ctx.moveTo(x, 520 + (i % 3) * 30); ctx.quadraticCurveTo(x + 20, 512 + (i % 3) * 30, x + 40, 520 + (i % 3) * 30); ctx.stroke();
      }
    } else {
      ctx.fillStyle = G.Icons.shade(th.far, -0.15);
      ctx.beginPath(); ctx.moveTo(0, 720);
      for (let x = 0; x <= 1280; x += 20) { const wx = x + camX * 0.5; ctx.lineTo(x, 520 - Math.sin(wx / 140) * 30 - Math.sin(wx / 53) * 8); }
      ctx.lineTo(1280, 720); ctx.fill();
    }
  }

  function platforms(ctx, map, th) {
    for (const p of map.platforms) {
      if (p.ground) {
        ctx.fillStyle = th.body; ctx.fillRect(p.x, p.y, p.w, 720 - p.y);
        ctx.fillStyle = th.top; ctx.fillRect(p.x, p.y, p.w, 14);
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        for (let x = p.x; x < p.x + p.w; x += 46) ctx.fillRect(x + ((x / 46) % 2) * 20, p.y + 30, 18, 8);
      } else {
        D().rrect(ctx, p.x, p.y, p.w, 22, 6, th.body);
        D().rrect(ctx, p.x, p.y, p.w, 9, 4, p.high ? '#ffe08a' : th.top);
        ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(p.x + 6, p.y + 18, p.w - 12, 4);
        if (p.high) {   // 2단 점프 전용 발판: 반짝이는 테두리
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,224,138,.6)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(p.x - 2, p.y - 2, p.w + 4, 26, 7); ctx.stroke(); ctx.restore();
        }
      }
      if (th.grass) {
        ctx.fillStyle = th.grass;
        for (let x = p.x + 8; x < p.x + p.w - 8; x += 23) {
          ctx.beginPath(); ctx.moveTo(x, p.y + 1); ctx.lineTo(x + 3, p.y - 6); ctx.lineTo(x + 6, p.y + 1); ctx.fill();
        }
      }
    }
  }

  const DECO = {
    house(ctx, d, y) {
      const w = d.w || 220, h = d.big ? 150 : 120;
      D().rrect(ctx, d.x, y - h, w, h, 4, '#f2e6cc', '#a08a6a');
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.moveTo(d.x - 18, y - h + 4); ctx.lineTo(d.x + w / 2, y - h - 70); ctx.lineTo(d.x + w + 18, y - h + 4); ctx.fill();
      ctx.fillStyle = '#7a4a2a'; ctx.fillRect(d.x + w / 2 - 20, y - 62, 40, 62);
      ctx.fillStyle = '#9fd0f0'; ctx.fillRect(d.x + 24, y - h + 30, 34, 30); ctx.fillRect(d.x + w - 58, y - h + 30, 34, 30);
      ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.strokeRect(d.x + 24, y - h + 30, 34, 30); ctx.strokeRect(d.x + w - 58, y - h + 30, 34, 30);
    },
    guild(ctx, d, y) {
      const w = d.w, h = 190;
      D().rrect(ctx, d.x, y - h, w, h, 4, '#d8c8a8', '#8a7050');
      ctx.fillStyle = '#8a3a2a'; ctx.beginPath(); ctx.moveTo(d.x - 24, y - h + 4); ctx.lineTo(d.x + w / 2, y - h - 80); ctx.lineTo(d.x + w + 24, y - h + 4); ctx.fill();
      D().rrect(ctx, d.x + w / 2 - 110, y - h - 18, 220, 34, 6, '#5a3a1a', '#c9a33a');
      ctx.fillStyle = '#ffe4a0'; ctx.font = 'bold 18px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.fillText(d.label || '모험가 길드', d.x + w / 2, y - h + 5);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(d.x + 40 + i * (w - 80) / 3 - 8, y - h + 40, 16, h - 40); }
    },
    ship(ctx, d, y) {
      ctx.fillStyle = '#6a4024'; ctx.beginPath(); ctx.moveTo(d.x - 70, y - 70); ctx.lineTo(d.x + 110, y - 70); ctx.lineTo(d.x + 80, y - 10); ctx.lineTo(d.x - 50, y - 10); ctx.fill();
      ctx.fillStyle = '#4a2a14'; ctx.fillRect(d.x + 15, y - 230, 8, 160);
      ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.moveTo(d.x + 23, y - 225); ctx.quadraticCurveTo(d.x + 100, y - 160, d.x + 23, y - 90); ctx.fill();
      ctx.fillStyle = '#c03a2a'; ctx.beginPath(); ctx.moveTo(d.x + 23, y - 230); ctx.lineTo(d.x + 55, y - 222); ctx.lineTo(d.x + 23, y - 214); ctx.fill();
      ctx.fillStyle = '#8a6040'; ctx.fillRect(d.x - 80, y - 8, 250, 10);
    },
    stall(ctx, d, y) {
      ctx.fillStyle = '#8a5a32'; ctx.fillRect(d.x - 60, y - 110, 6, 110); ctx.fillRect(d.x + 54, y - 110, 6, 110);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : d.color; ctx.fillRect(d.x - 66 + i * 22, y - 128, 22, 26); }
      D().rrect(ctx, d.x - 64, y - 46, 128, 46, 3, '#b07a4a', '#6a4a2a');
    },
    tree(ctx, d, y) {
      ctx.fillStyle = '#6a4024'; ctx.fillRect(d.x - 9, y - 110, 18, 110);
      D().ell(ctx, d.x, y - 140, 55, 45, '#4a9a40'); D().ell(ctx, d.x - 30, y - 115, 35, 28, '#3f8a36'); D().ell(ctx, d.x + 32, y - 118, 35, 28, '#56a84a');
    },
    rock(ctx, d, y) { D().ell(ctx, d.x, y - 16, 40, 22, '#8a8a90', '#5a5a62'); D().ell(ctx, d.x - 10, y - 26, 12, 6, 'rgba(255,255,255,.3)'); },
    lighthouse(ctx, d, y) {
      ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.moveTo(d.x - 40, y); ctx.lineTo(d.x - 24, y - 300); ctx.lineTo(d.x + 24, y - 300); ctx.lineTo(d.x + 40, y); ctx.fill();
      ctx.fillStyle = '#d0402a'; for (let i = 0; i < 3; i++) ctx.fillRect(d.x - 36 + i * 5, y - 70 - i * 90, 72 - i * 10, 30);
      D().rrect(ctx, d.x - 30, y - 340, 60, 42, 6, '#ffe680', '#7a5a2a');
      const glow = ctx.createRadialGradient(d.x, y - 320, 5, d.x, y - 320, 120);
      glow.addColorStop(0, 'rgba(255,240,150,.55)'); glow.addColorStop(1, 'rgba(255,240,150,0)');
      ctx.fillStyle = glow; ctx.fillRect(d.x - 120, y - 440, 240, 240);
      ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.moveTo(d.x - 36, y - 340); ctx.lineTo(d.x, y - 370); ctx.lineTo(d.x + 36, y - 340); ctx.fill();
    },
    sign(ctx, d, y) {
      ctx.fillStyle = '#6a4024'; ctx.fillRect(d.x - 3, y - 60, 6, 60);
      D().rrect(ctx, d.x - 50, y - 78, 100, 26, 4, '#c09060', '#6a4024');
      ctx.fillStyle = '#3a2410'; ctx.font = 'bold 12px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.fillText(d.text, d.x, y - 60);
    },
    bigshroom(ctx, d, y) {
      ctx.fillStyle = '#f1e0c0'; ctx.fillRect(d.x - 14, y - 120, 28, 120);
      ctx.fillStyle = '#c0508a'; ctx.beginPath(); ctx.ellipse(d.x, y - 120, 80, 55, 0, Math.PI, 0); ctx.fill();
      for (const [x, yy, r] of [[-40, -140, 10], [10, -158, 12], [45, -132, 8]]) D().ell(ctx, d.x + x, y + yy, r, r, '#ffe0f0');
    },
    cave(ctx, d, y) {
      ctx.fillStyle = '#5a5a62'; ctx.beginPath(); ctx.ellipse(d.x, y, 90, 130, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#121218'; ctx.beginPath(); ctx.ellipse(d.x, y, 55, 95, 0, Math.PI, 0); ctx.fill();
    },
    crystal(ctx, d, y) {
      for (const [ox, h, c] of [[-20, 70, '#6ad0ff'], [0, 100, '#9ae6ff'], [22, 60, '#4ab0e8']]) {
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(d.x + ox - 12, y); ctx.lineTo(d.x + ox, y - h); ctx.lineTo(d.x + ox + 12, y); ctx.fill();
      }
      const g = ctx.createRadialGradient(d.x, y - 50, 4, d.x, y - 50, 110);
      g.addColorStop(0, 'rgba(120,210,255,.35)'); g.addColorStop(1, 'rgba(120,210,255,0)');
      ctx.fillStyle = g; ctx.fillRect(d.x - 110, y - 160, 220, 220);
    },
    haystack(ctx, d, y) { ctx.fillStyle = '#e0c060'; ctx.beginPath(); ctx.ellipse(d.x, y, 60, 55, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#b09030'; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(d.x + i * 18, y); ctx.lineTo(d.x + i * 12, y - 45); ctx.stroke(); } },
    fence(ctx, d, y) { ctx.fillStyle = '#9a7040'; for (let i = 0; i < 6; i++) ctx.fillRect(d.x + i * 26, y - 50, 8, 50); ctx.fillRect(d.x - 4, y - 42, 150, 6); ctx.fillRect(d.x - 4, y - 22, 150, 6); },
    windmill(ctx, d, y, t) {
      ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.moveTo(d.x - 45, y); ctx.lineTo(d.x - 28, y - 220); ctx.lineTo(d.x + 28, y - 220); ctx.lineTo(d.x + 45, y); ctx.fill();
      ctx.fillStyle = '#8a3a2a'; ctx.beginPath(); ctx.moveTo(d.x - 36, y - 216); ctx.lineTo(d.x, y - 265); ctx.lineTo(d.x + 36, y - 216); ctx.fill();
      ctx.fillStyle = '#6a4024'; ctx.fillRect(d.x - 16, y - 50, 32, 50);
      ctx.save(); ctx.translate(d.x, y - 205); ctx.rotate(t * 0.8);
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-3, 0, 6, 110); ctx.fillStyle = 'rgba(250,245,230,.92)'; ctx.fillRect(4, 25, 26, 82); }
      ctx.restore(); D().ell(ctx, d.x, y - 205, 8, 8, '#4a2a14');
    },
    tent(ctx, d, y) {
      ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.moveTo(d.x - 70, y); ctx.lineTo(d.x, y - 100); ctx.lineTo(d.x + 70, y); ctx.fill();
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(d.x - 18, y); ctx.lineTo(d.x, y - 60); ctx.lineTo(d.x + 18, y); ctx.fill();
    },
    torch(ctx, d, y, t) {
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(d.x - 4, y - 130, 8, 70);
      const f = 1 + Math.sin(t * 13 + d.x) * 0.15;
      const g = ctx.createRadialGradient(d.x, y - 140, 2, d.x, y - 140, 120 * f);
      g.addColorStop(0, 'rgba(255,180,80,.5)'); g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g; ctx.fillRect(d.x - 130, y - 270, 260, 260);
      D().ell(ctx, d.x, y - 140, 8 * f, 14 * f, '#ffb040'); D().ell(ctx, d.x, y - 136, 4, 7, '#fff0a0');
    },
    crate(ctx, d, y) { D().rrect(ctx, d.x - 30, y - 56, 60, 56, 3, '#9a6a3a', '#5a3a1a'); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(d.x - 30, y - 56); ctx.lineTo(d.x + 30, y); ctx.stroke(); },
  };

  function deco(ctx, map, t) {
    for (const d of map.deco) { const f = DECO[d.t]; if (f) { ctx.save(); f(ctx, d, G.GROUND_Y, t); ctx.restore(); } }
  }

  return { THEMES, sky, platforms, deco };
})();
