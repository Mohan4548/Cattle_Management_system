import { Request, Response } from 'express';
import { store, DEFAULT_COW_IMAGES, calculateAgeFromDOB } from '../services/store.js';
import { Cattle } from '../types/index.js';
import { digitalIdentityService } from '../services/digitalIdentityService.js';

export const getCattle = async (req: Request, res: Response) => {
  const { search, breed, health_status, lactation_stage, page = 1, limit = 10 } = req.query;
  let result = [...store.cattle];

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(c => 
      c.tag_number.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(q))
    );
  }

  if (breed && breed !== 'all') {
    result = result.filter(c => c.breed.toLowerCase() === String(breed).toLowerCase());
  }

  if (health_status && health_status !== 'all') {
    result = result.filter(c => c.health_status === health_status);
  }

  if (lactation_stage && lactation_stage !== 'all') {
    result = result.filter(c => c.lactation_stage === lactation_stage);
  }

  // Recalculate dynamic age
  result = result.map(c => ({
    ...c,
    age: calculateAgeFromDOB(c.date_of_birth),
  }));

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedItems = result.slice(startIndex, startIndex + limitNum);

  return res.json({
    data: paginatedItems,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems,
      itemsPerPage: limitNum,
    },
  });
};

export const getCattleById = async (req: Request, res: Response) => {
  const cattle = store.cattle.find(c => c.id === req.params.id || c.tag_number === req.params.id);
  if (!cattle) {
    return res.status(404).json({ message: 'Cattle record not found' });
  }

  const updatedCattle = {
    ...cattle,
    age: calculateAgeFromDOB(cattle.date_of_birth),
    milk_logs: store.milkLogs.filter(m => m.cattle_id === cattle.id),
    health_records: store.healthRecords.filter(h => h.cattle_id === cattle.id),
    vaccinations: store.vaccinations.filter(v => v.cattle_id === cattle.id),
    breeding_records: store.breedingRecords.filter(b => b.cattle_id === cattle.id),
  };

  return res.json(updatedCattle);
};

export const createCattle = async (req: Request, res: Response) => {
  const { 
    tag_number, 
    name, 
    breed, 
    gender, 
    date_of_birth, 
    weight_kg, 
    height_cm,
    color,
    horn_type,
    purchase_date,
    purchase_cost,
    health_status, 
    lactation_stage, 
    owner_name,
    owner_phone,
    image_url, 
    gallery,
    sire_tag, 
    dam_tag, 
    notes 
  } = req.body;

  if (!name || !breed || !date_of_birth) {
    return res.status(400).json({ message: 'Cattle name, breed, and date of birth are required' });
  }

  // Auto generate tag number if omitted
  const autoTag = tag_number || `FE-CAT-${new Date().getFullYear()}-${String(store.cattle.length + 1).padStart(3, '0')}`;

  const existing = store.cattle.find(c => c.tag_number.toLowerCase() === autoTag.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'A cattle with this Tag ID already exists' });
  }

  // Assign default cow photo if skip selected / omitted
  const assignedImage = image_url && image_url.trim() !== ''
    ? image_url
    : DEFAULT_COW_IMAGES[Math.floor(Math.random() * DEFAULT_COW_IMAGES.length)];

  const calculatedAge = calculateAgeFromDOB(date_of_birth);
  const qrData = `${autoTag}|${name}|${breed}|${calculatedAge}`;

  const newCattle: Cattle = {
    id: `cattle-${Date.now()}`,
    tag_number: autoTag,
    name,
    breed,
    gender: gender || 'female',
    date_of_birth,
    age: calculatedAge,
    weight_kg: Number(weight_kg) || 480,
    height_cm: height_cm ? Number(height_cm) : 135,
    color: color || 'Brown',
    horn_type: horn_type || 'Short',
    purchase_date: purchase_date || date_of_birth,
    purchase_cost: purchase_cost ? Number(purchase_cost) : 1200,
    health_status: health_status || 'healthy',
    lactation_stage: lactation_stage || 'mid',
    owner_name: owner_name || 'Green Valley Farm',
    owner_phone: owner_phone || '+91 98765 43210',
    image_url: assignedImage,
    gallery: gallery && gallery.length > 0 ? gallery : [assignedImage],
    qr_code_data: qrData,
    sire_tag,
    dam_tag,
    notes,
    created_at: new Date().toISOString(),
    timeline: [
      {
        id: `t-${Date.now()}`,
        title: 'Cattle Registered',
        date: new Date().toISOString().split('T')[0],
        category: 'birth',
        description: `Registered in FarmEase system with ID ${autoTag}.`,
      }
    ],
  };

  store.cattle.unshift(newCattle);

  // Phase 1: Auto-assign Digital Identity for every new cattle
  digitalIdentityService.ensureIdentityForCattle(newCattle);

  // Phase 2: Auto-generate QR Code immediately so status is 'active'
  digitalIdentityService.generateQR(newCattle.id, store.cattle);

  store.digitalIdentities = digitalIdentityService.getAllIdentities();

  return res.status(201).json(newCattle);
};

export const updateCattle = async (req: Request, res: Response) => {
  const index = store.cattle.findIndex(c => c.id === req.params.id || c.tag_number === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Cattle record not found' });
  }

  const updated = {
    ...store.cattle[index],
    ...req.body,
  };

  if (req.body.date_of_birth) {
    updated.age = calculateAgeFromDOB(req.body.date_of_birth);
  }

  store.cattle[index] = updated;
  return res.json(updated);
};

