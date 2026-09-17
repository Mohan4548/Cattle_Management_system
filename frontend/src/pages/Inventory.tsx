import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { InventoryItem } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Boxes, Plus, AlertTriangle, PackageCheck, RefreshCw } from 'lucide-react';

const invSchema = z.object({
  item_name: z.string().min(2, 'Item name is required'),
  category: z.enum(['Fodder', 'Supplements', 'Medicines', 'Equipment']),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or more'),
  unit: z.string().min(1, 'Unit is required'),
  reorder_level: z.coerce.number().min(1),
  unit_cost: z.coerce.number().min(0),
  supplier: z.string().optional(),
});

type InvFormData = z.infer<typeof invSchema>;

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvFormData>({
    resolver: zodResolver(invSchema),
    defaultValues: {
      category: 'Fodder',
      unit: 'bales',
      quantity: 50,
      reorder_level: 20,
      unit_cost: 15,
    },
  });

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get('/inventory');
      setItems(res.data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateItem = async (data: InvFormData) => {
    try {
      const res = await apiClient.post('/inventory', data);
      setItems(prev => [res.data, ...prev]);
      setIsModalOpen(false);
      reset();
    } catch {
      alert('Failed to add inventory item.');
    }
  };

  const handleUpdateQuantity = async (id: string, currentQty: number) => {
    const newQtyStr = prompt('Enter new stock quantity:', String(currentQty));
    if (newQtyStr === null) return;
    const newQty = Number(newQtyStr);
    if (isNaN(newQty)) return;

    try {
      const res = await apiClient.patch(`/inventory/${id}/quantity`, { quantity: newQty });
      setItems(prev => prev.map(i => i.id === id ? res.data : i));
    } catch {
      alert('Failed to update stock quantity.');
    }
  };

  const filteredItems = items.filter(i => selectedCategory === 'all' || i.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            Feed & Inventory Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor fodder, supplements, medical supplies, reorder thresholds, and farm stock.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Inventory Item
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Fodder', 'Supplements', 'Medicines', 'Equipment'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
              selectedCategory === cat
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Item Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">In Stock</th>
              <th className="p-3.5">Reorder Level</th>
              <th className="p-3.5">Unit Price</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredItems.map((item) => {
              const isLow = item.quantity <= item.reorder_level;
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {item.item_name}
                    {item.supplier && <span className="block text-[10px] text-slate-400 font-normal">{item.supplier}</span>}
                  </td>
                  <td className="p-3.5 font-semibold text-amber-500">{item.category}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-3.5 text-slate-400">{item.reorder_level} {item.unit}</td>
                  <td className="p-3.5">${item.unit_cost} / {item.unit}</td>
                  <td className="p-3.5">
                    <Badge variant={isLow ? 'sick' : 'healthy'}>
                      {isLow ? 'Low Stock' : 'Sufficient'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Inventory Item"
      >
        <form onSubmit={handleSubmit(handleCreateItem)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Item Name</label>
            <input
              {...register('item_name')}
              type="text"
              placeholder="Alfalfa Hay Bales"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            />
            {errors.item_name && <p className="text-[11px] text-rose-400 mt-0.5">{errors.item_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <option value="Fodder">Fodder</option>
                <option value="Supplements">Supplements</option>
                <option value="Medicines">Medicines</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Unit of Measurement</label>
              <input
                {...register('unit')}
                type="text"
                placeholder="kg, bales, bags, liters"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Initial Quantity</label>
              <input
                {...register('quantity')}
                type="number"
                placeholder="100"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Reorder Level</label>
              <input
                {...register('reorder_level')}
                type="number"
                placeholder="20"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Unit Cost ($)</label>
              <input
                {...register('unit_cost')}
                type="number"
                placeholder="12.50"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Supplier Name (Optional)</label>
            <input
              {...register('supplier')}
              type="text"
              placeholder="Green Pastures Ag"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-glow">Save Inventory Item</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
