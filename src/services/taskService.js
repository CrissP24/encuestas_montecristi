import { getStore, setStore, generateId } from '../utils/helpers';
import { SEED_TASKS } from '../utils/constants';

const KEY = 'ta_tasks';

function ensure() {
  if (!getStore(KEY)) setStore(KEY, SEED_TASKS);
  return getStore(KEY);
}

export const taskService = {
  getAll() {
    return ensure();
  },

  getByProject(projectId) {
    return ensure().filter(t => t.project_id === projectId);
  },

  getById(id) {
    return ensure().find(t => t.id === id);
  },

  getByEnumerator(userId) {
    return ensure().filter(t => (t.enumerators || []).includes(userId));
  },

  getBySupervisor(userId) {
    return ensure().filter(t => t.supervisor_id === userId);
  },

  create(data) {
    const tasks = ensure();
    const task = { id: generateId('t'), ...data, status: data.status || 'active', created_at: new Date().toISOString() };
    tasks.push(task);
    setStore(KEY, tasks);
    return task;
  },

  update(id, data) {
    const tasks = ensure();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...data };
    setStore(KEY, tasks);
    return tasks[idx];
  },

  remove(id) {
    const tasks = ensure().filter(t => t.id !== id);
    setStore(KEY, tasks);
  }
};
