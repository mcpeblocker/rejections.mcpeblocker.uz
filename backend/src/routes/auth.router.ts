import { Router } from "express";
import EmailService from "../services/email.service.js";
import JWTService from "../services/jwt.service.js";
import { prisma } from "../core/prisma.js";
import { BcryptService } from "../services/bcrypt.service.js";
import authMiddleware from "../middlewares/auth.js";
import type { RequestWithUser } from "../types/RequestWithUser.js";
import type { VerificationTokenPayload, AuthTokenPayload } from "../types/token.types.js";

const router = Router();

// Hard-coded token expiry time for verification and auth tokens
const TOKEN_EXPIRY_TIME = 24 * 60 * 60; // 24 hours in seconds
const AUTH_TOKEN_EXPIRY_TIME = 7 * 24 * 60 * 60; // 7 days in seconds

function generateAuthToken(userId: number): string {
    return JWTService.generateToken({ userId } as AuthTokenPayload, AUTH_TOKEN_EXPIRY_TIME);
}

router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // Check if already has PendingUser in the database
    const existingPendingUser = await prisma.pendingUser.findUnique({
        where: { email }
    });
    if (existingPendingUser) {
        return res.status(200).json({ success: true, message: "A verification email has already been sent to this email address. Please check your inbox." });
    }

    // Generate verification token
    const verificationToken = JWTService.generateToken({ email } as VerificationTokenPayload, TOKEN_EXPIRY_TIME);


    // Send verification email
    try {
        const sent = await EmailService.sendVerificationEmail(email, verificationToken);
        if (!sent) {
            throw new Error("sendVerificationEmail returned false");
        }
        // Hash the password before storing
        const hashedPassword = await BcryptService.hashPassword(password);
        // Create pending user record in the database
        const pendingUser = await prisma.pendingUser.create({
            data: {
                email,
                password: hashedPassword,
                verificationToken,
                tokenExpiry: new Date(Date.now() + TOKEN_EXPIRY_TIME * 1000), // 24 hours from now
            }
        });
        if (!pendingUser) {
            throw new Error("Failed to create pending user record");
        }
        res.status(200).json({ success: true, message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
        console.error(`Error in registration of ${email}:`, error);
        res.status(500).json({ success: false, message: "Error registering your account. Please try again." });
    }
});

router.post("/verify-email", async (req, res) => {
    const { token, name, username } = req.body;

    // Basic validation
    // token and name are required, username is optional
    if (!token || typeof token !== "string") {
        return res.status(400).json({ success: false, message: "Verification token is required." });
    }
    if (!name || typeof name !== "string") {
        return res.status(400).json({ success: false, message: "Name is required." });
    }

    // Verify token
    try {
        const decoded = JWTService.verifyToken(token) as VerificationTokenPayload;
        // Look up pending user by token and email
        const pendingUser = await prisma.pendingUser.findFirst({
            where: {
                verificationToken: token,
                email: decoded.email,
            }
        });
        if (!pendingUser) {
            throw new Error("Pending user with this token (or email) not found");
        }
        // Create the actual user account
        const user = await prisma.user.create({
            data: {
                email: pendingUser.email,
                password: pendingUser.password,
                name,
                username: typeof username === "string" ? username : null,
            }
        });
        // Delete the pending user record
        await prisma.pendingUser.delete({
            where: {
                id: pendingUser.id,
            }
        });
        // Generate auth token
        const authToken = generateAuthToken(user.id);
        res.status(200).json({ success: true, message: "Email verified successfully.", authToken });
    } catch (error) {
        console.error("Error verifying email token:", error);
        res.status(400).json({ success: false, message: "Invalid or expired verification token." });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // Compare passwords
        const passwordMatch = await BcryptService.comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        // Generate auth token
        const authToken = generateAuthToken(user.id);
        res.status(200).json({ success: true, authToken });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Error logging in. Please try again." });
    }
});

router.get("/me", authMiddleware, async (req: RequestWithUser, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
            }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Error fetching user profile. Please try again." });
    }
});

export default router;