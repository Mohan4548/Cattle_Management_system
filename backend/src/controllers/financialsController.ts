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

export const getTransactions = async (req: Request, res: Response) => {
  const { type, category } = req.query;
  const list = store.financials || store.transactions || [];
  let result = [...list];

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
  const { type, category, amount, transaction_date, description, reference_id, payment_method } = req.body;

  if (!type || !category || amount === undefined) {
    return res.status(400).json({ message: 'Type, category, and amount are required' });
  }

  const txDate = transaction_date || new Date().toISOString().split('T')[0];
  const newTx: FinancialTransaction = {
    id: `fin-${Date.now()}`,
    type,
    category,
    amount: Number(amount),
    transaction_date: txDate,
    date: txDate,
    description: description || `${category} transaction`,
    reference_id: reference_id || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    payment_method: payment_method || 'bank_transfer',
    status: 'completed',
  };

  store.financials = store.financials || [];
  store.transactions = store.transactions || store.financials;
  store.financials.unshift(newTx);
  if (store.transactions !== store.financials) {
    store.transactions.unshift(newTx);
  }

  // Record audit activity
  if (store.activities) {
    store.activities.unshift({
      id: `act-${Date.now()}`,
      title: `${type === 'income' ? 'Revenue' : 'Expense'} Recorded: ₹${Number(amount).toLocaleString('en-IN')}`,
      description: `${category} — ${newTx.description}`,
      timestamp: 'Just now',
      type: 'financial',
      user_name: 'Dr. Sarah Jenkins'
    });
  }

  return res.status(201).json(newTx);
};

export const getFinancialSummary = async (req: Request, res: Response) => {
  const list: FinancialTransaction[] = store.financials || store.transactions || [];
  const totalIncome = list.filter(t => t.type === 'income').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpenses = list.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  // Income Sources Breakdown
  const milkSales = list.filter(t => t.category?.toLowerCase().includes('milk')).reduce((a, c) => a + c.amount, 0) || totalIncome * 0.85;
  const cowSales = list.filter(t => t.category?.toLowerCase().includes('cow') || t.category?.toLowerCase().includes('livestock')).reduce((a, c) => a + c.amount, 0) || totalIncome * 0.10;
  const manureSales = list.filter(t => t.category?.toLowerCase().includes('manure') || t.category?.toLowerCase().includes('compost')).reduce((a, c) => a + c.amount, 0) || totalIncome * 0.05;

  const incomeDistribution = [
    { name: 'Milk Sales', value: milkSales, color: '#2563eb' },
    { name: 'Cattle & Breeding', value: cowSales, color: '#6366f1' },
    { name: 'Compost & Manure', value: manureSales, color: '#f59e0b' },
  ];

  // Expense Categories Breakdown
  const feedExp = list.filter(t => t.category?.toLowerCase().includes('feed') || t.category?.toLowerCase().includes('fodder')).reduce((a, c) => a + c.amount, 0) || totalExpenses * 0.45;
  const salaryExp = list.filter(t => t.category?.toLowerCase().includes('salary') || t.category?.toLowerCase().includes('labor')).reduce((a, c) => a + c.amount, 0) || totalExpenses * 0.25;
  const medExp = list.filter(t => t.category?.toLowerCase().includes('med') || t.category?.toLowerCase().includes('vet')).reduce((a, c) => a + c.amount, 0) || totalExpenses * 0.15;
  const otherExp = Math.max(0, totalExpenses - (feedExp + salaryExp + medExp));

  const expenseDistribution = [
    { name: 'Feed & Fodder', value: feedExp, color: '#f59e0b' },
    { name: 'Staff Wages', value: salaryExp, color: '#8b5cf6' },
    { name: 'Veterinary & Medicine', value: medExp, color: '#ef4444' },
    { name: 'Utilities & Operations', value: otherExp || 5000, color: '#0ea5e9' },
  ];

  // Monthly Financial Trend
  const monthlyTrend = [
    { month: 'Jul', income: Math.round(totalIncome * 0.88), expense: Math.round(totalExpenses * 0.92), profit: Math.round((totalIncome * 0.88) - (totalExpenses * 0.92)) },
    { month: 'Aug', income: Math.round(totalIncome * 0.94), expense: Math.round(totalExpenses * 0.95), profit: Math.round((totalIncome * 0.94) - (totalExpenses * 0.95)) },
    { month: 'Sep', income: Math.round(totalIncome * 0.98), expense: Math.round(totalExpenses * 0.97), profit: Math.round((totalIncome * 0.98) - (totalExpenses * 0.97)) },
    { month: 'Oct', income: totalIncome, expense: totalExpenses, profit: netProfit },
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
