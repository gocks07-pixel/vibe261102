// 장비 세트 "더 실제처럼" 시안 — 지금 그림을 한 장으로 그린 뒤 빛 · 그림자 · 질감을 덧입힘
//  ① 빛 방향(왼쪽 위) 음영: 위 밝게 · 아래 어둡게  ② 겹친 곳 그림자(AO): 실루엣을 아래로 밀어 경계 안쪽 어둡게  ③ 윗 가장자리 빛(림)
//  ④ 옷감 결: 아주 옅은 사선 · 점 무늬  ⑤ 금속 광택: 밝은 금속 색(은 · 금) 위에만 반짝이는 띠  ⑥ 발밑 접지 그림자
(function () {
  const G2 = window.GearReal = {};
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  let tex = null;
  function texture() { if (tex) return tex; tex = mk(64, 64); const k = tex.getContext('2d'); k.clearRect(0, 0, 64, 64);
    for (let i = 0; i < 64; i += 3) { k.strokeStyle = `rgba(0,0,0,${0.05 + (i % 6 ? 0 : 0.03)})`; k.lineWidth = 1; k.beginPath(); k.moveTo(i, 0); k.lineTo(i - 64, 64); k.stroke(); k.beginPath(); k.moveTo(i + 64, 0); k.lineTo(i, 64); k.stroke(); }
    for (let i = 0; i < 160; i++) { const x = Math.random() * 64, y = Math.random() * 64; k.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},.05)`; k.fillRect(x, y, 1, 1); } return tex; }
  // draw(ctx) 는 (0,0) 발 기준으로 캐릭터를 그림. W×H 영역, 발 위치 (fx, fy)
  G2.render = (ctx, x, y, s, draw, lv) => {
    const W = 120 * s, H = 150 * s, fx = W / 2, fy = H - 12 * s, off = mk(W, H), o = off.getContext('2d');
    o.save(); o.translate(fx, fy); draw(o); o.restore();
    if (!lv) { ctx.drawImage(off, x - fx, y - fy); return; }
    // 실루엣
    const sil = mk(W, H), sc = sil.getContext('2d'); sc.drawImage(off, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#000'; sc.fillRect(0, 0, W, H);
    // ① 빛 방향 음영
    o.globalCompositeOperation = 'source-atop';
    let g = o.createLinearGradient(fx - 40 * s, fy - 110 * s, fx + 40 * s, fy); g.addColorStop(0, 'rgba(255,246,225,.30)'); g.addColorStop(0.42, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,14,40,.48)'); o.fillStyle = g; o.fillRect(0, 0, W, H);
    // ② 겹친 곳 그림자: 본그림의 밝기 경계마다 아래쪽에 옅은 그림자 (본그림을 1~2px 아래로 밀어 어둡게 곱함)
    const ao = mk(W, H), ak = ao.getContext('2d'); ak.drawImage(off, 0, 0); ak.globalCompositeOperation = 'source-in'; ak.fillStyle = 'rgba(20,10,30,1)'; ak.fillRect(0, 0, W, H);
    const edge = mk(W, H), ek = edge.getContext('2d'); ek.drawImage(ao, 0.6 * s, 2.6 * s); ek.globalCompositeOperation = 'destination-out'; ek.drawImage(ao, 0, 0);
    o.globalAlpha = 0.0; o.globalAlpha = 1;
    // ③ 윗 가장자리 빛 (림)
    const rim = mk(W, H), rk = rim.getContext('2d'); rk.drawImage(sil, 0, 0); rk.globalCompositeOperation = 'source-in'; rk.fillStyle = '#fff6e0'; rk.fillRect(0, 0, W, H); rk.globalCompositeOperation = 'destination-out'; rk.drawImage(sil, 1.2 * s, 1.8 * s);
    o.globalAlpha = 0.75; o.drawImage(rim, 0, 0); o.globalAlpha = 1;
    // ④ 옷감 결 (목 아래 몸 · 다리만)
    if (lv >= 2) { const id = o.getImageData(0, 0, W, H), d = id.data, top = Math.floor(fy - 46 * s);
      for (let yy = top; yy < H; yy++) for (let x = 0; x < W; x++) { const i = (yy * W + x) * 4; if (d[i + 3] < 200) continue; const r = d[i], gg = d[i + 1], b = d[i + 2], skin = r > 200 && gg > 150 && b > 120 && r - b > 25 && r - b < 90; if (skin || Math.max(r, gg, b) < 110) continue;
        const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sat = mx ? (mx - mn) / mx : 0; if (mx > 150 && sat < 0.18) continue; if (r > 170 && gg > 120 && b < 110 && sat > 0.35) continue;   // 금속은 결 대신 광택
        const w = ((x + yy) % 4 === 0 ? -14 : 0) + ((x - yy + 400) % 7 === 0 ? 8 : 0) + ((x * 7 + yy * 13) % 11 === 0 ? -6 : 0); d[i] = Math.max(0, Math.min(255, r + w)); d[i + 1] = Math.max(0, Math.min(255, gg + w)); d[i + 2] = Math.max(0, Math.min(255, b + w)); }
      o.putImageData(id, 0, 0); }
    // ⑤ 금속 광택: 밝고 채도 낮은(은) · 노란(금) 픽셀 위에 사선 반짝임 띠
    if (lv >= 2) { const id = o.getImageData(0, 0, W, H), d = id.data, band = (x, yy) => { const v = ((x - yy * 0.6) / (14 * s)) % 6; return v < 1 && v > 0 ? 1 - Math.abs(v - 0.5) / 0.5 : 0; };
      for (let yy = 0; yy < H; yy++) for (let x = 0; x < W; x++) { const i = (yy * W + x) * 4; if (d[i + 3] < 200) continue; const r = d[i], gg = d[i + 1], b = d[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sat = mx ? (mx - mn) / mx : 0;
        const silver = mx > 150 && sat < 0.18, gold = r > 170 && gg > 120 && b < 110 && sat > 0.35; if (!silver && !gold) continue; const bb = band(x, yy), dark = ((x - yy * 0.6) / (14 * s)) % 6; if (dark > 2.4 && dark < 3.4) { d[i] *= 0.72; d[i + 1] *= 0.72; d[i + 2] *= 0.78; continue; } const k = bb * (silver ? 0.85 : 0.7); if (k <= 0) continue;
        d[i] = Math.min(255, r + (255 - r) * k); d[i + 1] = Math.min(255, gg + (255 - gg) * k); d[i + 2] = Math.min(255, b + (255 - b) * k * (gold ? 0.6 : 1)); } o.putImageData(id, 0, 0); }
    // ⑥ 발밑 접지 그림자
    ctx.save(); const sg = ctx.createRadialGradient(x, y + 2, 0, x, y + 2, 26 * s); sg.addColorStop(0, 'rgba(10,8,20,.38)'); sg.addColorStop(1, 'rgba(10,8,20,0)'); ctx.fillStyle = sg; ctx.translate(x, y + 2); ctx.scale(1, 0.25); ctx.beginPath(); ctx.arc(0, 0, 26 * s, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // 그림자 띠(AO) 는 본그림 안쪽에만
    o.globalCompositeOperation = 'source-atop'; o.globalAlpha = 0.6; o.drawImage(edge, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    ctx.drawImage(off, x - fx, y - fy);
  };
})();
