window.SageNPC = (function () {
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const V = {
    ga: { robe: ['#2a3a6a', '#1a2448'], trim: '#e8c86a', hood: true, beard: '#f4f4f0', staff: '#7a5a3a', top: 'star', name: '가 별빛 현자' },
    na: { robe: ['#5a6a52', '#3a4636'], trim: '#c8b890', hood: true, beard: '#ececec', staff: '#5a4030', top: 'lantern', braid: true, name: '나 바람의 은자' },
    da: { robe: ['#e8e4dc', '#b8b0a4'], trim: '#8a2a3a', hood: false, beard: '#fafaf6', staff: '#4a3424', top: 'fork', name: '다 갈림길의 수호자' },
  };
  function draw(c, x, y, s, v, t) {
    const o = V[v]; c.save(); c.translate(x, y); c.scale(s, s);
    // 뒤: 망토
    c.fillStyle = o.robe[1]; c.beginPath(); c.moveTo(-17, -40); c.quadraticCurveTo(-26, -15, -22, 0); c.lineTo(22, 0); c.quadraticCurveTo(26, -15, 17, -40); c.closePath(); c.fill();
    if (o.hood) { c.fillStyle = o.robe[0]; c.beginPath(); c.ellipse(0, -56, 27, 28, 0, 0, Math.PI * 2); c.fill(); }
    // 몸 (게임 그림)
    G.Draw.humanoid(c, { x: 0, y: 0, dir: 1, t: 0, atk: -1, look: { skin: '#e8c4a4', hair: o.beard, style: o.hood ? 'bald' : 'long', beard: true, top: o.robe[0], bottom: o.robe[1], eye: 'intellectual', gender: 'm' } });
    // 긴 옷자락 (다리 덮음)
    const g = c.createLinearGradient(0, -36, 0, 0); g.addColorStop(0, o.robe[0]); g.addColorStop(1, o.robe[1]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-12, -36); c.lineTo(12, -36); c.lineTo(17, -1); c.quadraticCurveTo(0, 2, -17, -1); c.closePath(); c.fill();
    c.strokeStyle = o.trim; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-17, -1.5); c.quadraticCurveTo(0, 1.5, 17, -1.5); c.stroke();
    c.beginPath(); c.moveTo(0, -34); c.lineTo(0, -2); c.stroke();
    if (v === 'ga') for (const [sx, sy] of [[-9, -12], [8, -20], [-5, -26], [11, -7]]) { c.fillStyle = o.trim; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.7 : 1.7; c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } c.fill(); }
    if (v === 'da') { c.fillStyle = o.trim; c.fillRect(-12, -24, 24, 3.5); c.beginPath(); c.moveTo(4, -21); c.lineTo(8, -8); c.lineTo(5, -8); c.lineTo(2, -21); c.fill(); }
    // 긴 수염 (가슴까지)
    const bg = c.createLinearGradient(0, -38, 0, o.braid ? -6 : -12); bg.addColorStop(0, o.beard); bg.addColorStop(1, '#c8c8c4');
    c.fillStyle = bg; c.beginPath(); c.moveTo(-13, -40); c.quadraticCurveTo(-12, -24, -4, o.braid ? -16 : -12); c.lineTo(0, o.braid ? -6 : -9); c.lineTo(4, o.braid ? -16 : -12); c.quadraticCurveTo(12, -24, 13, -40); c.quadraticCurveTo(0, -33, -13, -40); c.fill();
    c.strokeStyle = 'rgba(160,160,160,.6)'; c.lineWidth = 0.4; for (const dx of [-6, -2, 2, 6]) { c.beginPath(); c.moveTo(dx, -36); c.quadraticCurveTo(dx * 0.6, -24, dx * 0.2, -14); c.stroke(); }
    if (o.braid) { c.fillStyle = o.trim; c.fillRect(-1.6, -15, 3.2, 2); }
    // 콧수염 · 짙은 눈썹
    c.fillStyle = o.beard; c.beginPath(); c.ellipse(-4, -38.5, 5, 1.8, 0.25, 0, 7); c.fill(); c.beginPath(); c.ellipse(4, -38.5, 5, 1.8, -0.25, 0, 7); c.fill();
    // 나이 든 얼굴 (게임 얼굴 위에 덮어 그림): 가늘고 깊은 눈 · 눈 밑 주름 · 처진 흰 눈썹 · 이마 주름 · 볼터치 없음
    const fg = c.createRadialGradient(0, -51, 2, 0, -51, 17); fg.addColorStop(0, '#edc9a9'); fg.addColorStop(0.75, '#e8c4a4'); fg.addColorStop(1, 'rgba(232,196,164,0)');
    c.fillStyle = fg; c.beginPath(); c.ellipse(0, -50.5, 17, 12.5, 0, 0, 7); c.fill();
    for (const sx of [-1, 1]) {
      const ex = sx * 9.2, ey = -50;
      c.fillStyle = '#fbf6ee'; c.beginPath(); c.ellipse(ex, ey, 3.9, 1.7, 0, 0, 7); c.fill();
      c.fillStyle = '#3a4a6a'; c.beginPath(); c.arc(ex + sx * 0.3, ey + 0.1, 1.55, 0, 7); c.fill();
      c.fillStyle = '#10141c'; c.beginPath(); c.arc(ex + sx * 0.3, ey + 0.1, 0.7, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 0.5, ey - 0.6, 0.45, 0, 7); c.fill();
      c.fillStyle = '#d8a888'; c.beginPath(); c.moveTo(ex - 4.4, ey - 0.2); c.quadraticCurveTo(ex, ey - 3.6, ex + 4.4, ey - 0.2); c.quadraticCurveTo(ex, ey - 1.6, ex - 4.4, ey - 0.2); c.fill();   // 무거운 눈꺼풀
      c.strokeStyle = '#5a3a2a'; c.lineWidth = 0.75; c.beginPath(); c.moveTo(ex - 4.2, ey - 0.1); c.quadraticCurveTo(ex, ey - 1.9, ex + 4.2, ey + 0.1); c.stroke();
      c.strokeStyle = 'rgba(140,90,70,.45)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(ex - 3, ey + 2.4); c.quadraticCurveTo(ex, ey + 3.4, ex + 3, ey + 2.2); c.stroke();
      for (const k of [0, 1, 2]) { c.beginPath(); c.moveTo(ex + sx * 4.6, ey - 0.6 + k * 1.1); c.lineTo(ex + sx * 6.6, ey - 1.2 + k * 1.8); c.stroke(); }
      c.fillStyle = o.beard; c.beginPath(); c.moveTo(sx * 3, -54.6); c.quadraticCurveTo(sx * 9, -58.6, sx * 16, -52); c.quadraticCurveTo(sx * 10, -55.2, sx * 3, -53.2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(170,170,170,.7)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(sx * 4.5, -54.7); c.quadraticCurveTo(sx * 10, -57.4, sx * 15, -52.6); c.stroke();
    }
    c.strokeStyle = 'rgba(160,110,85,.55)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.2, -49); c.quadraticCurveTo(-1.8, -44.5, 0.4, -44); c.stroke();   // 코
    c.fillStyle = o.beard; c.beginPath(); c.ellipse(-3.6, -41.6, 4.6, 1.7, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(3.6, -41.6, 4.6, 1.7, -0.3, 0, 7); c.fill();   // 콧수염 (얼굴 위로 다시)
    c.strokeStyle = 'rgba(120,80,60,.3)'; c.lineWidth = 0.5; for (const yy of [-61, -63.5]) { c.beginPath(); c.moveTo(-7, yy); c.quadraticCurveTo(0, yy - 1.2, 7, yy); c.stroke(); }
    // 두건 앞 테두리
    if (o.hood) { c.strokeStyle = o.trim; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, -56, 26, 27, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.fillStyle = o.robe[0]; c.beginPath(); c.ellipse(0, -80, 18, 6, 0, Math.PI, 0); c.fill(); }
    // 지팡이 (뒤로 살짝 기울어 손에)
    c.save(); c.translate(16, -18); c.rotate(-0.05);
    c.strokeStyle = o.staff; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 18); c.quadraticCurveTo(1.5, -20, -1, -64); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-0.6, 16); c.quadraticCurveTo(0.8, -20, -1.6, -62); c.stroke();
    if (o.top === 'star') { const fy = -74 + Math.sin(t * 2) * 1.5; glow(c, -1, fy, 16, 'rgba(255,240,180,.9)', 0.8); c.fillStyle = '#fff6d0'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.8 : 4.4; c.lineTo(-1 + Math.cos(a) * r, fy + Math.sin(a) * r); } c.fill(); c.strokeStyle = o.staff; c.lineWidth = 1.4; c.beginPath(); c.arc(-1, -66, 4.5, Math.PI, 0); c.stroke(); }
    if (o.top === 'lantern') { c.strokeStyle = o.staff; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-1, -64); c.quadraticCurveTo(5, -70, 8, -64); c.stroke(); c.strokeStyle = '#8a7a5a'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(8, -64); c.lineTo(8, -59); c.stroke(); glow(c, 8, -55, 12, 'rgba(255,200,120,.9)', 0.75); c.fillStyle = '#3a3020'; c.fillRect(5.5, -59, 5, 7); c.fillStyle = '#ffd890'; c.fillRect(6.5, -58, 3, 5); }
    if (o.top === 'fork') { c.strokeStyle = o.staff; c.lineWidth = 2; c.beginPath(); c.moveTo(-1, -62); c.quadraticCurveTo(-6, -68, -8, -74); c.moveTo(-1, -62); c.quadraticCurveTo(4, -68, 6, -74); c.stroke(); glow(c, -8, -75, 9, 'rgba(180,220,255,.9)', 0.8); glow(c, 6, -75, 9, 'rgba(255,210,170,.9)', 0.8); c.fillStyle = '#e8f4ff'; c.beginPath(); c.arc(-8, -75, 1.6, 0, 7); c.fill(); c.fillStyle = '#fff0e0'; c.beginPath(); c.arc(6, -75, 1.6, 0, 7); c.fill(); }
    c.restore();
    // 손 (지팡이 잡은 손)
    c.fillStyle = '#e8c4a4'; c.beginPath(); c.arc(16, -18, 2.6, 0, 7); c.fill();
    c.restore();
  }
  return { draw, V };
})();
