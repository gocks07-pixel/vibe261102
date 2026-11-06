'use strict';
// 모바일 2차-1.2: 플레이 편의 (직업 소개 · 스탯 안내 · 장비 비교 · 최고 장비 · 자동 흡수 · 공격 중 이동 · 제한형 자동 사냥)
//  우선 터치 모드(휴대폰)에서만 켠다. PC · EXE 에도 켜려면 G.Play.PC = true (hannyomi-backup 과 합칠 때 결정)
//  게임 규칙 · 밸런스 수치는 그대로. 자동 사냥은 터치 버튼처럼 "키를 누른 것"만 넣는다 (G.Touch.press)
G.Play = {
  PC: false,
  on() { return G.Touch.active() || this.PC; },
  opt(k) { const v = G.Touch.opt[k]; return v == null ? true : v; },   // magnet · moveCancel 기본 켬

  // ================= ① 직업 소개 =================
  FAM: {
    warrior: { ic: '⚔', w: '검', tag: '가까이서 베기', diff: 1, lines: ['불꽃 검기로 멀리까지 베는 공격형', '방패와 빛으로 버티는 방어형 · HP · 방어가 높아요'] },
    archer: { ic: '🏹', w: '활', tag: '멀리서 화살', diff: 2, lines: ['화살을 여러 발 흩뿌리는 빠른 연사형', '물러나며 쏘는 한 방 저격형 · 치명타 · 방어 무시'] },
    mage: { ic: '🔮', w: '지팡이', tag: '멀리서 마법 · 넓은 범위', diff: 2, lines: ['하늘에서 불을 떨어뜨리는 넓은 범위형', '얼음 파편으로 꿰뚫는 치명타형'] },
    thief: { ic: '🗡', w: '단검', tag: '빠른 연타 · 치명타', diff: 3, lines: ['그림자처럼 돌진해 급소를 찌르는 형', '독 단검을 던지고 독을 쌓는 형'] },
  },
  level3(v, lo, hi) { return v >= hi ? '높음' : v >= lo ? '보통' : '낮음'; },
  skillNames(job, n = 3) { return G.skillsOfJob(job).filter(s => s.type === 'attack' || s.type === 'buff').slice(0, n).map(s => s.name).join(' · '); },
  jobIntro() {
    const p = G.Game.player;
    if (!p) return;
    const fam = G.familyOf(p.d.job), J = G.JOBS[p.d.job];
    const N = G.STAT_NAMES, star = n => '★'.repeat(n) + '☆'.repeat(3 - n);
    let h;
    if (fam === 'beginner') {
      h = '<h3>📖 어떤 직업이 될까?</h3><div class="dim">Lv.10 이 되면 바람결 마을 모험가 길드에서 각성 Ⅰ 시험을 받을 수 있어요. 한 번 정한 계열은 바꿀 수 없어요.</div>';
      for (const f of ['warrior', 'archer', 'mage', 'thief']) {
        const F = this.FAM[f], j = G.JOBS[f], tree = G.JOB_TREE[f];
        h += `<div class="job-card"><div class="jc-h">${F.ic} <b>${j.name}</b> <span class="dim">${F.tag}</span><span class="jc-d">난이도 ${star(F.diff)}</span></div>
          <div class="jc-l">주스탯 <b class="ms">${N[j.main]}</b> · 부스탯 ${N[j.sub]} · 무기 ${F.w} · HP ${this.level3(j.hpLv, 12, 20)} · MP ${this.level3(j.mpLv, 8, 16)} · 치명타 ${this.level3(j.crit, 8, 11)}</div>
          <div class="jc-l dim">스킬: ${this.skillNames(f)}</div>
          <div class="jc-l dim">앞으로: ${tree[0][0]} (${F.lines[0].split(' · ')[0]}) / ${tree[1][0]} (${F.lines[1].split(' · ')[0]})</div></div>`;
      }
      h += '<div class="msg">💡 표류자 때 올린 능력 포인트는 각성 Ⅰ 때 <b>모두 돌려받아요</b>. 직업을 정한 뒤 주스탯에 다시 찍으면 돼요.</div>';
    } else {
      const F = this.FAM[fam], tree = G.JOB_TREE[fam];
      h = `<h3>📖 ${G.JOBS[fam].name}의 두 갈래</h3><div class="dim">Lv.30 각성 Ⅱ 에서 둘 중 하나를 골라요. 한 번 고른 갈래는 각성 Ⅳ 까지 이어져요. 주스탯은 둘 다 ${N[J.main]} 그대로예요.</div>`;
      ['a', 'b'].forEach((s, i) => {
        const id2 = `${fam}_2${s}`, mine = J.line === s;
        h += `<div class="job-card ${mine ? 'mine' : ''}"><div class="jc-h">${F.ic} <b>${tree[i][0]}</b> → ${tree[i][1]} → ${tree[i][2]}${mine ? '<span class="jc-d">지금 갈래</span>' : ''}</div>
          <div class="jc-l">${F.lines[i]}</div><div class="jc-l dim">각성 Ⅱ 스킬: ${this.skillNames(id2, 4)}</div></div>`;
      });
    }
    G.Mobile.modal(h + '<div class="end"><button class="gold" data-m="close">알겠어요</button></div>', () => {}, true);
  },
  // 레벨 10 · 30 이 되었을 때 한 번 (캐릭터마다, 세이브가 아닌 hny_touch 에 기억)
  afterLevel(p) {
    if (!this.on()) return;
    const d = p.d, J = G.JOBS[d.job], key = `${G.Save.slot}:${d.name}:${d.level}`;
    if (!((d.level === 10 && d.job === 'beginner') || (d.level === 30 && J.tier === 1))) return;
    const seen = G.Touch.opt.jobSeen || (G.Touch.opt.jobSeen = {});
    if (seen[key]) return;
    seen[key] = 1; G.Touch.save();
    setTimeout(() => this.jobIntro(), 1200);   // 레벨업 연출이 끝난 뒤
  },

  // ================= ② 스탯 안내 =================
  statBox() {
    const p = G.Game.player, d = p.d, J = G.JOBS[d.job], N = G.STAT_NAMES;
    let t;
    if (d.job === 'beginner') t = `💡 표류자 때 올린 포인트는 <b>Lv.10 각성 Ⅰ 때 모두 돌려받아요</b>. 부담 없이 <b class="ms">${N.STR}</b>에 넣으면 사냥이 쉬워져요.`;
    else {
      t = `💡 추천: <b class="ms">${N[J.main]}</b>에 모두. 공격력은 <b>주스탯 × 4 + 부스탯</b>이라 ${N[J.main]} 1점이 ${N[J.sub]} 4점과 같아요.`;
      if (G.familyOf(d.job) === 'mage') t += ' 지혜는 MP 도 늘려 줘요 (지혜 2점당 MP +1).';
    }
    return `<div class="stat-tip">${t}<div class="row" style="margin-top:6px;gap:6px">
      <button class="btn sm gold" data-play="statall" ${d.ap ? '' : 'disabled'}>⭐ 추천대로 모두 올리기${d.ap ? ` (${d.ap}점)` : ''}</button>
      <button class="btn sm" data-play="jobintro">📖 직업 소개</button></div></div>`;
  },
  statAll() {
    const p = G.Game.player, d = p.d;
    if (!d.ap) return;
    const k = d.job === 'beginner' ? 'STR' : G.JOBS[d.job].main;
    G.UI.ask(`남은 능력 포인트 <b>${d.ap}점</b>을 모두 <b>${G.STAT_NAMES[k]}</b>에 올릴까요?`, '올리기', () => { p.addAP(k, d.ap); G.UI.log(`${G.STAT_NAMES[k]}에 능력 포인트를 모두 올렸습니다.`, '#ffe06a'); });
  },

  // ================= ③ 장비 비교 · ④ 최고 장비 =================
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
  setCounts(eq) { const c = {}; for (const k in eq) { const it = eq[k]; const s = it && G.ITEMS[it.tid].set; if (s) c[s] = (c[s] || 0) + 1; } return c; },
  compare(idx) {
    const p = G.Game.player, d = p.d, it = d.inv.equip[idx];
    if (!it) return '';
    const t = G.ITEMS[it.tid], err = G.Items.canEquip(p, t);
    if (err) return `<div class="sec cmp"><h5>착용 중인 장비와 비교</h5><div class="no">착용 불가: ${err}</div></div>`;
    const slot = this.slotFor(it, d.eq), old = d.eq[slot];
    const neq = Object.assign({}, d.eq, { [slot]: it });
    const a = this.statsWith(d.eq), b = this.statsWith(neq);
    const pct = (this.score(b) / this.score(a) - 1) * 100;
    const row = (name, v, unit = '', digits = 0) => {
      if (Math.abs(v) < (digits ? 0.05 : 0.5)) return '';
      const up = v > 0;
      return `<span class="${up ? 'up' : 'dn'}">${name} ${up ? '+' : '−'}${Math.abs(v).toFixed(digits)}${unit} ${up ? '▲' : '▼'}</span>`;
    };
    let lines = row('예상 피해', pct, '%', 1) + row('최대 HP', b.maxHP - a.maxHP) + row('최대 MP', b.maxMP - a.maxMP) + row('방어', b.def - a.def) +
      row('치명타', b.crit - a.crit, '%') + row('보스 피해', b.bossDmg - a.bossDmg, '%');
    if (!lines) lines = '<span class="dim">능력치 차이 없음</span>';
    const c0 = this.setCounts(d.eq), c1 = this.setCounts(neq), sets = [];
    for (const s of new Set([...Object.keys(c0), ...Object.keys(c1)])) if ((c0[s] || 0) !== (c1[s] || 0)) sets.push(`${G.SETS[s].name} ${c0[s] || 0} → ${c1[s] || 0}개`);
    return `<div class="sec cmp"><h5>${old ? `착용 중 [${G.U.esc(G.Items.displayName(old))}] 과 비교` : `빈 칸(${G.SLOT_NAMES[slot]})에 끼면`}</h5><div class="cmp-l">${lines}</div>
      ${sets.length ? `<div class="dim">세트: ${sets.join(' · ')}</div>` : ''}</div>`;
  },
  // 부위마다 예상 피해가 가장 높아지는 장비 (세트 효과 때문에 더 좋아지지 않을 때까지 반복)
  bestSet() {
    const p = G.Game.player, d = p.d;
    const pool = [...d.inv.equip.filter(Boolean), ...Object.values(d.eq).filter(Boolean)].filter(it => !G.Items.canEquip(p, G.ITEMS[it.tid]));
    const cur = Object.assign({}, d.eq);
    for (let pass = 0; pass < 4; pass++) {
      let changed = false;
      for (const slot of G.EQUIP_SLOTS) {
        const used = new Set(Object.entries(cur).filter(([k, v]) => k !== slot && v).map(([, v]) => v));
        let best = cur[slot], bestS = this.statsWith(cur);
        for (const it of pool) {
          if (it === cur[slot] || used.has(it) || !this.fits(G.ITEMS[it.tid], slot)) continue;
          const s = this.statsWith(Object.assign({}, cur, { [slot]: it }));
          if (this.better(s, bestS)) { best = it; bestS = s; }
        }
        if (best !== cur[slot]) { cur[slot] = best; changed = true; }
      }
      if (!changed) break;
    }
    return cur;
  },
  bestEquip() {
    const p = G.Game.player, d = p.d, cur = this.bestSet();
    const ch = G.EQUIP_SLOTS.filter(s => cur[s] !== d.eq[s]);
    if (!ch.length) { G.UI.log('지금 입은 장비가 가장 좋아요.', '#9fd8ff'); return; }
    const a = this.statsWith(d.eq), b = this.statsWith(cur), pct = (this.score(b) / this.score(a) - 1) * 100;
    const list = ch.map(s => `${G.SLOT_NAMES[s]}: ${d.eq[s] ? G.U.esc(G.Items.displayName(d.eq[s])) : '(빈 칸)'} → <b>${G.U.esc(G.Items.displayName(cur[s]))}</b>`).join('<br>');
    G.UI.ask(`<b>⭐ 최고 장비로 바꿀까요?</b><br><span style="font-size:13px">${list}</span><br>예상 피해 <b style="color:#7dff9a">+${pct.toFixed(1)}%</b> · 최대 HP ${b.maxHP - a.maxHP >= 0 ? '+' : '−'}${Math.abs(b.maxHP - a.maxHP)}`, '입기', () => this.applyEquip(cur));
  },
  applyEquip(cur) {
    const p = G.Game.player, d = p.d;
    const newSet = new Set(Object.values(cur).filter(Boolean));
    const leftovers = Object.values(d.eq).filter(it => it && !newSet.has(it));
    const freed = [];
    d.inv.equip.forEach((it, i) => { if (it && newSet.has(it)) { d.inv.equip[i] = null; freed.push(i); } });
    for (const it of leftovers) { const i = freed.length ? freed.shift() : d.inv.equip.indexOf(null); if (i >= 0) d.inv.equip[i] = it; }
    for (const s of G.EQUIP_SLOTS) d.eq[s] = cur[s] || null;
    p.recalc(); G.UI.dirty(); G.Audio.play('pickup');
    G.UI.log('⭐ 최고 장비로 바꿨습니다.', '#7dff9a');
  },
  // 인벤토리 ▲ 표시: 지금보다 0.5% 이상 좋아지는 장비 (같은 상태면 다시 계산하지 않음)
  upgrades() {
    const p = G.Game.player, d = p.d;
    const sig = d.level + d.job + JSON.stringify(d.eq) + JSON.stringify(d.inv.equip);
    if (sig === this.upSig) return this.upList;
    const base = this.score(this.statsWith(d.eq)), out = new Set();
    d.inv.equip.forEach((it, i) => {
      if (!it || G.Items.canEquip(p, G.ITEMS[it.tid])) return;
      const s = this.score(this.statsWith(Object.assign({}, d.eq, { [this.slotFor(it, d.eq)]: it })));
      if (s > base * 1.005) out.add(i);
    });
    this.upSig = sig; this.upList = out;
    return out;
  },

  // ================= ⑤ 자동 흡수 =================
  magnet(dr, p, dt) {
    if (!dr.landed || p.dead || !this.on() || !this.opt('magnet')) return;
    const dx = p.x - dr.x, dy = (p.y - 4) - dr.y;
    if (Math.abs(dx) > 160 || Math.abs(dy) > 110) return;
    const pl = dr.payload;
    if (pl.item && !G.Inv.hasSpace(p, pl.item.tid)) return;   // 못 줍는 아이템은 그 자리에
    const sp = 560 * dt;
    dr.x += Math.sign(dx) * Math.min(Math.abs(dx), sp);
    dr.y += Math.sign(dy) * Math.min(Math.abs(dy), sp);
  },
  // ================= ⑥ 공격 중 이동 =================
  moveCancel() { return this.on() && this.opt('moveCancel'); },

  // ================= ⑦ 제한형 자동 사냥 =================
  autoOn: false, held: new Set(), taps: [], userT: 0, stuckT: 0, lastX: 0, patrol: 1,
  fieldOk() {
    const w = G.Game.world, m = w && G.MAPS[w.mapId];
    if (!m || m.town || m.hidden || w.mapId === 'dream_beach') return false;
    return !m.bossRoom || this.bossLeft() <= 0;
  },
  // ④ 2차-1.3: 보스 방은 같은 방에서 5번 쓰러지면 자동 허용 (캐릭터 · 보스 방마다, hny_touch 에 기억)
  BOSS_TRIES: 5,
  bossKey() { const w = G.Game.world, p = G.Game.player; return p && w ? `${G.Save.slot}:${p.d.name}:${w.mapId}` : ''; },
  bossLeft() {
    const w = G.Game.world, m = w && G.MAPS[w.mapId];
    if (!m || !m.bossRoom) return 0;
    if (this.forceBoss) return 0;   // 시뮬레이터 측정용
    const c = (G.Touch.opt.bossDeaths || {})[this.bossKey()] || 0;
    return Math.max(0, this.BOSS_TRIES - c);
  },
  get bossMode() { const w = G.Game.world, m = w && G.MAPS[w.mapId]; return !!(m && m.bossRoom); },
  onDeath(p) {
    const w = G.Game.world, m = w && G.MAPS[w.mapId];
    if (!m || !m.bossRoom || !this.on()) return;
    const k = this.bossKey(), o = G.Touch.opt, bd = o.bossDeaths || (o.bossDeaths = {});
    bd[k] = (bd[k] || 0) + 1; G.Touch.save();
    if (bd[k] === this.BOSS_TRIES) { this.toast(`🌟 ${this.BOSS_TRIES}번 도전했어요! 이제 이 보스는 자동으로 도와줄게요`); G.UI.log(`🌟 ${this.BOSS_TRIES}번 도전했어요! 이제 ${m.name}에서는 자동 사냥으로 도와줄게요.`, '#ffe08a'); }
  },
  // 2차-1.3: 보스 방 자동 전투 중에만 받는 피해 배율 (직접 할 때는 그대로). 목표: 보통 장비 70% 이상 승리 (시뮬레이터로 맞춤)
  //  여기 없는 보스는 1 (지금도 자동으로 이김)
  AUTO_GUARD: { buried_temple: 0.75, void_throne: 0.75 },   // 파라칸 · 녹스: 받는 피해 75% (시뮬레이터: 보통 장비 92% · 79% 승리)
  guardMul() {
    if (!this.autoOn || !this.bossMode || !this.on()) return 1;
    const w = G.Game.world;
    return (this.AUTO_GUARD[w.mapId] != null ? this.AUTO_GUARD[w.mapId] : 1);
  },
  // 보스를 지키는 것 (부숴야 보스 무적이 풀리는 기둥 · 잔영 등, 2.1 시뮬레이터와 같은 목록)
  GUARD: ['void_pillar', 'hero_echo', 'corrupt_shard', 'cool_valve', 'forgotten_star', 'rot_fruit', 'mummy_guard'],
  isGuard(m) { return !!(m.d && m.d.chainPillar) || this.GUARD.includes(m.id); },
  toggleAuto() {
    if (this.autoOn) { this.stop('자동 사냥을 멈췄어요.'); return; }
    if (!G.Game.player || !G.Game.world) return;
    if (!this.fieldOk()) {
      const left = this.bossLeft();
      this.toast(left > 0 ? `🤖 보스 방에서는 ${this.BOSS_TRIES}번 도전한 뒤에 자동 사냥을 쓸 수 있어요 (남은 도전 ${left}번)` : '🤖 자동 사냥은 사냥터에서만 쓸 수 있어요 (마을 · 튜토리얼 제외)');
      return;
    }
    this.autoOn = true; this.userT = 0; this.stuckT = 0;
    this.toast(this.bossMode ? '🤖 보스 자동 전투 시작! 기둥 같은 기믹은 먼저 부수지만, 보스 공격은 피하지 않아요.' : '🤖 자동 사냥 시작! 포탈 · 퀘스트 · 맵 이동은 직접 해 주세요. 몬스터 스킬은 피하지 않아요.');
    this.ui();
  },
  stop(msg, warn) {
    if (!this.autoOn) return;
    this.autoOn = false; this.release();
    if (msg) { this.toast(msg); G.UI.log(msg, warn ? '#ff9a7a' : '#9fd8ff'); }
    this.ui();
  },
  press(code) { this.inAuto = true; G.Touch.press(code); this.inAuto = false; },
  release() { for (const c of this.held) G.Touch.release(c); this.held.clear(); for (const c of this.taps) G.Touch.release(c); this.taps = []; },
  hold(set) {   // 이번 프레임에 누르고 있을 키
    for (const c of this.held) if (!set.has(c)) G.Touch.release(c);
    for (const c of set) if (!this.held.has(c)) this.press(c);
    this.held = set;
  },
  tap(code) { if (!code) return; if (this.held.has(code)) { G.Touch.release(code); this.held.delete(code); } this.press(code); this.taps.push(code); },
  userBusy() {
    const M = G.Mobile;
    const holding = M && (Object.keys(M.held || {}).length || Object.values(M.dpadDir || {}).some(Boolean));
    if (holding) this.userT = performance.now();
    return holding || performance.now() - this.userT < 2000;
  },
  paused() {
    const U = G.UI, M = G.Mobile;
    return G.UI.blocking() || Object.keys(U.wins).length > 0 || !!U.target || (M && (M.portrait || M.modalEl.classList.contains('on'))) ||
      (G.Cutscene.playing && G.Cutscene.playing()) || (G.Bug && G.Bug.isOpen && G.Bug.isOpen());
  },
  // 게임 한 프레임 직전에 (입력이 같은 프레임에 들어가도록)
  pre(dt) {
    this.gt = (this.gt || 0) + dt;   // 게임 시간 (시뮬레이터가 프레임을 빨리 넘겨도 같은 기준)
    for (const c of this.taps) G.Touch.release(c);
    this.taps = [];
    if (!this.autoOn) return;
    const p = G.Game.player, w = G.Game.world;
    if (!p || !w || !this.on()) { this.stop(); return; }
    if (!this.fieldOk()) { this.stop('🤖 사냥터가 아니라서 자동 사냥을 멈췄어요.'); return; }
    if (p.dead) { this.stop('🤖 쓰러져서 자동 사냥을 멈췄어요.', true); return; }
    if (this.bossMode) {   // 보스가 모두 쓰러지고 3초 지나도 다음 보스가 없으면 승리로 보고 끔 (2단계 보스는 기다림)
      const alive = w.monsters.filter(m => m.isBoss && !m.dead);
      if (alive.length) { this.bossGone = 0; this.bossNext = alive.some(m => m.d && m.d.next); }   // 2단계 보스(다음 보스가 나옴)면 더 기다림
      else if ((this.bossGone = (this.bossGone || 0) + dt) > (this.bossNext ? 12 : 3)) { this.bossNext = false; this.stop('🤖 보스를 물리쳤어요! 자동 전투를 마쳤어요.'); return; }
    }
    if (p.hp < p.st.maxHP * 0.3 && p.potionIdx('hp') < 0) { this.stop('🤖 HP 가 낮은데 HP 물약이 없어서 자동 사냥을 멈췄어요!', true); return; }
    if (this.paused() || this.userBusy()) { this.hold(new Set()); return; }
    this.drive(dt, p, w);
  },
  drive(dt, p, w) {
    const K = id => G.Touch.code(id), want = new Set();
    const py = p.onGround && p.plat ? p.plat.y : p.y;
    const wt = p.weaponTpl && p.weaponTpl(), ranged = wt && (wt.type === 'bow' || wt.type === 'wand');
    const reach = ranged ? 300 : 70;
    // 목표: 같은 층 먼저, 한 번에 올라갈 수 있는 위층, 아래층 (보스 · 쓰러진 몬스터 제외)
    let tgt = null, best = 1e9;
    const boss = this.bossMode, guards = boss ? w.monsters.filter(m => !m.dead && this.isGuard(m)) : [];
    for (const m of w.monsters) {
      if (m.dead || (!boss && m.isBoss)) continue;
      if (boss && guards.length && !this.isGuard(m)) continue;                    // 기믹(기둥 · 잔영 등)부터
      if (boss && m.isBoss && m.boss && m.boss.phaseInv > 0 && w.monsters.some(x => !x.dead && !x.isBoss && x !== m)) continue;   // 무적 중엔 다른 적
      if (!boss && !m.plat) continue;
      const my = m.plat ? m.plat.y : py, dy = py - my;
      const cost = Math.abs(dy) < 12 ? 0 : dy > 0 && dy <= 270 ? 420 : dy < 0 ? 320 : 1e9;
      const c = Math.abs(m.x - p.x) + cost;
      if (c < best) { best = c; tgt = m; }
    }
    const moveTo = x => { if (Math.abs(x - p.x) > 14) want.add(x > p.x ? 'ArrowRight' : 'ArrowLeft'); };
    if (!tgt || best >= 1e9) {
      // 몬스터가 없으면 맵을 천천히 돌며 기다림
      if (p.x < 100) this.patrol = 1; else if (p.x > w.map.width - 100) this.patrol = -1;
      want.add(this.patrol > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else {
      const tp = tgt.plat || { x: 0, y: py, w: w.map.width }, dy = py - tp.y;
      if (Math.abs(dy) < 12) {
        // 같은 층: 사거리 안으로 → 바라보기 → 스킬 · 공격
        const dx = tgt.x - p.x, dist = Math.abs(dx);
        if (dist > reach) moveTo(tgt.x - Math.sign(dx) * (reach - 20));
        else if (ranged && dist < 40) {   // 너무 붙으면 살짝 물러남 (벽 쪽으로는 물러나지 않음 → 벽에 붙어 못 싸우는 것 방지)
          const back = p.x - Math.sign(dx || 1) * 80;
          if (back > 90 && back < w.map.width - 90) moveTo(back);
        }
        const inv = tgt.isBoss && tgt.boss && tgt.boss.phaseInv > 0;   // 페이즈 전환 무적: 헛손질하지 않고 기다림
        if (dist <= reach + 30 && !inv) {
          // 반대쪽을 보고 있으면 공격을 멈추고(경직이 풀려야 돌아설 수 있음) 돌아선다
          if (Math.sign(dx) !== p.dir && Math.abs(dx) > 6) {
            want.delete('ArrowLeft'); want.delete('ArrowRight');   // 반대 방향 키와 겹치지 않게
            if (p.lock <= 0) want.add(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
          }
          else this.attack(p, want);
        }
      } else if (dy > 0) {
        // 위층: 발판 아래로 가서 점프 → 꼭대기에서 ↑ + 점프 (2단 점프 위로). 땅에서는 ↑ 를 누르지 않는다 (포탈 · NPC 방지)
        const cx = G.U.clamp(tgt.x, tp.x + 40, tp.x + tp.w - 40);
        if (p.onGround) {
          if (p.x > tp.x + 30 && p.x < tp.x + tp.w - 30) this.tap(K('jump')); else moveTo(cx);
        } else {
          moveTo(cx);
          if (p.vy > -120 && p.y > tp.y - 4 && !p.airDashed && p.d.skills.b_djump) { want.add('ArrowUp'); this.tap(K('jump')); }
          else if (!p.onGround && this.held.has('ArrowUp')) want.add('ArrowUp');
        }
      } else if (p.onGround && p.plat && !p.plat.ground) {
        // 아래층: ↓ + 점프로 내려가기
        want.add('ArrowDown'); this.tap(K('jump'));
      } else moveTo(tgt.x);
    }
    // 걸어가는데 1.5초 동안 그대로면 점프
    const moving = want.has('ArrowLeft') || want.has('ArrowRight');
    if (moving && Math.abs(p.x - this.lastX) < 1 && p.onGround) { this.stuckT += dt; if (this.stuckT > 1.5) { this.stuckT = 0; this.tap(K('jump')); this.patrol *= -1; } } else this.stuckT = 0;
    this.lastX = p.x;
    if (p.onGround) want.delete('ArrowUp');
    this.hold(want);
  },
  // ② 2차-1.3: 스킬 칸(1~6) 안에서 가장 효율적인 스킬 (예상 피해 = 배율 × 타수 × 지금 맞힐 수 있는 몬스터 수)
  //  궁극기(재사용 12초 이상)는 3마리 이상 맞거나 보스가 있을 때만 · MP 30% 아래면 MP 아끼기 · 같으면 앞 칸
  targets(p, w) { return w.monsters.filter(m => !m.dead && (this.bossMode || !m.isBoss)); },
  skillScore(p, sk, lv, w, list) {
    const a = sk.atk;
    if (!a) return { score: 0, n: 0 };
    const dir = p.dir, ahead = (m, far, near = -20) => { const dx = (m.x - p.x) * dir; return dx >= near && dx <= far; };
    // 몬스터 몸(발 ~ 머리) 이 내 공격 높이 띠와 겹치는지 (녹스처럼 키 큰 보스도)
    const sameY = (m, h = 70) => { const top = m.y - (m.h || 40), mid = p.y - 30; return m.y > mid - h && top < mid + h; };
    let n = 0, hits = a.hits || 1, mult = 1;
    switch (a.kind) {
      case 'melee': n = Math.min(a.targets || 1, list.filter(m => ahead(m, a.w + 20) && sameY(m, a.h)).length); break;
      case 'aoe': n = Math.min(a.targets || 1, list.filter(m => Math.abs(m.x - p.x) <= a.w / 2 + 10 && sameY(m, a.h)).length); break;
      case 'proj': { const c = list.filter(m => ahead(m, a.range) && sameY(m)).length; n = Math.min(c, a.pierce || 1); mult = c ? (a.count || 1) : 0; break; }
      case 'rain': {
        const reach = a.ahead + a.area / 2 + 60, inr = list.filter(m => ahead(m, reach, 0) && sameY(m, 160));
        n = inr.length ? 1 : 0;
        mult = inr.some(m => m.isBoss || m.d.kind === 'elite') ? a.count : a.count * Math.min(1, inr.length * 70 / a.area);
        break;
      }
      case 'dash': n = Math.min(a.targets || 1, list.filter(m => ahead(m, a.dist) && sameY(m)).length); break;
      case 'back': n = Math.min(a.pierce || 1, list.filter(m => ahead(m, a.range) && sameY(m)).length); break;
      default: n = 0;
    }
    return { score: a.pct(lv) / 100 * hits * n * mult, n };
  },
  attack(p, want) {
    const d = p.d, w = G.Game.world;
    // 기본 공격을 누르고 있으면 경직(lock)이 끝나는 순간 기본 공격이 먼저 나가서 스킬을 못 쓴다
    //  → 쓸 스킬이 있으면 기본 공격을 떼고, 경직이 끝나기 0.3초 전부터 스킬 키를 누른다 (게임의 선입력 0.35초)
    const ready = p.lock < 0.3 && this.gt - (this.skT || -9) > 0.35;
    if (!(p.silence > 0)) {
      const list = this.targets(p, w), boss = list.some(m => m.isBoss && Math.abs(m.x - p.x) < 600);
      const lowMp = p.mp < p.st.maxMP * 0.3;
      let best = null, bestS = 1.0001;   // 기본 공격 = 100% × 1마리
      for (let i = 0; i < 6; i++) {
        const id = d.hot[i], sk = id && G.SKILLS[id], lv = id ? d.skills[id] || 0 : 0;
        if (!sk || lv <= 0 || p.cd[id] > 0) continue;
        const mp = sk.mp ? sk.mp(lv) : 0;
        if (mp && p.mp < mp) continue;
        // 버프 · 회복은 바로 (꺼져 있을 때 · HP 60% 아래)
        if (sk.type === 'buff') { if (!p.buffs[id]) { if (ready) { this.skT = this.gt; this.lastSkill = id; this.tap(G.Touch.code('skill' + (i + 1))); } return; } continue; }
        if (sk.type === 'heal') { if (p.hp < p.st.maxHP * 0.6) { if (ready) { this.skT = this.gt; this.lastSkill = id; this.tap(G.Touch.code('skill' + (i + 1))); } return; } continue; }
        if (sk.type !== 'attack') continue;
        const r = this.skillScore(p, sk, lv, w, list);
        if (!r.n) continue;
        if ((sk.cd || 0) >= 12 && r.n < 3 && !boss) continue;   // 궁극기는 아껴 두기
        let sc = r.score;
        if (lowMp && mp) sc = sc / (1 + mp / Math.max(1, p.st.maxMP * 0.05));
        if (sc > bestS) { bestS = sc; best = i; }
      }
      if (best != null) { if (ready) { this.skT = this.gt; this.lastSkill = d.hot[best]; this.tap(G.Touch.code('skill' + (best + 1))); } return; }
    }
    this.lastSkill = 'basic';
    want.add(G.Touch.code('attack'));
  },

  // ① 2차-1.3: 자동 버튼 아이콘 A "별의 순환" (docs/drafts/icons/auto_btn_drafts.html) — 켜짐은 밝은 화살표
  // 원을 도는 화살표 (시안의 loop 그대로)
  loop(cx, cy, r, w, col, a0 = -60, a1 = 250) {
    const P = a => [cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r], f = v => v.toFixed(1);
    const [x0, y0] = P(a0), [x1, y1] = P(a1), ang = (a1 + 90) * Math.PI / 180;
    const pt = d => [x1 + Math.cos(ang + d) * w * (d ? 1.4 : 1.6), y1 + Math.sin(ang + d) * w * (d ? 1.4 : 1.6)];
    const tri = [pt(0), pt(2.4), pt(-2.4)].map(q => f(q[0]) + ',' + f(q[1])).join(' ');
    return `<path d="M${f(x0)} ${f(y0)} A${r} ${r} 0 1 1 ${f(x1)} ${f(y1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${tri}" fill="${col}"/>`;
  },
  icon(on, size = 20) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 10 : 24; pts.push((50 + Math.cos(a) * r).toFixed(1) + ',' + (52 + Math.sin(a) * r).toFixed(1)); }
    const col = on ? '#eafff0' : '#9fd8ff';
    return `<svg class="auto-ic" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="aig${on ? 1 : 0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c8"/><stop offset=".5" stop-color="#ffd36a"/><stop offset="1" stop-color="#ff9ac8"/></linearGradient></defs>
      ${this.loop(50, 50, 36, 8, col)}
      <polygon points="${pts.join(' ')}" fill="url(#aig${on ? 1 : 0})" stroke="#5a2a7a" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
  },

  // ---------- 화면 (🤖 버튼 · 자동 사냥 중 표시 · 알림) ----------
  buildUI() {
    const bar = document.querySelector('#touch .topbar');
    if (!bar || document.getElementById('tw-auto')) return;
    const b = document.createElement('div');
    b.className = 'tw'; b.id = 'tw-auto'; b.innerHTML = this.icon(false) + '<span>자동</span><span class="auto-n"></span>';
    b.addEventListener('pointerdown', e => { e.preventDefault(); this.toggleAuto(); });
    bar.appendChild(b);
    const st = document.createElement('div');
    st.id = 'auto-st'; st.innerHTML = this.icon(true, 16) + ' 자동 사냥 중 · 탭하면 멈춤';
    st.addEventListener('pointerdown', e => { e.preventDefault(); this.stop('자동 사냥을 멈췄어요.'); });
    document.querySelector('#touch .g-top').appendChild(st);
    const t = document.createElement('div'); t.id = 'play-toast'; document.body.appendChild(t);
  },
  ui() {
    const b = document.getElementById('tw-auto'), st = document.getElementById('auto-st');
    if (b) {
      b.classList.toggle('on', this.autoOn); b.classList.toggle('off', !this.autoOn && !this.fieldOk());
      const left = this.bossLeft(), n = b.querySelector('.auto-n');
      if (n) n.textContent = left > 0 && !this.autoOn ? left : '';
      if (b.dataset.on !== String(this.autoOn)) { b.dataset.on = String(this.autoOn); b.querySelector('svg').outerHTML = this.icon(this.autoOn); }
    }
    if (st) st.style.display = this.autoOn ? '' : 'none';
  },
  toast(msg) {
    const t = document.getElementById('play-toast');
    if (!t) return;
    t.innerHTML = G.U.esc(msg).replace(/^🤖/, this.icon(true, 16)); t.classList.add('on');
    clearTimeout(this.toastT); this.toastT = setTimeout(() => t.classList.remove('on'), 3200);
  },

  // ---------- 원래 함수 감싸기 (스크립트를 읽을 때: G.Mobile 보다 안쪽) ----------
  // G.Game 은 main.js(맨 마지막)에 있어서 load 때 감싼다 (G.Game.init 보다 먼저, G.Mobile 보다 안쪽)
  wrapGame() {
    const P = this;
    const frame = G.Game.frame;
    G.Game.frame = function (ts) {
      const dt = Math.min(0.05, (ts - this.last) / 1000 || 0);
      try { P.pre(dt); } catch (e) { G.ErrLog && G.ErrLog.add(e); P.autoOn = false; P.release(); }
      return frame.call(this, ts);
    };
    const cm = G.Game.changeMap;
    G.Game.changeMap = function () { if (P.autoOn) P.stop('🤖 맵을 옮겨서 자동 사냥을 멈췄어요.'); const r = cm.apply(this, arguments); setTimeout(() => P.ui(), 0); return r; };
  },
  wrap() {
    const P = this;
    // 진짜 사람이 누른 터치 버튼이면 2초 동안 직접 조작
    const tp = G.Touch.press;
    G.Touch.press = function () { if (!P.inAuto) P.userT = performance.now(); return tp.apply(this, arguments); };
    const hurt = G.Player.prototype.hurt, td = G.Player.prototype.trueDamage;
    G.Player.prototype.hurt = function (raw, fromX, opt) {   // 최대 HP 비율 공격(opt.pct)도 같은 배율
      const k = P.guardMul();
      if (k === 1) return hurt.apply(this, arguments);
      return hurt.call(this, raw * k, fromX, opt && opt.pct ? Object.assign({}, opt, { pct: opt.pct * k }) : opt);
    };
    G.Player.prototype.trueDamage = function (n, ...a) { const k = P.guardMul(); return td.call(this, k === 1 ? n : n * k, ...a); };
    const die = G.Player.prototype.die;
    G.Player.prototype.die = function () { const was = this.dead; const r = die.apply(this, arguments); if (!was && this.dead) { try { P.onDeath(this); } catch (e) { /* 기록만 실패 */ } setTimeout(() => P.ui(), 0); } return r; };
    const lu = G.Player.prototype.levelUp;
    G.Player.prototype.levelUp = function () { const r = lu.apply(this, arguments); try { P.afterLevel(this); } catch (e) { /* 안내만 실패 */ } return r; };
    const sr = G.Win.stat.render;
    G.Win.stat.render = function () { const h = sr.apply(this, arguments); if (!P.on()) return h; const i = h.indexOf('<div class="ap-box">'); return i < 0 ? P.statBox() + h : h.slice(0, i) + P.statBox() + h.slice(i); };
    const ir = G.Win.inv.render;
    G.Win.inv.render = function () {
      let h = ir.apply(this, arguments);
      if (!P.on() || this.tab !== 'equip' || G.UI.target) return h;
      const ups = P.upgrades();
      h = h.replace(/data-dbl="inv:equip:(\d+)"([^>]*)>/g, (m, i) => ups.has(+i) ? m + '<span class="upb">▲</span>' : m);
      return `<div class="row" style="margin-bottom:6px"><button class="btn sm gold" data-play="best">⭐ 최고 장비 입기</button><span class="dim" style="font-size:11px">▲ = 지금보다 좋아요</span></div>` + h;
    };
    const tb = G.Tip.build;
    G.Tip.build = function (ref) {
      const h = tb.apply(this, arguments);
      if (!h || !P.on() || !/^inv:equip:\d+$/.test(ref)) return h;
      try { return h + P.compare(+ref.split(':')[2]); } catch (e) { return h; }
    };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-play]');
      if (!b || b.disabled) return;
      const a = b.dataset.play;
      if (a === 'statall') this.statAll();
      if (a === 'jobintro') this.jobIntro();
      if (a === 'best') this.bestEquip();
    });
  },
};
G.Play.wrap();
window.addEventListener('load', () => { G.Play.wrapGame(); setTimeout(() => { G.Play.buildUI(); G.Play.ui(); }, 50); });
