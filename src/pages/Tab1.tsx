// src/pages/Tab1.tsx

import React, { useContext, useState, useEffect, useMemo } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AppHeader from '../components/AppHeader';
import { BrandingContext } from '../App';

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbzyZN60q75nNVhqHWZBV6gbX6IEa7Zu1KmZkhttxPIzJmXjb3v03xLcOW5T3PxicqT8EA/exec";

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

  // ✅ FIX: Kategorien als Array ODER String unterstützen
  const kategorienFinal: string[] = useMemo(() => {
    const kat = b?.Kategorien;

    // Apps Script gibt Array zurück → direkt nutzen
    if (Array.isArray(kat) && kat.length) return kat;

    // Fallback: kommagetrenner String
    if (typeof kat === 'string' && kat.trim()) {
      return kat.split(',').map((k: string) => k.trim()).filter(Boolean);
    }

    // Letzter Fallback wenn Sheet leer
    return ['News', 'Spiel', 'Training', 'Sonstiges'];
  }, [b?.Kategorien]);

  useEffect(() => {
    if (branding?.Kunden_ID) ladeBeitraege();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branding]);

  // ✅ Standard-Kategorie setzen (erste Kategorie aus kategorienFinal)
  useEffect(() => {
    if (!kategorie && kategorienFinal.length) {
      setKategorie(kategorienFinal[0]);
      return;
    }
    if (kategorie === 'News' && kategorienFinal[0] !== 'News') {
      setKategorie(kategorienFinal[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategorienFinal.join('|')]);

  const ladeBeitraege = async () => {
    try {
      const res = await fetch(
        `${API_EXEC_URL}?action=get_beitraege&kundenId=${branding?.Kunden_ID}`
      );
      const data = await res.json();
      if (data.success) setBeitraege(data.beitraege || []);
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <IonPage>
      <AppHeader
        title={b?.Verein_Name || 'Sport App'}
        logoUrl={logoUrl}
        sponsorLogoUrl={sponsorLogoUrl}
        themaFarbe={themaFarbe}
        onRefresh={reload}
        loading={loading}
      />
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          {demoTage && (
            <div
              style={{
                backgroundColor: '#f0a500',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 12,
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white',
                fontSize: 15,
              }}
            >
              ⏱ Demo läuft noch {demoTage} Tage
            </div>
          )}

          {isAdmin && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 10,
                backgroundColor: themaFarbe,
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              ⊕ NEUEN BEITRAG ERSTELLEN
            </button>
          )}

          {isAdmin && showForm && (
            <div
              style={{
                background: '#f9f9f9',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: '1px solid #ddd',
              }}
            >
              <h3 style={{ marginTop: 0 }}>📝 Neuer Beitrag</h3>

              <input
                placeholder="Titel"
                value={titel}
                onChange={(e: any) => setTitel(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />

              <textarea
                placeholder="Text"
                value={text}
                onChange={(e: any) => setText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />

              <input
                placeholder="Bild URL (optional)"
                value={bildUrl}
                onChange={(e: any) => setBildUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />

              {/* ✅ Dropdown pro Verein – aus Sheet */}
              <select
                value={kategorie || kategorienFinal[0]}
                onChange={(e: any) => setKategorie(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 12,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                }}
              >
                {kategorienFinal.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>

              {success && <p style={{ color: 'green' }}>{success}</p>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: 12,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: themaFarbe,
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
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
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {b.Bild_URL && (
                  <img
                    src={b.Bild_URL}
                    alt=""
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                )}
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                  {b.Kategorie} • {b.Datum}
                </div>
                <h3 style={{ margin: '0 0 8px 0' }}>{b.Titel}</h3>
                <p style={{ margin: 0, color: '#555' }}>{b.Text}</p>
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
