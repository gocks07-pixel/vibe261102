'use strict';
// 데미지 계산 + 타격 연출
G.Combat = {
  // 플레이어 → 몬스터. pct: 스킬 배율(%), idx: 다단히트 순번 (데미지 숫자 높이), color: 타격 섬광 색
  hit(p, m, pct, idx = 0, color = '#ffe0a0') {
    if (m.dead) return 0;
    const B = m.boss;
    if (B && B.phaseInv > 0) {   // 2.1 페이즈 전환 무적
      if (!(B.invTextT > 0) || B.invTextT < Date.now()) { B.invTextT = Date.now() + 600; G.FX.text(m.x, m.y - m.h - 20, '무적', '#bfe6ff', 16, 0.6); }
      return 0;
    }
    if (B) { const w = G.Game.world; if (B.weakOn) B.weakHit(w); if (B.smokeReal > 0 || B.cloneHint) B.revealReal(w); }   // 2.1 기믹
    const s = p.st;
    let dmg = G.U.rand(s.minDmg, s.maxDmg) * pct / 100;
    dmg *= 1 + (s.dmgp + (m.isBoss ? s.bossDmg : 0)) / 100;
    dmg *= 1 - Math.max(0, m.defense * (1 - s.ignoreDef / 100));
    dmg *= G.F.dmgPenalty(p.d.level, m.lv);
    if (m.guard) dmg *= 1 - m.guard;
    if (m.vuln > 0) dmg *= m.vulnMul || 2;
    if (m.isBoss && p.d.level < m.lv) dmg *= 1.3;
    if (m.isBoss && G.familyOf(p.d.job) === 'mage') dmg *= 2.3;   // 2.1 마법사 보스 보정 (EXE 빌드: 2.2 → 2.3) (넓게 흩어지는 마법이 보스 하나에는 덜 맞는 만큼)   // 2.1 용기의 가호: 보스보다 레벨이 낮으면 +30%
    if (m.markUntil > Date.now()) dmg *= 1 + (m.markMul || 0.2);   // 1.7.11 표식 (급소 찌르기 등)
    const crit = Math.random() * 100 < s.crit;
    if (crit) dmg *= 1 + s.critDmg / 100;
    dmg = Math.max(1, Math.round(dmg));
    m.takeDamage(dmg, p);
    const cx = m.x + G.U.rand(-m.w * 0.2, m.w * 0.2), cy = m.y - m.h * 0.55 + G.U.rand(-8, 8);
    G.FX.dmg(m.x, m.y - m.h - 8 - idx * 26, dmg, crit ? 'crit' : 'hit');
    G.FX.spark(cx, cy, color, crit || pct >= 180);
    if (crit) {
      G.FX.stars(cx, cy, 7);
      if (G.Settings.fx === 'high') G.Game.world.shake(3);
    }
    G.Game.hitstop = Math.max(G.Game.hitstop, crit ? 0.06 : 0.03);
    G.Sound.hit(color, crit);   // 1.8 속성별 타격음 (몰리면 줄임)
    if (s.poison && !m.dead && Math.random() * 100 < s.poison) {
      m.poison = { dps: s.maxDmg * 0.3, left: 4, tick: 1 };
      G.FX.burst(cx, cy, '#a8f060', 8, 140);
    }
    this.onHitEffects(p, m);
    return dmg;
  },

  // 장비 특수 효과 (공격 시)
  onHitEffects(p, m) {
    const F = id => p.st.fx(id), roll = f => f && Math.random() * 100 < f.p;
    let f;
    if (!m.dead) {
      if (roll(f = F('stun'))) m.applyStatus('stun', f.v);
      if (roll(f = F('freeze'))) m.applyStatus('freeze', f.v);
      if (roll(f = F('poison'))) { m.poison = { dps: p.st.maxDmg * f.v / 100, left: 4, tick: 1 }; G.FX.text(m.x, m.y - m.h - 24, '중독', '#a8f060', 13, 0.8); }
      if (roll(f = F('dark'))) m.applyStatus('dark', 5, m.isBoss ? 15 : f.v);
      if (roll(f = F('slow'))) m.applyStatus('slow', 4, m.isBoss ? 20 : f.v);
      if (roll(f = F('seal'))) m.applyStatus('seal', f.v);
    }
    if (p.fxCd > 0) return;   // 회복 효과는 0.3초에 한 번까지 (다단 히트 남용 방지)
    if (roll(f = F('hpOnHit'))) { p.heal(Math.round(p.st.maxHP * f.v / 100)); p.fxCd = 0.3; }
    if (roll(f = F('mpOnHit'))) { p.healMp(Math.round(p.st.maxMP * f.v / 100)); p.fxCd = 0.3; }
    if (!m.stolen && roll(f = F('steal'))) {
      m.stolen = true;
      G.Game.world.drops.push(new G.Drop(m.x, m.y - m.h / 2, { gold: G.F.gold(m.lv) }));
      G.FX.text(m.x, m.y - m.h - 40, '오토스틸!', '#ffd54a', 13, 0.8);
    }
  },
  // 처치 시 효과
  onKillEffects(p) {
    const F = id => p.st.fx(id), roll = f => f && Math.random() * 100 < f.p;
    let f;
    if (roll(f = F('hpOnKill'))) p.heal(Math.round(p.st.maxHP * f.v / 100));
    if (roll(f = F('mpOnKill'))) p.healMp(Math.round(p.st.maxMP * f.v / 100));
  },
};
