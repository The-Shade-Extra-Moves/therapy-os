import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface DynamicWallpaperProps {
  isEnabled: boolean;
  interval?: number; // in seconds
  category?: string;
  className?: string;
  enableTransitions?: boolean;
  isStatic?: boolean;
}

interface WallpaperImage {
  id: string;
  url: string;
  downloadUrl: string;
  photographer: string;
  photographerUrl: string;
}

// Predefined beautiful wallpaper categories
const WALLPAPER_CATEGORIES = {
  nature: 'nature',
  landscapes: 'landscape',
  abstract: 'abstract',
  minimal: 'minimal',
  space: 'space',
  ocean: 'ocean',
  mountains: 'mountain',
  sunset: 'sunset'
};

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to get this from Unsplash
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop'
];

const DynamicWallpaper: React.FC<DynamicWallpaperProps> = ({
  isEnabled,
  interval = 10,
  category = 'nature',
  className = '',
  enableTransitions = true,
  isStatic = false
}) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const preloadRef = useRef<HTMLImageElement[]>([]);
  const swiperRef = useRef(null);

  // Preload images for smooth transitions
  const preloadImages = (imageUrls: string[]) => {
    preloadRef.current = imageUrls.map(url => {
      const img = new Image();
      img.src = url;
      return img;
    });
  };

  // Fetch images from Unsplash or use fallback
  const fetchWallpapers = async (cat: string) => {
    try {
      setIsLoading(true);
      // For demo purposes, we'll use curated fallback images
      // In production, you would implement Unsplash API call here
      const categoryImages = {
        nature: [
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80'
        ],
        landscapes: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1920&h=1080&fit=crop&q=80'
        ],
        abstract: [
          'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop&q=80'
        ],
        minimal: [
          'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1615730278788-60d5e89e0b12?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1510337550647-e84f83e341ca?w=1920&h=1080&fit=crop&q=80',
          'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=1920&h=1080&fit=crop&q=80'
        ]
      };

      const selectedImages = categoryImages[cat as keyof typeof categoryImages] || categoryImages.nature;
      setImages(selectedImages);
      preloadImages(selectedImages);
    } catch (error) {
      console.error('Failed to fetch wallpapers:', error);
      setImages(FALLBACK_IMAGES);
      preloadImages(FALLBACK_IMAGES);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize wallpapers
  useEffect(() => {
    if (isEnabled) {
      fetchWallpapers(category);
    }
  }, [isEnabled, category]);

  // Set up automatic image cycling for non-transitions mode
  useEffect(() => {
    if (!isEnabled || enableTransitions || isStatic || images.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, interval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, enableTransitions, isStatic, images.length, interval]);

  if (!isEnabled || images.length === 0) return null;

  // Render static mode - single image, no cycling
  if (isStatic) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${images[0]})`, // Always show the first image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
        {isLoading && (
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Render with transitions disabled - cycling with simple changes
  if (!enableTransitions) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${images[currentImage]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
        {isLoading && (
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Render with Swiper and cool transitions
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <Swiper
        ref={swiperRef}
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        autoplay={{
          delay: interval * 1000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false
        }}
        loop={true}
        speed={1500}
        allowTouchMove={false}
        className="w-full h-full"
        onSlideChange={(swiper) => setCurrentImage(swiper.realIndex)}
      >
        {images.map((imageUrl, index) => (
          <SwiperSlide key={`${imageUrl}-${index}`}>
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
              className="w-full h-full"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20 pointer-events-none" />

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-3"
        >
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Optional slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 pointer-events-none">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImage 
                ? 'bg-white/80 scale-110' 
                : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicWallpaper;
export { WALLPAPER_CATEGORIES };
