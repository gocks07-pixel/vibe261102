'use strict';
// 배경음악 엔진 (Web Audio로 직접 연주. 외부 음원 파일 없음)
//  - G.Synth: 악기 음색 합성 (멜로디 악기 + 타악기)
//  - G.Music: 곡 재생, 끊김 없는 반복, 크로스페이드, 효과음 중 배경음악 줄이기(더킹)
//  곡 데이터는 src/data/songs.js (G.SONGS)

// ======================= 악기 =======================
G.Synth = {
  noise: null,
  // osc: 파형, det: 두 번째 오실레이터 디튠(센트), add: [배수, 음량, 파형] 배음 추가
  // a/d/s/r: 엔벨로프 (s = 0 이면 d 동안 소리가 자연스럽게 사라지는 발현악기)
  // filt: 고정 로우패스, fenv: [시작, 최고, 유지] 필터 엔벨로프, vib: [속도Hz, 깊이(비율)]
  INST: {
    pulse:    { osc: 'square', a: 0.005, d: 0.12, s: 0.55, r: 0.06, g: 0.13, filt: 3800 },
    tri:      { osc: 'triangle', a: 0.005, d: 0.1, s: 0.7, r: 0.08, g: 0.34 },
    reed:     { osc: 'sawtooth', det: 6, a: 0.02, d: 0.1, s: 0.75, r: 0.08, g: 0.09, filt: 1700, vib: [5.5, 0.004] },
    flute:    { osc: 'sine', add: [2, 0.12, 'sine'], a: 0.05, d: 0.1, s: 0.85, r: 0.12, g: 0.34, vib: [5.2, 0.006], vibDelay: 0.18 },
    harp:     { osc: 'triangle', add: [2, 0.25, 'sine'], a: 0.003, d: 1.3, s: 0, r: 0.25, g: 0.3 },
    musicbox: { osc: 'sine', add: [4, 0.18, 'sine'], a: 0.002, d: 1.5, s: 0, r: 0.3, g: 0.3 },
    bell:     { fm: [3.5, 3.2], a: 0.002, d: 2.4, s: 0, r: 0.4, g: 0.24 },
    glass:    { osc: 'sine', add: [2.76, 0.16, 'sine'], a: 0.003, d: 1.1, s: 0.08, r: 0.35, g: 0.26 },
    brass:    { osc: 'sawtooth', det: 5, a: 0.035, d: 0.22, s: 0.72, r: 0.12, g: 0.1, fenv: [450, 2600, 1300] },
    strings:  { osc: 'sawtooth', det: 9, a: 0.22, d: 0.3, s: 0.85, r: 0.45, g: 0.07, filt: 1600, vib: [4.8, 0.003], vibDelay: 0.3 },
    pad:      { osc: 'sawtooth', det: 12, a: 0.5, d: 0.5, s: 0.9, r: 0.9, g: 0.045, filt: 900 },
    choir:    { osc: 'triangle', det: 14, add: [2, 0.2, 'sine'], a: 0.4, d: 0.3, s: 0.9, r: 0.7, g: 0.2, band: 900, vib: [4.5, 0.005] },
    organ:    { osc: 'sine', add: [2, 0.5, 'sine'], add2: [3, 0.28, 'sine'], a: 0.02, d: 0.1, s: 0.9, r: 0.15, g: 0.18 },
    saw:      { osc: 'sawtooth', det: 7, a: 0.006, d: 0.12, s: 0.6, r: 0.06, g: 0.08, filt: 2400 },
    pluck:    { osc: 'sawtooth', a: 0.003, d: 0.6, s: 0, r: 0.15, g: 0.14, fenv: [2600, 2600, 350] },
    bass:     { osc: 'triangle', a: 0.006, d: 0.2, s: 0.85, r: 0.06, g: 0.5 },
    sqbass:   { osc: 'square', a: 0.005, d: 0.15, s: 0.7, r: 0.05, g: 0.13, filt: 700 },
    sawbass:  { osc: 'sawtooth', a: 0.005, d: 0.15, s: 0.7, r: 0.05, g: 0.14, filt: 850 },
  },

  noiseBuf(ctx) {
    if (this.noise && this.noise.sampleRate === ctx.sampleRate) return this.noise;
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    return (this.noise = b);
  },

  // 음 하나 연주. t: 시작 시각, dur: 누르고 있는 시간, vel: 음량 배율
  note(ctx, dest, name, t, freq, dur, vel = 1) {
    const I = this.INST[name] || this.INST.tri;
    const out = ctx.createGain(), peak = I.g * vel;
    const end = I.s > 0 ? t + Math.max(dur, I.a + 0.01) : t + I.a + I.d;
    const stopAt = end + I.r + 0.05;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(peak, t + I.a);
    if (I.s > 0) {
      out.gain.setTargetAtTime(peak * I.s, t + I.a, I.d / 3);
      out.gain.setValueAtTime(peak * I.s, end);
      out.gain.linearRampToValueAtTime(0.0001, end + I.r);
    } else {
      out.gain.exponentialRampToValueAtTime(0.0001, end);
    }
    let node = out;
    if (I.filt || I.fenv || I.band) {
      const f = ctx.createBiquadFilter();
      if (I.band) { f.type = 'bandpass'; f.frequency.value = I.band; f.Q.value = 0.8; }
      else {
        f.type = 'lowpass'; f.Q.value = 1;
        if (I.fenv) {
          f.frequency.setValueAtTime(I.fenv[0], t);
          f.frequency.linearRampToValueAtTime(I.fenv[1], t + Math.max(0.02, I.a));
          f.frequency.setTargetAtTime(I.fenv[2], t + I.a, 0.12);
        } else f.frequency.value = I.filt;
      }
      f.connect(out); node = f;
    }
    out.connect(dest);
    const oscs = [];
    const mk = (type, mul, vol) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq * mul;
      if (vol === 1) o.connect(node);
      else { const g = ctx.createGain(); g.gain.value = vol; o.connect(g); g.connect(node); }
      oscs.push(o); return o;
    };
    if (I.fm) {   // FM 종소리
      const car = mk('sine', 1, 1), mod = ctx.createOscillator(), mg = ctx.createGain();
      mod.frequency.value = freq * I.fm[0];
      mg.gain.setValueAtTime(freq * I.fm[1], t);
      mg.gain.exponentialRampToValueAtTime(freq * 0.05, t + I.d * 0.6);
      mod.connect(mg); mg.connect(car.frequency); oscs.push(mod);
    } else {
      mk(I.osc, 1, 1);
      if (I.det) mk(I.osc, 1, 0.8).detune.value = I.det;
      if (I.add) mk(I.add[2], I.add[0], I.add[1]);
      if (I.add2) mk(I.add2[2], I.add2[0], I.add2[1]);
    }
    if (I.vib) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = I.vib[0];
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(freq * I.vib[1], t + (I.vibDelay || 0.05) + 0.2);
      lfo.connect(lg);
      for (const o of oscs) lg.connect(o.frequency);
      oscs.push(lfo);
    }
    for (const o of oscs) { o.start(t); o.stop(stopAt); }
  },

  // 타악기
  drum(ctx, dest, name, t, vel = 1) {
    const env = (g, peak, dec, at = t) => { g.gain.setValueAtTime(peak * vel, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dec); };
    const noise = (filtType, f, q, peak, dec, at = t) => {
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf(ctx);
      const fl = ctx.createBiquadFilter(); fl.type = filtType; fl.frequency.value = f; fl.Q.value = q;
      const g = ctx.createGain(); env(g, peak, dec, at);
      s.connect(fl); fl.connect(g); g.connect(dest);
      s.start(at, Math.random() * 0.5); s.stop(at + dec + 0.02);
    };
    const tone = (type, f0, f1, peak, dec, pdec = dec, at = t) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type;
      o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + pdec);
      env(g, peak, dec, at); o.connect(g); g.connect(dest); o.start(at); o.stop(at + dec + 0.02);
    };
    switch (name) {
      case 'kick': tone('sine', 150, 42, 0.9, 0.32, 0.12); break;
      case 'snare': noise('bandpass', 1900, 0.7, 0.42, 0.16); tone('triangle', 200, 160, 0.25, 0.08); break;
      case 'hat': noise('highpass', 7500, 0.5, 0.16, 0.04); break;
      case 'ohat': noise('highpass', 7000, 0.5, 0.13, 0.22); break;
      case 'shaker': noise('highpass', 5200, 0.6, 0.09, 0.06); break;
      case 'clap': for (let i = 0; i < 3; i++) noise('bandpass', 1300, 1.2, 0.3, 0.05 + i * 0.03, t + i * 0.012); break;
      case 'tom': tone('sine', 170, 85, 0.6, 0.3, 0.2); break;
      case 'timp': tone('sine', 98, 82, 0.7, 0.9, 0.5); tone('triangle', 196, 170, 0.12, 0.5, 0.4); break;
      case 'anvil': tone('square', 830, 820, 0.09, 0.3); tone('square', 1247, 1240, 0.07, 0.22); noise('bandpass', 4000, 3, 0.18, 0.05); break;
      case 'metal': noise('bandpass', 5200, 7, 0.4, 0.09); tone('square', 1580, 1560, 0.035, 0.07); break;
      case 'doum': tone('sine', 120, 82, 0.7, 0.35, 0.25); break;
      case 'tek': noise('bandpass', 3200, 2, 0.25, 0.05); tone('sine', 620, 540, 0.15, 0.06); break;
      case 'wind': {
        const s = ctx.createBufferSource(); s.buffer = this.noiseBuf(ctx); s.loop = true;
        const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 3;
        fl.frequency.setValueAtTime(500, t); fl.frequency.linearRampToValueAtTime(1600, t + 1.2); fl.frequency.linearRampToValueAtTime(600, t + 2.6);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12 * vel, t + 1); g.gain.linearRampToValueAtTime(0.0001, t + 2.7);
        s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t + 2.8);
        break;
      }
    }
  },
};

