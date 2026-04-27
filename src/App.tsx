// src/App.tsx — v4: Zahnrad bei ALLEN Versionen (ReadOnly + Admin)
import React, { useState, useEffect, createContext } from 'react';
import { IonApp } from '@ionic/react';
import Tab1 from './pages/Tab1';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';

export const BrandingContext = createContext<any>(null);

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbwm0nO0XRsJD2gqWTbfZvRHdKTN0ylbJrWkJt66TcCCiBkX8l7aaV2lF5saHEBwwqeUoA/exec";

// ── Google Drive URL Auto-Konvertierung ───────────────────────
export function fixGoogleDriveUrl(url: string): string {
  if (!url) return url;
  const match = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
}

// ── OneSignal ─────────────────────────────────────────────────
function initOneSignal(appId: string, kundenId: string) {
  if (!appId) return;
  (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
  (window as any).OneSignalDeferred.push(async function (OneSignal: any) {
    await OneSignal.init({ appId });
    try { await OneSignal.User.addTag('kundenId', kundenId); }
    catch (e) { console.warn('OneSignal Tag Fehler:', e); }
  });
}

// ── Oster-Animationen ─────────────────────────────────────────
(function injectOsterStyles() {
  if (document.head.querySelector('#oster-styles')) return;
  const style = document.createElement('style');
  style.id = 'oster-styles';
  style.textContent = `
    @keyframes osterFall { 0%{transform:translateY(-60px) rotate(0deg);opacity:0} 10%{opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0.3} }
    @keyframes osterBounce { 0%,100%{transform:translateY(0) scale(1)} 30%{transform:translateY(-18px) scale(1.08)} 60%{transform:translateY(-8px) scale(1.03)} }
    @keyframes osterPop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 70%{transform:scale(1.12) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
    @keyframes osterFadeUp { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes osterShimmer { 0%,100%{opacity:1} 50%{opacity:0.75} }
    @keyframes osterRock { 0%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} 100%{transform:rotate(-8deg)} }
    @keyframes osterFadeOut { 0%{opacity:1} 100%{opacity:0} }
  `;
  document.head.appendChild(style);
})();

// ── Passwort-Input mit Augen-Symbol ───────────────────────────
const PasswordInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  placeholder?: string;
}> = ({ value, onChange, onEnter, placeholder = 'Passwort eingeben' }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onKeyDown={(e: any) => e.key === 'Enter' && onEnter && onEnter()}
        style={{ width: '100%', padding: '13px 48px 13px 16px', borderRadius: 10, border: 'none', fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' as const }}
      />
      <button onClick={() => setShow(s => !s)} type="button" tabIndex={-1}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888', padding: 4, lineHeight: 1 }}>
        {show ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
};

// ── Oster-Screen Palina ───────────────────────────────────────
const OsterScreenPalina: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 600); }, 8000); return () => clearTimeout(t); }, [onDone]);
  const confetti = [
    { left: '4%', bg: '#E879F9', w: 10, h: 10, dur: '3.0s', delay: '0s', round: true },
    { left: '22%', bg: '#F472B6', w: 11, h: 11, dur: '3.5s', delay: '0.9s', round: true },
    { left: '44%', bg: '#EC4899', w: 10, h: 14, dur: '3.8s', delay: '1.2s', round: true },
    { left: '66%', bg: '#F9A8D4', w: 12, h: 9, dur: '2.9s', delay: '1.0s', round: false },
    { left: '87%', bg: '#F472B6', w: 10, h: 10, dur: '2.7s', delay: '0.8s', round: true },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(160deg,#FDF0FF,#FFF0F8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', animation: visible ? 'none' : 'osterFadeOut 0.6s ease forwards' }}>
      {confetti.map((c, i) => <div key={i} style={{ position: 'absolute', top: 0, left: c.left, width: c.w, height: c.h, background: c.bg, borderRadius: c.round ? '50%' : '2px', animation: `osterFall ${c.dur} linear infinite`, animationDelay: c.delay, pointerEvents: 'none' }} />)}
      <div style={{ background: 'rgba(255,255,255,0.96)', border: '2.5px solid #E879F9', borderRadius: 28, padding: '1.75rem', maxWidth: 340, width: '88%', textAlign: 'center', position: 'relative', zIndex: 10, animation: 'osterPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ fontSize: 52 }}>🐰🐣🐇</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#C026D3', animation: 'osterShimmer 2s ease-in-out infinite' }}>Palina! 💗</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#C026D3', margin: '8px 0' }}>🌸 Frohe Ostern! 🌸</div>
        <div style={{ background: 'linear-gradient(135deg,#FDF4FF,#FFF0F8)', border: '2px solid #E879F9', borderRadius: 16, padding: '12px 14px', margin: '10px 0' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#A855F7' }}>Von Opa &amp; Oma 💗</div>
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onDone, 300); }} style={{ marginTop: 12, background: 'linear-gradient(135deg,#E879F9,#A855F7)', border: 'none', borderRadius: 12, padding: '10px 28px', fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>▶ Weiter</button>
      </div>
    </div>
  );
};

// ── Oster-Screen Julius ───────────────────────────────────────
const OsterScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 600); }, 8000); return () => clearTimeout(t); }, [onDone]);
  const confetti = [
    { left: '5%', bg: '#E8A020', w: 8, h: 12, dur: '3.1s', delay: '0s', round: false },
    { left: '25%', bg: '#3A7D44', w: 7, h: 14, dur: '3.4s', delay: '0.8s', round: false },
    { left: '55%', bg: '#E74C3C', w: 8, h: 13, dur: '3.0s', delay: '0.5s', round: false },
    { left: '75%', bg: '#8E44AD', w: 9, h: 11, dur: '3.3s', delay: '0.1s', round: false },
    { left: '92%', bg: '#C4161C', w: 10, h: 9, dur: '3.5s', delay: '0.4s', round: false },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(160deg,#FFF9F0,#FFF0F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', animation: visible ? 'none' : 'osterFadeOut 0.6s ease forwards' }}>
      {confetti.map((c, i) => <div key={i} style={{ position: 'absolute', top: 0, left: c.left, width: c.w, height: c.h, background: c.bg, borderRadius: c.round ? '50%' : '2px', animation: `osterFall ${c.dur} linear infinite`, animationDelay: c.delay, pointerEvents: 'none' }} />)}
      <div style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #F5C842', borderRadius: 24, padding: '2rem', maxWidth: 340, width: '88%', textAlign: 'center', position: 'relative', zIndex: 10, animation: 'osterPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ fontSize: 64, animation: 'osterBounce 2s ease-in-out infinite' }}>🐣</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: '#E8820A', animation: 'osterShimmer 2s ease-in-out infinite' }}>Julius! 🎉</div>
        <div style={{ background: '#FFF5E0', border: '1.5px solid #F5C842', borderRadius: 14, padding: '12px 14px', margin: '14px 0' }}>
          <div style={{ fontSize: 12, color: '#8B6914', fontWeight: 600, marginBottom: 4 }}>💌 Von Opa &amp; Oma</div>
          <div style={{ fontSize: 14, color: '#5a3a1a', lineHeight: 1.6 }}>Wir sind so stolz auf dich, Julius!<br />Du bist unser allergrößter Schatz. 🧡</div>
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onDone, 300); }} style={{ marginTop: 8, background: 'transparent', border: '1px solid #ddd', borderRadius: 8, padding: '6px 18px', fontSize: 12, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' }}>Weiter →</button>
      </div>
    </div>
  );
};

