-- ============================================================================
-- DATOS INICIALES — Primera Ola de Encuesta, Montecristi
-- Ejecuta este archivo DESPUÉS de schema.sql (SQL Editor → New query → Run)
-- Es idempotente: puedes volver a ejecutarlo sin duplicar (usa upsert).
-- ============================================================================

-- Empresa / proyecto -----------------------------------------------------------
insert into companies (id, name, ruc, status, created_at) values
  ('c1','Montecristi Encuestas','1360000000001','active','2026-06-01T10:00:00Z')
on conflict (id) do update set name=excluded.name;

insert into projects (id, company_id, name, description, status, created_at) values
  ('p1','c1','Primera Ola de Encuesta — Montecristi',
   'Encuesta de ola de calor ciudadana: clima ciudadano, problemas prioritarios, percepción de la gestión actual y demanda de liderazgo. Muestra de 384 encuestas válidas (273 urbanas / 111 rurales).',
   'active','2026-06-01T10:00:00Z')
on conflict (id) do update set name=excluded.name, description=excluded.description;

-- Usuarios ---------------------------------------------------------------------
insert into users (id, email, password, name, role, company_id, mobile_access) values
  ('u100','aaron@admin.com','Administrador2@26','Ing Aaron','SUPER_ADMIN',null,false),
  ('u101','elenn@admin.com','Administrador2@26','Elenn','SUPER_ADMIN',null,false),
  ('u102','monitoreo@montecristi.com','monitoreo2@26','Responsable de Monitoreo','SUPERVISOR','c1',false),
  ('u103','gema.palacios@encuestador.com','gema2@26','Palacios Anchundia Gema Nayely','ENUMERATOR','c1',true),
  ('u104','maria.cordova@encuestador.com','maria2@26','Cordova López María Dayana','ENUMERATOR','c1',true),
  ('u105','veronica.lino@encuestador.com','veronica2@26','Lino Vélez Verónica Natalia','ENUMERATOR','c1',true),
  ('u106','mariuxi.lopez@encuestador.com','mariuxi2@26','López Franco Mariuxi Elizabeth','ENUMERATOR','c1',true),
  ('u107','jean.miranda@encuestador.com','jean2@26','Miranda López Jean Pierre','ENUMERATOR','c1',true),
  ('u108','karina.rosado@encuestador.com','karina2@26','Rosado Zambrano Karina Elisseth','ENUMERATOR','c1',true),
  ('u109','bryan.vinces@encuestador.com','bryan2@26','Vinces Coveña Bryan Joel','ENUMERATOR','c1',true)
on conflict (id) do update set name=excluded.name, email=excluded.email, role=excluded.role, password=excluded.password;

-- Miembros del proyecto --------------------------------------------------------
insert into project_members (id, project_id, user_id, role, is_active) values
  ('pm100','p1','u102','SUPERVISOR',true),
  ('pm101','p1','u103','ENUMERATOR',true),
  ('pm102','p1','u104','ENUMERATOR',true),
  ('pm103','p1','u105','ENUMERATOR',true),
  ('pm104','p1','u106','ENUMERATOR',true),
  ('pm105','p1','u107','ENUMERATOR',true),
  ('pm106','p1','u108','ENUMERATOR',true),
  ('pm107','p1','u109','ENUMERATOR',true)
on conflict (id) do nothing;

-- Permisos del supervisor / monitoreo -----------------------------------------
insert into project_member_permissions (id, project_member_id, permission_code, enabled) values
  ('perm100','pm100','P_TASK_CREATE',true),
  ('perm101','pm100','P_TASK_EDIT',true),
  ('perm102','pm100','P_ASSIGN_ENUMERATORS',true),
  ('perm103','pm100','P_SECTOR_CREATE',true),
  ('perm104','pm100','P_VIEW_ALL_RESPONSES',true),
  ('perm105','pm100','P_EXPORT_DATA',true)
on conflict (id) do nothing;

-- Sectores (distribución territorial: 5 urbanos + 2 rurales) -------------------
insert into sectors (id, project_id, name, type, center_lat, center_lng, radius_meters, geojson, created_at) values
  ('s1','p1','U1 — Cabecera cantonal / centro de Montecristi','circle',-1.0486,-80.6606,2200,null,'2026-06-02T10:00:00Z'),
  ('s2','p1','U2 — Aníbal San Andrés','circle',-1.0440,-80.6720,2500,null,'2026-06-02T10:00:00Z'),
  ('s3','p1','U3 — Colorado','circle',-1.0560,-80.6650,2300,null,'2026-06-02T10:00:00Z'),
  ('s4','p1','U4 — General Alfaro','circle',-1.0520,-80.6540,2000,null,'2026-06-02T10:00:00Z'),
  ('s5','p1','U5 — Leónidas Proaño y zona urbana periférica','circle',-1.0410,-80.6510,3000,null,'2026-06-02T10:00:00Z'),
  ('s6','p1','R1 — Bajo de Pechiche (rural)','circle',-1.0720,-80.7000,4500,null,'2026-06-02T10:00:00Z'),
  ('s7','p1','R2 — Bajo de Afuera y Bajo de la Palma (rural)','circle',-1.0920,-80.6820,4500,null,'2026-06-02T10:00:00Z')
on conflict (id) do update set name=excluded.name, center_lat=excluded.center_lat, center_lng=excluded.center_lng;

