import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { responseService } from '../services/responseService';
import { formService } from '../services/formService';
import { authService } from '../services/authService';
import { sectorService } from '../services/sectorService';
import {
  BarChart3, Building2, FolderKanban, ClipboardList, FileCheck,
  AlertTriangle, MapPinOff, Clock, Users, TrendingUp, Activity,
  Shield, CheckCircle, WifiOff, MapPin, Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { formatDate } from '../utils/helpers';

const CHART_COLORS = ['#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9'];

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}><Icon size={22} /></div>
      <div className="stat-info">
        <h4>{value}</h4>
        <p>{label}</p>
        {sublabel && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sublabel}</span>}
      </div>
    </div>
  );
}

// ─── Dashboard SuperAdmin / AdminCompany ─────────────────────────────────────
function AdminDashboard({ user, isSuperAdmin }) {
  const companies = companyService.getAll();
  const allProjects = projectService.getAll();
  const allTasks = taskService.getAll();
  const allResponses = responseService.getAll();
  const allUsers = authService.getUsers();

  const projects = isSuperAdmin ? allProjects : allProjects.filter(p => p.company_id === user.company_id);
  const projectIds = projects.map(p => p.id);
  const tasks = allTasks.filter(t => projectIds.includes(t.project_id));
  const responses = allResponses.filter(r => projectIds.includes(r.project_id));

  const sent = responses.filter(r => r.status === 'sent').length;
  const outSector = responses.filter(r => r.flags?.out_of_sector).length;
  const outSchedule = responses.filter(r => r.flags?.out_of_schedule).length;
  const lowAccuracy = responses.filter(r => r.flags?.low_accuracy).length;

  const stats = [
    ...(isSuperAdmin ? [{ icon: Building2, label: 'Empresas', value: companies.length, color: 'primary' }] : []),
    { icon: FolderKanban, label: 'Proyectos', value: projects.length, color: 'info' },
    { icon: Users, label: 'Usuarios', value: allUsers.length, color: 'success' },
    { icon: ClipboardList, label: 'Tareas Activas', value: tasks.filter(t => t.status === 'active').length, color: 'success' },
    { icon: FileCheck, label: 'Respuestas', value: responses.length, color: 'primary', sublabel: `${sent} sincronizadas` },
    { icon: MapPinOff, label: 'Fuera de Sector', value: outSector, color: 'danger' },
    { icon: Clock, label: 'Fuera de Horario', value: outSchedule, color: 'warning' },
    { icon: AlertTriangle, label: 'Baja Precisión', value: lowAccuracy, color: 'warning' },
  ];

  const responsesByProject = useMemo(() => projects.map(p => ({
    name: p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name,
    respuestas: responses.filter(r => r.project_id === p.id).length,
    tareas: tasks.filter(t => t.project_id === p.id).length,
  })), [projects, responses, tasks]);

  const flagsData = useMemo(() => [
    { name: 'Sin alertas', value: responses.filter(r => !r.flags?.out_of_sector && !r.flags?.out_of_schedule && !r.flags?.low_accuracy).length },
    { name: 'Fuera de sector', value: outSector },
    { name: 'Fuera de horario', value: outSchedule },
    { name: 'Baja precisión', value: lowAccuracy },
  ].filter(d => d.value > 0), [responses, outSector, outSchedule, lowAccuracy]);

  const byEnumerator = useMemo(() => {
    const m = {};
    responses.forEach(r => {
      const u = allUsers.find(x => x.id === r.enumerator_id);
      const name = u ? u.name.split(' ').slice(0, 2).join(' ') : r.enumerator_id;
      m[name] = (m[name] || 0) + 1;
    });
    return Object.entries(m).map(([name, n]) => ({ name, respuestas: n })).sort((a, b) => b.respuestas - a.respuestas);
  }, [responses, allUsers]);

  const taskStatus = useMemo(() => [
    { name: 'Borrador', value: tasks.filter(t => t.status === 'draft').length },
    { name: 'Activas', value: tasks.filter(t => t.status === 'active').length },
    { name: 'Completadas', value: tasks.filter(t => t.status === 'completed').length },
  ].filter(d => d.value > 0), [tasks]);

  const getUserName = id => allUsers.find(u => u.id === id)?.name || id;

  return (
    <>
      <div className="card-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4><BarChart3 size={17} style={{ color: 'var(--primary)' }} /> Respuestas por Proyecto</h4>
          {responsesByProject.length === 0 ? <div className="empty-state" style={{ padding: 28 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={responsesByProject} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="respuestas" name="Respuestas" fill="#1e40af" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tareas" name="Tareas" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <h4><AlertTriangle size={17} style={{ color: 'var(--warning)' }} /> Calidad de Datos</h4>
          {flagsData.length === 0 ? <div className="empty-state" style={{ padding: 28 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie data={flagsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {flagsData.map((_, i) => <Cell key={i} fill={['#059669', '#dc2626', '#d97706', '#f59e0b'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4><Users size={17} style={{ color: 'var(--info)' }} /> Respuestas por Encuestador</h4>
          {byEnumerator.length === 0 ? <div className="empty-state" style={{ padding: 28 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byEnumerator} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="respuestas" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <h4><TrendingUp size={17} style={{ color: 'var(--success)' }} /> Estado de Tareas</h4>
          {taskStatus.length === 0 ? <div className="empty-state" style={{ padding: 28 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={taskStatus} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {taskStatus.map((_, i) => <Cell key={i} fill={['#94a3b8', '#059669', '#1e40af'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

        {/* Últimas respuestas */}
      <div className="card" style={{ padding: 0 }}>
        <div className="section-header">
          <span className="section-title"><FileCheck size={16} style={{ color: 'var(--primary)' }} /> Últimas Respuestas</span>
          <span className="badge badge-primary">{responses.length} total</span>
        </div>
        {responses.length === 0 ? <div className="empty-state"><p>No hay respuestas registradas</p></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Encuestador</th><th>Encuestado</th><th>Tarea</th><th>GPS</th><th>Alertas</th><th>Estado</th></tr></thead>
              <tbody>
                {responses.slice(-8).reverse().map(r => {
                  const t = allTasks.find(x => x.id === r.task_id);
                  const initials = getUserName(r.enumerator_id).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{initials}</div>
                          <span style={{ fontWeight: 500, fontSize: 13 }}>{getUserName(r.enumerator_id)}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{r.respondent_name || '—'}</td>
                      <td style={{ fontSize: 13 }}>{t?.title || r.task_id}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}<br />±{r.accuracy_m}m
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {r.flags?.out_of_sector && <span className="badge badge-danger">Sector</span>}
                          {r.flags?.out_of_schedule && <span className="badge badge-warning">Horario</span>}
                          {r.flags?.low_accuracy && <span className="badge badge-warning">Precisión</span>}
                          {r.flags?.offline_capture && <span className="badge badge-gray">Offline</span>}
                          {!r.flags?.out_of_sector && !r.flags?.out_of_schedule && !r.flags?.low_accuracy && <span className="badge badge-success">OK</span>}
                        </div>
                      </td>
                      <td><span className={`badge ${r.status === 'sent' ? 'badge-success' : 'badge-warning'}`}>{r.status === 'sent' ? 'Enviada' : 'Pendiente'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Dashboard Supervisor ────────────────────────────────────────────────────
function SupervisorDashboard({ user }) {
  const allTasks = taskService.getAll();
  const allResponses = responseService.getAll();
  const allUsers = authService.getUsers();
  const allProjects = projectService.getAll();
  const allSectors = sectorService.getAll();

  // Tareas supervisadas por este usuario
  const myTasks = allTasks.filter(t => t.supervisor_id === user.id);
  const projectIds = [...new Set(myTasks.map(t => t.project_id))];
  const taskIds = myTasks.map(t => t.id);
  const responses = allResponses.filter(r => taskIds.includes(r.task_id));

  const sent = responses.filter(r => r.status === 'sent').length;
  const pending = responses.filter(r => r.status === 'pending').length;
  const outSector = responses.filter(r => r.flags?.out_of_sector).length;
  const outSchedule = responses.filter(r => r.flags?.out_of_schedule).length;

  // Encuestadores asignados
  const enumeratorIds = [...new Set(myTasks.flatMap(t => t.enumerators || []))];
  const enumerators = allUsers.filter(u => enumeratorIds.includes(u.id));

  const byEnumerator = useMemo(() => {
    return enumerators.map(e => {
      const eResp = responses.filter(r => r.enumerator_id === e.id);
      return {
        name: e.name.split(' ').slice(0, 2).join(' '),
        total: eResp.length,
        validas: eResp.filter(r => !r.flags?.out_of_sector && !r.flags?.out_of_schedule).length,
        alertas: eResp.filter(r => r.flags?.out_of_sector || r.flags?.out_of_schedule).length,
      };
    });
  }, [enumerators, responses]);

  const bySector = useMemo(() => {
    const m = {};
    myTasks.forEach(t => {
      const sec = allSectors.find(s => s.id === t.sector_id);
      const name = sec?.name || t.sector_id;
      const n = responses.filter(r => r.task_id === t.id).length;
      m[name] = (m[name] || 0) + n;
    });
    return Object.entries(m).map(([name, value]) => ({ name, encuestas: value }));
  }, [myTasks, allSectors, responses]);

  const getUserName = id => allUsers.find(u => u.id === id)?.name || id;

  return (
    <>
      {/* Stats */}
      <div className="card-grid">
        {[
          { icon: ClipboardList, label: 'Mis Tareas Activas', value: myTasks.filter(t => t.status === 'active').length, color: 'primary' },
          { icon: Users, label: 'Mis Encuestadores', value: enumerators.length, color: 'info' },
          { icon: FileCheck, label: 'Respuestas Totales', value: responses.length, color: 'success', sublabel: `${sent} enviadas` },
          { icon: Clock, label: 'Pendientes Sync', value: pending, color: 'warning' },
          { icon: MapPinOff, label: 'Fuera de Sector', value: outSector, color: 'danger' },
          { icon: AlertTriangle, label: 'Fuera de Horario', value: outSchedule, color: 'warning' },
        ].map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4><Users size={16} style={{ color: 'var(--primary)' }} /> Rendimiento por Encuestador</h4>
          {byEnumerator.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byEnumerator} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="validas" name="Válidas" fill="#059669" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="alertas" name="Con alertas" fill="#dc2626" stackId="a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <h4><MapPin size={16} style={{ color: 'var(--danger)' }} /> Encuestas por Sector</h4>
          {bySector.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>Sin datos</p></div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bySector} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="encuestas" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Estado de mis encuestadores */}
      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div className="section-header">
          <span className="section-title"><Users size={16} style={{ color: 'var(--primary)' }} /> Estado de mis Encuestadores</span>
        </div>
        {enumerators.length === 0 ? <div className="empty-state"><p>Sin encuestadores asignados</p></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Encuestador</th><th>Encuestas realizadas</th><th>Válidas</th><th>Con alertas</th><th>Tasa de calidad</th></tr></thead>
              <tbody>
                {enumerators.map(e => {
                  const eData = byEnumerator.find(x => x.name === e.name.split(' ').slice(0, 2).join(' ')) || { total: 0, validas: 0, alertas: 0 };
                  const quality = eData.total > 0 ? Math.round((eData.validas / eData.total) * 100) : 0;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                            {e.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><strong style={{ fontSize: 18 }}>{eData.total}</strong></td>
                      <td><span className="badge badge-success">{eData.validas}</span></td>
                      <td><span className={`badge ${eData.alertas > 0 ? 'badge-danger' : 'badge-gray'}`}>{eData.alertas}</span></td>
                      <td>
                        <div className="quality-bar-wrap">
                          <div className="quality-track">
                            <div className="quality-fill" style={{ background: quality >= 80 ? '#059669' : quality >= 60 ? '#d97706' : '#dc2626', width: `${quality}%` }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, minWidth: 38 }}>{quality}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimas respuestas supervisor */}
      <div className="card" style={{ padding: 0 }}>
        <div className="section-header">
          <span className="section-title"><FileCheck size={16} style={{ color: 'var(--primary)' }} /> Últimas Respuestas</span>
        </div>
        {responses.length === 0 ? <div className="empty-state"><p>Sin respuestas aún</p></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Encuestador</th><th>Encuestado</th><th>Tarea</th><th>Hora</th><th>Alertas</th></tr></thead>
              <tbody>
                {responses.slice(-6).reverse().map(r => {
                  const t = allTasks.find(x => x.id === r.task_id);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{getUserName(r.enumerator_id)}</td>
                      <td style={{ fontSize: 13 }}>{r.respondent_name || '—'}</td>
                      <td style={{ fontSize: 13 }}>{t?.title || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(r.submitted_at)}</td>
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
        )}
      </div>
    </>
  );
}

// ─── Componente principal con welcome banner ─────────────────────────────────
const ROLE_META = {
  SUPER_ADMIN:    { label: 'Super Administrador', color: '#7c3aed', bg: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
  ADMIN_COMPANY:  { label: 'Administrador',        color: '#1e40af', bg: 'linear-gradient(135deg, #1e40af, #0284c7)' },
  SUPERVISOR:     { label: 'Supervisor de Campo',  color: '#059669', bg: 'linear-gradient(135deg, #065f46, #059669)' },
  ENUMERATOR:     { label: 'Encuestador',          color: '#d97706', bg: 'linear-gradient(135deg, #92400e, #d97706)' },
};

export default function Dashboard() {
  const { user, isSuperAdmin, isAdminCompany, isSupervisor } = useAuth();
  const meta = ROLE_META[user.role] || ROLE_META.ENUMERATOR;

  const allResponses = responseService.getAll();
  const allTasks = taskService.getAll();
  const projectIds = isSuperAdmin()
    ? projectService.getAll().map(p => p.id)
    : projectService.getAll().filter(p => p.company_id === user.company_id).map(p => p.id);
  const totalResponses = allResponses.filter(r => projectIds.includes(r.project_id)).length;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ background: meta.bg }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{meta.label}</span>
          <h2>Bienvenido, {user.name.split(' ')[0]} 👋</h2>
          <p>Panel de control · {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="welcome-meta">
            <span className="welcome-badge"><Shield size={11} /> {meta.label}</span>
            <span className="welcome-badge"><Activity size={11} /> {totalResponses} respuestas en tus proyectos</span>
          </div>
        </div>
      </div>

      {/* Render by role */}
      {(isSuperAdmin() || isAdminCompany()) && <AdminDashboard user={user} isSuperAdmin={isSuperAdmin()} />}
      {isSupervisor() && <SupervisorDashboard user={user} />}
    </div>
  );
}
