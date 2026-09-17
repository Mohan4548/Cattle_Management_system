import { Request, Response } from 'express';
import { store } from '../services/store.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  const stats = store.getDashboardStats();
  return res.json(stats);
};

export const logActivity = async (req: Request, res: Response) => {
  const { title, description, type, user_name } = req.body;
  const newActivity = {
    id: `act-${Date.now()}`,
    title,
    description,
    timestamp: 'Just now',
    type: type || 'milk',
    user_name: user_name || 'Farm Staff',
  };
  store.activities.unshift(newActivity);
  return res.status(201).json(newActivity);
};
