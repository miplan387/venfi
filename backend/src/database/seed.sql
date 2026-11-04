-- ============================================================================
-- SEED DATA PARA PROYECTO VENFI - POSTGRESQL
-- ============================================================================

-- Usuario Administrador de Prueba (Password: 'VenfiAdmin2026!')
-- Hash bcrypt para 'VenfiAdmin2026!'
INSERT INTO users (id, email, username, password_hash, role)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@venfi.app', 'venfi_admin', '$2a$10$QjY8p1Q3z5S.E7xN0kP8yO2sK7wJ7G8h0d6.l7v1k1X.r9i4l4t.y', 'admin'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'electrocaracas@gmail.com', 'electrocaracas', '$2a$10$QjY8p1Q3z5S.E7xN0kP8yO2sK7wJ7G8h0d6.l7v1k1X.r9i4l4t.y', 'advertiser')
ON CONFLICT (email) DO NOTHING;

-- Slots del Ranking Inicial (Puestos 1 al 10)
INSERT INTO ranking (position, user_id, business_name, target_url, slogan, category, avatar, tier, amount_paid, clicks_received, views_received, is_active)
VALUES
(1, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ElectroCaracas Express ⚡', 'https://instagram.com/electrocaracas', 'Los mejores precios en iPhone, PlayStation 5 y Laptops con envíos a toda Venezuela y garantía de 1 año.', 'Tecnología & Retail', '⚡', 'gold', 15.00, 3420, 48920, TRUE),
(2, NULL, 'VenRemesas Direct 🇻🇪🇺🇸', 'https://venremesas.com', 'Envía dinero desde EE.UU., España y Chile con la mejor tasa del mercado. Acreditación en 5 minutos.', 'Finanzas & Remesas', '💸', 'silver', 10.00, 1890, 29400, TRUE),
(3, NULL, 'CriptoTrader VE Academy 📈', 'https://t.me/criptotradervip', 'Aprende trading de futuros y arbitraje P2P en Binance. Comunidad VIP con más de 3,500 miembros activos.', 'Educación & Cripto', '📊', 'silver', 10.00, 1450, 24100, TRUE),
(4, NULL, 'Repuestos Automotrices El Ávila 🚗', 'https://repuestosavila.com', 'Especialistas en tren delantero, motores y suspensión para Toyota, Ford y Chevrolet.', 'Automotriz', '🔧', 'dark', 5.00, 890, 14200, TRUE),
(5, NULL, 'TuViaje Margarita & Los Roques ✈️', 'https://tuviajemargarita.ve', 'Paquetes turísticos todo incluido con boletos aéreos y hospedaje de lujo.', 'Turismo & Viajes', '🏖️', 'dark', 5.00, 760, 11800, TRUE),
(6, NULL, 'Burger Brothers Caracas 🍔', 'https://instagram.com/burgerbrothersccs', 'Las mejores smash burgers con pan brioche artesanal en Las Mercedes y Chacao.', 'Gastronomía', '🍔', 'dark', 5.00, 640, 9500, TRUE),
(7, NULL, 'Servicios Jurídicos y Apostillas ⚖️', 'https://apostillasvzla.com', 'Gestoría legal exprés de antecedentes penales, títulos universitarios y partidas para emigrar.', 'Servicios Legales', '📜', 'dark', 5.00, 580, 8900, TRUE),
(8, NULL, 'Calzados Moda Valencia 👟', 'https://modavalencia.shop', 'Venta al mayor y detal de calzado deportivo importado directo de fábrica.', 'Moda & Ropa', '👟', 'dark', 5.00, 490, 7200, TRUE),
(9, NULL, 'Ferretería & Construcción Total 🏗️', 'https://ferreconstructora.com', 'Materiales eléctricos, tuberías, cemento y pintura con despacho directo a obra.', 'Construcción', '🧱', 'dark', 5.00, 410, 6100, TRUE),
(10, NULL, 'Espacio Publicitario Disponible ✨', 'https://venfi.app/#ranking', 'Coloca tu negocio aquí frente a miles de compradores diarios en toda Venezuela por solo $5.', '¡Tu Marca Aquí!', '🚀', 'dark', 0.00, 120, 4500, TRUE)
ON CONFLICT (position) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    target_url = EXCLUDED.target_url,
    slogan = EXCLUDED.slogan,
    category = EXCLUDED.category,
    avatar = EXCLUDED.avatar,
    tier = EXCLUDED.tier,
    amount_paid = EXCLUDED.amount_paid;

-- Seed inicial de historial de Commodities (Oro y Petróleo últimos 30 días)
DO $$
DECLARE
  d DATE;
  i INT := 30;
  base_gold NUMERIC := 2620.00;
  base_brent NUMERIC := 72.50;
  var_gold NUMERIC;
  var_brent NUMERIC;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day'::interval)::date LOOP
    var_gold := ROUND((base_gold + (30 - i) * 1.1 + (sin(i::numeric) * 8.5))::numeric, 2);
    var_brent := ROUND((base_brent + (30 - i) * 0.06 + (cos(i::numeric) * 1.2))::numeric, 2);

    INSERT INTO commodity_history (commodity_type, price_usd, recorded_at)
    VALUES 
      ('gold', var_gold, d),
      ('oil_brent', var_brent, d),
      ('oil_merey', ROUND((var_brent - 14.00)::numeric, 2), d)
    ON CONFLICT (commodity_type, recorded_at) DO NOTHING;

    i := i - 1;
  END LOOP;
END $$;

-- Seed de Zonas Geográficas
INSERT INTO zones (key, name, type, icon, sort_order) VALUES
('nacional', 'Nacional', 'national', '🇻🇪', 1),
('caracas', 'Caracas', 'city', '🏙️', 2),
('maracaibo', 'Maracaibo', 'city', '🌉', 3),
('valencia', 'Valencia', 'city', '🌆', 4)
ON CONFLICT (key) DO NOTHING;

-- Seed de Tarifas por Zona
INSERT INTO zone_pricing (zone_key, position, tier, price_usd) VALUES
('nacional', 1, 'gold', 15.00), ('nacional', 2, 'silver', 10.00), ('nacional', 3, 'silver', 10.00), ('nacional', 4, 'bronze', 5.00), ('nacional', 5, 'bronze', 5.00), ('nacional', 6, 'dark', 3.00), ('nacional', 7, 'dark', 3.00), ('nacional', 8, 'dark', 3.00), ('nacional', 9, 'dark', 3.00), ('nacional', 10, 'dark', 3.00),
('caracas', 1, 'gold', 10.00), ('caracas', 2, 'silver', 6.00), ('caracas', 3, 'bronze', 4.00),
('maracaibo', 1, 'gold', 10.00), ('maracaibo', 2, 'silver', 6.00), ('maracaibo', 3, 'bronze', 4.00),
('valencia', 1, 'gold', 10.00), ('valencia', 2, 'silver', 6.00), ('valencia', 3, 'bronze', 4.00)
ON CONFLICT (zone_key, position) DO NOTHING;


