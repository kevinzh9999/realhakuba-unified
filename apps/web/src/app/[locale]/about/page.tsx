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