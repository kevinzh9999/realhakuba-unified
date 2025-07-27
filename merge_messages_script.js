#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function mergeMessages() {
  const languages = ['en', 'ja'];
  
  languages.forEach(lang => {
    console.log(`\n合并 ${lang}.json 文件...`);
    
    // 读取三个来源的文件 (跨项目)
    const webPath = `apps/web/messages/${lang}.json`;
    const reservationPath = `../realhakuba-monorepo/apps/reservation/messages/${lang}.json`;
    const staysPath = `../realhakuba-monorepo/apps/stays/messages/${lang}.json`;
    
    let merged = {};
    
    // 读取 web messages (作为基础)
    if (fs.existsSync(webPath)) {
      try {
        const webContent = JSON.parse(fs.readFileSync(webPath, 'utf8'));
        merged = { ...webContent };
        console.log(`✓ 读取 web messages: ${Object.keys(webContent).length} 个键`);
      } catch (error) {
        console.log(`✗ 读取 web messages 失败: ${error.message}`);
      }
    }
    
    // 合并 reservation messages
    if (fs.existsSync(reservationPath)) {
      try {
        const reservationContent = JSON.parse(fs.readFileSync(reservationPath, 'utf8'));
        merged.ReservationApp = reservationContent;
        console.log(`✓ 合并 reservation messages: ${Object.keys(reservationContent).length} 个键`);
      } catch (error) {
        console.log(`✗ 读取 reservation messages 失败: ${error.message}`);
      }
    }
    
    // 合并 stays messages  
    if (fs.existsSync(staysPath)) {
      try {
        const staysContent = JSON.parse(fs.readFileSync(staysPath, 'utf8'));
        merged.StaysApp = staysContent;
        console.log(`✓ 合并 stays messages: ${Object.keys(staysContent).length} 个键`);
      } catch (error) {
        console.log(`✗ 读取 stays messages 失败: ${error.message}`);
      }
    }
    
    // 写入合并后的文件
    const outputPath = `apps/web/messages/${lang}.json`;
    try {
      fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf8');
      console.log(`✓ 合并完成: ${outputPath}`);
      console.log(`  总计 ${Object.keys(merged).length} 个顶级键`);
    } catch (error) {
      console.log(`✗ 写入失败: ${error.message}`);
    }
  });
}

// 显示合并前的文件信息
function showFileInfo() {
  console.log('=== 文件信息 ===');
  const files = [
    'apps/web/messages/en.json',
    'apps/web/messages/ja.json', 
    '../realhakuba-monorepo/apps/reservation/messages/en.json',
    '../realhakuba-monorepo/apps/reservation/messages/ja.json',
    '../realhakuba-monorepo/apps/stays/messages/en.json',
    '../realhakuba-monorepo/apps/stays/messages/ja.json'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`✓ ${file}: ${Object.keys(content).length} 个键`);
      } catch (error) {
        console.log(`✗ ${file}: 无法解析 JSON`);
      }
    } else {
      console.log(`- ${file}: 文件不存在`);
    }
  });
}

console.log('Messages 合并工具');
showFileInfo();
mergeMessages();
console.log('\n=== 合并完成 ===');
