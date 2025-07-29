// apps/web/src/app/sitemap.ts
import { MetadataRoute } from "next";

// 1. 站点根路径
const siteUrl = "https://realhakuba.com";

// 2. 所有支持的语言 - 添加中文
const locales = ["en", "ja", "zh"];
const defaultLocale = "en";

// 3. 静态路由
const staticRoutes = [
  "",                 // 首页
  "/legal",
  "/legal/disclosure",      // 法务披露
  "/legal/privacy",
  "/legal/terms",
  "/stays",           // 房源列表页面
  "/reservation",     // 预订页面
  "/about",           // 关于我们
  "/about/faq",       // FAQ 页面
];

// 4. 从配置文件获取物业列表
async function getProperties(): Promise<string[]> {
  try {
    // 读取物业配置文件
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), 'src/config/props.config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    // 配置文件是一个对象，键名就是物业的 slug
    return Object.keys(config);
  } catch (error) {
    console.warn('Failed to load properties config:', error);
    // 回退到硬编码的列表，避免构建失败
    return ['riverside-loghouse', 'moyai-house', 'echo-villa'];
  }
}

// 5. 获取动态物业页面路由
async function getPropertyRoutes(): Promise<string[]> {
  const properties = await getProperties();
  return properties.map(propname => `/stays/${propname}`);
}

// 6. Next.js 要求的导出 sitemap() 函数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  
  // 合并静态路由和动态路由
  const propertyRoutes = await getPropertyRoutes();
  const allRoutes = [...staticRoutes, ...propertyRoutes];

  // 为每个路由的每个语言版本创建条目
  const entries = locales.flatMap((locale) =>
    allRoutes.map((route) => {
      // 拼接完整 URL
      const url = `${siteUrl}/${locale}${route}`;

      // 构建 languages 对象
      const languages: Record<string, string> = {};
      
      // 为每个语言添加对应的 URL
      locales.forEach((lang) => {
        languages[lang] = `${siteUrl}/${lang}${route}`;
      });
      
      // 添加 x-default (使用英文作为默认)
      languages['x-default'] = `${siteUrl}/${defaultLocale}${route}`;

      // 判断路由类型设置优先级和更新频率
      const isHomePage = route === "";
      const isPropertyPage = route.startsWith("/stays/") && route !== "/stays";
      const isStaysListPage = route === "/stays";
      const isReservationPage = route === "/reservation";
      const isAboutPage = route.startsWith("/about");

      return {
        url,
        lastModified,
        changeFrequency: 
          isHomePage ? "daily" as const : 
          isStaysListPage ? "weekly" as const :
          isPropertyPage ? "weekly" as const :  // 房源页面可能会更新价格等信息
          isReservationPage ? "monthly" as const : 
          "monthly" as const,
        priority: 
          isHomePage ? 1.0 : 
          isStaysListPage ? 0.9 :
          isPropertyPage ? 0.8 :
          isReservationPage ? 0.8 : 
          isAboutPage ? 0.6 : 
          0.5,
        alternates: {
          languages,
        },
      };
    })
  );

  // 添加根域名重定向到默认语言
  entries.push({
    url: siteUrl,
    lastModified,
    changeFrequency: "daily",
    priority: 1.0,
    alternates: {
      languages: {
        'en': `${siteUrl}/en`,
        'ja': `${siteUrl}/ja`,
        'zh': `${siteUrl}/zh`,
        'x-default': `${siteUrl}/en`,
      },
    },
  });

  return entries;
}