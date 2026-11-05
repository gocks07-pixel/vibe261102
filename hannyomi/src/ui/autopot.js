'use strict';
// ============================================================
// EXE 빌드: 자동 물약
//  - HP · MP가 정한 기준(30 · 50 · 70%) 아래로 내려가면 물약을 저절로 먹는다
//  - 설정은 캐릭터마다 세이브에 저장 (d.autoPot). 처음 값: HP 켬 50%, MP 켬 30%
//  - 먹는 물약: 그 종류 물약 → 없으면 별사탕 (별의 정수는 자동으로 먹지 않음)
//  - 같은 종류는 1초에 한 번만. 저주(물약 금지) · 대화 · 영상 중에는 먹지 않음
//  - 표시: 회복 숫자만 (+300 등). HUD 물약 칸에 "자동" / "꺼짐"
// ============================================================
G.AutoPot = {
  DEF: { hp: true, hpAt: 50, mp: true, mpAt: 30 },
  LEVELS: [30, 50, 70],
  GAP: 1,
  of(d) {
    if (!d.autoPot) d.autoPot = Object.assign({}, this.DEF);
    return d.autoPot;
  },
  update(p, dt) {
    const a = this.of(p.d);
    for (const k of ['hp', 'mp']) if (p.autoT[k] > 0) p.autoT[k] -= dt;
    if (p.dead || p.noPotion > 0 || G.UI.blocking()) return;
    for (const k of ['hp', 'mp']) {
      if (!a[k] || p.autoT[k] > 0) continue;
      const cur = k === 'hp' ? p.hp : p.mp, max = k === 'hp' ? p.st.maxHP : p.st.maxMP;
      if (cur > max * a[k + 'At'] / 100) continue;
      p.autoT[k] = this.GAP;
      const idx = p.potionIdx(k);
      if (idx >= 0) p.useItem(idx);
    }
  },
};

G.Win.autopot = {
  title: '자동 물약', x: 410, y: 190, w: 460,
  render() {
    const p = G.Game.player;
    if (!p) return '';
    const a = G.AutoPot.of(p.d);
    const row = (k, name) => `<div class="ap-row"><b>${name} 자동 물약</b>
      <button class="btn sm ${a[k] ? 'on' : ''}" data-act="autopot" data-arg="${k}">${a[k] ? '켬' : '끔'}</button>
      <span class="dim">${name}가</span>
      ${G.AutoPot.LEVELS.map(v => `<button class="btn sm ${a[k + 'At'] === v ? 'gold' : ''}" data-act="autopot" data-arg="${k}At:${v}" ${a[k] ? '' : 'disabled'}>${v}%</button>`).join('')}
      <span class="dim">이하일 때</span></div>`;
    return row('hp', 'HP') + row('mp', 'MP') +
      `<div class="dim" style="font-size:11px;margin-top:8px;line-height:1.6">· HP 물약이 떨어지면 별사탕(HP·MP 30% 회복)을 대신 먹어요.<br>· 별의 정수는 자동으로 먹지 않아요. 위험할 때 인벤토리(I)에서 더블클릭!<br>· 설정은 이 캐릭터에만 저장됩니다.</div>`;
  },
  act(arg) {
    const p = G.Game.player;
    if (!p) return;
    const a = G.AutoPot.of(p.d);
    if (arg === 'hp' || arg === 'mp') a[arg] = !a[arg];
    else { const [k, v] = arg.split(':'); if (G.AutoPot.LEVELS.includes(+v)) a[k] = +v; }
    G.Audio.play('pickup');
    G.UI.renderWin('autopot'); G.UI.dirty();
  },
};
