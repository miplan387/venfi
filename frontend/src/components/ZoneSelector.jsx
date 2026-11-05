import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Building2 } from 'lucide-react';
import { apiUrl } from '../config/api';

const defaultZones = [
  { key: 'nacional', name: 'Nacional', icon: '🇻🇪', type: 'national' },
  { key: 'caracas', name: 'Caracas', icon: '🏙️', type: 'city' },
  { key: 'maracaibo', name: 'Maracaibo', icon: '🌉', type: 'city' },
  { key: 'valencia', name: 'Valencia', icon: '🌆', type: 'city' }
];

export const ZoneSelector = ({ selectedZone = 'nacional', onZoneChange }) => {
  const [zones, setZones] = useState(defaultZones);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl('/api/zones'));
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setZones(json.data);
          }
        }
      } catch (err) {
        console.warn('Usando zonas locales de respaldo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      margin: '0 auto 1.75rem auto',
      padding: '0.4rem',
      background: 'rgba(15, 23, 42, 0.75)',
      borderRadius: '9999px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      maxWidth: 'fit-content',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--color-gold)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <MapPin size={14} />
        <span>Zona:</span>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {zones.map((zone) => {
          const isSelected = (selectedZone || 'nacional').toLowerCase() === zone.key.toLowerCase();

          return (
            <button
              key={zone.key}
              type="button"
              onClick={() => onZoneChange && onZoneChange(zone.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                border: isSelected
                  ? '1.5px solid var(--color-gold)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(217, 119, 6, 0.2) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isSelected
                  ? '0 0 15px rgba(251, 191, 36, 0.35), inset 0 0 10px rgba(251, 191, 36, 0.1)'
                  : 'none',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{zone.icon || '📍'}</span>
              <span>{zone.name}</span>
              {zone.type === 'national' ? (
                <span style={{
                  fontSize: '0.62rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '6px',
                  background: isSelected ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#030712' : 'var(--text-muted)',
                  fontWeight: 800,
                  marginLeft: '0.2rem'
                }}>
                  TOP 10
                </span>
              ) : (
                <span style={{
                  fontSize: '0.62rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(0, 245, 155, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: 800,
                  marginLeft: '0.2rem'
                }}>
                  TOP 3
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

