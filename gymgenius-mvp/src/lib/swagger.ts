const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GymGenius MVP API',
    version: '1.0.0',
    description: 'Fitness aplikacija sa AI-powered personalizovanim workout planovima\n\n**Autentifikacija:** API koristi JWT tokene koji se šalju kao HttpOnly kolačić (`token`) ili kao `Authorization: Bearer <token>` header.\n\n**Dobijanje tokena:** Pozovi `POST /api/auth/login` ili `POST /api/auth/register`.',
    contact: {
      name: 'GymGenius Team',
      email: 'support@gymgenius.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token iz login/register odgovora',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'HttpOnly kolačić sa JWT tokenom',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          email: { type: 'string', format: 'email' },
          displayName: { type: 'string' },
          role: { type: 'string', enum: ['guest', 'user', 'premium', 'admin'] },
          age: { type: 'number' },
          weight: { type: 'number' },
          height: { type: 'number' },
          goal: { type: 'string', enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      WorkoutPlan: {
        type: 'object',
        properties: {
          planId: { type: 'string' },
          userId: { type: 'string' },
          name: { type: 'string' },
          goal: { type: 'string' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          durationWeeks: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Exercise: {
        type: 'object',
        properties: {
          exerciseId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          primaryMuscleGroup: { type: 'string' },
          secondaryMuscleGroups: { type: 'array', items: { type: 'string' } },
          equipment: { type: 'array', items: { type: 'string' } },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          goalId: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['weight', 'strength', 'consistency', 'nutrition'] },
          title: { type: 'string' },
          targetValue: { type: 'number' },
          currentValue: { type: 'number' },
          unit: { type: 'string' },
          deadline: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['active', 'completed', 'expired'] },
        },
      },
      Meal: {
        type: 'object',
        properties: {
          mealId: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
          date: { type: 'string', format: 'date' },
        },
      },
      Challenge: {
        type: 'object',
        properties: {
          challengeId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['weight_loss', 'strength', 'consistency', 'volume'] },
          targetValue: { type: 'number' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          participantCount: { type: 'number' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          notificationId: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['workout_reminder', 'meal_reminder', 'challenge_update', 'achievement', 'system'] },
          title: { type: 'string' },
          message: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Registracija, login, logout i korisnički podaci' },
    { name: 'Workouts', description: 'Workout planovi' },
    { name: 'Workout Logs', description: 'Logovanje treninga' },
    { name: 'Exercises', description: 'Baza vežbi' },
    { name: 'Goals', description: 'Fitness ciljevi' },
    { name: 'Meals', description: 'Logovanje obroka' },
    { name: 'Nutrition', description: 'Kalkulator kalorija i pretraga hrane' },
    { name: 'Challenges', description: 'Fitness izazovi i leaderboard' },
    { name: 'Notifications', description: 'Obaveštenja' },
    { name: 'Progress', description: 'Fotografije napretka' },
    { name: 'Stats', description: 'Statistike napretka' },
    { name: 'Users', description: 'Korisnički profil' },
    { name: 'Preferences', description: 'Podešavanja notifikacija' },
    { name: 'AI', description: 'AI generisanje workout planova (Llama 3.2 via Ollama)' },
    { name: 'Premium', description: 'Premium AI funkcionalnosti' },
    { name: 'Admin', description: 'Administrativne rute (zahteva admin rolu)' },
    { name: 'Wger', description: 'Integracija sa Wger fitness API-jem' },
    { name: 'Security', description: 'CSRF token i bezbednost' },
  ],
  paths: {
    // ==================== AUTH ====================
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Prijava korisnika',
        description: 'Prijava sa email/password. Vraća JWT token i postavlja HttpOnly kolačić.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'SecurePass123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Uspešna prijava',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', description: 'JWT token' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { description: 'Nevalidni podaci' },
          '401': { description: 'Pogrešan email ili lozinka' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registracija korisnika',
        description: 'Kreira novi korisnički nalog. Lozinka mora imati min. 8 karaktera, jedno veliko slovo, jedan broj i jedan specijalni karakter.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'SecurePass123!', description: 'Min 8 karaktera, veliko slovo, broj, specijalni karakter' },
                  displayName: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Korisnik uspešno registrovan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { description: 'Nevalidni podaci ili email već postoji' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Odjava korisnika',
        description: 'Briše HttpOnly kolačić sa JWT tokenom.',
        responses: {
          '200': { description: 'Uspešna odjava' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Podaci ulogovanog korisnika',
        description: 'Vraća kompletan profil trenutno ulogovanog korisnika.',
        responses: {
          '200': {
            description: 'Korisnički profil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Zahtev za reset lozinke',
        description: 'Šalje email sa linkom za reset lozinke. Iz bezbednosnih razloga uvek vraća isti odgovor.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Zahtev primljen (link poslan ako nalog postoji)' },
          '400': { description: 'Email nije naveden' },
        },
      },
    },

    // ==================== WORKOUTS ====================
    '/api/workouts': {
      get: {
        tags: ['Workouts'],
        summary: 'Lista workout planova korisnika',
        responses: {
          '200': {
            description: 'Lista planova',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    plans: { type: 'array', items: { $ref: '#/components/schemas/WorkoutPlan' } },
                    total: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      post: {
        tags: ['Workouts'],
        summary: 'Kreiranje workout plana',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'goal'],
                properties: {
                  name: { type: 'string', example: 'Moj plan' },
                  goal: { type: 'string', enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'] },
                  difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  durationWeeks: { type: 'number', example: 8 },
                  generatedBy: { type: 'string', example: 'ai' },
                  isActive: { type: 'boolean' },
                  schedule: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Plan kreiran', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, plan: { $ref: '#/components/schemas/WorkoutPlan' } } } } } },
          '400': { description: 'Nevalidni podaci' },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },
    '/api/workouts/{id}': {
      get: {
        tags: ['Workouts'],
        summary: 'Detalji workout plana',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID workout plana' }],
        responses: {
          '200': { description: 'Detalji plana', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, plan: { $ref: '#/components/schemas/WorkoutPlan' } } } } } },
          '401': { description: 'Nije autentifikovan' },
          '403': { description: 'Nema pristup (nije vlasnik)' },
          '404': { description: 'Plan nije pronađen' },
        },
      },
      delete: {
        tags: ['Workouts'],
        summary: 'Brisanje workout plana',
        description: 'Briše workout plan. Samo vlasnik može brisati (IDOR zaštita).',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Plan obrisan' },
          '401': { description: 'Nije autentifikovan' },
          '403': { description: 'Nema pristup' },
          '404': { description: 'Plan nije pronađen' },
        },
      },
    },

    // ==================== WORKOUT LOGS ====================
    '/api/workout-logs': {
      get: {
        tags: ['Workout Logs'],
        summary: 'Istorija treninga korisnika',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Broj zapisa (default: 20)' }],
        responses: {
          '200': {
            description: 'Lista logova treninga',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    logs: { type: 'array', items: { type: 'object' } },
                    total: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      post: {
        tags: ['Workout Logs'],
        summary: 'Logovanje završenog treninga',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['exercises', 'duration'],
                properties: {
                  exercises: {
                    type: 'array',
                    description: 'Lista vežbi sa setovima',
                    items: {
                      type: 'object',
                      properties: {
                        exerciseId: { type: 'string' },
                        name: { type: 'string' },
                        sets: { type: 'array', items: { type: 'object', properties: { reps: { type: 'number' }, weight: { type: 'number' } } } },
                      },
                    },
                  },
                  duration: { type: 'number', description: 'Trajanje u minutima', example: 60 },
                  notes: { type: 'string' },
                  planId: { type: 'string', description: 'ID plana (opciono)' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Trening logovan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    logId: { type: 'string' },
                    totalVolume: { type: 'number', description: 'Ukupan volumen: sum(setovi × reps × težina)' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },

    // ==================== EXERCISES ====================
    '/api/exercises': {
      get: {
        tags: ['Exercises'],
        summary: 'Lista vežbi sa filterima',
        parameters: [
          { name: 'muscleGroup', in: 'query', schema: { type: 'string' }, example: 'chest', description: 'Filtriranje po mišićnoj grupi' },
          { name: 'equipment', in: 'query', schema: { type: 'string' }, example: 'barbell', description: 'Filtriranje po opremi' },
          { name: 'difficulty', in: 'query', schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, example: 'bench press', description: 'Pretraga po imenu' },
        ],
        responses: {
          '200': {
            description: 'Lista vežbi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    exercises: { type: 'array', items: { $ref: '#/components/schemas/Exercise' } },
                    total: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      post: {
        tags: ['Exercises'],
        summary: 'Kreiranje vežbe (admin)',
        description: 'Kreira novu vežbu u bazi. Zahteva admin rolu.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'primaryMuscleGroup', 'equipment'],
                properties: {
                  name: { type: 'string', example: 'Bench Press' },
                  description: { type: 'string' },
                  primaryMuscleGroup: { type: 'string', example: 'chest' },
                  secondaryMuscleGroups: { type: 'array', items: { type: 'string' } },
                  equipment: { type: 'array', items: { type: 'string' }, example: ['barbell'] },
                  difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  instructions: { type: 'string' },
                  videoUrl: { type: 'string', format: 'uri' },
                  thumbnailUrl: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Vežba kreirana' },
          '401': { description: 'Nije autentifikovan' },
          '403': { description: 'Nije admin' },
        },
      },
    },
    '/api/exercises/{id}': {
      get: {
        tags: ['Exercises'],
        summary: 'Detalji vežbe',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Detalji vežbe', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, exercise: { $ref: '#/components/schemas/Exercise' } } } } } },
          '404': { description: 'Vežba nije pronađena' },
        },
      },
      put: {
        tags: ['Exercises'],
        summary: 'Ažuriranje vežbe (admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  primaryMuscleGroup: { type: 'string' },
                  secondaryMuscleGroups: { type: 'array', items: { type: 'string' } },
                  equipment: { type: 'array', items: { type: 'string' } },
                  difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  videoUrl: { type: 'string' },
                  thumbnailUrl: { type: 'string' },
                  instructions: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Vežba ažurirana' },
          '401': { description: 'Nije autentifikovan' },
          '403': { description: 'Nije admin' },
          '404': { description: 'Vežba nije pronađena' },
        },
      },
      delete: {
        tags: ['Exercises'],
        summary: 'Brisanje vežbe (admin, soft delete)',
        description: 'Postavlja `isActive=false`. Ne briše trajno.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Vežba deaktivirana' },
          '401': { description: 'Nije autentifikovan' },
          '403': { description: 'Nije admin' },
        },
      },
    },

    // ==================== GOALS ====================
    '/api/goals': {
      get: {
        tags: ['Goals'],
        summary: 'Lista fitness ciljeva korisnika',
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'completed', 'expired'] }, description: 'Filtriranje po statusu' }],
        responses: {
          '200': {
            description: 'Lista ciljeva',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
                    total: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      post: {
        tags: ['Goals'],
        summary: 'Kreiranje fitness cilja',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'title', 'targetValue', 'currentValue', 'unit', 'deadline'],
                properties: {
                  type: { type: 'string', enum: ['weight', 'strength', 'consistency', 'nutrition'] },
                  title: { type: 'string', example: 'Izgubiti 5kg' },
                  description: { type: 'string' },
                  targetValue: { type: 'number', example: 75 },
                  currentValue: { type: 'number', example: 80 },
                  unit: { type: 'string', example: 'kg' },
                  deadline: { type: 'string', format: 'date-time', description: 'Mora biti u budućnosti' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Cilj kreiran', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, goal: { $ref: '#/components/schemas/Goal' } } } } } },
          '400': { description: 'Nevalidni podaci' },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },
    '/api/goals/{id}': {
      put: {
        tags: ['Goals'],
        summary: 'Ažuriranje napretka cilja',
        description: 'Automatski kompletira cilj ako je `currentValue >= targetValue`.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentValue: { type: 'number', description: 'Ažurirana vrednost napretka' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  deadline: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Cilj ažuriran' },
          '403': { description: 'Nije vlasnik cilja' },
          '404': { description: 'Cilj nije pronađen' },
        },
      },
      delete: {
        tags: ['Goals'],
        summary: 'Brisanje cilja',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Cilj obrisan' },
          '403': { description: 'Nije vlasnik' },
          '404': { description: 'Cilj nije pronađen' },
        },
      },
    },

    // ==================== MEALS ====================
    '/api/meals': {
      get: {
        tags: ['Meals'],
        summary: 'Lista obroka za određeni dan',
        parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, example: '2024-01-15', description: 'Datum u formatu YYYY-MM-DD (default: danas)' }],
        responses: {
          '200': {
            description: 'Obroci za dan sa totalima',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    meals: { type: 'array', items: { $ref: '#/components/schemas/Meal' } },
                    totals: {
                      type: 'object',
                      properties: {
                        calories: { type: 'number' },
                        protein: { type: 'number' },
                        carbs: { type: 'number' },
                        fat: { type: 'number' },
                      },
                    },
                    date: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      post: {
        tags: ['Meals'],
        summary: 'Logovanje obroka',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type', 'calories', 'protein', 'carbs', 'fat'],
                properties: {
                  name: { type: 'string', example: 'Ovsena kaša' },
                  type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                  calories: { type: 'number', example: 350 },
                  protein: { type: 'number', example: 15 },
                  carbs: { type: 'number', example: 45 },
                  fat: { type: 'number', example: 8 },
                  quantity: { type: 'number' },
                  notes: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Obrok logovan', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, meal: { $ref: '#/components/schemas/Meal' } } } } } },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },
    '/api/meals/{id}': {
      delete: {
        tags: ['Meals'],
        summary: 'Brisanje obroka (IDOR zaštita)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Obrok obrisan' },
          '403': { description: 'Nije vlasnik' },
          '404': { description: 'Obrok nije pronađen' },
        },
      },
    },

    // ==================== NUTRITION ====================
    '/api/nutrition/calculator': {
      get: {
        tags: ['Nutrition'],
        summary: 'Kalkulator kalorija i makronutrijenata',
        description: 'Izračunava BMR, TDEE i preporučene makronutrijente na osnovu profila korisnika (Mifflin-St Jeor formula).',
        responses: {
          '200': {
            description: 'Kalorijski i makro plan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    bmr: { type: 'number', description: 'Bazalni metabolizam' },
                    tdee: { type: 'number', description: 'Ukupni dnevni energetski rashodi' },
                    targetCalories: { type: 'number' },
                    protein: { type: 'number', description: 'Preporučeni proteini (g)' },
                    carbs: { type: 'number', description: 'Preporučeni ugljeni hidrati (g)' },
                    fat: { type: 'number', description: 'Preporučene masti (g)' },
                    goal: { type: 'string' },
                    activityLevel: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },
    '/api/nutrition/search': {
      get: {
        tags: ['Nutrition'],
        summary: 'Pretraga hrane (Open Food Facts)',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 }, example: 'banana', description: 'Naziv hrane (min. 2 karaktera)' }],
        responses: {
          '200': {
            description: 'Rezultati pretrage',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    foods: { type: 'array', items: { type: 'object' } },
                    query: { type: 'string' },
                    count: { type: 'number' },
                  },
                },
              },
            },
          },
          '400': { description: 'Query parametar je obavezan (min. 2 karaktera)' },
        },
      },
    },

    // ==================== CHALLENGES ====================
    '/api/challenges': {
      get: {
        tags: ['Challenges'],
        summary: 'Lista fitness izazova',
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['upcoming', 'active', 'completed'] }, description: 'Filtriranje po statusu' }],
        responses: {
          '200': {
            description: 'Lista izazova sa brojem učesnika i korisničkim napretkom',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    challenges: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                    total: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      post: {
        tags: ['Challenges'],
        summary: 'Kreiranje izazova (admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type', 'startDate', 'endDate', 'targetValue'],
                properties: {
                  name: { type: 'string', example: 'Izazov 30 dana' },
                  type: { type: 'string', enum: ['weight_loss', 'strength', 'consistency', 'volume'] },
                  description: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  targetValue: { type: 'number' },
                  targetUnit: { type: 'string', example: 'kg' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Izazov kreiran' },
          '403': { description: 'Nije admin' },
        },
      },
    },
    '/api/challenges/{id}': {
      get: {
        tags: ['Challenges'],
        summary: 'Detalji izazova sa leaderboard-om',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Detalji izazova',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    challenge: { $ref: '#/components/schemas/Challenge' },
                    leaderboard: { type: 'array', description: 'Top 50 učesnika', items: { type: 'object' } },
                    userParticipation: { type: 'object', description: 'Napredak trenutnog korisnika' },
                  },
                },
              },
            },
          },
          '404': { description: 'Izazov nije pronađen' },
        },
      },
    },
    '/api/challenges/{id}/join': {
      post: {
        tags: ['Challenges'],
        summary: 'Prijavljivanje na izazov',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Korisnik prijavljen na izazov' },
          '400': { description: 'Korisnik već učestvuje' },
          '404': { description: 'Izazov nije pronađen' },
        },
      },
    },
    '/api/challenges/{id}/leave': {
      post: {
        tags: ['Challenges'],
        summary: 'Napuštanje izazova',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Korisnik napustio izazov' },
          '404': { description: 'Učešće nije pronađeno' },
        },
      },
    },
    '/api/challenges/{id}/progress': {
      post: {
        tags: ['Challenges'],
        summary: 'Ažuriranje napretka u izazovu',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  progressIncrement: { type: 'number', default: 1, description: 'Vrednost za povećanje napretka' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Napredak ažuriran',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    currentProgress: { type: 'number' },
                  },
                },
              },
            },
          },
          '400': { description: 'Korisnik nije prijavljen na izazov' },
        },
      },
    },

    // ==================== NOTIFICATIONS ====================
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Lista obaveštenja korisnika',
        parameters: [
          { name: 'unreadOnly', in: 'query', schema: { type: 'boolean' }, description: 'Prikaži samo nepročitana' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Maksimalni broj rezultata' },
        ],
        responses: {
          '200': {
            description: 'Lista obaveštenja',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                    total: { type: 'number' },
                    unreadCount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Notifications'],
        summary: 'Kreiranje obaveštenja',
        description: 'Admin može kreirati za bilo kog korisnika. Korisnik može samo za sebe.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'type', 'title', 'message'],
                properties: {
                  userId: { type: 'string', description: 'ID primaoca' },
                  type: { type: 'string', enum: ['workout_reminder', 'meal_reminder', 'challenge_update', 'achievement', 'system'] },
                  title: { type: 'string' },
                  message: { type: 'string' },
                  relatedId: { type: 'string' },
                  relatedType: { type: 'string' },
                  actionUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Obaveštenje kreirano' },
          '403': { description: 'Korisnik ne može kreirati za druge korisnike' },
        },
      },
    },
    '/api/notifications/read-all': {
      post: {
        tags: ['Notifications'],
        summary: 'Označavanje svih obaveštenja kao pročitana',
        responses: {
          '200': {
            description: 'Sva obaveštenja označena kao pročitana',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    count: { type: 'number', description: 'Broj označenih obaveštenja' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Označavanje obaveštenja kao pročitano',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Obaveštenje označeno kao pročitano' },
          '403': { description: 'Nije vlasnik obaveštenja' },
          '404': { description: 'Obaveštenje nije pronađeno' },
        },
      },
    },

    // ==================== PROGRESS PHOTOS ====================
    '/api/progress/photos': {
      get: {
        tags: ['Progress'],
        summary: 'Lista fotografija napretka korisnika',
        responses: {
          '200': {
            description: 'Lista fotografija',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    photos: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          photoId: { type: 'string' },
                          url: { type: 'string' },
                          category: { type: 'string', enum: ['front', 'back', 'side', 'other'] },
                          notes: { type: 'string' },
                          date: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Progress'],
        summary: 'Upload fotografije napretka',
        description: 'Upload fotografije (max 5MB). Koristi multipart/form-data.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['photo'],
                properties: {
                  photo: { type: 'string', format: 'binary', description: 'Fotografija (max 5MB)' },
                  category: { type: 'string', enum: ['front', 'back', 'side', 'other'], default: 'other' },
                  notes: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Fotografija uploadovana',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    photoId: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Fajl nije naveden ili je preveliki (>5MB)' },
        },
      },
    },
    '/api/progress/photos/{id}': {
      delete: {
        tags: ['Progress'],
        summary: 'Brisanje fotografije napretka',
        description: 'Briše fajl sa diska i metadata iz baze. IDOR zaštita.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Fotografija obrisana' },
          '403': { description: 'Nije vlasnik' },
          '404': { description: 'Fotografija nije pronađena' },
        },
      },
    },

    // ==================== STATS ====================
    '/api/stats/progress': {
      get: {
        tags: ['Stats'],
        summary: 'Statistike napretka korisnika',
        parameters: [{ name: 'period', in: 'query', schema: { type: 'string', enum: ['week', 'month', 'year'] }, description: 'Vremenski period' }],
        responses: {
          '200': {
            description: 'Statistike napretka',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    weightProgress: { type: 'array', items: { type: 'object' } },
                    workoutVolume: { type: 'array', items: { type: 'object' } },
                    calorieIntake: { type: 'array', items: { type: 'object' } },
                    workoutFrequency: { type: 'object' },
                    muscleGroupDistribution: { type: 'object' },
                    summary: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== USERS ====================
    '/api/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Dohvatanje profila korisnika',
        responses: {
          '200': {
            description: 'Korisnički profil',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } },
          },
          '401': { description: 'Nije autentifikovan' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Ažuriranje profila korisnika',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  displayName: { type: 'string' },
                  age: { type: 'number', minimum: 13, maximum: 120 },
                  gender: { type: 'string', enum: ['male', 'female', 'other'] },
                  weight: { type: 'number', minimum: 20, maximum: 500, description: 'Težina u kg' },
                  height: { type: 'number', minimum: 100, maximum: 250, description: 'Visina u cm' },
                  goal: { type: 'string', enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'] },
                  activityLevel: { type: 'string', enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'] },
                  availableEquipment: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Profil ažuriran' },
          '401': { description: 'Nije autentifikovan' },
        },
      },
    },

    // ==================== PREFERENCES ====================
    '/api/preferences': {
      get: {
        tags: ['Preferences'],
        summary: 'Dohvatanje podešavanja notifikacija',
        responses: {
          '200': {
            description: 'Podešavanja',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    notifications: {
                      type: 'object',
                      properties: {
                        workoutReminders: { type: 'boolean' },
                        mealReminders: { type: 'boolean' },
                        challengeUpdates: { type: 'boolean' },
                        achievements: { type: 'boolean' },
                        email: { type: 'boolean' },
                        push: { type: 'boolean' },
                      },
                    },
                    reminderTimes: {
                      type: 'object',
                      properties: {
                        morning: { type: 'string', example: '08:00' },
                        afternoon: { type: 'string', example: '13:00' },
                        evening: { type: 'string', example: '19:00' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Preferences'],
        summary: 'Ažuriranje podešavanja notifikacija',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notifications: {
                    type: 'object',
                    properties: {
                      workoutReminders: { type: 'boolean' },
                      mealReminders: { type: 'boolean' },
                      challengeUpdates: { type: 'boolean' },
                      achievements: { type: 'boolean' },
                      email: { type: 'boolean' },
                      push: { type: 'boolean' },
                    },
                  },
                  reminderTimes: {
                    type: 'object',
                    properties: {
                      morning: { type: 'string', example: '08:00' },
                      afternoon: { type: 'string', example: '13:00' },
                      evening: { type: 'string', example: '19:00' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Podešavanja ažurirana' },
        },
      },
    },

    // ==================== AI ====================
    '/api/ai/generate-workout': {
      get: {
        tags: ['AI'],
        summary: 'Status Ollama AI servisa',
        description: 'Proverava da li je Ollama servis aktivan i koji model je dostupan.',
        security: [],
        responses: {
          '200': {
            description: 'Status AI servisa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['available', 'unavailable'] },
                    service: { type: 'string' },
                    model: { type: 'string', example: 'llama3.2' },
                    baseUrl: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['AI'],
        summary: 'AI generisanje workout plana (Llama 3.2)',
        description: 'Generira personalizovan workout plan koristeći Llama 3.2 model via Ollama.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['goal', 'experience'],
                properties: {
                  goal: { type: 'string', enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'] },
                  experience: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  equipment: { type: 'array', items: { type: 'string' }, example: ['barbell', 'dumbbell'] },
                  daysPerWeek: { type: 'number', minimum: 1, maximum: 7, default: 4 },
                  durationWeeks: { type: 'number', minimum: 4, maximum: 16, default: 8 },
                  saveToProfile: { type: 'boolean', default: false, description: 'Sačuvaj plan u profilu korisnika' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'AI generisan workout plan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    plan: { type: 'object', description: 'AI generisan plan' },
                    planId: { type: 'string', description: 'ID sačuvanog plana (ako saveToProfile=true)' },
                    aiModel: { type: 'string', example: 'llama3.2' },
                    metadata: { type: 'object', description: 'Ollama metadata' },
                  },
                },
              },
            },
          },
          '503': { description: 'Ollama servis nije dostupan' },
        },
      },
    },

    // ==================== PREMIUM ====================
    '/api/premium/ai-weekly-plan': {
      post: {
        tags: ['Premium'],
        summary: 'AI sedmični plan (Premium)',
        description: 'Generiše kompletni 7-dnevni AI plan sa nutrition tips. Premium funkcionalnost.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  durationWeeks: { type: 'number', minimum: 1, maximum: 12, default: 4 },
                  includeNutrition: { type: 'boolean', default: true, description: 'Uključi preporuke za ishranu' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'AI sedmični plan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    weeklyPlan: { type: 'object', description: '7-dnevni raspored' },
                    nutritionTips: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== ADMIN ====================
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Admin sistemske statistike',
        description: 'Zahteva admin rolu. Vraća pregled sistema, korisnika i aktivnosti.',
        responses: {
          '200': {
            description: 'Sistemske statistike',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    overview: {
                      type: 'object',
                      properties: {
                        totalUsers: { type: 'number' },
                        totalWorkouts: { type: 'number' },
                        totalChallenges: { type: 'number' },
                      },
                    },
                    usersByRole: { type: 'object' },
                    recentActivity: { type: 'array', items: { type: 'object' } },
                    activeChallenges: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '403': { description: 'Nije admin' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Lista korisnika (admin)',
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['guest', 'user', 'premium', 'admin'] }, description: 'Filtriranje po roli' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Pretraga po emailu ili imenu' },
        ],
        responses: {
          '200': {
            description: 'Lista korisnika',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    total: { type: 'number' },
                  },
                },
              },
            },
          },
          '403': { description: 'Nije admin' },
        },
      },
    },
    '/api/admin/users/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Ažuriranje korisnika (admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['guest', 'user', 'premium', 'admin'] },
                  displayName: { type: 'string' },
                  isBlocked: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Korisnik ažuriran' },
          '403': { description: 'Nije admin' },
          '404': { description: 'Korisnik nije pronađen' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Brisanje korisnika (admin)',
        description: 'Briše korisnika iz Firebase Auth i Firestore. Ne može brisati samog sebe.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Korisnik obrisan' },
          '400': { description: 'Admin ne može brisati sopstveni nalog' },
          '403': { description: 'Nije admin' },
          '404': { description: 'Korisnik nije pronađen' },
        },
      },
    },

    // ==================== WGER ====================
    '/api/wger/search': {
      get: {
        tags: ['Wger'],
        summary: 'Pretraga vežbi iz Wger API-ja',
        parameters: [
          { name: 'query', in: 'query', required: true, schema: { type: 'string' }, example: 'squat', description: 'Pojam za pretragu' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Rezultati iz Wger-a',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    exercises: { type: 'array', items: { type: 'object' } },
                    total: { type: 'number' },
                    source: { type: 'string', example: 'wger' },
                  },
                },
              },
            },
          },
          '400': { description: 'Query parametar je obavezan' },
        },
      },
    },
    '/api/wger/sync': {
      post: {
        tags: ['Wger'],
        summary: 'Sinhronizacija vežbi iz Wger-a (admin)',
        description: 'Importuje vežbe iz Wger API-ja u lokalnu bazu. Zahteva admin rolu.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  limit: { type: 'number', default: 100, description: 'Broj vežbi za sinhronizaciju' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sinhronizacija završena',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    synced: { type: 'number' },
                    total: { type: 'number' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '403': { description: 'Nije admin' },
        },
      },
    },
    '/api/wger/exercises/{id}': {
      get: {
        tags: ['Wger'],
        summary: 'Detalji vežbe iz Wger-a',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Wger exercise ID' }],
        responses: {
          '200': {
            description: 'Detalji vežbe sa slikama',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    exercise: { type: 'object' },
                    images: { type: 'array', items: { type: 'object' } },
                    source: { type: 'string', example: 'wger' },
                  },
                },
              },
            },
          },
          '404': { description: 'Vežba nije pronađena u Wger-u' },
        },
      },
    },

    // ==================== SECURITY ====================
    '/api/csrf': {
      get: {
        tags: ['Security'],
        summary: 'Dohvatanje CSRF tokena',
        description: 'Vraća CSRF token za zaštitu formi od CSRF napada.',
        security: [],
        responses: {
          '200': {
            description: 'CSRF token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    csrfToken: { type: 'string', description: 'JWT-like CSRF token' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
