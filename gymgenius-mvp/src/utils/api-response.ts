import { NextResponse } from 'next/server';

/**
 * Standardizovani API odgovor za uspeh
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Standardizovani API odgovor za grešku
 */
export function errorResponse(message: string, status = 400, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errors,
    },
    { status }
  );
}

/**
 * Odgovor za neautorizovan pristup
 */
export function unauthorizedResponse(message = 'Unauthorized access') {
  return errorResponse(message, 401);
}

/**
 * Odgovor za zabranjeni pristup
 */
export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403);
}

/**
 * Odgovor za resurs koji nije pronađen
 */
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}