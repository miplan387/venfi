-- ============================================================================
-- PROYECTO VENFI: CREACIÓN DE TABLAS FALTANTES Y SEED EN SUPABASE
-- Copia y pega todo este script en el SQL Editor de tu Dashboard de Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1. TABLA: zones (Zonas Geográficas)
CREATE TABLE IF NOT EXISTS public.zones (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  icon VARCHAR(10) DEFAULT '📍',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS y permitir acceso total con service_role
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total a zones para todos" ON public.zones;
CREATE POLICY "Acceso total a zones para todos" ON public.zones FOR ALL USING (true) WITH CHECK (true);

-- Insertar zonas base
INSERT INTO public.zones (key, name, type, icon, sort_order, is_active) VALUES
('nacional', 'Nacional (Toda Venezuela)', 'country', '🇻🇪', 1, TRUE),
('caracas', 'Caracas (Distrito Capital)', 'city', '🏙️', 2, TRUE),
('maracaibo', 'Maracaibo (Zulia)', 'city', '⚡', 3, TRUE),
('valencia', 'Valencia (Carabobo)', 'city', '🏭', 4, TRUE)
ON CONFLICT (key) DO NOTHING;

-- 2. TABLA: zone_pricing (Tarifas de Publicidad por Zona y Posición)
CREATE TABLE IF NOT EXISTS public.zone_pricing (
  id SERIAL PRIMARY KEY,
  zone_key VARCHAR(50) NOT NULL REFERENCES public.zones(key) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position BETWEEN 1 AND 10),
  tier VARCHAR(20) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  duration_hours INT DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(zone_key, position)
);

-- Habilitar RLS y permitir acceso total
ALTER TABLE public.zone_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total a zone_pricing para todos" ON public.zone_pricing;
CREATE POLICY "Acceso total a zone_pricing para todos" ON public.zone_pricing FOR ALL USING (true) WITH CHECK (true);

-- Insertar las 19 tarifas iniciales de publicidad
INSERT INTO public.zone_pricing (zone_key, position, tier, price_usd, duration_hours, is_active) VALUES
('nacional', 1, 'top1', 10.00, 24, TRUE),
('nacional', 2, 'top2', 6.00, 24, TRUE),
('nacional', 3, 'top3', 6.00, 24, TRUE),
('nacional', 4, 'top4_10', 4.00, 24, TRUE),
('nacional', 5, 'top4_10', 4.00, 24, TRUE),
('nacional', 6, 'top4_10', 4.00, 24, TRUE),
('nacional', 7, 'top4_10', 4.00, 24, TRUE),
('nacional', 8, 'top4_10', 4.00, 24, TRUE),
('nacional', 9, 'top4_10', 4.00, 24, TRUE),
('nacional', 10, 'top4_10', 4.00, 24, TRUE),
('caracas', 1, 'top1', 10.00, 24, TRUE),
('caracas', 2, 'top2', 6.00, 24, TRUE),
('caracas', 3, 'top3', 4.00, 24, TRUE),
('maracaibo', 1, 'top1', 10.00, 24, TRUE),
('maracaibo', 2, 'top2', 6.00, 24, TRUE),
('maracaibo', 3, 'top3', 4.00, 24, TRUE),
('valencia', 1, 'top1', 10.00, 24, TRUE),
('valencia', 2, 'top2', 6.00, 24, TRUE),
('valencia', 3, 'top3', 4.00, 24, TRUE)
ON CONFLICT (zone_key, position) DO UPDATE SET
  tier = EXCLUDED.tier,
  price_usd = EXCLUDED.price_usd,
  duration_hours = EXCLUDED.duration_hours,
  is_active = EXCLUDED.is_active;

-- 3. TABLA: payment_methods (Métodos de Pago Dinámicos)
CREATE TABLE IF NOT EXISTS public.payment_methods (
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

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total a payment_methods" ON public.payment_methods;
CREATE POLICY "Acceso total a payment_methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.payment_methods (key, name, icon, description, fields, is_active, requires_approval, sort_order) VALUES
('binance', 'Binance Pay (USDT)', '🟡', 'Pago instantáneo con criptomonedas y confirmación automática por Webhook.', '{"merchantId": "284910482", "currency": "USDT"}', TRUE, FALSE, 1),
('zinli', 'Zinli (USD)', '💳', 'Pago con Zinli, billetera digital en dólares con acreditación inmediata.', '{"email": "miplan3d@gmail.com", "name": "Venfidata Publicidad"}', TRUE, TRUE, 2),
('pago_movil', 'Pago Móvil (VES)', '📱', 'Pago interbancario en Bolívares con QR dinámico a tasa oficial BCV.', '{"bank": "BNC (Banco Nacional de Crédito)", "bankCode": "0191", "phone": "0412-4160819", "idNumber": "V-11112387", "beneficiary": "Venfidata Publicidad & Medios C.A."}', TRUE, TRUE, 3)
ON CONFLICT (key) DO NOTHING;

-- 4. TABLA: payment_settings (Configuración de Cuentas Receptoras)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total a payment_settings" ON public.payment_settings;
CREATE POLICY "Acceso total a payment_settings" ON public.payment_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.payment_settings (key, value) VALUES
('pago_movil', '{"bank": "BNC", "phone": "0412-4160819", "idNumber": "V-11112387", "beneficiary": "Venfidata C.A."}'),
('zinli', '{"email": "miplan3d@gmail.com", "name": "Venfidata"}'),
('binance', '{"email": "pagos@venfidata.com", "merchantId": "284910482"}'),
('crypto', '{"wallet": "TU_DIRECCION_WALLET_AQUI", "network": "USDT (TRC20)"}')
ON CONFLICT (key) DO NOTHING;

-- 5. ACTUALIZAR COLUMNA zone_key EN ranking Y payments
ALTER TABLE public.ranking ADD COLUMN IF NOT EXISTS zone_key VARCHAR(50) DEFAULT 'nacional';
CREATE INDEX IF NOT EXISTS idx_ranking_zone ON public.ranking(zone_key, position);
UPDATE public.ranking SET zone_key = 'nacional' WHERE zone_key IS NULL;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS zone_key VARCHAR(50) DEFAULT 'nacional';
CREATE INDEX IF NOT EXISTS idx_payments_zone ON public.payments(zone_key);
UPDATE public.payments SET zone_key = 'nacional' WHERE zone_key IS NULL;

-- 6. RECARGAR EL CACHÉ DE ESQUEMAS DE POSTGREST
NOTIFY pgrst, 'reload schema';

