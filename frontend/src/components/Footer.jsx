import React from 'react';
import { ShieldCheck, Heart, Scale, Mail, MessageCircle } from 'lucide-react';

export const Footer = ({ onOpenTerms, onOpenPrivacy, onOpenAdvertise, onOpenAdmin }) => {

  return (
    <footer style={{
      background: 'rgba(3, 7, 18, 0.98)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3.5rem 0 2rem 0',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Columna 1: Marca & Misión */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div className="venfi-logo-box" style={{
                width: '38px',
                height: '38px'
              }}>
                <img
                  src="/venfi-icon.png"
                  alt="Venfi Logo"
                  style={{
                    width: '26px',
                    height: '26px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 245, 155, 0.35))'
                  }}
                />
              </div>
              <span className="venfi-brand-title" style={{
                fontSize: '1.45rem',
                lineHeight: 1.1
              }}>
                VENFI
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              El centro de inteligencia financiera y el escaparate publicitario de mayor impacto para el ecosistema comercial venezolano.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="var(--color-primary)" />
              <span>Publicidad Digital • SENIAT Código 8299</span>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Herramientas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <a href="#tasas" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Cotización Dólar BCV Oficial
              </a>
              <a href="#tasas" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Euro BCV & USDT Binance
              </a>
              <a href="#convertidor" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Calculadora USD ↔ VES y Vueltos
              </a>
              <a href="#remesas" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Comparador de Remesas
              </a>
            </div>
          </div>

          {/* Columna 3: Ranking & Negocios */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Publicidad & Ranking
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <a href="#ranking" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 700 }}>
                🏆 Ver Ranking Top 10
              </a>
              <button
                onClick={onOpenAdvertise}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🔥 Ocupar Puesto #1 ($15/día)
              </button>
              <button
                onClick={onOpenTerms}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ⚖️ Términos y Condiciones
              </button>
              <button
                onClick={onOpenPrivacy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🔒 Política de Privacidad
              </button>
              <button
                onClick={onOpenAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🛡️ Panel de Administración (Cards)
              </button>
            </div>
          </div>


          {/* Columna 4: Contacto */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Atención & Soporte
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              ¿Deseas una pauta personalizada o reportar una transferencia?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <a href="mailto:soporte@venfi.app" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> soporte@venfi.app
              </a>
              <a href="https://t.me/venfioficial" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageCircle size={14} /> Canal Oficial Telegram
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          maxWidth: '960px',
          margin: '0 auto'
        }}>
          <p style={{ lineHeight: 1.6, background: 'rgba(251, 191, 36, 0.05)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.2)', color: '#e2e8f0' }}>
            ⚠️ AVISO LEGAL: Las tasas mostradas en Venfi corresponden exclusivamente a fuentes oficiales (Banco Central de Venezuela) y referencias internacionales de carácter informativo. Venfi es una plataforma de información financiera y publicidad digital; no promueve, difunde ni facilita tipos de cambio no oficiales. Para operaciones formales, consulte siempre la tasa oficial del BCV.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
            <span>© {new Date().getFullYear()} Venfi. Construido con</span>
            <Heart size={12} color="#ff4757" fill="#ff4757" />
            <span>para Venezuela y el mundo.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
