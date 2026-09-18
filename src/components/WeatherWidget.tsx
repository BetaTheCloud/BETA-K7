import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  CloudSun, 
  Moon, 
  Sun, 
  Droplets, 
  Wind, 
  Umbrella,
  Sparkles
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  weathercode: number;
  is_day: number;
}

interface WeatherWidgetProps {
  onWeatherChange?: (code: number, isDay: number) => void;
}

export default function WeatherWidget({ onWeatherChange }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.7161&longitude=37.1150&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=precipitation_probability_max&forecast_days=1&timezone=Europe%2FIstanbul');
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        setWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          rainChance: data.daily.precipitation_probability_max[0] || 0,
          weathercode: data.current.weather_code,
          is_day: data.current.is_day,
        });
        
        if (onWeatherChange) {
          onWeatherChange(data.current.weather_code, data.current.is_day);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 w-full sm:w-auto bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-sm animate-pulse">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <CloudLightning className="w-5 h-5 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="w-20 h-4 bg-white/20 rounded-md"></div>
          <div className="w-28 h-3 bg-white/10 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const getWeatherTheme = (code: number, isDay: number) => {
    switch (true) {
      case code === 0:
        return isDay
          ? {
              text: 'Açık & Güneşli',
              Icon: Sun,
              color: 'text-amber-400',
              bgColor: 'bg-amber-500/15 border-amber-500/30',
              pingColor: 'bg-amber-400',
              pingBg: 'bg-amber-500',
              glowAura: 'bg-amber-400/20',
              badge: 'bg-amber-500/20 text-amber-200 border-amber-500/30'
            }
          : {
              text: 'Açık Gece',
              Icon: Moon,
              color: 'text-indigo-300',
              bgColor: 'bg-indigo-500/15 border-indigo-500/30',
              pingColor: 'bg-indigo-400',
              pingBg: 'bg-indigo-500',
              glowAura: 'bg-indigo-500/20',
              badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30'
            };
      case code === 1 || code === 2:
        return {
          text: 'Parçalı Bulutlu',
          Icon: CloudSun,
          color: 'text-sky-300',
          bgColor: 'bg-sky-500/15 border-sky-500/30',
          pingColor: 'bg-sky-400',
          pingBg: 'bg-sky-500',
          glowAura: 'bg-sky-400/20',
          badge: 'bg-sky-500/20 text-sky-200 border-sky-500/30'
        };
      case code === 3:
        return {
          text: 'Çok Bulutlu',
          Icon: Cloud,
          color: 'text-stone-200',
          bgColor: 'bg-stone-500/15 border-stone-400/30',
          pingColor: 'bg-stone-300',
          pingBg: 'bg-stone-400',
          glowAura: 'bg-stone-400/20',
          badge: 'bg-stone-500/20 text-stone-200 border-stone-400/30'
        };
      case code === 45 || code === 48:
        return {
          text: 'Puslu / Sisli',
          Icon: CloudFog,
          color: 'text-teal-200',
          bgColor: 'bg-teal-500/15 border-teal-400/30',
          pingColor: 'bg-teal-300',
          pingBg: 'bg-teal-400',
          glowAura: 'bg-teal-400/20',
          badge: 'bg-teal-500/20 text-teal-200 border-teal-400/30'
        };
      case code >= 51 && code <= 55:
        return {
          text: 'Hafif Çisenti',
          Icon: CloudDrizzle,
          color: 'text-cyan-300',
          bgColor: 'bg-cyan-500/15 border-cyan-400/30',
          pingColor: 'bg-cyan-300',
          pingBg: 'bg-cyan-500',
          glowAura: 'bg-cyan-400/20',
          badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30'
        };
      case (code >= 61 && code <= 65) || (code >= 80 && code <= 82):
        return {
          text: 'Sağanak Yağışlı',
          Icon: CloudRain,
          color: 'text-blue-300',
          bgColor: 'bg-blue-500/15 border-blue-400/30',
          pingColor: 'bg-blue-400',
          pingBg: 'bg-blue-500',
          glowAura: 'bg-blue-500/20',
          badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30'
        };
      case (code >= 71 && code <= 77) || (code >= 85 && code <= 86):
        return {
          text: 'Kar Yağışlı',
          Icon: CloudSnow,
          color: 'text-cyan-200',
          bgColor: 'bg-cyan-400/15 border-cyan-300/30',
          pingColor: 'bg-cyan-200',
          pingBg: 'bg-cyan-400',
          glowAura: 'bg-cyan-300/20',
          badge: 'bg-cyan-500/20 text-cyan-100 border-cyan-300/30'
        };
      case code >= 95:
        return {
          text: 'Gök Gürültülü Fırtına',
          Icon: CloudLightning,
          color: 'text-amber-300',
          bgColor: 'bg-amber-500/20 border-amber-500/40',
          pingColor: 'bg-amber-400',
          pingBg: 'bg-amber-500',
          glowAura: 'bg-purple-500/30',
          badge: 'bg-purple-500/25 text-amber-200 border-purple-500/40'
        };
      default:
        return {
          text: 'Kilis',
          Icon: isDay ? Sun : Moon,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/15 border-amber-500/30',
          pingColor: 'bg-amber-400',
          pingBg: 'bg-amber-500',
          glowAura: 'bg-amber-400/20',
          badge: 'bg-amber-500/20 text-amber-200 border-amber-500/30'
        };
    }
  };

  const theme = getWeatherTheme(weather.weathercode, weather.is_day);
  const Icon = theme.Icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex items-center w-full sm:w-auto gap-3.5 bg-white/[0.08] hover:bg-white/[0.12] transition-all backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shadow-lg overflow-hidden"
    >
      {/* Dynamic ambient background glow */}
      <div className={`absolute -inset-1 rounded-2xl ${theme.glowAura} blur-xl opacity-60 pointer-events-none transition-all group-hover:opacity-100`}></div>

      {/* Animated Weather Icon Badge with Ping status */}
      <div className="relative shrink-0">
        <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className={`relative w-11 h-11 rounded-2xl ${theme.bgColor} flex items-center justify-center border shadow-inner`}
        >
          <Icon className={`w-6 h-6 ${theme.color} animate-pulse`} strokeWidth={1.75} />
        </motion.div>

        {/* Live Status Ping Dot */}
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.pingColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${theme.pingBg} border border-white/40`}></span>
        </span>
      </div>
      
      {/* Weather Metrics & Text */}
      <div className="flex flex-col justify-center min-w-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-display tracking-tight text-white leading-none drop-shadow-sm">
            {Math.round(weather.temperature)}°
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${theme.badge} truncate tracking-wide`}>
            {theme.text}
          </span>
        </div>
        
        {/* Environmental Indicators */}
        <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-medium text-white/80">
          <div className="flex items-center gap-1" title="Yağış İhtimali">
            <Umbrella className="w-3.5 h-3.5 text-sky-300" strokeWidth={1.75} />
            <span>%{weather.rainChance}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-1" title="Bağıl Nem">
            <Droplets className="w-3.5 h-3.5 text-blue-300" strokeWidth={1.75} />
            <span>%{weather.humidity}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-1" title="Rüzgar Hızı">
            <Wind className="w-3.5 h-3.5 text-stone-300" strokeWidth={1.75} />
            <span>{Math.round(weather.windSpeed)} km/s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
