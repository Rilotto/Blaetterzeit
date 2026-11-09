import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { kameraAufnehmen, kameraNativ, kameraStarten, type Kamerasitzung } from '@/bild/kamera';
import { buchdetailsFarbe } from '@/theme';
import Kopfzeile from './Kopfzeile';

interface Props {
  /** Aufgenommenes Foto als Data-URL. */
  onFoto: (dataUrl: string) => void;
  onZurueck: () => void;
}

type Zustand = 'startet' | 'laeuft' | 'nicht-verfuegbar';

const ansichtStil = (nativ: boolean): CSSProperties => ({
  position: 'relative',
  height: '100%',
  minHeight: '100%',
  overflow: 'hidden',
  // Auf dem Gerät liegt die Kamera HINTER der WebView: Fläche muss durchsichtig sein.
  backgroundColor: nativ ? 'transparent' : buchdetailsFarbe('kameraFlaeche'),
});

const videoStil: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const hinweisStil: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  margin: 0,
  transform: 'translateY(-50%)',
  textAlign: 'center',
  color: buchdetailsFarbe('kameraHinweis'),
};

const ausloeserStil = (bereit: boolean): CSSProperties => ({
  position: 'absolute',
  left: '50%',
  bottom: '24px',
  transform: 'translateX(-50%)',
  boxSizing: 'border-box',
  width: '72px',
  height: '72px',
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  border: `5px solid ${buchdetailsFarbe('ausloeserRahmen')}`,
  backgroundColor: buchdetailsFarbe('ausloeserFlaeche'),
  opacity: bereit ? 1 : 0.5,
  cursor: bereit ? 'pointer' : 'default',
  WebkitTapHighlightColor: 'transparent',
});

/** Kameraansicht innerhalb der App (REQ-016) mit Live-Vorschau, Zurück-Pfeil und Auslöser. */
export default function KameraAnsicht({ onFoto, onZurueck }: Props) {
  const nativ = kameraNativ();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [zustand, setZustand] = useState<Zustand>('startet');
  const [nimmtAuf, setNimmtAuf] = useState(false);
  const aktiv = useRef(true);

  const aufnehmen = async () => {
    setNimmtAuf(true);
    // Ohne laufende Vorschau (kein Zugriff) entsteht kein Bild; der Bereich bleibt unverändert (REQ-016, AK-6).
    const foto = await kameraAufnehmen();
    if (!aktiv.current) return;
    setNimmtAuf(false);
    if (foto) onFoto(foto);
  };

  useEffect(() => {
    aktiv.current = true;
    let laeuft = true;
    let sitzung: Kamerasitzung | null = null;
    kameraStarten(videoRef.current).then(
      (s) => {
        if (!laeuft) return s.beenden();
        sitzung = s;
        setZustand('laeuft');
      },
      () => {
        // Kein Zugriff (verweigert oder nicht vorhanden): Aufnehmen liefert kein Bild (REQ-016, AK-6).
        if (laeuft) setZustand('nicht-verfuegbar');
      },
    );
    return () => {
      laeuft = false;
      aktiv.current = false;
      sitzung?.beenden();
    };
  }, []);

  return (
    <section aria-label="Kamera" style={ansichtStil(nativ)}>
      {nativ ? null : <video ref={videoRef} muted playsInline autoPlay style={videoStil} />}
      {zustand === 'nicht-verfuegbar' ? <p style={hinweisStil}>Kamera nicht verfügbar</p> : null}
      <Kopfzeile onZurueck={onZurueck} stil={{ position: 'relative', zIndex: 1 }} />
      <button
        type="button"
        aria-label="Foto aufnehmen"
        aria-disabled={nimmtAuf || undefined}
        onClick={nimmtAuf ? undefined : () => void aufnehmen()}
        style={ausloeserStil(!nimmtAuf)}
      />
    </section>
  );
}
