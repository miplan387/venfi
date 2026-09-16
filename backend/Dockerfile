# ==============================================================================
# VENFI BACKEND - MULTI-STAGE DOCKERFILE
# ==============================================================================

# STAGE 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# STAGE 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copiar solo package files para instalar dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar bundle compilado del builder
COPY --from=builder /app/dist ./dist
COPY src/database/schema.sql ./dist/database/schema.sql
COPY src/database/seed.sql ./dist/database/seed.sql

# Usuario sin privilegios root para máxima seguridad
USER node

EXPOSE 5000

# Health check del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
