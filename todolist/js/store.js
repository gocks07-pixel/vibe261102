// 앱 상태 보관 + localStorage 입출력.

import { normalizeTodo } from './todo.js';
import { rollover } from './rollover.js';
import { isDateKey } from './date.js';

const PREFIX = 'todayTodo.v1.';
const FILTERS = ['all', 'active', 'done'];

let state = null;
let persistent = true;
const listeners = new Set();

function canUseStorage() {
  try {
    const key = `${PREFIX}__test`;
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function readRaw(name) {
  try {
    return localStorage.getItem(PREFIX + name);
  } catch {
    return null;
  }
}

// 파싱/검증에 실패하면 원본을 .backup에 남기고 fallback을 쓴다.
function readJSON(name, fallback, sanitize) {
  if (!persistent) return fallback;
  const raw = readRaw(name);
  if (raw === null) return fallback;
  try {
    const value = sanitize(JSON.parse(raw));
    if (value !== undefined) return value;
  } catch {
    // 아래에서 백업
  }
  try {
    localStorage.setItem(`${PREFIX}${name}.backup`, raw);
  } catch {
    // 백업도 못 하면 포기
  }
  return fallback;
}

function readString(name, isValid, fallback) {
  if (!persistent) return fallback;
  const raw = readRaw(name);
  return isValid(raw) ? raw : fallback;
}

function sanitizeTodos(value, fallbackDate) {
  if (!Array.isArray(value)) return undefined;
  return value.map((t) => normalizeTodo(t, fallbackDate)).filter(Boolean);
}

function sanitizeHistory(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const history = {};
  for (const [day, items] of Object.entries(value)) {
    if (!isDateKey(day)) continue;
    const todos = sanitizeTodos(items, day);
    if (todos?.length) history[day] = todos;
  }
  return history;
}

function save() {
  if (!persistent) return;
  try {
    localStorage.setItem(`${PREFIX}todos`, JSON.stringify(state.todos));
    localStorage.setItem(`${PREFIX}pending`, JSON.stringify(state.pending));
    localStorage.setItem(`${PREFIX}history`, JSON.stringify(state.history));
    localStorage.setItem(`${PREFIX}lastDate`, state.lastDate);
    localStorage.setItem(`${PREFIX}filter`, state.filter);
  } catch {
    // 용량 초과 등: 메모리 상태로 계속 동작
  }
}

function notify() {
  for (const fn of listeners) fn(state);
}

// 저장소에서 상태를 읽고 날짜 변경을 처리한다.
// 다른 탭의 변경을 반영할 때는 persist=false로 불러 서로 덮어쓰지 않게 한다.
export function load(today, persist = true) {
  persistent = canUseStorage();
  const lastDate = readString('lastDate', isDateKey, null);
  const dateForOld = lastDate ?? today;
  const loaded = {
    todos: readJSON('todos', [], (v) => sanitizeTodos(v, dateForOld)),
    pending: readJSON('pending', [], (v) => sanitizeTodos(v, dateForOld)),
    history: readJSON('history', {}, sanitizeHistory),
    lastDate,
    filter: readString('filter', (v) => FILTERS.includes(v), 'all'),
  };
  state = rollover(loaded, today);
  if (persist) save();
  notify();
  return state;
}

export function getState() {
  return state;
}

export function isPersistent() {
  return persistent;
}

export function dispatch(updater) {
  const next = updater(state);
  if (next === state) return;
  state = next;
  save();
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isOwnKey(key) {
  return key === null || key.startsWith(PREFIX);
}
