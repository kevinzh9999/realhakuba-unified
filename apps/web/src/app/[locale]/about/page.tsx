import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About Real Hakuba</h1>
      <div className="prose max-w-none">
        <p>Premium vacation rentals in the heart of the Japanese Alps.</p>
      </div>
    </div>
  );
}
