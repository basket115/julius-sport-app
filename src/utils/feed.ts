// src/utils/feed.ts

export type FeedKind = "news" | "result" | "training" | "unknown";

export type ApiResponse = {
  success?: boolean;
  ok?: boolean;
  count?: number;
  rows?: any[];
};

export type FeedRow = {
  id: string;
  kind: FeedKind;
  title?: string;
  text?: string;
  image?: string;
  linkUrl?: string;
  linkLabel?: string;
  dateRaw?: string | number;
  date?: Date | null;
  dateLabel?: string;
  home?: string;
  away?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  teams?: string[];
  competition?: string;
  venue?: string;
  highlights?: string;
  trainingType?: string;
  durationMin?: number | null;
  intensity?: string;

  // Social Media
  webUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
};

const FEED_URL =
  "https://script.google.com/macros/s/AKfycbyUP8wHkErf7a20HJemThwY4Vq0xjQiCskpXDWwqysG2y3BCKMulLTRZ7-Fs0LbFoBacg/exec";

function cleanStr(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function cleanNum(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const DE_DATE = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(d: Date): string {
  return DE_DATE.format(d);
}

export function parseDate(input: unknown): Date | null {
  if (input === null || input === undefined) return null;

  if (typeof input === "number" && Number.isFinite(input)) {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // DD.MM.YYYY oder DD.MM.YY mit optionaler Uhrzeit
    const m = trimmed.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{3,4})(?:\s+(\d{1,2}):(\d{2}))?$/
    );
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      let yyyy = Number(m[3]);
      if (m[3].length === 3 || yyyy < 1000) yyyy = 2000 + yyyy;
      const hh = m[4] ? Number(m[4]) : 0;
      const min = m[5] ? Number(m[5]) : 0;
      const d = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    // ISO-String und alle anderen Formate (z.B. "2026-03-13T23:00:00.000Z")
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function toKind(row: any): FeedKind {
  const raw = String(
    row?.type ?? row?.kind ?? row?.Kategorie ?? row?.category ?? ""
  ).toLowerCase();

  if (raw.includes("result") || raw.includes("ergebnis")) return "result";
  if (raw.includes("training")) return "training";
  if (
    raw.includes("news") ||
    raw.includes("nachricht") ||
    raw.includes("info")
  )
    return "news";

  return "unknown";
}

function parseTeams(raw: any): string[] {
  const s = cleanStr(raw);
  if (!s) return [];
  return s
    .split(/[,\n;|]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeRow(row: any): FeedRow {
  const dateRaw =
    row?.date ??
    row?.Datum ??
    row?.datum ??
    row?.created ??
    row?.timestamp ??
    row?.time;

  const date = parseDate(dateRaw);

  // Datum-Label: erst geparste Date nutzen, dann Fallback auf rohen String
  const dateLabel = (() => {
    if (date) return formatDate(date);
    const raw = cleanStr(row?.Datum ?? row?.date ?? row?.datum);
    if (!raw) return undefined;
    // Nochmal versuchen direkt zu parsen (z.B. ISO-String der parseDate nicht erwischt hat)
    const fallback = new Date(raw);
    if (!isNaN(fallback.getTime())) return formatDate(fallback);
    return raw; // letzter Fallback: rohen String anzeigen
  })();

  return {
    id: cleanStr(row?.id ?? row?.ID) ?? "ohne-id",
    kind: toKind(row),
    title: cleanStr(row?.Titel ?? row?.title ?? row?.headline),
    text: cleanStr(row?.Text ?? row?.text ?? row?.body),
    image: cleanStr(
      row?.Bild_URL ??
        row?.image ??
        row?.heroImageUrl ??
        row?.img ??
        row?.imageUrl
    ),
    linkUrl: cleanStr(row?.linkUrl),
    linkLabel: cleanStr(row?.linkLabel),
    dateRaw,
    date,
    dateLabel,
    home: cleanStr(row?.home),
    away: cleanStr(row?.away),
    homeScore: cleanNum(row?.homeScore),
    awayScore: cleanNum(row?.awayScore),
    teams: parseTeams(row?.teamIds ?? row?.teams ?? row?.Kategorie),
    competition: cleanStr(row?.competition ?? row?.liga),
    venue: cleanStr(row?.venue ?? row?.halle),
    highlights: cleanStr(row?.highlights ?? row?.notes),
    trainingType: cleanStr(row?.trainingType ?? row?.training),
    durationMin: cleanNum(row?.durationMin ?? row?.minutes ?? row?.dauer),
    intensity: cleanStr(row?.intensity ?? row?.level),

    webUrl: cleanStr(row?.WEB_URL),
    facebookUrl: cleanStr(row?.Facebook_URL),
    instagramUrl: cleanStr(row?.Instagram_URL ?? row?.Instragram_URL),
    youtubeUrl: cleanStr(row?.Youtube_URL),
    tiktokUrl: cleanStr(row?.TikTok_URL),
  };
}

export async function fetchFeed(): Promise<FeedRow[]> {
  try {
    const res = await fetch(FEED_URL, {
      method: "GET",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as ApiResponse;
    const rows = Array.isArray(data?.rows) ? data.rows : [];

    if (!data?.success && !data?.ok) {
      throw new Error("API Fehler");
    }

    return rows
      .map(normalizeRow)
      .filter((row) => row.id && row.title)
      .sort((a, b) => {
        const at = a.date ? a.date.getTime() : 0;
        const bt = b.date ? b.date.getTime() : 0;
        return bt - at;
      });
  } catch (e) {
    console.error("Fetch error:", e);
    throw new Error("Fehler beim Laden der Daten.");
  }
}
