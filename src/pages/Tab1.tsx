// src/pages/Tab1.tsx

import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import { BrandingContext } from '../App';

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxWR_Bb-sLLQNVpzg4PT7HNDiMI6BjMfZkbl_pU05gf5wamqBGNmNOrJ4ftf-TcXaKVwA/exec";

const Tab1: React.FC = () => {
  const { branding, loading, reload } = useContext(BrandingContext);
  const [beitraege, setBeitraege] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [titel, setTitel] = useState('');
  const [text, setText] = useState('');
  const [bildUrl, setBildUrl] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const b = branding as any;
  const isAdmin = !!b?.Passwort;
  const themaFarbe = b?.Thema_Farbe || '#111111';
  const logoUrl = b?.Logo_verein || b?.Logo_Verein || '';
  const sponsorLogoUrl = b?.Logo_Sponsor || b?.Logo_sponsor || '';

  // Social Media Links
  const webUrl = b?.WEB_URL || '';
  const facebookUrl = b?.Facebook_URL || '';
  const instagramUrl = b?.Instagram_URL || b?.Instragram_URL || '';
  const youtubeUrl = b?.Youtube_URL || '';
  const tiktokUrl = b?.TikTok_URL || '';
  const hasSocial = webUrl || facebookUrl || instagramUrl || youtubeUrl || tiktokUrl;

  const kategorienFinal: string[] = useMemo(() => {
    const kat = b?.Kategorien;
    if (Array.isArray(kat) && kat.length) return kat;
    if (typeof kat === 'string' && kat.trim()) {
      return kat.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
    return ['News', 'Spiel', 'Training', 'Sonstiges'];
  }, [b?.Kategorien]);

  const ladeId = (b?.Parent_ID && String(b.Parent_ID).trim()) ? String(b.Parent_ID).trim() : branding?.Kunden_ID;

  const ladeBeitraege = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_EXEC_URL}?action=get_beitraege&kundenId=${ladeId}`
      );
      const data = await res.json();
      if (data.success) setBeitraege(data.beitraege || []);
    } catch (err) {
      console.error(err);
    }
  }, [ladeId]);

  useEffect(() => {
    if (ladeId) ladeBeitraege();
  }, [ladeId, ladeBeitraege]);

  useEffect(() => {
    if (kategorienFinal.length === 0) return;
    setKategorie((prev) => {
      if (!prev) return kategorienFinal[0];
      if (prev === 'News' && kategorienFinal[0] !== 'News') return kategorienFinal[0];
      return prev;
    });
  }, [kategorienFinal]);

  const handleSubmit = async () => {
    if (!titel || !text) return;
    setSaving(true);
    try {
      const response = await fetch(API_EXEC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_beitrag',
          kundenId: branding?.Kunden_ID,
          titel,
          text,
          bildUrl,
          datum: new Date().toLocaleDateString('de-DE'),
          kategorie: kategorie || kategorienFinal[0] || 'News',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('✅ Beitrag gespeichert!');
        setTitel('');
        setText('');
        setBildUrl('');
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
        ladeBeitraege();
      }
    } finally {
      setSaving(false);
    }
  };

  const getDemoTage = () => {
    const ende = b?.Demo_Ende;
    if (!ende) return null;
    const diff = new Date(ende).getTime() - new Date().getTime();
    const tage = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return tage > 0 ? tage : null;
  };
  const demoTage = getDemoTage();

  const SocialBar = () => (
    hasSocial ? (
      <div style={{
        display: 'flex', gap: 14, alignItems: 'center',
        borderTop: '1px solid #f0f0f0', marginTop: 12, paddingTop: 10,
      }}>
        {webUrl && (
          <a href={webUrl} target="_blank" rel="noopener noreferrer" title="Website" style={{ color: '#555', lineHeight: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </a>
        )}
        {facebookUrl && (
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: '#1877f2', lineHeight: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        )}
        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: '#e1306c', lineHeight: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        )}
        {youtubeUrl && (
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: '#ff0000', lineHeight: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
          </a>
        )}
        {tiktokUrl && (
          <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" title="TikTok" style={{ color: '#000', lineHeight: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
            </svg>
          </a>
        )}
      </div>
    ) : null
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader
        title={b?.Verein_Name || 'Sport App'}
        logoUrl={logoUrl}
        sponsorLogoUrl={sponsorLogoUrl}
        themaFarbe={themaFarbe}
        onRefresh={reload}
        loading={loading}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, backgroundColor: '#f0f0f0' }}>
        {demoTage && (
          <div style={{
            backgroundColor: '#f0a500', borderRadius: 10,
            padding: '12px 16px', marginBottom: 12,
            textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 15,
          }}>
            ⏱ Demo läuft noch {demoTage} Tage
          </div>
        )}

        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%', padding: 14, borderRadius: 10,
              backgroundColor: themaFarbe, border: 'none',
              color: 'white', fontWeight: 'bold', fontSize: 16,
              cursor: 'pointer', marginBottom: 16,
            }}
          >
            ⊕ NEUEN BEITRAG ERSTELLEN
          </button>
        )}

        {isAdmin && showForm && (
          <div style={{
            background: '#f9f9f9', borderRadius: 12,
            padding: 16, marginBottom: 20, border: '1px solid #ddd',
          }}>
            <h3 style={{ marginTop: 0 }}>📝 Neuer Beitrag</h3>
            <input
              placeholder="Titel"
              value={titel}
              onChange={(e: any) => setTitel(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Text"
              value={text}
              onChange={(e: any) => setText(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <input
              placeholder="Bild URL (optional)"
              value={bildUrl}
              onChange={(e: any) => setBildUrl(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <select
              value={kategorie || kategorienFinal[0]}
              onChange={(e: any) => setKategorie(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #ccc' }}
            >
              {kategorienFinal.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', backgroundColor: themaFarbe, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {saving ? 'Speichern...' : 'Veröffentlichen'}
              </button>
            </div>
          </div>
        )}

        {beitraege.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', marginTop: 32 }}>
            Noch keine Beiträge. Erstelle deinen ersten!
          </p>
        ) : (
          beitraege.map((b, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {b.Bild_URL && (
                <img src={b.Bild_URL} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
              )}
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                {b.Kategorie} • {b.Datum}
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>{b.Titel}</h3>
              <p style={{ margin: 0, color: '#555' }}>{b.Text}</p>
              <SocialBar />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tab1;
