// 상태 → DOM. 사용자 입력은 항상 textContent로 넣는다 (innerHTML 금지).

import { daysBetween, formatKoreanDate, formatShortDate, formatSlashDate } from './date.js';
import { filterTodos, MAX_TEXT, sortTodos } from './todo.js';

const EMPTY_MESSAGES = {
  all: '오늘 할 일을 추가해보세요',
  active: '진행 중인 할일이 없어요',
  done: '아직 완료한 할일이 없어요',
};
const ALL_DONE_MESSAGE = '오늘 할 일을 모두 끝냈어요 🎉';

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key in node && !key.startsWith('aria')) node[key] = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children);
  return node;
}

export function render(state, ui, els) {
  renderHeader(state, els);
  renderBanner(state, ui, els);
  renderFilters(state, els);
  renderList(state, ui, els);
  renderFooter(state, els);
  if (els.history.open) renderHistory(state, ui, els);
}

function renderHeader(state, els) {
  const total = state.todos.length;
  const done = state.todos.filter((t) => t.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  els.date.textContent = formatKoreanDate(state.lastDate);
  els.progressFill.style.width = `${percent}%`;
  els.progressBar.setAttribute('aria-valuenow', String(percent));
  els.progressText.textContent = `${done} / ${total} 완료`;
}

function renderBanner(state, ui, els) {
  const count = state.pending.length;
  els.banner.hidden = count === 0;
  if (!count) return;

  const fromYesterday = state.pending.every((t) => t.carriedFrom && daysBetween(t.carriedFrom, state.lastDate) === 1);
  els.carryText.textContent = `${fromYesterday ? '어제' : '이전에'} 못 끝낸 ${count}개를 오늘로 가져올까요?`;
  els.pickToggle.setAttribute('aria-expanded', String(ui.pickOpen));
  els.pick.hidden = !ui.pickOpen;
  if (!ui.pickOpen) return;

  els.pickList.replaceChildren(
    ...state.pending.map((t) =>
      el('li', {}, [
        el('label', {}, [
          el('input', { type: 'checkbox', value: t.id, checked: !ui.pickUnchecked.has(t.id) }),
          el('span', { text: t.text }),
          t.carriedFrom ? el('small', { text: formatShortDate(t.carriedFrom) }) : '',
        ]),
      ]),
    ),
  );
}

function renderFilters(state, els) {
  for (const button of els.filters.querySelectorAll('[data-filter]')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === state.filter));
  }
}

function renderItem(todo, today, ui) {
  const editing = ui.editingId === todo.id;
  const classes = ['todo', todo.done && 'done', todo.important && 'important'].filter(Boolean).join(' ');

  const body = editing
    ? el('input', {
        className: 'edit-input',
        type: 'text',
        value: ui.editDraft,
        maxLength: MAX_TEXT,
        'aria-label': '할일 수정',
        dataset: { role: 'edit' },
      })
    : el('span', { className: 'todo-text', dataset: { role: 'text' } }, [
        todo.text,
        todo.sourceDate !== today ? el('span', { className: 'badge', text: `${formatSlashDate(todo.sourceDate)}부터` }) : '',
      ]);

  return el('li', { className: classes, dataset: { id: todo.id } }, [
    el('span', { className: 'handle', draggable: true, title: '드래그해서 순서 변경', 'aria-hidden': 'true', dataset: { role: 'handle' }, text: '⠿' }),
    el('input', { type: 'checkbox', checked: todo.done, 'aria-label': `${todo.text} 완료`, dataset: { role: 'toggle' } }),
    body,
    el('div', { className: 'todo-actions' }, [
      el('button', {
        type: 'button',
        className: 'icon-btn',
        'aria-label': '중요 표시',
        'aria-pressed': String(todo.important),
        dataset: { role: 'star' },
        text: todo.important ? '★' : '☆',
      }),
      el('button', { type: 'button', className: 'icon-btn', 'aria-label': `${todo.text} 수정`, dataset: { role: 'edit-btn' }, text: '✎' }),
      el('button', { type: 'button', className: 'icon-btn', 'aria-label': `${todo.text} 삭제`, dataset: { role: 'delete' }, text: '✕' }),
    ]),
  ]);
}

function renderList(state, ui, els) {
  const visible = filterTodos(sortTodos(state.todos), state.filter);
  els.list.replaceChildren(...visible.map((t) => renderItem(t, state.lastDate, ui)));

  const total = state.todos.length;
  const allDone = total > 0 && state.todos.every((t) => t.done);
  const message = allDone ? ALL_DONE_MESSAGE : visible.length === 0 ? EMPTY_MESSAGES[state.filter] : '';
  els.empty.textContent = message;
  els.empty.hidden = !message;
  els.form.classList.toggle('is-empty', total === 0);
}

function renderFooter(state, els) {
  const remaining = state.todos.filter((t) => !t.done).length;
  els.remaining.textContent = `남은 할일 ${remaining}개`;
  els.clearDone.disabled = remaining === state.todos.length;
}

export function renderHistory(state, ui, els) {
  const days = Object.keys(state.history)
    .filter((day) => state.history[day].length)
    .sort()
    .reverse();

  if (!days.length) {
    els.historyBody.replaceChildren(
      el('p', { className: 'history-empty', text: '아직 기록이 없어요. 날짜가 바뀌면 완료한 할일이 여기에 모여요.' }),
    );
    return;
  }

  els.historyBody.replaceChildren(
    ...days.map((day) => {
      const items = state.history[day];
      return el('section', { className: 'history-day' }, [
        el('h3', {}, [formatShortDate(day), el('span', { text: ` · ${items.length}개 완료` })]),
        el(
          'ul',
          {},
          items.map((t) => {
            const redone = ui.redone.has(t.id);
            return el('li', {}, [
              el('span', { className: 'check', 'aria-hidden': 'true', text: '✓' }),
              el('span', { text: t.text }),
              el('button', {
                type: 'button',
                className: 'btn',
                disabled: redone,
                dataset: { day, id: t.id },
                text: redone ? '추가됨' : '오늘 다시 하기',
              }),
            ]);
          }),
        ),
      ]);
    }),
  );
}
