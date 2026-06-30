import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings, useSettingsDispatch } from './context/SettingsContext';
import { ScannerProvider } from './context/ScannerContext';
import ScannerPage from './pages/ScannerPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import DisclaimerModal from './components/DisclaimerModal';

function AppContent() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  if (!settings.disclaimerAccepted) {
    return (
      <DisclaimerModal
        onAccept={() => dispatch({ type: 'ACCEPT_DISCLAIMER' })}
        onDecline={() => {}}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ScannerPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ScannerProvider>
          <AppContent />
        </ScannerProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
