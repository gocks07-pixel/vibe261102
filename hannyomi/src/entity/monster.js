'use strict';
// 몬스터. 일반 몬스터는 배회/추적/원거리 사격, 보스는 G.BossAI 가 조종한다
// status: 장비 특수 효과로 걸리는 상태 이상 {stun, freeze, dark, slow, seal}
G.Monster = class {
  constructor(id, x, plat, slot) {
    const d = this.d = G.MONSTERS[id];
    const st = G.F.monsterStats(d.lv, d.kind);
    this.id = id; this.lv = d.lv;
    let hp = d.fixedHp || st.hp * (d.hpMul || 1);
    this.maxHp = this.hp = Math.round(hp); this.atk = st.atk; this.exp = st.exp; this.defense = st.def;
    this.w = d.w; this.h = d.h; this.plat = plat; this.y = plat.y; this.slot = slot;
    this.minX = plat.x + this.w / 2 + 4; this.maxX = plat.x + plat.w - this.w / 2 - 4;
    if (this.minX > this.maxX) this.minX = this.maxX = plat.x + plat.w / 2;
    this.x = G.U.clamp(x, this.minX, this.maxX);
    this.isBoss = d.kind === 'boss' || d.kind === 'final';
    this.flying = !!d.flying;
    if (this.flying) { this.baseY = plat.y - 110; this.y = this.baseY; }
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.moving = false; this.tm = G.U.rand(0.5, 2.5); this.aggro = 0;
    this.hurtT = 0; this.dead = false; this.deadT = 0; this.kb = 0; this.t = Math.random() * 10;
    this.shootT = G.U.rand(1, 2.5); this.warnT = 0; this.guard = 0; this.poison = null; this.atkAnim = -1;
    this.status = {}; this.groggy = 0;
    if (d.ai) this.boss = new G.BossAI(this);
  }
  get box() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  // 행동 불가 (기절/빙결/그로기)
  get disabled() { return this.groggy > 0 || !!this.status.stun || !!this.status.freeze; }
  speedMul() { return (this.status.slow ? 1 - this.status.slow.v / 100 : 1) * (this.buff ? this.buff.spd : 1); }

  applyStatus(id, dur, v) {
    const T = { stun: ['기절!', '#ffe680'], freeze: ['빙결!', '#9ae6ff'], dark: ['암흑', '#b08cff'], slow: ['슬로우', '#9ad0a0'], seal: ['봉인', '#ffb070'] };
    if (this.isBoss) {
      if (id === 'stun') { G.FX.text(this.x, this.y - this.h - 24, '면역', '#9aa6c8', 12, 0.6); return; }
      if (id === 'freeze') { id = 'slow'; v = 30; }
      if (id === 'seal' && this.boss) { if (!this.boss.cur) this.boss.next += 2; G.FX.text(this.x, this.y - this.h - 24, '봉인: 패턴 지연', '#ffb070', 13, 0.8); return; }
    }
    this.status[id] = { left: dur, v };
    G.FX.text(this.x, this.y - this.h - 24, T[id][0], T[id][1], 14, 0.8);
  }

  update(dt, w) {
    this.t += dt;
    if (this.dead) { this.deadT += dt; return; }
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.warnT > 0) this.warnT -= dt;
    if (this.groggy > 0) this.groggy -= dt;
    if (this.vuln > 0) this.vuln -= dt;
    for (const k in this.status) { this.status[k].left -= dt; if (this.status[k].left <= 0) delete this.status[k]; }
    if (this.atkAnim >= 0 && !(this.boss && this.boss.cur)) { this.atkAnim += dt * 2.5; if (this.atkAnim > 1) this.atkAnim = -1; }
    if (this.poison) {
      this.poison.tick -= dt;
      if (this.poison.tick <= 0) {
        this.poison.tick = 1; this.poison.left--;
        const dmg = Math.max(1, Math.round(this.poison.dps));
        this.hp -= dmg; G.FX.dmg(this.x, this.y - this.h - 4, dmg, 'poison');
        if (this.poison.left <= 0) this.poison = null;
        if (this.hp <= 0) { this.die(w); return; }
      }
    }
    if (this.boss) this.soarY = (this.soarY || 0) + ((this.soar ? 150 : 0) - (this.soarY || 0)) * Math.min(1, dt * (this.soar ? 2 : 5));   // 1.7.2 아우렐리온 비상 높이
    if (this.disabled) { this.moving = false; return; }
    if (this.boss) this.boss.update(dt, w); else this.ai(dt, w);
    const p = w.player;
    if (!p.dead && !this.d.harmless && !this.guard && !(this.boss && this.boss.guarding) && G.U.overlap(this.box, p.box)) p.hurt(this.atk * (this.buff ? this.buff.atk : 1), this.x, { src: this });
  }

  ai(dt, w) {
    const d = this.d, p = w.player;
    if (this.aggro > 0) this.aggro -= dt;
    if (G.MonSkill.update(this, dt, w)) return;   // 1.7.5 몬스터 스킬 (쓰는 동안 일반 움직임 멈춤)
    const dx = p.x - this.x, dy = p.y - this.y;
    if (d.aggressive && !p.dead && Math.abs(dx) < (d.sight || 260) && Math.abs(dy) < 90) this.aggro = Math.max(this.aggro, 2);
    if (this.kb) {
      this.x += this.kb * dt; this.kb *= Math.pow(0.01, dt);
      if (Math.abs(this.kb) < 8) this.kb = 0;
    }
    if (d.ranged && !this.status.seal && !p.dead && Math.abs(dx) < 460 && Math.abs(dy) < 150) {
      this.dir = Math.sign(dx) || this.dir; this.moving = false;
      this.shootT -= dt;
      if (this.shootT <= 0) {
        this.shootT = 2.2; this.atkAnim = 0;
        const sx = this.x + this.dir * 20, sy = this.y - 40, a = Math.atan2(p.y - 35 - sy, p.x - sx);
        w.projectiles.push(new G.Projectile({ x: sx, y: sy, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, owner: 'enemy', kind: d.proj || 'arrow', range: 700, hurt: { raw: this.atk, src: this } }));
      }
    } else if (this.aggro > 0 && !p.dead) {
      this.dir = Math.sign(dx) || this.dir; this.moving = Math.abs(dx) > 6;
    } else {
      this.tm -= dt;
      if (this.tm <= 0) {
        this.tm = G.U.rand(1, 3);
        const r = Math.random();
        if (r < 0.35) this.moving = false; else { this.moving = true; this.dir = r < 0.67 ? -1 : 1; }
      }
    }
    if (this.moving) this.x += this.dir * d.speed * (this.aggro > 0 ? 1.35 : 1) * this.speedMul() * dt;
    if (this.x <= this.minX) { this.x = this.minX; if (this.aggro <= 0) this.dir = 1; }
    if (this.x >= this.maxX) { this.x = this.maxX; if (this.aggro <= 0) this.dir = -1; }
    if (this.flying) {
      const ty = this.aggro > 0 ? G.U.clamp(p.y - 30, this.baseY - 60, this.plat.y - 20) : this.baseY;
      this.y += (ty + Math.sin(this.t * 2.2) * 14 - this.y) * Math.min(1, dt * 2);
    }
  }

  takeDamage(dmg, p) {
    if (this.buff && this.buff.def < 1) dmg = Math.round(dmg * this.buff.def);
    this.hp -= dmg; this.hurtT = 0.12; this.aggro = 6;
    if (!this.isBoss && !this.flying && !this.d.noKb) this.kb = Math.sign(this.x - p.x || 1) * 170;
    // 체력이 일정 이하가 되면 도주하는 보스 (카이엔)
    if (this.d.retreatAt && this.hp / this.maxHp <= this.d.retreatAt && !this.dead) {
      const w = G.Game.world;
      w.shout('카이엔: ...여기까지인가. 다음에 보자, 별의 아이.');
      G.FX.burst(this.x, this.y - 50, '#3a2a5a', 40, 300);
      for (const x of w.monsters) if (x.d.clone && !x.dead) x.die(w);
      this.hp = 0;
    }
    if (this.hp <= 0) this.die(G.Game.world);
  }
  die(w) {
    if (this.dead) return;
    this.dead = true; this.hp = 0; this.deadT = 0;
    w.onKill(this);
  }

  draw(ctx) {
    if (this.status.freeze) ctx.filter = 'hue-rotate(160deg) saturate(1.6)';
    else if (this.hot) ctx.filter = 'sepia(1) saturate(4) hue-rotate(-30deg)';
    else if (this.cueT > 0 && Math.floor(this.cueT * 12) % 2) ctx.filter = 'brightness(1.9)';   // 1.7.5 스킬 예고: 하얗게 번쩍
    if (this.buff && !this.dead) G.Draw.ell(ctx, this.x, this.y - this.h * 0.5, this.w * 0.7, this.h * 0.62, null, this.buff.color, 2 + Math.sin(this.t * 10));
    if (this.hideT > 0) ctx.globalAlpha = 0.08;
    G.Draw.monster(ctx, this, this.disabled ? 0 : this.t);
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    if (this.dead) return;
    const top = this.y - this.h - 12;
    if (!this.isBoss && (this.hp < this.maxHp || this.aggro > 0)) {
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(this.x - 24, top, 48, 6);
      ctx.fillStyle = '#ff4d4d'; ctx.fillRect(this.x - 23, top + 1, 46 * Math.max(0, this.hp / this.maxHp), 4);
      ctx.font = 'bold 11px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
      const label = `Lv.${this.lv} ${this.d.name}`;
      ctx.strokeText(label, this.x, top - 4); ctx.fillStyle = '#fff'; ctx.fillText(label, this.x, top - 4);
    }
    // 상태 이상 아이콘
    const ICON = { stun: '💫', freeze: '❄', dark: '🌑', slow: '🐌', seal: '🔒' };
    const icons = Object.keys(this.status).map(k => ICON[k]);
    if (this.poison) icons.push('☠');
    if (icons.length) {
      ctx.font = '15px "Segoe UI Emoji", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(icons.join(''), this.x, top - (this.isBoss ? 4 : 18));
    }
    if (this.groggy > 0) {
      ctx.font = '900 18px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#000';
      ctx.strokeText('그로기!', this.x, top - 26); ctx.fillStyle = '#ffe680'; ctx.fillText('그로기!', this.x, top - 26);
    }
    if (this.warnT > 0 && Math.floor(this.t * 10) % 2) {
      ctx.font = '900 30px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#000';
      ctx.strokeText('!', this.x, this.y - this.h - 20); ctx.fillStyle = '#ff3b3b'; ctx.fillText('!', this.x, this.y - this.h - 20);
    }
    if (this.guard) {
      ctx.font = 'bold 13px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.fillStyle = '#9fd8ff';
      ctx.fillText(this.guard >= 1 ? '무적' : `피해 ${Math.round(this.guard * 100)}% 감소`, this.x, this.y - this.h - 6);
    }
  }
};
