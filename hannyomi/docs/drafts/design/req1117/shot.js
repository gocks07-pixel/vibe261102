const { chromium, devices } = require('playwright'); const fs = require('fs');
const DUMP = fs.readFileSync('../boss/dump/mage_b_void_throne.json', 'utf8').trim();
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(devices['iPhone 13 landscape']); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:8123/index.html'); await pg.waitForTimeout(2500);
  for (const [v, file] of [['one', 's1.png'], ['run', 's2.png'], ['done', 's3.png']]) {
    await pg.evaluate(([d, v]) => { G.Mobile.closeModal(); G.UI.overlay(''); G.Save.slot = 'C'; G.Game.save = () => {}; G.Game.begin(JSON.parse(d)); G.Game.changeMap('star_corridor', null);
      const p = G.Game.player, it = p.d.eq.weapon; it.slots = 4; it.up = 3; const t = G.ITEMS[it.tid], max = G.Items.maxSlots(t);
      const base = G.Win.scroll.render;
      G.Win.scroll.result = { ok: true, inc: 1, fx: null, stage: 4, rate: 0.6, it, tid: 'scroll_100' };
      G.Win.scroll.render = function () {
        if (v === 'one') return base.call(this) + `<div class="sep"></div><div style="display:flex;gap:6px;justify-content:center"><button class="btn gold">한 번 더 (남은 각인서 12장)</button><button class="btn">칸이 찰 때까지 계속</button></div><div class="dim" style="font-size:11px;text-align:center;margin-top:4px">계속: 한 장씩 0.4초마다 · 칸이 다 차거나 각인서가 떨어지면 멈춤</div>`;
        if (v === 'run') { it.up = 5; it.slots = 2; } if (v === 'run') return `<div style="text-align:center;font-size:12px" class="dim">연속 각인 중… 6칸째 · 성공률 50%</div><div style="text-align:center;font-size:22px;font-weight:900;margin:6px 0;color:#ff8a8a">각인 실패...</div><div style="text-align:center;font-weight:800">${G.Items.displayName(it)}</div><div style="text-align:center" class="dim">각인 칸 ${max - 2} / ${max} · 다음 칸 성공률 50%</div><div class="sep"></div><div style="text-align:center">이번에 <b>4장</b> 사용 · <span style="color:#7dff9a">성공 2</span> · <span style="color:#ff8a8a">실패 2</span></div><div style="display:flex;justify-content:center;margin-top:6px"><button class="btn">■ 멈추기</button></div>`;
        it.up = 7; it.slots = 0; const fx = G.Items.rollSfx(0.5);
        return `<div style="text-align:center;font-size:20px;font-weight:900;margin:6px 0;color:#ffe08a">연속 각인 끝 · 칸을 다 채웠어요</div><div style="text-align:center;font-weight:800">${G.Items.displayName(it)}</div><div style="text-align:center" class="dim">각인 칸 ${max} / ${max} · +3 → +7</div><div class="sep"></div><div style="text-align:center">이번에 <b>7장</b> 사용 · <span style="color:#7dff9a">성공 4 (+4)</span> · <span style="color:#ff8a8a">실패 3</span></div><div style="color:#ffe08a;font-weight:800;margin-top:6px">✨ 특수 효과 부여! (1번)</div><div style="color:#ffe8a0">${G.Items.sfxText(fx)}</div><div class="dim" style="font-size:11px;text-align:center;margin-top:4px">남은 각인서 5장</div>`;
      };
      G.UI.openWin('scroll'); }, [DUMP, v]);
    await pg.waitForTimeout(800); await pg.screenshot({ path: file }); }
  console.log(errs); await b.close(); })();
