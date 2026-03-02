import React from 'react';
import {
  IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonIcon,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';

interface AppHeaderProps {
  title: string;
  logoUrl?: string;
  sponsorLogoUrl?: string;
  themaFarbe?: string;
  onRefresh?: () => void;
}

const s: Record<string, React.CSSProperties> = {
  startSlot: { display: 'flex', alignItems: 'center', paddingLeft: 6 },
  logo: { height: 80, width: 80, objectFit: 'contain', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' },
  title:           { color: 'white', fontWeight: 700, fontSize: '1.1rem' },
  endSlot:         { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 4 },
  partnerLabel:    { fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' },
  sponsorLogo:     { height: 28, width: 44, objectFit: 'contain', background: 'white', borderRadius: 4, padding: 2 },
  refreshBtn:      { color: 'white' },
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title, logoUrl, sponsorLogoUrl, onRefresh,
}) => {
  return (
    <IonHeader>
      <IonToolbar style={{ '--background': 'var(--ion-color-primary)' } as React.CSSProperties}>
        <div slot="start" style={s.startSlot}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={s.logo} />
          ) : (
            <div style={s.logoPlaceholder} />
          )}
        </div>
        <IonTitle style={s.title}>{title}</IonTitle>
        <IonButtons slot="end">
          {sponsorLogoUrl && (
            <div style={s.endSlot}>
              <span style={s.partnerLabel}>PARTNER</span>
              <img src={sponsorLogoUrl} alt="Sponsor" style={s.sponsorLogo} />
            </div>
          )}
          <IonButton onClick={onRefresh} style={s.refreshBtn}>
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;