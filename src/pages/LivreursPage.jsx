import React, { useState, useEffect } from 'react';
import { livreursAPI, vehiculesAPI } from '../services/api';
import { StatusBadge, Spinner, Modal, Btn, StatCard } from '../components/ui';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { UserCheck, UserX, BarChart2, Trash2, RefreshCw, Users, UserPlus, Car, Pencil } from 'lucide-react';

export default function LivreursPage() {
  const [livreurs, setLivreurs]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [statsModal, setStatsModal]           = useState(null);
  const [statsData, setStatsData]             = useState(null);
  const [statsLoading, setStatsLoading]       = useState(false);
  const [search, setSearch]                   = useState('');
  const [actifsOnly, setActifsOnly]           = useState(false);
  const [vehicules, setVehicules]             = useState([]);

  // Nouveau livreur
  const [addModal, setAddModal]               = useState(false);
  const [addLoading, setAddLoading]           = useState(false);
  const [form, setForm]                       = useState({
    nom: '', prenom: '', email: '', password: '', telephone: ''
  });

  // Vehicule modal
  const [vehiculeModal, setVehiculeModal]         = useState(null);
  const [vehiculeLoading, setVehiculeLoading]     = useState(false);
  const [vehiculeForm, setVehiculeForm]           = useState({
    marque: '', modele: '', immatriculation: '', type: 'VOITURE', vehiculeId: null
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await livreursAPI.getAll(actifsOnly);
      if (res.data.success) setLivreurs(res.data.data || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const loadVehicules = async () => {
    try {
      const res = await vehiculesAPI.getAll();
      if (res.data.success) setVehicules(res.data.data || []);
    } catch { console.error('Erreur vehicules'); }
  };

  useEffect(() => {
    load();
    loadVehicules();
  }, [actifsOnly]);

  const getVehicule = (livreurId) => {
    return vehicules.find(v => v.livreurId === livreurId) || null;
  };

  const handleToggle = async (id) => {
    try {
      const res = await livreursAPI.toggleActif(id);
      if (res.data.success) {
        toast.success('Statut mis à jour');
        setLivreurs(prev => prev.map(l => l.id === id ? res.data.data : l));
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livreur définitivement ?')) return;
    try {
      await livreursAPI.delete(id);
      toast.success('Livreur supprimé');
      setLivreurs(prev => prev.filter(l => l.id !== id));
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const openStats = async (livreur) => {
    setStatsModal(livreur);
    setStatsLoading(true);
    try {
      const res = await livreursAPI.getStats(livreur.id);
      if (res.data.success) setStatsData(res.data.data);
    } catch { toast.error('Erreur chargement stats'); }
    finally { setStatsLoading(false); }
  };

  const handleAddLivreur = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setAddLoading(true);
    try {
      const res = await livreursAPI.create(form);
      if (res.data.success) {
        toast.success('Livreur créé avec succès !');
        setAddModal(false);
        setForm({ nom: '', prenom: '', email: '', password: '', telephone: '' });
        await load();
      } else {
        toast.error(res.data.message || 'Erreur lors de la création');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setAddLoading(false);
    }
  };

  // ✅ Ouvrir modal pour ASSIGNER un nouveau vehicule
  const openAssignerVehicule = (livreur) => {
    setVehiculeModal(livreur);
    setVehiculeForm({
      marque: '', modele: '', immatriculation: '', type: 'VOITURE', vehiculeId: null
    });
  };

  // ✅ Ouvrir modal pour MODIFIER un vehicule existant
  const openEditVehicule = (livreur, vehicule) => {
    setVehiculeModal(livreur);
    setVehiculeForm({
      marque: vehicule.marque,
      modele: vehicule.modele,
      immatriculation: vehicule.immatriculation,
      type: vehicule.type,
      vehiculeId: vehicule.id
    });
  };

  // ✅ Supprimer un vehicule
  const handleDeleteVehicule = async (vehiculeId) => {
    if (!window.confirm('Supprimer ce véhicule ?')) return;
    try {
      await vehiculesAPI.delete(vehiculeId);
      toast.success('Véhicule supprimé');
      await loadVehicules();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    }
  };

  // ✅ Sauvegarder vehicule (creation ou modification)
  const handleSaveVehicule = async () => {
    if (!vehiculeForm.marque || !vehiculeForm.modele || !vehiculeForm.immatriculation) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setVehiculeLoading(true);
    try {
      let res;
      if (vehiculeForm.vehiculeId) {
        // ✅ MODIFICATION
        res = await vehiculesAPI.update(vehiculeForm.vehiculeId, {
          marque: vehiculeForm.marque,
          modele: vehiculeForm.modele,
          immatriculation: vehiculeForm.immatriculation,
          type: vehiculeForm.type,
          livreurId: vehiculeModal.id
        });
        if (res.data.success) toast.success('Véhicule modifié avec succès !');
      } else {
        // ✅ CREATION
        res = await vehiculesAPI.create({
          marque: vehiculeForm.marque,
          modele: vehiculeForm.modele,
          immatriculation: vehiculeForm.immatriculation,
          type: vehiculeForm.type,
          livreurId: vehiculeModal.id
        });
        if (res.data.success) toast.success('Véhicule assigné avec succès !');
      }
      setVehiculeModal(null);
      setVehiculeForm({ marque: '', modele: '', immatriculation: '', type: 'VOITURE', vehiculeId: null });
      await loadVehicules();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setVehiculeLoading(false);
    }
  };

  const filtered = livreurs.filter(l =>
    !search ||
    `${l.nom} ${l.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.telephone?.includes(search)
  );

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', marginTop: 4,
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: '#374151',
    display: 'block', marginBottom: 12
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un livreur..."
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: '#374151' }}>
          <input type="checkbox" checked={actifsOnly} onChange={e => setActifsOnly(e.target.checked)} />
          Actifs uniquement
        </label>
        <button onClick={() => { load(); loadVehicules(); }}
          style={{ padding: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
          <RefreshCw size={16} color="#64748B" />
        </button>
        <button onClick={() => setAddModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: '#1565C0', color: 'white', fontSize: 14,
          fontWeight: 600, cursor: 'pointer',
        }}>
          <UserPlus size={16} /> Nouveau livreur
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ padding: '6px 14px', background: '#DBEAFE', borderRadius: 20, fontSize: 13, color: '#1D4ED8', fontWeight: 600 }}>
          {livreurs.length} livreurs au total
        </div>
        <div style={{ padding: '6px 14px', background: '#D1FAE5', borderRadius: 20, fontSize: 13, color: '#065F46', fontWeight: 600 }}>
          {livreurs.filter(l => l.actif).length} actifs
        </div>
        <div style={{ padding: '6px 14px', background: '#FEE2E2', borderRadius: 20, fontSize: 13, color: '#991B1B', fontWeight: 600 }}>
          {livreurs.filter(l => !l.actif).length} inactifs
        </div>
        <div style={{ padding: '6px 14px', background: '#EEF2FF', borderRadius: 20, fontSize: 13, color: '#4F46E5', fontWeight: 600 }}>
          🚗 {vehicules.length} véhicules
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>
            <Users size={40} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>Aucun livreur trouvé</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #F1F5F9' }}>
                {['Livreur', 'Email', 'Téléphone', 'Véhicule', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const vehicule = getVehicule(l.id);
                return (
                  <tr key={l.id} style={{ borderBottom: '1px solid #F8FAFC' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Livreur */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: `hsl(${(l.nom?.charCodeAt(0) || 0) * 7 % 360}, 60%, 85%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 15,
                          color: `hsl(${(l.nom?.charCodeAt(0) || 0) * 7 % 360}, 60%, 35%)`,
                          flexShrink: 0,
                        }}>
                          {l.nom?.[0]}{l.prenom?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{l.nom} {l.prenom}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>ID #{l.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{l.email}</td>

                    {/* Telephone */}
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{l.telephone}</td>

                    {/* ✅ COLONNE VEHICULE AVEC MODIFIER ET SUPPRIMER */}
                    <td style={{ padding: '14px 16px' }}>
                      {vehicule ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {/* Info vehicule */}
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            🚗 {vehicule.marque} {vehicule.modele}
                          </div>
                          {/* Badge immatriculation */}
                          <span style={{
                            fontSize: 11, color: '#6366F1', fontWeight: 600,
                            background: '#EEF2FF', display: 'inline-block',
                            padding: '2px 8px', borderRadius: 10, width: 'fit-content'
                          }}>
                            {vehicule.immatriculation}
                          </span>
                          {/* Boutons modifier et supprimer */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <button
                              onClick={() => openEditVehicule(l, vehicule)}
                              title="Modifier le véhicule"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '3px 10px', borderRadius: 8,
                                border: '1.5px solid #BFDBFE',
                                background: '#EFF6FF', cursor: 'pointer',
                                fontSize: 11, color: '#3B82F6', fontWeight: 600
                              }}>
                              <Pencil size={11} /> Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteVehicule(vehicule.id)}
                              title="Supprimer le véhicule"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '3px 10px', borderRadius: 8,
                                border: '1.5px solid #FEE2E2',
                                background: '#FFF5F5', cursor: 'pointer',
                                fontSize: 11, color: '#EF4444', fontWeight: 600
                              }}>
                              <Trash2 size={11} /> Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => openAssignerVehicule(l)} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 8,
                          border: '1.5px dashed #CBD5E1',
                          background: 'transparent', cursor: 'pointer',
                          fontSize: 12, color: '#94A3B8',
                        }}>
                          <Car size={13} /> Assigner
                        </button>
                      )}
                    </td>

                    {/* Statut */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: l.actif ? '#D1FAE5' : '#FEE2E2',
                        color: l.actif ? '#065F46' : '#991B1B',
                      }}>
                        {l.actif ? '● Actif' : '○ Inactif'}
                      </span>
                    </td>

                    {/* Date inscription */}
                    <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 12 }}>
                      {formatDate(l.createdAt)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openStats(l)} title="Statistiques"
                          style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #E0E7FF', background: '#EEF2FF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <BarChart2 size={15} color="#6366F1" />
                        </button>
                        <button onClick={() => handleToggle(l.id)} title={l.actif ? 'Désactiver' : 'Activer'}
                          style={{ padding: '6px 8px', borderRadius: 8, border: `1.5px solid ${l.actif ? '#FEE2E2' : '#D1FAE5'}`, background: l.actif ? '#FFF5F5' : '#F0FDF4', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          {l.actif ? <UserX size={15} color="#EF4444" /> : <UserCheck size={15} color="#10B981" />}
                        </button>
                        <button onClick={() => handleDelete(l.id)} title="Supprimer"
                          style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={15} color="#EF4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ MODAL VEHICULE (CREATION + MODIFICATION) */}
      <Modal
        open={!!vehiculeModal}
        onClose={() => {
          setVehiculeModal(null);
          setVehiculeForm({ marque: '', modele: '', immatriculation: '', type: 'VOITURE', vehiculeId: null });
        }}
        title={`${vehiculeForm.vehiculeId ? '✏️ Modifier' : '🚗 Assigner'} un véhicule — ${vehiculeModal?.nom} ${vehiculeModal?.prenom}`}
        width={460}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Marque *</label>
              <input value={vehiculeForm.marque}
                onChange={e => setVehiculeForm(p => ({ ...p, marque: e.target.value }))}
                placeholder="Ex: Renault" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Modèle *</label>
              <input value={vehiculeForm.modele}
                onChange={e => setVehiculeForm(p => ({ ...p, modele: e.target.value }))}
                placeholder="Ex: Kangoo" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Immatriculation *</label>
            <input value={vehiculeForm.immatriculation}
              onChange={e => setVehiculeForm(p => ({ ...p, immatriculation: e.target.value }))}
              placeholder="Ex: 123 TUN 4567" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Type de véhicule</label>
            <select value={vehiculeForm.type}
              onChange={e => setVehiculeForm(p => ({ ...p, type: e.target.value }))}
              style={{ ...inputStyle, marginTop: 0 }}>
              <option value="VOITURE">🚗 Voiture</option>
              <option value="MOTO">🏍️ Moto</option>
              <option value="CAMION">🚛 Camion</option>
              <option value="CAMIONNETTE">🚐 Camionnette</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={() => {
                setVehiculeModal(null);
                setVehiculeForm({ marque: '', modele: '', immatriculation: '', type: 'VOITURE', vehiculeId: null });
              }}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 14 }}>
              Annuler
            </button>
            <button onClick={handleSaveVehicule} disabled={vehiculeLoading}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: vehiculeForm.vehiculeId ? '#059669' : '#1565C0',
                color: 'white', fontWeight: 600, cursor: 'pointer',
                fontSize: 14, opacity: vehiculeLoading ? 0.7 : 1
              }}>
              {vehiculeLoading ? 'Enregistrement...' :
                vehiculeForm.vehiculeId ? '✏️ Modifier le véhicule' : '🚗 Assigner le véhicule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Nouveau Livreur */}
      <Modal open={addModal}
        onClose={() => { setAddModal(false); setForm({ nom: '', prenom: '', email: '', password: '', telephone: '' }); }}
        title="Nouveau livreur" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                placeholder="Nom" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Prénom *</label>
              <input value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))}
                placeholder="Prénom" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="email@delivery.com" type="email" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mot de passe *</label>
            <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Mot de passe" type="password" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
              placeholder="+21655555555" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setAddModal(false)}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 14 }}>
              Annuler
            </button>
            <button onClick={handleAddLivreur} disabled={addLoading}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#1565C0', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: addLoading ? 0.7 : 1 }}>
              {addLoading ? 'Création...' : 'Créer le livreur'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Stats Modal */}
      <Modal open={!!statsModal}
        onClose={() => { setStatsModal(null); setStatsData(null); }}
        title={`Statistiques – ${statsModal?.nom} ${statsModal?.prenom}`} width={500}>
        {statsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
        ) : statsData ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <StatCard label="Total colis"    value={statsData.totalColis}    icon="📦" color="#3B82F6" />
            <StatCard label="Livrés"         value={statsData.colisLivres}   icon="✅" color="#10B981" />
            <StatCard label="En cours"       value={statsData.colisEnCours}  icon="🚚" color="#8B5CF6" />
            <StatCard label="Échecs"         value={statsData.colisEchoues}  icon="❌" color="#EF4444" />
            <div style={{ gridColumn: '1/-1' }}>
              <StatCard label="Taux de réussite" value={`${statsData.tauxReussite}%`} icon="🎯" color="#10B981"
                sub={`${statsData.livraisonsAujourdHui} livraisons aujourd'hui`} />
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
}