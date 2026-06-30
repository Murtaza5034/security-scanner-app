export const SCAN_INTERVAL_MS = 300;
export const THREAT_DISTANCE_METERS = 20;
export const MODEL_LOAD_TIMEOUT_MS = 30000;
export const MIN_CONFIDENCE = 0.4;

export const SENSITIVITY = {
  low: { minConfidence: 0.7, proximityThreshold: 10 },
  medium: { minConfidence: 0.5, proximityThreshold: 20 },
  high: { minConfidence: 0.3, proximityThreshold: 30 },
};

export const SENSITIVITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const ALERT_SOUNDS = [
  { value: 'default', label: 'Default Alert' },
  { value: 'sharp', label: 'Sharp Tone' },
  { value: 'silent', label: 'Silent' },
];
