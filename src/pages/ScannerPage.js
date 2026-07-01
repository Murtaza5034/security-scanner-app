import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCamera from '../hooks/useCamera';
import useDetection from '../hooks/useDetection';
import { useScanner, useScannerDispatch } from '../context/ScannerContext';
import { saveEvidence, reportFalsePositive } from '../services/storageService';
import { requestNotificationPermission } from '../services/alertManager';
import CameraView from '../components/CameraView';
import Reticle from '../components/Reticle';
import ThreatOverlay from '../components/ThreatOverlay';
import SafeOverlay from '../components/SafeOverlay';
import InfoCard from '../components/InfoCard';
import ScanButton from '../components/ScanButton';

export default function ScannerPage() {
  const navigate = useNavigate();
  const scannerState = useScanner();
  const dispatch = useScannerDispatch();
  const { videoRef, status: camStatus, error: camError, videoDimensions, startCamera, stopCamera, switchCamera } = useCamera();
  const {
    initModel, startScanning, stopScanning, modelLoading, modelProgress, modelError, canvasRef,
  } = useDetection(videoRef, videoDimensions);

  const [showSafe, setShowSafe] = useState(false);
  const safeTimeoutRef = useRef(null);
  const cameraStartedRef = useRef(false);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!cameraStartedRef.current) {
      cameraStartedRef.current = true;
      startCamera('environment');
    }
    return () => {
      cameraStartedRef.current = false;
    };
  }, [startCamera]);

  useEffect(() => {
    if (camStatus === 'ready' && !modelLoading && !scannerState.modelStatus.includes('loaded')) {
      initModel();
    }
  }, [camStatus, modelLoading, scannerState.modelStatus, initModel]);

  useEffect(() => {
    if (scannerState.lastResult && !scannerState.threatDetected) {
      if (safeTimeoutRef.current) clearTimeout(safeTimeoutRef.current);
      setShowSafe(true);
      safeTimeoutRef.current = setTimeout(() => setShowSafe(false), 2000);
    } else {
      setShowSafe(false);
    }
    return () => {
      if (safeTimeoutRef.current) clearTimeout(safeTimeoutRef.current);
    };
  }, [scannerState.lastResult, scannerState.threatDetected]);

  const handleScanToggle = useCallback(() => {
    if (scannerState.isScanning) {
      stopScanning();
    } else {
      if (camStatus !== 'ready') return;
      if (!scannerState.modelStatus.includes('loaded')) {
        initModel().then(ok => {
          if (ok) startScanning();
        });
        return;
      }
      startScanning();
    }
  }, [scannerState.isScanning, camStatus, scannerState.modelStatus, startScanning, stopScanning, initModel]);

  const handleDismissCard = useCallback(() => {
    dispatch({ type: 'SET_INFO_CARD', payload: false });
  }, [dispatch]);

  const handleReportFalse = useCallback(async () => {
    if (scannerState.lastResult) {
      await reportFalsePositive(scannerState.lastResult, 'User reported false positive');
      alert('Thank you for your feedback. This helps improve detection accuracy.');
    }
  }, [scannerState.lastResult]);

  const handleSaveEvidence = useCallback(async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    await saveEvidence(dataUrl, scannerState.lastResult);
    alert('Evidence saved successfully.');
  }, [videoRef, scannerState.lastResult]);

  const modelReady = scannerState.modelStatus === 'loaded';
  const showInfoCard = scannerState.showInfoCard && scannerState.lastResult && scannerState.lastResult.detections?.length > 0;
  const topDetection = showInfoCard ? scannerState.lastResult.detections[0] : null;

  return (
    <div className="scanner-page">
      {camStatus === 'requesting' && (
        <div className="scanner-loading">
          <div className="scanner-spinner" />
          <div className="scanner-loading-text">Requesting camera access...</div>
        </div>
      )}

      {camStatus === 'error' && (
        <div className="scanner-error">
          <div className="scanner-error-icon">📷</div>
          <div className="scanner-error-title">Camera Error</div>
          <div className="scanner-error-msg">{camError}</div>
          <button className="scanner-retry-btn" onClick={() => startCamera('environment')}>
            Retry
          </button>
        </div>
      )}

      {modelLoading && (
        <div className="model-loading-overlay">
          <div className="model-loading-bar">
            <div className="model-loading-fill" style={{ width: `${modelProgress * 100}%` }} />
          </div>
          <div className="model-loading-text">
            Loading AI Model... {(modelProgress * 100).toFixed(0)}%
          </div>
        </div>
      )}

      {modelError && (
        <div className="model-error-banner">
          <span>Model error: {modelError}</span>
          <button onClick={() => initModel()}>Retry</button>
        </div>
      )}

      {(camStatus === 'ready') && (
        <>
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isScanning={scannerState.isScanning}
          />

          <Reticle active={scannerState.isScanning} />

          {scannerState.threatDetected && (
            <ThreatOverlay threatCount={scannerState.threats.length} />
          )}

          <SafeOverlay visible={showSafe && !scannerState.threatDetected} />

          {showInfoCard && (
            <InfoCard
              detection={topDetection}
              distance={scannerState.currentDistance}
              direction={scannerState.currentDirection}
              onDismiss={handleDismissCard}
              onReportFalse={handleReportFalse}
            />
          )}

          <div className="scanner-controls">
            <ScanButton
              onClick={handleScanToggle}
              isScanning={scannerState.isScanning}
              disabled={!modelReady}
            />
          </div>

          <div className="scanner-top-bar">
            <button className="top-bar-btn" onClick={() => navigate('/settings')} title="Settings">
              ⚙️
            </button>
            <button className="top-bar-btn" onClick={() => navigate('/history')} title="History">
              📋
            </button>
            <button className="top-bar-btn" onClick={switchCamera} title="Switch Camera">
              🔄
            </button>
            {scannerState.threatDetected && (
              <button className="top-bar-btn top-bar-btn--save" onClick={handleSaveEvidence} title="Save Evidence">
              💾
              </button>
            )}
          </div>

          {scannerState.isScanning && (
            <div className="scanning-indicator">
              <div className="scanning-dot" />
              Scanning...
            </div>
          )}
        </>
      )}
    </div>
  );
}
