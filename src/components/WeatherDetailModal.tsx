import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Droplets,
  Wind,
  Compass,
  Gauge,
  Sunrise,
  Sunset,
  Umbrella,
  X,
  Clock,
  MapPin,
  Thermometer,
  Info
} from 'lucide-react';

export interface HourlyForecastItem {
  hourOffset: number;
  label: string;
  timeStr: string;
  temp: number;
  apparentTemp: number;
  precipitationProb: number;
  windSpeed: number;
  weatherCode: number;
  isDay: number;
}

export interface DetailedWeatherInfo {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  rainChance: number;
  weathercode: number;
  is_day: number;
  tempMin: number;
  tempMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  hourlyList: HourlyForecastItem[];
}

interface WeatherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: DetailedWeatherInfo | null;
}

export function getWeatherConditionInfo(code: number, isDay: number) {
  switch (true) {
    case code === 0:
      return isDay
        ? { text: 'Açık & Güneşli', Icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/20' }
        : { text: 'Açık Gece', Icon: Moon, color: 'text-indigo-300', bg: 'bg-indigo-500/20' };
    case code === 1 || code === 2:
      return isDay
        ? { text: 'Parçalı Bulutlu', Icon: CloudSun, color: 'text-sky-300', bg: 'bg-sky-500/20' }
        : { text: 'Az Bulutlu Gece', Icon: Cloud, color: 'text-indigo-200', bg: 'bg-indigo-500/20' };
    case code === 3:
      return { text: 'Çok Bulutlu / Kapalı', Icon: Cloud, color: 'text-stone-300', bg: 'bg-stone-500/20' };
    case code === 45 || code === 48:
      return { text: 'Sisli & Puslu', Icon: CloudFog, color: 'text-teal-300', bg: 'bg-teal-500/20' };
    case code >= 51 && code <= 55:
      return { text: 'Hafif Çisenti', Icon: CloudDrizzle, color: 'text-cyan-300', bg: 'bg-cyan-500/20' };
    case (code >= 61 && code <= 67) || (code >= 80 && code <= 82):
      return { text: 'Yağmurlu', Icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    case (code >= 71 && code <= 77) || (code >= 85 && code <= 86):
      return { text: 'Karlı', Icon: CloudSnow, color: 'text-sky-200', bg: 'bg-sky-500/20' };
    case code >= 95:
      return { text: 'Gök Gürültülü Sağanak', Icon: CloudLightning, color: 'text-rose-400', bg: 'bg-rose-500/20' };
    default:
      return { text: 'Hafif Bulutlu', Icon: CloudSun, color: 'text-amber-300', bg: 'bg-amber-500/20' };
  }
}

export default function WeatherDetailModal({ isOpen, onClose, weather }: WeatherDetailModalProps) {
  // Prevent background scroll and support Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !weather) return null;

  const currentCondition = getWeatherConditionInfo(weather.weathercode, weather.is_day);
  const CurrentIcon = currentCondition.Icon;

  // Format sunrise / sunset
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const parts = isoString.split('T')[1];
      return parts ? parts.slice(0, 5) : isoString;
    } catch {
      return isoString;
    }
  };

  // UV index evaluation
  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { text: 'Düşük', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (uv <= 5) return { text: 'Orta', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (uv <= 7) return { text: 'Yüksek', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { text: 'Çok Yüksek', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const uvLevel = getUvLevel(weather.uvIndexMax);

  // Dynamic campus recommendation
  const getCampusTip = () => {
    if (weather.rainChance > 40 || weather.weathercode >= 60) {
      return 'Kampüse geçerken şemsiyenizi almayı unutmayın. Kütüphane ve kapalı sosyal alanlar konforlu olacaktır.';
    }
    if (weather.temperature >= 26) {
      return 'Hava sıcak ve güneşli. Kampüs amfisinde veya ağaç gölgeliklerinde açık hava çalışması için elverişli.';
    }
    if (weather.temperature <= 10) {
      return 'Serin bir kampüs havası hakim. SKS kafeteryası veya etüt salonlarında sıcak bir içecek tercih edebilirsiniz.';
    }
    return 'Kampüste yürüyüş ve kütüphane bahçesinde vakit geçirmek için ferah ve elverişli bir hava var.';
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm overscroll-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weather-modal-title"
      >
        {/* Backdrop click to close */}
        <div 
          className="fixed inset-0 transition-opacity" 
          onClick={onClose} 
          aria-hidden="true" 
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-[#182730] text-white border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative z-10 my-auto"
        >
          {/* Top Compact Header (Sticky so Close button is always reachable) */}
          <div className="relative px-3.5 py-3 sm:px-4 sm:py-3.5 bg-gradient-to-r from-[#264653] to-[#1a343f] border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold tracking-wide truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span id="weather-modal-title" className="truncate">Kilis 7 Aralık Üniversitesi Kampüsü</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0 flex items-center justify-center"
                aria-label="Kapat"
                title="Kapat (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Weather overview banner */}
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                    {Math.round(weather.temperature)}°C
                  </span>
                  <span className="text-xs text-stone-300">
                    Hissedilen {Math.round(weather.apparentTemperature)}°C
                  </span>
                </div>
                <div className="text-xs font-semibold text-amber-200 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-amber-200 text-[11px] font-medium">
                    {currentCondition.text}
                  </span>
                  <span className="text-[11px] text-stone-300 font-normal">
                    {Math.round(weather.tempMin)}° / {Math.round(weather.tempMax)}°
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sunrise / Sunset compact badge */}
                <div className="hidden xs:flex sm:flex flex-col gap-1 text-[10px] text-stone-300 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                  <div className="flex items-center gap-1 text-amber-300" title="Gün Doğumu">
                    <Sunrise className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{formatTime(weather.sunrise)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-300" title="Gün Batımı">
                    <Sunset className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>{formatTime(weather.sunset)}</span>
                  </div>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md">
                  <CurrentIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${currentCondition.color}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body - Contained within viewport with visible smooth scrollbar */}
          <div className="p-3 sm:p-4 space-y-3 overflow-y-auto overscroll-contain flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {/* ================= 1. SAATLİK TAHMİN (YATAY KAYDIRMALI) ================= */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Saatlik Tahmin (1, 2, 4, 6, 8, 12, 24 Saat)
                </span>
                <span className="text-[10px] text-amber-300/80 font-medium lowercase tracking-normal">
                  kaydırın &rarr;
                </span>
              </div>

              {/* Horizontal Scroll with tight compact cards */}
              <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {weather.hourlyList.map((item, idx) => {
                  const cond = getWeatherConditionInfo(item.weatherCode, item.isDay);
                  const IconComponent = cond.Icon;
                  const isCurrent = item.hourOffset === 0;

                  return (
                    <div
                      key={idx}
                      className={`shrink-0 w-[78px] sm:w-[82px] flex flex-col items-center justify-between p-2 rounded-xl border transition-all text-center ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400/50 shadow-sm ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] font-bold text-amber-300 leading-none">
                          {item.label}
                        </div>
                        <div className="text-[9px] text-stone-300 font-mono mt-0.5">
                          {item.timeStr}
                        </div>
                      </div>

                      <div className="my-1 p-1 rounded-md bg-white/5">
                        <IconComponent className={`w-4 h-4 ${cond.color}`} />
                      </div>

                      <div className="text-xs font-extrabold text-white leading-tight">
                        {Math.round(item.temp)}°C
                      </div>

                      {/* Micro Metrics: Rain & Wind */}
                      <div className="mt-1 pt-1 border-t border-white/10 w-full flex items-center justify-around text-[9px]">
                        <span className="flex items-center gap-0.5 text-blue-300" title="Yağış İhtimali">
                          <Droplets className="w-2.5 h-2.5" />
                          {item.precipitationProb}%
                        </span>
                        <span className="flex items-center gap-0.5 text-stone-300" title="Rüzgar Hızı">
                          <Wind className="w-2.5 h-2.5" />
                          {Math.round(item.windSpeed)}k
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= 2. DETAYLI ATMOSFER METRİKLERİ ================= */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                Atmosferik Değerler
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {/* Hissedilen Sıcaklık */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">Hissedilen</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1">
                    {Math.round(weather.apparentTemperature)}°C
                  </div>
                  <div className="text-[9px] text-stone-400 truncate">Vücut algısı</div>
                </div>

                {/* Bağıl Nem */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Bağıl Nem</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1">
                    %{weather.humidity}
                  </div>
                  <div className="text-[9px] text-stone-400 truncate">Havadaki nem oranı</div>
                </div>

                {/* Rüzgar Hızı ve Yönü */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">Rüzgar Hızı</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1">
                    {Math.round(weather.windSpeed)} km/s
                  </div>
                  <div className="text-[9px] text-stone-400 flex items-center gap-0.5 truncate">
                    <Compass className="w-2.5 h-2.5 text-teal-300 shrink-0" />
                    <span>Yön {weather.windDirection}°</span>
                  </div>
                </div>

                {/* Yağış İhtimali */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Umbrella className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">Yağış İhtimali</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1">
                    %{weather.rainChance}
                  </div>
                  <div className="text-[9px] text-stone-400 truncate">En yüksek olasılık</div>
                </div>

                {/* UV İndeksi */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">UV İndeksi</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm sm:text-base font-bold text-white">
                      {weather.uvIndexMax.toFixed(1)}
                    </span>
                    <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${uvLevel.bg} ${uvLevel.color}`}>
                      {uvLevel.text}
                    </span>
                  </div>
                  <div className="text-[9px] text-stone-400 truncate">Güneş ışınımı</div>
                </div>

                {/* Yüzey Hava Basıncı */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Hava Basıncı</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1">
                    {Math.round(weather.surfacePressure)} hPa
                  </div>
                  <div className="text-[9px] text-stone-400 truncate">Barometrik basınç</div>
                </div>
              </div>
            </div>

            {/* Mobile Sunrise & Sunset when screen is small (<400px) */}
            <div className="grid grid-cols-2 gap-1.5 xs:hidden sm:hidden">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[9px] text-stone-400">Gün Doğumu</div>
                  <div className="text-xs font-bold text-amber-200">{formatTime(weather.sunrise)}</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                <Sunset className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[9px] text-stone-400">Gün Batımı</div>
                  <div className="text-xs font-bold text-indigo-200">{formatTime(weather.sunset)}</div>
                </div>
              </div>
            </div>

            {/* ================= 3. KAMPÜS TAVSİYESİ ================= */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h5 className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                  Kampüs Rehberi Tavsiyesi
                </h5>
                <p className="text-xs text-stone-300 mt-0.5 leading-snug">
                  {getCampusTip()}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Compact Footer (Always accessible, never cut off) */}
          <div className="px-3.5 py-2.5 bg-black/30 border-t border-white/10 flex items-center justify-between shrink-0 text-xs">
            <span className="text-[10px] text-stone-400 truncate">
              36.71° K, 37.11° D &bull; Canlı Meteoroloji
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
