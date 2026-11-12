'use strict';
// ============================================================
// 빌드 1 (8번): 각성마다 기술 포인트(SP) 딱 맞추기 (docs/BUILD_MOBILE_PLAN.md "8번 계획서")
//  - 각성 Ⅰ Lv10~29 레벨당 5 (=100) · Ⅱ Lv30~59 레벨당 4 (=120) · Ⅲ Lv60~84 레벨당 4 + 각성 때 20 (=120) · Ⅳ Lv85~100 레벨당 6 + 각성 때 4 (=100)
//  - 그 레벨 구간에서 받은 SP 는 그 각성 스킬에만 씀. 남은 SP 는 다음 각성으로 안 넘어감
//  - 세이브 형식 그대로: 각성별 남은 SP = 그 구간에서 받은 SP − 그 각성 스킬에 올린 SP (d.sp 는 지금 각성 몫을 넣어 둠, 화면 표시용)
//  - 지금 각성 스킬을 모두 마스터해야 다음 각성 퀘스트를 받을 수 있음
// ============================================================
G.SP = {
  TIER: [null, { from: 10, to: 29, per: 5, bonus: 0 }, { from: 30, to: 59, per: 4, bonus: 0 }, { from: 60, to: 84, per: 4, bonus: 20 }, { from: 85, to: 100, per: 6, bonus: 4 }],
  tierOf(job) { return (G.JOBS[job] && G.JOBS[job].tier) || 0; },
  jobAt(d, t) { return G.jobChain(d.job).find(j => this.tierOf(j) === t) || null; },
  // t 각성 구간에서 지금까지 받은 SP (각성 보너스는 그 각성을 했을 때)
  earned(d, t) {
    const T = this.TIER[t]; if (!T) return 0;
    const lv = Math.min(d.level, T.to), n = Math.max(0, lv - T.from + 1);
    return n * T.per + (this.tierOf(d.job) >= t ? T.bonus : 0);
  },
  skills(job) { return job ? G.skillsOfJob(job).filter(s => !s.fixed) : []; },
  spent(d, t) { return this.skills(this.jobAt(d, t)).reduce((n, s) => n + (d.skills[s.id] || 0), 0); },
  need(d, t) { return this.skills(this.jobAt(d, t)).reduce((n, s) => n + s.maxLv, 0); },
  left(d, t) { return Math.max(0, this.earned(d, t) - this.spent(d, t)); },
  mastered(d, t) { const job = this.jobAt(d, t); return !!job && this.skills(job).every(s => (d.skills[s.id] || 0) >= s.maxLv); },
  masterCount(d, t) { const sk = this.skills(this.jobAt(d, t)); return [sk.filter(s => (d.skills[s.id] || 0) >= s.maxLv).length, sk.length]; },
  // 화면 표시용 d.sp = 지금 각성 몫
  sync(d) { const t = this.tierOf(d.job); d.sp = t ? this.left(d, t) : 0; },
  // 다음 각성 퀘스트가 마스터 때문에만 막혔는지 (막혔으면 아직 못 올린 스킬 이름들)
  blockedBy(p, q) {
    if (!q.job || !q.act || !q.act.job) return null;
    const t = this.tierOf(q.act.job) - 1; if (t < 1) return null;
    if (this.mastered(p.d, t)) return null;
    return this.skills(this.jobAt(p.d, t)).filter(s => (p.d.skills[s.id] || 0) < s.maxLv).map(s => s.name);
  },
};
