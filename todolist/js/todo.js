// 할일 목록을 받아 새 목록을 돌려주는 순수 함수 모음.

import { isDateKey } from './date.js';

export const MAX_TEXT = 200;

export function normalizeText(text) {
  return String(text ?? '').trim().slice(0, MAX_TEXT);
}

export function nextOrder(todos) {
  return todos.reduce((max, t) => Math.max(max, t.order), -1) + 1;
}

function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// 저장소에서 읽은 값의 빠진 필드를 채운다. 형식이 맞지 않으면 null.
export function normalizeTodo(raw, fallbackDate) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || typeof raw.text !== 'string') return null;
  const text = normalizeText(raw.text);
  if (!text) return null;
  return {
    id: raw.id,
    text,
    done: raw.done === true,
    important: raw.important === true,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
    order: Number.isFinite(raw.order) ? raw.order : 0,
    sourceDate: isDateKey(raw.sourceDate) ? raw.sourceDate : fallbackDate,
    carriedFrom: isDateKey(raw.carriedFrom) ? raw.carriedFrom : null,
  };
}

export function addTodo(todos, text, today) {
  const clean = normalizeText(text);
  if (!clean) return todos;
  return [
    ...todos,
    {
      id: newId(),
      text: clean,
      done: false,
      important: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: nextOrder(todos),
      sourceDate: today,
      carriedFrom: null,
    },
  ];
}

export function toggleTodo(todos, id) {
  return todos.map((t) =>
    t.id === id
      ? { ...t, done: !t.done, completedAt: t.done ? null : new Date().toISOString() }
      : t,
  );
}

export function editTodo(todos, id, text) {
  const clean = normalizeText(text);
  if (!clean) return todos; // 빈 값이면 수정 취소
  return todos.map((t) => (t.id === id ? { ...t, text: clean } : t));
}

export function removeTodo(todos, id) {
  return todos.filter((t) => t.id !== id);
}

export function restoreTodo(todos, todo) {
  if (todos.some((t) => t.id === todo.id)) return todos;
  return [...todos, todo];
}

export function toggleImportant(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, important: !t.important } : t));
}

export function clearDone(todos) {
  return todos.filter((t) => !t.done);
}

// 중요 항목 먼저, 그다음 order 순.
export function sortTodos(todos) {
  return [...todos].sort((a, b) => Number(b.important) - Number(a.important) || a.order - b.order);
}

export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((t) => !t.done);
  if (filter === 'done') return todos.filter((t) => t.done);
  return todos;
}

// id 항목을 targetId 앞(또는 뒤)으로 옮기고 order를 다시 매긴다.
export function moveTodo(todos, id, targetId, after) {
  if (id === targetId) return todos;
  const sorted = sortTodos(todos);
  const moving = sorted.find((t) => t.id === id);
  const rest = sorted.filter((t) => t.id !== id);
  let index = rest.findIndex((t) => t.id === targetId);
  if (!moving || index < 0) return todos;
  if (after) index += 1;
  rest.splice(index, 0, moving);
  return rest.map((t, i) => ({ ...t, order: i }));
}
