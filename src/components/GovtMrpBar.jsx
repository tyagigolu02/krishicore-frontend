// src/components/GovtMrpBar.jsx
import { useApp } from '../context/AppContext';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function GovtMrpBar() {
  const { isLiveBackend, toggleApiMode, backendChecking, lang, fertilizerRates, isOnline, connectionType, isSlowNetwork, user } = useApp();

  const getGreeting = () => {
    if (!user) return lang === 'HI' ? '🙏 राम-राम किसान भाई! (100% निष्पक्ष ICAR कृषि सलाह)' : '🙏 Namaste Kisan Bhai! (100% Unbiased ICAR Advisory)';
    const n = user.fullName || 'साथी';
    const role = user.role || 'FARMER';
    if (lang === 'EN') return `🙏 Welcome, ${n}!`;
    if (role === 'DISTRIBUTOR') return `🙏 नमस्कार ${n} जी (खाद वितरक)!`;
    if (role === 'LAB_OPERATOR') return `🙏 नमस्कार ${n} जी (मिट्टी जांच लैब प्रभारी)!`;
    if (role === 'GOVT_ADMIN') return `🙏 नमस्कार ${n} जी (कृषि अधिकारी)!`;
    return `🙏 राम-राम ${n} जी (किसान भाई)!`;
  };

  const uRate = fertilizerRates?.UREA?.mrpBag ?? 266.5;
  const dRate = fertilizerRates?.DAP?.mrpBag ?? 1350;
  const mRate = fertilizerRates?.MOP?.mrpBag ?? 1650;

  return (
    <div className="bg-[#061a11] text-emerald-100/90 text-xs border-b border-emerald-900/60 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-amber-400">{getGreeting()}</span>
          <span className="hidden lg:inline text-emerald-700">|</span>
          <span className="hidden lg:inline text-[11px] text-emerald-300/90 font-medium tabular-nums">
            {lang === 'HI'
              ? `सरकारी MRP: यूरिया ₹${uRate} · डीएपी ₹${dRate} · पोटाश ₹${mRate}`
              : `Govt MRP: Urea ₹${uRate} · DAP ₹${dRate} · MOP ₹${mRate}`}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${!isOnline ? 'bg-red-900/70 text-red-200' : isSlowNetwork ? 'bg-amber-900/70 text-amber-200' : 'bg-emerald-900/70 text-emerald-200'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {!isOnline ? 'Offline PWA' : `${connectionType.toUpperCase()} Ready`}
          </span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] hover:text-white">
            <input type="checkbox" checked={isLiveBackend} disabled={backendChecking} onChange={(e) => toggleApiMode(e.target.checked)} className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer" />
            {backendChecking ? <span className="text-amber-300 font-bold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> ...</span>
              : isLiveBackend ? <span className="text-emerald-300 font-bold">🟢 Live Server DB</span>
              : <span className="text-amber-300 font-semibold">⚡ Local Mode</span>}
          </label>
        </div>
      </div>
    </div>
  );
}