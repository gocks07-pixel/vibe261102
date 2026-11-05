'use strict';
// 엔딩 (별의 선택: 봉인 / 정화 / 2.0 히든: 공명)
G.Ending = {
  TEXT: {
    seal: {
      title: '희생 엔딩 · 영원한 별',
      lines: [
        '당신은 일곱 별조각을 품에 안고 공허의 문 앞에 섰다.',
        '별빛이 몸을 감싸며, 손끝부터 천천히 흩어지기 시작했다.',
        '엘마가 울며 이름을 불렀고, 카이엔은 끝내 고개를 돌리지 못했다.',
        '여덟 번째 별은 봉인의 마지막 고리가 되어, 공허를 영원히 잠재웠다.',
        '그날 이후, 아르셀리아의 밤하늘에는 전에 없던 별 하나가 떴다.',
        '사람들은 그 별을 "계승자의 별"이라 불렀다. 녹스의 등불은 끝내 켜지지 못한 채 잠들었다.',
      ],
    },
    purify: {
      title: '구원 엔딩 · 새로운 별',
      lines: [
        '당신은 무너진 녹스에게 손을 내밀었다.',
        '공허는 증오가 아니었다. 별빛이 닿지 않던 곳에 쌓인 오래된 외로움이었다.',
        '여덟 개의 별빛이 공허를 감싸고, 처음으로 켜진 등불과 함께 녹스의 형체가 천천히 빛으로 녹아내렸다.',
        '공허의 문은 닫히지 않았다. 대신 그곳에서 처음 보는 작은 별들이 태어나기 시작했다.',
        '엘마는 웃었고, 카이엔은 처음으로 하늘을 올려다보았다.',
        '당신의 모험은 끝나지 않았다. 새로운 별들의 세계가 기다리고 있으니까.',
      ],
    },
    hidden: {   // 2.0
      title: '히든 엔딩 · 함께 빛나는 별',
      lines: [
        '당신은 별빛을 혼자 바치지 않았다.',
        '영웅의 피를 이은 엘마, 교단에서 돌아온 카이엔, 그리고 일곱 영웅의 잔영이 함께 손을 내밀었다.',
        '녹스는 오백 년의 외로움에서 풀려나, 처음으로 별이 되었다. 아무도 사라지지 않았다.',
        '일곱 영웅의 잔영은 그제야 고개를 숙이고 편히 잠들었다.',
        '모든 것이 시작된 새싹항의 바닷가에서, 셋은 새로 태어난 별을 올려다보았다.',
      ],
    },
  },
  // preview: 테스트 모드 미리보기 (세이브에 엔딩 클리어 기록을 남기지 않음)
  play(kind, preview) {
    const p = G.Game.player, E = this.TEXT[kind];
    if (!preview) { p.d.ending = kind; p.d.flags.cleared = true; if (kind === 'hidden') p.d.flags.hiddenClear = true; G.Game.save(true); }
    // 1.7.7: 장면 영상(음악·멘트) → 크레딧
    G.Cutscene.play(kind, () => this.credits(kind));
  },
  credits(kind) {
    const E = this.TEXT[kind];
    if (!/^end_/.test(G.Music.want || (G.Music.cur && G.Music.cur.id) || '')) G.Music.play(G.Cutscene.MUSIC[kind] || 'end_purify', 1.5);
    const tEnd = 0.6;
    G.UI.overlay(`<div class="overlay ending">
      <div class="end-box">
        <h2 style="opacity:0;animation:endIn 1.5s ${tEnd}s forwards;color:#ffe4a0;font-size:26px;font-weight:900;margin-top:26px">— ${E.title} —</h2>
        <div style="opacity:0;animation:endIn 1.5s ${tEnd + 1.5}s forwards" class="credits">
          <span class="cr-title">과금없이 즐기는 연희의 RPG 대모험</span><br>기획 · 개발 : HC<br>플레이해 주셔서 감사합니다!<br>
          <span class="cr-copy">© 2026 HC. All rights reserved.<br>무단 복제 · 배포 · 수정 배포를 금지합니다.</span><br><br>
          ${G.Hidden.creditNote(kind)}
          ${kind !== 'hidden' && !G.Hidden.ready() ? '' : `<button class="btn gold" data-act="title" data-arg="closehelp">계속 플레이</button>`}
          <button class="btn" data-act="menu" data-arg="title">타이틀로</button>
        </div>
      </div></div>`);
  },
};
