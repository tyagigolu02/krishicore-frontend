// src/components/DosageAndTimelinePanel.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CROP_CATEGORIES } from '../data/fallbackData';
import { Volume2, Store, CalendarClock, CheckCircle2, Award, AlertTriangle } from 'lucide-react';
import { speakHindi, generateHindiSpeechText, computeSoilAlerts } from '../utils/calculations';

export default function DosageAndTimelinePanel() {
  const {
    lang, metrics, plan, remedies, totalAcres, areaValue, areaUnit, unitNames,
    phosSource, setPhosSource, fertilizerRates, recommendedCrops,
    selectedCrop, setSelectedCrop, setActiveTab, previousCropCode
  } = useApp();

  const [catFilter, setCatFilter] = useState('ALL');
  const ureaMrp = fertilizerRates?.UREA?.mrpBag ?? 266.5;
  const mopMrp = fertilizerRates?.MOP?.mrpBag ?? 1650;

  const visibleCrops = (catFilter === 'ALL'
    ? recommendedCrops
    : recommendedCrops.filter(c => c.category === catFilter)
  ).slice(0, 6);

  const soilAlerts = computeSoilAlerts(metrics, plan, selectedCrop);

  const handleSpeak = () => {
    speakHindi(generateHindiSpeechText(plan, metrics, areaValue, areaUnit, unitNames, phosSource, totalAcres));
  };

  return (
    <div className="lg:col-span-7 space-y-6">
      {/* Card 1: Required Fertilizers & Stitch 3-Stage Timeline */}
      <div className="card-base space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
              {lang === 'HI' ? `${areaValue} ${unitNames[areaUnit]} (${totalAcres.toFixed(2)} एकड़) के लिए संतुलित खाद` : `Dosage for ${totalAcres.toFixed(2)} Acres`}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">{lang === 'HI' ? 'संतुलित खाद की मात्रा, बोरी व चरणबद्ध सलाह' : 'Balanced Fertilizer Bags & Split Schedule'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSpeak} className="btn-amber flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> {lang === 'HI' ? 'हिंदी सुनें' : 'Listen'}</button>
            <button onClick={() => setActiveTab('shops')} className="btn-primary flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> {lang === 'HI' ? 'नज़दीकी PACS/दुकान' : 'Nearby Shops'}</button>
          </div>
        </div>

        {soilAlerts.length > 0 && (
          <div className="space-y-2">
            {soilAlerts.map((al, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex items-start gap-2 text-xs font-semibold ${
                  al.type === 'DANGER'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : al.type === 'INFO'
                    ? 'bg-sky-50 border-sky-300 text-sky-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${al.type === 'DANGER' ? 'text-red-600' : al.type === 'INFO' ? 'text-sky-600' : 'text-amber-600'}`} />
                <span>{lang === 'HI' ? al.hi : al.en}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAF5] p-2.5 rounded-2xl border border-[#E2E8D8]">
          <span className="text-xs font-extrabold text-slate-700">{lang === 'HI' ? 'फॉस्फोरस विकल्प:' : 'Phosphate Source:'}</span>
          <div className="flex flex-wrap gap-1.5">
            {['DAP', 'SSP', 'NPK123216'].map(src => (
              <button key={src} onClick={() => setPhosSource(src)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${phosSource === src ? 'bg-[#1B5E20] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
                {src === 'NPK123216' ? 'NPK 12:32:16' : src} (₹{fertilizerRates?.[src]?.mrpBag})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
          <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] space-y-1">
            <div className="text-xs font-extrabold text-[#1B5E20]">1. {lang === 'HI' ? 'नीम कोटेड यूरिया (46% N)' : 'Urea (46% N)'}</div>
            <div className="text-2xl font-extrabold text-slate-900">{plan.ureaKg} kg <span className="text-xs text-[#1B5E20]">({plan.ureaBags} बोरी)</span></div>
            <div className="text-xs font-bold text-slate-700">MRP: <b>₹{plan.ureaCost.toLocaleString('en-IN')}</b> (@₹{ureaMrp})</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="text-xs font-extrabold text-amber-900">2. {lang === 'HI' ? plan.phosFertName : plan.phosFertNameEn}</div>
            <div className="text-2xl font-extrabold text-slate-900">{plan.phosKg} kg <span className="text-xs text-amber-800">({plan.phosBags} बोरी)</span></div>
            <div className="text-xs font-bold text-slate-700">MRP: <b>₹{plan.phosCost.toLocaleString('en-IN')}</b></div>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
            <div className="text-xs font-extrabold text-sky-900">3. {lang === 'HI' ? 'पोटाश - MOP (60% K)' : 'MOP (60% K)'}</div>
            <div className="text-2xl font-extrabold text-slate-900">{plan.mopKg} kg <span className="text-xs text-sky-800">({plan.mopBags} बोरी)</span></div>
            <div className="text-xs font-bold text-slate-700">MRP: <b>₹{plan.mopCost.toLocaleString('en-IN')}</b> (@₹{mopMrp})</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#1B5E20]"><CalendarClock className="w-4 h-4" /><span>{lang === 'HI' ? 'खाद कब और कैसे डालें (3 चरण)' : 'Application Timeline (3-Stage)'}</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            {(plan.applicationTimeline || []).map((st, i) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900">{lang === 'HI' ? st.stageHi : st.stageEn}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{lang === 'HI' ? st.detailHi : st.detailEn}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#071f15] text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-300 uppercase">{lang === 'HI' ? 'कुल सरकारी सब्सिडी खाद खर्च (Govt MRP)' : 'Total Subsidized Govt MRP'}</div>
            <div className="text-[11px] text-emerald-200">{plan.variety ? `किस्म: ${plan.variety.nameHi}` : 'ICAR मानक गणना'}</div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">₹{plan.totalCost.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Card 2: Top 6 Weather, Soil & Crop-Rotation Matched Crops */}
      <div className="card-base space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {lang === 'HI' ? 'मौसम, मिट्टी व फसल चक्र के अनुसार शीर्ष 6 फसलें' : 'Top 6 Crops (Weather, Soil & Rotation Matched)'}
            </h3>
            {previousCropCode && (
              <p className="text-[11px] font-bold text-[#1B5E20] mt-0.5">🔄 पिछली फसल ({previousCropCode}) के आधार पर वैज्ञानिक फसल चक्र लागू है।</p>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CROP_CATEGORIES).map(([key, val]) => (
            <button key={key} onClick={() => setCatFilter(key)} className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition ${catFilter === key ? 'bg-[#1B5E20] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {lang === 'HI' ? val.hi : val.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleCrops.map((crop, idx) => (
            <div key={crop.cropCode || idx} className={`p-3.5 rounded-2xl border flex flex-col justify-between ${selectedCrop === crop.cropCode ? 'bg-[#E8F5E9] border-[#1B5E20] shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-500">#{idx + 1} · {CROP_CATEGORIES[crop.category]?.hi || 'फसल'}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#1B5E20] border border-[#A5D6A7]">{crop.suitabilityScore}% Match</span>
                </div>
                {crop.rotationTag && (
                  <div className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg inline-block ${crop.rotationTag.type === 'BOOST' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'}`}>
                    {lang === 'HI' ? crop.rotationTag.hi : crop.rotationTag.en}
                  </div>
                )}
                <h4 className="text-sm font-extrabold text-slate-900">{lang === 'HI' ? crop.nameHi : crop.nameEn}</h4>
                <div className="text-[11px] font-bold text-emerald-800">{lang === 'HI' ? crop.expectedYield : crop.expectedYieldEn}</div>
                <p className="text-[11px] text-slate-600 leading-snug">{lang === 'HI' ? crop.reasonHi : crop.reasonEn}</p>
              </div>
              <button onClick={() => setSelectedCrop(crop.cropCode)} className={`w-full mt-2.5 py-1.5 rounded-xl text-xs font-extrabold ${selectedCrop === crop.cropCode ? 'bg-[#1B5E20] text-white' : 'bg-white border text-slate-700'}`}>
                {selectedCrop === crop.cropCode ? '✓ चयनित' : (lang === 'HI' ? 'बुवाई हेतु चुनें' : 'Select Crop')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Unbiased Soil Remedies */}
      {remedies.length > 0 && (
        <div className="card-base space-y-2.5">
          <h3 className="text-base font-extrabold text-slate-900">{lang === 'HI' ? 'मिट्टी सुधार हेतु सामान्य बाज़ार उत्पाद' : 'Unbiased Soil Remedies'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {remedies.map((r, i) => (
              <div key={i} className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] text-xs space-y-0.5">
                <div className="font-extrabold text-[#1B5E20] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {lang === 'HI' ? r.title : r.titleEn}</div>
                <div className="text-red-700 font-bold text-[11px]">{lang === 'HI' ? r.reason : r.reasonEn}</div>
                <div className="font-extrabold text-slate-900">{lang === 'HI' ? r.dose : r.doseEn} · <span className="font-normal text-slate-500">{lang === 'HI' ? r.rate : r.rateEn}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}