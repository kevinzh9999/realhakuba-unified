// update-page-imports.js - 使用内置模块，无需安装依赖

const fs = require('fs');
const path = require('path');

// 递归查找所有 .tsx 文件
function findTsxFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过 node_modules 和 .next
        if (item !== 'node_modules' && item !== '.next') {
          findTsxFiles(fullPath, files);
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.warn(`无法访问目录 ${dir}:`, err.message);
  }
  
  return files;
}

// 更新文件内容
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // 定义替换规则
    const replacements = {
      // 相对路径到绝对路径
      "'../components/": "'@/components/",
      '"../components/': '"@/components/',
      "'../../components/": "'@/components/",
      '"../../components/': '"@/components/',
      "'./components/": "'@/components/",
      '"./components/': '"@/components/',
      
      // 具体组件路径映射
      '@/components/Header': '@/components/layout/header',
      '@/components/SectionFooter': '@/components/layout/footer',
      '@/components/LanguageSwitcher': '@/components/features/language-switcher',
      '@/components/WeatherIcon': '@/components/features/weather-widget',
      '@/components/ContactModal': '@/components/features/contact-modal',
      
      // Section 组件路径（这些现在在 _components 目录）
      '@/components/SectionHero': './_components/section-hero',
      '@/components/SectionProperties': './_components/section-properties',
      '@/components/SectionPropertiesCarousel': './_components/section-properties-carousel',
      '@/components/SectionFun': './_components/section-fun',
      
      // lib 路径
      "'../lib/": "'@/lib/",
      '"../lib/': '"@/lib/',
      "'../../lib/": "'@/lib/",
      '"../../lib/': '"@/lib/',
      "'./lib/": "'@/lib/",
      '"./lib/': '"@/lib/',
      
      // app/lib 路径
      "'../app/lib/": "'@/lib/",
      '"../app/lib/': '"@/lib/',
      "'../../app/lib/": "'@/lib/",
      '"../../app/lib/': '"@/lib/',
      
      // i18n 路径
      '@/i18n/navigation': '@/i18n/routing',
      '../i18n/navigation': '@/i18n/routing',
      './i18n/navigation': '@/i18n/routing',
      
      // 中间件路径
      '../middleware': '@/middleware',
      './middleware': '@/middleware',
      
      // Stays 组件的特殊处理
      './booking-ui/': '@/components/features/booking/',
      '../booking-ui/': '@/components/features/booking/',
      
      // UI 组件
      './ui/': '@/components/ui/',
      '../ui/': '@/components/ui/',
    };
    
    // 执行替换
    Object.entries(replacements).forEach(([from, to]) => {
      if (content.includes(from)) {
        // 使用全局替换
        const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, to);
        updated = true;
      }
    });
    
    // 如果文件被更新，写回文件
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 更新: ${filePath}`);
    }
    
  } catch (err) {
    console.error(`❌ 处理文件失败 ${filePath}:`, err.message);
  }
}

// 主函数
function main() {
  console.log('🔄 开始更新导入路径...\n');
  
  const appDir = path.join(process.cwd(), 'apps/web/src');
  
  if (!fs.existsSync(appDir)) {
    console.error('❌ 找不到 apps/web/src 目录');
    console.error('请确保在项目根目录运行此脚本');
    process.exit(1);
  }
  
  // 查找所有 TypeScript 文件
  console.log('🔍 查找文件...');
  const files = findTsxFiles(appDir);
  console.log(`找到 ${files.length} 个文件\n`);
  
  // 更新每个文件
  files.forEach(file => {
    updateFile(file);
  });
  
  console.log('\n✅ 导入路径更新完成！');
}

// 运行主函数
main();
