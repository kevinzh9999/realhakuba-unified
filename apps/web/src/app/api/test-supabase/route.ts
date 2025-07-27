// apps/reservation/src/app/api/test-supabase/route.ts
import { createServerSupabaseClient } from "@/lib/api/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}