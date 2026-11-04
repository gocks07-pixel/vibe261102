'use strict';
// M 키 지도 창: 월드맵 / 현재 맵
G.Win.map = {
  title: '지도', x: 262, y: 40, w: 760, tab: 'world',
  render() {
    const tabs = { world: '월드맵', local: '현재 맵' };
    let h = '<div class="tabs">' + Object.keys(tabs).map(t => `<span class="t ${this.tab === t ? 'on' : ''}" data-act="tab" data-arg="map:${t}">${tabs[t]}</span>`).join('') + '</div>';
    h += this.tab === 'world' ? this.world() : this.local();
    return h;
  },

  // 월드맵: 지역 + 맵 노드 + 연결선 + 현재 위치 + 퀘스트 목표 + 길 안내 경로
  // 지역 상자(4칸 × 2줄) 안에 맵 노드를 지그재그로 배치
  layout() {
    if (this._pos) return this._pos;
    const pos = {};
    G.WORLD.regions.forEach((r, i) => {
      const col = i % 4, row = Math.floor(i / 4), x = 6 + col * 182, y = 6 + row * 176;
      r.box = { x, y, w: 174, h: 166 };
      r.maps.forEach((id, k) => { pos[id] = [x + 22 + k * (130 / Math.max(1, r.maps.length - 1)), y + 118 - (k % 2) * 46]; });
    });
    return (this._pos = pos);
  },
  world() {
    const cur = G.Game.world.mapId, nav = G.Nav.info, pos = this.layout(), flags = G.Game.player.d.flags;
    const targets = new Set();
    for (const id in G.Game.player.d.quests) {
      if (G.Quest.isActive(id)) for (const m of G.Nav.targets(G.QUESTS[id]).maps) targets.add(m);
    }
    const navPath = new Set();
    if (nav && nav.path) for (let i = 0; i < nav.path.length - 1; i++) navPath.add([nav.path[i], nav.path[i + 1]].sort().join('|'));
    let s = `<svg viewBox="0 0 736 360" width="736" height="360" style="display:block;border-radius:8px;background:linear-gradient(#1a3a5a,#0e2238)">`;
    G.WORLD.regions.forEach((r, i) => {
      const b = r.box, open = i < 2 || flags[['', '', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7'][i]];
      s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="18" fill="${r.color}" opacity="${open ? 0.6 : 0.2}" stroke="rgba(255,255,255,.25)"/>`;
      s += `<text x="${b.x + 10}" y="${b.y + 20}" fill="#e8f0ff" font-size="12" font-weight="800">${open ? r.name : '??? (미개척)'}</text>`;
      if (i < G.WORLD.regions.length - 1) {
        const a = pos[r.maps[0]], c = pos[G.WORLD.regions[i + 1].maps[0]];
        s += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="rgba(191,230,255,.35)" stroke-width="1.5" stroke-dasharray="5 6"/>`;
      }
    });
    const seen = new Set();
    for (const id in pos) {
      for (const p of G.MAPS[id].portals) {
        if (p.hidden || !p.to || !pos[p.to]) continue;
        const key = [id, p.to].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const [x1, y1] = pos[id], [x2, y2] = pos[p.to], on = navPath.has(key);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? '#ffd54a' : 'rgba(255,255,255,.5)'}" stroke-width="${on ? 4 : 2}"/>`;
      }
    }
    if (nav && nav.path) for (let i = 0; i < nav.path.length - 1; i++) {
      const key = [nav.path[i], nav.path[i + 1]].sort().join('|');
      if (seen.has(key)) continue;
      const [x1, y1] = pos[nav.path[i]], [x2, y2] = pos[nav.path[i + 1]];
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffd54a" stroke-width="3" stroke-dasharray="6 5"/>`;
    }
    for (const id in pos) {
      const [x, y] = pos[id], m = G.MAPS[id];
      const col = m.town ? '#ffd54a' : m.bossRoom ? '#ff5a5a' : '#7dd36a';
      s += `<g data-tip="map:${id}" style="cursor:help">`;
      if (id === cur) s += `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="#fff" stroke-width="3"><animate attributeName="r" values="11;17;11" dur="1.2s" repeatCount="indefinite"/></circle>`;
      s += `<circle cx="${x}" cy="${y}" r="8" fill="${col}" stroke="#1a1a2a" stroke-width="2"/>`;
      s += `<text x="${x}" y="${y + 21}" fill="#fff" font-size="10" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="#0a1420" stroke-width="3">${m.name}</text>`;
      if (targets.has(id)) s += `<text x="${x + 8}" y="${y - 7}" fill="#ffcf3a" font-size="15" font-weight="900" paint-order="stroke" stroke="#2a1a00" stroke-width="3">!</text>`;
      s += '</g>';
    }
    s += '</svg>';
    s += `<div class="dim" style="font-size:11px;margin-top:6px">⚪ 현재 위치 · <span style="color:#ffd54a">●</span> 마을 · <span style="color:#ff5a5a">●</span> 보스 · <span style="color:#ffcf3a">!</span> 퀘스트 목표 · <span style="color:#ffd54a">━</span> 길 안내 · 점선: 여행 안내원 이동 · 맵에 마우스를 올리면 정보</div>`;
    return s;
  },
  // 현재 맵 축소도
  local() {
    const w = G.Game.world, map = w.map, sc = 720 / map.width, H = 230;
    const my = y => 20 + (y - 200) / (G.GROUND_Y - 200) * (H - 40);
    let s = `<div style="font-weight:800;margin-bottom:4px">${map.name} <span class="dim" style="font-weight:400">${map.lvText}</span></div>`;
    s += `<svg viewBox="0 0 736 ${H}" width="736" height="${H}" style="display:block;border-radius:8px;background:#0e1424">`;
    for (const p of map.platforms) s += `<rect x="${8 + p.x * sc}" y="${my(p.y)}" width="${p.w * sc}" height="${p.ground ? 8 : 5}" rx="2" fill="${p.ground ? '#5a6a8a' : '#8a9aba'}"/>`;
    for (const po of w.portals) {
      if (po.hidden) continue;
      const x = 8 + po.x * sc, y = my(po.y);
      s += `<ellipse cx="${x}" cy="${y - 12}" rx="6" ry="10" fill="#6ab8ff"/><text x="${x}" y="${y - 28}" fill="#bfe6ff" font-size="11" text-anchor="middle">${po.label || G.MAPS[po.to].name}</text>`;
    }
    for (const n of w.npcs) {
      const x = 8 + n.x * sc, y = my(n.y), mk = G.Quest.marker(n.id);
      s += `<circle cx="${x}" cy="${y - 7}" r="5" fill="#ffd54a"/><text x="${x}" y="${y + 20}" fill="#ffe8a0" font-size="10" text-anchor="middle">${n.def.name}</text>`;
      if (mk) s += `<text x="${x}" y="${y - 16}" fill="${mk.ch === '?' ? '#7dff9a' : '#ffcf3a'}" font-size="13" font-weight="900" text-anchor="middle">${mk.ch}</text>`;
    }
    for (const m of w.monsters) if (!m.dead) s += `<circle cx="${8 + m.x * sc}" cy="${my(m.y) - 5}" r="${m.isBoss ? 7 : 3.5}" fill="#ff5a5a"/>`;
    const tx = G.Nav.targetX(w);
    if (tx != null) s += `<text x="${8 + tx * sc}" y="14" fill="#ffd54a" font-size="14" text-anchor="middle">▼</text>`;
    const p = w.player;
    s += `<circle cx="${8 + p.x * sc}" cy="${my(p.y) - 8}" r="6" fill="#fff" stroke="#000" stroke-width="2"/><text x="${8 + p.x * sc}" y="${my(p.y) - 18}" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">나</text>`;
    s += '</svg>';
    const mons = [...new Set(map.spawns.map(x => x.m))].map(k => `Lv.${G.MONSTERS[k].lv} ${G.MONSTERS[k].name}`);
    s += `<div class="dim" style="font-size:11px;margin-top:6px">⚪ 나 · <span style="color:#ffd54a">●</span> NPC · <span style="color:#ff5a5a">●</span> 몬스터 · <span style="color:#6ab8ff">●</span> 포탈${mons.length ? ' · 출몰: ' + mons.join(', ') : ''}</div>`;
    return s;
  },
};
