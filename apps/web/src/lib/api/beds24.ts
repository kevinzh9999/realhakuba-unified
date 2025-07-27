// apps/homepage/src/app/lib/beds24.ts

let cachedToken: { token: string, expires: number } | null = null;

export async function getBeds24Token() {
  // 若有缓存且没过期直接返回
  if (cachedToken && Date.now() < cachedToken.expires - 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch('https://api.beds24.com/api/v2/authorize', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.BEDS24_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: process.env.BEDS24_USER!,
      password: process.env.BEDS24_PASSWORD!
    }),
  });

  const data = await res.json();

  if (!data.success || !data.token) {
    throw new Error('Beds24 获取 token 失败: ' + JSON.stringify(data));
  }

  // token 有效期 1 小时，提前1分钟刷新
  cachedToken = {
    token: data.token,
    expires: Date.now() + 55 * 60 * 1000 // 55分钟后过期
  };


  return data.token;
}