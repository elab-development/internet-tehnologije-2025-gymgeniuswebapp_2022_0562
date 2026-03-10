# GymGenius - Vercel Deployment Guide

## Status

✅ **Kod je spreman za Vercel deploy**

- Next.js build: ✅ Optimizovan
- Groq AI: ✅ Konfigurisan (besplatan cloud AI)
- Firebase: ✅ Cloud baza (Firestore)
- Docker: ✅ Ostaje nepromenjen (za lokalno)
- CI/CD: ✅ GitHub Actions (automatski deploy)

---

## Quick Start (5 minuta)

### 1. Generiši sigurnosne tajne
```bash
# Generiši JWT_SECRET
openssl rand -hex 64

# Generiši CSRF_SECRET
openssl rand -hex 64

# Sačuvaj obe vrednosti
```

### 2. Kreiraj Vercel projekat (prvi put)
```bash
cd gymgenius-mvp
npm install -g vercel
vercel link
```
Odgovori: `Yes` → Link sa postojećim Vercel projektom

### 3. Preuzmi trenutne env vars
```bash
vercel env pull .env.local
```

### 4. Dodaj nove varijable u Vercel Dashboard
Idi na: https://vercel.com/dashboard → GymGenius → Settings → Environment Variables

Dodaj sve varijable iz `.env.cloud` fajla.

### 5. Deploy
```bash
vercel --prod
```

Deploy je gotov! 🚀

---

## Detaljna Instrukcija

### Korak 1: Generiši tajne

```bash
# Terminal / Git Bash
openssl rand -hex 64
```

Izlaz:
```
abc123def456...64 karaktera
```

**Sačuvaj obe vrednosti za korak 4.**

### Korak 2: Vercel CLI setup

```bash
cd gymgenius-mvp
npm install -g vercel
```

Proveri verziju:
```bash
vercel --version
```

### Korak 3: Linkuj sa Vercel projektom

```bash
vercel link
```

Pitanja:
```
? Set up and deploy "c:\...\gymgenius-mvp"? [Y/n] → Y
? Which scope should contain your project? → Odaberi tvoj Vercel account
? Link to existing project? [y/N] → y (ako je već kreirano na Vercel)
? What's the name of your existing project? → gymgenius
```

**Rezultat:** Kreirani se `.vercel/project.json` fajl (ne commituj u git!)

### Korak 4: Dodaj Environment Variables

#### Opcija A - CLI (preporučeno)
```bash
vercel env pull .env.local
```
Ovo preuzima sve postojeće varijable.

Zatim dodaj nove:
```bash
vercel env add GROQ_API_KEY
# Unesi vrednost iz .env.cloud

vercel env add JWT_SECRET
# Unesi generisanu tajnu

vercel env add CSRF_SECRET
# Unesi generisanu tajnu
```

#### Opcija B - Vercel Dashboard
1. Idi na https://vercel.com/dashboard
2. Odaberi **GymGenius** projekat
3. Klikni **Settings** → **Environment Variables**
4. Klikni **Add New**
5. Dodaj sve varijable:

