'use strict';
// ============================================================
// 빌드 3 (19): 각성 직업 설명 카드
//  각성 시험을 받을 때 · 완료할 때(직업을 고를 때) 대화 대신 먼저 카드를 보여 준다
//  각성 Ⅱ: 두 갈래를 나란히 → [이 직업으로 각성] → 마지막 확인 / 각성 Ⅰ · Ⅲ · Ⅳ: 카드 1장
//  이름 · 이어지는 길 · 스킬은 데이터(G.JOBS · G.JOB_TREE · G.skillsOfJob)에서, 형 설명은 G.Play.FAM, 잘하는 것 · 난이도는 아래 LINE
// ============================================================
G.JobCard = {
  // 갈래마다 잘하는 것 · 난이도 (★ 1~3)
  LINE: {
    warrior_a: { good: '넓은 범위 · 빠른 사냥', diff: 2 },
    warrior_b: { good: '버티기 · 보스전', diff: 1 },
    archer_a: { good: '여러 마리 · 빠른 사냥', diff: 2 },
    archer_b: { good: '한 마리에게 센 한 방 · 보스전', diff: 3 },
    mage_a: { good: '아주 넓은 범위 · 사냥', diff: 1 },
    mage_b: { good: '꿰뚫기 · 치명타 · 보스전', diff: 2 },
    thief_a: { good: '돌진 연타 · 보스전', diff: 3 },
    thief_b: { good: '독 쌓기 · 여러 마리', diff: 2 },
  },
  star(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); },
  famOf(id) { const J = G.JOBS[id]; return J.tier === 1 ? id : J.family; },
  // 그 직업에서 새로 배우는 스킬 (공격 · 버프)
  skills(id) {
    const sk = G.skillsOfJob(id);
    const at = sk.filter(s => s.type === 'attack').map(s => s.name), bf = sk.filter(s => s.type === 'buff').map(s => s.name);
    const etc = sk.filter(s => s.type !== 'attack' && s.type !== 'buff').map(s => s.name);
    return `<div class="jc-l dim">새 공격 스킬: ${at.join(' · ') || '-'}</div><div class="jc-l dim">새 버프: ${bf.join(' · ') || '-'}${etc.length ? ` · 그 밖: ${etc.join(' · ')}` : ''}</div>`;
  },
  card(q, btn, status, mine) {
    const id = q.act.job, J = G.JOBS[id], fam = this.famOf(id), F = G.Play.FAM[fam], N = G.STAT_NAMES, esc = G.U.esc;
    let h = `<div class="job-card ${mine ? 'mine' : ''}">`;
    if (J.tier === 1) {
      const tree = G.JOB_TREE[fam];
      h += `<div class="jc-h">${F.ic} <b>${esc(J.name)}</b> <span class="dim">${esc(F.tag)}</span></div>
        <div class="jc-l">주스탯 <b>${N[J.main]}</b> · 부스탯 ${N[J.sub]} · 무기 ${esc(F.w)} · 난이도 ${this.star(F.diff)}</div>
        <div class="jc-l">앞으로 두 갈래: ${esc(tree[0][0])} (${esc(F.lines[0].split(' · ')[0])}) / ${esc(tree[1][0])} (${esc(F.lines[1].split(' · ')[0])})</div>`;
    } else {
      const li = J.line === 'a' ? 0 : 1, tree = G.JOB_TREE[fam][li], L = this.LINE[`${fam}_${J.line}`] || {};
      const rest = tree.slice(J.tier - 1);
      h += `<div class="jc-h">${F.ic} <b>${esc(J.name)}</b>${rest.length ? ` <span class="dim">→ ${rest.map(esc).join(' → ')}</span>` : ''}</div>
        <div class="jc-l">${esc(F.lines[li])}</div>
        <div class="jc-l">잘하는 것: <b>${esc(L.good || '-')}</b> &nbsp; 난이도 ${this.star(L.diff || 2)}</div>`;
    }
    h += this.skills(id);
    h += `<div class="jc-b">${btn != null ? btn : `<span class="jc-st">${status || ''}</span>`}</div></div>`;
    return h;
  },
  // 같은 교관 · 같은 각성 단계의 시험들 (지금 직업에서 갈 수 있는 것)
  group(q) {
    const p = G.Game.player, tier = G.JOBS[q.act.job].tier;
    if (tier === 1) return [q];
    return Object.values(G.QUESTS).filter(x => x.job && x.act && x.act.job && x.start === q.start && G.JOBS[x.act.job].tier === tier && (!x.cond || x.cond(p)) && !G.Quest.isDone(x.id));
  },

  // Dialog.quest 에서 부름. true 면 카드가 대신 처리
  show(D, e) {
    const q = e.q;
    if (!q.job || !q.act || !q.act.job || e.card) return false;
    const tier = G.JOBS[q.act.job].tier;
    if (e.mode === 'end' && tier === 1) return false;   // 각성 Ⅰ 은 시험을 받을 때 카드 (교관마다 하나)
    const Q = G.Quest, list = this.group(q), esc = G.U.esc;
    const fns = [];
    const cards = list.map(x => {
      let btn = null, status = '';
      if (e.mode === 'end') {
        if (Q.ready(x)) { btn = `<button class="btn gold" data-act="ask" data-arg="c${fns.length}">이 직업으로 각성</button>`; fns.push(() => this.confirm(D, x, list)); }
        else status = Q.isActive(x.id) ? '시험 진행 중' : '시험을 받지 않았어요';
      } else {
        if (!Q.st(x.id) && Q.available(x)) { btn = `<button class="btn gold" data-act="ask" data-arg="c${fns.length}">이 시험 받기</button>`; fns.push(() => D.quest({ q: x, mode: 'start', card: true })); }
        else status = Q.isActive(x.id) ? (Q.ready(x) ? '시험 완료 · 교관에게 보고' : '시험 진행 중') : '';
      }
      return this.card(x, btn, status, x.id === q.id && list.length > 1 && false);
    });
    const tn = G.tierName(tier), two = list.length > 1;
    const title = e.mode === 'end' ? (two ? `✨ ${tn} — 어느 길로 갈까요?` : `✨ ${tn} — ${esc(G.JOBS[q.act.job].name)}`) : `📜 ${tn} 시험${two ? ' — 두 갈래' : ''}`;
    const sub = e.mode === 'end'
      ? (two ? '하나를 고르면 각성 Ⅳ 까지 그 길로 이어지고, 다시 바꿀 수 없어요.' : '시험을 마쳤어요. 각성하면 새 스킬을 배울 수 있어요.')
      : (two ? '두 갈래 중 마음에 드는 시험을 받으세요. 둘 다 받아 볼 수도 있지만, 하나를 완료하면 나머지는 닫혀요.' : (tier === 1 ? '한 번 정한 계열은 바꿀 수 없어요.' : '이 시험을 마치면 다음 각성으로 넘어가요.'));
    D.close();
    G.UI.panel(`<h3>${title}</h3><div class="dim">${sub}</div><div class="jcards">${cards.join('')}</div>
      <div class="end"><button class="btn" data-act="ask" data-arg="no">${e.mode === 'end' ? '조금 더 생각할게요' : '닫기'}</button></div>`, fns, 'jobp');
    return true;
  },
  confirm(D, q, list) {
    const J = G.JOBS[q.act.job], others = list.filter(x => x !== q).map(x => G.JOBS[x.act.job].name), esc = G.U.esc;
    G.UI.ask(`<b style="color:#ffe08a">${esc(J.name)}</b>(으)로 각성할까요?<br><span style="font-size:12px;color:#c8c0e0">한 번 고르면 바꿀 수 없어요.${others.length ? ` 다른 시험(${others.map(esc).join(', ')})은 닫혀요.` : ''}</span>`, '각성하기', () => {
      if (!G.Quest.complete(q.id)) return;
      const p = G.Game.player;   // 다른 갈래 시험은 닫힘 (받아 둔 것은 진행 목록에서 지움)
      for (const x of list) if (x !== q && G.Quest.isActive(x.id)) { delete p.d.quests[x.id]; if (G.Nav.qid === x.id) G.Nav.clear(); }
      G.UI.dirty();
      D.seq(q.dlg.end, q, [{ label: '확인', fn: () => D.close() }]);
    });
  },
};
