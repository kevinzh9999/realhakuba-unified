// apps/web/src/app/api/owner/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 简单的token解析函数（生产环境建议使用JWT）
function parseTokenForProperty(token: string): string | null {
  try {
    // 这里应该实现真正的token验证逻辑
    // 暂时返回null，需要根据实际token格式实现
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { propertyName, currentPassword, newPassword } = await request.json();

    // 验证输入
    if (!propertyName || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 验证认证
    const authCookie = request.cookies.get('owner-auth');
    if (!authCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 验证新密码强度
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // 查询当前用户
    const { data: user, error: fetchError } = await supabase
      .from('owner_users')
      .select('*')
      .eq('property_name', propertyName)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // 验证当前密码
    const currentPasswordHash = hashPassword(currentPassword);
    if (currentPasswordHash !== user.password_hash) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // 更新密码
    const newPasswordHash = hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('owner_users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('property_name', propertyName);

    if (updateError) {
      throw updateError;
    }

    console.log(`[OWNER PASSWORD CHANGE] Success for: ${propertyName}`);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('[OWNER PASSWORD CHANGE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}