// components/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  priority = false,
  className,
  sizes,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        quality={75}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes || '100vw'}
        className={`
          ${className}
          ${isLoading ? 'blur-sm grayscale' : 'blur-0 grayscale-0'}
          transition-all duration-300
        `}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
}