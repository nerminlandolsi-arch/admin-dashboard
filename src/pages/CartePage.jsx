import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dashboardAPI } from '../services/api';
import { Spinner } from '../components/ui';
import { formatDate } from '../utils/helpers';
import { RefreshCw, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored marker
const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    background:${color};border:3px solid white;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
  "><div style="transform:rotate(45deg);color:white;font-size:14px">🚚</div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'];

export default function CartePage() {
  const [positions, setPositions]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate]   = useState(null);
  const [selected, setSelected]       = useState(null);
  const intervalRef = useRef(null);

  const load = async () => {
    try {
      const res = await dashboardAPI.getPositions();
      if (res.data.success) {
        setPositions(res.data.data || []);
        setLastUpdate(new Date());
      }
    } catch { toast.error('Erreur GPS'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 15000); // refresh toutes les 15s
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);

  // Centre de la Tunisie par défaut
  const center = positions.length > 0
    ? [positions[0].latitude, positions[0].longitude]
    : [33.8869, 9.5375];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 120px)' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 15 }}>
            {positions.length} livreur{positions.length !== 1 ? 's' : ''} localisé{positions.length !== 1 ? 's' : ''}
          </span>
          {lastUpdate && (
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              Mis à jour {formatDate(lastUpdate.toISOString())}
            </span>
          )}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
          Auto-refresh (15s)
        </label>
        <button onClick={load} style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Map */}
        <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spinner size={48} />
            </div>
          ) : (
            <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {positions.map((pos, i) => (
                <Marker
                  key={pos.livreurId}
                  position={[pos.latitude, pos.longitude]}
                  icon={makeIcon(COLORS[i % COLORS.length])}
                  eventHandlers={{ click: () => setSelected(pos) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>🚚 {pos.livreurNom}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                        📍 {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
                      </div>
                      {pos.vitesse != null && (
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                          ⚡ {Math.round(pos.vitesse)} km/h
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        {formatDate(pos.timestamp)}
                      </div>
                    </div>
                  </Popup>
                  <Circle center={[pos.latitude, pos.longitude]} radius={500}
                    color={COLORS[i % COLORS.length]} fillOpacity={0.08} weight={1} />
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Sidebar list */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Livreurs en ligne</h3>
          {positions.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', background: 'white', borderRadius: 12, border: '1px solid #F1F5F9' }}>
              <Navigation size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>Aucune position disponible</div>
            </div>
          ) : (
            positions.map((pos, i) => (
              <div key={pos.livreurId}
                onClick={() => setSelected(pos)}
                style={{
                  background: 'white', borderRadius: 12, padding: '14px 16px',
                  border: selected?.livreurId === pos.livreurId ? `2px solid ${COLORS[i % COLORS.length]}` : '1px solid #F1F5F9',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: selected?.livreurId === pos.livreurId ? `0 0 0 3px ${COLORS[i % COLORS.length]}20` : '0 1px 3px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS[i % COLORS.length]}
                onMouseLeave={e => {
                  if (selected?.livreurId !== pos.livreurId)
                    e.currentTarget.style.borderColor = '#F1F5F9';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${COLORS[i % COLORS.length]}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 18 }}>🚚</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pos.livreurNom}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      {pos.vitesse != null ? `${Math.round(pos.vitesse)} km/h` : 'Vitesse inconnue'}
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#64748B' }}>
                  📍 {pos.latitude?.toFixed(4)}, {pos.longitude?.toFixed(4)}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#94A3B8' }}>
                  {formatDate(pos.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
