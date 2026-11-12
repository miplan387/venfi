import React, { useState } from 'react';
import { Flame, Gauge } from 'lucide-react';
import { initialNews } from '../data/mockData';

// Colores vibrantes alternados según requerimiento
const VIBRANT_COLORS = ['#00f59b', '#FFD700', '#3b82f6', '#f43f5e', '#a855f7'];

export const NewsTicker = ({ newsItems = initialNews }) => {
  const [speed, setSpeed] = useState(45); // Rango de 10 a 100

  const items = Array.isArray(newsItems) && newsItems.length > 0
    ? newsItems
    : (Array.isArray(initialNews) ? initialNews : []);

  if (items.length === 0) {
    return null;
  }

  // Duración en segundos para la animación CSS fluida
  // A mayor velocidad (100) -> menor duración (~18s). A menor velocidad (10) -> mayor duración (~85s)
  const cssDuration = Math.max(12, Math.round(92 - (speed * 0.72)));

  const renderNewsItem = (news, index, keySuffix = '') => {
    if (!news) return null;
    const key = `news-${news.id || index}-${keySuffix}`;
    const url = news.url || news.sourceUrl || '#noticias';
    const source = news.source || news.category || 'Venfidata';
    const title = news.title || 'Actualidad financiera';
    const itemColor = VIBRANT_COLORS[index % VIBRANT_COLORS.length];

    return (
      <div
        key={key}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginRight: '3rem',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="venfi-ticker-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, filter 0.15s ease'
          }}
        >
          {/* Badge de la Fuente */}
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              border: `1px solid ${itemColor}50`,
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}
          >
            {source}
          </span>

          {/* Titular de la Noticia con Tamaño 1.1rem y Color Vibrante */}
          <span
            className="venfi-ticker-title"
            style={{
              color: itemColor,
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}
          >
            {title}
          </span>

          {/* Separador Rayo Dorado */}
          <span
            style={{
              color: '#fbbf24',
              fontSize: '1.05rem',
              marginLeft: '0.85rem',
              filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))'
            }}
          >
            ⚡
          </span>
        </a>
      </div>
    );
  };

  return (
    <div
      className="venfi-news-ticker-container"
      style={{
        width: '100%',
        background: 'rgba(10, 15, 29, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
        display: 'flex',
        alignItems: 'center',
        padding: '0.55rem 1rem',
        gap: '0.85rem',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 35,
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)'
      }}
    >
      <style>{`
        @keyframes venfiContinuousScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .venfi-marquee-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          will-change: transform;
          animation: venfiContinuousScroll var(--ticker-duration, 45s) linear infinite;
        }

        .venfi-marquee-wrapper:hover .venfi-marquee-track {
          animation-play-state: paused !important;
        }

        .venfi-ticker-link:hover {
          filter: brightness(1.25);
          transform: translateY(-1px);
        }

        .venfi-ticker-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #0f172a;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.7);
        }
        .venfi-ticker-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #0f172a;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.7);
        }
      `}</style>

      {/* Etiqueta Izquierda: Última Hora */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(217, 119, 6, 0.35) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.55)',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          fontWeight: 800,
          color: '#fbbf24',
          fontSize: '0.78rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: '0 0 12px rgba(251, 191, 36, 0.2)'
        }}
      >
        <Flame size={15} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
        <span>Última Hora</span>
      </div>

      {/* Marquesina Central Fluida con Animación CSS 60FPS */}
      <div
        className="venfi-marquee-wrapper"
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          maskImage: 'linear-gradient(to right, transparent, black 25px, black calc(100% - 25px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 25px, black calc(100% - 25px), transparent)'
        }}
        title="Pasa el mouse para pausar las noticias"
      >
        <div
          className="venfi-marquee-track"
          style={{ '--ticker-duration': `${cssDuration}s` }}
        >
          {/* Pista 1: Elementos originales */}
          {items.map((news, idx) => renderNewsItem(news, idx, 'track-a'))}
          {/* Pista 2: Duplicado para loop continuo sin saltos */}
          {items.map((news, idx) => renderNewsItem(news, idx, 'track-b'))}
        </div>
      </div>

      {/* Control de Velocidad (Slider a la Derecha) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '0.25rem 0.7rem',
          borderRadius: '9999px',
          flexShrink: 0
        }}
        title="Ajustar velocidad del ticker en tiempo real"
      >
        <Gauge size={14} color="#94a3b8" />
        <span
          className="hidden sm:inline"
          style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}
        >
          Velocidad:
        </span>
        <input
          type="range"
          min="10"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="venfi-ticker-slider"
          style={{
            width: '65px',
            height: '4px',
            accentColor: '#fbbf24',
            cursor: 'pointer'
          }}
        />
        <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, minWidth: '18px' }}>
          {speed}
        </span>
      </div>
    </div>
  );
};

export default NewsTicker;
