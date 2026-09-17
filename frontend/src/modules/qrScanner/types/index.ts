/**
 * FarmEase – QR Scanner Module Types
 * Phase 3: Smart QR Scanner & Digital Profile Access
 */

/** The state of the QR scanner lifecycle */
export type ScanState =
  | 'idle'          // Not started
  | 'requesting'    // Asking for camera permission
  | 'active'        // Camera running, scanning
  | 'processing'    // QR detected, resolving
  | 'success'       // Successfully resolved cattle
  | 'error';        // Something went wrong

/** Specific error categories for the QR scanner */
export type ScanErrorCode =
  | 'INVALID_QR'        // Scanned QR is not a FarmEase cattle QR
  | 'UNKNOWN_CATTLE'    // Slug valid but no cattle found (deleted?)
  | 'INACTIVE_QR'       // QR exists but cattle is inactive
  | 'CAMERA_DENIED'     // User denied camera permission
  | 'NO_CAMERA'         // Device has no camera
  | 'BROWSER_UNSUPPORTED' // Browser doesn't support camera APIs
  | 'OFFLINE'           // No internet connection
  | 'CORRUPTED'         // QR found but payload is garbled
  | 'SERVER_ERROR';     // Backend returned an unexpected error

export interface ScanError {
  code: ScanErrorCode;
  message: string;
  detail?: string;
}

/** Minimal cattle info returned for the Quick Info Card */
export interface ScannedCattleInfo {
  cattle_id: string;
  cattle_name: string;
  cattle_tag: string;
  breed: string;
  age?: string;
  health_status: string;
  lactation_stage: string;
  image_url: string;
  digital_identity_id: string;
  public_profile_slug: string;
  qr_status: string;
}

/** Result of resolving a raw QR payload */
export interface QRResolveResult {
  success: boolean;
  cattle?: ScannedCattleInfo;
  error?: ScanError;
}
