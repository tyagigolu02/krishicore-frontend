// src/api/krishicoreApi.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const CACHE_PREFIX = 'krishicore_pwa_cache_';

function getAuthHeaders(isMultipart = false) {
  const headers = {};
  const token = localStorage.getItem('krishicore_token');
  if (token && !token.startsWith('demo_token_')) {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('krishicore_token');
      }
    } catch { /* ignore malformed token */ }
  }
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  return headers;
}

export function computeHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9.5;
  const toRad = (v) => (v * Math.PI) / 180;
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function normalizeBackendCrops(arr) {
  if (!Array.isArray(arr) || !arr.length) return null;
  return arr.map((c) => ({
    code: c.cropCode || c.code || 'WHEAT',
    name: `${c.cropName || c.name} — (${c.recommendedVariety || 'ICAR'})`,
    nameEn: `${c.cropName || c.nameEn || c.name} — (${c.recommendedVariety || 'ICAR'})`,
    n: Number(c.targetN_KgHa ?? c.n ?? 120),
    p: Number(c.targetP_KgHa ?? c.p ?? 60),
    k: Number(c.targetK_KgHa ?? c.k ?? 40),
    season: c.season || 'ALL_SEASON',
    category: c.cropCategory || c.category || 'CEREAL',
    minPh: Number(c.minPh ?? 6.0), maxPh: Number(c.maxPh ?? 8.2),
    idealMaxTemp: Number(c.idealMaxTemp ?? 28.0), maxSowingRainMm: Number(c.maxSowingRainMm ?? 100),
  }));
}

export function normalizeBackendFertilizers(fertInput, fallbackRates) {
  if (!fertInput) return fallbackRates;
  if (!Array.isArray(fertInput)) return { ...fallbackRates, ...fertInput };
  const map = { ...fallbackRates };
  fertInput.forEach((f) => {
    if (f?.code) {
      const k = f.code.toUpperCase();
      map[k] = {
        name: f.nameHi || f.name || k, nameEn: f.nameEn || f.name || k,
        bagKg: Number(f.bagWeightKg ?? f.bagKg ?? 50), mrpBag: Number(f.govtMrpPerBagInr ?? f.mrpBag ?? 1350),
        n: Number(f.nitrogenPercent ?? f.n ?? 0), p: Number(f.phosphorusPercent ?? f.p ?? 0), k: Number(f.potassiumPercent ?? f.k ?? 0),
      };
    }
  });
  return map;
}

