import React from 'react';

export default function ThreatOverlay({ threatCount }) {
  return (
    <div className="threat-overlay">
      <div className="threat-pulse" />
      <div className="threat-badge">
        <div className="threat-icon">⚠️</div>
        <div className="threat-text">
          {threatCount === 1 ? 'Threat Detected' : `${threatCount} Threats Detected`}
        </div>
      </div>
    </div>
  );
}
