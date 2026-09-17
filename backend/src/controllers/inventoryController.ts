import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { InventoryItem } from '../types/index.js';

export const getInventory = async (req: Request, res: Response) => {
  const { category, low_stock } = req.query;
  let result = [...store.inventory];

  if (category) {
    result = result.filter(i => i.category.toLowerCase() === String(category).toLowerCase());
  }

  if (low_stock === 'true') {
    result = result.filter(i => i.quantity <= i.reorder_level);
  }

  return res.json(result);
};

export const createInventoryItem = async (req: Request, res: Response) => {
  const { item_name, category, quantity, unit, reorder_level, unit_cost, supplier } = req.body;

  if (!item_name || !category || quantity === undefined || !unit) {
    return res.status(400).json({ message: 'Item name, category, quantity, and unit are required' });
  }

  const newItem: InventoryItem = {
    id: `inv-${Date.now()}`,
    item_name,
    category,
    quantity: Number(quantity),
    unit,
    reorder_level: Number(reorder_level) || 10,
    unit_cost: Number(unit_cost) || 0,
    supplier,
    last_restocked: new Date().toISOString().split('T')[0],
  };

  store.inventory.unshift(newItem);
  return res.status(201).json(newItem);
};

export const updateInventoryQuantity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = store.inventory.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ message: 'Inventory item not found' });
  }

  item.quantity = Number(quantity);
  item.last_restocked = new Date().toISOString().split('T')[0];
  return res.json(item);
};
