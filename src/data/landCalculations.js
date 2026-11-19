// src/utils/landCalculations.js
export function convertToAcres(val, unit) {
  const v = Math.max(0, parseFloat(val) || 0);
  switch (unit) {
    case 'ACRE': return v;
    case 'HECTARE': return v * 2.47105;
    case 'PAKKA_BIGHA': return v * 0.625;
    case 'KACCHA_BIGHA': return v / 4.8;
    case 'GUNTHA': return v / 40.0;
    case 'KANAL': return v / 8.0;
    case 'BISWA': return v / 32.0;
    case 'CENT': return v / 100.0;
    default: return v;
  }
}

export function getAreaBreakdown(acres) {
  const a = Math.max(0.01, Number(acres) || 0);
  return {
    acres: a.toFixed(2),
    hectares: (a / 2.47105).toFixed(2),
    sqft: Math.round(a * 43560).toLocaleString('en-IN'),
    kacchaBigha: (a * 4.8).toFixed(1),
    pakkaBigha: (a * 1.6).toFixed(2),
    guntha: (a * 40).toFixed(1),
    kanal: (a * 8).toFixed(1),
    biswa: (a * 32).toFixed(1),
  };
}

export function calculateFromDimensions(length, width, unit) {
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  let sqft = l * w;
  if (unit === 'METER') sqft = l * 3.28084 * (w * 3.28084);
  if (unit === 'GATTA') sqft = l * 8.25 * (w * 8.25);

  const acres = sqft / 43560;
  return {
    sqft: Math.round(sqft),
    acres,
    kaccha: acres * 4.8,
    guntha: acres * 40,
  };
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}