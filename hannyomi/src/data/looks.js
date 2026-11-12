'use strict';
// 캐릭터 외형 선택지
G.LOOKS = {
  gender: [['m', '남자'], ['f', '여자']],
  // 1번 꾸미기 (2026-11-12): 머리 · 눈은 성별과 상관없이 모두 고름. id 는 옛 것을 다시 씀 (세이브 그대로)
  //  short = ⓙ 모험가 · spiky = ⓐ 내추럴 댄디컷 · side = ⓑ 부드러운 가르마컷 · 새 halfup · tail · braid · ponytail
  //  옛 세이브의 pony(남자 = 꽁지, 여자 = 포니테일) · bun(→ 포니테일) 은 그릴 때만 바꿈 (G.Head2)
  hairList: [['short', '모험가 머리'], ['spiky', '내추럴 댄디컷'], ['side', '부드러운 가르마컷'], ['halfup', '반묶음'], ['tail', '꽁지머리'],
    ['long', '긴 생머리'], ['wavy', '웨이브'], ['bob', '단발'], ['ponytail', '포니테일'], ['braid', '땋은 머리'], ['twin', '양갈래']],
  // 처음 만들기 머리 색 10 · 외모 바꾸기 NPC 에서 더 고를 7 (투톤은 '앞|끝')
  hairColor: ['#282936', '#684932', '#8B603F', '#DDBC85', '#F1DFC9', '#475969', '#A95A50', '#e0e4f0', '#4a6ad0', '#e07ab0'],
  hairColorMore: ['#2a2230', '#5a3a22', '#a8743a', '#e8c86a', '#c0402a', '#2a2230|#8a4ad0', '#B88148'],
  // 눈 8: round = 동그란 · big = 초롱초롱한 · smile = 화사한 웃음 · sharp = 강인한 (옛 id) + 새 gentle · smart · mystic · playful
  eye: [['gentle', '온화한 눈'], ['smart', '지적인 눈'], ['sharp', '강인한 눈'], ['big', '초롱초롱한 눈'], ['round', '동그란 눈'],
    ['mystic', '신비로운 눈'], ['smile', '화사한 웃음 눈'], ['playful', '장난기 가득한 눈']],
  eyeColor: ['#2a2a30', '#7a4a2a', '#3a6ad0', '#2a9a5a', '#c03040', '#8a4ad0', '#d8a030'],
  skin: ['#ffe8d0', '#ffe0c2', '#f5cfa8', '#e0a878', '#b8805a', '#8a5a3a'],
  acc: [['', '없음'], ['ribbon', '리본'], ['flower', '꽃 장식'], ['headband', '머리띠'], ['pin', '별 머리핀'], ['feather', '깃털'], ['glasses', '안경']],
  // 처음 옷 8 [id, 이름, 상의 색, 하의 색]. 옛 id 4개는 그대로 (casual = 초보 모험가 복장)
  outfit: [['casual', '초보 모험가 복장', '#7a4a2a', '#6a5a3a'], ['traveler', '여행자 망토', '#5a7a9a', '#4a4a5a'], ['apprentice', '견습 마법사 로브', '#5a4ab0', '#3a3070'],
           ['ranger', '숲 레인저', '#4a7a3a', '#4a3a2a'], ['scholar', '학자 복장', '#2a3a6a', '#3a3a4a'], ['explorer', '탐험가 복장', '#c8b080', '#8a7a5a'],
           ['sailor', '항해사 복장', '#f4f6fa', '#2a3a7a'], ['squire', '견습 기사 복장', '#9aa0b0', '#4a4a5a']],
  get hair() { return { m: this.hairList, f: this.hairList }; },   // 옛 코드용 (성별 구분 없음)

  def(gender = 'm') {
    return { gender, hairStyle: gender === 'm' ? 'short' : 'long', hairColor: '#684932', eye: 'round', eyeColor: '#3a6ad0', skin: '#ffe0c2', outfit: 'casual', acc: '' };
  },
  random(gender) {
    const g = gender || G.U.pick(['m', 'f']), P = G.U.pick;
    return {
      gender: g, hairStyle: P(this.hairList)[0], hairColor: P(this.hairColor), eye: P(this.eye)[0],
      eyeColor: P(this.eyeColor), skin: P(this.skin), outfit: P(this.outfit)[0], acc: '',
    };
  },
  // 예전 세이브의 외형 데이터를 새 형식으로
  normalize(l) {
    const d = this.def((l && l.gender) || 'm');
    if (!l) return d;
    if (l.hair && !l.hairColor) d.hairColor = l.hair;
    for (const k in d) if (l[k] != null) d[k] = l[k];
    return d;
  },
  outfitOf(id) { return this.outfit.find(o => o[0] === id) || this.outfit[0]; },
  // 그리기용 look 객체 (top/bottom 을 넘기면 장비 색을 우선)
  toDraw(L, top, bottom) {
    const of = this.outfitOf(L.outfit);
    const [hair, hair2] = String(L.hairColor || '').split('|');   // 투톤 '앞|끝'
    return { skin: L.skin, hair, hair2, style: L.hairStyle, eye: L.eye, eyeColor: L.eyeColor, gender: L.gender, outfit: of[0], top: top || of[2], bottom: bottom || of[3], acc: L.acc || '' };
  },
};
