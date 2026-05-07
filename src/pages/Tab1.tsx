// src/pages/Tab1.tsx v22 — Fix: club_id für Sieg/Niederlage Berechnung
mport React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import CategoriesComponent from '../components/CategoriesComponent';
import { BrandingContext, fixGoogleDriveUrl } from '../App';

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbwm0nO0XRsJD2gqWTbfZvRHdKTN0ylbJrWkJt66TcCCiBkX8l7aaV2lF5saHEBwwqeUoA/exec";

// ─── YouTube Embed ────────────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
}

// ─── Sponsor Cache & Loader ───────────────────────────────────
type SponsorData = { logoUrl?: string; bannerText?: string; bannerBildUrl?: string; linkUrl?: string };
const sponsorCache: Record<string, SponsorData | null> = {};

async function loadSponsorsForKunde(kundenId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_EXEC_URL}?action=get_sponsors&kundenId=${encodeURIComponent(kundenId)}`, { redirect: 'follow' });
    const d = await res.json();
    return d?.sponsors || [];
  } catch { return []; }
}

function isAktiv(val: any): boolean {
  return val === undefined || val === null || String(val).trim() === ''
    ? true : val === true || val === 'true' || String(val).toUpperCase() === 'TRUE';
}

async function getSponsor(kundenId: string): Promise<SponsorData | null> {
  if (kundenId in sponsorCache) return sponsorCache[kundenId];
  const rows = await loadSponsorsForKunde(kundenId);
  const found = rows.find((r: any) => String(r?.Kunden_ID || '').trim() === kundenId && isAktiv(r?.Aktiv));
  sponsorCache[kundenId] = found
    ? { logoUrl: found.Logo_URL || undefined, bannerText: found.Banner_Text || undefined, bannerBildUrl: found.Banner_Bild_URL || undefined, linkUrl: found.Banner_Link_URL || undefined }
    : null;
  return sponsorCache[kundenId];
}

// ─── Default Sponsor ──────────────────────────────────────────
const DEFAULT_SPONSOR: SponsorData = {
  logoUrl: 'https://i.imgur.com/5b852Lw.png',
  bannerText: 'Partner für unsere Vereins-App\nDiese App wurde von ONLANG entwickelt – einer Plattform für moderne Vereinskommunikation.\n\nONLANG hilft Sportvereinen dabei, ihre Organisation zu digitalisieren und Mitglieder sowie Fans direkt über eine eigene App zu erreichen.\n\nNews, Ergebnisse, Trainingszeiten und vieles mehr – alles an einem Ort.',
  linkUrl: 'https://onlang-app.netlify.app',
};

// ─── SponsorBanner ────────────────────────────────────────────
const SponsorBanner: React.FC<{ kundenId: string }> = ({ kundenId }) => {
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!kundenId) return;
    getSponsor(kundenId).then(s => { setSponsor(s); setLoaded(true); });
  }, [kundenId]);
  if (!loaded) return null;
  const activeSponsor = sponsor ?? DEFAULT_SPONSOR;
  const bannerInhalt = (
    <>
      {activeSponsor.logoUrl && (
        <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, border: '1px solid #eee' }}>
          <img src={activeSponsor.logoUrl} alt="Partner Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} referrerPolicy="no-referrer" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeSponsor.bannerText && <div style={{ fontSize: 13, lineHeight: 1.45, color: '#444', whiteSpace: 'pre-wrap' as const, fontWeight: 500 }}>{activeSponsor.bannerText}</div>}
        {activeSponsor.linkUrl && <div style={{ marginTop: 6, fontSize: 12, color: '#0057B7', fontWeight: 600 }}>Mehr erfahren →</div>}
      </div>
    </>
  );
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: '#aaa', marginBottom: 8 }}>Partner</div>
      {activeSponsor.linkUrl ? (
        <a href={activeSponsor.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', borderRadius: 12, padding: '12px 14px', border: '2px solid var(--thema-farbe, #1A2E4A)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', textDecoration: 'none' }}>{bannerInhalt}</a>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', borderRadius: 12, padding: '12px 14px', border: '2px solid var(--thema-farbe, #1A2E4A)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>{bannerInhalt}</div>
      )}
    </div>
  );
};

// ─── Social Bar ───────────────────────────────────────────────
const SocialBar: React.FC<{ b: any }> = ({ b }) => {
  const web = b?.WEB_URL || '';
  const fb  = b?.Facebook_URL || '';
  const ig  = b?.Instragram_URL || b?.Instagram_URL || '';
  const yt  = b?.Youtube_URL || '';
  const tt  = b?.TikTok_URL || '';
  if (!web && !fb && !ig && !yt && !tt) return null;
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 14, padding: '12px 14px', background: '#ffffff', borderRadius: 12, border: '2px solid var(--thema-farbe, #1A2E4A)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>
      {web && <a href={web} target="_blank" rel="noopener noreferrer" style={{ lineHeight: 0 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="#1a73e8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></a>}
      {fb  && <a href={fb}  target="_blank" rel="noopener noreferrer" style={{ lineHeight: 0 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
      {ig  && <a href={ig}  target="_blank" rel="noopener noreferrer" style={{ lineHeight: 0 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>}
      {yt  && <a href={yt}  target="_blank" rel="noopener noreferrer" style={{ lineHeight: 0 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg></a>}
      {tt  && <a href={tt}  target="_blank" rel="noopener noreferrer" style={{ lineHeight: 0 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="#000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg></a>}
    </div>
  );
};

// ─── Cloudinary URL Optimierung ──────────────────────────────
function optimizeImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', '/upload/c_fill,w_1200,h_675,g_auto,q_auto,f_auto/');
  }
  return fixGoogleDriveUrl(url);
}

// ─── Cloudinary Upload ────────────────────────────────────────
const CLOUDINARY_CLOUD = 'dhn90jugp';
const CLOUDINARY_PRESET = 'onlang_upload';

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST', body: formData,
  });
  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error('Upload fehlgeschlagen');
}

const BildUploadButton: React.FC<{
  onUploaded: (url: string) => void;
  akzentFarbe: string;
  cardRahmen: string;
}> = ({ onUploaded, akzentFarbe, cardRahmen }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const url = await uploadToCloudinary(file);
      onUploaded(url);
    } catch {
      setError('Upload fehlgeschlagen. Bitte nochmal versuchen.');
    } finally { setUploading(false); }
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button onClick={() => inputRef.current?.click()} disabled={uploading}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `2px dashed ${cardRahmen}`, background: uploading ? '#f5f5f5' : 'white', color: uploading ? '#aaa' : akzentFarbe, fontWeight: 700, fontSize: 14, cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {uploading ? '⏳ Bild wird hochgeladen...' : '📁 Bild vom Computer hochladen'}
      </button>
      {error && <p style={{ color: 'red', fontSize: 13, margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
};

// ─── Info Popup ───────────────────────────────────────────────
const InfoPopup: React.FC<{ onClose: () => void; akzentFarbe: string }> = ({ onClose, akzentFarbe }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
    <div style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📸 Bild-URL Anleitung</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>×</button>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: '#333' }}>
        <div style={{ background: '#f8f8f8', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: akzentFarbe }}>Option 1: Imgur (empfohlen)</p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            <li>Gehe zu <strong>imgur.com</strong></li>
            <li>Klick auf <strong>"New Post"</strong></li>
            <li>Bild hochladen</li>
            <li>Rechtsklick auf Bild → <strong>"Bild-Adresse kopieren"</strong></li>
            <li>URL hier einfügen</li>
          </ol>
        </div>
        <div style={{ background: '#E8F4FD', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1a73e8' }}>Option 2: Google Drive ✅</p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            <li>Bild in <strong>Google Drive</strong> hochladen</li>
            <li>Rechtsklick → <strong>"Link kopieren"</strong></li>
            <li>URL hier einfügen</li>
            <li><strong>Wird automatisch umgewandelt!</strong> 🔄</li>
          </ol>
        </div>
        <div style={{ background: '#FFF3EC', borderRadius: 10, padding: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: akzentFarbe }}><strong>Empfohlene Größe:</strong> 1200 x 675 px (16:9 Format)</p>
        </div>
      </div>
      <button onClick={onClose} style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 10, border: 'none', background: akzentFarbe, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Verstanden ✓</button>
    </div>
  </div>
);

// ─── Sponsor Popup ────────────────────────────────────────────
const SponsorPopup: React.FC<{ kundenId: string; themaFarbe: string; akzentFarbe: string; onClose: () => void }> = ({ kundenId, themaFarbe, akzentFarbe, onClose }) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    getSponsor(kundenId).then(s => {
      if (s) { setLogoUrl(s.logoUrl || ''); setBannerText(s.bannerText || ''); setLinkUrl(s.linkUrl || ''); }
    });
  }, [kundenId]);
  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const params = new URLSearchParams({ action: 'update_sponsor', kundenId, logoUrl, bannerText, linkUrl });
      const res = await fetch(`${API_EXEC_URL}?${params}`);
      const data = await res.json();
      if (data.success) {
        delete sponsorCache[kundenId];
        setSuccess('✅ Sponsor gespeichert!');
        setTimeout(() => { setSuccess(''); onClose(); }, 1500);
      } else { setError('Fehler: ' + (data.error || 'Unbekannt')); }
    } catch { setError('Verbindungsfehler'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🤝 Sponsor einrichten</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Logo URL</label>
            <input value={logoUrl} onChange={(e: any) => setLogoUrl(e.target.value)} placeholder="https://i.imgur.com/..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' as const, color: '#111' }} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Banner Text</label>
            <textarea value={bannerText} onChange={(e: any) => setBannerText(e.target.value)} rows={4} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' as const, color: '#111', resize: 'vertical' as const }} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Link URL</label>
            <input value={linkUrl} onChange={(e: any) => setLinkUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' as const, color: '#111' }} /></div>
        </div>
        {success && <p style={{ color: 'green', margin: '12px 0 0', fontSize: 14 }}>{success}</p>}
        {error && <p style={{ color: 'red', margin: '12px 0 0', fontSize: 14 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 15, color: '#111' }}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: akzentFarbe, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {saving ? 'Speichern...' : '💾 Sponsor speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Popup ───────────────────────────────────────────────
const EditPopup: React.FC<{
  beitrag: any; akzentFarbe: string; cardRahmen: string; kundenId: string;
  onClose: () => void; onSaved: (updated: any) => void;
}> = ({ beitrag, akzentFarbe, cardRahmen, kundenId, onClose, onSaved }) => {
  const [titel, setTitel] = useState(beitrag.Titel || '');
  const [text, setText] = useState(beitrag.Text || '');
  const [bildUrl, setBildUrl] = useState(beitrag.Bild_URL || '');
  const [videoUrl, setVideoUrl] = useState(beitrag.Video_URL || beitrag.videoUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const bId = String(beitrag.id || beitrag.Id || '').trim();
      const params = new URLSearchParams({
        action: 'update_beitrag', kundenId, id: bId, titel, text,
        bildUrl: fixGoogleDriveUrl(bildUrl), videoUrl: fixGoogleDriveUrl(videoUrl),
      });
      const res = await fetch(`${API_EXEC_URL}?${params}`);
      const data = await res.json();
      if (data.success) { onSaved({ ...beitrag, Titel: titel, Text: text, Bild_URL: bildUrl, Video_URL: videoUrl }); onClose(); }
      else { setError('Fehler: ' + (data.error || 'Unbekannt')); }
    } catch { setError('Verbindungsfehler'); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>✏️ Beitrag bearbeiten</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Titel</label>
            <input value={titel} onChange={(e: any) => setTitel(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${cardRahmen}`, fontSize: 14, boxSizing: 'border-box' as const, color: '#111' }} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Text</label>
            <textarea value={text} onChange={(e: any) => setText(e.target.value)} rows={5} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${cardRahmen}`, fontSize: 14, boxSizing: 'border-box' as const, color: '#111', resize: 'vertical' as const }} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Bild URL</label>
            <input value={bildUrl} onChange={(e: any) => setBildUrl(e.target.value)} placeholder="https://i.imgur.com/... oder Google Drive Link" style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${cardRahmen}`, fontSize: 14, boxSizing: 'border-box' as const, color: '#111' }} />
            <BildUploadButton onUploaded={(url) => setBildUrl(url)} akzentFarbe={akzentFarbe} cardRahmen={cardRahmen} />
            {bildUrl && <img src={fixGoogleDriveUrl(bildUrl)} alt="Vorschau" style={{ marginTop: 8, width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />}</div>
          <div><label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>▶ YouTube URL</label>
            <input value={videoUrl} onChange={(e: any) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${cardRahmen}`, fontSize: 14, boxSizing: 'border-box' as const, color: '#111' }} /></div>
        </div>
        {error && <p style={{ color: 'red', margin: '12px 0 0', fontSize: 14 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 15, color: '#111' }}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: akzentFarbe, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {saving ? 'Speichern...' : '💾 Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// NEU v21 – ERGEBNISSE & SPIELPLAN TYPEN
// ============================================================
interface Match {
  match_uid: string;
  kickoff_at: string;
  status: string;
  league: string;
  league_short: string;
  age_group: string;
  gender: string;
  round_name: string;
  home_name: string;
  home_points: number;
  away_name: string;
  away_points: number;
  home_club_id: string;
  away_club_id: string;
  venue?: string;
}

interface TeamApi {
  team_id: string;
  team_name: string;
  age_group: string;
  gender: string;
  league: string;
}

type Scope = 'all' | 'played' | 'upcoming';

function formatMatchDatum(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatMatchDatumLang(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatUhrzeit(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

// ============================================================
// NEU v21 – ERGEBNISSE WIDGET (Startseite)
// ============================================================
const ErgebnisseWidget: React.FC<{
  kundenId: string;
  themaFarbe: string;
  akzentFarbe: string;
  headerTextFarbe: string;
  cardHintergrund: string;
  cardRahmen: string;
  onAlleAnzeigen: () => void;
}> = ({ kundenId, themaFarbe, akzentFarbe, cardHintergrund, cardRahmen, onAlleAnzeigen }) => {
  const [gespielt, setGespielt]   = useState<Match[]>([]);
  const [anstehend, setAnstehend] = useState<Match[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fehler, setFehler]       = useState('');

  useEffect(() => {
    if (!kundenId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_EXEC_URL}?action=get_matches&kundenId=${kundenId}&scope=played&limit=3`, { redirect: 'follow' }).then(r => r.json()),
      fetch(`${API_EXEC_URL}?action=get_matches&kundenId=${kundenId}&scope=upcoming&limit=2`, { redirect: 'follow' }).then(r => r.json()),
    ]).then(([dG, dA]) => {
      if (dG.success)  setGespielt(dG.items   || []);
      if (dA.success)  setAnstehend(dA.items  || []);
      if (!dG.success && !dA.success) setFehler('Spielplandaten nicht verfügbar');
    }).catch(() => setFehler('Verbindungsfehler'))
      .finally(() => setLoading(false));
  }, [kundenId]); // eslint-disable-line

  if (!loading && !fehler && gespielt.length === 0 && anstehend.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏀</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: themaFarbe }}>Ergebnisse & Spielplan</span>
        </div>
        <button onClick={onAlleAnzeigen}
          style={{ background: 'none', border: 'none', color: akzentFarbe, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Alle →
        </button>
      </div>

      {loading && (
        <div style={{ background: cardHintergrund, borderRadius: 12, padding: 20, border: `1px solid ${cardRahmen}`, textAlign: 'center', color: '#999', fontSize: 14 }}>
          ⏳ Lade Spielplandaten...
        </div>
      )}

      {!loading && fehler && (
        <div style={{ background: '#fff5f5', borderRadius: 12, padding: 14, border: '1px solid #ffcccc', color: '#cc0000', fontSize: 13, textAlign: 'center' }}>
          {fehler}
        </div>
      )}

      {!loading && gespielt.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase' as const, marginBottom: 6 }}>Letzte Ergebnisse</div>
          {gespielt.map(m => <MatchKarteKlein key={m.match_uid} match={m} kundenId={kundenId} themaFarbe={themaFarbe} akzentFarbe={akzentFarbe} cardHintergrund={cardHintergrund} cardRahmen={cardRahmen} gespielt={true} />)}
        </div>
      )}

      {!loading && anstehend.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase' as const, marginBottom: 6 }}>Nächste Spiele</div>
          {anstehend.map(m => <MatchKarteKlein key={m.match_uid} match={m} kundenId={kundenId} themaFarbe={themaFarbe} akzentFarbe={akzentFarbe} cardHintergrund={cardHintergrund} cardRahmen={cardRahmen} gespielt={false} />)}
        </div>
      )}

      {!loading && (gespielt.length > 0 || anstehend.length > 0) && (
        <button onClick={onAlleAnzeigen}
          style={{ width: '100%', marginTop: 10, padding: '11px 0', borderRadius: 10, border: `2px solid ${themaFarbe}`, background: 'white', color: themaFarbe, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Kompletter Spielplan →
        </button>
      )}
    </div>
  );
};

