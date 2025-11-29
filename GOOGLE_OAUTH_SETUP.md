# Google OAuth Setup Guide

## Quick Start: Getting Your Google OAuth Credentials

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create or Select Project
1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: "Rejection Platform" (or any name you prefer)
4. Click "Create"

### Step 3: Enable Google+ API
1. In the sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it
4. Click "Enable"

### Step 4: Create OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose "External" (for testing) or "Internal" (for organization)
3. Click "Create"

4. Fill in required fields:
   - **App name**: Rejection Platform
   - **User support email**: Your email
   - **Developer contact**: Your email
   
5. Click "Save and Continue"

6. On "Scopes" page:
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Save and Continue"

7. On "Test users" page (for External):
   - Add your email and any other test users
   - Click "Save and Continue"

8. Review and click "Back to Dashboard"

### Step 5: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"

3. Choose "Web application"

4. Configure:
   - **Name**: Rejection Platform Web Client
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3333
     http://localhost:3000
     ```
   
   - **Authorized redirect URIs**:
     ```
     http://localhost:5555/api/auth/google/callback
     http://localhost:5000/api/auth/google/callback
     ```

5. Click "Create"

### Step 6: Copy Your Credentials
You'll see a popup with:
- **Client ID**: Something like `123456789-abc...xyz.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc...xyz`

**IMPORTANT**: Copy both immediately!

### Step 7: Update .env File
Open your `.env` file and update:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5555/api/auth/google/callback
```

### Step 8: Restart Application
```bash
docker-compose down
docker-compose up --build
```

---

## Testing Google OAuth

### Test the Flow
1. Navigate to `http://localhost:3333/signup`
2. Click "Sign up with Google"
3. You should see Google's consent screen
4. Sign in with your Google account
5. Grant permissions
6. You should be redirected back to dashboard

### Troubleshooting

#### Error: "Redirect URI Mismatch"
**Cause**: The callback URL doesn't match what you configured in Google Console

**Fix**:
1. Check your `.env` file's `GOOGLE_CALLBACK_URL`
2. Make sure it matches EXACTLY one of the URIs in Google Console
3. Include the port number (e.g., `:5555`)
4. No trailing slash

#### Error: "Invalid Client"
**Cause**: Client ID or Secret is wrong

**Fix**:
1. Go back to Google Console > Credentials
2. Click on your OAuth client
3. Copy the Client ID and Secret again
4. Update `.env` file
5. Restart containers

#### Error: "Access Blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured properly

**Fix**:
1. Complete the OAuth consent screen setup
2. Add yourself as a test user (if using External)
3. Publish the app (for production)

#### Google Sign-In Button Not Appearing
**Cause**: Environment variables not loaded

**Fix**:
1. Verify `.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Restart containers: `docker-compose restart`
3. Check browser console for errors

---

## Production Deployment

### Update for Production

1. **Get Production Domain**
2. **Update Google Console**:
   - Add production URLs to authorized origins:
     ```
     https://yourdomain.com
     ```
   - Add production callback to redirect URIs:
     ```
     https://yourdomain.com/api/auth/google/callback
     ```

3. **Update .env for Production**:
   ```env
   NODE_ENV=production
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Enable HTTPS**:
   - Google OAuth requires HTTPS in production
   - Use Let's Encrypt, Cloudflare, or similar

5. **Publish OAuth App**:
   - In Google Console, change OAuth consent screen from "Testing" to "Published"
   - Submit for verification if needed (for large user base)

---

## Security Best Practices

### Protecting Your Credentials
1. ✅ Never commit `.env` to git
2. ✅ Use different credentials for dev/prod
3. ✅ Rotate secrets periodically
4. ✅ Limit OAuth scopes to minimum needed
5. ✅ Monitor usage in Google Console

### Session Security
```env
# Use strong session secret in production
SESSION_SECRET=use-a-very-long-random-string-here-minimum-32-characters

# Enable secure cookies in production
NODE_ENV=production  # This sets secure: true for cookies
```

---

## Advanced Configuration

### Add More OAuth Providers

You can add GitHub, LinkedIn, etc. using similar patterns:

1. Install Passport strategy:
   ```bash
   npm install passport-github2
   ```

2. Configure in `backend/config/passport.js`
3. Add routes in `backend/routes/auth.js`
4. Create button component in frontend

### Custom OAuth Scopes

To request additional permissions:

```javascript
// In backend/routes/auth.js
router.get('/google',
  passport.authenticate('google', { 
    scope: [
      'profile', 
      'email',
      // Add more scopes here
    ],
    session: false 
  })
);
```

---

## FAQ

**Q: Do I need a Google Cloud billing account?**  
A: No, OAuth is free. You only pay if you use other Google Cloud services.

**Q: How many users can sign in?**  
A: Unlimited. There are no quotas for OAuth authentication.

**Q: Can I use this for multiple environments?**  
A: Yes! Create separate OAuth clients for dev, staging, and production.

**Q: What if I lose my client secret?**  
A: Generate a new one in Google Console. The old one will stop working.

**Q: Can users revoke access?**  
A: Yes, users can revoke access at [myaccount.google.com/permissions](https://myaccount.google.com/permissions)

---

## Summary Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth client ID
- [ ] Added authorized redirect URIs
- [ ] Copied Client ID and Secret
- [ ] Updated `.env` file
- [ ] Restarted Docker containers
- [ ] Tested sign-in flow
- [ ] Verified user created in database

---

**Need Help?**  
Check the [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2) for more details.
