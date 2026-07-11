import pg from 'pg';

let pool;

if (process.env.NODE_ENV === 'test') {
    // In tests, use an in-memory Postgres so no real database server is needed.
    const { newDb } = await import('pg-mem');
    const mem = newDb();
    const { Pool } = mem.adapters.createPg();
    pool = new Pool();
} else {
    pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        // Managed Postgres (e.g. Render external URLs) requires SSL.
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
}

// Without this, an error on an idle pooled connection (e.g. the database
// dropping the connection) is emitted as an unhandled 'error' event, which
// crashes the Node process. pg-mem's pool may not be an EventEmitter, so guard.
if (typeof pool.on === 'function') {
    pool.on('error', (err) => {
        console.error('Unexpected Postgres pool error:', err);
    });
}

// Creates the tables if they don't already exist. Call once at startup.
export async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id       TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            age      INTEGER
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS accounts (
            id       TEXT PRIMARY KEY,
            email    TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);
}

export default pool;
