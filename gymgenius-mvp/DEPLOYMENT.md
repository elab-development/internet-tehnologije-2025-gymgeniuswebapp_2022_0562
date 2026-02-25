# 🚀 Deployment Guide - GymGenius MVP v1.0.0

## Production Deployment Checklist

Complete checklist for deploying GymGenius to production on Vercel.

### ✅ Pre-Deployment Steps

- [ ] All 81 tests passing: `npm test`
- [ ] No TypeScript errors: `npm run build`
- [ ] No ESLint warnings: `npm run lint`
- [ ] `.env.local` has all required variables
- [ ] Firebase credentials verified and working
- [ ] Ollama service accessible at `http://localhost:11434` (for testing)
- [ ] All feature branches tested locally
- [ ] Git history clean (no uncommitted changes)
- [ ] README.md updated with production URL
- [ ] SECURITY.md reviewed and signed off

### ✅ Vercel Setup

1. **Create Vercel Account** (if not exists)
   - Go to https://vercel.com
   - Sign up with GitHub account

2. **Connect GitHub Repository**
   - Import project from GitHub
   - Grant Vercel access to repository
   - Select repository: `gymgenius-mvp`

3. **Configure Project Settings**
   ```
   Framework: Next.js 16
   Build Command: npm run build
   Output Directory: .next
   Development Command: npm run dev
   Install Command: npm install
   Node Version: 20 (if available)
   ```

4. **Create GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add the following secrets:

   ```
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   ```

   How to get these values:
   - **VERCEL_TOKEN**: https://vercel.com/account/tokens (create new token)
   - **VERCEL_ORG_ID**: Visible in Vercel project URL or dashboard
   - **VERCEL_PROJECT_ID**: Visible in Vercel project settings

### ✅ Environment Variables Configuration

Set these in **Vercel Dashboard** → Project Settings → Environment Variables:

#### Public Variables (Build-time)
```
NEXT_PUBLIC_FIREBASE_API_KEY = your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_APP_URL = https://gymgenius-mvp.vercel.app
```

#### Private Variables (Runtime)
```
FIREBASE_ADMIN_PROJECT_ID = your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL = firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET = your_super_secret_jwt_key_min_32_chars_long
CSRF_SECRET = your_csrf_secret_min_32_chars_long
```

#### Optional Variables
```
OLLAMA_BASE_URL = http://host.docker.internal:11434
OLLAMA_MODEL = llama3.2
NUTRITIONIX_APP_ID = your_app_id (if implemented)
NUTRITIONIX_API_KEY = your_api_key (if implemented)
```

**Important**: In Vercel, use @ prefix for secret references in vercel.json:
```json
{
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key"
  }
}
```

### ✅ Firebase Admin Setup

1. **Generate Firebase Service Account Key**
   - Go to Firebase Console → Project Settings
   - Click "Service Accounts" tab
   - Generate new private key (JSON format)
   - Download the key file

2. **Extract Credentials**
   ```json
   {
     "type": "service_account",
     "project_id": "...",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "...",
     "client_x509_cert_url": "..."
   }
   ```

3. **Set Vercel Secrets**
   ```
   FIREBASE_ADMIN_PROJECT_ID = project_id
   FIREBASE_ADMIN_CLIENT_EMAIL = client_email
   FIREBASE_ADMIN_PRIVATE_KEY = private_key (with \n preserved)
   ```

### ✅ Deploy to Production

#### Option 1: Automatic Deployment (Recommended)
1. Ensure all GitHub Secrets are set
2. Push to `main` branch:
   ```bash
   git push origin main
   ```
3. GitHub Actions automatically triggers
4. Vercel builds and deploys
5. Check deployment status in GitHub Actions tab
6. Production URL: https://gymgenius-mvp.vercel.app

#### Option 2: Manual Deployment via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option 3: Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Select your project
3. Click "Deploy" button
4. Select branch: `main`
5. Click "Deploy"

### ✅ Post-Deployment Verification

After successful deployment, verify everything works:

#### 1. **Homepage Access**
```bash
curl https://gymgenius-mvp.vercel.app/
# Should return HTML (not 404)
```

#### 2. **API Health Check**
```bash
curl https://gymgenius-mvp.vercel.app/api/health
# Should return 200 OK
```

#### 3. **Authentication Flow**
- [ ] Visit https://gymgenius-mvp.vercel.app/register
- [ ] Create test account
- [ ] Verify email confirmation (if enabled)
- [ ] Login with test account
- [ ] Verify JWT token in cookies

#### 4. **Dashboard Access**
- [ ] Login successfully
- [ ] Dashboard loads without errors
- [ ] All charts render correctly
- [ ] Navigation between pages works

#### 5. **API Functionality**
- [ ] GET /api/auth/me returns current user
- [ ] GET /api/exercises returns exercise list
- [ ] GET /api/workouts returns user workouts
- [ ] POST /api/workouts creates new workout
- [ ] GET /api/challenges returns challenges

#### 6. **Security Headers**
```bash
curl -I https://gymgenius-mvp.vercel.app/
```
Should return:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

#### 7. **CORS Validation**
- [ ] Requests from app domain work
- [ ] Requests from other domains blocked (unless whitelisted)

#### 8. **Firebase Connection**
- [ ] User data persists after logout/login
- [ ] New users saved to Firestore
- [ ] Profile updates work correctly

#### 9. **Performance Check**
Use Vercel Analytics or Lighthouse:
```bash
# Local Lighthouse audit
npm run build
npm start
# Open DevTools → Lighthouse
```

