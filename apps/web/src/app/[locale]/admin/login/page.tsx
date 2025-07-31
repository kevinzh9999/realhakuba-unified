// apps/web/src/app/[locale]/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default function AdminLoginPage() {
  const t = useTranslations('Admin');
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('login.title')}</h1>
          <p className="mt-2 text-gray-600">{t('login.subtitle')}</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}