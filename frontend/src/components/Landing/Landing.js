/**
 * Landing Page Component - Interactive Multi-Step Experience
 * Guides users through rejection logging with step-by-step flow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('hero');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [formStep, setFormStep] = useState(1);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [rejectionForm, setRejectionForm] = useState({
    title: '',
    type: 'job',
    notes: ''
  });
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    // Migrate old localStorage data from snake_case to camelCase
    const localRejections = JSON.parse(localStorage.getItem('localRejections') || '[]');
    
    // Check if migration is needed (if any rejection has old snake_case fields)
    const needsMigration = localRejections.some(r => r.rejection_type || r.rejection_date || r.created_at);
    
    if (needsMigration) {
      console.log('🔄 Migrating localStorage data to new format...');
      const migratedRejections = localRejections.map(rejection => ({
        title: rejection.title,
        rejectionType: rejection.rejection_type || rejection.rejectionType || rejection.type || 'other',
        rejectionDate: rejection.rejection_date || rejection.rejectionDate || new Date().toISOString().split('T')[0],
        notes: rejection.notes || '',
        id: rejection.id || Date.now(),
        createdAt: rejection.created_at || rejection.createdAt || new Date().toISOString()
      }));
      
      localStorage.setItem('localRejections', JSON.stringify(migratedRejections));
      console.log('✅ Migration complete:', migratedRejections);
      setRejectionCount(migratedRejections.length);
    } else {
      setRejectionCount(localRejections.length);
    }
  }, []);

  const handleRejectionSubmit = () => {
    // Validate form has required data
    if (!rejectionForm.title || !rejectionForm.title.trim()) {
      alert('Please enter a title for your rejection');
      return;
    }
    
    const localRejections = JSON.parse(localStorage.getItem('localRejections') || '[]');
    const newRejection = {
      title: rejectionForm.title.trim(),
      rejectionType: rejectionForm.type || 'other',
      rejectionDate: new Date().toISOString().split('T')[0],
      notes: rejectionForm.notes || '',
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    console.log('💾 Saving rejection to localStorage:', newRejection);
    localRejections.push(newRejection);
    localStorage.setItem('localRejections', JSON.stringify(localRejections));
    setRejectionCount(localRejections.length);
    
    // Reset form and show auth modal
    setRejectionForm({ title: '', type: 'job', notes: '' });
    setFormStep(1);
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authMode === 'login' 
          ? { email: authForm.email, password: authForm.password }
          : authForm
        )
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Sync local rejections
        const syncCount = await syncLocalRejections(data.token);
        
        // Show success message if rejections were synced
        if (syncCount > 0) {
          console.log(`✅ Successfully synced ${syncCount} rejection(s) to your account!`);
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        alert(data.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      alert('Failed to authenticate. Please check your connection and try again.');
    }
  };

  const syncLocalRejections = async (token) => {
    const localRejections = JSON.parse(localStorage.getItem('localRejections') || '[]');
    console.log('📦 Starting sync with rejections:', localRejections);
    
    if (localRejections.length === 0) return 0;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      let syncedCount = 0;
      let failedCount = 0;
      
      for (const rejection of localRejections) {
        // Extract and validate data (support both old snake_case and new camelCase)
        // Use helper function to get first non-empty value
        const getFirstValid = (...values) => values.find(v => v && v.trim && v.trim() !== '') || values.find(v => v) || '';
        
        const title = rejection.title?.trim() || '';
        const rejectionType = getFirstValid(rejection.rejectionType, rejection.rejection_type, rejection.type) || 'other';
        const rejectionDate = getFirstValid(rejection.rejectionDate, rejection.rejection_date) || new Date().toISOString().split('T')[0];
        const notes = rejection.notes?.trim() || '';
        
        // Skip if no title
        if (!title) {
          console.warn('⚠️ Skipping rejection with no title:', rejection);
          continue;
        }
        
        const payload = {
          title,
          rejectionType,
          rejectionDate,
          notes,
          source: 'landing-page'
        };
        
        console.log('📤 Sending rejection:', payload);
        console.log('📤 Original rejection from localStorage:', rejection);
        
        const response = await fetch(`${API_URL}/api/rejections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          syncedCount++;
          console.log('✅ Synced:', rejection.title);
        } else {
          failedCount++;
          const errorText = await response.text();
          console.error('❌ Failed to sync:', rejection.title, errorText);
        }
      }
      
      // Only clear local storage if ALL rejections synced successfully
      if (failedCount === 0) {
        localStorage.removeItem('localRejections');
        console.log('🧹 Cleared local storage');
      } else {
        console.warn(`⚠️ ${failedCount} rejection(s) failed to sync. Keeping in localStorage.`);
      }
      
      return syncedCount;
    } catch (err) {
      console.error('Sync error:', err);
      // Don't fail authentication if sync fails
      return 0;
    }
  };

  const calculateSuccessRate = (count) => {
    // Fun algorithm: success rate increases with rejections
    const base = 10;
    const increase = Math.min(count * 5, 70);
    return Math.min(base + increase, 95);
  };

  const rejectionTypes = [
    { id: 'job', emoji: '💼', label: 'Job Application' },
    { id: 'university', emoji: '🎓', label: 'University' },
    { id: 'scholarship', emoji: '📚', label: 'Scholarship' },
    { id: 'visa', emoji: '✈️', label: 'Visa' },
    { id: 'grant', emoji: '💰', label: 'Grant/Funding' },
    { id: 'proposal', emoji: '📝', label: 'Project Proposal' },
    { id: 'other', emoji: '🎯', label: 'Other' }
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="nav-logo">🎯 Rejection Platform</div>
          <div className="nav-links">
            <button onClick={() => navigate('/login')} className="nav-link">Sign In</button>
            <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="nav-btn">
              Get Started
            </button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            ✨ Track Every Rejection, Celebrate Every Win
          </motion.div>

          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Rejection Into Your
            <br />
            <span className="highlight">Greatest Asset</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Every successful person has faced countless rejections. The difference? 
            They tracked, learned, and grew from each one.
          </motion.p>

          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button 
              className="btn-primary btn-hero"
              onClick={() => {
                document.getElementById('rejection-form-section').scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              Start Tracking Now
            </button>
            <button 
              className="btn-ghost btn-hero"
              onClick={() => navigate('/profile/mcpeblocker')}
            >
              See Example Profile
            </button>
          </motion.div>

          {/* Floating Metrics */}
          <motion.div 
            className="floating-metrics"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="metric-card">
              <div className="metric-value">10,247</div>
              <div className="metric-label">Rejections Logged</div>
            </div>
            <div className="metric-card highlight-card">
              <div className="metric-value">{calculateSuccessRate(rejectionCount)}%</div>
              <div className="metric-label">Your Success Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">2,150+</div>
              <div className="metric-label">Success Stories</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="scroll-text">Scroll to explore</div>
          <motion.div 
            className="scroll-arrow"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ↓
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Interactive Stats Section */}
      <motion.section 
        className="stats-interactive-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-custom">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The More You Try, The Closer You Get
          </motion.h2>

          {/* Success Rate Calculator */}
          <motion.div 
            className="success-calculator"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="calculator-display">
              <div className="calc-left">
                <div className="calc-label">Rejections So Far</div>
                <div className="calc-value">{rejectionCount}</div>
              </div>
              <div className="calc-arrow">→</div>
              <div className="calc-right">
                <div className="calc-label">Success Probability</div>
                <div className="calc-value highlight">{calculateSuccessRate(rejectionCount)}%</div>
              </div>
            </div>
            
            {/* Interactive Slider */}
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={rejectionCount}
                onChange={(e) => setRejectionCount(parseInt(e.target.value))}
                className="rejection-slider"
              />
              <div className="slider-labels">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100+</span>
              </div>
            </div>

            <div className="progress-visual">
              <motion.div 
                className="progress-fill"
                style={{ width: `${calculateSuccessRate(rejectionCount)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="calc-insight">
              {rejectionCount === 0 
                ? "Move the slider to see how rejection count affects your success rate!"
                : rejectionCount < 10
                ? `Just ${rejectionCount} rejection${rejectionCount > 1 ? 's' : ''}? Keep going - you're building resilience!`
                : rejectionCount < 20
                ? `${rejectionCount} rejections = ${calculateSuccessRate(rejectionCount)}% success rate. You're on the right track!`
                : `Wow! ${rejectionCount} rejections means you're ${calculateSuccessRate(rejectionCount)}% likely to succeed. That's persistence!`}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-custom">
          <h2 className="section-title">Everything You Need to Grow</h2>
        
          <div className="features-grid">
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8 }}
          >
            <div className="feature-icon">📊</div>
            <h3>Visual Analytics</h3>
            <p>Track your journey with beautiful charts, insights, and an evolving avatar that grows with you</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <div className="feature-icon">🏆</div>
            <h3>Milestone Rewards</h3>
            <p>Unlock achievements and badges as you hit key milestones on your journey to success</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8 }}
          >
            <div className="feature-icon">🧱</div>
            <h3>Rejection Wall</h3>
            <p>Build a visual monument of your persistence with an interactive 3D wall of rejections</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8 }}
          >
            <div className="feature-icon">🤝</div>
            <h3>Community Support</h3>
            <p>Connect with fellow rejection warriors, share stories, and celebrate wins together</p>
          </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Step-by-Step Rejection Form */}
      <motion.section 
        id="rejection-form-section" 
        className="form-interactive-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container-custom">
          <div className="form-header">
            <span className="form-badge">Try It Now</span>
            <h2>Log Your First Rejection</h2>
            <p>See how tracking rejections builds your success story</p>
          </div>

          <div className="form-interactive-card">
            {formStep === 1 && (
              <motion.div 
                className="form-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3>What type of rejection was it?</h3>
                <div className="rejection-type-grid">
                  {rejectionTypes.map(type => (
                    <button
                      key={type.id}
                      className="rejection-type-button"
                      onClick={() => {
                        setRejectionForm({ ...rejectionForm, type: type.id });
                        setFormStep(2);
                      }}
                    >
                      <span className="type-emoji">{type.emoji}</span>
                      <span className="type-label">{type.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {formStep === 2 && (
              <motion.div 
                className="form-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3>Tell us more (optional)</h3>
                <textarea
                  className="rejection-notes"
                  placeholder="What happened? What did you learn?"
                  value={rejectionForm.notes}
                  onChange={(e) => setRejectionForm({ ...rejectionForm, notes: e.target.value })}
                  rows={4}
                />
                <div className="form-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setFormStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => setFormStep(3)}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {formStep === 3 && (
              <motion.div 
                className="form-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3>One more thing...</h3>
                <input
                  type="text"
                  className="rejection-title"
                  placeholder="Give it a title (e.g., 'Google SWE Internship')"
                  value={rejectionForm.title}
                  onChange={(e) => setRejectionForm({ ...rejectionForm, title: e.target.value })}
                />
                <div className="form-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setFormStep(2)}
                  >
                    Back
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleRejectionSubmit}
                    disabled={!rejectionForm.title.trim()}
                  >
                    Log Rejection
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.div 
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Success Stories</h2>
        
        <div className="testimonials-grid">
          <motion.div 
            className="testimonial-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="testimonial-quote">
              After 127 rejections, I landed my dream job at a FAANG company. 
              This platform kept me motivated through it all!
            </p>
            <div className="testimonial-author">Sarah K., Software Engineer</div>
          </motion.div>

          <motion.div 
            className="testimonial-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="testimonial-quote">
              Tracking rejections made me realize how persistent I was. 
              Now I'm proud of every 'no' that led to my success.
            </p>
            <div className="testimonial-author">Michael R., Startup Founder</div>
          </motion.div>

          <motion.div 
            className="testimonial-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="testimonial-quote">
              The gamification made rejection fun! I competed with friends 
              and we all ended up achieving our goals.
            </p>
            <div className="testimonial-author">Priya M., Graduate Student</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Profile Suggestions (only shown if user skips auth) */}
      {currentStep === 'suggestions' && (
        <motion.section 
          className="profile-suggestions-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container-custom">
            <div className="suggestions-header">
              <h2>Explore Success Stories</h2>
              <p>See how others turned rejections into achievements</p>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-badge">Most Active</div>
              <div className="suggestion-content">
                <h3>Check out inspiring profiles</h3>
                <p>Browse successful rejection warriors and learn from their journeys</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/leaderboard')}
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container-custom">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>rejections.mcpeblocker.uz</h3>
              <p>Turn your rejections into stepping stones</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#rejection-form-section">Try It</a>
                <a href="/leaderboard">Leaderboard</a>
              </div>
              <div className="footer-section">
                <h4>Connect</h4>
                <a href="https://github.com/mcpeblocker" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://t.me/mcpeblocker" target="_blank" rel="noopener noreferrer">Telegram</a>
                <a href="mailto:mcpeblocker@gmail.com">Email</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Built with ❤️ by <a href="https://github.com/mcpeblocker" target="_blank" rel="noopener noreferrer">mcpeblocker</a></p>
            <p className="footer-year">© 2024 rejections.mcpeblocker.uz</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <motion.div 
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div 
            className="auth-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Welcome Back!' : 'Great Start! 🎉'}</h2>
              <p>
                {authMode === 'login' 
                  ? 'Sign in to sync your rejections' 
                  : rejectionCount > 0
                    ? `Save your progress and track ${rejectionCount} rejection${rejectionCount > 1 ? 's' : ''}`
                    : 'Create an account to start your journey'}
              </p>
              {rejectionCount > 0 && (
                <div className="rejection-count-badge">
                  📊 {rejectionCount} rejection{rejectionCount > 1 ? 's' : ''} ready to sync to your account
                </div>
              )}
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
              
              <button type="submit" className="btn-primary">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button 
              className="btn-google"
              onClick={() => {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                window.location.href = `${API_URL}/api/auth/google`;
              }}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <div className="auth-toggle">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setAuthMode('signup')}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setAuthMode('login')}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <button 
              className="skip-button"
              onClick={() => {
                setShowAuthModal(false);
                setCurrentStep('suggestions');
              }}
            >
              Skip for now
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Landing;
