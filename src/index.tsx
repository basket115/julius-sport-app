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
    appId: '43c5eaec-7470-43d7-a59d-1775c8b21217',
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
