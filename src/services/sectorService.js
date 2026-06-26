import { getStore, setStore, generateId } from '../utils/helpers';
import { SEED_SECTORS } from '../utils/constants';

const KEY = 'ta_sectors';

function ensure() {
  if (!getStore(KEY)) setStore(KEY, SEED_SECTORS);
  return getStore(KEY);
}

export const sectorService = {
  getAll() {
    return ensure();
  },

  getByProject(projectId) {
    return ensure().filter(s => s.project_id === projectId);
  },

  getById(id) {
    return ensure().find(s => s.id === id);
  },

  create(data) {
    const sectors = ensure();
    const sector = { id: generateId('s'), ...data, created_at: new Date().toISOString() };
    sectors.push(sector);
    setStore(KEY, sectors);
    return sector;
  },

  update(id, data) {
    const sectors = ensure();
    const idx = sectors.findIndex(s => s.id === id);
    if (idx === -1) return null;
    sectors[idx] = { ...sectors[idx], ...data };
    setStore(KEY, sectors);
    return sectors[idx];
  },

  remove(id) {
    const sectors = ensure().filter(s => s.id !== id);
    setStore(KEY, sectors);
  }
};
