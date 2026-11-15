// 캐릭터 "더 실제처럼" 시안 — 장비 나 안(G.GearFX) 위에 사람 부분을 덧입힘
//  가: 피부 음영 (머리카락 · 모자 아래 접촉 그림자 · 턱 아래 목 그림자 · 가장자리 따뜻한 빛 번짐)
//  나: 가 + 머리카락 윤기 (빛 고리 · 결 · 끝으로 갈수록 어둡게) + 눈 반짝임
//  다: 나 + 주변 빛 (하늘색 반사광이 오른쪽 아래 가장자리에) + 옷 접힘 그림자(팔 · 허리 아래)
window.CharFX = (function () {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const hex = h => { h = h.split('|')[0].replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  function render(ctx, x, y, s, dop, lv, gearOn) {
    const W = Math.ceil(120 * s), H = Math.ceil(150 * s), fx = W / 2, fy = H - 12 * s, c = mk(W, H), o = c.getContext('2d', { willReadFrequently: true });
    o.setTransform(s, 0, 0, s, fx, fy); const d0 = Object.assign({}, dop, { x: 0, y: 0, scale: 1, t: (dop.t || 0) + Math.random() });
    if (gearOn) { G.GearFX.on = true; G.GearFX.last = -1e9; G.GearFX.draw(o, d0); } else G.Draw.humanoid(o, d0); o.setTransform(1, 0, 0, 1, 0, 0);
    if (lv) pass(o, W, H, fx, fy, s, dop, lv);
    ctx.drawImage(c, x - fx, y - fy);
  }
  function pass(o, W, H, fx, fy, s, dop, lv) {
    const id = o.getImageData(0, 0, W, H), d = id.data, src = new Uint8ClampedArray(d), neck = Math.floor(fy - 46 * s);
    const lk = dop.look, hc = hex(lk.hair || '#684932'), sk = hex(lk.skin || '#ffe0c2');
    const A = (x, yy) => (x < 0 || yy < 0 || x >= W || yy >= H) ? 0 : src[(yy * W + x) * 4 + 3];
    const isSkin = (i) => { if (src[i + 3] < 200) return false; const r = src[i], g = src[i + 1], b = src[i + 2], k = (r + g + b) / (sk[0] + sk[1] + sk[2]); if (k < 0.62 || k > 1.12) return false; return Math.abs(r - sk[0] * k) < 16 && Math.abs(g - sk[1] * k) < 16 && Math.abs(b - sk[2] * k) < 18; };
    const isHair = (i) => { const r = src[i], g = src[i + 1], b = src[i + 2], L = (hc[0] + hc[1] + hc[2]) / 3, l = (r + g + b) / 3; if (src[i + 3] < 200) return false; const k = L > 10 ? l / L : 1; if (k < 0.4 || k > 1.6) return false; return Math.abs(r - hc[0] * k) < 34 && Math.abs(g - hc[1] * k) < 34 && Math.abs(b - hc[2] * k) < 34; };
    // 머리 범위
    let ht = H, hb = 0, hl = W, hr = 0; for (let yy = 0; yy < fy - 24 * s; yy++) for (let x = 0; x < W; x++) { const i = (yy * W + x) * 4; if (isHair(i)) { if (yy < ht) ht = yy; if (yy > hb) hb = yy; if (yy < neck) { if (x < hl) hl = x; if (x > hr) hr = x; } } }
    let ft = H, fb = 0; for (let yy = 0; yy < neck + 8 * s; yy++) for (let x = 0; x < W; x++) { const i = (yy * W + x) * 4; if (src[i + 3] > 200 && isSkin(i)) { if (yy < ft) ft = yy; if (yy > fb) fb = yy; } }
    const hcx = (hl + hr) / 2, hw = Math.max(1, (hr - hl) / 2), R = Math.max(2, Math.round(3.2 * s));
    for (let yy = 0; yy < H; yy++) for (let x = 0; x < W; x++) { const i = (yy * W + x) * 4; if (src[i + 3] < 200) continue; let r = d[i], g = d[i + 1], b = d[i + 2];
      const skin = yy < neck + 3 * s && isSkin(i), hair = !skin && yy < fy - 24 * s && isHair(i);
      if (skin) {   // 가: 피부
        let cover = 0; for (let k = 1; k <= R; k++) { const j = ((yy - k) * W + x) * 4; if (yy - k >= 0 && src[j + 3] > 200 && !isSkin(j)) { if (isHair(j) || yy - k < ft + 2) cover = 1 - (k - 1) / R; break; } }
        if (yy < neck + 2 * s && cover > 0) { const q = 0.30 * cover; r += (120 - r) * q; g += (70 - g) * q; b += (60 - b) * q; }   // 머리카락 · 모자 아래 그림자
        if (yy >= neck - 1 * s) { const q = Math.min(0.3, 0.3 * (yy - neck + 1 * s) / (3 * s) + 0.08); r += (130 - r) * q; g += (80 - g) * q; b += (70 - b) * q; }   // 목 (턱 아래)
        if (A(x - 2, yy) < 128 || A(x + 2, yy) < 128 || A(x, yy + 2) < 128) { const q = 0.22; r += (240 - r) * q; g += (140 - g) * q; b += (120 - b) * q; }   // 가장자리 빛 번짐
      }
      if (lv >= 2 && hair) {   // 나: 머리카락 윤기
        const nx = (x - hcx) / hw, ringY = ht + (hb - ht) * 0.22 + nx * nx * 6 * s, dy = (yy - ringY) / (1.8 * s), ring = Math.exp(-dy * dy) * (1 - Math.min(1, Math.abs(nx)) * 0.4);
        const sw = 0.5 + 0.5 * Math.sin((x - hcx) * 1.5 / s + (yy - ht) * 0.12 / s), strand = -9 * sw * sw, tip = Math.max(0, Math.min(1, (yy - (neck - 10 * s)) / (Math.max(hb - neck, 0) + 14 * s)));
        const q = ring * 0.5, dk = 1 - tip * 0.22; r = (r + (255 - r) * q + strand) * dk; g = (g + (250 - g) * q + strand) * dk; b = (b + (245 - b) * q + strand) * dk;
      }
      if (lv >= 3) {   // 다: 주변 빛 (오른쪽 아래 가장자리) · 겹친 곳 그림자
        if (A(x + Math.round(1.6 * s), yy + Math.round(1.2 * s)) < 128) { const q = 0.38; r += (150 - r) * q; g += (200 - g) * q; b += (255 - b) * q; }
        else if (!skin && !hair && yy > neck) { const up = A(x, yy - Math.round(2 * s)); const jj = ((yy - Math.round(2 * s)) * W + x) * 4; if (up > 200) { const dl = Math.abs(src[jj] - src[i]) + Math.abs(src[jj + 1] - src[i + 1]) + Math.abs(src[jj + 2] - src[i + 2]); if (dl > 90) { r *= 0.8; g *= 0.8; b *= 0.84; } } }
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = b; }
    if (lv >= 2) { // 눈 반짝임: 얼굴 범위 안 아주 어두운 점(눈동자) 위쪽에 작은 흰 점
      const ey = []; for (let yy = ft; yy < fb; yy++) for (let x = 0; x < W; x++) { const i = (yy * W + x) * 4; if (src[i + 3] > 200 && src[i] + src[i + 1] + src[i + 2] < 140 && yy > ft + (fb - ft) * 0.25 && yy < ft + (fb - ft) * 0.75) ey.push([x, yy]); }
      d && 0; o.putImageData(id, 0, 0);
    } else o.putImageData(id, 0, 0);
  }
  return { render };
})();
