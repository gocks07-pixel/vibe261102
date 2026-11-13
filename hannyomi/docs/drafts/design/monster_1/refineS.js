// 가 2차: 다듬기 + 이음새 없애기 — 채운 도형의 테두리 선(채우기 바로 뒤 같은 경로에 긋는 선)은 그리지 않음
//  → 원 · 네모를 겹친 경계가 사라지고 바깥 실루엣 외곽선만 남음. 선으로 그린 부분(다리 · 수염 · 무늬)은 그대로
(function () {
  const D = G.Draw;
  const noSeam = o => { const f = o.fill, s = o.stroke, b = o.beginPath; let filled = false;
    o.beginPath = function () { filled = false; return b.apply(this, arguments); };
    o.fill = function () { filled = true; return f.apply(this, arguments); };
    o.stroke = function () { if (filled) return; return s.apply(this, arguments); };
    return () => { o.fill = f; o.stroke = s; o.beginPath = b; }; };
  const noGlow = o => { const f = o.fill, fr = o.fillRect, ar = o.arc; o.fill = function () { if (this.globalCompositeOperation === 'lighter') return; return f.apply(this, arguments); };
    o.fillRect = function () { if (this.globalCompositeOperation === 'lighter') return; return fr.apply(this, arguments); }; return () => { o.fill = f; o.fillRect = fr; }; };
  let off = null, sil = null, rim = null;
  G.MonRefineS = function (ctx, m, t) {
    const A = G.MonArt[m.id];
    const pad = 60, bw = Math.ceil(m.w * 2.4 + pad * 2), bh = Math.ceil(m.h * 1.8 + pad * 2), S = 2, W = bw * S, H = bh * S;
    if (!off) { off = document.createElement('canvas'); sil = document.createElement('canvas'); rim = document.createElement('canvas'); }
    for (const c of [off, sil, rim]) { c.width = W; c.height = H; }
    const o = off.getContext('2d'), sc = sil.getContext('2d'), rc = rim.getContext('2d');
    o.setTransform(S, 0, 0, S, 0, 0);
    const keep = A.sh; A.sh = 0; const mx = m.x, my = m.y; m.x = bw / 2; m.y = bh - pad;
    const undo = noSeam(o); try { D.monster(o, m, t); } finally { undo(); m.x = mx; m.y = my; A.sh = keep; }
    o.setTransform(1, 0, 0, 1, 0, 0);
    const dark = m.id === 'eldrick';   // 어두운 옷 캐릭터: 위쪽 밝힘 · 빛 테두리를 약하게 (회색으로 바래지 않게)
    o.globalCompositeOperation = 'source-atop';
    const g = o.createLinearGradient(0, (bh - pad - m.h) * S, 0, (bh - pad) * S); g.addColorStop(0, dark ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,.16)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,10,40,.30)');
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    // 실루엣: 빛을 뺀 그림으로 (빛 둘레가 어둡게 번지지 않게)
    sc.setTransform(S, 0, 0, S, 0, 0); { const keep2 = A.sh; A.sh = 0; m.x = bw / 2; m.y = bh - pad; const u1 = noSeam(sc), u2 = noGlow(sc); try { D.monster(sc, m, t); } finally { u2(); u1(); m.x = mx; m.y = my; A.sh = keep2; } } sc.setTransform(1, 0, 0, 1, 0, 0);
    sc.globalCompositeOperation = 'source-in'; sc.fillStyle = 'rgba(28,18,40,.92)'; sc.fillRect(0, 0, W, H); sc.globalCompositeOperation = 'source-over';
    rc.drawImage(sil, 0, 0); rc.globalCompositeOperation = 'source-in'; rc.fillStyle = '#fff'; rc.fillRect(0, 0, W, H); rc.globalCompositeOperation = 'destination-out'; rc.drawImage(sil, 0, 2.5 * S); rc.globalCompositeOperation = 'source-over';
    o.globalAlpha = dark ? 0.12 : 0.35; o.drawImage(rim, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    ctx.save(); if (A.sh) { ctx.save(); ctx.translate(m.x, m.y); D.shadow(ctx, m.w * 0.45 * A.sh); ctx.restore(); }
    const x0 = m.x - bw / 2, y0 = m.y - (bh - pad);
    for (const [dx, dy] of [[-1.3, 0], [1.3, 0], [0, -1.3], [0, 1.3], [-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.drawImage(sil, x0 + dx, y0 + dy, bw, bh);
    ctx.drawImage(off, x0, y0, bw, bh); ctx.restore();
  };
})();
