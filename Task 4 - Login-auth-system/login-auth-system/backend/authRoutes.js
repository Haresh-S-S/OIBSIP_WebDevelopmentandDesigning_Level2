/**
 * authRoutes.js
 * ---------------------------------------------------------
 * Defines all authentication-related routes:
 *   POST /register  - create a new user account
 *   POST /login      - authenticate an existing user
 *   GET  /dashboard   - protected route, returns user info
 *   POST /logout     - destroy the session and log out
 * ---------------------------------------------------------
 */

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./database');
const { isAuthenticated } = require('./middleware/authMiddleware');

const router = express.Router();

const SALT_ROUNDS = 10;

// ---------------------------------------------------------
// Helper validation functions
// ---------------------------------------------------------

// Basic RFC-5322-ish email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number
function isValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber;
}

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

// ---------------------------------------------------------
// POST /register
// ---------------------------------------------------------
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // ---- Server-side validation (never trust the client) ----
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Username is required and must be at least 3 characters long.'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.'
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.'
    });
  }

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // ---- Check if username already exists ----
  db.get('SELECT id FROM users WHERE username = ?', [trimmedUsername], (err, row) => {
    if (err) {
      console.error('DB error checking username:', err.message);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }

    if (row) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists.'
      });
    }

    // ---- Check if email already exists ----
    db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail], (err2, row2) => {
      if (err2) {
        console.error('DB error checking email:', err2.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
      }

      if (row2) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered.'
        });
      }

      // ---- Hash password and insert new user ----
      bcrypt.hash(password, SALT_ROUNDS, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Bcrypt hash error:', hashErr.message);
          return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
        }

        const createdAt = new Date().toISOString();

        const insertQuery = `
          INSERT INTO users (username, email, password, createdAt)
          VALUES (?, ?, ?, ?)
        `;

        db.run(insertQuery, [trimmedUsername, trimmedEmail, hashedPassword, createdAt], function (insertErr) {
          if (insertErr) {
            console.error('DB error inserting user:', insertErr.message);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
          }

          return res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in.'
          });
        });
      });
    });
  });
});

// ---------------------------------------------------------
// POST /login
// ---------------------------------------------------------
router.post('/login', (req, res) => {
  const { identifier, password } = req.body; // identifier = username OR email

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Invalid username/email or password.'
    });
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Look up the user by username OR email (case-insensitive)
  const query = `
    SELECT * FROM users
    WHERE LOWER(username) = ? OR LOWER(email) = ?
  `;

  db.get(query, [normalizedIdentifier, normalizedIdentifier], (err, user) => {
    if (err) {
      console.error('DB error during login lookup:', err.message);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }

    // Generic error message - never reveal which field was wrong
    const genericError = {
      success: false,
      message: 'Invalid username/email or password.'
    };

    if (!user) {
      return res.status(401).json(genericError);
    }

    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Bcrypt compare error:', compareErr.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
      }

      if (!isMatch) {
        return res.status(401).json(genericError);
      }

      // ---- Credentials valid: create session ----
      req.session.userId = user.id;

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        user: {
          username: user.username,
          email: user.email
        }
      });
    });
  });
});

// ---------------------------------------------------------
// GET /dashboard (protected)
// ---------------------------------------------------------
router.get('/dashboard', isAuthenticated, (req, res) => {
  const query = 'SELECT username, email, createdAt FROM users WHERE id = ?';

  db.get(query, [req.session.userId], (err, user) => {
    if (err) {
      console.error('DB error fetching dashboard user:', err.message);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }

    if (!user) {
      // Session pointed to a user that no longer exists
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in to continue.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  });
});

// ---------------------------------------------------------
// POST /logout
// ---------------------------------------------------------
router.post('/logout', (req, res) => {
  const cookieName = 'connect.sid';

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err.message);
      return res.status(500).json({ success: false, message: 'Could not log out. Please try again.' });
    }

    res.clearCookie(cookieName);
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
});

module.exports = router;
