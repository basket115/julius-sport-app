// src/utils/feed.ts

export type FeedKind = "news" | "result" | "training" | "unknown";

export type ApiResponse = {
  ok: boolean;
  count: number;
  rows: any[];
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
};

// ✅ API-URL
const FEED_URL = "https://script.google.com/macros/s/AKfycbxS0swicXVh5ZCS9A4AX48ZTkdgIWg7LjncuWT1-QM2p4Z8QW0xW6Rb4R5FFj33vNmyDw/exec";

function cleanStr(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function cleanNum(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseDate(input: unknown): Date | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return new Date(input);
  if (typeof input === "string") {
    const d = new Date(input.trim());
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function toKind(row: any): FeedKind {
  const raw = String(row?.kind || row?.type || "").toLowerCase();
  if (raw.includes("result") || raw.includes("ergebnis")) return "result";
  if (raw.includes("training")) return "training";
  return "news";
}

function normalizeRow(row: any): FeedRow {
  const date = parseDate(row?.date);
  return {
    id: cleanStr(row?.id) ?? "ohne-id",
    kind: toKind(row),
    title: cleanStr(row?.title),
    text: cleanStr(row?.text),
    image: cleanStr(row?.heroImageUrl) || cleanStr(row?.image),
    linkUrl: cleanStr(row?.linkUrl),
    linkLabel: cleanStr(row?.linkLabel),
    date,
    dateLabel: date ? new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date) : undefined,
    home: cleanStr(row?.home),
    away: cleanStr(row?.away),
    homeScore: cleanNum(row?.homeScore),
    awayScore: cleanNum(row?.awayScore)
  };
}

export async function fetchFeed(): Promise<FeedRow[]> {
  try {
    const res = await fetch(FEED_URL, {
      method: "GET",
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as ApiResponse;
    if (!data?.ok) throw new Error("API Fehler");
    return data.rows.map(normalizeRow);
  } catch (e) {
    console.error("Fetch error:", e);
    throw new Error("Fehler beim Laden der Daten.");
  }
}