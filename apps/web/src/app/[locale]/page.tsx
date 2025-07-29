// app/[locale]/page.tsx
import Header from '@/components/layout/header';
import SectionHero from '@/components/SectionHero';
import SectionProperties from '@/components/SectionProperties';
import SectionFun from '@/components/SectionFun';
import SectionFooter from '@/components/SectionFooter';

export default async function Home({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  
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


        <section id="accommodations">
          <SectionProperties />
        </section>

        <section id="news">
          <SectionFun />
        </section>

        <section id="footer">
          <SectionFooter />
        </section>
      </main>
    </>
  );
}