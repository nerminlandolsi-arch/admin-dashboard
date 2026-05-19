import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: 'admin@delivery.com', password: 'Admin@1234' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form.email, form.password);
      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        if (user.role !== 'ROLE_ADMIN') {
          toast.error('Accès réservé aux administrateurs');
          return;
        }
        login(accessToken, user);
        toast.success('Bienvenue ' + user.prenom + ' !');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Left panel - branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 48,
        display: 'none',
      }} className="login-left">
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Truck size={40} color="white" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>DeliveryAdmin</h1>
          <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 360 }}>
            Gérez vos livraisons, suivez vos livreurs en temps réel et analysez vos performances.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        width: '100%', maxWidth: 460, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: 'white', borderRadius: 24, padding: '44px 40px',
          width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Truck size={26} color="white" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Espace Admin
            </h2>
            <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
              Connectez-vous au panneau de contrôle
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0F172A',
                  outline: 'none', transition: 'border 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px', borderRadius: 12,
                    border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0F172A',
                    outline: 'none', transition: 'border 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3B82F6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: 'white', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginTop: 8,
            }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <div style={{
            marginTop: 20, padding: '12px 16px', background: '#F8FAFC',
            borderRadius: 10, border: '1px solid #E2E8F0',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
              <strong>Compte démo :</strong> admin@delivery.com / Admin@1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
