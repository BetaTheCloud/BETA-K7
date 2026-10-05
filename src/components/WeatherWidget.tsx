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
  Clock,
  ChevronRight
} from 'lucide-react';
import WeatherDetailModal, { DetailedWeatherInfo, HourlyForecastItem } from './WeatherDetailModal';

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
  const [detailedWeather, setDetailedWeather] = useState<DetailedWeatherInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=36.7161&longitude=37.1150&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,apparent_temperature,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,surface_pressure,uv_index,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&forecast_days=3&timezone=Europe%2FIstanbul';
        const res = await fetch(url);
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

        // Compute hourly items (+0h, +1h, +2h, +3h, +4h, +6h, +8h, +12h, +24h)
        const times: string[] = data.hourly.time || [];
        const currentTimeIso = data.current.time || '';
        
        // Exact matching on current hour block (e.g. "2026-10-05T19" from "2026-10-05T19:45")
        const currentHourPrefix = currentTimeIso ? currentTimeIso.slice(0, 13) : '';
        let baseIndex = currentHourPrefix ? times.findIndex((t: string) => t.startsWith(currentHourPrefix)) : -1;
        
        if (baseIndex === -1 && currentTimeIso) {
          const nextIndex = times.findIndex((t: string) => t >= currentTimeIso);
          if (nextIndex > 0) {
            baseIndex = nextIndex - 1;
          } else if (nextIndex === 0) {
            baseIndex = 0;
          }
        }
        if (baseIndex === -1) baseIndex = 0;

        const targetOffsets = [
          { offset: 0, label: 'Şu An' },
          { offset: 1, label: '+1 Saat' },
          { offset: 2, label: '+2 Saat' },
          { offset: 3, label: '+3 Saat' },
          { offset: 4, label: '+4 Saat' },
          { offset: 6, label: '+6 Saat' },
          { offset: 8, label: '+8 Saat' },
          { offset: 12, label: '+12 Saat' },
          { offset: 24, label: '+24 Saat' }
        ];

        const hourlyList: HourlyForecastItem[] = [];

        for (const item of targetOffsets) {
          const idx = baseIndex + item.offset;
          if (idx < times.length) {
            const timeRaw = times[idx];
            const timeStr = timeRaw.includes('T') ? timeRaw.split('T')[1].slice(0, 5) : timeRaw;
            hourlyList.push({
              hourOffset: item.offset,
              label: item.label,
              timeStr: timeStr,
              temp: data.hourly.temperature_2m[idx] ?? data.current.temperature_2m,
              apparentTemp: data.hourly.apparent_temperature?.[idx] ?? data.current.temperature_2m,
              humidity: data.hourly.relative_humidity_2m?.[idx] ?? data.current.relative_humidity_2m,
              precipitationProb: data.hourly.precipitation_probability?.[idx] ?? 0,
              windSpeed: data.hourly.wind_speed_10m?.[idx] ?? 0,
              windDirection: data.hourly.wind_direction_10m?.[idx] ?? (data.current.wind_direction_10m || 0),
              surfacePressure: data.hourly.surface_pressure?.[idx] ?? (data.current.surface_pressure || 1013),
              uvIndex: data.hourly.uv_index?.[idx] ?? (data.daily.uv_index_max?.[0] || 0),
              weatherCode: data.hourly.weather_code?.[idx] ?? 0,
              isDay: data.hourly.is_day?.[idx] ?? 1,
            });
          }
        }

        setDetailedWeather({
          temperature: data.current.temperature_2m,
          apparentTemperature: data.current.apparent_temperature || data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDirection: data.current.wind_direction_10m || 0,
          surfacePressure: data.current.surface_pressure || 1013,
          rainChance: data.daily.precipitation_probability_max[0] || 0,
          weathercode: data.current.weather_code,
          is_day: data.current.is_day,
          tempMin: data.daily.temperature_2m_min?.[0] ?? data.current.temperature_2m,
          tempMax: data.daily.temperature_2m_max?.[0] ?? data.current.temperature_2m,
          sunrise: data.daily.sunrise?.[0] || '',
          sunset: data.daily.sunset?.[0] || '',
          uvIndexMax: data.daily.uv_index_max?.[0] || 0,
          hourlyList
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
    <>
      <motion.button 
        type="button"
        onClick={() => setIsModalOpen(true)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Detaylı 1-2-4-6-8 saatlik hava durumu tahminini aç"
        className="group relative flex items-center w-full sm:w-auto gap-3.5 bg-white/[0.08] hover:bg-white/[0.14] transition-all backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 hover:border-amber-400/40 shadow-lg overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
        <div className="flex flex-col justify-center min-w-0 z-10 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-display tracking-tight text-white leading-none drop-shadow-sm">
              {Math.round(weather.temperature)}°
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${theme.badge} truncate tracking-wide`}>
              {theme.text}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              <Clock className="w-2.5 h-2.5" />
              1, 2, 4, 6, 8s Tahmin
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

        {/* Right Arrow / Detail Hint */}
        <div className="shrink-0 p-1.5 rounded-xl bg-white/5 group-hover:bg-white/15 text-white/60 group-hover:text-amber-300 transition-colors z-10">
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.button>

      {/* Comprehensive Weather Detail Modal with 1, 2, 4, 6, 8 Hour Forecasts */}
      <WeatherDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weather={detailedWeather}
      />
    </>
  );
}
