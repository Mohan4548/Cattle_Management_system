/**
 * FarmEase – QRScannerModal (Phase 3 Upgrade)
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * The modal wrapper now embeds the real QRScanner component.
 * Used from any trigger point that still shows a modal (e.g. floating button).
 * The primary scanner is the full-page /qr-scanner route.
 */

import React from 'react';
import { Modal } from './Modal';
import { QRScanner } from '../../modules/qrScanner/components/QRScanner';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Smart QR Scanner">
      <div className="-mx-6 -mb-6" style={{ height: '480px' }}>
        <QRScanner onClose={onClose} embedded />
      </div>
    </Modal>
  );
};
