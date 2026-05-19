import React, { useState, useEffect } from 'react';
import { dashboardAPI, vehiculesAPI } from '../services/api';
import { StatCard, Spinner, StatusBadge } from '../components/ui';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDate } from '../utils/helpers';
import { RefreshCw } from 'lucide-react';

const COLORS = ['#F59E0B','#3B82F6','#8B5CF6','#10B981','#EF4444','#6B7280'];

export default function DashboardPage() {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [vehicules, setVehicules] = useState([]);
  const [totalVehicules, setTotalVehicules] = useState(0);

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      if (res.data.success) {
        setStats(res.data.data);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicules = async () => {
    try {
      const res = await vehiculesAPI.getAll();
      if (res.data.success) {
        setVehicules(res.data.data || []);
        setTotalVehicules(res.data.data?.length || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
    loadVehicules();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadStats();
    loadVehicules();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <Spinner size={48} />
    </div>
  );
  if (!stats) return <div style={{ color: '#EF4444', padding: 24 }}>Erreur de chargement</div>;

  const pieData = [
    { name: 'En attente', value: stats.colisEnAttente },
    { name: 'En cours',   value: stats.colisEnCours   },
    { name: 'Livrés',     value: stats.colisLivres    },
    { name: 'Échec',      value: stats.colisEchoues   },
  ].filter(d => d.value > 0);

  const barData = (stats.topLivreurs || []).map(l => ({
    name: l.livreurNom?.split(' ')[0] || 'Livreur',
    livraisons: l.livraisonsReussies,
    taux: l.tauxReussite,
  }));

  // Recuperer vehicule d'un livreur
  const getVehiculeByLivreur = (livreurId) => {
    const v = vehicules.find(v => v.livreurId === livreurId);
    return v ? `${v.marque} ${v.modele} (${v.immatriculation})` : 'Non assigné';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Vue d'ensemble</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
            Dernière mise à jour : {formatDate(lastUpdate.toISOString())}
          </p>
        </div>
        <button onClick={handleRefresh} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 10, border: '1.5px solid #E2E8F0',
          background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151',
        }}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total colis"         value={stats.totalColis}           icon="📦" color="#3B82F6" sub={`${stats.colisAujourdHui} créés aujourd'hui`} />
        <StatCard label="Livrés"              value={stats.colisLivres}          icon="✅" color="#10B981" sub="Total validés" />
        <StatCard label="En cours"            value={stats.colisEnCours}         icon="🚚" color="#8B5CF6" sub="Assignés + en route" />
        <StatCard label="En attente"          value={stats.colisEnAttente}       icon="⏳" color="#F59E0B" sub="Non assignés" />
        <StatCard label="Taux de réussite"    value={`${stats.tauxReussite}%`}   icon="🎯" color="#10B981" sub="Livraisons réussies" />
        <StatCard label="Livreurs actifs"     value={stats.livreursActifs}       icon="👤" color="#3B82F6" sub={`${stats.totalLivreurs} au total`} />
        <StatCard label="Livraisons (auj.)"   value={stats.livraisonsAujourdHui} icon="📊" color="#F59E0B" sub="Livrées ce jour" />
        <StatCard label="Échecs"              value={stats.colisEchoues}         icon="❌" color="#EF4444" sub="Livraisons échouées" />
        {/* ✅ NOUVEAU — Carte véhicules */}
        <StatCard label="Total véhicules"     value={totalVehicules}             icon="🚗" color="#6366F1" sub="Véhicules enregistrés" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Pie */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Répartition des colis</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v + ' colis']} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 14 }}>
              Aucune donnée
            </div>
          )}
        </div>

        {/* Bar */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Top 5 livreurs</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="livraisons" name="Livraisons" fill="#3B82F6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 14 }}>
              Aucune donnée
            </div>
          )}
        </div>
      </div>

      {/* Top livreurs table — AVEC COLONNE VEHICULE */}
      {(stats.topLivreurs || []).length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>🏆 Classement livreurs</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                {['#', 'Livreur', 'Véhicule', 'Total livraisons', 'Réussies', 'Taux'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.topLivreurs.map((l, i) => (
                <tr key={l.livreurId} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 700, color: i === 0 ? '#F59E0B' : '#94A3B8' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </td>
                  <td style={{ padding: '12px 12px', fontWeight: 600 }}>{l.livreurNom}</td>
                  {/* ✅ NOUVELLE COLONNE VEHICULE */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{
                      background: '#F1F5F9', color: '#374151',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600
                    }}>
                      🚗 {getVehiculeByLivreur(l.livreurId)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', color: '#64748B' }}>{l.totalLivraisons}</td>
                  <td style={{ padding: '12px 12px', color: '#10B981', fontWeight: 600 }}>{l.livraisonsReussies}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${l.tauxReussite}%`, height: '100%',
                          background: l.tauxReussite >= 80 ? '#10B981' : l.tauxReussite >= 50 ? '#F59E0B' : '#EF4444',
                          borderRadius: 3
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36 }}>{l.tauxReussite}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ NOUVEAU TABLEAU VEHICULES */}
      {vehicules.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>🚗 Véhicules enregistrés</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                {['Marque / Modèle', 'Immatriculation', 'Type', 'Livreur assigné', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicules.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 600 }}>{v.marque} {v.modele}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {v.immatriculation}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', color: '#64748B' }}>{v.type}</td>
                  <td style={{ padding: '12px 12px', fontWeight: 600 }}>{v.livreurNom}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{
                      background: v.disponible ? '#DCFCE7' : '#FEE2E2',
                      color: v.disponible ? '#16A34A' : '#DC2626',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600
                    }}>
                      {v.disponible ? '✅ Disponible' : '❌ Indisponible'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}