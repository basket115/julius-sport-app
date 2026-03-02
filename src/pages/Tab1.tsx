import React, { useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonFooter,
  IonToolbar,
  IonText,
} from '@ionic/react';
import AppHeader from '../components/AppHeader';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

interface Sponsor {
  Logo_URL: string;
  Banner_Text: string;
  Banner_Bild_URL: string;
  Slot: string;
}

interface Tab1Props {
  vereinName?: string;
  logoVerein?: string;
  sponsorLogo?: string;
  sponsorText?: string;
  sponsorBannerBild?: string;
  headlineText?: string;
  themaFarbe?: string;
  sheetId?: string;
  demoEnde?: string;
  sponsoren?: Sponsor[];
  kundenId?: string;
  scriptUrl?: string;

  // ✅ NEU (kommt aus App.tsx)
  readOnly?: boolean;
  isAdmin?: boolean;
}

const Tab1: React.FC<Tab1Props> = ({
  vereinName,
  logoVerein,
  sponsorLogo,
  sponsorText,
  sponsorBannerBild,
  headlineText,
  themaFarbe,
  sheetId,
  demoEnde,
  sponsoren = [],
  kundenId,
  scriptUrl,

  // ✅ NEU
  readOnly = false,
  isAdmin = true,
}) => {
  useEffect(() => {
    if (themaFarbe) {
      document.documentElement.style.setProperty('--ion-color-primary', themaFarbe);
      document.documentElement.style.setProperty('--ion-color-primary-shade', themaFarbe);
    }
  }, [themaFarbe]);

  return (
    <IonPage>
      <AppHeader
        title={vereinName || 'Sport App'}
        logoUrl={logoVerein}
        sponsorLogoUrl={sponsorLogo}
        onRefresh={() => window.location.reload()}
      />

      <IonContent fullscreen>
        {headlineText && (
          <div style={{
            background: themaFarbe || '#1a3a6b',
            color: 'white',
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.95rem',
            textAlign: 'center',
          }}>
            {headlineText}
          </div>
        )}

        <ExploreContainer
          name="News Feed"
          sheetId={sheetId}
          themaFarbe={themaFarbe}
          sponsoren={sponsoren}
          demoEnde={demoEnde}
          kundenId={kundenId}
          scriptUrl={scriptUrl}

          // ✅ NEU: Rechte an ExploreContainer
          readOnly={readOnly}
          isAdmin={isAdmin}
        />
      </IonContent>

      {sponsorText && (
        <IonFooter>
          <IonToolbar style={{ '--background': themaFarbe || '#1a3a6b', textAlign: 'center' }}>
            <IonText style={{ fontSize: '0.78rem', color: 'white', padding: '4px 16px', display: 'block' }}>
              {sponsorText}
            </IonText>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default Tab1;