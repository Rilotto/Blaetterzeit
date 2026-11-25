// Automatischer Zuschnitt auf das Seitenverhältnis des Buches (REQ-109).
import { mittigZuschneiden } from '@/bild/bildverarbeitung';
import { verhaeltnisGleich } from '@/bild/mittigerAusschnitt';
import { BILDBEREICHE, type Bildbereich, type ImageStore } from '@/storage/ImageStore';
import { seitenverhaeltnis, type MassQuelle } from './masse';

/**
 * Online-Cover übernehmen (REQ-109, AK-1/AK-2): schneidet ein Coverfoto aus einer Online-Quelle
 * (Barcode-Scan REQ-062, „Online suchen“ REQ-111) einmal mittig auf das Cover-Seitenverhältnis zu, das
 * sich aus den Angaben des Treffers ergibt (Maße, sonst Format und Standardmaße nach REQ-077).
 * Bei einem Fehler bleibt das Bild unverändert.
 */
export async function onlineCoverZuschneiden(cover: string, angaben: MassQuelle = {}): Promise<string> {
  return mittigZuschneiden(cover, seitenverhaeltnis('cover', angaben)).catch((fehler: unknown) => {
    console.warn('Cover konnte nicht zugeschnitten werden:', fehler);
    return cover;
  });
}

/** Bereiche, deren maßgebliches Seitenverhältnis sich von `alt` zu `neu` ändert (REQ-109, AK-4/AK-5). */
export function geaenderteBereiche(alt: MassQuelle, neu: MassQuelle): Bildbereich[] {
  return BILDBEREICHE.filter((b) => !verhaeltnisGleich(seitenverhaeltnis(b, alt), seitenverhaeltnis(b, neu)));
}

/**
 * Nach einer gesicherten Änderung von Format, Maßen oder Seitenzahl (REQ-109, AK-4 bis AK-6): schneidet die
 * gespeicherten Bilder der betroffenen Bereiche mittig auf das neue Seitenverhältnis zu und speichert sie
 * anstelle der bisherigen (nur über die ImageStore-Schnittstelle, ADR-0002). Liefert die neu gespeicherten Bilder.
 */
export async function bilderNeuZuschneiden(
  speicher: ImageStore,
  buchId: string,
  alt: MassQuelle,
  neu: MassQuelle,
): Promise<Partial<Record<Bildbereich, string>>> {
  const ergebnis: Partial<Record<Bildbereich, string>> = {};
  for (const bereich of geaenderteBereiche(alt, neu)) {
    const bild = await speicher.get(buchId, bereich);
    if (!bild) continue;
    const zugeschnitten = await mittigZuschneiden(bild, seitenverhaeltnis(bereich, neu)).catch(() => bild);
    if (zugeschnitten === bild) continue;
    await speicher.put(buchId, bereich, zugeschnitten);
    ergebnis[bereich] = zugeschnitten;
  }
  return ergebnis;
}
