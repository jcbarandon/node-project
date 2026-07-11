import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config.js';

// Verifies a Bearer token and attaches the decoded payload to req.user.
const auth = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or malformed Authorization header' });
    }

    const token = header.split(' ')[1];

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default auth;