// ─── Kleine Match-Karte (Widget) ──────────────────────────────
const MatchKarteKlein: React.FC<{
  match: Match; kundenId: string; themaFarbe: string; akzentFarbe: string;
  cardHintergrund: string; cardRahmen: string; gespielt: boolean;
}> = ({ match, kundenId, themaFarbe, akzentFarbe, cardHintergrund, cardRahmen, gespielt }) => {
  const heimIstEigen  = match.home_club_id === kundenId;
  const gastIstEigen  = match.away_club_id === kundenId;
  const eigenePunkte  = heimIstEigen ? match.home_points : match.away_points;
  const gegnerPunkte  = heimIstEigen ? match.away_points : match.home_points;
  const gewonnen      = gespielt && eigenePunkte > gegnerPunkte;
  const unentschieden = gespielt && eigenePunkte === gegnerPunkte;
  const statusFarbe   = !gespielt ? akzentFarbe : gewonnen ? '#22a85a' : unentschieden ? '#888' : '#e53935';
  const statusText    = !gespielt ? formatUhrzeit(match.kickoff_at) : gewonnen ? 'Sieg' : unentschieden ? 'Unentschieden' : 'Niederlage';

  return (
    <div style={{ background: cardHintergrund, borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: `1px solid ${cardRahmen}`, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{match.age_group} {match.gender === 'weiblich' ? '♀' : '♂'} · {match.league_short}</span>
        <span style={{ fontSize: 11, color: '#999' }}>{formatMatchDatum(match.kickoff_at)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: heimIstEigen ? 800 : 500, color: heimIstEigen ? themaFarbe : '#333', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {match.home_name}
          </div>
        </div>
        <div style={{ textAlign: 'center' as const, flexShrink: 0 }}>
          {gespielt ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: themaFarbe }}>{match.home_points}</span>
              <span style={{ fontSize: 13, color: '#bbb' }}>:</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: themaFarbe }}>{match.away_points}</span>
            </div>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 700, color: akzentFarbe }}>vs</span>
          )}
          <div style={{ fontSize: 10, fontWeight: 700, color: statusFarbe, textAlign: 'center' as const, marginTop: 2 }}>{statusText}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' as const }}>
          <div style={{ fontSize: 13, fontWeight: gastIstEigen ? 800 : 500, color: gastIstEigen ? themaFarbe : '#333', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {match.away_name}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: '#bbb', textAlign: 'center' as const }}>{match.round_name}</div>
    </div>
  );
};

