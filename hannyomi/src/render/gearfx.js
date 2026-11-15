// 빌드 11: 장비 "더 실제처럼" (나 안) — 플레이어를 한 장에 그린 뒤 빛 · 그림자 · 옷감 결 · 금속 광택을 덧입힘
//  ① 빛(왼쪽 위) 음영  ③ 윗 가장자리 빛  ④ 옷감 결(피부 · 머리 · 금속 · 아주 밝은 흰색 제외)  ⑤ 금속 광택(은 · 금)  ⑥ 발밑 그림자
//  시안: docs/drafts/design/gear_real/ (gear.js) · 캔버스 1장을 다시 씀, 픽셀은 한 번만 읽고 씀 (시안의 ② 겹친 곳 그림자는 실제로 보이지 않아 뺌)
G.GearFX = (function () {
  const cv = {}; const can = (k, w, h) => { let c = cv[k]; if (!c) { c = cv[k] = document.createElement('canvas'); c.k = c.getContext('2d', { willReadFrequently: true }); } if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } else c.k.clearRect(0, 0, w, h); return c; };
  // 한 번 읽어 한 번에: ① 빛 음영 · ③ 윗 가장자리 빛 · ④ 옷감 결 · ⑤ 금속 광택. 반투명(무기 빛 · 테두리)은 건드리지 않아 빛나는 무기가 어두워지지 않음
  // 위치마다 정해지는 값(빛 음영 · 결 무늬 · 광택 띠)은 크기가 같으면 한 번만 계산해 둠
  let TB = null;
  function tables(W, H, fx, fy, s) {
    const key = W + 'x' + H + ':' + s.toFixed(3); if (TB && TB.key === key) return TB;
    const n = W * H, LT = new Float32Array(n), TX = new Int8Array(n), BD = new Float32Array(n), bw = 14 * s;
    const gx0 = fx - 40 * s, gy0 = fy - 110 * s, vx = 80 * s, vy = 110 * s, vv = vx * vx + vy * vy;
    for (let yy = 0, j = 0; yy < H; yy++) for (let x = 0; x < W; x++, j++) {
      const u = ((x - gx0) * vx + (yy - gy0) * vy) / vv; LT[j] = u < 0.42 ? (u <= 0 ? 0.3 : 0.3 * (1 - u / 0.42)) : -(u >= 1 ? 0.42 : 0.42 * (u - 0.42) / 0.58);   // + 밝게 · - 어둡게
      TX[j] = ((x + yy) % 4 === 0 ? -14 : 0) + ((x - yy + 4000) % 7 === 0 ? 8 : 0) + ((x * 7 + yy * 13) % 11 === 0 ? -6 : 0);
      const v = ((((x - yy * 0.6) / bw) % 6) + 6) % 6; BD[j] = v > 2.4 && v < 3.4 ? -1 : (v > 0 && v < 1 ? 1 - Math.abs(v - 0.5) / 0.5 : 0); }
    return (TB = { key, LT, TX, BD, top: Math.max(0, Math.floor(fy - 46 * s)), rx: Math.round(1.2 * s), ry: Math.round(1.8 * s) });
  }
  // 한 번 읽어 한 번에: ① 빛 음영 · ③ 윗 가장자리 빛 · ④ 옷감 결 · ⑤ 금속 광택. 반투명(무기 빛 · 테두리)은 건드리지 않아 빛나는 무기가 어두워지지 않음
  function shade(o, W, H, fx, fy, s) {
    const id = o.getImageData(0, 0, W, H), d = id.data, tb = tables(W, H, fx, fy, s), LT = tb.LT, TX = tb.TX, BD = tb.BD, top = tb.top, rx = tb.rx, ry = tb.ry;
    for (let yy = 0, j = 0; yy < H; yy++) { const cloth = yy >= top, sy = yy - ry; for (let x = 0; x < W; x++, j++) { const i = j << 2; if (d[i + 3] < 200) continue;
      let r = d[i], g = d[i + 1], b = d[i + 2]; const mx0 = r > g ? (r > b ? r : b) : (g > b ? g : b);
      let k = LT[j]; if (mx0 >= 245) k *= 0.5;   // ① (아주 밝은 빛나는 곳은 절반만)
      if (k > 0) { r += (255 - r) * k; g += (246 - g) * k; b += (225 - b) * k; } else { k = -k; r += (20 - r) * k; g += (14 - g) * k; b += (40 - b) * k; }
      const sx = x - rx; if (sx < 0 || sy < 0 || d[((sy * W + sx) << 2) + 3] < 128) { d[i] = r + (255 - r) * 0.75; d[i + 1] = g + (246 - g) * 0.75; d[i + 2] = b + (224 - b) * 0.75; continue; }   // ③
      const mx = r > g ? (r > b ? r : b) : (g > b ? g : b), mn = r < g ? (r < b ? r : b) : (g < b ? g : b), sat = mx ? (mx - mn) / mx : 0;
      const silver = mx > 150 && mx < 236 && sat < 0.18, gold = r > 170 && g > 120 && b < 110 && sat > 0.35;   // 아주 밝은 흰색(하얀 모자 · 옷)은 금속으로 안 봄
      if (silver || gold) { const v = BD[j];   // ⑤
        if (v < 0) { if (mx < 215) { r *= 0.78; g *= 0.78; b *= 0.84; } }
        else if (v > 0) { const q = v * (silver ? 0.85 : 0.7); r += (255 - r) * q; g += (255 - g) * q; b += (255 - b) * q * (gold ? 0.6 : 1); } }
      else if (cloth && mx >= 110 && mx < 236 && !(r > 200 && g > 150 && b > 120 && r - b > 25 && r - b < 90)) { const w = TX[j]; r += w; g += w; b += w; }   // ④ 피부 · 머리 · 흰 부분 제외
      d[i] = r; d[i + 1] = g; d[i + 2] = b; } }
    o.putImageData(id, 0, 0);
  }
  function draw(ctx, dop) {
    if (G.Perf && G.Perf.rest) return G.Draw.humanoid(ctx, dop);   // 빌드 11: 느려졌거나 큰 스킬 효과 중에는 원래 그림 (가볍게)
    const T = ctx.getTransform ? ctx.getTransform() : null, z = T ? Math.hypot(T.a, T.b) : 1;
    if (!T || z < 0.3 || z > 6) return G.Draw.humanoid(ctx, dop);
    const s = (dop.scale || 1) * z, W = Math.ceil(120 * s), H = Math.ceil(150 * s), fx = W / 2, fy = H - 12 * s;
    const now = dop.t || 0, off = cv.off;   // 플레이어 시간(초)
    if (!(off && off.width === W && off.height === H && M.dir === dop.dir && now - M.last < 1 / 30 && now >= M.last)) {   // 다시 그리기는 1/30초에 한 번 (60프레임이면 한 장 걸러 앞 그림을 씀 · 자세 차이는 눈에 안 띔)
      const off2 = can('off', W, H), o = off2.k; M.last = now; M.dir = dop.dir;
      o.save(); o.translate(fx, fy); o.scale(z, z); G.Draw.humanoid(o, Object.assign({}, dop, { x: 0, y: 0, alpha: 1 })); o.restore();
      const t0 = performance.now(); shade(o, W, H, fx, fy, s); const dt = performance.now() - t0; M.ema = M.ema * 0.95 + dt * 0.05;
      if (++M.n > 120 && M.ema > 6) M.on = false;   // 아주 느린 기기: 저절로 끔 (그림만 원래대로)
    }
    const a = dop.alpha == null ? 1 : dop.alpha, x = dop.x, y = dop.y, q = dop.scale || 1;
    ctx.save(); if (!dop.air) { const r = 26 * q, sg = ctx.createRadialGradient(x, y + 2, 0, x, y + 2, r); sg.addColorStop(0, `rgba(10,8,20,${0.3 * a})`); sg.addColorStop(1, 'rgba(10,8,20,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x, y + 2, r, r * 0.25, 0, 0, Math.PI * 2); ctx.fill(); }   // ⑥ 발밑 그림자
    ctx.globalAlpha *= a; ctx.drawImage(cv.off, x - fx / z, y - fy / z, W / z, H / z); ctx.restore();
  }
  const M = { draw, on: true, ema: 0, n: 0, last: -1e9, dir: 0 }; return M;
})();
