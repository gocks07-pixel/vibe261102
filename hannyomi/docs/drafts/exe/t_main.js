// electron/main.js 를 가짜 electron 모듈로 실행해 저장 위치 · 옛 세이브 복사 · 오류 기록 · 버그 신고 폴더 확인
const Module = require('module'), fs = require('fs'), path = require('path'), os = require('os');
const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) process.exitCode = 1; };

async function run(dev) {
  const tmp = fs.mkdtempSync(path.join(__dirname, 'mt_'));
  const proj = path.join(tmp, 'app'), docs = path.join(tmp, 'Documents');
  fs.mkdirSync(path.join(proj, 'electron'), { recursive: true }); fs.mkdirSync(path.join(proj, 'src'), { recursive: true });
  fs.copyFileSync('/home/user/hannyomi/electron/main.js', path.join(proj, 'electron', 'main.js'));
  if (dev) fs.writeFileSync(path.join(proj, 'src', 'dev.js'), '//');
  // 옛 폴더 세이브
  fs.mkdirSync(path.join(docs, 'Hannyomi'), { recursive: true });
  fs.writeFileSync(path.join(docs, 'Hannyomi', 'save_A.json'), '{"old":1}');
  const H = {}, on = {}; let opened = null, title = null, ready;
  const fake = {
    app: { getPath: () => docs, getVersion: () => '2.1.0', whenReady: () => ({ then: f => { ready = f; } }), on() {}, quit() {} },
    BrowserWindow: class { constructor(o) { title = o.title; this.webContents = { on() {}, capturePage: async () => ({ toPNG: () => Buffer.from('PNG') }) }; } setMenuBarVisibility() {} on() {} loadFile() {} },
    ipcMain: { handle: (k, f) => { H[k] = f; }, on: (k, f) => { on[k] = f; } },
    shell: { openPath: p => { opened = p; } },
  };
  const orig = Module._load;
  Module._load = function (req, ...a) { return req === 'electron' ? fake : orig.call(this, req, ...a); };
  delete require.cache[path.join(proj, 'electron', 'main.js')];
  require(path.join(proj, 'electron', 'main.js'));
  Module._load = orig;
  ready();
  const tag = dev ? '[테스트용]' : '[플레이어용]';
  const sd = path.join(docs, 'RPG Adventure', dev ? 'Save Data (DEV)' : 'Save Data');
  ok(title === (dev ? 'RPG 대모험_HC (DEV)' : 'RPG 대모험_HC'), `${tag} 창 제목 ${title}`);
  const ev = {}; on['app:info'](ev); ok(ev.returnValue.dev === dev && ev.returnValue.version === '2.1.0', `${tag} app:info`);
  ok(fs.existsSync(sd), `${tag} 세이브 폴더 ${path.relative(docs, sd)}`);
  const a = await H['save:read']({}, 'A');
  if (dev) ok(a === null, `${tag} 옛 Hannyomi 세이브를 복사하지 않음`);
  else ok(a === '{"old":1}' && fs.existsSync(path.join(docs, 'Hannyomi', 'save_A.json')), `${tag} 옛 세이브 복사 · 옛 폴더 유지`);
  await H['save:write']({}, 'B', '{"b":2}');
  ok(fs.readFileSync(path.join(sd, 'save_B.json'), 'utf8') === '{"b":2}', `${tag} 저장`);
  // 오류 기록: 이전 줄 + 이번 줄, 200줄 제한
  const ef = path.join(docs, 'RPG Adventure', '오류기록.txt');
  fs.writeFileSync(ef, Array.from({ length: 250 }, (_, i) => 'old ' + i).join('\r\n'));
  on['log:errors']({}, ['new 1']); on['log:errors']({}, ['new 1 (×3)', 'new 2']);
  const lines = fs.readFileSync(ef, 'utf8').split(/\r\n/).filter(Boolean);
  ok(lines.length === 200 && lines[199] === 'new 2' && lines[198] === 'new 1 (×3)' && !lines.includes('new 1'), `${tag} 오류기록 200줄 · 같은 실행 갱신`);
  // 버그 신고
  await H['bug:capture']();
  const r = await H['bug:write']({}, { note: '멈춤', info: '버전: v2.1.0', errors: 'E1', slot: 'B', save: '{"b":2}' });
  const files = opened ? fs.readdirSync(opened).sort() : [];
  ok(files.join(',') === ['save_B.json', '게임정보.txt', '신고내용.txt', '오류기록.txt', '화면.png'].sort().join(','), `${tag} 버그신고 파일 ${files.join(', ')}`);
  ok(/^문서\/RPG Adventure\/버그신고\/\d{4}-\d\d-\d\d_\d\d-\d\d-\d\d$/.test(r.where) && opened.includes(path.join('RPG Adventure', '버그신고')), `${tag} 폴더 ${r.where}`);
  ok(!fs.readFileSync(path.join(opened, '게임정보.txt'), 'utf8').includes(os.userInfo().username + path.sep), `${tag} 경로/사용자 이름 없음`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
(async () => { await run(false); await run(true); })();
