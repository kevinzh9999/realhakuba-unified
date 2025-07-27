// apps/reservation/src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () => {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: cookies(), // ✅ 必须调用 cookies()，返回 cookie 实例
    }
  );
};