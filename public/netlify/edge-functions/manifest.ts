import type { Context } from "https://edge.netlify.com";

const API_URL = "https://script.google.com/macros/s/AKfycbwm0nO0XRsJD2gqWTbfZvRHdKTN0ylbJrWkJt66TcCCiBkX8l7aaV2lF5saHEBwwqeUoA/exec";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  
  // kunde aus Cookie oder Referer holen
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/kundenId=([^;]+)/);
  let kundenId = cookieMatch?.[1] || "";

  // Fallback: aus dem Referer-URL
  if (!kundenId) {
    const referer = request.headers.get("referer") || "";
    const refMatch = new URL(referer || "http://x").searchParams.get("kunde");
    if (refMatch) kundenId = refMatch;
  }

  let name = "ONLANG";
  let logo = "/logo.png";
  let farbe = "#111111";
  let startUrl = "/";

  if (kundenId) {
    try {
      const res = await fetch(`${API_URL}?action=get_branding&kundenId=${kundenId}`);
      const data = await res.json();
      if (data.success && data.branding) {
        const b = data.branding;
        name = b.Verein_Name || "ONLANG";
        logo = b.Logo_Verein || b.Logo_verein || "/logo.png";
        farbe = b.Thema_Farbe || "#111111";
        startUrl = `/?kunde=${kundenId}`;
      }
    } catch (e) {}
  }

  const manifest = {
    short_name: name,
    name: name + " App",
    icons: [
      { src: logo, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: logo, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    start_url: startUrl,
    display: "standalone",
    background_color: farbe,
    theme_color: farbe
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "content-type": "application/manifest+json",
      "cache-control": "no-cache"
    }
  });
};

export const config = { path: "/manifest.json" };
