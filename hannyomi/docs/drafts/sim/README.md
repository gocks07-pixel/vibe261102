# 보스 자동 전투 시뮬레이터 (2.1 밸런스용)
- `fullsim3.js`: 실제 게임(index.html)을 띄워 보스와 자동으로 싸우게 하고 결과를 JSON 한 줄씩 출력 (playwright 필요)
- `mk3.py`: 보스 8종 × 직업 4 × 장비 2 × 실력 2 조합 만들기. 예) `python3 mk3.py fin '{"녹스":8.5}' 2` → runs_fin_0~3.json
- `summ.py`: 결과 요약 표. 예) `python3 summ.py fin_*.txt`
- 실행: `node fullsim3.js "$(cat runs_fin_0.json)" > fin_0.txt`
- 주의: 파일 경로는 /home/user/hannyomi 기준. R.mech(보정) · hpMul(체력 배율)은 시뮬레이터 안에서만 적용 (게임 코드 변경 없음)
