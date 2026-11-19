// src/api/krishicoreApi.js
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
const CACHE_PREFIX = 'krishicore_pwa_cache_';

function getAuthHeaders(isMultipart = false) {
  const headers = {};
  const token = localStorage.getItem('krishicore_token');
  if (token && !token.startsWith('demo_token_')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
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

// 1. Live 16-Day Weather Forecast (Open-Meteo Public API)
export async function fetchLive16DayWeather(lat, lng, labelHi = 'आपका क्षेत्र', labelEn = 'Your Region') {
  const ck = `${CACHE_PREFIX}w_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current=relative_humidity_2m,wind_speed_10m&forecast_days=16&timezone=auto`);
    const d = await res.json();
    const maxT = d.daily?.temperature_2m_max || [28];
    const minT = d.daily?.temperature_2m_min || [16];
    const rain = d.daily?.precipitation_sum || [0];
    const avgMaxTemp = Number((maxT.reduce((a, b) => a + b, 0) / maxT.length).toFixed(1));
    const avgMinTemp = Number((minT.reduce((a, b) => a + b, 0) / minT.length).toFixed(1));
    const totalExpectedRainMm = Number(rain.reduce((a, b) => a + b, 0).toFixed(1));
    const next3d = Number(rain.slice(0, 3).reduce((a, b) => a + b, 0).toFixed(1));
    const heavy = next3d > 20 || totalExpectedRainMm > 65;

    const w = {
      location: labelHi, locationEn: labelEn, avgMaxTemp, avgMinTemp, totalExpectedRainMm,
      humidity: d.current?.relative_humidity_2m ?? 54, windSpeedKmh: d.current?.wind_speed_10m ?? 9.2,
      sowingWeatherVerdict: heavy ? 'HEAVY_RAIN_WARNING' : 'SAFE_FOR_SOWING',
      verdictTextHi: heavy ? `🔴 बारिश चेतावनी (${totalExpectedRainMm}mm) — स्प्रे/यूरिया रोकें` : '🟢 अनुकूल मौसम — बुवाई व खाद छिड़काव सुरक्षित',
      verdictTextEn: heavy ? `🔴 Rain Alert (${totalExpectedRainMm}mm) — Hold Spray` : '🟢 Optimal Weather — Safe Spray Window',
      forecastSummaryHi: `अगले 16 दिन ${labelHi} में तापमान ${avgMinTemp}°C–${avgMaxTemp}°C और संभावित वर्षा ${totalExpectedRainMm}mm रहेगी।`,
      forecastSummaryEn: `16-day forecast for ${labelEn}: Temp ${avgMinTemp}°C–${avgMaxTemp}°C, expected rain ${totalExpectedRainMm}mm.`,
    };
    localStorage.setItem(ck, JSON.stringify(w));
    return w;
  } catch {
    const c = localStorage.getItem(ck);
    return c ? JSON.parse(c) : null;
  }
}

