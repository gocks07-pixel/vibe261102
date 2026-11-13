  // ======== 무기 시안: 세트에 맞춘 새 무기 (칼 · 단검 · 지팡이 · 활) ========
  const NEWW = { mithril: 1, rag: 1, frost: 1, void: 1, starheir: 1 };
  function grip(ctx, c1, c2, len) { rr(ctx, -1.8, -len, 3.6, len + 2, 1, c1, sh(c1, -0.5), 0.5); for (let y = -len + 1.5; y < 1; y += 2.2) line(ctx, [[-1.8, y], [1.8, y + 1.2]], c2, 0.7); }
  function swordNew(ctx, st, dag, c) {
    const L = dag ? 18 : 33;
    switch (st) {
      case 'mithril': {   // 은빛 기사: 홈 파인 기사검 + 파란 보석 십자 가드 + 붉은 술
        poly(ctx, [[-2.6, 4], [2.6, 4], [2.2, L - 4], [0, L + 2], [-2.2, L - 4]], vgrad(ctx, 4, L, '#eef2f8', 0.1, -0.25), '#7a8698', 0.8);
        line(ctx, [[0, 6], [0, L - 5]], '#9aa6b8', 1.1); line(ctx, [[0.9, 6], [0.9, L - 6]], 'rgba(255,255,255,.7)', 0.5);
        poly(ctx, [[-(dag ? 6 : 9), 1.6], [-2, 2.4], [0, 1], [2, 2.4], [(dag ? 6 : 9), 1.6], [2, 4.6], [-2, 4.6]], '#d8dee8', '#6a7688', 0.7);
        ell(ctx, 0, 3, 1.7, 1.7, '#3a6ad0', '#e8ecf4', 0.5); grip(ctx, '#3a4a7a', '#e8ecf4', 6);
        ell(ctx, 0, -6.5, 2.2, 2.2, '#d8dee8', '#6a7688', 0.5);
        ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.moveTo(-0.6, -8); ctx.quadraticCurveTo(-3, -12, -2, -15); ctx.lineTo(0.8, -14); ctx.quadraticCurveTo(0.4, -11, 0.6, -8); ctx.fill();
        return;
      }
      case 'rag': {       // 증기 기술자: 큰 렌치 (단검: 드라이버 송곳)
        if (dag) { poly(ctx, [[-1.2, 4], [1.2, 4], [0.8, L - 2], [0, L + 1], [-0.8, L - 2]], '#c8ccd4', '#6a6e78', 0.6); rr(ctx, -2.6, -1, 5.2, 5, 1.5, '#d0843e', '#7a4a1a', 0.6); grip(ctx, '#b8862a', '#5a3a1a', 6); return; }
        rr(ctx, -2, 2, 4, L - 8, 1.5, vgrad(ctx, 2, L, '#a8b0bc', 0.2, -0.2), '#5a606a', 0.7);
        for (const y of [8, 14, 20]) ell(ctx, 0, y, 0.8, 0.8, '#5a606a');
        ctx.fillStyle = vgrad(ctx, L - 9, L + 5, '#c8d0dc', 0.2, -0.2); ctx.beginPath(); ctx.arc(0, L - 2, 6.5, PI * 0.62, PI * 2.38); ctx.lineTo(1.8, L + 1); ctx.lineTo(1.8, L - 2.5); ctx.arc(0, L - 2.5, 1.8, 0, PI, true); ctx.lineTo(-1.8, L + 1); ctx.closePath(); ctx.fill();   // 열린 렌치 입
        ctx.strokeStyle = '#5a606a'; ctx.lineWidth = 0.8; ctx.stroke();
        ell(ctx, -3.2, L - 4, 1, 1, '#d0843e'); grip(ctx, '#b8862a', '#5a3a1a', 7); ell(ctx, 0, -7.5, 2, 2, '#d0843e', '#7a4a1a', 0.5);
        return;
      }
      case 'frost': {     // 서리 사냥꾼: 휘어진 서리 사냥칼 + 털 감은 손잡이 (단검: 고드름 칼)
        if (dag) { poly(ctx, [[-2, 3], [2, 3], [0.6, L + 2], [-0.4, L + 2]], vgrad(ctx, 3, L, '#e8f8ff', 0.1, -0.2), '#7ab8e0', 0.7); line(ctx, [[0, 5], [0, L - 2]], 'rgba(255,255,255,.8)', 0.6); }
        else { ctx.beginPath(); ctx.moveTo(-2.4, 4); ctx.quadraticCurveTo(-3, L * 0.7, -7, L + 1); ctx.quadraticCurveTo(3.8, L * 0.7, 2.6, 4); ctx.closePath();
          ctx.fillStyle = vgrad(ctx, 4, L, '#e8f8ff', 0.1, -0.25); ctx.fill(); ctx.strokeStyle = '#7ab8e0'; ctx.lineWidth = 0.8; ctx.stroke();
          line(ctx, [[-2.2, 6], [-3, L * 0.7], [-6.4, L]], 'rgba(255,255,255,.85)', 0.8); }
        rr(ctx, -3.4, 1.4, 6.8, 3, 1.4, '#7ab8e0', '#4a7aa8', 0.5);
        rr(ctx, -2.4, -7, 4.8, 8.5, 2, '#ffffff', '#c8d4e0', 0.5); for (let y = -6; y < 1; y += 2) ell(ctx, 0, y, 2.2, 0.8, '#e8eef4');   // 털
        return;
      }
      case 'void': {      // 공허의 그림자: 초승달 낫 (단검: 작은 낫)
        const R = dag ? 8 : 13, cy = L - (dag ? 4 : 6);
        line(ctx, [[0, -4], [0, cy + 2]], '#2a1a3a', dag ? 2.6 : 3);
        ctx.beginPath(); ctx.moveTo(1.5, cy - 1); ctx.quadraticCurveTo(R * 1.3, cy + R * 0.2, R * 0.9, cy + R * 1.15);   // 바깥 날
        ctx.quadraticCurveTo(R * 0.6, cy + R * 0.35, -1, cy + 3); ctx.closePath();
        ctx.fillStyle = vgrad(ctx, cy, cy + R, '#5a2a8a', 0.2, -0.3); ctx.fill(); ctx.strokeStyle = '#c890ff'; ctx.lineWidth = 1; ctx.stroke();
        glowOn(ctx, '#b070ff', 5); ctx.beginPath(); ctx.moveTo(1.5, cy - 1); ctx.quadraticCurveTo(R * 1.3, cy + R * 0.2, R * 0.9, cy + R * 1.15); ctx.strokeStyle = '#e0c0ff'; ctx.lineWidth = 0.8; ctx.stroke(); glowOff(ctx);
        ell(ctx, 0, cy + 1, 1.8, 1.8, '#e0b0ff');
        for (const y of [-2, 2]) line(ctx, [[-1.5, y], [1.5, y + 0.8]], '#c890ff', 0.6);
        return;
      }
      case 'starheir': {  // 별의 기사: 성검 (날개 가드 · 별 끝)
        poly(ctx, [[-2.6, 4], [2.6, 4], [2.4, L - 5], [0, L + 1], [-2.4, L - 5]], vgrad(ctx, 4, L, '#fffbe8', 0.05, -0.12), '#e8c050', 0.9);
        line(ctx, [[0, 6], [0, L - 4]], '#ffe680', 1.2);
        for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ell(ctx, s * (3.6 + i * 2.2), 2.4 - i * 1.3, 2.8 - i * 0.5, 1.2, '#fffbe8', '#e8c050', 0.4);
        star(ctx, 0, 3, 2.6, '#ffd040'); grip(ctx, '#e8c050', '#a8862a', 6); star(ctx, 0, -7.5, 2.6, '#fff4b0', 4);
        return;
      }
    }
  }
  function wandNew(ctx, st, c) {
    const y = 26;
    switch (st) {
      case 'mithril': line(ctx, [[0, -3], [0, 21]], '#c8d0dc', 3); for (const yy of [2, 10, 18]) rr(ctx, -2.2, yy, 4.4, 1.6, 0.6, '#3a6ad0');
        poly(ctx, [[0, y - 6], [5.5, y - 3], [5, y + 3], [0, y + 7], [-5, y + 3], [-5.5, y - 3]], vgrad(ctx, y - 6, y + 7, '#eef2f8'), '#6a7688', 0.8);
        ell(ctx, 0, y, 2.2, 2.2, '#3a6ad0', '#e8ecf4', 0.6); return;   // 방패 문장 홀
      case 'rag': line(ctx, [[0, -3], [0, 22]], '#b8862a', 3.4); for (const yy of [4, 14]) rr(ctx, -2.6, yy, 5.2, 2, 0.8, '#7a5a2a');
        ell(ctx, 0, y, 6, 6, '#b8862a', '#5a3a1a', 0.8); ell(ctx, 0, y, 4.4, 4.4, '#f4eedc'); line(ctx, [[0, y], [2.6, y - 2]], '#c03040', 0.9); ell(ctx, 0, y, 0.8, 0.8, '#3a3028');   // 압력계
        glowOn(ctx, '#ffd080', 6); ell(ctx, 0, y + 7.5, 1.8, 1.8, '#ffe0a0'); glowOff(ctx); return;
      case 'frost': ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 22); ctx.stroke();
        for (const s of [-1, 1]) { line(ctx, [[0, 18], [s * 5, 24], [s * 6, 30]], '#e8dcc0', 2); line(ctx, [[s * 5, 24], [s * 8.5, 25]], '#e8dcc0', 1.6); }   // 뿔
        glowOn(ctx, '#bfe8ff', 8); ell(ctx, 0, y, 4.2, 4.2, '#dff4ff', '#7ab8e0', 0.8); glowOff(ctx); ell(ctx, -1.2, y - 1.4, 1.2, 1.2, '#fff'); return;
      case 'void': line(ctx, [[0, -3], [0, 21]], '#2a1a3a', 3);
        glowOn(ctx, '#b070ff', 8); ctx.fillStyle = '#c890ff'; ctx.beginPath(); ctx.arc(0, y + 1, 6.5, PI * 0.2, PI * 1.8); ctx.arc(2.6, y + 1, 5, PI * 1.65, PI * 0.35, true); ctx.fill();
        ell(ctx, -1, y + 1, 2, 2, '#f0d8ff'); glowOff(ctx); return;
      case 'starheir': line(ctx, [[0, -3], [0, 21]], '#e8c050', 3);
        ctx.strokeStyle = '#fff4b8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, y, 8, 3, 0.4, 0, PI * 2); ctx.stroke();
        glowOn(ctx, '#ffe680', 9); star(ctx, 0, y, 6, '#fff4b8'); glowOff(ctx); star(ctx, 0, y, 2.6, '#ffd040'); ell(ctx, 7, y + 2.8, 1, 1, '#ffffff'); return;
    }
  }
  function bowNew(ctx, st, c) {
    const limb = (col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-17, -2); ctx.quadraticCurveTo(0, 22, 17, -2); ctx.stroke(); };
    const string = col => { ctx.strokeStyle = col; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.stroke(); };
    switch (st) {
      case 'mithril': limb('#6a7688', 4.2); limb('#e8ecf4', 2.6); string('#f4f4f4'); rr(ctx, -2.6, 7, 5.2, 4.5, 1, '#3a4a7a', '#e8ecf4', 0.5);
        for (const s of [-1, 1]) { ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.moveTo(s * 17, -2); ctx.quadraticCurveTo(s * 18, 3, s * 16, 7); ctx.lineTo(s * 15.4, 6); ctx.quadraticCurveTo(s * 16.6, 2, s * 16, -1); ctx.fill(); } return;
      case 'rag': limb('#5a3a1a', 4); limb('#b8862a', 2.4); string('#c8ccd4');
        for (const s of [-1, 1]) { ell(ctx, s * 17, -2, 3.4, 3.4, '#9aa0a8', '#4a4a50', 0.7); ell(ctx, s * 17, -2, 1.2, 1.2, '#d0843e'); }
        rr(ctx, -3, 6, 6, 6, 1.5, '#9aa0a8', '#4a4a50', 0.6); line(ctx, [[-14, 0.5], [14, 0.5]], '#c8ccd4', 0.6); return;   // 도르래 · 두 줄
      case 'frost': limb('#c8b898', 4); limb('#f4ecd8', 2.4); string('#e8f6ff');
        glowOn(ctx, '#bfe8ff', 6); for (const s of [-1, 1]) poly(ctx, [[s * 17, -2], [s * 21, -7], [s * 19, -1], [s * 22, 1]], '#e8f8ff', '#7ab8e0', 0.6); glowOff(ctx);
        rr(ctx, -2.6, 7, 5.2, 4.5, 2, '#ffffff', '#c8d4e0', 0.5); return;
      case 'void': limb('#1a0a2a', 4.4); limb('#5a2a8a', 2.6); string('#c890ff');
        for (const s of [-1, 1]) { ctx.fillStyle = '#c890ff'; ctx.beginPath(); ctx.arc(s * 17, -4, 4, s > 0 ? PI * 0.6 : -PI * 0.4, s > 0 ? PI * 1.9 : PI * 0.9); ctx.fill(); }
        glowOn(ctx, '#b070ff', 7); ell(ctx, 0, 8.5, 2.2, 2.2, '#e0b0ff'); glowOff(ctx); return;
      case 'starheir': limb('#a8862a', 4.2); limb('#ffe680', 2.6); ctx.strokeStyle = '#fff4b8'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(-17, -2); ctx.lineTo(17, -2); ctx.stroke(); ctx.setLineDash([]);
        glowOn(ctx, '#ffe680', 7); for (const s of [-1, 1]) star(ctx, s * 17, -2, 3.2, '#fff4b8'); star(ctx, 0, 8.5, 3.4, '#fff4b8'); glowOff(ctx);
        for (const x of [-9, 0, 9]) ell(ctx, x, -2, 0.9, 0.9, '#ffffff'); return;   // 별자리 점
    }
  }
  function weapon(ctx, type, color, st) {
    if (!NEWW[st] || !['sword', 'dagger', 'wand', 'bow'].includes(type)) return weaponOld(ctx, type, color, st);
    ctx.save(); ctx.translate(0, 14);
    if (type === 'sword' || type === 'dagger') { ctx.rotate(type === 'dagger' ? -1.8 : -1.9); swordNew(ctx, st, type === 'dagger', color); }
    else if (type === 'wand') { ctx.rotate(-1.4); wandNew(ctx, st, color); }
    else bowNew(ctx, st, color);
    glowOff(ctx); ctx.restore();
  }
