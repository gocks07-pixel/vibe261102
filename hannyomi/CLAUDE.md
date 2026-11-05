# 한요미의 대모험 (아르셀리아 연대기)

2D 횡스크롤 액션 RPG. HTML5 Canvas + 순수 JavaScript, EXE는 Electron으로 포장한다.
사용자와는 한국어로 대화한다. 게임 안의 모든 텍스트도 한국어.

## 실행
- 빌드 도구 없음. `index.html`을 브라우저로 열면 바로 실행된다 (모듈이 아닌 일반 `<script>` 태그, 로드 순서 중요).
- EXE: `npm install` → `npm start` (테스트) / `npm run build` (포터블 EXE, `dist/`)

## 구조
- 모든 모듈은 전역 `G` 아래에 등록 (`src/util.js`가 `window.G` 생성)
- `src/data/` 게임 데이터 (공식, 직업, 스킬, 아이템, 몬스터, 보스 패턴, NPC, 퀘스트, 맵)
  - `jobs2.js` 2~4차 전직과 스킬, `world2.js` 2장~종장 맵·몬스터·장비·NPC, `story2.js` 2장~종장 퀘스트와 엔딩
- `src/core/` 입력, 키 설정, 효과음(`audio.js` 기본 · `sound.js` 스킬·전투 1.8), 배경음악 엔진(`music.js`), 세이브(슬롯 A/B/C), 설정
  - `src/data/songs.js` 배경음악 28곡 악보, `src/systems/chapter.js` 챕터 이름과 장 전환 연출
  - `src/systems/storage.js` 창고·순간이동 주문서, `src/ui/windows3.js` 그 창들, `src/data/story3.js` 1.5 서브 퀘스트
- `src/render/` 아이콘(SVG 생성, 스킬 전용 문양은 `icons2.js`), 캐릭터·몬스터 그리기, 배경
  - `monsters2.js`(1.6, 32종) · `monsters3.js`(1.7, 38종 + 1.7.2 아우렐리온) · `monsters4.js`(1.7.8 라그하르트 5종, 옛 그림 대신) 몬스터 전용 그림·움직임 (`G.MonArt[몬스터 id]`). 71종 모두 등록됨. 새 몬스터는 여기에 등록 (안 하면 `sprites.js`의 공용 모양)
- `src/systems/` 아이템·스탯·퀘스트·전투·튜토리얼·길 안내, `monskill.js` 몬스터 스킬 (1.7.5·1.7.6, 공통 틀 8개 + `G.MONSKILL[몬스터 id]` 데이터 54종), `skillx.js` 직업 스킬 동작·연출 (1.7.10~)
- `src/entity/` 플레이어, 몬스터, 보스 AI, 투사체, 드롭, 이펙트
- `src/ui/` HUD, 창들, 대화, 지도, 캐릭터 만들기, 엔딩, `cutscene.js` 이야기 영상(1.7.7) (최종 보스 체험 모드는 1.6에서 제거)
- `electron/` 창 생성과 세이브 파일 입출력
- `src/dev.js` 테스트 모드 (Lv.100 4차 8직업 선택·직업만 바꾸기, 장 선택 시작, 어디든 순간이동, 엔딩 미리보기). 다른 파일을 고치지 않고 덧붙이는 방식이라 **최종 EXE 빌드 전에 이 파일과 index.html의 script 한 줄만 지우면 된다**

