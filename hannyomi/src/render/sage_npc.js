'use strict';
// 빌드 14: 갈림길의 현자 오르웬 그림 (사용자 결정 2026-11-19: 별빛 현자 · 뾰족 두건 · 수정구 속 별, 회색 수염 선 없앰)
//  시안 docs/drafts/design/jobreset/sage_ga2.png · 게임 사람 그림(G.Draw.humanoid) 위에 두건 · 망토 · 나이 든 얼굴 · 지팡이를 덧그림
//  G.NPCS[id].art = 'sage' 인 NPC 를 world.js (마을) · dialog.js (대화 초상) 가 이걸로 그림. PC · EXE 와 같이 쓰는 파일
G.NPCArt = G.NPCArt || {};
G.NPCArt.sage = (function () {
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const ROBE = ['#2e3f74', '#1c264c', '#121a36'], TRIM = '#e2c272', BEARD = '#f4f3ee', SKIN = '#e8c4a4', IN = '#0b1026';
  // 두건 바깥 모양 (머리 위로 뾰족하게 · 끝이 살짝 뒤로 처짐 → 어깨로 흘러내림)
  function hoodOuter(c) { c.moveTo(-19.5, -35); c.bezierCurveTo(-23, -46, -23, -64, -15, -74); c.bezierCurveTo(-10, -80, -5, -84, 2, -88); c.bezierCurveTo(4, -86, 6, -83, 9, -79); c.bezierCurveTo(19, -71, 24, -60, 23, -47); c.lineTo(19.5, -35); }
  // 얼굴 구멍 (이마 위쪽까지 덮고 아래는 수염이 나오게 열림)
  function hoodHole(c) { c.lineTo(13, -35); c.bezierCurveTo(16, -40, 17.5, -50, 16, -57); c.bezierCurveTo(14, -64, 7, -67.5, 0, -67.5); c.bezierCurveTo(-7, -67.5, -14, -64, -16, -57); c.bezierCurveTo(-17.5, -50, -16, -40, -13, -35); c.closePath(); }
  function holePath(c) { c.beginPath(); c.moveTo(13, -30); c.bezierCurveTo(16, -40, 17.5, -50, 16, -57); c.bezierCurveTo(14, -64, 7, -67.5, 0, -67.5); c.bezierCurveTo(-7, -67.5, -14, -64, -16, -57); c.bezierCurveTo(-17.5, -50, -16, -40, -13, -30); c.closePath(); }
  function star4(c, x, y, r, a) { c.save(); c.globalAlpha = a; c.beginPath(); for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; c.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } c.closePath(); c.fill(); c.restore(); }

  // dir: 보는 쪽 (1 오른쪽 · -1 왼쪽, 지팡이는 앞쪽 손) · t: 시간 (수정구 별 반짝임)
  function draw(c, x, y, s, dir, t) {
    c.save(); c.translate(x, y); c.scale(s * (dir < 0 ? -1 : 1), s);
    // 땅 그림자
    c.fillStyle = 'rgba(20,30,20,.25)'; c.beginPath(); c.ellipse(2, 0, 24, 3.5, 0, 0, 7); c.fill();
    // 뒤: 등 망토 (옷자락)
    let g = c.createLinearGradient(-24, 0, 24, 0); g.addColorStop(0, ROBE[1]); g.addColorStop(1, ROBE[2]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-16, -40); c.bezierCurveTo(-17, -24, -20, -10, -21, 0); c.lineTo(21, 0); c.bezierCurveTo(20, -10, 17, -24, 16, -40); c.closePath(); c.fill();
    // 뒤: 두건 안쪽 (얼굴 둘레의 그늘)
    c.fillStyle = IN; c.beginPath(); hoodOuter(c); c.closePath(); c.fill();
    // 몸 (게임 그림)
    G.Draw.humanoid(c, { x: 0, y: 0, dir: 1, t: 0, atk: -1, look: { skin: SKIN, hair: BEARD, style: 'bald', beard: false, top: ROBE[0], bottom: ROBE[1], eye: 'intellectual', gender: 'm' } });
    // 긴 옷 (다리 덮음) · 빛은 왼쪽 위에서
    g = c.createLinearGradient(-17, 0, 17, 0); g.addColorStop(0, '#3a4c86'); g.addColorStop(0.45, ROBE[0]); g.addColorStop(1, ROBE[2]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-13, -38); c.lineTo(13, -38); c.bezierCurveTo(11, -28, 13, -14, 19, -1); c.quadraticCurveTo(9, 1.5, 0, 0.5); c.quadraticCurveTo(-9, 1.5, -19, -1); c.bezierCurveTo(-13, -14, -11, -28, -13, -38); c.closePath(); c.fill();
    // 옷 주름 (어두운 골 + 밝은 등)
    for (const [x0, x1, d] of [[-6, -10, 1], [5, 9, 1], [-1, -2, 0], [10, 14, 0]]) { c.strokeStyle = 'rgba(6,10,26,.45)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x0, -30); c.bezierCurveTo(x0 - 1, -18, x1 + 1, -10, x1, 0); c.stroke(); if (d) { c.strokeStyle = 'rgba(140,160,220,.18)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x0 + 1.4, -29); c.bezierCurveTo(x0 + 0.6, -18, x1 + 2.6, -10, x1 + 1.8, -0.5); c.stroke(); } }
    // 밑단 금실 · 가운데 여밈
    c.strokeStyle = TRIM; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-18, -1.4); c.quadraticCurveTo(-9, 0.9, 0, -0.1); c.quadraticCurveTo(9, 0.9, 18, -1.4); c.stroke();
    c.strokeStyle = 'rgba(226,194,114,.75)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-17.6, -3.2); c.quadraticCurveTo(-9, -1, 0, -2); c.quadraticCurveTo(9, -1, 17.6, -3.2); c.stroke();
    // 수놓은 별 (작게, 실처럼)
    c.fillStyle = 'rgba(226,194,114,.8)'; for (const [sx, sy, r] of [[-10, -8, 1.3], [8, -14, 1.1], [-5, -19, 0.9], [12, -5, 1.0], [-13, -3, 0.8]]) star4(c, sx, sy, r * 1.6, 0.85);
    // 소매 (왼쪽: 늘어뜨림)
    g = c.createLinearGradient(-22, 0, -12, 0); g.addColorStop(0, '#34477e'); g.addColorStop(1, ROBE[1]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-13, -36); c.bezierCurveTo(-18, -32, -21, -22, -22, -14); c.quadraticCurveTo(-17, -12, -12, -15); c.bezierCurveTo(-12, -22, -12, -30, -11, -34); c.closePath(); c.fill();
    c.strokeStyle = TRIM; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-22, -14); c.quadraticCurveTo(-17, -12, -12, -15); c.stroke();
    c.fillStyle = '#d8b090'; c.beginPath(); c.ellipse(-17, -12.6, 2.6, 2, 0.2, 0, 7); c.fill();
    // 어깨 망토 (두건에서 이어짐)
    g = c.createLinearGradient(-22, -40, 22, -24); g.addColorStop(0, '#3a4d88'); g.addColorStop(0.5, ROBE[0]); g.addColorStop(1, ROBE[1]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-17, -40); c.bezierCurveTo(-22, -37, -23.5, -30, -21.5, -24); c.quadraticCurveTo(-14, -25, -8, -22); c.quadraticCurveTo(0, -26, 8, -22); c.quadraticCurveTo(14, -25, 21.5, -24); c.bezierCurveTo(23.5, -30, 22, -37, 17, -40); c.closePath(); c.fill();
    c.strokeStyle = TRIM; c.lineWidth = 1; c.beginPath(); c.moveTo(-21.5, -24); c.quadraticCurveTo(-14, -25, -8, -22); c.quadraticCurveTo(0, -26, 8, -22); c.quadraticCurveTo(14, -25, 21.5, -24); c.stroke();
    c.strokeStyle = 'rgba(6,10,26,.4)'; c.lineWidth = 0.8; for (const dx of [-15, 15]) { c.beginPath(); c.moveTo(dx * 0.85, -35); c.quadraticCurveTo(dx, -29, dx * 0.95, -24); c.stroke(); }
    // 수염 (가슴까지, 결이 있는 흰 수염)
    g = c.createLinearGradient(0, -40, 0, -10); g.addColorStop(0, BEARD); g.addColorStop(0.7, '#e2e1dc'); g.addColorStop(1, '#bdbcb6');
    c.fillStyle = g; c.beginPath(); c.moveTo(-13, -41); c.bezierCurveTo(-13.5, -30, -9, -20, -3, -14); c.quadraticCurveTo(-1, -10.5, 0.5, -8.5); c.quadraticCurveTo(1.5, -11, 3.5, -13.5); c.bezierCurveTo(9, -20, 13.5, -30, 13, -41); c.quadraticCurveTo(0, -42, -13, -41); c.fill();
    for (let i = 0; i < 11; i++) { const dx = -10 + i * 2, sh = i % 3 === 0; c.strokeStyle = sh ? 'rgba(255,255,255,.7)' : 'rgba(140,140,140,.45)'; c.lineWidth = sh ? 0.5 : 0.4; c.beginPath(); c.moveTo(dx, -38); c.bezierCurveTo(dx * 0.95 + 0.6, -30, dx * 0.55 - 0.5, -22, dx * 0.15 + 0.4, -12); c.stroke(); }
    // 나이 든 얼굴 (게임 얼굴 위에)
    const fg = c.createRadialGradient(-2, -52, 2, 0, -51, 17); fg.addColorStop(0, '#efcdae'); fg.addColorStop(0.7, SKIN); fg.addColorStop(1, 'rgba(232,196,164,0)');
    c.fillStyle = fg; c.beginPath(); c.ellipse(0, -50.5, 17, 13, 0, 0, 7); c.fill();
    for (const sx of [-1, 1]) {
      const ex = sx * 9.2, ey = -50;
      c.fillStyle = '#fbf6ee'; c.beginPath(); c.ellipse(ex, ey, 3.9, 1.7, 0, 0, 7); c.fill();
      c.fillStyle = '#3a4a6a'; c.beginPath(); c.arc(ex + sx * 0.3, ey + 0.1, 1.55, 0, 7); c.fill();
      c.fillStyle = '#10141c'; c.beginPath(); c.arc(ex + sx * 0.3, ey + 0.1, 0.7, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 0.5, ey - 0.6, 0.45, 0, 7); c.fill();
      c.fillStyle = '#d8a888'; c.beginPath(); c.moveTo(ex - 4.4, ey - 0.2); c.quadraticCurveTo(ex, ey - 3.6, ex + 4.4, ey - 0.2); c.quadraticCurveTo(ex, ey - 1.6, ex - 4.4, ey - 0.2); c.fill();
      c.strokeStyle = '#5a3a2a'; c.lineWidth = 0.75; c.beginPath(); c.moveTo(ex - 4.2, ey - 0.1); c.quadraticCurveTo(ex, ey - 1.9, ex + 4.2, ey + 0.1); c.stroke();
      c.strokeStyle = 'rgba(140,90,70,.45)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(ex - 3, ey + 2.4); c.quadraticCurveTo(ex, ey + 3.4, ex + 3, ey + 2.2); c.stroke();
      for (const k of [0, 1, 2]) { c.beginPath(); c.moveTo(ex + sx * 4.6, ey - 0.6 + k * 1.1); c.lineTo(ex + sx * 6.6, ey - 1.2 + k * 1.8); c.stroke(); }
      c.fillStyle = BEARD; c.beginPath(); c.moveTo(sx * 3, -54.6); c.quadraticCurveTo(sx * 9, -58.6, sx * 15.5, -52.5); c.quadraticCurveTo(sx * 10, -55.2, sx * 3, -53.2); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(160,110,85,.55)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.2, -49); c.quadraticCurveTo(-1.8, -44.5, 0.4, -44); c.stroke();
    c.fillStyle = 'rgba(190,130,100,.25)'; c.beginPath(); c.ellipse(0.6, -45.4, 2.4, 1.1, 0, 0, 7); c.fill();
    c.fillStyle = BEARD; c.beginPath(); c.ellipse(-3.8, -41.8, 4.8, 1.8, 0.32, 0, 7); c.fill(); c.beginPath(); c.ellipse(3.8, -41.8, 4.8, 1.8, -0.32, 0, 7); c.fill();
    c.strokeStyle = 'rgba(120,80,60,.3)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-6, -59.5); c.quadraticCurveTo(0, -60.6, 6, -59.5); c.stroke();
    // 두건이 이마에 드리우는 그늘 (구멍 안쪽만)
    c.save(); holePath(c); c.clip();
    g = c.createLinearGradient(0, -68, 0, -54); g.addColorStop(0, 'rgba(8,12,30,.55)'); g.addColorStop(0.5, 'rgba(8,12,30,.15)'); g.addColorStop(1, 'rgba(8,12,30,0)'); c.fillStyle = g; c.fillRect(-20, -70, 40, 18);
    for (const sx of [-1, 1]) { g = c.createLinearGradient(sx * 17, 0, sx * 11, 0); g.addColorStop(0, 'rgba(8,12,30,.6)'); g.addColorStop(1, 'rgba(8,12,30,0)'); c.fillStyle = g; c.fillRect(sx > 0 ? 11 : -17, -66, 6, 36); }
    c.restore();
    // 두건 앞 (바깥 - 얼굴 구멍), 천의 빛과 그늘
    g = c.createLinearGradient(-24, -80, 24, -36); g.addColorStop(0, '#42559a'); g.addColorStop(0.45, ROBE[0]); g.addColorStop(1, ROBE[2]);
    c.fillStyle = g; c.beginPath(); hoodOuter(c); hoodHole(c); c.fill();
    c.save(); c.beginPath(); hoodOuter(c); hoodHole(c); c.clip();
    // 주름: 정수리에서 어깨로 흐르는 골
    c.lineCap = 'round';
    for (const [p, q, w] of [[[-6, -80], [-20, -50], 1.6], [[4, -82], [19, -52], 1.4], [[-12, -72], [-22, -40], 1.2], [[12, -72], [22, -40], 1.2]]) { c.strokeStyle = 'rgba(6,10,26,.42)'; c.lineWidth = w; c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo((p[0] + q[0]) / 2 + Math.sign(q[0]) * 4, (p[1] + q[1]) / 2, q[0], q[1]); c.stroke(); c.strokeStyle = 'rgba(150,170,230,.16)'; c.lineWidth = w * 0.6; c.beginPath(); c.moveTo(p[0] - 1.6, p[1] + 1); c.quadraticCurveTo((p[0] + q[0]) / 2 + Math.sign(q[0]) * 4 - 1.6, (p[1] + q[1]) / 2, q[0] - 1.6, q[1]); c.stroke(); }
    // 얼굴 둘레 천 두께 (안쪽 테두리 그늘)
    c.strokeStyle = 'rgba(4,6,18,.55)'; c.lineWidth = 2.4; holePath(c); c.stroke();
    c.restore();
    // 금실 테두리 (구멍 가장자리 · 바깥 아래)
    c.strokeStyle = TRIM; c.lineWidth = 1.1; c.beginPath(); c.moveTo(14.6, -35); c.bezierCurveTo(17.6, -40, 19, -50, 17.6, -57.5); c.bezierCurveTo(15.4, -65.5, 7.6, -69.2, 0, -69.2); c.bezierCurveTo(-7.6, -69.2, -15.4, -65.5, -17.6, -57.5); c.bezierCurveTo(-19, -50, -17.6, -40, -14.6, -35); c.stroke();
    c.strokeStyle = 'rgba(255,240,190,.5)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-17.2, -57.6); c.bezierCurveTo(-15, -65, -7.6, -68.6, 0, -68.6); c.stroke();
    // 두건 끝 빛 (꼭대기 왼쪽)
    c.strokeStyle = 'rgba(160,180,240,.25)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-18, -66); c.bezierCurveTo(-13, -76, -6, -82, 1, -86.5); c.stroke();

    // 지팡이: 옹이 있는 나무, 위쪽은 뿌리 같은 손톱 세 갈래가 수정구를 감쌈
    c.save(); c.translate(17, -17); c.rotate(-0.05);
    const wood = c.createLinearGradient(-2, 0, 2, 0); wood.addColorStop(0, '#8a6a46'); wood.addColorStop(0.5, '#6a4a2e'); wood.addColorStop(1, '#3e2a18');
    c.strokeStyle = wood; c.lineCap = 'round'; c.lineWidth = 2.8; c.beginPath(); c.moveTo(0, 17); c.bezierCurveTo(1.6, -8, -1.4, -36, -1, -62); c.stroke();
    c.strokeStyle = 'rgba(255,230,190,.2)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-0.7, 15); c.bezierCurveTo(0.8, -8, -2.1, -36, -1.8, -61); c.stroke();
    c.fillStyle = '#4e3420'; for (const ky of [-10, -38, -52]) { c.beginPath(); c.ellipse(0.3, ky, 1.9, 1.2, 0.3, 0, 7); c.fill(); }
    const oy = -71 + Math.sin(t * 1.6) * 0.6, ox = -1, R = 6.8;
    // 수정구 바깥 빛 (옅게 — 별이 묻히지 않게)
    glow(c, ox, oy, 17, 'rgba(150,180,255,.55)', 0.55);
    // 뒤쪽 손톱
    c.strokeStyle = '#5a3c22'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-1, -62); c.quadraticCurveTo(-1, -70, ox + 1.5, oy - R + 0.5); c.stroke();
    // 유리 속: 깊은 밤하늘
    let og = c.createRadialGradient(ox - 2, oy - 2, 0.5, ox, oy, R); og.addColorStop(0, '#3a4c9a'); og.addColorStop(0.55, '#1a2260'); og.addColorStop(1, '#070a24');
    c.fillStyle = og; c.beginPath(); c.arc(ox, oy, R, 0, 7); c.fill();
    c.save(); c.beginPath(); c.arc(ox, oy, R - 0.3, 0, 7); c.clip();
    // 별구름 (보랏빛 안개)
    glow(c, ox + 2, oy + 1.5, 5, 'rgba(190,120,255,.8)', 0.35); glow(c, ox - 2.5, oy - 1, 4, 'rgba(110,200,255,.8)', 0.3);
    // 작은 별
    c.fillStyle = '#dfe8ff'; for (const [dx, dy, r] of [[-4, 2.5, 0.35], [3.8, -2.6, 0.3], [-1.5, 4.4, 0.3], [4.6, 2.4, 0.35], [-4.6, -1.8, 0.3], [1.2, -4.6, 0.3]]) { c.beginPath(); c.arc(ox + dx, oy + dy, r, 0, 7); c.fill(); }
    // 큰 별 3개 (반짝임 · 번갈아 빛남) — 게임 크기에서도 보이게 크게
    c.globalCompositeOperation = 'lighter';
    [[-1.8, -1.2, 2.6, 0], [2.4, 1.6, 2.0, 2.1], [0.6, -3.4, 1.5, 4.2]].forEach(([dx, dy, r, ph]) => {
      const tw = 0.75 + 0.25 * Math.sin(t * 3 + ph); glow(c, ox + dx, oy + dy, r * 1.9, 'rgba(255,245,200,1)', 0.7 * tw);
      c.fillStyle = '#fffbe8'; star4(c, ox + dx, oy + dy, r * tw, 1); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ox + dx, oy + dy, r * 0.25, 0, 7); c.fill(); });
    c.restore();
    // 유리 테두리 · 반사광
    c.strokeStyle = 'rgba(190,215,255,.75)'; c.lineWidth = 0.6; c.beginPath(); c.arc(ox, oy, R, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 0.9; c.beginPath(); c.arc(ox, oy, R - 1.3, Math.PI * 1.08, Math.PI * 1.42); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(ox - 3.4, oy - 3.6, 0.6, 0, 7); c.fill();
    c.strokeStyle = 'rgba(140,170,255,.35)'; c.lineWidth = 0.6; c.beginPath(); c.arc(ox, oy, R - 0.8, Math.PI * 0.15, Math.PI * 0.6); c.stroke();
    // 앞쪽 손톱 두 갈래
    c.strokeStyle = wood; c.lineWidth = 1.7;
    c.beginPath(); c.moveTo(-1, -62); c.bezierCurveTo(-6, -64, -8.5, -68, ox - R + 0.4, oy - 2.5); c.stroke();
    c.beginPath(); c.moveTo(-1, -62); c.bezierCurveTo(4, -64, 6.5, -68, ox + R - 0.4, oy - 2.5); c.stroke();
    c.fillStyle = '#6a4a2e'; c.beginPath(); c.ellipse(-1, -61.5, 2.4, 1.6, 0, 0, 7); c.fill();
    c.restore();
    // 오른쪽 소매 · 지팡이 잡은 손
    g = c.createLinearGradient(10, 0, 22, 0); g.addColorStop(0, ROBE[0]); g.addColorStop(1, ROBE[2]);
    c.fillStyle = g; c.beginPath(); c.moveTo(12, -36); c.bezierCurveTo(17, -32, 20, -26, 21, -19); c.quadraticCurveTo(17, -16.5, 13, -19); c.bezierCurveTo(13, -25, 12, -30, 11, -34); c.closePath(); c.fill();
    c.strokeStyle = TRIM; c.lineWidth = 0.9; c.beginPath(); c.moveTo(21, -19); c.quadraticCurveTo(17, -16.5, 13, -19); c.stroke();
    c.fillStyle = SKIN; c.beginPath(); c.ellipse(17.2, -17.5, 2.9, 2.3, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(150,100,80,.5)'; c.lineWidth = 0.4; for (const yy of [-18.4, -17.2, -16]) { c.beginPath(); c.moveTo(15, yy); c.lineTo(19, yy); c.stroke(); }
    c.restore();
  }
  return draw;
})();
