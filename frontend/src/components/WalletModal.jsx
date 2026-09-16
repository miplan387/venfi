import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const WalletModal = ({ isOpen, onClose }) => {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnect = (walletName) => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setConnectedWallet(walletName);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 800);
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
        border: '1px solid var(--border-medium)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Wallet size={20} color="var(--color-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
            Web3 & Cripto
          </span>
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
          Conectar Billetera Digital
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Conecta tu wallet para pagos directos en USDT y gestión de tus pautas en el Ranking.
        </p>

        {connectedWallet ? (
          <div style={{
            background: 'rgba(0, 245, 155, 0.12)',
            border: '1px solid var(--color-primary)',
            borderRadius: '14px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={36} color="var(--color-primary)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ color: '#ffffff', fontWeight: 800 }}>¡{connectedWallet} Conectada!</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Dirección: 0x71C...4b9F
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'MetaMask', icon: '🦊', desc: 'Ethereum & BSC' },
              { name: 'Binance Web3 Wallet', icon: '🟡', desc: 'Ecosistema Binance' },
              { name: 'Trust Wallet', icon: '🛡️', desc: 'Móvil y multi-cadena' },
              { name: 'TronLink', icon: '⚡', desc: 'USDT TRC20 Red Tron' }
            ].map((w) => (
              <button
                key={w.name}
                onClick={() => handleConnect(w.name)}
                disabled={isConnecting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(6, 10, 18, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{w.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{w.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.desc}</div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" />
              </button>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '1.5rem',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={14} color="var(--color-primary)" />
          <span>Conexión cifrada sin custodia de claves privadas</span>
        </div>
      </div>
    </div>
  );
};
