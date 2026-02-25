import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/utils/api-response';

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [guest, user, premium, admin]
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email or name
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden - Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'admin') {
      return forbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const searchQuery = searchParams.get('search');

    let query = adminDb.collection('users');

    if (roleFilter) {
      query = query.where('role', '==', roleFilter) as any;
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(100).get();

    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Don't return password hash
      const { passwordHash, ...safeData } = data as any;
      return {
        userId: doc.id,
        ...safeData,
      };
    });

    // Client-side search (Firestore limitation)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      users = users.filter(
        (user: any) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.displayName?.toLowerCase().includes(searchLower)
      );
    }

    return successResponse({ users, total: users.length });
  } catch (error) {
    console.error('Admin get users error:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}
