import React, { useState, useEffect, useRef } from 'react';
import RawDraggable from 'react-draggable';
import { Crown, ArrowRight, Sparkles, Move } from 'lucide-react';
import { apiUrl } from '../config/api';

const SafeDraggable = RawDraggable?.default || RawDraggable;

export const EscaparateOro = ({ slots, selectedZone = 'nacional', onOpenAdvertise }) => {
  const [activeSlot, setActiveSlot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStartTimeRef = useRef(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTopSlot = async () => {
      try {
        const res = await fetch(apiUrl(`/api/ranking?zone=${selectedZone || 'nacional'}`));
        if (res && res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            const first = json.data.find(s => s.position === 1);
            if (first) {
              setActiveSlot(first);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('No se pudo cargar el slot #1 para el escaparate:', err);
      }

      // Fallback a slots recibidos por props
      if (isMounted && slots && slots.length > 0) {
        const slotFromProps = slots.find(s => s.position === 1);
        if (slotFromProps) setActiveSlot(slotFromProps);
      }
    };

    fetchTopSlot();
    return () => { isMounted = false; };
  }, [selectedZone, slots]);

  const amountPaid = Number(activeSlot?.amountPaid ?? activeSlot?.amount_paid ?? 0);
  const isUnoccupied = !activeSlot || amountPaid === 0;

  const currentZoneKey = (selectedZone || 'nacional').toLowerCase();
  const zoneName = currentZoneKey !== 'nacional'
    ? (currentZoneKey.charAt(0).toUpperCase() + currentZoneKey.slice(1))
    : 'tu ciudad';

  const businessName = isUnoccupied
    ? (currentZoneKey === 'nacional' ? '¡Sé el primer #1 Nacional!' : `¡Sé el primer #1 en ${zoneName}!`)
    : (activeSlot.businessName || activeSlot.business_name || 'Líder del Ranking');

  const avatar = isUnoccupied
    ? '✨'
    : (activeSlot.avatar || activeSlot.logoUrl || activeSlot.logo_url || '👑');

  const category = isUnoccupied
    ? 'ESPACIO DISPONIBLE'
    : (activeSlot.category || 'Top Anunciante');

  const handleDragStart = () => {
    dragStartTimeRef.current = Date.now();
    setHasDragged(false);
    setIsDragging(true);
  };

  const handleDragMove = () => {
    setHasDragged(true);
  };

  const handleDragStop = () => {
    setIsDragging(false);
    // Si se movió durante más de 100ms o cambió posición, mantener hasDragged brevemente
    const elapsed = Date.now() - dragStartTimeRef.current;
    if (elapsed > 120) {
      setTimeout(() => setHasDragged(false), 250);
    } else {
      setHasDragged(false);
    }
  };

  const handleClick = (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (isUnoccupied && onOpenAdvertise) {
      onOpenAdvertise(selectedZone);
      return;
    }

    // Al hacer clic, también podemos abrir el modal Splash Ad o desplazarse al ranking
    window.dispatchEvent(new CustomEvent('open-gold-splash'));
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
          background: linear-gradient(135deg, rgba(20, 24, 40, 0.94) 0%, rgba(35, 27, 10, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid #FFD700;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.65), 0 0 20px rgba(255, 215, 0, 0.4);
          cursor: grab;
          max-width: 320px;
          user-select: none;
          touch-action: none;
        }
        .escaparate-oro-container:active, .escaparate-is-dragging {
          cursor: grabbing !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 32px rgba(255, 215, 0, 0.7) !important;
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
          color: #fbbf24;
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
            max-width: 185px;
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

      <SafeDraggable
        nodeRef={nodeRef}
        onStart={handleDragStart}
        onDrag={handleDragMove}
        onStop={handleDragStop}
        cancel=".no-drag, button, a"
        defaultPosition={{ x: 0, y: 0 }}
      >
        <aside
          ref={nodeRef}
          id="escaparate-oro"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          title={isUnoccupied ? `¡Puesto #1 Disponible! Haz clic o arrastra para mover` : "Arrastra para mover o haz clic para ver"}
          className={`animate-gold-pulse escaparate-oro-container ${isDragging ? 'escaparate-is-dragging' : ''}`}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'box-shadow 0.25s ease, border-color 0.25s ease'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick(e);
            }
          }}
        >
          {/* Avatar / Logo con marco dorado */}
          <div className="escaparate-avatar">
            <span>{avatar}</span>
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
                {isUnoccupied ? 'DISPONIBLE' : '🏆 #1'}
              </span>
              <span className="escaparate-category">
                {category}
              </span>
            </div>

            <span className="escaparate-business-name">
              {businessName}
            </span>
          </div>

          {/* Indicador de Arrastre / Clic */}
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
            {isUnoccupied ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #f59e0b 100%)',
                  color: '#070b14',
                  borderRadius: '8px',
                  padding: '0.22rem 0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
                }}
                title="Pautar ahora"
              >
                <span>Pautar</span>
                <ArrowRight size={12} />
              </div>
            ) : (
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
                title="Arrastra para mover"
              >
                <Move size={14} color="#FFD700" />
              </div>
            )}
          </div>
        </aside>
      </SafeDraggable>
    </>
  );
};

export default EscaparateOro;
