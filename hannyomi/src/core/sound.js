'use strict';
// 1.8 효과음: 스킬마다 다른 소리 · 속성별 타격음 · 몬스터 스킬 · 보스 패턴 · 특수 소리 (녹스의 등불, 연희의 응원)
//  - 파일 없이 Web Audio로 합성 (G.Synth 악기 + 잡음 + 음높이 미끄러짐). 효과음 버스(G.Audio.sfxBus)로 나가므로 음향 설정을 그대로 따른다
//  - 스킬 소리 = 레시피(소리 종류) × 음높이(k) × 크기(s). 레시피는 SKILL_X의 투사체·연출 → 속성 + 공격 방식 순으로 고르고,
//    음높이는 차수와 스킬 id로 조금씩 달라져서 같은 소리가 나지 않는다 (직접 정한 것은 SKILL_SOUND)
//  - 같은 소리가 한꺼번에 몰리면(다단 히트 · 여러 마리) 짧은 시간 안에 몇 개까지만 낸다
(function () {
  const RND = (a, b) => a + Math.random() * (b - a);

  // ---------- 기본 재료 ----------
  function kit(ctx, dest, t0) {
    const at = d => t0 + (d || 0);
    const tone = (type, f0, f1, dur, vol, d, att = 0.004) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = at(d);
      o.type = type; o.frequency.setValueAtTime(Math.max(20, f0), t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (ft, f0, f1, q, dur, vol, d, att = 0.004) => {
      const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), t = at(d);
      s.buffer = G.Synth.noiseBuf(ctx);
      fl.type = ft; fl.Q.value = q; fl.frequency.setValueAtTime(Math.max(20, f0), t); fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.03);
    };
    const swell = (ft, f0, f1, q, dur, vol, d) => noise(ft, f0, f1, q, dur, vol, d, dur * 0.85);   // 점점 커지는 소리 (빨아들임 · 모으기)
    const inst = (name, f, dur, vel, d) => G.Synth.note(ctx, dest, name, at(d), f, dur, vel);
    const drum = (name, vel, d) => G.Synth.drum(ctx, dest, name, at(d), vel);
    return { tone, noise, swell, inst, drum };
  }
  const N = (base, semi) => base * Math.pow(2, semi / 12);

  // ---------- 소리 레시피: (재료, k = 음높이 배율, s = 크기, n = 개수) ----------
  const R = {
    // ===== 공통 =====
    thump: ({ tone }, k, s) => tone('sine', 140 * k, 50, 0.22, 0.5 * s),
    whoosh: ({ noise }, k, s) => noise('bandpass', 700 * k, 2600 * k, 1.2, 0.22, 0.22 * s),
    // ===== 근접 =====
    slash: (K, k, s) => { K.noise('bandpass', 3200 * k, 900 * k, 1.4, 0.15, 0.28 * s); K.tone('sawtooth', 520 * k, 180 * k, 0.09, 0.05 * s); },
    heavy: (K, k, s) => { R.slash(K, k * 0.8, s); K.tone('sine', 120 * k, 45, 0.28, 0.6 * s, 0.03); K.noise('lowpass', 900, 200, 0.7, 0.25, 0.25 * s, 0.03); },
    whirl: (K, k, s) => { for (let i = 0; i < 3; i++) K.noise('bandpass', (1600 + i * 500) * k, (700 + i * 200) * k, 1.6, 0.14, 0.2 * s, i * 0.07); },
    dagger: (K, k, s, n = 2) => { for (let i = 0; i < Math.min(n, 4); i++) { K.noise('bandpass', 4600 * k, 2000 * k, 2, 0.08, 0.22 * s, i * 0.06); K.tone('square', 1500 * k, 900 * k, 0.04, 0.03 * s, i * 0.06); } },
    bladestorm: (K, k, s) => { for (let i = 0; i < 6; i++) K.noise('bandpass', RND(2800, 4800) * k, 1400 * k, 2.2, 0.09, 0.16 * s, i * 0.045); K.noise('bandpass', 500 * k, 1800 * k, 0.8, 0.4, 0.12 * s); },
    bladewave: (K, k, s) => { K.noise('bandpass', 1400 * k, 4200 * k, 1.5, 0.25, 0.25 * s); K.tone('sine', 900 * k, 500 * k, 0.25, 0.08 * s); },
    dash: (K, k, s) => { K.noise('highpass', 1200 * k, 3800 * k, 0.7, 0.24, 0.24 * s); K.tone('sine', 130 * k, 60, 0.2, 0.4 * s, 0.18); },
    leapshot: (K, k, s) => { K.noise('bandpass', 2400 * k, 800 * k, 1, 0.15, 0.18 * s); R.bow(K, k, s, 1, 0.08); },
    crack: (K, k, s) => { for (let i = 0; i < 3; i++) K.noise('bandpass', 1300 * k, 700 * k, 5, 0.09, 0.3 * s, i * 0.05); K.tone('sine', 90 * k, 40, 0.3, 0.45 * s); },
    quake: (K, k, s) => { K.tone('sine', 70 * k, 32, 0.7, 0.55 * s); K.noise('lowpass', 420, 120, 0.7, 0.8, 0.35 * s); K.drum('timp', 0.6 * s); },
    rocks: (K, k, s) => { R.heavy(K, k, s); for (let i = 0; i < 5; i++) K.noise('bandpass', RND(600, 1600) * k, 400, 3, 0.06, 0.18 * s, 0.08 + i * 0.05); },
    bigsword: (K, k, s) => { K.tone('sine', 1600 * k, 260 * k, 0.32, 0.12 * s); K.noise('bandpass', 3000 * k, 600 * k, 1, 0.3, 0.16 * s); R.explosion(K, k * 0.8, s * 0.85, 1, 0.3); K.inst('bell', 220 * k, 1.2, 0.6 * s, 0.3); },
    // ===== 신성 · 방패 =====
    shieldbash: (K, k, s) => { K.drum('metal', 0.9 * s); K.tone('square', 320 * k, 240 * k, 0.1, 0.06 * s); R.thump(K, k, s * 0.8); },
    shieldthrow: (K, k, s) => { for (let i = 0; i < 4; i++) K.noise('bandpass', 2200 * k, 1400 * k, 4, 0.06, 0.26 * s, i * 0.05); K.drum('metal', 0.7 * s); },
    hammer: (K, k, s) => { K.drum('anvil', 0.9 * s, 0.22); K.tone('sine', 110 * k, 40, 0.45, 0.7 * s, 0.22); K.inst('choir', N(392, 0) * k, 0.5, 0.5 * s); },
    holy: (K, k, s) => { for (const [i, st] of [[0, 0], [1, 4], [2, 7]]) K.inst('choir', N(392 * k, st), 0.5, 0.45 * s, i * 0.02); K.inst('bell', N(784 * k, 7), 1, 0.4 * s, 0.05); },
    holyblast: (K, k, s) => { R.holy(K, k, s); K.tone('sine', 300 * k, 900 * k, 0.4, 0.12 * s); K.noise('highpass', 2000, 6000, 0.6, 0.5, 0.12 * s, 0.1); },
    holyrain: (K, k, s) => { for (let i = 0; i < 4; i++) K.inst('glass', N(1046 * k, [0, 4, 7, 12][i]), 0.4, 0.4 * s, i * 0.07); K.noise('highpass', 3000, 7000, 0.6, 0.35, 0.1 * s); },
    sanct: (K, k, s) => { for (const st of [0, 4, 7, 11]) K.inst('choir', N(330 * k, st), 1.2, 0.35 * s); K.inst('bell', 660 * k, 1.6, 0.5 * s, 0.1); },
    // ===== 활 · 석궁 =====
    bow: (K, k, s, n = 1, d0 = 0) => { for (let i = 0; i < Math.min(n, 6); i++) { const d = d0 + i * 0.055; K.inst('pluck', 196 * k, 0.12, 0.7 * s, d); K.noise('highpass', 2500 * k, 6000 * k, 0.7, 0.12, 0.12 * s, d + 0.01); } },
    bowwind: (K, k, s) => { R.bow(K, k, s); K.noise('bandpass', 500 * k, 2400 * k, 1.5, 0.35, 0.18 * s, 0.03); },
    arrowrain: (K, k, s) => { R.bow(K, k * 1.1, s, 1); for (let i = 0; i < 7; i++) K.noise('highpass', 5000, 2600, 1, 0.12, 0.08 * s, 0.25 + i * 0.05); },
    hawk: (K, k, s) => { R.bow(K, k, s); K.tone('sine', 2400 * k, 1500 * k, 0.22, 0.12 * s, 0.03); K.tone('sine', 2200 * k, 1700 * k, 0.12, 0.08 * s, 0.2); for (let i = 0; i < 3; i++) K.noise('lowpass', 800, 300, 1, 0.06, 0.12 * s, 0.05 + i * 0.08); },
    whirlwind: (K, k, s) => { K.noise('bandpass', 400 * k, 1800 * k, 2.5, 0.6, 0.2 * s); K.noise('bandpass', 1800 * k, 500 * k, 2.5, 0.6, 0.15 * s, 0.25); },
    bolt: (K, k, s) => { K.drum('tek', 0.9 * s); K.tone('square', 150 * k, 90 * k, 0.07, 0.08 * s); K.noise('highpass', 3000, 6000, 0.7, 0.1, 0.14 * s, 0.02); },
    shotgun: (K, k, s) => { K.noise('lowpass', 4000 * k, 600, 0.8, 0.14, 0.4 * s); K.tone('sine', 160 * k, 60, 0.12, 0.4 * s); },
    snipe: (K, k, s) => { K.noise('highpass', 2500, 7000, 0.7, 0.06, 0.5 * s); K.tone('square', 1800 * k, 160 * k, 0.12, 0.1 * s); K.tone('sine', 110, 40, 0.3, 0.4 * s); },
    beam: (K, k, s) => { K.tone('sawtooth', 700 * k, 1800 * k, 0.32, 0.07 * s); K.tone('sine', 1400 * k, 2800 * k, 0.3, 0.1 * s); K.noise('highpass', 4000, 9000, 0.6, 0.4, 0.14 * s); },
    mine: (K, k, s) => { K.tone('square', 1100 * k, 1100 * k, 0.05, 0.06 * s); K.tone('square', 1100 * k, 1100 * k, 0.05, 0.06 * s, 0.1); R.explosion(K, k, s * 0.7, 1, 0.3); },
    smoke: (K, k, s) => { K.noise('lowpass', 1200 * k, 300, 0.7, 0.5, 0.3 * s); R.bolt(K, k, s); },
    aim: (K, k, s) => { K.tone('sine', 800 * k, 1600 * k, 0.32, 0.12 * s); K.tone('square', 1600 * k, 1600 * k, 0.03, 0.05 * s, 0.32); },
    // ===== 불 =====
    fire: (K, k, s) => { K.noise('lowpass', 3200 * k, 500, 0.8, 0.35, 0.3 * s); for (let i = 0; i < 4; i++) K.noise('bandpass', RND(1800, 3600), 1500, 4, 0.03, 0.12 * s, 0.05 + i * 0.06); },
    fireball: (K, k, s) => { K.noise('bandpass', 600 * k, 1800 * k, 0.9, 0.3, 0.3 * s); K.tone('sawtooth', 160 * k, 90 * k, 0.25, 0.06 * s); R.fire(K, k, s * 0.5); },
    explosion: (K, k, s, _n, d = 0) => { K.noise('lowpass', 2200 * k, 160, 0.7, 0.55, 0.45 * s, d); K.tone('sine', 95 * k, 35, 0.45, 0.5 * s, d); },
    firestorm: (K, k, s) => { K.noise('bandpass', 300 * k, 1600 * k, 1.5, 0.7, 0.28 * s); R.fire(K, k, s); },
    firepillar: (K, k, s) => { for (let i = 0; i < 3; i++) { K.noise('bandpass', 400 * k, 2600 * k, 1, 0.25, 0.25 * s, i * 0.13); K.tone('sine', 90, 50, 0.2, 0.3 * s, i * 0.13); } },
    firerain: (K, k, s) => { for (let i = 0; i < 4; i++) K.tone('sine', 1300 * k, 500 * k, 0.25, 0.05 * s, i * 0.08); R.explosion(K, k * 1.2, s * 0.6, 1, 0.35); },
    meteor: (K, k, s) => { K.tone('sine', 1800 * k, 200 * k, 0.5, 0.1 * s); K.noise('bandpass', 4000, 500, 1, 0.5, 0.14 * s); R.explosion(K, k * 0.8, s * 0.85, 1, 0.45); },
    // ===== 얼음 · 번개 · 마법 =====
    magic: (K, k, s) => { for (let i = 0; i < 3; i++) K.inst('glass', N(880 * k, [0, 7, 12][i]), 0.35, 0.45 * s, i * 0.04); K.tone('sine', 500 * k, 1100 * k, 0.15, 0.08 * s); },
    magicblast: (K, k, s) => { R.magic(K, k, s); K.noise('bandpass', 900 * k, 300 * k, 1, 0.4, 0.3 * s, 0.05); K.tone('sine', 220 * k, 70, 0.35, 0.4 * s, 0.05); },
    ice: (K, k, s) => { for (let i = 0; i < 4; i++) K.inst('glass', N(1318 * k, [0, 3, 7, 10][i]), 0.3, 0.4 * s, i * 0.025); K.noise('highpass', 5000, 8000, 2, 0.12, 0.18 * s); },
    freeze: (K, k, s) => { K.noise('bandpass', 5200 * k, 2500 * k, 6, 0.35, 0.3 * s); for (let i = 0; i < 5; i++) K.inst('glass', N(1046 * k, [0, 2, 5, 9, 12][i]), 0.5, 0.35 * s, i * 0.05); K.tone('sine', 100, 50, 0.3, 0.3 * s); },
    zap: (K, k, s, _n, d = 0) => { K.noise('highpass', 3000, 6000, 1, 0.06, 0.3 * s, d); K.tone('square', 1500 * k, 140 * k, 0.12, 0.09 * s, d); },
    thunder: (K, k, s) => { R.zap(K, k, s); K.noise('lowpass', 600, 80, 0.7, 0.9, 0.4 * s, 0.05); K.tone('sine', 60, 30, 0.8, 0.4 * s, 0.05); },
    chain: (K, k, s) => { for (let i = 0; i < 3; i++) R.zap(K, k * (1 + i * 0.12), s * 0.8, 1, i * 0.08); },
    // ===== 그림자 · 독 =====
    shadow: (K, k, s) => { K.tone('sawtooth', 130 * k, 70 * k, 0.35, 0.07 * s); K.swell('bandpass', 400 * k, 1400 * k, 1.2, 0.25, 0.2 * s); },
    darkslash: (K, k, s) => { R.shadow(K, k, s); for (let i = 0; i < 3; i++) K.noise('bandpass', 2600 * k, 900 * k, 1.5, 0.12, 0.2 * s, 0.2 + i * 0.09); },
    shuriken: (K, k, s, n = 1) => { for (let i = 0; i < Math.min(n, 4); i++) { K.tone('square', 2000 * k, 1300 * k, 0.12, 0.06 * s, i * 0.05); K.noise('bandpass', 5200 * k, 3000 * k, 3, 0.1, 0.24 * s, i * 0.05); } },
    venom: (K, k, s) => { for (let i = 0; i < 4; i++) K.tone('sine', RND(300, 650) * k, RND(500, 900) * k, 0.06, 0.12 * s, i * 0.05); R.dagger(K, k, s * 0.7, 2); },
    // ===== 버프 · 이동 · 회복 =====
    blink: (K, k, s) => { K.tone('sine', 400 * k, 1800 * k, 0.12, 0.12 * s); K.inst('glass', 1568 * k, 0.4, 0.4 * s, 0.1); },
    heal: (K, k, s) => { for (let i = 0; i < 4; i++) K.inst('harp', N(523 * k, [0, 4, 7, 12][i]), 0.6, 0.6 * s, i * 0.06); },
    buff: (K, k, s, n, inst = 'glass') => { for (let i = 0; i < 3; i++) K.inst(inst, N(440 * k, [0, 4, 7][i]), 0.35, 0.55 * s, i * 0.07); K.noise('bandpass', 500, 3000, 1, 0.35, 0.1 * s); },
    awake: (K, k, s, n, inst = 'brass') => { K.drum('timp', 0.7 * s); for (let i = 0; i < 4; i++) K.inst(inst, N(330 * k, [0, 4, 7, 12][i]), 0.6, 0.6 * s, 0.08 + i * 0.08); K.inst('bell', 660 * k, 1.5, 0.5 * s, 0.4); K.noise('highpass', 1500, 7000, 0.5, 0.7, 0.12 * s, 0.1); },
    // ===== 타격음 (속성별) =====
    hit: (K, k, s) => { K.tone('square', 230 * k, 140, 0.05, 0.07 * s); K.noise('bandpass', 1800 * k, 700, 1, 0.05, 0.16 * s); },
    crit: (K, k, s) => { R.hit(K, k * 1.3, s * 1.2); K.tone('square', 640 * k, 320, 0.08, 0.06 * s, 0.03); K.noise('highpass', 3000, 8000, 0.6, 0.12, 0.12 * s, 0.02); },
    hitFire: (K, k, s) => { R.hit(K, k, s); K.noise('lowpass', 2600, 500, 0.8, 0.12, 0.14 * s); },
    hitWind: (K, k, s) => { R.hit(K, k * 1.2, s * 0.8); K.noise('bandpass', 2800, 1200, 1.5, 0.07, 0.14 * s); },
    hitArcane: (K, k, s) => { R.hit(K, k, s * 0.7); K.inst('glass', 1046 * k, 0.15, 0.25 * s); },
    hitShadow: (K, k, s) => { R.hit(K, k * 0.8, s); K.tone('sawtooth', 160, 90, 0.08, 0.04 * s); },
    hitPoison: (K, k, s) => { R.hit(K, k, s * 0.8); K.tone('sine', 420, 700, 0.05, 0.08 * s, 0.02); },
    hitEarth: (K, k, s) => { R.hit(K, k * 0.7, s); K.tone('sine', 120, 50, 0.1, 0.25 * s); },
    hitHoly: (K, k, s) => { R.hit(K, k * 1.1, s * 0.8); K.drum('metal', 0.25 * s); },
    // ===== 상태 · 특수 =====
    burn: (K, k, s) => K.noise('lowpass', 2400, 600, 0.8, 0.18, 0.12 * s),
    frozen: (K, k, s) => { K.inst('glass', 1760, 0.25, 0.35 * s); K.noise('highpass', 5000, 8000, 3, 0.08, 0.12 * s); },
    mark: (K, k, s) => { K.tone('sine', 1200, 1200, 0.06, 0.08 * s); K.tone('sine', 1800, 1800, 0.08, 0.06 * s, 0.07); },
    poisonStack: (K, k, s) => K.tone('sine', 380 * k, 620 * k, 0.07, 0.1 * s),
    lantern: (K, k, s) => { for (const [i, st] of [[0, 0], [1, 7], [2, 12], [3, 16], [4, 19]]) K.inst('musicbox', N(523, st), 1.6, 0.45 * s, i * 0.28); K.inst('pad', 262, 2.5, 0.8 * s, 0.2); },
    cheer: (K, k, s) => { for (let i = 0; i < 5; i++) K.inst('glass', N(784, [0, 4, 7, 12, 16][i]), 0.5, 0.5 * s, i * 0.06); K.inst('harp', 1046, 1, 0.5 * s, 0.3); },
    // ===== 몬스터 스킬 (8가지 틀) =====
    mDash: (K, k, s) => { K.noise('bandpass', 400, 1800, 1, 0.28, 0.2 * s); K.tone('sine', 120, 55, 0.18, 0.35 * s, 0.22); },
    mSlam: (K, k, s) => { K.tone('sine', 90, 35, 0.4, 0.6 * s); K.noise('lowpass', 800, 150, 0.7, 0.35, 0.3 * s); },
    mVolley: (K, k, s) => { for (let i = 0; i < 3; i++) K.noise('bandpass', 2200, 900, 1.5, 0.08, 0.26 * s, i * 0.04); },
    mZone: (K, k, s) => { for (let i = 0; i < 5; i++) K.tone('sine', RND(200, 420), RND(300, 600), 0.07, 0.08 * s, i * 0.06); K.noise('lowpass', 900, 300, 0.7, 0.4, 0.12 * s); },
    mLeap: (K, k, s) => { K.tone('sine', 200, 500, 0.15, 0.08 * s); K.tone('sine', 110, 40, 0.3, 0.5 * s, 0.45); },
    mBuff: (K, k, s) => { const o = 110; K.tone('sawtooth', o, o * 0.8, 0.45, 0.06 * s); K.tone('sawtooth', o * 1.5, o * 1.2, 0.45, 0.04 * s); K.noise('lowpass', 700, 300, 1, 0.4, 0.12 * s); },
    mBlink: (K, k, s) => { K.noise('lowpass', 1600, 300, 0.7, 0.3, 0.2 * s); K.tone('sine', 900, 300, 0.15, 0.06 * s); },
    mDrop: (K, k, s) => { K.tone('sine', 1500, 400, 0.15, 0.05 * s); K.tone('sine', 100, 40, 0.25, 0.45 * s, 0.15); K.noise('lowpass', 1400, 200, 0.7, 0.2, 0.2 * s, 0.15); },
    // ===== 보스 패턴 (시작할 때) =====
    bWarn: (K, k, s) => { K.tone('sawtooth', 110, 90, 0.4, 0.08 * s); K.noise('lowpass', 600, 200, 1, 0.4, 0.15 * s); },
    bHeavy: (K, k, s) => { K.swell('lowpass', 300, 900, 1, 0.5, 0.25 * s); K.tone('sine', 80, 50, 0.6, 0.4 * s, 0.4); },
    bShots: (K, k, s) => { K.tone('sine', 600, 1200, 0.3, 0.08 * s); for (let i = 0; i < 3; i++) K.noise('bandpass', 2000, 900, 1.5, 0.1, 0.12 * s, 0.25 + i * 0.06); },
    bSummon: (K, k, s) => { for (const st of [0, 7, 12]) K.inst('brass', N(98, st), 0.8, 0.8 * s); K.drum('timp', 0.6 * s); },
    bSmoke: (K, k, s) => K.noise('lowpass', 1400, 250, 0.7, 0.8, 0.35 * s),
    bHands: (K, k, s) => { K.swell('lowpass', 150, 700, 1, 0.8, 0.3 * s); K.tone('sawtooth', 70, 55, 0.9, 0.06 * s); },
    bOrbs: (K, k, s) => { K.tone('sine', 220, 330, 0.6, 0.12 * s); K.tone('sine', 233, 311, 0.6, 0.08 * s); },
    bChain: (K, k, s) => { for (let i = 0; i < 5; i++) K.drum('metal', 0.75 * s, i * 0.07); },
    bCut: (K, k, s) => { K.tone('sine', 3000, 600, 0.5, 0.1 * s); K.noise('highpass', 6000, 2000, 1, 0.5, 0.15 * s); },
    bErosion: (K, k, s) => { K.swell('lowpass', 200, 900, 0.8, 1.2, 0.3 * s); K.tone('sawtooth', 65, 62, 1.2, 0.06 * s); },
    bPull: (K, k, s) => { K.swell('bandpass', 2000, 300, 1.5, 1.0, 0.3 * s); },
    bDoom: (K, k, s) => { K.inst('bell', 110, 3, 1 * s); K.inst('bell', 116, 3, 0.6 * s, 0.02); K.drum('timp', 0.8 * s, 0.05); },
    bDespair: (K, k, s) => { for (const st of [0, 1, 6]) K.inst('strings', N(147, st), 1.4, 1 * s); },
    bNova: (K, k, s) => { for (const st of [0, 4, 7]) K.inst('choir', N(262, st), 0.9, 0.6 * s); K.swell('highpass', 1000, 5000, 0.6, 0.6, 0.15 * s); },
    bTeleport: (K, k, s) => { K.tone('sine', 1800, 300, 0.2, 0.1 * s); K.noise('lowpass', 1600, 300, 0.7, 0.25, 0.2 * s); },
    bOverheat: (K, k, s) => { for (let i = 0; i < 3; i++) K.tone('square', 880, 880, 0.12, 0.05 * s, i * 0.24); K.noise('highpass', 2000, 6000, 0.7, 0.9, 0.22 * s, 0.1); },
    bCurse: (K, k, s) => { for (const st of [0, 3, 6]) K.inst('pad', N(196, st), 1, 1.2 * s); },
  };
  const BOSS = { melee: 'bHeavy', nova: 'bNova', guard: 'bChain', shots: 'bShots', dash: 'bHeavy', summon: 'bSummon', smoke: 'bSmoke', hands: 'bHands', orbs: 'bOrbs',
    chain: 'bChain', half: 'bErosion', overheat: 'bOverheat', curse: 'bCurse', silence: 'bCurse', invert: 'bCurse', teleport: 'bTeleport', waves: 'bCut', echo: 'bNova',
    cut: 'bCut', erosion: 'bErosion', pull: 'bPull', doom: 'bDoom', despair: 'bDespair' };
  const MON = { dash: 'mDash', slam: 'mSlam', volley: 'mVolley', zone: 'mZone', leap: 'mLeap', buff: 'mBuff', blink: 'mBlink', drop: 'mDrop' };

  // ---------- 스킬 → 소리 ----------
  // 직접 정한 것 (몇몇 대표 스킬). [레시피, 음높이, 크기, 개수]
  const SKILL_SOUND = {
    w_strike: ['heavy', 1.1, 0.9], w_whirl: ['whirl', 1.1], w_charge: ['dash', 1.1], m_bolt: ['magic', 1.2, 0.8], m_burst: ['magicblast', 1.1],
    t_double: ['dagger', 1.15, 0.9, 2], t_star: ['shuriken', 1.1, 0.9, 1], t_shadow: ['shadow', 1.1], a_double: ['bow', 1.1, 0.9, 2], a_rain: ['arrowrain', 1.1], a_back: ['leapshot', 1.1],
    b_stone: ['thump', 1.6, 0.6], b_aid: ['heal', 1], m_blink: ['blink', 1], w3a_quake: ['quake', 1], w4b_judge: ['holyrain', 0.9, 1.2], m2b_chain: ['chain', 1], m4b_final: ['thunder', 0.8, 1.4],
    t2a_triple: ['shuriken', 1.05, 1, 3], t3a_shadowstar: ['shuriken', 0.85, 1.1, 2], t4a_night: ['shuriken', 0.95, 1.2, 4], t2a_vital: ['dagger', 1.0, 1, 3], t2b_dance: ['dagger', 1.1, 1, 4],
    t2b_toss: ['venom', 1], t4b_thousand: ['bladestorm', 0.9, 1.3], t4b_final: ['bladestorm', 0.8, 1.4], m3b_freeze: ['freeze', 1], m4b_zero: ['freeze', 0.8, 1.4],
  };
  const BY_PROJ = { bolt: 'bolt', hawk: 'hawk', windarrow: 'bowwind', shieldp: 'shieldthrow', crescent: 'bladewave', fsword: 'meteor', lspear: 'holyrain', flamedrop: 'firerain',
    meteor: 'meteor', fireball: 'fireball', inferno: 'fireball', firelance: 'fireball', icebeam: 'ice', icicle: 'ice', icespear: 'ice', lightning: 'thunder', bigstar: 'shuriken',
    pdagger: 'venom', blade: 'bladestorm', starorb: 'magic', mine: 'mine', pellet: 'shotgun' };
  const BY_FX = { bigsword: 'bigsword', bigsword2: 'bigsword', hammer: 'hammer', quake: 'quake', cross: 'holyblast', lbeam: 'beam', stormcloud: 'thunder', gate: 'arrowrain',
    smoke: 'smoke', darknight: 'darkslash', thousand: 'bladestorm', bladewind: 'bladestorm', firetornado: 'firestorm', icecrack: 'freeze', frostscreen: 'freeze', sun: 'meteor',
    magiccircle: 'magicblast', clones: 'shuriken', pillars: 'firepillar', rocks: 'rocks', firering: 'firestorm', firering2: 'firestorm', goldwave: 'holyblast',
    shieldflash: 'shieldbash', lightpillar: 'holyblast', firebloom: 'explosion', floatblades: 'bladestorm', mist: 'shadow', shadowpuff: 'shadow', starring: 'shuriken', cloud: 'thunder', dust: 'heavy' };
  const BY_KIND = {
    melee: { fire: 'heavy', holy: 'shieldbash', earth: 'slash', wind: 'slash', shadow: 'dagger', poison: 'dagger', arcane: 'magic' },
    aoe: { fire: 'explosion', holy: 'holyblast', arcane: 'magicblast', shadow: 'darkslash', poison: 'bladestorm', earth: 'quake', wind: 'whirl' },
    proj: { wind: 'bow', earth: 'bolt', fire: 'fireball', arcane: 'magic', shadow: 'shuriken', poison: 'dagger', holy: 'holyrain' },
    rain: { wind: 'arrowrain', earth: 'arrowrain', fire: 'firerain', holy: 'holyrain', arcane: 'thunder', shadow: 'shuriken', poison: 'bladestorm' },
    dash: { holy: 'dash', fire: 'dash', shadow: 'shadow', poison: 'shadow' }, back: {},
  };
  const BUFF_INST = { fire: 'brass', wind: 'flute', arcane: 'glass', shadow: 'organ', poison: 'pluck', earth: 'harp', holy: 'choir' };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
  function skillSound(sk) {
    if (SKILL_SOUND[sk.id]) { const [r, k = 1, s = 1, n = 1] = SKILL_SOUND[sk.id]; return { r, k, s, n }; }
    const tier = (G.JOBS[sk.job] && G.JOBS[sk.job].tier) || 1, el = sk.icon && sk.icon.el;
    const k = [1.15, 1.1, 1.03, 0.95, 0.88][tier] * (1 + ((hash(sk.id) % 9) - 4) * 0.018), s = tier >= 4 ? 1.25 : tier === 3 ? 1.1 : 1;
    if (sk.type === 'buff') return { r: tier >= 4 ? 'awake' : 'buff', k, s, inst: BUFF_INST[el] || 'glass' };
    if (sk.type === 'heal') return { r: 'heal', k, s };
    if (sk.type === 'move') return { r: 'blink', k, s };
    if (sk.type !== 'attack') return null;
    const X = G.SKILL_X[sk.id] || {}, a = sk.atk || {};
    const r = (X.proj && BY_PROJ[X.proj]) || (X.fx && BY_FX[X.fx]) || (BY_KIND[a.kind] && BY_KIND[a.kind][el]) ||
      (a.kind === 'proj' ? 'bow' : a.kind === 'rain' ? 'arrowrain' : a.kind === 'dash' ? 'dash' : a.kind === 'back' ? 'leapshot' : a.kind === 'aoe' ? 'explosion' : 'slash');
    const n = r === 'bow' || r === 'shuriken' || r === 'dagger' ? Math.max(1, Math.min(a.count || a.hits || 1, 5)) : 1;
    return { r, k, s, n };
  }
  const HIT_BY_EL = { fire: 'hitFire', wind: 'hitWind', arcane: 'hitArcane', shadow: 'hitShadow', poison: 'hitPoison', earth: 'hitEarth', holy: 'hitHoly' };

  // ---------- 재생 (몰릴 때 줄이기) ----------
  const recent = {};   // 레시피별 최근 재생 시각들
  G.Sound = {
    R, BOSS, MON, skillSound,
    LIMIT: { hit: 3, crit: 2, burn: 1, poisonStack: 1, frozen: 1, mark: 1, chain: 1, explosion: 2 },
    play(name, opt = {}) {
      const A = G.Audio, ctx = opt.ctx || A.ctx, dest0 = opt.dest || A.sfxBus;
      if (!R[name] || !ctx || !dest0 || (!opt.ctx && (!G.Settings.sfx || ctx.state !== 'running'))) return;
      const now = ctx.currentTime, key = opt.key || name, win = 0.08, max = opt.max || this.LIMIT[key] || this.LIMIT[name] || (name.startsWith('hit') ? 3 : 2);
      const list = (recent[key] = (recent[key] || []).filter(t => now - t < win));
      if (!opt.ctx && list.length >= max) return;
      list.push(now);
      const g = ctx.createGain(); g.gain.value = (opt.vol == null ? 1 : opt.vol) * 0.9; g.connect(dest0);
      try { R[name](kit(ctx, g, now + (opt.delay || 0) + 0.005), opt.k || 1, opt.s || 1, opt.n, opt.inst); } catch (e) { /* 소리 실패는 게임에 영향 없음 */ }
      setTimeout(() => { try { g.disconnect(); } catch (e) { /* 이미 끊김 */ } }, 5000);
    },
    skill(sk, opt = {}) {
      const S = skillSound(sk);
      if (!S) { G.Audio.play('skill'); return; }
      this.play(S.r, Object.assign({ k: S.k, s: S.s, n: S.n, inst: S.inst, key: 'skill:' + sk.id, max: 2 }, opt));
    },
    // 타격음: 색(속성 색)으로 속성을 찾는다
    hit(color, crit) {
      if (!this.elOf) { this.elOf = {}; for (const k in G.FX.EL) this.elOf[G.FX.EL[k]] = k; }
      const el = this.elOf[color];
      if (crit) this.play('crit', { key: 'crit' });
      else this.play(el ? HIT_BY_EL[el] : 'hit', { key: 'hit', vol: 0.8 });
    },
    // 플레이어와 멀수록 작게 (몬스터 · 보스)
    near(name, x, opt = {}) {
      const p = G.Game.player; if (!p) return;
      const d = Math.abs(p.x - x), v = Math.max(0, 1 - d / 1000);
      if (v > 0.05) this.play(name, Object.assign({ vol: v * (opt.vol || 0.6) }, opt));
    },
  };
})();
