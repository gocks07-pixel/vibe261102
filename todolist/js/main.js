// 진입점: 초기화, 이벤트 바인딩.

import * as store from './store.js';
import * as T from './todo.js';
import * as R from './rollover.js';
import { todayKey } from './date.js';
import { render, renderHistory } from './render.js';

const UNDO_MS = 5000;
const DAY_CHECK_MS = 60 * 1000;

const $ = (id) => document.getElementById(id);

const els = {
  storageWarning: $('storage-warning'),
  date: $('today-date'),
  progressBar: $('progress-bar'),
  progressFill: $('progress-fill'),
  progressText: $('progress-text'),
  banner: $('carry-banner'),
  carryText: $('carry-text'),
  pickToggle: $('pick-toggle'),
  pick: $('pick'),
  pickList: $('pick-list'),
  form: $('add-form'),
  input: $('new-todo'),
  filters: $('filters'),
  list: $('todo-list'),
  empty: $('empty'),
  remaining: $('remaining'),
  clearDone: $('clear-done'),
  openHistory: $('open-history'),
  history: $('history'),
  historyBody: $('history-body'),
  closeHistory: $('close-history'),
  toast: $('toast'),
  toastText: $('toast-text'),
  toastUndo: $('toast-undo'),
};

// 저장하지 않는 화면 상태
const ui = {
  editingId: null,
  editDraft: '',
  pickOpen: false,
  pickUnchecked: new Set(),
  redone: new Set(),
  deleted: null,
  toastTimer: null,
  dragId: null,
};

const updateTodos = (fn) => store.dispatch((s) => ({ ...s, todos: fn(s.todos) }));

function itemSelector(id, role) {
  return `li[data-id="${CSS.escape(id)}"]${role ? ` [data-role="${role}"]` : ''}`;
}

function focusItem(id, role = 'toggle') {
  const target = els.list.querySelector(itemSelector(id, role));
  if (target) target.focus();
  else els.input.focus();
}

// 다시 그려도 목록 안의 포커스 위치를 유지한다.
function rerender() {
  const active = document.activeElement;
  const li = active?.closest?.('li[data-id]');
  const keep = li && els.list.contains(li) ? { id: li.dataset.id, role: active.dataset.role } : null;
  render(store.getState(), ui, els);
  if (keep && !els.list.contains(document.activeElement)) {
    const target =
      els.list.querySelector(itemSelector(keep.id, keep.role)) ?? els.list.querySelector(itemSelector(keep.id, 'toggle'));
    if (target) target.focus();
    else els.input.focus();
  }
}

// ---------- 추가 ----------
els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = els.input.value;
  if (!T.normalizeText(text)) {
    els.input.value = '';
    return;
  }
  updateTodos((todos) => T.addTodo(todos, text, store.getState().lastDate));
  els.input.value = '';
  els.input.focus();
});

// ---------- 목록: 완료 / 중요 / 수정 / 삭제 ----------
function startEdit(id) {
  const todo = store.getState().todos.find((t) => t.id === id);
  if (!todo) return;
  // 다른 항목을 편집 중이었다면 먼저 저장
  if (ui.editingId && ui.editingId !== id) {
    const prev = { id: ui.editingId, text: ui.editDraft };
    ui.editingId = null;
    updateTodos((todos) => T.editTodo(todos, prev.id, prev.text));
  }
  ui.editingId = id;
  ui.editDraft = todo.text;
  rerender();
  const input = els.list.querySelector(itemSelector(id, 'edit'));
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function finishEdit(save) {
  const id = ui.editingId;
  if (!id) return;
  const text = ui.editDraft;
  ui.editingId = null;
  ui.editDraft = '';
  if (save) updateTodos((todos) => T.editTodo(todos, id, text));
  rerender();
  focusItem(id);
}

function deleteTodo(id) {
  const todo = store.getState().todos.find((t) => t.id === id);
  if (!todo) return;
  if (ui.editingId === id) ui.editingId = null;
  // 키보드로 지웠을 때 바로 옆 항목으로 포커스를 옮긴다
  const li = els.list.querySelector(itemSelector(id));
  const hadFocus = li?.contains(document.activeElement);
  const neighbor = (li?.nextElementSibling ?? li?.previousElementSibling)?.dataset.id;
  updateTodos((todos) => T.removeTodo(todos, id));
  if (hadFocus && neighbor) focusItem(neighbor);
  showUndo(todo);
}

els.list.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]');
  if (!li) return;
  const { id } = li.dataset;
  switch (e.target.closest('[data-role]')?.dataset.role) {
    case 'toggle':
      updateTodos((todos) => T.toggleTodo(todos, id));
      break;
    case 'star':
      updateTodos((todos) => T.toggleImportant(todos, id));
      break;
    case 'edit-btn':
      startEdit(id);
      break;
    case 'delete':
      deleteTodo(id);
      break;
  }
});

