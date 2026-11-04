'use strict';
// 하단 HUD (레벨, HP/MP/EXP, 단축키), 버프 아이콘, 퀘스트 추적기
G.HUD = {
  el: {},
  BASIC_ICON: { id: 'basic', icon: { g: 'slash', el: 'earth' }, type: 'attack' },

  build(root) {
    root.insertAdjacentHTML('beforeend', `
      <div id="hud">
        <div class="who"><div class="lv"></div><div class="nm"></div></div>
        <div class="bars"><div class="bar hp"><i></i><span></span></div><div class="bar mp"><i></i><span></span></div></div>
        <div class="slots"></div>
        <div class="menu">
          <button class="mbtn" data-act="toggle" data-arg="stat">스탯 S<span class="badge" id="b-ap" hidden></span></button>
          <button class="mbtn" data-act="toggle" data-arg="equip">장비 E</button>
          <button class="mbtn" data-act="toggle" data-arg="inv">인벤 I</button>
          <button class="mbtn" data-act="toggle" data-arg="skill">스킬 K<span class="badge" id="b-sp" hidden></span></button>
          <button class="mbtn" data-act="toggle" data-arg="quest">퀘스트 Q</button>
          <button class="mbtn" data-act="toggle" data-arg="menu">메뉴</button>
        </div>
        <div id="expbar"><i></i><span></span></div>
      </div>`);
    const h = document.getElementById('hud');
    this.el = {
      hud: h, lv: h.querySelector('.lv'), nm: h.querySelector('.nm'),
      hp: h.querySelector('.bar.hp i'), hpT: h.querySelector('.bar.hp span'),
      mp: h.querySelector('.bar.mp i'), mpT: h.querySelector('.bar.mp span'),
      exp: h.querySelector('#expbar i'), expT: h.querySelector('#expbar span'),
      slots: h.querySelector('.slots'), gold: document.getElementById('gold'),
      ap: document.getElementById('b-ap'), sp: document.getElementById('b-sp'),
      buffs: document.getElementById('buffs'), tracker: document.getElementById('tracker'),
    };
    this.show(false);
  },
  show(on) {
    for (const id of ['hud', 'mapname', 'gold', 'tracker', 'log', 'buffs']) document.getElementById(id).style.display = on ? '' : 'none';
  },

  // 단축키 칸 / 배지 / 추적기 (데이터가 바뀔 때만)
  refresh() {
    const p = G.Game.player;
    if (!p) return;
    const d = p.d, E = this.el;
    const cell = (key, src, extra = '', tip = '') =>
      `<div class="qs" ${tip}>${src ? `<img src="${src}">` : ''}<span class="k">${key}</span>${extra}<div class="cd"></div><div class="cdt"></div></div>`;
    const KL = G.Keys.label.bind(G.Keys);
    let html = cell(KL('attack'), G.Icons.skill(this.BASIC_ICON));
    for (let i = 0; i < 6; i++) {
      const id = d.hot[i];
      html += cell(KL('skill' + (i + 1)), id ? G.Icons.skill(G.SKILLS[id]) : null, '', id ? `data-tip="skill:${id}"` : '');
    }
    const pot = kind => {
      const s = d.inv.use.find(x => x && G.ITEMS[x.tid].use[kind]);
      if (!s) return [null, 0];
      const total = d.inv.use.reduce((n, x) => n + (x && x.tid === s.tid ? x.qty : 0), 0);
      return [G.Icons.item(G.ITEMS[s.tid]), total];
    };
    const [hpI, hpN] = pot('hp'), [mpI, mpN] = pot('mp');
    html += cell(KL('hp'), hpI, `<span class="n">${hpN || ''}</span>`);
    html += cell(KL('mp'), mpI, `<span class="n">${mpN || ''}</span>`);
    // 메뉴 버튼의 키 표시도 현재 키 설정을 따름
    for (const b of this.el.hud.querySelectorAll('.mbtn')) {
      const w = b.dataset.arg, names = { stat: '스탯', equip: '장비', inv: '인벤', skill: '스킬', quest: '퀘스트' };
      if (names[w]) b.firstChild.textContent = `${names[w]} ${KL(w)}`;
    }
    E.slots.innerHTML = html;
    this.slotEls = [...E.slots.children];
    E.ap.hidden = !d.ap; E.ap.textContent = d.ap;
    E.sp.hidden = !d.sp; E.sp.textContent = d.sp;
    this.tracker();
  },

  // 매 프레임 (가벼운 값만)
  update() {
    const p = G.Game.player;
    if (!p) return;
    const d = p.d, s = p.st, E = this.el;
    E.lv.textContent = 'Lv.' + d.level;
    E.nm.textContent = `${d.name} · ${G.JOBS[d.job].name}`;
    E.hp.style.width = (Math.max(0, p.hp) / s.maxHP * 100) + '%';
    E.hpT.textContent = `HP ${Math.max(0, Math.ceil(p.hp))} / ${s.maxHP}`;
    E.mp.style.width = (Math.max(0, p.mp) / s.maxMP * 100) + '%';
    E.mpT.textContent = `MP ${Math.floor(p.mp)} / ${s.maxMP}`;
    const need = G.F.expToNext(d.level), r = need ? d.exp / need : 1;
    E.exp.style.width = (r * 100) + '%';
    E.expT.textContent = need ? `EXP ${G.U.fmt(d.exp)} / ${G.U.fmt(need)} (${(r * 100).toFixed(2)}%)` : 'MAX';
    E.gold.textContent = `💰 ${G.U.fmt(d.gold)} G`;
    if (this.slotEls) {
      for (let i = 0; i < 6; i++) {
        const id = d.hot[i], el = this.slotEls[i + 1];
        if (!el) continue;
        const cd = el.querySelector('.cd'), cdt = el.querySelector('.cdt');
        const sk = id && G.SKILLS[id], left = id ? (p.cd[id] || 0) : 0;
        if (sk && left > 0 && sk.cd > 0.5) { cd.style.height = (left / sk.cd * 100) + '%'; cdt.textContent = Math.ceil(left); }
        else { cd.style.height = '0'; cdt.textContent = ''; }
        const lv = id ? d.skills[id] || 0 : 0;
        el.classList.toggle('nomp', !!sk && (lv <= 0 || (sk.mp && p.mp < sk.mp(lv))));
      }
    }
    // 버프 · 나쁜 효과 (0.1초마다)
    this.bt = (this.bt || 0) + 1;
    if (this.bt % 6 === 0) this.buffBar(p);
  },

  // 1.7.9: 오른쪽 위 버프·나쁜 효과 칸. 남은 시간만큼 줄어드는 원형 테두리 + 남은 시간, 5초 전 깜빡임, 새로 받으면 이름 표시
  DEBUFFS(p) {
    return [
      p.poison && ['poison', p.poison.left],
      p.slowT > 0.05 && ['slow', p.slowT],
      p.despair && ['despair', p.despair.left],
      p.noPotion > 0 && ['curse', p.noPotion],
      p.silence > 0 && ['silence', p.silence],
      p.invert > 0 && ['invert', p.invert],
    ].filter(Boolean);
  },
  buffBar(p) {
    const E = this.el, list = [];
    for (const id in p.buffs) list.push({ key: 'buff:' + id, bad: false, left: p.buffs[id].left, max: p.buffs[id].max, name: p.buffs[id].name, icon: () => G.Icons.skill(G.SKILLS[id]) });
    for (const [k, left] of this.DEBUFFS(p)) list.push({ key: 'debuff:' + k, bad: true, left, name: G.DEBUFF_ICON[k].name, icon: () => G.Icons.debuff(k) });
    const nodes = this.bnodes || (this.bnodes = {}), seen = {};
    for (const b of list) {
      seen[b.key] = true;
      let n = nodes[b.key];
      if (!n || b.left > n.last + 0.5) {   // 새로 받았거나 다시 걸림 → 전체 시간을 새로 잡는다
        if (!n) {
          for (const old of E.buffs.querySelectorAll('.bn')) old.remove();   // 이름은 가장 새것만
          const el = document.createElement('div');
          el.className = 'bf pe pop' + (b.bad ? ' bad' : ''); el.dataset.tip = b.key;
          el.innerHTML = `<div class="ring"><img src="${b.icon()}"></div><span class="t"></span><span class="bn">${G.U.esc(b.name)}</span>`;
          E.buffs.appendChild(el);
          n = nodes[b.key] = { el, ring: el.firstChild, t: el.children[1] };
          setTimeout(() => el.classList.remove('pop'), 400);
        }
        n.max = Math.max(b.max || 0, b.left);
      }
      n.last = b.left;
      const frac = G.U.clamp(b.left / (n.max || 1), 0, 1), col = b.bad ? '#ff5a5a' : '#ffd54a';
      n.ring.style.background = `conic-gradient(${col} ${Math.round(frac * 360)}deg, rgba(10,12,22,.8) 0)`;
      n.t.textContent = b.left >= 60 ? Math.ceil(b.left / 60) + '분' : Math.ceil(b.left) + '초';
      n.el.classList.toggle('blink', b.left <= 5);
    }
    for (const k in nodes) if (!seen[k]) { nodes[k].el.remove(); delete nodes[k]; }
    // 버프가 있으면 퀘스트 목록을 그만큼 내린다
    E.tracker.style.top = list.length ? '112px' : '';
  },

  tracker() {
    const p = G.Game.player, out = [];
    for (const id in p.d.quests) {
      const s = p.d.quests[id];
      if (s.s !== 'active') continue;
      const q = G.QUESTS[id], ready = G.Quest.ready(q), nav = G.Nav.qid === id;
      let h = `<div class="tq pe ${nav ? 'nav' : ''}" data-dbl="nav:${id}" title="더블클릭: 길 안내 ${nav ? '끄기' : '켜기'}"><b class="${ready ? 'ok' : q.type}">${nav ? '🧭 ' : ''}${q.type === 'main' ? '[메인]' : '[서브]'} ${G.U.esc(q.name)}</b>`;
      if (ready) h += `<div class="ok">완료 가능 → ${G.NPCS[q.end].name}</div>`;
      else if (!q.obj.length) h += `<div>${G.NPCS[q.end].name}에게 말을 걸자</div>`;
      else h += q.obj.map(o => `<div>${G.Quest.objText(q, o)}</div>`).join('');
      out.push(h + '</div>');
      if (out.length >= 5) break;
    }
    this.el.tracker.innerHTML = out.join('');
  },
};
