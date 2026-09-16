# ⚙️ PROYECTO VENFI (Venezuela + Finanzas)
## ENTREGABLE FASE 2: BACKEND Y BASE DE DATOS

---

### 1. Resumen de la Fase 2
Se ha desarrollado e integrado la arquitectura completa del backend con **Node.js, Express y TypeScript**, junto con el diseño e implementación del esquema relacional en **PostgreSQL (Supabase)**, autenticación segura mediante **JWT y Refresh Tokens**, pasarelas de pago y documentación interactiva con **Swagger OpenAPI**.

* **Servidor Backend Activo:** `http://localhost:5000`
* **Documentación Interactiva Swagger:** `http://localhost:5000/api-docs`
* **Colección Postman / Insomnia:** [postman_collection.json](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/backend/postman_collection.json)
* **Resultado de Pruebas Automatizadas:** 12 de 12 pruebas de integración aprobadas (**100% de éxito**).

---

### 2. Esquema Relacional de Base de Datos (PostgreSQL / Supabase)

El script SQL completo y listo para producción se encuentra en [schema.sql](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/backend/src/database/schema.sql) y contiene las siguientes 5 tablas:

| Tabla | Propósito y Campos Principales | Índices & Llaves |
| :--- | :--- | :--- |
| **`users`** | `id (UUID)`, `email (UNIQUE)`, `username (UNIQUE)`, `password_hash (bcrypt)`, `role`, `wallet_address`, `google_id`, `created_at`, `last_login`. | PK en `id`, Unique en `email` y `username`. |
| **`payments`** | `id (UUID)`, `user_id (FK)`, `amount_usd`, `position (1-10)`, `duration_hours (24)`, `status ('pending'\|'completed')`, `payment_method ('binance'\|'zelle')`, `tx_hash`, `business_name`, `target_url`, `slogan`, `category`, `avatar`, `created_at`, `expires_at`. | FK hacia `users(id)`, Índice en `status` y `user_id`. |
| **`ranking`** | `id (SERIAL)`, `position (1-10 UNIQUE)`, `user_id (FK)`, `payment_id (FK)`, `business_name`, `target_url`, `slogan`, `category`, `avatar`, `tier ('gold'\|'silver'\|'dark')`, `amount_paid`, `start_time`, `end_time`, `clicks_received`, `views_received`, `is_active`. | PK en `id`, Unique en `position`, Índice en `is_active`. |
| **`clicks_log`** | `id (UUID)`, `user_id (FK)`, `ranking_position`, `timestamp`, `ip_address`, `country`, `city`, `referrer`, `user_agent`. | PK en `id`, Índice compuesto en `(ranking_position, timestamp)`. |
| **`notifications`** | `id (UUID)`, `user_id (FK)`, `message`, `type ('payment'\|'ranking'\|'alert')`, `created_at`, `is_read`. | PK en `id`, FK hacia `users(id)`. |

---

### 3. Endpoints Implementados y Verificados

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registro de usuario con email, username y password (hasheo con bcrypt). | Pública (Rate Limit 20/15m) |
| **POST** | `/api/auth/login` | Login con credenciales y emisión de Access Token (1h) y Refresh Token (7d). | Pública (Rate Limit 20/15m) |
| **POST** | `/api/auth/refresh` | Renovación de tokens sin necesidad de relogueo. | Pública |
| **GET** | `/api/auth/me` | Obtención del perfil del usuario autenticado. | `Bearer <JWT>` |
| **POST** | `/api/auth/google` | Autenticación y registro federado con Google OAuth. | Pública |
| **GET** | `/api/ranking` | Consulta del Top 10 de anunciantes ordenados por posición (1 al 10). | Pública |
| **POST** | `/api/ranking/click/:position` | Registro de clics en tiempo real en `clicks_log` e incremento atómico. | Pública |
| **POST** | `/api/payments/create` | Generación de orden de pago en Binance Pay (QR/URL) o datos de Zelle. | Opcional / JWT |
| **POST** | `/api/payments/webhook` | Webhook para verificación automática de Binance Pay y activación de slot en el ranking. | Pública / Validada |
| **GET** | `/api/user/dashboard` | Dashboard del anunciante con métricas de clics, impresiones, desglose geográfico y pagos. | `Bearer <JWT>` |
| **GET** | `/api/rates` | Cotizaciones en tiempo real (BCV, Paralelo, USDT Binance, Euro) con in-memory cache (60s). | Pública |
| **GET** | `/api/health` | Estado del servidor y tiempo de actividad. | Pública |
| **GET** | `/api-docs` | Interfaz interactiva de Swagger UI OpenAPI 3.0. | Pública |

---

### 4. Evidencia de Pruebas de Integración Automatizadas

```
🧪 ==============================================================
🧪 INICIANDO SUITE DE PRUEBAS DE INTEGRACIÓN: VENFI BACKEND API
🧪 ==============================================================

  ✅ [PASS] GET /api/health -> Estado del servidor
  ✅ [PASS] POST /api/auth/register -> Registro de nuevo usuario
  ✅ [PASS] POST /api/auth/login -> Login y emisión de JWT
  ✅ [PASS] POST /api/auth/refresh -> Renovación de tokens
  ✅ [PASS] GET /api/auth/me -> Datos del usuario autenticado
  ✅ [PASS] GET /api/ranking -> Consulta del Top 10 de anunciantes
  ✅ [PASS] POST /api/ranking/click/1 -> Registro de clic en el ranking
  ✅ [PASS] POST /api/payments/create -> Generación de orden Binance Pay
  ✅ [PASS] POST /api/payments/webhook -> Procesamiento de webhook y activación de ranking
  ✅ [PASS] GET /api/user/dashboard -> Métricas, estadísticas y geolocalización
  ✅ [PASS] GET /api/rates -> Tasas BCV, Paralelo, USDT y Euro
  ✅ [PASS] GET /api-docs/ -> Documentación Swagger OpenAPI

📊 ==============================================================
📊 RESULTADO FINAL DE PRUEBAS: 12 de 12 APROBADAS (100%)
📊 ==============================================================
```

---

### 5. Configuración para Producción en Supabase
Para desplegar la base de datos en Supabase:
1. Accede a tu proyecto en [supabase.com](https://supabase.com).
2. Ve al **SQL Editor** y ejecuta el contenido de [schema.sql](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/backend/src/database/schema.sql) y [seed.sql](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/backend/src/database/seed.sql).
3. Copia la cadena de conexión de PostgreSQL desde **Project Settings > Database > Connection string (URI)** y pégala en `DATABASE_URL` dentro del archivo `.env` del backend.
