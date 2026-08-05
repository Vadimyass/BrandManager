import React from 'react';

/**
 * Рамка телефона 402×874 (iPhone 15 Pro, логические px).
 * Только оболочка для показа макета — на проде экраны рендерятся без неё.
 */
export default function PhoneFrame({ children, width = 402, height = 874 }) {
  return (
    <div
      style={{
        width,
        height,
        flex: 'none',
        borderRadius: 54,
        padding: 11,
        background: '#1A1B33',
        boxShadow: '0 24px 60px rgba(26,27,51,.22)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', background: '#FFFFFF' }}>
        {/* Dynamic Island */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 118, height: 34, borderRadius: 20, background: '#1A1B33', zIndex: 5 }} />
        {/* Статус-бар */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 600, color: '#1A1B33', zIndex: 6, pointerEvents: 'none' }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 1 }}>▮▮▮ ▲ ▉</span>
        </div>
        {children}
        {/* Home indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 140, height: 5, borderRadius: 3, background: 'rgba(26,27,51,.32)', zIndex: 6 }} />
      </div>
    </div>
  );
}
