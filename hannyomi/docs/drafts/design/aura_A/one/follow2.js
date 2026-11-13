const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const W = 1300, H = 420; const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(1500);
  for (const f of ['aura_a.js', 'a4a.js']) await pg.addScriptTag({ content: fs.readFileSync(f, 'utf8') });
  await pg.evaluate(([W, H]) => { const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:' + W + 'px'; document.body.appendChild(cv); const c = cv.getContext('2d'); c.scale(2, 2);
    c.fillStyle = '#e9ecf8'; c.fillRect(0, 0, W, 40); c.fillStyle = '#1a2040'; c.font = 'bold 16px sans-serif'; c.fillText('천궁 · 금빛 별 활 0.6배가 따라다님 — 오른쪽으로 달리다 멈춘 뒤 왼쪽으로 돌아섬 (위: 어두운 배경 · 아래: 밝은 배경)', 12, 26);
    [['#3a2a1e', '#1e140c'], ['#c8dcf4', '#eef4fc']].forEach(([a, b2], r) => { const g = c.createLinearGradient(0, 40 + r * 190, 0, 230 + r * 190); g.addColorStop(0, a); g.addColorStop(1, b2); c.fillStyle = g; c.fillRect(0, 40 + r * 190, W, 190); });
    const lk = G.LOOKS.toDraw(Object.assign(G.LOOKS.def('m'), { hairStyle: 'short', hairColor: '#4a3a2a' }), '#f4f6ff', '#c8d0e8');
    const gear = G.Outfit.gearOf({ hat: { tid: 'ar85_hat' }, top: { tid: 'ar85_top' }, bottom: { tid: 'ar85_bottom' }, shoes: { tid: 'ar85_shoes' }, gloves: { tid: 'ar85_gloves' }, cape: { tid: 'ar85_cape' } });
    // 움직임: 0~0.4s 서 있음, 0.4~1.4 오른쪽 달림(300px/s), 1.4~2.0 멈춤, 2.0~ 왼쪽 달림
    const pos = (t) => t < 0.4 ? 0 : t < 1.4 ? (t - 0.4) * 300 : t < 2.0 ? 300 : 300 - (t - 2.0) * 300;
    const shots = [0.35, 0.8, 1.3, 1.55, 1.95, 2.35], cells = shots.length, cw = W / cells;
    for (let r = 0; r < 2; r++) { const p = { x: 0, y: 0, dir: 1 }; let si = 0; for (let t = 0; t <= 2.4 && si < cells; t += 1 / 120) { const nx = pos(t); const v = (pos(t + 1 / 120) - nx) * 120; p.x = nx; p.y = 0; p.dir = v < 0 ? -1 : v > 0 ? 1 : p.dir; G.AuraFollowBow.step(p, 1 / 120);
        if (t >= shots[si]) { const ox = si * cw + cw / 2, oy = 40 + r * 190 + 170; const s = { x: p.__cb.x - p.x + ox, y: p.__cb.y + oy, vx: p.__cb.vx };
          c.save(); c.beginPath(); c.rect(si * cw, 40 + r * 190, cw - 2, 190); c.clip(); G.AuraFollowBow.draw(c, p, t, s);
          G.Draw.humanoid(c, { x: ox, y: oy, dir: p.dir, t, moving: Math.abs(v) > 1, look: lk, gear, weapon: 'bow', wcolor: '#d8dce8', scale: 1 });
          if (r === 0) { c.fillStyle = '#f0e8d8'; c.font = '12px sans-serif'; c.fillText(['서 있음', '달리기 시작', '달리는 중', '멈춤', '제자리로 돌아옴', '왼쪽으로 돌아섬'][si], si * cw + 8, 58); }
          c.restore(); si++; } } } }, [W, H]);
  await pg.screenshot({ path: 'a4a_follow.png' }); await b.close(); })();
