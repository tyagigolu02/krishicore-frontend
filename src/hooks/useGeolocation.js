// src/hooks/useGeolocation.js
import { useState, useEffect, useCallback } from 'react';
import { resolveLocationName, geocodeByPincodeOrDistrict } from '../api/krishicoreApi';

const STORAGE_KEY = 'krishicore_live_geo_v5';

// Maps Indian State -> Default Regional Land Measurement Unit
export function getRegionalUnitByState(stateName = '') {
  const s = stateName.toLowerCase();
  if (/maharashtra|gujarat|karnataka|goa|महाराष्ट्र|गुजरात|कर्नाटक/.test(s)) return 'GUNTHA';
  if (/punjab|haryana|himachal|jammu|kashmir|पंजाब|हरियाणा/.test(s)) return 'KANAL';
  if (/tamil|kerala|andhra|telangana|तमिल|केरल|आंध्र/.test(s)) return 'CENT';
  if (/uttar pradesh|uttarakhand|उत्तर प्रदेश|उत्तराखंड/.test(s)) return 'KACCHA_BIGHA';
  if (/bihar|rajasthan|madhya pradesh|west bengal|assam|बिहार|राजस्थान|मध्य प्रदेश/.test(s)) return 'PAKKA_BIGHA';
  return 'ACRE';
}

export function useGeolocation() {
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).coords;
    } catch { /* ignore */ }
    return null; // Null until live GPS or IP API resolves!
  });

  const [locationLabel, setLocationLabel] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).label;
    } catch { /* ignore */ }
    return { labelHi: 'लाइव लोकेशन खोजी जा रही है...', labelEn: 'Detecting live location...', state: '' };
  });

  const [locating, setLocating] = useState(false);

  const saveAndApply = useCallback((nextCoords, nextLabel) => {
    setCoords(nextCoords);
    setLocationLabel(nextLabel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coords: nextCoords, label: nextLabel }));
  }, []);

  // Fallback: Live IP Geolocation if browser GPS is blocked/unavailable
  const detectViaIpApi = useCallback(async () => {
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const nextCoords = { lat: Number(data.latitude.toFixed(4)), lng: Number(data.longitude.toFixed(4)) };
        const resolved = await resolveLocationName(nextCoords.lat, nextCoords.lng);
        saveAndApply(nextCoords, resolved);
        return;
      }
    } catch { /* ignore */ }
  }, [saveAndApply]);

  const detectLiveGps = useCallback(() => {
    setLocating(true);
    if (!('geolocation' in navigator)) {
      detectViaIpApi().finally(() => setLocating(false));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextCoords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        };
        const resolved = await resolveLocationName(nextCoords.lat, nextCoords.lng);
        saveAndApply(nextCoords, resolved);
        setLocating(false);
      },
      async () => {
        await detectViaIpApi();
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 180000 }
    );
  }, [detectViaIpApi, saveAndApply]);

  const updateByPincodeOrCity = useCallback(async (pincode, districtOrCity) => {
    setLocating(true);
    try {
      const geo = await geocodeByPincodeOrDistrict(pincode, districtOrCity);
      if (geo) {
        const nextCoords = { lat: geo.lat, lng: geo.lng };
        const resolved = await resolveLocationName(geo.lat, geo.lng);
        saveAndApply(nextCoords, resolved);
        return { coords: nextCoords, label: resolved };
      }
    } finally {
      setLocating(false);
    }
    return null;
  }, [saveAndApply]);

  useEffect(() => {
    detectLiveGps();
  }, [detectLiveGps]);

  return { coords, setCoords, locationLabel, locating, detectLiveGps, updateByPincodeOrCity };
}