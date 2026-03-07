// src/utils/errorLogger.ts

const API_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxWR_Bb-sLLQNVpzg4PT7HNDiMI6BjMfZkbl_pU05gf5wamqBGNmNOrJ4ftf-TcXaKVwA/exec";

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