// ── Haupt-App ─────────────────────────────────────────────────
const App: React.FC = () => {
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');

  const [hasTeamLogin, setHasTeamLogin] = useState(false);
  const [teamLoginChecked, setTeamLoginChecked] = useState(false);
  const [teamRolle, setTeamRolle] = useState<'admin' | 'abtl' | 'team' | null>(null);
  const [teamMannschaft, setTeamMannschaft] = useState('');
  const [teamId, setTeamId] = useState('');
  const [showTeamLogin, setShowTeamLogin] = useState(false);
  const [teamLoginDone, setTeamLoginDone] = useState(false);
  const [teamPassword, setTeamPassword] = useState('');
  const [teamError, setTeamError] = useState('');
  const [teamLoading, setTeamLoading] = useState(false);

  const [showOster, setShowOster] = useState(false);
  const [showOsterPalina, setShowOsterPalina] = useState(false);

  const kundenId = (() => {
    const fromUrl = new URLSearchParams(window.location.search).get('kunde');
    if (fromUrl) { localStorage.setItem('kundenId', fromUrl); return fromUrl; }
    return localStorage.getItem('kundenId') || '';
  })();

  useEffect(() => {
    if (!kundenId) { setTeamLoginChecked(true); return; }
    fetch(`${API_EXEC_URL}?action=checkTeamLogin&kundenId=${kundenId}`)
      .then(r => r.json())
      .then(d => { setHasTeamLogin(d.hasTeamLogin || false); setTeamLoginChecked(true); })
      .catch(() => setTeamLoginChecked(true));
  }, [kundenId]); // eslint-disable-line

  const loadBranding = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_EXEC_URL}?action=get_branding&kundenId=${kundenId}`);
      const data = await res.json();
      if (data.success) {
        setBranding(data.branding);
        const b = data.branding;
        const vereinName      = b?.Verein_Name || 'Sport App';
        const logoUrl         = b?.Logo_Verein || b?.Logo_verein || '';
        const themaFarbe      = b?.Thema_Farbe       || '#111111';
        const akzentFarbe     = b?.Akzent_Farbe      || '#C8611A';
        const headerTextFarbe = b?.Header_Text_Farbe || '#FFFFFF';
        const cardHintergrund = b?.Card_Hintergrund  || '#F4F0E8';
        const cardRahmen      = b?.Card_Rahmen       || themaFarbe;
        const tagFarbe        = b?.Tag_Farbe         || akzentFarbe;
        const tagTextFarbe    = b?.Tag_Text_Farbe    || '#FFFFFF';
        const iconBarAktiv    = b?.IconBar_Aktiv     || akzentFarbe;

        document.documentElement.style.setProperty('--thema-farbe',       themaFarbe);
        document.documentElement.style.setProperty('--akzent-farbe',      akzentFarbe);
        document.documentElement.style.setProperty('--header-text-farbe', headerTextFarbe);
        document.documentElement.style.setProperty('--card-hintergrund',  cardHintergrund);
        document.documentElement.style.setProperty('--card-rahmen',       cardRahmen);
        document.documentElement.style.setProperty('--tag-farbe',         tagFarbe);
        document.documentElement.style.setProperty('--tag-text-farbe',    tagTextFarbe);
        document.documentElement.style.setProperty('--icon-bar-aktiv',    iconBarAktiv);

        document.title = vereinName;
        const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (appleMeta) appleMeta.setAttribute('content', vereinName);

        let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
        if (themeColorMeta) { themeColorMeta.setAttribute('content', themaFarbe); }
        else { themeColorMeta = document.createElement('meta'); themeColorMeta.name = 'theme-color'; themeColorMeta.content = themaFarbe; document.head.appendChild(themeColorMeta); }

        if (logoUrl) {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          const appleFavicon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
          if (favicon) favicon.href = logoUrl;
          if (appleFavicon) appleFavicon.href = logoUrl;
        }

        const osAppId = b?.OneSignal_App_ID || '';
        if (osAppId) initOneSignal(osAppId, kundenId);
        if (kundenId === 'V003') setShowOster(true);
        if (kundenId === 'V003P') setShowOsterPalina(true);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadBranding(); }, []); // eslint-disable-line

  useEffect(() => {
    if (!teamLoginChecked || !hasTeamLogin) return;
    const savedRolle = sessionStorage.getItem('teamRolle') as 'admin' | 'abtl' | 'team' | null;
    const savedMannschaft = sessionStorage.getItem('teamMannschaft') || '';
    const savedTeamId = sessionStorage.getItem('teamId') || '';
    if (savedRolle) { setTeamRolle(savedRolle); setTeamMannschaft(savedMannschaft); setTeamId(savedTeamId); setTeamLoginDone(true); }
    else { setShowTeamLogin(true); }
  }, [hasTeamLogin, teamLoginChecked]); // eslint-disable-line

  const reload = () => loadBranding();

  const handleTeamLogin = async () => {
    if (!teamPassword.trim()) return;
    setTeamLoading(true); setTeamError('');
    try {
      const res = await fetch(`${API_EXEC_URL}?action=getTeamRole&password=${encodeURIComponent(teamPassword)}&kundenId=${encodeURIComponent(kundenId)}`);
      const data = await res.json();
      if (data.success) {
        setTeamRolle(data.rolle); setTeamMannschaft(data.mannschaft); setTeamId(data.team_id);
        setTeamLoginDone(true); setShowTeamLogin(false); setTeamPassword('');
        sessionStorage.setItem('teamRolle', data.rolle);
        sessionStorage.setItem('teamMannschaft', data.mannschaft);
        sessionStorage.setItem('teamId', data.team_id);
      } else { setTeamError('Falsches Passwort'); }
    } catch { setTeamError('Verbindungsfehler'); }
    setTeamLoading(false);
  };

  const handleTeamLogout = () => {
    sessionStorage.removeItem('teamRolle'); sessionStorage.removeItem('teamMannschaft'); sessionStorage.removeItem('teamId');
    setTeamRolle(null); setTeamMannschaft(''); setTeamId(''); setTeamLoginDone(false); setShowTeamLogin(true);
  };

  const handleLogin = async () => {
    try {
      setError('');
      const res = await fetch(`${API_EXEC_URL}?kundenId=${encodeURIComponent(kundenId)}&password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (data.success) { setIsAuthenticated(true); setShowLogin(false); setPassword(''); }
      else { setError(data.error || 'Falsches Passwort!'); }
    } catch { setError('Login Fehler'); }
  };

  const themaFarbe      = branding?.Thema_Farbe       || '#111111';
  const akzentFarbe     = branding?.Akzent_Farbe      || '#C8611A';
  const headerTextFarbe = branding?.Header_Text_Farbe || '#FFFFFF';
  const logoUrl         = branding?.Logo_verein       || branding?.Logo_Verein || '';

  if (loading || !teamLoginChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111' }}>
        <div style={{ color: 'white', fontSize: 18 }}>Laden...</div>
      </div>
    );
  }

  // ── Team-Login Screen ─────────────────────────────────────
  if (hasTeamLogin && showTeamLogin && !teamLoginDone) {
    return (
      <IonApp>
        <div style={{ minHeight: '100vh', background: themaFarbe, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: 8 }} />}
            <h2 style={{ color: headerTextFarbe, fontWeight: 900, fontSize: 28, margin: 0, textAlign: 'center' }}>{branding?.Verein_Name || 'Sport App'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 14 }}>Bitte mit deinem Team-Passwort einloggen</p>
            <PasswordInput value={teamPassword} onChange={setTeamPassword} onEnter={handleTeamLogin} />
            {teamError && <p style={{ color: '#ffcccc', margin: 0, fontSize: 14 }}>{teamError}</p>}
            <button onClick={handleTeamLogin} disabled={teamLoading}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: akzentFarbe, color: '#FFFFFF', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', opacity: teamLoading ? 0.7 : 1 }}>
              {teamLoading ? 'Einloggen...' : 'Einloggen'}
            </button>
          </div>
        </div>
      </IonApp>
    );
  }

  // ── Admin-Login Screen (bei ALLEN Versionen — auch ReadOnly) ──
  if (showLogin && !isAuthenticated) {
    return (
      <IonApp>
        <div style={{ minHeight: '100vh', background: themaFarbe, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: 8 }} />}
            <h2 style={{ color: headerTextFarbe, fontWeight: 900, fontSize: 28, margin: 0, textAlign: 'center' }}>{branding?.Verein_Name || 'Admin Login'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 14 }}>Admin Login</p>
            <PasswordInput value={password} onChange={setPassword} onEnter={handleLogin} />
            {error && <p style={{ color: '#ffcccc', margin: 0, fontSize: 14 }}>{error}</p>}
            <button onClick={handleLogin}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: akzentFarbe, color: '#FFFFFF', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
              Einloggen
            </button>
            <button onClick={() => { setShowLogin(false); setPassword(''); setError(''); }}
              style={{ width: '100%', padding: 11, borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: headerTextFarbe, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Zurück zur App
            </button>
          </div>
        </div>
      </IonApp>
    );
  }

  return (
    <BrandingContext.Provider value={{
      branding, loading, reload, isAuthenticated,
      teamRolle, teamMannschaft, teamId, teamLoginDone, handleTeamLogout,
      themaFarbe, akzentFarbe, headerTextFarbe,
      cardHintergrund: branding?.Card_Hintergrund || '#F4F0E8',
      cardRahmen:      branding?.Card_Rahmen      || branding?.Thema_Farbe || '#111111',
      tagFarbe:        branding?.Tag_Farbe        || branding?.Akzent_Farbe || '#C8611A',
      tagTextFarbe:    branding?.Tag_Text_Farbe   || '#FFFFFF',
      iconBarAktiv:    branding?.IconBar_Aktiv    || branding?.Akzent_Farbe || '#C8611A',
    }}>
      <IonApp>
        {showOster && <OsterScreen onDone={() => setShowOster(false)} />}
        {showOsterPalina && <OsterScreenPalina onDone={() => setShowOsterPalina(false)} />}
        {/* ✅ NEU: Zahnrad bei ALLEN Versionen — auch ReadOnly (V055 etc.) */}
        <Tab1 onAdminClick={() => setShowLogin(true)} />
      </IonApp>
    </BrandingContext.Provider>
  );
};

export default App;
