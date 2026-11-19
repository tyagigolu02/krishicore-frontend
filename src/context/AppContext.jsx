// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCatalogInit, checkBackendHealth, analyzeSoil,
  normalizeBackendCrops, normalizeBackendFertilizers, normalizeLocations,
  fetchLive16DayWeather, fetchLivePanIndiaPois,
  adminSaveCrop, adminDeleteCrop, adminSaveFertilizerRate, adminSaveShop, adminDeleteShop, adminSaveLab
} from '../api/krishicoreApi';
import {
  DEFAULT_METRICS, DEFAULT_CROP_PROFILES, DEFAULT_FERTILIZER_RATES,
  DEFAULT_WEATHER, UNIT_NAMES_HI, UNIT_NAMES_EN
} from '../data/fallbackData';
import { getVarietiesForCrop } from '../data/cropVarieties';
import { convertToAcres, computeFertilizerPlan, computeRemedies, calculateRecommendedCrops } from '../utils/calculations';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useGeolocation } from '../hooks/useGeolocation';

const AppContext = createContext(null);
const KEYS = { CROPS: 'kc_crops_v6', RATES: 'kc_rates_v6', SHOPS: 'kc_shops_v6', LABS: 'kc_labs_v6', ACCOUNTS: 'kc_permanent_accounts_v1' };
const loadLocal = (k, def) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : def; } catch { return def; } };

