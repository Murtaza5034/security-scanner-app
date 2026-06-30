import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { MIN_CONFIDENCE, MODEL_LOAD_TIMEOUT_MS } from '../utils/constants';
import { getThreatInfo, isThreat } from '../utils/threatConfig';

let model = null;
let isLoading = false;
let loadPromise = null;

let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

export function isModelLoaded() {
  return model !== null;
}

export function getLoadProgress() {
  return { isLoading, isLoaded: model !== null, attempts: loadAttempts };
}

export async function loadModel(onProgress) {
  if (model) return model;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadAttempts++;

  loadPromise = (async () => {
    try {
      if (onProgress) onProgress(0.1);
      await tf.ready();
      if (onProgress) onProgress(0.3);

      model = await cocoSsd.load({
        base: 'lite_mobilenet_v2',
      });

      isLoading = false;
      if (onProgress) onProgress(1);
      return model;
    } catch (err) {
      isLoading = false;
      loadPromise = null;
      if (loadAttempts < MAX_LOAD_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 2000));
        return loadModel(onProgress);
      }
      throw new Error(`Model load failed after ${MAX_LOAD_ATTEMPTS} attempts: ${err.message}`);
    }
  })();

  return loadPromise;
}

let previousDetections = [];

export async function analyzeFrame(videoElement) {
  if (!model || !videoElement || videoElement.readyState < 2) {
    return { detections: [], threatsFound: false, threatCount: 0, hasPerson: false, raw: [] };
  }

  try {
    const predictions = await model.detect(videoElement, 10);

    const filtered = predictions
      .filter(d => d.score >= MIN_CONFIDENCE)
      .map(d => {
        const info = getThreatInfo(d.class);
        return {
          bbox: d.bbox,
          class: d.class,
          className: info.name,
          score: d.score,
          threat: info.threat,
          icon: info.icon,
          centerX: d.bbox[0] + d.bbox[2] / 2,
          centerY: d.bbox[1] + d.bbox[3] / 2,
        };
      });

    previousDetections = filtered;

    const threats = filtered.filter(d => isThreat(d));
    const hasPerson = filtered.some(d => d.class === 0);

    return {
      detections: filtered,
      threatsFound: threats.length > 0,
      threatCount: threats.length,
      threats,
      hasPerson,
      raw: predictions,
      timestamp: Date.now(),
    };
  } catch (err) {
    return { detections: previousDetections, threatsFound: false, threatCount: 0, hasPerson: false, raw: [], error: err.message };
  }
}
