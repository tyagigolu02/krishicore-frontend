// src/components/TabCalculator.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AREA_UNIT_OPTIONS } from '../data/fallbackData';
import { calculateFromDimensions, getAreaBreakdown } from '../utils/calculations';
import { Check, ArrowLeftRight } from 'lucide-react';

export default function TabCalculator() {
  const { lang, areaValue, setAreaValue, areaUnit, setAreaUnit, totalAcres, plan, phosSource, setPhosSource, setActiveTab, fertilizerRates } = useApp();
  const [lwLength, setLwLength] = useState(300);
  const [lwWidth, setLwWidth] = useState(150);
  const [lwUnit, setLwUnit] = useState('FEET');

  const dimResult = calculateFromDimensions(lwLength, lwWidth, lwUnit);
  const bd = getAreaBreakdown(totalAcres);

  const phosOptions = [
    { key: 'DAP', label: '1. DAP (18:46:0)', sub: `₹${fertilizerRates?.DAP?.mrpBag ?? 1350} / 50kg` },
    { key: 'SSP', label: '2. SSP (16% P + 11% S)', sub: `₹${fertilizerRates?.SSP?.mrpBag ?? 450} / 50kg` },
    { key: 'NPK123216', label: '3. NPK (12:32:16)', sub: `₹${fertilizerRates?.NPK123216?.mrpBag ?? 1470} / 50kg` },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 6 Cols: Pan-India Unit Converter + L x W Measurer */}
      <div className="lg:col-span-6 card-base space-y-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Tool 01 · Pan-India Land Unit Converter</span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            {lang === 'HI' ? 'खेत रकबा कैलकुलेटर (एकड़, गुंठा, कनाल, बीघा, हेक्टेयर)' : 'Pan-India Field Area Calculator (Acre, Guntha, Kanal, Bigha)'}
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-3">
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5"><ArrowLeftRight className="w-3.5 h-3.5" /> {lang === 'HI' ? 'A. सीधा रकबा बदलें' : 'A. Direct Unit Conversion'}</div>
          <div className="grid grid-cols-2 gap-2.5">
            <input type="number" value={areaValue} step="0.25" min="0.1" onChange={e => setAreaValue(parseFloat(e.target.value) || 1)} className="input-field bg-white text-base font-extrabold" />
            <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)} className="input-field bg-white text-xs">
              {AREA_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{lang === 'HI' ? o.label : o.labelEn}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-center tabular-nums">
            {[
              { l: 'एकड़ (Acre)', v: bd.acres },
              { l: 'हेक्टेयर (Ha)', v: bd.hectares },
              { l: 'गुंठा (MH/GJ)', v: bd.guntha },
              { l: 'कनाल (PB/HR)', v: bd.kanal },
              { l: 'पक्का बीघा', v: bd.pakkaBigha },
              { l: 'कच्चा बीघा', v: bd.kacchaBigha },
            ].map((it, i) => (
              <div key={i} className="p-2 rounded-xl bg-white border border-slate-200">
                <div className="text-[9px] text-slate-500 font-bold truncate">{it.l}</div>
                <div className="text-xs font-extrabold text-[#1B5E20]">{it.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="text-xs font-extrabold text-emerald-950">{lang === 'HI' ? 'B. मेड़ की लंबाई × चौड़ाई से खेत नापें' : 'B. Measure by Length × Width'}</div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={lwLength} onChange={e => setLwLength(parseFloat(e.target.value) || 0)} className="input-field bg-white text-xs" placeholder="Length" />
            <input type="number" value={lwWidth} onChange={e => setLwWidth(parseFloat(e.target.value) || 0)} className="input-field bg-white text-xs" placeholder="Width" />
            <select value={lwUnit} onChange={e => setLwUnit(e.target.value)} className="input-field bg-white text-xs">
              <option value="FEET">फुट (Feet)</option>
              <option value="METER">मीटर (Meter)</option>
              <option value="GATTA">गट्ठा (8.25 ft)</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-extrabold text-emerald-900 tabular-nums">
              {dimResult.sqft.toLocaleString('en-IN')} sq.ft = {dimResult.acres.toFixed(2)} Acre ({dimResult.guntha.toFixed(1)} Guntha / {dimResult.kaccha.toFixed(1)} Bigha)
            </span>
            <button onClick={() => { setAreaValue(parseFloat(dimResult.acres.toFixed(2))); setAreaUnit('ACRE'); setActiveTab('workspace'); }} className="btn-primary flex items-center gap-1">
              {lang === 'HI' ? 'लागू करें' : 'Apply'} <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right 6 Cols: Phosphate Alternative & Cost Summary */}
      <div className="lg:col-span-6 card-base space-y-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Tool 02 · Fertilizer Bag & MRP Estimator</span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{lang === 'HI' ? 'खाद विकल्प एवं सरकारी बोरी खर्च' : 'Fertilizer Options & Govt MRP Cost'}</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {phosOptions.map(o => (
            <button key={o.key} onClick={() => setPhosSource(o.key)} className={`p-2.5 rounded-xl text-xs border transition ${phosSource === o.key ? 'font-extrabold border-2 border-[#1B5E20] bg-[#E8F5E9] text-emerald-950' : 'font-bold bg-slate-50 text-slate-700'}`}>
              {o.label}<br /><span className="text-[10px] text-slate-500">{o.sub}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2 text-xs tabular-nums">
          <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] flex justify-between items-center">
            <div><div className="font-extrabold">नीम कोटेड यूरिया</div><div>{plan.ureaKg} kg ({plan.ureaBags} बोरी)</div></div>
            <div className="text-base font-extrabold text-[#1B5E20]">₹{plan.ureaCost.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between items-center">
            <div><div className="font-extrabold">{lang === 'HI' ? plan.phosFertName : plan.phosFertNameEn}</div><div>{plan.phosKg} kg ({plan.phosBags} बोरी)</div></div>
            <div className="text-base font-extrabold text-amber-950">₹{plan.phosCost.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex justify-between items-center">
            <div><div className="font-extrabold">पोटाश (MOP)</div><div>{plan.mopKg} kg ({plan.mopBags} बोरी)</div></div>
            <div className="text-base font-extrabold text-sky-950">₹{plan.mopCost.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#061a11] text-white flex justify-between items-center">
            <div><div className="text-xs font-bold text-amber-300 uppercase">कुल सरकारी MRP खर्च</div><div className="text-[11px] text-emerald-200">{totalAcres.toFixed(2)} Acres · {phosSource}</div></div>
            <div className="text-2xl font-extrabold text-amber-400">₹{plan.totalCost.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}