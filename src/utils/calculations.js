// src/utils/calculations.js
import { DEFAULT_CROP_PROFILES, DEFAULT_FERTILIZER_RATES } from '../data/fallbackData';

export function convertToAcres(val, unit) {
  const v = Math.max(0, parseFloat(val) || 0);
  const map = { ACRE: 1, HECTARE: 2.47105, PAKKA_BIGHA: 0.625, KACCHA_BIGHA: 1 / 4.8, GUNTHA: 1 / 40, KANAL: 1 / 8, BISWA: 1 / 32, CENT: 1 / 100 };
  return v * (map[unit] || 1);
}

export function getAreaBreakdown(acres) {
  const a = Math.max(0.01, Number(acres) || 0);
  return {
    acres: a.toFixed(2), hectares: (a / 2.47105).toFixed(2),
    sqft: Math.round(a * 43560).toLocaleString('en-IN'),
    kacchaBigha: (a * 4.8).toFixed(1), pakkaBigha: (a * 1.6).toFixed(2),
    guntha: (a * 40).toFixed(1), kanal: (a * 8).toFixed(1), biswa: (a * 32).toFixed(1),
  };
}

export function calculateFromDimensions(length, width, unit) {
  const l = parseFloat(length) || 0, w = parseFloat(width) || 0;
  let sqft = l * w;
  if (unit === 'METER') sqft = l * 3.28084 * (w * 3.28084);
  if (unit === 'GATTA') sqft = l * 8.25 * (w * 8.25);
  const acres = sqft / 43560;
  return { sqft: Math.round(sqft), acres, kaccha: acres * 4.8, guntha: acres * 40 };
}

