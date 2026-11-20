// src/data/cropVarieties.js
export const CROP_VARIETIES = {
  WHEAT: [
    { id: 'HD3226', nameHi: 'HD-3226 (पूसा यशस्वी)', nameEn: 'HD-3226 (High Yield)', tagHi: 'अधिक उपज', tagEn: 'High Yield', npkFactor: 1.05 },
    { id: 'DBW187', nameHi: 'DBW-187 (करण वंदना)', nameEn: 'DBW-187 (Irrigated)', tagHi: 'समय पर बुवाई', tagEn: 'Timely Sowing', npkFactor: 1.0 },
    { id: 'HD2967', nameHi: 'HD-2967 (रतुआ रोधी)', nameEn: 'HD-2967 (Rust Resistant)', tagHi: 'लोकप्रिय', tagEn: 'Popular', npkFactor: 1.0 },
    { id: 'PBW343', nameHi: 'PBW-343 / WH-1105', nameEn: 'PBW-343 / WH-1105', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.95 },
    { id: 'DESI_W', nameHi: 'देसी / शरबती (C-306)', nameEn: 'Desi / Sharbati (C-306)', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.75 },
  ],
  PADDY: [
    { id: 'PB1509', nameHi: 'पूसा बासमती-1509', nameEn: 'Pusa Basmati-1509', tagHi: 'कम अवधि', tagEn: 'Short Duration', npkFactor: 0.9 },
    { id: 'PB1121', nameHi: 'पूसा बासमती-1121', nameEn: 'Pusa Basmati-1121', tagHi: 'निर्यात किस्म', tagEn: 'Export Basmati', npkFactor: 0.88 },
    { id: 'PR126', nameHi: 'PR-126 / परमल धान', nameEn: 'PR-126 / Parmal', tagHi: 'उच्च उपज', tagEn: 'High Yield', npkFactor: 1.05 },
    { id: 'HYB_P', nameHi: 'हाइब्रिड धान (Arize/IR-64)', nameEn: 'Hybrid Paddy', tagHi: 'हाइब्रिड', tagEn: 'Hybrid', npkFactor: 1.12 },
  ],
  SUGARCANE: [
    { id: 'CO0238', nameHi: 'Co-0238 (अगेती गन्ना)', nameEn: 'Co-0238 (Early)', tagHi: 'उच्च रिकवरी', tagEn: 'High Recovery', npkFactor: 1.05 },
    { id: 'CO0118', nameHi: 'Co-0118 (रोग रोधी)', nameEn: 'Co-0118 (Red-Rot Safe)', tagHi: 'सुरक्षित', tagEn: 'Disease Safe', npkFactor: 1.0 },
    { id: 'CO15023', nameHi: 'Co-15023 / CoLk-14201', nameEn: 'Co-15023 / CoLk-14201', tagHi: 'नई किस्म', tagEn: 'New Variety', npkFactor: 1.08 },
    { id: 'RATOON', nameHi: 'पेड़ी गन्ना', nameEn: 'Ratoon Cane', tagHi: '+20% नाइट्रोजन', tagEn: '+20% Nitrogen', npkFactor: 1.15 },
  ],
  MUSTARD: [
    { id: 'PUSA_BOLD', nameHi: 'पूसा बोल्ड / RH-725', nameEn: 'Pusa Bold / RH-725', tagHi: 'अधिक तेल', tagEn: 'High Oil %', npkFactor: 1.0 },
    { id: 'PIONEER45', nameHi: 'हाइब्रिड सरसों (45S46)', nameEn: 'Hybrid Mustard', tagHi: 'उच्च उपज', tagEn: 'High Yield', npkFactor: 1.1 },
    { id: 'DESI_M', nameHi: 'देसी पीली / लाहा सरसों', nameEn: 'Desi Yellow Mustard', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.8 },
  ],
  CHICKPEA: [
    { id: 'PUSA372', nameHi: 'पूसा-372 (देसी चना)', nameEn: 'Pusa-372 (Desi)', tagHi: 'पछेती उपयुक्त', tagEn: 'Late Sown OK', npkFactor: 1.0 },
    { id: 'JG14', nameHi: 'JG-14 / काबुली चना', nameEn: 'JG-14 / Kabuli', tagHi: 'बड़ा दाना', tagEn: 'Bold Grain', npkFactor: 1.1 },
  ],
  POTATO: [
    { id: 'KUFRI_BAHAR', nameHi: 'कुफरी बहार (Kufri Bahar)', nameEn: 'Kufri Bahar', tagHi: 'अधिक उपज', tagEn: 'High Yield', npkFactor: 1.05 },
    { id: 'CHIPSONA', nameHi: 'कुफरी चिप्सोना / ख्याती', nameEn: 'Kufri Chipsona / Khyati', tagHi: 'प्रसंस्करण', tagEn: 'Processing', npkFactor: 1.0 },
    { id: 'DESI_POT', nameHi: 'देसी / पहाड़ी आलू', nameEn: 'Local / Hill Potato', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.85 },
  ],
  PEA: [
    { id: 'AZAD_P3', nameHi: 'आज़ाद मटर-3 / अर्केल', nameEn: 'Azad Pea-3 / Arkel', tagHi: 'मीठी फली', tagEn: 'Sweet Pod', npkFactor: 1.0 },
    { id: 'DESI_PEA', nameHi: 'देसी सूखी मटर', nameEn: 'Desi Dry Pea', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.85 },
  ],
  LENTIL: [
    { id: 'PL8', nameHi: 'PL-8 / DPL-62 (मसूर)', nameEn: 'PL-8 / DPL-62', tagHi: 'उकठा रोधी', tagEn: 'Wilt Tolerant', npkFactor: 1.0 },
    { id: 'DESI_LENTIL', nameHi: 'देसी छोटी मसूर', nameEn: 'Desi Small Lentil', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.85 },
  ],
  BARLEY: [
    { id: 'RD2794', nameHi: 'RD-2794 / DWRB-137', nameEn: 'RD-2794 / DWRB-137', tagHi: 'लवण सहनशील', tagEn: 'Salt Tolerant', npkFactor: 1.0 },
    { id: 'DESI_BARLEY', nameHi: 'देसी जौ', nameEn: 'Desi Barley', tagHi: 'कम पानी', tagEn: 'Low Water', npkFactor: 0.8 },
  ],
  ONION: [
    { id: 'BHIMA_SUPER', nameHi: 'भीमा सुपर / N-53 (रबी प्याज़)', nameEn: 'Bhima Super / N-53', tagHi: 'भंडारण योग्य', tagEn: 'Good Storage', npkFactor: 1.05 },
    { id: 'DESI_ONION', nameHi: 'देसी लाल प्याज़', nameEn: 'Desi Red Onion', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.9 },
  ],
  GARLIC: [
    { id: 'YAMUNA_SAFED', nameHi: 'यमुना सफेद (G-1 / G-282)', nameEn: 'Yamuna Safed (G-1)', tagHi: 'मोटी कली', tagEn: 'Bold Cloves', npkFactor: 1.05 },
    { id: 'DESI_GARLIC', nameHi: 'देसी लहसुन', nameEn: 'Desi Garlic', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.9 },
  ],
  BERSEEM: [
    { id: 'WARDAN', nameHi: 'वरदान / BL-42 (बरसीम)', nameEn: 'Wardan / BL-42', tagHi: 'बहु-कटाई', tagEn: 'Multi-Cut', npkFactor: 1.05 },
    { id: 'DESI_BERSEEM', nameHi: 'देसी बरसीम चारा', nameEn: 'Desi Berseem', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.9 },
  ],
  MAIZE: [
    { id: 'HQPM1', nameHi: 'हाइब्रिड मक्का (HQPM-1)', nameEn: 'Hybrid HQPM-1', tagHi: 'उच्च प्रोटीन', tagEn: 'High Protein', npkFactor: 1.05 },
    { id: 'DESI_MZ', nameHi: 'देसी / मीठी मक्का', nameEn: 'Local / Sweet Corn', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.85 },
  ],
  TOMATO: [
    { id: 'ARKA_RAKSHAK', nameHi: 'अर्का रक्षक / पूसा रूबी', nameEn: 'Arka Rakshak / Pusa Ruby', tagHi: 'अधिक तुड़ाई', tagEn: 'High Picking', npkFactor: 1.05 },
    { id: 'DESI_TOMATO', nameHi: 'देसी टमाटर', nameEn: 'Desi Tomato', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.9 },
  ],
  SOYBEAN: [
    { id: 'JS9560', nameHi: 'JS-9560 (शीघ्र पकने वाली)', nameEn: 'JS-9560 (Early)', tagHi: '90 दिन', tagEn: '90 Days', npkFactor: 1.0 },
    { id: 'MACS1407', nameHi: 'MACS-1407 / KDS-726', nameEn: 'MACS-1407', tagHi: 'अधिक उपज', tagEn: 'High Yield', npkFactor: 1.05 },
  ],
  COTTON: [
    { id: 'BT_COT', nameHi: 'बीटी हाइब्रिड कपास', nameEn: 'Bt Hybrid Cotton', tagHi: 'उच्च उपज', tagEn: 'High Yield', npkFactor: 1.1 },
    { id: 'DESI_COT', nameHi: 'देसी कपास', nameEn: 'Desi Cotton', tagHi: 'कम पानी', tagEn: 'Low Water', npkFactor: 0.8 },
  ],
  BAJRA: [
    { id: 'HHB67', nameHi: 'HHB-67 / पूसा-1201', nameEn: 'HHB-67 / Pusa-1201', tagHi: 'कम अवधि', tagEn: 'Early Maturing', npkFactor: 1.0 },
    { id: 'DESI_BAJRA', nameHi: 'देसी बाजरा', nameEn: 'Desi Bajra', tagHi: 'सूखा सहनशील', tagEn: 'Drought Hardy', npkFactor: 0.8 },
  ],
  GROUNDNUT: [
    { id: 'TG37A', nameHi: 'TG-37A / गिरनार-4', nameEn: 'TG-37A / Girnar-4', tagHi: 'अधिक तेल', tagEn: 'High Oil %', npkFactor: 1.0 },
    { id: 'DESI_GN', nameHi: 'देसी मूंगफली', nameEn: 'Desi Groundnut', tagHi: 'सामान्य', tagEn: 'Standard', npkFactor: 0.85 },
  ],
  TUR_ARHAR: [
    { id: 'PUSA992', nameHi: 'पूसा-992 / BSMR-736', nameEn: 'Pusa-992 / BSMR-736', tagHi: 'शीघ्र पकने वाली', tagEn: 'Early Maturing', npkFactor: 1.0 },
    { id: 'DESI_TUR', nameHi: 'देसी अरहर / तूर', nameEn: 'Desi Tur / Arhar', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.85 },
  ],
  MOONG: [
    { id: 'SML668', nameHi: 'SML-668 / पूसा विशाल', nameEn: 'SML-668 / Pusa Vishal', tagHi: '60 दिन', tagEn: '60 Days', npkFactor: 1.0 },
    { id: 'DESI_MOONG', nameHi: 'देसी मूंग', nameEn: 'Desi Moong', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.85 },
  ],
};

export function getVarietiesForCrop(cropCode) {
  const code = String(cropCode || 'WHEAT').toUpperCase();
  return CROP_VARIETIES[code] || [
    { id: 'STD', nameHi: 'उन्नत प्रमाणित बीज (ICAR)', nameEn: 'Certified ICAR Variety', tagHi: 'मानक', tagEn: 'Standard', npkFactor: 1.0 },
    { id: 'HYB', nameHi: 'हाइब्रिड / अधिक उपज किस्म', nameEn: 'Hybrid High-Yield', tagHi: 'उच्च उपज', tagEn: 'High Yield', npkFactor: 1.1 },
    { id: 'DESI', nameHi: 'देसी / स्थानीय किस्म', nameEn: 'Desi / Local Variety', tagHi: 'कम खाद', tagEn: 'Low Input', npkFactor: 0.8 },
  ];
}