import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

export const FloatingCta = ({ onOpenAdvertise }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 90
    }}>
      <button
        onClick={onOpenAdvertise}
        className="btn btn-gold animate-gold-pulse"
        style={{
          padding: '0.85rem 1.6rem',
          fontSize: '1rem',
          fontWeight: 900,
          borderRadius: '9999px',
          boxShadow: '0 8px 35px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          letterSpacing: '0.5px'
        }}
      >
        <Flame size={22} className="animate-bounce" />
        <span>¡OCUPA EL #1 POR $15!</span>
        <Sparkles size={18} />
      </button>
    </div>
  );
};
