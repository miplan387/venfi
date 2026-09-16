import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Smartphone, 
  DollarSign, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const PaymentStatus = ({ orderId: initialOrderId, onStatusUpdate }) => {
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchStatus = async (idToFetch) => {
    const id = (idToFetch || searchOrderId || '').trim();
    if (!id) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`http://localhost:5000/api/payments/status/${id}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setPaymentData(json.data);
        if (onStatusUpdate) onStatusUpdate(json.data);
      } else {
        setErrorMessage(json.message || 'No se encontró la orden de pago especificada.');
        setPaymentData(null);
      }
    } catch (err) {
      setErrorMessage('Error al consultar el servidor. Intenta nuevamente.');
      setPaymentData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchOrderId(initialOrderId);
      fetchStatus(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStatus();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}>
            <CheckCircle2 size={14} />
            <span>✅ Aprobado y Activo</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}>
            <XCircle size={14} />
            <span>❌ Rechazado</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, background: 'rgba(251, 191, 36, 0.2)', color: 'var(--color-gold)' }}>
            <Clock size={14} className="animate-spin" />
            <span>⏳ Pendiente de verificación</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(0, 245, 155, 0.15)',
            border: '1px solid var(--border-primary)',
            padding: '0.5rem',
            borderRadius: '10px'
          }}>
            <ShieldCheck size={22} color="var(--color-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Consulta de Estado de Pago
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Verifica en tiempo real la conciliación de tu Pago Móvil o transferencia Zelle
            </span>
          </div>
        </div>

        {/* Buscador de Orden */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder="Ingresa ID de orden (Ej: VENFI_PM_...)"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              color: '#ffffff',
              fontSize: '0.85rem'
            }}
          />
          <button
            type="submit"
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            disabled={loading}
          >
            <Search size={15} className={loading ? 'animate-spin' : ''} />
            <span>Consultar</span>
          </button>
        </form>
      </div>

      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tarjeta de Detalles del Pago */}
      {paymentData && (
        <div style={{
          background: 'rgba(6, 10, 18, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID DE ORDEN</div>
              <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                {paymentData.orderId || paymentData.id}
              </div>
            </div>
            <div>
              {getStatusBadge(paymentData.status)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Método de Pago:</span>
              <strong style={{ color: '#ffffff' }}>
                {paymentData.paymentMethod === 'pago_movil' || paymentData.payment_method === 'pago_movil'
                  ? '📱 Pago Móvil (VES)'
                  : (paymentData.paymentMethod === 'zelle' || paymentData.payment_method === 'zelle' ? '🟣 Zelle' : '🟡 Binance Pay')}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Monto:</span>
              <strong className="font-mono" style={{ color: 'var(--color-primary)' }}>
                ${Number(paymentData.amountUsd || paymentData.amount_usd || 0).toFixed(2)} USD
                {paymentData.amountVes && ` (~Bs. ${Number(paymentData.amountVes).toLocaleString('es-VE', { minimumFractionDigits: 2 })})`}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Referencia Registrada:</span>
              <strong className="font-mono" style={{ color: '#ffffff' }}>
                {paymentData.referenceNumber || paymentData.reference_number || paymentData.tx_hash || 'Sin comprobante'}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Posición Pautada:</span>
              <strong style={{ color: 'var(--color-gold)' }}>
                Puesto #{paymentData.position || 1} en Ranking
              </strong>
            </div>
          </div>

          {/* Mensaje o notas del administrador en caso de rechazo */}
          {paymentData.status === 'rejected' && paymentData.adminNotes && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.85rem',
              color: '#fca5a5'
            }}>
              <strong>Motivo de rechazo:</strong> {paymentData.adminNotes}
            </div>
          )}

          {paymentData.status === 'pending' && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.82rem',
              color: 'var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Tu transacción está en cola de conciliación bancaria. Se activará automáticamente al ser verificada por el administrador.</span>
              <button
                onClick={() => fetchStatus()}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Re-verificar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
