/**
 * FarmEase – useQRScanner React Hook
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Manages the full html5-qrcode camera lifecycle:
 * - High-definition camera stream (1080p/720p with autofocus)
 * - Hardware-accelerated BarcodeDetector integration
 * - Full-frame scanning (no restrictive clipping)
 * - Camera permission handling & graceful error recovery
 * - Duplicate scan prevention
 * - Camera switching (front/rear) & torch toggle
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
  resolveManualCode: (code: string) => Promise<void>;
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
  const scanHandledRef = useRef(false);
  const isRunningRef = useRef(false);

  /** Clean up scanner on unmount */
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch { /* ignore cleanup errors */ }
        isRunningRef.current = false;
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

      // Stop any existing scanner safely
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch { /* ignore */ }
        isRunningRef.current = false;
      }

      // Create scanner instance with hardware BarcodeDetector enabled
      const scanner = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, {
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      scannerRef.current = scanner;

      // Check flash support
      try {
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

      // High-definition camera configuration
      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: { ideal: 'environment' } };

      await scanner.start(
        cameraConfig,
        {
          fps: 24, // High framerate for crisp, immediate detection
          disableFlip: false,
          videoConstraints: {
            facingMode: cameraId ? undefined : { ideal: 'environment' },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            aspectRatio: { ideal: 1.7777777778 },
            // Continuous autofocus if supported
            advanced: [{ focusMode: 'continuous' } as any],
          },
        },
        async (decodedText: string, _result: Html5QrcodeResult) => {
          // Prevent processing the same scan twice
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;

          setScanState('processing');

          try {
            // Resolve the payload
            const result = await resolveQRPayload(decodedText);

            if (result.success && result.cattle) {
              // Haptic vibration feedback on supported mobile devices
              try { navigator.vibrate?.(120); } catch { /* ignore */ }

              // Stop camera now that scan succeeded
              try {
                if (scanner.isScanning) {
                  await scanner.stop();
                }
                isRunningRef.current = false;
              } catch { /* already stopped */ }

              setScannedCattle(result.cattle);
              setScanState('success');
            } else {
              // Stop camera and show clear error state with retry option
              try {
                if (scanner.isScanning) {
                  await scanner.stop();
                }
                isRunningRef.current = false;
              } catch { /* ignore */ }

              setError(result.error ?? {
                code: 'CORRUPTED',
                message: 'QR Code Unrecognized',
                detail: `Code scanned: "${decodedText.slice(0, 50)}". Please scan a FarmEase livestock QR code.`,
              });
              setScanState('error');
            }
          } catch (err: any) {
            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
              isRunningRef.current = false;
            } catch { /* ignore */ }

            setError({
              code: 'SERVER_ERROR',
              message: 'Failed to Process QR',
              detail: err?.message || 'Unexpected error while reading QR payload.',
            });
            setScanState('error');
          }
        },
        undefined // suppress per-frame scanning noise
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
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
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
    setTimeout(() => startScanner(cameraId), 300);
  }, [activeCameraId, stopScanner, startScanner]);

  /** Manually resolve an ID or test code */
  const resolveManualCode = useCallback(async (code: string) => {
    setScanState('processing');
    try {
      const result = await resolveQRPayload(code);
      if (result.success && result.cattle) {
        if (scannerRef.current?.isScanning) {
          await scannerRef.current.stop();
          isRunningRef.current = false;
        }
        setScannedCattle(result.cattle);
        setScanState('success');
      } else {
        setError(result.error ?? {
          code: 'UNKNOWN_CATTLE',
          message: 'Cattle Not Found',
          detail: `No cattle matching "${code}" was found.`,
        });
        setScanState('error');
      }
    } catch (err: any) {
      setError({
        code: 'SERVER_ERROR',
        message: 'Lookup Failed',
        detail: err?.message || 'Error resolving code',
      });
      setScanState('error');
    }
  }, []);

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
    resolveManualCode,
  };
}
