import React, { useState } from 'react';
import { IonApp, IonAlert, IonLoading } from '@ionic/react';
import Tab1 from './pages/Tab1';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

const ADMIN_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzXELr3JQkbS7FUzau5zktFLsJjKRonTQu6d_n4YgA4vDe4qQR7hCWLctbuAGskvP3z3g/exec';

interface KundenConfig {
  kundenId: string;
  vereinName: string;
  sheetId: string;
  logoVerein: string;
  logoSponsor: string;
  headlineText: string;
  sponsorBannerText: string;
  sponsorBannerBild: string;
  themaFarbe: string;
  status: string;
  demoEnde: string;

  // ✅ NEU: aus Kunden_Master.ReadOnly
  readOnly: boolean;
}

interface Sponsor {
  Logo_URL: string;
  Banner_Text: string;
  Banner_Bild_URL: string;
  Slot: string;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<KundenConfig | null>(null);
  const [sponsoren, setSponsoren] = useState<Sponsor[]>([]);
  const [showLogin, setShowLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (password: string) => {
    if (!password) return;
    setLoading(true);

    try {
      const url = `${ADMIN_SCRIPT_URL}?password=${encodeURIComponent(password)}`;
      const res = await fetch(url);
      const data = await res.json();
      
     

      if (data.success && data.kunde) {
        const k = data.kunde;

       // ✅ ReadOnly direkt vom Backend verwenden
const readOnly = data.readOnly === true;

        setConfig({
          kundenId: k.Kunden_ID,
          vereinName: k.Verein_Name,
          sheetId: k.Sheet_ID,
          logoVerein: k.Logo_Verein,
          logoSponsor: k.Logo_Sponsor,
          headlineText: k.Headline_Text,
          sponsorBannerText: k.Sponsor_Banner_Text,
          sponsorBannerBild: k.Sponsorn_Banner_Bild,
          themaFarbe: k.Thema_Farbe || '#1a3a6b',
          status: k.Status,
          demoEnde: k.Demo_Ende,

          // ✅ NEU
          readOnly,
        });

        setSponsoren(data.sponsoren || []);
        setIsLoggedIn(true);
        setShowLogin(false);
      } else {
        if (data.error === 'Demo abgelaufen') {
          setErrorMsg('⏰ Deine Demo-Lizenz ist abgelaufen. Bitte kontaktiere uns.');
        } else if (data.error === 'Demo deaktiviert') {
          setErrorMsg('🚫 Dieser Zugang wurde deaktiviert.');
        } else {
          setErrorMsg('❌ Passwort ungültig. Bitte versuche es erneut.');
        }
      }
    } catch (err) {
      setErrorMsg('🌐 Verbindungsfehler. Bitte prüfe deine Internetverbindung.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Admin-Flag zentral (Demo = readOnly = true)
  const isAdmin = !!config && config.readOnly === false;

  return (
    <IonApp>
      <IonAlert
        isOpen={showLogin && !isLoggedIn}
        header="Vereins-Login"
        subHeader="Bitte gib dein Vereinspasswort ein"
        inputs={[{ name: 'password', type: 'password', placeholder: 'Passwort' }]}
        buttons={[
          {
            text: 'Anmelden',
            handler: (d) => {
              handleLogin(d.password);
              return false;
            },
          },
        ]}
        backdropDismiss={false}
      />

      <IonAlert
        isOpen={!!errorMsg}
        header="Hinweis"
        message={errorMsg}
        buttons={[
          {
            text: 'OK',
            handler: () => {
              setErrorMsg('');
              setShowLogin(true);
            },
          },
        ]}
      />

      <IonLoading isOpen={loading} message="Lade Vereinsdaten..." />

      {isLoggedIn && config && (
        <Tab1
          vereinName={config.vereinName}
          logoVerein={config.logoVerein}
          sponsorLogo={config.logoSponsor}
          sponsorText={config.sponsorBannerText}
          sponsorBannerBild={config.sponsorBannerBild}
          headlineText={config.headlineText}
          themaFarbe={config.themaFarbe}
          sheetId={config.sheetId}
          demoEnde={config.demoEnde}
          sponsoren={sponsoren}
          kundenId={config.kundenId}
          scriptUrl={ADMIN_SCRIPT_URL}

          // ✅ NEU: Rechte nach unten durchreichen
          readOnly={config.readOnly}
          isAdmin={isAdmin}
        />
      )}
    </IonApp>
  );
};

export default App;