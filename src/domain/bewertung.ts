/**
 * Bewertung und Rezension eines Buches (REQ-044 bis REQ-049). Keine Abhängigkeit zu UI oder Speicher.
 * Einzige Stelle, an der Kriterien, ihre Reihenfolge und ihre Stufentexte festgelegt werden.
 */
import type { Buch } from './buch';

/** Bewertungswert: nur ganze Zahlen von 1 bis 5 (REQ-045, AK-5). */
export type BewertungsWert = 1 | 2 | 3 | 4 | 5;

export const istBewertungsWert = (wert: unknown): wert is BewertungsWert =>
  typeof wert === 'number' && Number.isInteger(wert) && wert >= 1 && wert <= 5;

/** Die 14 Bewertungskriterien in fester Reihenfolge, „Sterne“ zuerst (REQ-044) mit Stufentexten 1–5 (REQ-048). */
export const KRITERIEN = [
  { id: 'sterne', name: 'Sterne', stufen: ['Nichts für mich', 'War okay', 'Hat mir gefallen', 'Absolut spitze', 'Ich habe es geliebt'] },
  { id: 'tempo', name: 'Tempo', stufen: ['Zäh wie Kaugummi', 'Eher gemächlich', 'Angenehmes Tempo', 'Flott unterwegs', 'Rasant, kaum Luft geholt'] },
  { id: 'weltenbau', name: 'Weltenbau', stufen: ['Kaum vorhanden', 'Eher blass', 'Solide Welt', 'Lebendig und durchdacht', 'Sehr detailreich wie im Film'] },
  { id: 'spice', name: 'Spice', stufen: ['Ganz zahm', 'Ein Hauch Würze', 'Wird warm', 'Ziemlich heiß', 'Feuerscharf'] },
  { id: 'spannung', name: 'Spannung', stufen: ['Kein Nervenkitzel', 'Leicht spannend', 'Hat mich gepackt', 'Stand unter Strom', 'Konnte nicht aufhören'] },
  { id: 'action', name: 'Action', stufen: ['Ganz ruhig', 'Wenig los', 'Ordentlich Action', 'Viel Krawall', 'Explosiv'] },
  { id: 'hauptfiguren', name: 'Hauptfiguren', stufen: ['Nichts für mich', 'Ganz okay', 'Mochte ich', 'Ans Herz gewachsen', 'Neue Lieblinge'] },
  {
    id: 'nebenfiguren',
    name: 'Nebenfiguren',
    stufen: ['Blass geblieben', 'Ganz okay', 'Gut besetzt', 'Echte Bereicherung', 'Vollständige Charaktere mit Hintergrund'],
  },
  { id: 'plotTwist', name: 'Plot Twist', stufen: ['Sah ich kommen', 'Kleine Überraschung', 'Gut versteckt', 'Hat mich erwischt', 'Komplett umgehauen'] },
  { id: 'traenen', name: 'Tränen', stufen: ['Trockene Augen', 'Kurz geschluckt', 'Feuchte Augen', 'Taschentuch gebraucht', 'Hemmungslos geweint'] },
  { id: 'romantik', name: 'Romantik', stufen: ['Kaum Romantik', 'Ein zartes Knistern', 'Schön romantisch', 'Herzklopfen pur', 'Hoffnungslos verliebt'] },
  { id: 'humor', name: 'Humor', stufen: ['Kaum gelacht', 'Mal geschmunzelt', 'Oft gelacht', 'Sehr witzig', 'Bauchweh vor Lachen'] },
  { id: 'grusel', name: 'Grusel', stufen: ['Gar nicht gruselig', 'Leichtes Kribbeln', 'Gänsehaut', 'Licht angelassen', 'Albtraumstoff'] },
  { id: 'dialoge', name: 'Dialoge', stufen: ['Hölzern', 'Etwas steif', 'Natürlich', 'Schlagfertig', 'Hätte ich gern selbst gesagt'] },
] as const satisfies readonly { id: string; name: string; stufen: readonly [string, string, string, string, string] }[];

export type KriteriumId = (typeof KRITERIEN)[number]['id'];

/** Bewertungen eines Buches je Kriterium; ein fehlender Eintrag bedeutet „keine Bewertung“. */
export type Bewertungen = Partial<Record<KriteriumId, BewertungsWert>>;

export const istKriteriumId = (wert: unknown): wert is KriteriumId => KRITERIEN.some((k) => k.id === wert);

/** Stufentext eines Kriteriums für Wert n; ohne Bewertung kein Text (REQ-048, AK-4). */
export function stufentext(kriterium: KriteriumId, wert: BewertungsWert | undefined): string | undefined {
  if (wert === undefined) return undefined;
  return KRITERIEN.find((k) => k.id === kriterium)?.stufen[wert - 1];
}

/** Bereinigt gespeicherte Bewertungen: nur bekannte Kriterien mit Werten 1–5; leer → undefined. */
export function bewertungenAusDaten(daten: unknown): Bewertungen | undefined {
  if (!daten || typeof daten !== 'object') return undefined;
  const ergebnis: Bewertungen = {};
  for (const [k, w] of Object.entries(daten as Record<string, unknown>)) {
    if (istKriteriumId(k) && istBewertungsWert(w)) ergebnis[k] = w;
  }
  return Object.keys(ergebnis).length > 0 ? ergebnis : undefined;
}

/**
 * Antippen des n-ten Symbols (REQ-045): setzt den Wert n; entspricht n dem aktuellen Wert, wird die
 * Bewertung des Kriteriums zurückgesetzt. Andere Kriterien bleiben unverändert. Liefert ein neues Buch.
 */
export function bewertungAntippen(buch: Buch, kriterium: KriteriumId, n: number): Buch {
  if (!istBewertungsWert(n)) throw new Error('Bewertung nur ganzzahlig von 1 bis 5');
  const neu: Bewertungen = { ...buch.bewertungen };
  if (neu[kriterium] === n) delete neu[kriterium];
  else neu[kriterium] = n;
  const ergebnis: Buch = { ...buch };
  if (Object.keys(neu).length > 0) ergebnis.bewertungen = neu;
  else delete ergebnis.bewertungen;
  return ergebnis;
}

/** Ein Rezensionstext gilt als leer, wenn er nur aus Leerraum besteht (REQ-049, AK-8). */
export const rezensionLeer = (text: string): boolean => text.trim() === '';

/**
 * Sichert eine Rezension (REQ-049): Text ungekürzt und unverändert, ohne Längenbegrenzung.
 * Leerer Text → null (nichts wird gespeichert).
 */
export function rezensionSichern(buch: Buch, text: string): Buch | null {
  if (rezensionLeer(text)) return null;
  return { ...buch, rezension: text };
}
