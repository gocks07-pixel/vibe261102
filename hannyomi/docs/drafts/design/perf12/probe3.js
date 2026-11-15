// 몬스터 그리기 old/new: 평소 · 맞을 때 · 쓰러질 때 (같은 조건)
const { chromium, devices } = require('playwright'); const fs = require('fs');
const DD = '/tmp/claude-0/-home-user/558450f0-4a3e-5c82-a57a-13153a100c8c/scratchpad/boss/dump/';
(async () => { const b = await chromium.launch(); const out = {};
  for (const [nm, url] of [['old', 'file://' + __dirname + '/oldtree/index.html'], ['new', 'file:///home/user/vibe261102/hannyomi/index.html']]) {
    const ctx = await b.newContext(devices['iPhone 13 landscape']); const pg = await ctx.newPage(); await pg.goto(url); await pg.waitForTimeout(2500);
    out[nm] = await pg.evaluate((dump) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(JSON.parse(dump)); G.Game.changeMap('star_corridor', null); G.Settings.sound = false;
      const w = G.Game.world, p = G.Game.player; p.hurt = () => {}; let ts = performance.now(); const MP = Object.getPrototypeOf(w.monsters[0]); let md = 0; const f = MP.draw; MP.draw = function () { const a = performance.now(); const r = f.apply(this, arguments); md += performance.now() - a; return r; };
      const fr = (n, fn) => { md = 0; let ms = 0, mx = 0; for (let i = 0; i < n; i++) { ts += 16.7; if (fn) fn(i); const a = performance.now(); G.Game.frame(ts); const d = performance.now() - a; ms += d; mx = Math.max(mx, d); G.Input.endFrame(); p.hp = p.st.maxHP; } return { frame: +(ms / n).toFixed(1), max: +mx.toFixed(0), monDraw: +(md / n).toFixed(1) }; };
      fr(60); const o = {}; o.normal = fr(60); o.hit = fr(60, (i) => { if (i % 10 === 0) for (const m of w.monsters) if (!m.isBoss && !m.dead) m.hurtT = 0.2; });
      o.dying = fr(40, (i) => { if (i === 0) for (const m of w.monsters) if (!m.isBoss && !m.dead) m.takeDamage(m.hp + 1, w, p); }); return o; }, fs.readFileSync(DD + 'warrior_a_void_throne.json', 'utf8').trim());
    await ctx.close(); }
  console.log(JSON.stringify(out)); fs.writeFileSync('probe3.json', JSON.stringify(out)); await b.close(); })();