function buildCropApplicationTimeline(cropCode, phosSource, phosKg, mopKg, ureaKg, znKg, varNote) {
  const code = String(cropCode || 'WHEAT').toUpperCase();
  const znHi = znKg > 0 ? ` + ${znKg.toFixed(1)} kg जिंक सल्फेट` : '';
  const znEn = znKg > 0 ? ` + ${znKg.toFixed(1)} kg Zinc` : '';

  // 1. DALHAN / PULSES (Chana, Matar, Masoor, Moong, Soybean, Tur) -> 100% Basal!
  if (['CHICKPEA', 'PEA', 'LENTIL', 'MOONG', 'SOYBEAN', 'TUR_ARHAR', 'GROUNDNUT'].includes(code)) {
    return [
      {
        stageHi: 'बुवाई के समय (100% संपूर्ण खाद · Day 0)', stageEn: 'Sowing · 100% Basal (Day 0)',
        detailHi: `दलहनी फसल में पूरी खाद बुवाई पर दें: ${phosSource} (${phosKg.toFixed(1)} kg) + MOP (${mopKg.toFixed(1)} kg) + यूरिया (${ureaKg.toFixed(1)} kg)${znHi} बीज के नीचे ड्रिल करें।`,
        detailEn: `Apply 100% ${phosSource} (${phosKg.toFixed(1)} kg) + MOP + starter Urea (${ureaKg.toFixed(1)} kg)${znEn} at sowing.`
      },
      {
        stageHi: 'पहली हल्की सिंचाई · फूल आने से पहले (40–45 दिन)', stageEn: 'Pre-Flowering Irrigation (40–45 Days)',
        detailHi: 'दलहन में ऊपर से यूरिया न डालें (पत्ते बढ़ेंगे, फलियां कम होंगी)। केवल हल्की सिंचाई करें।',
        detailEn: 'Do NOT top-dress Urea on pulses. Give light irrigation before flowering.'
      },
      {
        stageHi: 'फली भरने की अवस्था (70–75 दिन)', stageEn: 'Pod-Filling Stage (70–75 Days)',
        detailHi: 'नमी कम हो तो दूसरी हल्की सिंचाई करें; बेहतर दाने के लिए 2% DAP या NPK 0:52:34 का पर्णीय छिड़काव करें।',
        detailEn: 'Give light irrigation if dry; optional foliar spray of 2% DAP/NPK for bold grains.'
      }
    ];
  }

  // 2. SUGARCANE (10-12 Month Long Crop)
  if (code === 'SUGARCANE') {
    const u3 = (ureaKg / 3).toFixed(1);
    return [
      {
        stageHi: 'बुवाई / नाली में (Basal · Day 0)', stageEn: 'Planting Furrow (Day 0)',
        detailHi: `100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP (${mopKg.toFixed(1)} kg) + 1/3 यूरिया (${u3} kg)${varNote} नालियों में डालें।`,
        detailEn: `Apply 100% ${phosSource} + MOP + 1/3 Urea (${u3} kg) in furrows at planting.`
      },
      {
        stageHi: 'कल्ले फूटने पर (45–50 दिन · 2री सिंचाई)', stageEn: 'Tillering Stage (45–50 Days)',
        detailHi: `1/3 यूरिया (${u3} kg)${znHi} निराई-गुड़ाई के बाद सिंचाई कर डालें।`,
        detailEn: `Apply 1/3 Urea (${u3} kg)${znEn} after weeding & irrigation.`
      },
      {
        stageHi: 'मिट्टी चढ़ाने पर (90–110 दिन · मानसून से पहले)', stageEn: 'Earthing-Up Stage (90–110 Days)',
        detailHi: `शेष 1/3 यूरिया (${u3} kg) जड़ों के पास देकर मिट्टी चढ़ाएं। इसके बाद यूरिया न दें (चीनी रिकवरी घटती है)।`,
        detailEn: `Apply final 1/3 Urea (${u3} kg) during earthing-up. Stop N after 120 days.`
      }
    ];
  }

  // 3. POTATO / ONION / GARLIC / TOMATO (Vegetables -> 50% Basal + 50% Earthing-Up)
  if (['POTATO', 'ONION', 'GARLIC', 'TOMATO'].includes(code)) {
    const uHalf = (ureaKg / 2).toFixed(1);
    return [
      {
        stageHi: 'बुवाई / रोपाई के समय (Basal · Day 0)', stageEn: 'Planting / Transplanting (Day 0)',
        detailHi: `100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP (${mopKg.toFixed(1)} kg) + आधी यूरिया (${uHalf} kg)${znHi} क्यारी में मिलाएं।`,
        detailEn: `Incorporate 100% ${phosSource} + MOP + 50% Urea (${uHalf} kg)${znEn} before planting.`
      },
      {
        stageHi: 'पहली सिंचाई व मिट्टी चढ़ाना (25–30 दिन)', stageEn: 'Earthing-Up & Top-Dress (25–30 Days)',
        detailHi: `शेष आधी यूरिया (${uHalf} kg) जड़ों से दूर डालकर मिट्टी चढ़ाएं। हर 8–12 दिन पर हल्की सिंचाई करें।`,
        detailEn: `Side-dress remaining 50% Urea (${uHalf} kg) at earthing-up. Irrigate lightly every 8–12 days.`
      },
      {
        stageHi: 'कंद / फल विकास अवस्था (50–60 दिन)', stageEn: 'Tuber / Bulb / Fruit Bulking (50–60 Days)',
        detailHi: 'यूरिया बंद करें। चमकदार व बड़े कंद/फल के लिए पोटाश (0:0:50) का स्प्रे करें और जलभराव से बचाएं।',
        detailEn: 'Stop Urea. Optional 0:0:50 foliar spray for size & quality; avoid waterlogging.'
      }
    ];
  }

  // 4. MUSTARD (Oilseed -> 50% Basal + 50% at 30-35d)
  if (code === 'MUSTARD') {
    const uHalf = (ureaKg / 2).toFixed(1);
    return [
      {
        stageHi: 'बुवाई के समय (Basal · Day 0)', stageEn: 'Sowing · Basal (Day 0)',
        detailHi: `100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP (${mopKg.toFixed(1)} kg) + आधी यूरिया (${uHalf} kg) + सल्फर डालें।`,
        detailEn: `Apply 100% ${phosSource} + MOP + 50% Urea (${uHalf} kg) + Sulphur at sowing.`
      },
      {
        stageHi: 'पहली सिंचाई · शाखाएं निकलना (30–35 दिन)', stageEn: '1st Irrigation · Branching (30–35 Days)',
        detailHi: `शेष आधी यूरिया (${uHalf} kg)${znHi} पहली सिंचाई के तुरंत बाद छिड़कें।`,
        detailEn: `Top-dress remaining 50% Urea (${uHalf} kg)${znEn} right after 1st irrigation.`
      },
      {
        stageHi: 'फली बनना (60–65 दिन · दूसरी सिंचाई)', stageEn: 'Siliqua / Pod Stage (60–65 Days)',
        detailHi: 'हल्की सिंचाई करें (पाले से बचाव होगा)। माहू (चेपा) की निगरानी रखें।',
        detailEn: 'Give 2nd light irrigation to protect against frost; monitor for aphids.'
      }
    ];
  }

  // 5. PADDY (Transplanted Kharif Cereal)
  if (code === 'PADDY') {
    const u3 = (ureaKg / 3).toFixed(1);
    return [
      {
        stageHi: 'रोपाई / कद्दू के समय (Day 0)', stageEn: 'Puddling / Transplanting (Day 0)',
        detailHi: `100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP (${mopKg.toFixed(1)} kg) + 1/3 यूरिया (${u3} kg) आखिरी कद्दू पर मिलाएं।`,
        detailEn: `Apply 100% ${phosSource} + MOP + 1/3 Urea (${u3} kg) at final puddling.`
      },
      {
        stageHi: 'कल्ले फूटने की अवस्था (20–25 दिन)', stageEn: 'Active Tillering (20–25 Days)',
        detailHi: `खेत का पानी निकालकर 1/3 यूरिया (${u3} kg)${znHi} डालें; 24 घंटे बाद पानी भरें।`,
        detailEn: `Drain standing water, apply 1/3 Urea (${u3} kg)${znEn}, re-flood after 24 hrs.`
      },
      {
        stageHi: 'बाली बनना / गभोट अवस्था (45–50 दिन)', stageEn: 'Panicle Initiation (45–50 Days)',
        detailHi: `अंतिम 1/3 यूरिया (${u3} kg) डालें और फूल आने तक 2–3 सेमी पानी बनाए रखें।`,
        detailEn: `Apply final 1/3 Urea (${u3} kg); maintain 2–3 cm moisture through flowering.`
      }
    ];
  }

  // 6. DEFAULT: WHEAT / BARLEY / MAIZE / COTTON / BAJRA (3-Split Cereal/Fibre)
  const u3 = (ureaKg / 3).toFixed(1);
  return [
    {
      stageHi: 'बुवाई के समय (Basal · Day 0)', stageEn: 'Basal Dose · Sowing (Day 0)',
      detailHi: `100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP (${mopKg.toFixed(1)} kg) + 1/3 यूरिया (${u3} kg)${varNote} के लिए ड्रिल करें।`,
      detailEn: `Drill 100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP + 1/3 Urea (${u3} kg) at sowing.`
    },
    {
      stageHi: 'पहला पानी · जड़ अवस्था / CRI (21–25 दिन)', stageEn: 'First Irrigation · CRI (21–25 Days)',
      detailHi: `1/3 यूरिया (${u3} kg)${znHi} पहली सिंचाई के बाद ओट आने पर डालें।`,
      detailEn: `Top-dress 1/3 Urea (${u3} kg)${znEn} after 1st irrigation.`
    },
    {
      stageHi: 'दूसरा पानी · कल्ले फूटना (45–50 दिन)', stageEn: 'Second Irrigation · Tillering (45–50 Days)',
      detailHi: `शेष 1/3 यूरिया (${u3} kg) डालें। बारिश की चेतावनी पर छिड़काव रोकें।`,
      detailEn: `Broadcast remaining 1/3 Urea (${u3} kg). Hold if heavy rain forecast.`
    }
  ];
}

