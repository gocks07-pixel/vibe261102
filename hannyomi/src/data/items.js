'use strict';
// 아이템 템플릿
//  cat: equip | use | etc
//  equip: slot, type(무기 종류), job, lv, base(기본 옵션), set, noDrop(일반 몬스터가 안 떨어뜨림)
(function () {
  const I = G.ITEMS = {};
  const add = (id, o) => { o.id = id; I[id] = o; };
  const weaponAtk = L => Math.round(8 + 2 * L);
  const SLOT_DEF = { hat: 0.6, top: 1, bottom: 0.7, shoes: 0.4, gloves: 0.4, cape: 0.4 };
  const armorDef = (L, slot) => Math.round((3 + 1.5 * L) * SLOT_DEF[slot]);

  function W(id, name, type, job, lv, color, extra = {}, more = {}) {
    add(id, Object.assign({
      name, cat: 'equip', slot: 'weapon', type, job, lv, icon: type, color,
      base: Object.assign({ atk: weaponAtk(lv) }, extra), price: 30 + lv * lv * 6,
    }, more));
  }
  function A(id, name, slot, lv, color, extra = {}, more = {}) {
    add(id, Object.assign({
      name, cat: 'equip', slot, job: 'any', lv, icon: slot, color,
      base: Object.assign({ def: armorDef(lv, slot) }, extra), price: 20 + lv * lv * 4,
    }, more));
  }
  function AC(id, name, slot, lv, color, base, more = {}) {
    add(id, Object.assign({ name, cat: 'equip', slot, job: 'any', lv, icon: slot, color, base, price: 50 + lv * lv * 5 }, more));
  }
  function U(id, name, icon, color, price, use, desc) {
    add(id, { name, cat: 'use', icon, color, price, use, desc, stack: 200 });
  }
  function Q(id, name, icon, color, desc) {
    add(id, { name, cat: 'etc', icon, color, desc, stack: 200, quest: true, price: 0 });
  }

  // ---------- 무기 ----------
  W('stick_wood', '나무 막대', 'stick', 'any', 0, '#a0703c');
  W('sword_iron', '철제 장검', 'sword', 'warrior', 10, '#c9d1dc');
  W('bow_hunter', '사냥꾼의 단궁', 'bow', 'archer', 10, '#a0703c');
  W('wand_novice', '견습 마법봉', 'wand', 'mage', 10, '#7fa8ff', { INT: 2 });
  W('dagger_twin', '쌍날 단검', 'dagger', 'thief', 10, '#c9d1dc', { LUK: 2 }, {});
  W('sword_steel', '강철 대검', 'sword', 'warrior', 15, '#8fb3d9');
  W('bow_wind', '바람결 장궁', 'bow', 'archer', 15, '#5fc98a');
  W('wand_crystal', '수정 완드', 'wand', 'mage', 15, '#b18cff', { INT: 3 });
  W('dagger_shadow', '그림자 단검', 'dagger', 'thief', 15, '#8e6fc4', { LUK: 3 });
  W('sword_red', '붉은손 대검', 'sword', 'warrior', 20, '#e05545', { STR: 3 });
  W('bow_red', '붉은손 장궁', 'bow', 'archer', 20, '#e05545', { DEX: 3 });
  W('wand_red', '붉은손 지팡이', 'wand', 'mage', 20, '#e05545', { INT: 5 });
  W('dagger_red', '붉은손 단검', 'dagger', 'thief', 20, '#e05545', { LUK: 4 });

  // ---------- 방어구 ----------
  A('cloth_top', '선원 셔츠', 'top', 0, '#dfe6ee');
  A('cloth_pants', '낡은 바지', 'bottom', 0, '#6b5a48');
  A('cloth_shoes', '낡은 신발', 'shoes', 0, '#6b4a2c');
  A('leather_hat', '가죽 모자', 'hat', 3, '#8a5a32');
  A('leather_vest', '가죽 조끼', 'top', 3, '#8a5a32');
  A('leather_pants', '가죽 바지', 'bottom', 3, '#7a4a28');
  A('leather_boots', '가죽 장화', 'shoes', 5, '#6b3e1e');
  A('leather_gloves', '가죽 장갑', 'gloves', 5, '#8a5a32');
  A('sprout_hat', '새싹 모험가 모자', 'hat', 10, '#66c26a', {}, { set: 'sprout' });
  A('sprout_top', '새싹 모험가 상의', 'top', 10, '#66c26a', {}, { set: 'sprout' });
  A('sprout_bottom', '새싹 모험가 하의', 'bottom', 10, '#4e9e52', {}, { set: 'sprout' });
  A('sprout_shoes', '새싹 모험가 신발', 'shoes', 10, '#4e9e52', {}, { set: 'sprout' });
  A('traveler_cape', '여행자 망토', 'cape', 12, '#9a6a3a', { HP: 30 });
  A('traveler_gloves', '여행자 장갑', 'gloves', 12, '#9a6a3a', { atk: 1 });
  A('elen_hat', '엘렌 숲지기 모자', 'hat', 20, '#2fa36b', { allStat: 2 }, { set: 'elen', noDrop: true });
  A('elen_top', '엘렌 숲지기 상의', 'top', 20, '#2fa36b', { allStat: 2 }, { set: 'elen', noDrop: true });
  A('elen_bottom', '엘렌 숲지기 하의', 'bottom', 20, '#27845a', { allStat: 2 }, { set: 'elen', noDrop: true });
  A('elen_shoes', '엘렌 숲지기 신발', 'shoes', 20, '#27845a', { allStat: 2 }, { set: 'elen', noDrop: true });
  A('elen_gloves', '엘렌 숲지기 장갑', 'gloves', 20, '#2fa36b', { allStat: 2, atk: 1 }, { set: 'elen', noDrop: true });

  // ---------- 장신구 ----------
  AC('lulu_earring', '루루의 조개 귀걸이', 'earring', 2, '#ffb3d1', { DEX: 2, LUK: 2 }, { noDrop: true });
  AC('noah_ring', '노아의 낡은 반지', 'ring', 7, '#c0a060', { allStat: 1, HP: 30 }, { noDrop: true });
  AC('silver_ring', '은반지', 'ring', 10, '#d8dde6', { allStat: 2 });
  AC('wind_belt', '바람결 벨트', 'belt', 10, '#8a6a40', { HP: 50 });
  AC('relic_earring', '영웅의 유물: 파도의 귀걸이', 'earring', 10, '#4fc3f7', { allStat: 3, atk: 1 }, { set: 'relic', noDrop: true });
  AC('relic_pendant', '영웅의 유물: 바람의 펜던트', 'pendant', 15, '#7de3b0', { allStat: 4, HP: 80 }, { set: 'relic', noDrop: true });
  AC('relic_ring', '영웅의 유물: 붉은 맹세의 반지', 'ring', 20, '#ff6b6b', { allStat: 4, atk: 2 }, { set: 'relic', noDrop: true });
  AC('relic_belt', '영웅의 유물: 질풍의 벨트', 'belt', 20, '#9ad16b', { allStat: 3, HP: 100 }, { set: 'relic', noDrop: true });

  // ---------- 소비 ----------
  U('pot_red', '들풀 회복약', 'potion', '#7ac85a', 20, { hp: 50 }, 'HP를 50 회복한다.');
  U('pot_orange', '해초 회복약', 'potion', '#2fb39a', 60, { hp: 150 }, 'HP를 150 회복한다.');
  U('pot_white', '진주 회복약', 'potion', '#f6e8f0', 150, { hp: 300 }, 'HP를 300 회복한다.');
  U('pot_blue', '이슬 한 모금', 'potion', '#8fd8ff', 40, { mp: 60 }, 'MP를 60 회복한다.');
  U('pot_elixir', '맑은 이슬', 'potion', '#5aa8ff', 120, { mp: 200 }, 'MP를 200 회복한다.');
  U('scroll_town', '귀환의 깃털', 'scroll', '#f1c40f', 100, { town: true }, '가장 최근에 들른 마을로 돌아간다.');
  U('scroll_tele', '여행자의 나침반', 'scroll', '#5ad1ff', 1500, { tele: true }, '가 본 적 있는 맵을 골라 바로 이동한다. (보스 방 제외)');
  U('flame', '불꽃석 (옛 아이템)', 'flame', '#ff7a2a', 1500, {}, '1.6.1부터 대장장이의 "장비 단련"으로 바뀌었다. 세이브를 불러오면 1개당 1,500 골드로 환급된다.');
  U('cube', '공명석', 'cube', '#c58bff', 5000, { target: 'cube' }, '장비에 새겨진 별자리 각인 한 줄을 골라 다시 새긴다.\n쓸 때마다 공명 게이지가 차고, 가득 차면 등급이 오른다.\n더블클릭 후 장비를 클릭해서 사용.');

  U('scroll_100', '별빛 각인서', 'scroll', '#7dd3ff', 800, { target: 'scroll' }, '장비의 각인 칸을 하나 채워 강화한다 (+1).\n성공률은 채울 칸 단계에 따라 100% → 30%로 낮아진다.\n실패해도 칸은 그대로 남는다. 높은 칸일수록 특수 효과가 잘 붙는다.\n더블클릭 후 장비를 클릭해서 사용.');
  U('scroll_70', '용기의 주문서 (옛 아이템)', 'scroll', '#ffd54a', 1600, {}, '1.6.1부터 별빛 각인서로 바뀌었다. 세이브를 불러오면 각인서 2장으로 바뀐다.');
  U('scroll_30', '도박의 주문서 (옛 아이템)', 'scroll', '#ff6a6a', 3000, {}, '1.6.1부터 별빛 각인서로 바뀌었다. 세이브를 불러오면 각인서 3장으로 바뀐다.');

  // ---------- 별조각 계승자 세트 (Lv.100, 녹스 드롭 · 테스트 모드 장비) ----------
  const T = { set: 'starheir', noDrop: true };
  W('trial_sword', '별조각 대검', 'sword', 'warrior', 100, '#ffe06a', { STR: 20 }, T);
  W('trial_bow', '별조각 장궁', 'bow', 'archer', 100, '#ffe06a', { DEX: 20 }, T);
  W('trial_wand', '별조각 지팡이', 'wand', 'mage', 100, '#ffe06a', { INT: 25 }, T);
  W('trial_dagger', '별조각 단검', 'dagger', 'thief', 100, '#ffe06a', { LUK: 20 }, T);
  A('trial_hat', '별조각 왕관', 'hat', 100, '#f0d060', { allStat: 15 }, T);
  A('trial_top', '별조각 갑주', 'top', 100, '#f0d060', { allStat: 15 }, T);
  A('trial_bottom', '별조각 각반', 'bottom', 100, '#c8a840', { allStat: 15 }, T);
  A('trial_shoes', '별조각 장화', 'shoes', 100, '#c8a840', { allStat: 12 }, T);
  A('trial_gloves', '별조각 장갑', 'gloves', 100, '#f0d060', { allStat: 12, atk: 8 }, T);
  A('trial_cape', '별조각 망토', 'cape', 100, '#8a5ad0', { allStat: 12 }, T);
  AC('trial_earring', '계승자의 귀걸이', 'earring', 100, '#ffe06a', { allStat: 15, atk: 5 }, { noDrop: true });
  AC('trial_ring', '계승자의 반지', 'ring', 100, '#ffe06a', { allStat: 15, atk: 5 }, { noDrop: true });
  AC('trial_pendant', '계승자의 펜던트', 'pendant', 100, '#ffe06a', { allStat: 15, HP: 800 }, { noDrop: true });
  AC('trial_belt', '계승자의 벨트', 'belt', 100, '#ffe06a', { allStat: 15, HP: 800 }, { noDrop: true });

  // ---------- 퀘스트 / 기타 ----------
  Q('q_jelly', '풀잎 젤리 조각', 'jelly', '#7bd36a', '탱탱한 젤리 조각. 낚시 미끼로 쓴다.');
  Q('q_shell', '반짝이는 조개', 'shell', '#ffd1e3', '햇빛을 받으면 무지갯빛으로 빛난다.');
  Q('q_spore', '포자 샘플', 'spore', '#b38ad9', '보랏빛이 도는 이상한 포자.');
  Q('q_cap', '버섯 갓', 'mushroom', '#b5651d', '물약 재료로 쓰이는 버섯 갓.');
  Q('q_pearl', '빛나는 진주', 'pearl', '#e6f7ff', '은은한 빛을 내는 진주. 등대의 연료가 된다.');
  Q('q_gear', '낡은 톱니바퀴', 'gear', '#b0a080', '허수아비 골렘 몸속에 박혀 있던 톱니바퀴.');
  Q('q_cloth', '검은 천 조각', 'cloth', '#2a2a36', '눈 모양 문양이 수놓인 검은 천.');
  Q('q_hide', '산양 털 뭉치', 'cloth', '#f2f0ea', '바람을 머금은 듯 가볍고 따뜻한 털.');
  Q('q_pack', '상인의 짐 꾸러미', 'bag', '#c09a5a', '마르코의 이름이 적힌 짐 꾸러미.');
  Q('star_wind', '바람의 별조각', 'shard', '#7de3f0', '일곱 별조각 중 하나. 손등의 문양과 공명한다.');
  G.ItemMake = { W, A, AC, U, Q };
})();

G.EQUIP_SLOTS = ['hat', 'earring', 'pendant', 'cape', 'top', 'gloves', 'ring1', 'ring2', 'bottom', 'belt', 'shoes', 'weapon'];
G.SLOT_NAMES = {
  weapon: '무기', hat: '모자', top: '상의', bottom: '하의', shoes: '신발', gloves: '장갑', cape: '망토',
  earring: '귀걸이', ring: '반지', ring1: '반지 1', ring2: '반지 2', pendant: '펜던트', belt: '벨트',
};
G.WEAPON_NAMES = { stick: '막대', sword: '검', bow: '활', wand: '완드', dagger: '단검' };
