'use strict';
// 효과음 (Web Audio로 합성. 외부 파일 없음) + 소리 출력 경로. 배경음악은 music.js
G.Audio = {
  ctx: null,
  SOUNDS: {
    hit: [[220, 0.05, 'square', 0.08]],
    crit: [[330, 0.04, 'square', 0.1], [520, 0.06, 'square', 0.08]],
    jump: [[300, 0.05, 'sine', 0.06], [450, 0.05, 'sine', 0.05]],
    pickup: [[880, 0.04, 'sine', 0.07], [1320, 0.06, 'sine', 0.06]],
    levelup: [[523, 0.1, 'triangle', 0.12], [659, 0.1, 'triangle', 0.12], [784, 0.1, 'triangle', 0.12], [1046, 0.25, 'triangle', 0.12]],
    quest: [[659, 0.08, 'triangle', 0.1], [880, 0.15, 'triangle', 0.1]],
    hurt: [[160, 0.08, 'sawtooth', 0.08]],
    skill: [[440, 0.04, 'triangle', 0.06], [660, 0.05, 'triangle', 0.05]],
    portal: [[300, 0.08, 'sine', 0.07], [600, 0.12, 'sine', 0.06]],
    buy: [[1046, 0.05, 'sine', 0.07], [1318, 0.08, 'sine', 0.07]],
    error: [[180, 0.1, 'square', 0.06]],
    boss: [[110, 0.2, 'sawtooth', 0.1], [90, 0.3, 'sawtooth', 0.1]],
    cube: [[523, 0.06, 'sine', 0.08], [784, 0.06, 'sine', 0.08], [1046, 0.12, 'sine', 0.08]],
    dash: [[600, 0.04, 'sawtooth', 0.04], [900, 0.06, 'sine', 0.05]],
    coin: [[1318, 0.04, 'square', 0.04], [1760, 0.07, 'square', 0.04]],
    step: [[784, 0.06, 'triangle', 0.08], [1046, 0.06, 'triangle', 0.08], [1568, 0.12, 'triangle', 0.08]],
  },
  // 출력 구조: 효과음 → sfxBus ┐
  //           배경음악 → musicBus → duckGain ┴→ master(압축) → 스피커
  musicBus: null, sfxBus: null, duckGain: null,
  init() {
    const unlock = () => {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.buildBus(); } catch (e) { /* 미지원 */ }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().then(() => G.Music.resume());
      else if (this.ctx) G.Music.resume();
    };
    window.addEventListener('keydown', unlock);
    window.addEventListener('mousedown', unlock);
  },
  buildBus() {
    const c = this.ctx;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    comp.connect(c.destination);
    this.sfxBus = c.createGain(); this.sfxBus.connect(comp);
    this.duckGain = c.createGain(); this.duckGain.connect(comp);
    this.musicBus = c.createGain(); this.musicBus.connect(this.duckGain);
    this.applyVolume();
  },
  // 설정(켬/끔, 음량)을 실제 소리에 반영. 음량은 귀에 자연스럽게 제곱 곡선
  applyVolume() {
    if (!this.ctx || !this.musicBus) return;
    const S = G.Settings, now = this.ctx.currentTime;
    const mv = S.bgm ? Math.pow(S.bgmVol / 100, 2) * 0.9 : 0;
    const sv = S.sfx ? Math.pow(S.sfxVol / 100, 2) : 0;
    this.musicBus.gain.setTargetAtTime(mv, now, 0.05);
    this.sfxBus.gain.setTargetAtTime(sv, now, 0.03);
  },
  get muted() { return !G.Settings.sfx; },
  play(name) {
    if (!G.Settings.sfx || !this.ctx || this.ctx.state !== 'running') return;
    const seq = this.SOUNDS[name]; if (!seq) return;
    let t = this.ctx.currentTime;
    for (const [freq, dur, type, vol] of seq) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.sfxBus);
      o.start(t); o.stop(t + dur + 0.02);
      t += dur * 0.8;
    }
  },
};
