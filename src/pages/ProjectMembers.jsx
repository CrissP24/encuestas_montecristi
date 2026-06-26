import { useState, useMemo } from 'react';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import { Users, Plus, UserMinus, UserCheck } from 'lucide-react';

export default function ProjectMembers() {
  const { user, isSuperAdmin } = useAuth();
  const projects = isSuperAdmin() ? projectService.getAll() : projectService.getByCompany(user.company_id);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addForm, setAddForm] = useState({ user_id: '', role: ROLES.ENUMERATOR });

  const reloadMembers = (pid) => {
    const pId = pid || selectedProject;
    setMembers(projectService.getMembers(pId));
  };

  useMemo(() => {
    if (selectedProject) reloadMembers(selectedProject);
  }, [selectedProject]);

  const allUsers = authService.getUsers();
  const project = projects.find(p => p.id === selectedProject);
  const companyUsers = project ? allUsers.filter(u => u.company_id === project.company_id) : [];
  const existingUserIds = members.map(m => m.user_id);
  const availableUsers = companyUsers.filter(u => !existingUserIds.includes(u.id) && u.role !== ROLES.SUPER_ADMIN);

  const handleAdd = () => {
    if (!addForm.user_id) return;
    projectService.addMember({ project_id: selectedProject, user_id: addForm.user_id, role: addForm.role });
    setShowModal(false);
    reloadMembers();
  };

  const handleToggle = (memberId) => {
    projectService.toggleMemberActive(memberId);
    reloadMembers();
  };

  const handleRemove = (memberId) => {
    if (confirm('¿Eliminar este miembro?')) {
      projectService.removeMember(memberId);
      reloadMembers();
    }
  };

  const getUserName = (id) => allUsers.find(u => u.id === id)?.name || id;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Miembros del Proyecto</h2>
          <p>Gestión de equipos por proyecto</p>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: 600, fontSize: 13 }}>Proyecto:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ minWidth: 250 }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => { setAddForm({ user_id: '', role: ROLES.ENUMERATOR }); setShowModal(true); }}>
          <Plus size={14} /> Agregar Miembro
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No hay miembros asignados</td></tr>
            ) : members.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 500 }}>
                  <Users size={14} style={{ marginRight: 6, color: '#6366f1', verticalAlign: 'middle' }} />
                  {getUserName(m.user_id)}
                </td>
                <td><span className={`badge ${m.role === ROLES.SUPERVISOR ? 'badge-purple' : 'badge-info'}`}>{m.role.replace(/_/g, ' ')}</span></td>
                <td>
                  <span className={`badge ${m.is_active ? 'badge-success' : 'badge-gray'}`}>
                    {m.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => handleToggle(m.id)}>
                    {m.is_active ? <UserMinus size={14} /> : <UserCheck size={14} />}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemove(m.id)}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Agregar Miembro al Proyecto</h3>
            <div className="form-group">
              <label>Usuario</label>
              <select className="form-control" value={addForm.user_id} onChange={e => setAddForm({...addForm, user_id: e.target.value})}>
                <option value="">Seleccionar usuario</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.replace(/_/g,' ')})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Rol en el Proyecto</label>
              <select className="form-control" value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})}>
                <option value={ROLES.SUPERVISOR}>Supervisor</option>
                <option value={ROLES.ENUMERATOR}>Encuestador</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAdd}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
