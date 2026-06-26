// Roles del sistema
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_COMPANY: 'ADMIN_COMPANY',
  SUPERVISOR: 'SUPERVISOR',
  ENUMERATOR: 'ENUMERATOR',
};

// Permisos disponibles por proyecto
export const PERMISSIONS = {
  P_TASK_CREATE: 'P_TASK_CREATE',
  P_TASK_EDIT: 'P_TASK_EDIT',
  P_ASSIGN_ENUMERATORS: 'P_ASSIGN_ENUMERATORS',
  P_SECTOR_CREATE: 'P_SECTOR_CREATE',
  P_VIEW_ALL_RESPONSES: 'P_VIEW_ALL_RESPONSES',
  P_EXPORT_DATA: 'P_EXPORT_DATA',
};

export const PERMISSION_LABELS = {
  P_TASK_CREATE: 'Crear Tareas',
  P_TASK_EDIT: 'Editar Tareas',
  P_ASSIGN_ENUMERATORS: 'Asignar Encuestadores',
  P_SECTOR_CREATE: 'Crear Sectores',
  P_VIEW_ALL_RESPONSES: 'Ver Todas las Respuestas',
  P_EXPORT_DATA: 'Exportar Datos',
};

// Tipos de campos de formulario
export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SINGLE_CHOICE: 'single_choice',
  MULTI_CHOICE: 'multi_choice',
  YES_NO: 'yes_no',
};

export const FIELD_TYPE_LABELS = {
  text: 'Texto',
  number: 'Número',
  single_choice: 'Selección Única',
  multi_choice: 'Selección Múltiple',
  yes_no: 'Sí / No',
};

// Sector types
export const SECTOR_TYPES = {
  CIRCLE: 'circle',
  POLYGON: 'polygon',
};

// Estados de tarea
export const TASK_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Centro aproximado del cantón Montecristi (referencia para GPS por defecto)
export const MONTECRISTI_CENTER = { lat: -1.0486, lng: -80.6606 };

// Colores de la app
export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  sidebar: '#1e1b4b',
  sidebarHover: '#312e81',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  bgLight: '#f8fafc',
  bgCard: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

