/**
 * Passport Google OAuth Configuration
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        // User exists, return user
        return done(null, existingUser.rows[0]);
      }

      // Check if email already exists
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (email) {
        const emailExists = await db.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        if (emailExists.rows.length > 0) {
          // Link Google account to existing user
          const updatedUser = await db.query(
            'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
            [profile.id, email]
          );
          return done(null, updatedUser.rows[0]);
        }
      }

      // Create new user
      const username = profile.displayName || `user_${profile.id.substring(0, 8)}`;
      const newUser = await db.query(
        `INSERT INTO users (username, email, google_id, password_hash, avatar_level, avatar_image, rejection_count)
         VALUES ($1, $2, $3, $4, 1, 'avatar-1.png', 0)
         RETURNING id, username, email, google_id, avatar_level, avatar_image, rejection_count, created_at`,
        [username, email, profile.id, '']
      );

      done(null, newUser.rows[0]);
    } catch (err) {
      console.error('Google OAuth error:', err);
      done(err, null);
    }
  }
  ));
} else {
  console.warn('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing');
  console.warn('   Google sign-in will not be available. See GOOGLE_OAUTH_SETUP.md for setup instructions.');
}

module.exports = passport;
