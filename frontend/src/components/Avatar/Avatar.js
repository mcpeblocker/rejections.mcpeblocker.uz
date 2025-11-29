/**
 * Avatar Component
 * Displays gamified character that grows with rejections
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Avatar.css';

function Avatar({ level, rejectionCount, onCelebration }) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Avatar stages based on level
  const getAvatarStage = () => {
    if (level >= 50) return { emoji: '👑', name: 'Legendary King', color: '#FFD700' };
    if (level >= 40) return { emoji: '🦸', name: 'Super Hero', color: '#FF6B6B' };
    if (level >= 30) return { emoji: '🚀', name: 'Space Explorer', color: '#4ECDC4' };
    if (level >= 20) return { emoji: '🦁', name: 'Brave Lion', color: '#F7B731' };
    if (level >= 15) return { emoji: '🐉', name: 'Dragon Warrior', color: '#5F27CD' };
    if (level >= 10) return { emoji: '🦄', name: 'Unicorn', color: '#FF6348' };
    if (level >= 7) return { emoji: '🐯', name: 'Tiger', color: '#FFA502' };
    if (level >= 5) return { emoji: '🐺', name: 'Wolf', color: '#747D8C' };
    if (level >= 3) return { emoji: '🐶', name: 'Loyal Dog', color: '#A4B0BE' };
    return { emoji: '🐣', name: 'Little Chick', color: '#FFC312' };
  };

  const avatarStage = getAvatarStage();

  // Calculate size based on level
  const avatarSize = Math.min(80 + level * 5, 200);

  useEffect(() => {
    // Trigger animation on level change
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [level]);

  const handleAvatarClick = () => {
    if (onCelebration) {
      onCelebration();
    }
  };

  return (
    <div className="avatar-container">
      <motion.div 
        className={`avatar ${isAnimating ? 'avatar-level-up' : ''}`}
        style={{ 
          width: avatarSize, 
          height: avatarSize,
          background: `linear-gradient(135deg, ${avatarStage.color}40, ${avatarStage.color}80)`
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAvatarClick}
        animate={isAnimating ? {
          scale: [1, 1.3, 1],
          rotate: [0, 360, 0]
        } : {}}
        transition={{ duration: 1 }}
      >
        <span className="avatar-emoji" style={{ fontSize: `${avatarSize * 0.6}px` }}>
          {avatarStage.emoji}
        </span>
      </motion.div>

      <div className="avatar-badge" style={{ background: avatarStage.color }}>
        Level {level}
      </div>

      <div className="avatar-name">{avatarStage.name}</div>

      {/* Particle effects for higher levels */}
      {level >= 10 && (
        <div className="avatar-particles">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [-20, -60],
                opacity: [1, 0],
                scale: [1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}

      {/* Achievement milestones */}
      <div className="avatar-achievements">
        {rejectionCount >= 1 && <span className="achievement-badge">🎯 First Step</span>}
        {rejectionCount >= 10 && <span className="achievement-badge">🔟 Double Digits</span>}
        {rejectionCount >= 50 && <span className="achievement-badge">🏆 Champion</span>}
        {rejectionCount >= 100 && <span className="achievement-badge">💯 Century Club</span>}
      </div>

      <div className="avatar-tooltip">
        Click me for celebration! 🎉
      </div>
    </div>
  );
}

export default Avatar;
