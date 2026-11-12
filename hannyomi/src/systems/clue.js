'use strict';
// ============================================================
// 이야기 단서 아이템: 처음 주웠을 때 설명 창 (2026-11-12 사용자 요청 · 시안 40_cloth)
//  - 캐릭터마다 아이템당 한 번 (d.flags['clue:아이템 id'], 세이브 형식 그대로)
//  - 창이 떠 있는 동안 세계는 멈춤 (G.UI.holdWorld, main.js) · [확인] 으로 닫음
//  - 여러 개 모으는 재료(조개 · 털 등)는 넣지 않음. 이야기에 이어지는 것만
// ============================================================
G.Clue = {
  // 아이템 id: [설명(없으면 아이템 설명), 이야기 줄]
  LIST: {
    q_cloth: [null, '풍차 언덕에서 보았다던 <b>검은 망토의 침입자</b>가 떨어뜨린 것 같다.<br>이 문양… 어딘가에서 본 적이 있는 것 같은데?'],
    q_pearl: [null, '등대의 불빛을 다시 밝힐 수 있을지도 몰라. 가시 조개들이 품고 있던 진주다.'],
    q_pack: [null, '도적들이 나눠 가진 <b>마르코의 짐</b>이다. 하나씩 되찾아 주자.'],
    q_key: ['용암 웅덩이가 삼키고 있던 낡은 열쇠. 교단 감옥의 자물쇠 문양이 새겨져 있다.', '갇힌 광부들을 꺼내 줄 수 있을 거야!'],
    q_tablet: ['미라들이 지니고 있던 고대 석판. 알아볼 수 없는 옛 글자가 빼곡하다.', '사하린의 학자라면 읽을 수 있을지도 몰라.'],
    q_inscr: ['모래 정령 속에 섞여 있던 비문 조각. 영웅을 기리는 글귀의 일부다.', '조각을 다 모으면 무슨 말인지 알 수 있겠지.'],
    q_hero: ['영웅의 이름이 새겨진 작은 패. 석판에서 지워진 이름일지도 모른다.', '일곱 영웅의 이름을 되찾을 수 있을까?'],
    q_record: ['공허의 감시안이 품고 있던 검은 장막 교단의 기록.', '교단이 정말로 노리는 것이 무엇인지 여기 적혀 있을 거야.'],
    q_page: ['찢어진 일기장 한 장. 낯익은 글씨체로 별과 등대 이야기가 적혀 있다.', '엘마의 할머니가 남긴 기록이다. 조각을 모두 찾아 주자.'],
  },
  // 줍고 나서 world.pickup 이 부름
  onPickup(tid) {
    const p = G.Game.player, c = this.LIST[tid];
    if (!p || !c || !G.ITEMS[tid]) return;
    const key = 'clue:' + tid;
    if (p.d.flags[key]) return;
    p.d.flags[key] = 1;
    // 지금 이 아이템을 찾는 퀘스트 → 누구에게 가져갈지
    const q = Object.values(G.QUESTS).find(x => G.Quest.isActive(x.id) && x.obj.some(o => o.t === 'item' && o.id === tid));
    this.show(tid, c, q);
  },
  show(tid, c, q) {
    const t = G.ITEMS[tid], esc = G.U.esc;
    const to = q ? `<div class="clue-to">▶ ${q.type === 'main' ? '[메인]' : '[서브]'} ${esc(q.name)} — <b>${esc(G.NPCS[q.end].name)}</b>에게 가져가자</div>` : '';
    G.UI.holdWorld = true;
    G.UI.panel(`<div class="clue-h"><img src="${G.Icons.item(t)}"><div><div class="clue-k">📜 단서를 얻었다!</div><div class="clue-n">${esc(t.name)}</div><div class="clue-d">${esc(c[0] || t.desc)}</div></div></div>
      <div class="clue-s">${c[1]}</div>${to}
      <div class="end"><button class="btn gold" data-act="ask" data-arg="c0">확인</button></div>`, [() => {}], 'clue');
    G.Audio.play('quest');
  },
};
