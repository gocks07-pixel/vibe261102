// 갈래 조사 (2026-11-06): 보스전에서 갈래마다 무엇이 다른지 — 준 피해(스킬별) · 초당 피해 · 스킬 쓴 횟수 · 보스와의 거리 · MP 바닥 시간 · 끝날 때 보스 HP
//  직접 플레이 모델(예고 공격 30% 회피 · 안전지대 30%, 자동 보정 없음, 자동의 안전지대 이동 끔), 보통 장비(덤프 그대로)
//  실행: node bossprobe.js <게임 주소> <덤프> <map> <반복>
const { chromium, devices } = require('playwright');
const fs = require('fs');
const [URL, DUMPF, MAP] = process.argv.slice(2, 5), REPS = +(process.argv[5] || 10);
(async () => {
  const b = await chromium.launch();
  const dump = fs.readFileSync(DUMPF, 'utf8').trim();
  for (let rep = 0; rep < REPS; rep++) {
    const pg = await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
    pg.on('pageerror', e => console.error('PAGEERR', String(e).slice(0, 200)));
    await pg.goto(URL + '/index.html'); await pg.waitForTimeout(700);
    const r = await pg.evaluate(async ([dump, map, OPT]) => {
      G.Mobile.closeModal();
      const d = JSON.parse(dump);
      if (OPT.mp) { const i = d.inv.use.findIndex(x => !x); d.inv.use[i] = { tid: OPT.mp, qty: 40 }; }   // MP 물약 넣어 보기
      if (OPT.eq) { const e = JSON.parse(OPT.eq).eq; const fam = G.familyOf(d.job); for (const k of Object.keys(e)) d.eq[k] = e[k]; }   // 다른 판의 장비로 바꿔 보기
      G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(d);
      G.Game.changeMap(map, null); G.Game.world.draw = () => {}; G.UI.frame = () => {};
      const p = G.Game.player; p.hp = p.st.maxHP; p.mp = p.st.maxMP;
      const NOD = new Set(['despair', 'devour', 'drain', 'chains', 'storm', 'erosion', 'prison', 'tide', 'spores', 'quicksand', 'chain-fail', 'curse', 'heat', 'echo']);
      const patId = () => { const m = G.Game.world.monsters.find(x => x.isBoss && !x.dead); return (m && m.boss && m.boss.cur && m.boss.cur.pt && m.boss.cur.pt.id) || 'contact'; };
      const hurt = G.Player.prototype.hurt; G.Player.prototype.hurt = function () { if (!NOD.has(patId()) && Math.random() < 0.3) return; return hurt.apply(this, arguments); };
      const tdm = G.Player.prototype.trueDamage; G.Player.prototype.trueDamage = function () { const id = patId(); if ((id === 'sun' || id === 'doom') && Math.random() < 0.3) return; return tdm.apply(this, arguments); };
      let t = 0, cur = 'basic', curT = 0; const casts = {}, dmg = {}, other = { minion: 0 };
      const us = G.Player.prototype.useSkill; G.Player.prototype.useSkill = function (id) { const r = us.apply(this, arguments); if (r !== false) { cur = id; curT = t; casts[id] = (casts[id] || 0) + 1; } return r; };
      const ba = G.Player.prototype.basicAttack; G.Player.prototype.basicAttack = function () { cur = 'basic'; curT = t; casts.basic = (casts.basic || 0) + 1; return ba.apply(this, arguments); };
      const tk = G.Monster.prototype.takeDamage; G.Monster.prototype.takeDamage = function (dm) { const h0 = this.hp, r = tk.apply(this, arguments), n = Math.max(0, h0 - Math.max(0, this.hp)); if (this.isBoss) dmg[cur] = (dmg[cur] || 0) + n; else other.minion += n; return r; };
      G.Play.userT = -1e9; G.Play.forceBoss = true; G.Play.AUTO_GUARD = {}; G.Play.safeArea = () => null;
      G.Play.autoOn = false; G.Play.toggleAuto();
      let ts = performance.now(), gone = 0, distS = 0, distN = 0, near = 0, mpLow = 0, bossMax = 0, bossHp = 0, alive = 0;
      while (t < 1500) {
        for (let i = 0; i < 60; i++) { t += 1 / 60; ts += 1000 / 60; G.Game.frame(ts); G.Input.endFrame(); }
        if (G.Dialog.isOpen()) G.Dialog.close();
        if (G.Cutscene.playing && G.Cutscene.playing()) G.Cutscene.finish();
        const w = G.Game.world, bs = w.monsters.filter(m => m.isBoss && !m.dead);
        if (bs.length) { const m = bs[0]; bossMax = Math.max(bossMax, m.maxHp || m.st && m.st.maxHP || 0); bossHp = m.hp; const dx = Math.abs(m.x - p.x); distS += dx; distN++; if (dx < 200) near++; alive++; }
        if (p.mp < p.st.maxMP * 0.1) mpLow++;
        if (p.dead) break;
        if (!bs.length) { if ((gone += 1) >= 3) break; } else gone = 0;
        if (!G.Play.autoOn) { G.Play.forceBoss = true; G.Play.userT = -1e9; G.Play.toggleAuto(); }
      }
      const tot = Object.values(dmg).reduce((a, b) => a + b, 0);
      return { win: !p.dead && t < 1500, t: Math.round(t), bossDps: Math.round(tot / Math.max(1, alive)), bossLeftPct: bossMax ? Math.round(Math.max(0, bossHp) / bossMax * 100) : null,
        dmgPct: Object.fromEntries(Object.entries(dmg).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round(v / Math.max(1, tot) * 100)])), casts,
        distAvg: Math.round(distS / Math.max(1, distN)), nearPct: Math.round(near / Math.max(1, distN) * 100), mpLowPct: Math.round(mpLow / Math.max(1, t) * 100),
        minionDmg: Math.round(other.minion), job: p.d.job, lv: p.d.level, hot: p.d.hot, atk: p.st.atk, maxHP: p.st.maxHP, crit: p.st.crit, critDmg: p.st.critDmg, bossDmg: p.st.bossDmg, atkp: p.st.atkp };
    }, [dump, MAP, { mp: process.env.MP || '', eq: process.env.EQ ? fs.readFileSync(process.env.EQ, 'utf8') : '' }]);
    console.log(JSON.stringify(Object.assign({ map: MAP, rep }, r)));
    await pg.context().close();
  }
  await b.close();
})();
