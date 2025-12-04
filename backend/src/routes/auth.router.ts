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
        // Check if the existing token has expired
        const now = new Date();
        const tokenExpired = existingPendingUser.tokenExpiry < now;
        
        if (!tokenExpired) {
            // Token is still valid, don't send another email
            return res.status(200).json({ 
                success: true, 
                message: "A verification email has already been sent to this email address. Please check your inbox." 
            });
        }
        
        // Token has expired, generate a new one and update the record
        console.log(`Verification token expired for ${email}. Generating new token and resending email.`);
        
        const newVerificationToken = JWTService.generateToken({ email } as VerificationTokenPayload, TOKEN_EXPIRY_TIME);
        const newTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME * 1000);
        
        try {
            // Send new verification email
            const sent = await EmailService.sendVerificationEmail(email, newVerificationToken);
            if (!sent) {
                throw new Error("sendVerificationEmail returned false");
            }
            
            // Update password if it changed and update token
            const hashedPassword = await BcryptService.hashPassword(password);
            await prisma.pendingUser.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    verificationToken: newVerificationToken,
                    tokenExpiry: newTokenExpiry,
                }
            });
            
            return res.status(200).json({ 
                success: true, 
                message: "Your previous verification link expired. We've sent you a new verification email. Please check your inbox." 
            });
        } catch (error) {
            console.error(`Error resending verification email for ${email}:`, error);
            return res.status(500).json({ 
                success: false, 
                message: "Error resending verification email. Please try again." 
            });
        }
    }

    // No existing PendingUser, create a new one
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
        
        // Check if token has expired in database
        const now = new Date();
        if (pendingUser.tokenExpiry < now) {
            // Token expired, delete the pending user record
            await prisma.pendingUser.delete({
                where: { id: pendingUser.id }
            });
            return res.status(400).json({ 
                success: false, 
                message: "Verification link has expired. Please register again to receive a new verification email." 
            });
        }
        
        // Create the actual user account
        const user = await prisma.user.create({
            data: {
                email: pendingUser.email,
                password: pendingUser.password,
                name,
                username: typeof username === "string" ? username.toLowerCase() : null,
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
                updatedAt: true,
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

/**
 * PATCH /api/auth/profile
 * Updates user profile (name and username)
 */
router.patch("/profile", authMiddleware, async (req: RequestWithUser, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, username } = req.body;

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Name is required and cannot be empty." });
        }

        // Check if username is already taken by another user
        if (username && typeof username === "string" && username.trim().length > 0) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username.trim(),
                    id: { not: userId }
                }
            });
            if (existingUser) {
                return res.status(409).json({ success: false, message: "Username is already taken." });
            }
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
                username: username && username.trim().length > 0 ? username.trim() : null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        res.status(200).json({ success: true, message: "Profile updated successfully.", user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Error updating profile. Please try again." });
    }
});

/**
 * POST /api/auth/change-password
 * Changes user password
 */
router.post("/change-password", authMiddleware, async (req: RequestWithUser, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify current password
        const passwordMatch = await BcryptService.comparePassword(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        // Hash new password
        const hashedPassword = await BcryptService.hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ success: false, message: "Error changing password. Please try again." });
    }
});

/**
 * DELETE /api/auth/account
 * Deletes user account and all associated data
 */
router.delete("/account", authMiddleware, async (req: RequestWithUser, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { password } = req.body;

        // Validate input
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required to delete account." });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify password
        const passwordMatch = await BcryptService.comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Password is incorrect." });
        }

        // Delete all user's rejections first (due to foreign key constraint)
        await prisma.rejection.deleteMany({
            where: { userId }
        });

        // Delete user account
        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ success: true, message: "Account deleted successfully." });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ success: false, message: "Error deleting account. Please try again." });
    }
});

export default router;