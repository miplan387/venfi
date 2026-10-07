import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  ShieldCheck, 
  Coins, 
  RefreshCw, 
  Activity, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const RateTrendModal = ({ isOpen, onClose, rateKey = 'bcv', item = {} }) => {
  const [days, setDays] = useState(7);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuración de colores por divisa
  const rateConfig = {
    bcv: {
      name: 'Dólar BCV Oficial',
      label: 'OFICIAL BANCO CENTRAL DE VENEZUELA',
      color: '#00f59b',
      glowColor: 'rgba(0, 245, 155, 0.25)',
      suffix: '/ USD'
    },
    euro: {
      name: 'Euro (€) BCV Oficial',
      label: 'OFICIAL UNIÓN EUROPEA BCV',
      color: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      suffix: '/ EUR'
    },
    euroBcv: {
      name: 'Euro (€) BCV Oficial',
      label: 'OFICIAL UNIÓN EUROPEA BCV',
      color: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      suffix: '/ EUR'
    },
    usdt: {
      name: 'Binance USDT (P2P)',
      label: 'MERCADO CRIPTO EN TIEMPO REAL',
      color: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.25)',
      suffix: '/ USDT'
    },
    usdtBinance: {
      name: 'Binance USDT (P2P)',
      label: 'MERCADO CRIPTO EN TIEMPO REAL',
      color: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.25)',
      suffix: '/ USDT'
    }
  };

  const currentConfig = rateConfig[rateKey] || rateConfig.bcv;

  // Consultar historial de la API
  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const queryType = rateKey === 'euroBcv' ? 'euro' : (rateKey === 'usdtBinance' ? 'usdt' : rateKey);
        const res = await fetch(`http://localhost:5000/api/rates/history/${queryType}?days=${days}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setHistoryData(json.data);
          }
        }
      } catch (err) {
        console.error('Error al cargar historial de tasa:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, rateKey, days]);

  if (!isOpen) return null;

  // Cálculos estadísticos sobre la serie histórica
  const ratesList = historyData.map(d => d.rate).filter(r => typeof r === 'number' && !isNaN(r));
  const minRate = ratesList.length > 0 ? Math.min(...ratesList) : (item.rate || 0);
  const maxRate = ratesList.length > 0 ? Math.max(...ratesList) : (item.rate || 0);
  const avgRate = ratesList.length > 0 ? (ratesList.reduce((a, b) => a + b, 0) / ratesList.length) : (item.rate || 0);
  
  const firstRate = ratesList.length > 0 ? ratesList[0] : (item.rate || 0);
  const lastRate = ratesList.length > 0 ? ratesList[ratesList.length - 1] : (item.rate || 0);
  const periodDiff = Number((lastRate - firstRate).toFixed(2));
  const periodDiffPct = firstRate > 0 ? Number((((lastRate - firstRate) / firstRate) * 100).toFixed(2)) : 0;

  // Configuración de Chart.js
  const chartData = {
    labels: historyData.map(d => d.formattedDate || d.date?.slice(5, 10)),
    datasets: [
      {
        label: `${currentConfig.name} (Bs.)`,
        data: historyData.map(d => d.rate),
        borderColor: currentConfig.color,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, currentConfig.glowColor);
          gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: currentConfig.color,
        pointBorderColor: '#030712',
        pointBorderWidth: 2,
        pointRadius: days === 7 ? 4 : (days === 30 ? 3 : 2),
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(3, 7, 18, 0.95)',
        titleColor: '#ffffff',
        bodyColor: currentConfig.color,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Bs. ${Number(context.parsed.y).toFixed(2)} ${currentConfig.suffix}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: days === 7 ? 7 : (days === 30 ? 6 : 8)
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value) => `Bs. ${Number(value).toFixed(1)}`
        }
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        border: `1.5px solid ${currentConfig.color}40`,
        boxShadow: `0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px ${currentConfig.glowColor}`,
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.98) 100%)'
      }}>
        {/* HEADER DEL MODAL */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <Activity size={16} color={currentConfig.color} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: currentConfig.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {currentConfig.label}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Tendencia Histórica: {item.name || currentConfig.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }} className="font-mono">
                Bs. {typeof item.rate === 'number' ? item.rate.toFixed(2) : parseFloat(item.rate || 0).toFixed(2)}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentConfig.suffix}</span>
              <span style={{
                background: periodDiff >= 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 245, 155, 0.15)',
                color: periodDiff >= 0 ? '#ef4444' : 'var(--color-primary)',
                border: `1px solid ${periodDiff >= 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 245, 155, 0.3)'}`,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginLeft: '0.5rem'
              }}>
                {periodDiff >= 0 ? `+${periodDiffPct}% (+Bs. ${periodDiff})` : `${periodDiffPct}% (-Bs. ${Math.abs(periodDiff)})`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SELECTOR DE PERÍODO (7D, 30D, 90D) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Calendar size={15} color="var(--text-muted)" />
            <span>Período de Análisis:</span>
          </div>

          <div style={{
            display: 'flex',
            background: 'rgba(6, 10, 18, 0.8)',
            padding: '0.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            gap: '0.25rem'
          }}>
            {[
              { label: 'Últimos 7 Días', value: 7 },
              { label: '30 Días', value: 30 },
              { label: '90 Días (3 Meses)', value: 90 }
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                style={{
                  background: days === p.value ? currentConfig.color : 'transparent',
                  color: days === p.value ? '#030712' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPIs RESUMEN DEL PERÍODO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {/* Mínimo */}
          <div style={{
            background: 'rgba(6, 10, 18, 0.7)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Mínimo del Período
            </span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
              Bs. {minRate.toFixed(2)}
            </div>
          </div>

          {/* Máximo */}
          <div style={{
            background: 'rgba(6, 10, 18, 0.7)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Máximo del Período
            </span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>
              Bs. {maxRate.toFixed(2)}
            </div>
          </div>

          {/* Promedio */}
          <div style={{
            background: 'rgba(6, 10, 18, 0.7)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Promedio Móvil
            </span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
              Bs. {avgRate.toFixed(2)}
            </div>
          </div>

          {/* Variación */}
          <div style={{
            background: 'rgba(6, 10, 18, 0.7)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Variación Total
            </span>
            <div className="font-mono" style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: periodDiff >= 0 ? '#ef4444' : 'var(--color-primary)',
              marginTop: '0.2rem'
            }}>
              {periodDiff >= 0 ? `+${periodDiffPct}%` : `${periodDiffPct}%`}
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE LA GRÁFICA */}
        <div style={{
          background: 'rgba(6, 10, 18, 0.85)',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          height: '280px',
          position: 'relative'
        }}>
          {loading ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <RefreshCw size={24} className="animate-spin" color={currentConfig.color} />
              <span style={{ fontSize: '0.85rem' }}>Cargando datos históricos de cotización...</span>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>

        {/* FOOTER DEL MODAL */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <span>Fuente: {item.source || 'Banco Central de Venezuela y Mercados Financieros'}</span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
