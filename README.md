# ToDo App API

API REST para gestión de tareas con Express, Prisma y TypeScript.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5.x
- **ORM:** Prisma 7.x
- **Database:** PostgreSQL
- **Validation:** Zod 4.x
- **Logging:** Pino
- **Language:** TypeScript 5.x

## Instalación

git clone <repo-url>
cd todoapp
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma migrate dev
pnpm dev

## Scripts

| Comando | Descripción |
|---------|-------------|
| pnpm dev | Servidor en modo desarrollo |
| pnpm build | Compilar TypeScript |
| pnpm start | Servidor en producción |
| pnpm prisma studio | GUI de base de datos |

## API Endpoints

### Health Checks
GET /health       # Status básico
GET /health/ready # Status + DB check

### Tasks API v1
GET    /api/v1/tasks     # Listar tareas
GET    /api/v1/tasks/:id # Obtener por ID
POST   /api/v1/tasks     # Crear tarea
PUT    /api/v1/tasks/:id # Actualizar completo
PATCH  /api/v1/tasks/:id # Actualizar parcial
DELETE /api/v1/tasks/:id # Eliminar

# Crear tarea
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi tarea", "description": "Descripción"}'

# Response esperado
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Mi tarea",
    "description": "Descripción",
    "completed": false,
    "createdAt": "2024-12-22T10:00:00.000Z",
    "updatedAt": "2024-12-22T10:00:00.000Z"
  }
}

## Estructura

src/
├── controllers/  # HTTP handlers
├── middleware/   # Express middleware
├── routes/       # API routes
├── schemas/      # Zod schemas
├── services/     # Business logic
├── types/        # TypeScript types
├── lib/          # Utilities
└── index.ts      # Entry point

## Licencia

MIT