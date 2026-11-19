// src/components/TrustAndFooter.jsx
import { useApp } from '../context/AppContext';
import { Microscope, Sprout, CloudRain, Users, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function TrustAndFooter() {
  const { lang, setActiveTab, weatherData } = useApp();

  const stats = [
    { num: '28+', labelHi: 'राज्यों व केंद्रशासित प्रदेशों में लाइव जीपीएस कवरेज', labelEn: 'States & UTs with active live GPS coverage' },
    { num: '12', labelHi: 'मृदा स्वास्थ्य कार्ड पोषक तत्वों का सटीक विश्लेषण', labelEn: 'Soil Health Card parameters analyzed' },
    { num: '15+', labelHi: 'कृषि-जलवायु ज़ोन व मौसम आधारित फसल नियम', labelEn: 'Agro-climatic zones & monsoon crop rules' },
    { num: '100%', labelHi: 'निष्पक्ष सरकारी खाद रेट (MRP) — शून्य ब्रांड प्रचार', labelEn: 'Unbiased Govt MRP advisory — Zero brand bias' },
  ];

  const pillars = [
    { icon: Microscope, titleHi: '12-तत्व मृदा रसायन', titleEn: '12-Parameter Soil Chemistry', descHi: 'pH, EC, जैविक कार्बन, NPK व सूक्ष्म तत्वों (Zn, Fe, B, S) की वैज्ञानिक जांच।', descEn: 'Calibrated across pH, OC, EC, primary NPK and critical micronutrients.' },
    { icon: Sprout, titleHi: 'क्षेत्रीय फसल परीक्षण', titleEn: 'Zonal Crop Suitability', descHi: 'खरीफ, रबी और जायद ऋतु के अनुसार भारत के हर कृषि क्षेत्र के लिए अनुकूलित।', descEn: 'Replicated across Indian agro-climatic zones for Kharif, Rabi & Zaid.' },
    { icon: CloudRain, titleHi: '16-दिवसीय मानसून गेटकीपिंग', titleEn: '16-Day Monsoon Gatekeeping', descHi: 'भारी बारिश की चेतावनी पर यूरिया बहाव और संवेदनशील बीजों की बुवाई से सुरक्षा।', descEn: 'Prevents urea leaching and seed rot during heavy rain windows.' },
    { icon: Users, titleHi: 'KVK व PACS नेटवर्क', titleEn: 'Field Agronomy & PACS', descHi: 'सीधे नज़दीकी इफको, कृभको, PACS और कृषि विज्ञान केंद्र (KVK) से जुड़ाव।', descEn: 'Connected directly with farmers, FPOs, PACS cooperatives and KVK labs.' },
  ];

  const growers = [
    {
      quoteHi: '“मिट्टी जांच के बाद कृषिकोर ने बताया कि मेरे खेत में जिंक की कमी है और डीएपी की जगह SSP डालने से सल्फर भी मिल जाएगा। प्रति एकड़ ₹1,400 की सीधी बचत हुई।”',
      quoteEn: '“KrishiCore flagged low Zinc in my plot and suggested SSP + Urea split dosing instead of overpriced mixes. Saved ₹1,400 per acre with heavier cotton bolls.”',
      name: 'Rameshbhai Patel',
      meta: 'Cotton & Groundnut Grower · 18 Acres · Mehsana, Gujarat',
    },
    {
      quoteHi: '“16-दिन के लाइव मौसम अलर्ट ने बेमौसम बारिश से पहले यूरिया टॉप-ड्रेसिंग रुकवा दी। गुंठा से एकड़ कैलकुलेटर महाराष्ट्र के किसानों के लिए एकदम सटीक है।”',
      quoteEn: '“The 16-day rain-gated spray calendar saved our fertilizer from washing away. The Guntha-to-Acre dosage calculator is spot on for Maharashtra farms.”',
      name: 'Anita Deshmukh',
      meta: 'Soybean & Grape Grower · 12 Acres · Nashik, Maharashtra',
    },
    {
      quoteHi: '“PACS और KVK लैब लोकेटर से हमारे FPO के किसानों को सरकारी रेट (₹266.50 यूरिया) की दुकान और मुफ्त मिट्टी जांच केंद्र एक क्लिक में मिल जाता है।”',
      quoteEn: '“With live KVK lab discovery and 3-stage split schedules, our FPO members eliminated fertilizer over-application and boosted paddy tiller growth.”',
      name: 'K. Srinivasan',
      meta: 'FPO Lead · Krishi Mitra · Coimbatore, Tamil Nadu',
    },
  ];

  return (
    <div className="space-y-12 mt-12">
      {/* 1. SCREENSHOT 1 & 2: Dark Impact Strip + "From Soil Card to Monsoon" R&D Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="bg-[#061a11] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-emerald-900/60">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight tabular-nums">{s.num}</div>
                <p className="text-xs sm:text-sm text-emerald-200/80 font-medium">{lang === 'HI' ? s.labelHi : s.labelEn}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1B5E20]">AGRONOMY + AI INNOVATION</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {lang === 'HI' ? <>मृदा कार्ड से <span className="italic font-serif text-[#1B5E20]">मानसून तक।</span></> : <>From soil card to <span className="italic font-serif text-[#1B5E20]">monsoon.</span></>}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {lang === 'HI'
                ? 'कृषिकोर का इंजन मृदा रसायन, लाइव उपग्रह मौसम और ICAR के मानकों को मिलाकर हर खेत के लिए 100% निष्पक्ष उर्वरक और फसल सलाह तैयार करता है।'
                : 'Our agronomic engine combines soil chemistry, 16-day satellite meteorology, and ICAR nutrient curves—proven on Indian soil across every season.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button onClick={() => { setActiveTab('labs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-5 py-3 rounded-full bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm">
                <span>{lang === 'HI' ? 'नज़दीकी मिट्टी लैब देखें' : 'Inside Nearby Soil Labs'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => { setActiveTab('calculator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-4 py-3 text-xs font-extrabold text-[#1B5E20] hover:underline">
                {lang === 'HI' ? 'खेत रकबा कैलकुलेटर खोलें' : 'Open Field Area Calculator'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <div key={i} className="p-5 rounded-3xl bg-white border border-[#E2E8D8] shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900">{lang === 'HI' ? p.titleHi : p.titleEn}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{lang === 'HI' ? p.descHi : p.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SCREENSHOT 3: "What growers say after harvest." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#1B5E20]">FROM THE FIELD · PAN-INDIA</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            {lang === 'HI' ? <>फसल कटाई के बाद <span className="italic font-serif text-[#1B5E20]">किसानों की राय।</span></> : <>What growers say <span className="italic font-serif text-[#1B5E20]">after harvest.</span></>}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {growers.map((g, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-[#E2E8D8] shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="text-amber-500 text-sm tracking-widest">★★★★★</div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{lang === 'HI' ? g.quoteHi : g.quoteEn}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B5E20] text-amber-300 font-extrabold text-sm flex items-center justify-center">
                  {g.name[0]}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{g.name}</div>
                  <div className="text-[11px] text-slate-500">{g.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SCREENSHOT 4 & 5: Dark Advisory Desk & Certified Enterprise Footer */}
      <footer className="bg-[#06120c] text-emerald-100/80 pt-12 pb-24 lg:pb-12 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Advisory Desk CTA Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0a1f14] to-[#0f2e1e] border border-emerald-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/70 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                🌱 ADVISORY DESK
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {lang === 'HI' ? 'ऋतु के अनुसार फसल कैलेंडर, बारिश अलर्ट और स्प्रे विंडो।' : 'Crop calendars, rain alerts and spray windows matched to the season.'}
              </h3>
              <p className="text-xs text-emerald-200/75">
                {lang === 'HI' ? 'किसानों, खाद वितरकों (PACS/IFFCO) और मिट्टी जांच प्रयोगशालाओं के लिए एकीकृत डिजिटल प्लेटफॉर्म।' : 'Practical agronomic intelligence for progressive growers, PACS distributors, and KVK soil labs.'}
              </p>
            </div>
            <button onClick={() => { setActiveTab('workspace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs whitespace-nowrap shadow-md">
              {lang === 'HI' ? 'अभी मिट्टी कार्ड स्कैन करें →' : 'Scan Soil Card Now →'}
            </button>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-emerald-900/40 text-xs">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1B5E20] text-amber-400 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base tracking-tight">KRISHICORE.</div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest">PAN-INDIA AGRITECH PUBLIC UTILITY</div>
                </div>
              </div>
              <p className="text-emerald-200/70 leading-relaxed max-w-sm">
                {lang === 'HI' ? 'मृदा स्वास्थ्य कार्ड, क्षेत्रीय खेत माप और सरकारी सब्सिडी उर्वरक गणना के लिए भारत का 100% निष्पक्ष किसान सहायक।' : 'Unbiased precision soil health assessment, regional land unit conversion, and subsidized fertilizer calculation across India.'}
              </p>
              <div className="space-y-1.5 pt-1 text-emerald-200/90">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> <span>Kisan Call Center: 1800-180-1551 (Toll-Free)</span></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-400" /> <span>advisory@krishicore.in</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> <span>Active Region: {weatherData?.location || 'Pan-India Live GPS'}</span></div>
              </div>
              <div className="pt-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-2">STANDARDS & COMPLIANCE</div>
                <div className="flex flex-wrap gap-1.5">
                  {['ICAR-SHC', 'FCO 1985', 'IFFCO/PACS MRP', 'OPEN-METEO', 'WCAG AAA', '2G PWA'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-[10px] font-bold text-emerald-200">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-white">MODULES</div>
              <ul className="space-y-1.5 text-emerald-200/75">
                <li><button onClick={() => setActiveTab('workspace')} className="hover:text-white">• AI Soil Health Card OCR</button></li>
                <li><button onClick={() => setActiveTab('calculator')} className="hover:text-white">• Pan-India Area & Bag Calculator</button></li>
                <li><button onClick={() => setActiveTab('shops')} className="hover:text-white">• Live PACS / IFFCO Stock Locator</button></li>
                <li><button onClick={() => setActiveTab('labs')} className="hover:text-white">• Geospatial KVK Soil Testing Labs</button></li>
                <li><button onClick={() => setActiveTab('admin')} className="hover:text-white">• Distributor & Lab Operator Portal</button></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-white">PAN-INDIA AGRO ZONES</div>
              <p className="text-emerald-200/70 leading-relaxed">
                Supports regional land units across all states: <b>Acre, Hectare, Guntha</b> (Maharashtra, Gujarat, Karnataka), <b>Kanal / Killa</b> (Punjab, Haryana, J&K), <b>Pakka & Kaccha Bigha</b> (UP, Bihar, Rajasthan, MP), and <b>Cent</b> (Tamil Nadu, Kerala, AP).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-emerald-300/60">
            <span>© {new Date().getFullYear()} KrishiCore Precision Agriculture Platform. 100% Unbiased Farmer Advisory.</span>
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/50 text-emerald-300 font-bold">🌱 Proudly Built for Indian Farmers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}