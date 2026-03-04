// src/App.tsx

import React, { useEffect, useState } from 'react';
import { IonApp } from '@ionic/react';
import Tab1 from './pages/Tab1';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';
import { fetchBranding, Branding } from './utils/remoteConfig';

export const BrandingContext = React.createContext<{
  branding: Branding | null;
  loading: boolean;
  reload: () => Promise<void>;
}>({
  branding: null,
  loading: false,
  reload: async () => {},
});

const App: React.FC = () => {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getKundenId = () => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('kunde');
    if (fromUrl) {
      localStorage.setItem('Kunden_ID', fromUrl);
      return fromUrl;
    }
    return localStorage.getItem('Kunden_ID') || 'V004';
  };

  const reload = async () => {
    setLoading(true);
    try {
      const kundenId = getKundenId();
      const data = await fetchBranding(kundenId);
      setBranding(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleLogin = () => {
    if (password === (branding as any)?.Passwort) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('❌ Falsches Passwort!');
    }
  };

  const isAdmin = !!(branding as any)?.Passwort;

  if (branding && isAdmin && !isAuthenticated) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        backgroundColor: branding.Thema_Farbe || '#111111'
      }}>
        {(branding as any).Logo_verein && (
          <img
            src={(branding as any).Logo_verein}
            alt="Logo"
            style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 16, objectFit: 'contain', background: 'white', padding: 8 }}
          />
        )}
        <h2 style={{ color: 'white', marginBottom: 4 }}>{branding.Verein_Name}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Admin Login</p>
        <input
          type="password"
          placeholder="Passwort eingeben"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          onKeyDown={(e: any) => e.key === 'Enter' && handleLogin()}
          style={{
            padding: 12, borderRadius: 10, border: 'none',
            marginBottom: 10, width: 260, fontSize: 16
          }}
        />
        {error && <p style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</p>}
        <button
          onClick={handleLogin}
          style={{
            padding: '12px 40px', borderRadius: 10, border: 'none',
            backgroundColor: 'white', color: branding.Thema_Farbe || '#111111',
            fontWeight: 'bold', fontSize: 16, cursor: 'pointer', width: 260
          }}
        >
          Einloggen
        </button>
      </div>
    );
  }

  return (
    <BrandingContext.Provider value={{ branding, loading, reload }}>
      <IonApp>
        <Tab1 />
      </IonApp>
    </BrandingContext.Provider>
  );
};

export default App;
