# Quick Start Guide 🚀

## 1. Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)
- 5 minutes of your time

## 2. Launch the Platform

```bash
# Navigate to project directory
cd /home/mcpeblocker/Projects/rejections.mcpeblocker.uz

# Start everything with one command
docker-compose up --build
```

Wait for the services to start (usually 2-3 minutes on first run).

## 3. Access the App

Open your browser and go to: **http://localhost:3000**

## 4. Create Your Account

1. Click **"Sign Up"**
2. Choose a username (at least 3 characters)
3. Enter your email
4. Create a password (at least 6 characters)
5. Click **"Sign Up 🎯"**

## 5. Log Your First Rejection! 🎯

1. Click **"Log New Rejection"**
2. Fill in the details:
   - **Title**: e.g., "Software Engineer at TechCorp"
   - **Type**: Choose from dropdown (Job Application, Dating, etc.)
   - **Date**: When did it happen?
   - **Notes** (optional): What happened?
   - **Reflection** (optional): What did you learn?
3. Click **"🎯 Log This Rejection"**
4. Celebrate! 🎉 You earned your first badge!

## 6. Explore Features

### Dashboard
- See your growing avatar
- View quick stats
- Check recent rejections

### Wall of Rejections
- See all rejections as colorful bricks
- Click any brick for details
- Filter by type

### Analytics
- View statistics and trends
- See milestones achieved
- Track your progress

### Profile
- View your badges
- Check your level
- See profile info

## 7. Watch Your Avatar Grow! 🐣➡️👑

Every 10 rejections = 1 new level!

- Start: 🐣 Little Chick
- Level 3: 🐶 Loyal Dog
- Level 5: 🐺 Wolf
- Level 10: 🦄 Unicorn
- Level 20: 🦁 Brave Lion
- Level 50: 👑 Legendary King

## 8. Stop the App

```bash
# Press Ctrl+C in the terminal
# Or run:
docker-compose down
```

## 9. Start Again Later

```bash
docker-compose up
# Your data persists between runs!
```

## Troubleshooting

**Can't access localhost:3000?**
- Wait a bit longer, containers need time to start
- Check if services are running: `docker-compose ps`

**Forgot password?**
- Currently no password reset (MVP)
- Create a new account or check backend logs

**Want to reset everything?**
```bash
docker-compose down -v  # Removes all data
docker-compose up --build  # Fresh start
```

## Tips for Maximum Fun 🎮

1. **Be Honest**: Log real rejections for authentic growth tracking
2. **Reflect**: Take time to write reflections - they help!
3. **Celebrate Milestones**: Each badge is an achievement
4. **Check Daily**: Watch your avatar evolve
5. **Explore**: Click around, hover on things, enjoy the animations!

---

**Remember**: Every rejection makes you stronger! 💪✨

Start your growth journey now! 🎯🚀
