// src/data/fallbackData.js
export const DEFAULT_METRICS = {
  ph: 7.4, ec: 0.42, organicCarbon: 0.48,
  nitrogen: 210.0, phosphorus: 14.5, potassium: 165.0,
  sulphur: 8.5, zinc: 0.52, iron: 4.8,
  copper: 0.32, manganese: 2.8, boron: 0.45
};

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

export const CROP_CATEGORIES = {
  ALL: { hi: 'सभी फसलें', en: 'All' },
  CEREAL: { hi: '🌾 अनाज', en: '🌾 Cereal' },
  PULSE: { hi: '🌱 दलहन', en: '🌱 Pulse' },
  OILSEED: { hi: '🌼 तिलहन', en: '🌼 Oilseed' },
  VEGETABLE: { hi: '🥔 सब्ज़ी', en: '🥔 Vegetable' },
  CASH: { hi: '🎋 नकदी', en: '🎋 Cash Crop' },
  FODDER: { hi: '🌿 चारा', en: '🌿 Fodder' }
};

export const DEFAULT_CROP_PROFILES = [
  // RABI (10 Crops)
  { code: 'WHEAT', name: '🌾 गेहूं (HD-3226 / DBW-187)', nameEn: '🌾 Wheat', n: 120, p: 60, k: 40, season: 'RABI', category: 'CEREAL', minPh: 6.0, maxPh: 8.3, idealMaxTemp: 26, maxSowingRainMm: 35, expectedYieldHi: '22–26 क्विंटल/एकड़', expectedYieldEn: '22–26 Qtl/Acre' },
  { code: 'MUSTARD', name: '🌼 सरसों (Pusa Bold / RH-725)', nameEn: '🌼 Mustard', n: 80, p: 40, k: 20, season: 'RABI', category: 'OILSEED', minPh: 6.0, maxPh: 8.4, idealMaxTemp: 27, maxSowingRainMm: 25, expectedYieldHi: '10–12 क्विंटल/एकड़', expectedYieldEn: '10–12 Qtl/Acre' },
  { code: 'POTATO', name: '🥔 आलू (Kufri Bahar / Chipsona)', nameEn: '🥔 Potato', n: 150, p: 80, k: 100, season: 'RABI', category: 'VEGETABLE', minPh: 5.5, maxPh: 7.8, idealMaxTemp: 25, maxSowingRainMm: 30, expectedYieldHi: '110–140 क्विंटल/एकड़', expectedYieldEn: '110–140 Qtl/Acre' },
  { code: 'CHICKPEA', name: '🌱 चना (Pusa-372 / JG-14)', nameEn: '🌱 Chickpea', n: 20, p: 50, k: 20, season: 'RABI', category: 'PULSE', minPh: 6.0, maxPh: 8.2, idealMaxTemp: 28, maxSowingRainMm: 25, expectedYieldHi: '8–11 क्विंटल/एकड़', expectedYieldEn: '8–11 Qtl/Acre' },
  { code: 'PEA', name: '🟢 मटर (Azad P-3 / Arkel)', nameEn: '🟢 Field Pea', n: 25, p: 60, k: 30, season: 'RABI', category: 'PULSE', minPh: 6.0, maxPh: 7.8, idealMaxTemp: 24, maxSowingRainMm: 30, expectedYieldHi: '35–45 क्विंटल (हरी फली)', expectedYieldEn: '35–45 Qtl (Green Pod)' },
  { code: 'LENTIL', name: '🫘 मसूर (PL-8 / DPL-62)', nameEn: '🫘 Lentil', n: 20, p: 40, k: 20, season: 'RABI', category: 'PULSE', minPh: 6.0, maxPh: 8.2, idealMaxTemp: 26, maxSowingRainMm: 25, expectedYieldHi: '6–9 क्विंटल/एकड़', expectedYieldEn: '6–9 Qtl/Acre' },
  { code: 'BARLEY', name: '🌾 जौ (RD-2794 / DWRB-137)', nameEn: '🌾 Barley', n: 60, p: 30, k: 20, season: 'RABI', category: 'CEREAL', minPh: 6.0, maxPh: 8.8, idealMaxTemp: 26, maxSowingRainMm: 30, expectedYieldHi: '18–22 क्विंटल/एकड़', expectedYieldEn: '18–22 Qtl/Acre' },
  { code: 'ONION', name: '🧅 प्याज़ (Bhima Super / N-53)', nameEn: '🧅 Onion', n: 100, p: 50, k: 50, season: 'RABI', category: 'VEGETABLE', minPh: 6.0, maxPh: 7.8, idealMaxTemp: 28, maxSowingRainMm: 35, expectedYieldHi: '90–120 क्विंटल/एकड़', expectedYieldEn: '90–120 Qtl/Acre' },
  { code: 'GARLIC', name: '🧄 लहसुन (Yamuna Safed G-1)', nameEn: '🧄 Garlic', n: 100, p: 50, k: 50, season: 'RABI', category: 'VEGETABLE', minPh: 6.0, maxPh: 7.8, idealMaxTemp: 25, maxSowingRainMm: 30, expectedYieldHi: '40–55 क्विंटल/एकड़', expectedYieldEn: '40–55 Qtl/Acre' },
  { code: 'BERSEEM', name: '🌿 बरसीम चारा (Wardan / BL-42)', nameEn: '🌿 Berseem Fodder', n: 25, p: 60, k: 30, season: 'RABI', category: 'FODDER', minPh: 6.2, maxPh: 8.2, idealMaxTemp: 25, maxSowingRainMm: 40, expectedYieldHi: '300–380 क्विंटल हरा चारा', expectedYieldEn: '300–380 Qtl Fodder' },
  // ALL_SEASON (3 Crops)
  { code: 'SUGARCANE', name: '🎋 गन्ना (Co-0238 / Co-0118)', nameEn: '🎋 Sugarcane', n: 150, p: 80, k: 60, season: 'ALL_SEASON', category: 'CASH', minPh: 6.0, maxPh: 8.3, idealMaxTemp: 35, maxSowingRainMm: 250, expectedYieldHi: '350–420 क्विंटल/एकड़', expectedYieldEn: '350–420 Qtl/Acre' },
  { code: 'MAIZE', name: '🌽 मक्का (Hybrid HQPM-1)', nameEn: '🌽 Maize', n: 120, p: 60, k: 40, season: 'ALL_SEASON', category: 'CEREAL', minPh: 5.8, maxPh: 8.0, idealMaxTemp: 34, maxSowingRainMm: 150, expectedYieldHi: '22–28 क्विंटल/एकड़', expectedYieldEn: '22–28 Qtl/Acre' },
  { code: 'TOMATO', name: '🍅 टमाटर (Arka Rakshak)', nameEn: '🍅 Tomato', n: 120, p: 60, k: 60, season: 'ALL_SEASON', category: 'VEGETABLE', minPh: 5.8, maxPh: 7.6, idealMaxTemp: 30, maxSowingRainMm: 80, expectedYieldHi: '140–180 क्विंटल/एकड़', expectedYieldEn: '140–180 Qtl/Acre' },
  // KHARIF & ZAID (7 Crops)
  { code: 'PADDY', name: '🌾 धान (Basmati-1509 / PR-126)', nameEn: '🌾 Paddy', n: 120, p: 60, k: 60, season: 'KHARIF', category: 'CEREAL', minPh: 5.5, maxPh: 8.2, idealMaxTemp: 36, maxSowingRainMm: 400, expectedYieldHi: '24–28 क्विंटल/एकड़', expectedYieldEn: '24–28 Qtl/Acre' },
  { code: 'SOYBEAN', name: '🌿 सोयाबीन (JS-9560)', nameEn: '🌿 Soybean', n: 25, p: 60, k: 40, season: 'KHARIF', category: 'PULSE', minPh: 6.0, maxPh: 7.8, idealMaxTemp: 35, maxSowingRainMm: 250, expectedYieldHi: '10–14 क्विंटल/एकड़', expectedYieldEn: '10–14 Qtl/Acre' },
  { code: 'COTTON', name: '☁️ कपास (Bt / Hybrid)', nameEn: '☁️ Cotton', n: 120, p: 60, k: 60, season: 'KHARIF', category: 'CASH', minPh: 6.0, maxPh: 8.5, idealMaxTemp: 38, maxSowingRainMm: 220, expectedYieldHi: '12–15 क्विंटल/एकड़', expectedYieldEn: '12–15 Qtl/Acre' },
  { code: 'BAJRA', name: '🌾 बाजरा (HHB-67)', nameEn: '🌾 Pearl Millet', n: 80, p: 40, k: 20, season: 'KHARIF', category: 'CEREAL', minPh: 6.0, maxPh: 8.6, idealMaxTemp: 38, maxSowingRainMm: 160, expectedYieldHi: '12–16 क्विंटल/एकड़', expectedYieldEn: '12–16 Qtl/Acre' },
  { code: 'GROUNDNUT', name: '🥜 मूंगफली (TG-37A)', nameEn: '🥜 Groundnut', n: 25, p: 50, k: 40, season: 'KHARIF', category: 'OILSEED', minPh: 5.8, maxPh: 7.6, idealMaxTemp: 35, maxSowingRainMm: 180, expectedYieldHi: '10–14 क्विंटल/एकड़', expectedYieldEn: '10–14 Qtl/Acre' },
  { code: 'TUR_ARHAR', name: '🌱 तूर / अरहर (Pusa-992)', nameEn: '🌱 Pigeon Pea', n: 25, p: 50, k: 25, season: 'KHARIF', category: 'PULSE', minPh: 6.0, maxPh: 8.2, idealMaxTemp: 36, maxSowingRainMm: 200, expectedYieldHi: '8–10 क्विंटल/एकड़', expectedYieldEn: '8–10 Qtl/Acre' },
  { code: 'MOONG', name: '🌿 मूंग (SML-668)', nameEn: '🌿 Green Gram', n: 20, p: 40, k: 20, season: 'ZAID', category: 'PULSE', minPh: 6.2, maxPh: 8.0, idealMaxTemp: 38, maxSowingRainMm: 120, expectedYieldHi: '5–7 क्विंटल/एकड़', expectedYieldEn: '5–7 Qtl/Acre' }
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
  location: 'जीपीएस क्षेत्र खोजा जा रहा है...', locationEn: 'Detecting GPS Region...',
  avgMaxTemp: 26.0, avgMinTemp: 14.0, totalExpectedRainMm: 2.0,
  sowingWeatherVerdict: 'SAFE_FOR_SOWING',
  verdictTextHi: '🟢 अनुकूल मौसम — बुवाई व छिड़काव सुरक्षित', verdictTextEn: '🟢 Optimal Weather — Safe Spray Window',
  humidity: 52, windSpeedKmh: 8.5,
  forecastSummaryHi: 'आपके लाइव जीपीएस क्षेत्र के 16-दिवसीय मौसम और ऋतु के अनुसार फसल व खाद सलाह नीचे तैयार है।',
  forecastSummaryEn: 'Crop and fertilizer advisory calibrated to your live 16-day GPS weather forecast.'
};

