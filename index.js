import express from "express";
import bodyParser from "body-parser";

import usersRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import auth from "./middleware/auth.js";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/people", auth, usersRoutes);
app.get("/", (req, res) => res.send("Hi I'm Joe Barandon and Welcome to my API!"));

app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));