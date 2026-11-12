'use strict';
// PC · EXE (hannyomi-backup): 각성 직업 카드(src/ui/jobcard.js)가 읽는 직업 형 설명 G.Play.FAM
//  휴대폰 판은 src/ui/play.js 가 같은 내용을 넣는다. play.js 가 없는 PC · EXE 에서만 채움 (내용은 play.js 와 같게 유지)
G.Play = G.Play || {};
if (!G.Play.FAM) G.Play.FAM = {
  warrior: { ic: '⚔', w: '검', tag: '가까이서 베기', diff: 1, lines: ['불꽃 검기로 멀리까지 베는 공격형', '방패와 빛으로 버티는 방어형 · HP · 방어가 높아요'] },
  archer: { ic: '🏹', w: '활', tag: '멀리서 화살', diff: 2, lines: ['화살을 여러 발 흩뿌리는 빠른 연사형', '물러나며 쏘는 한 방 저격형 · 치명타 · 방어 무시'] },
  mage: { ic: '🔮', w: '지팡이', tag: '멀리서 마법 · 넓은 범위', diff: 2, lines: ['하늘에서 불을 떨어뜨리는 넓은 범위형', '얼음 파편으로 꿰뚫는 치명타형'] },
  thief: { ic: '🗡', w: '단검', tag: '빠른 연타 · 치명타', diff: 3, lines: ['그림자처럼 돌진해 급소를 찌르는 형', '독 단검을 던지고 독을 쌓는 형'] },
};
