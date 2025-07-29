import Link from 'next/link';

export const metadata = {
    title: 'Commerce Disclosure | Real Hakuba',
};

export default function DisclosurePage() {
    return (
        <main className="max-w-3xl mx-auto py-12 px-4 pt-20">
            <h1 className="text-2xl font-semibold mb-6">
                Commercial Disclosure <br />
                (特定商取引法に基づく表記)
            </h1>

            <dl className="space-y-6">
                <div>
                    <dt className="font-semibold">Legal Name</dt>
                    <dd>Real Hakuba G.K</dd>
                    <dd>Real Hakuba 合同会社</dd>

                </div>
                <div>
                    <dt className="font-semibold">Address</dt>
                    <dd>
                        〒399-9301<br />
                        2546 Hokujo, Hakuba Village, Kitaazumi District, Nagano Prefecture, Japan
                    </dd>

                    <dd>
                        日本長野県北安曇郡白馬村北城2546
                    </dd>

                </div>
                <div>
                    <dt className="font-semibold">Phone number</dt>
                    <dd>+81-90-7905-5323</dd>
                </div>
                <div>
                    <dt className="font-semibold">Hours</dt>
                    <dd>10:00 – 18:00（Except weekends and holidays）</dd>
                    <dd>10:00 – 18:00（週末・祝日を除く）</dd>

                </div>
                <div>
                    <dt className="font-semibold">Email address</dt>
                    <dd>
                        <a href="mailto:inquiry@realhakuba.com" className="text-blue-600 hover:underline">
                            inquiry@realhakuba.com
                        </a>
                    </dd>
                </div>
                <div>
                    <dt className="font-semibold">Head of Operations</dt>
                    <dd>Taku Tsuchiya　</dd>
                    <dd> 缒屋 卓</dd>

                </div>
                <div>
                    <dt className="font-semibold">Additional fees</dt>
                    <dd className="whitespace-pre-line">
                        Not applicable.
                    </dd>
                    <dd className="whitespace-pre-line">
                        該当なし。
                    </dd>
                </div>
                <div>
                    <dt className="font-semibold">Exchanges &amp; Returns Policy</dt>
                    <dd className="whitespace-pre-line">
Cancellations made more than 30 days before the check-in date are free and fully refundable. Cancellations within 30 days of check-in will be charged 100% of the room rate.
                    </dd>
                                        <dd className="whitespace-pre-line">
チェックイン日の30日前までのキャンセルは無料で全額返金されます。チェックイン日の30日以内のキャンセルは宿泊料金の全額をご請求いたします。                    </dd>
                </div>
                <div>
                    <dt className="font-semibold">Delivery times</dt>
                    <dd>Not applicable.</dd>
                                        <dd>該当なし。</dd>

                </div>
                <div>
                    <dt className="font-semibold">Accepted payment methods</dt>
                                        <dd>Credit card, bank transfer, payment provider such as Alipay</dd>

                    <dd>クレジットカード、銀行振込、Alipayなどの決済プロバイダー</dd>
                </div>
                <div>
                    <dt className="font-semibold">Payment period</dt>
                    <dd>Credit card payments are processed immediately <br />bank transfers must be sent within 3 days of the date of booking.</dd>
                    <dd>クレジットカード：即時決済<br />
                        銀行振込：ご注文日より3日以内にお支払いください。</dd>
                </div>
                <div>
                    <dt className="font-semibold">Price</dt>
                    <dd>Room rates vary depending on the specific reservation dates.</dd>
                    <dd>料金はご予約の日程に応じて変動します。</dd>
                </div>
            </dl>

            <footer className="mt-12 text-center text-sm text-gray-500">
                <Link href="/" className="underline hover:text-gray-700">
                    ← Back to Home
                </Link>
            </footer>
        </main>
    );
}