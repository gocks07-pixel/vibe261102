// 모바일 2차-2: 배포판(웹) 만들기
//  사용: cd hannyomi/tools && npm install (처음 한 번) && node build_web.js <출력 폴더> [배포 번호]
//  - 게임 실행에 필요한 파일만 복사 (테스트 모드 src/dev.js · 개발 문서 · EXE 파일은 빼고)
//  - 코드 압축(terser): 설명 · 줄바꿈 제거, 함수 안 이름만 짧게. G. 아래 이름 · 세이브 이름 · 내부 id 는 그대로
//  - 저작권 한 줄 · LICENSE · README · 서비스 워커(오프라인) · 홈 화면 앱 설정
//  - 개인 정보 · 비밀 값 검사: 있으면 멈춘다
'use strict';
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.resolve(__dirname, '..');   // hannyomi 폴더
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '..', 'web_dist'));
const p2 = n => String(n).padStart(2, '0');
const now = new Date();
const STAMP = process.argv[3] || `${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}-${p2(now.getHours())}${p2(now.getMinutes())}${p2(now.getSeconds())}`;
const COPY = '과금없이 즐기는 연희의 RPG 대모험 © 2026 HC. All rights reserved. 무단 복제·배포 금지';

if (OUT === ROOT || OUT.startsWith(ROOT + path.sep)) { console.error('출력 폴더는 hannyomi 밖이어야 합니다:', OUT); process.exit(1); }

// 복사할 것 (hannyomi 기준)
const INCLUDE_DIRS = ['css', 'src', 'icons'];
const INCLUDE_FILES = ['index.html', 'manifest.webmanifest'];
const EXCLUDE = new Set(['src/dev.js', 'icons/icon-1024.png']);   // 1024 아이콘은 APK 용

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

(async () => {
  // 출력 폴더 비우기 (이 스크립트가 만든 폴더만: 표시 파일로 확인)
  if (fs.existsSync(OUT)) {
    const left = fs.readdirSync(OUT).filter(n => n !== '.git');
    if (left.length && !fs.existsSync(path.join(OUT, '.web_build'))) { console.error('출력 폴더가 비어 있지 않고 배포판 폴더도 아닙니다:', OUT); process.exit(1); }
    for (const n of left) fs.rmSync(path.join(OUT, n), { recursive: true, force: true });
  }
  fs.mkdirSync(OUT, { recursive: true });

  const files = [...INCLUDE_FILES, ...INCLUDE_DIRS.flatMap(walk)].filter(f => !EXCLUDE.has(f));
  let before = 0, after = 0;
  for (const rel of files) {
    const src = path.join(ROOT, rel), dst = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (rel.endsWith('.js')) {
      const code = fs.readFileSync(src, 'utf8');
      const r = await minify(code, {
        ecma: 2020, module: false, toplevel: false,
        compress: { passes: 2 },
        mangle: { toplevel: false },          // 전역(G 등) 이름은 그대로, 함수 안 이름만 짧게
        format: { comments: false, preamble: `/*! ${COPY} */`, ascii_only: false },
      });
      if (r.code == null) throw new Error('압축 실패: ' + rel);
      fs.writeFileSync(dst, r.code);
      before += code.length; after += r.code.length;
    } else if (rel.endsWith('.css')) {
      fs.writeFileSync(dst, `/*! ${COPY} */\n` + fs.readFileSync(src, 'utf8'));
    } else fs.copyFileSync(src, dst);
  }

  // index.html: 저작권 한 줄, 테스트 모드 줄 빼기, 배포판 표시 · 홈 화면 앱 설정 넣기
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const devLine = /\s*<!-- 테스트 모드:[^\n]*-->\s*\n\s*<script>if \(!window\.electronAPI[^\n]*dev\.js[^\n]*<\/script>/;
  if (!devLine.test(html)) throw new Error('index.html 에서 테스트 모드 줄을 찾지 못했습니다');
  html = html.replace(devLine, '');
  html = html.replace('<!doctype html>', `<!doctype html>\n<!-- ${COPY} -->`);
  html = html.replace('<link rel="stylesheet" href="css/fonts/jua.css">', '<link rel="manifest" href="manifest.webmanifest">\n  <link rel="stylesheet" href="css/fonts/jua.css">');
  html = html.replace('<script src="src/version.js"></script>', '<script src="src/version.js"></script>\n  <script src="src/webbuild.js"></script>');
  if (!html.includes('src/webbuild.js') || !html.includes('manifest.webmanifest')) throw new Error('index.html 바꾸기 실패');
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  fs.writeFileSync(path.join(OUT, 'src/webbuild.js'), `/*! ${COPY} */\nG.WEB_BUILD='${STAMP}';\n`);

  // 배포 저장소 파일
  fs.copyFileSync(path.join(__dirname, 'LICENSE.txt'), path.join(OUT, 'LICENSE'));
  fs.copyFileSync(path.join(__dirname, 'web_README.md'), path.join(OUT, 'README.md'));
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.writeFileSync(path.join(OUT, '.web_build'), STAMP + '\n');

  // 서비스 워커: 오프라인용 파일 목록 (README · LICENSE · 표시 파일은 빼고)
  const cacheList = ['./', ...walkOut('').filter(f => !/^(README\.md|LICENSE|\.nojekyll|\.web_build|sw\.js)$/.test(f)).map(f => './' + f)];
  const sw = fs.readFileSync(path.join(__dirname, 'sw.template.js'), 'utf8').replace('__STAMP__', STAMP).replace('__FILES__', JSON.stringify(cacheList));
  fs.writeFileSync(path.join(OUT, 'sw.js'), sw);

  // 검사: 테스트 모드 · 개인 정보 · 비밀 값
  const problems = [];
  if (fs.existsSync(path.join(OUT, 'src/dev.js'))) problems.push('src/dev.js 가 들어 있음');
  const BAD = [
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.(?:com|net|org|kr|io|co|ai|dev)\b/, '이메일 주소'],
    [/\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{10,}/, 'GitHub 토큰'],
    [/\bsk-[A-Za-z0-9-]{16,}/, 'API 키'], [/\bAKIA[0-9A-Z]{16}\b/, 'AWS 키'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '비밀 키'],
    [/infiniq|hclee/i, '개인 정보'],
  ];
  for (const rel of walkOut('')) {
    if (!/\.(js|html|css|json|webmanifest|md|txt)$|^LICENSE$/.test(rel)) continue;
    const t = fs.readFileSync(path.join(OUT, rel), 'utf8');
    for (const [re, what] of BAD) { const m = t.match(re); if (m) problems.push(`${rel}: ${what} (${m[0].slice(0, 12)}…)`); }
  }
  const total = walkOut('').reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`배포 번호 ${STAMP} · 파일 ${walkOut('').length}개 · 전체 ${(total / 1024 / 1024).toFixed(2)}MB`);
  console.log(`코드 압축 ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (${Math.round(after / before * 100)}%)`);
  if (problems.length) { console.error('검사 실패 — 배포하지 마세요:\n  ' + problems.join('\n  ')); process.exit(2); }
  console.log('검사 통과: 테스트 모드 없음 · 개인 정보 · 비밀 값 없음 →', OUT);

  function walkOut(dir) {
    const out = [];
    for (const e of fs.readdirSync(path.join(OUT, dir), { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const rel = dir ? dir + '/' + e.name : e.name;
      if (e.isDirectory()) out.push(...walkOut(rel)); else out.push(rel);
    }
    return out;
  }
})().catch(e => { console.error(e); process.exit(1); });
