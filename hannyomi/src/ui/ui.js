'use strict';
// UI 공통: 창 관리, 이벤트 위임(data-act / data-dbl / data-tip), 툴팁, 로그, 배너, 오버레이
G.UI = {
  root: null, wins: {}, _dirty: false, target: null, shopNpc: null,

  init() {
    this.root = document.getElementById('ui');
    const r = this.root;
    r.insertAdjacentHTML('beforeend', `
      <div id="mapname"></div><div id="buffs"></div>
      <div id="gold" class="pe"></div><div id="tracker"></div><div id="log"></div><div id="banner"></div>
      <div id="tooltip"></div><div id="fade"></div><div id="overlay"></div>`);
    G.HUD.build(r);
    this.tip = document.getElementById('tooltip');

    r.addEventListener('click', e => this.onClick(e));
    r.addEventListener('dblclick', e => this.onDbl(e));
    // 빌드 2 (9-2): 퀘스트 알림 ✕ — 한 번 누름 (길 안내 더블클릭 · 설명 보기와 겹치지 않게 여기서 끝냄)
    document.addEventListener('pointerdown', e => {
      const x = e.target.closest && e.target.closest('[data-qx]');
      if (!x) return;
      e.preventDefault(); e.stopPropagation();
      this.questX(x.dataset.qx);
    }, true);
    // 음량 슬라이더
    r.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.snd; if (k) G.Win.sound.input(k, e.target.value); });
    r.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.snd; if (k) { G.Win.sound.change(k); e.target.blur(); } });
    r.addEventListener('contextmenu', e => { e.preventDefault(); if (this.target) this.clearTarget(); });
    r.addEventListener('mouseover', e => {
      const el = e.target.closest('[data-tip]');
      if (el) this.showTip(el.dataset.tip, e); else this.hideTip();
    });
    r.addEventListener('mousemove', e => { if (this.tip.style.display === 'block') this.moveTip(e); });
    r.addEventListener('mouseleave', () => this.hideTip());
    // 창 드래그
    r.addEventListener('mousedown', e => {
      const h = e.target.closest('.wh');
      if (!h || e.target.closest('.x')) return;
      const win = h.parentElement, sc = G.Game.scale;
      const sx = e.clientX, sy = e.clientY, ox = win.offsetLeft, oy = win.offsetTop;
      this.front(win);
      const mv = ev => {
        win.style.left = G.U.clamp(ox + (ev.clientX - sx) / sc, -100, 1200) + 'px';
        win.style.top = G.U.clamp(oy + (ev.clientY - sy) / sc, 0, 660) + 'px';
      };
      const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
      window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    });
  },

  // ---------- 창 ----------
  zTop: 10,
  front(el) { el.style.zIndex = ++this.zTop; },
  isOpen(name) { return !!this.wins[name]; },
  openWin(name) {
    const def = G.Win[name];
    if (!def) return;
    if (!this.wins[name]) {
      const el = document.createElement('div');
      el.className = 'win'; el.id = 'win-' + name;
      el.style.left = def.x + 'px'; el.style.top = def.y + 'px';
      if (def.w) el.style.width = def.w + 'px';
      el.innerHTML = `<div class="wh">${def.title}<span class="x" data-act="close" data-arg="${name}">✕</span></div><div class="wb"></div>`;
      this.root.appendChild(el);
      this.wins[name] = el;
      if (def.onOpen) def.onOpen();
    }
    this.front(this.wins[name]);
    this.renderWin(name);
    G.Tutorial.ev('win:' + name);
  },
  closeWin(name) {
    const el = this.wins[name];
    if (!el) return;
    el.remove(); delete this.wins[name];
    if (name === 'inv' && this.target) this.clearTarget();   // 빌드 3 (11): 인벤을 닫으면 고르기도 끝
    const def = G.Win[name];
    if (def && def.onClose) def.onClose();
    this.hideTip();
  },
  toggle(name) { if (this.isOpen(name)) this.closeWin(name); else this.openWin(name); },
  renderWin(name) {
    const el = this.wins[name];
    if (!el) return;
    const body = el.querySelector('.wb'), st = body.scrollTop;
    body.innerHTML = G.Win[name].render();
    body.scrollTop = st;
  },
  closeTop() {
    if (G.Dialog.isOpen()) { G.Dialog.close(); return true; }
    if (this.target) { this.clearTarget(); return true; }
    let top = null, z = -1;
    for (const n in this.wins) { const zz = +this.wins[n].style.zIndex || 0; if (zz > z) { z = zz; top = n; } }
    if (top) { this.closeWin(top); return true; }
    return false;
  },
  dirty() { this._dirty = true; },
  frame() {
    G.HUD.update();
    // 지도 창(현재 맵)은 몬스터 위치가 계속 바뀌므로 주기적으로 갱신
    this.mapT = (this.mapT || 0) + 1;
    if (this.wins.map && G.Win.map.tab === 'local' && this.mapT % 20 === 0) this.renderWin('map');
    if (this._dirty) {
      this._dirty = false;
      for (const n in this.wins) this.renderWin(n);
      G.HUD.refresh();
    }
  },
  blocking() { return G.Dialog.isOpen() || !!document.querySelector('#overlay .overlay') || this.asking(); },

  // ---------- 이벤트 ----------
  onClick(e) {
    const tgtEl = e.target.closest('[data-tgt]');
    if (this.target && tgtEl) { this.applyTarget(tgtEl.dataset.tgt); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    const act = el.dataset.act, arg = el.dataset.arg, p = G.Game.player;
    switch (act) {
      case 'close': this.closeWin(arg); break;
      case 'rec': G.Play.recPreview(arg); break;
      case 'msel': this.mselAct(arg); break;
      case 'bulk': if (this.shopNpc) this.openWin('bulk'); break;
      case 'bulkt': { const B = G.Win.bulk, it = p.d.inv.equip.find(x => x && x.uid === arg); if (B.checked && it) { if (B.checked.has(it)) B.checked.delete(it); else B.checked.add(it); this.renderWin('bulk'); } break; }
      case 'bulksell': { const B = G.Win.bulk; if (!B.checked) break; const list = [...B.checked]; this.sellMany(list.map(it => ['equip', p.d.inv.equip.indexOf(it)]).filter(x => x[1] >= 0)); this.closeWin('bulk'); break; }
      case 'tgtcancel': this.clearTarget(); this.log('대상 고르기를 취소했어요.', '#9aa6c8'); break;
      case 'toggle': this.toggle(arg); break;
      case 'ap': p.addAP(arg, e.shiftKey ? 5 : 1); break;
      case 'sp': p.addSP(arg); break;
      case 'hot': { const [id, i] = arg.split(':'); p.setHotkey(id, +i); break; }
      case 'tab': { const [w, t] = arg.split(':'); G.Win[w].tab = t; this.renderWin(w); break; }
      case 'qsel': G.Win.quest.sel = arg; this.renderWin('quest'); break;
      case 'buy': { const [tid, n] = arg.split(':'); this.buy(tid, +n); break; }
      case 'dlg': G.Dialog.choose(+arg); break;
      case 'menu': G.Win.menu.act(arg); break;
      case 'ask': if (/^c\d+$/.test(arg)) this.chosen(+arg.slice(1)); else this.answer(arg === 'yes'); break;
      case 'qhide': { const st = p.d.quests[arg]; if (st) { if (st.h) delete st.h; else st.h = 1; this.renderWin('quest'); this.dirty(); } break; }
      case 'sto': G.Win.storage.act(arg); break;
      case 'reso': G.Win.cube.act(arg); break;
      case 'tele': G.Teleport.go(arg); break;
      case 'hero': G.Win.heroset.act(arg); break;
      case 'snd': G.Win.sound.act(arg); break;
      case 'autopot': G.Win.autopot.act(arg); break;   // EXE 빌드
      case 'bug': G.Bug.open(); break;
      case 'saveas': G.Win.saveas.act(arg); break;
      case 'title': G.Title.act(arg); break;
      case 'hidden': if (arg === 'redo') { this.overlay(''); if (/^end_/.test(G.Music.want || '')) G.Music.playMap(G.Game.world.mapId, 2); G.Hidden.redo(); break; }   // 빌드 5 (15)
        if (arg === 'seek') { this.overlay(''); if (/^end_/.test(G.Music.want || '')) G.Music.playMap(G.Game.world.mapId, 2); G.Hidden.seek(); } break;   // 2.0
      case 'cc': G.Creator.act(arg); break;
      case 'djump': p.d.djump = arg; G.UI.log(`2단 점프 모드: ${arg === 'up' ? '위로' : '앞으로'}`, '#bfe6ff'); G.Tutorial.ev('djmode'); this.dirty(); break;
      case 'keyset': G.Keys.waiting = arg; this.renderWin('keys'); break;
      case 'keyreset': G.Keys.reset(); this.renderWin('keys'); this.dirty(); break;
      case 'tutskip': G.Tutorial.skip(); break;
      case 'nav': G.Nav.toggle(arg); break;
      case 'revive': this.overlay(''); p.revive(); break;
    }
  },
  onDbl(e) {
    const el = e.target.closest('[data-dbl]');
    if (!el || this.target) return;
    const [kind, a, b] = el.dataset.dbl.split(':'), p = G.Game.player;
    if (kind === 'nav') { G.Nav.toggle(a); return; }
    if (kind === 'sto') { G.Storage.withdraw(a, +b); this.hideTip(); return; }
    if (kind === 'inv') {
      const it = p.d.inv[a][+b];
      if (!it) return;
      if (this.storageOpen) { G.Storage.deposit(a, +b); this.hideTip(); return; }
      if (this.shopNpc) { this.sell(a, +b); return; }
      if (a === 'equip') p.equip(+b);
      else if (a === 'use') p.useItem(+b, G.Game.world);
    } else if (kind === 'eq') p.unequip(a);
    this.hideTip();
  },

  // ---------- 각인서 / 공명석 / 대장장이 단련: 대상 장비 선택 ----------
  setTarget(kind, tid) {
    this.target = { kind, tid };
    this.openWin('inv'); G.Win.inv.tab = 'equip'; this.renderWin('inv');
    this.log(`${kind === 'smith' ? '장비 단련' : G.ITEMS[tid].name}: 대상 장비를 클릭하세요. (우클릭/ESC 취소)`, '#d9b0ff');
    document.body.style.cursor = 'crosshair';
    this.tgtBar();
  },
  clearTarget() { this.target = null; document.body.style.cursor = ''; this.tgtBar(); this.dirty(); },
  // 빌드 3 (11): 고르는 중 띠 + [취소] 는 인벤 창 맨 위 (windows.js). 인벤을 닫으면 고르기도 끝 (closeWin)
  tgtBar() {},
  applyTarget(ref) {
    const p = G.Game.player, [where, key] = ref.split(':');
    const it = where === 'eq' ? p.d.eq[key] : p.d.inv.equip[+key];
    if (!it) return;
    const { kind, tid } = this.target, name = G.ITEMS[it.tid].name;
    if (kind === 'smith') {   // 대장장이: 골드로 단련 효과 다시 굴리기
      const cost = G.Items.temperCost(it);
      if (p.d.gold < cost) { this.log(`골드가 부족합니다. (단련 비용 ${G.U.fmt(cost)} G)`, '#ff7a7a'); G.Audio.play('error'); return; }
      p.d.gold -= cost;
      const before = (it.add || []).slice();
      G.Items.temper(it);
      G.Win.temper.result = { it, before, cost };
      this.openWin('temper');
      this.log(`${name}을(를) 단련했습니다. (-${G.U.fmt(cost)} G)`, '#ffb070');
      G.Audio.play('cube');
      p.recalc(); this.clearTarget(); G.Game.save(true);
      return;
    }
    if (G.Inv.count(p, tid) <= 0) { this.clearTarget(); return; }
    if (kind === 'scroll') {
      if (G.Items.slotsLeft(it) <= 0) { this.log('각인 칸이 모두 찼습니다.', '#ff7a7a'); G.Audio.play('error'); return; }
      G.Inv.remove(p, tid, 1);
      const r = G.Items.useScroll(it);
      G.Win.scroll.result = Object.assign(r, { it, tid });
      this.openWin('scroll');
      const left = G.Items.slotsLeft(it);
      if (r.ok) {
        this.banner('각인 성공!', `${G.Items.displayName(it)}${r.fx ? ` · [${G.SFX[r.fx.id].name}] 효과 부여!` : ''}`);
        this.log(`${name} 각인 성공! (+1) 남은 각인 칸 ${left}`, '#7dff9a');
        if (r.fx) this.log(`특수 효과 부여: ${G.Items.sfxText(r.fx)}`, '#ffe08a');
        G.Audio.play('levelup');
      } else {
        this.log(`${name} 각인 실패... (${r.stage}칸째 · 성공률 ${Math.round(r.rate * 100)}%) 칸은 그대로 남았습니다.`, '#ff8a8a');
        G.Audio.play('error');
      }
      p.recalc();
      if (G.Inv.count(p, tid) <= 0) this.clearTarget();
      this.dirty();
      return;
    }
    if (kind === 'cube') {   // 공명석: 각인이 없으면 깨우고, 있으면 줄 고르기 창
      if (it.grade === 0) {
        G.Inv.remove(p, tid, 1);
        G.Items.awaken(it);
        this.banner('별자리 각인이 깨어났다!', `${name} · ${G.GRADES[1].name}`);
        this.log(`${name}에 별자리 각인이 깨어났습니다. (${G.GRADES[1].name})`, G.GRADES[1].color);
        G.Audio.play('cube'); p.recalc();
      }
      G.Win.cube.it = it; G.Win.cube.last = null;
      this.clearTarget();
      this.openWin('cube');
      this.dirty();
    }
  },

  // ---------- 상점 ----------
  openShop(npcId) {
    this.shopNpc = npcId;
    G.Win.shop.title = `${G.NPCS[npcId].name}의 상점`;
    if (this.wins.shop) this.closeWin('shop');
    this.openWin('shop'); this.openWin('inv');
  },
  buy(tid, n) {
    const p = G.Game.player, t = G.ITEMS[tid], cost = t.price * n;
    if (p.d.gold < cost) { this.log('골드가 부족합니다.', '#ff7a7a'); G.Audio.play('error'); return; }
    const item = t.cat === 'equip' ? G.Items.create(tid, { plain: true }) : G.Items.create(tid, { qty: n });
    if (!G.Inv.hasSpace(p, tid) || !G.Inv.add(p, item)) { this.log('인벤토리 공간이 부족합니다.', '#ff7a7a'); return; }
    p.d.gold -= cost;
    this.log(`${t.name}${n > 1 ? ' ×' + n : ''} 구매 (-${G.U.fmt(cost)} G)`, '#ffd54a');
    G.Audio.play('buy'); this.dirty();
  },
  // 빌드 4 (14): 여러 개 고르기 (상점이 열려 있을 때). msel = 고른 아이템(Set), null = 끔
  mselAct(arg) {
    const p = G.Game.player;
    if (arg === 'toggle') this.msel = this.msel ? null : new Set();
    else if (arg === 'sell') {
      if (!this.msel) return;
      const list = [];
      for (const it of this.msel) for (const tab in p.d.inv) { const i = p.d.inv[tab].indexOf(it); if (i >= 0) { list.push([tab, i]); break; } }
      this.sellMany(list, () => { if (this.msel) this.msel.clear(); });
      return;
    } else if (this.msel) {
      const [tab, i] = arg.split(':'), it = p.d.inv[tab][+i];
      if (!it) return;
      const t = G.ITEMS[it.tid];
      if (t.quest || t.gift || t.noSell) { this.log(`${t.name}은(는) 팔 수 없어요.`, '#ff9a9a'); return; }
      if (this.msel.has(it)) this.msel.delete(it); else this.msel.add(it);
    }
    this.renderWin('inv');
  },
  mselTotal() {
    let n = 0, gold = 0;
    for (const it of this.msel || []) { const t = G.ITEMS[it.tid]; n++; gold += t.cat === 'equip' ? G.Items.sellPrice(it) : Math.floor(t.price * 0.3) * (it.qty || 1); }
    return { n, gold };
  },
  // 여러 개 한 번에 판매 (빛남 이상이 있으면 한 번만 물어봄)
  sellMany(list, after) {
    const p = G.Game.player;
    const items = list.map(([tab, i]) => [tab, i, p.d.inv[tab][i]]).filter(x => x[2]);
    if (!items.length) return;
    const go = () => {
      let n = 0, gold = 0;
      for (const [tab, i, it] of items) {
        if (p.d.inv[tab][i] !== it) continue;
        const t = G.ITEMS[it.tid];
        if (t.quest || t.gift || t.noSell) continue;
        const v = t.cat === 'equip' ? G.Items.sellPrice(it) : Math.floor(t.price * 0.3) * (it.qty || 1);
        p.d.inv[tab][i] = null; p.d.gold += v; n++; gold += v;
      }
      if (n) { this.log(`${n}개 판매 (+${G.U.fmt(gold)} G)`, '#ffd54a'); G.Audio.play('buy'); G.Game.save(true); }
      if (after) after();
      this.dirty(); if (this.isOpen('inv')) this.renderWin('inv');
    };
    const rare = items.filter(([, , it]) => (it.grade || 0) >= 2).length;
    if (rare) this.ask(`빛남 이상 등급 <b>${rare}개</b>가 들어 있어요.<br>모두 <b>${items.length}개</b>를 판매할까요?`, '판매', go);
    else go();
  },
  sell(tab, idx, ok) {
    const p = G.Game.player, it = p.d.inv[tab][idx], t = it && G.ITEMS[it.tid];
    if (!it) return;
    if (t.quest) { this.log('퀘스트 아이템은 판매할 수 없습니다.', '#ff7a7a'); return; }
    if (t.gift) { this.log('연희의 선물은 판매할 수 없습니다.', '#ff9ad0'); return; }
    if (t.noSell) { this.log(`${t.name}은(는) 귀한 물건이라 팔 수 없습니다.`, '#ffe08a'); return; }
    if ((it.grade || 0) >= 2 && !ok) {
      this.ask(`<b style="color:${G.GRADES[it.grade].color}">${G.GRADES[it.grade].name}</b> 등급 <b>${G.U.esc(t.name)}</b>을(를) 판매할까요?`, '판매',
        () => { if (p.d.inv[tab][idx] === it) this.sell(tab, idx, true); });
      return;
    }
    const qty = it.qty || 1, price = G.Items.sellPrice(it) * (it.qty ? 1 : 1);
    const total = (t.cat === 'equip' ? price : Math.floor(t.price * 0.3) * qty);
    p.d.inv[tab][idx] = null; p.d.gold += total;
    this.log(`${t.name}${qty > 1 ? ' ×' + qty : ''} 판매 (+${G.U.fmt(total)} G)`, '#ffd54a');
    G.Audio.play('buy'); this.dirty();
  },

  // ---------- 알림 ----------
  log(msg, color) {
    const box = document.getElementById('log');
    const d = document.createElement('div');
    d.textContent = msg; d.style.color = color || '#dfe5f7';
    box.appendChild(d);
    while (box.children.length > 7) box.firstChild.remove();
  },
  banner(title, sub, kind) {
    const b = document.getElementById('banner');
    b.innerHTML = `<div style="${kind === 'shout' ? 'font-size:20px;color:#ffb0a0' : ''}">${G.U.esc(title)}${sub ? `<small>${G.U.esc(sub)}</small>` : ''}</div>`;
  },
  mapChanged(map) {
    document.getElementById('mapname').innerHTML = `${G.U.esc(map.name)}<small>${map.lvText}</small>`;
    const f = document.getElementById('fade');
    f.style.transition = 'none'; f.style.opacity = '1';
    requestAnimationFrame(() => { f.style.transition = 'opacity .4s'; f.style.opacity = '0'; });
  },
  overlay(html) { document.getElementById('overlay').innerHTML = html; this.hideTip(); },
  // 게임 안 확인 창 (브라우저 confirm 대신. 웹 페이지 안에서는 confirm 이 막혀 있을 수 있다)
  askFn: null,
  ask(msg, yes, fn) {
    this.askFn = fn;
    let el = document.getElementById('askov');
    if (!el) { el = document.createElement('div'); el.id = 'askov'; this.root.appendChild(el); }
    el.innerHTML = `<div class="ask-bg"><div class="ask"><div>${msg}</div>
      <button class="btn gold" data-act="ask" data-arg="yes">${G.U.esc(yes)}</button>
      <button class="btn" data-act="ask" data-arg="no">취소</button></div></div>`;
  },
  answer(ok) {
    const el = document.getElementById('askov'), fn = this.askFn;
    if (el) el.innerHTML = '';
    this.askFn = null;
    if (ok && fn) fn();
  },
  // 빌드 2 (9-2): 여러 개 중 고르기 (ask 와 같은 자리 · 같은 모양). btns: [[글, 버튼 class, 함수], ...] 마지막에 취소
  choose(msg, btns, note) {
    this.chooseFns = btns.map(b => b[2]); this.askFn = null;
    let el = document.getElementById('askov');
    if (!el) { el = document.createElement('div'); el.id = 'askov'; this.root.appendChild(el); }
    el.innerHTML = `<div class="ask-bg"><div class="ask qch"><div>${msg}</div>
      ${btns.map((b, i) => `<button class="btn ${b[1] || ''}" data-act="ask" data-arg="c${i}">${G.U.esc(b[0])}</button>`).join('')}
      <button class="btn" data-act="ask" data-arg="no">취소</button>${note ? `<div class="note">${note}</div>` : ''}</div></div>`;
  },
  // 빌드 3 (19): 버튼이 들어 있는 html 패널 (ask 자리 · 같은 규칙). 버튼은 data-act="ask" data-arg="c번호", 취소는 data-arg="no"
  panel(html, fns, cls) {
    this.chooseFns = fns; this.askFn = null;
    let el = document.getElementById('askov');
    if (!el) { el = document.createElement('div'); el.id = 'askov'; this.root.appendChild(el); }
    el.innerHTML = `<div class="ask-bg"><div class="ask ${cls || ''}">${html}</div></div>`;
  },
  chosen(i) {
    const fn = this.chooseFns && this.chooseFns[i];
    this.answer(false); this.chooseFns = null;
    if (fn) fn();
  },
  // 빌드 2 (9-2): 퀘스트 알림 ✕ → 숨기기 / 포기 (서브 퀘스트만, 각성 퀘스트 제외)
  canAbandon(q) { return q.type === 'sub' && !(q.act && q.act.job); },
  questX(id) {
    const p = G.Game.player, q = G.QUESTS[id];
    if (!p || !q || !G.Quest.isActive(id) || this.asking() || G.Dialog.isOpen()) return;
    const title = `<b style="color:#ffe08a">${q.type === 'main' ? '[메인]' : '[서브]'} ${G.U.esc(q.name)}</b><br>`;
    const hide = () => { const st = p.d.quests[id]; if (!st) return; st.h = 1; G.UI.log(`[${q.name}] 퀘스트 알림을 숨겼어요. (퀘스트 창에서 다시 보이기)`, '#9aa6c8'); this.dirty(); };
    const quit = () => {
      if (!G.Quest.isActive(id)) return;
      delete p.d.quests[id];
      if (G.Nav.qid === id) G.Nav.clear();
      G.UI.log(`[퀘스트 포기] ${q.name} — ${G.NPCS[q.start].name}에게서 다시 받을 수 있어요.`, '#ff9a9a');
      this.dirty(); G.Game.save(true);
    };
    if (this.canAbandon(q)) this.choose(title + '이 퀘스트를 어떻게 할까요?', [['👁 화면에서만 숨기기', 'gold', hide], ['🗑 퀘스트 포기', 'bad', quit]],
      '숨기기: 퀘스트 창에서 다시 보이게 할 수 있어요. 완료할 수 있게 되면 저절로 다시 보여요.<br>포기: 잡은 수가 처음으로 돌아가요. 모은 아이템은 가방에 남아요. 같은 NPC에게 다시 받을 수 있어요.');
    else this.choose(title + '목록에서 숨길까요?', [['👁 화면에서만 숨기기', 'gold', hide]],
      `${q.type === 'main' ? '메인' : '각성'} 퀘스트는 이야기가 이어져야 해서 포기할 수 없어요.<br>퀘스트 창에서 다시 보이게 할 수 있어요.`);
  },
  asking() { const el = document.getElementById('askov'); return !!(el && el.innerHTML); },
  showDeath(lose) {
    this.overlay(`<div class="overlay"><h1 style="color:#ff8a8a">쓰러졌습니다</h1>
      <h2>경험치 ${G.U.fmt(lose)} 를 잃었습니다. 마을에서 HP 50%로 부활합니다.</h2>
      <button class="btn gold" data-act="revive">마을에서 부활</button></div>`);
  },
  showVictory(name, sec) {
    const mm = Math.floor(sec / 60), ss = String(sec % 60).padStart(2, '0');
    this.overlay(`<div class="overlay" style="background:radial-gradient(ellipse at 50% 40%, rgba(80,60,20,.85) 0%, rgba(5,7,14,.9) 70%)">
      <h1>${name} 처치!</h1><h2>전투 시간 ${mm}분 ${ss}초 · 일곱 별조각이 다시 빛나기 시작했다...</h2>
      <button class="btn gold" data-act="title" data-arg="closehelp">계속</button></div>`);
  },
  helpOpen() { return !!document.getElementById('helpov'); },
  toggleHelp() {
    if (this.helpOpen()) { G.Title.act('closehelp'); return; }
    this.showHelp();
  },
  showHelp() {
    const row = (keys, desc) => `<tr><td>${keys.map(k => `<kbd>${k}</kbd>`).join(' ')}</td><td>${desc}</td></tr>`;
    const L = id => G.Keys.label(id), J = L('jump');
    this.overlay(`<div class="overlay" id="helpov"><div class="help">
      <div style="font-size:20px;font-weight:900;color:#ffe4a0;margin-bottom:8px">단축키 전체 안내 <span class="dim" style="font-size:12px;font-weight:400">F1 또는 Esc로 닫기</span></div>
      <div style="display:flex;gap:28px"><table class="keys">
        <tr><th colspan="2">이동 · 전투</th></tr>
        ${row(['←', '→'], '이동')}
        ${row([J], '점프')}
        ${row([J, J], '2단 점프: 공중에서 앞으로 살짝')}
        ${row([J, '↑+' + J], '2단 점프: 공중에서 위로 한 번 더')}
        ${row(['↓', J], '발판 아래로 내려가기')}
        ${row([L('dash')], G.F.GDASH_HOLD ? '대쉬 (땅에서, 누르고 있으면 계속)' : '대쉬 (땅에서, 누를 때마다 한 번)')}
        ${row(['←←', '→→'], '방향키 두 번 대쉬 (메뉴에서 켜기)')}
        ${row([L('attack')], '기본 공격 (누르고 있으면 연속)')}
        ${row([L('skill1'), '~', L('skill6')], '스킬 단축키')}
        ${row([L('hp')], 'HP 물약')}
        ${row([L('mp')], 'MP 물약')}
        ${row(['↑'], '포탈 이동 / NPC 대화 / 보물상자')}
        ${row(['Enter'], '대화 넘기기 · 수락')}
      </table><table class="keys">
        <tr><th colspan="2">창 · 기타</th></tr>
        ${row([L('stat')], '스탯 (능력 포인트 배분, Shift+클릭 5씩)')}
        ${row([L('equip')], '장비 (더블클릭: 해제)')}
        ${row([L('inv')], '인벤토리 (더블클릭: 착용·사용·판매)')}
        ${row([L('skill')], '스킬 (기술 포인트 배분, 단축키, 2단 점프 모드)')}
        ${row([L('quest')], '퀘스트')}
        ${row([L('map')], '지도 (월드맵 / 현재 맵)')}
        ${row(['F1'], '이 안내')}
        ${row(['메뉴'], '키 설정: 원하는 키로 변경')}
        ${row(['Esc'], '창 닫기 / 메뉴')}
        ${row(['F11'], '전체화면 (EXE)')}
        <tr><td colspan="2" class="dim" style="padding-top:8px">오른쪽 위 퀘스트 더블클릭 → 길 안내<br>각인서·공명석: 더블클릭 후 장비 클릭 · 단련: 대장장이에게<br>금색 높은 발판: 2단 점프(위로)로 올라가면 보물상자<br>몬스터도 스킬을 써요: 하얗게 번쩍·무기를 치켜듦·바닥 그림자·옅은 웅덩이가 보이면 피하세요</td></tr>
      </table></div>
      </div><br><button class="btn gold" data-act="title" data-arg="closehelp">닫기</button></div>`);
    G.Tutorial.ev('help');
  },

  // ---------- 툴팁 ----------
  showTip(ref, e) {
    const html = G.Tip.build(ref);
    if (!html) { this.hideTip(); return; }
    this.tip.innerHTML = html; this.tip.style.display = 'block';
    this.moveTip(e);
  },
  moveTip(e) {
    const rect = this.root.getBoundingClientRect(), sc = G.Game.scale;
    let x = (e.clientX - rect.left) / sc + 16, y = (e.clientY - rect.top) / sc + 12;
    const w = this.tip.offsetWidth, h = this.tip.offsetHeight;
    if (x + w > 1275) x -= w + 30;
    if (y + h > 715) y = 715 - h;
    this.tip.style.left = x + 'px'; this.tip.style.top = y + 'px';
  },
  hideTip() { if (this.tip) this.tip.style.display = 'none'; },
};

