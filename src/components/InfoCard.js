import React from 'react';
import { getRiskLabel } from '../utils/threatConfig';

export default function InfoCard({ detection, distance, direction, onDismiss, onReportFalse }) {
  if (!detection) return null;

  const risk = getRiskLabel(detection.threat);
  const isThreatened = ['high', 'medium'].includes(detection.threat);

  return (
    <div className={`info-card ${isThreatened ? 'info-card--threat' : 'info-card--safe'}`}>
      <button className="info-card-dismiss" onClick={onDismiss}>✕</button>

      <div className="info-card-header">
        <span className="info-card-icon">{detection.icon || '📷'}</span>
        <div className="info-card-title-group">
          <div className="info-card-title">{detection.className}</div>
          <div className="info-card-subtitle">
            {isThreatened ? '⚠ Potential threat' : 'No threat detected'}
          </div>
        </div>
        <div
          className="info-card-risk"
          style={{ backgroundColor: risk.bg, color: risk.color, borderColor: risk.color }}
        >
          {risk.text}
        </div>
      </div>

      {isThreatened && (
        <div className="info-card-details">
          {detection.score && (
            <div className="info-detail-row">
              <span className="info-detail-label">Confidence</span>
              <span className="info-detail-value">{(detection.score * 100).toFixed(0)}%</span>
            </div>
          )}
          {distance && (
            <div className="info-detail-row">
              <span className="info-detail-label">Distance</span>
              <span className="info-detail-value">{distance.meters}m {direction || ''}</span>
            </div>
          )}
          <div className="info-detail-row">
            <span className="info-detail-label">Proximity</span>
            <span className="info-detail-value">
              {distance && distance.meters <= 5 ? '⚠ Very Close' : distance && distance.meters <= 10 ? '⚠ Nearby' : 'Far'}
            </span>
          </div>
        </div>
      )}

      <div className="info-card-footer">
        <button className="btn-report" onClick={onReportFalse}>
          Report False Positive
        </button>
      </div>
    </div>
  );
}
