# GymGenius MVP

Fitness aplikacija sa AI-powered personalizovanim workout planovima.

## 🚀 Features

- 🔐 **User Authentication** - Firebase Auth sa JWT tokens
- 💪 **Exercise Management** - Kompletan katalog vežbi
- 📋 **Workout Plans** - Kreiranje i praćenje workout planova
- 🤖 **AI Workout Generator** - Ollama (Llama 3.2) za personalizovane planove
- 📊 **Progress Tracking** - Praćenje napretka i statistike
- 🎯 **Challenges** - Fitness izazovi i konkurencija
- 📱 **Responsive Design** - Optimizovano za sve uređaje

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firestore
- **Auth**: Firebase Authentication
- **AI**: Ollama (Llama 3.2) - Local AI
- **Testing**: Jest + React Testing Library
- **DevOps**: Docker, Docker Compose, GitHub Actions

## 📦 Prerequisites

- Node.js 20+
- npm ili yarn
- Docker (za Ollama u produkciji)
- Firebase projektni kredencijali
- Ollama (za AI feature)

## 🚀 Quick Start

### 1. Kloniranje i instalacija

```bash
git clone <repo-url>
cd gymgenius-mvp
npm install
```

### 2. Environment Setup

Kreiraj `.env` datoteku sa podacima:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Ollama (Local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 3. Pokreni razvojni server

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u browser-u.

## 🤖 Ollama Setup (Local AI)

### Instalacija Ollama

**Windows:**
```bash
# Download: https://ollama.com/download/windows
# Instaliraj i pokreni Ollama

# Verifikuj instalaciju
ollama --version

# Preuzmi Llama 3.2 model
ollama pull llama3.2
```

**macOS:**
```bash
brew install ollama
ollama serve
# U novom terminalu:
ollama pull llama3.2
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
# U novom terminalu:
ollama pull llama3.2
```

### Pokretanje Ollama servisa

Pre pokretanja aplikacije:
```bash
ollama serve
```

Ollama će biti dostupan na `http://localhost:11434`

### Verifikacija

```bash
curl http://localhost:11434/api/tags
```

Trebao bi videti listu dostupnih modela sa `llama3.2`.

### Alternativni modeli

```bash
ollama pull llama3.1
ollama pull mistral
ollama pull codellama

# Promeni u .env:
# OLLAMA_MODEL=llama3.1
```

## 📝 Development

### Pokretanje testova

```bash
# Svi testovi
npm test

# Testovi u watch modu
npm run test:watch

# Coverage
npm run test:coverage
```

### ESLint i TypeScript

```bash
# TypeScript check
npm run type-check

# ESLint
npm run lint
```

### Build

```bash
npm run build
npm start
```

## 🐳 Docker

### Build Docker image

```bash
docker build -t gymgenius-mvp .
```

### Pokreni sa Docker Compose

```bash
docker-compose up
```

Aplikacija će biti dostupna na [http://localhost:3000](http://localhost:3000)

### Napomena o Ollama u Docker-u

Ako koristiš Ollama unutar Docker kontejnera, koristi:
```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

## 📚 API Dokumentacija

### Health Check
```
GET /api/health
```

### AI Workout Generation
```
POST /api/ai/generate-workout
Authorization: Bearer <token>

Body:
{
  "goal": "muscle_gain",
  "experience": "intermediate",
  "equipment": ["barbell", "dumbbell"],
  "daysPerWeek": 4,
  "durationWeeks": 8,
  "saveToProfile": true
}
```

### Ollama Status
```
GET /api/ai/generate-workout
```

## 📁 Project Structure

```
gymgenius-mvp/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   └── ai/         # AI endpoints
│   │   ├── ai-workout/     # AI Workout Generator page
│   │   └── ...
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utility libraries
│   │   ├── ollama.ts     # Ollama API client
│   │   └── ...
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Docker Compose config
├── Dockerfile             # Docker image
└── README.md             # This file
```

## 🔄 CI/CD

### GitHub Actions

Automatski testiranje, linting i build na svakom push:
- **ESLint** - Code quality
- **TypeScript** - Type checking
- **Jest Tests** - Unit & integration tests
- **Build** - Production build verification
- **Security** - npm audit

## 🤝 Contributing

1. Kreiraj feature granu: `git checkout -b feature/your-feature`
2. Commit: `git commit -m "Add feature"`
3. Push: `git push origin feature/your-feature`
4. Otvori Pull Request

## 📄 License

MIT

## 📧 Support

Za pitanja ili probleme, otvori issue na GitHub-u.

---

**Made with ❤️ for fitness enthusiasts**
