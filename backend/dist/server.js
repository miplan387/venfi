"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./database/db");
const env_1 = require("./config/env");
const startServer = async () => {
    try {
        // Inicializar conexión a base de datos
        await db_1.db.init();
        const app = (0, app_1.createApp)();
        app.listen(env_1.config.port, () => {
            console.log(`
  ==============================================================
  🚀 SERVIDOR VENFI BACKEND INICIADO CON ÉXITO
  ==============================================================
  📡 Puerto:           http://localhost:${env_1.config.port}
  📚 Swagger Docs:     http://localhost:${env_1.config.port}/api-docs
  🏥 Health Check:     http://localhost:${env_1.config.port}/api/health
  📊 Base de Datos:    ${db_1.db.isPostgresActive ? 'PostgreSQL (Supabase / Pool Activo)' : 'In-Memory Relational Engine (Modo Desarrollo)'}
  ==============================================================
      `);
        });
    }
    catch (error) {
        console.error('Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map