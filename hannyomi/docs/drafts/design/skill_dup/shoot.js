// node shoot.js <mock.js> <out-prefix> "key:k1,k2,k3,k4" ... — 게임 장면(ice_maze) 위에 시안 효과를 그려 장면마다 png
const { chromium } = require('playwright'); const fs = require('fs');
const DUMP = fs.readFileSync('/tmp/claude-0/-home-user/558450f0-4a3e-5c82-a57a-13153a100c8c/scratchpad/boss/dump/mage_b_void_throne.json', 'utf8').trim();
const [mock, pre, ...rows] = process.argv.slice(2); const map = process.env.MAP || 'ice_maze';
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(2600); await pg.addScriptTag({ content: fs.readFileSync(mock, 'utf8') });
  for (const r of rows) { const [key, ks, style] = r.split(':'); const K = ks.split(',').map(Number);
    for (let i = 0; i < K.length; i++) { const du = await pg.evaluate(([dump, map, key, k, style]) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(JSON.parse(dump)); G.Game.changeMap(map, null); G.FX.list = [];
        const p = G.Game.player, w = G.Game.world; let ts = performance.now(); p.x = 360; p.dir = 1; w.monsters.filter(m => !m.isBoss).forEach((m, j) => { m.x = 560 + (j % 6) * 110; m.y = G.GROUND_Y; });
        for (let j = 0; j < 20; j++) { ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); }
        const c = document.getElementById('canvas').getContext('2d'); const gy = G.GROUND_Y, targets = w.monsters.filter(m => !m.dead && !m.isBoss).map(m => m.x).sort((a, b) => a - b);
        c.save(); c.translate(-w.cam, 0); if (style) G.SageMock.style = style; G.SageMock[key](c, p, k, gy, targets); c.restore();
        return document.getElementById('canvas').toDataURL('image/png'); }, [DUMP, map, key, K[i], style]);
      fs.writeFileSync(`${pre}_${key}${style || ''}_${i}.png`, Buffer.from(du.split(',')[1], 'base64')); } }
  console.log(errs); await b.close(); })();
