# ToDo App API

API REST para gestión de tareas con autenticación JWT, Express, Prisma y TypeScript.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5.x
- **ORM:** Prisma 7.x
- **Database:** PostgreSQL
- **Validation:** Zod 4.x
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Hashing:** bcrypt
- **Logging:** Pino
- **Language:** TypeScript 5.x

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd todoapp

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (mínimo 32 caracteres)
# - JWT_EXPIRES_IN (ej: "7d")
# - BCRYPT_SALT_ROUNDS (recomendado: 12)

# Iniciar base de datos
docker compose up -d

# Ejecutar migraciones
pnpm prisma migrate dev

# Iniciar servidor
pnpm dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor en modo desarrollo |
| `pnpm build` | Compilar TypeScript |
| `pnpm start` | Servidor en producción |
| `pnpm prisma studio` | GUI de base de datos |

## API Endpoints

### Health Checks

```bash
GET /health       # Status básico
GET /health/ready # Status + DB check
```

### Authentication (Public)

```bash
POST /api/v1/auth/signup  # Registrar nuevo usuario
POST /api/v1/auth/login   # Iniciar sesión
GET  /api/v1/auth/me      # Obtener usuario actual (requiere token)
```

### Tasks API v1 (Requiere Autenticación)

Todos los endpoints de tasks requieren el header `Authorization: Bearer <token>`

```bash
GET    /api/v1/tasks     # Listar tareas del usuario
GET    /api/v1/tasks/:id # Obtener tarea por ID
POST   /api/v1/tasks     # Crear tarea
PUT    /api/v1/tasks/:id # Actualizar tarea
DELETE /api/v1/tasks/:id # Eliminar tarea
```

## Ejemplos de uso

### 1. Registro de usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "MiPassword123"
  }'

# Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123",
      "createdAt": "2024-12-24T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Inicio de sesión

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "MiPassword123"
  }'

# Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Crear tarea (requiere token)

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "Mi tarea",
    "description": "Descripción de la tarea"
  }'

# Response
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Mi tarea",
    "description": "Descripción de la tarea",
    "completed": false,
    "userId": 1,
    "createdAt": "2024-12-24T10:00:00.000Z",
    "updatedAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 4. Listar tareas del usuario

```bash
curl -X GET http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mi tarea",
      "description": "Descripción de la tarea",
      "completed": false,
      "userId": 1,
      "createdAt": "2024-12-24T10:00:00.000Z",
      "updatedAt": "2024-12-24T10:00:00.000Z"
    }
  ]
}
```

## Modelo de Datos

### User
- `id`: Integer (autoincrement)
- `username`: String (único, 3-20 caracteres, alfanumérico + guión bajo)
- `password`: String (hasheado con bcrypt, 8-100 caracteres)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `tasks`: Task[] (relación uno a muchos)

### Task
- `id`: Integer (autoincrement)
- `title`: String (requerido, 1-200 caracteres)
- `description`: String (opcional, max 1000 caracteres)
- `completed`: Boolean (default: false)
- `userId`: Integer (foreign key a User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Características de Seguridad

- **Autenticación JWT**: Tokens firmados con HS256
- **Password Hashing**: bcrypt con 12 salt rounds
- **Validación de entrada**: Schemas Zod en todos los endpoints
- **Ownership Validation**: Los usuarios solo pueden acceder a sus propias tareas
- **Token Expiration**: Configurable (default: 7 días)
- **Password Requirements**: Mínimo 8 caracteres, debe contener mayúscula, minúscula y número

## Validaciones

### Signup
- Username: 3-20 caracteres, solo letras, números y guión bajo
- Password: Mínimo 8 caracteres, debe contener al menos una mayúscula, una minúscula y un número

### Login
- Username y password requeridos

### Tasks
- Title: Requerido, 1-200 caracteres
- Description: Opcional, máximo 1000 caracteres
- Completed: Boolean (opcional en creación, default: false)

## Estructura

```
src/
├── controllers/    # HTTP handlers (task, auth)
├── middleware/     # Express middleware (auth, error handling, validation)
├── routes/         # API routes (health, auth, tasks)
├── schemas/        # Zod schemas (auth, task)
├── services/       # Business logic (task, user)
├── types/          # TypeScript types
├── lib/            # Utilities (jwt, bcrypt, prisma)
└── index.ts        # Entry point
```

## Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET="tu_clave_secreta_minimo_32_caracteres_muy_segura"
JWT_EXPIRES_IN="7d"

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## Arquitectura

El proyecto sigue una arquitectura en capas:

1. **Routes**: Define los endpoints y aplica middleware
2. **Middleware**: Validación (Zod), autenticación (JWT), manejo de errores
3. **Controllers**: Maneja las peticiones HTTP y respuestas
4. **Services**: Lógica de negocio y acceso a datos
5. **Prisma**: ORM para interactuar con PostgreSQL

## Manejo de Errores

Todos los errores se manejan de forma centralizada:

- **400 Bad Request**: Validación fallida (Zod)
- **401 Unauthorized**: Token inválido o expirado
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Usuario ya existe
- **500 Internal Server Error**: Errores del servidor

Formato de respuesta de error:
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation error",
    "details": [...]
  }
}
```

## Desarrollo

Para más información sobre patrones de código, mejores prácticas y problemas comunes, consulta el archivo `CLAUDE.md` en la raíz del proyecto.

## Licencia

MIT
