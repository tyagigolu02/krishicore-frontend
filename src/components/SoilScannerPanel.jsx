// src/components/SoilScannerPanel.jsx
import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PARAM_CONFIG } from '../data/fallbackData';
import { compressImage } from '../utils/imageCompressor';
import { extractSoilCard } from '../api/krishicoreApi';
import { Camera, RotateCcw, AlertTriangle, Loader2, ImageIcon, Sparkles, Layers, FlaskConical, CheckSquare, Square } from 'lucide-react';

export default function SoilScannerPanel() {
  const {
    lang, metrics, updateMetric, resetMetrics,
    selectedCrop, setSelectedCrop, cropProfiles,
    selectedVarietyId, setSelectedVarietyId, varietiesForCrop,
    isAnalyzing, runAnalysis, scannerLoading, setScannerLoading,
    compressionTelemetry, setCompressionTelemetry, invalidCardWarning, setInvalidCardWarning, setMetrics
  } = useApp();

  const [preview, setPreview] = useState(null);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInvalidCardWarning(null); setScannerLoading(true); setPreview(URL.createObjectURL(file));
    try {
      const comp = await compressImage(file, { maxDimension: 1280, quality: 0.72, format: 'image/webp' });
      setCompressionTelemetry({ originalKB: comp.originalKB, compressedKB: comp.compressedKB, isBlurry: comp.isBlurry });
      const res = await extractSoilCard(new File([comp.blob], 'shc.webp', { type: comp.blob.type || 'image/webp' }));
      if (res.isValidSoilHealthCard === false) {
        setInvalidCardWarning(res.documentStatusMessage || 'अमान्य दस्तावेज! केवल मृदा स्वास्थ्य कार्ड अपलोड करें।');
        return;
      }
      setMetrics(prev => {
        const next = { ...prev };
        PARAM_CONFIG.forEach(p => { if (res[p.key] != null) next[p.key] = Number(res[p.key]); });
        return next;
      });
    } catch { setCompressionTelemetry(p => p ? { ...p, offline: true } : null); }
    finally { setScannerLoading(false); }
  }, [setMetrics, setScannerLoading, setCompressionTelemetry, setInvalidCardWarning]);

  const physicalParams = PARAM_CONFIG.filter(p => p.group === 'PHYSICAL');
  const primaryParams = PARAM_CONFIG.filter(p => p.group === 'PRIMARY');
  const microParams = PARAM_CONFIG.filter(p => p.group === 'MICRO');

  return (
    <div className="lg:col-span-5 card-base space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">M2 Vision AI · Verify Soil Report</span>
          <h3 className="text-lg font-extrabold text-slate-900">{lang === 'HI' ? 'मृदा रिपोर्ट सत्यापन (12 तत्व)' : 'Verify Soil Report (12 Params)'}</h3>
        </div>
        <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5">
          {scannerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 text-amber-300" />}
          <span>{lang === 'HI' ? 'कार्ड स्कैन करें' : 'Scan Card'}</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} disabled={scannerLoading} />
        </label>
      </div>

      {compressionTelemetry && (
        <div className={`text-[11px] px-3 py-2 rounded-xl flex items-center gap-2 font-bold ${compressionTelemetry.isBlurry ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'}`}>
          <ImageIcon className="w-3.5 h-3.5 shrink-0" /><span>{compressionTelemetry.originalKB} KB ➔ {compressionTelemetry.compressedKB} KB WebP</span>
        </div>
      )}
      {preview && <div className="rounded-2xl overflow-hidden border max-h-24"><img src={preview} alt="SHC" className="w-full h-24 object-cover" /></div>}
      {invalidCardWarning && <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800 font-bold"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{invalidCardWarning}</span></div>}

      {/* Target Crop + Dynamic Seed Variety Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-700">{lang === 'HI' ? 'लक्षित फसल चुनें:' : 'Select Crop:'}</label>
          <button onClick={resetMetrics} className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
        </div>
        <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1B5E20] bg-emerald-50/40 font-extrabold text-sm text-slate-900">
          {cropProfiles.map(c => <option key={c.code} value={c.code}>{lang === 'HI' ? c.name : c.nameEn || c.name}</option>)}
        </select>

        {/* Seed Variety Checkboxes */}
        <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-2">
          <div className="text-[11px] font-extrabold text-[#1B5E20]">{lang === 'HI' ? '🌱 बीज की किस्म चुनें (Seed Variety — खाद मात्रा स्वतः समायोजित):' : '🌱 Select Seed Variety (Auto-adjusts NPK):'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {varietiesForCrop.map(v => {
              const checked = selectedVarietyId === v.id;
              return (
                <button key={v.id} type="button" onClick={() => setSelectedVarietyId(v.id)} className={`px-2.5 py-2 rounded-xl border text-left text-[11px] flex items-center justify-between gap-1 transition ${checked ? 'bg-[#E8F5E9] border-[#1B5E20] text-[#1B5E20] font-extrabold' : 'bg-white border-slate-200 text-slate-700 font-semibold'}`}>
                  <span className="flex items-center gap-1.5 truncate">
                    {checked ? <CheckSquare className="w-3.5 h-3.5 shrink-0 text-[#1B5E20]" /> : <Square className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                    <span className="truncate">{lang === 'HI' ? v.nameHi : v.nameEn}</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 shrink-0">{v.tagHi}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group 1: Physical */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-emerald-700" /> 1. {lang === 'HI' ? 'भौतिक गुण (pH, OC, EC)' : 'Physical (pH, OC, EC)'}</div>
        <div className="grid grid-cols-3 gap-2">
          {physicalParams.map(p => {
            const val = metrics[p.key], [st, cls] = p.check(val);
            return (
              <div key={p.key} className="p-2 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8]">
                <div className="text-[10px] font-bold text-slate-600 truncate">{lang === 'HI' ? p.label : p.labelEn}</div>
                <div className="flex items-center justify-between mt-1">
                  <input type="number" step="0.05" value={val} onChange={e => updateMetric(p.key, e.target.value)} className="w-14 px-1.5 py-1 rounded-lg border bg-white font-extrabold text-xs tabular-nums" />
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold border ${cls}`}>{st}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group 2: Primary NPK+S */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5 text-emerald-700" /> 2. {lang === 'HI' ? 'मुख्य तत्व (NPK & S)' : 'Primary (NPK & S)'}</div>
        <div className="grid grid-cols-2 gap-2">
          {primaryParams.map(p => {
            const val = metrics[p.key], [st, cls] = p.check(val);
            return (
              <div key={p.key} className="p-2 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-1">
                <div className="flex justify-between items-center"><span className="text-[11px] font-extrabold text-slate-800">{lang === 'HI' ? p.label : p.labelEn}</span><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold border ${cls}`}>{st}</span></div>
                <div className="flex justify-between items-center"><input type="number" step="1" value={val} onChange={e => updateMetric(p.key, e.target.value)} className="w-16 px-2 py-1 rounded-lg border bg-white font-extrabold text-xs tabular-nums" /><span className="text-[10px] text-slate-500">Target: {p.target}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group 3: Micro */}
      <div className="grid grid-cols-5 gap-1.5">
        {microParams.map(p => {
          const val = metrics[p.key], [st, cls] = p.check(val);
          return (
            <div key={p.key} className="p-1.5 rounded-xl bg-[#F8FAF5] border border-[#E2E8D8] text-center">
              <div className="text-[10px] font-bold text-slate-700">{p.key.toUpperCase()}</div>
              <input type="number" step="0.05" value={val} onChange={e => updateMetric(p.key, e.target.value)} className="w-full px-1 py-0.5 my-1 rounded border bg-white font-extrabold text-xs text-center tabular-nums" />
              <span className={`block text-[8px] px-1 py-0.5 rounded font-extrabold ${cls}`}>{st}</span>
            </div>
          );
        })}
      </div>

      <button onClick={runAnalysis} disabled={isAnalyzing} className="w-full py-3 rounded-xl bg-[#1B5E20] hover:bg-emerald-900 text-white font-extrabold text-xs flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        {isAnalyzing ? 'विश्लेषण जारी...' : (lang === 'HI' ? 'पुष्टि करें व खाद/फसल गणना चलाएं →' : 'Confirm & Calculate →')}
      </button>
    </div>
  );
}