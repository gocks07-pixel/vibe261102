'use strict';
// 장 전환 연출: 별조각 공명음, 챕터 클리어 팡파르, 챕터 타이틀 카드
G.Chapter = {
  // 0 프롤로그 ~ 7 종장
  NAMES: [
    ['프롤로그', '낯선 해변'], ['1장', '바람이 시작되는 곳'], ['2장', '은빛숲의 노래'], ['3장', '강철과 불꽃'],
    ['4장', '모래에 묻힌 진실'], ['5장', '얼어붙은 맹세'], ['6장', '별의 정체'], ['종장', '공허의 문'],
  ],
  // 장이 바뀌는 플래그 (이 플래그가 켜지면 그 장에 들어선 것)
  FLAGS: [null, 'ship', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7'],
  // 각 장의 마을 (처음 들어갈 때 타이틀 카드)
  TOWN: { sprout_port: 0, wind_village: 1, elenheim: 2, raghart: 3, sahrin: 4, frostbell: 5, aeros: 6, noxgate: 7 },
  // 별조각을 얻는 퀘스트 → 별조각 종류
  SHARD_Q: { m19: 'wind', c2_07: 'life', c3_07: 'earth', c4_07: 'sun', c6_04: 'ice', c6_07: 'sky', f_06: 'void' },
  SHARD: {
    wind: ['바람', '#7de3f0'], life: ['생명', '#7de08a'], earth: ['대지', '#d8a860'], sun: ['태양', '#ffb040'],
    ice: ['얼음', '#a8e0ff'], sky: ['하늘', '#c0c8ff'], void: ['공허', '#c060ff'],
  },
  // 장 마지막 퀘스트 → [장 번호, 부제]
  END_Q: {
    m10: [0, '대륙으로 떠나는 배에 올랐다'], m19: [1, '바람의 별조각'], c2_07: [2, '생명의 별조각'], c3_07: [3, '대지의 별조각'],
    c4_07: [4, '태양의 별조각'], c5_07: [5, '빼앗긴 얼음의 별조각'], c6_08: [6, '하늘의 별조각'],
  },

  label(i) { const n = this.NAMES[i]; return n ? `${n[0]} · ${n[1]}` : ''; },
  // 퀘스트의 ch 값('2장' 등)에 부제를 붙인다. 각성 퀘스트 등은 그대로
  qLabel(ch) { const i = this.NAMES.findIndex(n => n[0] === ch); return i < 0 ? ch : this.label(i); },
  current(d) {
    const f = d.flags || {};
    for (let i = this.FLAGS.length - 1; i > 0; i--) if (f[this.FLAGS[i]]) return i;
    return 0;
  },
  shardCount(d) { return Object.keys(this.SHARD_Q).filter(q => d.quests[q] && d.quests[q].s === 'done').length; },

  // 1.3 세이브: 이미 지나온 마을은 카드를 다시 보여 주지 않는다
  prepare(d) {
    if (d.cards) return;
    d.cards = {};
    const cur = this.current(d);
    for (const [town, ch] of Object.entries(this.TOWN)) if (ch < cur || d.town === town || d.map === town) d.cards[town] = 1;
    if (d.tut) delete d.cards.sprout_port;
  },

  // 맵에 들어갈 때. 카드를 보여 줬으면 true (음악은 카드가 끝난 뒤 시작)
  enter(mapId) {
    const p = G.Game.player;
    if (this.cardMap && this.cardMap !== mapId) this.hideCard();   // 카드가 끝나기 전에 마을을 떠남
    if (!p || !(mapId in this.TOWN)) return false;
    const d = p.d;
    if (!d.cards) d.cards = {};
    if (d.cards[mapId]) return false;
    d.cards[mapId] = 1;
    this.card(this.TOWN[mapId], mapId);
    return true;
  },
  card(i, mapId) {
    const n = this.NAMES[i];
    G.Music.stop(0.6);
    const bn = document.getElementById('banner'); if (bn) bn.innerHTML = '';   // 겹치는 배너 지우기
    const el = this.layer('chcard');
    el.innerHTML = `<div class="ch-card"><small>${G.U.esc(n[0])}</small><b>${G.U.esc(n[1])}</b></div>`;
    el.className = 'chfx card';
    clearTimeout(this.cardT);
    this.cardMap = mapId;
    this.cardT = setTimeout(() => {
      this.cardMap = null;
      el.className = 'chfx card out';
      if (G.Game.world && G.Game.world.mapId === mapId) G.Music.playMap(mapId, 1.5);
      setTimeout(() => { if (el.className === 'chfx card out') { el.className = 'chfx'; el.innerHTML = ''; } }, 900);
    }, 2800);
  },

  hideCard() {
    clearTimeout(this.cardT); this.cardMap = null;
    const el = document.getElementById('chcard');
    if (el) { el.className = 'chfx'; el.innerHTML = ''; }
  },

  // 퀘스트 완료 직후 (G.Quest.complete 에서 호출)
  onQuest(id) {
    const shard = this.SHARD_Q[id], end = this.END_Q[id];
    let delay = 0;
    if (shard) { this.resonance(shard); delay = 2.7; }
    if (end) setTimeout(() => this.fanfare(end[0], end[1]), delay * 1000 + 300);
  },
  resonance(el) {
    const p = G.Game.player, w = G.Game.world, color = this.SHARD[el][1];
    G.Music.resonance(el);
    if (!p || !w) return;
    p.markGlow = 2.8; p.markColor = color;
    G.FX.pillar(p.x, p.y, color); G.FX.ring(p.x, p.y - 40, 70, color, 0.8);
    G.FX.stars(p.x, p.y - 50, 18);
    setTimeout(() => { if (G.Game.player === p) { G.FX.pillar(p.x, p.y, '#ffffff'); G.FX.stars(p.x, p.y - 70, 14); } }, 900);
    G.UI.log(`손등의 문양이 ${this.SHARD[el][0]}의 별조각과 공명한다...`, color);
  },
  fanfare(i, sub) {
    const p = G.Game.player;
    if (!p) return;
    const n = this.shardCount(p.d), stars = '★'.repeat(n) + '☆'.repeat(7 - n);
    G.Music.fanfare();
    const el = this.layer('chfan');
    el.innerHTML = `<div class="ch-fan"><b>${G.U.esc(this.NAMES[i][0])} 완료</b><small>${G.U.esc(sub)}</small>
      <div class="ch-stars">${stars} <span>${n}/7</span></div></div>`;
    el.className = 'chfx fan';
    clearTimeout(this.fanT);
    this.fanT = setTimeout(() => { if (el.className === 'chfx fan') { el.className = 'chfx'; el.innerHTML = ''; } }, 5200);
  },
  layer(id) {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; el.className = 'chfx'; G.UI.root.appendChild(el); }
    return el;
  },
};
