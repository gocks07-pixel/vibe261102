// 날짜는 모두 사용자 로컬 시간 기준 "YYYY-MM-DD" 키로 다룬다.

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n) => String(n).padStart(2, '0');

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(now = new Date()) {
  return toDateKey(now);
}

export function isDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "2026년 11월 2일 (월)"
export function formatKoreanDate(key) {
  const d = parseKey(key);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

// "11월 1일 (일)"
export function formatShortDate(key) {
  const d = parseKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

// "11/1"
export function formatSlashDate(key) {
  const d = parseKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function isNewDay(lastDate, today) {
  return isDateKey(lastDate) && lastDate !== today;
}

// b - a (일). 서머타임 오차는 반올림으로 흡수한다.
export function daysBetween(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / DAY_MS);
}
