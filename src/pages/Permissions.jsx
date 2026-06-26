import { useState, useMemo } from 'react';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, PERMISSION_LABELS, ROLES } from '../utils/constants';
import { Shield, Check, X } from 'lucide-react';

export default function Permissions() {
  const { user, isSuperAdmin } = useAuth();
  const projects = isSuperAdmin() ? projectService.getAll() : projectService.getByCompany(user.company_id);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [perms, setPerms] = useState([]);

  const allUsers = authService.getUsers();

  useMemo(() => {
    if (selectedProject) {
      const m = projectService.getMembers(selectedProject).filter(m => m.role === ROLES.SUPERVISOR);
      setMembers(m);
      setSelectedMember(null);
      setPerms([]);
    }
  }, [selectedProject]);

  const loadPerms = (member) => {
    setSelectedMember(member);
    setPerms(projectService.getPermissions(member.id));
  };

  const togglePerm = (code) => {
    const current = perms.find(p => p.permission_code === code);
    const newEnabled = current ? !current.enabled : true;
    projectService.setPermission(selectedMember.id, code, newEnabled);
    setPerms(projectService.getPermissions(selectedMember.id));
  };

  const isEnabled = (code) => {
    const p = perms.find(p => p.permission_code === code);
    return p ? p.enabled : false;
  };

  const getUserName = (id) => allUsers.find(u => u.id === id)?.name || id;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Permisos RBAC</h2>
          <p>Gestión de permisos por miembro de proyecto</p>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: 600, fontSize: 13 }}>Proyecto:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ minWidth: 250 }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Supervisors list */}
        <div className="card">
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#64748b' }}>SUPERVISORES</h4>
          {members.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No hay supervisores asignados a este proyecto</p>
          ) : members.map(m => (
            <div key={m.id}
              onClick={() => loadPerms(m)}
              style={{
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                background: selectedMember?.id === m.id ? '#eef2ff' : 'transparent',
                border: `1px solid ${selectedMember?.id === m.id ? '#6366f1' : '#e2e8f0'}`,
                transition: 'all 0.15s'
              }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{getUserName(m.user_id)}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{m.role.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>

        {/* Permissions checklist */}
        <div className="card">
          {!selectedMember ? (
            <div className="empty-state">
              <Shield size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
              <h3>Selecciona un supervisor</h3>
              <p>Haz clic en un supervisor para gestionar sus permisos</p>
            </div>
          ) : (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                Permisos de {getUserName(selectedMember.user_id)}
              </h4>
              <div className="checkbox-group">
                {Object.keys(PERMISSIONS).map(code => (
                  <div key={code} className="checkbox-item" onClick={() => togglePerm(code)}>
                    <input type="checkbox" checked={isEnabled(code)} onChange={() => {}} />
                    <div>
                      <div className="label">{PERMISSION_LABELS[code]}</div>
                      <div className="desc">{code}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      {isEnabled(code) ?
                        <span className="badge badge-success"><Check size={12} /> Activo</span> :
                        <span className="badge badge-gray"><X size={12} /> Inactivo</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
