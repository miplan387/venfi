import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Flame, 
  ExternalLink, 
  MousePointerClick, 
  Eye, 
  Clock, 
  ShieldCheck, 
  Award,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';
import { RankBadge } from './RankBadge';

// Función auxiliar para obtener el anunciante del puesto #1 (Oro)
export const getSlot1 = (slots) => slots?.find(s => s.position === 1);

export const TopRanking = ({ slots, onOpenAdvertise, onTrackClick }) => {
  // Temporizador de cuenta regresiva (simulación de ciclo de 24 horas)
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const slot1 = slots.find(s => s.position === 1);
  const slot2 = slots.find(s => s.position === 2);
  const slot3 = slots.find(s => s.position === 3);
  const slotsDark = slots.filter(s => s.position >= 4 && s.position <= 10);

  const formatTime = (num) => num.toString().padStart(2, '0');

  // Configuración de estilo por puesto del podio Top 3
  const getPodiumStyle = (pos) => {
    if (pos === 2) {
      return {
        border: '3px solid #C0C0C0',
        boxShadow: '0 0 15px rgba(192, 192, 192, 0.35), 0 8px 25px rgba(0, 0, 0, 0.6)',
        background: 'linear-gradient(145deg, rgba(22, 28, 40, 0.95) 0%, rgba(35, 45, 60, 0.75) 100%)',
        avatarBg: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
        avatarBorder: '2px solid #C0C0C0',
        badgeClass: 'badge-silver',
        buttonClass: 'btn-secondary',
        glowText: '#cbd5e1'
      };
    }
    if (pos === 3) {
      return {
        border: '3px solid #CD7F32',
        boxShadow: '0 0 15px rgba(205, 127, 50, 0.35), 0 8px 25px rgba(0, 0, 0, 0.6)',
        background: 'linear-gradient(145deg, rgba(26, 20, 22, 0.95) 0%, rgba(45, 30, 25, 0.75) 100%)',
        avatarBg: 'linear-gradient(135deg, #e09858 0%, #8d4918 100%)',
        avatarBorder: '2px solid #CD7F32',
        badgeClass: 'badge-bronze',
        buttonClass: 'btn-secondary',
        glowText: '#fbd38d'
      };
    }
    return {};
  };

  return (
    <section id="ranking-section" style={{ padding: '3.5rem 0 4.5rem 0', position: 'relative' }}>
      <span id="ranking" style={{ position: 'absolute', top: '-20px' }}></span>
      <div className="container">
        {/* HEADER DEL RANKING */}
        <div style={{
          textAlign: 'center',
          maxWidth: '750px',
          margin: '0 auto 2.5rem auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.75rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.35)'
          }}>
            <Crown size={16} color="var(--color-gold)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-gold)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Muro de la Fama Comercial • Venezuela
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #ffffff 40%, #fbbf24 80%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem'
          }}>
            Ranking Top 10 de Marcas y Emprendedores
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            El escaparate publicitario digital más codiciado de Venezuela. Las marcas líderes compiten diariamente por la máxima visibilidad frente a miles de compradores.
          </p>

          {/* TEMPORIZADOR DE CUENTA REGRESIVA */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-gold)',
            padding: '0.65rem 1.4rem',
            borderRadius: '14px',
            marginTop: '1.5rem',
            boxShadow: '0 4px 25px rgba(251, 191, 36, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="var(--color-gold)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Próximo reinicio de slots:
              </span>
            </div>
            <div className="font-mono" style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--color-gold)',
              letterSpacing: '1px'
            }}>
              {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m : {formatTime(timeLeft.seconds)}s
            </div>
          </div>
        </div>

        {/* =========================================================================
            PUESTO #1: TARJETA DORADA GIGANTE VIP (ORO)
           ========================================================================= */}
        {slot1 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div
              className="glass-panel animate-gold-pulse"
              style={{
                padding: '2.5rem',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(20, 24, 40, 0.95) 0%, rgba(35, 27, 10, 0.9) 50%, rgba(15, 23, 42, 0.98) 100%)',
                border: '3px solid #FFD700',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 8px 30px rgba(0, 0, 0, 0.8)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Sello Oficial de Estatus #1 Oro */}
              <RankBadge position={1} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                alignItems: 'center'
              }}>
                {/* Columna Izquierda: Identidad de Marca */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                      border: '3px solid #ffffff'
                    }}>
                      {slot1.avatar || '👑'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                          {slot1.businessName}
                        </h3>
                        {slot1.verified && (
                          <ShieldCheck size={22} color="var(--color-primary)" title="Anunciante Verificado" />
                        )}
                      </div>
                      <span className="badge badge-gold" style={{ marginTop: '0.25rem' }}>
                        {slot1.category}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                    fontWeight: 400
                  }}>
                    "{slot1.slogan}"
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {slot1.tags?.map((tag, i) => (
                      <span key={i} style={{
                        background: 'rgba(255, 215, 0, 0.12)',
                        border: '1px solid rgba(255, 215, 0, 0.35)',
                        color: '#FFF275',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Botones de Acción */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a
                      href={slot1.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrackClick(slot1.position)}
                      className="btn btn-primary"
                      style={{ fontSize: '1rem', padding: '0.8rem 1.6rem' }}
                    >
                      <span>Visitar Sitio Oficial</span>
                      <ExternalLink size={18} />
                    </a>

                    <button
                      onClick={onOpenAdvertise}
                      className="btn btn-gold"
                      style={{ fontSize: '0.95rem', padding: '0.8rem 1.4rem' }}
                    >
                      <Flame size={18} />
                      <span>Desbancar #1 por $15</span>
                    </button>
                  </div>
                </div>

                {/* Columna Derecha: Métricas y Tráfico en Vivo */}
                <div style={{
                  background: 'rgba(6, 10, 18, 0.75)',
                  padding: '1.75rem',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 215, 0, 0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Rendimiento de Visibilidad
                    </span>
                    <span className="badge badge-emerald">
                      <span className="live-indicator"></span> TRÁFICO ACTIVO
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <MousePointerClick size={15} color="var(--color-primary)" /> Clics Recibidos:
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                        {slot1.clicks.toLocaleString()}
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <Eye size={15} color="#FFD700" /> Impresiones:
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFD700', marginTop: '0.25rem' }}>
                        {slot1.impressions.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <span>Expira en: ~{slot1.expiresInHours} horas</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Inversión: $15.00 USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PUESTOS #2 (PLATA) Y #3 (BRONCE): TARJETAS DIFERENCIADAS CON SELLOS
           ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {[slot2, slot3].filter(Boolean).map((slot) => {
            const style = getPodiumStyle(slot.position);
            return (
              <div
                key={slot.position}
                className="glass-panel"
                style={{
                  padding: '1.75rem',
                  border: style.border,
                  boxShadow: style.boxShadow,
                  background: style.background,
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Sello Oficial de Estatus (#2 Plata o #3 Bronce) */}
                <RankBadge position={slot.position} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: style.avatarBg,
                      border: style.avatarBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.7rem',
                      color: '#070b14',
                      fontWeight: 900
                    }}>
                      {slot.avatar || (slot.position === 2 ? '🥈' : '🥉')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                          {slot.businessName}
                        </h4>
                        {slot.verified && <ShieldCheck size={17} color="var(--color-primary)" />}
                      </div>
                      <span className="badge" style={{
                        fontSize: '0.68rem',
                        marginTop: '0.2rem',
                        background: slot.position === 2 ? 'rgba(192, 192, 192, 0.15)' : 'rgba(205, 127, 50, 0.15)',
                        color: style.glowText,
                        border: `1px solid ${slot.position === 2 ? 'rgba(192, 192, 192, 0.35)' : 'rgba(205, 127, 50, 0.35)'}`
                      }}>
                        {slot.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', minHeight: '42px' }}>
                  "{slot.slogan}"
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#ffffff' }}>{slot.clicks.toLocaleString()}</span> clics recibidos
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={slot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrackClick(slot.position)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                    >
                      <span>Visitar</span>
                      <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={onOpenAdvertise}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                    >
                      <span>Pautar $10</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            PUESTOS #4 AL #10: TARJETAS COMPACTAS OSCURAS
           ========================================================================= */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--color-primary)" /> Puestos del #4 al #10
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Tarifa estándar: $5.00 / día
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {slotsDark.map((slot) => {
              const isAvailable = slot.amountPaid === 0;
              return (
                <div
                  key={slot.position}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.85rem 1.25rem',
                    background: isAvailable ? 'rgba(0, 245, 155, 0.04)' : 'rgba(6, 10, 18, 0.6)',
                    border: isAvailable ? '1px dashed var(--border-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Número y Nombre */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span className="font-mono" style={{
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: isAvailable ? 'var(--color-primary)' : 'var(--text-muted)',
                      width: '32px'
                    }}>
                      #{slot.position}
                    </span>
                    <div>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: isAvailable ? 'var(--color-primary)' : '#ffffff' }}>
                        {slot.businessName}
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {slot.category}
                      </span>
                    </div>
                  </div>

                  {/* Slogan */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {slot.slogan}
                  </div>

                  {/* Clics y Acción */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.85rem' }}>
                    {!isAvailable && (
                      <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {slot.clicks} clics
                      </span>
                    )}

                    {isAvailable ? (
                      <button
                        onClick={onOpenAdvertise}
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                      >
                        <Zap size={13} /> ¡Ocupar por $5!
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <a
                          href={slot.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onTrackClick(slot.position)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={onOpenAdvertise}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                          title="Superar posición"
                        >
                          Subir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
