// src/components/AuthModal.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendOtp, verifyOtp } from '../api/krishicoreApi';
import { X, Phone, Shield, Loader2, AlertCircle, CheckCircle2, Sprout, BadgeCheck, Lock } from 'lucide-react';

const ROLES = [
  { id: 'FARMER', hi: '🌾 किसान', en: '🌾 Farmer', descHi: 'मिट्टी जांच व खाद सलाह', descEn: 'Soil test & advisory' },
  { id: 'DISTRIBUTOR', hi: '🏪 खाद वितरक', en: '🏪 Distributor', descHi: 'दुकान स्टॉक अपडेट करें', descEn: 'Update shop bag stock' },
  { id: 'LAB_OPERATOR', hi: '🔬 मिट्टी लैब', en: '🔬 Soil Lab', descHi: 'किसान को रिपोर्ट भेजें', descEn: 'Push digital SHC report' },
  { id: 'GOVT_ADMIN', hi: '🏛️ कृषि अधिकारी', en: '🏛️ Govt Admin', descHi: 'सरकारी MRP व फसल नियम', descEn: 'Govt MRP & Crop Master' },
];

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, user, login, lang } = useApp();
  const [step, setStep] = useState('mobile');
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [existingHint, setExistingHint] = useState('');
  const [role, setRole] = useState('FARMER');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [villageName, setVillageName] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [orgName, setOrgName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [orgType, setOrgType] = useState('GOVT_COOP');
  const [adminPin, setAdminPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal || user) return null; // Logged-in user cannot re-open login to switch role
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);

  const handleSendOtp = async () => {
    if (!isMobileValid) return setError(lang === 'HI' ? 'सही 10-अंकीय मोबाइल नंबर लिखें' : 'Enter valid 10-digit mobile');
    setError(''); setLoading(true);
    let existing = false, hintName = '';
    try {
      const res = await sendOtp(mobile);
      existing = Boolean(res.isExistingUser);
      hintName = res.existingName || '';
    } catch {
      const localMap = JSON.parse(localStorage.getItem('kc_permanent_accounts_v1') || '{}');
      if (localMap[mobile]) { existing = true; hintName = localMap[mobile].fullName || ''; }
    }
    setIsExistingAccount(existing);
    setExistingHint(hintName);
    setLoading(false);
    setStep('otp');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return setError(lang === 'HI' ? '6 अंकों का OTP लिखें' : 'Enter 6-digit OTP');
    if (!isExistingAccount) {
      if (!fullName.trim()) return setError(lang === 'HI' ? 'अपना पूरा नाम लिखें' : 'Full name required');
      if ((role === 'DISTRIBUTOR' || role === 'LAB_OPERATOR') && (!orgName.trim() || !licenseNumber.trim())) {
        return setError(lang === 'HI' ? 'दुकान/लैब का नाम व लाइसेंस नंबर अनिवार्य है' : 'Org name & license required');
      }
      if (!district.trim() && !pincode.trim()) return setError(lang === 'HI' ? 'ज़िला या पिनकोड लिखें' : 'District or PIN required');
    }
    setLoading(true);
    const profile = {
      role, mobileNumber: mobile, fullName: fullName.trim() || existingHint || 'किसान भाई',
      villageName: villageName.trim(), district: district.trim(), pincode: pincode.trim(),
      orgName: orgName.trim(), licenseNumber: licenseNumber.trim().toUpperCase(), orgType, adminPin
    };
    try {
      const res = await verifyOtp(mobile, otp, profile.fullName, lang, profile);
      login(res.user || profile, res.accessToken || `jwt_${Date.now()}`);
    } catch {
      const localMap = JSON.parse(localStorage.getItem('kc_permanent_accounts_v1') || '{}');
      login(localMap[mobile] || profile, `demo_token_${Date.now()}`);
    } finally { setLoading(false); }
  };

  const resetClose = () => { setShowAuthModal(false); setStep('mobile'); setOtp(''); setError(''); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1B5E20] text-amber-400 flex items-center justify-center"><Sprout className="w-6 h-6" /></div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{lang === 'HI' ? 'कृषिकोर खाता लॉगिन' : 'KrishiCore Account Login'}</h3>
              <p className="text-[11px] text-slate-500">{lang === 'HI' ? 'एक मोबाइल नंबर = एक स्थायी खाता (Lifetime Account)' : 'One Mobile = One Permanent Account'}</p>
            </div>
          </div>
          <button onClick={resetClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

        {step === 'mobile' ? (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">{lang === 'HI' ? '10 अंकों का मोबाइल नंबर दर्ज करें' : 'Enter 10-digit Mobile Number'}</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2.5 rounded-xl bg-slate-100 text-sm font-bold">+91</span>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} placeholder="9876543210" className="input-field" autoFocus />
            </div>
            <button onClick={handleSendOtp} disabled={loading || !isMobileValid} className="w-full py-3 rounded-xl bg-[#1B5E20] text-white font-extrabold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} {lang === 'HI' ? 'आगे बढ़ें व OTP प्राप्त करें' : 'Continue & Get OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{isExistingAccount ? `🙏 स्वागत है ${existingHint || ''}! आपका स्थायी खाता मिल गया — केवल OTP डालकर लॉगिन करें।` : `नया खाता पंजीकरण (+91 ${mobile}) — OTP दर्ज करें`}</span>
            </div>

            <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="6-Digit OTP" className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-extrabold text-center tracking-[0.35em]" autoFocus />

            {/* ONLY show Role & Profile fields for FIRST-TIME registration! */}
            {!isExistingAccount && (
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-amber-600" /> अपनी भूमिका चुनें (एक बार सेव होने के बाद स्थायी रहेगी):</div>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`p-2.5 rounded-2xl border text-left ${role === r.id ? 'border-2 border-[#1B5E20] bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="font-extrabold text-xs text-slate-900">{lang === 'HI' ? r.hi : r.en}</div>
                      <div className="text-[10px] text-slate-500">{lang === 'HI' ? r.descHi : r.descEn}</div>
                    </button>
                  ))}
                </div>

                {(role === 'DISTRIBUTOR' || role === 'LAB_OPERATOR') && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="text-[11px] font-extrabold text-amber-950 flex items-center gap-1"><BadgeCheck className="w-4 h-4" /> केंद्र व लाइसेंस विवरण</div>
                    <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="दुकान / लैब का नाम *" className="input-field bg-white text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="लाइसेंस / PACS ID *" className="input-field bg-white text-xs" />
                      <select value={orgType} onChange={e => setOrgType(e.target.value)} className="input-field bg-white text-xs"><option value="GOVT_COOP">🏛️ सरकारी / PACS</option><option value="PRIVATE">🏪 प्राइवेट</option></select>
                    </div>
                  </div>
                )}

                {role === 'GOVT_ADMIN' && (
                  <input type="password" value={adminPin} onChange={e => setAdminPin(e.target.value)} placeholder="विभागीय एडमिन पिन (2026) *" className="input-field text-xs" />
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="आपका पूरा नाम *" className="input-field text-xs" />
                  <input value={villageName} onChange={e => setVillageName(e.target.value)} placeholder="गाँव / कस्बा" className="input-field text-xs" />
                  <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="ज़िला (District) *" className="input-field text-xs" />
                  <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="पिनकोड *" className="input-field text-xs" />
                </div>
              </div>
            )}

            <button onClick={handleVerify} disabled={loading || otp.length !== 6} className="w-full py-3 rounded-xl bg-[#1B5E20] text-white font-extrabold text-sm flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-amber-300" /> {isExistingAccount ? '🔓 अपने खाते में लॉगिन करें' : '✅ स्थायी खाता बनाएं व लॉगिन करें'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}