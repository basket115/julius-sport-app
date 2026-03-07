import React, { useState, useEffect, createContext } from 'react';
import { IonApp } from '@ionic/react';
import Tab1 from './pages/Tab1';



export const BrandingContext = createContext<any>(null);

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbzyZN60q75nNVhqHWZBV6gbX6IEa7Zu1KmZkhttxPIzJmXjb3v03xLcOW5T3PxicqT8EA/exec";

const App: React.FC = () => {
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const kundenId =
    new URLSearchParams(window.location.search).get('kunde') || '';

  const loadBranding = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_EXEC_URL}?action=get_branding&kundenId=${kundenId}`
      );
      const data = await res.json();
      if (data.success) setBranding(data.branding);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBranding();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kundenId]);

  const reload = () => loadBranding();

  const handleLogin = async () => {
    try {
      setError('');
      const res = await fetch(
        `${API_EXEC_URL}?kundenId=${encodeURIComponent(kundenId)}&password=${encodeURIComponent(password)}`
      );
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError(data.error || 'Falsches Passwort!');
      }
    } catch (err: any) {
      setError('Login Fehler');
    }
  };

  const isAdmin = !!(branding as any)?.Passwort;

  // Loading screen
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: '#111'
      }}>
        <div style={{ color: 'white', fontSize: 18 }}>Laden...</div>
      </div>
    );
  }

  // Login screen for admins
  if (branding && isAdmin && !isAuthenticated) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        backgroundColor: branding.Thema_Farbe || '#111111'
      }}>
        {branding.Logo_verein && (
          <img src={branding.Logo_verein} alt="Logo" style={{
            width: 80, height: 80, borderRadius: 16,
            marginBottom: 16, objectFit: 'contain'
          }} />
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

  // Main app
  return (
    <BrandingContext.Provider value={{ branding, loading, reload }}>
      <IonApp>
        <Tab1 />
      </IonApp>
    </BrandingContext.Provider>
  );
};

export default App;