// DB-Driven ICAR Fertilizer Plan + Seed Variety Multiplier + 3-Stage Split Schedule
export function computeFertilizerPlan(metrics, cropProfile, totalAcres, phosSource, fertilizerRates, varietySpec = null) {
  const m = metrics || {};
  const crop = cropProfile || DEFAULT_CROP_PROFILES[0];
  const rates = { ...DEFAULT_FERTILIZER_RATES, ...(fertilizerRates || {}) };
  const scale = (v, low, high, base) => (v < low ? base * 1.25 : v > high ? base * 0.75 : base);
  const vFactor = Number(varietySpec?.npkFactor ?? 1.0);
  const acres = Math.max(0.05, Number(totalAcres) || 1);

  const totalReqN = (scale(m.nitrogen, 280, 560, Number(crop.n ?? 120)) * vFactor / 2.47105) * acres;
  const totalReqP = (scale(m.phosphorus, 10, 25, Number(crop.p ?? 60)) * vFactor / 2.47105) * acres;
  const totalReqK = (scale(m.potassium, 108, 280, Number(crop.k ?? 40)) * vFactor / 2.47105) * acres;

  const phosSpec = rates[phosSource] || rates.DAP;
  const ureaSpec = rates.UREA || DEFAULT_FERTILIZER_RATES.UREA;
  const mopSpec = rates.MOP || DEFAULT_FERTILIZER_RATES.MOP;

  const phosKg = totalReqP * (100 / Math.max(1, Number(phosSpec.p ?? 46)));
  const suppliedN = phosKg * (Number(phosSpec.n ?? 18) / 100);
  const suppliedK = phosKg * (Number(phosSpec.k ?? 0) / 100);
  const phosBags = phosKg / Math.max(1, Number(phosSpec.bagKg || 50));
  const phosCost = phosBags * Number(phosSpec.mrpBag || 1350);

  const ureaKg = Math.max(0, totalReqN - suppliedN) * (100 / Math.max(1, Number(ureaSpec.n ?? 46)));
  const ureaBags = ureaKg / Math.max(1, Number(ureaSpec.bagKg || 45));
  const ureaCost = ureaBags * Number(ureaSpec.mrpBag || 266.5);

  const mopKg = Math.max(0, totalReqK - suppliedK) * (100 / Math.max(1, Number(mopSpec.k ?? 60)));
  const mopBags = mopKg / Math.max(1, Number(mopSpec.bagKg || 50));
  const mopCost = mopBags * Number(mopSpec.mrpBag || 1650);

  const znKg = (m.zinc < 0.6 ? 10.0 : 0.0) * acres;
  const znCost = (znKg / 10) * Number(rates.ZINC_SULPHATE?.mrpBag || 480);
  const sKg = (m.sulphur < 10.0 && phosSource !== 'SSP' ? 10.0 : 0.0) * acres;
  const sCost = (sKg / 10) * Number(rates.BENTONITE_SULPHUR?.mrpBag || 380);
  const gypsumKg = (m.ph > 8.0 ? 250.0 : 0.0) * acres;
  const gypsumBags = Math.ceil(gypsumKg / Number(rates.GYPSUM?.bagKg || 50));
  const gypsumCost = gypsumBags * Number(rates.GYPSUM?.mrpBag || 220);

  const splitUrea = (ureaKg / 3).toFixed(1);
  const varNote = varietySpec ? ` (${varietySpec.nameHi})` : '';
  const applicationTimeline = buildCropApplicationTimeline(crop.code, phosSource, phosKg, mopKg, ureaKg, znKg, varNote);

  return {
    crop, variety: varietySpec,
    ureaKg: ureaKg.toFixed(1), ureaBags: ureaBags.toFixed(1), ureaCost: Math.round(ureaCost),
    phosFertName: phosSpec.name, phosFertNameEn: phosSpec.nameEn,
    phosKg: phosKg.toFixed(1), phosBags: phosBags.toFixed(1), phosCost: Math.round(phosCost),
    mopKg: mopKg.toFixed(1), mopBags: mopBags.toFixed(1), mopCost: Math.round(mopCost),
    znKg: znKg.toFixed(1), znCost: Math.round(znCost), sKg: sKg.toFixed(1), sCost: Math.round(sCost),
    gypsumKg: gypsumKg.toFixed(0), gypsumBags, gypsumCost: Math.round(gypsumCost),
    totalCost: Math.round(ureaCost + phosCost + mopCost + znCost + sCost + gypsumCost),
    applicationTimeline
  };
}

