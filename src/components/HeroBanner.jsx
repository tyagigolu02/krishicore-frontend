// src/components/HeroBanner.jsx
import { useApp } from '../context/AppContext';
import { getAreaBreakdown } from '../utils/calculations';
import { AREA_UNIT_OPTIONS } from '../data/fallbackData';
import { ArrowRight, MapPin } from 'lucide-react';

export default function HeroBanner() {
  const { lang, areaValue, setAreaValue, areaUnit, setAreaUnit, totalAcres, setActiveTab, weatherData, unitNames } = useApp();
  const bd = getAreaBreakdown(totalAcres);

  return (
    <section className="hero-mesh text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang === 'HI' ? `सक्रिय कृषि क्षेत्र: ${weatherData.location}` : `Active Region: ${weatherData.locationEn || weatherData.location}`}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {lang === 'HI' ? (
                <>मिट्टी की जांच करवाएं, <span className="text-amber-400">अपने खेत के {unitNames[areaUnit] || 'रकबे'}</span> के हिसाब से खाद की बोरी और सरकारी रेट जानें।</>
              ) : (
                <>Get your soil tested, know the exact <span className="text-amber-400">fertilizer bags & Govt MRP cost</span> for your field size.</>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 max-w-2xl leading-relaxed">
              {lang === 'HI'
                ? '100% लाइव एपीआई आधारित — आपके ज़िले के 16-दिवसीय मौसम, मिट्टी के 12 तत्वों और क्षेत्रीय माप (एकड़, गुंठा, कनाल, बीघा, सेंट) के अनुसार निष्पक्ष खाद व फसल सलाह।'
                : '100% Live API driven — unbiased crop and fertilizer prescription calibrated to your district weather, 12 soil parameters, and regional land units.'}
            </p>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                ⚡ {lang === 'HI' ? 'खेत का रकबा चुनें (Regional Field Size)' : 'Select Regional Field Size'}
              </span>
              <button onClick={() => setActiveTab('calculator')} className="text-xs text-emerald-300 font-bold hover:underline flex items-center gap-1">
                {lang === 'HI' ? 'लंबाई × चौड़ाई नापें' : 'Measure L×W'} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-emerald-100 block mb-1">{lang === 'HI' ? 'रकबा संख्या' : 'Field Size'}</label>
                <input
                  type="number"
                  value={areaValue}
                  step="0.5"
                  min="0.1"
                  onChange={e => setAreaValue(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-sm focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-emerald-100 block mb-1">{lang === 'HI' ? 'क्षेत्रीय इकाई (Unit)' : 'Regional Unit'}</label>
                <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs focus:outline-none">
                  {AREA_UNIT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{lang === 'HI' ? opt.label : opt.labelEn}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-amber-200 font-bold bg-black/25 px-3 py-2 rounded-xl tabular-nums">
              {lang === 'HI'
                ? `समतुल्य: ${bd.acres} एकड़ · ${bd.hectares} हेक्टेयर · ${bd.guntha} गुंठा · ${bd.kanal} कनाल · ${bd.pakkaBigha} पक्का बीघा`
                : `Equivalent: ${bd.acres} Acre · ${bd.hectares} Ha · ${bd.guntha} Guntha · ${bd.kanal} Kanal · ${bd.pakkaBigha} Bigha`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}