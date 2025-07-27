
import Header from '@/components/layout/header';

import SectionHero from '@/components/SectionHero';
import SectionProperties from '@/components/SectionProperties';
import SectionFun from '@/components/SectionFun';
import SectionFooter from '@/components/SectionFooter';


export default function Home() {
    return (
        <>
            <Header />

            <main className="
      h-screen-dock overflow-y-scroll scrollbar-none
      snap-y snap-mandatory scroll-smooth
      overscroll-y-contain
    ">
                <section id="hero">
                    <SectionHero />
                </section>

                {/* 第一屏：Hero */}
                {/* 第二屏：可预订物业轮播 */}
                <section id="accommodations">
                    <SectionProperties />
                </section>

                {/* 第三屏：天气 / 新闻 */}
                <section id="news">
                    <SectionFun />
                </section>

                {/* 第四屏：Footer */}
                <section id="footer">
                    <SectionFooter />
                </section>


            </main>
        </>
    );
}
