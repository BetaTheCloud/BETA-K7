import { useState, useEffect } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun, Loader2, Droplets, Wind, Umbrella } from 'lucide-react';

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
      <div className="flex items-center justify-center w-full sm:w-56 h-[52px] bg-white/5 backdrop-blur-md rounded-xl border border-white/10 animate-pulse">
        <Loader2 className="w-4 h-4 text-white/50 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const getWeatherInfo = (code: number, isDay: number) => {
    switch (true) {
      case code === 0:
        return { text: 'Açık', Icon: isDay ? Sun : Moon, color: isDay ? 'text-amber-400' : 'text-indigo-300' };
      case code === 1 || code === 2:
        return { text: 'Parçalı Bulutlu', Icon: CloudSun, color: 'text-sky-400' };
      case code === 3:
        return { text: 'Çok Bulutlu', Icon: Cloud, color: 'text-stone-300' };
      case code === 45 || code === 48:
        return { text: 'Sisli', Icon: CloudFog, color: 'text-stone-300' };
      case code >= 51 && code <= 55:
        return { text: 'Çisenti', Icon: CloudDrizzle, color: 'text-blue-300' };
      case (code >= 61 && code <= 65) || (code >= 80 && code <= 82):
        return { text: 'Yağmurlu', Icon: CloudRain, color: 'text-blue-400' };
      case (code >= 71 && code <= 77) || (code >= 85 && code <= 86):
        return { text: 'Kar', Icon: CloudSnow, color: 'text-sky-200' };
      case code >= 95:
        return { text: 'Fırtına', Icon: CloudLightning, color: 'text-purple-400' };
      default:
        return { text: 'Bilinmiyor', Icon: isDay ? Sun : Moon, color: 'text-amber-400' };
    }
  };

  const info = getWeatherInfo(weather.weathercode, weather.is_day);
  const Icon = info.Icon;

  return (
    <div className="flex items-center w-full sm:w-auto gap-3 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 shadow-sm">
      <div className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-black/20 shadow-inner ${info.color}`}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-display tracking-tight text-white leading-none">
            {Math.round(weather.temperature)}°
          </span>
          <span className="text-xs sm:text-sm font-medium text-white/90 truncate">
            {info.text}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs font-medium text-white/70">
          <div className="flex items-center gap-1" title="Yağış">
            <Umbrella className="w-3 h-3 text-sky-400" strokeWidth={1.5} />
            <span>%{weather.rainChance}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-1" title="Nem">
            <Droplets className="w-3 h-3 text-blue-300" strokeWidth={1.5} />
            <span>%{weather.humidity}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-1" title="Rüzgar">
            <Wind className="w-3 h-3 text-stone-300" strokeWidth={1.5} />
            <span>{Math.round(weather.windSpeed)} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
