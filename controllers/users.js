import { v4 as uuid } from 'uuid';

import db from '../db.js';

export const getUsers = (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.status(200).json(users);
};

export const createUser = (req, res) => {
    const { username, age } = req.body;

    if (!username || age === undefined) {
        return res.status(400).json({ message: 'username and age are required' });
    }

    const user = { id: uuid(), username, age };
    db.prepare('INSERT INTO users (id, username, age) VALUES (?, ?, ?)').run(user.id, user.username, user.age);

    console.log(`User [${username}] added to the database.`);
    res.status(201).json(user);
};

export const getUser = (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    res.status(200).json(user);
};

export const deleteUser = (req, res) => {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    console.log(`User with id ${req.params.id} has been deleted.`);
    res.status(200).json({ message: `User with id ${req.params.id} deleted successfully` });
};

export const updateUser = (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    const { username, age } = req.body;
    const updated = {
        username: username ?? user.username,
        age: age ?? user.age,
    };

    db.prepare('UPDATE users SET username = ?, age = ? WHERE id = ?').run(updated.username, updated.age, req.params.id);

    console.log(`User with id ${req.params.id} has been updated.`);
    res.status(200).json({ id: req.params.id, ...updated });
};
