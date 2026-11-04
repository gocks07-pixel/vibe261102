'use strict';
// NPC 데이터
//  look: 외형 (hair 색, top/bottom 옷 색, style: 머리 모양, beard, hat)
//  shop: 판매 목록 / travel: 이동 서비스 / greet: 평상시 대사
G.NPCS = {
  // ---------- 튜토리얼 (꿈속의 해변) ----------
  lumi:   { name: '루미', title: '꿈의 안내자', look: { hair: '#bfe6ff', top: '#fff0a8', bottom: '#c8a8ff', style: 'bun', gender: 'f', eye: 'big', eyeColor: '#3a5ac0' },
            greet: ['여긴 네 꿈속이야. 깨어나기 전에 몸 쓰는 법을 알려 줄게!', '위쪽에 뜨는 안내를 하나씩 따라 해 봐. 어렵지 않아!', '다 익혔으면 오른쪽 끝 빛나는 포탈로 가면 꿈에서 깨어날 거야.'] },

  // ---------- 새싹항 ----------
  lulu:   { name: '루루', title: '바닷가 소녀', look: { hair: '#f5a623', top: '#f78fb3', bottom: '#c44569', style: 'twin' },
            greet: ['오늘도 바다가 반짝반짝해!', '촌장님은 무서워 보여도 엄청 다정하셔.'] },
  harmon: { name: '하르몬', title: '새싹항 촌장', look: { hair: '#e8e8e8', top: '#7a5c3e', bottom: '#4a3a2a', style: 'bald', beard: true },
            greet: ['새싹항은 작지만 따뜻한 마을이라네.', '무리하지 말게. 몸이 재산이야.'] },
  brody:  { name: '브로디', title: '선장', look: { hair: '#3a2a1a', top: '#2c3e70', bottom: '#20283a', style: 'short', beard: true, hat: '#1a2340' },
            travel: { to: 'wind_village', portal: 'dock', flag: 'ship', label: '바람결 마을로 출항', fail: '아직 배를 띄울 수 없어. 촌장님 허락이 먼저야.' },
            greet: ['바다는 언제나 정직하지. 준비가 안 된 자는 받아 주지 않아.'] },
  mina:   { name: '미나', title: '잡화상', look: { hair: '#7a3a1a', top: '#e8a0b0', bottom: '#6a4a5a', style: 'long' },
            shop: ['pot_red', 'pot_orange', 'pot_blue', 'scroll_town', 'scroll_tele'], greet: ['물약은 넉넉히 챙기세요!'] },
  thor:   { name: '토르', title: '무기·방어구 상인', look: { hair: '#c0602a', top: '#5a5a62', bottom: '#3a3a42', style: 'short', beard: true },
            shop: ['stick_wood', 'leather_hat', 'leather_vest', 'leather_pants', 'leather_boots', 'leather_gloves'], greet: ['좋은 장비가 목숨을 살리는 법이지.'] },
  noah:   { name: '노아', title: '낚시꾼', look: { hair: '#999', top: '#4a7a5a', bottom: '#3a4a3a', style: 'short', hat: '#c9a050' },
            greet: ['쉿, 물고기가 도망가잖나.'] },
  elma:   { name: '엘마', title: '등대지기', look: { hair: '#dfe8ff', top: '#3a5a9a', bottom: '#2a3a6a', style: 'long' },
            greet: ['등대의 빛은 바다를 지키는 약속이에요.'] },

  // ---------- 바람결 마을 ----------
  kir:    { name: '키르', title: '선원', look: { hair: '#2a2a2a', top: '#2c3e70', bottom: '#20283a', style: 'short' },
            travel: { to: 'sprout_port', portal: 'dock', label: '새싹항으로 출항' }, greet: ['새싹항에 가고 싶으면 말만 해!'] },
  sera:   { name: '세라', title: '바람결 마을 대표', look: { hair: '#4a9a6a', top: '#e8f0d8', bottom: '#5a7a4a', style: 'long' },
            greet: ['바람결 마을에 온 걸 환영해요.'] },
  garen:  { name: '가렌', title: '전사 교관 · 길드장', look: { hair: '#5a3a2a', top: '#a83a2a', bottom: '#4a2a22', style: 'short', beard: true },
            greet: ['단련은 배신하지 않는다.'] },
  ria:    { name: '리아', title: '궁수 교관', look: { hair: '#e0c060', top: '#3a8a4a', bottom: '#2a5a32', style: 'pony' },
            greet: ['바람을 읽는 게 활쏘기의 시작이야.'] },
  oswin:  { name: '오스윈', title: '마법사 교관', look: { hair: '#c8c8e8', top: '#3a4a9a', bottom: '#2a2a5a', style: 'long', beard: true, hat: '#2a2a6a' },
            greet: ['지식은 가장 강력한 마법이라네.'] },
  vince:  { name: '빈스', title: '도적 교관', look: { hair: '#1a1a22', top: '#5a3a7a', bottom: '#2a2236', style: 'short' },
            greet: ['...뭘 봐? 볼일 있으면 말해.'] },
  gren:   { name: '그렌', title: '풍차지기', look: { hair: '#a07040', top: '#c0a070', bottom: '#5a4a32', style: 'bald', beard: true },
            greet: ['풍차가 돌아야 마을이 산다네.'] },
  penny:  { name: '페니', title: '잡화상', look: { hair: '#e07040', top: '#f0c070', bottom: '#8a5a32', style: 'twin' },
            shop: ['pot_red', 'pot_orange', 'pot_white', 'pot_blue', 'pot_elixir', 'scroll_town', 'scroll_tele', 'cube'], greet: ['어서 오세요! 뭐든 다 있어요!'] },
  haro:   { name: '하로', title: '장비 상인', look: { hair: '#3a3a3a', top: '#6a6a72', bottom: '#3a3a42', style: 'short' },
            shop: ['sword_iron', 'bow_hunter', 'wand_novice', 'dagger_twin', 'sword_steel', 'bow_wind', 'wand_crystal', 'dagger_shadow',
                   'sprout_hat', 'sprout_top', 'sprout_bottom', 'sprout_shoes', 'traveler_cape', 'traveler_gloves', 'silver_ring', 'wind_belt'],
            greet: ['장비는 레벨에 맞게 바꿔 줘야 해.'] },
  dora:   { name: '도라', title: '창고지기', look: { hair: '#8a6a9a', top: '#7a6a8a', bottom: '#4a3a5a', style: 'long' },
            storage: true, greet: ['짐은 맡겨 두세요! 어느 마을의 도라에게 말해도 같은 창고를 열어 드려요.', '창고는 장비·소비·기타 30칸씩, 골드도 맡길 수 있어요.'] },
  marco:  { name: '마르코', title: '떠돌이 상인', look: { hair: '#6a4a2a', top: '#c08a3a', bottom: '#5a4a32', style: 'short', hat: '#7a5a2a' },
            greet: ['장사는 목숨이 붙어 있어야 하는 거지...'] },
};
