const { chromium, devices } = require('playwright');
const CSS = `
#slp{position:fixed;inset:0;z-index:99990;background:#000;color:#8a8f9c;font-family:'Malgun Gothic',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:14px;box-sizing:border-box;user-select:none}
#slp .moon{font-size:13px;color:#6a7088;letter-spacing:2px;margin-bottom:0}
#slp .clk{font-size:36px;line-height:1.15;color:#b8bcc8;font-weight:300;letter-spacing:2px}
#slp .sub{font-size:13px;color:#6a7088;margin:0 0 10px}
#slp .live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#3a8a5a;margin-right:6px;vertical-align:1px;box-shadow:0 0 6px #3a8a5a}
#slp .lv{font-size:14px;color:#a8acb8;margin-bottom:5px}
#slp .bar{width:300px;height:5px;background:#1a1c22;border-radius:3px;overflow:hidden;margin-bottom:10px}
#slp .bar i{display:block;height:100%;width:63%;background:linear-gradient(90deg,#5a6a3a,#8a9a4a)}
#slp .grid{display:grid;grid-template-columns:repeat(4,auto);gap:2px 26px;text-align:center;margin-bottom:8px}
#slp .grid b{display:block;font-size:17px;color:#c8ccd6;font-weight:600}
#slp .grid span{font-size:11px;color:#5a5f6c}
#slp .pot{font-size:12px;color:#6a7088;margin-bottom:4px}
#slp .warn{font-size:12px;color:#b88a3a}
#slp .slide{position:absolute;bottom:12px;width:300px;height:44px;border-radius:22px;background:#0e1014;border:1px solid #23262e;display:flex;align-items:center}
#slp .slide .k{width:40px;height:40px;margin-left:2px;border-radius:50%;background:#2a2e38;color:#9aa0b0;display:flex;align-items:center;justify-content:center;font-size:18px}
#slp .slide .t{flex:1;text-align:center;font-size:13px;color:#5a5f6c;letter-spacing:1px;margin-right:40px}
#sum{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font-family:'Malgun Gothic',sans-serif}
#sum .w{width:430px;background:linear-gradient(#232a44,#151a2c);border:1px solid #4a5684;border-radius:12px;color:#e8ecf8;padding:14px 18px;box-shadow:0 8px 30px rgba(0,0,0,.5)}
#sum h3{margin:0 0 2px;font-size:17px;color:#ffe08a}
#sum .tm{font-size:12px;color:#9aa4c8;margin-bottom:10px}
#sum .r{display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07)}
#sum .r b{color:#fff}
#sum .its{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 12px}
#sum .its span{font-size:12px;padding:3px 7px;border-radius:6px;background:rgba(255,255,255,.07)}
#sum button{width:100%;padding:9px;border-radius:8px;border:1px solid #c8a040;background:linear-gradient(#a8802a,#7a5a1a);color:#fff;font-size:15px}
`;
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(devices['iPhone 13 landscape']); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await pg.goto('http://127.0.0.1:8123/index.html'); await pg.waitForTimeout(2500);
  const mp = await pg.evaluate(() => { G.Mobile.closeModal(); G.UI.overlay(''); G.Save.slot = 'C'; G.Game.save = () => {};
    const m = Object.values(G.MAPS).find(m => /Lv\.4[3-8]/.test(m.lvText || '') && !m.bossRoom);
    const d = G.Player.newData('모험가', G.LOOKS.def('f')); d.level = 47; d.job = 'mage_2a'; d.flags['chapter:1'] = d.flags['chapter:2'] = d.flags['chapter:3'] = 1; d.tut = null;
    G.Game.begin(d); G.Game.changeMap(m.id, null); G.UI.overlay(''); return m.id + ' ' + m.name; });
  console.log(mp); await pg.waitForTimeout(4000);
  await pg.evaluate(() => { try { G.Play.toggleAuto(); } catch (e) {} }); await pg.waitForTimeout(3000);
  await pg.addStyleTag({ content: CSS });
  // A: 메뉴 (새 버튼 두 개)
  await pg.evaluate(() => { G.UI.openWin('menu'); });
  await pg.waitForTimeout(600);
  await pg.evaluate(() => { const b = [...document.querySelectorAll('button[data-arg="minimap"]')][0]; if (!b) return;
    b.insertAdjacentHTML('afterend', '<button class="btn" style="outline:2px solid #ffd84a">🌙 절전 화면: 3분</button><button class="btn" style="outline:2px solid #ffd84a">🌙 지금 절전 화면으로</button>'); const nb = [...document.querySelectorAll('button')].find(x => /지금 절전/.test(x.textContent)); nb && nb.scrollIntoView({ block: 'center' }); });
  await pg.screenshot({ path: 'a_menu.png' });
  await pg.evaluate(() => { G.UI.closeWin('menu'); });
  await pg.waitForTimeout(400); await pg.screenshot({ path: 'b_game.png' });
  // C: 절전 화면
  await pg.evaluate(() => { const p = G.Game.player, w = G.Game.world; document.body.insertAdjacentHTML('beforeend', `<div id="slp">
    <div class="moon">🌙 절전 화면</div><div class="clk">1:23:45</div><div class="sub"><span class="live"></span>자동 사냥 중 · ${w.map.name}</div>
    <div class="lv">Lv.47 ${G.JOBS[p.d.job].name} · 경험치 63.2%</div><div class="bar"><i></i></div>
    <div class="grid"><div><b>1,284</b><span>잡은 수</span></div><div><b>+38.2%</b><span>경험치</span></div><div><b>+412,350</b><span>골드</span></div><div><b>27</b><span>아이템</span></div></div>
    <div class="pot">HP 물약 152 · MP 물약 88 · 가방 빈칸 14</div><div class="warn">⚠ MP 물약이 100개보다 적어요</div>
    <div class="slide"><div class="k">➜</div><div class="t">밀어서 풀기</div></div></div>`); });
  await pg.screenshot({ path: 'c_sleep.png' });
  // D: 풀린 뒤 요약
  await pg.evaluate(() => { document.getElementById('slp').remove(); document.body.insertAdjacentHTML('beforeend', `<div id="sum"><div class="w">
    <h3>🌙 절전 중에 얻은 것</h3><div class="tm">1시간 23분 45초 · 자동 사냥</div>
    <div class="r"><span>경험치</span><b>+38.2%  (Lv.47 → 48)</b></div><div class="r"><span>잡은 몬스터</span><b>1,284마리</b></div>
    <div class="r"><span>골드</span><b>+412,350 G</b></div><div class="r"><span>쓴 물약</span><b>HP 38 · MP 61</b></div>
    <div class="its"><span style="color:#ffd84a">찬란 · 별빛 로브</span><span style="color:#7ab8ff">빛남 · 수정 지팡이</span><span>별빛 각인서 ×3</span><span>공명석 ×2</span><span>기타 재료 ×19</span></div>
    <button>확인</button></div></div>`); });
  await pg.screenshot({ path: 'd_sum.png' });
  console.log(errs); await b.close(); })();
