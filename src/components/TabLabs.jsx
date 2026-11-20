// src/components/TabLabs.jsx
import { useApp } from '../context/AppContext';
import { Phone, MapPin, Microscope, ExternalLink, Info } from 'lucide-react';

export default function TabLabs() {
  const { lang, labs, radiusKm, setRadiusKm, userCoords, weatherData } = useApp();
  const visibleLabs = (labs || []).filter(l => (l.distanceKm ?? 0) <= radiusKm);
  const locName = weatherData?.location || 'आपके क्षेत्र';
  const gMapsLabsUrl = userCoords
    ? `https://www.google.com/maps/search/soil+testing+laboratory+KVK+krishi/@${userCoords.lat},${userCoords.lng},12z`
    : `https://www.google.com/maps/search/soil+testing+lab+${encodeURIComponent(locName)}`;

  return (
    <div className="card-base space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B5E20]">Pan-India Geospatial Soil Testing Labs</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {lang === 'HI' ? 'नज़दीकी मिट्टी जांच प्रयोगशालाएं (KVK / सरकारी / प्राइवेट)' : 'Nearby Soil Testing Laboratories (KVK / Govt / Private)'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">📍 {locName} से {radiusKm} km के दायरे में ({visibleLabs.length} लैब्स)</p>
        </div>

        <a href={gMapsLabsUrl} target="_blank" rel="noopener noreferrer" className="btn-amber flex items-center gap-1.5 whitespace-nowrap">
          <ExternalLink className="w-4 h-4" />
          {lang === 'HI' ? '🗺️ Google Maps पर सभी नज़दीकी लैब्स देखें' : '🗺️ View All Nearby Labs on Google Maps'}
        </a>
      </div>

      {/* Radius Slider */}
      <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] space-y-1.5">
        <div className="flex justify-between text-xs font-extrabold">
          <span>{lang === 'HI' ? 'खोज दायरा' : 'Search Radius'}</span>
          <span className="text-[#1B5E20]">{radiusKm} km</span>
        </div>
        <input type="range" min="10" max="100" step="5" value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))} className="w-full accent-[#1B5E20]" />
      </div>

      {visibleLabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleLabs.map((l, i) => {
            const destLat = l.lat ?? l.latitude, destLng = l.lng ?? l.longitude;
            return (
              <div key={l.id || i} className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#E2E8D8] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${l.isGovernmentLab ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-amber-100 text-amber-900'}`}>
                      {l.isGovernmentLab ? '🏛️ सरकारी / KVK लैब' : '🔬 प्राइवेट लैब'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#061a11] text-white font-extrabold text-xs tabular-nums">{l.distanceKm} km</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{l.labName}</h3>
                  <p className="text-[11px] text-slate-600 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /><span>{l.address}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <a href={`tel:${l.contactNumber || '18001801551'}`} className="py-2 rounded-xl bg-[#1B5E20] text-white font-bold text-xs flex items-center justify-center gap-1"><Phone className="w-3.5 h-3.5" /> कॉल करें</a>
                  <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`} className="py-2 rounded-xl bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1"><MapPin className="w-3.5 h-3.5" /> रास्ता देखें</a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-50 border text-center space-y-3">
          <Microscope className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">{lang === 'HI' ? `${radiusKm} km के अंदर कोई पंजीकृत लैब नहीं मिली। दायरा बढ़ाएं या Google Maps पर देखें।` : 'No labs in radius. Increase radius or check Google Maps.'}</p>
        </div>
      )}

      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
        <span><b>मिट्टी सैंपल टिप:</b> खेत के 4 कोनों और एक बीच से 'V' आकार में 6 इंच गहराई से मिट्टी मिलाकर ~500 ग्राम नमूना नज़दीकी लैब में दें।</span>
      </div>
    </div>
  );
}