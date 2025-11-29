# 🎯 Gamified Rejection Platform MVP

Turn your rejections into stepping stones! A playful, gamified platform that helps you log rejections, track growth, and celebrate resilience.

## ✨ Features

### 🔐 User Authentication
- Email-based signup and login
- JWT-based authentication
- Secure password hashing

### 📝 Rejection Logging
- Manual rejection logging with rich details
- Multiple rejection types (Job Applications, Dating, Proposals, etc.)
- Personal notes and reflections
- Date tracking

### 🎮 Gamification
- **Avatar System**: Your character grows with each rejection logged
  - 10+ unique avatar stages (from 🐣 Little Chick to 👑 Legendary King)
  - Visual evolution based on rejection count
  - Interactive animations and celebrations
- **Milestones & Badges**: Unlock achievements at key rejection counts
  - 🎯 First Step (1 rejection)
  - 🔟 Double Digits (10 rejections)
  - 💯 Century Club (100 rejections)
  - And more!
- **Level System**: Gain levels every 10 rejections
- **Confetti Celebrations**: Celebrate your progress!

### 🧱 Wall of Rejections
- Interactive 2.5D brick wall displaying all rejections
- Each rejection is a colorful brick
- Hover effects and click-to-view details
- Filter by rejection type
- Beautiful animations powered by Framer Motion

### 📊 Analytics & Insights
- Total rejection count and statistics
- Breakdown by rejection type
- Monthly activity trends
- Milestone tracking
- AI insights (placeholder for future integration)

### 👤 User Profile
- View avatar and level
- Badge collection display
- Profile statistics
- Quick access to all features

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API
- **PostgreSQL**: Relational database
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Frontend
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations
- **React Confetti**: Celebration effects
- **Axios**: API requests

### DevOps
- **Docker** + **Docker Compose**: Containerization
- **PostgreSQL 15**: Database container
- Hot-reload development environment

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)
- Ports 3000, 5000, and 5432 available

### Installation & Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd /home/mcpeblocker/Projects/rejections.mcpeblocker.uz
   ```

2. **Create environment file** (optional - defaults are set in docker-compose.yml)
   ```bash
   cp .env.example .env
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the backend API container
   - Build the frontend React app container
   - Start PostgreSQL database
   - Initialize database with schema
   - Start all services

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

5. **Create your account**
   - Navigate to http://localhost:3000
   - Click "Sign Up"
   - Create your account
   - Start logging rejections!

### First Time Setup

The database will automatically initialize with the required tables. On first run:

