// apps/web/src/app/api/reviews/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ReviewsData {
  airbnb: {
    rating: number;
    totalReviews: number;
    reviews: any[];
    lastUpdated: string;
    platformUrl?: string;
  };
}

interface SaveRequest {
  propertyName: string;
  reviewsData: ReviewsData;
}

// 确保数据目录存在
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'src/data/reviews');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  return dataDir;
}


export async function POST(request: NextRequest) {
    try {
      const { propertyName, reviewsData }: SaveRequest = await request.json();
  
      if (!propertyName || !reviewsData) {
        return NextResponse.json({
          success: false,
          error: 'Missing propertyName or reviewsData'
        }, { status: 400 });
      }
  
      // 从环境变量获取配置，提取 airbnbUrl 作为 platformUrl
      const configJson = process.env.SCRAPER_CONFIG_JSON;
      let airbnbUrl = null;
      
      if (configJson) {
        try {
          const configs = JSON.parse(configJson);
          const config = configs[propertyName];
          if (config && config.airbnbUrl) {
            airbnbUrl = config.airbnbUrl;
          }
        } catch (error) {
          console.warn('Failed to parse SCRAPER_CONFIG_JSON:', error);
        }
      }
  
      // 确保数据目录存在
      const dataDir = await ensureDataDirectory();
      
      // 构建文件路径
      const filePath = path.join(dataDir, `${propertyName}-reviews.json`);
      
      // 添加 platformUrl 到数据中
      const dataToSave = {
        ...reviewsData,
        airbnb: {
          ...reviewsData.airbnb,
          platformUrl: airbnbUrl || reviewsData.airbnb.platformUrl
        }
      };
      
      // 保存数据到文件
      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      
      console.log(`✅ 评论数据已保存到: ${filePath}`);
      console.log(`📊 保存统计: ${reviewsData.airbnb.totalReviews} 条 Airbnb 评论`);
      console.log(`🔗 Platform URL: ${airbnbUrl}`);
  
      return NextResponse.json({
        success: true,
        message: `评论数据已保存到 ${propertyName}-reviews.json`,
        filePath: filePath,
        stats: {
          airbnbReviews: reviewsData.airbnb.totalReviews,
          averageRating: reviewsData.airbnb.rating,
          lastUpdated: reviewsData.airbnb.lastUpdated,
          platformUrl: airbnbUrl
        }
      });
  
    } catch (error) {
      console.error('💥 保存评论数据失败:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

// 获取已保存的评论数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyName = searchParams.get('propertyName');

    if (!propertyName) {
      return NextResponse.json({
        success: false,
        error: 'Missing propertyName parameter'
      }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), 'src/data/reviews');
    const filePath = path.join(dataDir, `${propertyName}-reviews.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const reviewsData = JSON.parse(fileContent);

      return NextResponse.json({
        success: true,
        data: reviewsData,
        metadata: {
          propertyName,
          fileExists: true,
          lastModified: (await fs.stat(filePath)).mtime.toISOString()
        }
      });

    } catch (fileError) {
      // 文件不存在
      return NextResponse.json({
        success: false,
        error: 'Reviews file not found',
        metadata: {
          propertyName,
          fileExists: false
        }
      }, { status: 404 });
    }

  } catch (error) {
    console.error('💥 读取评论数据失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 列出所有已保存的评论文件
export async function OPTIONS(request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'src/data/reviews');
    
    try {
      const files = await fs.readdir(dataDir);
      const reviewFiles = files
        .filter(file => file.endsWith('-reviews.json'))
        .map(file => {
          const propertyName = file.replace('-reviews.json', '');
          return {
            propertyName,
            fileName: file,
            filePath: path.join(dataDir, file)
          };
        });

      return NextResponse.json({
        success: true,
        files: reviewFiles,
        count: reviewFiles.length
      });

    } catch (dirError) {
      // 目录不存在
      return NextResponse.json({
        success: true,
        files: [],
        count: 0,
        message: 'Reviews directory does not exist yet'
      });
    }

  } catch (error) {
    console.error('💥 列出评论文件失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}