export function computeRemedies(metrics, totalAcres, phosSource, plan) {
  const r = [];
  if (metrics.ph > 8.0) r.push({ title: 'कृषि जिप्सम (Gypsum 70%)', titleEn: 'Agriculture Gypsum', reason: `क्षारीय मिट्टी (pH ${metrics.ph})`, reasonEn: `Alkaline pH ${metrics.ph}`, dose: `${Math.round(250 * totalAcres)} kg`, doseEn: `${Math.round(250 * totalAcres)} kg`, rate: '~₹220 / 50kg सरकारी अनुदान रेट', rateEn: '~₹220 / 50kg bag' });
  if (metrics.ph < 5.5) r.push({ title: 'कृषि चूना (Agricultural Lime)', titleEn: 'Agricultural Lime', reason: `अम्लीय मिट्टी (pH ${metrics.ph})`, reasonEn: `Acidic pH ${metrics.ph}`, dose: `${Math.round(200 * totalAcres)} kg`, doseEn: `${Math.round(200 * totalAcres)} kg`, rate: 'सहकारी खाद केंद्र पर उपलब्ध', rateEn: 'Available at PACS' });
  if (metrics.zinc < 0.6) r.push({ title: 'जिंक सल्फेट (21% Zn)', titleEn: 'Zinc Sulphate (21%)', reason: `जिंक कम (${metrics.zinc} ppm)`, reasonEn: `Low Zinc (${metrics.zinc} ppm)`, dose: `${plan.znKg} kg`, doseEn: `${plan.znKg} kg`, rate: 'यूरिया के साथ डालें, DAP के साथ नहीं', rateEn: 'Never mix with DAP' });
  if (metrics.sulphur < 10.0) r.push({ title: 'बेंटोनाइट सल्फर (90% S)', titleEn: 'Bentonite Sulphur', reason: `सल्फर कम (${metrics.sulphur} ppm)`, reasonEn: `Low Sulphur (${metrics.sulphur} ppm)`, dose: `${plan.sKg} kg`, doseEn: `${plan.sKg} kg`, rate: phosSource === 'SSP' ? 'SSP में 11% सल्फर शामिल है' : '~₹380 / 10kg', rateEn: phosSource === 'SSP' ? 'Included in SSP' : '~₹380 / 10kg' });
  if (metrics.organicCarbon < 0.5) r.push({ title: 'सड़ी गोबर खाद (FYM) / वर्मीकम्पोस्ट', titleEn: 'Decomposed FYM', reason: `कम जैविक कार्बन (${metrics.organicCarbon}%)`, reasonEn: `Low OC (${metrics.organicCarbon}%)`, dose: `${Math.ceil(2.5 * totalAcres)} ट्रॉली`, doseEn: `${Math.ceil(2.5 * totalAcres)} Trolleys`, rate: 'बुवाई से 15 दिन पहले मिलाएं', rateEn: 'Apply 15d pre-sowing' });
  return r;
}