## 원칙
- 다른 게임의 고유 명칭·캐릭터·그래픽·시스템 이름은 쓰지 않는다 (`docs/IP_REVIEW.md`). 화폐는 "골드". 공개 문서·스토어 문구에 다른 게임 이름을 쓰지 않는다.
- 1.6.1 용어: 별빛 각인서(각인 칸) · 공명석(별자리 각인, 공명 게이지) · 장비 단련(단련 효과) · 능력/기술 포인트 · 표류자 · 각성 Ⅰ~Ⅳ · 등급 평범/반짝임/빛남/찬란/별의 축복. 내부 id(scroll_100, cube, pot_red, beginner, STR 등)는 세이브 호환을 위해 옛 이름 그대로
- 이미지·음원 파일 없이 전부 코드로 그린다/만든다 (저작권 문제 없음).
- 밸런스 수치는 `src/data/formulas.js`와 각 데이터 파일에 모은다.
- 세이브 형식이 바뀌면 `G.Save.VERSION`을 올리고 `G.Save.upgrade()`에 옛 세이브 변환 코드를 넣는다 (옛 세이브는 자동 백업됨). 앱 이름·저장 폴더 이름은 바꾸지 않는다.

## 다음 작업
- **전체 이야기 기준 문서: `docs/STORY.md`** (배경 → 프롤로그~종장 → 녹스 → 엔딩 3종). 대사·퀘스트를 고칠 때 이 문서와 맞춘다
- 게임 제목은 1.7.4부터 **"한요미의 대모험"** (보이는 제목만 변경. 내부 이름 `hannyomi-adventure`·`Hannyomi`·저장 폴더·`hny_*` 키는 세이브 호환을 위해 그대로)
- 빌드 1.4: `docs/BUILD_1.4_PLAN.md` — 구현 완료, 곡 피드백까지 끝 (2026-11-03)
- 1.4 이후 완성까지의 순서: `docs/ROADMAP.md` (곡 피드백 끝 → 직접 플레이·버그 수정 → 1.5 → 1.6 → 1.6.1 → 1.7 → 1.7.1 → 1.7.2 → 1.7.3 → 1.7.4 → 1.7.5 → 1.7.6 → 1.7.7 → 1.7.8 → 1.7.9 → 1.7.10 → 1.7.11 → 1.7.12 → 1.8 완료 → 1.9 완료 → 2.0 완료 → **다음: EXE 빌드**)
- 빌드 1.5: `docs/BUILD_1.5_PLAN.md` — 구현 완료 (2026-11-04). 세이브 형식 v3 (`G.Save.VERSION`, 변환은 `G.Save.upgrade`)
- 빌드 1.6: `docs/BUILD_1.6_PLAN.md` — 구현 완료 (2026-11-04)
- 빌드 1.6.1: `docs/BUILD_1.6.1_PLAN.md` — 구현 완료 (2026-11-04). 세이브 형식 v4
- 출시 대비 검토: `docs/IP_REVIEW.md` — 높음·중간 항목은 1.6.1에서 반영 완료, 낮음은 유지
- 빌드 1.7: `docs/BUILD_1.7_PLAN.md` — 구현 완료 (2026-11-04). 하단 상태창 64px
- 빌드 1.7.1: `docs/BUILD_1.7.1_PLAN.md` — 구현 완료 (2026-11-04). 프로스트벨 몬스터 4종 교체 (id 그대로)
- 빌드 1.7.2: `docs/BUILD_1.7.2_PLAN.md` — 구현 완료 (2026-11-04). 천공 성소 2단계 보스(아우렐리온 → 엘드리크, 체크포인트 `G.Game.ckpt`), 녹스전 아우렐리온 연출
- 빌드 1.7.3: `docs/BUILD_1.7.3_PLAN.md` — 구현 완료 (2026-11-04). 하늘 여우·구름 양날이·천공의 부엉이(깃털 화살), 테스트 모드 4차 8직업 선택·직업만 바꾸기
- 빌드 1.7.4: `docs/BUILD_1.7.4_PLAN.md` — 구현 완료 (2026-11-04). 녹스게이트 6종(균열 거미·그림자 수호병·장막의 사제·그림자 집행관·공허 성기사·녹스의 전령, 어둠 구슬), 날개 구름양, 제목 "한요미의 대모험"
- 빌드 1.7.5: `docs/BUILD_1.7.5_PLAN.md` — 구현 완료 (2026-11-04). 몬스터 스킬 시스템 `src/systems/monskill.js` (틀 8개 + 1~3장 25종). 1.7.6은 같은 계획서의 후반 29종
- 빌드 1.7.6: 같은 계획서 — 구현 완료 (2026-11-04). 몬스터 스킬 총 54종, 그림자 수호병 → 공허의 감시안(나는 몬스터)
- 빌드 1.7.7: `docs/BUILD_1.7.7_PLAN.md` — 구현 완료 (2026-11-04). 녹스 `src/render/nox.js`, 이야기 영상 `src/ui/cutscene.js` (히든 엔딩 장면은 준비만, 2.0에서 연결)
- 빌드 1.7.8: `docs/BUILD_1.7.8_PLAN.md` — 구현 완료 (2026-11-04). 라그하르트 5종 새 그림 `src/render/monsters4.js` (폐광 바위웜·용광로 도롱뇽·용암 웅덩이·광석 거인·그라운더 MK-7)
- 빌드 1.7.9: `docs/BUILD_1.7.9_PLAN.md` — 구현 완료 (2026-11-04). 스킬 아이콘 `src/render/icons2.js`(`G.SKILL_GLYPH[스킬 id]`, 새 스킬은 여기에 문양 추가), 버프 칸 `G.HUD.buffBar`
- 빌드 1.7.10: `docs/BUILD_1.7.10_PLAN.md` — 구현 완료 (2026-11-04). 전사·궁수 스킬 동작·연출 `src/systems/skillx.js` (`G.SKILL_X[스킬 id]`, 피해 수치는 jobs2.js 그대로)
- 빌드 1.7.11: `docs/BUILD_1.7.11_PLAN.md` — 구현 완료 (2026-11-04). 마법사·도적도 `skillx.js` (화상·빙결·튕기기·표식·독 쌓기·돌아오는 표창)
- 빌드 1.7.12: `docs/BUILD_1.7.12_PLAN.md` — 구현 완료 (2026-11-04). 연희(사용자 조카 이름, 특별히 신경 쓸 것) NPC · 퀘스트 `c3_s5` · 고르기 창 `G.Win.heroset` · 연희의 별 부적
- 빌드 1.8: `docs/BUILD_1.8_PLAN.md` (아래쪽 "실제 구현") — 구현 완료 (2026-11-05). 효과음 `src/core/sound.js` (`G.Sound`), 새 스킬은 `SKILL_SOUND`나 `BY_PROJ`/`BY_FX`로 소리 지정
- 빌드 1.9: `docs/BUILD_1.9_PLAN.md` — 구현 완료 (2026-11-05). 복장·장비 모양 `src/render/outfit.js` (`G.Outfit.draw`가 사람형 캐릭터를 그림, 장비 id → 디자인 묶음 `styleOf`, 새 장비 묶음은 `S`·`WSTYLE`에 추가). 확인 페이지 `hannyomi-wardrobe.html`
- 빌드 2.0: `docs/BUILD_2.0_PLAN.md` (아래쪽 "구현 결과") — 구현 완료 (2026-11-05). 히든 엔딩 `src/systems/hidden.js`, 녹스전 동료 `src/systems/assist.js`, 타이틀 배경 `src/ui/titlebg.js`, 글꼴 `css/fonts/`. 게임 이름: 창 "RPG 대모험_HC" · EXE "RPG Adventure" · 크레딧 "과금없이 즐기는 연희의 RPG 대모험"
- **지금 진행 중: 2.1 보스 밸런스** — `docs/BUILD_2.1_PLAN.md` 맨 아래 "진행 상황"에 이어서 할 일 정리됨
- 빌드 계획서 (사용자가 "1.x 진행해 줘"라고 하면 진행): `docs/BUILD_1.8_PLAN.md`, `docs/BUILD_1.9_PLAN.md`, `docs/BUILD_2.0_PLAN.md`
