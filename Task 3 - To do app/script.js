/* ============================================================
   MY TO-DO LIST — APP LOGIC
   Vanilla JavaScript. No frameworks, no libraries.
   ============================================================ */

// ---------- Constants & state ----------
const STORAGE_KEY = 'todo-app-tasks';
const THEME_KEY = 'todo-app-theme';

let tasks = [];              // array of task objects, loaded from localStorage
let currentFilter = 'all';   // 'all' | 'pending' | 'completed'
let currentSort = 'newest';  // 'newest' | 'oldest'
let searchTerm = '';
let editingTaskId = null;    // id of task currently being edited (or null)

// ---------- DOM references ----------
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const inputHint = document.getElementById('inputHint');

const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const pendingEmpty = document.getElementById('pendingEmpty');
const completedEmpty = document.getElementById('completedEmpty');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');

const searchInput = document.getElementById('searchInput');
const filterChips = document.querySelectorAll('.chip');
const sortSelect = document.getElementById('sortSelect');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const toast = document.getElementById('toast');

// ============================================================
// PERSISTENCE
// ============================================================

/**
 * Load tasks from localStorage into the `tasks` array.
 * Falls back to an empty array if nothing is stored or data is corrupt.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved tasks, starting fresh.', err);
    tasks = [];
  }
}

/**
 * Persist the current `tasks` array to localStorage.
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Could not save tasks.', err);
    showToast('Storage is full — changes may not be saved.');
  }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Generate a reasonably unique id for a new task.
 */
function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Format an ISO timestamp into a human-friendly string.
 * Example: "15 July 2026 • 9:45 PM"
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${day} ${month} ${year} • ${hours}:${minutes} ${meridiem}`;
}

/**
 * Escape user text before inserting into innerHTML, to avoid
 * accidentally rendering HTML the user typed as markup.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Briefly show a toast notification at the bottom of the screen.
 */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// ============================================================
// TASK OPERATIONS
// ============================================================

/**
 * Read the input field, validate it, and add a new pending task.
 */
function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    inputHint.textContent = 'Please enter a task before adding it.';
    taskInput.focus();
    return;
  }

  const newTask = {
    id: generateId(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  tasks.unshift(newTask);
  saveTasks();
  taskInput.value = '';
  inputHint.textContent = '';
  renderTasks();
  showToast('Task added ✓');
}

/**
 * Permanently remove a task after the user confirms.
 */
function deleteTask(id) {
  const confirmed = window.confirm('Delete this task? This cannot be undone.');
  if (!confirmed) return;

  const cardEl = document.querySelector(`[data-id="${id}"]`);
  if (cardEl) {
    cardEl.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter((task) => task.id !== id);
      saveTasks();
      renderTasks();
      showToast('Task deleted');
    }, 220);
  } else {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
  }
}

/**
 * Toggle a task between pending and completed, stamping the
 * appropriate timestamp.
 */
function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  saveTasks();
  renderTasks();
  showToast(task.completed ? 'Task completed 🎉' : 'Moved back to pending');
}

/**
 * Enter inline edit mode for a task.
 */
function editTask(id) {
  editingTaskId = id;
  renderTasks();

  // Focus the edit input once it exists in the DOM.
  requestAnimationFrame(() => {
    const input = document.querySelector(`[data-edit-input="${id}"]`);
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
}

/**
 * Save an edited task's text, preventing empty edits.
 */
function saveEdit(id) {
  const input = document.querySelector(`[data-edit-input="${id}"]`);
  if (!input) return;

  const newText = input.value.trim();
  if (!newText) {
    input.focus();
    showToast('Task text cannot be empty.');
    return;
  }

  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.text = newText;
    saveTasks();
  }

  editingTaskId = null;
  renderTasks();
  showToast('Task updated');
}

/**
 * Cancel editing without saving changes.
 */
function cancelEdit() {
  editingTaskId = null;
  renderTasks();
}

/**
 * Remove every completed task, after confirmation.
 */
function clearAllCompleted() {
  const completedTasks = tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) return;

  const confirmed = window.confirm(
    `Clear all ${completedTasks.length} completed task(s)? This cannot be undone.`
  );
  if (!confirmed) return;

  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
  showToast('Completed tasks cleared');
}

// ============================================================
// RENDERING
// ============================================================

/**
 * Build a single <li> task card element for the given task.
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-card${task.completed ? ' completed' : ''}`;
  li.setAttribute('data-id', task.id);

  const isEditing = editingTaskId === task.id;

  const metaLine = task.completed
    ? `<span class="done-stamp">✔ Completed:</span> ${formatTimestamp(task.completedAt)}`
    : `Added: ${formatTimestamp(task.createdAt)}`;

  const bodyHtml = isEditing
    ? `<input
         type="text"
         class="edit-input"
         data-edit-input="${task.id}"
         value="${escapeHtml(task.text)}"
         maxlength="140"
         aria-label="Edit task text"
       />`
    : `<p class="task-text">${escapeHtml(task.text)}</p>
       <p class="task-meta">${metaLine}</p>`;

  const actionsHtml = isEditing
    ? `<div class="task-actions">
         <button class="icon-btn complete" data-action="save" data-id="${task.id}" aria-label="Save task">Save</button>
         <button class="icon-btn delete" data-action="cancel" data-id="${task.id}" aria-label="Cancel editing">Cancel</button>
       </div>`
    : `<div class="task-actions">
         ${
           task.completed
             ? `<button class="icon-btn complete" data-action="toggle" data-id="${task.id}" aria-label="Mark as pending">Undo</button>`
             : `<button class="icon-btn complete" data-action="toggle" data-id="${task.id}" aria-label="Mark as complete">Complete</button>`
         }
         <button class="icon-btn edit" data-action="edit" data-id="${task.id}" aria-label="Edit task">Edit</button>
         <button class="icon-btn delete" data-action="delete" data-id="${task.id}" aria-label="Delete task">Delete</button>
       </div>`;

  li.innerHTML = bodyHtml + actionsHtml;
  return li;
}