-- Formulario completo (cuestionario final de la primera ola) -------------------
insert into forms (id, project_id, name, status, created_at, versions) values
  ('f_montecristi','p1','Encuesta Primera Ola — Ola de Calor Ciudadana (Montecristi)','published','2026-06-05T10:00:00Z',
  '[
    {
      "id":"fv_montecristi_1","form_id":"f_montecristi","version":1,"published_at":"2026-06-05T12:00:00Z",
      "fields":[
        {"id":"f1","type":"single_choice","label":"F1: ¿Usted vive actualmente en el cantón Montecristi?","required":true,"options":["Sí","No"]},
        {"id":"f2","type":"single_choice","label":"F2: ¿Tiene 18 años o más?","required":true,"options":["Sí","No"]},
        {"id":"f3","type":"single_choice","label":"F3: Pensando en las próximas elecciones municipales, ¿qué tan probable es que usted vote?","required":true,"options":["Muy probable","Bastante probable","Poco probable","Nada probable","No sabe"]},
        {"id":"p1","type":"single_choice","label":"P1: Sexo","required":true,"options":["Hombre","Mujer"]},
        {"id":"p2","type":"single_choice","label":"P2: Rango de edad","required":true,"options":["18 a 29","30 a 44","45 a 59","60 o más"]},
        {"id":"p3","type":"single_choice","label":"P3: ¿Cómo calificaría la situación general del cantón Montecristi en este momento?","required":true,"options":["Muy buena","Buena","Regular","Mala","Muy mala"]},
        {"id":"p4","type":"single_choice","label":"P4: ¿Cuál de estas palabras describe mejor el ambiente actual del cantón?","required":true,"options":["Esperanza","Enojo","Decepción","Cansancio","Miedo","Tranquilidad","Indiferencia","Otra"]},
        {"id":"p5","type":"single_choice","label":"P5: ¿Cuál es hoy el principal problema de Montecristi?","required":true,"options":["Agua potable","Alcantarillado","Empleo","Inseguridad","Vías","Basura y limpieza","Atención municipal","Salud","Corrupción o mala administración","Falta de obras","Otro","No sabe"]},
        {"id":"p6","type":"single_choice","label":"P6: ¿En cuál de los siguientes temas le gustaría que el próximo alcalde o alcaldesa pusiera más atención?","required":true,"options":["Seguridad","Agua","Empleo","Vías","Salud","ZOFRAMA","Turismo","Juventud","Limpieza y basura","Atención municipal","Otro"]},
        {"id":"p7","type":"single_choice","label":"P7: ¿Cómo califica la gestión del alcalde Jonathan Toro en este período?","required":true,"options":["Muy buena","Buena","Regular","Mala","Muy mala"]},
        {"id":"p8","type":"single_choice","label":"P8: ¿Cuál de estas frases describe mejor a la actual administración municipal?","required":true,"options":["Escucha a la gente y resuelve","Tiene buenas intenciones, pero poca capacidad","Improvisa y genera conflicto","Está alejada de la gente","No sabe"]},
        {"id":"p9","type":"multi_choice","label":"P9: Pensando en la próxima alcaldía, ¿cuáles son las dos cualidades más importantes que debe tener la persona que gobierne Montecristi? (máximo 2)","required":true,"options":["Capacidad para resolver problemas","Honestidad","Cercanía con la gente","Carácter firme","Buena administración","Experiencia","Buena comunicación","Conocimiento del cantón","Capacidad de unir","Buen equipo de trabajo","Renovación","Otra"]},
        {"id":"p10","type":"single_choice","label":"P10: ¿Qué tipo de alcalde o alcaldesa necesita más Montecristi en este momento?","required":true,"options":["Gerente y resolutivo","Cercano y humano","Firme y con autoridad","Honesto y transparente","Técnico y planificador","Dialogante y conciliador","No sabe"]},
        {"id":"p11","type":"single_choice","label":"P11: ¿Qué rechaza más usted en un alcalde o alcaldesa?","required":true,"options":["Soberbia o mal trato","Improvisación","Corrupción","No cumplir lo prometido","Pelearse con todo el mundo","Falta de capacidad","Rodearse mal","Otra","No sabe"]},
        {"id":"p12","type":"single_choice","label":"P12: Pensando en la próxima elección municipal, ¿qué preferiría usted para Montecristi?","required":true,"options":["Continuidad","Continuidad con cambios","Cambio moderado","Cambio total","No sabe"]},
        {"id":"p13","type":"single_choice","label":"P13: ¿Hoy estaría dispuesto a escuchar una nueva opción para la alcaldía?","required":true,"options":["Sí","No","Depende","No sabe"]}
      ]
    }
  ]'::jsonb)
on conflict (id) do update set versions=excluded.versions, name=excluded.name;

-- Tareas (una por sector, asignada a su encuestador/a) --------------------------
insert into tasks (id, project_id, form_version_id, sector_id, supervisor_id, enumerators, title, status, start_at, end_at, created_at) values
  ('t1','p1','fv_montecristi_1','s1','u102','["u103"]','U1 — Cabecera cantonal / centro (meta 55)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z'),
  ('t2','p1','fv_montecristi_1','s2','u102','["u104"]','U2 — Aníbal San Andrés (meta 55)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z'),
  ('t3','p1','fv_montecristi_1','s3','u102','["u105"]','U3 — Colorado (meta 55)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z'),
  ('t4','p1','fv_montecristi_1','s4','u102','["u106"]','U4 — General Alfaro (meta 40)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z'),
  ('t5','p1','fv_montecristi_1','s5','u102','["u107"]','U5 — Leónidas Proaño y periférica (meta 68)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z'),
  ('t6','p1','fv_montecristi_1','s6','u102','["u108"]','R1 — Bajo de Pechiche (meta 56)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z'),
  ('t7','p1','fv_montecristi_1','s7','u102','["u109"]','R2 — Bajo de Afuera y Bajo de la Palma (meta 55)','active','2026-06-20T08:00:00Z','2026-12-31T18:00:00Z','2026-06-05T10:00:00Z')
on conflict (id) do nothing;
