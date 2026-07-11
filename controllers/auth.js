import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import db from '../db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';

export const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
    }

    const existing = db.prepare('SELECT id FROM accounts WHERE email = ?').get(email);
    if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuid();
    db.prepare('INSERT INTO accounts (id, email, password) VALUES (?, ?, ?)').run(id, email, hashed);

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    console.log(`Account registered: ${email}`);
    res.status(201).json({ token });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
    }

    const account = db.prepare('SELECT * FROM accounts WHERE email = ?').get(email);
    if (!account) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, account.password);
    if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: account.id, email: account.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    console.log(`Account logged in: ${email}`);
    res.status(200).json({ token });
};
