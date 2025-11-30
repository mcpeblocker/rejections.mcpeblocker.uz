import express from "express";
import { config as configEnv } from "dotenv";
import cors from "cors";

configEnv();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req,res, next) => {
    // Log each request
    console.log(`${req.method} ${req.path}`);
    next();
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/api/rejection/log", (req, res) => {
    const { id, email } = req.body;
    console.log(`Rejection logged for ID: ${id}, Email: ${email}`);
    // Logic to log rejection would go here
    res.status(201).send({ message: "Rejection logged successfully" });
});

app.use((req, res) => {
    res.status(404).send({ error: "Not Found" });
});

const PORT = process.env.SERVER_PORT;

if (!PORT) {
    throw new Error("SERVER_PORT is not defined in environment variables");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
