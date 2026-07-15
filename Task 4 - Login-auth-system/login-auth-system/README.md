# SecureAuth — Login Authentication System

A complete, full-stack login authentication system built with **vanilla HTML/CSS/JS** on the frontend and **Node.js + Express + SQLite** on the backend. Features a modern glassmorphism UI, secure session-based authentication, and a polished, responsive user experience.

---

## 📖 Project Overview

SecureAuth is a self-contained authentication starter kit. It lets a user register an account, log in with either their username or email, view a protected dashboard with their account details, and log out — all backed by a real SQLite database and industry-standard security practices (bcrypt password hashing, HttpOnly session cookies, parameterized SQL queries).

No frontend frameworks, CSS libraries, or external databases are used — everything is built from first principles to make the underlying mechanics of authentication clear and inspectable.

---

## ✨ Features

- **Registration** with server-side + client-side validation (username, email, password strength)
- **Login** using username *or* email, with a generic error message that never reveals which field was wrong
- **Session-based auth** using `express-session`, with HttpOnly cookies
- **Protected dashboard route** (`GET /dashboard`) guarded by custom middleware
- **Logout** that destroys the session and clears the cookie
- **Password hashing** with `bcrypt` (10 salt rounds) — plain-text passwords are never stored or transmitted back
- **Parameterized SQLite queries** to prevent SQL injection
- **Modern glassmorphism UI** — indigo/violet gradient background, frosted glass cards, ambient floating gradient orbs
- **Password show/hide toggle**
- **Toast notifications** for success/error feedback
- **Loading spinners** on all async buttons
- **Inline form validation** with accessible error messages (`aria-live`, `role="alert"`)
- **Fully responsive** — works on mobile, tablet, and desktop
- **Session persistence** across page refresh (dashboard/login pages check session on load)
- **Keyboard Enter key support** on all forms
- **Accessible markup** — labels, ARIA attributes, visible focus states, `prefers-reduced-motion` support

---

## 📁 Folder Structure

```
login-auth-system/
│
├── frontend/
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── register.js
│   │   ├── login.js
│   │   └── dashboard.js
│
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   ├── authRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── database/
│   │   └── users.db          (auto-created on first run)
│
└── README.md
```

---

## 🛠️ Installation

1. Make sure you have **Node.js** (v18+) installed.
2. Open a terminal in the `backend/` folder:

```bash
cd login-auth-system/backend
npm install
```

This installs all dependencies: `express`, `sqlite3`, `bcrypt`, `express-session`, `cors`, and `nodemon` (dev dependency).

---

## ▶️ How to Run

From the `backend/` folder:

```bash
npm start
```

The server will start on **http://localhost:3000** and automatically:
- Create the SQLite database file at `backend/database/users.db` if it doesn't exist
- Create the `users` table if it doesn't exist
- Serve the frontend static files from `../frontend`

Open your browser to **http://localhost:3000** — you'll be redirected to the login page.

For development with auto-restart on file changes, use:

```bash
npm run dev
```
*(requires `nodemon`, already listed as a dev dependency)*

---

## 📦 Dependencies

| Package          | Purpose                                      |
|------------------|-----------------------------------------------|
| `express`        | Web server & routing                          |
| `sqlite3`        | Embedded SQL database                         |
| `bcrypt`         | Password hashing                              |
| `express-session`| Session management & cookies                  |
| `cors`           | Cross-origin resource sharing                 |
| `nodemon`        | Dev-only auto-restart on file changes          |

---

## 🖼️ Screenshots

> Add screenshots of the Register, Login, and Dashboard pages here once you've run the app locally.

```
frontend/screenshots/register.png
frontend/screenshots/login.png
frontend/screenshots/dashboard.png
```

---

## 🚀 Future Improvements

- Add "Forgot Password" flow with email-based reset tokens
- Add refresh-token rotation for longer-lived sessions
- Add rate limiting on `/login` to mitigate brute-force attempts
- Add email verification on registration
- Add role-based access control (RBAC) for multi-tier permissions
- Migrate session store to a persistent store (e.g. `connect-sqlite3`) for production use
- Add unit/integration tests (Jest + Supertest)

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt (`saltRounds = 10`) before being stored — never in plain text.
- Session cookies are `HttpOnly` so client-side JavaScript cannot read them.
- All SQL queries use parameterized statements (`?` placeholders) to prevent injection.
- Login errors are intentionally generic (`"Invalid username/email or password."`) to avoid leaking which field was incorrect.
- For production deployment, set `cookie.secure = true` in `server.js` (requires HTTPS) and set a strong, unique `SESSION_SECRET` environment variable.
