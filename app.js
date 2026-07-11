import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import usersRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import auth from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Allow browser frontends to call the API. Set CORS_ORIGIN to lock this down to
// a specific origin in production (e.g. https://your-frontend.com); defaults to open.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.use(bodyParser.json());

// Serve the frontend (public/index.html) at "/".
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/people", auth, usersRoutes);
app.get("/api", (req, res) => res.send("Hi I'm Joe Barandon and Welcome to my API!"));

// Central error handler — catches errors forwarded by asyncHandler.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

export default app;
