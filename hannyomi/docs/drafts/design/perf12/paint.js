// 스킬마다 "칠하는 양" (아이폰 GPU 부담에 가장 가까운 값): 스킬을 쓴 뒤 60프레임 동안 그림 찍기 · 사각 칠하기 면적(화면 몇 장 분량) · 빛 겹침('lighter') 면적 · 칠하기/선 횟수 · 프레임 시간
const { chromium, devices } = require('playwright'); const fs = require('fs');
const DD = '/tmp/claude-0/-home-user/558450f0-4a3e-5c82-a57a-13153a100c8c/scratchpad/boss/dump/';
const JOBS = (process.env.JOBS || 'warrior_a,warrior_b,archer_a,archer_b,mage_a,mage_b,thief_a,thief_b').split(',');
(async () => { const b = await chromium.launch(); const all = {};
  for (const job of JOBS) { const ctx = await b.newContext(devices['iPhone 13 landscape']); const pg = await ctx.newPage(); await pg.goto(process.env.URL || 'file:///home/user/vibe261102/hannyomi/index.html'); await pg.waitForTimeout(2500);
    const dump = fs.readFileSync(DD + job + '_void_throne.json', 'utf8').trim();
    const res = await pg.evaluate(([dump, fxm]) => { if (G.Mobile) G.Mobile.closeModal(); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(JSON.parse(dump)); G.Game.changeMap('star_corridor', null); G.Settings.sound = false;
      const P = CanvasRenderingContext2D.prototype, S = { img: 0, add: 0, rect: 0, ops: 0 }; const main = document.getElementById('canvas'), SCR = main.width * main.height;
      const sc = (c) => { const t = c.getTransform(); return Math.abs(t.a * t.d - t.b * t.c); };
      const di = P.drawImage; P.drawImage = function (...a) { if (this.canvas === main) { const w = a.length >= 5 ? a[a.length - 2] : (a[0].width || 0), h = a.length >= 5 ? a[a.length - 1] : (a[0].height || 0), ar = Math.abs(w * h) * sc(this) / SCR; S.img += ar; if (this.globalCompositeOperation === 'lighter') S.add += ar; S.ops++; } return di.apply(this, a); };
      const fr = P.fillRect; P.fillRect = function (x, y, w, h) { if (this.canvas === main) { const ar = Math.min(1.5, Math.abs(w * h) * sc(this) / SCR); S.rect += ar; if (this.globalCompositeOperation === 'lighter') S.add += ar; S.ops++; } return fr.apply(this, arguments); };
      for (const m of ['fill', 'stroke', 'arc', 'ellipse']) { const o = P[m]; P[m] = function () { if (this.canvas === main && (m === 'fill' || m === 'stroke')) S.ops++; return o.apply(this, arguments); }; }
      let ts = performance.now(); const p = G.Game.player, w = G.Game.world; p.hurt = () => {}; p.trueDamage = () => {};
      const run = (n, id) => { for (const k in S) S[k] = 0; let ms = 0, mx = 0; for (let i = 0; i < n; i++) { ts += 1000 / 60; if (id && i === 0) { p.lock = 0; p.dash = null; G.Game.hitstop = 0; p.cds = {}; p.doAttack(G.SKILLS[id], 20, w, '#a0c8ff'); }
        const a = performance.now(); G.Game.frame(ts); main.getContext('2d').getImageData(0, 0, 1, 1); const dt = performance.now() - a; ms += dt; mx = Math.max(mx, dt); G.Input.endFrame(); p.hp = p.st.maxHP; p.mp = p.st.maxMP; for (const m of w.monsters) if (!m.isBoss) m.hp = m.maxHp; }
        return { img: +(S.img / n).toFixed(2), add: +(S.add / n).toFixed(2), rect: +(S.rect / n).toFixed(2), ops: Math.round(S.ops / n), ms: +(ms / n).toFixed(1), mx: +mx.toFixed(0) }; };
      const jid = p.d.job, re = new RegExp('^' + jid[0] + '[34]' + jid.slice(-1) + '_'); const ids = Object.keys(G.SKILLS).filter(id => re.test(id) && G.SKILLS[id].type === 'attack');
      run(60); const out = [['없음', run(60)]]; for (const id of ids) { run(60, id); out.push([G.SKILLS[id].name, run(60, id)]); }
      return { job: jid, out }; }, [dump]);
    console.log(JSON.stringify(res)); all[job] = res; await ctx.close(); }
  fs.writeFileSync(process.env.OUT || 'paint_now.json', JSON.stringify(all)); await b.close(); })();
