'use client';

import { useEffect } from 'react';

export default function SwaggerDocs() {
  useEffect(() => {
    // Dinamički učitaj Swagger UI stilove
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css';
    document.head.appendChild(link);

    // Učitaj Swagger UI JavaScript
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js';
    script.async = true;
    script.onload = () => {
      // Inicijalizuj Swagger UI
      if (typeof window !== 'undefined' && (window as any).SwaggerUIBundle) {
        (window as any).SwaggerUIBundle({
          url: '/api-docs',
          dom_id: '#swagger-ui',
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: 'StandaloneLayout',
          onComplete: () => {
            console.log('✅ Swagger UI učitan uspešno');
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">GymGenius API Documentation</h1>
          <p className="mt-2 text-gray-600">
            Interaktivna OpenAPI 3.0 dokumentacija sa mogućnosti direktnog testiranja endpoint-a
          </p>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div id="swagger-ui" className="max-w-7xl mx-auto px-4 py-8" />

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Uvodne Informacije</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Autentifikacija</h3>
                <p className="text-gray-700 mb-3">
                  API koristi JWT tokene za autentifikaciju. Tokeni se prosleđuju na dva načina:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                  <li>U HttpOnly kolačiću pod imenom <code className="bg-gray-100 px-2 py-1 rounded">token</code></li>
                  <li>U Authorization header-u kao: <code className="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Autentifikacijski Tokeni</h3>
                <p className="text-gray-700 mb-2">
                  Tokeni se dobijaju nakon uspešne registracije ili login-a:
                </p>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..." // JWT Token
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Status Kodovi</h3>
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    <tr>
                      <td className="font-semibold text-green-600">200</td>
                      <td className="text-gray-600">OK - Zahtev je uspešan</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-green-600">201</td>
                      <td className="text-gray-600">Created - Resurs je kreiran</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-blue-600">400</td>
                      <td className="text-gray-600">Bad Request - Nevaljani zahtev ili validaciona greška</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-red-600">401</td>
                      <td className="text-gray-600">Unauthorized - Niste autentifikovani ili token je istekao</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-red-600">403</td>
                      <td className="text-gray-600">Forbidden - Nemate dozvolu za ovu akciju</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-orange-600">404</td>
                      <td className="text-gray-600">Not Found - Traženi resurs nije pronađen</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-red-600">500</td>
                      <td className="text-gray-600">Server Error - Greška na serveru</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
                <p className="text-gray-700 mb-2">Svi error-i vraćaju standardizovani JSON format:</p>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "success": false,
  "message": "Detaljno objašnjenje greške",
  "code": "ERROR_CODE"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Dostupne API Grupe (Tagovi)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-blue-200 rounded p-4">
                    <span className="font-semibold text-blue-600 block mb-1">Auth</span>
                    <p className="text-sm text-gray-600">Registracija, login, logout, korisnički podaci</p>
                  </div>
                  <div className="border border-green-200 rounded p-4">
                    <span className="font-semibold text-green-600 block mb-1">Exercises</span>
                    <p className="text-sm text-gray-600">Vežbe iz Wger baze i njihove detalje</p>
                  </div>
                  <div className="border border-purple-200 rounded p-4">
                    <span className="font-semibold text-purple-600 block mb-1">Workouts</span>
                    <p className="text-sm text-gray-600">Workout planovi i logovanje treninga</p>
                  </div>
                  <div className="border border-yellow-200 rounded p-4">
                    <span className="font-semibold text-yellow-600 block mb-1">Challenges</span>
                    <p className="text-sm text-gray-600">Fitness izazovi i leaderboardovi</p>
                  </div>
                  <div className="border border-pink-200 rounded p-4">
                    <span className="font-semibold text-pink-600 block mb-1">Notifications</span>
                    <p className="text-sm text-gray-600">Notifikacije i korisničke preference</p>
                  </div>
                  <div className="border border-indigo-200 rounded p-4">
                    <span className="font-semibold text-indigo-600 block mb-1">AI</span>
                    <p className="text-sm text-gray-600">AI workout generisanje (Ollama Llama 3.2)</p>
                  </div>
                  <div className="border border-red-200 rounded p-4">
                    <span className="font-semibold text-red-600 block mb-1">Admin</span>
                    <p className="text-sm text-gray-600">Administrativne rute (samo za admin role)</p>
                  </div>
                  <div className="border border-cyan-200 rounded p-4">
                    <span className="font-semibold text-cyan-600 block mb-1">Stats</span>
                    <p className="text-sm text-gray-600">Statistika korisnika i sistemske metrike</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Rate Limiting</h3>
                <p className="text-gray-700">
                  Trenutno nema rate limitinga. Planira se implementacija u budućim verzijama.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-900">Testiranje API-ja</h3>
                <p className="text-blue-800 mb-3">
                  Gore vidite interaktivni Swagger UI interfejs. Možete:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                  <li>Kliknuti na endpoint za prikaz detalja</li>
                  <li>Kliknuti "Try it out" dugme</li>
                  <li>Popuniti parametre i body</li>
                  <li>Kliknuti "Execute" da pošaljete zahtev</li>
                  <li>Videti odgovor servera u realnom vremenu</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>GymGenius MVP v1.0.0 | API dokumentacija | OpenAPI 3.0</p>
        </div>
      </div>
    </div>
  );
}
