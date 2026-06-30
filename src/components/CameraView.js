import React from 'react';

export default function CameraView({ videoRef, canvasRef, onScanClick, isScanning }) {
  return (
    <div className="camera-view">
      <video
        ref={videoRef}
        className="camera-feed"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="camera-canvas"
      />
    </div>
  );
}
