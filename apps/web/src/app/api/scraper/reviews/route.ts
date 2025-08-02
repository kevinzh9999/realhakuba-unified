// apps/web/src/app/api/scraper/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface ScrapedReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  platform: 'airbnb';
}

interface ScraperConfig {
  propertyName: string;
  airbnbUrl?: string;
  maxReviews?: number;
}

// 从环境变量获取抓取配置
const SCRAPER_CONFIG_JSON = process.env.SCRAPER_CONFIG_JSON;

function getScraperConfig(propertyName: string): ScraperConfig | null {
  try {
    if (!SCRAPER_CONFIG_JSON) return null;
    const configs = JSON.parse(SCRAPER_CONFIG_JSON);
    return configs[propertyName] || null;
  } catch (error) {
    return null;
  }
}

// 获取 Puppeteer 配置
function getPuppeteerConfig() {
  const isDev = process.env.NODE_ENV === 'development';
  const isVercel = process.env.VERCEL === '1';
  
  if (isDev) {
    // 开发环境 - 使用系统 Chrome
    const fs = require('fs');
    
    // 多个可能的 Chrome 路径
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      process.env.CHROME_EXECUTABLE_PATH, // 允许通过环境变量自定义
    ].filter(Boolean);
    
    let executablePath = undefined;
    
    // 找到第一个存在的路径
    for (const path of possiblePaths) {
      try {
        if (fs.existsSync(path)) {
          executablePath = path;
          console.log(`✅ 使用 Chrome 路径: ${path}`);
          break;
        }
      } catch (error) {
        console.log(`❌ 检查路径失败: ${path}`);
      }
    }
    
    if (!executablePath) {
      console.log('⚠️ 未找到系统 Chrome，将使用 Puppeteer 内置版本');
    }
    
    return {
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    };
  } else if (isVercel) {
    // Vercel 生产环境
    return {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };
  } else {
    // 其他生产环境
    return {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };
  }
}

