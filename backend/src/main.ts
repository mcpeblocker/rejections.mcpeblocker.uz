import express from "express";
import cors from "cors";
import morgan from "morgan";

import server from "./core/server.js";
import appConfig from "./config.js";
import apiRouter from "./routes/index.js";
import { notFoundMiddleware } from "./middlewares/not-found.js";


server.use(morgan(appConfig.IS_PROD ? "combined" : "dev"));
server.use(cors());
server.use(express.json());

/**
 * API Routes
 * All API routes are prefixed with /api
 */
server.use("/api", apiRouter);

/**
 * 404 Middleware for undefined routes
 */
server.use(notFoundMiddleware);

server.listen(appConfig.SERVER_PORT, () => {
    console.log(`Server is running on port ${appConfig.SERVER_PORT}`);
});