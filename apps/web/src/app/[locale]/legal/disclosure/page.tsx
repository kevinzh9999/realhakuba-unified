import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata = {
    title: 'Commerce Disclosure | Real Hakuba',
    description: 'Commercial transaction disclosure based on Japanese Commercial Law (特定商取引法に基づく表記)',
};

export default function DisclosurePage() {
    return (
        <>
            <Header />
            
            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Commerce Disclosure
                            </h1>
                            <p className="text-xl text-gray-600 mb-2">
                                特定商取引法に基づく表記
                            </p>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                                Legal information required under Japanese Commercial Transaction Law
                            </p>
                            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.2 0l3.8-3.8a1 1 0 011.4 0l3.8 3.8" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Legally Required Information
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-12">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            
                            {/* Company Information Header */}
                            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-7a2 2 0 00-2-2H8a2 2 0 00-2 2v7m5 0v-7a2 2 0 012-2h2a2 2 0 012 2v7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Real Hakuba G.K</h3>
                                        <p className="text-sm text-gray-600">Real Hakuba 合同会社</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-8">
                                <dl className="grid grid-cols-1 gap-8">
                                    
                                    {/* Legal Name */}
                                    <div className="border-l-4 border-gray-900 pl-4">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Legal Name / 法人名
                                        </dt>
                                        <dd className="space-y-1">
                                            <div className="text-lg font-medium text-gray-900">Real Hakuba G.K</div>
                                            <div className="text-lg text-gray-700">Real Hakuba 合同会社</div>
                                        </dd>
                                    </div>

                                    {/* Address */}
                                    <div className="border-l-4 border-gray-900 pl-4">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Address / 所在地
                                        </dt>
                                        <dd className="space-y-2">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <div className="text-gray-900 font-medium mb-1">〒399-9301</div>
                                                <div className="text-gray-800 leading-relaxed">
                                                    2546 Hokujo, Hakuba Village, Kitaazumi District, Nagano Prefecture, Japan
                                                </div>
                                                <div className="text-gray-700 mt-2">
                                                    日本長野県北安曇郡白馬村北城2546
                                                </div>
                                            </div>
                                        </dd>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border-l-4 border-gray-900 pl-4">
                                            <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Phone Number / 電話番号
                                            </dt>
                                            <dd className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-lg text-gray-900">+81-90-7905-5323</span>
                                            </dd>
                                        </div>

                                        <div className="border-l-4 border-gray-900 pl-4">
                                            <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Email Address / メールアドレス
                                            </dt>
                                            <dd className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <a href="mailto:inquiry@realhakuba.com" className="text-lg text-blue-600 hover:text-blue-800 transition-colors hover:underline">
                                                    inquiry@realhakuba.com
                                                </a>
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Business Hours & Representative */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border-l-4 border-gray-900 pl-4">
                                            <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Business Hours / 営業時間
                                            </dt>
                                            <dd className="space-y-1">
                                                <div className="text-gray-900">10:00 – 18:00</div>
                                                <div className="text-sm text-gray-600">(Except weekends and holidays)</div>
                                                <div className="text-sm text-gray-600">(週末・祝日を除く)</div>
                                            </dd>
                                        </div>

                                        <div className="border-l-4 border-gray-900 pl-4">
                                            <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Head of Operations / 事業責任者
                                            </dt>
                                            <dd className="space-y-1">
                                                <div className="text-gray-900">Taku Tsuchiya</div>
                                                <div className="text-gray-700">槌屋 卓</div>
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Transaction Terms */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Transaction Terms / 取引条件
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Additional Fees */}
                                            <div>
                                                <dt className="text-sm font-semibold text-gray-700 mb-2">
                                                    Additional Fees / 追加料金
                                                </dt>
                                                <dd className="space-y-1">
                                                    <div className="text-gray-900">Not applicable.</div>
                                                    <div className="text-gray-700">該当なし。</div>
                                                </dd>
                                            </div>

                                            {/* Delivery Times */}
                                            <div>
                                                <dt className="text-sm font-semibold text-gray-700 mb-2">
                                                    Delivery Times / 商品引渡時期
                                                </dt>
                                                <dd className="space-y-1">
                                                    <div className="text-gray-900">Not applicable.</div>
                                                    <div className="text-gray-700">該当なし。</div>
                                                </dd>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancellation Policy */}
                                    <div className="border-l-4 border-red-500 pl-4">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Cancellation Policy / キャンセルポリシー
                                        </dt>
                                        <dd className="space-y-3">
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="text-gray-900 leading-relaxed mb-2">
                                                    Cancellations made more than 30 days before the check-in date are free and fully refundable. 
                                                    Cancellations within 30 days of check-in will be charged 100% of the room rate.
                                                </div>
                                                <div className="text-gray-700 leading-relaxed">
                                                    チェックイン日の30日前までのキャンセルは無料で全額返金されます。
                                                    チェックイン日の30日以内のキャンセルは宿泊料金の全額をご請求いたします。
                                                </div>
                                            </div>
                                        </dd>
                                    </div>

                                    {/* Payment Information */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Payment Information / 支払い情報
                                        </h3>
                                        
                                        <div className="space-y-6">
                                            {/* Payment Methods */}
                                            <div>
                                                <dt className="text-sm font-semibold text-gray-700 mb-2">
                                                    Accepted Payment Methods / 支払方法
                                                </dt>
                                                <dd className="space-y-1">
                                                    <div className="text-gray-900">Credit card, bank transfer, payment provider such as Alipay</div>
                                                    <div className="text-gray-700">クレジットカード、銀行振込、Alipayなどの決済プロバイダー</div>
                                                </dd>
                                            </div>

                                            {/* Payment Period */}
                                            <div>
                                                <dt className="text-sm font-semibold text-gray-700 mb-2">
                                                    Payment Period / 支払時期
                                                </dt>
                                                <dd className="space-y-2">
                                                    <div className="text-gray-900">
                                                        Credit card payments are processed immediately<br />
                                                        Bank transfers must be sent within 3 days of the date of booking.
                                                    </div>
                                                    <div className="text-gray-700">
                                                        クレジットカード：即時決済<br />
                                                        銀行振込：ご注文日より3日以内にお支払いください。
                                                    </div>
                                                </dd>
                                            </div>

                                            {/* Pricing */}
                                            <div>
                                                <dt className="text-sm font-semibold text-gray-700 mb-2">
                                                    Pricing / 料金
                                                </dt>
                                                <dd className="space-y-1">
                                                    <div className="text-gray-900">Room rates vary depending on the specific reservation dates.</div>
                                                    <div className="text-gray-700">料金はご予約の日程に応じて変動します。</div>
                                                </dd>
                                            </div>
                                        </div>
                                    </div>

                                </dl>
                            </div>

                            {/* Footer Navigation */}
                            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Last updated: July 2025
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}