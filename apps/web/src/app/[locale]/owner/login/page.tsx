// apps/web/src/app/[locale]/owner/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import OwnerLoginForm from '@/components/owner/OwnerLoginForm';

export default function OwnerLoginPage() {
  const t = useTranslations('Owner');
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">业主登录</h1>
          <p className="mt-2 text-gray-600">查看您的物业预订情况</p>
        </div>
        <OwnerLoginForm />
      </div>
    </div>
  );
}