-- ============================================================================
-- TERRANALYTICS — Esquema de base de datos (PostgreSQL / Supabase)
-- Operativo: Primera Ola de Encuesta — Montecristi
-- ----------------------------------------------------------------------------
-- Cómo usarlo:
--   1) Entra a tu proyecto en https://supabase.com
--   2) Menú izquierdo → SQL Editor → New query
--   3) Pega TODO este archivo y presiona "Run"
--   4) Luego ejecuta seed.sql para cargar los datos de Montecristi
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists companies (
  id          text primary key,
  name        text not null,
  ruc         text,
  status      text default 'active',
  created_at  timestamptz default now()
);

create table if not exists users (
  id            text primary key,
  email         text unique not null,
  password      text,                 -- demo: contraseña en texto plano (ver nota de seguridad en README)
  name          text not null,
  role          text not null,
  company_id    text references companies(id),
  mobile_access boolean default false
);

create table if not exists projects (
  id          text primary key,
  company_id  text references companies(id),
  name        text not null,
  description text,
  status      text default 'active',
  created_at  timestamptz default now()
);

create table if not exists project_members (
  id          text primary key,
  project_id  text references projects(id),
  user_id     text references users(id),
  role        text not null,
  is_active   boolean default true
);

create table if not exists project_member_permissions (
  id                 text primary key,
  project_member_id  text references project_members(id),
  permission_code    text not null,
  enabled            boolean default true
);

create table if not exists sectors (
  id             text primary key,
  project_id     text references projects(id),
  name           text not null,
  type           text default 'circle',
  center_lat     double precision,
  center_lng     double precision,
  radius_meters  integer,
  geojson        jsonb,
  created_at     timestamptz default now()
);

create table if not exists forms (
  id          text primary key,
  project_id  text references projects(id),
  name        text not null,
  status      text default 'published',
  created_at  timestamptz default now(),
  versions    jsonb               -- versiones + campos del formulario (estructura completa)
);

create table if not exists tasks (
  id               text primary key,
  project_id       text references projects(id),
  form_version_id  text,
  sector_id        text references sectors(id),
  supervisor_id    text references users(id),
  enumerators      jsonb,
  title            text,
  status           text default 'active',
  start_at         timestamptz,
  end_at           timestamptz,
  created_at       timestamptz default now()
);

-- Tabla principal donde la app guarda CADA encuesta levantada en campo.
create table if not exists responses (
  id               text primary key,
  project_id       text,
  task_id          text,
  form_version_id  text,
  enumerator_id    text,
  respondent_name  text,             -- 'Anónimo' (la encuesta no pide nombre)
  sector_name      text,             -- sector detectado automáticamente
  area             text,             -- 'Urbana' | 'Rural' (automático)
  answers          jsonb,            -- respuestas { campo_id: valor }
  lat              double precision,
  lng              double precision,
  accuracy_m       integer,
  flags            jsonb,            -- { out_of_sector, out_of_schedule, low_accuracy, offline_capture }
  started_at       timestamptz,
  submitted_at     timestamptz,
  status           text default 'sent',
  created_at       timestamptz default now()
);

create index if not exists idx_responses_project   on responses(project_id);
create index if not exists idx_responses_task       on responses(task_id);
create index if not exists idx_responses_enumerator on responses(enumerator_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
-- La app web usa la "anon key" pública. Para que pueda leer/escribir encuestas
-- habilitamos RLS con políticas permisivas. Es suficiente para este operativo
-- de captura; si más adelante quieres restringir, ajusta estas políticas.

alter table responses enable row level security;

drop policy if exists "responses_anon_select" on responses;
drop policy if exists "responses_anon_insert" on responses;
drop policy if exists "responses_anon_update" on responses;

create policy "responses_anon_select" on responses for select using (true);
create policy "responses_anon_insert" on responses for insert with check (true);
create policy "responses_anon_update" on responses for update using (true) with check (true);

-- Tablas de configuración: lectura pública (opcional, por si luego lees la
-- configuración desde la base en lugar de los seeds del frontend).
alter table companies                  enable row level security;
alter table users                      enable row level security;
alter table projects                   enable row level security;
alter table project_members            enable row level security;
alter table project_member_permissions enable row level security;
alter table sectors                    enable row level security;
alter table forms                      enable row level security;
alter table tasks                      enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'companies','users','projects','project_members',
    'project_member_permissions','sectors','forms','tasks'
  ]
  loop
    execute format('drop policy if exists "%s_anon_read" on %I;', t, t);
    execute format('create policy "%s_anon_read" on %I for select using (true);', t, t);
  end loop;
end $$;
