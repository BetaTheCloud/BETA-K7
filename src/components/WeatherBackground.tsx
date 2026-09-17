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

  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      rainDuration: 0.4 + Math.random() * 0.3,
      snowDuration: 3 + Math.random() * 2,
      drift: `${(Math.random() - 0.5) * 40}px`,
      starDuration: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      {/* Subtle base glow so it's never completely flat */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl mix-blend-screen pointer-events-none"></div>

      {/* Sun / Clear Day */}
      {isClear && isDay === 1 && (
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 left-1/4 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl mix-blend-screen"
        />
      )}

      {/* Stars / Clear Night */}
      {isClear && isDay === 0 && (
        <div className="absolute inset-0">
          {particles.slice(0, 20).map((p, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white/70 rounded-full blur-[0.5px]"
              style={{ left: p.left, top: p.top }}
              animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: p.starDuration, repeat: Infinity, delay: p.delay }}
            />
          ))}
        </div>
      )}

      {/* Clouds */}
      {hasClouds && (
        <>
          <motion.div
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 w-64 h-32 bg-stone-400/10 rounded-full blur-3xl mix-blend-screen"
          />
          <motion.div
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-5 -right-10 w-48 h-32 bg-stone-300/10 rounded-full blur-3xl mix-blend-screen"
          />
        </>
      )}

      {/* Rain */}
      {(isRainy || isStormy) && (
        <div className="absolute inset-0">
          {particles.slice(0, 30).map((p, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-[1.5px] h-10 bg-blue-300/30 rounded-full blur-[0.5px]"
              style={{ left: p.left, top: -40 }}
              animate={{ y: ['0px', '250px'] }}
              transition={{ duration: p.rainDuration, repeat: Infinity, ease: 'linear', delay: p.delay }}
            />
          ))}
        </div>
      )}

      {/* Snow */}
      {isSnowy && (
        <div className="absolute inset-0">
          {particles.map((p, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute w-1.5 h-1.5 bg-white/60 rounded-full blur-[1px]"
              style={{ left: p.left, top: -10 }}
              animate={{ y: ['0px', '200px'], x: ['0px', p.drift] }}
              transition={{ duration: p.snowDuration, repeat: Infinity, ease: 'linear', delay: p.delay }}
            />
          ))}
        </div>
      )}

      {/* Lightning / Storm */}
      {isStormy && (
        <motion.div
          animate={{ opacity: [0, 0, 0, 0.4, 0, 0, 0.2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-indigo-200/20 mix-blend-overlay"
        />
      )}
    </div>
  );
}
