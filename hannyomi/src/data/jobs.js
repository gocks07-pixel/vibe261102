'use strict';
// main/sub: 데미지 계산에 쓰는 주스탯/부스탯. hpLv/mpLv: Lv.10 이후 레벨당 증가량
G.JOBS = {
  beginner: { name: '표류자', tier: 0, main: 'STR', sub: 'DEX', hpLv: 12, mpLv: 6, crit: 5, color: '#b8c2cc', weapons: ['stick'] },
  warrior:  { name: '전사', tier: 1, main: 'STR', sub: 'DEX', hpLv: 22, mpLv: 4, crit: 5, color: '#d9483b', weapons: ['stick', 'sword'] },
  archer:   { name: '궁수', tier: 1, main: 'DEX', sub: 'STR', hpLv: 14, mpLv: 8, crit: 10, color: '#3aa85f', weapons: ['stick', 'bow'] },
  mage:     { name: '마법사', tier: 1, main: 'INT', sub: 'LUK', hpLv: 10, mpLv: 18, crit: 5, color: '#3f7fd9', weapons: ['stick', 'wand'] },
  thief:    { name: '도적', tier: 1, main: 'LUK', sub: 'DEX', hpLv: 14, mpLv: 8, crit: 12, color: '#8e4fc4', weapons: ['stick', 'dagger'] },
};

// 앞으로 추가될 2~각성 Ⅳ 경로 (스킬창 미리보기용)
G.JOB_TREE = {
  warrior: [['대검사', '파쇄자', '천붕검제'], ['방패기사', '철벽기사', '불멸의 수호자']],
  archer:  [['사냥꾼', '매의 사수', '천궁'], ['석궁수', '저격수', '섬광의 저격왕']],
  mage:    [['화염술사', '업화술사', '화염군주'], ['빙뢰술사', '폭풍술사', '천둥의 현자']],
  thief:   [['암살자', '그림자추적자', '야천'], ['쌍검사', '칼날무희', '천인검무']],
};
G.JOB_ADV_LEVELS = [10, 30, 60, 85];

G.STATS4 = ['STR', 'DEX', 'INT', 'LUK'];
