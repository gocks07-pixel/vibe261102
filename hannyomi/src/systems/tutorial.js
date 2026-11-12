'use strict';
// 튜토리얼 챕터 (꿈속의 해변). 단계마다 직접 해 봐야 다음으로 넘어간다
// 저장 데이터: p.d.tut = {step, flags, moved} (끝나면 null)
G.Tutorial = {
  // {jump} 같은 표시는 현재 키 설정으로 바뀌어 보인다. keys 의 '@xxx' 도 마찬가지
  STEPS: [
    { text: '← → 방향키로 좌우로 걸어 보세요.', keys: ['←', '→'], check: s => s.moved > 250 },
    { text: '{jump}로 점프해 보세요.', keys: ['@jump'], flag: 'jump' },
    { text: '점프한 공중에서 한 번 더 누르면 앞으로 살짝 뛰어요! 점프 키를 두 번 연속으로 눌러 보세요.', keys: ['@jump', '@jump'], flag: 'dash' },
    { text: '보랏빛 발판 위에서 점프한 뒤, ↑ 를 누른 채 점프를 한 번 더! 위로 한 번 더 뛰어 금색 높은 발판에 올라가 보세요.', keys: ['@jump', '+', '↑', '+', '@jump'],
      check: (s, p) => s.flags.djup && p.onGround && p.plat && p.plat.high },
    { text: '↓ + {jump} 로 발판 아래로 내려와 보세요. (금색 높은 발판에는 사냥터마다 보물상자가 있어요!)', keys: ['↓', '+', '@jump'], flag: 'drop' },
    { text: '스킬창({skill})의 표류자 탭에서 2단 점프를 [위로]로 바꾸면, ↑ 없이 점프 두 번만으로 위로 뛰어요. [위로]로 바꾸고 점프 두 번으로 금색 높은 발판에 다시 올라가 보세요! (다시 [앞으로]로 돌려도 돼요)', keys: ['@skill', '위로', '+', '@jump', '@jump'],
      check: (s, p) => s.flags.djmode && s.flags.djup && p.onGround && p.plat && p.plat.high },   // 2.1.8
    { text: '땅에서 대쉬 키({dash})를 누르면 짧게 돌진해요! (방향키 두 번 대쉬는 메뉴에서 켤 수 있어요)', keys: ['@dash'], flag: 'gdash' },
    { text: '꿈의 안내자 루미 앞에서 ↑ 키를 누르거나, 루미를 클릭해서 말을 걸어 보세요.', keys: ['↑'], flag: 'talk:lumi' },
    { text: '{attack}로 훈련용 허수아비를 3번 쓰러뜨려 보세요. 누르고 있으면 연속 공격!', keys: ['@attack'], count: ['kill:dummy', 3] },
    { text: '{skill1} 키로 [돌 던지기] 스킬을 써 보세요. 스킬은 스킬 칸 1~6 단축키로 사용해요.', keys: ['@skill1'], flag: 'skill' },
    { text: 'HP가 줄었어요! {hp} 키로 HP 물약을 마셔 보세요. (MP 물약은 {mp})', keys: ['@hp'], flag: 'potion', onStart: p => { p.hp = Math.ceil(p.st.maxHP * 0.4); } },
    { text: '{stat} 키로 스탯창을 열고 + 버튼으로 능력 포인트를 배분해 보세요. (Shift+클릭: 5씩)', keys: ['@stat'], flag: 'ap' },
    { text: '다른 창들도 열어 보세요.', keys: ['@inv', '@equip', '@skill', '@quest'],
      all: [['win:inv', '인벤토리'], ['win:equip', '장비'], ['win:skill', '스킬'], ['win:quest', '퀘스트']] },
    { text: '{map} 키로 지도를 열어 보세요. 월드맵과 현재 맵을 볼 수 있어요.', keys: ['@map'], flag: 'win:map' },
    { text: 'F1 키로 전체 단축키 설명을 볼 수 있어요. 키는 메뉴 → 키 설정에서 원하는 대로 바꿀 수 있어요.', keys: ['F1'], flag: 'help' },
    { text: '준비 완료! 오른쪽 끝 빛나는 포탈 위에서 ↑ 키를 눌러 꿈에서 깨어나세요.', keys: ['→', '↑'], flag: '__never__' },
  ],
  fill(text) { return text.replace(/\{(\w+)\}/g, (m, id) => G.Keys.label(id)); },
  el: null, shown: -1,

  get st() { const p = G.Game.player; return p && p.d.tut; },
  active() { return !!this.st && !!G.Game.world && G.Game.world.mapId === 'dream_beach'; },
  ev(name) {
    const s = this.st;
    if (!s) return;
    s.flags[name] = (s.flags[name] || 0) + 1;
  },

  // 창 열기 단계는 이미 열려 있는 창도 인정 (키를 누르면 닫혀 버리므로)
  has(s, f) { return (s.flags[f] || 0) > 0 || (f.startsWith('win:') && G.UI.isOpen(f.slice(4))); },
  done(step, s) {
    if (step.check) return step.check(s, G.Game.player);
    if (step.flag) return this.has(s, step.flag);
    if (step.count) return (s.flags[step.count[0]] || 0) >= step.count[1];
    if (step.all) return step.all.every(([f]) => this.has(s, f));
    return false;
  },

  update() {
    if (!this.active()) { this.hide(); return; }
    if (this.st && this.st.v !== 17) {   // 2.1.8: 하던 중인 세이브 맞추기 (2.1.7 전 15단계 · 2.1.7 의 5 ↔ 6)
      const t = this.st;
      if (t.v === 16) { if (t.step === 4) t.step = 5; else if (t.step === 5) t.step = 4; }
      else if (t.step >= 5) t.step++;
      t.v = 17;
    }
    const s = this.st, p = G.Game.player, step = this.STEPS[s.step];
    if (!step) return;
    if (!s.started) { s.started = true; if (step.onStart) step.onStart(p); }
    if (this.done(step, s)) {
      s.step++; s.started = false; s.flags = {}; s.moved = 0;
      G.Audio.play('step');
      G.FX.stars(p.x, p.y - 60, 8); G.FX.text(p.x, p.y - 100, '좋아요!', '#ffe680', 18);
      G.Game.save(true);
    }
    this.render();
  },

  render() {
    const s = this.st;
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.id = 'tut';
      G.UI.root.appendChild(this.el);
    }
    const step = this.STEPS[s.step];
    const key = `${s.step}|${JSON.stringify(s.flags)}|${Object.keys(G.UI.wins).join()}`;
    if (this.shown === key) return;
    this.shown = key;
    let extra = '';
    if (step.count) extra = `<div class="tut-prog">${Math.min(step.count[1], s.flags[step.count[0]] || 0)} / ${step.count[1]}</div>`;
    if (step.all) extra = `<div class="tut-prog">${step.all.map(([f, n]) => { const ok = this.has(s, f); return `<span class="${ok ? 'ok' : ''}">${ok ? '✔' : '○'} ${n}</span>`; }).join('')}</div>`;
    this.el.innerHTML = `<div class="tut-h">✨ 튜토리얼 ${s.step + 1} / ${this.STEPS.length}
        <button class="btn sm" data-act="tutskip">건너뛰기</button></div>
      <div class="tut-t">${this.fill(step.text)}</div>
      <div class="tut-k">${step.keys.map(k => k === '+' ? '<span>+</span>' : `<kbd>${k[0] === '@' ? G.Keys.label(k.slice(1)) : k}</kbd>`).join('')}</div>${extra}`;
  },
  hide() { if (this.el) { this.el.remove(); this.el = null; this.shown = -1; } },

  skip() {
    G.UI.ask('튜토리얼을 건너뛰고 새싹항으로 갈까요? 건너뛰면 루미의 완주 선물을 받을 수 없어요.', '건너뛰기', () => {
      const p = G.Game.player; if (p.d.tut) p.d.tut.skipped = true;   // 2.1.6: 건너뛰면 보상 없음
      G.Game.changeMap('sprout_port', null);
    });
  },
  // 꿈속의 해변을 떠날 때 호출
  complete() {
    const p = G.Game.player;
    if (!p.d.tut) return;
    const full = !p.d.tut.skipped && p.d.tut.step >= this.STEPS.length - 1;   // 2.1.6: 15단계까지 다 한 경우만
    p.d.tut = null;
    if (full) { G.Inv.add(p, 'pot_red', 20); G.Inv.add(p, 'scroll_tele', 2); p.d.gold += 300; }
    this.hide();
    setTimeout(() => {
      // (1.4) 챕터 타이틀 카드 "프롤로그 · 낯선 해변"이 대신 나온다
      G.UI.log(full ? '튜토리얼 완료! 루미의 선물: 들풀 회복약 ×20 · 여행자의 나침반 ×2 · 300골드. 언제든 조작법을 볼 수 있어요 (PC: F1 · 휴대폰: 메뉴 → 조작 안내).'
        : '튜토리얼을 건너뛰었어요. 언제든 조작법을 볼 수 있어요 (PC: F1 · 휴대폰: 메뉴 → 조작 안내).', '#ffe08a');
      if (full) G.UI.banner('루미', '잘했어요! 꿈에서 깨기 전에 이걸 가져가요.');
      G.UI.log('머리 위에 ! 표시가 있는 루루에게 말을 걸어 보세요.', '#ffe08a');
    }, 300);
    // 1.7.7: 꿈에서 깨어나기 직전, 어둠 속 목소리 (녹스)
    G.UI.log('(어둠 속 목소리) …너도, 빛나는구나.', '#b8b0f0');
    G.UI.banner('???', '…너도, 빛나는구나.', 'shout');
  },
};
