'use strict';
// 배경음악 28곡 (직접 작곡한 칩튠풍. 외부 음원 없음)
//  key/mode: 조와 음계, bpm: 빠르기, beats: 한 마디 박 수, sub: 한 박을 나누는 칸 수
//  prog: 마디마다 화음 (도수. "4/5" = 반 마디씩, 5M = 장화음, 4m = 단화음, b7 = 반음 내린 장화음)
//  parts 의 종류
//   mel: 멜로디. 도수 1~7, ' 한 옥타브 위, , 한 옥타브 아래, #/b 반음, - 늘이기, . 쉼표 (rate = 한 음이 차지하는 칸)
//   gen: 'pad'  화음을 길게 / 'bass' R 근음 F 5음 O 옥타브 T 3음 L 아래 5음 / 'arp' 1~3 화음 음, 4~6 한 옥타브 위 / 'comp' x 화음 한 번에
//   drum: kick snare hat ohat shaker clap tom timp anvil metal doum tek wind (x 보통, X 강하게, o 약하게)
//   from: 몇 마디째부터 들어오는지
(function () {
  // 메인 테마 "별조각의 계승자" (타이틀, 녹스 3페이즈, 엔딩 2곡이 같은 선율을 쓴다)
  const THEME =
    '1 - 3 - 5 - - 6 | 5 - - 4 3 - 2 - | 3 - 4 - 5 - 1\' - | 7 - - 6 5 - - - |' +
    '6 - 6 - 1\' - 6 - | 5 - 3 - 1 - 3 - | 4 - 3 - 2 - 6, - | 7, - 2 - 5 - - - |' +
    '1 - 3 - 5 - - 6 | 5 - - 4 3 - 2 - | 3 - 4 - 5 - 1\' - | 2\' - - 1\' 7 - 5 - |' +
    '6 - 1\' - 2\' - 1\' 6 | 5 - 7 - 2\' - - 1\' | 1\' - - - 5 - 3 - | 1 - - - - - . .';
  const THEME_PROG = '1 5 6 3 4 1 4 5 1 5 6 3 4 5 1 1';
  // 녹스의 동기 (1·2페이즈)
  const NOX_MOTIF = '1 - - - - - 2 - | 1 - - - - - . . | 3 - - - 2 - - - | 1 - - - 7, - - - |' +
    '1 - - - - - 2 - | 3 - - - 5 - - - | 4 - - - 2 - - - | 1 - - - - - . .';

  G.SONGS = {
    // ======================= 기본 =======================
    title: {   // 타이틀 · 별조각의 계승자: 웅장하지만 따뜻하게
      key: 'D', mode: 'major', bpm: 88, sub: 2, prog: THEME_PROG,
      parts: [
        { mel: THEME, inst: 'brass', oct: 4, vol: 0.9 },
        { mel: THEME, inst: 'flute', oct: 5, vol: 0.35, from: 8 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.8 },
        { gen: 'arp', pat: '1 3 5 3 4 3 5 3', inst: 'harp', oct: 4, vol: 0.55 },
        { gen: 'bass', pat: 'R - - - F - - -', inst: 'bass', oct: 2, vol: 0.9 },
        { drum: 'timp', pat: 'x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . x o', vol: 0.6 },
        { drum: 'shaker', pat: '. . x . . . x .', vol: 0.5, from: 8 },
      ],
    },
    tutorial: {   // 꿈속의 해변: 오르골풍 몽환
      key: 'F', mode: 'major', bpm: 76, beats: 3, sub: 2, prog: '1 6 4 5 1 6 2 5',
      parts: [
        { mel: '5 - 3\' - 2\' 1\' | 1\' - 6 - - - | 4 - 6 - 1\' 6 | 5 - - - - - | 5 - 3\' - 2\' 1\' | 2\' - 3\' - 4\' 3\' | 2\' - 6 - 7 1\' | 2\' - - - . .', inst: 'musicbox', oct: 5, vol: 1 },
        { gen: 'arp', pat: '1 5 3 5 4 5', inst: 'musicbox', oct: 4, vol: 0.45 },
        { gen: 'pad', inst: 'pad', oct: 3, vol: 0.9 },
        { gen: 'bass', pat: 'R - - - - -', inst: 'bass', oct: 2, vol: 0.5 },
      ],
    },

    // ======================= 마을 =======================
    t_sprout: {   // 새싹항: 잔잔한 바닷가 왈츠
      key: 'G', mode: 'major', bpm: 132, beats: 3, sub: 2, prog: '1 1 4 1 5 5 1 1 1 1 4 4 1 5 1 1',
      parts: [
        { mel: '5 - 3 - 4 5 | 3 - - - 1 - | 6 - 4 - 6 1\' | 5 - - - 3 - | 2 - 5, - 7, 2 | 4 - 3 - 2 - | 3 - 1 - 2 3 | 1 - - - . . |' +
               '5 - 3 - 4 5 | 1\' - 7 - 6 5 | 6 - 1\' - 6 4 | 6 - 5 - 4 - | 3 - 5 - 1\' - | 7 - 6 - 2 - | 1 - 3 - 5 - | 1 - - - . .', inst: 'reed', oct: 5, vol: 1 },
        { gen: 'bass', pat: 'R - . . . .', inst: 'bass', oct: 2, vol: 0.8 },
        { gen: 'comp', pat: '. . x . x .', inst: 'harp', oct: 4, vol: 0.4 },
        { drum: 'shaker', pat: '. . o . o .', vol: 0.6 },
      ],
    },
    t_wind: {   // 바람결 마을: 플루트풍 목가적 (6/8)
      key: 'F', mode: 'major', bpm: 76, beats: 2, sub: 3, prog: '1 4 1 5 1 4 5 1 6 4 1 5 6 2 5 1',
      parts: [
        { mel: '1\' - 7 1\' - 5 | 6 - 5 4 - 6 | 5 - 3 1 - 3 | 2 - - - - . | 1\' - 7 1\' - 3\' | 2\' - 1\' 6 - 4 | 5 - 4 2 - 7, | 1 - - - - . |' +
               '3 - 1 3 - 6 | 4 - 5 6 - 1\' | 5 - 3 5 - 1\' | 2\' - - 7 - . | 1\' - 7 6 - 3\' | 2\' - 1\' 6 - 4 | 5 - 6 7 - 2\' | 1\' - - - - .', inst: 'flute', oct: 5, vol: 1 },
        { gen: 'arp', pat: '1 3 5 4 5 3', inst: 'harp', oct: 4, vol: 0.4 },
        { gen: 'bass', pat: 'R - - F - -', inst: 'bass', oct: 2, vol: 0.7 },
        { drum: 'shaker', pat: 'o . . o . .', vol: 0.5 },
      ],
    },
    t_elen: {   // 엘렌하임: 하프 아르페지오, 신비로운 숲 (리디안)
      key: 'D', mode: 'lydian', bpm: 74, sub: 4, prog: '1 2 1 2 6 5 2 2',
      parts: [
        { mel: '3 - - 4 5 - - - | 6 - 5 - 4 - 2 - | 3 - - 4 5 - 1\' - | 7 - - - 6 - - - | 1\' - 7 - 6 - 3 - | 5 - 4 - 3 - 2 - | 2 - 4 - 6 - 7 - | 6 - - - - - . .', inst: 'flute', oct: 5, vol: 0.85, rate: 2 },
        { gen: 'arp', pat: '1 2 3 4 5 4 3 2', inst: 'harp', oct: 4, vol: 0.5 },
        { gen: 'pad', inst: 'pad', oct: 3, vol: 1 },
        { gen: 'bass', pat: 'R - - - - - - - F - - - - - - -', inst: 'bass', oct: 2, vol: 0.55 },
        { mel: '. . . . . . . . . . . . . . . . 5\' - . . . . . . . . . . . . . .', inst: 'glass', oct: 5, vol: 0.4 },
      ],
    },
    t_rag: {   // 라그하르트: 망치질 타악기, 묵직
      key: 'C', mode: 'minor', bpm: 100, sub: 4, prog: '1 1 6 7 1 1 4 5M',
      parts: [
        { mel: '1 - - 1 3 - 2 1 | 5, - - - . . . . | 6 - - 5 4 - 3 4 | 5 - - - 7, - . . | 1 - - 1 3 - 4 5 | 6 - 5 - 3 - . . | 4 - - 3 4 - 6 - | 5 - - - 2 - #7, -', inst: 'brass', oct: 4, vol: 1, rate: 2 },
        { gen: 'bass', pat: 'R - - - . . R . R - - - . . O .', inst: 'sawbass', oct: 2, vol: 1 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.6 },
        { drum: 'kick', pat: 'X . . . . . . . x . . . . . . .', vol: 0.9 },
        { drum: 'anvil', pat: '. . . . x . . . . . . . x . . x', vol: 0.8 },
        { drum: 'hat', pat: '. . o . . . o . . . o . . . o .', vol: 0.6 },
      ],
    },
    t_sahrin: {   // 사하린: 중동풍 음계 (히자즈), 이국적
      key: 'D', mode: 'hijaz', bpm: 100, sub: 4, prog: '1 1 2 1 1 7 2 1',
      parts: [
        { mel: '1 - 2 3 4 - 3 2 | 3 - - - 2 1 2 - | 3 - 4 5 6 - 5 4 | 5 - - - . . . . | 5 - 6 5 4 - 3 4 | 3 - 2 1 7, - 1 - | 2 - 3 - 4 - 3 2 | 1 - - - . . . .', inst: 'reed', oct: 5, vol: 0.9, rate: 2 },
        { mel: '1 - - - - - - - - - - - - - - - | 1 - - - - - - - 2 - - - - - - - ', inst: 'pad', oct: 3, vol: 1.2 },
        { gen: 'arp', pat: '1 . 3 . 2 . 3 . 1 . 3 . 2 3 2 .', inst: 'pluck', oct: 3, vol: 0.7 },
        { gen: 'bass', pat: 'R - . . . . R - . . R - . . . .', inst: 'bass', oct: 2, vol: 0.8 },
        { drum: 'doum', pat: 'x . . . . . x . . . x . . . . .', vol: 0.8 },
        { drum: 'tek', pat: '. . . x . x . . x . . x . x . x', vol: 0.6 },
      ],
    },
    t_frost: {   // 프로스트벨: 차가운 종소리, 느린 단조
      key: 'A', mode: 'minor', bpm: 64, sub: 2, prog: '1 6 4 5M 1 6 2d 5M',
      parts: [
        { mel: '5 - - - 3 - - - | 3 - - 4 3 - 1 - | 4 - - - 6 - 5 4 | 2 - - - - - . . | 5 - - - 1\' - - - | 7 - 6 - 5 - 3 - | 4 - 3 - 2 - 1 - | #7, - - - - - . .', inst: 'bell', oct: 5, vol: 1 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.7 },
        { gen: 'arp', pat: '. . 3 . . . 5 . . . 4 . . . 6 .', inst: 'glass', oct: 5, vol: 0.35 },
        { gen: 'bass', pat: 'R - - - - - - -', inst: 'bass', oct: 2, vol: 0.6 },
      ],
    },
    t_aeros: {   // 아에로스: 맑고 높은 음, 하늘을 떠다니는 느낌
      key: 'G', mode: 'major', bpm: 86, sub: 4, prog: '1 3 4 4m 1 6 2 5',
      parts: [
        { mel: '3 - - 5 1\' - - - | 7 - 5 - 3 - - - | 6 - - 1\' 4\' - 3\' - | 2\' - - - 1\' - b6 - | 3 - - 5 1\' - 2\' - | 3\' - 2\' - 1\' - 6 - | 6 - 1\' - 2\' - 4\' - | 3\' - - - 2\' - - -', inst: 'glass', oct: 5, vol: 1, rate: 2 },
        { mel: '3 - - 5 1\' - - - | 7 - 5 - 3 - - - | 6 - - 1\' 4\' - 3\' - | 2\' - - - 1\' - b6 - | 3 - - 5 1\' - 2\' - | 3\' - 2\' - 1\' - 6 - | 6 - 1\' - 2\' - 4\' - | 3\' - - - 2\' - - -', inst: 'flute', oct: 4, vol: 0.35, rate: 2 },
        { gen: 'arp', pat: '1 3 5 6 5 3', inst: 'tri', oct: 5, vol: 0.18 },
        { gen: 'pad', inst: 'pad', oct: 3, vol: 1 },
        { gen: 'bass', pat: 'R - - - - - - - F - - - - - - -', inst: 'bass', oct: 2, vol: 0.5 },
      ],
    },
    t_nox: {   // 녹스게이트: 어둡고 고요한 결전 전야
      key: 'D', mode: 'minor', bpm: 60, sub: 2, prog: '1 1 6 6 4 4 5 5M',
      parts: [
        { mel: '1 - - - - - 2 3 | 2 - - - - - . . | 1 - - - 6, - 5, - | 6, - - - - - . . | 4 - - - 3 - 2 - | 3 - - - - - 1 - | 2 - - - 1 - 7, - | #7, - - - - - . .', inst: 'flute', oct: 4, vol: 0.9 },
        { gen: 'pad', inst: 'choir', oct: 3, vol: 0.6 },
        { gen: 'bass', pat: 'R - - - - - - -', inst: 'bass', oct: 1, vol: 0.8 },
        { drum: 'tom', pat: 'o . o . . . . . . . . . . . . .', vol: 0.5 },
      ],
    },

    // ======================= 사냥터 (지역마다 1곡) =======================
    f_sprout: {   // 새싹항 섬: 통통 튀는 초보 모험곡
      key: 'C', mode: 'major', bpm: 132, sub: 2, prog: '1 4 5 1 6 4 2 5',
      parts: [
        { mel: '1 . 3 . 5 . 3 5 | 6 - 4 - 1\' - 6 - | 5 - 7, - 2 - 5 - | 3 - 1 - . . 5, . | 1 . 3 . 6 . 5 3 | 4 - 6 - 1\' - 2\' - | 1\' 7 6 5 4 3 2 1 | 2 - 5, - 7, - 5 -', inst: 'pulse', oct: 5, vol: 1 },
        { gen: 'bass', pat: 'R . O . R . O .', inst: 'sqbass', oct: 2, vol: 1 },
        { gen: 'arp', pat: '. 3 . 5 . 3 . 5', inst: 'tri', oct: 4, vol: 0.35 },
        { drum: 'kick', pat: 'x . . . x . . .', vol: 0.7 },
        { drum: 'snare', pat: '. . x . . . x .', vol: 0.6 },
        { drum: 'hat', pat: 'o o o o o o o o', vol: 0.5 },
      ],
    },
    f_wind: {   // 바람결 지방: 바람처럼 빠른 행진곡
      key: 'D', mode: 'mixo', bpm: 152, sub: 2, prog: '1 7 4 1 1 7 4 5',
      parts: [
        { mel: '5 - 5 6 5 - 4 3 | 4 - 2 - 7, - 2 - | 1 - 4 - 6 - 1\' - | 7 - 6 - 5 - - - | 5 - 5 6 5 - 4 3 | 4 - 6 - 7 - 1\' - | 2\' - 1\' - 6 - 4 - | 5 - - - 2 - 3 -', inst: 'pulse', oct: 5, vol: 0.9 },
        { mel: '5 - 5 6 5 - 4 3 | 4 - 2 - 7, - 2 - | 1 - 4 - 6 - 1\' - | 7 - 6 - 5 - - - | 5 - 5 6 5 - 4 3 | 4 - 6 - 7 - 1\' - | 2\' - 1\' - 6 - 4 - | 5 - - - 2 - 3 -', inst: 'flute', oct: 6, vol: 0.3, from: 8 },
        { gen: 'bass', pat: 'R R F F R R O F', inst: 'sqbass', oct: 2, vol: 1 },
        { drum: 'kick', pat: 'x . . . x . . .', vol: 0.7 },
        { drum: 'snare', pat: 'o . x o . o x x', vol: 0.55 },
        { drum: 'wind', pat: 'x . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .', vol: 0.6 },
      ],
    },
    f_elen: {   // 엘렌하임 사냥터: 몽환적 + 긴장감
      key: 'E', mode: 'minor', bpm: 108, sub: 4, prog: '1 6 3 7 1 6 4 5M',
      parts: [
        { mel: '5 - - - 4 - 3 - | 3 - - 1 6, - - - | 5 - - - 7 - 1\' - | 2\' - - - 7 - - - | 5 - - - 4 - 3 - | 1 - 3 - 6 - 5 - | 4 - 6 - 1\' - 6 - | #7 - - - 2\' - - -', inst: 'flute', oct: 5, vol: 0.9, rate: 2 },
        { gen: 'arp', pat: '1 2 3 4 3 2', inst: 'harp', oct: 4, vol: 0.45 },
        { gen: 'pad', inst: 'pad', oct: 3, vol: 0.9 },
        { gen: 'bass', pat: 'R - . R R - . R', inst: 'bass', oct: 2, vol: 0.7 },
        { drum: 'kick', pat: 'x . . . . . . . x . . . . . . .', vol: 0.6 },
        { drum: 'hat', pat: '. . o . . . o . . . o . . . o .', vol: 0.6 },
      ],
    },
    f_rag: {   // 라그하르트 사냥터: 기계음 리듬, 산업풍
      key: 'E', mode: 'phrygian', bpm: 120, sub: 4, prog: '1 1 2 1 6 7 2 2',
      parts: [
        { mel: '1 . 1 . 3 . 1 2 | 1 - . . 5, . 7, . | 2 . 2 . 4 . 2 3 | 2 - . . 1 . . . | 1 . 1 . 3 . 5 4 | 3 - 1 - 6, - 7, - | 1 . 3 . 5 . 6 7 | 1\' - - - 7 - 2\' -', inst: 'saw', oct: 4, vol: 0.9, rate: 2 },
        { gen: 'bass', pat: 'R R O R R R O R R R O R R O R O', inst: 'sawbass', oct: 1, vol: 0.9 },
        { drum: 'kick', pat: 'x . . . x . . . x . . . x . . .', vol: 0.8 },
        { drum: 'snare', pat: '. . . . x . . . . . . . x . . .', vol: 0.55 },
        { drum: 'metal', pat: 'o . x . o . x . o . x . o . x x', vol: 0.6 },
        { drum: 'anvil', pat: '. . . x . . . . . . . x . . x .', vol: 0.5 },
      ],
    },
    f_sahrin: {   // 사하린 사냥터: 빠른 타악기 사막 추격곡
      key: 'D', mode: 'hijaz', bpm: 140, sub: 4, prog: '1 1 7 1 2 1 7 1',
      parts: [
        { mel: '5 - 4 3 2 - 1 2 | 3 - 1 - 7, - 1 - | 5 - 6 5 4 3 4 5 | 6 - 5 - 4 - - - | 1\' - 7 6 5 - 6 5 | 4 - 3 - 2 - 3 - | 2 - 1 - 7, - 2 - | 1 - - - . . 5, 7,', inst: 'reed', oct: 5, vol: 0.9, rate: 2 },
        { gen: 'arp', pat: '1 3 1 2 1 3 1 2', inst: 'pluck', oct: 3, vol: 0.6 },
        { gen: 'bass', pat: 'R - . R . . R . R - . R . . R .', inst: 'bass', oct: 2, vol: 0.85 },
        { drum: 'doum', pat: 'x . . x . . x . x . . x . . x .', vol: 0.8 },
        { drum: 'tek', pat: 'o x . x o x x . o x . x o x x .', vol: 0.5 },
        { drum: 'shaker', pat: '. o . o . o . o', vol: 0.6 },
      ],
    },
    f_frost: {   // 프로스트벨 사냥터: 눈보라처럼 몰아치는 곡
      key: 'B', mode: 'minor', bpm: 144, sub: 4, prog: '1 6 7 5 1 6 4 5M',
      parts: [
        { mel: '1\' - - 7 6 - 5 - | 6 - - 5 3 - - - | 2\' - - 1\' 7 - 6 - | 7 - - - 5 - - - | 1\' - - 7 6 - 5 - | 3\' - - 2\' 1\' - 6 - | 4\' - 3\' - 2\' - 1\' - | #7 - - - - - . .', inst: 'strings', oct: 4, vol: 1.6, rate: 2 },
        { gen: 'arp', pat: '1 2 3 4 3 2 1 2', inst: 'pulse', oct: 4, vol: 0.45 },
        { gen: 'bass', pat: 'R R R R R R R R', inst: 'sqbass', oct: 2, vol: 0.9 },
        { drum: 'kick', pat: 'x . . x . . x . x . . x . . x .', vol: 0.7 },
        { drum: 'snare', pat: '. . . . x . . . . . . . x . . .', vol: 0.55 },
        { drum: 'hat', pat: 'o o x o o o x o', vol: 0.45 },
        { drum: 'wind', pat: 'x . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .', vol: 0.9 },
      ],
    },
    f_aeros: {   // 아에로스 사냥터: 웅장하게 상승
      key: 'Eb', mode: 'major', bpm: 112, sub: 2, prog: '1 2 3 4 6 4 5 5',
      parts: [
        { mel: '1 - - 5 1\' - - - | 2\' - 1\' - 6 - - - | 7 - 5 - 3\' - - - | 1\' - - - 6 - 4 - | 3\' - 2\' 1\' 2\' - 3\' - | 4\' - 3\' - 1\' - 6 - | 5 - 6 - 7 - 2\' - | 5\' - - - 4\' - 2\' -', inst: 'brass', oct: 4, vol: 1 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.8 },
        { gen: 'arp', pat: '1 3 5 4 5 3 1 3', inst: 'glass', oct: 5, vol: 0.3 },
        { gen: 'bass', pat: 'R - R - F - O -', inst: 'bass', oct: 2, vol: 0.8 },
        { drum: 'kick', pat: 'x . . . x . . .', vol: 0.6 },
        { drum: 'snare', pat: '. . . . x . . x', vol: 0.5 },
        { drum: 'timp', pat: 'x . . . . . . . . . . . . . . . . . . . . . . . . . . . . . x x', vol: 0.6 },
      ],
    },
    f_nox: {   // 녹스게이트 사냥터 (영웅의 전당 포함) · 무너진 차원: 반음 위 화음으로 몰아치는 공허의 곡 (2026-11-03 사용자 선택)
      key: 'C', mode: 'harmonic', bpm: 104, sub: 4, prog: '1 b2 1 b2 4 b2 5 5',
      parts: [
        { mel: '5 - - - 6 - 5 - | b2\' - - - 1\' - - - | 5 - - - 4 - 3 - | 2 - - - b2 - - - | 1\' - - - 7 - 1\' - | b2\' - - - 1\' - 7 - | 6 - - - 5 - 4 - | #4 - - - 5 - - -', inst: 'strings', oct: 4, vol: 1.6, rate: 2 },
        { gen: 'arp', pat: '1 2 3 2', inst: 'pulse', oct: 3, vol: 0.4 },
        { gen: 'bass', pat: 'R . R . R . O . R . R . R . L .', inst: 'sawbass', oct: 1, vol: 0.9 },
        { gen: 'pad', inst: 'choir', oct: 3, vol: 0.6 },
        { drum: 'kick', pat: 'x . . x . . x . . . x . . . . .', vol: 0.75 },
        { drum: 'clap', pat: '. . . . x . . . . . . . x . . .', vol: 0.5 },
        { drum: 'hat', pat: 'o o x o o o x o', vol: 0.4 },
        { drum: 'metal', pat: '. . . . . . . . . . . . . . . x', vol: 0.45 },
      ],
    },

    // ======================= 보스 =======================
    b_shellock: {   // 쉘로크: 묵직하지만 친근
      key: 'G', mode: 'mixo', bpm: 120, sub: 2, prog: '1 1 7 7 4 4 5 5',
      parts: [
        { mel: '1 - 1 - 3 - 4 5 | 5 - 4 - 3 - 1 - | 7, - 7, - 2 - 4 - | 4 - 2 - 7, - - - | 4 - 4 - 6 - 1\' - | 6 - 4 - 1 - - - | 5 - 5 - 7 - 2\' - | 1\' - 7 - 5 - 2 -', inst: 'pulse', oct: 5, vol: 1 },
        { gen: 'bass', pat: 'R . R O R . F .', inst: 'sawbass', oct: 1, vol: 1 },
        { gen: 'comp', pat: '. . x . . . x .', inst: 'tri', oct: 4, vol: 0.4 },
        { drum: 'kick', pat: 'x . . x . . x .', vol: 0.8 },
        { drum: 'snare', pat: '. . . . x . . .', vol: 0.6 },
        { drum: 'tom', pat: '. . . . . . . . . . . . . . x x', vol: 0.7 },
      ],
    },
    b_bark: {   // 붉은손 바르크: 거칠고 빠름
      key: 'E', mode: 'minor', bpm: 168, sub: 2, prog: '1 1 6 7 1 1 4 5M',
      parts: [
        { mel: '1 1 . 1 3 - 4 - | 5 - 4 3 4 - 3 - | 1 1 . 1 3 - 4 - | 5 - 7 - 6 - 5 - | 1\' - 7 - 5 - 7 - | 1\' - 7 - 5 - 3 - | 4 - 4 6 5 - 4 3 | #7, - 2 - 5 - #7 -', inst: 'saw', oct: 4, vol: 1 },
        { gen: 'bass', pat: 'R R R R R R O R', inst: 'sawbass', oct: 1, vol: 1 },
        { gen: 'comp', pat: 'x . . x . . x .', inst: 'saw', oct: 3, vol: 0.45 },
        { drum: 'kick', pat: 'x . x . . . x .', vol: 0.8 },
        { drum: 'snare', pat: '. . x . . . x .', vol: 0.65 },
        { drum: 'hat', pat: 'x x x x x x x x', vol: 0.5 },
      ],
    },
    b_morwen: {   // 모르웬: 기괴하고 슬픔 (어긋난 왈츠)
      key: 'G', mode: 'harmonic', bpm: 76, beats: 3, sub: 2, prog: '1 4 5M 1 6 2d 5M 5M',
      parts: [
        { mel: '5 - 1\' - 7 - | 6 - 4 - - - | #7, - 2 - 4 - | 3 - - - . . | 3 - 6 - 5 - | 4 - 2 - 6, - | #7, - 4 - 3 - | 2 - - - - -', inst: 'musicbox', oct: 5, vol: 1 },
        { mel: '5 - 1\' - 7 - | 6 - 4 - - - | #7, - 2 - 4 - | 3 - - - . . | 3 - 6 - 5 - | 4 - 2 - 6, - | #7, - 4 - 3 - | 2 - - - - -', inst: 'glass', oct: 5, vol: 0.25, rate: 1 },
        { gen: 'pad', inst: 'choir', oct: 3, vol: 0.7 },
        { gen: 'bass', pat: 'R - . . L .', inst: 'bass', oct: 2, vol: 0.7 },
        { drum: 'tom', pat: 'x . . . . .', vol: 0.4 },
        { drum: 'metal', pat: '. . . . . . . . . . o .', vol: 0.4 },
      ],
    },
    b_grounder: {   // 그라운더 MK-7: 금속성 기계 행진곡
      key: 'C', mode: 'minor', bpm: 116, sub: 4, prog: '1 1 6 7 4 4 5M 5M',
      parts: [
        { mel: '1 . 1 . 1 . 5, . | 1 . 1 . 3 - 2 - | 3 . 3 . 3 . 1 . | 2 - 4 - 7, - - - | 4 . 4 . 4 . 1 . | 6 - 5 - 4 - 3 - | 2 . 2 . #7, . 2 . | 5 - - - #7, - - -', inst: 'brass', oct: 4, vol: 1, rate: 2 },
        { gen: 'bass', pat: 'R . R . R . R . R . R . O . R .', inst: 'sqbass', oct: 2, vol: 1 },
        { drum: 'kick', pat: 'X . . . x . . . X . . . x . . .', vol: 0.8 },
        { drum: 'snare', pat: '. . . . x . . . . . . . x . x .', vol: 0.6 },
        { drum: 'metal', pat: '. . x . . . x . . . x . . x x .', vol: 0.65 },
        { drum: 'anvil', pat: 'x . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .', vol: 0.7 },
      ],
    },
    b_parakan: {   // 파라칸: 웅장한 왕의 테마
      key: 'D', mode: 'hijaz', bpm: 96, sub: 2, prog: '1 2 1 7 4 2 1 1',
      parts: [
        { mel: '1 - - 5 1\' - - - | 2\' - 1\' 7 6 - - - | 5 - 6 5 4 - 3 - | 2 - 3 - 7, - - - | 4 - - 6 1\' - 2\' 1\' | 7 - 6 - 2\' - - - | 1\' - 7 6 5 - 4 3 | 1 - - - 5, - - -', inst: 'brass', oct: 4, vol: 1.1 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.8 },
        { gen: 'bass', pat: 'R - - R F - - -', inst: 'bass', oct: 2, vol: 0.9 },
        { drum: 'timp', pat: 'x . . x . . . . | x . . x . . x x', vol: 0.75 },
        { drum: 'doum', pat: '. . x . . . x .', vol: 0.6 },
        { drum: 'tek', pat: '. x . . x x . x', vol: 0.45 },
      ],
    },
    b_kaien: {   // 카이엔: 비장하고 애절
      key: 'B', mode: 'minor', bpm: 128, sub: 2, prog: '1 6 3 7 4 1 5M 5M',
      parts: [
        { mel: '1\' - - - 7 - 1\' - | 3\' - - - 2\' - 1\' - | 5 - - - 4 - 5 - | 7 - - - 6 - 5 - | 6 - - - 1\' - 6 - | 5 - 3 - 1 - 5 - | #7 - - - 2\' - 4\' - | 3\' - 2\' - #7 - - -', inst: 'strings', oct: 4, vol: 1.6 },
        { gen: 'arp', pat: '1 3 5 3 1 3 5 3', inst: 'pulse', oct: 4, vol: 0.4 },
        { gen: 'bass', pat: 'R - R - R - O -', inst: 'sawbass', oct: 1, vol: 0.9 },
        { drum: 'kick', pat: 'x . . . x . x .', vol: 0.75 },
        { drum: 'snare', pat: '. . . . x . . .', vol: 0.6 },
        { drum: 'hat', pat: 'x . x . x . x .', vol: 0.45 },
      ],
    },
    b_eldrick: {   // 엘드리크: 성가풍의 어두운 곡
      key: 'D', mode: 'dorian', bpm: 76, sub: 2, prog: '1 1 7 7 6 6 5M 5M',
      parts: [
        { mel: '1 - 1 - 2 - 3 - | 2 - 1 - 1 - - - | 3 - 4 - 5 - 4 3 | 4 - 3 - 2 - - - | 5 - 6 - 5 - 4 3 | 4 - 2 - 3 - - - | 2 - 1 - 7, - 6, - | #7, - - - 1 - - -', inst: 'choir', oct: 4, vol: 1.2 },
        { gen: 'pad', inst: 'organ', oct: 3, vol: 0.5 },
        { mel: '1, - - - - - - - . . . . . . . .', inst: 'bell', oct: 3, vol: 0.8 },
        { gen: 'bass', pat: 'R - - - - - - -', inst: 'bass', oct: 1, vol: 0.9 },
        { drum: 'kick', pat: 'x . . . . . . . . . . . x . . .', vol: 0.6 },
        { drum: 'timp', pat: '. . . . . . . . . . . . . . . . . . . . . . . . . . . . x . x .', vol: 0.5 },
      ],
    },

    // ======================= 최종 보스 녹스 (4단계) =======================
    nox1: {   // 1페이즈: 느리고 무거움
      key: 'C', mode: 'phrygian', bpm: 64, sub: 2, prog: '1 1 2 2 1 1 7 2',
      parts: [
        { mel: NOX_MOTIF, inst: 'brass', oct: 3, vol: 1.2 },
        { gen: 'pad', inst: 'choir', oct: 3, vol: 0.8 },
        { gen: 'bass', pat: 'R - - - - - - -', inst: 'sawbass', oct: 1, vol: 1 },
        { drum: 'timp', pat: 'X . . . . . . . . . . . x . x .', vol: 0.8 },
      ],
    },
    nox2: {   // 2페이즈: 템포를 올리고 드럼
      key: 'C', mode: 'phrygian', bpm: 132, sub: 2, prog: '1 1 2 2 1 1 7 2',
      parts: [
        { mel: NOX_MOTIF, inst: 'brass', oct: 4, vol: 1, rate: 1 },
        { mel: NOX_MOTIF, inst: 'saw', oct: 3, vol: 0.6 },
        { gen: 'arp', pat: '1 2 3 2', inst: 'pulse', oct: 4, vol: 0.35 },
        { gen: 'bass', pat: 'R R R O R R R F', inst: 'sawbass', oct: 1, vol: 1 },
        { drum: 'kick', pat: 'x . x . x . x .', vol: 0.8 },
        { drum: 'snare', pat: '. . . . x . . x', vol: 0.6 },
        { drum: 'hat', pat: 'o x o x o x o x', vol: 0.45 },
      ],
    },
    nox3: {   // 3페이즈: 메인 테마가 어둡게 섞여 들어온다
      key: 'C', mode: 'minor', bpm: 132, sub: 2, prog: THEME_PROG,
      parts: [
        { mel: THEME, inst: 'brass', oct: 4, vol: 1.1 },
        { gen: 'pad', inst: 'choir', oct: 3, vol: 0.7 },
        { gen: 'arp', pat: '1 2 3 4 3 2 1 2', inst: 'pulse', oct: 4, vol: 0.35 },
        { gen: 'bass', pat: 'R R O R R R O F', inst: 'sawbass', oct: 1, vol: 1 },
        { drum: 'kick', pat: 'x . x . x . x .', vol: 0.8 },
        { drum: 'snare', pat: '. . . . x . . x', vol: 0.6 },
        { drum: 'timp', pat: 'x . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .', vol: 0.8 },
      ],
    },
    nox4: {   // 광폭화: 더 빠르게
      key: 'C', mode: 'minor', bpm: 160, sub: 2, prog: THEME_PROG,
      parts: [
        { mel: THEME, inst: 'brass', oct: 4, vol: 1.1 },
        { mel: THEME, inst: 'saw', oct: 5, vol: 0.45 },
        { gen: 'arp', pat: '1 2 3 4 3 2 1 2', inst: 'pulse', oct: 4, vol: 0.4 },
        { gen: 'bass', pat: 'R R O R R R O F', inst: 'sawbass', oct: 1, vol: 1 },
        { drum: 'kick', pat: 'x x x . x x x .', vol: 0.8 },
        { drum: 'snare', pat: '. . x . . . x x', vol: 0.65 },
        { drum: 'hat', pat: 'x x x x x x x x', vol: 0.45 },
        { drum: 'timp', pat: 'x . . . . . . . . . . . . . . .', vol: 0.8 },
      ],
    },

    // ======================= 엔딩 =======================
    end_seal: {   // 희생 · 영원한 별: 메인 테마를 느리고 슬프게 (단조)
      key: 'B', mode: 'minor', bpm: 58, sub: 2, prog: THEME_PROG,
      parts: [
        { mel: THEME, inst: 'flute', oct: 5, vol: 0.9 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.7 },
        { gen: 'arp', pat: '1 3 5 3 4 3 5 3', inst: 'harp', oct: 4, vol: 0.4 },
        { gen: 'bass', pat: 'R - - - - - - -', inst: 'bass', oct: 2, vol: 0.6 },
        { mel: THEME, inst: 'musicbox', oct: 5, vol: 0.35, from: 8 },
      ],
    },
    end_purify: {   // 구원 · 새로운 별: 메인 테마를 밝고 희망차게
      key: 'E', mode: 'major', bpm: 108, sub: 2, prog: THEME_PROG,
      parts: [
        { mel: THEME, inst: 'brass', oct: 4, vol: 0.9 },
        { mel: THEME, inst: 'glass', oct: 6, vol: 0.35 },
        { gen: 'pad', inst: 'strings', oct: 3, vol: 0.7 },
        { gen: 'arp', pat: '1 3 5 4 5 3 1 3', inst: 'harp', oct: 4, vol: 0.5 },
        { gen: 'bass', pat: 'R - F - O - F -', inst: 'bass', oct: 2, vol: 0.8 },
        { drum: 'kick', pat: 'x . . . x . . .', vol: 0.5 },
        { drum: 'snare', pat: '. . . . x . . .', vol: 0.4 },
        { drum: 'shaker', pat: 'o x o x o x o x', vol: 0.45 },
      ],
    },
  };
  // 곡마다 체감 음량을 맞추는 배율 (오프라인 렌더링으로 측정한 평균 음량 기준)
  G.SONG_GAIN = {title: 0.67, tutorial: 0.92, t_sprout: 1.08, t_wind: 0.55, t_elen: 0.61, t_rag: 1.3, t_sahrin: 0.97, t_frost: 0.88, t_aeros: 0.79, t_nox: 0.55, f_sprout: 1.38, f_wind: 1.25, f_elen: 0.61, f_rag: 1.38, f_sahrin: 0.81, f_frost: 1.01, f_aeros: 0.71, f_nox: 1.28, b_shellock: 1.34, b_bark: 1.43, b_morwen: 1.01, b_grounder: 1.24, b_parakan: 0.69, b_kaien: 1.52, b_eldrick: 0.65, nox1: 1.6, nox2: 1.36, nox3: 1.17, nox4: 1.01, end_seal: 0.6, end_purify: 0.71};
  // 곡 제목 (설정 화면 / 확인용)
  G.SONG_NAMES = {
    title: '별조각의 계승자', tutorial: '꿈속의 해변',
    t_sprout: '새싹항', t_wind: '바람결 마을', t_elen: '엘렌하임', t_rag: '라그하르트', t_sahrin: '사하린', t_frost: '프로스트벨', t_aeros: '아에로스', t_nox: '녹스게이트',
    f_sprout: '새싹항 섬', f_wind: '바람결 지방', f_elen: '은빛숲', f_rag: '광산 지대', f_sahrin: '모래바다', f_frost: '눈보라', f_aeros: '하늘섬', f_nox: '공허',
    b_shellock: '쉘로크', b_bark: '붉은손 바르크', b_morwen: '모르웬', b_grounder: '그라운더 MK-7', b_parakan: '파라칸', b_kaien: '카이엔', b_eldrick: '엘드리크',
    nox1: '녹스', end_seal: '희생 · 영원한 별', end_purify: '구원 · 새로운 별',
  };
})();
