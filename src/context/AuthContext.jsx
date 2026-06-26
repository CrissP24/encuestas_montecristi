import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const result = authService.login(email, password);
    if (result.success) setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isSuperAdmin = () => user?.role === ROLES.SUPER_ADMIN;
  const isAdminCompany = () => user?.role === ROLES.ADMIN_COMPANY;
  const isSupervisor = () => user?.role === ROLES.SUPERVISOR;
  const isEnumerator = () => user?.role === ROLES.ENUMERATOR;

  const hasPermission = (projectId, permissionCode) => {
    if (!user) return false;
    if (isSuperAdmin() || isAdminCompany()) return true;
    return projectService.hasPermission(user.id, projectId, permissionCode);
  };

  const value = {
    user, loading, login, logout,
    isSuperAdmin, isAdminCompany, isSupervisor, isEnumerator,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
