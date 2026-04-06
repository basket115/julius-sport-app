// src/App.tsx — OneSignal mit kundenId-Tag
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

// ── OneSignal initialisieren + kundenId als Tag setzen ────────
function initOneSignal(appId: string, kundenId: string) {
  if (!appId) return;
  (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
  (window as any).OneSignalDeferred.push(async function (OneSignal: any) {
    await OneSignal.init({ appId });
    try {
      await OneSignal.User.addTag('kundenId', kundenId);
    } catch (e) {
      console.warn('OneSignal Tag Fehler:', e);
    }
  });
}

// ── Oster-Animationen global einmalig injizieren ─────────────
(function injectOsterStyles() {
  if (document.head.querySelector('#oster-styles')) return;
  const style = document.createElement('style');
  style.id = 'oster-styles';
  style.textContent = `
    @keyframes osterFall {
      0% { transform: translateY(-60px) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
    }
    @keyframes osterBounce {
      0%, 100% { transform: translateY(0) scale(1); }
      30% { transform: translateY(-18px) scale(1.08); }
      60% { transform: translateY(-8px) scale(1.03); }
    }
    @keyframes osterPop {
      0% { transform: scale(0) rotate(-10deg); opacity: 0; }
      70% { transform: scale(1.12) rotate(3deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes osterFadeUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes osterShimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.75; }
    }
    @keyframes osterRock {
      0% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
      100% { transform: rotate(-8deg); }
    }
    @keyframes osterFadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ── Oster-Screen Palina ───────────────────────────────────────
const OsterScreenPalina: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDone, 600); }, 8000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const confetti = [
    { left: '4%', bg: '#E879F9', w: 10, h: 10, dur: '3.0s', delay: '0s', round: true },
    { left: '12%', bg: '#C084FC', w: 8, h: 13, dur: '2.8s', delay: '0.4s', round: false },
    { left: '22%', bg: '#F472B6', w: 11, h: 11, dur: '3.5s', delay: '0.9s', round: true },
    { left: '33%', bg: '#A855F7', w: 9, h: 9, dur: '2.6s', delay: '0.2s', round: false },
    { left: '44%', bg: '#EC4899', w: 10, h: 14, dur: '3.8s', delay: '1.2s', round: true },
    { left: '55%', bg: '#D946EF', w: 8, h: 8, dur: '3.1s', delay: '0.6s', round: true },
    { left: '66%', bg: '#F9A8D4', w: 12, h: 9, dur: '2.9s', delay: '1.0s', round: false },
    { left: '77%', bg: '#C084FC', w: 9, h: 12, dur: '3.3s', delay: '0.3s', round: false },
    { left: '87%', bg: '#F472B6', w: 10, h: 10, dur: '2.7s', delay: '0.8s', round: true },
    { left: '94%', bg: '#E879F9', w: 8, h: 11, dur: '3.6s', delay: '1.5s', round: false },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #FDF0FF 0%, #FFF0F8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      animation: visible ? 'none' : 'osterFadeOut 0.6s ease forwards',
    }}>
      {confetti.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: c.left, width: c.w, height: c.h,
          background: c.bg, borderRadius: c.round ? '50%' : '2px',
          animation: `osterFall ${c.dur} linear infinite`, animationDelay: c.delay,
          pointerEvents: 'none',
        }} />
      ))}
      <div style={{
        background: 'rgba(255,255,255,0.96)', border: '2.5px solid #E879F9',
        borderRadius: 28, padding: '1.75rem 1.75rem 1.25rem',
        maxWidth: 340, width: '88%', textAlign: 'center',
        position: 'relative', zIndex: 10,
        animation: 'osterPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{ fontSize: 52, lineHeight: 1.2, marginBottom: 6 }}>
          <span style={{ display: 'inline-block', animation: 'osterBounce 1.8s ease-in-out infinite', animationDelay: '0s' }}>🐰</span>
          <span style={{ display: 'inline-block', animation: 'osterBounce 2.0s ease-in-out infinite', animationDelay: '0.2s' }}>🐣</span>
          <span style={{ display: 'inline-block', animation: 'osterBounce 1.8s ease-in-out infinite', animationDelay: '0.4s' }}>🐇</span>
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#C026D3', lineHeight: 1.1, margin: '4px 0', animation: 'osterShimmer 2s ease-in-out infinite' }}>
          Palina! 💗
        </div>
        <div style={{ fontSize: 28, margin: '6px 0', animation: 'osterFadeUp 0.8s ease both', animationDelay: '0.4s' }}>💗 💜 💗</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#C026D3', margin: '8px 0', animation: 'osterFadeUp 0.8s ease both', animationDelay: '0.5s' }}>
          🌸 Frohe Ostern! 🌸
        </div>
        <div style={{ fontSize: 40, lineHeight: 1.4, margin: '10px 0', animation: 'osterFadeUp 0.8s ease both', animationDelay: '0.6s' }}>
          🐥 🦋 🐝 🌷 🐛
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #FDF4FF, #FFF0F8)',
          border: '2px solid #E879F9', borderRadius: 16,
          padding: '12px 14px', margin: '10px 0',
          animation: 'osterFadeUp 0.8s ease both', animationDelay: '0.8s',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>👴💗👵</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#A855F7' }}>Von Opa &amp; Oma</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>🌈 ⭐ 🎀 ⭐ 🌈</div>
        </div>
        <div style={{ fontSize: 32, margin: '8px 0', animation: 'osterFadeUp 0.8s ease both', animationDelay: '1.0s' }}>
          🥚🟣🩷🟣🩷🥚
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          style={{ marginTop: 12, background: 'linear-gradient(135deg, #E879F9, #A855F7)', border: 'none', borderRadius: 12, padding: '10px 28px', fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
          ▶ Weiter
        </button>
      </div>
    </div>
  );
};

// ── Oster-Screen für Julius ────────────────────────────────────
const OsterScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 600);
    }, 8000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const confetti = [
    { left: '5%', bg: '#E8A020', w: 8, h: 12, dur: '3.1s', delay: '0s', round: false },
    { left: '15%', bg: '#C4161C', w: 10, h: 10, dur: '2.8s', delay: '0.3s', round: true },
    { left: '25%', bg: '#3A7D44', w: 7, h: 14, dur: '3.4s', delay: '0.8s', round: false },
    { left: '35%', bg: '#9B59B6', w: 10, h: 8, dur: '2.6s', delay: '0.2s', round: false },
    { left: '45%', bg: '#E8A020', w: 9, h: 9, dur: '3.7s', delay: '1.1s', round: true },
    { left: '55%', bg: '#E74C3C', w: 8, h: 13, dur: '3.0s', delay: '0.5s', round: false },
    { left: '65%', bg: '#27AE60', w: 11, h: 8, dur: '2.9s', delay: '0.9s', round: false },
    { left: '75%', bg: '#8E44AD', w: 9, h: 11, dur: '3.3s', delay: '0.1s', round: false },
    { left: '85%', bg: '#F39C12', w: 7, h: 10, dur: '2.7s', delay: '0.7s', round: true },
    { left: '92%', bg: '#C4161C', w: 10, h: 9, dur: '3.5s', delay: '0.4s', round: false },
    { left: '10%', bg: '#1ABC9C', w: 8, h: 12, dur: '4.0s', delay: '1.5s', round: false },
    { left: '70%', bg: '#E8A020', w: 12, h: 8, dur: '3.8s', delay: '1.8s', round: false },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #FFF9F0 0%, #FFF0F5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      animation: visible ? 'none' : 'osterFadeOut 0.6s ease forwards',
    }}>
      {/* Confetti */}
      {confetti.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0,
          left: c.left, width: c.w, height: c.h,
          background: c.bg,
          borderRadius: c.round ? '50%' : '2px',
          animation: `osterFall ${c.dur} linear infinite`,
          animationDelay: c.delay,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        border: '2px solid #F5C842',
        borderRadius: 24,
        padding: '2rem 2rem 1.5rem',
        maxWidth: 340, width: '88%',
        textAlign: 'center',
        position: 'relative', zIndex: 10,
        animation: 'osterPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Eggs */}
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>
          <span style={{ display: 'inline-block', animation: 'osterRock 1.5s ease-in-out infinite', transformOrigin: 'bottom center' }}>🥚</span>
          <span style={{ display: 'inline-block', fontSize: 64, animation: 'osterBounce 2s ease-in-out infinite', animationDelay: '0.1s' }}>🐣</span>
          <span style={{ display: 'inline-block', animation: 'osterRock 1.5s ease-in-out infinite', animationDelay: '0.3s', transformOrigin: 'bottom center' }}>🥚</span>
        </div>

        {/* Frohe Ostern */}
        <div style={{
          fontSize: 12, fontWeight: 600, color: '#C4161C',
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
          animation: 'osterFadeUp 0.8s ease both', animationDelay: '0.3s',
        }}>Frohe Ostern</div>

        {/* Julius */}
        <div style={{
          fontSize: 42, fontWeight: 800, color: '#E8820A', lineHeight: 1.1,
          margin: '4px 0',
          animation: 'osterShimmer 2s ease-in-out infinite, osterFadeUp 0.8s ease both',
          animationDelay: '0s, 0.5s',
        }}>Julius! 🎉</div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
          <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to right, transparent, #F5C842)' }} />
          <span style={{ fontSize: 20 }}>🐇</span>
          <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to left, transparent, #F5C842)' }} />
        </div>

        {/* Message */}
        <div style={{
          fontSize: 15, color: '#5a3a1a', lineHeight: 1.65, marginBottom: 14,
          animation: 'osterFadeUp 0.8s ease both', animationDelay: '0.7s',
        }}>
          Der Osterhase hat etwas ganz Besonderes<br />
          für dich versteckt — schau mal nach! 🌟
        </div>

        {/* Opa & Oma Box */}
        <div style={{
          background: '#FFF5E0', border: '1.5px solid #F5C842',
          borderRadius: 14, padding: '12px 14px', marginBottom: 14,
          animation: 'osterFadeUp 0.8s ease both', animationDelay: '1s',
        }}>
          <div style={{ fontSize: 12, color: '#8B6914', fontWeight: 600, marginBottom: 4 }}>
            💌 Von Opa &amp; Oma
          </div>
          <div style={{ fontSize: 14, color: '#5a3a1a', lineHeight: 1.6 }}>
            Wir sind so stolz auf dich, Julius!<br />
            Du bist unser allergrößter Schatz. 🧡
          </div>
        </div>

        {/* Colored circles */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8, fontSize: 26, marginBottom: 10,
          animation: 'osterFadeUp 0.8s ease both', animationDelay: '1.2s',
        }}>
          🟡🟠🟣🟢🔴
        </div>

        {/* Basketball touch */}
        <div style={{ fontSize: 12, color: '#bbb', animation: 'osterFadeUp 0.8s ease both', animationDelay: '1.4s' }}>
          🏀 Dein Team freut sich auf dich!
        </div>

        {/* Skip button */}
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          style={{
            marginTop: 16, background: 'transparent', border: '1px solid #ddd',
            borderRadius: 8, padding: '6px 18px', fontSize: 12, color: '#aaa',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          Weiter →
        </button>
      </div>
    </div>
  );
};

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

  // ── Oster-State ───────────────────────────────────────────────
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
      .catch(() => { setTeamLoginChecked(true); });
  }, [kundenId]); // eslint-disable-line

  const loadBranding = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_EXEC_URL}?action=get_branding&kundenId=${kundenId}`);
      const data = await res.json();
      if (data.success) {
        setBranding(data.branding);
        const vereinName = data.branding?.Verein_Name || 'Sport App';
        const logoUrl = data.branding?.Logo_Verein || data.branding?.Logo_verein || '';
        const themaFarbe      = data.branding?.Thema_Farbe       || '#111111';
        const akzentFarbe     = data.branding?.Akzent_Farbe      || '#C8611A';
        const headerTextFarbe = data.branding?.Header_Text_Farbe || '#FFFFFF';
        const cardHintergrund = data.branding?.Card_Hintergrund  || '#F4F0E8';
        const cardRahmen      = data.branding?.Card_Rahmen       || themaFarbe;
        const tagFarbe        = data.branding?.Tag_Farbe         || akzentFarbe;
        const tagTextFarbe    = data.branding?.Tag_Text_Farbe    || '#FFFFFF';
        const iconBarAktiv    = data.branding?.IconBar_Aktiv     || akzentFarbe;

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
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', themaFarbe);
        } else {
          themeColorMeta = document.createElement('meta');
          themeColorMeta.name = 'theme-color';
          themeColorMeta.content = themaFarbe;
          document.head.appendChild(themeColorMeta);
        }

        if (logoUrl) {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          const appleFavicon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
          if (favicon) favicon.href = logoUrl;
          if (appleFavicon) appleFavicon.href = logoUrl;
        }

        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (manifestLink) {
          const manifest = {
            short_name: vereinName,
            name: vereinName + ' App',
            icons: [
              { src: logoUrl || '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
              { src: logoUrl || '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ],
            start_url: '/?kunde=' + kundenId,
            display: 'standalone',
            background_color: themaFarbe,
            theme_color: themaFarbe
          };
          const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
          const oldUrl = manifestLink.href;
          manifestLink.href = URL.createObjectURL(blob);
          if (oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
        }

        const osAppId = data.branding?.OneSignal_App_ID || '';
        if (osAppId) initOneSignal(osAppId, kundenId);

        // ── Oster-Screen nur für Julius (V003) & Palina (V003P) ──
        if (kundenId === 'V003') setShowOster(true);
        if (kundenId === 'V003P') setShowOsterPalina(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadBranding(); }, []); // eslint-disable-line

  useEffect(() => {
    if (!teamLoginChecked || !hasTeamLogin) return;
    const savedRolle = sessionStorage.getItem('teamRolle') as 'admin' | 'abtl' | 'team' | null;
    const savedMannschaft = sessionStorage.getItem('teamMannschaft') || '';
    const savedTeamId = sessionStorage.getItem('teamId') || '';
    if (savedRolle) {
      setTeamRolle(savedRolle);
      setTeamMannschaft(savedMannschaft);
      setTeamId(savedTeamId);
      setTeamLoginDone(true);
    } else {
      setShowTeamLogin(true);
    }
  }, [hasTeamLogin, teamLoginChecked]); // eslint-disable-line

  const reload = () => loadBranding();

  const handleTeamLogin = async () => {
    if (!teamPassword.trim()) return;
    setTeamLoading(true);
    setTeamError('');
    try {
      const res = await fetch(
        `${API_EXEC_URL}?action=getTeamRole&password=${encodeURIComponent(teamPassword)}&kundenId=${encodeURIComponent(kundenId)}`
      );
      const data = await res.json();
      if (data.success) {
        setTeamRolle(data.rolle);
        setTeamMannschaft(data.mannschaft);
        setTeamId(data.team_id);
        setTeamLoginDone(true);
        setShowTeamLogin(false);
        setTeamPassword('');
        sessionStorage.setItem('teamRolle', data.rolle);
        sessionStorage.setItem('teamMannschaft', data.mannschaft);
        sessionStorage.setItem('teamId', data.team_id);
      } else {
        setTeamError('Falsches Passwort');
      }
    } catch {
      setTeamError('Verbindungsfehler');
    }
    setTeamLoading(false);
  };

  const handleTeamLogout = () => {
    sessionStorage.removeItem('teamRolle');
    sessionStorage.removeItem('teamMannschaft');
    sessionStorage.removeItem('teamId');
    setTeamRolle(null);
    setTeamMannschaft('');
    setTeamId('');
    setTeamLoginDone(false);
    setShowTeamLogin(true);
  };

  const handleLogin = async () => {
    try {
      setError('');
      const res = await fetch(
        `${API_EXEC_URL}?kundenId=${encodeURIComponent(kundenId)}&password=${encodeURIComponent(password)}`
      );
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setShowLogin(false);
        setPassword('');
      } else {
        setError(data.error || 'Falsches Passwort!');
      }
    } catch {
      setError('Login Fehler');
    }
  };

  const isAdmin = !!(branding as any)?.Passwort;
  const themaFarbe      = branding?.Thema_Farbe       || '#111111';
  const akzentFarbe     = branding?.Akzent_Farbe      || '#C8611A';
  const headerTextFarbe = branding?.Header_Text_Farbe || '#FFFFFF';
  const cardHintergrund = branding?.Card_Hintergrund  || '#F4F0E8';
  const cardRahmen      = branding?.Card_Rahmen       || themaFarbe;
  const tagFarbe        = branding?.Tag_Farbe         || akzentFarbe;
  const tagTextFarbe    = branding?.Tag_Text_Farbe    || '#FFFFFF';
  const iconBarAktiv    = branding?.IconBar_Aktiv     || akzentFarbe;
  const logoUrl         = branding?.Logo_verein       || branding?.Logo_Verein || '';

  if (loading || !teamLoginChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111' }}>
        <div style={{ color: 'white', fontSize: 18 }}>Laden...</div>
      </div>
    );
  }

  if (hasTeamLogin && showTeamLogin && !teamLoginDone) {
    return (
      <IonApp>
        <div style={{ minHeight: '100vh', background: themaFarbe, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: 8 }} />}
            <h2 style={{ color: headerTextFarbe, fontWeight: 900, fontSize: 28, margin: 0, textAlign: 'center' }}>{branding?.Verein_Name || 'Sport App'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 14 }}>Bitte mit deinem Team-Passwort einloggen</p>
            <input type="password" placeholder="Passwort eingeben" value={teamPassword}
              onChange={(e: any) => setTeamPassword(e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && handleTeamLogin()}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: 'none', fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
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

  if (isAdmin && showLogin && !isAuthenticated) {
    return (
      <IonApp>
        <div style={{ minHeight: '100vh', background: themaFarbe, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'contain', background: 'rgba(255,255,255,0.15)', padding: 8 }} />}
            <h2 style={{ color: headerTextFarbe, fontWeight: 900, fontSize: 28, margin: 0, textAlign: 'center' }}>{branding?.Verein_Name || 'Admin Login'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 14 }}>Admin Login</p>
            <input type="password" placeholder="Passwort eingeben" value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: 'none', fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
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
      themaFarbe, akzentFarbe, headerTextFarbe, cardHintergrund, cardRahmen, tagFarbe, tagTextFarbe, iconBarAktiv,
    }}>
      <IonApp>
        {showOster && <OsterScreen onDone={() => setShowOster(false)} />}
        {showOsterPalina && <OsterScreenPalina onDone={() => setShowOsterPalina(false)} />}
        <Tab1 onAdminClick={isAdmin ? () => setShowLogin(true) : undefined} />
      </IonApp>
    </BrandingContext.Provider>
  );
};

export default App;
