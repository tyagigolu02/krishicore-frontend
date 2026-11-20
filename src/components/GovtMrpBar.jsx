// src/components/GovtMrpBar.jsx
import { useApp } from '../context/AppContext';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function GovtMrpBar() {
  const { isLiveBackend, toggleApiMode, backendChecking, lang, fertilizerRates, isOnline, connectionType, isSlowNetwork, user } = useApp();

  const getGreeting = () => {
    if (!user) return lang === 'HI' ? '🙏 राम-राम किसान भाई!' : '🙏 Namaste Kisan Bhai!';
    const n = user.fullName || 'साथी';
    const role = user.role || 'FARMER';
    if (lang === 'EN') return `🙏 Welcome, ${n}!`;
    if (role === 'DISTRIBUTOR') return `🙏 नमस्कार ${n} जी (वितरक)`;
    if (role === 'LAB_OPERATOR') return `🙏 नमस्कार ${n} जी (लैब)`;
    if (role === 'GOVT_ADMIN') return `🙏 नमस्कार ${n} जी (अधिकारी)`;
    return `🙏 राम-राम ${n} जी!`;
  };

  const uRate = fertilizerRates?.UREA?.mrpBag ?? 266.5;
  const dRate = fertilizerRates?.DAP?.mrpBag ?? 1350;
  const mRate = fertilizerRates?.MOP?.mrpBag ?? 1650;
  const netLabel = (connectionType || '4g').toUpperCase();

  return (
    <div className="bg-[#061a11] text-emerald-100/90 text-[11px] border-b border-emerald-900/60 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Greeting + Desktop MRP */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-extrabold text-amber-400 truncate">{getGreeting()}</span>
          <span className="hidden lg:inline text-emerald-700">|</span>
          <span className="hidden lg:inline text-emerald-300/90 font-medium tabular-nums">
            {lang === 'HI'
              ? `सरकारी MRP: यूरिया ₹${uRate} · डीएपी ₹${dRate} · पोटाश ₹${mRate}`
              : `Govt MRP: Urea ₹${uRate} · DAP ₹${dRate} · MOP ₹${mRate}`}
          </span>
        </div>

        {/* Right: Compact Mobile Signal (4G only) + Local/Live Signal Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${!isOnline ? 'bg-red-900/80 text-red-200' : isSlowNetwork ? 'bg-amber-900/80 text-amber-200' : 'bg-emerald-900/80 text-emerald-200'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{!isOnline ? 'Offline' : netLabel}</span>
            <span className="hidden sm:inline">Ready</span>
          </span>

          <button
            type="button"
            onClick={() => toggleApiMode(!isLiveBackend)}
            disabled={backendChecking}
            title="Switch Live DB / Local Mode"
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 border transition ${isLiveBackend ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300' : 'bg-amber-950/70 border-amber-500/40 text-amber-300'}`}
          >
            {backendChecking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${isLiveBackend ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            )}
            <span>{isLiveBackend ? 'Live' : 'Local'}</span>
            <span className="hidden sm:inline">{isLiveBackend ? 'Server DB' : 'Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}