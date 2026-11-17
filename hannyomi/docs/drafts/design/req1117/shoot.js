const { chromium } = require('playwright'); const fs = require('fs');
const DUMP = fs.readFileSync('../boss/dump_b1/thief_b_sky_sanctum.json', 'utf8').trim();
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:8123/index.html'); await pg.waitForTimeout(2500); await pg.addScriptTag({ content: fs.readFileSync('breath.js', 'utf8') });
  const out = await pg.evaluate(([d, VS]) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.save = () => {}; G.Game.begin(JSON.parse(d)); G.Game.changeMap('sky_sanctum', null);
    const w = G.Game.world, p = G.Game.player; p.hurt = () => {}; p.trueDamage = () => {}; G.MonSkill.update = () => false; let ts = performance.now();
    const m = w.monsters.find(x => x.id === 'aurelion') || w.monsters.find(x => x.isBoss); if (!m) return ['noboss ' + w.monsters.map(x => x.id).join(',')];
    w.monsters.forEach(x => { if (x !== m) x.x = 99999; }); m.ai = null; const BU = m.update; m.update = function () {};
    m.x = 760; m.dir = -1; p.x = 180; p.dir = 1;
    const imgs = []; for (const v of VS) {
      for (let i = 0; i < 20; i++) { ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); p.x = 180; p.y = G.GROUND_Y; p.onGround = true; }
      w.sweep = { x0: 700, x1: 200, dir: -1, warn: 0, dur: 1, t: 0, src: m, hx: 430 };
      if (v !== 'now') { const ob = w.drawBoss21.bind(w); w.drawBoss21 = function (ctx) { const sw = this.sweep; this.sweep = null; ob(ctx); this.sweep = sw; const mm = sw.src, cam = this.cam; BreathMock[v](ctx, mm.x + sw.dir * mm.w * 0.32 - cam, mm.y - mm.h * 0.72, sw.hx - cam, G.GROUND_Y, this.time); }; }
      ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); imgs.push(document.getElementById('canvas').toDataURL('image/png'));
      w.drawBoss21 = G.World.prototype.drawBoss21; }
    return imgs; }, [DUMP, (process.env.V || 'now,ga,na,da').split(',')]);
  if (out.length < 2) console.log(out); else out.forEach((u, i) => fs.writeFileSync(`${process.env.P || 'b'}_${i}.png`, Buffer.from(u.split(',')[1], 'base64')));
  console.log(errs); await b.close(); })();
