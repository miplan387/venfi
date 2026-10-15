import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Sparkles, 
  Scale, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  TrendingUp,
  Info
} from 'lucide-react';

const GRAMS_PER_TROY_OUNCE = 31.1035;
const GRAMS_PER_KILOGRAM = 1000;

export const GoldPriceCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Hace un momento');

  const localFallback = {
    gold: {
      price: 2650.00,
      currency: 'USD',
      unit: 'onza troy',
      updated_at: new Date().toISOString(),
      troy_ounce: {
        name: 'Onza Troy',
        code: 'XAU/USD',
        symbol: 'oz t',
        icon: '🪙',
        price: 2650.00,
        currency: 'USD',
        unit: 'onza troy',
        description: 'Estándar internacional de los mercados financieros (CME / LBMA)'
      },
      gram: {
        name: 'Gramo',
        code: 'XAU/G',
        symbol: 'g',
        icon: '💍',
        price: 85.20,
        currency: 'USD',
        unit: 'gramo',
        description: 'Común en joyería, orfebrería y comercio local'
      },
      kilogram: {
        name: 'Kilogramo',
        code: 'XAU/KG',
        symbol: 'kg',
        icon: '🧱',
        price: 85199.41,
        currency: 'USD',
        unit: 'kilogramo',
        description: 'Lingotes de inversión y transacciones mayoristas'
      }
    },
    conversion_factors: {
      grams_per_troy_ounce: GRAMS_PER_TROY_OUNCE,
      grams_per_kilogram: GRAMS_PER_KILOGRAM,
      formula: '1 onza troy = 31.1035 g | 1 kg = 1,000 g'
    },
    last_updated: new Date().toISOString(),
    data_source: 'Omkar Cloud (CME Gold Futures)',
    data_delay_warning: 'Precio referencial del oro (XAU/USD). Datos con posible retraso de minutos.',
    is_fallback: true
  };

  const fetchData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      let res;
      try {
        res = await fetch(`/api/market/gold${manual ? '?forceRefresh=true' : ''}`);
      } catch {
        res = await fetch(`http://localhost:5000/api/market/gold${manual ? '?forceRefresh=true' : ''}`);
      }

      if (!res.ok) {
        res = await fetch(`http://localhost:5000/api/market/gold${manual ? '?forceRefresh=true' : ''}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setError(null);
        setLastRefreshedAt(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setError('No se pudieron cargar los datos del oro');
      }
    } catch (err) {
      console.warn('[GoldPriceCard] Usando datos de respaldo para oro:', err);
      if (!data) {
        setData(localFallback);
      }
      setError(null);
    } finally {
      setLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  // Polling cada 6 horas
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section id="oro" className="max-w-7xl mx-auto px-4 py-8" style={{ scrollMarginTop: '135px' }}>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <div className="text-gray-400 animate-pulse flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Cargando cotización del oro en múltiples unidades...
          </div>
        </div>
      </section>
    );
  }

  const currentData = data || localFallback;
  const rawPrice = currentData.gold?.troy_ounce?.price || currentData.gold?.price || 2650.00;

  // Garantizar valores exactos para las 3 unidades
  const troyPrice = currentData.gold?.troy_ounce?.price || rawPrice;
  const gramPrice = currentData.gold?.gram?.price || Number((rawPrice / GRAMS_PER_TROY_OUNCE).toFixed(2));
  const kgPrice = currentData.gold?.kilogram?.price || Number(((rawPrice / GRAMS_PER_TROY_OUNCE) * GRAMS_PER_KILOGRAM).toFixed(2));

  const { data_source, data_delay_warning, is_fallback } = currentData;

  const unitsList = [
    {
      id: 'troy_ounce',
      name: 'Onza Troy',
      symbol: 'oz t',
      code: 'XAU/USD',
      icon: '🪙',
      badge: 'Estándar Internacional',
      badgeClass: 'badge-gold',
      price: troyPrice,
      unitLabel: 'por onza troy (31.10 g)',
      description: 'Mercados de futuros CME / LBMA y reservas de bancos centrales.',
      borderColor: 'rgba(251, 191, 36, 0.4)',
      bgGradient: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(33, 24, 10, 0.95) 100%)',
      accentColor: '#fbbf24'
    },
    {
      id: 'gram',
      name: 'Gramo',
      symbol: 'g',
      code: 'XAU/G',
      icon: '💍',
      badge: 'Joyería & Comercio',
      badgeClass: 'badge-emerald',
      price: gramPrice,
      unitLabel: 'por gramo (g)',
      description: 'Precio referencial para compra y venta en orfebrería y menudeo local.',
      borderColor: 'rgba(0, 245, 155, 0.35)',
      bgGradient: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 28, 22, 0.95) 100%)',
      accentColor: 'var(--color-primary)'
    },
    {
      id: 'kilogram',
      name: 'Kilogramo',
      symbol: 'kg',
      code: 'XAU/KG',
      icon: '🧱',
      badge: 'Lingote Mayorista',
      badgeClass: 'badge-blue',
      price: kgPrice,
      unitLabel: 'por kilogramo (1,000 g)',
      description: 'Formato estándar para lingotes Good Delivery y grandes custodias.',
      borderColor: 'rgba(56, 189, 248, 0.35)',
      bgGradient: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 22, 38, 0.95) 100%)',
      accentColor: '#38bdf8'
    }
  ];

  return (
    <section id="oro" style={{ padding: '2.5rem 0', position: 'relative', scrollMarginTop: '135px' }}>
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
                <Sparkles size={16} color="#fbbf24" />
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#fbbf24',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Metales Preciosos
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
              Precio Oficial del Oro: <span style={{
                background: 'linear-gradient(135deg, #ffffff 30%, #fbbf24 80%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>XAU/USD en 3 Unidades</span>
            </h2>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              marginBottom: 0
            }}>
              Cotización internacional del oro convertida a Onza Troy, Gramo y Kilogramo.
            </p>
          </div>

          {/* BOTÓN DE ACTUALIZACIÓN & ESTADO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {is_fallback && (
              <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                ⚠️ Datos de respaldo
              </span>
            )}

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
              onClick={() => fetchData(true)}
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
              title="Actualizar precio del oro"
            >
              <RefreshCw 
                size={14} 
                style={{
                  transition: 'transform 0.5s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none'
                }}
              />
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* ⚠️ AVISO VISIBLE OBLIGATORIO: FUENTE Y POSIBLE RETRASO */}
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
                Aviso sobre la Fuente de Cotización del Oro:
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem' }}>
                Fuente: {data_source || 'Omkar Cloud (CME Gold Futures)'}
              </span>
            </div>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              margin: '0.25rem 0 0 0',
              lineHeight: 1.45
            }}>
              {data_delay_warning || 'Precio referencial del oro (XAU/USD). Los datos corresponden a mercados de futuros y pueden presentar un desfase de algunos minutos respecto al mercado spot en tiempo real.'}
            </p>
          </div>
        </div>

        {/* FACTORES DE CONVERSIÓN VISIBLES */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
          padding: '0.65rem 1.15rem',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.82rem'
        }}>
          <Scale size={15} color="#fbbf24" />
          <span style={{ color: 'var(--text-muted)' }}>Factores de conversión oficiales:</span>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
            1 Onza Troy = 31.1035 gramos
          </span>
          <span className="badge badge-blue" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
            1 Kilogramo = 1,000 gramos
          </span>
        </div>

        {/* GRID DE LAS 3 FICHAS: ONZA TROY, GRAMO, KILOGRAMO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {unitsList.map((unitItem) => (
            <div 
              key={unitItem.id}
              className="glass-panel"
              style={{
                padding: '1.65rem',
                background: unitItem.bgGradient,
                border: `1px solid ${unitItem.borderColor}`,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
            >
              {/* Glow decorativo de fondo */}
              <div style={{
                position: 'absolute',
                top: '-35px',
                right: '-35px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${unitItem.accentColor}25 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}></div>

              <div>
                {/* Cabecera de la ficha */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className={`badge ${unitItem.badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.18rem 0.55rem', marginBottom: '0.45rem' }}>
                      {unitItem.badge}
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{unitItem.icon}</span>
                      <span>{unitItem.name}</span>
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Código: {unitItem.code} ({unitItem.symbol})
                    </span>
                  </div>
                </div>

                {/* Precio Principal */}
                <div style={{
                  padding: '1.15rem 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.55rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '2.15rem',
                    fontWeight: 900,
                    color: unitItem.accentColor,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '-0.5px'
                  }}>
                    ${unitItem.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)'
                  }}>
                    USD
                  </span>
                </div>
              </div>

              {/* Pie de tarjeta con unidad y descripción */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {unitItem.unitLabel}
                </div>
                <p style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  {unitItem.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RESUMEN INFORMATIVO INFERIOR */}
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
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#fbbf24" />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                Conversión Métrica Verificada de Venfi
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Las conversiones se aplican directamente sobre la cotización oficial de la onza troy de Omkar Cloud utilizando los estándares métricos del Bureau Internacional de Pesas y Medidas.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Intervalo de sincronización: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Cada 6 horas</span>
            </div>
            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }}></div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Estado API: </span>
              <span style={{ 
                color: !is_fallback ? 'var(--color-primary)' : '#fbbf24', 
                fontWeight: 700 
              }}>
                {!is_fallback ? 'Omkar Cloud Activo' : 'Modo Calibrado Local'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoldPriceCard;
