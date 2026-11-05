'use strict';
// 현재 맵: 몬스터 스폰/리젠, 드롭, 포탈, NPC, 카메라, 그리기
G.World = class {
  constructor(game) {
    this.game = game; this.player = game.player;
    this.time = 0; this.cam = 0; this.shakeT = 0; this.shakeA = 0; this.fullMsgT = 0;
  }

  load(mapId, portalId) {
    const map = G.MAPS[mapId], pl = this.player;
    // 1.7.2: 2단계 보스 체크포인트는 살아서 보스방을 나가면 사라진다 (쓰러져서 마을로 가면 유지)
    if (this.mapId && this.mapId !== mapId && this.game.ckpt === this.mapId && !this.game.reviving) this.game.ckpt = null;
    this.flyby = null; this.noxEnd = null;
    this.map = map; this.mapId = mapId; this.platforms = map.platforms;
    this.monsters = []; this.projectiles = []; this.drops = []; this.teles = []; this.smoke = null;
    this.zone = null; this.pull = null; this.doom = null; this.half = null; this.bossT = 0; this.mzones = [];
    this.npcs = map.npcs.map(n => ({ id: n.id, x: n.x, y: map.platforms[n.p || 0].y, def: G.NPCS[n.id], t: Math.random() * 10, dir: -1 }));
    this.portals = map.portals.map(p => Object.assign({}, p, { y: map.platforms[p.p || 0].y }));
    this.slots = [];
    for (const s of map.spawns) {
      const plat = map.platforms[s.p || 0], n = s.n || 1, gap = s.gap || 120;
      for (let i = 0; i < n; i++) {
        const slot = { m: s.m, plat, x: s.x + (i - (n - 1) / 2) * gap, timer: 0, mon: null, once: !!map.bossRoom };
        this.slots.push(slot);
        this.spawnSlot(slot);
      }
    }
    let px = map.start != null ? map.start : (map.portals[0] ? map.portals[0].x + 60 : 200);
    if (portalId) { const po = this.portals.find(p => p.id === portalId); if (po) px = po.x; }
    pl.x = px; pl.y = G.GROUND_Y; pl.vx = pl.vy = pl.kbX = 0; pl.onGround = true; pl.plat = map.platforms[0]; pl.dash = null;
    pl.d.map = mapId; pl.d.town = map.home;
    G.FX.clear();
    this.cam = G.U.clamp(px - 640, 0, Math.max(0, map.width - 1280));
    G.Quest.onMap(mapId);
    G.UI.mapChanged(map);
    G.Teleport.visit(mapId);
    if (!G.Chapter.enter(mapId)) G.Music.playMap(mapId);
    if (map.bossRoom && this.game.ckpt === mapId) {   // 1.7.2: 2단계부터 다시
      const a = this.monsters.find(m => m.isBoss && m.d.next);
      if (a) { this.monsters.splice(this.monsters.indexOf(a), 1); this.monsters.push(new G.Monster(a.d.next, a.x, a.plat, { once: true })); }
    }
    if (map.bossRoom) {
      const boss = this.monsters.find(m => m.isBoss);
      if (boss) {
        G.Audio.play('boss');
        if (this.game.ckpt === mapId) G.UI.banner(`${boss.d.name} 등장!`, '체크포인트: 2단계부터 다시 시작합니다');
        else if (boss.d.kind === 'final') G.UI.banner(boss.d.name, '녹스: …또 별이 왔구나. 오백 년 만이다.');   // 1.7.7
        else this.shout(`${boss.d.name} 등장!`);
      }
    }
  }

  spawnSlot(slot) {
    const m = new G.Monster(slot.m, slot.x, slot.plat, slot);
    slot.mon = m; this.monsters.push(m);
    if (this.time > 0) G.FX.burst(m.x, m.y - m.h / 2, '#ffffff', 6, 90);
  }
  spawnMinion(id, x) {
    const m = new G.Monster(id, x, this.platforms[0], null);
    m.aggro = 10; this.monsters.push(m);
    G.FX.burst(m.x, m.y - 30, '#555', 14);
    return m;
  }
  groundBelow(x, y) {
    let best = G.GROUND_Y;
    for (const p of this.platforms) if (x >= p.x && x <= p.x + p.w && p.y >= y - 1 && p.y < best) best = p.y;
    return best;
  }
  telegraph(rect, dur) { this.teles.push(Object.assign({}, rect, { left: dur, max: dur })); }
  shout(text) { G.UI.banner(text, null, 'shout'); }
  shake(a) { this.shakeT = 0.25; this.shakeA = a; }

  interact() {
    const p = this.player;
    for (const po of this.portals) {
      if (!po.hidden && po.to && Math.abs(p.x - po.x) < 45 && Math.abs(p.y - po.y) < 10) { this.game.changeMap(po.to, po.toPortal); return; }
    }
    const ch = this.map.chest;
    if (ch && Math.abs(p.x - ch.x) < 50 && Math.abs(p.y - this.platforms[ch.p].y) < 6) { this.openChest(); return; }
    let best = null, bd = 90;
    for (const n of this.npcs) {
      const dd = Math.abs(n.x - p.x);
      if (dd < bd && Math.abs(n.y - p.y) < 90) { best = n; bd = dd; }
    }
    if (best) G.Dialog.open(best.id);
  }
  // 높은 발판 위 보물상자: 하루 한 번
  today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
  chestOpened() { return this.player.d.chests[this.mapId] === this.today(); }
  openChest() {
    const p = this.player, ch = this.map.chest, y = this.platforms[ch.p].y;
    if (this.chestOpened()) { G.UI.log('오늘은 이미 열어 본 상자입니다. 내일 다시 오세요.', '#9aa6c8'); return; }
    p.d.chests[this.mapId] = this.today();
    const lv = Math.max(...this.map.spawns.map(s => G.MONSTERS[s.m].lv));
    const pot = lv < 15 ? 'pot_orange' : lv < 40 ? 'pot_white' : lv < 70 ? 'pot_hp4' : 'pot_hp5';
    const out = [{ gold: lv * 40 }, { item: { tid: pot, qty: 5 } }];
    if (Math.random() < 0.3) out.push({ item: { tid: G.U.weighted(G.SCROLL_DROP.weights), qty: 1 } });
    if (Math.random() < 0.18) out.push({ item: { tid: 'cube', qty: 1 } });   // 1.6.1: 불꽃석 대신 공명석
    if (Math.random() < 0.2) out.push({ item: { tid: 'scroll_tele', qty: 1 } });
    out.forEach((pl, i) => this.drops.push(new G.Drop(ch.x + (i - 1) * 26, y - 30, pl)));
    G.FX.pillar(ch.x, y, '#ffe680'); G.FX.stars(ch.x, y - 30, 12);
    G.UI.banner('보물상자!', '2단 점프로만 닿는 곳의 보상');
    G.Audio.play('levelup');
    G.Game.save(true);
  }
  clickAt(wx, wy) {
    for (const n of this.npcs) {
      if (wx > n.x - 24 && wx < n.x + 24 && wy > n.y - 80 && wy < n.y + 6) { G.Dialog.open(n.id); return true; }
    }
    return false;
  }

  onKill(m) {
    const p = this.player;
    G.Quest.onKill(m.id);
    G.Tutorial.ev('kill:' + m.id);
    G.Combat.onKillEffects(p);
    if (m.d.echo) {   // 영웅의 잔영 처치 → 녹스 그로기
      const boss = this.monsters.find(x => x.isBoss && !x.dead);
      if (boss) { boss.groggy = 5; if (boss.boss) { boss.boss.cur = null; boss.boss.cleanup(this); } this.shout('잔영이 사라지며 녹스가 무너졌다! (5초 그로기)'); }
    }
    if (m.isBoss) { this.zone = null; this.pull = null; this.doom = null; this.half = null; p.despair = null; p.silence = 0; p.invert = 0; p.noPotion = 0; }
    if (m.d.kind === 'final') {
      const sec = Math.round(m.boss ? m.boss.time : 0);
      // 1.7.7: 무릎 꿇은 녹스의 꺼진 등불에 주인공의 빛이 옮겨붙어 처음으로 켜진다 (약 4초, 임팩트 없이 밝기만)
      this.noxEnd = { x: m.x, y: m.y, dir: m.dir, t: 0, said: false };
      setTimeout(() => G.UI.showVictory(m.d.name, sec), 5200);
    }
    const e = Math.round(m.exp * G.F.expPenalty(p.d.level, m.lv));
    if (e > 0) { p.gainExp(e); G.FX.text(m.x, m.y - m.h - 30, `+${G.U.fmt(e)} EXP`, '#ffe06a', 13); }
    this.dropLoot(m);
    if (m.slot && !m.slot.once) {
      m.slot.mon = null;
      m.slot.timer = G.Quest.killTargets().has(m.id) ? 5 : this.map.respawn;
    }
    if (m.isBoss) {
      for (const x of this.monsters) if (x.d.kind === 'minion' && !x.dead) x.die(this);
      this.smoke = null; this.teles = [];
      if (m.d.next) {   // 1.7.2: 1단계 보스(아우렐리온) → 잠시 뒤 2단계 보스 등장
        G.UI.banner(`${m.d.name}이(가) 공허에서 풀려났다!`, '하지만 아직 끝나지 않았다...');
        G.FX.burst(m.x, m.y - m.h / 2, '#fff0b0', 60, 420); G.FX.pillar(m.x, m.y, '#fff0b0');
        this.game.ckpt = this.mapId;
        const mapId = this.mapId;
        setTimeout(() => this.spawnNextBoss(m, mapId), 2800);
      } else {
        G.UI.banner(`${m.d.name} 처치!`, '보상을 획득하세요');
        G.FX.burst(m.x, m.y - m.h / 2, '#ffe06a', 50, 400);
        if (this.game.ckpt === this.mapId) this.game.ckpt = null;
        if (m.id === 'eldrick' && this.mapId === 'sky_sanctum') setTimeout(() => this.aurelionWakes(), 2600);
      }
    }
    G.UI.dirty();
  }

  // 1.7.2 2단계 보스
  spawnNextBoss(m, mapId) {
    if (this.mapId !== mapId || this.player.dead) return;
    const b = new G.Monster(m.d.next, 1150, this.platforms[0], { once: true });
    b.dir = -1; this.monsters.push(b);
    G.FX.burst(b.x, b.y - 60, '#8a5aff', 40, 300); G.FX.pillar(b.x, b.y, '#8a5aff'); this.shake(8);
    G.Audio.play('boss');
    G.UI.banner(`${b.d.name} 등장!`, '엘드리크: 쓸모없는 짐승 같으니... 내가 직접 상대해 주마!');
  }
  aurelionWakes() {
    if (this.mapId !== 'sky_sanctum' || this.npcs.some(n => n.id === 'aurelion_npc')) return;
    const x = 1300, y = this.platforms[0].y;
    this.npcs.push({ id: 'aurelion_npc', x, y, def: G.NPCS.aurelion_npc, t: 0, dir: -1 });
    G.FX.pillar(x, y, '#fff0b0'); G.FX.burst(x, y - 50, '#fff0b0', 30, 300);
    G.UI.banner('아우렐리온: 고맙다, 작은 별이여.', '500년 전, 우리 두 용은 일곱 영웅과 함께 날았지. 하이델은... 아직 북쪽에 있는가.');
  }

  dropLoot(m) {
    const d = m.d, p = this.player, out = [];
    if (d.noLoot) return;
    const fitPick = pool => {
      const fam = G.familyOf(p.d.job);
      const fit = pool.filter(t => G.ITEMS[t].job === fam || G.ITEMS[t].job === 'any');
      return G.U.pick(fit.length ? fit : pool);
    };
    if (m.isBoss) {
      for (let i = 0; i < 5; i++) out.push({ gold: G.F.gold(m.lv) * 6 });
      for (const b of d.bossDrops || []) {
        if (b.scrolls) {   // 보스 난이도별 주문서 (최소 3장)
          for (let i = 0; i < Math.round(b.scrolls * 1.6); i++) out.push({ item: { tid: 'scroll_100', qty: 1 } });   // 1.6.1: 별빛 각인서 한 종류 (장수 1.6배)
          continue;
        }
        if (b.goldBag) { if (Math.random() < b.ch) out.push({ gold: G.F.gold(m.lv) * b.goldBag }); continue; }   // 1.6.1: 불꽃석 자리의 골드 꾸러미
        if (b.pity) {   // 1.5: 세트 무기 보증. 4번 연속 안 나오면 5번째에 확정
          const pc = p.d.pity || (p.d.pity = {}), miss = pc[b.pity] || 0;
          if (miss < 4 && Math.random() >= b.ch) { pc[b.pity] = miss + 1; continue; }
          pc[b.pity] = 0;
          if (miss >= 4) G.UI.log(`[보증] ${d.name}에게서 세트 무기가 확정으로 나왔습니다!`, '#ffe08a');
        } else if (Math.random() >= b.ch) continue;
        const tid = b.pool ? fitPick(b.pool) : b.id;
        out.push({ item: G.Items.create(tid, { boss: true, qty: b.qty || 1 }) });
      }
    } else {
      if (d.kind !== 'minion' && Math.random() < 0.75) out.push({ gold: G.F.gold(m.lv) });
      for (const qid of d.quest || []) {
        if (!G.Quest.needsItem(qid)) continue;
        const pity = p.pity[qid] || 0;
        if (Math.random() < 0.4 || pity >= 5) { out.push({ item: { tid: qid, qty: 1 } }); p.pity[qid] = 0; }
        else p.pity[qid] = pity + 1;
      }
      if (Math.random() < 0.10) out.push({ item: { tid: m.lv < 8 ? 'pot_red' : m.lv < 15 ? 'pot_orange' : 'pot_white', qty: 1 } });
      if (Math.random() < 0.05) out.push({ item: { tid: 'pot_blue', qty: 1 } });
      if (d.kind !== 'minion' && Math.random() < G.SCROLL_DROP.chance * (d.kind === 'elite' ? 3 : 1)) {
        out.push({ item: { tid: G.U.weighted(G.SCROLL_DROP.weights), qty: 1 } });
      }
      if (Math.random() < 0.06) {
        const pool = Object.values(G.ITEMS).filter(t => t.cat === 'equip' && !t.noDrop && t.lv <= m.lv && t.lv >= m.lv - 9);
        if (pool.length) out.push({ item: G.Items.create(G.U.pick(pool).id) });
      }
      for (const dr of d.drops || []) if (Math.random() < dr.ch) out.push({ item: G.Items.create(fitPick(dr.pool)) });
    }
    out.forEach((pl, i) => {
      const dr = new G.Drop(m.x + (i - (out.length - 1) / 2) * 24, m.y - 20, pl);
      this.drops.push(dr);
    });
  }

  pickup(dr) {
    const p = this.player, pl = dr.payload;
    if (pl.gold != null) {
      p.d.gold += pl.gold; dr.dead = true;
      G.FX.text(dr.x, dr.y - 34, `+${pl.gold} 골드`, '#ffd54a', 15, 1);
      G.FX.burst(dr.x, dr.y - 14, '#ffd54a', 6, 140);
      G.UI.log(`골드 +${G.U.fmt(pl.gold)}`, '#ffd54a');
      G.Audio.play('coin'); G.UI.dirty();
      return;
    } else {
      const t = G.ITEMS[pl.item.tid], qty = pl.item.qty || 1;
      if (!G.Inv.add(p, pl.item)) {
        if (this.fullMsgT <= 0) { G.UI.log(`${G.Inv.TABS[t.cat]} 인벤토리가 가득 찼습니다.`, '#ff7a7a'); this.fullMsgT = 3; }
        return;
      }
      dr.dead = true;
      const g = pl.item.grade || 0;
      G.UI.log(`${t.name}${qty > 1 ? ' ×' + qty : ''} 획득${g ? ` (${G.GRADES[g].name})` : ''}`, g ? G.GRADES[g].color : '#dfe5f7');
    }
    G.Audio.play('pickup'); G.UI.dirty();
  }

  update(dt) {
    this.time += dt;
    if (this.fullMsgT > 0) this.fullMsgT -= dt;
    const p = this.player;
    p.update(dt, this);
    for (const m of this.monsters) m.update(dt, this);
    this.monsters = this.monsters.filter(m => !(m.dead && m.deadT > 0.9));   // 1.6: 쓰러지는 동작을 보여 주고 사라짐
    for (const pr of this.projectiles) pr.update(dt, this);
    this.projectiles = this.projectiles.filter(pr => !pr.dead);
    for (const dr of this.drops) {
      dr.update(dt, this);
      if (!dr.dead && dr.landed && !p.dead && G.U.overlap(dr.box, p.box)) this.pickup(dr);
    }
    this.drops = this.drops.filter(dr => !dr.dead);
    for (const s of this.slots) {
      if (s.mon || s.once) continue;
      s.timer -= dt;
      if (s.timer <= 0) {
        if (Math.abs(p.x - s.x) < 120 && Math.abs(p.y - s.plat.y) < 100) s.timer = 1;
        else this.spawnSlot(s);
      }
    }
    for (const t of this.teles) t.left -= dt;
    this.teles = this.teles.filter(t => t.left > 0);
    if (this.smoke) { this.smoke.left -= dt; if (this.smoke.left <= 0) this.smoke = null; }
    this.updateBossFields(dt);
    G.MonSkill.updateWorld(dt, this);
    if (this.flyby) { this.flyby.t += dt; if (this.flyby.t >= this.flyby.dur) this.flyby = null; }
    if (this.noxEnd) { const e = this.noxEnd; e.t += dt; if (!e.lit && e.t > 1.2) { e.lit = true; G.Sound.play('lantern'); }   // 1.8 등불이 켜지는 소리
      if (!e.said && e.t > 2.6) { e.said = true; G.UI.banner('녹스', '…따뜻하구나. 이것이… 별빛인가.'); } }
    for (const n of this.npcs) { n.t += dt; if (Math.abs(p.x - n.x) < 300) n.dir = Math.sign(p.x - n.x) || n.dir; }
    const target = G.U.clamp(p.x - 640, 0, Math.max(0, this.map.width - 1280));
    this.cam += (target - this.cam) * Math.min(1, dt * 8);
    if (this.shakeT > 0) this.shakeT -= dt;
    G.FX.update(dt);
  }

  // ---------------- 그리기 ----------------
  nameTag(ctx, x, y, text, color, sub) {
    ctx.font = 'bold 12px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center';
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = 'rgba(10,12,22,.7)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w, 18, 4); ctx.fill();
    ctx.fillStyle = color; ctx.fillText(text, x, y + 13);
    if (sub) {
      ctx.font = '11px "Malgun Gothic", sans-serif';
      const w2 = ctx.measureText(sub).width + 10;
      ctx.fillStyle = 'rgba(10,12,22,.55)'; ctx.beginPath(); ctx.roundRect(x - w2 / 2, y + 20, w2, 16, 4); ctx.fill();
      ctx.fillStyle = '#c9d1ea'; ctx.fillText(sub, x, y + 32);
    }
  }

  // 최종 보스 장판: 공허 잠식 / 빨아들이기 / 종말의 별
  updateBossFields(dt) {
    const p = this.player;
    if (this.zone) {
      const z = this.zone, cx = this.map.width / 2;
      z.left -= dt; z.tick -= dt;
      z.cur = z.safe + (cx - z.safe) * Math.max(0, z.left / z.max) ** 0.5;   // 안전 구역이 점점 좁아짐
      const onHigh = p.onGround && p.plat && p.plat.high;   // 높은 발판 위는 안전
      if (z.tick <= 0) { z.tick = 1; if (!p.dead && !onHigh && Math.abs(p.x - cx) > z.cur) p.trueDamage(p.st.maxHP * z.dmg / 100); }
      if (z.left <= 0) this.zone = null;
    }
    if (this.half) {
      const h = this.half, cx = this.map.width / 2;
      h.left -= dt; h.tick -= dt;
      const inSide = h.side < 0 ? p.x < cx : p.x >= cx, inBand = !h.ground || p.y > G.GROUND_Y - 100;
      if (h.tick <= 0) { h.tick = 1; if (!p.dead && inSide && inBand) { p.trueDamage(p.st.maxHP * h.dmg / 100); if (h.ground) p.slowT = 1.2; } }
      if (h.left <= 0) this.half = null;
    }
    if (this.pull) {
      const u = this.pull, src = u.src;
      u.left -= dt; u.tick -= dt;
      if (!src.dead && !p.dead) {
        p.x += Math.sign(src.x - p.x) * u.force * dt;
        if (Math.random() < 0.5) G.FX.add({ k: 'line', x: p.x + G.U.rand(-200, 200), y: p.y - G.U.rand(10, 90), dir: Math.sign(p.x - src.x) || 1, len: 40, life: 0.3, color: 'rgba(225,228,255,.85)' });
        if (u.tick <= 0) { u.tick = 0.5; if (Math.abs(p.x - src.x) < 160) p.trueDamage(p.st.maxHP * u.dmg / 200); }
      }
      if (u.left <= 0 || src.dead) this.pull = null;
    }
    if (this.doom) this.doom.left -= dt;
    if (this.monsters.some(m => m.isBoss && !m.dead)) this.bossT += dt;
  }
  drawBossFields(ctx) {
    const cam = this.cam;
    if (this.zone) {
      const z = this.zone, cx = this.map.width / 2 - cam;
      ctx.save(); ctx.fillStyle = 'rgba(4,4,16,.72)';   // 1.7.7: 녹스의 밤
      ctx.fillRect(0, 0, Math.max(0, cx - z.cur), 720); ctx.fillRect(cx + z.cur, 0, 1280, 720);
      ctx.strokeStyle = '#b8b0f0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - z.cur, 0); ctx.lineTo(cx - z.cur, 720); ctx.moveTo(cx + z.cur, 0); ctx.lineTo(cx + z.cur, 720); ctx.stroke();
      ctx.restore();
    }
    if (this.half) {
      const h = this.half, cx = this.map.width / 2 - cam;
      ctx.save(); ctx.fillStyle = `rgba(150,60,200,${0.25 + Math.sin(this.time * 6) * 0.08})`;
      const y0 = h.ground ? G.GROUND_Y - 100 : 0, hh = h.ground ? 110 : 720;
      if (h.side < 0) ctx.fillRect(0, y0, Math.max(0, cx), hh); else ctx.fillRect(cx, y0, 1280, hh);
      ctx.restore();
    }
    if (this.doom) {
      const d = this.doom, y = G.GROUND_Y;
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.5 * (1 - d.left / d.max)})`; ctx.fillRect(0, 0, 1280, 720);
      for (const zx of d.zones) {
        const x = zx - cam;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y, 10, x, y, d.r * 1.4);
        g.addColorStop(0, 'rgba(255,240,160,.6)'); g.addColorStop(1, 'rgba(255,240,160,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, d.r * 1.4, d.r * 1.8, 0, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, d.r, d.r * 1.3, 0, Math.PI, 0); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.font = '900 80px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.lineWidth = 8; ctx.strokeStyle = '#3a0010';
      const n = Math.max(1, Math.ceil(d.left));
      ctx.strokeText(n, 640, 300); ctx.fillStyle = '#ff5070'; ctx.fillText(n, 640, 300);
      ctx.font = 'bold 18px "Malgun Gothic"'; ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeText(d.label, 640, 335); ctx.fillText(d.label, 640, 335);
      ctx.restore();
    }
    if (this.player.despair) {
      ctx.save(); ctx.fillStyle = 'rgba(60,60,70,.28)'; ctx.fillRect(0, 0, 1280, 720); ctx.restore();
    }
  }

  // 왼쪽 위 미니맵
  drawMinimap(ctx) {
    const map = this.map, W = 230, H = 74, X = 14, Y = 82, sc = W / map.width;
    const my = y => Y + 8 + (y - 250) / (G.GROUND_Y - 250) * (H - 16);
    ctx.save();
    ctx.fillStyle = 'rgba(10,12,22,.72)'; ctx.strokeStyle = 'rgba(120,140,190,.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(X, Y, W, H, 6); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,210,240,.55)'; ctx.lineWidth = 2;
    for (const p of map.platforms) { ctx.beginPath(); ctx.moveTo(X + p.x * sc, my(p.y)); ctx.lineTo(X + (p.x + p.w) * sc, my(p.y)); ctx.stroke(); }
    for (const po of this.portals) if (!po.hidden) G.Draw.ell(ctx, X + po.x * sc, my(po.y) - 5, 3, 4, '#6ab8ff');
    for (const n of this.npcs) G.Draw.ell(ctx, X + n.x * sc, my(n.y) - 4, 2.5, 2.5, '#ffd54a');
    for (const m of this.monsters) if (!m.dead) G.Draw.ell(ctx, X + m.x * sc, my(m.y) - 3, m.isBoss ? 4 : 2, m.isBoss ? 4 : 2, '#ff5a5a');
    const tx = G.Nav.targetX(this);
    if (tx != null && Math.floor(this.time * 4) % 2) G.Draw.ell(ctx, X + tx * sc, Y + 6, 3, 3, '#ffd54a');
    const p = this.player;
    G.Draw.ell(ctx, X + p.x * sc, my(p.y) - 4, 3.5, 3.5, '#ffffff', '#000', 1);
    ctx.restore();
  }

  draw(ctx) {
    const th = G.BG.THEMES[this.map.theme], p = this.player;
    G.BG.sky(ctx, th, this.cam, this.time);
    ctx.save();
    const sx = this.shakeT > 0 ? G.U.rand(-this.shakeA, this.shakeA) : 0;
    ctx.translate(-Math.round(this.cam) + sx, 0);
    G.BG.deco(ctx, this.map, this.time);
    G.BG.platforms(ctx, this.map, th);

    for (const po of this.portals) {
      if (po.hidden) continue;
      const pulse = 1 + Math.sin(this.time * 4) * 0.08;
      const g = ctx.createRadialGradient(po.x, po.y - 45, 4, po.x, po.y - 45, 50 * pulse);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.4, 'rgba(120,200,255,.6)'); g.addColorStop(1, 'rgba(80,140,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(po.x, po.y - 45, 30 * pulse, 48 * pulse, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200,240,255,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(po.x, po.y - 45, 22, 40, 0, this.time * 3, this.time * 3 + 4); ctx.stroke();
      const label = po.label || (G.MAPS[po.to] && G.MAPS[po.to].name);
      if (label) this.nameTag(ctx, po.x, po.y - 118, '▲ ' + label, '#bfe6ff');
    }
    if (this.map.chest) {
      const ch = this.map.chest, y = this.platforms[ch.p].y, open = this.chestOpened();
      ctx.save(); ctx.translate(ch.x, y);
      if (!open) { const g = ctx.createRadialGradient(0, -16, 4, 0, -16, 46); g.addColorStop(0, 'rgba(255,220,100,.45)'); g.addColorStop(1, 'rgba(255,220,100,0)'); ctx.fillStyle = g; ctx.fillRect(-46, -62, 92, 92); }
      G.Draw.rrect(ctx, -20, -26, 40, 26, 3, open ? '#6a4a2a' : '#9a5a2a', '#3a2010');
      ctx.fillStyle = open ? '#4a3018' : '#c08030';
      ctx.beginPath(); ctx.moveTo(-20, -26); ctx.quadraticCurveTo(0, open ? -50 : -40, 20, -26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd54a'; ctx.fillRect(-4, -22, 8, 9);
      ctx.restore();
      if (!open && Math.abs(this.player.x - ch.x) < 50 && Math.abs(this.player.y - y) < 6) this.nameTag(ctx, ch.x, y - 62, '↑ 열기', '#ffe08a');
    }
    for (const t of this.teles) {
      const a = 0.18 + 0.22 * (Math.floor(t.left * 10) % 2);
      ctx.fillStyle = `rgba(255,40,40,${a})`; ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = 'rgba(255,60,60,.9)'; ctx.lineWidth = 2; ctx.strokeRect(t.x, t.y, t.w, t.h);
    }
    for (const n of this.npcs) {
      G.Draw.humanoid(ctx, { x: n.x, y: n.y, dir: n.dir, t: n.t, look: Object.assign({ skin: '#ffe0c2' }, n.def.look), atk: -1 });
      if (n.def.pin) {   // 1.7.12 연희의 별 머리핀
        const px = n.x - (n.dir || 1) * 7, py = n.y - 76; ctx.fillStyle = n.def.pin; ctx.strokeStyle = '#a07a10'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.4 : 5.6, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      this.nameTag(ctx, n.x, n.y + 6, n.def.name, '#ffe08a', n.def.title);
      const mk = G.Quest.marker(n.id);
      if (mk) {
        const by = n.y - 92 + Math.sin(this.time * 5) * 4;
        ctx.font = '900 30px "Malgun Gothic"'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#2a1a00';
        ctx.strokeText(mk.ch, n.x, by); ctx.fillStyle = mk.ch === '?' ? '#7dff9a' : (mk.main ? '#ffcf3a' : '#5ab8ff'); ctx.fillText(mk.ch, n.x, by);
      }
    }
    G.MonSkill.drawWorld(ctx, this);
    if (this.noxEnd && G.NoxArt) {   // 1.7.7 등불 장면 (월드 좌표)
      const e = this.noxEnd, k = G.U.clamp((e.t - 1.2) / 1.8, 0, 1), sc = 230 / 240, dir = Math.sign(this.player.x - e.x) || 1, hx = Math.abs(this.player.x - e.x) / sc;
      ctx.save(); ctx.translate(e.x, e.y); ctx.scale(dir * sc, sc);
      G.NoxArt.lit(ctx, this.time, k, '#141432', hx); ctx.restore();
    }
    for (const dr of this.drops) dr.draw(ctx);
    for (const m of this.monsters) m.draw(ctx);
    p.draw(ctx);
    this.nameTag(ctx, p.x, p.y + 6, p.d.name, '#ffffff');
    for (const pr of this.projectiles) pr.draw(ctx);
    G.FX.draw(ctx);
    ctx.restore();

    if (th.dark) {
      const v = ctx.createRadialGradient(640, 380, 300, 640, 380, 820);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, 1280, 720);
    }
    if (this.smoke) {
      const px = p.x - this.cam, py = p.y - 35;
      const g = ctx.createRadialGradient(px, py, this.smoke.r * 0.6, px, py, this.smoke.r * 1.4);
      g.addColorStop(0, 'rgba(20,20,24,0)'); g.addColorStop(1, `rgba(20,20,24,${Math.min(0.96, this.smoke.left * 2)})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
    }
    this.drawBossFields(ctx);
    if (this.flyby && G.MonArt.aurelion) {   // 1.7.2: 녹스전 — 아우렐리온이 하늘을 가로지른다 (화면 좌표)
      const k = this.flyby.t / this.flyby.dur, fake = { x: -260 + k * 1800, y: 230 + Math.sin(k * Math.PI) * -40, w: 200, h: 180, dir: 1, dead: false, deadT: 0, hurtT: 0, atkAnim: -1, aggro: 0, moving: false, d: G.MONSTERS.aurelion, id: 'aurelion', purified: true, soarY: 40 };
      ctx.save(); ctx.globalAlpha = Math.min(1, Math.sin(k * Math.PI) * 2.5); ctx.translate(fake.x, fake.y); ctx.scale(0.7, 0.7);
      G.MonArt.aurelion.draw(ctx, fake, this.time, { walk: 0, atk: 0, hurt: 0, die: 0, t: this.time }); ctx.restore();
    }
    G.Nav.draw(ctx, this);
    if (G.Settings.minimap) this.drawMinimap(ctx);
    const boss = this.monsters.find(m => m.isBoss && !m.dead);
    if (boss) {
      const w = 600, x = 340, y = 52;
      ctx.fillStyle = 'rgba(10,8,16,.85)'; ctx.beginPath(); ctx.roundRect(x - 4, y - 22, w + 8, 44, 6); ctx.fill();
      ctx.font = 'bold 13px "Malgun Gothic"'; ctx.textAlign = 'left'; ctx.fillStyle = '#ffcf6a';
      ctx.fillText(`Lv.${boss.lv} ${boss.d.name}`, x + 4, y - 6);
      ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
      ctx.fillText(`${G.U.fmt(boss.hp)} / ${G.U.fmt(boss.maxHp)}  (${(boss.hp / boss.maxHp * 100).toFixed(1)}%)`, x + w - 4, y - 6);
      const en = boss.boss && boss.boss.data.enrage;
      if (en) {
        const left = Math.max(0, en - boss.boss.time), mm = Math.floor(left / 60), ss = Math.floor(left % 60);
        ctx.textAlign = 'center'; ctx.fillStyle = left < 60 ? '#ff6a6a' : '#ffe8a0';
        ctx.fillText(boss.boss.enraged ? '광폭화!' : `⏱ ${mm}:${String(ss).padStart(2, '0')} · ${boss.boss.phase + 1}페이즈`, x + w / 2, y - 6);
        for (const r of [0.66, 0.33]) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + w * r, y, 2, 14); }
      }
      ctx.fillStyle = '#300'; ctx.fillRect(x, y, w, 14);
      const gg = ctx.createLinearGradient(0, y, 0, y + 14); gg.addColorStop(0, '#ff6a5a'); gg.addColorStop(1, '#a01818');
      ctx.fillStyle = gg; ctx.fillRect(x, y, w * Math.max(0, boss.hp / boss.maxHp), 14);
    }
  }
};
