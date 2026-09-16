import React from 'react';
import { Newspaper, ExternalLink, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { initialNews } from '../data/mockData';

export const NewsFeed = () => {
  return (
    <section id="noticias" style={{ padding: '2rem 0 3.5rem 0' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <Newspaper size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Actualidad Económica
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Noticias Financieras de Venezuela
            </h3>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Fuentes verificadas en tiempo real
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {initialNews.map((news) => (
            <div
              key={news.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                    {news.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} /> {news.time}
                  </span>
                </div>

                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.45,
                  marginBottom: '0.75rem'
                }}>
                  {news.title}
                </h4>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{news.source}</span>
                <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Leer <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
