// app/[locale]/reservation/_components/success-animation.tsx
'use client';

import { useEffect, useState } from 'react';

export function CelebrateAnimation() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24" viewBox="0 0 100 100">
        {/* 背景圆 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#f0fdf4"
          stroke="#10b981"
          strokeWidth="2"
          className="animate-scale-in"
        />
        
        {/* 动画圆圈 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeDasharray="283"
          strokeDashoffset="283"
          className="animate-draw-circle"
        />
        
        {/* 勾号 */}
        <path
          d="M 30 50 L 45 65 L 70 35"
          fill="none"
          stroke="#10b981"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset="60"
          className="animate-draw-check"
        />
      </svg>
      
      {/* 彩纸效果 */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: '50%',
                top: '50%',
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 10 + 6}px`,
                backgroundColor: ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'][i % 7],
                '--tx': `${(Math.random() - 0.5) * 150}px`,
                '--ty': `${Math.random() * -150 - 30}px`,
                '--r': `${Math.random() * 720 - 360}deg`,
                '--delay': `${Math.random() * 1}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}