// 抓取Airbnb评论 - 增强版，支持点击"Show all reviews"
async function scrapeAirbnbReviews(url: string, maxReviews: number = 20): Promise<ScrapedReview[]> {
  console.log('🏠 开始抓取Airbnb评论:', url);
  
  const browser = await puppeteer.launch(getPuppeteerConfig());

  try {
    const page = await browser.newPage();
    
    // 设置用户代理和视口
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 导航到页面
    console.log('📄 正在加载Airbnb页面...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待页面完全加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 调试：检查页面标题和当前URL
    const title = await page.title();
    const currentUrl = page.url();
    console.log(`📄 页面标题: ${title}`);
    console.log(`📄 当前URL: ${currentUrl}`);
    
    // 尝试点击 "Show all reviews" 按钮
    console.log('🔍 尝试查找并点击 "Show all reviews" 按钮...');
    
    const showAllButtonSelectors = [
      'button:has-text("Show all")', // 包含 "Show all" 文本的按钮
      'button[data-testid*="reviews-modal"]', // 可能的测试ID
      'a:has-text("Show all")', // 可能是链接
      'button:has-text("reviews")', // 包含 "reviews" 的按钮
      '[role="button"]:has-text("Show all")', // 任何有按钮角色的元素
    ];
    
    let buttonClicked = false;
    
    // 方法1: 使用文本匹配查找按钮
    try {
      const showAllButtonFound = await page.evaluate(() => {
        // 查找包含 "Show all" 和 "reviews" 的按钮或链接
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const targetButton = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('show all') && text.includes('reviews');
        });
        
        if (targetButton) {
          (targetButton as HTMLElement).click();
          return true;
        }
        return false;
      });
      
      if (showAllButtonFound) {
        console.log('✅ 找到并点击了 "Show all reviews" 按钮');
        buttonClicked = true;
        
        // 等待新内容加载
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error: any) {
      console.log('⚠️ 方法1查找按钮失败:', error?.message || error);
    }
    
    // 方法2: 如果方法1失败，尝试通过滚动触发加载更多
    if (!buttonClicked) {
      console.log('🔍 尝试通过滚动加载更多评论...');
      
      // 滚动到页面底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 再次尝试查找并点击按钮
      try {
        const foundButton = await page.evaluate(() => {
          const selectors = [
            'button[aria-label*="reviews"]',
            'button[data-testid*="reviews"]',
            'button:has-text("Show all")',
            'a:has-text("Show all")'
          ];
          
          for (const selector of selectors) {
            try {
              const button = document.querySelector(selector);
              if (button) {
                (button as HTMLElement).click();
                return true;
              }
            } catch (e) {
              // 继续尝试下一个选择器
            }
          }
          return false;
        });
        
        if (foundButton) {
          buttonClicked = true;
          await new Promise(resolve => setTimeout(resolve, 3000));
          console.log('✅ 通过滚动找到并点击了评论按钮');
        }
      } catch (error: any) {
        console.log('⚠️ 方法2也失败，将在当前页面查找评论');
      }
    }
    
    // 如果成功点击了按钮，再次滚动确保所有内容加载
    if (buttonClicked) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      // 如果没有找到按钮，正常滚动页面
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // 尝试多个可能的选择器
    const possibleSelectors = [
      '[data-testid="review-card"]',
      '[data-review-id]',
      '.review-item',
      '.review',
      '[role="listitem"]',
      '.c1yo0219', // Airbnb 的一些常见类名
      '.r1are2x1',
      'div[id*="review"]',
      'div[class*="review"]'
    ];
    
    let reviewSelector = null;
    let totalElements = 0;
    
    for (const selector of possibleSelectors) {
      try {
        console.log(`🔍 尝试选择器: ${selector}`);
        const elementCount = await page.$$eval(selector, elements => elements.length);
        if (elementCount > 0) {
          reviewSelector = selector;
          totalElements = elementCount;
          console.log(`✅ 找到 ${elementCount} 个评论元素，使用选择器: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ 选择器查询失败: ${selector}`);
      }
    }
    
    if (!reviewSelector) {
      console.log('❌ 未找到评论元素，可能需要手动检查页面结构');
      return [];
    }
    
    // 提取评论数据
    const reviews = await page.evaluate((maxReviews, selector) => {
      const reviewElements = document.querySelectorAll(selector);
      const reviews: any[] = [];
      
      console.log(`开始处理 ${reviewElements.length} 个评论元素`);
      
      for (let i = 0; i < Math.min(reviewElements.length, maxReviews); i++) {
        const element = reviewElements[i];
        
        try {
          // 改进的用户名提取逻辑
          let author = 'Anonymous';
          
          // 方法1: 使用常见的Airbnb用户名选择器
          const authorSelectors = [
            '[data-testid="review-author-name"]',
            '.review-author',
            'h3',
            'h4',
            'h5',
            'h6',
            '[role="heading"]',
            'span[dir="ltr"]',
            '.t1a9j9y7', // Airbnb 常见的用户名类
            '.t6mzqp7'  // 另一个可能的类名
          ];
          
          for (const authSel of authorSelectors) {
            const authorElement = element.querySelector(authSel);
            if (authorElement?.textContent?.trim()) {
              const authorText = authorElement.textContent.trim();
              // 确保这是一个合理的用户名（不是日期、评分等）
              if (authorText.length > 1 && authorText.length < 50 && 
                  !authorText.includes('★') && 
                  !authorText.includes('•') &&
                  !authorText.includes('2024') &&
                  !authorText.includes('2025') &&
                  !authorText.includes('Show more')) {
                author = authorText;
                break;
              }
            }
          }
          
          // 方法2: 如果还是Anonymous，尝试查找页面中的所有文本节点
          if (author === 'Anonymous') {
            const textElements = element.querySelectorAll('*');
            for (const el of textElements) {
              const text = el.textContent?.trim() || '';
              // 查找可能是用户名的短文本
              if (text.length > 1 && text.length < 30 && 
                  !text.includes('★') && 
                  !text.includes('•') &&
                  !text.includes('年') &&
                  !text.includes('月') &&
                  !text.includes('日') &&
                  !text.includes('2024') &&
                  !text.includes('2025') &&
                  !text.includes('Show more') &&
                  !text.includes('Stayed') &&
                  !text.includes('years on Airbnb') &&
                  !text.includes('on Airbnb') &&
                  el.children.length === 0) { // 叶子节点
                
                // 进一步验证：不是评论内容的一部分
                const parentText = el.parentElement?.textContent || '';
                if (!parentText.includes('我们') && 
                    !parentText.includes('房屋') && 
                    !parentText.includes('位置') &&
                    !parentText.includes('非常') &&
                    text !== parentText) {
                  author = text;
                  break;
                }
              }
            }
          }
          
          // 方法3: 如果还是找不到，尝试从整个元素文本中提取用户名模式
          if (author === 'Anonymous') {
            const allText = element.textContent || '';
            
            // 查找常见的用户名模式：单个词或两个词的组合
            const namePatterns = [
              /^([A-Za-z\u4e00-\u9fff]{2,20})\s/, // 开头的名字
              /\n([A-Za-z\u4e00-\u9fff]{2,20})\s/, // 换行后的名字
              /^([A-Za-z\u4e00-\u9fff]{2,20})$/, // 单独的名字
            ];
            
            for (const pattern of namePatterns) {
              const match = allText.match(pattern);
              if (match && match[1]) {
                const name = match[1].trim();
                // 确保不是常见的非用户名词汇
                if (!['Anonymous', 'Airbnb', 'Show', 'more', '房屋', '位置', '非常', '我们'].includes(name)) {
                  author = name;
                  break;
                }
              }
            }
          }
          
          // 尝试多种方式提取评论内容
          let comment = '';
          const commentSelectors = [
            '[data-testid="review-text"]',
            '.review-text',
            'p',
            '.comment',
            'span',
            'div'
          ];
          
          for (const commSel of commentSelectors) {
            const commentElements = element.querySelectorAll(commSel);
            for (const commentElement of commentElements) {
              const text = commentElement?.textContent?.trim() || '';
              if (text.length > 20 && text.length < 1000) {
                comment = text;
                break;
              }
            }
            if (comment) break;
          }
          
          // 尝试多种方式提取日期
          let date = '';
          const dateSelectors = [
            '[data-testid="review-date"]',
            '.review-date',
            'time',
            'span[title]'
          ];
          
          for (const dateSel of dateSelectors) {
            const dateElement = element.querySelector(dateSel);
            if (dateElement?.textContent?.trim()) {
              date = dateElement.textContent.trim();
              break;
            }
          }
          
          // Airbnb通常是5星制，默认5星
          let rating = 5;
          
          if (comment && comment.length > 10) {
            console.log(`成功提取评论 ${i+1}: 作者="${author}", 内容长度=${comment.length}, 内容前50字="${comment.substring(0, 50)}..."`);
            reviews.push({
              id: `airbnb-${Date.now()}-${i}`,
              author,
              rating,
              comment,
              date,
              platform: 'airbnb'
            });
          } else {
            console.log(`跳过元素 ${i+1}: 作者="${author}", 内容长度=${comment.length}, 内容="${comment.substring(0, 30)}..."`);
          }
        } catch (error) {
          console.log('解析单个评论失败:', error);
        }
      }
      
      return reviews;
    }, maxReviews, reviewSelector);
    
    console.log(`✅ Airbnb抓取完成: ${reviews.length}/${totalElements} 条评论`);
    return reviews;
    
  } catch (error) {
    console.error('❌ Airbnb抓取失败:', error);
    return [];
  } finally {
    await browser.close();
  }
}

// 计算平台平均评分
function calculateAverageRating(reviews: ScrapedReview[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始Airbnb评论抓取任务');
    
    const { propertyName } = await request.json();
    
    if (!propertyName) {
      return NextResponse.json({
        success: false,
        error: 'Missing propertyName parameter'
      }, { status: 400 });
    }
    
    // 获取抓取配置
    const config = getScraperConfig(propertyName);
    if (!config) {
      return NextResponse.json({
        success: false,
        error: `Scraper config not found for: ${propertyName}`
      }, { status: 404 });
    }
    
    if (!config.airbnbUrl) {
      return NextResponse.json({
        success: false,
        error: `Airbnb URL not configured for: ${propertyName}`
      }, { status: 404 });
    }
    
    console.log('📋 抓取配置:', {
      propertyName,
      airbnbUrl: config.airbnbUrl,
      maxReviews: config.maxReviews || 20
    });
    
    // 抓取Airbnb评论
    let reviews: ScrapedReview[] = [];
    let error: string | null = null;
    
    try {
      reviews = await scrapeAirbnbReviews(config.airbnbUrl, config.maxReviews);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Airbnb抓取异常:', err);
    }
    
    // 构建API响应格式
    const responseData = {
      success: true,
      data: {
        rating: calculateAverageRating(reviews),
        totalReviews: reviews.length,
        reviews: reviews
      },
      scrapeInfo: {
        timestamp: new Date().toISOString(),
        propertyName,
        platform: 'airbnb',
        error
      }
    };
    
    console.log('✅ 抓取任务完成:', {
      airbnbReviews: reviews.length,
      totalReviews: reviews.length
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('💥 抓取任务失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET方法用于测试配置
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
    
    const config = getScraperConfig(propertyName);
    
    return NextResponse.json({
      success: true,
      config: config ? {
        propertyName,
        hasAirbnbUrl: !!config.airbnbUrl,
        maxReviews: config.maxReviews || 20
      } : null
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}