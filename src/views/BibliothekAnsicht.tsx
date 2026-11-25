import ListenNavigation, { type ListenNavigationProps } from '@/listen/ListenNavigation';

/**
 * Zielansicht des Menüpunkts „Bibliothek“ (REQ-002, REQ-097 AK-7): die Listenübersicht „Bibliotheken“ ohne Buchbezug,
 * also ohne Häkchen und ohne Feld „Band“. Repositories in Tests ersetzbar.
 */
export default function BibliothekAnsicht(props: Omit<ListenNavigationProps, 'start' | 'onZurueck'>) {
  return <ListenNavigation start={{ art: 'uebersicht', listenArt: 'bibliothek' }} {...props} />;
}
