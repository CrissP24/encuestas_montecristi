import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectorService } from '../services/sectorService';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../utils/constants';
import { MapPin, Plus, Trash2, ArrowLeft, Circle, Pentagon } from 'lucide-react';
import { MapContainer, TileLayer, Circle as LeafletCircle, Polygon, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Componente para capturar clicks en el mapa
function MapClickHandler({ onMapClick, selectedCoords }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function CreateSector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    type: 'circle',
    center_lat: -1.0486,
    center_lng: -80.6606,
    radius_meters: 2500,
    geojson: '',
    selectedPoints: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mapCenter, setMapCenter] = useState([-1.0486, -80.6606]);

  const handleMapClick = (latlng) => {
    if (form.type === 'circle') {
      setForm({...form, center_lat: latlng.lat.toFixed(6), center_lng: latlng.lng.toFixed(6)});
    } else {
      const newPoints = [...form.selectedPoints, [latlng.lat, latlng.lng]];
      setForm({...form, selectedPoints: newPoints});
    }
  };

  const removePoint = (index) => {
    const newPoints = form.selectedPoints.filter((_, i) => i !== index);
    setForm({...form, selectedPoints: newPoints});
  };

  const handleSave = async () => {
    try {
      setError('');
      setLoading(true);

      if (!form.name.trim()) {
        setError('El nombre del sector es requerido');
        return;
      }

      const sectorData = {
        name: form.name,
        type: form.type,
        project_id: 'p1',
      };

      if (form.type === 'circle') {
        if (!form.center_lat || !form.center_lng) {
          setError('Debes seleccionar el centro del círculo en el mapa');
          return;
        }
        sectorData.center_lat = parseFloat(form.center_lat);
        sectorData.center_lng = parseFloat(form.center_lng);
        sectorData.radius_meters = parseInt(form.radius_meters);
      } else {
        if (form.selectedPoints.length < 3) {
          setError('Debes seleccionar al menos 3 puntos para crear un polígono');
          return;
        }
        const closedPoints = [...form.selectedPoints];
        if (closedPoints[0][0] !== closedPoints[closedPoints.length - 1][0] || 
            closedPoints[0][1] !== closedPoints[closedPoints.length - 1][1]) {
          closedPoints.push(closedPoints[0]);
        }
        sectorData.geojson = closedPoints;
      }

      sectorService.create(sectorData);
      setSuccess('Sector creado correctamente');
      
      setTimeout(() => {
        navigate('/sectors');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al crear el sector');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button 
          className="btn btn-ghost btn-icon" 
          onClick={() => navigate('/sectors')}
          title="Volver a Sectores"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          <MapPin size={28} style={{ verticalAlign: 'middle', marginRight: 10, color: 'var(--primary)' }} />
          Crear Nuevo Sector
        </h1>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          borderRadius: 'var(--radius)',
          marginBottom: 24,
          fontSize: 14,
          fontWeight: 500,
          border: '1px solid var(--danger)'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          borderRadius: 'var(--radius)',
          marginBottom: 24,
          fontSize: 14,
          fontWeight: 500,
          border: '1px solid var(--success)'
        }}>
          ✓ {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, alignItems: 'flex-start' }}>
        {/* Formulario */}
        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Datos del Sector</h3>

          <div className="form-group">
            <label>Nombre del sector</label>
            <input
              className="form-control"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Ej: Sector Norte - Zona Urbana"
            />
          </div>

          <div className="form-group">
            <label>Tipo de geocerca</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div
                onClick={() => setForm({...form, type: 'circle', selectedPoints: []})}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: `2px solid ${form.type === 'circle' ? 'var(--primary)' : 'var(--border)'}`,
                  background: form.type === 'circle' ? 'var(--primary-50)' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <Circle size={24} style={{ color: form.type === 'circle' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 6 }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: form.type === 'circle' ? 'var(--primary)' : 'var(--text-secondary)' }}>Círculo</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Click en mapa</div>
              </div>
              <div
                onClick={() => setForm({...form, type: 'polygon', center_lat: '', center_lng: ''})}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: `2px solid ${form.type === 'polygon' ? '#7c3aed' : 'var(--border)'}`,
                  background: form.type === 'polygon' ? '#f5f3ff' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <Pentagon size={24} style={{ color: form.type === 'polygon' ? '#7c3aed' : 'var(--text-muted)', marginBottom: 6 }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: form.type === 'polygon' ? '#7c3aed' : 'var(--text-secondary)' }}>Polígono</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Múltiples clicks</div>
              </div>
            </div>
          </div>

          {form.type === 'circle' && (
            <div className="form-group">
              <label>Radio (metros)</label>
              <input
                className="form-control"
                type="number"
                value={form.radius_meters}
                onChange={e => setForm({...form, radius_meters: e.target.value})}
                placeholder="5000"
              />
              {form.radius_meters && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  📍 Centro: {form.center_lat}, {form.center_lng}<br/>
                  📐 Área: ~{(Math.PI * Math.pow(parseFloat(form.radius_meters || 0) / 1000, 2)).toFixed(2)} km²
                </p>
              )}
            </div>
          )}

          {form.type === 'polygon' && (
            <div className="form-group">
              <label>Puntos seleccionados ({form.selectedPoints.length})</label>
              {form.selectedPoints.length > 0 && (
                <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 12 }}>
                  {form.selectedPoints.map((point, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: 6,
                      marginBottom: 6,
                      fontSize: 13
                    }}>
                      <span>P{idx + 1}: {point[0].toFixed(4)}, {point[1].toFixed(4)}</span>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => removePoint(idx)}
                        style={{ padding: '2px 6px', fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Haz click en el mapa para agregar puntos. Necesitas mínimo 3 puntos.
              </p>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
            style={{ width: '100%', marginTop: 24 }}
          >
            {loading ? 'Creando...' : '✓ Crear Sector'}
          </button>
        </div>

        {/* Mapa */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
          height: '600px'
        }}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={handleMapClick} />

            {form.type === 'circle' && form.center_lat && form.center_lng && (
              <>
                <LeafletCircle
                  center={[parseFloat(form.center_lat), parseFloat(form.center_lng)]}
                  radius={parseFloat(form.radius_meters) || 5000}
                  pathOptions={{ color: '#1e40af', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 }}
                />
                <Marker position={[parseFloat(form.center_lat), parseFloat(form.center_lng)]} />
              </>
            )}

            {form.type === 'polygon' && form.selectedPoints.length > 0 && (
              <>
                {form.selectedPoints.map((point, idx) => (
                  <Marker key={idx} position={point} />
                ))}
                {form.selectedPoints.length > 2 && (
                  <Polygon
                    positions={form.selectedPoints}
                    pathOptions={{ color: '#7c3aed', fillColor: '#a78bfa', fillOpacity: 0.2, weight: 2 }}
                  />
                )}
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
