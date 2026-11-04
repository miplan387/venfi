import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Registrar componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

/**
 * Componente MiniTrendChart (Sparkline interactivo con indicador de tendencia)
 * 
 * Props:
 * @param {string} commodityType - 'gold' | 'oil_brent' | 'oil_merey'
 * @param {string} accentColor - Color principal de la línea y glow (ej: '#fbbf24', '#38bdf8')
 * @param {string} unit - Sufijo de unidad para tooltip (ej: 'USD', 'USD/oz', 'USD/barril')
 * @param {function} transformPrice - Función opcional para escalar el precio (ej: para gramo o kilogramo)
 * @param {number} defaultDays - 7 o 30 días
 * @param {boolean} showControls - Mostrar botones selectores de 7D / 30D
 * @param {number} height - Altura del gráfico en px
 */
export const MiniTrendChart = ({
  commodityType = 'gold',
  accentColor = '#fbbf24',
  unit = 'USD',
  transformPrice = null,
  defaultDays = 7,
  showControls = true,
  height = 70
}) => {
  const [days, setDays] = useState(defaultDays);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({
    changeAmount: 0,
    changePercentage: '0.00',
    direction: 'same'
  });
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  // Cargar historial de cotizaciones desde la API con fallback
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        let res;
        try {
          res = await fetch(`/api/market/history/${commodityType}?days=${days}`);
        } catch {
          res = await fetch(`http://localhost:5000/api/market/history/${commodityType}?days=${days}`);
        }

        if (!res.ok) {
          res = await fetch(`http://localhost:5000/api/market/history/${commodityType}?days=${days}`);
        }

        const json = await res.json();
        if (json.success && json.data && isMounted) {
          const rawHistory = json.data.history || [];
          
          // Aplicar función transformadora si existe (para unidades derivadas de oro como gramo o kg)
          const processedHistory = rawHistory.map(item => ({
            date: item.date,
            price: transformPrice ? transformPrice(item.price) : item.price
          }));

          setHistoryData(processedHistory);

          if (processedHistory.length >= 2) {
            const first = processedHistory[0].price;
            const last = processedHistory[processedHistory.length - 1].price;
            const diff = Number((last - first).toFixed(2));
            const pct = first > 0 ? Number(((diff / first) * 100).toFixed(2)) : 0;
            const dir = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'same');

            setStats({
              changeAmount: diff,
              changePercentage: pct > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`,
              direction: dir
            });
          }
        }
      } catch (err) {
        console.warn(`[MiniTrendChart] Fallback visual local para ${commodityType}:`, err);
        // Generar puntos simulados si el backend no responde
        if (isMounted) {
          const fallbackPoints = [];
          const base = commodityType === 'gold' ? 2650 : (commodityType === 'oil_brent' ? 74.35 : 60.35);
          for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0];
            const noise = Math.sin(i * 0.8) * (base * 0.015);
            const rawP = base + noise;
            fallbackPoints.push({
              date: d,
              price: transformPrice ? transformPrice(rawP) : rawP
            });
          }
          setHistoryData(fallbackPoints);
          if (fallbackPoints.length >= 2) {
            const first = fallbackPoints[0].price;
            const last = fallbackPoints[fallbackPoints.length - 1].price;
            const diff = Number((last - first).toFixed(2));
            const pct = first > 0 ? Number(((diff / first) * 100).toFixed(2)) : 0;
            setStats({
              changeAmount: diff,
              changePercentage: pct > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`,
              direction: diff > 0 ? 'up' : (diff < 0 ? 'down' : 'same')
            });
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [commodityType, days, transformPrice]);

  // Configuración de Chart.js
  const chartData = useMemo(() => {
    return {
      labels: historyData.map(h => h.date),
      datasets: [
        {
          data: historyData.map(h => h.price),
          borderColor: accentColor,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return 'rgba(251, 191, 36, 0.1)';
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, `${accentColor}35`); // Opacidad arriba
            gradient.addColorStop(1, `${accentColor}00`); // Transparente abajo
            return gradient;
          },
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: accentColor,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }
      ]
    };
  }, [historyData, accentColor]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 10, weight: '600' },
        bodyFont: { size: 12, weight: 'bold', family: 'monospace' },
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return '';
            return `Fecha: ${items[0].label}`;
          },
          label: (context) => {
            const val = context.parsed.y;
            return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false,
        grid: { display: false }
      },
      y: {
        display: false,
        grid: { display: false }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  }), [unit]);

  // Render del indicador visual de tendencia (↑, ↓, =) con colores verde, rojo y gris
  const renderTrendIndicator = () => {
    const isUp = stats.direction === 'up';
    const isDown = stats.direction === 'down';

    if (isUp) {
      return (
        <span 
          style={{
            background: 'rgba(0, 245, 155, 0.15)',
            color: '#00f59b',
            border: '1px solid rgba(0, 245, 155, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}
          title={`Alza en los últimos ${days} días: +$${stats.changeAmount} USD`}
        >
          <TrendingUp size={12} color="#00f59b" />
          <span>↑ +${stats.changeAmount} ({stats.changePercentage})</span>
        </span>
      );
    }

    if (isDown) {
      return (
        <span 
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}
          title={`Baja en los últimos ${days} días: $${stats.changeAmount} USD`}
        >
          <TrendingDown size={12} color="#ef4444" />
          <span>↓ ${stats.changeAmount} ({stats.changePercentage})</span>
        </span>
      );
    }

    return (
      <span 
        style={{
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}
        title={`Sin variación significativa en los últimos ${days} días`}
      >
        <Minus size={12} color="#94a3b8" />
        <span>= 0.00 (0.00%)</span>
      </span>
    );
  };

  return (
    <div style={{
      width: '100%',
      padding: '0.75rem 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)'
    }}>
      {/* Barra superior del MiniTrend: Indicador de Tendencia + Selector 7D / 30D */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.55rem',
        flexWrap: 'wrap',
        gap: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {renderTrendIndicator()}
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            ({days}D)
          </span>
        </div>

        {showControls && (
          <div style={{
            display: 'inline-flex',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={() => setDays(7)}
              style={{
                background: days === 7 ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: days === 7 ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.68rem',
                fontWeight: days === 7 ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              style={{
                background: days === 30 ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: days === 30 ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.68rem',
                fontWeight: days === 30 ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              30D
            </button>
          </div>
        )}
      </div>

      {/* Contenedor del Mini-Gráfico Sparkline */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s ease'
      }}>
        {historyData.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}>
            Cargando tendencia...
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniTrendChart;
