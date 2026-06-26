import { getStore, setStore, generateId } from '../utils/helpers';
import { SEED_PROJECTS, SEED_PROJECT_MEMBERS, SEED_PERMISSIONS, PERMISSIONS } from '../utils/constants';

const PROJ_KEY = 'ta_projects';
const MEMBERS_KEY = 'ta_project_members';
const PERMS_KEY = 'ta_project_member_permissions';

function ensureProjects() {
  if (!getStore(PROJ_KEY)) setStore(PROJ_KEY, SEED_PROJECTS);
  return getStore(PROJ_KEY);
}

function ensureMembers() {
  if (!getStore(MEMBERS_KEY)) setStore(MEMBERS_KEY, SEED_PROJECT_MEMBERS);
  return getStore(MEMBERS_KEY);
}

function ensurePermissions() {
  if (!getStore(PERMS_KEY)) setStore(PERMS_KEY, SEED_PERMISSIONS);
  return getStore(PERMS_KEY);
}

export const projectService = {
  // --- Projects ---
  getAll() {
    return ensureProjects();
  },

  getByCompany(companyId) {
    return ensureProjects().filter(p => p.company_id === companyId);
  },

  getById(id) {
    return ensureProjects().find(p => p.id === id);
  },

  create(data) {
    const projects = ensureProjects();
    const project = { id: generateId('p'), ...data, status: 'active', created_at: new Date().toISOString() };
    projects.push(project);
    setStore(PROJ_KEY, projects);
    return project;
  },

  update(id, data) {
    const projects = ensureProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], ...data };
    setStore(PROJ_KEY, projects);
    return projects[idx];
  },

  // --- Members ---
  getMembers(projectId) {
    return ensureMembers().filter(m => m.project_id === projectId);
  },

  getMemberById(id) {
    return ensureMembers().find(m => m.id === id);
  },

  getMemberByUserAndProject(userId, projectId) {
    return ensureMembers().find(m => m.user_id === userId && m.project_id === projectId);
  },

  addMember(data) {
    const members = ensureMembers();
    const member = { id: generateId('pm'), ...data, is_active: true };
    members.push(member);
    setStore(MEMBERS_KEY, members);
    return member;
  },

  removeMember(memberId) {
    const members = ensureMembers().filter(m => m.id !== memberId);
    setStore(MEMBERS_KEY, members);
  },

  toggleMemberActive(memberId) {
    const members = ensureMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx !== -1) {
      members[idx].is_active = !members[idx].is_active;
      setStore(MEMBERS_KEY, members);
    }
    return members[idx];
  },

  // --- Permissions ---
  getPermissions(projectMemberId) {
    return ensurePermissions().filter(p => p.project_member_id === projectMemberId);
  },

  setPermission(projectMemberId, permissionCode, enabled) {
    const perms = ensurePermissions();
    const existing = perms.find(p => p.project_member_id === projectMemberId && p.permission_code === permissionCode);
    if (existing) {
      existing.enabled = enabled;
    } else {
      perms.push({ id: generateId('perm'), project_member_id: projectMemberId, permission_code: permissionCode, enabled });
    }
    setStore(PERMS_KEY, perms);
  },

  /**
   * Comprueba si un usuario tiene un permiso específico en un proyecto
   */
  hasPermission(userId, projectId, permissionCode) {
    const member = this.getMemberByUserAndProject(userId, projectId);
    if (!member) return false;
    const perms = this.getPermissions(member.id);
    const perm = perms.find(p => p.permission_code === permissionCode);
    return perm ? perm.enabled : false;
  },

  /**
   * Devuelve todos los permisos habilitados de un usuario en un proyecto
   */
  getUserPermissions(userId, projectId) {
    const member = this.getMemberByUserAndProject(userId, projectId);
    if (!member) return [];
    return this.getPermissions(member.id).filter(p => p.enabled).map(p => p.permission_code);
  }
};
