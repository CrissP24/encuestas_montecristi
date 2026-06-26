import { useState, useMemo } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { formService } from '../services/formService';
import { sectorService } from '../services/sectorService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, ROLES, TASK_STATUS } from '../utils/constants';
import { ClipboardList, Plus, Edit } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Tasks() {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const projects = isSuperAdmin()
    ? projectService.getAll()
    : projectService.getByCompany(user.company_id);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', form_version_id: '', sector_id: '', supervisor_id: '',
    enumerators: [], start_at: '', end_at: '', status: 'active'
  });

  const allUsers = authService.getUsers();

  useMemo(() => {
    if (selectedProject) setTasks(taskService.getByProject(selectedProject));
  }, [selectedProject]);

  const reload = () => setTasks(taskService.getByProject(selectedProject));

  const canCreate = isSuperAdmin() || hasPermission(selectedProject, PERMISSIONS.P_TASK_CREATE);
  const canEdit = isSuperAdmin() || hasPermission(selectedProject, PERMISSIONS.P_TASK_EDIT);
  const canAssign = isSuperAdmin() || hasPermission(selectedProject, PERMISSIONS.P_ASSIGN_ENUMERATORS);

  // Get available form versions for this project
  const projectForms = formService.getByProject(selectedProject);
  const formVersions = [];
  projectForms.forEach(f => {
    (f.versions || []).forEach(v => {
      formVersions.push({ id: v.id, label: `${f.name} v${v.version}` });
    });
  });

  const sectors = sectorService.getByProject(selectedProject);
  const members = projectService.getMembers(selectedProject);
  const supervisors = members.filter(m => m.role === ROLES.SUPERVISOR);
  const enumerators = members.filter(m => m.role === ROLES.ENUMERATOR);

  const getUserName = (id) => allUsers.find(u => u.id === id)?.name || id;

  const openCreate = () => {
    if (!canCreate) return alert('No tienes permiso para crear tareas');
    setEditId(null);
    setForm({ title: '', form_version_id: formVersions[0]?.id || '', sector_id: sectors[0]?.id || '',
      supervisor_id: '', enumerators: [], start_at: '', end_at: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    if (!canEdit) return alert('No tienes permiso para editar tareas');
    setEditId(t.id);
    setForm({
      title: t.title, form_version_id: t.form_version_id, sector_id: t.sector_id,
      supervisor_id: t.supervisor_id, enumerators: t.enumerators || [],
      start_at: t.start_at?.slice(0, 16) || '', end_at: t.end_at?.slice(0, 16) || '', status: t.status
    });
    setShowModal(true);
  };

  const toggleEnumerator = (uid) => {
    if (!canAssign) return;
    setForm(prev => ({
      ...prev,
      enumerators: prev.enumerators.includes(uid)
        ? prev.enumerators.filter(e => e !== uid)
        : [...prev.enumerators, uid]
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      ...form, project_id: selectedProject,
      start_at: form.start_at ? new Date(form.start_at).toISOString() : '',
      end_at: form.end_at ? new Date(form.end_at).toISOString() : '',
    };
    if (editId) {
      taskService.update(editId, data);
    } else {
      taskService.create(data);
    }
    setShowModal(false);
    reload();
  };

  const statusColor = (s) => {
    if (s === 'active') return 'badge-success';
    if (s === 'completed') return 'badge-info';
    if (s === 'cancelled') return 'badge-danger';
    return 'badge-gray';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tareas</h2>
          <p>Asignación y seguimiento de tareas de campo</p>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: 600, fontSize: 13 }}>Proyecto:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ minWidth: 250 }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {canCreate && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} /> Nueva Tarea
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Formulario</th>
              <th>Sector</th>
              <th>Supervisor</th>
              <th>Encuestadores</th>
              <th>Período</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No hay tareas</td></tr>
            ) : tasks.map(t => {
              const fv = formService.getVersionById(t.form_version_id);
              const sec = sectorService.getById(t.sector_id);
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>
                    <ClipboardList size={14} style={{ marginRight: 6, color: '#6366f1', verticalAlign: 'middle' }} />
                    {t.title}
                  </td>
                  <td style={{ fontSize: 13 }}>{fv ? `${fv.formName} v${fv.version}` : t.form_version_id}</td>
                  <td style={{ fontSize: 13 }}>{sec?.name || t.sector_id}</td>
                  <td>{getUserName(t.supervisor_id)}</td>
                  <td>
                    <div className="multi-select-tags">
                      {(t.enumerators || []).map(e => (
                        <span key={e} className="tag">{getUserName(e)}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {formatDate(t.start_at)}<br/>{formatDate(t.end_at)}
                  </td>
                  <td><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                  <td>
                    {canEdit && (
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}><Edit size={14} /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
            <div className="form-group">
              <label>Título de la tarea</label>
              <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="modal-grid-2">
              <div className="form-group">
                <label>Formulario / Versión</label>
                <select className="form-control" value={form.form_version_id} onChange={e => setForm({...form, form_version_id: e.target.value})}>
                  <option value="">Seleccionar</option>
                  {formVersions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Sector</label>
                <select className="form-control" value={form.sector_id} onChange={e => setForm({...form, sector_id: e.target.value})}>
                  <option value="">Seleccionar</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Supervisor</label>
              <select className="form-control" value={form.supervisor_id} onChange={e => setForm({...form, supervisor_id: e.target.value})}>
                <option value="">Seleccionar</option>
                {supervisors.map(m => <option key={m.user_id} value={m.user_id}>{getUserName(m.user_id)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Encuestadores {!canAssign && <span style={{ color: '#ef4444', fontSize: 11 }}>(sin permiso)</span>}</label>
              <div className="checkbox-group">
                {enumerators.map(m => (
                  <div key={m.user_id} className="checkbox-item" onClick={() => toggleEnumerator(m.user_id)} style={{ opacity: canAssign ? 1 : 0.5 }}>
                    <input type="checkbox" checked={form.enumerators.includes(m.user_id)} onChange={() => {}} disabled={!canAssign} />
                    <span className="label">{getUserName(m.user_id)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-grid-2">
              <div className="form-group">
                <label>Inicio</label>
                <input className="form-control" type="datetime-local" value={form.start_at} onChange={e => setForm({...form, start_at: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Fin</label>
                <input className="form-control" type="datetime-local" value={form.end_at} onChange={e => setForm({...form, end_at: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {Object.entries(TASK_STATUS).map(([k, v]) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
