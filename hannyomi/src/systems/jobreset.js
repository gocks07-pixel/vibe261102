'use strict';
// 빌드 14: 갈림길의 증표 — 바람결 마을 갈림길의 현자 오르웬(새 NPC, 사용자 결정: 가렌 → 세라 → 새 현자)에게서 1장 받아 각성 Ⅰ 직업을 한 번 바꿈 (각성 Ⅱ 전까지)
//  각성 오류 대응용 1회성 → 나중 빌드에서 지울 때: 이 파일 · index.html 줄 · src/render/sage_npc.js 를 빼고, 불러올 때 job_ticket 정리 (quest.js closeOtherPaths 는 남김)
//  계획 docs/drafts/plan_build14.md · 세이브: 증표 아이템 + 플래그 'jobReset:given' / 'jobReset:used' 만 (형식 그대로)
//  dialog.js 가 G.JobReset.opts(npc) 로 선택지를 받음. PC · EXE 와 같이 쓰는 파일
G.JobReset = (function () {
  const NPC = 'orwen', TID = 'job_ticket';
  // 새 NPC: 그림은 src/render/sage_npc.js (G.NPCArt.sage), look 은 그림이 없을 때 쓰는 대신 모습
  G.NPCS[NPC] = { name: '오르웬', title: '갈림길의 현자', art: 'sage',
    look: { hair: '#f4f3ee', top: '#2e3f74', bottom: '#1c264c', style: 'long', beard: true, hat: '#2e3f74' },
    greet: ['길은 한 번 고르면 끝이 아니라네. 걷다 보면 갈림길은 또 나오는 법이지.', '별은 길을 잃은 자에게 더 밝게 보인다네.', '서두를 것 없네. 자네의 걸음에 맞는 길이 있을 걸세.'] };
  { const M = G.MAPS.wind_village; if (M && !M.npcs.some(n => n.id === NPC)) M.npcs.push({ id: NPC, x: 1530 }); }   // 빈스(1360)와 그렌(1700) 사이
  G.ITEMS[TID] = { id: TID, name: '갈림길의 증표', cat: 'etc', icon: 'scroll', color: '#c8a8ff', stack: 1, price: 0, quest: true, noSell: true, noStore: true,
    desc: '바람결 마을의 현자 오르웬에게 가져가면 각성 Ⅰ 직업을 한 번 바꿀 수 있다. (각성 Ⅱ 전까지)' };
  const FAM = [['warrior', '전사', 'sword_iron'], ['archer', '궁수', 'bow_hunter'], ['mage', '마법사', 'wand_novice'], ['thief', '도적', 'dagger_twin']];
  const tierOf = job => (G.JOBS[job] && G.JOBS[job].tier) || 0;
  const can = p => p && tierOf(p.d.job) === 1;   // 각성 Ⅰ 직업 (각성 Ⅱ 전)
  const has = p => G.Inv.count(p, TID) > 0;
  function opts(npcId, D) {
    const p = G.Game.player; if (npcId !== NPC || !p) return [];
    const f = p.d.flags;
    if (has(p)) return can(p) ? [{ label: '✦ 갈림길의 증표로 다른 길 걷기', fn: () => choose(D) }] : [{ label: '✦ 갈림길의 증표', fn: () => D.show({ text: '자네의 길은 이미 깊어졌네. 각성 Ⅱ 를 마친 뒤에는 되돌릴 수 없다네.', opts: [{ label: '확인', fn: () => D.close() }] }) }];
    if (f['jobReset:given']) return [];
    if (p.d.job === 'beginner') return [];
    return [{ label: '✦ 다른 길을 걷고 싶어요', fn: () => {
      if (!can(p)) { D.show({ text: '자네의 길은 이미 깊어졌네. 각성 Ⅱ 를 마친 뒤에는 되돌릴 수 없다네.', opts: [{ label: '확인', fn: () => D.close() }] }); return; }
      f['jobReset:given'] = 1; G.Inv.add(p, TID, 1); G.UI.log('갈림길의 증표를 받았어요. (현자 오르웬에게 가져가면 각성 Ⅰ 직업을 한 번 바꿀 수 있어요)', '#c8b8ff'); G.Audio.play('quest'); G.UI.dirty(); G.Game.save(true);
      D.show({ text: '처음 고른 길이 발에 맞지 않을 때도 있지. 이 증표를 받게.\n각성 Ⅱ 를 하기 전이라면 언제든 내게 가져오게. 한 번은 다른 길을 걸을 수 있도록 별에 새겨 두겠네.', opts: [{ label: '지금 바꾸기', fn: () => choose(D) }, { label: '나중에', fn: () => D.close() }] });
    } }];
  }
  function choose(D) {
    const p = G.Game.player, cur = G.familyOf(p.d.job);
    const list = FAM.filter(([id]) => id !== cur).map(([id, nm]) => ({ label: `${nm}의 길`, fn: () => confirm(D, id, nm) }));
    list.push({ label: '취소', fn: () => D.close() });
    D.show({ text: `어느 길로 가겠나? 지금 자네는 ${G.JOBS[p.d.job].name}일세.\n(능력 · 기술 포인트는 모두 돌려받고, 새 길의 초보 무기도 챙겨 주겠네)`, opts: list, list: true });
  }
  function confirm(D, id, nm) {
    D.close();
    G.UI.ask(`<b>${G.U.esc(nm)}</b>(으)로 바꿀까요?<br><span style="font-size:13px">갈림길의 증표 1장을 써요 · 능력 포인트와 기술 포인트는 모두 돌려받아요<br>지금 직업의 각성 Ⅰ 스킬은 빠지고, 진행 중인 각성 Ⅱ 시험은 닫혀요</span>`, '바꾸기', () => apply(id));
  }
  function apply(job) {
    const p = G.Game.player, d = p.d, old = d.job, oldFam = G.familyOf(old);
    if (!can(p) || !has(p) || G.familyOf(job) === oldFam) return;
    G.Inv.remove(p, TID, 1);
    // 예전 각성 Ⅰ 스킬 빼기 (표류자 스킬은 그대로) · 스킬 칸에서 비우기
    const oldIds = new Set(G.skillsOfJob(old).map(s => s.id));
    for (const id of oldIds) delete d.skills[id];
    d.hot = d.hot.map(id => (id && oldIds.has(id) ? null : id));
    // 예전 직업 전용 장비는 가방으로
    for (const slot of Object.keys(d.eq)) { const it = d.eq[slot]; if (!it) continue; const t = G.ITEMS[it.tid]; if (t.job && t.job !== 'any' && t.job !== job) { const k = d.inv.equip.indexOf(null); if (k >= 0) { d.inv.equip[k] = it; d.eq[slot] = null; } } }
    // 진행 중인 예전 직업 각성 Ⅱ 시험 닫기
    for (const qid of Object.keys(d.quests)) { const q = G.QUESTS[qid]; if (q && q.job && G.Quest.isActive(qid) && q.cond && G.JOBS[q.act.job] && G.JOBS[q.act.job].prev === old) delete d.quests[qid]; }
    // 능력 포인트 돌려받기 (각성 Ⅰ 때와 같은 방식) + 직업 바꾸기
    const spent = G.STATS4.reduce((n, k) => n + d.base[k] - 4, 0); for (const k of G.STATS4) d.base[k] = 4; d.ap += spent;
    d.job = 'beginner'; p.changeJob(job);   // changeJob 이 새 스킬 · 기술 포인트(G.SP.sync)를 맞춤
    // 새 직업 초보 무기
    const w = FAM.find(f => f[0] === job)[2];
    if (G.ITEMS[w]) { const it = G.Items.create(w, { plain: true }), k = d.inv.equip.indexOf(null);   // 바로 낌 (끼던 무기는 가방으로, 가방이 차면 새 무기를 가방에)
      if (!d.eq.weapon) d.eq.weapon = it; else if (k >= 0) { d.inv.equip[k] = d.eq.weapon; d.eq.weapon = it; } else { const k2 = d.inv.equip.indexOf(null); if (k2 >= 0) d.inv.equip[k2] = it; } }
    d.flags['jobReset:used'] = 1;
    p.recalc(); p.hp = p.st.maxHP; p.mp = p.st.maxMP;
    G.UI.banner(`${G.JOBS[job].name}의 길`, '갈림길의 증표를 썼어요 · 능력 · 기술 포인트를 다시 배분하세요');
    G.UI.log(`[갈림길의 증표] ${G.JOBS[old].name} → ${G.JOBS[job].name}. 능력 포인트 ${d.ap}점 · 기술 포인트를 돌려받았어요.`, '#c8b8ff');
    G.Audio.play('levelup'); G.UI.dirty(); G.Game.save(true);
  }
  // 예전 세이브: 이미 각성한 단계의 다른 각성 시험이 남아 있으면 정리
  const wrapBegin = () => { const begin0 = G.Game && G.Game.begin; if (!begin0 || begin0.__jr) return;
    G.Game.begin = function () { const r = begin0.apply(this, arguments); try { if (G.Quest && G.Quest.closeOtherPaths) G.Quest.closeOtherPaths(null, true); } catch (e) { /* 정리만 실패 */ } return r; }; G.Game.begin.__jr = true; };
  if (typeof window !== 'undefined') window.addEventListener('load', wrapBegin);   // main.js(G.Game) 가 뒤에 불러와져서 load 때 감쌈
  return { opts, apply, can, TID };
})();
