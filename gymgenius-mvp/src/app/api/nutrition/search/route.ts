import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/nutrition/search:
 *   get:
 *     summary: Search food database via Open Food Facts API
 *     tags: [Nutrition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: "banana"
 *         description: Food name to search for
 *     responses:
 *       200:
 *         description: List of matching foods with nutritional data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     foods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           calories:
 *                             type: number
 *                           protein:
 *                             type: number
 *                           carbs:
 *                             type: number
 *                           fat:
 *                             type: number
 *                           serving:
 *                             type: string
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return errorResponse('Search query must be at least 2 characters', 400);
    }

    // Open Food Facts API - besplatno, bez API ključa
    const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    url.searchParams.set('search_terms', query.trim());
    url.searchParams.set('search_simple', '1');
    url.searchParams.set('action', 'process');
    url.searchParams.set('json', '1');
    url.searchParams.set('page_size', '10');
    url.searchParams.set('fields', 'product_name,nutriments,serving_size,brands');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'GymGenius/1.0 (https://gymgenius-mvp.vercel.app)' },
      next: { revalidate: 3600 }, // Cache rezultate 1h
    });

    if (!response.ok) {
      return errorResponse('Food database search failed', 502);
    }

    const data = await response.json();

    const foods = (data.products || [])
      .filter((p: any) => p.product_name && p.nutriments)
      .slice(0, 10)
      .map((product: any) => {
        const n = product.nutriments;
        return {
          name: product.product_name,
          brand: product.brands || '',
          serving: product.serving_size || '100g',
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((n.fat_100g || 0) * 10) / 10,
        };
      })
      .filter((f: any) => f.calories > 0); // Filtriraj nepotpune rezultate

    return successResponse({ foods, query, count: foods.length });
  } catch (error) {
    console.error('Nutrition search error:', error);
    return errorResponse('Failed to search food database', 500);
  }
}