1. Sign up for a new account
2. Log your first rejection (you'll earn your first badge! 🎯)
3. Watch your avatar grow as you log more rejections
4. Explore the Wall of Rejections to see your progress
5. Check Analytics for insights

## 📁 Project Structure

```
rejections.mcpeblocker.uz/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── database.js     # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Login/signup routes
│   │   ├── users.js        # User profile routes
│   │   ├── rejections.js   # CRUD for rejections
│   │   └── analytics.js    # Stats and insights
│   ├── init.sql            # Database schema
│   ├── server.js           # Express app entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/          # Login/Signup
│   │   │   ├── Dashboard/      # Main dashboard
│   │   │   ├── Avatar/         # Gamified avatar
│   │   │   ├── Rejections/     # Form & Wall
│   │   │   ├── Analytics/      # Stats & insights
│   │   │   └── Profile/        # User profile
│   │   ├── utils/
│   │   │   └── api.js         # API utilities
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   └── index.js           # React entry point
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
├── .gitignore
├── .env.example
└── README.md
```

## 🎯 Core Features Explained

### Avatar Growth System

Your avatar evolves through 10+ stages:
1. 🐣 Little Chick (Start)
2. 🐶 Loyal Dog (3+ rejections)
3. 🐺 Wolf (5+ rejections)
4. 🐯 Tiger (7+ rejections)
5. 🦄 Unicorn (10+ rejections)
6. 🐉 Dragon Warrior (15+ rejections)
7. 🦁 Brave Lion (20+ rejections)
8. 🚀 Space Explorer (30+ rejections)
9. 🦸 Super Hero (40+ rejections)
10. 👑 Legendary King (50+ rejections)

**Level Up**: Gain 1 level every 10 rejections!

### Milestone System

Earn badges at key milestones:
- 1 rejection: 🎯 Brave Beginner
- 5 rejections: 🌱 Getting Started
- 10 rejections: 🔟 Double Digits
- 25 rejections: 🎖️ Quarter Century
- 50 rejections: 🦸 Halfway Hero
- 100 rejections: 💯 Century Club
- 250 rejections: 👑 Rejection Master
- 500 rejections: 🚀 Unstoppable Force
- 1000 rejections: ⭐ Legend

### Rejection Types

- 💼 Job Application
- 💡 Pitch/Proposal
- 💕 Dating
- 🚀 Opportunity
- 📚 Academic
- 🎨 Creative Submission
- 💰 Business Venture
- 🎯 Other

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/avatar` - Update avatar
- `GET /api/users/list/leaderboard` - Get top users
- `GET /api/users/badges/list` - Get user's badges

### Rejections
- `POST /api/rejections` - Create rejection
- `GET /api/rejections` - Get all user's rejections
- `GET /api/rejections/:id` - Get single rejection
- `PUT /api/rejections/:id` - Update rejection
- `DELETE /api/rejections/:id` - Delete rejection

### Analytics
- `GET /api/analytics/stats` - Get statistics
- `GET /api/analytics/insights` - Get AI insights

## 🔮 Future Features (TODO)

### High Priority
- [ ] **AI-Powered Reflections**: Generate insights using OpenAI/Claude
- [ ] **Gmail Integration**: Scan emails for rejection keywords (user-approved)
- [ ] **Social Features**: Connect users with similar rejection experiences
- [ ] **Avatar Interactions**: High-five, link avatars, mini-challenges
- [ ] **Export Data**: Download rejection history as CSV/PDF

### Medium Priority
- [ ] **Custom Avatar Skins**: Unlock cosmetic items
- [ ] **Streak Tracking**: Daily/weekly rejection logging streaks
- [ ] **Goal Setting**: Set rejection goals and track progress
- [ ] **Sharing**: Share milestones on social media
- [ ] **Dark Mode**: Toggle dark/light theme

### Low Priority
- [ ] **3D/AR Avatar**: View avatar in 3D space
- [ ] **Voice Logging**: Log rejections via voice input
- [ ] **Mobile Apps**: Native iOS/Android apps
- [ ] **Email Notifications**: Reminders and milestone alerts
- [ ] **Community Challenges**: Group challenges and leaderboards

## 🛡️ Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- SQL injection protection via parameterized queries
- CORS enabled for frontend-backend communication
- Environment variables for sensitive configuration

## 🐛 Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Stop existing containers
docker-compose down

# Or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

### Backend API Errors
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

## 📝 Development

### Running Without Docker (Development)

**Backend:**
```bash
cd backend
npm install
# Set environment variables
export DB_HOST=localhost
export DB_USER=rejectionuser
export DB_PASSWORD=rejectionpass
export DB_NAME=rejectiondb
export JWT_SECRET=your-secret-key
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
export REACT_APP_API_URL=http://localhost:5000
npm start
```

**Database:**
```bash
# Install PostgreSQL locally
# Create database and run init.sql
psql -U postgres -c "CREATE DATABASE rejectiondb;"
psql -U rejectionuser -d rejectiondb -f backend/init.sql
```

## 🤝 Contributing

This is an MVP. Contributions welcome! Focus areas:
- AI integration (OpenAI, Claude)
- Gmail API integration
- Social features
- UI/UX improvements
- Performance optimization

## 📄 License

MIT License - feel free to use this for personal or commercial projects!

## 🎉 Credits

Built with ❤️ for everyone who's ever faced rejection.

Remember: **Every rejection is a redirection to something better!** 💪✨

---

**Happy rejection logging!** 🎯🚀

For questions or issues, please check the logs or create an issue.
