import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { logScan } from '../services/storageService';

const ScannerContext = createContext(null);
const ScannerDispatch = createContext(null);

const INITIAL_STATE = {
  isScanning: false,
  lastResult: null,
  threatDetected: false,
  threats: [],
  allDetections: [],
  scanHistory: [],
  isCameraReady: false,
  modelStatus: 'unloaded',
  scanningEnabled: true,
  showInfoCard: false,
  currentDistance: null,
  currentDirection: null,
};

function scannerReducer(state, action) {
  switch (action.type) {
    case 'SET_SCANNING':
      return { ...state, isScanning: action.payload };
    case 'SET_RESULT':
      return {
        ...state,
        lastResult: action.payload,
        threatDetected: action.payload.threatsFound,
        threats: action.payload.threats || [],
        allDetections: action.payload.detections || [],
        showInfoCard: true,
      };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        scanHistory: [action.payload, ...state.scanHistory].slice(0, 200),
      };
    case 'SET_CAMERA_READY':
      return { ...state, isCameraReady: action.payload };
    case 'SET_MODEL_STATUS':
      return { ...state, modelStatus: action.payload };
    case 'SET_SCANNING_ENABLED':
      return { ...state, scanningEnabled: action.payload };
    case 'SET_INFO_CARD':
      return { ...state, showInfoCard: action.payload };
    case 'SET_PROXIMITY':
      return {
        ...state,
        currentDistance: action.payload.distance,
        currentDirection: action.payload.direction,
      };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

export function ScannerProvider({ children }) {
  const [scannerState, dispatch] = useReducer(scannerReducer, INITIAL_STATE);

  const addToHistory = useCallback(async (result) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: result });
    try {
      await logScan(result);
    } catch (e) {
    }
  }, []);

  return (
    <ScannerContext.Provider value={{ ...scannerState, addToHistory }}>
      <ScannerDispatch.Provider value={dispatch}>
        {children}
      </ScannerDispatch.Provider>
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  const ctx = useContext(ScannerContext);
  if (!ctx) throw new Error('useScanner must be used inside ScannerProvider');
  return ctx;
}

export function useScannerDispatch() {
  const ctx = useContext(ScannerDispatch);
  if (!ctx) throw new Error('useScannerDispatch must be used inside ScannerProvider');
  return ctx;
}
