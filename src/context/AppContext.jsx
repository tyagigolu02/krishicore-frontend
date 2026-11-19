// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCatalogInit, checkBackendHealth, analyzeSoil, normalizeBackendCrops, normalizeBackendFertilizers,
  normalizeLocations, fetchLive16DayWeather, fetchLivePanIndiaPois,
  adminSaveCrop, adminDeleteCrop, adminSaveFertilizerRate, adminSaveShop, adminDeleteShop, adminSaveLab,
  fetchMyFarms, saveFarmPlotApi, addCropHistoryApi, deleteFarmPlotApi
} from '../api/krishicoreApi';
import { DEFAULT_METRICS, DEFAULT_CROP_PROFILES, DEFAULT_FERTILIZER_RATES, DEFAULT_WEATHER, UNIT_NAMES_HI, UNIT_NAMES_EN } from '../data/fallbackData';
import { getVarietiesForCrop } from '../data/cropVarieties';
import { convertToAcres, computeFertilizerPlan, computeRemedies, calculateRecommendedCrops } from '../utils/calculations';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useGeolocation } from '../hooks/useGeolocation';

const AppContext = createContext(null);
const KEYS = { CROPS: 'kc_crops_v7', RATES: 'kc_rates_v7', SHOPS: 'kc_shops_v7', LABS: 'kc_labs_v7', FARMS: 'kc_farms_v1', ACCOUNTS: 'kc_permanent_accounts_v1' };
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

  // Permanent Farm Plot & Crop Rotation State
  const [farms, setFarms] = useState(() => loadLocal(KEYS.FARMS, []));
  const [activePlotId, setActivePlotId] = useState(null);
  const [previousCropCode, setPreviousCropCode] = useState('');

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

  const varietiesForCrop = getVarietiesForCrop(selectedCrop);
  const currentVariety = varietiesForCrop.find(v => v.id === selectedVarietyId) || varietiesForCrop[0];
  useEffect(() => { setSelectedVarietyId(getVarietiesForCrop(selectedCrop)[0]?.id || 'STD'); }, [selectedCrop]);

  const activeFarmEntry = farms.find(f => f.plot?.id === activePlotId) || null;
  const totalAcres = Math.max(0.05, convertToAcres(areaValue, areaUnit));
  const currentCrop = cropProfiles.find(c => c.code === selectedCrop) || cropProfiles[0];
  const plan = computeFertilizerPlan(metrics, currentCrop, totalAcres, phosSource, fertilizerRates, currentVariety);
  const remedies = computeRemedies(metrics, totalAcres, phosSource, plan);

  // Load farmer's permanent PostgreSQL farm plots on login
  useEffect(() => {
    if (!user || !isLiveBackend) return;
    fetchMyFarms().then(list => {
      if (Array.isArray(list) && list.length > 0) {
        setFarms(list);
        localStorage.setItem(KEYS.FARMS, JSON.stringify(list));
      }
    }).catch(() => {});
  }, [user, isLiveBackend]);

  const selectFarmPlot = useCallback((plotId) => {
    setActivePlotId(plotId);
    const entry = farms.find(f => f.plot?.id === plotId);
    if (entry?.plot) {
      setAreaValue(entry.plot.areaValue);
      setAreaUnit(entry.plot.areaUnit);
      setPreviousCropCode(entry.plot.lastCropCode || '');
    }
  }, [farms]);

  const saveFarmPlot = useCallback(async (payload) => {
    try {
      const saved = (user && isLiveBackend) ? await saveFarmPlotApi(payload)
        : { ...payload, id: payload.id || `local_${Date.now()}`, updatedAt: new Date().toISOString() };
      setFarms(prev => {
        const exists = prev.find(f => f.plot.id === saved.id);
        const next = exists ? prev.map(f => f.plot.id === saved.id ? { ...f, plot: saved } : f) : [{ plot: saved, history: [] }, ...prev];
        localStorage.setItem(KEYS.FARMS, JSON.stringify(next));
        return next;
      });
      setActivePlotId(saved.id);
      setAreaValue(saved.areaValue);
      setAreaUnit(saved.areaUnit);
      setPreviousCropCode(saved.lastCropCode || '');
      return saved;
    } catch { return null; }
  }, [user, isLiveBackend]);

  const logFarmSeason = useCallback(async (plotId, entryPayload) => {
    const savedEntry = (user && isLiveBackend && !String(plotId).startsWith('local_'))
      ? await addCropHistoryApi(plotId, entryPayload)
      : { ...entryPayload, id: `hist_${Date.now()}`, recordedAt: new Date().toISOString() };
    setFarms(prev => {
      const next = prev.map(f => f.plot.id !== plotId ? f : {
        plot: { ...f.plot, lastCropCode: savedEntry.cropCode, lastSeasonYear: `${savedEntry.season} ${savedEntry.cropYear}`, lastYieldQtlPerAcre: savedEntry.yieldQtlPerAcre },
        history: [savedEntry, ...(f.history || [])]
      });
      localStorage.setItem(KEYS.FARMS, JSON.stringify(next));
      return next;
    });
    setPreviousCropCode(savedEntry.cropCode);
  }, [user, isLiveBackend]);

  const deleteFarmPlot = useCallback(async (plotId) => {
    setFarms(prev => { const next = prev.filter(f => f.plot.id !== plotId); localStorage.setItem(KEYS.FARMS, JSON.stringify(next)); return next; });
    if (activePlotId === plotId) { setActivePlotId(null); setPreviousCropCode(''); }
    if (user && isLiveBackend && !String(plotId).startsWith('local_')) deleteFarmPlotApi(plotId).catch(() => {});
  }, [activePlotId, user, isLiveBackend]);

  const lastSyncedGeoRef = useRef('');
  useEffect(() => {
    if (!userCoords?.lat || !userCoords?.lng) return;
    const hi = locationLabel?.labelHi || '', en = locationLabel?.labelEn || '';
    const sig = `${userCoords.lat.toFixed(2)}_${userCoords.lng.toFixed(2)}_${hi}`;
    if (lastSyncedGeoRef.current === sig) return;
    lastSyncedGeoRef.current = sig;
    let active = true;
    (async () => {
      if (hi && !hi.includes('खोजी जा रही') && !activePlotId) {
        const s = hi.toLowerCase();
        if (/maharashtra|gujarat|karnataka|goa|महाराष्ट्र|गुजरात/.test(s)) setAreaUnit('GUNTHA');
        else if (/punjab|haryana|पंजाब|हरियाणा/.test(s)) setAreaUnit('KANAL');
        else if (/tamil|kerala|andhra|telangana/.test(s)) setAreaUnit('CENT');
        else if (/uttar pradesh|uttarakhand|उत्तर प्रदेश/.test(s)) setAreaUnit('KACCHA_BIGHA');
        else if (/bihar|rajasthan|madhya pradesh|बिहार|राजस्थान/.test(s)) setAreaUnit('PAKKA_BIGHA');
      }
      const liveW = await fetchLive16DayWeather(userCoords.lat, userCoords.lng, hi || 'आपका क्षेत्र', en || 'Your Region');
      if (active && liveW) setWeatherData(liveW);
      const pois = await fetchLivePanIndiaPois(userCoords.lat, userCoords.lng, hi);
      if (active) {
        setShops(p => normalizeLocations([...p.filter(s => s.isUserRegistered), ...pois.shops], userCoords.lat, userCoords.lng));
        setLabs(p => normalizeLocations([...p.filter(l => l.isUserRegistered), ...pois.labs], userCoords.lat, userCoords.lng));
      }
    })();
    return () => { active = false; };
  }, [userCoords?.lat, userCoords?.lng, locationLabel?.labelHi, locationLabel?.labelEn, activePlotId]);

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    checkBackendHealth().then(async (online) => {
      setIsLiveBackend(online);
      if (online) {
        const data = await fetchCatalogInit();
        const nc = normalizeBackendCrops(data.crops);
        if (nc && nc.length >= 10) setCropProfiles(nc);
        if (data.fertilizerRates) setFertilizerRates(p => normalizeBackendFertilizers(data.fertilizerRates, p));
      }
    });
  }, []);

  useEffect(() => {
    setRecommendedCrops(calculateRecommendedCrops(metrics, weatherData, cropProfiles, previousCropCode));
  }, [metrics, weatherData, cropProfiles, previousCropCode]);

  const updateMetric = useCallback((k, v) => setMetrics(p => ({ ...p, [k]: parseFloat(v) || 0 })), []);
  const resetMetrics = useCallback(() => { setMetrics({ ...DEFAULT_METRICS }); setInvalidCardWarning(null); }, []);
  const toggleApiMode = useCallback(async (w) => { setBackendChecking(true); setIsLiveBackend(w ? await checkBackendHealth() : false); setBackendChecking(false); }, []);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const liveW = userCoords ? await fetchLive16DayWeather(userCoords.lat, userCoords.lng, weatherData.location, weatherData.locationEn) : null;
      if (liveW) setWeatherData(liveW);
      if (isLiveBackend && userCoords) {
        const res = await analyzeSoil({ ...metrics, latitude: userCoords.lat, longitude: userCoords.lng, preferredCrop: selectedCrop, phosphateSource: phosSource, previousCropCode });
        if (res.recommendedCrops?.length) {
          setRecommendedCrops(res.recommendedCrops.map(rc => {
            const ref = DEFAULT_CROP_PROFILES.find(c => c.code === rc.cropCode);
            return { cropCode: rc.cropCode, category: ref?.category || 'CEREAL', nameHi: rc.cropName, nameEn: rc.cropName, suitabilityScore: rc.matchScoreOutOf100 ?? 88, expectedYield: ref?.expectedYieldHi || '20–25 क्विंटल/एकड़', expectedYieldEn: ref?.expectedYieldEn || '20–25 Qtl/Acre', reasonHi: rc.agronomicReason, reasonEn: rc.agronomicReason };
          }));
        }
      }
    } finally { setIsAnalyzing(false); }
  }, [isLiveBackend, metrics, selectedCrop, phosSource, previousCropCode, userCoords, weatherData.location, weatherData.locationEn]);

  const saveFertilizerRateAdmin = useCallback((c, sp) => { setFertilizerRates(p => { const n = { ...p, [c]: { ...p[c], ...sp } }; localStorage.setItem(KEYS.RATES, JSON.stringify(n)); return n; }); if (isLiveBackend) adminSaveFertilizerRate({ code: c, nameHi: sp.name, nameEn: sp.nameEn, bagWeightKg: sp.bagKg, govtMrpPerBagInr: sp.mrpBag }).catch(() => {}); }, [isLiveBackend]);
  const saveCropAdmin = useCallback((crop) => { const c = String(crop.code).toUpperCase(); setCropProfiles(p => { const n = [...p.filter(x => x.code !== c), { ...crop, code: c }]; localStorage.setItem(KEYS.CROPS, JSON.stringify(n)); return n; }); if (isLiveBackend) adminSaveCrop({ cropCode: c, cropName: crop.name, recommendedVariety: 'ICAR', season: crop.season, targetN_KgHa: crop.n, targetP_KgHa: crop.p, targetK_KgHa: crop.k }).catch(() => {}); }, [isLiveBackend]);
  const deleteCropAdmin = useCallback((c) => { setCropProfiles(p => p.filter(x => x.code !== c)); if (isLiveBackend) adminDeleteCrop(c).catch(() => {}); }, [isLiveBackend]);
  const saveShopAdmin = useCallback((sh) => { const lat = Number(sh.lat || userCoords?.lat || 28.98), lng = Number(sh.lng || userCoords?.lng || 77.7); const it = { ...sh, id: sh.id || `shop_${Date.now()}`, isUserRegistered: true, isVerifiedPartner: true, stockStatus: 'VERIFIED_LIVE_STOCK', lat, lng }; setShops(p => normalizeLocations([it, ...p.filter(s => s.id !== it.id)], lat, lng)); if (isLiveBackend) adminSaveShop({ ...it, latitude: lat, longitude: lng }).catch(() => {}); }, [isLiveBackend, userCoords]);
  const deleteShopAdmin = useCallback((id) => { setShops(p => p.filter(s => s.id !== id)); if (isLiveBackend) adminDeleteShop(id).catch(() => {}); }, [isLiveBackend]);
  const saveLabAdmin = useCallback((lb) => { const lat = Number(lb.lat || userCoords?.lat || 28.98), lng = Number(lb.lng || userCoords?.lng || 77.7); const it = { ...lb, id: lb.id || `lab_${Date.now()}`, isUserRegistered: true, lat, lng }; setLabs(p => normalizeLocations([it, ...p.filter(l => l.id !== it.id)], lat, lng)); if (isLiveBackend) adminSaveLab({ ...it, latitude: lat, longitude: lng }).catch(() => {}); }, [isLiveBackend, userCoords]);
  const deleteLabAdmin = useCallback((id) => setLabs(p => p.filter(l => l.id !== id)), []);

  const login = useCallback(async (userData, token) => {
    const accMap = loadLocal(KEYS.ACCOUNTS, {});
    const perm = accMap[userData.mobileNumber] || userData;
    if (!accMap[userData.mobileNumber]) { accMap[userData.mobileNumber] = perm; localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accMap)); }
    setUser(perm); localStorage.setItem('krishicore_token', token); localStorage.setItem('krishicore_user', JSON.stringify(perm)); setShowAuthModal(false);
    if (perm.pincode || perm.district) await updateByPincodeOrCity(perm.pincode, perm.district);
  }, [updateByPincodeOrCity]);

  const logout = useCallback(() => { setUser(null); localStorage.removeItem('krishicore_token'); localStorage.removeItem('krishicore_user'); setActiveTab('workspace'); }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang, isOnline, connectionType, isSlowNetwork, isLiveBackend, backendChecking, toggleApiMode,
      activeTab, setActiveTab, user, login, logout, showAuthModal, setShowAuthModal,
      userCoords, setUserCoords, locating, detectLiveGps, updateByPincodeOrCity,
      cropProfiles, fertilizerRates, shops, setShops, labs, setLabs,
      farms, activePlotId, activeFarmEntry, selectFarmPlot, saveFarmPlot, logFarmSeason, deleteFarmPlot, previousCropCode, setPreviousCropCode,
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