import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

export const Privacy = ({ onBackToPortal }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 0 5rem 0', color: 'var(--text-primary)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Botón Volver */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={onBackToPortal}
            className="btn btn-secondary"
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
          >
            <ArrowLeft size={16} /> Volver al Portal Principal
          </button>
        </div>

        {/* Encabezado Principal */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 25, 20, 0.95) 100%)',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1.5px solid var(--border-primary)',
          marginBottom: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 245, 155, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={28} color="var(--color-primary)" />
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
              PROTECCIÓN DE DATOS Y PRIVACIDAD
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', margin: '0 0 0.75rem 0' }}>
            Política de Privacidad
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            En <strong>Venfi</strong> valoramos y protegemos la privacidad de nuestros usuarios y anunciantes. Esta política detalla qué información recopilamos, con qué finalidad técnica se procesa y las estrictas medidas de seguridad implementadas.
          </p>
        </div>

        {/* Secciones de Privacidad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Sección 1 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} color="var(--color-primary)" /> 1. Información que Recopilamos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              Recopilamos únicamente los datos indispensables para el funcionamiento y seguridad de la plataforma:
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
              <li><strong>Datos de Cuenta:</strong> Correo electrónico, nombre de usuario y hash criptográfico de contraseña (cifrado irreversible con bcrypt).</li>
              <li><strong>Datos de Campaña Publicitaria:</strong> Nombre comercial de la marca, lema o slogan, enlace de destino (URL) y emoji representativo.</li>
              <li><strong>Datos de Registro Técnico y Analítica:</strong> Dirección IP anonimizada, país y ciudad de procedencia (estimada por geolocalización de red), tipo de navegador (User-Agent) y procedencia de clics con fines de métricas de audiencia.</li>
              <li><strong>Datos de Transacción:</strong> Identificador comercial de orden, monto en USDT o USD, comprobante de pago Zelle o hash de transacción en Binance Pay. <em>(Nota: No almacenamos claves privadas ni datos bancarios sensibles).</em></li>
            </ul>
          </div>

          {/* Sección 2 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} color="var(--color-primary)" /> 2. Finalidad del Tratamiento de Datos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              Los datos recolectados se emplean exclusivamente para:
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
              <li>Autenticación segura del usuario mediante JSON Web Tokens (JWT con expiración controlada).</li>
              <li>Publicación y mantenimiento de las posiciones del Ranking Top 10 en la página principal.</li>
              <li>Generación de reportes de retorno de inversión (ROI), clics e impresiones en el Dashboard de Anunciantes.</li>
              <li>Envío de notificaciones operativas (confirmación de pagos, activación de ranking y alertas de vencimiento de pauta).</li>
              <li>Prevención de fraudes cibernéticos, ataques de fuerza bruta y ataques DDoS mediante limitadores de tasa (Rate Limiting).</li>
            </ul>
          </div>

          {/* Sección 3 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} color="var(--color-primary)" /> 3. No Divulgación a Terceros (Cero Venta de Datos)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              <strong>Venfi mantiene una política estricta de confidencialidad:</strong> Jamás venderemos, alquilaremos, cederemos ni comercializaremos su información personal con intermediarios de datos, agencias de publicidad masiva ni redes de terceros con fines de spam.
            </p>
          </div>

          {/* Sección 4 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} color="var(--color-primary)" /> 4. Derechos del Usuario (ARCO)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              En cualquier momento, usted tiene derecho a solicitar el acceso a sus datos almacenados, la rectificación de información inexacta o la supresión definitiva de su cuenta de anunciante.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginTop: '0.75rem', margin: 0 }}>
              Para ejercer cualquiera de estos derechos, contáctenos directamente a través del correo oficial: <strong style={{ color: 'var(--color-primary)' }}>privacidad@venfi.app</strong>.
            </p>
          </div>
        </div>

        {/* Cierre */}
        <div style={{
          textAlign: 'center',
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Oficial de Privacidad y Seguridad Digital: <strong style={{ color: 'var(--color-primary)' }}>seguridad@venfi.app</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
