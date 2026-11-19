// src/components/TabAdmin.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { geocodeByPincodeOrDistrict, adminPushReportToFarmer } from '../api/krishicoreApi';
import {
  ShieldCheck, Lock, Unlock, Trash2, Save, Store,
  Sprout, Microscope, IndianRupee, MapPin, Send, CheckCircle2, UserCheck
} from 'lucide-react';

export default function TabAdmin() {
  const {
    lang, user, setShowAuthModal,
    fertilizerRates, saveFertilizerRateAdmin,
    cropProfiles, saveCropAdmin, deleteCropAdmin,
    shops, saveShopAdmin, deleteShopAdmin,
    labs, saveLabAdmin, deleteLabAdmin,
    setMetrics, setActiveTab
  } = useApp();

  const userRole = user?.role || 'GUEST';
  const isRoleAuthorized = ['GOVT_ADMIN', 'DISTRIBUTOR', 'LAB_OPERATOR'].includes(userRole);
  const [pinUnlocked, setPinUnlocked] = useState(() => sessionStorage.getItem('kc_admin_pin') === 'true');
  const [pin, setPin] = useState('');
  const [toast, setToast] = useState('');

  // Default active tab based on logged-in role
  const defaultTab = userRole === 'DISTRIBUTOR' ? 'shops' : userRole === 'LAB_OPERATOR' ? 'labs' : 'rates';
  const [sec, setSec] = useState(defaultTab);

  const [rateEdits, setRateEdits] = useState({});
  const [newCrop, setNewCrop] = useState({ code: '', name: '', n: 120, p: 60, k: 40, season: 'KHARIF', idealMaxTemp: 34, maxSowingRainMm: 180 });
  const [newShop, setNewShop] = useState({ shopName: user?.orgName || '', shopType: user?.orgType || 'GOVT_COOP', district: user?.district || '', pincode: user?.pincode || '', address: user?.fullAddress || '', contactNumber: user?.mobileNumber ? `+91${user.mobileNumber}` : '+91', ureaBagsAvailable: 150, dapBagsAvailable: 60, mopBagsAvailable: 40, lat: 28.9845, lng: 77.7064 });
  const [newLab, setNewLab] = useState({ labName: user?.orgName || '', district: user?.district || '', pincode: user?.pincode || '', address: user?.fullAddress || '', contactNumber: '+91', isGovernmentLab: true, lat: 28.9845, lng: 77.7064 });
  const [pushData, setPushData] = useState({ farmerMobile: '', labName: user?.orgName || 'ICAR KVK Soil Lab', ph: 7.4, ec: 0.42, organicCarbon: 0.48, nitrogen: 215, phosphorus: 16, potassium: 170, sulphur: 9.0, zinc: 0.54, iron: 4.6, copper: 0.28, manganese: 2.6, boron: 0.44 });

  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 3200); };

  const autoGps = async (pinCode, dist, setter) => {
    const g = await geocodeByPincodeOrDistrict(pinCode, dist);
    if (g) { setter(p => ({ ...p, lat: g.lat, lng: g.lng })); notify(`📍 GPS Set: ${g.lat.toFixed(3)}, ${g.lng.toFixed(3)}`); }
    else notify('⚠️ पिनकोड या ज़िला नाम सही लिखें');
  };

  if (!isRoleAuthorized && !pinUnlocked) {
    return (
      <div className="max-w-md mx-auto card-base text-center space-y-4 my-6">
        <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-amber-300 flex items-center justify-center mx-auto"><Lock className="w-6 h-6" /></div>
        <h2 className="text-lg font-extrabold text-slate-900">{lang === 'HI' ? 'रोल-आधारित प्रबंधन पोर्टल' : 'Role-Based Management Portal'}</h2>
        <p className="text-xs text-slate-500">{lang === 'HI' ? 'खाद वितरक (Stock Update), मिट्टी लैब (Report Push) या कृषि अधिकारी के रूप में लॉगिन करें अथवा एडमिन पिन (2026) डालें।' : 'Login as Distributor, Soil Lab, or Officer, or enter Admin PIN (2026).'}</p>
        <button onClick={() => setShowAuthModal(true)} className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5">
          <UserCheck className="w-4 h-4" /> {lang === 'HI' ? 'खाद वितरक / लैब / अधिकारी OTP लॉगिन' : 'Distributor / Lab / Officer Login'}
        </button>
        <form onSubmit={e => { e.preventDefault(); if (pin === '2026') { sessionStorage.setItem('kc_admin_pin', 'true'); setPinUnlocked(true); } else notify('❌ गलत पिन (Default: 2026)'); }} className="flex gap-2 pt-2 border-t">
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Admin PIN (2026)" className="input-field text-center text-xs" />
          <button type="submit" className="btn-primary whitespace-nowrap flex items-center gap-1"><Unlock className="w-3.5 h-3.5" /> Unlock</button>
        </form>
      </div>
    );
  }

  const isFullAdmin = pinUnlocked || userRole === 'GOVT_ADMIN';

  return (
    <div className="space-y-5">
      <div className="card-base bg-gradient-to-r from-[#061a11] to-[#1B5E20] text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            {isFullAdmin ? 'GOVT ADMIN (Full Control)' : userRole === 'DISTRIBUTOR' ? `DISTRIBUTOR (${user?.orgName})` : `SOIL LAB (${user?.orgName})`}
          </span>
          <h2 className="text-xl font-extrabold mt-1">{lang === 'HI' ? '⚙️ लाइव डेटा एवं स्टॉक नियंत्रण केंद्र' : '⚙️ Live Data & Stock Command Center'}</h2>
        </div>
        {pinUnlocked && <button onClick={() => { sessionStorage.removeItem('kc_admin_pin'); setPinUnlocked(false); }} className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold">🔒 Lock</button>}
      </div>

      {toast && <div className="p-3 rounded-2xl bg-[#1B5E20] text-amber-300 text-xs font-extrabold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{toast}</div>}

      {/* Role-Gated Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'rates', icon: IndianRupee, label: '1. सरकारी MRP रेट', allowed: isFullAdmin },
          { id: 'crops', icon: Sprout, label: `2. फसल मास्टर (${cropProfiles.length})`, allowed: isFullAdmin },
          { id: 'shops', icon: Store, label: `3. खाद दुकान स्टॉक (${shops.length})`, allowed: isFullAdmin || userRole === 'DISTRIBUTOR' },
          { id: 'labs', icon: Microscope, label: `4. मिट्टी लैब व रिपोर्ट पुश`, allowed: isFullAdmin || userRole === 'LAB_OPERATOR' },
        ].map(t => (
          <button key={t.id} disabled={!t.allowed} onClick={() => setSec(t.id)} className={`p-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 border transition ${sec === t.id ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : t.allowed ? 'bg-white text-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            <t.icon className="w-4 h-4" /><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 1. GOVT MRP RATES (Strictly Admin Only - Prevents Distributor Price Gouging) */}
      {sec === 'rates' && isFullAdmin && (
        <div className="card-base grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(fertilizerRates).map(([code, sp]) => {
            const ed = rateEdits[code] || sp;
            return (
              <div key={code} className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-2">
                <div className="flex justify-between text-xs font-extrabold"><span className="text-[#1B5E20]">{code}</span><span>{sp.name}</span></div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.5" value={ed.mrpBag} onChange={e => setRateEdits({ ...rateEdits, [code]: { ...ed, mrpBag: parseFloat(e.target.value) || 0 } })} className="input-field bg-white text-xs" placeholder="MRP ₹" />
                  <input type="number" value={ed.bagKg} onChange={e => setRateEdits({ ...rateEdits, [code]: { ...ed, bagKg: parseFloat(e.target.value) || 50 } })} className="input-field bg-white text-xs" placeholder="Bag KG" />
                </div>
                <button onClick={() => { saveFertilizerRateAdmin(code, ed); notify(`✅ ${code} का सरकारी MRP ₹${ed.mrpBag} अपडेट हो गया!`); }} className="btn-primary w-full py-2 flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" /> Save Govt MRP</button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. CROP MASTER */}
      {sec === 'crops' && isFullAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form onSubmit={e => { e.preventDefault(); saveCropAdmin(newCrop); notify(`✅ फसल ${newCrop.name} सेव हो गई!`); setNewCrop({ ...newCrop, code: '', name: '' }); }} className="lg:col-span-5 card-base space-y-2.5">
            <h3 className="text-sm font-extrabold">🌱 नई फसल व मौसम नियम जोड़ें</h3>
            <div className="grid grid-cols-2 gap-2">
              <input required value={newCrop.code} onChange={e => setNewCrop({ ...newCrop, code: e.target.value.toUpperCase() })} placeholder="CODE (e.g. BAJRA)" className="input-field text-xs" />
              <select value={newCrop.season} onChange={e => setNewCrop({ ...newCrop, season: e.target.value })} className="input-field bg-white text-xs"><option value="KHARIF">KHARIF (मानसून)</option><option value="RABI">RABI (सर्दी)</option><option value="ZAID">ZAID (गर्मी)</option><option value="ALL_SEASON">ALL_SEASON</option></select>
            </div>
            <input required value={newCrop.name} onChange={e => setNewCrop({ ...newCrop, name: e.target.value, nameEn: e.target.value })} placeholder="फसल नाम व किस्म (उदा. बाजरा — HHB-67)" className="input-field text-xs" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={newCrop.n} onChange={e => setNewCrop({ ...newCrop, n: e.target.value })} placeholder="N kg/ha" className="input-field text-xs" />
              <input type="number" value={newCrop.p} onChange={e => setNewCrop({ ...newCrop, p: e.target.value })} placeholder="P kg/ha" className="input-field text-xs" />
              <input type="number" value={newCrop.k} onChange={e => setNewCrop({ ...newCrop, k: e.target.value })} placeholder="K kg/ha" className="input-field text-xs" />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">➕ फसल जोड़ें</button>
          </form>
          <div className="lg:col-span-7 card-base space-y-2 max-h-96 overflow-y-auto">
            {cropProfiles.map(c => (
              <div key={c.code} className="p-2.5 rounded-xl bg-slate-50 border flex justify-between items-center text-xs">
                <div><b>{c.name}</b> <span className="text-slate-500">({c.season} · NPK {c.n}:{c.p}:{c.k})</span></div>
                <button onClick={() => deleteCropAdmin(c.code)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DISTRIBUTOR SHOP & LIVE BAG STOCK MANAGER */}
      {sec === 'shops' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form onSubmit={e => { e.preventDefault(); saveShopAdmin(newShop); notify(`✅ दुकान "${newShop.shopName}" व स्टॉक लाइव अपडेट हो गया!`); }} className="lg:col-span-5 card-base space-y-2.5">
            <h3 className="text-sm font-extrabold">🏪 खाद केंद्र पंजीकरण व बोरी स्टॉक अपडेट</h3>
            <input required value={newShop.shopName} onChange={e => setNewShop({ ...newShop, shopName: e.target.value })} placeholder="दुकान का नाम *" className="input-field text-xs" />
            <div className="grid grid-cols-3 gap-2">
              <input value={newShop.district} onChange={e => setNewShop({ ...newShop, district: e.target.value })} placeholder="ज़िला *" className="input-field text-xs" />
              <input value={newShop.pincode} onChange={e => setNewShop({ ...newShop, pincode: e.target.value })} placeholder="पिनकोड *" className="input-field text-xs" />
              <button type="button" onClick={() => autoGps(newShop.pincode, newShop.district, setNewShop)} className="btn-amber text-[11px] flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> GPS</button>
            </div>
            <input required value={newShop.address} onChange={e => setNewShop({ ...newShop, address: e.target.value })} placeholder="पूरा पता *" className="input-field text-xs" />
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10px] font-bold">यूरिया बोरी</label><input type="number" value={newShop.ureaBagsAvailable} onChange={e => setNewShop({ ...newShop, ureaBagsAvailable: e.target.value })} className="input-field text-xs" /></div>
              <div><label className="text-[10px] font-bold">DAP बोरी</label><input type="number" value={newShop.dapBagsAvailable} onChange={e => setNewShop({ ...newShop, dapBagsAvailable: e.target.value })} className="input-field text-xs" /></div>
              <div><label className="text-[10px] font-bold">MOP बोरी</label><input type="number" value={newShop.mopBagsAvailable} onChange={e => setNewShop({ ...newShop, mopBagsAvailable: e.target.value })} className="input-field text-xs" /></div>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">➕ स्टॉक पब्लिश करें (Govt MRP Locked)</button>
          </form>
          <div className="lg:col-span-7 card-base space-y-2 max-h-96 overflow-y-auto">
            {shops.map((s, i) => (
              <div key={s.id || i} className="p-3 rounded-xl bg-slate-50 border space-y-2 text-xs">
                <div className="flex justify-between font-extrabold"><span>{s.shopName} ({s.district})</span>{isFullAdmin && <button onClick={() => deleteShopAdmin(s.id || s.shopName)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>}</div>
                <div className="grid grid-cols-3 gap-2">
                  {['ureaBagsAvailable', 'dapBagsAvailable', 'mopBagsAvailable'].map((k, idx) => (
                    <div key={k} className="bg-white px-2 py-1 rounded border flex justify-between items-center">
                      <span className="text-[10px] font-bold">{idx === 0 ? 'Urea:' : idx === 1 ? 'DAP:' : 'MOP:'}</span>
                      <input type="number" value={s[k]} onChange={e => saveShopAdmin({ ...s, [k]: e.target.value })} className="w-14 font-extrabold text-right text-emerald-800" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SOIL LAB REGISTRATION & FARMER DIGITAL SHC PUSH */}
      {sec === 'labs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form onSubmit={e => { e.preventDefault(); saveLabAdmin(newLab); notify(`✅ लैब "${newLab.labName}" सेव हो गई!`); }} className="lg:col-span-5 card-base space-y-2.5">
            <h3 className="text-sm font-extrabold">🔬 नई मिट्टी जांच लैब पंजीकृत करें</h3>
            <input required value={newLab.labName} onChange={e => setNewLab({ ...newLab, labName: e.target.value })} placeholder="लैब का नाम *" className="input-field text-xs" />
            <div className="grid grid-cols-3 gap-2">
              <input value={newLab.district} onChange={e => setNewLab({ ...newLab, district: e.target.value })} placeholder="ज़िला *" className="input-field text-xs" />
              <input value={newLab.pincode} onChange={e => setNewLab({ ...newLab, pincode: e.target.value })} placeholder="पिनकोड *" className="input-field text-xs" />
              <button type="button" onClick={() => autoGps(newLab.pincode, newLab.district, setNewLab)} className="btn-amber text-[11px]">📍 GPS</button>
            </div>
            <input required value={newLab.address} onChange={e => setNewLab({ ...newLab, address: e.target.value })} placeholder="पूरा पता *" className="input-field text-xs" />
            <button type="submit" className="btn-primary w-full py-2.5">➕ लैब जोड़ें</button>
          </form>

          <form onSubmit={e => { e.preventDefault(); adminPushReportToFarmer(pushData).catch(() => {}); setMetrics({ ph: +pushData.ph, ec: +pushData.ec, organicCarbon: +pushData.organicCarbon, nitrogen: +pushData.nitrogen, phosphorus: +pushData.phosphorus, potassium: +pushData.potassium, sulphur: +pushData.sulphur, zinc: +pushData.zinc, iron: +pushData.iron, copper: +pushData.copper, manganese: +pushData.manganese, boron: +pushData.boron }); notify('✅ किसान के डैशबोर्ड पर 12-तत्वों की रिपोर्ट पुश हो गई!'); setActiveTab('workspace'); }} className="lg:col-span-7 card-base space-y-2.5">
            <h3 className="text-sm font-extrabold flex items-center gap-1.5"><Send className="w-4 h-4 text-emerald-700" /> किसान के मोबाइल पर डिजिटल मृदा रिपोर्ट पुश करें</h3>
            <input value={pushData.farmerMobile} onChange={e => setPushData({ ...pushData, farmerMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="किसान का 10-अंकीय मोबाइल नंबर" className="input-field text-xs" />
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {['ph', 'ec', 'organicCarbon', 'nitrogen', 'phosphorus', 'potassium', 'sulphur', 'zinc', 'iron', 'copper', 'manganese', 'boron'].map(k => (
                <div key={k} className="p-1.5 rounded-lg bg-slate-50 border"><label className="text-[9px] font-bold uppercase text-slate-500 block">{k}</label><input type="number" step="0.05" value={pushData[k]} onChange={e => setPushData({ ...pushData, [k]: e.target.value })} className="w-full font-extrabold text-xs bg-transparent" /></div>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full py-2.5">📤 रिपोर्ट किसान को भेजें व सलाह अपडेट करें</button>
          </form>
        </div>
      )}
    </div>
  );
}