// In production, set JWT_SECRET as an environment variable (e.g. in a .env file).
// The fallback here is only for local development convenience.
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const JWT_EXPIRES_IN = '1h';
