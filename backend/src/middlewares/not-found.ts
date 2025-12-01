import type { Request, Response } from "express";

/**
 * Middleware to handle 404 Not Found errors for undefined routes.
 */
export const notFoundMiddleware = (req: Request, res: Response) => {
    res.status(404).send({ error: "Not Found" });
};