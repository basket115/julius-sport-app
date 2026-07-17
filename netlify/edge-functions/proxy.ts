import type { Context } from "https://edge.netlify.com";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyUP8wHkErf7a20HJemThwY4Vq0xjQiCskpXDWwqysG2y3BCKMulLTRZ7-Fs0LbFoBacg/exec";

export default async (request: Request, context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-cache",
      },
    });
  }

  const url = new URL(request.url);
  const params = url.searchParams.toString();
  const targetUrl = `${SCRIPT_URL}${params ? "?" + params : ""}`;

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Netlify-Edge-Proxy/1.0",
    };

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: "follow",
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = await request.text();
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    return new Response(data, {
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
        },
      }
    );
  }
};

export const config = {
  path: "/api/proxy",
};
