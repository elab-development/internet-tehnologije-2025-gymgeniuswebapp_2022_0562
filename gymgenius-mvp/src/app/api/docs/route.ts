import { NextRequest, NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Swagger API documentation UI
 *     tags: [Documentation]
 *     description: Returns the Swagger UI for interactive API documentation
 *     responses:
 *       200:
 *         description: Swagger UI HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>GymGenius MVP API - Swagger Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css">
    <style>
      html{
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after{
        box-sizing: inherit;
      }
      body {
        margin:0;
        padding:0;
      }
      .topbar {
        background-color: #1e90ff;
        padding: 10px 20px;
        color: white;
        font-size: 18px;
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <div class="topbar">
      <span>🏋️ GymGenius MVP API Documentation</span>
    </div>
    <div id="swagger-ui"></div>

    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
    <script>
      const ui = SwaggerUIBundle({
        url: "/api/docs/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      })
      window.onload = function() {
        // any onload code
      }
    </script>
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

/**
 * @swagger
 * /api/docs/swagger.json:
 *   get:
 *     summary: Get Swagger OpenAPI specification
 *     tags: [Documentation]
 *     description: Returns the complete OpenAPI/Swagger specification in JSON format
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function HEAD(request: NextRequest) {
  // swagger.json route handled separately
  return new NextResponse(null, { status: 404 });
}
