import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';


interface PropertyCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  guests: number;
  bedrooms: number;
}

export function PropertyCard({ id, name, description, image, price, guests, bedrooms }: PropertyCardProps) {
  const t = useTranslations('Header');

  return (
    <Link href={`/stays/${id}`}>
      <div className="group cursor-pointer">
        <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-600 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500">
              {t('propertyDesc', { bedrooms, guests })}
            </span>          </div>
        </div>
      </div>
    </Link>
  );
}
