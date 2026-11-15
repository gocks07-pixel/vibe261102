# 공격 칸 스킬 (휴대폰 터치에서만, 2026-11-15) — atk_slot.png
- 위: 스킬 창 각 스킬 옆 [공격] (빨강 = 넣은 스킬 · 흐림 = 못 넣는 스킬: 버프 · 패시브 · 재사용 2초 넘음 · 궁극기)
- 아래: 공격 버튼 가운데 스킬 아이콘 + 남은 재사용 시간(초) · 누르는 동안 준비되면 스킬, 아니면 기본 공격
- 코드: `src/ui/mobile.js` (atkOk · atkId · atkSet · atkInject · atkCast) · `css/mobile.css`. 저장 `hny_touch` 의 `atkSk[세이브 슬롯]` (세이브 형식 그대로). 자동 사냥 · PC · EXE 는 그대로
