import React from 'react';

interface FeedCardThumbnailProps {
  src?: string;
  alt?: string;
  className?: string;
  category?: string;
}

export default function FeedCardThumbnail({ src, alt, className = '', category }: FeedCardThumbnailProps) {
  if (!src) return null;

  return (
    <div className={`overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 shrink-0 ${className}`}>
      <img
        src={src}
        alt={alt || category || 'Thumbnail'}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}
