'use strict';
// ============================================================
// 빌드 1 (3번): 장마다 메인 + 서브 퀘스트 보상으로 그 장 세트 한 벌 (docs/BUILD_MOBILE_PLAN.md "3번 계획서")
//  - 지금 보상은 그대로 두고 세트 부위를 덧붙임 (+0, 무기는 '@' = 직업에 맞는 무기)
//  - 연희의 선물(c3_s5) · 영웅의 시련(f_04) 보상은 그대로
// ============================================================
(function () {
  const T = {
    // 1장 새싹 모험가
    s05: 'sprout_hat', s06: 'sprout_top', s07: 'sprout_bottom', s08: 'sprout_shoes',
    // 2장 엘렌 숲지기
    c2_s1: 'elen_hat', c2_s2: 'elen_top', c2_s4: 'elen_bottom', c2_s3: 'elen_shoes', c2_05: 'elen_gloves',
    // 3장 라그 강철
    c3_s2: 'ar40_hat', c3_s3: 'ar40_top', c3_05: 'ar40_bottom', c3_s1: 'ar40_shoes', c3_s4: 'ar40_gloves',
    // 4장 사하린 왕조
    c4_s1: 'ar55_hat', c4_s3: 'ar55_top', c4_05: 'ar55_bottom', c4_s2: 'ar55_shoes', c4_s4: 'ar55_gloves',
    // 5장 서리용
    c5_s3: 'ar70_hat', c5_03: 'ar70_top', c5_s2: 'ar70_bottom', c5_04: 'ar70_shoes', c5_05: 'ar70_gloves', c5_s4: 'ar70_cape', c5_s1: '@wp70',
    // 6장 천공
    c6_s2: 'ar85_hat', c6_04: 'ar85_top', c6_05: 'ar85_bottom', c6_s3: 'ar85_shoes', c6_06: 'ar85_gloves', c6_s4: '@wp85', c6_s1: 'ar85_cape',
  };
  for (const id in T) {
    const q = G.QUESTS[id];
    if (!q) { console.warn('세트 보상: 퀘스트 없음', id); continue; }
    q.items = (q.items || []).concat([[T[id], 1]]);
  }
})();
