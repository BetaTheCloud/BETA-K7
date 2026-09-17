import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isPulling = useRef(false);
  const startY = useRef(0);
  const controls = useAnimation();
  const spinnerControls = useAnimation();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return;
      isPulling.current = true;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || window.scrollY > 0 || isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
        
        const pull = Math.min(distance * 0.4, MAX_PULL);
        setPullDistance(pull);
        controls.set({ y: pull });
        spinnerControls.set({ y: pull, opacity: Math.min(pull / THRESHOLD, 1), rotate: Math.min(pull * 3, 360) });
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      
      if (pullDistance > THRESHOLD) {
        setIsRefreshing(true);
        // Animate to refresh position
        controls.start({ y: 50, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        spinnerControls.start({ y: 50, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
          spinnerControls.start({ y: 0, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        }
      } else {
        setPullDistance(0);
        controls.start({ y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        spinnerControls.start({ y: 0, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isRefreshing, pullDistance, onRefresh, controls, spinnerControls]);

  return (
    <div ref={containerRef} className="relative w-full min-h-full">
      <div className="absolute top-0 inset-x-0 flex justify-center items-start pointer-events-none z-0 overflow-visible">
        <motion.div 
          animate={spinnerControls}
          initial={{ y: 0, opacity: 0, rotate: 0 }}
          className="flex items-center justify-center w-10 h-10 -mt-12 bg-[#fcfbf9] dark:bg-[#264653] rounded-full shadow-md border border-[#e6e2d6] dark:border-white/10 text-amber-600 dark:text-amber-500"
        >
          <RefreshCw className={cn("w-5 h-5", isRefreshing ? "animate-spin" : "")} />
        </motion.div>
      </div>
      <motion.div animate={controls} className="w-full min-h-full relative z-10 bg-[#f4f1ea] dark:bg-[#1d3540]">
        {children}
      </motion.div>
    </div>
  );
}
