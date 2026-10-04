import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface HorizontalScrollWrapperProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  arrowClassName?: string;
}

export default function HorizontalScrollWrapper({
  children,
  className,
  showArrows = true,
  arrowClassName
}: HorizontalScrollWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    const handleWheel = (e: WheelEvent) => {
      // If user is scrolling vertically over horizontal bar, convert deltaY to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScroll();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', checkScroll);

    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true, attributes: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -offset : offset,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    checkScroll();
  };

  return (
    <div className="relative group/scroll w-full flex items-center">
      {/* Left Scroll Button */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-0 z-20 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-[#264653]/95 shadow-md border border-stone-200 dark:border-white/15 text-stone-700 dark:text-white hover:bg-stone-50 dark:hover:bg-white/20 transition-all active:scale-95 cursor-pointer",
            arrowClassName
          )}
          aria-label="Sola Kaydır"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable Viewport */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={cn(
          "w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x overscroll-x-contain select-none scroll-smooth",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab",
          className
        )}
      >
        {children}
      </div>

      {/* Right Scroll Button */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-0 z-20 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-[#264653]/95 shadow-md border border-stone-200 dark:border-white/15 text-stone-700 dark:text-white hover:bg-stone-50 dark:hover:bg-white/20 transition-all active:scale-95 cursor-pointer",
            arrowClassName
          )}
          aria-label="Sağa Kaydır"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
