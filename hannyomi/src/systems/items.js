'use strict';
// 장비 생성(랜덤 옵션), 별빛 각인서·공명석·단련, 인벤토리
G.Items = {
  tpl: id => G.ITEMS[id],

  // 장비면 옵션을 굴린 인스턴스, 아니면 {tid, qty}
  create(tid, opts = {}) {
    const t = G.ITEMS[tid];
    if (t.cat !== 'equip') return { tid, qty: opts.qty || 1 };
    const it = { uid: G.U.uid(), tid, grade: 0, add: [], pot: [], up: 0, sfx: [] };
    if (opts.plain) return it;            // 상점/퀘스트 보상: 옵션 없음
    it.add = this.rollAdd(t, opts.boss);
    it.grade = G.U.weighted(opts.boss ? G.DROP_GRADE.boss : G.DROP_GRADE.normal);
    if (it.grade > 0) it.pot = this.rollPot(t, it.grade);
    return it;
  },

  rollAdd(t, boss) {
    let lines = G.U.weighted(G.ADD_LINES);
    if (boss) lines = Math.min(4, lines + 1);
    const pool = G.ADD_OPTS.filter(o => !(o.noWeapon && t.slot === 'weapon'));
    const used = new Set(), out = [];
    for (let i = 0; i < lines; i++) {
      const cand = pool.filter(o => !used.has(o.stat));
      if (!cand.length) break;
      const o = G.U.weighted(cand.map(o => [o, t.slot === 'weapon' && o.wWeapon ? o.wWeapon : (o.w || 1)]));
      used.add(o.stat);
      let stage = G.U.weighted(G.ADD_STAGE);
      if (boss) stage = Math.min(5, stage + 1);
      out.push({ stat: o.stat, val: o.v(t.lv) * stage, stage });
    }
    return out;
  },

  potPool(t, g) {
    return G.POT_OPTS[g].filter(o => !(o.only === 'weapon' && t.slot !== 'weapon') && !(o.noWeapon && t.slot === 'weapon'));
  },
  rollPot(t, grade) {
    const lines = [];
    for (let i = 0; i < 3; i++) {
      const g = (i === 0 || Math.random() < G.POT_LINE_SAME[i]) ? grade : Math.max(1, grade - 1);
      const o = G.U.weighted(this.potPool(t, g).map(o => [o, o.w || 1]));
      lines.push({ stat: o.stat, val: o.v(t.lv), g });
    }
    return lines;
  },

  // 장비 하나가 주는 스탯 합계 (기본 + 추가 + 잠재 + 강화 + 능력치형 특수 효과)
  stats(it) {
    const t = G.ITEMS[it.tid], s = {};
    const add = (k, v) => { s[k] = (s[k] || 0) + v; };
    for (const k in t.base) add(k, t.base[k]);
    for (const o of it.add || []) add(o.stat, o.val);
    for (const o of it.pot || []) add(o.stat, o.val);
    const up = G.UPGRADE[t.slot];
    if (it.up && up) for (const k in up.per) add(k, Math.round(up.per[k] * it.up));
    for (const f of it.sfx || []) {
      const def = G.SFX[f.id];
      if (def.stat) { const o = def.stat(f.v, f.p); for (const k in o) add(k, o[k]); }
    }
    return s;
  },

  // ---------- 별빛 각인서 강화 ----------
  maxSlots(t) { return (G.UPGRADE[t.slot] || { slots: 0 }).slots; },
  slotsLeft(it) { return it.slots != null ? it.slots : this.maxSlots(G.ITEMS[it.tid]); },
  // 특수 효과 하나를 굴린다. q: 품질 (0~1, 높을수록 범위 위쪽)
  rollSfx(q) {
    const id = G.U.pick(Object.keys(G.SFX)), def = G.SFX[id];
    const roll = (r, step) => {
      if (!r) return null;
      const k = q + Math.random() * (1 - q), v = r[0] + (r[1] - r[0]) * k;
      return step ? Math.round(v / step) * step : Math.round(v);
    };
    const f = { id, p: roll(def.p), v: roll(def.v, def.step) };
    if (def.step) f.v = +f.v.toFixed(1);
    return f;
  },
  sfxText(f) { const d = G.SFX[f.id]; return `[${d.name}] ${d.text(f.p, f.v)}`; },
  // 다음에 채울 칸 단계 (1부터)
  engraveStage(it) { return this.maxSlots(G.ITEMS[it.tid]) - this.slotsLeft(it) + 1; },
  engraveRate(it) { return G.ENGRAVE.rate[Math.min(6, this.engraveStage(it) - 1)]; },
  useScroll(it) {
    const t = G.ITEMS[it.tid], E = G.ENGRAVE;
    const left = this.slotsLeft(it);
    if (left <= 0) return { blocked: true };
    const st = Math.min(6, this.engraveStage(it) - 1), rate = E.rate[st];
    const ok = Math.random() < rate;
    const r = { ok, inc: 0, fx: null, replaced: null, name: t.name, stage: st + 1, rate };
    if (!ok) return r;   // 실패: 칸은 그대로
    it.slots = left - 1;
    it.up = (it.up || 0) + 1; r.inc = 1;
    if (Math.random() < E.fx[st]) {
      it.sfx = it.sfx || [];
      const f = this.rollSfx(E.q[st]);
      if (it.sfx.length >= 2) { const i = G.U.randi(0, 1); r.replaced = it.sfx[i]; it.sfx[i] = f; }
      else it.sfx.push(f);
      r.fx = f;
    }
    return r;
  },
  displayName(it) {
    const t = G.ITEMS[it.tid];
    return it.up ? `${t.name} +${it.up}` : t.name;
  },

  // ---------- 공명석: 별자리 각인 ----------
  // 각인이 없는 장비는 "반짝임"으로 깨어난다 (모든 줄 새로)
  awaken(it) {
    it.grade = 1; it.res = 0;
    it.pot = this.rollPot(G.ITEMS[it.tid], 1);
  },
  resNeed(it) { return G.RESONANCE[it.grade] || 0; },
  // i 번째 줄만 다시 새긴다. 공명 게이지 +1, 가득 차면 등급 상승 (모든 줄 새로)
  resonate(it, i) {
    const t = G.ITEMS[it.tid], before = it.pot[i];
    const g = before ? before.g : it.grade;
    const o = G.U.weighted(this.potPool(t, g).map(o => [o, o.w || 1]));
    it.pot[i] = { stat: o.stat, val: o.v(t.lv), g };
    it.res = (it.res || 0) + 1;
    const need = this.resNeed(it);
    if (need && it.res >= need && it.grade < 4) {
      const from = it.grade;
      it.grade++; it.res = 0;
      it.pot = this.rollPot(t, it.grade);
      return { line: i, before, after: it.pot[i], up: true, from };
    }
    return { line: i, before, after: it.pot[i], up: false };
  },
  // ---------- 대장장이 단련 (옛 추가 옵션 재설정) ----------
  temperCost(it) { return G.ITEMS[it.tid].lv * 60 + 500; },
  temper(it) { it.add = this.rollAdd(G.ITEMS[it.tid], false); },

  canEquip(p, t) {
    if (t.cat !== 'equip') return '장비가 아닙니다.';
    if (p.d.level < t.lv) return `레벨 ${t.lv} 이상 착용 가능`;
    if (t.job !== 'any' && t.job !== G.familyOf(p.d.job)) return `${G.JOBS[t.job].name} 계열 전용`;
    return null;
  },
  sellPrice(it) {
    const t = G.ITEMS[it.tid];
    if (t.quest || !t.price) return 0;
    return Math.floor(t.price * 0.3 * (1 + (it.grade || 0) * 0.5));
  },
  gradeOf: it => G.GRADES[it.grade || 0],
};

