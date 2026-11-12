  // ---------- 남자 눈 5종 (사용자 설계 데이터 반영): 눈 하나 기준 좌표(가로 ±9~10), 바깥쪽 = +x ----------
  // 고친 점: 왼쪽 눈은 좌우를 뒤집어 그림 · 우리 얼굴에 맞게 눈을 키움(세로 ×1.25) · 입 · 볼 홍조 추가 · 눈꺼풀은 회색 띠 대신 피부색 + 부드러운 그림자
  // brow: ['poly', 점들] | ['quad', 시작, 조절, 끝, 굵기] | ['line', 시작, 끝, 굵기]
  const M5 = {
    sharp_clear:    { brow: ['poly', [[-9, -13], [9, -17], [10, -12.5], [-9, -9.6]]], rx: 9, ry: 6.2, tilt: -0.12, irx: 5.8, iry: 5.4, pu: 2.4, hl: [[-2, -2.2, 1.3]], lid: 0,
                      line: [[-9.2, -3], [-3, -7.6], [3, -7.6], [9.6, -4]], lw: 2.4, mouth: 'line', blush: 0 },
    soft_gentle:    { brow: ['quad', [-9, -12], [0, -16.5], [9, -12], 2.0], rx: 9, ry: 7.4, tilt: 0.08, irx: 6.4, iry: 6.6, pu: 3.0, hl: [[-2.2, -2.6, 1.7], [2.4, 2.4, 0.9]], lid: 0,
                      line: [[-9.2, -3.6], [-4, -8.4], [4, -8.4], [9.2, -3.2]], lw: 2.0, mouth: 'smile', blush: 0.25 },
    intellectual:   { brow: ['line', [-9, -12.6], [9.6, -13.2], 1.6], rx: 10, ry: 5.6, tilt: 0, irx: 5.4, iry: 5.0, pu: 2.1, hl: [[-1.6, -1.6, 1.1]], lid: 0.06,
                      line: [[-10, -2.4], [-3, -5.4], [3, -5.4], [10, -2.4]], lw: 1.7, mouth: 'neat', blush: 0 },
    intense_strong: { brow: ['poly', [[-9, -9], [9, -15.5], [9.6, -11.8], [-9, -5.8]]], rx: 8.6, ry: 5.6, tilt: -0.06, irx: 5.0, iry: 4.8, pu: 2.0, hl: [[-2, -1.2, 0.8]], lid: 0.22,
                      line: [[-8.8, -2.6], [-3, -5.2], [3, -5.2], [8.8, -2.6]], lw: 2.7, mouth: 'firm', blush: 0 },
    cold_rational:  { brow: ['line', [-9, -10.6], [9.6, -11.6], 2.2], rx: 10, ry: 5.0, tilt: -0.04, irx: 5.2, iry: 4.4, pu: 1.7, hl: [[-1, -0.6, 0.75]], lid: 0.36,
                      line: [[-10, -1.6], [-3, -2.8], [3, -2.8], [10, -2.2]], lw: 2.2, mouth: 'flat', blush: 0 },
  };
  function m5eye(ctx, S, ec, skin, browC) {
    // 1 눈썹
    ctx.fillStyle = browC; ctx.strokeStyle = browC; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    const B = S.brow;
    if (B[0] === 'poly') { B[1].forEach((q, i) => i ? ctx.lineTo(...q) : ctx.moveTo(...q)); ctx.closePath(); ctx.fill(); }
    else if (B[0] === 'quad') { ctx.moveTo(...B[1]); ctx.quadraticCurveTo(...B[2], ...B[3]); ctx.lineWidth = B[4]; ctx.stroke(); }
    else { ctx.moveTo(...B[1]); ctx.lineTo(...B[2]); ctx.lineWidth = B[3]; ctx.stroke(); }
    ctx.save(); ctx.rotate(S.tilt);
    // 2 흰자 (안쪽만 그리도록 자름)
    ctx.beginPath(); ctx.ellipse(0, 0, S.rx, S.ry, 0, 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.clip();
    // 3 눈동자: 고른 눈 색으로 위는 진하게 · 아래는 밝게 (설계의 위 · 아래 색 구성)
    ctx.beginPath(); ctx.ellipse(0, 0.4, S.irx, S.iry, 0, 0, PI * 2); ctx.fillStyle = grad(ctx, 0, -S.iry, 0, S.iry, [[0, sh(ec, -0.6)], [0.55, ec], [1, sh(ec, 0.35)]]); ctx.fill();
    // 4 동공
    ctx.beginPath(); ctx.arc(0, 0.4, S.pu, 0, PI * 2); ctx.fillStyle = sh(ec, -0.8); ctx.fill();
    // 5 눈꺼풀: 피부색으로 위쪽을 덮고, 그 아래에 부드러운 그림자
    const lidY = -S.ry + S.lid * S.ry * 2;
    if (S.lid > 0.1) { ctx.beginPath(); ctx.moveTo(-S.rx - 1, -S.ry - 2); ctx.lineTo(S.rx + 1, -S.ry - 2); ctx.lineTo(S.rx + 1, lidY); ctx.quadraticCurveTo(0, lidY - 1.6, -S.rx - 1, lidY); ctx.closePath(); ctx.fillStyle = sh(skin, -0.05); ctx.fill(); }
    const top = S.lid > 0.1 ? lidY : -S.ry; ctx.fillStyle = grad(ctx, 0, top, 0, top + 3.2, [[0, 'rgba(50,30,30,0.3)'], [1, 'rgba(50,30,30,0)']]); ctx.fillRect(-S.rx - 1, top, S.rx * 2 + 2, 3.4);
    // 6 반짝임
    ctx.fillStyle = '#fff'; for (const [x, y, r] of S.hl) { ctx.beginPath(); ctx.arc(x, y + 0.4, r, 0, PI * 2); ctx.fill(); }
    ctx.restore();
    // 7 윗눈꺼풀 선 (눈꺼풀이 덮으면 그 선을 따라)
    ctx.beginPath(); const Ln = S.line;
    if (S.lid > 0.1) { ctx.moveTo(-S.rx, lidY + 0.6); ctx.quadraticCurveTo(0, lidY - 1.8, S.rx, lidY + 0.4); }
    else { ctx.moveTo(...Ln[0]); ctx.bezierCurveTo(...Ln[1], ...Ln[2], ...Ln[3]); }
    ctx.strokeStyle = '#1e1b18'; ctx.lineWidth = S.lw; ctx.stroke();
    ctx.restore();
  }
  function faceM5(ctx, p, L) {
    const { hr, hy } = p, ey = hy + hr * p.eyeY, ew = hr * p.eyeW, eh = hr * p.eyeH, S = M5[L.eye], ec = L.eyeColor || '#3a5ac0';
    const u = ew * 1.15 / 9, browC = sh(L.hair, -0.45);
    for (const [ex, out] of [[-hr * 0.34, -1], [hr * 0.46, 1]]) { ctx.save(); ctx.translate(ex, ey); ctx.scale(out * u, u * 1.25); m5eye(ctx, S, ec, L.skin, browC); ctx.restore(); }   // 왼쪽 눈은 좌우 뒤집기
    if (S.blush) for (const bx of [-hr * 0.55, hr * 0.7]) { ctx.beginPath(); ctx.ellipse(bx, ey + eh * 0.75, ew * 0.9, eh * 0.22, 0, 0, PI * 2); ctx.fillStyle = `rgba(244,63,94,${S.blush})`; ctx.fill(); }
    const mx = hr * 0.1, my = ey + eh * 1.0; ctx.strokeStyle = '#9a4a52'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath();
    if (S.mouth === 'smile') { ctx.moveTo(mx - hr * 0.09, my - eh * 0.03); ctx.quadraticCurveTo(mx, my + eh * 0.2, mx + hr * 0.1, my - eh * 0.03); }
    else if (S.mouth === 'firm') { ctx.moveTo(mx - hr * 0.08, my + eh * 0.1); ctx.quadraticCurveTo(mx, my + eh * 0.0, mx + hr * 0.09, my + eh * 0.1); }
    else if (S.mouth === 'neat') { ctx.moveTo(mx - hr * 0.06, my + eh * 0.04); ctx.quadraticCurveTo(mx, my + eh * 0.09, mx + hr * 0.07, my + eh * 0.04); }
    else { const half = S.mouth === 'line' ? 0.08 : 0.06; ctx.moveTo(mx - hr * half, my + eh * 0.05); ctx.lineTo(mx + hr * (half + 0.01), my + eh * 0.05); }
    ctx.stroke();
  }
