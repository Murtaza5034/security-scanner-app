import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const waitingWorker = registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('App ready for offline use');
  },
});
