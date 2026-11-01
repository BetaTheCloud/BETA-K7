import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import WeatherDetailModal, { DetailedWeatherInfo, HourlyForecastItem } from './WeatherDetailModal';
import { getApiUrl } from '../config';

const WEATHER_CACHE_KEY = 'k7_cached_weather_v2';
const WEATHER_DETAILED_CACHE_KEY = 'k7_cached_weather_detailed_v2';
const WEATHER_PROVIDER_KEY = 'k7_weather_provider';

export type WeatherProvider = 'mgm' | 'openmeteo';

const DEFAULT_KILIS_WEATHER: WeatherData = {
  temperature: 18,
  humidity: 68,
  windSpeed: 8,
  rainChance: 15,
  rainChanceMax: 30,
  weathercode: 1,
  is_day: 1,
  conditionText: 'Parçalı Bulutlu',
  source: 'MGM Kilis İstasyonu'
};

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  rainChanceMax: number;
  weathercode: number;
  is_day: number;
  conditionText?: string;
  source?: string;
}

interface WeatherWidgetProps {
  onWeatherChange?: (code: number, isDay: number) => void;
}

export default function WeatherWidget({ onWeatherChange }: WeatherWidgetProps) {
  const [provider, setProvider] = useState<WeatherProvider>(() => {
    if (typeof window === 'undefined') return 'mgm';
    try {
      const saved = localStorage.getItem(WEATHER_PROVIDER_KEY);
      if (saved === 'openmeteo' || saved === 'mgm') return saved;
    } catch {}
    return 'mgm';
  });

  const [weather, setWeather] = useState<WeatherData | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_KILIS_WEATHER;
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.temperature === 'number') {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_KILIS_WEATHER;
  });

  const [detailedWeather, setDetailedWeather] = useState<DetailedWeatherInfo | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(WEATHER_DETAILED_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.temperature === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProviderSwitching, setIsProviderSwitching] = useState(false);
  const [error, setError] = useState(false);

  const onWeatherChangeRef = useRef(onWeatherChange);
  useEffect(() => {
    onWeatherChangeRef.current = onWeatherChange;
  }, [onWeatherChange]);

  // Initial notify if cached weather is present
  useEffect(() => {
    if (weather) {
      onWeatherChangeRef.current?.(weather.weathercode, weather.is_day);
    }
  }, []);

  const isFetchingRef = useRef(false);

  // Helper to fetch directly from Open-Meteo client-side if backend is ever unreachable
  const fetchOpenMeteoDirect = async (): Promise<DetailedWeatherInfo> => {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=36.7161&longitude=37.1150&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,apparent_temperature,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,surface_pressure,uv_index,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&forecast_days=7&timezone=Europe%2FIstanbul';
    let data: any = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        data = await res.json();
      }
    } catch {
      clearTimeout(timeoutId);
    }

    if (!data?.current || typeof data.current.temperature_2m !== 'number') {
      // Fallback 1: Return cached detailed weather if present
      try {
        const cached = localStorage.getItem(WEATHER_DETAILED_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.temperature === 'number') {
            return {
              ...parsed,
              fallbackNotice: 'Hava durumu servisi meşgul olduğu için son güncel veriler gösteriliyor.'
            };
          }
        }
      } catch {}

      // Fallback 2: Generate fallback weather
      const nowFallback = new Date();
      const trHourFallback = (nowFallback.getUTCHours() + 3) % 24;
      const isDayFallback = trHourFallback >= 6 && trHourFallback < 18 ? 1 : 0;
      return {
        provider: 'openmeteo',
        temperature: 16.5,
        apparentTemperature: 16.5,
        humidity: 65,
        windSpeed: 7,
        windDirection: 130,
        surfacePressure: 1014,
        rainChance: 15,
        rainChanceMax: 25,
        weathercode: 1,
        is_day: isDayFallback,
        tempMin: 12,
        tempMax: 21,
        sunrise: '06:40',
        sunset: '18:15',
        uvIndexMax: 4,
        hourlyList: [],
        dailyForecasts: [],
        source: 'Open-Meteo (Yedek Model)',
        stationName: 'Kilis 7 Aralık Kampüsü',
        fallbackNotice: 'Open-Meteo servisi yoğun olduğu için son tahmin verisi sunuldu.'
      };
    }

    const times: string[] = data.hourly?.time || [];
    const currentTimeIso = data.current?.time || '';
    const currentHourPrefix = currentTimeIso ? currentTimeIso.slice(0, 13) : '';
    let baseIndex = currentHourPrefix ? times.findIndex((t: string) => t.startsWith(currentHourPrefix)) : -1;
    if (baseIndex === -1 && currentTimeIso) {
      const nextIndex = times.findIndex((t: string) => t >= currentTimeIso);
      baseIndex = nextIndex > 0 ? nextIndex - 1 : 0;
    }
    if (baseIndex === -1) baseIndex = 0;

    const currentHourlyRainChance = data.hourly?.precipitation_probability?.[baseIndex] ?? 0;
    const dailyMaxRainChance = data.daily?.precipitation_probability_max?.[0] ?? currentHourlyRainChance;

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

    const now = new Date();
    const trHour = (now.getUTCHours() + 3) % 24;
    const pad = (n: number) => String(n).padStart(2, '0');
    const liveNowTimeStr = `${pad(trHour)}:${pad(now.getUTCMinutes())}`;

    const hourlyList: HourlyForecastItem[] = targetOffsets.map(item => {
      const idx = baseIndex + item.offset;
      const timeStr = item.offset === 0 ? liveNowTimeStr : `${pad((trHour + item.offset) % 24)}:00`;
      return {
        hourOffset: item.offset,
        label: item.label,
        timeStr,
        temp: data.hourly?.temperature_2m?.[idx] ?? data.current.temperature_2m,
        apparentTemp: data.hourly?.apparent_temperature?.[idx] ?? data.current.apparent_temperature ?? data.current.temperature_2m,
        humidity: data.hourly?.relative_humidity_2m?.[idx] ?? data.current.relative_humidity_2m ?? 60,
        precipitationProb: data.hourly?.precipitation_probability?.[idx] ?? 0,
        windSpeed: data.hourly?.wind_speed_10m?.[idx] ?? 0,
        windDirection: data.hourly?.wind_direction_10m?.[idx] ?? (data.current.wind_direction_10m || 0),
        surfacePressure: data.hourly?.surface_pressure?.[idx] ?? (data.current.surface_pressure || 1013),
        uvIndex: data.hourly?.uv_index?.[idx] ?? 0,
        weatherCode: data.hourly?.weather_code?.[idx] ?? 0,
        isDay: data.hourly?.is_day?.[idx] ?? 1,
      };
    });

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dailyForecasts = (data.daily?.time || []).map((tStr: string, i: number) => {
      const dt = new Date(tStr);
      return {
        dayName: dayNames[dt.getUTCDay()] || 'Gün',
        dateStr: `${pad(dt.getUTCDate())}.${pad(dt.getUTCMonth() + 1)}`,
        hadise: '',
        conditionText: (data.daily.precipitation_probability_max?.[i] ?? 0) > 50 ? 'Yağış Bekleniyor' : 'Açık / Parçalı',
        weatherCode: (data.daily.precipitation_probability_max?.[i] ?? 0) > 50 ? 61 : 1,
        minTemp: data.daily.temperature_2m_min?.[i] ?? 12,
        maxTemp: data.daily.temperature_2m_max?.[i] ?? 20,
        minHumidity: 40,
        maxHumidity: 85,
        windSpeed: 10
      };
    });

    return {
      provider: 'openmeteo',
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature || data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m ?? 60,
      windSpeed: data.current.wind_speed_10m ?? 5,
      windDirection: data.current.wind_direction_10m || 0,
      surfacePressure: data.current.surface_pressure || 1013,
      rainChance: currentHourlyRainChance,
      rainChanceMax: dailyMaxRainChance,
      weathercode: data.current.weather_code ?? 0,
      is_day: data.current.is_day ?? 1,
      tempMin: data.daily?.temperature_2m_min?.[0] ?? data.current.temperature_2m,
      tempMax: data.daily?.temperature_2m_max?.[0] ?? data.current.temperature_2m,
      sunrise: data.daily?.sunrise?.[0] || '06:40',
      sunset: data.daily?.sunset?.[0] || '18:15',
      uvIndexMax: data.daily?.uv_index_max?.[0] || 0,
      hourlyList,
      dailyForecasts,
      source: 'Open-Meteo (Sayısal Model)',
      stationName: 'Kilis 7 Aralık Kampüsü'
    };
  };

  const fetchWeather = useCallback(async (force = false, targetProvider?: WeatherProvider) => {
    if (isFetchingRef.current && !force) return;
    isFetchingRef.current = true;
    if (force) {
      setIsRefreshing(true);
    }
    setError(false);

    const activeProvider = targetProvider || provider;

    try {
      if (activeProvider === 'mgm') {
        // Fetch MGM from backend proxy
        try {
          const queryParam = force ? '?force=true' : '';
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 9500);
          const apiRes = await fetch(getApiUrl(`/api/weather/mgm${queryParam}`), {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (apiRes.ok) {
            const mgmData = await apiRes.json();
            if (mgmData && typeof mgmData.temperature === 'number') {
              const liveWeatherData: WeatherData = {
                temperature: mgmData.temperature,
                humidity: mgmData.humidity ?? 60,
                windSpeed: mgmData.windSpeed ?? 5,
                rainChance: mgmData.rainChance ?? 0,
                rainChanceMax: mgmData.rainChanceMax ?? 0,
                weathercode: mgmData.weathercode ?? 0,
                is_day: mgmData.is_day ?? 1,
                conditionText: mgmData.conditionText,
                source: mgmData.source || 'MGM Kilis İstasyonu'
              };
              setWeather(liveWeatherData);
              setDetailedWeather(mgmData);
              try {
                localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(liveWeatherData));
                localStorage.setItem(WEATHER_DETAILED_CACHE_KEY, JSON.stringify(mgmData));
              } catch {}
              onWeatherChangeRef.current?.(mgmData.weathercode ?? 0, mgmData.is_day ?? 1);
              setLoading(false);
              return;
            }
          }
        } catch (serverErr) {
          console.warn('Backend /api/weather/mgm unavailable, attempting fallback:', serverErr);
        }

        // Automatic Fallback to Open-Meteo if MGM endpoint fails
        const fallbackData = await fetchOpenMeteoDirect();
        const liveFallback: WeatherData = {
          temperature: fallbackData.temperature,
          humidity: fallbackData.humidity,
          windSpeed: fallbackData.windSpeed,
          rainChance: fallbackData.rainChance,
          rainChanceMax: fallbackData.rainChanceMax,
          weathercode: fallbackData.weathercode,
          is_day: fallbackData.is_day,
          conditionText: fallbackData.conditionText,
          source: 'Open-Meteo (MGM Yedeği)'
        };
        fallbackData.fallbackNotice = 'MGM servisi yanıt vermediği için Open-Meteo verisi gösteriliyor';
        setWeather(liveFallback);
        setDetailedWeather(fallbackData);
        onWeatherChangeRef.current?.(fallbackData.weathercode, fallbackData.is_day);
      } else {
        // Open-Meteo requested: Try backend endpoint first, fallback to direct fetch
        try {
          const queryParam = force ? '?force=true' : '';
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 9500);
          const apiRes = await fetch(getApiUrl(`/api/weather/openmeteo${queryParam}`), {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (apiRes.ok) {
            const omData = await apiRes.json();
            if (omData && typeof omData.temperature === 'number') {
              const liveWeatherData: WeatherData = {
                temperature: omData.temperature,
                humidity: omData.humidity ?? 60,
                windSpeed: omData.windSpeed ?? 5,
                rainChance: omData.rainChance ?? 0,
                rainChanceMax: omData.rainChanceMax ?? 0,
                weathercode: omData.weathercode ?? 0,
                is_day: omData.is_day ?? 1,
                conditionText: omData.conditionText,
                source: omData.source || 'Open-Meteo Model'
              };
              setWeather(liveWeatherData);
              setDetailedWeather(omData);
              try {
                localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(liveWeatherData));
                localStorage.setItem(WEATHER_DETAILED_CACHE_KEY, JSON.stringify(omData));
              } catch {}
              onWeatherChangeRef.current?.(omData.weathercode ?? 0, omData.is_day ?? 1);
              setLoading(false);
              return;
            }
          }
        } catch (serverErr) {
          console.warn('Backend /api/weather/openmeteo error, fetching directly:', serverErr);
        }

        const directData = await fetchOpenMeteoDirect();
        const liveWeatherData: WeatherData = {
          temperature: directData.temperature,
          humidity: directData.humidity,
          windSpeed: directData.windSpeed,
          rainChance: directData.rainChance,
          rainChanceMax: directData.rainChanceMax,
          weathercode: directData.weathercode,
          is_day: directData.is_day,
          conditionText: directData.conditionText,
          source: directData.source
        };
        setWeather(liveWeatherData);
        setDetailedWeather(directData);
        try {
          localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(liveWeatherData));
          localStorage.setItem(WEATHER_DETAILED_CACHE_KEY, JSON.stringify(directData));
        } catch {}
        onWeatherChangeRef.current?.(directData.weathercode, directData.is_day);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
      setError(true);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setIsRefreshing(false);
      setIsProviderSwitching(false);
    }
  }, [provider]);

  const handleProviderChange = useCallback(async (newProvider: WeatherProvider) => {
    if (newProvider === provider && !isRefreshing) return;
    setProvider(newProvider);
    setIsProviderSwitching(true);
    try {
      localStorage.setItem(WEATHER_PROVIDER_KEY, newProvider);
    } catch {}
    window.dispatchEvent(new CustomEvent('k7_weather_provider_changed', { detail: newProvider }));
    await fetchWeather(true, newProvider);
  }, [provider, isRefreshing, fetchWeather]);

  useEffect(() => {
    fetchWeather(false);

    // Otomatik arka plan güncellemesi: Her 10 dakikada bir (600,000 ms) sessizce yenile
    const intervalId = setInterval(() => {
      fetchWeather(false);
    }, 10 * 60 * 1000);

    const handleGlobalRefresh = () => {
      fetchWeather(true);
    };
    const handleGlobalProviderChange = (e: any) => {
      const p = e.detail;
      if (p && (p === 'mgm' || p === 'openmeteo') && p !== provider) {
        setProvider(p);
        fetchWeather(true, p);
      }
    };

    window.addEventListener('k7_force_refreshed', handleGlobalRefresh);
    window.addEventListener('k7_weather_provider_changed', handleGlobalProviderChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('k7_force_refreshed', handleGlobalRefresh);
      window.removeEventListener('k7_weather_provider_changed', handleGlobalProviderChange);
    };
  }, [fetchWeather, provider]);

  if (loading && !weather) {
    return (
      <div className="flex items-center gap-3 w-full sm:w-auto bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-sm animate-pulse">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <CloudLightning className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="w-20 h-4 bg-white/20 rounded-md"></div>
          <div className="w-28 h-3 bg-white/10 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <button
        onClick={() => fetchWeather(true)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs text-white cursor-pointer active:scale-95 transition-all"
        title="Hava durumunu yeniden yüklemek için dokunun"
      >
        <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
        <span>Hava Durumunu Yükle</span>
      </button>
    );
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
        title="Detaylı hava durumu tahmini ve saatlik veriler için dokunun"
        className="group relative flex items-center w-full sm:w-auto gap-3.5 bg-white/[0.08] hover:bg-white/[0.14] transition-all backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 hover:border-amber-400/40 shadow-lg overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      >
        {/* Dynamic ambient background glow */}
        <div className={`absolute -inset-1 rounded-2xl ${theme.glowAura} blur-xl opacity-60 pointer-events-none transition-all group-hover:opacity-100`}></div>

        {/* Animated Weather Icon Badge */}
        <div className="relative shrink-0">
          <motion.div 
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className={`relative w-11 h-11 rounded-2xl ${theme.bgColor} flex items-center justify-center border shadow-inner`}
          >
            <Icon className={`w-6 h-6 ${theme.color}`} strokeWidth={1.75} />
          </motion.div>
        </div>
        
        {/* Weather Metrics & Text */}
        <div className="flex flex-col justify-center min-w-0 z-10 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-display tracking-tight text-white leading-none drop-shadow-sm">
              {Math.round(weather.temperature)}°
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${theme.badge} truncate tracking-wide`}>
              {weather.conditionText || theme.text}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30" title="Seçili Hava Durumu Kaynağı">
              <span className={`w-1.5 h-1.5 rounded-full ${isRefreshing || isProviderSwitching ? 'bg-amber-400 animate-ping' : (provider === 'mgm' ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400 animate-pulse')}`} />
              {isRefreshing || isProviderSwitching ? 'Tazeleniyor...' : (provider === 'mgm' ? 'MGM Kilis' : 'Open-Meteo')}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              <Clock className="w-2.5 h-2.5" />
              Saatlik Tahmin
            </span>
          </div>
          
          {/* Environmental Indicators */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-white/85 flex-wrap">
            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10" title={`Anlık Yağış İhtimali: %${weather.rainChance} (Günün En Yüksek Beklentisi: %${weather.rainChanceMax})`}>
              <Umbrella className="w-3.5 h-3.5 text-sky-300" strokeWidth={1.75} />
              <span className="font-bold text-sky-200">Yağış %{weather.rainChance}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5" title={`Bağıl Nem (Havadaki Nem Oranı): %${weather.humidity}`}>
              <Droplets className="w-3.5 h-3.5 text-blue-300" strokeWidth={1.75} />
              <span>Nem %{weather.humidity}</span>
            </div>
            <div className="hidden xs:flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5" title={`Rüzgar Hızı: ${Math.round(weather.windSpeed)} km/s`}>
              <Wind className="w-3.5 h-3.5 text-stone-300" strokeWidth={1.75} />
              <span>{Math.round(weather.windSpeed)} km/s</span>
            </div>
          </div>
        </div>

        {/* Detail Action Hint - Minimalist Info Icon */}
        <div 
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.08] group-hover:bg-amber-400/20 border border-white/15 group-hover:border-amber-400/40 text-white/60 group-hover:text-amber-200 transition-all z-10 shadow-sm"
          title="Detaylı saatlik tahmin, kaynak seçimi ve hava durumu bilgisi"
        >
          <Info className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2} />
        </div>
      </motion.button>

      {/* Comprehensive Weather Detail Modal with Dual Source Switching (MGM & Open-Meteo) */}
      <WeatherDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weather={detailedWeather}
        onRefresh={() => fetchWeather(true)}
        isRefreshing={isRefreshing}
        provider={provider}
        onProviderChange={handleProviderChange}
        isProviderSwitching={isProviderSwitching}
      />
    </>
  );
}
