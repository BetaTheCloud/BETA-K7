import React, { useState } from 'react';
import { Megaphone, Newspaper, Calendar } from 'lucide-react';

export interface FeedCardThumbnailProps {
  imageUrl?: string;
  category?: string;
  title?: string;
  type?: 'announcement' | 'news' | 'event';
  className?: string;
}

export default function FeedCardThumbnail({
  imageUrl,
  category = '',
  title = '',
  type = 'announcement',
  className = ''
}: FeedCardThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  const isMain =
    category.toLowerCase().includes('ana') ||
    category.toLowerCase().includes('genel') ||
    category.toLowerCase().includes('rektörlük');

  if (imageUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-stone-100 dark:bg-white/5 shrink-0 ${className}`}>
        <img
          src={imageUrl}
          alt={title || 'K7AÜ Görsel'}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl shrink-0 ${
        isMain
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          : type === 'news'
          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
          : type === 'event'
          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
      } ${className}`}
    >
      {type === 'news' ? (
        <Newspaper className="w-5 h-5" strokeWidth={1.75} />
      ) : type === 'event' ? (
        <Calendar className="w-5 h-5" strokeWidth={1.75} />
      ) : (
        <Megaphone className="w-5 h-5" strokeWidth={1.75} />
      )}
    </div>
  );
}
