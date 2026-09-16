"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Venfi API (Venezuela + Finanzas)',
        version: '1.0.0',
        description: `
Documentación OpenAPI para el backend de Venfi.
Combina herramientas financieras diarias para Venezuela (tasas BCV, paralelo, USDT) con un sistema de ranking publicitario de pago.

### Autenticación
Para endpoints protegidos, envía el token JWT en el encabezado:
\`Authorization: Bearer <token>\`
    `,
        contact: {
            name: 'Equipo de Soporte Venfi',
            email: 'soporte@venfi.app',
            url: 'https://venfi.app'
        }
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Servidor Local de Desarrollo'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                    email: { type: 'string', example: 'usuario@empresa.com' },
                    username: { type: 'string', example: 'miempresa' },
                    role: { type: 'string', example: 'user' },
                    wallet_address: { type: 'string', example: '0x71C...4b9F' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            RankingSlot: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    position: { type: 'integer', example: 1 },
                    business_name: { type: 'string', example: 'ElectroCaracas Express ⚡' },
                    target_url: { type: 'string', example: 'https://instagram.com/electrocaracas' },
                    slogan: { type: 'string', example: 'Los mejores precios en iPhone y Laptops.' },
                    category: { type: 'string', example: 'Tecnología & Retail' },
                    avatar: { type: 'string', example: '⚡' },
                    tier: { type: 'string', enum: ['gold', 'silver', 'dark'], example: 'gold' },
                    amount_paid: { type: 'number', example: 15.00 },
                    clicks_received: { type: 'integer', example: 3420 },
                    views_received: { type: 'integer', example: 48920 },
                    is_active: { type: 'boolean', example: true }
                }
            }
        }
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Autenticación'],
                summary: 'Registrar un nuevo usuario',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'username', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'usuario@empresa.com' },
                                    username: { type: 'string', example: 'empresa_vzla' },
                                    password: { type: 'string', example: 'ClaveSegura2026!' },
                                    walletAddress: { type: 'string', example: '0x123456789' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Usuario registrado exitosamente' },
                    400: { description: 'Error de validación o usuario existente' }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Autenticación'],
                summary: 'Iniciar sesión con correo y contraseña',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'usuario@empresa.com' },
                                    password: { type: 'string', example: 'ClaveSegura2026!' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login exitoso, retorna tokens' },
                    401: { description: 'Credenciales inválidas' }
                }
            }
        },
        '/api/auth/refresh': {
            post: {
                tags: ['Autenticación'],
                summary: 'Refrescar token de acceso',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tokens refrescados' }
                }
            }
        },
        '/api/auth/me': {
            get: {
                tags: ['Autenticación'],
                summary: 'Obtener datos del usuario autenticado',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Perfil de usuario' },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/api/ranking': {
            get: {
                tags: ['Ranking Publicitario'],
                summary: 'Obtener el Top 10 de anunciantes',
                responses: {
                    200: {
                        description: 'Lista ordenada de las 10 posiciones del ranking',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/RankingSlot' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/ranking/click/{position}': {
            post: {
                tags: ['Ranking Publicitario'],
                summary: 'Registrar un clic en una posición del ranking',
                parameters: [
                    {
                        name: 'position',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer', minimum: 1, maximum: 10 }
                    }
                ],
                responses: {
                    200: { description: 'Clic registrado con éxito' }
                }
            }
        },
        '/api/payments/create': {
            post: {
                tags: ['Pagos'],
                summary: 'Crear orden de pago para anunciarse en el ranking (Binance Pay / Zelle)',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['position', 'amountUsd', 'businessName', 'targetUrl', 'slogan'],
                                properties: {
                                    position: { type: 'integer', minimum: 1, maximum: 10, example: 1 },
                                    amountUsd: { type: 'number', example: 15.00 },
                                    durationHours: { type: 'integer', example: 24 },
                                    businessName: { type: 'string', example: 'TiendaTecno Caracas' },
                                    targetUrl: { type: 'string', example: 'https://instagram.com/tiendatecno' },
                                    slogan: { type: 'string', example: 'Smartphones sellados con garantía.' },
                                    category: { type: 'string', example: 'Tecnología & Retail' },
                                    avatar: { type: 'string', example: '⚡' },
                                    paymentMethod: { type: 'string', enum: ['binance', 'zelle'], example: 'binance' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Orden generada con QR de Binance Pay o datos Zelle' }
                }
            }
        },
        '/api/payments/webhook': {
            post: {
                tags: ['Pagos'],
                summary: 'Procesar webhook de notificación de Binance Pay',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    merchantTradeNo: { type: 'string' },
                                    tradeStatus: { type: 'string', example: 'SUCCESS' },
                                    totalFee: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Webhook procesado y ranking actualizado' }
                }
            }
        },
        '/api/payments/zelle/proof': {
            post: {
                tags: ['Pagos Zelle'],
                summary: 'Reportar comprobante y código de referencia Zelle (Usuario)',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['orderId', 'referenceCode'],
                                properties: {
                                    orderId: { type: 'string', example: 'VENFI_1740599500000_A9B8C' },
                                    referenceCode: { type: 'string', example: '849204128' },
                                    proofImageUrl: { type: 'string', example: 'https://images.unsplash.com/proof.png' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Comprobante registrado y en cola de verificación' }
                }
            }
        },
        '/api/payments/zelle/pending': {
            get: {
                tags: ['Pagos Zelle'],
                summary: 'Listar transferencias Zelle pendientes de revisión (Admin)',
                responses: {
                    200: { description: 'Lista de transferencias pendientes' }
                }
            }
        },
        '/api/payments/zelle/verify': {
            post: {
                tags: ['Pagos Zelle'],
                summary: 'Conciliar, aprobar o rechazar pago Zelle manualmente (Admin)',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['orderId', 'isApproved'],
                                properties: {
                                    orderId: { type: 'string' },
                                    isApproved: { type: 'boolean', example: true },
                                    adminNotes: { type: 'string', example: 'Transferencia confirmada en cuenta JPMorgan Chase' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Pago conciliado y pauta activada/rechazada' }
                }
            }
        },
        '/api/rates': {
            get: {
                tags: ['Tasas Financieras'],
                summary: 'Obtener cotizaciones en vivo (BCV, Paralelo, USDT Binance, Euro)',
                responses: {
                    200: { description: 'Tasas en tiempo real con cache' }
                }
            }
        },
        '/api/weather': {
            get: {
                tags: ['Clima'],
                summary: 'Obtener clima de una ciudad venezolana (Caracas, Maracaibo, Valencia)',
                parameters: [
                    {
                        name: 'city',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', default: 'caracas' },
                        description: 'Nombre de la ciudad (caracas, maracaibo, valencia, barquisimeto)'
                    }
                ],
                responses: {
                    200: { description: 'Clima en tiempo real con temperatura, condición y humedad' }
                }
            }
        },
        '/api/weather/cities': {
            get: {
                tags: ['Clima'],
                summary: 'Obtener clima simultáneo de Caracas, Maracaibo y Valencia',
                responses: {
                    200: { description: 'Lista del clima de las 3 principales ciudades' }
                }
            }
        },
        '/api/remesas': {
            get: {
                tags: ['Remesas'],
                summary: 'Comparador de remesas en tiempo real hacia Venezuela',
                parameters: [
                    {
                        name: 'amount',
                        in: 'query',
                        required: false,
                        schema: { type: 'number', default: 100 },
                        description: 'Monto en USD a enviar a Venezuela'
                    }
                ],
                responses: {
                    200: { description: 'Tabla comparativa con desglose de comisiones y monto neto en Bs' }
                }
            }
        },
        '/api/user/dashboard': {
            get: {
                tags: ['Dashboard de Usuario'],
                summary: 'Obtener métricas de clics, vistas, geo-desglose e historial de pagos',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Datos del dashboard del anunciante' }
                }
            }
        }
    }
};
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
        customSiteTitle: 'Venfi API Docs',
        customCss: '.swagger-ui .topbar { display: none } body { background-color: #0b1120; } .swagger-ui { color: #f8fafc; }'
    }));
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map