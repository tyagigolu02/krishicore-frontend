// src/components/BottomNav.jsx
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, lang } = useApp();
  const tabs = [
    { id: 'workspace', label: lang === 'HI' ? 'जांच/सलाह' : 'Advisory', emoji: '🧪' },
    { id: 'calculator', label: lang === 'HI' ? 'खेत नाप' : 'Area', emoji: '📐' },
    { id: 'shops', label: lang === 'HI' ? 'खाद दुकान' : 'Shops', emoji: '🏪' },
    { id: 'labs', label: lang === 'HI' ? 'मिट्टी लैब' : 'Labs', emoji: '🔬' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-around items-center z-40 shadow-lg">
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-0.5 text-[11px] ${activeTab === t.id ? 'font-extrabold text-[#1B5E20]' : 'font-semibold text-slate-500'}`}>
          <span className="text-base">{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}