// ─────────────────────────────────────────────────────────────────────────────
// USUARIOS DEL SISTEMA — Operativo Montecristi, Primera Ola
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_USERS = [
  // Administradores
  { id: 'u100', email: 'aaron@admin.com', password: 'Administrador2@26', name: 'Ing Aaron', role: ROLES.SUPER_ADMIN, company_id: null },
  { id: 'u101', email: 'elenn@admin.com', password: 'Administrador2@26', name: 'Elenn', role: ROLES.SUPER_ADMIN, company_id: null },
  // Responsable de monitoreo y control en plataforma (supervisor)
  { id: 'u102', email: 'monitoreo@montecristi.com', password: 'monitoreo2@26', name: 'Responsable de Monitoreo', role: ROLES.SUPERVISOR, company_id: 'c1' },
  // 7 encuestadores de campo
  { id: 'u103', email: 'gema.palacios@encuestador.com', password: 'gema2@26', name: 'Palacios Anchundia Gema Nayely', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
  { id: 'u104', email: 'maria.cordova@encuestador.com', password: 'maria2@26', name: 'Cordova López María Dayana', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
  { id: 'u105', email: 'veronica.lino@encuestador.com', password: 'veronica2@26', name: 'Lino Vélez Verónica Natalia', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
  { id: 'u106', email: 'mariuxi.lopez@encuestador.com', password: 'mariuxi2@26', name: 'López Franco Mariuxi Elizabeth', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
  { id: 'u107', email: 'jean.miranda@encuestador.com', password: 'jean2@26', name: 'Miranda López Jean Pierre', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
  { id: 'u108', email: 'karina.rosado@encuestador.com', password: 'karina2@26', name: 'Rosado Zambrano Karina Elisseth', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
  { id: 'u109', email: 'bryan.vinces@encuestador.com', password: 'bryan2@26', name: 'Vinces Coveña Bryan Joel', role: ROLES.ENUMERATOR, company_id: 'c1', mobile_access: true },
];

export const SEED_COMPANIES = [
  { id: 'c1', name: 'Montecristi Encuestas', ruc: '1360000000001', status: 'active', created_at: '2026-06-01T10:00:00Z' },
];

export const SEED_PROJECTS = [
  { id: 'p1', company_id: 'c1', name: 'Primera Ola de Encuesta — Montecristi', description: 'Encuesta de ola de calor ciudadana: clima ciudadano, problemas prioritarios, percepción de la gestión actual y demanda de liderazgo. Muestra de 384 encuestas válidas (273 urbanas / 111 rurales).', status: 'active', created_at: '2026-06-01T10:00:00Z' },
];

export const SEED_PROJECT_MEMBERS = [
  { id: 'pm100', project_id: 'p1', user_id: 'u102', role: ROLES.SUPERVISOR, is_active: true },  // Monitoreo
  { id: 'pm101', project_id: 'p1', user_id: 'u103', role: ROLES.ENUMERATOR, is_active: true },  // Gema — U1
  { id: 'pm102', project_id: 'p1', user_id: 'u104', role: ROLES.ENUMERATOR, is_active: true },  // María Dayana — U2
  { id: 'pm103', project_id: 'p1', user_id: 'u105', role: ROLES.ENUMERATOR, is_active: true },  // Verónica — U3
  { id: 'pm104', project_id: 'p1', user_id: 'u106', role: ROLES.ENUMERATOR, is_active: true },  // Mariuxi — U4
  { id: 'pm105', project_id: 'p1', user_id: 'u107', role: ROLES.ENUMERATOR, is_active: true },  // Jean Pierre — U5
  { id: 'pm106', project_id: 'p1', user_id: 'u108', role: ROLES.ENUMERATOR, is_active: true },  // Karina — R1
  { id: 'pm107', project_id: 'p1', user_id: 'u109', role: ROLES.ENUMERATOR, is_active: true },  // Bryan — R2
];

export const SEED_PERMISSIONS = [
  // Permisos para el Responsable de Monitoreo (supervisor)
  { id: 'perm100', project_member_id: 'pm100', permission_code: 'P_TASK_CREATE', enabled: true },
  { id: 'perm101', project_member_id: 'pm100', permission_code: 'P_TASK_EDIT', enabled: true },
  { id: 'perm102', project_member_id: 'pm100', permission_code: 'P_ASSIGN_ENUMERATORS', enabled: true },
  { id: 'perm103', project_member_id: 'pm100', permission_code: 'P_SECTOR_CREATE', enabled: true },
  { id: 'perm104', project_member_id: 'pm100', permission_code: 'P_VIEW_ALL_RESPONSES', enabled: true },
  { id: 'perm105', project_member_id: 'pm100', permission_code: 'P_EXPORT_DATA', enabled: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTORES — Distribución territorial final (5 urbanos + 2 rurales = 384 encuestas)
// Coordenadas aproximadas alrededor del cantón Montecristi.
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_SECTORS = [
  { id: 's1', project_id: 'p1', name: 'U1 — Cabecera cantonal / centro de Montecristi', type: 'circle', center_lat: -1.0486, center_lng: -80.6606, radius_meters: 2200, geojson: null, created_at: '2026-06-02T10:00:00Z' },
  { id: 's2', project_id: 'p1', name: 'U2 — Aníbal San Andrés', type: 'circle', center_lat: -1.0440, center_lng: -80.6720, radius_meters: 2500, geojson: null, created_at: '2026-06-02T10:00:00Z' },
  { id: 's3', project_id: 'p1', name: 'U3 — Colorado', type: 'circle', center_lat: -1.0560, center_lng: -80.6650, radius_meters: 2300, geojson: null, created_at: '2026-06-02T10:00:00Z' },
  { id: 's4', project_id: 'p1', name: 'U4 — General Alfaro', type: 'circle', center_lat: -1.0520, center_lng: -80.6540, radius_meters: 2000, geojson: null, created_at: '2026-06-02T10:00:00Z' },
  { id: 's5', project_id: 'p1', name: 'U5 — Leónidas Proaño y zona urbana periférica', type: 'circle', center_lat: -1.0410, center_lng: -80.6510, radius_meters: 3000, geojson: null, created_at: '2026-06-02T10:00:00Z' },
  { id: 's6', project_id: 'p1', name: 'R1 — Bajo de Pechiche (rural)', type: 'circle', center_lat: -1.0720, center_lng: -80.7000, radius_meters: 4500, geojson: null, created_at: '2026-06-02T10:00:00Z' },
  { id: 's7', project_id: 'p1', name: 'R2 — Bajo de Afuera y Bajo de la Palma (rural)', type: 'circle', center_lat: -1.0920, center_lng: -80.6820, radius_meters: 4500, geojson: null, created_at: '2026-06-02T10:00:00Z' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CUESTIONARIO FINAL — Primera Ola Montecristi (Ola de calor ciudadana)
// Tomado del documento oficial: Plan operativo y cuestionario final, Ola 1.
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_FORMS = [
  {
    id: 'f_montecristi',
    project_id: 'p1',
    name: 'Encuesta Primera Ola — Ola de Calor Ciudadana (Montecristi)',
    status: 'published',
    created_at: '2026-06-05T10:00:00Z',
    versions: [
      {
        id: 'fv_montecristi_1',
        form_id: 'f_montecristi',
        version: 1,
        published_at: '2026-06-05T12:00:00Z',
        fields: [
          // NOTA: Encuesta ANÓNIMA. Fecha, hora, sector, área y encuestador se
          // capturan automáticamente (no se preguntan). El cuestionario inicia en F1.

          // ── MÓDULO DE FILTROS ─────────────────────────────────────────────
          { id: 'f1', type: 'single_choice', label: 'F1: ¿Usted vive actualmente en el cantón Montecristi?', required: true, options: ['Sí', 'No'] },
          { id: 'f2', type: 'single_choice', label: 'F2: ¿Tiene 18 años o más?', required: true, options: ['Sí', 'No'] },
          { id: 'f3', type: 'single_choice', label: 'F3: Pensando en las próximas elecciones municipales, ¿qué tan probable es que usted vote?', required: true, options: ['Muy probable', 'Bastante probable', 'Poco probable', 'Nada probable', 'No sabe'] },

          // ── PERFIL BÁSICO ─────────────────────────────────────────────────
          { id: 'p1', type: 'single_choice', label: 'P1: Sexo', required: true, options: ['Hombre', 'Mujer'] },
          { id: 'p2', type: 'single_choice', label: 'P2: Rango de edad', required: true, options: ['18 a 29', '30 a 44', '45 a 59', '60 o más'] },

          // ── CLIMA CIUDADANO Y AGENDA CANTONAL ─────────────────────────────
          { id: 'p3', type: 'single_choice', label: 'P3: ¿Cómo calificaría la situación general del cantón Montecristi en este momento?', required: true, options: ['Muy buena', 'Buena', 'Regular', 'Mala', 'Muy mala'] },
          { id: 'p4', type: 'single_choice', label: 'P4: ¿Cuál de estas palabras describe mejor el ambiente actual del cantón?', required: true, options: ['Esperanza', 'Enojo', 'Decepción', 'Cansancio', 'Miedo', 'Tranquilidad', 'Indiferencia', 'Otra'] },
          { id: 'p5', type: 'single_choice', label: 'P5: ¿Cuál es hoy el principal problema de Montecristi?', required: true, options: ['Agua potable', 'Alcantarillado', 'Empleo', 'Inseguridad', 'Vías', 'Basura y limpieza', 'Atención municipal', 'Salud', 'Corrupción o mala administración', 'Falta de obras', 'Otro', 'No sabe'] },
          { id: 'p6', type: 'single_choice', label: 'P6: ¿En cuál de los siguientes temas le gustaría que el próximo alcalde o alcaldesa pusiera más atención?', required: true, options: ['Seguridad', 'Agua', 'Empleo', 'Vías', 'Salud', 'ZOFRAMA', 'Turismo', 'Juventud', 'Limpieza y basura', 'Atención municipal', 'Otro'] },

          // ── PERCEPCIÓN DE LA GESTIÓN ACTUAL ───────────────────────────────
          { id: 'p7', type: 'single_choice', label: 'P7: ¿Cómo califica la gestión del alcalde Jonathan Toro en este período?', required: true, options: ['Muy buena', 'Buena', 'Regular', 'Mala', 'Muy mala'] },
          { id: 'p8', type: 'single_choice', label: 'P8: ¿Cuál de estas frases describe mejor a la actual administración municipal?', required: true, options: ['Escucha a la gente y resuelve', 'Tiene buenas intenciones, pero poca capacidad', 'Improvisa y genera conflicto', 'Está alejada de la gente', 'No sabe'] },

          // ── PERFIL DEL PRÓXIMO LIDERAZGO ──────────────────────────────────
          { id: 'p9', type: 'multi_choice', label: 'P9: Pensando en la próxima alcaldía, ¿cuáles son las dos cualidades más importantes que debe tener la persona que gobierne Montecristi? (máximo 2)', required: true, options: ['Capacidad para resolver problemas', 'Honestidad', 'Cercanía con la gente', 'Carácter firme', 'Buena administración', 'Experiencia', 'Buena comunicación', 'Conocimiento del cantón', 'Capacidad de unir', 'Buen equipo de trabajo', 'Renovación', 'Otra'] },
          { id: 'p10', type: 'single_choice', label: 'P10: ¿Qué tipo de alcalde o alcaldesa necesita más Montecristi en este momento?', required: true, options: ['Gerente y resolutivo', 'Cercano y humano', 'Firme y con autoridad', 'Honesto y transparente', 'Técnico y planificador', 'Dialogante y conciliador', 'No sabe'] },
          { id: 'p11', type: 'single_choice', label: 'P11: ¿Qué rechaza más usted en un alcalde o alcaldesa?', required: true, options: ['Soberbia o mal trato', 'Improvisación', 'Corrupción', 'No cumplir lo prometido', 'Pelearse con todo el mundo', 'Falta de capacidad', 'Rodearse mal', 'Otra', 'No sabe'] },

          // ── APERTURA AL CAMBIO ────────────────────────────────────────────
          { id: 'p12', type: 'single_choice', label: 'P12: Pensando en la próxima elección municipal, ¿qué preferiría usted para Montecristi?', required: true, options: ['Continuidad', 'Continuidad con cambios', 'Cambio moderado', 'Cambio total', 'No sabe'] },
          { id: 'p13', type: 'single_choice', label: 'P13: ¿Hoy estaría dispuesto a escuchar una nueva opción para la alcaldía?', required: true, options: ['Sí', 'No', 'Depende', 'No sabe'] },
        ]
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TAREAS — Una por sector, asignada a su encuestador/a (2 días de levantamiento)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_TASKS = [
  { id: 't1', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's1', supervisor_id: 'u102', enumerators: ['u103'], title: 'U1 — Cabecera cantonal / centro (meta 55)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
  { id: 't2', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's2', supervisor_id: 'u102', enumerators: ['u104'], title: 'U2 — Aníbal San Andrés (meta 55)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
  { id: 't3', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's3', supervisor_id: 'u102', enumerators: ['u105'], title: 'U3 — Colorado (meta 55)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
  { id: 't4', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's4', supervisor_id: 'u102', enumerators: ['u106'], title: 'U4 — General Alfaro (meta 40)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
  { id: 't5', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's5', supervisor_id: 'u102', enumerators: ['u107'], title: 'U5 — Leónidas Proaño y periférica (meta 68)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
  { id: 't6', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's6', supervisor_id: 'u102', enumerators: ['u108'], title: 'R1 — Bajo de Pechiche (meta 56)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
  { id: 't7', project_id: 'p1', form_version_id: 'fv_montecristi_1', sector_id: 's7', supervisor_id: 'u102', enumerators: ['u109'], title: 'R2 — Bajo de Afuera y Bajo de la Palma (meta 55)', status: 'active', start_at: '2026-06-20T08:00:00Z', end_at: '2026-12-31T18:00:00Z', created_at: '2026-06-05T10:00:00Z' },
];

export const SEED_RESPONSES = [];
