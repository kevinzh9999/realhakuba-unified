// components/features/property-card.tsx
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useTranslations } from 'next-intl';

interface PropertyCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  guests: number;
  bedrooms: number;
  blurDataURL?: string;
  width?: number;
  height?: number;
}

export function PropertyCard({
  id,
  name,
  description,
  image,
  price,
  guests,
  bedrooms,
  blurDataURL,
  width = 1200,
  height = 800
}: PropertyCardProps) {
  const locale = useLocale();
  const t = useTranslations('Header');


  return (
    <Link href={`/${locale}/stays/${id}`} className="group block">
      <article className="cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
          <OptimizedImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            blurDataURL={blurDataURL}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{description}</p>

          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500">
              {t('propertyDesc', { bedrooms, guests })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}