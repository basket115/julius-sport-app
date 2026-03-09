import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// OneSignal SDK laden
const script = document.createElement('script');
script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
script.defer = true;
document.head.appendChild(script);

// OneSignal initialisieren
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function (OneSignal: any) {
  await OneSignal.init({
    appId: '5ecf64c2-2666-4009-ab7d-78474d673a83',  // ✅ TG Neuss Tigers
  });
});

const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<App />, root);
}

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}
