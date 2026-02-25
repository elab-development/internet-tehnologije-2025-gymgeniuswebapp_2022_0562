# Swagger API Documentation Setup

## Status: ✅ IMPLEMENTIRANO

### Instalirana Packetska
- ✅ swagger-jsdoc: ^6.2.8
- ✅ swagger-ui-express: ^5.0.1
- ✅ @types/swagger-jsdoc: Latest

### Kreirane Datoteke

#### 1. **src/lib/swagger.ts**
- OpenAPI 3.0 specifikacija
- Definisane sigurnosne šeme (JWT Bearer, HttpOnly Cookie)
- Kompletan component schema (User, Exercise, WorkoutPlan, Challenge, Notification, etc.)
- Server konfiguracija za dev i production

#### 2. **src/app/api-docs/route.ts**
- GET endpoint koji vraća Swagger JSON specifikaciju
- Dostupan na: `/api-docs`
- Koristi se od strane Swagger UI-a

#### 3. **src/app/docs/page.tsx**
- Interaktivna Swagger UI stranica
- CDN-hostirani Swagger UI (bez potrebe za dodatnim packetima)
- Dostupna na: `/docs`
- Uključuje:
  - Swagger UI sa svim endpoint-ima
  - Informacije o autentifikaciji
  - Status kodovi i error handling
  - Detaljne informacije o svakoj API grupi (tag-u)
  - Testiranje endpoint-a direktno iz browser-a

### @Swagger Dokumentovani Endpoint-i

Sledeće API rute već imaju @swagger JSDoc komenatare:

1. ✅ **POST /api/auth/register** - User registration
2. ✅ **GET /api/challenges** - Get all challenges
3. ✅ **POST /api/challenges** - Create challenge (Admin)
4. ✅ **GET /api/admin/stats** - System statistics
5. ✅ **GET /api/admin/users** - List users
6. ✅ **PATCH /api/admin/users/[id]** - Update user

### Endpoint-i sa @Swagger (u progress)

Trebalo bi dodati @swagger JSDoc za sledeće rute:

1. **Auth Routes**:
   - POST /api/auth/login
   - GET /api/auth/logout
   - GET /api/auth/me

2. **Exercises Routes**:
   - GET /api/exercises
   - GET /api/exercises/[id]

3. **Workouts Routes**:
   - ✅ GET/POST /api/workouts
   - GET /api/workouts/[id]
   - PUT /api/workouts/[id]
   - DELETE /api/workouts/[id]

4. **Challenges Routes**:
   - ✅ GET /api/challenges
   - GET /api/challenges/[id]
   - POST /api/challenges/[id]/join
   - POST /api/challenges/[id]/leave
   - POST /api/challenges/[id]/progress

5. **Notifications Routes**:
   - GET /api/notifications
   - POST /api/notifications/[id]/read
   - POST /api/notifications/read-all

6. **Admin Routes**:
   - ✅ GET /api/admin/stats
   - ✅ GET /api/admin/users
   - DELETE /api/admin/users/[id]
   - GET /api/preferences
   - PUT /api/preferences

7. **AI Routes**:
   - POST /api/ai/generate-workout
   - GET /api/ai/status

### Kako Pristupiti Dokumentaciji

**Development Mode**:
```bash
npm run dev
# Otvori browser na: http://localhost:3000/docs
```

**Production**:
```bash
# Na Vercel-u:
https://gymgenius-mvp.vercel.app/docs
```

### Testiranje API-ja u Swagger UI-u

1. Otvori `/docs` stranicu
2. Klikni na bilo koji endpoint da ga ekspandiraš
3. Klikni "Try it out" dugme
4. Popuni parametre (ako trebaju):
   - Query parameters (vidljivi u URL-u)
   - Request body (JSON format)
   - Headers (ako trebaju)
5. Klikni "Execute"
6. Vidiš response: status kod, headers, body

### Napomene

- Swagger spec se dinamički generiše iz JSDoc komentera u route datotekama
- Svaki @swagger komentar je automatski parsiran od strane `swagger-jsdoc`
- OpenAPI 3.0 format omogućava maksimalnu kompatibilnost
- Swagger UI koristi CDN (nema potrebe za dodatnim dependencijama na frontend-u)

### Budućna Poboljšanja

1. Dodati više @swagger JSDoc-a za sve endpoint-e
2. Dodati "Examples" sekcije sa realnim zahtevima/odgovorima
3. Implementirati swagger-ui-react paket (ako trebao React komponenta)
4. Dodati API rate limiting dokumentaciju
5. Dodati WebSocket dokumentaciju (ako se implementira)

---

**Status**: ✅ Swagger dokumentacija je funkcionalna i dostupna na `/docs` i `/api-docs`
