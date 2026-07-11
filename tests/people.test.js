import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';

// Use a throwaway in-memory DB. Must be set before app (and db) are imported.
process.env.DB_FILE = ':memory:';

let request;
let app;
let token;

before(async () => {
    request = (await import('supertest')).default;
    app = (await import('../app.js')).default;

    // Register an account to obtain a token for the protected routes.
    const res = await request(app)
        .post('/auth/register')
        .send({ email: 'people-tester@example.com', password: 'secret123' });
    token = res.body.token;
});

const authed = (req) => req.set('Authorization', `Bearer ${token}`);

describe('auth guard on /people', () => {
    test('rejects requests without a token (401)', async () => {
        const res = await request(app).get('/people');
        assert.equal(res.status, 401);
    });

    test('rejects an invalid token (401)', async () => {
        const res = await request(app).get('/people').set('Authorization', 'Bearer bad.token');
        assert.equal(res.status, 401);
    });
});

describe('CRUD on /people', () => {
    let createdId;

    test('starts empty', async () => {
        const res = await authed(request(app).get('/people'));
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, []);
    });

    test('creates a user (201) and returns it with an id', async () => {
        const res = await authed(request(app).post('/people')).send({ username: 'joe', age: 30 });
        assert.equal(res.status, 201);
        assert.equal(res.body.username, 'joe');
        assert.equal(res.body.age, 30);
        assert.ok(res.body.id);
        createdId = res.body.id;
    });

    test('rejects creating a user with missing fields (400)', async () => {
        const res = await authed(request(app).post('/people')).send({ username: 'noage' });
        assert.equal(res.status, 400);
    });

    test('fetches the created user by id', async () => {
        const res = await authed(request(app).get(`/people/${createdId}`));
        assert.equal(res.status, 200);
        assert.equal(res.body.username, 'joe');
    });

    test('returns 404 for an unknown id', async () => {
        const res = await authed(request(app).get('/people/does-not-exist'));
        assert.equal(res.status, 404);
    });

    test('updates the user (partial patch)', async () => {
        const res = await authed(request(app).patch(`/people/${createdId}`)).send({ age: 31 });
        assert.equal(res.status, 200);
        assert.equal(res.body.age, 31);
        assert.equal(res.body.username, 'joe', 'username should be unchanged');
    });

    test('returns 404 when updating an unknown id', async () => {
        const res = await authed(request(app).patch('/people/does-not-exist')).send({ age: 1 });
        assert.equal(res.status, 404);
    });

    test('deletes the user (200) and it is gone afterward', async () => {
        const del = await authed(request(app).delete(`/people/${createdId}`));
        assert.equal(del.status, 200);

        const after = await authed(request(app).get(`/people/${createdId}`));
        assert.equal(after.status, 404);
    });

    test('returns 404 when deleting an unknown id', async () => {
        const res = await authed(request(app).delete('/people/does-not-exist'));
        assert.equal(res.status, 404);
    });
});
