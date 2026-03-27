// netlify/functions/manifest.js
// Dynamisches PWA-Manifest basierend auf Domain oder ?kunde= Parameter

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbwm0nO0XRsJD2gqWTbfZvRHdKTN0ylbJrWkJt66TcCCiBkX8l7aaV2lF5saHEBwwqeUoA/exec";

// Domain → Kunden-ID Mapping
const DOMAIN_MAP = {
  'app.tgneuss.onlang.de': 'V044',
  'app.tgneuss-tigers.onlang.de': 'V004',
  'app.bbk.onlang.de': 'V006',
  'app.scorpions-sggierath.de': 'V002',
};

exports.handler = async (event) => {
  try {
    // KundenId aus Query-Parameter oder Domain
    const params = event.queryStringParameters || {};
    const host = event.headers?.host || '';
    const kundenId = params.kunde || DOMAIN_MAP[host] || '';

    if (!kundenId) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          short_name: 'Sport App',
          name: 'Sport App',
          icons: [{ src: '/logo.png', sizes: '192x192', type: 'image/png' }],
          start_url: '/',
          display: 'standalone',
          background_color: '#111111',
          theme_color: '#111111',
        }),
      };
    }

    // Branding aus Google Sheet laden
    const res = await fetch(
      `${API_EXEC_URL}?action=get_branding&kundenId=${kundenId}`
    );
    const data = await res.json();

    if (!data.success) throw new Error('Branding not found');

    const branding = data.branding;
    const vereinName = branding?.Verein_Name || 'Sport App';
    const themaFarbe = branding?.Thema_Farbe || '#111111';
    const logoUrl = branding?.Logo_Verein || branding?.Logo_verein || '/logo.png';

    // Start-URL: Domain-basiert (kein ?kunde= nötig)
    const startUrl = DOMAIN_MAP[host]
      ? '/'
      : `/?kunde=${kundenId}`;

    const manifest = {
      short_name: vereinName,
      name: vereinName + ' App',
      description: `Die offizielle App von ${vereinName}`,
      icons: [
        {
          src: logoUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: logoUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      start_url: startUrl,
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: themaFarbe,
      theme_color: themaFarbe,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(manifest),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Manifest generation failed' }),
    };
  }
};
