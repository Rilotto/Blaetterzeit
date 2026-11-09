// Live-Kamera der App (REQ-016). Die Kameraansicht startet und beendet die Sitzung,
// die Standard-Bildquelle nimmt daraus beim Auslösen ein Foto auf.
import { Capacitor } from '@capacitor/core';

/** Attribut an <html>, solange die native Kameravorschau HINTER der WebView läuft (index.css). */
export const KAMERA_AKTIV_ATTRIBUT = 'data-kamera-aktiv';

export interface Kamerasitzung {
  aufnehmen(): Promise<string>;
  beenden(): void;
}

let aktiv: Kamerasitzung | null = null;

/** Läuft die Vorschau als native Ebene hinter der WebView (Android-APK)? */
export const kameraNativ = (): boolean => Capacitor.isNativePlatform();

/** Android: Live-Vorschau hinter der durchsichtigen WebView (@capacitor-community/camera-preview). */
async function starteGeraet(): Promise<Kamerasitzung> {
  const { CameraPreview } = await import('@capacitor-community/camera-preview');
  document.documentElement.setAttribute(KAMERA_AKTIV_ATTRIBUT, '');
  try {
    // Fragt beim ersten Mal die Berechtigung CAMERA an; bei Verweigerung schlägt start() fehl.
    await CameraPreview.start({
      position: 'rear',
      toBack: true,
      disableAudio: true,
      lockAndroidOrientation: true,
      enableZoom: false,
    });
  } catch (fehler) {
    document.documentElement.removeAttribute(KAMERA_AKTIV_ATTRIBUT);
    throw fehler;
  }
  let beendet = false;
  return {
    async aufnehmen() {
      const { value } = await CameraPreview.capture({ quality: 90 });
      return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
    },
    beenden() {
      if (beendet) return;
      beendet = true;
      document.documentElement.removeAttribute(KAMERA_AKTIV_ATTRIBUT);
      void CameraPreview.stop().catch(() => undefined);
    },
  };
}

/** Web: Rückfall über getUserMedia (im Artefakt gesperrt → nicht verfügbar). */
async function starteWeb(video: HTMLVideoElement): Promise<Kamerasitzung> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Keine Kamera-Schnittstelle');
  }
  const strom = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  video.srcObject = strom;
  await video.play().catch(() => undefined);
  return {
    async aufnehmen() {
      const c = document.createElement('canvas');
      c.width = video.videoWidth;
      c.height = video.videoHeight;
      const ctx = c.getContext('2d');
      if (!ctx || !c.width) throw new Error('Kein Kamerabild');
      ctx.drawImage(video, 0, 0);
      return c.toDataURL('image/jpeg', 0.9);
    },
    beenden() {
      strom.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
}

/** Startet die Live-Vorschau. Schlägt fehl, wenn keine Kamera verfügbar oder der Zugriff verweigert ist. */
export async function kameraStarten(video: HTMLVideoElement | null): Promise<Kamerasitzung> {
  kameraBeenden();
  let roh: Kamerasitzung;
  if (kameraNativ()) roh = await starteGeraet();
  else if (video) roh = await starteWeb(video);
  else throw new Error('Kein Videoelement');
  const sitzung: Kamerasitzung = {
    aufnehmen: () => roh.aufnehmen(),
    beenden: () => {
      roh.beenden();
      if (aktiv === sitzung) aktiv = null;
    },
  };
  aktiv = sitzung;
  return sitzung;
}

/** Beendet eine laufende Vorschau (ohne Fehler, wenn keine läuft). */
export function kameraBeenden(): void {
  aktiv?.beenden();
}

/** Nimmt ein Foto aus der laufenden Vorschau auf; `null`, wenn keine läuft oder die Aufnahme scheitert. */
export async function kameraAufnehmen(): Promise<string | null> {
  if (!aktiv) return null;
  try {
    return await aktiv.aufnehmen();
  } catch {
    return null;
  }
}