// ---------------- 툴팁 내용 ----------------
G.Tip = {
  build(ref) {
    const p = G.Game.player;
    if (!p) return '';
    const [kind, a, b] = ref.split(':');
    if (kind === 'inv') { const it = p.d.inv[a][+b]; return it ? this.item(it) : ''; }
    if (kind === 'sto') { const it = G.Storage.of(p)[a][+b]; return it ? this.item(it) : ''; }
    if (kind === 'eq') { const it = p.d.eq[a]; return it ? this.item(it, true) : `<div class="tl">${G.SLOT_NAMES[a]} (비어 있음)</div>`; }
    if (kind === 'tpl') return this.tpl(G.ITEMS[a]);
    if (kind === 'skill') return this.skill(G.SKILLS[a]);
    if (kind === 'set') return this.set(a);
    if (kind === 'buff') return this.buff(p, a);
    if (kind === 'debuff') return this.debuff(p, a);
    if (kind === 'cheer') return `<div class="tn" style="color:#ffc8e8">연희의 응원</div><div class="tg dim">재사용 대기 ${Math.ceil(p.cheerCd || 0)}초</div><div class="sec">연희의 별 부적이 다시 지켜 줄 준비를 하고 있어요.</div>`;
    if (kind === 'map') return this.map(a);
    return '';
  },
  // 1.7.9: 버프 · 나쁜 효과
  buff(p, id) {
    const b = p.buffs[id];
    if (!b) return '';
    const left = Math.ceil(b.left), tm = s => s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`;
    const lines = Object.entries(b.stats).filter(([k, v]) => v && k !== 'barrier').map(([k, v]) => `<div style="color:#9fd8ff">${G.statText(k, Math.round(v * 10) / 10)}</div>`).join('');
    const bar = b.stats.barrier ? `<div style="color:#bfe6ff">남은 보호막 ${Math.round(p.barrier || 0).toLocaleString()}</div>` : '';
    return `<div class="tn" style="color:#ffd54a">${b.name}</div><div class="tg dim">버프 · 남은 시간 ${tm(left)} / ${tm(Math.ceil(b.max))}</div><div class="sec">${lines}${bar}</div>`;
  },
  debuff(p, k) {
    const D = { poison: () => `초당 피해 ${Math.round(p.poison.dps).toLocaleString()}`, slow: () => '이동 속도 −50%',
      despair: () => `회복량 −${p.despair.cut}% · 초당 최대 HP의 ${p.despair.dot}% 피해`, curse: () => '물약을 쓸 수 없습니다',
      silence: () => '스킬을 쓸 수 없습니다', invert: () => '좌우 방향키가 반대로 움직입니다' };
    const e = G.HUD.DEBUFFS(p).find(x => x[0] === k);
    if (!e) return '';
    return `<div class="tn" style="color:#ff8a8a">${G.DEBUFF_ICON[k].name}</div><div class="tg dim">나쁜 효과 · 남은 시간 ${Math.ceil(e[1])}초</div><div class="sec"><div>${D[k]()}</div></div>`;
  },
  map(id) {
    const m = G.MAPS[id];
    const mons = [...new Set(m.spawns.map(s => s.m))].map(k => G.MONSTERS[k]);
    let h = `<div class="tn">${m.name}</div><div class="tg dim">${m.lvText}</div>`;
    if (mons.length) h += `<div class="sec"><h5>몬스터</h5>${mons.map(x => `<div style="color:${x.kind === 'boss' ? '#ff8a8a' : '#c9d1ea'}">Lv.${x.lv} ${x.name}${x.kind === 'boss' ? ' (보스)' : ''}</div>`).join('')}</div>`;
    if (m.npcs.length) h += `<div class="sec"><h5>NPC</h5>${m.npcs.map(n => `<div>${G.NPCS[n.id].name} <span class="dim">${G.NPCS[n.id].title}</span></div>`).join('')}</div>`;
    return h;
  },
  lines(o) { return Object.keys(o).map(k => `<div>${G.statText(k, o[k])}</div>`).join(''); },
  head(t, g) {
    const p = G.Game.player, lvOk = p.d.level >= t.lv, jobOk = t.job === 'any' || t.job === G.familyOf(p.d.job);
    const kind = t.slot === 'weapon' ? `무기 (${G.WEAPON_NAMES[t.type]})` : G.SLOT_NAMES[t.slot];
    return `<div class="tn" style="color:${g.color}">${G.U.esc(t.name)}</div>
      <div class="tg" style="color:${g.color}">${g.id === 'normal' ? '' : `(${g.name} 아이템)`}</div>
      <div class="tl">종류: ${kind}</div>
      <div class="tl ${lvOk ? '' : 'no'}">착용 레벨: ${t.lv}</div>
      <div class="tl ${jobOk ? '' : 'no'}">직업: ${t.job === 'any' ? '공용' : G.JOBS[t.job].name}</div>`;
  },
  setBlock(t) {
    if (!t.set) return '';
    const set = G.SETS[t.set], p = G.Game.player, cnt = p.st.setCount[t.set] || 0;
    let h = `<div class="sec"><h5 style="color:#7de3b0">${set.name} (${cnt}/${set.pieces.length})</h5>`;
    for (const n in set.bonus) {
      const on = cnt >= +n;
      h += `<div style="color:${on ? '#7dff9a' : '#6b7493'}">${n}세트: ${Object.keys(set.bonus[n]).map(k => G.statText(k, set.bonus[n][k])).join(', ')}</div>`;
    }
    return h + '</div>';
  },
  item(it) {
    const t = G.ITEMS[it.tid];
    if (t.cat !== 'equip') {
      return `<div class="tn">${G.U.esc(t.name)}</div><div class="tl" style="white-space:pre-wrap">${G.U.esc(t.desc || '')}</div>
        ${t.quest ? '<div class="sec" style="color:#ffd54a">퀘스트 아이템</div>' : `<div class="sec dim">판매가 ${G.U.fmt(Math.floor(t.price * 0.3))} G</div>`}`;
    }
    const g = G.Items.gradeOf(it);
    let h = this.head(t, g).replace(`>${G.U.esc(t.name)}<`, `>${G.U.esc(G.Items.displayName(it))}<`);
    h += `<div class="sec"><h5>기본 옵션</h5>${this.lines(t.base)}</div>`;
    const upg = G.UPGRADE[t.slot];
    if (upg) {
      const per = Object.keys(upg.per).map(k => G.statText(k, Math.round(upg.per[k] * (it.up || 0)))).join(', ');
      const left = G.Items.slotsLeft(it), max = G.Items.maxSlots(t);
      h += `<div class="sec"><h5 style="color:#7dd3ff">별빛 각인 +${it.up || 0}</h5>${it.up ? `<div style="color:#bfe6ff">${per}</div>` : ''}
        <div class="dim">각인 칸: ${max - left} / ${max}${left > 0 ? ` · 다음 칸 성공률 ${Math.round(G.Items.engraveRate(it) * 100)}%` : ''}</div></div>`;
    }
    if (it.sfx && it.sfx.length) {
      h += `<div class="sec"><h5 style="color:#ffe08a">특수 효과</h5>${it.sfx.map(f => `<div style="color:#ffe8a0">${G.Items.sfxText(f)}</div>`).join('')}</div>`;
    }
    if (it.add && it.add.length) {
      h += `<div class="sec"><h5 style="color:#ffb070">단련 효과</h5>${it.add.map(o => `<div style="color:#ffd8a8">${G.statText(o.stat, o.val)} <span class="dim">(${o.stage}단계)</span></div>`).join('')}</div>`;
    }
    if (it.grade > 0) {
      const need = G.Items.resNeed(it);
      h += `<div class="sec"><h5 style="color:${g.color}">별자리 각인 · ${g.name}</h5>${it.pot.map(o => `<div style="color:${G.GRADES[o.g].color}">${G.statText(o.stat, o.val)}</div>`).join('')}${need ? `<div class="dim">공명 게이지 ${it.res || 0} / ${need}</div>` : ''}</div>`;
    } else {
      h += `<div class="sec dim">별자리 각인 없음 (공명석으로 깨울 수 있음)</div>`;
    }
    if (t.cheer) h += `<div class="sec"><h5 style="color:#ffc8e8">특수 효과 · 연희의 응원</h5><div style="color:#ffe0f0">쓰러질 만큼 큰 피해를 받으면 한 번 HP 1로 버팁니다. (재사용 3분)</div></div>`;
    if (t.desc) h += `<div class="sec" style="color:#e8d8f0;white-space:pre-wrap">${G.U.esc(t.desc)}</div>`;
    h += this.setBlock(t);
    h += t.gift ? '<div class="sec" style="color:#ffc8e8">연희의 선물 · 판매 불가</div>' : `<div class="sec dim">판매가 ${G.U.fmt(G.Items.sellPrice(it))} G</div>`;
    return h;
  },
  tpl(t) {
    if (t.cat !== 'equip') return this.item({ tid: t.id, qty: 1 });
    return this.head(t, G.GRADES[0]) + `<div class="sec"><h5>기본 옵션</h5>${this.lines(t.base)}</div>
      <div class="sec dim">상점 구매품은 단련 효과·별자리 각인이 없습니다.</div>` + this.setBlock(t);
  },
  skill(sk) {
    const p = G.Game.player, lv = p.d.skills[sk.id] || 0;
    let h = `<div class="tn">${sk.name}</div><div class="tg dim">${{ attack: '공격', buff: '버프', heal: '회복', move: '이동', passive: '패시브', toggle: '이동 보조' }[sk.type]} · ${G.JOBS[sk.job].name}</div>`;
    h += `<div class="tl">현재 레벨: ${lv} / ${sk.maxLv}</div>`;
    if (lv > 0) h += `<div class="sec">${sk.desc(lv)}${sk.mp ? `<div class="dim">MP ${sk.mp(lv)} 소모</div>` : ''}</div>`;
    if (lv < sk.maxLv) h += `<div class="sec"><h5 class="dim">다음 레벨</h5>${sk.desc(lv + 1)}${sk.mp ? `<div class="dim">MP ${sk.mp(lv + 1)} 소모</div>` : ''}</div>`;
    return h;
  },
  set(id) {
    const set = G.SETS[id], cnt = G.Game.player.st.setCount[id] || 0;
    let h = `<div class="tn" style="color:#7de3b0">${set.name}</div><div class="tl">구성: ${set.pieces.map(t => t.split('|').map(x => G.ITEMS[x].name).join('/')).join(', ')}</div>`;
    for (const n in set.bonus) h += `<div style="color:${cnt >= +n ? '#7dff9a' : '#6b7493'}">${n}세트: ${Object.keys(set.bonus[n]).map(k => G.statText(k, set.bonus[n][k])).join(', ')}</div>`;
    return h;
  },
};
