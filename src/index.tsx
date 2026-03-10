import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// OneSignal SDK laden
const script = document.createElement('script');
script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
script.defer = true;
document.head.appendChild(script);

// OneSignal wird dynamisch in App.tsx initialisiert
window.OneSignalDeferred = window.OneSignalDeferred || [];

const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<App />, root);
}

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}
