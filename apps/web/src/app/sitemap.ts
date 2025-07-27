// apps/homepage/src/app/sitemap.ts
import { MetadataRoute } from "next";

// 1. 站点根路径
const siteUrl = "https://realhakuba.com";

// 2. 所有支持的语言
const locales = ["en", "ja"];
const defaultLocale = "en";

// 3. 所有静态路由（包含所有应用的路由）
const routes = [
  "",                 // 首页
  "/disclosure",      // 法务披露
  "/stays",           // 房源列表页面
  "/reservation",     // 预订页面
  "/about",
  // "/contact",
  // 更多静态页面...
];

// 4. Next.js 要求的导出 sitemap() 函数
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // 为每个路由的每个语言版本创建条目
  return locales.flatMap((locale) =>
    routes.map((route) => {
      // 拼接完整 URL
      const url = `${siteUrl}/${locale}${route}`;

      // 构建 languages 对象（这是 Next.js 识别 hreflang 的正确方式）
      const languages: Record<string, string> = {};
      
      // 为每个语言添加对应的 URL
      locales.forEach((lang) => {
        languages[lang] = `${siteUrl}/${lang}${route}`;
      });
      
      // 添加 x-default（指向默认语言）
      languages['x-default'] = `${siteUrl}/${defaultLocale}${route}`;

      return {
        url,
        lastModified,
        changeFrequency: route === "" ? "daily" : 
                        route === "/stays" ? "weekly" :
                        route === "/reservation" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 
                 route === "/stays" ? 0.9 :
                 route === "/reservation" ? 0.8 : 0.7,
        // 使用 alternates.languages 而不是 alternateRefs
        alternates: {
          languages,
        },
      };
    })
  );
}