import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Sparkles, Flame, X } from 'lucide-react';

export const Notifications = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/notifications');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setNotifications(json.data);
          }
        }
      } catch (err) {
        console.warn('Error al cargar notificaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CheckCircle2 size={18} color="var(--color-primary)" />;
      case 'ranking':
        return <Sparkles size={18} color="var(--color-gold)" />;
      case 'alert':
        return <AlertTriangle size={18} color="var(--color-coral)" />;
      default:
        return <Flame size={18} color="var(--color-gold)" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 250,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        animation: 'slideLeft 0.25s ease'
      }}>
        {/* Encabezado */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={20} color="var(--color-gold)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Buzón de Notificaciones
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Acciones */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {notifications.filter(n => !n.is_read).length} no leídas
          </span>
          <button
            onClick={markAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Marcar todas como leídas
          </button>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando notificaciones...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No tienes notificaciones pendientes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n, i) => (
                <div
                  key={n.id || i}
                  style={{
                    background: n.is_read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.95)',
                    border: n.is_read ? '1px solid var(--border-subtle)' : '1.5px solid var(--border-gold)',
                    borderRadius: '12px',
                    padding: '0.95rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', color: n.is_read ? 'var(--text-secondary)' : '#ffffff', margin: '0 0 0.35rem 0', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {n.created_at ? new Date(n.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
