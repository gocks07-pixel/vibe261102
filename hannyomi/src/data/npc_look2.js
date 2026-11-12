'use strict';
// ============================================================
// 1번 꾸미기: NPC 새 그림체 머리 · 눈 배정 (사용자 확인 2026-11-12, 시안 docs/drafts/design/npc/)
//  - 원래 look 은 그대로 두고 그릴 때 쓰는 값만 더함: style2 (머리) · eye2 (눈) · eyeColor · acc · gender · hatOff
//  - 같은 look 을 함께 쓰는 NPC (카이엔 · 엘마 · 연희의 다른 장 모습) 는 한 번에 바뀜
//  - NPC 전용 머리: bald (대머리) · bun (올림머리). 수염 · 두건(hat) 은 원래 look 값
// ============================================================
(function () {
  // [id, 머리, 성별, 눈, 눈 색(null = 원래 색), 덧붙임]
  const T = [
    ['lumi', 'bun', 'f', 'big', '#3a5ac0'], ['lulu', 'twin', 'f', 'bright_smile', '#c44569'], ['harmon', 'bald', 'm', 'soft_gentle', '#5a4a3a'], ['brody', 'adv2', 'm', 'intense_strong', '#3a4a6a'],
    ['mina', 'long', 'f', 'round_big', '#7a4a2a'], ['thor', 'tail', 'm', 'intense_strong', '#7a4a2a'], ['noah', 'dandy_n', 'm', 'soft_gentle', '#4a6a5a'], ['elma', 'long', 'f', 'mystical', '#3a5ac0'],
    ['kir', 'dandy_n', 'm', 'mischievous', '#3a4a6a'], ['sera', 'long', 'f', 'intellectual', '#3a8a5a'], ['garen', 'part_v7', 'm', 'intense_strong', '#5a3a2a'], ['ria', 'pony', 'f', 'big', '#3a8a4a'],
    ['oswin', 'long', 'm', 'intellectual', '#5a5aa8'], ['vince', 'halfup_v4', 'm', 'mischievous', '#6a4a8a'], ['gren', 'bald', 'm', 'soft_gentle', '#7a5a3a'], ['penny', 'twin', 'f', 'round_big', '#c07040'],
    ['haro', 'part_v7', 'm', 'intellectual', '#4a4a5a'], ['dora', 'bob', 'f', 'soft_gentle', '#7a5a8a'], ['marco', 'tail', 'm', 'mischievous', '#7a5a2a'],
    ['trav', 'dandy_n', 'm', 'soft_gentle', '#3a5a8a'], ['silian', 'long', 'f', 'mystical', null, { acc: 'circlet', hatOff: true }], ['seren', 'pony', 'f', 'intellectual', '#3a6ad0'], ['pio', 'part_v7', 'm', 'big', '#5a8a3a'],
    ['kaien', 'dandy_n', 'm', 'intense_strong', '#c03050'], ['orn', 'bald', 'm', 'intense_strong', '#5a3a2a'], ['elin', 'twin', 'f', 'bright_smile', '#c08a40'], ['volga', 'tail', 'm', 'soft_gentle', '#5a4a3a'],
    ['zen', 'adv2', 'm', 'intense_strong', '#4a3a2a'], ['tiko', 'halfup_v4', 'm', 'big', '#c07030'], ['rag_smith', 'part_v7', 'm', 'intense_strong', '#4a4a5a'], ['rag_shop', 'bob', 'f', 'round_big', '#8a4a7a'],
    ['yeonhee_rag', 'long', 'f', 'big', null, { acc: 'pin' }], ['azar', 'tail', 'm', 'intense_strong', '#5a3a1a'], ['hakim', 'dandy_n', 'm', 'mischievous', '#6a4a2a'], ['meirin', 'bun', 'f', 'intellectual', '#6a4a8a'],
    ['sah_smith', 'bald', 'm', 'intense_strong', '#3a2a1a'], ['sah_shop', 'long', 'f', 'mystical', '#c08a30'],
    ['valeria', 'long', 'f', 'intellectual', '#5a8ad0', { acc: 'circlet', hatOff: true }], ['artel', 'long', 'm', 'soft_gentle', '#5a7ab0'], ['heidel', 'halfup_v4', 'm', 'intense_strong', null], ['rok', 'tail', 'm', 'intellectual', '#5a4a2a'],
    ['fro_smith', 'part_v7', 'm', 'soft_gentle', '#5a6a8a'], ['fro_shop', 'twin', 'f', 'round_big', '#5a9ad0'], ['aurelion_npc', 'long', 'm', 'mystical', null], ['orion', 'long', 'm', 'intellectual', '#3a3a8a'],
    ['oriel', 'part_v7', 'm', 'intense_strong', '#c8a030'], ['yuna', 'twin', 'f', 'big', '#8a5ad0'], ['aer_smith', 'pony', 'f', 'intense_strong', '#5a6ab0'], ['aer_shop', 'bob', 'f', 'bright_smile', '#e08aa0'],
  ];
  // 첫 번째 영웅의 잔영(아스트라)은 옛 그림체 그대로 (이야기 영상의 일곱 영웅 잔영도 이 모습) — 사용자 결정
  if (G.NPCS.astra && G.NPCS.astra.look) G.NPCS.astra.look.oldHead = true;
  for (const [id, st, gd, eye, ec, ex] of T) {
    const n = G.NPCS[id]; if (!n || !n.look) continue;
    Object.assign(n.look, { style2: st === 'bun' ? 'bun' : st, eye2: eye, gender: gd }, ec ? { eyeColor: ec } : {}, ex || {});
  }
})();
