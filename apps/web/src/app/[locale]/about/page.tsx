// about/page.tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale }); 
  return {
    title: t('AboutPage.title'),        
    description: t('AboutPage.description'), 
  };
}

export default async function AboutPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">{t('AboutPage.title')}</h1>
      <div className="prose max-w-none">
        <p>{t('AboutPage.title')}</p>
        <p>{t('AboutPage.description')}</p>
      </div>
    </div>
  );
}