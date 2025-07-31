// apps/web/src/app/api/admin/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

// 验证管理员权限
async function verifyAdminAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin-auth');
  
  if (!authCookie) {
    throw new Error('Unauthorized');
  }
  
  // 这里可以添加更复杂的token验证逻辑
  return true;
}

// GET - 获取物业配置
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request);
    
    const configPath = path.join(process.cwd(), 'src/config/props.config.json');
    const fileContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(fileContent);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading properties config:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to load properties config' }, 
      { status: 500 }
    );
  }
}

// POST - 保存物业配置
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request);
    
    const updatedConfig = await request.json();
    
    // 验证配置格式
    if (!validatePropertiesConfig(updatedConfig)) {
      return NextResponse.json(
        { error: 'Invalid configuration format' }, 
        { status: 400 }
      );
    }
    
    const configPath = path.join(process.cwd(), 'src/config/props.config.json');
    
    // 备份原文件
    try {
      const backupPath = path.join(process.cwd(), 'src/config/props.config.backup.json');
      const originalContent = await fs.readFile(configPath, 'utf-8');
      await fs.writeFile(backupPath, originalContent);
    } catch (backupError) {
      console.warn('Failed to create backup:', backupError);
    }
    
    // 保存新配置
    await fs.writeFile(
      configPath, 
      JSON.stringify(updatedConfig, null, 2),
      'utf-8'
    );
    
    // 记录操作日志
    console.log(`[ADMIN] Properties config updated at ${new Date().toISOString()}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Properties configuration saved successfully' 
    });
    
  } catch (error) {
    console.error('Error saving properties config:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to save properties config' }, 
      { status: 500 }
    );
  }
}

// 验证配置格式
function validatePropertiesConfig(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  for (const [propertyId, property] of Object.entries(config)) {
    if (!validateProperty(property)) {
      console.error(`Invalid property configuration for: ${propertyId}`);
      return false;
    }
  }
  
  return true;
}

// 验证单个物业配置
function validateProperty(property: any): boolean {
  if (!property || typeof property !== 'object') {
    return false;
  }
  
  // 检查必需字段
  const requiredFields = ['title', 'price', 'hero', 'gallery', 'details', 'summary', 'bedrooms'];
  for (const field of requiredFields) {
    if (!(field in property)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // 验证多语言字段
  const localizedFields = ['title', 'details'];
  for (const field of localizedFields) {
    if (!validateLocalizedString(property[field])) {
      console.error(`Invalid localized string for field: ${field}`);
      return false;
    }
  }
  
  // 验证价格
  if (typeof property.price !== 'number' || property.price < 0) {
    console.error('Invalid price');
    return false;
  }
  
  // 验证图片数组
  if (!Array.isArray(property.gallery)) {
    console.error('Gallery must be an array');
    return false;
  }
  
  // 验证summary
  if (!validateSummary(property.summary)) {
    console.error('Invalid summary');
    return false;
  }
  
  // 验证卧室配置
  if (!Array.isArray(property.bedrooms)) {
    console.error('Bedrooms must be an array');
    return false;
  }
  
  for (const bedroom of property.bedrooms) {
    if (!validateBedroom(bedroom)) {
      console.error('Invalid bedroom configuration');
      return false;
    }
  }
  
  return true;
}

// 验证多语言字符串
function validateLocalizedString(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const requiredLanguages = ['en', 'ja', 'zh'];
  for (const lang of requiredLanguages) {
    if (typeof obj[lang] !== 'string') {
      return false;
    }
  }
  
  return true;
}

// 验证summary字段
function validateSummary(summary: any): boolean {
  if (!summary || typeof summary !== 'object') {
    return false;
  }
  
  const requiredFields = ['sqm', 'guests', 'bedrooms', 'bathrooms', 'petsAllowed'];
  for (const field of requiredFields) {
    if (!(field in summary)) {
      return false;
    }
  }
  
  // 验证数字字段
  const numberFields = ['sqm', 'guests', 'bedrooms', 'bathrooms'];
  for (const field of numberFields) {
    if (typeof summary[field] !== 'number' || summary[field] < 0) {
      return false;
    }
  }
  
  // 验证布尔字段
  if (typeof summary.petsAllowed !== 'boolean') {
    return false;
  }
  
  return true;
}

// 验证卧室配置
function validateBedroom(bedroom: any): boolean {
  if (!bedroom || typeof bedroom !== 'object') {
    return false;
  }
  
  if (!bedroom.beds || typeof bedroom.beds !== 'object') {
    return false;
  }
  
  const bedTypes = ['double', 'single', 'tatami'];
  for (const bedType of bedTypes) {
    if (typeof bedroom.beds[bedType] !== 'number' || bedroom.beds[bedType] < 0) {
      return false;
    }
  }
  
  // 图片是可选的
  if (bedroom.image && typeof bedroom.image !== 'string') {
    return false;
  }
  
  return true;
}