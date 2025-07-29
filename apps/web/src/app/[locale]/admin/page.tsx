// apps/web/src/app/[locale]/admin/page.tsx
import { redirect } from 'next/navigation';

export default async function AdminHomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // 管理后台首页自动跳转到订单审核页面
  redirect(`/${locale}/bookings`);
}