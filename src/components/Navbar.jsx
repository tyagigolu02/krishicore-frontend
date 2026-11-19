// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, User, LogOut, Globe, ChevronDown, Settings, Phone, MapPin, ShieldCheck } from 'lucide-react';

const ROLE_LABELS_HI = { FARMER: 'किसान खाता', DISTRIBUTOR: 'खाद वितरक', LAB_OPERATOR: 'मिट्टी जांच लैब', GOVT_ADMIN: 'कृषि अधिकारी' };

export default function Navbar() {
  const { activeTab, setActiveTab, user, setShowAuthModal, logout, lang, setLang } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const isPartner = user && ['DISTRIBUTOR', 'LAB_OPERATOR', 'GOVT_ADMIN'].includes(user.role);
  const tabs = [
    { id: 'workspace', hi: '🧪 1. जांच व सलाह', en: '🧪 1. Soil & Advisory' },
    { id: 'calculator', hi: '📐 2. खेत/खाद कैलकुलेटर', en: '📐 2. Area Calculator' },
    { id: 'shops', hi: '🏪 3. खाद दुकान व स्टॉक', en: '🏪 3. Fertilizer Shops' },
    { id: 'labs', hi: '🔬 4. मिट्टी जांच लैब्स', en: '🔬 4. Soil Testing Labs' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('workspace')}>
          <div className="w-10 h-10 rounded-xl bg-[#1B5E20] text-amber-400 flex items-center justify-center shadow-sm"><Sprout className="w-6 h-6" /></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">KRISHICORE</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20]">Pan-India</span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">AI Soil Scanner · Live Weather Crop Engine</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3.5 py-2 rounded-xl text-xs transition ${activeTab === t.id ? 'font-extrabold text-white bg-[#1B5E20] shadow-sm' : 'font-bold text-slate-600 hover:bg-slate-100'}`}>
              {lang === 'HI' ? t.hi : t.en}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'HI' ? 'EN' : 'HI')} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> {lang === 'HI' ? 'EN' : 'हिंदी'}
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              {/* ONLY User Name displayed — Click to view details or logout */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="px-3.5 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-emerald-100 text-[#1B5E20] text-xs font-extrabold flex items-center gap-2 border border-emerald-200">
                <span className="w-6 h-6 rounded-full bg-[#1B5E20] text-amber-300 flex items-center justify-center text-[11px] font-extrabold">
                  {(user.fullName || 'U')[0].toUpperCase()}
                </span>
                <span className="max-w-[110px] truncate">{user.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 z-50 text-xs">
                  <div className="border-b border-slate-100 pb-2.5 space-y-1">
                    <div className="font-extrabold text-sm text-slate-900">{user.fullName}</div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#1B5E20] font-bold text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> {ROLE_LABELS_HI[user.role] || 'किसान खाता'} (स्थायी खाता)
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5 pt-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> +91 {user.mobileNumber}</div>
                    {(user.villageName || user.district) && (
                      <div className="text-slate-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {[user.villageName, user.district, user.pincode].filter(Boolean).join(', ')}</div>
                    )}
                    {user.orgName && <div className="text-amber-800 font-bold pt-0.5">🏢 {user.orgName} ({user.licenseNumber})</div>}
                  </div>

                  {isPartner && (
                    <button onClick={() => { setActiveTab('admin'); setMenuOpen(false); }} className="w-full py-2 px-3 rounded-xl bg-[#1B5E20] text-white font-extrabold flex items-center justify-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-amber-300" /> {lang === 'HI' ? 'पार्टनर प्रबंधन पोर्टल खोलें' : 'Open Partner Portal'}
                    </button>
                  )}

                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold flex items-center justify-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5" /> {lang === 'HI' ? 'लॉगआउट करें' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-300" />
              <span>{lang === 'HI' ? 'लॉगिन करें' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}