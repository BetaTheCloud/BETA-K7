import { useMemo } from 'react';
import { motion } from 'motion/react';

interface WeatherBackgroundProps {
  weatherCode: number;
  isDay: number;
}

export default function WeatherBackground({ weatherCode, isDay }: WeatherBackgroundProps) {
  const isClear = weatherCode === 0;
  const isPartlyCloudy = weatherCode === 1 || weatherCode === 2;
  const isCloudy = weatherCode === 3 || weatherCode === 45 || weatherCode === 48;
  const isRainy = (weatherCode >= 51 && weatherCode <= 65) || (weatherCode >= 80 && weatherCode <= 82);
  const isSnowy = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isStormy = weatherCode >= 95;

  const hasClouds = isPartlyCloudy || isCloudy || isRainy || isSnowy || isStormy;

  const rainDrops = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i / 28) * 100 + (Math.random() * 4 - 2)}%`,
      delay: Math.random() * 1.5,
      duration: 0.5 + Math.random() * 0.35,
      opacity: 0.25 + Math.random() * 0.45,
      length: 14 + Math.random() * 16,
    }));
  }, []);

  const snowFlakes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 3,
      duration: 3.5 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 60,
      size: 2 + Math.random() * 3.5,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 85}%`,
      delay: Math.random() * 2.5,
      duration: 2 + Math.random() * 2.5,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      {/* Dynamic Base Gradient & Tint */}
      {isStormy ? (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-indigo-950/50 to-amber-900/30 mix-blend-multiply pointer-events-none" />
      ) : isRainy ? (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900/40 mix-blend-multiply pointer-events-none" />
      ) : isSnowy ? (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-slate-900/30 to-blue-950/30 mix-blend-multiply pointer-events-none" />
      ) : isClear && isDay ? (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-600/15 mix-blend-screen pointer-events-none" />
      ) : isClear && !isDay ? (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 via-slate-950/40 to-purple-950/40 mix-blend-multiply pointer-events-none" />
      ) : null}

      {/* Radiant Sun Flare & Rays for Clear Day */}
      {isClear && isDay === 1 && (
        <>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -left-10 w-52 h-52 bg-amber-400/30 rounded-full blur-3xl mix-blend-screen"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-14 w-60 h-60 bg-radial from-amber-300/15 via-transparent to-transparent opacity-40 blur-xl pointer-events-none"
          />
        </>
      )}

      {/* Twinkling Celestial Stars for Clear Night */}
      {isClear && isDay === 0 && (
        <div className="absolute inset-0">
          <div className="absolute -top-10 left-1/3 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl mix-blend-screen"></div>
          {stars.map((s) => (
            <motion.div
              key={`star-${s.id}`}
              className="absolute bg-white rounded-full blur-[0.3px]"
              style={{ 
                left: s.left, 
                top: s.top, 
                width: `${s.size}px`, 
                height: `${s.size}px` 
              }}
              animate={{ 
                opacity: [0.15, 0.9, 0.15], 
                scale: [0.75, 1.3, 0.75] 
              }}
              transition={{ 
                duration: s.duration, 
                repeat: Infinity, 
                delay: s.delay,
                ease: "easeInOut" 
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Cloud Formations */}
      {hasClouds && (
        <>
          <motion.div
            animate={{ x: [0, 45, 0], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-12 w-72 h-36 bg-slate-300/20 rounded-full blur-3xl mix-blend-screen"
          />
          <motion.div
            animate={{ x: [0, -35, 0], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-2 -right-12 w-56 h-36 bg-stone-200/15 rounded-full blur-3xl mix-blend-screen"
          />
        </>
      )}

      {/* Realistic Raindrops with Angled Fall */}
      {(isRainy || isStormy) && (
        <div className="absolute inset-0">
          {rainDrops.map((d) => (
            <motion.div
              key={`rain-${d.id}`}
              className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-200 to-sky-300 rounded-full blur-[0.2px]"
              style={{
                left: d.left,
                top: -30,
                height: `${d.length}px`,
                opacity: d.opacity,
                transform: 'rotate(12deg)'
              }}
              animate={{ y: ['0px', '220px'], x: ['0px', '25px'] }}
              transition={{
                duration: d.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: d.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Swirling Snow Flurry */}
      {isSnowy && (
        <div className="absolute inset-0">
          {snowFlakes.map((s) => (
            <motion.div
              key={`snow-${s.id}`}
              className="absolute bg-white/90 rounded-full blur-[0.6px] shadow-sm"
              style={{
                left: s.left,
                top: -15,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
              }}
              animate={{ 
                y: ['0px', '200px'], 
                x: [0, s.drift, 0] 
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: s.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Lightning Flash Effect */}
      {isStormy && (
        <>
          <motion.div
            animate={{ 
              opacity: [0, 0, 0, 0.8, 0, 0.3, 0, 0, 0.6, 0, 0] 
            }}
            transition={{ 
              duration: 5.5, 
              repeat: Infinity, 
              times: [0, 0.3, 0.31, 0.32, 0.34, 0.35, 0.37, 0.7, 0.72, 0.74, 1],
              ease: "linear" 
            }}
            className="absolute inset-0 bg-gradient-to-r from-amber-300/30 via-indigo-200/40 to-purple-300/30 mix-blend-overlay"
          />
          {/* Ambient lightning glow center */}
          <motion.div
            animate={{ 
              opacity: [0, 0, 0, 0.9, 0, 0.4, 0, 0] 
            }}
            transition={{ 
              duration: 5.5, 
              repeat: Infinity, 
              times: [0, 0.3, 0.31, 0.33, 0.35, 0.37, 0.4, 1],
              ease: "easeOut" 
            }}
            className="absolute top-0 right-1/4 w-36 h-36 bg-amber-400/30 rounded-full blur-2xl mix-blend-screen"
          />
        </>
      )}
    </div>
  );
}
