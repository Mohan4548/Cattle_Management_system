import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Task, UserProfile } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Users, 
  CheckSquare, 
  Plus, 
  Clock, 
  Calendar, 
  UserCheck, 
  UserX, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Briefcase
} from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  assigned_to: z.string().min(1, 'Please select worker'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().min(4, 'Due date is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AttendanceRecord {
  id: string;
  worker_name: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  check_in?: string;
  check_out?: string;
  shift: string;
  daily_wage?: number;
}

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'attendance' | 'workers'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      due_date: new Date().toISOString().split('T')[0],
      assigned_to: 'user-worker-1',
    },
  });

  const fetchData = async () => {
    try {
      const [tRes, uRes, aRes] = await Promise.all([
        apiClient.get('/tasks'),
        apiClient.get('/users'),
        apiClient.get('/tasks/attendance'),
      ]);
      setTasks(Array.isArray(tRes.data) ? tRes.data : []);
      setWorkers(Array.isArray(uRes.data) ? uRes.data : []);
      setAttendance(Array.isArray(aRes.data) ? aRes.data : []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      const res = await apiClient.post('/tasks', data);
      setTasks(prev => [res.data, ...prev]);
      setIsTaskModalOpen(false);
      reset();
    } catch {
      alert('Failed to assign task.');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleMarkPresent = async (workerId: string, workerName: string) => {
    try {
      const res = await apiClient.post('/tasks/attendance', { worker_id: workerId, status: 'present', shift: 'Full Day' });
      setAttendance(prev => [res.data, ...prev]);
    } catch {
      alert('Failed to mark attendance.');
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Worker Management & Daily Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Worker profiles, attendance tracking, monthly salary payroll, and daily Kanban task dispatching.
          </p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Assign Daily Task
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'tasks' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Kanban Task Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'attendance' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Worker Attendance Tracker ({attendance.length})
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'workers' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Staff Profiles & Payroll ({workers.length})
        </button>
      </div>

      {/* Tab 1: Kanban Task Board */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: To Do */}
          <div className="glass-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> To Do ({todoTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {todoTasks.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{t.title}</span>
                    <Badge variant={t.priority === 'urgent' ? 'sick' : t.priority === 'high' ? 'medium' : 'healthy'}>
                      {t.priority}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-400">{t.description || 'Assigned farm task.'}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                    <span className="text-emerald-500 font-bold">Worker: {t.assigned_to_name}</span>
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                      className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold"
                    >
                      Start Task →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="glass-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" /> In Progress ({inProgressTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{t.title}</span>
                    <Badge variant="medium">{t.priority}</Badge>
                  </div>

                  <p className="text-[11px] text-slate-400">{t.description || 'Task in progress.'}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                    <span className="text-indigo-400 font-bold">Worker: {t.assigned_to_name}</span>
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'completed')}
                      className="px-2 py-1 rounded bg-emerald-500 text-white font-bold shadow-glow"
                    >
                      Complete ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="glass-card p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed ({completedTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {completedTasks.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white line-through">{t.title}</span>
                    <Badge variant="healthy">Done</Badge>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">Assigned: {t.assigned_to_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Tracker */}
      {activeTab === 'attendance' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5">Worker Name</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Shift</th>
                <th className="p-3.5">Check-In</th>
                <th className="p-3.5">Check-Out</th>
                <th className="p-3.5">Attendance Status</th>
                <th className="p-3.5 text-right">Daily Wage ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {attendance.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{a.worker_name}</td>
                  <td className="p-3.5 font-mono">{a.date}</td>
                  <td className="p-3.5 font-bold text-teal-400">{a.shift}</td>
                  <td className="p-3.5 font-mono text-slate-400">{a.check_in || '--'}</td>
                  <td className="p-3.5 font-mono text-slate-400">{a.check_out || '--'}</td>
                  <td className="p-3.5">
                    <Badge variant={a.status === 'present' ? 'healthy' : a.status === 'absent' ? 'sick' : 'medium'}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-500 text-right">${a.daily_wage || 60.00}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Staff Profiles & Payroll */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workers.map((w) => (
            <div key={w.id} className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <img src={w.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{w.full_name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {w.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p>Email: <strong className="text-slate-200">{w.email}</strong></p>
                <p>Phone: <strong className="text-slate-200">{w.phone || '+91 98765 00000'}</strong></p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Monthly Base Salary</span>
                <span className="text-emerald-500 font-mono">₹{(w.base_salary || 22000).toLocaleString('en-IN')}/mo</span>
              </div>

              <button
                onClick={() => handleMarkPresent(w.id, w.full_name)}
                className="w-full py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400 transition-colors shadow-glow"
              >
                Mark Present Today
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Assign Task */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign Daily Farm Task">
        <form onSubmit={handleSubmit(handleCreateTask)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Task Title</label>
            <input {...register('title')} type="text" placeholder="Morning Milking Session & Quality Check" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Assign to Worker</label>
              <select {...register('assigned_to')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-emerald-400">
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.full_name} ({w.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select {...register('priority')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">🚨 Urgent Case</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Due Date</label>
            <input {...register('due_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-glow">Assign Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
