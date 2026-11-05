// EXE 빌드 기능 확인 (브라우저 판 + 가짜 electronAPI 판)
const { chromium } = require('playwright');
const fs = require('fs');
const D = process.env.OUT || __dirname;
const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) process.exitCode = 1; };

async function boot(b, opts = {}) {
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/오류 기록/.test(m.text())) errs.push(m.text()); });
  if (opts.electron) {
    await pg.addInitScript(dev => {
      const store = {}; window.__bug = []; window.__errs = [];
      window.electronAPI = {
        info: { version: '2.1.0', dev },
        saveGame: async (s, d) => { store[s] = d; return true; }, loadGame: async s => store[s] || null,
        deleteGame: async s => { delete store[s]; return true; }, backupGame: async () => true,
        writeErrors: l => { window.__errs = l; }, bugCapture: async () => true,
        bugWrite: async r => { window.__bug.push(r); return { where: '문서/RPG Adventure/버그신고/test' }; },
      };
    }, !!opts.dev);
    if (!opts.dev) await pg.route('**/src/dev.js', r => r.abort());   // 플레이어용 EXE 흉내: dev.js 파일 없음
  }
  await pg.goto('file:///home/user/hannyomi/index.html'); await pg.waitForTimeout(800);
  return { pg, errs, ev: (f, a) => pg.evaluate(f, a) };
}

