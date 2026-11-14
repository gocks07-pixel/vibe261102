// 화염군주 새 시안: 화염 기둥 · 대화재 · 유성 낙하 · 화염 폭발 · 화염 고리 · 불꽃 폭풍 (진한 주황, 색을 직접 칠함)
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const M = G.SageMock = G.SageMock || {};
  const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  const rad = (c, x, y, r, st) => { const g = c.createRadialGradient(x, y, 0, x, y, r); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  // 불꽃 혀 (밑동 x,y · 높이 h · 폭 w): 진홍 → 주황 → 노랑 → 흰 심
  const tongue = (c, x, y, h, w, t, s) => { const sw = (u) => (sin(t * 9 + s + u * 3) * 0.3) * w * u;
    for (const [k, col] of [[1, '#c8280c'], [0.8, '#ff5a10'], [0.58, '#ff9a20'], [0.36, '#ffd860'], [0.17, '#fff6d0']]) { const hh = h * k, ww = w * (0.35 + 0.65 * k); c.beginPath(); c.moveTo(x - ww, y);
      c.bezierCurveTo(x - ww * 1.05, y - hh * 0.4, x - ww * 0.4 + sw(0.6), y - hh * 0.72, x + sw(1), y - hh); c.bezierCurveTo(x + ww * 0.4 + sw(0.6), y - hh * 0.72, x + ww * 1.05, y - hh * 0.4, x + ww, y); c.quadraticCurveTo(x, y + ww * 0.6, x - ww, y); c.fillStyle = col; c.fill(); } };
  const ember = (c, x, y, r, a) => { c.save(); c.globalAlpha *= a; c.fillStyle = '#ff8a20'; c.beginPath(); c.arc(x, y, r * 1.8, 0, PI * 2); c.globalAlpha *= 0.35; c.fill(); c.globalAlpha /= 0.35; c.fillStyle = '#ffe080'; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); c.restore(); };
  const scorch = (c, x, gy, r, a) => { c.save(); c.globalAlpha *= a; c.translate(x, gy - 2); c.scale(1, 0.22); c.fillStyle = rad(c, 0, 0, r, [[0, 'rgba(255,120,30,.9)'], [0.5, 'rgba(200,50,10,.6)'], [1, 'rgba(80,20,10,0)']]); c.beginPath(); c.arc(0, 0, r, 0, PI * 2); c.fill(); c.restore(); };
  // ===== 화염 기둥 (3차): 땅이 붉게 달아오름 → 불기둥 3개가 차례로 솟음 =====
  M.pillar = (c, p, k, gy, T) => { const t = 1.3 + k * 2; for (let i = 0; i < 3; i++) { const x = p.x + 220 + i * 150, t0 = i * 0.12, u = k - t0; if (u < 0) continue;
      if (u < 0.15) { const s = u / 0.15; scorch(c, x, gy, 30 + s * 30, s); for (let j = 0; j < 4; j++) ember(c, x + (rnd(i * 9 + j) - 0.5) * 50, gy - 6 - s * 20 * rnd(j), 2, s); continue; }
      const v = Math.min(1, (u - 0.15) / 0.12), f = u > 0.7 ? Math.max(0, 1 - (u - 0.7) / 0.25) : 1, H = 330 * v * (0.85 + 0.15 * sin(t * 6 + i));
      scorch(c, x, gy, 70, f); c.save(); c.globalAlpha = f;
      c.fillStyle = lin(c, 0, gy - H, 0, gy, [[0, 'rgba(255,90,20,0)'], [0.25, 'rgba(255,90,20,.85)'], [1, '#c8280c']]); c.beginPath(); c.moveTo(x - 34, gy); c.quadraticCurveTo(x - 30 + sin(t * 7) * 6, gy - H * 0.6, x - 10, gy - H); c.lineTo(x + 10, gy - H); c.quadraticCurveTo(x + 30 + sin(t * 7 + 1) * 6, gy - H * 0.6, x + 34, gy); c.fill();
      c.fillStyle = lin(c, 0, gy - H, 0, gy, [[0, 'rgba(255,220,100,0)'], [0.3, 'rgba(255,200,80,.9)'], [1, '#ffe890']]); c.fillRect(x - 13, gy - H * 0.92, 26, H * 0.92);
      for (let j = 0; j < 5; j++) tongue(c, x - 26 + j * 13, gy - H * 0.75 + (j % 2) * 30, 50 + (j % 2) * 20, 8, t, j + i * 5);
      for (let j = 0; j < 6; j++) { const e = (t * 0.8 + j / 6) % 1; ember(c, x + sin(j * 2.3 + t) * 30, gy - e * H * 1.1, 2.4 * (1 - e) + 0.6, 1 - e); } c.restore(); } };
  // ===== 대화재 (4차): 붉은 하늘에서 불비가 비스듬히 쏟아짐 + 땅에 불길이 번짐 =====
  M.blaze = (c, p, k, gy) => { const a = k < 0.1 ? k / 0.1 : k > 0.85 ? (1 - k) / 0.15 : 1, t = 1.3 + k * 2, x0 = p.x + 160, x1 = p.x + 820;
    c.save(); c.globalAlpha = a * 0.35; c.fillStyle = lin(c, 0, gy - 700, 0, gy, [[0, 'rgba(160,30,10,.9)'], [1, 'rgba(255,120,30,0)']]); c.fillRect(x0 - 100, gy - 700, x1 - x0 + 200, 700); c.restore();
    for (let i = 0; i < 46; i++) { const u = (k * 2.2 + rnd(i * 3)) % 1, x = x0 + rnd(i) * (x1 - x0) - u * 160 + 160, y = gy - 620 + u * 620; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(-0.25);
      c.fillStyle = lin(c, 0, -46, 0, 0, [[0, 'rgba(255,120,30,0)'], [1, 'rgba(255,140,40,.9)']]); c.fillRect(-2.5, -46, 5, 46); c.fillStyle = '#ffe080'; c.beginPath(); c.arc(0, 0, 4.5, 0, PI * 2); c.fill(); c.restore();
      if (u > 0.9) { c.save(); c.globalAlpha = a; c.fillStyle = '#ff9a30'; c.beginPath(); c.ellipse(x, gy - 3, 14, 4, 0, 0, PI * 2); c.fill(); c.restore(); } }
    const spread = Math.min(1, k * 2); c.save(); c.globalAlpha = a; for (let i = 0; i < 14; i++) { const x = x0 + (i + 0.5) / 14 * (x1 - x0); if (Math.abs(x - (x0 + x1) / 2) > spread * (x1 - x0) / 2) continue; tongue(c, x, gy, 26 + rnd(i) * 26, 9, t, i); } c.restore(); };
  // ===== 유성 낙하 (2차): 불타는 운석 — 용암 금 간 바위 + 긴 불꼬리 · 떨어지면 불꽃 폭발 =====
  const rock = (c, r) => { c.beginPath(); for (let i = 0; i < 12; i++) { const an = i / 12 * PI * 2, rr = r * (0.82 + 0.25 * rnd(i * 3.7)); c.lineTo(cos(an) * rr, sin(an) * rr); } c.closePath(); c.fillStyle = rad(c, -r * 0.3, -r * 0.3, r * 1.2, [[0, '#8a5030'], [1, '#2a1208']]); c.fill();
    c.save(); c.clip(); c.strokeStyle = '#ffb040'; c.lineWidth = 2.4; for (let i = 0; i < 4; i++) { c.beginPath(); let x = (rnd(i) - 0.5) * r, y = (rnd(i + 5) - 0.5) * r; c.moveTo(x, y); for (let j = 0; j < 3; j++) { x += (rnd(i * 9 + j) - 0.5) * r * 0.8; y += (rnd(i * 7 + j) - 0.5) * r * 0.8; c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = rad(c, r * 0.6, 0, r * 1.2, [[0, 'rgba(255,190,80,.9)'], [1, 'rgba(255,90,20,0)']]); c.fillRect(-r, -r, r * 2, r * 2); c.restore(); };
  M.meteor = (c, p, k, gy) => { const t = 1.3 + k * 2; for (let i = 0; i < 4; i++) { const t0 = i * 0.12, u = (k - t0) / 0.4; if (u < 0) continue; const tx = p.x + 240 + i * 130, ang = 2.15;
      if (u < 1) { const L = 560 * (1 - u), x = tx - cos(ang) * L * -1, y = gy - 18 - sin(ang) * L; c.save(); c.translate(x, y); c.rotate(ang - PI); const TL = 170;
        c.fillStyle = lin(c, 0, 0, -TL, 0, [[0, 'rgba(255,230,120,.95)'], [0.3, 'rgba(255,110,20,.85)'], [1, 'rgba(160,30,10,0)']]); c.beginPath(); c.moveTo(14, -22); c.quadraticCurveTo(-TL * 0.4, -18 + sin(t * 20 + i) * 4, -TL, 0); c.quadraticCurveTo(-TL * 0.4, 18, 14, 22); c.closePath(); c.fill();
        for (let j = 0; j < 6; j++) { const e = (t * 2 + j / 6) % 1; ember(c, -e * TL * 0.9, (rnd(j + i) - 0.5) * 30 * (1 + e), 2.2 * (1 - e) + 0.5, 1 - e); }
        c.fillStyle = 'rgba(255,140,40,.45)'; c.beginPath(); c.arc(0, 0, 34, 0, PI * 2); c.fill(); rock(c, 20); c.restore(); }
      else { const v = Math.min(1, (u - 1) / 0.6), f = 1 - v; scorch(c, tx, gy, 90, f); c.save(); c.globalAlpha = f; c.fillStyle = rad(c, tx, gy - 30, 90 * (0.5 + v), [[0, '#fff2b0'], [0.35, '#ff9a20'], [0.7, 'rgba(220,60,10,.7)'], [1, 'rgba(160,30,10,0)']]); c.beginPath(); c.arc(tx, gy - 30, 90 * (0.5 + v), 0, PI * 2); c.fill();
        for (let j = 0; j < 8; j++) { const an = -PI * rnd(j * 7 + i), d = v * (60 + rnd(j) * 70); c.fillStyle = j % 2 ? '#3a1a0a' : '#ff8a20'; c.fillRect(tx + cos(an) * d - 4, gy - 20 + sin(an) * d + v * v * 60 - 3, 8, 6); } c.restore(); } } };
  // ===== 주변 3개 =====
  // 화염 폭발 (2차): 한 번 크게 "펑" — 불덩이 구름이 부풀어 터지고 위로 버섯 연기
  M.explode = (c, p, k, gy) => { const x = p.x + 60, y = gy - 50, u = Math.min(1, k / 0.6), f = k < 0.6 ? 1 : (1 - k) / 0.4, R = 50 + u * 130;
    scorch(c, x, gy, R * 1.2, f); c.save(); c.globalAlpha = f;
    for (let i = 0; i < 14; i++) { const an = i / 14 * PI * 2, d = R * (0.45 + rnd(i) * 0.4), r = R * (0.32 + rnd(i * 3) * 0.2); const px = x + cos(an) * d, py = y + sin(an) * d * 0.7 - u * 20; c.fillStyle = rad(c, px, py, r, [[0, '#ffe080'], [0.45, '#ff8a20'], [0.8, '#d8401a'], [1, 'rgba(120,30,10,0)']]); c.beginPath(); c.arc(px, py, r, 0, PI * 2); c.fill(); }
    c.fillStyle = rad(c, x, y, R * 0.6, [[0, '#fffbe0'], [1, 'rgba(255,200,80,0)']]); c.beginPath(); c.arc(x, y, R * 0.6, 0, PI * 2); c.fill();
    if (k > 0.3) { const v = (k - 0.3) / 0.7; for (let i = 0; i < 6; i++) { const r = 26 + i * 4; c.globalAlpha = f * 0.6; c.fillStyle = i % 2 ? '#5a3a30' : '#7a5040'; c.beginPath(); c.arc(x + (rnd(i) - 0.5) * 50, y - 40 - v * 160 - i * 12, r, 0, PI * 2); c.fill(); } }
    c.restore(); };
  // 화염 고리 (3차): 발밑에서 불꽃 벽 고리가 바깥으로 퍼져 나감 (원근 타원 · 앞뒤)
  M.ringFx = (c, p, k, gy) => { const x = p.x, t = 1.3 + k * 2, R = 40 + k * 330, f = k < 0.7 ? 1 : (1 - k) / 0.3; c.save(); c.globalAlpha = f;
    c.translate(0, 0); c.save(); c.translate(x, gy - 4); c.scale(1, 0.25); c.strokeStyle = '#c8280c'; c.lineWidth = 26; c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.stroke(); c.strokeStyle = '#ff8a20'; c.lineWidth = 12; c.stroke(); c.restore();
    for (let i = 0; i < 26; i++) { const an = i / 26 * PI * 2, fx = x + cos(an) * R, fy = gy - 4 + sin(an) * R * 0.25; tongue(c, fx, fy, (sin(an) > 0 ? 70 : 50) * (0.8 + rnd(i) * 0.4), 11, t, i); }
    c.restore(); };
  // 불꽃 폭풍 (3차): 캐릭터 둘레에 불꽃 회오리 기둥 (위로 넓어지는 나선 · 불씨가 빨려 올라감)
  M.storm = (c, p, k, gy) => { const x = p.x + 30, t = 1.3 + k * 3, f = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1, H = 360; c.save(); c.globalAlpha = f;
    for (let i = 0; i < 150; i++) { const u = (i % 50) / 50, y = gy - u * H, w = 30 + u * 150, an = t * 6 - u * 10 + Math.floor(i / 50) * PI * 2 / 3, fx = x + cos(an) * w, front = sin(an) > 0; if (front) continue;
      c.fillStyle = `rgba(${200 + 55 * u | 0},${60 + 80 * u | 0},20,.55)`; c.beginPath(); c.ellipse(fx, y, 20 + u * 10, 9, an, 0, PI * 2); c.fill(); }
    c.fillStyle = lin(c, 0, gy - H, 0, gy, [[0, 'rgba(255,120,30,0)'], [1, 'rgba(255,120,30,.5)']]); c.beginPath(); c.moveTo(x - 30, gy); c.lineTo(x - 180, gy - H); c.lineTo(x + 180, gy - H); c.lineTo(x + 30, gy); c.fill();
    for (let i = 0; i < 150; i++) { const u = (i % 50) / 50, y = gy - u * H, w = 30 + u * 150, an = t * 6 - u * 10 + Math.floor(i / 50) * PI * 2 / 3, fx = x + cos(an) * w; if (sin(an) <= 0) continue; tongue(c, fx, y + 10, 22 + u * 18, 7, t, i); }
    for (let i = 0; i < 12; i++) { const u = (t * 0.5 + i / 12) % 1, an = t * 5 + i, w = 40 + u * 150; ember(c, x + cos(an) * w, gy - u * H, 2.5, 1 - u); } c.restore(); };
})();
