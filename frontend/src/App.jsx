import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { CrimeAnalyticsPage } from './pages/CrimeAnalyticsPage';
import { FirManagementPage } from './pages/FirManagementPage';
import { CrimeMapPage } from './pages/CrimeMapPage';
import { AiPredictionPage } from './pages/AiPredictionPage';
import { OfficersPage } from './pages/OfficersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsProvider } from './contexts/SettingsContext';

export function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="analytics" element={<CrimeAnalyticsPage />} />
              <Route path="firs" element={<FirManagementPage />} />
              <Route path="map" element={<CrimeMapPage />} />
              <Route path="prediction" element={<AiPredictionPage />} />
              <Route path="officers" element={<OfficersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;

