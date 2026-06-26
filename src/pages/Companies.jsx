import { useState } from 'react';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Companies() {
  const { isSuperAdmin } = useAuth();
  const [companies, setCompanies] = useState(companyService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', ruc: '' });

  if (!isSuperAdmin()) {
    return <div className="empty-state"><h3>Acceso denegado</h3><p>Solo Super Admin puede gestionar empresas</p></div>;
  }

  const reload = () => setCompanies(companyService.getAll());

  const openCreate = () => { setEditId(null); setForm({ name: '', ruc: '' }); setShowModal(true); };

  const openEdit = (c) => { setEditId(c.id); setForm({ name: c.name, ruc: c.ruc }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      companyService.update(editId, form);
    } else {
      companyService.create(form);
    }
    setShowModal(false);
    reload();
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar esta empresa?')) {
      companyService.remove(id);
      reload();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Empresas</h2>
          <p>Gestión de empresas registradas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nueva Empresa</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>RUC</th>
              <th>Estado</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}><Building2 size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} />{c.name}</td>
                <td style={{ fontFamily: 'monospace' }}>{c.ruc}</td>
                <td><span className="badge badge-success">{c.status}</span></td>
                <td>{formatDate(c.created_at)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)} style={{ marginRight: 6 }}><Edit size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre de la empresa" />
            </div>
            <div className="form-group">
              <label>RUC</label>
              <input className="form-control" value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} placeholder="1234567890001" />
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
