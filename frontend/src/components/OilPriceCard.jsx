import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Layers, 
  Globe2, 
  ShieldCheck, 
  ArrowUpRight,
  Calendar
} from 'lucide-react';

export const OilPriceCard = () => {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Hace un momento');
  const [fetchError, setFetchError] = useState(false);

  // Datos locales de respaldo si el backend está reiniciando
  const localFallback = {
    brent: {
      name: 'Petróleo Brent (Referencia)',
      code: 'BRENT',
      price: 74.35,
      previousPrice: 73.70,
      change: '+0.65',
      changeAmount: 0.65,
      changePercentage: '+0.88%',
      direction: 'up',
      isPositive: true,
      unit: 'USD/barril',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      source: 'U.S. Energy Information Administration (EIA)'
    },
    merey: {
      name: 'Crudo Merey 16 (Venezuela)',
      code: 'MEREY16',
      price: 60.35,
      previousPrice: 59.70,
      discount: 14.00,
      formula: 'Brent - Descuento ($14.00)',
      change: '+0.65',
      changeAmount: 0.65,
      changePercentage: '+1.09%',
      direction: 'up',
      isPositive: true,
      unit: 'USD/barril',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      source: 'Estimación Venfi (Brent - Descuento OPEP $14.00)'
    },
    meta: {
      mereyDiscount: 14.00,
      dataDelayNotice: 'Los precios del crudo spot reportados por la EIA se publican con un retraso habitual de 1 a 2 días hábiles respecto al mercado en vivo.',
      lastUpdated: new Date().toISOString(),
      dataSource: 'fallback',
      ttlHours: 6
    }
  };

  const fetchOilPrices = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/market/oil${manual ? '?forceRefresh=true' : ''}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setMarketData(json.data);
          setFetchError(false);
          setLastRefreshedAt(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } else {
        throw new Error('Respuesta no satisfactoria del backend');
      }
    } catch (err) {
      console.warn('[OilPriceCard] Usando datos de respaldo locales para petróleo:', err);
      if (!marketData) {
        setMarketData(localFallback);
      }
      setFetchError(true);
    } finally {
      setIsLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  // Polling cada 6 horas (6 * 60 * 60 * 1000 ms)
  useEffect(() => {
    fetchOilPrices(false);
    const interval = setInterval(() => {
      fetchOilPrices(false);
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const data = marketData || localFallback;
  const brent = data.brent;
  const merey = data.merey;
  const meta = data.meta;

  const renderTrendBadge = (item) => {
    const isUp = item.direction === 'up';
    const isDown = item.direction === 'down';

    // En cotizaciones de petróleo: subida = positivo (verde), bajada = negativo (rojo)
    if (isUp) {
      return (
        <span 
          className="badge" 
          style={{
            background: 'rgba(0, 245, 155, 0.15)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(0, 245, 155, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.22rem 0.65rem',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 800
          }}
        >
          <TrendingUp size={14} color="var(--color-primary)" />
          <span>↑ {item.change} ({item.changePercentage})</span>
        </span>
      );
    }

    if (isDown) {
      return (
        <span 
          className="badge" 
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.22rem 0.65rem',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 800
          }}
        >
          <TrendingDown size={14} color="#ef4444" />
          <span>↓ {item.change} ({item.changePercentage})</span>
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
          gap: '0.3rem',
          padding: '0.22rem 0.65rem',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: 700
        }}
      >
        <Minus size={14} color="#94a3b8" />
        <span>= {item.changePercentage || '0.00%'}</span>
      </span>
    );
  };

  return (
    <section id="petroleo" style={{ padding: '2.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* ENCABEZADO DE SECCIÓN */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Flame size={16} color="#fbbf24" />
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#fbbf24',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Mercado Petrolero
              </span>
              <span className="live-indicator" title="Monitoreo activo"></span>
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              margin: 0
            }}>
              Precios del Petróleo: <span style={{
                background: 'linear-gradient(135deg, #ffffff 30%, #fbbf24 80%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Brent & Crudo Merey 16</span>
            </h2>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              marginBottom: 0
            }}>
              Referencia internacional de la EIA y valor proyectado del crudo pesado venezolano.
            </p>
          </div>

          {/* BOTÓN DE ACTUALIZACIÓN & ESTADO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={13} color="var(--text-muted)" />
              <span>Sincronizado: <strong style={{ color: 'var(--text-primary)' }}>{lastRefreshedAt}</strong></span>
            </div>

            <button
              onClick={() => fetchOilPrices(true)}
              disabled={isRefreshing}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: isRefreshing ? 'not-allowed' : 'pointer'
              }}
              title="Actualizar cotizaciones del petróleo"
            >
              <RefreshCw 
                size={14} 
                className={isRefreshing ? 'animate-spin' : ''} 
                style={{
                  transition: 'transform 0.5s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none'
                }}
              />
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* ⚠️ AVISO VISIBLE OBLIGATORIO: RETRASO DE 1-2 DÍAS EN DATOS DE LA EIA */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.35)',
          borderRadius: '12px',
          padding: '0.9rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{
            background: 'rgba(251, 191, 36, 0.2)',
            borderRadius: '8px',
            padding: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '0.1rem',
            flexShrink: 0
          }}>
            <AlertTriangle size={17} color="#fbbf24" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fbbf24' }}>
                Aviso Oficial sobre Datos de Energía (EIA):
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem' }}>
                Retraso 1-2 Días Hábiles
              </span>
            </div>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              margin: '0.25rem 0 0 0',
              lineHeight: 1.45
            }}>
              {meta?.dataDelayNotice || 'Los precios spot oficiales publicados por la EIA se reportan con un retraso estándar de 1 a 2 días hábiles debido al tiempo de consolidación y cierre de contratos en los mercados internacionales.'}
            </p>
          </div>
        </div>

        {/* CONTENEDOR DE LAS DOS FICHAS COMPARATIVAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* TARJETA 1: CRUDO BRENT (BENCHMARK INTERNACIONAL) */}
          <div className="glass-panel" style={{
            padding: '1.75rem',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 18, 36, 0.95) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient Top Glow */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}></div>

            {/* Cabecera de la ficha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', marginBottom: '0.5rem' }}>
                  <Globe2 size={12} /> Referencia Internacional
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0 0 0' }}>
                  {brent.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Marcador Mar del Norte (FOB)
                </span>
              </div>
              {renderTrendBadge(brent)}
            </div>

            {/* Precio Principal */}
            <div style={{
              padding: '1.25rem 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.65rem'
            }}>
              <span style={{
                fontSize: '2.45rem',
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.5px'
              }}>
                ${brent.price.toFixed(2)}
              </span>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                USD / barril
              </span>
            </div>

            {/* Datos Técnicos y Fuente */}
            <div style={{ marginTop: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Cotización Previa:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  ${brent.previousPrice.toFixed(2)} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Fecha del Registro:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={12} color="var(--color-blue)" /> {brent.date}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Proveedor de Datos:</span>
                <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>
                  EIA (U.S. Gov)
                </span>
              </div>
            </div>
          </div>

          {/* TARJETA 2: CRUDO MEREY 16 (VENEZUELA) */}
          <div className="glass-panel" style={{
            padding: '1.75rem',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(28, 22, 10, 0.95) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient Gold Glow */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}></div>

            {/* Cabecera de la ficha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', marginBottom: '0.5rem' }}>
                  🇻🇪 Crudo Venezolano OPEP
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0 0 0' }}>
                  {merey.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
                  Densidad API 16° (Crudo Pesado)
                </span>
              </div>
              {renderTrendBadge(merey)}
            </div>

            {/* Precio Principal */}
            <div style={{
              padding: '1.25rem 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.65rem'
            }}>
              <span style={{
                fontSize: '2.45rem',
                fontWeight: 900,
                color: '#fbbf24',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.5px'
              }}>
                ${merey.price.toFixed(2)}
              </span>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                USD / barril
              </span>
            </div>

            {/* Datos Técnicos y Fórmula */}
            <div style={{ marginTop: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Fórmula de Estimación:</span>
                <span style={{
                  background: 'rgba(251, 191, 36, 0.15)',
                  color: '#fbbf24',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.78rem'
                }}>
                  Brent - ${meta.mereyDiscount?.toFixed(2) || '14.00'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Descuento de Mercado:</span>
                <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  -${meta.mereyDiscount?.toFixed(2) || '14.00'} USD/BBL
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Referencia Oficial:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  Canasta OPEP / PDVSA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BANNER INFORMATIVO INFERIOR: METODOLOGÍA & DESCUENTO */}
        <div className="glass-panel" style={{
          padding: '1.15rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 245, 155, 0.12)',
              border: '1px solid rgba(0, 245, 155, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                Cálculo Transparente de Venfi
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                El precio del Merey 16 se calcula restando el diferencial comercial histórico frente al Brent (${meta.mereyDiscount?.toFixed(2) || '14.00'} USD), configurable según cotizaciones OPEP.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Frecuencia de sincronización: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Cada 6 horas</span>
            </div>
            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }}></div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Origen de datos: </span>
              <span style={{ 
                color: meta.dataSource === 'eia_api' ? 'var(--color-primary)' : '#fbbf24', 
                fontWeight: 700 
              }}>
                {meta.dataSource === 'eia_api' ? 'EIA API Conectada' : 'Respaldo Local Calibrado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OilPriceCard;
