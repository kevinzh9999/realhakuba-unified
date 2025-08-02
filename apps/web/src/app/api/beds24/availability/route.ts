// 调试版本的 beds24/availability/route.ts
import { NextRequest, NextResponse } from "next/server";

// 1. 只 parse 一次，效率高
let propsSecret: any = null;
function getPropsSecret() {
  if (!propsSecret) {
    const json = process.env.PROPS_SECRET_JSON;
    if (!json) {
      console.error("❌ PROPS_SECRET_JSON 环境变量未设置");
      throw new Error("PROPS_SECRET_JSON not set");
    }
    
    try {
      propsSecret = JSON.parse(json);
      console.log("✅ PROPS_SECRET_JSON 解析成功");
    } catch (e) {
      console.error("❌ PROPS_SECRET_JSON 解析失败:", e);
      throw new Error("PROPS_SECRET_JSON parse error");
    }
  }
  return propsSecret;
}

function getConfigByPropName(propsSecret: any, propName: string) {
  if (!propName) return null;
  
  const config = propsSecret[propName.toLowerCase()] || null;
  console.log(`🔍 查找配置 propName: ${propName}, 找到: ${config ? '是' : '否'}`);
  
  if (config) {
    console.log(`📋 配置详情:`, { 
      propKey: config.propKey ? '已设置' : '未设置',
      roomId: config.roomId || '未设置'
    });
  }
  
  return config;
}

export async function POST(req: NextRequest) {
  console.log("🚀 Beds24 API 调用开始");
  
  try {
    // 检查环境变量
    console.log("🔧 环境变量检查:");
    console.log("- BEDS24_API_KEY:", process.env.BEDS24_API_KEY ? '已设置' : '❌ 未设置');
    console.log("- PROPS_SECRET_JSON:", process.env.PROPS_SECRET_JSON ? '已设置' : '❌ 未设置');
    
    const body = await req.json();
    const { propName, from, to } = body;
    
    console.log("📥 请求参数:", { propName, from, to });

    if (!propName || !from || !to) {
      console.error("❌ 缺少必要参数");
      return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });
    }

    const config = getConfigByPropName(getPropsSecret(), propName);
    if (!config) {
      console.error("❌ 找不到属性配置");
      return NextResponse.json({ ok: false, error: "Invalid propName" }, { status: 400 });
    }
    
    const { propKey, roomId } = config;
    
    if (!propKey) {
      console.error("❌ propKey 未设置");
      return NextResponse.json({ ok: false, error: "propKey not configured" }, { status: 400 });
    }

    const payload = {
      authentication: {
        apiKey: process.env.BEDS24_API_KEY!,
        propKey,
      },
      roomId,
      from,
      to,
      ShowRates: true,
    };
    
    console.log("📤 发送到 Beds24 的载荷:", {
      ...payload,
      authentication: {
        apiKey: payload.authentication.apiKey ? '已设置' : '未设置',
        propKey: payload.authentication.propKey ? '已设置' : '未设置'
      }
    });

    console.log("🌐 调用 Beds24 API...");
    const response = await fetch(
      "https://api.beds24.com/json/getRoomDates",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    console.log("📊 Beds24 响应状态:", response.status);
    console.log("📊 Beds24 响应头:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("📥 Beds24 原始响应文本:", responseText);

    let bedsRes;
    try {
      bedsRes = JSON.parse(responseText);
      console.log("✅ JSON 解析成功:", bedsRes);
    } catch (parseError) {
      console.error("❌ JSON 解析失败:", parseError);
      console.log("原始响应内容:", responseText);
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid JSON response from Beds24", 
        raw: responseText 
      }, { status: 502 });
    }

    // 检查 Beds24 特定的错误格式
    if (bedsRes && typeof bedsRes === "object") {
      // Beds24 可能返回的错误格式
      if (bedsRes.error) {
        console.error("❌ Beds24 API 返回错误:", bedsRes.error);
        return NextResponse.json({ 
          ok: false, 
          error: `Beds24 API Error: ${bedsRes.error}`,
          raw: bedsRes 
        }, { status: 400 });
      }

      // 检查是否是认证错误（常见的响应格式）
      if (bedsRes.message && bedsRes.message.includes('authentication')) {
        console.error("❌ Beds24 认证错误:", bedsRes.message);
        return NextResponse.json({ 
          ok: false, 
          error: `Authentication Error: ${bedsRes.message}`,
          raw: bedsRes 
        }, { status: 401 });
      }

      // 检查是否是空响应或无效响应
      if (Object.keys(bedsRes).length === 0) {
        console.error("❌ Beds24 返回空对象");
        return NextResponse.json({ 
          ok: false, 
          error: "Empty response from Beds24",
          raw: bedsRes 
        }, { status: 502 });
      }
    }

    console.log("✅ API 调用成功");
    return NextResponse.json({ ok: true, data: bedsRes });
  } catch (err: any) {
    console.error("💥 API 错误:", err);
    console.error("错误堆栈:", err.stack);
    return NextResponse.json({ 
      ok: false, 
      error: err.message || "Internal error",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}