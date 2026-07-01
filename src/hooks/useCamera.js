import { useRef, useState, useEffect, useCallback } from 'react';

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const startCamera = useCallback(async (facingMode = 'environment') => {
    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve('timeout'), 3000);

          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            setVideoDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            });
            resolve('metadata');
          };
        });

        await videoRef.current.play();
        setStatus('ready');
      }
    } catch (err) {
      let msg = 'Camera access denied';
      if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.';
      else if (err.name === 'NotFoundError') msg = 'No camera found on this device.';
      else if (err.name === 'NotReadableError') msg = 'Camera is in use by another application.';
      else msg = err.message;

      setError(msg);
      setStatus('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  const switchCamera = useCallback(() => {
    const currentFacing = streamRef.current?.getVideoTracks()[0]?.getSettings().facingMode;
    const newFacing = currentFacing === 'environment' ? 'user' : 'environment';
    stopCamera();
    return startCamera(newFacing);
  }, [startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    videoDimensions,
    startCamera,
    stopCamera,
    switchCamera,
    stream: streamRef.current,
  };
}
