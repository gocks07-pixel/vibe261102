// node skillshot.js <dump> <map> <out> <id:이름,...> — 스킬마다 쓴 직후부터 4장면 (게임 화면 그대로)
const { chromium } = require('playwright'); const fs = require('fs');
const [dumpF, map, out, list, times] = process.argv.slice(2); const DUMP = fs.readFileSync(dumpF, 'utf8').trim(); const SK = list.split(',').map(s => s.split(':')); const T = (times || '0.05,0.2,0.35,0.55').split(',').map(Number);
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  await pg.goto('file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(2600); const files = [];
  for (const [id, nm] of SK) for (let k = 0; k < T.length; k++) {
    const du = await pg.evaluate(([dump, map, id, tt]) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(JSON.parse(dump)); G.Game.changeMap(map, null); G.MonSkill.update = () => false; const p = G.Game.player, w = G.Game.world; p.hurt = () => {}; p.trueDamage = () => {}; let ts = performance.now();
      p.x = 360; p.dir = 1; for (const m of w.monsters) if (!m.isBoss) { m.x = 520 + (w.monsters.indexOf(m) % 6) * 110; m.y = G.GROUND_Y; m.vx = 0; m.d = Object.assign({}, m.d, { harmless: true, aggressive: false, ranged: false }); G.MonSkill && (m.__noSkill = 1); }
      for (let i = 0; i < 70; i++) { ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); p.x = 360; p.y = G.GROUND_Y; p.vy = 0; p.onGround = true; p.hp = p.st.maxHP; p.dead = false; p.invuln = 0; }
      p.lock = 0; p.dir = 1; p.invuln = 0; p.d.skills[id] = 20; p.doAttack(G.SKILLS[id], 20, w, G.FX.EL[G.SKILLS[id].icon.el] || '#fff'); for (let i = 0; i < Math.round(tt * 60); i++) { ts += 16.7; G.Game.frame(ts); G.Input.endFrame(); p.hp = p.st.maxHP; } return document.getElementById('canvas').toDataURL('image/png'); }, [DUMP, map, id, T[k]]);
    const f = `ss_${id}_${k}.png`; fs.writeFileSync(f, Buffer.from(du.split(',')[1], 'base64')); files.push(f); }
  console.log(JSON.stringify({ files, errs })); await b.close(); })();
