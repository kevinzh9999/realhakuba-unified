// app/[locale]/legal/page.tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function LegalPage() {
  const t = await getTranslations('Legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <div className="grid gap-6">
        <Link 
          href="/legal/privacy" 
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">{t('privacy.title')}</h2>
          <p className="text-gray-600">{t('privacy.description')}</p>
        </Link>
        
        <Link 
          href="/legal/terms" 
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">{t('terms.title')}</h2>
          <p className="text-gray-600">{t('terms.description')}</p>
        </Link>
        
        <Link 
          href="/legal/disclosure" 
          className="p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">{t('disclosure.title')}</h2>
          <p className="text-gray-600">{t('disclosure.description')}</p>
        </Link>
      </div>
    </div>
  );
}