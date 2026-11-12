'use strict';
// PC · EXE (hannyomi-backup): 휴대폰 전용 src/ui/play.js 가 없을 때, PC 에서도 쓰는 G.Play 부분만 채움 (내용은 play.js 와 글자 그대로 같게 유지)
//  - FAM: 각성 직업 카드(src/ui/jobcard.js)의 직업 형 설명 (빌드 3)
//  - recValue · recommend · recPreview: 스킬 창 [사냥 · 보스 추천 배치] (빌드 4 · 13)
//  - statsWith · score · better · fits · slotFor: 장비 일괄 판매 창 G.Win.bulk (빌드 4 · 14)
//  play.js 가 먼저 불려 같은 이름이 이미 있으면 아무것도 하지 않음
G.Play = G.Play || {};
if (!G.Play.FAM) G.Play.FAM = {
  warrior: { ic: '⚔', w: '검', tag: '가까이서 베기', diff: 1, lines: ['불꽃 검기로 멀리까지 베는 공격형', '방패와 빛으로 버티는 방어형 · HP · 방어가 높아요'] },
  archer: { ic: '🏹', w: '활', tag: '멀리서 화살', diff: 2, lines: ['화살을 여러 발 흩뿌리는 빠른 연사형', '물러나며 쏘는 한 방 저격형 · 치명타 · 방어 무시'] },
  mage: { ic: '🔮', w: '지팡이', tag: '멀리서 마법 · 넓은 범위', diff: 2, lines: ['하늘에서 불을 떨어뜨리는 넓은 범위형', '얼음 파편으로 꿰뚫는 치명타형'] },
  thief: { ic: '🗡', w: '단검', tag: '빠른 연타 · 치명타', diff: 3, lines: ['그림자처럼 돌진해 급소를 찌르는 형', '독 단검을 던지고 독을 쌓는 형'] },
};

