// src/utils/remoteConfig.ts

export type Branding = {
  Kunden_ID: string;
  Verein_Name?: string;
  Logo_verein?: string;
  Logo_Sponsor?: string;
  Thema_Farbe?: string;
  Status?: string;
 Demo_Ende?: string;
  Kategorien?: string[];
};

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbzyZN60q75nNVhqHWZBV6gbX6IEa7Zu1KmZkhttxPIzJmXjb3v03xLcOW5T3PxicqT8EA/exec";

export async function fetchBranding(kundenId: string): Promise<Branding | null> {
  try {
    const url = `${API_EXEC_URL}?action=get_branding&kundenId=${encodeURIComponent(kundenId)}`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.branding as Branding;
  } catch (err) {
    console.error("❌ Fetch Fehler:", err);
    return null;
  }
}
