# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security Hardening
- [ ] Change JWT_SECRET to a strong random value
- [ ] Update database credentials
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting
- [ ] Enable CORS only for your domain
- [ ] Add security headers (helmet.js)
- [ ] Set secure cookie flags
- [ ] Remove console.logs from production code

### 2. Environment Configuration
- [ ] Create production `.env` file
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up environment secrets management
- [ ] Update API URLs for production

### 3. Database
- [ ] Set up production PostgreSQL instance
- [ ] Run init.sql on production database
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Add database monitoring

### 4. Frontend Build
- [ ] Build optimized production bundle
- [ ] Minify assets
- [ ] Enable code splitting
- [ ] Add service worker (optional)
- [ ] Configure CDN for static assets (optional)

### 5. Backend Optimization
- [ ] Enable compression middleware
- [ ] Add request logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure clustering (PM2)
- [ ] Add health check endpoints

## Deployment Options

### Option 1: Docker on VPS (DigitalOcean, Linode, etc.)

**Cost**: ~$5-20/month

**Steps**:
1. Provision a VPS (Ubuntu 22.04 recommended)
2. Install Docker and Docker Compose
3. Clone repository to server
4. Update docker-compose.yml for production
5. Run `docker-compose up -d`
6. Set up Nginx reverse proxy
7. Configure SSL with Let's Encrypt

**Production docker-compose.yml**:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: db
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    restart: always

  frontend:
    build:
      context: ./frontend
      args:
        - REACT_APP_API_URL=${API_URL}
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres-data:
```

### Option 2: Heroku

**Cost**: Free tier available, ~$7-16/month for production

**Steps**:
1. Create Heroku account
2. Install Heroku CLI
3. Create two apps (frontend, backend)
4. Add PostgreSQL add-on
5. Configure environment variables
6. Deploy using Git

**Commands**:
```bash
# Backend
heroku create rejection-platform-api
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret
git subtree push --prefix backend heroku main

# Frontend
heroku create rejection-platform-app
heroku config:set REACT_APP_API_URL=https://rejection-platform-api.herokuapp.com
git subtree push --prefix frontend heroku main
```

### Option 3: AWS (ECS/Fargate)

**Cost**: ~$20-50/month

**Steps**:
1. Create ECR repositories
2. Build and push Docker images
3. Create ECS cluster
4. Set up RDS PostgreSQL instance
5. Configure task definitions
6. Set up Application Load Balancer
7. Configure Route 53 for domain

### Option 4: Vercel + Railway

**Cost**: Free tier available, ~$5-20/month

**Frontend (Vercel)**:
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Set environment variables
4. Deploy automatically on push

**Backend (Railway)**:
1. Create Railway project
2. Add PostgreSQL database
3. Deploy backend from GitHub
4. Set environment variables
5. Get production URL

### Option 5: Self-Hosted (Home Server / VPS)

**Cost**: $0-5/month (electricity/domain)

**Steps**:
1. Set up server with Ubuntu
2. Install Docker
3. Configure port forwarding
4. Set up dynamic DNS or static IP
5. Deploy with docker-compose
6. Use Cloudflare for SSL

## Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## SSL Setup (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

## Monitoring & Maintenance

### Recommended Tools:
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Logging**: Papertrail, Loggly
- **Performance**: New Relic, DataDog

### Health Checks:
```bash
# Backend health
curl https://yourdomain.com/api/health

# Database check
docker exec -it rejection-db psql -U rejectionuser -d rejectiondb -c "SELECT COUNT(*) FROM users;"
```

### Backup Strategy:
```bash
# Automated daily backups
0 2 * * * docker exec rejection-db pg_dump -U rejectionuser rejectiondb > /backups/db-$(date +\%Y\%m\%d).sql
```

## Environment Variables (Production)

```bash
# Backend
NODE_ENV=production
PORT=5000
DB_HOST=production-db-url
DB_PORT=5432
DB_USER=secure_user
DB_PASSWORD=secure_password_here
DB_NAME=rejectiondb
JWT_SECRET=super-secure-random-string-min-32-chars

# Optional AI Integration
OPENAI_API_KEY=sk-your-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend
REACT_APP_API_URL=https://yourdomain.com/api
```

## Post-Deployment

- [ ] Test all features in production
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Document deployment process
- [ ] Create rollback plan
- [ ] Set up CI/CD pipeline
- [ ] Load test the application
- [ ] Review and optimize performance
- [ ] Set up staging environment
- [ ] Create incident response plan

## Cost Estimates

| Option | Monthly Cost | Effort | Scalability |
|--------|-------------|--------|-------------|
| VPS (DigitalOcean) | $5-20 | Medium | High |
| Heroku | $7-16 | Low | Medium |
| AWS ECS | $20-50 | High | Very High |
| Vercel + Railway | $5-20 | Low | High |
| Self-Hosted | $0-5 | High | Medium |

## Scaling Considerations

### For 1-100 users:
- Single VPS or Heroku free tier
- Basic PostgreSQL instance
- No CDN needed

### For 100-1000 users:
- Load balancer with 2+ instances
- Managed PostgreSQL (RDS, Railway)
- CDN for static assets
- Redis for caching

### For 1000+ users:
- Auto-scaling container orchestration
- Multi-region deployment
- Read replicas for database
- Advanced caching strategy
- Queue system for background jobs

## Troubleshooting Production Issues

### Backend Won't Start
```bash
# Check logs
docker logs rejection-backend

# Common issues:
# - Database connection failed -> Check DB credentials
# - Port already in use -> Change PORT in .env
# - Missing dependencies -> Rebuild container
```

### Database Connection Issues
```bash
# Test connection
docker exec -it rejection-db psql -U rejectionuser -d rejectiondb

# Reset connection pool
docker restart rejection-backend
```

### Frontend Not Loading
```bash
# Check build
docker logs rejection-frontend

# Verify API URL
docker exec rejection-frontend printenv REACT_APP_API_URL
```

## Support & Updates

### Staying Updated:
- Monitor GitHub for updates
- Subscribe to security advisories
- Keep dependencies updated
- Review logs regularly

### Getting Help:
- Check documentation
- Review GitHub issues
- Community forums
- Professional support (if needed)

---

**Ready to deploy?** Choose your deployment option and follow the steps! 🚀

Good luck with your launch! 🎯✨