// ---------------- 인벤토리 ----------------
G.Inv = {
  SIZE: 32,
  TABS: { equip: '장비', use: '소비', etc: '기타' },
  empty() { return { equip: Array(32).fill(null), use: Array(32).fill(null), etc: Array(32).fill(null) }; },
  tabOf: tid => G.ITEMS[tid].cat,

  // item: 장비 인스턴스 / 또는 tid 문자열 + qty. 성공하면 true
  add(p, item, qty = 1) {
    if (typeof item === 'string') item = G.Items.create(item, { qty, plain: true });
    const t = G.ITEMS[item.tid], arr = p.d.inv[t.cat];
    if (t.cat === 'equip') {
      const i = arr.indexOf(null);
      if (i < 0) return false;
      arr[i] = item; return true;
    }
    let left = item.qty;
    for (const s of arr) {
      if (s && s.tid === item.tid && s.qty < t.stack) {
        const n = Math.min(left, t.stack - s.qty); s.qty += n; left -= n;
        if (!left) return true;
      }
    }
    while (left > 0) {
      const i = arr.indexOf(null);
      if (i < 0) { item.qty = left; return false; }
      const n = Math.min(left, t.stack);
      arr[i] = { tid: item.tid, qty: n }; left -= n;
    }
    return true;
  },
  hasSpace(p, tid) {
    const t = G.ITEMS[tid], arr = p.d.inv[t.cat];
    if (arr.includes(null)) return true;
    return t.cat !== 'equip' && arr.some(s => s && s.tid === tid && s.qty < t.stack);
  },
  count(p, tid) {
    const arr = p.d.inv[G.ITEMS[tid].cat];
    return arr.reduce((n, s) => n + (s && s.tid === tid ? (s.qty || 1) : 0), 0);
  },
  remove(p, tid, qty) {
    const arr = p.d.inv[G.ITEMS[tid].cat];
    for (let i = 0; i < arr.length && qty > 0; i++) {
      const s = arr[i];
      if (!s || s.tid !== tid) continue;
      if (G.ITEMS[tid].cat === 'equip') { arr[i] = null; qty--; continue; }
      const n = Math.min(qty, s.qty); s.qty -= n; qty -= n;
      if (s.qty <= 0) arr[i] = null;
    }
  },
};
