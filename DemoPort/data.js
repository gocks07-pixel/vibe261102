// 사이트 콘텐츠 데이터 — 내용 수정은 이 파일에서만 하면 됩니다.
// TODO 표시된 항목은 PRD "확정 필요 사항"에 해당합니다.
window.PROFILE = {
  name: "HC Lee", // TODO: 표시할 이름 확정
  title: "Automotive Electronics QA Engineer",
  email: "hclee@infiniq.co.kr",
  tagline: "전장사업검증 전문 — SBCM, 램프 제어기",
  about: [
    "차량 전장 제어기의 요구사항 분석부터 테스트 설계, 수행, 결함 리포트, 회귀 검증까지 검증 전 과정을 수행합니다.",
    "SBCM(Smart Body Control Module)과 램프 제어기를 중심으로, 기능 동작뿐 아니라 통신·진단·고장 대응까지 차량에 탑재되었을 때의 품질을 확인하는 데 집중합니다.",
  ],
  keywords: ["전장 검증", "SBCM", "램프 제어기", "CAN / LIN", "UDS 진단", "HILS", "요구사항 기반 테스트", "결함 관리"],

  expertise: [
    {
      icon: "body",
      title: "SBCM",
      subtitle: "Smart Body Control Module",
      items: [
        "바디 전장 기능 검증 (도어, 윈도우, 와이퍼, 실내등 등)",
        "CAN / LIN 통신 검증",
        "진단(UDS) 서비스 검증",
      ],
    },
    {
      icon: "lamp",
      title: "램프 제어기",
      subtitle: "Lamp Control Unit",
      items: [
        "헤드램프 / 리어램프 / 방향지시등 제어 로직 검증",
        "고장 감지(Fault Detection) 검증",
        "Fail-safe 동작 검증",
      ],
    },
    {
      icon: "check",
      title: "공통 검증 영역",
      subtitle: "Verification Practice",
      items: [
        "요구사항 기반 테스트 설계",
        "기능 / 회귀 / 경계값 테스트",
        "HILS 기반 검증, 결함 관리 및 리포팅",
      ],
    },
  ],

  process: [
    { step: "요구사항 분석", desc: "사양서와 요구사항을 검토하고 검증 가능한 항목으로 정리" },
    { step: "테스트 계획", desc: "검증 범위, 환경, 일정, 기준 수립" },
    { step: "테스트 케이스 설계", desc: "요구사항 추적이 가능한 케이스 작성, 경계값·예외 상황 포함" },
    { step: "테스트 수행", desc: "HILS·실차 환경에서 수행하고 결과 기록" },
    { step: "결함 리포트", desc: "재현 절차와 근거 로그를 포함한 결함 등록 및 추적" },
    { step: "회귀 검증", desc: "수정 사항 확인과 영향 범위 재검증" },
  ],

  // TODO: 공개 가능한 실제 프로젝트로 교체 (고객사명·차종 등 기밀은 일반화)
  projects: [
    {
      name: "바디 제어기(SBCM) 기능 검증",
      period: "20XX.XX – 20XX.XX",
      target: "SBCM",
      role: "검증 엔지니어",
      tasks: ["바디 기능 테스트 케이스 설계 및 수행", "CAN/LIN 통신 및 UDS 진단 검증"],
      result: "양산 전 주요 결함 조기 발견 및 회귀 검증 완료",
    },
    {
      name: "램프 제어기 검증",
      period: "20XX.XX – 20XX.XX",
      target: "Lamp Control Unit",
      role: "검증 엔지니어",
      tasks: ["램프 제어 로직 기능 검증", "고장 감지 및 Fail-safe 시나리오 검증"],
      result: "고장 대응 시나리오 검증 범위 확보",
    },
  ],

  // TODO: 실제 사용 툴로 확정
  tools: [
    { group: "통신 / 진단", items: ["CANoe", "CANalyzer"] },
    { group: "검증 환경", items: ["HILS", "Trace32"] },
    { group: "관리 / 자동화", items: ["JIRA", "Excel / VBA", "Python"] },
  ],
};
