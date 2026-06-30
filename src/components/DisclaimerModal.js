import React from 'react';

export default function DisclaimerModal({ onAccept, onDecline }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-shield">🛡️</div>
        <h2 className="modal-title">Security Scanner</h2>
        <div className="modal-subtitle">Security Scanner</div>

        <div className="modal-body">
          <p>
            This is an <strong>assistive tool</strong> and is <strong>not 100% accurate</strong>.
            It uses on-device AI to help increase situational awareness.
          </p>
          <p>
            Detection accuracy depends on lighting, camera quality, and object positioning.
            This app may not detect all objects or threats.
          </p>
          <p className="modal-warning">
            <strong>Always contact local authorities for real threats.</strong>
            Never rely solely on this application for your safety.
          </p>
          <p className="modal-privacy">
            All scanning happens on-device. No images or video are uploaded or stored
            without your explicit consent.
          </p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn--decline" onClick={onDecline}>
            Decline
          </button>
          <button className="modal-btn modal-btn--accept" onClick={onAccept}>
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
}
