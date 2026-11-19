// src/components/WeatherSprayBanner.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateWhatsAppShareUrl } from '../utils/calculations';
import { CloudSun, MapPin, Navigation, Thermometer, Droplets, Wind, Share2 } from 'lucide-react';

export default function WeatherSprayBanner() {
  const {
    lang, weatherData, locating, detectLiveGps, updateByPincodeOrCity,
    plan, metrics, areaValue, areaUnit, unitNames
  } = useApp();

  const [showLocInput, setShowLocInput] = useState(false);
  const [locQuery, setLocQuery] = useState('');

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!locQuery.trim()) return;
    await updateByPincodeOrCity('', locQuery.trim());
    setShowLocInput(false);
    setLocQuery('');
  };

  const whatsappUrl = generateWhatsAppShareUrl(plan, metrics, areaValue, areaUnit, unitNames, weatherData);

  return (
    <div className="bg-gradient-to-r from-[#071f15] via-emerald-900 to-[#061a11] text-white rounded-3xl p-5 border border-emerald-800/60 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20">
              <CloudSun className="w-4 h-4 text-amber-300" />
              {lang === 'HI' ? '16-दिवसीय लाइव मौसम व स्प्रे विंडो' : '16-Day Live Weather & Spray Window'}
            </span>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-200">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'HI' ? weatherData.location : weatherData.locationEn || weatherData.location}</span>
              <button type="button" onClick={() => setShowLocInput(!showLocInput)} className="ml-1 underline text-emerald-300 hover:text-white text-[11px]">
                {lang === 'HI' ? 'बदलें' : 'Change'}
              </button>
              <button type="button" onClick={detectLiveGps} title="Live GPS" className="ml-1 text-amber-300 hover:text-white">
                <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              weatherData.sowingWeatherVerdict === 'SAFE_FOR_SOWING'
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-red-500/30 text-amber-200 border border-amber-400/40'
            }`}>
              {lang === 'HI' ? weatherData.verdictTextHi : weatherData.verdictTextEn}
            </span>
          </div>
          <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
            {lang === 'HI' ? weatherData.forecastSummaryHi : weatherData.forecastSummaryEn}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-black/25 px-3.5 py-2 rounded-2xl border border-white/10 text-xs tabular-nums">
            <span className="flex items-center gap-1 text-amber-300 font-bold"><Thermometer className="w-4 h-4" />{weatherData.avgMinTemp}°–{weatherData.avgMaxTemp}°C</span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1 text-sky-300 font-bold"><Droplets className="w-4 h-4" />{weatherData.totalExpectedRainMm} mm</span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1 text-emerald-300 font-bold"><Wind className="w-4 h-4" />{weatherData.windSpeedKmh} km/h</span>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5">
            <Share2 className="w-4 h-4" /> {lang === 'HI' ? 'व्हाट्सएप रिपोर्ट' : 'WhatsApp'}
          </a>
        </div>
      </div>

      {showLocInput && (
        <form onSubmit={handleLocationSubmit} className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={locQuery}
            onChange={e => setLocQuery(e.target.value)}
            placeholder={lang === 'HI' ? 'भारत का कोई भी पिनकोड या ज़िला लिखें (उदा. Nashik, Karnal, Nagpur, 422001)...' : 'Enter any Indian PIN code or District...'}
            className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs">
            📍 {lang === 'HI' ? 'लोकेशन अपडेट करें' : 'Set Location'}
          </button>
        </form>
      )}
    </div>
  );
}