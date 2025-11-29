/**
 * Analytics routes
 * Provides statistics and insights about user's rejections
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/analytics/stats
 * Get user's rejection statistics
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Get total count
    const totalResult = await db.query(
      'SELECT COUNT(*) as total FROM rejections WHERE user_id = $1',
      [req.userId]
    );

    // Get count by type
    const typeResult = await db.query(
      `SELECT rejection_type, COUNT(*) as count
       FROM rejections
       WHERE user_id = $1
       GROUP BY rejection_type
       ORDER BY count DESC`,
      [req.userId]
    );

    // Get recent rejections (last 30 days)
    const recentResult = await db.query(
      `SELECT COUNT(*) as count
       FROM rejections
       WHERE user_id = $1 AND rejection_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [req.userId]
    );

    // Get rejections by month
    const monthlyResult = await db.query(
      `SELECT 
         TO_CHAR(rejection_date, 'YYYY-MM') as month,
         COUNT(*) as count
       FROM rejections
       WHERE user_id = $1
       GROUP BY TO_CHAR(rejection_date, 'YYYY-MM')
       ORDER BY month DESC
       LIMIT 12`,
      [req.userId]
    );

    // Get milestones
    const milestonesResult = await db.query(
      `SELECT milestone_type, milestone_count, badge_name, badge_icon, achieved_at
       FROM milestones
       WHERE user_id = $1
       ORDER BY milestone_count DESC`,
      [req.userId]
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      last30Days: parseInt(recentResult.rows[0].count),
      byType: typeResult.rows.map(r => ({
        type: r.rejection_type,
        count: parseInt(r.count)
      })),
      byMonth: monthlyResult.rows.map(r => ({
        month: r.month,
        count: parseInt(r.count)
      })),
      milestones: milestonesResult.rows.map(m => ({
        type: m.milestone_type,
        count: m.milestone_count,
        badge: m.badge_name,
        icon: m.badge_icon,
        achievedAt: m.achieved_at
      }))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/insights
 * Get AI-generated insights (placeholder for future AI integration)
 */
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    // Get user's rejections for analysis
    const result = await db.query(
      `SELECT rejection_type, COUNT(*) as count
       FROM rejections
       WHERE user_id = $1
       GROUP BY rejection_type
       ORDER BY count DESC`,
      [req.userId]
    );

    // TODO: AI-generated insights
    // This is where you would call an AI service to generate personalized insights
    // Example: const insights = await generateInsights(result.rows);

    // For now, return basic insights
    const insights = [];
    
    if (result.rows.length > 0) {
      const topType = result.rows[0];
      insights.push({
        type: 'pattern',
        message: `You've logged the most rejections in "${topType.rejection_type}" (${topType.count} times). This shows persistence in an area that matters to you! 🎯`
      });
    }

    const totalResult = await db.query(
      'SELECT rejection_count FROM users WHERE id = $1',
      [req.userId]
    );
    
    const count = totalResult.rows[0].rejection_count;
    
    if (count >= 10) {
      insights.push({
        type: 'achievement',
        message: `You've logged ${count} rejections! Each one is a step toward your goals. Keep going! 🚀`
      });
    }

    res.json({
      insights,
      note: 'AI-powered insights coming soon! 🤖'
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

module.exports = router;
