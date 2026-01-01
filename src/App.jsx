import { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardTabs from './components/DashboardTabs';
import FleetOverview from './components/fleet/FleetOverview';
import RequisitionsTab from './components/requisitions/RequisitionsTab';
import RFQStatusTab from './components/rfq/RFQStatusTab';
import VesselProcurement from './components/vessel/VesselProcurement';
import AnalyticsTab from './components/analytics/AnalyticsTab';

// Dashboard configuration - all tabs work fleet-wide or with selected vessels
const DASHBOARD_SECTIONS = {
  fleetOverview: { enabled: true, label: 'Fleet Overview' },
  requisitions: { enabled: true, label: 'Requisitions' },
  rfqStatus: { enabled: true, label: 'RFQ Status' },
  purchaseOrders: { enabled: true, label: 'Purchase Orders' },
  analytics: { enabled: true, label: 'Analytics' },
};

function App() {
  const [activeTab, setActiveTab] = useState('fleetOverview');
  const [selectedVesselIds, setSelectedVesselIds] = useState([]); // Array of selected ship IDs
  const [vessels, setVessels] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch('/api/vessels')
      .then(res => res.json())
      .then(data => setVessels(data))
      .catch(err => console.error('Error fetching vessels:', err));
  }, []);

  // Get selected vessel names for components that need them
  const selectedVesselNames = selectedVesselIds
    .map(id => vessels.find(v => v.SHIP_ID === id)?.NAME)
    .filter(Boolean);

  // Get single shipId for backward compatibility with some tabs
  const singleShipId = selectedVesselIds.length === 1 ? selectedVesselIds[0] : null;

  const renderDashboard = () => {
    switch (activeTab) {
      case 'fleetOverview':
        return <FleetOverview year={year} />;
      case 'requisitions':
        return <RequisitionsTab year={year} shipIds={selectedVesselIds} />;
      case 'rfqStatus':
        return <RFQStatusTab year={year} shipIds={selectedVesselIds} />;
      case 'purchaseOrders':
        return (
          <VesselProcurement
            shipIds={selectedVesselIds}
            vesselNames={selectedVesselNames}
            year={year}
          />
        );
      case 'analytics':
        return <AnalyticsTab year={year} />;
      default:
        return <FleetOverview year={year} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        year={year}
        onYearChange={setYear}
        vessels={vessels}
        selectedVesselIds={selectedVesselIds}
        onVesselChange={setSelectedVesselIds}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <DashboardTabs
          sections={DASHBOARD_SECTIONS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
}

export default App;