export const deleteCattle = async (req: Request, res: Response) => {
  const index = store.cattle.findIndex(c => c.id === req.params.id || c.tag_number === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Cattle record not found' });
  }

  store.cattle.splice(index, 1);
  return res.json({ message: 'Cattle record deleted successfully' });
};


// --- Purchase Documents --------------------------------------------------------

export const getPurchaseDocuments = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cattle = store.cattle.find((c: any) => c.id === id || c.tag_number === id);
  if (!cattle) return res.status(404).json({ message: 'Cattle record not found' });
  const docs = store.purchaseDocuments.filter((d: any) => d.cattle_id === cattle.id);
  return res.json(docs);
};

export const addPurchaseDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cattle = store.cattle.find((c: any) => c.id === id || c.tag_number === id);
  if (!cattle) return res.status(404).json({ message: 'Cattle record not found' });

  const { doc_name, doc_type, file_url, file_size } = req.body;
  if (!doc_name || !doc_type || !file_url) {
    return res.status(400).json({ message: 'doc_name, doc_type and file_url are required' });
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    cattle_id: cattle.id,
    doc_name,
    doc_type,
    file_url,
    file_size: file_size || 'Unknown',
    uploaded_by: (req as any).user?.full_name || 'Farm Manager',
    upload_date: new Date().toISOString().split('T')[0],
  };

  store.purchaseDocuments.push(newDoc);
  return res.status(201).json(newDoc);
};

export const deletePurchaseDocument = async (req: Request, res: Response) => {
  const { id, docId } = req.params;
  const idx = store.purchaseDocuments.findIndex((d: any) => d.id === docId && d.cattle_id === id);
  if (idx === -1) return res.status(404).json({ message: 'Document not found' });
  store.purchaseDocuments.splice(idx, 1);
  return res.json({ message: 'Document deleted' });
};

// --- Ownership History ---------------------------------------------------------

export const getOwnershipHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cattle = store.cattle.find((c: any) => c.id === id || c.tag_number === id);
  if (!cattle) return res.status(404).json({ message: 'Cattle record not found' });
  const history = store.ownershipHistory
    .filter((o: any) => o.cattle_id === cattle.id)
    .sort((a: any, b: any) => new Date(a.transfer_date).getTime() - new Date(b.transfer_date).getTime());
  return res.json(history);
};

export const addOwnershipRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cattle = store.cattle.find((c: any) => c.id === id || c.tag_number === id);
  if (!cattle) return res.status(404).json({ message: 'Cattle record not found' });

  const { owner_name, owner_contact, transfer_date, transfer_price, transfer_location, transfer_notes } = req.body;
  if (!owner_name || !transfer_date) {
    return res.status(400).json({ message: 'owner_name and transfer_date are required' });
  }

  // Mark previous current owner as not current
  store.ownershipHistory.forEach((o: any) => { if (o.cattle_id === cattle.id) o.is_current = false; });

  const newRecord = {
    id: `own-${Date.now()}`,
    cattle_id: cattle.id,
    owner_name,
    owner_contact: owner_contact || '',
    transfer_date,
    transfer_price: transfer_price ? Number(transfer_price) : undefined,
    transfer_location: transfer_location || '',
    transfer_notes: transfer_notes || '',
    is_current: true,
  };

  store.ownershipHistory.push(newRecord);
  return res.status(201).json(newRecord);
};

// --- Purchase Analytics --------------------------------------------------------

export const getPurchaseAnalytics = async (req: Request, res: Response) => {
  const cattle = store.cattle;
  const withCost = cattle.filter((c: any) => c.purchase_cost && c.purchase_cost > 0);

  const totalPurchaseInvestment = withCost.reduce((s: number, c: any) => s + (c.purchase_cost || 0), 0);
  const totalTransportation = cattle.reduce((s: number, c: any) => s + (c.transportation_cost || 0), 0);
  const totalMedical = cattle.reduce((s: number, c: any) => s + (c.initial_medical_cost || 0), 0);
  const totalOther = cattle.reduce((s: number, c: any) => s + (c.other_purchase_cost || 0), 0);
  const totalAcquisition = cattle.reduce((s: number, c: any) => s + (c.total_acquisition_cost || c.purchase_cost || 0), 0);
  const avgPurchasePrice = withCost.length ? totalPurchaseInvestment / withCost.length : 0;
  const highest = withCost.reduce((m: number, c: any) => Math.max(m, c.purchase_cost || 0), 0);
  const lowest = withCost.length ? withCost.reduce((m: number, c: any) => Math.min(m, c.purchase_cost || 0), Infinity) : 0;

  // Purchases by type
  const byType: Record<string, number> = {};
  cattle.forEach((c: any) => {
    const t = c.purchase_type || 'Purchased';
    byType[t] = (byType[t] || 0) + 1;
  });

  // Purchases by month (purchase_date)
  const byMonth: Record<string, { count: number; cost: number }> = {};
  cattle.forEach((c: any) => {
    if (c.purchase_date) {
      const month = c.purchase_date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { count: 0, cost: 0 };
      byMonth[month].count++;
      byMonth[month].cost += c.purchase_cost || 0;
    }
  });

  return res.json({
    totalCattlePurchased: cattle.length,
    withPurchaseInfo: withCost.length,
    totalPurchaseInvestment,
    avgPurchasePrice: Math.round(avgPurchasePrice),
    highestPurchasePrice: highest,
    lowestPurchasePrice: lowest === Infinity ? 0 : lowest,
    totalTransportationCost: totalTransportation,
    totalInitialMedicalCost: totalMedical,
    totalOtherCost: totalOther,
    totalAcquisitionCost: totalAcquisition,
    purchasesByType: byType,
    purchasesByMonth: byMonth,
  });
};