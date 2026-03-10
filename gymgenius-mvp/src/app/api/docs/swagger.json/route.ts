import { NextRequest, NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';

/**
 * @swagger
 * /api/docs/swagger.json:
 *   get:
 *     summary: Get Swagger OpenAPI specification
 *     tags: [Documentation]
 *     description: Returns the complete OpenAPI/Swagger specification in JSON format for programmatic consumption
 *     responses:
 *       200:
 *         description: OpenAPI specification in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openapi:
 *                   type: string
 *                   example: "3.0.0"
 *                 info:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     version:
 *                       type: string
 *                     description:
 *                       type: string
 *                 servers:
 *                   type: array
 *                   items:
 *                     type: object
 *                 paths:
 *                   type: object
 *                 components:
 *                   type: object
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(swaggerSpec, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
