import React, { useState, useEffect } from 'react';
import { Users, Eye, Activity } from 'lucide-react';

export const VisitCounter = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    activeUsers: 1,
    isLoading: true
  });

  useEffect(() => {
    // Generar o recuperar ID de visitante único en localStorage
    let visitorId = localStorage.getItem('venfi_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('venfi_visitor_id', visitorId);
    }

    const hasTrackedSession = sessionStorage.getItem('venfi_session_tracked');

    const syncVisits = async () => {
      try {
        const apiUrl = window.location.port ? '/api/visits' : 'http://localhost:5000/api/visits';

        if (!hasTrackedSession) {
          // Registrar visita única por sesión
          const res = await fetch(`${apiUrl}/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-visitor-id': visitorId
            },
            body: JSON.stringify({ visitorId })
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setStats({
                totalVisits: json.data.totalVisits,
                activeUsers: json.data.activeUsers,
                isLoading: false
              });
              sessionStorage.setItem('venfi_session_tracked', 'true');
              return;
            }
          }
        }

        // Consultar estadísticas normales
        const res = await fetch(apiUrl, {
          headers: {
            'x-visitor-id': visitorId
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStats({
              totalVisits: json.data.totalVisits,
              activeUsers: json.data.activeUsers,
              isLoading: false
            });
          }
        }
      } catch (err) {
        console.warn('Usando estadísticas de visitas locales:', err);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    syncVisits();

    // Actualización periódica en tiempo real cada 15 segundos
    const interval = setInterval(syncVisits, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .visit-counter-container {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          user-select: none;
          transition: all 0.25s ease;
        }
        .visit-counter-container:hover {
          border-color: rgba(0, 245, 155, 0.3);
          background: rgba(22, 32, 54, 0.8);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.45);
        }
        .visit-badge-online {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
        }
        .visit-badge-total {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
        }
        .visit-text-label {
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
        }
        .visit-number-online {
          color: var(--color-primary);
          font-weight: 800;
          font-family: var(--font-mono);
          letter-spacing: 0.3px;
        }
        .visit-number-total {
          color: #ffffff;
          font-weight: 800;
          font-family: var(--font-mono);
          letter-spacing: 0.3px;
        }
        @media (max-width: 900px) {
          .visit-text-label {
            display: none;
          }
          .visit-counter-container {
            gap: 0.6rem;
            padding: 0.3rem 0.65rem;
          }
        }
        @media (max-width: 600px) {
          .visit-badge-total {
            display: none;
          }
          .visit-divider {
            display: none;
          }
        }
      `}</style>
      <div
        className="visit-counter-container"
        title="Estadísticas de tráfico en vivo (actualizado cada 15s)"
      >
        {/* 1. Visitas Actuales (Usuarios en línea en los últimos 5 min) */}
        <div className="visit-badge-online">
          <span
            className="live-indicator"
            style={{ width: '7px', height: '7px', marginRight: '0.1rem' }}
          ></span>
          <Users size={14} color="var(--color-primary)" />
          <span className="visit-text-label">En línea:</span>
          <span className="visit-number-online">
            {stats.isLoading ? '--' : stats.activeUsers}
          </span>
        </div>

        {/* Separador sutil */}
        <div
          className="visit-divider"
          style={{
            width: '1px',
            height: '14px',
            background: 'rgba(255, 255, 255, 0.12)'
          }}
        ></div>

        {/* 2. Visitas Acumuladas (Total histórico) */}
        <div className="visit-badge-total">
          <Eye size={14} color="var(--color-gold)" />
          <span className="visit-text-label">Visitas:</span>
          <span className="visit-number-total">
            {stats.isLoading ? '...' : Number(stats.totalVisits).toLocaleString()}
          </span>
        </div>
      </div>
    </>
  );
};

export default VisitCounter;
