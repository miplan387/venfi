import React, { useState } from 'react';
import { X, KeyRound, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login', onSuccess, onOpenForgotPassword }) => {
  const [tab, setTab] = useState(defaultTab); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (tab === 'login') {
      if (!email || !password) {
        setError('Por favor ingresa tu correo y contraseña');
        setIsSubmitting(false);
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg(`¡Bienvenido de nuevo, ${res.user.username || 'Usuario'}!`);
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
          if (onSuccess) onSuccess(res.user);
        }, 800);
      } else {
        setError(res.message || 'Credenciales incorrectas');
        setIsSubmitting(false);
      }
    } else {
      if (!username || !email || !password) {
        setError('Por favor completa todos los campos para registrarte');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setIsSubmitting(false);
        return;
      }
      if (!acceptTerms) {
        setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad');
        setIsSubmitting(false);
        return;
      }
      const res = await register(username, email, password);
      if (res.success) {
        setSuccessMsg('¡Cuenta creada exitosamente!');
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
          if (onSuccess) onSuccess(res.user);
        }, 800);
      } else {
        setError(res.message || 'Error al crear la cuenta');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem',
        borderRadius: '24px',
        border: '1.5px solid var(--border-medium)',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.98) 100%)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 245, 155, 0.15)',
        position: 'relative'
      }}>
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <KeyRound size={20} color="var(--color-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Acceso a la Plataforma
          </span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
          {tab === 'login' ? 'Iniciar Sesión en Venfi' : 'Crear Cuenta de Usuario'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {tab === 'login'
            ? 'Accede a tu panel de métricas, historial de pautas y saldo comercial.'
            : 'Únete para promocionar tu marca o gestionar tus compras en el portal.'}
        </p>

        {/* Pestañas Login / Registro */}
        <div style={{
          display: 'flex',
          background: 'rgba(6, 10, 18, 0.75)',
          padding: '0.3rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          gap: '0.3rem'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              background: tab === 'login' ? 'var(--color-primary)' : 'transparent',
              color: tab === 'login' ? '#030712' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              background: tab === 'register' ? 'var(--color-primary)' : 'transparent',
              color: tab === 'register' ? '#030712' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Alertas de Error / Éxito */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(0, 245, 155, 0.12)',
            border: '1px solid rgba(0, 245, 155, 0.35)',
            color: 'var(--color-primary)',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'register' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Nombre de Usuario o Negocio:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                <input
                  type="text"
                  placeholder="Ej: Inversiones Ávila"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={tab === 'register'}
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Correo Electrónico:
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(6, 10, 18, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Contraseña:
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(6, 10, 18, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            {tab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenForgotPassword) onOpenForgotPassword();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-gold)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.15rem 0'
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </div>

          {tab === 'register' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{
                  marginTop: '0.2rem',
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
                required
              />
              <label htmlFor="acceptTerms" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', cursor: 'pointer' }}>
                Acepto los <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Términos y Condiciones</a> y la{' '}
                <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Política de Privacidad</a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (tab === 'register' && !acceptTerms)}
            className="btn btn-primary"
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (isSubmitting || (tab === 'register' && !acceptTerms)) ? 0.6 : 1,
              cursor: (isSubmitting || (tab === 'register' && !acceptTerms)) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>{tab === 'login' ? 'Acceder al Portal' : 'Crear mi Cuenta'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer de seguridad */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: '1.5rem',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={14} color="var(--color-primary)" />
          <span>Autenticación cifrada JWT con protección SSL/TLS</span>
        </div>
      </div>
    </div>
  );
};
