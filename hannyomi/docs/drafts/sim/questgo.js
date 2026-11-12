// 2차-1.6 퀘스트 "▶ 이동" 검사: 모든 퀘스트 × (목표마다 진행 중 · 완료 가능) 에서 G.Play.questDest 가 가리키는 맵을 계산
//  확인: 있는 맵인지 · 보스 방이 아닌지 · 보스 목표는 그 보스 방으로 들어가는 포탈이 있는 맵인지 · 길 안내 목표 맵과 같은 곳(또는 그 앞)인지
//  실행: node questgo.js <게임 주소> <덤프(아무 캐릭터)>
const { chromium, devices } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext(devices['iPhone 13 landscape'])).newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(process.argv[2] + '/index.html'); await pg.waitForTimeout(800);
  const r = await pg.evaluate(dump => {
    G.Mobile.closeModal(); const d = JSON.parse(dump); G.Game.loop = () => {}; G.UI.overlay(''); G.Game.begin(d);
    const Q = G.Quest, ready0 = Q.ready.bind(Q), prog0 = Q.progress.bind(Q), act0 = Q.isActive.bind(Q);
    const out = { checked: 0, bad: [], samples: [] };
    const bossOf = {}; for (const id of Object.keys(G.MAPS)) if (G.MAPS[id].bossRoom) for (const s of G.MAPS[id].spawns || []) bossOf[s.m] = id;
    for (const from of ['sprout_port', 'aeros']) {
      G.Game.changeMap(from, null);
      for (const q of Object.values(G.QUESTS)) {
        const states = q.obj.map((o, i) => ({ i })).concat([{ ready: true }]);
        for (const stt of states) {
          Q.isActive = id => id === q.id || act0(id);
          Q.ready = qq => qq.id === q.id ? !!stt.ready : ready0(qq);
          Q.progress = (qq, o) => { if (qq.id !== q.id) return prog0(qq, o); const i = q.obj.indexOf(o), n = o.n || 1; return stt.ready || i < stt.i ? [n, n] : [0, n]; };
          let dest = null, err = null; try { const d = G.Play.questDest(q); dest = d && d.map; } catch (e) { err = String(e); }
          const tg = G.Nav.targets(q), maps = [...(tg.maps || [])];
          out.checked++;
          const o = stt.ready ? null : q.obj[stt.i], nx = o && Object.keys(G.MONSTERS).find(id => G.MONSTERS[id].next === o.mon), isBoss = o && o.t === 'kill' && (bossOf[o.mon] || (nx && bossOf[nx]));
          const why = err ? 'error ' + err
            : !dest ? (maps.includes(from) ? null : 'no-dest')
            : !G.MAPS[dest] ? 'bad-map' : G.MAPS[dest].bossRoom ? 'boss-room'
            : isBoss ? ((G.MAPS[dest].portals || []).some(p => p.to === isBoss) ? null : 'not-front-of-boss')
            : (maps.includes(dest) || (!maps.length) ? null : 'not-target');
          if (why) out.bad.push({ from, q: q.id, state: stt.ready ? 'ready' : 'obj' + stt.i, dest, maps, why });
          if (out.samples.length < 6 && isBoss) out.samples.push({ q: q.id, boss: o.mon, room: isBoss, dest });
        }
      }
    }
    Q.isActive = act0; Q.ready = ready0; Q.progress = prog0;
    return out;
  }, fs.readFileSync(process.argv[3], 'utf8'));
  console.log(JSON.stringify({ checked: r.checked, bad: r.bad.length, badList: r.bad.slice(0, 30), samples: r.samples, errs }, null, 1));
  await b.close();
})();