els.list.addEventListener('dblclick', (e) => {
  const text = e.target.closest('[data-role="text"]');
  if (text) startEdit(text.closest('li').dataset.id);
});

els.list.addEventListener('input', (e) => {
  if (e.target.dataset.role === 'edit') ui.editDraft = e.target.value;
});

els.list.addEventListener('keydown', (e) => {
  if (e.target.dataset.role === 'edit') {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      finishEdit(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finishEdit(false);
    }
    return;
  }
  if (e.key === 'Delete') {
    const li = e.target.closest('li[data-id]');
    if (li) {
      e.preventDefault();
      deleteTodo(li.dataset.id);
    }
  }
});

// 편집 중 다른 곳을 누르면 저장
els.list.addEventListener('focusout', (e) => {
  if (e.target.dataset.role === 'edit' && ui.editingId && e.target.isConnected) finishEdit(true);
});

// ---------- 순서 변경 (드래그) ----------
function clearDropMarks() {
  for (const li of els.list.querySelectorAll('.drop-before, .drop-after, .dragging')) {
    li.classList.remove('drop-before', 'drop-after', 'dragging');
  }
}

function dropPosition(e, li) {
  const rect = li.getBoundingClientRect();
  return e.clientY > rect.top + rect.height / 2;
}

els.list.addEventListener('dragstart', (e) => {
  const handle = e.target.closest?.('[data-role="handle"]');
  if (!handle) return;
  const li = handle.closest('li');
  ui.dragId = li.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', ui.dragId);
  e.dataTransfer.setDragImage(li, 16, li.offsetHeight / 2);
  li.classList.add('dragging');
});

els.list.addEventListener('dragover', (e) => {
  if (!ui.dragId) return;
  const li = e.target.closest('li[data-id]');
  if (!li || li.dataset.id === ui.dragId) return;
  e.preventDefault();
  const after = dropPosition(e, li);
  for (const other of els.list.querySelectorAll('.drop-before, .drop-after')) {
    if (other !== li) other.classList.remove('drop-before', 'drop-after');
  }
  li.classList.toggle('drop-after', after);
  li.classList.toggle('drop-before', !after);
});

els.list.addEventListener('drop', (e) => {
  const li = e.target.closest('li[data-id]');
  if (!ui.dragId || !li) return;
  e.preventDefault();
  const id = ui.dragId;
  const after = dropPosition(e, li);
  ui.dragId = null;
  updateTodos((todos) => T.moveTodo(todos, id, li.dataset.id, after));
});

els.list.addEventListener('dragend', () => {
  ui.dragId = null;
  clearDropMarks();
});

// ---------- 삭제 실행 취소 ----------
function hideToast() {
  clearTimeout(ui.toastTimer);
  ui.deleted = null;
  els.toast.hidden = true;
}

