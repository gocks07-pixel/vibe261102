/*! 과금없이 즐기는 연희의 RPG 대모험 © 2026 HC. All rights reserved. 무단 복제·배포 금지 */
// 인터넷 없이 실행 (서비스 워커). tools/build_web.js 가 배포 번호와 파일 목록을 채운다
//  세이브(localStorage)는 건드리지 않는다. 게임 파일만 휴대폰에 저장한다
const CACHE = 'rpg-adventure-__STAMP__';
const FILES = __FILES__;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('rpg-adventure-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 페이지가 "지금 바꾸기"를 누르면 새 버전으로
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res && res.ok) c.put(req, res.clone());
    return res;
  }).catch(() => c.match('./index.html')))));
});
