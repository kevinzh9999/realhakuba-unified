import React from 'react';
import { WiDaySunny, WiCloudy, WiDayCloudy, WiRain, WiSnow } from 'react-icons/wi';

export default function WeatherIcon({ code }: { code: number }) {
  // 简化映射：Open-Meteo 的官方 code → 图标
  // 0: Clear, 1–2: Partly Cloudy, 3: Overcast, 61–67: Rain, 71–77: Snow...
  const map: Record<number, React.ReactElement> = {
    0: <WiDaySunny size={32} />,
    1: <WiDayCloudy size={32} />,
    2: <WiDayCloudy size={32} />,
    3: <WiCloudy size={32} />,
    45: <WiCloudy size={32} />,      // Fog
    48: <WiCloudy size={32} />,
    51: <WiRain size={32} />,
    53: <WiRain size={32} />,
    55: <WiRain size={32} />,
    61: <WiRain size={32} />,
    63: <WiRain size={32} />,
    65: <WiRain size={32} />,
    71: <WiSnow size={32} />,
    73: <WiSnow size={32} />,
    75: <WiSnow size={32} />,
    77: <WiSnow size={32} />,
    // …可根据需求继续补充
  };

  // 如果 code 不在表里，fallback 为多云图标
  return map[code] ?? <WiCloudy size={32} />;
}