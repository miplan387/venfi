import React, { useState, useEffect } from 'react';
import { Bell, Zap, X, ShieldCheck } from 'lucide-react';
import { fomoNotifications } from '../data/mockData';

export const FomoNotification = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [closedManually, setClosedManually] = useState(false);

  useEffect(() => {
    if (closedManually) return;

    const interval = setInterval(() => {
      // Ocultar suavemente
      setVisible(false);

      // Cambiar índice y volver a mostrar
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % fomoNotifications.length);
        setVisible(true);
      }, 500);
    }, 9000);

    return () => clearInterval(interval);
  }, [closedManually]);

  if (closedManually) return null;

  const current = fomoNotifications[currentIndex];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 80,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(15px)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: visible ? 'auto' : 'none'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-gold)',
        borderRadius: '14px',
        padding: '0.75rem 1rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '340px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(251, 191, 36, 0.15)',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Zap size={18} color="var(--color-gold)" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>
              {current.user}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {current.action}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 700 }}>
              {current.target}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {current.time}
            </span>
          </div>
        </div>

        <button
          onClick={() => setClosedManually(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
