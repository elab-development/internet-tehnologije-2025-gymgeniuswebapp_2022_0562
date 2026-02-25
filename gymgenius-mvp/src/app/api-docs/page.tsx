'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamic import da izbegnemo SSR probleme
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Import swagger spec
import { swaggerSpec } from '@/lib/swagger';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📚 GymGenius API Documentation
          </h1>
          <p className="text-gray-600 mt-2">
            Complete REST API reference for GymGenius platform
          </p>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SwaggerUI spec={swaggerSpec} />
      </div>
    </div>
  );
}
