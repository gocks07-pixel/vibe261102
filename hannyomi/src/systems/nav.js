'use strict';
// 퀘스트 길 안내: 목표 맵을 찾고, 포탈/배 연결을 따라 가장 짧은 경로를 계산한다
G.Nav = {
  qid: null, info: null, t: 0,

  toggle(qid) {
    if (this.qid === qid) { this.clear(); G.UI.log('길 안내를 껐습니다.', '#9aa6c8'); }
    else {
      this.qid = qid; this.t = 0; this.refresh();
      G.UI.log(`🧭 [${G.QUESTS[qid].name}] 길 안내를 시작합니다. (다시 더블클릭하면 끔)`, '#ffe08a');
    }
    G.UI.dirty();
  },
  clear(qid) {
    if (qid && this.qid !== qid) return;
    this.qid = null; this.info = null;
    G.UI.dirty();
  },

  npcMap(npc) { return Object.keys(G.MAPS).find(id => G.MAPS[id].npcs.some(n => n.id === npc)); },
  mapsWithMon(mons) {   // 2.1.4: 2단계 보스(엘드리크)는 맵에 없으니 앞 단계 보스(아우렐리온)가 나오는 맵도 찾음
    const all = mons.concat(Object.keys(G.MONSTERS).filter(id => mons.includes(G.MONSTERS[id].next)));
    return new Set(Object.keys(G.MAPS).filter(id => G.MAPS[id].spawns.some(s => all.includes(s.m))));
  },

  // 지금 가야 할 곳
  targets(q) {
    const Q = G.Quest;
    if (Q.ready(q) || !q.obj.length) return { maps: new Set([this.npcMap(q.end)]), npc: q.end, label: `${G.NPCS[q.end].name}에게 보고` };
    for (const o of q.obj) {
      const [c, n] = Q.progress(q, o);
      if (c >= n) continue;
      if (o.t === 'kill') return { maps: this.mapsWithMon([o.mon]), mons: [o.mon], label: Q.objText(q, o) };
      if (o.t === 'item') {
        const mons = Object.keys(G.MONSTERS).filter(m => (G.MONSTERS[m].quest || []).includes(o.id));
        return { maps: this.mapsWithMon(mons), mons, label: Q.objText(q, o) };
      }
      if (o.t === 'map') return { maps: new Set([o.map]), label: Q.objText(q, o) };
    }
    return { maps: new Set([this.npcMap(q.end)]), npc: q.end, label: `${G.NPCS[q.end].name}에게 보고` };
  },

  // 맵에서 나가는 길: 포탈 + 배(이동 NPC)
  edges(mapId) {
    const m = G.MAPS[mapId], out = [];
    for (const p of m.portals) if (!p.hidden && p.to) out.push({ to: p.to, x: p.x, kind: 'portal' });
    const flags = G.Game.player ? G.Game.player.d.flags : {};
    for (const n of m.npcs) {
      const tr = G.NPCS[n.id].travel;
      if (tr === 'all') {
        for (const t of G.TRAVEL) if (t.to !== mapId && (!t.flag || flags[t.flag])) out.push({ to: t.to, x: n.x, kind: 'npc', npc: n.id });
      } else if (tr) out.push({ to: tr.to, x: n.x, kind: 'npc', npc: n.id });
    }
    return out;
  },
  route(from, targets) {
    const prev = { [from]: null }, queue = [from];
    while (queue.length) {
      const cur = queue.shift();
      if (targets.has(cur) && cur !== from) {
        const path = [cur];
        let e = prev[cur];
        while (e) { path.unshift(e.from); e = prev[e.from]; }
        let first = null, c = cur;
        while (prev[c] && prev[c].from !== from) c = prev[c].from;
        first = prev[c].edge;
        return { path, first };
      }
      for (const e of this.edges(cur)) {
        if (e.to in prev || G.MAPS[e.to].hidden) continue;
        prev[e.to] = { from: cur, edge: e };
        queue.push(e.to);
      }
    }
    return null;
  },

  refresh() {
    const p = G.Game.player, w = G.Game.world;
    if (!this.qid || !p || !w) { this.info = null; return; }
    const q = G.QUESTS[this.qid];
    if (!G.Quest.isActive(q.id)) { this.clear(); return; }
    const tg = this.targets(q);
    if (tg.maps.has(w.mapId)) { this.info = { q, tg, arrived: true }; return; }
    const r = this.route(w.mapId, tg.maps);
    this.info = r ? { q, tg, path: r.path, first: r.first } : { q, tg, lost: true };
  },
  update(dt) {
    this.t -= dt;
    if (this.t <= 0) { this.t = 0.4; this.refresh(); }
  },

  // 현재 맵에서 가리킬 x 좌표
  targetX(w) {
    const inf = this.info;
    if (!inf) return null;
    if (!inf.arrived) return inf.first ? inf.first.x : null;
    if (inf.tg.npc) { const n = w.npcs.find(n => n.id === inf.tg.npc); return n ? n.x : null; }
    // 2.1.5: 목표 맵에 도착하면 몬스터를 따라다니는 화살표는 없앰 (안내판 글만). 보고할 NPC 는 그대로 가리킴
    return null;
  },
  text() {
    const inf = this.info;
    if (!inf) return '';
    if (inf.lost) return '목적지로 가는 길을 찾을 수 없습니다';
    if (inf.arrived) return `📍 목표 지역 · ${inf.tg.label}`;
    const e = inf.first, dest = G.MAPS[e.to].name, left = inf.path.length - 1;
    if (e.kind === 'npc') return `⛵ ${G.NPCS[e.npc].name}에게 말을 걸어 ${dest}(으)로 (${left}개 맵)`;
    return `${dest} 방향 (${left}개 맵 이동)`;
  },

  // 화면 위쪽 안내 + 목표 위치 표시
  draw(ctx, w) {
    const inf = this.info;
    if (!inf) return;
    const p = w.player, tx = this.targetX(w), t = w.time;
    // 월드 좌표: 목표 강조
    if (tx != null) {
      const sx = tx - w.cam, gy = inf.arrived && inf.tg.mons ? null : G.GROUND_Y;
      ctx.save();
      if (gy != null) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,214,90,${0.6 + Math.sin(t * 6) * 0.3})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(sx, gy - 45, 36 + Math.sin(t * 6) * 4, 56, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      const ay = (gy != null ? gy - 150 : this.monTop(w, tx)) + Math.sin(t * 6) * 6;
      ctx.fillStyle = '#ffd54a'; ctx.strokeStyle = '#3a2a00'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx - 12, ay); ctx.lineTo(sx + 12, ay); ctx.lineTo(sx, ay + 16); ctx.closePath(); ctx.stroke(); ctx.fill();
      ctx.restore();
    }
    // 화면 상단 중앙 안내판
    const txt = this.text();
    let arrow = '';
    if (tx != null) arrow = tx < p.x - 40 ? '◀' : tx > p.x + 40 ? '▶' : '▼';
    ctx.save();
    ctx.font = 'bold 13px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center';
    const label = `🧭 ${inf.q.name}`, tw = Math.max(ctx.measureText(txt).width, ctx.measureText(label).width) + 90;
    const x = 640, y = 84;
    ctx.fillStyle = 'rgba(12,14,26,.82)'; ctx.strokeStyle = 'rgba(255,214,90,.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x - tw / 2, y, tw, 44, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffcf6a'; ctx.font = 'bold 11px "Malgun Gothic"'; ctx.fillText(label, x, y + 16);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px "Malgun Gothic"'; ctx.fillText(txt, x, y + 35);
    if (arrow) {
      const bob = Math.sin(t * 8) * 3;
      ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#ffd54a';
      if (arrow === '◀') ctx.fillText('◀', x - tw / 2 + 20 - bob, y + 30);
      else if (arrow === '▶') ctx.fillText('▶', x + tw / 2 - 20 + bob, y + 30);
      else ctx.fillText('▼', x + tw / 2 - 20, y + 30 + bob);
    }
    ctx.restore();
  },
  monTop(w, tx) {
    const m = w.monsters.find(m => !m.dead && m.x === tx);
    return m ? m.y - m.h - 46 : G.GROUND_Y - 150;
  },
};
