import { getStore, setStore, generateId } from '../utils/helpers';
import { SEED_COMPANIES } from '../utils/constants';

const KEY = 'ta_companies';

function ensure() {
  if (!getStore(KEY)) setStore(KEY, SEED_COMPANIES);
  return getStore(KEY);
}

export const companyService = {
  getAll() {
    return ensure();
  },

  getById(id) {
    return ensure().find(c => c.id === id);
  },

  create(data) {
    const companies = ensure();
    const company = { id: generateId('c'), ...data, status: 'active', created_at: new Date().toISOString() };
    companies.push(company);
    setStore(KEY, companies);
    return company;
  },

  update(id, data) {
    const companies = ensure();
    const idx = companies.findIndex(c => c.id === id);
    if (idx === -1) return null;
    companies[idx] = { ...companies[idx], ...data };
    setStore(KEY, companies);
    return companies[idx];
  },

  remove(id) {
    const companies = ensure().filter(c => c.id !== id);
    setStore(KEY, companies);
  }
};
