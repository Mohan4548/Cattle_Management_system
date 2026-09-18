import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService.js';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { cattle_id, status } = req.query;
    const list = notificationService.getNotifications(cattle_id as string, status as string);
    return res.status(200).json(list);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Unable to fetch notifications.' });
  }
};

export const getCattleAlerts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'BAD_REQUEST', message: 'Cattle ID required.' });
    const list = notificationService.getNotifications(id);
    return res.status(200).json(list);
  } catch (error: any) {
    console.error('Error fetching cattle alerts:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Unable to fetch cattle alerts.' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = notificationService.markAsRead(id);
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Notification not found.' });
    }
    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Unable to update notification.' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    notificationService.markAllAsRead();
    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Unable to update notifications.' });
  }
};

export const generateAlerts = async (req: Request, res: Response) => {
  try {
    const list = await notificationService.generateAllAlerts();
    return res.status(200).json(list);
  } catch (error: any) {
    console.error('Error generating AI alerts:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Unable to generate alerts.' });
  }
};
