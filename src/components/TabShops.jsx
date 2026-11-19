// src/components/TabShops.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, MapPin, Filter, Store, ShieldCheck, AlertCircle, ThumbsUp, ThumbsDown, UserPlus } from 'lucide-react';

const CROWD_KEY = 'kc_shop_crowd_reports_v1';
const DAY_MS = 24 * 60 * 60 * 1000;

function loadCrowdReports() {
  try {
    const raw = JSON.parse(localStorage.getItem(CROWD_KEY) || '{}');
    const now = Date.now();
    // Auto-expire reports older than 24 hours so stale stock info never misleads farmers
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => now - v.ts < DAY_MS));
  } catch { return {}; }
}

export default function TabShops() {
  const { lang, shops, weatherData, fertilizerRates, setShowAuthModal } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [crowdReports, setCrowdReports] = useState(loadCrowdReports);

  const reportStockSignal = (shopKey, status) => {
    setCrowdReports((prev) => {
      const next = { ...prev, [shopKey]: { status, ts: Date.now() } };
      localStorage.setItem(CROWD_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filteredShops = (shops || []).filter((s) => {
    const isVerified = s.isVerifiedPartner || s.stockStatus === 'VERIFIED_LIVE_STOCK';
    if (filter === 'GOVT_COOP') return s.shopType === 'GOVT_COOP';
    if (filter === 'VERIFIED_STOCK') return isVerified && (s.ureaBagsAvailable > 0 || s.dapBagsAvailable > 0);
    return true;
  });

  const uMrp = fertilizerRates?.UREA?.mrpBag ?? 266.5;
  const dMrp = fertilizerRates?.DAP?.mrpBag ?? 1350;
  const mMrp = fertilizerRates?.MOP?.mrpBag ?? 1650;
  const nMrp = fertilizerRates?.NPK123216?.mrpBag ?? 1470;
  const sMrp = fertilizerRates?.SSP?.mrpBag ?? 450;

  const govtRates = [
    { l: lang === 'HI' ? 'यूरिया (45kg)' : 'Urea (45kg)', p: `₹${uMrp}` },
    { l: lang === 'HI' ? 'डीएपी (50kg)' : 'DAP (50kg)', p: `₹${dMrp.toLocaleString('en-IN')}` },
    { l: lang === 'HI' ? 'पोटाश MOP (50kg)' : 'MOP (50kg)', p: `₹${mMrp.toLocaleString('en-IN')}` },
    { l: 'NPK 12:32:16', p: `₹${nMrp.toLocaleString('en-IN')}` },
    { l: 'SSP (50kg)', p: `₹${sMrp.toLocaleString('en-IN')}` },
  ];

  const locLabel = lang === 'HI' ? weatherData?.location || 'आपके क्षेत्र' : weatherData?.locationEn || 'your area';

  return (
    <div className="card-base space-y-5">
      {/* Header & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B5E20]">Live Geospatial Directory · Govt MRP Protected</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {lang === 'HI' ? 'नज़दीकी खाद केंद्र (IFFCO / PACS / वितरक) व सरकारी रेट' : 'Nearby Fertilizer Centres & Official Govt MRP'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">📍 {locLabel} {lang === 'HI' ? 'के आसपास लाइव खोजे गए खाद केंद्र' : '— Live discovered centres'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50">
              <option value="ALL">{lang === 'HI' ? 'सभी खाद केंद्र' : 'All Centres'}</option>
              <option value="GOVT_COOP">{lang === 'HI' ? '🏛️ सरकारी / IFFCO / PACS' : '🏛️ Govt / IFFCO / PACS'}</option>
              <option value="VERIFIED_STOCK">{lang === 'HI' ? '🟢 सत्यापित लाइव स्टॉक (Verified)' : '🟢 Verified Live Stock'}</option>
            </select>
          </div>
          <button onClick={() => setShowAuthModal(true)} className="btn-amber flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> {lang === 'HI' ? 'दुकानदार हैं? स्टॉक जोड़ें' : 'Dealer? List Stock'}
          </button>
        </div>
      </div>

      {/* Dynamic Govt MRP Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs tabular-nums">
        {govtRates.map((r, i) => (
          <div key={i} className={i === 4 ? 'col-span-2 sm:col-span-1' : ''}>
            <div className="text-slate-500 font-semibold">{r.l}</div>
            <div className="text-base font-extrabold text-slate-900">{r.p} <span className="text-[10px] text-[#1B5E20]">MRP</span></div>
          </div>
        ))}
      </div>

      {/* Shops Grid */}
      {filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((s, i) => {
            const key = s.id || s.shopName;
            const isVerified = s.isVerifiedPartner || s.stockStatus === 'VERIFIED_LIVE_STOCK';
            const crowd = crowdReports[key];
            const destLat = s.lat ?? s.latitude;
            const destLng = s.lng ?? s.longitude;

            return (
              <div key={key || i} className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] flex flex-col justify-between space-y-3.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${s.shopType === 'GOVT_COOP' ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-amber-100 text-amber-900'}`}>
                      {s.shopType === 'GOVT_COOP' ? (lang === 'HI' ? '🏛️ सरकारी / PACS' : '🏛️ Govt / Co-op') : (lang === 'HI' ? '🏪 अधिकृत केंद्र' : '🏪 Agri Store')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#061a11] text-white font-extrabold text-xs tabular-nums">{s.distanceKm} km</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{lang === 'HI' ? s.shopName : s.shopNameEn || s.shopName}</h3>
                  <p className="text-[11px] text-slate-600 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /><span>{s.address}</span></p>

                  {/* Honest Stock Display: Verified Live Stock vs Call-to-Verify */}
                  {isVerified ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> {lang === 'HI' ? 'सत्यापित लाइव स्टॉक (Dealer Verified)' : 'Dealer Verified Live Stock'}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] tabular-nums">
                        <div className="p-2 rounded-xl bg-white border"><div className="font-bold text-slate-500">यूरिया</div><div className="font-extrabold text-[#1B5E20]">{s.ureaBagsAvailable} बोरी</div><div className="text-[9px] text-slate-400">₹{uMrp}</div></div>
                        <div className="p-2 rounded-xl bg-white border"><div className="font-bold text-slate-500">DAP</div><div className={`font-extrabold ${s.dapBagsAvailable > 0 ? 'text-[#1B5E20]' : 'text-red-600'}`}>{s.dapBagsAvailable > 0 ? `${s.dapBagsAvailable} बोरी` : 'खत्म'}</div><div className="text-[9px] text-slate-400">₹{dMrp}</div></div>
                        <div className="p-2 rounded-xl bg-white border"><div className="font-bold text-slate-500">MOP</div><div className="font-extrabold text-[#1B5E20]">{s.mopBagsAvailable} बोरी</div><div className="text-[9px] text-slate-400">₹{mMrp}</div></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-2 text-[11px]">
                      <div className="flex items-start gap-1.5 text-amber-900 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{lang === 'HI' ? 'स्टॉक अज्ञात — जाने से पहले कॉल/पुष्टि करें (सरकारी MRP लागू)' : 'Live stock unverified — Call to confirm (Govt MRP applies)'}</span>
                      </div>

                      {/* Crowdsourced 24-Hr Farmer Stock Signal */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                        {crowd ? (
                          <span className={`font-extrabold text-[10px] ${crowd.status === 'IN_STOCK' ? 'text-[#1B5E20]' : 'text-red-700'}`}>
                            {crowd.status === 'IN_STOCK' ? '✅ किसान अपडेट (आज): खाद उपलब्ध है' : '❌ किसान अपडेट (आज): स्टॉक खत्म'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">{lang === 'HI' ? 'क्या आज खाद मिल रही है?' : 'In stock today?'}</span>
                        )}
                        <div className="flex gap-1">
                          <button onClick={() => reportStockSignal(key, 'IN_STOCK')} title="Available" className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" /> हाँ</button>
                          <button onClick={() => reportStockSignal(key, 'OUT_OF_STOCK')} title="Out of stock" className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] flex items-center gap-0.5"><ThumbsDown className="w-3 h-3" /> नहीं</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:${s.contactNumber || '18001801551'}`} className="py-2 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {s.contactNumber ? (lang === 'HI' ? 'कॉल करें' : 'Call Shop') : (lang === 'HI' ? 'हेल्पलाइन' : 'Helpline')}
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`} className="py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {lang === 'HI' ? 'रास्ता देखें' : 'Directions'}
                    </a>
                  </div>
                  {!isVerified && (
                    <button onClick={() => setShowAuthModal(true)} className="w-full text-[10px] font-bold text-slate-500 hover:text-[#1B5E20] text-center pt-0.5">
                      {lang === 'HI' ? '🏪 क्या यह आपकी दुकान है? Claim करें व लाइव स्टॉक डालें →' : '🏪 Own this shop? Claim & publish live stock →'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
) : (
        <div className="p-8 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] text-center space-y-3">
          <Store className="w-10 h-10 text-[#1B5E20] mx-auto" />
          <p className="text-sm font-extrabold text-slate-800">
            {lang === 'HI' ? `${locLabel} के लिए OpenStreetMap पर अभी खाद दुकानें कम दर्ज हैं।` : `Limited OpenStreetMap listings for ${locLabel}.`}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'HI' ? 'आप नीचे क्लिक करके अपने आस-पास की सभी सरकारी (IFFCO/PACS) और प्राइवेट खाद-बीज दुकानें सीधे Google Maps पर देख सकते हैं:' : 'View all nearby govt & private fertilizer shops directly on Google Maps:'}
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/fertilizer+khad+beej+bhandar+IFFCO+near+${encodeURIComponent(locLabel)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            {lang === 'HI' ? `🗺️ Google Maps पर ${locLabel} की सभी खाद दुकानें देखें` : `🗺️ View All Fertilizer Shops near ${locLabel}`}
          </a>
        </div>
      )}
    </div>
  );
}