// 8-Factor Dynamic Soil + Weather + ICAR Crop Rotation Engine (Returns Top 8 Ranked Crops)
export function calculateRecommendedCrops(metrics, weather = null, customCatalog = null, previousCropCode = '') {
  const m = metrics || {};
  const month = new Date().getMonth() + 1;
  const rainMm = Number(weather?.totalExpectedRainMm ?? 4);
  const maxTemp = Number(weather?.avgMaxTemp ?? 26);
  const ph = Number(m.ph ?? 7.2), ec = Number(m.ec ?? 0.4), n = Number(m.nitrogen ?? 210);
  const s = Number(m.sulphur ?? 9), oc = Number(m.organicCarbon ?? 0.48);

  let activeSeason = 'RABI';
  if ((month >= 6 && month <= 9) || (rainMm > 45 && maxTemp >= 31)) activeSeason = 'KHARIF';
  else if (month >= 3 && month <= 5 && maxTemp >= 32) activeSeason = 'ZAID';

  const catalog = Array.isArray(customCatalog) && customCatalog.length >= 10 ? customCatalog : DEFAULT_CROP_PROFILES;
  const prevCode = String(previousCropCode || '').trim().toUpperCase();
  const prevRef = catalog.find(c => (c.code || c.cropCode) === prevCode) || DEFAULT_CROP_PROFILES.find(c => c.code === prevCode);
  const prevCat = prevRef?.category || prevRef?.cropCategory || '';

  return catalog.map((crop) => {
    const code = crop.code || crop.cropCode;
    const ref = DEFAULT_CROP_PROFILES.find(c => c.code === code) || crop;
    const season = ref.season || 'ALL_SEASON';
    const category = crop.category || ref.category || 'CEREAL';
    let score = 62;
    let rotationTag = null;
    const rHi = [], rEn = [];

    // 1. Season Match
    if (season === activeSeason) { score += 16; rHi.push(`${activeSeason} मौसम उत्तम`); rEn.push(`Ideal ${activeSeason} season`); }
    else if (season === 'ALL_SEASON') { score += 9; }
    else { score -= 35; rHi.push(`बेमौसम (${season})`); rEn.push(`Off-season (${season})`); }

    // 2. ICAR Crop Rotation Intelligence (Permanent Farm Memory)
    if (prevCode) {
      if (prevCode === code && code !== 'SUGARCANE') {
        score -= 18;
        rotationTag = { type: 'WARN', hi: '⚠️ पिछली बार भी यही बोया था', en: '⚠️ Monocrop Risk' };
        rHi.push('लगातार एक फसल से कीट व रोग बढ़ते हैं — फसल चक्र बदलें');
        rEn.push('Avoid repeating same crop — rotate to prevent pests');
      } else if (prevCat === 'CEREAL' && category === 'PULSE') {
        score += 14;
        rotationTag = { type: 'BOOST', hi: '🌱 सर्वश्रेष्ठ फसल चक्र (+N)', en: '🌱 Best Rotation (+N)' };
        rHi.push('अनाज के बाद दलहन से मिट्टी में प्राकृतिक नाइट्रोजन बढ़ेगा');
        rEn.push('Legume after cereal restores soil Nitrogen');
      } else if (prevCat === 'PULSE' && ['CEREAL', 'VEGETABLE'].includes(category)) {
        score += 11;
        rotationTag = { type: 'BOOST', hi: '✨ दलहन के बाद बंपर उपज', en: '✨ Post-Pulse Boost' };
        rHi.push('पिछली दलहनी फसल की नाइट्रोजन से इस बार कम खाद में अधिक उपज');
        rEn.push('Benefits from residual Nitrogen of last pulse');
      } else if (prevCat !== category) {
        score += 5;
      }
    }

    // 3. Temperature & Rain
    const tempDiff = Math.abs(maxTemp - (ref.idealMaxTemp ?? 28));
    if (tempDiff <= 4) { score += 9; rHi.push(`${maxTemp}°C तापमान सटीक`); rEn.push(`${maxTemp}°C optimal`); }
    else if (tempDiff > 8) { score -= 15; }
    if (rainMm > (ref.maxSowingRainMm ?? 120)) { score -= 26; rHi.push(`⚠️ ${rainMm}mm बारिश जोखिम`); rEn.push(`⚠️ Rain risk`); }

    // 4. Soil Chemistry (pH, EC, N, S, OC)
    if (ph >= (ref.minPh ?? 6) && ph <= (ref.maxPh ?? 8.2)) { score += 7; rHi.push(`pH ${ph} अनुकूल`); rEn.push(`pH ${ph} fits`); }
    else { score -= 16; rHi.push(`pH ${ph} असंतुलित`); rEn.push(`pH ${ph} mismatch`); }

    if (ec > 1.0) {
      if (['BARLEY', 'MUSTARD', 'COTTON', 'WHEAT'].includes(code)) { score += 10; rHi.push(`लवणीय मिट्टी (EC ${ec}) सहनशील`); rEn.push(`Salt tolerant`); }
      else { score -= 14; }
    }
    if (n < 220 && category === 'PULSE') { score += 9; rHi.push('कम नाइट्रोजन में उत्तम'); rEn.push('Great for low-N soil'); }
    else if (n >= 270 && ['WHEAT', 'POTATO', 'SUGARCANE', 'PADDY', 'TOMATO'].includes(code)) { score += 8; rHi.push('उच्च नाइट्रोजन से अधिक पैदावार'); rEn.push('High N boosts yield'); }
    if (s >= 12 && ['MUSTARD', 'ONION', 'GARLIC'].includes(code)) { score += 6; rHi.push('सल्फर से गुणवत्ता बढ़ेगी'); rEn.push('Sulphur boosts quality'); }
    if (oc >= 0.55 && category === 'VEGETABLE') { score += 6; }

    return {
      cropCode: code, category, rotationTag,
      nameHi: crop.name || ref.name, nameEn: crop.nameEn || ref.nameEn || crop.name,
      suitabilityScore: Math.max(15, Math.min(99, Math.round(score))),
      expectedYield: ref.expectedYieldHi || '18–24 क्विंटल/एकड़', expectedYieldEn: ref.expectedYieldEn || '18–24 Qtl/Acre',
      reasonHi: rHi.slice(0, 3).join(' · '), reasonEn: rEn.slice(0, 3).join(' · ')
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 8);
}

export function generateHindiSpeechText(plan, metrics, areaValue, areaUnit, unitNamesHi, phosSource, totalAcres) {
  return `राम राम किसान भाई! आपके ${areaValue} ${unitNamesHi[areaUnit] || 'एकड़'} यानी ${totalAcres.toFixed(2)} एकड़ खेत में ${plan.crop.name} के लिए यूरिया ${plan.ureaKg} किलो, ${phosSource} ${plan.phosKg} किलो और पोटाश ${plan.mopKg} किलो डालें। कुल सरकारी रेट लगभग ${plan.totalCost} रुपये होगा।`;
}

export function speakHindi(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'hi-IN'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function generateWhatsAppShareUrl(plan, metrics, areaValue, areaUnit, unitNamesHi, weather) {
  const acres = convertToAcres(areaValue, areaUnit).toFixed(2);
  const msg = `🌾 *KrishiCore रिपोर्ट*\n📍 ${weather?.location || 'भारत'}\n📐 ${areaValue} ${unitNamesHi[areaUnit] || areaUnit} (${acres} एकड़)\n🌱 ${plan.crop.name}${plan.variety ? ` (${plan.variety.nameHi})` : ''}\n• यूरिया: ${plan.ureaKg}kg (${plan.ureaBags} बोरी)\n• ${plan.phosFertName}: ${plan.phosKg}kg (${plan.phosBags} बोरी)\n• पोटाश: ${plan.mopKg}kg (${plan.mopBags} बोरी)\n💰 *कुल सरकारी MRP: ₹${plan.totalCost}*`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}