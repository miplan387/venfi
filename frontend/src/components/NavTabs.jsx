import React, { useState, useEffect } from 'react';

const NavTabs = () => {
  // Array de pestañas - fácil de extender en el futuro (ej. petróleo, oro)
  const tabs = [
    { id: 'tasas', label: 'Tasas', icon: '📈' },
    { id: 'convertidor', label: 'Convertidor', icon: '🧮' },
    { id: 'remesas', label: 'Remesas', icon: '💸' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
    { id: 'petroleo', label: 'Petróleo', icon: '🛢️' },
    { id: 'oro', label: 'Oro', icon: '🥇' },
    { id: 'noticias', label: 'Noticias', icon: '📰' },
  ];

  const [activeTab, setActiveTab] = useState('tasas');

  // Detectar la sección activa con Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.25, 
        rootMargin: '-120px 0px -40% 0px' 
      }
    );

    tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll suave a la sección respetando la altura del Header (76px) + NavTabs (~54px)
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerEl = document.querySelector('header');
      const headerHeight = headerEl ? headerEl.offsetHeight : 76;
      const navEl = document.querySelector('.venfi-nav-tabs') || document.querySelector('nav');
      const navHeight = navEl ? navEl.offsetHeight : 52;
      const offset = headerHeight + navHeight + 8; // Compensar Header + NavTabs con holgura visual
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav 
      className="venfi-nav-tabs sticky top-16 z-40 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800 shadow-lg"
      style={{
        position: 'sticky',
        top: '76px', // Altura exacta del Header para no superponerse
        zIndex: 90,
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium 
                whitespace-nowrap transition-all duration-300
                ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 shadow-lg shadow-yellow-500/30 scale-105 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60 border border-gray-800'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export { NavTabs };
export default NavTabs;
