-- ============================================================================
-- PROYECTO VENFI - ESQUEMA DE BASE DE DATOS POSTGRESQL (SUPABASE / NEON / VPS)
-- ============================================================================

-- Habilitar extensión pgcrypto o uuid-ossp para generación de UUIDs si no existen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(100),
    google_id VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'advertiser', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ
);

-- 2. TABLA: payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount_usd NUMERIC(10, 2) NOT NULL,
    position INT NOT NULL CHECK (position >= 1 AND position <= 10),
    duration_hours INT DEFAULT 24,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50) DEFAULT 'binance',
    tx_hash VARCHAR(255),
    reference_number VARCHAR(50),
    proof_image_url VARCHAR(255),
    business_name VARCHAR(150) NOT NULL,
    target_url TEXT NOT NULL,
    slogan VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    avatar VARCHAR(20) DEFAULT '🚀',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- 3. TABLA: ranking
CREATE TABLE IF NOT EXISTS ranking (
    id SERIAL PRIMARY KEY,
    position INT UNIQUE NOT NULL CHECK (position >= 1 AND position <= 10),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_id VARCHAR(100) REFERENCES payments(id) ON DELETE SET NULL,

    business_name VARCHAR(150) NOT NULL,
    target_url TEXT NOT NULL,
    slogan VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    avatar VARCHAR(20) DEFAULT '🚀',
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('gold', 'silver', 'dark')),
    amount_paid NUMERIC(10, 2) DEFAULT 0.00,
    start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMPTZ,
    clicks_received INT DEFAULT 0,
    views_received INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. TABLA: clicks_log
CREATE TABLE IF NOT EXISTS clicks_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ranking_position INT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    country VARCHAR(100) DEFAULT 'Venezuela',
    city VARCHAR(100) DEFAULT 'Caracas',
    referrer TEXT,
    user_agent TEXT
);

-- 5. TABLA: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'ranking', 'alert', 'fomo')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- 6. TABLA: rates_history (Histórico y Fallback de Tasas Cambiarias con Variación)
CREATE TABLE IF NOT EXISTS rates_history (
    id SERIAL PRIMARY KEY,
    rate_type VARCHAR(20) NOT NULL, -- bcv, paralelo, usdt, euro
    buy_rate DECIMAL(10,4),
    sell_rate DECIMAL(10,4),
    avg_rate DECIMAL(10,4) NOT NULL,
    variation_abs DECIMAL(10,4),
    variation_pct DECIMAL(5,2),
    direction VARCHAR(10) CHECK (direction IN ('up', 'down', 'same')),
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- 7. TABLA: zelle_payments (Registro, Comprobantes y Conciliación Manual de Zelle)
CREATE TABLE IF NOT EXISTS zelle_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    position INT NOT NULL CHECK (position BETWEEN 1 AND 10),
    reference_code VARCHAR(50), -- Código de referencia enviado por el usuario
    proof_image_url VARCHAR(255), -- URL de la imagen del comprobante (opcional)
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ÍNDICES DE ALTO RENDIMIENTO (1,000 usuarios concurrentes)
CREATE INDEX IF NOT EXISTS idx_ranking_position ON ranking(position);
CREATE INDEX IF NOT EXISTS idx_ranking_active ON ranking(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_clicks_position_time ON clicks_log(ranking_position, timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_rates_history_type_date ON rates_history(rate_type, last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_zelle_payments_order ON zelle_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_zelle_payments_status ON zelle_payments(status);

-- TABLA DE CONTADOR DE VISITAS Y USUARIOS ACTIVOS
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    total_visits BIGINT DEFAULT 0,
    active_users INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO visits (id, total_visits, active_users)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 8. TABLA: payment_methods (Métodos de Pago Modulares y Dinámicos)
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '💳',
  description TEXT,
  fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_active_sort ON payment_methods(is_active, sort_order ASC);

-- 9. TABLA: remittance_providers (Casas de Cambio y Proveedores de Remesas Dinámicos)
CREATE TABLE IF NOT EXISTS remittance_providers (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '🏢',
  description TEXT,
  countries JSONB DEFAULT '[]',
  rate_multiplier DECIMAL(6,4) DEFAULT 1.0,
  rate_usd_bs DECIMAL(10,4) DEFAULT 0,
  buy_rate_multiplier DECIMAL(5,4) DEFAULT 0.9750,
  sell_rate_multiplier DECIMAL(5,4) DEFAULT 1.0000,
  buy_rate DECIMAL(10,4) DEFAULT 0,
  sell_rate DECIMAL(10,4) DEFAULT 0,
  commission_percent DECIMAL(5,2) DEFAULT 0,
  commission_fixed_usd DECIMAL(10,2) DEFAULT 0,
  delivery_time VARCHAR(100) DEFAULT '24 horas',
  payment_methods JSONB DEFAULT '[]',
  delivery_methods JSONB DEFAULT '[]',
  rating DECIMAL(3,1) DEFAULT 4.5,
  badge VARCHAR(100),
  url VARCHAR(255),
  market_type VARCHAR(20) DEFAULT 'parallel' CHECK (market_type IN ('official', 'parallel')),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_remittance_providers_active_sort ON remittance_providers(is_active, sort_order ASC);


