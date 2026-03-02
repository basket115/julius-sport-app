import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonButton, IonIcon, IonSpinner,
} from '@ionic/react';
import { addCircleOutline, chevronUpOutline } from 'ionicons/icons';
import './ExploreContainer.css';

interface Sponsor {
  Logo_URL: string;
  Banner_Text: string;
  Banner_Bild_URL: string;
  Slot: string;
}

interface Beitrag {
  Kunden_ID: string;
  Titel: string;
  Text: string;
  Bild_URL: string;
  Datum: string;
  Kategorie: string;
  Erstellt_Am: string;
}

interface ContainerProps {
  name: string;
  sheetId?: string;
  themaFarbe?: string;
  sponsoren?: Sponsor[];
  demoEnde?: string;
  kundenId?: string;
  scriptUrl?: string;

  // ✅ NEU: Rechte (Demo/Admin)
  readOnly?: boolean;
  isAdmin?: boolean;
}

const KATEGORIEN = ['Spiel', 'Erfolg', 'Info', 'Training', 'Veranstaltung', 'News', 'Sonstiges'];

// ✅ NUR DATUM (de-DE) formatieren
function formatDEDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value; // falls String kein Datum ist
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

// ============ ALL STYLES AS CONSTANTS ============
const s: Record<string, React.CSSProperties> = {
  wrapper:       { padding: '8px' },
  mb12:          { marginBottom: 12 },
  label:         { fontSize: '0.8rem', fontWeight: 700, color: '#555' },
  flex1:         { flex: 1 },
  formRow:       { display: 'flex', gap: 8, marginBottom: 12 },
  input:         { width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '8px', marginTop: 4, fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea:      { width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '8px', marginTop: 4, fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  loading:       { textAlign: 'center', padding: 20 },
  empty:         { padding: 20, color: '#aaa', fontSize: '0.9rem', textAlign: 'center' },
  card:          { borderRadius: 12, marginBottom: 12 },
  cardPadding:   { paddingBottom: 4 },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:     { fontSize: '1rem', fontWeight: 700 },
  cardText:      { fontSize: '0.9rem', color: '#333' },
  datum:         { fontSize: '0.75rem', color: '#888', marginTop: 4 },
  beitragImg:    { width: '100%', maxHeight: 'none', objectFit: 'unset', borderRadius: '12px 12px 0 0' },
  werbeBox:      { marginTop: 8, marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid #e0e0e0', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' },
  anzeige:       { background: '#f5f5f5', padding: '2px 10px', fontSize: '0.6rem', color: '#bbb', letterSpacing: '1px', textAlign: 'right' },
  werbeInner:    { display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 10 },
  bannerImg:     { height: 80, width: 80, objectFit: 'cover', borderRadius: 8 },
  logoSponsor:   { height: 50, width: 50, objectFit: 'contain', borderRadius: 8, background: '#f5f5f5', padding: 4 },
  werbeRechts:   { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  logoKlein:     { height: 20, objectFit: 'contain' },
  werbeText:     { fontSize: '0.78rem', color: '#333', margin: 0, lineHeight: 1.3, overflow: 'hidden', maxHeight: '2.6rem' },
  // ✅ optionaler Hinweis
  demoHint:      { marginTop: 8, marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#f5f5f5', color: '#666', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' },
};

const getDemoBanner = (bg: string): React.CSSProperties => ({
  background: bg, color: 'white', padding: '10px 16px', borderRadius: 8,
  marginBottom: 12, fontSize: '0.85rem', fontWeight: 700, textAlign: 'center',
});

const getFormBorder = (color: string): React.CSSProperties => ({
  borderRadius: 12, marginBottom: 16, border: `2px solid ${color}`, background: 'white', padding: 16,
});

const getBtnStyle = (color: string): React.CSSProperties => ({
  '--background': color,
  '--color': 'white',
  marginBottom: 12,
} as React.CSSProperties);

const getBadgeStyle = (color: string): React.CSSProperties => ({
  background: color, fontSize: '0.7rem',
});

const getWerbeLink = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', background: color,
  color: 'white', padding: '4px 10px', borderRadius: 6,
  fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', marginTop: 2,
});
// =================================================

const ExploreContainer: React.FC<ContainerProps> = ({
  themaFarbe = '#1a3a6b',
  sponsoren = [],
  demoEnde,
  kundenId,
  scriptUrl,

  // ✅ NEU
  readOnly = true,
  isAdmin = false,
}) => {
  const [beitraege, setBeitraege] = useState<Beitrag[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Form-States bleiben bestehen, werden aber bei Demo nie gerendert
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titel: '',
    text: '',
    bildUrl: '',
    datum: new Date().toLocaleDateString('de-DE'),
    kategorie: 'Info',
  });

  const demoRestTage = demoEnde
    ? Math.ceil((new Date(demoEnde).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => { ladeBeitraege(); }, [kundenId]);

  // ✅ Wenn User Demo ist: ggf. offenes Formular schließen
  useEffect(() => {
    if (!isAdmin || readOnly) setFormOpen(false);
  }, [isAdmin, readOnly]);

  const ladeBeitraege = async () => {
    if (!scriptUrl || !kundenId) return;
    setLoading(true);
    try {
      const res = await fetch(`${scriptUrl}?action=get_beitraege&kundenId=${kundenId}`);
      const data = await res.json();
      if (data.success) setBeitraege(data.beitraege || []);
    } catch (err) {
      console.error('Feed-Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // ✅ Extra Sicherheit: Frontend blockt auch (Backend blockt sowieso)
    if (!isAdmin || readOnly) {
      return;
    }

    if (!form.titel || !form.text) { alert('Titel und Text sind Pflichtfelder!'); return; }
    if (!scriptUrl || !kundenId) { alert('Fehlende Konfiguration.'); return; }

    setSaving(true);
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'add_beitrag', kundenId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ titel: '', text: '', bildUrl: '', datum: new Date().toLocaleDateString('de-DE'), kategorie: 'Info' });
        setFormOpen(false);
        await ladeBeitraege();
      } else {
        alert(data?.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const werbeSlot = sponsoren.length > 0 ? sponsoren[0] : null;

  const canEdit = isAdmin && !readOnly;

  return (
    <div style={s.wrapper}>

      {demoRestTage !== null && demoRestTage <= 14 && (
        <div style={getDemoBanner(demoRestTage <= 3 ? '#ff4444' : '#ff9800')}>
          {demoRestTage <= 0
            ? '⚠️ Demo abgelaufen'
            : `⏰ Demo läuft noch ${demoRestTage} Tag${demoRestTage === 1 ? '' : 'e'}`}
        </div>
      )}

     

      {/* ✅ NUR ADMIN: Button + Formular */}
      {canEdit && (
        <>
          <IonButton expand="block" style={getBtnStyle(themaFarbe)} onClick={() => setFormOpen(!formOpen)}>
            <IonIcon icon={formOpen ? chevronUpOutline : addCircleOutline} slot="start" />
            {formOpen ? 'Formular schließen' : 'Neuen Beitrag erstellen'}
          </IonButton>

          {formOpen && (
            <div style={getFormBorder(themaFarbe)}>
              <div style={s.mb12}>
                <label style={s.label}>Titel *</label>
                <input
                  value={form.titel}
                  onChange={(e) => setForm({ ...form, titel: e.target.value })}
                  placeholder="z.B. Heimspiel diesen Samstag"
                  style={s.input}
                />
              </div>

              <div style={s.mb12}>
                <label style={s.label}>Text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Beschreibe den Beitrag..."
                  rows={4}
                  style={s.textarea}
                />
              </div>

              <div style={s.mb12}>
                <label style={s.label}>Bild-URL (optional)</label>
                <input
                  value={form.bildUrl}
                  onChange={(e) => setForm({ ...form, bildUrl: e.target.value })}
                  placeholder="https://i.imgur.com/..."
                  style={s.input}
                />
              </div>

              <div style={s.formRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Datum</label>
                  <input
                    value={form.datum}
                    onChange={(e) => setForm({ ...form, datum: e.target.value })}
                    style={s.input}
                  />
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Kategorie</label>
                  <select
                    value={form.kategorie}
                    onChange={(e) => setForm({ ...form, kategorie: e.target.value })}
                    style={s.input}
                  >
                    {KATEGORIEN.map(k => (<option key={k} value={k}>{k}</option>))}
                  </select>
                </div>
              </div>

              <IonButton expand="block" onClick={handleSubmit} disabled={saving} style={getBtnStyle(themaFarbe)}>
                {saving ? <IonSpinner name="crescent" /> : '✅ Beitrag veröffentlichen'}
              </IonButton>
            </div>
          )}
        </>
      )}

      {/* ✅ Beiträge: IMMER sichtbar */}
      {loading ? (
        <div style={s.loading}><IonSpinner name="crescent" /></div>
      ) : beitraege.length === 0 ? (
        <div style={s.empty}>Noch keine Beiträge.</div>
      ) : (
        beitraege.map((b, idx) => (
          <IonCard key={idx} style={s.card}>
            {b.Bild_URL && <img src={b.Bild_URL} alt={b.Titel} style={s.beitragImg} />}
            <IonCardHeader style={s.cardPadding}>
              <div style={s.cardHeaderRow}>
                <IonCardTitle style={s.cardTitle}>{b.Titel}</IonCardTitle>
                <IonBadge style={getBadgeStyle(themaFarbe)}>{b.Kategorie}</IonBadge>
              </div>
              {/* ✅ nur Datum anzeigen */}
              <div style={s.datum}>{formatDEDate(b.Datum)}</div>
            </IonCardHeader>
            <IonCardContent style={s.cardText}>{b.Text}</IonCardContent>
          </IonCard>
        ))
      )}

      {/* ✅ Sponsor-Fenster/Werbung: IMMER sichtbar */}
      {werbeSlot && (
        <div style={s.werbeBox}>
          <div style={s.anzeige}>ANZEIGE</div>
          <div style={s.werbeInner}>
            {werbeSlot.Banner_Bild_URL ? (
              <img src={werbeSlot.Banner_Bild_URL} alt="Werbung" style={s.bannerImg} />
            ) : werbeSlot.Logo_URL ? (
              <img src={werbeSlot.Logo_URL} alt="Sponsor" style={s.logoSponsor} />
            ) : null}
            <div style={s.werbeRechts}>
              {werbeSlot.Banner_Bild_URL && werbeSlot.Logo_URL && (
                <img src={werbeSlot.Logo_URL} alt="Logo" style={s.logoKlein} />
              )}
              {werbeSlot.Banner_Text && <p style={s.werbeText}>{werbeSlot.Banner_Text}</p>}
              {werbeSlot.Slot && (
                <a href={werbeSlot.Slot} target="_blank" rel="noopener noreferrer" style={getWerbeLink(themaFarbe)}>
                  Mehr erfahren →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExploreContainer;