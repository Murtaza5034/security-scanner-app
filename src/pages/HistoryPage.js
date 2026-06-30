import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScanLog, getEvidence, exportData } from '../services/storageService';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [scanLog, setScanLog] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [tab, setTab] = useState('scans');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const logs = await getScanLog(100);
    const ev = await getEvidence(50);
    setScanLog(logs.reverse());
    setEvidence(ev.reverse());
  }

  async function handleExport() {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-scanner-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString();
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString();
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <button className="settings-back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="history-title">Scan History</h1>
        <button className="history-export-btn" onClick={handleExport}>
          Export
        </button>
      </div>

      <div className="history-tabs">
        <button
          className={`history-tab ${tab === 'scans' ? 'history-tab--active' : ''}`}
          onClick={() => setTab('scans')}
        >
          Scans ({scanLog.length})
        </button>
        <button
          className={`history-tab ${tab === 'evidence' ? 'history-tab--active' : ''}`}
          onClick={() => setTab('evidence')}
        >
          Evidence ({evidence.length})
        </button>
      </div>

      {tab === 'scans' && (
        <div className="history-list">
          {scanLog.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">📡</div>
              <div>No scans yet. Point the camera at objects to start scanning.</div>
            </div>
          ) : (
            scanLog.map((entry, i) => (
              <div key={entry.id || i} className="history-item">
                <div className="history-item-icon">
                  {entry.threatsFound ? '⚠️' : '✅'}
                </div>
                <div className="history-item-info">
                  <div className="history-item-type">
                    {entry.threatsFound
                      ? `${entry.threats?.length || 0} threat(s) detected`
                      : `No threats (${entry.detectionCount || 0} object(s))`
                    }
                  </div>
                  <div className="history-item-time">
                    {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'evidence' && (
        <div className="history-list">
          {evidence.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">💾</div>
              <div>No saved evidence. Use the save button during a scan to capture evidence.</div>
            </div>
          ) : (
            evidence.map((ev, i) => (
              <div key={ev.id || i} className="history-item">
                <div className="history-item-evidence">
                  {ev.imageDataUrl && (
                    <img
                      src={ev.imageDataUrl}
                      alt="Evidence"
                      className="history-evidence-thumb"
                    />
                  )}
                </div>
                <div className="history-item-info">
                  <div className="history-item-time">
                    {formatDate(ev.timestamp)} {formatTime(ev.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
