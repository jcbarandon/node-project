import "dotenv/config";

import app from "./app.js";
import { initDb } from "./db.js";

const PORT = process.env.PORT || 5000;

initDb()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    });
