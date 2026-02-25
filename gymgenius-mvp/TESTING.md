# 🧪 Testing Guide - GymGenius MVP

## Overview

GymGenius has comprehensive test coverage with **81 automated tests** covering:
- Unit tests for utility functions and components
- Integration tests for API routes
- Security tests for CSRF, XSS, CORS, IDOR protection
- Component tests for React components

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Auto-rerun on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Security Tests Only
```bash
npm run test:security
```

## Test Structure

### Test Suites (12 total)

#### 1. **Authentication Tests**
- **File**: `src/app/api/auth/__tests__/register.integration.test.ts`
- **Coverage**: User registration, validation, duplicate email handling
- **Type**: Integration tests
- **Commands tested**: POST /api/auth/register

#### 2. **Workout Management Tests**
- **File**: `src/app/api/workouts/__tests__/workouts.integration.test.ts`
- **Coverage**: Create, read, list workouts
- **Type**: Integration tests
- **Commands tested**: GET/POST /api/workouts

#### 3. **IDOR Security Tests**
- **File**: `src/app/api/workouts/__tests__/idor.security.test.ts`
- **Coverage**: User can't access other users' workouts
- **Type**: Security tests
- **Validation**: Ownership checks on all resources

#### 4. **CSRF Protection Tests**
- **File**: `src/lib/__tests__/csrf.security.test.ts`
- **Coverage**: Token generation, validation, prevention of CSRF attacks
- **Type**: Security tests
- **Methods**: Double-submit cookie validation

#### 5. **Component Tests - UI**
- **Files**:
  - `src/components/ui/__tests__/Button.test.tsx`
  - `src/components/ui/__tests__/Card.test.tsx`
  - `src/components/ui/__tests__/Input.test.tsx`
- **Coverage**: Rendering, props, interactions
- **Type**: Unit tests

#### 6. **Component Tests - Charts**
- **File**: `src/components/charts/__tests__/ProgressChart.test.tsx`
- **Coverage**: Chart rendering with mock data
- **Type**: Component tests

#### 7. **Ollama AI Tests**
- **File**: `src/lib/__tests__/ollama.test.ts`
- **Coverage**: API connectivity, prompt generation, error handling
- **Type**: Integration tests

#### 8. **Wger API Tests**
- **File**: `src/lib/__tests__/wger.test.ts`
- **Coverage**: Exercise search, sync operations, API error handling
- **Type**: Integration tests

#### 9. **Security Utility Tests**
- **File**: `src/utils/__tests__/security.test.ts`
- **Coverage**: Input sanitization, DOMPurify integration, XSS prevention
- **Type**: Unit tests

#### 10. **Validation Tests**
- **File**: `src/utils/__tests__/validation.test.ts`
- **Coverage**: Email, password, exercise validation
- **Type**: Unit tests

### Test Statistics

```
Test Suites: 12 passed, 12 total
Tests:       81 passed, 81 total
Snapshots:   0 total
Time:        ~4 seconds
```

## Test Categories

### Unit Tests
Tests for individual functions and utilities:
- Security utilities (sanitization, validation)
- API response helpers
- JWT token generation
- CSRF token handling

### Integration Tests
Tests for API routes with database interactions:
- User registration flow
- Workout creation and retrieval
- Challenge participation
- Notification sending

### Security Tests
Specialized tests for security vulnerabilities:
- **CSRF**: Token validation and prevention
- **IDOR**: Ownership checks on all resources
- **XSS**: Input sanitization and output encoding
- **CORS**: Origin validation

### Component Tests
React component rendering and interaction:
- UI components (Button, Card, Input)
- Chart components with data visualization
- Layout components with state management

## Coverage Threshold

Current configuration: **50% minimum**
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

Actual coverage is higher for most test files.

## Mock Data & Fixtures

### Firebase Mocking
Tests use `firebase-admin` SDK with mocked Firestore operations:
```typescript
jest.mock('firebase-admin/firestore');
```

### HTTP Mocking
External API calls are mocked using:
- **MSW** (Mock Service Worker) for HTTP interception
- **Nock** for Node.js HTTP mocking
- **node-mocks-http** for Node.js req/res objects

## Running Specific Tests

### Run single test file
```bash
npm test -- src/app/api/auth/__tests__/register.integration.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="CSRF"
```

### Run with verbose output
```bash
npm test -- --verbose
```

## CI/CD Integration

Tests run automatically on every push via GitHub Actions:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run ESLint
5. Run TypeScript check
6. **Run Jest tests** ← You are here
7. Build project
8. Deploy if all pass

### GitHub Actions Workflow
File: `.github/workflows/ci.yml` (if exists) or checks in `deploy.yml`

Test failure will prevent merge and deployment.

## Common Test Issues & Solutions

### Issue: Firebase initialization errors
**Solution**: Ensure `.env.test.local` has mock Firebase credentials

### Issue: Timeout errors
**Solution**: Increase Jest timeout: `jest.setTimeout(10000)` in test file

### Issue: Unresolved imports
**Solution**: Check `tsconfig.json` paths configuration

### Issue: Firestore mock not working
**Solution**: Verify `jest.setup.js` is loading before tests

## Adding New Tests

When adding new features, include tests for:

1. **Happy Path**: Feature works as expected
2. **Error Handling**: Gracefully handles errors
3. **Security**: IDOR, CSRF, XSS checks
4. **Edge Cases**: Empty data, missing fields, invalid input

### Test Template
```typescript
describe('Feature Name', () => {
  it('should perform expected behavior', async () => {
    // Setup
    const input = { /* ... */ };

    // Execute
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Setup
    const invalidInput = { /* ... */ };

    // Execute & Assert
    await expect(() => functionUnderTest(invalidInput))
      .rejects.toThrow();
  });
});
```

## Test Best Practices

✅ **DO:**
- Write tests for security-critical functions
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies
- Clean up after tests (teardown)
- Test user-facing workflows

❌ **DON'T:**
- Test implementation details
- Skip security tests
- Leave hardcoded credentials in tests
- Mock too much (test integration)
- Write flaky tests with timeouts

## Performance Tips

- Use `--bail` to stop after first failure: `npm test -- --bail`
- Run tests in parallel (default): `npm test -- --maxWorkers=4`
- Use `testMatch` to run subset of tests
- Clear cache if issues: `npm test -- --clearCache`

## Debugging Tests

### Print values during test
```typescript
console.log('Actual value:', result);
```

### Use debugger
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Run single test
```bash
npm test -- -t "test name"
```

## Coverage Reports

After running `npm run test:coverage`, open:
```bash
open coverage/lcov-report/index.html
```

This shows:
- Line coverage
- Branch coverage
- Function coverage
- Untested code highlighted in red

## Dependencies Used for Testing

- **jest**: Test runner
- **jest-environment-jsdom**: Browser environment simulation
- **@testing-library/react**: React component testing
- **@testing-library/jest-dom**: DOM matchers
- **@testing-library/user-event**: User interaction simulation
- **msw**: HTTP mocking
- **nock**: Node HTTP mocking
- **node-mocks-http**: Node req/res mocking
- **supertest**: HTTP assertion library

## Further Reading

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: 2026-02-25
**Status**: All 81 tests passing ✅
