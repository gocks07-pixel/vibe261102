const { chromium, devices } = require('playwright'); const fs = require('fs');
const DUMP = fs.readFileSync('../full/shel/dump1.json', 'utf8').trim();
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(2500);
  for (const v of ['da']) {
    await pg.evaluate(([d, v]) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(JSON.parse(d)); G.Game.changeMap('sprout_port', null);
      const MK = { harmon: { ch: '?', main: true, q: '촌장의 부탁' }, mina: { ch: '!', main: false, q: '미나의 조개 목걸이' }, thor: { ch: '!', main: true, q: '장비를 갖춰라' } };
      G.Quest.marker = id => MK[id] || null; const w = G.Game.world, p = G.Game.player; p.x = 900;
      const RR = (c, x, y, w2, h, r) => { c.beginPath(); c.roundRect(x, y, w2, h, r); };
      const badge = (c, x, y, mk, r = 7) => { const col = mk.ch === '?' ? '#3ac86a' : (mk.main ? '#f0b020' : '#3a9ae8'); c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 3; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.font = `900 ${r * 1.6}px "Malgun Gothic"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(mk.ch, x, y + 0.5); c.textBaseline = 'alphabetic'; };
      if (v !== 'now') { const orig = w.drawMinimap.bind(w);
        w.drawMinimap = function (ctx) { const npcs = this.npcs; this.npcs = []; orig(ctx); this.npcs = npcs;
          const map = this.map, W = 230, H = 74, X = 14, Y = 82, sc = W / map.width, my = y => Y + 8 + (y - 250) / (G.GROUND_Y - 250) * (H - 16);
          for (const n of npcs) if (!G.Quest.marker(n.id)) G.Draw.ell(ctx, X + n.x * sc, my(n.y) - 4, 2, 2, 'rgba(255,213,74,.45)');
          for (const n of npcs) { const mk = G.Quest.marker(n.id); if (mk) badge(ctx, X + n.x * sc, my(n.y) - 7 + Math.sin(this.time * 5) * 0.8, mk, 4.2); }
          let yy = Y + H + 3;
          if (v === 'na' || v === 'da') { const rows = npcs.map(n => [n, G.Quest.marker(n.id)]).filter(r => r[1]).sort((a, b) => (a[1].ch === '?' ? -1 : 1));
            if (v === 'da') rows.push([{ def: { name: '가렌' } }, { ch: '!', main: false, q: '바람결 마을 의뢰', far: '바람결 마을 ▶' }]);
            for (const [n, mk] of rows.slice(0, 4)) { ctx.fillStyle = 'rgba(10,12,22,.62)'; RR(ctx, X, yy, W * 0.82, 15, 4); ctx.fill(); badge(ctx, X + 9, yy + 7.5, mk, 5);
              ctx.font = 'bold 10px "Malgun Gothic"'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; const nm = (n.def && n.def.name) || G.NPCS[n.id].name;
              ctx.fillText(nm + (mk.ch === '?' ? '에게 완료 보고' : (mk.main ? ' · 메인 받기' : ' · 서브 받기')), X + 18, yy + 11.2);
              if (mk.far) { ctx.fillStyle = '#9ad0ff'; ctx.textAlign = 'right'; ctx.fillText(mk.far, X + W * 0.82 - 5, yy + 11.2); }
              yy += 17; } }
          if (v === 'da') { badge(ctx, X + W - 6, Y + 9, { ch: '!', main: false }, 3.6); ctx.font = 'bold 10px "Malgun Gothic"'; ctx.fillStyle = '#9ad0ff'; ctx.textAlign = 'right'; ctx.fillText('▶', X + W - 11, Y + 12.5); }
        }; }
      let ts = performance.now(); for (let i = 0; i < 30; i++) { ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); p.x = 900; p.y = G.GROUND_Y; p.vy = 0; p.onGround = true; } return document.getElementById('canvas').toDataURL('image/png'); }, [DUMP, v]).then(du => fs.writeFileSync(`m_${v}.png`, Buffer.from(du.split(',')[1], 'base64'))); }
  console.log(errs); await b.close(); })();
