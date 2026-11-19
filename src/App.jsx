// src/App.jsx
import { AppProvider, useApp } from './context/AppContext';
import GovtMrpBar from './components/GovtMrpBar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HeroBanner from './components/HeroBanner';
import WeatherSprayBanner from './components/WeatherSprayBanner';
import TabWorkspace from './components/TabWorkspace';
import TabCalculator from './components/TabCalculator';
import TabShops from './components/TabShops';
import TabLabs from './components/TabLabs';
import TabAdmin from './components/TabAdmin';
import TrustAndFooter from './components/TrustAndFooter';
import AuthModal from './components/AuthModal';

function AppContent() {
  const { activeTab } = useApp();
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF5] text-[#1E293B]">
      <GovtMrpBar />
      <Navbar />
      <HeroBanner />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        <WeatherSprayBanner />
        {activeTab === 'workspace' && <TabWorkspace />}
        {activeTab === 'calculator' && <TabCalculator />}
        {activeTab === 'shops' && <TabShops />}
        {activeTab === 'labs' && <TabLabs />}
        {activeTab === 'admin' && <TabAdmin />}
      </main>
      <TrustAndFooter />
      <BottomNav />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}