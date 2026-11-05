'use strict';
// ============================================================
// EXE 빌드: 오류 자동 기록
//  - 게임에서 오류가 나면 기억해 두고, EXE 는 문서/RPG Adventure/오류기록.txt 에 쌓는다
//  - 같은 오류는 한 줄로 묶어 횟수만 늘림 (파일은 최근 200줄까지 — 메인 프로세스가 정리)
//  - 버그 신고(F9) 때 최근 오류를 함께 넣는다
//  - 개인정보(PC 사용자 이름 · 폴더 경로)는 넣지 않는다: 파일 위치는 파일 이름만 남김
// ============================================================
G.ErrLog = {
  list: [],          // 이번 실행의 오류 [{ key, time, msg, where, ctx, n }]
  MAX: 50,
  dirty: false,

  init() {
    window.addEventListener('error', e => {
      if (e.error) this.add(e.error);
      else if (e.target && e.target !== window && (e.target.src || e.target.href)) this.add({ message: '파일을 불러오지 못함: ' + this.short(e.target.src || e.target.href) });
      else if (e.message) this.add({ message: e.message, where: `${this.short(e.filename || '')}:${e.lineno || 0}:${e.colno || 0}` });
    }, true);
    window.addEventListener('unhandledrejection', e => this.add(e.reason || { message: '알 수 없는 비동기 오류' }));
    setInterval(() => this.flush(), 2000);
  },

  // 경로에서 개인정보가 들어갈 수 있는 앞부분을 지우고 src/... 부터만
  short(s) {
    s = String(s || '');
    const i = s.search(/(src|electron|css)\//);
    return i >= 0 ? s.slice(i) : s.split(/[\\/]/).pop();
  },
  whereOf(err) {
    if (err && err.where) return err.where;
    const st = String((err && err.stack) || '');
    const m = st.match(/\(?((?:file|https?):\/\/[^\s)]+|[A-Za-z]:\\[^\s)]+):(\d+):(\d+)\)?/);
    return m ? `${this.short(m[1])}:${m[2]}:${m[3]}` : '';
  },
  ctx() {
    const p = G.Game && G.Game.player, w = G.Game && G.Game.world;
    if (!p) return '타이틀 화면';
    const job = G.JOBS[p.d.job];
    return `맵 ${w ? w.mapId : '?'} · Lv.${p.d.level} ${job ? job.name : p.d.job}`;
  },
  stamp(t) {
    const d = new Date(t), z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
  },

  add(err) {
    try {
      const msg = String((err && (err.message || err)) || '알 수 없는 오류').slice(0, 300);
      const where = this.whereOf(err), key = msg + '@' + where;
      const old = this.list.find(x => x.key === key);
      if (old) { old.n++; old.last = Date.now(); }
      else {
        this.list.push({ key, time: Date.now(), msg, where, ctx: this.ctx(), n: 1 });
        if (this.list.length > this.MAX) this.list.shift();
        console.error('[오류 기록]', msg, where);
      }
      this.dirty = true;
    } catch (e) { /* 기록 중 오류는 무시 */ }
  },

  line(x) {
    return `[${this.stamp(x.time)}] v${G.VERSION}${G.IS_DEV ? ' DEV' : ''}${G.IS_MOBILE ? ' 모바일' : ''} | ${x.ctx} | ${x.msg}${x.where ? ' @ ' + x.where : ''}${x.n > 1 ? ` (×${x.n})` : ''}`;
  },
  text() { return this.list.length ? this.list.map(x => this.line(x)).join('\n') : '(이번 실행에서 기록된 오류 없음)'; },

  // EXE: 이번 실행의 오류 줄을 메인 프로세스로 (파일 = 지난 실행 기록 + 이번 실행 기록)
  flush() {
    if (!this.dirty) return;
    this.dirty = false;
    const api = window.electronAPI;
    try { if (api && api.writeErrors) api.writeErrors(this.list.map(x => this.line(x))); } catch (e) { /* 무시 */ }
  },
};
G.ErrLog.init();
