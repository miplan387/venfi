# 🎨 PROYECTO VENFI (Venezuela + Finanzas)
## ENTREGABLE FASE 1: FRONTEND BASE (LA "CÁSCARA")

---

### 1. Resumen de la Fase 1
Se ha implementado con éxito la estructura completa del frontend para **Venfi**, cumpliendo con la totalidad de los requisitos del Blueprint y el sistema de diseño oscuro de alta gama:

* **Tecnología:** React 19 + Vite + Vanilla CSS con Design Tokens (`Outfit`, `Inter` y `JetBrains Mono`).
* **Servidor Local Activo:** `http://localhost:5173/` (Servidor Vite dev server en ejecución).
* **Compilación:** `npm run build` probado y verificado (Build generado en `dist/` en <1s sin advertencias).

---

### 2. Componentes y Funcionalidades Desarrolladas

| Componente | Archivo | Descripción y Características |
| :--- | :--- | :--- |
| **Header Fijo** | [Header.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/Header.jsx) | Logo con degradado, **reloj digital en vivo de Caracas (VET, UTC-4)** que se actualiza cada segundo, **widget de clima de Caracas (28°C)**, navegación responsive y botón de conexión de billetera. |
| **Monitor de Tasas** | [HeroRates.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/HeroRates.jsx) | Visualización en vivo de **Tasa BCV Oficial**, **Dólar Paralelo**, **USDT Binance P2P** y **Euro BCV**. Cálculo automático de la brecha cambiaria (+% y +Bs.). Selector de tasa para autocompletar la calculadora. |
| **Convertidor USD/VES** | [CurrencyConverter.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/CurrencyConverter.jsx) | Conversión bidireccional instantánea (USD ↔ VES), selector de tasa activa, atajos rápidos ($5, $10, $20, $50, $100, $500), botón de copiar al portapapeles y **Calculadora de Vueltos en Efectivo**. |
| **Comparador de Remesas** | [RemittanceComparator.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/RemittanceComparator.jsx) | Simulador dinámico con input editable de monto a enviar en USD. Comparación en tiempo real de Binance P2P, Zoom / Western Union, MoneyGram y Airtm. Resalta automáticamente la plataforma con **Mayor Rendimiento en Bolívares**. |
| **Ranking Top 10** | [TopRanking.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/TopRanking.jsx) | **Puesto #1 VIP Dorado Gigante** con animación de pulso, aura luminosa, contador de impresiones y clics en vivo, tags y botón de visita. **Puestos #2 y #3 Plateados**. **Puestos #4 al #10 Oscuros**. Cuenta regresiva de 24h para reinicio de slots. |
| **Botón Flotante CTA** | [FloatingCta.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/FloatingCta.jsx) | Botón permanente **"¡OCUPA EL #1 POR $15!"** con animación dorada siempre accesible en la pantalla. |
| **Notificaciones FOMO** | [FomoNotification.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/FomoNotification.jsx) | Ticker dinámico en la esquina inferior izquierda mostrando transacciones recientes de anunciantes cada 9 segundos. |
| **Feed de Noticias** | [NewsFeed.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/NewsFeed.jsx) | Tarjetas con titulares financieros y económicos de medios venezolanos e internacionales. |
| **Modal de Pauta / Pago** | [AdvertiseModal.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/AdvertiseModal.jsx) | Flujo completo de 4 pasos (Configuración de Marca -> Selección de Puesto -> Pasarela Binance Pay USDT / Zelle -> Confirmación con lluvia de confetti y actualización del ranking en vivo). |
| **Modal de Billetera** | [WalletModal.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/WalletModal.jsx) | Conexión con MetaMask, Binance Web3 Wallet, Trust Wallet y TronLink. |
| **Modal Términos y Legal** | [TermsModal.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/TermsModal.jsx) | Despliegue interactivo de los Términos y Condiciones, aviso de SENIAT Código 8299 y deslinde de juegos de azar/entidad financiera. |
| **Footer** | [Footer.jsx](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/src/components/Footer.jsx) | Enlaces de navegación, contacto por correo y Telegram, copyright y disclaimer legal. |
