'use strict';
// 스킬 데이터
//  type: attack | buff | heal | move | passive
//  atk.kind: melee(앞쪽) | aoe(주변) | proj(투사체) | rain(낙하) | dash(돌진) | back(후퇴 사격)
//  icon: g = 문양, el = 속성 색
(function () {
  const L = G.U.lin;
  const S = G.SKILLS = {};
  const add = (id, o) => { o.id = id; o.maxLv = o.maxLv || 20; S[id] = o; };

  // ---------------- 초보자 (자동 습득, 레벨 고정) ----------------
  add('b_stone', {
    name: '돌 던지기', job: 'beginner', maxLv: 1, fixed: true, type: 'attack', icon: { g: 'stone', el: 'earth' },
    mp: () => 3, cd: 0.5,
    atk: { kind: 'proj', pct: () => 110, count: 1, speed: 650, range: 420, proj: 'stone' },
    desc: () => '돌을 던져 110% 데미지를 준다.',
  });
  add('b_aid', {
    name: '응급 처치', job: 'beginner', maxLv: 1, fixed: true, type: 'heal', icon: { g: 'heal', el: 'holy' },
    mp: () => 5, cd: 30, heal: () => 25,
    desc: () => '최대 HP의 25%를 즉시 회복한다. (재사용 30초)',
  });

  add('b_djump', {
    name: '2단 점프', job: 'beginner', maxLv: 1, fixed: true, type: 'toggle', icon: { g: 'dash', el: 'wind' },
    desc: () => '공중에서 점프를 한 번 더 누르면 2단 점프. [앞으로] 모드: 앞으로 살짝 / [위로] 모드: 위로 한 번 더. 어느 모드든 ↑ + 점프는 위로 뛴다.',
  });

  // ---------------- 전사 ----------------
  add('w_strike', {
    name: '강타', job: 'warrior', type: 'attack', icon: { g: 'slash', el: 'fire' },
    mp: L(4, 10), cd: 0,
    atk: { kind: 'melee', pct: L(225, 350), w: 120, h: 90, targets: 1, hits: 1, fx: 'slash' },   // 2.1: +25%
    desc: lv => `앞의 적 1명을 강하게 내려쳐 ${L(225, 350)(lv)}% 데미지.`,
  });
  add('w_whirl', {
    name: '회전 베기', job: 'warrior', type: 'attack', icon: { g: 'whirl', el: 'fire' },
    mp: L(8, 14), cd: 1.2,
    atk: { kind: 'aoe', pct: L(110, 180), w: 280, h: 110, targets: 6, hits: 1, fx: 'whirl' },
    desc: lv => `몸을 회전시켜 주변 적 최대 6명에게 ${L(110, 180)(lv)}% 데미지.`,
  });
  add('w_charge', {
    name: '돌격', job: 'warrior', type: 'attack', icon: { g: 'dash', el: 'fire' },
    mp: () => 10, cd: 4,
    atk: { kind: 'dash', pct: L(140, 220), dist: 260, targets: 5, hits: 1 },
    desc: lv => `앞으로 돌진하며 경로의 적 최대 5명에게 ${L(140, 220)(lv)}% 데미지. (재사용 4초)`,
  });
  add('w_iron', {
    name: '강철 의지', job: 'warrior', type: 'buff', icon: { g: 'shield', el: 'fire' },
    mp: () => 15, cd: 1,
    buff: { dur: L(120, 300), stats: lv => ({ def: L(10, 60)(lv), HPp: L(5, 20)(lv) }) },
    desc: lv => `${L(120, 300)(lv)}초 동안 방어력 +${L(10, 60)(lv)}, 최대 HP +${L(5, 20)(lv)}%.`,
  });
  add('w_mastery', {
    name: '검술 수련', job: 'warrior', type: 'passive', icon: { g: 'book', el: 'fire' },
    passive: lv => ({ atk: L(1, 15)(lv), critDmg: L(1, 10)(lv) }),
    desc: lv => `[패시브] 공격력 +${L(1, 15)(lv)}, 치명타 피해 +${L(1, 10)(lv)}%.`,
  });

  // ---------------- 궁수 ----------------
  add('a_double', {
    name: '연발 사격', job: 'archer', type: 'attack', icon: { g: 'arrows', el: 'wind' },
    mp: L(4, 8), cd: 0,
    atk: { kind: 'proj', pct: L(100, 160), count: 2, stagger: 12, speed: 950, range: 560, proj: 'arrow' },
    desc: lv => `화살 2발을 연속으로 쏴 각각 ${L(100, 160)(lv)}% 데미지.`,
  });
  add('a_rain', {
    name: '화살 비', job: 'archer', type: 'attack', icon: { g: 'rain', el: 'wind' },
    mp: L(10, 16), cd: 3,
    atk: { kind: 'rain', pct: L(90, 150), count: 6, area: 320, ahead: 230 },
    desc: lv => `앞쪽 넓은 범위에 화살 6발을 퍼부어 각각 ${L(90, 150)(lv)}% 데미지. (재사용 3초)`,
  });
  add('a_back', {
    name: '후퇴 사격', job: 'archer', type: 'attack', icon: { g: 'backshot', el: 'wind' },
    mp: () => 8, cd: 3,
    atk: { kind: 'back', pct: L(180, 260), dist: 180, count: 1, pierce: 3, speed: 1000, range: 600, proj: 'arrow' },
    desc: lv => `뒤로 물러나며 관통 화살을 쏴 최대 3명에게 ${L(180, 260)(lv)}% 데미지. (재사용 3초)`,
  });
  add('a_hawk', {
    name: '매의 눈', job: 'archer', type: 'buff', icon: { g: 'eye', el: 'wind' },
    mp: () => 15, cd: 1,
    buff: { dur: L(120, 300), stats: lv => ({ crit: L(10, 30)(lv), atk: L(2, 10)(lv) }) },
    desc: lv => `${L(120, 300)(lv)}초 동안 치명타 확률 +${L(10, 30)(lv)}%, 공격력 +${L(2, 10)(lv)}.`,
  });
  add('a_mastery', {
    name: '활 수련', job: 'archer', type: 'passive', icon: { g: 'book', el: 'wind' },
    passive: lv => ({ atk: L(1, 15)(lv), crit: L(1, 10)(lv) }),
    desc: lv => `[패시브] 공격력 +${L(1, 15)(lv)}, 치명타 확률 +${L(1, 10)(lv)}%.`,
  });

  // ---------------- 마법사 ----------------
  add('m_bolt', {
    name: '마나 탄', job: 'mage', type: 'attack', icon: { g: 'orb', el: 'arcane' },
    mp: L(6, 12), cd: 0,
    atk: { kind: 'proj', pct: L(200, 300), count: 1, speed: 780, range: 470, proj: 'orb' },
    desc: lv => `마나 구체를 날려 ${L(200, 300)(lv)}% 데미지.`,
  });
  add('m_burst', {
    name: '마나 폭발', job: 'mage', type: 'attack', icon: { g: 'burst', el: 'arcane' },
    mp: L(14, 22), cd: 2,
    atk: { kind: 'aoe', pct: L(130, 200), w: 320, h: 170, targets: 6, hits: 1, fx: 'burst' },
    desc: lv => `주변에 마나를 폭발시켜 최대 6명에게 ${L(130, 200)(lv)}% 데미지. (재사용 2초)`,
  });
  add('m_blink', {
    name: '별빛 도약', job: 'mage', type: 'move', icon: { g: 'blink', el: 'arcane' },
    mp: () => 12, cd: 1.5, dist: L(160, 260),
    desc: lv => `바라보는 방향으로 ${L(160, 260)(lv)}px 순간이동. (↑를 누르고 있으면 위로)`,
  });
  add('m_shield', {
    name: '별의 장막', job: 'mage', type: 'buff', icon: { g: 'barrier', el: 'arcane' },
    mp: () => 15, cd: 8,
    buff: { dur: L(30, 60), stats: lv => ({ barrier: L(10, 30)(lv) }) },
    desc: lv => `${L(30, 60)(lv)}초 동안 최대 HP의 ${L(10, 30)(lv)}%만큼 피해를 흡수하는 별빛 장막을 두른다. (재사용 8초)`,
  });
  add('m_flow', {
    name: '마나 순환', job: 'mage', type: 'passive', icon: { g: 'flow', el: 'arcane' },
    passive: lv => ({ MPp: L(2, 20)(lv), mpRegen: L(2, 20)(lv), atk: L(1, 10)(lv) }),
    desc: lv => `[패시브] 최대 MP +${L(2, 20)(lv)}%, 5초마다 MP +${L(2, 20)(lv)}, 공격력 +${L(1, 10)(lv)}.`,
  });

  // ---------------- 도적 ----------------
  add('t_double', {
    name: '쌍단검 연격', job: 'thief', type: 'attack', icon: { g: 'dagger2', el: 'shadow' },
    mp: L(5, 10), cd: 0,
    atk: { kind: 'melee', pct: L(110, 170), w: 110, h: 85, targets: 3, hits: 2, fx: 'slash' },
    desc: lv => `빠르게 두 번 베어 앞의 적 최대 3명에게 ${L(110, 170)(lv)}% × 2 데미지.`,
  });
  add('t_star', {
    name: '표창 투척', job: 'thief', type: 'attack', icon: { g: 'star', el: 'shadow' },
    mp: L(6, 12), cd: 0,
    atk: { kind: 'proj', pct: L(100, 160), count: 3, spread: 0.12, speed: 900, range: 500, pierce: 1, proj: 'star' },
    desc: lv => `표창 3개를 부채꼴로 던져 각각 ${L(100, 160)(lv)}% 데미지.`,
  });
  add('t_shadow', {
    name: '그림자 도약', job: 'thief', type: 'attack', icon: { g: 'shadow', el: 'shadow' },
    mp: () => 12, cd: 5,
    atk: { kind: 'dash', pct: L(120, 200), dist: 250, targets: 4, hits: 1, invuln: true },
    desc: lv => `그림자가 되어 적을 통과하며 최대 4명에게 ${L(120, 200)(lv)}% 데미지. 이동 중 무적. (재사용 5초)`,
  });
  add('t_venom', {
    name: '독 바르기', job: 'thief', type: 'buff', icon: { g: 'venom', el: 'poison' },
    mp: () => 15, cd: 1,
    buff: { dur: L(120, 300), stats: lv => ({ poison: L(20, 50)(lv) }) },
    desc: lv => `${L(120, 300)(lv)}초 동안 공격 시 ${L(20, 50)(lv)}% 확률로 중독 (4초간 초당 기본 데미지의 30%).`,
  });
  add('t_mastery', {
    name: '단검 수련', job: 'thief', type: 'passive', icon: { g: 'book', el: 'shadow' },
    passive: lv => ({ crit: L(1, 20)(lv), atk: L(1, 10)(lv) }),
    desc: lv => `[패시브] 치명타 확률 +${L(1, 20)(lv)}%, 공격력 +${L(1, 10)(lv)}.`,
  });
})();

G.skillsOfJob = job => Object.values(G.SKILLS).filter(s => s.job === job);
