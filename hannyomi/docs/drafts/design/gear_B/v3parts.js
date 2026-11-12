  // ======== 시안 B: 아예 다른 디자인 (세트마다 다른 실루엣) ========
  const TAIL = { surcoat: 1, furcoat: 1, longcoat: 1, knightcoat: 1 };
  const SLV = { furcoat: 1, longcoat: 1, knightcoat: 1, surcoat: 1 };
  const WHITE = '#f4f1e8';
  function hat(ctx, kind, c, sp, t) {
    const T = sp.trim || '#ffe08a';
    switch (kind) {
      case 'plume': {   // 은빛 기사: 투구 + 뒤로 흐르는 깃털 장식 (깃털 세 겹)
        const f = Math.sin(t * 4) * 0.8;
        dome(ctx, c, sh(c, -0.35));
        for (const [dx, dy, col] of [[0, 0, '#a82838'], [1.5, 2.5, '#c03040'], [3, 5, '#e05a68']]) {
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(2, -65);
          ctx.quadraticCurveTo(-6 - dx, -78 + dy, -20 - dx + f, -72 + dy); ctx.quadraticCurveTo(-10 - dx, -70 + dy * 0.6, -1, -63); ctx.closePath(); ctx.fill();
        }
        line(ctx, [[1, -65], [-9, -72], [-18 + f, -70]], '#f4a0a8', 0.7);
        rr(ctx, -0.6, -68, 4.2, 4, 1.2, '#e8ecf4', sh(c, -0.5), 0.6);   // 깃털 꽂이
        return;
      }
      case 'frostcrown': {   // 서리 사냥꾼: 얼음 결정 티아라
        rr(ctx, -12.5, -59.5, 27.5, 3.2, 1.5, vgrad(ctx, -59.5, -56.3, '#dff4ff'), '#7ab0d8', 0.7);
        glowOn(ctx, sp.glow || '#bfe8ff', 7);
        for (const [x, h, w] of [[-6, 6, 2.2], [0, 9, 2.6], [6.5, 13, 3.2], [12, 8, 2.4]]) poly(ctx, [[x - w, -59], [x, -59 - h], [x + w, -59]], 'rgba(220,245,255,.95)', '#7ab0d8', 0.6);
        glowOff(ctx);
        for (const x of [0, 6.5]) line(ctx, [[x, -60], [x, -64]], '#ffffff', 0.7);
        return;
      }
      case 'hood': {   // 공허의 그림자: 머리에 맞는 후드 (얼굴 앞쪽만 열림) + 빛나는 테두리
        const g = ctx.createLinearGradient(-16, -70, 14, -40); g.addColorStop(0, sh(c, 0.15)); g.addColorStop(1, sh(c, -0.45));
        ctx.beginPath(); ctx.moveTo(-10, -42); ctx.quadraticCurveTo(-17, -38, -15, -33); ctx.lineTo(-5, -38); ctx.closePath(); ctx.fillStyle = sh(c, -0.35); ctx.fill();   // 목 뒤 자락
        ctx.beginPath(); ctx.ellipse(-0.5, -54, 16.5, 15.5, 0, 0, PI * 2); ctx.ellipse(6.5, -49.5, 11, 12.2, 0, 0, PI * 2, true);
        ctx.fillStyle = g; ctx.fill('evenodd'); ctx.strokeStyle = sh(c, -0.6); ctx.lineWidth = 0.7; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.ellipse(-0.5, -54, 16.5, 15.5, 0, 0, PI * 2); ctx.clip();
        glowOn(ctx, sp.glow || '#b070ff', 6); ctx.beginPath(); ctx.ellipse(6.5, -49.5, 11, 12.2, 0, 0, PI * 2); ctx.strokeStyle = T; ctx.lineWidth = 1.2; ctx.stroke(); glowOff(ctx);
        ctx.restore();
        line(ctx, [[-12, -62], [-6, -67]], 'rgba(255,255,255,.18)', 1.4);
        return;
      }
      case 'starcirclet': {   // 별의 기사: 가는 금 서클릿 + 이마의 큰 별 + 작은 날개
        ctx.strokeStyle = '#e8c050'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(1, -59, 14.5, 3.4, 0, PI * 0.05, PI * 0.95, true); ctx.stroke();
        for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-12, -59); ctx.rotate(-0.6 - i * 0.35); ell(ctx, -4, 0, 5 - i, 1.4, '#fffbe8', '#e8c050', 0.4); ctx.restore(); }
        glowOn(ctx, sp.glow || '#ffe680', 9); star(ctx, 10, -61, 4.2, '#fff4b8'); glowOff(ctx); star(ctx, 10, -61, 2, '#ffd040');
        return;
      }
    }
    return hatOld(ctx, kind, c, sp, t);
  }
  function torso(ctx, kind, c, lk, sp, e) {
    const T = sp.trim || '#e8c870';
    switch (kind) {
      case 'surcoat': {   // 판금 위에 문장이 있는 천 겉옷 (앞판이 무릎까지)
        torsoV2(ctx, 'plate', c, lk, Object.assign({}, sp, { emblem: null }), e);
        const tb = sp.cloth || '#2a4a9a';
        rr(ctx, -2, -35, 11, 22, 3, vgrad(ctx, -35, -13, tb, 0.2, -0.3), sh(tb, -0.55), 0.7);
        line(ctx, [[-1.6, -34], [-1.6, -14]], T, 0.9); line(ctx, [[8.6, -34], [8.6, -14]], T, 0.9);
        poly(ctx, [[1.4, -31], [6.4, -31], [6.4, -27.5], [3.9, -24.5], [1.4, -27.5]], T, sh(T, -0.5), 0.5);   // 방패 문장
        line(ctx, [[3.9, -30.5], [3.9, -25.5]], tb, 0.8); line(ctx, [[2, -28.6], [5.8, -28.6]], tb, 0.8);
        belt(ctx, c, T);
        return;
      }
      case 'furcoat': {   // 털 깃 코트
        rr(ctx, -9, -36, 18, 23, 6, vgrad(ctx, -36, -13, c), sh(c, -0.55), 0.8);
        line(ctx, [[3.5, -33], [3, -14]], sh(c, -0.4), 0.9);   // 앞섶
        for (const y of [-29, -24]) { ell(ctx, 4.8, y, 0.9, 0.9, T); }
        belt(ctx, c, T);
        for (let i = 0; i < 7; i++) ell(ctx, -8 + i * 2.8, -36 + Math.abs(i - 3) * 0.5, 2.6, 2.3, i % 2 ? '#ffffff' : '#e8eef4', '#c8d4e0', 0.4);   // 털 깃
        if (sp.glow) { glowOn(ctx, sp.glow, 5); emblem(ctx, 'flake', -4.5, -27, c, '#ffffff'); glowOff(ctx); }
        return;
      }
      case 'longcoat': {  // 높은 깃 긴 코트 + 사선 끈 + 빛나는 룬
        rr(ctx, -9, -36, 18, 23, 6, vgrad(ctx, -36, -13, c, 0.15, -0.4), sh(c, -0.6), 0.8);
        poly(ctx, [[-7, -36], [-6, -42], [9, -41], [8.5, -36]], sh(c, -0.2), sh(c, -0.6), 0.7);   // 높은 깃
        line(ctx, [[-8, -33], [8, -17]], sh(c, -0.55), 2.2); line(ctx, [[-8, -33.6], [8, -17.6]], sh(c, 0.2), 0.5);
        glowOn(ctx, sp.glow || '#b070ff', 6); poly(ctx, [[0, -27.5], [2, -25], [0, -22.5], [-2, -25]], T); glowOff(ctx);
        for (const [x0, y0] of [[-6, -22], [5.5, -31]]) line(ctx, [[x0, y0], [x0 + 1.2, y0 - 2], [x0 + 2.4, y0]], 'rgba(200,150,255,.7)', 0.6);
        return;
      }
      case 'knightcoat': {   // 하얀 기사 코트 + 금 테 + 사선 띠(장비 색)
        rr(ctx, -9, -36, 18, 23, 6, vgrad(ctx, -36, -13, WHITE, 0.1, -0.12), '#b8b0a0', 0.8);
        line(ctx, [[3.5, -35], [3.5, -14]], '#e8c050', 1.2);
        for (const y of [-31, -26.5, -22]) ell(ctx, 5.4, y, 0.9, 0.9, '#e8c050');
        ctx.save(); ctx.beginPath(); ctx.roundRect(-9, -36, 18, 23, 6); ctx.clip();
        poly(ctx, [[-10, -36], [-5, -36], [10, -18], [5, -18]], c); line(ctx, [[-7.5, -36], [7.5, -18]], sh(c, 0.35), 0.5); ctx.restore();
        line(ctx, [[-8.4, -35.6], [8.4, -35.6]], '#e8c050', 1.8);
        glowOn(ctx, sp.glow || '#ffe680', 5); star(ctx, -3.5, -29, 2.4, '#fff4b8'); glowOff(ctx);
        belt(ctx, '#8a7a5a', '#e8c050');
        return;
      }
    }
    return torsoV2(ctx, kind, c, lk, sp, e);
  }
  // 코트 자락 (허리 아래, 앞이 갈라짐)
  function coatTail(ctx, kind, c, sp, sw) {
    const k = sw * 2, T = sp.trim || '#e8c870';
    const col = kind === 'knightcoat' ? WHITE : kind === 'surcoat' ? (sp.cloth || '#2a4a9a') : c;
    const edge = kind === 'knightcoat' ? '#e8c050' : kind === 'furcoat' ? '#ffffff' : kind === 'longcoat' ? (sp.trim || '#c890ff') : T;
    const len = kind === 'surcoat' ? -4 : kind === 'longcoat' ? 0 : -3;
    if (kind === 'surcoat') {   // 앞판만
      poly(ctx, [[-1.5, -16], [8.5, -16], [9.5 + k, len], [-2 + k, len]], vgrad(ctx, -16, len, col, 0.1, -0.35), sh(col, -0.55), 0.7);
      line(ctx, [[-2 + k, len + 0.6], [9.5 + k, len + 0.6]], T, 1.2); return;
    }
    poly(ctx, [[-9, -17], [-1, -17], [-2 - k, len], [-12 - k, len - 1]], vgrad(ctx, -17, len, col, 0.05, -0.35), sh(col, -0.55), 0.7);   // 뒤 자락
    poly(ctx, [[3, -17], [9, -17], [11 + k, len - 1], [4 + k, len]], vgrad(ctx, -17, len, col, 0.1, -0.3), sh(col, -0.55), 0.7);      // 앞 자락
    line(ctx, [[-12 - k, len - 0.6], [-2 - k, len + 0.4]], edge, kind === 'furcoat' ? 2.4 : 1.2);
    line(ctx, [[4 + k, len + 0.4], [11 + k, len - 0.4]], edge, kind === 'furcoat' ? 2.4 : 1.2);
  }
  function sleeve(ctx, kind, c, e, sp) {
    if (kind === 'furcoat') { rr(ctx, -3, 0, 6, 14, 2.5, hgrad(ctx, -3, 3, c), sh(c, -0.55), 0.6); rr(ctx, -3.6, 9.5, 7.2, 3.4, 1.6, '#ffffff', '#c8d4e0', 0.4); return; }
    if (kind === 'longcoat') { rr(ctx, -3, 0, 6, 14, 2.5, hgrad(ctx, -3, 3, c), sh(c, -0.6), 0.6); line(ctx, [[-3, 11], [3, 11]], sp.trim || '#c890ff', 0.9); return; }
    if (kind === 'knightcoat') { rr(ctx, -3, 0, 6, 14, 2.5, hgrad(ctx, -3, 3, WHITE), '#b8b0a0', 0.6); rr(ctx, -3.3, 10, 6.6, 2.6, 1, '#e8c050'); return; }
    if (kind === 'surcoat') return sleeveOld(ctx, 'plate', c, e, sp);
    return sleeveOld(ctx, kind, c, e, sp);
  }
  function pauldron(ctx, kind, c, sp) {
    if (kind === 'surcoat') return pauldronV2(ctx, 'plate', c, sp);
    if (kind === 'knightcoat') { ctx.beginPath(); ctx.ellipse(0, 2, 5, 3.8, 0, PI * 0.95, PI * 2.05); ctx.fillStyle = '#e8c050'; ctx.fill(); ctx.strokeStyle = '#a8862a'; ctx.lineWidth = 0.6; ctx.stroke(); return; }
    if (kind === 'furcoat' || kind === 'longcoat') return;
    return pauldronV2(ctx, kind, c, sp);
  }
  function cape(ctx, o, kind, c, sp) {
    const m = o.moving ? 4 : 0, wv = Math.sin((o.t || 0) * 6) * (o.moving ? 1.5 : 0.6), hemX = -19 - m + wv;
    if (kind === 'fur') {   // 털 망토
      poly(ctx, [[-6, -36], [hemX, -6], [3, -8], [4, -36]], vgrad(ctx, -36, -6, c, 0.15, -0.35), sh(c, -0.55), 0.7);
      line(ctx, [[hemX, -6], [3, -8]], '#ffffff', 2.4);
      for (let i = 0; i < 5; i++) ell(ctx, -7 + i * 2.6, -37 + (i % 2), 2.8, 2.4, i % 2 ? '#ffffff' : '#e8eef4', '#c8d4e0', 0.4);
      return;
    }
    if (kind === 'shadow') {   // 공허: 어깨 반망토 (찢어진 끝)
      const pts = [[-7, -37], [hemX + 4, -20]]; for (let i = 0; i < 3; i++) pts.push([hemX + 7 + i * 4, -24 + (i % 2 ? 4 : 0)]); pts.push([3, -27], [4, -37]);
      poly(ctx, pts, vgrad(ctx, -37, -20, c, 0.1, -0.4), sp.trim || '#c890ff', 0.8); return;
    }
    if (kind === 'starflow') {   // 별의 기사: 땅까지 흐르는 별하늘 망토
      const g = ctx.createLinearGradient(0, -36, 0, 0); g.addColorStop(0, '#2a3a8a'); g.addColorStop(1, '#4a2a7a');
      poly(ctx, [[-6, -36], [hemX - 3, 0], [5, -1], [4, -36]], g, '#e8c050', 1.2);
      for (const [x, y, r] of [[-6, -28, 1.3], [-10 - m * 0.4, -18, 1.7], [-4, -12, 1.1], [-13 - m * 0.6 + wv, -5, 1.4], [-1, -4, 1]]) star(ctx, x, y, r, '#fff4b8', 4);
      return;
    }
    return capeV2(ctx, o, kind, c, sp);
  }
  // 공허: 주변을 도는 룬 두 개
  function runes(ctx, t, sp) {
    glowOn(ctx, sp.glow || '#b070ff', 8);
    for (const [ph, r] of [[0, 1], [PI, 0.8]]) { const a = t * 1.6 + ph, x = Math.cos(a) * 17, y = -34 + Math.sin(a) * 6; poly(ctx, [[x, y - 2.6 * r], [x + 1.8 * r, y], [x, y + 2.6 * r], [x - 1.8 * r, y]], '#d8b0ff'); }
    glowOff(ctx);
  }
