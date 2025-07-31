// apps/web/src/app/[locale]/owner/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OwnerDashboard from '@/components/owner/OwnerDashboard';

async function getOwnerProperty() {
  const cookieStore = await cookies();
  const propertyId = cookieStore.get('owner-property')?.value;
  
  if (!propertyId) {
    redirect('/login');
  }
  
  return propertyId;
}

export default async function OwnerDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const propertyId = await getOwnerProperty();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <OwnerDashboard propertyId={propertyId} locale={locale} />
      </div>
    </div>
  );
}