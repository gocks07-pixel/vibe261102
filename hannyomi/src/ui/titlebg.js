'use strict';
// 2.0: 타이틀 화면 배경 — 밤하늘 별 · 일곱 영웅 별자리 · 녹스의 등불 · 떨어지는 별조각 · 새싹항 등대와 바다 · 별을 올려다보는 연희
//  G.TitleBG.start(canvas): 캔버스가 화면에서 사라지면 저절로 멈춘다. 움직임 줄이기 설정이면 멈춘 그림 한 장
G.TitleBG = (function () {
  const W = 1280, H = 720, SEA = 520, PI = Math.PI;
  let raf = 0, cv = null, fall = null, nextFall = 1.5, last = 0;
  const seed = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
  const STARS = Array.from({ length: 170 }, () => ({ x: seed() * W, y: seed() * SEA * 0.92, r: 0.6 + seed() * 1.6, p: seed() * 6, s: 0.6 + seed() * 1.8 }));
  const CON = [[120, 120], [190, 92], [262, 118], [318, 86], [386, 112], [352, 172], [270, 190]];   // 일곱 영웅 별자리
  const rnd = Math.random;
  function glow(c, x, y, r, col, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = 1;
  }
  function star4(c, x, y, r, col) {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = -PI / 2 + i * PI / 4, rr = i % 2 ? r * 0.3 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }
  function draw(c, t, dt, still) {
    const sky = c.createLinearGradient(0, 0, 0, SEA); sky.addColorStop(0, '#070a1e'); sky.addColorStop(0.55, '#151a44'); sky.addColorStop(1, '#3a2f62');
    c.fillStyle = sky; c.fillRect(0, 0, W, SEA);
    glow(c, W * 0.5, SEA, 520, 'rgba(255,170,200,.35)', 0.5);
    for (const s of STARS) { c.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p)); c.fillStyle = '#eef2ff'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    // 일곱 영웅 별자리
    c.strokeStyle = 'rgba(190,215,255,.35)'; c.lineWidth = 1.4; c.setLineDash([4, 6]); c.beginPath();
    CON.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]);
    CON.forEach(([x, y], i) => { const k = 0.8 + 0.2 * Math.sin(t * 1.4 + i); glow(c, x, y, 16, 'rgba(200,225,255,.9)', 0.45 * k); star4(c, x, y, 6 * k, '#f4f8ff'); });
    // 녹스의 등불 (먼 하늘)
    const lx = 1060, ly = 150 + Math.sin(t * 0.8) * 5, fl = 0.85 + 0.15 * Math.sin(t * 3.1);
    glow(c, lx, ly, 90, 'rgba(255,200,110,.75)', 0.45 * fl);
    c.fillStyle = '#2a1a3a'; c.fillRect(lx - 1, ly - 22, 2, 9);
    c.fillStyle = 'rgba(255,214,140,.92)'; c.beginPath(); c.ellipse(lx, ly, 8, 11, 0, 0, 7); c.fill();
    c.strokeStyle = '#5a3a2a'; c.lineWidth = 1.5; c.stroke();
    // 떨어지는 별조각
    if (!still) {
      nextFall -= dt;
      if (!fall && nextFall <= 0) fall = { x: 520 + rnd() * 600, y: 30, k: 0 };
      if (fall) {
        fall.k += dt; const x = fall.x - fall.k * 340, y = fall.y + fall.k * 190, a = Math.max(0, 1 - fall.k / 1.3);
        const tr = c.createLinearGradient(x, y, x + 120, y - 67); tr.addColorStop(0, `rgba(255,240,190,${a})`); tr.addColorStop(1, 'rgba(255,240,190,0)');
        c.strokeStyle = tr; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 120, y - 67); c.stroke();
        glow(c, x, y, 18, 'rgba(255,240,190,1)', a * 0.8); star4(c, x, y, 5, `rgba(255,250,220,${a})`);
        if (fall.k > 1.3) { fall = null; nextFall = 4 + rnd() * 4; }
      }
    }
    // 바다
    const sea = c.createLinearGradient(0, SEA, 0, H); sea.addColorStop(0, '#1e2f62'); sea.addColorStop(1, '#0a1230');
    c.fillStyle = sea; c.fillRect(0, SEA, W, H - SEA);
    for (let i = 0; i < 26; i++) {
      const y = SEA + 10 + (i % 7) * 20 + (i % 3) * 3, x = (i * 173 + t * 14 * (1 + i % 3)) % (W + 120) - 60;
      c.strokeStyle = `rgba(190,215,255,${0.12 + (i % 4) * 0.05})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + (i % 5) * 8, y); c.stroke();
    }
    c.globalAlpha = 0.3; c.fillStyle = '#ffd6a0'; for (let i = 0; i < 6; i++) c.fillRect(lx - 14 + Math.sin(t * 2 + i) * 6, SEA + 14 + i * 14, 28 - i * 3, 2); c.globalAlpha = 1;
    // 새싹항 곶과 등대
    c.fillStyle = '#141a33'; c.beginPath(); c.moveTo(0, SEA - 30); c.quadraticCurveTo(120, SEA - 62, 250, SEA - 10); c.lineTo(290, SEA + 40); c.lineTo(0, SEA + 60); c.closePath(); c.fill();
    const hx = 130, hy = SEA - 50, beam = Math.sin(t * 0.9);
    { const bx = hx, by = hy - 131, dx = 560 * beam, a = 0.1 + 0.16 * Math.abs(beam);
      const bg = c.createLinearGradient(bx, by, bx + dx, by - 40); bg.addColorStop(0, `rgba(255,242,190,${a * 2})`); bg.addColorStop(1, 'rgba(255,242,190,0)');
      c.fillStyle = bg; c.beginPath(); c.moveTo(bx, by - 3); c.lineTo(bx + dx, by - 70); c.lineTo(bx + dx, by + 10); c.lineTo(bx, by + 3); c.closePath(); c.fill(); }
    c.fillStyle = '#e8e0d0'; c.beginPath(); c.moveTo(hx - 22, hy); c.lineTo(hx + 22, hy); c.lineTo(hx + 13, hy - 120); c.lineTo(hx - 13, hy - 120); c.closePath(); c.fill();
    c.fillStyle = '#c0503f'; for (const k of [30, 74]) { c.beginPath(); c.moveTo(hx - 20 + k / 120 * 9, hy - k); c.lineTo(hx + 20 - k / 120 * 9, hy - k); c.lineTo(hx + 19 - (k + 16) / 120 * 9, hy - k - 16); c.lineTo(hx - 19 + (k + 16) / 120 * 9, hy - k - 16); c.closePath(); c.fill(); }
    c.fillStyle = '#2a2a3a'; c.fillRect(hx - 15, hy - 140, 30, 20);
    glow(c, hx, hy - 130, 40, 'rgba(255,236,160,1)', 0.7); c.fillStyle = '#fff4c0'; c.fillRect(hx - 9, hy - 138, 18, 14);
    c.fillStyle = '#5a3a2a'; c.beginPath(); c.moveTo(hx - 18, hy - 140); c.lineTo(hx + 18, hy - 140); c.lineTo(hx, hy - 160); c.closePath(); c.fill();
    // 모래사장 + 연희
    const sand = c.createLinearGradient(0, 640, 0, H); sand.addColorStop(0, '#c9b089'); sand.addColorStop(1, '#a88e6a');
    c.fillStyle = sand; c.beginPath(); c.moveTo(780, H); c.quadraticCurveTo(900, 628, 1280, 636); c.lineTo(1280, H); c.closePath(); c.fill();
    for (const [x, y] of [[990, 690], [1160, 676], [1220, 702]]) { c.fillStyle = '#f4d8e4'; c.beginPath(); c.ellipse(x, y, 5, 3, 0.4, 0, 7); c.fill(); }
    const look = Object.assign({ skin: '#ffe0c2' }, G.NPCS.yeonhee_rag.look);
    G.Draw.humanoid(c, { x: 1080, y: 676, dir: 1, t, moving: false, air: false, atk: -1, look, scale: 2.1, weapon: null });
    glow(c, 1150, 470, 26, 'rgba(255,240,200,.9)', 0.5 + 0.2 * Math.sin(t * 2)); star4(c, 1150, 470, 8, '#fffbe6');
  }
  function start(canvas) {
    stop(); cv = canvas; if (!cv) return;
    const c = cv.getContext('2d'), still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    last = performance.now();
    const loop = now => {
      if (!cv || !cv.isConnected) { stop(); return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      try { draw(c, now / 1000, dt, still); } catch (e) { console.error(e); stop(); return; }
      if (!still) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; cv = null; }
  return { start, stop, draw };
})();
