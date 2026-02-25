# 🔐 Security Measures - GymGenius

This document outlines the security measures implemented in the GymGenius application to protect against common web vulnerabilities.

---

## 🛡 Implemented Security Measures

### 1. **CSRF (Cross-Site Request Forgery) Protection**

**Threat:** Attacker tricks authenticated user into executing unwanted actions.

**Implementation:**
- CSRF tokens generated server-side and validated on state-changing requests
- Tokens stored in httpOnly cookies and validated in middleware
- Double-submit cookie pattern for API routes

**Files:**
- `src/lib/csrf.ts` - CSRF token generation and validation
- `src/middleware.ts` - CSRF validation middleware
- `src/app/api/*/route.ts` - CSRF token validation on POST/PUT/DELETE

**Testing:**
```bash
# Valid request with CSRF token
curl -X POST http://localhost:3000/api/workouts \
  -H "Cookie: token=...; csrf-token=..." \
  -H "X-CSRF-Token: ..." \
  -d '{"name": "Test"}'

# Invalid request without CSRF token (should fail)
curl -X POST http://localhost:3000/api/workouts \
  -H "Cookie: token=..." \
  -d '{"name": "Test"}'
```

---

### 2. **XSS (Cross-Site Scripting) Protection**

**Threat:** Attacker injects malicious scripts into web pages viewed by other users.

**Implementation:**
- All user inputs sanitized using DOMPurify
- Content Security Policy (CSP) headers
- React's built-in XSS protection (JSX escaping)
- Validation of all text inputs before storage

**Files:**
- `src/utils/validation.ts` - Input sanitization functions
- `src/middleware.ts` - CSP headers
- All API routes - Input validation

**Example:**
```typescript
// Before: Vulnerable
const userInput = req.body.name;
db.save({ name: userInput }); // ❌ XSS risk

// After: Protected
const userInput = sanitizeString(req.body.name);
db.save({ name: userInput }); // ✅ Safe
```

---

### 3. **CORS (Cross-Origin Resource Sharing) Protection**

**Threat:** Unauthorized domains accessing API resources.

**Implementation:**
- Whitelist of allowed origins
- CORS headers configured in middleware
- Preflight request handling
- Credentials validation

**Files:**
- `src/middleware.ts` - CORS configuration
- `next.config.ts` - CORS headers

**Configuration:**
```typescript
const allowedOrigins = [
  'https://gymgenius.com',
  'https://www.gymgenius.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);
```

---

### 4. **IDOR (Insecure Direct Object Reference) Protection**

**Threat:** Attacker accesses resources by manipulating object IDs.

**Implementation:**
- Authorization checks on all resource access
- User ID validation from JWT token
- Resource ownership verification
- No sequential/predictable IDs (using Firebase auto-generated IDs)

**Files:**
- `src/middleware.ts` - User ID extraction from JWT
- All API routes - Ownership validation

**Example:**
```typescript
// Before: Vulnerable
const workout = await db.collection('workouts').doc(workoutId).get();
return workout; // ❌ IDOR risk

// After: Protected
const workout = await db.collection('workouts').doc(workoutId).get();
if (workout.userId !== requestUserId) {
  return forbiddenResponse(); // ✅ Safe
}
return workout;
```

---

### 5. **SQL Injection Protection**

**Threat:** Attacker injects malicious SQL code through input fields.

**Implementation:**
- Using Firestore (NoSQL) which is inherently protected
- All queries use parameterized methods
- Input validation and sanitization
- No raw query construction

**Note:** Firestore SDK prevents SQL injection by design, but we still validate all inputs.

---

### 6. **Authentication & Authorization**

**Implementation:**
- JWT tokens with expiration (7 days)
- HttpOnly cookies (prevents XSS token theft)
- Secure flag in production
- Role-based access control (RBAC)
- Password hashing (Firebase Auth)

**Files:**
- `src/utils/jwt.ts` - JWT generation and validation
- `src/middleware.ts` - Authentication middleware
- `src/app/api/auth/*/route.ts` - Auth endpoints

---

### 7. **Rate Limiting (Future Enhancement)**

**Planned Implementation:**
- API rate limiting per user/IP
- Brute-force protection on login
- DDoS mitigation

---

## 🧪 Security Testing

### Automated Tests
```bash
npm run test:security
```

### Manual Testing Checklist
- [ ] **CSRF:** Try POST request without CSRF token (should fail)
- [ ] **XSS:** Submit `<script>alert('xss')</script>` in form (should be sanitized)
- [ ] **CORS:** Request from unauthorized origin (should be blocked)
- [ ] **IDOR:** Try accessing another user's workout (should return 403)
- [ ] **Auth:** Try accessing protected route without token (should return 401)

---

## 📊 Security Audit Results

| Vulnerability | Status | Severity | Notes |
|---|---|---|---|
| CSRF | ✅ Protected | High | Double-submit cookie pattern |
| XSS | ✅ Protected | High | DOMPurify + CSP headers |
| CORS | ✅ Protected | Medium | Whitelist configured |
| IDOR | ✅ Protected | High | Ownership validation |
| SQL Injection | ✅ Protected | High | Firestore (NoSQL) |
| Broken Auth | ✅ Protected | Critical | JWT + httpOnly cookies |

---

## 🔄 Security Updates

- 2024-01-XX: Initial security implementation
- 2024-01-XX: Added CSRF protection
- 2024-01-XX: Implemented XSS sanitization
- 2024-01-XX: CORS whitelist configured

---

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email: security@gymgenius.com

Do not create public GitHub issues for security vulnerabilities.

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
