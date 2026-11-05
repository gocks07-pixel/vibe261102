'use strict';
// 게임 시작점: 화면 크기 조절, 메인 루프, 저장
G.Game = {
  player: null, world: null, scale: 1, last: 0, saveT: 0, hitstop: 0,

  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    // 모바일 1차: 화면을 돌리거나 주소창이 나왔다 들어갈 때도 다시 맞춘다
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 300));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => this.resize());
    G.Keys.init(); G.Input.init(); G.Audio.init(); G.UI.init();
    this.canvas.addEventListener('mousedown', e => {
      if (!this.world || G.UI.blocking()) return;
      const r = this.canvas.getBoundingClientRect();
      this.world.clickAt((e.clientX - r.left) / this.scale + this.world.cam, (e.clientY - r.top) / this.scale);
    });
    window.addEventListener('beforeunload', () => { if (this.player) this.save(true); });
    // 모바일 1차: 휴대폰은 창을 닫을 때 beforeunload 가 오지 않을 수 있어서, 앱을 내리거나 다른 앱으로 갈 때도 저장
    window.addEventListener('pagehide', () => { if (this.player) this.save(true); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && this.player) this.save(true); });
    G.Title.show();
    requestAnimationFrame(t => this.loop(t));
  },
  resize() {
    // 모바일 1차: 노치 · 홈 바 여백(#stage 의 safe-area padding, PC 는 0)을 빼고 맞춘다
    let W = window.innerWidth, H = window.innerHeight;
    const st = document.getElementById('stage');
    if (st) {
      const cs = getComputedStyle(st);
      W -= (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      H -= (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    }
    this.scale = Math.max(0.1, Math.min(W / 1280, H / 720));
    document.getElementById('game').style.transform = `scale(${this.scale})`;
  },

  begin(d) {
    document.getElementById('log').innerHTML = '';
    G.Nav.clear();
    G.Save.upgrade(d);
    this.player = new G.Player(d);
    this.world = new G.World(this);
    let map = d.map in G.MAPS ? d.map : 'sprout_port';
    if (map === 'dream_beach' && !d.tut) map = 'sprout_port';
    this.world.load(map, null);
    G.HUD.show(true);
    G.UI.dirty();
    if (d.tut) {
      G.UI.banner('꿈속의 해변', '튜토리얼: 위쪽 안내를 따라 해 보세요');
      G.UI.log(`${d.name}님, 한요미의 대모험에 오신 것을 환영합니다!`, '#ffe08a');
    } else {
      G.UI.log(`${d.name}님, 다시 오신 것을 환영합니다! (F1: 단축키 안내)`, '#ffe08a');
      if (d.essGift) { G.UI.log('[업데이트] 엘마가 할머니의 별의 정수 3개를 건네주었습니다. 정말 위험할 때만 쓰세요! (인벤토리 소비 칸)', '#ffe68a'); delete d.essGift; }
      if (d.notice161) { G.UI.log(`[1.6.1 업데이트] ${d.notice161}`, '#7dff9a'); delete d.notice161; }
      if (d.spGift) { G.UI.log(`[1.5 업데이트] 레벨업 기술 포인트가 늘어나 지난 레벨만큼 기술 포인트를 ${d.spGift} 더 받았습니다. 새 스킬을 익혀 보세요! (K)`, '#7dff9a'); delete d.spGift; }
      if (d.ap > 0) G.UI.log(`남은 능력 포인트 ${d.ap} — S 키로 스탯창을 열어 배분하세요.`, '#ffe06a');
    }
  },
  changeMap(to, portal) {
    G.Dialog.close();
    const leavingTut = this.world.mapId === 'dream_beach' && to !== 'dream_beach' && this.player.d.tut;
    if (leavingTut) G.Tutorial.complete();
    this.world.load(to, portal);
    G.Nav.refresh();
    G.Audio.play('portal');
    this.save(true);
  },
  async save(silent) {
    const p = this.player;
    if (!p) return false;
    p.d.hp = Math.max(1, Math.round(p.hp)); p.d.mp = Math.round(p.mp);
    const ok = await G.Save.store(p);
    if (!silent) G.UI.log(ok ? '저장했습니다.' : '저장에 실패했습니다.', ok ? '#7dff9a' : '#ff7a7a');
    return ok;
  },

  keys() {
    const I = G.Input;
    if (I.hit('F9')) { G.Bug.open(); return; }   // EXE 빌드: 버그 신고 (어느 화면에서나)
    if (G.Bug.isOpen()) return;
    if (I.hit('F1')) { G.UI.toggleHelp(); return; }
    if (G.UI.helpOpen() && I.hit('Escape')) { G.UI.toggleHelp(); return; }
    if (G.UI.asking()) { if (I.hit('Escape')) G.UI.answer(false); if (I.hit('Enter', 'NumpadEnter')) G.UI.answer(true); return; }
    if (!this.player || document.querySelector('#overlay .overlay')) return;
    if (I.hit('Escape')) { if (!G.UI.closeTop()) G.UI.openWin('menu'); }
    if (I.hit('Enter', 'NumpadEnter')) G.Dialog.enter();
    if (G.Dialog.isOpen()) return;
    for (const w of ['stat', 'equip', 'inv', 'skill', 'quest', 'map']) if (G.Keys.hit(w)) G.UI.toggle(w);
  },

  // EXE 빌드: 한 프레임에서 오류가 나도 기록만 하고 다음 프레임은 계속 (게임이 멈추지 않게)
  loop(ts) {
    try { this.frame(ts); } catch (e) { G.ErrLog.add(e); }
    G.Input.endFrame();
    requestAnimationFrame(t => this.loop(t));
  },
  frame(ts) {
    const dt = Math.min(0.05, (ts - this.last) / 1000 || 0);
    this.last = ts;
    this.keys();
    if (this.world) {
      // 타격 순간 아주 잠깐 멈칫 (히트스톱)
      if (this.hitstop > 0) { this.hitstop -= dt; this.world.update(dt * 0.08); }
      else this.world.update(dt);
      G.Nav.update(dt);
      G.Tutorial.update();
      this.world.draw(this.ctx);
      G.UI.frame();
      this.saveT += dt;
      if (this.saveT > 30) { this.saveT = 0; this.save(true); }
    } else {
      const g = this.ctx.createLinearGradient(0, 0, 0, 720);
      g.addColorStop(0, '#141436'); g.addColorStop(1, '#03050a');
      this.ctx.fillStyle = g; this.ctx.fillRect(0, 0, 1280, 720);
    }
  },
};

window.addEventListener('load', () => G.Game.init());
