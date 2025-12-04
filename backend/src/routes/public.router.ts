import { Router } from "express";
import { prisma } from "../core/prisma.js";

const router = Router();

// Helper function to calculate resilience level
function calculateResilienceLevel(rejectionCount: number): { level: string; color: string; points: number } {
    let level = "Bronze";
    let color = "#CD7F32";
    let points = rejectionCount * 10;

    if (rejectionCount >= 100) {
        level = "Legend";
        color = "#FFD700";
    } else if (rejectionCount >= 50) {
        level = "Diamond";
        color = "#B9F2FF";
    } else if (rejectionCount >= 25) {
        level = "Platinum";
        color = "#E5E4E2";
    } else if (rejectionCount >= 10) {
        level = "Gold";
        color = "#FFD700";
    } else if (rejectionCount >= 5) {
        level = "Silver";
        color = "#C0C0C0";
    }

    return { level, color, points };
}

/**
 * GET /api/public/profile/:username
 * Get public profile information by username
 */
router.get("/profile/:username", async (req, res) => {
    const { username } = req.params;

    try {
        // Find user by username
        // Case insensitive search over username
        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username.toLowerCase(),
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                name: true,
                username: true,
                createdAt: true,
                rejections: {
                    select: {
                        id: true,
                        title: true,
                        emailId: true,
                        timestamp: true,
                        createdAt: true,
                        content: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const rejectionCount = user.rejections.length;
        const resilience = calculateResilienceLevel(rejectionCount);

        // Get most recent 10 rejections for preview
        const recentRejections = user.rejections.slice(0, 10).map(r => ({
            id: r.id,
            title: r.title,
            source: r.emailId ? 'email' : 'manual',
            // Preview of the rejection content
            content: r.content ? (r.content.length > 100 ? r.content.substring(0, 100) + "..." : r.content) : "",
            timestamp: r.timestamp || r.createdAt,
        }));

        // Calculate streak (days with at least one rejection in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRejectionsForStreak = user.rejections.filter(r => {
            const date = new Date(r.timestamp || r.createdAt);
            return date >= thirtyDaysAgo;
        });
        const uniqueDays = new Set(
            recentRejectionsForStreak.map(r => {
                const date = new Date(r.timestamp || r.createdAt);
                return date.toISOString().split('T')[0];
            })
        ).size;

        res.json({
            success: true,
            profile: {
                name: user.name,
                username: user.username,
                memberSince: user.createdAt,
                stats: {
                    totalRejections: rejectionCount,
                    resilienceLevel: resilience.level,
                    resilienceColor: resilience.color,
                    growthPoints: resilience.points,
                    activeStreak: uniqueDays,
                },
                recentRejections,
            }
        });
    } catch (error) {
        console.error("Error fetching public profile:", error);
        res.status(500).json({ success: false, message: "Error fetching profile." });
    }
});

/**
 * GET /api/public/rejection/:id
 * Get public rejection details by ID
 */
router.get("/rejection/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Find rejection by ID with user info
        const rejection = await prisma.rejection.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        rejections: {
                            select: { id: true }
                        }
                    }
                }
            }
        });

        if (!rejection) {
            return res.status(404).json({ success: false, message: "Rejection not found." });
        }

        // Calculate user's resilience level
        const userRejectionCount = rejection.user.rejections.length;
        const resilience = calculateResilienceLevel(userRejectionCount);

        res.json({
            success: true,
            rejection: {
                id: rejection.id,
                title: rejection.title,
                content: rejection.content,
                source: rejection.emailId ? 'email' : 'manual',
                sender: rejection.sender,
                emailId: rejection.emailId,
                timestamp: rejection.timestamp,
                reason: rejection.reason,
                createdAt: rejection.createdAt,
                user: {
                    name: rejection.user.name,
                    username: rejection.user.username,
                    totalRejections: userRejectionCount,
                    resilienceLevel: resilience.level,
                    resilienceColor: resilience.color,
                }
            }
        });
    } catch (error) {
        console.error("Error fetching public rejection:", error);
        res.status(500).json({ success: false, message: "Error fetching rejection." });
    }
});

/**
 * GET /api/public/search?q=query
 * Search for users by username or name
 */
router.get("/search", async (req, res) => {
    const { q } = req.query;

    try {
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.json({ success: true, users: [] });
        }

        const searchQuery = q.trim().toLowerCase();

        // Search users by username or name (case insensitive)
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        username: {
                            not: null
                        }
                    },
                    {
                        OR: [
                            {
                                username: {
                                    contains: searchQuery,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                name: {
                                    contains: searchQuery,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                createdAt: true,
                rejections: {
                    select: { id: true }
                }
            },
            take: 10, // Limit to 10 results
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format results with resilience info
        const results = users.map(user => {
            const rejectionCount = user.rejections.length;
            const resilience = calculateResilienceLevel(rejectionCount);

            return {
                id: user.id,
                name: user.name,
                username: user.username,
                totalRejections: rejectionCount,
                resilienceLevel: resilience.level,
                resilienceColor: resilience.color,
                memberSince: user.createdAt,
            };
        });

        res.json({ success: true, users: results });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ success: false, message: "Error searching users." });
    }
});

export default router;
