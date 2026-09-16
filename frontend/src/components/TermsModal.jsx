import React from 'react';
import { X, Scale, ShieldCheck, FileText } from 'lucide-react';

export const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2.25rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Scale size={20} color="var(--color-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
            Marco Regulatorio & Legal
          </span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
          Términos y Condiciones de Uso — Venfi
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Actividad Económica: Código SENIAT 8299 (Servicios empresariales y de publicidad).
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6
        }}>
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              1. Naturaleza Jurídica y Objeto del Servicio
            </h4>
            <p>
              Venfi es un portal web de consulta informativa referencial y de comercialización directa de espacios publicitarios digitales en Venezuela.
            </p>
            <p style={{ marginTop: '0.35rem', color: 'var(--color-gold)' }}>
              <strong>AVISO IMPORTANTE:</strong> Venfi NO es una institución bancaria, casa de cambio, transmisor de fondos, plataforma de apuestas ni juego de azar.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              2. Deslinde de Responsabilidad Cambiaria (Disclaimer)
            </h4>
            <p>
              Las cotizaciones correspondientes al Banco Central de Venezuela (BCV), Dólar Paralelo, Euro y Criptoactivos son obtenidas de fuentes públicas abiertas. Venfi no interviene, fija ni garantiza cotizaciones. Cualquier transacción comercial realizada entre usuarios en base a estas referencias es responsabilidad exclusiva de las partes.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              3. Condiciones del Ranking Publicitario Top 10
            </h4>
            <p>
              La adquisición de posiciones en el Ranking Top 10 constituye un contrato de prestación de servicios publicitarios temporales. Los anunciantes pagan por la exhibición de su enlace, nombre y eslogan. Queda terminantemente prohibida la pauta de esquemas piramidales, productos ilícitos o apuestas ilegales.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              4. Política de Pagos y Reembolsos
            </h4>
            <p>
              Los pagos mediante Binance Pay (USDT) y Zelle se destinan a la activación inmediata de los servidores y espacios publicitarios digitales. Al ser un servicio de consumo y despliegue instantáneo, los pagos no son reembolsables tras la publicación del anuncio.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.75rem', padding: '0.8rem' }}
        >
          Entendido y Aceptado
        </button>
      </div>
    </div>
  );
};