// 2. Pan-India Live Labs & Fertilizer Centres (Backend DB + OSM Overpass + Nominatim, ZERO Fake Stock)
export async function fetchLivePanIndiaPois(lat, lng, regionName = '') {
  if (!lat || !lng) return { shops: [], labs: [] };
  const ck = `${CACHE_PREFIX}pois_v6_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const district = regionName.split(',')[0].trim() || 'India';

  // 1. Primary Source: Spring Boot Backend (DB + Server-Side Photon & Overpass Discovery)
  const [dbLabs, dbShops] = await Promise.all([
    fetchNearbyLabs(lat, lng, 60),
    fetchNearbyShops(lat, lng, 60),
  ]);

  const shopsMap = new Map();
  const labsMap = new Map();
  dbShops.forEach((s) => shopsMap.set(s.shopName, s));
  dbLabs.forEach((l) => labsMap.set(l.labName, l));

  // 2. Fallback ONLY if Backend is offline or returned < 2 results: Fast Photon BBox API
  if (shopsMap.size < 2 || labsMap.size < 2) {
    const bbox = `${(lng - 0.5).toFixed(4)},${(lat - 0.45).toFixed(4)},${(lng + 0.5).toFixed(4)},${(lat + 0.45).toFixed(4)}`;
    const queryPhoton = async (term) => {
      try {
        const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&lat=${lat}&lon=${lng}&bbox=${bbox}&limit=8`);
        return r.ok ? (await r.json()).features || [] : [];
      } catch { return []; }
    };

    const [shopFeatures, labFeatures] = await Promise.all([
      shopsMap.size < 2 ? Promise.all(['Agro', 'Fertilizer', 'IFFCO', 'Beej'].map(queryPhoton)) : Promise.resolve([]),
      labsMap.size < 2 ? Promise.all(['Krishi', 'Agriculture', 'Soil'].map(queryPhoton)) : Promise.resolve([]),
    ]);

    shopFeatures.flat().forEach((f, idx) => {
      const p = f.properties || {}, c = f.geometry?.coordinates || [];
      if (!p.name || c.length < 2 || shopsMap.has(p.name)) return;
      const [elLng, elLat] = c;
      if (computeHaversineKm(lat, lng, elLat, elLng) > 65) return;
      shopsMap.set(p.name, {
        id: `ph_s_${p.osm_id || idx}`, shopName: p.name, shopNameEn: p.name,
        shopType: /iffco|kribhco|pacs|coop|mandi|govt/i.test(p.name) ? 'GOVT_COOP' : 'PRIVATE',
        district: p.county || p.city || district,
        address: [p.street, p.city, p.state].filter(Boolean).join(', ') || district,
        contactNumber: null, ureaBagsAvailable: null, dapBagsAvailable: null, mopBagsAvailable: null,
        isVerifiedPartner: false, stockStatus: 'CALL_TO_VERIFY', lat: elLat, lng: elLng,
      });
    });

    labFeatures.flat().forEach((f, idx) => {
      const p = f.properties || {}, c = f.geometry?.coordinates || [];
      if (!p.name || c.length < 2 || labsMap.has(p.name)) return;
      const [elLng, elLat] = c;
      if (computeHaversineKm(lat, lng, elLat, elLng) > 65) return;
      labsMap.set(p.name, {
        id: `ph_l_${p.osm_id || idx}`, labName: p.name, labNameEn: p.name,
        district: p.county || p.city || district,
        address: [p.street, p.city, p.state].filter(Boolean).join(', ') || district,
        contactNumber: '18001801551', isGovernmentLab: !/private/i.test(p.name), lat: elLat, lng: elLng,
      });
    });
  }

  const out = {
    shops: normalizeLocations(Array.from(shopsMap.values()), lat, lng),
    labs: normalizeLocations(Array.from(labsMap.values()), lat, lng),
  };

  // Never cache empty results!
  if (out.shops.length > 0 || out.labs.length > 0) {
    localStorage.setItem(ck, JSON.stringify(out));
  } else {
    const cached = localStorage.getItem(ck);
    if (cached) return JSON.parse(cached);
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
    return res.ok;
  } catch {
    return false;
  }
}
export const fetchCatalogInit = async () => (await fetch(`${API_BASE}/catalog/init`, { headers: getAuthHeaders() })).json();
export const sendOtp = async (m) => (await fetch(`${API_BASE}/auth/send-otp`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ mobileNumber: String(m).slice(-10) }) })).json();
export const verifyOtp = async (m, otp, fullName, preferredLanguage, extra = {}) => (await fetch(`${API_BASE}/auth/verify-otp`, { method: 'POST', headers: getAuthHeaders(), credentials: 'include', body: JSON.stringify({ mobileNumber: String(m).slice(-10), otp: String(otp).trim(), fullName, preferredLanguage, ...extra }) })).json();
export const extractSoilCard = async (blob) => { const fd = new FormData(); fd.append('image', blob); return (await fetch(`${API_BASE}/scanner/extract`, { method: 'POST', headers: getAuthHeaders(true), body: fd })).json(); };
export const analyzeSoil = async (p) => (await fetch(`${API_BASE}/engine/analyze`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(p) })).json();
export const fetchNearbyLabs = async (lat, lng, r = 50) => { try { const res = await fetch(`${API_BASE}/labs/nearby?lat=${lat}&lng=${lng}&radiusKm=${r}`, { headers: getAuthHeaders() }); return res.ok ? normalizeLocations(await res.json(), lat, lng) : []; } catch { return []; } };
export const fetchNearbyShops = async (lat, lng, r = 50) => { try { const res = await fetch(`${API_BASE}/catalog/shops/nearby?lat=${lat}&lng=${lng}&radiusKm=${r}`, { headers: getAuthHeaders() }); return res.ok ? normalizeLocations(await res.json(), lat, lng) : []; } catch { return []; } };
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
  return res.ok ? res.json() : [];
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