// src/pages/Tab1.tsx v27 — Mit ONLANG TV Integration
import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import CategoriesComponent from '../components/CategoriesComponent';
import { OnlangTV } from '../components/OnlangTV';
import { BrandingContext, fixGoogleDriveUrl } from '../App';

const API_EXEC_URL = "/api/proxy";

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
    const res = await fetch(`/api/proxy?action=get_sponsors&kundenId=${encodeURIComponent(kundenId)}`, { redirect: 'follow' });
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
function optimizeImageUrl(url: string, format: 'app' | 'website' | 'instagram' | 'facebook' | 'thumb' = 'app'): string {
  if (!url) return url;
  if (url.includes('cloudinary.com')) {
    const clean = url.replace(/\/upload\/[^\/]+\//, '/upload/');
    const transforms: Record<string, string> = {
      app:       'q_auto,f_auto',
      website:   'c_fill,w_1200,h_675,g_auto,q_auto,f_auto',
      instagram: 'c_fill,w_1080,h_1080,g_auto,q_auto,f_auto',
      facebook:  'c_fill,w_1200,h_630,g_auto,q_auto,f_auto',
      thumb:     'c_fill,w_400,h_400,g_auto,q_auto,f_auto',
    };
    return clean.replace('/upload/', `/upload/${transforms[format]}/`);
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
// ERGEBNISSE & SPIELPLAN TYPEN & HELPER
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

function formatMatchDatum(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatUhrzeit(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

// ============================================================
// ERGEBNISSE WIDGET (Startseite)
// ============================================================
const ErgebnisseWidget: React.FC<{
  kundenId: string;
  clubId: string;
  themaFarbe: string;
  akzentFarbe: string;
  headerTextFarbe: string;
  cardHintergrund: string;
  cardRahmen: string;
  onAlleAnzeigen: () => void;
}> = ({ kundenId, clubId, themaFarbe, akzentFarbe, cardHintergrund, cardRahmen, onAlleAnzeigen }) => {
  const [gespielt, setGespielt]   = useState<Match[]>([]);
  const [anstehend, setAnstehend] = useState<Match[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fehler, setFehler]       = useState('');

  useEffect(() => {
    if (!kundenId) return;
    setLoading(true);
    const jetzt = new Date();
    Promise.all([
      fetch(`${API_EXEC_URL}?action=get_matches&kundenId=${kundenId}&scope=played&limit=3`, { redirect: 'follow' }).then(r => r.json()),
      fetch(`${API_EXEC_URL}?action=get_matches&kundenId=${kundenId}&scope=upcoming&limit=10`, { redirect: 'follow' }).then(r => r.json()),
    ]).then(([dG, dA]) => {
      if (dG.success)  setGespielt(dG.items || []);
      if (dA.success) {
        const echteZukunft = (dA.items || []).filter((m: Match) => {
          const kickoff = new Date(m.kickoff_at);
          return kickoff > jetzt;
        }).slice(0, 2);
        setAnstehend(echteZukunft);
      }
      if (!dG.success && !dA.success) setFehler('Spielplandaten nicht verfügbar');
    }).catch(() => setFehler('Verbindungsfehler'))
      .finally(() => setLoading(false));
  }, [kundenId]);

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
          {gespielt.map(m => <MatchKarteKlein key={m.match_uid} match={m} kundenId={clubId} themaFarbe={themaFarbe} akzentFarbe={akzentFarbe} cardHintergrund={cardHintergrund} cardRahmen={cardRahmen} gespielt={true} />)}
        </div>
      )}

      {!loading && anstehend.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase' as const, marginBottom: 6 }}>Nächste Spiele</div>
          {anstehend.map(m => <MatchKarteKlein key={m.match_uid} match={m} kundenId={clubId} themaFarbe={themaFarbe} akzentFarbe={akzentFarbe} cardHintergrund={cardHintergrund} cardRahmen={cardRahmen} gespielt={false} />)}
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
  const heimIstEigen   = match.home_club_id === kundenId;
  const eigenePunkte   = heimIstEigen ? match.home_points : match.away_points;
  const gegnerPunkte   = heimIstEigen ? match.away_points : match.home_points;
  const gewonnen       = gespielt && eigenePunkte > gegnerPunkte;
  const unentschieden  = gespielt && eigenePunkte === gegnerPunkte;
  const statusFarbe    = !gespielt ? akzentFarbe : gewonnen ? '#22a85a' : unentschieden ? '#888' : '#e53935';
  const statusText     = !gespielt ? formatUhrzeit(match.kickoff_at) : gewonnen ? 'Sieg' : unentschieden ? 'Unentschieden' : 'Niederlage';

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
          <div style={{ fontSize: 13, fontWeight: !heimIstEigen ? 800 : 500, color: !heimIstEigen ? themaFarbe : '#333', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
            {match.away_name}
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
      </div>
    </div>
  );
};

// ============================================================
// HAUPTKOMPONENTE TAB1
// ============================================================
export default function Tab1({ onOpenSpielplan }: { onOpenSpielplan?: () => void }) {
  const { branding, kundenId } = useContext(BrandingContext);

  const [beitraege, setBeitraege] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedKategorie, setSelectedKategorie] = useState<string>('Alle');

  const [editingBeitrag, setEditingBeitrag] = useState<any | null>(null);
  const [showInfoPopup, setShowInfoPopup]   = useState(false);
  const [showSponsorPopup, setShowSponsorPopup] = useState(false);

  const themaFarbe       = branding?.Thema_Farbe || '#1A2E4A';
  const akzentFarbe      = branding?.Akzent_Farbe || '#FD5E00';
  const headerTextFarbe  = branding?.Header_Text_Farbe || '#ffffff';
  const cardHintergrund  = branding?.Card_Hintergrund || '#ffffff';
  const cardRahmen       = branding?.Card_Rahmen || '#e2e8f0';
  const clubId           = branding?.Club_ID || '1154';

  const fetchBeitraege = useCallback(async () => {
    if (!kundenId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_EXEC_URL}?action=get_beitraege&kundenId=${encodeURIComponent(kundenId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.beitraege)) {
        setBeitraege(data.beitraege);
      } else {
        setBeitraege([]);
      }
    } catch (e) {
      console.error('Fehler beim Laden der Beiträge:', e);
      setBeitraege([]);
    } finally {
      setLoading(false);
    }
  }, [kundenId]);

  useEffect(() => {
    fetchBeitraege();
  }, [fetchBeitraege]);

  const gefilterteBeitraege = useMemo(() => {
    if (selectedKategorie === 'Alle') return beitraege;
    return beitraege.filter(b => String(b.Kategorie || '').trim().toLowerCase() === selectedKategorie.toLowerCase());
  }, [beitraege, selectedKategorie]);

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Header */}
      <AppHeader />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 12px' }}>
        
        {/* Social Links & Sponsoren Steuerung */}
        <SocialBar b={branding} />

        <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 16 }}>
          <button onClick={() => setShowSponsorPopup(true)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardRahmen}`, background: 'white', fontSize: 12, fontWeight: 600, color: '#444', cursor: 'pointer' }}>
            🤝 Sponsor verwalten
          </button>
          <button onClick={() => setShowInfoPopup(true)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardRahmen}`, background: 'white', fontSize: 12, fontWeight: 600, color: '#444', cursor: 'pointer' }}>
            📸 Bild-Upload Info
          </button>
        </div>

        {/* Ergebnisse & Spielplan Widget */}
        <ErgebnisseWidget
          kundenId={kundenId}
          clubId={clubId}
          themaFarbe={themaFarbe}
          akzentFarbe={akzentFarbe}
          headerTextFarbe={headerTextFarbe}
          cardHintergrund={cardHintergrund}
          cardRahmen={cardRahmen}
          onAlleAnzeigen={() => onOpenSpielplan && onOpenSpielplan()}
        />

        {/* ============================================================ */}
        {/* ONLANG TV INTEGRATION                                        */}
        {/* ============================================================ */}
        <div style={{ marginBottom: 24 }}>
          <OnlangTV kundenId={kundenId} branding={branding} />
        </div>

        {/* Kategorien Filter */}
        <CategoriesComponent
          selectedCategory={selectedKategorie}
          onSelectCategory={(cat) => setSelectedKategorie(cat)}
        />

        {/* Beiträge Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            ⏳ Beiträge werden geladen...
          </div>
        ) : gefilterteBeitraege.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888', background: cardHintergrund, borderRadius: 12, border: `1px solid ${cardRahmen}` }}>
            Noch keine Beiträge.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            {gefilterteBeitraege.map((b, idx) => {
              const ytEmbed = getYouTubeEmbedUrl(b.Video_URL || b.videoUrl);
              const bildUrl = optimizeImageUrl(b.Bild_URL || b.bildUrl, 'app');

              return (
                <div key={b.id || idx} style={{ background: cardHintergrund, borderRadius: 14, border: `1px solid ${cardRahmen}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {ytEmbed ? (
                    <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%', background: '#000' }}>
                      <iframe src={ytEmbed} title={b.Titel} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                    </div>
                  ) : bildUrl ? (
                    <img src={bildUrl} alt={b.Titel} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />
                  ) : null}

                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: akzentFarbe, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        {b.Kategorie || 'Allgemein'}
                      </span>
                      <button onClick={() => setEditingBeitrag(b)} style={{ background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', color: '#888' }}>
                        ✏️ Bearbeiten
                      </button>
                    </div>

                    <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.3 }}>
                      {b.Titel}
                    </h3>

                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#444', whiteSpace: 'pre-wrap' }}>
                      {b.Text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sponsor Banner ganz unten */}
        <SponsorBanner kundenId={kundenId} />

      </div>

      {/* Popups */}
      {showInfoPopup && <InfoPopup onClose={() => setShowInfoPopup(false)} akzentFarbe={akzentFarbe} />}
      {showSponsorPopup && <SponsorPopup kundenId={kundenId} themaFarbe={themaFarbe} akzentFarbe={akzentFarbe} onClose={() => setShowSponsorPopup(false)} />}
      {editingBeitrag && (
        <EditPopup
          beitrag={editingBeitrag}
          akzentFarbe={akzentFarbe}
          cardRahmen={cardRahmen}
          kundenId={kundenId}
          onClose={() => setEditingBeitrag(null)}
          onSaved={() => fetchBeitraege()}
        />
      )}
    </div>
  );
}
