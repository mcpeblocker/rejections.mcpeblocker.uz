import jwt from "jsonwebtoken";
import appConfig from "../config.js";

class JWTService {
    /**
     * Generates a JWT token with the given payload and expiration time.
     * @param payload - The payload to include in the token.
     * @param expiresIn - Expiration time in seconds (default: 1 hour).
     * @returns The generated JWT token.
     */
    static generateToken(payload: object, expiresIn: number = 60 * 60): string {
        return jwt.sign(payload, appConfig.JWT_SECRET, { expiresIn });
    }

    /**
     * Verifies a JWT token and returns the decoded payload.
     * @param token - The JWT token to verify.
     * @returns The decoded payload if the token is valid.
     */
    static verifyToken(token: string): object | string {
        return jwt.verify(token, appConfig.JWT_SECRET);
    }
}

export default JWTService;