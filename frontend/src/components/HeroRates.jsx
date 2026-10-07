import React, { useState } from 'react';
import { 
  RefreshCw, 
  ArrowUpRight,
  Globe2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { RateCard } from './RateCard';
import { RateTrendModal } from './RateTrendModal';
import Brechas from './Brechas';

export const HeroRates = ({ rates, onSelectRateForConverter }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Hace un momento');

  // Estado del Modal de Tendencias Históricas
  const [trendModalOpen, setTrendModalOpen] = useState(false);
  const [selectedTrendRateKey, setSelectedTrendRateKey] = useState('bcv');
  const [selectedTrendRateItem, setSelectedTrendRateItem] = useState({});

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed('Recién actualizado');
    }, 800);
  };

  const handleOpenTrendModal = (rateKey, item) => {
    setSelectedTrendRateKey(rateKey);
    setSelectedTrendRateItem(item);
    setTrendModalOpen(true);
  };

  // Tasas de referencia para indicadores
  const bcvRate = rates?.bcv?.rate || 787.52;
  const usdtRate = rates?.usdtBinance?.rate || 933.15;
  const gapBs = Math.abs(usdtRate - bcvRate).toFixed(2);
  const gapPercent = (((usdtRate - bcvRate) / bcvRate) * 100).toFixed(2);

  // Monedas Latam
  const latamRates = rates?.latam || {
    cop: { country: 'Colombia', code: 'COP', symbol: '$', flag: '🇨🇴', rateVsUsd: 4120.50, rateVsVes: 0.1911, change: '+0.15%', direction: 'up' },
    pen: { country: 'Perú', code: 'PEN', symbol: 'S/', flag: '🇵🇪', rateVsUsd: 3.75, rateVsVes: 210.00, change: '+0.08%', direction: 'up' },
    clp: { country: 'Chile', code: 'CLP', symbol: '$', flag: '🇨🇱', rateVsUsd: 955.00, rateVsVes: 0.8246, change: '+0.22%', direction: 'up' },
    brl: { country: 'Brasil', code: 'BRL', symbol: 'R$', flag: '🇧🇷', rateVsUsd: 5.48, rateVsVes: 143.70, change: '-0.12%', direction: 'down' },
    ars: { country: 'Argentina', code: 'ARS', symbol: '$', flag: '🇦🇷', rateVsUsd: 1190.00, rateVsVes: 0.6617, change: '+0.45%', direction: 'up' }
  };

  return (
    <section id="tasas" style={{ padding: '2.5rem 0 1.5rem 0' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="live-indicator"></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Monitor Cambiario en Tiempo Real
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#ffffff'
            }}>
              Cotización del Dólar, Euro y Monedas de Latinoamérica
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Tasas oficiales del Banco Central de Venezuela, referencias internacionales y monedas de Latinoamérica.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Brecha BCV vs USDT Badge */}
            <div style={{
              background: 'rgba(0, 245, 155, 0.08)',
              border: '1px solid rgba(0, 245, 155, 0.25)',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brecha BCV / USDT:</span>
              <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                +{gapPercent}% (+Bs. {gapBs})
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              title="Actualizar cotizaciones"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              <span style={{ fontSize: '0.75rem' }}>{lastRefreshed}</span>
            </button>
          </div>
        </div>

        {/* GRID DE TASAS PRINCIPALES: 1. BCV USD -> 2. EURO BCV -> 3. BINANCE USDT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {/* TARJETA 1: DÓLAR BCV */}
          <RateCard 
            item={rates?.bcv || { name: 'Dólar BCV', rate: 787.52, change: '+0.48%', direction: 'up', source: 'Banco Central de Venezuela' }}
            rateKey="bcv"
            typeLabel="OFICIAL BCV"
            currencySuffix="/ USD"
            accentColor="var(--color-primary)"
            glowColor="rgba(0, 245, 155, 0.15)"
            borderColor="rgba(0, 245, 155, 0.35)"
            onSelect={() => onSelectRateForConverter('bcv')}
            onOpenTrend={handleOpenTrendModal}
          />

          {/* TARJETA 2: EURO (€) BCV */}
          <RateCard 
            item={rates?.euroBcv || { name: 'Euro (€) BCV', rate: 919.15, change: '+0.34%', direction: 'up', source: 'Banco Central de Venezuela' }}
            rateKey="euro"
            typeLabel="OFICIAL BCV"
            currencySuffix="/ EUR"
            accentColor="#38bdf8"
            glowColor="rgba(56, 189, 248, 0.15)"
            borderColor="rgba(56, 189, 248, 0.35)"
            onSelect={() => onSelectRateForConverter('euro')}
            onOpenTrend={handleOpenTrendModal}
          />

          {/* TARJETA 3: BINANCE P2P USDT */}
          <RateCard 
            item={rates?.usdtBinance || { name: 'Binance USDT', rate: 933.15, change: '+0.57%', direction: 'up', source: 'Binance P2P Market' }}
            rateKey="usdt"
            typeLabel="CRIPTO & P2P"
            currencySuffix="/ USDT"
            accentColor="var(--color-gold)"
            glowColor="rgba(251, 191, 36, 0.15)"
            borderColor="rgba(251, 191, 36, 0.3)"
            onSelect={() => onSelectRateForConverter('usdt')}
            onOpenTrend={handleOpenTrendModal}
          />
        </div>

        {/* SECCIÓN DE BRECHAS CAMBIARIAS */}
        <Brechas rates={rates} />

        {/* BARRA DE COTIZACIONES EN LATINOAMÉRICA */}
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.75) 0%, rgba(6, 10, 18, 0.85) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe2 size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                Cotizaciones en Latinoamérica
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Paridad en Bolívares y Dólares para envío de remesas
            </span>
          </div>


          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem'
          }}>
            {Object.entries(latamRates).map(([key, item]) => {
              const dir = item.direction || 'up';
              return (
                <div
                  key={key}
                  onClick={() => {
                    const conv = document.getElementById('convertidor');
                    if (conv) conv.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{item.flag}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.country} ({item.code})
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: dir === 'up' ? '#ef4444' : 'var(--color-primary)'
                    }}>
                      {dir === 'up' ? '↑' : '↓'} {item.change || '0.1%'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        Bs. {Number(item.rateVsVes || 0).toFixed(item.rateVsVes < 1 ? 4 : 2)}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>por 1 {item.code}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.symbol}{Number(item.rateVsUsd || 0).toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>por 1 USD</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÓN CTA PRINCIPAL: RANKING TOP - ¡DESCÚBRELO! */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '2.25rem'
        }}>
          <button
            onClick={() => {
              const target = document.getElementById('ranking-section') || document.getElementById('ranking');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%)',
              color: '#070b14',
              padding: '1.05rem 2.6rem',
              borderRadius: '9999px',
              border: '2px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 10px 35px rgba(245, 158, 11, 0.5), 0 0 25px rgba(255, 215, 0, 0.4)',
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              fontWeight: 900,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 16px 45px rgba(245, 158, 11, 0.7), 0 0 35px rgba(255, 215, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 35px rgba(245, 158, 11, 0.5), 0 0 25px rgba(255, 215, 0, 0.4)';
            }}
          >
            <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🏆</span>
            <span>Ranking Top - ¡Descúbrelo!</span>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              display: 'inline-block',
              marginLeft: '0.2rem'
            }}>
              ↓
            </span>
          </button>
        </div>

        {/* MODAL DE TENDENCIA HISTÓRICA CON GRÁFICA INTERACTIVA */}
        <RateTrendModal 
          isOpen={trendModalOpen}
          onClose={() => setTrendModalOpen(false)}
          rateKey={selectedTrendRateKey}
          item={selectedTrendRateItem}
        />
      </div>
    </section>
  );
};
