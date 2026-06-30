import React from 'react';

export default function ScanButton({ onClick, isScanning, disabled }) {
  return (
    <button
      className={`scan-btn ${isScanning ? 'scan-btn--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isScanning ? 'Stop scanning' : 'Start scanning'}
    >
      <div className="scan-btn-inner">
        {isScanning ? (
          <>
            <div className="scan-btn-icon scan-btn-icon--stop" />
            <span className="scan-btn-label">STOP</span>
          </>
        ) : (
          <>
            <div className="scan-btn-icon scan-btn-icon--scan" />
            <span className="scan-btn-label">SCAN</span>
          </>
        )}
      </div>
    </button>
  );
}
