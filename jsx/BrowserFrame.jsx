import React from 'react';

/**
 * Оболочка окна браузера 1280×800 для показа десктопных экранов.
 * На проде не используется — внутри лежит реальный layout приложения.
 */
export default function BrowserFrame({ children, url = 'app.melyo.io', width = 1280, height = 800 }) {
  return (
    <div style={{ width, flex: 'none', borderRadius: 14, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E7E4F3', boxShadow: '0 20px 50px rgba(26,27,51,.14)' }}>
      <div style={{ height: 42, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', background: '#F4F3FA', borderBottom: '1px solid #E7E4F3' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 24, borderRadius: 999, background: '#FFFFFF', border: '1px solid #E7E4F3', display: 'flex', alignItems: 'center', padding: '0 12px', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 500, color: '#6A7A82' }}>
          {url}
        </div>
      </div>
      <div style={{ height, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}
