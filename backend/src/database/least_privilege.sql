-- ============================================================================
-- VENFIDATA - PRINCIPIO DE MENOR PRIVILEGIO (LEAST PRIVILEGE) PARA PRODUCCIÓN
-- ============================================================================
-- Este script crea y configura un rol de base de datos restringido exclusivo
-- para la aplicación Backend (`venfi_app`), evitando el uso del superusuario `postgres`.
--
-- Uso recomendado en Google Cloud SQL, Neon, Supabase o PostgreSQL autogestionado:
-- 1. Ejecutar como superusuario/administrador de PostgreSQL (`postgres`).
-- 2. Asignar una contraseña segura al usuario `venfi_app`.
-- 3. Utilizar las credenciales de `venfi_app` en la variable DATABASE_URL del backend.
-- ============================================================================

-- 1. Crear el usuario de aplicación si no existe (Reemplazar 'PASSWORD_SEGURO_AQUI' en producción)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'venfi_app') THEN
      CREATE ROLE venfi_app WITH LOGIN PASSWORD 'PASSWORD_SEGURO_AQUI' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
   END IF;
END
$do$;

-- 2. Revocar privilegios peligrosos sobre la base de datos
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE venfi FROM PUBLIC;

-- 3. Conceder solo permiso de conexión
GRANT CONNECT ON DATABASE venfi TO venfi_app;

-- 4. Conceder uso del esquema público
GRANT USAGE ON SCHEMA public TO venfi_app;

-- 5. Otorgar exclusivamente operaciones DML (SELECT, INSERT, UPDATE, DELETE)
-- sobre las tablas de la aplicación. NUNCA otorgar TRUNCATE ni DROP.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO venfi_app;

-- 6. Otorgar permisos de uso en secuencias (para columnas SERIAL / BIGSERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO venfi_app;

-- 7. Asegurar que futuras tablas creadas por migraciones también hereden permisos mínimos
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO venfi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO venfi_app;

-- ============================================================================
-- Verificación de privilegios:
-- SELECT table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE grantee = 'venfi_app';
-- ============================================================================

