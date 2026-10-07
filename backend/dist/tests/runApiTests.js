"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const app_1 = require("../app");
const db_1 = require("../database/db");
const http_1 = __importDefault(require("http"));
const runTests = async () => {
    console.log('🧪 ==============================================================');
    console.log('🧪 INICIANDO SUITE DE PRUEBAS DE INTEGRACIÓN: VENFI BACKEND API');
    console.log('🧪 ==============================================================\n');
    // Inicializar BD y Servidor de pruebas en puerto dinámico o 5001
    await db_1.db.init();
    const app = (0, app_1.createApp)();
    const testPort = 5001;
    const server = http_1.default.createServer(app);
    await new Promise((resolve) => {
        server.listen(testPort, () => {
            console.log(`📡 Servidor de pruebas escuchando en http://localhost:${testPort}\n`);
            resolve();
        });
    });
    const client = axios_1.default.create({
        baseURL: `http://localhost:${testPort}`,
        validateStatus: () => true // Permite capturar todos los códigos de estado
    });
    let passedTests = 0;
    let totalTests = 0;
    const assertTest = (name, condition, details) => {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✅ [PASS] ${name}`);
        }
        else {
            console.error(`  ❌ [FAIL] ${name} -> ${details || 'Condición no cumplida'}`);
        }
    };
    try {
        // 1. Health Check
        const healthRes = await client.get('/api/health');
        assertTest('GET /api/health -> Estado del servidor', healthRes.status === 200 && healthRes.data.status === 'online');
        // 2. Registro de Usuario
        const testEmail = `test_${Date.now()}@venfi.app`;
        const testUsername = `user_${Date.now()}`;
        const registerRes = await client.post('/api/auth/register', {
            email: testEmail,
            username: testUsername,
            password: 'SuperPassword2026!',
            walletAddress: '0xTestWallet12345'
        });
        assertTest('POST /api/auth/register -> Registro de nuevo usuario', registerRes.status === 201 && registerRes.data.success === true);
        // 3. Login de Usuario
        const loginRes = await client.post('/api/auth/login', {
            email: testEmail,
            password: 'SuperPassword2026!'
        });
        assertTest('POST /api/auth/login -> Login y emisión de JWT', loginRes.status === 200 && !!loginRes.data.data.tokens.accessToken);
        const accessToken = loginRes.data?.data?.tokens?.accessToken;
        const refreshToken = loginRes.data?.data?.tokens?.refreshToken;
        // 4. Refresh Token
        const refreshRes = await client.post('/api/auth/refresh', { refreshToken });
        assertTest('POST /api/auth/refresh -> Renovación de tokens', refreshRes.status === 200 && !!refreshRes.data.data.accessToken);
        // 5. Perfil de Usuario (GET /api/auth/me)
        const meRes = await client.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/auth/me -> Datos del usuario autenticado', meRes.status === 200 && meRes.data.data.email === testEmail);
        // 6. Ranking Top 10 (GET /api/ranking)
        const rankingRes = await client.get('/api/ranking');
        assertTest('GET /api/ranking -> Consulta del Top 10 de anunciantes', rankingRes.status === 200 && rankingRes.data.data.length >= 10);
        // 7. Click Tracking (POST /api/ranking/click/:position)
        const clickRes = await client.post('/api/ranking/click/1', { referrer: 'venfi-test-suite' });
        assertTest('POST /api/ranking/click/1 -> Registro de clic en el ranking', clickRes.status === 200 && clickRes.data.success === true);
        // 8. Crear Orden de Pago (POST /api/payments/create)
        const paymentRes = await client.post('/api/payments/create', {
            position: 1,
            amountUsd: 15.00,
            durationHours: 24,
            businessName: 'Marca de Prueba VIP ⚡',
            targetUrl: 'https://testvipbrand.com',
            slogan: 'Calidad garantizada en toda Venezuela.',
            category: 'Tecnología & Retail',
            avatar: '👑',
            paymentMethod: 'binance'
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('POST /api/payments/create -> Generación de orden Binance Pay', paymentRes.status === 201 && !!paymentRes.data.data.binancePay?.qrContent);
        const createdPayment = paymentRes.data?.data;
        // 9. Webhook de Pago (POST /api/payments/webhook)
        const webhookRes = await client.post('/api/payments/webhook', {
            merchantTradeNo: createdPayment?.orderId || createdPayment?.paymentId,
            totalFee: 15.00,
            tradeStatus: 'SUCCESS',
            txHash: '0x9999999999999999999999999999999999999999'
        });
        assertTest('POST /api/payments/webhook -> Procesamiento de webhook y activación de ranking', webhookRes.status === 200 && webhookRes.data.returnCode === 'SUCCESS');
        // 10. Dashboard de Usuario (GET /api/user/dashboard)
        const dashboardRes = await client.get('/api/user/dashboard', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/user/dashboard -> Métricas y resumen general', dashboardRes.status === 200 && dashboardRes.data.success === true && typeof dashboardRes.data.data.totalClicks === 'number');
        // 10b. Clics Históricos (GET /api/user/dashboard/clicks)
        const clicksRes = await client.get('/api/user/dashboard/clicks?days=7', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/user/dashboard/clicks -> Historial de 7 días para gráficos', clicksRes.status === 200 && clicksRes.data.count === 7);
        // 10c. Geolocalización (GET /api/user/dashboard/geolocation)
        const geoRes = await client.get('/api/user/dashboard/geolocation', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/user/dashboard/geolocation -> Desglose geográfico de clics', geoRes.status === 200 && geoRes.data.count >= 3);
        // 10d. Campañas Activas (GET /api/user/dashboard/campaigns)
        const campRes = await client.get('/api/user/dashboard/campaigns', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/user/dashboard/campaigns -> Listado de pautas activas del anunciante', campRes.status === 200 && Array.isArray(campRes.data.data));
        // 10e. Historial de Pagos (GET /api/user/dashboard/payments)
        const payRes = await client.get('/api/user/dashboard/payments', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/user/dashboard/payments -> Historial de pagos y facturas', payRes.status === 200 && Array.isArray(payRes.data.data));
        // 10f. Notificaciones (GET /api/user/notifications)
        const notifsRes = await client.get('/api/user/notifications', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('GET /api/user/notifications -> Buzón de notificaciones del anunciante', notifsRes.status === 200 && Array.isArray(notifsRes.data.data));
        // 10g. Renovación de Pauta (POST /api/payments/renew)
        const renewRes = await client.post('/api/payments/renew', {
            position: 1,
            durationHours: 24,
            paymentMethod: 'binance'
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('POST /api/payments/renew -> Renovación y extensión de pauta activa', renewRes.status === 201 && renewRes.data.success === true);
        // 11. Tasas de Cambio (GET /api/rates)
        const ratesRes = await client.get('/api/rates');
        assertTest('GET /api/rates -> Tasas BCV, Paralelo, USDT y Euro', ratesRes.status === 200 && !!ratesRes.data.data.bcv?.rate && !!ratesRes.data.data.paralelo?.rate);
        // 12. Clima en Vivo (GET /api/weather & /api/weather/cities)
        const weatherRes = await client.get('/api/weather?city=Caracas');
        assertTest('GET /api/weather -> Clima de Caracas en tiempo real', weatherRes.status === 200 && typeof weatherRes.data.data.temp === 'number');
        const citiesRes = await client.get('/api/weather/cities');
        assertTest('GET /api/weather/cities -> Clima multi-ciudad (Caracas, Maracaibo, Valencia)', citiesRes.status === 200 && citiesRes.data.data.length === 3);
        // 13. Comparador de Remesas (GET /api/remesas)
        const remesasRes = await client.get('/api/remesas?amount=100&country=ESPANA');
        const firstOption = remesasRes.data?.data?.opciones?.[0];
        const hasBuyAndSellRates = firstOption && Number(firstOption.buy_rate) > 0 && Number(firstOption.sell_rate) > 0;
        const hasMarketSeparation = remesasRes.data?.data?.opciones_oficiales?.length >= 3 && remesasRes.data?.data?.opciones_paralelas?.length >= 4;
        assertTest('GET /api/remesas -> Comparador de remesas con separación Oficial (BCV) vs Paralelo (USDT)', remesasRes.status === 200 && remesasRes.data.data.opciones.length >= 7 && hasBuyAndSellRates && hasMarketSeparation);
        // 13b. Listar Proveedores de Remesas (GET /api/remesas/providers)
        const providersRes = await client.get('/api/remesas/providers', {
            headers: { 'x-admin-key': 'venfi-admin-2026' }
        });
        const firstProv = providersRes.data?.data?.[0];
        const hasMultipliersAndMarket = firstProv && firstProv.buy_rate_multiplier !== undefined && firstProv.sell_rate_multiplier !== undefined && firstProv.market_type !== undefined;
        assertTest('GET /api/remesas/providers -> Listado de casas de cambio con buy/sell multipliers y market_type', providersRes.status === 200 && providersRes.data.data.length >= 7 && hasMultipliersAndMarket);
        // 13c. Verificar las 3 nuevas empresas añadidas y su clasificación oficial
        const italcambio = providersRes.data?.data?.find((p) => p.key === 'italcambio');
        const anguloLopez = providersRes.data?.data?.find((p) => p.key === 'angulo_lopez');
        const insular = providersRes.data?.data?.find((p) => p.key === 'insular');
        const allOfficial = italcambio?.market_type === 'official' && anguloLopez?.market_type === 'official' && insular?.market_type === 'official';
        assertTest('Verificar 3 casas de cambio oficiales (ItalCambio, Angulo López, Insular -> market_type: official)', !!italcambio && !!anguloLopez && !!insular && allOfficial);
        // 14. Flujo Completo de Pagos Zelle (POST /api/payments/create [zelle])
        const zelleOrderRes = await client.post('/api/payments/create', {
            position: 2,
            amountUsd: 10.00,
            durationHours: 24,
            businessName: 'Comercio Zelle Venezuela 🇻🇪',
            targetUrl: 'https://zellecomercios.ve',
            slogan: 'Aceptamos transferencias directas.',
            category: 'Servicios',
            avatar: '💼',
            paymentMethod: 'zelle'
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('POST /api/payments/create [Zelle] -> Generación de orden Zelle', zelleOrderRes.status === 201 && zelleOrderRes.data.data.paymentMethod === 'zelle');
        const zelleOrderId = zelleOrderRes.data.data.orderId;
        // 15. Enviar Comprobante Zelle (POST /api/payments/zelle/proof)
        const proofRes = await client.post('/api/payments/zelle/proof', {
            orderId: zelleOrderId,
            referenceCode: 'ZLL-98421048',
            proofImageUrl: 'https://cdn.venfi.app/proofs/zll98421048.jpg'
        });
        assertTest('POST /api/payments/zelle/proof -> Envío de comprobante y referencia Zelle', proofRes.status === 200 && proofRes.data.success === true);
        // 16. Consultar Pagos Zelle Pendientes (GET /api/payments/zelle/pending)
        const pendingZelleRes = await client.get('/api/payments/zelle/pending');
        assertTest('GET /api/payments/zelle/pending -> Listado administrativo de transferencias Zelle', pendingZelleRes.status === 200 && pendingZelleRes.data.count >= 1);
        // 17. Conciliación y Aprobación Administrativa (POST /api/payments/zelle/verify)
        const verifyZelleRes = await client.post('/api/payments/zelle/verify', {
            orderId: zelleOrderId,
            isApproved: true,
            adminNotes: 'Pago Zelle $10 USD recibido y verificado por Finanzas.'
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        assertTest('POST /api/payments/zelle/verify -> Conciliación y activación de pauta Zelle', verifyZelleRes.status === 200 && verifyZelleRes.data.data.status === 'completed');
        // 18. Swagger UI (GET /api-docs/)
        const swaggerRes = await client.get('/api-docs/');
        assertTest('GET /api-docs/ -> Documentación Swagger OpenAPI', swaggerRes.status === 200);
        console.log('\n📊 ==============================================================');
        console.log(`📊 RESULTADO FINAL DE PRUEBAS: ${passedTests} de ${totalTests} APROBADAS (${Math.round((passedTests / totalTests) * 100)}%)`);
        console.log('📊 ==============================================================\n');
    }
    catch (error) {
        console.error('Error durante la ejecución de pruebas:', error.message);
    }
    finally {
        server.close();
        process.exit(passedTests === totalTests ? 0 : 1);
    }
};
runTests();
//# sourceMappingURL=runApiTests.js.map