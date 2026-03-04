/**
 * API Client utility
 * Automatski dodaje CSRF token u state-changing zahteve (double-submit cookie pattern)
 */

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Čita CSRF token iz cookie-ja (cookie je non-httpOnly, čitljiv iz JS-a)
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Fetch wrapper koji automatski dodaje CSRF token za POST/PUT/DELETE/PATCH
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (STATE_CHANGING_METHODS.includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers['x-csrf-token'] = csrf;
    }
  }

  return fetch(url, { ...options, headers });
}
