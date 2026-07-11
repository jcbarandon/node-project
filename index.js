import express from "express";
import bodyParser from "body-parser";

import usersRoutes from "./routes/users.js";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use("/people", usersRoutes);
app.get("/", (req, res) => res.send("Hi I'm Joe Barandon and Welcome to my API!"));

app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));