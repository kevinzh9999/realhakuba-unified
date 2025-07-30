// app/[locale]/privacy/page.tsx
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default async function PrivacyPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations('Legal.PrivacyPolicy');

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
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('lastUpdated')}: 2025-07-01
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
                  <a href="#collection" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    1. {t('sections.collection.title')}
                  </a>
                  <a href="#usage" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    2. {t('sections.usage.title')}
                  </a>
                  <a href="#sharing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    3. {t('sections.sharing.title')}
                  </a>
                  <a href="#security" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    4. {t('sections.security.title')}
                  </a>
                  <a href="#cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    5. {t('sections.cookies.title')}
                  </a>
                  <a href="#rights" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    6. {t('sections.rights.title')}
                  </a>
                </nav>
              </div>

              <div className="px-8 py-8 space-y-8">
                {/* 1. 信息收集 */}
                <section id="collection" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.collection.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.collection.description')}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.collection.items.personal')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.collection.items.booking')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.collection.items.payment')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.collection.items.communication')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 2. 使用目的 */}
                <section id="usage" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.usage.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.usage.description')}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.usage.items.reservation')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.usage.items.communication')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.usage.items.improvement')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.usage.items.legal')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 3. 数据共享 */}
                <section id="sharing" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.sharing.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.sharing.description')}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.sharing.items.payment')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.sharing.items.property')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.sharing.items.legal')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 4. 数据保护 */}
                <section id="security" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                      4
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.security.title')}
                      </h2>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {t('sections.security.description')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 5. Cookie */}
                <section id="cookies" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-1">
                      5
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.cookies.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {t('sections.cookies.description')}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.cookies.items.essential')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.cookies.items.analytics')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{t('sections.cookies.items.preferences')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200" />

                {/* 6. 用户权利 */}
                <section id="rights" className="scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-1">
                      6
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('sections.rights.title')}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {t('sections.rights.description')}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {t('sections.rights.items.access')}
                          </h4>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {t('sections.rights.items.correction')}
                          </h4>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {t('sections.rights.items.deletion')}
                          </h4>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {t('sections.rights.items.portability')}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 7. 联系方式 */}
              <section className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                              <span>privacy@realhakuba.com</span>
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