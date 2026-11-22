// Drehung des 3D-Modells (REQ-075): Quaternion-Trackball mit Schwung, reines TypeScript ohne DOM.
//
// Koordinaten wie in CSS: x nach rechts, y nach unten, z zum Betrachter. Ein Quaternion `[x, y, z, w]`
// wird als `rotate3d(x, y, z, <winkel>rad)` ausgegeben; die Komposition q = d · c entspricht in CSS
// `rotate3d(d) rotate3d(c)` (erst c, dann d). Ziehen dreht um Bildschirmachsen (Weltsystem).

export type Quat = readonly [number, number, number, number];
export type Vek3 = readonly [number, number, number];

export const EINHEIT: Quat = [0, 0, 0, 1];

/** Drehwinkel je gezogenem Pixel (rad/px). Orientierungswert, kein Akzeptanzkriterium. */
export const DREHUNG_JE_PX = 0.01;
/** Zeitfenster für die Schwung-Messung beim Loslassen (ms). */
export const SCHWUNG_FENSTER_MS = 100;
/** Abklingzeit des Schwungs (ms): Winkelgeschwindigkeit fällt je `ABKLINGZEIT_MS` auf 1/e. */
export const ABKLINGZEIT_MS = 600;
/** Unter dieser Winkelgeschwindigkeit (rad/ms) endet der Schwung. */
export const SCHWUNG_MIN = 0.00005;
/** Höchste Winkelgeschwindigkeit nach dem Loslassen (rad/ms), gegen Ausreißer. */
export const SCHWUNG_MAX = 0.03;

export function quatAchseWinkel(achse: Vek3, winkel: number): Quat {
  const l = Math.hypot(achse[0], achse[1], achse[2]);
  if (l === 0 || winkel === 0) return EINHEIT;
  const s = Math.sin(winkel / 2) / l;
  return [achse[0] * s, achse[1] * s, achse[2] * s, Math.cos(winkel / 2)];
}

