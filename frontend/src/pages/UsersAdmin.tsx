import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { UserProfile, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { Users, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

export const UsersAdmin: React.FC = () => {
  const [userList, setUserList] = useState<UserProfile[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUserList(res.data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    try {
      const res = await apiClient.patch(`/users/${id}`, { role: newRole });
      setUserList(prev => prev.map(u => u.id === id ? res.data : u));
    } catch {
      alert('Failed to update user role.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-500" />
          User & RBAC Role Administration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage system user accounts, elevate permissions, and enforce role access matrix.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Current Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {userList.map((usr) => (
              <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                <td className="p-4 font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                  <img
                    src={usr.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/40"
                  />
                  <span>{usr.full_name}</span>
                </td>
                <td className="p-3.5 font-mono font-bold text-emerald-500">₹{(usr.base_salary || 22000).toLocaleString('en-IN')}/mo</td>
                <td className="p-4 text-slate-400">{usr.email}</td>
                <td className="p-4 text-slate-400">{usr.phone || 'N/A'}</td>
                <td className="p-4">
                  <Badge variant={usr.role}>{usr.role}</Badge>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                    {usr.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={usr.role}
                    onChange={(e) => handleRoleChange(usr.id, e.target.value as UserRole)}
                    className="py-1 px-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 capitalize"
                  >
                    <option value="admin">Admin</option>
                    <option value="farmer">Farmer</option>
                    <option value="veterinarian">Veterinarian</option>
                    <option value="worker">Worker</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