(async () => {
  const b = await chromium.launch();
  // ---------- 1. 브라우저 판 (테스트 모드 있음) ----------
  {
    const { pg, errs, ev } = await boot(b);
    const t = await ev(() => ({ ver: document.querySelector('.title-ov .ver')?.textContent, t3: !!document.querySelector('.ttl .t3'), dev: !!document.querySelector('[data-act=dev][data-arg=open]'), title: document.querySelector('.ttl').textContent }));
    ok(t.ver === 'v2.1.0 DEV', '브라우저 버전 표시 ' + t.ver);
    ok(!t.t3 && !/아르셀리아/.test(t.title), '타이틀에 "아르셀리아 연대기" 없음');
    ok(t.dev, '브라우저 판 테스트 모드 버튼 있음');
    await pg.screenshot({ path: D + '/1_title.png' });
    // 버전 = package.json
    const pkg = JSON.parse(fs.readFileSync('/home/user/hannyomi/package.json', 'utf8'));
    ok(pkg.version === (await ev(() => G.VERSION)), 'G.VERSION = package.json version');
    // 아이템 / 상점
    const it = await ev(() => ({ c: G.ITEMS.pot_candy, e: G.ITEMS.pot_essence, rag: G.NPCS.rag_shop.shop.includes('pot_candy'), elin: G.NPCS.elin.shop.includes('pot_candy'), nox: G.NPCS.nox_shop.shop.includes('pot_candy'), ess: Object.values(G.NPCS).some(n => n.shop && n.shop.includes('pot_essence')), f06: JSON.stringify(G.QUESTS.f_06.reward || G.QUESTS.f_06) }));
    ok(it.c && it.c.price === 500 && it.c.use.hpP === 30 && it.c.use.mpP === 30, '별사탕 500G HP·MP 30%');
    ok(it.e && it.e.use.cd === 30 && it.e.noSell, '별의 정수 30초 · 판매 불가');
    ok(it.rag && it.nox && !it.elin && !it.ess, '별사탕은 라그하르트부터, 별의 정수는 어느 상점에도 없음');
    ok(/pot_essence"?,\s*3/.test(it.f06), 'f_06 보상에 별의 정수 3개');
    // 테스트 모드로 게임 시작
    await pg.mouse.click(5, 5);
    await pg.click('[data-act=dev][data-arg=open]'); await pg.waitForTimeout(200);
    await pg.click('[data-arg="ch:3"]'); await pg.click('[data-arg="slot:C"]'); await pg.waitForTimeout(2500);
    await ev(() => { G.Game.ckpt = null; G.Game.changeMap('rag_field1' in G.MAPS ? 'rag_field1' : Object.keys(G.MAPS).find(k => /mine/.test(k)), null); });
    await pg.waitForTimeout(1500);
    // 자동 물약 기본값 + HUD
    const ap = await ev(() => { const p = G.Game.player; return { a: JSON.stringify(p.d.autoPot), hud: [...document.querySelectorAll('#hud .qs.auto')].map(e => e.className + '|' + e.querySelector('.at').textContent) }; });
    ok(ap.a === '{"hp":true,"hpAt":50,"mp":true,"mpAt":30}', '자동 물약 기본값 ' + ap.a);
    ok(ap.hud.length === 2 && ap.hud.every(x => /자동$/.test(x)), 'HUD 자동 표시 ' + ap.hud.join(', '));
    // HP 49% → 1초 안에 자동으로 먹음, 1초 간격
    const r1 = await ev(async () => {
      const p = G.Game.player; p.invuln = 1e9;
      const useHp = () => p.d.inv.use.reduce((n, s) => n + (s && G.ITEMS[s.tid].use.hp ? s.qty : 0), 0);
      const before = useHp(); p.hp = Math.floor(p.st.maxHP * 0.2);
      await new Promise(r => setTimeout(r, 1500));
      return { used: before - useHp(), hp: p.hp / p.st.maxHP };
    });
    ok(r1.used >= 1 && r1.used <= 3, `HP 20% → 자동 물약 ${r1.used}개 (1.5초)`);
    // 텍스트 "자동 물약" 없음
    ok(!(await ev(() => G.FX.list.some(f => f.k === 'text' && /자동/.test(f.str)))), '"자동 물약" 글자 없음');
    // HP 물약을 모두 없애면 별사탕
    const r2 = await ev(async () => {
      const p = G.Game.player, u = p.d.inv.use;
      for (let i = 0; i < u.length; i++) if (u[i] && G.ITEMS[u[i].tid].use.hp) u[i] = null;
      G.Inv.add(p, 'pot_candy', 5); G.Inv.add(p, 'pot_essence', 3); G.UI.dirty();
      await new Promise(r => setTimeout(r, 100));
      const hudImg = document.querySelectorAll('#hud .qs.auto')[0].querySelector('img')?.src || '';
      p.autoT.hp = 0; p.hp = Math.floor(p.st.maxHP * 0.3); p.mp = Math.floor(p.st.maxMP * 0.5);
      await new Promise(r => setTimeout(r, 400));
      const cnt = id => u.reduce((n, s) => n + (s && s.tid === id ? s.qty : 0), 0);
      return { candy: cnt('pot_candy'), ess: cnt('pot_essence'), hp: p.hp / p.st.maxHP, mp: p.mp / p.st.maxMP, hudCandy: hudImg === G.Icons.item(G.ITEMS.pot_candy) };
    });
    ok(r2.candy === 4 && r2.ess === 3, `물약 없음 → 별사탕 1개 (별사탕 ${r2.candy}, 정수 ${r2.ess})`);
    ok(r2.hp >= 0.59 && r2.hp < 0.75 && r2.mp >= 0.79 && r2.mp < 0.9, `별사탕 HP·MP 30% (${r2.hp.toFixed(2)}, ${r2.mp.toFixed(2)})`);
    ok(r2.hudCandy, 'HUD H 칸에 별사탕 표시');
    await pg.screenshot({ path: D + '/2_hud_candy.png' });
    // 별의 정수: 전부 회복, 30초 대기
    const r3 = await ev(() => {
      const p = G.Game.player, u = p.d.inv.use, i = u.findIndex(s => s && s.tid === 'pot_essence');
      G.AutoPot.of(p.d).hp = false; G.AutoPot.of(p.d).mp = false;
      p.hp = 10; p.mp = 10; p.useItem(i);
      const a = [p.hp === p.st.maxHP, p.mp === p.st.maxMP, u[i].qty];
      p.hp = 10; p.useItem(i);
      const b2 = [p.hp, u[i].qty, Math.ceil(p.itemCd.pot_essence)];
      p.itemCd.pot_essence = 0; p.useItem(i);
      return { a, b2, c: [p.hp === p.st.maxHP, u[i] ? u[i].qty : 0] };
    });
    ok(r3.a[0] && r3.a[1] && r3.a[2] === 2, '별의 정수 전부 회복');
    ok(r3.b2[0] === 10 && r3.b2[1] === 2 && r3.b2[2] === 30, '별의 정수 30초 재사용 대기');
    ok(r3.c[0] && r3.c[1] === 1, '대기 끝나면 다시 사용');
    // 판매 불가
    const r4 = await ev(() => { const p = G.Game.player, u = p.d.inv.use, i = u.findIndex(s => s && s.tid === 'pot_essence'); G.UI.sell('use', i); return !!u[i]; });
    ok(r4, '별의 정수 판매 불가');
    // 끔 표시 · 설정 창
    await ev(() => { G.UI.openWin('autopot'); });
    await pg.click('[data-act=autopot][data-arg=hp]');   // 켬
    await pg.click('[data-act=autopot][data-arg="hpAt:70"]');
    const r5 = await ev(() => ({ a: JSON.stringify(G.Game.player.d.autoPot), hud: [...document.querySelectorAll('#hud .qs.auto')].map(e => e.className + '|' + e.querySelector('.at').textContent) }));
    ok(r5.a === '{"hp":true,"hpAt":70,"mp":false,"mpAt":30}', '설정 창 변경 ' + r5.a);
    ok(/off/.test(r5.hud[1]) && /꺼짐$/.test(r5.hud[1]) && !/off/.test(r5.hud[0]), 'HUD 꺼짐 표시');
    await pg.screenshot({ path: D + '/3_autopot_win.png' });
    await ev(() => G.UI.closeWin('autopot'));
    // 메뉴 버튼
    await ev(() => G.UI.openWin('menu')); await pg.waitForTimeout(100);
    const mb = await ev(() => [!!document.querySelector('[data-act=menu][data-arg=autopot]'), !!document.querySelector('[data-act=bug]')]);
    ok(mb[0] && mb[1], '메뉴에 자동 물약 설정 · 버그 신고');
    await pg.screenshot({ path: D + '/4_menu.png' });
    await ev(() => G.UI.closeWin('menu'));
    // 오류 기록 + 게임 계속
    const r6 = await ev(async () => {
      const w = G.Game.world, orig = w.draw;
      let n = 0; w.draw = function (c) { n++; if (n === 3) throw new Error('테스트 오류'); return orig.call(this, c); };
      await new Promise(r => setTimeout(r, 500));
      w.draw = orig;
      return { n, list: G.ErrLog.text() };
    });
    ok(r6.n > 10 && /테스트 오류 @ src\/main\.js/.test(r6.list) || (r6.n > 10 && /테스트 오류/.test(r6.list)), `오류 나도 계속 진행 (프레임 ${r6.n}) · 기록 "${r6.list.split('\n')[0]}"`);
    // 버그 신고 (브라우저): F9 → 만들기 → 텍스트 + 복사 버튼
    await pg.keyboard.press('F9'); await pg.waitForTimeout(300);
    ok(await ev(() => G.Bug.isOpen()), 'F9 버그 신고 창');
    await pg.keyboard.type('녹스에서 멈췄어요');
    await pg.screenshot({ path: D + '/5_bug.png' });
    await pg.click('[data-bug=make]'); await pg.waitForTimeout(500);
    const bt = await ev(() => document.querySelector('.bug-text')?.value || '');
    ok(/녹스에서 멈췄어요/.test(bt) && /버전: v2\.1\.0/.test(bt) && /테스트 오류/.test(bt) && /진행 중인 퀘스트/.test(bt), '브라우저 신고 내용');
    await pg.screenshot({ path: D + '/6_bug_done.png' });
    console.log(bt.split('\n').slice(0, 16).join('\n'));
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(100);
    ok(!(await ev(() => G.Bug.isOpen())), 'Esc로 닫기');
    // 엔딩 크레딧
    await ev(() => G.Ending.credits('seal')); await pg.waitForTimeout(3500);
    const cr = await ev(() => document.querySelector('.credits')?.innerText || '');
    ok(/과금없이 즐기는 연희의 RPG 대모험\n기획 · 개발 : HC\n플레이해 주셔서 감사합니다!/.test(cr) && !/아르셀리아|Claude/.test(cr), '엔딩 크레딧');
    await pg.screenshot({ path: D + '/7_credits.png' });
    ok(errs.filter(e => !/테스트 오류/.test(e)).length === 0, '브라우저 오류 없음 ' + JSON.stringify(errs.slice(0, 3)));
    await pg.close();
  }
  // ---------- 2. 플레이어용 EXE 흉내 (dev.js 없음) ----------
  {
    const { pg, errs, ev } = await boot(b, { electron: true, dev: false });
    const t = await ev(() => ({ ver: document.querySelector('.title-ov .ver')?.textContent, dev: !!document.querySelector('[data-act=dev]'), gdev: !!G.Dev, where: document.querySelector('.title-ov .dim:last-of-type')?.textContent || document.querySelector('.title-ov').innerText }));
    ok(t.ver === 'v2.1.0', '플레이어용 버전 ' + t.ver);
    ok(!t.dev && !t.gdev, '플레이어용 테스트 모드 없음');
    ok(/문서\/RPG Adventure\/Save Data(?! \()/.test(t.where), '저장 위치 문구');
    await pg.screenshot({ path: D + '/8_player_title.png' });
    // 새 캐릭터 만들지 않고 저장 데이터로 시작: 세이브 주입 (f_06 완료, f_07 미완료 → 정수 3개)
    const r = await ev(async () => {
      const d = G.Player.newData('연희', G.LOOKS.random()); d.tut = null; d.map = 'nox_camp' in G.MAPS ? 'nox_camp' : d.map;
      d.quests = { f_06: { s: 'done' } };
      G.Save.slot = 'A'; G.Game.begin(d);
      await new Promise(r => setTimeout(r, 300));
      const cnt = d.inv.use.reduce((n, s) => n + (s && s.tid === 'pot_essence' ? s.qty : 0), 0);
      // 다시 begin 해도 두 번 주지 않음
      G.Game.begin(d);
      const cnt2 = d.inv.use.reduce((n, s) => n + (s && s.tid === 'pot_essence' ? s.qty : 0), 0);
      return { cnt, cnt2, log: document.getElementById('log').innerText };
    });
    ok(r.cnt === 3 && r.cnt2 === 3, `기존 세이브(f_06 완료) 정수 지급 ${r.cnt} → 다시 시작 ${r.cnt2}`);
    // 버그 신고 EXE
    await pg.keyboard.press('F9'); await pg.waitForTimeout(300);
    await pg.click('[data-bug=make]'); await pg.waitForTimeout(800);
    const bug = await ev(() => window.__bug[0]);
    ok(bug && bug.slot === 'A' && /"name":"연희"/.test(bug.save || '') && /버전: v2\.1\.0\n/.test(bug.info), 'EXE 버그 신고 데이터 (세이브 · 정보)');
    ok(!/DEV/.test(bug.info), '플레이어용 신고에 DEV 없음');
    await pg.screenshot({ path: D + '/9_exe_bug_done.png' });
    ok(errs.length === 0, '플레이어용 오류 없음 ' + JSON.stringify(errs.slice(0, 3)));
    await pg.close();
  }
  // ---------- 3. 테스트용 EXE 흉내 ----------
  {
    const { pg, errs, ev } = await boot(b, { electron: true, dev: true });
    const t = await ev(() => ({ ver: document.querySelector('.title-ov .ver')?.textContent, dev: !!document.querySelector('[data-act=dev]'), txt: document.querySelector('.title-ov').innerText }));
    ok(t.ver === 'v2.1.0 DEV' && t.dev && /Save Data \(DEV\)/.test(t.txt), '테스트용: DEV 표시 · 테스트 모드 · 저장 위치');
    ok(errs.length === 0, '테스트용 오류 없음 ' + JSON.stringify(errs.slice(0, 3)));
    await pg.close();
  }
  await b.close();
})();
