import React from 'react';

export default function SafeOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="safe-overlay">
      <div className="safe-ring">
        <svg className="safe-checkmark" viewBox="0 0 52 52">
          <circle className="safe-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="safe-check" fill="none" d="M14 27l7 7 16-16" />
        </svg>
      </div>
      <div className="safe-text">No threats detected</div>
    </div>
  );
}
