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
  const applicationTimeline = [
    {
      stageHi: 'बुवाई के समय (Basal · Day 0)', stageEn: 'Basal Dose · Sowing (Day 0)',
      detailHi: `100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP (${mopKg.toFixed(1)} kg) + 1/3 यूरिया (${splitUrea} kg)${varNote} के लिए ड्रिल करें।`,
      detailEn: `Drill 100% ${phosSource} (${phosKg.toFixed(1)} kg) + 100% MOP + 1/3 Urea (${splitUrea} kg) at sowing.`
    },
    {
      stageHi: 'पहला पानी · जड़ अवस्था (21–25 दिन)', stageEn: 'First Irrigation (21–25 Days)',
      detailHi: `1/3 यूरिया (${splitUrea} kg)${znKg > 0 ? ` + ${znKg.toFixed(1)} kg जिंक सल्फेट` : ''} सिंचाई के बाद डालें।`,
      detailEn: `Top-dress 1/3 Urea (${splitUrea} kg)${znKg > 0 ? ` + ${znKg.toFixed(1)} kg Zinc` : ''} after 1st irrigation.`
    },
    {
      stageHi: 'दूसरा पानी · कल्ले फूटना (45–50 दिन)', stageEn: 'Second Irrigation (45–50 Days)',
      detailHi: `शेष 1/3 यूरिया (${splitUrea} kg) डालें। बारिश की चेतावनी पर छिड़काव रोकें।`,
      detailEn: `Broadcast remaining 1/3 Urea (${splitUrea} kg). Hold if heavy rain forecast.`
    }
  ];

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

// 7-Factor Dynamic Soil & Weather Crop Suitability Engine (Zero Static Recommendations!)
export function calculateRecommendedCrops(metrics, weather = null, customCatalog = null) {
  const m = metrics || {};
  const month = new Date().getMonth() + 1;
  const rainMm = Number(weather?.totalExpectedRainMm ?? 4);
  const maxTemp = Number(weather?.avgMaxTemp ?? 26);
  const ph = Number(m.ph ?? 7.2), ec = Number(m.ec ?? 0.4), n = Number(m.nitrogen ?? 210);
  const s = Number(m.sulphur ?? 9), oc = Number(m.organicCarbon ?? 0.48);

  let activeSeason = 'RABI';
  if ((month >= 6 && month <= 9) || (rainMm > 45 && maxTemp >= 31)) activeSeason = 'KHARIF';
  else if (month >= 3 && month <= 5 && maxTemp >= 32) activeSeason = 'ZAID';

  const catalog = Array.isArray(customCatalog) && customCatalog.length >= 5 ? customCatalog : DEFAULT_CROP_PROFILES;

  return catalog.map((crop) => {
    const code = crop.code || crop.cropCode;
    const ref = DEFAULT_CROP_PROFILES.find(c => c.code === code) || crop;
    const season = ref.season || 'ALL_SEASON';
    let score = 62;
    const rHi = [], rEn = [];

    // 1. Season Match
    if (season === activeSeason) { score += 16; rHi.push(`${activeSeason} मौसम उत्तम`); rEn.push(`Ideal ${activeSeason} season`); }
    else if (season === 'ALL_SEASON') { score += 8; }
    else { score -= 34; rHi.push(`बेमौसम (${season})`); rEn.push(`Off-season (${season})`); }

    // 2. Live Temperature Curve
    const tempDiff = Math.abs(maxTemp - (ref.idealMaxTemp ?? 28));
    if (tempDiff <= 4) { score += 10; rHi.push(`${maxTemp}°C तापमान सटीक`); rEn.push(`${maxTemp}°C temp optimal`); }
    else if (tempDiff > 8) { score -= 16; rHi.push(`तापमान (${maxTemp}°C) प्रतिकूल`); rEn.push(`Temp ${maxTemp}°C stressed`); }

    // 3. Live 16-Day Rainfall Tolerance
    if (rainMm > (ref.maxSowingRainMm ?? 120)) { score -= 26; rHi.push(`⚠️ ${rainMm}mm बारिश का खतरा`); rEn.push(`⚠️ ${rainMm}mm rain risk`); }
    else if (rainMm > 25 && ['PADDY', 'SOYBEAN', 'SUGARCANE', 'COTTON'].includes(code)) { score += 9; rHi.push(`${rainMm}mm बारिश लाभकारी`); rEn.push(`Rain boosts growth`); }

    // 4. Soil pH Fit
    if (ph >= (ref.minPh ?? 6) && ph <= (ref.maxPh ?? 8.2)) { score += 8; rHi.push(`pH ${ph} अनुकूल`); rEn.push(`pH ${ph} fits`); }
    else { score -= 18; rHi.push(`pH ${ph} असंतुलित`); rEn.push(`pH ${ph} mismatch`); }

    // 5. Soil Salinity (EC) Sensitivity
    if (ec > 1.0) {
      if (['MUSTARD', 'COTTON', 'WHEAT'].includes(code)) { score += 9; rHi.push(`लवणीय मिट्टी (EC ${ec}) सहनशील`); rEn.push(`Salt tolerant (EC ${ec})`); }
      else { score -= 15; rHi.push(`उच्च EC (${ec}) नुकसानदेह`); rEn.push(`Sensitive to EC ${ec}`); }
    }

    // 6. Soil Nitrogen Match (Legumes vs Heavy Feeders)
    if (n < 220 && ['CHICKPEA', 'SOYBEAN', 'TUR_ARHAR', 'MOONG'].includes(code)) {
      score += 12; rHi.push(`कम N (${n}) में दलहन नाइट्रोजन बढ़ाएगी`); rEn.push(`Fixes N in low-N (${n}) soil`);
    } else if (n >= 280 && ['WHEAT', 'SUGARCANE', 'PADDY', 'MAIZE'].includes(code)) {
      score += 10; rHi.push(`उच्च N (${n}) से बंपर उपज`); rEn.push(`High N (${n}) maximizes yield`);
    } else if (n < 180 && ['SUGARCANE', 'PADDY'].includes(code)) {
      score -= 10; rHi.push(`नाइट्रोजन (${n}) बहुत कम`); rEn.push(`Low N (${n}) for heavy feeder`);
    }

    // 7. Sulphur & Organic Carbon Bonus
    if (s >= 12 && code === 'MUSTARD') { score += 7; rHi.push(`सल्फर (${s}) से तेल मात्रा बढ़ेगी`); rEn.push(`High S boosts oil %`); }
    if (oc >= 0.6 && ['SUGARCANE', 'WHEAT', 'PADDY'].includes(code)) { score += 5; }

    return {
      cropCode: code, nameHi: crop.name || ref.name, nameEn: crop.nameEn || ref.nameEn || crop.name,
      suitabilityScore: Math.max(15, Math.min(98, Math.round(score))),
      expectedYield: ref.expectedYieldHi || '18–24 क्विंटल/एकड़', expectedYieldEn: ref.expectedYieldEn || '18–24 Qtl/Acre',
      reasonHi: rHi.slice(0, 3).join(' · '), reasonEn: rEn.slice(0, 3).join(' · ')
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 3);
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