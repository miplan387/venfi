import React from 'react';
import { Crown, Sparkles, Award } from 'lucide-react';

export const RankBadge = ({ position, variant = 'ribbon' }) => {
  const badges = {
    1: {
      label: '🏆 Nº 1 ORO',
      sublabel: 'LÍDER DEL RANKING',
      icon: Crown,
      bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      textColor: '#070b14',
      borderColor: '#FFF275',
      glow: '0 0 18px rgba(255, 215, 0, 0.65), 0 4px 10px rgba(0, 0, 0, 0.5)'
    },
    2: {
      label: '🥈 Nº 2 PLATA',
      sublabel: 'DESTACADO PLATA',
      icon: Sparkles,
      bg: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 50%, #64748B 100%)',
      textColor: '#070b14',
      borderColor: '#F8FAFC',
      glow: '0 0 15px rgba(192, 192, 192, 0.5), 0 4px 10px rgba(0, 0, 0, 0.5)'
    },
    3: {
      label: '🥉 Nº 3 BRONCE',
      sublabel: 'PODIO BRONCE',
      icon: Award,
      bg: 'linear-gradient(135deg, #E09858 0%, #CD7F32 50%, #8D4918 100%)',
      textColor: '#070b14',
      borderColor: '#FBD38D',
      glow: '0 0 15px rgba(205, 127, 50, 0.5), 0 4px 10px rgba(0, 0, 0, 0.5)'
    }
  };

  const currentBadge = badges[position];
  if (!currentBadge) return null;

  const IconComponent = currentBadge.icon;

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        right: '14px',
        zIndex: 10,
        background: currentBadge.bg,
        color: currentBadge.textColor,
        border: `1.5px solid ${currentBadge.borderColor}`,
        boxShadow: currentBadge.glow,
        padding: '0.35rem 0.85rem',
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.75rem',
        fontWeight: 900,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      <IconComponent size={14} color={currentBadge.textColor} />
      <span>{currentBadge.label}</span>
    </div>
  );
};
