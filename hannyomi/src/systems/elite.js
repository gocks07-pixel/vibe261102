'use strict';
// 빌드 13: 정예 몬스터 — 별빛 결계 출현 · 고유 패턴(피하면 약점) · 처치 보상(별빛 축복) · 3분 리젠
//  계획 docs/drafts/plan_build13.md · 시안 docs/drafts/design/elite/elite_all.png (가 + 나 + 다)
//  world.js 다음에 불러와 G.World · G.Monster · G.Player 의 몇 함수를 감쌈 (다른 파일은 거의 그대로). PC · EXE 와 같이 쓰는 파일
//  영웅의 전당 "영웅의 잔영"(시련)은 맵의 정예(map.elite)가 아니라서 그대로
G.Elite = (function () {
  const E = {
    RESPAWN: 180, FIRST: 30, R: 250, WEAK: 4, WEAK_MUL: 1.5, EVERY: 8, WARN: 2, BLESS: 60, BLESS_MUL: 1.2,
    next: {},   // 맵 id → 다음 출현 시각 (Date.now, 세이브에 안 넣음)
    bless: null,   // { map, until }
  };
  // 정예마다 고유 패턴: shapes(m, p) → 위험한 곳 [{ x0, x1 }] (땅 기준), 그림 종류
  E.PAT = {
    foreman:        { name: '땅 내려찍기', kind: 'crack', dmg: 1.6, shapes: (m, p, z) => [-150, 0, 150].map(dx => ({ x0: z.x + dx - 34 + (dx ? 0 : (p.x - z.x) * 0.6), x1: z.x + dx + 34 + (dx ? 0 : (p.x - z.x) * 0.6) })) },
    scorpion_king:  { name: '꼬리 독침', kind: 'fan', dmg: 1.6, shapes: (m, p) => { const d = Math.sign(p.x - m.x) || 1; return [{ x0: Math.min(m.x, m.x + d * 260), x1: Math.max(m.x, m.x + d * 260) }]; } },
    frost_giant:    { name: '얼음 고리', kind: 'ring', dmg: 1.6, shapes: m => [{ x0: m.x - 150, x1: m.x + 150 }] },
    storm_guardian: { name: '낙뢰', kind: 'bolt', dmg: 1.6, shapes: (m, p, z) => [p.x, z.x - 170 + Math.random() * 60, z.x + 130 + Math.random() * 60].map(x => ({ x0: x - 46, x1: x + 46 })) },
    executor:       { name: '십자 베기', kind: 'cross', dmg: 1.7, shapes: (m, p) => [{ x0: p.x - 70, x1: p.x + 70 }] },
  };
  const isElite = (w, slot) => slot && w.map && w.map.elite && slot.m === w.map.elite && !w.map.bossRoom;
  E.zoneOf = m => m && m.__ez;

  // ---------- 출현 ----------
  function arm(w) {   // 맵에 들어올 때: 정예 자리는 바로 내보내지 않고 남은 시간만큼 기다림
    for (const s of w.slots) {
      if (!isElite(w, s)) continue;
      s.elite = true; s.plat = w.map.platforms.find(pl => pl.ground) || w.map.platforms[0]; s.x = -99999;   // x 는 나올 때 정함 (원래 자리 옆에 플레이어가 있으면 계속 미뤄지던 것 막음)
      if (s.mon) { const i = w.monsters.indexOf(s.mon); if (i >= 0) w.monsters.splice(i, 1); s.mon = null; }
      const left = E.next[w.mapId] ? (E.next[w.mapId] - Date.now()) / 1000 : E.FIRST;
      s.timer = Math.max(E.FIRST > left ? left : left, 0.5);
      if (!E.next[w.mapId]) E.next[w.mapId] = Date.now() + E.FIRST * 1000;
    }
    if (E.bless && E.bless.map !== w.mapId) E.bless = null;
    w.__eliteFx = [];
  }
  function spawn(w, s) {   // 넓은 땅, 플레이어에게서 떨어진 쪽
    const p = w.player, W = w.map.width, lo = E.R + 40, hi = W - E.R - 40;
    let x = p.x < W / 2 ? Math.min(hi, p.x + 650) : Math.max(lo, p.x - 650);
    x = G.U.clamp(x, lo, hi);
    s.x = x;
    const m = new G.Monster(s.m, x, s.plat, s);
    s.mon = m; w.monsters.push(m);
    m.__ez = { x, r: E.R, appear: 1.2, patT: E.EVERY * 0.6, warn: null, weakT: 0 };
    E.next[w.mapId] = 0;
    G.UI.banner(`★ 정예 출현! ${m.d.name}`, '별빛 결계 안에서 쓰러뜨리세요');
    G.Audio.play('boss'); G.FX.burst(x, G.GROUND_Y - 60, '#e8dcff', 40, 360);
  }

  // ---------- 매 프레임: 결계 · 패턴 · 약점 · 축복 ----------
  function update(w, dt) {
    const p = w.player;
    for (const m of w.monsters) {
      const z = m.__ez; if (!z || m.dead) continue;
      if (z.appear > 0) { z.appear -= dt; continue; }
      // 결계 밖으로 안 나감 · 결계 안 일반 몬스터는 밖으로
      m.x = G.U.clamp(m.x, z.x - z.r + m.w / 2, z.x + z.r - m.w / 2);
      for (const o of w.monsters) if (o !== m && !o.dead && !o.isBoss && !o.__ez && o.plat && o.plat.ground && Math.abs(o.x - z.x) < z.r) o.x += Math.sign(o.x - z.x || 1) * Math.min(220 * dt, z.r - Math.abs(o.x - z.x));
      if (z.weakT > 0) z.weakT -= dt;
      const P = E.PAT[m.id]; if (!P) continue;
      if (z.warn) {
        z.warn.t += dt;
        if (z.warn.t >= E.WARN && !z.warn.done) {
          z.warn.done = true;
          const onG = p.y > G.GROUND_Y - 100 || P.kind === 'cross';
          const hit = !p.dead && onG && z.warn.shapes.some(sh => p.x > sh.x0 - 10 && p.x < sh.x1 + 10);
          for (const sh of z.warn.shapes) G.FX.burst((sh.x0 + sh.x1) / 2, G.GROUND_Y - 10, P.kind === 'bolt' ? '#d8e4ff' : P.kind === 'ring' ? '#bfe8ff' : P.kind === 'fan' ? '#b8ff8a' : P.kind === 'cross' ? '#e8a0ff' : '#d8c0a0', 14, 260);
          if (P.kind === 'bolt') G.Sound && G.Sound.play && G.Sound.play('chain');
          w.shake(P.kind === 'crack' ? 6 : 3);
          if (hit) p.hurt(m.atk * P.dmg, m.x, { src: m });
          else if (Math.abs(p.x - z.x) < z.r + 80) { z.weakT = E.WEAK; G.FX.text(m.x, m.y - m.h - 40, '약점 노출!', '#ffd86a', 20, 1.4); }
        }
        if (z.warn.t >= E.WARN + 0.5) { z.warn = null; z.patT = E.EVERY; }
      } else if (!p.dead && Math.abs(p.x - z.x) < z.r + 260) {
        z.patT -= dt;
        if (z.patT <= 0) z.warn = { t: 0, shapes: P.shapes(m, p, z), kind: P.kind };
      }
    }
    if (E.bless && (E.bless.map !== w.mapId || w.time > E.bless.until)) { if (E.bless.map === w.mapId) G.UI.log('✦ 별빛 축복이 끝났어요.', '#c8b8ff'); E.bless = null; }
    if (w.__eliteFx) { for (const f of w.__eliteFx) f.t += dt; w.__eliteFx = w.__eliteFx.filter(f => f.t < f.life); }
  }
  // 자동 사냥: 패턴 표시가 있으면 표시 밖으로 (play.js safeArea 에서 부름)
  E.safeArea = function (p, w) {
    for (const m of w.monsters) {
      const z = m.__ez; if (!z || m.dead || !z.warn || z.warn.done) continue;
      if (!z.warn.shapes.some(sh => p.x > sh.x0 - 24 && p.x < sh.x1 + 24)) return null;
      // 가장 가까운 안전한 곳 (결계 안, 표시 사이)
      const cand = []; for (let x = z.x - z.r + 20; x <= z.x + z.r - 20; x += 20) if (!z.warn.shapes.some(sh => x > sh.x0 - 30 && x < sh.x1 + 30)) cand.push(x);
      if (!cand.length) return null;
      const tx = cand.reduce((a, b) => Math.abs(b - p.x) < Math.abs(a - p.x) ? b : a);
      return { lo: tx - 18, hi: tx + 18, ground: false, kind: 'elite' };
    }
    return null;
  };

  // ---------- 그리기 (화면 좌표) ----------
  function draw(w, c) {
    const S = G.SpellFX && G.SpellFX.soft; if (!S) return;
    const cam = w.cam, gy = G.GROUND_Y, t = w.time;
    const ring = (x, y, R, col, a, lw) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(x, y, R, R * 0.16, 0, 0, Math.PI * 2); c.stroke(); c.restore(); };
    for (const m of w.monsters) {
      const z = m.__ez; if (!z || m.dead) continue;
      const x = z.x - cam, k = z.appear > 0 ? 1 - z.appear / 1.2 : 1;
      if (z.appear > 0) {   // 하늘 빛기둥
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.sin(Math.PI * k) * 0.9; const g = c.createLinearGradient(x - 60, 0, x + 60, 0); g.addColorStop(0, 'rgba(180,160,255,0)'); g.addColorStop(0.5, 'rgba(235,225,255,.6)'); g.addColorStop(1, 'rgba(180,160,255,0)'); c.fillStyle = g; c.fillRect(x - 60, 0, 120, gy); c.restore();
      }
      // 결계: 반투명 돔 + 땅 빛 고리 + 오르는 빛 알갱이
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k; const R = z.r, g2 = c.createRadialGradient(x, gy, R * 0.2, x, gy, R); g2.addColorStop(0, 'rgba(170,150,255,0)'); g2.addColorStop(0.85, 'rgba(170,150,255,.08)'); g2.addColorStop(1, 'rgba(210,200,255,.22)'); c.fillStyle = g2; c.beginPath(); c.ellipse(x, gy, R, R * 0.95, 0, Math.PI, 0); c.fill(); c.restore();
      ring(x, gy - 2, z.r, '#d8ccff', 0.75 * k, 2.5); ring(x, gy - 2, z.r - 12, '#a890ff', 0.4 * k, 6);
      for (let i = 0; i < 24; i++) { const u = (t * 0.4 + i * 0.137) % 1, a = i * 2.4; S(c, x + Math.cos(a) * z.r * (0.6 + 0.4 * ((i * 7) % 5) / 5), gy - u * 220, 2.2, '230,220,255', (1 - u) * 0.8 * k, true); }
      // 패턴 표시
      const W = z.warn;
      if (W && !W.done) {
        const u = W.t / E.WARN, a = 0.35 + 0.45 * u;
        for (const sh of W.shapes) {
          const cx = (sh.x0 + sh.x1) / 2 - cam, hw = (sh.x1 - sh.x0) / 2;
          c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(255,70,70,.28)'; c.strokeStyle = '#ff6a6a'; c.lineWidth = 2;
          if (W.kind === 'cross') { c.beginPath(); c.moveTo(cx - hw, gy - 70); c.lineTo(cx + hw, gy - 4); c.moveTo(cx + hw, gy - 70); c.lineTo(cx - hw, gy - 4); c.lineWidth = 6; c.stroke(); }
          c.beginPath(); c.ellipse(cx, gy - 2, hw, Math.max(8, hw * 0.16), 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.restore();
          c.save(); c.globalAlpha = a; c.fillStyle = '#ffb0b0'; c.font = 'bold 13px "Malgun Gothic"'; c.textAlign = 'center'; c.fillText(Math.max(0, E.WARN - W.t).toFixed(1), cx, gy - 22); c.restore();
        }
      }
      if (z.weakT > 0) {   // 약점 노출
        S(c, m.x - cam, m.y - m.h * 0.6, 80, '255,230,140', 0.3, true);
        c.save(); c.textAlign = 'center'; c.font = '900 17px "Malgun Gothic"'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.6)'; const ty = m.y - m.h - 34; c.strokeText(`약점 노출! 받는 피해 +50% (${Math.ceil(z.weakT)})`, m.x - cam, ty); c.fillStyle = '#ffd86a'; c.fillText(`약점 노출! 받는 피해 +50% (${Math.ceil(z.weakT)})`, m.x - cam, ty); c.restore();
      }
    }
    // 처치: 결계가 터지는 빛 고리 + 보물 상자
    for (const f of (w.__eliteFx || [])) {
      const x = f.x - cam, k = f.t / f.life;
      for (let i = 0; i < 3; i++) ring(x, gy - 2, 80 + (i * 90 + k * 200), '#e8dcff', (1 - k) * (0.7 - i * 0.18), 4 - i);
      if (k < 0.85) { c.save(); c.globalAlpha = Math.min(1, (0.85 - k) * 5); c.translate(x, gy - 18 - Math.sin(Math.min(1, k * 3) * Math.PI) * 20); c.fillStyle = '#a0682a'; c.fillRect(-24, -16, 48, 32); c.fillStyle = '#ffd54a'; c.fillRect(-24, -5, 48, 6); c.fillRect(-4, -16, 8, 32); c.strokeStyle = '#5a3a10'; c.lineWidth = 2; c.strokeRect(-24, -16, 48, 32); c.restore(); S(c, x, gy - 30, 70, '255,220,120', 0.4 * (1 - k), true); }
    }
    // 별빛 축복 남은 시간 (오른쪽 위)
    if (E.bless && E.bless.map === w.mapId) {
      const left = Math.max(0, E.bless.until - w.time), txt = `✦ 별빛 축복 ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')} · 경험치 · 드롭 +20%`;
      c.save(); c.font = 'bold 13px "Malgun Gothic"'; const tw = c.measureText(txt).width + 20; c.fillStyle = 'rgba(10,12,22,.72)'; c.beginPath(); c.roundRect(1280 - tw - 14, 120, tw, 26, 7); c.fill(); c.fillStyle = '#ffe08a'; c.textAlign = 'left'; c.fillText(txt, 1280 - tw - 4, 138); c.restore();
    }
  }
  // 미니맵: 정예 왕관 · 다음 출현까지 남은 시간
  function minimap(w, ctx) {
    if (!w.map.elite || w.map.bossRoom || !w.slots.some(s => s.elite)) return;
    const W = 230, X = 14, Y = 82, H = 74, sc = W / w.map.width, live = w.monsters.find(m => m.__ez && !m.dead);
    const crown = (x, y) => { ctx.save(); ctx.fillStyle = '#ffd54a'; ctx.strokeStyle = '#6a4a08'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, y + 3); ctx.lineTo(x - 6, y - 3); ctx.lineTo(x - 3, y); ctx.lineTo(x, y - 5); ctx.lineTo(x + 3, y); ctx.lineTo(x + 6, y - 3); ctx.lineTo(x + 6, y + 3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); };
    if (live) crown(X + live.x * sc, Y + H - 18);
    else { const s = w.slots.find(q => q.elite), left = Math.max(0, Math.ceil(s ? s.timer : 0)); crown(X + 12, Y + 12); ctx.save(); ctx.font = 'bold 11px "Malgun Gothic"'; ctx.fillStyle = '#ffe08a'; ctx.textAlign = 'left'; ctx.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, X + 21, Y + 16); ctx.restore(); }
  }

  // ---------- 감싸기 ----------
  const WP = G.World.prototype;
  const load0 = WP.load; WP.load = function () { const r = load0.apply(this, arguments); try { arm(this); } catch (e) { /* 정예 없이 */ } return r; };
  const spawn0 = WP.spawnSlot; WP.spawnSlot = function (slot) { if (slot && slot.elite) return spawn(this, slot); return spawn0.apply(this, arguments); };
  const kill0 = WP.onKill; WP.onKill = function (m) {
    const r = kill0.apply(this, arguments);
    if (m && m.__ez && m.slot && m.slot.elite) {
      m.slot.timer = E.RESPAWN; E.next[this.mapId] = Date.now() + E.RESPAWN * 1000;
      (this.__eliteFx || (this.__eliteFx = [])).push({ x: m.__ez.x, t: 0, life: 2.2 });
      E.bless = { map: this.mapId, until: this.time + E.BLESS };
      G.UI.banner('정예 처치! 별빛 축복 1분', '이 사냥터에서 경험치 · 드롭 +20%');
    }
    return r;
  };
  const up0 = WP.update; WP.update = function (dt) { const r = up0.apply(this, arguments); try { update(this, dt); } catch (e) { G.ErrLog && G.ErrLog.add(e); } return r; };
  const b21 = WP.drawBoss21; WP.drawBoss21 = function (ctx) { const r = b21.apply(this, arguments); try { draw(this, ctx); } catch (e) { G.ErrLog && G.ErrLog.add(e); } return r; };
  const mm0 = WP.drawMinimap; WP.drawMinimap = function (ctx) { const r = mm0.apply(this, arguments); try { minimap(this, ctx); } catch (e) { /* 미니맵만 */ } return r; };
  const drop0 = WP.dropLoot; WP.dropLoot = function (m) { const r = drop0.apply(this, arguments); if (E.bless && E.bless.map === this.mapId && m && !m.isBoss && Math.random() < E.BLESS_MUL - 1) drop0.apply(this, arguments); return r; };   // 드롭 +20%: 다섯에 한 번 한 번 더
  // 약점 노출 중 받는 피해 +50%
  const td0 = G.Monster.prototype.takeDamage; G.Monster.prototype.takeDamage = function (dmg, p) { if (this.__ez && this.__ez.weakT > 0) dmg = Math.round(dmg * E.WEAK_MUL); if (this.__ez && this.__ez.appear > 0) dmg = 0; return td0.call(this, dmg, p); };
  // 경험치 +20% (사냥에서 얻는 것만, 퀘스트 보상 빼고)
  const ge0 = G.Player.prototype.gainExp; G.Player.prototype.gainExp = function (e, quest) { if (!quest && E.bless && G.Game.world && E.bless.map === G.Game.world.mapId) e = Math.round(e * E.BLESS_MUL); return ge0.call(this, e, quest); };
  return E;
})();
