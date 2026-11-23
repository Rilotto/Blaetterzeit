import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import iconPlus from '@/assets/icons/icon-plus.png';
import Icon from '@/components/Icon';
import { bandFiltern, type Liste, type Zugehoerigkeit } from '@/domain/listen';
import type { ListenRepository } from '@/storage';
import { listenFarbe, textstufe, pillenhoehePx, abstand } from '@/theme';

/** Listen und Zugehörigkeiten aus dem Repository (ADR-0002); `neuLaden` liest beides erneut. */
export function useListen(repo: ListenRepository): {
  listen: Liste[] | undefined;
  zug: Zugehoerigkeit[];
  neuLaden: () => Promise<void>;
} {
  const [stand, setStand] = useState<{ listen: Liste[]; zug: Zugehoerigkeit[] } | undefined>(undefined);
  const laden = useCallback(async () => {
    try {
      const [listen, zug] = await Promise.all([repo.listen(), repo.zugehoerigkeiten()]);
      return { listen, zug };
    } catch (fehler) {
      console.warn('Listen konnten nicht geladen werden:', fehler);
      return { listen: [], zug: [] };
    }
  }, [repo]);
  useEffect(() => {
    let aktiv = true;
    void laden().then((s) => {
      if (aktiv) setStand(s);
    });
    return () => {
      aktiv = false;
    };
  }, [laden]);
  const neuLaden = useCallback(async () => {
    setStand(await laden());
  }, [laden]);
  return { listen: stand?.listen, zug: stand?.zug ?? [], neuLaden };
}

const haekchenStil = (an: boolean): CSSProperties => ({
  flex: '0 0 auto',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  margin: 0,
  padding: 0,
  borderRadius: '8px',
  border: `2px solid ${an ? listenFarbe('haekchenFlaeche') : listenFarbe('haekchenRahmen')}`,
  backgroundColor: an ? listenFarbe('haekchenFlaeche') : 'transparent',
  color: listenFarbe('haekchenIcon'),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
});

/** Häkchen zum Ein- und Ausschalten (REQ-096, REQ-097): role="checkbox", aria-checked, data-haekchen=<listeId>. */
export function Haekchen({ listeId, name, an, onUmschalten }: { listeId: string; name: string; an: boolean; onUmschalten: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={an}
      aria-label={name}
      data-haekchen={listeId}
      data-an={an ? 'true' : 'false'}
      onClick={onUmschalten}
      style={haekchenStil(an)}
    >
      {an ? (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
      ) : null}
    </button>
  );
}

const bandStil = (fehler: boolean): CSSProperties => ({
  boxSizing: 'border-box',
  width: '64px',
  height: '34px',
  margin: 0,
  padding: `0 ${abstand('s')}`,
  borderRadius: '10px',
  border: `${fehler ? 2 : 1.5}px solid ${fehler ? listenFarbe('fehler') : listenFarbe('bandFeldRahmen')}`,
  backgroundColor: listenFarbe('bandFeldFlaeche'),
  color: fehler ? listenFarbe('fehler') : listenFarbe('bandFeldSchrift'),
  fontFamily: 'inherit',
  ...textstufe('text'),
  textAlign: 'center',
  outline: 'none',
});

/** Optionales Feld „Band“ je angehakter Saga (REQ-096): data-band-feld=<listeId>, ungültig data-fehler="true". */
export function BandFeld({ listeId, wert, fehler, onWert }: { listeId: string; wert: string; fehler: boolean; onWert: (w: string) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: abstand('s'), ...textstufe('meta'), color: listenFarbe('bandBeschriftung') }}>
      Band
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Band"
        data-band-feld={listeId}
        data-fehler={fehler ? 'true' : undefined}
        aria-invalid={fehler ? true : undefined}
        value={wert}
        onChange={(e) => onWert(bandFiltern(e.target.value))}
        style={bandStil(fehler)}
      />
    </label>
  );
}

/** Runde Plus-Schaltfläche „neue Liste“ (REQ-096 bis REQ-098): data-liste-neu. */
export function PlusSchaltflaeche({ beschriftung, onClick }: { beschriftung: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={beschriftung}
      data-liste-neu=""
      onClick={onClick}
      style={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${pillenhoehePx}px`,
        height: `${pillenhoehePx}px`,
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: '50%',
        backgroundColor: listenFarbe('plusFlaeche'),
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon datei="icon-plus.png" url={iconPlus} farbe={listenFarbe('plusIcon')} groesse={20} />
    </button>
  );
}

/** Stift-Symbol (Umbenennen, REQ-098), Farbe über `currentColor`. */
export function StiftSymbol() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 17l1-4L13.5 3.5a1.4 1.4 0 012 0l1 1a1.4 1.4 0 010 2L7 16l-4 1z" />
      <path d="M11.5 5.5l3 3" />
    </svg>
  );
}
