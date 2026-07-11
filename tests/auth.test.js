import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';

// Use an in-memory Postgres (pg-mem). Must be set before app (and db) are imported.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

let request;
let app;

before(async () => {
    request = (await import('supertest')).default;
    app = (await import('../app.js')).default;
    const { initDb } = await import('../db.js');
    await initDb();
});

describe('POST /auth/register', () => {
    test('registers a new account and returns a token', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'alice@example.com', password: 'secret123' });

        assert.equal(res.status, 201);
        assert.ok(res.body.token, 'expected a token in the response');
    });

    test('rejects missing password with 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'nopass@example.com' });

        assert.equal(res.status, 400);
    });

    test('rejects a duplicate email with 409', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'alice@example.com', password: 'secret123' });

        assert.equal(res.status, 409);
    });
});

describe('POST /auth/login', () => {
    test('logs in with correct credentials and returns a token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'alice@example.com', password: 'secret123' });

        assert.equal(res.status, 200);
        assert.ok(res.body.token);
    });

    test('rejects a wrong password with 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'alice@example.com', password: 'WRONG' });

        assert.equal(res.status, 401);
    });

    test('rejects an unknown email with 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'ghost@example.com', password: 'secret123' });

        assert.equal(res.status, 401);
    });
});
