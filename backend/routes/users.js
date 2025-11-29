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
 * GET /api/users/leaderboard
 * Get top users by rejection count (for social features)
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
