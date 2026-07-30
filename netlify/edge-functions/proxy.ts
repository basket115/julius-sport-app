import type { Context } from "https://edge.netlify.com";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx7gnTorNAQz21x3vwZOFQl2bkP2t1QKLppcUSQ_-CQywRS-36AZOeqDDMJg3uXVa2ntA/exec";

export default async (request: Request, context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store",
      },
    });
  }

  const incomingUrl = new URL(request.url);
  const queryString = incomingUrl.searchParams.toString();
  const targetUrl = `${SCRIPT_URL}${queryString ? `?${queryString}` : ""}`;

  try {
    const requestHeaders: Record<string, string> = {
      "User-Agent": "Netlify-Edge-Proxy/2.0",
    };

    const contentType = request.headers.get("content-type");
    if (contentType) {
      requestHeaders["Content-Type"] = contentType;
    }

    const options: RequestInit = {
      method: request.method,
      headers: requestHeaders,
      redirect: "follow",
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      options.body = await request.text();
    }

    const response = await fetch(targetUrl, options);
    const responseText = await response.text();

    return new Response(responseText, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Proxy Fehler:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Proxy Fehler",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  }
};

export const config = {
  path: "/api/proxy",
};
