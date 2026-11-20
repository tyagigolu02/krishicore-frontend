// src/components/HeroBanner.jsx
import { useApp } from '../context/AppContext';
import { AREA_UNIT_OPTIONS } from '../data/fallbackData';
import { getAreaBreakdown } from '../utils/calculations';
import { MapPin, Zap, ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  const { lang, areaValue, setAreaValue, areaUnit, setAreaUnit, totalAcres, unitNames, weatherData, setActiveTab } = useApp();
  const br = getAreaBreakdown(totalAcres);

  return (
    <section className="bg-gradient-to-br from-[#061a11] via-[#0c2d1d] to-[#123d27] text-white border-b border-emerald-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-700/60 text-emerald-200 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{lang === 'HI' ? `सक्रिय कृषि क्षेत्र: ${weatherData.location}` : `Active Agri-Zone: ${weatherData.locationEn}`}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            {lang === 'HI' ? (
              <>मिट्टी की जांच करवाएं, <span className="text-amber-400">अपने खेत के {unitNames[areaUnit]}</span> के हिसाब से खाद की बोरी और सरकारी रेट जानें।</>
            ) : (
              <>Test your soil, get exact <span className="text-amber-400">{unitNames[areaUnit]}-based</span> fertilizer bags & Govt MRP.</>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            {lang === 'HI'
              ? '100% लाइव एपीआई आधारित — आपके ज़िले के 16-दिवसीय मौसम, मिट्टी के 12 तत्वों और क्षेत्रीय माप के अनुसार निष्पक्ष खाद व फसल सलाह।'
              : '100% Live API driven — unbiased fertilizer & crop advice calibrated to 16-day district weather, 12 soil metrics, and regional land units.'}
          </p>
        </div>

        {/* Regional Field Size Card */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-500/30 space-y-3 max-w-3xl">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'HI' ? 'खेत का रकबा चुनें' : 'Select Field Size'}</span>
            </div>
            <button
              onClick={() => setActiveTab('calculator')}
              className="px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>{lang === 'HI' ? 'लंबाई × चौड़ाई नापें' : 'Measure L × W'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-4 sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-emerald-200 block">{lang === 'HI' ? 'रकबा संख्या' : 'Area'}</label>
              <input
                type="number" min="0.1" step="0.25" value={areaValue}
                onChange={e => setAreaValue(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-sm tabular-nums outline-none"
              />
            </div>
            <div className="col-span-8 sm:col-span-9 space-y-1">
              <label className="text-[11px] font-bold text-emerald-200 block">{lang === 'HI' ? 'क्षेत्रीय इकाई (Unit)' : 'Regional Unit'}</label>
              <select
                value={areaUnit}
                onChange={e => setAreaUnit(e.target.value)}
                className="w-full px-2.5 sm:px-3 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm outline-none"
              >
                {AREA_UNIT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{lang === 'HI' ? opt.label : opt.labelEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-black/25 text-[11px] text-emerald-100/90 font-semibold tabular-nums">
            {lang === 'HI'
              ? `समतुल्य: ${br.acres} एकड़ · ${br.hectares} हेक्टेयर · ${br.guntha} गुंठा · ${br.kanal} कनाल · ${br.pakkaBigha} पक्का बीघा`
              : `Equivalent: ${br.acres} Acre · ${br.hectares} Ha · ${br.guntha} Guntha · ${br.kanal} Kanal`}
          </div>
        </div>
      </div>
    </section>
  );
}