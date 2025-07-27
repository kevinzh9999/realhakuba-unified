const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, files = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
        findFiles(fullPath, pattern, files);
      } else if (item.match(pattern)) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.warn(`无法访问: ${dir}`);
  }
  return files;
}

// 查找所有 ts/tsx 文件
const files = findFiles('apps/web/src', /\.(ts|tsx)$/);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;
  
  // 修复常见的错误路径
  const replacements = [
    // 移除 /src 前缀
    [/@\/src\/components\//g, '@/components/'],
    [/@\/src\/app\//g, '@/app/'],
    [/@\/src\/lib\//g, '@/lib/'],
    [/@\/src\//g, '@/'],
    
    // 具体组件映射
    ['@/components/LanguageSwitcher', '@/components/features/language-switcher'],
    ['@/components/ContactModal', '@/components/features/contact-modal'],
    ['@/components/WeatherIcon', '@/components/features/weather-widget'],
    ['@/components/Header', '@/components/layout/header'],
    ['@/components/Footer', '@/components/layout/footer'],
    ['@/components/SectionFooter', '@/components/layout/footer'],
    
    // globals.css 路径
    ['@/app/globals.css', '@/styles/globals.css'],
    
    // 修复 default export 导入
    ["import { Header } from '@/components/layout/header'", "import Header from '@/components/layout/header'"],
    ["import { Footer } from '@/components/layout/footer'", "import Footer from '@/components/layout/footer'"],
  ];
  
  replacements.forEach(([search, replace]) => {
    if (content.match(search)) {
      content = content.replace(search, replace);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`✅ 更新: ${file}`);
  }
});

console.log('完成！');