// 빌드 4: play.js 와 같은 함수 (없을 때만)
(function () {
  const PC = {
  // 한 번 쓸 때 피해 (피해% × 타수 × 맞는 수 × 발 수)
  recValue(sk, lv, boss) {
    const a = sk.atk; if (!a || !a.pct) return 0;
    let n = 1, mult = a.count || 1;
    if (!boss) {
      if (a.kind === 'proj' || a.kind === 'back') n = Math.min(3, a.pierce || 1);
      else if (a.kind === 'rain') { n = 1; mult = (a.count || 1) * 0.6; }
      else n = Math.min(5, a.targets || 1);
    }
    return a.pct(lv) / 100 * (a.hits || 1) * n * mult;
  },
  //  1) 재사용 1초 안 기술 중 한 번 피해가 가장 센 것 = 기본으로 계속 쓰는 기술
  //  2) 나머지는 "기본 기술 대신 썼을 때 더 들어가는 피해 ÷ 재사용" 순 (궁극기처럼 재사용이 길어도 세면 들어감)
  recommend(boss) {
    const p = G.Game.player, d = p.d, T = 0.8;
    const learned = G.jobChain(d.job).flatMap(j => G.skillsOfJob(j)).filter(sk => (d.skills[sk.id] || 0) > 0);
    const atk = learned.filter(sk => sk.type === 'attack').map(sk => ({ sk, v: this.recValue(sk, d.skills[sk.id], boss), cd: sk.cd || 0 }));
    const awake = learned.filter(sk => sk.type === 'buff' && (sk.cd || 0) >= 30).pop();   // 각성 버프 (재사용 60초)
    const nAtk = awake ? 5 : 6;
    const fill = atk.filter(x => x.cd <= 1).sort((a, b) => b.v - a.v)[0];
    const fv = fill ? fill.v : 0;
    const rest = atk.filter(x => x !== fill).map(x => Object.assign(x, { s: (x.v - fv) / Math.max(T, x.cd) })).sort((a, b) => b.s - a.s || b.v - a.v);
    const pick = (fill ? [fill] : []).concat(rest).slice(0, nAtk).map(x => x.sk);
    // 칸 순서: 한 번 피해가 센 순 (기본 기술은 맨 뒤)
    pick.sort((a, b) => (a === (fill && fill.sk)) - (b === (fill && fill.sk)) || this.recValue(b, d.skills[b.id], boss) - this.recValue(a, d.skills[a.id], boss));
    if (awake) pick.push(awake);
    const hot = pick.map(sk => sk.id);
    while (hot.length < 6) hot.push(null);
    return hot;
  },
  recPreview(kind) {
    const p = G.Game.player; if (!p) return;
    const d = p.d, boss = kind === 'boss', hot = this.recommend(boss), esc = G.U.esc;
    const row = ids => '<div class="rec-slots">' + ids.map((id, i) => { const sk = id && G.SKILLS[id];
      return `<div class="rs">${sk ? `<img src="${G.Icons.skill(sk)}">` : '<span class="rs-e"></span>'}<div>${i + 1}. ${sk ? esc(sk.name) : '(빈 칸)'}</div></div>`; }).join('') + '</div>';
    const same = hot.every((id, i) => (d.hot[i] || null) === id);
    const buffs = G.jobChain(d.job).flatMap(j => G.skillsOfJob(j)).filter(sk => sk.type === 'buff' && (d.skills[sk.id] || 0) > 0 && !hot.includes(sk.id)).map(sk => esc(sk.name));
    G.UI.panel(`<h3>${boss ? '👑 보스 추천 배치' : '⚔ 사냥 추천 배치'}</h3>
      <div class="dim">${boss ? '한 마리에게 센 기술' : '여러 마리를 한 번에 치는 기술'} · 계속 쓰는 기술 1개 + 재사용마다 더 들어가는 피해가 큰 순</div>
      <div class="rec-h">지금</div>${row([0, 1, 2, 3, 4, 5].map(i => d.hot[i] || null))}
      <div class="rec-h">바뀐 뒤</div>${row(hot)}
      <div class="dim" style="font-size:11.5px;line-height:1.5">${hot[5] && G.SKILLS[hot[5]].type === 'buff' ? '· 6번 칸은 각성 버프 (재사용이 짧아 칸에 둠)<br>' : ''}${buffs.length ? `· 칸에 없는 버프(${buffs.join(' · ')})는 <b>자동 사냥 · 자동 보스 중에 꺼지면 저절로 켜요</b>. 직접 할 때는 스킬 창에서 눌러 켜요` : ''}</div>
      <div class="end">${same ? '<span class="dim" style="margin-right:8px">지금 배치와 같아요</span>' : ''}<button class="btn" data-act="ask" data-arg="no">취소</button> <button class="btn gold" data-act="ask" data-arg="c0" ${same ? 'disabled' : ''}>이대로 바꾸기</button></div>`,
      [() => { d.hot = hot.slice(); G.UI.log(`${boss ? '👑 보스' : '⚔ 사냥'} 추천 배치로 스킬 칸을 바꿨어요.`, '#ffe08a'); G.UI.dirty(); if (G.UI.isOpen('skill')) G.UI.renderWin('skill'); }], 'jobp');
  },
  // 자동 사냥 · 자동 보스 중: 칸에 없는 버프도 꺼지면 켬 (빌드 4 · 13)
  statsWith(eq) { const p = G.Game.player; return G.Stats.calc({ d: Object.assign({}, p.d, { eq }), buffs: {} }); },
  // 사냥 기준 예상 피해: 평균 공격력 × 치명타 기대값 × 피해% × 공격 속도
  score(s) { return (s.minDmg + s.maxDmg) / 2 * (1 + s.crit / 100 * s.critDmg / 100) * (1 + s.dmgp / 100) / (1 - Math.min(50, s.aspd) / 100); },
  better(a, b) {   // a 가 b 보다 좋은가 (예상 피해 우선, 거의 같으면 HP + 방어)
    const sa = this.score(a), sb = this.score(b);
    if (sa > sb * 1.0005) return true;
    if (sa < sb * 0.9995) return false;
    return a.maxHP + a.def * 5 > b.maxHP + b.def * 5;
  },
  fits(t, slot) { return t.slot === slot || (t.slot === 'ring' && (slot === 'ring1' || slot === 'ring2')); },
  // 반지는 둘 중 바꿨을 때 더 좋은 쪽(= 더 약한 쪽)
  slotFor(it, eq) {
    const t = G.ITEMS[it.tid];
    if (t.slot !== 'ring') return t.slot;
    if (!eq.ring1) return 'ring1';
    if (!eq.ring2) return 'ring2';
    const a = this.statsWith(Object.assign({}, eq, { ring1: it })), b = this.statsWith(Object.assign({}, eq, { ring2: it }));
    return this.better(b, a) ? 'ring2' : 'ring1';
  },
  };
  for (const k in PC) if (!(k in G.Play)) G.Play[k] = PC[k];
})();
