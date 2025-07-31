// apps/web/src/app/[locale]/admin/properties/page.tsx
import PropertiesManager from '@/components/admin/PropertiesManager';

export default async function PropertiesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">物业配置管理</h1>
          <p className="text-gray-600 mt-1">管理和配置所有物业信息</p>
        </div>
      </div>
      
      <PropertiesManager locale={locale} />
    </div>
  );
}