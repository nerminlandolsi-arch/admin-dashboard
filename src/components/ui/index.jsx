import React from 'react';
import { getStatus, getPriorite } from '../../utils/helpers';

// ===== STATUS BADGE =====
export function StatusBadge({ status }) {
  const cfg = getStatus(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

// ===== PRIORITE BADGE =====
export function PrioритeBadge({ priorite }) {
  const cfg = getPriorite(priorite);
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
      color: cfg.color, border: `1px solid ${cfg.color}40`,
      background: `${cfg.color}10`,
    }}>
      {cfg.label}
    </span>
  );
}

// ===== STAT CARD =====
export function StatCard({ label, value, sub, icon, color = '#3B82F6', trend }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9',
      display: 'flex', flexDirection: 'column', gap: 4,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ fontSize: 12, color: trend >= 0 ? '#10B981' : '#EF4444', marginTop: 4, fontWeight: 600 }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs hier
        </div>
      )}
    </div>
  );
}

// ===== SPINNER =====
export function Spinner({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid #E2E8F0`, borderTopColor: '#3B82F6',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

// ===== MODAL =====
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: '#F1F5F9', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748B',
          }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ===== BUTTON =====
export function Btn({ children, onClick, variant = 'primary', disabled, small, style: s }) {
  const base = {
    padding: small ? '6px 14px' : '10px 20px',
    borderRadius: 10, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: small ? 13 : 14, fontWeight: 600, transition: 'all 0.15s',
    opacity: disabled ? 0.6 : 1, ...s,
  };
  const variants = {
    primary:   { background: '#3B82F6', color: 'white' },
    danger:    { background: '#EF4444', color: 'white' },
    success:   { background: '#10B981', color: 'white' },
    outline:   { background: 'transparent', color: '#3B82F6', border: '1px solid #3B82F6' },
    ghost:     { background: '#F1F5F9', color: '#334155' },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

// ===== INPUT =====
export function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <input {...props} style={{
        padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0',
        fontSize: 14, color: '#0F172A', outline: 'none',
        transition: 'border 0.15s',
        ...props.style,
      }}
        onFocus={e => e.target.style.borderColor = '#3B82F6'}
        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
      />
    </div>
  );
}

// ===== SELECT =====
export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <select {...props} style={{
        padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0',
        fontSize: 14, color: '#0F172A', background: 'white', cursor: 'pointer',
        ...props.style,
      }}>{children}</select>
    </div>
  );
}

// Inject global keyframes once
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
`;
document.head.appendChild(style);
