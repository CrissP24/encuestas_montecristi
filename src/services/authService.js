import { getStore, setStore } from '../utils/helpers';
import { SEED_USERS } from '../utils/constants';

const USERS_KEY = 'ta_users';
const AUTH_KEY = 'ta_auth';

function ensureUsers() {
  if (!getStore(USERS_KEY)) {
    setStore(USERS_KEY, SEED_USERS);
  }
  return getStore(USERS_KEY);
}

export const authService = {
  login(email, password) {
    const users = ensureUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: 'Credenciales inválidas' };
    const { password: _, ...safeUser } = user;
    setStore(AUTH_KEY, safeUser);
    return { success: true, user: safeUser };
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser() {
    return getStore(AUTH_KEY);
  },

  getUsers() {
    return ensureUsers();
  },

  getUsersByCompany(companyId) {
    return ensureUsers().filter(u => u.company_id === companyId);
  },

  getUserById(id) {
    return ensureUsers().find(u => u.id === id);
  },

  createUser(userData) {
    const users = ensureUsers();
    users.push(userData);
    setStore(USERS_KEY, users);
    return userData;
  }
};
