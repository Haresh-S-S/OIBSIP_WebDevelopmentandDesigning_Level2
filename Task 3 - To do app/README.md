# My To-Do List

A modern, fully client-side to-do application built with plain HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html` in a browser.

Design concept: task cards are styled as **ticket stubs** dispensed from a ticket machine. Completing a task stamps it with a timestamp and moves it to the "completed" pile.

## Features

- Add tasks (button click or Enter key), with empty-input validation and trimming
- Pending and Completed task columns with live counters
- Mark tasks complete (with completion timestamp) or move them back to pending
- Inline editing with save/cancel, blocking empty edits
- Delete tasks with a confirmation prompt
- Empty-state messages that appear/disappear automatically
- Persistent storage via `localStorage` — tasks, status, timestamps, and edits all survive a page refresh
- Search tasks by text
- Filter by All / Pending / Completed
- Sort by newest or oldest
- Clear all completed tasks (with confirmation)
- Total task counter
- Toast notifications for key actions (add, complete, delete, etc.)
- Dark mode toggle (persisted across sessions)
- Smooth animations for adding/removing cards, hover states, and button interactions
- Responsive layout for desktop, tablet, and mobile
- Accessible: `aria-label`s on all controls, visible focus outlines, keyboard support, and `prefers-reduced-motion` support

## Technologies used

- **HTML5** — semantic structure
- **CSS3** — custom properties (design tokens), grid/flexbox layout, animations, dark mode
- **Vanilla JavaScript (ES6+)** — `const`/`let`, arrow functions, array methods (`filter`, `map`, `sort`), template literals, event delegation, `localStorage`

## Folder structure

```
/
├── index.html    # Markup and layout
├── style.css     # All styling, tokens, animations, responsive rules
├── script.js     # App logic: state, rendering, persistence, events
└── README.md     # This file
```

## How to run

No server or build tools required:

1. Download or clone the project folder.
2. Double-click `index.html` (or right-click → "Open with" your browser).
3. Start adding tasks — everything is saved automatically in your browser's local storage.

## Screenshots

_Add screenshots here once you've run the app locally, e.g._

```
![Pending and completed columns](screenshots/main-view.png)
![Dark mode](screenshots/dark-mode.png)
```

## Future improvements

- Drag-and-drop reordering of tasks
- Due dates and reminders
- Task categories/tags with color coding
- Import/export tasks as JSON
- Sync across devices via a backend
- Undo toast for deletions instead of a confirm dialog
