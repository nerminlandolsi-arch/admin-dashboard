export const STATUS_CONFIG = {
  EN_ATTENTE: { label: 'En attente',  color: '#F59E0B', bg: '#FEF3C7', dot: '🟡' },
  ASSIGNE:    { label: 'Assigné',     color: '#3B82F6', bg: '#DBEAFE', dot: '🔵' },
  EN_COURS:   { label: 'En cours',    color: '#8B5CF6', bg: '#EDE9FE', dot: '🟣' },
  LIVRE:      { label: 'Livré',       color: '#10B981', bg: '#D1FAE5', dot: '🟢' },
  ECHEC:      { label: 'Échec',       color: '#EF4444', bg: '#FEE2E2', dot: '🔴' },
  RETOURNE:   { label: 'Retourné',    color: '#6B7280', bg: '#F3F4F6', dot: '⚫' },
};

export const PRIORITE_CONFIG = {
  NORMALE:  { label: 'Normale',  color: '#10B981', icon: '▲' },
  URGENTE:  { label: 'Urgente',  color: '#F59E0B', icon: '▲▲' },
  EXPRESS:  { label: 'Express',  color: '#EF4444', icon: '▲▲▲' },
};

export const getStatus = (s) => STATUS_CONFIG[s] || { label: s, color: '#6B7280', bg: '#F3F4F6' };
export const getPriorite = (p) => PRIORITE_CONFIG[p] || { label: p, color: '#6B7280' };

export const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
};

export const formatDateShort = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch { return iso; }
};

export const ALL_STATUTS = ['EN_ATTENTE', 'ASSIGNE', 'EN_COURS', 'LIVRE', 'ECHEC', 'RETOURNE'];
