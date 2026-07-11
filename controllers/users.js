import { v4 as uuid } from 'uuid';

import pool from '../db.js';

export const getUsers = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users');
    res.status(200).json(rows);
};

export const createUser = async (req, res) => {
    const { username, age } = req.body;

    if (!username || age === undefined) {
        return res.status(400).json({ message: 'username and age are required' });
    }

    const id = uuid();
    const { rows } = await pool.query(
        'INSERT INTO users (id, username, age) VALUES ($1, $2, $3) RETURNING *',
        [id, username, age]
    );

    console.log(`User [${username}] added to the database.`);
    res.status(201).json(rows[0]);
};

export const getUser = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    res.status(200).json(rows[0]);
};

export const deleteUser = async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);

    if (rowCount === 0) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    console.log(`User with id ${req.params.id} has been deleted.`);
    res.status(200).json({ message: `User with id ${req.params.id} deleted successfully` });
};

export const updateUser = async (req, res) => {
    const existing = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

    if (existing.rows.length === 0) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    const current = existing.rows[0];
    const { username, age } = req.body;

    const { rows } = await pool.query(
        'UPDATE users SET username = $1, age = $2 WHERE id = $3 RETURNING *',
        [username ?? current.username, age ?? current.age, req.params.id]
    );

    console.log(`User with id ${req.params.id} has been updated.`);
    res.status(200).json(rows[0]);
};
