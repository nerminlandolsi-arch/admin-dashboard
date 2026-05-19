import React, { useState, useEffect, useCallback } from 'react';
import { colisAPI, livreursAPI } from '../services/api';
import { StatusBadge, Spinner, Modal, Btn, Input, Select } from '../components/ui';
import { formatDate, ALL_STATUTS, getStatus } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, UserCheck, RefreshCw, Trash2, Barcode } from 'lucide-react';

const BASE_URL = 'http://localhost:8080/api';

export default function ColisPage() {
  const [colis, setColis]             = useState([]);
  const [livreurs, setLivreurs]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilter]     = useState('');
  const [selected, setSelected]       = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showAssign, setShowAssign]   = useState(null);
  const [scanCode, setScanCode]       = useState('');
  const [scanLoading, setScanLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        colisAPI.getAll(filterStatus || undefined),
        livreursAPI.getAll(true),
      ]);
      if (cRes.data.success) setColis(cRes.data.data || []);
      if (lRes.data.success) setLivreurs(lRes.data.data || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = colis.filter(c =>
    !search || c.numeroSuivi?.toLowerCase().includes(search.toLowerCase()) ||
    c.destinataireNom?.toLowerCase().includes(search.toLowerCase()) ||
    c.adresseLivraison?.toLowerCase().includes(search.toLowerCase()) ||
    c.codeBarres?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce colis ?')) return;
    try {
      await colisAPI.delete(id);
      toast.success('Colis supprimé');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const handleAssign = async (colisId, livreurId) => {
    try {
      await colisAPI.assigner(colisId, livreurId);
      toast.success('Colis assigné ✓');
      setShowAssign(null);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  const handleScanSearch = async () => {
    if (!scanCode.trim()) return;
    setScanLoading(true);
    try {
      const res = await colisAPI.scanByBarcode(scanCode.trim());
      if (res.data.success) {
        setSelected(res.data.data);
        setScanCode('');
        toast.success('Colis trouvé ! 🎯');
      }
    } catch {
      toast.error('Aucun colis avec ce code-barres');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher (numéro, destinataire, code-barres)..."
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' }} />
        </div>

        {/* Barre de scan code-barres */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F0FDF4', borderRadius: 10, padding: '6px 12px', border: '1.5px solid #BBF7D0' }}>
          <Barcode size={16} color="#16A34A" />
          <input
            value={scanCode}
            onChange={e => setScanCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScanSearch()}
            placeholder="Scanner code-barres..."
            style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none', width: 190 }}
          />
          <button onClick={handleScanSearch} disabled={scanLoading || !scanCode.trim()}
            style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: '#16A34A', color: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: scanLoading ? 0.7 : 1 }}>
            {scanLoading ? '...' : 'Chercher'}
          </button>
        </div>

        <select value={filterStatus} onChange={e => setFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white', cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          {ALL_STATUTS.map(s => <option key={s} value={s}>{getStatus(s).label}</option>)}
        </select>
        <Btn onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Nouveau colis
        </Btn>
        <button onClick={load} style={{ padding: '10px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={16} color="#64748B" />
        </button>
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: '#64748B' }}>{filtered.length} colis trouvé{filtered.length > 1 ? 's' : ''}</div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔭</div>
            Aucun colis trouvé
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #F1F5F9' }}>
                  {['N° Suivi','Code-barres','Destinataire','Adresse livraison','Statut','Priorité','Livreur','Date','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: 13, color: '#1D4ED8' }}>
                      {c.numeroSuivi}
                      {c.photoPreuveUrl && <span style={{ marginLeft: 6, fontSize: 14 }} title="Photo de preuve disponible">📷</span>}
                    </td>
                    {/* COLONNE CODE-BARRES */}
                    <td style={{ padding: '14px 16px' }}>
                      {c.codeBarres ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                            {c.codeBarres}
                          </span>
                          {c.barcodeImage && (
                            <img src={c.barcodeImage} alt="barcode" style={{ width: 90, height: 28, objectFit: 'contain' }} />
                          )}
                        </div>
                      ) : <span style={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{c.destinataireNom}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{c.destinataireTelephone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748B', maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.adresseLivraison}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.priorite === 'EXPRESS' ? '#EF4444' : c.priorite === 'URGENTE' ? '#F59E0B' : '#10B981' }}>
                        {c.priorite}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 13 }}>
                      {c.livreur ? `${c.livreur.nom} ${c.livreur.prenom}` : <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>Non assigné</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setSelected(c)} title="Voir détail" style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Eye size={15} color="#64748B" />
                        </button>
                        {['EN_ATTENTE','ASSIGNE'].includes(c.status) && (
                          <button onClick={() => setShowAssign({ colisId: c.id, colisNum: c.numeroSuivi })} title="Assigner" style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #BFDBFE', background: '#EFF6FF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <UserCheck size={15} color="#3B82F6" />
                          </button>
                        )}
                        {!['EN_COURS','LIVRE'].includes(c.status) && (
                          <button onClick={() => handleDelete(c.id)} title="Supprimer" style={{ padding: '6px 8px', borderRadius: 8, border: '1.5px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={15} color="#EF4444" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Détail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Colis ${selected?.numeroSuivi}`} width={640}>
        {selected && <ColisDetail colis={selected} livreurs={livreurs} onAssign={handleAssign} onRefresh={load} onClose={() => setSelected(null)} />}
      </Modal>

      <AssignModal open={!!showAssign} data={showAssign} livreurs={livreurs} onAssign={handleAssign} onClose={() => setShowAssign(null)} />
      <CreateColisModal open={showCreate} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); load(); }} />
    </div>
  );
}

// ===== COLIS DETAIL =====
function ColisDetail({ colis: c, livreurs, onAssign, onRefresh, onClose }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    try {
      await colisAPI.updateStatus(c.id, status, null);
      toast.success('Statut mis à jour');
      onRefresh();
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
    finally { setUpdatingStatus(false); }
  };

  const row = (label, value) => (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ width: 160, fontSize: 13, color: '#64748B', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#0F172A' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatusBadge status={c.status} />
        <span style={{ fontSize: 13, color: '#64748B' }}>Priorité : <strong>{c.priorite}</strong></span>
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>📦 DESTINATAIRE</h4>
        {row('Nom', c.destinataireNom)}
        {row('Téléphone', c.destinataireTelephone)}
        {row('Adresse', c.adresseLivraison)}
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>📤 EXPÉDITEUR</h4>
        {row('Nom', c.expediteurNom)}
        {row('Téléphone', c.expediteurTelephone)}
        {row('Enlèvement', c.adresseEnlevement)}
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>ℹ️ COLIS</h4>
        {row('Description', c.description)}
        {row('Poids', c.poids ? `${c.poids} kg` : null)}
        {row('Dimensions', c.dimensions)}
        {row('Livreur', c.livreur ? `${c.livreur.nom} ${c.livreur.prenom}` : 'Non assigné')}
        {row('Créé le', formatDate(c.createdAt))}
        {row('Date prévue', formatDate(c.dateLivraisonPrevue))}
        {c.dateLivraisonReelle && row('Livré le', formatDate(c.dateLivraisonReelle))}
      </div>

      {/* ===== CODE-BARRES ===== */}
      {c.codeBarres && (
        <div>
          <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>🔖 CODE-BARRES</h4>
          <div style={{ background: '#FAFAFA', padding: 20, borderRadius: 12, border: '1.5px solid #E2E8F0', display: 'inline-block', textAlign: 'center' }}>
            {c.barcodeImage ? (
              <img src={c.barcodeImage} alt="Code-barres" style={{ width: '100%', maxWidth: 320, display: 'block' }} />
            ) : (
              <div style={{ color: '#94A3B8', fontSize: 13, padding: 20 }}>Chargement...</div>
            )}
            <p style={{ textAlign: 'center', fontSize: 14, marginTop: 8, marginBottom: 0, fontFamily: 'monospace', color: '#374151', letterSpacing: 2 }}>
              {c.codeBarres}
            </p>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {c.barcodeImage && (
              <a href={c.barcodeImage} download={`barcode-${c.numeroSuivi}.png`}
                style={{ fontSize: 13, color: '#3B82F6', textDecoration: 'none' }}>
                ⬇️ Télécharger
              </a>
            )}
            <button
              onClick={() => {
                const win = window.open('', '_blank');
                win.document.write(`<html><body style="display:flex;flex-direction:column;align-items:center;padding:40px;font-family:Arial">
                  <h2>Colis ${c.numeroSuivi}</h2>
                  <img src="${c.barcodeImage}" style="width:350px"/>
                  <p style="font-size:16px;letter-spacing:3px;font-family:monospace">${c.codeBarres}</p>
                  <p><strong>Destinataire:</strong> ${c.destinataireNom}</p>
                  <p><strong>Adresse:</strong> ${c.adresseLivraison}</p>
                  <p><strong>Téléphone:</strong> ${c.destinataireTelephone}</p>
                </body></html>`);
                win.print();
              }}
              style={{ fontSize: 13, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer' }}>
              🖨️ Imprimer l'étiquette
            </button>
          </div>
        </div>
      )}

      {/* ===== PHOTO DE PREUVE ===== */}
      {c.photoPreuveUrl && (
        <div>
          <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>📷 PHOTO DE PREUVE</h4>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={`${BASE_URL}${c.photoPreuveUrl}`} alt="Photo de preuve" onClick={() => setPhotoModal(true)}
              style={{ width: '100%', maxWidth: 400, height: 200, objectFit: 'cover', borderRadius: 12, cursor: 'pointer', border: '2px solid #E2E8F0' }}
              onError={e => { e.target.style.display = 'none'; }} />
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
              Cliquer pour agrandir
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <a href={`${BASE_URL}${c.photoPreuveUrl}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#3B82F6', textDecoration: 'none' }}>
              🔗 Ouvrir dans un nouvel onglet
            </a>
          </div>
        </div>
      )}

      {photoModal && (
        <div onClick={() => setPhotoModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }}>
          <img src={`${BASE_URL}${c.photoPreuveUrl}`} alt="Photo de preuve"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: 24 }}>✕</div>
        </div>
      )}

      {c.historique?.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>🕒 HISTORIQUE</h4>
          {c.historique.map(h => (
            <div key={h.id} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 13, borderBottom: '1px solid #F8FAFC' }}>
              <StatusBadge status={h.status} />
              <span style={{ color: '#64748B', flex: 1 }}>{h.description}</span>
              <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{formatDate(h.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {!['LIVRE','RETOURNE'].includes(c.status) && (
        <div>
          <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>⚡ ACTIONS RAPIDES</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['EN_COURS','LIVRE','ECHEC','RETOURNE'].map(s => (
              <Btn key={s} small variant={s === 'LIVRE' ? 'success' : s === 'ECHEC' || s === 'RETOURNE' ? 'danger' : 'outline'}
                onClick={() => handleStatusChange(s)} disabled={updatingStatus}>
                → {getStatus(s)?.label}
              </Btn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== ASSIGN MODAL =====
function AssignModal({ open, data, livreurs, onAssign, onClose }) {
  const [livreurId, setLivreurId] = useState('');
  if (!open || !data) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Assigner ${data.colisNum}`} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Select label="Sélectionner un livreur" value={livreurId} onChange={e => setLivreurId(e.target.value)}>
          <option value="">-- Choisir --</option>
          {livreurs.map(l => <option key={l.id} value={l.id}>{l.nom} {l.prenom} — {l.telephone}</option>)}
        </Select>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={() => livreurId && onAssign(data.colisId, parseInt(livreurId))} disabled={!livreurId}>Assigner</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ===== CREATE COLIS MODAL =====
function CreateColisModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    expediteurNom: '', expediteurTelephone: '', adresseEnlevement: '',
    destinataireNom: '', destinataireTelephone: '', adresseLivraison: '',
    description: '', poids: '', priorite: 'NORMALE',
  });
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await colisAPI.create({ ...form, poids: form.poids ? parseFloat(form.poids) : undefined });
      toast.success('Colis créé avec succès ✓');
      if (res.data?.data?.codeBarres) {
        toast.success(`Code-barres : ${res.data.data.codeBarres}`, { duration: 4000 });
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau colis" width={600}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13 }}>📤 Expéditeur</h4>
          </div>
          <Input label="Nom expéditeur *" required value={form.expediteurNom} onChange={e => f('expediteurNom', e.target.value)} />
          <Input label="Téléphone expéditeur" value={form.expediteurTelephone} onChange={e => f('expediteurTelephone', e.target.value)} />
          <div style={{ gridColumn: '1/-1' }}>
            <Input label="Adresse d'enlèvement *" required value={form.adresseEnlevement} onChange={e => f('adresseEnlevement', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1', borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
            <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13 }}>📦 Destinataire</h4>
          </div>
          <Input label="Nom destinataire *" required value={form.destinataireNom} onChange={e => f('destinataireNom', e.target.value)} />
          <Input label="Téléphone destinataire *" required value={form.destinataireTelephone} onChange={e => f('destinataireTelephone', e.target.value)} />
          <div style={{ gridColumn: '1/-1' }}>
            <Input label="Adresse de livraison *" required value={form.adresseLivraison} onChange={e => f('adresseLivraison', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1', borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
            <h4 style={{ margin: '0 0 10px', color: '#3B82F6', fontSize: 13 }}>ℹ️ Informations colis</h4>
          </div>
          <Input label="Description" value={form.description} onChange={e => f('description', e.target.value)} />
          <Input label="Poids (kg)" type="number" step="0.1" value={form.poids} onChange={e => f('poids', e.target.value)} />
          <div style={{ gridColumn: '1/-1' }}>
            <Select label="Priorité" value={form.priorite} onChange={e => f('priorite', e.target.value)}>
              <option value="NORMALE">Normale</option>
              <option value="URGENTE">Urgente</option>
              <option value="EXPRESS">Express</option>
            </Select>
          </div>
          <div style={{ gridColumn: '1/-1', background: '#F0FDF4', borderRadius: 10, padding: 12, border: '1px solid #BBF7D0' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#16A34A' }}>
              🔖 Un code-barres unique sera généré automatiquement lors de la création du colis.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Btn variant="ghost" onClick={onClose} type="button">Annuler</Btn>
          <Btn type="submit" disabled={saving}>{saving ? 'Création...' : 'Créer le colis'}</Btn>
        </div>
      </form>
    </Modal>
  );
}
