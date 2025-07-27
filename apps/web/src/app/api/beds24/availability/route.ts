// apps/stays/src/app/api/beds24/availability/route.ts
import { NextRequest, NextResponse } from "next/server";

// 1. 只 parse 一次，效率高
let propsSecret: any = null;
function getPropsSecret() {
  if (!propsSecret) {
    const json = process.env.PROPS_SECRET_JSON;
    if (!json) throw new Error("PROPS_SECRET_JSON not set");
    propsSecret = JSON.parse(json);
  }
  return propsSecret;
}

function getConfigByPropName(propsSecret: any, propName: string) {
  if (!propName) return null;
  return propsSecret[propName.toLowerCase()] || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propName, from, to } = body;

    if (!propName || !from || !to) {
      return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });
    }

    const config = getConfigByPropName(getPropsSecret(), propName);
    if (!config) {
      return NextResponse.json({ ok: false, error: "Invalid propName" }, { status: 400 });
    }
    const { propKey, roomId } = config;

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

    const bedsRes = await fetch(
      "https://api.beds24.com/json/getRoomDates",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ).then(r => r.json());

    if (!bedsRes || typeof bedsRes !== "object") {
      return NextResponse.json({ ok: false, error: "Beds24 API error", raw: bedsRes }, { status: 502 });
    }

    return NextResponse.json({ ok: true, data: bedsRes });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Internal error" }, { status: 500 });
  }
}