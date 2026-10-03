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
  Sparkles,
  MapPin,
  Thermometer
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
      return 'Kampüse geçerken şemsiyenizi yanınıza almayı unutmayın. Ders aralarında Merkez Kütüphane ve kapalı sosyal alanlar daha konforlu olacaktır.';
    }
    if (weather.temperature >= 26) {
      return 'Hava oldukça sıcak ve güneşli. Kampüs amfisinde veya gölgelik çınar ağaçlarının altında açık hava çalışması için harika bir gün.';
    }
    if (weather.temperature <= 10) {
      return 'Serin bir kampüs havası hakim. SKS kafeteryası veya Kütüphane 7/24 etüt salonlarında sıcak bir çay eşliğinde ders çalışabilirsiniz.';
    }
    return 'Kampüste yürüyüş yapmak, açık amfide vakit geçirmek veya kütüphane bahçesinde çalışmak için gayet elverişli ve ferah bir hava var.';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#1b2a32] text-white border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto relative"
        >
          {/* Top Decorative Header */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#264653] to-[#1a343f] border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Kilis 7 Aralık Üniversitesi Kampüsü</span>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
                    {Math.round(weather.temperature)}°C
                  </span>
                  <span className="text-sm text-stone-300">
                    Hissedilen {Math.round(weather.apparentTemperature)}°C
                  </span>
                </div>
                <div className="text-base sm:text-lg font-semibold text-amber-200 mt-1 flex items-center gap-2">
                  <span>{currentCondition.text}</span>
                  <span className="text-xs text-stone-400 font-normal">
                    (Günün En Düşük: {Math.round(weather.tempMin)}° / En Yüksek: {Math.round(weather.tempMax)}°)
                  </span>
                </div>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                <CurrentIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${currentCondition.color}`} />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* ================= 1-2-4-6-8 SAATLİK TAHMİN BÖLÜMÜ ================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Saatlik Hava Tahmini (1, 2, 4, 6, 8 Saatlik Değişim)
                </h4>
                <span className="text-[11px] text-amber-300/80 font-medium">
                  Open-Meteo Canlı Model
                </span>
              </div>

              {/* Horizontal Scroll of Target Hours */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {weather.hourlyList.map((item, idx) => {
                  const cond = getWeatherConditionInfo(item.weatherCode, item.isDay);
                  const IconComponent = cond.Icon;
                  const isCurrent = item.hourOffset === 0;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-amber-300">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-stone-300 font-mono mt-0.5">
                        {item.timeStr}
                      </div>

                      <div className="my-2 p-1.5 rounded-xl bg-white/5">
                        <IconComponent className={`w-6 h-6 ${cond.color}`} />
                      </div>

                      <div className="text-base font-extrabold text-white">
                        {Math.round(item.temp)}°C
                      </div>

                      <div className="text-[10px] text-stone-300 mt-0.5 line-clamp-1">
                        {cond.text}
                      </div>

                      {/* Micro Metrics: Rain & Wind */}
                      <div className="mt-2 pt-2 border-t border-white/10 w-full flex items-center justify-around text-[10px] text-stone-400">
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

            {/* ================= DETAYLI ATMOSFER METRİKLERİ ================= */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                Detaylı Kampüs Atmosfer Değerleri
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Hissedilen Sıcaklık */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Thermometer className="w-4 h-4 text-rose-400" />
                    <span>Hissedilen</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {Math.round(weather.apparentTemperature)}°C
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Rüzgar ve nem etkili vücut algısı
                  </div>
                </div>

                {/* Bağıl Nem */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span>Bağıl Nem</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    %{weather.humidity}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Kampüs yerleşkesi hava nemi
                  </div>
                </div>

                {/* Rüzgar Hızı ve Yönü */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Wind className="w-4 h-4 text-teal-400" />
                    <span>Rüzgar</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {weather.windSpeed} km/s
                  </div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-teal-300" />
                    <span>Yön Açısı: {weather.windDirection}°</span>
                  </div>
                </div>

                {/* Yağış İhtimali */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Umbrella className="w-4 h-4 text-indigo-400" />
                    <span>Yağış İhtimali</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    %{weather.rainChance}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Günün en yüksek yağış olasılığı
                  </div>
                </div>

                {/* UV İndeksi */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>UV İndeksi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">
                      {weather.uvIndexMax.toFixed(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${uvLevel.bg} ${uvLevel.color}`}>
                      {uvLevel.text}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Güneş ışınımı yoğunluk seviyesi
                  </div>
                </div>

                {/* Yüzey Hava Basıncı */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span>Hava Basıncı</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {Math.round(weather.surfacePressure)} hPa
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Atmosferik barometrik basınç
                  </div>
                </div>
              </div>
            </div>

            {/* Gün Doğumu & Batımı */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Sunrise className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-400">Gün Doğumu</div>
                  <div className="text-base font-bold text-amber-200">
                    {formatTime(weather.sunrise)}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sunset className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-400">Gün Batımı</div>
                  <div className="text-base font-bold text-indigo-200">
                    {formatTime(weather.sunset)}
                  </div>
                </div>
              </div>
            </div>

            {/* Kampüs Tavsiyesi Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Kampüs Rehberi Tavsiyesi
                </h5>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {getCampusTip()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              Kilis 7 Aralık Üniversitesi Meteoroloji İstasyonu Koordinatları: 36.7161° K, 37.1150° D
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