export const UNIT_NAMES_HI = { ACRE: 'एकड़', HECTARE: 'हेक्टेयर', KACCHA_BIGHA: 'कच्चा बीघा', PAKKA_BIGHA: 'पक्का बीघा', GUNTHA: 'गुंठा', KANAL: 'कनाल', BISWA: 'बिस्वा', CENT: 'सेंट' };
export const UNIT_NAMES_EN = { ACRE: 'Acre', HECTARE: 'Hectare', KACCHA_BIGHA: 'Kaccha Bigha', PAKKA_BIGHA: 'Pakka Bigha', GUNTHA: 'Guntha', KANAL: 'Kanal', BISWA: 'Biswa', CENT: 'Cent' };

export const AREA_UNIT_OPTIONS = [
  { value: 'ACRE', label: 'एकड़ / किल्ला', labelEn: 'Acre / Killa' },
  { value: 'HECTARE', label: 'हेक्टेयर (2.47 एकड़)', labelEn: 'Hectare (2.47 Ac)' },
  { value: 'KACCHA_BIGHA', label: 'कच्चा बीघा (4.8 = 1 एकड़)', labelEn: 'Kaccha Bigha (4.8/Ac)' },
  { value: 'PAKKA_BIGHA', label: 'पक्का बीघा (1.6 = 1 एकड़)', labelEn: 'Pakka Bigha (1.6/Ac)' },
  { value: 'GUNTHA', label: 'गुंठा — MH/GJ (40/एकड़)', labelEn: 'Guntha (40/Ac)' },
  { value: 'KANAL', label: 'कनाल — PB/HR (8/एकड़)', labelEn: 'Kanal (8/Ac)' },
  { value: 'BISWA', label: 'बिस्वा (32 = 1 एकड़)', labelEn: 'Biswa (32/Ac)' },
  { value: 'CENT', label: 'सेंट — South (100/एकड़)', labelEn: 'Cent (100/Ac)' }
];