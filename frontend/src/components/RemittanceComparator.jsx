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
  Globe2,
  Building2,
  Coins,
  Layers
} from 'lucide-react';

export const RemittanceComparator = ({ providers: initialProviders }) => {
  const [selectedCountry, setSelectedCountry] = useState('COLOMBIA');
  const [sendAmount, setSendAmount] = useState('200000');
  const [activeMarketTab, setActiveMarketTab] = useState('all'); // 'all' | 'official' | 'parallel'
  const [remittanceData, setRemittanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const countryPresets = {
    COLOMBIA: { code: 'COP', name: 'Colombia', symbol: '$', flag: '🇨🇴', defaultAmount: '200000', label: 'Pesos Colombianos (COP)' },
    PERU: { code: 'PEN', name: 'Perú', symbol: 'S/', flag: '🇵🇪', defaultAmount: '200', label: 'Soles Peruanos (PEN)' },
    CHILE: { code: 'CLP', name: 'Chile', symbol: '$', flag: '🇨🇱', defaultAmount: '50000', label: 'Pesos Chilenos (CLP)' },
    BRASIL: { code: 'BRL', name: 'Brasil', symbol: 'R$', flag: '🇧🇷', defaultAmount: '300', label: 'Reales Brasileños (BRL)' },
    ARGENTINA: { code: 'ARS', name: 'Argentina', symbol: '$', flag: '🇦🇷', defaultAmount: '50000', label: 'Pesos Argentinos (ARS)' },
    USA: { code: 'USD', name: 'Estados Unidos', symbol: '$', flag: '🇺🇸', defaultAmount: '100', label: 'Dólares (USD)' },
    ESPANA: { code: 'EUR', name: 'España / Europa', symbol: '€', flag: '🇪🇸', defaultAmount: '100', label: 'Euros (EUR)' },
    ITALIA: { code: 'EUR', name: 'Italia', symbol: '€', flag: '🇮🇹', defaultAmount: '100', label: 'Euros (EUR)' },
    PANAMA: { code: 'USD', name: 'Panamá', symbol: '$', flag: '🇵🇦', defaultAmount: '100', label: 'Dólares (USD)' }
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

  const fallbackOptions = (initialProviders || []).map((p, idx) => {
    const feePct = p.feePercent || 0;
    const fixedFee = p.fixedFee || 0;
    const feeVal = (numAmount * (feePct / 100)) + fixedFee;
    const netAmount = Math.max(0, numAmount - feeVal);
    const sellRateBs = p.sellRate || p.rate || 78.50;
    const buyRateBs = p.buyRate || Number((sellRateBs * 0.975).toFixed(4));
    const finalBs = netAmount * sellRateBs;
    const marketType = p.market_type || (['italcambio', 'angulo_lopez', 'insular'].includes(p.id) ? 'official' : 'parallel');
    return {
      key: p.id,
      plataforma: p.name,
      icon: p.id === 'binance' ? '🟡' : p.id === 'italcambio' ? '🇮🇹' : p.id === 'angulo_lopez' ? '🏛️' : p.id === 'insular' ? '🏝️' : p.id === 'zoom' ? '🔴' : p.id === 'airtm' ? '🔵' : '🌐',
      market_type: marketType,
      buy_rate: buyRateBs,
      sell_rate: sellRateBs,
      buy_rate_multiplier: p.buy_rate_multiplier || 0.975,
      sell_rate_multiplier: p.sell_rate_multiplier || 1.000,
      tasa_compra_bs_por_usd: buyRateBs,
      tasa_venta_bs_por_usd: sellRateBs,
      tasa_compra_bs_por_origen: buyRateBs,
      tasa_venta_bs_por_origen: sellRateBs,
      tasa_bs_por_usd: sellRateBs,
      tasa_bs_por_origen: sellRateBs,
      moneda_origen: activeCountry.code,
      comision_origen: Number(feeVal.toFixed(2)),
      monto_neto_origen: Number(netAmount.toFixed(2)),
      monto_final_bs: Number(finalBs.toFixed(2)),
      tiempo_estimado: p.speed || '24 horas',
      metodos_pago: p.paymentMethods || ['PagoMóvil', 'Transferencia'],
      metodos_entrega: ['Pago Móvil', 'Transferencia Bs'],
      calificacion: p.rating || 4.5,
      badge: p.badge || '',
      url_afiliado: '',
      es_recomendado: idx === 0,
      es_mejor_oficial: marketType === 'official' && p.id === 'italcambio',
      es_mejor_paralelo: marketType === 'parallel' && p.id === 'binance'
    };
  });

  const rawOptions = (remittanceData?.opciones && remittanceData.opciones.length > 0)
    ? remittanceData.opciones
    : fallbackOptions;

  // Filtrar según la pestaña de mercado seleccionada
  const options = rawOptions.filter((opt) => {
    if (activeMarketTab === 'official') return opt.market_type === 'official';
    if (activeMarketTab === 'parallel') return opt.market_type === 'parallel';
    return true;
  });

  const officialCount = rawOptions.filter(o => o.market_type === 'official').length;
  const parallelCount = rawOptions.filter(o => o.market_type === 'parallel').length;

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
              Compara tasas reales separando el <strong style={{ color: 'var(--color-gold)' }}>Mercado Oficial (BCV)</strong> del <strong style={{ color: 'var(--color-primary)' }}>Mercado Paralelo (USDT)</strong>.
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
          marginBottom: '1.25rem',
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

        {/* SELECTOR DE PESTAÑAS DE MERCADO (OFICIAL BCV VS PARALELO USDT) */}
        <div style={{
          display: 'flex',
          gap: '0.65rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '0.4rem',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setActiveMarketTab('all')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: activeMarketTab === 'all' ? '1px solid var(--color-primary)' : '1px solid transparent',
              background: activeMarketTab === 'all' ? 'rgba(0, 245, 155, 0.15)' : 'transparent',
              color: activeMarketTab === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={15} />
            <span>Todos los Mercados ({rawOptions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMarketTab('official')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: activeMarketTab === 'official' ? '1px solid var(--color-gold)' : '1px solid transparent',
              background: activeMarketTab === 'official' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
              color: activeMarketTab === 'official' ? 'var(--color-gold)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={15} />
            <span>🏛️ Casas de Cambio Oficiales (BCV) ({officialCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMarketTab('parallel')}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: activeMarketTab === 'parallel' ? '1px solid var(--color-blue)' : '1px solid transparent',
              background: activeMarketTab === 'parallel' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeMarketTab === 'parallel' ? 'var(--color-blue)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Coins size={15} />
            <span>🔄 Mercado Paralelo & P2P (USDT) ({parallelCount})</span>
          </button>
        </div>

        {/* LISTA DE COMPARACIÓN DE PROVEEDORES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {options.map((prov, index) => {
            const isOfficial = prov.market_type === 'official';
            const isBestOverall = prov.es_recomendado && activeMarketTab === 'all';
            const isBestOfficial = prov.es_mejor_oficial && activeMarketTab === 'official';
            const isBestParallel = prov.es_mejor_paralelo && activeMarketTab === 'parallel';
            const isHighlighted = isBestOverall || isBestOfficial || isBestParallel;

            const badgeText = isBestOverall 
              ? '★ MAYOR RENDIMIENTO' 
              : isBestOfficial 
                ? '★ MEJOR TASA OFICIAL BCV' 
                : isBestParallel 
                  ? '★ MEJOR TASA P2P' 
                  : null;

            return (
              <div
                key={prov.key || index}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  border: isHighlighted
                    ? isOfficial 
                      ? '1.5px solid var(--color-gold)' 
                      : '1.5px solid var(--color-primary)'
                    : '1px solid var(--border-subtle)',
                  background: isHighlighted 
                    ? isOfficial
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 25, 10, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 25, 20, 0.95) 100%)'
                    : 'var(--bg-card)',
                  boxShadow: isHighlighted ? '0 8px 30px rgba(0, 0, 0, 0.35)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isHighlighted && badgeText && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: isOfficial ? 'var(--color-gold)' : 'var(--color-primary)',
                    color: '#030712',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.85rem',
                    borderBottomLeftRadius: '10px',
                    letterSpacing: '0.5px'
                  }}>
                    {badgeText}
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1.25rem',
                  alignItems: 'center'
                }}>
                  {/* Nombre, Badge de Empresa y Tipo de Mercado */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.25rem' }}>{prov.icon || '🏢'}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {prov.plataforma}
                      </h3>
                      {prov.badge && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: isOfficial ? 'var(--color-gold)' : 'var(--color-primary)',
                          border: `1px solid ${isOfficial ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 245, 155, 0.25)'}`
                        }}>
                          {prov.badge}
                        </span>
                      )}
                    </div>

                    {/* Badge Indicador de Mercado Oficial vs Paralelo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      {isOfficial ? (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(251, 191, 36, 0.12)',
                          color: 'var(--color-gold)',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Building2 size={11} />
                          <span>OFICIAL BCV / SUDEBAN</span>
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: 'var(--color-blue)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Coins size={11} />
                          <span>MERCADO PARALELO (USDT)</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} color={isOfficial ? 'var(--color-gold)' : 'var(--color-primary)'} /> {prov.tiempo_estimado}
                      </span>
                      <span>•</span>
                      <span>⭐ {prov.calificacion || 4.8}/5.0</span>
                      {prov.url_afiliado && (
                        <>
                          <span>•</span>
                          <a
                            href={prov.url_afiliado}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: isOfficial ? 'var(--color-gold)' : 'var(--color-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              textDecoration: 'none',
                              fontWeight: 600
                            }}
                          >
                            <span>Sitio Oficial</span>
                            <ExternalLink size={11} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tasas Diferenciadas: Compra y Venta (Tasa Efectiva) */}
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {/* Tasa Compra */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: 'var(--color-blue)',
                          border: '1px solid rgba(56, 189, 248, 0.25)'
                        }}>
                          COMPRA
                        </span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                          1 {prov.moneda_origen} = {Number(prov.buy_rate || prov.tasa_compra_bs_por_origen || 0).toFixed(4)} Bs
                        </span>
                      </div>

                      {/* Tasa Venta (Efectiva de Recepción) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: isOfficial ? 'rgba(251, 191, 36, 0.15)' : 'rgba(0, 245, 155, 0.12)',
                          color: isOfficial ? 'var(--color-gold)' : 'var(--color-primary)',
                          border: `1px solid ${isOfficial ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 245, 155, 0.25)'}`
                        }}>
                          VENTA
                        </span>
                        <span className="font-mono" style={{ color: '#ffffff', fontWeight: 800 }}>
                          1 {prov.moneda_origen} = {Number(prov.sell_rate || prov.tasa_venta_bs_por_origen || prov.tasa_bs_por_origen || 0).toFixed(4)} Bs
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: prov.comision_origen === 0 ? (isOfficial ? 'var(--color-gold)' : 'var(--color-primary)') : 'var(--color-coral)', marginTop: '0.35rem' }}>
                      {prov.comision_origen === 0 ? '✓ Sin comisión extra' : `Comisión: ${activeCountry.symbol}${Number(prov.comision_origen).toFixed(2)} ${prov.moneda_origen}`}
                    </div>
                  </div>

                  {/* Métodos de Entrega */}
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Métodos de entrega:</div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {prov.metodos_entrega?.map((pm, i) => (
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
                      color: isHighlighted ? (isOfficial ? 'var(--color-gold)' : 'var(--color-primary)') : '#ffffff',
                      letterSpacing: '-0.5px'
                    }}>
                      Bs. {Number(prov.monto_final_bs).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Por {activeCountry.symbol}{numAmount.toLocaleString()} {activeCountry.code} ({isOfficial ? 'Tasa BCV' : 'Tasa USDT'})
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DISCLAIMER LEGAL Y REGULATORIO */}
        <div className="glass-panel" style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          borderLeft: '4px solid var(--color-gold)',
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <Shield size={22} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
              Aviso Legal y Marco Regulatorio Cambiario
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              <strong style={{ color: 'var(--color-gold)' }}>🏛️ Casas de Cambio Oficiales (ItalCambio, Angulo López, Insular):</strong> Entidades debidamente autorizadas y supervisadas por la SUDEBAN y el Banco Central de Venezuela (BCV), cuyas liquidaciones operan bajo la tasa oficial de cambio legal.
              <br />
              <strong style={{ color: 'var(--color-primary)' }}>🔄 Mercado Paralelo & P2P (Binance, Airtm, Zoom, MoneyGram):</strong> Plataformas globales de libre intercambio entre particulares cuyas tasas corresponden a la oferta y demanda de criptoactivos (USDT) y mercados internacionales.
              <br />
              <em>Venfi es un comparador tecnológico e informativo independiente. No custodia fondos, no capta recursos del público ni realiza intermediación cambiaria directa.</em>
            </p>
          </div>
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