export function AppProvider({ children }) {
  const [lang, setLang] = useState('HI');
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [backendChecking, setBackendChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('workspace');

  const { isOnline, connectionType, isSlowNetwork } = useOnlineStatus();
  const { coords: userCoords, setCoords: setUserCoords, locationLabel, locating, detectLiveGps, updateByPincodeOrCity } = useGeolocation();

  const [user, setUser] = useState(() => loadLocal('krishicore_user', null));
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [cropProfiles, setCropProfiles] = useState(() => loadLocal(KEYS.CROPS, DEFAULT_CROP_PROFILES));
  const [fertilizerRates, setFertilizerRates] = useState(() => loadLocal(KEYS.RATES, DEFAULT_FERTILIZER_RATES));
  const [shops, setShops] = useState(() => loadLocal(KEYS.SHOPS, []));
  const [labs, setLabs] = useState(() => loadLocal(KEYS.LABS, []));

  const [selectedCrop, setSelectedCrop] = useState('WHEAT');
  const [selectedVarietyId, setSelectedVarietyId] = useState('HD3226');
  const [phosSource, setPhosSource] = useState('DAP');
  const [areaValue, setAreaValue] = useState(5);
  const [areaUnit, setAreaUnit] = useState('ACRE');
  const [radiusKm, setRadiusKm] = useState(50);

  const [metrics, setMetrics] = useState({ ...DEFAULT_METRICS });
  const [scannerLoading, setScannerLoading] = useState(false);
  const [compressionTelemetry, setCompressionTelemetry] = useState(null);
  const [invalidCardWarning, setInvalidCardWarning] = useState(null);

  const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER);
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync variety whenever crop changes
  const varietiesForCrop = getVarietiesForCrop(selectedCrop);
  const currentVariety = varietiesForCrop.find(v => v.id === selectedVarietyId) || varietiesForCrop[0];
  useEffect(() => { setSelectedVarietyId(getVarietiesForCrop(selectedCrop)[0]?.id || 'STD'); }, [selectedCrop]);

  const totalAcres = Math.max(0.05, convertToAcres(areaValue, areaUnit));
  const currentCrop = cropProfiles.find(c => c.code === selectedCrop) || cropProfiles[0];
  const plan = computeFertilizerPlan(metrics, currentCrop, totalAcres, phosSource, fertilizerRates, currentVariety);
  const remedies = computeRemedies(metrics, totalAcres, phosSource, plan);

  const lastSyncedGeoRef = useRef('');
  useEffect(() => {
    if (!userCoords?.lat || !userCoords?.lng) return;
    const hi = locationLabel?.labelHi || '';
    const en = locationLabel?.labelEn || '';
    const sig = `${userCoords.lat.toFixed(2)}_${userCoords.lng.toFixed(2)}_${hi}`;
    if (lastSyncedGeoRef.current === sig) return;
    lastSyncedGeoRef.current = sig;

    let active = true;
    async function syncRegionalData() {
      if (hi && !hi.includes('खोजी जा रही')) {
        const s = hi.toLowerCase();
        if (/maharashtra|gujarat|karnataka|goa|महाराष्ट्र|गुजरात|कर्नाटक/.test(s)) setAreaUnit('GUNTHA');
        else if (/punjab|haryana|himachal|jammu|पंजाब|हरियाणा/.test(s)) setAreaUnit('KANAL');
        else if (/tamil|kerala|andhra|telangana|तमिल|केरल|आंध्र/.test(s)) setAreaUnit('CENT');
        else if (/uttar pradesh|uttarakhand|उत्तर प्रदेश|उत्तराखंड/.test(s)) setAreaUnit('KACCHA_BIGHA');
        else if (/bihar|rajasthan|madhya pradesh|west bengal|बिहार|राजस्थान|मध्य प्रदेश/.test(s)) setAreaUnit('PAKKA_BIGHA');
      }
      const liveW = await fetchLive16DayWeather(userCoords.lat, userCoords.lng, hi || 'आपका क्षेत्र', en || 'Your Region');
      if (active && liveW) setWeatherData(liveW);

      const pois = await fetchLivePanIndiaPois(userCoords.lat, userCoords.lng, hi);
      if (active) {
        setShops(prev => normalizeLocations([...prev.filter(s => s.isUserRegistered), ...pois.shops], userCoords.lat, userCoords.lng));
        setLabs(prev => normalizeLocations([...prev.filter(l => l.isUserRegistered), ...pois.labs], userCoords.lat, userCoords.lng));
      }
    }
    syncRegionalData();
    return () => { active = false; };
  }, [userCoords?.lat, userCoords?.lng, locationLabel?.labelHi, locationLabel?.labelEn]);

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    checkBackendHealth().then(async (online) => {
      setIsLiveBackend(online);
      if (online) {
        const data = await fetchCatalogInit();
        const nc = normalizeBackendCrops(data.crops);
        if (nc) setCropProfiles(nc);
        if (data.fertilizerRates) setFertilizerRates(p => normalizeBackendFertilizers(data.fertilizerRates, p));
      }
    });
  }, []);

  useEffect(() => {
    setRecommendedCrops(calculateRecommendedCrops(metrics, weatherData, cropProfiles));
  }, [metrics, weatherData, cropProfiles]);

  const updateMetric = useCallback((k, v) => setMetrics(p => ({ ...p, [k]: parseFloat(v) || 0 })), []);
  const resetMetrics = useCallback(() => { setMetrics({ ...DEFAULT_METRICS }); setInvalidCardWarning(null); }, []);
  const toggleApiMode = useCallback(async (wantLive) => { setBackendChecking(true); setIsLiveBackend(wantLive ? await checkBackendHealth() : false); setBackendChecking(false); }, []);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const liveW = userCoords ? await fetchLive16DayWeather(userCoords.lat, userCoords.lng, weatherData.location, weatherData.locationEn) : null;
      if (liveW) setWeatherData(liveW);
      if (isLiveBackend && userCoords) {
        const res = await analyzeSoil({ ...metrics, latitude: userCoords.lat, longitude: userCoords.lng, preferredCrop: selectedCrop, phosphateSource: phosSource });
        if (res.recommendedCrops?.length) {
          setRecommendedCrops(res.recommendedCrops.map(rc => ({
            cropCode: rc.cropCode, nameHi: rc.cropName, nameEn: rc.cropName,
            suitabilityScore: rc.matchScoreOutOf100 ?? 88, expectedYield: '20–25 क्विंटल/एकड़', expectedYieldEn: '20–25 Qtl/Acre',
            reasonHi: rc.agronomicReason, reasonEn: rc.agronomicReason
          })));
        }
      }
    } finally { setIsAnalyzing(false); }
  }, [isLiveBackend, metrics, selectedCrop, phosSource, userCoords, weatherData.location, weatherData.locationEn]);

  const saveFertilizerRateAdmin = useCallback((code, spec) => {
    setFertilizerRates(p => { const n = { ...p, [code]: { ...p[code], ...spec } }; localStorage.setItem(KEYS.RATES, JSON.stringify(n)); return n; });
    if (isLiveBackend) adminSaveFertilizerRate({ code, nameHi: spec.name, nameEn: spec.nameEn, bagWeightKg: spec.bagKg, govtMrpPerBagInr: spec.mrpBag }).catch(() => {});
  }, [isLiveBackend]);

  const saveCropAdmin = useCallback((crop) => {
    const code = String(crop.code).toUpperCase();
    setCropProfiles(p => { const n = [...p.filter(c => c.code !== code), { ...crop, code }]; localStorage.setItem(KEYS.CROPS, JSON.stringify(n)); return n; });
    if (isLiveBackend) adminSaveCrop({ cropCode: code, cropName: crop.name, recommendedVariety: 'ICAR', season: crop.season, targetN_KgHa: crop.n, targetP_KgHa: crop.p, targetK_KgHa: crop.k }).catch(() => {});
  }, [isLiveBackend]);

  const deleteCropAdmin = useCallback((code) => {
    setCropProfiles(p => { const n = p.filter(c => c.code !== code); localStorage.setItem(KEYS.CROPS, JSON.stringify(n)); return n; });
    if (isLiveBackend) adminDeleteCrop(code).catch(() => {});
  }, [isLiveBackend]);

  const saveShopAdmin = useCallback((shop) => {
    const lat = Number(shop.lat || userCoords?.lat || 28.98), lng = Number(shop.lng || userCoords?.lng || 77.70);
    const item = { ...shop, id: shop.id || `shop_${Date.now()}`, isUserRegistered: true, isVerifiedPartner: true, stockStatus: 'VERIFIED_LIVE_STOCK', lat, lng };
    setShops(p => { const n = normalizeLocations([item, ...p.filter(s => s.id !== item.id && s.shopName !== item.shopName)], lat, lng); localStorage.setItem(KEYS.SHOPS, JSON.stringify(n)); return n; });
    if (isLiveBackend) adminSaveShop({ ...item, latitude: lat, longitude: lng }).catch(() => {});
  }, [isLiveBackend, userCoords]);

  const deleteShopAdmin = useCallback((id) => { setShops(p => p.filter(s => s.id !== id && s.shopName !== id)); if (isLiveBackend) adminDeleteShop(id).catch(() => {}); }, [isLiveBackend]);

  const saveLabAdmin = useCallback((lab) => {
    const lat = Number(lab.lat || userCoords?.lat || 28.98), lng = Number(lab.lng || userCoords?.lng || 77.70);
    const item = { ...lab, id: lab.id || `lab_${Date.now()}`, isUserRegistered: true, lat, lng };
    setLabs(p => { const n = normalizeLocations([item, ...p.filter(l => l.id !== item.id && l.labName !== item.labName)], lat, lng); localStorage.setItem(KEYS.LABS, JSON.stringify(n)); return n; });
    if (isLiveBackend) adminSaveLab({ ...item, latitude: lat, longitude: lng }).catch(() => {});
  }, [isLiveBackend, userCoords]);

  const deleteLabAdmin = useCallback((id) => setLabs(p => p.filter(l => l.id !== id && l.labName !== id)), []);

  const login = useCallback(async (userData, token) => {
    const accMap = loadLocal(KEYS.ACCOUNTS, {});
    const permanentUser = accMap[userData.mobileNumber] || userData;
    if (!accMap[userData.mobileNumber]) {
      accMap[userData.mobileNumber] = permanentUser;
      localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accMap));
    }
    setUser(permanentUser);
    localStorage.setItem('krishicore_token', token);
    localStorage.setItem('krishicore_user', JSON.stringify(permanentUser));
    setShowAuthModal(false);

    if (permanentUser.pincode || permanentUser.district) {
      await updateByPincodeOrCity(permanentUser.pincode, permanentUser.district);
    }
  }, [updateByPincodeOrCity]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('krishicore_token');
    localStorage.removeItem('krishicore_user');
    setActiveTab('workspace');
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang, isOnline, connectionType, isSlowNetwork, isLiveBackend, backendChecking, toggleApiMode,
      activeTab, setActiveTab, user, login, logout, showAuthModal, setShowAuthModal,
      userCoords, setUserCoords, locating, detectLiveGps, updateByPincodeOrCity,
      cropProfiles, fertilizerRates, shops, setShops, labs, setLabs,
      selectedCrop, setSelectedCrop, selectedVarietyId, setSelectedVarietyId, varietiesForCrop, currentVariety,
      phosSource, setPhosSource, areaValue, setAreaValue, areaUnit, setAreaUnit, radiusKm, setRadiusKm,
      metrics, setMetrics, updateMetric, resetMetrics, scannerLoading, setScannerLoading, compressionTelemetry, setCompressionTelemetry, invalidCardWarning, setInvalidCardWarning,
      weatherData, recommendedCrops, isAnalyzing, runAnalysis, totalAcres, currentCrop, plan, remedies,
      unitNames: lang === 'HI' ? UNIT_NAMES_HI : UNIT_NAMES_EN,
      saveFertilizerRateAdmin, saveCropAdmin, deleteCropAdmin, saveShopAdmin, deleteShopAdmin, saveLabAdmin, deleteLabAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);