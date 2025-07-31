// apps/web/src/hooks/useCurrentLocale.ts
'use client';

import { useParams } from 'next/navigation';

export function useCurrentLocale(): string {
  const params = useParams();
  return (params.locale as string) || 'en';
}