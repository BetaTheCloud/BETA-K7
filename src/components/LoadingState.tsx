import { motion } from 'motion/react';
import { CloudLightning } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtitle?: string;
  minHeight?: string;
}

export default function LoadingState({
  message = 'Yükleniyor...',
  subtitle = 'Veriler güvenli bulut servislerinden alınıyor',
  minHeight = 'min-h-[280px]'
}: LoadingStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center ${minHeight} p-6 text-center`}
    >
      <div className="relative mb-4">
        {/* Animated outer aura glow */}
        <div className="absolute -inset-2 rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 blur-md animate-pulse"></div>
        
        {/* Main cloud container */}
        <div className="relative w-14 h-14 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 dark:border-amber-500/30 shadow-sm">
          <CloudLightning className="w-7 h-7 animate-pulse text-amber-600 dark:text-amber-400" />
        </div>

        {/* Pulsing ping status dot */}
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
        </span>
      </div>

      <h3 className="text-base font-display font-bold text-stone-800 dark:text-white tracking-tight">
        {message}
      </h3>
      {subtitle && (
        <p className="text-xs text-stone-500 dark:text-teal-100/70 mt-1 max-w-xs font-medium">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
