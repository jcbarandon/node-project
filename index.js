import "dotenv/config";

import app from "./app.js";
import { initDb } from "./db.js";

const PORT = process.env.PORT || 5000;

// The database may not be ready the instant the app boots (e.g. a freshly
// provisioned managed Postgres). Retry a few times before giving up.
async function initDbWithRetry(maxAttempts = 10, delayMs = 3000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await initDb();
            return;
        } catch (err) {
            console.error(`Database not ready (attempt ${attempt}/${maxAttempts}): ${err.message}`);
            if (attempt === maxAttempts) throw err;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}

initDbWithRetry()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("Failed to initialize database after retries:", err);
        process.exit(1);
    });
