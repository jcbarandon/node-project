import Database from 'better-sqlite3';

// DB_FILE lets tests point at an in-memory database (':memory:').
const db = new Database(process.env.DB_FILE || 'data.db');

// Enforce foreign keys and use a faster, safer write mode.
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id       TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        age      INTEGER
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
        id       TEXT PRIMARY KEY,
        email    TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

export default db;
