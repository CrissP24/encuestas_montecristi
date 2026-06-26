import { useState } from 'react';
import { projectService } from '../services/projectService';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, Edit } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Projects() {
  const { user, isSuperAdmin } = useAuth();
  const [projects, setProjects] = useState(projectService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', company_id: '' });

  const companies = companyService.getAll();
  const filteredProjects = isSuperAdmin() ? projects : projects.filter(p => p.company_id === user.company_id);

  const reload = () => setProjects(projectService.getAll());

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '', company_id: isSuperAdmin() ? '' : user.company_id });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description, company_id: p.company_id });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.company_id) return;
    if (editId) {
      projectService.update(editId, form);
    } else {
      projectService.create(form);
    }
    setShowModal(false);
    reload();
  };

  const getCompanyName = (id) => companies.find(c => c.id === id)?.name || id;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p>Gestión de proyectos por empresa</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Proyecto</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Empresa</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No hay proyectos</td></tr>
            ) : filteredProjects.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}><FolderKanban size={14} style={{ marginRight: 6, color: '#6366f1', verticalAlign: 'middle' }} />{p.name}</td>
                <td>{getCompanyName(p.company_id)}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                <td><span className="badge badge-success">{p.status}</span></td>
                <td>{formatDate(p.created_at)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><Edit size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
            {isSuperAdmin() && (
              <div className="form-group">
                <label>Empresa</label>
                <select className="form-control" value={form.company_id} onChange={e => setForm({...form, company_id: e.target.value})}>
                  <option value="">Seleccionar empresa</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Nombre del Proyecto</label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
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
