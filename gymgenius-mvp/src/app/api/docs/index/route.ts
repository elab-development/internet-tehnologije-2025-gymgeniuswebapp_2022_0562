import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymGenius MVP API - Documentation Index</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        .navigation {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .nav-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-decoration: none;
            transition: transform 0.3s, box-shadow 0.3s;
            border-left: 5px solid #667eea;
        }
        .nav-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .nav-card h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .nav-card p {
            color: #666;
            font-size: 0.9em;
        }
        .routes {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .route-category {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .route-category h2 {
            color: #667eea;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            font-size: 1.3em;
        }
        .route-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .route-item:last-child {
            border-bottom: none;
        }
        .route-method {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 0.8em;
            margin-right: 10px;
            color: white;
        }
        .method-get {
            background: #61affe;
        }
        .method-post {
            background: #49cc90;
        }
        .method-put {
            background: #fca130;
        }
        .method-delete {
            background: #f93e3e;
        }
        .method-patch {
            background: #50e3c2;
        }
        .route-path {
            font-family: 'Courier New', monospace;
            color: #333;
            font-weight: 500;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2em;
            color: #667eea;
            font-weight: bold;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏋️ GymGenius MVP API</h1>
            <p>Fitness aplikacija sa AI-powered personalizovanim workout planovima</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">37</div>
                <div class="stat-label">API Rute</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">70+</div>
                <div class="stat-label">HTTP Metode</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">100%</div>
                <div class="stat-label">Dokumentovano</div>
            </div>
        </div>

        <div class="navigation">
            <a href="/api/docs" class="nav-card">
                <h3>📚 Swagger UI</h3>
                <p>Interaktivna dokumentacija sa mogućnošću testiranja API-ja</p>
            </a>
            <a href="/api/docs/swagger.json" class="nav-card">
                <h3>📄 OpenAPI JSON</h3>
                <p>Preuzmi OpenAPI specifikaciju u JSON formatu</p>
            </a>
        </div>

        <h2 style="color: white; margin-bottom: 20px; font-size: 1.8em;">API Rute po kategorijama</h2>

        <div class="routes">
            <!-- Auth Routes -->
            <div class="route-category">
                <h2>🔐 Autentifikacija</h2>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/auth/login</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/auth/register</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/auth/logout</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/auth/me</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/auth/reset-password</span>
                </div>
            </div>

            <!-- Workouts Routes -->
            <div class="route-category">
                <h2>💪 Treninzi</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/workouts</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/workouts</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/workouts/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-delete">DELETE</span>
                    <span class="route-path">/api/workouts/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/workout-logs</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/workout-logs</span>
                </div>
            </div>

            <!-- Exercises Routes -->
            <div class="route-category">
                <h2>🏃 Vežbe</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/exercises</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/exercises</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/exercises/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-put">PUT</span>
                    <span class="route-path">/api/exercises/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-delete">DELETE</span>
                    <span class="route-path">/api/exercises/{id}</span>
                </div>
            </div>

            <!-- Goals Routes -->
            <div class="route-category">
                <h2>🎯 Ciljevi</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/goals</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/goals</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-put">PUT</span>
                    <span class="route-path">/api/goals/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-delete">DELETE</span>
                    <span class="route-path">/api/goals/{id}</span>
                </div>
            </div>

            <!-- Meals Routes -->
            <div class="route-category">
                <h2>🍎 Hrana</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/meals</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/meals</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-delete">DELETE</span>
                    <span class="route-path">/api/meals/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/nutrition/calculator</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/nutrition/search</span>
                </div>
            </div>

            <!-- Challenges Routes -->
            <div class="route-category">
                <h2>🏆 Izazovi</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/challenges</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/challenges</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/challenges/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/challenges/{id}/join</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/challenges/{id}/leave</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/challenges/{id}/progress</span>
                </div>
            </div>

            <!-- Notifications Routes -->
            <div class="route-category">
                <h2>🔔 Obaveštenja</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/notifications</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/notifications</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/notifications/{id}/read</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/notifications/read-all</span>
                </div>
            </div>

            <!-- Progress Routes -->
            <div class="route-category">
                <h2>📸 Napredak</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/progress/photos</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/progress/photos</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-delete">DELETE</span>
                    <span class="route-path">/api/progress/photos/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/stats/progress</span>
                </div>
            </div>

            <!-- Admin Routes -->
            <div class="route-category">
                <h2>👨‍💼 Admin</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/admin/stats</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/admin/users</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-put">PUT</span>
                    <span class="route-path">/api/admin/users/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-delete">DELETE</span>
                    <span class="route-path">/api/admin/users/{id}</span>
                </div>
            </div>

            <!-- AI Routes -->
            <div class="route-category">
                <h2>🤖 AI Funkcionalnosti</h2>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/ai/generate-workout</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/premium/ai-weekly-plan</span>
                </div>
            </div>

            <!-- User Routes -->
            <div class="route-category">
                <h2>👤 Korisnik</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/users/profile</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-put">PUT</span>
                    <span class="route-path">/api/users/profile</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/preferences</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-put">PUT</span>
                    <span class="route-path">/api/preferences</span>
                </div>
            </div>

            <!-- External APIs -->
            <div class="route-category">
                <h2>🔗 Spoljašnje API-je</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/wger/search</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/wger/exercises/{id}</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-post">POST</span>
                    <span class="route-path">/api/wger/sync</span>
                </div>
            </div>

            <!-- Utility Routes -->
            <div class="route-category">
                <h2>🔧 Pomoćne rute</h2>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/csrf</span>
                </div>
                <div class="route-item">
                    <span class="route-method method-get">GET</span>
                    <span class="route-path">/api/uploads/{path}</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
