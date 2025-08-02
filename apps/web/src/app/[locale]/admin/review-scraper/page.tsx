// apps/web/src/app/[locale]/admin/review-scraper/page.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, PlayCircle, CheckCircle2, XCircle, Save } from 'lucide-react';

interface ScrapedData {
  success: boolean;
  data?: {
    rating: number;
    totalReviews: number;
    reviews: any[];
  };
  scrapeInfo?: {
    timestamp: string;
    propertyName: string;
    platform: string;
    error?: string | null;
  };
  error?: string;
}

const PROPERTIES = [
  { id: 'riverside-loghouse', name: 'Riverside Log House' },
  { id: 'echo-villa', name: 'Echo Villa' },
  { id: 'moyai-house', name: 'Moyai House' },
  { id: 'kaflihaus', name: 'KAFLIHAUS' }
];

export default function ReviewScraperAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('riverside-loghouse');
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [lastScrapeTime, setLastScrapeTime] = useState<string | null>(null);

  const handleScrape = async () => {
    setIsLoading(true);
    setScrapedData(null);

    try {
      console.log(`开始抓取 ${selectedProperty} 的 Airbnb 评论...`);

      const response = await fetch('/api/scraper/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyName: selectedProperty
        })
      });

      const data = await response.json();
      setScrapedData(data);

      if (data.success) {
        setLastScrapeTime(new Date().toISOString());
        console.log('抓取成功:', data);
      } else {
        console.error('抓取失败:', data.error);
      }

    } catch (error) {
      console.error('抓取异常:', error);
      setScrapedData({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 保存到文件的功能
  const handleSaveToFile = async () => {
    if (!scrapedData?.success || !scrapedData.data) {
      alert('没有可保存的数据');
      return;
    }

    setIsSaving(true);
    try {
      const saveResponse = await fetch('/api/reviews/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyName: selectedProperty,
          reviewsData: {
            airbnb: {
              rating: scrapedData.data.rating,
              totalReviews: scrapedData.data.totalReviews,
              reviews: scrapedData.data.reviews,
              lastUpdated: new Date().toISOString()
            }
          }
        })
      });

      const result = await saveResponse.json();
      
      if (result.success) {
        alert(`评论数据已保存到文件！\n${result.stats?.platformUrl ? 'Platform URL: ' + result.stats.platformUrl : ''}`);
      } else {
        alert(`保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存异常:', error);
      alert('保存过程中发生错误');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadData = () => {
    if (!scrapedData?.data) return;

    const dataStr = JSON.stringify(scrapedData.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `airbnb-reviews-${selectedProperty}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Airbnb 评论抓取管理</h1>
        <Badge variant="secondary">
          {lastScrapeTime ? `上次抓取: ${formatDate(lastScrapeTime)}` : '尚未抓取'}
        </Badge>
      </div>

      {/* 抓取控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            抓取控制
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 属性选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">选择属性</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              {PROPERTIES.map(prop => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>

          {/* 抓取按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleScrape}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '抓取中...' : '抓取 Airbnb 评论'}
            </Button>
          </div>

          {/* 警告提示 */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">使用说明：</p>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>请确保在.env.local中配置了SCRAPER_CONFIG_JSON</li>
                <li>抓取后需要点击"保存到文件"按钮将数据保存</li>
                <li>保存的数据将用于前端显示</li>
                <li>建议每周更新一次评论数据</li>
                <li>请遵守网站的使用条款</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 抓取结果 */}
      {scrapedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {scrapedData.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              抓取结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scrapedData.success && scrapedData.data ? (
              <div className="space-y-4">
                {/* 统计信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {scrapedData.data.totalReviews}
                    </div>
                    <div className="text-sm text-gray-600">Airbnb 评论总数</div>
                    <div className="text-xs text-gray-500">
                      平均: {scrapedData.data.rating.toFixed(1)}星
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {scrapedData.scrapeInfo?.timestamp ? formatDate(scrapedData.scrapeInfo.timestamp) : '刚刚'}
                    </div>
                    <div className="text-sm text-gray-600">抓取时间</div>
                    <div className="text-xs text-gray-500">
                      属性: {scrapedData.scrapeInfo?.propertyName || selectedProperty}
                    </div>
                  </div>
                </div>

                {/* 错误信息 */}
                {scrapedData.scrapeInfo?.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm text-red-800">
                      <p className="font-medium">抓取错误：</p>
                      <p>{scrapedData.scrapeInfo.error}</p>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveToFile} 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? '保存中...' : '保存到文件'}
                  </Button>
                  
                  <Button onClick={downloadData} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    下载数据 (JSON)
                  </Button>
                </div>

                {/* 评论预览 */}
                {scrapedData.data.reviews.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">评论预览 (显示前5条)</h3>

                    {scrapedData.data.reviews.slice(0, 5).map((review, index) => (
                      <div key={review.id} className="p-3 border border-red-200 rounded-md bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Airbnb</Badge>
                            <span className="font-medium">{review.author}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.rating}★ · {review.date}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">抓取失败</p>
                <p className="text-red-700 text-sm mt-1">{scrapedData.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 配置说明 */}
      <Card>
        <CardHeader>
          <CardTitle>环境变量配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-600 mb-2">在 .env.local 中添加:</p>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              {`SCRAPER_CONFIG_JSON={
  "riverside-loghouse": {
    "airbnbUrl": "https://www.airbnb.com/rooms/12345678",
    "maxReviews": 20
  },
  "echo-villa": {
    "airbnbUrl": "https://www.airbnb.com/rooms/87654321",
    "maxReviews": 20
  },
  "moyai-house": {
    "airbnbUrl": "https://www.airbnb.com/rooms/11223344",
    "maxReviews": 20
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}