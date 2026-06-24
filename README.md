# Nexo

Centro de control personal para dirigir proyectos, tareas, activos digitales, vencimientos, ideas, revisiones y foco semanal sin la burocracia de una herramienta corporativa.

## Qué incluye

- Dashboard de atención inmediata, foco semanal y KPIs.
- Proyectos con próxima acción obligatoria y ficha 360.
- Tareas en vistas Hoy, Todas, Inbox y Kanban.
- Congelador, mapa del ecosistema e incubadora de ideas.
- Activos digitales sin contraseñas en texto plano.
- Vencimientos y revisiones agrupados por urgencia.
- Captura rápida global y diseño responsive.
- API REST, Prisma/PostgreSQL, migración y seed.
- Login local con bcrypt y sesión JWT en cookie `httpOnly`.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma 6 y PostgreSQL 16.

## Requisitos

- Node.js 20.9 o superior
- Docker Desktop
- npm

## Ejecutar en local

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run setup
npm run dev
```

Abrir `http://localhost:3000`.

### Configuración local mínima

`.env.example` contiene únicamente las variables que el proyecto lee hoy para ejecución local:

- `DATABASE_URL` — obligatoria para Prisma y para los Route Handlers que acceden a PostgreSQL. El valor de ejemplo coincide con `docker-compose.yml`.
- `AUTH_ENABLED` — opcional para desarrollo local. Con `false`, el acceso queda abierto para validar sin login; con `true`, se exige sesión.
- `AUTH_SECRET` — opcional mientras `AUTH_ENABLED=false`; debe reemplazarse por un valor seguro antes de habilitar auth en un entorno compartido o productivo.

Este archivo no contiene secretos reales y no corrige errores de dominio, seed, Prisma, API o frontend no relacionados con configuración.

Credenciales del seed:

```text
Email: dario@local.test
Contraseña: nexo-demo
```

En este workspace la base ya fue creada y sembrada. Para un arranque normal alcanza con:

```powershell
docker compose up -d
npm run dev
```

## Comandos

```powershell
npm run lint          # calidad estática
npm run build         # build de producción
npm run db:migrate    # crear/aplicar cambios de esquema
npm run db:seed       # restaurar datos iniciales
npm run db:studio     # inspeccionar la base
```

## API principal

Los recursos están disponibles bajo `/api`: `areas`, `projects`, `tasks`, `assets`, `ideas`, `due-items`, `reviews`, `weekly-focus`, `notes` y `activity-log`. Cada recurso expone listado, detalle, creación, edición y borrado. También existen:

- `GET /api/dashboard`
- `POST /api/projects/:id/freeze`
- `POST /api/projects/:id/unfreeze`
- `POST /api/tasks/:id/complete`
- `POST /api/ideas/:id/convert-to-project`
- `POST /api/due-items/:id/mark-done`
- `POST /api/reviews/:id/mark-done`

## Arquitectura

- `src/app`: páginas, layouts y Route Handlers REST.
- `src/components`: shell, vistas y primitivas reutilizables.
- `src/lib`: Prisma, auth, validaciones y datos de demostración.
- `prisma/schema.prisma`: modelo relacional completo.
- `prisma/migrations`: migraciones versionadas.
- `prisma/seed.ts`: áreas, proyectos y actividad inicial.

## Jerarquía visual

La interfaz usa cuatro niveles reutilizables definidos en `visual-hierarchy.tsx`: protagonista, atención, operación y contexto. Los tonos rojo, naranja, azul, verde y gris tienen significado funcional consistente para riesgo, proximidad, foco, salud y pausa.

El acceso se controla con `AUTH_ENABLED`. Durante la validación externa está en `false`; antes de producción debe cambiarse a `true` junto con un `AUTH_SECRET` seguro.

La interfaz carga sus datos desde la API/PostgreSQL, aplica actualizaciones optimistas para una respuesta inmediata y conserva un respaldo local si la base no está disponible. La captura rápida persiste también en la API. Las reglas críticas se validan en frontend y backend.
