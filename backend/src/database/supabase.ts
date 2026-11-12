import { createClient, SupabaseClient } from '@supabase/supabase-js';
import '../config/env';

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const isPlaceholderConfig =
  !supabaseUrl ||
  !supabaseServiceRoleKey ||
  supabaseUrl.includes('your-project') ||
  supabaseServiceRoleKey.includes('your-') ||
  supabaseServiceRoleKey.includes('TU_');

export const isSupabaseConfigured = !isPlaceholderConfig;

/**
 * Cliente oficial de Supabase (API REST sobre HTTPS / Puerto 443).
 * Utiliza SUPABASE_SERVICE_ROLE_KEY en backend para omitir RLS de forma segura.
 * Es null cuando las variables no están definidas o son placeholders locales.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (isSupabaseConfigured) {
  console.log('✅ Cliente Supabase REST (HTTPS) inicializado correctamente');
} else {
  console.log('ℹ️ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no configuradas para producción; usando conexión local');
}
