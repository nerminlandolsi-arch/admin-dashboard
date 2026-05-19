import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Users, MapPin,
  Bell, LogOut, Menu, X, ChevronRight, Truck
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/colis',      icon: Package,          label: 'Gestion colis'   },
  { to: '/livreurs',   icon: Users,            label: 'Livreurs'        },
  { to: '/carte',      icon: MapPin,           label: 'Carte GPS'       },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #ffffff10', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Truck size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>DeliveryAdmin</div>
            <div style={{ color: '#64748B', fontSize: 11 }}>Panneau de contrôle</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: '#64748B', cursor: 'pointer', padding: 4, flexShrink: 0,
          display: 'flex', alignItems: 'center'
        }}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '12px 16px' : '11px 14px',
            borderRadius: 10, textDecoration: 'none',
            background: isActive ? 'linear-gradient(135deg, #3B82F620, #3B82F610)' : 'transparent',
            color: isActive ? '#60A5FA' : '#94A3B8',
            fontWeight: isActive ? 600 : 400,
            fontSize: 14,
            borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
            transition: 'all 0.15s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          })}>
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
            {!collapsed && <ChevronRight size={14} style={{ opacity: 0.4 }} />}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #ffffff10' }}>
        {!collapsed && user && (
          <div style={{ padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>{user.nom} {user.prenom}</div>
            <div style={{ color: '#64748B', fontSize: 11 }}>Administrateur</div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 12, padding: '11px 14px', borderRadius: 10,
          background: 'none', border: 'none', color: '#EF4444',
          cursor: 'pointer', fontSize: 14,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <LogOut size={18} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
