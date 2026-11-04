'use strict';
// 캐릭터 외형 선택지
G.LOOKS = {
  gender: [['m', '남자'], ['f', '여자']],
  hair: {
    m: [['short', '단정한 숏컷'], ['spiky', '삐죽 머리'], ['side', '옆가르마'], ['pony', '묶은 머리'], ['long', '장발']],
    f: [['long', '긴 생머리'], ['twin', '양갈래'], ['bob', '단발'], ['bun', '올림머리'], ['pony', '포니테일'], ['wavy', '웨이브']],
  },
  hairColor: ['#2a1a12', '#5a3a22', '#a8743a', '#e8c86a', '#c0402a', '#e8e8f0', '#5a7ae0', '#e07ab0'],
  eye: [['round', '또렷한 눈'], ['big', '초롱초롱한 눈'], ['smile', '웃는 눈'], ['sharp', '날카로운 눈']],
  eyeColor: ['#222222', '#3a5ac0', '#2a8a4a', '#8a3a2a', '#8a3ab0'],
  skin: ['#ffe0c2', '#f5cfa8', '#e0a878', '#a8704a'],
  // [id, 이름, 상의 색, 하의 색]
  outfit: [['sailor', '선원 복장', '#dfe6ee', '#3a4a6a'], ['traveler', '여행자 복장', '#c08a4a', '#5a4a32'],
           ['apprentice', '견습생 로브', '#6a5acd', '#3a3460'], ['casual', '캐주얼', '#e86a8a', '#4a6aa0']],

  def(gender = 'm') {
    return { gender, hairStyle: gender === 'm' ? 'short' : 'long', hairColor: '#2a1a12', eye: 'round', eyeColor: '#222222', skin: '#ffe0c2', outfit: 'sailor' };
  },
  random(gender) {
    const g = gender || G.U.pick(['m', 'f']), P = G.U.pick;
    return {
      gender: g, hairStyle: P(this.hair[g])[0], hairColor: P(this.hairColor), eye: P(this.eye)[0],
      eyeColor: P(this.eyeColor), skin: P(this.skin), outfit: P(this.outfit)[0],
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
    return { skin: L.skin, hair: L.hairColor, style: L.hairStyle, eye: L.eye, eyeColor: L.eyeColor, gender: L.gender, top: top || of[2], bottom: bottom || of[3] };
  },
};
