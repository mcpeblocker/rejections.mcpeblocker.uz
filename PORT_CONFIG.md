# 🔧 Port Configuration Guide

## How to Change Ports

All ports are now easily configurable through the `.env` file!

### Default Ports
- **Frontend**: 3000
- **Backend**: 5000
- **Database**: 5432

### Changing Ports

1. **Edit the `.env` file** in the project root:
   ```bash
   # Change these values to your desired ports
   FRONTEND_PORT=3000
   BACKEND_PORT=5000
   ```

2. **Update the API URL** if you change the backend port:
   ```bash
   REACT_APP_API_URL=http://localhost:YOUR_BACKEND_PORT
   ```

3. **Restart the containers**:
   ```bash
   docker-compose down
   docker-compose up
   ```

### Example: Using Different Ports

If ports 3000 or 5000 are already in use, edit `.env`:

```bash
# Use different ports
FRONTEND_PORT=3001
BACKEND_PORT=5001
REACT_APP_API_URL=http://localhost:5001
```

Then access:
- Frontend: http://localhost:3001
- Backend: http://localhost:5001

### How It Works

The `docker-compose.yml` uses environment variable substitution:

```yaml
ports:
  - "${FRONTEND_PORT:-3000}:3000"  # Maps your chosen port to container's 3000
  - "${BACKEND_PORT:-5000}:5000"   # Maps your chosen port to container's 5000
```

The `:-` syntax provides default values if the variable isn't set.

### Port Conflicts?

If you get an error like "port already in use":

1. Check what's using the port:
   ```bash
   # On Linux/Mac
   lsof -i :3000
   lsof -i :5000
   
   # On Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   ```

2. Either stop the conflicting service or change the port in `.env`

### Internal vs External Ports

- **External Port** (left side): The port on your host machine (configurable via .env)
- **Internal Port** (right side): The port inside the container (fixed: 3000 for frontend, 5000 for backend)

Example: `"${FRONTEND_PORT:-3000}:3000"` means:
- Access on host: `localhost:${FRONTEND_PORT}` (default 3000)
- Container listens on: `3000` (always)

This allows you to map any host port to the containers without changing application code!
