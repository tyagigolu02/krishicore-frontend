// src/data/cropVarieties.js
export const CROP_VARIETIES = {
  WHEAT: [
    { id: 'HD3226', nameHi: 'HD-3226 (पूसा यशस्वी)', nameEn: 'HD-3226 (High Yield)', tagHi: 'अधिक उपज', npkFactor: 1.05 },
    { id: 'DBW187', nameHi: 'DBW-187 (करण वंदना)', nameEn: 'DBW-187 (Irrigated)', tagHi: 'समय पर बुवाई', npkFactor: 1.0 },
    { id: 'HD2967', nameHi: 'HD-2967 (रतुआ रोधी)', nameEn: 'HD-2967 (Rust Resistant)', tagHi: 'लोकप्रिय', npkFactor: 1.0 },
    { id: 'PBW343', nameHi: 'PBW-343 / WH-1105', nameEn: 'PBW-343 / WH-1105', tagHi: 'सामान्य', npkFactor: 0.95 },
    { id: 'DESI_W', nameHi: 'देसी / शरबती (C-306)', nameEn: 'Desi / Sharbati (C-306)', tagHi: 'कम खाद', npkFactor: 0.75 },
  ],
  PADDY: [
    { id: 'PB1509', nameHi: 'पूसा बासमती-1509', nameEn: 'Pusa Basmati-1509', tagHi: 'कम अवधि', npkFactor: 0.9 },
    { id: 'PB1121', nameHi: 'पूसा बासमती-1121', nameEn: 'Pusa Basmati-1121', tagHi: 'निर्यात किस्म', npkFactor: 0.88 },
    { id: 'PR126', nameHi: 'PR-126 / परमल धान', nameEn: 'PR-126 / Parmal', tagHi: 'उच्च उपज', npkFactor: 1.05 },
    { id: 'HYB_P', nameHi: 'हाइब्रिड धान (Arize/IR-64)', nameEn: 'Hybrid Paddy', tagHi: 'हाइब्रिड', npkFactor: 1.12 },
  ],
  SUGARCANE: [
    { id: 'CO0238', nameHi: 'Co-0238 (अगेती गन्ना)', nameEn: 'Co-0238 (Early)', tagHi: 'उच्च रिकवरी', npkFactor: 1.05 },
    { id: 'CO0118', nameHi: 'Co-0118 (रोग रोधी)', nameEn: 'Co-0118 (Red-Rot Safe)', tagHi: 'सुरक्षित', npkFactor: 1.0 },
    { id: 'CO15023', nameHi: 'Co-15023 / CoLk-14201', nameEn: 'Co-15023 / CoLk-14201', tagHi: 'नई किस्म', npkFactor: 1.08 },
    { id: 'RATOON', nameHi: 'पेड़ी गन्ना (Ratoon)', nameEn: 'Ratoon Cane', tagHi: '+20% नाइट्रोजन', npkFactor: 1.15 },
  ],
  MUSTARD: [
    { id: 'PUSA_BOLD', nameHi: 'पूसा बोल्ड / RH-725', nameEn: 'Pusa Bold / RH-725', tagHi: 'अधिक तेल', npkFactor: 1.0 },
    { id: 'PIONEER45', nameHi: 'हाइब्रिड सरसों (45S46)', nameEn: 'Hybrid Mustard', tagHi: 'उच्च उपज', npkFactor: 1.1 },
    { id: 'DESI_M', nameHi: 'देसी पीली / लाहा सरसों', nameEn: 'Desi Yellow Mustard', tagHi: 'कम खाद', npkFactor: 0.8 },
  ],
  CHICKPEA: [
    { id: 'PUSA372', nameHi: 'पूसा-372 (देसी चना)', nameEn: 'Pusa-372 (Desi)', tagHi: 'पछेती उपयुक्त', npkFactor: 1.0 },
    { id: 'JG14', nameHi: 'JG-14 / काबुली चना', nameEn: 'JG-14 / Kabuli', tagHi: 'बड़ा दाना', npkFactor: 1.1 },
  ],
  MAIZE: [
    { id: 'HQPM1', nameHi: 'हाइब्रिड मक्का (HQPM-1)', nameEn: 'Hybrid HQPM-1', tagHi: 'उच्च प्रोटीन', npkFactor: 1.05 },
    { id: 'DESI_MZ', nameHi: 'देसी / मीठी मक्का', nameEn: 'Local / Sweet Corn', tagHi: 'सामान्य', npkFactor: 0.85 },
  ],
  SOYBEAN: [
    { id: 'JS9560', nameHi: 'JS-9560 (शीघ्र पकने वाली)', nameEn: 'JS-9560 (Early)', tagHi: '90 दिन', npkFactor: 1.0 },
    { id: 'MACS1407', nameHi: 'MACS-1407 / KDS-726', nameEn: 'MACS-1407', tagHi: 'अधिक उपज', npkFactor: 1.05 },
  ],
  COTTON: [
    { id: 'BT_COT', nameHi: 'बीटी हाइब्रिड कपास', nameEn: 'Bt Hybrid Cotton', tagHi: 'उच्च उपज', npkFactor: 1.1 },
    { id: 'DESI_COT', nameHi: 'देसी कपास', nameEn: 'Desi Cotton', tagHi: 'कम पानी', npkFactor: 0.8 },
  ],
};

export function getVarietiesForCrop(cropCode) {
  const code = String(cropCode || 'WHEAT').toUpperCase();
  return CROP_VARIETIES[code] || [
    { id: 'STD', nameHi: 'उन्नत प्रमाणित बीज (ICAR)', nameEn: 'Certified ICAR Variety', tagHi: 'मानक', npkFactor: 1.0 },
    { id: 'HYB', nameHi: 'हाइब्रिड / अधिक उपज किस्म', nameEn: 'Hybrid High-Yield', tagHi: 'उच्च उपज', npkFactor: 1.1 },
    { id: 'DESI', nameHi: 'देसी / स्थानीय किस्म', nameEn: 'Desi / Local Variety', tagHi: 'कम खाद', npkFactor: 0.8 },
  ];
}