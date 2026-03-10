# 🚀 GymGenius - Quick Deploy Checklist

## ✅ Everything is Ready!

Build OK ✅ | Docker OK ✅ | Groq AI ✅ | Firebase OK ✅

---

## 5-Minute Deploy

### 1️⃣ Generate Secrets
```bash
openssl rand -hex 64  # JWT_SECRET
openssl rand -hex 64  # CSRF_SECRET
```

### 2️⃣ Vercel Setup
```bash
npm install -g vercel
cd gymgenius-mvp
vercel link
```

### 3️⃣ Add Environment Variables

**Option A - CLI (faster):**
```bash
vercel env add JWT_SECRET
vercel env add CSRF_SECRET
vercel env add GROQ_API_KEY
# ... add rest from .env.cloud
```

**Option B - Vercel Dashboard:**
1. https://vercel.com/dashboard → GymGenius → Settings → Environment Variables
2. Copy all from `.env.cloud`
3. Paste one by one

### 4️⃣ Deploy
```bash
vercel --prod
```

**Done!** 🎉 Wait 5-10 minutes for build.

---

## Post-Deploy Tests

```bash
# 1. App alive?
https://gymgenius.vercel.app

# 2. Register works?
Sign up new user

# 3. Groq AI works?
/ai-workout → Generate plan

# 4. Firestore works?
Dashboard → Workouts

# 5. Check logs?
vercel logs --prod
```

---

## Files to Review

| File | Purpose |
|------|---------|
| `.env.cloud` | All env vars needed for Vercel |
| `VERCEL_DEPLOYMENT.md` | Full deployment guide |
| `next.config.ts` | FIXED - output mode conditional |
| `src/lib/ollama.ts` | AI provider - supports both Ollama & Groq |
| `README.md` | Updated with deploy info |

---

## Important Notes

- ✅ Docker `docker compose up` still works locally
- ✅ Ollama stays as local AI (dev)
- ✅ Groq is cloud AI (production)
- ✅ All 81 tests passing
- ✅ No breaking changes to existing code

---

## If Something Goes Wrong

1. **Build fails?**
   - Check: `npm run build` locally
   - Vercel logs: `vercel logs --prod`

2. **Firestore error?**
   - Verify: `FIREBASE_ADMIN_PRIVATE_KEY` has literal `\n` (not newlines)
   - Check: Firebase console.firebase.google.com

3. **Groq error?**
   - Verify: `GROQ_API_KEY` is correct
   - Check: console.groq.com → API Keys

4. **Rollback?**
   ```bash
   vercel rollback
   ```

---

## Next Steps (Optional)

- [ ] Add custom domain (vercel.com/docs)
- [ ] Setup analytics (Google Analytics)
- [ ] Email notifications (SendGrid)
- [ ] Rate limiting (Redis)

---

**Need help?** See `VERCEL_DEPLOYMENT.md` for detailed instructions.

**Local development?** `docker compose up` - works as always! 🐳
