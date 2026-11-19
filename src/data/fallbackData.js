// src/data/fallbackData.js
export const DEFAULT_METRICS = {
  ph: 7.4, ec: 0.42, organicCarbon: 0.48,
  nitrogen: 210.0, phosphorus: 14.5, potassium: 165.0,
  sulphur: 8.5, zinc: 0.52, iron: 4.8,
  copper: 0.32, manganese: 2.8, boron: 0.45
};

// Grouped as per Stitch Verification Screen: PHYSICAL, PRIMARY, MICRO
export const PARAM_CONFIG = [
  { key: 'ph', group: 'PHYSICAL', target: '6.5 - 7.5', label: 'pH (मृदा अभिक्रिया)', labelEn: 'pH Level', unit: '0-14', check: v => v > 8.0 ? ['ALKALINE', 'bg-red-100 text-red-800 border-red-300'] : (v < 5.5 ? ['ACIDIC', 'bg-amber-100 text-amber-800 border-amber-300'] : ['IDEAL', 'bg-emerald-100 text-emerald-800 border-emerald-300']) },
  { key: 'organicCarbon', group: 'PHYSICAL', target: '> 0.50%', label: 'OC (जैविक कार्बन)', labelEn: 'Carbon (OC)', unit: '%', check: v => v < 0.5 ? ['LOW', 'bg-amber-100 text-amber-900 border-amber-300'] : ['OPTIMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'ec', group: 'PHYSICAL', target: '< 1.0 dS/m', label: 'EC (लवणता)', labelEn: 'Salinity (EC)', unit: 'dS/m', check: v => v > 1.0 ? ['HIGH', 'bg-red-100 text-red-800 border-red-300'] : ['NORMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'nitrogen', group: 'PRIMARY', target: '280 kg/ha', targetNum: 280, label: 'Nitrogen (नाइट्रोजन N)', labelEn: 'Nitrogen (N)', unit: 'kg/ha', check: v => v < 280 ? ['LOW', 'bg-red-100 text-red-800 border-red-300'] : ['GOOD', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'phosphorus', group: 'PRIMARY', target: '20 kg/ha', targetNum: 20, label: 'Phosphorus (फॉस्फोरस P)', labelEn: 'Phosphorus (P)', unit: 'kg/ha', check: v => v < 10 ? ['LOW', 'bg-red-100 text-red-800 border-red-300'] : ['MED', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'potassium', group: 'PRIMARY', target: '180 kg/ha', targetNum: 180, label: 'Potassium (पोटाश K)', labelEn: 'Potassium (K)', unit: 'kg/ha', check: v => v < 108 ? ['LOW', 'bg-red-100 text-red-800 border-red-300'] : ['GOOD', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'sulphur', group: 'PRIMARY', target: '> 10 ppm', targetNum: 10, label: 'Sulphur (सल्फर S)', labelEn: 'Sulphur (S)', unit: 'ppm', check: v => v < 10 ? ['LOW', 'bg-amber-100 text-amber-900 border-amber-300'] : ['GOOD', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'zinc', group: 'MICRO', target: '> 0.6 ppm', label: 'Zinc (जिंक Zn)', labelEn: 'Zinc (Zn)', unit: 'ppm', check: v => v < 0.6 ? ['DEFICIENT', 'bg-red-100 text-red-800 border-red-300'] : ['NORMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'iron', group: 'MICRO', target: '> 4.5 ppm', label: 'Iron (आयरन Fe)', labelEn: 'Iron (Fe)', unit: 'ppm', check: v => v < 4.5 ? ['DEFICIENT', 'bg-amber-100 text-amber-900 border-amber-300'] : ['NORMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'boron', group: 'MICRO', target: '> 0.5 ppm', label: 'Boron (बोरॉन B)', labelEn: 'Boron (B)', unit: 'ppm', check: v => v < 0.5 ? ['MARGINAL', 'bg-amber-100 text-amber-900 border-amber-300'] : ['NORMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'copper', group: 'MICRO', target: '> 0.2 ppm', label: 'Copper (कॉपर Cu)', labelEn: 'Copper (Cu)', unit: 'ppm', check: v => v < 0.2 ? ['DEFICIENT', 'bg-amber-100 text-amber-900 border-amber-300'] : ['NORMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] },
  { key: 'manganese', group: 'MICRO', target: '> 2.0 ppm', label: 'Manganese (मैंगनीज Mn)', labelEn: 'Manganese (Mn)', unit: 'ppm', check: v => v < 2.0 ? ['DEFICIENT', 'bg-amber-100 text-amber-900 border-amber-300'] : ['NORMAL', 'bg-emerald-100 text-emerald-800 border-emerald-300'] }
];

export const DEFAULT_CROP_PROFILES = [
  { code: 'WHEAT', name: '🌾 गेहूं (Wheat — HD-3226 / DBW-187)', nameEn: '🌾 Wheat (HD-3226 / DBW-187)', n: 120, p: 60, k: 40, season: 'RABI', minPh: 6.0, maxPh: 8.2, idealMaxTemp: 27, maxSowingRainMm: 30, expectedYieldHi: '22–26 क्विंटल/एकड़', expectedYieldEn: '22–26 Qtl/Acre' },
  { code: 'MUSTARD', name: '🌼 सरसों (Mustard — Pusa Bold / RH-725)', nameEn: '🌼 Mustard (Pusa Bold / RH-725)', n: 80, p: 40, k: 20, season: 'RABI', minPh: 6.0, maxPh: 8.3, idealMaxTemp: 28, maxSowingRainMm: 25, expectedYieldHi: '10–12 क्विंटल/एकड़', expectedYieldEn: '10–12 Qtl/Acre' },
  { code: 'CHICKPEA', name: '🌱 चना / हरभरा (Chickpea — Pusa-372)', nameEn: '🌱 Chickpea (Pusa-372)', n: 20, p: 50, k: 20, season: 'RABI', minPh: 6.0, maxPh: 8.2, idealMaxTemp: 29, maxSowingRainMm: 25, expectedYieldHi: '8–11 क्विंटल/एकड़', expectedYieldEn: '8–11 Qtl/Acre' },
  { code: 'PADDY', name: '🌾 धान (Paddy — Basmati / IR-64)', nameEn: '🌾 Paddy (Basmati / IR-64)', n: 120, p: 60, k: 60, season: 'KHARIF', minPh: 5.5, maxPh: 8.2, idealMaxTemp: 36, maxSowingRainMm: 400, expectedYieldHi: '24–28 क्विंटल/एकड़', expectedYieldEn: '24–28 Qtl/Acre' },
  { code: 'SOYBEAN', name: '🌿 सोयाबीन (Soybean — JS-9560 / MACS-1407)', nameEn: '🌿 Soybean (JS-9560)', n: 25, p: 60, k: 40, season: 'KHARIF', minPh: 6.0, maxPh: 7.8, idealMaxTemp: 35, maxSowingRainMm: 250, expectedYieldHi: '10–14 क्विंटल/एकड़', expectedYieldEn: '10–14 Qtl/Acre' },
  { code: 'COTTON', name: '☁️ कपास (Cotton — Bt / Hybrid)', nameEn: '☁️ Cotton (Bt / Hybrid)', n: 120, p: 60, k: 60, season: 'KHARIF', minPh: 6.0, maxPh: 8.4, idealMaxTemp: 38, maxSowingRainMm: 220, expectedYieldHi: '12–15 क्विंटल/एकड़', expectedYieldEn: '12–15 Qtl/Acre' },
  { code: 'MAIZE', name: '🌽 मक्का (Maize — Hybrid HQPM-1)', nameEn: '🌽 Maize (HQPM-1)', n: 120, p: 60, k: 40, season: 'ALL_SEASON', minPh: 5.8, maxPh: 8.0, idealMaxTemp: 35, maxSowingRainMm: 150, expectedYieldHi: '22–28 क्विंटल/एकड़', expectedYieldEn: '22–28 Qtl/Acre' },
  { code: 'SUGARCANE', name: '🎋 गन्ना / ऊस (Sugarcane — Co-0238)', nameEn: '🎋 Sugarcane (Co-0238)', n: 150, p: 80, k: 60, season: 'ALL_SEASON', minPh: 6.0, maxPh: 8.3, idealMaxTemp: 36, maxSowingRainMm: 250, expectedYieldHi: '350–420 क्विंटल/एकड़', expectedYieldEn: '350–420 Qtl/Acre' },
  { code: 'TUR_ARHAR', name: '🌱 तूर / अरहर (Pigeon Pea — Pusa-992)', nameEn: '🌱 Tur / Pigeon Pea', n: 25, p: 50, k: 25, season: 'KHARIF', minPh: 6.0, maxPh: 8.2, idealMaxTemp: 36, maxSowingRainMm: 200, expectedYieldHi: '8–10 क्विंटल/एकड़', expectedYieldEn: '8–10 Qtl/Acre' },
  { code: 'MOONG', name: '🌿 मूंग (Green Gram — SML-668)', nameEn: '🌿 Green Gram (SML-668)', n: 20, p: 40, k: 20, season: 'ZAID', minPh: 6.2, maxPh: 8.0, idealMaxTemp: 38, maxSowingRainMm: 120, expectedYieldHi: '5–7 क्विंटल/एकड़', expectedYieldEn: '5–7 Qtl/Acre' }
];

export const DEFAULT_FERTILIZER_RATES = {
  UREA: { name: 'नीम कोटेड यूरिया (46% N)', nameEn: 'Neem Coated Urea (46% N)', bagKg: 45, mrpBag: 266.50, n: 46, p: 0, k: 0 },
  DAP: { name: 'डीएपी - DAP (18:46:0)', nameEn: 'DAP (18:46:0)', bagKg: 50, mrpBag: 1350.0, n: 18, p: 46, k: 0 },
  MOP: { name: 'पोटाश - MOP (60% K)', nameEn: 'Potash - MOP (60% K)', bagKg: 50, mrpBag: 1650.0, n: 0, p: 0, k: 60 },
  SSP: { name: 'सिंगल सुपर फॉस्फेट - SSP (16% P)', nameEn: 'SSP (16% P + 11% S)', bagKg: 50, mrpBag: 450.0, n: 0, p: 16, k: 0 },
  NPK123216: { name: 'एनपीके - NPK (12:32:16)', nameEn: 'NPK (12:32:16)', bagKg: 50, mrpBag: 1470.0, n: 12, p: 32, k: 16 },
  ZINC_SULPHATE: { name: 'जिंक सल्फेट (21% Zn)', nameEn: 'Zinc Sulphate (21% Zn)', bagKg: 10, mrpBag: 480.0 },
  BENTONITE_SULPHUR: { name: 'बेंटोनाइट सल्फर (90% S)', nameEn: 'Bentonite Sulphur (90% S)', bagKg: 10, mrpBag: 380.0 },
  GYPSUM: { name: 'कृषि जिप्सम (70%)', nameEn: 'Agriculture Gypsum (70%)', bagKg: 50, mrpBag: 220.0 }
};

export const DEFAULT_WEATHER = {
  location: 'जीपीएस क्षेत्र खोजा जा रहा है...',
  locationEn: 'Detecting GPS Region...',
  avgMaxTemp: 27.5, avgMinTemp: 15.2, totalExpectedRainMm: 2.0,
  sowingWeatherVerdict: 'SAFE_FOR_SOWING',
  verdictTextHi: '🟢 अनुकूल मौसम — बुवाई व छिड़काव सुरक्षित',
  verdictTextEn: '🟢 Optimal Weather — Safe Spray Window',
  humidity: 52, windSpeedKmh: 8.5,
  forecastSummaryHi: 'आपके लाइव जीपीएस क्षेत्र के 16-दिवसीय मौसम और ऋतु के अनुसार फसल व खाद सलाह नीचे तैयार है।',
  forecastSummaryEn: 'Crop and fertilizer advisory calibrated to your live 16-day GPS weather forecast.'
};

export const UNIT_NAMES_HI = {
  ACRE: 'एकड़ (किल्ला)', HECTARE: 'हेक्टेयर', KACCHA_BIGHA: 'कच्चा बीघा',
  PAKKA_BIGHA: 'पक्का बीघा', GUNTHA: 'गुंठा', KANAL: 'कनाल', BISWA: 'बिस्वा', CENT: 'सेंट'
};

export const UNIT_NAMES_EN = {
  ACRE: 'Acre', HECTARE: 'Hectare', KACCHA_BIGHA: 'Kaccha Bigha',
  PAKKA_BIGHA: 'Pakka Bigha', GUNTHA: 'Guntha', KANAL: 'Kanal', BISWA: 'Biswa', CENT: 'Cent'
};

export const AREA_UNIT_OPTIONS = [
  { value: 'ACRE', label: 'एकड़ / किल्ला (Pan-India: 43,560 sq.ft)', labelEn: 'Acre / Killa (43,560 sq.ft)' },
  { value: 'HECTARE', label: 'हेक्टेयर (1 Ha = 2.471 एकड़)', labelEn: 'Hectare (2.471 Acre)' },
  { value: 'GUNTHA', label: 'गुंठा — महाराष्ट्र/गुजरात/कर्नाटक (40 गुंठा = 1 एकड़)', labelEn: 'Guntha — MH/GJ/KA (40 = 1 Acre)' },
  { value: 'KANAL', label: 'कनाल — पंजाब/हरियाणा/J&K (8 कनाल = 1 एकड़)', labelEn: 'Kanal — PB/HR/JK (8 = 1 Acre)' },
  { value: 'PAKKA_BIGHA', label: 'पक्का बीघा — UP/राजस्थान/बिहार (1.6 बीघा = 1 एकड़)', labelEn: 'Pakka Bigha (1.6 = 1 Acre)' },
  { value: 'KACCHA_BIGHA', label: 'कच्चा बीघा — पश्चिमी UP/उत्तराखंड (4.8 बीघा = 1 एकड़)', labelEn: 'Kaccha Bigha (4.8 = 1 Acre)' },
  { value: 'BISWA', label: 'बिस्वा (32 बिस्वा = 1 एकड़)', labelEn: 'Biswa (32 = 1 Acre)' },
  { value: 'CENT', label: 'सेंट — दक्षिण भारत (100 सेंट = 1 एकड़)', labelEn: 'Cent — South India (100 = 1 Acre)' }
];