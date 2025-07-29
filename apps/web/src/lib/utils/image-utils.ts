// lib/utils/image-utils-simple.ts
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function getImageWithBlur(imagePath: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', imagePath);
    const file = await fs.readFile(filePath);
    
    // 使用 sharp 生成小尺寸的模糊图片
    const metadata = await sharp(file).metadata();
    const { width = 1200, height = 800 } = metadata;
    
    // 生成一个很小的图片作为占位符
    const placeholder = await sharp(file)
      .resize(10, Math.round((10 * height) / width))
      .blur()
      .toBuffer();
    
    const base64 = `data:image/jpeg;base64,${placeholder.toString('base64')}`;
    
    return {
      src: imagePath,
      width,
      height,
      blurDataURL: base64,
    };
  } catch (error) {
    console.error(`Error processing image ${imagePath}:`, error);
    // 返回一个简单的 SVG 占位符
    return {
      src: imagePath,
      width: 1200,
      height: 800,
      blurDataURL: generateSimplePlaceholder(),
    };
  }
}

function generateSimplePlaceholder(): string {
  const shimmer = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(shimmer).toString('base64')}`;
}

export async function getImagesWithBlur(imagePaths: string[]) {
  const imagePromises = imagePaths.map(path => getImageWithBlur(path));
  return Promise.all(imagePromises);
}