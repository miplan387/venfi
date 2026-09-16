import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Calculator, 
  ReceiptText,
  Sparkles,
  Globe2
} from 'lucide-react';

export const CurrencyConverter = ({ rates, selectedRateKey = 'bcv' }) => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VES');
  const [activeRateKey, setActiveRateKey] = useState(selectedRateKey);
  const [copied, setCopied] = useState(false);
  const [showVueltoCalc, setShowVueltoCalc] = useState(false);
  
  // Estados para calculadora de vuelto
  const [paidWith, setPaidWith] = useState('20');
  const [productCost, setProductCost] = useState('14.50');
  const [vueltoCurrency, setVueltoCurrency] = useState('USD');

  useEffect(() => {
    if (selectedRateKey) {
      setActiveRateKey(selectedRateKey);
    }
  }, [selectedRateKey]);

  // Tasas de cambio disponibles
  const usdBcvRate = rates?.bcv?.rate || 787.52;
  const usdParaleloRate = rates?.paralelo?.rate || 931.28;
  const usdUsdtRate = rates?.usdtBinance?.rate || 933.15;
  const euroBcvRate = rates?.euroBcv?.rate || rates?.euro?.rate || 919.15;

  // Tasas de Latinoamérica (Cantidad de moneda local por 1 USD)
  const copVsUsd = rates?.latam?.cop?.rateVsUsd || 4120.50;
  const penVsUsd = rates?.latam?.pen?.rateVsUsd || 3.75;
  const clpVsUsd = rates?.latam?.clp?.rateVsUsd || 955.00;
  const brlVsUsd = rates?.latam?.brl?.rateVsUsd || 5.48;
  const arsVsUsd = rates?.latam?.ars?.rateVsUsd || 1190.00;

  // Obtener la tasa de referencia USD activa
  const getActiveUsdRate = () => {
    switch (activeRateKey) {
      case 'paralelo':
        return { rate: usdParaleloRate, label: 'Dólar Paralelo' };
      case 'usdt':
        return { rate: usdUsdtRate, label: 'Binance USDT' };
      case 'euro':
        return { rate: euroBcvRate, label: 'Euro BCV' };
      case 'bcv':
      default:
        return { rate: usdBcvRate, label: 'Dólar BCV Oficial' };
    }
  };

  const { rate: currentUsdRate, label: currentRateLabel } = getActiveUsdRate();

  // Mapeo universal de paridad hacia Bolívares (VES como pivote central)
  const rateToVesMap = {
    USD: currentUsdRate,
    VES: 1,
    EUR: euroBcvRate,
    COP: Number((currentUsdRate / copVsUsd).toFixed(4)),
    PEN: Number((currentUsdRate / penVsUsd).toFixed(2)),
    CLP: Number((currentUsdRate / clpVsUsd).toFixed(4)),
    BRL: Number((currentUsdRate / brlVsUsd).toFixed(2)),
    ARS: Number((currentUsdRate / arsVsUsd).toFixed(4))
  };

  // Cálculo de conversión multidireccional
  const numericAmount = parseFloat(amount) || 0;
  const amountInVes = numericAmount * rateToVesMap[fromCurrency];
  const calculatedResult = amountInVes / rateToVesMap[toCurrency];

  // Formato del resultado
  const formattedResult = toCurrency === 'VES' || toCurrency === 'COP' || toCurrency === 'CLP' || toCurrency === 'ARS'
    ? calculatedResult.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : calculatedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  // Tasa cruzada directa entre fromCurrency y toCurrency
  const directRate = rateToVesMap[fromCurrency] / rateToVesMap[toCurrency];

  // Metadatos de cada divisa
  const currencyMeta = {
    USD: { symbol: '$', code: 'USD', name: 'Dólares (USD)', flag: '🇺🇸 USD' },
    VES: { symbol: 'Bs.', code: 'VES', name: 'Bolívares (VES)', flag: '🇻🇪 VES' },
    EUR: { symbol: '€', code: 'EUR', name: 'Euros (EUR)', flag: '🇪🇺 EUR' },
    COP: { symbol: '$', code: 'COP', name: 'Pesos Colombianos (COP)', flag: '🇨🇴 COP' },
    PEN: { symbol: 'S/', code: 'PEN', name: 'Soles Peruanos (PEN)', flag: '🇵🇪 PEN' },
    CLP: { symbol: '$', code: 'CLP', name: 'Pesos Chilenos (CLP)', flag: '🇨🇱 CLP' },
    BRL: { symbol: 'R$', code: 'BRL', name: 'Reales Brasileños (BRL)', flag: '🇧🇷 BRL' },
    ARS: { symbol: '$', code: 'ARS', name: 'Pesos Argentinos (ARS)', flag: '🇦🇷 ARS' }
  };

  // Cálculo de vuelto
  const numPaidWith = parseFloat(paidWith) || 0;
  const numProductCost = parseFloat(productCost) || 0;
  const vueltoForeign = Math.max(0, numPaidWith - numProductCost);
  const currentForeignRate = vueltoCurrency === 'EUR' ? euroBcvRate : (vueltoCurrency === 'COP' ? rateToVesMap.COP : currentUsdRate);
  const vueltoVES = (vueltoForeign * currentForeignRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleCopy = () => {
    const textToCopy = `${amount} ${fromCurrency} = ${formattedResult} ${toCurrency} (Tasa: 1 ${fromCurrency} = ${directRate.toFixed(4)} ${toCurrency} - ${currentRateLabel})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setPresetAmount = (val) => {
    setAmount(val.toString());
  };

  // Presets según moneda de entrada
  const getPresets = () => {
    switch (fromCurrency) {
      case 'COP':
        return [50000, 100000, 200000, 500000, 1000000];
      case 'CLP':
        return [10000, 25000, 50000, 100000, 250000];
      case 'ARS':
        return [10000, 20000, 50000, 100000, 200000];
      case 'PEN':
        return [50, 100, 200, 500, 1000];
      case 'BRL':
        return [50, 100, 200, 500, 1000];
      case 'VES':
        return [500, 1000, 2500, 5000, 10000];
      case 'EUR':
      case 'USD':
      default:
        return [5, 10, 20, 50, 100, 500];
    }
  };

  return (
    <section id="convertidor" style={{ padding: '1.5rem 0 2.5rem 0' }}>
      <div className="container">
        <div className="glass-panel" style={{
          padding: '2rem',
          border: '1px solid rgba(0, 245, 155, 0.25)',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 17, 32, 0.95) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
        }}>
          {/* Header del Convertidor */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <Calculator size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  Calculadora Multidivisa Internacional
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                Convertidor de Divisas
              </h2>
            </div>

            {/* Selectores de Tasa de Referencia */}
            <div style={{
              display: 'flex',
              background: 'rgba(6, 10, 18, 0.6)',
              padding: '0.35rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              gap: '0.25rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setActiveRateKey('bcv')}
                style={{
                  background: activeRateKey === 'bcv' ? 'var(--color-primary)' : 'transparent',
                  color: activeRateKey === 'bcv' ? '#030712' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                BCV ({usdBcvRate.toFixed(2)})
              </button>

              <button
                onClick={() => setActiveRateKey('paralelo')}
                style={{
                  background: activeRateKey === 'paralelo' ? 'var(--color-blue)' : 'transparent',
                  color: activeRateKey === 'paralelo' ? '#030712' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Paralelo ({usdParaleloRate.toFixed(2)})
              </button>

              <button
                onClick={() => setActiveRateKey('usdt')}
                style={{
                  background: activeRateKey === 'usdt' ? 'var(--color-gold)' : 'transparent',
                  color: activeRateKey === 'usdt' ? '#030712' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                USDT ({usdUsdtRate.toFixed(2)})
              </button>

              <button
                onClick={() => setActiveRateKey('euro')}
                style={{
                  background: activeRateKey === 'euro' ? '#38bdf8' : 'transparent',
                  color: activeRateKey === 'euro' ? '#030712' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                EUR ({euroBcvRate.toFixed(2)})
              </button>
            </div>
          </div>

          {/* Grid Principal del Convertidor */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {/* Campo Izquierdo (De: fromCurrency) */}
            <div style={{
              background: 'rgba(6, 10, 18, 0.75)',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--border-medium)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Tú tienes:
                </span>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    padding: '0.35rem 0.6rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <optgroup label="Divisas Principales" style={{ background: '#0f172a', color: '#ffffff' }}>
                    <option value="USD">🇺🇸 $ USD (Dólares)</option>
                    <option value="VES">🇻🇪 Bs. VES (Bolívares)</option>
                    <option value="EUR">🇪🇺 € EUR (Euros)</option>
                  </optgroup>
                  <optgroup label="Monedas de Latinoamérica" style={{ background: '#0f172a', color: '#ffffff' }}>
                    <option value="COP">🇨🇴 $ COP (Colombia)</option>
                    <option value="PEN">🇵🇪 S/ PEN (Perú)</option>
                    <option value="CLP">🇨🇱 $ CLP (Chile)</option>
                    <option value="BRL">🇧🇷 R$ BRL (Brasil)</option>
                    <option value="ARS">🇦🇷 $ ARS (Argentina)</option>
                  </optgroup>
                </select>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)'
                }}>
                  {currencyMeta[fromCurrency]?.symbol || '$'}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="font-mono"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    paddingLeft: '3.2rem',
                    paddingRight: '1rem'
                  }}
                />
              </div>

              {/* Atajos Rápidos Dinámicos */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                {getPresets().map((val) => (
                  <button
                    key={val}
                    onClick={() => setPresetAmount(val)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      borderRadius: '6px',
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {currencyMeta[fromCurrency]?.symbol}{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de Inversión Bidireccional */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSwapCurrencies}
                className="btn btn-secondary"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  padding: 0,
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 0 20px rgba(0, 245, 155, 0.15)'
                }}
                title="Invertir monedas"
              >
                <ArrowLeftRight size={20} color="var(--color-primary)" />
              </button>
            </div>

            {/* Campo Derecho (Hacia: toCurrency) */}
            <div style={{
              background: 'rgba(6, 10, 18, 0.75)',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(0, 245, 155, 0.3)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Total a Recibir:
                </span>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    padding: '0.35rem 0.6rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <optgroup label="Divisas Principales" style={{ background: '#0f172a', color: '#ffffff' }}>
                    <option value="VES">🇻🇪 Bs. VES (Bolívares)</option>
                    <option value="USD">🇺🇸 $ USD (Dólares)</option>
                    <option value="EUR">🇪🇺 € EUR (Euros)</option>
                  </optgroup>
                  <optgroup label="Monedas de Latinoamérica" style={{ background: '#0f172a', color: '#ffffff' }}>
                    <option value="COP">🇨🇴 $ COP (Colombia)</option>
                    <option value="PEN">🇵🇪 S/ PEN (Perú)</option>
                    <option value="CLP">🇨🇱 $ CLP (Chile)</option>
                    <option value="BRL">🇧🇷 R$ BRL (Brasil)</option>
                    <option value="ARS">🇦🇷 $ ARS (Argentina)</option>
                  </optgroup>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {currencyMeta[toCurrency]?.symbol || 'Bs.'}
                </span>
                <span className="font-mono" style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.5px'
                }}>
                  {formattedResult}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.85rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  1 {fromCurrency} = {directRate >= 100 ? directRate.toFixed(2) : directRate.toFixed(4)} {toCurrency} ({currentRateLabel})
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)',
                    color: copied ? '#030712' : 'var(--text-primary)',
                    border: 'none',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Calculadora de Vueltos */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setShowVueltoCalc(!showVueltoCalc)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-gold)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <ReceiptText size={16} />
              {showVueltoCalc ? 'Ocultar Calculadora de Vueltos' : '💼 ¿Vas a pagar en efectivo? Abrir Calculadora de Vuelto (USD / EUR / COP / Bs)'}
            </button>

            {showVueltoCalc && (
              <div style={{
                marginTop: '1rem',
                background: 'rgba(6, 10, 18, 0.8)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-gold)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Pagas con billete de:
                    </label>
                    <select
                      value={vueltoCurrency}
                      onChange={(e) => setVueltoCurrency(e.target.value)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--color-gold)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        padding: '0.15rem 0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="USD" style={{ background: '#0f172a', color: '#ffffff' }}>$ USD</option>
                      <option value="EUR" style={{ background: '#0f172a', color: '#ffffff' }}>€ EUR</option>
                      <option value="COP" style={{ background: '#0f172a', color: '#ffffff' }}>$ COP</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    value={paidWith}
                    onChange={(e) => setPaidWith(e.target.value)}
                    className="font-mono"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '0.5rem 0.75rem',
                      fontSize: '1rem',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Costo de la compra ({vueltoCurrency}):
                  </label>
                  <input
                    type="number"
                    value={productCost}
                    onChange={(e) => setProductCost(e.target.value)}
                    className="font-mono"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '0.5rem 0.75rem',
                      fontSize: '1rem',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Vuelto exacto a recibir:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                      {vueltoForeign.toFixed(2)} {vueltoCurrency}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>o</span>
                    <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      Bs. {vueltoVES}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
