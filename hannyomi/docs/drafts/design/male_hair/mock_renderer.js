// 시안용 새 캐릭터 그림 (게임 코드와 별개). 발끝 (0,0), 위가 음수
window.NS = (function () {
  const PI = Math.PI;
  const hx = h => { if (/^rgb/.test(h)) return h.match(/\d+/g).slice(0, 3).map(Number); h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const sh = (h, a) => { const [r, g, b] = hx(h); const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const rgba = (h, al) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${al})`; };
  const P = {
    2: { hr: 23, hy: -71, sh: -47, wa: -27, bw: 13.5, arm: 19, eyeH: 0.36, eyeW: 0.24, eyeY: 0.3 },
    3: { hr: 18, hy: -101, sh: -80, wa: -47, bw: 12.5, arm: 30, eyeH: 0.32, eyeW: 0.22, eyeY: 0.26 },
  };
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function fillLine(ctx, fill, line, lw = 1.6) { ctx.fillStyle = fill; ctx.fill(); if (line) { ctx.strokeStyle = line; ctx.lineWidth = lw * 0.45; ctx.lineJoin = 'round'; ctx.stroke(); } }
  function grad(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }


  // ---------- 남자 새 앞머리 4종: path(dy) 경로, st 결 [x0,y0,cx,cy,x1,y1,'d'(어두운)|'l'(밝은)], extra 덧붙임 ----------
  const CF = {
    part: {   // 5:5 가르마: 가운데에서 갈라져 양옆으로 흐르는 커튼 앞머리, 이마 가운데가 살짝 보임
      path(ctx, hr, hy, dy) { const Y = v => hy + hr * v + dy, X = v => hr * v;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.06, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.03), Y(-0.05));
        ctx.quadraticCurveTo(X(1.04), Y(0.28), X(0.8), Y(0.4)); ctx.quadraticCurveTo(X(0.62), Y(0.05), X(0.3), Y(-0.2)); ctx.quadraticCurveTo(X(0.12), Y(-0.36), X(0.05), Y(-0.55));
        ctx.lineTo(X(-0.05), Y(-0.55)); ctx.quadraticCurveTo(X(-0.12), Y(-0.36), X(-0.3), Y(-0.2)); ctx.quadraticCurveTo(X(-0.62), Y(0.05), X(-0.8), Y(0.4)); ctx.quadraticCurveTo(X(-1.04), Y(0.28), X(-1.03), Y(-0.05)); ctx.closePath(); },
      st: [[0, -1.0, 0.02, -0.8, 0, -0.56, 'd'], [0.1, -0.7, 0.45, -0.5, 0.72, 0.22, 'd'], [-0.1, -0.7, -0.45, -0.5, -0.72, 0.22, 'd'], [0.2, -0.78, 0.6, -0.6, 0.9, 0.0, 'l'], [-0.2, -0.78, -0.6, -0.6, -0.9, 0.0, 'l'], [0.5, -0.4, 0.7, -0.1, 0.62, 0.15, 'l'], [-0.5, -0.4, -0.7, -0.1, -0.62, 0.15, 'l']],
    },
    slick: {   // 올백: 이마를 드러내고 뒤로 넘긴 머리, 앞쪽 볼륨 + 흘러내린 한 가닥
      path(ctx, hr, hy, dy) { const Y = v => hy + hr * v + dy, X = v => hr * v;
        ctx.beginPath(); ctx.moveTo(X(-1.06), Y(0.0)); ctx.bezierCurveTo(X(-1.25), Y(-1.5), X(1.1), Y(-1.78), X(1.06), Y(0.0));
        ctx.quadraticCurveTo(X(1.0), Y(-0.3), X(0.6), Y(-0.42)); ctx.quadraticCurveTo(X(0.05), Y(-0.6), X(-0.55), Y(-0.44)); ctx.quadraticCurveTo(X(-0.98), Y(-0.3), X(-1.06), Y(0.0)); ctx.closePath(); },
      st: [[-0.62, -0.45, -0.75, -0.95, -0.35, -1.25, 'd'], [-0.2, -0.52, -0.3, -1.05, 0.08, -1.32, 'd'], [0.25, -0.52, 0.2, -1.0, 0.55, -1.22, 'd'], [0.68, -0.4, 0.8, -0.8, 0.92, -0.9, 'd'], [-0.42, -0.5, -0.52, -1.0, -0.12, -1.3, 'l'], [0.05, -0.56, 0.0, -1.05, 0.35, -1.28, 'l'], [0.48, -0.48, 0.55, -0.9, 0.75, -1.05, 'l']],
      extra(ctx, hr, hy, c, line) {   // 이마로 흘러내린 한 가닥
        ctx.beginPath(); ctx.moveTo(-hr * 0.05, hy - hr * 0.6); ctx.quadraticCurveTo(hr * 0.5, hy - hr * 0.5, hr * 0.4, hy - hr * 0.05); ctx.quadraticCurveTo(hr * 0.28, hy - hr * 0.35, hr * 0.12, hy - hr * 0.4); ctx.quadraticCurveTo(hr * 0.02, hy - hr * 0.45, -hr * 0.05, hy - hr * 0.6); ctx.closePath();
        fillLine(ctx, sh(c, 0.02), line, 1.0); },
    },
    messy: {   // 부스스한 머리: 다발 끝이 제각각 다른 방향 + 정수리 · 옆 잔머리
      path(ctx, hr, hy, dy) { const Y = v => hy + hr * v + dy, X = v => hr * v;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.07, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.04), Y(-0.05));
        const T = [[0.98, 0.32, 0.78, -0.02], [0.62, 0.38, 0.42, -0.05], [0.18, 0.28, 0.0, -0.08], [-0.28, 0.42, -0.42, -0.06], [-0.72, 0.3, -0.86, -0.02], [-1.0, 0.2, -1.04, -0.05]];
        for (const [tx, ty, vx, vy] of T) { ctx.quadraticCurveTo(X(tx + 0.08), Y(ty * 0.4), X(tx), Y(ty)); ctx.quadraticCurveTo(X((tx + vx) / 2), Y(ty * 0.3), X(vx), Y(vy)); }
        ctx.closePath(); },
      st: [[0.4, -0.75, 0.6, -0.3, 0.62, 0.3, 'd'], [-0.05, -0.8, 0.1, -0.3, 0.18, 0.22, 'd'], [-0.45, -0.7, -0.3, -0.25, -0.28, 0.35, 'd'], [0.7, -0.6, 0.95, -0.2, 0.95, 0.25, 'l'], [0.15, -0.6, 0.35, -0.2, 0.4, 0.2, 'l'], [-0.6, -0.55, -0.7, -0.15, -0.72, 0.22, 'l']],
      extra(ctx, hr, hy, c, line) {   // 정수리 · 옆에 둥글게 휜 잔머리 (뾰족하게 솟지 않게)
        for (const [x, y, a, l] of [[-0.3, -1.0, -0.6, 0.18], [0.3, -1.02, 0.7, 0.16], [0.95, -0.55, 1.5, 0.16], [-0.98, -0.45, -1.6, 0.15]]) {
          ctx.save(); ctx.translate(hr * x, hy + hr * y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-hr * 0.12, hr * 0.06);
          ctx.quadraticCurveTo(-hr * 0.02, -hr * l, hr * 0.2, -hr * l * 0.9); ctx.quadraticCurveTo(hr * 0.05, -hr * l * 0.4, hr * 0.12, hr * 0.06); ctx.closePath(); fillLine(ctx, sh(c, 0.04), line, 1.0); ctx.restore(); } },
    },
    longm: {   // 미디엄 장발: 한쪽으로 길게 넘긴 앞머리 (오른쪽 가르마), 어깨까지 오는 뒷머리
      path(ctx, hr, hy, dy) { const Y = v => hy + hr * v + dy, X = v => hr * v;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.05, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.03), Y(-0.05));
        ctx.quadraticCurveTo(X(0.9), Y(-0.45), X(0.5), Y(-0.62)); ctx.quadraticCurveTo(X(0.1), Y(-0.35), X(-0.25), Y(0.15)); ctx.quadraticCurveTo(X(-0.4), Y(0.38), X(-0.62), Y(0.34));
        ctx.quadraticCurveTo(X(-0.72), Y(0.15), X(-0.85), Y(0.3)); ctx.quadraticCurveTo(X(-1.0), Y(0.15), X(-1.03), Y(-0.05)); ctx.closePath(); },
      st: [[0.5, -0.9, 0.48, -0.75, 0.5, -0.63, 'd'], [0.4, -0.6, 0.0, -0.3, -0.45, 0.3, 'd'], [0.2, -0.75, -0.2, -0.45, -0.75, 0.2, 'd'], [0.45, -0.55, 0.1, -0.2, -0.2, 0.12, 'l'], [0.05, -0.75, -0.35, -0.45, -0.6, 0.05, 'l']],
    },
  };
  const SIDE = { part: [0.62, 0], slick: [0.32, 0], messy: [0.62, 0.14], longm: [1.25, 0.06], wolf: [0.85, 0.15] };
  // ---------- 남자 머리 10종 (사진 참고) ----------
  // 앞머리 다발 경로 도우미: R 정수리 반지름, T = 오른쪽 → 왼쪽 [끝x, 끝y, 골x, 골y, 기울기]
  function tipBang(ctx, hr, hy, dy, R, T) { const X = v => hr * v, Y = v => hy + hr * v + dy;
    ctx.beginPath(); ctx.arc(0, hy + dy, hr * R, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.04), Y(-0.05));
    for (const [tx, ty, vx, vy, ln] of T) { ctx.quadraticCurveTo(X(tx + (ln || 0) + 0.06), Y(ty * 0.45), X(tx), Y(ty)); ctx.quadraticCurveTo(X((tx + vx) / 2 + (ln || 0) * 0.5), Y((ty + vy) * 0.5), X(vx), Y(vy)); }
    ctx.closePath(); }
  // 펌 컬: C자 다발 (r 크기, rot 방향)
  function curl(ctx, x, y, r, rot, c, line) {   // 펌 컬: 둥근 컬 덩어리 + 안쪽 소용돌이
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.88, 0, 0, PI * 2); fillLine(ctx, grad(ctx, 0, -r, 0, r, [[0, sh(c, 0.1)], [1, sh(c, -0.12)]]), line, 0.9);
    ctx.lineCap = 'round'; ctx.strokeStyle = rgba(sh(c, -0.6), 0.4); ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, PI * 0.25, PI * 1.55); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.08, r * 0.04, r * 0.28, PI * 1.3, PI * 2.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.12, r * 0.78, PI * 1.1, PI * 1.45); ctx.strokeStyle = rgba('#ffffff', 0.3); ctx.lineWidth = 0.9; ctx.stroke();
    ctx.restore(); }
  // 굵은 다발 하나 (외곽선 a → b → c → 안쪽 d 로 닫음)
  function lockShape(ctx, hr, hy, pts, c, line, k) { ctx.beginPath(); ctx.moveTo(hr * pts[0][0], hy + hr * pts[0][1]);
    for (let i = 1; i < pts.length; i += 2) ctx.quadraticCurveTo(hr * pts[i][0], hy + hr * pts[i][1], hr * pts[i + 1][0], hy + hr * pts[i + 1][1]);
    ctx.closePath(); fillLine(ctx, grad(ctx, 0, hy - hr * 1.4, 0, hy + hr * 0.3, [[0, sh(c, 0.14 + (k || 0))], [1, sh(c, -0.1)]]), line, 1.0); }
  const tall = (ctx, X, Y, top) => { ctx.beginPath(); ctx.moveTo(X(-1.06), Y(0.0)); ctx.bezierCurveTo(X(-1.25), Y(-1.5), X(1.12), Y(top), X(1.06), Y(0.0)); };
  Object.assign(CF, {
    guile: {   // 가일 컷: 가르마(왼쪽)에서 위로 들어 올려 오른쪽으로 넘긴 앞머리, 이마가 보임, 옆은 짧게
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy; tall(ctx, X, Y, -1.75);
        ctx.quadraticCurveTo(X(1.0), Y(-0.28), X(0.75), Y(-0.38)); ctx.quadraticCurveTo(X(0.3), Y(-0.6), X(-0.08), Y(-0.48)); ctx.quadraticCurveTo(X(-0.32), Y(-0.42), X(-0.48), Y(-0.55)); ctx.quadraticCurveTo(X(-0.88), Y(-0.45), X(-1.06), Y(0.0)); ctx.closePath(); },
      st: [[-0.46, -0.58, -0.44, -0.8, -0.4, -1.05, 'd'], [-0.3, -0.55, 0.1, -1.1, 0.7, -0.8, 'd'], [-0.1, -0.5, 0.3, -0.85, 0.8, -0.5, 'd'], [-0.2, -0.62, 0.15, -1.15, 0.55, -1.05, 'l'], [-0.55, -0.55, -0.75, -0.8, -0.85, -0.5, 'd']],
      extra(ctx, hr, hy, c, line) { lockShape(ctx, hr, hy, [[-0.42, -0.6], [-0.1, -1.25], [0.55, -1.0], [0.95, -0.75], [0.8, -0.38], [0.45, -0.85], [-0.42, -0.6]], c, line, 0.04);
        lockShape(ctx, hr, hy, [[0.1, -0.55], [0.38, -0.45], [0.36, -0.12], [0.3, -0.35], [0.0, -0.5]], c, line); },
    },
    shadow: {   // 쉐도우 펌: 이마를 덮는 굵은 웨이브 펌, 다발 끝이 안으로 말림, 정수리 볼륨
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.12, [[0.95, 0.32, 0.72, 0.0, -0.05], [0.55, 0.38, 0.35, 0.02, -0.05], [0.12, 0.34, -0.08, 0.0, 0.05], [-0.32, 0.38, -0.5, 0.02, 0.05], [-0.75, 0.32, -0.92, 0.0, 0.05], [-1.02, 0.2, -1.04, -0.05]]); },
      st: [[0.5, -0.8, 0.65, -0.3, 0.55, 0.3, 'd'], [0.0, -0.85, 0.15, -0.3, 0.12, 0.28, 'd'], [-0.45, -0.75, -0.3, -0.3, -0.32, 0.32, 'd'], [0.75, -0.55, 0.95, -0.2, 0.92, 0.22, 'l'], [0.25, -0.7, 0.4, -0.25, 0.38, 0.2, 'l'], [-0.2, -0.7, -0.05, -0.25, -0.1, 0.22, 'l']],
      extra(ctx, hr, hy, c, line) { for (const [x, y, r, a] of [[-0.98, -0.32, 0.2, 0], [-0.78, -0.72, 0.22, 0.3], [-0.42, -0.96, 0.23, 0.8], [0.0, -1.04, 0.23, 1.2], [0.42, -0.96, 0.23, 1.8], [0.78, -0.72, 0.22, 2.3], [0.98, -0.32, 0.2, 2.8]]) curl(ctx, hr * x, hy + hr * y, hr * r, a, c, line);
        for (const [x, y, r, a] of [[-0.45, -0.62, 0.18, 0.5], [0.05, -0.7, 0.18, 1.5], [0.5, -0.6, 0.17, 2.5]]) curl(ctx, hr * x, hy + hr * y, hr * r, a, c, line); },
    },
    comma: {   // 쉼표 머리: 한쪽 가르마, 앞머리 끝 한 다발이 쉼표처럼 안으로 말림 (이마가 살짝 보임)
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.08, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.04), Y(-0.05));
        ctx.quadraticCurveTo(X(0.95), Y(-0.38), X(0.62), Y(-0.48)); ctx.quadraticCurveTo(X(0.4), Y(-0.42), X(0.3), Y(-0.15));
        ctx.quadraticCurveTo(X(0.1), Y(0.0), X(-0.05), Y(0.25)); ctx.quadraticCurveTo(X(-0.2), Y(0.05), X(-0.35), Y(0.02)); ctx.quadraticCurveTo(X(-0.5), Y(0.15), X(-0.62), Y(0.3));
        ctx.quadraticCurveTo(X(-0.75), Y(0.1), X(-0.9), Y(0.22)); ctx.quadraticCurveTo(X(-1.02), Y(0.08), X(-1.04), Y(-0.05)); ctx.closePath(); },
      st: [[0.55, -0.92, 0.55, -0.7, 0.6, -0.5, 'd'], [0.45, -0.6, 0.1, -0.4, -0.05, 0.2, 'd'], [0.3, -0.75, -0.2, -0.45, -0.55, 0.25, 'd'], [0.1, -0.8, -0.5, -0.5, -0.85, 0.15, 'd'], [0.35, -0.65, 0.0, -0.35, -0.25, 0.0, 'l'], [0.0, -0.78, -0.5, -0.45, -0.7, 0.05, 'l']],
      extra(ctx, hr, hy, c, line) {   // 쉼표 다발
        lockShape(ctx, hr, hy, [[0.25, -0.5], [0.5, -0.25], [0.32, 0.12], [0.18, 0.24], [0.08, 0.1], [0.2, 0.12], [0.28, -0.05], [0.3, -0.3], [0.1, -0.45]], c, line, 0.03); },
    },
    leaf: {   // 리프 컷: 가운데 가르마, 길게 내려온 앞머리 끝이 나뭇잎처럼 바깥으로 휨
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.07, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.05), Y(-0.05));
        ctx.quadraticCurveTo(X(1.12), Y(0.35), X(1.22), Y(0.58)); ctx.quadraticCurveTo(X(0.9), Y(0.45), X(0.72), Y(0.25)); ctx.quadraticCurveTo(X(0.45), Y(-0.05), X(0.08), Y(-0.55));
        ctx.lineTo(X(-0.08), Y(-0.55)); ctx.quadraticCurveTo(X(-0.45), Y(-0.05), X(-0.72), Y(0.25)); ctx.quadraticCurveTo(X(-0.9), Y(0.45), X(-1.22), Y(0.58)); ctx.quadraticCurveTo(X(-1.12), Y(0.35), X(-1.05), Y(-0.05)); ctx.closePath(); },
      st: [[0, -1.0, 0.0, -0.8, 0, -0.56, 'd'], [0.1, -0.7, 0.6, -0.4, 1.05, 0.45, 'd'], [-0.1, -0.7, -0.6, -0.4, -1.05, 0.45, 'd'], [0.25, -0.78, 0.8, -0.5, 1.0, 0.1, 'l'], [-0.25, -0.78, -0.8, -0.5, -1.0, 0.1, 'l'], [0.3, -0.45, 0.6, -0.1, 0.85, 0.3, 'l'], [-0.3, -0.45, -0.6, -0.1, -0.85, 0.3, 'l']],
    },
    regent: {   // 리젠트 컷: 이마를 드러내고 앞머리를 높이 세워 뒤로 넘김, 옆은 짧게
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy; tall(ctx, X, Y, -1.78);
        ctx.quadraticCurveTo(X(1.0), Y(-0.3), X(0.65), Y(-0.48)); ctx.quadraticCurveTo(X(0.0), Y(-0.66), X(-0.6), Y(-0.48)); ctx.quadraticCurveTo(X(-0.98), Y(-0.3), X(-1.06), Y(0.0)); ctx.closePath(); },
      st: [[-0.55, -0.5, -0.7, -0.9, -0.4, -1.15, 'd'], [-0.15, -0.6, -0.25, -1.0, 0.1, -1.25, 'd'], [0.3, -0.58, 0.25, -0.95, 0.6, -1.15, 'd'], [0.7, -0.45, 0.85, -0.8, 0.95, -0.85, 'd'], [-0.35, -0.55, -0.45, -0.95, -0.1, -1.2, 'l'], [0.1, -0.62, 0.05, -1.0, 0.4, -1.22, 'l']],
      extra(ctx, hr, hy, c, line) {   // 앞쪽에 높이 솟은 볼륨 (둥글게 말린 앞머리)
        lockShape(ctx, hr, hy, [[-0.65, -0.5], [-0.85, -1.2], [0.0, -1.38], [0.85, -1.42], [0.92, -0.85], [0.55, -1.15], [0.0, -1.1], [-0.4, -1.0], [-0.3, -0.58]], c, line, 0.06);
        ctx.beginPath(); ctx.moveTo(-hr * 0.5, hy - hr * 1.08); ctx.quadraticCurveTo(hr * 0.1, hy - hr * 1.36, hr * 0.7, hy - hr * 1.25); ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = hr * 0.07; ctx.lineCap = 'round'; ctx.stroke(); },
    },
    asperm: {   // 애즈 펌: 한쪽 가르마에서 S자로 흐르는 앞머리 (반대쪽 이마가 살짝 보임)
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.09, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.04), Y(-0.05));
        ctx.quadraticCurveTo(X(1.05), Y(0.2), X(0.92), Y(0.32)); ctx.quadraticCurveTo(X(0.8), Y(0.1), X(0.68), Y(0.05)); ctx.quadraticCurveTo(X(0.6), Y(0.25), X(0.45), Y(0.33));
        ctx.quadraticCurveTo(X(0.3), Y(0.1), X(0.15), Y(0.05)); ctx.quadraticCurveTo(X(0.05), Y(0.2), X(-0.1), Y(0.22)); ctx.quadraticCurveTo(X(-0.2), Y(-0.15), X(-0.42), Y(-0.5));
        ctx.quadraticCurveTo(X(-0.88), Y(-0.38), X(-1.04), Y(-0.05)); ctx.closePath(); },
      st: [[-0.45, -0.88, -0.44, -0.7, -0.42, -0.52, 'd'], [-0.35, -0.6, 0.2, -0.55, 0.45, 0.25, 'd'], [-0.2, -0.75, 0.6, -0.6, 0.85, 0.25, 'd'], [-0.3, -0.5, 0.0, -0.35, -0.05, 0.15, 'd'], [-0.25, -0.68, 0.35, -0.6, 0.62, 0.0, 'l'], [-0.3, -0.55, 0.1, -0.4, 0.15, 0.0, 'l']],
      
    },
    twoblock: {   // 투블럭 펌: 옆 · 뒤는 짧게 (어둡게), 윗머리는 컬 펌으로 앞으로 내림
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.1, [[0.88, 0.2, 0.68, -0.08, -0.05], [0.48, 0.28, 0.28, -0.04], [0.05, 0.24, -0.15, -0.06], [-0.4, 0.28, -0.6, -0.05], [-0.85, 0.2, -1.04, -0.08]]); },
      st: [[0.4, -0.7, 0.55, -0.3, 0.48, 0.22, 'd'], [-0.05, -0.75, 0.1, -0.3, 0.05, 0.18, 'd'], [-0.5, -0.65, -0.35, -0.3, -0.4, 0.22, 'd'], [0.65, -0.55, 0.8, -0.2, 0.85, 0.15, 'l'], [0.15, -0.65, 0.3, -0.25, 0.28, 0.12, 'l']],
      extra(ctx, hr, hy, c, line) { for (const [x, y, r, a] of [[-0.75, -0.72, 0.21, 0.3], [-0.38, -0.95, 0.22, 0.8], [0.02, -1.02, 0.22, 1.2], [0.42, -0.94, 0.22, 1.8], [0.76, -0.7, 0.2, 2.3], [-0.5, -0.5, 0.17, 0.4], [-0.1, -0.62, 0.18, 1.0], [0.3, -0.6, 0.18, 1.6], [0.62, -0.42, 0.16, 2.2], [-0.25, -0.3, 0.15, 0.6], [0.2, -0.32, 0.15, 1.9]]) curl(ctx, hr * x, hy + hr * y, hr * r, a, c, line); },
    },
    pomade: {   // 포마드: 한쪽 가르마로 매끈하게 빗어 넘김, 강한 윤기
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy; tall(ctx, X, Y, -1.6);
        ctx.quadraticCurveTo(X(1.0), Y(-0.28), X(0.7), Y(-0.42)); ctx.quadraticCurveTo(X(0.1), Y(-0.65), X(-0.42), Y(-0.58)); ctx.quadraticCurveTo(X(-0.9), Y(-0.48), X(-1.06), Y(0.0)); ctx.closePath(); },
      st: [[-0.42, -0.6, -0.4, -0.85, -0.36, -1.12, 'd'], [-0.35, -0.68, 0.2, -1.05, 0.85, -0.6, 'd'], [-0.35, -0.82, 0.25, -1.2, 0.95, -0.3, 'd'], [-0.3, -0.98, 0.2, -1.3, 1.0, -0.6, 'd'], [-0.38, -0.75, 0.2, -1.12, 0.9, -0.45, 'l'], [-0.32, -0.9, 0.2, -1.25, 0.98, -0.5, 'l'], [-0.5, -0.6, -0.8, -0.7, -0.95, -0.3, 'd']],
      extra(ctx, hr, hy, c, line) { ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-hr * 0.25, hy - hr * 0.92); ctx.quadraticCurveTo(hr * 0.3, hy - hr * 1.08, hr * 0.72, hy - hr * 0.78); ctx.strokeStyle = rgba('#ffffff', 0.4); ctx.lineWidth = hr * 0.09; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-hr * 0.1, hy - hr * 0.72); ctx.quadraticCurveTo(hr * 0.35, hy - hr * 0.86, hr * 0.68, hy - hr * 0.6); ctx.strokeStyle = rgba('#ffffff', 0.22); ctx.lineWidth = hr * 0.05; ctx.stroke(); ctx.restore(); },
    },
    shaggy: {   // 내추럴 덮수룩 컷: 눈썹을 덮는 무거운 앞머리, 끝이 제각각, 뒤는 조금 김
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.13, [[1.0, 0.35, 0.85, 0.05, 0.05], [0.7, 0.45, 0.55, 0.05, -0.08], [0.38, 0.4, 0.22, 0.02, 0.06], [0.05, 0.46, -0.1, 0.04, -0.06], [-0.28, 0.4, -0.45, 0.02, 0.06], [-0.62, 0.44, -0.78, 0.05, -0.05], [-0.95, 0.34, -1.04, -0.05]]); },
      st: [[0.6, -0.8, 0.75, -0.3, 0.7, 0.4, 'd'], [0.2, -0.85, 0.35, -0.3, 0.38, 0.35, 'd'], [-0.2, -0.85, -0.05, -0.3, 0.05, 0.4, 'd'], [-0.55, -0.75, -0.45, -0.3, -0.62, 0.38, 'd'], [0.85, -0.55, 1.0, -0.2, 0.98, 0.28, 'l'], [0.4, -0.7, 0.5, -0.25, 0.55, 0.3, 'l'], [-0.05, -0.7, 0.1, -0.25, 0.1, 0.3, 'l'], [-0.4, -0.65, -0.3, -0.25, -0.35, 0.3, 'l']],
      extra(ctx, hr, hy, c, line) { for (const [x, y, a, l] of [[-0.5, -1.0, -0.7, 0.14], [0.35, -1.06, 0.6, 0.13], [1.02, -0.4, 1.6, 0.14], [-1.04, -0.35, -1.6, 0.14]]) {
          ctx.save(); ctx.translate(hr * x, hy + hr * y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-hr * 0.12, hr * 0.06); ctx.quadraticCurveTo(-hr * 0.02, -hr * l, hr * 0.2, -hr * l * 0.9); ctx.quadraticCurveTo(hr * 0.05, -hr * l * 0.4, hr * 0.12, hr * 0.06); ctx.closePath(); fillLine(ctx, sh(c, 0.04), line, 1.0); ctx.restore(); } },
    },
    wolfc: {   // 울프 컷: 윗머리는 층지고 컬, 목덜미는 길게 바깥으로 뻗침
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.1, [[0.98, 0.3, 0.78, 0.0, 0.08], [0.6, 0.4, 0.4, 0.0, -0.05], [0.18, 0.34, 0.0, -0.02, 0.05], [-0.25, 0.4, -0.45, 0.0, -0.05], [-0.7, 0.32, -0.88, 0.0, -0.08], [-1.0, 0.25, -1.04, -0.05]]); },
      st: [[0.5, -0.8, 0.65, -0.3, 0.6, 0.35, 'd'], [0.05, -0.85, 0.2, -0.3, 0.18, 0.3, 'd'], [-0.4, -0.78, -0.28, -0.3, -0.25, 0.36, 'd'], [0.75, -0.55, 0.95, -0.2, 0.95, 0.25, 'l'], [0.25, -0.7, 0.4, -0.25, 0.4, 0.25, 'l'], [-0.2, -0.7, -0.05, -0.25, -0.05, 0.25, 'l']],
      extra(ctx, hr, hy, c, line) { for (const [x, y, r, a] of [[-0.78, -0.7, 0.19, 0.3], [-0.38, -0.95, 0.2, 0.8], [0.05, -1.02, 0.2, 1.2], [0.45, -0.93, 0.2, 1.8], [0.8, -0.68, 0.18, 2.3]]) curl(ctx, hr * x, hy + hr * y, hr * r, a, c, line); },
    },
  });
  Object.assign(SIDE, { guile: [0.3, 0], shadow: [0.68, 0.1], comma: [0.6, 0.05], leaf: [0.95, 0.12], regent: [0.28, 0], asperm: [0.62, 0.06], twoblock: [0.22, 0], pomade: [0.3, 0], shaggy: [0.85, 0.12], wolfc: [0.9, 0.18] });

  // ---------- 우리 게임용 남자 머리 5종 (2등신 모험가에 맞춘 시안 C 그림체) ----------
  Object.assign(CF, {
    hero: {   // 모험가 머리: 큼직한 앞머리 다발 5개 + 정수리에 살짝 휜 더듬이 머리 한 가닥
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.07, [[0.95, 0.22, 0.72, -0.05, 0.0], [0.5, 0.38, 0.3, -0.06, -0.08], [0.08, 0.3, -0.12, -0.08, 0.06], [-0.38, 0.36, -0.58, -0.05, 0.08], [-0.85, 0.24, -1.04, -0.05]]); },
      st: [[0.72, -0.05, 0.68, -0.25, 0.6, -0.42, 'd'], [0.3, -0.06, 0.28, -0.3, 0.22, -0.48, 'd'], [-0.12, -0.08, -0.12, -0.3, -0.1, -0.48, 'd'], [-0.58, -0.05, -0.55, -0.28, -0.48, -0.45, 'd'],
           [0.55, -0.55, 0.56, -0.2, 0.5, 0.25, 'l'], [0.12, -0.6, 0.12, -0.2, 0.08, 0.18, 'l'], [-0.35, -0.55, -0.37, -0.2, -0.38, 0.22, 'l']],
      extra(ctx, hr, hy, c, line) { lockShape(ctx, hr, hy, [[0.0, -1.0], [0.0, -1.38], [0.32, -1.46], [0.52, -1.44], [0.44, -1.34], [0.2, -1.32], [0.14, -1.0]], c, line, 0.05); },
    },
    wind: {   // 바람머리: 앞머리가 한쪽으로 날리고 반대쪽 이마가 보임 (달리는 모험가 느낌)
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.08, [[1.12, 0.16, 0.86, -0.08, 0.12], [0.76, 0.3, 0.5, -0.12, 0.15], [0.36, 0.24, 0.1, -0.2, 0.15], [-0.04, 0.1, -0.3, -0.3, 0.15], [-0.45, -0.14, -0.75, -0.36, 0.1], [-0.95, -0.12, -1.04, -0.05]]); },
      st: [[-0.6, -0.8, -0.1, -0.6, 0.6, 0.2, 'd'], [-0.4, -0.9, 0.2, -0.7, 0.95, 0.05, 'd'], [-0.75, -0.6, -0.4, -0.45, 0.2, 0.15, 'd'], [-0.5, -0.75, 0.0, -0.55, 0.7, 0.1, 'l'], [-0.65, -0.55, -0.3, -0.4, 0.3, 0.1, 'l']],
      extra(ctx, hr, hy, c, line) { lockShape(ctx, hr, hy, [[-0.75, -0.75], [-1.05, -1.0], [-1.28, -0.88], [-1.1, -0.84], [-0.92, -0.6]], c, line, 0.02); },
    },
    bowl: {   // 동글 덮머리: 둥근 머리에 눈썹 위로 고르게 내린 앞머리, 가운데가 살짝 갈라짐
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.11, [[0.98, 0.3, 0.8, 0.1, -0.05], [0.6, 0.3, 0.42, 0.08, -0.05], [0.22, 0.28, 0.06, -0.08, -0.06], [-0.1, 0.28, -0.28, 0.08, 0.06], [-0.5, 0.3, -0.68, 0.1, 0.05], [-0.9, 0.3, -1.04, -0.05]]); },
      st: [[0.06, -0.08, 0.05, -0.4, 0.03, -0.62, 'd'], [0.42, 0.08, 0.45, -0.25, 0.4, -0.55, 'd'], [-0.28, 0.08, -0.3, -0.25, -0.26, -0.55, 'd'], [0.8, 0.1, 0.82, -0.2, 0.7, -0.45, 'd'], [-0.68, 0.1, -0.72, -0.2, -0.6, -0.45, 'd'],
           [0.25, -0.6, 0.26, -0.2, 0.22, 0.15, 'l'], [-0.12, -0.6, -0.12, -0.2, -0.1, 0.15, 'l'], [0.62, -0.45, 0.64, -0.1, 0.6, 0.18, 'l'], [-0.5, -0.45, -0.52, -0.1, -0.5, 0.18, 'l']],
    },
    fluffy: {   // 몽글 곱슬: 테두리가 몽글몽글한 부드러운 곱슬 (견습 마법사 느낌)
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy;
        ctx.beginPath(); ctx.moveTo(X(-1.1), Y(0.12));
        for (let k = 0; k < 9; k++) { const a = PI + (k + 0.5) / 9 * PI; ctx.arc(X(1.0 * Math.cos(a)), Y(1.0 * Math.sin(a)), hr * 0.24, a - PI * 0.55, a + PI * 0.55); }
        ctx.lineTo(X(1.1), Y(0.12));
        for (let k = 0; k < 6; k++) { const cx = 0.88 - k * 0.35; ctx.arc(X(cx), Y(0.08), hr * 0.18, 0, PI); }
        ctx.closePath(); },
      st: [],
      extra(ctx, hr, hy, c, line) { ctx.save(); ctx.lineCap = 'round';
        for (const [x, y, r, a] of [[-0.6, -0.55, 0.16, 0.3], [-0.2, -0.75, 0.17, 1.0], [0.25, -0.72, 0.17, 1.8], [0.62, -0.5, 0.16, 2.4], [-0.38, -0.2, 0.15, 0.6], [0.05, -0.32, 0.15, 1.4], [0.45, -0.15, 0.15, 2.0], [-0.8, -0.12, 0.13, 0.2], [0.82, -0.12, 0.13, 2.6]]) {
          ctx.beginPath(); ctx.arc(hr * x, hy + hr * y, hr * r, a, a + PI * 1.3); ctx.strokeStyle = rgba(sh(c, -0.55), 0.4); ctx.lineWidth = 1.0; ctx.stroke();
          ctx.beginPath(); ctx.arc(hr * x - hr * 0.04, hy + hr * y - hr * 0.05, hr * r * 0.7, PI * 1.1, PI * 1.6); ctx.strokeStyle = rgba('#ffffff', 0.3); ctx.lineWidth = 0.9; ctx.stroke(); }
        ctx.restore(); },
    },
    tail: {   // 꽁지머리: 얼굴을 감싸는 긴 옆머리 + 목덜미에서 작게 묶은 꽁지 (레인저 느낌)
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.07, [[0.96, 0.3, 0.74, -0.04, 0.02], [0.55, 0.34, 0.34, -0.06, -0.06], [0.12, 0.28, -0.08, -0.08, 0.05], [-0.32, 0.34, -0.52, -0.05, 0.06], [-0.78, 0.3, -1.04, -0.05]]); },
      st: [[0.74, -0.04, 0.7, -0.25, 0.62, -0.42, 'd'], [0.34, -0.06, 0.32, -0.3, 0.26, -0.5, 'd'], [-0.08, -0.08, -0.08, -0.3, -0.06, -0.5, 'd'], [-0.52, -0.05, -0.5, -0.28, -0.44, -0.46, 'd'],
           [0.6, -0.55, 0.6, -0.2, 0.55, 0.22, 'l'], [0.15, -0.6, 0.16, -0.2, 0.12, 0.2, 'l'], [-0.3, -0.55, -0.32, -0.2, -0.32, 0.22, 'l']],
    },
  });
  Object.assign(SIDE, { hero: [0.55, 0.05], wind: [0.5, 0.12], bowl: [0.7, 0], fluffy: [0.55, 0.04], tail: [1.0, 0.08] });
  // ---------- 부드러운 입체 명암 (이미지 10종 참고 시험) ----------
  // 흐림 필터 대신 원형 그라데이션만 사용 (아이폰 사파리 포함 모든 기기에서 동작)
  function radial(ctx, x, y, r, stops) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function softShade(ctx, bp, hr, hy, c) {   // 머리 덩어리 전체: 위쪽 은은한 빛 · 가장자리 어둡게(둥근 입체) · 얼굴 쪽 안쪽 그림자
    const dk = sh(c, -0.55);
    ctx.save(); bp(0); ctx.clip();
    ctx.fillStyle = radial(ctx, -hr * 0.25, hy - hr * 0.8, hr * 1.7, [[0, rgba('#ffffff', 0.24)], [0.32, rgba('#ffffff', 0)], [0.7, rgba(dk, 0)], [1, rgba(dk, 0.4)]]); ctx.fillRect(-hr * 2, hy - hr * 2.2, hr * 4, hr * 3);
    ctx.fillStyle = radial(ctx, 0, hy + hr * 0.35, hr * 0.95, [[0, rgba(dk, 0.35)], [1, rgba(dk, 0)]]); ctx.fillRect(-hr * 2, hy - hr * 2.2, hr * 4, hr * 3);
    ctx.restore();
  }
  // 입체 다발: 뿌리(x0,y0) → 끝(x1,y1), 폭 w, 휨 b. 아래에 옅은 그림자 · 뿌리 쪽 빛 · 끝 쪽 어둡게
  function lobe(ctx, hr, hy, [x0, y0, x1, y1, w, b], c, line) {
    const mx = (x0 + x1) / 2 + b, my = (y0 + y1) / 2;
    const P = dx => { ctx.beginPath(); ctx.moveTo(hr * (x0 - w / 2 + dx), hy + hr * (y0 + dx * 2));
      ctx.quadraticCurveTo(hr * (mx - w * 0.5 + dx), hy + hr * (my + dx * 2), hr * (x1 + dx), hy + hr * (y1 + dx * 2));
      ctx.quadraticCurveTo(hr * (mx + w * 0.5 + dx), hy + hr * (my + dx * 2), hr * (x0 + w / 2 + dx), hy + hr * (y0 + dx * 2));
      ctx.quadraticCurveTo(hr * (x0 + dx), hy + hr * (y0 - 0.1 + dx * 2), hr * (x0 - w / 2 + dx), hy + hr * (y0 + dx * 2)); ctx.closePath(); };
    P(0.03); ctx.fillStyle = grad(ctx, 0, hy + hr * y0, 0, hy + hr * y1, [[0, rgba(sh(c, -0.6), 0)], [0.5, rgba(sh(c, -0.6), 0.12)], [1, rgba(sh(c, -0.6), 0.28)]]); ctx.fill();   // 다발 아래 그림자
    P(0); ctx.fillStyle = grad(ctx, 0, hy + hr * y0, 0, hy + hr * y1, [[0, rgba(c, 0)], [0.3, rgba(sh(c, 0.04), 1)], [0.65, c], [1, sh(c, -0.22)]]); ctx.fill();
    const lg = grad(ctx, 0, hy + hr * y0, 0, hy + hr * y1, [[0, rgba(line, 0)], [0.45, rgba(line, 0.5)], [1, rgba(line, 0.9)]]);
    ctx.beginPath(); ctx.moveTo(hr * (x0 - w / 2), hy + hr * y0); ctx.quadraticCurveTo(hr * (mx - w * 0.5), hy + hr * my, hr * x1, hy + hr * y1); ctx.quadraticCurveTo(hr * (mx + w * 0.5), hy + hr * my, hr * (x0 + w / 2), hy + hr * y0);
    ctx.strokeStyle = lg; ctx.lineWidth = 0.75; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.save(); P(0); ctx.clip();
    const L = Math.hypot(x1 - x0, y1 - y0);
    ctx.fillStyle = radial(ctx, hr * (x0 + (x1 - x0) * 0.35 + b * 0.5 - w * 0.12), hy + hr * (y0 + (y1 - y0) * 0.35), hr * L * 0.45, [[0, rgba('#ffffff', 0.26)], [1, rgba('#ffffff', 0)]]); ctx.fillRect(-hr * 2, hy - hr * 2.2, hr * 4, hr * 3.5);
    ctx.fillStyle = radial(ctx, hr * (x0 + (x1 - x0) * 0.5 + b + w * 0.4), hy + hr * my, hr * w * 0.6, [[0, rgba(sh(c, -0.6), 0.25)], [1, rgba(sh(c, -0.6), 0)]]); ctx.fillRect(-hr * 2, hy - hr * 2.2, hr * 4, hr * 3.5);
    ctx.restore();
  }
  const lobes = (ctx, hr, hy, c, line, L) => { for (const q of L) lobe(ctx, hr, hy, q, c, line); };
  const shineDot = (ctx, hr, hy, x, y, rx, ry, a) => { ctx.fillStyle = radial(ctx, hr * x, hy + hr * y, hr * rx, [[0, rgba('#ffffff', a)], [1, rgba('#ffffff', 0)]]); ctx.save(); ctx.translate(hr * x, hy + hr * y); ctx.scale(1, ry / rx); ctx.beginPath(); ctx.arc(0, 0, hr * rx, 0, PI * 2); ctx.restore(); ctx.fill(); };
  Object.assign(CF, {
    adv2: {   // 모험가 머리: 정수리 볼륨 · 둥글게 겹친 앞머리 다발 · 귀 옆 바깥으로 뻗침 · 더듬이 한 가닥
      soft: true,
      path(ctx, hr, hy, dy) { tipBang(ctx, hr, hy, dy, 1.15, [[0.98, 0.1, 0.7, -0.05], [0.45, 0.12, 0.2, -0.08], [-0.05, 0.12, -0.3, -0.08], [-0.55, 0.12, -0.8, -0.05], [-1.0, 0.08, -1.04, -0.05]]); },
      st: [],
      extra(ctx, hr, hy, c, line) {
        lobes(ctx, hr, hy, c, line, [[-0.95, -0.25, -1.24, 0.5, 0.32, -0.12], [0.95, -0.25, 1.24, 0.5, 0.32, 0.12],
          [-0.88, -0.6, -0.98, 0.22, 0.42, -0.06], [0.88, -0.6, 0.98, 0.22, 0.42, 0.06], [-0.55, -0.8, -0.62, 0.3, 0.44, -0.05], [0.55, -0.8, 0.6, 0.28, 0.44, 0.05],
          [-0.2, -0.9, -0.3, 0.26, 0.44, 0.03], [0.24, -0.9, 0.2, 0.3, 0.44, -0.03], [0.02, -0.95, 0.04, 0.2, 0.32, 0.06]]);
        lockShape(ctx, hr, hy, [[0.0, -1.08], [0.0, -1.45], [0.32, -1.55], [0.52, -1.52], [0.44, -1.42], [0.2, -1.4], [0.14, -1.08]], c, line, 0.05);
        shineDot(ctx, hr, hy, -0.4, -0.72, 0.22, 0.07, 0.5); },
    },
    softpart: {   // 부드러운 가르마컷: 가운데 가르마 · 양옆으로 흐르는 커튼 앞머리 · 끝이 바깥으로 살짝 말림
      soft: true,
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.14, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.08), Y(0.0));
        ctx.quadraticCurveTo(X(0.7), Y(-0.1), X(0.12), Y(-0.6)); ctx.lineTo(X(-0.02), Y(-0.6)); ctx.quadraticCurveTo(X(-0.6), Y(-0.1), X(-1.08), Y(0.0)); ctx.closePath(); },
      st: [],
      extra(ctx, hr, hy, c, line) {
        lobes(ctx, hr, hy, c, line, [[0.85, -0.35, 1.22, 0.48, 0.34, 0.12], [-0.85, -0.35, -1.2, 0.48, 0.34, -0.12],
          [0.62, -0.75, 1.02, 0.32, 0.4, 0.14], [-0.58, -0.75, -1.0, 0.32, 0.4, -0.14],
          [0.32, -0.9, 0.78, 0.2, 0.42, 0.16], [-0.28, -0.9, -0.74, 0.2, 0.42, -0.16],
          [0.12, -0.85, 0.48, 0.02, 0.34, 0.12], [-0.06, -0.85, -0.42, 0.02, 0.34, -0.12]]);
        ctx.beginPath(); ctx.moveTo(hr * 0.05, hy - hr * 1.04); ctx.quadraticCurveTo(hr * 0.07, hy - hr * 0.85, hr * 0.05, hy - hr * 0.6); ctx.strokeStyle = rgba(sh(c, -0.6), 0.6); ctx.lineWidth = 1.2; ctx.stroke();
        shineDot(ctx, hr, hy, -0.42, -0.75, 0.2, 0.07, 0.45); shineDot(ctx, hr, hy, 0.48, -0.75, 0.16, 0.06, 0.35); },
    },
    halftied: {   // 반묶음 꽁지머리: 오른쪽 가르마로 쓸어 넘긴 앞머리 · 얼굴을 감싸는 옆머리 · 뒤통수 위쪽에 작은 꽁지
      soft: true,
      path(ctx, hr, hy, dy) { const X = v => hr * v, Y = v => hy + hr * v + dy;
        ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.13, PI * 1.02, PI * 1.98); ctx.lineTo(X(1.06), Y(0.0));
        ctx.quadraticCurveTo(X(0.8), Y(-0.3), X(0.45), Y(-0.6)); ctx.quadraticCurveTo(X(-0.3), Y(-0.2), X(-1.06), Y(0.05)); ctx.closePath(); },
      st: [],
      extra(ctx, hr, hy, c, line) {
        lobes(ctx, hr, hy, c, line, [[-0.88, -0.35, -1.05, 0.8, 0.32, -0.08], [0.88, -0.35, 1.08, 0.62, 0.3, 0.08],
          [0.72, -0.62, 1.06, 0.3, 0.34, 0.1], [0.52, -0.82, 0.86, 0.12, 0.36, 0.1],
          [0.42, -0.92, -0.88, 0.1, 0.38, -0.4], [0.38, -0.84, -0.5, 0.26, 0.38, -0.3], [0.36, -0.74, -0.1, 0.3, 0.34, -0.18], [0.4, -0.66, 0.22, 0.24, 0.26, -0.08]]);
        ctx.beginPath(); ctx.moveTo(hr * 0.42, hy - hr * 0.98); ctx.quadraticCurveTo(hr * 0.45, hy - hr * 0.9, hr * 0.44, hy - hr * 0.7); ctx.strokeStyle = rgba(sh(c, -0.6), 0.6); ctx.lineWidth = 1.2; ctx.stroke();
        shineDot(ctx, hr, hy, -0.2, -0.78, 0.24, 0.07, 0.45); },
    },
  });
  Object.assign(SIDE, { adv2: [0.58, 0.06], softpart: [0.7, 0.08], halftied: [0.7, 0.06] });
  // 사용자가 준 머리 코드 4종 (별도 파일, 얼굴 · 몸은 쓰지 않고 머리만)
  // 맞추기: 사용자 코드의 눈 높이(y=62) → 우리 눈 높이, 정수리(EXT_TOP) → 우리 머리 위 (눈~정수리 = 머리 반지름 × 1.42)
  const EXT_TOP = { dandy_n: -137, part_v7: -152, halfup_v4: -88, part_v8: -150 };
  const EXT_W = { dandy_n: 108, part_v7: 118, halfup_v4: 92, part_v8: 118 };   // 머리 덩어리 반폭 → 우리 머리 반지름 × 1.16 (가로만 맞춤)
  const EXT_HAIR = { dandy_n: () => window.DandyCut, part_v7: () => window.SoftPartCutV7, halfup_v4: () => window.HalfUpFine, part_v8: () => window.SoftPartCutV8 };
  // ---------- 머리카락 ----------
  function hairBack(ctx, p, L) {
    const { hr, hy } = p, c = L.hair, line = sh(c, -0.3);
    const XH = EXT_HAIR[L.style] && EXT_HAIR[L.style]();
    if (XH) { const s = 1.5 * hr / (62 - EXT_TOP[L.style]), oy = hy + hr * p.eyeY - 62 * s, kx = (L.hk || 1.16) * hr / (EXT_W[L.style] * s); ctx.save(); ctx.scale(kx, 1); XH.drawBack(ctx, 0, oy, s, { hair: L.hair }); ctx.restore(); return; }   // 사용자 코드 머리 (얼굴 중심 (0,52) · 얼굴 반지름 약 86 → 우리 머리)
    ctx.beginPath();
    if (L.style === 'long' || L.style === 'wavy') {
      const bot = p.wa + 4;
      ctx.moveTo(-hr * 1.02, hy - hr * 0.1);
      ctx.bezierCurveTo(-hr * 1.25, hy + hr * 1.2, -hr * 1.15, bot, -hr * 0.95, bot + hr * 0.15);
      for (const [tx, td, vx] of [[-0.95, 0.15, -0.72], [-0.5, 0.22, -0.28], [-0.05, 0.12, 0.18], [0.42, 0.2, 0.62], [0.9, 0.14, null]]) {
        if (tx !== -0.95) ctx.quadraticCurveTo(hr * (tx - 0.08), bot, hr * tx, bot + hr * td);
        if (vx !== null) ctx.quadraticCurveTo(hr * (tx + 0.1), bot - hr * 0.02, hr * vx, bot - hr * 0.12);
      }
      ctx.bezierCurveTo(hr * 1.2, bot - 4, hr * 1.25, hy + hr, hr * 1.02, hy - hr * 0.1);
      ctx.closePath();
    } else if (L.style === 'bob') {
      const bot = hy + hr * 0.95;
      ctx.moveTo(-hr * 1.05, hy - hr * 0.1); ctx.bezierCurveTo(-hr * 1.22, hy + hr * 0.5, -hr * 1.15, bot, -hr * 0.85, bot);
      for (const [tx, td, vx] of [[-0.55, 0.12, -0.3], [-0.05, 0.08, 0.2], [0.5, 0.12, 0.75]]) { ctx.quadraticCurveTo(hr * (tx - 0.12), bot, hr * tx, bot + hr * td); ctx.quadraticCurveTo(hr * (tx + 0.1), bot, hr * vx, bot - hr * 0.08); }
      ctx.quadraticCurveTo(hr * 1.0, bot + hr * 0.05, hr * 1.02, bot + hr * 0.12); ctx.bezierCurveTo(hr * 1.2, bot, hr * 1.22, hy + hr * 0.5, hr * 1.05, hy - hr * 0.1); ctx.closePath();
    } else if (L.style === 'layer' || L.style === 'braid') {
      const bot = hy + hr * (L.style === 'layer' ? 1.05 : 1.2);
      ctx.moveTo(-hr * 1.05, hy - hr * 0.1); ctx.lineTo(-hr * 1.12, hy + hr * 0.6); ctx.lineTo(-hr * 0.95, hy + hr * 0.75); ctx.lineTo(-hr * 1.0, bot); ctx.lineTo(-hr * 0.6, bot - hr * 0.2);
      ctx.lineTo(-hr * 0.4, bot); ctx.lineTo(hr * 0.9, hy + hr * 0.7); ctx.lineTo(hr * 1.05, hy - hr * 0.1); ctx.closePath();
    } else if (L.style === 'pony' || L.style === 'pony_m') {
      ctx.arc(0, hy - 1, hr * 1.04, PI * 0.95, PI * 2.05); ctx.lineTo(hr * 0.95, hy + hr * 0.55); ctx.lineTo(-hr * 0.95, hy + hr * 0.55); ctx.closePath();
      const len = L.style === 'pony' ? 1.9 : 1.1;
      ctx.moveTo(-hr * 0.75, hy - hr * 0.75); ctx.bezierCurveTo(-hr * 1.8, hy - hr * 0.9, -hr * 1.75, hy + hr * len * 0.6, -hr * 1.35, hy + hr * len);
      ctx.bezierCurveTo(-hr * 1.2, hy + hr * len * 0.5, -hr * 1.15, hy - hr * 0.2, -hr * 0.7, hy - hr * 0.35); ctx.closePath();
    } else if (L.style === 'twin') {
      for (const s of [-1, 1]) { ctx.moveTo(s * hr * 0.9, hy - hr * 0.3); ctx.bezierCurveTo(s * hr * 1.7, hy, s * hr * 1.5, hy + hr * 1.6, s * hr * 1.15, hy + hr * 1.9); ctx.bezierCurveTo(s * hr * 1.0, hy + hr * 1.2, s * hr * 0.8, hy + hr * 0.3, s * hr * 0.7, hy - hr * 0.3); }
    } else if (L.style === 'longm') {   // 미디엄 장발: 어깨까지, 끝이 층져서 살짝 안으로
      const bot = hy + hr * 1.45;
      ctx.moveTo(-hr * 1.05, hy - hr * 0.15); ctx.bezierCurveTo(-hr * 1.28, hy + hr * 0.5, -hr * 1.22, bot - hr * 0.3, -hr * 1.08, bot);
      ctx.quadraticCurveTo(-hr * 0.85, bot - hr * 0.2, -hr * 0.7, bot + hr * 0.02); ctx.lineTo(hr * 0.7, bot + hr * 0.02); ctx.quadraticCurveTo(hr * 0.85, bot - hr * 0.2, hr * 1.08, bot);
      ctx.bezierCurveTo(hr * 1.22, bot - hr * 0.3, hr * 1.28, hy + hr * 0.5, hr * 1.05, hy - hr * 0.15); ctx.closePath();
    } else if (L.style === 'wolf' || L.style === 'wolfc') {   // 울프컷: 목덜미가 길고 끝이 바깥으로 뻗침
      ctx.moveTo(-hr * 1.05, hy - hr * 0.15);
      ctx.quadraticCurveTo(-hr * 1.22, hy + hr * 0.45, -hr * 1.1, hy + hr * 0.75); ctx.quadraticCurveTo(-hr * 1.22, hy + hr * 0.95, -hr * 1.28, hy + hr * 1.1);
      ctx.quadraticCurveTo(-hr * 1.05, hy + hr * 1.05, -hr * 0.85, hy + hr * 0.95); ctx.quadraticCurveTo(-hr * 0.7, hy + hr * 1.12, -hr * 0.45, hy + hr * 1.08);
      ctx.lineTo(hr * 0.45, hy + hr * 1.08); ctx.quadraticCurveTo(hr * 0.7, hy + hr * 1.12, hr * 0.85, hy + hr * 0.95);
      ctx.quadraticCurveTo(hr * 1.05, hy + hr * 1.05, hr * 1.28, hy + hr * 1.1); ctx.quadraticCurveTo(hr * 1.22, hy + hr * 0.95, hr * 1.1, hy + hr * 0.75);
      ctx.quadraticCurveTo(hr * 1.22, hy + hr * 0.45, hr * 1.05, hy - hr * 0.15); ctx.closePath();
    } else {
      ctx.arc(0, hy - 1, hr * 1.04, PI * 0.95, PI * 2.05); ctx.lineTo(hr * 0.95, hy + hr * 0.55); ctx.lineTo(-hr * 0.95, hy + hr * 0.55); ctx.closePath();
    }
    fillLine(ctx, grad(ctx, 0, hy - hr, 0, p.wa, [[0, sh(c, 0.08)], [0.55, sh(c, -0.1)], [1, L.hair2 || sh(c, -0.3)]]), line);
    // 결: 흐름을 따라 어두운 선 + 밝은 선 (머리 모양 안에서만)
    ctx.save(); ctx.clip(); ctx.lineCap = 'round';
    const bot2 = p.wa + 12;
    for (let i = 0; i < 9; i++) {
      const x0 = -hr * 1.5 + i * hr * 0.375, bend = x0 < 0 ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(x0 * 0.6, hy - hr * 0.6); ctx.quadraticCurveTo(x0 + bend * hr * 0.18, hy + hr * 0.6, x0 + bend * hr * 0.05, bot2);
      ctx.strokeStyle = rgba(sh(c, -0.55), 0.28); ctx.lineWidth = 0.9; ctx.stroke();
      if (i % 2 === 0) { ctx.beginPath(); ctx.moveTo(x0 * 0.6 + 1.5, hy - hr * 0.3); ctx.quadraticCurveTo(x0 + bend * hr * 0.18 + 1.5, hy + hr * 0.5, x0 + bend * hr * 0.1 + 1.5, hy + hr * 1.4); ctx.strokeStyle = rgba('#ffffff', 0.16); ctx.lineWidth = 0.8; ctx.stroke(); }
    }
    ctx.restore();
    if (L.style === 'halftied') {   // 반묶음: 뒤통수 위쪽에서 오른쪽 뒤로 삐죽 나온 작은 꽁지
      ctx.beginPath(); ctx.moveTo(hr * 0.78, hy - hr * 1.0); ctx.bezierCurveTo(hr * 1.2, hy - hr * 1.18, hr * 1.5, hy - hr * 0.95, hr * 1.42, hy - hr * 0.42);
      ctx.quadraticCurveTo(hr * 1.32, hy - hr * 0.6, hr * 1.2, hy - hr * 0.5); ctx.quadraticCurveTo(hr * 1.18, hy - hr * 0.72, hr * 0.9, hy - hr * 0.72); ctx.closePath();
      fillLine(ctx, grad(ctx, hr * 0.6, 0, hr * 1.55, 0, [[0, sh(c, 0.04)], [1, sh(c, -0.25)]]), line);
      ctx.beginPath(); ctx.ellipse(hr * 0.9, hy - hr * 0.88, hr * 0.09, hr * 0.13, 0.3, 0, PI * 2); fillLine(ctx, '#3a2a20', '#1a120c', 0.9);
    }
    if (L.style === 'tail') {   // 꽁지: 목덜미에서 작게 묶어 등 쪽으로
      const tx = -hr * 0.55, ty = hy + hr * 0.75; ctx.beginPath(); ctx.moveTo(tx + hr * 0.12, ty - hr * 0.1);
      ctx.bezierCurveTo(tx - hr * 0.45, ty + hr * 0.05, tx - hr * 0.55, ty + hr * 0.7, tx - hr * 0.42, ty + hr * 1.05); ctx.quadraticCurveTo(tx - hr * 0.25, ty + hr * 0.7, tx - hr * 0.05, ty + hr * 0.85);
      ctx.bezierCurveTo(tx - hr * 0.15, ty + hr * 0.45, tx + hr * 0.0, ty + hr * 0.15, tx + hr * 0.15, ty + hr * 0.05); ctx.closePath(); fillLine(ctx, grad(ctx, 0, ty, 0, ty + hr, [[0, sh(c, 0.02)], [1, sh(c, -0.25)]]), line);
      ctx.beginPath(); ctx.ellipse(tx + hr * 0.02, ty, hr * 0.11, hr * 0.08, 0.5, 0, PI * 2); fillLine(ctx, '#6a8a4a', '#3a5a2a', 0.9);
    }
    if (L.style === 'wavy') {   // 웨이브 롱: S자로 굽이치는 굵은 다발 여러 겹
      const bot = p.wa + 6;
      for (const sgn of [-1, 1]) for (const [x, y0, ex, w, ph, k] of [[1.06, -0.15, 0.25, 0.48, 0, 0], [0.92, 0.2, 0.3, 0.44, 1.6, 1], [1.2, 0.35, 0.15, 0.4, 3.0, 2]]) {
        const N = 18, X0 = sgn * hr * x, Y0 = hy + hr * y0, Y1 = bot + hr * ex, L1 = [], R1 = [];
        for (let i = 0; i <= N; i++) { const t = i / N, yy = Y0 + (Y1 - Y0) * t, xx = X0 + sgn * hr * 0.13 * Math.sin(ph + t * PI * 3), ww = hr * w * (t < 0.18 ? 0.35 + 0.65 * Math.sin(t / 0.18 * PI / 2) : 1 - (t - 0.18) * 0.85) / 2; L1.push([xx - ww, yy]); R1.push([xx + ww, yy]); }
        ctx.beginPath(); ctx.moveTo(...L1[0]); for (const q of L1) ctx.lineTo(...q); for (const q of R1.reverse()) ctx.lineTo(...q); ctx.closePath();
        fillLine(ctx, grad(ctx, 0, Y0, 0, Y1, [[0, sh(c, [0, 0.06, -0.06][k])], [1, L.hair2 || sh(c, -0.2)]]), line, 1.1);
        ctx.beginPath(); for (let i = 2; i <= N - 2; i++) { const t = i / N; ctx.lineTo(X0 + sgn * hr * 0.13 * Math.sin(ph + t * PI * 3) - hr * 0.05, Y0 + (Y1 - Y0) * t); } ctx.strokeStyle = rgba(sh(c, -0.55), 0.3); ctx.lineWidth = 0.8; ctx.stroke();
        ctx.beginPath(); for (let i = 1; i <= N / 2; i++) { const t = i / N; ctx.lineTo(X0 + sgn * hr * 0.13 * Math.sin(ph + t * PI * 3) + hr * 0.07, Y0 + (Y1 - Y0) * t); } ctx.strokeStyle = rgba('#ffffff', 0.2); ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
    if (L.style === 'wavy_m') {   // (남자 볼륨 웨이브: 예전 그대로)
      const n = L.style === 'wavy' ? 7 : 5, bot = L.style === 'wavy' ? p.wa + 2 : hy + hr * 0.6;
      for (const sgn of [-1, 1]) for (let i = 0; i < n; i++) { const yy = hy + (bot - hy) * (i / (n - 1)); ctx.beginPath(); ctx.arc(sgn * hr * (1.05 + 0.08 * Math.sin(i * 1.7)), yy, hr * 0.2, 0, PI * 2); fillLine(ctx, i > n * 0.6 && L.hair2 ? L.hair2 : sh(c, -0.1), line, 1.2); }
    }
    if (L.style === 'bun') { ctx.beginPath(); ctx.arc(hr * 0.15, hy - hr * 1.12, hr * 0.45, 0, PI * 2); fillLine(ctx, c, line); ctx.beginPath(); ctx.arc(hr * 0.05, hy - hr * 1.2, hr * 0.15, 0, PI * 2); ctx.fillStyle = rgba('#ffffff', 0.35); ctx.fill(); }
  }
  function hairFront(ctx, p, L) {
    const { hr, hy } = p, c = L.hair, line = sh(c, -0.3);
    const XH = EXT_HAIR[L.style] && EXT_HAIR[L.style]();
    if (XH) { const s = 1.5 * hr / (62 - EXT_TOP[L.style]), oy = hy + hr * p.eyeY - 62 * s, kx = (L.hk || 1.16) * hr / (EXT_W[L.style] * s); ctx.save(); ctx.scale(kx, 1); XH.drawFront(ctx, 0, oy, s, { hair: L.hair }); ctx.restore(); return; }   // 사용자 코드 머리 (얼굴 중심 (0,52) · 얼굴 반지름 약 86 → 우리 머리)
    // 앞머리: 뾰족한 머리 다발 (울프컷은 조금 길고 흐트러짐)
    const locks = L.style === 'wolf' ? [[-1.0, 0.42], [-0.6, 0.58], [-0.18, 0.44], [0.22, 0.62], [0.62, 0.4], [1.0, 0.3]]
      : L.gender === 'm' ? [[-1.0, 0.25], [-0.62, 0.42], [-0.22, 0.32], [0.18, 0.46], [0.58, 0.3], [1.0, 0.2]] : [[-1.02, 0.55], [-0.64, 0.44], [-0.26, 0.36], [0.12, 0.42], [0.5, 0.34], [0.86, 0.5], [1.02, 0.6]];
    const tips = [];
    const bangPath = dy => {
      ctx.beginPath(); ctx.arc(0, hy + dy, hr * 1.04, PI * 1.02, PI * 1.98);   // 정수리 덮개
      ctx.lineTo(hr * 1.03, hy - hr * 0.05 + dy);
      for (let i = locks.length - 1; i > 0; i--) {
        const [x1, d1] = locks[i], [x0] = locks[i - 1], mx = (x1 + x0) / 2, ty = hy - hr * 0.05 + hr * d1 * 0.42;
        if (!dy) tips.push([mx, ty, x0]);
        ctx.quadraticCurveTo(hr * (x1 - 0.02), hy + hr * d1 * 0.3 + dy, hr * mx, ty + dy);
        ctx.quadraticCurveTo(hr * (mx - 0.05), hy + hr * 0.05 + dy, hr * x0, hy - hr * 0.05 + dy);
      }
      ctx.closePath();
    };
    const cf = CF[L.style], bp = cf ? (dy => cf.path(ctx, hr, hy, dy)) : bangPath;
    // 이마 그림자 (앞머리 바로 아래, 얼굴 안에서만)
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, hy, hr, hr * 0.96, 0, 0, PI * 2); ctx.clip();
    bp(hr * 0.12); ctx.fillStyle = rgba(sh(L.skin, -0.5), 0.28); ctx.fill(); ctx.restore();
    bp(0);
    fillLine(ctx, grad(ctx, 0, hy - hr, 0, hy + hr * 0.5, [[0, sh(c, 0.12)], [0.7, sh(c, -0.04)], [1, sh(c, -0.2)]]), line);
    if (cf && cf.soft) softShade(ctx, bp, hr, hy, c);
    // 다발 사이 골 (어두운 짧은 선) · 다발마다 결 (밝은 선)
    ctx.save(); bp(0); ctx.clip(); ctx.lineCap = 'round';
    if (cf) for (const [x0, y0, cx, cy, x1, y1, k] of cf.st) { ctx.beginPath(); ctx.moveTo(hr * x0, hy + hr * y0); ctx.quadraticCurveTo(hr * cx, hy + hr * cy, hr * x1, hy + hr * y1);
      ctx.strokeStyle = k === 'd' ? rgba(sh(c, -0.6), 0.4) : rgba('#ffffff', 0.2); ctx.lineWidth = k === 'd' ? 1.0 : 0.9; ctx.stroke(); }
    for (const [mx, ty, x0] of tips) {
      // 골: 다발 사이에서 위로 짧게, 끝으로 갈수록 가늘게 (빗살처럼 보이지 않게 짧고 연하게)
      const g2 = ctx.createLinearGradient(0, hy, 0, hy - hr * 0.35); g2.addColorStop(0, rgba(sh(c, -0.6), 0.45)); g2.addColorStop(1, rgba(sh(c, -0.6), 0));
      ctx.beginPath(); ctx.moveTo(hr * x0, hy - hr * 0.03); ctx.quadraticCurveTo(hr * x0 * 0.95, hy - hr * 0.2, hr * x0 * 0.85, hy - hr * 0.35);
      ctx.strokeStyle = g2; ctx.lineWidth = 1.2; ctx.stroke();
      // 다발 가운데 밝은 결 하나 (짧게)
      ctx.beginPath(); ctx.moveTo(hr * (mx * 0.85 + 0.04), hy - hr * 0.42); ctx.quadraticCurveTo(hr * (mx * 0.97 + 0.04), hy - hr * 0.22, hr * (mx + 0.02), ty - hr * 0.2);
      ctx.strokeStyle = rgba('#ffffff', 0.18); ctx.lineWidth = 0.9; ctx.stroke();
    }
    ctx.restore();
    if (L.style === 'spiky') {   // 위로 솟은 머리
      for (const [x, h] of [[-0.75, 0.55], [-0.35, 0.75], [0.05, 0.85], [0.45, 0.7], [0.8, 0.5]]) { ctx.beginPath(); ctx.moveTo(hr * (x - 0.25), hy - hr * 0.8); ctx.lineTo(hr * (x + 0.08), hy - hr * (0.9 + h * 0.55)); ctx.lineTo(hr * (x + 0.28), hy - hr * 0.78); ctx.closePath(); fillLine(ctx, sh(c, 0.05), line, 1.2); }
    }
    if (L.style === 'side') {   // 한쪽으로 넘긴 앞머리
      ctx.beginPath(); ctx.moveTo(-hr * 1.0, hy - hr * 0.2); ctx.bezierCurveTo(-hr * 0.2, hy - hr * 0.95, hr * 0.7, hy - hr * 0.5, hr * 1.05, hy + hr * 0.15); ctx.quadraticCurveTo(hr * 0.4, hy - hr * 0.25, -hr * 0.6, hy + hr * 0.1); ctx.closePath(); fillLine(ctx, sh(c, 0.1), line, 1.2);
    }
    // 옆머리
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * hr * 0.98, hy - hr * 0.1);
      const sd = SIDE[L.style], sl = sd ? sd[0] : L.gender === 'm' ? 0.55 : 0.95, fl = sd ? sd[1] : 0;
      ctx.quadraticCurveTo(s * hr * 1.12, hy + hr * 0.55, s * hr * (0.9 + fl), hy + hr * sl);
      ctx.quadraticCurveTo(s * hr * 0.82, hy + hr * 0.4, s * hr * 0.78, hy + hr * 0.05); ctx.closePath();
      fillLine(ctx, grad(ctx, 0, hy, 0, hy + hr * sl, L.style === 'twoblock' ? [[0, sh(c, -0.3)], [1, sh(c, -0.4)]] : [[0, sh(c, -0.02)], [1, sh(c, -0.18)]]), line);
      ctx.beginPath(); ctx.moveTo(s * hr * 0.95, hy + hr * 0.05); ctx.quadraticCurveTo(s * hr * 1.0, hy + hr * 0.45, s * hr * (0.9 + fl * 0.8), hy + hr * (sl - 0.1));
      ctx.strokeStyle = rgba(sh(c, -0.55), 0.35); ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s * hr * 0.88, hy + hr * 0.02); ctx.quadraticCurveTo(s * hr * 0.92, hy + hr * (sl * 0.5), s * hr * (0.78 + fl * 0.6), hy + hr * (sl - 0.16));
      ctx.quadraticCurveTo(s * hr * 0.76, hy + hr * 0.4, s * hr * 0.74, hy + hr * 0.08); ctx.closePath(); fillLine(ctx, grad(ctx, 0, hy, 0, hy + hr * sl, [[0, sh(c, 0.03)], [1, sh(c, -0.14)]]), line, 1.0);
    }
    if (cf && cf.extra) cf.extra(ctx, hr, hy, c, line);
    // 윤기: 넓고 부드러운 띠 (앞머리 안에서만) + 그 위에 작은 조각
    ctx.save(); bp(0); ctx.clip(); ctx.lineCap = 'round';
    for (const [w, al] of [[0.42, 0.05], [0.28, 0.06], [0.16, 0.08]]) { ctx.beginPath(); ctx.arc(0, hy - hr * 0.08, hr * 0.78, PI * 1.1, PI * 1.7); ctx.strokeStyle = rgba('#ffffff', al); ctx.lineWidth = hr * w; ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.lineCap = 'round';
    for (const [a0, a1, w, al] of [[1.22, 1.3, 0.07, 0.4], [1.35, 1.45, 0.09, 0.48], [1.52, 1.58, 0.06, 0.34]]) { ctx.beginPath(); ctx.arc(0, hy - hr * 0.08, hr * 0.8, PI * a0, PI * a1); ctx.strokeStyle = rgba('#ffffff', al); ctx.lineWidth = hr * w; ctx.stroke(); }
    ctx.restore();
    if (L.style === 'braid') {   // 앞으로 내린 땋은 머리
      for (let i = 0; i < 7; i++) { const cx = hr * (0.95 - i * 0.03), cy = hy + hr * (0.52 + i * 0.28), rx = hr * (0.21 - i * 0.008), ry = hr * 0.17;
        for (const sgn of [-1, 1]) { ctx.save(); ctx.translate(cx + sgn * rx * 0.3, cy); ctx.rotate(sgn * 0.5); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.62, ry * 1.05, 0, 0, PI * 2);
          fillLine(ctx, grad(ctx, 0, -ry, 0, ry, [[0, sh(c, sgn > 0 ? 0.1 : 0.02)], [1, L.hair2 || sh(c, -0.18)]]), line, 1.0);
          ctx.beginPath(); ctx.ellipse(-rx * 0.1, -ry * 0.35, rx * 0.25, ry * 0.18, 0, 0, PI * 2); ctx.fillStyle = rgba('#ffffff', 0.22); ctx.fill(); ctx.restore(); } }
      ctx.beginPath(); ctx.arc(hr * 0.78, hy + hr * 2.4, hr * 0.1, 0, PI * 2); fillLine(ctx, '#e84a6a', '#a02040', 1);
    }
    if (L.acc === 'flower') { ctx.save(); ctx.translate(hr * 0.68, hy - hr * 0.58); for (let i = 0; i < 5; i++) { const a2 = i * PI * 0.4; ctx.beginPath(); ctx.ellipse(Math.cos(a2) * hr * 0.14, Math.sin(a2) * hr * 0.14, hr * 0.12, hr * 0.08, a2, 0, PI * 2); fillLine(ctx, '#ffd0e0', '#d07090', 0.8); } ctx.beginPath(); ctx.arc(0, 0, hr * 0.07, 0, PI * 2); fillLine(ctx, '#ffd86a', '#b8860b', 0.8); ctx.restore(); }
    if (L.acc === 'headband') { ctx.beginPath(); ctx.arc(0, hy, hr * 1.02, PI * 1.12, PI * 1.88); ctx.strokeStyle = '#e84a6a'; ctx.lineWidth = hr * 0.14; ctx.stroke(); }
    if (L.acc === 'feather') { ctx.save(); ctx.translate(-hr * 0.8, hy - hr * 0.6); ctx.rotate(-0.6); ctx.beginPath(); ctx.ellipse(0, -hr * 0.35, hr * 0.12, hr * 0.42, 0, 0, PI * 2); fillLine(ctx, grad(ctx, 0, -hr * 0.8, 0, 0, [[0, '#ffffff'], [1, '#7ad0ff']]), '#3a7ab0', 0.9); ctx.restore(); }
    if (L.acc === 'circlet') { ctx.beginPath(); ctx.arc(0, hy, hr * 1.0, PI * 1.15, PI * 1.85); ctx.strokeStyle = '#e8b840'; ctx.lineWidth = hr * 0.07; ctx.stroke(); ctx.save(); ctx.shadowColor = '#9ae8ff'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(hr * 0.1, hy - hr * 0.98, hr * 0.09, 0, PI * 2); fillLine(ctx, '#9ae8ff', '#1a5aa0', 0.8); ctx.restore(); }
    if (L.acc === 'pin') { ctx.save(); ctx.translate(hr * 0.62, hy - hr * 0.55); ctx.rotate(0.5); star(ctx, 0, 0, hr * 0.2, '#ffd86a', '#b8860b'); ctx.restore(); }
    if (L.acc === 'ribbon') { ctx.save(); ctx.translate(-hr * 0.55, hy - hr * 0.72); for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * hr * 0.32, -hr * 0.18); ctx.lineTo(s * hr * 0.32, hr * 0.18); ctx.closePath(); fillLine(ctx, '#ff7aa8', '#c04070', 1.2); } ctx.beginPath(); ctx.arc(0, 0, hr * 0.08, 0, PI * 2); fillLine(ctx, '#ff9ac0', '#c04070', 1); ctx.restore(); }
  }
  function star(ctx, x, y, r, c, line) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); fillLine(ctx, c, line, 1); }

  // ---------- 얼굴 ----------
  // ---------- 눈 11종 (남 5 · 여 6): 눈 모양 · 눈꺼풀 · 눈동자 · 반짝임 · 속눈썹 · 눈썹 · 입을 함께 정함 ----------
  // k: [가로, 세로] 배율, tilt: 눈꼬리(음수 = 올라감), lid: 윗눈꺼풀이 덮는 정도, ir/pu: 눈동자 · 동공 크기, hl: 반짝임 [x, y, 크기]
  // brow: [안쪽 높이, 바깥 높이, 아치, 굵기], mouth: 입 모양
  const EYE2 = {
    m_sharp:  { k: [1.05, 0.8], tilt: -0.2, lid: 0.16, ir: 0.64, pu: 0.3, hl: [[-0.25, -0.2, 0.22]], lw: 3.0, brow: [-0.92, -1.12, 0.06, 2.8], mouth: 'smile' },
    m_gentle: { k: [1.05, 0.96], tilt: 0.14, lid: 0.04, ir: 0.8, pu: 0.36, hl: [[-0.26, -0.24, 0.3], [0.32, 0.26, 0.13]], lw: 2.3, brow: [-1.02, -0.98, 0.26, 2.0], mouth: 'smile' },
    m_smart:  { k: [1.14, 0.74], tilt: -0.04, lid: 0.12, ir: 0.6, pu: 0.28, hl: [[-0.22, -0.18, 0.18], [0.3, 0.2, 0.08]], lw: 2.4, brow: [-0.98, -1.04, 0.1, 1.6], mouth: 'small' },
    m_strong: { k: [1.0, 0.72], tilt: -0.12, lid: 0.24, ir: 0.62, pu: 0.3, hl: [[-0.22, -0.1, 0.18]], lw: 3.0, brow: [-0.78, -1.12, 0.04, 3.4], mouth: 'firm' },
    m_cold:   { k: [1.1, 0.64], tilt: -0.08, lid: 0.34, ir: 0.5, pu: 0.26, hl: [[-0.18, 0.0, 0.12]], lw: 2.9, brow: [-0.82, -0.88, 0.0, 2.4], mouth: 'flat' },
    f_round:  { k: [1.08, 1.15], tilt: 0, lid: 0, ir: 0.86, pu: 0.42, hl: [[-0.28, -0.26, 0.32], [0.32, 0.3, 0.13]], lw: 2.6, wing: 1, brow: [-1.12, -1.08, 0.22, 1.5], mouth: 'smile' },
    f_mystic: { k: [1.05, 1.05], tilt: -0.06, lid: 0.08, ir: 0.84, pu: 0.34, two: '#b070e0', star: 1, hl: [[0.3, 0.3, 0.1]], lw: 2.6, wing: 2, lower: 1, brow: [-1.1, -1.08, 0.18, 1.4], mouth: 'small' },
    f_bright: { closed: 1, wing: 2, brow: [-1.14, -1.1, 0.28, 1.4], mouth: 'grin', blush: 0.55 },
    f_fire:   { k: [1.05, 1.0], tilt: -0.16, lid: 0.06, ir: 0.86, pu: 0.3, fire: 1, hl: [[-0.26, -0.24, 0.26], [0.3, 0.26, 0.1]], lw: 2.8, wing: 2, brow: [-0.98, -1.12, 0.1, 1.7], mouth: 'smile' },
    f_playful:{ k: [1.05, 1.0], tilt: 0, lid: 0.12, ir: 0.82, pu: 0.36, look: 0.22, wink: 1, hl: [[-0.15, -0.22, 0.26], [0.36, 0.26, 0.1]], lw: 2.6, wing: 1, brow: [-1.06, -1.16, 0.2, 1.5], mouth: 'smirk' },
    f_sparkle:{ k: [1.12, 1.22], tilt: 0, lid: 0, ir: 0.88, pu: 0.4, star: 1, hl: [[-0.3, -0.3, 0.3], [0.3, -0.05, 0.12], [0.05, 0.36, 0.1]], lw: 2.6, wing: 1, lower: 1, brow: [-1.14, -1.1, 0.24, 1.4], mouth: 'smile' },
  };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function sparkle(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, q = i % 2 ? r * 0.3 : r; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); }
  function face2(ctx, p, L) {
    const { hr, hy } = p, ey = hy + hr * p.eyeY, ew = hr * p.eyeW, eh = hr * p.eyeH, ec = L.eyeColor || '#3a5ac0', D = EYE2[L.eye], lash = '#2a1a22';
    const XS = [-hr * 0.34, hr * 0.46];
    // 눈썹: 안쪽은 굵고 바깥으로 가늘어지는 모양
    const [bi, bo, ba, bt] = D.brow;
    for (const ex of XS) { const out = ex > 0 ? 1 : -1, xi = ex - out * ew * 0.85, xo = ex + out * ew * 1.0, yi = ey + eh * bi, yo = ey + eh * bo, cx = (xi + xo) / 2, cy = (yi + yo) / 2 - eh * ba;
      ctx.beginPath(); ctx.moveTo(xi, yi - bt * 0.5); ctx.quadraticCurveTo(cx, cy - bt * 0.45, xo, yo); ctx.quadraticCurveTo(cx, cy + bt * 0.55, xi, yi + bt * 0.5); ctx.closePath(); ctx.fillStyle = sh(L.hair, -0.35); ctx.fill(); }
    XS.forEach((ex, idx) => {
      const out = ex > 0 ? 1 : -1;
      if (D.closed || (D.wink && idx === 0)) {   // 감은 눈: 웃는 반달 + 속눈썹
        ctx.beginPath(); ctx.ellipse(ex, ey + eh * 0.1, ew * 1.0, eh * 0.42, 0, PI * 1.08, PI * 1.92); ctx.strokeStyle = lash; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.stroke();
        if (D.wing || D.closed) { ctx.beginPath(); ctx.moveTo(ex + out * ew * 0.92, ey - eh * 0.08); ctx.lineTo(ex + out * ew * 1.28, ey - eh * 0.3); ctx.lineWidth = 1.5; ctx.stroke(); }
        return;
      }
      const w = ew * D.k[0], h = eh * D.k[1];
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(D.tilt * out);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, w, h * 0.62, 0, 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
      const ix = w * (0.08 + (D.look || 0) * -1), iy = h * 0.05, irx = w * D.ir, iry = h * 0.6 * (D.ir / 0.82);
      ctx.beginPath(); ctx.ellipse(ix, iy, irx, iry, 0, 0, PI * 2);
      if (D.fire) ctx.fillStyle = radial(ctx, ix, iy + iry * 0.15, irx * 1.05, [[0, '#ffe066'], [0.35, '#ff9a2a'], [0.75, ec], [1, sh(ec, -0.5)]]);
      else if (D.two) ctx.fillStyle = grad(ctx, 0, iy - iry, 0, iy + iry, [[0, sh(ec, -0.5)], [0.45, ec], [1, D.two]]);
      else ctx.fillStyle = grad(ctx, 0, iy - iry, 0, iy + iry, [[0, sh(ec, -0.55)], [0.55, ec], [1, sh(ec, 0.45)]]);
      ctx.fill();
      ctx.lineWidth = 0.8; ctx.strokeStyle = sh(ec, -0.6); ctx.stroke();
      if (D.fire) for (let i = 0; i < 6; i++) { const a = -PI / 2 + (i - 2.5) * 0.45; ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * irx * 0.3, iy + Math.sin(a) * iry * 0.3); ctx.quadraticCurveTo(ix + Math.cos(a + 0.25) * irx * 0.7, iy + Math.sin(a + 0.25) * iry * 0.7, ix + Math.cos(a) * irx * 0.92, iy + Math.sin(a) * iry * 0.92); ctx.strokeStyle = 'rgba(255,230,120,0.7)'; ctx.lineWidth = 0.9; ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(ix + w * 0.02, iy, w * D.pu, h * D.pu * 0.8, 0, 0, PI * 2); ctx.fillStyle = sh(ec, -0.75); ctx.fill();
      // 윗눈꺼풀이 덮는 부분 (피부색) + 그림자
      const lidY = -h * 0.62 + D.lid * h * 1.24;
      if (D.lid > 0) { ctx.beginPath(); ctx.moveTo(-w * 1.2, -h); ctx.lineTo(w * 1.2, -h); ctx.lineTo(w * 1.2, lidY); ctx.quadraticCurveTo(0, lidY - h * 0.14, -w * 1.2, lidY); ctx.closePath(); ctx.fillStyle = sh(L.skin, -0.04); ctx.fill(); }
      ctx.fillStyle = grad(ctx, 0, lidY, 0, lidY + h * 0.35, [[0, 'rgba(60,30,40,0.28)'], [1, 'rgba(60,30,40,0)']]); ctx.fillRect(-w * 1.2, lidY, w * 2.4, h * 0.4);
      ctx.restore();
      // 반짝임
      for (const [hx2, hy2, r] of D.hl) { ctx.beginPath(); ctx.arc(ix + w * hx2, iy + h * hy2, w * r, 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }
      if (D.star) sparkle(ctx, ix - w * 0.28, iy - h * 0.24, w * 0.34);
      // 윗 속눈썹 (눈꺼풀 선)
      ctx.beginPath();
      if (D.lid > 0.1) { ctx.moveTo(-w * 1.05, lidY + h * 0.04); ctx.quadraticCurveTo(0, lidY - h * 0.16, w * 1.05, lidY + h * 0.04); }
      else ctx.ellipse(0, 0, w * 1.06, h * 0.65, 0, PI * 1.06, PI * 1.94);
      ctx.strokeStyle = lash; ctx.lineWidth = D.lw; ctx.lineCap = 'round'; ctx.stroke();
      if (D.wing) for (let i = 0; i < D.wing; i++) { ctx.beginPath(); ctx.moveTo(out * w * (0.95 - i * 0.18), -h * (0.3 + i * 0.12)); ctx.lineTo(out * w * (1.38 - i * 0.12), -h * (0.5 + i * 0.2)); ctx.lineWidth = 1.5; ctx.stroke(); }
      if (D.lower) { ctx.beginPath(); ctx.ellipse(0, 0, w * 0.95, h * 0.62, 0, PI * (out > 0 ? 0.08 : 0.72), PI * (out > 0 ? 0.28 : 0.92)); ctx.lineWidth = 1.1; ctx.stroke(); }
      ctx.restore();
    });
    // 볼터치
    for (const bx of [-hr * 0.55, hr * 0.7]) { ctx.beginPath(); ctx.ellipse(bx, ey + eh * 0.75, ew * 0.9, eh * 0.22, 0, 0, PI * 2); ctx.fillStyle = `rgba(255,120,140,${D.blush || (L.gender === 'f' ? 0.38 : 0.25)})`; ctx.fill(); }
    // 입
    const mx = hr * 0.1, my = ey + eh * 1.0; ctx.strokeStyle = '#a0505a'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath();
    if (D.mouth === 'grin') { ctx.moveTo(mx - hr * 0.13, my - eh * 0.05); ctx.quadraticCurveTo(mx, my + eh * 0.45, mx + hr * 0.13, my - eh * 0.05); ctx.closePath(); ctx.fillStyle = '#c04a5a'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(mx, my + eh * 0.18, hr * 0.06, eh * 0.08, 0, 0, PI); ctx.fillStyle = '#ff8a9a'; ctx.fill(); }
    else if (D.mouth === 'smirk') { ctx.moveTo(mx - hr * 0.08, my + eh * 0.05); ctx.quadraticCurveTo(mx + hr * 0.04, my + eh * 0.12, mx + hr * 0.14, my - eh * 0.1); ctx.stroke(); }
    else if (D.mouth === 'flat') { ctx.moveTo(mx - hr * 0.06, my + eh * 0.05); ctx.lineTo(mx + hr * 0.07, my + eh * 0.05); ctx.stroke(); }
    else if (D.mouth === 'firm') { ctx.moveTo(mx - hr * 0.08, my + eh * 0.08); ctx.quadraticCurveTo(mx, my + eh * 0.0, mx + hr * 0.09, my + eh * 0.08); ctx.stroke(); }
    else if (D.mouth === 'small') { ctx.moveTo(mx - hr * 0.05, my); ctx.quadraticCurveTo(mx, my + eh * 0.12, mx + hr * 0.06, my); ctx.stroke(); }
    else { ctx.moveTo(mx - hr * 0.08, my - eh * 0.03); ctx.quadraticCurveTo(mx, my + eh * 0.2, mx + hr * 0.1, my - eh * 0.03); ctx.stroke(); }
    if (L.stubble) {   // 수염: 점 대신 턱 · 윗입술에 은은한 그림자
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, hy, hr, hr * 0.96, 0, 0, PI * 2); ctx.clip();
      ctx.fillStyle = radial(ctx, mx, hy + hr * 0.85, hr * 0.75, [[0, rgba(sh(L.hair, -0.3), 0.3)], [0.6, rgba(sh(L.hair, -0.3), 0.18)], [1, rgba(sh(L.hair, -0.3), 0)]]); ctx.fillRect(-hr * 1.2, hy, hr * 2.4, hr * 1.2);
      ctx.fillStyle = radial(ctx, mx, my - eh * 0.2, hr * 0.2, [[0, rgba(sh(L.hair, -0.3), 0.22)], [1, rgba(sh(L.hair, -0.3), 0)]]); ctx.fillRect(mx - hr * 0.3, my - eh * 0.5, hr * 0.6, eh * 0.4);
      ctx.restore(); }
  }
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
  // ---------- 여자 눈 시안 A (1차 4종, 사용자 함수 drawCustomizedFemaleEyePart1 반영) ----------
  // 눈 하나 기준 좌표(가로 ±9~10), 바깥쪽 = +x. 고친 점: 왼쪽 눈 좌우 뒤집기 · 우리 얼굴 크기에 맞춤 · 입 · 볼 홍조 · 바깥 속눈썹
  //  · 장난기 눈은 원래 함수에서 색 · 크기만 달라 장난기가 안 보여서, 눈동자를 바깥쪽으로 흘기고 입꼬리를 한쪽만 올림
  const F4 = {
    mystical:       { rx: 10, ry: 6.5, irs: [0.7, 0.75], top: '#4C1D95', bot: '#8B5CF6', pu: 3.0, hl: 1.4, lift: -7, lw: 2.2, browY: -14, mouth: 'small' },
    bright_smile:   { smile: 1, browY: -14, mouth: 'grin' },
    intellectual_f: { rx: 9, ry: 5, irs: [0.7, 0.75], top: null, bot: '#9A3412', pu: 2.4, hl: 1.0, lift: -6, lw: 1.8, browY: -14, mouth: 'neat' },
    mischievous:    { rx: 9.5, ry: 6, irs: [0.7, 0.75], top: '#374151', bot: '#6B7280', pu: 2.4, hl: 1.0, lift: -6, lw: 1.8, browY: -15, look: 2.2, mouth: 'smirk' },
  };
  // ---------- 여자 눈 시안 B (2차 4종, 사용자 함수 drawCustomizedFemaleEyePart2 반영) ----------
  //  · 단호한 눈: 원래 눈썹은 안쪽이 높고 바깥이 낮아(걱정하는 표정) 안쪽이 낮게(단호하게) 뒤집음
  Object.assign(F4, {
    determined:    { browPoly: [[-9, -10.5], [9, -14], [9, -11], [-9, -7.6]], rx: 9, ry: 4.8, irs: [0.7, 0.75], top: null, bot: '#44403C', pu: 2.2, hl: 1.0, lift: -5, lw: 2.2, lash: 0, mouth: 'firm' },
    round_big:     { rx: 9, ry: 7.5, irs: [0.7, 0.75], top: null, bot: '#3B82F6', pu: 3.2, hl: 1.0, hl2: 1, lift: -6, lw: 2.0, browY: -15, mouth: 'smile' },
    soft_gentle_f: { rx: 9, ry: 5.5, irs: [0.7, 0.75], top: null, bot: '#B45309', pu: 2.2, hl: 1.0, lift: -6, lw: 2.0, browY: -14, mouth: 'smile' },
    clear_sharp:   { rx: 9, ry: 5.2, irs: [0.7, 0.75], top: null, bot: '#2563EB', pu: 2.2, hl: 1.0, lift: -6, lw: 2.0, browY: -14, mouth: 'small' },
  });
  function f4eye(ctx, S, ec, out) {
    // 눈썹
    if (S.browPoly) { ctx.beginPath(); S.browPoly.forEach((q, i) => i ? ctx.lineTo(...q) : ctx.moveTo(...q)); ctx.closePath(); ctx.fillStyle = '#27272A'; ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-9, -12); ctx.quadraticCurveTo(0, S.browY, 9, -12); ctx.lineWidth = 1.8; ctx.strokeStyle = '#3B271A'; ctx.lineCap = 'round'; ctx.stroke(); }
    if (S.smile) {   // 화사한 웃음: 반달 눈 + 바깥 속눈썹
      ctx.beginPath(); ctx.ellipse(0, 4.2, 8, 4.4, 0, PI, 0, false); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1E1B18'; ctx.stroke();   // 원래 반원(높이 8)은 세로로 늘린 우리 눈에서 너무 높아 납작하게 · 조금 아래로
      ctx.beginPath(); ctx.moveTo(7.6, 2.4); ctx.lineTo(10.8, -0.4); ctx.lineWidth = 2; ctx.stroke(); return;
    }
    // 흰자 (안쪽만 그리도록 자름)
    ctx.beginPath(); ctx.ellipse(0, 0, S.rx, S.ry, 0, 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.clip();
    const ix = (S.look || 0);   // 장난기: 바깥쪽으로 흘김 (좌우 뒤집기 때문에 두 눈이 같은 방향이 되도록 out 으로 보정)
    const lx = ix * out;
    const g = ctx.createRadialGradient(lx, -1, 1, lx, 0, S.rx * 0.8); g.addColorStop(0, S.top || ec || '#451A03'); g.addColorStop(1, S.bot);
    ctx.beginPath(); ctx.ellipse(lx, 0, S.rx * S.irs[0], S.ry * S.irs[1], 0, 0, PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, 0, S.pu, 0, PI * 2); ctx.fillStyle = '#0F172A'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx - 2, -2, S.hl, 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    if (S.hl2) { ctx.beginPath(); ctx.arc(lx + 2, 2, 0.6, 0, PI * 2); ctx.fill(); }
    ctx.fillStyle = grad(ctx, 0, -S.ry, 0, -S.ry + 3, [[0, 'rgba(50,30,40,0.25)'], [1, 'rgba(50,30,40,0)']]); ctx.fillRect(-S.rx, -S.ry, S.rx * 2, 3);
    ctx.restore();
    // 윗눈꺼풀 선 + 바깥 속눈썹 1개
    ctx.beginPath(); ctx.moveTo(-S.rx, -1); ctx.quadraticCurveTo(0, S.lift, S.rx, -1); ctx.lineWidth = S.lw; ctx.strokeStyle = '#1E1B18'; ctx.stroke();
    if (S.lash !== 0) { ctx.beginPath(); ctx.moveTo(S.rx - 0.8, -1.6); ctx.lineTo(S.rx + 2.6, -4.6); ctx.lineWidth = 1.6; ctx.stroke(); }
  }
  function faceF4(ctx, p, L) {
    const { hr, hy } = p, ey = hy + hr * p.eyeY, ew = hr * p.eyeW, eh = hr * p.eyeH, S = F4[L.eye], ec = L.eyeColor || '#451A03';
    const u = ew * 1.2 / 9;
    for (const [ex, out] of [[-hr * 0.34, -1], [hr * 0.46, 1]]) { ctx.save(); ctx.translate(ex, ey); ctx.scale(out * u, u * 1.3); f4eye(ctx, S, ec, out); ctx.restore(); }
    for (const bx of [-hr * 0.55, hr * 0.7]) { ctx.beginPath(); ctx.ellipse(bx, ey + eh * 0.75, ew * 0.9, eh * 0.22, 0, 0, PI * 2); ctx.fillStyle = `rgba(255,120,140,${S.smile ? 0.5 : 0.36})`; ctx.fill(); }
    const mx = hr * 0.1, my = ey + eh * 1.0; ctx.strokeStyle = '#a0505a'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath();
    if (S.mouth === 'grin') { ctx.moveTo(mx - hr * 0.12, my - eh * 0.04); ctx.quadraticCurveTo(mx, my + eh * 0.42, mx + hr * 0.12, my - eh * 0.04); ctx.closePath(); ctx.fillStyle = '#c04a5a'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(mx, my + eh * 0.17, hr * 0.055, eh * 0.07, 0, 0, PI); ctx.fillStyle = '#ff8a9a'; ctx.fill(); return; }
    if (S.mouth === 'smirk') { ctx.moveTo(mx - hr * 0.08, my + eh * 0.05); ctx.quadraticCurveTo(mx + hr * 0.04, my + eh * 0.12, mx + hr * 0.14, my - eh * 0.1); }
    else if (S.mouth === 'firm') { ctx.moveTo(mx - hr * 0.07, my + eh * 0.08); ctx.quadraticCurveTo(mx, my + eh * 0.02, mx + hr * 0.08, my + eh * 0.08); }
    else if (S.mouth === 'neat') { ctx.moveTo(mx - hr * 0.05, my + eh * 0.03); ctx.quadraticCurveTo(mx, my + eh * 0.09, mx + hr * 0.06, my + eh * 0.03); }
    else { ctx.moveTo(mx - hr * 0.06, my); ctx.quadraticCurveTo(mx, my + eh * 0.14, mx + hr * 0.07, my); }
    ctx.stroke();
  }
  function face(ctx, p, L) {
    if (M5[L.eye]) return faceM5(ctx, p, L);
    if (F4[L.eye]) return faceF4(ctx, p, L);
    if (EYE2[L.eye]) return face2(ctx, p, L);
    const { hr, hy } = p, ey = hy + hr * p.eyeY, ew = hr * p.eyeW, eh = hr * p.eyeH, ec = L.eyeColor || '#3a5ac0';
    // 눈썹
    for (const ex of [-hr * 0.34, hr * 0.46]) {
      ctx.beginPath(); ctx.moveTo(ex - ew * 0.9, ey - eh * 0.95); ctx.quadraticCurveTo(ex, ey - eh * (L.eye === 'sharp' ? 0.95 : 1.15), ex + ew * 0.9, ey - eh * (L.eye === 'sharp' ? 1.15 : 0.95));
      ctx.strokeStyle = sh(L.hair, -0.35); ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.stroke();
    }
    const E = L.eye || 'round';
    const k = { round: [1, 1], big: [1.1, 1.2], sharp: [1.0, 0.72], soft: [1.02, 0.92], sleepy: [1.02, 0.9], cat: [1.05, 0.9], smile: [1, 1] }[E] || [1, 1];
    for (const ex of [-hr * 0.34, hr * 0.46]) {
      const w = ew * k[0], h = eh * k[1], out = ex > 0 ? 1 : -1;   // out: 바깥쪽 방향
      if (E === 'smile') {   // 웃는 눈: ∩ 모양
        ctx.beginPath(); ctx.ellipse(ex, ey + h * 0.15, w, h * 0.45, 0, PI * 1.05, PI * 1.95); ctx.strokeStyle = '#2a1a22'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke(); continue;
      }
      const tilt = E === 'cat' || E === 'sharp' ? -0.22 * out : E === 'soft' ? 0.18 * out : 0;
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(tilt);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, w, h * 0.62, 0, 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
      ctx.beginPath(); ctx.ellipse(w * 0.08, h * 0.05, w * 0.82, h * 0.6, 0, 0, PI * 2);
      ctx.fillStyle = grad(ctx, 0, -h * 0.6, 0, h * 0.6, [[0, sh(ec, -0.55)], [0.55, ec], [1, sh(ec, 0.45)]]); ctx.fill();
      ctx.beginPath(); if (E === 'cat') ctx.ellipse(w * 0.1, h * 0.05, w * 0.12, h * 0.42, 0, 0, PI * 2); else ctx.ellipse(w * 0.1, h * 0.05, w * 0.38, h * 0.3, 0, 0, PI * 2); ctx.fillStyle = sh(ec, -0.7); ctx.fill();
      if (E === 'sleepy') { ctx.fillStyle = sh(L.skin, -0.04); ctx.fillRect(-w * 1.2, -h * 0.8, w * 2.4, h * 0.65); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(-w * 0.25, -h * (E === 'sleepy' ? 0.02 : 0.22), w * (E === 'big' ? 0.34 : 0.26), 0, PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.35, h * 0.25, w * 0.13, 0, PI * 2); ctx.fill();
      if (E === 'big') { ctx.beginPath(); ctx.arc(w * 0.05, h * 0.38, w * 0.08, 0, PI * 2); ctx.fill(); }
      // 윗 속눈썹 (나른한 눈은 눈꺼풀 선이 낮음)
      ctx.beginPath(); if (E === 'sleepy') { ctx.moveTo(-w * 1.05, -h * 0.12); ctx.quadraticCurveTo(0, -h * 0.28, w * 1.05, -h * 0.12); } else ctx.ellipse(0, 0, w * 1.08, h * 0.66, 0, PI * 1.08, PI * 1.92);
      ctx.strokeStyle = '#2a1a22'; ctx.lineWidth = E === 'sharp' ? 2.8 : 2.4; ctx.lineCap = 'round'; ctx.stroke();
      if (L.gender === 'f' || E === 'cat') { ctx.beginPath(); ctx.moveTo(out * w * 0.98, -h * 0.3); ctx.lineTo(out * w * 1.4, -h * (E === 'cat' ? 0.62 : 0.48)); ctx.lineWidth = 1.6; ctx.stroke(); }
      ctx.restore();
    }
    if (L.acc === 'glasses') { ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 1.3; for (const ex of [-hr * 0.34, hr * 0.46]) { ctx.beginPath(); ctx.ellipse(ex, ey, ew * 1.35, eh * 0.78, 0, 0, PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-hr * 0.34 + ew * 1.35, ey); ctx.lineTo(hr * 0.46 - ew * 1.35, ey); ctx.stroke(); }
    // 볼터치 · 입
    for (const bx of [-hr * 0.55, hr * 0.7]) { ctx.beginPath(); ctx.ellipse(bx, ey + eh * 0.75, ew * 0.9, eh * 0.22, 0, 0, PI * 2); ctx.fillStyle = 'rgba(255,120,140,0.35)'; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(hr * 0.02, ey + eh * 0.95); ctx.quadraticCurveTo(hr * 0.1, ey + eh * 1.15, hr * 0.2, ey + eh * 0.95); ctx.strokeStyle = '#a0505a'; ctx.lineWidth = 1.4; ctx.stroke();
    if (L.mask) { ctx.fillStyle = L.mask; rr(ctx, -hr * 0.95, ey - eh * 0.5, hr * 1.95, eh * 1.0, 3); ctx.fill(); for (const ex of [-hr * 0.34, hr * 0.46]) { ctx.beginPath(); ctx.ellipse(ex, ey, ew * 0.7, eh * 0.28, 0, 0, PI * 2); ctx.fillStyle = '#ffe9a0'; ctx.fill(); } }
  }

  // ---------- 몸 ----------
  function body(ctx, p, L, O, t) {
    const { sh: sy, wa, bw } = p, skin = L.skin;
    const top = O.top, bot = O.bottom, setSky = O.kind === 'sky';
    const skirt = L.gender === 'f' && O.kind !== 'bandit' && O.kind !== 'mage' && O.skirt !== false;
    // 다리 (허벅지 → 발목으로 가늘어짐)
    for (const sgn of [-1, 1]) {
      const lx = sgn * bw * 0.4, legC = setSky ? '#c8d4f4' : (L.gender === 'f' && O.kind !== 'bandit' ? skin : sh(bot, -0.08));
      ctx.beginPath(); ctx.moveTo(lx - 4.6, wa - 1); ctx.lineTo(lx + 4.6, wa - 1);
      ctx.quadraticCurveTo(lx + 4.4, wa * 0.45, lx + 3.0, -5); ctx.lineTo(lx - 3.0, -5); ctx.quadraticCurveTo(lx - 4.4, wa * 0.45, lx - 4.6, wa - 1); ctx.closePath();
      fillLine(ctx, grad(ctx, lx - 4, 0, lx + 4, 0, [[0, sh(legC, -0.15)], [0.5, sh(legC, 0.08)], [1, sh(legC, -0.1)]]), sh(legC, -0.35));
      // 신발: 둥근 앞코
      ctx.beginPath(); ctx.moveTo(lx - 3.6, -7); ctx.quadraticCurveTo(lx - 4.6, -1.5, lx - 2, 0); ctx.lineTo(lx + 6.5, 0); ctx.bezierCurveTo(lx + 9, 0, lx + 8.5, -4.5, lx + 4.5, -5.6); ctx.quadraticCurveTo(lx + 3.6, -7.4, lx - 3.6, -7); ctx.closePath();
      const shoeC = setSky ? '#3a4a8a' : (O.shoe || sh(bot, -0.35));
      if (O.boots) { rr(ctx, lx - 4, -15, 8.2, 9, 2.5); fillLine(ctx, sh(shoeC, 0.05), sh(shoeC, -0.5), 1.1); }
      fillLine(ctx, grad(ctx, 0, -7, 0, 0, [[0, sh(shoeC, 0.15)], [1, sh(shoeC, -0.2)]]), sh(shoeC, -0.5), 1.4);
      if (setSky) { ctx.fillStyle = '#ffd86a'; ctx.fillRect(lx - 3.6, -7.6, 8, 1.4); }
      ctx.beginPath(); ctx.ellipse(lx + 4, -4.4, 2, 0.9, -0.2, 0, PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    }
    // 치마 / 허리 아래
    if (O.kind === 'mage') {   // 긴 로브 자락 (남녀)
      ctx.beginPath(); ctx.moveTo(-bw * 0.92, wa - 3); ctx.lineTo(bw * 0.92, wa - 3); ctx.lineTo(bw * 1.2, -6); ctx.quadraticCurveTo(0, -3, -bw * 1.2, -6); ctx.closePath();
      fillLine(ctx, grad(ctx, 0, wa, 0, -6, [[0, sh(top, 0.05)], [1, sh(top, -0.3)]]), sh(top, -0.45)); ctx.strokeStyle = O.trim || '#e8c060'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-bw * 1.18, -6.5); ctx.quadraticCurveTo(0, -3.5, bw * 1.18, -6.5); ctx.stroke();
    } else if (skirt) {
      ctx.beginPath(); ctx.moveTo(-bw * 0.92, wa - 3); ctx.lineTo(bw * 0.92, wa - 3); ctx.lineTo(bw * 1.28, wa + 13); ctx.quadraticCurveTo(0, wa + 17, -bw * 1.28, wa + 13); ctx.closePath();
      fillLine(ctx, setSky ? grad(ctx, 0, wa, 0, wa + 15, [[0, '#4a62b8'], [1, '#2a3a7a']]) : grad(ctx, 0, wa, 0, wa + 15, [[0, sh(bot, 0.1)], [1, sh(bot, -0.25)]]), sh(setSky ? '#2a3a7a' : bot, -0.45));
      ctx.strokeStyle = rgba('#000000', 0.18); ctx.lineWidth = 1; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * bw * 0.32, wa); ctx.lineTo(i * bw * 0.45, wa + 13); ctx.stroke(); }
      if (setSky) { ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-bw * 1.26, wa + 12.5); ctx.quadraticCurveTo(0, wa + 16.5, bw * 1.26, wa + 12.5); ctx.stroke(); }
    }
    // 목 + 턱 그림자
    ctx.beginPath(); ctx.moveTo(-3.2, sy - 6); ctx.lineTo(3.2, sy - 6); ctx.lineTo(3.6, sy + 2); ctx.lineTo(-3.6, sy + 2); ctx.closePath(); fillLine(ctx, sh(skin, -0.12), null);
    // 몸통 (둥근 어깨 → 살짝 들어간 허리 → 엉덩이)
    const tc = setSky ? '#c8d8ff' : top, wIn = L.gender === 'f' ? 0.74 : 0.84;
    ctx.beginPath(); ctx.moveTo(-3.6, sy - 0.5);
    ctx.bezierCurveTo(-bw * 0.6, sy - 1.5, -bw * 1.02, sy - 0.2, -bw * 1.0, sy + 4.5);
    ctx.bezierCurveTo(-bw * 0.98, sy + (wa - sy) * 0.5, -bw * wIn, wa - (wa - sy) * 0.25, -bw * (wIn + 0.06), wa);
    ctx.lineTo(bw * (wIn + 0.06), wa);
    ctx.bezierCurveTo(bw * wIn, wa - (wa - sy) * 0.25, bw * 0.98, sy + (wa - sy) * 0.5, bw * 1.0, sy + 4.5);
    ctx.bezierCurveTo(bw * 1.02, sy - 0.2, bw * 0.6, sy - 1.5, 3.6, sy - 0.5); ctx.closePath();
    fillLine(ctx, grad(ctx, -bw, 0, bw, 0, [[0, sh(tc, -0.22)], [0.45, sh(tc, 0.08)], [1, sh(tc, -0.12)]]), sh(tc, -0.45));
    // 옷 주름
    ctx.strokeStyle = rgba('#000000', 0.12); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-bw * 0.35, sy + 6); ctx.quadraticCurveTo(-bw * 0.42, (sy + wa) / 2, -bw * 0.3, wa - 2); ctx.stroke();
    if (O.kind === 'sailor') {   // 세일러 깃 + 리본
      ctx.beginPath(); ctx.moveTo(-bw * 0.85, sy); ctx.lineTo(0, sy + (wa - sy) * 0.55); ctx.lineTo(bw * 0.85, sy); ctx.lineTo(bw * 0.4, sy); ctx.lineTo(0, sy + (wa - sy) * 0.3); ctx.lineTo(-bw * 0.4, sy); ctx.closePath(); fillLine(ctx, O.navy || '#2a3a7a', '#1a2050', 1.2);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-bw * 0.7, sy + 1); ctx.lineTo(0, sy + (wa - sy) * 0.47); ctx.lineTo(bw * 0.7, sy + 1); ctx.stroke();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, sy + (wa - sy) * 0.55); ctx.lineTo(s * 5, sy + (wa - sy) * 0.42); ctx.lineTo(s * 5, sy + (wa - sy) * 0.72); ctx.closePath(); fillLine(ctx, '#e84a5a', '#a02030', 1); }
    }
    const midY = (sy + wa) / 2;
    if (O.kind === 'vest' || O.kind === 'scholar') {   // 조끼 (초보 모험가: 가죽 · 학자: 남색 + 나비넥타이)
      const vc = O.vest || '#7a4a2a';
      for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sgn * 2, sy + 1); ctx.lineTo(sgn * bw * 0.95, sy + 3); ctx.lineTo(sgn * bw * 0.86, wa); ctx.lineTo(sgn * 2.5, wa); ctx.closePath(); fillLine(ctx, grad(ctx, 0, sy, 0, wa, [[0, sh(vc, 0.1)], [1, sh(vc, -0.2)]]), sh(vc, -0.5), 1.2); }
      ctx.fillStyle = sh(vc, 0.35); for (const yy of [midY - 3, midY + 2]) { ctx.beginPath(); ctx.arc(3.6, yy, 0.9, 0, PI * 2); ctx.fill(); }
      if (O.kind === 'scholar') { for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, sy + 3); ctx.lineTo(sgn * 4, sy + 1); ctx.lineTo(sgn * 4, sy + 5); ctx.closePath(); fillLine(ctx, '#c03040', '#801020', 0.9); } }
      else { ctx.fillStyle = '#4a2a14'; ctx.fillRect(-bw * 0.88, wa - 4, bw * 1.76, 3.4); ctx.fillStyle = '#d8b050'; ctx.fillRect(-2, wa - 4.3, 4, 4); }
    }
    if (O.kind === 'cloak') {   // 여행자: 어깨 망토 + 브로치
      ctx.beginPath(); ctx.moveTo(-bw * 1.08, sy + 7); ctx.quadraticCurveTo(-bw * 0.9, sy - 2, 0, sy - 1); ctx.quadraticCurveTo(bw * 0.9, sy - 2, bw * 1.08, sy + 7); ctx.quadraticCurveTo(0, sy + 12, -bw * 1.08, sy + 7); ctx.closePath();
      fillLine(ctx, grad(ctx, 0, sy, 0, sy + 10, [[0, sh(O.cloakC || '#8a5a3a', 0.1)], [1, sh(O.cloakC || '#8a5a3a', -0.2)]]), sh(O.cloakC || '#8a5a3a', -0.5), 1.2);
      ctx.beginPath(); ctx.arc(0, sy + 4, 1.8, 0, PI * 2); fillLine(ctx, '#e8b840', '#8a6010', 0.8);
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-bw * 0.88, wa - 4, bw * 1.76, 3);
    }
    if (O.kind === 'mage') { ctx.fillStyle = O.trim || '#e8c060'; ctx.fillRect(-bw * 0.86, wa - 5, bw * 1.72, 3.2); ctx.strokeStyle = O.trim || '#e8c060'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, sy + 1); ctx.lineTo(0, wa - 5); ctx.stroke(); star(ctx, 0, midY - 2, 2.6, O.trim || '#e8c060', sh(O.trim || '#e8c060', -0.4)); }
    if (O.kind === 'ranger') {   // 숲 레인저: 대각 가죽끈 + 후드 깃
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-bw * 0.8, sy + 2); ctx.lineTo(bw * 0.75, wa - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-bw * 0.95, sy + 3); ctx.quadraticCurveTo(0, sy + 9, bw * 0.95, sy + 3); ctx.quadraticCurveTo(0, sy - 3, -bw * 0.95, sy + 3); fillLine(ctx, sh(top, -0.2), sh(top, -0.5), 1);
      ctx.fillStyle = '#4a2a14'; ctx.fillRect(-bw * 0.88, wa - 4, bw * 1.76, 3.2);
    }
    if (O.kind === 'explorer') {   // 탐험가: 벨트 + 옆 가방 + 주머니
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-bw * 0.88, wa - 4.5, bw * 1.76, 3.6); ctx.fillStyle = '#d8b050'; ctx.fillRect(-1.8, wa - 4.8, 3.6, 4.2);
      rr(ctx, -bw * 0.75, midY - 4, 5, 4.5, 1); fillLine(ctx, sh(top, -0.12), sh(top, -0.45), 0.9); rr(ctx, bw * 0.25, midY - 4, 5, 4.5, 1); fillLine(ctx, sh(top, -0.12), sh(top, -0.45), 0.9);
      ctx.save(); ctx.translate(-bw * 1.0, wa + 1); rr(ctx, -4, -4, 8, 7, 2); fillLine(ctx, '#8a5a2a', '#4a2a14', 1); ctx.fillStyle = '#d8b050'; ctx.fillRect(-1, -2, 2, 2); ctx.restore();
    }
    if (O.kind === 'squire') {   // 견습 기사: 사슬 갑옷 위 휘장 + 문양
      ctx.fillStyle = rgba('#ffffff', 0.18); for (let yy = sy + 4; yy < wa; yy += 3) for (let xx = -bw * 0.8; xx < bw * 0.8; xx += 3) { ctx.beginPath(); ctx.arc(xx + (yy % 6 ? 1.5 : 0), yy, 0.8, 0, PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(-bw * 0.48, sy + 1); ctx.lineTo(bw * 0.48, sy + 1); ctx.lineTo(bw * 0.48, wa + 9); ctx.lineTo(0, wa + 12); ctx.lineTo(-bw * 0.48, wa + 9); ctx.closePath();
      fillLine(ctx, grad(ctx, 0, sy, 0, wa, [[0, sh(O.tabard || '#3a5ab0', 0.1)], [1, sh(O.tabard || '#3a5ab0', -0.2)]]), sh(O.tabard || '#3a5ab0', -0.5), 1.1);
      star(ctx, 0, midY, 3.2, '#ffd86a', '#8a6010'); ctx.fillStyle = '#5a3a22'; ctx.fillRect(-bw * 0.88, wa - 4, bw * 1.76, 3);
    }
    if (O.kind === 'robe') { ctx.fillStyle = O.sash || '#e8c060'; ctx.fillRect(-bw * 0.88, wa - 5, bw * 1.76, 4); ctx.strokeStyle = sh(top, 0.35); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(0, wa - 5); ctx.stroke(); }
    if (O.kind === 'bandit') { ctx.fillStyle = '#5a3a22'; ctx.fillRect(-bw * 0.88, wa - 5, bw * 1.76, 4); ctx.fillStyle = '#c8a050'; ctx.fillRect(-2, wa - 5.5, 4, 5); }
    if (setSky) {   // 천공 갑옷: 금 테 · 가슴 보석
      ctx.strokeStyle = '#e8b840'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-bw * 0.8, sy + 3); ctx.quadraticCurveTo(0, sy + 12, bw * 0.8, sy + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-bw * 0.86, wa - 3); ctx.lineTo(bw * 0.86, wa - 3); ctx.stroke();
      ctx.save(); ctx.shadowColor = '#7ad8ff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(0, sy + 7); ctx.lineTo(4, sy + 11); ctx.lineTo(0, sy + 15); ctx.lineTo(-4, sy + 11); ctx.closePath(); fillLine(ctx, grad(ctx, 0, sy + 7, 0, sy + 15, [[0, '#e8fbff'], [1, '#3aa8ff']]), '#1a5aa0', 1); ctx.restore();
    }
  }
  function cape(ctx, p, t) {
    const { sh: sy, bw } = p, bot = -3;
    ctx.beginPath(); ctx.moveTo(-bw * 0.9, sy); ctx.quadraticCurveTo(-bw * 2.1, (sy + bot) / 2, -bw * 1.9 - Math.sin(t * 3) * 2, bot);
    ctx.lineTo(bw * 0.4, bot + 2); ctx.lineTo(bw * 0.8, sy); ctx.closePath();
    fillLine(ctx, grad(ctx, 0, sy, 0, bot, [[0, '#3a4ab8'], [1, '#8ac8ff']]), '#1a2a6a', 1.6);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (const [x, y] of [[-bw * 1.2, sy + 18], [-bw * 0.6, sy + 30], [-bw * 1.5, sy + 34], [-bw * 0.9, sy + 44]]) if (y < bot) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-bw * 1.9, bot); ctx.lineTo(bw * 0.4, bot + 2); ctx.stroke();
  }
  function arm(ctx, p, L, O, front) {
    const { sh: sy, bw, arm: al } = p, setSky = O.kind === 'sky', tc = setSky ? '#c8d8ff' : O.top;
    ctx.save(); ctx.translate(front ? bw * 0.72 : -bw * 0.78, sy + 3.5); ctx.rotate(front ? -0.12 : 0.1);
    const ue = al * 0.5, fe = al * 0.92;   // 팔꿈치 · 손목
    ctx.beginPath(); ctx.moveTo(-4.2, -2.5); ctx.quadraticCurveTo(0, -5, 4.2, -2.5);
    ctx.quadraticCurveTo(4.4, ue * 0.6, 3.6, ue); ctx.quadraticCurveTo(3.4, (ue + fe) / 2, 2.6, fe);
    ctx.lineTo(-2.6, fe); ctx.quadraticCurveTo(-3.6, (ue + fe) / 2, -3.8, ue); ctx.quadraticCurveTo(-4.6, ue * 0.6, -4.2, -2.5); ctx.closePath();
    fillLine(ctx, grad(ctx, -4, 0, 4, 0, [[0, sh(tc, -0.2)], [0.55, sh(tc, 0.1)], [1, sh(tc, -0.1)]]), sh(tc, -0.45), 1.4);
    // 소매 끝
    ctx.beginPath(); ctx.ellipse(0, fe - 0.5, 3.0, 1.2, 0, 0, PI * 2); ctx.fillStyle = setSky ? '#e8b840' : sh(tc, -0.25); ctx.fill();
    // 손 (엄지가 있는 벙어리장갑 모양)
    const hc = setSky ? '#3a4a8a' : L.skin;
    ctx.beginPath(); ctx.ellipse(0, fe + 3, 3.1, 3.4, 0, 0, PI * 2); fillLine(ctx, hc, sh(hc, -0.3), 1.1);
    ctx.beginPath(); ctx.ellipse(front ? 2.6 : -2.6, fe + 1.6, 1.3, 1.9, front ? 0.5 : -0.5, 0, PI * 2); fillLine(ctx, hc, sh(hc, -0.3), 1);
    if (front && O.weapon) weapon(ctx, O.weapon, fe + 2);
    ctx.restore();
    if (setSky) {   // 어깨 갑옷
      ctx.save(); ctx.translate(front ? bw * 0.74 : -bw * 0.8, sy + 2);
      ctx.beginPath(); ctx.ellipse(0, 0, 6.2, 4.8, front ? -0.25 : 0.25, PI * 0.98, PI * 2.02); ctx.closePath(); fillLine(ctx, grad(ctx, 0, -5, 0, 2, [[0, '#f0f6ff'], [1, '#7a92d8']]), '#3a4a8a', 1.4);
      ctx.strokeStyle = '#e8b840'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3.5, front ? -0.25 : 0.25, PI * 1.05, PI * 1.95); ctx.stroke(); ctx.restore();
    }
  }
  function weapon(ctx, kind, y) {
    ctx.save(); ctx.translate(0, y); ctx.rotate(0.35);
    if (kind === 'skysword') {
      ctx.save(); ctx.shadowColor = '#9ae8ff'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(-2.6, -6); ctx.lineTo(-3.2, -46); ctx.lineTo(0, -55); ctx.lineTo(3.2, -46); ctx.lineTo(2.6, -6); ctx.closePath();
      fillLine(ctx, grad(ctx, -3, 0, 3, 0, [[0, '#a8d8ff'], [0.5, '#ffffff'], [1, '#6ab8f0']]), '#2a6aa8', 1.2); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-9, -6); ctx.quadraticCurveTo(0, -2, 9, -6); ctx.lineTo(7, -3); ctx.quadraticCurveTo(0, 0, -7, -3); ctx.closePath(); fillLine(ctx, '#e8b840', '#8a6010', 1.1);
      ctx.beginPath(); ctx.arc(0, -4, 2, 0, PI * 2); fillLine(ctx, '#5ad8ff', '#1a5aa0', 0.8);
      rr(ctx, -1.6, -3, 3.2, 9, 1.5); fillLine(ctx, '#4a3a6a', '#1a1a2a', 1);
    } else if (kind === 'stick') {   // 나무 막대 (초보자)
      ctx.beginPath(); ctx.moveTo(-1.8, 4); ctx.lineTo(-2.6, -30); ctx.quadraticCurveTo(0, -36, 2.8, -30); ctx.lineTo(1.8, 4); ctx.closePath();
      fillLine(ctx, grad(ctx, -3, 0, 3, 0, [[0, '#7a4a22'], [0.5, '#b07a42'], [1, '#6a3a18']]), '#3a2010', 1.1);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-0.5, -4); ctx.lineTo(-1, -26); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-2.4, -16, 1.4, 0.9, 0.3, 0, PI * 2); ctx.fillStyle = '#6a3a18'; ctx.fill();
    } else if (kind === 'dagger') {
      ctx.beginPath(); ctx.moveTo(-1.8, -3); ctx.lineTo(0, -18); ctx.lineTo(1.8, -3); ctx.closePath(); fillLine(ctx, grad(ctx, -2, 0, 2, 0, [[0, '#9a9aa8'], [0.5, '#f0f0f8'], [1, '#8a8a98']]), '#4a4a5a', 1);
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-4, -3, 8, 2); ctx.fillRect(-1.3, -1, 2.6, 6);
    } else {
      ctx.beginPath(); ctx.moveTo(-1.8, -4); ctx.lineTo(-1.8, -30); ctx.lineTo(0, -34); ctx.lineTo(1.8, -30); ctx.lineTo(1.8, -4); ctx.closePath(); fillLine(ctx, grad(ctx, -2, 0, 2, 0, [[0, '#a0a8b8'], [0.5, '#f4f6fa'], [1, '#8a92a2']]), '#4a5060', 1);
      ctx.fillStyle = '#8a6a3a'; ctx.fillRect(-6, -5, 12, 2.4); ctx.fillStyle = '#4a3a2a'; ctx.fillRect(-1.3, -3, 2.6, 7);
    }
    ctx.restore();
  }
  function head(ctx, p, L) {
    const { hr, hy } = p;
    ctx.beginPath(); ctx.ellipse(0, hy, hr, hr * 0.96, 0, 0, PI * 2);
    fillLine(ctx, grad(ctx, -hr, hy - hr, hr * 0.6, hy + hr, [[0, sh(L.skin, 0.12)], [0.7, L.skin], [1, sh(L.skin, -0.12)]]), sh(L.skin, -0.32), 1.5);
    ctx.beginPath(); ctx.ellipse(-hr * 0.92, hy + hr * 0.12, hr * 0.16, hr * 0.22, 0, 0, PI * 2); fillLine(ctx, sh(L.skin, -0.06), sh(L.skin, -0.32), 1.2);
  }
  function draw(ctx, x, y, s, prop, L, O, t = 0) {
    const p = P[prop];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.ellipse(0, 1, 17, 4, 0, 0, PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fill();
    if (O.cape) cape(ctx, p, t);
    const fw = L.fw || 1, W = fn => { if (fw === 1) return fn(); ctx.save(); ctx.scale(fw, 1); fn(); ctx.restore(); };   // fw: 얼굴(머리통 · 얼굴 · 머리카락) 가로 배율
    W(() => hairBack(ctx, p, L));
    arm(ctx, p, L, O, false);
    body(ctx, p, L, O, t);
    W(() => { head(ctx, p, L); face(ctx, p, L); hairFront(ctx, p, L); });
    if (L.hat && O.kind !== 'sky') {   // 두건 · 모자
      const { hr, hy } = p; ctx.beginPath(); ctx.arc(0, hy - hr * 0.05, hr * 1.08, PI * 1.0, PI * 2.0); ctx.lineTo(hr * 1.1, hy + hr * 0.02); ctx.quadraticCurveTo(0, hy - hr * 0.25, -hr * 1.1, hy + hr * 0.02); ctx.closePath();
      fillLine(ctx, grad(ctx, 0, hy - hr, 0, hy, [[0, sh(L.hat, 0.15)], [1, sh(L.hat, -0.15)]]), sh(L.hat, -0.45));
      ctx.beginPath(); ctx.moveTo(-hr * 0.95, hy - hr * 0.1); ctx.quadraticCurveTo(-hr * 1.5, hy + hr * 0.2, -hr * 1.35, hy + hr * 0.6); ctx.lineTo(-hr * 1.1, hy + hr * 0.15); ctx.closePath(); fillLine(ctx, L.hat, sh(L.hat, -0.45));
    }
    if (O.kind === 'sky') {   // 천공 투구 (머리띠형 · 날개 장식)
      const { hr, hy } = p; ctx.beginPath(); ctx.arc(0, hy, hr * 1.06, PI * 1.08, PI * 1.92); ctx.strokeStyle = '#e8b840'; ctx.lineWidth = 3.2; ctx.stroke();
      for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sgn * hr * 0.85, hy - hr * 0.55); ctx.quadraticCurveTo(sgn * hr * 1.5, hy - hr * 1.2, sgn * hr * 1.45, hy - hr * 0.35); ctx.quadraticCurveTo(sgn * hr * 1.2, hy - hr * 0.55, sgn * hr * 0.95, hy - hr * 0.35); ctx.closePath(); fillLine(ctx, grad(ctx, 0, hy - hr * 1.2, 0, hy - hr * 0.3, [[0, '#ffffff'], [1, '#a8c8ff']]), '#5a6ea8', 1.2); }
      ctx.save(); ctx.shadowColor = '#7ad8ff'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(0, hy - hr * 1.02, hr * 0.13, 0, PI * 2); fillLine(ctx, '#bff0ff', '#1a5aa0', 1); ctx.restore();
    }
    arm(ctx, p, L, O, true);
    ctx.restore();
  }
  // 게임의 G.Draw.humanoid 인자(o)를 받아 새 그림으로 (시안 확인용)
  function fromGame(ctx, o) {
    const lk = o.look || {}, g = o.gear || {};
    const L = { skin: lk.skin || '#ffe0c2', hair: lk.hair || '#3a2a22', style: lk.style || 'short', gender: lk.gender || (o.weapon || o.mask ? 'm' : (/(long|twin|bun|bob|wavy)/.test(lk.style || '') ? 'f' : 'm')), eye: lk.eye || (o.weapon ? 'sharp' : 'round'), eyeColor: lk.eyeColor || '#3a3a4a', mask: o.mask, hat: o.hatColor || lk.hat };
    const sky = g.top && /sky|ar85/.test(JSON.stringify(g.top));
    const kind = sky ? 'sky' : o.mask ? 'bandit' : lk.outfit === 'sailor' ? 'sailor' : (lk.outfit === 'apprentice' || lk.beard) ? 'robe' : 'plain';
    const wmap = { sword: 'sword', dagger: 'dagger', bow: 'dagger', wand: 'sword' };
    const O = { kind, top: lk.top || '#6a7ab0', bottom: lk.bottom || '#3a4060', navy: lk.bottom, cape: !!o.cape && sky, weapon: o.weapon ? (sky ? 'skysword' : wmap[o.weapon] || 'sword') : null };
    ctx.save(); if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.translate(o.x, o.y); ctx.scale(o.dir || 1, 1); draw(ctx, 0, 0, 0.66 * (o.scale || 1), 2, L, O, o.t || 0); ctx.restore();
  }
  return { draw, P, fromGame };
})();
