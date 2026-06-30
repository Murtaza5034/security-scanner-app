import React from 'react';

export default function Reticle({ active }) {
  return (
    <div className={`reticle ${active ? 'reticle--active' : ''}`}>
      <div className="reticle-ring">
        <div className="reticle-corner reticle-corner--tl" />
        <div className="reticle-corner reticle-corner--tr" />
        <div className="reticle-corner reticle-corner--bl" />
        <div className="reticle-corner reticle-corner--br" />
        <div className="reticle-crosshair">
          <div className="reticle-hline" />
          <div className="reticle-vline" />
        </div>
      </div>
      <div className="reticle-label">SCAN</div>
    </div>
  );
}
