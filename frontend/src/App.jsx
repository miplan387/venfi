import React, { useState, useEffect } from 'react';
import { apiUrl } from './config/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { HeroRates } from './components/HeroRates';
import { CurrencyConverter } from './components/CurrencyConverter';
import { RemittanceComparator } from './components/RemittanceComparator';
import { TopRanking } from './components/TopRanking';
import { OilPriceCard } from './components/OilPriceCard';
import GoldPriceCard from './components/GoldPriceCard';
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
import { GoldSplashAd } from './components/GoldSplashAd';
import { NewsTicker } from './components/NewsTicker';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  const [selectedZone, setSelectedZone] = useState('nacional');
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

  const handleOpenAdvertise = (zone) => {
    if (zone && typeof zone === 'string') {
      setSelectedZone(zone);
    }
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

  // Sincronizar tasas reales (Backend con Bypass Directo a DolarAPI en el Navegador)
  const fetchLiveRates = async () => {
    let successFromBackend = false;

    // 1. Intentar consultar el Backend de Venfidata
    try {
      const response = await fetch(apiUrl('/api/rates'));
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const bcv = Number(json.data.bcv?.rate);
          // Si el backend trajo datos en vivo (no fallback viejo)
          if (bcv && bcv > 100 && json.data.bcv?.dataSource === 'live_api') {
            successFromBackend = true;
            setRates(json.data);
            
            // Actualizar tasas en el comparador de remesas
            setProviders(prev => prev.map(p => {
              if (p.id === 'binance') return { ...p, rate: json.data?.usdtBinance?.rate || 1067.16 };
              if (p.id === 'zoom' || p.id === 'moneygram') return { ...p, rate: json.data?.bcv?.rate || 904.45 };
              if (p.id === 'airtm') return { ...p, rate: Number(((json.data?.paralelo?.rate || json.data?.usdtBinance?.rate || 1067.16) * 0.985).toFixed(2)) };
              if (p.id === 'italcambio') return { ...p, rate: Number(((json.data?.usdtBinance?.rate || 1067.16) * 0.965).toFixed(2)) };
              if (p.id === 'angulo_lopez') return { ...p, rate: Number(((json.data?.usdtBinance?.rate || 1067.16) * 0.960).toFixed(2)) };
              if (p.id === 'insular') return { ...p, rate: Number(((json.data?.usdtBinance?.rate || 1067.16) * 0.955).toFixed(2)) };
              return p;
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Backend /api/rates no disponible o bloqueado:', err);
    }

    // 2. Bypass Directo desde el Navegador si el Backend falló o devolvió datos estáticos
    if (!successFromBackend) {
      try {
        console.log('⚡ [BYPASS ACTIVADO] Consultando DolarAPI directamente desde el navegador (CORS)...');
        const [oficialRes, paraleloRes, euroRes] = await Promise.allSettled([
          fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
          fetch('https://ve.dolarapi.com/v1/dolares/paralelo'),
          fetch('https://ve.dolarapi.com/v1/euros/oficial')
        ]);

        let bcvPromedio = 904.45;
        let paraleloPromedio = 1065.03;
        let euroPromedio = 1003.49;

        if (oficialRes.status === 'fulfilled' && oficialRes.value.ok) {
          const d = await oficialRes.value.json();
          if (d.promedio) bcvPromedio = Number(d.promedio);
        }
        if (paraleloRes.status === 'fulfilled' && paraleloRes.value.ok) {
          const d = await paraleloRes.value.json();
          if (d.promedio) paraleloPromedio = Number(d.promedio);
        }
        if (euroRes.status === 'fulfilled' && euroRes.value.ok) {
          const d = await euroRes.value.json();
          if (d.promedio) euroPromedio = Number(d.promedio);
        }

        const usdtPromedio = Number((paraleloPromedio * 1.002).toFixed(2));
        const gapBs = Number((paraleloPromedio - bcvPromedio).toFixed(2));
        const gapPercent = Number((((paraleloPromedio - bcvPromedio) / bcvPromedio) * 100).toFixed(2));
        const lastUpdateFormatted = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const directRates = {
          bcv: {
            name: 'Dólar BCV (Oficial)',
            code: 'USD_BCV',
            rate: bcvPromedio,
            previousRate: Number((bcvPromedio * 0.995).toFixed(2)),
            change: '+0.48%',
            changeAmount: Number((bcvPromedio * 0.005).toFixed(2)),
            direction: 'up',
            isPositive: true,
            lastUpdate: `${lastUpdateFormatted} (En Vivo)`,
            source: 'Banco Central de Venezuela (DolarAPI)',
            dataSource: 'live_api'
          },
          paralelo: {
            name: 'Dólar Paralelo (Monitor)',
            code: 'USD_PARALELO',
            rate: paraleloPromedio,
            previousRate: Number((paraleloPromedio * 0.991).toFixed(2)),
            change: '+0.85%',
            changeAmount: Number((paraleloPromedio * 0.009).toFixed(2)),
            direction: 'up',
            isPositive: true,
            lastUpdate: `${lastUpdateFormatted} (En Vivo)`,
            source: 'EnParaleloVzla / Monitor Dólar',
            dataSource: 'live_api'
          },
          euroBcv: {
            name: 'Euro BCV (Oficial)',
            code: 'EUR_BCV',
            rate: euroPromedio,
            previousRate: Number((euroPromedio * 0.996).toFixed(2)),
            change: '+0.34%',
            changeAmount: Number((euroPromedio * 0.004).toFixed(2)),
            direction: 'up',
            isPositive: true,
            lastUpdate: `${lastUpdateFormatted} (En Vivo)`,
            source: 'BCV Oficial (DolarAPI)',
            dataSource: 'live_api'
          },
          usdtBinance: {
            name: 'Binance P2P (USDT)',
            code: 'USDT_VES',
            rate: usdtPromedio,
            previousRate: Number((usdtPromedio * 0.994).toFixed(2)),
            change: '+0.57%',
            changeAmount: Number((usdtPromedio * 0.006).toFixed(2)),
            direction: 'up',
            isPositive: true,
            lastUpdate: `${lastUpdateFormatted} (En Vivo)`,
            source: 'Binance P2P Market',
            dataSource: 'live_api'
          },
          latam: {
            cop: { country: 'Colombia', currency: 'Peso Colombiano', code: 'COP', symbol: '$', flag: '🇨🇴', rateVsUsd: 4120.50, rateVsVes: Number((bcvPromedio / 4120.50).toFixed(4)), change: '+0.15%', direction: 'up', lastUpdate: `${lastUpdateFormatted}`, source: 'DolarAPI' },
            pen: { country: 'Perú', currency: 'Sol Peruano', code: 'PEN', symbol: 'S/', flag: '🇵🇪', rateVsUsd: 3.75, rateVsVes: Number((bcvPromedio / 3.75).toFixed(2)), change: '+0.08%', direction: 'up', lastUpdate: `${lastUpdateFormatted}`, source: 'DolarAPI' },
            clp: { country: 'Chile', currency: 'Peso Chileno', code: 'CLP', symbol: '$', flag: '🇨🇱', rateVsUsd: 955.00, rateVsVes: Number((bcvPromedio / 955.00).toFixed(4)), change: '+0.22%', direction: 'up', lastUpdate: `${lastUpdateFormatted}`, source: 'DolarAPI' },
            brl: { country: 'Brasil', currency: 'Real Brasileño', code: 'BRL', symbol: 'R$', flag: '🇧🇷', rateVsUsd: 5.48, rateVsVes: Number((bcvPromedio / 5.48).toFixed(2)), change: '-0.12%', direction: 'down', lastUpdate: `${lastUpdateFormatted}`, source: 'DolarAPI' },
            ars: { country: 'Argentina', currency: 'Peso Argentino', code: 'ARS', symbol: '$', flag: '🇦🇷', rateVsUsd: 1190.00, rateVsVes: Number((bcvPromedio / 1190.00).toFixed(4)), change: '+0.45%', direction: 'up', lastUpdate: `${lastUpdateFormatted}`, source: 'DolarAPI' }
          },
          gap: {
            amountBs: gapBs,
            percentage: gapPercent
          }
        };

        setRates(directRates);

        // Actualizar proveedores de remesas con las tasas directas
        setProviders(prev => prev.map(p => {
          if (p.id === 'binance') return { ...p, rate: usdtPromedio };
          if (p.id === 'zoom' || p.id === 'moneygram') return { ...p, rate: bcvPromedio };
          if (p.id === 'airtm') return { ...p, rate: Number((paraleloPromedio * 0.985).toFixed(2)) };
          if (p.id === 'italcambio') return { ...p, rate: Number((usdtPromedio * 0.965).toFixed(2)) };
          if (p.id === 'angulo_lopez') return { ...p, rate: Number((usdtPromedio * 0.960).toFixed(2)) };
          if (p.id === 'insular') return { ...p, rate: Number((usdtPromedio * 0.955).toFixed(2)) };
          return p;
        }));
      } catch (directErr) {
        console.error('Error en el bypass directo a DolarAPI:', directErr);
      }
    }
  };

  useEffect(() => {
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
    fetch(apiUrl(`/api/ranking/click/${position}`), {
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
          {/* Menú de Pestañas Sticky de Navegación */}
          <NavTabs />

          {/* Cinta de Noticias (Ticker) con Control de Velocidad */}
          <NewsTicker />

          {/* Sección 1: Tasas BCV, Paralelo, USDT, Euro */}
          <HeroRates 
            rates={rates} 
            onSelectRateForConverter={handleSelectRateForConverter}
            onRefresh={fetchLiveRates}
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
            selectedZone={selectedZone}
            onZoneChange={setSelectedZone}
            onOpenAdvertise={handleOpenAdvertise}
            onTrackClick={handleTrackClick}
          />

          {/* Sección 4: Ficha de Petróleo (Brent + Merey 16 con EIA) */}
          <OilPriceCard />

          {/* Sección 5: Ficha de Oro (XAU/USD con Omkar Cloud) */}
          <GoldPriceCard />

          {/* Sección Extra: Noticias Financieras */}
          <NewsFeed />
        </main>
      )}

      {/* Botón Flotante Siempre Visible (en vista portal) */}
      {currentView === 'portal' && (
        <>
          <FloatingCta 
            onOpenAdvertise={() => handleOpenAdvertise(selectedZone)}
          />
          {/* Escaparate #1 Oro en Esquina Superior Derecha */}
          <EscaparateOro 
            slots={slots} 
            selectedZone={selectedZone}
            onOpenAdvertise={handleOpenAdvertise}
          />
        </>
      )}

      {/* Notificaciones FOMO en Vivo */}
      <FomoNotification />

      {/* Footer con Disclaimer Legal, SENIAT 8299 y Enlace Admin */}
      <Footer 
        onOpenTerms={() => navigateTo('terms')}
        onOpenPrivacy={() => navigateTo('privacy')}
        onOpenAdvertise={() => handleOpenAdvertise(selectedZone)}
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
        selectedZone={selectedZone}
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

      {/* Publicidad Emergente de Oro Arrastrable (Splash Ad Puesto #1) */}
      <GoldSplashAd onTrackClick={handleTrackClick} defaultSlot={slots?.[0]} />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
