// Barcode-Scanner (REQ-061) hinter einer Schnittstelle, damit Tests ihn durch einen Fake ersetzen können.
//  - Android-APK: @capacitor-mlkit/barcode-scanning mit eigener Oberfläche (startScan). Das Kamerabild liegt
//    HINTER der WebView; solange es läuft, steht `data-barcode-aktiv` an <html> (index.css).
//  - Web/Prototyp: getUserMedia + BarcodeDetector (falls vorhanden). Ohne Kamera schlägt `starten` fehl.
import { Capacitor } from '@capacitor/core';
import { isbnAusBarcodes } from './isbn';

/** Attribut an <html>, solange der native Scanner hinter der WebView läuft. */
export const BARCODE_AKTIV_ATTRIBUT = 'data-barcode-aktiv';

export interface ScanOptionen {
  /** Vorschau-Element für den Web-Rückfall; nativ ungenutzt. */
  video: HTMLVideoElement | null;
  /** Wird mit der normalisierten ISBN aufgerufen, sobald ein ISBN-Barcode erkannt wurde (ggf. mehrfach). */
  beiIsbn: (isbn: string) => void;
}

export interface BarcodeScanner {
  /**
   * true: Das Kamerabild zeichnet die Plattform selbst HINTER der WebView (Android, ML Kit). Der Scan-Bildschirm
   * darf dann kein <video> zeigen – die Android-WebView malt in ein leeres <video> ihr undurchsichtiges
   * Standard-Vorschaubild und verdeckt damit die Kamera.
   */
  readonly vorschauNativ?: boolean;
  /** Startet Kamera und Erkennung. Schlägt fehl, wenn der Kamerazugriff verweigert wird oder keine Kamera da ist. */
  starten(optionen: ScanOptionen): Promise<void>;
  /** Schaltet das Licht der Kamera ein bzw. aus. */
  lichtSetzen(an: boolean): Promise<void>;
  /** Beendet Kamera und Erkennung; mehrfacher Aufruf ist erlaubt. */
  beenden(): Promise<void>;
}

/** Lesbare Meldung aus einem Fehler des Plugins (Capacitor liefert teils Objekte mit `message`/`code`). */
export function fehlerText(fehler: unknown): string {
  if (fehler instanceof Error && fehler.message) return fehler.message;
  if (typeof fehler === 'string' && fehler) return fehler;
  if (fehler && typeof fehler === 'object') {
    const f = fehler as { message?: unknown; code?: unknown };
    const teile = [f.code, f.message].filter((t) => typeof t === 'string' && t);
    if (teile.length) return teile.join(': ');
    try {
      return JSON.stringify(fehler);
    } catch {
      // fällt unten durch
    }
  }
  return 'Unbekannter Fehler';
}

