import { createClient } from '@supabase/supabase-js';

// Las credenciales se leen desde variables de entorno de Vite.
// En local: archivo .env  ·  En Vercel: Project Settings → Environment Variables
//   VITE_SUPABASE_URL       → https://gjhivncrmfbezmfqmosf.supabase.co
//   VITE_SUPABASE_ANON_KEY  → la "anon public" key del panel de Supabase
//
// IMPORTANTE: aquí NUNCA se usa la contraseña de la base de datos. El navegador
// se conecta solo con la anon key (es pública y segura para el frontend).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export function isSupabaseEnabled() {
  return supabase !== null;
}

if (!supabase) {
  // No bloquea la app: sigue funcionando con almacenamiento local hasta que
  // se configuren las variables de entorno.
  console.warn(
    '[Supabase] Sin configurar. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY ' +
    'en .env (local) o en Vercel para guardar las encuestas en la base de datos.'
  );
}
