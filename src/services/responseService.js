import { getStore, setStore, generateId } from '../utils/helpers';
import { SEED_RESPONSES } from '../utils/constants';
import { supabase, isSupabaseEnabled } from './supabaseClient';

const KEY = 'ta_responses';
const TABLE = 'responses';

function ensure() {
  if (!getStore(KEY)) setStore(KEY, SEED_RESPONSES);
  return getStore(KEY);
}

// Mapea una respuesta local al formato de columnas de la tabla en Supabase.
function toRow(r) {
  return {
    id: r.id,
    project_id: r.project_id,
    task_id: r.task_id,
    form_version_id: r.form_version_id,
    enumerator_id: r.enumerator_id,
    respondent_name: r.respondent_name,
    sector_name: r.sector_name ?? null,   // sector detectado automáticamente
    area: r.area ?? null,                 // 'Urbana' | 'Rural' (automático)
    answers: r.answers,        // jsonb
    lat: r.lat,
    lng: r.lng,
    accuracy_m: r.accuracy_m,
    flags: r.flags,            // jsonb
    started_at: r.started_at,
    submitted_at: r.submitted_at,
    status: r.status,
  };
}

// Envía (o actualiza) una respuesta en Supabase. No bloquea la UI.
async function pushToSupabase(r) {
  if (!isSupabaseEnabled()) return false;
  try {
    const { error } = await supabase.from(TABLE).upsert(toRow(r), { onConflict: 'id' });
    if (error) {
      console.error('[Supabase] Error al guardar la respuesta:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Supabase] Fallo de conexión al guardar:', e);
    return false;
  }
}

export const responseService = {
  getAll() {
    return ensure();
  },

  getByProject(projectId) {
    return ensure().filter(r => r.project_id === projectId);
  },

  getByTask(taskId) {
    return ensure().filter(r => r.task_id === taskId);
  },

  getByEnumerator(userId) {
    return ensure().filter(r => r.enumerator_id === userId);
  },

  getById(id) {
    return ensure().find(r => r.id === id);
  },

  create(data) {
    const responses = ensure();
    const response = {
      id: generateId('r'),
      created_at: new Date().toISOString(),
      ...data,
      status: data.status || 'pending',
    };
    responses.push(response);
    setStore(KEY, responses);
    // Guarda también en Supabase (Postgres) en segundo plano.
    pushToSupabase(response);
    return response;
  },

  // Reintenta enviar a Supabase todas las respuestas pendientes y las marca como enviadas.
  async syncPending() {
    const responses = ensure();
    let count = 0;
    for (const r of responses) {
      if (r.status === 'pending') {
        const ok = await pushToSupabase({ ...r, status: 'sent' });
        if (ok || !isSupabaseEnabled()) {
          r.status = 'sent';
          count++;
        }
      }
    }
    setStore(KEY, responses);
    return count;
  },

  // Descarga las respuestas guardadas en Supabase y las fusiona con las locales.
  // Útil para ver en el panel los datos capturados desde otros dispositivos.
  async hydrateFromSupabase() {
    if (!isSupabaseEnabled()) return 0;
    try {
      const { data, error } = await supabase.from(TABLE).select('*');
      if (error) {
        console.error('[Supabase] Error al descargar respuestas:', error.message);
        return 0;
      }
      const local = ensure();
      const byId = new Map(local.map(r => [r.id, r]));
      (data || []).forEach(row => {
        byId.set(row.id, { ...byId.get(row.id), ...row, status: row.status || 'sent' });
      });
      const merged = Array.from(byId.values());
      setStore(KEY, merged);
      return data?.length || 0;
    } catch (e) {
      console.error('[Supabase] Fallo al descargar respuestas:', e);
      return 0;
    }
  },

  getStats(projectId) {
    const responses = this.getByProject(projectId);
    return {
      total: responses.length,
      sent: responses.filter(r => r.status === 'sent').length,
      pending: responses.filter(r => r.status === 'pending').length,
      outOfSector: responses.filter(r => r.flags?.out_of_sector).length,
      outOfSchedule: responses.filter(r => r.flags?.out_of_schedule).length,
      lowAccuracy: responses.filter(r => r.flags?.low_accuracy).length,
      offlineCapture: responses.filter(r => r.flags?.offline_capture).length,
    };
  }
};
