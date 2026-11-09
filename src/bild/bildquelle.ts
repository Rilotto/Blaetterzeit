// Bildquellen für die Buchdetails (REQ-016).
import { Capacitor } from '@capacitor/core';
import { bildBegrenzen } from './bildverarbeitung';

/**
 * Liefert ein Bild als Data-URL oder `null`, wenn der Nutzer abbricht oder der Zugriff
 * nicht möglich bzw. verweigert ist. In Tests ersetzbar.
 */
export interface Bildquelle {
  /** Foto mit der Kamera aufnehmen (Standard: Kameraansicht der App, REQ-016). */
  scannen(): Promise<string | null>;
  /** Bild aus der Galerie des Smartphones auswählen. */
  galerie(): Promise<string | null>;
}

function dateiLesen(datei: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leser = new FileReader();
    leser.onload = () => resolve(String(leser.result));
    leser.onerror = () => reject(leser.error ?? new Error('Datei lässt sich nicht lesen'));
    leser.readAsDataURL(datei);
  });
}

/** Android: System-Fotoauswahl (Photo Picker) über @capacitor/camera, keine Berechtigung nötig. */
async function galerieGeraet(): Promise<string | null> {
  const { Camera, MediaTypeSelection } = await import('@capacitor/camera');
  try {
    const { results } = await Camera.chooseFromGallery({
      mediaType: MediaTypeSelection.Photo,
      allowMultipleSelection: false,
      correctOrientation: true,
    });
    const pfad = results[0]?.webPath ?? (results[0]?.uri ? Capacitor.convertFileSrc(results[0].uri) : undefined);
    if (!pfad) return null;
    const antwort = await fetch(pfad);
    return await dateiLesen(await antwort.blob());
  } catch {
    // Abbruch durch den Nutzer oder kein Zugriff: nichts verändern (REQ-016, AK-4/AK-6).
    return null;
  }
}

/** Web/Prototyp: Dateiauswahl des Browsers. */
function galerieWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const eingabe = document.createElement('input');
    eingabe.type = 'file';
    eingabe.accept = 'image/*';
    eingabe.style.display = 'none';
    let erledigt = false;
    const ende = (wert: string | null) => {
      if (erledigt) return;
      erledigt = true;
      eingabe.remove();
      resolve(wert);
    };
    eingabe.addEventListener('change', () => {
      const datei = eingabe.files?.[0];
      if (!datei) return ende(null);
      dateiLesen(datei).then(ende, () => ende(null));
    });
    eingabe.addEventListener('cancel', () => ende(null));
    document.body.appendChild(eingabe);
    eingabe.click();
  });
}

/**
 * Standard-Bildquelle der App. Die Kamera ist ein Fenster der App (REQ-016): `kameraAnzeigen`
 * zeigt die Kameraansicht und liefert das dort aufgenommene Foto bzw. `null` (Zurück).
 * Bilder werden auf höchstens 2000 px begrenzt.
 */
export function standardBildquelle(kameraAnzeigen: () => Promise<string | null>): Bildquelle {
  const begrenzt = async (bild: string | null) => (bild === null ? null : bildBegrenzen(bild).catch(() => bild));
  return {
    scannen: async () => begrenzt(await kameraAnzeigen()),
    galerie: async () => begrenzt(Capacitor.isNativePlatform() ? await galerieGeraet() : await galerieWeb()),
  };
}
