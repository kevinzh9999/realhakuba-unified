// apps/web/src/app/[locale]/admin/login/page.tsx
import { useTranslations } from 'next-intl';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminLoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = useTranslations('Admin.login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>
        <AdminLoginForm locale={locale} />
      </div>
    </div>
  );
}