// ======================= 곡 해석 =======================
G.Music = {
  MODES: {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    mixo: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11], hijaz: [0, 1, 4, 5, 7, 8, 10], locrian: [0, 1, 3, 5, 6, 8, 10],
  },
  KEYS: { C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 },
  QUAL: { M: [0, 4, 7], m: [0, 3, 7], d: [0, 3, 6], a: [0, 4, 8], s: [0, 5, 7] },
  cache: {},

  // 음계 도수 → MIDI 번호. deg: 1~7 (8 이상/0 이하는 옥타브 이동), acc: 반음 조정
  midi(S, deg, oct, acc = 0) {
    const sc = S.scale, n = sc.length, i = deg - 1;
    const o = Math.floor(i / n), k = ((i % n) + n) % n;
    return 12 * (oct + 1 + o) + S.root + sc[k] + acc;
  },
  // 멜로디 토큰: [#|b]도수[' 높은 옥타브|, 낮은 옥타브]  예) 5  #7,  3''  b6
  parseNote(S, tok, oct) {
    const m = /^([#b]?)([1-7])(['",]*)$/.exec(tok);
    if (!m) return null;
    let o = oct;
    for (const c of m[3]) o += c === "'" ? 1 : c === '"' ? 2 : -1;
    return this.midi(S, +m[2], o, m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0);
  },
  // 화음 토큰: [b|#]도수[M|m|d|a|s|7]  예) 1  5M  b7  4m  2s
  parseChord(S, tok, oct) {
    const m = /^([#b]?)([1-7])([Mmdas7]?)$/.exec(tok) || [null, '', '1', ''];
    const acc = m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0, deg = +m[2], q = m[3];
    const root = this.midi(S, deg, oct, acc);
    if (q && q !== '7') return this.QUAL[q].map(x => root + x);
    if (acc) return this.QUAL.M.map(x => root + x);
    const tones = [0, 2, 4].map(x => this.midi(S, deg + x, oct));
    if (q === '7') tones.push(this.midi(S, deg + 6, oct));
    return tones;
  },
  // 토큰 배열 → 이벤트 (음, 길이). '-' 앞 음 유지, '.' 쉼표
  events(tokens, fn) {
    const ev = new Array(tokens.length).fill(null);
    tokens.forEach((tk, i) => {
      if (tk === '-' || tk === '.') return;
      let len = 1;
      while (i + len < tokens.length && tokens[i + len] === '-') len++;
      ev[i] = { v: fn(tk), len };
    });
    return ev;
  },
  toks: s => s.replace(/\|/g, ' ').trim().split(/\s+/),

  compile(id) {
    if (this.cache[id]) return this.cache[id];
    const src = G.SONGS[id];
    if (!src) return null;
    const S = {
      id, bpm: src.bpm, sub: src.sub || 2, beats: src.beats || 4, swing: src.swing || 0,
      root: this.KEYS[src.key || 'C'], scale: this.MODES[src.mode || 'major'], parts: [],
    };
    S.bar = S.beats * S.sub;
    S.stepDur = 60 / S.bpm / S.sub;
    // 진행: 마디마다 화음 1개, "4/5" 처럼 쓰면 반 마디씩
    const prog = this.toks(src.prog || '1');
    S.chords = [];   // 스텝 단위 화음 변경 위치
    prog.forEach((tok, b) => {
      const parts = tok.split('/');
      parts.forEach((c, j) => S.chords.push({ at: b * S.bar + Math.round(j * S.bar / parts.length), tok: c, len: Math.round(S.bar / parts.length) }));
    });
    S.length = prog.length * S.bar;
    for (const p of src.parts) {
      const P = Object.assign({ vol: 1, oct: 4, rate: 1 }, p);
      if (p.mel) {
        const t = this.toks(p.mel);
        P.ev = this.events(t, tk => this.parseNote(S, tk, P.oct));
        P.len = t.length;
      } else if (p.pat) {
        P.tok = p.pat.replace(/\s/g, '').split('');
        P.len = P.tok.length;
        if (p.gen) P.ev = this.events(P.tok.map(c => (c === '-' || c === '.') ? c : c), c => c);
      }
      S.parts.push(P);
    }
    return (this.cache[id] = S);
  },
  chordAt(S, step) {
    const s = step % S.length;
    let c = S.chords[0];
    for (const x of S.chords) { if (x.at <= s) c = x; else break; }
    return c;
  },

  // ======================= 재생 =======================
  cur: null, want: null, wantOpt: null, timer: 0, olds: [],

  bus() { return G.Audio.musicBus; },

  play(id, fade = 1) {
    if (!id) return;
    this.want = id;
    if (this.cur && this.cur.id === id) return;
    const ctx = G.Audio.ctx;
    if (!ctx || ctx.state !== 'running' || !this.bus()) return;   // 소리 잠금 해제 후 resume()에서 시작
    const S = this.compile(id);
    if (!S) return;
    this.fadeOut(fade);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime((G.SONG_GAIN && G.SONG_GAIN[id]) || 1, ctx.currentTime + Math.max(0.05, fade));
    g.connect(this.bus());
    this.cur = { id, S, g, step: 0, next: ctx.currentTime + 0.08 };
    if (!this.timer) this.timer = setInterval(() => this.tick(), 50);
    this.tick();
  },
  // 녹스처럼 같은 전투 안에서 곡이 바뀔 때 (박자 위치는 새로 시작)
  swap(id, fade = 1.5) { if (this.cur && this.cur.id !== id) this.play(id, fade); else this.want = id; },
  stop(fade = 1) { this.want = null; this.fadeOut(fade); },
  fadeOut(fade) {
    const c = this.cur, ctx = G.Audio.ctx;
    this.cur = null;
    if (!c || !ctx) return;
    const now = ctx.currentTime;
    c.g.gain.cancelScheduledValues(now);
    c.g.gain.setValueAtTime(c.g.gain.value, now);
    c.g.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.05, fade));
    setTimeout(() => { try { c.g.disconnect(); } catch (e) { /* 이미 끊김 */ } }, (fade + 3) * 1000);
  },
  resume() { if (this.want && (!this.cur || this.cur.id !== this.want)) this.play(this.want, 1.2); },

  tick() {
    const c = this.cur, ctx = G.Audio.ctx;
    if (!c || !ctx) return;
    const ahead = document.hidden ? 1.6 : 0.3;
    if (c.next < ctx.currentTime - 0.2) c.next = ctx.currentTime + 0.05;   // 멈췄다 돌아오면 박자 다시 맞춤
    while (c.next < ctx.currentTime + ahead) {
      const sw = (c.step % 2 === 1) ? c.S.swing * c.S.stepDur : 0;
      this.step(c, c.step, c.next + sw);
      c.step++;
      c.next += c.S.stepDur;
    }
  },

  step(c, step, t) {
    const S = c.S, ctx = G.Audio.ctx, sd = S.stepDur, dest = c.g;
    const chord = this.chordAt(S, step), inBar = step % S.bar;
    const chordStart = (step % S.length) === chord.at;
    for (const P of S.parts) {
      if (P.from && (step % S.length) < P.from * S.bar) continue;   // 몇 마디 뒤부터 들어오는 파트
      if (P.drum) {
        const ch = P.tok[Math.floor(step / P.rate) % P.len];
        if (step % P.rate) continue;
        if (ch === 'x' || ch === 'X' || ch === 'o') G.Synth.drum(ctx, dest, P.drum, t, P.vol * (ch === 'X' ? 1.35 : ch === 'o' ? 0.55 : 1));
        continue;
      }
      if (P.mel) {
        if (step % P.rate) continue;
        const e = P.ev[Math.floor(step / P.rate) % P.len];
        if (e && e.v) G.Synth.note(ctx, dest, P.inst, t, this.hz(e.v), e.len * P.rate * sd * 0.92, P.vol);
        continue;
      }
      const tones = this.parseChord(S, chord.tok, P.oct);
      if (P.gen === 'pad') {
        if (chordStart) for (const m of tones) G.Synth.note(ctx, dest, P.inst, t, this.hz(m), chord.len * sd * 0.98, P.vol);
        continue;
      }
      if (step % P.rate) continue;
      const idx = Math.floor((P.bar ? inBar : step) / P.rate) % P.len, e = P.ev[idx];
      if (!e) continue;
      const len = e.len * P.rate * sd * 0.9;
      if (P.gen === 'bass') {   // R 근음, F 5음, O 옥타브, T 3음, L 아래 5음
        const r = tones[0] - (tones[0] - (12 * (P.oct + 1) + S.root) >= 7 ? 12 : 0);
        const off = { R: 0, F: 7, O: 12, T: tones[1] - tones[0], L: -5 }[e.v];
        if (off != null) G.Synth.note(ctx, dest, P.inst, t, this.hz(r + off), len, P.vol);
      } else if (P.gen === 'arp') {   // 1~4 화음 구성음 (4 = 근음 한 옥타브 위), 5~6 = 3음·5음 한 옥타브 위
        const k = +e.v;
        if (k >= 1 && k <= 6) {
          const m = k <= 3 ? tones[k - 1] : tones[(k - 4) % 3] + 12;
          G.Synth.note(ctx, dest, P.inst, t, this.hz(m), len, P.vol);
        }
      } else if (P.gen === 'comp') {   // x: 화음 한 번에
        if (e.v === 'x' || e.v === 'X') for (const m of tones) G.Synth.note(ctx, dest, P.inst, t, this.hz(m), len, P.vol * (e.v === 'X' ? 1.3 : 1));
      }
    }
  },
  hz: m => 440 * Math.pow(2, (m - 69) / 12),

  // ======================= 짧은 효과음 (장 전환 연출) =======================
  // 별조각 공명음: 별조각마다 음색이 다르다
  SHARD: {
    wind:  { inst: 'flute', key: 'D', mode: 'mixo', oct: 5 },
    life:  { inst: 'harp', key: 'G', mode: 'lydian', oct: 4 },
    earth: { inst: 'bell', key: 'C', mode: 'major', oct: 4 },
    sun:   { inst: 'brass', key: 'E', mode: 'major', oct: 4 },
    ice:   { inst: 'glass', key: 'A', mode: 'minor', oct: 5 },
    sky:   { inst: 'musicbox', key: 'F', mode: 'lydian', oct: 5 },
    void:  { inst: 'choir', key: 'C', mode: 'locrian', oct: 3 },
  },
  sting(notes, inst, opt = {}) {
    const ctx = G.Audio.ctx, dest = G.Audio.sfxBus;
    if (!ctx || ctx.state !== 'running' || !dest || !G.Settings.sfx) return;
    const t0 = ctx.currentTime + 0.05;
    for (const [at, m, dur, vel, ins] of notes) G.Synth.note(ctx, dest, ins || inst, t0 + at, this.hz(m), dur, (vel || 1) * (opt.vol || 1));
    for (const [at, d, vel] of opt.drums || []) G.Synth.drum(ctx, dest, d, t0 + at, vel || 1);
  },
  resonance(el) {
    const R = this.SHARD[el] || this.SHARD.wind;
    const S = { root: this.KEYS[R.key], scale: this.MODES[R.mode] };
    const n = (d, o = 0) => this.midi(S, d, R.oct + o);
    const seq = [[0, n(1), 1.6, 0.8], [0.18, n(3), 1.5, 0.8], [0.36, n(5), 1.4, 0.8], [0.54, n(8), 1.4, 0.9],
      [0.8, n(5, 1), 1.6, 0.7], [1.05, n(8, 0) + 7, 1.4, 0.5], [1.3, n(10), 1.4, 0.6]];
    // 공통: 높은 곳에서 반짝이는 소리 + 낮은 울림
    seq.push([0, n(1, -2), 2.6, 0.6, 'pad'], [0, n(5, -2), 2.6, 0.5, 'pad'], [1.5, n(1, 1), 1.0, 0.45, 'glass'], [1.7, n(5, 1), 1.0, 0.4, 'glass']);
    this.duck(3.2);
    this.sting(seq, R.inst);
  },
  fanfare() {
    const S = { root: this.KEYS.C, scale: this.MODES.major };
    const n = (d, o = 4) => this.midi(S, d, o);
    const B = 'brass', seq = [
      [0, n(5), 0.14, 1, B], [0.17, n(5), 0.14, 1, B], [0.34, n(5), 0.14, 1, B], [0.51, n(1, 5), 0.9, 1.1, B],
      [1.5, n(6), 0.35, 1, B], [1.9, n(7), 0.35, 1, B], [2.3, n(1, 5), 0.3, 1, B], [2.65, n(2, 5), 0.3, 1, B],
      [3.0, n(3, 5), 1.7, 1.15, B], [3.0, n(5, 5), 1.7, 0.7, B], [3.0, n(1, 5), 1.7, 0.6, B],
      [0.51, n(1, 3), 1.0, 1, 'bass'], [1.5, n(4, 3), 0.8, 1, 'bass'], [2.3, n(5, 3), 0.7, 1, 'bass'], [3.0, n(1, 3), 1.8, 1, 'bass'],
      [3.0, n(3, 6), 1.6, 0.5, 'glass'], [3.3, n(5, 6), 1.4, 0.45, 'glass'], [3.6, n(1, 7), 1.4, 0.4, 'glass'],
      [0.51, n(1, 4), 1.0, 0.8, 'strings'], [3.0, n(1, 4), 1.9, 0.9, 'strings'], [3.0, n(3, 4), 1.9, 0.8, 'strings'],
    ];
    const drums = [[0.51, 'timp', 1], [1.5, 'timp', 0.7], [2.3, 'timp', 0.7], [2.82, 'timp', 0.5], [2.9, 'timp', 0.6], [3.0, 'timp', 1.1], [3.0, 'ohat', 0.8]];
    this.duck(5.2);
    this.sting(seq, B, { drums });
  },
  // 배경음악을 잠시 작게
  duck(sec) {
    const ctx = G.Audio.ctx, d = G.Audio.duckGain;
    if (!ctx || !d) return;
    const now = ctx.currentTime;
    d.gain.cancelScheduledValues(now);
    d.gain.setValueAtTime(d.gain.value, now);
    d.gain.linearRampToValueAtTime(0.22, now + 0.3);
    d.gain.setValueAtTime(0.22, now + sec);
    d.gain.linearRampToValueAtTime(1, now + sec + 1.2);
  },

  // ======================= 맵별 곡 =======================
  TOWN: { sprout_port: 't_sprout', wind_village: 't_wind', elenheim: 't_elen', raghart: 't_rag', sahrin: 't_sahrin', frostbell: 't_frost', aeros: 't_aeros', noxgate: 't_nox' },
  FIELD: { sprout_port: 'f_sprout', wind_village: 'f_wind', elenheim: 'f_elen', raghart: 'f_rag', sahrin: 'f_sahrin', frostbell: 'f_frost', aeros: 'f_aeros', noxgate: 'f_nox' },
  BOSS: { shellock: 'b_shellock', bark: 'b_bark', morwen: 'b_morwen', grounder: 'b_grounder', parakan: 'b_parakan', kaien_boss: 'b_kaien', eldrick: 'b_eldrick', nox: 'nox1' },
  forMap(id) {
    const m = G.MAPS[id];
    if (!m) return null;
    if (id === 'dream_beach') return 'tutorial';
    if (m.town) return this.TOWN[id] || this.TOWN[m.home];
    if (m.bossRoom) { const b = m.spawns[0] && m.spawns[0].m; return this.BOSS[b] || this.FIELD[m.home]; }
    return this.FIELD[m.home];
  },
  playMap(id, fade = 1) { this.play(this.forMap(id), fade); },
  // 녹스: 페이즈(0~2), 광폭화(3)
  noxPhase(ph) { this.swap(['nox1', 'nox2', 'nox3', 'nox4'][ph] || 'nox1', ph === 3 ? 0.8 : 1.5); },
};
