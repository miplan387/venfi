import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldCheck, 
  Coins, 
  ArrowUpRight,
  LineChart
} from 'lucide-react';

export const RateCard = ({ 
  item, 
  rateKey, 
  typeLabel = 'OFICIAL BCV', 
  currencySuffix = '/ USD',
  accentColor = 'var(--color-primary)', 
  glowColor = 'rgba(0, 245, 155, 0.2)',
  borderColor = 'rgba(0, 245, 155, 0.35)',
  onSelect,
  onOpenTrend
}) => {
  if (!item) return null;

  // Determinar dirección de la tendencia (up, down, same)
  const direction = item.direction || (item.change?.startsWith('+') ? 'up' : (item.change?.startsWith('-') ? 'down' : 'same'));
  const changeText = item.change || '+0.00%';

  // Renderizar badge de tendencia según el requerimiento:
  // - Subió (up): Flecha hacia arriba ↑ (Rojo/Coral)
  // - Bajó (down): Flecha hacia abajo ↓ (Verde Esmeralda)
  // - Igual (same): Signo igual = (Gris Neutro)
  const renderTrendBadge = () => {
    if (direction === 'up') {
      return (
        <span 
          className="badge"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
          title="La tasa subió con respecto a la cotización anterior"
        >
          <TrendingUp size={13} color="#ef4444" />
          <span>↑ {changeText}</span>
        </span>
      );
    }

    if (direction === 'down') {
      return (
        <span 
          className="badge"
          style={{
            background: 'rgba(0, 245, 155, 0.15)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(0, 245, 155, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
          title="La tasa bajó con respecto a la cotización anterior"
        >
          <TrendingDown size={13} color="var(--color-primary)" />
          <span>↓ {changeText}</span>
        </span>
      );
    }

    return (
      <span 
        className="badge"
        style={{
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}
        title="La tasa se mantiene sin variación"
      >
        <Minus size={13} color="#94a3b8" />
        <span>= 0.00%</span>
      </span>
    );
  };

  const handleTrendClick = (e) => {
    e.stopPropagation();
    if (onOpenTrend) {
      onOpenTrend(rateKey, item);
    }
  };

  return (
    <div 
      className="glass-panel"
      onClick={onSelect}
      style={{
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 4px 25px ${glowColor}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Resplandor radial superior */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        background: `linear-gradient(135deg, ${glowColor} 0%, transparent 65%)`,
        width: '120px',
        height: '120px',
        pointerEvents: 'none'
      }}></div>

      {/* Header de la tarjeta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            {typeLabel.includes('BCV') ? (
              <ShieldCheck size={18} color={accentColor} />
            ) : typeLabel.includes('CRIPTO') ? (
              <Coins size={18} color={accentColor} />
            ) : null}
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
              {typeLabel}
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {item.name}
          </h3>
        </div>

        {/* Indicador de Tendencia */}
        {renderTrendBadge()}
      </div>

      {/* Monto de la Tasa */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bs.</span>
          <span className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>
            {typeof item.rate === 'number' ? item.rate.toFixed(2) : parseFloat(item.rate || 0).toFixed(2)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currencySuffix}</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {item.lastUpdate || item.source}
        </p>
      </div>

      {/* Footer de la tarjeta con Botón de Tendencias y Acción Rápida */}
      <div style={{
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.78rem'
      }}>
        {/* Botón Tendencias con gráfica */}
        <button
          onClick={handleTrendClick}
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
          title="Ver gráfico de tendencias de los últimos 7, 30 y 90 días"
        >
          <LineChart size={13} color={accentColor} />
          <span>📈 Tendencias</span>
        </button>

        {/* Botón Calcular */}
        <span style={{ color: accentColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          Calcular <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
};