/**
 * Apply the current search term and filter to the full task list.
 */
function getVisibleTasks() {
  let visible = tasks;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    visible = visible.filter((t) => t.text.toLowerCase().includes(term));
  }

  if (currentFilter === 'pending') {
    visible = visible.filter((t) => !t.completed);
  } else if (currentFilter === 'completed') {
    visible = visible.filter((t) => t.completed);
  }

  return visible;
}

/**
 * Sort a list of tasks by creation date, newest or oldest first.
 */
function sortTasks(list) {
  const sorted = [...list];
  sorted.sort((a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt);
    return currentSort === 'newest' ? -diff : diff;
  });
  return sorted;
}

/**
 * Re-render both the pending and completed columns from scratch,
 * based on the current tasks array, filter, search term and sort.
 */
function renderTasks() {
  const visible = sortTasks(getVisibleTasks());

  const pendingTasks = visible.filter((t) => !t.completed);
  const completedTasks = visible.filter((t) => t.completed);

  pendingList.innerHTML = '';
  completedTasks.length; // no-op to keep linting happy on some setups
  completedList.innerHTML = '';

  pendingTasks.forEach((task) => pendingList.appendChild(createTaskElement(task)));
  completedTasks.forEach((task) => completedList.appendChild(createTaskElement(task)));

  showEmptyStates(pendingTasks, completedTasks);
  updateCounters();
}

/**
 * Show or hide the "no tasks" messages for each column.
 */
function showEmptyStates(pendingTasks, completedTasks) {
  pendingEmpty.style.display = pendingTasks.length === 0 ? 'block' : 'none';
  completedEmpty.style.display = completedTasks.length === 0 ? 'block' : 'none';
}

/**
 * Update the pending / completed / total counters in the UI.
 * Counters reflect the FULL task list, not just the filtered view,
 * so the numbers stay meaningful regardless of search/filter state.
 */
function updateCounters() {
  const pendingTotal = tasks.filter((t) => !t.completed).length;
  const completedTotal = tasks.filter((t) => t.completed).length;

  pendingCount.textContent = `(${pendingTotal})`;
  completedCount.textContent = `(${completedTotal})`;
  totalCount.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'} total`;
}

// ============================================================
// EVENT LISTENERS
// ============================================================

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

taskInput.addEventListener('input', () => {
  if (inputHint.textContent) inputHint.textContent = '';
});

// Event delegation for task actions (complete / edit / save / cancel / delete)
function handleListClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;

  if (action === 'toggle') toggleComplete(id);
  else if (action === 'edit') editTask(id);
  else if (action === 'save') saveEdit(id);
  else if (action === 'cancel') cancelEdit();
  else if (action === 'delete') deleteTask(id);
}

pendingList.addEventListener('click', handleListClick);
completedList.addEventListener('click', handleListClick);

// Allow Enter/Escape while editing inline
document.addEventListener('keydown', (e) => {
  if (!editingTaskId) return;
  const input = e.target.closest('[data-edit-input]');
  if (!input) return;

  if (e.key === 'Enter') saveEdit(editingTaskId);
  if (e.key === 'Escape') cancelEdit();
});

// Search
searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderTasks();
});

// Filter chips
filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    filterChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderTasks();
  });
});

// Sort
sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderTasks();
});

// Clear completed
clearCompletedBtn.addEventListener('click', clearAllCompleted);

// Dark mode toggle
function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark-mode');
  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
});

// ============================================================
// INIT
// ============================================================

function init() {
  loadTasks();

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === 'dark');

  renderTasks();
}

init();
