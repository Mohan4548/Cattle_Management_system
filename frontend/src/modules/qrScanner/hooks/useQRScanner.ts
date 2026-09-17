/**
 * FarmEase – useQRScanner React Hook
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Manages the full html5-qrcode camera lifecycle:
 * - Camera permission request
 * - Scanner initialization and teardown
 * - Duplicate scan prevention
 * - Camera switching (front/rear)
 * - Torch (flashlight) toggle
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeResult } from 'html5-qrcode';
import type { ScanState, ScanError, ScannedCattleInfo } from '../types/index';
import { resolveQRPayload } from '../services/qrScanService';

export const QR_SCANNER_ELEMENT_ID = 'farmease-qr-scanner-viewport';

interface UseQRScannerReturn {
  scanState: ScanState;
  error: ScanError | null;
  scannedCattle: ScannedCattleInfo | null;
  hasFlash: boolean;
  flashOn: boolean;
  cameras: Array<{ id: string; label: string }>;
  activeCameraId: string | null;
  startScanner: (cameraId?: string) => Promise<void>;
  stopScanner: () => Promise<void>;
  resetScanner: () => void;
  toggleFlash: () => Promise<void>;
  switchCamera: (cameraId: string) => Promise<void>;
}

export function useQRScanner(): UseQRScannerReturn {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [error, setError] = useState<ScanError | null>(null);
  const [scannedCattle, setScannedCattle] = useState<ScannedCattleInfo | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanHandledRef = useRef(false); // prevent duplicate scans
  const isRunningRef = useRef(false);

  /** Clean up scanner on unmount */
  useEffect(() => {
    return () => {
      if (isRunningRef.current && scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
          scannerRef.current.clear();
        } catch { /* ignore cleanup errors */ }
      }
    };
  }, []);

  /** Enumerate available cameras */
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })));
      return devices;
    } catch {
      return [];
    }
  }, []);

  /** Start the QR scanner */
  const startScanner = useCallback(async (preferredCameraId?: string) => {
    // Guard: browser support check
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanState('error');
      setError({
        code: 'BROWSER_UNSUPPORTED',
        message: 'Browser Not Supported',
        detail: 'Your browser does not support camera access. Please use Chrome, Safari, Firefox, or Edge.',
      });
      return;
    }

    // Offline check
    if (!navigator.onLine) {
      setScanState('error');
      setError({
        code: 'OFFLINE',
        message: 'No Internet Connection',
        detail: 'Please reconnect to the internet before scanning.',
      });
      return;
    }

    setScanState('requesting');
    setError(null);
    scanHandledRef.current = false;

    try {
      // Get cameras
      const devices = await enumerateCameras();
      if (devices.length === 0) {
        setScanState('error');
        setError({
          code: 'NO_CAMERA',
          message: 'No Camera Found',
          detail: 'No camera was detected on your device. Please connect a camera and try again.',
        });
        return;
      }

      // Choose camera: prefer rear-facing on mobile
      let cameraId = preferredCameraId;
      if (!cameraId) {
        const rearCamera = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        cameraId = rearCamera?.id ?? devices[0]?.id;
      }
      setActiveCameraId(cameraId || null);

      // Stop any existing scanner
      if (isRunningRef.current && scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        isRunningRef.current = false;
      }

      // Create scanner instance
      const scanner = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, { verbose: false });
      scannerRef.current = scanner;

      // Check flash support
      try {
        // @ts-ignore – torch capability check
        const capabilities = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = capabilities.getVideoTracks()[0];
        // @ts-ignore
        const caps = track?.getCapabilities?.();
        setHasFlash(!!(caps as any)?.torch);
        capabilities.getTracks().forEach(t => t.stop());
      } catch {
        setHasFlash(false);
      }

      setScanState('active');

      await scanner.start(
        cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        async (decodedText: string, _result: Html5QrcodeResult) => {
          // Prevent processing the same scan twice
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;

          setScanState('processing');

          // Stop camera immediately after detection
          try {
            await scanner.stop();
            isRunningRef.current = false;
          } catch { /* already stopped */ }

          // Resolve the payload
          const result = await resolveQRPayload(decodedText);
          if (result.success && result.cattle) {
            setScannedCattle(result.cattle);
            setScanState('success');
          } else {
            setError(result.error ?? { code: 'CORRUPTED', message: 'Unknown Error', detail: '' });
            setScanState('error');
          }
        },
        undefined // optional error callback (suppress per-frame noise)
      );

      isRunningRef.current = true;

    } catch (err: any) {
      const msg = err?.message ?? String(err);

      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('notallowed')) {
        setScanState('error');
        setError({
          code: 'CAMERA_DENIED',
          message: 'Camera Permission Denied',
          detail: 'Please allow camera access in your browser settings and try again.',
        });
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('no camera')) {
        setScanState('error');
        setError({
          code: 'NO_CAMERA',
          message: 'Camera Not Available',
          detail: 'No camera was found or it is being used by another application.',
        });
      } else {
        setScanState('error');
        setError({
          code: 'SERVER_ERROR',
          message: 'Camera Failed to Start',
          detail: msg,
        });
      }
    }
  }, [enumerateCameras]);

  /** Stop the QR scanner and release camera resources */
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch { /* ignore */ }
      isRunningRef.current = false;
    }
    setScanState('idle');
  }, []);

  /** Reset scanner back to idle for another scan */
  const resetScanner = useCallback(() => {
    scanHandledRef.current = false;
    setError(null);
    setScannedCattle(null);
    setScanState('idle');
  }, []);

  /** Toggle flashlight/torch */
  const toggleFlash = useCallback(async () => {
    if (!scannerRef.current || !hasFlash) return;
    try {
      // @ts-ignore – html5-qrcode exposes applyVideoConstraints
      await scannerRef.current.applyVideoConstraints({ advanced: [{ torch: !flashOn }] });
      setFlashOn(prev => !prev);
    } catch { /* device doesn't support it */ }
  }, [hasFlash, flashOn]);

  /** Switch to a different camera */
  const switchCamera = useCallback(async (cameraId: string) => {
    if (cameraId === activeCameraId) return;
    await stopScanner();
    // Small delay to let the DOM element clear
    setTimeout(() => startScanner(cameraId), 300);
  }, [activeCameraId, stopScanner, startScanner]);

  return {
    scanState,
    error,
    scannedCattle,
    hasFlash,
    flashOn,
    cameras,
    activeCameraId,
    startScanner,
    stopScanner,
    resetScanner,
    toggleFlash,
    switchCamera,
  };
}
