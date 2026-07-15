/**
 * database.js
 * ---------------------------------------------------------
 * Sets up the SQLite database connection and ensures the
 * `users` table exists. Exported `db` instance is reused
 * across the whole backend (routes, middleware, etc.)
 * ---------------------------------------------------------
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Make sure the /database directory exists before creating the DB file
const dbDirectory = path.join(__dirname, 'database');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = path.join(dbDirectory, 'users.db');

// Create (or open) the SQLite database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
  }
});

/**
 * Create the `users` table automatically if it does not exist.
 * Columns:
 *  - id         : Primary key, auto-incrementing
 *  - username   : Unique username
 *  - email      : Unique email address
 *  - password   : Bcrypt-hashed password (never stored in plain text)
 *  - createdAt  : ISO timestamp of account creation
 */
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`;

db.serialize(() => {
  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('❌ Failed to create users table:', err.message);
    } else {
      console.log('✅ Users table is ready.');
    }
  });
});

module.exports = db;
