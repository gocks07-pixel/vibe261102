'use strict';
// 2.0: 히든 엔딩 "공명 · 함께 빛나는 별"
//  조건: 서브 퀘스트 6개 (카이엔 3 · 엘마 할머니 기록 1 · 영웅 2). 다 채우면 별의 선택(f_08)에 금색 세 번째 버튼
//  희생 · 구원 엔딩 뒤에도 녹스게이트의 엘마에게 가면 "별조각의 기억"으로 선택의 순간으로 돌아갈 수 있다
G.Hidden = {
  REQ: ['c2_s4', 'c3_s4', 'c6_s3', 'f_s2', 'c4_s4', 'f_s4'],
  // 못 채운 조건의 힌트 (퀘스트 이름 · 위치는 알려 주지 않음)
  HINT: {
    c2_s4: '카이엔이 아직 하지 못한 이야기가 있다.', c3_s4: '카이엔이 아직 하지 못한 이야기가 있다.', c6_s3: '카이엔이 아직 하지 못한 이야기가 있다.',
    f_s2: '엘마의 할머니가 남긴 기록이 흩어져 있다.',
    c4_s4: '일곱 영웅의 이름이 모래 속에 잠들어 있다.',
    f_s4: '영웅들의 잔영이 마지막 부탁을 남기려 한다.',
  },
  WHISPER: '…아직 당신을 기다리는 사람들이 있는 것 같아요. 별조각들이 무언가를 망설이고 있어요.',
  count(p) { return this.REQ.filter(id => G.Quest.isDone(id)).length; },
  ready() { return this.count() === this.REQ.length; },
  hints() { return [...new Set(this.REQ.filter(id => !G.Quest.isDone(id)).map(id => this.HINT[id]))]; },

  // 조건 퀘스트를 끝낼 때마다 손등 문양이 빛난다 (quest.complete 에서 부름)
  onQuestDone(id) {
    if (!this.REQ.includes(id)) return;
    const p = G.Game.player; if (!p) return;
    p.markGlow = 2.8; p.markColor = '#ffe9a8';
    const n = this.count();
    setTimeout(() => {
      if (n === this.REQ.length) { G.UI.log('✦ 손등의 문양이 눈부시게 빛난다. 별조각들이 하나의 노래를 부르기 시작했다... (공명 6/6)', '#ffe9a8'); G.UI.banner('공명', '별조각들이 하나의 노래를 부르기 시작했다'); }
      else G.UI.log(`✦ 손등의 문양이 희미하게 빛난다. 무언가가 공명한다... (${n}/${this.REQ.length})`, '#ffe9a8');
      G.Sound.play('buff', { inst: 'glass' });
    }, 900);
  },

  // 별의 선택 버튼 (조건을 다 채우면 금색 세 번째 버튼)
  choices(q) {
    const list = q.choice.slice();
    if (this.ready()) list.push({ label: '✦ 모두 함께 빛난다 (공명)', ending: 'hidden', gold: true });
    return list;
  },

  // 희생 · 구원 엔딩 크레딧 아래 안내 (html)
  creditNote(kind) {
    if (kind === 'hidden') return '';
    if (this.ready()) return `<div class="hid-note">✦ 하지만 별조각들은 그 선택의 순간을 아직 기억하고 있었다...<br><small>녹스게이트의 엘마에게 가면 다른 결말을 볼 수 있습니다.</small></div>`;
    return `<div class="hid-note">✦ 하지만 별조각들은 그 선택의 순간을 아직 기억하고 있었다...<br>
      별조각들이 아직 무언가를 기다리고 있습니다. 이 이야기에는 숨겨진 또 하나의 결말이 있습니다.</div>
      <div class="hid-btns"><button class="btn gold" data-act="hidden" data-arg="seek">히든 엔딩을 찾아 계속하기</button>
      <button class="btn" data-act="title" data-arg="closehelp">그냥 계속 플레이</button></div>`;
  },
  // [히든 엔딩을 찾아 계속하기]
  seek() {
    const p = G.Game.player; p.d.flags.hiddenHint = true; G.Game.save(true);
    this.showHints();
  },
  showHints() {
    const h = this.hints();
    if (!h.length) { G.UI.log('✦ 별조각들이 모두 공명하고 있다. 녹스게이트의 엘마에게 가 보자.', '#ffe9a8'); return; }
    G.UI.log('✦ 별조각의 속삭임:', '#ffe9a8');
    for (const s of h) G.UI.log('  · ' + s, '#ffe9a8');
    G.UI.banner('별조각의 속삭임', h.join('  /  '));
  },

  // 녹스게이트 엘마 대화 메뉴에 붙는 선택지
  elmaOpts(D) {
    const p = G.Game.player;
    if (!p || !G.Quest.isDone('f_08')) return [];
    const out = [];
    if (this.ready()) out.push({ label: '✦ 별조각의 기억 (선택의 순간으로)', fn: () => this.memory(D) });
    else if (p.d.flags.hiddenHint) out.push({ label: '✦ 별조각의 속삭임 (히든 엔딩 힌트)', fn: () => {
      const h = this.hints();
      D.show({ text: '별조각들이 속삭이고 있어요...\n' + h.map(s => '· ' + s).join('\n'), opts: [{ label: '확인', fn: () => D.close() }] });
    } });
    return out;
  },
  memory(D) {
    const lines = ['별조각들이… 그 순간을 기억하고 있어요.', '당신이 녹스 앞에서 선택하던 그 순간을요. 이번엔 혼자가 아니에요.', '카이엔도, 영웅들도… 그리고 저도 함께할게요.'];
    let i = 0;
    const step = () => {
      const last = i === lines.length - 1;
      D.show({ text: lines[i], title: '별조각의 기억', opts: last
        ? [{ label: '✦ 모두 함께 빛난다 (공명)', fn: () => { D.close(); G.Ending.play('hidden'); } }, { label: '아직은 아니야', fn: () => D.close() }]
        : [{ label: '다음 ▶', fn: () => { i++; step(); } }] });
    };
    step();
  },
};
