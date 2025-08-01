import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type GalleryProps = {
    images: string[];
};

export default function Gallery({ images }: GalleryProps) {
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    // 默认显示的图片数量
    const PREVIEW_COUNT = 5;
    const previewImages = images.slice(0, PREVIEW_COUNT);

    // Ensure component is mounted before using portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showAllPhotos || fullscreenImage !== null) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            
            return () => {
                // Restore scroll position
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [showAllPhotos, fullscreenImage]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (fullscreenImage === null) return;
            
            if (e.key === 'ArrowLeft' && fullscreenImage > 0) {
                setFullscreenImage(fullscreenImage - 1);
            } else if (e.key === 'ArrowRight' && fullscreenImage < images.length - 1) {
                setFullscreenImage(fullscreenImage + 1);
            } else if (e.key === 'Escape') {
                setFullscreenImage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fullscreenImage, images.length]);

    // Gallery grid modal (显示所有图片)
    const allPhotosModal = showAllPhotos && mounted ? createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
            {/* Backdrop */}
            <div 
                style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)' 
                }} 
            />
            {/* Modal */}
            <div 
                style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundColor: 'white', 
                    overflowY: 'auto' 
                }}
            >
                <div className="sticky top-0 bg-white z-10 p-4 border-b">
                    <button
                        onClick={() => setShowAllPhotos(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="max-w-4xl mx-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {images.map((src, i) => (
                            <div
                                key={src}
                                className="relative aspect-[4/3] cursor-pointer rounded-lg overflow-hidden"
                                onClick={() => {
                                    setFullscreenImage(i);
                                    setShowAllPhotos(false);
                                }}
                            >
                                <Image
                                    src={src}
                                    alt={`gallery ${i + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    quality={75}
                                    loading="lazy"
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    // Fullscreen viewer modal
    const fullscreenModal = fullscreenImage !== null && mounted ? createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
            {/* Black background */}
            <div 
                style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundColor: 'black' 
                }} 
            />
            {/* Viewer */}
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Close button */}
                <button
                    onClick={() => setFullscreenImage(null)}
                    style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Image counter */}
                <div 
                    style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
                    className="bg-black/50 text-white px-3 py-1 rounded-full"
                >
                    {fullscreenImage + 1} / {images.length}
                </div>

                {/* Previous button */}
                {fullscreenImage > 0 && (
                    <button
                        onClick={() => setFullscreenImage(fullscreenImage - 1)}
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Next button */}
                {fullscreenImage < images.length - 1 && (
                    <button
                        onClick={() => setFullscreenImage(fullscreenImage + 1)}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Main image with click to close on background */}
                <div 
                    style={{ width: '100%', height: '100%', padding: '2rem' }}
                    className="relative flex items-center justify-center"
                    onClick={(e) => {
                        // Close if clicking on background, not on image
                        if (e.target === e.currentTarget) {
                            setFullscreenImage(null);
                        }
                    }}
                >
                    <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={images[fullscreenImage]}
                            alt={`gallery ${fullscreenImage + 1}`}
                            fill
                            sizes="100vw"
                            quality={90} // 全屏查看时使用更高质量
                            className="object-contain"
                            priority // 全屏图片优先加载
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <section id="gallery" className="w-full relative">
                {/* ── Mobile Carousel (只显示前几张) ─────────────────── */}
                <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-1">
                    {previewImages.map((src, i) => (
                        <div
                            key={src}
                            className="relative shrink-0 w-4/5 aspect-[4/3] snap-center rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => setFullscreenImage(i)}
                        >
                            <Image
                                src={src}
                                alt={`gallery ${i + 1}`}
                                fill
                                sizes="80vw"
                                quality={75}
                                loading={i === 0 ? "eager" : "lazy"}
                                priority={i === 0}
                                className="object-cover"
                            />
                            {/* Photo counter badge */}
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm">
                                {i + 1} / {images.length}
                            </div>
                        </div>
                    ))}
                    
                    {/* 如果有更多图片，显示查看更多按钮 */}
                    {images.length > PREVIEW_COUNT && (
                        <div className="shrink-0 w-4/5 aspect-[4/3] snap-center rounded-2xl overflow-hidden flex items-center justify-center bg-gray-100 cursor-pointer"
                             onClick={() => setShowAllPhotos(true)}>
                            <div className="text-center">
                                <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <p className="text-sm text-gray-600">+{images.length - PREVIEW_COUNT} more</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Desktop Grid (只显示前5张，1大+4小布局) ────────────────────── */}
                <div className="hidden md:grid gap-2 grid-cols-4 grid-rows-2 h-[500px] relative">
                    {/* 第一张大图 - 占左侧2列2行 */}
                    {previewImages[0] && (
                        <div
                            className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl cursor-pointer"
                            onClick={() => setFullscreenImage(0)}
                        >
                            <Image
                                src={previewImages[0]}
                                alt="gallery 1"
                                fill
                                sizes="50vw"
                                quality={75}
                                priority
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}
                    
                    {/* 右侧4张小图 */}
                    {previewImages.slice(1, 5).map((src, i) => (
                        <div
                            key={src}
                            className="relative overflow-hidden rounded-2xl cursor-pointer"
                            onClick={() => setFullscreenImage(i + 1)}
                        >
                            <Image
                                src={src}
                                alt={`gallery ${i + 2}`}
                                fill
                                sizes="25vw"
                                quality={75}
                                loading={i < 2 ? "eager" : "lazy"}
                                priority={i < 2}
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                    
                    {/* Show all photos button */}
                    {images.length > PREVIEW_COUNT && (
                        <button
                            onClick={() => setShowAllPhotos(true)}
                            className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors border border-black"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Show all photos ({images.length})
                        </button>
                    )}
                </div>
            </section>

            {/* Render modals using portal */}
            {allPhotosModal}
            {fullscreenModal}
        </>
    );
}