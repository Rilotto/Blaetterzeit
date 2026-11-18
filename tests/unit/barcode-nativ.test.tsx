// Nativer Barcode-Scanner (ML Kit, Android) und Scan-Bildschirm bei nativer Vorschau / Startfehler.
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ml = vi.hoisted(() => {
  const listener = { remove: vi.fn(async () => {}) };
  return {
    listener,
    handler: null as null | ((e: { barcodes: { rawValue?: string }[] }) => void),
    isSupported: vi.fn(async () => ({ supported: true })),
    checkPermissions: vi.fn(async () => ({ camera: 'granted' })),
    requestPermissions: vi.fn(async () => ({ camera: 'granted' })),
    addListener: vi.fn(),
    startScan: vi.fn(async (_o?: unknown) => {}),
    stopScan: vi.fn(async () => {}),
    enableTorch: vi.fn(async () => {}),
    disableTorch: vi.fn(async () => {}),
  };
});
vi.mock('@capacitor-mlkit/barcode-scanning', () => ({ BarcodeScanner: ml, BarcodeFormat: { Ean13: 'EAN_13' } }));
const kamera = vi.hoisted(() => ({ kameraFreigeben: vi.fn(async () => {}) }));
vi.mock('@/bild/kamera', () => kamera);

import ScanBildschirm from '@/barcode/ScanBildschirm';
import { BARCODE_AKTIV_ATTRIBUT, fehlerText, nativerBarcodeScanner, type BarcodeScanner } from '@/barcode/scanner';

const aktiv = () => document.documentElement.hasAttribute(BARCODE_AKTIV_ATTRIBUT);

beforeEach(() => {
  vi.clearAllMocks();
  ml.isSupported.mockResolvedValue({ supported: true });
  ml.checkPermissions.mockResolvedValue({ camera: 'granted' });
  ml.requestPermissions.mockResolvedValue({ camera: 'granted' });
  ml.startScan.mockResolvedValue(undefined);
  ml.addListener.mockImplementation(async (_n: string, h: typeof ml.handler) => {
    ml.handler = h;
    return ml.listener;
  });
});
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute(BARCODE_AKTIV_ATTRIBUT);
});

describe('nativer Barcode-Scanner', () => {
  it('prüft Berechtigung, gibt die Cover-Kamera frei, startet EAN-13 und meldet die ISBN', async () => {
    const s = nativerBarcodeScanner();
    expect(s.vorschauNativ).toBe(true);
    const beiIsbn = vi.fn();
    await s.starten({ video: null, beiIsbn });
    expect(ml.requestPermissions).not.toHaveBeenCalled();
    expect(kamera.kameraFreigeben).toHaveBeenCalled();
    expect(kamera.kameraFreigeben.mock.invocationCallOrder[0]!).toBeLessThan(ml.startScan.mock.invocationCallOrder[0]!);
    expect(ml.startScan).toHaveBeenCalledWith({ formats: ['EAN_13'] });
    expect(aktiv()).toBe(true);
    ml.handler!({ barcodes: [{ rawValue: '978-3-551-55167-2' }] });
    expect(beiIsbn).toHaveBeenCalledWith('9783551551672');
    await s.beenden();
    expect(aktiv()).toBe(false);
    expect(ml.stopScan).toHaveBeenCalledTimes(1);
    expect(ml.listener.remove).toHaveBeenCalled();
  });

  it('fragt nur ohne Berechtigung nach; verweigert = Fehler ohne Kamerastart', async () => {
    ml.checkPermissions.mockResolvedValue({ camera: 'prompt' });
    ml.requestPermissions.mockResolvedValue({ camera: 'denied' });
    await expect(nativerBarcodeScanner().starten({ video: null, beiIsbn: vi.fn() })).rejects.toThrow(/verweigert/);
    expect(ml.startScan).not.toHaveBeenCalled();
    expect(aktiv()).toBe(false);
  });

  it('Fehler von startScan wird mit Meldung weitergegeben, nichts bleibt durchsichtig', async () => {
    ml.startScan.mockRejectedValue({ message: 'Camera in use', code: 'UNAVAILABLE' });
    await expect(nativerBarcodeScanner().starten({ video: null, beiIsbn: vi.fn() })).rejects.toThrow(
      'Kamera startet nicht: UNAVAILABLE: Camera in use',
    );
    expect(aktiv()).toBe(false);
    expect(ml.listener.remove).toHaveBeenCalled();
  });

  it('Schließen während des Starts schaltet die Kamera danach wieder aus', async () => {
    let freigeben!: () => void;
    ml.startScan.mockImplementation(() => new Promise<void>((r) => (freigeben = r)));
    const s = nativerBarcodeScanner();
    const start = s.starten({ video: null, beiIsbn: vi.fn() });
    await waitFor(() => expect(ml.startScan).toHaveBeenCalled());
    const ende = s.beenden();
    expect(aktiv()).toBe(false);
    freigeben();
    await start;
    await ende;
    expect(ml.stopScan).toHaveBeenCalledTimes(1);
    expect(aktiv()).toBe(false);
  });

  it('fehlerText liest Error, Text und Plugin-Objekte', () => {
    expect(fehlerText(new Error('a'))).toBe('a');
    expect(fehlerText('b')).toBe('b');
    expect(fehlerText({ code: 'X', message: 'y' })).toBe('X: y');
    expect(fehlerText(undefined)).toBe('Unbekannter Fehler');
  });
});

describe('Scan-Bildschirm', () => {
  const fake = (o: Partial<BarcodeScanner> = {}): BarcodeScanner => ({
    starten: vi.fn(async () => {}),
    lichtSetzen: vi.fn(async () => {}),
    beenden: vi.fn(async () => {}),
    ...o,
  });

  it('zeigt bei nativer Vorschau kein <video> (würde die Kamera hinter der WebView verdecken)', () => {
    const { container } = render(<ScanBildschirm scanner={fake({ vorschauNativ: true })} onIsbn={vi.fn()} onAbbruch={vi.fn()} />);
    expect(container.querySelector('video')).toBeNull();
    cleanup();
    const web = render(<ScanBildschirm scanner={fake()} onIsbn={vi.fn()} onAbbruch={vi.fn()} />);
    expect(web.container.querySelector('video')).not.toBeNull();
  });

  it('Startfehler: Hinweis mit Meldung, danach Abbruch', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onAbbruch = vi.fn();
    const scanner = fake({ starten: vi.fn(async () => Promise.reject(new Error('Kamera startet nicht: XYZ'))) });
    // Deterministisch mit künstlicher Zeit: unabhängig von der Geschwindigkeit der CI.
    vi.useFakeTimers();
    try {
      render(<ScanBildschirm scanner={scanner} onIsbn={vi.fn()} onAbbruch={onAbbruch} fehlerDauer={50} />);
      await act(async () => {});
      expect(screen.getByRole('alert')).toHaveTextContent('Kamera startet nicht: XYZ');
      act(() => void vi.advanceTimersByTime(49));
      expect(onAbbruch).not.toHaveBeenCalled();
      act(() => void vi.advanceTimersByTime(1));
      expect(onAbbruch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
