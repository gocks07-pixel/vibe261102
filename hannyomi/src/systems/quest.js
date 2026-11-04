'use strict';
// 퀘스트 진행 관리. 저장 데이터: p.d.quests[id] = {s:'active'|'done', k:{몬스터: 처치수}, m:{맵: true}}
G.Quest = {
  get p() { return G.Game.player; },
  st(id) { return this.p.d.quests[id]; },
  isDone(id) { const s = this.st(id); return !!s && s.s === 'done'; },
  isActive(id) { const s = this.st(id); return !!s && s.s === 'active'; },

  available(q) {
    const p = this.p;
    if (this.st(q.id)) return false;
    if (p.d.level < q.lv) return false;
    if (!q.pre.every(id => this.isDone(id))) return false;
    if (q.cond && !q.cond(p)) return false;
    return true;
  },
  // 레벨만 부족한 퀘스트 (퀘스트창 "곧 가능" 표시용)
  soon(q) {
    const p = this.p;
    return !this.st(q.id) && p.d.level < q.lv && q.pre.every(id => this.isDone(id)) && (!q.cond || q.cond(p));
  },

  progress(q, o) {
    const s = this.st(q.id) || {};
    if (o.t === 'kill') return [Math.min(o.n, (s.k && s.k[o.mon]) || 0), o.n];
    if (o.t === 'item') return [Math.min(o.n, G.Inv.count(this.p, o.id)), o.n];
    if (o.t === 'map') return [s.m && s.m[o.map] ? 1 : 0, 1];
    return [0, 1];
  },
  objText(q, o) {
    const [c, n] = this.progress(q, o);
    if (o.t === 'kill') return `${G.MONSTERS[o.mon].name} 처치 ${c}/${n}`;
    if (o.t === 'item') return `${G.ITEMS[o.id].name} ${c}/${n}`;
    if (o.t === 'map') return `${G.MAPS[o.map].name} 방문`;
    return '';
  },
  ready(q) { return this.isActive(q.id) && q.obj.every(o => { const [c, n] = this.progress(q, o); return c >= n; }); },

  accept(id) {
    const q = G.QUESTS[id];
    this.p.d.quests[id] = { s: 'active', k: {}, m: {} };
    G.UI.log(`[퀘스트 수락] ${q.name}`, '#ffe08a');
    G.Audio.play('quest');
    G.UI.dirty();
  },

  // '@wp70' → 직업에 맞는 무기 id (초보자는 전사 무기)
  resolveItem(tid) {
    if (tid[0] !== '@') return tid;
    const fam = G.familyOf(this.p.d.job);
    return `${tid.slice(1)}_${fam === 'beginner' ? 'warrior' : fam}`;
  },
  rewardText(q) {
    const parts = [`경험치 ${G.U.fmt(G.F.questExp(q.lv, q.exp))}`];
    if (q.gold) parts.push(`${G.U.fmt(q.gold)} 골드`);
    for (const [raw, n] of q.items) { const id = this.resolveItem(raw); parts.push(`${G.ITEMS[id].name}${n > 1 ? ' ×' + n : ''}`); }
    if (q.act && q.act.job) parts.push(`${G.JOBS[q.act.job].name} 각성`);
    return parts.join(', ');
  },

  complete(id) {
    const q = G.QUESTS[id], p = this.p;
    if (!this.ready(q)) return false;
    // 보상 아이템 공간 확인
    const need = { equip: 0, use: 0, etc: 0 };
    for (const [raw] of q.items) { const tid = this.resolveItem(raw); if (!G.Inv.hasSpace(p, tid)) need[G.ITEMS[tid].cat]++; }
    if (Object.values(need).some(n => n > 0)) { G.UI.log('인벤토리 공간이 부족합니다.', '#ff7a7a'); G.Audio.play('error'); return false; }

    for (const o of q.obj) if (o.t === 'item') G.Inv.remove(p, o.id, o.n);
    p.d.quests[id] = { s: 'done' };
    G.Nav.clear(id);
    for (const [raw, n] of q.items) {
      const tid = this.resolveItem(raw);
      G.Inv.add(p, G.ITEMS[tid].cat === 'equip' ? G.Items.create(tid, { plain: true }) : tid, n);
    }
    if (q.gold) p.d.gold += q.gold;
    if (q.act && q.act.flag) p.d.flags[q.act.flag] = true;
    if (q.act && q.act.job) p.changeJob(q.act.job);
    G.UI.log(`[퀘스트 완료] ${q.name} — ${this.rewardText(q)}`, '#7dff9a');
    G.UI.banner('퀘스트 완료', q.name);
    G.Audio.play('quest');
    p.gainExp(G.F.questExp(q.lv, q.exp), true);
    G.UI.dirty();
    G.Game.save(true);
    G.Chapter.onQuest(id);
    return true;
  },

  onKill(monId) {
    let changed = false;
    for (const id in this.p.d.quests) {
      const s = this.p.d.quests[id];
      if (s.s !== 'active') continue;
      const q = G.QUESTS[id];
      for (const o of q.obj) {
        if (o.t === 'kill' && o.mon === monId && (s.k[monId] || 0) < o.n) {
          s.k[monId] = (s.k[monId] || 0) + 1; changed = true;
          if (s.k[monId] === o.n) G.UI.log(`${G.MONSTERS[monId].name} ${o.n}/${o.n} 달성!`, '#7dff9a');
        }
      }
    }
    if (changed) G.UI.dirty();
  },
  onMap(mapId) {
    for (const id in this.p.d.quests) {
      const s = this.p.d.quests[id];
      if (s.s === 'active' && G.QUESTS[id].obj.some(o => o.t === 'map' && o.map === mapId)) { s.m[mapId] = true; G.UI.dirty(); }
    }
  },

  // 진행 중 퀘스트에 아직 더 필요한 아이템인지
  needsItem(itemId) {
    for (const id in this.p.d.quests) {
      const s = this.p.d.quests[id];
      if (s.s !== 'active') continue;
      for (const o of G.QUESTS[id].obj) if (o.t === 'item' && o.id === itemId && G.Inv.count(this.p, itemId) < o.n) return true;
    }
    return false;
  },
  // 진행 중인 처치 목표 몬스터 (빠른 리젠용)
  killTargets() {
    const set = new Set();
    for (const id in this.p.d.quests) {
      const s = this.p.d.quests[id];
      if (s.s !== 'active') continue;
      for (const o of G.QUESTS[id].obj) {
        if (o.t === 'kill' && (s.k[o.mon] || 0) < o.n) set.add(o.mon);
        if (o.t === 'item') for (const mid in G.MONSTERS) if ((G.MONSTERS[mid].quest || []).includes(o.id)) set.add(mid);
      }
    }
    return set;
  },

  // NPC 머리 위 표시
  marker(npcId) {
    let avail = null;
    for (const q of Object.values(G.QUESTS)) {
      if (q.end === npcId && this.ready(q)) return { ch: '?', main: q.type === 'main' };
      if (q.start === npcId && this.available(q) && (!avail || q.type === 'main')) avail = { ch: '!', main: q.type === 'main' };
    }
    return avail;
  },
  entriesFor(npcId) {
    const out = [];
    for (const q of Object.values(G.QUESTS)) {
      if (q.end === npcId && this.isActive(q.id)) out.push({ q, mode: this.ready(q) ? 'end' : 'progress' });
      else if (q.start === npcId && this.available(q)) out.push({ q, mode: 'start' });
    }
    const rank = { end: 0, start: 1, progress: 2 };
    out.sort((a, b) => rank[a.mode] - rank[b.mode] || (a.q.type === 'main' ? -1 : 1));
    return out;
  },
};
