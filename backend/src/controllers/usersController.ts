import { Request, Response } from 'express';
import { store } from '../services/store.js';

export interface AuditLogItem {
  id: string;
  user_name: string;
  user_email: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  ip_address: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 'aud-1', user_name: 'Dr. Sarah Jenkins', user_email: 'admin@farmease.com', role: 'admin', action: 'Log Health Record', module: 'Veterinary Health', timestamp: '2026-08-09 10:15:22', ip_address: '192.168.1.45' },
  { id: 'aud-2', user_name: 'Carlos Ruiz', user_email: 'worker@farmease.com', role: 'worker', action: 'Record Morning Milk Yield', module: 'Milk Production', timestamp: '2026-08-09 06:10:05', ip_address: '192.168.1.88' },
  { id: 'aud-3', user_name: 'Dr. Marcus Vance', user_email: 'vet@farmease.com', role: 'veterinarian', action: 'Ultrasound Pregnancy Check (Positive)', module: 'Breeding & Calving', timestamp: '2026-08-08 14:30:00', ip_address: '192.168.1.12' },
  { id: 'aud-4', user_name: 'Dr. Sarah Jenkins', user_email: 'admin@farmease.com', role: 'admin', action: 'Export Financial Ledger CSV', module: 'Financials', timestamp: '2026-08-08 09:00:15', ip_address: '192.168.1.45' },
  { id: 'aud-5', user_name: 'John Miller', user_email: 'farmer@farmease.com', role: 'farmer', action: 'Register New Cattle Tag FE-CAT-2026-006', module: 'Herd Directory', timestamp: '2026-08-07 16:45:10', ip_address: '192.168.1.30' },
];

let auditStore = [...INITIAL_AUDIT_LOGS];

export const getUsers = async (req: Request, res: Response) => {
  return res.json(store.users);
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, status } = req.body;

  const user = store.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (role) user.role = role;
  if (status) user.status = status;

  // Record Audit Log
  auditStore.unshift({
    id: `aud-${Date.now()}`,
    user_name: 'Dr. Sarah Jenkins',
    user_email: 'admin@farmease.com',
    role: 'admin',
    action: `Update Role of ${user.full_name} to ${user.role}`,
    module: 'User Administration',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip_address: '192.168.1.45',
  });

  return res.json(user);
};

export const getAuditLogs = async (req: Request, res: Response) => {
  return res.json(auditStore);
};
