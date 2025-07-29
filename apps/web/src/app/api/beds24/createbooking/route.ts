//createbooking/route.ts

// 根据 Beds24 API 文档，status 值定义：
// 0 = Cancelled
// 1 = Confirmed
// 2 = New (same as confirmed but unread)
// 3 = Request
// 4 = Black
// 5 = Inquiry

import { NextRequest, NextResponse } from "next/server";
import { parseISO, subDays, format } from "date-fns";


// 推荐用 PROPS_SECRET_JSON 环境变量
const propsConfigStr = process.env.PROPS_SECRET_JSON;
if (!propsConfigStr) {
  throw new Error("PROPS_SECRET_JSON env is not set");
}

let propConfigs: any;
try {
  propConfigs = JSON.parse(propsConfigStr);
} catch (e) {
  throw new Error("PROPS_SECRET_JSON parse error");
}


export async function POST(req: NextRequest) {
    // 获取前端传来的所有订单信息
    const {
        propName,       
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        adults,
        children,
        total,
        message,
        // 可扩展更多字段
    } = await req.json();

    const propInfo = propConfigs[propName];
    if (!propInfo) {
        return NextResponse.json({ ok: false, error: "Unknown propName" }, { status: 400 });
    }
    const { propKey, roomId } = propInfo;

    if (!propKey || !guestName || !guestEmail || !checkIn || !checkOut || !total) {
        return NextResponse.json({ ok: false, error: "Missing required params" }, { status: 400 });
    }

    // Beds24 createBooking payload，详细字段按需扩展
    const payload = {
        authentication: {
            apiKey: process.env.BEDS24_API_KEY!,
            propKey
        },

        roomId,
        status: "3",
        firstNight: checkIn,
        lastNight: format(subDays(parseISO(checkOut), 1), "yyyy-MM-dd"),
        numAdult: Number(adults) || 1,
        numChild: Number(children) || 0,
        guestFirstName: "",
        guestName: guestName, // 可选，若有姓氏可传入
        guestEmail: guestEmail,
        price: Number(total),
        message: message || "",
        checkAvailability: true,
        notifyGuest: true,
        // beds24支持的其他字段可在此扩展
    };

    // 发起Beds24 API请求
    const res = await fetch("https://api.beds24.com/json/setBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    console.log('Beds24返回原始内容:', rawText);
    console.log(payload.authentication);
    console.log(payload);

    let data;
    try {
        data = JSON.parse(rawText);
    } catch (err) {
        return NextResponse.json({ ok: false, error: "Beds24 API返回异常", raw: rawText }, { status: 500 });
    }

    if (!res.ok || data.error) {
        return NextResponse.json({ ok: false, error: data.error || "Beds24接口调用失败", raw: data }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
}