'use strict';
// 플레이어. this.d = 저장되는 데이터, 나머지는 실행 중 상태
G.Player = class {
  static newData(name, look) {
    const d = {
      name, job: 'beginner', level: 1, exp: 0,
      base: { STR: 4, DEX: 4, INT: 4, LUK: 4 }, ap: 9, sp: 0,
      skills: { b_stone: 1, b_aid: 1, b_djump: 1 }, hot: ['b_stone', 'b_aid', null, null, null, null], djump: 'fwd', chests: {},
      inv: G.Inv.empty(), eq: {}, gold: 100, quests: {}, flags: {}, spv: 2, pity: {}, v161: true,
      map: 'dream_beach', town: 'dream_beach', look: G.LOOKS.normalize(look), created: Date.now(),
      tut: { step: 0, flags: {}, moved: 0 },
    };
    d.eq.weapon = G.Items.create('stick_wood', { plain: true });
    d.eq.top = G.Items.create('cloth_top', { plain: true });
    d.eq.bottom = G.Items.create('cloth_pants', { plain: true });
    d.eq.shoes = G.Items.create('cloth_shoes', { plain: true });
    d.inv.use[0] = { tid: 'pot_red', qty: 15 };
    return d;
  }

  constructor(d) {
    this.d = d; this.w = 30; this.h = 62;
    d.look = G.LOOKS.normalize(d.look);
    if (d.skills.b_djump == null) d.skills.b_djump = 1;
    d.djump = d.djump || 'fwd'; d.chests = d.chests || {}; d.flags = d.flags || {};
    this.gdash = 0; this.gdashCd = 0;
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.kbX = 0; this.dir = 1;
    this.onGround = false; this.plat = null; this.dropT = 0; this.dropFrom = null;
    this.buffs = {}; this.cd = {}; this.itemCd = {}; this.autoT = { hp: 0, mp: 0 }; this.lock = 0; this.atkT = -1; this.atkKind = 'melee';
    this.invuln = 0; this.dead = false; this.slowT = 0; this.poison = null; this.regenT = 0; this.t = 0; this.dash = null;
    this.adash = 0; this.airDashed = false; this.ghostT = 0; this.auraT = 0;
    this.pity = {};
    this.recalc();
    this.hp = d.hp != null ? Math.min(d.hp, this.st.maxHP) : this.st.maxHP;
    this.mp = d.mp != null ? Math.min(d.mp, this.st.maxMP) : this.st.maxMP;
    if (this.hp <= 0) this.hp = Math.ceil(this.st.maxHP * 0.5);
  }
  get box() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  recalc() {
    this.st = G.Stats.calc(this);
    if (this.hp > this.st.maxHP) this.hp = this.st.maxHP;
    if (this.mp > this.st.maxMP) this.mp = this.st.maxMP;
  }
  weaponTpl() { return this.d.eq.weapon ? G.ITEMS[this.d.eq.weapon.tid] : null; }

  // ---------------- 매 프레임 ----------------
  update(dt, w) {
    if (this.markGlow > 0) this.markGlow -= dt;
    const I = G.Input;
    this.t += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.lock > 0) this.lock -= dt;
    if (this.atkT >= 0) { this.atkT += dt / 0.35; if (this.atkT > 1) this.atkT = -1; }
    if (this.slowT > 0) this.slowT -= dt;
    if (this.cheerCd > 0) this.cheerCd -= dt;   // 1.7.12 연희의 응원 재사용
    if (this.dropT > 0) this.dropT -= dt;
    for (const k in this.cd) if (this.cd[k] > 0) this.cd[k] -= dt;
    for (const k in this.itemCd) if (this.itemCd[k] > 0) this.itemCd[k] -= dt;   // EXE 빌드: 별의 정수 재사용 대기
    G.AutoPot.update(this, dt);
    G.SkillX.update(dt, w);   // 1.7.10: 조준선 뒤 발사 · 지연 폭발 · 바닥 장판
    let buffChanged = false;
    for (const id in this.buffs) {
      this.buffs[id].left -= dt;
      if (this.buffs[id].left <= 0) {
        if (this.buffs[id].stats.barrier) this.barrier = 0;
        G.UI.log(`[${this.buffs[id].name}] 효과가 끝났습니다.`, '#9aa6c8'); delete this.buffs[id]; buffChanged = true;
      }
    }
    if (buffChanged) { this.recalc(); G.UI.dirty(); }
    // 버프 오라: 발밑에서 빛이 떠오름
    const bk = Object.keys(this.buffs);
    if (bk.length && !this.dead) {
      this.auraT -= dt;
      if (this.auraT <= 0) { this.auraT = 0.12; G.FX.rise(this.x, this.y - 4, this.buffColor(), 1); }
    }
    if (this.poison && !this.dead) {
      this.poison.tick -= dt;
      if (this.poison.tick <= 0) {
        this.poison.tick = 1; this.poison.left--;
        const dmg = Math.max(1, Math.round(this.poison.dps));
        this.hp -= dmg; G.FX.dmg(this.x, this.y - 75, dmg, 'poison');
        if (this.poison.left <= 0) this.poison = null;
        if (this.hp <= 0) { this.die(); }
      }
    }
    if (this.fxCd > 0) this.fxCd -= dt;
    this.regenT += dt;
    if (this.regenT >= 5 && !this.dead) {
      this.regenT = 0;
      this.heal(Math.max(2, Math.round(this.st.maxHP * 0.02)), true);
      this.healMp(Math.max(2, Math.round(this.st.maxMP * 0.03)) + this.st.mpRegen, true);
    }
    // 특수 효과: 주기적 회복 (4초)
    this.regen4 = (this.regen4 || 0) + dt;
    if (this.regen4 >= 4 && !this.dead) {
      this.regen4 = 0;
      const hr = this.st.fx('hpRegen'), mr = this.st.fx('mpRegen2');
      if (hr) this.heal(Math.round(this.d.level * hr.v));
      if (mr) this.healMp(Math.round(this.d.level * mr.v), true);
    }
    // 최종 보스 '절망': 지속 피해 + 회복량 감소
    if (this.despair && !this.dead) {
      this.despair.left -= dt; this.despair.tick -= dt;
      if (this.despair.tick <= 0) { this.despair.tick = 1; this.trueDamage(this.st.maxHP * this.despair.dot / 100); }
      if (this.despair.left <= 0) this.despair = null;
    }

    // 보스 디버프: 침묵(스킬 봉인) / 반전(좌우 반대) / 저주(물약 금지)
    for (const k of ['silence', 'invert', 'noPotion']) if (this[k] > 0) this[k] -= dt;
    const frozen = this.dead || G.UI.blocking();
    const move = frozen ? 0 : I.horizontal() * (this.invert > 0 ? -1 : 1);
    const px = this.x;
    if (this.dash) {
      this.updateDash(dt, w);
    } else {
      if (move && this.lock <= 0) this.dir = move;
      const canMove = !(this.lock > 0 && this.onGround) || (G.Play && G.Play.moveCancel());   // 모바일 2차-1.2: 공격 중 바로 이동 (터치 모드에서 켰을 때만)
      this.vx = canMove ? move * 250 * (1 + this.st.mspd / 100) * (this.slowT > 0 ? 0.5 : 1) : 0;
    }
    const K = G.Keys;
    if (!frozen && !this.dash && K.hit('jump')) {
      if (this.onGround) {
        if (I.isDown('ArrowDown') && this.plat && !this.plat.ground) {
          this.dropT = 0.3; this.dropFrom = this.plat; this.onGround = false; this.y += 3;
          G.Tutorial.ev('drop');
        } else {
          this.vy = -780 * (1 + this.st.mspd / 200); this.onGround = false; G.Audio.play('jump');
          G.Tutorial.ev('jump');
        }
      } else if (!this.airDashed && this.adash <= 0 && this.d.skills.b_djump) {
        // 2단 점프: ↑ 를 누르고 있거나 [위로] 모드면 위로, 아니면 앞으로 살짝
        this.airDashed = true;
        if (I.isDown('ArrowUp') || this.d.djump === 'up') {
          this.vy = Math.min(this.vy, -720);   // 2.1.6: 사냥터 가운데 발판(바닥에서 230~260px)에 2단 점프로 여유 있게 (최대 271 → 296px)
          G.Audio.play('jump'); G.FX.ring(this.x, this.y + 4, 40, '#bfe6ff', 0.35); G.FX.burst(this.x, this.y, '#e8f4ff', 8, 120);
          G.Tutorial.ev('djup');
        } else {
          if (move) this.dir = move;
          this.adash = 0.24; this.vy = Math.min(this.vy, -240);
          G.Audio.play('dash'); G.FX.wind(this.x, this.y - 30, this.dir);
          G.Tutorial.ev('dash');
        }
      }
    }
    if (this.adash > 0) {
      this.adash -= dt;
      this.vx = this.dir * 440;   // 0.24초 × 440 ≈ 105px
      if (this.adash <= 0) this.adash = 0;
    }
    // 땅 대쉬: 대쉬 키(기본 Shift) 또는 방향키 두 번(메뉴에서 켰을 때)
    if (this.gdashCd > 0) this.gdashCd -= dt;
    if (!frozen && !this.dash && this.onGround && this.lock <= 0 && this.gdashCd <= 0) {
      let want = 0;
      if (K.hit('dash')) want = move || this.dir;
      else if (G.Settings.dtapDash && I.dtap) want = I.dtap === 'ArrowLeft' ? -1 : 1;
      if (want) {
        this.dir = want; this.gdash = 0.12; this.gdashCd = 1;
        G.Audio.play('dash'); G.FX.wind(this.x, this.y - 30, this.dir); G.FX.ghost(this.drawOpts(0.6));
        G.Tutorial.ev('gdash');
      }
    }
    if (this.gdash > 0) {
      this.gdash -= dt;
      this.vx = this.dir * 820;   // 0.12초 × 820 ≈ 100px
      this.ghostT -= dt;
      if (this.ghostT <= 0) { this.ghostT = 0.03; G.FX.ghost(this.drawOpts(0.5)); }
    }
    this.physics(dt, w);
    if (this.onGround) this.airDashed = false;
    if (G.Tutorial.active()) this.d.tut.moved += Math.abs(this.x - px);

    if (frozen) return;
    // 짧게 누른 입력은 0.35초 동안 기억했다가(선입력) 경직이 풀리면 실행, 누르고 있으면 연속 공격
    const atkKeys = K.codes('attack');
    let tap = null;
    if (I.hit(...atkKeys)) tap = 'basic';
    for (let i = 0; i < 6; i++) if (this.d.hot[i] && K.hit('skill' + (i + 1))) tap = this.d.hot[i];
    if (tap) this.buf = { what: tap, left: 0.35 };
    if (this.buf) { this.buf.left -= dt; if (this.buf.left <= 0) this.buf = null; }
    if (this.lock <= 0 && !this.dash) {
      if (this.buf) {
        const b = this.buf; this.buf = null;
        if (b.what === 'basic') this.basicAttack(w); else this.useSkill(b.what, w, false);
      } else {
        if (I.isDown(...atkKeys)) this.basicAttack(w);
        for (let i = 0; i < 6; i++) {
          const id = this.d.hot[i];
          if (id && G.SKILLS[id].type === 'attack' && K.down('skill' + (i + 1))) { this.useSkill(id, w, true); break; }
        }
      }
    }
    if (K.hit('hp')) this.quickPotion('hp');
    if (K.hit('mp')) this.quickPotion('mp');
    if (I.hit('ArrowUp') && this.onGround) w.interact();
  }

  physics(dt, w) {
    if (!this.dash) this.vy = Math.min(900, this.vy + 1900 * dt);
    const prevY = this.y;
    this.x += (this.vx + this.kbX) * dt;
    if (this.kbX) { this.kbX *= Math.pow(0.005, dt); if (Math.abs(this.kbX) < 10) this.kbX = 0; }
    if (!this.dash) this.y += this.vy * dt;
    this.x = G.U.clamp(this.x, 15, w.map.width - 15);
    this.onGround = false;
    if (this.vy >= 0) {
      let best = null;
      for (const p of w.platforms) {
        if (p === this.dropFrom && this.dropT > 0) continue;
        if (this.x < p.x - 4 || this.x > p.x + p.w + 4) continue;
        if (prevY <= p.y + 1 && this.y >= p.y && (!best || p.y < best.y)) best = p;
      }
      if (best) { this.y = best.y; this.vy = 0; this.onGround = true; this.plat = best; }
    }
  }

  updateDash(dt, w) {
    const ds = this.dash, step = Math.min(ds.left, ds.speed * dt);
    this.vx = 0; this.vy = 0;
    this.x = G.U.clamp(this.x + this.dir * step, 15, w.map.width - 15);
    ds.left -= step;
    const box = { x: this.x - 40, y: this.y - 80, w: 80, h: 90 };
    for (const m of w.monsters) {
      if (m.dead || ds.hit.has(m) || ds.hit.size >= ds.targets) continue;
      if (G.U.overlap(box, m.box)) { ds.hit.add(m); for (let i = 0; i < (ds.hits || 1); i++) G.Combat.hit(this, m, ds.pct, i, ds.color); if (ds.xh) ds.xh(m); }
    }
    this.ghostT -= dt;
    if (this.ghostT <= 0) { this.ghostT = 0.02; G.FX.ghost(this.drawOpts(1), ds.color); }
    G.FX.burst(this.x - this.dir * 20, this.y - 30, ds.color, 2, 80);
    if (ds.trail) for (let i = 0; i < 2; i++) G.FX.add({ k: 'p', x: this.x - this.dir * G.U.rand(10, 40), y: this.y - G.U.rand(2, 14), vx: 0, vy: -90, grav: -40, color: ds.trail, r: G.U.rand(3, 6), life: 0.5, glow: true });
    if (ds.left <= 0 || this.x <= 15 || this.x >= w.map.width - 15) {
      this.dash = null;
      G.FX.flash(this.x, this.y - 35, 60, ds.color); w.shake(4);
    }
  }

  // ---------------- 전투 ----------------
  frontRect(wd, ht) {
    return { x: this.dir > 0 ? this.x - 12 : this.x - wd + 12, y: this.y - ht, w: wd, h: ht + 6 };
  }
  hitArea(w, rect, targets, pct, hits = 1, color, after) {
    const list = w.monsters.filter(m => !m.dead && G.U.overlap(rect, m.box))
      .sort((a, b) => Math.abs(a.x - this.x) - Math.abs(b.x - this.x)).slice(0, targets);
    if (targets >= 3 && list.length > 0 && list.length <= 2) pct *= 1.4;   // 2.1 집중 보너스: 범위 스킬이 1~2마리만 맞히면 +40%
    for (const m of list) { for (let i = 0; i < hits; i++) G.Combat.hit(this, m, pct, i, color); if (after) after(m); }
    return list.length;
  }
  shoot(w, o) {
    w.projectiles.push(new G.Projectile(Object.assign({
      x: this.x + this.dir * 22, y: this.y - 36, vx: this.dir * 800, vy: 0, owner: 'player', range: 450,
    }, o)));
  }

  basicAttack(w) {
    if (this.lock > 0 || this.dash) return;
    this.lock = 0.45 * (1 - this.st.aspd / 100); this.atkT = 0;
    const t = this.weaponTpl(), type = t ? t.type : 'stick';
    const onHit = m => G.Combat.hit(this, m, 100);
    if (type === 'bow') { this.atkKind = 'proj'; this.shoot(w, { kind: 'arrow', vx: this.dir * 900, range: 480, onHit }); }
    else if (type === 'wand') { this.atkKind = 'proj'; this.shoot(w, { kind: 'orb', vx: this.dir * 700, range: 360, color: '#8fb4ff', onHit: m => G.Combat.hit(this, m, 100, 0, '#8fb4ff') }); }
    else {
      this.atkKind = 'melee';
      const r = this.frontRect(type === 'dagger' ? 85 : 95, 80);
      this.hitArea(w, r, 1, 100);
      G.FX.slash(this.x + this.dir * 40, this.y - 38, this.dir, 90, 70, '#fff3d0');
    }
  }

  useSkill(id, w, held) {
    const sk = G.SKILLS[id], lv = this.d.skills[id] || 0;
    if (!sk || lv <= 0 || sk.type === 'passive' || sk.type === 'toggle' || this.dead || this.dash) return;
    if (this.lock > 0) return;
    if (this.silence > 0) { if (!held) G.UI.log('침묵 상태: 스킬을 쓸 수 없습니다.', '#c08cff'); return; }
    if (this.cd[id] > 0) { if (!held) { G.UI.log(`${sk.name}: 재사용 대기 중 (${this.cd[id].toFixed(1)}초)`, '#9aa6c8'); } return; }
    const save = this.st.fx('mpSave');
    const mp = Math.ceil(sk.mp(lv) * (1 - (save ? save.v : 0) / 100));
    if (this.mp < mp) { if (!held) { G.UI.log('MP가 부족합니다.', '#7ab8ff'); G.Audio.play('error'); } return; }
    this.mp -= mp; this.cd[id] = sk.cd || 0; this.lock = (sk.lock || 0.42) * (1 - this.st.aspd / 100);
    { const X0 = G.SKILL_X[id]; if (sk.type === 'attack' && X0 && X0.aim) G.Sound.play('aim'); else G.Sound.skill(sk); }   // 1.8 스킬마다 다른 소리 (조준 스킬은 조준음 → 쏠 때 소리)
    G.Tutorial.ev('skill');
    const el = G.FX.EL[sk.icon.el] || '#fff';
    if (sk.type === 'attack') this.doAttack(sk, lv, w, el);
    else if (sk.type === 'buff') {
      this.buffs[id] = { left: sk.buff.dur(lv), max: sk.buff.dur(lv), stats: sk.buff.stats(lv), name: sk.name, color: el };
      if (this.buffs[id].stats.barrier) {   // 1.6.1: 별의 장막 — 최대 HP의 n% 만큼 피해 흡수
        this.recalc();
        this.barrier = Math.max(this.barrier || 0, Math.round(this.st.maxHP * this.buffs[id].stats.barrier / 100));
        G.FX.ring(this.x, this.y - 35, 46, '#bfe6ff', 0.6);
      }
      this.recalc(); G.UI.dirty();
      G.FX.pillar(this.x, this.y, el); G.FX.ring(this.x, this.y - 4, 90, el, 0.6); G.FX.stars(this.x, this.y - 50, 6);
      G.FX.text(this.x, this.y - 95, sk.name, '#ffe08a');
    } else if (sk.type === 'heal') {
      this.heal(Math.round(this.st.maxHP * sk.heal(lv) / 100));
      G.FX.pillar(this.x, this.y, '#6dff8a'); G.FX.ring(this.x, this.y - 4, 70, '#6dff8a');
    } else if (sk.type === 'move') {
      this.blink(sk.dist(lv), w, el);
    }
  }

  blink(dist, w, el) {
    G.FX.ghost(this.drawOpts(1), el); G.FX.flash(this.x, this.y - 35, 50, el); G.FX.burst(this.x, this.y - 30, el, 14);
    let moved = false;
    if (G.Input.isDown('ArrowUp')) {
      const up = w.platforms.filter(p => p.y < this.y - 10 && p.y >= this.y - dist && this.x >= p.x && this.x <= p.x + p.w)
        .sort((a, b) => b.y - a.y)[0];
      if (up) { this.y = up.y; this.vy = 0; moved = true; }
    }
    if (!moved) this.x = G.U.clamp(this.x + this.dir * dist, 15, w.map.width - 15);
    this.vy = Math.min(this.vy, 0);
    G.FX.flash(this.x, this.y - 35, 60, el); G.FX.ring(this.x, this.y - 30, 60, el); G.FX.burst(this.x, this.y - 30, el, 14);
  }

  doAttack(sk, lv, w, el, fromPre) {
    const a = sk.atk, pct = a.pct(lv);
    // 1.7.10: 스킬별 동작·연출 (src/systems/skillx.js)
    const X = G.SKILL_X[sk.id];
    if (X && X.aim && !fromPre && G.SkillX.pre(this, sk, lv, w, el)) return;
    const xh = X ? G.SkillX.hitFn(this, X, el, w, pct) : null, kind = (X && X.proj) || a.proj;
    this.sx = this.x;
    this.atkT = 0;
    this.atkKind = ['melee', 'aoe', 'dash'].includes(a.kind) ? 'melee' : 'proj';
    const onHit = (m, i) => { G.Combat.hit(this, m, pct, i || 0, el); if (xh) xh(m); };
    switch (a.kind) {
      case 'melee': {
        this.hitArea(w, this.frontRect(a.w, a.h), a.targets, pct, a.hits, el, xh);
        G.FX.slash(this.x + this.dir * a.w * 0.4, this.y - 40, this.dir, a.w * 1.2, a.h * 1.1, el);
        G.FX.flash(this.x + this.dir * a.w * 0.5, this.y - 40, 50, el);
        if (a.hits > 1) setTimeout(() => G.FX.slash(this.x + this.dir * a.w * 0.4, this.y - 34, -this.dir, a.w * 1.1, a.h * 0.9, el), 90);
        break;
      }
      case 'aoe': {
        this.hitArea(w, { x: this.x - a.w / 2, y: this.y - a.h, w: a.w, h: a.h + 6 }, a.targets, pct, a.hits, el, xh);
        if (a.fx === 'whirl') G.FX.whirl(this.x, this.y - 35, a.w / 2, el);
        else G.FX.shock(this.x, this.y - 30, a.w / 2, el);
        G.FX.ring(this.x, this.y - 4, a.w / 2, el, 0.5);
        w.shake(G.Settings.fx === 'high' ? 5 : 2);
        break;
      }
      case 'proj': {
        for (let i = 0; i < a.count; i++) {
          const off = i - (a.count - 1) / 2, ang = off * (a.spread || 0);
          this.shoot(w, {
            kind, y: this.y - 36 + off * (a.stagger || 0), vx: Math.cos(ang) * a.speed * this.dir, vy: Math.sin(ang) * a.speed,
            range: a.range, pierce: a.pierce || 1, r: a.proj === 'orb' ? 12 : 8, color: el, onHit, returnAt: X && X.ret ? a.range * 0.5 : 0,
          });
        }
        G.FX.flash(this.x + this.dir * 26, this.y - 36, 30, el);
        break;
      }
      case 'rain': {
        // 2.1: 사거리 안에 보스 · 정예가 있으면 그 적을 중심으로, 폭은 절반 (일반 사냥은 지금처럼)
        const reach = a.ahead + a.area / 2 + 60;
        const tgt = w.monsters.filter(m => !m.dead && (m.isBoss || m.d.kind === 'elite') && Math.sign(m.x - this.x || this.dir) === this.dir && Math.abs(m.x - this.x) <= reach)
          .sort((p1, p2) => Math.abs(p1.x - this.x) - Math.abs(p2.x - this.x))[0];
        const cx = tgt ? tgt.x : this.x + this.dir * a.ahead, area = tgt ? Math.min(a.area / 2, tgt.w * 1.6 + 60) : a.area;   // 보스 폭에 맞춰 좁힘
        for (let i = 0; i < a.count; i++) {
          const tx = cx + G.U.rand(-area / 2, area / 2);
          const gy = w.groundBelow(tx, this.y - 60);
          G.FX.beam(tx - this.dir * 50, gy - 460, gy, el);
          w.projectiles.push(new G.Projectile({
            x: tx - this.dir * 90, y: this.y - 420 - G.U.rand(0, 140), vx: this.dir * 160, vy: 950, kind: kind || 'arrow', r: a.proj === 'orb' ? 14 : 8,
            owner: 'player', range: 1200, groundY: gy, color: el, onHit,
          }));
        }
        G.FX.flash(cx, this.y - 300, 120, el, 0.35);
        break;
      }
      case 'dash': {
        this.dash = { left: a.dist, speed: 1300, pct, targets: a.targets, hits: a.hits, hit: new Set(), color: el, xh, trail: X && X.trail };
        if (a.invuln) this.invuln = Math.max(this.invuln, a.dist / 1300 + 0.15);
        G.FX.flash(this.x, this.y - 35, 55, el);
        break;
      }
      case 'back': {
        G.FX.ghost(this.drawOpts(1), el); G.FX.burst(this.x, this.y - 20, el, 8);
        this.x = G.U.clamp(this.x - this.dir * a.dist, 15, w.map.width - 15);
        this.shoot(w, { kind, vx: this.dir * a.speed, range: a.range, pierce: a.pierce, color: el, onHit });
        G.FX.flash(this.x + this.dir * 26, this.y - 36, 36, el);
        break;
      }
    }
    if (X) G.SkillX.after(this, sk, X, pct, w, el, a);
  }

  // 회복 (치유 효율 / 절망 반영). quiet: 숫자 표시 안 함
  heal(n, quiet) {
    if (n <= 0 || this.dead) return;
    const eff = this.st.fx('healEff');
    n = Math.round(n * (1 + (eff ? eff.v : 0) / 100) * (this.despair ? 1 - this.despair.cut / 100 : 1));
    this.hp = Math.min(this.st.maxHP, this.hp + n);
    if (!quiet) G.FX.dmg(this.x, this.y - 80, n, 'heal');
  }
  healMp(n, quiet) {
    if (n <= 0 || this.dead) return;
    this.mp = Math.min(this.st.maxMP, this.mp + n);
    if (!quiet) G.FX.dmg(this.x + 16, this.y - 70, n, 'mp');
  }
  // 무적/방어를 무시하는 피해 (보스 장판, 절망)
  trueDamage(n) {
    if (this.dead) return;
    n = Math.max(1, Math.round(n));
    this.hp -= n; G.FX.dmg(this.x, this.y - 78, n, 'hurt');
    if (this.hp <= 0) this.die();
  }
  miss(text) { G.FX.text(this.x, this.y - 84, text, '#bfe6ff', 16, 0.8); }

  hurt(raw, fromX, opt = {}) {
    if (this.dead || this.invuln > 0) return;
    const s = this.st, src = opt.src;
    // 암흑에 걸린 몬스터의 공격은 빗나갈 수 있음
    if (src && src.status && src.status.dark && Math.random() * 100 < src.status.dark.v) { this.miss('MISS'); this.invuln = 0.3; return; }
    let f = s.fx('ignore');
    if (f && Math.random() * 100 < f.p) { this.miss('회피!'); this.invuln = 0.5; return; }
    f = s.fx('guard');
    if (f && Math.random() * 100 < f.p) { this.miss('무적!'); this.invuln = f.v; G.FX.ring(this.x, this.y - 30, 60, '#fff3a0'); return; }
    let d;
    if (opt.pct) d = s.maxHP * opt.pct / 100;
    else d = raw * (1 - s.def / (s.def + 50 + 10 * this.d.level)) * G.U.rand(0.9, 1.1);
    d = Math.max(1, Math.round(d));
    if (this.barrier > 0) {   // 별의 장막이 먼저 막는다
      const ab = Math.min(this.barrier, d);
      this.barrier -= ab; d -= ab;
      G.FX.text(this.x + 20, this.y - 60, `장막 -${ab}`, '#bfe6ff', 12, 0.6);
      if (this.barrier <= 0) { G.FX.burst(this.x, this.y - 35, '#bfe6ff', 12, 180); G.UI.log('별의 장막이 깨졌습니다.', '#9ad8ff'); }
      if (d <= 0) return;
    }
    f = s.fx('reflect');
    if (src && !src.dead && f && Math.random() * 100 < f.p) {
      let r = Math.round(d * f.v / 100);
      if (src.isBoss) r = Math.min(r, Math.round(src.maxHp * 0.01));
      if (r > 0) { src.takeDamage(r, this); G.FX.dmg(src.x, src.y - src.h - 8, r, 'mp'); G.FX.text(src.x, src.y - src.h - 34, '반사', '#bfe6ff', 12, 0.7); }
    }
    const ifr = s.fx('iframe');
    this.hp -= d; this.invuln = 1.0 + (ifr ? ifr.v : 0);
    G.FX.dmg(this.x, this.y - 78, d, 'hurt'); G.Audio.play('hurt');
    if (!this.dash) { this.kbX = Math.sign(this.x - fromX || -this.dir) * (src && src.isBoss ? 160 : 260);   // 2.1 보스는 덜 밀어냄
      this.vy = -280; this.onGround = false; this.adash = 0; }
    if (opt.slow) this.slowT = opt.slow;
    if (opt.poison) this.poison = { dps: s.maxHP * opt.poison.pct / 100, left: opt.poison.dur, tick: 1 };
    if (this.hp <= 0) this.die();
  }

  die() {
    if (this.dead) return;
    // 1.7.12 연희의 별 부적: 한 번 HP 1로 버팀 (재사용 3분)
    const pd = this.d.eq.pendant;
    if (pd && G.ITEMS[pd.tid] && G.ITEMS[pd.tid].cheer && !(this.cheerCd > 0)) {
      this.hp = 1; this.cheerCd = 180; this.invuln = Math.max(this.invuln, 1.5); this.poison = null;
      G.FX.text(this.x, this.y - 110, '힘내요!', '#ffc8e8', 22, 1.6); G.Sound.play('cheer'); G.FX.stars(this.x, this.y - 60, 14); G.FX.ring(this.x, this.y - 35, 70, '#ffc8e8', 0.8);
      G.UI.log('연희의 응원! 별 부적이 쓰러지지 않게 지켜 줬어요. (재사용 3분)', '#ffc8e8');
      return;
    }
    this.dead = true; this.hp = 0; this.poison = null; this.dash = null; this.adash = 0;
    const lose = this.d.level >= G.F.MAX_LEVEL ? 0 : Math.min(this.d.exp, Math.round(G.F.expToNext(this.d.level) * G.F.deathExpLoss));
    this.d.exp -= lose;
    G.UI.showDeath(lose);
  }
  revive() {
    this.dead = false; this.invuln = 2; this.buffs = {}; this.despair = null; this.slowT = 0; this.silence = this.invert = this.noPotion = 0; this.recalc();
    this.hp = Math.ceil(this.st.maxHP * 0.5); this.mp = Math.ceil(this.st.maxMP * 0.5);
    G.Game.reviving = true; G.Game.changeMap(this.d.town || 'sprout_port', null); G.Game.reviving = false;   // 1.7.2: 보스 체크포인트 유지
  }

  // ---------------- 성장 ----------------
  gainExp(n) {
    if (this.d.level >= G.F.MAX_LEVEL || n <= 0) return;
    this.d.exp += n;
    let need = G.F.expToNext(this.d.level);
    while (this.d.exp >= need && this.d.level < G.F.MAX_LEVEL) {
      this.d.exp -= need;
      this.levelUp();
      need = G.F.expToNext(this.d.level);
    }
    if (this.d.level >= G.F.MAX_LEVEL) this.d.exp = 0;
  }
  levelUp() {
    const d = this.d;
    d.level++;
    // 1.6.1: 레벨당 능력 포인트 4 + 직업 주스탯 자동 +1 (표류자는 5를 직접 배분)
    if (d.job === 'beginner') d.ap += G.F.AP_PER_LEVEL + G.F.AUTO_STAT;
    else { d.ap += G.F.AP_PER_LEVEL; d.base[G.JOBS[d.job].main] += G.F.AUTO_STAT; }
    d.sp += G.F.spFor(d.level);
    this.recalc();
    this.hp = this.st.maxHP; this.mp = this.st.maxMP;
    G.FX.pillar(this.x, this.y, '#ffe06a'); G.FX.ring(this.x, this.y - 30, 120, '#ffe06a', 0.8);
    G.FX.stars(this.x, this.y - 50, 14); G.FX.burst(this.x, this.y - 40, '#ffe06a', 30, 300);
    G.UI.banner('LEVEL UP!', `Lv.${d.level} · 능력 포인트 +${d.job === 'beginner' ? G.F.AP_PER_LEVEL + G.F.AUTO_STAT : `${G.F.AP_PER_LEVEL} · ${G.STAT_NAMES[G.JOBS[d.job].main]} +${G.F.AUTO_STAT}`}${d.level >= 10 ? ` · 기술 포인트 +${G.F.spFor(d.level)}` : ''}`);
    const adv = { 10: [0, '각성 Ⅰ'], 30: [1, '각성 Ⅱ'], 60: [2, '각성 Ⅲ'], 85: [3, '각성 Ⅳ'] }[d.level];   // 2.1.2: 지금 직업의 다음 차수일 때만
    if (adv && G.JOBS[d.job].tier === adv[0]) G.UI.log(`${adv[1]} 시험을 받을 수 있는 레벨입니다! 퀘스트 창(Q)의 "시작 가능" 탭을 확인하세요.`, '#ffe08a');
    G.UI.log(`레벨 ${d.level} 달성! 남은 능력 포인트 ${d.ap} (S 키로 배분)`, '#ffe06a');
    G.Audio.play('levelup');
    G.UI.dirty();
  }
  addAP(stat, n) {
    n = Math.min(n, this.d.ap);
    if (n <= 0) return;
    this.d.base[stat] += n; this.d.ap -= n;
    G.Tutorial.ev('ap');
    this.recalc(); G.UI.dirty();
  }
  addSP(id) {
    const sk = G.SKILLS[id], d = this.d;
    if (!sk || sk.fixed || d.sp <= 0 || !G.jobChain(d.job).includes(sk.job)) return;
    const lv = d.skills[id] || 0;
    if (lv >= sk.maxLv) return;
    d.skills[id] = lv + 1; d.sp--;
    if (lv === 0 && sk.type !== 'passive' && sk.type !== 'toggle' && !d.hot.includes(id)) {
      const i = d.hot.indexOf(null);
      if (i >= 0) { d.hot[i] = id; G.UI.log(`${sk.name} → 단축키 ${i + 1}번에 등록`, '#ffe08a'); }
    }
    this.recalc(); G.UI.dirty();
  }
  setHotkey(id, i) {
    const d = this.d;
    const prev = d.hot.indexOf(id);
    if (prev >= 0) d.hot[prev] = null;
    if (prev !== i) d.hot[i] = id;
    G.UI.dirty();
  }
  changeJob(job) {
    const d = this.d, first = d.job === 'beginner';
    if (first) {   // 각성 Ⅰ 때만 능력 포인트 반환 (주스탯이 바뀌므로)
      const spent = G.STATS4.reduce((n, k) => n + d.base[k] - 4, 0);
      for (const k of G.STATS4) d.base[k] = 4;
      d.ap += spent;
    }
    d.job = job;
    for (const sk of G.skillsOfJob(job)) if (d.skills[sk.id] == null) d.skills[sk.id] = 0;
    if (!first) d.sp += 5;
    this.recalc();
    this.hp = this.st.maxHP; this.mp = this.st.maxMP;
    const J = G.JOBS[job];
    // 1.6.1: 각성 연출 — 별빛 기둥 + 별 + 문양 빛남
    G.FX.pillar(this.x, this.y, '#fff0a0'); G.FX.ring(this.x, this.y - 40, 80, '#ffe08a', 0.9); G.FX.stars(this.x, this.y - 60, 20);
    this.markGlow = 2.5; this.markColor = '#ffe08a'; G.Audio.play('levelup');
    if (first) {
      G.UI.banner(`${J.name} 각성!`, `능력 포인트 ${d.ap} 반환 · S 키로 다시 배분하세요`);
      G.UI.log(`${J.name}(으)로 각성했습니다! 지금까지 쓴 능력 포인트가 모두 돌아왔습니다. (주스탯: ${G.STAT_NAMES[J.main]})`, '#ffe06a');
    } else {
      G.UI.banner(`${G.tierName(J.tier)}: ${J.name}!`, '새로운 스킬을 배울 수 있습니다 · 보너스 기술 포인트 +5');
      G.UI.log(`${J.name}(으)로 각성했습니다! K 키로 스킬창을 열어 새 스킬을 익히세요.`, '#ffe06a');
    }
    G.FX.pillar(this.x, this.y, G.JOBS[job].color); G.FX.ring(this.x, this.y - 30, 140, G.JOBS[job].color, 1);
    G.FX.stars(this.x, this.y - 50, 16); G.FX.burst(this.x, this.y - 40, G.JOBS[job].color, 40, 320);
  }

  // ---------------- 아이템 ----------------
  equip(idx) {
    const d = this.d, it = d.inv.equip[idx];
    if (!it) return;
    const t = G.ITEMS[it.tid], err = G.Items.canEquip(this, t);
    if (err) { G.UI.log(err, '#ff7a7a'); G.Audio.play('error'); return; }
    let slot = t.slot;
    if (slot === 'ring') slot = !d.eq.ring1 ? 'ring1' : !d.eq.ring2 ? 'ring2' : 'ring1';
    d.inv.equip[idx] = d.eq[slot] || null;
    d.eq[slot] = it;
    this.recalc(); G.UI.dirty(); G.Audio.play('pickup');
  }
  unequip(slot) {
    const d = this.d, it = d.eq[slot];
    if (!it) return;
    if (!G.Inv.add(this, it)) { G.UI.log('인벤토리가 가득 찼습니다.', '#ff7a7a'); return; }
    d.eq[slot] = null;
    this.recalc(); G.UI.dirty();
  }
  useItem(idx) {
    const s = this.d.inv.use[idx];
    if (!s) return;
    const t = G.ITEMS[s.tid], u = t.use;
    if (this.dead) return;
    if (u.target) { G.UI.setTarget(u.target, s.tid); return; }
    if (u.tele) { G.Teleport.open(); return; }   // 나침반은 맵을 고른 뒤에 사라진다
    // EXE 빌드: 고정 회복(hp/mp) + 최대치 % 회복(hpP/mpP, 별사탕·별의 정수) + 아이템 재사용 대기(cd)
    const hA = u.hp || (u.hpP ? Math.round(this.st.maxHP * u.hpP / 100) : 0);
    const mA = u.mp || (u.mpP ? Math.round(this.st.maxMP * u.mpP / 100) : 0);
    if ((hA || mA) && this.noPotion > 0) { G.UI.log('저주 상태: 물약을 쓸 수 없습니다.', '#c08cff'); return; }
    if (u.cd && (this.itemCd[s.tid] || 0) > 0) { G.UI.log(`${t.name}은(는) ${Math.ceil(this.itemCd[s.tid])}초 뒤에 다시 쓸 수 있어요.`, '#ffe08a'); return; }
    if (hA || mA) {
      const needH = hA > 0 && this.hp < this.st.maxHP, needM = mA > 0 && this.mp < this.st.maxMP;
      if (!needH && !needM) return;
      if (needH) {
        this.heal(hA);
        G.FX.rise(this.x, this.y - 10, '#ff8a8a', 6);
        G.Tutorial.ev('potion');
      }
      if (needM) {
        this.healMp(mA);
        G.FX.rise(this.x, this.y - 10, '#8ab8ff', 6);
      }
      if (u.cd) { this.itemCd[s.tid] = u.cd; if (u.hpP >= 100) G.FX.pillar(this.x, this.y, '#ffe68a'); }
    }
    if (u.town) G.Game.changeMap(this.d.town || 'sprout_port', null);
    s.qty--;
    if (s.qty <= 0) this.d.inv.use[idx] = null;
    G.Audio.play('pickup'); G.UI.dirty();
  }
  // H·J 칸과 자동 물약이 먹을 물약: 그 종류 물약 → 없으면 별사탕 (별의 정수처럼 재사용 대기가 있는 건 제외)
  potionIdx(kind) {
    const arr = this.d.inv.use;
    const idx = arr.findIndex(s => s && G.ITEMS[s.tid].use[kind]);
    if (idx >= 0) return idx;
    return arr.findIndex(s => s && G.ITEMS[s.tid].use[kind + 'P'] && !G.ITEMS[s.tid].use.cd);
  }
  quickPotion(kind) {
    const idx = this.potionIdx(kind);
    if (idx < 0) { G.UI.log(kind === 'hp' ? 'HP 물약이 없습니다.' : 'MP 물약이 없습니다.', '#ff7a7a'); return; }
    this.useItem(idx);
  }

  // ---------------- 그리기 ----------------
  look() {
    const eq = this.d.eq, it = s => eq[s] ? G.ITEMS[eq[s].tid] : null;
    const top = it('top'), bot = it('bottom');
    return {
      look: G.LOOKS.toDraw(this.d.look, top && top.lv > 0 ? top.color : null, bot && bot.lv > 0 ? bot.color : null),
      hatColor: it('hat') ? it('hat').color : null, cape: it('cape') ? it('cape').color : null,
      weapon: eq.weapon ? G.ITEMS[eq.weapon.tid].type : null, wcolor: it('weapon') ? it('weapon').color : null,
      gear: G.Outfit ? G.Outfit.gearOf(eq) : null,   // 1.9: 부위별 장비 모양
    };
  }
  drawOpts(alpha) {
    return Object.assign(this.look(), {
      x: this.x, y: this.y, dir: this.dir, t: this.t, moving: Math.abs(this.vx) > 1, air: !this.onGround,
      atk: this.atkT, atkKind: this.atkKind, alpha,
    });
  }
  buffColor() {
    const ids = Object.keys(this.buffs);
    return ids.length ? this.buffs[ids[Math.floor(this.t * 2) % ids.length]].color || '#ffe08a' : '#ffe08a';
  }
  draw(ctx) {
    if (Object.keys(this.buffs).length && !this.dead) {
      const c = this.buffColor(), pulse = 1 + Math.sin(this.t * 4) * 0.12;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, 42 * pulse);
      g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.55; ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(this.x, this.y, 42 * pulse, 12 * pulse, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    G.SkillX.aura(ctx, this);   // 1.7.10: 각성 버프의 모습 (등 뒤의 대검 · 날개 등)
    const alpha = this.dead ? 0.35 : (this.invuln > 0 && Math.floor(this.t * 20) % 2 ? 0.45 : (this.dash ? 0.6 : 1));
    G.Draw.humanoid(ctx, this.drawOpts(alpha));
    if (this.barrier > 0 && !this.dead) {
      ctx.save(); ctx.globalAlpha = 0.28 + Math.sin(this.t * 4) * 0.06; ctx.strokeStyle = '#bfe6ff'; ctx.fillStyle = 'rgba(160,210,255,.12)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(this.x, this.y - 34, 30, 42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (this.markGlow > 0) this.drawMark(ctx);
  }
  // 별조각 공명: 손등의 별 문양이 빛난다
  drawMark(ctx) {
    const k = Math.min(1, this.markGlow / 0.6), x = this.x + this.dir * 15, y = this.y - 38, c = this.markColor || '#ffe08a';
    const r = 7 + Math.sin(this.t * 14) * 1.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9 * k;
    const g = ctx.createRadialGradient(x, y, 1, x, y, r * 4);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.fill(); ctx.restore();
  }
};
