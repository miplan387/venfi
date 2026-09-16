import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

/**
 * Determina el estado del indicador según la magnitud de la brecha porcentual:
 * - 🔴 Rojo si la brecha es > 15% (alta)
 * - 🟡 Amarillo si la brecha está entre 5% y 15% (media)
 * - 🟢 Verde si la brecha es < 5% (baja)
 */
const getGapBadge = (percentage) => {
  const absVal = Math.abs(percentage);
  if (absVal > 15) {
    return {
      label: 'Alta',
      indicator: '🔴',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      glow: 'rgba(239, 68, 68, 0.2)'
    };
  }
  if (absVal >= 5) {
    return {
      label: 'Media',
      indicator: '🟡',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.12)',
      border: 'rgba(251, 191, 36, 0.3)',
      glow: 'rgba(251, 191, 36, 0.2)'
    };
  }
  return {
    label: 'Baja',
    indicator: '🟢',
    color: '#00f59b',
    bg: 'rgba(0, 245, 155, 0.12)',
    border: 'rgba(0, 245, 155, 0.3)',
    glow: 'rgba(0, 245, 155, 0.2)'
  };
};

export const Brechas = ({ rates }) => {
  // Tasas de referencia seguras con respaldos en caso de carga
  const bcvRate = rates?.bcv?.rate || 787.52;
  const usdtRate = rates?.usdtBinance?.rate || rates?.usdt?.rate || 933.15;
  const euroRate = rates?.euroBcv?.rate || rates?.euro?.rate || 919.15;

  // Cálculo de brechas con la fórmula: ((tasa1 - tasa2) / tasa2) * 100
  // 1. BCV vs USDT: ((USDT - BCV) / BCV) * 100
  const gapBcvUsdt = ((usdtRate - bcvRate) / bcvRate) * 100;

  // 2. BCV vs Euro: ((Euro - BCV) / BCV) * 100
  const gapBcvEuro = ((euroRate - bcvRate) / bcvRate) * 100;

  // 3. USDT vs Euro: ((USDT - Euro) / Euro) * 100
  const gapUsdtEuro = ((usdtRate - euroRate) / euroRate) * 100;

  const gapsData = [
    {
      id: 'bcv-usdt',
      title: 'BCV vs USDT',
      rate1Label: 'USDT',
      rate1Value: usdtRate,
      rate2Label: 'BCV',
      rate2Value: bcvRate,
      percent: gapBcvUsdt,
      subtext: `El USDT es un ${Math.abs(gapBcvUsdt).toFixed(1)}% ${gapBcvUsdt >= 0 ? 'más caro' : 'más barato'} que el BCV.`
    },
    {
      id: 'bcv-euro',
      title: 'BCV vs Euro',
      rate1Label: 'Euro',
      rate1Value: euroRate,
      rate2Label: 'BCV',
      rate2Value: bcvRate,
      percent: gapBcvEuro,
      subtext: `El Euro es un ${Math.abs(gapBcvEuro).toFixed(1)}% ${gapBcvEuro >= 0 ? 'más caro' : 'más barato'} que el BCV.`
    },
    {
      id: 'usdt-euro',
      title: 'USDT vs Euro',
      rate1Label: 'USDT',
      rate1Value: usdtRate,
      rate2Label: 'Euro',
      rate2Value: euroRate,
      percent: gapUsdtEuro,
      subtext: `El USDT es un ${Math.abs(gapUsdtEuro).toFixed(1)}% ${gapUsdtEuro >= 0 ? 'más caro' : 'más barato'} que el Euro.`
    }
  ];

  return (
    <div
      className="glass-panel"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Encabezado de la sección */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📊</span>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '-0.2px',
              color: '#ffffff',
              margin: 0
            }}
          >
            Brechas Cambiarias
          </h2>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <ArrowRightLeft size={13} />
          Diferencial porcentual entre mercados clave
        </span>
      </div>

      {/* Grid de Tarjetas de Brechas (Responsive: se apilan en pantallas móviles) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}
      >
        {gapsData.map((gap) => {
          const status = getGapBadge(gap.percent);
          const sign = gap.percent > 0 ? '+' : '';
          const formattedPercent = `${sign}${gap.percent.toFixed(1)}%`;

          return (
            <div
              key={gap.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${status.border}`,
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: `0 4px 12px ${status.glow}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              {/* Fila Superior: Título y Badge Indicador */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}
              >
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.2px'
                  }}
                >
                  {gap.title}
                </span>

                <div
                  style={{
                    background: status.bg,
                    border: `1px solid ${status.border}`,
                    color: status.color,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>{status.indicator}</span>
                  <span>{status.label}</span>
                </div>
              </div>

              {/* Fila Central: Porcentaje Principal */}
              <div style={{ marginBottom: '0.65rem' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: status.color,
                    letterSpacing: '-0.5px',
                    lineHeight: 1.1
                  }}
                >
                  {formattedPercent}
                </div>
              </div>

              {/* Fila Inferior: Subtexto explicativo y paridades */}
              <div>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.35,
                    marginBottom: '0.45rem'
                  }}
                >
                  {gap.subtext}
                </p>

                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '0.35rem',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <span>{gap.rate1Label}: Bs. {Number(gap.rate1Value).toFixed(2)}</span>
                  <span>{gap.rate2Label}: Bs. {Number(gap.rate2Value).toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Brechas;
