// 녹스전 시뮬레이션: 보통 장비 Lv.98 캐릭터가 자동으로 녹스와 싸운다 (실제 게임 코드 그대로, 시간만 빨리 돌림)
//  실력 모델: 예고 공격(공허의 손 · 차원 절단 · 어둠 구체)을 dodge 확률로 피함, 종말의 별은 doomOk 확률로 보호막 도착
//  물약: HP 50% 이하면 HP 물약, MP 30% 이하면 MP 물약 (0.5초 간격). 쓰러지면 기록 후 바로 일으켜 계속 (실제로는 재도전)
const { chromium } = require('playwright');
const RUNS = JSON.parse(process.argv[2] || '[]');
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const R of RUNS) {
    const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file:///home/user/hannyomi/index.html'); await pg.waitForTimeout(500); await pg.mouse.click(5, 5);
    await pg.click('[data-act=dev][data-arg=open]'); await pg.waitForTimeout(200);
    await pg.click(`[data-arg="job:${R.job}"]`); await pg.click('[data-arg="ch:7"]'); await pg.click('[data-arg="slot:C"]'); await pg.waitForTimeout(2500);
    await pg.evaluate(R => {
      G.Game.loop = () => {};   // 실제 화면 루프 정지 → 시뮬레이션이 직접 돌림
      G.UI.showDeath = () => {};
      const p = G.Game.player, d = p.d, J = G.JOBS[R.job];
      if (R.eq) {   // 보스별 현실적인 캐릭터: 레벨 · 각성 차수 · 장비 목록
        const fam = R.fam, job = R.tier === 0 ? 'beginner' : R.tier === 1 ? fam : `${fam}_${R.tier}a`, J2 = G.JOBS[job];
        d.job = job; d.level = R.L;
        const ap = 9 + (R.L - 1) * 5, sub = Math.min(R.L, ap); d.base = { STR: 4, DEX: 4, INT: 4, LUK: 4 }; d.base[J2.sub] += sub; d.base[J2.main] += ap - sub;
        d.skills = {}; for (const j of G.jobChain(job)) for (const sk of G.skillsOfJob(j)) d.skills[sk.id] = sk.maxLv;
        d.eq = {};
        for (const id of R.eq) { const it = G.ITEMS[id]; if (!it) continue; let slot = it.slot; if (slot === 'ring') slot = d.eq.ring1 ? 'ring2' : 'ring1'; d.eq[slot] = G.Items.create(id); }
        p.buffs = {}; p.cd = {};
      }
      // 물약
      G.ITEMS.sim_essence = { name: '별의 정수', cat: 'use', icon: 'potion', color: '#fff', price: 5000, use: { hp: 1, mp: 1, full: true }, stack: 999 };
      d.inv.use = d.inv.use.map(() => null);
      if (R.pot === 'essence' || R.pot === 'candy') d.inv.use[0] = { tid: 'sim_essence', qty: 999 };
      else { d.inv.use[0] = { tid: 'pot_hp5', qty: 999 }; d.inv.use[1] = { tid: 'pot_mp4', qty: 999 }; }
      d.quests.c6_07 = { s: 'done' }; G.Game.ckpt = null;
      p.recalc(); p.hp = p.st.maxHP; p.mp = p.st.maxMP;
      G.Game.changeMap(R.map, null);
    }, R);
    await pg.waitForTimeout(400);
    const res0 = await pg.evaluate(R => {
      const w = G.Game.world, p = w.player; let m = w.monsters.find(x => x.isBoss);
      const S = { t: 0, deaths: [], potHP: 0, potMP: 0, dmg: {}, hits: {}, dodged: {}, enraged: null, potCd: 0, last: '?', phaseT: [] };
      window.__S = S; window.__R = R;
      const pat = () => (m && m.boss && m.boss.cur && m.boss.cur.pt) ? m.boss.cur.pt.id : null;
      const DODGE = new Set(['hand', 'cut', 'orbs', 'roar', 'gust', 'starfall', 'skyfall', 'blink', 'waves', 'breath', 'contact']);
      const oh = p.hurt.bind(p);
      p.hurt = function (raw, fx, opt = {}) {
        let id = pat() || (opt.src && opt.src.id === 'hero_echo' ? 'echo' : (opt.pct ? 'orbs' : 'contact'));
        if (id === 'chain' || id === 'echo' && !(opt.src && opt.src.id === 'hero_echo')) id = opt.pct ? 'orbs' : 'contact';
        if (this.dead || this.invuln > 0) return;
        if (DODGE.has(id) && Math.random() < R.dodge) { S.dodged[id] = (S.dodged[id] || 0) + 1; return; }
        S.pending = id; const pre = this.hp; oh(raw, fx, opt); const d = Math.max(0, pre - Math.max(0, this.hp));
        if (d > 0) { S.dmg[id] = (S.dmg[id] || 0) + d; S.hits[id] = (S.hits[id] || 0) + 1; S.last = id; }
      };
      const ot = p.trueDamage.bind(p);
      p.trueDamage = function (n) {
        let id = w.doom && w.doom.left <= 0.05 ? 'doom' : (w.zone ? 'erosion' : (w.pull ? 'devour' : (this.despair ? 'despair' : (pat() || 'chain-fail'))));
        if (pat() === 'chain' || pat() === 'doom') id = pat() === 'doom' ? 'doom' : 'chain-fail';
        S.pending = id; const pre = this.hp; ot(n); const d = Math.max(0, pre - Math.max(0, this.hp));
        if (d > 0) { S.dmg[id] = (S.dmg[id] || 0) + d; S.hits[id] = (S.hits[id] || 0) + 1; S.last = id; }
      };
      const od = p.die.bind(p);
      p.die = function () { od(); if (this.dead) { S.lastDeathT = Math.round(S.t); S.deaths.push({ t: Math.round(S.t), cause: S.pending || S.last, phase: (m.boss ? m.boss.phase : 0) + 1, boss: m.id }); this.dead = false; this.hp = this.st.maxHP; this.mp = this.st.maxMP; this.invuln = 2; this.despair = null; this.slowT = 0; } };
      // 스킬 우선순위
      const chain = G.jobChain(p.d.job), skills = chain.flatMap(j => G.skillsOfJob(j)).filter(s => p.d.skills[s.id]);
      const val = s => { const a = s.atk || {}, lv = p.d.skills[s.id]; return (a.pct ? a.pct(lv) : 0) * (a.hits || 1) * (a.count || 1) * Math.min(a.targets || 1, 2); };
      const atk = skills.filter(s => s.type === 'attack' && s.atk && s.atk.kind !== 'dash' && s.atk.kind !== 'back').sort((a, b) => val(b) - val(a));
      const buffs = skills.filter(s => s.type === 'buff');
      S.rot = atk.slice(0, 6).map(s => s.name + (s.cd ? '(' + s.cd + 's)' : ''));
      const far = ['archer', 'mage'].includes(G.JOBS[p.d.job].family);
      S.melee = !far;
      S.stats = { maxHP: p.st.maxHP, maxMP: p.st.maxMP, atk: Math.round(p.st.atk || 0) };
      S.byHit = { n: 0, sum: 0, max: 0 }; S.maxHp0 = m.maxHp; S.stages = [{ id: m.id, t: 0, hp: m.maxHp }];
      // ②~⑥ 시뮬레이터 전용 규칙 (게임 코드는 그대로)
      S.vulnT = 0; S.invT = 0; S.vulnN = 0; S.phaseGate = {}; S.pm = 0;
      const lvBoss = mm => mm.lv || (mm.d && mm.d.lv) || 0;
      const hook = mm => { if (R.hpMul && !mm.__mul) { mm.__mul = 1; mm.maxHp = Math.round(mm.maxHp * R.hpMul); mm.hp = mm.maxHp; }
        if (R.enrage && mm.boss && mm.boss.data) mm.boss.data = Object.assign({}, mm.boss.data, { enrage: R.enrage });
        const otk = mm.takeDamage.bind(mm);
        mm.takeDamage = function (n, src, ...a) {
          if (R.mech && S.invT > 0) return;
          let k = 1;
          if (R.mech) {
            if (S.vulnT > 0) k *= R.vulnMul;
            if (R.fam === 'mage') k *= R.mageMul;
            if (R.L < lvBoss(this)) k *= R.underMul;
          }
          n = Math.round(n * k);
          const pre = this.hp; const r = otk(n, src, ...a); const d = pre - Math.max(0, this.hp);
          if (d > 0) { S.byHit.n++; S.byHit.sum += d; S.byHit.max = Math.max(S.byHit.max, d); }
          if (R.mech && !this.dead) for (const g of R.gates) { const key = this.id + g; if (!S.phaseGate[key] && this.hp / this.maxHp <= g) { S.phaseGate[key] = 1; S.invT = R.gateT; S.pm++; } }
          if (this.dead && this.id === R.final) S.finalDead = true; return r; };
      };
      hook(m);
      const spawnNext = w.spawnNextBoss.bind(w); w.spawnNextBoss = function () { };   // 실제 타이머로는 소환하지 않음
      window.__step = n => {
        const dt = 1 / 30;
        for (let i = 0; i < n; i++) {
          const nb = w.monsters.find(x => x.isBoss && !x.dead);
          if (nb && nb !== m) { m = nb; hook(m); S.stages.push({ id: m.id, t: Math.round(S.t) }); }
          if (w.monsters.some(x => x.id === R.final && x.dead) || S.finalDead) { S.finalDead = true; return true; }
          S.t += dt;
          if (R.mech) {
            S.vulnT -= dt; S.invT -= dt;
            const mins = w.monsters.filter(x => !x.dead && x !== m && (x.d.chainPillar || ['void_pillar', 'hero_echo', 'corrupt_shard', 'mummy_guard'].includes(x.id))).length;
            if (S.prevMins > 0 && mins === 0 && m && !m.dead) { S.vulnT = R.vulnT; S.vulnN++; }
            S.prevMins = mins;
            if (S.prevDoom && !w.doom && !p.dead && S.lastDeathT !== Math.round(S.t)) { S.vulnT = R.vulnT; S.vulnN++; }
            S.prevDoom = !!w.doom;
          }
          if (!nb) {   // 1단계 보스가 쓰러짐 → 게임 시간 2.8초 뒤 2단계 (실제 setTimeout 대신)
            if (m && m.d.next && !S.spawned) { S.waitT = (S.waitT || 0) + dt; if (S.waitT >= 2.8) { S.spawned = true; spawnNext(m, w.mapId); } }
            w.update(dt); if (S.t > 1500) return true; continue;
          }
          if (m.boss && m.boss.enraged && S.enraged == null) S.enraged = Math.round(S.t);
          // 물약
          S.potCd -= dt;
          if (S.potCd <= 0 && !p.dead && !(p.noPotion > 0)) {
            if (p.hp < p.st.maxHP * 0.5) {
              if (R.pot === 'candy') { p.heal(Math.round(p.st.maxHP * 0.3)); p.healMp(Math.round(p.st.maxMP * 0.3), true); } else if (R.pot === 'essence') { p.heal(p.st.maxHP); p.healMp(p.st.maxMP, true); } else p.useItem(0);
              S.potHP++; S.potCd = 0.5;
            } else if (p.mp < p.st.maxMP * 0.3) {
              if (R.pot === 'candy') { p.heal(Math.round(p.st.maxHP * 0.3), true); p.healMp(Math.round(p.st.maxMP * 0.3)); } else if (R.pot === 'essence') { p.healMp(p.st.maxMP); } else p.useItem(1);
              S.potMP++; S.potCd = 0.5;
            }
          }
          // 이동 목표
          const minions = w.monsters.filter(x => !x.dead && x !== m && (x.d.chainPillar || ['void_pillar', 'hero_echo', 'corrupt_shard'].includes(x.id)));
          let tgt = m, tx;
          if (minions.length) tgt = minions.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
          const want = far ? 300 : 110;
          if (w.doom) { if (S.doomTry == null) S.doomTry = Math.random() < R.doomOk; tx = S.doomTry ? w.doom.zones.reduce((a, z) => Math.abs(z - p.x) < Math.abs(a - p.x) ? z : a) : null; }
          else { S.doomTry = null; }
          if (tx == null && w.zone) tx = G.U.clamp(p.x, w.map.width / 2 - w.zone.safe + 60, w.map.width / 2 + w.zone.safe - 60);
          if (tx == null && w.pull) tx = p.x + Math.sign(p.x - m.x || 1) * 400;
          if (tx == null) { const side = Math.sign(p.x - tgt.x) || -1; tx = tgt.x + side * want; }
          tx = G.U.clamp(tx, 40, w.map.width - 40);
          const sp = 300 * dt, dx = tx - p.x;
          if (Math.abs(dx) > 4) { p.x += Math.sign(dx) * Math.min(sp, Math.abs(dx)); p.vx = Math.sign(dx) * 300; } else p.vx = 0;
          p.dir = Math.sign(tgt.x - p.x) || p.dir;
          // 공격
          if (!p.dead && p.lock <= 0 && Math.abs(tgt.x - p.x) < want + 140) {
            let used = false;
            for (const s of buffs) if (!p.buffs[s.id] && !(p.cd[s.id] > 0) && p.mp > 50) { p.useSkill(s.id, w, true); used = true; break; }
            if (!used) for (const s of atk) { if (p.cd[s.id] > 0) continue; const before = p.lock; p.useSkill(s.id, w, true); if (p.lock > before || p.lock > 0) { used = true; break; } }
            if (!used && p.lock <= 0) p.basicAttack(w);
          }
          w.update(dt);
          if (S.t > 1500) return true;
        }
        return !!S.finalDead;
      };
      return { maxHP: p.st.maxHP, rot: S.rot };
    }, R);
    let done = false;
    while (!done) done = await pg.evaluate(() => window.__step(900));
    const r = await pg.evaluate(() => { const S = window.__S, m = G.Game.world.monsters.find(x => x.isBoss && !x.dead) || {}; return { vulnN: S.vulnN, gates: S.pm, stages: S.stages, t: Math.round(S.t), killed: !!S.finalDead, enraged: S.enraged, deaths: S.deaths, potHP: S.potHP, potMP: S.potMP, dmg: Object.fromEntries(Object.entries(S.dmg).map(([k, v]) => [k, Math.round(v)])), hits: S.hits, dodged: S.dodged, phaseT: S.phaseT, stats: S.stats, rot: S.rot, bossHP: S.maxHp0, hitsN: S.byHit.n, avgHit: Math.round(S.byHit.sum / Math.max(1, S.byHit.n)), maxHit: S.byHit.max, hpLeft: m.hp ? +(m.hp / m.maxHp * 100).toFixed(1) : 0 }; });
    out.push(Object.assign({ R }, r, { errs }));
    console.log(JSON.stringify(Object.assign({ R }, r, { errs: errs.slice(0, 3) })));
    await pg.close();
  }
  require('fs').writeFileSync(__dirname + '/fullsim3_out.json', JSON.stringify(out, null, 1));
  await b.close();
})();
