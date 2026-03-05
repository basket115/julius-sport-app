import React, { useState, useEffect } from 'react';
import {
  IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonIcon, IonSpinner,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';

// Hier definieren wir, welche Eigenschaften wir von der API erwarten
interface AppHeaderProps {
  title: string;
  logoUrl?: string;
  sponsorLogoUrl?: string;
  themaFarbe?: string;
  onRefresh?: () => void | Promise<void>;
  loading?: boolean;
  kundeId: string; // Wir benötigen die Kunden_ID als Eingabe, um Daten zu laden
}

// Stil-Objekt (bleibt unverändert)
const s: Record<string, React.CSSProperties> = {
  startSlot: { display: 'flex', alignItems: 'center', paddingLeft: 6 },
  logo: { height: 44, width: 44, objectFit: 'contain', borderRadius: 12, background: 'rgba(255,255,255,0.15)' },
  title: { color: 'white', fontWeight: 700, fontSize: '1.1rem' },
  endSlot: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 4 },
  partnerLabel: { fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' },
  sponsorLogo: { height: 28, width: 44, objectFit: 'contain', background: 'white', borderRadius: 4, padding: 2 },
  refreshBtn: { color: 'white' },
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title, logoUrl, sponsorLogoUrl, themaFarbe, onRefresh, loading, kundeId
}) => {
  // State für die geladenen Daten
  const [vereinsData, setVereinsData] = useState<any>(null); // Für die geladenen Daten
  const [error, setError] = useState<string | null>(null); // Fehlerhandling

  // Laden der Daten aus der API
  useEffect(() => {
    const fetchVereinsData = async () => {
      try {
        const response = await fetch(`https://script.google.com/macros/s/XXXXXXXXX/exec?action=config&kunde=${kundeId}`);
        const data = await response.json();
        setVereinsData(data);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
      }
    };

    fetchVereinsData();
  }, [kundeId]); // lade die Daten bei jeder Änderung der Kunden-ID

  // Wenn die Daten noch nicht geladen sind
  if (!vereinsData) {
    return <IonSpinner name="crescent" />;
  }

  return (
    <IonHeader>
      <IonToolbar style={{ '--background': themaFarbe || '#111111' } as React.CSSProperties}>
        <div slot="start" style={s.startSlot}>
          {vereinsData.logo && (
            <img src={vereinsData.logo} alt="Logo" style={s.logo} />
          )}
        </div>
        <IonTitle style={s.title}>{vereinsData.name || title}</IonTitle>
        <IonButtons slot="end">
          {vereinsData.sponsorLogo && (
            <div style={s.endSlot}>
              <span style={s.partnerLabel}>PARTNER</span>
              <img src={vereinsData.sponsorLogo} alt="Sponsor" style={s.sponsorLogo} />
            </div>
          )}
          <IonButton onClick={() => onRefresh?.()} disabled={loading} style={s.refreshBtn}>
            {loading ? <IonSpinner name="crescent" /> : <IonIcon icon={refreshOutline} />}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