export function normalizeLocations(items, uLat, uLng) {
  if (!Array.isArray(items)) return [];
  return items.map((i) => {
    const lat = Number(i.latitude ?? i.lat ?? uLat);
    const lng = Number(i.longitude ?? i.lng ?? uLng);
    const hasVerifiedStock = Boolean(
      i.isVerifiedPartner || i.isUserRegistered || i.stockStatus === 'VERIFIED_LIVE_STOCK'
    );
    return {
      ...i,
      lat,
      lng,
      isVerifiedPartner: hasVerifiedStock,
      stockStatus: hasVerifiedStock ? 'VERIFIED_LIVE_STOCK' : 'CALL_TO_VERIFY',
      distanceKm: computeHaversineKm(uLat, uLng, lat, lng),
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

// 1. Live 16-Day Weather Forecast (Open-Meteo Public API + Offline Cache)
export async function fetchLive16DayWeather(lat, lng, labelHi = 'आपका क्षेत्र', labelEn = 'Your Region') {
  if (!lat || !lng) return null;
  const ck = `${CACHE_PREFIX}weather_v2_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&current=relative_humidity_2m,wind_speed_10m&forecast_days=16&timezone=auto`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Weather HTTP ${r.status}`);
    const data = await r.json();
    const d = data.daily || {};
    const maxArr = d.temperature_2m_max || [26];
    const minArr = d.temperature_2m_min || [14];
    const rainArr = d.precipitation_sum || [0];
    const windArr = d.wind_speed_10m_max || [8];

    const avgMaxTemp = Math.round((maxArr.reduce((s, v) => s + v, 0) / maxArr.length) * 10) / 10;
    const avgMinTemp = Math.round((minArr.reduce((s, v) => s + v, 0) / minArr.length) * 10) / 10;
    const totalExpectedRainMm = Math.round(rainArr.reduce((s, v) => s + v, 0) * 10) / 10;
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 52);
    const windSpeedKmh = Math.round((data.current?.wind_speed_10m ?? windArr[0] ?? 8) * 10) / 10;

    let sowingWeatherVerdict = 'SAFE_FOR_SOWING';
    let verdictTextHi = '🟢 अनुकूल मौसम — बुवाई व खाद छिड़काव सुरक्षित';
    let verdictTextEn = '🟢 Optimal Weather — Safe Sowing & Spray Window';
    let forecastSummaryHi = `अगले 16 दिनों में औसत तापमान ${avgMaxTemp}°C/${avgMinTemp}°C और कुल वर्षा ~${totalExpectedRainMm}mm अनुमानित है।`;
    let forecastSummaryEn = `Next 16 days: avg ${avgMaxTemp}°C/${avgMinTemp}°C with ~${totalExpectedRainMm}mm total rainfall.`;

    if (totalExpectedRainMm > 45) {
      sowingWeatherVerdict = 'HEAVY_RAIN_WARNING';
      verdictTextHi = `🌧️ भारी बारिश चेतावनी (${totalExpectedRainMm}mm) — यूरिया/स्प्रे रोकें`;
      verdictTextEn = `🌧️ Heavy Rain Alert (${totalExpectedRainMm}mm) — Hold Spray/Urea`;
      forecastSummaryHi = `तेज़ बारिश (${totalExpectedRainMm}mm) की संभावना है। जल निकासी साफ रखें और यूरिया या कीटनाशक छिड़काव टालें।`;
      forecastSummaryEn = `Heavy rain (${totalExpectedRainMm}mm) expected. Ensure field drainage and delay top-dressing.`;
    } else if (avgMaxTemp >= 39) {
      sowingWeatherVerdict = 'HEAT_STRESS_WARNING';
      verdictTextHi = `🔥 तेज़ गर्मी (${avgMaxTemp}°C) — शाम को हल्की सिंचाई करें`;
      verdictTextEn = `🔥 Heat Stress (${avgMaxTemp}°C) — Irrigate in Evening`;
    } else if (windSpeedKmh >= 20) {
      sowingWeatherVerdict = 'HIGH_WIND_WARNING';
      verdictTextHi = `💨 तेज़ हवा (${windSpeedKmh} km/h) — स्प्रे सुबह/शाम करें`;
      verdictTextEn = `💨 High Wind (${windSpeedKmh} km/h) — Avoid Midday Spray`;
    }

    const out = {
      location: labelHi, locationEn: labelEn, avgMaxTemp, avgMinTemp,
      totalExpectedRainMm, humidity, windSpeedKmh,
      sowingWeatherVerdict, verdictTextHi, verdictTextEn,
      forecastSummaryHi, forecastSummaryEn,
    };
    localStorage.setItem(ck, JSON.stringify(out));
    return out;
  } catch {
    try {
      const cached = localStorage.getItem(ck);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  }
}

// 2. Strict Agricultural POI Discovery (Blocks Beer/Wine/Apartments/Schools/Agroha!)
const VALID_SHOP_RE = /\b(beej|bhandar|seed|seeds|khad|fertilizer|fertiliser|agro|agri|krishi|kisan|iffco|kribhco|pacs|pesticide|mandi|nursery|seva kendra)\b/i;
const BLOCKED_SHOP_RE = /\b(beer|wine|liquor|alcohol|theka|bar|pub|club|apartment|apartments|residency|enclave|society|agroha|school|college|vidyalaya|academy|hospital|clinic|medical|pharmacy|hotel|dhaba|restaurant|cafe|bank|atm|petrol|pump|mandir|masjid|temple|church|gurudwara|cinema|mall|salon|gym|colony|vihar|park|station)\b/i;
const BLOCKED_OSM_VALS = new Set(['alcohol', 'beverages', 'wine', 'pub', 'bar', 'apartments', 'residential', 'school', 'college', 'hospital', 'restaurant', 'hotel', 'bank', 'fuel', 'place_of_worship']);

const VALID_LAB_RE = /\b(krishi|soil|kvk|agriculture|agricultural|vigyan|icar|mitti|mridha|horticulture|sugarcane|cane)\b/i;
const BLOCKED_LAB_RE = /\b(beer|wine|liquor|bar|apartment|apartments|inter college|public school|high school|dhaba|hotel|restaurant|bank|atm|petrol|mandir|masjid|hospital|clinic|pathology|diagnostic)\b/i;

export async function fetchLivePanIndiaPois(lat, lng, regionName = '') {
  if (!lat || !lng) return { shops: [], labs: [] };
  const ck = `${CACHE_PREFIX}pois_v8_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const district = regionName.split(',')[0].trim() || 'India';
  const MAX_SHOP_KM = 50;
  const shopBbox = `${(lng - 0.50).toFixed(4)},${(lat - 0.45).toFixed(4)},${(lng + 0.50).toFixed(4)},${(lat + 0.45).toFixed(4)}`;

  const shopTerms = ['Beej', 'Krishi', 'Fertilizer', 'Agro'];
  const shopFeatures = shopsMap.size < 2
    ? await Promise.all(shopTerms.map(t => queryPhoton(t, shopBbox)))
    : [];
  const MAX_LAB_KM = 45;

  const [dbLabs, dbShops] = await Promise.all([
    fetchNearbyLabs(lat, lng, MAX_LAB_KM),
    fetchNearbyShops(lat, lng, MAX_SHOP_KM),
  ]);

  const shopsMap = new Map();
  const labsMap = new Map();
  dbShops.filter(s => (s.distanceKm ?? 0) <= MAX_SHOP_KM && !BLOCKED_SHOP_RE.test(s.shopName || '')).forEach(s => shopsMap.set(s.shopName, s));
  dbLabs.filter(l => (l.distanceKm ?? 0) <= MAX_LAB_KM && !BLOCKED_LAB_RE.test(l.labName || '')).forEach(l => labsMap.set(l.labName, l));

  if (shopsMap.size < 2 || labsMap.size < 2) {
    const shopBbox = `${(lng - 0.25).toFixed(4)},${(lat - 0.22).toFixed(4)},${(lng + 0.25).toFixed(4)},${(lat + 0.22).toFixed(4)}`;
    const labBbox = `${(lng - 0.42).toFixed(4)},${(lat - 0.38).toFixed(4)},${(lng + 0.42).toFixed(4)},${(lat + 0.38).toFixed(4)}`;

    const queryPhoton = async (term, bbox) => {
      try {
        const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&lat=${lat}&lon=${lng}&bbox=${bbox}&limit=8`);
        return r.ok ? (await r.json()).features || [] : [];
      } catch { return []; }
    };

    const [shopFeatures, labFeatures] = await Promise.all([
      shopsMap.size < 2 ? Promise.all(['Fertilizer', 'IFFCO', 'Krishi Seva', 'Seeds', 'Pesticide', 'Khad'].map(t => queryPhoton(t, shopBbox))) : Promise.resolve([]),
      labsMap.size < 2 ? Promise.all(['Krishi Vigyan', 'Soil Testing', 'Agriculture', 'KVK'].map(t => queryPhoton(t, labBbox))) : Promise.resolve([]),
    ]);

    shopFeatures.flat().forEach((f, idx) => {
      const p = f.properties || {}, c = f.geometry?.coordinates || [];
      const name = String(p.name || '').trim();
      if (name.length < 4 || c.length < 2 || shopsMap.has(name)) return;
      if (BLOCKED_OSM_VALS.has(String(p.osm_value || '').toLowerCase())) return;
      if (!VALID_SHOP_RE.test(name) || BLOCKED_SHOP_RE.test(name)) return;
      const [elLng, elLat] = c;
      if (computeHaversineKm(lat, lng, elLat, elLng) > MAX_SHOP_KM) return;

      const distKm = computeHaversineKm(lat, lng, elLat, elLng);
      if (distKm > MAX_SHOP_KM) return;

      shopsMap.set(name, {
        id: `ph_s_${p.osm_id || idx}`,
        shopName: name,
        shopNameEn: name,
        distanceKm: distKm,
        shopType: /iffco|kribhco|pacs|coop|sahakari|mandi|govt/i.test(name) ? 'GOVT_COOP' : 'PRIVATE',
        district: p.county || p.city || district,
        address: [p.street, p.city, p.state].filter(Boolean).join(', ') || district,
        contactNumber: null, ureaBagsAvailable: null, dapBagsAvailable: null, mopBagsAvailable: null,
        isVerifiedPartner: false, stockStatus: 'CALL_TO_VERIFY', lat: elLat, lng: elLng,
      });
    });

    labFeatures.flat().forEach((f, idx) => {
      const p = f.properties || {}, c = f.geometry?.coordinates || [];
      const name = String(p.name || '').trim();
      if (name.length < 4 || c.length < 2 || labsMap.has(name)) return;
      if (!VALID_LAB_RE.test(name) || BLOCKED_LAB_RE.test(name)) return;
      const [elLng, elLat] = c;
      if (computeHaversineKm(lat, lng, elLat, elLng) > MAX_LAB_KM) return;

      const distKm = computeHaversineKm(lat, lng, elLat, elLng);
      if (distKm > MAX_LAB_KM) return;

        labsMap.set(name, {
          id: `ph_l_${p.osm_id || idx}`,
          labName: name,
          labNameEn: name,
          distanceKm: distKm, // <-- YE MISSING THA
          district: p.county || p.city || district,
          address: [p.street, p.city, p.state].filter(Boolean).join(', ') || district,
          contactNumber: '18001801551',
          isGovernmentLab: !/private/i.test(name),
          lat: elLat,
          lng: elLng,
        }
      );
    });
  }

  const out = {
    shops: normalizeLocations(Array.from(shopsMap.values()), lat, lng),
    labs: normalizeLocations(Array.from(labsMap.values()), lat, lng),
  };

  if (out.shops.length > 0 || out.labs.length > 0) {
    localStorage.setItem(ck, JSON.stringify(out));
  } else {
    try {
      const cached = localStorage.getItem(ck);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
  }
  return out;
}

// 3. Reverse Geocode & Pincode Lookup
export async function resolveLocationName(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=hi,en`);
    const a = (await r.json()).address || {};
    const c = a.city || a.town || a.county || a.state_district || 'आपका ज़िला';
    const s = a.state || 'भारत';
    return { labelHi: `${c}, ${s}`, labelEn: `${c}, ${s}`, district: c, state: s };
  } catch { return { labelHi: `GPS (${lat.toFixed(2)}°N)`, labelEn: `GPS (${lat.toFixed(2)}°N)`, district: '', state: '' }; }
}

export async function geocodeByPincodeOrDistrict(pincode, district) {
  try {
    const q = encodeURIComponent(`${pincode || ''} ${district || ''} India`.trim());
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
    const arr = await r.json();
    if (arr?.[0]) return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon), displayName: arr[0].display_name.split(',').slice(0, 2).join(', ') };
  } catch { /* ignore */ }
  return null;
}

// 4. Spring Boot Backend REST Helpers
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/catalog/init`, {
      signal: controller.signal,
      headers: getAuthHeaders(),
    });
    clearTimeout(timeoutId);
    const ct = res.headers.get('content-type') || '';
    return res.ok && ct.includes('application/json');
  } catch {
    return false;
  }
}

export const fetchCatalogInit = async () => (await fetch(`${API_BASE}/catalog/init`, { headers: getAuthHeaders() })).json();
export const sendOtp = async (m) => (await fetch(`${API_BASE}/auth/send-otp`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ mobileNumber: String(m).slice(-10) }) })).json();
export const verifyOtp = async (m, otp, fullName, preferredLanguage, extra = {}) => (await fetch(`${API_BASE}/auth/verify-otp`, { method: 'POST', headers: getAuthHeaders(), credentials: 'include', body: JSON.stringify({ mobileNumber: String(m).slice(-10), otp: String(otp).trim(), fullName, preferredLanguage, ...extra }) })).json();
export const extractSoilCard = async (blob) => { const fd = new FormData(); fd.append('image', blob); return (await fetch(`${API_BASE}/scanner/extract`, { method: 'POST', headers: getAuthHeaders(true), body: fd })).json(); };
export const analyzeSoil = async (p) => (await fetch(`${API_BASE}/engine/analyze`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();
export const fetchNearbyLabs = async (lat, lng, r = 50) => { try { const res = await fetch(`${API_BASE}/labs/nearby?lat=${lat}&lng=${lng}&radiusKm=${r}`, { headers: getAuthHeaders() }); return (res.ok && (res.headers.get('content-type') || '').includes('json')) ? normalizeLocations(await res.json(), lat, lng) : []; } catch { return []; } };
export const fetchNearbyShops = async (lat, lng, r = 50) => { try { const res = await fetch(`${API_BASE}/catalog/shops/nearby?lat=${lat}&lng=${lng}&radiusKm=${r}`, { headers: getAuthHeaders() }); return (res.ok && (res.headers.get('content-type') || '').includes('json')) ? normalizeLocations(await res.json(), lat, lng) : []; } catch { return []; } };
export const adminSaveCrop = async (p) => (await fetch(`${API_BASE}/catalog/admin/crops`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();
export const adminDeleteCrop = async (c) => fetch(`${API_BASE}/catalog/admin/crops/${encodeURIComponent(c)}`, { method: 'DELETE', headers: getAuthHeaders() });
export const adminSaveFertilizerRate = async (p) => (await fetch(`${API_BASE}/catalog/admin/fertilizers`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();
export const adminSaveShop = async (p) => (await fetch(`${API_BASE}/catalog/admin/shops`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();
export const adminDeleteShop = async (id) => fetch(`${API_BASE}/catalog/admin/shops/${encodeURIComponent(id)}`, { method: 'DELETE', headers: getAuthHeaders() });
export const adminSaveLab = async (p) => (await fetch(`${API_BASE}/labs/admin`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();
export const adminPushReportToFarmer = async (p) => (await fetch(`${API_BASE}/labs/push-report`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();

// 5. Permanent Farm Plot & Crop History Ledger APIs (PostgreSQL)
export const fetchMyFarms = async () => {
  const res = await fetch(`${API_BASE}/farms`, { headers: getAuthHeaders() });
  return (res.ok && (res.headers.get('content-type') || '').includes('json')) ? res.json() : [];
};
export const saveFarmPlotApi = async (payload) => {
  const res = await fetch(`${API_BASE}/farms`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
export const addCropHistoryApi = async (plotId, payload) => {
  const res = await fetch(`${API_BASE}/farms/${plotId}/history`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
export const deleteFarmPlotApi = async (plotId) =>
  fetch(`${API_BASE}/farms/${plotId}`, { method: 'DELETE', headers: getAuthHeaders() });