import { useState, useMemo } from 'react';
import { responseService } from '../services/responseService';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { formService } from '../services/formService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { FIELD_TYPE_LABELS } from '../utils/constants';
import {
  Monitor, AlertTriangle, MapPinOff, Clock, WifiOff, FileCheck,
  BarChart3, Eye, X, Download, Filter, Users, TrendingUp
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const CHART_COLORS = ['#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9'];

export default function Monitoring() {
  const { user, isSuperAdmin } = useAuth();
  const projects = isSuperAdmin()
    ? projectService.getAll()
    : projectService.getByCompany(user.company_id);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [filterFlag, setFilterFlag] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('table');

  const allUsers = authService.getUsers();
  const getUserName = (id) => allUsers.find(u => u.id === id)?.name || id;

  const responses = responseService.getByProject(selectedProject);
  const stats = responseService.getStats(selectedProject);
  const allTasks = taskService.getAll();

  const filtered = responses.filter(r => {
    if (filterFlag === 'all') return true;
    if (filterFlag === 'out_of_sector') return r.flags?.out_of_sector;
    if (filterFlag === 'out_of_schedule') return r.flags?.out_of_schedule;
    if (filterFlag === 'low_accuracy') return r.flags?.low_accuracy;
    if (filterFlag === 'offline') return r.flags?.offline_capture;
    if (filterFlag === 'clean') return !r.flags?.out_of_sector && !r.flags?.out_of_schedule && !r.flags?.low_accuracy;
    return true;
  });

  const statCards = [
    { icon: FileCheck, label: 'Total Respuestas', value: stats.total, color: 'primary' },
    { icon: FileCheck, label: 'Enviadas', value: stats.sent, color: 'success' },
    { icon: MapPinOff, label: 'Fuera de Sector', value: stats.outOfSector, color: 'danger' },
    { icon: Clock, label: 'Fuera de Horario', value: stats.outOfSchedule, color: 'warning' },
    { icon: AlertTriangle, label: 'Baja Precisión', value: stats.lowAccuracy, color: 'warning' },
    { icon: WifiOff, label: 'Captura Offline', value: stats.offlineCapture, color: 'info' },
  ];

  // Chart: quality distribution
  const qualityData = useMemo(() => {
    const clean = responses.filter(r => !r.flags?.out_of_sector && !r.flags?.out_of_schedule && !r.flags?.low_accuracy).length;
    return [
      { name: 'Sin alertas', value: clean },
      { name: 'Fuera sector', value: stats.outOfSector },
      { name: 'Fuera horario', value: stats.outOfSchedule },
      { name: 'Baja precisión', value: stats.lowAccuracy },
    ].filter(d => d.value > 0);
  }, [responses, stats]);

  // Chart: accuracy distribution
  const accuracyData = useMemo(() => {
    const buckets = { 'Excelente (0-10m)': 0, 'Buena (10-30m)': 0, 'Regular (30-80m)': 0, 'Mala (>80m)': 0 };
    responses.forEach(r => {
      if (r.accuracy_m <= 10) buckets['Excelente (0-10m)']++;
      else if (r.accuracy_m <= 30) buckets['Buena (10-30m)']++;
      else if (r.accuracy_m <= 80) buckets['Regular (30-80m)']++;
      else buckets['Mala (>80m)']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [responses]);

  // Chart: by enumerator performance
  const enumeratorPerformance = useMemo(() => {
    const map = {};
    responses.forEach(r => {
      const name = getUserName(r.enumerator_id).split(' ').slice(0, 2).join(' ');
      if (!map[name]) map[name] = { name, total: 0, flagged: 0, clean: 0 };
      map[name].total++;
      if (r.flags?.out_of_sector || r.flags?.out_of_schedule || r.flags?.low_accuracy) {
        map[name].flagged++;
      } else {
        map[name].clean++;
      }
    });
    return Object.values(map);
  }, [responses]);

  // View response detail
  const viewResponse = (r) => {
    const form = formService.getVersionById(r.form_version_id);
    setSelectedResponse({ ...r, formVersion: form });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Centro de Monitoreo</h2>
          <p>Análisis de calidad, auditoría y detalle de respuestas</p>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: 600, fontSize: 13 }}>Proyecto:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ minWidth: 260 }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label style={{ fontWeight: 600, fontSize: 13, marginLeft: 12 }}><Filter size={12} /> Filtrar:</label>
        <select value={filterFlag} onChange={e => setFilterFlag(e.target.value)}>
          <option value="all">Todas las respuestas</option>
          <option value="clean">Sin alertas</option>
          <option value="out_of_sector">Fuera de sector</option>
          <option value="out_of_schedule">Fuera de horario</option>
          <option value="low_accuracy">Baja precisión</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Stat cards */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div className="stat-info">
              <h4>{s.value}</h4>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
          Tabla de Respuestas
        </button>
        <button className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>
          Gráficos de Análisis
        </button>
      </div>

      {/* Table View */}
      {activeTab === 'table' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Encuestador</th>
                <th>Tarea</th>
                <th>Hora Inicio</th>
                <th>Hora Envío</th>
                <th>Precisión GPS</th>
                <th>Alertas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
                  No hay respuestas con este filtro
                </td></tr>
              ) : filtered.map(r => {
                const task = allTasks.find(t => t.id === r.task_id);
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'var(--primary-50)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 11, flexShrink: 0
                        }}>
                          {getUserName(r.enumerator_id).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{getUserName(r.enumerator_id)}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{task?.title || r.task_id}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.started_at)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.submitted_at)}</td>
                    <td>
                      <span className={`badge ${r.accuracy_m > 80 ? 'badge-danger' : r.accuracy_m > 30 ? 'badge-warning' : 'badge-success'}`}>
                        {r.accuracy_m}m
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {r.flags?.out_of_sector && <span className="badge badge-danger">Sector</span>}
                        {r.flags?.out_of_schedule && <span className="badge badge-warning">Horario</span>}
                        {r.flags?.low_accuracy && <span className="badge badge-warning">Precisión</span>}
                        {r.flags?.offline_capture && <span className="badge badge-gray">Offline</span>}
                        {!r.flags?.out_of_sector && !r.flags?.out_of_schedule && !r.flags?.low_accuracy && (
                          <span className="badge badge-success">OK</span>
                        )}
                      </div>
                    </td>
                    <td><span className={`badge ${r.status === 'sent' ? 'badge-success' : 'badge-warning'}`}>{r.status === 'sent' ? 'Enviada' : 'Pendiente'}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-xs" onClick={() => viewResponse(r)} title="Ver detalle">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts View */}
      {activeTab === 'charts' && (
        <>
          <div className="charts-grid">
            {/* Quality pie */}
            <div className="chart-card">
              <h4><AlertTriangle size={16} style={{ color: 'var(--warning)' }} /> Distribución de Calidad</h4>
              {qualityData.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}><p>Sin datos</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={qualityData} cx="50%" cy="50%"
                      innerRadius={70} outerRadius={110} paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {qualityData.map((_, idx) => (
                        <Cell key={idx} fill={['#059669', '#dc2626', '#d97706', '#f59e0b'][idx]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Accuracy distribution */}
            <div className="chart-card">
              <h4><TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Distribución de Precisión GPS</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accuracyData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {accuracyData.map((_, idx) => (
                      <Cell key={idx} fill={['#059669', '#1e40af', '#d97706', '#dc2626'][idx]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enumerator performance */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <h4><Users size={16} style={{ color: 'var(--info)' }} /> Rendimiento por Encuestador</h4>
            {enumeratorPerformance.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}><p>Sin datos</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enumeratorPerformance} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Bar dataKey="clean" name="Sin alertas" fill="#059669" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="flagged" name="Con alertas" fill="#dc2626" stackId="a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {/* Response detail modal */}
      {selectedResponse && (
        <div className="modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}><Eye size={20} style={{ color: 'var(--primary)' }} /> Detalle de Respuesta</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedResponse(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Meta info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, padding: 20, background: '#f8fafc', borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Encuestador</div>
                <div style={{ fontWeight: 600 }}>{getUserName(selectedResponse.enumerator_id)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Tarea</div>
                <div style={{ fontWeight: 600 }}>{allTasks.find(t => t.id === selectedResponse.task_id)?.title || selectedResponse.task_id}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Hora de inicio</div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{formatDate(selectedResponse.started_at)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Hora de envío</div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{formatDate(selectedResponse.submitted_at)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Coordenadas GPS</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13 }}>{selectedResponse.lat?.toFixed(6)}, {selectedResponse.lng?.toFixed(6)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Precisión</div>
                <span className={`badge ${selectedResponse.accuracy_m > 80 ? 'badge-danger' : selectedResponse.accuracy_m > 30 ? 'badge-warning' : 'badge-success'}`}>
                  {selectedResponse.accuracy_m}m
                </span>
              </div>
            </div>

            {/* Flags */}
            <div style={{ marginBottom: 24 }}>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Alertas de Calidad</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedResponse.flags?.out_of_sector && <span className="badge badge-danger" style={{ fontSize: 13, padding: '6px 14px' }}>Fuera de sector</span>}
                {selectedResponse.flags?.out_of_schedule && <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px' }}>Fuera de horario</span>}
                {selectedResponse.flags?.low_accuracy && <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px' }}>Baja precisión GPS</span>}
                {selectedResponse.flags?.offline_capture && <span className="badge badge-gray" style={{ fontSize: 13, padding: '6px 14px' }}>Captura offline</span>}
                {!selectedResponse.flags?.out_of_sector && !selectedResponse.flags?.out_of_schedule && !selectedResponse.flags?.low_accuracy && (
                  <span className="badge badge-success" style={{ fontSize: 13, padding: '6px 14px' }}>Sin alertas - Respuesta válida</span>
                )}
              </div>
            </div>

            {/* Answers */}
            <div>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Respuestas del Formulario</h5>
              {selectedResponse.formVersion?.fields ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedResponse.formVersion.fields.map((field, idx) => {
                    const answer = selectedResponse.answers?.[field.id];
                    let displayAnswer = answer;
                    if (Array.isArray(answer)) displayAnswer = answer.join(', ');
                    if (typeof answer === 'boolean') displayAnswer = answer ? 'Sí' : 'No';
                    if (answer === null || answer === undefined) displayAnswer = '—';

                    return (
                      <div key={field.id} style={{
                        padding: '14px 18px', borderRadius: 10,
                        border: '1px solid var(--border)', background: '#fff'
                      }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Pregunta {idx + 1} · {FIELD_TYPE_LABELS[field.type]}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                          {field.label}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                          {String(displayAnswer)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                  <pre style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedResponse.answers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
