import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import MobileNav from './components/MobileNav.jsx';
import Dashboard from './modules/Dashboard/Dashboard.jsx';
import DigitalTwin3D from './modules/DigitalTwin3D/DigitalTwin3D.jsx';
import ZoneRiskPanel from './modules/RiskPrediction/ZoneRiskPanel.jsx';
import TrendAnalytics from './modules/Analytics/TrendAnalytics.jsx';
import AlertCenter from './modules/AlertSystem/AlertCenter.jsx';
import SensorInputForm from './modules/DataInput/SensorInputForm.jsx';

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/digital-twin" element={<DigitalTwin3D />} />
          <Route path="/zones" element={<ZoneRiskPanel />} />
          <Route path="/analytics" element={<TrendAnalytics />} />
          <Route path="/alerts" element={<AlertCenter />} />
          <Route path="/simulate" element={<SensorInputForm />} />
        </Routes>
      </div>
      <MobileNav />
    </div>
  );
}
