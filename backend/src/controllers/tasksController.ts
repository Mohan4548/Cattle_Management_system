import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { Task } from '../types/index.js';

export interface WorkerAttendance {
  id: string;
  worker_id: string;
  worker_name: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  check_in?: string;
  check_out?: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Full Day';
  daily_wage?: number;
}

export const INITIAL_ATTENDANCE: WorkerAttendance[] = [
  { id: 'att-1', worker_id: 'user-worker-1', worker_name: 'Carlos Ruiz', date: '2026-08-09', status: 'present', check_in: '05:45 AM', check_out: '05:30 PM', shift: 'Full Day', daily_wage: 60.00 },
  { id: 'att-2', worker_id: 'user-worker-2', worker_name: 'Anita Sharma', date: '2026-08-09', status: 'present', check_in: '06:00 AM', check_out: '02:00 PM', shift: 'Morning Shift', daily_wage: 45.00 },
  { id: 'att-3', worker_id: 'user-vet-1', worker_name: 'Dr. Marcus Vance', date: '2026-08-09', status: 'present', check_in: '08:30 AM', check_out: '04:30 PM', shift: 'Full Day', daily_wage: 150.00 },
  { id: 'att-4', worker_id: 'user-worker-3', worker_name: 'Ramesh Kumar', date: '2026-08-09', status: 'leave', shift: 'Full Day', daily_wage: 0.00 },
];

let attendanceStore = [...INITIAL_ATTENDANCE];

export const getTasks = async (req: Request, res: Response) => {
  const { status, assigned_to } = req.query;
  let result = [...store.tasks];

  if (status && status !== 'all') {
    result = result.filter(t => t.status === status);
  }

  if (assigned_to) {
    result = result.filter(t => t.assigned_to === assigned_to);
  }

  return res.json(result);
};

export const createTask = async (req: Request, res: Response) => {
  const { title, description, assigned_to, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const assignedUser = store.users.find(u => u.id === assigned_to);

  const newTask: Task = {
    id: `tsk-${Date.now()}`,
    title,
    description: description || '',
    assigned_to: assigned_to || 'user-worker-1',
    assigned_to_name: assignedUser?.full_name || 'Carlos Ruiz',
    priority: priority || 'medium',
    status: 'todo',
    due_date: due_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  store.tasks.unshift(newTask);

  // Add activity log
  store.activities.unshift({
    id: `act-${Date.now()}`,
    title: `New Task Assigned: ${title}`,
    description: `Assigned to ${newTask.assigned_to_name}. Priority: ${priority}`,
    timestamp: 'Just now',
    type: 'task',
    user_name: 'Dr. Sarah Jenkins',
  });

  return res.status(201).json(newTask);
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const task = store.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  task.status = status;
  return res.json(task);
};

// Attendance Endpoints
export const getAttendance = async (req: Request, res: Response) => {
  return res.json(attendanceStore);
};

export const markAttendance = async (req: Request, res: Response) => {
  const { worker_id, status, shift, check_in, check_out } = req.body;

  const userObj = store.users.find(u => u.id === worker_id);

  const newEntry: WorkerAttendance = {
    id: `att-${Date.now()}`,
    worker_id: worker_id || 'user-worker-1',
    worker_name: userObj?.full_name || 'Carlos Ruiz',
    date: new Date().toISOString().split('T')[0],
    status: status || 'present',
    check_in: check_in || '06:00 AM',
    check_out: check_out || '05:00 PM',
    shift: shift || 'Full Day',
    daily_wage: status === 'present' ? 60.00 : 0.00,
  };

  attendanceStore.unshift(newEntry);
  return res.status(201).json(newEntry);
};