function showUndo(todo) {
  clearTimeout(ui.toastTimer);
  ui.deleted = todo;
  els.toastText.textContent = '할일을 삭제했어요';
  els.toast.hidden = false;
  ui.toastTimer = setTimeout(hideToast, UNDO_MS);
}

els.toastUndo.addEventListener('click', () => {
  const todo = ui.deleted;
  hideToast();
  if (!todo) return;
  updateTodos((todos) => T.restoreTodo(todos, todo));
  focusItem(todo.id);
});

// ---------- 필터 / 완료 항목 지우기 ----------
els.filters.addEventListener('click', (e) => {
  const button = e.target.closest('[data-filter]');
  if (button) store.dispatch((s) => ({ ...s, filter: button.dataset.filter }));
});

els.clearDone.addEventListener('click', () => {
  const count = store.getState().todos.filter((t) => t.done).length;
  if (!count) return;
  if (confirm(`완료한 할일 ${count}개를 지울까요?`)) updateTodos(T.clearDone);
});

// ---------- 이월 배너 ----------
els.banner.addEventListener('click', (e) => {
  switch (e.target.closest('[data-action]')?.dataset.action) {
    case 'accept-all':
      ui.pickOpen = false;
      ui.pickUnchecked.clear();
      store.dispatch((s) => R.acceptPending(s));
      break;
    case 'pick-toggle':
      ui.pickOpen = !ui.pickOpen;
      rerender();
      break;
    case 'accept-picked': {
      const ids = store.getState().pending.map((t) => t.id).filter((id) => !ui.pickUnchecked.has(id));
      if (!ids.length) return;
      store.dispatch((s) => R.acceptPending(s, ids));
      if (!store.getState().pending.length) {
        ui.pickOpen = false;
        ui.pickUnchecked.clear();
        rerender();
      }
      break;
    }
    case 'discard': {
      const count = store.getState().pending.length;
      if (confirm(`못 끝낸 할일 ${count}개를 버릴까요? 되돌릴 수 없어요.`)) {
        ui.pickOpen = false;
        ui.pickUnchecked.clear();
        store.dispatch(R.discardPending);
      }
      break;
    }
  }
});

els.pickList.addEventListener('change', (e) => {
  const box = e.target;
  if (box.type !== 'checkbox') return;
  if (box.checked) ui.pickUnchecked.delete(box.value);
  else ui.pickUnchecked.add(box.value);
});

// ---------- 지난 기록 ----------
els.openHistory.addEventListener('click', () => {
  renderHistory(store.getState(), ui, els);
  els.history.showModal();
});

els.closeHistory.addEventListener('click', () => els.history.close());

// 바깥(백드롭) 클릭 시 닫기
els.history.addEventListener('click', (e) => {
  if (e.target === els.history) els.history.close();
});

els.historyBody.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-id]');
  if (!button) return;
  const { day, id } = button.dataset;
  const todo = store.getState().history[day]?.find((t) => t.id === id);
  if (!todo) return;
  ui.redone.add(id);
  store.dispatch((s) => R.redoFromHistory(s, todo));
});

// ---------- 단축키 ----------
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (document.activeElement?.matches('input[type="text"], textarea') || els.history.open) return;
  e.preventDefault();
  els.input.focus();
});

// ---------- 날짜 변경 감지 (페이지를 열어둔 채 자정이 지난 경우) ----------
function checkNewDay() {
  const today = todayKey();
  if (store.getState().lastDate === today) return;
  ui.editingId = null;
  store.dispatch((s) => R.rollover(s, today));
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkNewDay();
});
setInterval(checkNewDay, DAY_CHECK_MS);

// 다른 탭에서 바꾼 내용 반영
window.addEventListener('storage', (e) => {
  if (store.isOwnKey(e.key)) store.load(todayKey(), false);
});

// ---------- 시작 ----------
store.subscribe(rerender);
store.load(todayKey());
els.storageWarning.hidden = store.isPersistent();
