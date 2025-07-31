// apps/web/src/app/[locale]/owner/layout.tsx
export default async function OwnerLayout({
    children,
    params
  }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
  
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }