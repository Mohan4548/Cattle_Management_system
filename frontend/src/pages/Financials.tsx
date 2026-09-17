import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { FinancialTransaction, Cattle } from '../types';
import { Badge } from '../components/common/Badge';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Plus, 
  Download, 
  Printer, 
  Paperclip, 
  FileText, 
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  ShoppingCart,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const Financials: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'ledger' | 'charts' | 'vault' | 'purchases'>('ledger');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newCategory, setNewCategory] = useState('Milk Sales');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMethod, setNewMethod] = useState('bank_transfer');

  const fetchFinancials = async () => {
    try {
      const res = await apiClient.get('/financials');
      setTransactions(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  // ── Purchase Report state ─────────────────────────────────────
  const [purchaseCattle, setPurchaseCattle] = useState<Cattle[]>([]);
  useEffect(() => {
    if (activeTab === 'purchases' && purchaseCattle.length === 0) {
      apiClient.get('/cattle', { params: { limit: 500, page: 1 } })
        .then(res => {
          const list: Cattle[] = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
          setPurchaseCattle(list);
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const exportPurchaseCSV = () => {
    const headers = ['Tag ID','Name','Breed','Gender','Purchase Type','Purchase Date','Purchase Price (₹)','Transport Cost (₹)','Medical Cost (₹)','Other Cost (₹)','Total Acquisition (₹)','Seller','Seller Contact','Purchase Location','Invoice No.','Current Owner'];
    const rows = purchaseCattle.map(c => [
      c.tag_number, c.name, c.breed, c.gender,
      c.purchase_type || '', c.purchase_date || '',
      c.purchase_cost ?? '', c.transportation_cost ?? '',
      c.initial_medical_cost ?? '', c.other_purchase_cost ?? '',
      c.total_acquisition_cost ?? c.purchase_cost ?? '',
      c.seller_name || '', c.seller_contact || '',
      c.purchase_location || '', c.invoice_number || '',
      c.owner_name || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `FarmEase_Purchase_Report_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newDesc) return;
    const tx: FinancialTransaction = {
      id: `fin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newType,
      category: newCategory,
      amount: parseFloat(newAmount),
      description: newDesc,
      payment_method: newMethod as any,
      status: 'completed',
      invoice_number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    setTransactions([tx, ...transactions]);
    setIsModalOpen(false);
    setNewAmount('');
    setNewDesc('');
  };

  // Indian Economy Financial Computations in ₹ INR
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 288000;
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 147000;
  const netProfit = totalIncome - totalExpense;
  const marginPercentage = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '49.0';

  const filteredTransactions = transactions.filter(t => {
    if (typeFilter === 'income') return t.type === 'income';
    if (typeFilter === 'expense') return t.type === 'expense';
    return true;
  });

  // Recharts Monthly P&L Data in ₹ INR
  const plMonthlyData = [
    { month: 'Apr', income: 210000, expense: 110000, profit: 100000 },
    { month: 'May', income: 235000, expense: 125000, profit: 110000 },
    { month: 'Jun', income: 250000, expense: 130000, profit: 120000 },
    { month: 'Jul', income: 270000, expense: 140000, profit: 130000 },
    { month: 'Aug', income: 288000, expense: 147000, profit: 141000 },
  ];

  const incomeCategoriesData = [
    { name: 'Milk Sales', value: 245000, color: '#10b981' },
    { name: 'Stud Fees', value: 25000, color: '#0d9488' },
    { name: 'Manure Sales', value: 18000, color: '#14b8a6' },
  ];

  const expenseCategoriesData = [
    { name: 'Feed & Fodder', value: 45000, color: '#f59e0b' },
    { name: 'Staff Salaries', value: 65000, color: '#ef4444' },
    { name: 'Utilities', value: 14500, color: '#8b5cf6' },
    { name: 'Medicine', value: 8500, color: '#ec4899' },
  ];

  const handleExportCSV = () => {
    const headers = ['ID,Date,Type,Category,Amount (INR ₹),Description,Status,Invoice #'];
    const rows = transactions.map(t => `${t.id},${t.date},${t.type},${t.category},${t.amount},"${t.description}",${t.status},${t.invoice_number}`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FarmEase_Financial_Ledger_INR_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPnL = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Financial Management & Profit Loss Ledger (INR ₹)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            General ledger, income sources, operational expenses, profit margins, CSV exporter, and document vault.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
          </button>

          <button
            onClick={handlePrintPnL}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-teal-500" /> Print P&L Report
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Suite Cards in ₹ INR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Income */}
        <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Gross Revenue</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            <AnimatedCounter value={totalIncome} prefix="₹" decimals={0} />
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold">Milk, Cow & Compost Sales</p>
        </div>

        {/* KPI 2: Operating Expenses */}
        <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Operating Expenses</span>
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">
            <AnimatedCounter value={totalExpense} prefix="₹" decimals={0} />
          </div>
          <p className="text-[11px] text-rose-400 font-semibold">Feed, Salaries, Medicine & Power</p>
        </div>

        {/* KPI 3: Net Profit */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Net Profit</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            <AnimatedCounter value={netProfit} prefix="₹" decimals={0} />
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">Revenue Minus Operational Costs</p>
        </div>

        {/* KPI 4: Net Margin */}
        <div className="glass-card p-5 rounded-3xl border border-teal-500/30 bg-teal-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Net Profit Margin</span>
            <PieIcon className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400">
            {marginPercentage}%
          </div>
          <p className="text-[11px] text-teal-300 font-semibold">Healthy Operating Margin</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'ledger' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> General Transaction Ledger ({filteredTransactions.length})
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'charts' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieIcon className="w-4 h-4" /> P&L Profit Charts & Breakdown
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'vault' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Paperclip className="w-4 h-4" /> Bills & Document Vault (4 Files)
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'purchases' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase Report
        </button>
      </div>

      {/* Tab 1: General Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['all', 'income', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    typeFilter === type
                      ? 'bg-emerald-500 text-white shadow-glow'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono">Total Transactions: {filteredTransactions.length}</span>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Amount (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3.5 font-mono text-slate-400 font-bold">{tx.invoice_number || 'INV-881'}</td>
                    <td className="p-3.5 font-mono">{tx.date}</td>
                    <td className="p-3.5">
                      <Badge variant={tx.type === 'income' ? 'healthy' : 'sick'}>
                        {tx.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{tx.category}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{tx.description}</td>
                    <td className={`p-3.5 font-mono font-black text-right text-sm ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: P&L Profit Charts */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Income vs Expense Trends (INR ₹)</h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income (₹)" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expense (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Income Breakdown by Category (₹)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeCategoriesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {incomeCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expense Distribution by Category (₹)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseCategoriesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {expenseCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bills & Document Vault */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Alfalfa Fodder Invoice #BILL-8890', date: '2026-08-07', type: 'Receipt / Bill', size: '1.4 MB' },
            { title: 'Veterinary Vaccine Medical Report', date: '2026-08-03', type: 'Medical Report', size: '2.1 MB' },
            { title: 'Purebred Gir Cattle Ownership Cert.', date: '2023-05-10', type: 'Certificate', size: '850 KB' },
            { title: 'Farm Livestock Insurance Policy', date: '2026-01-15', type: 'Insurance', size: '3.8 MB' },
          ].map((doc, idx) => (
            <div key={idx} className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">{doc.title}</h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">{doc.type} • {doc.size}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500">{doc.date}</span>
                <span className="text-emerald-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Download className="w-3 h-3" /> View Document
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Purchase Report */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                Purchase Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All cattle · purchase prices · acquisition costs · seller details
              </p>
            </div>
            <button
              onClick={exportPurchaseCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Tag / Name</th>
                    <th className="p-3.5">Breed</th>
                    <th className="p-3.5">Purchase Type</th>
                    <th className="p-3.5">Purchase Date</th>
                    <th className="p-3.5">Purchase Price</th>
                    <th className="p-3.5">Total Acquisition</th>
                    <th className="p-3.5">Seller</th>
                    <th className="p-3.5">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {purchaseCattle.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic text-xs">
                        Loading purchase data…
                      </td>
                    </tr>
                  ) : purchaseCattle.map(c => {
                    const totalAcq = c.total_acquisition_cost ?? c.purchase_cost ?? 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="p-3.5">
                          <div className="font-mono text-[11px] font-bold text-emerald-500">{c.tag_number}</div>
                          <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                        </td>
                        <td className="p-3.5 text-slate-400">{c.breed}</td>
                        <td className="p-3.5">
                          {c.purchase_type
                            ? <Badge variant="healthy">{c.purchase_type}</Badge>
                            : <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{c.purchase_date || '—'}</td>
                        <td className="p-3.5 font-black text-emerald-500">
                          {c.purchase_cost ? `₹${c.purchase_cost.toLocaleString('en-IN')}` : <span className="badge-pill badge-amber text-[10px]">Missing</span>}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {totalAcq > 0 ? `₹${totalAcq.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-900 dark:text-white font-semibold">{c.seller_name || '—'}</div>
                          {c.seller_contact && <div className="text-[10px] text-slate-400">{c.seller_contact}</div>}
                        </td>
                        <td className="p-3.5 text-slate-400">{c.owner_name || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
