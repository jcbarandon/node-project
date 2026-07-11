import Database from 'better-sqlite3';

const db = new Database('data.db');

// Enforce foreign keys and use a faster, safer write mode.
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id       TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        age      INTEGER
    )
`);

export default db;
