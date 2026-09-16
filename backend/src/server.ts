import { createApp } from './app';
import { db } from './database/db';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Inicializar conexión a base de datos
    await db.init();

    const app = createApp();

    app.listen(config.port, () => {
      console.log(`
  ==============================================================
  🚀 SERVIDOR VENFI BACKEND INICIADO CON ÉXITO
  ==============================================================
  📡 Puerto:           http://localhost:${config.port}
  📚 Swagger Docs:     http://localhost:${config.port}/api-docs
  🏥 Health Check:     http://localhost:${config.port}/api/health
  📊 Base de Datos:    ${db.isPostgresActive ? 'PostgreSQL (Supabase / Pool Activo)' : 'In-Memory Relational Engine (Modo Desarrollo)'}
  ==============================================================
      `);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
