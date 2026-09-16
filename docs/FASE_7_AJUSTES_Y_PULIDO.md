# ⚖️ PROYECTO VENFI (Venezuela + Finanzas)
## FASE 7: AJUSTES NECESARIOS Y PULIDO PRE-LANZAMIENTO
### REPORTE DE EJECUCIÓN — TAREA 7.1: BLINDAJE LEGAL COMPLETO

---

### 1. Resumen Ejecutivo
Se ha implementado el **blindaje legal y regulatorio completo** en el frontend de **Venfi**, garantizando el cumplimiento de la legislación mercantil venezolana (**Código de Actividad SENIAT 8299**), normativas internacionales de protección al consumidor y políticas de privacidad y datos personales.

* **Página de Términos y Condiciones:** `frontend/src/pages/Terms.jsx`
* **Página de Política de Privacidad:** `frontend/src/pages/Privacy.jsx`
* **Consentimiento Obligatorio:** Checkbox legal interactivo en `frontend/src/components/AdvertiseModal.jsx`
* **Navegación Footer:** Enlaces directos a Términos y Privacidad en `frontend/src/components/Footer.jsx`

---

### 2. Estructura de las Cláusulas Legales Integradas

| Cláusula | Contenido Legal Clave |
| :--- | :--- |
| **Cláusula 1: Naturaleza del Servicio** | Publicidad digital bajo código SENIAT 8299. **Declaración expresa de No Ludopatía / No Juegos de Azar**. |
| **Cláusula 2: Tasas Referenciales** | Indicadores informativos extraídos de fuentes públicas; **Exención explícita de asesoría financiera o bancaria**. |
| **Cláusula 3: Propiedad Intelectual** | Protección del código fuente, algoritmos, marca, logotipo y diseño UI de Venfi Media LLC. |
| **Cláusula 4: Responsabilidad Limitada** | Exención de responsabilidad por acuerdos y transacciones comerciales entre usuarios y anunciantes del Ranking. |
| **Cláusula 5: Política de Reembolsos** | No reembolsos una vez activada y desplegada la pauta publicitaria en tiempo real. |
| **Cláusula 6: Privacidad de Datos** | Cero venta de datos a terceros; cifrado de contraseñas con bcrypt y JWT seguro. |

---

### 3. Política de Privacidad y Derechos ARCO

* **Recopilación Estrictamente Necesaria:** Correo, credenciales cifradas, datos de campaña publicitaria, IPs anonimizadas y geolocalización agregada por ciudad para analítica.
* **Cero Comercialización con Terceros:** Prohibición absoluta de venta de listas de correos o datos de navegación a intermediarios o brokers publicitarios.
* **Derechos ARCO y Contacto:** Canales formales de ejercicio de derechos en `privacidad@venfi.app` y `legal@venfi.app`.

---

### 4. Checkbox de Aceptación Obligatoria en Flujo de Pauta

Se condicionó el paso a selección de posición y pago al consentimiento explícito del anunciante:
```jsx
<input
  type="checkbox"
  id="acceptTerms"
  checked={formData.acceptedTerms}
  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
  required
/>
<label htmlFor="acceptTerms">
  Acepto los Términos y Condiciones y la Política de Privacidad (SENIAT 8299).
</label>
```

---

### 5. Tarea 7.2: Seguridad, Headers y Preparación para Producción

Se aplicaron las directivas de seguridad recomendadas por OWASP y las mejores prácticas de despliegue en contenedores:

#### 1. Blindaje con Helmet y Content Security Policy (CSP) en [app.ts](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/backend/src/app.ts):
* **HSTS (HTTP Strict Transport Security):** `maxAge: 31536000` con `includeSubDomains: true` y `preload: true`.
* **Frameguard (Anti-Clickjacking):** `action: 'deny'`.
* **Referrer Policy:** `strict-origin-when-cross-origin`.
* **Protección XSS & Sniffing:** `noSniff: true`, `xssFilter: true`, `hidePoweredBy: true`.
* **CSP Directives:** Autoriza dominios oficiales de fuentes (`Google Fonts`), APIs financieras (`DolarAPI`, `Open-Meteo`), pasarelas (`Binance Pay`) y generador de códigos QR (`QRServer`).

#### 2. Configuración CORS de Alta Seguridad:
* Filtrado con lista blanca estricta (`venfi.app`, `www.venfi.app`, `localhost:5173`, `localhost:3000`).
* Admisión de encabezados comerciales de Binance Pay (`BinancePay-Timestamp`, `BinancePay-Nonce`, `BinancePay-Signature`).

#### 3. Infraestructura Docker & Multi-Stage Production Stack:
* **Backend:** [Dockerfile](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/backend/Dockerfile) (Node 22 Alpine, build multi-etapa, usuario sin privilegios `USER node`, healthcheck activo).
* **Frontend:** [Dockerfile](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/Dockerfile) (Build Vite -> Servidor [nginx.conf](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/frontend/nginx.conf) con compresión Gzip y routing SPA).
* **Orquestador:** [docker-compose.yml](file:///home/xrafa387/Escritorio/Proyecto%20Venfi/docker-compose.yml) unificando PostgreSQL 16 Alpine, Backend API y Nginx Frontend.

