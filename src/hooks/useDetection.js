import { useRef, useEffect, useCallback, useState } from 'react';
import { analyzeFrame, loadModel, isModelLoaded } from '../services/detectionEngine';
import { estimateDistance, estimateDirection } from '../services/proximityEstimator';
import { triggerThreatAlert, triggerSafeAlert } from '../services/alertManager';
import { useSettings } from '../context/SettingsContext';
import { useScanner, useScannerDispatch } from '../context/ScannerContext';
import { SCAN_INTERVAL_MS, SENSITIVITY, THREAT_DISTANCE_METERS } from '../utils/constants';

export default function useDetection(videoRef, videoDimensions) {
  const settings = useSettings();
  const scannerState = useScanner();
  const dispatch = useScannerDispatch();
  const [modelLoading, setModelLoading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelError, setModelError] = useState(null);
  const lastThreatTime = useRef(0);
  const lastSafeTime = useRef(0);
  const lastAlertTime = useRef(0);
  const lastScanTime = useRef(0);
  const loopingRef = useRef(false);
  const canvasRef = useRef(null);

  const initModel = useCallback(async () => {
    if (isModelLoaded()) {
      dispatch({ type: 'SET_MODEL_STATUS', payload: 'loaded' });
      return true;
    }
    setModelLoading(true);
    setModelError(null);
    dispatch({ type: 'SET_MODEL_STATUS', payload: 'loading' });

    try {
      await loadModel((progress) => {
        setModelProgress(progress);
      });
      setModelLoading(false);
      dispatch({ type: 'SET_MODEL_STATUS', payload: 'loaded' });
      return true;
    } catch (err) {
      setModelError(err.message);
      setModelLoading(false);
      dispatch({ type: 'SET_MODEL_STATUS', payload: 'error' });
      return false;
    }
  }, [dispatch]);

  const runDetection = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    const now = Date.now();
    if (now - lastScanTime.current < SCAN_INTERVAL_MS) return;
    lastScanTime.current = now;

    try {
      const result = await analyzeFrame(videoRef.current);
      dispatch({ type: 'SET_RESULT', payload: result });

      if (result.detections.length > 0) {
        const topDetection = result.detections[0];
        const distance = estimateDistance(topDetection, videoDimensions.width, videoDimensions.height);
        const direction = estimateDirection(topDetection, videoDimensions.width);

        if (distance) {
          dispatch({
            type: 'SET_PROXIMITY',
            payload: { distance: distance.meters, direction: direction?.direction || 'unknown' },
          });
        }

        result.detections = result.detections.map(d => ({
          ...d,
          distance: estimateDistance(d, videoDimensions.width, videoDimensions.height),
          direction: estimateDirection(d, videoDimensions.width),
        }));
      }

      if (result.threatsFound) {
        const sensitivity = SENSITIVITY[settings.sensitivity] || SENSITIVITY.medium;
        const nearbyThreats = result.threats.filter(t => {
          if (settings.nearbyEnabled) {
            const dist = estimateDistance(t, videoDimensions.width, videoDimensions.height);
            return dist && dist.meters <= (sensitivity.proximityThreshold || THREAT_DISTANCE_METERS);
          }
          return true;
        });

        if (nearbyThreats.length > 0) {
          if (now - lastThreatTime.current > 3000) {
            lastThreatTime.current = now;
            triggerThreatAlert(nearbyThreats, settings);
          }
        }
      } else {
        if (now - lastSafeTime.current > 5000) {
          lastSafeTime.current = now;
          if (result.detections.length > 0 && result.detections.some(d => d.class === 0)) {
            triggerSafeAlert();
          }
        }
      }

      scannerState.addToHistory({
        threatsFound: result.threatsFound,
        threats: result.threats,
        detectionCount: result.detections.length,
        timestamp: now,
      });
    } catch (err) {
    }
  }, [videoRef, videoDimensions, settings, dispatch, scannerState]);

  const detectionLoopRef = useRef(null);

  const startScanning = useCallback(() => {
    if (loopingRef.current) return;
    loopingRef.current = true;
    dispatch({ type: 'SET_SCANNING', payload: true });

    const loop = () => {
      if (!loopingRef.current) return;
      runDetection();
      detectionLoopRef.current = requestAnimationFrame(loop);
    };
    detectionLoopRef.current = requestAnimationFrame(loop);
  }, [runDetection, dispatch]);

  const stopScanning = useCallback(() => {
    loopingRef.current = false;
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
    dispatch({ type: 'SET_SCANNING', payload: false });
  }, [dispatch]);

  useEffect(() => {
    return () => {
      loopingRef.current = false;
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, []);

  return {
    initModel,
    startScanning,
    stopScanning,
    modelLoading,
    modelProgress,
    modelError,
    canvasRef,
  };
}
