const { chromium, devices } = require('playwright'); const fs = require('fs');
const DUMP = fs.readFileSync('../boss/dump/mage_b_void_throne.json', 'utf8').trim();
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(devices['iPhone 13 landscape']); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:8123/index.html'); await pg.waitForTimeout(2500);
  await pg.evaluate((d) => { G.Mobile.closeModal(); G.UI.overlay(''); G.Save.slot = 'C'; G.Game.save = () => {}; G.Game.begin(JSON.parse(d)); G.Game.changeMap('star_corridor', null); G.Touch.opt.atkSk = {}; }, DUMP);
  await pg.waitForTimeout(1200);
  // 스킬 창 열고 2차 탭
  await pg.evaluate(() => { G.UI.toggle('skill'); }); await pg.waitForTimeout(600);
  const tabs = await pg.evaluate(() => [...document.querySelectorAll('#ui [data-act="tab"], #ui .tabs [data-arg]')].map(e => e.dataset.arg + ':' + e.textContent.trim()).slice(0, 8));
  console.log('tabs', tabs);
  const t2 = await pg.evaluate(() => { const b = [...document.querySelectorAll('#ui [data-act]')].find(e => /mage_2b/.test(e.dataset.arg || '')); if (b) b.click(); return !!b; }); await pg.waitForTimeout(500);
  await pg.screenshot({ path: 'a1_window.png' });
  // 연쇄 번개(1.5초) 넣기
  await pg.evaluate(() => { const b = document.querySelector('[data-mact="atk"][data-arg="m2b_chain"]'); if (b) b.click(); }); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'a2_set.png' });
  // 긴 스킬(얼음 창) 시도 → 안내
  const info = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-mact="atk"]')].map(x => x.dataset.arg + (x.classList.contains('on') ? '*' : '') + (x.classList.contains('off') ? '(x)' : '')); return b; });
  console.log(info);
  await pg.evaluate(() => { G.UI.closeTop(); }); await pg.waitForTimeout(500);
  // 공격 버튼 누르고 있기
  const box = await pg.evaluate(() => { const r = G.Mobile.btn.attack.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await pg.evaluate(() => { const P = G.Game.player, f = P.basicAttack.bind(P); P.basicAttack = function () { window.__ba = (window.__ba || 0) + 1; return f.apply(this, arguments); }; P.mp = 300; }); await pg.mouse.move(box[0], box[1]); await pg.mouse.down(); await pg.waitForTimeout(300); await pg.screenshot({ path: 'a3_hold.png' });
  const log = []; for (let i = 0; i < 12; i++) { await pg.waitForTimeout(250); log.push(await pg.evaluate(() => { const p = G.Game.player; return (p.cd.m2b_chain || 0).toFixed(1) + '/' + Math.round(p.mp) + '/' + (window.__ba || 0); })); }
  await pg.screenshot({ path: 'a4_cd.png' }); await pg.mouse.up();
  console.log('cd/mp over 3s:', log.join(' ')); console.log(errs); await b.close(); })();
