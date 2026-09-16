import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  Crown, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Upload, 
  CreditCard,
  Sparkles,
  ExternalLink,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdvertiseModal = ({ isOpen, onClose, onAddOrUpdateSlot, onNavigateToTerms, onNavigateToPrivacy }) => {
  const [step, setStep] = useState(1); // 1: Datos, 2: Posición, 3: Pago, 4: Éxito
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    url: '',
    slogan: '',
    category: 'Tecnología & Retail',
    avatar: '🚀',
    selectedTier: 1, // 1: $15, 2: $10, 3: $5
    paymentMethod: 'binance', // dinámico según métodos activos
    referenceCode: '',
    proofImageUrl: '',
    acceptedTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [pagoMovilData, setPagoMovilData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Estados para métodos de pago dinámicos
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethodKey, setSelectedMethodKey] = useState('binance');
  const [methodConfig, setMethodConfig] = useState(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Cargar métodos de pago activos desde el backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        let res;
        try {
          res = await fetch('/api/payment-methods/active');
          if (!res.ok) throw new Error('Proxy returned ' + res.status);
        } catch {
          res = await fetch('http://localhost:5000/api/payment-methods/active');
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPaymentMethods(data.data);
          // Si el método seleccionado actual no está en la lista activa, seleccionar el primero
          setSelectedMethodKey(prev => {
            const exists = data.data.find(m => m.key === prev);
            return exists ? prev : data.data[0].key;
          });
          const initial = data.data[0];
          setMethodConfig(initial);
          setFormData(prev => {
            const exists = data.data.find(m => m.key === prev.paymentMethod);
            return { ...prev, paymentMethod: exists ? prev.paymentMethod : initial.key };
          });
        }
      } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
      } finally {
        setLoadingMethods(false);
      }
    };

    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  if (!isOpen) return null;

  const handleNextStep = async (e) => {
    if (e) e.preventDefault();
    if (step === 1 && (!formData.businessName || !formData.url || !formData.slogan)) {
      alert('Por favor completa todos los campos requeridos del anuncio.');
      return;
    }

    if (step === 1 && !formData.acceptedTerms) {
      alert('Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.');
      return;
    }


    if (step === 2) {
      // Crear orden real de pago en el backend
      setIsSubmitting(true);
      const amountUsd = formData.selectedTier === 1 ? 15.00 : (formData.selectedTier === 2 ? 10.00 : 5.00);
      const targetUrl = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;

      try {
        if (formData.paymentMethod === 'pago_movil') {
          const res = await fetch('http://localhost:5000/api/payments/pagomovil/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              position: formData.selectedTier === 1 ? 1 : (formData.selectedTier === 2 ? 2 : 4),
              amountUsd,
              durationHours: 24,
              businessName: formData.businessName,
              targetUrl,
              slogan: formData.slogan,
              category: formData.category,
              avatar: formData.avatar || '🚀'
            })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setPaymentOrder(json.data);
              setPagoMovilData(json.data);
            }
          }
        } else {
          const res = await fetch('http://localhost:5000/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              position: formData.selectedTier === 1 ? 1 : (formData.selectedTier === 2 ? 2 : 4),
              amountUsd,
              durationHours: 24,
              businessName: formData.businessName,
              targetUrl,
              slogan: formData.slogan,
              category: formData.category,
              avatar: formData.avatar || '🚀',
              paymentMethod: formData.paymentMethod
            })
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setPaymentOrder(json.data);
            }
          }
        }
      } catch (err) {
        console.warn('Error al conectar con backend de pagos:', err);
      } finally {
        setIsSubmitting(false);
      }
    }

    setStep(prev => prev + 1);
  };

  const handleSelectPaymentMethod = async (method) => {
    setSelectedMethodKey(method);
    const found = paymentMethods.find(m => m.key === method);
    if (found) setMethodConfig(found);
    setFormData(prev => ({ ...prev, paymentMethod: method }));

    if (method === 'pago_movil' && !pagoMovilData) {
      try {
        const orderId = paymentOrder?.orderId || paymentOrder?.paymentId;
        if (orderId) {
          const res = await fetch(`http://localhost:5000/api/payments/pagomovil/qr/${orderId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setPagoMovilData(json.data);
              return;
            }
          }
        }

        const amountUsd = formData.selectedTier === 1 ? 15.00 : (formData.selectedTier === 2 ? 10.00 : 5.00);
        const targetUrl = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;
        const createRes = await fetch('http://localhost:5000/api/payments/pagomovil/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: formData.selectedTier === 1 ? 1 : (formData.selectedTier === 2 ? 2 : 4),
            amountUsd,
            durationHours: 24,
            businessName: formData.businessName,
            targetUrl,
            slogan: formData.slogan,
            category: formData.category,
            avatar: formData.avatar || '🚀'
          })
        });
        if (createRes.ok) {
          const json = await createRes.json();
          if (json.success && json.data) {
            setPaymentOrder(json.data);
            setPagoMovilData(json.data);
          }
        }
      } catch (err) {
        console.warn('Error al obtener datos de Pago Móvil:', err);
      }
    }
  };

  const handleFinalPayment = async () => {
    setIsSubmitting(true);
    const orderId = paymentOrder?.orderId || paymentOrder?.paymentId || `VENFI_${Date.now()}`;
    const amountUsd = formData.selectedTier === 1 ? 15.00 : (formData.selectedTier === 2 ? 10.00 : 5.00);
    const assignedPosition = formData.selectedTier === 1 ? 1 : (formData.selectedTier === 2 ? 2 : 4);

    try {
      if (formData.paymentMethod === 'pago_movil') {
        if (!formData.referenceCode) {
          alert('Por favor ingresa el número de referencia bancaria de tu Pago Móvil.');
          setIsSubmitting(false);
          return;
        }

        await fetch('http://localhost:5000/api/payments/pagomovil/proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            referenceNumber: formData.referenceCode,
            proofImageUrl: formData.proofImageUrl || 'https://cdn.venfi.app/proofs/pm_receipt.jpg'
          })
        });

        setIsSubmitting(false);
        setStep('confirmation');
        return;
      } else if (formData.paymentMethod === 'zelle' || methodConfig?.requires_approval) {
        if (!formData.referenceCode) {
          alert('Por favor ingresa el número de confirmación o referencia de pago.');
          setIsSubmitting(false);
          return;
        }

        await fetch('http://localhost:5000/api/payments/zelle/proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, referenceCode: formData.referenceCode })
        });

        setIsSubmitting(false);
        setStep('confirmation');
        return;
      } else {
        // Disparar Webhook de Binance Pay para verificación automática
        await fetch('http://localhost:5000/api/payments/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantTradeNo: orderId,
            totalFee: amountUsd,
            tradeStatus: 'SUCCESS',
            txHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
          })
        });
      }
    } catch (err) {
      console.warn('Error al procesar pago:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (onAddOrUpdateSlot) {
        onAddOrUpdateSlot({
          position: assignedPosition,
          tier: formData.selectedTier === 1 ? 'gold' : (formData.selectedTier === 2 ? 'silver' : 'dark'),
          businessName: formData.businessName,
          slogan: formData.slogan,
          category: formData.category,
          url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
          amountPaid: amountUsd,
          clicks: 1,
          impressions: 25,
          expiresInHours: 24,
          avatar: formData.avatar || '🚀',
          verified: true,
          tags: [
            formData.paymentMethod === 'pago_movil' 
              ? 'Pago Móvil (VES)' 
              : (formData.paymentMethod === 'zelle' ? 'Zelle Transfer' : 'Binance Pay USDT')
          ]
        });
      }
    }, 1000);
  };

  const resetAndClose = () => {
    setStep(1);
    setPaymentOrder(null);
    onClose();
  };


  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-gold)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(251, 191, 36, 0.25)',
        position: 'relative'
      }}>
        {/* Botón Cerrar */}
        <button
          onClick={resetAndClose}
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

        {/* =========================================================================
            PASO 1: DATOS DEL ANUNCIO
           ========================================================================= */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Flame size={20} color="var(--color-gold)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase' }}>
                Paso 1 de 3: Configuración
              </span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
              Pauta tu Negocio en el Ranking
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Consigue miles de visitas diarias directas a tu WhatsApp, Instagram o sitio web.
            </p>

            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Nombre de tu Marca o Negocio: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: TiendaTecno Caracas"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Enlace de Destino (Instagram / WhatsApp / Web): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://wa.me/58412... o instagram.com/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Eslogan o Propuesta de Valor (Máx. 120 caracteres): *
                </label>
                <textarea
                  required
                  maxLength={120}
                  rows={2}
                  placeholder="Ej: iPhones y Laptops selladas con garantía de 1 año y envíos gratis a toda Venezuela."
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Categoría:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 10, 18, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="Tecnología & Retail">Tecnología & Retail</option>
                    <option value="Finanzas & Remesas">Finanzas & Remesas</option>
                    <option value="Cripto & Trading">Cripto & Trading</option>
                    <option value="Automotriz">Automotriz</option>
                    <option value="Gastronomía">Gastronomía</option>
                    <option value="Servicios Profesionales">Servicios Profesionales</option>
                    <option value="Moda & Calzado">Moda & Calzado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Emoji / Icono:
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 10, 18, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '1.1rem',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Correo Electrónico (para notificaciones de clics):
                </label>
                <input
                  type="email"
                  placeholder="tuempresa@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Checkbox Obligatorio Legal */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                margin: '0.75rem 0',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  required
                  style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: 'var(--color-gold)' }}
                />
                <label htmlFor="acceptTerms" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  Acepto los{' '}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToTerms?.();
                    }}
                    style={{ color: 'var(--color-gold)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Términos y Condiciones
                  </span>{' '}
                  y la{' '}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToPrivacy?.();
                    }}
                    style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Política de Privacidad
                  </span>{' '}
                  (SENIAT 8299).
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-gold"
                style={{ marginTop: '0.25rem', padding: '0.85rem' }}
              >
                <span>Continuar a Selección de Posición</span>
                <ArrowRight size={18} />
              </button>

            </form>
          </div>
        )}

        {/* =========================================================================
            PASO 2: SELECCIÓN DE PUESTO
           ========================================================================= */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Crown size={20} color="var(--color-gold)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase' }}>
                Paso 2 de 3: Posición
              </span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
              Elige tu Nivel de Visibilidad
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Selecciona el puesto que deseas ocupar en el Ranking durante las próximas 24 horas:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Opción 1: Puesto #1 VIP */}
              <div
                onClick={() => setFormData({ ...formData, selectedTier: 1 })}
                style={{
                  border: formData.selectedTier === 1 ? '2px solid var(--color-gold)' : '1px solid var(--border-subtle)',
                  background: formData.selectedTier === 1 ? 'rgba(251, 191, 36, 0.12)' : 'rgba(6, 10, 18, 0.6)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Crown size={24} color="var(--color-gold)" />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                        PUESTO #1 VIP SUPREMO
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Tarjeta dorada gigante en cabecera + Badge VIP + 5x más clics
                      </p>
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-gold)' }}>
                    $15.00
                  </div>
                </div>
              </div>

              {/* Opción 2: Puestos #2-3 Silver */}
              <div
                onClick={() => setFormData({ ...formData, selectedTier: 2 })}
                style={{
                  border: formData.selectedTier === 2 ? '2px solid var(--color-silver)' : '1px solid var(--border-subtle)',
                  background: formData.selectedTier === 2 ? 'rgba(203, 213, 225, 0.12)' : 'rgba(6, 10, 18, 0.6)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sparkles size={22} color="#cbd5e1" />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                        PUESTO #2 o #3 SILVER
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Tarjeta plateada destacada + Badge Silver
                      </p>
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#cbd5e1' }}>
                    $10.00
                  </div>
                </div>
              </div>

              {/* Opción 3: Puestos #4-10 Dark */}
              <div
                onClick={() => setFormData({ ...formData, selectedTier: 3 })}
                style={{
                  border: formData.selectedTier === 3 ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  background: formData.selectedTier === 3 ? 'rgba(0, 245, 155, 0.12)' : 'rgba(6, 10, 18, 0.6)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={22} color="var(--color-primary)" />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                        PUESTO DEL #4 AL #10
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Slot en el top oficial con tracking de clics
                      </p>
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                    $5.00
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.85rem' }}
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.85rem' }}
              >
                <span>Proceder al Pago</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 3: PASARELA DE PAGO (BINANCE PAY / ZELLE)
           ========================================================================= */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <CreditCard size={20} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Paso 3 de 3: Pasarela de Pago
              </span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
              Completa tu Pago ({formData.selectedTier === 1 ? '$15.00' : formData.selectedTier === 2 ? '$10.00' : '$5.00'} USD)
            </h3>

            {/* Selector Dinámico de Método de Pago */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {(paymentMethods.length > 0 ? paymentMethods : [
                { key: 'binance', name: 'Binance Pay', icon: '🟡' },
                { key: 'zinli', name: 'Zinli (USD)', icon: '💳' },
                { key: 'pago_movil', name: 'Pago Móvil (VES)', icon: '📱' }
              ]).map((m) => {
                const isSelected = formData.paymentMethod === m.key;
                let activeColor = 'var(--color-primary)';
                let bgActive = 'rgba(0, 245, 155, 0.15)';
                if (m.key === 'binance') {
                  activeColor = 'var(--color-gold)';
                  bgActive = 'rgba(251, 191, 36, 0.15)';
                } else if (m.key === 'zelle' || m.key === 'zinli') {
                  activeColor = 'var(--color-blue)';
                  bgActive = 'rgba(56, 189, 248, 0.15)';
                }

                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => handleSelectPaymentMethod(m.key)}
                    style={{
                      background: isSelected ? bgActive : 'rgba(6, 10, 18, 0.6)',
                      border: isSelected ? `2px solid ${activeColor}` : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '0.75rem 0.5rem',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{m.icon || '💳'} {m.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector accesible para formularios y pruebas */}
            <select
              aria-label="Método de pago"
              value={formData.paymentMethod}
              onChange={(e) => handleSelectPaymentMethod(e.target.value)}
              style={{ display: 'none' }}
            >
              {(paymentMethods.length > 0 ? paymentMethods : [
                { key: 'binance', name: 'Binance Pay (USDT)', icon: '🟡' },
                { key: 'zinli', name: 'Zinli (USD)', icon: '💳' },
                { key: 'pago_movil', name: 'Pago Móvil (VES)', icon: '📱' }
              ]).map((m) => (
                <option key={m.key} value={m.key}>
                  {m.icon} {m.name}
                </option>
              ))}
            </select>

            {/* Contenido Binance Pay */}
            {formData.paymentMethod === 'binance' && (
              <div style={{
                background: 'rgba(6, 10, 18, 0.8)',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-gold)',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '180px',
                  height: '180px',
                  margin: '0 auto 1rem auto',
                  background: '#ffffff',
                  padding: '0.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'
                }}>
                  {paymentOrder?.binancePay?.qrCodeUrl ? (
                    <img 
                      src={paymentOrder.binancePay.qrCodeUrl} 
                      alt="Binance Pay QR"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      border: '2px dashed #0f172a',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a'
                    }}>
                      <QrCode size={100} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, marginTop: '0.2rem' }}>BINANCE PAY QR</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <a
                    href={paymentOrder?.binancePay?.deeplink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(251, 191, 36, 0.15)',
                      color: 'var(--color-gold)',
                      border: '1px solid var(--color-gold)',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>Abrir en Binance App</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  Merchant ID: <strong style={{ color: '#ffffff' }}>284910482</strong> • Prepay: <span className="font-mono">{paymentOrder?.binancePay?.prepayId || 'BNC_LIVE'}</span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                  Total a Pagar: {formData.selectedTier === 1 ? '15.00' : formData.selectedTier === 2 ? '10.00' : '5.00'} USDT
                </div>
              </div>
            )}


            {/* Contenido Zinli / Zelle */}
            {(formData.paymentMethod === 'zinli' || formData.paymentMethod === 'zelle') && (
              <div style={{
                background: 'rgba(6, 10, 18, 0.85)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1.5px solid var(--color-blue)',
                boxShadow: '0 8px 30px rgba(56, 189, 248, 0.1)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{formData.paymentMethod === 'zinli' ? '💳' : '🟣'}</span>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {formData.paymentMethod === 'zinli' ? 'Zinli (USD)' : 'Zelle (USD)'}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                      {formData.paymentMethod === 'zinli' 
                        ? 'Transfiere directamente a nuestra cuenta oficial Zinli en dólares:' 
                        : 'Transfiere a la cuenta oficial de Venfi vía Zelle:'}
                    </p>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span>Correo {formData.paymentMethod === 'zinli' ? 'Zinli' : 'Zelle'}: <strong style={{ color: '#ffffff' }}>{methodConfig?.fields?.email || (formData.paymentMethod === 'zinli' ? 'miplan3d@gmail.com' : 'pagos@venfi.app')}</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(methodConfig?.fields?.email || (formData.paymentMethod === 'zinli' ? 'miplan3d@gmail.com' : 'pagos@venfi.app'), 'zinli_email')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="Copiar correo"
                    >
                      {copiedField === 'zinli_email' ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                    <span>Titular: <strong style={{ color: '#ffffff' }}>{methodConfig?.fields?.name || methodConfig?.fields?.beneficiary || (formData.paymentMethod === 'zinli' ? 'Venfi Publicidad' : 'Venfi Media LLC')}</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(methodConfig?.fields?.name || methodConfig?.fields?.beneficiary || (formData.paymentMethod === 'zinli' ? 'Venfi Publicidad' : 'Venfi Media LLC'), 'zinli_name')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="Copiar titular"
                    >
                      {copiedField === 'zinli_name' ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Resumen del Monto a Pagar */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto a Transferir:</span>
                  <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                    ${formData.selectedTier === 1 ? '15.00' : formData.selectedTier === 2 ? '10.00' : '5.00'} USD
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Número de Confirmación / Referencia de Transacción*:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: TRX-948201 o número de recibo"
                    value={formData.referenceCode}
                    onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Contenido Pago Móvil (VES) */}
            {formData.paymentMethod === 'pago_movil' && (
              <div style={{
                background: 'rgba(6, 10, 18, 0.85)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1.5px solid var(--color-primary)',
                boxShadow: '0 8px 30px rgba(0, 245, 155, 0.12)',
                marginBottom: '1.5rem'
              }}>
                {/* Resumen del Monto en Bolívares */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 245, 155, 0.3)',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Monto Exacto a Transferir (Tasa Oficial BCV):
                    </div>
                    <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                      Bs. {pagoMovilData?.amountVes ? Number(pagoMovilData.amountVes).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ((formData.selectedTier === 1 ? 15 : formData.selectedTier === 2 ? 10 : 5) * 807.39).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Equivalente a ${formData.selectedTier === 1 ? '15.00' : formData.selectedTier === 2 ? '10.00' : '5.00'} USD • Tasa: {pagoMovilData?.bcvRate || '807.39'} Bs/USD
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(pagoMovilData?.amountVes || ((formData.selectedTier === 1 ? 15 : formData.selectedTier === 2 ? 10 : 5) * 807.39).toFixed(2)), 'amount')}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {copiedField === 'amount' ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                    <span>{copiedField === 'amount' ? '¡Copiado!' : 'Copiar Monto'}</span>
                  </button>
                </div>

                {/* QR y Datos Bancarios */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 160px) 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.2rem' }}>
                  {/* Imagen QR Dinámico */}
                  <div style={{
                    background: '#ffffff',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                  }}>
                    {pagoMovilData?.qrImage ? (
                      <img 
                        src={pagoMovilData.qrImage} 
                        alt="Código QR Pago Móvil" 
                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
                      />
                    ) : (
                      <div style={{ padding: '1.5rem 0', textAlign: 'center', color: '#0f172a' }}>
                        <QrCode size={90} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, display: 'block', marginTop: '0.2rem' }}>QR PAGO MÓVIL</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                      BNC • QR DINÁMICO
                    </span>
                  </div>

                  {/* Datos del Receptor */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      Datos para Pago Móvil Manual:
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Banco:</span>
                        <strong style={{ color: '#ffffff' }}>0191 - BNC</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0191', 'bank')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        title="Copiar código de banco"
                      >
                        {copiedField === 'bank' ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Teléfono:</span>
                        <strong style={{ color: '#ffffff' }}>0412-4160819</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('04124160819', 'phone')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        title="Copiar teléfono"
                      >
                        {copiedField === 'phone' ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Cédula / RIF:</span>
                        <strong style={{ color: '#ffffff' }}>V-11112387</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('11112387', 'id')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        title="Copiar cédula"
                      >
                        {copiedField === 'id' ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formulario de Confirmación y Comprobante */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Número de Referencia Bancaria (Obligatorio):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 019188492019 o últimos 6 dígitos"
                      value={formData.referenceCode}
                      onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Captura del Comprobante (Opcional):
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="URL de captura o sube el archivo"
                        value={formData.proofImageUrl}
                        onChange={(e) => setFormData({ ...formData, proofImageUrl: e.target.value })}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                      <label style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <Upload size={14} />
                        <span>Adjuntar</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setFormData({ ...formData, proofImageUrl: `https://cdn.venfi.app/proofs/${e.target.files[0].name}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido Dinámico para Nuevos Métodos de Pago (Apolo Pay, PayPal, etc.) */}
            {!['binance', 'zelle', 'zinli', 'pago_movil'].includes(formData.paymentMethod) && (
              <div style={{
                background: 'rgba(6, 10, 18, 0.85)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1.5px solid var(--color-primary)',
                boxShadow: '0 8px 30px rgba(0, 245, 155, 0.12)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{methodConfig?.icon || '💳'}</span>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {methodConfig?.name || formData.paymentMethod}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                      {methodConfig?.description || 'Transfiere el monto correspondiente según las instrucciones indicadas:'}
                    </p>
                  </div>
                </div>

                {/* Campos configurables del método dinámico */}
                {methodConfig?.fields && Object.keys(methodConfig.fields).length > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {Object.entries(methodConfig.fields).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ color: '#ffffff' }}>{String(v)}</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(String(v), `field_${k}`)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            title="Copiar"
                          >
                            {copiedField === `field_${k}` ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumen del Monto a Pagar */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto a Transferir:</span>
                  <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                    ${formData.selectedTier === 1 ? '15.00' : formData.selectedTier === 2 ? '10.00' : '5.00'} USD
                  </span>
                </div>

                {/* Número de Referencia y Comprobante */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Número de Referencia / ID de Transacción (Obligatorio):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: TRX-948201 o número de recibo"
                      value={formData.referenceCode}
                      onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Captura del Comprobante (Opcional):
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="URL de captura o sube el archivo"
                        value={formData.proofImageUrl}
                        onChange={(e) => setFormData({ ...formData, proofImageUrl: e.target.value })}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                      <label style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <Upload size={14} />
                        <span>Adjuntar</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setFormData({ ...formData, proofImageUrl: `https://cdn.venfi.app/proofs/${e.target.files[0].name}` });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep(2)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.85rem' }}
              >
                Atrás
              </button>
              <button
                onClick={handleFinalPayment}
                disabled={isSubmitting}
                className="btn btn-gold"
                style={{ flex: 2, padding: '0.85rem' }}
              >
                {isSubmitting ? 'Verificando Transacción...' : 'Confirmar y Publicar Anuncio'}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO CONFIRMACIÓN: PAGO MÓVIL EN PROCESO DE VERIFICACIÓN
           ========================================================================= */}
        {step === 'confirmation' && (
          <div className="text-center p-6" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div className="text-6xl mb-4" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>
            <h3 className="text-white font-bold text-xl" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Pago en proceso de verificación
            </h3>
            <p className="text-gray-400 mt-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.25rem auto', lineHeight: '1.5' }}>
              Hemos recibido tu comprobante. El administrador validará la transacción y activará tu pauta en el ranking.
            </p>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg" style={{
              background: 'rgba(6, 10, 18, 0.8)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <p className="text-sm text-gray-300" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                <strong style={{ color: '#ffffff' }}>Número de referencia:</strong> {formData.referenceCode}
              </p>
              <p className="text-sm text-gray-300" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                <strong style={{ color: '#ffffff' }}>Monto:</strong> Bs. {(pagoMovilData?.amountVes || ((formData.selectedTier === 1 ? 15 : formData.selectedTier === 2 ? 10 : 5) * 807.39))?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-300" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                <strong style={{ color: '#ffffff' }}>Estado:</strong> <span className="text-yellow-400" style={{ color: 'var(--color-gold)', fontWeight: 700 }}>⏳ Pendiente de verificación</span>
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition btn btn-secondary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
            >
              Volver al portal
            </button>
            <p className="text-xs text-gray-500 mt-4" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Recibirás una notificación cuando tu pago sea aprobado.
            </p>
          </div>
        )}

        {/* =========================================================================
            PASO 4: ÉXITO Y CONFIRMACIÓN
           ========================================================================= */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 155, 0.15)',
              border: '2px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              boxShadow: '0 0 30px rgba(0, 245, 155, 0.4)'
            }}>
              <CheckCircle2 size={42} color="var(--color-primary)" />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
              ¡Anuncio Publicado con Éxito!
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Tu marca <strong>{formData.businessName}</strong> ya está visible en el Ranking Top 10 de Venfi recibiendo tráfico.
            </p>

            <div style={{
              background: 'rgba(6, 10, 18, 0.8)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Resumen de Pauta:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>Posición Asignada:</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: 800 }}>Puesto #{formData.selectedTier === 1 ? 1 : formData.selectedTier === 2 ? 2 : 4}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>Duración:</span>
                <span style={{ color: 'var(--color-primary)' }}>24 Horas Activas</span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Ver en el Ranking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