**Klijentske varijable (NEXT_PUBLIC_):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDmPDBtQ7R1H8mFO1NPFHgcRZHM6UuF_rY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gymgenius-cc26e.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gymgenius-cc26e
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gymgenius-cc26e.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=726374647900
NEXT_PUBLIC_FIREBASE_APP_ID=1:726374647900:web:f190ef821f64959ed4be99
NEXT_PUBLIC_APP_URL=https://gymgenius.vercel.app
```

**Server varijable (tajne):**
```
FIREBASE_ADMIN_PROJECT_ID=gymgenius-cc26e
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gymgenius-cc26e.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
JWT_SECRET=<generiši sa openssl rand -hex 64>
CSRF_SECRET=<generiši sa openssl rand -hex 64>
AI_PROVIDER=groq
GROQ_API_KEY=<tvoj Groq API ključ>
GROQ_MODEL=llama-3.3-70b-versatile
WGER_API_BASE_URL=https://wger.de/api/v2
WGER_API_LANGUAGE=2
```

### Korak 5: Deploy

#### Opcija A - CLI Deploy
```bash
vercel --prod
```

**Čeka se:**
- Build: 2-3 minuta
- CI/CD testovi: 3-5 minuta
- Deployment: 1 minut

Total: ~5-10 minuta

#### Opcija B - Git Push (automatski)
```bash
git add .
git commit -m "feat: Configure Vercel deployment with Groq AI"
git push origin main
```

GitHub Actions CI/CD automatski:
1. Pokreće testove
2. Radi security audit
3. Build-a Docker image
4. Deploy-a na Vercel (samo ako main branch)

**Gledaj status na:** https://github.com/username/repo/actions

---

## Verifikacija Deploy-a

### 1. Aplikacija je živa?
```
https://gymgenius.vercel.app
```

Trebalo bi da vidiš:
- Landing page
- Login / Register forme

### 2. Firestore Auth radi?
- Klikni **Register**
- Unesi: `test@example.com` / `Test123!`
- Trebalo bi da kreiram novi nalog

### 3. Groq AI radi?
- Login sa test nalogom
- Idi na **/ai-workout**
- Klikni **Generate Workout Plan**
- Čekaj odgovor

**Log koji trebalo bi da vidiš u Vercel dashboard:**
```
🤖 Calling Groq API (llama-3.3-70b-versatile)...
✅ Groq response received
```

### 4. Provjeri Vercel logs
```bash
vercel logs --prod
```

Ili ide na: https://vercel.com/dashboard → GymGenius → Deployments → View Logs

---

## Docker ostaje nepromenjen

Lokalni development i Docker nastavlja da radi sa **Ollama**:

```bash
# Lokalno - Docker
docker compose up

# Aplikacija počinje sa AI_PROVIDER=ollama (iz .env)
# Ollama se automatski pokreće u Docker kontejneru
# Sve radi kao pre, bez greške
```

**Važno:** Nikada ne meni `Dockerfile` ili `docker-compose.yml`.

---

## Groq Free Tier Limits

- **500K tokena/dan** (više nego dovoljno za testiranje)
- **6K tokena/min** rate limit
- **Bez kreditne kartice potrebne**
- **Llama-3.3-70b-versatile** model (bolji od Llama 3.2)

Registracija: https://console.groq.com

---

## Troubleshooting

### Build greška: "output: 'standalone' nije validna za Vercel"
✅ **Rešeno:** `next.config.ts` je ažuriran sa:
```ts
output: process.env.VERCEL ? undefined : 'standalone',
```

### FIREBASE_ADMIN_PRIVATE_KEY greška
**Problem:** `\n` u private key nisu pravi newline

**Rešenje:** U Vercel env vars koristi literalne `\n` karaktere:
```
-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n
```

Ne pravi novi redovi - samo `\n` kao tekst!

### Groq API greška: "Invalid API key"
**Rešenje:**
1. Ide na https://console.groq.com
2. Kreiraj novi API ključ
3. Ažuriraj `GROQ_API_KEY` u Vercel Dashboard

### Firestore auth error
**Rešenje:**
1. Ide na https://console.firebase.google.com
2. Odaberi GymGenius projekat
3. Proveri da li su CORS headeri ispravni
4. Vercel `vercel.json` ima:
```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "*" }
    ]
  }
]
```

### Deploy je uspešan ali app nije dostupna
1. Čekaj 30 sekundi (coldstart)
2. Osvezi stranicu (Ctrl+Shift+R)
3. Proverio Vercel logs za greške

---

## CI/CD Pipeline

Automatski na `git push origin main`:

1. **Test** → Jest (81 testova) ✅
2. **Security** → npm audit ✅
3. **Build** → npm run build ✅
4. **Docker** → Build test (ali se ne push-a) ✅
5. **Deploy** → Vercel `--prod` ✅

Ako bilo koji korak faila → Deploy se ne dešava.

Gledaj status: https://github.com/username/repo/actions

---

## Rollback

Ako deployment nije dobro:

```bash
# Vrati na prethodnu verziju
vercel rollback

# Ili iz Vercel Dashboard
# → Deployments → Hover → Options → Promote (prethodnu)
```

---

## Sledeći koraci

1. ✅ Deploy na Vercel
2. ✅ Test Groq AI
3. ✅ Firestore integracija
4. 📊 Analytics (opciono - Google Analytics)
5. 🔐 SSL/HTTPS (automatski Vercel)
6. 📧 Email notifications (Future feature)

---

**Gotov si! 🎉**

App je sada dostupna na https://gymgenius.vercel.app sa svim feature-ima.

Za pitanja ili greške - proveri Vercel logs i GitHub Actions status.
