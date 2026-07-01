import { useRef, useState, useEffect, useCallback } from 'react';

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const safeSetStatus = useCallback((s) => {
    if (mountedRef.current) setStatus(s);
  }, []);

  const safeSetError = useCallback((e) => {
    if (mountedRef.current) setError(e);
  }, []);

  const safeSetDimensions = useCallback((w, h) => {
    if (mountedRef.current) setVideoDimensions({ width: w, height: h });
  }, []);

  const startCamera = useCallback(async (facingMode = 'environment') => {
    if (startingRef.current) return;
    startingRef.current = true;

    safeSetStatus('requesting');
    safeSetError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        startingRef.current = false;
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach(t => t.stop());
        startingRef.current = false;
        return;
      }

      video.srcObject = stream;

      await new Promise((resolve) => {
        let resolved = false;

        const done = () => {
          if (resolved) return;
          resolved = true;
          const w = video.videoWidth || video.clientWidth || 640;
          const h = video.videoHeight || video.clientHeight || 480;
          safeSetDimensions(w, h);
          resolve();
        };

        if (video.readyState >= 1) {
          done();
          return;
        }

        video.addEventListener('loadedmetadata', done, { once: true });
        video.addEventListener('loadeddata', done, { once: true });

        setTimeout(done, 3000);
      });

      if (!mountedRef.current) {
        startingRef.current = false;
        return;
      }

      try {
        await video.play();
      } catch (playErr) {
      }

      if (mountedRef.current) {
        safeSetDimensions(
          video.videoWidth || video.clientWidth || 640,
          video.videoHeight || video.clientHeight || 480
        );
        safeSetStatus('ready');
      }
    } catch (err) {
      let msg = 'Camera access denied';
      if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.';
      else if (err.name === 'NotFoundError') msg = 'No camera found on this device.';
      else if (err.name === 'NotReadableError') msg = 'Camera is in use by another application.';
      else msg = err.message;

      safeSetError(msg);
      safeSetStatus('error');
    } finally {
      startingRef.current = false;
    }
  }, [safeSetStatus, safeSetError, safeSetDimensions]);

  const stopCamera = useCallback(() => {
    startingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    safeSetStatus('idle');
  }, [safeSetStatus]);

  const switchCamera = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    const currentFacing = track?.getSettings().facingMode;
    const newFacing = currentFacing === 'environment' ? 'user' : 'environment';
    stopCamera();
    return startCamera(newFacing);
  }, [startCamera, stopCamera]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      startingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef, status, error, videoDimensions,
    startCamera, stopCamera, switchCamera,
  };
}
