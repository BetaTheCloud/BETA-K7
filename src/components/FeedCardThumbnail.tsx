import React, { useState } from 'react';
import { Newspaper, Megaphone, Building2, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

interface FeedCardThumbnailProps {
  imageUrl?: string;
  type: 'news' | 'announcement';
  category?: string;
  title?: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  showBadge?: boolean;
}

export default function FeedCardThumbnail({
  imageUrl,
  type,
  category,
  title = '',
  className,
  aspectRatio = 'square',
  showBadge = false
}: FeedCardThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isNews = type === 'news';

  // Gradient styles according to type
  const fallbackGradient = isNews
    ? 'bg-gradient-to-br from-[#1b3a4b] via-[#264653] to-[#2a9d8f]'
    : 'bg-gradient-to-br from-[#2b2d42] via-[#3d405b] to-[#e07a5f]';

  const iconColor = isNews ? 'text-cyan-300' : 'text-amber-300';
  const IconComponent = isNews ? Newspaper : Megaphone;

  // Derive initial abbreviation from category or title
  const initials = (category || title || 'K7')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const aspectClass = aspectRatio === 'wide' 
    ? 'aspect-video w-full' 
    : aspectRatio === 'square' 
      ? 'w-16 h-16 sm:w-20 sm:h-20 shrink-0' 
      : 'w-full h-full';

  if (imageUrl && !hasError) {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-sm shrink-0 group', aspectClass, className)}>
        <img
          src={imageUrl}
          alt={title || category || 'Görsel'}
          className={cn(
            'w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105',
            !loaded && 'opacity-0 scale-95',
            loaded && 'opacity-100 scale-100 transition-opacity duration-300'
          )}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
        {showBadge && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <IconComponent className="w-2.5 h-2.5" />
            <span>{isNews ? 'Haber' : 'Duyuru'}</span>
          </div>
        )}
      </div>
    );
  }

  // Modern styled Fallback Banner
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden flex flex-col justify-between p-2 sm:p-2.5 text-white select-none shadow-sm transition-transform duration-300',
        fallbackGradient,
        aspectClass,
        className
      )}
    >
      {/* Decorative background shapes / watermarks */}
      <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none">
        <IconComponent className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={1} />
      </div>

      {/* Top row: badge/icon */}
      <div className="flex items-center justify-between gap-1 z-10">
        <div className={cn('p-1 rounded-md bg-white/15 backdrop-blur-sm', iconColor)}>
          <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <span className="text-[9px] font-black tracking-widest uppercase opacity-75">
          {initials || (isNews ? 'HABER' : 'DUYURU')}
        </span>
      </div>

      {/* Bottom row: type label */}
      <div className="z-10 mt-auto">
        <span className="text-[10px] font-bold tracking-tight line-clamp-1 opacity-90 drop-shadow-sm">
          {category || (isNews ? 'Üniversite Haberi' : 'Resmi Duyuru')}
        </span>
      </div>
    </div>
  );
}
