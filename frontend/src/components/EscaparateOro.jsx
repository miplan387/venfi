import React, { useState, useEffect } from 'react';
import { Crown, ArrowRight, Sparkles } from 'lucide-react';

export const EscaparateOro = ({ slots }) => {
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    // 1. Intentar obtener el slot #1 de las props
    const slotFromProps = slots?.find(s => s.position === 1);
    if (slotFromProps) {
      setActiveSlot(slotFromProps);
      return;
    }

    // 2. Fallback: consultar el endpoint /api/ranking si no viene en props
    const fetchTopSlot = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ranking');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const first = json.data.find(s => s.position === 1);
            if (first) setActiveSlot(first);
          }
        }
      } catch (err) {
        console.warn('No se pudo cargar el slot #1 para el escaparate:', err);
      }
    };

    fetchTopSlot();
  }, [slots]);

  // Si no hay anunciante en el puesto #1, no se muestra nada
  if (!activeSlot) return null;

  const businessName = activeSlot.businessName || activeSlot.business_name || 'Líder del Ranking';
  const avatar = activeSlot.avatar || activeSlot.logoUrl || activeSlot.logo_url || '👑';
  const category = activeSlot.category || 'Top Anunciante';

  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById('ranking-section') || document.getElementById('ranking');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <style>{`
        .escaparate-oro-container {
          position: fixed;
          top: 86px;
          right: 20px;
          z-index: 95;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.95rem;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(20, 24, 40, 0.92) 0%, rgba(35, 27, 10, 0.94) 50%, rgba(15, 23, 42, 0.96) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid #FFD700;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 310px;
          user-select: none;
        }
        .escaparate-oro-container:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 215, 0, 0.65);
          border-color: #FFE55C;
        }
        .escaparate-avatar {
          position: relative;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #FFD700 0%, #d97706 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
          border: 2px solid #ffffff;
        }
        .escaparate-business-name {
          font-size: 0.85rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .escaparate-category {
          font-size: 0.68rem;
          color: var(--color-gold);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .escaparate-oro-container {
            top: 78px;
            right: 10px;
            padding: 0.35rem 0.6rem;
            gap: 0.45rem;
            max-width: 175px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7), 0 0 12px rgba(255, 215, 0, 0.35);
          }
          .escaparate-avatar {
            width: 32px;
            height: 32px;
            font-size: 1.05rem;
            border-radius: 8px;
          }
          .escaparate-category {
            display: none;
          }
          .escaparate-business-name {
            font-size: 0.72rem;
          }
        }
      `}</style>
      <aside
        id="escaparate-oro"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        title="Haz clic para ver el Ranking Top 10"
        className="animate-gold-pulse escaparate-oro-container"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}
      >
        {/* Avatar / Logo con marco dorado */}
        <div className="escaparate-avatar">
          <span>{avatar}</span>
          {/* Corona pequeña superpuesta */}
          <span
            style={{
              position: 'absolute',
              top: '-7px',
              right: '-7px',
              fontSize: '0.85rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            }}
          >
            👑
          </span>
        </div>

        {/* Información del Anunciante */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
            {/* Badge 🏆 #1 en dorado */}
            <span
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #f59e0b 100%)',
                color: '#070b14',
                padding: '0.15rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: 900,
                letterSpacing: '0.3px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                lineHeight: 1
              }}
            >
              🏆 #1
            </span>
            <span className="escaparate-category">
              {category}
            </span>
          </div>

          {/* Nombre del Negocio */}
          <span className="escaparate-business-name">
            {businessName}
          </span>
        </div>

        {/* Indicador de Clic hacia el ranking */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
            paddingLeft: '0.25rem',
            flexShrink: 0
          }}
        >
          <div
            style={{
              background: 'rgba(255, 215, 0, 0.15)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              borderRadius: '8px',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFD700',
              fontSize: '0.85rem'
            }}
            title="Ver en el ranking"
          >
            👉
          </div>
        </div>
      </aside>
    </>
  );
};

export default EscaparateOro;
