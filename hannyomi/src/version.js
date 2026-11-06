'use strict';
// EXE 빌드: 게임 버전 (package.json 의 version 과 같게 유지 — 테스트가 확인한다)
//  버그를 고쳐 다시 배포할 때마다 올린다 (2.1.0 → 2.1.1 → 2.1.2 …)
G.VERSION = '2.1.4';
// 테스트용(개발자) 판인지: EXE 는 메인 프로세스가 알려 주고, 브라우저는 테스트 모드(src/dev.js)가 있으면 테스트용
Object.defineProperty(G, 'IS_DEV', {
  get() {
    const api = window.electronAPI;
    if (api && api.info) return !!api.info.dev;
    return !!G.Dev;
  },
});
if (window.electronAPI && window.electronAPI.info && window.electronAPI.info.version) G.VERSION = window.electronAPI.info.version;
