// src/components/TabWorkspace.jsx
import SoilScannerPanel from './SoilScannerPanel';
import DosageAndTimelinePanel from './DosageAndTimelinePanel';

export default function TabWorkspace() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <SoilScannerPanel />
      <DosageAndTimelinePanel />
    </div>
  );
}