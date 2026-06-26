import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { formService } from '../services/formService';
import { responseService } from '../services/responseService';
import { sectorService } from '../services/sectorService';
import { projectService } from '../services/projectService';
import { computeFlags, generateId, formatDate } from '../utils/helpers';
import {
  ClipboardList, MapPin, Send, ChevronRight, ChevronLeft,
  CheckCircle, AlertTriangle, WifiOff, Loader2, ClipboardCheck,
  BarChart3, FileCheck, Clock, User, TrendingUp, Eye, X,
  RefreshCw, Calendar, Hash
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FIELD_TYPE_LABELS } from '../utils/constants';

const CHART_COLORS = ['#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9'];

// ─── Componente reutilizable para campo de respuesta ─────────────────────────
function FieldInput({ field, value, onChange, error }) {
  const handleMulti = (opt) => {
    const cur = Array.isArray(value) ? value : [];
    onChange(cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt]);
  };

  return (
    <div>
      {field.type === 'text' && (
        <input className="form-control" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Escribe tu respuesta..." />
      )}
      {field.type === 'number' && (
        <input className="form-control" type="number" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Ingresa un número..." />
      )}
      {field.type === 'yes_no' && (
        <div style={{ display: 'flex', gap: 12 }}>
          {['Sí', 'No'].map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: `2px solid ${value === opt ? 'var(--primary)' : 'var(--border)'}`, background: value === opt ? 'var(--primary-50)' : '#fff', color: value === opt ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 15, transition: 'all 0.15s' }}>
              {opt}
            </button>
          ))}
        </div>
      )}
      {field.type === 'single_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(field.options || []).map(opt => (
            <label key={opt} onClick={() => onChange(opt)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `2px solid ${value === opt ? 'var(--primary)' : 'var(--border)'}`, background: value === opt ? 'var(--primary-50)' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: value === opt ? 600 : 400, transition: 'all 0.15s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${value === opt ? 'var(--primary)' : 'var(--border)'}`, background: value === opt ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                {value === opt && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
              </div>
              {opt}
            </label>
          ))}
        </div>
      )}
      {field.type === 'multi_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(field.options || []).map(opt => {
            const sel = (Array.isArray(value) ? value : []).includes(opt);
            return (
              <label key={opt} onClick={() => handleMulti(opt)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: sel ? 'var(--primary-50)' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: sel ? 600 : 400, transition: 'all 0.15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: sel ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                  {sel && <CheckCircle size={11} color="#fff" />}
                </div>
                {opt}
              </label>
            );
          })}
        </div>
      )}
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} />{error}</p>}
    </div>
  );
}

