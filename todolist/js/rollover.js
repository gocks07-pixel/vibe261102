// 날짜가 바뀔 때의 상태 정리: 미완료 → 보류(pending), 완료 → 기록(history).

import { addTodo, nextOrder } from './todo.js';
import { daysBetween, isNewDay } from './date.js';

export const HISTORY_DAYS = 7;

export function rollover(state, today) {
  let { todos, pending, history } = state;

  if (isNewDay(state.lastDate, today)) {
    const day = state.lastDate;
    const done = todos.filter((t) => t.done);
    const undone = todos.filter((t) => !t.done).map((t) => ({ ...t, carriedFrom: day }));
    if (done.length) history = { ...history, [day]: [...(history[day] ?? []), ...done] };
    pending = [...pending, ...undone];
    todos = [];
  }

  return { ...state, todos, pending, history: pruneHistory(history, today), lastDate: today };
}

// 오늘 기준 HISTORY_DAYS일이 지난 기록은 버린다.
export function pruneHistory(history, today, days = HISTORY_DAYS) {
  const kept = {};
  for (const [day, items] of Object.entries(history)) {
    if (items.length && daysBetween(day, today) <= days) kept[day] = items;
  }
  return kept;
}

// ids를 주면 그 항목만, 아니면 보류 항목 전부를 오늘 목록 끝에 붙인다.
export function acceptPending(state, ids) {
  const picked = ids ? new Set(ids) : null;
  const take = picked ? state.pending.filter((t) => picked.has(t.id)) : state.pending;
  const keep = picked ? state.pending.filter((t) => !picked.has(t.id)) : [];
  let order = nextOrder(state.todos);
  const moved = take.map((t) => ({ ...t, order: order++, carriedFrom: null }));
  return { ...state, todos: [...state.todos, ...moved], pending: keep };
}

export function discardPending(state) {
  return { ...state, pending: [] };
}

// 기록의 항목을 오늘 할일로 새로 추가한다 (기록은 그대로 둔다).
export function redoFromHistory(state, todo) {
  return { ...state, todos: addTodo(state.todos, todo.text, state.lastDate) };
}
