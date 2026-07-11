// JWT_SECRET must be provided via the environment (e.g. a .env file locally, or
// an injected env var in production). No fallback — fail fast if it's missing.
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

export const JWT_EXPIRES_IN = '1h';
