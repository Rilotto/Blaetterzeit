// Netzzugriff der ISBN-Suche (REQ-062, ADR-0003). Nur gezielte GET-Anfragen, kein globaler Patch von fetch.
//  - Android-APK: CapacitorHttp (natives HTTP, kein CORS).
//  - Web: fetch (DNB-Abfragen können hier an CORS scheitern).
import { Capacitor, CapacitorHttp } from '@capacitor/core';

export interface HttpAntwort {
  status: number;
  text: string;
}

export interface HttpClient {
  /** GET mit Textantwort. Schlägt bei fehlender Verbindung fehl. */
  text(url: string): Promise<HttpAntwort>;
  /** GET eines Bildes als Data-URL; `null` bei Fehlerstatus oder fehlendem Bild. */
  bild(url: string): Promise<string | null>;
}

const kopf = (headers: Record<string, string> | undefined, name: string): string | undefined => {
  if (!headers) return undefined;
  const k = Object.keys(headers).find((h) => h.toLowerCase() === name);
  return k ? headers[k] : undefined;
};

/** Natives HTTP über CapacitorHttp. */
export function nativerHttpClient(): HttpClient {
  return {
    async text(url) {
      const r = await CapacitorHttp.get({ url, responseType: 'text' });
      return { status: r.status, text: typeof r.data === 'string' ? r.data : JSON.stringify(r.data) };
    },
    async bild(url) {
      const r = await CapacitorHttp.get({ url, responseType: 'blob' });
      if (r.status < 200 || r.status >= 300 || typeof r.data !== 'string' || r.data === '') return null;
      const typ = kopf(r.headers, 'content-type')?.split(';')[0]?.trim() ?? 'image/jpeg';
      if (!typ.startsWith('image/')) return null;
      return `data:${typ};base64,${r.data}`;
    },
  };
}

/** Web-Rückfall über fetch. */
export function webHttpClient(): HttpClient {
  return {
    async text(url) {
      const r = await fetch(url);
      return { status: r.status, text: await r.text() };
    },
    async bild(url) {
      const r = await fetch(url);
      if (!r.ok) return null;
      const blob = await r.blob();
      if (!blob.type.startsWith('image/') || blob.size === 0) return null;
      return await new Promise<string>((ok, fehler) => {
        const leser = new FileReader();
        leser.onload = () => ok(String(leser.result));
        leser.onerror = () => fehler(leser.error);
        leser.readAsDataURL(blob);
      });
    },
  };
}

export const standardHttpClient = (): HttpClient =>
  Capacitor.isNativePlatform() ? nativerHttpClient() : webHttpClient();
