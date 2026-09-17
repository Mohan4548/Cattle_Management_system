import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  register: (data: { email: string; password?: string; full_name: string; role: UserRole; phone?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial fallback users for instant seamless testing across all 4 roles
const MOCK_PROFILES: Record<UserRole, UserProfile> = {
  admin: {
    id: 'user-admin-1',
    email: 'admin@farmease.com',
    full_name: 'Dr. Sarah Jenkins',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 019-2834',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  farmer: {
    id: 'user-farmer-1',
    email: 'farmer@farmease.com',
    full_name: 'Robert Miller',
    role: 'farmer',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 014-9821',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  veterinarian: {
    id: 'user-vet-1',
    email: 'vet@farmease.com',
    full_name: 'Dr. Marcus Vance',
    role: 'veterinarian',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 018-3490',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  worker: {
    id: 'user-worker-1',
    email: 'worker@farmease.com',
    full_name: 'Carlos Ruiz',
    role: 'worker',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 012-7743',
    status: 'active',
    created_at: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('farmease_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('farmease_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(MOCK_PROFILES.admin);
        }
      } else {
        // Default initialized session as Admin for smooth first load demo
        setUser(MOCK_PROFILES.admin);
        localStorage.setItem('farmease_user', JSON.stringify(MOCK_PROFILES.admin));
        localStorage.setItem('farmease_token', 'mock-jwt-token-admin');
        setToken('mock-jwt-token-admin');
      }

      // Sync with API if server running
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('farmease_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Soft fallback to local state
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string, role?: UserRole) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password, role });
      const authenticatedUser = res.data.user;
      const authToken = res.data.token;
      
      setUser(authenticatedUser);
      setToken(authToken);
      localStorage.setItem('farmease_token', authToken);
      localStorage.setItem('farmease_user', JSON.stringify(authenticatedUser));
    } catch (err) {
      // Fallback auth for offline / mock testing
      const targetRole = role || (email.includes('admin') ? 'admin' : email.includes('vet') ? 'veterinarian' : email.includes('worker') ? 'worker' : 'farmer');
      const mockUser = MOCK_PROFILES[targetRole];
      const mockToken = `mock-token-${targetRole}`;
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('farmease_token', mockToken);
      localStorage.setItem('farmease_user', JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password?: string; full_name: string; role: UserRole; phone?: string }) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', data);
      const newUser = res.data.user;
      const authToken = res.data.token;

      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('farmease_token', authToken);
      localStorage.setItem('farmease_user', JSON.stringify(newUser));
    } catch (err) {
      // Fallback register
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        phone: data.phone || '',
        status: 'active',
        created_at: new Date().toISOString(),
      };
      const mockToken = `mock-token-${newUser.id}`;
      setUser(newUser);
      setToken(mockToken);
      localStorage.setItem('farmease_token', mockToken);
      localStorage.setItem('farmease_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('farmease_token');
    localStorage.removeItem('farmease_user');
  };

  const switchRole = (newRole: UserRole) => {
    const profile = MOCK_PROFILES[newRole];
    setUser(profile);
    localStorage.setItem('farmease_user', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
