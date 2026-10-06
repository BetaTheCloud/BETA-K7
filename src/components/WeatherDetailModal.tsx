import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Info,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export interface HourlyForecastItem {
  hourOffset: number;
  label: string;
  timeStr: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
  precipitationProb: number;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  uvIndex: number;
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
  rainChanceMax: number;
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
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(0);

  // Reset selected hour on open
  useEffect(() => {
    if (isOpen) {
      setSelectedHourOffset(0);
    }
  }, [isOpen]);

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

  // Active selected forecast item or fallback to current
  const selectedItem = weather.hourlyList.find(item => item.hourOffset === selectedHourOffset) || weather.hourlyList[0];
  
  const activeTemp = selectedItem ? selectedItem.temp : weather.temperature;
  const activeApparentTemp = selectedItem ? selectedItem.apparentTemp : weather.apparentTemperature;
  const activeHumidity = selectedItem ? selectedItem.humidity : weather.humidity;
  const activeRainChance = selectedItem ? selectedItem.precipitationProb : weather.rainChance;
  const activeWindSpeed = selectedItem ? selectedItem.windSpeed : weather.windSpeed;
  const activeWindDirection = selectedItem ? selectedItem.windDirection : weather.windDirection;
  const activePressure = selectedItem ? selectedItem.surfacePressure : weather.surfacePressure;
  const activeUv = selectedItem ? selectedItem.uvIndex : weather.uvIndexMax;
  const activeWeatherCode = selectedItem ? selectedItem.weatherCode : weather.weathercode;
  const activeIsDay = selectedItem ? selectedItem.isDay : weather.is_day;
  const activeLabel = selectedItem ? selectedItem.label : 'Şu An';
  const activeTimeStr = selectedItem ? selectedItem.timeStr : '';
  const isCurrentTime = selectedHourOffset === 0;

  const currentCondition = getWeatherConditionInfo(activeWeatherCode, activeIsDay);
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

  const uvLevel = getUvLevel(activeUv);

  // Dynamic campus recommendation based on selected hour metrics
  const getCampusTip = () => {
    if (activeRainChance > 40 || activeWeatherCode >= 60) {
      return `${activeLabel} (${activeTimeStr}) saatinde yağış ihtimali yüksek (%${activeRainChance}). Kampüse geçerken şemsiyenizi almanız veya kapalı sosyal alanları tercih etmeniz önerilir.`;
    }
    if (activeTemp >= 26) {
      return `${activeLabel} saatinde sıcak ve güneşli bir hava bekleniyor (${Math.round(activeTemp)}°C). Kampüs amfisi veya ağaç gölgeliklerinde açık hava çalışmaları için elverişli.`;
    }
    if (activeTemp <= 10) {
      return `${activeLabel} saatinde serin bir kampüs havası hakim (${Math.round(activeTemp)}°C). SKS kafeteryası veya kütüphane etüt salonlarında sıcak bir mola verebilirsiniz.`;
    }
    return `${activeLabel} saatinde kampüste yürüyüş ve kütüphane bahçesinde vakit geçirmek için ferah ve elverişli bir hava var.`;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && weather && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+5.35rem)] sm:pt-20 pb-[calc(env(safe-area-inset-bottom,0px)+5.20rem)] sm:pb-10 px-3 sm:px-4 bg-stone-950/80 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="weather-modal-title"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Backdrop click to close */}
          <div 
            className="fixed inset-0 transition-opacity bg-transparent" 
            onClick={onClose} 
            aria-hidden="true" 
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="bg-[#182730] text-white border border-white/20 rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-lg max-h-full flex flex-col shadow-2xl relative z-10 overflow-hidden"
            style={{ contain: 'layout' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Top Compact Header with safe clearance */}
            <div className="sticky top-0 z-30 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-[#264653] to-[#1a343f] border-b border-white/10 shrink-0 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold tracking-wide truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span id="weather-modal-title" className="truncate">Kilis 7 Aralık Kampüsü &bull; Canlı Hava</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isCurrentTime && (
                    <button
                      onClick={() => setSelectedHourOffset(0)}
                      className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold border border-amber-500/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Şu anki zamana dön"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Şu An</span>
                    </button>
                  )}

                  {/* Close (X) button */}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white/90 hover:text-white transition-all cursor-pointer border border-white/10 flex items-center justify-center shrink-0"
                    aria-label="Kapat"
                    title="Kapat (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weather overview banner - Dynamically reflects selected hour */}
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white leading-none">
                      {Math.round(activeTemp)}°C
                    </span>
                    <span className="text-[11px] sm:text-xs text-stone-300">
                      Hissedilen {Math.round(activeApparentTemp)}°C
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-200 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-amber-200 text-[10px] sm:text-xs font-semibold border border-white/10">
                      {currentCondition.text}
                    </span>
                    {!isCurrentTime ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-400/40">
                        {activeLabel} ({activeTimeStr})
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-stone-300 font-normal">
                        {Math.round(weather.tempMin)}° / {Math.round(weather.tempMax)}°
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sunrise / Sunset compact badge */}
                  <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] text-stone-300 bg-white/5 border border-white/10 px-2 py-1 rounded-xl shrink-0">
                    <div className="flex items-center gap-1 text-amber-300 font-medium" title="Gün Doğumu">
                      <Sunrise className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{formatTime(weather.sunrise)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-300 font-medium" title="Gün Batımı">
                      <Sunset className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{formatTime(weather.sunset)}</span>
                    </div>
                  </div>

                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                    <CurrentIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${currentCondition.color}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body - Contained within viewport with visible smooth scrollbar */}
            <div 
              className="p-3 sm:p-3.5 space-y-3 overflow-y-auto overscroll-contain flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent bg-[#182730]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* ================= 1. SAATLİK TAHMİN (1, 2, 3, 4, 6, 8, 12, 24 SAAT) ================= */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Saatlik Tahmin (Detay için saate dokunun)
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-amber-300/80 font-medium lowercase tracking-normal">
                    kaydırın &rarr;
                  </span>
                </div>

                {/* Horizontal Scroll with stable rendering preventing black screen flickering */}
                <div 
                  className="flex items-stretch gap-1.5 sm:gap-2 overflow-x-auto overscroll-x-contain pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent select-none"
                  style={{ 
                    WebkitOverflowScrolling: 'touch', 
                    touchAction: 'pan-x',
                    contain: 'content',
                    willChange: 'scroll-position'
                  }}
                >
                  {weather.hourlyList.map((item, idx) => {
                    const cond = getWeatherConditionInfo(item.weatherCode, item.isDay);
                    const IconComponent = cond.Icon;
                    const isSelected = item.hourOffset === selectedHourOffset;

                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedHourOffset(item.hourOffset)}
                        className={`shrink-0 w-[78px] sm:w-[84px] flex flex-col items-center justify-between p-2 rounded-xl border transition-all text-center cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-[1.02]'
                            : 'bg-[#1e3440] border-white/10 hover:border-amber-400/40 hover:bg-[#254252]'
                        }`}
                        style={{ contain: 'paint' }}
                        aria-pressed={isSelected}
                      >
                        <div>
                          <div className={`text-[10px] font-bold leading-none ${isSelected ? 'text-amber-200' : 'text-amber-300'}`}>
                            {item.label}
                          </div>
                          <div className="text-[9px] text-stone-300 font-mono mt-0.5">
                            {item.timeStr}
                          </div>
                        </div>

                        <div className={`my-1 p-1 rounded-md ${isSelected ? 'bg-amber-400/20' : 'bg-white/5'}`}>
                          <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${cond.color}`} />
                        </div>

                        <div className="text-xs font-extrabold text-white leading-tight">
                          {Math.round(item.temp)}°C
                        </div>

                        {/* Micro Metrics: Yağış İhtimali ve Rüzgar Hızı */}
                        <div className="mt-1 pt-1 border-t border-white/10 w-full flex items-center justify-around text-[8px] sm:text-[9px]">
                          <span className="flex items-center gap-0.5 text-indigo-300 font-semibold" title="Yağış İhtimali">
                            <Umbrella className="w-2.5 h-2.5 text-indigo-400" />
                            %{item.precipitationProb}
                          </span>
                          <span className="flex items-center gap-0.5 text-stone-300 font-medium" title="Rüzgar Hızı">
                            <Wind className="w-2.5 h-2.5 text-teal-300" />
                            {Math.round(item.windSpeed)}k
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================= 2. DETAYLI ATMOSFER METRİKLERİ ================= */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    Atmosferik Değerler ({activeLabel})
                  </h4>
                  {!isCurrentTime && (
                    <span className="text-[10px] text-amber-300/90 font-medium">
                      {activeTimeStr} tahmini
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {/* Hissedilen Sıcaklık */}
                  <div className="bg-[#1e3440] border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-300">
                      <Thermometer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">Hissedilen</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {Math.round(activeApparentTemp)}°C
                    </div>
                    <div className="text-[9px] text-stone-400 truncate">Vücut algısı</div>
                  </div>

                  {/* Yağış İhtimali */}
                  <div className="bg-[#1e3440] border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-300">
                      <Umbrella className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">Yağış İhtimali</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-blue-300 mt-0.5">
                      %{activeRainChance}
                    </div>
                    <div className="text-[9px] text-stone-400 truncate">
                      {isCurrentTime && weather.rainChanceMax !== undefined
                        ? `Günün en yükseği: %${weather.rainChanceMax}`
                        : 'Beklenen olasılık'}
                    </div>
                  </div>

                  {/* Bağıl Nem */}
                  <div className="bg-[#1e3440] border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-300">
                      <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">Bağıl Nem</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      %{activeHumidity}
                    </div>
                    <div className="text-[9px] text-stone-400 truncate">Havadaki nem</div>
                  </div>

                  {/* Rüzgar Hızı ve Yönü */}
                  <div className="bg-[#1e3440] border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-300">
                      <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">Rüzgar Hızı</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {Math.round(activeWindSpeed)} km/s
                    </div>
                    <div className="text-[9px] text-stone-400 flex items-center gap-1 truncate">
                      <Compass className="w-2.5 h-2.5 text-teal-300 shrink-0" />
                      <span>Yön {activeWindDirection}°</span>
                    </div>
                  </div>

                  {/* UV İndeksi */}
                  <div className="bg-[#1e3440] border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-300">
                      <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">UV İndeksi</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm sm:text-base font-bold text-white">
                        {activeUv.toFixed(1)}
                      </span>
                      <span className={`px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-bold ${uvLevel.bg} ${uvLevel.color}`}>
                        {uvLevel.text}
                      </span>
                    </div>
                    <div className="text-[9px] text-stone-400 truncate">Güneş ışınımı</div>
                  </div>

                  {/* Yüzey Hava Basıncı */}
                  <div className="bg-[#1e3440] border border-white/10 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-300">
                      <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Hava Basıncı</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {Math.round(activePressure)} hPa
                    </div>
                    <div className="text-[9px] text-stone-400 truncate">Barometrik basınç</div>
                  </div>
                </div>
              </div>

              {/* ================= 3. KAMPÜS TAVSİYESİ ================= */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h5 className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                    Kampüs Rehberi Tavsiyesi ({activeLabel})
                  </h5>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-0.5 leading-relaxed">
                    {getCampusTip()}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Compact Sticky Footer with Single "Geri Dön" Button */}
            <div className="sticky bottom-0 z-30 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#132028] border-t border-white/10 flex items-center justify-between gap-2 shrink-0 shadow-lg">
              <span className="text-[10px] text-stone-400 truncate">
                36.71° K, 37.11° D &bull; Canlı Meteoroloji
              </span>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-950" />
                <span>Geri Dön</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
