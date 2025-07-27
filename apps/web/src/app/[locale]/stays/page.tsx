import { PropertyCard } from '@/components/features/property-card';

const properties = [
  {
    id: 'echo-villa',
    name: 'Echo Villa',
    description: 'Luxurious mountain retreat with stunning views',
    image: '/stays/echo-villa/images/hero.jpg',
    price: 50000,
    guests: 10,
    bedrooms: 4,
  },
  {
    id: 'moyai-house',
    name: 'Moyai House',
    description: 'Traditional Japanese house with modern amenities',
    image: '/stays/moyai-house/images/hero.jpg',
    price: 35000,
    guests: 6,
    bedrooms: 3,
  },
  {
    id: 'riverside-loghouse',
    name: 'Riverside Log House',
    description: 'Cozy log house by the river',
    image: '/stays/riverside-loghouse/images/hero.jpg',
    price: 40000,
    guests: 8,
    bedrooms: 3,
  },
];

export default function StaysPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Our Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  );
}
