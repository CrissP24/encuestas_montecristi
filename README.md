# TERRANALYTICS — Encuesta Montecristi (Primera Ola)

Aplicación web (React + Vite) para el levantamiento de la **Primera Ola de Encuesta de Montecristi**
(ola de calor ciudadana). Las encuestas que se capturan en campo se guardan en **Supabase (PostgreSQL)**
y la app está lista para desplegarse en **Vercel**.

El cuestionario completo (filtros F1–F3 + preguntas P1–P13), los 7 sectores territoriales, los 7
encuestadores y las tareas por sector ya vienen cargados según el documento oficial
`Plan_operativo_y_cuestionario_final_ola1_Montecristi.pdf`.

---

## ⚠️ Seguridad (léelo primero)

- Tu **contraseña de la base de datos** se compartió en texto plano. Ve a
  **Supabase → Project Settings → Database → Reset database password** y cámbiala.
- La app **NO usa** esa contraseña. El navegador se conecta con la **anon key** pública
  (`VITE_SUPABASE_ANON_KEY`), que es segura para el frontend.
- Nunca subas el archivo `.env` a GitHub (ya está en `.gitignore`).

---

## 1) Configurar la base de datos en Supabase

1. Entra a tu proyecto: <https://supabase.com> → proyecto `gjhivncrmfbezmfqmosf`.
2. Menú izquierdo → **SQL Editor** → **New query**.
3. Pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run** (crea las tablas).
4. Nueva query → pega [`supabase/seed.sql`](supabase/seed.sql) y **Run** (carga los datos de Montecristi).

## 2) Obtener las claves de la API

En Supabase: **Project Settings → API**. Copia:

- **Project URL** → `https://gjhivncrmfbezmfqmosf.supabase.co`
- **anon public** (en *Project API keys*) → es una clave larga que empieza con `eyJ...`

## 3) Configurar variables de entorno en local

```bash
cp .env.example .env
```

Edita `.env` y pega tu anon key:

```env
VITE_SUPABASE_URL=https://gjhivncrmfbezmfqmosf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_clave...
```

## 4) Ejecutar en local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente <http://localhost:5173>).

**Usuarios del sistema** (cada uno con su propia contraseña):

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `aaron@admin.com` | `Administrador2@26` |
| Administrador | `elenn@admin.com` | `Administrador2@26` |
| Monitoreo / Supervisor | `monitoreo@montecristi.com` | `monitoreo2@26` |
| Encuestador (U1) | `gema.palacios@encuestador.com` | `gema2@26` |
| Encuestador (U2) | `maria.cordova@encuestador.com` | `maria2@26` |
| Encuestador (U3) | `veronica.lino@encuestador.com` | `veronica2@26` |
| Encuestador (U4) | `mariuxi.lopez@encuestador.com` | `mariuxi2@26` |
| Encuestador (U5) | `jean.miranda@encuestador.com` | `jean2@26` |
| Encuestador (R1) | `karina.rosado@encuestador.com` | `karina2@26` |
| Encuestador (R2) | `bryan.vinces@encuestador.com` | `bryan2@26` |

Cada encuestador entra y ve su tarea/sector asignado. Al enviar una encuesta, esta se guarda en
**localStorage** (para que funcione incluso sin internet) y se sincroniza con **Supabase**.
Puedes verla en Supabase → **Table Editor → responses**.

## 5) Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En <https://vercel.com> → **Add New → Project** → importa el repo.
3. Vercel detecta Vite automáticamente:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En **Settings → Environment Variables** agrega (para *Production* y *Preview*):
   - `VITE_SUPABASE_URL` = `https://gjhivncrmfbezmfqmosf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. **Deploy**. El archivo [`vercel.json`](vercel.json) ya maneja las rutas de la SPA.

> Si cambias las variables de entorno en Vercel, vuelve a hacer **Redeploy** para que tomen efecto.

---

## ¿Qué se guarda en PostgreSQL?

- **Toda la configuración** (empresa, proyecto, usuarios, sectores, formulario, tareas) queda en las
  tablas de Supabase tras ejecutar `seed.sql`.
- **Cada encuesta levantada** se inserta en la tabla `responses` (con respuestas en `jsonb`, GPS,
  banderas de control y estado).

## Estructura del proyecto

```
src/
  pages/Survey.jsx            ← captura de la encuesta (encuestador)
  services/supabaseClient.js  ← conexión a Supabase (lee las variables de entorno)
  services/responseService.js ← guarda/sincroniza/descarga respuestas de Supabase
  utils/constants.js          ← datos sembrados de Montecristi (cuestionario, sectores, tareas…)
supabase/
  schema.sql                  ← crea las tablas + RLS
  seed.sql                    ← carga los datos de Montecristi
```
