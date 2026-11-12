import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles, Award } from 'lucide-react';

export const GoldSplashAd = ({ defaultSlot = null, slot1 = null, onTrackClick }) => {
  // Estado local congelado para el anuncio del Puesto #1 (Oro)
  const initialData = slot1 || defaultSlot;
  const [splashAdData, setSplashAdData] = useState(initialData);

  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(4); // 4 segundos de duración
  const [isPaused, setIsPaused] = useState(false);

  // Capturar la publicidad UNA SOLA VEZ al montar el componente (congelada sin reaccionar a polling)
  useEffect(() => {
    if (!splashAdData && (slot1 || defaultSlot)) {
      setSplashAdData(slot1 || defaultSlot);
    }

    // Evento para reabrir si el usuario hace clic en el escaparate
    const handleReopen = () => {
      setIsVisible(true);
      setTimeLeft(4);
      setIsPaused(false);
    };

    window.addEventListener('open-gold-splash', handleReopen);
    return () => window.removeEventListener('open-gold-splash', handleReopen);
  }, []); // <-- El arreglo vacío es VITAL para que no se actualice ni cambie en segundo plano

  // Temporizador de 4 segundos para autocierre
  useEffect(() => {
    if (!isVisible) return;

    if (timeLeft <= 0) {
      setIsVisible(false);
      return;
    }

    if (isPaused) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisible, timeLeft, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentSlot = splashAdData || slot1 || defaultSlot || {
    position: 1,
    tier: 'gold',
    businessName: 'Digibird - Desarrollo de Software',
    slogan: 'Soluciones tecnológicas a medida',
    category: 'Software & Tecnología',
    url: 'https://digibird.com',
    avatar: '🦅'
  };

  const adUrl = currentSlot?.url || currentSlot?.targetUrl || 'https://digibird.com';
  const adTitle = currentSlot?.businessName || currentSlot?.business_name || 'Digibird - Desarrollo de Software';
  const adSlogan = currentSlot?.slogan || 'Soluciones tecnológicas a medida';
  const adCategory = currentSlot?.category || 'Software & Tecnología';
  const adAvatar = currentSlot?.avatar || '🦅';

  const handleLinkClick = () => {
    try {
      if (onTrackClick) {
        onTrackClick(1, 'nacional');
      }
    } catch (e) {
      console.warn('Error en click tracking del Splash:', e);
    }
  };

  return (
    <div
      className="gold-splash-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 8, 18, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '1rem',
        pointerEvents: 'auto'
      }}
    >
      <style>{`
        @keyframes fadeInSplash {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Contenedor Principal Fijo y Centrado (80% pantalla) */}
      <div
        className="splash-modal-card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          width: '80vw',
          height: '80vh',
          maxWidth: '940px',
          maxHeight: '660px',
          minWidth: '290px',
          minHeight: '400px',
          background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.97) 0%, rgba(10, 15, 29, 0.99) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.85)',
          borderRadius: '24px',
          boxShadow: '0 0 45px rgba(251, 191, 36, 0.4), 0 25px 60px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          animation: 'fadeInSplash 0.25s ease-out'
        }}
      >
        {/* Barra Superior */}
        <div
          style={{
            padding: '0.85rem 1.4rem',
            background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.24) 0%, rgba(217, 119, 6, 0.3) 100%)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                background: 'rgba(251, 191, 36, 0.25)',
                color: '#fef08a',
                fontSize: '0.78rem',
                fontWeight: 900,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(251, 191, 36, 0.45)',
                letterSpacing: '0.04em'
              }}
            >
              👑 PUESTO #1 VIP ORO
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#cbd5e1',
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Cierra en</span>
              <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{timeLeft}s</strong>
              {isPaused && (
                <span style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 600 }}>
                  (Pausado)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              title="Cerrar ventana"
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.35)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                e.currentTarget.style.color = '#f87171';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de progreso de tiempo restante (duración exacta 4s) */}
        <div style={{ height: '3px', background: 'rgba(255, 255, 255, 0.08)', width: '100%' }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              width: `${Math.max(0, Math.min(100, (timeLeft / 4) * 100))}%`,
              transition: 'width 1s linear'
            }}
          />
        </div>

        {/* Cuerpo Central del Anuncio */}
        <div
          style={{
            flex: 1,
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflowY: 'auto'
          }}
        >
          {/* Medalla e Icono */}
          <div
            style={{
              width: '92px',
              height: '92px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.32) 0%, rgba(217, 119, 6, 0.22) 100%)',
              border: '2px solid rgba(251, 191, 36, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.1rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 32px rgba(251, 191, 36, 0.38)',
              position: 'relative'
            }}
          >
            <span>{adAvatar}</span>
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#fbbf24',
                color: '#1e1b4b',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.45)'
              }}
            >
              <Award size={18} />
            </div>
          </div>

          {/* Categoría */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(251, 191, 36, 0.14)',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              padding: '0.22rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '0.65rem',
              letterSpacing: '0.04em'
            }}
          >
            <Sparkles size={13} />
            <span>{adCategory}</span>
          </div>

          {/* Nombre del Negocio */}
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 3.2vw, 2.3rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 0.75rem 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            {adTitle}
          </h2>

          {/* Slogan / Descripción */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
              color: '#cbd5e1',
              maxWidth: '650px',
              lineHeight: 1.55,
              margin: '0 0 1.75rem 0'
            }}
          >
            {adSlogan}
          </p>

          {/* Único Botón de Acción: Visitar Sitio Web (Eliminado botón de continuar) */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href={adUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 2.2rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: '14px',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.45)',
                transition: 'all 0.25s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.45)';
              }}
            >
              <span>Visitar Sitio Web</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldSplashAd;