Expected scores:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### 10. **Mobile Responsive**
- [ ] Test on mobile device (iPhone, Android)
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] All features accessible on mobile
- [ ] Navigation responsive

### ✅ Monitoring & Maintenance

#### Vercel Dashboard Monitoring
1. **Deployments**: Track all deployments and rollbacks
2. **Analytics**: Monitor page views, API usage
3. **Functions**: Monitor serverless function performance
4. **Logs**: View deployment and runtime logs

#### Set Up Alerts (Optional)
- [ ] Email notifications on deployment failure
- [ ] Slack notifications for production events
- [ ] Error tracking with Sentry/Rollbar

#### Regular Maintenance
- [ ] Update dependencies monthly: `npm update`
- [ ] Security audit: `npm audit`
- [ ] Review logs weekly
- [ ] Monitor uptime and performance

### ✅ Rollback Procedure

If deployment has critical issues:

#### Via Vercel Dashboard
1. Go to Deployments tab
2. Find previous stable deployment
3. Click three dots → "Promote to Production"
4. Confirm rollback

#### Via GitHub
1. Revert problematic commit:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
2. GitHub Actions redeploys with previous version

#### Via Vercel CLI
```bash
vercel rollback
```

### ✅ Production Optimization

#### Enable Caching
- Vercel automatically caches:
  - Static assets (images, CSS, JS)
  - API responses (configurable)
  - Build artifacts

#### Configure ISR (Incremental Static Regeneration)
Add to pages that don't change frequently:
```typescript
export const revalidate = 3600; // revalidate every hour
```

#### Monitor Bundle Size
```bash
npm run build
# Check .next/static/chunks for size
```

Ensure production bundle < 500KB (gzipped).

#### Database Optimization
- [ ] Configure Firestore indexes for frequent queries
- [ ] Set up automated backups
- [ ] Review security rules
- [ ] Monitor quota usage

### ✅ Custom Domain (Optional)

To use custom domain (e.g., gymgenius.com):

1. **Register Domain** (Vercel, GoDaddy, etc.)
2. **Verify Domain** in Vercel:
   - Project Settings → Domains
   - Add custom domain
   - Update DNS records per Vercel instructions
3. **Configure SSL** (automatic with Vercel)
4. **Update Environment Variables**
   ```
   NEXT_PUBLIC_APP_URL = https://gymgenius.com
   ```

### ✅ Version Release

Create GitHub Release for v1.0.0:

```bash
# Tag the release
git tag -a v1.0.0 -m "GymGenius MVP v1.0.0 - Initial Release"

# Push tag to GitHub
git push origin v1.0.0

# Create release via GitHub CLI
gh release create v1.0.0 \
  --title "GymGenius MVP v1.0.0" \
  --notes "Initial production release with full feature set"
```

### ✅ Post-Release Documentation

Update these files:

1. **README.md**
   ```markdown
   **Production:** https://gymgenius-mvp.vercel.app
   **Version:** v1.0.0
   ```

2. **Create CHANGELOG.md**
   ```markdown
   # Changelog

   ## [1.0.0] - 2026-02-25

   ### Added
   - User authentication with Firebase
   - AI workout generation with Ollama
   - Exercise management with Wger API
   - Challenges and leaderboards
   - Notification system
   - Admin dashboard
   - Full security hardening
   - Docker support
   - 81 automated tests
   - Comprehensive documentation
   ```

3. **Create DEPLOYMENT.md** (this file)

## Troubleshooting

### Issue: Deployment fails with Firebase error
**Solution**: Verify FIREBASE_ADMIN_PRIVATE_KEY has escaped newlines:
```
# Correct: "-----BEGIN PRIVATE KEY-----\n...text...\n-----END PRIVATE KEY-----\n"
# Incorrect: "-----BEGIN PRIVATE KEY-----
# ...text...
# -----END PRIVATE KEY-----"
```

### Issue: API routes timeout
**Solution**: Increase Vercel function timeout in vercel.json:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Issue: Static files not loading
**Solution**: Clear Vercel cache:
- Vercel Dashboard → Settings → Advanced → Clear Cache → Purge Everything

### Issue: Environment variables not loaded
**Solution**: Rebuild deployment:
1. Vercel Dashboard → Deployments → Latest
2. Click three dots → Redeploy

### Issue: Ollama not accessible in production
**Solution**: Ollama is local-only. For production AI:
- Option 1: Self-host Ollama on server
- Option 2: Replace with cloud API (OpenAI, Anthropic, etc.)
- Option 3: Use Vercel AI Playground for testing

## Performance Benchmarks

Expected production performance:

| Metric | Target | Actual |
|--------|--------|--------|
| Lighthouse Performance | > 80 | - |
| API Response Time | < 500ms | - |
| Homepage Load Time | < 2s | - |
| Auth Latency | < 300ms | - |
| Database Query | < 100ms | - |

## Security Checklist

Before production release:

- [ ] All secrets in Vercel (not in code)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS whitelist configured
- [ ] CSRF tokens enabled
- [ ] XSS protection active (Content-Security-Policy)
- [ ] Admin routes protected
- [ ] Rate limiting considered
- [ ] Firestore security rules reviewed
- [ ] No console.logs in production code
- [ ] Error messages don't leak sensitive data

## Support & Documentation

- **Production URL**: https://gymgenius-mvp.vercel.app
- **GitHub Issues**: Report bugs
- **Documentation**: /README.md, /SECURITY.md, /TESTING.md
- **API Docs**: Available at deployed app (if configured)

---

**Last Updated**: 2026-02-25
**Status**: Production Ready ✅
**Version**: v1.0.0
