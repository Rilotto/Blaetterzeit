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
  /** Startet Kamera und Erkennung. Schlägt fehl, wenn der Kamerazugriff verweigert wird oder keine Kamera da ist. */
  starten(optionen: ScanOptionen): Promise<void>;
  /** Schaltet das Licht der Kamera ein bzw. aus. */
  lichtSetzen(an: boolean): Promise<void>;
  /** Beendet Kamera und Erkennung; mehrfacher Aufruf ist erlaubt. */
  beenden(): Promise<void>;
}

/** Android: ML Kit, gebündeltes Modell (keine Play-Dienste-Pflicht). */
export function nativerBarcodeScanner(): BarcodeScanner {
  let entfernen: (() => Promise<void>) | null = null;
  let laeuft = false;
  const plugin = () => import('@capacitor-mlkit/barcode-scanning');
  return {
    async starten({ beiIsbn }) {
      const { BarcodeScanner: MlKit, BarcodeFormat } = await plugin();
      const { camera } = await MlKit.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') throw new Error('Kamerazugriff verweigert');
      const h = await MlKit.addListener('barcodesScanned', (e) => {
        const isbn = isbnAusBarcodes(e.barcodes.map((b) => b.rawValue ?? ''));
        if (isbn) beiIsbn(isbn);
      });
      entfernen = () => h.remove();
      document.documentElement.setAttribute(BARCODE_AKTIV_ATTRIBUT, '');
      try {
        await MlKit.startScan({ formats: [BarcodeFormat.Ean13] });
        laeuft = true;
      } catch (fehler) {
        document.documentElement.removeAttribute(BARCODE_AKTIV_ATTRIBUT);
        await entfernen();
        entfernen = null;
        throw fehler;
      }
    },
    async lichtSetzen(an) {
      const { BarcodeScanner: MlKit } = await plugin();
      if (an) await MlKit.enableTorch();
      else await MlKit.disableTorch();
    },
    async beenden() {
      document.documentElement.removeAttribute(BARCODE_AKTIV_ATTRIBUT);
      const e = entfernen;
      entfernen = null;
      await e?.().catch(() => undefined);
      if (!laeuft) return;
      laeuft = false;
      const { BarcodeScanner: MlKit } = await plugin();
      await MlKit.stopScan().catch(() => undefined);
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
