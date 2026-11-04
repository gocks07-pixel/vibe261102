'use strict';
// 게임 설정 (이펙트 강도, 미니맵, 음향). 세이브와 별도로 저장 (브라우저/EXE 모두 다음 실행에도 유지)
G.Settings = {
  fx: 'high', minimap: true, dtapDash: false,
  bgm: true, sfx: true, bgmVol: 70, sfxVol: 80,
  KEY: 'hny_settings',
  FIELDS: ['fx', 'minimap', 'dtapDash', 'bgm', 'sfx', 'bgmVol', 'sfxVol'],
  load() {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(this.KEY) || '{}') || {}; } catch (e) { /* 저장소 없음 */ }
    for (const k of this.FIELDS) if (k in raw) this[k] = raw[k];
    // 1.3 이전의 "효과음 끔" 설정 이어받기
    try { if (!('sfx' in raw) && localStorage.getItem('arcelia_mute') === '1') this.sfx = false; } catch (e) { /* 저장소 없음 */ }
    this.bgmVol = Math.max(0, Math.min(100, +this.bgmVol || 0));
    this.sfxVol = Math.max(0, Math.min(100, +this.sfxVol || 0));
  },
  save() {
    const o = {};
    for (const k of this.FIELDS) o[k] = this[k];
    try { localStorage.setItem(this.KEY, JSON.stringify(o)); } catch (e) { /* 저장소 없음 */ }
  },
  // 파티클 개수 배율
  get fxMul() { return this.fx === 'high' ? 1 : 0.45; },
};
G.Settings.load();
