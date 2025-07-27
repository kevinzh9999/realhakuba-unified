import { NextRequest, NextResponse } from 'next/server';

// 缓存 30 min，减少对第三方的调用
export const revalidate = 1800;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat  = searchParams.get('lat');
  const lon  = searchParams.get('lon');
  const days = searchParams.get('days') ?? '14';

  const url = `https://api.open-meteo.com/v1/forecast` +
              `?latitude=${lat}&longitude=${lon}` +
              `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
              `&timezone=Asia%2FTokyo&forecast_days=${days}`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  const data = await res.json();
  return NextResponse.json(data);
}