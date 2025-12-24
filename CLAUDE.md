# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToDo App API - A REST API for task management built with Express, TypeScript, Prisma, and PostgreSQL. Features JWT authentication with bcrypt, multi-tenant architecture where each user manages their own tasks.

**Tech Stack:** Express 5.x, TypeScript 5.x, Prisma 7.x, PostgreSQL, Zod 4.x, Pino (logging)

## Development Commands

```bash
# Development
pnpm dev                          # Start dev server with nodemon
pnpm build                        # Compile TypeScript to dist/
pnpm start                        # Run production build

# Database
docker compose up -d              # Start PostgreSQL
pnpm prisma migrate dev           # Create and apply migration
pnpm prisma migrate dev --name <name>  # Named migration
pnpm prisma migrate reset         # Reset DB (development only)
pnpm prisma generate              # Regenerate Prisma Client after schema changes
pnpm prisma studio                # Open Prisma Studio GUI

# Required before first run
cp .env.example .env              # Configure environment variables
pnpm install                      # Install dependencies
```

## Architecture & Key Patterns

### Layered Architecture
```
Request → Middleware → Controller → Service → Prisma → Database
                ↓                                ↑
         Error Handler ←──────────────────────────┘
```

**Responsibilities:**
- **Middleware:** Validation (Zod), authentication (JWT), logging, request ID
- **Controllers:** HTTP handling, status codes, response formatting (never business logic)
- **Services:** Business logic, ownership validation, data transformation
- **Prisma:** Database access layer

### Path Aliases (tsconfig.json)
Uses `@/*` imports mapped to `src/*`:
```typescript
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middleware/AppError';
import type { JwtPayload } from '@/types/auth.types';
```

### Authentication Flow
1. User signs up/logs in → receives JWT token (7-day expiry, HS256 algorithm)
2. Client sends token in header: `Authorization: Bearer <token>`
3. `authenticate` middleware extracts token, verifies with `verifyToken()`, sets `req.user`
4. All `/api/v1/tasks` routes require authentication via `router.use(authenticate)`
5. Services validate ownership: `WHERE id = X AND userId = Y`

### Error Handling Strategy
- **AppError class:** Operational errors (400, 401, 404, 409) with factory methods
- **Global errorHandler:** Catches all errors, transforms to standard format
- **Specific handlers:** Zod validation errors, Prisma errors (P2002=conflict, P2025=not found)
- **Response format:**
  ```json
  {
    "success": false,
    "error": "Bad Request",
    "message": "Validation failed",
    "requestId": "uuid",
    "errors": { "field": ["error message"] }
  }
  ```

### Middleware Order (Critical)
Order matters in `src/index.ts`:
1. `helmet()` - Security headers
2. `compression()` - Response compression
3. `requestIdMiddleware` - Assign UUID to each request
4. `httpLogger` - Pino HTTP logging
5. `cors()` - CORS configuration
6. `express.json()` - Body parsing
7. Routes (`/health`, `/api`)
8. `notFoundHandler` - 404 handler
9. `errorHandler` - Error handler (MUST be last)

### Database Schema
- **User:** `id`, `username` (unique), `password` (bcrypt hashed), timestamps, `tasks[]`
- **Task:** `id`, `title`, `description?`, `completed`, timestamps, `userId` (FK with cascade delete)
- **Indexes:** username, userId, completed, createdAt DESC
- **Relationship:** 1 User → N Tasks (cascade delete)

## Critical TypeScript Patterns

### 1. Controller Typing (Important)
**DO NOT use generic types with `asyncHandler`** - causes type conflicts:

```typescript
// ✅ CORRECT
getById: asyncHandler(async (
  req: Request,  // No generics
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  // ...
}) as RequestHandler,

// ❌ INCORRECT - causes "No overload matches" errors
getById: asyncHandler(async (
  req: Request<TaskIdParam>,  // Don't use generics
  res: Response
): Promise<void> => {
```

Reason: Zod validation middleware guarantees params exist; generics add complexity without benefit.

### 2. JWT Type Assertions (Required)
TypeScript can't infer JWT options correctly - use type assertions:

```typescript
jwt.sign(
  payload,
  JWT_SECRET,
  { expiresIn: '7d', algorithm: 'HS256' } as jwt.SignOptions  // Required
);

jwt.verify(
  token,
  JWT_SECRET,
  { algorithms: ['HS256'] } as jwt.VerifyOptions  // Required
);
```

### 3. Zod v4 Syntax (Breaking Change)
**CRITICAL:** Zod 4.x deprecated `required_error` - use `message` instead:

```typescript
// ✅ CORRECT (Zod v4)
z.string({ message: 'Username is required' })

// ❌ INCORRECT (deprecated, will cause warnings)
z.string({ required_error: 'Username is required' })
```

### 4. Types vs Schemas
- **Schema types** (inferred from Zod): Keep in schema files, export with schema
  ```typescript
  // src/schemas/task.schema.ts
  export type TaskIdParam = z.infer<typeof taskIdParamSchema>['params'];
  ```
- **Business types**: Keep in `src/types/*.types.ts`
  ```typescript
  // src/types/task.types.ts
  export interface CreateTaskInput { title: string; description?: string; }
  ```

## Security Patterns

### Authentication
- Passwords: bcrypt with SALT_ROUNDS=12
- JWT_SECRET: Minimum 32 characters (validated at startup)
- Token format: `Bearer <token>` in Authorization header
- Same error message for "user not found" vs "wrong password" (prevents user enumeration)

### Ownership Validation
ALL service methods that access user data MUST validate ownership:
```typescript
async findById(id: number, userId: number) {
  const task = await prisma.task.findFirst({
    where: { id, userId }  // Always filter by userId
  });
  if (!task) throw AppError.notFound('Task not found');  // 404 even if exists but wrong user
  return task;
}
```

### Password Handling
Never return password field:
```typescript
function excludePassword(user: any): UserResponse {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

## Environment Variables

Required in `.env`:
```bash
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/todoapp?schema=public"
JWT_SECRET="min-32-chars-random-string"  # Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_EXPIRES_IN="7d"
```

## API Endpoints

**Health:** `GET /health`, `GET /health/ready` (includes DB check)

**Auth:** `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me` 🔒

**Tasks** (all require auth 🔒):
- `GET /api/v1/tasks` - List user's tasks
- `GET /api/v1/tasks/:id` - Get task (validates ownership)
- `POST /api/v1/tasks` - Create task
- `PUT/PATCH /api/v1/tasks/:id` - Update task (validates ownership)
- `DELETE /api/v1/tasks/:id` - Delete task (validates ownership)

## Common Pitfalls

1. **Adding middleware after routes** - Middleware won't apply (check order in index.ts)
2. **Forgetting userId in service calls** - Tasks will leak between users
3. **Using `required_error` in Zod** - Deprecated in v4, use `message`
4. **Generic types with asyncHandler** - Causes TypeScript errors, avoid
5. **Forgetting Prisma generate** - After schema changes, regenerate client
6. **Missing JWT_SECRET validation** - Always validate length ≥ 32 chars at startup
7. **Returning passwords** - Always use `excludePassword()` helper

## Project Context Reference

For detailed session history, architectural decisions, and resolved issues, see: **📋 Project Context & Session Memory** page in Notion workspace (created 2025-12-24).
