'use strict';
// 녹스 v3(이야기 디자인) + 참고 5종 요소 접목. noxStory(c,t,ph,bg) 위·아래에 덧그림
(function () {
  const PI = Math.PI, sin = Math.sin, cos = Math.cos;
  const poly = (c, f, p, s, lw) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const ell = (c, x, y, rx, ry, f, s, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI * 2); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || 1.2; c.stroke(); } };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); };
  const line = (c, col, w, p) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const starPts = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([x + cos(a) * rr, y + sin(a) * rr]); } return p; };
  const PALE = '#d8def8', VIO = '#9a7ae0';
  // 꺼져 가는 별 구체: 검은 구 + 가는 별빛 테두리 + 안에 희미한 별 하나
  const deadStar = (c, x, y, r, t) => { glow(c, x, y, r * 2.4, '#8a80d0', 0.35); ell(c, x, y, r, r, '#05050e', VIO, 1.6); poly(c, `rgba(216,222,248,${0.25 + 0.15 * sin(t * 2)})`, starPts(x, y, r * 0.45)); };

  window.noxVar = function (c, t, v, bg) {
    // ---------- 뒤쪽에 그리는 것 ----------
    if (v === 1) {   // 1: 빈자리에서 몸 밖으로 퍼지는 금(빛나지 못한 별빛이 새어 나온 자국)
      for (const [a, L] of [[-2.5, 80], [-0.7, 90], [-1.6, 60], [2.6, 70], [0.6, 75]]) { const p = [[0, -165]]; let x = 0, y = -165; for (let k = 0; k < 5; k++) { x += cos(a + sin(k * 3) * 0.5) * L / 5; y += sin(a + sin(k * 3) * 0.5) * L / 5; p.push([x, y]); } line(c, 'rgba(154,122,224,.35)', 4, p); line(c, '#b8a8f0', 1.2, p); }
    }
    if (v === 2) {   // 2: 머리 뒤의 가시 고리 = 일곱 영웅이 박아 넣은 봉인의 못 일곱 개
      c.save(); c.translate(0, -214); c.strokeStyle = '#3a3a5e'; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.stroke();
      for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.42; poly(c, '#1c1c3a', [[cos(a) * 38 - sin(a) * 3, sin(a) * 38 + cos(a) * 3], [cos(a) * (58 + (i === 3 ? 10 : 0)), sin(a) * (58 + (i === 3 ? 10 : 0))], [cos(a) * 38 + sin(a) * 3, sin(a) * 38 - cos(a) * 3]], '#5a5a88', 1); }
      c.restore();
    }
    if (v === 3) {   // 3: 삼킨 별들이 굳은 결정 — 빛을 잃고 주위를 맴돎
      for (let i = 0; i < 8; i++) { const a = t * 0.35 + i * PI / 4, x = cos(a) * 70, y = -150 + sin(a) * 50, s = 0.8 + (i % 3) * 0.25;
        if (sin(a) < 0) { c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); poly(c, '#24244a', [[0, -14], [5, 0], [0, 14], [-5, 0]], '#6a6aa0', 1); c.restore(); } }
    }
    if (v === 4) {   // 4: 머리 위 가는 가시 왕관 고리 + 양옆 두 꺼진 별
      deadStar(c, -70, -150, 14, t); deadStar(c, 70, -150, 14, t + 1);
      c.save(); c.translate(0, -238); for (let i = 0; i < 7; i++) { const x = (i - 3) * 7, h = 10 + (3 - Math.abs(i - 3)) * 6; poly(c, '#1c1c3a', [[x - 2, 0], [x, -h], [x + 2, 0]], '#5a5a88', 1); } c.restore();
    }
    if (v === 5) {   // 5: 아래가 연기처럼 흩어지는 망령 (땅에 닿지 않음)
      for (let i = 0; i < 9; i++) { const u = (t * 0.3 + i / 9) % 1; c.globalAlpha = 0.5 * (1 - u); ell(c, sin(i * 2.1) * 26 + sin(t + i) * 6, -10 - u * 60, 14 * (1 - u * 0.5), 9, '#14142c'); c.globalAlpha = 1; }
    }

    // ---------- 몸 (v3) ----------
    c.save();
    if (v === 5) { c.translate(0, -16); }
    window.noxStory(c, t, 1, bg);
    c.restore();

    // ---------- 앞쪽에 그리는 것 ----------
    const handX = 22 + cos(-1.15 + PI / 2) * 74, handY = -194 + sin(-1.15 + PI / 2) * 74;   // 뻗은 손 근처
    if (v === 1) { deadStar(c, -78, -110, 16, t); deadStar(c, handX + 26, handY - 4, 16, t + 1.3); }
    if (v === 2) {   // 지팡이: 끊어진 사슬 기둥 조각 + 끝에 공허의 별조각이 빠진 별 모양 빈 고리
      line(c, '#2a2a46', 4, [[-30, 0], [-30, -250]]); line(c, '#4a4a70', 1, [[-29, -10], [-29, -240]]);
      for (let k = 0; k < 3; k++) ell(c, -30, -60 - k * 50, 4, 2.4, null, '#5a5a6e', 1.6);
      glow(c, -30, -268, 30, '#8a80d0', 0.35); poly(c, '#0a0a18', starPts(-30, -268, 16), '#b8b0f0', 1.6); poly(c, bg, starPts(-30, -268, 7));
      for (let i = 0; i < 4; i++) { const a = -PI / 2 + i * PI / 2 + PI / 4; poly(c, '#2a2a46', [[-30 + cos(a) * 16, -268 + sin(a) * 16], [-30 + cos(a) * 26, -268 + sin(a) * 26], [-30 + cos(a + 0.2) * 16, -268 + sin(a + 0.2) * 16]], '#5a5a88', 1); }
    }
    if (v === 3) {
      for (let i = 0; i < 8; i++) { const a = t * 0.35 + i * PI / 4, x = cos(a) * 70, y = -150 + sin(a) * 50, s = 0.8 + (i % 3) * 0.25;
        if (sin(a) >= 0) { c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); poly(c, '#2c2c58', [[0, -14], [5, 0], [0, 14], [-5, 0]], '#9a9ad8', 1.2); poly(c, 'rgba(216,222,248,.25)', [[0, -12], [3, -1], [0, 2]]); c.restore(); } }
      // 커진 빈자리: 별빛이 소용돌이치며 빨려 들어감
      for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(184,176,240,${0.45 - k * 0.12})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -165, 18 + k * 9, 6 + k * 3, 0, t + k, t + k + 4.2); c.stroke(); }
    }
    if (v === 5) {   // 하체가 연기로 풀림 (앞에 덮어 그림)
      for (let i = 0; i < 16; i++) { const u = ((t * 0.35 + i / 16) % 1), x = sin(i * 2.3) * 30 + sin(t + i) * 5, y = -24 - u * 70;
        c.globalAlpha = 0.85 * (1 - u); ell(c, x, y, 16 - u * 6, 10 - u * 3, i % 3 ? '#1a1a36' : '#26264a'); c.globalAlpha = 1; }
      const fg = c.createLinearGradient(0, -60, 0, -16); fg.addColorStop(0, 'rgba(10,10,24,0)'); fg.addColorStop(1, 'rgba(10,10,24,1)');
      c.fillStyle = fg; c.fillRect(-60, -60, 120, 60);
    }
    if (v === 5) {   // 등불: 엘마의 등대와 짝 — 안의 별은 꺼져 있음 (구원 엔딩에서 켜짐)
      const lx = handX + 6, ly = handY + 10;
      line(c, '#4a4a70', 1.2, [[lx, ly - 6], [lx, ly + 14]]);
      ell(c, lx, ly + 30, 13, 16, 'rgba(120,120,200,.15)', '#8a86c8', 1.4); poly(c, '#3a3a5e', [[lx - 8, ly + 14], [lx + 8, ly + 14], [lx + 5, ly + 10], [lx - 5, ly + 10]]);
      poly(c, 'rgba(216,222,248,.25)', starPts(lx, ly + 30, 6), '#8a86c8', 1); glow(c, lx, ly + 30, 22, '#8a80d0', 0.25);
    }
  };
})();
