import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GymGenius API',
      version: '1.0.0',
      description: 'AI-powered fitness tracking platform - REST API documentation',
      contact: {
        name: 'GymGenius Team',
        email: 'support@gymgenius.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://gymgenius.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'abc123' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            role: { type: 'string', enum: ['guest', 'user', 'premium', 'admin'], example: 'user' },
            displayName: { type: 'string', example: 'John Doe' },
            age: { type: 'number', example: 25 },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
            weight: { type: 'number', example: 75 },
            height: { type: 'number', example: 180 },
          },
        },
        Exercise: {
          type: 'object',
          properties: {
            exerciseId: { type: 'string', example: 'ex123' },
            name: { type: 'string', example: 'Bench Press' },
            description: { type: 'string', example: 'Compound chest exercise' },
            primaryMuscleGroup: { type: 'string', example: 'chest' },
            equipment: { type: 'string', example: 'barbell' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
          },
        },
        WorkoutPlan: {
          type: 'object',
          properties: {
            planId: { type: 'string', example: 'plan123' },
            userId: { type: 'string', example: 'user123' },
            name: { type: 'string', example: 'Push Day - Upper Body' },
            goal: { type: 'string', example: 'muscle_gain' },
            difficulty: { type: 'string', example: 'intermediate' },
            durationWeeks: { type: 'number', example: 8 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Exercises', description: 'Exercise management' },
      { name: 'Workouts', description: 'Workout plan management' },
      { name: 'Users', description: 'User profile management' },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // Path to API routes
};

export const swaggerSpec = swaggerJsdoc(options);
