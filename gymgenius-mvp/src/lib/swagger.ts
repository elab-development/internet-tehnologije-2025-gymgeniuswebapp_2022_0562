import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GymGenius MVP API',
      version: '1.0.0',
      description: 'Fitness aplikacija sa AI-powered personalizovanim workout planovima',
      contact: {
        name: 'GymGenius Team',
        email: 'support@gymgenius.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
        description: 'Development server',
      },
      {
        url: 'https://gymgenius-mvp.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token from authentication',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'HttpOnly cookie with JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            displayName: {
              type: 'string',
              description: 'User display name',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'guest'],
              description: 'User role',
            },
            age: {
              type: 'number',
              description: 'User age',
            },
            weight: {
              type: 'number',
              description: 'User weight in kg',
            },
            height: {
              type: 'number',
              description: 'User height in cm',
            },
            goal: {
              type: 'string',
              enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'],
              description: 'Fitness goal',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Exercise: {
          type: 'object',
          properties: {
            exerciseId: {
              type: 'string',
              description: 'Unique exercise identifier',
            },
            name: {
              type: 'string',
              description: 'Exercise name',
            },
            description: {
              type: 'string',
              description: 'Exercise description',
            },
            primaryMuscleGroup: {
              type: 'string',
              description: 'Primary muscle group targeted',
            },
            secondaryMuscleGroups: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Secondary muscle groups',
            },
            equipment: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Required equipment',
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Exercise difficulty',
            },
          },
        },
        WorkoutPlan: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'Unique workout plan identifier',
            },
            userId: {
              type: 'string',
              description: 'Owner user ID',
            },
            name: {
              type: 'string',
              description: 'Workout plan name',
            },
            goal: {
              type: 'string',
              description: 'Workout goal',
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Plan difficulty',
            },
            durationWeeks: {
              type: 'number',
              description: 'Duration in weeks',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Plan creation timestamp',
            },
          },
        },
        Challenge: {
          type: 'object',
          properties: {
            challengeId: {
              type: 'string',
              description: 'Unique challenge identifier',
            },
            name: {
              type: 'string',
              description: 'Challenge name',
            },
            description: {
              type: 'string',
              description: 'Challenge description',
            },
            type: {
              type: 'string',
              enum: ['weight_loss', 'muscle_gain', 'step_count', 'workout_streak'],
              description: 'Challenge type',
            },
            targetValue: {
              type: 'number',
              description: 'Target value to achieve',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Challenge start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Challenge end date',
            },
            participantCount: {
              type: 'number',
              description: 'Number of participants',
            },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            notificationId: {
              type: 'string',
              description: 'Unique notification identifier',
            },
            userId: {
              type: 'string',
              description: 'Recipient user ID',
            },
            type: {
              type: 'string',
              enum: ['WORKOUT_REMINDER', 'MEAL_REMINDER', 'CHALLENGE_UPDATE', 'ACHIEVEMENT', 'SYSTEM'],
              description: 'Notification type',
            },
            title: {
              type: 'string',
              description: 'Notification title',
            },
            message: {
              type: 'string',
              description: 'Notification message',
            },
            isRead: {
              type: 'boolean',
              description: 'Read status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/app/api/**/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
