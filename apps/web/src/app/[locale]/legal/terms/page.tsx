// app/[locale]/terms/page.tsx
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default async function TermsPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations('Legal.TermsOfService');

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {t('title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                {t('subtitle')}
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('effectiveDate')}: 2025-07-01
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Table of Contents */}
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">目次 / Contents</h3>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <a href="#acceptance" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    1. {t('sections.acceptance.title')}
                  </a>
                  <a href="#service" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    2. {t('sections.service.title')}
                  </a>
                  <a href="#booking" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    3. {t('sections.booking.title')}
                  </a>
                  <a href="#rules" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    4. {t('sections.rules.title')}
                  </a>
                  <a href="#payment" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    5. {t('sections.payment.title')}
                  </a>
                  <a href="#responsibilities" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    6. {t('sections.responsibilities.title')}
                  </a>
                  <a href="#liability" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    7. {t('sections.liability.title')}
                  </a>
                  <a href="#disputes" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    8. {t('sections.disputes.title')}
                  </a>
                </nav>
              </div>

              <div className="px-8 py-8 space-y-8">
                {/* 1. 服务条款接受 */}
                <section id="acceptance" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.acceptance.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.acceptance.description')}
                      </p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {t('sections.acceptance.agreement')}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 2. 服务描述 */}
                <section id="service" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.service.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.service.description')}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.service.items.platform')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.service.items.properties')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.service.items.support')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 3. 预订和取消 */}
                <section id="booking" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.booking.title')}
                      </h2>
                      
                      {/* 预订流程 */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('sections.booking.process.title')}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                          {t('sections.booking.process.description')}
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{t('sections.booking.process.steps.search')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{t('sections.booking.process.steps.request')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{t('sections.booking.process.steps.confirmation')}</span>
                          </li>
                        </ul>
                      </div>

                      {/* 取消政策 */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('sections.booking.cancellation.title')}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                          {t('sections.booking.cancellation.description')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {t('sections.booking.cancellation.flexible.title')}
                            </h4>
                            <p className="text-gray-600 text-xs">
                              {t('sections.booking.cancellation.flexible.description')}
                            </p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {t('sections.booking.cancellation.strict.title')}
                            </h4>
                            <p className="text-gray-600 text-xs">
                              {t('sections.booking.cancellation.strict.description')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 4. 住宿规则 */}
                <section id="rules" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      4
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.rules.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.rules.description')}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 基本规则 */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">
                            {t('sections.rules.basic.title')}
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.rules.basic.smoking')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.rules.basic.pets')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.rules.basic.parties')}</span>
                            </li>
                          </ul>
                        </div>

                        {/* 入住退房 */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">
                            {t('sections.rules.checkin.title')}
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.rules.checkin.time')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.rules.checkin.checkout')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.rules.checkin.quiet')}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 5. 支付条款 */}
                <section id="payment" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      5
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.payment.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.payment.description')}
                      </p>
                      
                      <div className="space-y-4">
                        {/* 支付方式 */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">
                            {t('sections.payment.methods.title')}
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.payment.methods.cards')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.payment.methods.security')}</span>
                            </li>
                          </ul>
                        </div>

                        {/* 收费说明 */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">
                            {t('sections.payment.fees.title')}
                          </h4>
                          <ul className="space-y-1">
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('sections.payment.fees.accommodation')}</span>
                              <span className="text-gray-900">{t('sections.payment.fees.accommodationFee')}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('sections.payment.fees.cleaning')}</span>
                              <span className="text-gray-900">{t('sections.payment.fees.cleaningFee')}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('sections.payment.fees.service')}</span>
                              <span className="text-gray-900">{t('sections.payment.fees.serviceFee')}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 6. 用户和房东责任 */}
                <section id="responsibilities" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      6
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.responsibilities.title')}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 客人责任 */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('sections.responsibilities.guest.title')}
                          </h3>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.responsibilities.guest.property')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.responsibilities.guest.rules')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.responsibilities.guest.damages')}</span>
                            </li>
                          </ul>
                        </div>

                        {/* 房东责任 */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('sections.responsibilities.host.title')}
                          </h3>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.responsibilities.host.accuracy')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.responsibilities.host.cleanliness')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{t('sections.responsibilities.host.availability')}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 7. 责任限制 */}
                <section id="liability" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      7
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.liability.title')}
                      </h2>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-gray-700 leading-relaxed text-sm mb-3">
                              {t('sections.liability.description')}
                            </p>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm">{t('sections.liability.limitations.platform')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm">{t('sections.liability.limitations.thirdparty')}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm">{t('sections.liability.limitations.force')}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 8. 争议解决 */}
                <section id="disputes" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      8
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.disputes.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {t('sections.disputes.description')}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('sections.disputes.process.contact.title')}
                          </h4>
                          <p className="text-gray-600 text-xs">
                            {t('sections.disputes.process.contact.description')}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('sections.disputes.process.mediation.title')}
                          </h4>
                          <p className="text-gray-600 text-xs">
                            {t('sections.disputes.process.mediation.description')}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('sections.disputes.process.jurisdiction.title')}
                          </h4>
                          <p className="text-gray-600 text-xs">
                            {t('sections.disputes.process.jurisdiction.description')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 联系方式 */}
              <section className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      {t('sections.contact.title')}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                      {t('sections.contact.description')}
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-7a2 2 0 00-2-2H8a2 2 0 00-2 2v7m5 0v-7a2 2 0 012-2h2a2 2 0 012 2v7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Real Hakuba</h3>
                          <div className="space-y-1 text-gray-600 text-sm">
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>legal@realhakuba.com</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{t('sections.contact.address')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}