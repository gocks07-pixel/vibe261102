  // ======== 무기 시안: 세트에 맞춘 새 무기 (칼 · 단검 · 지팡이 · 활) ========
  const NEWW = { basic: 1, steel: 1, wind: 1, crystal: 1, shadow: 1, red: 1, mithril: 1, rag: 1, desert: 1, pharaoh: 1, frost: 1, storm: 1, sky: 1, void: 1, starheir: 1 };
  const SPROUT = { steel: 1, wind: 1, crystal: 1, shadow: 1 };   // Lv15 무기 4종 = 새싹 견습생
  function grip(ctx, c1, c2, len) { rr(ctx, -1.8, -len, 3.6, len + 2, 1, c1, sh(c1, -0.5), 0.5); for (let y = -len + 1.5; y < 1; y += 2.2) line(ctx, [[-1.8, y], [1.8, y + 1.2]], c2, 0.7); }
  function swordNew(ctx, st, dag, c) {
    const L = dag ? 18 : 33;
    switch (st) {
      case 'basic': {     // 초보 탐험가: 넓은 마체테 + 가죽 감은 손잡이 (단검: 사냥칼)
        if (dag) poly(ctx, [[-2, 4], [2.2, 4], [2.4, L - 5], [0, L + 1], [-1.6, L - 2], [-2, L - 6]], vgrad(ctx, 4, L, '#d8dce4'), '#6a6e78', 0.7);
        else { poly(ctx, [[-2.6, 4], [3, 4], [4.2, L - 4], [2, L + 1], [-2.6, L - 2]], vgrad(ctx, 4, L, '#d8dce4'), '#6a6e78', 0.8); line(ctx, [[2.4, 6], [3.4, L - 4]], 'rgba(255,255,255,.6)', 0.6); }
        rr(ctx, -3.8, 1.6, 7.6, 2.6, 1, '#6a4a2a', '#3a2210', 0.5); grip(ctx, '#8a5a32', '#4a2e18', 6); return;
      }
      case 'steel': case 'shadow': {   // 새싹 견습생: 잎사귀 가드 검 / 잎 모양 단검
        if (st === 'shadow') { ctx.beginPath(); ctx.moveTo(0, 3); ctx.quadraticCurveTo(5, L * 0.5, 0, L + 2); ctx.quadraticCurveTo(-5, L * 0.5, 0, 3); ctx.fillStyle = vgrad(ctx, 3, L, '#e8f4e0', 0.05, -0.2); ctx.fill(); ctx.strokeStyle = '#5a8a4a'; ctx.lineWidth = 0.7; ctx.stroke(); line(ctx, [[0, 5], [0, L]], '#7ad66a', 0.7); }
        else { poly(ctx, [[-2.4, 4], [2.4, 4], [2.2, L - 5], [0, L + 1], [-2.2, L - 5]], vgrad(ctx, 4, L, '#e8ecf0'), '#6a7688', 0.8); line(ctx, [[0, 6], [0, L - 5]], '#a8d8a0', 0.9); }
        for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 3.6, 2.6); ctx.rotate(s * 1.2); ell(ctx, 0, 0, 1.8, 3.6, '#7ad66a', '#3e8e34', 0.5); ctx.restore(); }
        ell(ctx, 0, 2.8, 1.5, 1.5, '#f4e27a'); grip(ctx, '#6a4a2a', '#9ae67a', 6); return;
      }
      case 'red': {       // 숲의 레인저: 넓은 나뭇잎 검 (잎맥) / 가시 단검
        if (dag) { poly(ctx, [[-1.8, 4], [1.8, 4], [0.4, L + 2], [-0.4, L + 2]], vgrad(ctx, 4, L, '#5a8a3a', 0.2, -0.3), '#2e5a1e', 0.6); for (const y of [8, 12]) poly(ctx, [[1.4, y], [3.6, y - 1], [1.2, y + 1.8]], '#3e6a2a'); }
        else { ctx.beginPath(); ctx.moveTo(-2, 4); ctx.quadraticCurveTo(-7, L * 0.55, 0, L + 3); ctx.quadraticCurveTo(7, L * 0.55, 2, 4); ctx.closePath(); ctx.fillStyle = vgrad(ctx, 4, L, '#6aba4a', 0.15, -0.3); ctx.fill(); ctx.strokeStyle = '#2e5a1e'; ctx.lineWidth = 0.8; ctx.stroke();
          line(ctx, [[0, 5], [0, L + 1]], '#2e5a1e', 0.8); for (let i = 1; i < 5; i++) { const y = 4 + i * L / 5.5; line(ctx, [[0, y], [-3, y + 3]], '#3e7a2a', 0.5); line(ctx, [[0, y], [3, y + 3]], '#3e7a2a', 0.5); } }
        line(ctx, [[-4, 2.4], [4, 2.4]], '#6a4a2a', 2); for (const x of [-4.6, 4.6]) ell(ctx, x, 2.4, 1.2, 1.2, '#e05a5a'); grip(ctx, '#5a3a1a', '#7ad66a', 6); return;
      }
      case 'desert': {    // 사막 유랑자: 넓은 언월도 + 붉은 천 술 / 굽은 잠비야 단검
        ctx.beginPath(); ctx.moveTo(-2.4, 4); ctx.quadraticCurveTo(-3, L * 0.6, dag ? -4 : -8, L + 1); ctx.quadraticCurveTo(dag ? 4 : 5.5, L * 0.75, 2.6, 4); ctx.closePath();
        ctx.fillStyle = vgrad(ctx, 4, L, '#e8e4dc', 0.05, -0.2); ctx.fill(); ctx.strokeStyle = '#7a6a58'; ctx.lineWidth = 0.8; ctx.stroke();
        poly(ctx, [[-4.4, 1.8], [4.4, 1.8], [3, 4.4], [-3, 4.4]], '#c9a33a', '#7a5a1a', 0.6); grip(ctx, '#5a3a2a', '#c9a33a', 6);
        ctx.fillStyle = '#b0503a'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(-3, -11, -1.5, -14); ctx.lineTo(1, -13.5); ctx.quadraticCurveTo(0.6, -10, 0.8, -7); ctx.fill(); return;
      }
      case 'pharaoh': {   // 태양의 사제: 금빛 갈고리검 / 앙크 단검
        if (dag) { poly(ctx, [[-1.8, 4], [1.8, 4], [1.2, L], [0, L + 2], [-1.2, L]], vgrad(ctx, 4, L, '#ffe680'), '#a8862a', 0.6); ctx.strokeStyle = '#e8c050'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, -9, 2.2, 2.8, 0, 0, PI * 2); ctx.stroke(); line(ctx, [[-3.5, -5.5], [3.5, -5.5]], '#e8c050', 1.4); grip(ctx, '#2a50b0', '#e8c050', 5); return; }
        rr(ctx, -2, 4, 4, L * 0.5, 1, vgrad(ctx, 4, L * 0.5, '#ffe680'), '#a8862a', 0.6);
        ctx.strokeStyle = '#e8c050'; ctx.lineWidth = 5; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(-5, L * 0.5 + 6, 7, -0.25, PI * 0.95); ctx.stroke();
        ctx.strokeStyle = '#fff4c0'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(-5, L * 0.5 + 6, 9.4, -0.25, PI * 0.95); ctx.stroke();
        glowOn(ctx, '#fff0a0', 5); ell(ctx, 0, 2.8, 2.4, 2.4, '#ffd040', '#a8862a', 0.5); glowOff(ctx); grip(ctx, '#2a50b0', '#e8c050', 6); return;
      }
      case 'storm': {     // 폭풍의 기수: 번개가 흐르는 칼 + 갈래 가드 / 번개 쿠나이
        if (dag) { glowOn(ctx, '#fff09a', 6); poly(ctx, [[-2, 4], [2, 4], [-0.5, 9], [2.5, 9], [0, L + 2], [0.6, 12], [-2.6, 12]], vgrad(ctx, 4, L, '#ffe060'), '#a88a2a', 0.6); glowOff(ctx); ell(ctx, 0, -7, 2.2, 2.2, null, '#9aa0b8', 1.2); grip(ctx, '#3a4a7a', '#ffe060', 5); return; }
        poly(ctx, [[-2.6, 4], [2.6, 4], [2.4, L - 5], [0, L + 1], [-2.4, L - 5]], vgrad(ctx, 4, L, '#c8d0ec', 0.15, -0.25), '#4a5a8a', 0.8);
        glowOn(ctx, '#fff09a', 7); line(ctx, [[0, 6], [-1.2, 11], [1, 16], [-1, 22], [0.8, L - 4]], '#ffe060', 1.1); glowOff(ctx);
        for (const s of [-1, 1]) poly(ctx, [[s * 2, 2], [s * 7, 0], [s * 5, 2.8], [s * 8, 4]], '#ffe060', '#a88a2a', 0.4);
        grip(ctx, '#3a4a7a', '#ffe060', 6); ell(ctx, 0, -7, 2, 2, '#ffe060'); return;
      }
      case 'sky': {       // 하늘 순례자: 깃털 모양 하얀 검 / 깃털 단검
        ctx.beginPath(); ctx.moveTo(0, 3); ctx.quadraticCurveTo(dag ? 4.5 : 6, L * 0.5, 0, L + 2); ctx.quadraticCurveTo(dag ? -3.5 : -4.5, L * 0.5, 0, 3);
        ctx.fillStyle = vgrad(ctx, 3, L, '#ffffff', 0, -0.12); ctx.fill(); ctx.strokeStyle = '#b8c8e8'; ctx.lineWidth = 0.7; ctx.stroke();
        line(ctx, [[0, 4], [0, L + 1]], '#9ab0d8', 0.8); for (let i = 1; i < (dag ? 3 : 6); i++) { const y = 4 + i * L / (dag ? 3.4 : 6.5); line(ctx, [[0, y], [2.6, y + 2.4]], '#d0dcf0', 0.5); line(ctx, [[0, y], [-2, y + 2.4]], '#d0dcf0', 0.5); }
        for (const s of [-1, 1]) ell(ctx, s * 3.6, 2.4, 2.8, 1.2, '#ffffff', '#b8c8e8', 0.4); grip(ctx, '#6a8ad0', '#ffffff', 6);
        glowOn(ctx, '#e8f0ff', 5); ell(ctx, 0, -7, 1.8, 1.8, '#ffffff'); glowOff(ctx); return;
      }
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
      case 'void': {      // 공허의 그림자: 금 간 어둠 장검 (빛나는 균열 + 떠다니는 조각) / 물결 단검 + 공허의 눈
        if (dag) {
          ctx.beginPath(); ctx.moveTo(-2.2, 4); for (let i = 1; i <= 4; i++) ctx.lineTo(-2.2 + (i % 2 ? 1.4 : -0.6), 4 + i * (L - 4) / 5);
          ctx.lineTo(0, L + 2); for (let i = 4; i >= 1; i--) ctx.lineTo(2.2 + (i % 2 ? 1.4 : -0.6), 4 + i * (L - 4) / 5); ctx.lineTo(2.2, 4); ctx.closePath();
          ctx.fillStyle = vgrad(ctx, 4, L, '#4a2a6a', 0.15, -0.3); ctx.fill(); ctx.strokeStyle = '#c890ff'; ctx.lineWidth = 0.8; ctx.stroke();
          rr(ctx, -4, 1.4, 8, 3, 1.4, '#2a1a3a', '#c890ff', 0.5); glowOn(ctx, '#b070ff', 6); ell(ctx, 0, 2.9, 1.8, 1.2, '#f0d8ff'); ell(ctx, 0, 2.9, 0.7, 0.7, '#2a1a3a'); glowOff(ctx);
          grip(ctx, '#2a1a3a', '#8a50d8', 6); return;
        }
        poly(ctx, [[-3, 4], [3, 4], [2.6, L - 6], [0, L + 1], [-2.6, L - 8]], vgrad(ctx, 4, L, '#3a2050', 0.15, -0.3), '#7a4ab0', 0.9);
        glowOn(ctx, '#b070ff', 7); line(ctx, [[0, 6], [-1, 11], [1.2, 16], [-0.6, 22], [0.8, L - 6]], '#e0c0ff', 1); glowOff(ctx);
        for (const [x, y, r] of [[4.5, L - 3, 1.4], [-4, L - 8, 1.1], [3, L + 3, 0.9]]) poly(ctx, [[x, y - r * 1.6], [x + r, y], [x, y + r * 1.6], [x - r, y]], '#8a50d8');
        poly(ctx, [[-7, 1], [-3, 3.5], [0, 1.6], [3, 3.5], [7, 1], [3, 5], [-3, 5]], '#2a1a3a', '#c890ff', 0.7);
        glowOn(ctx, '#b070ff', 6); ell(ctx, 0, 3.3, 1.6, 1.6, '#e0b0ff'); glowOff(ctx); grip(ctx, '#2a1a3a', '#8a50d8', 6); ell(ctx, 0, -7, 2, 2, '#c890ff');
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
      case 'basic': line(ctx, [[0, -3], [0, 22]], '#8a5a32', 3.2); ell(ctx, 0.6, 12, 1.6, 1.2, '#6a4a2a');   // 마디 있는 나무 지팡이 + 끈으로 묶은 초록 돌
        line(ctx, [[-2, 22], [2, 24]], '#d8c8a0', 0.8); poly(ctx, [[0, y - 5], [3.6, y], [0, y + 6], [-3.6, y]], '#5ac87a', '#2e7a4a', 0.7); ell(ctx, -1, y - 1.5, 1, 1, '#fff'); return;
      case 'crystal': line(ctx, [[0, -3], [0, 21]], '#7a5a32', 3); for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 2.5, 16); ctx.rotate(s * 0.9); ell(ctx, 0, 0, 1.6, 3.4, '#7ad66a', '#3e8e34', 0.4); ctx.restore(); }   // 새싹 가지 + 수정
        glowOn(ctx, '#c8f0ff', 6); poly(ctx, [[0, y - 6], [3.6, y], [0, y + 7], [-3.6, y]], '#dff4ff', '#7ab8e0', 0.7); glowOff(ctx); return;
      case 'red': ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(2, 10, -1, 22); ctx.stroke();   // 살아 있는 나무 지팡이
        ctx.beginPath(); ctx.moveTo(-1, 21); ctx.quadraticCurveTo(-7, 26, -3, 32); ctx.moveTo(-1, 21); ctx.quadraticCurveTo(6, 25, 3, 32); ctx.lineWidth = 2; ctx.stroke();
        for (const [x, yy] of [[-5, 26], [5, 26], [0, 30]]) { ctx.save(); ctx.translate(x, yy); ell(ctx, 0, 0, 2.2, 1.4, '#6aba4a', '#2e5a1e', 0.4); ctx.restore(); }
        for (const [x, yy] of [[-1.5, 27], [1.5, 28.5]]) ell(ctx, x, yy, 1.3, 1.3, '#e05a5a', '#902a2a', 0.3); return;
      case 'desert': line(ctx, [[0, -3], [0, 21]], '#6a4a32', 3); line(ctx, [[0, 21], [0, 23]], '#c9a33a', 3);   // 등불 지팡이 + 동전
        rr(ctx, -3.6, y - 3, 7.2, 8, 2, '#c9a33a', '#7a5a1a', 0.6); glowOn(ctx, '#ffd080', 7); rr(ctx, -2.2, y - 1.6, 4.4, 5, 1.4, '#ffe0a0'); glowOff(ctx);
        for (const x of [-4, 4]) { line(ctx, [[x * 0.8, y + 5], [x, y + 8]], '#c9a33a', 0.6); ell(ctx, x, y + 9, 1.2, 1.2, '#e8c050', '#a8862a', 0.3); } return;
      case 'pharaoh': line(ctx, [[0, -3], [0, 20]], '#e8c050', 3); for (const yy of [4, 12]) rr(ctx, -2.2, yy, 4.4, 1.6, 0.6, '#2a50b0');   // 앙크 + 태양
        ctx.strokeStyle = '#e8c050'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, y + 1, 3.4, 4.4, 0, 0, PI * 2); ctx.stroke(); line(ctx, [[-5, y - 3.2], [5, y - 3.2]], '#e8c050', 2.2);
        glowOn(ctx, '#fff0a0', 7); ell(ctx, 0, y + 1, 1.8, 1.8, '#ffd040'); glowOff(ctx); return;
      case 'storm': line(ctx, [[0, -3], [0, 20]], '#3a4a7a', 3); for (const s of [-1, 1]) line(ctx, [[0, 18], [s * 4, 22], [s * 4, 29]], '#9aa0b8', 1.6);   // 소리굽쇠 + 불꽃
        glowOn(ctx, '#fff09a', 8); poly(ctx, [[1, y - 3], [-2.2, y + 2], [0, y + 2], [-1.4, y + 7], [2.6, y + 1], [0.6, y + 1]], '#ffe060'); glowOff(ctx); return;
      case 'sky': line(ctx, [[0, -3], [0, 20]], '#f4f6fa', 3); line(ctx, [[0, 20], [0, 22]], '#6a8ad0', 3);   // 날개 고리 + 구름 구슬
        for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ell(ctx, s * (6 + i * 1.5), y - 1 + i * 2, 3.6 - i * 0.6, 1.4, '#ffffff', '#b8c8e8', 0.4);
        ctx.strokeStyle = '#e8f0ff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, y, 5.2, 0, PI * 2); ctx.stroke(); glowOn(ctx, '#e8f0ff', 7); ell(ctx, 0, y, 3, 3, '#ffffff'); glowOff(ctx); return;
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
      case 'basic': limb('#5a3a1a', 4); limb('#a87a4a', 2.4); string('#f0ead8'); rr(ctx, -2.6, 7, 5.2, 4.5, 1, '#6a4a2a', '#3a2210', 0.5);   // 나무 단궁 + 깃털 장식
        line(ctx, [[12, 4], [11, 10]], '#d8c8a0', 0.6); ell(ctx, 10.6, 12, 1.2, 2.6, '#f4f0e0', '#b8b0a0', 0.4); return;
      case 'wind': limb('#3e8e34', 3.6); limb('#9ae67a', 2); string('#f4fff0'); for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 17, -3); ctx.rotate(s * 0.8); ell(ctx, 0, -2, 2, 4, '#7ad66a', '#3e8e34', 0.5); ctx.restore(); }   // 새싹 잎 활
        rr(ctx, -2.6, 7, 5.2, 4.5, 1, '#f4e27a', '#a89a3a', 0.5); return;
      case 'red': limb('#4a3a1a', 4.2); limb('#7a5a32', 2.6); string('#e8dcc0');   // 덩굴 감은 장궁
        ctx.strokeStyle = '#4a8a3a'; ctx.lineWidth = 0.9; ctx.beginPath(); for (let i = 0; i <= 16; i++) { const tt = i / 16, x = -17 + 34 * tt, yy = -2 + 24 * tt * (1 - tt) * 2 * 0.5 * 2 * 0.5 + Math.sin(i * 1.6) * 1.2; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
        for (const x of [-12, -4, 6, 13]) { const tt = (x + 17) / 34; ell(ctx, x, -2 + 24 * tt * (1 - tt) + 1.5, 1.6, 1, '#6aba4a', '#2e5a1e', 0.3); } return;
      case 'desert': limb('#5a3a2a', 4); limb('#c8a878', 2.4); string('#f0ead8'); for (const s of [-1, 1]) { ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s * 17, -2); ctx.quadraticCurveTo(s * 21, -3, s * 21, -7); ctx.stroke(); }
        rr(ctx, -3, 6.5, 6, 5.5, 1.5, '#b0503a', '#6a2a1a', 0.5); line(ctx, [[0, 12], [-1, 17]], '#b0503a', 1.2); return;   // 천 감은 반곡궁
      case 'pharaoh': limb('#a8862a', 4); limb('#ffe680', 2.4); string('#fff4c0'); glowOn(ctx, '#fff0a0', 7); ell(ctx, 0, 9, 3.6, 3.6, '#ffd040', '#a8862a', 0.6); glowOff(ctx);
        for (let i = 0; i < 8; i++) { const a = i * PI / 4; line(ctx, [[Math.cos(a) * 4.4, 9 + Math.sin(a) * 4.4], [Math.cos(a) * 6, 9 + Math.sin(a) * 6]], '#ffd040', 0.9); } for (const s of [-1, 1]) ell(ctx, s * 17, -2, 1.6, 1.6, '#2a50b0'); return;
      case 'storm': limb('#2a3450', 4.2); limb('#6a7aaa', 2.6); glowOn(ctx, '#fff09a', 8); ctx.strokeStyle = '#ffe060'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-17, -2); for (let i = 1; i < 8; i++) ctx.lineTo(-17 + i * 34 / 8, -2 + (i % 2 ? 1.2 : -1.2)); ctx.lineTo(17, -2); ctx.stroke();   // 번개 시위
        for (const s of [-1, 1]) poly(ctx, [[s * 17, -2], [s * 20, -7], [s * 18.5, -4], [s * 21, -9]], '#ffe060'); glowOff(ctx); return;
      case 'sky': limb('#b8c8e8', 3.6); limb('#ffffff', 2.2); string('#e8f0ff');   // 큰 깃털 날개 활
        for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(s * (16 - i * 3.4), 0 + i * 3.4); ctx.rotate(s * (0.9 - i * 0.15)); ell(ctx, 0, -4, 2, 5 - i * 0.6, i % 2 ? '#e8f0ff' : '#ffffff', '#b8c8e8', 0.4); ctx.restore(); }
        glowOn(ctx, '#e8f0ff', 6); ell(ctx, 0, 8.5, 2.2, 2.2, '#ffffff'); glowOff(ctx); return;
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
    if (type === 'sword' || type === 'dagger') { ctx.rotate(type === 'dagger' ? -1.8 : -1.9); swordNew(ctx, st === 'steel' || st === 'shadow' ? (type === 'dagger' ? 'shadow' : 'steel') : st, type === 'dagger', color); }
    else if (type === 'wand') { ctx.rotate(-1.4); wandNew(ctx, st, color); }
    else bowNew(ctx, st, color);
    glowOff(ctx); ctx.restore();
  }
