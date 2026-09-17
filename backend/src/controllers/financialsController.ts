import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { FinancialTransaction } from '../types/index.js';

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  { id: 'tx-1', type: 'income', category: 'Milk Sales', amount: 3450.00, transaction_date: '2026-08-01', description: 'Bulk morning & evening milk sales (1,150 L @ $3.00/L)', reference_id: 'INV-8821' },
  { id: 'tx-2', type: 'income', category: 'Milk Sales', amount: 3600.00, transaction_date: '2026-08-07', description: 'Weekly dairy co-op milk delivery payout', reference_id: 'INV-8835' },
  { id: 'tx-3', type: 'income', category: 'Cow Sales', amount: 1800.00, transaction_date: '2026-07-28', description: 'Sale of heifer cow (Tag FE-088) to Sunshine Dairy', reference_id: 'SALE-102' },
  { id: 'tx-4', type: 'income', category: 'Manure Sales', amount: 450.00, transaction_date: '2026-08-04', description: 'Organic vermicompost manure bulk order (15 Tons)', reference_id: 'MANURE-09' },
  
  { id: 'tx-5', type: 'expense', category: 'Feed', amount: 1250.00, transaction_date: '2026-08-02', description: 'Alfalfa hay bales & 18% Dairy concentrate (100 Bags)', reference_id: 'EXP-401' },
  { id: 'tx-6', type: 'expense', category: 'Salary', amount: 1800.00, transaction_date: '2026-08-01', description: 'Monthly worker salary & farm labor wages (Carlos Ruiz)', reference_id: 'PAY-801' },
  { id: 'tx-7', type: 'expense', category: 'Medicine', amount: 320.00, transaction_date: '2026-08-05', description: 'Veterinary vaccines, mastitis infusions & AD3E vitamins', reference_id: 'MED-204' },
  { id: 'tx-8', type: 'expense', category: 'Electricity', amount: 240.00, transaction_date: '2026-08-03', description: 'Monthly farm power & chilling plant electricity bill', reference_id: 'UTIL-901' },
  { id: 'tx-9', type: 'expense', category: 'Maintenance', amount: 180.00, transaction_date: '2026-08-06', description: 'Milking machine vacuum pump servicing & oil change', reference_id: 'MNT-110' },
  { id: 'tx-10', type: 'expense', category: 'Insurance', amount: 500.00, transaction_date: '2026-07-15', description: 'Annual herd livestock mortality insurance policy renewal', reference_id: 'INS-770' },
];

let transactionStore = [...INITIAL_TRANSACTIONS];

export const getTransactions = async (req: Request, res: Response) => {
  const { type, category } = req.query;
  let result = [...transactionStore];

  if (type && type !== 'all') {
    result = result.filter(t => t.type === type);
  }

  if (category && category !== 'all') {
    result = result.filter(t => t.category === category);
  }

  result.sort((a, b) => new Date(b.transaction_date || b.date || '').getTime() - new Date(a.transaction_date || a.date || '').getTime());
  return res.json(result);
};

export const createTransaction = async (req: Request, res: Response) => {
  const { type, category, amount, transaction_date, description, reference_id } = req.body;

  if (!type || !category || amount === undefined) {
    return res.status(400).json({ message: 'Type, category, and amount are required' });
  }

  const newTx: FinancialTransaction = {
    id: `tx-${Date.now()}`,
    type,
    category,
    amount: Number(amount),
    transaction_date: transaction_date || new Date().toISOString().split('T')[0],
    description: description || `${category} transaction`,
    reference_id: reference_id || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  transactionStore.unshift(newTx);
  return res.status(201).json(newTx);
};

export const getFinancialSummary = async (req: Request, res: Response) => {
  const totalIncome = transactionStore.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactionStore.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  // Income Sources Breakdown
  const milkSales = transactionStore.filter(t => t.category === 'Milk Sales').reduce((a, c) => a + c.amount, 0) || 7050;
  const cowSales = transactionStore.filter(t => t.category === 'Cow Sales').reduce((a, c) => a + c.amount, 0) || 1800;
  const manureSales = transactionStore.filter(t => t.category === 'Manure Sales').reduce((a, c) => a + c.amount, 0) || 450;

  const incomeDistribution = [
    { name: 'Milk Sales', value: milkSales, color: '#10b981' },
    { name: 'Cow Sales', value: cowSales, color: '#6366f1' },
    { name: 'Manure Sales', value: manureSales, color: '#f59e0b' },
  ];

  // Expense Categories Breakdown
  const feedExp = transactionStore.filter(t => t.category === 'Feed').reduce((a, c) => a + c.amount, 0) || 1250;
  const salaryExp = transactionStore.filter(t => t.category === 'Salary').reduce((a, c) => a + c.amount, 0) || 1800;
  const medExp = transactionStore.filter(t => t.category === 'Medicine').reduce((a, c) => a + c.amount, 0) || 320;
  const utilExp = transactionStore.filter(t => t.category === 'Electricity').reduce((a, c) => a + c.amount, 0) || 240;
  const mntExp = transactionStore.filter(t => t.category === 'Maintenance').reduce((a, c) => a + c.amount, 0) || 180;
  const insExp = transactionStore.filter(t => t.category === 'Insurance').reduce((a, c) => a + c.amount, 0) || 500;

  const expenseDistribution = [
    { name: 'Worker Salary', value: salaryExp, color: '#8b5cf6' },
    { name: 'Feed & Fodder', value: feedExp, color: '#f59e0b' },
    { name: 'Livestock Insurance', value: insExp, color: '#ec4899' },
    { name: 'Veterinary Medicine', value: medExp, color: '#ef4444' },
    { name: 'Electricity Utilities', value: utilExp, color: '#3b82f6' },
    { name: 'Maintenance', value: mntExp, color: '#14b8a6' },
  ];

  // Monthly Financial Trend
  const monthlyTrend = [
    { month: 'May', income: 8200, expense: 3800, profit: 4400 },
    { month: 'Jun', income: 8800, expense: 4100, profit: 4700 },
    { month: 'Jul', income: 9100, expense: 4300, profit: 4800 },
    { month: 'Aug', income: totalIncome, expense: totalExpenses, profit: netProfit },
  ];

  return res.json({
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin: Number(profitMargin),
    incomeDistribution,
    expenseDistribution,
    monthlyTrend,
  });
};
