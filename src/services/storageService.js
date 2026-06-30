import { openDB } from 'idb';

const DB_NAME = 'SecurityScannerDB';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('evidence')) {
          const store = db.createObjectStore('evidence', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('scanLog')) {
          const logStore = db.createObjectStore('scanLog', { keyPath: 'id', autoIncrement: true });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('falseReports')) {
          const reportStore = db.createObjectStore('falseReports', { keyPath: 'id', autoIncrement: true });
          reportStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveEvidence(imageDataUrl, detectionData) {
  const db = await getDB();
  return db.add('evidence', {
    imageDataUrl,
    detectionData,
    timestamp: Date.now(),
    location: null,
  });
}

export async function getEvidence(limit = 50) {
  const db = await getDB();
  const index = db.transaction('evidence').store.index('timestamp');
  return index.getAll(null, limit);
}

export async function logScan(detectionResult) {
  const db = await getDB();
  return db.add('scanLog', {
    ...detectionResult,
    timestamp: Date.now(),
  });
}

export async function getScanLog(limit = 100) {
  const db = await getDB();
  const index = db.transaction('scanLog').store.index('timestamp');
  return index.getAll(null, limit);
}

export async function reportFalsePositive(detectionData, feedback) {
  const db = await getDB();
  return db.add('falseReports', {
    detectionData,
    feedback: feedback || '',
    timestamp: Date.now(),
  });
}

export async function saveSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getSetting(key) {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result ? result.value : null;
}

export async function exportData() {
  const db = await getDB();
  const evidence = await db.getAll('evidence');
  const logs = await db.getAll('scanLog');
  const reports = await db.getAll('falseReports');
  return { evidence, logs, falseReports: reports, exportedAt: Date.now() };
}