// ============================================================
// NEU v21 – SPIELPLAN TAB (Vollansicht)
// ============================================================
const SpielplanVollansicht: React.FC<{
  kundenId: string; themaFarbe: string; akzentFarbe: string;
  headerTextFarbe: string; cardHintergrund: string; cardRahmen: string;
  onZurueck: () => void;
}> = ({ kundenId, themaFarbe, akzentFarbe, headerTextFarbe, cardHintergrund, cardRahmen, onZurueck }) => {
  const [matches, setMatches]         = useState<Match[]>([]);
  const [teams, setTeams]             = useState<TeamApi[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fehler, setFehler]           = useState('');
  const [scope, setScope]             = useState<Scope>('all');
  const [gewaehltesTeam, setGewaehltesTeam] = useState('');
  const [seite, setSeite]             = useState(1);
  const [gesamtSeiten, setGesamtSeiten] = useState(1);
  const [gesamt, setGesamt]           = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    if (!kundenId) return;
    fetch(`${API_EXEC_URL}?action=get_teams_api&kundenId=${kundenId}`, { redirect: 'follow' })
      .then(r => r.json())
      .then(d => { if (d.success) setTeams(d.teams || []); })
      .catch(() => {});
  }, [kundenId]);

  const ladeMatches = useCallback(async (neueSeite = 1) => {
    if (!kundenId) return;
    setLoading(true); setFehler('');
    try {
      let url = `${API_EXEC_URL}?action=get_matches&kundenId=${kundenId}&scope=${scope}&limit=${LIMIT}&page=${neueSeite}`;
      if (gewaehltesTeam) {
        const team = teams.find(t => t.team_id === gewaehltesTeam);
        if (team) url += `&age_group=${encodeURIComponent(team.age_group)}&gender=${encodeURIComponent(team.gender)}`;
      }
      const res  = await fetch(url, { redirect: 'follow' });
      const data = await res.json();
      if (data.success) {
        setMatches(data.items || []);
        setSeite(data.page || 1);
        setGesamtSeiten(data.pages || 1);
        setGesamt(data.total || 0);
      } else { setFehler(data.error || 'Fehler beim Laden'); }
    } catch { setFehler('Verbindungsfehler'); }
    finally { setLoading(false); }
  }, [kundenId, scope, gewaehltesTeam, teams]);

  useEffect(() => { ladeMatches(1); }, [scope, gewaehltesTeam]); // eslint-disable-line

  const scopeLabel = (s: Scope) => s === 'played' ? 'Ergebnisse' : s === 'upcoming' ? 'Anstehend' : 'Alle';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, display: 'flex', flexDirection: 'column', background: '#f0f0f0' }}>
      {/* Header */}
      <div style={{ background: themaFarbe, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onZurueck}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: headerTextFarbe, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          ← Zurück
        </button>
        <span style={{ color: headerTextFarbe, fontWeight: 800, fontSize: 16 }}>🏀 Spielplan & Ergebnisse</span>
      </div>

      {/* Inhalt */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Scope Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['all', 'played', 'upcoming'] as Scope[]).map(s => (
            <button key={s} onClick={() => setScope(s)}
              style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: scope === s ? themaFarbe : 'white', color: scope === s ? headerTextFarbe : '#555', boxShadow: scope === s ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}>
              {scopeLabel(s)}
            </button>
          ))}
        </div>

        {/* Mannschaftsfilter */}
        {teams.length > 0 && (
          <select value={gewaehltesTeam} onChange={(e: any) => setGewaehltesTeam(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${cardRahmen}`, fontSize: 14, color: '#111', background: 'white', fontFamily: 'inherit', marginBottom: 12 }}>
            <option value="">Alle Mannschaften</option>
            {teams.map(t => (
              <option key={t.team_id} value={t.team_id}>
                {t.age_group} {t.gender === 'weiblich' ? '♀' : '♂'} — {t.league}
              </option>
            ))}
          </select>
        )}

        {/* Info */}
        {!loading && !fehler && gesamt > 0 && (
          <div style={{ fontSize: 12, color: '#999', marginBottom: 10, textAlign: 'right' as const }}>
            {gesamt} Spiele · Seite {seite} / {gesamtSeiten}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div>Lade Spielplan...</div>
          </div>
        )}

        {/* Fehler */}
        {!loading && fehler && (
          <div style={{ background: '#fff5f5', borderRadius: 12, padding: 16, border: '1px solid #ffcccc', textAlign: 'center' as const }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: '#cc0000', fontSize: 14, marginBottom: 12 }}>{fehler}</div>
            <button onClick={() => ladeMatches(seite)}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: akzentFarbe, color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Keine Daten */}
        {!loading && !fehler && matches.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div>Keine Spiele gefunden</div>
          </div>
        )}

        {/* Spielliste */}
        {!loading && !fehler && matches.map(m => (
          <MatchKarteGross key={m.match_uid} match={m} kundenId={kundenId}
            themaFarbe={themaFarbe} akzentFarbe={akzentFarbe}
            cardHintergrund={cardHintergrund} cardRahmen={cardRahmen} />
        ))}

        {/* Pagination */}
        {!loading && gesamtSeiten > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            <button onClick={() => ladeMatches(seite - 1)} disabled={seite <= 1}
              style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid ${cardRahmen}`, background: seite <= 1 ? '#f5f5f5' : 'white', color: seite <= 1 ? '#bbb' : themaFarbe, fontWeight: 700, fontSize: 14, cursor: seite <= 1 ? 'default' : 'pointer' }}>
              ← Zurück
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, color: '#666' }}>
              {seite} / {gesamtSeiten}
            </div>
            <button onClick={() => ladeMatches(seite + 1)} disabled={seite >= gesamtSeiten}
              style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid ${cardRahmen}`, background: seite >= gesamtSeiten ? '#f5f5f5' : 'white', color: seite >= gesamtSeiten ? '#bbb' : themaFarbe, fontWeight: 700, fontSize: 14, cursor: seite >= gesamtSeiten ? 'default' : 'pointer' }}>
              Weiter →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Große Match-Karte (Vollansicht) ─────────────────────────
const MatchKarteGross: React.FC<{
  match: Match; kundenId: string; themaFarbe: string; akzentFarbe: string;
  cardHintergrund: string; cardRahmen: string;
}> = ({ match, kundenId, themaFarbe, akzentFarbe, cardHintergrund, cardRahmen }) => {
  const gespielt      = match.status === 'played' || match.status === 'result';
  const heimIstEigen  = match.home_club_id === kundenId;
  const gastIstEigen  = match.away_club_id === kundenId;
  const eigenePunkte  = heimIstEigen ? match.home_points : match.away_points;
  const gegnerPunkte  = heimIstEigen ? match.away_points : match.home_points;
  const gewonnen      = gespielt && eigenePunkte > gegnerPunkte;
  const unentschieden = gespielt && eigenePunkte === gegnerPunkte;
  const ergebnisColor = !gespielt ? '#888' : gewonnen ? '#22a85a' : unentschieden ? '#888' : '#e53935';
  const ergebnisLabel = !gespielt ? '' : gewonnen ? '✓ Sieg' : unentschieden ? '– Unentschieden' : '✗ Niederlage';

  return (
    <div style={{ background: cardHintergrund, borderRadius: 12, padding: '14px 14px 12px', marginBottom: 10, border: `1px solid ${cardRahmen}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: akzentFarbe }}>{match.age_group} {match.gender === 'weiblich' ? '♀' : '♂'}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{match.league}</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>{formatMatchDatumLang(match.kickoff_at)}</div>
          {!gespielt && <div style={{ fontSize: 11, color: akzentFarbe, fontWeight: 700 }}>{formatUhrzeit(match.kickoff_at)}</div>}
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{match.round_name}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: heimIstEigen ? 900 : 500, color: heimIstEigen ? themaFarbe : '#222', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.home_name}</div>
          {heimIstEigen && <div style={{ fontSize: 10, color: akzentFarbe, fontWeight: 700, marginTop: 2 }}>Heim</div>}
        </div>
        <div style={{ textAlign: 'center' as const, flexShrink: 0, minWidth: 70 }}>
          {gespielt ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: themaFarbe }}>{match.home_points}</span>
                <span style={{ fontSize: 14, color: '#ccc' }}>:</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: themaFarbe }}>{match.away_points}</span>
              </div>
              {ergebnisLabel && <div style={{ fontSize: 11, fontWeight: 700, color: ergebnisColor, marginTop: 2 }}>{ergebnisLabel}</div>}
            </>
          ) : (
            <div style={{ background: themaFarbe, color: 'white', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 700 }}>vs</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' as const }}>
          <div style={{ fontSize: 14, fontWeight: gastIstEigen ? 900 : 500, color: gastIstEigen ? themaFarbe : '#222', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.away_name}</div>
          {gastIstEigen && <div style={{ fontSize: 10, color: akzentFarbe, fontWeight: 700, marginTop: 2, textAlign: 'right' as const }}>Gast</div>}
        </div>
      </div>
      {match.venue && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
          📍 {match.venue}
        </div>
      )}
    </div>
  );
};

