import { useState, useMemo, useEffect, useRef } from 'react';
import { sectorService } from '../services/sectorService';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../utils/constants';
import { MapPin, Plus, Trash2, Map, Maximize2, Circle, Pentagon, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Circle as LeafletCircle, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

function SectorMiniMap({ sector }) {
  const center = sector.type === 'circle'
    ? [sector.center_lat, sector.center_lng]
    : sector.geojson ? [
        sector.geojson.reduce((s, p) => s + p[0], 0) / sector.geojson.length,
        sector.geojson.reduce((s, p) => s + p[1], 0) / sector.geojson.length,
      ] : [-1.0, -80.0];

  const zoom = sector.type === 'circle'
    ? (sector.radius_meters > 10000 ? 11 : sector.radius_meters > 3000 ? 12 : 14)
    : 12;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}
      zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {sector.type === 'circle' && (
        <>
          <LeafletCircle center={[sector.center_lat, sector.center_lng]} radius={sector.radius_meters}
            pathOptions={{ color: '#1e40af', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 }} />
          <Marker position={[sector.center_lat, sector.center_lng]} />
        </>
      )}
      {sector.type === 'polygon' && sector.geojson && (
        <Polygon positions={sector.geojson}
          pathOptions={{ color: '#7c3aed', fillColor: '#a78bfa', fillOpacity: 0.2, weight: 2 }} />
      )}
    </MapContainer>
  );
}

function FullMapView({ sectors }) {
  const allPositions = [];
  sectors.forEach(s => {
    if (s.type === 'circle') {
      allPositions.push([s.center_lat, s.center_lng]);
    } else if (s.geojson) {
      s.geojson.forEach(p => allPositions.push(p));
    }
  });

  const bounds = allPositions.length > 0 ? L.latLngBounds(allPositions) : null;
  const center = bounds ? bounds.getCenter() : [-1.0, -80.0];

  return (
    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}
      zoomControl={true} attributionControl={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      {bounds && <FitBounds bounds={bounds} />}
      {sectors.map(s => {
        if (s.type === 'circle') {
          return (
            <div key={s.id}>
              <LeafletCircle center={[s.center_lat, s.center_lng]} radius={s.radius_meters}
                pathOptions={{ color: '#1e40af', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }}>
                <Popup>
                  <strong>{s.name}</strong><br/>
                  Radio: {s.radius_meters}m
                </Popup>
              </LeafletCircle>
              <Marker position={[s.center_lat, s.center_lng]}>
                <Popup><strong>{s.name}</strong><br/>Centro: {s.center_lat}, {s.center_lng}</Popup>
              </Marker>
            </div>
          );
        }
        if (s.type === 'polygon' && s.geojson) {
          return (
            <Polygon key={s.id} positions={s.geojson}
              pathOptions={{ color: '#7c3aed', fillColor: '#a78bfa', fillOpacity: 0.15, weight: 2 }}>
              <Popup><strong>{s.name}</strong><br/>Polígono: {s.geojson.length} puntos</Popup>
            </Polygon>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}

export default function Sectors() {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const projects = isSuperAdmin() ? projectService.getAll() : projectService.getByCompany(user.company_id);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [sectors, setSectors] = useState([]);
  const [showFullMap, setShowFullMap] = useState(false);

  useMemo(() => {
    if (selectedProject) setSectors(sectorService.getByProject(selectedProject));
  }, [selectedProject]);

  const reload = () => setSectors(sectorService.getByProject(selectedProject));

  const canCreate = isSuperAdmin() || hasPermission(selectedProject, PERMISSIONS.P_SECTOR_CREATE);

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este sector? Esta acción no se puede deshacer.')) {
      sectorService.remove(id);
      reload();
    }
  };

  const formatRadius = (m) => {
    if (m >= 1000) return (m / 1000).toFixed(1) + ' km';
    return m + ' m';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Sectores / Geocercas</h2>
          <p>Define áreas geográficas y visualiza sectores en el mapa interactivo</p>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: 600, fontSize: 13 }}>Proyecto:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ minWidth: 260 }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {sectors.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={() => setShowFullMap(!showFullMap)}>
              <Maximize2 size={14} /> {showFullMap ? 'Vista tarjetas' : 'Mapa completo'}
            </button>
          )}
        </div>
      </div>

      {/* Vista mapa completo */}
      {showFullMap && sectors.length > 0 && (
        <div className="sector-map-container" style={{ height: 500, marginBottom: 24 }}>
          <FullMapView sectors={sectors} />
        </div>
      )}

      {/* Vista tarjetas con mini-mapas */}
      {sectors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><MapPin size={32} style={{ color: 'var(--text-muted)' }} /></div>
            <h3>Sin sectores definidos</h3>
            <p>Crea sectores circulares o poligonales para definir áreas de trabajo en el terreno</p>
          </div>
        </div>
      ) : !showFullMap && (
        <div className="sector-layout">
          {sectors.map(s => (
            <div key={s.id} className="sector-card-enhanced">
              <div className="sector-card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.type === 'circle'
                      ? <Circle size={16} style={{ color: 'var(--primary)' }} />
                      : <Pentagon size={16} style={{ color: '#7c3aed' }} />
                    }
                    {s.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${s.type === 'circle' ? 'badge-info' : 'badge-purple'}`}>
                      {s.type === 'circle' ? 'Círculo' : 'Polígono'}
                    </span>
                    {s.type === 'circle' && (
                      <span className="badge badge-gray">Radio: {formatRadius(s.radius_meters)}</span>
                    )}
                    {s.type === 'polygon' && (
                      <span className="badge badge-gray">{(s.geojson || []).length} puntos</span>
                    )}
                  </div>
                </div>
                {canCreate && (
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)} title="Eliminar sector">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Mini mapa */}
              <div className="sector-card-map">
                <SectorMiniMap sector={s} />
              </div>

              <div className="sector-card-info">
                {s.type === 'circle' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><Navigation size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Centro: {s.center_lat?.toFixed(5)}, {s.center_lng?.toFixed(5)}</span>
                    <span>Área: ~{(Math.PI * Math.pow(s.radius_meters / 1000, 2)).toFixed(2)} km²</span>
                  </div>
                ) : (
                  <span><Navigation size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Polígono con {(s.geojson || []).length} vértices</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
