import React from 'react';
import { ArrowLeft, Shield, Scale, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const Terms = ({ onBackToPortal }) => {
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
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 10, 18, 0.95) 100%)',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1.5px solid var(--border-gold)',
          marginBottom: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Scale size={28} color="var(--color-gold)" />
            <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
              MARCO LEGAL OFICIAL • SENIAT 8299
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', margin: '0 0 0.75rem 0' }}>
            Términos y Condiciones de Servicio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Última actualización: <strong>Octubre 2026</strong>. Por favor, lea detenidamente estos términos antes de utilizar la plataforma <strong>Venfi</strong> (Venezuela + Finanzas). Al acceder o pautar en el sitio, usted acepta quedar legalmente vinculado por las siguientes cláusulas.
          </p>
          <div style={{
            background: 'rgba(251, 191, 36, 0.08)',
            borderLeft: '4px solid var(--color-gold)',
            borderTop: '1px solid rgba(251, 191, 36, 0.25)',
            borderRight: '1px solid rgba(251, 191, 36, 0.25)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginTop: '1.25rem',
            fontSize: '0.9rem',
            color: '#f8fafc',
            lineHeight: 1.6
          }}>
            ⚠️ AVISO LEGAL: Las tasas mostradas en Venfi corresponden exclusivamente a fuentes oficiales (Banco Central de Venezuela) y referencias internacionales de carácter informativo. Venfi es una plataforma de información financiera y publicidad digital; no promueve, difunde ni facilita tipos de cambio no oficiales. Para operaciones formales, consulte siempre la tasa oficial del BCV.
          </div>
        </div>

        {/* Cláusulas Legales Detalladas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Cláusula 1 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)' }}>1.</span> Naturaleza del Servicio y Actividad Publicitaria
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              <strong>Venfi</strong> opera exclusivamente como una plataforma tecnológica de información financiera referencial y espacios publicitarios digitales bajo el clasificador comercial internacional y <strong>Código de Actividad SENIAT 8299</strong> (Otros Servicios Empresariales y Publicitarios N.C.P.).
            </p>
            <div style={{
              background: 'rgba(251, 191, 36, 0.08)',
              borderLeft: '4px solid var(--color-gold)',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: '#ffffff'
            }}>
              <strong>Declaración Expresa de No Ludopatía:</strong> Venfi NO constituye, ofrece, opera ni promueve juegos de azar, loterías, quinielas, apuestas ni esquemas piramidales o de captación no autorizada de fondos.
            </div>
          </div>

          {/* Cláusula 2 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)' }}>2.</span> Tasas Oficiales, Referenciales y Exención de Asesoría Financiera
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              Todas las cotizaciones de divisas (Dólar BCV Oficial, Euro BCV Oficial, Binance P2P USDT) y cotizaciones de remesas mostradas en este portal corresponden exclusivamente a fuentes oficiales (Banco Central de Venezuela) y referencias internacionales de carácter informativo.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginTop: '0.75rem', margin: 0 }}>
              Venfi no es una entidad bancaria, casa de cambio regulada por SUDEBAN, ni un intermediario financiero. El contenido no debe interpretarse bajo ninguna circunstancia como una recomendación de inversión, asesoría contable o directriz fiscal.
            </p>
          </div>

          {/* Cláusula 3 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)' }}>3.</span> Propiedad Intelectual y Derechos de Autor
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              Todo el software, código fuente, algoritmos de cálculo, diseño gráfico, logotipos, paleta cromática, esquemas de bases de datos y marcas denominativas referentes a <strong>Venfi</strong> son propiedad intelectual exclusiva de Venfi Media LLC. Queda estrictamente prohibida la reproducción, distribución o ingeniería inversa total o parcial sin autorización previa por escrito.
            </p>
          </div>

          {/* Cláusula 4 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)' }}>4.</span> Responsabilidad Limitada y Enlaces a Terceros
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              La plataforma incluye enlaces de hipertexto y espacios comerciales contratados por anunciantes del Ranking Top 10. Venfi no ejerce control sobre la veracidad, entrega de productos ni cumplimiento de acuerdos pactados en sitios web externos de terceros, y no asumirá responsabilidad civil, penal ni administrativa por disputas comerciales entre usuarios y anunciantes.
            </p>
          </div>

          {/* Cláusula 5 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)' }}>5.</span> Contratación Publicitaria y Política de No Reembolsos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              Los espacios publicitarios contratados mediante <strong>Binance Pay (USDT)</strong> o <strong>Zelle (USD)</strong> para figurar en el Ranking Top 10 se activan de manera automatizada o tras conciliación administrativa con una vigencia fija de 24 horas continuas.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginTop: '0.75rem', margin: 0 }}>
              Debido a la naturaleza de entrega y despliegue inmediato del servicio publicitario en tiempo real, <strong>no se admiten devoluciones ni reembolsos</strong> una vez confirmada la transacción y desplegado el anuncio.
            </p>
          </div>

          {/* Cláusula 6 */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-gold)' }}>6.</span> Privacidad, Cookies y Protección de Datos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              El tratamiento de datos personales, direcciones IP y métricas de navegación se rige de conformidad con nuestra <strong>Política de Privacidad</strong>, garantizando el cifrado de contraseñas mediante algoritmos bcrypt, uso de JSON Web Tokens (JWT) y la prohibición de cesión de datos a corredores comerciales de terceros.
            </p>
          </div>
        </div>

        {/* Cierre / Aceptación */}
        <div style={{
          textAlign: 'center',
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Para consultas legales o notificaciones regulatorias: <strong style={{ color: 'var(--color-gold)' }}>legal@venfi.app</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
