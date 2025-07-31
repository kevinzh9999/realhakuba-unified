// apps/web/src/app/owner/page.tsx
import { redirect } from 'next/navigation';

export default function OwnerRootPage() {
  // 重定向到带locale的页面
  redirect('/en/dashboard');
}