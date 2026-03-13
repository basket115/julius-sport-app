// src/utils/feed.ts

export type FeedKind = 'news' | 'result' | 'training';

export type FeedRow = {
  id: string;
  kundenId?: string;
  kind: FeedKind;
  title?: string;
  text?: string;
  image?: string;
  dateLabel?: string;
  category?: string;
  deleted?: boolean;

  home?: string;
  away?: string;
  homeScore?: string;
  awayScore?: string;
  teams?: string;
  competition?: string;
  venue?: string;

  linkUrl?: string;
  linkLabel?: string;
  videoUrl?: string;

  webUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
};

const API_BASE =
  'https://script.google.com/macros/s/AKfycbyUP8wHkErf7a20HJemThwY4Vq0xjQiCskpXDWwqysG2y3BCKMulLTRZ7-Fs0LbFoBacg/exec';

// TG Neuss
const KUNDEN_ID = 'V004';

function normalizeKind(value?: string): FeedKind {
  const v = String(value || '').toLowerCase().trim();

  if (v === 'result' || v === 'ergebnis') return 'result';
  if (v === 'training') return 'training';
  return 'news';
}

function isDeleted(value: unknown): boolean {
  return String(value || '').trim().toUpperCase() === 'JA';
}

function toText(value: unknown): string {
  return String(value || '').trim();
}

function mapRow(item: any): FeedRow {
  const kind = normalizeKind(item.type);

  return {
    id: toText(item.id || item.ID) || crypto.randomUUID(),
    kundenId: toText(item.Kunden_ID || item.KundenID || item.kundenId),
    kind,
    title: toText(item.Titel || item.title),
    text: toText(item.Text || item.Inhalt || item.text),
    image: toText(item.Bild_URL || item.image),
    dateLabel: toText(item.Datum || item.Erstellt_Am || item.date),
    category: toText(item.Kategorie || item.category),
    deleted: isDeleted(item.Gelöscht),

    home: toText(item.Heim || item.home),
    away: toText(item.Gast || item.away),
    homeScore: toText(item.Heim_Punkte || item.homeScore),
    awayScore: toText(item.Gast_Punkte || item.awayScore),
    teams: toText(item.teams),
    competition: toText(item.Wettbewerb || item.competition),
    venue: toText(item.Ort || item.venue),

    linkUrl: toText(item.Link_URL || item.linkUrl || item.Video_URL),
    linkLabel: toText(item.Link_Label || item.linkLabel),
    videoUrl: toText(item.Video_URL || item.videoUrl),

    webUrl: toText(item.Web_URL || item.webUrl),
    facebookUrl: toText(item.Facebook_URL || item.facebookUrl),
    instagramUrl: toText(item.Instagram_URL || item.instagramUrl),
    youtubeUrl: toText(item.YouTube_URL || item.youtubeUrl || item.Video_URL),
    tiktokUrl: toText(item.TikTok_URL || item.tiktokUrl),
  };
}

function sortNewestFirst(items: FeedRow[]): FeedRow[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.dateLabel || '').getTime();
    const bTime = new Date(b.dateLabel || '').getTime();
    return bTime - aTime;
  });
}

export async function loadFeed(): Promise<FeedRow[]> {
  const url = new URL(API_BASE);
  url.searchParams.set('action', 'get_beitraege');
  url.searchParams.set('kundenId', KUNDEN_ID);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Fehler ${response.status}`);
  }

  const json = await response.json();

  if (!json?.success) {
    throw new Error(json?.error || 'API Fehler');
  }

  const rows = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json?.rows)
    ? json.rows
    : Array.isArray(json?.qh?.rows)
    ? json.qh.rows
    : [];

  const mapped = rows
    .map(mapRow)
    .filter((item: FeedRow) => !item.deleted)
    .filter((item: FeedRow) => {
      if (!item.kundenId) return true;
      return item.kundenId === KUNDEN_ID;
    });

  return sortNewestFirst(mapped);
}
