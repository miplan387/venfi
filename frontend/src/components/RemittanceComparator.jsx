import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  DollarSign,
  TrendingUp,
  CreditCard,
  ExternalLink,
  Globe2
} from 'lucide-react';

export const RemittanceComparator = ({ providers: initialProviders }) => {
  const [selectedCountry, setSelectedCountry] = useState('COLOMBIA');
  const [sendAmount, setSendAmount] = useState('200000');
  const [remittanceData, setRemittanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const countryPresets = {
    COLOMBIA: { code: 'COP', name: 'Colombia', symbol: '$', flag: '🇨🇴', defaultAmount: '200000', label: 'Pesos Colombianos (COP)' },
    PERU: { code: 'PEN', name: 'Perú', symbol: 'S/', flag: '🇵🇪', defaultAmount: '200', label: 'Soles Peruanos (PEN)' },
    CHILE: { code: 'CLP', name: 'Chile', symbol: '$', flag: '🇨🇱', defaultAmount: '50000', label: 'Pesos Chilenos (CLP)' },
    BRASIL: { code: 'BRL', name: 'Brasil', symbol: 'R$', flag: '🇧🇷', defaultAmount: '300', label: 'Reales Brasileños (BRL)' },
    ARGENTINA: { code: 'ARS', name: 'Argentina', symbol: '$', flag: '🇦🇷', defaultAmount: '50000', label: 'Pesos Argentinos (ARS)' },
    USA: { code: 'USD', name: 'Estados Unidos', symbol: '$', flag: '🇺🇸', defaultAmount: '100', label: 'Dólares (USD)' },
    ESPANA: { code: 'EUR', name: 'España / Europa', symbol: '€', flag: '🇪🇸', defaultAmount: '100', label: 'Euros (EUR)' }
  };

  const handleCountryChange = (countryKey) => {
    setSelectedCountry(countryKey);
    setSendAmount(countryPresets[countryKey]?.defaultAmount || '100');
  };

  // Fetch comparativa desde el backend API
  useEffect(() => {
    const fetchComparison = async () => {
      const num = parseFloat(sendAmount) || 100;
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/remesas?amount=${num}&country=${selectedCountry}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setRemittanceData(json.data);
          }
        }
      } catch (err) {
        console.warn('Usando cálculo local para remesas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchComparison, 250);
    return () => clearTimeout(debounce);
  }, [sendAmount, selectedCountry]);

  const activeCountry = countryPresets[selectedCountry] || countryPresets.COLOMBIA;
  const numAmount = parseFloat(sendAmount) || 100;

  const options = remittanceData?.opciones || [];

  return (
    <section id="remesas" style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* ENCABEZADO DE SECCIÓN */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-emerald">
                <Globe2 size={13} /> Envíos y Remesas
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              Comparador de Remesas a Venezuela
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Calcula en tiempo real cuánto dinero en Bolívares recibe tu familia según el país de origen.
            </p>
          </div>

          {/* SIMULADOR DE MONTO A ENVIAR */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            boxShadow: '0 4px 20px rgba(0, 245, 155, 0.1)'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Monto a Enviar:
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '0.6rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                {activeCountry.symbol}
              </span>
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="font-mono"
                style={{
                  width: '130px',
                  background: 'rgba(6, 10, 18, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  padding: '0.35rem 0.5rem 0.35rem 1.6rem',
                  outline: 'none'
                }}
              />
              <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeCountry.code}
              </span>
            </div>
          </div>
        </div>

        {/* SELECTOR DE PAÍSES DE ORIGEN */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
          background: 'rgba(6, 10, 18, 0.6)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          {Object.entries(countryPresets).map(([key, item]) => {
            const isSelected = selectedCountry === key;
            return (
              <button
                key={key}
                onClick={() => handleCountryChange(key)}
                style={{
                  background: isSelected ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#030712' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{item.flag}</span>
                <span>{item.name} ({item.code})</span>
              </button>
            );
          })}
        </div>

        {/* LISTA DE COMPARACIÓN DE PROVEEDORES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {options.map((prov, index) => {
            const isBest = prov.es_recomendado;
            return (
              <div
                key={index}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  border: isBest ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  background: isBest 
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 25, 20, 0.95) 100%)'
                    : 'var(--bg-card)',
                  boxShadow: isBest ? '0 8px 30px rgba(0, 245, 155, 0.15)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isBest && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--color-primary)',
                    color: '#030712',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.85rem',
                    borderBottomLeftRadius: '10px',
                    letterSpacing: '0.5px'
                  }}>
                    ★ MAYOR RENDIMIENTO
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  alignItems: 'center'
                }}>
                  {/* Nombre y Badge */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {prov.plataforma}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} color="var(--color-primary)" /> {prov.tiempo_estimado}
                      </span>
                      <span>•</span>
                      <span>⭐ {prov.calificacion || 4.8}/5.0</span>
                    </div>
                  </div>

                  {/* Tasa Aplicada & Comisiones */}
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tasa efectiva:</div>
                    <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      1 {prov.moneda_origen} = {Number(prov.tasa_bs_por_origen || 0).toFixed(4)} Bs
                    </div>
                    <div style={{ fontSize: '0.75rem', color: prov.comision_origen === 0 ? 'var(--color-primary)' : 'var(--color-coral)', marginTop: '0.15rem' }}>
                      {prov.comision_origen === 0 ? '✓ Sin comisión extra' : `Comisión: ${activeCountry.symbol}${Number(prov.comision_origen).toFixed(2)} ${prov.moneda_origen}`}
                    </div>
                  </div>

                  {/* Métodos de Pago */}
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Método de entrega:</div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {prov.metodos_pago?.map((pm, i) => (
                        <span key={i} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {pm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Total en Bolívares Recibido */}
                  <div style={{
                    textAlign: 'right',
                    paddingLeft: '0.5rem',
                    borderLeft: '1px solid var(--border-subtle)'
                  }} className="remittance-total-col">
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Familiar recibe en Venezuela:
                    </div>
                    <div className="font-mono" style={{
                      fontSize: '1.6rem',
                      fontWeight: 900,
                      color: isBest ? 'var(--color-primary)' : '#ffffff',
                      letterSpacing: '-0.5px'
                    }}>
                      Bs. {Number(prov.monto_final_bs).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Por {activeCountry.symbol}{numAmount.toLocaleString()} {activeCountry.code}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .remittance-total-col {
            text-align: left !important;
            border-left: none !important;
            border-top: 1px solid var(--border-subtle) !important;
            padding-left: 0 !important;
            padding-top: 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
};
