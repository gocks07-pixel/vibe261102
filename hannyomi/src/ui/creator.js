'use strict';
// 캐릭터 만들기 화면 (성별, 헤어, 눈, 피부, 액세서리, 처음 옷) — 1번 꾸미기: 성별은 몸 · 옷 모양과 속눈썹만
G.Creator = {
  look: null, name: '', raf: 0, slot: 'A',

  open(slot) {
    if (slot) this.slot = slot;
    this.look = G.LOOKS.def('m');
    this.name = '';
    this.render();
    this.anim();
  },

  render() {
    const L = this.look, LK = G.LOOKS, esc = G.U.esc;
    const nameOf = (list, id) => (list.find(x => x[0] === id) || list[0])[1];
    const cycle = (label, field, list) => `<div class="cc-row"><span class="cc-l">${label}</span>
      <button class="btn sm" data-act="cc" data-arg="${field}:-1">◀</button><span class="cc-v">${nameOf(list, L[field])}</span>
      <button class="btn sm" data-act="cc" data-arg="${field}:1">▶</button></div>`;
    const sw = (label, field, list) => `<div class="cc-row"><span class="cc-l">${label}</span><div class="cc-sw">${list.map(c =>
      `<span class="sw ${L[field] === c ? 'on' : ''}" style="background:${c}" data-act="cc" data-arg="${field}=${c}"></span>`).join('')}</div></div>`;
    G.UI.overlay(`<div class="overlay creator"><div class="cc-box">
      <div class="cc-left"><canvas id="ccPrev" width="260" height="320"></canvas>
        <div class="dim" style="font-size:11px;text-align:center">장비를 입으면 옷 색이 장비 색으로 바뀝니다</div></div>
      <div class="cc-right">
        <h3>캐릭터 만들기 <span class="dim" style="font-size:13px">· 슬롯 ${this.slot}</span></h3>
        <input id="nameInput" maxlength="8" placeholder="캐릭터 이름 (최대 8자)" value="${esc(this.name)}">
        <div class="cc-row"><span class="cc-l">성별</span>${LK.gender.map(([g, n]) => `<button class="btn ${L.gender === g ? 'gold' : ''}" data-act="cc" data-arg="gender=${g}">${n}</button>`).join('')}</div>
        ${cycle('헤어', 'hairStyle', LK.hairList)}
        ${sw('헤어 색', 'hairColor', LK.hairColor)}
        ${cycle('눈 모양', 'eye', LK.eye)}
        ${sw('눈 색', 'eyeColor', LK.eyeColor)}
        ${sw('피부', 'skin', LK.skin)}
        ${cycle('액세서리', 'acc', LK.acc)}
        ${cycle('처음 옷', 'outfit', LK.outfit)}
        <div class="cc-btns">
          <button class="btn" data-act="cc" data-arg="back">뒤로</button>
          <button class="btn gold" data-act="cc" data-arg="start">모험 시작!</button>
        </div>
      </div></div></div>`);
    const inp = document.getElementById('nameInput');
    inp.addEventListener('input', () => { this.name = inp.value; });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') this.act('start'); });
  },

  act(arg) {
    const L = this.look, LK = G.LOOKS;
    const inp = document.getElementById('nameInput');
    if (inp) this.name = inp.value;
    if (arg === 'back') { cancelAnimationFrame(this.raf); this.raf = 0; G.Title.render(); return; }
    if (arg === 'start') {
      const name = this.name.trim();
      if (!name) { if (inp) inp.focus(); return; }
      cancelAnimationFrame(this.raf); this.raf = 0;
      G.UI.overlay('');
      G.Save.slot = this.slot;
      const data = G.Player.newData(name, this.look);
      // 1.7.7: 캐릭터를 만든 직후 배경 설명 영상 → 꿈속의 해변
      G.Cutscene.play('intro', () => { G.Game.begin(data); G.Game.save(true); }, { look: data.look });
      return;
    }
    if (arg.includes('=')) {   // 1번 꾸미기: 랜덤 버튼 없앰 · 머리 목록은 성별과 상관없음
      const [f, v] = arg.split('=');
      L[f] = v;
    } else {
      const [f, d] = arg.split(':');
      const list = (f === 'hairStyle' ? LK.hairList : LK[f]).map(x => x[0]);
      const i = list.indexOf(L[f]);
      L[f] = list[(i + +d + list.length) % list.length];
    }
    this.render();
  },

  anim() {
    cancelAnimationFrame(this.raf);
    const loop = ts => {
      const c = document.getElementById('ccPrev');
      if (!c) { this.raf = 0; return; }
      const ctx = c.getContext('2d'), t = ts / 1000;
      const g = ctx.createLinearGradient(0, 0, 0, 320);
      g.addColorStop(0, '#2a3a6a'); g.addColorStop(1, '#141a30');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 260, 320);
      G.Draw.ell(ctx, 130, 286, 80, 16, 'rgba(255,255,255,.08)');
      G.Draw.humanoid(ctx, { x: 130, y: 284, dir: Math.sin(t * 0.6) > 0 ? 1 : -1, t, atk: -1, scale: 3.3, look: G.LOOKS.toDraw(this.look), weapon: 'stick', wcolor: '#a0703c' });
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },
};
