import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveSetting, getSetting } from '../services/storageService';

const SettingsContext = createContext(null);
const SettingsDispatch = createContext(null);

const DEFAULT_SETTINGS = {
  nearbyEnabled: false,
  sensitivity: 'medium',
  alertSound: 'default',
  disclaimerAccepted: false,
  modelLoaded: false,
};

function settingsReducer(state, action) {
  switch (action.type) {
    case 'SET_NEARBY':
      return { ...state, nearbyEnabled: action.payload };
    case 'SET_SENSITIVITY':
      return { ...state, sensitivity: action.payload };
    case 'SET_ALERT_SOUND':
      return { ...state, alertSound: action.payload };
    case 'ACCEPT_DISCLAIMER':
      return { ...state, disclaimerAccepted: true };
    case 'SET_MODEL_LOADED':
      return { ...state, modelLoaded: action.payload };
    case 'LOAD_SETTINGS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const saved = {};
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        const val = await getSetting(key);
        if (val !== null) saved[key] = val;
      }
      if (Object.keys(saved).length > 0) {
        dispatch({ type: 'LOAD_SETTINGS', payload: saved });
      }
    })();
  }, []);

  useEffect(() => {
    const keys = Object.keys(settings);
    keys.forEach(key => {
      saveSetting(key, settings[key]);
    });
  }, [settings]);

  return (
    <SettingsContext.Provider value={settings}>
      <SettingsDispatch.Provider value={dispatch}>
        {children}
      </SettingsDispatch.Provider>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function useSettingsDispatch() {
  return useContext(SettingsDispatch);
}
