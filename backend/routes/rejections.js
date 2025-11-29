/**
 * Rejection routes
 * Handles CRUD operations for rejections
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Helper function to check and award milestones
async function checkMilestones(userId, rejectionCount) {
  const milestones = [
    { count: 1, name: 'First Rejection', badge: 'Brave Beginner', icon: '🎯' },
    { count: 5, name: '5 Rejections', badge: 'Getting Started', icon: '🌱' },
    { count: 10, name: '10 Rejections', badge: 'Double Digits', icon: '🔟' },
    { count: 25, name: '25 Rejections', badge: 'Quarter Century', icon: '🎖️' },
    { count: 50, name: '50 Rejections', badge: 'Halfway Hero', icon: '🦸' },
    { count: 100, name: '100 Rejections', badge: 'Century Club', icon: '💯' },
    { count: 250, name: '250 Rejections', badge: 'Rejection Master', icon: '👑' },
    { count: 500, name: '500 Rejections', badge: 'Unstoppable Force', icon: '🚀' },
    { count: 1000, name: '1000 Rejections', badge: 'Legend', icon: '⭐' }
  ];

  const earnedMilestones = [];

  for (const milestone of milestones) {
    if (rejectionCount === milestone.count) {
      // Check if milestone already exists
      const existing = await db.query(
        'SELECT id FROM milestones WHERE user_id = $1 AND milestone_count = $2',
        [userId, milestone.count]
      );

      if (existing.rows.length === 0) {
        // Create milestone
        await db.query(
          `INSERT INTO milestones (user_id, milestone_type, milestone_count, badge_name, badge_icon)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, milestone.name, milestone.count, milestone.badge, milestone.icon]
        );

        // Create badge
        await db.query(
          `INSERT INTO badges (user_id, badge_name, badge_description, badge_icon)
           VALUES ($1, $2, $3, $4)`,
          [userId, milestone.badge, `Earned for reaching ${milestone.count} rejections`, milestone.icon]
        );

        earnedMilestones.push(milestone);
      }
    }
  }

  return earnedMilestones;
}

/**
 * POST /api/rejections
 * Create a new rejection
 */
router.post('/', authMiddleware, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('rejectionType').trim().notEmpty().withMessage('Rejection type is required'),
  body('rejectionDate').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, rejectionType, rejectionDate, notes, reflection } = req.body;

    // Insert rejection
    const result = await db.query(
      `INSERT INTO rejections (user_id, title, rejection_type, rejection_date, notes, reflection, source)
       VALUES ($1, $2, $3, $4, $5, $6, 'manual')
       RETURNING *`,
      [req.userId, title, rejectionType, rejectionDate, notes || null, reflection || null]
    );

    const rejection = result.rows[0];

    // Update user's rejection count
    const userUpdate = await db.query(
      `UPDATE users 
       SET rejection_count = rejection_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING rejection_count`,
      [req.userId]
    );

    const newCount = userUpdate.rows[0].rejection_count;

    // Check for milestones
    const milestones = await checkMilestones(req.userId, newCount);

    // Calculate new avatar level (every 10 rejections = 1 level)
    const newAvatarLevel = Math.floor(newCount / 10) + 1;
    
    if (newAvatarLevel > 1) {
      await db.query(
        `UPDATE users 
         SET avatar_level = $1,
             avatar_image = $2
         WHERE id = $3`,
        [newAvatarLevel, `avatar-${newAvatarLevel}.png`, req.userId]
      );
    }

    // TODO: AI reflection generation hook
    // This is where you would call an AI service to generate reflection
    // Example: const aiReflection = await generateAIReflection(title, notes, reflection);

    res.status(201).json({
      message: 'Rejection logged successfully! 🎯',
      rejection: {
        id: rejection.id,
        title: rejection.title,
        rejectionType: rejection.rejection_type,
        rejectionDate: rejection.rejection_date,
        notes: rejection.notes,
        reflection: rejection.reflection,
        createdAt: rejection.created_at
      },
      newRejectionCount: newCount,
      newAvatarLevel: newAvatarLevel,
      milestones: milestones
    });
  } catch (error) {
    console.error('Create rejection error:', error);
    res.status(500).json({ error: 'Failed to create rejection' });
  }
});

/**
 * GET /api/rejections
 * Get all rejections for current user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, limit, offset } = req.query;
    
    let query = `
      SELECT id, title, rejection_type, rejection_date, notes, reflection, source, created_at
      FROM rejections
      WHERE user_id = $1
    `;
    
    const params = [req.userId];
    
    // Optional filtering by type
    if (type) {
      query += ` AND rejection_type = $${params.length + 1}`;
      params.push(type);
    }
    
    query += ' ORDER BY rejection_date DESC, created_at DESC';
    
    // Optional pagination
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(parseInt(offset));
    }

    const result = await db.query(query, params);

    res.json({
      rejections: result.rows.map(r => ({
        id: r.id,
        title: r.title,
        rejectionType: r.rejection_type,
        rejectionDate: r.rejection_date,
        notes: r.notes,
        reflection: r.reflection,
        source: r.source,
        createdAt: r.created_at
      })),
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get rejections error:', error);
    res.status(500).json({ error: 'Failed to fetch rejections' });
  }
});

/**
 * GET /api/rejections/:id
 * Get single rejection by ID
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM rejections 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rejection not found' });
    }

    const r = result.rows[0];

    res.json({
      id: r.id,
      title: r.title,
      rejectionType: r.rejection_type,
      rejectionDate: r.rejection_date,
      notes: r.notes,
      reflection: r.reflection,
      aiReflection: r.ai_reflection,
      source: r.source,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (error) {
    console.error('Get rejection error:', error);
    res.status(500).json({ error: 'Failed to fetch rejection' });
  }
});

/**
 * PUT /api/rejections/:id
 * Update rejection
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, rejectionType, rejectionDate, notes, reflection } = req.body;

    const result = await db.query(
      `UPDATE rejections 
       SET title = COALESCE($1, title),
           rejection_type = COALESCE($2, rejection_type),
           rejection_date = COALESCE($3, rejection_date),
           notes = COALESCE($4, notes),
           reflection = COALESCE($5, reflection),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, rejectionType, rejectionDate, notes, reflection, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rejection not found' });
    }

    const r = result.rows[0];

    res.json({
      message: 'Rejection updated! ✏️',
      rejection: {
        id: r.id,
        title: r.title,
        rejectionType: r.rejection_type,
        rejectionDate: r.rejection_date,
        notes: r.notes,
        reflection: r.reflection,
        updatedAt: r.updated_at
      }
    });
  } catch (error) {
    console.error('Update rejection error:', error);
    res.status(500).json({ error: 'Failed to update rejection' });
  }
});

/**
 * DELETE /api/rejections/:id
 * Delete rejection
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM rejections WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rejection not found' });
    }

    // Decrement user's rejection count
    await db.query(
      `UPDATE users 
       SET rejection_count = GREATEST(rejection_count - 1, 0)
       WHERE id = $1`,
      [req.userId]
    );

    res.json({ message: 'Rejection deleted! 🗑️' });
  } catch (error) {
    console.error('Delete rejection error:', error);
    res.status(500).json({ error: 'Failed to delete rejection' });
  }
});

module.exports = router;
