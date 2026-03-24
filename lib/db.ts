import { createClient } from '@supabase/supabase-js';

// Use this in API routes only (has full DB access)
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