// ─── Pestaña: Mis Estadísticas ───────────────────────────────────────────────
function MyStats({ userId }) {
  const myResponses = responseService.getByEnumerator(userId);
  const allTasks = taskService.getAll();
  const allForms = formService.getAll();

  const byTask = useMemo(() => {
    const m = {};
    myResponses.forEach(r => {
      const t = allTasks.find(x => x.id === r.task_id);
      const name = t?.title || r.task_id;
      m[name] = (m[name] || 0) + 1;
    });
    return Object.entries(m).map(([name, count]) => ({ name, encuestas: count }));
  }, [myResponses]);

  const bySector = useMemo(() => {
    const m = {};
    myResponses.forEach(r => {
      const t = allTasks.find(x => x.id === r.task_id);
      const sec = t ? sectorService.getById(t.sector_id) : null;
      const name = sec?.name || 'Sin sector';
      m[name] = (m[name] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [myResponses]);

  const flagStats = useMemo(() => [
    { name: 'Válidas', value: myResponses.filter(r => !r.flags?.out_of_sector && !r.flags?.out_of_schedule).length },
    { name: 'Fuera sector', value: myResponses.filter(r => r.flags?.out_of_sector).length },
    { name: 'Fuera horario', value: myResponses.filter(r => r.flags?.out_of_schedule).length },
    { name: 'Offline', value: myResponses.filter(r => r.flags?.offline_capture).length },
  ].filter(d => d.value > 0), [myResponses]);

  const sent = myResponses.filter(r => r.status === 'sent').length;
  const pending = myResponses.filter(r => r.status === 'pending').length;

  if (myResponses.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: 40 }}>
        <BarChart3 size={48} style={{ opacity: 0.25, marginBottom: 16 }} />
        <h3>Sin estadísticas aún</h3>
        <p>Completa encuestas para ver tus estadísticas aquí</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 24 }}>
        {[
          { icon: FileCheck, label: 'Total Enviadas', value: myResponses.length, color: 'primary' },
          { icon: CheckCircle, label: 'Sincronizadas', value: sent, color: 'success' },
          { icon: Clock, label: 'Pendientes', value: pending, color: 'warning' },
          { icon: AlertTriangle, label: 'Con alertas', value: myResponses.filter(r => r.flags?.out_of_sector || r.flags?.out_of_schedule).length, color: 'danger' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div className="stat-info"><h4>{s.value}</h4><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4><BarChart3 size={16} style={{ color: 'var(--primary)' }} /> Encuestas por Tarea</h4>
          {byTask.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byTask} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="encuestas" fill="#1e40af" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <h4><TrendingUp size={16} style={{ color: 'var(--success)' }} /> Calidad de mis Encuestas</h4>
          {flagStats.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={flagStats} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {flagStats.map((_, i) => <Cell key={i} fill={['#059669', '#dc2626', '#d97706', '#94a3b8'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent responses */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCheck size={18} style={{ color: 'var(--primary)' }} /> Mis últimas encuestas
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Tarea</th><th>Sector</th><th>Fecha</th><th>Estado</th><th>Alertas</th></tr></thead>
            <tbody>
              {myResponses.slice().reverse().slice(0, 10).map(r => {
                const t = allTasks.find(x => x.id === r.task_id);
                const sec = t ? sectorService.getById(t.sector_id) : null;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{t?.title || '—'}</td>
                    <td style={{ fontSize: 13 }}>{sec?.name || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(r.submitted_at)}</td>
                    <td><span className={`badge ${r.status === 'sent' ? 'badge-success' : 'badge-warning'}`}>{r.status === 'sent' ? 'Enviada' : 'Pendiente'}</span></td>
                    <td>
                      {r.flags?.out_of_sector && <span className="badge badge-danger" style={{ marginRight: 4 }}>Sector</span>}
                      {r.flags?.out_of_schedule && <span className="badge badge-warning" style={{ marginRight: 4 }}>Horario</span>}
                      {!r.flags?.out_of_sector && !r.flags?.out_of_schedule && <span className="badge badge-success">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal Survey ─────────────────────────────────────────────
export default function Survey() {
  const { user } = useAuth();
  const [tab, setTab] = useState('tasks'); // tasks | stats
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formVersion, setFormVersion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0); // 0=lista, 1=llenando, 2=confirm, 3=done
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [gettingGps, setGettingGps] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());
  const [errors, setErrors] = useState({});
  // Encuesta anónima: no se registra el nombre del encuestado.

  const loadTasks = () => {
    const myTasks = taskService.getByEnumerator(user.id).filter(t => t.status === 'active');
    setTasks(myTasks);
  };

  useEffect(() => { loadTasks(); }, [user.id]);

  const requestGps = () => {
    setGettingGps(true); setGpsError('');
    if (!navigator.geolocation) {
      setGps({ lat: -1.0486, lng: -80.6606, accuracy_m: 15 }); setGettingGps(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy_m: Math.round(pos.coords.accuracy) }); setGettingGps(false); },
      () => { setGps({ lat: -1.0486, lng: -80.6606, accuracy_m: 25 }); setGpsError('GPS no disponible, usando ubicación aproximada'); setGettingGps(false); },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const startSurvey = (task) => {
    const fv = formService.getVersionById(task.form_version_id);
    if (!fv) return alert('El formulario no está disponible');
    setSelectedTask(task); setFormVersion(fv);
    setAnswers({}); setErrors({});
    startedAtRef.current = new Date().toISOString();
    setStep(1); requestGps();
  };

  const fields = formVersion?.fields || [];

  const setAnswer = (id, val) => {
    setAnswers(p => ({ ...p, [id]: val }));
    setErrors(p => { const n = { ...p }; delete n[id]; return n; });
  };

  const validateAll = () => {
    const errs = {};
    fields.forEach(f => {
      if (!f.required) return;
      const v = answers[f.id];
      if (v === undefined || v === null || v === '') errs[f.id] = 'Obligatorio';
      if (Array.isArray(v) && v.length === 0) errs[f.id] = 'Selecciona al menos una opción';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToConfirm = () => { if (validateAll()) setStep(2); };

  const submitSurvey = () => {
    const sector = sectorService.getById(selectedTask.sector_id);
    const lat = gps?.lat || -1.0486, lng = gps?.lng || -80.6606, accuracy_m = gps?.accuracy_m || 30;
    const flags = sector
      ? computeFlags(lat, lng, accuracy_m, sector, selectedTask, !navigator.onLine)
      : { offline_capture: !navigator.onLine, low_accuracy: accuracy_m > 80, out_of_sector: false, out_of_schedule: false };
    // Metadatos detectados automáticamente (no se preguntan al ciudadano)
    const area = sector && /rural/i.test(sector.name) ? 'Rural' : 'Urbana';
    responseService.create({
      project_id: selectedTask.project_id, task_id: selectedTask.id,
      form_version_id: selectedTask.form_version_id, enumerator_id: user.id,
      respondent_name: 'Anónimo',
      sector_name: sector?.name || null, area,
      answers, lat, lng, accuracy_m, flags,
      started_at: startedAtRef.current, submitted_at: new Date().toISOString(),
      status: navigator.onLine ? 'sent' : 'pending',
    });
    setStep(3);
  };

  const resetSurvey = () => {
    setSelectedTask(null); setFormVersion(null); setAnswers({}); setErrors({});
    setGps(null); setStep(0); loadTasks();
  };

  // ── RENDER según step ─────────────────────────────────────────────────────

  // Step 3: éxito
  if (step === 3) return (
    <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(5,150,105,0.2)' }}>
        <CheckCircle size={48} style={{ color: '#059669' }} />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>¡Encuesta Registrada!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: 15 }}>
        La encuesta anónima fue guardada {navigator.onLine ? 'y sincronizada.' : 'localmente.'}
      </p>
      {!navigator.onLine && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 20px', background: '#fef3c7', borderRadius: 10, margin: '16px 0', color: '#92400e', fontSize: 13 }}>
          <WifiOff size={16} /> Sin conexión — se sincronizará después
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
        <button className="btn btn-outline" onClick={() => { resetSurvey(); setTab('stats'); }}>Ver mis estadísticas</button>
        <button className="btn btn-primary" onClick={resetSurvey}>Nueva Encuesta</button>
      </div>
    </div>
  );

  // Step 2: confirmación
  if (step === 2) {
    const sector = sectorService.getById(selectedTask.sector_id);
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}><ChevronLeft size={14} /> Volver</button>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Confirmar y Enviar</h2>
        </div>
        {/* Datos detectados automáticamente y GPS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MapPin size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Sector / Área (automático)</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{sector?.name || '—'}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {sector && /rural/i.test(sector.name) ? 'Área rural' : 'Área urbana'} · Encuesta anónima
            </p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MapPin size={16} style={{ color: gps ? 'var(--success)' : 'var(--warning)' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Ubicación GPS</span>
              {gettingGps && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            </div>
            {gps ? (
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}<br />±{gps.accuracy_m}m
                {gpsError && <div style={{ color: 'var(--warning)', fontFamily: 'sans-serif', marginTop: 4 }}>{gpsError}</div>}
              </div>
            ) : <button className="btn btn-outline btn-sm" onClick={requestGps}>Obtener GPS</button>}
          </div>
        </div>
        {/* Resumen respuestas */}
        <div className="card" style={{ padding: 0, marginBottom: 24 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
            <span>Resumen de respuestas</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>{fields.length} preguntas</span>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {fields.map((f, i) => {
              const v = answers[f.id];
              let d = v;
              if (Array.isArray(v)) d = v.join(', ') || '—';
              if (v === undefined || v === null || v === '') d = <em style={{ color: 'var(--text-muted)' }}>Sin respuesta</em>;
              return (
                <div key={f.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 14, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 22, fontWeight: 600 }}>{i + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={() => setStep(1)}>Editar</button>
          <button className="btn btn-primary" onClick={submitSurvey} style={{ padding: '11px 28px' }}>
            <Send size={16} /> Enviar Encuesta
          </button>
        </div>
      </div>
    );
  }

  // Step 1: formulario
  if (step === 1) {
    const total = fields.length;
    const answered = fields.filter(f => {
      const v = answers[f.id];
      return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    }).length;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
    const sector = sectorService.getById(selectedTask.sector_id);

    return (
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        {/* Header sticky */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', borderRadius: 16, padding: '22px 28px', marginBottom: 24, color: '#fff', position: 'sticky', top: 16, zIndex: 10, boxShadow: '0 8px 32px rgba(30,64,175,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4, letterSpacing: 0.5 }}>ENCUESTANDO EN</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{sector?.name || 'Sin sector'}</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{formVersion?.formName} · {total} preguntas</p>
            </div>
            <button onClick={resetSurvey} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Cancelar
            </button>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 5 }}>
              <span>{answered} de {total} respondidas</span><span>{progress}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #60a5fa, #a5f3fc)', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Aviso de encuesta anónima */}
        <div className="card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--primary-50)', border: '1px solid var(--border)' }}>
          <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Encuesta <strong>anónima</strong>. La fecha, hora, sector y área se registran automáticamente.
          </span>
        </div>

        {/* Preguntas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map((field, idx) => (
            <div key={field.id} className="card" style={{ padding: 22, border: errors[field.id] ? '2px solid var(--danger)' : '1px solid var(--border)', transition: 'all 0.15s' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <span style={{ background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{idx + 1}</span>
                <span>{field.label}{field.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}</span>
              </label>
              <FieldInput field={field} value={answers[field.id]} onChange={v => setAnswer(field.id, v)} error={errors[field.id]} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, marginBottom: 60, display: 'flex', gap: 12, justifyContent: 'flex-end', position: 'sticky', bottom: 20 }}>
          <button className="btn btn-outline" onClick={resetSurvey}>Cancelar</button>
          <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15, boxShadow: '0 4px 16px rgba(30,64,175,0.3)' }} onClick={goToConfirm}>
            Revisar y Enviar <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Step 0: lista de tareas + tabs
  const myResponses = responseService.getByEnumerator(user.id);

  return (
    <div>
      {/* Header con tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Mis Encuestas
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Bienvenido, <strong>{user.name}</strong> · {myResponses.length} encuestas registradas
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadTasks} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        <button className={`tab-btn ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          <ClipboardList size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mis Tareas
        </button>
        <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          <BarChart3 size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mis Estadísticas
        </button>
      </div>

      {tab === 'stats' && <MyStats userId={user.id} />}

      {tab === 'tasks' && (
        <>
          {tasks.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 20 }}>
              <div className="empty-icon"><ClipboardList size={32} style={{ color: 'var(--text-muted)' }} /></div>
              <h3>Sin tareas asignadas</h3>
              <p>El supervisor aún no te ha asignado tareas activas</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {tasks.map(task => {
                const fv = formService.getVersionById(task.form_version_id);
                const sector = sectorService.getById(task.sector_id);
                const taskResponses = responseService.getByTask(task.id).filter(r => r.enumerator_id === user.id);
                return (
                  <div key={task.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow)', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(30,64,175,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
                    {/* Card top accent */}
                    <div style={{ height: 5, background: 'linear-gradient(90deg, #1e40af, #0ea5e9)' }} />
                    <div style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ClipboardList size={22} style={{ color: 'var(--primary)' }} />
                        </div>
                        <span className="badge badge-success">Activa</span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)', lineHeight: 1.3 }}>{task.title}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <ClipboardCheck size={14} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                          <span>{fv ? `${fv.formName} · v${fv.version}` : 'Formulario'} · <strong style={{ color: 'var(--text-primary)' }}>{fv?.fields?.length || 0}</strong> preguntas</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <MapPin size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                          <strong style={{ color: 'var(--text-primary)' }}>{sector?.name || 'Sin sector'}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Hash size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          <span>Realizaste <strong style={{ color: 'var(--text-primary)' }}>{taskResponses.length}</strong> encuesta(s) en esta tarea</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12 }}>Hasta {formatDate(task.end_at)}</span>
                        </div>
                      </div>
                      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 8 }} onClick={() => startSurvey(task)}>
                        Iniciar Encuesta <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