/** Android: ML Kit, gebündeltes Modell (keine Play-Dienste-Pflicht). */
export function nativerBarcodeScanner(): BarcodeScanner {
  // Starten und Beenden laufen strikt nacheinander (ML Kit kennt nur eine Kamera-Sitzung). `lauf` zählt jeden
  // Start und jedes Beenden; ein noch laufender Start erkennt daran, dass er inzwischen abgebrochen wurde.
  let kette: Promise<unknown> = Promise.resolve();
  const inReihe = <T>(f: () => Promise<T>): Promise<T> => {
    const p = kette.then(f, f);
    kette = p.catch(() => undefined);
    return p;
  };
  let lauf = 0;
  let entfernen: (() => Promise<void>) | null = null;
  let kameraAn = false;
  const plugin = () => import('@capacitor-mlkit/barcode-scanning');

  const aufraeumen = async () => {
    document.documentElement.removeAttribute(BARCODE_AKTIV_ATTRIBUT);
    const e = entfernen;
    entfernen = null;
    await e?.().catch(() => undefined);
    if (!kameraAn) return;
    kameraAn = false;
    const { BarcodeScanner: MlKit } = await plugin();
    await MlKit.stopScan().catch(() => undefined);
  };

  return {
    vorschauNativ: true,
    starten({ beiIsbn }) {
      const meinLauf = ++lauf;
      const abgebrochen = () => meinLauf !== lauf;
      return inReihe(async () => {
        if (abgebrochen()) return;
        const { BarcodeScanner: MlKit, BarcodeFormat } = await plugin();

        const { supported } = await MlKit.isSupported();
        if (!supported) throw new Error('Keine Kamera gefunden (ML Kit: nicht unterstützt)');

        let { camera } = await MlKit.checkPermissions();
        if (camera !== 'granted' && camera !== 'limited') ({ camera } = await MlKit.requestPermissions());
        if (camera !== 'granted' && camera !== 'limited') throw new Error(`Kamerazugriff verweigert (${camera})`);

        // Eine noch laufende Cover-Kamera (REQ-016, camera-preview) hält die Kamera fest – vorher freigeben.
        const { kameraFreigeben } = await import('@/bild/kamera');
        await kameraFreigeben();
        if (abgebrochen()) return;

        const h = await MlKit.addListener('barcodesScanned', (e) => {
          if (abgebrochen()) return;
          const isbn = isbnAusBarcodes(e.barcodes.map((b) => b.rawValue ?? ''));
          if (isbn) beiIsbn(isbn);
        });
        entfernen = () => h.remove();
        if (abgebrochen()) return; // aufgeräumt wird vom wartenden `beenden`
        document.documentElement.setAttribute(BARCODE_AKTIV_ATTRIBUT, '');
        try {
          await MlKit.startScan({ formats: [BarcodeFormat.Ean13] });
          kameraAn = true;
        } catch (fehler) {
          await aufraeumen();
          throw new Error(`Kamera startet nicht: ${fehlerText(fehler)}`);
        }
      });
    },
    async lichtSetzen(an) {
      const { BarcodeScanner: MlKit } = await plugin();
      if (an) await MlKit.enableTorch();
      else await MlKit.disableTorch();
    },
    beenden() {
      lauf++;
      // Oberfläche sofort wieder undurchsichtig; Kamera und Listener nach einem evtl. laufenden Start.
      document.documentElement.removeAttribute(BARCODE_AKTIV_ATTRIBUT);
      return inReihe(aufraeumen);
    },
  };
}

interface Erkennung {
  rawValue: string;
}
interface BarcodeDetectorArt {
  new (o: { formats: string[] }): { detect(quelle: HTMLVideoElement): Promise<Erkennung[]> };
}

/** Web: Vorschau über getUserMedia, Erkennung über BarcodeDetector, sofern der Browser ihn kennt. */
export function webBarcodeScanner(): BarcodeScanner {
  let strom: MediaStream | null = null;
  let takt: ReturnType<typeof setInterval> | undefined;
  return {
    async starten({ video, beiIsbn }) {
      if (!video || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Keine Kamera-Schnittstelle');
      }
      strom = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      video.srcObject = strom;
      await video.play().catch(() => undefined);
      const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorArt }).BarcodeDetector;
      if (!Detector) return;
      const detector = new Detector({ formats: ['ean_13'] });
      let beschaeftigt = false;
      takt = setInterval(() => {
        if (beschaeftigt || video.readyState < 2) return;
        beschaeftigt = true;
        void detector
          .detect(video)
          .then((treffer) => {
            const isbn = isbnAusBarcodes(treffer.map((t) => t.rawValue));
            if (isbn) beiIsbn(isbn);
          })
          .catch(() => undefined)
          .finally(() => {
            beschaeftigt = false;
          });
      }, 300);
    },
    async lichtSetzen(an) {
      const spur = strom?.getVideoTracks()[0];
      await spur?.applyConstraints({ advanced: [{ torch: an } as MediaTrackConstraintSet] }).catch(() => undefined);
    },
    async beenden() {
      if (takt !== undefined) clearInterval(takt);
      takt = undefined;
      strom?.getTracks().forEach((t) => t.stop());
      strom = null;
    },
  };
}

/** Scanner der Plattform. */
export const standardBarcodeScanner = (): BarcodeScanner =>
  Capacitor.isNativePlatform() ? nativerBarcodeScanner() : webBarcodeScanner();
