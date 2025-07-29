// app/[locale]/terms/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function TermsPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations('Legal.TermsOfService');

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('effectiveDate')}: 2024-01-01</p>
      
      <div className="space-y-8">
        {/* 1. 服务条款接受 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.acceptance.title')}</h2>
          <p>{t('sections.acceptance.description')}</p>
        </section>

        {/* 2. 服务描述 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.service.title')}</h2>
          <p>{t('sections.service.description')}</p>
        </section>

        {/* 3. 预订和取消 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.booking.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('sections.booking.reservation.title')}</h3>
              <p>{t('sections.booking.reservation.description')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('sections.booking.cancellation.title')}</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('sections.booking.cancellation.before30days')}</li>
                <li>{t('sections.booking.cancellation.within30days')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. 住宿规则 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.rules.title')}</h2>
          <p className="mb-4">{t('sections.rules.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.rules.items.smoking')}</li>
            <li>{t('sections.rules.items.pets')}</li>
            <li>{t('sections.rules.items.parties')}</li>
            <li>{t('sections.rules.items.checkin')}</li>
            <li>{t('sections.rules.items.checkout')}</li>
            <li>{t('sections.rules.items.quiet')}</li>
          </ul>
        </section>

        {/* 5. 支付条款 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.payment.title')}</h2>
          <p className="mb-4">{t('sections.payment.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('sections.payment.items.methods')}</li>
            <li>{t('sections.payment.items.timing')}</li>
            <li>{t('sections.payment.items.security')}</li>
          </ul>
        </section>

        {/* 6. 责任限制 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.liability.title')}</h2>
          <p>{t('sections.liability.description')}</p>
        </section>

        {/* 7. 争议解决 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.disputes.title')}</h2>
          <p>{t('sections.disputes.description')}</p>
        </section>
      </div>
    </div>
  );
}