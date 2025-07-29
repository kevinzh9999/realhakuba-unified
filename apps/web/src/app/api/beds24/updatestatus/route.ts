// apps/web/src/app/api/beds24/updatestatus/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { bookId, status, propName } = await req.json();

    // 验证参数
    if (!bookId || !status || !propName) {
      return NextResponse.json(
        { error: 'Missing required parameters: bookId, status, or propName' },
        { status: 400 }
      );
    }

    // 获取房源配置
    const propsConfig = JSON.parse(process.env.PROPS_SECRET_JSON || '{}');
    const propConfig = propsConfig[propName];

    if (!propConfig || !propConfig.propKey) {
      console.error(`Property configuration not found for: ${propName}`);
      return NextResponse.json(
        { error: `Property configuration not found for: ${propName}` },
        { status: 400 }
      );
    }

    const propKey = propConfig.propKey;

    console.log(`[BEDS24] Updating booking ${bookId} to status ${status} for property ${propName}`);

    const response = await fetch('https://api.beds24.com/json/setBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authentication: {
          apiKey: process.env.BEDS24_API_KEY,
          propKey: propKey
        },
        bookId: bookId,
        status: status  // "0" = cancelled, "1" = confirmed, "3" = request
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('Beds24 API error:', result);
      return NextResponse.json(
        { error: 'Beds24 API error', details: result },
        { status: 400 }
      );
    }

    console.log(`[BEDS24] Successfully updated booking ${bookId} to status ${status}`);
    return NextResponse.json({ success: true, result });
    
  } catch (error: any) {
    console.error('Error updating Beds24 status:', error);
    return NextResponse.json(
      { error: 'Failed to update Beds24 status', details: error.message },
      { status: 500 }
    );
  }
}