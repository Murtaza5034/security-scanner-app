import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useSettingsDispatch } from '../context/SettingsContext';
import { SENSITIVITY_LEVELS, ALERT_SOUNDS } from '../utils/constants';

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}</div>
        {description && <div className="settings-row-desc">{description}</div>}
      </div>
      <button
        className={`toggle ${value ? 'toggle--on' : 'toggle--off'}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
      >
        <div className="toggle-knob" />
      </button>
    </div>
  );
}

function SliderSelect({ value, onChange, options, label, description }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}</div>
        {description && <div className="settings-row-desc">{description}</div>}
      </div>
      <div className="settings-slider-group">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`settings-slider-opt ${value === opt.value ? 'settings-slider-opt--active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="settings-title">Security Settings</h1>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Nearby Security</div>

        <Toggle
          label="Nearby Security Alert"
          description="Continuously scan surroundings and alert on threats within 20m"
          value={settings.nearbyEnabled}
          onChange={(v) => dispatch({ type: 'SET_NEARBY', payload: v })}
        />

        <SliderSelect
          label="Sensitivity"
          description="Higher sensitivity detects more objects but may increase false alerts"
          value={settings.sensitivity}
          onChange={(v) => dispatch({ type: 'SET_SENSITIVITY', payload: v })}
          options={SENSITIVITY_LEVELS}
        />
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Alerts</div>

        <SliderSelect
          label="Alert Sound"
          description="Choose the sound played when a threat is detected"
          value={settings.alertSound}
          onChange={(v) => dispatch({ type: 'SET_ALERT_SOUND', payload: v })}
          options={ALERT_SOUNDS}
        />
      </div>

      <div className="settings-section">
        <div className="settings-section-title">About</div>

        <div className="settings-info-block">
          <p>
            <strong>Security Scanner v1.0</strong>
          </p>
          <p>
            All detection happens on-device using TensorFlow.js.
            No data is uploaded to any server.
          </p>
          <p>
            This is an assistive tool and is not 100% accurate.
            Always contact local authorities for real threats.
          </p>
        </div>
      </div>
    </div>
  );
}
