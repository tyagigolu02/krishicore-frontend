// src/components/MyFarmLedgerBar.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AREA_UNIT_OPTIONS } from '../data/fallbackData';
import { Sprout, Plus, History, Trash2, CheckCircle2, X, BookOpen } from 'lucide-react';

export default function MyFarmLedgerBar() {
  const {
    lang, user, setShowAuthModal, farms, activePlotId, activeFarmEntry,
    selectFarmPlot, saveFarmPlot, logFarmSeason, deleteFarmPlot,
    previousCropCode, setPreviousCropCode, cropProfiles, areaValue, areaUnit, unitNames
  } = useApp();

  const [showAddPlot, setShowAddPlot] = useState(false);
  const [showLogHistory, setShowLogHistory] = useState(false);

  const [plotForm, setPlotForm] = useState({ plotName: '', areaValue: areaValue || 5, areaUnit: areaUnit || 'KACCHA_BIGHA', soilType: 'DOAMAT', irrigationType: 'TUBEWELL', lastCropCode: 'PADDY', lastSeasonYear: 'KHARIF 2026' });
  const [histForm, setHistForm] = useState({ season: 'KHARIF', cropYear: 2026, cropCode: 'PADDY', seedVariety: '', yieldQtlPerAcre: '', fertilizerSpendInr: '', farmerNotes: '' });

  const handleSavePlot = async (e) => {
    e.preventDefault();
    if (!plotForm.plotName.trim()) return;
    await saveFarmPlot({ ...plotForm, areaValue: parseFloat(plotForm.areaValue) || 1 });
    setPlotForm({ ...plotForm, plotName: '' });
    setShowAddPlot(false);
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!activePlotId) return;
    await logFarmSeason(activePlotId, {
      ...histForm,
      cropYear: Number(histForm.cropYear) || 2026,
      yieldQtlPerAcre: histForm.yieldQtlPerAcre ? Number(histForm.yieldQtlPerAcre) : null,
      fertilizerSpendInr: histForm.fertilizerSpendInr ? Number(histForm.fertilizerSpendInr) : null,
    });
    setHistForm({ ...histForm, seedVariety: '', yieldQtlPerAcre: '', fertilizerSpendInr: '', farmerNotes: '' });
    setShowLogHistory(false);
  };

  const getCropShort = (code) => {
    const c = cropProfiles.find(x => x.code === code);
    return c ? c.name.split('(')[0].trim() : code;
  };

  return (
    <div className="card-base space-y-3 border-2 border-[#A5D6A7]/70 bg-white">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {lang === 'HI' ? '📒 मेरा खेत और पिछली फसल खाता (Permanent Farm Ledger & Crop Rotation)' : '📒 My Farm Plots & Crop Rotation Ledger'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {user ? (lang === 'HI' ? 'आपका हर खेत और पिछले साल की बुवाई खाते में सुरक्षित है — क्लिक करते ही रकबा व फसल चक्र लोड होगा।' : 'Saved permanently to your account. Tap a plot to load rotation advice.')
                : (lang === 'HI' ? 'स्थायी रूप से खेत का रिकॉर्ड सेव करने के लिए लॉगिन करें, या नीचे पिछली फसल चुनें।' : 'Login to permanently sync farm history across devices, or pick last crop below.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Previous Crop Selector (Works even for guests!) */}
          <select value={previousCropCode} onChange={e => setPreviousCropCode(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 bg-[#F8FAF5] text-xs font-extrabold text-slate-800">
            <option value="">{lang === 'HI' ? '🔄 पिछली फसल चुनें (Rotation)' : '🔄 Select Last Crop'}</option>
            {cropProfiles.map(c => <option key={c.code} value={c.code}>पिछली: {c.name.split('(')[0].trim()}</option>)}
          </select>

          <button onClick={() => setShowAddPlot(!showAddPlot)} className="px-3.5 py-2 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> {lang === 'HI' ? 'नया खेत जोड़ें' : 'Add Plot'}
          </button>
          {!user && (
            <button onClick={() => setShowAuthModal(true)} className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">
              🔒 DB में सेव करें
            </button>
          )}
        </div>
      </div>

      {/* Saved Farm Plots Pills */}
      {farms.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {farms.map(({ plot }) => {
            const active = plot.id === activePlotId;
            return (
              <div key={plot.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs transition ${active ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-sm' : 'bg-[#F8FAF5] text-slate-800 border-[#E2E8D8] hover:border-[#1B5E20]'}`}>
                <button type="button" onClick={() => selectFarmPlot(plot.id)} className="font-extrabold flex items-center gap-1.5">
                  <Sprout className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-[#1B5E20]'}`} />
                  <span>{plot.plotName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-white border'}`}>
                    {plot.areaValue} {unitNames[plot.areaUnit] || plot.areaUnit}
                  </span>
                  {plot.lastCropCode && (
                    <span className={`text-[10px] ${active ? 'text-amber-200' : 'text-emerald-800'}`}>
                      · पिछली: {getCropShort(plot.lastCropCode)}
                    </span>
                  )}
                </button>
                <button type="button" onClick={() => deleteFarmPlot(plot.id)} title="Delete" className="opacity-70 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}

          {activeFarmEntry && (
            <button type="button" onClick={() => setShowLogHistory(!showLogHistory)} className="px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-extrabold flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> {lang === 'HI' ? '+ पिछली पैदावार लिखें' : '+ Log Harvest'}
            </button>
          )}
        </div>
      )}

      {/* Active Plot History Timeline */}
      {activeFarmEntry?.history?.length > 0 && (
        <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-1.5 text-xs">
          <div className="font-extrabold text-[#1B5E20]">📜 {activeFarmEntry.plot.plotName} का फसल इतिहास (Saved History):</div>
          <div className="flex flex-wrap gap-2">
            {activeFarmEntry.history.slice(0, 5).map((h, i) => (
              <div key={h.id || i} className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <b>{h.season} {h.cropYear}:</b> <span>{getCropShort(h.cropCode)}</span>
                {h.yieldQtlPerAcre && <span className="text-emerald-800 font-bold">({h.yieldQtlPerAcre} Qtl/एकड़)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form 1: Add New Farm Plot */}
      {showAddPlot && (
        <form onSubmit={handleSavePlot} className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B5E20]/30 space-y-3">
          <div className="flex justify-between items-center text-xs font-extrabold text-[#1B5E20]">
            <span>🌱 नया खेत सेव करें (स्थायी रिकॉर्ड)</span>
            <button type="button" onClick={() => setShowAddPlot(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <input required value={plotForm.plotName} onChange={e => setPlotForm({ ...plotForm, plotName: e.target.value })} placeholder="खेत का नाम (उदा. नहर वाला खेत) *" className="input-field bg-white text-xs sm:col-span-2" />
            <input required type="number" step="0.25" value={plotForm.areaValue} onChange={e => setPlotForm({ ...plotForm, areaValue: e.target.value })} placeholder="रकबा" className="input-field bg-white text-xs" />
            <select value={plotForm.areaUnit} onChange={e => setPlotForm({ ...plotForm, areaUnit: e.target.value })} className="input-field bg-white text-xs">
              {AREA_UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label.split('—')[0]}</option>)}
            </select>
            <select value={plotForm.soilType} onChange={e => setPlotForm({ ...plotForm, soilType: e.target.value })} className="input-field bg-white text-xs">
              <option value="DOAMAT">दोमट मिट्टी (Loamy)</option><option value="KALI">काली मिट्टी (Black)</option><option value="BALUI">बलुई मिट्टी (Sandy)</option><option value="CHIKNI">चिकनी मिट्टी (Clay)</option>
            </select>
            <select value={plotForm.lastCropCode} onChange={e => setPlotForm({ ...plotForm, lastCropCode: e.target.value })} className="input-field bg-white text-xs">
              <option value="">पिछली फसल चुनें</option>
              {cropProfiles.map(c => <option key={c.code} value={c.code}>{c.name.split('(')[0].trim()}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary py-2 px-5">✅ खेत स्थायी सेव करें</button>
        </form>
      )}

      {/* Form 2: Log Past Season Harvest into Active Plot */}
      {showLogHistory && activeFarmEntry && (
        <form onSubmit={handleAddHistory} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-extrabold text-amber-950">
            <span>📜 "{activeFarmEntry.plot.plotName}" में पिछले सीज़न की फसल व उपज दर्ज करें</span>
            <button type="button" onClick={() => setShowLogHistory(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <select value={histForm.season} onChange={e => setHistForm({ ...histForm, season: e.target.value })} className="input-field bg-white text-xs"><option value="KHARIF">खरीफ (Kharif)</option><option value="RABI">रबी (Rabi)</option><option value="ZAID">जायद (Zaid)</option></select>
            <input type="number" value={histForm.cropYear} onChange={e => setHistForm({ ...histForm, cropYear: e.target.value })} placeholder="वर्ष (2026)" className="input-field bg-white text-xs" />
            <select value={histForm.cropCode} onChange={e => setHistForm({ ...histForm, cropCode: e.target.value })} className="input-field bg-white text-xs">
              {cropProfiles.map(c => <option key={c.code} value={c.code}>{c.name.split('(')[0].trim()}</option>)}
            </select>
            <input type="number" step="0.5" value={histForm.yieldQtlPerAcre} onChange={e => setHistForm({ ...histForm, yieldQtlPerAcre: e.target.value })} placeholder="उपज (क्विंटल/एकड़)" className="input-field bg-white text-xs" />
            <button type="submit" className="btn-primary py-2">💾 रिकॉर्ड जोड़ें</button>
          </div>
        </form>
      )}
    </div>
  );
}