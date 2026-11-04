'use strict';
// 1.7.5 몬스터 스킬: 공통 틀 8개(돌진·내려찍기·연속 사격·장판·도약·강화·순간이동·낙하물)
//  - 몬스터마다 G.MONSKILL[id] = [{ t: 틀, name, ...수치 }] 한 줄만 적는다 (정예는 2개까지)
//  - 예고는 빨간 칸·"!"·이름표 없이 몬스터 동작과 그림자로만 알린다 (보스 예고는 그대로)
//  - 플레이어를 발견(aggro)했을 때만 쓰고, 한 화면에서 동시에 쓰는 몬스터 수를 제한한다
//  - 피해는 그 몬스터 공격력 × 배수 (레벨이 오르면 자연히 강해짐). 장이 갈수록 쿨타임·예고가 짧아진다
G.MONSKILL = {};
G.MonSkill = {
  MAX_ACTIVE: 2,
  // 레벨대별 세기: [최대 레벨, 쿨타임(초), 예고(초), 피해 배수]
  TIERS: [[10, 14, 1.2, 0.7], [30, 12, 1.05, 0.9], [45, 10.5, 0.95, 1.0], [60, 9.5, 0.9, 1.05], [75, 8.5, 0.82, 1.1], [90, 7.8, 0.76, 1.15], [999, 7, 0.7, 1.2]],
  tier(lv) { return this.TIERS.find(t => lv <= t[0]); },

  // Monster.ai 맨 앞에서 호출. 스킬을 쓰는 중이면 true (그동안 일반 움직임을 멈춘다)
  update(m, dt, w) {
    const list = G.MONSKILL[m.id];
    if (m.buff) { m.buff.t -= dt; if (m.buff.t <= 0) m.buff = null; }
    if (m.hideT > 0) m.hideT -= dt;
    if (m.cueT > 0) m.cueT -= dt;
    if (!list || w.mapId === 'dream_beach') return false;
    const sk = m.sk || (m.sk = { cd: G.U.rand(2, 5), i: Math.floor(Math.random() * list.length), cur: null });
    if (sk.cur) { if (this.step(m, sk.cur, dt, w)) { sk.cur = null; m.atkAnim = -1; } return !!sk.cur; }
    const p = w.player;
    sk.cd -= dt;
    if (sk.cd > 0 || m.aggro <= 0 || p.dead || m.status.seal) return false;
    const def = list[sk.i % list.length];
    const dx = Math.abs(p.x - m.x), dy = Math.abs(p.y - m.y);
    const far = def.t === 'volley' || def.t === 'drop' || def.t === 'zone' ? 480 : def.t === 'blink' ? 420 : 300;
    if (dx > far || dy > (m.flying || def.t === 'drop' || def.t === 'volley' ? 220 : 60)) return false;
    if (w.monsters.filter(x => x.sk && x.sk.cur && !x.dead).length >= this.MAX_ACTIVE) { sk.cd = 1; return false; }
    const T = this.tier(m.lv);
    sk.cur = { def, t: 0, warn: T[1 + 1] * (def.warnMul || 1), mul: T[3] * (def.mul || 1), done: false };
    sk.cd = T[1] * (def.cdMul || 1) * G.U.rand(0.85, 1.15);
    sk.i++;
    m.dir = Math.sign(p.x - m.x) || m.dir;
    this.begin(m, sk.cur, w);
    return true;
  },

  // ---------- 시작 (예고) ----------
  begin(m, c, w) {
    const p = w.player, d = c.def;
    m.moving = false;
    switch (d.t) {
      case 'dash': case 'leap': case 'volley': m.cueT = c.warn; break;
      case 'slam': break;
      case 'buff': m.cueT = c.warn; break;
      case 'blink': G.FX.burst(m.x, m.y - m.h / 2, d.color || '#888', 14, 160); break;
      case 'zone': {
        const at = d.at === 'self' ? m.x : p.x, gy = this.groundY(w, at, d.at === 'self' ? m.y : p.y);
        c.zone = this.addZone(w, { x: at, y: gy, r: d.r || 70, kind: d.kind || 'poison', warn: c.warn, dur: d.dur || 3.5, dmg: m.atk * c.mul * (d.dps || 0.2), slow: !!d.slow, src: m });
        break;
      }
      case 'drop': {
        const n = d.n || 3, gy = this.groundY(w, p.x, p.y);
        c.spots = [];
        for (let i = 0; i < n; i++) {
          const x = p.x + (i - (n - 1) / 2) * 95 + G.U.rand(-20, 20);
          c.spots.push(this.addZone(w, { x, y: this.groundY(w, x, gy), r: 42, kind: 'shadow', warn: c.warn, dur: 0.01, at: i * 0.18 }));
        }
        break;
      }
    }
    if (d.t === 'leap') { c.tx = G.U.clamp(p.x, m.minX, m.maxX); c.shadow = this.addZone(w, { x: c.tx, y: m.plat.y, r: 46, kind: 'shadow', warn: c.warn + 0.45, dur: 0.01 }); }
  },

  // ---------- 진행 ----------
  step(m, c, dt, w) {
    const p = w.player, d = c.def;
    c.t += dt;
    const warnDone = c.t >= c.warn;
    const raw = m.atk * c.mul;
    const hit = (mult, opt = {}) => p.hurt(raw * mult, m.x, Object.assign({ src: m }, opt));
    switch (d.t) {
      case 'dash': {   // 웅크림 + 번쩍 + 바람 줄 → 돌진 (나는 몬스터는 급강하)
        if (!warnDone) { if (Math.random() < 0.5) G.FX.wind(m.x - m.dir * m.w * 0.4, m.y - m.h * 0.5, m.dir); return false; }
        if (!c.go) { c.go = true; c.left = d.dist || 240; c.ty = p.y - 30; }
        const sp = (d.speed || 560) * dt;
        m.moving = true; m.atkAnim = 0.5;
        m.x += m.dir * sp; c.left -= sp;
        if (m.flying) m.y += (c.ty - m.y) * Math.min(1, dt * 6);
        if (m.x <= m.minX || m.x >= m.maxX) { m.x = G.U.clamp(m.x, m.minX, m.maxX); c.left = 0; }
        if (!c.hit && G.U.overlap(m.box, p.box)) { c.hit = true; hit(d.dmg || 1.3); if (d.kb) p.kbX = m.dir * 420; }
        if (d.fx && Math.random() < 0.5) G.FX.burst(m.x - m.dir * 20, m.y - 8, d.fx, 2, 80);
        return c.left <= 0;
      }
      case 'slam': {   // 팔·무기를 높이 든 동작 + 발밑 먼지 → 주변 충격파
        if (!warnDone) {
          m.atkAnim = 0.38;
          if (Math.random() < 0.35) G.FX.add({ k: 'p', x: m.x + G.U.rand(-m.w * 0.6, m.w * 0.6), y: m.y - 4, vx: G.U.rand(-30, 30), vy: -40, grav: 30, color: d.dust || 'rgba(220,220,220,.8)', r: G.U.rand(3, 6), life: 0.5 });
          return false;
        }
        if (!c.hit) {
          c.hit = true; m.atkAnim = 0.75;
          const r = d.r || 90;
          if (Math.abs(p.x - m.x) < r + 20 && Math.abs(p.y - m.y) < 50) hit(d.dmg || 1.5, d.slow ? { slow: 1.5 } : {});
          G.FX.shock(m.x, m.y - 10, r * 1.2, d.color || '#e0d0b0'); w.shake(4);
        }
        return c.t >= c.warn + 0.35;
      }
      case 'volley': {   // 번쩍 → 부채꼴 3발
        if (!warnDone) return false;
        if (!c.fired) {
          c.fired = true; m.atkAnim = 0;
          const n = d.n || 3, sx = m.x + m.dir * m.w * 0.3, sy = m.y - m.h * 0.55, base = Math.atan2((p.y - 32) - sy, p.x - sx);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * (d.spread || 0.22);
            w.projectiles.push(new G.Projectile({ x: sx, y: sy, vx: Math.cos(a) * (d.speed || 430), vy: Math.sin(a) * (d.speed || 430), owner: 'enemy', kind: d.proj || 'arrow', r: 9, range: 620, life: 3, hurt: { raw: raw * (d.dmg || 0.9), src: m, slow: d.slow ? 1.2 : 0 } }));
          }
        }
        return c.t >= c.warn + 0.3;
      }
      case 'zone': return warnDone;   // 장판은 깔리고 나면 몬스터는 다시 움직인다 (장판은 world에서 따로 진행)
      case 'leap': {   // 웅크림 + 착지 그림자 → 포물선 도약 → 착지 충격
        if (!warnDone) return false;
        if (!c.go) { c.go = true; c.x0 = m.x; c.y0 = m.y; c.k = 0; }
        c.k = Math.min(1, c.k + dt / 0.45);
        m.x = c.x0 + (c.tx - c.x0) * c.k; m.y = c.y0 - Math.sin(c.k * Math.PI) * (d.h || 90);
        m.atkAnim = 0.5;
        if (c.k >= 1 && !c.hit) {
          c.hit = true; m.y = c.y0;
          if (Math.abs(p.x - m.x) < (d.r || 60) + 20 && Math.abs(p.y - m.y) < 50) hit(d.dmg || 1.4);
          G.FX.burst(m.x, m.y - 6, d.color || '#d8d0c0', 14, 200); w.shake(3);
          if (d.zone) this.addZone(w, { x: m.x, y: m.y, r: 60, kind: d.zone, warn: 0.15, dur: 3, dmg: raw * 0.18, slow: d.zone === 'web', src: m });
        }
        return c.hit && c.t >= c.warn + 0.6;
      }
      case 'buff': {   // 빛 오라 → 잠깐 강화
        if (!warnDone) { if (Math.random() < 0.6) G.FX.rise(m.x, m.y - 6, d.color || '#ffd070', 1); return false; }
        m.buff = { t: d.dur || 4, atk: d.atk || 1.3, spd: d.spd || 1.4, def: d.def || 1, color: d.color || '#ffd070' };
        G.FX.ring(m.x, m.y - m.h / 2, m.w, m.buff.color);
        return true;
      }
      case 'blink': {   // 연기 속에 사라짐 → 플레이어 옆·등 뒤에 나타남
        if (!c.gone && c.t >= 0.25) {
          c.gone = true; m.hideT = 0.45;
          const side = d.behind ? -p.dir : (Math.sign(m.x - p.x) || 1);
          c.tx = G.U.clamp(p.x + side * 70, m.minX, m.maxX);
        }
        if (c.gone && !c.shown && c.t >= 0.7) {
          c.shown = true; m.x = c.tx; m.dir = Math.sign(p.x - m.x) || m.dir;
          if (m.flying) m.y = G.U.clamp(p.y - 40, m.baseY - 60, m.plat.y - 20);
          G.FX.burst(m.x, m.y - m.h / 2, d.color || '#888', 14, 160); m.aggro = 6;
        }
        return c.t >= 0.9;
      }
      case 'drop': {   // 그림자 원 → 위에서 떨어짐
        for (const z of c.spots) {
          if (!z.fell && c.t >= c.warn + z.at) {
            z.fell = true;
            G.FX.add({ k: 'drop', obj: d.obj || 'rock', x: z.x, y: z.y, life: 0.45 });
            setTimeout(() => {
              if (w.player === p && Math.abs(p.x - z.x) < 44 && Math.abs(p.y - z.y) < 60) p.hurt(raw * (d.dmg || 1.1), z.x, { src: m });
              G.FX.burst(z.x, z.y - 6, d.color || '#c8b8a0', 10, 180);
            }, 150);
          }
        }
        return c.spots.every(z => z.fell) && c.t >= c.warn + 0.9;
      }
    }
    return true;
  },

  // ---------- 장판 · 그림자 (world 소속) ----------
  ZONE: {
    poison: ['168,224,96', '#c8ff80'], moss: ['110,180,80', '#a0e070'], web: ['235,235,245', '#ffffff'],
    lava: ['255,120,40', '#ffb070'], ice: ['150,210,255', '#e0f4ff'], sand: ['220,190,120', '#f0d8a0'],
    void: ['170,80,230', '#e0a0ff'], shadow: ['0,0,0', null],
  },
  addZone(w, z) { z.t = 0; (w.mzones || (w.mzones = [])).push(z); return z; },
  groundY(w, x, y) { return w.groundBelow(x, y - 5); },
  updateWorld(dt, w) {
    if (!w.mzones || !w.mzones.length) return;
    const p = w.player;
    for (const z of w.mzones) {
      z.t += dt;
      if (z.kind === 'shadow' || z.t < z.warn) continue;
      z.tick = (z.tick || 0) - dt;
      if (z.tick <= 0 && !p.dead && Math.abs(p.x - z.x) < z.r && Math.abs(p.y - z.y) < 12) {
        z.tick = 0.6;
        if (z.dmg) p.hurt(z.dmg, z.x, { src: z.src, slow: z.slow ? 0.8 : 0 });
        else if (z.slow) p.slowT = Math.max(p.slowT || 0, 0.8);
      }
    }
    w.mzones = w.mzones.filter(z => z.t < z.warn + z.dur + (z.kind === 'shadow' ? 0.4 : 0.3));
  },
  drawWorld(ctx, w) {
    if (!w.mzones) return;
    for (const z of w.mzones) {
      const C = this.ZONE[z.kind] || this.ZONE.poison;
      const end = z.warn + z.dur;
      let a;
      if (z.kind === 'shadow') a = Math.min(1, z.t / Math.max(0.01, z.warn)) * 0.5;   // 점점 진해지는 그림자
      else if (z.t < z.warn) a = 0.12 + 0.12 * (z.t / z.warn);                        // 아주 옅게 먼저 번짐
      else a = 0.42 * Math.min(1, (end + 0.3 - z.t) / 0.3);
      if (a <= 0) continue;
      const r = z.kind === 'shadow' ? z.r * (0.7 + 0.3 * Math.min(1, z.t / Math.max(0.01, z.warn))) : z.r * (z.t < z.warn ? 0.8 + 0.2 * z.t / z.warn : 1);
      const g = ctx.createRadialGradient(z.x, z.y - 2, 0, z.x, z.y - 2, r);
      g.addColorStop(0, `rgba(${C[0]},${a})`); g.addColorStop(1, `rgba(${C[0]},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(z.x, z.y - 2, r, r * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      if (C[1] && z.t >= z.warn && Math.random() < 0.3) G.FX.add({ k: 'p', x: z.x + G.U.rand(-r * 0.8, r * 0.8), y: z.y - 3, vx: 0, vy: -30, grav: -10, color: C[1], r: G.U.rand(1.5, 2.5), life: 0.5, glow: true });
    }
  },
};

// ======================= 1.7.5: 새싹항 섬 ~ 라그하르트 (25종) =======================
//  dmg: 공격력 대비 배수, dist: 돌진 거리, r: 범위, n: 개수, proj: 투사체 그림, kind/zone: 장판 종류
Object.assign(G.MONSKILL, {
  // 새싹항 섬 (아주 약하고 드물게)
  jelly:       [{ t: 'leap', name: '통통 튀기', r: 50, h: 60, dmg: 1.0 }],
  crab:        [{ t: 'dash', name: '옆걸음 돌진', dist: 150, speed: 420, dmg: 1.0 }],
  spore:       [{ t: 'zone', name: '포자 구름', at: 'self', kind: 'poison', r: 60, dps: 0.25, dur: 3 }],
  capshroom:   [{ t: 'slam', name: '갓 내려치기', r: 70, dmg: 1.2 }],
  spikeshell:  [{ t: 'volley', name: '가시 발사', proj: 'spike', speed: 360, dmg: 0.7 }],
  sealizard:   [{ t: 'dash', name: '물보라 질주', dist: 220, dmg: 1.1, fx: '#9ad8ff' }],
  // 바람결 지방
  fieldrat:    [{ t: 'buff', name: '흥분', spd: 1.6, atk: 1.2, dur: 4, color: '#ffb060' }],
  scarecrow:   [{ t: 'slam', name: '짚단 내려찍기', r: 80, dmg: 1.3, dust: 'rgba(230,200,120,.85)' }],
  windspirit:  [{ t: 'volley', name: '바람 칼날', proj: 'windblade', dmg: 0.8 }],
  wingboar:    [{ t: 'dash', name: '돌풍 박치기', dist: 280, dmg: 1.3, kb: true, fx: '#d8f0ff' }],
  banditnov:   [{ t: 'blink', name: '연막 걸음', behind: true, color: '#777' }],
  banditarch:  [{ t: 'volley', name: '부채 화살', proj: 'arrow', dmg: 0.8 }],
  // 은빛숲 엘렌하임
  moss_slime:  [{ t: 'zone', name: '끈적 이끼', at: 'player', kind: 'moss', r: 70, dps: 0.12, slow: true, dur: 4 }],
  thorn_beetle:[{ t: 'dash', name: '가시뿔 돌진', dist: 240, dmg: 1.3 }],
  cave_spider: [{ t: 'zone', name: '거미줄 뿌리기', at: 'player', kind: 'web', r: 65, dps: 0.05, slow: true, dur: 4 }],
  web_bat:     [{ t: 'dash', name: '급강하', dist: 260, speed: 600, dmg: 1.1 }],
  swamp_toad:  [{ t: 'leap', name: '늪 뛰어들기', r: 60, h: 100, dmg: 1.2, zone: 'poison', color: '#8ac070' }],
  firefly_spirit: [{ t: 'blink', name: '반딧불 깜빡임', color: '#f0f070' }],
  // 광산도시 라그하르트
  mine_rat:    [{ t: 'buff', name: '광기의 질주', spd: 1.7, atk: 1.3, dur: 4, color: '#ff8060' }],
  rock_golem:  [{ t: 'dash', name: '땅파기 돌진', dist: 220, dmg: 1.3, fx: '#a89078' }],
  fire_imp:    [{ t: 'drop', name: '분화 불씨', obj: 'ember', n: 3, dmg: 1.0, color: '#ffa040' }],
  magma_slime: [{ t: 'zone', name: '끓어 넘침', at: 'self', kind: 'lava', r: 70, dps: 0.3, dur: 3.5 }],
  clockwork:   [{ t: 'dash', name: '태엽 돌격', dist: 260, dmg: 1.3, fx: '#d0c090' }],
  drone:       [{ t: 'volley', name: '탐지 레이저', proj: 'laser', speed: 520, spread: 0.12, dmg: 0.8 }],
  foreman:     [{ t: 'slam', name: '광석 주먹', r: 120, dmg: 1.7, dust: 'rgba(170,150,130,.85)' },
                { t: 'drop', name: '낙석', obj: 'rock', n: 3, dmg: 1.2 }],
});

// ======================= 1.7.6: 모래바다 사하린 ~ 녹스게이트 (29종) =======================
Object.assign(G.MONSKILL, {
  // 모래바다 사하린
  sand_lizard:     [{ t: 'blink', name: '모래 잠수', color: '#e0c890' }],
  dune_bison:      [{ t: 'dash', name: '들소 돌진', dist: 320, dmg: 1.4, kb: true, fx: '#e0c890' }],
  canyon_scorpion: [{ t: 'leap', name: '독침 도약', r: 60, h: 90, dmg: 1.3, zone: 'poison', color: '#c0a060' }],
  vulture:         [{ t: 'dash', name: '급강하 할퀴기', dist: 280, speed: 620, dmg: 1.2 }],
  mummy:           [{ t: 'zone', name: '저주의 붕대', at: 'player', kind: 'sand', r: 65, dps: 0.08, slow: true, dur: 3.5 }],
  sand_spirit:     [{ t: 'zone', name: '모래 회오리', at: 'self', kind: 'sand', r: 80, dps: 0.2, slow: true, dur: 3.5 }],
  scorpion_king:   [{ t: 'leap', name: '왕의 덮침', r: 95, h: 110, dmg: 1.6, color: '#d08040' },
                    { t: 'volley', name: '세 갈래 독침', proj: 'spike', dmg: 0.9 }],
  // 얼음성채 프로스트벨
  snow_wolf:       [{ t: 'buff', name: '울부짖음', atk: 1.3, spd: 1.5, dur: 4, color: '#bfe6ff' }],
  frost_bat:       [{ t: 'volley', name: '서리 파편', proj: 'iceshard', dmg: 0.8, slow: true }],
  ice_crab:        [{ t: 'dash', name: '뿔 들이받기', dist: 280, dmg: 1.4, kb: true, fx: '#c8f0ff' }],
  yeti:            [{ t: 'dash', name: '창 돌격', dist: 260, dmg: 1.4 }],
  ice_golem:       [{ t: 'slam', name: '얼음 몽둥이', r: 100, dmg: 1.5, slow: true, dust: 'rgba(220,240,255,.9)', color: '#bfe6ff' }],
  frost_wraith:    [{ t: 'zone', name: '냉기 안개', at: 'player', kind: 'ice', r: 75, dps: 0.12, slow: true, dur: 4 }],
  frost_giant:     [{ t: 'slam', name: '비늘 지진', r: 130, dmg: 1.7, slow: true, dust: 'rgba(200,230,255,.9)', color: '#9ad8ff' },
                    { t: 'drop', name: '고드름 낙하', obj: 'icicle', n: 3, dmg: 1.2, color: '#d8f2ff' }],
  // 하늘섬 아에로스
  cloud_sheep:     [{ t: 'blink', name: '구름 꼬리 환영', color: '#e0e8ff' }],
  sky_fairy:       [{ t: 'dash', name: '뿔 급강하', dist: 260, speed: 600, dmg: 1.2 }],
  storm_golem:     [{ t: 'drop', name: '낙뢰', obj: 'bolt', n: 2, dmg: 1.3, color: '#fff6b0' }],
  thunder_bird:    [{ t: 'volley', name: '깃털 세 발', proj: 'feather', dmg: 0.85 }],
  star_knight:     [{ t: 'buff', name: '별빛 결의', atk: 1.3, spd: 1.2, def: 0.7, dur: 4, color: '#ffe680' }],
  comet_spirit:    [{ t: 'dash', name: '혜성 돌진', dist: 300, speed: 640, dmg: 1.3, fx: '#fff0a0' }],
  storm_guardian:  [{ t: 'drop', name: '뇌운 낙뢰', obj: 'bolt', n: 3, dmg: 1.3, color: '#fff6b0' },
                    { t: 'slam', name: '번개 창 강타', r: 125, dmg: 1.7, dust: 'rgba(255,246,176,.8)', color: '#fff6b0' }],
  // 녹스게이트
  void_shade:      [{ t: 'blink', name: '그림자 이동', behind: true, color: '#3a2a5a' }],
  rift_beast:      [{ t: 'leap', name: '균열 도약', r: 70, h: 100, dmg: 1.4, zone: 'void', color: '#ff8ae0' }],
  dark_knight:     [{ t: 'drop', name: '결정 낙하', obj: 'crystal', n: 3, dmg: 1.2, color: '#d090ff' }],
  cult_mage:       [{ t: 'volley', name: '어둠 구슬 세 갈래', proj: 'darkorb', speed: 380, dmg: 0.9 }],
  void_serpent:    [{ t: 'buff', name: '방패 결의', atk: 1.3, spd: 1.0, def: 0.6, dur: 4, color: '#ff6fd8' }],
  abyss_eye:       [{ t: 'zone', name: '공허 침식', at: 'player', kind: 'void', r: 75, dps: 0.3, dur: 3.5 }],
  executor:        [{ t: 'dash', name: '처형 베기', dist: 300, speed: 620, dmg: 1.7, fx: '#e060ff' },
                    { t: 'blink', name: '그림자 처형', behind: true, color: '#3e3058' }],
  trial_echo:      [{ t: 'dash', name: '별빛 검격', dist: 280, dmg: 1.5, fx: '#bfe6ff' },
                    { t: 'buff', name: '영웅의 의지', atk: 1.3, spd: 1.3, dur: 4, color: '#bfe6ff' }],
});
