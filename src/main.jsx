import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  SEED_USERS, SEED_COMPANIES, SEED_PROJECTS, SEED_PROJECT_MEMBERS,
  SEED_PERMISSIONS, SEED_SECTORS, SEED_FORMS, SEED_TASKS, SEED_RESPONSES
} from './utils/constants'
import { responseService } from './services/responseService'

// Versión del seed — cambia este número para resetear todos los datos al recargar
// (subido a '7-montecristi' para reemplazar los datos antiguos de Jipijapa)
const SEED_VERSION = '9-montecristi-pwd';

function initSeeds() {
  const stored = localStorage.getItem('ta_seed_version');
  if (stored !== SEED_VERSION) {
    // Reset all data stores to fresh seed values
    const stores = {
      ta_users: SEED_USERS,
      ta_companies: SEED_COMPANIES,
      ta_projects: SEED_PROJECTS,
      ta_project_members: SEED_PROJECT_MEMBERS,
      ta_project_member_permissions: SEED_PERMISSIONS,
      ta_sectors: SEED_SECTORS,
      ta_forms: SEED_FORMS,
      ta_tasks: SEED_TASKS,
      ta_responses: SEED_RESPONSES,
    };
    // Keep current auth session if user is still valid
    const currentAuth = localStorage.getItem('ta_auth');
    Object.entries(stores).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    // Restore auth only if it was set
    if (currentAuth) localStorage.setItem('ta_auth', currentAuth);
    localStorage.setItem('ta_seed_version', SEED_VERSION);
  }
}

initSeeds();

// Descarga en segundo plano las encuestas ya guardadas en Supabase (Postgres)
// y las fusiona con las locales, para ver datos capturados en otros dispositivos.
responseService.hydrateFromSupabase().catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
