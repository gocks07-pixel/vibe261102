'use strict';
// 보스 AI: 쿨타임 + 가중치 랜덤으로 패턴을 고르고, 예고(warn) 후 실행한다
// phases 가 있으면 체력 구간마다 쓰는 패턴이 바뀐다 (최종 보스)
G.BossAI = class {
  constructor(m) {
    this.m = m; this.data = G.BOSSES[m.d.ai];
    this.cool = {}; this.next = 2; this.cur = null; this.last = null;
    this.guarding = false; this.raise = 0; this.time = 0; this.phase = 0; this.enraged = false; this.assist = {};
    this.pending = null;   // 1.7.2: 정해진 때에 반드시 쓰는 패턴 {id, at, sky}
    this.hist = [];        // 2.1: 최근에 쓴 패턴 2개 (연달아 같은 패턴 금지)
    this.phaseInv = 0;     // 2.1: 페이즈 전환 무적 (초)
    this.weakOn = false; this.weakHits = 0; this.weakT = 0;   // 2.1 쉘로크 약점
    this.smokeReal = 0; this.cloneHint = false;                // 2.1 바르크 연막 · 카이엔 분신
  }
  // 2.1: 기믹 성공 → 6초 동안 받는 피해 ×1.75 ("약점 노출!")
  expose(w, sec = 6, text = '약점 노출!') {
    const m = this.m; m.vuln = Math.max(m.vuln || 0, sec); m.vulnMul = 1.75;
    G.FX.text(m.x, m.y - m.h - 40, text, '#ffe680', 22, 1.4); G.FX.burst(m.x, m.y - m.h / 2, '#ffe680', 24, 300);
    G.Sound.play('buff', { s: 0.9 });
  }
  // 2.1 쉘로크: 껍데기 숨기 중 약점 타격 (여러 번 때리는 스킬은 0.3초에 한 번만 셈)
  weakHit(w) {
    if (!this.weakOn || this.weakT > 0) return;
    this.weakT = 0.3; this.weakHits++;
    const m = this.m;
    G.FX.text(m.x - m.dir * 20, m.y - m.h - 10, `약점 ${this.weakHits}/3`, '#ffe680', 16, 0.7);
    if (this.weakHits >= 3) {
      this.weakOn = false; this.guarding = false; m.guard = 0; if (this.cur && this.cur.pt.type === 'guard') this.cur.t = 999;
      m.groggy = 4; this.expose(w, 6, '뒤집혔다! 약점 노출!'); w.shout(`${m.d.name}이(가) 뒤집혔다! (4초 그로기)`); w.shake(8);
    }
  }
  // 2.1 바르크 연막 · 카이엔 분신: 진짜를 때리면 가짜가 사라지고 그로기
  revealReal(w) {
    const m = this.m;
    if (this.smokeReal > 0) { this.smokeReal = 0; w.smoke = null; }
    this.cloneHint = false;
    for (const x of w.monsters) if (!x.dead && (x.d.decoy || x.d.clone)) { G.FX.burst(x.x, x.y - 40, '#888', 16, 200); x.die(w); }
    m.groggy = 3; this.cur = null; this.expose(w, 6, '진짜를 찾았다! 약점 노출!'); w.shout(`진짜 ${m.d.name}을(를) 찾아냈다! (3초 그로기)`);
  }
  patternList() {
    const d = this.data;
    if (!d.phases) return d.patterns;
    const ids = d.phases[this.phase].patterns;
    return d.patterns.filter(p => ids.includes(p.id));
  }
  checkPhase(w) {
    const d = this.data, m = this.m, r = m.hp / m.maxHp;
    if (d.phases) {
      let ph = 0;
      d.phases.forEach((p, i) => { if (r <= p.hp) ph = i; });
      if (ph > this.phase) {
        this.phase = ph;
        const p = d.phases[ph];
        G.UI.banner(`${ph + 1}페이즈 · ${p.name}`, p.shout);
        this.phaseInv = 3.5; this.weakOn = false;   // 2.1 전환 연출 동안 무적
        G.Audio.play('boss'); w.shake(10);
        if (m.d.kind === 'final' && !this.enraged) G.Music.noxPhase(ph);
        G.FX.shock(m.x, m.y - m.h / 2, 300, '#c060ff');
        if (this.cur) this.cleanup(w);   // 빌드 10: 하던 패턴이 남긴 안전지대 · 장판 · 방어 상태 정리 (파라칸 태양의 심판 중 전환 때 안전지대가 남던 버그)
        this.cur = null; this.next = 2.2; m.warnT = 0;
        if (p.start) { this.pending = { id: p.start, at: this.time + 1.2 }; this.next = 99; }   // 1.7.2: 아우렐리온 천공 비상
        if (ph === 2 && d.assist && !this.assist.heal) {
          this.assist.heal = true;
          G.Assist.elma(w);   // 2.0: 엘마가 직접 나타나 회복 (컷인 + 등장)
        }
        // 1.7.2: 6장에서 풀려난 아우렐리온이 녹스 3단계에 한 번 돕는다 (사슬 한 번 더 → 기둥 1개를 별빛 숨결로 부숨)
        if (ph === 2 && d.assist && !this.assist.sky && G.Quest.isDone('c6_07')) {
          this.assist.sky = true; this.pending = { id: 'chain', at: this.time + 3.4, sky: true }; this.next = 99;
        }
      }
    }
    if (d.assist && !this.assist.bind && r <= 0.15) {
      this.assist.bind = true;
      this.cur = null; this.cleanup(w);
      G.Assist.kaien(w, m);   // 2.0: 카이엔이 달려와 사슬로 결박 (컷인 + 등장, 달려오는 0.7초 + 결박 3초)
    }
    if (d.enrage && !this.enraged && this.time >= d.enrage) {
      this.enraged = true; m.atk *= 2;
      G.UI.banner('광폭화!', '제한 시간 초과: 공격력 2배, 패턴 속도 1.5배');
      if (m.d.kind === 'final') G.Music.noxPhase(3);
      G.Audio.play('boss');
    }
  }
  // 강제로 패턴이 끊길 때 남은 상태 정리
  cleanup(w) {
    const m = this.m;
    this.guarding = false; m.guard = 0;
    w.zone = null; w.pull = null; w.doom = null; w.half = null; m.soar = false; w.sweep = null; w.brand = null; this.weakOn = false;
    for (const x of w.monsters) if (x.d.kind === 'minion' && x.d.chainPillar && !x.dead) x.die(w);
  }

  update(dt, w) {
    const m = this.m, p = w.player, sp = this.enraged ? 1.5 : 1;
    this.time += dt;
    if (this.phaseInv > 0) this.phaseInv -= dt;
    if (this.weakT > 0) this.weakT -= dt;
    if (this.smokeReal > 0) this.smokeReal -= dt;
    if (this.cloneHint && !w.monsters.some(x => !x.dead && x.d.clone)) this.cloneHint = false;
    for (const k in this.cool) this.cool[k] -= dt * sp;
    m.moving = false;
    this.checkPhase(w);
    if (this.cur) {
      this.cur.t += dt * sp;
      if (this.step(this.cur, dt * sp, w)) { this.cur = null; this.raise = 0; this.next = G.U.rand(...this.data.gap) / sp * (1 - 0.08 * Math.min(3, this.phase)); }   // 2.1 페이즈마다 패턴 간격 짧아짐
      return;
    }
    if (p.dead) return;
    if (this.pending && this.time >= this.pending.at) {
      const pd = this.pending, pt = this.data.patterns.find(x => x.id === pd.id);
      this.pending = null;
      if (pt) { this.start(pt, w); this.cur.sky = !!pd.sky; if (pd.sky) w.shout('녹스: 사슬이여, 다시 나를 감싸라!'); return; }
    }
    const dx = p.x - m.x;
    if (Math.abs(dx) > 10) m.dir = Math.sign(dx);
    if (Math.abs(dx) > 120) { m.x += m.dir * this.data.speed * m.speedMul() * dt; m.moving = true; }
    m.x = G.U.clamp(m.x, m.minX, m.maxX);
    this.next -= dt;
    if (this.next <= 0) this.choose(w);
  }
  choose(w) {
    const minions = w.monsters.filter(x => !x.dead && x.d.kind === 'minion').length;
    const ok = pt => !(this.cool[pt.id] > 0) && !(pt.type === 'summon' && minions >= pt.max);
    let cand = this.patternList().filter(pt => ok(pt) && !this.hist.includes(pt.id));   // 2.1: 최근 2개 제외
    if (!cand.length) cand = this.patternList().filter(pt => ok(pt) && pt.id !== this.last);
    if (!cand.length) { this.next = 0.4; return; }
    this.start(G.U.weighted(cand.map(c => [c, c.weight || 1])), w);
  }
  start(pt, w) {
    this.cur = { pt, t: 0 }; this.last = pt.id; this.cool[pt.id] = pt.cd;
    this.hist.push(pt.id); if (this.hist.length > 2) this.hist.shift();
    G.Sound.near(G.Sound.BOSS[pt.type] || 'bWarn', this.m.x, { vol: 0.8 });   // 1.8 보스 패턴 소리
    if (pt.shout) w.shout(pt.shout);
    this.m.warnT = pt.warn || 0.6;
  }

  step(c, dt, w) {
    const m = this.m, pt = c.pt, p = w.player, src = { src: m };
    const hit = (pct, ex) => p.hurt(0, m.x, Object.assign({ pct }, src, ex || {}));
    switch (pt.type) {
      case 'melee': {
        if (!c.rect) {
          m.dir = Math.sign(p.x - m.x) || m.dir;
          const x0 = m.dir > 0 ? m.x - 20 : m.x - pt.w + 20;
          c.rect = { x: x0, y: m.y - pt.h, w: pt.w, h: pt.h };
          w.telegraph(c.rect, pt.warn);
        }
        this.raise = Math.min(1, c.t / pt.warn);
        if (c.t >= pt.warn && !c.hit) {
          c.hit = true; this.raise = 0;
          if (G.U.overlap(c.rect, p.box)) hit(pt.dmg);
          G.FX.slam(c.rect); w.shake(7);
        }
        return c.t >= pt.warn + 0.35;
      }
      case 'nova': {    // 1.7.2 별의 포효: 보스 둘레 넓은 범위 → 충격파
        if (!c.rect) { c.rect = { x: m.x - pt.w / 2, y: m.y - pt.h, w: pt.w, h: pt.h }; w.telegraph(c.rect, pt.warn); }
        this.raise = Math.min(1, c.t / pt.warn);
        if (c.t >= pt.warn && !c.hit) {
          c.hit = true; this.raise = 0;
          if (G.U.overlap(c.rect, p.box)) { hit(pt.dmg); p.kbX = Math.sign(p.x - m.x || 1) * 520; }
          G.FX.shock(m.x, m.y - 30, pt.w * 0.6, pt.color || '#c890ff'); G.FX.ring(m.x, m.y - 60, pt.w / 2, pt.color2 || '#fff0b0', 0.6); w.shake(9);
        }
        return c.t >= pt.warn + 0.4;
      }
      case 'guard': {
        if (!c.init) { c.init = true; this.guarding = true; m.guard = pt.reduce; if (pt.weak) { this.weakOn = true; this.weakHits = 0; } }
        if (c.t >= pt.dur) { this.guarding = false; m.guard = 0; this.weakOn = false; return true; }
        return false;
      }
      case 'shots': {
        if (c.t >= pt.warn && !c.fired) {
          c.fired = true; m.atkAnim = 0;
          const sx = m.x + m.dir * m.w * 0.3, sy = m.y - m.h * 0.55;
          const base = Math.atan2((p.y - 32) - sy, p.x - sx);
          for (let i = 0; i < pt.count; i++) {
            const a = base + (i - (pt.count - 1) / 2) * pt.spread;
            w.projectiles.push(new G.Projectile({
              x: sx, y: sy, vx: Math.cos(a) * pt.speed, vy: Math.sin(a) * pt.speed, owner: 'enemy', kind: pt.proj,
              r: pt.proj === 'bubble' ? 13 : 8, range: 1400, life: 5,
              hurt: { pct: pt.dmg, slow: pt.slow, poison: pt.poison, src: m },
            }));
          }
        }
        return c.t >= pt.warn + 0.3;
      }
      case 'dash': {
        if (!c.init) {
          c.init = true;
          m.dir = Math.sign(p.x - m.x) || m.dir;
          c.target = m.dir > 0 ? m.maxX : m.minX;
          const x0 = Math.min(m.x, c.target) - m.w / 2, x1 = Math.max(m.x, c.target) + m.w / 2;
          w.telegraph({ x: x0, y: m.y - m.h, w: x1 - x0, h: m.h }, pt.warn);
        }
        if (c.t < pt.warn) return false;
        if (pt.shell) this.guarding = true;   // 2.1 쉘로크 껍데기 굴리기: 껍데기 모습으로 굴러감 (피해 감소는 없음)
        m.moving = true; m.atkAnim = 0.3;
        const step = pt.speed * dt;
        if (!c.hit && G.U.overlap(m.box, p.box) && !(pt.low && p.y < G.GROUND_Y - pt.low)) { c.hit = true; hit(pt.dmg); }   // 2.1 low: 점프로 넘을 수 있음
        if (Math.abs(c.target - m.x) <= step) { m.x = c.target; m.atkAnim = -1; if (pt.shell) this.guarding = false; return true; }
        m.x += Math.sign(c.target - m.x) * step;
        return false;
      }
      case 'summon': {
        if (!c.init) {
          c.init = true;
          const alive = w.monsters.filter(x => !x.dead && x.d.kind === 'minion').length;
          const n = Math.min(pt.count, pt.max - alive);
          for (let i = 0; i < n; i++) w.spawnMinion(pt.mon, m.x + (i - 1) * 110);
          if (pt.mon === 'kaien_clone' && n > 0) this.cloneHint = true;   // 2.1: 진짜 카이엔만 파란 목도리가 흔들림
        }
        return c.t > 0.6;
      }
      case 'smoke': {
        if (!c.init) {
          c.init = true; w.smoke = { left: pt.dur, r: pt.radius }; G.FX.burst(m.x, m.y - 40, '#777', 30, 300);
          if (pt.decoy) {   // 2.1: 연막 속 가짜 바르크 2명 (진짜는 눈이 빛남)
            this.smokeReal = pt.dur;
            for (const dx of [-150, 150]) { const d = w.spawnMinion(pt.decoy, G.U.clamp(m.x + dx, m.minX, m.maxX)); d.dir = m.dir; }
          }
        }
        return c.t > 0.5;
      }

      // ---------------- 최종 보스 전용 ----------------
      case 'hands': {   // 플레이어 위치를 따라 바닥에서 손이 솟구침
        c.list = c.list || [];
        c.spawned = c.spawned || 0;
        if (c.spawned < pt.count && c.t >= c.spawned * pt.gapT) {
          const ox = pt.spread ? (c.spawned - (pt.count - 1) / 2) * pt.spread : 0;   // 2.1 spread: 플레이어 둘레에 나란히
          const r = { x: p.x + ox - pt.w / 2, y: G.GROUND_Y - 170, w: pt.w, h: 170 };
          c.list.push({ r, at: c.t + pt.warn }); w.telegraph(r, pt.warn); c.spawned++;
        }
        for (const h of c.list) {
          if (!h.done && c.t >= h.at) {
            h.done = true;
            if (G.U.overlap(h.r, p.box)) hit(pt.dmg, { slow: pt.slow, poison: pt.poison });
            G.FX.add({ k: pt.fx || 'hand', x: h.r.x + h.r.w / 2, y: G.GROUND_Y, life: 0.5 });
            G.FX.burst(h.r.x + h.r.w / 2, G.GROUND_Y - 20, pt.burst || (pt.fx === 'starfall' ? '#fff0b0' : pt.fx === 'nighthand' ? '#b8b0f0' : '#9a40ff'), 14, 260); w.shake(4);
          }
        }
        return c.spawned >= pt.count && c.list.every(h => h.done) && c.t > c.list[c.list.length - 1].at + 0.3;
      }
      case 'orbs': {    // 화면을 튕겨 다니는 어둠 구체
        if (!c.init) {
          c.init = true;
          for (let i = 0; i < pt.count; i++) {
            const a = -Math.PI / 4 - i * Math.PI / (pt.count + 1) * 2;
            w.projectiles.push(new G.Projectile({
              x: m.x, y: m.y - m.h * 0.6, vx: Math.cos(a) * pt.speed, vy: Math.sin(a) * pt.speed, owner: 'enemy', kind: pt.proj || 'voidorb',
              r: 16, range: 99999, life: pt.life, bounce: true, hurt: { pct: pt.dmg, src: m },
            }));
          }
        }
        return c.t > 0.8;
      }
      case 'chain': {   // 소환물을 제한 시간 안에 처치 (guard: 그동안 보스 무적, 실패 시 피해 또는 보스 회복)
        const guard = pt.guard !== false, n = pt.count || pt.pillars || 3;
        if (!c.init) {
          c.init = true;
          if (guard) { this.guarding = true; m.guard = 1; }
          if (pt.fly) m.soar = true;
          c.pillars = [];
          // 빌드 1 (7번): near [가까운, 먼] 이면 캐릭터 양옆 그 거리 안에 (맵 밖이면 안쪽으로)
          const near = pt.near, W = w.map.width, at = i => {
            if (!near) return W * (0.15 + 0.7 * i / Math.max(1, n - 1));
            const sg = i % 2 ? 1 : -1, d = near[0] + (near[1] - near[0]) * (i / Math.max(1, n - 1));
            let x = p.x + sg * d; if (x < 80 || x > W - 80) x = p.x - sg * d;
            return Math.max(80, Math.min(W - 80, x));
          };
          for (let i = 0; i < n; i++) c.pillars.push(w.spawnMinion(pt.mon || 'void_pillar', at(i)));
        }
        // 1.7.2: 녹스 3단계 — 하늘이 갈라지며 아우렐리온의 별빛 숨결이 기둥 하나를 부순다
        // 2.0: 날아와 기둥 위에 멈춰 브레스를 직접 쏘고 퇴장 (컷인 + 등장, 기둥은 1.45초 뒤 부서짐)
        if (c.sky && !c.helped && c.t >= 1.0) {
          c.helped = true;
          const tg = c.pillars.find(x => !x.dead);
          if (tg) G.Assist.aurelion(w, tg);
        }
        const alive = c.pillars.filter(x => !x.dead).length;
        if (alive === 0) {
          this.guarding = false; m.guard = 0; m.soar = false;
          if (pt.successGroggy) { m.groggy = pt.successGroggy; m.vuln = pt.successGroggy; w.shout(`별조각이 모두 부서졌다! ${m.d.name}이(가) 떨어졌다! (${pt.successGroggy}초 그로기)`); w.shake(10); G.FX.burst(m.x, m.y - 60, '#fff0b0', 30, 320); }
          else w.shout(guard ? `${m.d.name}의 방어가 풀렸다!` : '모두 막아냈다!');
          this.expose(w);   // 2.1 기믹 성공 → 약점 노출
          return true;
        }
        if (c.t >= pt.dur) {
          for (const x of c.pillars) if (!x.dead) x.die(w);
          this.guarding = false; m.guard = 0; m.soar = false;
          if (pt.failName) {   // 아우렐리온: 화면을 가로지르는 별빛 숨결
            G.FX.add({ k: 'cut', x: 0, y: G.GROUND_Y - 120, w: w.map.width, h: 120, life: 0.5, glow: true }); G.FX.flash(p.x, p.y - 60, 900, '#e0c0ff', 0.4);
            w.shout(`${pt.failName}! (최대 HP ${pt.failDmg}% 피해)`); p.trueDamage(p.st.maxHP * pt.failDmg / 100); w.shake(12);
          } else if (pt.failHeal) { const h = Math.round(m.maxHp * pt.failHeal / 100 * alive / n); m.hp = Math.min(m.maxHp, m.hp + h); w.shout(`${m.d.name}이(가) 회복했다! (+${G.U.fmt(h)})`); }
          else { const dmg = pt.failDmg != null ? pt.failDmg : 30; w.shout(`막지 못했다! (최대 HP ${dmg}% 피해)`); p.trueDamage(p.st.maxHP * dmg / 100); w.shake(10); }
          return true;
        }
        return false;
      }
      case 'half': {    // 맵 절반(또는 바닥)에 장판
        if (!c.init) {
          c.init = true;
          const side = p.x < w.map.width / 2 ? -1 : 1;   // 플레이어가 있는 쪽
          w.half = { left: pt.dur, side, dmg: pt.dmg, tick: 1, ground: !!pt.ground, tint: pt.tint };
        }
        return c.t > 0.6;
      }
      case 'overheat': {
        if (!c.init) {
          c.init = true; c.atk = m.atk; m.atk *= 2; m.hot = true;
          if (pt.valves) c.valves = [-1, 1].map(s => w.spawnMinion(pt.valves, G.U.clamp(m.x + s * 120, m.minX, m.maxX)));   // 2.1 냉각 밸브 2개
        }
        if (c.valves && c.valves.every(v => v.dead)) {   // 2.1: 밸브를 모두 부수면 바로 다운
          m.atk = c.atk; m.hot = false; m.groggy = pt.groggy; this.expose(w, pt.groggy + 1, '냉각 실패! 다운!'); w.shout(`냉각 밸브가 부서졌다! ${m.d.name} 다운! (${pt.groggy}초)`); w.shake(10); return true;
        }
        if (c.t >= pt.dur) {
          m.atk = c.atk; m.hot = false;
          if (c.valves) { for (const v of c.valves) if (!v.dead) v.die(w); w.shout('과열이 식었다... (밸브를 부수면 다운시킬 수 있다)'); return true; }
          m.groggy = pt.groggy; m.vuln = pt.groggy; w.shout('과열 끝! 그로기 상태 (받는 피해 2배)'); return true;
        }
        return false;
      }
      case 'curse': { if (!c.init) { c.init = true; p.noPotion = pt.dur; G.FX.text(p.x, p.y - 100, '저주: 물약 금지', '#c08cff', 16); } return c.t > 0.5; }
      case 'silence': { if (!c.init) { c.init = true; p.silence = pt.dur; G.FX.text(p.x, p.y - 100, '침묵: 스킬 봉인', '#c08cff', 16); } return c.t > 0.5; }
      case 'invert': { if (!c.init) { c.init = true; p.invert = pt.dur; G.FX.text(p.x, p.y - 100, '좌우 반전!', '#c08cff', 16); } return c.t > 0.5; }
      case 'teleport': {   // 플레이어 등 뒤로 순간이동 후 베기
        if (!c.init) {
          c.init = true;
          G.FX.burst(m.x, m.y - 40, '#3a2a5a', 16, 200);
          m.x = G.U.clamp(p.x - p.dir * 90, m.minX, m.maxX); m.dir = Math.sign(p.x - m.x) || 1;
          G.FX.burst(m.x, m.y - 40, '#3a2a5a', 16, 200);
          const x0 = m.dir > 0 ? m.x - 10 : m.x - pt.w + 10;
          c.rect = { x: x0, y: m.y - pt.h, w: pt.w, h: pt.h };
          w.telegraph(c.rect, pt.warn);
        }
        if (c.t >= pt.warn && !c.hit) {
          c.hit = true; m.atkAnim = 0;
          if (G.U.overlap(c.rect, p.box)) hit(pt.dmg);
          G.FX.slash(m.x + m.dir * 50, m.y - 45, m.dir, 140, 90, '#8a5aff');
        }
        if (c.t >= pt.warn + 0.3 && (c.k || 0) + 1 < (pt.times || 1)) { c.k = (c.k || 0) + 1; c.init = false; c.hit = false; c.t = 0; return false; }   // 2.1 그림자 난무: 연속 순간이동
        return c.t >= pt.warn + 0.3;
      }
      case 'waves': {   // 높이가 다른 검기를 차례로 발사 (점프/착지로 피함)
        c.n = c.n || 0;
        if (c.n < pt.count && c.t >= c.n * pt.gapT + 0.4) {
          const ys = pt.ys || [32, 85, 32];
          m.dir = Math.sign(p.x - m.x) || m.dir; m.atkAnim = 0;
          w.projectiles.push(new G.Projectile({ x: m.x + m.dir * 30, y: m.y - ys[c.n % ys.length], vx: m.dir * pt.speed, vy: 0, owner: 'enemy', kind: pt.proj || 'wave', r: pt.proj === 'gust' || pt.proj === 'twister' ? 22 : 18, range: 1600, life: 4, hurt: { pct: pt.dmg, src: m } }));
          c.n++;
        }
        return c.n >= pt.count && c.t > pt.count * pt.gapT + 0.6;
      }
      case 'echo': {    // 영웅의 잔영 소환. 잔영을 쓰러뜨리면 녹스 5초 그로기
        if (!c.init) { c.init = true; const x = G.U.clamp(p.x + (p.x < m.x ? -200 : 200), 100, w.map.width - 100); w.spawnMinion(pt.mon, x); }
        return c.t > 0.6;
      }
      case 'cut': {     // 차원 절단: 가로 줄 또는 세로 기둥
        if (!c.lines) {
          c.lines = [];
          for (let i = 0; i < pt.count; i++) {
            const horiz = Math.random() < 0.5;
            const r = horiz
              ? (Math.random() < 0.5 ? { x: 0, y: G.GROUND_Y - 95, w: w.map.width, h: 95 } : { x: 0, y: 330, w: w.map.width, h: 140 })
              : { x: p.x - 70 + (i ? G.U.rand(-150, 150) : 0), y: 0, w: 140, h: G.GROUND_Y };
            c.lines.push({ r, at: pt.warn + i * 0.9 });
            setTimeout(() => w.telegraph(r, pt.warn), i * 900);
          }
        }
        for (const l of c.lines) {
          if (!l.done && c.t >= l.at) {
            l.done = true;
            if (G.U.overlap(l.r, p.box)) hit(pt.dmg);
            G.FX.add({ k: 'cut', x: l.r.x, y: l.r.y, w: l.r.w, h: l.r.h, life: 0.35, glow: true, tint: pt.tint }); w.shake(8);
          }
        }
        return c.lines.every(l => l.done) && c.t > c.lines[c.lines.length - 1].at + 0.3;
      }
      case 'erosion': { // 공허 잠식: 가장자리부터 어두워짐, 중앙만 안전
        if (!c.init) { c.init = true; w.zone = { left: pt.dur, max: pt.dur, safe: pt.safe, dmg: pt.dmg, tick: 1, tint: pt.tint, stars: !!pt.stars }; }
        return c.t > 0.6;
      }
      case 'pull': {    // 별을 삼키는 자: 녹스 쪽으로 빨려 들어감
        if (!c.init) { c.init = true; w.pull = { left: pt.dur, force: pt.force, dmg: pt.dmg, tick: 0.5, src: m }; }
        return c.t >= pt.dur;
      }
      case 'doom': {    // 종말의 별 / 태양의 심판: 안전지대 밖이면 즉사(또는 큰 피해)
        if (!c.init) {
          c.init = true;
          const zones = [];
          if ((pt.zones || 1) === 1) {
            const side = p.x < w.map.width / 2 ? 1 : -1;   // 플레이어 반대편 쪽에 보호막
            zones.push(G.U.clamp(w.map.width / 2 + side * G.U.rand(250, 520), 120, w.map.width - 120));
          } else for (let i = 0; i < pt.zones; i++) zones.push(w.map.width * (0.2 + 0.6 * i / (pt.zones - 1)) + G.U.rand(-80, 80));
          w.doom = { left: pt.warn, max: pt.warn, zones, r: 90, label: pt.zones > 1 ? '그림자 진 안전지대로!' : '보호막 안으로!' };
          if (pt.firstCut && !this.doomSeen) { this.doomSeen = true; G.Assist.say(w, 'elma', '빛나는 보호막 안으로 들어가세요!', '종말의 별 · 보호막 안이면 안전'); }
        }
        if (c.t >= pt.warn && !c.fired) {
          c.fired = true;
          const safe = w.doom.zones.some(x => Math.abs(p.x - x) <= w.doom.r) && p.y >= G.GROUND_Y - 10;
          G.FX.flash(640 + w.cam, 300, 1200, '#ffffff', 0.6); w.shake(14);
          if (!safe && !p.dead) {
            w.shout(pt.failDmg ? `${pt.name}에 휩쓸렸다! (최대 HP ${pt.failDmg}% 피해)` : '종말의 별에 휩쓸렸다...');
            p.trueDamage(p.st.maxHP * (pt.failDmg || 1000) / 100);
          } else { w.shout('안전지대가 빛을 막아냈다!'); this.expose(w); }
          w.doom = null;
        }
        return c.t >= pt.warn + 0.5;
      }
      // ---------------- 2.1 새 패턴 ----------------
      case 'sweep': {   // 천공의 숨결: 용 앞쪽 바닥을 먼 끝까지 쓸고 가는 브레스 (용 발밑 · 등 뒤가 안전)
        if (!c.init) {
          c.init = true; m.dir = Math.sign(p.x - m.x) || m.dir;
          const x0 = m.x + m.dir * 70, x1 = m.dir > 0 ? w.map.width : 0;
          w.sweep = { x0, x1, dir: m.dir, warn: pt.warn, dur: pt.dur, t: 0, src: m };
          w.telegraph({ x: Math.min(x0, x1), y: G.GROUND_Y - 90, w: Math.abs(x1 - x0), h: 90 }, pt.warn);
        }
        this.raise = c.t < pt.warn ? Math.min(1, c.t / pt.warn) : 1;
        const sw = w.sweep;
        if (sw && c.t >= pt.warn) {
          const u = Math.min(1, (c.t - pt.warn) / pt.dur); sw.hx = sw.x0 + (sw.x1 - sw.x0) * u;
          if (!c.hit && Math.abs(p.x - sw.hx) < 55 && p.y > G.GROUND_Y - 90) { c.hit = true; hit(pt.dmg); }
          if (Math.random() < 0.6) G.FX.burst(sw.hx, G.GROUND_Y - 10, '#e0c8ff', 3, 160);
        }
        if (c.t >= pt.warn + pt.dur + 0.3) { w.sweep = null; this.raise = 0; return true; }
        return false;
      }
      case 'brand': {   // 교단의 낙인: 머리 위 눈 문양 → (따라오다 멈춤) → 그 자리 폭발
        if (!c.init) { c.init = true; w.brand = { x: p.x, follow: pt.follow, left: pt.time, max: pt.time }; G.Sound.play('curse'); }
        const b = w.brand;
        if (b) {
          if (c.t < pt.follow) b.x = p.x;
          b.left = pt.time - c.t;
          if (b.left <= 0 && !c.hit) {
            c.hit = true;
            if (Math.abs(p.x - b.x) < pt.r) hit(pt.dmg);
            G.FX.shock(b.x, G.GROUND_Y - 30, pt.r * 1.6, '#c890ff'); G.FX.burst(b.x, G.GROUND_Y - 30, '#c890ff', 30, 320); w.shake(8);
            w.brand = null;
          }
        }
        return c.t >= pt.time + 0.3;
      }
      case 'despair': {
        if (!c.init) { c.init = true; p.despair = { left: pt.dur, dot: pt.dot, cut: pt.healCut, tick: 1 }; G.FX.ring(p.x, p.y - 30, 90, '#7a7a8a'); }
        return c.t > 0.5;
      }
    }
    return true;
  }
};
