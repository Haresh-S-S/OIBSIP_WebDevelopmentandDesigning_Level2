/**
 * server.js
 * ---------------------------------------------------------
 * Entry point for the backend server.
 * Sets up Express, middleware (CORS, sessions, JSON parsing),
 * mounts auth routes, and serves the frontend static files.
 * ---------------------------------------------------------
 */

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Ensure the database + users table are initialized
require('./database');

const authRoutes = require('./authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------

// Allow requests from the frontend, with credentials (cookies)
app.use(
  cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
  })
);

// Parse incoming JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure sessions
app.use(
  session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // JavaScript on the client cannot read the cookie
      secure: false, // set to true if serving over HTTPS in production
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);

// ---------------------------------------------------------
// Routes
// ---------------------------------------------------------

// Auth API routes (/register, /login, /dashboard, /logout)
app.use('/', authRoutes);

// Serve the frontend static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Fallback: redirect root to the login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ---------------------------------------------------------
// Start the server
// ---------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
