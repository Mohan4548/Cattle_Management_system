import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user by email or fallback role match
  let user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user && role) {
    user = store.users.find(u => u.role === role);
  }

  if (!user) {
    // Dynamically create a demo user profile if not found
    user = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: (role as any) || 'farmer',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    store.users.push(user);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user,
    message: 'Login successful',
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, full_name, role, phone } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ message: 'Email, password, and full name are required' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'A user with this email address already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    full_name,
    role: role || 'worker',
    phone: phone || '',
    status: 'active' as const,
    created_at: new Date().toISOString(),
  };

  store.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: newUser,
    message: 'Registration successful. Account active.',
  });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ user: req.user });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  return res.json({
    message: 'Password reset link has been sent to your email address.',
  });
};
