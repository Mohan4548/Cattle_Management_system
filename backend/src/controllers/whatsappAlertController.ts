import { Request, Response } from 'express';
import { whatsAppAlertService, WhatsAppAlertPayload } from '../services/whatsappAlertService.js';

export const generateWhatsAppAlert = async (req: Request, res: Response) => {
  try {
    const { recipientType, recipientPhone, recipientName, alertType, cattleId, customNotes } = req.body;

    if (!alertType) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Alert type parameter is required.',
      });
    }

    const payload: WhatsAppAlertPayload = {
      recipientType: recipientType || 'FARM_WORKER',
      recipientPhone: recipientPhone || '+91 98765 43210',
      recipientName: recipientName || 'Farm Team',
      alertType,
      cattleId,
      customNotes,
    };

    const alertResult = whatsAppAlertService.generateAlertMessage(payload);

    return res.status(200).json({
      success: true,
      message: 'Alert message generated successfully',
      data: alertResult,
    });
  } catch (error: any) {
    console.error('Error generating WhatsApp alert:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to generate WhatsApp alert.',
    });
  }
};
