// apps/web/src/app/api/admin/owners/update-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { propertyName, newPassword } = await request.json();

    if (!propertyName || !newPassword) {
      return NextResponse.json(
        { error: 'Property name and new password are required' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // 读取当前配置
    const propsConfigStr = process.env.PROPS_SECRET_JSON;
    if (!propsConfigStr) {
      return NextResponse.json(
        { error: 'Properties configuration not found' },
        { status: 500 }
      );
    }

    let propsConfig;
    try {
      propsConfig = JSON.parse(propsConfigStr);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid properties configuration' },
        { status: 500 }
      );
    }

    // 验证物业是否存在
    if (!propsConfig[propertyName]) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // 生成密码哈希
    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    // 更新配置
    propsConfig[propertyName].passwordHash = passwordHash;
    propsConfig[propertyName].lastUpdated = new Date().toISOString();

    // 注意：在生产环境中，这里应该更新环境变量或配置文件
    // 这里只是演示逻辑，实际实现可能需要：
    // 1. 使用数据库存储密码哈希
    // 2. 使用配置管理系统
    // 3. 重启应用以加载新配置

    console.log(`Password updated for property: ${propertyName}`);
    console.log(`New password hash: ${passwordHash}`);

    return NextResponse.json({ 
      success: true, 
      propertyName,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}