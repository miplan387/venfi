import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CloudSun, 
  Wallet, 
  Flame, 
  Sparkles, 
  Menu, 
  X, 
  ShieldCheck, 
  Bell, 
  KeyRound, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VisitCounter } from './VisitCounter';

export const Header = ({ 
  onOpenWallet, 
  onOpenAdvertise, 
  onToggleDashboard, 
  isDashboardActive, 
  onOpenNotifications,
  onOpenAuth 
}) => {
  const [time, setTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('caracas');
  const [weatherData, setWeatherData] = useState({
    city: 'Caracas',
    temp: 28,
    condition: 'Soleado',
    humidity: 65,
    windSpeed: 12
  });

  const { user, isAuthenticated, logout } = useAuth();

  // Reloj digital en vivo con zona horaria de Caracas (America/Caracas, UTC-4)
  useEffect(() => {
    const updateCaracasTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'America/Caracas',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setTime(new Intl.DateTimeFormat('es-VE', options).format(now));
    };

    updateCaracasTime();
    const interval = setInterval(updateCaracasTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch clima en tiempo real desde el Backend API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/weather?city=${selectedCity}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setWeatherData(json.data);
          }
        }
      } catch (err) {
        console.warn('Usando clima local de respaldo:', err);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000); // 5 min
    return () => clearInterval(weatherInterval);
  }, [selectedCity]);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 10, 18, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* LOGO VENFI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <a href="#" className="venfi-brand-link">
            <div className="venfi-logo-box animated" style={{
              width: '46px',
              height: '46px'
            }}>
              <img
                src="/venfi-icon.png"
                alt="Venfi Logo"
                style={{
                  width: '34px',
                  height: '34px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 245, 155, 0.45))'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '3px',
                right: '3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00f59b',
                boxShadow: '0 0 8px #00f59b',
                border: '1.5px solid #060a12'
              }}></div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="venfi-brand-title" style={{
                  fontSize: '1.55rem',
                  lineHeight: 1.1
                }}>
                  VENFI
                </span>
                <span className="badge badge-emerald" style={{
                  fontSize: '0.62rem',
                  padding: '0.12rem 0.45rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}>
                  PRO
                </span>
              </div>
              <p style={{
                fontSize: '0.66rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                letterSpacing: '0.35px',
                margin: 0,
                whiteSpace: 'nowrap'
              }}>
                Inteligencia Financiera & Publicidad
              </p>
            </div>
          </a>
        </div>

        {/* CONTADOR DE VISITAS EN VIVO */}
        <VisitCounter />

        {/* WIDGETS CENTRALES: RELOJ CARACAS & CLIMA DINÁMICO */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.45rem 1.25rem',
          borderRadius: '9999px',
          border: '1px solid var(--border-subtle)'
        }} className="desktop-widgets">
          {/* Reloj Caracas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Clock size={16} color="var(--color-primary)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Caracas (VET):</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                {time || '--:--:--'}
              </span>
            </div>
            <span className="live-indicator" title="En vivo"></span>
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }}></div>

          {/* Clima Multi-Ciudad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CloudSun size={17} color="#fbbf24" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{weatherData.temp}°C</span>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                padding: '0.15rem 0.35rem',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Cambiar ciudad"
            >
              <option value="caracas" style={{ background: '#0f172a', color: '#ffffff' }}>Caracas</option>
              <option value="maracaibo" style={{ background: '#0f172a', color: '#ffffff' }}>Maracaibo</option>
              <option value="valencia" style={{ background: '#0f172a', color: '#ffffff' }}>Valencia</option>
            </select>
          </div>
        </div>

        {/* NAVEGACIÓN Y ACCIONES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Enlaces Desktop */}
          <nav style={{ display: 'none', gap: '1.25rem', marginRight: '0.5rem' }} className="desktop-nav">
            <a href="#tasas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }}>
              Tasas
            </a>
            <a href="#convertidor" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }}>
              Convertidor
            </a>
            <a href="#remesas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }}>
              Remesas
            </a>
            <a href="#ranking" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={14} /> Top 10
            </a>
          </nav>

          {/* BOTÓN INICIAR SESIÓN / AVATAR DE USUARIO */}
          {!isAuthenticated ? (
            <button
              onClick={onOpenAuth}
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.82rem',
                padding: '0.52rem 0.95rem',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <KeyRound size={15} color="var(--color-primary)" />
              <span>🔑 Iniciar Sesión</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={onToggleDashboard}
                className="btn"
                style={{
                  background: 'rgba(0, 245, 155, 0.12)',
                  border: '1px solid rgba(0, 245, 155, 0.35)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  padding: '0.38rem 0.85rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
                title={`Usuario conectado: ${user?.username || user?.email}`}
              >
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#030712',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900
                }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username || user?.email?.split('@')[0]}
                </span>
              </button>

              <button
                onClick={logout}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.45rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Cerrar sesión"
              >
                <LogOut size={15} color="#ef4444" />
              </button>
            </div>
          )}

          {/* Botón Dashboard */}
          <button
            onClick={onToggleDashboard}
            className="btn btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '0.55rem 0.85rem',
              borderColor: isDashboardActive ? 'var(--color-primary)' : 'var(--border-subtle)',
              color: isDashboardActive ? 'var(--color-primary)' : 'var(--text-secondary)'
            }}
          >
            <TrendingUp size={15} color={isDashboardActive ? 'var(--color-primary)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 700 }}>{isDashboardActive ? 'Portal' : 'Dashboard'}</span>
          </button>

          {/* Botón Notificaciones */}
          <button 
            onClick={onOpenNotifications}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 0.75rem' }}
            title="Buzón de Notificaciones"
          >
            <Bell size={16} color="var(--color-gold)" />
          </button>

          {/* Botón Anunciar */}
          <button 
            onClick={onOpenAdvertise}
            className="btn btn-gold"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
          >
            <Flame size={16} />
            <span>Pautar $15</span>
          </button>

          {/* Botón Billetera */}
          <button 
            onClick={onOpenWallet}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 0.95rem' }}
          >
            <Wallet size={16} color="var(--color-primary)" />
            <span style={{ display: 'none' }} className="wallet-btn-text">Billetera</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary mobile-menu-btn"
            style={{ padding: '0.5rem', display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(6, 10, 18, 0.98)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {!isAuthenticated && (
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <KeyRound size={16} />
              <span>🔑 Iniciar Sesión / Registrarse</span>
            </button>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <a 
              href="#tasas" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}
            >
              Monitor de Tasas (BCV / Paralelo / Euro)
            </a>
            <a 
              href="#convertidor" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}
            >
              Convertidor de Divisas
            </a>
            <a 
              href="#remesas" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}
            >
              Comparador de Remesas
            </a>
            <a 
              href="#ranking" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}
            >
              🏆 Ranking Top 10
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
