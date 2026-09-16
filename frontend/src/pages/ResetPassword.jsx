import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Home
} from 'lucide-react';

export const ResetPassword = ({ onBackToPortal, onOpenLogin }) => {
  const [token, setToken] = useState('');
  const [emailParam, setEmailParam] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extraer token de los query params ?token=... o del hash
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
    if (emailFromUrl) {
      setEmailParam(decodeURIComponent(emailFromUrl));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('El token de restablecimiento no es válido o ha expirado. Por favor solicita un nuevo enlace.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'El enlace de recuperación es inválido o ha expirado.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '1.5px solid var(--border-medium)',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.98) 100%)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 245, 155, 0.15)',
        position: 'relative'
      }}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
            border: '1px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 20px rgba(0, 245, 155, 0.3)'
          }}>
            <KeyRound size={26} color="var(--color-primary)" />
          </div>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.4rem' }}>
            Restablecer Contraseña
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {emailParam ? `Actualizando credenciales para: ${emailParam}` : 'Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{
            background: 'rgba(0, 245, 155, 0.12)',
            border: '1.5px solid var(--color-primary)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              ¡Contraseña Restablecida!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
            </p>

            <button
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                if (onBackToPortal) onBackToPortal();
              }}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.8rem' }}
            >
              <span>🔑 Iniciar Sesión Ahora</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!token && (
              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                color: 'var(--color-gold)',
                padding: '0.75rem',
                borderRadius: '10px',
                fontSize: '0.82rem'
              }}>
                Nota: No se detectó un token en la URL. Puedes pegar el token de recuperación manualmente a continuación si lo recibiste por correo.
                <input
                  type="text"
                  placeholder="Pegar token de recuperación aquí..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    background: 'rgba(6, 10, 18, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Nueva Contraseña:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 2.6rem 0.75rem 2.4rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Confirmar Nueva Contraseña:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 2.6rem 0.75rem 2.4rem',
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
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
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
                  <span>Actualizando Contraseña...</span>
                </>
              ) : (
                <>
                  <span>Guardar Nueva Contraseña</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onBackToPortal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Home size={14} /> Volver a la Página Principal
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
          marginTop: '1.75rem',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={14} color="var(--color-primary)" />
          <span>Cifrado de grado bancario con algoritmo bcrypt</span>
        </div>
      </div>
    </div>
  );
};
