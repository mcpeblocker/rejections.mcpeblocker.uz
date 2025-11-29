/**
 * User routes
 * Handles user profile operations and avatar management
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, email, avatar_level, avatar_image, rejection_count, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarLevel: user.avatar_level,
      avatarImage: user.avatar_image,
      rejectionCount: user.rejection_count,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * GET /api/users/search
 * Search users by username (authenticated)
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await db.query(
      `SELECT id, username, avatar_level, avatar_image, rejection_count
       FROM users 
       WHERE username ILIKE $1
       ORDER BY rejection_count DESC
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json({
      users: result.rows.map(user => ({
        id: user.id,
        username: user.username,
        avatarLevel: user.avatar_level,
        avatarImage: user.avatar_image,
        rejectionCount: user.rejection_count
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * GET /api/users/public/:username
 * Get public profile by username (no authentication required)
 */
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Get user basic info
    const userResult = await db.query(
      `SELECT id, username, avatar_level, avatar_image, rejection_count, created_at
       FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's badges
    const badgesResult = await db.query(
      `SELECT badge_name, badge_description, badge_icon, unlocked_at
       FROM badges
       WHERE user_id = $1
       ORDER BY unlocked_at DESC`,
      [user.id]
    );

    // Get user's rejection stats
    const statsResult = await db.query(
      `SELECT 
         COUNT(*) as total_rejections,
         COUNT(DISTINCT rejection_type) as types_count,
         MIN(rejection_date) as first_rejection,
         MAX(rejection_date) as latest_rejection
       FROM rejections
       WHERE user_id = $1`,
      [user.id]
    );

    // Get rejection type breakdown
    const typesResult = await db.query(
      `SELECT rejection_type, COUNT(*) as count
       FROM rejections
       WHERE user_id = $1
       GROUP BY rejection_type
       ORDER BY count DESC`,
      [user.id]
    );

    const stats = statsResult.rows[0];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        avatarLevel: user.avatar_level,
        avatarImage: user.avatar_image,
        rejectionCount: user.rejection_count,
        memberSince: user.created_at
      },
      badges: badgesResult.rows,
      stats: {
        totalRejections: parseInt(stats.total_rejections),
        typesCount: parseInt(stats.types_count),
        firstRejection: stats.first_rejection,
        latestRejection: stats.latest_rejection,
        byType: typesResult.rows
      }
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
});

/**
 * GET /api/users/suggested
 * Get suggested users to follow (sorted by rejection count)
 * Public endpoint for search page suggestions
 */
router.get('/suggested', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    const result = await db.query(
      `SELECT 
        u.id, 
        u.username, 
        u.full_name,
        u.bio,
        u.avatar_url,
        u.avatar_level, 
        u.avatar_image,
        u.rejection_count
       FROM users u
       WHERE u.rejection_count > 0
       ORDER BY u.rejection_count DESC, u.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      users: result.rows.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        avatarLevel: user.avatar_level,
        avatarImage: user.avatar_image,
        rejectionCount: parseInt(user.rejection_count)
      }))
    });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ error: 'Failed to fetch suggested users' });
  }
});

/**
 * GET /api/users/leaderboard
 * Get top users by rejection count (public route for leaderboard page)
 * IMPORTANT: Must be before /:id route to avoid being caught as a parameter
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const period = req.query.period || 'all'; // all, month, week

    let dateFilter = '';
    if (period === 'month') {
      dateFilter = "AND r.created_at >= NOW() - INTERVAL '30 days'";
    } else if (period === 'week') {
      dateFilter = "AND r.created_at >= NOW() - INTERVAL '7 days'";
    }

    const result = await db.query(
      `SELECT 
        u.id, 
        u.username, 
        u.full_name,
        u.bio,
        u.avatar_url,
        u.avatar_level, 
        u.avatar_image,
        COUNT(DISTINCT r.id) as rejection_count,
        COUNT(DISTINCT CASE WHEN r.status = 'converted_to_success' THEN r.id END) as success_count
       FROM users u
       LEFT JOIN rejections r ON u.id = r.user_id ${dateFilter}
       GROUP BY u.id, u.username, u.full_name, u.bio, u.avatar_url, u.avatar_level, u.avatar_image
       HAVING COUNT(DISTINCT r.id) > 0
       ORDER BY rejection_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows.map(user => ({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      avatar_level: user.avatar_level,
      avatar_image: user.avatar_image,
      rejection_count: parseInt(user.rejection_count),
      success_count: parseInt(user.success_count)
    })));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (for social features)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, avatar_level, avatar_image, rejection_count, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      avatarLevel: user.avatar_level,
      avatarImage: user.avatar_image,
      rejectionCount: user.rejection_count,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/users/avatar
 * Update user avatar (called after milestones)
 */
router.put('/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarLevel, avatarImage } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET avatar_level = COALESCE($1, avatar_level),
           avatar_image = COALESCE($2, avatar_image),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, username, avatar_level, avatar_image, rejection_count`,
      [avatarLevel, avatarImage, req.userId]
    );

    res.json({
      message: 'Avatar updated! 🎨',
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        avatarLevel: result.rows[0].avatar_level,
        avatarImage: result.rows[0].avatar_image,
        rejectionCount: result.rows[0].rejection_count
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

/**
 * GET /api/users/list/leaderboard
 * Get top users by rejection count (for authenticated users - dashboard)
 */
router.get('/list/leaderboard', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await db.query(
      `SELECT id, username, avatar_level, avatar_image, rejection_count
       FROM users
       ORDER BY rejection_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      leaderboard: result.rows.map(user => ({
        id: user.id,
        username: user.username,
        avatarLevel: user.avatar_level,
        avatarImage: user.avatar_image,
        rejectionCount: user.rejection_count
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/users/badges
 * Get user's unlocked badges
 */
router.get('/badges/list', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, badge_name, badge_description, badge_icon, unlocked_at
       FROM badges
       WHERE user_id = $1
       ORDER BY unlocked_at DESC`,
      [req.userId]
    );

    res.json({
      badges: result.rows.map(badge => ({
        id: badge.id,
        name: badge.badge_name,
        description: badge.badge_description,
        icon: badge.badge_icon,
        unlockedAt: badge.unlocked_at
      }))
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

module.exports = router;
