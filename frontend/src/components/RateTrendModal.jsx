import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  RefreshCw, 
  Activity, 
  Layers
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
  const [mixRates, setMixRates] = useState(false); // Checkbox Mezclar Tasas
  const [historyData, setHistoryData] = useState([]);
  const [mixedHistory, setMixedHistory] = useState({ bcv: [], euro: [], usdt: [] });
  const [loading, setLoading] = useState(true);

  // Escuchar eventos globales de cierre (menú NavTabs, cambio de hash, tecla Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleCloseModal = () => {
      onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('close-trend-modal', handleCloseModal);
    window.addEventListener('hashchange', handleCloseModal);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('close-trend-modal', handleCloseModal);
      window.removeEventListener('hashchange', handleCloseModal);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Configuración de colores por divisa individual
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
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      suffix: '/ EUR'
    },
    euroBcv: {
      name: 'Euro (€) BCV Oficial',
      label: 'OFICIAL UNIÓN EUROPEA BCV',
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      suffix: '/ EUR'
    },
    usdt: {
      name: 'Binance USDT (P2P)',
      label: 'MERCADO CRIPTO EN TIEMPO REAL',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.25)',
      suffix: '/ USDT'
    },
    usdtBinance: {
      name: 'Binance USDT (P2P)',
      label: 'MERCADO CRIPTO EN TIEMPO REAL',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.25)',
      suffix: '/ USDT'
    }
  };

  const currentConfig = rateConfig[rateKey] || rateConfig.bcv;

  // Consultar historial de la API (individual o simultáneo)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);

        if (mixRates) {
          // Consultar las 3 tasas (BCV, Euro y USDT) en paralelo
          const [bcvRes, euroRes, usdtRes] = await Promise.all([
            fetch(apiUrl(`/api/rates/history/bcv?days=${days}`)),
            fetch(apiUrl(`/api/rates/history/euro?days=${days}`)),
            fetch(apiUrl(`/api/rates/history/usdt?days=${days}`))
          ]);

          const [bcvJson, euroJson, usdtJson] = await Promise.all([
            bcvRes.ok ? bcvRes.json() : { success: false, data: [] },
            euroRes.ok ? euroRes.json() : { success: false, data: [] },
            usdtRes.ok ? usdtRes.json() : { success: false, data: [] }
          ]);

          if (isMounted) {
            setMixedHistory({
              bcv: (bcvJson.success && Array.isArray(bcvJson.data)) ? bcvJson.data : [],
              euro: (euroJson.success && Array.isArray(euroJson.data)) ? euroJson.data : [],
              usdt: (usdtJson.success && Array.isArray(usdtJson.data)) ? usdtJson.data : []
            });
          }
        } else {
          // Consultar solo la tasa seleccionada
          const queryType = rateKey === 'euroBcv' ? 'euro' : (rateKey === 'usdtBinance' ? 'usdt' : rateKey);
          const res = await fetch(apiUrl(`/api/rates/history/${queryType}?days=${days}`));
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && isMounted) {
              setHistoryData(json.data);
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar historial de tasa:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [isOpen, rateKey, days, mixRates]);

  if (!isOpen) return null;

  // ================= CÁLCULOS ESTADÍSTICOS =================
  // Modo Individual
  const ratesList = historyData.map(d => d.rate).filter(r => typeof r === 'number' && !isNaN(r));
  const minRate = ratesList.length > 0 ? Math.min(...ratesList) : (item.rate || 0);
  const maxRate = ratesList.length > 0 ? Math.max(...ratesList) : (item.rate || 0);
  const avgRate = ratesList.length > 0 ? (ratesList.reduce((a, b) => a + b, 0) / ratesList.length) : (item.rate || 0);
  
  const firstRate = ratesList.length > 0 ? ratesList[0] : (item.rate || 0);
  const lastRate = ratesList.length > 0 ? ratesList[ratesList.length - 1] : (item.rate || 0);
  const periodDiff = Number((lastRate - firstRate).toFixed(2));
  const periodDiffPct = firstRate > 0 ? Number((((lastRate - firstRate) / firstRate) * 100).toFixed(2)) : 0;

  // Modo Mezclado: Últimos valores de cada tasa
  const latestBcv = mixedHistory.bcv.length > 0 ? mixedHistory.bcv[mixedHistory.bcv.length - 1]?.rate : 0;
  const latestEuro = mixedHistory.euro.length > 0 ? mixedHistory.euro[mixedHistory.euro.length - 1]?.rate : 0;
  const latestUsdt = mixedHistory.usdt.length > 0 ? mixedHistory.usdt[mixedHistory.usdt.length - 1]?.rate : 0;
  const spreadUsdtBcv = (latestBcv > 0 && latestUsdt > 0) ? Number((((latestUsdt - latestBcv) / latestBcv) * 100).toFixed(2)) : 0;

  // ================= CONFIGURACIÓN DE CHART.JS =================
  let chartData;

  if (mixRates) {
    const baseSource = (mixedHistory.bcv.length >= mixedHistory.usdt.length && mixedHistory.bcv.length >= mixedHistory.euro.length)
      ? mixedHistory.bcv
      : (mixedHistory.usdt.length >= mixedHistory.euro.length ? mixedHistory.usdt : mixedHistory.euro);

    const labels = baseSource.map(d => d.formattedDate || d.date?.slice(5, 10));

    chartData = {
      labels,
      datasets: [
        {
          label: 'Dólar BCV Oficial',
          data: mixedHistory.bcv.map(d => d.rate),
          borderColor: '#00f59b', // Verde BCV
          backgroundColor: 'rgba(0, 245, 155, 0.08)',
          borderWidth: 2.5,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#00f59b',
          pointBorderColor: '#030712',
          pointBorderWidth: 1.5,
          pointRadius: days === 7 ? 4 : (days === 30 ? 3 : 2),
          pointHoverRadius: 6
        },
        {
          label: 'Euro (€) BCV',
          data: mixedHistory.euro.map(d => d.rate),
          borderColor: '#3b82f6', // Azul Euro
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderWidth: 2.5,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#030712',
          pointBorderWidth: 1.5,
          pointRadius: days === 7 ? 4 : (days === 30 ? 3 : 2),
          pointHoverRadius: 6
        },
        {
          label: 'Binance USDT (P2P)',
          data: mixedHistory.usdt.map(d => d.rate),
          borderColor: '#FFD700', // Dorado USDT
          backgroundColor: 'rgba(255, 215, 0, 0.08)',
          borderWidth: 2.5,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#FFD700',
          pointBorderColor: '#030712',
          pointBorderWidth: 1.5,
          pointRadius: days === 7 ? 4 : (days === 30 ? 3 : 2),
          pointHoverRadius: 6
        }
      ]
    };
  } else {
    chartData = {
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
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: mixRates ? 'index' : 'nearest',
      intersect: false
    },
    plugins: {
      legend: {
        display: mixRates,
        position: 'top',
        align: 'end',
        labels: {
          color: '#e2e8f0',
          font: { size: 12, weight: 700 },
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(3, 7, 18, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
        displayColors: mixRates,
        callbacks: {
          label: (context) => {
            const val = Number(context.parsed.y).toFixed(2);
            if (mixRates) {
              return ` ${context.dataset.label}: Bs. ${val}`;
            }
            return `Bs. ${val} ${currentConfig.suffix}`;
          }
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
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeInTrend 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeInTrend {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Contenedor Interno de la Gráfica (stopPropagation para evitar cierre al hacer clic dentro) */}
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          border: `1.5px solid ${mixRates ? '#FFD70080' : `${currentConfig.color}50`}`,
          boxShadow: `0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px ${mixRates ? 'rgba(255, 215, 0, 0.25)' : currentConfig.glowColor}`,
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.97) 0%, rgba(10, 15, 28, 0.99) 100%)',
          borderRadius: '22px'
        }}
      >
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
              {mixRates ? (
                <>
                  <Layers size={16} color="#FFD700" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    COMPARATIVA MULTI-DIVISA EN VIVO
                  </span>
                </>
              ) : (
                <>
                  <Activity size={16} color={currentConfig.color} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: currentConfig.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {currentConfig.label}
                  </span>
                </>
              )}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              {mixRates ? 'Comparación de Tendencias (BCV vs Euro vs USDT)' : `Tendencia Histórica: ${item.name || currentConfig.name}`}
            </h2>

            {!mixRates ? (
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
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Visualizando 3 curvas simultáneas en el mismo período.
                </span>
                <span style={{
                  background: 'rgba(255, 215, 0, 0.15)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 215, 0, 0.35)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  Brecha USDT/BCV: {spreadUsdtBcv}%
                </span>
              </div>
            )}
          </div>

          {/* BOTÓN SUPERIOR DE CERRAR RESALTADO (AMARILLO DORADO) */}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar ventana (Esc)"
            className="text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 rounded-xl p-2 transition-all duration-200 shadow-lg shadow-yellow-500/20"
            style={{
              background: 'rgba(255, 215, 0, 0.18)',
              border: '1.5px solid rgba(255, 215, 0, 0.65)',
              color: '#FFD700',
              borderRadius: '12px',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(255, 215, 0, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.4)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.7)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.18)';
              e.currentTarget.style.color = '#FFD700';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 215, 0, 0.35)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* SELECTOR DE PERÍODO Y CHECKBOX MEZCLAR TASAS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Lado Izquierdo: Checkbox Mezclar Tasas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Calendar size={15} color="var(--text-muted)" />
              <span>Período:</span>
            </div>

            {/* CHECKBOX "Mezclar Tasas" */}
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              background: mixRates ? 'rgba(255, 215, 0, 0.16)' : 'rgba(255, 255, 255, 0.05)',
              border: mixRates ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={mixRates}
                onChange={(e) => setMixRates(e.target.checked)}
                style={{
                  accentColor: '#FFD700',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: mixRates ? '#FFD700' : '#cbd5e1'
              }}>
                Mezclar Tasas
              </span>
            </label>
          </div>

          {/* Lado Derecho: Botones 7D, 30D, 90D */}
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
              { label: '90 Días', value: 90 }
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                style={{
                  background: days === p.value ? (mixRates ? '#FFD700' : currentConfig.color) : 'transparent',
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

        {/* 4 TARJETAS KPI (Dinámicas según modo normal o mezclado) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {!mixRates ? (
            <>
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
            </>
          ) : (
            <>
              {/* BCV Actual */}
              <div style={{
                background: 'rgba(6, 10, 18, 0.7)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(0, 245, 155, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f59b' }} />
                  <span style={{ fontSize: '0.72rem', color: '#00f59b', fontWeight: 800, textTransform: 'uppercase' }}>
                    Dólar BCV
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  Bs. {latestBcv > 0 ? latestBcv.toFixed(2) : '--'}
                </div>
              </div>

              {/* Euro Actual */}
              <div style={{
                background: 'rgba(6, 10, 18, 0.7)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase' }}>
                    Euro BCV
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  Bs. {latestEuro > 0 ? latestEuro.toFixed(2) : '--'}
                </div>
              </div>

              {/* USDT Actual */}
              <div style={{
                background: 'rgba(6, 10, 18, 0.7)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFD700' }} />
                  <span style={{ fontSize: '0.72rem', color: '#FFD700', fontWeight: 800, textTransform: 'uppercase' }}>
                    Binance USDT
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  Bs. {latestUsdt > 0 ? latestUsdt.toFixed(2) : '--'}
                </div>
              </div>

              {/* Brecha / Spread */}
              <div style={{
                background: 'rgba(6, 10, 18, 0.7)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Diferencial Cripto/Oficial
                </span>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFD700', marginTop: '0.2rem' }}>
                  +{spreadUsdtBcv}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* CONTENEDOR DE LA GRÁFICA */}
        <div style={{
          background: 'rgba(6, 10, 18, 0.85)',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          height: '310px',
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
              <RefreshCw size={24} className="animate-spin" color={mixRates ? '#FFD700' : currentConfig.color} />
              <span style={{ fontSize: '0.85rem' }}>
                {mixRates ? 'Cargando series históricas combinadas...' : 'Cargando datos históricos de cotización...'}
              </span>
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
          <span>
            {mixRates ? 'Fuentes: Banco Central de Venezuela (BCV) y Binance P2P' : `Fuente: ${item.source || 'Banco Central de Venezuela y Mercados Financieros'}`}
          </span>

          {/* BOTÓN INFERIOR DE CERRAR RESALTADO (AMARILLO DORADO) */}
          <button
            type="button"
            onClick={onClose}
            className="text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 font-bold px-5 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(217, 119, 6, 0.3) 100%)',
              border: '1.5px solid rgba(255, 215, 0, 0.6)',
              color: '#FFD700',
              fontWeight: 800,
              fontSize: '0.88rem',
              padding: '0.45rem 1.4rem',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(255, 215, 0, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #f59e0b 100%)';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.65)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.22) 0%, rgba(217, 119, 6, 0.3) 100%)';
              e.currentTarget.style.color = '#FFD700';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 215, 0, 0.25)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span>Cerrar</span>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateTrendModal;
