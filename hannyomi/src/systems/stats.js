'use strict';
// 최종 능력치 계산 (AP + 장비 + 세트 + 패시브 + 버프)
G.Stats = {
  calc(p) {
    const d = p.d, job = G.JOBS[d.job], L = d.level;
    const t = {};
    const add = o => { for (const k in o) t[k] = (t[k] || 0) + o[k]; };

    const setCount = {}, sfx = {};
    for (const slot of G.EQUIP_SLOTS) {
      const it = d.eq[slot];
      if (!it) continue;
      add(G.Items.stats(it));
      // 특수 효과: 같은 효과는 확률 합산(최대 60%), 수치는 큰 쪽
      for (const f of it.sfx || []) {
        const a = sfx[f.id] || (sfx[f.id] = { p: 0, v: 0 });
        a.p = Math.min(60, a.p + (f.p || 0)); a.v = Math.max(a.v, f.v || 0);
      }
      const tp = G.ITEMS[it.tid];
      if (tp.set) setCount[tp.set] = (setCount[tp.set] || 0) + 1;
    }
    for (const sid in setCount) {
      const set = G.SETS[sid];
      for (const n in set.bonus) {
        if (setCount[sid] < +n) continue;
        const { sfx: bf, label, ...rest } = set.bonus[n];   // 1.5: 세트 효과에 특수 효과(빙결 등)도 붙을 수 있다
        add(rest);
        if (bf) { const a = sfx[bf.id] || (sfx[bf.id] = { p: 0, v: 0 }); a.p = Math.min(60, a.p + (bf.p || 0)); a.v = Math.max(a.v, bf.v || 0); }
      }
    }
    for (const sid in d.skills) {
      const sk = G.SKILLS[sid];
      if (sk && sk.type === 'passive' && d.skills[sid] > 0) add(sk.passive(d.skills[sid]));
    }
    for (const id in p.buffs) add(p.buffs[id].stats);

    const g = k => t[k] || 0;
    const s = { raw: t, setCount, sfx };
    for (const k of G.STATS4) {
      const base = d.base[k] + g(k) + g('allStat') + (k === job.main ? g('mainStat') : 0);
      s[k] = Math.floor(base * (1 + (g(k + 'p') + g('allStatp')) / 100));
      s[k + 'bonus'] = s[k] - d.base[k];
    }
    s.atk = Math.floor((2 + g('atk')) * (1 + g('atkp') / 100));
    s.main = s[job.main]; s.sub = s[job.sub];
    s.statPower = s.main * 4 + s.sub;
    s.maxDmg = Math.max(1, s.statPower * s.atk / 100);
    s.minDmg = s.maxDmg * 0.85;
    const pre = Math.min(L - 1, 9), post = Math.max(0, L - 10);
    s.maxHP = Math.floor((50 + 12 * pre + job.hpLv * post + g('HP')) * (1 + g('HPp') / 100));
    s.maxMP = Math.floor((30 + 6 * pre + job.mpLv * post + (G.familyOf(d.job) === 'mage' ? s.INT * 0.5 : 0) + g('MP')) * (1 + g('MPp') / 100));
    s.def = g('def');
    s.crit = Math.min(100, job.crit + g('crit'));
    s.critDmg = 50 + g('critDmg');
    s.bossDmg = g('bossDmg');
    s.ignoreDef = Math.min(90, g('ignoreDef'));
    s.dmgp = g('dmgp');
    s.manaShield = g('manaShield');
    s.poison = g('poison');
    s.mpRegen = g('mpRegen');
    s.aspd = Math.min(50, g('aspd'));
    s.mspd = Math.min(40, g('mspd'));
    s.fx = id => sfx[id] || null;
    return s;
  },
};