/** Hamilton-Produkt a · b: erst b, dann a. */
export function quatMal(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function quatNormieren(q: Quat): Quat {
  const l = Math.hypot(q[0], q[1], q[2], q[3]);
  return l === 0 ? EINHEIT : [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}

/** Dreht einen Vektor mit dem Quaternion (gleiche Wirkung wie `rotate3d` in CSS). */
export function quatDrehen(q: Quat, v: Vek3): Vek3 {
  const p = quatMal(quatMal(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]);
  return [p[0], p[1], p[2]];
}

/** Startansicht (CEO-Vorgabe 2026-11-22): gerade, Cover frontal zum Betrachter, ohne Neigung oder Drehung. */
export const START_LAGE: Quat = EINHEIT;

/** Drehung zu einer Ziehbewegung (dx, dy in px): rechts ziehen dreht die Vorderseite nach rechts, unten ziehen nach unten. */
export function ziehDrehung(dx: number, dy: number, jePx = DREHUNG_JE_PX): Quat {
  return quatAchseWinkel([-dy, dx, 0], Math.hypot(dx, dy) * jePx);
}

/** CSS-Transform einer Lage, z. B. `rotate3d(0.1, 0.9, 0, 0.6rad)`. */
export function cssDrehung(q: Quat): string {
  const n = quatNormieren(q);
  const w = Math.min(1, Math.max(-1, n[3]));
  const winkel = 2 * Math.acos(w);
  const s = Math.sqrt(1 - w * w);
  if (s < 1e-9) return 'rotate3d(0, 1, 0, 0rad)';
  const f = (x: number) => Number((x / s).toFixed(6));
  return `rotate3d(${f(n[0])}, ${f(n[1])}, ${f(n[2])}, ${Number(winkel.toFixed(6))}rad)`;
}

/** Liest die Lage aus einem von `cssDrehung` erzeugten Transform (für Tests). */
export function lageAusCss(transform: string): Quat {
  const m = /rotate3d\(\s*([-\d.e]+)\s*,\s*([-\d.e]+)\s*,\s*([-\d.e]+)\s*,\s*([-\d.e]+)rad\s*\)/.exec(transform);
  if (!m) throw new Error(`Kein rotate3d in „${transform}“`);
  return quatAchseWinkel([Number(m[1]), Number(m[2]), Number(m[3])], Number(m[4]));
}

/** Logische Flächen des Buches mit ihrer Außennormale im Modell (Rücken links, Schnitt rechts). */
export type Seite = 'vorne' | 'hinten' | 'ruecken' | 'schnitt' | 'oben' | 'unten';
export const SEITEN_NORMALEN: Record<Seite, Vek3> = {
  vorne: [0, 0, 1],
  hinten: [0, 0, -1],
  ruecken: [-1, 0, 0],
  schnitt: [1, 0, 0],
  oben: [0, -1, 0],
  unten: [0, 1, 0],
};

/** Welche Flächen in dieser Lage dem Betrachter zugewandt sind (Normale zeigt zum Betrachter). */
export function sichtbareSeiten(q: Quat, schwelle = 0.05): Seite[] {
  return (Object.keys(SEITEN_NORMALEN) as Seite[]).filter((s) => quatDrehen(q, SEITEN_NORMALEN[s])[2] > schwelle);
}

interface Probe {
  x: number;
  y: number;
  t: number;
}

/**
 * Trackball mit Schwung: `greifen` → `ziehen`* → `loslassen`, danach `schritt(t)` je Frame, bis er `false`
 * liefert. Zeiten in ms (beliebige, monotone Uhr).
 */
export class Trackball {
  lage: Quat;
  /** Winkelgeschwindigkeit um Bildschirmachsen [x, y] in rad/ms (nur nach dem Loslassen). */
  schwung: readonly [number, number] = [0, 0];
  private letzte: Probe | null = null;
  private proben: Probe[] = [];
  private zeit = 0;

  constructor(start: Quat = START_LAGE) {
    this.lage = start;
  }

  get gegriffen(): boolean {
    return this.letzte !== null;
  }

  get dreht(): boolean {
    return Math.hypot(this.schwung[0], this.schwung[1]) >= SCHWUNG_MIN;
  }

  greifen(x: number, y: number, t: number): void {
    this.schwung = [0, 0];
    this.letzte = { x, y, t };
    this.proben = [{ x, y, t }];
  }

  ziehen(x: number, y: number, t: number): void {
    if (!this.letzte) return;
    const dx = x - this.letzte.x;
    const dy = y - this.letzte.y;
    if (dx !== 0 || dy !== 0) this.lage = quatNormieren(quatMal(ziehDrehung(dx, dy), this.lage));
    this.letzte = { x, y, t };
    this.proben.push({ x, y, t });
    this.proben = this.proben.filter((p) => t - p.t <= SCHWUNG_FENSTER_MS);
  }

  loslassen(t: number): void {
    if (!this.letzte) return;
    const neu = this.proben.filter((p) => t - p.t <= SCHWUNG_FENSTER_MS);
    this.letzte = null;
    this.proben = [];
    this.zeit = t;
    if (neu.length < 2) {
      this.schwung = [0, 0];
      return;
    }
    const a = neu[0];
    const b = neu[neu.length - 1];
    const dt = Math.max(t - a.t, 1);
    // Winkelgeschwindigkeit als Vektor der Drehachse: Achse (-dy, dx), Betrag Strecke·DREHUNG_JE_PX / dt.
    let wx = (-(b.y - a.y) * DREHUNG_JE_PX) / dt;
    let wy = ((b.x - a.x) * DREHUNG_JE_PX) / dt;
    const betrag = Math.hypot(wx, wy);
    if (betrag > SCHWUNG_MAX) {
      wx *= SCHWUNG_MAX / betrag;
      wy *= SCHWUNG_MAX / betrag;
    }
    this.schwung = [wx, wy];
    if (!this.dreht) this.schwung = [0, 0];
  }

  /** Ein Frame Schwung bis Zeitpunkt t; `true`, solange sich das Modell noch dreht. */
  schritt(t: number): boolean {
    if (this.gegriffen || !this.dreht) return false;
    const dt = Math.max(0, Math.min(t - this.zeit, 100));
    this.zeit = t;
    if (dt === 0) return true;
    const [wx, wy] = this.schwung;
    // Exakt integriert über das Intervall bei exponentiellem Abklingen.
    const k = Math.exp(-dt / ABKLINGZEIT_MS);
    const winkel = Math.hypot(wx, wy) * ABKLINGZEIT_MS * (1 - k);
    this.lage = quatNormieren(quatMal(quatAchseWinkel([wx, wy, 0], winkel), this.lage));
    this.schwung = [wx * k, wy * k];
    if (!this.dreht) {
      this.schwung = [0, 0];
      return false;
    }
    return true;
  }
}
