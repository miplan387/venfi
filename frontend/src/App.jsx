import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroRates } from './components/HeroRates';
import { CurrencyConverter } from './components/CurrencyConverter';
import { RemittanceComparator } from './components/RemittanceComparator';
import { TopRanking } from './components/TopRanking';
import { NewsFeed } from './components/NewsFeed';
import { FloatingCta } from './components/FloatingCta';
import { EscaparateOro } from './components/EscaparateOro';
import { FomoNotification } from './components/FomoNotification';
import { AdvertiseModal } from './components/AdvertiseModal';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { TermsModal } from './components/TermsModal';
import { Notifications } from './components/Notifications';
import { Dashboard } from './pages/Dashboard';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { AdminCards } from './pages/AdminCards';
import { ResetPassword } from './pages/ResetPassword';
import { Footer } from './components/Footer';

import { 
  initialExchangeRates, 
  initialRemittanceProviders, 
  initialRankingSlots 
} from './data/mockData';

export function AppContent() {
  const { isAuthenticated } = useAuth();
  const [rates, setRates] = useState(initialExchangeRates);
  const [providers, setProviders] = useState(initialRemittanceProviders);
  const [slots, setSlots] = useState(initialRankingSlots);
  const [selectedRateKey, setSelectedRateKey] = useState('bcv');
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/reset-password') || search.includes('token=')) {
      return 'reset_password';
    }
    if (path.includes('/admin/cards') || window.location.hash.includes('admin')) {
      return 'admin_cards';
    }
    return 'portal';
  }); // 'portal' | 'dashboard' | 'terms' | 'privacy' | 'admin_cards' | 'reset_password'

  // Modals state
  const [isAdvertiseOpen, setIsAdvertiseOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleOpenAdvertise = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    } else {
      setIsAdvertiseOpen(true);
    }
  };

  const handleToggleDashboard = () => {
    if (!isAuthenticated && currentView !== 'dashboard') {
      setIsAuthOpen(true);
    } else {
      navigateTo(currentView === 'dashboard' ? 'portal' : 'dashboard');
    }
  };

  // Sincronizar tasas reales desde el Backend API
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rates');
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            setRates(json.data);
            
            // Actualizar tasas en el comparador de remesas
            setProviders(prev => prev.map(p => {
              if (p.id === 'binance') return { ...p, rate: json.data.usdtBinance.rate };
              if (p.id === 'zoom' || p.id === 'moneygram') return { ...p, rate: json.data.bcv.rate };
              if (p.id === 'airtm') return { ...p, rate: Number((json.data.paralelo.rate * 0.985).toFixed(2)) };
              return p;
            }));
          }
        }
      } catch (err) {
        console.warn('Usando tasas locales de respaldo:', err);
      }
    };

    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 60000); // 60s TTL sync
    return () => clearInterval(interval);
  }, []);

  // Manejar click tracking para slots del ranking
  const handleTrackClick = (position) => {
    setSlots(prev => prev.map(s => {
      if (s.position === position) {
        return { ...s, clicks: (s.clicks || 0) + 1 };
      }
      return s;
    }));

    // Enviar click tracking al backend
    fetch(`http://localhost:5000/api/ranking/click/${position}`, {
      method: 'POST'
    }).catch(err => console.warn('Click tracking local:', err));
  };

  // Manejar creación/actualización de slot al completar pago
  const handleAddOrUpdateSlot = (newSlot) => {
    setSlots(prev => {
      // Si se pauta en la posición 1, desplazar el puesto 1 anterior al 2
      if (newSlot.position === 1) {
        const updated = prev.map(s => {
          if (s.position === 1) return { ...s, position: 2, tier: 'silver' };
          if (s.position === 2) return { ...s, position: 3, tier: 'silver' };
          if (s.position === 3) return { ...s, position: 4, tier: 'dark' };
          return s;
        });
        return [newSlot, ...updated.filter(s => s.position <= 10)].sort((a, b) => a.position - b.position);
      } else {
        return prev.map(s => s.position === newSlot.position ? newSlot : s);
      }
    });
  };

  // Selección rápida de tasa desde HeroRates al Convertidor
  const handleSelectRateForConverter = (rateKey) => {
    setSelectedRateKey(rateKey);
    const convElem = document.getElementById('convertidor');
    if (convElem) {
      convElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'admin_cards') {
      window.history.pushState(null, '', '/admin/cards');
    } else if (view === 'reset_password') {
      window.history.pushState(null, '', '/reset-password');
    } else {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="venfi-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header fijo */}
      <Header 
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenAdvertise={handleOpenAdvertise}
        onToggleDashboard={handleToggleDashboard}
        isDashboardActive={currentView === 'dashboard'}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content: Condicional según la vista actual */}
      {currentView === 'dashboard' && (
        <Dashboard 
          onBackToPortal={() => navigateTo('portal')}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />
      )}

      {currentView === 'admin_cards' && (
        <AdminCards 
          onBackToPortal={() => navigateTo('portal')} 
        />
      )}

      {currentView === 'terms' && (
        <Terms onBackToPortal={() => navigateTo('portal')} />
      )}

      {currentView === 'privacy' && (
        <Privacy onBackToPortal={() => navigateTo('portal')} />
      )}

      {currentView === 'reset_password' && (
        <ResetPassword 
          onBackToPortal={() => navigateTo('portal')}
          onOpenLogin={() => setIsAuthOpen(true)}
        />
      )}

      {currentView === 'portal' && (
        <main style={{ flex: 1 }}>
          {/* Sección 1: Tasas BCV, Paralelo, USDT, Euro */}
          <HeroRates 
            rates={rates} 
            onSelectRateForConverter={handleSelectRateForConverter}
          />

          {/* Convertidor Interactivo y Asistente de Vuelto */}
          <CurrencyConverter 
            rates={rates} 
            selectedRateKey={selectedRateKey}
          />

          {/* Sección 2: Comparador de Remesas a Venezuela */}
          <RemittanceComparator 
            providers={providers}
          />

          {/* Sección 3: Ranking Publicitario Top 10 con Puesto #1 VIP */}
          <TopRanking 
            slots={slots}
            onOpenAdvertise={handleOpenAdvertise}
            onTrackClick={handleTrackClick}
          />

          {/* Sección Extra: Noticias Financieras */}
          <NewsFeed />
        </main>
      )}

      {/* Botón Flotante Siempre Visible (en vista portal) */}
      {currentView === 'portal' && (
        <>
          <FloatingCta 
            onOpenAdvertise={handleOpenAdvertise}
          />
          {/* Escaparate #1 Oro en Esquina Superior Derecha */}
          <EscaparateOro slots={slots} />
        </>
      )}

      {/* Notificaciones FOMO en Vivo */}
      <FomoNotification />

      {/* Footer con Disclaimer Legal, SENIAT 8299 y Enlace Admin */}
      <Footer 
        onOpenTerms={() => navigateTo('terms')}
        onOpenPrivacy={() => navigateTo('privacy')}
        onOpenAdvertise={handleOpenAdvertise}
        onOpenAdmin={() => navigateTo('admin_cards')}
      />

      {/* MODALES */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenForgotPassword={() => {
          setIsAuthOpen(false);
          setIsForgotPasswordOpen(true);
        }}
        onSuccess={(user) => {
          console.log('Usuario autenticado:', user);
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AdvertiseModal 
        isOpen={isAdvertiseOpen}
        onClose={() => setIsAdvertiseOpen(false)}
        onAddOrUpdateSlot={handleAddOrUpdateSlot}
        onNavigateToTerms={() => {
          setIsAdvertiseOpen(false);
          navigateTo('terms');
        }}
        onNavigateToPrivacy={() => {
          setIsAdvertiseOpen(false);
          navigateTo('privacy');
        }}
      />

      <WalletModal 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      <TermsModal 
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <Notifications 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
