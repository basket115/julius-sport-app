// src/components/feed/SponsorBanner.tsx
import React, { useEffect, useState } from 'react';

export type SponsorRow = {
  kundenId: string;
  slot?: string;
  logoUrl?: string;
  bannerText?: string;
  bannerBildUrl?: string;
  aktiv: boolean;
};

// Zentrale Apps Script URL (gleiche wie in feed.ts)
const SPONSOR_URL = "https://script.google.com/macros/s/AKfycbwm0nO0XRsJD2gqWTbfZvRHdKTN0ylbJrWkJt66TcCCiBkX8l7aaV2lF5saHEBwwqeUoA/exec";

function cleanStr(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function normalizeSponsor(row: any): SponsorRow {
  // Aktiv-Check: fehlende/leere Spalte → als aktiv behandeln
  const aktivRaw = row?.Aktiv;
  const aktiv =
    aktivRaw === undefined ||
    aktivRaw === null ||
    String(aktivRaw).trim() === ''
      ? true
      : String(aktivRaw).toUpperCase() === 'TRUE';

  return {
    kundenId: cleanStr(row?.Kunden_ID) ?? '',
    slot: cleanStr(row?.Slot),
    logoUrl: cleanStr(row?.Logo_URL),
    bannerText: cleanStr(row?.Banner_Text),
    bannerBildUrl: cleanStr(row?.Banner_Bild_URL),
    aktiv,
  };
}

// Cache damit nicht jedes FeedItem separat fetcht
let sponsorCache: SponsorRow[] | null = null;
let sponsorFetchPromise: Promise<SponsorRow[]> | null = null;

export async function fetchSponsors(kundenId: string): Promise<SponsorRow[]> {
  if (sponsorCache) {
    return sponsorCache.filter(s => s.kundenId === kundenId && s.aktiv);
  }
  if (!sponsorFetchPromise) {
    sponsorFetchPromise = fetch(`${SPONSOR_URL}?sheet=Sponsor_Inhalte`, {
      method: 'GET',
      redirect: 'follow',
    })
      .then(res => res.json())
      .then(data => {
        const rows = (data?.rows || data?.data || []).map(normalizeSponsor);
        sponsorCache = rows;
        return rows;
      })
      .catch(() => {
        sponsorCache = [];
        return [];
      });
  }
  const all = await sponsorFetchPromise;
  return all.filter(s => s.kundenId === kundenId && s.aktiv);
}

// Cache manuell zurücksetzen (z.B. nach Admin-Änderungen)
export function clearSponsorCache() {
  sponsorCache = null;
  sponsorFetchPromise = null;
}

type Props = {
  kundenId: string;
  darkBackground?: boolean;
};

const SponsorBanner: React.FC<Props> = ({ kundenId, darkBackground = true }) => {
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSponsors(kundenId).then(rows => {
      setSponsors(rows);
      setLoaded(true);
    });
  }, [kundenId]);

  if (!loaded || sponsors.length === 0) return null;

  const sponsor = sponsors[0]; // Ersten aktiven Sponsor nehmen

  const borderColor = darkBackground ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)';
  const labelColor = darkBackground ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)';
  const textColor = darkBackground ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.82)';
  const bgColor = darkBackground ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.04)';

  return (
    <div style={{
      marginTop: 14,
      paddingTop: 12,
      borderTop: `1px solid ${borderColor}`,
    }}>
      {/* "Partner" Label */}
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        color: labelColor,
        marginBottom: 8,
      }}>
        Partner
      </div>

      {/* Banner Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: bgColor,
        borderRadius: 14,
        padding: '10px 14px',
        border: `1px solid ${borderColor}`,
      }}>
        {/* Logo */}
        {sponsor.logoUrl && (
          <div style={{
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: 10,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}>
            <img
              src={sponsor.logoUrl}
              alt="Partner Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Banner Bild + Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {sponsor.bannerBildUrl && !sponsor.bannerText && (
            <img
              src={sponsor.bannerBildUrl}
              alt="Partner Banner"
              style={{ width: '100%', maxHeight: 60, objectFit: 'contain', borderRadius: 6 }}
              referrerPolicy="no-referrer"
            />
          )}
          {sponsor.bannerText && (
            <div style={{
              fontSize: 13,
              lineHeight: 1.4,
              color: textColor,
              whiteSpace: 'pre-wrap',
              fontWeight: 500,
            }}>
              {sponsor.bannerText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorBanner;