// ─── Hauptkomponente ──────────────────────────────────────────
type Props = { onAdminClick?: () => void };

const Tab1: React.FC<Props> = ({ onAdminClick }) => {
  const {
    branding, loading, reload, isAuthenticated,
    teamRolle, teamMannschaft, handleTeamLogout,
    themaFarbe: ctxThema, akzentFarbe: ctxAkzent, headerTextFarbe: ctxHeaderText,
    cardHintergrund: ctxCardBg, cardRahmen: ctxCardRahmen,
    tagFarbe: ctxTagFarbe, tagTextFarbe: ctxTagText, iconBarAktiv: ctxIconAktiv,
  } = useContext(BrandingContext);

  const [beitraege, setBeitraege]         = useState<any[]>([]);
  const [showForm, setShowForm]           = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [titel, setTitel]                 = useState('');
  const [text, setText]                   = useState('');
  const [bildUrl, setBildUrl]             = useState('');
  const [videoUrl, setVideoUrl]           = useState('');
  const [kategorie, setKategorie]         = useState('');
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState('');
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [showBildInfo, setShowBildInfo]   = useState(false);
  const [activeKategorie, setActiveKategorie] = useState<string>('');
  const [editBeitrag, setEditBeitrag]     = useState<any | null>(null);

  // NEU v21
  const [zeigeSpielplan, setZeigeSpielplan] = useState(false);

  const b = branding as any;
  const themaFarbe      = ctxThema      || b?.Thema_Farbe       || '#111111';
  const akzentFarbe     = ctxAkzent     || b?.Akzent_Farbe      || '#C8611A';
  const headerTextFarbe = ctxHeaderText || b?.Header_Text_Farbe || '#FFFFFF';
  const cardHintergrund = ctxCardBg     || b?.Card_Hintergrund  || '#FFFFFF';
  const cardRahmen      = ctxCardRahmen || b?.Card_Rahmen       || '#E5E5E5';
  const tagFarbe        = ctxTagFarbe   || b?.Tag_Farbe         || akzentFarbe;
  const tagTextFarbe    = ctxTagText    || b?.Tag_Text_Farbe    || '#FFFFFF';

  const isAdmin     = !!b?.Passwort && isAuthenticated;
  const isTeamAdmin = teamRolle === 'admin';
  const isAbtl      = teamRolle === 'abtl';
  const isTeam      = teamRolle === 'team';
  const canPost     = isAdmin || isTeamAdmin || isAbtl || isTeam;

  const canDelete = (beitrag: any): boolean => {
    if (isAdmin || isTeamAdmin || isAbtl) return true;
    if (isTeam) return String(beitrag.Kategorie || '').trim() === teamMannschaft;
    return false;
  };

  const logoUrl        = b?.Logo_verein || b?.Logo_Verein || '';
  const sponsorLogoUrl = b?.Logo_Sponsor || b?.Logo_sponsor || '';
  const kundenId: string = String(branding?.Kunden_ID || '').trim();
  const clubId: string = String(b?.club_id || '').trim() || kundenId;

  const kategorienFinal: string[] = useMemo(() => {
    const kat = b?.Kategorien;
    if (Array.isArray(kat) && kat.length) return kat;
    if (typeof kat === 'string' && kat.trim()) return kat.split(',').map((k: string) => k.trim()).filter(Boolean);
    return ['News', 'Spiel', 'Training', 'Sonstiges'];
  }, [b?.Kategorien]);

  const sichtbareKategorien: string[] = useMemo(() => {
    if (isTeam && teamMannschaft) return kategorienFinal.filter(k => k === teamMannschaft);
    return kategorienFinal;
  }, [kategorienFinal, isTeam, teamMannschaft]);

  const ladeId = (b?.Parent_ID && String(b.Parent_ID).trim()) ? String(b.Parent_ID).trim() : branding?.Kunden_ID;

  const ladeBeitraege = useCallback(async () => {
    if (!ladeId) return;
    try {
      const res = await fetch(`${API_EXEC_URL}?action=get_beitraege&kundenId=${ladeId}`);
      const data = await res.json();
      if (data.success) setBeitraege(data.rows || data.beitraege || []);
    } catch (err) { console.error(err); }
  }, [ladeId]);

  useEffect(() => { ladeBeitraege(); }, [ladeBeitraege]);

  useEffect(() => {
    if (!sichtbareKategorien.length) return;
    if (isTeam && teamMannschaft) { setKategorie(teamMannschaft); setActiveKategorie(teamMannschaft); }
    else { setKategorie(prev => (!prev || prev === 'News') ? sichtbareKategorien[0] : prev); }
  }, [sichtbareKategorien, isTeam, teamMannschaft]);

  const gefilterteBeitraege = useMemo(() => {
    if (!activeKategorie) return beitraege;
    return beitraege.filter(b => String(b.Kategorie || '').trim() === activeKategorie);
  }, [beitraege, activeKategorie]);

  const handleSubmit = async () => {
    if (!titel || !text) return;
    setSaving(true);
    const postKategorie = isTeam && teamMannschaft ? teamMannschaft : (kategorie || kategorienFinal[0] || 'News');
    const fixedBildUrl  = fixGoogleDriveUrl(bildUrl);
    const fixedVideoUrl = fixGoogleDriveUrl(videoUrl);
    try {
      const params = new URLSearchParams({
        action: 'add_beitrag', kundenId: branding?.Kunden_ID || '',
        vereinName: b?.Verein_Name || '', titel, text,
        bildUrl: fixedBildUrl, videoUrl: fixedVideoUrl,
        datum: new Date().toLocaleDateString('de-DE'), kategorie: postKategorie,
      });
      const data = await fetch(`${API_EXEC_URL}?${params}`).then(r => r.json());
      if (data.success) {
        setSuccess('✅ Beitrag gespeichert!');
        setTitel(''); setText(''); setBildUrl(''); setVideoUrl('');
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
        ladeBeitraege();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (beitrag: any) => {
    const beitragId = String(beitrag.id || beitrag.Id || '').trim();
    if (!beitragId) { alert('Keine ID — kann nicht gelöscht werden.'); return; }
    if (!window.confirm(`"${beitrag.Titel}" wirklich löschen?`)) return;
    setDeletingId(beitragId);
    try {
      const res = await fetch(`${API_EXEC_URL}?action=delete_beitrag&kundenId=${encodeURIComponent(branding?.Kunden_ID || '')}&id=${encodeURIComponent(beitragId)}`, { method: 'GET', redirect: 'follow' }).then(r => r.json());
      if (res.success) { setBeitraege(prev => prev.filter(item => String(item.id || item.Id || '') !== beitragId)); }
      else { alert('Fehler: ' + (res.error || 'Unbekannt')); }
    } catch { alert('Verbindungsfehler.'); }
    finally { setDeletingId(null); }
  };

  const handleEditSaved = (updated: any) => {
    setBeitraege(prev => prev.map(b => String(b.id || b.Id || '') === String(updated.id || updated.Id || '') ? updated : b));
  };

  const demoTage = (() => {
    if (String(b?.Status || '').trim().toUpperCase() === 'AKTIV') return null;
    const ende = b?.Demo_Ende;
    if (!ende) return null;
    const tage = Math.ceil((new Date(ende).getTime() - Date.now()) / 86400000);
    return tage > 0 ? tage : null;
  })();

  const newsContent = (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, backgroundColor: '#f0f0f0' }}>
      {teamRolle && (
        <div style={{ background: themaFarbe, borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: headerTextFarbe, fontWeight: 700, fontSize: 14 }}>
            {teamRolle === 'admin' ? '👑 Hauptadmin' : teamRolle === 'abtl' ? '🏅 Abteilungsleiter' : `🏀 ${teamMannschaft}`}
          </span>
          <button onClick={handleTeamLogout} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: headerTextFarbe, borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Abmelden</button>
        </div>
      )}

      {demoTage && (
        <div style={{ backgroundColor: akzentFarbe, borderRadius: 10, padding: '12px 16px', marginBottom: 12, textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 15 }}>
          ⏱ Demo läuft noch {demoTage} Tage
        </div>
      )}

      {/* ── NEU v21: Ergebnisse Widget ── */}
      {kundenId && (
        <ErgebnisseWidget
          kundenId={clubId}
          themaFarbe={themaFarbe}
          akzentFarbe={akzentFarbe}
          headerTextFarbe={headerTextFarbe}
          cardHintergrund={cardHintergrund}
          cardRahmen={cardRahmen}
          onAlleAnzeigen={() => setZeigeSpielplan(true)}
        />
      )}
      {/* ── Ende Ergebnisse Widget ── */}

      {sichtbareKategorien.length > 0 && (
        <CategoriesComponent categories={sichtbareKategorien} selectedCategory={activeKategorie} onSelect={setActiveKategorie} themaFarbe={themaFarbe} />
      )}

      {canPost && !showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: 14, borderRadius: 10, backgroundColor: themaFarbe, border: 'none', color: headerTextFarbe, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
            ⊕ NEUEN BEITRAG ERSTELLEN
          </button>
          {isAdmin && (
            <button onClick={() => setShowSponsorForm(true)} style={{ width: '100%', padding: 12, borderRadius: 10, backgroundColor: 'white', border: `2px solid ${themaFarbe}`, color: themaFarbe, fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>
              🤝 SPONSOR EINRICHTEN
            </button>
          )}
        </div>
      )}

      {canPost && showForm && (
        <div style={{ background: cardHintergrund, borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${cardRahmen}` }}>
          <h3 style={{ marginTop: 0, color: themaFarbe }}>📝 Neuer Beitrag</h3>
          <input placeholder="Titel" value={titel} onChange={(e: any) => setTitel(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: `1px solid ${cardRahmen}`, boxSizing: 'border-box' as const, color: '#111' }} />
          <textarea placeholder="Text" value={text} onChange={(e: any) => setText(e.target.value)} rows={4}
            style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: `1px solid ${cardRahmen}`, boxSizing: 'border-box' as const, color: '#111' }} />
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input placeholder="Bild URL — Imgur oder Google Drive Link" value={bildUrl} onChange={(e: any) => setBildUrl(e.target.value)}
              style={{ width: '100%', padding: 10, paddingRight: 44, borderRadius: 8, border: `1px solid ${cardRahmen}`, boxSizing: 'border-box' as const, color: '#111' }} />
            <button onClick={() => setShowBildInfo(true)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', border: `2px solid ${cardRahmen}`, background: 'white', color: '#888', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</button>
          </div>
          <BildUploadButton onUploaded={(url) => setBildUrl(url)} akzentFarbe={akzentFarbe} cardRahmen={cardRahmen} />
          <input placeholder="▶ YouTube URL (optional)" value={videoUrl} onChange={(e: any) => setVideoUrl(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: `1px solid ${cardRahmen}`, boxSizing: 'border-box' as const, color: '#111' }} />
          {isTeam && teamMannschaft ? (
            <div style={{ padding: '10px 12px', marginBottom: 12, borderRadius: 8, border: `1px solid ${cardRahmen}`, background: '#f0f0f0', color: '#555', fontSize: 14 }}>
              Kategorie: <strong>{teamMannschaft}</strong>
            </div>
          ) : (
            <select value={kategorie || kategorienFinal[0]} onChange={(e: any) => setKategorie(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: `1px solid ${cardRahmen}`, color: '#111' }}>
              {kategorienFinal.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          )}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: `1px solid ${cardRahmen}`, backgroundColor: 'white', cursor: 'pointer', color: '#111' }}>Abbrechen</button>
            <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', backgroundColor: akzentFarbe, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? 'Speichern...' : 'Veröffentlichen'}
            </button>
          </div>
        </div>
      )}

      {gefilterteBeitraege.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', marginTop: 32 }}>{activeKategorie ? `Keine Beiträge in "${activeKategorie}".` : 'Noch keine Beiträge.'}</p>
      ) : (
        gefilterteBeitraege.map((beitrag, i) => {
          const embedUrl = getYouTubeEmbedUrl(beitrag.Video_URL || beitrag.videoUrl || beitrag.youtubeUrl || '');
          const bId = String(beitrag.id || beitrag.Id || '');
          const isDeleting = deletingId === bId;
          const darfLoeschen = canDelete(beitrag);
          const weiterlesenLink = beitrag.Weiterlesen_Link || beitrag.weiterlesen_link || '';

          return (
            <div key={bId || i} style={{ background: cardHintergrund, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: `1px solid ${cardRahmen}`, position: 'relative' }}>
              {darfLoeschen && (
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 1 }}>
                  <button onClick={() => setEditBeitrag(beitrag)} title="Beitrag bearbeiten"
                    style={{ background: akzentFarbe, color: 'white', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 13, cursor: 'pointer', fontWeight: 'bold' }}>✏️</button>
                  <button onClick={() => handleDelete(beitrag)} disabled={isDeleting} title="Beitrag löschen"
                    style={{ background: isDeleting ? '#ccc' : '#ff4444', color: 'white', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 13, cursor: isDeleting ? 'default' : 'pointer', fontWeight: 'bold' }}>
                    {isDeleting ? '...' : '🗑️'}
                  </button>
                </div>
              )}
              {beitrag.Bild_URL && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 8, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={optimizeImageUrl(beitrag.Bild_URL)} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ background: tagFarbe, color: tagTextFarbe, borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>{beitrag.Kategorie}</span>
                <span style={{ fontSize: 12, color: '#999' }}>{beitrag.Datum}</span>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 24, lineHeight: 1.25, color: '#222', paddingRight: darfLoeschen ? 90 : 0 }}>{beitrag.Titel}</h3>
              <p style={{ margin: 0, color: '#555', fontSize: 16, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{beitrag.Text}</p>
              {weiterlesenLink && (
                <a href={weiterlesenLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', marginTop: 14, padding: '12px 16px', backgroundColor: akzentFarbe, color: 'white', borderRadius: 10, textAlign: 'center' as const, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                  🔗 Weiterlesen →
                </a>
              )}
              {embedUrl && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
                  <iframe src={embedUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={beitrag.Titel} />
                </div>
              )}
              <SocialBar b={b} />
              {kundenId && <SponsorBanner kundenId={kundenId} />}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {showBildInfo && <InfoPopup onClose={() => setShowBildInfo(false)} akzentFarbe={akzentFarbe} />}
      {showSponsorForm && <SponsorPopup kundenId={kundenId} themaFarbe={themaFarbe} akzentFarbe={akzentFarbe} onClose={() => setShowSponsorForm(false)} />}
      {editBeitrag && (
        <EditPopup beitrag={editBeitrag} akzentFarbe={akzentFarbe} cardRahmen={cardRahmen} kundenId={kundenId} onClose={() => setEditBeitrag(null)} onSaved={handleEditSaved} />
      )}

      <AppHeader title={b?.Verein_Name || 'Sport App'} logoUrl={logoUrl} sponsorLogoUrl={sponsorLogoUrl} themaFarbe={themaFarbe} onRefresh={reload} loading={loading} onAdminClick={onAdminClick} />

      {newsContent}

      {/* ── NEU v21: Spielplan Vollansicht ── */}
      {zeigeSpielplan && (
        <SpielplanVollansicht
          kundenId={clubId}
          themaFarbe={themaFarbe}
          akzentFarbe={akzentFarbe}
          headerTextFarbe={headerTextFarbe}
          cardHintergrund={cardHintergrund}
          cardRahmen={cardRahmen}
          onZurueck={() => setZeigeSpielplan(false)}
        />
      )}
      {/* ── Ende Spielplan Vollansicht ── */}

      <div style={{ background: themaFarbe, padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' as const, flexShrink: 0 }}>
        <a href="https://app.onlang.de/nutzungsbedingungen" target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none', fontWeight: 500 }}>
          📋 Nutzungsbedingungen
        </a>
        <a href="https://app.onlang.de/bildverwaltung" target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none', fontWeight: 500 }}>
          📸 Bildverwaltung
        </a>
        <a href="mailto:info@onlang.de"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none', fontWeight: 500 }}>
          ✉️ info@onlang.de
        </a>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>© 2026 ONLANG</span>
      </div>
    </div>
  );
};

export default Tab1;
