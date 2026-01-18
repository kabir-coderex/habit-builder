import { createBrowserClient } from '@supabase/ssr';

// Note: These variables need to be exposed to the browser
// by prefixing them with NEXT_PUBLIC_ in your .env file
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_KEY
);
