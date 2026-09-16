import React, { useState } from 'react';
import { X, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';

export const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 260,
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
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(251, 191, 36, 0.15)',
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
          <KeyRound size={20} color="var(--color-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recuperación de Acceso
          </span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
          ¿Olvidaste tu contraseña?
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace seguro para restablecerla.
        </p>

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

        {success ? (
          <div style={{
            background: 'rgba(0, 245, 155, 0.1)',
            border: '1px solid rgba(0, 245, 155, 0.3)',
            borderRadius: '14px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={40} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
              ¡Correo Enviado!
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Hemos enviado las instrucciones a <strong>{email}</strong>. Revisa tu bandeja de entrada o spam.
            </p>

            {resetUrl && (
              <div style={{
                background: 'rgba(6, 10, 18, 0.8)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px dashed var(--border-primary)',
                marginBottom: '1.25rem',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Acceso Rápido Local (Simulación):
                </span>
                <a
                  href={resetUrl}
                  style={{ color: '#38bdf8', wordBreak: 'break-all', textDecoration: 'underline' }}
                >
                  Abrir formulario de nueva contraseña →
                </a>
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                if (onBackToLogin) onBackToLogin();
              }}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Correo Electrónico Registrado:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                <input
                  type="email"
                  placeholder="tu-correo@ejemplo.com"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-gold"
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Enviando enlace...</span>
                </>
              ) : (
                <>
                  <span>Enviar Enlace de Recuperación</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onBackToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ArrowLeft size={14} /> Volver al Inicio de Sesión
              </button>
            </div>
          </form>
        )}

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
          <span>Proceso protegido con tokens de un solo uso</span>
        </div>
      </div>
    </div>
  );
};
