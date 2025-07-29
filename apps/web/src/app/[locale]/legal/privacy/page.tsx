// app/[locale]/privacy/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function PrivacyPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations('Legal.PrivacyPolicy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('lastUpdated')}: 2025-07-01</p>
      
      <div className="space-y-8">
        {/* 1. 信息收集 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.collection.title')}</h2>
          <p className="mb-4">{t('sections.collection.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.collection.items.personal')}</li>
            <li>{t('sections.collection.items.booking')}</li>
            <li>{t('sections.collection.items.payment')}</li>
            <li>{t('sections.collection.items.communication')}</li>
          </ul>
        </section>

        {/* 2. 使用目的 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.usage.title')}</h2>
          <p className="mb-4">{t('sections.usage.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.usage.items.reservation')}</li>
            <li>{t('sections.usage.items.communication')}</li>
            <li>{t('sections.usage.items.improvement')}</li>
            <li>{t('sections.usage.items.legal')}</li>
          </ul>
        </section>

        {/* 3. 数据共享 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.sharing.title')}</h2>
          <p className="mb-4">{t('sections.sharing.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.sharing.items.payment')}</li>
            <li>{t('sections.sharing.items.property')}</li>
            <li>{t('sections.sharing.items.legal')}</li>
          </ul>
        </section>

        {/* 4. 数据保护 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.security.title')}</h2>
          <p>{t('sections.security.description')}</p>
        </section>

        {/* 5. Cookie */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.cookies.title')}</h2>
          <p className="mb-4">{t('sections.cookies.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.cookies.items.essential')}</li>
            <li>{t('sections.cookies.items.analytics')}</li>
            <li>{t('sections.cookies.items.preferences')}</li>
          </ul>
        </section>

        {/* 6. 用户权利 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.rights.title')}</h2>
          <p className="mb-4">{t('sections.rights.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.rights.items.access')}</li>
            <li>{t('sections.rights.items.correction')}</li>
            <li>{t('sections.rights.items.deletion')}</li>
            <li>{t('sections.rights.items.portability')}</li>
          </ul>
        </section>

        {/* 7. 联系方式 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.contact.title')}</h2>
          <p>{t('sections.contact.description')}</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Real Hakuba</p>
            <p>Email: privacy@realhakuba.com</p>
            <p>{t('sections.contact.address')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}