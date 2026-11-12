  // ======== 시안 v2: 세련된 장비 (그라데이션 · 외곽선 · 금속 광택 · 테두리 장식 · 겹 갑옷) ========
  function vgrad(ctx, y0, y1, c, up = 0.28, dn = -0.3) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, sh(c, up)); g.addColorStop(0.55, c); g.addColorStop(1, sh(c, dn)); return g; }
  function hgrad(ctx, x0, x1, c) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, sh(c, -0.22)); g.addColorStop(0.6, c); g.addColorStop(1, sh(c, 0.22)); return g; }
  function rr(ctx, x, y, w, h, r, fill, stroke, lw) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 0.7; ctx.stroke(); } }
  function ol(c) { return sh(c, -0.55); }
  function gem(ctx, x, y, r, c, trim) { ell(ctx, x, y, r + 0.9, r + 0.9, trim || '#ffe08a', sh(trim || '#ffe08a', -0.45), 0.5); ell(ctx, x, y, r, r, c); ell(ctx, x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.35, 'rgba(255,255,255,.75)'); }
  function belt(ctx, c, trim) { rr(ctx, -9.6, -19.2, 19.2, 3.4, 1, vgrad(ctx, -19.2, -15.8, sh(c, -0.45), 0.2, -0.2), ol(c), 0.5); rr(ctx, 2.2, -19.8, 4.6, 4.6, 1, trim || '#d8b060', sh(trim || '#d8b060', -0.5), 0.6); rr(ctx, 3.4, -18.6, 2.2, 2.2, 0.4, null, sh(trim || '#d8b060', -0.5), 0.5); }
  function torso(ctx, kind, c, lk, sp, e) {
    const d = sh(c, -0.35), bc = lk.bottom, T = sp.trim;
    if (kind === 'plate') {
      rr(ctx, -9, -36, 18, 23, 6, vgrad(ctx, -36, -13, sh(c, -0.18)), ol(c), 0.8);   // 안쪽 사슬 · 바탕
      // 가슴판 (방패 모양) + 비스듬한 빛
      ctx.beginPath(); ctx.moveTo(-8.6, -35); ctx.lineTo(8.8, -35); ctx.lineTo(8.6, -26); ctx.quadraticCurveTo(4, -21, 0.2, -20.4); ctx.quadraticCurveTo(-4.5, -21, -8.6, -26); ctx.closePath();
      ctx.fillStyle = vgrad(ctx, -35, -20, c, 0.38, -0.12); ctx.fill(); ctx.strokeStyle = ol(c); ctx.lineWidth = 0.8; ctx.stroke();
      ctx.save(); ctx.clip(); poly(ctx, [[-9, -35], [-3, -35], [-9, -27]], 'rgba(255,255,255,.28)'); poly(ctx, [[0, -35], [2.5, -35], [-6, -22], [-8, -24]], 'rgba(255,255,255,.12)'); ctx.restore();
      line(ctx, [[1, -34], [1, -21.5]], sh(c, 0.45), 0.7); line(ctx, [[1.6, -34], [1.6, -21.5]], sh(c, -0.35), 0.5);   // 가운데 능선
      // 배 갑옷 두 겹
      for (const y of [-19.6, -16.4]) { ctx.beginPath(); ctx.moveTo(-8.8, y); ctx.quadraticCurveTo(0, y + 1.4, 8.8, y); ctx.strokeStyle = sh(c, -0.42); ctx.lineWidth = 0.9; ctx.stroke(); }
      line(ctx, [[-8, -35.6], [8.4, -35.6]], T || sh(c, 0.45), 1.8); line(ctx, [[-7, -34.6], [7.4, -34.6]], 'rgba(0,0,0,.18)', 0.5);   // 목깃 테
      if (sp.rivet) for (const [x, y] of [[-6.5, -32.5], [7, -32.5], [-6, -24.5], [7.5, -24.5]]) { ell(ctx, x, y, 0.95, 0.95, sh(c, 0.5)); ell(ctx, x + 0.3, y + 0.3, 0.5, 0.5, sh(c, -0.4)); }
      if (sp.emblem) { if (sp.glow) glowOn(ctx, sp.glow, 6); emblem(ctx, sp.emblem, 1.3, -29.5, c, T); glowOff(ctx); }
      else gem(ctx, 1.3, -29.5, 1.4, sh(c, 0.35), T);
      belt(ctx, c, T);
      return;
    }
    if (kind === 'tunic') {
      rr(ctx, -9, -36, 18, 23, 6, vgrad(ctx, -36, -13, c), ol(c), 0.8);
      poly(ctx, [[1.5, -36], [8.4, -36], [5, -30]], sh(c, 0.35)); line(ctx, [[1.5, -36], [5, -30], [8.4, -36]], T || sh(c, -0.4), 1);   // V넥 테
      line(ctx, [[-8.6, -14.6], [8.6, -14.6]], T || sh(c, -0.4), 1.1);   // 밑단 테
      for (const x of [-6, -2]) line(ctx, [[x, -31], [x - 0.6, -21]], sh(c, -0.18), 0.6);   // 주름
      if (T) line(ctx, [[-8, -35.5], [1.2, -35.5]], T, 1);
      if (sp.emblem) emblem(ctx, sp.emblem, 3.5, -26.8, c, T);
      belt(ctx, c, T);
      return;
    }
    rr(ctx, -9, -36, 18, 23, 6, vgrad(ctx, -36, -13, c), ol(c), 0.8);
    torsoOld(ctx, kind, c, lk, sp, e, true);
  }
  function cape(ctx, o, kind, c, sp) {
    const m = o.moving ? 4 : 0, wv = Math.sin((o.t || 0) * 6) * (o.moving ? 1.5 : 0.6);
    const hemX = -19 - m + wv, T = sp && sp.trim;
    if (kind === 'travel') return capeOld(ctx, o, kind, c, sp);
    // 안감 (어둡게) → 겉감 (그라데이션) → 주름 → 테두리
    const out = kind === 'icy' ? null : [[-6, -36], [hemX - 1, -3], [4, -6], [4, -36]];
    if (out) poly(ctx, out, sh(c, -0.5));
    ctx.save();
    const g = ctx.createLinearGradient(0, -36, 0, -4); g.addColorStop(0, sh(c, 0.18)); g.addColorStop(1, sh(c, -0.25));
    capeOld(ctx, o, kind, g, sp, c);
    ctx.restore();
    line(ctx, [[-4, -33], [hemX + 6, -8]], 'rgba(255,255,255,.16)', 1.2); line(ctx, [[-1, -33], [hemX + 11, -7]], 'rgba(0,0,0,.18)', 1);
    line(ctx, [[-7, -36.2], [4.5, -36.2]], T || sh(c, 0.4), 2.2);
    ell(ctx, 3.6, -35.2, 1.6, 1.6, T || '#e8c870', sh(T || '#e8c870', -0.5), 0.5);   // 망토 고정 장식
  }
  function leg(ctx, kind, c, skin) {
    if (kind === 'greave') {
      rr(ctx, -3, 0, 6, 12, 2, vgrad(ctx, 0, 12, sh(c, -0.25)), ol(c), 0.6);
      rr(ctx, -3.7, 6, 7.4, 6.6, 2, hgrad(ctx, -3.7, 3.7, c), ol(c), 0.7);
      ell(ctx, 0.3, 5.2, 3.9, 3.1, hgrad(ctx, -3.6, 4.2, c), ol(c), 0.8); ell(ctx, 1.2, 4.4, 1.4, 0.9, 'rgba(255,255,255,.45)');
      return;
    }
    if (kind === 'pants' || !kind) { rr(ctx, -3, 0, 6, 12, 2, hgrad(ctx, -3, 3, c), ol(c), 0.5); return; }
    legOld(ctx, kind, c, skin);
  }
  function shoe(ctx, kind, c, skin, sp) {
    const T = sp && sp.trim;
    if (kind === 'sabaton' || kind === 'winged') {
      ctx.beginPath(); ctx.moveTo(-3.8, 7); ctx.lineTo(3.6, 7); ctx.quadraticCurveTo(8.8, 10, 8.8, 13.4); ctx.lineTo(8.8, 15); ctx.lineTo(-3.8, 15); ctx.closePath();
      ctx.fillStyle = vgrad(ctx, 7, 15, c, 0.3, -0.35); ctx.fill(); ctx.strokeStyle = ol(c); ctx.lineWidth = 0.8; ctx.stroke();
      rr(ctx, -4.2, 6.4, 8.2, 2.4, 1, T || sh(c, 0.35), ol(c), 0.5);   // 발목 테
      line(ctx, [[1, 10.5], [6.6, 12.4]], 'rgba(255,255,255,.4)', 0.8); ctx.fillStyle = sh(c, -0.5); ctx.fillRect(-3.8, 14, 12.6, 1);
      if (sp && sp.spikes) poly(ctx, [[-3.8, 9], [-7, 7.5], [-3.8, 12]], T || '#fff');
      if (kind === 'winged') for (let i = 0; i < 2; i++) ell(ctx, -5 - i * 1.4, 8.5 - i * 1.8, 2.8 - i * 0.6, 1.1, '#ffffff', sh(c, -0.2), 0.4);
      return;
    }
    if (kind === 'boot' || kind === 'tallboot' || kind === 'curl') {
      shoeOld(ctx, kind, c, skin, sp);
      line(ctx, [[-3.4, 14.6], [5.4, 14.6]], sh(c, -0.55), 1); line(ctx, [[0.6, 10.6], [4.6, 11.6]], 'rgba(255,255,255,.35)', 0.7);
      if (T) line(ctx, [[-3.6, kind === 'tallboot' ? 4.6 : 6.6], [3.8, kind === 'tallboot' ? 4.6 : 6.6]], T, 1.1);
      return;
    }
    shoeOld(ctx, kind, c, skin, sp);
  }
  function pauldron(ctx, kind, c, sp) {
    if (kind !== 'plate') return pauldronOld(ctx, kind, c, sp);
    const T = sp.trim;
    ctx.beginPath(); ctx.ellipse(0, 3.2, 6.6, 5.2, 0, PI * 0.95, PI * 2.05); ctx.fillStyle = sh(c, -0.3); ctx.fill(); ctx.strokeStyle = ol(c); ctx.lineWidth = 0.6; ctx.stroke();   // 아래 겹
    ctx.beginPath(); ctx.ellipse(0, 1.6, 6.2, 5.2, 0, PI * 0.95, PI * 2.05); ctx.fillStyle = vgrad(ctx, -3.6, 2, c, 0.4, -0.1); ctx.fill();
    ctx.strokeStyle = T || sh(c, -0.4); ctx.lineWidth = 1.1; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-0.6, 0.8, 3.6, 2.6, 0, PI * 1.1, PI * 1.7); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.8; ctx.stroke();
    if (sp.spikes) poly(ctx, [[-2, -2.4], [-5, -7], [1, -3]], T || '#fff');
    if (sp.rivet) ell(ctx, 0, 0, 0.9, 0.9, sh(c, 0.45));
  }
  function hand(ctx, kind, c, skin, sp) {
    if (kind === 'gauntlet') {
      poly(ctx, [[-4.4, 8.4], [4.4, 8.4], [3.6, 12.4], [-3.6, 12.4]], vgrad(ctx, 8.4, 12.4, sp.trim || sh(c, 0.3), 0.25, -0.2), ol(c), 0.7);
      line(ctx, [[-4.2, 9.4], [4.2, 9.4]], 'rgba(255,255,255,.45)', 0.6);
      ell(ctx, 0, 14.3, 3.9, 3.8, hgrad(ctx, -3.9, 3.9, c), ol(c), 0.8); line(ctx, [[-1.8, 12.6], [1.8, 12.6]], 'rgba(255,255,255,.4)', 0.7);
      if (sp.spikes) poly(ctx, [[-4.2, 9], [-7.5, 8], [-4, 11.5]], sp.trim || '#fff');
      return;
    }
    if (kind === 'glove') { rr(ctx, -3.3, 9.3, 6.6, 3.2, 1, sp && sp.trim ? sp.trim : sh(c, -0.2), ol(c), 0.5); ell(ctx, 0, 14, 3.4, 3.4, hgrad(ctx, -3.4, 3.4, c), ol(c), 0.6); return; }
    handOld(ctx, kind, c, skin, sp);
  }
  function dome(ctx, c, d, top = -65) {
    const path = () => { ctx.beginPath(); ctx.moveTo(-13.5, -53); ctx.quadraticCurveTo(-14, top, 1, top); ctx.quadraticCurveTo(16, top, 15.5, -53); ctx.closePath(); };
    const g = ctx.createLinearGradient(-12, top, 10, -53); g.addColorStop(0, sh(c, 0.4)); g.addColorStop(0.45, c); g.addColorStop(1, sh(c, -0.32));
    path(); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = sh(c, -0.55); ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); path(); ctx.clip();
    ell(ctx, -4.5, top + 5.5, 7.5, 3.2, 'rgba(255,255,255,.38)');   // 광택
    line(ctx, [[1, top + 0.6], [1, -55]], sh(c, 0.42), 1.4); line(ctx, [[2.2, top + 1], [2.2, -55]], sh(c, -0.38), 0.6);   // 가운데 능선
    ctx.restore();
    rr(ctx, -14.2, -57.6, 30.2, 3.9, 1.6, vgrad(ctx, -57.6, -53.7, sh(c, -0.1), 0.3, -0.3), sh(c, -0.55), 0.7);   // 테 (아래 띠)
    for (const x of [-9, 11]) ell(ctx, x, -55.7, 0.85, 0.85, sh(c, 0.5));
  }
