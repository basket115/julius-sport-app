// src/utils/errorLogger.ts

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbyUP8wHkErf7a20HJemThwY4Vq0xjQiCskpXDWwqysG2y3BCKMulLTRZ7-Fs0LbFoBacg/exec";

export async function logError(params: {
  app: string;
  kunde: string;
  message: string;
  stack?: string;
}) {
  try {
    await fetch(API_EXEC_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'log_error',
        app: params.app,
        kunde: params.kunde,
        url: window.location.href,
        message: params.message,
        stack: params.stack || '',
        userAgent: navigator.userAgent,
      }),
    });
  } catch (err) {
    // Fehler beim Loggen still ignorieren
    console.error('Error logging failed:', err);
  }
}
