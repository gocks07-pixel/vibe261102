'use strict';
// NPC 대화창: 메뉴(퀘스트/상점/이동) → 대사 넘기기 → 수락/완료
G.Dialog = {
  el: null, npc: null, opts: [],
  isOpen() { return !!this.el; },

  open(npcId) {
    const n = G.NPCS[npcId], p = G.Game.player;
    if (!n || p.dead) return;
    this.npc = npcId;
    G.UI.hideTip();
    G.Tutorial.ev('talk:' + npcId);
    const entries = G.Quest.entriesFor(npcId);
    // 할 일이 퀘스트 하나뿐이면 바로 진행
    const pick = npcId === 'astra' && p.d.flags.heroPick > 0;   // 1.7.12 아직 고르지 않은 갑옷
    if (entries.length === 1 && !pick && !n.shop && !n.travel && !n.storage && entries[0].mode !== 'progress') { this.quest(entries[0]); return; }
    const opts = entries.map(e => ({
      label: `${e.q.type === 'main' ? '★ [메인]' : '◆ [서브]'} ${e.q.name}${e.mode === 'end' ? ' (완료 가능)' : e.mode === 'progress' ? ' (진행 중)' : ''}`,
      fn: () => this.quest(e),
    }));
    if (npcId === 'elma_nox') opts.unshift(...G.Hidden.elmaOpts(this));   // 2.0 별조각의 기억 / 속삭임
    if (pick) opts.unshift({ label: `✦ 영웅의 갑옷 고르기 (남은 ${p.d.flags.heroPick}개)`, fn: () => { this.close(); G.UI.openWin('heroset'); } });
    if (n.shop) opts.push({ label: '🛒 상점 열기', fn: () => { this.close(); G.UI.openShop(npcId); } });
    if (n.shop && n.shop.some(id => G.ITEMS[id] && G.ITEMS[id].cat === 'equip')) opts.push({ label: '🔨 장비 단련 (골드로 단련 효과 다시 굴리기)', fn: () => { this.close(); G.UI.setTarget('smith', null); } });
    if (n.storage) opts.push({ label: '📦 창고 열기', fn: () => { this.close(); G.Storage.open(); } });
    if (n.travel === 'all') opts.push({ label: '🧭 다른 마을로 이동', fn: () => this.travelMenu() });
    else if (n.travel) opts.push({ label: `⛵ ${n.travel.label}`, fn: () => this.travel(n) });
    opts.push({ label: '대화 종료', fn: () => this.close() });
    // 빌드 1 (8번): 다음 각성이 스킬 마스터 때문에 막혔으면 알려 줌
    const blk = Object.values(G.QUESTS).map(q => q.start === npcId && !G.Quest.st(q.id) && p.d.level >= q.lv && q.pre.every(id => G.Quest.isDone(id)) && (!q.cond || q.cond(p)) && G.SP.blockedBy(p, q)).find(x => x);
    const greet = blk ? `다음 각성을 하려면 지금 각성의 스킬을 모두 익혀야 한다. 아직 ${blk.join(', ')}을(를) 다 익히지 못했군. (스킬 창에서 기술 포인트를 올려라)` : G.U.pick(n.greet || ['...']);
    this.show({ text: greet, opts, list: true });
  },

  quest(e) {
    const q = e.q;
    if (e.mode === 'start') {
      this.seq(q.dlg.start, q, [
        { label: '수락', fn: () => { G.Quest.accept(q.id); this.show({ text: q.dlg.accept || '부탁할게.', opts: [{ label: '확인', fn: () => this.close() }] }); } },
        { label: '거절', fn: () => this.close() },
      ]);
    } else if (e.mode === 'progress') {
      const prog = q.obj.map(o => '• ' + G.Quest.objText(q, o)).join('\n');
      this.show({ text: (q.dlg.progress || '아직 끝나지 않은 것 같은데?') + (prog ? '\n' + prog : ''), title: q.name, opts: [{ label: '확인', fn: () => this.close() }] });
    } else if (q.choice) {   // 엔딩 선택
      // 2.0: 히든 엔딩 조건을 다 채우면 금색 세 번째 버튼, 못 채웠으면 엘마가 귀띔
      const lines = G.Hidden.ready() ? q.dlg.end : [G.Hidden.WHISPER].concat(q.dlg.end);
      this.seq(lines, q, G.Hidden.choices(q).map(c => ({ label: c.label, gold: c.gold, fn: () => { if (G.Quest.complete(q.id)) { this.close(); G.Ending.play(c.ending); } } })));
    } else {
      this.seq(q.dlg.end, q, [{ label: '완료', fn: () => { if (G.Quest.complete(q.id)) this.close(); } }]);
    }
  },

  travelMenu() {
    const p = G.Game.player, cur = G.Game.world.mapId;
    const list = G.TRAVEL.filter(t => t.to !== cur && (!t.flag || p.d.flags[t.flag]));
    const opts = list.map(t => ({ label: `→ ${t.label}`, fn: () => { this.close(); G.UI.log(`${t.label}(으)로 이동합니다.`, '#bfe6ff'); G.Game.changeMap(t.to, null); } }));
    opts.push({ label: '취소', fn: () => this.close() });
    this.show({ text: list.length ? '어디로 모실까요? (이야기를 진행하면 갈 수 있는 곳이 늘어납니다)' : '아직 갈 수 있는 다른 마을이 없네요.', opts, list: true });
  },

  seq(lines, q, finalOpts) {
    let i = 0;
    const step = () => {
      const raw = lines[i], me = raw.startsWith('@'), last = i === lines.length - 1;
      this.show({
        text: me ? raw.slice(1) : raw, me, title: q.name,
        reward: last ? G.Quest.rewardText(q) : null,
        opts: last ? finalOpts : [{ label: '다음 ▶', fn: () => { i++; step(); } }],
      });
    };
    step();
  },

  travel(n) {
    const t = n.travel, p = G.Game.player;
    if (t.flag && !p.d.flags[t.flag]) { this.show({ text: t.fail, opts: [{ label: '확인', fn: () => this.close() }] }); return; }
    this.close();
    G.UI.log(`${G.MAPS[t.to].name}(으)로 이동합니다.`, '#bfe6ff');
    G.Game.changeMap(t.to, t.portal);
  },

  show({ text, me, opts, list, title, reward }) {
    const n = G.NPCS[this.npc], p = G.Game.player;
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.className = 'win'; this.el.id = 'dialog';
      G.UI.root.appendChild(this.el);
    }
    this.el.style.zIndex = 35;
    this.opts = opts;
    const who = me ? `${G.U.esc(p.d.name)}` : `${n.name}<small>${n.title}</small>`;
    this.el.innerHTML = `<div class="wh">${title ? G.U.esc(title) : '대화'}<span class="x" data-act="dlg" data-arg="-1">✕</span></div>
      <div class="wb"><canvas class="por" width="96" height="120"></canvas>
      <div class="txt"><div class="who">${who}</div><div class="line ${me ? 'me' : ''}">${G.U.esc(text)}</div>
      ${reward ? `<div class="rew">보상: ${G.U.esc(reward)}</div>` : ''}
      <div class="opts ${list ? 'list' : ''}">${opts.map((o, i) => `<button class="btn ${(i === 0 && !list) || o.gold ? 'gold' : ''}${o.gold ? ' hid-gold' : ''}" data-act="dlg" data-arg="${i}">${G.U.esc(o.label)}</button>`).join('')}</div></div></div>`;
    const c = this.el.querySelector('canvas').getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#2a3456'); g.addColorStop(1, '#0e1220');
    c.fillStyle = g; c.fillRect(0, 0, 96, 120);
    if (me) G.Draw.humanoid(c, Object.assign(p.look(), { x: 46, y: 112, dir: 1, t: 0, atk: -1, scale: 1.45 }));
    else G.Draw.humanoid(c, { x: 46, y: 112, dir: 1, t: 0, atk: -1, scale: 1.45, look: Object.assign({ skin: '#ffe0c2' }, n.look) });
  },

  choose(i) {
    if (i < 0) { this.close(); return; }
    const o = this.opts[i];
    if (o) o.fn();
  },
  // Enter 키: 첫 번째 버튼 (목록형이면 무시)
  enter() {
    if (!this.el || this.el.querySelector('.opts.list')) return;
    this.choose(0);
  },
  close() {
    if (this.el) this.el.remove();
    this.el = null; this.opts = [];
  },
};
