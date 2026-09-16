import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock, 
  MousePointer, 
  Eye, 
  Percent, 
  Save, 
  X,
  AlertTriangle,
  Plus,
  Smartphone,
  Settings,
  Building,
  Phone,
  CreditCard,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';

export const AdminCards = ({ onBackToPortal }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pestañas del Panel de Administración
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'pagomovil' | 'bank_config'

  // Pagos Móviles Pendientes
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Configuración Bancaria del Receptor
  const [bankConfig, setBankConfig] = useState({
    bank: 'BNC (Banco Nacional de Crédito)',
    bankCode: '0191',
    phone: '0412-4160819',
    idNumber: 'V-11112387',
    beneficiaryName: 'Venfi Publicidad & Medios C.A.'
  });
  const [isSavingBankConfig, setIsSavingBankConfig] = useState(false);
  
  // Métodos de Pago Modulares
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [editingMethodKey, setEditingMethodKey] = useState(null);
  const [methodFormData, setMethodFormData] = useState({
    key: '',
    name: '',
    icon: '💳',
    description: '',
    sort_order: 1,
    is_active: true,
    requires_approval: false
  });
  const [methodFieldPairs, setMethodFieldPairs] = useState([{ key: '', value: '' }]);
  const [isSavingMethod, setIsSavingMethod] = useState(false);

  // Modal de Edición
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Modal de Renovación
  const [renewingCard, setRenewingCard] = useState(null);
  const [renewHours, setRenewHours] = useState(24);

  // Mensajes de confirmación y alertas
  const [actionMessage, setActionMessage] = useState(null);

  // Cargar tarjetas desde la API de administración
  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/cards', {
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCards(json.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar tarjetas de administración:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pagos móviles pendientes
  const fetchPendingPayments = async () => {
    try {
      setLoadingPending(true);
      const res = await fetch('http://localhost:5000/api/payments/pagomovil/pending', {
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPendingPayments(json.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar pagos móviles pendientes:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  // Cargar configuración bancaria del receptor
  const fetchBankConfig = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/payments/pagomovil/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setBankConfig(json.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar configuración bancaria:', err);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchPendingPayments();
    fetchBankConfig();
    fetchAllPaymentMethods();
  }, []);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleApprovePayment = async (orderId) => {
    const confirmApprove = window.confirm(`¿Aprobar el Pago Móvil ${orderId} y activar inmediatamente la tarjeta en el ranking?`);
    if (!confirmApprove) return;

    try {
      const res = await fetch('http://localhost:5000/api/payments/pagomovil/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'venfi-admin-2026'
        },
        body: JSON.stringify({ orderId, adminNotes: 'Pago verificado exitosamente en BNC' })
      });
      if (res.ok) {
        showNotification(`Pago ${orderId} aprobado con éxito. Pauta activada en el Ranking.`);
        fetchPendingPayments();
        fetchCards();
      } else {
        const errJson = await res.json();
        showNotification(errJson.message || 'Error al aprobar pago', 'error');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectingPayment) return;
    try {
      const res = await fetch('http://localhost:5000/api/payments/pagomovil/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'venfi-admin-2026'
        },
        body: JSON.stringify({ 
          orderId: rejectingPayment.id, 
          adminNotes: rejectNotes.trim() || 'Referencia bancaria no encontrada o no coincide con los registros de BNC.' 
        })
      });
      if (res.ok) {
        showNotification(`Pago ${rejectingPayment.id} rechazado.`);
        setRejectingPayment(null);
        setRejectNotes('');
        fetchPendingPayments();
      } else {
        const errJson = await res.json();
        showNotification(errJson.message || 'Error al rechazar pago', 'error');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    }
  };

  const handleSaveBankConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingBankConfig(true);
      const res = await fetch('http://localhost:5000/api/payments/pagomovil/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'venfi-admin-2026'
        },
        body: JSON.stringify(bankConfig)
      });
      if (res.ok) {
        showNotification('Datos bancarios del receptor actualizados correctamente.');
        fetchBankConfig();
      } else {
        const errJson = await res.json();
        showNotification(errJson.message || 'Error al guardar configuración bancaria', 'error');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    } finally {
      setIsSavingBankConfig(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setActionMessage({ msg, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  // =========================================================================
  // GESTIÓN DINÁMICA DE MÉTODOS DE PAGO
  // =========================================================================

  // Cargar todos los métodos de pago
  const fetchAllPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await fetch('http://localhost:5000/api/payment-methods', {
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAllPaymentMethods(json.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  // Alternar estado activo / inactivo de un método de pago
  const handleToggleMethodActive = async (method) => {
    try {
      const res = await fetch(`http://localhost:5000/api/payment-methods/${method.key}/toggle`, {
        method: 'PATCH',
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        showNotification(`Método "${method.name}" ${updated.is_active ? 'activado' : 'desactivado'} con éxito.`);
        setAllPaymentMethods(prev => prev.map(m => m.key === method.key ? updated : m));
      } else {
        const errJson = await res.json();
        showNotification(errJson.message || 'Error al cambiar estado del método', 'error');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    }
  };

  // Abrir modal para crear nuevo método
  const handleOpenCreateMethodModal = () => {
    setEditingMethodKey(null);
    setMethodFormData({
      key: '',
      name: '',
      icon: '💳',
      description: '',
      sort_order: allPaymentMethods.length + 1,
      is_active: true,
      requires_approval: true
    });
    setMethodFieldPairs([
      { key: 'correo', value: '' },
      { key: 'titular', value: '' }
    ]);
    setIsMethodModalOpen(true);
  };

  // Abrir modal para editar método existente
  const handleOpenEditMethodModal = (method) => {
    setEditingMethodKey(method.key);
    setMethodFormData({
      key: method.key,
      name: method.name || '',
      icon: method.icon || '💳',
      description: method.description || '',
      sort_order: method.sort_order ?? 0,
      is_active: !!method.is_active,
      requires_approval: !!method.requires_approval
    });
    const entries = Object.entries(method.fields || {});
    if (entries.length > 0) {
      setMethodFieldPairs(entries.map(([k, v]) => ({ key: k, value: String(v) })));
    } else {
      setMethodFieldPairs([{ key: '', value: '' }]);
    }
    setIsMethodModalOpen(true);
  };

  // Guardar método (Crear o Actualizar)
  const handleSaveMethod = async (e) => {
    if (e) e.preventDefault();
    if (!methodFormData.name.trim()) {
      showNotification('El nombre comercial del método es obligatorio', 'error');
      return;
    }

    const fieldsObj = {};
    methodFieldPairs.forEach(pair => {
      const k = pair.key.trim();
      if (k) {
        fieldsObj[k] = pair.value.trim();
      }
    });

    const payload = {
      name: methodFormData.name.trim(),
      icon: methodFormData.icon.trim() || '💳',
      description: methodFormData.description.trim(),
      fields: fieldsObj,
      is_active: methodFormData.is_active,
      requires_approval: methodFormData.requires_approval,
      sort_order: Number(methodFormData.sort_order) || 0
    };

    setIsSavingMethod(true);
    try {
      if (editingMethodKey) {
        const res = await fetch(`http://localhost:5000/api/payment-methods/${editingMethodKey}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': 'venfi-admin-2026'
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showNotification(`Método "${payload.name}" actualizado con éxito.`);
          setIsMethodModalOpen(false);
          fetchAllPaymentMethods();
        } else {
          const err = await res.json();
          showNotification(err.message || 'Error al actualizar método', 'error');
        }
      } else {
        const key = methodFormData.key.trim().toLowerCase().replace(/\s+/g, '_');
        if (!key) {
          showNotification('La clave única identificadora es obligatoria (ej: apolo_pay)', 'error');
          setIsSavingMethod(false);
          return;
        }
        const createPayload = { ...payload, key };
        const res = await fetch('http://localhost:5000/api/payment-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': 'venfi-admin-2026'
          },
          body: JSON.stringify(createPayload)
        });
        if (res.ok) {
          showNotification(`Nuevo método "${payload.name}" creado con éxito.`);
          setIsMethodModalOpen(false);
          fetchAllPaymentMethods();
        } else {
          const err = await res.json();
          showNotification(err.message || 'Error al crear método', 'error');
        }
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    } finally {
      setIsSavingMethod(false);
    }
  };

  // Eliminar método
  const handleDeleteMethod = async (method) => {
    const isCore = ['binance', 'zelle', 'pago_movil'].includes(method.key);
    if (isCore) {
      const confirmDeactivate = window.confirm(`"${method.name}" es un método nativo del sistema. En lugar de eliminarlo, ¿deseas desactivarlo para que no aparezca en el modal de clientes?`);
      if (confirmDeactivate && method.is_active) {
        handleToggleMethodActive(method);
      }
      return;
    }

    const confirmDelete = window.confirm(`¿Estás seguro de eliminar permanentemente el método de pago "${method.name}" (${method.key})?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/payment-methods/${method.key}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        showNotification(`Método "${method.name}" eliminado correctamente.`);
        fetchAllPaymentMethods();
      } else {
        const err = await res.json();
        showNotification(err.message || 'Error al eliminar método', 'error');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleStatus = async (cardId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/cards/${cardId}/toggle`, {
        method: 'PATCH',
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        const json = await res.json();
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, isActive: json.data.is_active } : c));
        showNotification(`Estado de la tarjeta #${cardId} actualizado.`);
      }
    } catch (err) {
      showNotification('Error al cambiar estado.', 'error');
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setEditFormData({
      businessName: card.businessName,
      slogan: card.slogan,
      targetUrl: card.targetUrl,
      category: card.category,
      avatar: card.avatar,
      tier: card.tier,
      amountPaid: card.amountPaid,
      isActive: card.isActive
    });
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingCard) return;

    try {
      setIsSaving(true);
      const res = await fetch(`http://localhost:5000/api/admin/cards/${editingCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'venfi-admin-2026'
        },
        body: JSON.stringify(editFormData)
      });

      if (res.ok) {
        showNotification('Tarjeta del ranking actualizada exitosamente.');
        setEditingCard(null);
        fetchCards();
      } else {
        const errJson = await res.json();
        showNotification(errJson.message || 'Error al guardar cambios', 'error');
      }
    } catch (err) {
      showNotification('Error de conexión con el servidor', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar y procesar renovación
  const handleConfirmRenew = async () => {
    if (!renewingCard) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/cards/${renewingCard.id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'venfi-admin-2026'
        },
        body: JSON.stringify({ durationHours: Number(renewHours) })
      });

      if (res.ok) {
        showNotification(`Pauta #${renewingCard.position} extendida por ${renewHours} horas.`);
        setRenewingCard(null);
        fetchCards();
      }
    } catch (err) {
      showNotification('Error al renovar tarjeta.', 'error');
    }
  };

  // Restablecer / Eliminar tarjeta
  const handleDeleteCard = async (card) => {
    const confirm = window.confirm(`¿Estás seguro de restablecer la tarjeta de la Posición #${card.position} (${card.businessName}) a espacio disponible?`);
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/cards/${card.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': 'venfi-admin-2026' }
      });
      if (res.ok) {
        showNotification(`Puesto #${card.position} restablecido a espacio disponible.`);
        fetchCards();
      }
    } catch (err) {
      showNotification('Error al eliminar tarjeta', 'error');
    }
  };

  // Filtrado de tarjetas
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.slogan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = tierFilter === 'ALL' || card.tier.toLowerCase() === tierFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && card.isActive) ||
      (statusFilter === 'INACTIVE' && !card.isActive);

    return matchesSearch && matchesTier && matchesStatus;
  });

  // KPIs Resumen
  const totalRevenue = cards.reduce((acc, c) => acc + (c.amountPaid || 0), 0);
  const activeCount = cards.filter(c => c.isActive).length;
  const totalClicks = cards.reduce((acc, c) => acc + (c.clicksReceived || 0), 0);
  const totalViews = cards.reduce((acc, c) => acc + (c.viewsReceived || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2rem 0 5rem 0', color: 'var(--text-primary)' }}>
      <div className="container">
        {/* Banner Superior & Navegación */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <button
              onClick={onBackToPortal}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', marginBottom: '0.75rem' }}
            >
              <ArrowLeft size={16} /> Volver al Portal Principal
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.5rem',
                borderRadius: '10px'
              }}>
                <ShieldCheck size={24} color="#ef4444" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Panel de Administración del Ranking
                </h1>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Gestión integral de anunciantes, edición directa, moderación y renovación de pautas Top 10
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                fetchCards();
                fetchPendingPayments();
                fetchBankConfig();
                fetchAllPaymentMethods();
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
            >
              <RefreshCw size={15} className={loading || loadingPending || loadingMethods ? 'animate-spin' : ''} />
              <span>Sincronizar Todo</span>
            </button>
          </div>
        </div>

        {/* Notificación Toast Flotante */}
        {actionMessage && (
          <div style={{
            background: actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 245, 155, 0.9)',
            color: '#030712',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
          }}>
            {actionMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{actionMessage.msg}</span>
          </div>
        )}

        {/* NAVEGACIÓN POR PESTAÑAS DEL PANEL ADMIN */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            style={{
              background: activeTab === 'cards' ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'cards' ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              color: activeTab === 'cards' ? 'var(--color-primary)' : 'var(--text-secondary)',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Crown size={16} />
            <span>Tarjetas del Ranking (Top 10)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment-methods')}
            style={{
              background: activeTab === 'payment-methods' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'payment-methods' ? '1.5px solid var(--color-gold)' : '1px solid var(--border-subtle)',
              color: activeTab === 'payment-methods' ? 'var(--color-gold)' : 'var(--text-secondary)',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <CreditCard size={16} />
            <span>Métodos de Pago</span>
            <span style={{
              background: 'rgba(251, 191, 36, 0.2)',
              color: 'var(--color-gold)',
              fontSize: '0.72rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              fontWeight: 800
            }}>
              {allPaymentMethods.filter(m => m.is_active).length}/{allPaymentMethods.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pagomovil')}
            style={{
              background: activeTab === 'pagomovil' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'pagomovil' ? '1.5px solid var(--color-blue)' : '1px solid var(--border-subtle)',
              color: activeTab === 'pagomovil' ? 'var(--color-blue)' : 'var(--text-secondary)',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Smartphone size={16} />
            <span>Verificación Pago Móvil (VES)</span>
            {pendingPayments.length > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.72rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: 900
              }}>
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bank_config')}
            style={{
              background: activeTab === 'bank_config' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'bank_config' ? '1.5px solid var(--color-gold)' : '1px solid var(--border-subtle)',
              color: activeTab === 'bank_config' ? 'var(--color-gold)' : 'var(--text-secondary)',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={16} />
            <span>Configuración Bancaria (Receptor)</span>
          </button>
        </div>

        {/* =========================================================================
            PESTAÑA 1: GESTIÓN DE TARJETAS DEL RANKING (TOP 10)
           ========================================================================= */}
        {activeTab === 'cards' && (
          <>
            {/* 4 TARJETAS KPI DE RESUMEN ADMINISTRATIVO */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
          {/* KPI 1 */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Tarjetas Totales
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '0.35rem' }}>
              {cards.length} / 10
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>100% de cobertura de ranking</span>
          </div>

          {/* KPI 2 */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(0, 245, 155, 0.3)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Pautas Activas
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '0.35rem' }}>
              {activeCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Visibles en la página principal</span>
          </div>

          {/* KPI 3 */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Tráfico Total Generado
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)', marginTop: '0.35rem' }}>
              {totalClicks.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {totalViews.toLocaleString()} impresiones
            </span>
          </div>

          {/* KPI 4 */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Recaudación Registrada
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.35rem' }}>
              ${totalRevenue.toFixed(2)} USD
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Binance Pay & Zelle</span>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Buscador */}
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre de negocio, eslogan o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(6, 10, 18, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem 0.65rem 2.8rem',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Filtro Tier */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                style={{
                  background: 'rgba(6, 10, 18, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <option value="ALL">Todos los Niveles</option>
                <option value="gold">🥇 Oro (Puesto 1)</option>
                <option value="silver">🥈 Plata (Puestos 2-3)</option>
                <option value="dark">⬛ Estándar (Puestos 4-10)</option>
              </select>

              {/* Filtro Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: 'rgba(6, 10, 18, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <option value="ALL">Todos los Estados</option>
                <option value="ACTIVE">🟢 Activos</option>
                <option value="INACTIVE">🔴 Desactivados</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLA PRINCIPAL DE GESTIÓN DE TARJETAS */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Posición</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Negocio / Marca</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Categoría</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Métricas (Clics / Vistas / CTR)</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Vigencia</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Estado</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const ctr = card.viewsReceived > 0 
                    ? ((card.clicksReceived / card.viewsReceived) * 100).toFixed(1) 
                    : 0;

                  return (
                    <tr 
                      key={card.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.2s',
                        background: !card.isActive ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                      }}
                    >
                      {/* Posición & Tier Badge */}
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: card.position === 1 ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' : (card.position <= 3 ? 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)' : 'rgba(255,255,255,0.08)'),
                            color: card.position <= 3 ? '#030712' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.95rem'
                          }}>
                            #{card.position}
                          </span>
                          {card.position === 1 && (
                            <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                              VIP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Negocio & Eslogan */}
                      <td style={{ padding: '1.25rem', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{card.avatar || '🚀'}</span>
                          <div>
                            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                              {card.businessName}
                            </div>
                            <p style={{
                              margin: '0.25rem 0',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {card.slogan}
                            </p>
                            <a
                              href={card.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-primary)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <span>{card.targetUrl}</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td style={{ padding: '1.25rem' }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {card.category || 'General'}
                        </span>
                      </td>

                      {/* Métricas */}
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ffffff', fontWeight: 700 }}>
                            <MousePointer size={13} color="var(--color-primary)" />
                            <span>{card.clicksReceived.toLocaleString()} clics</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                            <Eye size={12} />
                            <span>{card.viewsReceived.toLocaleString()} vistas • CTR {ctr}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Vigencia */}
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Clock size={14} color="var(--color-gold)" />
                          <span style={{
                            fontWeight: 700,
                            color: card.hoursRemaining > 0 ? '#ffffff' : 'var(--color-coral)'
                          }}>
                            {card.hoursRemaining > 0 ? `${card.hoursRemaining}h restantes` : 'Expirada / Permanente'}
                          </span>
                        </div>
                      </td>

                      {/* Estado Toggle */}
                      <td style={{ padding: '1.25rem' }}>
                        <button
                          onClick={() => handleToggleStatus(card.id)}
                          style={{
                            background: card.isActive ? 'rgba(0, 245, 155, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: card.isActive ? 'var(--color-primary)' : 'var(--color-coral)',
                            border: `1px solid ${card.isActive ? 'rgba(0, 245, 155, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          title="Clic para cambiar estado"
                        >
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: card.isActive ? 'var(--color-primary)' : 'var(--color-coral)'
                          }}></span>
                          <span>{card.isActive ? 'Activo' : 'Desactivado'}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {/* Editar */}
                          <button
                            onClick={() => handleOpenEdit(card)}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.65rem' }}
                            title="Editar datos de la tarjeta"
                          >
                            <Edit3 size={15} color="#38bdf8" />
                          </button>

                          {/* Renovar */}
                          <button
                            onClick={() => setRenewingCard(card)}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.65rem' }}
                            title="Extender tiempo de pauta"
                          >
                            <RefreshCw size={15} color="var(--color-gold)" />
                          </button>

                          {/* Restablecer / Eliminar */}
                          <button
                            onClick={() => handleDeleteCard(card)}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.65rem' }}
                            title="Restablecer a espacio disponible"
                          >
                            <Trash2 size={15} color="var(--color-coral)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* =========================================================================
            PESTAÑA: GESTIÓN DE MÉTODOS DE PAGO
           ========================================================================= */}
        {activeTab === 'payment-methods' && (
          <div>
            {/* Banner Informativo y Botones de Acción */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={22} color="var(--color-gold)" />
                    <span>Gestión Modular de Métodos de Pago</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
                    Activa, desactiva o agrega nuevos métodos de pago (Zinli, Apolo Pay, PayPal, etc.). Los cambios impactan en tiempo real al modal de anuncios.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={fetchAllPaymentMethods}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                  >
                    <RefreshCw size={14} className={loadingMethods ? 'animate-spin' : ''} />
                    <span>Actualizar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreateMethodModal}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Plus size={16} />
                    <span>Nuevo Método de Pago</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPIs de Métodos de Pago */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Métodos
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>
                  {allPaymentMethods.length}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Registrados en sistema
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(0, 245, 155, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Activos en Producción
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                  {allPaymentMethods.filter(m => m.is_active).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Visibles para el cliente
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Verificación Manual
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-blue)', marginTop: '0.2rem' }}>
                  {allPaymentMethods.filter(m => m.requires_approval).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Exigen referencia y captura
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Automáticos / Webhook
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-gold)', marginTop: '0.2rem' }}>
                  {allPaymentMethods.filter(m => !m.requires_approval).length}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Activación instantánea
                </span>
              </div>
            </div>

            {/* Listado de Métodos de Pago en Tarjetas */}
            {loadingMethods ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <RefreshCw size={36} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Cargando pasarelas de pago configuradas...</p>
              </div>
            ) : allPaymentMethods.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <CreditCard size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 }}>No hay métodos de pago configurados</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                  Haz clic en el botón a continuación para agregar tu primera pasarela de pago.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateMethodModal}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Agregar Primer Método</span>
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {allPaymentMethods.map((method) => {
                  const isCore = ['binance', 'zelle', 'pago_movil'].includes(method.key);
                  const fieldEntries = Object.entries(method.fields || {});

                  return (
                    <div
                      key={method.key}
                      className="glass-panel"
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: method.is_active 
                          ? '1.5px solid rgba(0, 245, 155, 0.35)' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        background: method.is_active
                          ? 'linear-gradient(135deg, rgba(6, 10, 18, 0.85) 0%, rgba(15, 23, 42, 0.7) 100%)'
                          : 'rgba(6, 10, 18, 0.5)',
                        opacity: method.is_active ? 1 : 0.75,
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <div>
                        {/* Cabecera de la Tarjeta del Método */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem'
                            }}>
                              {method.icon || '💳'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                                  {method.name}
                                </h4>
                                <span style={{
                                  fontSize: '0.68rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: 'var(--text-muted)',
                                  fontWeight: 700
                                }}>
                                  #{method.sort_order}
                                </span>
                              </div>
                              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                key: {method.key} {isCore && '• Nativo'}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch Activo / Inactivo */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleMethodActive(method)}
                              title={method.is_active ? 'Desactivar método' : 'Activar método'}
                              style={{
                                width: '48px',
                                height: '26px',
                                borderRadius: '9999px',
                                background: method.is_active ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)',
                                border: 'none',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.25s',
                                padding: 0
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#0f172a',
                                position: 'absolute',
                                top: '3px',
                                left: method.is_active ? '25px' : '3px',
                                transition: 'left 0.25s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {method.is_active ? (
                                  <Check size={12} color="var(--color-primary)" strokeWidth={3} />
                                ) : (
                                  <X size={12} color="#94a3b8" strokeWidth={3} />
                                )}
                              </div>
                            </button>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              color: method.is_active ? 'var(--color-primary)' : 'var(--text-muted)'
                            }}>
                              {method.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>

                        {/* Descripción */}
                        <p style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4',
                          margin: '0 0 0.85rem 0',
                          minHeight: '2.4rem'
                        }}>
                          {method.description || 'Sin descripción configurada.'}
                        </p>

                        {/* Badge de Modalidad */}
                        <div style={{ marginBottom: '1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            background: method.requires_approval ? 'rgba(56, 189, 248, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                            color: method.requires_approval ? 'var(--color-blue)' : 'var(--color-gold)',
                            border: `1px solid ${method.requires_approval ? 'rgba(56, 189, 248, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
                          }}>
                            {method.requires_approval ? '📝 Verificación Manual (Comprobante)' : '⚡ Confirmación Automática (Webhook)'}
                          </span>
                        </div>

                        {/* Campos de Transferencia Configurables */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '1rem'
                        }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                            Datos Visibles al Cliente ({fieldEntries.length}):
                          </span>
                          {fieldEntries.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Sin campos adicionales configurados
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {fieldEntries.map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}:</span>
                                  <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {String(v)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.6rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingTop: '0.85rem'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditMethodModal(method)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Edit3 size={14} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMethod(method)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.8rem',
                            color: 'var(--color-coral)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          title={isCore ? 'Desactivar método nativo' : 'Eliminar método'}
                        >
                          <Trash2 size={14} />
                          <span>{isCore ? 'Desactivar' : 'Eliminar'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 2: VERIFICACIÓN Y APROBACIÓN DE PAGO MÓVIL (VES)
           ========================================================================= */}
        {activeTab === 'pagomovil' && (
          <div>
            {/* Banner Informativo */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={22} color="var(--color-blue)" />
                    <span>Bandeja de Pagos Móviles Pendientes de Verificación</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
                    Verifica el número de referencia y comprobante en la cuenta BNC. Al aprobar, el anuncio se activa de inmediato en el Ranking Top 10.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchPendingPayments}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                >
                  <RefreshCw size={14} className={loadingPending ? 'animate-spin' : ''} />
                  <span>Actualizar Pendientes</span>
                </button>
              </div>
            </div>

            {/* KPIs de Pago Móvil */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div className="glass-panel" style={{ padding: '1.25rem', borderColor: pendingPayments.length > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Pagos por Conciliar
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: pendingPayments.length > 0 ? '#ef4444' : 'var(--color-emerald)', marginTop: '0.35rem' }}>
                  {pendingPayments.length}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {pendingPayments.length === 1 ? '1 transacción requiere revisión' : `${pendingPayments.length} transacciones en espera`}
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total en Espera (USD)
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.35rem' }}>
                  ${pendingPayments.reduce((acc, p) => acc + Number(p.amount_usd || 0), 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Monto pendiente por ingresar</span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(0, 245, 155, 0.3)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Monto Estimado en Bolívares
                </span>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '0.35rem' }}>
                  Bs. {pendingPayments.reduce((acc, p) => acc + (Number(p.amount_usd || 0) * 807.39), 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tasa BCV oficial calculada</span>
              </div>
            </div>

            {/* Tabla de Pendientes */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Órdenes de Pago Móvil Recibidas ({pendingPayments.length})
                </h3>
              </div>

              {pendingPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(0, 245, 155, 0.1)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <CheckCircle2 size={32} color="var(--color-primary)" />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                    ¡Bandeja al día!
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                    No hay solicitudes de Pago Móvil pendientes de verificación. Todos los comprobantes han sido conciliados.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Orden / Fecha</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Anuncio & Posición</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Monto a Verificar</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Referencia Bancaria</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Comprobante</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.map((p) => {
                        const amountVes = (Number(p.amount_usd || 0) * 807.39);
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {/* Orden & Fecha */}
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                                {p.id}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {p.created_at ? new Date(p.created_at).toLocaleString('es-VE') : 'Reciente'}
                              </div>
                            </td>

                            {/* Anuncio */}
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontSize: '1.4rem' }}>{p.avatar || '🚀'}</span>
                                <div>
                                  <div style={{ fontWeight: 800, color: '#ffffff' }}>{p.business_name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.slogan}</div>
                                  <span className={`badge badge-${p.position === 1 ? 'gold' : (p.position <= 3 ? 'blue' : 'emerald')}`} style={{ fontSize: '0.68rem', marginTop: '0.2rem' }}>
                                    PUESTO #{p.position}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Monto */}
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <div className="font-mono" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                                ${Number(p.amount_usd || 0).toFixed(2)} USD
                              </div>
                              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Bs. {amountVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </td>

                            {/* Referencia */}
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span className="font-mono" style={{
                                  background: 'rgba(255,255,255,0.06)',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  color: '#ffffff'
                                }}>
                                  {p.reference_number || 'Sin ref'}
                                </span>
                                {p.reference_number && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(p.reference_number, `ref_${p.id}`)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    title="Copiar número de referencia"
                                  >
                                    {copiedField === `ref_${p.id}` ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Comprobante */}
                            <td style={{ padding: '1rem 0.5rem' }}>
                              {p.proof_image_url ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(p.proof_image_url)}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <ImageIcon size={13} />
                                  <span>Ver Captura</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin imagen</span>
                              )}
                            </td>

                            {/* Acciones */}
                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleApprovePayment(p.id)}
                                  className="btn btn-primary"
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '0.45rem 0.85rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                  }}
                                  title="Aprobar Pago y Activar en Ranking"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Aprobar</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingPayment(p);
                                    setRejectNotes('Referencia bancaria no encontrada o fondos no confirmados en BNC.');
                                  }}
                                  className="btn btn-secondary"
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '0.45rem 0.75rem',
                                    color: 'var(--color-coral)',
                                    borderColor: 'rgba(239, 68, 68, 0.4)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                  }}
                                  title="Rechazar Pago"
                                >
                                  <XCircle size={14} />
                                  <span>Rechazar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 3: CONFIGURACIÓN BANCARIA DEL RECEPTOR
           ========================================================================= */}
        {activeTab === 'bank_config' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Formulario de Configuración */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <Building size={22} color="var(--color-gold)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Datos Bancarios del Receptor
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Estos datos se muestran en el modal de pago y alimentan el generador de código QR interbancario de Pago Móvil.
              </p>

              <form onSubmit={handleSaveBankConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Nombre Comercial del Banco:
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.bank}
                    onChange={(e) => setBankConfig({ ...bankConfig, bank: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 10, 18, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                    placeholder="Ej: BNC (Banco Nacional de Crédito)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Código de Banco (4 dígitos):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={bankConfig.bankCode}
                      onChange={(e) => setBankConfig({ ...bankConfig, bankCode: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(6, 10, 18, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                      }}
                      placeholder="0191"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Teléfono Receptor:
                    </label>
                    <input
                      type="text"
                      required
                      value={bankConfig.phone}
                      onChange={(e) => setBankConfig({ ...bankConfig, phone: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(6, 10, 18, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                      }}
                      placeholder="0412-4160819"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Cédula / RIF Receptor:
                    </label>
                    <input
                      type="text"
                      required
                      value={bankConfig.idNumber}
                      onChange={(e) => setBankConfig({ ...bankConfig, idNumber: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(6, 10, 18, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                      }}
                      placeholder="V-11112387"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Titular de la Cuenta:
                    </label>
                    <input
                      type="text"
                      required
                      value={bankConfig.beneficiaryName}
                      onChange={(e) => setBankConfig({ ...bankConfig, beneficiaryName: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(6, 10, 18, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Venfi Publicidad & Medios C.A."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingBankConfig}
                  className="btn btn-gold"
                  style={{ marginTop: '0.75rem', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} className={isSavingBankConfig ? 'animate-spin' : ''} />
                  <span>{isSavingBankConfig ? 'Guardando Configuración...' : 'Guardar Configuración Bancaria'}</span>
                </button>
              </form>
            </div>

            {/* Vista Previa en Vivo */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                👁️ Vista Previa para el Cliente
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Así verán los datos los anunciantes al seleccionar Pago Móvil en el modal de compra:
              </p>

              <div style={{
                background: 'rgba(6, 10, 18, 0.8)',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1.5px solid var(--color-primary)',
                boxShadow: '0 8px 30px rgba(0, 245, 155, 0.12)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Datos Oficiales de Pago Móvil:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Banco:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{bankConfig.bankCode} - {bankConfig.bank}</strong>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Teléfono:</span>
                    <strong className="font-mono" style={{ fontSize: '0.85rem', color: '#ffffff' }}>{bankConfig.phone}</strong>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cédula / RIF:</span>
                    <strong className="font-mono" style={{ fontSize: '0.85rem', color: '#ffffff' }}>{bankConfig.idNumber}</strong>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Titular:</span>
                    <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>{bankConfig.beneficiaryName}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Payload estándar generado para Apps Bancarias (QR):
                  </span>
                  <code style={{
                    display: 'block',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    wordBreak: 'break-all'
                  }}>
                    PAGOMOVIL|{bankConfig.bankCode}|{bankConfig.phone.replace(/[^0-9]/g, '')}|{bankConfig.idNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}|[montoVes]|[orderId]
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE EDICIÓN DE TARJETA
           ========================================================================= */}
        {editingCard && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              border: '1.5px solid var(--border-gold)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={20} color="var(--color-gold)" />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Editar Tarjeta (Posición #{editingCard.position})
                  </h3>
                </div>
                <button
                  onClick={() => setEditingCard(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Nombre de la Marca */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Nombre del Negocio o Marca:
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.businessName}
                    onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 10, 18, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                {/* Eslogan */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Eslogan o Propuesta de Valor:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editFormData.slogan}
                    onChange={(e) => setEditFormData({ ...editFormData, slogan: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 10, 18, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* URL de Destino */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Enlace de Destino (URL):
                  </label>
                  <input
                    type="url"
                    required
                    value={editFormData.targetUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, targetUrl: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(6, 10, 18, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#ffffff',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                {/* Categoría y Emoji */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Categoría:
                    </label>
                    <input
                      type="text"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(6, 10, 18, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Icono / Emoji:
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={editFormData.avatar}
                      onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(6, 10, 18, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#ffffff',
                        fontSize: '1.2rem',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-gold"
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE RENOVACIÓN DE VIGENCIA
           ========================================================================= */}
        {renewingCard && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              border: '1.5px solid var(--border-primary)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={20} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Extender Vigencia de Pauta
                  </h3>
                </div>
                <button
                  onClick={() => setRenewingCard(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Selecciona la cantidad de horas o días para extender la permanencia de <strong>{renewingCard.businessName}</strong> en el <strong>Puesto #{renewingCard.position}</strong>:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: '+24 Horas', val: 24 },
                  { label: '+48 Horas', val: 48 },
                  { label: '+7 Días', val: 168 }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setRenewHours(opt.val)}
                    style={{
                      background: renewHours === opt.val ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                      color: renewHours === opt.val ? '#030712' : '#ffffff',
                      border: `1px solid ${renewHours === opt.val ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRenewingCard(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRenew}
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} />
                  <span>Confirmar Extensión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE RECHAZO DE PAGO MÓVIL
           ========================================================================= */}
        {rejectingPayment && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1.5rem'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              border: '1.5px solid rgba(239, 68, 68, 0.6)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={22} color="var(--color-coral)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Rechazar Pago Móvil
                  </h3>
                </div>
                <button
                  onClick={() => setRejectingPayment(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Estás a punto de rechazar la orden <strong style={{ color: '#ffffff' }}>{rejectingPayment.id}</strong> para la marca <strong style={{ color: '#ffffff' }}>{rejectingPayment.business_name}</strong>.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Motivo o Notas del Rechazo (visible para el anunciante):
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(6, 10, 18, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    resize: 'none'
                  }}
                  placeholder="Ej: Referencia no encontrada en la cuenta bancaria de BNC..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRejectPayment}
                  className="btn btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
                >
                  <XCircle size={16} />
                  <span>Confirmar Rechazo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE PREVISUALIZACIÓN DE COMPROBANTE
           ========================================================================= */}
        {previewImage && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: '1.5rem'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '550px',
              width: '100%',
              padding: '1.5rem',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Captura del Comprobante Bancario
                </h4>
                <button
                  onClick={() => setPreviewImage(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: '#000000', borderRadius: '8px', overflow: 'hidden', maxHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <img
                  src={previewImage}
                  alt="Comprobante"
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400/0f172a/00f59b?text=Comprobante+Bancario';
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL DE CREACIÓN / EDICIÓN DE MÉTODO DE PAGO
           ========================================================================= */}
        {isMethodModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1.5rem',
            overflowY: 'auto'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '650px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1.5px solid var(--border-gold)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid var(--color-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}>
                    {methodFormData.icon || '💳'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      {editingMethodKey ? `Editar Método: ${methodFormData.name}` : 'Crear Nuevo Método de Pago'}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {editingMethodKey ? 'Actualiza los datos y campos receptores' : 'Configura una nueva pasarela (ej: Zinli, Apolo Pay, PayPal, etc.)'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMethodModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMethod}>
                {/* Fila 1: Clave Identificadora e Icono */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Clave Única (Key)*:
                    </label>
                    <input
                      type="text"
                      placeholder="ej: apolo_pay, zinli, paypal"
                      value={methodFormData.key}
                      disabled={!!editingMethodKey}
                      onChange={(e) => setMethodFormData({ ...methodFormData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      required
                      style={{
                        width: '100%',
                        background: editingMethodKey ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: editingMethodKey ? 'var(--text-muted)' : '#ffffff',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                      Identificador de backend (minúsculas, sin espacios).
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Icono (Emoji)*:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="💳"
                      value={methodFormData.icon}
                      onChange={(e) => setMethodFormData({ ...methodFormData, icon: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '1.1rem',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

                {/* Fila 2: Nombre comercial y Orden */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Nombre Comercial Visible*:
                    </label>
                    <input
                      type="text"
                      placeholder="ej: Apolo Pay (Cripto & USD)"
                      value={methodFormData.name}
                      onChange={(e) => setMethodFormData({ ...methodFormData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Orden (#):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={methodFormData.sort_order}
                      onChange={(e) => setMethodFormData({ ...methodFormData, sort_order: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

                {/* Fila 3: Descripción */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Instrucciones / Descripción para el Usuario:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones breves de cómo realizar el pago..."
                    value={methodFormData.description}
                    onChange={(e) => setMethodFormData({ ...methodFormData, description: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Fila 4: Flags / Checkboxes de Configuración */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#ffffff' }}>
                    <input
                      type="checkbox"
                      checked={methodFormData.is_active}
                      onChange={(e) => setMethodFormData({ ...methodFormData, is_active: e.target.checked })}
                      style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                    />
                    <span><strong>Activo:</strong> Mostrar inmediatamente este método en el modal de pago de anunciantes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#ffffff' }}>
                    <input
                      type="checkbox"
                      checked={methodFormData.requires_approval}
                      onChange={(e) => setMethodFormData({ ...methodFormData, requires_approval: e.target.checked })}
                      style={{ accentColor: 'var(--color-blue)', width: '18px', height: '18px' }}
                    />
                    <span><strong>Requiere Verificación Manual:</strong> El cliente debe ingresar número de referencia y adjuntar comprobante antes de la activación</span>
                  </label>
                </div>

                {/* Fila 5: Editor Dinámico de Campos (JSONB fields) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                        Campos Específicos del Receptor (JSONB):
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        Datos que el cliente podrá visualizar y copiar (ej: correo, teléfono, titular, banco, wallet, etc.).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMethodFieldPairs([...methodFieldPairs, { key: '', value: '' }])}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Plus size={14} />
                      <span>Agregar Campo</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {methodFieldPairs.map((pair, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Nombre del campo (ej: correo)"
                          value={pair.key}
                          onChange={(e) => {
                            const updated = [...methodFieldPairs];
                            updated[idx].key = e.target.value;
                            setMethodFieldPairs(updated);
                          }}
                          style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            padding: '0.55rem 0.75rem',
                            color: '#ffffff',
                            fontSize: '0.82rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Valor (ej: pagos@venfi.app)"
                          value={pair.value}
                          onChange={(e) => {
                            const updated = [...methodFieldPairs];
                            updated[idx].value = e.target.value;
                            setMethodFieldPairs(updated);
                          }}
                          style={{
                            flex: 2,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            padding: '0.55rem 0.75rem',
                            color: '#ffffff',
                            fontSize: '0.82rem'
                          }}
                        />
                        <button
                          type="button"
                          disabled={methodFieldPairs.length <= 1}
                          onClick={() => setMethodFieldPairs(methodFieldPairs.filter((_, i) => i !== idx))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: methodFieldPairs.length <= 1 ? 'rgba(255,255,255,0.2)' : 'var(--color-coral)',
                            cursor: methodFieldPairs.length <= 1 ? 'not-allowed' : 'pointer',
                            padding: '0.4rem'
                          }}
                          title="Eliminar campo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer de Acciones del Modal */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsMethodModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMethod}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    {isSavingMethod ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{editingMethodKey ? 'Guardar Cambios' : 'Crear Método'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
